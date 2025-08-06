/**
 * Upstash Redis Service
 * 
 * Provides caching functionality using Upstash Redis
 * - Serverless Redis with global edge caching
 * - Automatic connection management
 * - TTL-based cache expiration
 * - JSON serialization support
 */

import { Redis } from '@upstash/redis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix for namespacing
}

export class UpstashRedisService {
  private static instance: UpstashRedisService;
  private redis: Redis;
  private defaultTTL: number = 3600; // 1 hour default
  private keyPrefix: string = 'rui:'; // Revolutionary UI prefix

  private constructor() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('Upstash Redis credentials not found. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    }

    this.redis = new Redis({
      url,
      token,
    });
  }

  static getInstance(): UpstashRedisService {
    if (!UpstashRedisService.instance) {
      UpstashRedisService.instance = new UpstashRedisService();
    }
    return UpstashRedisService.instance;
  }

  /**
   * Get a value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const value = await this.redis.get<T>(fullKey);
      return value;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Set a value in cache
   */
  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key, options.prefix);
      const ttl = options.ttl || this.defaultTTL;
      
      // Set with expiration
      await this.redis.setex(fullKey, ttl, value);
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key: string, prefix?: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key, prefix);
      const result = await this.redis.del(fullKey);
      return result === 1;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  async deleteByPattern(pattern: string): Promise<number> {
    try {
      const fullPattern = `${this.keyPrefix}${pattern}`;
      const keys = await this.redis.keys(fullPattern);
      
      if (keys.length === 0) {
        return 0;
      }

      // Delete in batches for better performance
      const batchSize = 100;
      let deleted = 0;
      
      for (let i = 0; i < keys.length; i += batchSize) {
        const batch = keys.slice(i, i + batchSize);
        const result = await this.redis.del(...batch);
        deleted += result;
      }
      
      return deleted;
    } catch (error) {
      console.error('Redis deleteByPattern error:', error);
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string, prefix?: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key, prefix);
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string, prefix?: string): Promise<number> {
    try {
      const fullKey = this.getFullKey(key, prefix);
      return await this.redis.ttl(fullKey);
    } catch (error) {
      console.error('Redis ttl error:', error);
      return -1;
    }
  }

  /**
   * Increment a counter
   */
  async incr(key: string, prefix?: string): Promise<number> {
    try {
      const fullKey = this.getFullKey(key, prefix);
      return await this.redis.incr(fullKey);
    } catch (error) {
      console.error('Redis incr error:', error);
      return 0;
    }
  }

  /**
   * Decrement a counter
   */
  async decr(key: string, prefix?: string): Promise<number> {
    try {
      const fullKey = this.getFullKey(key, prefix);
      return await this.redis.decr(fullKey);
    } catch (error) {
      console.error('Redis decr error:', error);
      return 0;
    }
  }

  /**
   * Get multiple values at once
   */
  async mget<T = any>(keys: string[], prefix?: string): Promise<(T | null)[]> {
    try {
      const fullKeys = keys.map(key => this.getFullKey(key, prefix));
      const values = await this.redis.mget<T[]>(...fullKeys);
      return values;
    } catch (error) {
      console.error('Redis mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple values at once
   */
  async mset(keyValues: Record<string, any>, options: CacheOptions = {}): Promise<boolean> {
    try {
      const ttl = options.ttl || this.defaultTTL;
      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of Object.entries(keyValues)) {
        const fullKey = this.getFullKey(key, options.prefix);
        pipeline.setex(fullKey, ttl, value);
      }
      
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Redis mset error:', error);
      return false;
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async flushAll(): Promise<boolean> {
    try {
      // Only flush keys with our prefix
      const deleted = await this.deleteByPattern('*');
      console.log(`Flushed ${deleted} cache entries`);
      return true;
    } catch (error) {
      console.error('Redis flushAll error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    size: number;
    memory: string;
    hits: number;
    misses: number;
  } | null> {
    try {
      const info = await this.redis.info();
      // Parse Redis info string
      const stats = {
        size: 0,
        memory: '0',
        hits: 0,
        misses: 0,
      };
      
      // Extract relevant metrics from info
      const lines = info.split('\r\n');
      for (const line of lines) {
        if (line.startsWith('used_memory_human:')) {
          stats.memory = line.split(':')[1];
        } else if (line.startsWith('keyspace_hits:')) {
          stats.hits = parseInt(line.split(':')[1] || '0');
        } else if (line.startsWith('keyspace_misses:')) {
          stats.misses = parseInt(line.split(':')[1] || '0');
        }
      }
      
      // Count keys with our prefix
      const keys = await this.redis.keys(`${this.keyPrefix}*`);
      stats.size = keys.length;
      
      return stats;
    } catch (error) {
      console.error('Redis getStats error:', error);
      return null;
    }
  }

  /**
   * Cache wrapper function for easy caching
   */
  async cached<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetcher();
    
    // Store in cache
    await this.set(key, fresh, options);
    
    return fresh;
  }

  /**
   * Get full key with prefix
   */
  private getFullKey(key: string, prefix?: string): string {
    const fullPrefix = prefix ? `${this.keyPrefix}${prefix}:` : this.keyPrefix;
    return `${fullPrefix}${key}`;
  }
}

// Export singleton getter (lazy initialization)
export const getRedisCache = () => UpstashRedisService.getInstance();