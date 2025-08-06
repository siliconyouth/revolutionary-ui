import { BaseCommand, type CLIContext, input, select, multiselect, confirm, withSpinner, createLogger, workspaceDetector } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';
import path from 'path';
import { existsSync } from 'fs';

export class AddCommand extends BaseCommand {
  name = 'add [components...]';
  description = 'Add components from the Revolutionary UI marketplace or registry';
  alias = ['install'];
  
  options = [
    { flags: '-y, --yes', description: 'Skip confirmation prompt' },
    { flags: '-o, --overwrite', description: 'Overwrite existing files' },
    { flags: '-p, --path <path>', description: 'Path to add components to' },
    { flags: '-a, --all', description: 'Add all available components' },
    { flags: '-r, --registry <url>', description: 'Custom registry URL' },
    { flags: '--dry-run', description: 'Preview without installing' },
  ];

  async action(components: string[], options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    logger.info(chalk.bold('\n🛒 Add Components from Revolutionary UI\n'));
    
    // Check if it's a local file (like Shadcn 2025 feature)
    if (components.length === 1 && (components[0].endsWith('.json') || existsSync(components[0]))) {
      await this.addFromLocalFile(components[0], options, context);
      return;
    }
    
    // If no components specified, show interactive selection
    if (!components.length && !options.all) {
      const registry = await this.loadRegistry(options.registry);
      const selected = await this.selectComponents(registry);
      components = selected;
    }
    
    // Add all components if --all flag
    if (options.all) {
      const registry = await this.loadRegistry(options.registry);
      components = Object.keys(registry.components);
    }
    
    // Validate components exist
    const registry = await this.loadRegistry(options.registry);
    const invalid = components.filter(c => !registry.components[c]);
    if (invalid.length) {
      const { errors } = await import('@revolutionary-ui/cli-core');
      throw errors.component.notFound(invalid.join(', '));
    }
    
    // Check dependencies
    const toInstall = await this.resolveDependencies(components, registry);
    
    // Show what will be installed
    logger.info('\n📦 Components to add:\n');
    toInstall.forEach(comp => {
      const component = registry.components[comp];
      logger.info(`  ${chalk.cyan(comp)} - ${component.description}`);
      if (component.dependencies?.length) {
        logger.info(`    ${chalk.gray('Dependencies:')} ${component.dependencies.join(', ')}`);
      }
    });
    
    // Confirm installation
    if (!options.yes && !options.dryRun) {
      const proceed = await confirm('\nContinue with installation?', true);
      if (!proceed) {
        logger.info('Installation cancelled.');
        return;
      }
    }
    
    if (options.dryRun) {
      logger.info('\n🔍 Dry run - would install:');
      toInstall.forEach(comp => {
        const component = registry.components[comp];
        component.files.forEach((file: any) => {
          logger.info(`  ${file.path}`);
        });
      });
      return;
    }
    
    // Install components using batch operations
    const { BatchOperations } = await import('@revolutionary-ui/cli-core');
    
    const batchResult = await BatchOperations.installComponents(
      toInstall,
      async (componentName) => {
        const component = registry.components[componentName];
        await this.installComponent(component, options, context);
      },
      {
        concurrency: 3,
        continueOnError: true,
        onError: (error) => {
          logger.error(`Failed to install ${error.item}: ${error.error.message}`);
        },
      }
    );
    
    const results = batchResult.success;
    
    // Show results
    logger.success(`\n✨ Successfully added ${toInstall.length} component(s)!\n`);
    
    // Show usage instructions
    logger.info(chalk.bold('Usage examples:\n'));
    toInstall.forEach(comp => {
      const component = registry.components[comp];
      if (component.usage) {
        logger.info(`  ${chalk.cyan(comp)}:`);
        logger.info(`    ${component.usage}\n`);
      }
    });
    
    // Check if we need to install npm dependencies
    const npmDeps = this.collectNpmDependencies(toInstall, registry);
    if (npmDeps.length) {
      logger.info(chalk.bold('\n📦 Install required dependencies:\n'));
      logger.info(chalk.cyan(`  npm install ${npmDeps.join(' ')}\n`));
    }
  }
  
  private async addFromLocalFile(filePath: string, options: any, context: CLIContext) {
    const logger = createLogger();
    const { readJson } = await import('@revolutionary-ui/cli-core');
    
    try {
      const componentDef = await readJson(filePath);
      logger.info(`Adding component from local file: ${chalk.cyan(filePath)}`);
      
      // Validate component definition
      if (!componentDef.name || !componentDef.files) {
        const { errors } = await import('@revolutionary-ui/cli-core');
        throw errors.component.invalid(filePath, 'Component definition must have name and files properties');
      }
      
      await this.installComponent(componentDef, options, context);
      logger.success(`\n✨ Successfully added ${componentDef.name}!`);
      
    } catch (error: any) {
      const { errors } = await import('@revolutionary-ui/cli-core');
      throw errors.file.notFound(filePath);
    }
  }
  
