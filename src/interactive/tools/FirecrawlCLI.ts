#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { FirecrawlWebAnalyzer } from '../FirecrawlWebAnalyzer';
import { firecrawlConfig } from './FirecrawlConfig';
import { FirecrawlManager } from './FirecrawlManager';

class FirecrawlCLI {
  private analyzer: FirecrawlWebAnalyzer;
  private manager: FirecrawlManager;

  constructor() {
    this.analyzer = new FirecrawlWebAnalyzer();
    this.manager = new FirecrawlManager();
  }

  async run() {
    program
      .name('firecrawl')
      .description('Firecrawl Web Analyzer with Pagination and Token Management')
      .version('1.0.0');

    program
      .command('analyze')
      .description('Start interactive web analysis')
      .action(() => this.analyzer.analyze());

    program
      .command('config')
      .description('Manage Firecrawl configuration')
      .action(() => this.configMenu());

    program
      .command('preset <name>')
      .description('Switch to a different preset')
      .action((name) => {
        firecrawlConfig.setCurrentPreset(name);
        firecrawlConfig.displayConfig();
      });

    program
      .command('crawl <url>')
      .description('Quick crawl with current settings')
      .option('-d, --depth <number>', 'Crawl depth', '2')
      .option('-l, --limit <number>', 'Page limit', '50')
      .option('-o, --output <file>', 'Output file')
      .action((url, options) => this.quickCrawl(url, options));

    program
      .command('search <query>')
      .description('Search and analyze results')
      .option('-l, --limit <number>', 'Result limit', '10')
      .option('-s, --scrape', 'Scrape search results')
      .action((query, options) => this.quickSearch(query, options));

    program.parse();

    // Show interactive menu if no command
    if (process.argv.length === 2) {
      await this.interactiveMenu();
    }
  }

