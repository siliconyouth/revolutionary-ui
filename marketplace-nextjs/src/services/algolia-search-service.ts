/**
 * Algolia Search Service for Next.js
 * 
 * Unified search service that combines:
 * - Algolia for fast full-text search
 * - Upstash Vector for semantic search
 * - Upstash Redis for caching
 * - Prisma/Supabase for data fetching
 * - Documentation search capabilities
 */

import { algoliasearch } from 'algoliasearch';
import type { Algoliasearch } from 'algoliasearch';
import { PrismaClient } from '@prisma/client';
import { cache, CacheManager } from './cache-manager';
import { UpstashVectorService } from './upstash-vector-service';

export interface SearchOptions {
  query: string;
  type?: 'all' | 'components' | 'docs' | 'resources';
  filters?: {
    framework?: string;
    category?: string;
    tags?: string[];
    isFree?: boolean;
    isPremium?: boolean;
    hasTypescript?: boolean;
  };
  limit?: number;
  page?: number;
  useCache?: boolean;
  searchMode?: 'keyword' | 'semantic' | 'hybrid';
}

export interface SearchResult {
  id: string;
  type: 'component' | 'documentation' | 'resource';
  title: string;
  description: string;
  url?: string;
  framework?: string;
  category?: string;
  tags?: string[];
  score: number;
  highlights?: {
    title?: string;
    description?: string;
    content?: string;
  };
  metadata?: any;
}

export interface SearchResponse {
  results: SearchResult[];
  totalResults: number;
  page: number;
  totalPages: number;
  processingTime: number;
  searchMode: string;
}

export class AlgoliaSearchService {
  private client: Algoliasearch;
  private vectorService: UpstashVectorService;
  private prisma: PrismaClient;
  private static instance: AlgoliaSearchService;

  private constructor() {
    // Initialize Algolia client
    this.client = algoliasearch(
      process.env.ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    );

    // Initialize other services
    this.vectorService = UpstashVectorService.getInstance();
    this.prisma = new PrismaClient();
  }

  static getInstance(): AlgoliaSearchService {
    if (!AlgoliaSearchService.instance) {
      AlgoliaSearchService.instance = new AlgoliaSearchService();
    }
    return AlgoliaSearchService.instance;
  }

  /**
   * Unified search across all indices
   */
  async search(options: SearchOptions): Promise<SearchResponse> {
    const startTime = Date.now();
    const {
      query,
      type = 'all',
      filters = {},
      limit = 20,
      page = 0,
      useCache = true,
      searchMode = 'hybrid',
    } = options;

    // Generate cache key
    const cacheKey = `algolia:search:${CacheManager.keys.search(query, { type, filters, page, searchMode })}`;

    // Check cache
    if (useCache) {
      const cached = await cache.get<SearchResponse>(cacheKey);
      if (cached) {
        console.log('🎯 Using cached Algolia search results');
        return {
          ...cached,
          processingTime: Date.now() - startTime,
        };
      }
    }

    try {
      let results: SearchResult[] = [];
      let totalResults = 0;

      switch (searchMode) {
        case 'keyword':
          // Pure Algolia keyword search
          const keywordResults = await this.keywordSearch(query, type, filters, limit, page);
          results = keywordResults.results;
          totalResults = keywordResults.totalResults;
          break;

        case 'semantic':
          // Pure vector semantic search
          const semanticResults = await this.semanticSearch(query, type, filters, limit);
          results = semanticResults.results;
          totalResults = semanticResults.totalResults;
          break;

        case 'hybrid':
        default:
          // Hybrid search combining both
          const hybridResults = await this.hybridSearch(query, type, filters, limit, page);
          results = hybridResults.results;
          totalResults = hybridResults.totalResults;
          break;
      }

      const response: SearchResponse = {
        results,
        totalResults,
        page,
        totalPages: Math.ceil(totalResults / limit),
        processingTime: Date.now() - startTime,
        searchMode,
      };

      // Cache results
      if (useCache) {
        const ttl = parseInt(process.env.SEARCH_CACHE_TTL || '300'); // 5 minutes default
        await cache.set(cacheKey, response, ttl);
      }

      return response;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Search failed');
    }
  }

