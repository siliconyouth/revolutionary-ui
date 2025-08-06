import { BaseCommand, type CLIContext, createLogger, select, input } from '@revolutionary-ui/cli-core';
import { ComponentSearch } from './search.js';
import { ComponentInstaller } from './install.js';
import { MarketplaceClient } from './client.js';
import chalk from 'chalk';

export class BrowseCommand extends BaseCommand {
  name = 'browse';
  description = 'Browse and explore the component marketplace';
  alias = ['marketplace', 'explore'];
  
  private client: MarketplaceClient;
  private search: ComponentSearch;
  private installer: ComponentInstaller;
  
  constructor() {
    super();
    
    this.client = new MarketplaceClient();
    this.search = new ComponentSearch(this.client);
    this.installer = new ComponentInstaller(this.client);
    
    this.options = [
      {
        flags: '-c, --category <category>',
        description: 'Filter by category',
      },
      {
        flags: '-f, --framework <framework>',
        description: 'Filter by framework',
      },
      {
        flags: '--trending',
        description: 'Show trending components',
      },
      {
        flags: '--newest',
        description: 'Show newest components',
      },
    ];
  }
  
  async action(options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    try {
      logger.info(chalk.cyan(`
╔═══════════════════════════════════════════════════════╗
║          Revolutionary UI Component Marketplace        ║
╚═══════════════════════════════════════════════════════╝
      `));
      
      // Show marketplace stats
      await this.showStats();
      
      // Handle specific options
      if (options.trending) {
        await this.showTrending();
        return;
      }
      
      if (options.newest) {
        await this.showNewest();
        return;
      }
      
      if (options.category) {
        const components = await this.search.searchByCategory(options.category);
        this.search.displayResults(components);
        return;
      }
      
      if (options.framework) {
        const components = await this.search.searchByFramework(options.framework);
        this.search.displayResults(components);
        return;
      }
      
      // Interactive browse mode
      await this.interactiveBrowse();
      
    } catch (error) {
      logger.error('Failed to browse marketplace:', error);
    }
  }
  
  private async showStats(): Promise<void> {
    const logger = createLogger();
    
    try {
      const stats = await this.client.getStats();
      
      logger.info(chalk.bold('\n📊 Marketplace Statistics:\n'));
      logger.info(`  Total Components: ${chalk.cyan(stats.totalComponents.toLocaleString())}`);
      logger.info(`  Total Downloads: ${chalk.green(stats.totalDownloads.toLocaleString())}`);
      logger.info(`  Total Authors: ${chalk.yellow(stats.totalAuthors.toLocaleString())}`);
      
      logger.info(chalk.bold('\n📁 Categories:'));
      Object.entries(stats.categories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .forEach(([category, count]) => {
          logger.info(`  ${category}: ${count}`);
        });
      
      logger.info(chalk.bold('\n🔧 Frameworks:'));
      Object.entries(stats.frameworks)
        .sort(([, a], [, b]) => b - a)
        .forEach(([framework, count]) => {
          logger.info(`  ${framework}: ${count}`);
        });
    } catch (error) {
      logger.debug('Failed to load stats:', error);
    }
  }
  
  private async showTrending(): Promise<void> {
    const logger = createLogger();
    logger.info(chalk.bold('\n🔥 Trending Components:\n'));
    
    const trending = await this.search.getTrending(10);
    this.search.displayResults(trending);
  }
  
  private async showNewest(): Promise<void> {
    const logger = createLogger();
    logger.info(chalk.bold('\n✨ Newest Components:\n'));
    
    const newest = await this.search.getNewest(10);
    this.search.displayResults(newest);
  }
  
  private async interactiveBrowse(): Promise<void> {
    const logger = createLogger();
    
    while (true) {
      const action = await select('\nWhat would you like to do?', [
        { name: '🔍 Search components', value: 'search' },
        { name: '📁 Browse by category', value: 'category' },
        { name: '🔧 Browse by framework', value: 'framework' },
        { name: '🔥 View trending', value: 'trending' },
        { name: '✨ View newest', value: 'newest' },
        { name: '🏷️  Search by tags', value: 'tags' },
        { name: '🚪 Exit', value: 'exit' },
      ]);
      
      switch (action) {
        case 'search':
          const component = await this.search.interactiveSearch();
          if (component) {
            await this.handleComponentAction(component);
          }
          break;
          
        case 'category':
          await this.browseByCategoryInteractive();
          break;
          
        case 'framework':
          await this.browseByFrameworkInteractive();
          break;
          
        case 'trending':
          await this.showTrending();
          break;
          
        case 'newest':
          await this.showNewest();
          break;
          
        case 'tags':
          await this.searchByTagsInteractive();
          break;
          
        case 'exit':
          logger.info('\nThank you for browsing! 👋\n');
          return;
      }
    }
  }
  
  private async browseByCategoryInteractive(): Promise<void> {
    const categories = await this.client.getCategories();
    const category = await select('Select category:', 
      categories.map(cat => ({ name: cat, value: cat }))
    );
    
    const components = await this.search.searchByCategory(category);
    this.search.displayResults(components);
  }
  
  private async browseByFrameworkInteractive(): Promise<void> {
    const frameworks = await this.client.getFrameworks();
    const framework = await select('Select framework:', 
      frameworks.map(fw => ({ name: fw, value: fw }))
    );
    
    const components = await this.search.searchByFramework(framework);
    this.search.displayResults(components);
  }
  
  private async searchByTagsInteractive(): Promise<void> {
    const tagsInput = await input('Enter tags (comma-separated):', 'dashboard, admin');
    const tags = tagsInput.split(',').map(t => t.trim());
    
    const components = await this.search.searchByTags(tags);
    this.search.displayResults(components);
  }
  
  private async handleComponentAction(component: any): Promise<void> {
    const action = await select('What would you like to do?', [
      { name: '📥 Install this component', value: 'install' },
      { name: '🔗 View on web', value: 'web' },
      { name: '🔙 Back to browse', value: 'back' },
    ]);
    
    switch (action) {
      case 'install':
        await this.installer.install(component.id);
        break;
        
      case 'web':
        const logger = createLogger();
        logger.info(`\n🌐 View at: ${chalk.blue(`https://revolutionary-ui.com/marketplace/${component.id}`)}\n`);
        break;
    }
  }
}