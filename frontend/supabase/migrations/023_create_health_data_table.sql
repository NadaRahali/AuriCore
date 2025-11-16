-- Create health_data table for storing synced health data
CREATE TABLE IF NOT EXISTS public.health_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Location data (for weather prediction)
  location JSONB, -- {latitude, longitude, accuracy, timestamp}
  
  -- HealthKit data (iOS)
  healthkit JSONB, -- {
  --   steps: number,
  --   heartRate: number,
  --   sleep: object,
  --   menstrualCycle: object,
  --   workouts: array,
  --   activeEnergy: number,
  --   restingHeartRate: number,
  --   walkingHeartRate: number,
  --   bloodOxygen: number,
  --   bodyTemperature: number,
  --   respiratoryRate: number
  -- }
  
  -- Wearable device data
  wearable_data JSONB, -- Additional data from Apple Watch, Fitbit, etc.
  
  -- Period tracking app data
  period_tracking JSONB, -- Menstrual cycle data from period tracking apps
  
  -- Metadata
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_health_data_user_id ON public.health_data(user_id);

-- Create index on synced_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_health_data_synced_at ON public.health_data(synced_at DESC);

-- Enable Row Level Security
ALTER TABLE public.health_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own health data" ON public.health_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health data" ON public.health_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health data" ON public.health_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health data" ON public.health_data
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER set_health_data_updated_at
  BEFORE UPDATE ON public.health_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.health_data IS 'Stores synced health data from HealthKit, location services, and wearable devices for migraine prediction.';

