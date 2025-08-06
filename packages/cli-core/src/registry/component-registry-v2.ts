import { EventEmitter } from 'events';
import { 
  ComponentSchema, 
  RegistryIndex, 
  validateComponentSchema 
} from '../schemas/component-schema.js';
import { createLogger } from '../logger.js';
import { Cache } from '../cache/index.js';
import { HttpClient } from '../http/index.js';

export interface RegistryConfig {
  url: string;
  version?: string;
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}

export interface ComponentQuery {
  search?: string;
  type?: string;
  framework?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Enhanced Component Registry with schema support
 * Implements shadcn-style component distribution
 */
export class ComponentRegistryV2 extends EventEmitter {
  private logger = createLogger();
  private cache: Cache;
  private http: HttpClient;
  private config: RegistryConfig;
  
  constructor(config: RegistryConfig) {
    super();
    this.config = config;
    this.cache = new Cache({
      namespace: 'component-registry',
      ttl: config.cache?.ttl || 3600000, // 1 hour default
      enabled: config.cache?.enabled !== false,
    });
    this.http = new HttpClient({
      baseURL: config.url,
      timeout: 30000,
    });
  }

  /**
   * Fetch registry index
   */
  async fetchIndex(forceRefresh = false): Promise<RegistryIndex> {
    const cacheKey = 'registry-index';
    
    if (!forceRefresh) {
      const cached = await this.cache.get<RegistryIndex>(cacheKey);
      if (cached) {
        this.logger.debug('Using cached registry index');
        return cached;
      }
    }

    try {
      this.emit('fetch:start', { type: 'index' });
      
      const response = await this.http.get<RegistryIndex>('/index.json');
      const index = response.data;
      
      // Cache the index
      await this.cache.set(cacheKey, index);
      
      this.emit('fetch:complete', { type: 'index', count: index.components.length });
      return index;
      
    } catch (error) {
      this.emit('fetch:error', { type: 'index', error });
      throw error;
    }
  }

  /**
   * Fetch a specific component schema
   */
  async fetchComponent(name: string): Promise<ComponentSchema> {
    const cacheKey = `component:${name}`;
    
    const cached = await this.cache.get<ComponentSchema>(cacheKey);
    if (cached) {
      this.logger.debug(`Using cached component: ${name}`);
      return cached;
    }

    try {
      this.emit('fetch:start', { type: 'component', name });
      
      const response = await this.http.get<any>(`/components/${name}.json`);
      const component = validateComponentSchema(response.data);
      
      // Cache the component
      await this.cache.set(cacheKey, component);
      
      this.emit('fetch:complete', { type: 'component', name });
      return component;
      
    } catch (error) {
      this.emit('fetch:error', { type: 'component', name, error });
      throw error;
    }
  }

  /**
   * Search components
   */
  async searchComponents(query: ComponentQuery): Promise<ComponentSchema[]> {
    const index = await this.fetchIndex();
    let results = [...index.components];

    // Filter by search term
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(comp => 
        comp.name.toLowerCase().includes(searchLower) ||
        comp.description.toLowerCase().includes(searchLower) ||
        comp.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Filter by type
    if (query.type) {
      results = results.filter(comp => comp.type === query.type);
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter(comp => 
        query.tags!.some(tag => comp.tags?.includes(tag))
      );
    }

    // Apply pagination
    const start = query.offset || 0;
    const limit = query.limit || 20;
    const paginated = results.slice(start, start + limit);

    // Fetch full component schemas
    const components = await Promise.all(
      paginated.map(comp => this.fetchComponent(comp.name))
    );

    return components;
  }

  /**
   * Resolve component dependencies
   */
  async resolveDependencies(componentNames: string[]): Promise<Map<string, ComponentSchema>> {
    const resolved = new Map<string, ComponentSchema>();
    const queue = [...componentNames];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const name = queue.shift()!;
      
      if (visited.has(name)) continue;
      visited.add(name);

      try {
        const component = await this.fetchComponent(name);
        resolved.set(name, component);

        // Add registry dependencies to queue
        if (component.registryDependencies) {
          for (const dep of component.registryDependencies) {
            if (!visited.has(dep)) {
              queue.push(dep);
            }
          }
        }
      } catch (error) {
        this.logger.error(`Failed to resolve dependency: ${name}`);
        throw error;
      }
    }

    return resolved;
  }

  /**
   * Get components by type
   */
  async getComponentsByType(type: string): Promise<ComponentSchema[]> {
    const index = await this.fetchIndex();
    const filtered = index.components.filter(comp => comp.type === type);
    
    return Promise.all(
      filtered.map(comp => this.fetchComponent(comp.name))
    );
  }

  /**
   * Get component stats
   */
  async getStats(): Promise<{
    totalComponents: number;
    byType: Record<string, number>;
    byFramework: Record<string, number>;
    popularTags: Array<{ tag: string; count: number }>;
  }> {
    const index = await this.fetchIndex();
    
    const byType: Record<string, number> = {};
    const byFramework: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    for (const comp of index.components) {
      // Count by type
      byType[comp.type] = (byType[comp.type] || 0) + 1;

      // Count tags
      if (comp.tags) {
        for (const tag of comp.tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }
    }

    // Get popular tags
    const popularTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalComponents: index.components.length,
      byType,
      byFramework,
      popularTags,
    };
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
    this.logger.info('Registry cache cleared');
  }

  /**
   * Validate component compatibility
   */
  async validateCompatibility(
    component: ComponentSchema,
    projectConfig: any
  ): Promise<{ compatible: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check framework compatibility
    if (component.framework && projectConfig.framework) {
      const componentFrameworks = Object.keys(component.framework);
      if (!componentFrameworks.includes(projectConfig.framework)) {
        issues.push(`Component requires one of: ${componentFrameworks.join(', ')}`);
      }
    }

    // Check TypeScript compatibility
    if (component.framework?.react?.typescript && !projectConfig.typescript) {
      issues.push('Component requires TypeScript');
    }

    // Check style system compatibility
    if (component.style?.tailwind && !projectConfig.tailwind) {
      issues.push('Component requires Tailwind CSS');
    }

    return {
      compatible: issues.length === 0,
      issues,
    };
  }

  /**
   * Export component for sharing
   */
  async exportComponent(name: string): Promise<string> {
    const component = await this.fetchComponent(name);
    
    // Include all dependencies
    const deps = await this.resolveDependencies([name]);
    
    const exportData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      component,
      dependencies: Array.from(deps.values()).filter(c => c.name !== name),
    };

    return JSON.stringify(exportData, null, 2);
  }
}