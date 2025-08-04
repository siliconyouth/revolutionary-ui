import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { FirecrawlManager } from './tools/FirecrawlManager';
import { firecrawlConfig } from './tools/FirecrawlConfig';
import { AIManager } from './ai/AIManager';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

export class FirecrawlWebAnalyzer {
  private firecrawl: FirecrawlManager;
  private aiManager: AIManager;
  private reportsDir: string;

  constructor() {
    this.firecrawl = new FirecrawlManager();
    this.aiManager = new AIManager();
    this.reportsDir = join(process.cwd(), 'firecrawl-reports');
    
    if (!existsSync(this.reportsDir)) {
      mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async analyze() {
    console.log(chalk.cyan.bold('\n🔥 Firecrawl Web Analyzer with Pagination\n'));
    
    // Show current configuration
    firecrawlConfig.displayConfig();
    
    // Ask if user wants to change preset
    const { changePreset } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'changePreset',
        message: 'Would you like to change the crawl preset?',
        default: false
      }
    ]);
    
    if (changePreset) {
      await this.selectPreset();
    }
    
    // Get analysis type
    const { analysisType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'analysisType',
        message: 'What would you like to analyze?',
        choices: [
          { name: '🌐 Single Website (with pagination)', value: 'website' },
          { name: '🔍 Search Results (with token limits)', value: 'search' },
          { name: '📄 Specific Pages (batch with chunking)', value: 'batch' },
          { name: '🤖 Smart Crawl (automatic optimization)', value: 'smart' },
          { name: '📚 Documentation Site (optimized for docs)', value: 'docs' }
        ]
      }
    ]);
    
    switch (analysisType) {
      case 'website':
        await this.analyzeWebsite();
        break;
      case 'search':
        await this.analyzeSearch();
        break;
      case 'batch':
        await this.analyzeBatch();
        break;
      case 'smart':
        await this.smartAnalysis();
        break;
      case 'docs':
        await this.analyzeDocumentation();
        break;
    }
  }

  private async selectPreset() {
    const presets = firecrawlConfig.getPresets();
    
    const { preset } = await inquirer.prompt([
      {
        type: 'list',
        name: 'preset',
        message: 'Select a crawl preset:',
        choices: presets.map(p => ({
          name: `${p.name} - ${p.description}`,
          value: p.name
        }))
      }
    ]);
    
    firecrawlConfig.setCurrentPreset(preset);
    
    // Update Firecrawl manager with new config
    const config = firecrawlConfig.getCrawlSettings();
    this.firecrawl.updateConfig(config);
  }

  private async analyzeWebsite() {
    const { url } = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Enter website URL to analyze:',
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
    
    const { options } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'options',
        message: 'Select crawl options:',
        choices: [
          { name: 'Include external links', value: 'external' },
          { name: 'Capture screenshots', value: 'screenshots' },
          { name: 'Extract structured data', value: 'extract' },
          { name: 'Analyze with AI', value: 'ai' }
        ]
      }
    ]);
    
    console.log(chalk.cyan('\n🕷️ Starting paginated crawl...\n'));
    
    try {
      const results = await this.firecrawl.crawlWithPagination(url, {
        allowExternalLinks: options.includes('external')
      });
      
      // Display results summary
      console.log(chalk.green('\n✅ Crawl Results Summary:\n'));
      results.forEach((chunk, index) => {
        console.log(chalk.yellow(`Chunk ${index + 1}:`));
        console.log(chalk.dim(`  Pages: ${chunk.totalPages}`));
        console.log(chalk.dim(`  Tokens: ${chunk.totalTokens.toLocaleString()}`));
        console.log(chalk.dim(`  Has More: ${chunk.hasMore}`));
      });
      
      // Save results
      await this.saveResults(results, `website-${new Date().toISOString()}`);
      
      // Optionally analyze with AI
      if (options.includes('ai')) {
        await this.analyzeWithAI(results);
      }
      
    } catch (error) {
      console.error(chalk.red('Crawl failed:'), error);
    }
  }

  private async analyzeSearch() {
    const { query, maxResults } = await inquirer.prompt([
      {
        type: 'input',
        name: 'query',
        message: 'Enter search query:',
        validate: (input) => input.trim() !== '' || 'Please enter a search query'
      },
      {
        type: 'number',
        name: 'maxResults',
        message: 'Maximum results to analyze:',
        default: 10
      }
    ]);
    
    console.log(chalk.cyan('\n🔍 Searching and analyzing...\n'));
    
    try {
      const results = await this.firecrawl.smartCrawl('', {
        query,
        maxResults,
        analyzeContent: true
      });
      
      // Display results
      console.log(chalk.green('\n✅ Search Results:\n'));
      if (results.pages) {
        results.pages.forEach((page: any, index: number) => {
          console.log(chalk.yellow(`${index + 1}. ${page.url}`));
          console.log(chalk.dim(`   Tokens: ${page.tokens?.toLocaleString() || 'N/A'}`));
        });
      }
      
      // Save results
      await this.saveResults(results, `search-${query.replace(/\s+/g, '-')}-${Date.now()}`);
      
    } catch (error) {
      console.error(chalk.red('Search failed:'), error);
    }
  }

  private async analyzeBatch() {
    const { urls } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'urls',
        message: 'Enter URLs to analyze (one per line):'
      }
    ]);
    
    const urlList = urls.split('\n').filter((url: string) => url.trim());
    
    console.log(chalk.cyan(`\n📄 Batch analyzing ${urlList.length} URLs...\n`));
    
    try {
      const results = await this.firecrawl.batchScrape(urlList);
      
      // Display results
      console.log(chalk.green('\n✅ Batch Results:\n'));
      console.log(chalk.dim(`  Processed: ${results.totalPages} pages`));
      console.log(chalk.dim(`  Total Tokens: ${results.totalTokens.toLocaleString()}`));
      console.log(chalk.dim(`  Has More: ${results.hasMore}`));
      
      if (results.hasMore) {
        console.log(chalk.yellow(`\n⚠️  Token limit reached. Next URL: ${results.nextCursor}`));
      }
      
      // Save results
      await this.saveResults(results, `batch-${Date.now()}`);
      
    } catch (error) {
      console.error(chalk.red('Batch analysis failed:'), error);
    }
  }

  private async smartAnalysis() {
    const { input, goal } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: 'Enter URL or search query:',
        validate: (input) => input.trim() !== '' || 'Please enter a URL or query'
      },
      {
        type: 'list',
        name: 'goal',
        message: 'What is your analysis goal?',
        choices: [
          { name: 'Extract technical documentation', value: 'tech-docs' },
          { name: 'Analyze UI/UX patterns', value: 'ui-patterns' },
          { name: 'Research competitor features', value: 'competitor' },
          { name: 'Gather product information', value: 'product' },
          { name: 'General content analysis', value: 'general' }
        ]
      }
    ]);
    
    // Configure based on goal
    let config;
    switch (goal) {
      case 'tech-docs':
        config = firecrawlConfig.getPreset('code-analysis')?.config;
        break;
      case 'ui-patterns':
        config = firecrawlConfig.getPreset('comprehensive')?.config;
        break;
      default:
        config = firecrawlConfig.getPreset('balanced')?.config;
    }
    
    if (config) {
      this.firecrawl.updateConfig(config);
    }
    
    console.log(chalk.cyan('\n🤖 Starting smart analysis...\n'));
    
    try {
      // Determine if input is URL or query
      let isUrl = false;
      try {
        new URL(input);
        isUrl = true;
      } catch {}
      
      const results = await this.firecrawl.smartCrawl(isUrl ? input : '', {
        query: isUrl ? undefined : input,
        analyzeContent: true
      });
      
      // Generate AI insights based on goal
      await this.generateGoalBasedInsights(results, goal);
      
    } catch (error) {
      console.error(chalk.red('Smart analysis failed:'), error);
    }
  }

  private async analyzeDocumentation() {
    const { url } = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Enter documentation site URL:',
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
    
    // Use documentation-optimized preset
    firecrawlConfig.setCurrentPreset('code-analysis');
    this.firecrawl.updateConfig(firecrawlConfig.getCrawlSettings());
    
    console.log(chalk.cyan('\n📚 Analyzing documentation site...\n'));
    
    try {
      const results = await this.firecrawl.crawlWithPagination(url, {
        maxDepth: 3,
        includePaths: ['/docs', '/documentation', '/guide', '/api', '/reference']
      });
      
      // Create documentation summary
      console.log(chalk.green('\n✅ Documentation Analysis Complete\n'));
      
      let totalPages = 0;
      let totalTokens = 0;
      const sections: string[] = [];
      
      results.forEach((chunk) => {
        totalPages += chunk.totalPages;
        totalTokens += chunk.totalTokens;
        
        chunk.pages.forEach((page) => {
          const path = new URL(page.url).pathname;
          const section = path.split('/')[1] || 'root';
          if (!sections.includes(section)) {
            sections.push(section);
          }
        });
      });
      
      console.log(chalk.yellow('Summary:'));
      console.log(chalk.dim(`  Total Pages: ${totalPages}`));
      console.log(chalk.dim(`  Total Tokens: ${totalTokens.toLocaleString()}`));
      console.log(chalk.dim(`  Sections Found: ${sections.join(', ')}`));
      console.log(chalk.dim(`  Chunks Created: ${results.length}`));
      
      // Save documentation
      await this.saveResults(results, `docs-${new URL(url).hostname}-${Date.now()}`);
      
      // Generate documentation overview
      const { generateOverview } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'generateOverview',
          message: 'Generate AI documentation overview?',
          default: true
        }
      ]);
      
      if (generateOverview) {
        await this.generateDocumentationOverview(results);
      }
      
    } catch (error) {
      console.error(chalk.red('Documentation analysis failed:'), error);
    }
  }

  private async analyzeWithAI(results: any) {
    console.log(chalk.cyan('\n🤖 Analyzing content with AI...\n'));
    
    const spinner = ora('Generating insights...').start();
    
    try {
      // Take first chunk for AI analysis (to avoid token limits)
      const firstChunk = results[0];
      if (!firstChunk || firstChunk.pages.length === 0) {
        spinner.fail('No content to analyze');
        return;
      }
      
      // Prepare content for AI
      const content = firstChunk.pages
        .slice(0, 3) // Analyze first 3 pages
        .map((page: any) => `URL: ${page.url}\n\n${page.content}`)
        .join('\n\n---\n\n');
      
      const prompt = `Analyze this web content and provide insights on:
1. Main purpose and target audience
2. Key features and functionality
3. Design patterns and UX approach
4. Technical stack (if identifiable)
5. Content structure and organization

Content:
${content}`;
      
      const insights = await this.aiManager.generateResponse(prompt, {
        maxTokens: 2000
      });
      
      spinner.succeed('AI analysis complete');
      
      console.log(chalk.green('\n📊 AI Insights:\n'));
      console.log(chalk.white(insights));
      
    } catch (error) {
      spinner.fail('AI analysis failed');
      console.error(error);
    }
  }

  private async generateGoalBasedInsights(results: any, goal: string) {
    console.log(chalk.cyan('\n🎯 Generating goal-based insights...\n'));
    
    const prompts: Record<string, string> = {
      'tech-docs': 'Extract and summarize the technical documentation, APIs, and implementation details.',
      'ui-patterns': 'Identify UI/UX patterns, design systems, component libraries, and visual design principles.',
      'competitor': 'Analyze features, pricing, target market, unique selling points, and competitive advantages.',
      'product': 'Extract product features, benefits, use cases, pricing, and customer testimonials.',
      'general': 'Provide a comprehensive overview of the content, key information, and main takeaways.'
    };
    
    const prompt = prompts[goal] || prompts.general;
    
    // Similar to analyzeWithAI but with goal-specific prompts
    await this.analyzeWithAI(results);
  }

  private async generateDocumentationOverview(results: any) {
    console.log(chalk.cyan('\n📖 Generating documentation overview...\n'));
    
    const spinner = ora('Creating overview...').start();
    
    try {
      // Extract table of contents from results
      const toc: string[] = [];
      const sections: Record<string, string[]> = {};
      
      results.forEach((chunk: any) => {
        chunk.pages.forEach((page: any) => {
          const url = new URL(page.url);
          const path = url.pathname;
          const parts = path.split('/').filter(p => p);
          
          if (parts.length > 0) {
            const section = parts[0];
            if (!sections[section]) {
              sections[section] = [];
            }
            sections[section].push(page.url);
          }
        });
      });
      
      // Create overview
      let overview = '# Documentation Overview\n\n';
      overview += `Generated on: ${new Date().toLocaleString()}\n\n`;
      overview += '## Table of Contents\n\n';
      
      Object.entries(sections).forEach(([section, urls]) => {
        overview += `### ${section}\n`;
        urls.slice(0, 5).forEach(url => {
          overview += `- ${url}\n`;
        });
        if (urls.length > 5) {
          overview += `- ... and ${urls.length - 5} more\n`;
        }
        overview += '\n';
      });
      
      spinner.succeed('Overview generated');
      
      // Save overview
      const overviewPath = join(this.reportsDir, `doc-overview-${Date.now()}.md`);
      writeFileSync(overviewPath, overview);
      
      console.log(chalk.green(`\n✅ Overview saved to: ${overviewPath}\n`));
      
    } catch (error) {
      spinner.fail('Overview generation failed');
      console.error(error);
    }
  }

  private async saveResults(results: any, filename: string) {
    const filepath = join(this.reportsDir, `${filename}.json`);
    
    try {
      writeFileSync(filepath, JSON.stringify(results, null, 2));
      console.log(chalk.green(`\n📁 Results saved to: ${filepath}\n`));
    } catch (error) {
      console.error(chalk.red('Failed to save results:'), error);
    }
  }
}