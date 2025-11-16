-- ============================================
-- FIX: Allow system messages to be created
-- ============================================
-- This fixes the RLS policy error when creating welcome messages

-- Drop policy if it exists (no error if doesn't exist)
DROP POLICY IF EXISTS "System can create messages" ON public.messages;

-- Add policy to allow system/coach messages to be inserted
CREATE POLICY "System can create messages"
  ON public.messages FOR INSERT
  WITH CHECK (sender_type = 'system' OR sender_type = 'coach');

-- Comment
COMMENT ON POLICY "System can create messages" ON public.messages IS 'Allows system and coach messages to bypass seeker authentication for automated messages like welcome messages';

