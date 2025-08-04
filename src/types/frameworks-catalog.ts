// Framework Catalog TypeScript Types
// Comprehensive framework tracking based on Vercel's supported frameworks

// =====================================================
// FRAMEWORK ENUMS
// =====================================================

export enum FrameworkCategory {
  FULL_STACK = 'full-stack',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  SSG = 'ssg', // Static Site Generator
  MOBILE = 'mobile',
  DOCUMENTATION = 'documentation',
  E_COMMERCE = 'e-commerce',
  EXPERIMENTAL = 'experimental'
}

export enum FrameworkEcosystem {
  REACT = 'react',
  VUE = 'vue',
  ANGULAR = 'angular',
  SVELTE = 'svelte',
  SOLID = 'solid',
  QWIK = 'qwik',
  EMBER = 'ember',
  WEB_COMPONENTS = 'web-components',
  NODE = 'node',
  PYTHON = 'python',
  RUBY = 'ruby',
  GO = 'go',
  RUST = 'rust',
  PHP = 'php',
  DOTNET = 'dotnet',
  JAVA = 'java',
  AGNOSTIC = 'agnostic'
}

export enum RenderingMode {
  SSR = 'ssr', // Server-Side Rendering
  SSG = 'ssg', // Static Site Generation
  ISR = 'isr', // Incremental Static Regeneration
  SPA = 'spa', // Single Page Application
  CSR = 'csr', // Client-Side Rendering
  HYBRID = 'hybrid' // Mixed rendering modes
}

export enum DeploymentPlatform {
  VERCEL = 'vercel',
  NETLIFY = 'netlify',
  AWS = 'aws',
  GCP = 'gcp',
  AZURE = 'azure',
  CLOUDFLARE_PAGES = 'cloudflare-pages',
  RENDER = 'render',
  RAILWAY = 'railway',
  FLY_IO = 'fly-io',
  HEROKU = 'heroku'
}

export enum FrameworkRelationType {
  BASED_ON = 'based_on',
  ALTERNATIVE_TO = 'alternative_to',
  WORKS_WITH = 'works_with',
  EXTENDS = 'extends',
  INSPIRED_BY = 'inspired_by'
}

// =====================================================
// CORE INTERFACES
// =====================================================

export interface FrameworkCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  createdAt: Date;
}

export interface Framework {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  websiteUrl?: string;
  categoryId?: string;
  category?: FrameworkCategory;
  language?: string;
  description?: string;
  tagline?: string;
  deploymentPlatforms?: DeploymentPlatform[];
  isMetaFramework: boolean;
  parentFrameworkId?: string;
  parentFramework?: Framework;
  githubStars: number;
  npmDownloads: number;
  ecosystem?: FrameworkEcosystem;
  version?: string;
  createdAt: Date;
  
  // Relations
  features?: FrameworkFeatures;
  relationships?: FrameworkRelationship[];
  deploymentSupport?: FrameworkDeploymentSupport[];
}

export interface FrameworkFeatures {
  id: string;
  frameworkId: string;
  
  // Rendering capabilities
  supportsSSR: boolean;
  supportsSSG: boolean;
  supportsISR: boolean;
  supportsSPA: boolean;
  
  // Development features
  hotReload: boolean;
  typescriptSupport: boolean;
  jsxSupport: boolean;
  
  // Build features
  codeSplitting: boolean;
  treeShaking: boolean;
  lazyLoading: boolean;
  
  // Deployment
  edgeRuntime: boolean;
  serverlessSupport: boolean;
  dockerSupport: boolean;
  
