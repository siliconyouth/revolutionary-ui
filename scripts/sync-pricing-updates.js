#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// Updated pricing configuration
const UPDATED_PRICING = {
  beta_tester: {
    name: 'Beta Tester',
    monthly: 0,
    yearly: 0,
    features: {
      ai_generations_monthly: -1, // Unlimited
      private_components: -1, // Unlimited
      storage_gb: 20,
      api_calls_daily: 2000,
      bandwidth_gb_monthly: 200
    }
  },
  early_bird: {
    name: 'Early Bird Access',
    monthly: 999, // $9.99
    yearly: 8393, // $83.93
    features: {
      ai_generations_monthly: -1, // Unlimited
      private_components: -1, // Unlimited
      storage_gb: 20,
      api_calls_daily: 2000,
      bandwidth_gb_monthly: 200
    }
  },
  personal: {
    name: 'Personal',
    monthly: 1999, // $19.99
    yearly: 16791, // $167.91
    features: {
      ai_generations_monthly: -1,
      private_components: -1,
      storage_gb: 20,
      api_calls_daily: 2000,
      bandwidth_gb_monthly: 200
    }
  },
  company: {
    name: 'Company',
    monthly: 4999, // $49.99 (UPDATED)
    yearly: 41991, // $419.91 (UPDATED)
    features: {
      ai_generations_monthly: -1,
      private_components: -1,
      team_members: 10,
      storage_gb: 100,
      api_calls_daily: 10000,
      bandwidth_gb_monthly: 1000
    }
  },
  enterprise: {
    name: 'Enterprise',
    monthly: 9999, // $99.99
    yearly: 83991, // $839.91
    features: {
      ai_generations_monthly: -1,
      private_components: -1,
      team_members: -1,
      storage_gb: -1,
      api_calls_daily: -1,
      bandwidth_gb_monthly: -1
    }
  }
};

// Color utilities
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

const print = {
  title: (text) => console.log(`\n${colors.bright}${colors.blue}${text}${colors.reset}`),
  success: (text) => console.log(`${colors.green}✅ ${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}❌ ${text}${colors.reset}`),
  info: (text) => console.log(`${colors.blue}ℹ️  ${text}${colors.reset}`)
};

async function updateAppFiles() {
  print.title('📝 Updating Application Files');
  
  const filesToCheck = [
    {
      path: 'marketplace-nextjs/src/config/pricing.ts',
      description: 'Marketplace pricing configuration'
    },
    {
      path: 'marketplace-nextjs/src/constants/pricing.ts',
      description: 'Pricing constants'
    },
    {
      path: 'src/config/subscriptions.ts',
      description: 'Core subscription config'
    }
  ];
  
  let updatedCount = 0;
  
  for (const file of filesToCheck) {
    const filePath = path.join(process.cwd(), file.path);
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      
      // Update Company pricing references
      content = content.replace(/2999/g, '4999'); // $29.99 -> $49.99
      content = content.replace(/25191/g, '41991'); // yearly price
      content = content.replace(/29\.99/g, '49.99'); // formatted price
      content = content.replace(/251\.91/g, '419.91'); // formatted yearly
      
      // Update Beta/Early Bird to unlimited
      content = content.replace(/ai_generations_monthly:\s*50/g, 'ai_generations_monthly: -1');
      content = content.replace(/ai_generations_monthly:\s*100/g, 'ai_generations_monthly: -1');
      content = content.replace(/private_components:\s*5/g, 'private_components: -1');
      content = content.replace(/private_components:\s*10/g, 'private_components: -1');
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        print.success(`Updated ${file.description}`);
        updatedCount++;
      }
    }
  }
  
  if (updatedCount === 0) {
    print.info('No hardcoded prices found in checked files');
  }
  
  return updatedCount;
}

async function createDatabaseMigration() {
  print.title('🗄️  Creating Database Migration');
  
  const migrationContent = `-- Update existing subscriptions with new tier features
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
`;

  const migrationDir = path.join(process.cwd(), 'prisma/migrations');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, -5);
  const migrationName = `${timestamp}_update_pricing_tiers`;
  const migrationPath = path.join(migrationDir, migrationName);
  
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }
  
  if (!fs.existsSync(migrationPath)) {
    fs.mkdirSync(migrationPath);
    fs.writeFileSync(
      path.join(migrationPath, 'migration.sql'),
      migrationContent
    );
    print.success(`Created migration: ${migrationName}`);
    return migrationPath;
  } else {
    print.warning('Migration already exists');
    return null;
  }
}

