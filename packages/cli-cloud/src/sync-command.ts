import { BaseCommand, createLogger, withSpinner } from '@revolutionary-ui/cli-core';
import type { CLIContext } from '@revolutionary-ui/cli-core';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { CloudClient } from './cloud-client.js';
import { PushCommand } from './push-command.js';
import { PullCommand } from './pull-command.js';
import type { SyncOptions, CloudSyncStatus, CloudConflict } from './types.js';

export class SyncCommand extends BaseCommand {
  name = 'sync';
  description = 'Synchronize components with the cloud';
  alias = ['synchronize'];
  
  options = [
    { flags: '--dry-run', description: 'Show what would be synced without syncing' },
    { flags: '--force', description: 'Force sync, auto-resolving conflicts' },
    { flags: '--pull-only', description: 'Only pull changes from cloud' },
    { flags: '--push-only', description: 'Only push changes to cloud' },
    { 
      flags: '--conflict-resolution <strategy>', 
      description: 'Conflict resolution strategy: prompt, local, remote, merge',
      defaultValue: 'prompt' 
    },
  ];
  
  async action(...args: any[]): Promise<void> {
    // Extract arguments - sync has no positional args
    const options = args[args.length - 2] as SyncOptions;
    const context = args[args.length - 1] as CLIContext;
    const logger = createLogger();
    const client = new CloudClient(context.config);
    
    logger.info(chalk.bold('🔄 Synchronizing with cloud...\n'));
    
    try {
      // Connect to cloud
      await withSpinner('Connecting to cloud...', async () => {
        await client.connect();
      });
      
      // Get sync status
      const status = await withSpinner('Checking sync status...', async () => {
        return client.getSyncStatus();
      });
      
      // Display current status
      this.displaySyncStatus(status);
      
      // Handle conflicts if any
      if (status.conflicts.length > 0 && !options.force) {
        await this.handleConflicts(status.conflicts, options, client);
      }
      
      // Get changes
      const changes = await withSpinner('Analyzing changes...', async () => {
        return client.getChanges();
      });
      
      // Display changes summary
      this.displayChangesSummary(changes);
      
      if (options.dryRun) {
        logger.info(chalk.dim('\nDry run - no changes were synchronized'));
        return;
      }
      
      // Perform sync
      await this.performSync(changes, options, context, client);
      
      // Create snapshot after successful sync
      await withSpinner('Creating sync snapshot...', async () => {
        await client.createSnapshot(`Sync at ${new Date().toISOString()}`);
      });
      
      logger.info(chalk.green('\n✅ Synchronization complete!'));
      
    } catch (error: any) {
      logger.error(chalk.red(`\n❌ Sync failed: ${error.message}`));
      process.exit(1);
    } finally {
      client.disconnect();
    }
  }
  
  private displaySyncStatus(status: CloudSyncStatus): void {
    const logger = createLogger();
    
    logger.info(chalk.bold('📊 Sync Status:\n'));
    
    if (status.lastSync) {
      const lastSync = new Date(status.lastSync);
      const timeSince = this.getTimeSince(lastSync);
      logger.info(`Last sync: ${chalk.cyan(timeSince)} ago`);
    } else {
      logger.info('Last sync: Never');
    }
    
    if (status.conflicts.length > 0) {
      logger.warn(`\n${chalk.yellow('⚠️  Conflicts:')} ${status.conflicts.length}`);
      status.conflicts.forEach(c => {
        logger.warn(`  • ${c.componentName} (${c.type})`);
      });
    }
    
    const totalPending = 
      status.pendingChanges.local.length + 
      status.pendingChanges.remote.length;
    
    if (totalPending > 0) {
      logger.info(`\n${chalk.blue('📝 Pending changes:')}`);
      logger.info(`  Local: ${status.pendingChanges.local.length}`);
      logger.info(`  Remote: ${status.pendingChanges.remote.length}`);
    } else {
      logger.info(chalk.green('\n✅ Everything is up to date'));
    }
  }
  
  private getTimeSince(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  }
  
