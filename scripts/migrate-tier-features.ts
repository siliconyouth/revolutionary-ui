#!/usr/bin/env node

/**
 * Migrate tier features configuration to database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Feature flags
const FEATURE_FLAGS = {
  // Core Features
  COMPONENT_GENERATION: 'component_generation',
  AI_GENERATION: 'ai_generation',
  MARKETPLACE_ACCESS: 'marketplace_access',
  PRIVATE_COMPONENTS: 'private_components',
  FRAMEWORK_EXPORT: 'framework_export',
  VERSION_CONTROL: 'version_control',
  CUSTOM_CSS: 'custom_css',
  
  // Team Features
  TEAM_COLLABORATION: 'team_collaboration',
  SHARED_COMPONENTS: 'shared_components',
  TEAM_PERMISSIONS: 'team_permissions',
  AUDIT_LOGS: 'audit_logs',
  
  // Advanced Features
  ADVANCED_ANALYTICS: 'advanced_analytics',
  CUSTOM_AI_TRAINING: 'custom_ai_training',
  SSO_AUTHENTICATION: 'sso_authentication',
  ON_PREMISE_DEPLOYMENT: 'on_premise_deployment',
  WHITE_LABEL: 'white_label',
  CUSTOM_INTEGRATIONS: 'custom_integrations',
  
  // Support Features
  EMAIL_SUPPORT: 'email_support',
  PRIORITY_SUPPORT: 'priority_support',
  DEDICATED_SUPPORT: 'dedicated_support',
  CUSTOM_COMPONENT_REQUESTS: 'custom_component_requests',
  
  // Developer Features
  API_ACCESS: 'api_access',
  WEBHOOK_ACCESS: 'webhook_access',
  CLI_ACCESS: 'cli_access',
  GITHUB_INTEGRATION: 'github_integration',
  CI_CD_INTEGRATION: 'ci_cd_integration',
  
  // Enterprise Features
  ADVANCED_SECURITY: 'advanced_security',
  COMPLIANCE_REPORTS: 'compliance_reports',
  DATA_RESIDENCY: 'data_residency',
  CUSTOM_SLA: 'custom_sla',
  DEDICATED_INFRASTRUCTURE: 'dedicated_infrastructure'
};

// Tier configurations
const TIER_CONFIGS = {
  beta_tester: {
    name: 'Beta Tester',
    features: {
      // Core Features - Same as Personal
      [FEATURE_FLAGS.COMPONENT_GENERATION]: true,
      [FEATURE_FLAGS.AI_GENERATION]: true,
      [FEATURE_FLAGS.MARKETPLACE_ACCESS]: true,
      [FEATURE_FLAGS.PRIVATE_COMPONENTS]: true,
      [FEATURE_FLAGS.FRAMEWORK_EXPORT]: true,
      [FEATURE_FLAGS.VERSION_CONTROL]: true,
      [FEATURE_FLAGS.CUSTOM_CSS]: true,
      
      // Team Features
      [FEATURE_FLAGS.TEAM_COLLABORATION]: false,
      [FEATURE_FLAGS.SHARED_COMPONENTS]: false,
      [FEATURE_FLAGS.TEAM_PERMISSIONS]: false,
      [FEATURE_FLAGS.AUDIT_LOGS]: false,
      
      // Advanced Features - Same as Personal
      [FEATURE_FLAGS.ADVANCED_ANALYTICS]: true,
      [FEATURE_FLAGS.CUSTOM_AI_TRAINING]: false,
      [FEATURE_FLAGS.SSO_AUTHENTICATION]: false,
      [FEATURE_FLAGS.ON_PREMISE_DEPLOYMENT]: false,
      [FEATURE_FLAGS.WHITE_LABEL]: false,
      [FEATURE_FLAGS.CUSTOM_INTEGRATIONS]: false,
      
      // Support Features - Same as Personal
      [FEATURE_FLAGS.EMAIL_SUPPORT]: true,
      [FEATURE_FLAGS.PRIORITY_SUPPORT]: false,
      [FEATURE_FLAGS.DEDICATED_SUPPORT]: false,
      [FEATURE_FLAGS.CUSTOM_COMPONENT_REQUESTS]: false,
      
      // Developer Features - Same as Personal
      [FEATURE_FLAGS.API_ACCESS]: true,
      [FEATURE_FLAGS.WEBHOOK_ACCESS]: true,
      [FEATURE_FLAGS.CLI_ACCESS]: true,
      [FEATURE_FLAGS.GITHUB_INTEGRATION]: true,
      [FEATURE_FLAGS.CI_CD_INTEGRATION]: true,
      
      // Enterprise Features
      [FEATURE_FLAGS.ADVANCED_SECURITY]: false,
      [FEATURE_FLAGS.COMPLIANCE_REPORTS]: false,
      [FEATURE_FLAGS.DATA_RESIDENCY]: false,
      [FEATURE_FLAGS.CUSTOM_SLA]: false,
      [FEATURE_FLAGS.DEDICATED_INFRASTRUCTURE]: false
    },
    limits: {
      ai_generations_monthly: -1, // Unlimited like Personal
      private_components: -1, // Unlimited like Personal
      team_members: 1,
      custom_component_requests: 0,
      api_requests_hourly: 1000,
      storage_gb: 10
    }
  },
  personal: {
    name: 'Personal',
    features: {
      // Core Features
      [FEATURE_FLAGS.COMPONENT_GENERATION]: true,
      [FEATURE_FLAGS.AI_GENERATION]: true,
      [FEATURE_FLAGS.MARKETPLACE_ACCESS]: true,
      [FEATURE_FLAGS.PRIVATE_COMPONENTS]: true,
      [FEATURE_FLAGS.FRAMEWORK_EXPORT]: true,
      [FEATURE_FLAGS.VERSION_CONTROL]: true,
      [FEATURE_FLAGS.CUSTOM_CSS]: true,
      
      // Team Features
      [FEATURE_FLAGS.TEAM_COLLABORATION]: false,
      [FEATURE_FLAGS.SHARED_COMPONENTS]: false,
      [FEATURE_FLAGS.TEAM_PERMISSIONS]: false,
      [FEATURE_FLAGS.AUDIT_LOGS]: false,
      
      // Advanced Features
      [FEATURE_FLAGS.ADVANCED_ANALYTICS]: true,
      [FEATURE_FLAGS.CUSTOM_AI_TRAINING]: false,
      [FEATURE_FLAGS.SSO_AUTHENTICATION]: false,
      [FEATURE_FLAGS.ON_PREMISE_DEPLOYMENT]: false,
      [FEATURE_FLAGS.WHITE_LABEL]: false,
      [FEATURE_FLAGS.CUSTOM_INTEGRATIONS]: false,
      
      // Support Features
      [FEATURE_FLAGS.EMAIL_SUPPORT]: true,
      [FEATURE_FLAGS.PRIORITY_SUPPORT]: false,
      [FEATURE_FLAGS.DEDICATED_SUPPORT]: false,
      [FEATURE_FLAGS.CUSTOM_COMPONENT_REQUESTS]: false,
      
      // Developer Features
      [FEATURE_FLAGS.API_ACCESS]: true,
      [FEATURE_FLAGS.WEBHOOK_ACCESS]: true,
      [FEATURE_FLAGS.CLI_ACCESS]: true,
      [FEATURE_FLAGS.GITHUB_INTEGRATION]: true,
      [FEATURE_FLAGS.CI_CD_INTEGRATION]: true,
      
      // Enterprise Features
      [FEATURE_FLAGS.ADVANCED_SECURITY]: false,
      [FEATURE_FLAGS.COMPLIANCE_REPORTS]: false,
      [FEATURE_FLAGS.DATA_RESIDENCY]: false,
      [FEATURE_FLAGS.CUSTOM_SLA]: false,
      [FEATURE_FLAGS.DEDICATED_INFRASTRUCTURE]: false
    },
    limits: {
      ai_generations_monthly: -1, // Unlimited
      private_components: -1, // Unlimited
      team_members: 1,
      custom_component_requests: 0,
      api_requests_hourly: 1000,
      storage_gb: 10
    }
  },
  team: {
    name: 'Team',
    features: {
      // Core Features
      [FEATURE_FLAGS.COMPONENT_GENERATION]: true,
      [FEATURE_FLAGS.AI_GENERATION]: true,
      [FEATURE_FLAGS.MARKETPLACE_ACCESS]: true,
      [FEATURE_FLAGS.PRIVATE_COMPONENTS]: true,
      [FEATURE_FLAGS.FRAMEWORK_EXPORT]: true,
      [FEATURE_FLAGS.VERSION_CONTROL]: true,
      [FEATURE_FLAGS.CUSTOM_CSS]: true,
      
      // Team Features
      [FEATURE_FLAGS.TEAM_COLLABORATION]: true,
      [FEATURE_FLAGS.SHARED_COMPONENTS]: true,
      [FEATURE_FLAGS.TEAM_PERMISSIONS]: true,
      [FEATURE_FLAGS.AUDIT_LOGS]: true,
      
      // Advanced Features
      [FEATURE_FLAGS.ADVANCED_ANALYTICS]: true,
      [FEATURE_FLAGS.CUSTOM_AI_TRAINING]: false,
      [FEATURE_FLAGS.SSO_AUTHENTICATION]: false,
      [FEATURE_FLAGS.ON_PREMISE_DEPLOYMENT]: false,
      [FEATURE_FLAGS.WHITE_LABEL]: false,
      [FEATURE_FLAGS.CUSTOM_INTEGRATIONS]: true,
      
      // Support Features
      [FEATURE_FLAGS.EMAIL_SUPPORT]: true,
      [FEATURE_FLAGS.PRIORITY_SUPPORT]: true,
      [FEATURE_FLAGS.DEDICATED_SUPPORT]: false,
      [FEATURE_FLAGS.CUSTOM_COMPONENT_REQUESTS]: true,
      
      // Developer Features
      [FEATURE_FLAGS.API_ACCESS]: true,
      [FEATURE_FLAGS.WEBHOOK_ACCESS]: true,
      [FEATURE_FLAGS.CLI_ACCESS]: true,
      [FEATURE_FLAGS.GITHUB_INTEGRATION]: true,
      [FEATURE_FLAGS.CI_CD_INTEGRATION]: true,
      
      // Enterprise Features
      [FEATURE_FLAGS.ADVANCED_SECURITY]: false,
      [FEATURE_FLAGS.COMPLIANCE_REPORTS]: false,
      [FEATURE_FLAGS.DATA_RESIDENCY]: false,
      [FEATURE_FLAGS.CUSTOM_SLA]: false,
      [FEATURE_FLAGS.DEDICATED_INFRASTRUCTURE]: false
    },
    limits: {
      ai_generations_monthly: -1, // Unlimited
      private_components: -1, // Unlimited
      team_members: 10,
      custom_component_requests: 5,
      api_requests_hourly: 5000,
      storage_gb: 50
    }
  },
  company: {
    name: 'Company',
    features: {
      // All features enabled
      ...Object.fromEntries(
        Object.entries(FEATURE_FLAGS).map(([key, value]) => [value, true])
      )
    },
    limits: {
      ai_generations_monthly: -1, // Unlimited
      private_components: -1, // Unlimited
      team_members: -1, // Unlimited
      custom_component_requests: -1, // Unlimited
      api_requests_hourly: -1, // Unlimited
      storage_gb: -1 // Unlimited
    }
  }
};

async function migrateTierFeatures() {
  console.log('🚀 Starting migration of tier features to database...\n');

  try {
    // Store tier features in system config
    await prisma.systemConfig.upsert({
      where: { key: 'tier-features' },
      update: {
        value: TIER_CONFIGS,
        description: 'Subscription tier features and limits configuration'
      },
      create: {
        key: 'tier-features',
        value: TIER_CONFIGS,
        description: 'Subscription tier features and limits configuration',
        isSecret: false
      }
    });
    
    console.log('✅ Tier features stored in system config');

    // Store feature flags definitions
    await prisma.systemConfig.upsert({
      where: { key: 'feature-flags' },
      update: {
        value: FEATURE_FLAGS,
        description: 'Feature flag definitions for subscription tiers'
      },
      create: {
        key: 'feature-flags',
        value: FEATURE_FLAGS,
        description: 'Feature flag definitions for subscription tiers',
        isSecret: false
      }
    });
    
    console.log('✅ Feature flags stored in system config');

    // Create feature flags in the feature_flags table
    console.log('\n🚩 Creating feature flags...');
    for (const [key, value] of Object.entries(FEATURE_FLAGS)) {
      const name = key.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      
      await prisma.featureFlag.upsert({
        where: { key: value },
        update: {
          name,
          description: `${name} feature flag`
        },
        create: {
          key: value,
          name,
          description: `${name} feature flag`,
          isEnabled: true,
          rolloutPercentage: 100
        }
      });
      console.log(`  ✅ Created feature flag: ${name}`);
    }

    // Summary
    console.log('\n📊 Migration Summary:');
    console.log(`  - Tiers configured: ${Object.keys(TIER_CONFIGS).length}`);
    console.log(`  - Feature flags: ${Object.keys(FEATURE_FLAGS).length}`);
    console.log(`  - Tiers: ${Object.keys(TIER_CONFIGS).join(', ')}`);

    console.log('\n✅ Tier features migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateTierFeatures();