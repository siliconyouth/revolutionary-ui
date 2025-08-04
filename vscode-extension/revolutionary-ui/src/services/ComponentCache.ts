import NodeCache from 'node-cache';

export class ComponentCache {
    private cache: NodeCache;

    constructor() {
        // Default TTL of 1 hour
        this.cache = new NodeCache({ 
            stdTTL: 3600,
            checkperiod: 600,
            useClones: true
        });
    }

    get<T>(key: string): T | undefined {
        return this.cache.get<T>(key);
    }

    set<T>(key: string, value: T, ttl?: number): boolean {
        if (ttl) {
            return this.cache.set(key, value, ttl);
        }
        return this.cache.set(key, value);
    }

    delete(key: string): number {
        return this.cache.del(key);
    }

    clear(): void {
        this.cache.flushAll();
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    keys(): string[] {
        return this.cache.keys();
    }

    getStats() {
        return this.cache.getStats();
    }
}