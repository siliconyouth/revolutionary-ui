import { BaseCommand, createLogger, withSpinner, workspaceDetector, multiselect } from '@revolutionary-ui/cli-core';
import type { CLIContext } from '@revolutionary-ui/cli-core';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { CloudClient } from './cloud-client.js';
import type { CloudComponent, PullOptions, CloudConflict } from './types.js';

export class PullCommand extends BaseCommand {
  name = 'pull [components...]';
  description = 'Pull components from the cloud';
  alias = ['download'];
  
  options = [
    { flags: '--dry-run', description: 'Show what would be pulled without pulling' },
    { flags: '--force', description: 'Force pull, overwriting local changes' },
    { flags: '--all', description: 'Pull all available components' },
    { flags: '--overwrite', description: 'Overwrite existing local files' },
  ];
  
  async action(...args: any[]): Promise<void> {
    // Extract arguments - Commander passes: [...positionalArgs, options, command]
    const components = args.length >= 3 ? args[0] : [];
    const options = args.length >= 3 ? args[args.length - 2] : args[0];
    const context = args[args.length - 1] as CLIContext;
    const logger = createLogger();
    const client = new CloudClient(context.config);
    
    logger.info(chalk.bold('⬇️  Pulling components from cloud...\n'));
    
    try {
      // Connect to cloud
      await withSpinner('Connecting to cloud...', async () => {
        await client.connect();
      });
      
      // Get available components
      const availableComponents = await withSpinner('Fetching component list...', async () => {
        return client.listComponents(options.filter);
      });
      
      // Filter components to pull
      const componentsToPull = await this.selectComponents(
        availableComponents,
        components || [],
        options
      );
      
      if (componentsToPull.length === 0) {
        logger.warn('No components selected to pull');
        return;
      }
      
      logger.info(`Selected ${chalk.cyan(componentsToPull.length)} component(s) to pull\n`);
      
      // Check for conflicts
      if (!options.force && !options.dryRun) {
        const conflicts = await this.checkLocalConflicts(componentsToPull, options);
        if (conflicts.length > 0 && !options.overwrite) {
          await this.handleConflicts(conflicts, client);
        }
      }
      
      // Display what will be pulled
      this.displayPullSummary(componentsToPull);
      
      if (options.dryRun) {
        logger.info(chalk.dim('\nDry run - no files were changed'));
        return;
      }
      
      // Pull components
      const results = await withSpinner('Pulling components...', async () => {
        return this.pullComponents(client, componentsToPull, options);
      });
      
      // Display results
      this.displayResults(results);
      
    } finally {
      client.disconnect();
    }
  }
  
  private async selectComponents(
    available: CloudComponent[],
    specified: string[],
    options: PullOptions
  ): Promise<CloudComponent[]> {
    if (options.all) {
      return available;
    }
    
    if (specified.length > 0) {
      // Filter by specified names
      return available.filter(c => 
        specified.some(name => 
          c.name.toLowerCase().includes(name.toLowerCase())
        )
      );
    }
    
    // Interactive selection
    const { selectedComponents } = await inquirer.prompt({
      type: 'checkbox',
      name: 'selectedComponents',
      message: 'Select components to pull:',
      choices: available.map(c => ({
        name: `${c.name} (${c.framework}) - ${c.description}`,
        value: c,
        checked: false,
      })),
    });
    
    return selectedComponents;
  }
  
  private async checkLocalConflicts(
    components: CloudComponent[],
    options: PullOptions
  ): Promise<Array<{ component: CloudComponent; localPath: string; exists: boolean }>> {
    const workspace = await workspaceDetector.detect();
    const conflicts = [];
    
    for (const component of components) {
      const localPath = await this.getLocalPath(component, workspace.root);
      const exists = await this.fileExists(localPath);
      
      if (exists && !options.overwrite) {
        conflicts.push({ component, localPath, exists });
      }
    }
    
    return conflicts;
  }
  
  private async handleConflicts(
    conflicts: Array<{ component: CloudComponent; localPath: string; exists: boolean }>,
    client: CloudClient
  ): Promise<void> {
    const logger = createLogger();
    
    logger.warn(chalk.yellow('\n⚠️  Local files already exist:\n'));
    
    for (const conflict of conflicts) {
      logger.warn(`  • ${conflict.localPath}`);
    }
    
    const { resolution } = await inquirer.prompt({
      type: 'list',
      name: 'resolution',
      message: 'How would you like to resolve these conflicts?',
      choices: [
        { name: 'Skip existing files', value: 'skip' },
        { name: 'Overwrite all', value: 'overwrite' },
        { name: 'Choose for each file', value: 'individual' },
        { name: 'Cancel', value: 'cancel' },
      ],
    });
    
    if (resolution === 'cancel') {
      process.exit(0);
    }
    
    if (resolution === 'skip') {
      // Remove conflicts from pull list
      conflicts.forEach(c => {
        const index = conflicts.indexOf(c);
        if (index > -1) {
          conflicts.splice(index, 1);
        }
      });
    }
    
    if (resolution === 'individual') {
      for (const conflict of conflicts) {
        const { action } = await inquirer.prompt({
          type: 'list',
          name: 'action',
          message: `${conflict.localPath} already exists. What would you like to do?`,
          choices: [
            { name: 'Overwrite', value: 'overwrite' },
            { name: 'Skip', value: 'skip' },
            { name: 'View diff', value: 'diff' },
          ],
        });
        
        if (action === 'skip') {
          const index = conflicts.indexOf(conflict);
          if (index > -1) {
            conflicts.splice(index, 1);
          }
        } else if (action === 'diff') {
          await this.showDiff(conflict.localPath, conflict.component.code);
          // Ask again
          conflicts.push(conflict);
        }
      }
    }
  }
  
