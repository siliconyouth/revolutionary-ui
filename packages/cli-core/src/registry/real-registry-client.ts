import { PrismaClient } from '@prisma/client';
import { createLogger } from '../utils/logger.js';
import type { Component } from './component-registry.js';
import { z } from 'zod';

const prisma = new PrismaClient();
const logger = createLogger();

export interface RegistrySearchOptions {
  search?: string;
  category?: string;
  framework?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'downloads' | 'stars' | 'recent' | 'name';
}

export interface RegistryComponent {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  frameworks: string[];
  dependencies?: string[];
  devDependencies?: string[];
  price: number;
  isFree: boolean;
  isPremium: boolean;
  downloads: number;
  stars: number;
  hasTypescript: boolean;
  hasTests: boolean;
  supportsDarkMode: boolean;
  isResponsive: boolean;
  isAccessible: boolean;
  sourceCode?: string;
  documentation?: string;
  demoUrl?: string;
  npmPackage?: string;
  githubUrl?: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

export class RealRegistryClient {
  private logger = createLogger();

  /**
   * Search for components in the marketplace
   */
  async searchComponents(options: RegistrySearchOptions): Promise<RegistryComponent[]> {
    try {
      const {
        search = '',
        category,
        framework,
        limit = 20,
        offset = 0,
        sortBy = 'downloads'
      } = options;

      const where: any = {
        isPublished: true,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (category) {
        where.category = {
          slug: category,
        };
      }

      if (framework) {
        where.frameworks = {
          has: framework,
        };
      }

      const orderBy: any = {};
      switch (sortBy) {
        case 'downloads':
          orderBy.weeklyDownloads = 'desc';
          break;
        case 'stars':
          orderBy.githubStars = 'desc';
          break;
        case 'recent':
          orderBy.createdAt = 'desc';
          break;
        case 'name':
          orderBy.name = 'asc';
          break;
      }

      const resources = await prisma.resource.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          category: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return resources.map(this.mapResourceToComponent);
    } catch (error) {
      this.logger.error('Failed to search components:', error);
      throw error;
    }
  }

  /**
   * Get a specific component by slug
   */
  async getComponent(slug: string): Promise<RegistryComponent | null> {
    try {
      const resource = await prisma.resource.findUnique({
        where: { slug },
        include: {
          category: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!resource) {
        return null;
      }

      return this.mapResourceToComponent(resource);
    } catch (error) {
      this.logger.error(`Failed to get component ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Get multiple components by slugs
   */
  async getComponents(slugs: string[]): Promise<RegistryComponent[]> {
    try {
      const resources = await prisma.resource.findMany({
        where: {
          slug: { in: slugs },
          isPublished: true,
        },
        include: {
          category: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return resources.map(this.mapResourceToComponent);
    } catch (error) {
      this.logger.error('Failed to get components:', error);
      throw error;
    }
  }

  /**
   * Get featured components
   */
  async getFeaturedComponents(limit: number = 10): Promise<RegistryComponent[]> {
    try {
      const resources = await prisma.resource.findMany({
        where: {
          isFeatured: true,
          isPublished: true,
        },
        orderBy: {
          weeklyDownloads: 'desc',
        },
        take: limit,
        include: {
          category: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return resources.map(this.mapResourceToComponent);
    } catch (error) {
      this.logger.error('Failed to get featured components:', error);
      throw error;
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Array<{ id: string; name: string; slug: string; count: number }>> {
    try {
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: { resources: true },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: cat._count.resources,
      }));
    } catch (error) {
      this.logger.error('Failed to get categories:', error);
      throw error;
    }
  }

  /**
   * Track component download
   */
  async trackDownload(componentSlug: string, userId?: string): Promise<void> {
    try {
      const resource = await prisma.resource.findUnique({
        where: { slug: componentSlug },
      });

      if (!resource) {
        return;
      }

      // Increment download count
      await prisma.resource.update({
        where: { slug: componentSlug },
        data: {
          weeklyDownloads: { increment: 1 },
        },
      });

      // Track in downloads table if user is authenticated
      if (userId) {
        await prisma.download.create({
          data: {
            resourceId: resource.id,
            userId,
            version: '1.0.0', // TODO: Get actual version
          },
        });
      }

      // Track in activity log
      await prisma.activityLog.create({
        data: {
          action: 'download',
          entityType: 'resource',
          entityId: resource.id,
          metadata: {
            componentSlug,
            userId: userId || 'anonymous',
          },
        },
      });
    } catch (error) {
      this.logger.error('Failed to track download:', error);
      // Don't throw - tracking failures shouldn't break downloads
    }
  }

  /**
   * Get component files from storage
   */
  async getComponentFiles(slug: string): Promise<Array<{ path: string; content: string }>> {
    try {
      const resource = await prisma.resource.findUnique({
        where: { slug },
        include: {
          codeStorage: true,
        },
      });

      if (!resource) {
        throw new Error(`Component ${slug} not found`);
      }

      const files: Array<{ path: string; content: string }> = [];

      // Get source code
      if (resource.sourceCode) {
        // Parse stored source code (could be JSON with multiple files)
        try {
          const sourceFiles = JSON.parse(resource.sourceCode);
          if (Array.isArray(sourceFiles)) {
            files.push(...sourceFiles);
          } else {
            files.push({
              path: `components/${slug}.tsx`,
              content: resource.sourceCode,
            });
          }
        } catch {
          // If not JSON, treat as single file
          files.push({
            path: `components/${slug}.tsx`,
            content: resource.sourceCode,
          });
        }
      }

      // Get from R2 storage if available
      if (resource.codeStorage) {
        const storageFiles = await this.fetchFromR2(resource.codeStorage.r2Key);
        if (storageFiles) {
          files.push(...storageFiles);
        }
      }

      // Add default structure if no files found
      if (files.length === 0) {
        files.push({
          path: `components/${slug}/index.tsx`,
          content: this.generatePlaceholderComponent(resource.name, resource.description),
        });
      }

      return files;
    } catch (error) {
      this.logger.error(`Failed to get component files for ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Map database resource to component interface
   */
  private mapResourceToComponent(resource: any): RegistryComponent {
    return {
      id: resource.id,
      name: resource.name,
      slug: resource.slug,
      description: resource.description,
      category: resource.category?.slug || 'uncategorized',
      frameworks: resource.frameworks || ['react'],
      dependencies: resource.dependencies ? Object.keys(resource.dependencies as any) : [],
      devDependencies: resource.devDependencies ? Object.keys(resource.devDependencies as any) : [],
      price: resource.price,
      isFree: resource.isFree,
      isPremium: resource.isPremium,
      downloads: resource.weeklyDownloads,
      stars: resource.githubStars,
      hasTypescript: resource.hasTypescript,
      hasTests: resource.hasTests,
      supportsDarkMode: resource.supportsDarkMode,
      isResponsive: resource.isResponsive,
      isAccessible: resource.isAccessible,
      sourceCode: resource.sourceCode,
      documentation: resource.documentation,
      demoUrl: resource.demoUrl,
      npmPackage: resource.npmPackage,
      githubUrl: resource.githubUrl,
      author: resource.author || {
        id: 'system',
        name: 'Revolutionary UI',
        email: 'components@revolutionary-ui.com',
      },
    };
  }

  /**
   * Fetch files from R2 storage
   */
  private async fetchFromR2(r2Key: string): Promise<Array<{ path: string; content: string }> | null> {
    // TODO: Implement R2 fetching
    // This would connect to Cloudflare R2 to get the actual files
    return null;
  }

  /**
   * Generate placeholder component
   */
  private generatePlaceholderComponent(name: string, description: string): string {
    return `import React from 'react';

interface ${name}Props {
  children?: React.ReactNode;
  className?: string;
}

/**
 * ${description}
 */
export const ${name}: React.FC<${name}Props> = ({ children, className }) => {
  return (
    <div className={className}>
      {children || '${name} Component'}
    </div>
  );
};

export default ${name};`;
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await prisma.$disconnect();
  }
}

// Export singleton instance
export const realRegistryClient = new RealRegistryClient();