  /**
   * Keyword search using Algolia
   */
  private async keywordSearch(
    query: string,
    type: string,
    filters: any,
    limit: number,
    page: number
  ): Promise<{ results: SearchResult[]; totalResults: number }> {
    const searchPromises = [];
    
    // Build Algolia filters
    const algoliaFilters = this.buildAlgoliaFilters(filters);

    if (type === 'all' || type === 'components') {
      searchPromises.push(
        this.client.searchSingleIndex({
          indexName: 'revolutionary_ui_components',
          searchParams: {
            query,
            filters: algoliaFilters,
            hitsPerPage: limit,
            page,
          },
        })
      );
    }

    if (type === 'all' || type === 'docs') {
      searchPromises.push(
        this.client.searchSingleIndex({
          indexName: 'revolutionary_ui_docs',
          searchParams: {
            query,
            hitsPerPage: limit,
            page,
          },
        })
      );
    }

    if (type === 'all' || type === 'resources') {
      searchPromises.push(
        this.client.searchSingleIndex({
          indexName: 'revolutionary_ui_resources',
          searchParams: {
            query,
            filters: algoliaFilters,
            hitsPerPage: limit,
            page,
          },
        })
      );
    }

    const searchResults = await Promise.all(searchPromises);
    
    // Combine and format results
    const results: SearchResult[] = [];
    let totalResults = 0;

    searchResults.forEach((result, index) => {
      totalResults += result.nbHits;
      
      result.hits.forEach((hit: any) => {
        results.push({
          id: hit.objectID,
          type: this.getResultType(index, type),
          title: hit.name || hit.title,
          description: hit.description || hit.content?.substring(0, 200),
          url: hit.url || hit.demoUrl,
          framework: hit.framework,
          category: hit.category,
          tags: hit.tags,
          score: hit._rankingInfo?.matchedGeoLocation?.distance || 1,
          highlights: {
            title: hit._highlightResult?.name?.value || hit._highlightResult?.title?.value,
            description: hit._highlightResult?.description?.value,
            content: hit._snippetResult?.content?.value,
          },
          metadata: hit,
        });
      });
    });

    return { results, totalResults };
  }

  /**
   * Semantic search using Upstash Vector
   */
  private async semanticSearch(
    query: string,
    type: string,
    filters: any,
    limit: number
  ): Promise<{ results: SearchResult[]; totalResults: number }> {
    // Use Upstash Vector for semantic search
    const vectorResults = await this.vectorService.searchSimilar(query, {
      limit,
      filters: {
        framework: filters.framework,
        category: filters.category,
        tags: filters.tags,
      },
    });

    // Enrich results with full data from database
    const results: SearchResult[] = [];
    
    for (const vectorResult of vectorResults) {
      const resource = await this.prisma.resource.findUnique({
        where: { id: vectorResult.id },
        include: {
          category: true,
          tags: true,
          resourceType: true,
        },
      });

      if (resource) {
        results.push({
          id: resource.id,
          type: 'resource',
          title: resource.name,
          description: resource.description,
          url: resource.demoUrl || undefined,
          framework: resource.frameworks[0],
          category: resource.category.name,
          tags: resource.tags.map(t => t.name),
          score: vectorResult.score,
          metadata: {
            ...vectorResult.metadata,
            resource,
          },
        });
      }
    }

    return { results, totalResults: results.length };
  }

  /**
   * Hybrid search combining keyword and semantic
   */
  private async hybridSearch(
    query: string,
    type: string,
    filters: any,
    limit: number,
    page: number
  ): Promise<{ results: SearchResult[]; totalResults: number }> {
    // Run both searches in parallel
    const [keywordResults, semanticResults] = await Promise.all([
      this.keywordSearch(query, type, filters, Math.ceil(limit / 2), page),
      this.semanticSearch(query, type, filters, Math.ceil(limit / 2)),
    ]);

    // Merge and deduplicate results
    const mergedResults = new Map<string, SearchResult>();
    
    // Add keyword results with boosted scores
    keywordResults.results.forEach(result => {
      mergedResults.set(result.id, {
        ...result,
        score: result.score * 1.2, // Boost keyword matches
      });
    });

    // Add semantic results
    semanticResults.results.forEach(result => {
      if (!mergedResults.has(result.id)) {
        mergedResults.set(result.id, result);
      } else {
        // Combine scores if found in both
        const existing = mergedResults.get(result.id)!;
        existing.score = (existing.score + result.score) / 2;
      }
    });

    // Sort by score and limit
    const results = Array.from(mergedResults.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      results,
      totalResults: keywordResults.totalResults + semanticResults.totalResults,
    };
  }

  /**
   * Build Algolia filter string from filters object
   */
  private buildAlgoliaFilters(filters: any): string {
    const filterParts = [];

    if (filters.framework) {
      filterParts.push(`framework:${filters.framework}`);
    }

    if (filters.category) {
      filterParts.push(`category:${filters.category}`);
    }

    if (filters.tags && filters.tags.length > 0) {
      const tagFilters = filters.tags.map((tag: string) => `tags:${tag}`);
      filterParts.push(`(${tagFilters.join(' OR ')})`);
    }

    if (filters.isFree !== undefined) {
      filterParts.push(`isFree:${filters.isFree}`);
    }

    if (filters.isPremium !== undefined) {
      filterParts.push(`isPremium:${filters.isPremium}`);
    }

    if (filters.hasTypescript !== undefined) {
      filterParts.push(`hasTypescript:${filters.hasTypescript}`);
    }

    return filterParts.join(' AND ');
  }

  /**
   * Get result type based on index
   */
  private getResultType(index: number, requestType: string): 'component' | 'documentation' | 'resource' {
    if (requestType !== 'all') {
      return requestType as any;
    }
    
    // Map index position to type when searching all
    switch (index) {
      case 0: return 'component';
      case 1: return 'documentation';
      case 2: return 'resource';
      default: return 'resource';
    }
  }
}

// Export singleton instance getter
export const getAlgoliaSearch = () => AlgoliaSearchService.getInstance();