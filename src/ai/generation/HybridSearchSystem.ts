/**
 * Hybrid Search System - Combines Upstash Vector and Algolia
 */

import { UpstashVectorService } from '../../services/upstash-vector-service';
import { getAlgoliaSearch } from '../../services/algolia-search-service';
import { PrismaClient } from '@prisma/client';
import type {
  GenerationRequest,
  VectorSearchResult,
  AlgoliaSearchResult,
} from './types';

interface SearchResults {
  results: CombinedResult[];
  searchMetadata: {
    vectorMatches: number;
    keywordMatches: number;
    totalFound: number;
  };
}

interface CombinedResult {
  id: string;
  score: number;
  title?: string;
  description?: string;
  framework?: string;
  category?: string;
  tags?: string[];
  metadata?: any;
}

export class HybridSearchSystem {
  private vectorService: UpstashVectorService;
  private algoliaService: any;
  private prisma: PrismaClient;

  constructor() {
    this.vectorService = UpstashVectorService.getInstance();
    this.algoliaService = getAlgoliaSearch();
    this.prisma = new PrismaClient();
  }

  /**
   * Find similar components using hybrid search
   */
  async findSimilarComponents(request: GenerationRequest): Promise<SearchResults> {
    const framework = request.framework || 'react';
    const category = request.category || this.inferCategory(request.prompt);
    
    console.log(`🔍 Searching for similar components: "${request.prompt}"`);
    console.log(`   Framework: ${framework}, Category: ${category}`);

    // Run both searches in parallel
    const [vectorResults, algoliaResults] = await Promise.all([
      this.semanticSearch(request.prompt, framework, category),
      this.keywordSearch(request.prompt, framework, category)
    ]);

    console.log(`   Found ${vectorResults.length} vector matches`);
    console.log(`   Found ${algoliaResults.results.length} keyword matches`);

    // Combine and rank results
    const combinedResults = this.mergeSearchResults(vectorResults, algoliaResults);

    // Enhance with database information
    const enhancedResults = await this.enhanceWithDatabase(combinedResults);

    return {
      results: enhancedResults,
      searchMetadata: {
        vectorMatches: vectorResults.length,
        keywordMatches: algoliaResults.results.length,
        totalFound: enhancedResults.length
      }
    };
  }

  /**
   * Semantic search using Upstash Vector
   */
  private async semanticSearch(
    query: string,
    framework: string,
    category: string
  ): Promise<VectorSearchResult[]> {
    try {
      const results = await this.vectorService.searchSimilar(query, {
        limit: 20,
        filters: {
          framework,
          category,
        },
        includeMetadata: true,
      });

      return results.map(result => ({
        id: result.id,
        score: result.score,
        metadata: result.metadata
      }));
    } catch (error) {
      console.warn('Vector search failed:', error);
      return [];
    }
  }

  /**
   * Keyword search using Algolia
   */
  private async keywordSearch(
    query: string,
    framework: string,
    category: string
  ): Promise<{ results: AlgoliaSearchResult[] }> {
    try {
      const searchResponse = await this.algoliaService.search({
        query,
        type: 'components',
        filters: {
          framework,
          category,
          hasTypescript: true,
          isPremium: false
        },
        searchMode: 'keyword',
        limit: 20,
        useCache: true
      });

      return searchResponse;
    } catch (error) {
      console.warn('Algolia search failed:', error);
      return { results: [] };
    }
  }

  /**
   * Merge search results from vector and keyword search
   */
  private mergeSearchResults(
    vectorResults: VectorSearchResult[],
    algoliaResults: { results: AlgoliaSearchResult[] }
  ): CombinedResult[] {
    const scoreMap = new Map<string, CombinedResult>();

    // Process vector results (semantic understanding)
    vectorResults.forEach(result => {
      scoreMap.set(result.id, {
        id: result.id,
        score: result.score * 1.3, // Boost semantic matches
        metadata: result.metadata
      });
    });

    // Process keyword results (exact matches)
    algoliaResults.results.forEach(result => {
      const existing = scoreMap.get(result.id);
      if (existing) {
        // Combine scores if found in both
        existing.score = (existing.score + result.score * 1.1) / 2;
        // Merge metadata
        existing.title = result.title || existing.title;
        existing.description = result.description || existing.description;
        existing.framework = result.framework || existing.framework;
        existing.category = result.category || existing.category;
        existing.tags = [...(existing.tags || []), ...(result.tags || [])];
      } else {
        // Add new result
        scoreMap.set(result.id, {
          id: result.id,
          score: result.score * 1.1,
          title: result.title,
          description: result.description,
          framework: result.framework,
          category: result.category,
          tags: result.tags
        });
      }
    });

    // Sort by combined score
    return Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Top 20 results
  }

