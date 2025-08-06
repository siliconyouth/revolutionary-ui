import { createLogger } from '../utils/logger.js';
import { httpClient } from '../utils/http-client.js';
import type { CLIConfig } from '../types/index.js';
import { errors } from '../errors/index.js';
import { z } from 'zod';
import { join } from 'path';
import { homedir } from 'os';
import { readJson, writeJson, fileExists, ensureDir } from '../utils/fs.js';

// Component schema
const ComponentSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  category: z.string(),
  framework: z.array(z.string()),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
    type: z.enum(['component', 'style', 'test', 'story', 'doc']).optional(),
  })),
  metadata: z.object({
    author: z.string().optional(),
    license: z.string().optional(),
    repository: z.string().optional(),
    homepage: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    size: z.number().optional(),
    downloads: z.number().optional(),
    rating: z.number().optional(),
  }).optional(),
  config: z.object({
    paths: z.object({
      components: z.string().optional(),
      styles: z.string().optional(),
      utils: z.string().optional(),
    }).optional(),
    aliases: z.record(z.string()).optional(),
  }).optional(),
});

export type Component = z.infer<typeof ComponentSchema>;

// Registry response schema
const RegistryResponseSchema = z.object({
  version: z.string(),
  components: z.record(ComponentSchema),
  categories: z.array(z.object({
    name: z.string(),
    description: z.string(),
    count: z.number(),
  })).optional(),
});

export type RegistryResponse = z.infer<typeof RegistryResponseSchema>;

export interface ComponentQuery {
  name?: string;
  category?: string;
  framework?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class ComponentRegistry {
  private config: CLIConfig;
  private logger = createLogger();
  private cacheDir: string;
  private cacheFile: string;
  private cacheTTL = 3600000; // 1 hour

  constructor(config: CLIConfig) {
    this.config = config;
    this.cacheDir = join(homedir(), '.revolutionary-ui', 'cache');
    this.cacheFile = join(this.cacheDir, 'registry.json');
  }

  /**
   * Get the registry URL from config or use default
   */
  private getRegistryUrl(): string {
    return this.config.registry?.url || 'https://api.revolutionary-ui.com/registry';
  }

  /**
   * Fetch the full registry
   */
  async fetchRegistry(forceRefresh = false): Promise<RegistryResponse> {
    // Check cache first
    if (!forceRefresh) {
      const cached = await this.getCachedRegistry();
      if (cached) {
        this.logger.debug('Using cached registry');
        return cached;
      }
    }

    try {
      this.logger.debug('Fetching registry from server');
      const response = await httpClient.get(this.getRegistryUrl());
      
      // Validate response
      const registry = RegistryResponseSchema.parse(response.data);
      
      // Cache the registry
      await this.cacheRegistry(registry);
      
      return registry;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw errors.auth.notAuthenticated();
      }
      if (error.response?.status === 403) {
        throw errors.auth.sessionExpired();
      }
      throw errors.network.connectionFailed(this.getRegistryUrl());
    }
  }

