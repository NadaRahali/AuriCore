-- ============================================
-- CAREERKARMA GAMIFICATION SYSTEM
-- ============================================

-- Add karma fields to coaches table
ALTER TABLE public.coaches
ADD COLUMN IF NOT EXISTS impact_karma INTEGER DEFAULT 0 CHECK (impact_karma >= 0 AND impact_karma <= 400),
ADD COLUMN IF NOT EXISTS connection_karma INTEGER DEFAULT 0 CHECK (connection_karma >= 0 AND connection_karma <= 250),
ADD COLUMN IF NOT EXISTS wisdom_karma INTEGER DEFAULT 0 CHECK (wisdom_karma >= 0 AND wisdom_karma <= 200),
ADD COLUMN IF NOT EXISTS engagement_xp INTEGER DEFAULT 0 CHECK (engagement_xp >= 0 AND engagement_xp <= 150),
ADD COLUMN IF NOT EXISTS total_karma INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level VARCHAR(50) DEFAULT 'rookie_coach',
ADD COLUMN IF NOT EXISTS streak_weeks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_session_date TIMESTAMP WITH TIME ZONE;

-- Create function to calculate total karma
CREATE OR REPLACE FUNCTION calculate_total_karma()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_karma = NEW.impact_karma + NEW.connection_karma + NEW.wisdom_karma + NEW.engagement_xp;
  
  -- Update level based on total karma
  NEW.level = CASE
    WHEN NEW.total_karma >= 900 THEN 'career_sage'
    WHEN NEW.total_karma >= 700 THEN 'mentor_legend'
    WHEN NEW.total_karma >= 400 THEN 'career_alchemist'
    WHEN NEW.total_karma >= 200 THEN 'guiding_light'
    ELSE 'rookie_coach'
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate karma on coach updates
CREATE TRIGGER update_coach_karma
  BEFORE UPDATE OF impact_karma, connection_karma, wisdom_karma, engagement_xp
  ON public.coaches
  FOR EACH ROW
  EXECUTE FUNCTION calculate_total_karma();

-- Add seeker karma fields to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS seeker_karma INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS seeker_level VARCHAR(50) DEFAULT 'new_seeker',
ADD COLUMN IF NOT EXISTS sessions_attended INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reflections_given INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referrals_made INTEGER DEFAULT 0;

-- Create function to calculate seeker level
CREATE OR REPLACE FUNCTION calculate_seeker_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.seeker_level = CASE
    WHEN NEW.seeker_karma >= 200 THEN 'pro_networker'
    WHEN NEW.seeker_karma >= 100 THEN 'growth_seeker'
    WHEN NEW.seeker_karma >= 50 THEN 'active_learner'
    ELSE 'new_seeker'
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate seeker level
CREATE TRIGGER update_seeker_level
  BEFORE UPDATE OF seeker_karma, sessions_attended, reflections_given, referrals_made
  ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_seeker_level();

-- Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  seeker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type VARCHAR(100),
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show'))
);

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.session_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  seeker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  
  -- Vibe selection (emoji feedback)
  vibe VARCHAR(50) NOT NULL,
  
  -- One-liner reflection
  reflection TEXT,
  
  -- Karma points awarded
  impact_karma_awarded INTEGER DEFAULT 0,
  connection_karma_awarded INTEGER DEFAULT 0,
  wisdom_karma_awarded INTEGER DEFAULT 0,
  engagement_xp_awarded INTEGER DEFAULT 0,
  
  -- Tags
  tags TEXT[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT valid_vibe CHECK (vibe IN ('focus', 'encouraging', 'breakthrough', 'okay', 'disappointing'))
);

-- Create achievements/badges table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  badge_icon VARCHAR(50),
  xp_bonus INTEGER DEFAULT 0,
  requirement_type VARCHAR(50) NOT NULL,
  requirement_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user achievements junction table (for coaches)
CREATE TABLE IF NOT EXISTS public.coach_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES public.coaches(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(coach_id, achievement_id)
);

-- Create user achievements junction table (for seekers)
CREATE TABLE IF NOT EXISTS public.seeker_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seeker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(seeker_id, achievement_id)
);

