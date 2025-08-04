// React-Specific TypeScript Types for UI Catalog
// Extends the base ui-catalog.ts types

import { Resource, Tag, UseCase } from './ui-catalog';

// =====================================================
// REACT-SPECIFIC ENUMS
// =====================================================

export enum StateManagementApproach {
  INTERNAL = 'internal',
  REDUX = 'redux',
  MOBX = 'mobx',
  CONTEXT_API = 'context',
  ZUSTAND = 'zustand',
  RECOIL = 'recoil',
  VALTIO = 'valtio',
  JOTAI = 'jotai'
}

export enum StylingApproach {
  CSS_MODULES = 'css-modules',
  STYLED_COMPONENTS = 'styled-components',
  EMOTION = 'emotion',
  TAILWIND = 'tailwind',
  SASS = 'sass',
  VANILLA_CSS = 'vanilla-css',
  STITCHES = 'stitches',
  VANILLA_EXTRACT = 'vanilla-extract'
}

export enum ReactEcosystemTool {
  NEXTJS = 'next.js',
  GATSBY = 'gatsby',
  REMIX = 'remix',
  VITE = 'vite',
  CREATE_REACT_APP = 'cra',
  PARCEL = 'parcel',
  WEBPACK = 'webpack',
  ROLLUP = 'rollup'
}

export enum DependencyType {
  PEER = 'peer',
  DEV = 'dev',
  OPTIONAL = 'optional',
  REQUIRED = 'required'
}

export enum MetricType {
  BUNDLE_SIZE = 'bundle-size',
  FIRST_RENDER = 'first-render',
  RE_RENDER = 're-render',
  MEMORY_USAGE = 'memory',
  LOAD_TIME = 'load-time'
}

export enum QualityIndicator {
  ROCKET = 'rocket',      // 🚀 Truly amazing
  UNICORN = 'unicorn',    // 🦄 Unique
  BUTTERFLY = 'butterfly', // 🦋 Beautiful
  TROPHY = 'trophy'       // 🏆 Exceptional
}

// =====================================================
// REACT COMPONENT CATEGORIES
// =====================================================

export enum ReactComponentCategory {
  // UI Components
  EDITABLE_DATA_GRID = 'editable-data-grid',
  TABLE = 'tables',
  INFINITE_SCROLL = 'infinite-scroll',
  OVERLAY = 'overlays',
  NOTIFICATION = 'notifications',
  TOOLTIP = 'tooltips',
  MENU = 'menus',
  CAROUSEL = 'carousels',
  CHART = 'charts',
  MAP = 'maps',
  TIME_DATE = 'time-date',
  IMAGE = 'image',
  VIDEO_AUDIO = 'video-audio',
  CANVAS = 'canvas',
  FORM_COMPONENT = 'form-components',
  MARKDOWN_EDITOR = 'markdown-editors',
  
  // Layout & Animation
  UI_LAYOUT = 'ui-layout',
  UI_ANIMATION = 'ui-animation',
  UI_FRAMEWORK = 'ui-frameworks',
  
  // Utilities
  VISIBILITY_REPORTER = 'visibility-reporters',
  DEVICE_INPUT = 'device-input',
  META_TAGS = 'meta-tags',
  STATE_MANAGEMENT = 'state-management',
  ROUTING = 'routing',
  
  // Performance
  LAZY_LOADING = 'lazy-loading',
  VIRTUALIZATION = 'virtualization',
  
  // Dev Tools
  TESTING = 'testing',
  DEBUGGING = 'debugging',
  BUILD_TOOLS = 'build-tools'
}

// =====================================================
// REACT-SPECIFIC INTERFACES
// =====================================================

export interface ReactResource extends Resource {
  // React version compatibility
  reactVersionMin?: string;
  reactVersionMax?: string;
  
  // React-specific features
  supportsSSR?: boolean;
  supportsReactNative: boolean;
  bundleSizeKb?: number;
  hasTypescriptDefs: boolean;
  qualityIndicators?: QualityIndicator[];
  
  // Related data
  reactFeatures?: ReactComponentFeatures;
  ecosystemCompatibility?: ReactEcosystemCompatibility[];
  dependencies?: ComponentDependency[];
  examples?: ComponentExample[];
  performanceMetrics?: PerformanceMetric[];
}

export interface ReactComponentFeatures {
  id: string;
  resourceId: string;
  
  // State Management
  usesHooks: boolean;
  usesClassComponents: boolean;
  stateManagementApproach?: StateManagementApproach;
  
  // Styling
  stylingApproach?: StylingApproach;
  themeable: boolean;
  cssInJs: boolean;
  
