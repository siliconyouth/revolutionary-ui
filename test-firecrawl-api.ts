#!/usr/bin/env npx tsx

import chalk from 'chalk';
import { config } from 'dotenv';
import { join } from 'path';
import { firecrawlAPI } from './src/interactive/tools/FirecrawlAPIClient';
import { firecrawlManager } from './src/interactive/tools/FirecrawlManager';
import { firecrawlConfig } from './src/interactive/tools/FirecrawlConfig';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

async function testFirecrawlAPI() {
  console.log(chalk.cyan.bold('\n🔥 Testing Firecrawl API Integration\n'));
  
  // Check API key
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.error(chalk.red('❌ FIRECRAWL_API_KEY not found in environment'));
    console.log(chalk.yellow('Run: ./scripts/setup-firecrawl.sh to configure'));
    return;
  }
  
  console.log(chalk.green('✅ API Key configured'));
  console.log(chalk.dim(`Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`));
  
  // Display current configuration
  firecrawlConfig.displayConfig();
  
  console.log(chalk.yellow('\n📋 Running API Tests:\n'));
  
  // Test 1: Simple scrape
  console.log(chalk.cyan('1. Testing simple scrape...'));
  try {
    const scrapeResult = await firecrawlAPI.scrape('https://example.com', {
      formats: ['markdown'],
      onlyMainContent: true
    });
    
    if (scrapeResult.success) {
      console.log(chalk.green('✅ Scrape successful'));
      console.log(chalk.dim(`  Content length: ${scrapeResult.data?.markdown?.length || 0} chars`));
    } else {
      console.log(chalk.red('❌ Scrape failed:', scrapeResult.error));
    }
  } catch (error) {
    console.error(chalk.red('❌ Scrape error:'), error);
  }
  
  // Test 2: Map website
  console.log(chalk.cyan('\n2. Testing website mapping...'));
  try {
    const mapResult = await firecrawlAPI.map('https://example.com', {
      limit: 10
    });
    
    if (mapResult.success) {
      console.log(chalk.green('✅ Map successful'));
      console.log(chalk.dim(`  Found ${mapResult.data?.length || 0} URLs`));
      mapResult.data?.slice(0, 5).forEach(url => {
        console.log(chalk.dim(`    - ${url}`));
      });
    } else {
      console.log(chalk.red('❌ Map failed:', mapResult.error));
    }
  } catch (error) {
    console.error(chalk.red('❌ Map error:'), error);
  }
  
  // Test 3: Search
  console.log(chalk.cyan('\n3. Testing search...'));
  try {
    const searchResult = await firecrawlAPI.search('web scraping tools', {
      limit: 5,
      scrape: false
    });
    
    if (searchResult.success) {
      console.log(chalk.green('✅ Search successful'));
      console.log(chalk.dim(`  Found ${searchResult.data?.length || 0} results`));
      searchResult.data?.forEach((result, i) => {
        console.log(chalk.dim(`  ${i + 1}. ${result.title}`));
        console.log(chalk.dim(`     ${result.url}`));
      });
    } else {
      console.log(chalk.red('❌ Search failed:', searchResult.error));
    }
  } catch (error) {
    console.error(chalk.red('❌ Search error:'), error);
  }
  
  // Test 4: Pagination with token management
  console.log(chalk.cyan('\n4. Testing pagination with token limits...'));
  try {
    // Switch to lightweight preset for testing
    firecrawlConfig.setCurrentPreset('lightweight');
    firecrawlManager.updateConfig(firecrawlConfig.getCrawlSettings());
    
    const paginatedResults = await firecrawlManager.crawlWithPagination('https://docs.firecrawl.dev', {
      maxDepth: 1,
      limit: 20
    });
    
    console.log(chalk.green('✅ Paginated crawl successful'));
    console.log(chalk.dim(`  Total chunks: ${paginatedResults.length}`));
    
    let totalPages = 0;
    let totalTokens = 0;
    
    paginatedResults.forEach((chunk, i) => {
      console.log(chalk.dim(`  Chunk ${i + 1}:`));
      console.log(chalk.dim(`    Pages: ${chunk.totalPages}`));
      console.log(chalk.dim(`    Tokens: ${chunk.totalTokens.toLocaleString()}`));
      console.log(chalk.dim(`    Has more: ${chunk.hasMore}`));
      
      totalPages += chunk.totalPages;
      totalTokens += chunk.totalTokens;
    });
    
    console.log(chalk.yellow(`\n  Total: ${totalPages} pages, ${totalTokens.toLocaleString()} tokens`));
    
  } catch (error) {
    console.error(chalk.red('❌ Pagination error:'), error);
  }
  
  console.log(chalk.cyan.bold('\n✅ API Integration Test Complete!\n'));
  
  // Show usage examples
  console.log(chalk.yellow('📚 Usage Examples:\n'));
  
  console.log(chalk.white('1. Basic scrape:'));
  console.log(chalk.dim(`   const result = await firecrawlAPI.scrape('https://example.com');\n`));
  
  console.log(chalk.white('2. Crawl with pagination:'));
  console.log(chalk.dim(`   const chunks = await firecrawlManager.crawlWithPagination('https://site.com', {
     maxDepth: 2,
     limit: 100
   });\n`));
  
  console.log(chalk.white('3. Search and scrape:'));
  console.log(chalk.dim(`   const results = await firecrawlAPI.search('AI tools', {
     limit: 10,
     scrape: true
   });\n`));
  
  console.log(chalk.white('4. Batch processing:'));
  console.log(chalk.dim(`   const batch = await firecrawlAPI.batchScrape([url1, url2, url3]);\n`));
}

// Run the test
testFirecrawlAPI().catch(console.error);