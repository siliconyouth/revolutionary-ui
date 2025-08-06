import { BaseCommand, type CLIContext, ComponentRegistry, RegistryClient, select, multiselect, input, confirm, createLogger } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';
import Table from 'cli-table3';

export class BrowseCommand extends BaseCommand {
  name = 'browse';
  description = 'Browse the Revolutionary UI component marketplace';
  alias = ['marketplace', 'explore'];
  
  options = [
    { flags: '-c, --category <category>', description: 'Filter by category' },
    { flags: '-f, --framework <framework>', description: 'Filter by framework' },
    { flags: '-s, --search <query>', description: 'Search components' },
    { flags: '--trending', description: 'Show trending components' },
    { flags: '--popular', description: 'Show popular components' },
    { flags: '--recent', description: 'Show recently added components' },
  ];

  async action(options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    const registry = new ComponentRegistry(context.config);
    const client = new RegistryClient({ config: context.config });
    
    logger.info(chalk.bold('\n🛍️  Revolutionary UI Component Marketplace\n'));

    try {
      // Handle different browse modes
      if (options.trending) {
        await this.showTrending(client);
      } else if (options.search) {
        await this.searchComponents(registry, options.search);
      } else if (options.category) {
        await this.browseCategory(registry, options.category);
      } else if (options.framework) {
        await this.browseFramework(registry, options.framework);
      } else {
        // Interactive browse mode
        await this.interactiveBrowse(registry, client);
      }
    } catch (error: any) {
      logger.error('Failed to browse marketplace:', error.message);
    }
  }

  private async interactiveBrowse(registry: ComponentRegistry, client: RegistryClient): Promise<void> {
    const logger = createLogger();
    
    while (true) {
      const action = await select('What would you like to do?', [
        { name: 'Browse by category', value: 'category' },
        { name: 'Search components', value: 'search' },
        { name: 'View trending', value: 'trending' },
        { name: 'View popular', value: 'popular' },
        { name: 'View recent', value: 'recent' },
        { name: 'View statistics', value: 'stats' },
        { name: 'Exit', value: 'exit' },
      ]);

      if (action === 'exit') break;

      switch (action) {
        case 'category':
          await this.browseCategoriesInteractive(registry);
          break;
        case 'search':
          const query = await input('Search query:');
          await this.searchComponents(registry, query);
          break;
        case 'trending':
          await this.showTrending(client);
          break;
        case 'popular':
          await this.showPopular(registry);
          break;
        case 'recent':
          await this.showRecent(registry);
          break;
        case 'stats':
          await this.showStats(registry);
          break;
      }

      console.log(); // Add spacing
    }
  }

  private async browseCategoriesInteractive(registry: ComponentRegistry): Promise<void> {
    const categories = await registry.getCategories();
    
    const category = await select('Select a category:', 
      categories.map(c => ({
        name: `${c.name} (${c.count} components)`,
        value: c.name,
      }))
    );

    await this.browseCategory(registry, category);
  }

  private async browseCategory(registry: ComponentRegistry, category: string): Promise<void> {
    const logger = createLogger();
    const components = await registry.getComponentsByCategory(category);
    
    logger.info(chalk.bold(`\n📁 Category: ${category}\n`));
    
    if (components.length === 0) {
      logger.info('No components found in this category.');
      return;
    }

    this.displayComponents(components);
    
    await this.selectComponentAction(registry, components);
  }

  private async browseFramework(registry: ComponentRegistry, framework: string): Promise<void> {
    const logger = createLogger();
    const components = await registry.searchComponents({ framework });
    
    logger.info(chalk.bold(`\n🔧 Framework: ${framework}\n`));
    
    if (components.length === 0) {
      logger.info('No components found for this framework.');
      return;
    }

    this.displayComponents(components);
    
    await this.selectComponentAction(registry, components);
  }

  private async searchComponents(registry: ComponentRegistry, query: string): Promise<void> {
    const logger = createLogger();
    logger.info(chalk.bold(`\n🔍 Search results for "${query}"\n`));
    
    const components = await registry.searchComponents({ search: query });
    
    if (components.length === 0) {
      logger.info('No components found matching your search.');
      return;
    }

    this.displayComponents(components);
    
    await this.selectComponentAction(registry, components);
  }

