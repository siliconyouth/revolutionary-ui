import { createLogger } from '@revolutionary-ui/cli-core';
import type { MarketplaceConfig, ComponentMetadata, SearchOptions, SearchResult, MarketplaceStats } from './types.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import os from 'os';

export class MarketplaceClient {
  private config: MarketplaceConfig;
  private logger = createLogger();
  private cacheDir: string;

  constructor(config?: Partial<MarketplaceConfig>) {
    this.config = {
      apiUrl: process.env.RUI_MARKETPLACE_API_URL || 'https://api.revolutionary-ui.com/v1',
      timeout: 30000,
      ...config,
    };

    this.cacheDir = this.config.cacheDir || join(os.homedir(), '.revolutionary-ui', 'cache');
  }

  async getComponent(id: string): Promise<ComponentMetadata | null> {
    try {
      const cached = await this.getCached<ComponentMetadata>(`component-${id}`);
      if (cached) return cached;

      const response = await this.fetch(`/components/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch component: ${response.statusText}`);
      }

      const component = await response.json() as ComponentMetadata;
      await this.setCached(`component-${id}`, component, 3600); // Cache for 1 hour
      return component;
    } catch (error) {
      this.logger.error('Failed to get component:', error);
      throw error;
    }
  }

  async searchComponents(options: SearchOptions = {}): Promise<SearchResult> {
    try {
      const params = new URLSearchParams();
      
      if (options.query) params.append('q', options.query);
      if (options.category) params.append('category', options.category);
      if (options.framework) params.append('framework', options.framework);
      if (options.tags?.length) params.append('tags', options.tags.join(','));
      if (options.sort) params.append('sort', options.sort);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.premium !== undefined) params.append('premium', options.premium.toString());

      const response = await this.fetch(`/components/search?${params}`);
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      return await response.json() as SearchResult;
    } catch (error) {
      this.logger.error('Search failed:', error);
      throw error;
    }
  }

  async getStats(): Promise<MarketplaceStats> {
    try {
      const cached = await this.getCached<MarketplaceStats>('stats');
      if (cached) return cached;

      const response = await this.fetch('/stats');
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const stats = await response.json() as MarketplaceStats;
      await this.setCached('stats', stats, 300); // Cache for 5 minutes
      return stats;
    } catch (error) {
      this.logger.error('Failed to get stats:', error);
      throw error;
    }
  }

  async downloadComponent(id: string, version?: string): Promise<Buffer> {
    try {
      const url = version ? `/components/${id}/download/${version}` : `/components/${id}/download`;
      const response = await this.fetch(url);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      this.logger.error('Download failed:', error);
      throw error;
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const cached = await this.getCached<string[]>('categories');
      if (cached) return cached;

      const response = await this.fetch('/categories');
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const categories = await response.json() as string[];
      await this.setCached('categories', categories, 3600); // Cache for 1 hour
      return categories;
    } catch (error) {
      this.logger.error('Failed to get categories:', error);
      throw error;
    }
  }

  async getFrameworks(): Promise<string[]> {
    try {
      const cached = await this.getCached<string[]>('frameworks');
      if (cached) return cached;

      const response = await this.fetch('/frameworks');
      if (!response.ok) {
        throw new Error(`Failed to fetch frameworks: ${response.statusText}`);
      }

      const frameworks = await response.json() as string[];
      await this.setCached('frameworks', frameworks, 3600); // Cache for 1 hour
      return frameworks;
    } catch (error) {
      this.logger.error('Failed to get frameworks:', error);
      throw error;
    }
  }

  private async fetch(path: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.config.apiUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Revolutionary-UI-CLI/1.0.0',
      ...options.headers as Record<string, string>,
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout!);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response;
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async getCached<T>(key: string): Promise<T | null> {
    try {
      const cacheFile = join(this.cacheDir, `${key}.json`);
      const stat = await fs.stat(cacheFile).catch(() => null);
      
      if (!stat) return null;

      const content = await fs.readFile(cacheFile, 'utf-8');
      const data = JSON.parse(content);

      // Check if cache is expired
      if (data.expires && Date.now() > data.expires) {
        await fs.unlink(cacheFile).catch(() => {});
        return null;
      }

      return data.value;
    } catch {
      return null;
    }
  }

  private async setCached<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      const cacheFile = join(this.cacheDir, `${key}.json`);
      const data = {
        value,
        expires: Date.now() + (ttl * 1000),
      };
      await fs.writeFile(cacheFile, JSON.stringify(data, null, 2));
    } catch (error) {
      this.logger.debug('Failed to cache data:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      await fs.rm(this.cacheDir, { recursive: true, force: true });
      this.logger.info('Cache cleared');
    } catch (error) {
      this.logger.error('Failed to clear cache:', error);
    }
  }
}