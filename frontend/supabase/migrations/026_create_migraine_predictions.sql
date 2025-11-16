-- ============================================
-- MIGRAINE PREDICTIONS TABLE
-- ============================================
-- Stores ML model predictions for tracking accuracy and improving models

CREATE TABLE IF NOT EXISTS public.migraine_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- ============================================
  -- Prediction Details
  -- ============================================
  prediction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  risk_percentage INTEGER NOT NULL CHECK (risk_percentage >= 0 AND risk_percentage <= 100),
  timeframe VARCHAR(20) NOT NULL DEFAULT 'hourly' CHECK (timeframe IN ('hourly', 'daily', 'weekly')),
  predicted_triggers TEXT[], -- Array of predicted trigger names
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- ============================================
  -- Outcome Tracking
  -- ============================================
  actual_outcome BOOLEAN, -- Was there actually a migraine? (null = not yet known)
  
  -- ============================================
  -- Metadata
  -- ============================================
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Index on user_id for fast user lookups
CREATE INDEX IF NOT EXISTS idx_migraine_predictions_user_id 
  ON public.migraine_predictions(user_id);

-- Index on prediction_date for time-based queries
CREATE INDEX IF NOT EXISTS idx_migraine_predictions_date 
  ON public.migraine_predictions(prediction_date DESC);

-- Composite index for common queries (user + date)
CREATE INDEX IF NOT EXISTS idx_migraine_predictions_user_date 
  ON public.migraine_predictions(user_id, prediction_date DESC);

-- Index on timeframe for filtering
CREATE INDEX IF NOT EXISTS idx_migraine_predictions_timeframe 
  ON public.migraine_predictions(timeframe);

-- Index on actual_outcome for accuracy analysis
CREATE INDEX IF NOT EXISTS idx_migraine_predictions_outcome 
  ON public.migraine_predictions(actual_outcome) WHERE actual_outcome IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.migraine_predictions ENABLE ROW LEVEL SECURITY;

-- Users can read their own predictions
CREATE POLICY "Users can read own predictions" ON public.migraine_predictions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own predictions
CREATE POLICY "Users can insert own predictions" ON public.migraine_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own predictions (e.g., to set actual_outcome)
CREATE POLICY "Users can update own predictions" ON public.migraine_predictions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own predictions
CREATE POLICY "Users can delete own predictions" ON public.migraine_predictions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.migraine_predictions IS 'Stores ML model predictions for tracking accuracy and model improvement';
COMMENT ON COLUMN public.migraine_predictions.risk_percentage IS 'Predicted migraine risk percentage (0-100)';
COMMENT ON COLUMN public.migraine_predictions.timeframe IS 'Timeframe for prediction: hourly, daily, or weekly';
COMMENT ON COLUMN public.migraine_predictions.predicted_triggers IS 'Array of predicted trigger names';
COMMENT ON COLUMN public.migraine_predictions.confidence_score IS 'Model confidence in prediction (0-1)';
COMMENT ON COLUMN public.migraine_predictions.actual_outcome IS 'Whether a migraine actually occurred (null = not yet known, true = occurred, false = did not occur)';

