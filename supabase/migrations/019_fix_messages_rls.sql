-- ============================================
-- FIX MESSAGES TABLE RLS POLICIES
-- ============================================

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their chat rooms" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

-- Create more permissive policies for messages

-- Allow users to insert messages if they are a member of the chat room
CREATE POLICY "Users can insert messages in their chat rooms"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE chat_rooms.id = messages.room_id
    AND (chat_rooms.seeker_id = auth.uid() OR chat_rooms.coach_id IN (
      SELECT id FROM public.coaches WHERE id = chat_rooms.coach_id
    ))
  )
);

-- Allow users to view messages in chat rooms they belong to
CREATE POLICY "Users can view messages in their chat rooms"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE chat_rooms.id = messages.room_id
    AND (chat_rooms.seeker_id = auth.uid() OR chat_rooms.coach_id IN (
      SELECT id FROM public.coaches WHERE id = chat_rooms.coach_id
    ))
  )
);

-- Allow users to update their own messages
CREATE POLICY "Users can update their own messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- Allow users to delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.messages
FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

