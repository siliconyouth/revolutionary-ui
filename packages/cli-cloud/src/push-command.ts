import { BaseCommand, createLogger, withSpinner, workspaceDetector } from '@revolutionary-ui/cli-core';
import type { CLIContext } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { join, relative } from 'path';
import { glob } from 'glob';
import crypto from 'node:crypto';
import { CloudClient } from './cloud-client.js';
import type { CloudComponent, PushOptions } from './types.js';

export class PushCommand extends BaseCommand {
  name = 'push [components...]';
  description = 'Push components to the cloud';
  alias = ['upload'];
  
  options = [
    { flags: '-m, --message <message>', description: 'Commit message for this push' },
    { flags: '-t, --tags <tags>', description: 'Comma-separated tags' },
    { flags: '--dry-run', description: 'Show what would be pushed without pushing' },
    { flags: '--force', description: 'Force push, overwriting remote changes' },
    { flags: '--all', description: 'Push all components' },
  ];
  
  async action(...args: any[]): Promise<void> {
    // Extract arguments - Commander passes: [...positionalArgs, options, command]
    const components = args.length >= 3 ? args[0] : [];
    const options = args.length >= 3 ? args[args.length - 2] : args[0];
    const context = args[args.length - 1] as CLIContext;
    const logger = createLogger();
    const client = new CloudClient(context.config);
    
    logger.info(chalk.bold('🚀 Pushing components to cloud...\n'));
    
    try {
      // Connect to cloud
      await withSpinner('Connecting to cloud...', async () => {
        await client.connect();
      });
      
      // Find components to push
      const componentsToPush = await this.findComponents(components || [], options);
      
      if (componentsToPush.length === 0) {
        logger.warn('No components found to push');
        return;
      }
      
      logger.info(`Found ${chalk.cyan(componentsToPush.length)} component(s) to push\n`);
      
      // Check for conflicts
      if (!options.force && !options.dryRun) {
        const conflicts = await this.checkConflicts(client, componentsToPush);
        if (conflicts.length > 0) {
          logger.error('Conflicts detected! Use --force to overwrite or pull first to merge');
          conflicts.forEach(c => {
            logger.error(`  • ${c.componentName}: local and remote have diverged`);
          });
          process.exit(1);
        }
      }
      
      // Display what will be pushed
      this.displayPushSummary(componentsToPush, options);
      
      if (options.dryRun) {
        logger.info(chalk.dim('\nDry run - no changes were pushed'));
        return;
      }
      
      // Push components
      const results = await withSpinner('Pushing components...', async () => {
        return this.pushComponents(client, componentsToPush, options);
      });
      
      // Create snapshot
      if (options.message) {
        await withSpinner('Creating snapshot...', async () => {
          await client.createSnapshot(options.message);
        });
      }
      
      // Display results
      this.displayResults(results);
      
    } finally {
      client.disconnect();
    }
  }
  
  private async findComponents(
    specified: string[], 
    options: PushOptions
  ): Promise<CloudComponent[]> {
    const workspace = await workspaceDetector.detect();
    const components: CloudComponent[] = [];
    
    let patterns: string[];
    
    if (options.all) {
      patterns = [
        'src/**/factories/**/*.ts',
        'src/**/components/**/*.{tsx,jsx,vue,svelte}',
        'templates/**/*.{ts,tsx,jsx,vue,svelte}',
      ];
    } else if (specified.length > 0) {
      patterns = specified;
    } else {
      // Default to changed files
      patterns = await this.getChangedFiles();
    }
    
    for (const pattern of patterns) {
      const files = await glob(pattern, {
        cwd: workspace.root,
        ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*'],
      });
      
      for (const file of files) {
        const component = await this.parseComponent(join(workspace.root, file));
        if (component) {
          components.push(component);
        }
      }
    }
    
    // Apply filters
    if (options.filter) {
      return components.filter(c => {
        if (options.filter!.types && !options.filter!.types.includes(c.type)) {
          return false;
        }
        if (options.filter!.frameworks && !options.filter!.frameworks.includes(c.framework)) {
          return false;
        }
        if (options.filter!.tags) {
          const hasTag = options.filter!.tags.some(tag => 
            c.metadata.tags.includes(tag)
          );
          if (!hasTag) return false;
        }
        return true;
      });
    }
    
    return components;
  }
  
