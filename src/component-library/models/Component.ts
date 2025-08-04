export interface ComponentMetadata {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  usageCount: number;
  
  // Source information
  source: {
    type: 'scraped' | 'generated' | 'manual' | 'imported';
    url?: string;
    extractionMethod?: 'playwright' | 'firecrawl' | 'both';
    extractedAt?: Date;
    originalFramework?: string;
  };
  
  // Categorization
  category: ComponentCategory;
  subcategory?: string;
  type: ComponentType;
  tags: string[];
  keywords: string[];
  
  // Technical details
  frameworks: FrameworkSupport[];
  styling: StylingSupport[];
  dependencies: Dependency[];
  peerDependencies?: Dependency[];
  
  // Design system
  designSystem?: {
    name: string;
    version?: string;
    tokens: DesignTokens;
  };
  
  // Compatibility
  compatibility: {
    browsers: BrowserSupport[];
    responsive: boolean;
    accessibility: AccessibilityInfo;
    performance: PerformanceMetrics;
  };
  
  // Files and assets
  files: ComponentFiles;
  assets: ComponentAssets;
  
  // Usage and examples
  examples: ComponentExample[];
  useCases: string[];
  relatedComponents: string[]; // IDs of related components
  
  // Quality metrics
  quality: {
    score: number; // 0-100
    codeQuality: number;
    documentation: number;
    testing: number;
    accessibility: number;
    performance: number;
  };
  
  // Search and discovery
  searchableText: string;
  popularity: number;
  featured: boolean;
}

export enum ComponentCategory {
  Navigation = 'navigation',
  Layout = 'layout',
  Forms = 'forms',
  DataDisplay = 'data-display',
  Feedback = 'feedback',
  Overlay = 'overlay',
  Content = 'content',
  Marketing = 'marketing',
  ECommerce = 'e-commerce',
  Media = 'media',
  Charts = 'charts',
  Animation = 'animation',
  Utility = 'utility'
}

export enum ComponentType {
  // Navigation
  Navbar = 'navbar',
  Sidebar = 'sidebar',
  Breadcrumb = 'breadcrumb',
  Tabs = 'tabs',
  Pagination = 'pagination',
  
  // Layout
  Grid = 'grid',
  Container = 'container',
  Section = 'section',
  Hero = 'hero',
  Footer = 'footer',
  
  // Forms
  Input = 'input',
  Select = 'select',
  Checkbox = 'checkbox',
  Radio = 'radio',
  Switch = 'switch',
  Slider = 'slider',
  DatePicker = 'date-picker',
  FileUpload = 'file-upload',
  FormGroup = 'form-group',
  
  // Data Display
  Table = 'table',
  List = 'list',
  Card = 'card',
  Badge = 'badge',
  Tag = 'tag',
  Timeline = 'timeline',
  Calendar = 'calendar',
  
  // Feedback
  Alert = 'alert',
  Toast = 'toast',
  Modal = 'modal',
  Popover = 'popover',
  Tooltip = 'tooltip',
  Progress = 'progress',
  Spinner = 'spinner',
  Skeleton = 'skeleton',
  
  // Content
  Accordion = 'accordion',
  Carousel = 'carousel',
  Gallery = 'gallery',
  Video = 'video',
  Audio = 'audio',
  
  // Other
  Button = 'button',
  Icon = 'icon',
  Avatar = 'avatar',
  Divider = 'divider',
  Custom = 'custom'
}

export interface FrameworkSupport {
  name: 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla';
  version: string;
  verified: boolean;
  path: string;
}

export interface StylingSupport {
  type: 'css' | 'scss' | 'styled-components' | 'tailwind' | 'css-modules' | 'emotion';
  version?: string;
  path: string;
}

export interface Dependency {
  name: string;
  version: string;
  required: boolean;
}

export interface DesignTokens {
  colors?: Record<string, string>;
  typography?: Record<string, any>;
  spacing?: Record<string, string>;
  shadows?: Record<string, string>;
  animations?: Record<string, any>;
  breakpoints?: Record<string, string>;
}

export interface BrowserSupport {
  name: string;
  minVersion: string;
}

export interface AccessibilityInfo {
  score: number; // 0-100
  wcagLevel: 'A' | 'AA' | 'AAA' | 'None';
  ariaCompliant: boolean;
  keyboardNavigable: boolean;
  screenReaderTested: boolean;
  colorContrastRatio?: number;
  issues: string[];
}

export interface PerformanceMetrics {
  bundleSize: number; // in bytes
  gzipSize: number;
  renderTime?: number; // in ms
  lighthouse?: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}

export interface ComponentFiles {
  main: string;
  styles?: string[];
  types?: string;
  tests?: string[];
  stories?: string;
  documentation: string;
  designTokens?: string;
  theme?: string;
  changelog?: string;
}

export interface ComponentAssets {
  screenshots: Screenshot[];
  icons?: string[];
  images?: string[];
  fonts?: string[];
  videos?: string[];
}

export interface Screenshot {
  path: string;
  type: 'desktop' | 'mobile' | 'tablet' | 'component';
  theme?: 'light' | 'dark';
  description?: string;
}

export interface ComponentExample {
  title: string;
  description?: string;
  code: string;
  language: string;
  framework?: string;
  preview?: string;
  props?: Record<string, any>;
}

export interface ComponentSearchQuery {
  query?: string;
  category?: ComponentCategory;
  type?: ComponentType;
  frameworks?: string[];
  tags?: string[];
  designSystem?: string;
  minQuality?: number;
  sortBy?: 'popularity' | 'quality' | 'recent' | 'name';
  limit?: number;
  offset?: number;
}

export interface ComponentLibraryStats {
  totalComponents: number;
  byCategory: Record<ComponentCategory, number>;
  byFramework: Record<string, number>;
  bySource: Record<string, number>;
  averageQuality: number;
  lastUpdated: Date;
}