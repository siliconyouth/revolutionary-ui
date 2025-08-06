/**
 * Upstash Vector Service
 * Serverless vector database for semantic search
 */

import { Index } from '@upstash/vector';
import crypto from 'crypto';
import { cache, CacheManager } from './cache-manager';

export interface VectorMetadata {
  resourceId: string;
  name: string;
  description?: string;
  framework?: string;
  category?: string;
  tags?: string[];
  contentHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchOptions {
  limit?: number;
  threshold?: number;
  useCache?: boolean;
  filters?: {
    framework?: string;
    category?: string;
    tags?: string[];
  };
}

export class UpstashVectorService {
  private index: Index<VectorMetadata>;
  private static instance: UpstashVectorService;
  private namespace: string = 'revolutionary-ui-components';

  private constructor(namespace?: string) {
    // Initialize Upstash Vector index with optional namespace
    this.namespace = namespace || process.env.UPSTASH_VECTOR_NAMESPACE || 'revolutionary-ui-components';
    
    this.index = new Index<VectorMetadata>({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
      namespace: this.namespace,
    });
  }

  static getInstance(namespace?: string): UpstashVectorService {
    if (!UpstashVectorService.instance || 
        (namespace && namespace !== UpstashVectorService.instance.namespace)) {
      UpstashVectorService.instance = new UpstashVectorService(namespace);
    }
    return UpstashVectorService.instance;
  }

  getNamespace(): string {
    return this.namespace;
  }

  /**
   * Create searchable text from component data
   */
  private createSearchableText(metadata: Partial<VectorMetadata>): string {
    const parts = [
      metadata.name || '',
      metadata.description || '',
      metadata.framework ? `Framework: ${metadata.framework}` : '',
      metadata.category ? `Category: ${metadata.category}` : '',
      metadata.tags ? `Tags: ${metadata.tags.join(', ')}` : '',
    ];

    return parts.filter(Boolean).join(' | ');
  }

  /**
   * Generate content hash for caching
   */
  private generateContentHash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Upsert a resource embedding
   */
  async upsertResource(
    resourceId: string,
    metadata: Omit<VectorMetadata, 'resourceId' | 'contentHash' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    const searchableText = this.createSearchableText(metadata);
    const contentHash = this.generateContentHash(searchableText);

    const vectorMetadata: VectorMetadata = {
      resourceId,
      ...metadata,
      contentHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Upstash will handle embedding generation automatically
      await this.index.upsert({
        id: resourceId,
        data: searchableText,
        metadata: vectorMetadata,
      });
    } catch (error) {
      console.error('Failed to upsert resource:', error);
      throw new Error('Failed to upsert resource to Upstash Vector');
    }
  }

  /**
   * Batch upsert multiple resources
   */
  async batchUpsertResources(
    resources: Array<{
      id: string;
      metadata: Omit<VectorMetadata, 'resourceId' | 'contentHash' | 'createdAt' | 'updatedAt'>;
    }>
  ): Promise<void> {
    const vectors = resources.map(resource => {
      const searchableText = this.createSearchableText(resource.metadata);
      const contentHash = this.generateContentHash(searchableText);

      const vectorMetadata: VectorMetadata = {
        resourceId: resource.id,
        ...resource.metadata,
        contentHash,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        id: resource.id,
        data: searchableText,
        metadata: vectorMetadata,
      };
    });

    try {
      // Batch upsert with automatic embedding generation
      await this.index.upsert(vectors);
    } catch (error) {
      console.error('Failed to batch upsert resources:', error);
      throw new Error('Failed to batch upsert resources to Upstash Vector');
    }
  }

  /**
   * Search for similar components using natural language
   */
  async searchSimilar(query: string, options: SearchOptions = {}): Promise<any[]> {
    const { limit = 10, filters, useCache = true } = options;

    // Generate cache key
    const cacheKey = CacheManager.keys.vectorSearch(query, limit) + 
      (filters ? `:${JSON.stringify(filters)}` : '');
    
    // Check cache
    if (useCache) {
      const cached = await cache.get<any[]>(cacheKey);
      if (cached) {
        console.log('🎯 Using cached vector search results');
        return cached;
      }
    }

    try {
      // Build filter string if filters are provided
      let filter: string | undefined;
      const filterConditions: string[] = [];

      if (filters?.framework) {
        filterConditions.push(`framework = "${filters.framework}"`);
      }

      if (filters?.category) {
        filterConditions.push(`category = "${filters.category}"`);
      }

      if (filters?.tags && filters.tags.length > 0) {
        // Upstash supports array contains operations
        const tagFilters = filters.tags.map(tag => `"${tag}" in tags`).join(' OR ');
        filterConditions.push(`(${tagFilters})`);
      }

      if (filterConditions.length > 0) {
        filter = filterConditions.join(' AND ');
      }

      // Query with natural language
      const results = await this.index.query({
        data: query,
        topK: limit,
        includeMetadata: true,
        filter,
      });

      // Map results to expected format
      const mappedResults = results.map(result => ({
        id: result.id,
        score: result.score,
        metadata: result.metadata,
      }));

      // Cache results
      if (useCache) {
        const ttl = parseInt(process.env.VECTOR_CACHE_TTL || '300'); // 5 minutes default
        await cache.set(cacheKey, mappedResults, ttl);
      }

      return mappedResults;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search in Upstash Vector');
    }
  }

  /**
   * Find similar components to a given resource
   */
  async findSimilarComponents(resourceId: string, limit: number = 5): Promise<any[]> {
    try {
      // Fetch the resource to get its embedding
      const resource = await this.index.fetch([resourceId], {
        includeMetadata: true,
      });

      if (!resource || resource.length === 0) {
        return [];
      }

      // Query similar vectors, excluding the original
      const results = await this.index.query({
        vector: resource[0].vector,
        topK: limit + 1, // Get one extra to exclude self
        includeMetadata: true,
      });

      // Filter out the original resource and return
      return results
        .filter(result => result.id !== resourceId)
        .slice(0, limit)
        .map(result => ({
          id: result.id,
          score: result.score,
          metadata: result.metadata,
        }));
    } catch (error) {
      console.error('Find similar error:', error);
      throw new Error('Failed to find similar components');
    }
  }

  /**
   * Delete a resource from the index
   */
  async deleteResource(resourceId: string): Promise<void> {
    try {
      await this.index.delete(resourceId);
    } catch (error) {
      console.error('Delete error:', error);
      throw new Error('Failed to delete resource from Upstash Vector');
    }
  }

  /**
   * Get index statistics
   */
  async getStats(): Promise<any> {
    try {
      const info = await this.index.info();
      return {
        vectorCount: info.vectorCount,
        pendingVectorCount: info.pendingVectorCount,
        indexSize: info.indexSize,
        dimension: info.dimension,
      };
    } catch (error) {
      console.error('Stats error:', error);
      throw new Error('Failed to get index statistics');
    }
  }

  /**
   * Reset the entire index (use with caution!)
   */
  async reset(): Promise<void> {
    try {
      await this.index.reset();
    } catch (error) {
      console.error('Reset error:', error);
      throw new Error('Failed to reset Upstash Vector index');
    }
  }
}