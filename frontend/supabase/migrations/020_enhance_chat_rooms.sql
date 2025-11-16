-- ============================================
-- ENHANCE CHAT ROOMS FOR CHAT LIST FEATURES
-- ============================================

-- Add columns to track last message details
ALTER TABLE public.chat_rooms
ADD COLUMN IF NOT EXISTS last_message_text TEXT,
ADD COLUMN IF NOT EXISTS last_message_sender_id UUID,
ADD COLUMN IF NOT EXISTS last_message_sender_type VARCHAR(10),
ADD COLUMN IF NOT EXISTS last_message_read BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message 
ON public.chat_rooms(last_message_at DESC);

-- Create a function to update chat room when a new message is sent
CREATE OR REPLACE FUNCTION update_chat_room_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the chat room's last message info
  UPDATE public.chat_rooms
  SET 
    last_message_at = NEW.created_at,
    last_message_text = NEW.content,
    last_message_sender_id = NEW.sender_id,
    last_message_sender_type = NEW.sender_type,
    last_message_read = (NEW.read_at IS NOT NULL), -- Mark as read if read_at is set
    updated_at = NOW()
  WHERE id = NEW.room_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update chat room on INSERT
DROP TRIGGER IF EXISTS trigger_update_chat_room_on_message ON public.messages;
CREATE TRIGGER trigger_update_chat_room_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_on_message();

-- Create a function to update read status when message is marked as read
CREATE OR REPLACE FUNCTION update_chat_room_read_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if this is the last message and it's being marked as read
  IF NEW.read_at IS NOT NULL AND OLD.read_at IS NULL THEN
    UPDATE public.chat_rooms
    SET 
      last_message_read = true,
      updated_at = NOW()
    WHERE id = NEW.room_id
    AND last_message_sender_id = NEW.sender_id
    AND last_message_at = NEW.created_at;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-update read status on UPDATE
DROP TRIGGER IF EXISTS trigger_update_chat_room_read_status ON public.messages;
CREATE TRIGGER trigger_update_chat_room_read_status
  AFTER UPDATE ON public.messages
  FOR EACH ROW
  WHEN (NEW.read_at IS DISTINCT FROM OLD.read_at)
  EXECUTE FUNCTION update_chat_room_read_status();

-- Update existing chat rooms with last message info
UPDATE public.chat_rooms cr
SET 
  last_message_text = m.content,
  last_message_sender_id = m.sender_id,
  last_message_sender_type = m.sender_type,
  last_message_at = m.created_at
FROM (
  SELECT DISTINCT ON (room_id)
    room_id,
    content,
    sender_id,
    sender_type,
    created_at
  FROM public.messages
  ORDER BY room_id, created_at DESC
) m
WHERE cr.id = m.room_id;

-- Grant permissions
GRANT SELECT ON public.chat_rooms TO authenticated;