  private async getLocalPath(component: CloudComponent, workspaceRoot: string): Promise<string> {
    // Determine path based on component type
    let basePath: string;
    
    switch (component.type) {
      case 'factory':
        basePath = 'src/factories';
        break;
      case 'template':
        basePath = 'templates';
        break;
      case 'config':
        basePath = '.revolutionary-ui';
        break;
      default:
        basePath = 'src/components';
    }
    
    // Add framework subdirectory for components
    if (component.type === 'component' || component.type === 'factory') {
      basePath = join(basePath, component.framework.toLowerCase());
    }
    
    // Determine file extension
    const ext = this.getFileExtension(component.framework, component.code);
    
    return join(workspaceRoot, basePath, `${component.name}.${ext}`);
  }
  
  private getFileExtension(framework: string, code: string): string {
    if (framework === 'Vue') return 'vue';
    if (framework === 'Svelte') return 'svelte';
    if (framework === 'Angular') return 'ts';
    
    // For React, check if it's TypeScript
    if (code.includes('interface') || code.includes('type ') || code.includes(': React.FC')) {
      return 'tsx';
    }
    
    return 'jsx';
  }
  
  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.stat(path);
      return true;
    } catch {
      return false;
    }
  }
  
  private async showDiff(localPath: string, remoteContent: string): Promise<void> {
    const logger = createLogger();
    
    try {
      const localContent = await fs.readFile(localPath, 'utf-8');
      
      // Simple line-by-line diff display
      const localLines = localContent.split('\n');
      const remoteLines = remoteContent.split('\n');
      
      logger.info(chalk.bold('\n📄 Diff:\n'));
      
      const maxLines = Math.max(localLines.length, remoteLines.length);
      for (let i = 0; i < maxLines; i++) {
        const local = localLines[i] || '';
        const remote = remoteLines[i] || '';
        
        if (local !== remote) {
          if (local && !remote) {
            logger.info(chalk.red(`- ${local}`));
          } else if (!local && remote) {
            logger.info(chalk.green(`+ ${remote}`));
          } else {
            logger.info(chalk.red(`- ${local}`));
            logger.info(chalk.green(`+ ${remote}`));
          }
        }
      }
    } catch (error) {
      logger.error('Failed to show diff:', error);
    }
  }
  
  private displayPullSummary(components: CloudComponent[]): void {
    const logger = createLogger();
    
    logger.info(chalk.bold('📦 Components to pull:\n'));
    
    const byType = components.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(byType).forEach(([type, count]) => {
      logger.info(`  ${chalk.cyan(type)}: ${count}`);
    });
    
    logger.info('');
    
    components.forEach(c => {
      logger.info(`  • ${chalk.green(c.name)} (${c.framework}) - ${c.description}`);
      if (c.metadata.author) {
        logger.info(`    ${chalk.gray(`by ${c.metadata.author}`)}`);
      }
    });
  }
  
  private async pullComponents(
    client: CloudClient,
    components: CloudComponent[],
    options: PullOptions
  ): Promise<Array<{ component: string; status: 'success' | 'error' | 'skipped'; error?: string }>> {
    const workspace = await workspaceDetector.detect();
    const results = [];
    
    for (const component of components) {
      try {
        const localPath = await this.getLocalPath(component, workspace.root);
        
        // Check if file exists and we're not overwriting
        if (await this.fileExists(localPath) && !options.overwrite && !options.force) {
          results.push({
            component: component.name,
            status: 'skipped' as const,
          });
          continue;
        }
        
        // Ensure directory exists
        await fs.mkdir(dirname(localPath), { recursive: true });
        
        // Write file
        await fs.writeFile(localPath, component.code, 'utf-8');
        
        results.push({
          component: component.name,
          status: 'success' as const,
        });
      } catch (error: any) {
        results.push({
          component: component.name,
          status: 'error' as const,
          error: error.message,
        });
      }
    }
    
    return results;
  }
  
  private displayResults(results: any[]): void {
    const logger = createLogger();
    
    const successful = results.filter(r => r.status === 'success');
    const skipped = results.filter(r => r.status === 'skipped');
    const failed = results.filter(r => r.status === 'error');
    
    if (successful.length > 0) {
      logger.info(chalk.green(`\n✅ Successfully pulled ${successful.length} component(s)`));
    }
    
    if (skipped.length > 0) {
      logger.info(chalk.yellow(`\n⏭️  Skipped ${skipped.length} existing file(s)`));
    }
    
    if (failed.length > 0) {
      logger.error(chalk.red(`\n❌ Failed to pull ${failed.length} component(s):`));
      failed.forEach(r => {
        logger.error(`  • ${r.component}: ${r.error}`);
      });
    }
  }
}