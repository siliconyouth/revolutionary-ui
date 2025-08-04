#!/usr/bin/env npx tsx

import chalk from 'chalk';
import { FirecrawlWebAnalyzer } from './src/interactive/FirecrawlWebAnalyzer';
import { firecrawlConfig } from './src/interactive/tools/FirecrawlConfig';

async function testFirecrawl() {
  console.log(chalk.cyan.bold('\n🔥 Testing Firecrawl with Pagination and Token Management\n'));
  
  // Display current configuration
  firecrawlConfig.displayConfig();
  
  // Show available presets
  console.log(chalk.yellow('\n📋 Available Presets:\n'));
  const presets = firecrawlConfig.getPresets();
  presets.forEach(preset => {
    console.log(chalk.cyan(`${preset.name}:`));
    console.log(chalk.dim(`  ${preset.description}`));
    console.log(chalk.dim(`  Max Tokens: ${preset.config.maxTokensPerResponse.toLocaleString()}`));
    console.log(chalk.dim(`  Max Pages: ${preset.config.maxPagesPerCrawl}`));
    console.log(chalk.dim(`  Depth: ${preset.config.crawlDepth}\n`));
  });
  
  // Example: Switch to API-safe preset
  console.log(chalk.yellow('Switching to API-safe preset for demonstration...'));
  firecrawlConfig.setCurrentPreset('api-safe');
  
  // Create analyzer
  const analyzer = new FirecrawlWebAnalyzer();
  
  console.log(chalk.green('\n✅ Firecrawl is configured and ready to use!\n'));
  console.log(chalk.dim('To start the analyzer, run: await analyzer.analyze()'));
  console.log(chalk.dim('Or use the CLI: npx tsx src/interactive/tools/FirecrawlCLI.ts\n'));
  
  // Show example usage
  console.log(chalk.cyan('Example Usage:\n'));
  console.log(chalk.white('1. Analyze a website with pagination:'));
  console.log(chalk.dim('   const results = await firecrawl.crawlWithPagination("https://example.com");\n'));
  
  console.log(chalk.white('2. Search with token limits:'));
  console.log(chalk.dim('   const results = await firecrawl.smartCrawl("", { query: "AI tools", maxResults: 10 });\n'));
  
  console.log(chalk.white('3. Batch scrape with chunking:'));
  console.log(chalk.dim('   const results = await firecrawl.batchScrape(["url1", "url2", "url3"]);\n'));
  
  console.log(chalk.yellow('Token Management Features:'));
  console.log(chalk.dim('- Automatic content chunking when exceeding limits'));
  console.log(chalk.dim('- Per-model token limits (GPT-4: 128k, Claude-3: 200k, etc.)'));
  console.log(chalk.dim('- Safety factor to prevent API errors'));
  console.log(chalk.dim('- Token counting for all responses\n'));
  
  console.log(chalk.yellow('Pagination Features:'));
  console.log(chalk.dim('- Splits large crawls into manageable chunks'));
  console.log(chalk.dim('- Cursor support for resuming crawls'));
  console.log(chalk.dim('- Progress tracking with token counts'));
  console.log(chalk.dim('- Configurable chunk sizes\n'));
}

testFirecrawl().catch(console.error);