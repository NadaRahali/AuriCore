-- ============================================
-- FIX MESSAGE READ/UPDATE RLS POLICIES
-- ============================================

-- The issue: Messages can't be marked as read because UPDATE policy is too restrictive
-- Current policy only allows updating if sender_id = auth.uid()
-- But we need to allow marking OTHER people's messages as read

-- Drop the restrictive update policy
DROP POLICY IF EXISTS "update_own_messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

-- Create a new policy that allows:
-- 1. Users can update their OWN messages (edit content)
-- 2. Users can mark OTHER people's messages as read (update read_at only)
CREATE POLICY "users_can_update_messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  -- Can update if it's your own message
  sender_id = auth.uid()
  OR
  -- OR can update read_at if the message is in your chat room
  (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE chat_rooms.id = messages.room_id
      AND chat_rooms.seeker_id = auth.uid()
    )
  )
)
WITH CHECK (
  -- Can update if it's your own message
  sender_id = auth.uid()
  OR
  -- OR can update read_at if the message is in your chat room
  (
    EXISTS (
      SELECT 1 FROM public.chat_rooms
      WHERE chat_rooms.id = messages.room_id
      AND chat_rooms.seeker_id = auth.uid()
    )
  )
);

-- Verify RLS is enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Test: Try to mark a message as read
-- This should now work without errors

