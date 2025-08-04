/**
 * Configuration Database Service
 * Provides configuration data from database instead of static files
 */

import { PrismaClient } from '@prisma/client';

export interface FrameworkConfig {
  id: string;
  name: string;
  packageName: string;
  version: string;
  description: string;
  category: string;
  documentation: string;
  github: string;
  features: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface UILibraryConfig {
  id: string;
  name: string;
  packageName: string;
  version: string;
  description: string;
  framework: string | string[];
  components: number;
  documentation: string;
  github: string;
  features: string[];
  styling?: string;
}

export interface IconLibraryConfig {
  id: string;
  name: string;
  packageName: string;
  version: string;
  description: string;
  iconCount: string;
  documentation: string;
  github: string;
  features: string[];
  formats?: string[];
}

export interface DesignToolConfig {
  id: string;
  name: string;
  packageName: string;
  version: string;
  category: 'importer' | 'converter' | 'bridge' | 'utility';
  description: string;
  documentation: string;
  supportedFormats: string[];
  features: string[];
}

export interface ColorToolConfig {
  id: string;
  name: string;
  packageName: string;
  version: string;
  description: string;
  documentation: string;
  features: string[];
}

export interface FontConfig {
  id: string;
  name: string;
  packageName: string;
  version: string;
  category: 'sans-serif' | 'serif' | 'monospace' | 'display';
  weights: number[];
}

export class ConfigDatabaseService {
  private prisma: PrismaClient;
  private static instance: ConfigDatabaseService;
  private cache: Map<string, any> = new Map();

  private constructor() {
    this.prisma = new PrismaClient();
  }

  static getInstance(): ConfigDatabaseService {
    if (!ConfigDatabaseService.instance) {
      ConfigDatabaseService.instance = new ConfigDatabaseService();
    }
    return ConfigDatabaseService.instance;
  }

  async getFrameworkConfigs(): Promise<FrameworkConfig[]> {
    const cacheKey = 'framework-configs';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const frameworks = await this.prisma.resource.findMany({
      where: {
        category: {
          slug: 'frameworks'
        }
      },
      include: {
        author: true
      }
    });

    const configs: FrameworkConfig[] = frameworks.map(fw => ({
      id: fw.slug,
      name: fw.name,
      packageName: fw.npmPackage || fw.slug,
      version: 'latest', // TODO: Get from package version
      description: fw.description,
      category: 'framework',
      documentation: fw.documentationUrl || '',
      github: fw.githubUrl || '',
      features: [], // TODO: Extract from metadata
      dependencies: fw.dependencies as Record<string, string> || {},
      devDependencies: fw.devDependencies as Record<string, string> || {}
    }));

    this.cache.set(cacheKey, configs);
    return configs;
  }

  async getUILibraries(): Promise<UILibraryConfig[]> {
    const cacheKey = 'ui-libraries';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const libraries = await this.prisma.resource.findMany({
      where: {
        category: {
          slug: 'ui-libraries'
        }
      },
      include: {
        author: true,
        tags: true
      }
    });

    const configs: UILibraryConfig[] = libraries.map(lib => ({
      id: lib.slug,
      name: lib.name,
      packageName: lib.npmPackage || lib.slug,
      version: 'latest',
      description: lib.description,
      framework: lib.frameworks || ['react'], // Use frameworks field
      components: 50, // Default, could be stored in metadata
      documentation: lib.documentationUrl || '',
      github: lib.githubUrl || '',
      features: lib.tags.map(t => t.name),
      styling: lib.supportsDarkMode ? 'CSS-in-JS' : 'CSS'
    }));

    this.cache.set(cacheKey, configs);
    return configs;
  }

  async getIconLibraries(): Promise<IconLibraryConfig[]> {
    const cacheKey = 'icon-libraries';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const libraries = await this.prisma.resource.findMany({
      where: {
        category: {
          slug: 'icon-libraries'
        }
      }
    });

    const configs: IconLibraryConfig[] = libraries.map(lib => ({
      id: lib.slug,
      name: lib.name,
      packageName: lib.npmPackage || lib.slug,
      version: 'latest',
      description: lib.description,
      iconCount: '1000+', // Default, could be stored in metadata
      documentation: lib.documentationUrl || '',
      github: lib.githubUrl || '',
      features: [],
      formats: ['svg', 'react']
    }));

    this.cache.set(cacheKey, configs);
    return configs;
  }

  async getDesignTools(): Promise<DesignToolConfig[]> {
    const cacheKey = 'design-tools';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const tools = await this.prisma.resource.findMany({
      where: {
        category: {
          slug: 'design-tools'
        }
      }
    });

    const configs: DesignToolConfig[] = tools.map(tool => ({
      id: tool.slug,
      name: tool.name,
      packageName: tool.npmPackage || tool.slug,
      version: 'latest',
      category: 'utility' as const, // Default, could be determined by tags
      description: tool.description,
      documentation: tool.documentationUrl || '',
      supportedFormats: ['figma', 'sketch'], // Default
      features: []
    }));

    this.cache.set(cacheKey, configs);
    return configs;
  }

  async getColorTools(): Promise<ColorToolConfig[]> {
    const cacheKey = 'color-tools';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const tools = await this.prisma.resource.findMany({
      where: {
        category: {
          slug: 'color-tools'
        }
      }
    });

    const configs: ColorToolConfig[] = tools.map(tool => ({
      id: tool.slug,
      name: tool.name,
      packageName: tool.npmPackage || tool.slug,
      version: 'latest',
      description: tool.description,
      documentation: tool.documentationUrl || '',
      features: ['Color Conversion', 'Manipulation']
    }));

    this.cache.set(cacheKey, configs);
    return configs;
  }

  async getFonts(): Promise<FontConfig[]> {
    const cacheKey = 'fonts';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const fonts = await this.prisma.resource.findMany({
      where: {
        category: {
          slug: 'fonts'
        }
      }
    });

    const configs: FontConfig[] = fonts.map(font => ({
      id: font.slug,
      name: font.name,
      packageName: font.npmPackage || font.slug,
      version: 'latest',
      category: 'sans-serif' as const, // Default, could be stored in metadata
      weights: [100, 200, 300, 400, 500, 600, 700, 800, 900]
    }));

    this.cache.set(cacheKey, configs);
    return configs;
  }

  async getFrameworkFeatureMatrix(): Promise<any> {
    const cacheKey = 'framework-feature-matrix';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const config = await this.prisma.systemConfig.findUnique({
      where: { key: 'framework-feature-matrix' }
    });

    const matrix = config?.value || {};
    this.cache.set(cacheKey, matrix);
    return matrix;
  }

  async getTierFeatures(): Promise<any> {
    const cacheKey = 'tier-features';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // For now, return a default structure
    // This should be migrated to database as well
    const tierFeatures = {
      FREE: {
        name: 'Free',
        features: ['Basic component generation', 'Community support']
      },
      PRO: {
        name: 'Pro',
        features: ['Advanced features', 'Priority support']
      },
      ENTERPRISE: {
        name: 'Enterprise',
        features: ['All features', 'Dedicated support']
      }
    };

    this.cache.set(cacheKey, tierFeatures);
    return tierFeatures;
  }

  clearCache() {
    this.cache.clear();
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }
}