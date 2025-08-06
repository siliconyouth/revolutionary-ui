import { createLogger, input, select } from '@revolutionary-ui/cli-core';
import { MarketplaceClient } from './client.js';
import type { SearchOptions, ComponentMetadata } from './types.js';
import chalk from 'chalk';

const logger = createLogger();

export class ComponentSearch {
  private client: MarketplaceClient;

  constructor(client?: MarketplaceClient) {
    this.client = client || new MarketplaceClient();
  }

  async interactiveSearch(): Promise<ComponentMetadata | null> {
    // Get search query
    const query = await input('Search for components:', 'dashboard');

    // Get categories
    const categories = await this.client.getCategories();
    const category = await select(
      'Select category (optional):',
      [
        { name: 'All categories', value: '' },
        ...categories.map(cat => ({ name: cat, value: cat })),
      ]
    );

    // Get frameworks
    const frameworks = await this.client.getFrameworks();
    const framework = await select(
      'Select framework:',
      [
        { name: 'All frameworks', value: '' },
        ...frameworks.map(fw => ({ name: fw, value: fw })),
      ]
    );

    // Search
    const searchOptions: SearchOptions = {
      query,
      category: category || undefined,
      framework: framework || undefined,
      sort: 'downloads',
      limit: 20,
    };

    const results = await this.search(searchOptions);

    if (results.length === 0) {
      logger.info('No components found matching your criteria.');
      return null;
    }

    // Display results
    this.displayResults(results);

    // Select component
    const selected = await select(
      'Select a component to view details:',
      [
        { name: 'None - go back', value: '' },
        ...results.map(comp => ({
          name: `${comp.name} - ${comp.description}`,
          value: comp.id,
        })),
      ]
    );

    if (!selected) return null;

    const component = results.find(c => c.id === selected);
    if (component) {
      await this.displayComponentDetails(component);
    }

    return component || null;
  }

  async search(options: SearchOptions): Promise<ComponentMetadata[]> {
    logger.info('Searching marketplace...');
    
    try {
      const result = await this.client.searchComponents(options);
      return result.components;
    } catch (error) {
      logger.error('Search failed:', error);
      return [];
    }
  }

  displayResults(components: ComponentMetadata[]): void {
    logger.info(chalk.bold('\n📦 Search Results:\n'));
    
    components.forEach((comp, index) => {
      logger.info(`${chalk.cyan(`${index + 1}.`)} ${chalk.bold(comp.name)} v${comp.version}`);
      logger.info(`   ${chalk.gray(comp.description)}`);
      logger.info(`   ${chalk.gray('Category:')} ${comp.category} | ${chalk.gray('Framework:')} ${comp.frameworks.join(', ')}`);
      logger.info(`   ${chalk.gray('Downloads:')} ${comp.downloads.toLocaleString()} | ${chalk.gray('Rating:')} ${comp.rating.toFixed(1)} ⭐`);
      if (comp.premium) {
        logger.info(`   ${chalk.yellow('💎 Premium')} - ${chalk.green(`$${comp.price}`)}`);
      }
      logger.info('');
    });
  }

  async displayComponentDetails(component: ComponentMetadata): Promise<void> {
    logger.info(chalk.bold(`\n📦 ${component.name} v${component.version}\n`));
    logger.info(component.description);
    logger.info(`\n${chalk.gray('Author:')} ${component.author.name}`);
    logger.info(`${chalk.gray('Category:')} ${component.category}`);
    logger.info(`${chalk.gray('Frameworks:')} ${component.frameworks.join(', ')}`);
    logger.info(`${chalk.gray('Downloads:')} ${component.downloads.toLocaleString()}`);
    logger.info(`${chalk.gray('Rating:')} ${component.rating.toFixed(1)} ⭐ (${component.reviews} reviews)`);
    
    if (component.tags.length > 0) {
      logger.info(`${chalk.gray('Tags:')} ${component.tags.join(', ')}`);
    }

    if (component.premium) {
      logger.info(`\n${chalk.yellow('💎 Premium Component')} - ${chalk.green(`$${component.price}`)}`);
    }

    if (component.dependencies) {
      logger.info(`\n${chalk.gray('Dependencies:')}`);
      Object.entries(component.dependencies).forEach(([name, version]) => {
        logger.info(`  ${name}: ${version}`);
      });
    }

    if (component.homepage) {
      logger.info(`\n${chalk.gray('Homepage:')} ${chalk.blue(component.homepage)}`);
    }

    if (component.repository) {
      logger.info(`${chalk.gray('Repository:')} ${chalk.blue(component.repository)}`);
    }
  }

  async searchByTags(tags: string[]): Promise<ComponentMetadata[]> {
    return this.search({ tags, sort: 'downloads' });
  }

  async searchByCategory(category: string): Promise<ComponentMetadata[]> {
    return this.search({ category, sort: 'downloads' });
  }

  async searchByFramework(framework: string): Promise<ComponentMetadata[]> {
    return this.search({ framework, sort: 'downloads' });
  }

  async getTrending(limit: number = 10): Promise<ComponentMetadata[]> {
    const stats = await this.client.getStats();
    return stats.topComponents.slice(0, limit);
  }

  async getNewest(limit: number = 10): Promise<ComponentMetadata[]> {
    return this.search({ sort: 'newest', limit });
  }
}