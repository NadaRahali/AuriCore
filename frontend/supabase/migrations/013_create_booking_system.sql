-- ============================================
-- COACH BOOKING & AVAILABILITY SYSTEM
-- ============================================

-- Create coach availability table (recurring schedules)
CREATE TABLE IF NOT EXISTS public.coach_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  
  -- Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  -- Time slots (24-hour format)
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Meeting types allowed for this slot
  meeting_types TEXT[] DEFAULT ARRAY['online', 'office', 'call'],
  
  -- Is this availability active?
  is_active BOOLEAN DEFAULT true,
  
  -- Optional: Location for office meetings
  office_location TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_meeting_types CHECK (meeting_types <@ ARRAY['online', 'office', 'call']::TEXT[])
);

-- Create specific date overrides (for vacations, special hours, etc.)
CREATE TABLE IF NOT EXISTS public.coach_availability_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  
  -- Specific date
  date DATE NOT NULL,
  
  -- Is coach available on this date?
  is_available BOOLEAN DEFAULT false,
  
  -- If available, custom time slots for this specific date
  start_time TIME,
  end_time TIME,
  
  -- Meeting types allowed
  meeting_types TEXT[],
  
  -- Reason for override (vacation, sick, etc.)
  reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(coach_id, date)
);

-- Update sessions table to include meeting type and status details
ALTER TABLE public.sessions
ADD COLUMN IF NOT EXISTS meeting_type VARCHAR(20) DEFAULT 'online' CHECK (meeting_type IN ('online', 'office', 'call')),
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS meeting_location TEXT,
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(20) CHECK (cancelled_by IN ('coach', 'seeker', 'system')),
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Drop the old session_date column constraint and make it nullable since we now use start_time/end_time
ALTER TABLE public.sessions 
ALTER COLUMN session_date DROP NOT NULL;

-- Update existing sessions to have meeting_link for online meetings
UPDATE public.sessions
SET meeting_link = 'https://meet.google.com/placeholder-link'
WHERE meeting_type = 'online' AND meeting_link IS NULL;

-- Note: We're NOT adding the strict constraint for now to avoid issues with existing data
-- Instead, we'll validate meeting_link in the application layer when creating new bookings
-- REMOVED: meeting_link_required_for_online constraint

