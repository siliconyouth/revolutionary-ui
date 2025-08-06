import { PrismaClient } from '@prisma/client';
import { CloudSyncService } from '../services/cloud-sync-service';
import { TeamService } from '../services/team-service';
import { MarketplaceService } from '../services/marketplace-service';
import { ResourceEnhancedService } from '../services/resource-enhanced-service';
import { UpstashVectorService } from '../services/upstash-vector-service';
import { AlgoliaSearchService } from '../services/algolia-search-service';
import { ComponentGenerator } from '../ai/ComponentGenerator';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface StudioFeatures {
  database: PrismaClient;
  cloudSync: CloudSyncService;
  team: TeamService;
  marketplace: MarketplaceService;
  resources: ResourceEnhancedService;
  vectorSearch: UpstashVectorService;
  textSearch: AlgoliaSearchService;
  aiGenerator: ComponentGenerator;
}

export class StudioFeaturesManager {
  private features: Partial<StudioFeatures> = {};
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const spinner = ora('Initializing Studio features...').start();

    try {
      // Initialize database
      spinner.text = 'Connecting to database...';
      this.features.database = new PrismaClient();
      await this.features.database.$connect();

      // Initialize services
      spinner.text = 'Loading cloud sync service...';
      this.features.cloudSync = new CloudSyncService();

      spinner.text = 'Loading team service...';
      this.features.team = new TeamService();

      spinner.text = 'Loading marketplace service...';
      this.features.marketplace = new MarketplaceService();

      spinner.text = 'Loading resource service...';
      this.features.resources = new ResourceEnhancedService();

      // Initialize search services
      spinner.text = 'Loading search services...';
      if (process.env.UPSTASH_VECTOR_REST_URL) {
        this.features.vectorSearch = new UpstashVectorService();
      }

      if (process.env.NEXT_PUBLIC_ALGOLIA_APP_ID) {
        this.features.textSearch = new AlgoliaSearchService();
      }

      // Initialize AI generator
      spinner.text = 'Loading AI generator...';
      this.features.aiGenerator = new ComponentGenerator();

      this.initialized = true;
      spinner.succeed('Studio features initialized!');
    } catch (error) {
      spinner.fail('Failed to initialize some features');
      console.error(chalk.red('Initialization error:'), error);
      // Continue with partial features
      this.initialized = true;
    }
  }

  async getComponentStats(): Promise<any> {
    if (!this.features.database) return null;

    try {
      const stats = await this.features.database.resource.groupBy({
        by: ['framework'],
        _count: {
          id: true
        }
      });

      const total = await this.features.database.resource.count();
      const categories = await this.features.database.category.count();

      return {
        total,
        categories,
        byFramework: stats.map(s => ({
          framework: s.framework,
          count: s._count.id
        }))
      };
    } catch (error) {
      console.error('Failed to get component stats:', error);
      return null;
    }
  }

  async searchComponents(query: string, options?: any): Promise<any[]> {
    const results = [];

    // Try vector search first
    if (this.features.vectorSearch) {
      try {
        const vectorResults = await this.features.vectorSearch.search(query, {
          limit: options?.limit || 10
        });
        results.push(...vectorResults);
      } catch (error) {
        console.error('Vector search failed:', error);
      }
    }

    // Fallback to text search
    if (this.features.textSearch && results.length === 0) {
      try {
        const textResults = await this.features.textSearch.search(query, {
          hitsPerPage: options?.limit || 10
        });
        results.push(...textResults.hits);
      } catch (error) {
        console.error('Text search failed:', error);
      }
    }

    // Fallback to database search
    if (this.features.database && results.length === 0) {
      try {
        const dbResults = await this.features.database.resource.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          },
          take: options?.limit || 10
        });
        results.push(...dbResults);
      } catch (error) {
        console.error('Database search failed:', error);
      }
    }

    return results;
  }

  async generateComponent(prompt: string, options?: any): Promise<string> {
    if (!this.features.aiGenerator) {
      throw new Error('AI generator not initialized');
    }

    const spinner = ora('Generating component...').start();

    try {
      const result = await this.features.aiGenerator.generateComponent({
        prompt,
        framework: options?.framework || 'react',
        provider: options?.provider || 'openai',
        model: options?.model
      });

      spinner.succeed('Component generated!');
      return result.code;
    } catch (error) {
      spinner.fail('Generation failed');
      throw error;
    }
  }

  async getTeamActivity(): Promise<any[]> {
    if (!this.features.team) return [];

    try {
      return await this.features.team.getRecentActivity({
        limit: 10
      });
    } catch (error) {
      console.error('Failed to get team activity:', error);
      return [];
    }
  }

  async syncToCloud(componentId: string): Promise<boolean> {
    if (!this.features.cloudSync) return false;

    try {
      await this.features.cloudSync.pushComponent(componentId);
      return true;
    } catch (error) {
      console.error('Cloud sync failed:', error);
      return false;
    }
  }

  async getMarketplaceStats(): Promise<any> {
    if (!this.features.marketplace) return null;

    try {
      return await this.features.marketplace.getStats();
    } catch (error) {
      console.error('Failed to get marketplace stats:', error);
      return null;
    }
  }

  async exportComponent(componentId: string, format: string): Promise<string> {
    if (!this.features.database) {
      throw new Error('Database not initialized');
    }

    const component = await this.features.database.resource.findUnique({
      where: { id: componentId }
    });

    if (!component) {
      throw new Error('Component not found');
    }

    const exportDir = path.join(process.cwd(), 'exports');
    await fs.mkdir(exportDir, { recursive: true });

    const filename = `${component.name.toLowerCase().replace(/\s+/g, '-')}.${format}`;
    const filepath = path.join(exportDir, filename);

    // Export based on format
    switch (format) {
      case 'json':
        await fs.writeFile(filepath, JSON.stringify(component, null, 2));
        break;
      case 'md':
        const markdown = `# ${component.name}

${component.description}

## Details
- Framework: ${component.framework}
- Category: ${component.category}
- Downloads: ${component.downloads}

## Configuration
\`\`\`json
${JSON.stringify(component.configuration, null, 2)}
\`\`\`
`;
        await fs.writeFile(filepath, markdown);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    return filepath;
  }

  async importComponent(filepath: string): Promise<any> {
    if (!this.features.database) {
      throw new Error('Database not initialized');
    }

    const content = await fs.readFile(filepath, 'utf-8');
    const data = JSON.parse(content);

    // Create or update component
    const component = await this.features.database.resource.upsert({
      where: { 
        name_framework_category: {
          name: data.name,
          framework: data.framework,
          category: data.category
        }
      },
      create: data,
      update: data
    });

    return component;
  }

  async getAnalytics(timeframe: string = '7d'): Promise<any> {
    if (!this.features.database) return null;

    const now = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    try {
      // Get generation stats
      const generations = await this.features.database.componentGeneration.count({
        where: {
          createdAt: { gte: startDate }
        }
      });

      // Get popular components
      const popular = await this.features.database.resource.findMany({
        orderBy: { downloads: 'desc' },
        take: 5,
        select: {
          name: true,
          framework: true,
          downloads: true
        }
      });

      // Get framework distribution
      const frameworks = await this.features.database.resource.groupBy({
        by: ['framework'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } }
      });

      return {
        timeframe,
        generations,
        popular,
        frameworks: frameworks.map(f => ({
          name: f.framework,
          count: f._count.id
        }))
      };
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return null;
    }
  }

  async cleanup(): Promise<void> {
    if (this.features.database) {
      await this.features.database.$disconnect();
    }
  }

  getFeatures(): Partial<StudioFeatures> {
    return this.features;
  }

  isFeatureAvailable(feature: keyof StudioFeatures): boolean {
    return !!this.features[feature];
  }
}

// Export singleton instance
export const studioFeatures = new StudioFeaturesManager();