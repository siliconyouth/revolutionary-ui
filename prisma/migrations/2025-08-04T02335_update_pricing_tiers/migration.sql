-- Update existing subscriptions with new tier features
-- This migration updates the metadata for existing subscriptions to reflect new unlimited features

-- Update Beta Tester subscriptions
UPDATE "Subscription"
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{features}',
  '{
    "ai_generations_monthly": -1,
    "private_components": -1,
    "storage_gb": 20,
    "api_calls_daily": 2000,
    "bandwidth_gb_monthly": 200
  }'::jsonb
)
WHERE tier = 'beta_tester';

-- Update Early Bird subscriptions
UPDATE "Subscription"
SET metadata = jsonb_set(
  COALESCE(metadata, '{}'::jsonb),
  '{features}',
  '{
    "ai_generations_monthly": -1,
    "private_components": -1,
    "storage_gb": 20,
    "api_calls_daily": 2000,
    "bandwidth_gb_monthly": 200
  }'::jsonb
)
WHERE tier = 'early_bird';

-- Update Company tier pricing in metadata
UPDATE "Subscription"
SET metadata = jsonb_set(
  jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{pricing,monthly}',
    '4999'
  ),
  '{pricing,yearly}',
  '41991'
)
WHERE tier = 'company';

-- Log the migration
INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES (
  'pricing_update_' || to_char(now(), 'YYYYMMDDHHMMSS'),
  md5('pricing_update_2024'),
  now(),
  'update_tier_features_and_pricing',
  'Updated Beta Tester and Early Bird to unlimited features, updated Company pricing to $49.99',
  NULL,
  now(),
  1
);
