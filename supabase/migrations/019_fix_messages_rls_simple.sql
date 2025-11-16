-- ============================================
-- SIMPLIFY MESSAGES RLS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Seekers can send messages in their rooms" ON public.messages;
DROP POLICY IF EXISTS "System can create messages" ON public.messages;

-- Create a single, simple insert policy
-- Allow authenticated users to insert messages in their chat rooms
CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  -- Check that the sender_id matches the authenticated user
  sender_id = auth.uid()
  AND
  -- Check that the room exists and user is a member
  EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE chat_rooms.id = messages.room_id
    AND chat_rooms.seeker_id = auth.uid()
  )
);

-- Also allow system messages (for welcome messages)
CREATE POLICY "Allow system messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_type = 'system'
  AND
  EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE chat_rooms.id = messages.room_id
    AND chat_rooms.seeker_id = auth.uid()
  )
);

