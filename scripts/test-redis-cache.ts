#!/usr/bin/env tsx

/**
 * Test Upstash Redis caching functionality
 */

import { config } from '@dotenvx/dotenvx';
import path from 'path';
import { UpstashRedisService } from '../src/services/upstash-redis-service';
import { CacheManager, cache } from '../src/services/cache-manager';

config({ path: path.join(__dirname, '../.env.local') });

async function testRedisCache() {
  console.log('🔍 Testing Upstash Redis Cache...\n');

  // Check which cache provider is being used
  const providerType = cache.getProviderType();
  console.log(`📦 Cache Provider: ${providerType}`);

  if (providerType === 'memory') {
    console.log('⚠️  Using in-memory cache (Redis not configured)');
    console.log('\nTo use Redis, add to .env.local:');
    console.log('UPSTASH_REDIS_REST_URL=your-url');
    console.log('UPSTASH_REDIS_REST_TOKEN=your-token\n');
  }

  try {
    // Test 1: Basic get/set
    console.log('\n1️⃣ Testing basic get/set...');
    const testKey = 'test:basic';
    const testValue = { message: 'Hello Redis!', timestamp: Date.now() };
    
    await cache.set(testKey, testValue, 60); // 60 second TTL
    console.log('✅ Set value:', testValue);
    
    const retrieved = await cache.get(testKey);
    console.log('✅ Got value:', retrieved);
    
    // Test 2: Cache wrapper
    console.log('\n2️⃣ Testing cache.remember()...');
    let callCount = 0;
    
    const expensiveOperation = async () => {
      callCount++;
      console.log(`  ⚡ Expensive operation called (count: ${callCount})`);
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
      return { data: 'expensive result', computed: Date.now() };
    };
    
    // First call - should execute
    const result1 = await cache.remember('test:expensive', expensiveOperation, 60);
    console.log('  First call result:', result1);
    
    // Second call - should use cache
    const result2 = await cache.remember('test:expensive', expensiveOperation, 60);
    console.log('  Second call result:', result2);
    console.log(`  ✅ Function called ${callCount} time(s) (should be 1)`);
    
    // Test 3: AI generation cache key
    console.log('\n3️⃣ Testing AI generation cache key...');
    const aiPrompt = 'Create a responsive pricing table';
    const aiKey = CacheManager.keys.aiGeneration(aiPrompt, 'react');
    console.log('  AI cache key:', aiKey);
    
    await cache.set(aiKey, { 
      componentType: 'table',
      confidence: 0.95,
      config: { responsive: true }
    }, 3600);
    
    const aiCached = await cache.get(aiKey);
    console.log('  ✅ AI result cached:', aiCached);
    
    // Test 4: Vector search cache key
    console.log('\n4️⃣ Testing vector search cache key...');
    const searchQuery = 'data table with sorting';
    const vectorKey = CacheManager.keys.vectorSearch(searchQuery, 10);
    console.log('  Vector cache key:', vectorKey);
    
    await cache.set(vectorKey, [
      { id: 'comp-1', score: 0.95 },
      { id: 'comp-2', score: 0.87 }
    ], 300);
    
    const vectorCached = await cache.get(vectorKey);
    console.log('  ✅ Search results cached:', vectorCached);
    
    // Test 5: Existence check
    console.log('\n5️⃣ Testing existence check...');
    const exists1 = await cache.exists(testKey);
    const exists2 = await cache.exists('non-existent-key');
    console.log(`  ✅ Key "${testKey}" exists: ${exists1}`);
    console.log(`  ✅ Key "non-existent-key" exists: ${exists2}`);
    
    // Test 6: Delete
    console.log('\n6️⃣ Testing delete...');
    const deleted = await cache.delete(testKey);
    console.log(`  ✅ Key deleted: ${deleted}`);
    
    const afterDelete = await cache.exists(testKey);
    console.log(`  ✅ Key exists after delete: ${afterDelete}`);
    
    // Test 7: Redis-specific features (if using Redis)
    if (providerType === 'redis') {
      console.log('\n7️⃣ Testing Redis-specific features...');
      
      const redis = UpstashRedisService.getInstance();
      
      // Test counter
      const counterKey = 'test:counter';
      const count1 = await redis.incr(counterKey);
      const count2 = await redis.incr(counterKey);
      const count3 = await redis.decr(counterKey);
      console.log(`  ✅ Counter: ${count1} -> ${count2} -> ${count3}`);
      
      // Test TTL
      await redis.set('test:ttl', 'value', { ttl: 60 });
      const ttl = await redis.ttl('test:ttl');
      console.log(`  ✅ TTL remaining: ${ttl} seconds`);
      
      // Test batch operations
      await redis.mset({
        'test:batch1': 'value1',
        'test:batch2': 'value2',
        'test:batch3': 'value3'
      }, { ttl: 60 });
      
      const batchGet = await redis.mget(['test:batch1', 'test:batch2', 'test:batch3']);
      console.log('  ✅ Batch get:', batchGet);
      
      // Test stats
      const stats = await redis.getStats();
      if (stats) {
        console.log('\n📊 Redis Statistics:');
        console.log(`  Cache entries: ${stats.size}`);
        console.log(`  Memory usage: ${stats.memory}`);
        console.log(`  Hit rate: ${stats.hits > 0 ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1) : 0}%`);
      }
      
      // Cleanup
      await redis.deleteByPattern('test:*');
      console.log('\n✅ Test keys cleaned up');
    }
    
    console.log('\n✨ All cache tests completed successfully!');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testRedisCache().catch(console.error);