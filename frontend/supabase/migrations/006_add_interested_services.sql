-- Add interested_services field to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS interested_services TEXT[] DEFAULT '{}';

-- Add check constraint for valid service types
ALTER TABLE public.user_profiles
ADD CONSTRAINT interested_services_check 
CHECK (
  interested_services <@ ARRAY[
    'entrepreneurship_advisor',
    'jobseeker_advisor', 
    'skill_developer'
  ]::TEXT[]
);

-- Create index for filtering users by interested services
CREATE INDEX IF NOT EXISTS idx_user_profiles_interested_services 
ON public.user_profiles USING GIN (interested_services);

-- Add comment
COMMENT ON COLUMN public.user_profiles.interested_services IS 'Array of service types user is interested in: entrepreneurship_advisor, jobseeker_advisor, skill_developer';

