import { cosmiconfigSync, defaultLoaders } from 'cosmiconfig';
import { workspaceDetector } from './workspace-detector.js';
import { createLogger } from './logger.js';
import { fileExists, readJson } from './fs.js';
import { join } from 'path';
import type { CLIConfig } from '../types/index.js';

const logger = createLogger();

export interface ConfigHierarchy {
  global?: CLIConfig;
  workspace?: CLIConfig;
  package?: CLIConfig;
  merged: CLIConfig;
}

export class ConfigLoader {
  private explorer = cosmiconfigSync('revolutionary-ui', {
    searchPlaces: [
      '.revolutionary-ui.json',
      '.revolutionary-ui.yaml',
      '.revolutionary-ui.yml',
      '.revolutionary-ui/config.json',
      '.revolutionary-ui/config.yaml',
      '.revolutionary-ui/config.yml',
      'revolutionary-ui.config.js',
      'revolutionary-ui.config.cjs',
      'revolutionary-ui.config.mjs',
      'revolutionary-ui.config.ts',
    ],
    loaders: {
      '.js': defaultLoaders['.js'],
      '.cjs': defaultLoaders['.js'],
      '.json': defaultLoaders['.json'],
      '.yaml': defaultLoaders['.yaml'],
      '.yml': defaultLoaders['.yaml'],
      '.mjs': this.createMjsLoader(),
      '.ts': this.createTsLoader(),
    },
  });

  async loadHierarchy(startPath: string = process.cwd()): Promise<ConfigHierarchy> {
    const workspace = await workspaceDetector.detect(startPath);
    const configs: ConfigHierarchy = {
      merged: this.getDefaultConfig(),
    };

    // Load global config from home directory
    const homeConfig = await this.loadGlobalConfig();
    if (homeConfig) {
      configs.global = homeConfig;
      configs.merged = this.mergeConfigs(configs.merged, homeConfig);
    }

    // Load workspace root config
    if (workspace.root !== startPath) {
      const workspaceConfig = await this.loadConfigAt(workspace.root);
      if (workspaceConfig) {
        configs.workspace = workspaceConfig;
        configs.merged = this.mergeConfigs(configs.merged, workspaceConfig);
      }
    }

    // Load package-level config
    if (workspace.currentPackage) {
      const packageConfig = await this.loadConfigAt(workspace.currentPackage.path);
      if (packageConfig) {
        configs.package = packageConfig;
        configs.merged = this.mergeConfigs(configs.merged, packageConfig);
      }
    } else {
      // Load config from current directory if not in a package
      const localConfig = await this.loadConfigAt(startPath);
      if (localConfig) {
        configs.package = localConfig;
        configs.merged = this.mergeConfigs(configs.merged, localConfig);
      }
    }

    // Apply environment variable overrides
    configs.merged = this.applyEnvOverrides(configs.merged);

    return configs;
  }

  private async loadGlobalConfig(): Promise<CLIConfig | null> {
    const home = process.env.HOME || process.env.USERPROFILE || '';
    const globalConfigPath = join(home, '.revolutionary-ui', 'config.json');
    
    if (await fileExists(globalConfigPath)) {
      try {
        return await readJson(globalConfigPath);
      } catch (error) {
        logger.debug('Failed to load global config:', error);
      }
    }
    
    return null;
  }

  private async loadConfigAt(path: string): Promise<CLIConfig | null> {
    try {
      const result = this.explorer.search(path);
      return result?.config || null;
    } catch (error) {
      logger.debug(`Failed to load config at ${path}:`, error);
      return null;
    }
  }

  private mergeConfigs(base: CLIConfig, override: CLIConfig): CLIConfig {
    return {
      ...base,
      ...override,
      features: {
        ...base.features,
        ...override.features,
      } as any,
      preferences: {
        ...base.preferences,
        ...override.preferences,
      } as any,
      // Deep merge for nested objects
    };
  }

  private applyEnvOverrides(config: CLIConfig): CLIConfig {
    // Override with environment variables
    const envOverrides: Partial<CLIConfig> = {};

    // Feature flags
    if (process.env.RUI_FEATURE_AI !== undefined) {
      envOverrides.features = {
        ...config.features,
        ai: process.env.RUI_FEATURE_AI === 'true',
      } as any;
    }

    if (process.env.RUI_FEATURE_MARKETPLACE !== undefined) {
      envOverrides.features = {
        ...config.features,
        marketplace: process.env.RUI_FEATURE_MARKETPLACE === 'true',
      } as any;
    }

    // Preferences
    if (process.env.RUI_INTERACTIVE !== undefined) {
      envOverrides.preferences = {
        ...config.preferences,
        interactive: process.env.RUI_INTERACTIVE === 'true',
      } as any;
    }

    if (process.env.RUI_TELEMETRY !== undefined) {
      envOverrides.preferences = {
        ...config.preferences,
        telemetry: process.env.RUI_TELEMETRY === 'true',
      } as any;
    }

    return this.mergeConfigs(config, envOverrides as CLIConfig);
  }

  private getDefaultConfig(): CLIConfig {
    return {
      version: '1.0.0',
      features: {
        ai: true,
        marketplace: true,
        cloudSync: true,
        analytics: true,
      },
      preferences: {
        componentStyle: 'composition',
        fileNaming: 'kebab-case',
        interactive: true,
        telemetry: true,
      },
    };
  }

  private createMjsLoader() {
    return (filepath: string) => {
      try {
        const module = require(filepath);
        return module.default || module;
      } catch {
        logger.debug(`Cannot load ES module config synchronously: ${filepath}`);
        logger.debug('Consider using .js or .cjs extension for config files');
        return null;
      }
    };
  }

  private createTsLoader() {
    return (filepath: string) => {
      try {
        // Try tsx first (newer, faster)
        require.resolve('tsx/cjs');
        require('tsx/cjs');
        delete require.cache[filepath];
        const module = require(filepath);
        return module.default || module;
      } catch {
        try {
          // Try ts-node as fallback
          require.resolve('ts-node/register');
          require('ts-node/register');
          delete require.cache[filepath];
          const module = require(filepath);
          return module.default || module;
        } catch {
          logger.debug(`Cannot load TypeScript config: ${filepath}`);
          logger.debug('Install tsx or ts-node to use TypeScript config files');
          return null;
        }
      }
    };
  }

  async saveConfig(config: CLIConfig, level: 'global' | 'workspace' | 'package' = 'package'): Promise<void> {
    const { writeJson } = await import('./fs.js');
    let configPath: string;

    switch (level) {
      case 'global':
        const home = process.env.HOME || process.env.USERPROFILE || '';
        configPath = join(home, '.revolutionary-ui', 'config.json');
        break;
        
      case 'workspace':
        const workspace = await workspaceDetector.detect();
        configPath = join(workspace.root, '.revolutionary-ui.json');
        break;
        
      case 'package':
      default:
        configPath = join(process.cwd(), '.revolutionary-ui.json');
    }

    await writeJson(configPath, config);
    logger.debug(`Saved config to ${configPath}`);
  }
}

export const configLoader = new ConfigLoader();