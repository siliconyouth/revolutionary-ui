import { ComponentRegistry, type Component } from './component-registry.js';
import { createLogger } from '../utils/logger.js';
import { httpClient } from '../utils/http-client.js';
import type { CLIConfig } from '../types/index.js';
import { errors } from '../errors/index.js';
import { withSpinner } from '../utils/spinner.js';
import { EventEmitter } from 'events';

export interface RegistryClientOptions {
  config: CLIConfig;
  onProgress?: (event: ProgressEvent) => void;
}

export interface ProgressEvent {
  type: 'download' | 'upload' | 'process';
  current: number;
  total: number;
  component?: string;
  message?: string;
}

export interface ComponentVersion {
  version: string;
  releaseDate: string;
  changelog?: string;
  breaking?: boolean;
}

export interface ComponentDetails extends Component {
  versions: ComponentVersion[];
  readme?: string;
  examples?: Array<{
    title: string;
    code: string;
    language: string;
  }>;
  screenshots?: string[];
  metrics?: {
    installs: number;
    stars: number;
    issues: number;
    lastUpdate: string;
  };
}

export class RegistryClient extends EventEmitter {
  private registry: ComponentRegistry;
  private config: CLIConfig;
  private logger = createLogger();
  private authToken?: string;

  constructor(options: RegistryClientOptions) {
    super();
    this.config = options.config;
    this.registry = new ComponentRegistry(options.config);
    
    if (options.onProgress) {
      this.on('progress', options.onProgress);
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Get detailed component information
   */
  async getComponentDetails(name: string, version?: string): Promise<ComponentDetails> {
    try {
      const url = this.buildUrl(`/components/${name}`, { version });
      const response = await httpClient.get(url);
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw errors.component.notFound(name);
      }
      throw error;
    }
  }

  /**
   * Publish a component to the registry
   */
  async publishComponent(component: Component): Promise<void> {
    if (!this.authToken) {
      throw errors.auth.notAuthenticated();
    }

    // Validate component
    this.registry.validateComponent(component);

    try {
      await withSpinner(
        `Publishing ${component.name}@${component.version}...`,
        async () => {
          // Upload component files
          const formData = new FormData();
          formData.append('metadata', JSON.stringify({
            name: component.name,
            version: component.version,
            description: component.description,
            category: component.category,
            framework: component.framework,
            dependencies: component.dependencies,
            devDependencies: component.devDependencies,
            metadata: component.metadata,
            config: component.config,
          }));

          // Add files
          component.files.forEach((file, index) => {
            formData.append(`file-${index}`, JSON.stringify(file));
          });

          const response = await httpClient.post('/components', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                this.emit('progress', {
                  type: 'upload',
                  current: progressEvent.loaded,
                  total: progressEvent.total,
                  component: component.name,
                });
              }
            },
          });

          return response.data;
        }
      );

      this.logger.success(`Successfully published ${component.name}@${component.version}`);
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw errors.component.alreadyExists(component.name, component.version);
      }
      throw error;
    }
  }

  /**
   * Download a component from the registry
   */
  async downloadComponent(name: string, version?: string): Promise<Component> {
    try {
      const component = await withSpinner(
        `Downloading ${name}${version ? `@${version}` : ''}...`,
        async () => {
          const url = this.buildUrl(`/components/${name}/download`, { version });
          const response = await httpClient.get(url, {
            onDownloadProgress: (progressEvent) => {
              if (progressEvent.total) {
                this.emit('progress', {
                  type: 'download',
                  current: progressEvent.loaded,
                  total: progressEvent.total,
                  component: name,
                });
              }
            },
          });

          return response.data;
        }
      );

      // Track download
      this.trackDownload(name, version);

      return component;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw errors.component.notFound(name);
      }
      throw error;
    }
  }

  /**
   * Get component versions
   */
  async getComponentVersions(name: string): Promise<ComponentVersion[]> {
    try {
      const url = this.buildUrl(`/components/${name}/versions`);
      const response = await httpClient.get(url);
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw errors.component.notFound(name);
      }
      throw error;
    }
  }

  /**
   * Search components with advanced filters
   */
  async searchAdvanced(params: {
    query?: string;
    frameworks?: string[];
    categories?: string[];
    tags?: string[];
    author?: string;
    minRating?: number;
    sortBy?: 'downloads' | 'rating' | 'updated' | 'name';
    order?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<{
    components: Component[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const url = this.buildUrl('/components/search', params);
      const response = await httpClient.get(url);
      
      return response.data;
    } catch (error: any) {
      throw errors.network.connectionFailed('/components/search');
    }
  }

  /**
   * Get trending components
   */
  async getTrending(period: 'day' | 'week' | 'month' = 'week'): Promise<Component[]> {
    try {
      const url = this.buildUrl('/components/trending', { period });
      const response = await httpClient.get(url);
      
      return response.data;
    } catch (error: any) {
      throw errors.network.connectionFailed('/components/trending');
    }
  }

  /**
   * Get component recommendations based on project
   */
  async getRecommendations(params: {
    frameworks?: string[];
    installedComponents?: string[];
    projectType?: string;
  }): Promise<Component[]> {
    try {
      const url = this.buildUrl('/components/recommendations', params);
      const response = await httpClient.get(url);
      
      return response.data;
    } catch (error: any) {
      return []; // Fallback to empty recommendations
    }
  }

  /**
   * Report an issue with a component
   */
  async reportIssue(name: string, issue: {
    type: 'bug' | 'security' | 'quality' | 'other';
    description: string;
    version?: string;
  }): Promise<void> {
    if (!this.authToken) {
      throw errors.auth.notAuthenticated();
    }

    try {
      await httpClient.post(`/components/${name}/issues`, issue);
      this.logger.success('Issue reported successfully');
    } catch (error: any) {
      throw errors.network.apiError(error.response?.status || 500, 'Failed to report issue');
    }
  }

  /**
   * Rate a component
   */
  async rateComponent(name: string, rating: number, review?: string): Promise<void> {
    if (!this.authToken) {
      throw errors.auth.notAuthenticated();
    }

    if (rating < 1 || rating > 5) {
      throw errors.component.invalid(name, 'Rating must be between 1 and 5');
    }

    try {
      await httpClient.post(`/components/${name}/rate`, {
        rating,
        review,
      });
      this.logger.success('Rating submitted successfully');
    } catch (error: any) {
      throw errors.network.apiError(error.response?.status || 500, 'Failed to submit rating');
    }
  }

  /**
   * Track component download
   */
  private async trackDownload(name: string, version?: string): Promise<void> {
    try {
      // Fire and forget
      httpClient.post('/analytics/download', {
        component: name,
        version,
        timestamp: new Date().toISOString(),
      }).catch(() => {
        // Ignore tracking errors
      });
    } catch {
      // Ignore tracking errors
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(path: string, params?: Record<string, any>): string {
    const baseUrl = this.config.registry?.url || 'https://api.revolutionary-ui.com';
    const url = new URL(path, baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => url.searchParams.append(key, v));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }
    
    return url.toString();
  }
}