  // Performance
  bundleSizeOptimization: boolean;
  imageOptimization: boolean;
  fontOptimization: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface FrameworkRelationship {
  id: string;
  sourceFrameworkId: string;
  sourceFramework?: Framework;
  targetFrameworkId: string;
  targetFramework?: Framework;
  relationshipType: FrameworkRelationType;
  notes?: string;
  createdAt: Date;
}

export interface DeploymentPlatformInfo {
  id: string;
  name: string;
  slug: string;
  websiteUrl?: string;
  createdAt: Date;
}

export interface FrameworkDeploymentSupport {
  id: string;
  frameworkId: string;
  framework?: Framework;
  platformId: string;
  platform?: DeploymentPlatformInfo;
  supportLevel: 'official' | 'community' | 'experimental';
  deploymentGuideUrl?: string;
  createdAt: Date;
}

// =====================================================
// FRAMEWORK GROUPS
// =====================================================

export interface FrameworkGroup {
  ecosystem: FrameworkEcosystem;
  coreFramework: Framework;
  metaFrameworks: Framework[];
  relatedTools: Framework[];
  totalComponents: number;
  popularityScore: number;
}

export interface FullStackFramework extends Framework {
  frontendCapabilities: string[];
  backendCapabilities: string[];
  databaseIntegrations: string[];
  authSolutions: string[];
  deploymentTargets: DeploymentPlatform[];
}

// =====================================================
// SEARCH & FILTER INTERFACES
// =====================================================

export interface FrameworkSearchParams {
  query?: string;
  categories?: FrameworkCategory[];
  ecosystems?: FrameworkEcosystem[];
  languages?: string[];
  features?: {
    supportsSSR?: boolean;
    supportsSSG?: boolean;
    typescriptSupport?: boolean;
    edgeRuntime?: boolean;
    serverlessSupport?: boolean;
  };
  deploymentPlatforms?: DeploymentPlatform[];
  isMetaFramework?: boolean;
  minGithubStars?: number;
  sortBy?: FrameworkSortOption;
  limit?: number;
  offset?: number;
}

export type FrameworkSortOption = 
  | 'popularity'
  | 'github-stars'
  | 'npm-downloads'
  | 'alphabetical'
  | 'recently-updated';

// =====================================================
// COMPARISON & ANALYSIS
// =====================================================

export interface FrameworkComparison {
  frameworks: Framework[];
  comparisonMatrix: {
    features: Record<keyof FrameworkFeatures, boolean[]>;
    renderingModes: Record<RenderingMode, boolean[]>;
    deploymentPlatforms: Record<DeploymentPlatform, string[]>; // support levels
    ecosystemSize: number[];
    performanceScore: number[];
  };
  recommendations: {
    bestForBeginners?: string;
    bestPerformance?: string;
    mostFeatures?: string;
    bestEcosystem?: string;
  };
}

export interface FrameworkMigrationPath {
  fromFramework: Framework;
  toFramework: Framework;
  difficulty: 'easy' | 'medium' | 'hard';
  steps: string[];
  tools: string[];
  estimatedTime: string;
  breakingChanges: string[];
}

// =====================================================
// STATISTICS & METRICS
// =====================================================

export interface FrameworkStats {
  totalFrameworks: number;
  byCategory: Record<FrameworkCategory, number>;
  byEcosystem: Record<FrameworkEcosystem, number>;
  byLanguage: Record<string, number>;
  metaFrameworks: number;
  averageGithubStars: number;
  topFrameworks: Framework[];
  risingFrameworks: Framework[]; // Based on growth rate
}

export interface FrameworkTrend {
  framework: Framework;
  monthlyGrowth: {
    githubStars: number;
    npmDownloads: number;
    componentCount: number;
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  adoptionRate: number; // percentage
}

// =====================================================
// VERCEL-SPECIFIC TYPES
// =====================================================

export interface VercelFrameworkProfile extends Framework {
  vercelOptimizations: {
    edgeFunctions: boolean;
    imageOptimization: boolean;
    analyticsIntegration: boolean;
    speedInsights: boolean;
  };
  deploymentPreset?: string;
  buildCommand?: string;
  outputDirectory?: string;
  installCommand?: string;
  devCommand?: string;
}

// =====================================================
// HELPER TYPES
// =====================================================

export interface FrameworkWithStats extends Framework {
  componentCount: number;
  averageBundleSize: number;
  communitySize: number;
  lastReleaseDate?: Date;
  releaseFrequency?: string; // e.g., "weekly", "monthly"
}

export interface FrameworkEcosystemReport {
  ecosystem: FrameworkEcosystem;
  frameworks: FrameworkWithStats[];
  totalComponents: number;
  totalDownloads: number;
  growthRate: number;
  dominantFramework: Framework;
  emergingTrends: string[];
}

// =====================================================
// RECOMMENDATION ENGINE TYPES
// =====================================================

export interface FrameworkRecommendation {
  framework: Framework;
  score: number; // 0-100
  reasons: string[];
  pros: string[];
  cons: string[];
  alternativeOptions: Framework[];
}

export interface ProjectRequirements {
  projectType: 'website' | 'webapp' | 'mobile' | 'desktop' | 'api';
  teamSize: 'solo' | 'small' | 'medium' | 'large';
  timeline: 'prototype' | 'mvp' | 'production';
  scalability: 'low' | 'medium' | 'high';
  seoImportant: boolean;
  realtimeFeatures: boolean;
  offlineSupport: boolean;
  preferredLanguages?: string[];
  deploymentTarget?: DeploymentPlatform;
}

export interface FrameworkRecommendationEngine {
  analyze(requirements: ProjectRequirements): FrameworkRecommendation[];
  compare(frameworkIds: string[]): FrameworkComparison;
  suggestMigration(currentFramework: string): FrameworkMigrationPath[];
  predictTrends(): FrameworkTrend[];
}