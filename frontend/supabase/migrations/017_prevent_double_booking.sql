-- ============================================
-- PREVENT DOUBLE BOOKING - DATABASE CONSTRAINTS
-- ============================================
-- Adds database-level checks to prevent double booking
-- for both coaches and job seekers

-- Function to check for overlapping sessions
CREATE OR REPLACE FUNCTION check_session_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if coach has overlapping session
  IF EXISTS (
    SELECT 1 FROM public.sessions
    WHERE coach_id = NEW.coach_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status IN ('scheduled', 'confirmed')
      AND (
        -- New session starts during existing session
        (NEW.start_time >= start_time AND NEW.start_time < end_time)
        OR
        -- New session ends during existing session
        (NEW.end_time > start_time AND NEW.end_time <= end_time)
        OR
        -- New session completely overlaps existing session
        (NEW.start_time <= start_time AND NEW.end_time >= end_time)
      )
  ) THEN
    RAISE EXCEPTION 'Coach already has a session booked during this time'
      USING HINT = 'Please choose a different time slot';
  END IF;

  -- Check if seeker has overlapping session
  IF EXISTS (
    SELECT 1 FROM public.sessions
    WHERE seeker_id = NEW.seeker_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status IN ('scheduled', 'confirmed')
      AND (
        -- New session starts during existing session
        (NEW.start_time >= start_time AND NEW.start_time < end_time)
        OR
        -- New session ends during existing session
        (NEW.end_time > start_time AND NEW.end_time <= end_time)
        OR
        -- New session completely overlaps existing session
        (NEW.start_time <= start_time AND NEW.end_time >= end_time)
      )
  ) THEN
    RAISE EXCEPTION 'You already have a session booked during this time'
      USING HINT = 'Please choose a different time slot';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on sessions table
DROP TRIGGER IF EXISTS prevent_double_booking ON public.sessions;
CREATE TRIGGER prevent_double_booking
  BEFORE INSERT OR UPDATE ON public.sessions
  FOR EACH ROW
  WHEN (NEW.status IN ('scheduled', 'confirmed'))
  EXECUTE FUNCTION check_session_overlap();

-- Similar check for bookings table
CREATE OR REPLACE FUNCTION check_booking_overlap()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if coach has overlapping booking
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE coach_id = NEW.coach_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status IN ('confirmed', 'rescheduled')
      AND (
        (NEW.start_time >= start_time AND NEW.start_time < end_time)
        OR
        (NEW.end_time > start_time AND NEW.end_time <= end_time)
        OR
        (NEW.start_time <= start_time AND NEW.end_time >= end_time)
      )
  ) THEN
    RAISE EXCEPTION 'This time slot is already booked'
      USING HINT = 'Please choose a different time slot';
  END IF;

  -- Check if seeker has overlapping booking
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE seeker_id = NEW.seeker_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status IN ('confirmed', 'rescheduled')
      AND (
        (NEW.start_time >= start_time AND NEW.start_time < end_time)
        OR
        (NEW.end_time > start_time AND NEW.end_time <= end_time)
        OR
        (NEW.start_time <= start_time AND NEW.end_time >= end_time)
      )
  ) THEN
    RAISE EXCEPTION 'You already have a booking at this time'
      USING HINT = 'Please choose a different time slot';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on bookings table
DROP TRIGGER IF EXISTS prevent_double_booking ON public.bookings;
CREATE TRIGGER prevent_double_booking
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (NEW.status IN ('confirmed', 'rescheduled'))
  EXECUTE FUNCTION check_booking_overlap();

-- Add comment explaining the protection
COMMENT ON FUNCTION check_session_overlap() IS 'Prevents double booking by checking for overlapping sessions for both coaches and seekers';
COMMENT ON FUNCTION check_booking_overlap() IS 'Prevents double booking by checking for overlapping bookings for both coaches and seekers';

