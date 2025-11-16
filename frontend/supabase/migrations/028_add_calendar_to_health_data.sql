-- ============================================
-- ADD CALENDAR AND WEATHER COLUMNS TO HEALTH_DATA TABLE
-- ============================================
-- Adds calendar and weather JSONB columns to store calendar events and weather data
-- These were added when calendar and weather integrations were implemented but migrations were missing

-- Add calendar column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'health_data' 
    AND column_name = 'calendar'
  ) THEN
    ALTER TABLE public.health_data 
    ADD COLUMN calendar JSONB;
    
    COMMENT ON COLUMN public.health_data.calendar IS 'Calendar events and schedule analysis data in JSONB format. Contains: events array, busyDays metrics, stressIndicators, and dateRange.';
  END IF;
END $$;

-- Add weather column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'health_data' 
    AND column_name = 'weather'
  ) THEN
    ALTER TABLE public.health_data 
    ADD COLUMN weather JSONB;
    
    COMMENT ON COLUMN public.health_data.weather IS 'Weather data from OpenWeatherMap API in JSONB format. Contains: temperature, condition, humidity, pressure, and other weather metrics.';
  END IF;
END $$;

