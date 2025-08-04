// Visual Component Preview System Types

export interface ComponentPreviewType {
  id: string;
  resourceId: string;
  previewType: 'live' | 'static' | 'sandbox' | 'storybook' | 'codepen';
  previewUrl?: string;
  previewHeight: number;
  previewWidth: string;
  
  // Code examples
  exampleCode?: string;
  exampleFramework: string;
  exampleDependencies?: Record<string, string>;
  
  // Static preview assets
  screenshotUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  
  // Interactive preview configuration
  sandboxTemplate?: string;
  sandboxFiles?: SandboxFile[];
  sandboxConfig?: SandboxConfig;
  
  // Preview features
  isInteractive: boolean;
  isResponsive: boolean;
  supportsThemes: boolean;
  supportsRtl: boolean;
  
  // Performance
  loadTimeMs?: number;
  bundleSizeKb?: number;
  
  // Relations
  variations?: PreviewVariation[];
  playgroundTemplate?: PlaygroundTemplate;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PreviewVariation {
  id: string;
  previewId: string;
  name: string;
  description?: string;
  propsOverride?: Record<string, any>;
  stylesOverride?: string;
  codeSnippet?: string;
  screenshotUrl?: string;
  sortOrder: number;
  isDefault: boolean;
}

export interface PlaygroundTemplate {
  id: string;
  resourceId: string;
  templateName: string;
  templateDescription?: string;
  
  // Base setup
  baseCode: string;
  baseProps?: Record<string, any>;
  baseStyles?: string;
  
  // Customization options
  editableProps?: string[];
  propControls?: Record<string, PropControl>;
  themeOptions?: ThemeOption[];
  
  // Dependencies
  requiredPackages?: Record<string, string>;
  cdnLinks?: string[];
  
  // Framework
  framework?: string;
  language?: string;
}

export interface PropControl {
  type: 'text' | 'number' | 'boolean' | 'select' | 'slider' | 'color' | 'date';
  label?: string;
  description?: string;
  defaultValue?: any;
  required?: boolean;
  
  // For text
  placeholder?: string;
  pattern?: string;
  maxLength?: number;
  
  // For number/slider
  min?: number;
  max?: number;
  step?: number;
  
  // For select
  options?: SelectOption[];
  multiple?: boolean;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface ThemeOption {
  label: string;
  value: string;
  styles?: string;
  variables?: Record<string, string>;
}

export interface SandboxFile {
  name: string;
  content: string;
  language?: string;
}

export interface SandboxConfig {
  title?: string;
  description?: string;
  template?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  entry?: string;
  hidden?: string[];
  view?: 'preview' | 'editor' | 'both';
}

export interface PreviewProvider {
  id: string;
  name: string;
  slug: string;
  baseUrl?: string;
  embedPattern?: string;
  apiEndpoint?: string;
  apiKeyRequired: boolean;
  
  // Supported features
  supportsReact: boolean;
  supportsVue: boolean;
  supportsAngular: boolean;
  supportsSvelte: boolean;
  supportsTypescript: boolean;
  
  // Limits
  maxFileSizeKb?: number;
  maxDependencies?: number;
  rateLimitPerHour?: number;
  
  isActive: boolean;
}

export interface PreviewAnalytics {
  id: string;
  previewId: string;
  viewCount: number;
  interactionCount: number;
  copyCount: number;
  sandboxOpens: number;
  avgLoadTimeMs?: number;
  errorCount: number;
  successRate: number;
  avgTimeSpentSeconds?: number;
  bounceRate?: number;
  date: Date;
}

// API Response Types
export interface PreviewCreateInput {
  resourceId: string;
  previewType: ComponentPreviewType['previewType'];
  exampleFramework: string;
  exampleCode?: string;
  previewUrl?: string;
  sandboxTemplate?: string;
  playgroundTemplate?: Partial<PlaygroundTemplate>;
}

export interface PreviewUpdateInput {
  previewUrl?: string;
  exampleCode?: string;
  exampleDependencies?: Record<string, string>;
  isInteractive?: boolean;
  isResponsive?: boolean;
  sandboxConfig?: SandboxConfig;
}

export interface PreviewSearchParams {
  resourceId?: string;
  previewType?: string;
  framework?: string;
  isInteractive?: boolean;
  hasPlayground?: boolean;
  limit?: number;
  offset?: number;
}