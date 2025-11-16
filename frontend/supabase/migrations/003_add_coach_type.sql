-- Add type column to coaches table
ALTER TABLE public.coaches 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) NOT NULL DEFAULT 'jobseeker_advisor';

-- Add check constraint for valid types
ALTER TABLE public.coaches
ADD CONSTRAINT coach_type_check 
CHECK (type IN ('jobseeker_advisor', 'skill_developer', 'entrepreneurship_advisor'));

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_coaches_type ON public.coaches(type);

-- Update existing coaches to have jobseeker_advisor type
UPDATE public.coaches
SET type = 'jobseeker_advisor'
WHERE type IS NULL OR type = 'jobseeker_advisor';

-- Add comment
COMMENT ON COLUMN public.coaches.type IS 'Type of coach: jobseeker_advisor, skill_developer, or entrepreneurship_advisor';

