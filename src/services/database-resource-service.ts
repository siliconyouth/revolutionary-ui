/**
 * Database Resource Service
 * Provides methods to query frameworks, UI libraries, and other resources from the database
 */

import { PrismaClient } from '@prisma/client';

export interface FrameworkInfo {
  id: string;
  name: string;
  slug: string;
  packageName: string;
  category?: string;
}

export interface UILibraryInfo {
  id: string;
  name: string;
  slug: string;
  packageName: string;
  frameworks?: string[];
}

export interface IconLibraryInfo {
  id: string;
  name: string;
  slug: string;
  packageName: string;
  iconCount?: string;
}

export class DatabaseResourceService {
  private prisma: PrismaClient;
  private static instance: DatabaseResourceService;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  static getInstance(): DatabaseResourceService {
    if (!DatabaseResourceService.instance) {
      DatabaseResourceService.instance = new DatabaseResourceService();
    }
    return DatabaseResourceService.instance;
  }

  /**
   * Get all frameworks from the database
   */
  async getFrameworks(): Promise<FrameworkInfo[]> {
    try {
      const frameworkCategory = await this.prisma.category.findUnique({
        where: { slug: 'frameworks' }
      });

      if (!frameworkCategory) {
        console.warn('Framework category not found in database');
        return [];
      }

      const frameworks = await this.prisma.resource.findMany({
        where: {
          categoryId: frameworkCategory.id,
          isPublished: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          npmPackage: true,
          description: true
        }
      });

      return frameworks.map(f => ({
        id: f.id,
        name: f.name,
        slug: f.slug,
        packageName: f.npmPackage || '',
        category: this.extractCategoryFromDescription(f.description)
      }));
    } catch (error) {
      console.error('Error fetching frameworks from database:', error);
      return [];
    }
  }

  /**
   * Get all UI libraries from the database
   */
  async getUILibraries(): Promise<UILibraryInfo[]> {
    try {
      const uiCategory = await this.prisma.category.findUnique({
        where: { slug: 'ui-libraries' }
      });

      if (!uiCategory) {
        console.warn('UI libraries category not found in database');
        return [];
      }

      const libraries = await this.prisma.resource.findMany({
        where: {
          categoryId: uiCategory.id,
          isPublished: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          npmPackage: true,
          frameworks: true
        }
      });

      return libraries.map(lib => ({
        id: lib.id,
        name: lib.name,
        slug: lib.slug,
        packageName: lib.npmPackage || '',
        frameworks: lib.frameworks
      }));
    } catch (error) {
      console.error('Error fetching UI libraries from database:', error);
      return [];
    }
  }

  /**
   * Get all icon libraries from the database
   */
  async getIconLibraries(): Promise<IconLibraryInfo[]> {
    try {
      const iconCategory = await this.prisma.category.findUnique({
        where: { slug: 'icon-libraries' }
      });

      if (!iconCategory) {
        console.warn('Icon libraries category not found in database');
        return [];
      }

      const libraries = await this.prisma.resource.findMany({
        where: {
          categoryId: iconCategory.id,
          isPublished: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          npmPackage: true,
          description: true
        }
      });

      return libraries.map(lib => ({
        id: lib.id,
        name: lib.name,
        slug: lib.slug,
        packageName: lib.npmPackage || '',
        iconCount: this.extractIconCount(lib.description)
      }));
    } catch (error) {
      console.error('Error fetching icon libraries from database:', error);
      return [];
    }
  }

  /**
   * Get all CSS frameworks from the database
   */
  async getCSSFrameworks(): Promise<any[]> {
    try {
      const cssCategory = await this.prisma.category.findUnique({
        where: { slug: 'css-frameworks' }
      });

      if (!cssCategory) {
        return [];
      }

      const frameworks = await this.prisma.resource.findMany({
        where: {
          categoryId: cssCategory.id,
          isPublished: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          npmPackage: true
        }
      });

      return frameworks;
    } catch (error) {
      console.error('Error fetching CSS frameworks from database:', error);
      return [];
    }
  }

  /**
   * Get frameworks by package names (for batch checking)
   */
  async getFrameworksByPackages(packageNames: string[]): Promise<Map<string, FrameworkInfo>> {
    try {
      const frameworkCategory = await this.prisma.category.findUnique({
        where: { slug: 'frameworks' }
      });

      if (!frameworkCategory) {
        return new Map();
      }

      const frameworks = await this.prisma.resource.findMany({
        where: {
          categoryId: frameworkCategory.id,
          npmPackage: { in: packageNames },
          isPublished: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          npmPackage: true,
          description: true
        }
      });

      const frameworkMap = new Map<string, FrameworkInfo>();
      frameworks.forEach(f => {
        if (f.npmPackage) {
          frameworkMap.set(f.npmPackage, {
            id: f.id,
            name: f.name,
            slug: f.slug,
            packageName: f.npmPackage,
            category: this.extractCategoryFromDescription(f.description)
          });
        }
      });

      return frameworkMap;
    } catch (error) {
      console.error('Error fetching frameworks by packages:', error);
      return new Map();
    }
  }

  /**
   * Get UI libraries by package names (for batch checking)
   */
  async getUILibrariesByPackages(packageNames: string[]): Promise<Map<string, UILibraryInfo>> {
    try {
      const uiCategory = await this.prisma.category.findUnique({
        where: { slug: 'ui-libraries' }
      });

      if (!uiCategory) {
        return new Map();
      }

      const libraries = await this.prisma.resource.findMany({
        where: {
          categoryId: uiCategory.id,
          npmPackage: { in: packageNames },
          isPublished: true
        },
        select: {
          id: true,
          name: true,
          slug: true,
          npmPackage: true,
          frameworks: true
        }
      });

      const libraryMap = new Map<string, UILibraryInfo>();
      libraries.forEach(lib => {
        if (lib.npmPackage) {
          libraryMap.set(lib.npmPackage, {
            id: lib.id,
            name: lib.name,
            slug: lib.slug,
            packageName: lib.npmPackage,
            frameworks: lib.frameworks
          });
        }
      });

      return libraryMap;
    } catch (error) {
      console.error('Error fetching UI libraries by packages:', error);
      return new Map();
    }
  }

  /**
   * Close database connection
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  // Helper methods
  private extractCategoryFromDescription(description: string): string | undefined {
    // Extract category from descriptions like "React - Framework"
    const match = description.match(/\s-\s(.+)$/);
    return match ? match[1] : undefined;
  }

  private extractIconCount(description: string | null): string | undefined {
    if (!description) return undefined;
    // Extract icon count from descriptions like "Beautiful icons (1400+ icons)"
    const match = description.match(/\((\d+\+?\s*icons?)\)/);
    return match ? match[1] : undefined;
  }
}