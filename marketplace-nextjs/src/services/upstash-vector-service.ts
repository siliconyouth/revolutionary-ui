/**
 * Upstash Vector Service for Next.js
 * Handles semantic search with Upstash Vector
 */

import { Index } from '@upstash/vector';
import prisma from '@/lib/prisma';

export interface VectorMetadata {
  resourceId: string;
  name: string;
  description?: string;
  framework?: string;
  category?: string;
  tags?: string[];
}

export interface SearchResult {
  id: string;
  score: number;
  resource?: any;
}

export class UpstashVectorService {
  private index: Index<VectorMetadata>;
  private static instance: UpstashVectorService;
  private namespace: string = 'revolutionary-ui-components';

  private constructor() {
    // Initialize Upstash Vector index with namespace
    this.namespace = process.env.UPSTASH_VECTOR_NAMESPACE || 'revolutionary-ui-components';
    
    this.index = new Index<VectorMetadata>({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
      namespace: this.namespace,
    });
  }

  static getInstance(): UpstashVectorService {
    if (!UpstashVectorService.instance) {
      UpstashVectorService.instance = new UpstashVectorService();
    }
    return UpstashVectorService.instance;
  }

  /**
   * Search for similar components
   */
  async searchSimilar(
    query: string,
    options: {
      limit?: number;
      filters?: {
        framework?: string;
        category?: string;
        tags?: string[];
      };
    } = {}
  ): Promise<SearchResult[]> {
    const { limit = 10, filters } = options;

    try {
      // Build filter string
      let filter: string | undefined;
      const filterConditions: string[] = [];

      if (filters?.framework) {
        filterConditions.push(`framework = "${filters.framework}"`);
      }

      if (filters?.category) {
        filterConditions.push(`category = "${filters.category}"`);
      }

      if (filters?.tags && filters.tags.length > 0) {
        const tagFilters = filters.tags.map(tag => `"${tag}" in tags`).join(' OR ');
        filterConditions.push(`(${tagFilters})`);
      }

      if (filterConditions.length > 0) {
        filter = filterConditions.join(' AND ');
      }

      // Query Upstash Vector
      const results = await this.index.query({
        data: query,
        topK: limit,
        includeMetadata: true,
        filter,
      });

      // Load full resource data from database
      const resourceIds = results.map(r => r.id);
      const resources = await prisma.resource.findMany({
        where: { id: { in: resourceIds } },
        include: {
          category: true,
          tags: true,
          author: true,
          _count: {
            select: {
              downloads: true,
              reviews: true,
            },
          },
        },
      });

      // Map results with scores
      const resourceMap = new Map(resources.map(r => [r.id, r]));
      
      return results.map(result => ({
        id: result.id,
        score: result.score,
        resource: resourceMap.get(result.id),
      }));
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Find similar components to a given component
   */
  async findSimilarComponents(
    resourceId: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    try {
      // Fetch the resource vector
      const resource = await this.index.fetch([resourceId], {
        includeMetadata: true,
      });

      if (!resource || resource.length === 0) {
        return [];
      }

      // Query similar vectors
      const results = await this.index.query({
        vector: resource[0].vector,
        topK: limit + 1,
        includeMetadata: true,
      });

      // Filter out the original resource
      const similarResults = results
        .filter(result => result.id !== resourceId)
        .slice(0, limit);

      // Load full resource data
      const resourceIds = similarResults.map(r => r.id);
      const resources = await prisma.resource.findMany({
        where: { id: { in: resourceIds } },
        include: {
          category: true,
          tags: true,
          author: true,
          _count: {
            select: {
              downloads: true,
              reviews: true,
            },
          },
        },
      });

      const resourceMap = new Map(resources.map(r => [r.id, r]));
      
      return similarResults.map(result => ({
        id: result.id,
        score: result.score,
        resource: resourceMap.get(result.id),
      }));
    } catch (error) {
      console.error('Similar components error:', error);
      throw error;
    }
  }

  /**
   * Get popular searches (mock for now)
   */
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    // Return mock popular searches
    // In production, you might track these in a separate database
    return [
      'data table',
      'dashboard',
      'form validation',
      'react components',
      'chart library',
      'authentication',
      'responsive design',
      'dark mode',
      'modal dialog',
      'navigation menu',
    ].slice(0, limit);
  }
}