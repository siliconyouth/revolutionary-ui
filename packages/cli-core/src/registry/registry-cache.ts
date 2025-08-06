import { join } from 'path';
import { homedir } from 'os';
import { createLogger } from '../utils/logger.js';
import { readJson, writeJson, fileExists, ensureDir } from '../utils/fs.js';
import { createHash } from 'crypto';
import type { Component } from './component-registry.js';

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  expires: number;
  etag?: string;
  metadata?: Record<string, any>;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Max cache size in bytes
  maxEntries?: number; // Max number of entries
  baseDir?: string; // Base directory for cache
}

export class RegistryCache {
  private logger = createLogger();
  private baseDir: string;
  private options: Required<CacheOptions>;
  private memoryCache = new Map<string, CacheEntry>();
  private cacheStats = {
    hits: 0,
    misses: 0,
    writes: 0,
    evictions: 0,
  };

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 3600000, // 1 hour default
      maxSize: options.maxSize || 50 * 1024 * 1024, // 50MB default
      maxEntries: options.maxEntries || 1000,
      baseDir: options.baseDir || join(homedir(), '.revolutionary-ui', 'cache'),
    };
    
    this.baseDir = this.options.baseDir;
    this.initCache();
  }

  /**
   * Initialize cache directory
   */
  private async initCache(): Promise<void> {
    await ensureDir(this.baseDir);
    await this.loadIndex();
  }

  /**
   * Get item from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry && !this.isExpired(memEntry)) {
      this.cacheStats.hits++;
      return memEntry.data;
    }

    // Check disk cache
    const filePath = this.getFilePath(key);
    if (!await fileExists(filePath)) {
      this.cacheStats.misses++;
      return null;
    }

    try {
      const entry = await readJson(filePath) as CacheEntry<T>;
      
      if (this.isExpired(entry)) {
        await this.delete(key);
        this.cacheStats.misses++;
        return null;
      }

      // Store in memory cache
      this.memoryCache.set(key, entry);
      this.cacheStats.hits++;
      
      return entry.data;
    } catch (error) {
      this.logger.debug(`Failed to read cache entry ${key}:`, error);
      this.cacheStats.misses++;
      return null;
    }
  }

  /**
   * Set item in cache
   */
  async set<T = any>(
    key: string, 
    data: T, 
    options?: { 
      ttl?: number; 
      etag?: string; 
      metadata?: Record<string, any> 
    }
  ): Promise<void> {
    const ttl = options?.ttl || this.options.ttl;
    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: Date.now(),
      expires: Date.now() + ttl,
      etag: options?.etag,
      metadata: options?.metadata,
    };

    // Store in memory cache
    this.memoryCache.set(key, entry);

    // Store on disk
    const filePath = this.getFilePath(key);
    await ensureDir(join(this.baseDir, 'entries'));
    await writeJson(filePath, entry);
    
    this.cacheStats.writes++;

    // Check cache limits
    await this.enforceLimit();
  }

  /**
   * Delete item from cache
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    const filePath = this.getFilePath(key);
    try {
      const { unlink } = await import('fs/promises');
      await unlink(filePath);
    } catch {
      // Ignore if file doesn't exist
    }
  }

  /**
   * Clear entire cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      const { rm } = await import('fs/promises');
      await rm(join(this.baseDir, 'entries'), { recursive: true, force: true });
      await ensureDir(join(this.baseDir, 'entries'));
    } catch (error) {
      this.logger.debug('Failed to clear cache:', error);
    }
    
    this.resetStats();
  }

  /**
   * Get cache statistics
   */
  getStats(): typeof this.cacheStats & { 
    size: number; 
    entries: number; 
    hitRate: number 
  } {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = total > 0 ? this.cacheStats.hits / total : 0;
    
    return {
      ...this.cacheStats,
      size: this.memoryCache.size,
      entries: this.memoryCache.size,
      hitRate,
    };
  }

  /**
   * Cache component data with smart invalidation
   */
  async cacheComponent(component: Component): Promise<void> {
    const key = `component:${component.name}:${component.version}`;
    const etag = this.generateEtag(component);
    
    await this.set(key, component, {
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days for versioned components
      etag,
      metadata: {
        name: component.name,
        version: component.version,
        category: component.category,
        framework: component.framework,
      },
    });
  }

  /**
   * Get cached component
   */
  async getCachedComponent(name: string, version?: string): Promise<Component | null> {
    const key = version ? `component:${name}:${version}` : `component:${name}:latest`;
    return this.get<Component>(key);
  }

  /**
   * Cache search results
   */
  async cacheSearchResults(
    query: string, 
    results: Component[], 
    ttl?: number
  ): Promise<void> {
    const key = `search:${this.hashQuery(query)}`;
    await this.set(key, results, { ttl: ttl || 600000 }); // 10 minutes default
  }

  /**
   * Get cached search results
   */
  async getCachedSearchResults(query: string): Promise<Component[] | null> {
    const key = `search:${this.hashQuery(query)}`;
    return this.get<Component[]>(key);
  }

  /**
   * Warm cache with popular components
   */
  async warmCache(components: Component[]): Promise<void> {
    for (const component of components) {
      await this.cacheComponent(component);
    }
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expires;
  }

  /**
   * Get file path for cache key
   */
  private getFilePath(key: string): string {
    const hash = this.hashQuery(key);
    return join(this.baseDir, 'entries', `${hash}.json`);
  }

  /**
   * Hash query for consistent keys
   */
  private hashQuery(query: string): string {
    return createHash('sha256').update(query).digest('hex').substring(0, 16);
  }

  /**
   * Generate ETag for component
   */
  private generateEtag(component: Component): string {
    const content = JSON.stringify({
      name: component.name,
      version: component.version,
      files: component.files.length,
    });
    return createHash('md5').update(content).digest('hex');
  }

  /**
   * Enforce cache size limits
   */
  private async enforceLimit(): Promise<void> {
    // Enforce entry limit
    if (this.memoryCache.size > this.options.maxEntries) {
      const toRemove = this.memoryCache.size - this.options.maxEntries;
      const entries = Array.from(this.memoryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      for (let i = 0; i < toRemove; i++) {
        const [key] = entries[i];
        await this.delete(key);
        this.cacheStats.evictions++;
      }
    }
  }

  /**
   * Load cache index
   */
  private async loadIndex(): Promise<void> {
    const indexPath = join(this.baseDir, 'index.json');
    
    try {
      if (await fileExists(indexPath)) {
        const index = await readJson(indexPath) as any;
        this.cacheStats = index.stats || this.cacheStats;
      }
    } catch (error) {
      this.logger.debug('Failed to load cache index:', error);
    }
  }

  /**
   * Save cache index
   */
  private async saveIndex(): Promise<void> {
    const indexPath = join(this.baseDir, 'index.json');
    
    try {
      await writeJson(indexPath, {
        version: '1.0.0',
        stats: this.cacheStats,
        updated: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.debug('Failed to save cache index:', error);
    }
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.cacheStats = {
      hits: 0,
      misses: 0,
      writes: 0,
      evictions: 0,
    };
  }
}