-- Insert default achievements
INSERT INTO public.achievements (name, description, badge_icon, xp_bonus, requirement_type, requirement_count)
VALUES
  ('100_conversations', '100 Conversations', '💬', 50, 'sessions_completed', 100),
  ('breakthrough_coach', 'Breakthrough Coach', '🎓', 100, 'breakthrough_count', 20),
  ('empathic_ear', 'Empathic Ear', '🕊️', 80, 'encouraging_count', 50),
  ('consistency_champ', 'Consistency Champion', '💪', 200, 'streak_weeks', 12),
  ('first_session', 'First Session', '🌟', 10, 'sessions_completed', 1),
  ('ten_sessions', '10 Sessions Milestone', '⭐', 20, 'sessions_completed', 10),
  ('fifty_sessions', '50 Sessions Milestone', '🌠', 50, 'sessions_completed', 50),
  ('super_connector', 'Super Connector', '🤝', 60, 'connection_karma', 150)
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_coach_id ON public.sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_sessions_seeker_id ON public.sessions(seeker_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON public.sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON public.session_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_coach_id ON public.session_feedback(coach_id);
CREATE INDEX IF NOT EXISTS idx_coaches_total_karma ON public.coaches(total_karma DESC);
CREATE INDEX IF NOT EXISTS idx_coaches_level ON public.coaches(level);

-- Enable RLS on new tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeker_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions" ON public.sessions
  FOR SELECT USING (seeker_id = auth.uid());

CREATE POLICY "Users can create their own sessions" ON public.sessions
  FOR INSERT WITH CHECK (seeker_id = auth.uid());

CREATE POLICY "Users can update their own sessions" ON public.sessions
  FOR UPDATE USING (seeker_id = auth.uid());

-- RLS Policies for feedback
CREATE POLICY "Users can view feedback for their sessions" ON public.session_feedback
  FOR SELECT USING (seeker_id = auth.uid());

CREATE POLICY "Users can create feedback for their sessions" ON public.session_feedback
  FOR INSERT WITH CHECK (seeker_id = auth.uid());

-- RLS Policies for achievements (public read)
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view coach achievements" ON public.coach_achievements
  FOR SELECT USING (true);

CREATE POLICY "Users can view seeker achievements" ON public.seeker_achievements
  FOR SELECT USING (seeker_id = auth.uid());

-- Function to award karma after feedback
CREATE OR REPLACE FUNCTION award_karma_from_feedback()
RETURNS TRIGGER AS $$
BEGIN
  -- Update coach karma based on vibe
  UPDATE public.coaches
  SET
    impact_karma = LEAST(impact_karma + NEW.impact_karma_awarded, 400),
    connection_karma = LEAST(connection_karma + NEW.connection_karma_awarded, 250),
    wisdom_karma = LEAST(wisdom_karma + NEW.wisdom_karma_awarded, 200),
    engagement_xp = LEAST(engagement_xp + NEW.engagement_xp_awarded, 150),
    last_session_date = NOW()
  WHERE id = NEW.coach_id;
  
  -- Update seeker karma for giving feedback
  UPDATE public.user_profiles
  SET
    seeker_karma = seeker_karma + 10,
    reflections_given = reflections_given + 1
  WHERE user_id = NEW.seeker_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to award karma when feedback is created
CREATE TRIGGER award_karma_on_feedback
  AFTER INSERT ON public.session_feedback
  FOR EACH ROW
  EXECUTE FUNCTION award_karma_from_feedback();

-- Function to update session count when session completes
CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update coach total sessions
    UPDATE public.coaches
    SET total_sessions = total_sessions + 1
    WHERE id = NEW.coach_id;
    
    -- Update seeker sessions attended
    UPDATE public.user_profiles
    SET 
      sessions_attended = sessions_attended + 1,
      seeker_karma = seeker_karma + 20
    WHERE user_id = NEW.seeker_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session stats
CREATE TRIGGER update_session_stats_trigger
  AFTER UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_stats();

-- Add comments
COMMENT ON TABLE public.sessions IS 'Coaching sessions between coaches and job seekers';
COMMENT ON TABLE public.session_feedback IS 'Post-session feedback with karma awards';
COMMENT ON TABLE public.achievements IS 'Available achievements/badges in the system';
COMMENT ON COLUMN public.coaches.total_karma IS 'Sum of all karma types (max 1000)';
COMMENT ON COLUMN public.coaches.level IS 'Coach level based on total karma';

