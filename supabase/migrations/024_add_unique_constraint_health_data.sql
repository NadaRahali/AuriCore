-- Add UNIQUE constraint on user_id to prevent duplicate health_data entries
-- This migration ensures one health_data record per user

-- First, remove any duplicate entries (keep the most recent one)
DELETE FROM public.health_data
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.health_data
  ORDER BY user_id, synced_at DESC
);

-- Add UNIQUE constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'health_data_user_id_key'
  ) THEN
    ALTER TABLE public.health_data
    ADD CONSTRAINT health_data_user_id_key UNIQUE (user_id);
  END IF;
END $$;

COMMENT ON CONSTRAINT health_data_user_id_key ON public.health_data IS 
  'Ensures one health_data record per user, preventing duplicates when re-authorizing access.';

