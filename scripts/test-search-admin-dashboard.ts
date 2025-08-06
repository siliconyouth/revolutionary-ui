#!/usr/bin/env tsx
/**
 * Test search for admin dashboard components
 */

import { config } from '@dotenvx/dotenvx';
import path from 'path';
import { AlgoliaSearchService } from '../src/services/algolia-search-service.js';
import { UpstashVectorService } from '../src/services/upstash-vector-service.js';
import chalk from 'chalk';

// Load environment variables
config({ path: path.join(__dirname, '../.env.local') });

async function testAdminDashboardSearch() {
  console.log(chalk.blue.bold('\n🔍 Testing Search for Admin Dashboard Components\n'));
  
  try {
    const algoliaService = AlgoliaSearchService.getInstance();
    const vectorService = UpstashVectorService.getInstance();
    
    const searchQuery = 'admin dashboard components';
    console.log(chalk.yellow(`Query: "${searchQuery}"\n`));
    
    // Test 1: Keyword Search (Algolia)
    console.log(chalk.cyan('1. Keyword Search (Algolia):'));
    console.log('─'.repeat(50));
    
    const keywordResults = await algoliaService.search({
      query: searchQuery,
      type: 'components',
      searchMode: 'keyword',
      limit: 10,
    });
    
    console.log(`Found ${keywordResults.totalResults} results in ${keywordResults.processingTime}ms\n`);
    
    keywordResults.results.forEach((result, idx) => {
      console.log(chalk.green(`${idx + 1}. ${result.title}`));
      console.log(chalk.gray(`   Type: ${result.type} | Framework: ${result.framework || 'N/A'}`));
      console.log(chalk.gray(`   Category: ${result.category || 'N/A'} | Score: ${result.score.toFixed(3)}`));
      if (result.description) {
        console.log(chalk.gray(`   ${result.description.substring(0, 100)}...`));
      }
      if (result.highlights?.title) {
        console.log(chalk.yellow(`   Highlight: ${result.highlights.title}`));
      }
      console.log();
    });
    
    // Test 2: Semantic Search (Vector)
    console.log(chalk.cyan('\n2. Semantic Search (Vector):'));
    console.log('─'.repeat(50));
    
    const semanticResults = await algoliaService.search({
      query: searchQuery,
      type: 'resources',
      searchMode: 'semantic',
      limit: 10,
    });
    
    console.log(`Found ${semanticResults.totalResults} results in ${semanticResults.processingTime}ms\n`);
    
    semanticResults.results.forEach((result, idx) => {
      console.log(chalk.green(`${idx + 1}. ${result.title}`));
      console.log(chalk.gray(`   Type: ${result.type} | Framework: ${result.framework || 'N/A'}`));
      console.log(chalk.gray(`   Category: ${result.category || 'N/A'} | Score: ${result.score.toFixed(3)}`));
      if (result.description) {
        console.log(chalk.gray(`   ${result.description.substring(0, 100)}...`));
      }
      console.log();
    });
    
    // Test 3: Hybrid Search (Combined)
    console.log(chalk.cyan('\n3. Hybrid Search (Combined):'));
    console.log('─'.repeat(50));
    
    const hybridResults = await algoliaService.search({
      query: searchQuery,
      type: 'all',
      searchMode: 'hybrid',
      limit: 15,
    });
    
    console.log(`Found ${hybridResults.totalResults} results in ${hybridResults.processingTime}ms\n`);
    
    // Group results by type
    const grouped = {
      component: [] as any[],
      documentation: [] as any[],
      resource: [] as any[],
    };
    
    hybridResults.results.forEach(result => {
      grouped[result.type].push(result);
    });
    
    // Display grouped results
    Object.entries(grouped).forEach(([type, results]) => {
      if (results.length > 0) {
        console.log(chalk.yellow(`\n${type.toUpperCase()}S (${results.length}):`));
        results.forEach((result, idx) => {
          console.log(chalk.green(`  ${idx + 1}. ${result.title}`));
          if (result.framework) {
            console.log(chalk.gray(`     Framework: ${result.framework}`));
          }
          if (result.tags && result.tags.length > 0) {
            console.log(chalk.gray(`     Tags: ${result.tags.join(', ')}`));
          }
        });
      }
    });
    
    // Test 4: Direct Vector Search
    console.log(chalk.cyan('\n\n4. Direct Vector Search:'));
    console.log('─'.repeat(50));
    
    const vectorResults = await vectorService.searchSimilar(searchQuery, {
      limit: 10,
      filters: {
        category: 'Admin & Dashboard',
      },
    });
    
    console.log(`Found ${vectorResults.length} similar components\n`);
    
    vectorResults.forEach((result, idx) => {
      console.log(chalk.green(`${idx + 1}. ${result.metadata?.name || result.id}`));
      console.log(chalk.gray(`   Score: ${result.score.toFixed(3)}`));
      if (result.metadata?.description) {
        console.log(chalk.gray(`   ${result.metadata.description.substring(0, 100)}...`));
      }
      console.log();
    });
    
    // Summary
    console.log(chalk.blue.bold('\n📊 Search Summary:'));
    console.log('─'.repeat(50));
    console.log(`Total unique results found: ${new Set([
      ...keywordResults.results.map(r => r.id),
      ...semanticResults.results.map(r => r.id),
      ...hybridResults.results.map(r => r.id),
    ]).size}`);
    console.log(`Best match type: ${hybridResults.results[0]?.type || 'N/A'}`);
    console.log(`Top result: ${hybridResults.results[0]?.title || 'No results'}`);
    
  } catch (error) {
    console.error(chalk.red('❌ Error during search test:'), error);
    process.exit(1);
  }
}

// Run the test
testAdminDashboardSearch().catch(console.error);