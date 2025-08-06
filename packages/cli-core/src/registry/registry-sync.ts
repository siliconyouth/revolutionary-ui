import { ComponentRegistry, type Component } from './component-registry.js';
import { RegistryClient } from './registry-client.js';
import { RegistryCache } from './registry-cache.js';
import { createLogger } from '../utils/logger.js';
import { readJson, writeJson, fileExists } from '../utils/fs.js';
import { join } from 'path';
import { EventEmitter } from 'events';
import type { CLIConfig } from '../types/index.js';

export interface SyncOptions {
  force?: boolean;
  components?: string[]; // Specific components to sync
  categories?: string[]; // Sync entire categories
  dryRun?: boolean;
  parallel?: number; // Number of parallel downloads
}

export interface SyncState {
  lastSync?: string;
  syncedComponents: Record<string, {
    version: string;
    syncedAt: string;
    etag?: string;
  }>;
  failedComponents: Record<string, {
    error: string;
    attempts: number;
    lastAttempt: string;
  }>;
}

export interface SyncResult {
  synced: string[];
  updated: string[];
  failed: string[];
  skipped: string[];
  duration: number;
}

export class RegistrySync extends EventEmitter {
  private registry: ComponentRegistry;
  private client: RegistryClient;
  private cache: RegistryCache;
  private logger = createLogger();
  private config: CLIConfig;
  private stateFile: string;
  private state: SyncState = { syncedComponents: {}, failedComponents: {} };

  constructor(config: CLIConfig) {
    super();
    this.config = config;
    this.registry = new ComponentRegistry(config);
    this.client = new RegistryClient({ config });
    this.cache = new RegistryCache();
    this.stateFile = join(config.paths?.data || '.revolutionary-ui', 'sync-state.json');
    
    this.loadState();
  }

