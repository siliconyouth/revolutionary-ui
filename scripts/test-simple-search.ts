#!/usr/bin/env tsx
/**
 * Simple test for search functionality
 */

import { AlgoliaSearchService } from '../src/services/algolia-search-service.js';
import chalk from 'chalk';

async function testSearch() {
  console.log(chalk.blue.bold('🔍 Testing Search for Admin Dashboard Components\n'));
  
  try {
    const searchService = AlgoliaSearchService.getInstance();
    
    // Test 1: Simple keyword search
    console.log(chalk.cyan('Testing keyword search for "admin dashboard"...'));
    const results = await searchService.search({
      query: 'admin dashboard',
      type: 'components',
      searchMode: 'keyword',
      limit: 5,
      useCache: false,
    });
    
    console.log(chalk.green(`\n✅ Found ${results.totalResults} results in ${results.processingTime}ms\n`));
    
    results.results.forEach((result, idx) => {
      console.log(chalk.yellow(`${idx + 1}. ${result.title}`));
      console.log(chalk.gray(`   Type: ${result.type} | Framework: ${result.framework || 'N/A'}`));
      console.log(chalk.gray(`   Category: ${result.category || 'N/A'}`));
      if (result.tags && result.tags.length > 0) {
        console.log(chalk.gray(`   Tags: ${result.tags.join(', ')}`));
      }
      console.log();
    });
    
    // Test 2: Look for specific admin-related keywords
    const adminKeywords = ['admin', 'dashboard', 'admin panel', 'admin template', 'management'];
    
    console.log(chalk.cyan('\nTesting specific admin-related keywords:'));
    console.log('─'.repeat(50));
    
    for (const keyword of adminKeywords) {
      const searchResults = await searchService.search({
        query: keyword,
        type: 'all',
        searchMode: 'hybrid',
        limit: 3,
        useCache: false,
      });
      
      console.log(chalk.yellow(`\n"${keyword}": ${searchResults.totalResults} results`));
      searchResults.results.forEach(r => {
        console.log(chalk.gray(`  • ${r.title} (${r.type})`));
      });
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
  }
}

// Run the test
testSearch().catch(console.error);