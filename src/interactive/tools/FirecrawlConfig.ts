import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

export interface FirecrawlPreset {
  name: string;
  description: string;
  config: {
    maxTokensPerResponse: number;
    maxPagesPerCrawl: number;
    crawlDepth: number;
    pageChunkSize: number;
    formats: string[];
    onlyMainContent: boolean;
    waitFor?: number;
    timeout?: number;
    excludeTags?: string[];
    includeTags?: string[];
  };
}

export class FirecrawlConfig {
  private configPath: string;
  private config: any;
  
  // Predefined presets for different use cases
  private presets: FirecrawlPreset[] = [
    {
      name: 'lightweight',
      description: 'Fast crawling with minimal content (good for overview)',
      config: {
        maxTokensPerResponse: 50000,
        maxPagesPerCrawl: 20,
        crawlDepth: 1,
        pageChunkSize: 5,
        formats: ['markdown'],
        onlyMainContent: true,
        excludeTags: ['script', 'style', 'nav', 'footer', 'header']
      }
    },
    {
      name: 'balanced',
      description: 'Balanced crawling for most use cases',
      config: {
        maxTokensPerResponse: 100000,
        maxPagesPerCrawl: 50,
        crawlDepth: 2,
        pageChunkSize: 10,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 1000,
        timeout: 30000
      }
    },
    {
      name: 'comprehensive',
      description: 'Deep crawling with full content extraction',
      config: {
        maxTokensPerResponse: 150000,
        maxPagesPerCrawl: 100,
        crawlDepth: 3,
        pageChunkSize: 15,
        formats: ['markdown', 'html'],
        onlyMainContent: false,
        waitFor: 2000,
        timeout: 60000
      }
    },
    {
      name: 'code-analysis',
      description: 'Optimized for analyzing code documentation',
      config: {
        maxTokensPerResponse: 120000,
        maxPagesPerCrawl: 80,
        crawlDepth: 3,
        pageChunkSize: 12,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        includeTags: ['code', 'pre', 'article', 'main'],
        excludeTags: ['nav', 'footer', 'aside']
      }
    },
    {
      name: 'api-safe',
      description: 'Conservative settings to avoid API limits',
      config: {
        maxTokensPerResponse: 30000,
        maxPagesPerCrawl: 10,
        crawlDepth: 1,
        pageChunkSize: 3,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 3000, // Longer wait to respect rate limits
        timeout: 45000
      }
    }
  ];

  constructor() {
    this.configPath = join(process.cwd(), '.firecrawl-config.json');
    this.loadConfig();
  }

  private loadConfig() {
    if (existsSync(this.configPath)) {
      try {
        const content = readFileSync(this.configPath, 'utf-8');
        this.config = JSON.parse(content);
      } catch (error) {
        console.error(chalk.red('Failed to load Firecrawl config:'), error);
        this.config = this.getDefaultConfig();
      }
    } else {
      this.config = this.getDefaultConfig();
      this.saveConfig();
    }
  }

  private getDefaultConfig() {
    return {
      currentPreset: 'balanced',
      customPresets: [],
      tokenLimits: {
        'gpt-4': 128000,
        'gpt-3.5-turbo': 16385,
        'claude-3': 200000,
        'claude-2': 100000,
        'gemini-pro': 32760,
        'default': 100000
      },
      crawlSettings: this.presets.find(p => p.name === 'balanced')?.config
    };
  }

  private saveConfig() {
    try {
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error(chalk.red('Failed to save Firecrawl config:'), error);
    }
  }

  getPresets(): FirecrawlPreset[] {
    return [...this.presets, ...this.config.customPresets];
  }

  getPreset(name: string): FirecrawlPreset | undefined {
    return this.getPresets().find(p => p.name === name);
  }

  getCurrentPreset(): FirecrawlPreset | undefined {
    return this.getPreset(this.config.currentPreset);
  }

  setCurrentPreset(name: string) {
    const preset = this.getPreset(name);
    if (preset) {
      this.config.currentPreset = name;
      this.config.crawlSettings = preset.config;
      this.saveConfig();
      console.log(chalk.green(`✓ Switched to '${name}' preset`));
    } else {
      console.error(chalk.red(`Preset '${name}' not found`));
    }
  }

  createCustomPreset(preset: FirecrawlPreset) {
    this.config.customPresets.push(preset);
    this.saveConfig();
    console.log(chalk.green(`✓ Created custom preset '${preset.name}'`));
  }

  updateTokenLimit(model: string, limit: number) {
    this.config.tokenLimits[model] = limit;
    this.saveConfig();
  }

  getTokenLimit(model: string): number {
    return this.config.tokenLimits[model] || this.config.tokenLimits.default;
  }

  getCrawlSettings() {
    return this.config.crawlSettings;
  }

  updateCrawlSettings(settings: Partial<FirecrawlPreset['config']>) {
    this.config.crawlSettings = { ...this.config.crawlSettings, ...settings };
    this.saveConfig();
  }

  // Helper method to calculate safe token limit for a model
  getSafeTokenLimit(model: string, safetyFactor: number = 0.8): number {
    const limit = this.getTokenLimit(model);
    return Math.floor(limit * safetyFactor);
  }

  // Display current configuration
  displayConfig() {
    console.log(chalk.cyan.bold('\n📋 Firecrawl Configuration\n'));
    
    const current = this.getCurrentPreset();
    console.log(chalk.yellow('Current Preset:'), current?.name || 'custom');
    if (current) {
      console.log(chalk.dim(`  ${current.description}`));
    }
    
    console.log(chalk.yellow('\nCrawl Settings:'));
    const settings = this.getCrawlSettings();
    console.log(chalk.dim(`  Max Tokens per Response: ${settings.maxTokensPerResponse.toLocaleString()}`));
    console.log(chalk.dim(`  Max Pages per Crawl: ${settings.maxPagesPerCrawl}`));
    console.log(chalk.dim(`  Crawl Depth: ${settings.crawlDepth}`));
    console.log(chalk.dim(`  Page Chunk Size: ${settings.pageChunkSize}`));
    console.log(chalk.dim(`  Formats: ${settings.formats.join(', ')}`));
    console.log(chalk.dim(`  Only Main Content: ${settings.onlyMainContent}`));
    
    console.log(chalk.yellow('\nToken Limits by Model:'));
    Object.entries(this.config.tokenLimits).forEach(([model, limit]) => {
      if (model !== 'default') {
        console.log(chalk.dim(`  ${model}: ${(limit as number).toLocaleString()} tokens`));
      }
    });
  }
}

// Export singleton instance
export const firecrawlConfig = new FirecrawlConfig();