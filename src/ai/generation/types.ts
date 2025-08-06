/**
 * Types for AI UI Generation System
 */

import type { Resource, Category, Tag, Framework } from '@prisma/client';

// Generation Request Types
export interface GenerationRequest {
  prompt: string;
  framework?: string;
  category?: string;
  requirements?: {
    typescript?: boolean;
    accessibility?: 'WCAG A' | 'WCAG AA' | 'WCAG AAA';
    responsive?: boolean;
    animations?: boolean;
    features?: string[];
    dataSource?: string;
    updateFrequency?: string;
  };
  designSystem?: string;
  context?: {
    existingComponents?: string[];
    designTokens?: DesignTokens;
    colorPalette?: ColorPalette;
    typographyScale?: TypographyScale;
  };
}

// Context Types
export interface EnhancedGenerationContext {
  database: DatabaseContext;
  search: SearchContext;
  code: CodeContext;
  documentation: DocumentationContext;
}

export interface DatabaseContext {
  similarComponents: Resource[];
  categoryPatterns: CategoryPattern[];
  frameworkConventions: FrameworkConvention[];
  popularTags: Tag[];
  designSystems: DesignSystem[];
}

export interface SearchContext {
  vectorMatches: VectorSearchResult[];
  keywordMatches: AlgoliaSearchResult[];
  relevanceScores: Map<string, number>;
}

export interface CodeContext {
  templates: CodeTemplate[];
  implementations: StoredComponent[];
  designTokens: DesignSystem[];
}

export interface DocumentationContext {
  officialDocs: FrameworkDoc[];
  bestPractices: BestPractice[];
  apiReferences: APIReference[];
}

// Search Result Types
export interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: {
    name: string;
    description: string;
    framework: string;
    category: string;
    tags: string[];
  };
}

export interface AlgoliaSearchResult {
  id: string;
  type: 'component' | 'documentation' | 'resource';
  title: string;
  description: string;
  url?: string;
  framework?: string;
  category?: string;
  tags?: string[];
  score: number;
  highlights?: {
    title?: string;
    description?: string;
    content?: string;
  };
}

// Pattern Types
export interface CategoryPattern {
  category: string;
  patterns: string[];
  requiredFeatures: string[];
}

export interface FrameworkConvention {
  framework: string;
  conventions: string[];
  bestPractices: string[];
}

// Code Types
export interface CodeTemplate {
  id: string;
  code: string;
  metadata: {
    framework: string;
    category: string;
    description: string;
    dependencies: string[];
  };
}

export interface StoredComponent {
  id: string;
  code: string;
  framework: string;
  category: string;
  tags: string[];
  qualityScore: number;
  performanceMetrics?: PerformanceMetrics;
}

export interface ExtractedPatterns {
  typePatterns: TypePattern[];
  hookPatterns: HookPattern[];
  statePatterns: StatePattern[];
  stylePatterns: StylePattern[];
  performancePatterns: PerformancePattern[];
  a11yPatterns: AccessibilityPattern[];
}

export interface HookPattern {
  name: string;
  params?: string;
  implementation: string;
  dependencies?: string;
  type: 'custom' | 'effect' | 'state' | 'memo' | 'callback';
}

// Documentation Types
export interface FrameworkDoc {
  framework: string;
  topic: string;
  content: string;
  examples: CodeExample[];
  url: string;
}

export interface BestPractice {
  title: string;
  description: string;
  framework?: string;
  category?: string;
  examples: string[];
}

export interface APIReference {
  name: string;
  description: string;
  parameters: Parameter[];
  returnType: string;
  examples: string[];
}

// Design System Types
export interface DesignSystem {
  id: string;
  name: string;
  frameworks: string[];
  colorPalettes: ColorPalette[];
  typographyScales: TypographyScale[];
  spacingSystems: SpacingSystem[];
  componentTokens: ComponentToken[];
}

export interface DesignTokens {
  colors: Record<string, string>;
  typography: Record<string, TypographyToken>;
  spacing: Record<string, string>;
  animations: Record<string, AnimationToken>;
}

export interface ColorPalette {
  name: string;
  colors: Record<string, string>;
}

export interface TypographyScale {
  name: string;
  sizes: Record<string, string>;
  lineHeights: Record<string, string>;
  fontWeights: Record<string, string>;
}

export interface SpacingSystem {
  base: number;
  scale: number[];
}

export interface ComponentToken {
  component: string;
  tokens: Record<string, any>;
}

// Generation Output Types
export interface GeneratedComponent {
  id?: string;
  code: string;
  framework: string;
  category?: string;
  tags?: string[];
  dependencies?: string[];
  qualityScore?: number;
  metadata?: ComponentMetadata;
}

export interface ComponentMetadata {
  generatedAt: Date;
  contextUsed: EnhancedGenerationContext;
  similarComponents: string[];
  reviewScore: number;
  performanceOptimizations?: string[];
  accessibilityFeatures?: string[];
}

// Review Types
export interface ReviewResult {
  score: number;
  passed: boolean;
  issues: Issue[];
  suggestions: Suggestion[];
  autoFixAvailable: boolean;
}

export interface ReviewSection {
  category: string;
  score: number;
  issues: Issue[];
  suggestions: Suggestion[];
}

export interface Issue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  suggestion?: string;
}

export interface Suggestion {
  type: 'enhancement' | 'performance' | 'accessibility' | 'security';
  message: string;
  priority: 'high' | 'medium' | 'low';
}

// Training Types
export interface EnhancedTrainingExample {
  prompt: string;
  context: {
    similarComponents: string[];
    framework: string;
    category: string;
    tags: string[];
    searchResults: {
      vectorMatches: number;
      keywordMatches: number;
    };
  };
  completion: string;
  metadata: {
    componentId: string;
    qualityScore: number;
    downloads: number;
    rating: number;
    hasTests: boolean;
    hasDocumentation: boolean;
    performanceScore: number;
    accessibilityScore: number;
    codeReviewScore: number;
  };
}

// Helper Types
export interface CodeExample {
  code: string;
  language: string;
  description?: string;
}

export interface Parameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
}

export interface TypePattern {
  name: string;
  definition: string;
  usage: string[];
}

export interface StatePattern {
  type: 'local' | 'global' | 'context' | 'redux';
  implementation: string;
}

export interface StylePattern {
  type: 'css' | 'css-in-js' | 'tailwind' | 'styled-components';
  implementation: string;
}

export interface PerformancePattern {
  type: 'memoization' | 'lazy-loading' | 'virtualization' | 'debouncing';
  implementation: string;
}

export interface AccessibilityPattern {
  type: 'aria' | 'keyboard' | 'screen-reader' | 'focus-management';
  implementation: string;
}

export interface PerformanceMetrics {
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  reRenderCount?: number;
}

export interface AnimationToken {
  duration: string;
  easing: string;
  delay?: string;
}

export interface TypographyToken {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  fontFamily?: string;
}