  private async loadRegistry(customUrl?: string): Promise<any> {
    const { realRegistryClient } = await import('@revolutionary-ui/cli-core');
    
    // Get all available components
    const components = await realRegistryClient.searchComponents({
      limit: 100,
      sortBy: 'downloads'
    });
    
    // Transform to registry format
    const registry: any = {
      version: '1.0.0',
      components: {}
    };
    
    for (const component of components) {
      const files = await realRegistryClient.getComponentFiles(component.slug);
      
      registry.components[component.slug] = {
        name: component.name,
        description: component.description,
        dependencies: component.dependencies || [],
        files: files,
        usage: `import { ${component.name} } from '@/components/${component.slug}'`,
        npmDependencies: component.devDependencies || [],
        frameworks: component.frameworks,
        hasTypescript: component.hasTypescript,
        isPremium: component.isPremium,
        price: component.price,
      };
    }
    
    return registry;
  }
  
  private async selectComponents(registry: any): Promise<string[]> {
    const choices = Object.entries(registry.components).map(([key, comp]: [string, any]) => ({
      name: comp.name,
      value: key,
      description: comp.description,
    }));
    
    return await multiselect('Select components to add:', choices);
  }
  
  private async resolveDependencies(components: string[], registry: any): Promise<string[]> {
    const toInstall = new Set(components);
    const queue = [...components];
    
    while (queue.length) {
      const current = queue.shift()!;
      const component = registry.components[current];
      
      if (component.dependencies) {
        for (const dep of component.dependencies) {
          if (!toInstall.has(dep)) {
            toInstall.add(dep);
            queue.push(dep);
          }
        }
      }
    }
    
    return Array.from(toInstall);
  }
  
  private async installComponent(component: any, options: any, context: CLIContext) {
    const { writeFile, ensureDir, fileExists } = await import('@revolutionary-ui/cli-core');
    const logger = createLogger();
    
    // Detect workspace structure
    const workspace = await workspaceDetector.detect();
    
    // Log workspace info
    if (workspace.type !== 'single') {
      logger.info(chalk.gray(`\n📁 Detected ${workspace.type} workspace`));
      if (workspace.currentPackage) {
        logger.info(chalk.gray(`📦 Current package: ${workspace.currentPackage.name} (${workspace.currentPackage.type})`));
      }
    }
    
    for (const file of component.files) {
      let installPath: string;
      
      if (options.path) {
        // Use explicit path
        installPath = path.join(options.path, file.path);
      } else if (workspace.type !== 'single') {
        // Use workspace-aware path
        const componentName = path.basename(file.path, path.extname(file.path));
        const baseInstallPath = await workspaceDetector.getComponentInstallPath(workspace, componentName);
        const relativePath = path.relative(path.join('components/ui', componentName), file.path);
        installPath = path.join(baseInstallPath, relativePath);
      } else {
        // Default path
        installPath = path.join('src', file.path);
      }
      
      // Check if file exists
      if (await fileExists(installPath) && !options.overwrite) {
        const { errors } = await import('@revolutionary-ui/cli-core');
        throw errors.file.exists(installPath);
      }
      
      // Ensure directory exists
      await ensureDir(path.dirname(installPath));
      
      // Update imports for workspace
      let content = file.content;
      if (workspace.type !== 'single' && workspace.currentPackage?.type === 'app') {
        // Update imports to use package name if in app
        content = this.updateImportsForWorkspace(content, workspace, component);
      }
      
      // Write file
      await writeFile(installPath, content);
      logger.debug(`Created: ${installPath}`);
    }
    
    return { name: component.name, success: true };
  }
  
  private updateImportsForWorkspace(content: string, workspace: any, component: any): string {
    // Update relative imports to use package imports
    // e.g., '../button' -> '@myorg/ui/button' 
    if (workspace.currentPackage?.name) {
      const packageName = workspace.currentPackage.name;
      // Simple regex to replace relative imports
      content = content.replace(
        /from ['"]\.\.?\/(.*)['"]/g,
        (match, importPath) => {
          if (importPath.startsWith('components/')) {
            return `from '${packageName}/${importPath}'`;
          }
          return match;
        }
      );
    }
    return content;
  }
  
  private collectNpmDependencies(components: string[], registry: any): string[] {
    const deps = new Set<string>();
    
    for (const comp of components) {
      const component = registry.components[comp];
      if (component.npmDependencies) {
        component.npmDependencies.forEach((dep: string) => deps.add(dep));
      }
    }
    
    return Array.from(deps);
  }
}