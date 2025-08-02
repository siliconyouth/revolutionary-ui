/**
 * Revolutionary UI Factory - Main Export
 */

export { ProjectDetector } from './project-detector'
export { ProjectAnalyzer } from './project-analyzer'
export { AIAnalyzer } from './ai-analyzer'
export { SetupWizard } from './setup-wizard'
export { PackageInstaller } from './package-installer'
export { AuthManager } from './auth-manager'

export type {
  ProjectAnalysis,
  DetectedPackage,
  Recommendation
} from './project-detector'

export type {
  AnalysisReport,
  ProjectSummary,
  CompatibilityReport,
  EnhancedRecommendation,
  MissingFeature,
  Optimization,
  SetupPlan
} from './project-analyzer'

export type {
  AIRecommendation,
  AIAnalysisResult
} from './ai-analyzer'

export type {
  WizardOptions,
  SelectionResult,
  WizardResult,
  ConfigFile
} from './setup-wizard'

export type {
  InstallOptions,
  InstallResult
} from './package-installer'

// Package counts for reference
export const PACKAGE_STATS = {
  frameworks: 11,
  uiLibraries: 14,
  iconLibraries: 15,
  totalIcons: 75000,
  designTools: 6,
  colorTools: 4,
  fonts: 8,
  totalPackages: 100
}

// Version
export const VERSION = '2.1.0'