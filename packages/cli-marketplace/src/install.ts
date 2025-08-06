import { createLogger, Spinner, confirm, fileExists, writeFile, readJson, writeJson, pMap } from '@revolutionary-ui/cli-core';
import { MarketplaceClient } from './client.js';
import type { ComponentMetadata, InstallOptions } from './types.js';
import { join, dirname } from 'path';
import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
// import tar from 'tar'; // Would be used for extracting archives

const logger = createLogger();

export class ComponentInstaller {
  private client: MarketplaceClient;

  constructor(client?: MarketplaceClient) {
    this.client = client || new MarketplaceClient();
  }

  async install(componentId: string, options: InstallOptions = {}): Promise<void> {
    const spin = new Spinner(`Fetching component ${componentId}...`);
    spin.start();

    try {
      // Fetch component metadata
      const component = await this.client.getComponent(componentId);
      if (!component) {
        throw new Error(`Component ${componentId} not found`);
      }

      spin.update(`Installing ${component.name}...`);

      // Check if component is premium and user has access
      if (component.premium && !options.offline) {
        // In production, would check user's subscription/purchase
        logger.warn('This is a premium component. Make sure you have purchased it.');
      }

      // Determine installation path
      const installPath = options.path || this.getDefaultInstallPath(component);

      // Check if already installed
      if (await fileExists(installPath) && !options.overwrite) {
        spin.stop();
        
        const shouldOverwrite = await confirm(
          `Component already exists at ${installPath}. Overwrite?`,
          false
        );
        
        if (!shouldOverwrite) {
          logger.info('Installation cancelled.');
          return;
        }
        
        spin.start();
      }

      // Download component
      spin.update(`Downloading ${component.name}...`);
      const componentData = await this.downloadAndExtract(component, installPath, options);

      // Install dependencies if requested
      if (options.dependencies !== false && component.dependencies) {
        spin.update('Installing dependencies...');
        await this.installDependencies(component, options.dev);
      }

      // Update project configuration
      await this.updateProjectConfig(component, installPath);

      spin.stop();

      logger.success(`\n✨ Successfully installed ${chalk.cyan(component.name)}`);
      logger.info(`📁 Location: ${chalk.gray(installPath)}`);

      // Show usage instructions
      this.showUsageInstructions(component, installPath);

    } catch (error) {
      spin.stop();
      logger.error('Installation failed:', error);
      throw error;
    }
  }

  async installMultiple(componentIds: string[], options: InstallOptions = {}): Promise<void> {
    logger.info(`Installing ${componentIds.length} components...\n`);

    const results = {
      success: [] as string[],
      failed: [] as { id: string; error: string }[],
    };

    // Install components in parallel with concurrency limit
    const installResults = await pMap(
      componentIds,
      async (id) => {
        try {
          await this.install(id, { ...options, dependencies: false });
          return { id, success: true, error: null };
        } catch (error: any) {
          return { id, success: false, error: error.message };
        }
      },
      3 // Install up to 3 components in parallel
    );

    // Collect results
    for (const result of installResults) {
      if (result.success) {
        results.success.push(result.id);
      } else {
        results.failed.push({ id: result.id, error: result.error! });
      }
    }

    // Install all dependencies at once
    if (options.dependencies !== false) {
      logger.info('\nInstalling all dependencies...');
      await this.installAllDependencies(results.success, options.dev);
    }

    // Show summary
    logger.info(chalk.bold('\n📊 Installation Summary:\n'));
    
    if (results.success.length > 0) {
      logger.success(`✅ Successfully installed: ${results.success.join(', ')}`);
    }
    
    if (results.failed.length > 0) {
      logger.error(`❌ Failed to install:`);
      results.failed.forEach(({ id, error }) => {
        logger.error(`   ${id}: ${error}`);
      });
    }
  }

  private async downloadAndExtract(
    component: ComponentMetadata,
    installPath: string,
    options: InstallOptions
  ): Promise<void> {
    if (options.offline) {
      // Try to find in local cache
      const cachedPath = this.getCachePath(component);
      if (await fileExists(cachedPath)) {
        await this.extractFromCache(cachedPath, installPath);
        return;
      } else {
        throw new Error('Component not found in offline cache');
      }
    }

    // Download from marketplace
    const buffer = await this.client.downloadComponent(component.id, component.version);
    
    // Save to cache
    const cachePath = this.getCachePath(component);
    await fs.mkdir(dirname(cachePath), { recursive: true });
    await fs.writeFile(cachePath, buffer);

    // Extract to install path
    await this.extractComponent(buffer, installPath);
  }

  private async extractComponent(buffer: Buffer, installPath: string): Promise<void> {
    // Create directory
    await fs.mkdir(dirname(installPath), { recursive: true });

    // For now, assume the component is a single file
    // In production, would handle tar.gz archives
    await fs.writeFile(installPath, buffer);
  }

