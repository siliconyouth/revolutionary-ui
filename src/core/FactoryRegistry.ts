/**
 * @revolutionary-ui/factory-system
 * FactoryRegistry - Central registry for managing component factories
 * 
 * This registry provides a centralized system for registering, discovering,
 * and managing component factories across different frameworks.
 */

import { BaseFactory, FactoryOptions } from './BaseFactory';

// =============================================================================
// Registry Types
// =============================================================================

export interface FactoryRegistration {
  id: string;
  framework: string;
  factory: BaseFactory;
  registered: Date;
  usage: {
    componentsGenerated: number;
    lastUsed: Date;
    cacheHitRate: number;
  };
}

export interface RegistryConfig {
  autoCleanup: boolean;
  maxFactories: number;
  cleanupInterval: number; // in milliseconds
  devMode: boolean;
}

export interface FactoryQuery {
  framework?: string;
  id?: string;
  pattern?: string;
  isInitialized?: boolean;
}

// =============================================================================
// Factory Registry Class
// =============================================================================

/**
 * Central registry for managing component factories
 * 
 * The FactoryRegistry provides a unified interface for registering,
 * discovering, and managing component factories across different frameworks.
 */
export class FactoryRegistry {
  private static instance: FactoryRegistry | null = null;
  private readonly factories: Map<string, FactoryRegistration> = new Map();
  private readonly config: RegistryConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<RegistryConfig> = {}) {
    this.config = {
      autoCleanup: true,
      maxFactories: 50,
      cleanupInterval: 300000, // 5 minutes
      devMode: false,
      ...config
    };

    if (this.config.autoCleanup) {
      this.startCleanupTimer();
    }
  }

  /**
   * Get singleton instance of the registry
   */
  static getInstance(config?: Partial<RegistryConfig>): FactoryRegistry {
    if (!FactoryRegistry.instance) {
      FactoryRegistry.instance = new FactoryRegistry(config);
    }
    return FactoryRegistry.instance;
  }

  /**
   * Register a factory in the registry
   */
  register<T extends BaseFactory>(
    id: string, 
    framework: string, 
    factory: T
  ): void {
    // Check if we're at max capacity
    if (this.factories.size >= this.config.maxFactories) {
      this.performCleanup();
    }

    const key = this.generateKey(id, framework);
    
    // Unregister existing factory if present
    if (this.factories.has(key)) {
      this.unregister(id, framework);
    }

    const registration: FactoryRegistration = {
      id,
      framework,
      factory,
      registered: new Date(),
      usage: {
        componentsGenerated: 0,
        lastUsed: new Date(),
        cacheHitRate: 0
      }
    };

    this.factories.set(key, registration);

    if (this.config.devMode) {
      console.log(`🏭 Factory registered: ${id} (${framework})`);
    }
  }

  /**
   * Unregister a factory from the registry
   */
  unregister(id: string, framework: string): boolean {
    const key = this.generateKey(id, framework);
    const registration = this.factories.get(key);

    if (registration) {
      // Cleanup factory resources
      registration.factory.destroy();
      this.factories.delete(key);

      if (this.config.devMode) {
        console.log(`🗑️ Factory unregistered: ${id} (${framework})`);
      }
      return true;
    }

    return false;
  }

  /**
   * Get a factory by ID and framework
   */
  get<T extends BaseFactory = BaseFactory>(id: string, framework: string): T | null {
    const key = this.generateKey(id, framework);
    const registration = this.factories.get(key);

    if (registration) {
      // Update usage statistics
      registration.usage.lastUsed = new Date();
      return registration.factory as T;
    }

    return null;
  }

  /**
   * Find factories matching query criteria
   */
  find(query: FactoryQuery): FactoryRegistration[] {
    const results: FactoryRegistration[] = [];

    for (const registration of this.factories.values()) {
      let matches = true;

      if (query.framework && registration.framework !== query.framework) {
        matches = false;
      }

      if (query.id && registration.id !== query.id) {
        matches = false;
      }

      if (query.pattern && !registration.id.includes(query.pattern)) {
        matches = false;
      }

      if (query.isInitialized !== undefined && 
          registration.factory.getInfo().initialized !== query.isInitialized) {
        matches = false;
      }

      if (matches) {
        results.push(registration);
      }
    }

    return results;
  }

  /**
   * Get factory for specific framework (returns the first match)
   */
  getFrameworkFactory<T extends BaseFactory = BaseFactory>(framework: string): T | null {
    const factories = this.find({ framework });
    return factories.length > 0 ? factories[0].factory as T : null;
  }

  /**
   * List all registered factories
   */
  list(): {
    id: string;
    framework: string;
    initialized: boolean;
    usage: FactoryRegistration['usage'];
  }[] {
    return Array.from(this.factories.values()).map(reg => ({
      id: reg.id,
      framework: reg.framework,
      initialized: reg.factory.getInfo().initialized,
      usage: reg.usage
    }));
  }

  /**
   * Get registry statistics
   */
  getStats(): {
    totalFactories: number;
    frameworks: string[];
    initialized: number;
    totalComponentsGenerated: number;
    averageCacheHitRate: number;
    memoryUsage: number;
  } {
    const frameworks = new Set<string>();
    let initialized = 0;
    let totalComponents = 0;
    let totalCacheHitRate = 0;
    let totalFactories = 0;

    for (const registration of this.factories.values()) {
      frameworks.add(registration.framework);
      totalFactories++;

      if (registration.factory.getInfo().initialized) {
        initialized++;
      }

      totalComponents += registration.usage.componentsGenerated;
      totalCacheHitRate += registration.usage.cacheHitRate;
    }

    return {
      totalFactories,
      frameworks: Array.from(frameworks),
      initialized,
      totalComponentsGenerated: totalComponents,
      averageCacheHitRate: totalFactories > 0 ? totalCacheHitRate / totalFactories : 0,
      memoryUsage: process.memoryUsage?.()?.heapUsed || 0
    };
  }

  /**
   * Initialize all registered factories
   */
  async initializeAll(): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const registration of this.factories.values()) {
      if (!registration.factory.getInfo().initialized) {
        promises.push(registration.factory.initialize());
      }
    }

    await Promise.all(promises);

    if (this.config.devMode) {
      console.log(`🚀 Initialized ${promises.length} factories`);
    }
  }

  /**
   * Initialize factories for specific framework
   */
  async initializeFramework(framework: string): Promise<void> {
    const factories = this.find({ framework, isInitialized: false });
    const promises = factories.map(reg => reg.factory.initialize());
    
    await Promise.all(promises);

    if (this.config.devMode) {
      console.log(`🚀 Initialized ${promises.length} ${framework} factories`);
    }
  }

  /**
   * Clear all factory caches
   */
  clearAllCaches(): void {
    for (const registration of this.factories.values()) {
      registration.factory.clearCache();
    }

    if (this.config.devMode) {
      console.log('🧹 All factory caches cleared');
    }
  }

  /**
   * Perform cleanup of unused factories
   */
  performCleanup(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const factoriesToRemove: string[] = [];

    for (const [key, registration] of this.factories.entries()) {
      // Remove factories not used in the last hour
      if (registration.usage.lastUsed < oneHourAgo && 
          registration.usage.componentsGenerated === 0) {
        factoriesToRemove.push(key);
      }
    }

    for (const key of factoriesToRemove) {
      const registration = this.factories.get(key);
      if (registration) {
        registration.factory.destroy();
        this.factories.delete(key);
      }
    }

    if (this.config.devMode && factoriesToRemove.length > 0) {
      console.log(`🧹 Cleaned up ${factoriesToRemove.length} unused factories`);
    }
  }

  /**
   * Generate cache key for factory
   */
  private generateKey(id: string, framework: string): string {
    return `${framework}:${id}`;
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Stop automatic cleanup timer
   */
  stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Destroy the registry and all factories
   */
  destroy(): void {
    this.stopCleanup();

    // Destroy all factories
    for (const registration of this.factories.values()) {
      registration.factory.destroy();
    }

    this.factories.clear();
    FactoryRegistry.instance = null;

    if (this.config.devMode) {
      console.log('🗑️ Factory registry destroyed');
    }
  }
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Get the default registry instance
 */
export function getRegistry(config?: Partial<RegistryConfig>): FactoryRegistry {
  return FactoryRegistry.getInstance(config);
}

/**
 * Register a factory using the default registry
 */
export function registerFactory<T extends BaseFactory>(
  id: string,
  framework: string,
  factory: T
): void {
  getRegistry().register(id, framework, factory);
}

/**
 * Get a factory using the default registry
 */
export function getFactory<T extends BaseFactory = BaseFactory>(
  id: string,
  framework: string
): T | null {
  return getRegistry().get<T>(id, framework);
}

/**
 * Get framework factory using the default registry
 */
export function getFrameworkFactory<T extends BaseFactory = BaseFactory>(
  framework: string
): T | null {
  return getRegistry().getFrameworkFactory<T>(framework);
}

/**
 * Initialize all factories in the default registry
 */
export async function initializeAllFactories(): Promise<void> {
  await getRegistry().initializeAll();
}

/**
 * Clear all caches in the default registry
 */
export function clearAllCaches(): void {
  getRegistry().clearAllCaches();
}