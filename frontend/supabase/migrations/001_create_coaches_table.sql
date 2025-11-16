-- Create coaches table
CREATE TABLE IF NOT EXISTS public.coaches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  languages TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  bio TEXT,
  specializations TEXT[] DEFAULT '{}',
  available BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_coaches_email ON public.coaches(email);

-- Create index on region for filtering
CREATE INDEX IF NOT EXISTS idx_coaches_region ON public.coaches(region);

-- Create index on available status
CREATE INDEX IF NOT EXISTS idx_coaches_available ON public.coaches(available);

-- Enable Row Level Security (RLS)
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to coaches
CREATE POLICY "Allow public read access to coaches" ON public.coaches
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to read coaches
CREATE POLICY "Allow authenticated users to read coaches" ON public.coaches
  FOR SELECT TO authenticated USING (true);

-- Only admins can insert/update/delete coaches (you'll need to set up admin role)
-- For now, we'll allow service role only (managed via Supabase dashboard)

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.coaches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Add comment to table
COMMENT ON TABLE public.coaches IS 'Stores information about career coaches available in the AURICORE platform';

