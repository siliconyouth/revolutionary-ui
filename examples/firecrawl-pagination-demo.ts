#!/usr/bin/env npx tsx

import chalk from 'chalk';
import { FirecrawlManager } from '../src/interactive/tools/FirecrawlManager';
import { firecrawlConfig } from '../src/interactive/tools/FirecrawlConfig';

/**
 * Demonstrates Firecrawl pagination and token management
 */
async function demonstrateFirecrawlPagination() {
  console.log(chalk.cyan.bold('\n🔥 Firecrawl Pagination & Token Management Demo\n'));
  
  const firecrawl = new FirecrawlManager();
  
  // Example 1: Website Crawl with Pagination
  console.log(chalk.yellow('Example 1: Website Crawl with Automatic Pagination\n'));
  console.log(chalk.dim('When crawling a website with many pages, Firecrawl automatically:'));
  console.log(chalk.dim('- Maps all URLs first'));
  console.log(chalk.dim('- Splits them into chunks based on token limits'));
  console.log(chalk.dim('- Returns paginated results with cursors\n'));
  
  // Simulate crawling a documentation site
  const mockCrawlResults = await simulatePaginatedCrawl('https://docs.example.com', {
    totalPages: 150,
    avgTokensPerPage: 2000,
    maxTokensPerResponse: 100000
  });
  
  console.log(chalk.green('Crawl Results:'));
  mockCrawlResults.forEach((chunk, index) => {
    console.log(chalk.cyan(`\nChunk ${index + 1}:`));
    console.log(chalk.dim(`  Pages: ${chunk.pages.length}`));
    console.log(chalk.dim(`  Total Tokens: ${chunk.totalTokens.toLocaleString()}`));
    console.log(chalk.dim(`  Has More: ${chunk.hasMore}`));
    if (chunk.nextCursor) {
      console.log(chalk.dim(`  Next Cursor: ${chunk.nextCursor}`));
    }
  });
  
  // Example 2: Search with Token Limits
  console.log(chalk.yellow('\n\nExample 2: Search Results with Token Protection\n'));
  console.log(chalk.dim('When searching, Firecrawl:'));
  console.log(chalk.dim('- Fetches search results'));
  console.log(chalk.dim('- Scrapes each result page'));
  console.log(chalk.dim('- Stops when token limit is reached'));
  console.log(chalk.dim('- Returns partial results with continuation cursor\n'));
  
  const mockSearchResults = await simulateSearchWithTokens('AI development tools', {
    totalResults: 20,
    avgTokensPerResult: 8000,
    maxTokensPerResponse: 50000
  });
  
  console.log(chalk.green('Search Results:'));
  console.log(chalk.dim(`  Query: "AI development tools"`));
  console.log(chalk.dim(`  Results Processed: ${mockSearchResults.pages.length}/${20}`));
  console.log(chalk.dim(`  Total Tokens: ${mockSearchResults.totalTokens.toLocaleString()}`));
  console.log(chalk.dim(`  Stopped at: ${mockSearchResults.nextCursor || 'Completed'}`));
  
  // Example 3: Content Chunking for Large Pages
  console.log(chalk.yellow('\n\nExample 3: Large Page Content Chunking\n'));
  console.log(chalk.dim('When a single page exceeds token limits:'));
  console.log(chalk.dim('- Content is automatically chunked'));
  console.log(chalk.dim('- Truncation notice is added'));
  console.log(chalk.dim('- Token count is recalculated\n'));
  
  const largePageExample = await simulateLargePageChunking({
    originalTokens: 150000,
    maxTokensPerResponse: 100000
  });
  
  console.log(chalk.green('Large Page Chunking:'));
  console.log(chalk.dim(`  Original Tokens: ${largePageExample.original.toLocaleString()}`));
  console.log(chalk.dim(`  After Chunking: ${largePageExample.chunked.toLocaleString()}`));
  console.log(chalk.dim(`  Reduction: ${Math.round((1 - largePageExample.chunked / largePageExample.original) * 100)}%`));
  
  // Example 4: Preset-based Configuration
  console.log(chalk.yellow('\n\nExample 4: Using Different Presets\n'));
  
  const presets = ['lightweight', 'balanced', 'comprehensive', 'api-safe'];
  console.log(chalk.green('Preset Comparison:'));
  
  presets.forEach(presetName => {
    const preset = firecrawlConfig.getPreset(presetName);
    if (preset) {
      console.log(chalk.cyan(`\n${preset.name}:`));
      console.log(chalk.dim(`  ${preset.description}`));
      console.log(chalk.dim(`  Token Limit: ${preset.config.maxTokensPerResponse.toLocaleString()}`));
      console.log(chalk.dim(`  Page Limit: ${preset.config.maxPagesPerCrawl}`));
      console.log(chalk.dim(`  Chunk Size: ${preset.config.pageChunkSize}`));
      
      // Calculate estimated capacity
      const estimatedCapacity = preset.config.maxTokensPerResponse / 2000; // Avg 2000 tokens/page
      console.log(chalk.dim(`  Estimated Pages per Response: ~${Math.floor(estimatedCapacity)}`));
    }
  });
  
  // Example 5: Model-specific Token Limits
  console.log(chalk.yellow('\n\nExample 5: Model-specific Token Management\n'));
  
  const models = ['gpt-4', 'claude-3', 'gemini-pro', 'gpt-3.5-turbo'];
  console.log(chalk.green('Token Limits by Model:'));
  
  models.forEach(model => {
    const limit = firecrawlConfig.getTokenLimit(model);
    const safeLimit = firecrawlConfig.getSafeTokenLimit(model);
    console.log(chalk.cyan(`\n${model}:`));
    console.log(chalk.dim(`  Max Tokens: ${limit.toLocaleString()}`));
    console.log(chalk.dim(`  Safe Limit (80%): ${safeLimit.toLocaleString()}`));
    console.log(chalk.dim(`  Est. Pages: ~${Math.floor(safeLimit / 2000)}`));
  });
  
  console.log(chalk.cyan.bold('\n\n📊 Best Practices Summary:\n'));
  console.log(chalk.white('1. Choose the Right Preset:'));
  console.log(chalk.dim('   - Use "lightweight" for quick overviews'));
  console.log(chalk.dim('   - Use "api-safe" when rate limits are a concern'));
  console.log(chalk.dim('   - Use "comprehensive" for detailed analysis\n'));
  
  console.log(chalk.white('2. Monitor Token Usage:'));
  console.log(chalk.dim('   - Check totalTokens in each response'));
  console.log(chalk.dim('   - Use hasMore flag to detect incomplete crawls'));
  console.log(chalk.dim('   - Save nextCursor for resuming\n'));
  
  console.log(chalk.white('3. Handle Pagination:'));
  console.log(chalk.dim('   - Process results in chunks'));
  console.log(chalk.dim('   - Aggregate data across chunks'));
  console.log(chalk.dim('   - Implement resume functionality\n'));
  
  console.log(chalk.green('✅ Demo Complete!\n'));
}

