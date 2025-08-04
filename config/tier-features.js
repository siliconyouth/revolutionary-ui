// Revolutionary UI - Tier Feature Configuration
// This file defines what features and limits each pricing tier has access to

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

const TIER_FEATURES = {
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
      api_calls_daily: 2000, // Same as Personal
      storage_gb: 20, // Same as Personal
      bandwidth_gb_monthly: 200, // Same as Personal
      concurrent_builds: 5, // Same as Personal
      export_formats: 'all', // All frameworks like Personal
      component_versions: -1, // Unlimited like Personal
      marketplace_downloads_monthly: -1 // Unlimited like Personal
    }
  },
  
  early_bird: {
    name: 'Early Bird Access',
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
      
      // Support Features - Same as Personal + Priority
      [FEATURE_FLAGS.EMAIL_SUPPORT]: true,
      [FEATURE_FLAGS.PRIORITY_SUPPORT]: true,
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
      api_calls_daily: 2000, // Same as Personal
      storage_gb: 20, // Same as Personal
      bandwidth_gb_monthly: 200, // Same as Personal
      concurrent_builds: 5, // Same as Personal
      export_formats: 'all', // All frameworks like Personal
      component_versions: -1, // Unlimited like Personal
      marketplace_downloads_monthly: -1 // Unlimited like Personal
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
      api_calls_daily: 2000,
      storage_gb: 20,
      bandwidth_gb_monthly: 200,
      concurrent_builds: 5,
      export_formats: 'all', // All frameworks
      component_versions: -1, // Unlimited
      marketplace_downloads_monthly: -1 // Unlimited
    }
  },
  
  company: {
    name: 'Company',
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
      [FEATURE_FLAGS.SSO_AUTHENTICATION]: true,
      [FEATURE_FLAGS.ON_PREMISE_DEPLOYMENT]: false,
      [FEATURE_FLAGS.WHITE_LABEL]: false,
      [FEATURE_FLAGS.CUSTOM_INTEGRATIONS]: false,
      
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
      api_calls_daily: 10000,
      storage_gb: 100,
      bandwidth_gb_monthly: 1000,
      concurrent_builds: 10,
      export_formats: 'all', // All frameworks
      component_versions: -1, // Unlimited
      marketplace_downloads_monthly: -1 // Unlimited
    }
  },
  
  enterprise: {
    name: 'Enterprise',
    features: {
      // All features enabled
      ...Object.fromEntries(
        Object.values(FEATURE_FLAGS).map(flag => [flag, true])
      )
    },
    limits: {
      ai_generations_monthly: -1, // Unlimited
      private_components: -1, // Unlimited
      team_members: -1, // Unlimited
      custom_component_requests: -1, // Unlimited
      api_calls_daily: -1, // Unlimited
      storage_gb: -1, // Unlimited
      bandwidth_gb_monthly: -1, // Unlimited
      concurrent_builds: -1, // Unlimited
      export_formats: 'all', // All frameworks
      component_versions: -1, // Unlimited
      marketplace_downloads_monthly: -1 // Unlimited
    }
  }
};

// Helper functions
const tierHelpers = {
  hasFeature(tier, feature) {
    return TIER_FEATURES[tier]?.features[feature] || false;
  },
  
  getLimit(tier, limit) {
    const value = TIER_FEATURES[tier]?.limits[limit];
    return value === -1 ? Infinity : value;
  },
  
  isWithinLimit(tier, limit, current) {
    const max = this.getLimit(tier, limit);
    return max === Infinity || current <= max;
  },
  
  getAllFeatures(tier) {
    return TIER_FEATURES[tier]?.features || {};
  },
  
  getAllLimits(tier) {
    return TIER_FEATURES[tier]?.limits || {};
  },
  
  getFeatureName(flag) {
    return flag.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  },
  
  compareAccess(tierA, tierB) {
    const featuresA = this.getAllFeatures(tierA);
    const featuresB = this.getAllFeatures(tierB);
    
    const differences = {
      gained: [],
      lost: []
    };
    
    Object.keys(featuresB).forEach(feature => {
      if (featuresB[feature] && !featuresA[feature]) {
        differences.gained.push(feature);
      }
    });
    
    Object.keys(featuresA).forEach(feature => {
      if (featuresA[feature] && !featuresB[feature]) {
        differences.lost.push(feature);
      }
    });
    
    return differences;
  },
  
  getTierByStripeProductId(productId) {
    // Map Stripe product IDs to tier IDs
    const productMap = {
      'prod_SnpRJye4PAo6aj': 'beta_tester',
      'prod_SnpRkyi976PwBK': 'early_bird',
      'prod_SnpRsC1AkhAmoo': 'personal',
      'prod_SnpRayhhrJXwal': 'company',
      'prod_SnpRRxcjgMskQP': 'enterprise'
    };
    return productMap[productId] || null;
  }
};

// Feature categories for UI display
const FEATURE_CATEGORIES = {
  core: {
    name: 'Core Features',
    features: [
      FEATURE_FLAGS.COMPONENT_GENERATION,
      FEATURE_FLAGS.AI_GENERATION,
      FEATURE_FLAGS.MARKETPLACE_ACCESS,
      FEATURE_FLAGS.PRIVATE_COMPONENTS,
      FEATURE_FLAGS.FRAMEWORK_EXPORT,
      FEATURE_FLAGS.VERSION_CONTROL,
      FEATURE_FLAGS.CUSTOM_CSS
    ]
  },
  team: {
    name: 'Team & Collaboration',
    features: [
      FEATURE_FLAGS.TEAM_COLLABORATION,
      FEATURE_FLAGS.SHARED_COMPONENTS,
      FEATURE_FLAGS.TEAM_PERMISSIONS,
      FEATURE_FLAGS.AUDIT_LOGS
    ]
  },
  advanced: {
    name: 'Advanced Features',
    features: [
      FEATURE_FLAGS.ADVANCED_ANALYTICS,
      FEATURE_FLAGS.CUSTOM_AI_TRAINING,
      FEATURE_FLAGS.SSO_AUTHENTICATION,
      FEATURE_FLAGS.ON_PREMISE_DEPLOYMENT,
      FEATURE_FLAGS.WHITE_LABEL,
      FEATURE_FLAGS.CUSTOM_INTEGRATIONS
    ]
  },
  support: {
    name: 'Support',
    features: [
      FEATURE_FLAGS.EMAIL_SUPPORT,
      FEATURE_FLAGS.PRIORITY_SUPPORT,
      FEATURE_FLAGS.DEDICATED_SUPPORT,
      FEATURE_FLAGS.CUSTOM_COMPONENT_REQUESTS
    ]
  },
  developer: {
    name: 'Developer Tools',
    features: [
      FEATURE_FLAGS.API_ACCESS,
      FEATURE_FLAGS.WEBHOOK_ACCESS,
      FEATURE_FLAGS.CLI_ACCESS,
      FEATURE_FLAGS.GITHUB_INTEGRATION,
      FEATURE_FLAGS.CI_CD_INTEGRATION
    ]
  },
  enterprise: {
    name: 'Enterprise',
    features: [
      FEATURE_FLAGS.ADVANCED_SECURITY,
      FEATURE_FLAGS.COMPLIANCE_REPORTS,
      FEATURE_FLAGS.DATA_RESIDENCY,
      FEATURE_FLAGS.CUSTOM_SLA,
      FEATURE_FLAGS.DEDICATED_INFRASTRUCTURE
    ]
  }
};

module.exports = {
  FEATURE_FLAGS,
  TIER_FEATURES,
  FEATURE_CATEGORIES,
  tierHelpers
};