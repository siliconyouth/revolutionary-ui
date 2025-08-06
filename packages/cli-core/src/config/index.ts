import { cosmiconfig } from 'cosmiconfig';
import { z } from 'zod';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import type { CLIConfig } from '../types/index.js';

// Configuration schema using Zod
const ProjectConfigSchema = z.object({
  name: z.string(),
  framework: z.string(),
  styling: z.string(),
  packageManager: z.enum(['npm', 'yarn', 'pnpm', 'bun']),
});

const FeaturesConfigSchema = z.object({
  ai: z.boolean().default(true),
  marketplace: z.boolean().default(true),
  cloudSync: z.boolean().default(true),
  analytics: z.boolean().default(true),
});

const PreferencesConfigSchema = z.object({
  componentStyle: z.enum(['composition', 'declaration']).default('composition'),
  fileNaming: z.enum(['kebab-case', 'camelCase', 'PascalCase']).default('kebab-case'),
  interactive: z.boolean().default(true),
  telemetry: z.boolean().default(true),
});

const TeamConfigSchema = z.object({
  id: z.string(),
  role: z.enum(['admin', 'member', 'viewer']),
});

const AuthConfigSchema = z.object({
  token: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.number().optional(),
});

const CLIConfigSchema = z.object({
  version: z.string(),
  project: ProjectConfigSchema.optional(),
  features: FeaturesConfigSchema.optional(),
  preferences: PreferencesConfigSchema.optional(),
  team: TeamConfigSchema.optional(),
  auth: AuthConfigSchema.optional(),
});

export class ConfigManager {
  private globalConfigPath: string;
  private localConfigPath: string;
  private explorer: ReturnType<typeof cosmiconfig>;

  constructor(cwd: string = process.cwd()) {
    this.globalConfigPath = path.join(os.homedir(), '.revolutionary-ui', 'config.json');
    this.localConfigPath = path.join(cwd, '.revolutionary-ui', 'config.json');
    
    this.explorer = cosmiconfig('revolutionary-ui', {
      searchPlaces: [
        '.revolutionary-ui.json',
        '.revolutionary-ui.yaml',
        '.revolutionary-ui.yml',
        '.revolutionary-ui/config.json',
        '.revolutionary-ui/config.yaml',
        '.revolutionary-ui/config.yml',
        'revolutionary-ui.config.js',
        'revolutionary-ui.config.mjs',
        'revolutionary-ui.config.ts',
        'package.json',
      ],
      packageProp: 'revolutionary-ui',
    });
  }

  async load(): Promise<CLIConfig> {
    try {
      // Try to load local config first
      const localResult = await this.explorer.search(process.cwd());
      if (localResult?.config) {
        return this.validateConfig(localResult.config);
      }

      // Fall back to global config
      if (await fs.pathExists(this.globalConfigPath)) {
        const globalConfig = await fs.readJson(this.globalConfigPath);
        return this.validateConfig(globalConfig);
      }

      // Return default config
      return this.getDefaultConfig();
    } catch (error) {
      console.error('Error loading config:', error);
      return this.getDefaultConfig();
    }
  }

  async save(config: Partial<CLIConfig>, global: boolean = false): Promise<void> {
    const targetPath = global ? this.globalConfigPath : this.localConfigPath;
    
    // Ensure directory exists
    await fs.ensureDir(path.dirname(targetPath));

    // Load existing config
    const existingConfig = await this.load();
    
    // Merge configs
    const newConfig = {
      ...existingConfig,
      ...config,
      version: config.version || existingConfig.version,
    };

    // Validate before saving
    const validatedConfig = this.validateConfig(newConfig);

    // Save to file
    await fs.writeJson(targetPath, validatedConfig, { spaces: 2 });
  }

  async get<K extends keyof CLIConfig>(key: K): Promise<CLIConfig[K] | undefined> {
    const config = await this.load();
    return config[key];
  }

  async set<K extends keyof CLIConfig>(key: K, value: CLIConfig[K]): Promise<void> {
    const config = await this.load();
    await this.save({ ...config, [key]: value });
  }

  async delete<K extends keyof CLIConfig>(key: K): Promise<void> {
    const config = await this.load();
    const newConfig = { ...config };
    delete newConfig[key];
    await this.save(newConfig);
  }

  async clear(global: boolean = false): Promise<void> {
    const targetPath = global ? this.globalConfigPath : this.localConfigPath;
    if (await fs.pathExists(targetPath)) {
      await fs.remove(targetPath);
    }
  }

  private validateConfig(config: unknown): CLIConfig {
    try {
      return CLIConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.warn('Invalid config format, using defaults for invalid fields');
        // Return config with defaults for invalid fields
        return {
          ...this.getDefaultConfig(),
          ...(typeof config === 'object' && config !== null ? config : {}),
        } as CLIConfig;
      }
      throw error;
    }
  }

  private getDefaultConfig(): CLIConfig {
    return {
      version: '3.3.0',
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

  // Static methods for quick access
  static async loadGlobal(): Promise<CLIConfig> {
    const manager = new ConfigManager();
    return manager.load();
  }

  static async saveGlobal(config: Partial<CLIConfig>): Promise<void> {
    const manager = new ConfigManager();
    await manager.save(config, true);
  }
}