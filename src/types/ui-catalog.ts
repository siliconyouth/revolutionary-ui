// UI Catalog TypeScript Types
// Based on the database schema for UI component categorization

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
}

export interface Paradigm {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Resource {
  id: string;
  name: string;
  slug: string;
  description?: string;
  longDescription?: string;
  
  // Relations
  resourceTypeId: string;
  resourceType?: ResourceType;
  categoryId: string;
  category?: Category;
  paradigmId?: string;
  paradigm?: Paradigm;
  
  // Source information
  githubUrl?: string;
  npmPackage?: string;
  websiteUrl?: string;
  documentationUrl?: string;
  demoUrl?: string;
  
  // Metadata
  author?: string;
  organization?: string;
  license?: string;
  version?: string;
  lastUpdated?: Date;
  firstReleased?: Date;
  
  // Statistics
  githubStars: number;
  npmDownloads: number;
  popularityScore: number;
  
  // Features
  isTypescript: boolean;
  isOpenSource: boolean;
  isMaintained: boolean;
  isDeprecated: boolean;
  isFeatured: boolean;
  
  // Relations
  tags?: ResourceTag[];
  frameworks?: ResourceFramework[];
  designSystem?: DesignSystem;
  components?: Component[];
  metrics?: ResourceMetric[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  category?: TagCategory;
  createdAt: Date;
}

export type TagCategory = 'tech' | 'feature' | 'use-case' | 'design' | 'other';

export interface ResourceTag {
  resourceId: string;
  resource?: Resource;
  tagId: string;
  tag?: Tag;
}

export interface Framework {
  id: string;
  name: string;
  slug: string;
  version?: string;
  icon?: string;
  websiteUrl?: string;
  createdAt: Date;
}

export interface ResourceFramework {
  resourceId: string;
  resource?: Resource;
  frameworkId: string;
  framework?: Framework;
  compatibilityLevel?: CompatibilityLevel;
  minVersion?: string;
  notes?: string;
}

export type CompatibilityLevel = 'full' | 'partial' | 'plugin' | 'incompatible';

export interface DesignSystem {
  id: string;
  resourceId: string;
  resource?: Resource;
  designLanguage?: string; // Material, Fluent, Carbon, etc.
  company?: string;
  themingSupport: boolean;
  darkModeSupport: boolean;
  rtlSupport: boolean;
  accessibilityLevel?: AccessibilityLevel;
  componentCount?: number;
  createdAt: Date;
}

export type AccessibilityLevel = 'WCAG A' | 'WCAG AA' | 'WCAG AAA' | 'Section 508' | 'Custom';

export interface Component {
  id: string;
  parentResourceId?: string;
  parentResource?: Resource;
  name: string;
  componentType?: ComponentType;
  description?: string;
  propsSchema?: Record<string, any>;
  codeExample?: string;
  previewUrl?: string;
  createdAt: Date;
}

export type ComponentType = 
  | 'button'
  | 'form'
  | 'input'
  | 'navigation'
  | 'layout'
  | 'data-display'
  | 'feedback'
  | 'overlay'
  | 'media'
  | 'utility';

export interface UseCase {
  id: string;
  title: string;
  description?: string;
  category?: UseCaseCategory;
  createdAt: Date;
}

export type UseCaseCategory = 
  | 'e-commerce'
  | 'dashboard'
  | 'marketing'
  | 'social'
  | 'enterprise'
  | 'mobile'
  | 'gaming'
  | 'education'
  | 'healthcare'
  | 'finance';

export interface ResourceUseCase {
  resourceId: string;
  resource?: Resource;
  useCaseId: string;
  useCase?: UseCase;
  relevanceScore: number; // 1-10
  notes?: string;
}

export interface Tool {
  id: string;
  resourceId: string;
  resource?: Resource;
  toolType?: ToolType;
  supportedFeatures: string[];
  configurationComplexity?: ComplexityLevel;
  createdAt: Date;
}

export type ToolType = 
  | 'bundler'
  | 'testing'
  | 'devtools'
  | 'linting'
  | 'documentation'
  | 'scaffolding'
  | 'deployment'
  | 'monitoring';

export type ComplexityLevel = 'low' | 'medium' | 'high';

export interface LearningResource {
  id: string;
  title: string;
  url: string;
  resourceType: LearningResourceType;
  difficultyLevel?: DifficultyLevel;
  durationMinutes?: number;
  author?: string;
  publishedDate?: Date;
  relatedResourceId?: string;
  relatedResource?: Resource;
  createdAt: Date;
}

export type LearningResourceType = 
  | 'tutorial'
  | 'article'
  | 'video'
  | 'course'
  | 'book'
  | 'documentation'
  | 'example'
  | 'workshop';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ResourceMetric {
  id: string;
  resourceId: string;
  resource?: Resource;
  metricDate: Date;
  githubStars?: number;
  githubForks?: number;
  githubIssuesOpen?: number;
  githubIssuesClosed?: number;
  githubContributors?: number;
  npmWeeklyDownloads?: number;
  stackoverflowQuestions?: number;
  communitySizeEstimate?: number;
  createdAt: Date;
}

export type RelationshipType = 
  | 'ALTERNATIVE'
  | 'DEPENDENCY'
  | 'EXTENDS'
  | 'INTEGRATES'
  | 'INSPIRED_BY'
  | 'FORK_OF'
  | 'SIMILAR_TO';

export interface ResourceRelationship {
  id: string;
  sourceResourceId: string;
  sourceResource?: Resource;
  targetResourceId: string;
  targetResource?: Resource;
  relationshipType: RelationshipType;
  notes?: string;
  createdAt: Date;
}

// =====================================================
// QUERY INTERFACES
// =====================================================

export interface ResourceSearchParams {
  query?: string;
  categories?: string[];
  resourceTypes?: string[];
  frameworks?: string[];
  paradigms?: string[];
  tags?: string[];
  isTypescript?: boolean;
  isMaintained?: boolean;
  hasDesignSystem?: boolean;
  minGithubStars?: number;
  sortBy?: ResourceSortOption;
  limit?: number;
  offset?: number;
}

export type ResourceSortOption = 
  | 'popularity'
  | 'stars'
  | 'downloads'
  | 'recent'
  | 'alphabetical';

export interface ResourceFilter {
  categories?: Category[];
  resourceTypes?: ResourceType[];
  frameworks?: Framework[];
  paradigms?: Paradigm[];
  tags?: Tag[];
  features?: {
    isTypescript?: boolean;
    isOpenSource?: boolean;
    isMaintained?: boolean;
    hasDesignSystem?: boolean;
    hasDarkMode?: boolean;
    isAccessible?: boolean;
  };
  statistics?: {
    minStars?: number;
    minDownloads?: number;
    minPopularity?: number;
  };
}

export interface CatalogStats {
  totalResources: number;
  totalCategories: number;
  totalFrameworks: number;
  resourcesByType: Record<string, number>;
  resourcesByCategory: Record<string, number>;
  topResources: Resource[];
  recentlyAdded: Resource[];
  trending: Resource[];
}

// =====================================================
// HELPER TYPES
// =====================================================

export interface ResourceWithRelations extends Resource {
  category: Category;
  resourceType: ResourceType;
  paradigm?: Paradigm;
  tags: Tag[];
  frameworks: Array<Framework & { compatibility: CompatibilityLevel }>;
  designSystem?: DesignSystem;
  components: Component[];
  metrics: ResourceMetric[];
  relationships: ResourceRelationship[];
}

export interface CategoryWithCount extends Category {
  resourceCount: number;
  subcategories?: CategoryWithCount[];
}

export interface FrameworkCompatibilityMatrix {
  resource: Resource;
  compatibilities: Array<{
    framework: Framework;
    level: CompatibilityLevel;
    minVersion?: string;
    notes?: string;
  }>;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SearchResponse {
  results: ResourceWithRelations[];
  facets: {
    categories: Array<{ category: Category; count: number }>;
    resourceTypes: Array<{ type: ResourceType; count: number }>;
    frameworks: Array<{ framework: Framework; count: number }>;
    tags: Array<{ tag: Tag; count: number }>;
  };
  total: number;
  query: string;
  took: number; // milliseconds
}