  private async parseComponent(filePath: string): Promise<CloudComponent | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);
      const name = filePath.split('/').pop()?.replace(/\.[^.]+$/, '') || 'unknown';
      
      // Detect type and framework
      const type = this.detectComponentType(filePath);
      const framework = this.detectFramework(filePath, content);
      
      // Extract metadata from comments
      const metadata = this.extractMetadata(content);
      
      // Calculate checksum
      const checksum = crypto.createHash('sha256').update(content).digest('hex');
      
      return {
        id: '', // Will be assigned by server
        name,
        description: metadata.description || `${framework} ${type}`,
        type,
        framework,
        version: '1.0.0',
        code: content,
        metadata: {
          author: metadata.author || 'unknown',
          createdAt: stats.birthtime.toISOString(),
          updatedAt: stats.mtime.toISOString(),
          tags: metadata.tags || [],
          dependencies: metadata.dependencies || {},
          stats: {
            linesOfCode: content.split('\n').length,
            codeReduction: 0, // Will be calculated by server
          },
        },
        checksum,
      };
    } catch (error) {
      return null;
    }
  }
  
  private detectComponentType(filePath: string): CloudComponent['type'] {
    if (filePath.includes('factories/')) return 'factory';
    if (filePath.includes('templates/')) return 'template';
    if (filePath.includes('.config.')) return 'config';
    return 'component';
  }
  
  private detectFramework(filePath: string, content: string): string {
    const ext = filePath.split('.').pop();
    
    if (ext === 'vue') return 'Vue';
    if (ext === 'svelte') return 'Svelte';
    if (content.includes('@angular/')) return 'Angular';
    if (content.includes('import React') || content.includes('from "react"')) return 'React';
    if (ext === 'tsx' || ext === 'jsx') return 'React';
    
    return 'Unknown';
  }
  
  private extractMetadata(content: string): any {
    const metadata: any = {};
    
    // Extract from JSDoc comments
    const jsdocMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
    if (jsdocMatch) {
      const jsdoc = jsdocMatch[1];
      
      // Extract description
      const descMatch = jsdoc.match(/@description\s+(.+)/);
      if (descMatch) metadata.description = descMatch[1].trim();
      
      // Extract author
      const authorMatch = jsdoc.match(/@author\s+(.+)/);
      if (authorMatch) metadata.author = authorMatch[1].trim();
      
      // Extract tags
      const tagsMatch = jsdoc.match(/@tags\s+(.+)/);
      if (tagsMatch) {
        metadata.tags = tagsMatch[1].split(',').map(t => t.trim());
      }
    }
    
    // Extract dependencies from imports
    const dependencies: Record<string, string> = {};
    const importMatches = content.matchAll(/import\s+.*\s+from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      const dep = match[1];
      if (!dep.startsWith('.') && !dep.startsWith('@/')) {
        dependencies[dep] = '*';
      }
    }
    metadata.dependencies = dependencies;
    
    return metadata;
  }
  
  private async getChangedFiles(): Promise<string[]> {
    // Get git changes
    try {
      const { execSync } = await import('child_process');
      const output = execSync('git diff --name-only HEAD', { encoding: 'utf-8' });
      return output.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }
  
  private async checkConflicts(
    client: CloudClient, 
    components: CloudComponent[]
  ): Promise<any[]> {
    const status = await client.getSyncStatus();
    return status.conflicts.filter(conflict => 
      components.some(c => c.name === conflict.componentName)
    );
  }
  
  private displayPushSummary(components: CloudComponent[], options: PushOptions): void {
    const logger = createLogger();
    
    logger.info(chalk.bold('📦 Components to push:\n'));
    
    const byType = components.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(byType).forEach(([type, count]) => {
      logger.info(`  ${chalk.cyan(type)}: ${count}`);
    });
    
    logger.info('');
    
    components.forEach(c => {
      logger.info(`  • ${chalk.green(c.name)} (${c.framework})`);
    });
    
    if (options.tags) {
      const tagsArray = typeof options.tags === 'string' ? options.tags.split(',').map((t: string) => t.trim()) : options.tags;
      logger.info(`\n${chalk.gray('Tags:')} ${tagsArray.join(', ')}`);
    }
    
    if (options.message) {
      logger.info(`${chalk.gray('Message:')} ${options.message}`);
    }
  }
  
  private async pushComponents(
    client: CloudClient,
    components: CloudComponent[],
    options: PushOptions
  ): Promise<Array<{ component: string; status: 'success' | 'error'; error?: string }>> {
    const results = [];
    
    for (const component of components) {
      try {
        // Check if component exists
        const existing = await client.listComponents({
          tags: [component.name],
        });
        
        if (existing.length > 0) {
          // Update existing
          await client.updateComponent(existing[0].id, component);
        } else {
          // Create new
          await client.pushComponent(component);
        }
        
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
    const failed = results.filter(r => r.status === 'error');
    
    if (successful.length > 0) {
      logger.info(chalk.green(`\n✅ Successfully pushed ${successful.length} component(s)`));
    }
    
    if (failed.length > 0) {
      logger.error(chalk.red(`\n❌ Failed to push ${failed.length} component(s):`));
      failed.forEach(r => {
        logger.error(`  • ${r.component}: ${r.error}`);
      });
    }
  }
}