  // Component Architecture
  compoundComponents: boolean;
  renderProps: boolean;
  higherOrderComponent: boolean;
  customHooksProvided: boolean;
  
  // Accessibility
  ariaCompliant: boolean;
  keyboardNavigation: boolean;
  screenReaderTested: boolean;
  
  // Performance
  memoized: boolean;
  codeSplittingReady: boolean;
  treeShakeable: boolean;
  
  // Testing
  unitTestsIncluded: boolean;
  integrationTestsIncluded: boolean;
  storybookStories: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ReactEcosystemCompatibility {
  id: string;
  resourceId: string;
  ecosystemTool: ReactEcosystemTool;
  compatibilityLevel: 'native' | 'full' | 'partial' | 'plugin';
  versionConstraint?: string;
  notes?: string;
  createdAt: Date;
}

export interface ComponentDependency {
  id: string;
  resourceId: string;
  dependencyName: string;
  dependencyVersion?: string;
  dependencyType?: DependencyType;
  isReactSpecific: boolean;
  createdAt: Date;
}

export interface ComponentExample {
  id: string;
  resourceId: string;
  exampleName: string;
  description?: string;
  codeSnippet?: string;
  liveDemoUrl?: string;
  codesandboxUrl?: string;
  complexityLevel?: 'basic' | 'intermediate' | 'advanced';
  useCaseId?: string;
  useCase?: UseCase;
  createdAt: Date;
}

export interface PerformanceMetric {
  id: string;
  resourceId: string;
  metricType: MetricType;
  metricValue: number;
  metricUnit: string;
  testEnvironment?: string;
  measuredAt: Date;
}

// =====================================================
// REACT-SPECIFIC SEARCH & FILTER
// =====================================================

export interface ReactComponentSearchParams {
  // Base search params
  query?: string;
  category?: ReactComponentCategory;
  
  // React-specific filters
  reactVersion?: string;
  supportsSSR?: boolean;
  supportsReactNative?: boolean;
  maxBundleSize?: number;
  hasTypescriptDefs?: boolean;
  
  // Architecture filters
  usesHooks?: boolean;
  stateManagement?: StateManagementApproach;
  stylingApproach?: StylingApproach;
  
  // Quality filters
  qualityIndicators?: QualityIndicator[];
  ariaCompliant?: boolean;
  hasStorybook?: boolean;
  
  // Ecosystem filters
  ecosystemTools?: ReactEcosystemTool[];
  
  // Sorting
  sortBy?: ReactSortOption;
  limit?: number;
  offset?: number;
}

export type ReactSortOption = 
  | 'popularity'
  | 'bundle-size'
  | 'github-stars'
  | 'npm-downloads'
  | 'recently-updated'
  | 'performance-score';

// =====================================================
// AGGREGATED DATA TYPES
// =====================================================

export interface ReactComponentStats {
  totalComponents: number;
  byCategory: Record<ReactComponentCategory, number>;
  byStateManagement: Record<StateManagementApproach, number>;
  byStylingApproach: Record<StylingApproach, number>;
  averageBundleSize: number;
  withTypescript: number;
  withSSR: number;
  withReactNative: number;
  topPerformers: ReactResource[];
}

export interface ReactEcosystemReport {
  component: ReactResource;
  ecosystemSupport: {
    nextjs: boolean;
    gatsby: boolean;
    remix: boolean;
    vite: boolean;
    cra: boolean;
  };
  performanceScores: {
    bundleSize: number;
    firstRender: number;
    reRender: number;
  };
  qualityScore: number; // 0-100
  recommendedFor: string[];
}

// =====================================================
// COMPONENT COMPARISON
// =====================================================

export interface ComponentComparison {
  components: ReactResource[];
  comparisonMatrix: {
    features: Record<string, boolean[]>;
    performance: Record<MetricType, number[]>;
    ecosystem: Record<ReactEcosystemTool, string[]>; // compatibility levels
    dependencies: string[][];
  };
  recommendation?: {
    bestOverall?: string;
    bestPerformance?: string;
    bestDX?: string;
    mostCompatible?: string;
  };
}

// =====================================================
// AWESOME-REACT-COMPONENTS SPECIFIC
// =====================================================

export interface AwesomeReactComponent {
  name: string;
  githubUrl: string;
  description: string;
  demoUrl?: string;
  category: ReactComponentCategory;
  qualityIndicators: QualityIndicator[];
  lastCommit?: Date;
  isAwesome: boolean; // Must solve a real problem uniquely
  addedDate: Date;
  maintainerNotes?: string; // Italic commentary from maintainer
}