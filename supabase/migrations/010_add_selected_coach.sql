-- ============================================
-- ADD SELECTED COACH TO USER PROFILES
-- ============================================

-- Add selected_coach_id to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS selected_coach_id UUID REFERENCES public.coaches(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_selected_coach 
ON public.user_profiles(selected_coach_id);

-- Add comment
COMMENT ON COLUMN public.user_profiles.selected_coach_id IS 'The coach selected by the job seeker during wizard step 3';

-- Update current users to null (they need to select)
UPDATE public.user_profiles
SET selected_coach_id = NULL
WHERE selected_coach_id IS NULL;