  private async extractFromCache(cachePath: string, installPath: string): Promise<void> {
    const buffer = await fs.readFile(cachePath);
    await this.extractComponent(buffer, installPath);
  }

  private getCachePath(component: ComponentMetadata): string {
    const home = process.env.HOME || process.env.USERPROFILE || '';
    return join(home, '.revolutionary-ui', 'cache', 'components', `${component.id}-${component.version}.tar.gz`);
  }

  private getDefaultInstallPath(component: ComponentMetadata): string {
    const framework = component.frameworks[0] || 'react';
    const ext = this.getFileExtension(framework);
    
    return join(
      process.cwd(),
      'src',
      'components',
      'ui',
      `${component.name}.${ext}`
    );
  }

  private getFileExtension(framework: string): string {
    const extensions: Record<string, string> = {
      react: 'tsx',
      vue: 'vue',
      angular: 'ts',
      svelte: 'svelte',
      solid: 'tsx',
      qwik: 'tsx',
    };
    return extensions[framework] || 'tsx';
  }

  private async installDependencies(component: ComponentMetadata, dev?: boolean): Promise<void> {
    if (!component.dependencies) return;

    const deps = Object.entries(component.dependencies)
      .map(([name, version]) => `${name}@${version}`)
      .join(' ');

    const packageManager = await this.detectPackageManager();
    const command = this.getInstallCommand(packageManager, deps, dev);

    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      logger.warn('Failed to install dependencies automatically.');
      logger.info(`Run manually: ${chalk.cyan(command)}`);
    }
  }

  private async installAllDependencies(componentIds: string[], dev?: boolean): Promise<void> {
    const allDeps = new Map<string, string>();

    // Collect all dependencies
    for (const id of componentIds) {
      const component = await this.client.getComponent(id);
      if (component?.dependencies) {
        Object.entries(component.dependencies).forEach(([name, version]) => {
          allDeps.set(name, version as string);
        });
      }
    }

    if (allDeps.size === 0) return;

    const deps = Array.from(allDeps.entries())
      .map(([name, version]) => `${name}@${version}`)
      .join(' ');

    const packageManager = await this.detectPackageManager();
    const command = this.getInstallCommand(packageManager, deps, dev);

    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      logger.warn('Failed to install dependencies automatically.');
      logger.info(`Run manually: ${chalk.cyan(command)}`);
    }
  }

  private async detectPackageManager(): Promise<'npm' | 'yarn' | 'pnpm' | 'bun'> {
    if (await fileExists('bun.lockb')) return 'bun';
    if (await fileExists('pnpm-lock.yaml')) return 'pnpm';
    if (await fileExists('yarn.lock')) return 'yarn';
    return 'npm';
  }

  private getInstallCommand(pm: string, deps: string, dev?: boolean): string {
    const devFlag = dev ? '-D' : '';
    
    switch (pm) {
      case 'bun':
        return `bun add ${devFlag} ${deps}`;
      case 'pnpm':
        return `pnpm add ${devFlag} ${deps}`;
      case 'yarn':
        return `yarn add ${devFlag} ${deps}`;
      default:
        return `npm install ${devFlag} ${deps}`;
    }
  }

  private async updateProjectConfig(component: ComponentMetadata, installPath: string): Promise<void> {
    const configPath = join(process.cwd(), '.revolutionary-ui.json');
    
    let config: any = {};
    if (await fileExists(configPath)) {
      config = await readJson(configPath);
    }

    // Initialize components array if not exists
    if (!config.components) {
      config.components = [];
    }

    // Add or update component entry
    const existingIndex = config.components.findIndex((c: any) => c.id === component.id);
    const componentEntry = {
      id: component.id,
      name: component.name,
      version: component.version,
      path: installPath,
      installedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      config.components[existingIndex] = componentEntry;
    } else {
      config.components.push(componentEntry);
    }

    await writeJson(configPath, config);
  }

  private showUsageInstructions(component: ComponentMetadata, installPath: string): void {
    const relativePath = installPath.replace(process.cwd() + '/', '');
    const importPath = relativePath.replace(/\.[^.]+$/, '').replace(/^src\//, '@/');
    
    logger.info(chalk.bold('\n📖 Usage:\n'));
    
    const framework = component.frameworks[0] || 'react';
    
    switch (framework) {
      case 'react':
        logger.info(`import ${component.name} from '${importPath}';

function App() {
  return <${component.name} />;
}`);
        break;
        
      case 'vue':
        logger.info(`<script setup>
import ${component.name} from '${importPath}';
</script>

<template>
  <${component.name} />
</template>`);
        break;
        
      case 'angular':
        logger.info(`import { ${component.name} } from '${importPath}';

@Component({
  imports: [${component.name}],
  template: '<${this.toKebabCase(component.name)} />'
})`);
        break;
    }

    if (component.dependencies) {
      logger.info(`\n${chalk.gray('Dependencies:')} ${Object.keys(component.dependencies).join(', ')}`);
    }
  }

  private toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}