  private async interactiveMenu() {
    console.log(chalk.cyan.bold('\n🔥 Firecrawl Web Analyzer\n'));
    console.log(chalk.dim('Advanced web crawling with pagination and token management\n'));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🔍 Analyze Website/Search', value: 'analyze' },
          { name: '⚙️  Configure Settings', value: 'config' },
          { name: '📊 View Current Config', value: 'view' },
          { name: '🚀 Quick Crawl', value: 'quick' },
          { name: '📚 Documentation', value: 'docs' },
          { name: '❌ Exit', value: 'exit' }
        ]
      }
    ]);

    switch (action) {
      case 'analyze':
        await this.analyzer.analyze();
        break;
      case 'config':
        await this.configMenu();
        break;
      case 'view':
        firecrawlConfig.displayConfig();
        break;
      case 'quick':
        await this.quickCrawlMenu();
        break;
      case 'docs':
        this.showDocumentation();
        break;
      case 'exit':
        console.log(chalk.cyan('\n👋 Goodbye!\n'));
        process.exit(0);
    }

    // Return to menu
    await this.interactiveMenu();
  }

  private async configMenu() {
    console.log(chalk.cyan.bold('\n⚙️  Firecrawl Configuration\n'));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Configuration options:',
        choices: [
          { name: 'Change Preset', value: 'preset' },
          { name: 'Edit Token Limits', value: 'tokens' },
          { name: 'Custom Crawl Settings', value: 'custom' },
          { name: 'Create Custom Preset', value: 'create' },
          { name: 'Back to Main Menu', value: 'back' }
        ]
      }
    ]);

    switch (action) {
      case 'preset':
        await this.changePreset();
        break;
      case 'tokens':
        await this.editTokenLimits();
        break;
      case 'custom':
        await this.customSettings();
        break;
      case 'create':
        await this.createPreset();
        break;
      case 'back':
        return;
    }

    await this.configMenu();
  }

  private async changePreset() {
    const presets = firecrawlConfig.getPresets();
    
    const { preset } = await inquirer.prompt([
      {
        type: 'list',
        name: 'preset',
        message: 'Select preset:',
        choices: presets.map(p => ({
          name: `${p.name} - ${p.description}`,
          value: p.name
        }))
      }
    ]);

    firecrawlConfig.setCurrentPreset(preset);
  }

  private async editTokenLimits() {
    const { model, limit } = await inquirer.prompt([
      {
        type: 'list',
        name: 'model',
        message: 'Select model to configure:',
        choices: [
          'gpt-4',
          'gpt-3.5-turbo',
          'claude-3',
          'claude-2',
          'gemini-pro',
          'custom'
        ]
      },
      {
        type: 'number',
        name: 'limit',
        message: 'Enter token limit:',
        validate: (input) => input > 0 || 'Token limit must be positive'
      }
    ]);

    const modelName = model === 'custom' ? 
      (await inquirer.prompt([{
        type: 'input',
        name: 'name',
        message: 'Enter model name:'
      }])).name : model;

    firecrawlConfig.updateTokenLimit(modelName, limit);
    console.log(chalk.green(`✓ Updated ${modelName} token limit to ${limit}`));
  }

  private async customSettings() {
    const current = firecrawlConfig.getCrawlSettings();
    
    const settings = await inquirer.prompt([
      {
        type: 'number',
        name: 'maxTokensPerResponse',
        message: 'Max tokens per response:',
        default: current.maxTokensPerResponse
      },
      {
        type: 'number',
        name: 'maxPagesPerCrawl',
        message: 'Max pages per crawl:',
        default: current.maxPagesPerCrawl
      },
      {
        type: 'number',
        name: 'crawlDepth',
        message: 'Crawl depth:',
        default: current.crawlDepth
      },
      {
        type: 'number',
        name: 'pageChunkSize',
        message: 'Pages per chunk:',
        default: current.pageChunkSize
      }
    ]);

    firecrawlConfig.updateCrawlSettings(settings);
    console.log(chalk.green('✓ Settings updated'));
  }

  private async createPreset() {
    const preset = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Preset name:',
        validate: (input) => input.trim() !== '' || 'Name is required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:'
      },
      {
        type: 'number',
        name: 'maxTokensPerResponse',
        message: 'Max tokens per response:',
        default: 100000
      },
      {
        type: 'number',
        name: 'maxPagesPerCrawl',
        message: 'Max pages per crawl:',
        default: 50
      },
      {
        type: 'number',
        name: 'crawlDepth',
        message: 'Crawl depth:',
        default: 2
      }
    ]);

    firecrawlConfig.createCustomPreset({
      name: preset.name,
      description: preset.description,
      config: {
        maxTokensPerResponse: preset.maxTokensPerResponse,
        maxPagesPerCrawl: preset.maxPagesPerCrawl,
        crawlDepth: preset.crawlDepth,
        pageChunkSize: 10,
        formats: ['markdown'],
        onlyMainContent: true
      }
    });
  }

  private async quickCrawlMenu() {
    const { url } = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Enter URL to crawl:',
        validate: (input) => {
          try {
            new URL(input);
            return true;
          } catch {
            return 'Please enter a valid URL';
          }
        }
      }
    ]);

    await this.quickCrawl(url, {});
  }

  private async quickCrawl(url: string, options: any) {
    console.log(chalk.cyan(`\n🕷️ Crawling ${url}...\n`));

    try {
      const results = await this.manager.crawlWithPagination(url, {
        maxDepth: parseInt(options.depth) || 2,
        limit: parseInt(options.limit) || 50
      });

      console.log(chalk.green('\n✅ Crawl Complete\n'));
      
      let totalPages = 0;
      let totalTokens = 0;
      
      results.forEach((chunk, i) => {
        totalPages += chunk.totalPages;
        totalTokens += chunk.totalTokens;
        console.log(chalk.dim(`Chunk ${i + 1}: ${chunk.totalPages} pages, ${chunk.totalTokens.toLocaleString()} tokens`));
      });

      console.log(chalk.yellow(`\nTotal: ${totalPages} pages, ${totalTokens.toLocaleString()} tokens`));

      if (options.output) {
        const { writeFileSync } = require('fs');
        writeFileSync(options.output, JSON.stringify(results, null, 2));
        console.log(chalk.green(`\nSaved to: ${options.output}`));
      }
    } catch (error) {
      console.error(chalk.red('Crawl failed:'), error);
    }
  }

  private async quickSearch(query: string, options: any) {
    console.log(chalk.cyan(`\n🔍 Searching for: ${query}\n`));

    try {
      const results = await this.manager.smartCrawl('', {
        query,
        maxResults: parseInt(options.limit) || 10
      });

      console.log(chalk.green('\n✅ Search Complete\n'));
      
      if (results.pages) {
        results.pages.forEach((page: any, i: number) => {
          console.log(chalk.yellow(`${i + 1}. ${page.url}`));
          if (page.tokens) {
            console.log(chalk.dim(`   Tokens: ${page.tokens.toLocaleString()}`));
          }
        });
      }
    } catch (error) {
      console.error(chalk.red('Search failed:'), error);
    }
  }

  private showDocumentation() {
    console.log(chalk.cyan.bold('\n📚 Firecrawl Documentation\n'));
    
    console.log(chalk.yellow('Token Management:'));
    console.log(chalk.dim('- Automatically chunks content to stay within token limits'));
    console.log(chalk.dim('- Configurable limits per model (GPT-4, Claude, etc.)'));
    console.log(chalk.dim('- Safety factor applied to avoid exceeding limits\n'));

    console.log(chalk.yellow('Pagination:'));
    console.log(chalk.dim('- Crawls are split into manageable chunks'));
    console.log(chalk.dim('- Each chunk respects token limits'));
    console.log(chalk.dim('- Automatic continuation with cursor support\n'));

    console.log(chalk.yellow('Presets:'));
    console.log(chalk.dim('- lightweight: Fast overview crawling'));
    console.log(chalk.dim('- balanced: Good for most use cases'));
    console.log(chalk.dim('- comprehensive: Deep analysis'));
    console.log(chalk.dim('- code-analysis: Optimized for docs'));
    console.log(chalk.dim('- api-safe: Conservative rate limits\n'));

    console.log(chalk.yellow('Best Practices:'));
    console.log(chalk.dim('1. Start with lightweight preset for overview'));
    console.log(chalk.dim('2. Use api-safe preset for rate-limited APIs'));
    console.log(chalk.dim('3. Monitor token usage in results'));
    console.log(chalk.dim('4. Adjust chunk size based on content density'));
    
    console.log(chalk.cyan('\nPress Enter to continue...'));
  }
}

// Run CLI
if (require.main === module) {
  new FirecrawlCLI().run().catch(console.error);
}

export { FirecrawlCLI };