-- Create bookings table for managing time slot reservations
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  seeker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Time slot
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Meeting details
  meeting_type VARCHAR(20) NOT NULL CHECK (meeting_type IN ('online', 'office', 'call')),
  
  -- Booking status
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'rescheduled', 'completed')),
  
  -- Reminders
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coach_availability_coach_id ON public.coach_availability(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_availability_day ON public.coach_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_coach_availability_active ON public.coach_availability(is_active);
CREATE INDEX IF NOT EXISTS idx_availability_overrides_coach_date ON public.coach_availability_overrides(coach_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_coach_id ON public.bookings(coach_id);
CREATE INDEX IF NOT EXISTS idx_bookings_seeker_id ON public.bookings(seeker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Enable RLS
ALTER TABLE public.coach_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_availability_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_availability
CREATE POLICY "Anyone can view coach availability" ON public.coach_availability
  FOR SELECT USING (is_active = true);

CREATE POLICY "Coaches can manage their availability" ON public.coach_availability
  FOR ALL USING (coach_id IN (SELECT id FROM coaches WHERE email = auth.jwt()->>'email'));

-- RLS Policies for availability overrides
CREATE POLICY "Anyone can view active overrides" ON public.coach_availability_overrides
  FOR SELECT USING (true);

CREATE POLICY "Coaches can manage their overrides" ON public.coach_availability_overrides
  FOR ALL USING (coach_id IN (SELECT id FROM coaches WHERE email = auth.jwt()->>'email'));

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (seeker_id = auth.uid());

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (seeker_id = auth.uid());

CREATE POLICY "Users can update their bookings" ON public.bookings
  FOR UPDATE USING (seeker_id = auth.uid());

-- Function to check if a time slot is available
CREATE OR REPLACE FUNCTION is_time_slot_available(
  p_coach_id UUID,
  p_start_time TIMESTAMP WITH TIME ZONE,
  p_end_time TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN AS $$
DECLARE
  v_day_of_week INTEGER;
  v_time_start TIME;
  v_time_end TIME;
  v_date DATE;
  v_has_availability BOOLEAN;
  v_has_override BOOLEAN;
  v_override_available BOOLEAN;
  v_has_booking BOOLEAN;
BEGIN
  -- Extract day of week (0-6)
  v_day_of_week := EXTRACT(DOW FROM p_start_time);
  v_time_start := p_start_time::TIME;
  v_time_end := p_end_time::TIME;
  v_date := p_start_time::DATE;
  
  -- Check if coach has recurring availability for this day/time
  SELECT EXISTS (
    SELECT 1 FROM coach_availability
    WHERE coach_id = p_coach_id
    AND day_of_week = v_day_of_week
    AND start_time <= v_time_start
    AND end_time >= v_time_end
    AND is_active = true
  ) INTO v_has_availability;
  
  -- Check for date-specific overrides
  SELECT EXISTS (
    SELECT 1 FROM coach_availability_overrides
    WHERE coach_id = p_coach_id
    AND date = v_date
  ) INTO v_has_override;
  
  IF v_has_override THEN
    -- Override exists, check if available
    SELECT is_available INTO v_override_available
    FROM coach_availability_overrides
    WHERE coach_id = p_coach_id AND date = v_date;
    
    IF NOT v_override_available THEN
      RETURN false;
    END IF;
  END IF;
  
  -- If no recurring availability and no override, slot is not available
  IF NOT v_has_availability AND NOT v_has_override THEN
    RETURN false;
  END IF;
  
  -- Check if slot is already booked
  SELECT EXISTS (
    SELECT 1 FROM bookings
    WHERE coach_id = p_coach_id
    AND status IN ('confirmed', 'rescheduled')
    AND (
      (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
    )
  ) INTO v_has_booking;
  
  -- Slot is available if not already booked
  RETURN NOT v_has_booking;
END;
$$ LANGUAGE plpgsql;

-- Function to generate available time slots for a coach on a specific date
CREATE OR REPLACE FUNCTION get_available_time_slots(
  p_coach_id UUID,
  p_date DATE,
  p_slot_duration INTEGER DEFAULT 60 -- minutes
)
RETURNS TABLE (
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  meeting_types TEXT[]
) AS $$
DECLARE
  v_day_of_week INTEGER;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date);
  
  -- Return available slots based on coach's availability
  -- This is a simplified version - you may want to customize based on your needs
  RETURN QUERY
  SELECT 
    (p_date + ca.start_time)::TIMESTAMP WITH TIME ZONE as slot_start,
    (p_date + ca.start_time + (p_slot_duration || ' minutes')::INTERVAL)::TIMESTAMP WITH TIME ZONE as slot_end,
    ca.meeting_types
  FROM coach_availability ca
  WHERE ca.coach_id = p_coach_id
  AND ca.day_of_week = v_day_of_week
  AND ca.is_active = true
  -- Add more conditions for checking overrides and existing bookings
  ORDER BY ca.start_time;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE public.coach_availability IS 'Recurring weekly availability schedule for coaches';
COMMENT ON TABLE public.coach_availability_overrides IS 'Date-specific availability overrides (vacations, special hours)';
COMMENT ON TABLE public.bookings IS 'Confirmed booking time slots for coaching sessions';
COMMENT ON COLUMN public.sessions.meeting_type IS 'Type of meeting: online (video call), office (in-person), call (phone)';
COMMENT ON COLUMN public.sessions.meeting_link IS 'Video call link for online meetings (Zoom, Google Meet, etc.)';