  /**
   * Sync components from registry
   */
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      synced: [],
      updated: [],
      failed: [],
      skipped: [],
      duration: 0,
    };

    try {
      // Load current state
      await this.loadState();

      // Get components to sync
      const components = await this.getComponentsToSync(options);
      
      this.emit('sync:start', { total: components.length });

      // Process components
      const parallel = options.parallel || 3;
      for (let i = 0; i < components.length; i += parallel) {
        const batch = components.slice(i, i + parallel);
        
        await Promise.all(
          batch.map(async (component) => {
            try {
              const syncResult = await this.syncComponent(component, options);
              
              switch (syncResult.action) {
                case 'synced':
                  result.synced.push(component.name);
                  break;
                case 'updated':
                  result.updated.push(component.name);
                  break;
                case 'skipped':
                  result.skipped.push(component.name);
                  break;
              }
              
              this.emit('sync:progress', {
                current: i + 1,
                total: components.length,
                component: component.name,
                action: syncResult.action,
              });
            } catch (error: any) {
              result.failed.push(component.name);
              this.recordFailure(component.name, error.message);
              
              this.emit('sync:error', {
                component: component.name,
                error: error.message,
              });
            }
          })
        );
      }

      // Update sync state
      this.state.lastSync = new Date().toISOString();
      await this.saveState();

      result.duration = Date.now() - startTime;
      
      this.emit('sync:complete', result);
      
      return result;
    } catch (error: any) {
      this.emit('sync:error', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if components need updates
   */
  async checkForUpdates(): Promise<Array<{
    name: string;
    currentVersion: string;
    latestVersion: string;
    breaking: boolean;
  }>> {
    const updates: Array<{
      name: string;
      currentVersion: string;
      latestVersion: string;
      breaking: boolean;
    }> = [];

    await this.loadState();

    for (const [name, info] of Object.entries(this.state.syncedComponents)) {
      try {
        const latest = await this.client.getComponentDetails(name);
        
        if (latest.version !== info.version) {
          const breaking = this.isBreakingChange(info.version, latest.version);
          updates.push({
            name,
            currentVersion: info.version,
            latestVersion: latest.version,
            breaking,
          });
        }
      } catch (error) {
        this.logger.debug(`Failed to check updates for ${name}:`, error);
      }
    }

    return updates;
  }

  /**
   * Sync a single component
   */
  private async syncComponent(
    component: Component,
    options: SyncOptions
  ): Promise<{ action: 'synced' | 'updated' | 'skipped' }> {
    const existing = this.state.syncedComponents[component.name];

    // Check if already synced and up to date
    if (existing && existing.version === component.version && !options.force) {
      // Check if component files exist
      const componentPath = this.getComponentPath(component.name);
      if (await fileExists(componentPath)) {
        return { action: 'skipped' };
      }
    }

    if (options.dryRun) {
      return { action: existing ? 'updated' : 'synced' };
    }

    // Download component
    const downloaded = await this.client.downloadComponent(
      component.name,
      component.version
    );

    // Cache component
    await this.cache.cacheComponent(downloaded);

    // Save component locally
    await this.saveComponent(downloaded);

    // Update state
    this.state.syncedComponents[component.name] = {
      version: component.version,
      syncedAt: new Date().toISOString(),
      etag: downloaded.metadata?.etag,
    };

    // Remove from failed if it was there
    delete this.state.failedComponents[component.name];

    return { action: existing ? 'updated' : 'synced' };
  }

  /**
   * Get components to sync based on options
   */
  private async getComponentsToSync(options: SyncOptions): Promise<Component[]> {
    let components: Component[] = [];

    if (options.components && options.components.length > 0) {
      // Sync specific components
      for (const name of options.components) {
        try {
          const component = await this.registry.getComponent(name);
          components.push(component);
        } catch (error) {
          this.logger.warn(`Component ${name} not found in registry`);
        }
      }
    } else if (options.categories && options.categories.length > 0) {
      // Sync entire categories
      for (const category of options.categories) {
        const categoryComponents = await this.registry.getComponentsByCategory(category);
        components.push(...categoryComponents);
      }
    } else {
      // Sync all installed components (updates only)
      const componentNames = Object.keys(this.state.syncedComponents);
      for (const name of componentNames) {
        try {
          const component = await this.registry.getComponent(name);
          components.push(component);
        } catch (error) {
          this.logger.debug(`Component ${name} no longer in registry`);
        }
      }
    }

    return components;
  }

  /**
   * Save component to local storage
   */
  private async saveComponent(component: Component): Promise<void> {
    const componentPath = this.getComponentPath(component.name);
    await writeJson(componentPath, component);
  }

  /**
   * Get component storage path
   */
  private getComponentPath(name: string): string {
    return join(
      this.config.paths?.components || join('.revolutionary-ui', 'components'),
      `${name}.json`
    );
  }

  /**
   * Check if version change is breaking
   */
  private isBreakingChange(current: string, latest: string): boolean {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    
    // Major version change
    return latestParts[0] > currentParts[0];
  }

  /**
   * Record sync failure
   */
  private recordFailure(component: string, error: string): void {
    const existing = this.state.failedComponents[component] || { attempts: 0 };
    
    this.state.failedComponents[component] = {
      error,
      attempts: existing.attempts + 1,
      lastAttempt: new Date().toISOString(),
    };
  }

  /**
   * Load sync state
   */
  private async loadState(): Promise<void> {
    try {
      if (await fileExists(this.stateFile)) {
        this.state = await readJson(this.stateFile) as SyncState;
      }
    } catch (error) {
      this.logger.debug('Failed to load sync state:', error);
    }
  }

  /**
   * Save sync state
   */
  private async saveState(): Promise<void> {
    try {
      await writeJson(this.stateFile, this.state);
    } catch (error) {
      this.logger.debug('Failed to save sync state:', error);
    }
  }

  /**
   * Clear sync state
   */
  async clearState(): Promise<void> {
    this.state = { syncedComponents: {}, failedComponents: {} };
    await this.saveState();
  }

  /**
   * Get sync statistics
   */
  getStats(): {
    lastSync: string | undefined;
    totalSynced: number;
    totalFailed: number;
    categories: string[];
    frameworks: string[];
  } {
    const components = Object.keys(this.state.syncedComponents);
    const categories = new Set<string>();
    const frameworks = new Set<string>();

    // Would need to load components to get categories/frameworks
    // For now, return basic stats
    
    return {
      lastSync: this.state.lastSync,
      totalSynced: components.length,
      totalFailed: Object.keys(this.state.failedComponents).length,
      categories: Array.from(categories),
      frameworks: Array.from(frameworks),
    };
  }
}