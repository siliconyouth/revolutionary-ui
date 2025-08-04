// Revolutionary UI - Subscription and Feature Types

export enum SubscriptionTier {
  BETA_TESTER = 'beta_tester',
  EARLY_BIRD = 'early_bird',
  PERSONAL = 'personal',
  COMPANY = 'company',
  ENTERPRISE = 'enterprise'
}

export enum FeatureFlag {
  // Core Features
  COMPONENT_GENERATION = 'component_generation',
  AI_GENERATION = 'ai_generation',
  MARKETPLACE_ACCESS = 'marketplace_access',
  PRIVATE_COMPONENTS = 'private_components',
  FRAMEWORK_EXPORT = 'framework_export',
  VERSION_CONTROL = 'version_control',
  CUSTOM_CSS = 'custom_css',
  
  // Team Features
  TEAM_COLLABORATION = 'team_collaboration',
  SHARED_COMPONENTS = 'shared_components',
  TEAM_PERMISSIONS = 'team_permissions',
  AUDIT_LOGS = 'audit_logs',
  
  // Advanced Features
  ADVANCED_ANALYTICS = 'advanced_analytics',
  CUSTOM_AI_TRAINING = 'custom_ai_training',
  SSO_AUTHENTICATION = 'sso_authentication',
  ON_PREMISE_DEPLOYMENT = 'on_premise_deployment',
  WHITE_LABEL = 'white_label',
  CUSTOM_INTEGRATIONS = 'custom_integrations',
  
  // Support Features
  EMAIL_SUPPORT = 'email_support',
  PRIORITY_SUPPORT = 'priority_support',
  DEDICATED_SUPPORT = 'dedicated_support',
  CUSTOM_COMPONENT_REQUESTS = 'custom_component_requests',
  
  // Developer Features
  API_ACCESS = 'api_access',
  WEBHOOK_ACCESS = 'webhook_access',
  CLI_ACCESS = 'cli_access',
  GITHUB_INTEGRATION = 'github_integration',
  CI_CD_INTEGRATION = 'ci_cd_integration',
  
  // Enterprise Features
  ADVANCED_SECURITY = 'advanced_security',
  COMPLIANCE_REPORTS = 'compliance_reports',
  DATA_RESIDENCY = 'data_residency',
  CUSTOM_SLA = 'custom_sla',
  DEDICATED_INFRASTRUCTURE = 'dedicated_infrastructure'
}

export interface TierLimits {
  ai_generations_monthly: number;
  private_components: number;
  team_members: number;
  custom_component_requests: number;
  api_calls_daily: number;
  storage_gb: number;
  bandwidth_gb_monthly: number;
  concurrent_builds: number;
  export_formats: string[] | 'all';
  component_versions: number;
  marketplace_downloads_monthly: number;
}

export interface TierFeatures {
  [key: string]: boolean;
}

export interface TierConfig {
  name: string;
  features: TierFeatures;
  limits: TierLimits;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageRecord {
  id: string;
  userId: string;
  subscriptionId: string;
  metric: keyof TierLimits;
  value: number;
  period: string; // YYYY-MM for monthly, YYYY-MM-DD for daily
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureAccess {
  feature: FeatureFlag;
  hasAccess: boolean;
  reason?: string;
}

export interface LimitCheck {
  limit: keyof TierLimits;
  current: number;
  max: number;
  isWithinLimit: boolean;
  percentageUsed: number;
}