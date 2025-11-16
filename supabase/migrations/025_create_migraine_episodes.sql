-- ============================================
-- MIGRAINE EPISODES TABLE
-- ============================================
-- Stores actual migraine episodes for tracking and ML model training
-- Links episodes to user profiles for pattern analysis

CREATE TABLE IF NOT EXISTS public.migraine_episodes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- ============================================
  -- Episode Timing
  -- ============================================
  episode_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- ============================================
  -- Episode Severity & Duration
  -- ============================================
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
  duration_hours DECIMAL(5, 2), -- Duration in hours (e.g., 4.5 hours)
  
  -- ============================================
  -- Triggers & Symptoms
  -- ============================================
  suspected_triggers TEXT[], -- Array of trigger names (stress, weather, sleep, etc.)
  symptoms TEXT[], -- Array of symptoms (throbbing, pressure, etc.)
  
  -- ============================================
  -- Medication Information
  -- ============================================
  medication_taken BOOLEAN DEFAULT false,
  medication_names TEXT[], -- Names of medications taken
  
  -- ============================================
  -- Pain Characteristics
  -- ============================================
  pain_location TEXT[], -- Where pain occurred (forehead, temples, one_side, both_sides, back_of_head, etc.)
  has_aura BOOLEAN DEFAULT false, -- Visual aura before migraine
  
  -- ============================================
  -- Associated Symptoms
  -- ============================================
  nausea BOOLEAN DEFAULT false,
  vomiting BOOLEAN DEFAULT false,
  light_sensitivity BOOLEAN DEFAULT false,
  sound_sensitivity BOOLEAN DEFAULT false,
  
  -- ============================================
  -- Contextual Factors
  -- ============================================
  sleep_quality_night_before INTEGER CHECK (sleep_quality_night_before >= 1 AND sleep_quality_night_before <= 5), -- 1-5 scale
  stress_level_before INTEGER CHECK (stress_level_before >= 1 AND stress_level_before <= 10), -- 1-10 scale
  
  -- ============================================
  -- Relief & Treatment
  -- ============================================
  relief_methods_tried TEXT[], -- What user tried for relief (rest, medication, cold_compress, etc.)
  
  -- ============================================
  -- Location & Environment
  -- ============================================
  location JSONB, -- Where episode occurred {latitude, longitude, address, timestamp}
  weather_at_time JSONB, -- Weather conditions snapshot at time of episode
  
  -- ============================================
  -- Additional Notes
  -- ============================================
  notes TEXT, -- Free-form notes about the episode
  
  -- ============================================
  -- Metadata
  -- ============================================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Index on user_id for fast user lookups
CREATE INDEX IF NOT EXISTS idx_migraine_episodes_user_id 
  ON public.migraine_episodes(user_id);

-- Index on episode_date for time-based queries
CREATE INDEX IF NOT EXISTS idx_migraine_episodes_date 
  ON public.migraine_episodes(episode_date DESC);

-- Composite index for common queries (user + date range)
CREATE INDEX IF NOT EXISTS idx_migraine_episodes_user_date 
  ON public.migraine_episodes(user_id, episode_date DESC);

-- Index on severity for filtering
CREATE INDEX IF NOT EXISTS idx_migraine_episodes_severity 
  ON public.migraine_episodes(severity);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.migraine_episodes ENABLE ROW LEVEL SECURITY;

-- Users can read their own episodes
CREATE POLICY "Users can read own migraine episodes" ON public.migraine_episodes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own episodes
CREATE POLICY "Users can insert own migraine episodes" ON public.migraine_episodes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own episodes
CREATE POLICY "Users can update own migraine episodes" ON public.migraine_episodes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own episodes
CREATE POLICY "Users can delete own migraine episodes" ON public.migraine_episodes
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER for updated_at
-- ============================================

CREATE TRIGGER set_migraine_episodes_updated_at
  BEFORE UPDATE ON public.migraine_episodes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.migraine_episodes IS 'Stores actual migraine episodes for tracking patterns and training ML models';
COMMENT ON COLUMN public.migraine_episodes.severity IS 'Pain severity on a scale of 1-10';
COMMENT ON COLUMN public.migraine_episodes.duration_hours IS 'Duration of migraine episode in hours';
COMMENT ON COLUMN public.migraine_episodes.suspected_triggers IS 'Array of suspected trigger names (stress, weather, sleep, hormonal, etc.)';
COMMENT ON COLUMN public.migraine_episodes.symptoms IS 'Array of symptoms experienced (throbbing, pressure, pulsating, etc.)';
COMMENT ON COLUMN public.migraine_episodes.pain_location IS 'Array of pain locations (forehead, temples, one_side, both_sides, back_of_head, etc.)';
COMMENT ON COLUMN public.migraine_episodes.sleep_quality_night_before IS 'Sleep quality the night before episode (1=poor, 5=excellent)';
COMMENT ON COLUMN public.migraine_episodes.stress_level_before IS 'Stress level before episode (1=low, 10=high)';
COMMENT ON COLUMN public.migraine_episodes.relief_methods_tried IS 'Array of relief methods tried (rest, medication, cold_compress, dark_room, etc.)';
COMMENT ON COLUMN public.migraine_episodes.location IS 'JSONB object with location data where episode occurred';
COMMENT ON COLUMN public.migraine_episodes.weather_at_time IS 'JSONB object with weather conditions at time of episode';