  private async handleConflicts(
    conflicts: CloudConflict[],
    options: SyncOptions,
    client: CloudClient
  ): Promise<void> {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n🔀 Resolving conflicts...\n'));
    
    for (const conflict of conflicts) {
      let resolution: 'local' | 'remote' | 'merge';
      
      if (options.conflictResolution === 'prompt' || !options.conflictResolution) {
        const { choice } = await inquirer.prompt({
          type: 'list',
          name: 'choice',
          message: `Conflict in ${chalk.cyan(conflict.componentName)}:`,
          choices: [
            { name: 'Keep local version', value: 'local' },
            { name: 'Use remote version', value: 'remote' },
            { name: 'Merge manually', value: 'merge' },
            { name: 'View differences', value: 'diff' },
          ],
        });
        
        if (choice === 'diff') {
          await this.showConflictDiff(conflict, client);
          // Ask again
          conflicts.push(conflict);
          continue;
        }
        
        resolution = choice as 'local' | 'remote' | 'merge';
      } else {
        resolution = options.conflictResolution as any;
      }
      
      if (resolution === 'merge') {
        // TODO: Implement merge editor
        logger.warn('Manual merge not yet implemented, using local version');
        resolution = 'local';
      }
      
      await client.resolveConflict(conflict.componentId, resolution);
      logger.info(`  Resolved ${conflict.componentName} with ${resolution} version`);
    }
  }
  
  private async showConflictDiff(conflict: CloudConflict, client: CloudClient): Promise<void> {
    const logger = createLogger();
    
    logger.info(chalk.bold(`\n📄 Conflict in ${conflict.componentName}:\n`));
    logger.info(`Local version: ${conflict.localVersion}`);
    logger.info(`Remote version: ${conflict.remoteVersion}`);
    logger.info(`Conflict type: ${conflict.type}`);
    
    // TODO: Fetch and display actual file contents
  }
  
  private displayChangesSummary(changes: {
    local: any[];
    remote: any[];
  }): void {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n📋 Changes to sync:\n'));
    
    if (changes.local.length > 0) {
      logger.info(chalk.blue('⬆️  Local changes to push:'));
      const byAction = this.groupByAction(changes.local);
      Object.entries(byAction).forEach(([action, items]) => {
        logger.info(`  ${this.getActionIcon(action)} ${action}: ${items.length}`);
      });
    }
    
    if (changes.remote.length > 0) {
      logger.info(chalk.blue('\n⬇️  Remote changes to pull:'));
      const byAction = this.groupByAction(changes.remote);
      Object.entries(byAction).forEach(([action, items]) => {
        logger.info(`  ${this.getActionIcon(action)} ${action}: ${items.length}`);
      });
    }
    
    if (changes.local.length === 0 && changes.remote.length === 0) {
      logger.info(chalk.green('No changes to sync'));
    }
  }
  
  private groupByAction(changes: any[]): Record<string, any[]> {
    return changes.reduce((acc, change) => {
      acc[change.action] = acc[change.action] || [];
      acc[change.action].push(change);
      return acc;
    }, {});
  }
  
  private getActionIcon(action: string): string {
    switch (action) {
      case 'create': return chalk.green('+');
      case 'update': return chalk.yellow('~');
      case 'delete': return chalk.red('-');
      default: return '?';
    }
  }
  
  private async performSync(
    changes: { local: any[]; remote: any[] },
    options: SyncOptions,
    context: CLIContext,
    client: CloudClient
  ): Promise<void> {
    const logger = createLogger();
    
    // Pull remote changes
    if (!options.push && changes.remote.length > 0) {
      logger.info(chalk.bold('\n⬇️  Pulling remote changes...\n'));
      
      const pullCommand = new PullCommand();
      const componentNames = changes.remote.map(c => c.componentName);
      
      await pullCommand.action(componentNames, {
        force: options.force,
        overwrite: true,
      }, context);
    }
    
    // Push local changes
    if (!options.pull && changes.local.length > 0) {
      logger.info(chalk.bold('\n⬆️  Pushing local changes...\n'));
      
      const pushCommand = new PushCommand();
      const componentNames = changes.local.map(c => c.componentName);
      
      await pushCommand.action(componentNames, {
        force: options.force,
        message: 'Sync changes',
      }, context);
    }
  }
}