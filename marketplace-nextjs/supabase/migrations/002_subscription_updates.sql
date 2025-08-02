-- Update user_subscriptions table for better Stripe integration
ALTER TABLE user_subscriptions 
ADD COLUMN stripe_price_id TEXT,
ADD COLUMN stripe_subscription_id TEXT UNIQUE,
ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN canceled_at TIMESTAMPTZ,
ADD COLUMN trial_start TIMESTAMPTZ,
ADD COLUMN trial_end TIMESTAMPTZ,
ADD COLUMN metadata JSONB DEFAULT '{}';

-- Create usage tracking table
CREATE TABLE subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('component_generation', 'ai_provider_call', 'custom_provider_added')),
  count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index for efficient queries
  INDEX idx_usage_user_created (user_id, created_at DESC),
  INDEX idx_usage_type_created (usage_type, created_at DESC)
);

-- Create billing events table for audit trail
CREATE TABLE billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_usage
CREATE POLICY "Users can view own usage" ON subscription_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage" ON subscription_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for billing_events
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

-- Create indexes for performance
CREATE INDEX idx_subscriptions_stripe_sub_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_user_status ON user_subscriptions(user_id, status);
CREATE INDEX idx_billing_events_user_created ON billing_events(user_id, created_at DESC);