async function updatePricingCache() {
  print.title('💾 Updating Pricing Cache');
  
  const cacheFile = path.join(process.cwd(), '.cache/pricing.json');
  const cacheDir = path.dirname(cacheFile);
  
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  
  const cacheData = {
    updated: new Date().toISOString(),
    tiers: UPDATED_PRICING,
    stripe_price_ids: {
      early_bird: {
        monthly: process.env.STRIPE_PRICE_EARLY_BIRD_MONTHLY,
        yearly: process.env.STRIPE_PRICE_EARLY_BIRD_YEARLY
      },
      personal: {
        monthly: process.env.STRIPE_PRICE_PERSONAL_MONTHLY,
        yearly: process.env.STRIPE_PRICE_PERSONAL_YEARLY
      },
      company: {
        monthly: process.env.STRIPE_PRICE_COMPANY_MONTHLY,
        yearly: process.env.STRIPE_PRICE_COMPANY_YEARLY
      },
      enterprise: {
        monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
        yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY
      }
    }
  };
  
  fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
  print.success('Updated pricing cache');
  
  return cacheFile;
}

async function generateSummary() {
  print.title('📊 Update Summary');
  
  const summary = {
    timestamp: new Date().toISOString(),
    changes: [
      {
        tier: 'Beta Tester',
        updates: [
          'AI generations: 50/month → Unlimited',
          'Private components: 5 → Unlimited',
          'Storage: 1GB → 20GB',
          'API calls: 100/day → 2,000/day'
        ]
      },
      {
        tier: 'Early Bird',
        updates: [
          'AI generations: 100/month → Unlimited',
          'Private components: 10 → Unlimited',
          'Storage: 5GB → 20GB',
          'API calls: 500/day → 2,000/day'
        ]
      },
      {
        tier: 'Company',
        updates: [
          'Monthly price: $29.99 → $49.99',
          'Yearly price: $251.91 → $419.91'
        ]
      }
    ],
    stripe_updates: {
      company: {
        old_monthly: 'price_1RsDmsAlB5kkCVbouoIPi32r',
        new_monthly: process.env.STRIPE_PRICE_COMPANY_MONTHLY,
        old_yearly: 'price_1RsDmtAlB5kkCVbozrVbqReV',
        new_yearly: process.env.STRIPE_PRICE_COMPANY_YEARLY
      }
    }
  };
  
  const summaryPath = path.join(process.cwd(), 'pricing-update-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  print.info('\nKey Changes:');
  summary.changes.forEach(change => {
    console.log(`\n${colors.bright}${change.tier}:${colors.reset}`);
    change.updates.forEach(update => {
      console.log(`  • ${update}`);
    });
  });
  
  return summaryPath;
}

async function main() {
  print.title('🚀 Revolutionary UI - Sync Pricing Updates');
  
  try {
    // 1. Update application files
    const filesUpdated = await updateAppFiles();
    
    // 2. Create database migration
    const migrationPath = await createDatabaseMigration();
    
    // 3. Update pricing cache
    const cachePath = await updatePricingCache();
    
    // 4. Generate summary
    const summaryPath = await generateSummary();
    
    print.title('✨ Sync Complete!');
    print.success('All pricing updates have been synchronized');
    
    print.info('\nNext steps:');
    print.info('1. Review the generated migration in prisma/migrations');
    print.info('2. Run: npm run prisma:migrate:deploy');
    print.info('3. Clear any CDN caches');
    print.info('4. Notify existing subscribers of the changes');
    
    if (migrationPath) {
      print.warning(`\nIMPORTANT: Run the database migration:`);
      print.info(`cd marketplace-nextjs && npx prisma migrate deploy`);
    }
    
  } catch (error) {
    print.error(`Failed to sync updates: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { UPDATED_PRICING, updateAppFiles, createDatabaseMigration };