-- Complete Schema for Revolutionary UI Factory System
-- This file combines all migrations for easy deployment

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create AI providers table
CREATE TABLE IF NOT EXISTS ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  api_key TEXT,
  oauth_token TEXT,
  oauth_refresh_token TEXT,
  oauth_expires_at TIMESTAMPTZ,
  model TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('beta', 'free', 'personal', 'company', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 month',
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create AI usage table
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  cost DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create generated components table
CREATE TABLE IF NOT EXISTS generated_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  component_type TEXT NOT NULL,
  framework TEXT NOT NULL,
  code TEXT NOT NULL,
  config JSONB NOT NULL,
  ai_provider TEXT NOT NULL,
  ai_model TEXT NOT NULL,
  confidence DECIMAL(3, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('component_generation', 'ai_provider_call', 'custom_provider_added')),
  count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create billing events table for audit trail
CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_user_created ON subscription_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_type_created ON subscription_usage(usage_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON user_subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_billing_events_user_created ON billing_events(user_id, created_at DESC);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- AI providers policies
CREATE POLICY "Users can view own AI providers" ON ai_providers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI providers" ON ai_providers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI providers" ON ai_providers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI providers" ON ai_providers
  FOR DELETE USING (auth.uid() = user_id);

-- User subscriptions policies
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- AI usage policies
CREATE POLICY "Users can view own usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Generated components policies
CREATE POLICY "Users can view own components" ON generated_components
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own components" ON generated_components
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscription usage policies
CREATE POLICY "Users can view own usage" ON subscription_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage" ON subscription_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Billing events policies
CREATE POLICY "Users can view own billing events" ON billing_events
  FOR SELECT USING (auth.uid() = user_id);

-- Function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_usage_type TEXT,
  p_period_start TIMESTAMPTZ DEFAULT date_trunc('month', NOW())
) RETURNS TABLE (
  used INTEGER,
  limit_amount INTEGER,
  can_use BOOLEAN
) AS $$
DECLARE
  v_plan TEXT;
  v_used INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get user's plan
  SELECT plan INTO v_plan
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  LIMIT 1;
  
  -- Default to free plan if no active subscription
  v_plan := COALESCE(v_plan, 'free');
  
  -- Count usage in current period
  SELECT COALESCE(SUM(count), 0) INTO v_used
  FROM subscription_usage
  WHERE user_id = p_user_id
    AND usage_type = p_usage_type
    AND created_at >= p_period_start;
  
  -- Get limit based on plan and usage type
  v_limit := CASE
    WHEN v_plan = 'beta' AND p_usage_type = 'component_generation' THEN 50
    WHEN v_plan = 'free' AND p_usage_type = 'component_generation' THEN 10
    WHEN v_plan = 'personal' AND p_usage_type = 'component_generation' THEN 100
    WHEN v_plan = 'company' AND p_usage_type = 'component_generation' THEN 1000
    WHEN v_plan = 'enterprise' THEN -1 -- Unlimited
    
    WHEN v_plan = 'beta' AND p_usage_type = 'custom_provider_added' THEN 2
    WHEN v_plan = 'free' AND p_usage_type = 'custom_provider_added' THEN 0
    WHEN v_plan = 'personal' AND p_usage_type = 'custom_provider_added' THEN 5
    WHEN v_plan IN ('company', 'enterprise') THEN -1 -- Unlimited
    
    ELSE 0
  END;
  
  RETURN QUERY
  SELECT 
    v_used AS used,
    v_limit AS limit_amount,
    (v_limit = -1 OR v_used < v_limit) AS can_use;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record usage
CREATE OR REPLACE FUNCTION record_usage(
  p_user_id UUID,
  p_usage_type TEXT,
  p_count INTEGER DEFAULT 1,
  p_metadata JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
DECLARE
  v_can_use BOOLEAN;
  v_subscription_id UUID;
BEGIN
  -- Check if user can use this feature
  SELECT can_use INTO v_can_use
  FROM check_usage_limit(p_user_id, p_usage_type);
  
  IF NOT v_can_use THEN
    RETURN FALSE;
  END IF;
  
  -- Get subscription ID
  SELECT id INTO v_subscription_id
  FROM user_subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
  LIMIT 1;
  
  -- Record usage
  INSERT INTO subscription_usage (
    user_id,
    subscription_id,
    usage_type,
    count,
    metadata
  ) VALUES (
    p_user_id,
    v_subscription_id,
    p_usage_type,
    p_count,
    p_metadata
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_ai_providers_updated_at BEFORE UPDATE ON ai_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;