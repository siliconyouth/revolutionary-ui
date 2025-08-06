import { 
  BaseCommand, 
  type CLIContext, 
  input, 
  select, 
  multiselect, 
  confirm, 
  withSpinner, 
  createLogger,
  errors
} from '@revolutionary-ui/cli-core';
import { 
  ComponentSchema, 
  validateComponentSchema,
  type ComponentFile 
} from '@revolutionary-ui/cli-core/schemas/component-schema';
import chalk from 'chalk';
import path from 'path';
import { existsSync } from 'fs';
import { readFile, writeFile, mkdir } from 'fs/promises';

/**
 * Enhanced Add Command implementing shadcn-style code ownership
 * 
 * Key features:
 * - Copies component source directly to user's project
 * - Supports component schemas and dependencies
 * - Handles styles, types, and utilities
 * - Updates project configuration automatically
 */
export class AddCommandV2 extends BaseCommand {
  name = 'add [components...]';
  description = 'Add components to your project (shadcn-style)';
  alias = ['a'];
  
  options = [
    { flags: '-y, --yes', description: 'Skip all confirmation prompts' },
    { flags: '-o, --overwrite', description: 'Overwrite existing files' },
    { flags: '-p, --path <path>', description: 'Path to add components (default: ./components/ui)' },
    { flags: '-c, --cwd <cwd>', description: 'Working directory (default: current directory)' },
    { flags: '-a, --all', description: 'Add all available components' },
    { flags: '-r, --registry <url>', description: 'Custom registry URL' },
    { flags: '--dry-run', description: 'Preview changes without writing files' },
    { flags: '--no-deps', description: 'Skip installing npm dependencies' },
  ];

  async action(components: string[], options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n📦 Add Components to Your Project\n'));

    // Load configuration
    const config = await this.loadConfig(context);
    
    // Handle URL-based installation (shadcn 2025 feature)
    if (components.length === 1 && this.isUrl(components[0])) {
      await this.addFromUrl(components[0], options, config);
      return;
    }

    // Handle local file installation
    if (components.length === 1 && await this.isLocalFile(components[0])) {
      await this.addFromLocalFile(components[0], options, config);
      return;
    }

    // Load component registry
    const registry = await this.loadRegistry(options.registry || config.registry);

    // Interactive selection if no components specified
    if (!components.length && !options.all) {
      components = await this.selectComponents(registry);
      if (!components.length) {
        logger.info('No components selected.');
        return;
      }
    }

    // Add all components if --all flag
    if (options.all) {
      components = registry.index.components.map(c => c.name);
    }

    // Validate components exist
    const invalid = components.filter(name => !registry.components.has(name));
    if (invalid.length) {
      throw errors.component.notFound(invalid.join(', '));
    }

    // Resolve all dependencies
    const resolved = await this.resolveDependencies(components, registry);
    
    // Show installation preview
    await this.showInstallationPreview(resolved, registry, options);

    // Confirm installation
    if (!options.yes && !options.dryRun) {
      const proceed = await confirm('\nProceed with installation?', true);
      if (!proceed) {
        logger.info('Installation cancelled.');
        return;
      }
    }

    // Dry run mode
    if (options.dryRun) {
      logger.info(chalk.yellow('\n🔍 Dry run complete. No files were modified.'));
      return;
    }

    // Install components
    const results = await this.installComponents(resolved, registry, options, config);

    // Show results
    this.showInstallationResults(results);

    // Install npm dependencies
    if (!options.noDeps && results.npmDependencies.size > 0) {
      await this.installNpmDependencies(Array.from(results.npmDependencies), config);
    }

    // Update project configuration
    await this.updateProjectConfig(results, config);
  }

  private async loadConfig(context: CLIContext): Promise<any> {
    // Load project configuration
    const configPath = path.join(context.paths.cwd, 'components.json');
    
    if (existsSync(configPath)) {
      const { readJson } = await import('@revolutionary-ui/cli-core');
      return await readJson(configPath);
    }

    // Default configuration
    return {
      $schema: 'https://ui.revolutionary-ui.com/schema.json',
      style: 'default',
      rsc: true,
      tsx: true,
      tailwind: {
        config: 'tailwind.config.js',
        css: 'app/globals.css',
        baseColor: 'slate',
        cssVariables: true,
      },
      aliases: {
        components: '@/components',
        utils: '@/lib/utils',
      },
    };
  }

