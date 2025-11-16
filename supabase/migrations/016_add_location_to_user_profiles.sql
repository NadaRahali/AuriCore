-- ============================================
-- ADD LOCATION TO USER PROFILES
-- ============================================
-- Adds a preferred_location field to user_profiles table
-- to store the user's preferred coaching location

ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS preferred_location TEXT;

-- Create index for faster location lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferred_location
ON public.user_profiles(preferred_location);

-- Add comment
COMMENT ON COLUMN public.user_profiles.preferred_location IS 'User preferred location for coaching sessions. Can be a specific region or "Remote" for online-only sessions';

