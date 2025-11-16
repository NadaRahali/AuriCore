-- ============================================
-- MIGRAINE PROFILE TABLE
-- ============================================
-- Stores user onboarding responses for migraine prediction AI model
-- Structured to be easily queryable and transformable into ML features

CREATE TABLE IF NOT EXISTS public.migraine_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- ============================================
  -- Personal Demographics (for baseline features)
  -- ============================================
  age INTEGER,
  gender VARCHAR(50), -- Female, Male, Non-binary, etc.
  country VARCHAR(100),
  
  -- ============================================
  -- Sleep Patterns (key migraine trigger)
  -- ============================================
  sleep_hours VARCHAR(20), -- Less than 5, 5–7, 7–9, More than 9
  sleep_regularity VARCHAR(50), -- Very regular, Somewhat regular, Very irregular
  
  -- ============================================
  -- Lifestyle Factors
  -- ============================================
  hydration VARCHAR(20), -- Less than 1L, 1–2L, 2–3L, More than 3L
  meal_pattern VARCHAR(20), -- Never, Sometimes, Often, Daily (skip meals)
  stress_frequency VARCHAR(20), -- Rarely, Sometimes, Often, Daily
  exercise_frequency VARCHAR(50), -- Rarely, 1–2 times a week, 3–5 times a week, Daily
  caffeine_intake VARCHAR(10), -- 0, 1–2, 3–4, 5+
  
  -- ============================================
  -- Environmental Triggers
  -- ============================================
  screen_trigger VARCHAR(20), -- Yes, No, Sometimes
  weather_trigger VARCHAR(20), -- Yes, No, Sometimes
  -- Note: weather_trigger text varies by country but value is standardized
  
  -- ============================================
  -- Hormonal/Medical Factors (conditional)
  -- ============================================
  cycle_trigger VARCHAR(20), -- Yes, No, Not sure (for Female)
  hormone_therapy VARCHAR(20), -- Yes, No, Prefer not to say (for Transgender)
  
  -- ============================================
  -- Medications
  -- ============================================
  medications_taken BOOLEAN, -- Yes/No from medications question
  
  -- ============================================
  -- Metadata & Tracking
  -- ============================================
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Raw JSON backup (for flexibility and future additions)
  raw_responses JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- INDEXES for ML Feature Extraction & Queries
-- ============================================

-- Index on user_id (already unique, but explicit for clarity)
CREATE UNIQUE INDEX IF NOT EXISTS idx_migraine_profiles_user_id 
  ON public.migraine_profiles(user_id);

-- Indexes for common filter/group queries
CREATE INDEX IF NOT EXISTS idx_migraine_profiles_gender 
  ON public.migraine_profiles(gender);

CREATE INDEX IF NOT EXISTS idx_migraine_profiles_country 
  ON public.migraine_profiles(country);

CREATE INDEX IF NOT EXISTS idx_migraine_profiles_completed 
  ON public.migraine_profiles(onboarding_completed);

CREATE INDEX IF NOT EXISTS idx_migraine_profiles_age 
  ON public.migraine_profiles(age);

-- Composite index for common ML feature combinations
CREATE INDEX IF NOT EXISTS idx_migraine_profiles_demographics 
  ON public.migraine_profiles(gender, country, age);

-- GIN index for JSONB queries on raw_responses
CREATE INDEX IF NOT EXISTS idx_migraine_profiles_raw_responses 
  ON public.migraine_profiles USING GIN (raw_responses);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.migraine_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own migraine profile" 
  ON public.migraine_profiles
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own migraine profile" 
  ON public.migraine_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own migraine profile" 
  ON public.migraine_profiles
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own migraine profile" 
  ON public.migraine_profiles
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE TRIGGER set_migraine_profiles_updated_at
  BEFORE UPDATE ON public.migraine_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- HELPER FUNCTIONS for Data Management
-- ============================================

-- Function to upsert migraine profile (insert or update)
CREATE OR REPLACE FUNCTION upsert_migraine_profile(
  p_user_id UUID,
  p_responses JSONB
)
RETURNS UUID AS $$
DECLARE
  profile_id UUID;
BEGIN
  INSERT INTO public.migraine_profiles (
    user_id,
    age,
    gender,
    country,
    sleep_hours,
    sleep_regularity,
    hydration,
    meal_pattern,
    stress_frequency,
    exercise_frequency,
    caffeine_intake,
    screen_trigger,
    weather_trigger,
    cycle_trigger,
    hormone_therapy,
    medications_taken,
    raw_responses,
    onboarding_completed,
    onboarding_completed_at
  )
  VALUES (
    p_user_id,
    (p_responses->>'age')::INTEGER,
    p_responses->>'gender',
    p_responses->>'country',
    p_responses->>'sleep_hours',
    p_responses->>'sleep_regular',
    p_responses->>'hydration',
    p_responses->>'meal_pattern',
    p_responses->>'stress_frequency',
    p_responses->>'exercise',
    p_responses->>'caffeine',
    p_responses->>'screen_trigger',
    p_responses->>'weather_trigger',
    p_responses->>'cycle_trigger',
    p_responses->>'hormone_therapy',
    CASE WHEN p_responses->>'medications' = 'Yes' THEN true ELSE false END,
    p_responses,
    true,
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    age = EXCLUDED.age,
    gender = EXCLUDED.gender,
    country = EXCLUDED.country,
    sleep_hours = EXCLUDED.sleep_hours,
    sleep_regularity = EXCLUDED.sleep_regularity,
    hydration = EXCLUDED.hydration,
    meal_pattern = EXCLUDED.meal_pattern,
    stress_frequency = EXCLUDED.stress_frequency,
    exercise_frequency = EXCLUDED.exercise_frequency,
    caffeine_intake = EXCLUDED.caffeine_intake,
    screen_trigger = EXCLUDED.screen_trigger,
    weather_trigger = EXCLUDED.weather_trigger,
    cycle_trigger = EXCLUDED.cycle_trigger,
    hormone_therapy = EXCLUDED.hormone_therapy,
    medications_taken = EXCLUDED.medications_taken,
    raw_responses = EXCLUDED.raw_responses,
    onboarding_completed = true,
    onboarding_completed_at = NOW(),
    updated_at = NOW()
  RETURNING id INTO profile_id;
  
  RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get ML-ready feature vector (for model training)
CREATE OR REPLACE FUNCTION get_migraine_features(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  features JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_id', user_id,
    'age', age,
    'gender', gender,
    'country', country,
    'sleep_hours', sleep_hours,
    'sleep_regularity', sleep_regularity,
    'hydration', hydration,
    'meal_pattern', meal_pattern,
    'stress_frequency', stress_frequency,
    'exercise_frequency', exercise_frequency,
    'caffeine_intake', caffeine_intake,
    'screen_trigger', screen_trigger,
    'weather_trigger', weather_trigger,
    'cycle_trigger', cycle_trigger,
    'hormone_therapy', hormone_therapy,
    'medications_taken', medications_taken
  )
  INTO features
  FROM public.migraine_profiles
  WHERE user_id = p_user_id AND onboarding_completed = true;
  
  RETURN features;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.migraine_profiles IS 
  'Stores user onboarding responses for migraine prediction AI model. Structured for easy ML feature extraction.';

COMMENT ON FUNCTION upsert_migraine_profile IS 
  'Upserts (insert or update) migraine profile data from onboarding responses JSONB. Handles both new profiles and updates.';

COMMENT ON FUNCTION get_migraine_features IS 
  'Returns ML-ready feature vector for a user. Used for model training and prediction.';