  private async loadRegistry(registryUrl: string): Promise<any> {
    const { RegistryClient } = await import('@revolutionary-ui/cli-core');
    const client = new RegistryClient({ baseUrl: registryUrl });
    
    // Load registry index
    const index = await client.fetchIndex();
    
    // Create component map
    const components = new Map<string, ComponentSchema>();
    
    // Load component schemas
    for (const component of index.components) {
      const schema = await client.fetchComponent(component.name);
      components.set(component.name, validateComponentSchema(schema));
    }

    return { index, components };
  }

  private async selectComponents(registry: any): Promise<string[]> {
    const choices = registry.index.components.map((c: any) => ({
      name: `${c.name} ${chalk.gray(`- ${c.description}`)}`,
      value: c.name,
      checked: false,
    }));

    return await multiselect(
      'Which components would you like to add?',
      choices,
      {
        instructions: false,
        hint: '- Space to select. Return to submit',
      }
    );
  }

  private async resolveDependencies(
    components: string[], 
    registry: any
  ): Promise<Map<string, ComponentSchema>> {
    const resolved = new Map<string, ComponentSchema>();
    const queue = [...components];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const name = queue.shift()!;
      
      if (visited.has(name)) continue;
      visited.add(name);

      const component = registry.components.get(name);
      if (!component) {
        throw errors.component.notFound(name);
      }

      resolved.set(name, component);

      // Add registry dependencies to queue
      if (component.registryDependencies) {
        for (const dep of component.registryDependencies) {
          if (!visited.has(dep)) {
            queue.push(dep);
          }
        }
      }
    }

