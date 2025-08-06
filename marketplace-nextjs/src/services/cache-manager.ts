/**
 * Simple cache manager for Next.js
 */

export const CacheManager = {
  keys: {
    search: (query: string, options: any) => {
      return `${query}:${JSON.stringify(options)}`;
    },
  },
};

// Simple in-memory cache implementation
const memoryCache = new Map<string, { data: any; expires: number }>();

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const item = memoryCache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      memoryCache.delete(key);
      return null;
    }
    
    return item.data as T;
  },
  
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    memoryCache.set(key, {
      data: value,
      expires: Date.now() + (ttl * 1000),
    });
  },
  
  async delete(key: string): Promise<void> {
    memoryCache.delete(key);
  },
  
  async clear(): Promise<void> {
    memoryCache.clear();
  },
};