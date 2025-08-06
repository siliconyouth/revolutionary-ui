import { BaseCommand, type CLIContext, createLogger, RegistrySync, ComponentRegistry, select, multiselect, confirm } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';
import Table from 'cli-table3';

export class SyncRegistryCommand extends BaseCommand {
  name = 'sync-registry';
  description = 'Sync components with the Revolutionary UI registry';
  alias = ['sync-components', 'registry-sync'];
  
  options = [
    { flags: '--check', description: 'Check for updates without syncing' },
    { flags: '--force', description: 'Force sync all components' },
    { flags: '--categories <list>', description: 'Sync specific categories (comma-separated)' },
    { flags: '--components <list>', description: 'Sync specific components (comma-separated)' },
    { flags: '--parallel <n>', description: 'Number of parallel downloads', defaultValue: '3' },
    { flags: '--clear-cache', description: 'Clear registry cache before syncing' },
  ];

  async action(options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    const sync = new RegistrySync(context.config);
    const registry = new ComponentRegistry(context.config);
    
    logger.info(chalk.bold('\n🔄 Registry Sync\n'));

    try {
      // Clear cache if requested
      if (options.clearCache) {
        logger.info('Clearing registry cache...');
        await registry.clearCache();
      }

      // Check for updates
      if (options.check) {
        await this.checkForUpdates(sync);
        return;
      }

      // Get sync options
      const syncOptions = await this.getSyncOptions(options, sync, registry);
      
      if (!syncOptions) {
        logger.info('Sync cancelled');
        return;
      }

      // Set up event listeners
      this.setupEventListeners(sync);

      // Perform sync
      const result = await sync.sync(syncOptions);

      // Show results
      this.showSyncResults(result);

    } catch (error: any) {
      logger.error('Sync failed:', error.message);
    }
  }

  private async checkForUpdates(sync: RegistrySync): Promise<void> {
    const logger = createLogger();
    
    logger.info('Checking for component updates...\n');
    
    const updates = await sync.checkForUpdates();
    
    if (updates.length === 0) {
      logger.success('All components are up to date! ✨');
      return;
    }

    logger.info(`Found ${chalk.yellow(updates.length)} component(s) with updates:\n`);

    const table = new Table({
      head: ['Component', 'Current', 'Latest', 'Breaking'],
      colWidths: [25, 15, 15, 10],
      style: {
        head: ['cyan'],
      },
    });

    updates.forEach(update => {
      table.push([
        update.name,
        update.currentVersion,
        chalk.green(update.latestVersion),
        update.breaking ? chalk.red('Yes') : chalk.gray('No'),
      ]);
    });

    console.log(table.toString());

    // Offer to update
    const shouldUpdate = await confirm('\nWould you like to update these components?', true);
    
    if (shouldUpdate) {
      const componentsToUpdate = updates.map(u => u.name);
      const result = await sync.sync({ components: componentsToUpdate });
      this.showSyncResults(result);
    }
  }

  private async getSyncOptions(
    options: any,
    sync: RegistrySync,
    registry: ComponentRegistry
  ): Promise<any> {
    const syncOptions: any = {
      force: options.force,
      parallel: parseInt(options.parallel),
    };

    // Handle specific components
    if (options.components) {
      syncOptions.components = options.components.split(',').map((c: string) => c.trim());
      return syncOptions;
    }

    // Handle categories
    if (options.categories) {
      syncOptions.categories = options.categories.split(',').map((c: string) => c.trim());
      return syncOptions;
    }

    // Interactive mode
    const action = await select('What would you like to sync?', [
      { name: 'Update installed components', value: 'update' },
      { name: 'Sync specific components', value: 'components' },
      { name: 'Sync entire categories', value: 'categories' },
      { name: 'Sync everything (full sync)', value: 'all' },
      { name: 'Cancel', value: 'cancel' },
    ]);

    if (action === 'cancel') {
      return null;
    }

    switch (action) {
      case 'update':
        // Default behavior - sync only installed components
        break;
        
      case 'components':
        const allComponents = await registry.searchComponents({});
        const selected = await multiselect(
          'Select components to sync:',
          allComponents.map(c => ({
            name: `${c.name} - ${c.description}`,
            value: c.name,
          }))
        );
        syncOptions.components = selected;
        break;
        
      case 'categories':
        const categories = await registry.getCategories();
        const selectedCats = await multiselect(
          'Select categories to sync:',
          categories.map(c => ({
            name: `${c.name} (${c.count} components)`,
            value: c.name,
          }))
        );
        syncOptions.categories = selectedCats;
        break;
        
      case 'all':
        const confirmAll = await confirm(
          'This will sync ALL components from the registry. Continue?',
          false
        );
        if (!confirmAll) return null;
        
        const allCats = await registry.getCategories();
        syncOptions.categories = allCats.map(c => c.name);
        break;
    }

    return syncOptions;
  }

  private setupEventListeners(sync: RegistrySync): void {
    const logger = createLogger();
    
    sync.on('sync:start', ({ total }) => {
      logger.info(`Starting sync of ${chalk.cyan(total)} components...\n`);
    });

    sync.on('sync:progress', ({ current, total, component, action }) => {
      const percentage = Math.round((current / total) * 100);
      const actionColor = action === 'synced' ? chalk.green : 
                         action === 'updated' ? chalk.yellow : 
                         chalk.gray;
      
      logger.debug(`[${percentage}%] ${actionColor(action)} ${component}`);
    });

    sync.on('sync:error', ({ component, error }) => {
      logger.error(`Failed to sync ${component}: ${error}`);
    });
  }

  private showSyncResults(result: any): void {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n📊 Sync Results:\n'));

    if (result.synced.length > 0) {
      logger.info(`${chalk.green('✓')} Synced: ${result.synced.length} components`);
      if (result.synced.length <= 5) {
        result.synced.forEach((c: string) => logger.info(`  • ${c}`));
      }
    }

    if (result.updated.length > 0) {
      logger.info(`${chalk.yellow('↑')} Updated: ${result.updated.length} components`);
      if (result.updated.length <= 5) {
        result.updated.forEach((c: string) => logger.info(`  • ${c}`));
      }
    }

    if (result.skipped.length > 0) {
      logger.info(`${chalk.gray('○')} Skipped: ${result.skipped.length} components`);
    }

    if (result.failed.length > 0) {
      logger.info(`${chalk.red('✗')} Failed: ${result.failed.length} components`);
      if (result.failed.length <= 5) {
        result.failed.forEach((c: string) => logger.error(`  • ${c}`));
      }
    }

    logger.info(`\nCompleted in ${chalk.gray(this.formatDuration(result.duration))}`);

    // Show sync statistics
    const stats = sync.getStats();
    logger.info(chalk.gray(`\nTotal synced components: ${stats.totalSynced}`));
    
    if (stats.lastSync) {
      logger.info(chalk.gray(`Last sync: ${new Date(stats.lastSync).toLocaleString()}`));
    }
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }
}