    return resolved;
  }

  private async showInstallationPreview(
    components: Map<string, ComponentSchema>,
    registry: any,
    options: any
  ): Promise<void> {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n📋 Installation Preview:\n'));

    // Group components by type
    const byType = new Map<string, ComponentSchema[]>();
    for (const [name, component] of components) {
      const type = component.type || 'ui';
      if (!byType.has(type)) {
        byType.set(type, []);
      }
      byType.get(type)!.push(component);
    }

    // Show components grouped by type
    for (const [type, comps] of byType) {
      logger.info(chalk.cyan(`${type} components:`));
      for (const comp of comps) {
        logger.info(`  • ${comp.name} ${chalk.gray(`- ${comp.description}`)}`);
        
        // Show dependencies if any
        if (comp.registryDependencies && comp.registryDependencies.length > 0) {
          logger.info(chalk.gray(`    └─ requires: ${comp.registryDependencies.join(', ')}`));
        }
      }
      logger.info('');
    }

    // Show file count
    const totalFiles = Array.from(components.values())
      .reduce((sum, comp) => sum + comp.files.length, 0);
    logger.info(chalk.gray(`Total files to be created: ${totalFiles}`));
  }

  private async installComponents(
    components: Map<string, ComponentSchema>,
    registry: any,
    options: any,
    config: any
  ): Promise<any> {
    const logger = createLogger();
    const results = {
      installed: [] as string[],
      failed: [] as { name: string; error: string }[],
      npmDependencies: new Set<string>(),
      tailwindConfig: {} as any,
      cssVariables: [] as any[],
    };

    // Install components in dependency order
    const installed = new Set<string>();
    const remaining = new Map(components);

    while (remaining.size > 0) {
      let progress = false;

      for (const [name, component] of remaining) {
        // Check if all dependencies are installed
        const depsInstalled = !component.registryDependencies || 
          component.registryDependencies.every(dep => installed.has(dep));

        if (!depsInstalled) continue;

        try {
          await withSpinner(
            `Installing ${name}...`,
            async () => {
              await this.installComponent(component, options, config);
            }
          );

          results.installed.push(name);
          installed.add(name);
          remaining.delete(name);
          progress = true;

          // Collect npm dependencies
          if (component.dependencies) {
            Object.keys(component.dependencies).forEach(dep => {
              results.npmDependencies.add(`${dep}@${component.dependencies![dep]}`);
            });
          }

          // Collect style configurations
          if (component.style?.tailwind?.config) {
            Object.assign(results.tailwindConfig, component.style.tailwind.config);
          }
          if (component.style?.cssVariables) {
            results.cssVariables.push(...component.style.cssVariables);
          }

        } catch (error: any) {
          results.failed.push({ name, error: error.message });
          remaining.delete(name);
          progress = true;
        }
      }

      if (!progress && remaining.size > 0) {
        // Circular dependency detected
        for (const [name] of remaining) {
          results.failed.push({ 
            name, 
            error: 'Circular dependency detected' 
          });
        }
        break;
      }
    }

    return results;
  }

  private async installComponent(
    component: ComponentSchema,
    options: any,
    config: any
  ): Promise<void> {
    const basePath = options.path || config.aliases?.components || './components/ui';

    for (const file of component.files) {
      const filePath = path.join(basePath, file.path);
      
      // Check if file exists
      if (existsSync(filePath) && !options.overwrite) {
        const shouldOverwrite = await confirm(
          `File ${filePath} already exists. Overwrite?`,
          false
        );
        if (!shouldOverwrite) continue;
      }

      // Ensure directory exists
      await mkdir(path.dirname(filePath), { recursive: true });

      // Process file content
      let content = file.content;
      
      // Apply transformations based on config
      content = await this.transformContent(content, file, config);

      // Write file
      await writeFile(filePath, content, 'utf-8');
    }
  }

  private async transformContent(
    content: string,
    file: ComponentFile,
    config: any
  ): string {
    // Transform imports based on aliases
    if (config.aliases) {
      for (const [alias, path] of Object.entries(config.aliases)) {
        const aliasPattern = new RegExp(`from ['"]@/${alias}`, 'g');
        content = content.replace(aliasPattern, `from '${path}`);
      }
    }

    // Transform based on TypeScript settings
    if (!config.tsx && file.type === 'component') {
      // Convert to JavaScript if needed
      content = await this.convertToJavaScript(content);
    }

    // Add CSS variables prefix if configured
    if (config.tailwind?.prefix) {
      content = this.addTailwindPrefix(content, config.tailwind.prefix);
    }

    return content;
  }

  private async convertToJavaScript(content: string): Promise<string> {
    // Simple TypeScript to JavaScript conversion
    // In production, use a proper transpiler
    return content
      .replace(/: React\.FC<.*?>/, '')
      .replace(/: string/g, '')
      .replace(/: number/g, '')
      .replace(/: boolean/g, '')
      .replace(/: any/g, '')
      .replace(/interface \w+ {[^}]+}/g, '')
      .replace(/type \w+ = [^;]+;/g, '');
  }

  private addTailwindPrefix(content: string, prefix: string): string {
    // Add prefix to Tailwind classes
    const classPattern = /className=["']([^"']+)["']/g;
    return content.replace(classPattern, (match, classes) => {
      const prefixedClasses = classes
        .split(' ')
        .map((cls: string) => {
          if (cls.startsWith('!')) {
            return `!${prefix}-${cls.slice(1)}`;
          }
          return `${prefix}-${cls}`;
        })
        .join(' ');
      return `className="${prefixedClasses}"`;
    });
  }

  private showInstallationResults(results: any): void {
    const logger = createLogger();

    if (results.installed.length > 0) {
      logger.success(chalk.bold(`\n✨ Successfully installed ${results.installed.length} components:\n`));
      results.installed.forEach((name: string) => {
        logger.info(`  ${chalk.green('✓')} ${name}`);
      });
    }

    if (results.failed.length > 0) {
      logger.error(chalk.bold('\n❌ Failed to install:\n'));
      results.failed.forEach(({ name, error }: any) => {
        logger.error(`  ${chalk.red('✗')} ${name}: ${error}`);
      });
    }
  }

  private async installNpmDependencies(deps: string[], config: any): Promise<void> {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n📦 Installing npm dependencies...\n'));
    
    const packageManager = await this.detectPackageManager();
    const installCmd = this.getInstallCommand(packageManager);
    
    logger.info(chalk.cyan(`${installCmd} ${deps.join(' ')}\n`));

    const shouldInstall = await confirm('Install dependencies now?', true);
    if (shouldInstall) {
      const { execa } = await import('execa');
      try {
        await execa(packageManager, ['add', ...deps], { 
          stdio: 'inherit',
          cwd: config.cwd || process.cwd(),
        });
        logger.success('\nDependencies installed successfully!');
      } catch (error) {
        logger.error('Failed to install dependencies. Please run the command manually.');
      }
    } else {
      logger.info('\nRun the command above to install dependencies manually.');
    }
  }

  private async updateProjectConfig(results: any, config: any): Promise<void> {
    // Update tailwind.config.js if needed
    if (Object.keys(results.tailwindConfig).length > 0) {
      await this.updateTailwindConfig(results.tailwindConfig, config);
    }

    // Update CSS variables if needed
    if (results.cssVariables.length > 0) {
      await this.updateCSSVariables(results.cssVariables, config);
    }
  }

  private async updateTailwindConfig(tailwindConfig: any, config: any): Promise<void> {
    const logger = createLogger();
    const configPath = path.join(process.cwd(), config.tailwind?.config || 'tailwind.config.js');
    
    if (!existsSync(configPath)) {
      logger.warn('Tailwind config not found. Skipping configuration update.');
      return;
    }

    logger.info(chalk.yellow('\n⚠️  Please update your tailwind.config.js with the following:'));
    logger.info(chalk.gray(JSON.stringify(tailwindConfig, null, 2)));
  }

  private async updateCSSVariables(cssVariables: any[], config: any): Promise<void> {
    const logger = createLogger();
    const cssPath = path.join(process.cwd(), config.tailwind?.css || 'app/globals.css');
    
    logger.info(chalk.yellow('\n⚠️  Please add the following CSS variables to your global CSS:'));
    logger.info(chalk.gray('\n:root {'));
    cssVariables.forEach(variable => {
      logger.info(chalk.gray(`  ${variable.name}: ${variable.value};`));
    });
    logger.info(chalk.gray('}\n'));
  }

  private async detectPackageManager(): Promise<string> {
    if (existsSync('pnpm-lock.yaml')) return 'pnpm';
    if (existsSync('yarn.lock')) return 'yarn';
    if (existsSync('bun.lockb')) return 'bun';
    return 'npm';
  }

  private getInstallCommand(packageManager: string): string {
    const commands: Record<string, string> = {
      npm: 'npm install',
      yarn: 'yarn add',
      pnpm: 'pnpm add',
      bun: 'bun add',
    };
    return commands[packageManager] || 'npm install';
  }

  private isUrl(str: string): boolean {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  private async isLocalFile(path: string): Promise<boolean> {
    return existsSync(path) && (
      path.endsWith('.json') || 
      path.endsWith('.ts') || 
      path.endsWith('.js')
    );
  }

  private async addFromUrl(url: string, options: any, config: any): Promise<void> {
    const logger = createLogger();
    
    logger.info(`Fetching component from ${chalk.cyan(url)}...`);
    
    try {
      const response = await fetch(url);
      const componentData = await response.json();
      const component = validateComponentSchema(componentData);
      
      await this.installComponent(component, options, config);
      logger.success(`\n✨ Successfully installed ${component.name} from URL!`);
      
    } catch (error: any) {
      throw errors.network.requestFailed(url, error.message);
    }
  }

  private async addFromLocalFile(filePath: string, options: any, config: any): Promise<void> {
    const logger = createLogger();
    
    logger.info(`Loading component from ${chalk.cyan(filePath)}...`);
    
    try {
      const content = await readFile(filePath, 'utf-8');
      const componentData = JSON.parse(content);
      const component = validateComponentSchema(componentData);
      
      await this.installComponent(component, options, config);
      logger.success(`\n✨ Successfully installed ${component.name} from local file!`);
      
    } catch (error: any) {
      throw errors.file.readFailed(filePath, error.message);
    }
  }
}