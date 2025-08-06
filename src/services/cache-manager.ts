/**
 * Cache Manager
 * 
 * Provides a unified caching interface with Redis and in-memory fallback
 */

import { UpstashRedisService } from './upstash-redis-service';

export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: any, ttl?: number): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
}

/**
 * In-memory cache provider (fallback)
 */
class InMemoryCacheProvider implements CacheProvider {
  private cache = new Map<string, { value: any; expires: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    const expires = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expires });
    return true;
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  async clear(): Promise<boolean> {
    this.cache.clear();
    return true;
  }
}

/**
 * Redis cache provider
 */
class RedisCacheProvider implements CacheProvider {
  private redis?: UpstashRedisService;
  private initError?: Error;

  constructor() {
    // Lazy initialization
  }

  private getRedis(): UpstashRedisService {
    if (this.initError) {
      throw this.initError;
    }
    
    if (!this.redis) {
      try {
        this.redis = UpstashRedisService.getInstance();
      } catch (error) {
        this.initError = error as Error;
        throw error;
      }
    }
    
    return this.redis;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.getRedis().get<T>(key);
    } catch (error) {
      if (process.env.ENABLE_CACHE_LOGGING === 'true') {
        console.error('Redis get error:', error);
      }
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      return await this.getRedis().set(key, value, { ttl });
    } catch (error) {
      if (process.env.ENABLE_CACHE_LOGGING === 'true') {
        console.error('Redis set error:', error);
      }
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      return await this.getRedis().delete(key);
    } catch (error) {
      if (process.env.ENABLE_CACHE_LOGGING === 'true') {
        console.error('Redis delete error:', error);
      }
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return await this.getRedis().exists(key);
    } catch (error) {
      if (process.env.ENABLE_CACHE_LOGGING === 'true') {
        console.error('Redis exists error:', error);
      }
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      return await this.getRedis().flushAll();
    } catch (error) {
      if (process.env.ENABLE_CACHE_LOGGING === 'true') {
        console.error('Redis clear error:', error);
      }
      return false;
    }
  }
}

/**
 * Cache Manager - Main caching interface
 */
export class CacheManager {
  private static instance: CacheManager;
  private provider: CacheProvider;
  private useRedis: boolean = false;

  private constructor() {
    // Try to use Redis if configured
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        this.provider = new RedisCacheProvider();
        this.useRedis = true;
        console.log('✅ Using Upstash Redis for caching');
      } catch (error) {
        console.warn('⚠️  Failed to initialize Redis, falling back to in-memory cache:', error);
        this.provider = new InMemoryCacheProvider();
      }
    } else {
      this.provider = new InMemoryCacheProvider();
      console.log('ℹ️  Using in-memory cache (configure Upstash Redis for production)');
    }
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Get cache provider type
   */
  getProviderType(): 'redis' | 'memory' {
    return this.useRedis ? 'redis' : 'memory';
  }

  /**
   * Cache key builders
   */
  static keys = {
    // AI generation cache
    aiGeneration: (prompt: string, framework: string) => 
      `ai:gen:${Buffer.from(`${prompt}:${framework}`).toString('base64').substring(0, 32)}`,
    
    // Component cache
    component: (id: string) => `component:${id}`,
    componentList: (page: number, limit: number) => `components:list:${page}:${limit}`,
    
    // Search cache
    search: (query: string, filters?: any) => 
      `search:${Buffer.from(`${query}:${JSON.stringify(filters || {})}`).toString('base64').substring(0, 32)}`,
    
    // User cache
    user: (id: string) => `user:${id}`,
    userSession: (token: string) => `session:${token}`,
    
    // Analytics cache
    analytics: (metric: string, period: string) => `analytics:${metric}:${period}`,
    
    // API rate limiting
    rateLimit: (ip: string, endpoint: string) => `rate:${ip}:${endpoint}`,
    
    // Vector search cache
    vectorSearch: (query: string, limit: number) => 
      `vector:${Buffer.from(query).toString('base64').substring(0, 24)}:${limit}`,
  };

  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.provider.get<T>(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set a value in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      return await this.provider.set(key, value, ttl);
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      return await this.provider.delete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      return await this.provider.exists(key);
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    try {
      return await this.provider.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Cache wrapper with automatic key generation
   */
  async remember<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetcher();
    
    // Store in cache
    await this.set(key, fresh, ttl);
    
    return fresh;
  }

  /**
   * Invalidate cache by pattern (Redis only)
   */
  async invalidatePattern(pattern: string): Promise<boolean> {
    if (this.useRedis && this.provider instanceof RedisCacheProvider) {
      const redis = UpstashRedisService.getInstance();
      const deleted = await redis.deleteByPattern(pattern);
      return deleted > 0;
    }
    
    // For in-memory, we can't efficiently search by pattern
    console.warn('Pattern invalidation not supported for in-memory cache');
    return false;
  }
}

// Export singleton instance
export const cache = CacheManager.getInstance();