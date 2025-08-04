/**
 * Simple Vector Service
 * Queries existing embeddings without generating new ones
 */

import prisma from '@/lib/prisma';
import crypto from 'crypto';

export class LocalVectorService {
  private prisma: typeof prisma;
  private static instance: LocalVectorService;

  private constructor() {
    this.prisma = prisma;
  }

  static getInstance(): LocalVectorService {
    if (!LocalVectorService.instance) {
      LocalVectorService.instance = new LocalVectorService();
    }
    return LocalVectorService.instance;
  }

  /**
   * Search for similar components using pre-computed embeddings
   * For testing, we'll use a simple text-based search as fallback
   */
  async searchSimilar(
    query: string,
    options: {
      limit?: number;
      threshold?: number;
      filters?: {
        framework?: string;
        category?: string;
        tags?: string[];
      };
    } = {}
  ): Promise<any[]> {
    const { limit = 10, filters } = options;

    try {
      // First try to find resources that match the query text
      const whereClause: any = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      };

      // Apply filters
      if (filters?.framework) {
        whereClause.frameworks = { has: filters.framework };
      }

      if (filters?.category) {
        whereClause.category = { name: filters.category };
      }

      if (filters?.tags && filters.tags.length > 0) {
        whereClause.tags = {
          some: {
            name: { in: filters.tags },
          },
        };
      }

      const resources = await this.prisma.resource.findMany({
        where: whereClause,
        take: limit,
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

      // Return with mock scores
      return resources.map((resource, index) => ({
        id: resource.id,
        score: 0.95 - (index * 0.05), // Mock descending scores
        resource,
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
  ): Promise<any[]> {
    try {
      // Get the resource
      const resource = await this.prisma.resource.findUnique({
        where: { id: resourceId },
        include: {
          category: true,
          tags: true,
        },
      });

      if (!resource) {
        return [];
      }

      // Find similar resources based on category and tags
      const whereClause: any = {
        id: { not: resourceId },
        OR: [],
      };

      if (resource.categoryId) {
        whereClause.OR.push({ categoryId: resource.categoryId });
      }

      if (resource.tags.length > 0) {
        whereClause.OR.push({
          tags: {
            some: {
              id: { in: resource.tags.map(t => t.id) },
            },
          },
        });
      }

      if (resource.frameworks && resource.frameworks.length > 0) {
        whereClause.OR.push({
          frameworks: {
            hasSome: resource.frameworks,
          },
        });
      }

      const similarResources = await this.prisma.resource.findMany({
        where: whereClause,
        take: limit,
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

      // Return with mock scores
      return similarResources.map((resource, index) => ({
        id: resource.id,
        score: 0.9 - (index * 0.1),
        resource,
      }));

    } catch (error) {
      console.error('Similar components error:', error);
      throw error;
    }
  }

  /**
   * Get popular search queries
   */
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    // Return mock popular searches for now
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