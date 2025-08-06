#!/usr/bin/env tsx

/**
 * Test Upstash Vector search functionality
 */

import { config } from '@dotenvx/dotenvx';
import path from 'path';
import { UpstashVectorService } from '../src/services/upstash-vector-service';

config({ path: path.join(__dirname, '../.env.local') });

async function testUpstashSearch() {
  console.log('🔍 Testing Upstash Vector Search...\n');

  // Check credentials
  if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
    console.error('❌ Missing Upstash credentials');
    console.log('\nPlease add to .env.local:');
    console.log('UPSTASH_VECTOR_REST_URL=your-url');
    console.log('UPSTASH_VECTOR_REST_TOKEN=your-token');
    process.exit(1);
  }

  const upstashService = UpstashVectorService.getInstance();

  try {
    // Get index stats
    console.log('📊 Index Statistics:');
    const stats = await upstashService.getStats();
    console.log(`  Vectors: ${stats.vectorCount}`);
    console.log(`  Pending: ${stats.pendingVectorCount}`);
    console.log(`  Dimension: ${stats.dimension}`);
    console.log(`  Size: ${stats.indexSize}\n`);

    // Test queries
    const testQueries = [
      {
        name: 'Data Table Search',
        query: 'responsive data table with sorting and filtering',
        filters: undefined,
      },
      {
        name: 'React Components',
        query: 'react component library',
        filters: { framework: 'react' },
      },
      {
        name: 'Chart Components',
        query: 'interactive data visualization charts',
        filters: { category: 'charts' },
      },
      {
        name: 'Form Components',
        query: 'form with validation',
        filters: { tags: ['form', 'validation'] },
      },
    ];

    for (const test of testQueries) {
      console.log(`\n📝 Test: ${test.name}`);
      console.log(`   Query: "${test.query}"`);
      if (test.filters) {
        console.log(`   Filters:`, test.filters);
      }

      try {
        const startTime = Date.now();
        const results = await upstashService.searchSimilar(test.query, {
          limit: 5,
          filters: test.filters,
        });
        const duration = Date.now() - startTime;

        console.log(`\n   ✅ Found ${results.length} results in ${duration}ms:\n`);
        
        results.forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.metadata.name} (Score: ${result.score.toFixed(3)})`);
          if (result.metadata.framework) {
            console.log(`      Framework: ${result.metadata.framework}`);
          }
          if (result.metadata.category) {
            console.log(`      Category: ${result.metadata.category}`);
          }
          if (result.metadata.tags && result.metadata.tags.length > 0) {
            console.log(`      Tags: ${result.metadata.tags.join(', ')}`);
          }
        });
      } catch (error) {
        console.error(`   ❌ Search failed:`, error);
      }
    }

    // Test similar components
    console.log('\n\n🔗 Testing Similar Components...\n');
    
    // First, get a resource ID from search
    const searchResults = await upstashService.searchSimilar('data table', { limit: 1 });
    
    if (searchResults.length > 0) {
      const resourceId = searchResults[0].id;
      const resourceName = searchResults[0].metadata.name;
      
      console.log(`Finding components similar to: ${resourceName}`);
      
      const similarResults = await upstashService.findSimilarComponents(resourceId, 5);
      
      console.log(`\n✅ Found ${similarResults.length} similar components:\n`);
      
      similarResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.metadata.name} (Score: ${result.score.toFixed(3)})`);
      });
    } else {
      console.log('⚠️  No resources found to test similarity');
    }

    // Test upsert
    console.log('\n\n📤 Testing Upsert...\n');
    
    const testResource = {
      id: 'test-resource-' + Date.now(),
      metadata: {
        name: 'Test Component',
        description: 'A test component for Upstash Vector',
        framework: 'react',
        category: 'test',
        tags: ['test', 'example'],
      },
    };

    await upstashService.upsertResource(testResource.id, testResource.metadata);
    console.log('✅ Successfully upserted test resource');

    // Search for it
    const testSearch = await upstashService.searchSimilar('test component', { limit: 1 });
    if (testSearch.length > 0 && testSearch[0].id === testResource.id) {
      console.log('✅ Test resource found in search results');
    } else {
      console.log('⚠️  Test resource not found in search results');
    }

    // Clean up
    await upstashService.deleteResource(testResource.id);
    console.log('✅ Test resource deleted');

    console.log('\n\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testUpstashSearch().catch(console.error);