  private async showTrending(client: RegistryClient): Promise<void> {
    const logger = createLogger();
    logger.info(chalk.bold('\n🔥 Trending Components\n'));
    
    try {
      const components = await client.getTrending('week');
      this.displayComponents(components);
    } catch (error) {
      logger.info('Unable to fetch trending components at this time.');
    }
  }

  private async showPopular(registry: ComponentRegistry): Promise<void> {
    const logger = createLogger();
    logger.info(chalk.bold('\n⭐ Popular Components\n'));
    
    const stats = await registry.getStats();
    this.displayComponents(stats.popularComponents);
  }

  private async showRecent(registry: ComponentRegistry): Promise<void> {
    const logger = createLogger();
    logger.info(chalk.bold('\n🆕 Recently Added Components\n'));
    
    const stats = await registry.getStats();
    this.displayComponents(stats.recentComponents);
  }

  private async showStats(registry: ComponentRegistry): Promise<void> {
    const logger = createLogger();
    const stats = await registry.getStats();
    
    logger.info(chalk.bold('\n📊 Marketplace Statistics\n'));
    logger.info(`Total components: ${chalk.cyan(stats.totalComponents)}`);
    logger.info(`Total categories: ${chalk.cyan(stats.totalCategories)}`);
    logger.info(`Most popular: ${chalk.cyan(stats.popularComponents[0]?.name || 'N/A')}`);
    logger.info(`Newest addition: ${chalk.cyan(stats.recentComponents[0]?.name || 'N/A')}`);
  }

  private displayComponents(components: any[]): void {
    const table = new Table({
      head: ['Name', 'Category', 'Framework', 'Description'],
      colWidths: [20, 15, 15, 50],
      wordWrap: true,
      style: {
        head: ['cyan'],
      },
    });

    components.forEach(comp => {
      table.push([
        comp.name,
        comp.category,
        Array.isArray(comp.framework) ? comp.framework.join(', ') : comp.framework,
        comp.description,
      ]);
    });

    console.log(table.toString());
  }

  private async selectComponentAction(registry: ComponentRegistry, components: any[]): Promise<void> {
    const logger = createLogger();
    
    const selectedNames = await multiselect(
      'Select components to view details (Space to select, Enter to confirm):',
      components.map(c => ({
        name: c.name,
        value: c.name,
        description: c.description,
      }))
    );

    if (selectedNames.length === 0) return;

    for (const name of selectedNames) {
      const component = components.find(c => c.name === name);
      if (!component) continue;

      logger.info(chalk.bold(`\n📦 ${component.name}`));
      logger.info(`Description: ${component.description}`);
      logger.info(`Category: ${chalk.cyan(component.category)}`);
      logger.info(`Framework: ${chalk.cyan(Array.isArray(component.framework) ? component.framework.join(', ') : component.framework)}`);
      
      if (component.metadata) {
        if (component.metadata.author) {
          logger.info(`Author: ${chalk.gray(component.metadata.author)}`);
        }
        if (component.metadata.downloads) {
          logger.info(`Downloads: ${chalk.green(component.metadata.downloads)}`);
        }
        if (component.metadata.rating) {
          logger.info(`Rating: ${chalk.yellow('★'.repeat(Math.round(component.metadata.rating)))} ${component.metadata.rating}/5`);
        }
      }

      const action = await select('\nWhat would you like to do?', [
        { name: 'Add to project', value: 'add' },
        { name: 'View source', value: 'source' },
        { name: 'View dependencies', value: 'deps' },
        { name: 'Skip', value: 'skip' },
      ]);

      switch (action) {
        case 'add':
          logger.info(`\nTo add this component, run:`);
          logger.info(chalk.cyan(`  rui add ${name}\n`));
          break;
        case 'source':
          // In a real implementation, this would show the source files
          logger.info('\nComponent files:');
          component.files?.forEach((file: any) => {
            logger.info(`  • ${file.path}`);
          });
          break;
        case 'deps':
          if (component.dependencies?.length) {
            logger.info('\nDependencies:');
            component.dependencies.forEach((dep: string) => {
              logger.info(`  • ${dep}`);
            });
          } else {
            logger.info('\nNo dependencies required.');
          }
          break;
      }
    }
  }
}