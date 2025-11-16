-- ============================================
-- CREATE PREMIUM FEATURES TABLES
-- ============================================
-- Creates tables for premium features: prescriptions, prescription requests,
-- nutritionist consultations, and premium subscriptions

-- Prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  refill_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'needs_refill', 'discontinued')),
  doctor_id VARCHAR(255), -- Can be UUID if doctors table exists, or string for now
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Prescription requests table
CREATE TABLE IF NOT EXISTS public.prescription_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE NOT NULL,
  urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent')),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  doctor_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Nutritionist consultations table
CREATE TABLE IF NOT EXISTS public.nutritionist_consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nutritionist_id VARCHAR(255) NOT NULL, -- Can be UUID if nutritionists table exists
  consultation_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Premium subscriptions table (placeholder for Stripe/RevenueCat integration)
CREATE TABLE IF NOT EXISTS public.premium_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  plan_type VARCHAR(50) DEFAULT 'premium' CHECK (plan_type IN ('free', 'premium', 'enterprise')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id VARCHAR(255), -- For Stripe integration
  revenuecat_subscription_id VARCHAR(255), -- For RevenueCat integration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prescriptions_user_id ON public.prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescription_requests_user_id ON public.prescription_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prescription_requests_prescription_id ON public.prescription_requests(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_requests_status ON public.prescription_requests(status);
CREATE INDEX IF NOT EXISTS idx_nutritionist_consultations_user_id ON public.nutritionist_consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_nutritionist_consultations_nutritionist_id ON public.nutritionist_consultations(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_nutritionist_consultations_consultation_date ON public.nutritionist_consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_user_id ON public.premium_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_status ON public.premium_subscriptions(status);

-- Enable Row Level Security
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritionist_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prescriptions
CREATE POLICY "Users can view their own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescriptions"
  ON public.prescriptions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for prescription_requests
CREATE POLICY "Users can view their own prescription requests"
  ON public.prescription_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prescription requests"
  ON public.prescription_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescription requests"
  ON public.prescription_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for nutritionist_consultations
CREATE POLICY "Users can view their own consultations"
  ON public.nutritionist_consultations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consultations"
  ON public.nutritionist_consultations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consultations"
  ON public.nutritionist_consultations FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for premium_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.premium_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.premium_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.premium_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescription_requests_updated_at
  BEFORE UPDATE ON public.prescription_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutritionist_consultations_updated_at
  BEFORE UPDATE ON public.nutritionist_consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_premium_subscriptions_updated_at
  BEFORE UPDATE ON public.premium_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

