# Upstash Redis Setup Guide

This guide explains how to set up Upstash Redis for caching in Revolutionary UI.

## Overview

Revolutionary UI uses Upstash Redis as its primary caching solution. Upstash provides a serverless Redis database that works seamlessly with edge functions and serverless deployments.

### Benefits of Upstash Redis

- **Serverless Architecture**: Pay only for what you use, no fixed costs
- **Global Edge Caching**: Automatic global replication for low latency
- **REST API**: Works in any environment, including edge functions
- **Auto-scaling**: Handles traffic spikes automatically
- **Free Tier**: 10,000 commands per day at no cost
- **Zero Configuration**: No connection pooling or server management needed

## Quick Setup

### 1. Create Upstash Account

1. Visit [Upstash Console](https://console.upstash.com/)
2. Sign up for a free account
3. Verify your email

### 2. Create Redis Database

1. Click **"Create Database"**
2. Configure your database:
   - **Name**: `revolutionary-ui-cache`
   - **Type**: Regional (or Global for multi-region)
   - **Region**: Choose closest to your users
   - **Eviction**: Enable with LRU policy
   - **TLS**: Keep enabled (default)

3. Click **"Create"**

### 3. Get Credentials

1. Go to your database's **Details** tab
2. Copy the following values:
   - **REST URL**: `https://your-database.upstash.io`
   - **REST Token**: `your-token-here`

### 4. Configure Environment

Add to your `.env.local`:

```env
# Upstash Redis for caching
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# Optional cache settings
CACHE_DEFAULT_TTL=3600          # 1 hour default
CACHE_KEY_PREFIX=rui:           # Key prefix
ENABLE_CACHE_LOGGING=false      # Set to true for debugging
```

## Usage in Revolutionary UI

### Automatic Caching

Revolutionary UI automatically uses Redis caching for:

1. **AI Component Generation**
   - Caches generated component configurations
   - Reduces API costs by reusing previous generations
   - Default TTL: 1 hour

2. **Vector Search Results**
   - Caches semantic search queries
   - Improves search response times
   - Default TTL: 5 minutes

3. **Component Data**
   - Caches frequently accessed components
   - Reduces database queries
   - Default TTL: 1 hour

### Manual Cache Usage

```typescript
import { cache, CacheManager } from '@/services/cache-manager';

// Simple get/set
const data = await cache.get('my-key');
await cache.set('my-key', data, 3600); // TTL in seconds

// Using cache wrapper
const result = await cache.remember(
  'expensive-operation',
  async () => {
    // Expensive operation here
    return computeExpensiveData();
  },
  3600 // Cache for 1 hour
);

// Clear specific keys
await cache.delete('my-key');

// Clear by pattern (Redis only)
await cache.invalidatePattern('user:*');
```

### Cache Keys

Revolutionary UI uses structured cache keys:

```typescript
// AI generation
ai:gen:[hash]

// Vector search
vector:[hash]:[limit]

// Components
component:[id]
components:list:[page]:[limit]

// User data
user:[id]
session:[token]

// Rate limiting
rate:[ip]:[endpoint]
```

## Monitoring & Debugging

### View Cache Statistics

```bash
npm run cache:stats
```

### Enable Cache Logging

Set in `.env.local`:
```env
ENABLE_CACHE_LOGGING=true
```

This will log:
- Cache hits/misses
- Operation timings
- Key patterns
- Error details

### Upstash Console Monitoring

1. Visit your database in [Upstash Console](https://console.upstash.com/)
2. View real-time metrics:
   - Commands per second
   - Hit rate
   - Memory usage
   - Top commands

## Performance Optimization

### 1. Set Appropriate TTLs

```typescript
// Short-lived data (5 minutes)
await cache.set('trending', data, 300);

// Medium-lived data (1 hour)
await cache.set('component:123', data, 3600);

// Long-lived data (24 hours)
await cache.set('static:config', data, 86400);
```

### 2. Use Batch Operations

```typescript
// Get multiple values
const values = await cache.mget(['key1', 'key2', 'key3']);

// Set multiple values
await cache.mset({
  'key1': value1,
  'key2': value2,
  'key3': value3
}, { ttl: 3600 });
```

### 3. Implement Cache Warming

```typescript
// Warm cache on startup
async function warmCache() {
  const popularComponents = await db.getPopularComponents();
  for (const component of popularComponents) {
    await cache.set(
      `component:${component.id}`,
      component,
      3600
    );
  }
}
```

## Troubleshooting

### Connection Issues

If you see connection errors:

1. Verify credentials are correct
2. Check if your IP is whitelisted (if using IP restrictions)
3. Ensure REST URL includes `https://`
4. Test connection:

```bash
curl -X GET https://your-database.upstash.io/get/test \
  -H "Authorization: Bearer your-token-here"
```

### Cache Misses

High cache miss rate? Check:

1. TTL values - too short?
2. Key naming - consistent?
3. Eviction policy - LRU recommended
4. Memory limit - increase if needed

### Performance Issues

Slow cache operations? Consider:

1. Choose closer region
2. Enable global database (paid feature)
3. Batch operations when possible
4. Review key sizes (keep small)

## Cost Optimization

### Free Tier Limits
- 10,000 commands per day
- 256MB storage
- 1 database

### Monitoring Usage

Check daily usage in Upstash Console to stay within limits.

### Optimization Tips

1. **Use appropriate TTLs** - Don't cache forever
2. **Compress large values** - Reduce storage
3. **Batch operations** - Fewer commands
4. **Clean up unused keys** - Regular maintenance

## Fallback Strategy

Revolutionary UI includes automatic fallback:

1. **Primary**: Upstash Redis (if configured)
2. **Fallback**: In-memory cache
3. **Final**: Direct database/API calls

This ensures the application works even without Redis.

## Security Best Practices

1. **Never commit credentials** - Use environment variables
2. **Use read-only tokens** where possible
3. **Enable TLS** (default in Upstash)
4. **Rotate tokens** periodically
5. **Monitor access logs** in Upstash Console

## Advanced Features

### Global Database

For multi-region deployments:

1. Upgrade to Global database in Upstash
2. Automatic replication to 8+ regions
3. Read from nearest region
4. Consistent writes globally

### Edge Caching

Works seamlessly with:
- Vercel Edge Functions
- Cloudflare Workers
- Netlify Edge Functions
- AWS Lambda@Edge

### Custom Eviction Policies

Configure in Upstash Console:
- **noeviction**: Return errors when memory full
- **allkeys-lru**: Evict least recently used keys
- **volatile-lru**: Evict LRU keys with TTL
- **allkeys-lfu**: Evict least frequently used

## Support

- [Upstash Documentation](https://docs.upstash.com/redis)
- [Revolutionary UI Issues](https://github.com/yourusername/revolutionary-ui/issues)
- [Upstash Discord](https://discord.gg/upstash)

---

With Upstash Redis configured, Revolutionary UI will automatically use caching to improve performance and reduce costs across all features.