// Simulation functions
async function simulatePaginatedCrawl(url: string, config: any) {
  const chunks = [];
  const pagesPerChunk = Math.floor(config.maxTokensPerResponse / config.avgTokensPerPage);
  const totalChunks = Math.ceil(config.totalPages / pagesPerChunk);
  
  for (let i = 0; i < totalChunks; i++) {
    const startPage = i * pagesPerChunk;
    const endPage = Math.min((i + 1) * pagesPerChunk, config.totalPages);
    const chunkPages = endPage - startPage;
    
    chunks.push({
      pages: Array(chunkPages).fill(null).map((_, j) => ({
        url: `${url}/page-${startPage + j + 1}`,
        tokens: config.avgTokensPerPage
      })),
      totalPages: chunkPages,
      totalTokens: chunkPages * config.avgTokensPerPage,
      hasMore: i < totalChunks - 1,
      nextCursor: i < totalChunks - 1 ? `${url}/page-${endPage + 1}` : undefined
    });
  }
  
  return chunks;
}

async function simulateSearchWithTokens(query: string, config: any) {
  const pages = [];
  let totalTokens = 0;
  let nextCursor;
  
  for (let i = 0; i < config.totalResults; i++) {
    const pageTokens = config.avgTokensPerResult;
    
    if (totalTokens + pageTokens > config.maxTokensPerResponse) {
      nextCursor = `result-${i + 1}`;
      break;
    }
    
    pages.push({
      url: `https://result${i + 1}.com`,
      tokens: pageTokens
    });
    totalTokens += pageTokens;
  }
  
  return {
    pages,
    totalPages: pages.length,
    totalTokens,
    hasMore: !!nextCursor,
    nextCursor
  };
}

async function simulateLargePageChunking(config: any) {
  const safeLimit = Math.floor(config.maxTokensPerResponse * 0.9);
  const chunkedTokens = Math.min(config.originalTokens, safeLimit);
  
  return {
    original: config.originalTokens,
    chunked: chunkedTokens
  };
}

// Run the demo
demonstrateFirecrawlPagination().catch(console.error);