  /**
   * Enhance results with full database information
   */
  private async enhanceWithDatabase(
    results: CombinedResult[]
  ): Promise<CombinedResult[]> {
    if (results.length === 0) return [];

    try {
      // Fetch full resource data
      const resources = await this.prisma.resource.findMany({
        where: {
          id: { in: results.map(r => r.id) }
        },
        include: {
          category: true,
          tags: true,
          author: true,
          _count: {
            select: {
              downloads: true,
              favorites: true,
              reviews: true
            }
          }
        }
      });

      // Create a map for quick lookup
      const resourceMap = new Map(
        resources.map(r => [r.id, r])
      );

      // Enhance results with database data
      return results
        .map(result => {
          const resource = resourceMap.get(result.id);
          if (!resource) return null;

          return {
            ...result,
            title: resource.name,
            description: resource.description,
            framework: resource.frameworks[0],
            category: resource.category.name,
            tags: resource.tags.map(t => t.name),
            metadata: {
              ...result.metadata,
              author: resource.author.name,
              downloads: resource._count.downloads,
              favorites: resource._count.favorites,
              reviews: resource._count.reviews,
              rating: resource.rating,
              createdAt: resource.createdAt,
              updatedAt: resource.updatedAt
            }
          };
        })
        .filter((r): r is CombinedResult => r !== null);
    } catch (error) {
      console.warn('Failed to enhance results with database:', error);
      return results;
    }
  }

  /**
   * Search for documentation
   */
  async searchDocumentation(
    query: string,
    framework: string
  ): Promise<AlgoliaSearchResult[]> {
    try {
      const results = await this.algoliaService.searchDocumentation(query, {
        category: framework,
        type: 'guide',
        limit: 10
      });

      return results;
    } catch (error) {
      console.warn('Documentation search failed:', error);
      return [];
    }
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string): Promise<string[]> {
    try {
      return await this.algoliaService.getSuggestions(query, 5);
    } catch (error) {
      console.warn('Failed to get suggestions:', error);
      return [];
    }
  }

  /**
   * Analyze search patterns for learning
   */
  async analyzeSearchPatterns(
    query: string,
    selectedResults: string[]
  ): Promise<void> {
    // Store search patterns for continuous learning
    try {
      await this.prisma.searchPattern.create({
        data: {
          query,
          selectedResults,
          timestamp: new Date()
        }
      });
    } catch (error) {
      // If searchPattern table doesn't exist, just log
      console.debug('Search pattern logging not available');
    }
  }

  /**
   * Find related components by tags
   */
  async findRelatedByTags(
    tags: string[],
    excludeIds: string[] = []
  ): Promise<CombinedResult[]> {
    try {
      const resources = await this.prisma.resource.findMany({
        where: {
          tags: {
            some: {
              name: { in: tags }
            }
          },
          id: { notIn: excludeIds },
          isPublished: true,
          rating: { gte: 4.0 }
        },
        include: {
          category: true,
          tags: true
        },
        orderBy: [
          { rating: 'desc' },
          { downloads: { _count: 'desc' } }
        ],
        take: 10
      });

      return resources.map(resource => ({
        id: resource.id,
        score: resource.rating / 5, // Normalize rating to 0-1
        title: resource.name,
        description: resource.description,
        framework: resource.frameworks[0],
        category: resource.category.name,
        tags: resource.tags.map(t => t.name)
      }));
    } catch (error) {
      console.warn('Related search failed:', error);
      return [];
    }
  }

  /**
   * Search by example code
   */
  async searchByCode(
    codeSnippet: string,
    framework: string
  ): Promise<VectorSearchResult[]> {
    // Extract meaningful features from code
    const features = this.extractCodeFeatures(codeSnippet);
    const searchQuery = `${features.join(' ')} ${framework} component`;

    return this.semanticSearch(searchQuery, framework, 'all');
  }

  /**
   * Extract features from code snippet
   */
  private extractCodeFeatures(code: string): string[] {
    const features: string[] = [];

    // Detect component type
    if (code.includes('form') || code.includes('input')) features.push('form');
    if (code.includes('table') || code.includes('tr')) features.push('table');
    if (code.includes('chart') || code.includes('graph')) features.push('chart');
    if (code.includes('modal') || code.includes('dialog')) features.push('modal');

    // Detect features
    if (code.includes('useState') || code.includes('ref(')) features.push('stateful');
    if (code.includes('async') || code.includes('await')) features.push('async');
    if (code.includes('animation') || code.includes('transition')) features.push('animated');
    if (code.includes('grid') || code.includes('flex')) features.push('responsive');

    // Detect patterns
    if (code.includes('map(')) features.push('list rendering');
    if (code.includes('filter(')) features.push('filtering');
    if (code.includes('sort(')) features.push('sorting');

    return features;
  }

  /**
   * Infer category from prompt
   */
  private inferCategory(prompt: string): string {
    const lowercasePrompt = prompt.toLowerCase();
    
    if (lowercasePrompt.includes('form') || lowercasePrompt.includes('input')) {
      return 'Forms & Inputs';
    }
    if (lowercasePrompt.includes('table') || lowercasePrompt.includes('grid') || lowercasePrompt.includes('list')) {
      return 'Data Display';
    }
    if (lowercasePrompt.includes('nav') || lowercasePrompt.includes('menu')) {
      return 'Navigation';
    }
    if (lowercasePrompt.includes('chart') || lowercasePrompt.includes('graph')) {
      return 'Data Visualization';
    }
    if (lowercasePrompt.includes('dashboard') || lowercasePrompt.includes('admin')) {
      return 'Admin & Dashboard';
    }
    if (lowercasePrompt.includes('modal') || lowercasePrompt.includes('dialog')) {
      return 'Overlays';
    }
    
    return 'Layout';
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    await this.prisma.$disconnect();
  }
}