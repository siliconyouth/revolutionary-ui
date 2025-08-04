#!/usr/bin/env tsx

/**
 * Test Semantic Search API
 * Verify that vector search is working correctly
 */

import { config } from '@dotenvx/dotenvx';
import chalk from 'chalk';
import path from 'path';

config({ path: path.join(__dirname, '../.env.local') });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface TestCase {
  name: string;
  query: string;
  filters?: {
    framework?: string;
    category?: string;
    tags?: string[];
  };
}

async function testSemanticSearch() {
  console.log(chalk.blue('\n🔍 Testing Semantic Search API\n'));

  const testCases: TestCase[] = [
    {
      name: 'Natural language query',
      query: 'responsive data table with sorting and filtering',
    },
    {
      name: 'Framework-specific search',
      query: 'authentication form',
      filters: { framework: 'react' },
    },
    {
      name: 'Category-filtered search',
      query: 'interactive visualization',
      filters: { category: 'charts' },
    },
    {
      name: 'Multi-tag search',
      query: 'modern UI component',
      filters: { tags: ['responsive', 'accessible'] },
    },
    {
      name: 'Complex query',
      query: 'dashboard with real-time updates and dark mode support',
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(chalk.yellow(`\n📋 Test: ${testCase.name}`));
    console.log(chalk.gray(`Query: "${testCase.query}"`));
    
    if (testCase.filters) {
      console.log(chalk.gray('Filters:'), testCase.filters);
    }

    try {
      const startTime = Date.now();
      
      const response = await fetch(`${API_BASE}/search/semantic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: testCase.query,
          filters: testCase.filters,
          limit: 5,
          threshold: 0.6,
        }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      console.log(chalk.green('✅ Success!'));
      console.log(chalk.gray(`Response time: ${duration}ms`));
      console.log(chalk.gray(`Results found: ${data.totalResults}`));

      if (data.results && data.results.length > 0) {
        console.log(chalk.white('\nTop results:'));
        data.results.slice(0, 3).forEach((result: any, index: number) => {
          console.log(`${index + 1}. ${result.resource?.name || 'Unknown'}`);
          console.log(`   Score: ${Math.round(result.score * 100)}%`);
          console.log(`   Framework: ${result.resource?.framework || 'N/A'}`);
          console.log(`   Downloads: ${result.resource?.downloads || 0}`);
        });
      } else {
        console.log(chalk.yellow('No results found'));
      }

      passed++;
    } catch (error) {
      console.log(chalk.red('❌ Failed!'));
      console.error(chalk.red('Error:'), error.message);
      failed++;
    }
  }

  // Test popular searches
  console.log(chalk.yellow('\n📊 Testing Popular Searches\n'));
  
  try {
    const response = await fetch(`${API_BASE}/search/semantic`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.popularSearches && data.popularSearches.length > 0) {
      console.log(chalk.green('✅ Popular searches retrieved:'));
      data.popularSearches.forEach((search: string, index: number) => {
        console.log(`${index + 1}. ${search}`);
      });
    } else {
      console.log(chalk.yellow('No popular searches found'));
    }
    
    passed++;
  } catch (error) {
    console.log(chalk.red('❌ Failed to get popular searches'));
    console.error(error);
    failed++;
  }

  // Test similar components
  console.log(chalk.yellow('\n🔗 Testing Similar Components\n'));
  
  // First, get a resource ID
  try {
    const searchResponse = await fetch(`${API_BASE}/search/semantic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'form',
        limit: 1,
      }),
    });

    const searchData = await searchResponse.json();
    
    if (searchData.results && searchData.results.length > 0) {
      const resourceId = searchData.results[0].id;
      console.log(chalk.gray(`Testing similar components for: ${searchData.results[0].resource?.name}`));

      const similarResponse = await fetch(`${API_BASE}/resources/${resourceId}/similar?limit=3`);
      
      if (!similarResponse.ok) {
        throw new Error(`HTTP ${similarResponse.status}: ${similarResponse.statusText}`);
      }

      const similarData = await similarResponse.json();
      
      if (similarData.similar && similarData.similar.length > 0) {
        console.log(chalk.green('✅ Similar components found:'));
        similarData.similar.forEach((item: any, index: number) => {
          console.log(`${index + 1}. ${item.resource?.name || 'Unknown'} (${Math.round(item.score * 100)}% similar)`);
        });
      } else {
        console.log(chalk.yellow('No similar components found'));
      }
      
      passed++;
    } else {
      console.log(chalk.yellow('Skipping similar components test - no resources found'));
    }
  } catch (error) {
    console.log(chalk.red('❌ Failed to test similar components'));
    console.error(error);
    failed++;
  }

  // Summary
  console.log(chalk.blue('\n📊 Test Summary\n'));
  console.log(`Total tests: ${passed + failed}`);
  console.log(`Passed: ${chalk.green(passed)}`);
  console.log(`Failed: ${chalk.red(failed)}`);

  if (failed === 0) {
    console.log(chalk.green('\n✅ All tests passed!'));
  } else {
    console.log(chalk.red('\n❌ Some tests failed'));
    process.exit(1);
  }

  // Usage examples
  console.log(chalk.yellow('\n📝 Example Usage:\n'));
  
  console.log('1. Search with curl:');
  console.log(chalk.gray('curl -X POST http://localhost:3000/api/search/semantic \\'));
  console.log(chalk.gray('  -H "Content-Type: application/json" \\'));
  console.log(chalk.gray('  -d \'{"query": "responsive navigation menu", "limit": 10}\''));
  
  console.log('\n2. Get similar components:');
  console.log(chalk.gray('curl http://localhost:3000/api/resources/{resourceId}/similar?limit=5'));
  
  console.log('\n3. Get popular searches:');
  console.log(chalk.gray('curl http://localhost:3000/api/search/semantic'));
}

// Run if called directly
if (require.main === module) {
  testSemanticSearch().catch(console.error);
}

export { testSemanticSearch };