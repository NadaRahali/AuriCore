-- ============================================
-- MESSAGING SYSTEM - REAL-TIME CHAT
-- ============================================
-- Creates tables for one-on-one chat between coaches and job seekers

-- ============================================
-- CHAT ROOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  seeker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Last message info for quick display
  last_message_text TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_sender_id UUID,
  
  -- Unread counts
  coach_unread_count INTEGER DEFAULT 0,
  seeker_unread_count INTEGER DEFAULT 0,
  
  -- Room status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure one room per coach-seeker pair
  UNIQUE(coach_id, seeker_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_rooms_coach ON public.chat_rooms(coach_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_seeker ON public.chat_rooms(seeker_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message ON public.chat_rooms(last_message_at DESC);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL, -- Can be either auth.users.id OR coaches.id
  sender_type VARCHAR(10) DEFAULT 'seeker' CHECK (sender_type IN ('seeker', 'coach', 'system')),
  
  -- Message content
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  
  -- File attachments (if any)
  attachment_url TEXT,
  attachment_type VARCHAR(50), -- 'image/jpeg', 'application/pdf', etc.
  attachment_name TEXT,
  attachment_size INTEGER, -- in bytes
  
  -- Read status
  read_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Reply/thread support
  reply_to_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  
  -- Soft delete
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for fast message retrieval
CREATE INDEX IF NOT EXISTS idx_messages_room ON public.messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(room_id, read_at) WHERE read_at IS NULL;

-- ============================================
-- TYPING INDICATORS TABLE (for real-time typing status)
-- ============================================
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL, -- Can be either auth.users.id OR coaches.id
  user_type VARCHAR(10) DEFAULT 'seeker' CHECK (user_type IN ('seeker', 'coach')),
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(room_id, user_id)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_typing_indicators_room ON public.typing_indicators(room_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update chat room's last message
CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last message info in chat room
  UPDATE public.chat_rooms
  SET 
    last_message_text = NEW.content,
    last_message_at = NEW.created_at,
    last_message_sender_id = NEW.sender_id,
    updated_at = NOW()
  WHERE id = NEW.room_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on new message
DROP TRIGGER IF EXISTS update_last_message ON public.messages;
CREATE TRIGGER update_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  WHEN (NEW.is_deleted = false AND NEW.message_type != 'system')
  EXECUTE FUNCTION update_chat_room_last_message();

-- Function to increment unread count
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment unread count for the recipient based on sender type
  IF NEW.sender_type = 'coach' THEN
    -- Coach sent message, increment seeker's unread count
    UPDATE public.chat_rooms
    SET seeker_unread_count = seeker_unread_count + 1
    WHERE id = NEW.room_id;
  ELSIF NEW.sender_type = 'seeker' THEN
    -- Seeker sent message, increment coach's unread count
    UPDATE public.chat_rooms
    SET coach_unread_count = coach_unread_count + 1
    WHERE id = NEW.room_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on new message
DROP TRIGGER IF EXISTS increment_unread ON public.messages;
CREATE TRIGGER increment_unread
  AFTER INSERT ON public.messages
  FOR EACH ROW
  WHEN (NEW.is_deleted = false AND NEW.message_type != 'system')
  EXECUTE FUNCTION increment_unread_count();

-- Function to mark messages as read and reset unread count
CREATE OR REPLACE FUNCTION mark_messages_read(
  p_room_id UUID,
  p_user_id UUID,
  p_user_type VARCHAR(10) DEFAULT 'seeker'
)
RETURNS void AS $$
BEGIN
  -- Mark all unread messages as read (from the other party)
  UPDATE public.messages
  SET read_at = NOW()
  WHERE room_id = p_room_id
    AND sender_id != p_user_id
    AND read_at IS NULL;
  
  -- Reset unread count based on user type
  IF p_user_type = 'coach' THEN
    UPDATE public.chat_rooms
    SET coach_unread_count = 0
    WHERE id = p_room_id;
  ELSE
    UPDATE public.chat_rooms
    SET seeker_unread_count = 0
    WHERE id = p_room_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Chat Rooms Policies
CREATE POLICY "Seekers can view their own chat rooms"
  ON public.chat_rooms FOR SELECT
  USING (auth.uid() = seeker_id);

CREATE POLICY "Seekers can create chat rooms"
  ON public.chat_rooms FOR INSERT
  WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "Seekers can update their chat rooms"
  ON public.chat_rooms FOR UPDATE
  USING (auth.uid() = seeker_id);

-- Messages Policies
CREATE POLICY "Seekers can view messages in their rooms"
  ON public.messages FOR SELECT
  USING (
    room_id IN (
      SELECT id FROM public.chat_rooms
      WHERE seeker_id = auth.uid()
    )
  );

CREATE POLICY "Seekers can send messages in their rooms"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND
    room_id IN (
      SELECT id FROM public.chat_rooms
      WHERE seeker_id = auth.uid()
    )
  );

CREATE POLICY "System can create messages"
  ON public.messages FOR INSERT
  WITH CHECK (sender_type = 'system' OR sender_type = 'coach');

CREATE POLICY "Users can update their own messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON public.messages FOR DELETE
  USING (sender_id = auth.uid());

-- Typing Indicators Policies
CREATE POLICY "Seekers can view typing indicators in their rooms"
  ON public.typing_indicators FOR SELECT
  USING (
    room_id IN (
      SELECT id FROM public.chat_rooms
      WHERE seeker_id = auth.uid()
    )
  );

CREATE POLICY "Seekers can insert their typing status"
  ON public.typing_indicators FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Seekers can update their typing status"
  ON public.typing_indicators FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get or create chat room
CREATE OR REPLACE FUNCTION get_or_create_chat_room(
  p_coach_id UUID,
  p_seeker_id UUID
)
RETURNS UUID AS $$
DECLARE
  room_id UUID;
BEGIN
  -- Try to get existing room
  SELECT id INTO room_id
  FROM public.chat_rooms
  WHERE coach_id = p_coach_id AND seeker_id = p_seeker_id;
  
  -- Create if doesn't exist
  IF room_id IS NULL THEN
    INSERT INTO public.chat_rooms (coach_id, seeker_id)
    VALUES (p_coach_id, p_seeker_id)
    RETURNING id INTO room_id;
  END IF;
  
  RETURN room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INITIAL DATA / WELCOME MESSAGES
-- ============================================

-- Function to create welcome message when room is created
CREATE OR REPLACE FUNCTION send_welcome_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a system welcome message
  INSERT INTO public.messages (room_id, sender_id, sender_type, content, message_type)
  VALUES (
    NEW.id,
    NEW.coach_id,
    'coach',
    'Welcome! Feel free to reach out with any questions before our session. Looking forward to working with you! 🌟',
    'system'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on new chat room
DROP TRIGGER IF EXISTS send_welcome_on_new_room ON public.chat_rooms;
CREATE TRIGGER send_welcome_on_new_room
  AFTER INSERT ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_message();

-- Add comments
COMMENT ON TABLE public.chat_rooms IS 'One-on-one chat rooms between coaches and job seekers';
COMMENT ON TABLE public.messages IS 'Messages sent in chat rooms';
COMMENT ON TABLE public.typing_indicators IS 'Real-time typing status indicators';
COMMENT ON FUNCTION get_or_create_chat_room IS 'Gets existing chat room or creates new one for coach-seeker pair';

