// Type declarations for Terminal UI components

export interface TerminalUIConfig {
  theme?: 'cyan' | 'green' | 'blue' | 'magenta' | 'yellow';
  defaultFramework?: string;
  aiProvider?: string;
}

export interface ComponentConfig {
  name: string;
  framework: string;
  type: string;
  features?: string[];
  typescript?: boolean;
}

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  downloads: number;
  rating: number;
  tags: string[];
  author?: string;
  lastUpdated?: Date;
}

export interface GenerationResult {
  success: boolean;
  component?: {
    name: string;
    code: string;
    filePath: string;
  };
  error?: string;
}

export interface AnalyticsData {
  componentsGenerated: number;
  linesOfCodeSaved: number;
  timeSaved: number; // in hours
  mostUsedFramework: string;
  recentComponents: Array<{
    name: string;
    date: Date;
    framework: string;
  }>;
}

export interface ViewState {
  currentView: 'menu' | 'generate' | 'catalog' | 'ai' | 'settings' | 'analytics';
  menuIndex: number;
  selectedItem?: any;
  loading: boolean;
  error?: string;
}

export interface TerminalUIProps {
  screen: any; // blessed screen instance
  config?: TerminalUIConfig;
}

export interface TerminalUIState extends ViewState {
  logs: string[];
  generationConfig: ComponentConfig;
  catalogItems: CatalogItem[];
  settings: TerminalUIConfig;
  analytics?: AnalyticsData;
}