  /**
   * Search components in the registry
   */
  async searchComponents(query: ComponentQuery): Promise<Component[]> {
    const registry = await this.fetchRegistry();
    let components = Object.values(registry.components);

    // Filter by name
    if (query.name) {
      components = components.filter(c => 
        c.name.toLowerCase().includes(query.name!.toLowerCase())
      );
    }

    // Filter by category
    if (query.category) {
      components = components.filter(c => 
        c.category.toLowerCase() === query.category!.toLowerCase()
      );
    }

    // Filter by framework
    if (query.framework) {
      components = components.filter(c => 
        c.framework.includes(query.framework!)
      );
    }

    // Search in name and description
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      components = components.filter(c => 
        c.name.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    if (query.offset) {
      components = components.slice(query.offset);
    }
    if (query.limit) {
      components = components.slice(0, query.limit);
    }

    return components;
  }

  /**
   * Get a specific component by name
   */
  async getComponent(name: string): Promise<Component> {
    const registry = await this.fetchRegistry();
    const component = registry.components[name];
    
    if (!component) {
      throw errors.component.notFound(name);
    }
    
    return component;
  }

  /**
   * Get components by category
   */
  async getComponentsByCategory(category: string): Promise<Component[]> {
    return this.searchComponents({ category });
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Array<{ name: string; description: string; count: number }>> {
    const registry = await this.fetchRegistry();
    
    if (registry.categories) {
      return registry.categories;
    }

    // Calculate categories from components if not provided
    const categoryMap = new Map<string, number>();
    
    Object.values(registry.components).forEach(component => {
      const count = categoryMap.get(component.category) || 0;
      categoryMap.set(component.category, count + 1);
    });

    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      description: name,
      count,
    }));
  }

  /**
   * Resolve component dependencies
   */
  async resolveDependencies(componentNames: string[]): Promise<string[]> {
    const registry = await this.fetchRegistry();
    const resolved = new Set<string>();
    const queue = [...componentNames];

    while (queue.length > 0) {
      const name = queue.shift()!;
      
      if (resolved.has(name)) {
        continue;
      }

      const component = registry.components[name];
      if (!component) {
        throw errors.component.notFound(name);
      }

      resolved.add(name);

      // Add dependencies to queue
      if (component.dependencies) {
        component.dependencies.forEach(dep => {
          if (!resolved.has(dep)) {
            queue.push(dep);
          }
        });
      }
    }

    // Return in topological order (dependencies first)
    return Array.from(resolved).reverse();
  }

  /**
   * Get cached registry if available and not expired
   */
  private async getCachedRegistry(): Promise<RegistryResponse | null> {
    try {
      if (!await fileExists(this.cacheFile)) {
        return null;
      }

      const cached = await readJson(this.cacheFile) as any;
      const now = Date.now();
      
      if (cached.timestamp && (now - cached.timestamp) < this.cacheTTL) {
        return cached.data;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Cache the registry data
   */
  private async cacheRegistry(registry: RegistryResponse): Promise<void> {
    try {
      await ensureDir(this.cacheDir);
      await writeJson(this.cacheFile, {
        timestamp: Date.now(),
        data: registry,
      });
    } catch (error) {
      this.logger.debug('Failed to cache registry:', error);
    }
  }

  /**
   * Clear the registry cache
   */
  async clearCache(): Promise<void> {
    try {
      const { unlink } = await import('fs/promises');
      await unlink(this.cacheFile);
      this.logger.debug('Registry cache cleared');
    } catch {
      // Ignore if file doesn't exist
    }
  }

  /**
   * Validate component files before installation
   */
  validateComponent(component: Component): void {
    // Validate required fields
    if (!component.name || !component.files || component.files.length === 0) {
      throw errors.component.invalid(component.name || 'unknown', 'Component must have name and files');
    }

    // Validate file paths
    component.files.forEach(file => {
      if (!file.path || !file.content) {
        throw errors.component.invalid(component.name, 'Component files must have path and content');
      }
      
      // Ensure paths are relative and safe
      if (file.path.startsWith('/') || file.path.includes('..')) {
        throw errors.component.invalid(component.name, 'Component file paths must be relative and safe');
      }
    });
  }

  /**
   * Get component stats
   */
  async getStats(): Promise<{
    totalComponents: number;
    totalCategories: number;
    popularComponents: Component[];
    recentComponents: Component[];
  }> {
    const registry = await this.fetchRegistry();
    const components = Object.values(registry.components);
    
    return {
      totalComponents: components.length,
      totalCategories: new Set(components.map(c => c.category)).size,
      popularComponents: components
        .sort((a, b) => (b.metadata?.downloads || 0) - (a.metadata?.downloads || 0))
        .slice(0, 10),
      recentComponents: components
        .slice(-10)
        .reverse(),
    };
  }
}