#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration types
interface FirecrawlConfig {
  apiKey: string;
  apiUrl: string;
  presets: Record<string, PresetConfig>;
  currentPreset: string;
  tokenManagement: TokenConfig;
  cache: CacheConfig;
}

interface PresetConfig {
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
}

interface TokenConfig {
  defaultMaxTokens: number;
  safetyFactor: number;
  modelLimits: Record<string, number>;
}

interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
}

// Token estimation class
class TokenEstimator {
  private readonly CHARS_PER_TOKEN = 4;
  
  estimate(text: string): number {
    if (!text) return 0;
    
    const words = text.split(/\s+/).length;
    const specialChars = (text.match(/[^\w\s]/g) || []).length;
    
    const tokenEstimate = Math.ceil(words * 1.3 + specialChars * 0.3);
    const charEstimate = Math.ceil(text.length / this.CHARS_PER_TOKEN);
    
    return Math.max(tokenEstimate, charEstimate);
  }
}

// Main server class
class FirecrawlMCPServer {
  private server: Server;
  private config: FirecrawlConfig;
  private tokenEstimator: TokenEstimator;
  private tokenUsage: Map<string, number> = new Map();
  private cache: Map<string, any> = new Map();

  constructor() {
    this.tokenEstimator = new TokenEstimator();
    this.config = this.loadConfiguration();
    
    this.server = new Server(
      {
        name: 'firecrawl-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private loadConfiguration(): FirecrawlConfig {
    const configPath = join(process.cwd(), '.firecrawl-mcp-config.json');
    let config: any;
    
    if (existsSync(configPath)) {
      config = JSON.parse(readFileSync(configPath, 'utf-8'));
    } else {
      // Default configuration
      config = {
        firecrawl: {
          apiKey: process.env.FIRECRAWL_API_KEY || '',
          apiUrl: 'https://api.firecrawl.dev/v1'
        },
        presets: {
          default: 'balanced'
        },
        tokenManagement: {
          defaultMaxTokens: 100000,
          safetyFactor: 0.8,
          modelLimits: {
            'gpt-4': 128000,
            'claude-3': 200000,
            'default': 100000
          }
        },
        cache: {
          enabled: true,
          ttl: 3600,
          maxSize: 100
        }
      };
    }
    
    // Load preset configurations
    const presets: Record<string, PresetConfig> = {
      lightweight: {
        maxTokensPerResponse: 50000,
        maxPagesPerCrawl: 20,
        crawlDepth: 1,
        pageChunkSize: 5,
        formats: ['markdown'],
        onlyMainContent: true,
        excludeTags: ['script', 'style', 'nav', 'footer', 'header']
      },
      balanced: {
        maxTokensPerResponse: 100000,
        maxPagesPerCrawl: 50,
        crawlDepth: 2,
        pageChunkSize: 10,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 1000,
        timeout: 45000
      },
      comprehensive: {
        maxTokensPerResponse: 150000,
        maxPagesPerCrawl: 100,
        crawlDepth: 3,
        pageChunkSize: 15,
        formats: ['markdown', 'html'],
        onlyMainContent: false,
        waitFor: 2000,
        timeout: 60000
      },
      'api-safe': {
        maxTokensPerResponse: 30000,
        maxPagesPerCrawl: 10,
        crawlDepth: 1,
        pageChunkSize: 3,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 3000,
        timeout: 60000
      }
    };
    
    return {
      apiKey: config.firecrawl?.apiKey || process.env.FIRECRAWL_API_KEY || '',
      apiUrl: config.firecrawl?.apiUrl || 'https://api.firecrawl.dev/v1',
      presets: config.presets?.configurations || presets,
      currentPreset: config.presets?.default || 'balanced',
      tokenManagement: config.tokenManagement || {
        defaultMaxTokens: 100000,
        safetyFactor: 0.8,
        modelLimits: {
          'gpt-4': 128000,
          'claude-3': 200000,
          'default': 100000
        }
      },
      cache: config.cache || {
        enabled: true,
        ttl: 3600,
        maxSize: 100
      }
    };
  }

  private getCurrentPreset(): PresetConfig {
    return this.config.presets[this.config.currentPreset] || this.config.presets.balanced;
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'firecrawl_scrape',
          description: 'Scrape a single URL with automatic token limit protection and content chunking',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'The URL to scrape'
              },
              formats: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['markdown', 'html', 'rawHtml', 'links', 'screenshot', 'extract']
                },
                description: 'Content formats to extract',
                default: ['markdown']
              },
              onlyMainContent: {
                type: 'boolean',
                description: 'Extract only the main content',
                default: true
              },
              maxTokens: {
                type: 'number',
                description: 'Override maximum tokens (uses preset by default)'
              },
              includeTags: {
                type: 'array',
                items: { type: 'string' },
                description: 'HTML tags to specifically include'
              },
              excludeTags: {
                type: 'array',
                items: { type: 'string' },
                description: 'HTML tags to exclude'
              },
              waitFor: {
                type: 'number',
                description: 'Time to wait for dynamic content (ms)'
              }
            },
            required: ['url']
          }
        },
        {
          name: 'firecrawl_crawl',
          description: 'Crawl a website with automatic pagination based on token limits',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'The starting URL to crawl'
              },
              maxDepth: {
                type: 'number',
                description: 'Maximum crawl depth',
                default: 2
              },
              limit: {
                type: 'number',
                description: 'Maximum number of pages to crawl',
                default: 50
              },
              includePaths: {
                type: 'array',
                items: { type: 'string' },
                description: 'URL paths to include (e.g., /docs, /api)'
              },
              excludePaths: {
                type: 'array',
                items: { type: 'string' },
                description: 'URL paths to exclude'
              },
              allowExternalLinks: {
                type: 'boolean',
                description: 'Allow crawling external links',
                default: false
              },
              pageChunkSize: {
                type: 'number',
                description: 'Number of pages per chunk (for pagination)'
              }
            },
            required: ['url']
          }
        },
        {
          name: 'firecrawl_search',
          description: 'Search and scrape results with token limit management',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results',
                default: 10
              },
              scrapeResults: {
                type: 'boolean',
                description: 'Whether to scrape the search results',
                default: true
              },
              maxTokensPerResult: {
                type: 'number',
                description: 'Maximum tokens per search result'
              }
            },
            required: ['query']
          }
        },
        {
          name: 'firecrawl_batch',
          description: 'Batch scrape multiple URLs with automatic chunking',
          inputSchema: {
            type: 'object',
            properties: {
              urls: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of URLs to scrape'
              },
              formats: {
                type: 'array',
                items: { type: 'string' },
                default: ['markdown']
              },
              maxTokensPerChunk: {
                type: 'number',
                description: 'Maximum tokens per response chunk'
              }
            },
            required: ['urls']
          }
        },
        {
          name: 'firecrawl_config',
          description: 'Configure Firecrawl settings and presets',
          inputSchema: {
            type: 'object',
            properties: {
              action: {
                type: 'string',
                enum: ['get', 'set_preset', 'update_tokens', 'list_presets'],
                description: 'Configuration action'
              },
              preset: {
                type: 'string',
                enum: ['lightweight', 'balanced', 'comprehensive', 'api-safe'],
                description: 'Preset name (for set_preset action)'
              },
              model: {
                type: 'string',
                description: 'Model name (for update_tokens action)'
              },
              tokenLimit: {
                type: 'number',
                description: 'Token limit (for update_tokens action)'
              }
            },
            required: ['action']
          }
        },
        {
          name: 'firecrawl_usage',
          description: 'Get token usage statistics',
          inputSchema: {
            type: 'object',
            properties: {
              reset: {
                type: 'boolean',
                description: 'Reset usage statistics',
                default: false
              }
            }
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'firecrawl_scrape':
            return await this.handleScrape(args);
          case 'firecrawl_crawl':
            return await this.handleCrawl(args);
          case 'firecrawl_search':
            return await this.handleSearch(args);
          case 'firecrawl_batch':
            return await this.handleBatch(args);
          case 'firecrawl_config':
            return await this.handleConfig(args);
          case 'firecrawl_usage':
            return await this.handleUsage(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error: any) {
        if (error instanceof McpError) throw error;
        
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  private async handleScrape(args: any) {
    const preset = this.getCurrentPreset();
    const maxTokens = args.maxTokens || preset.maxTokensPerResponse;
    
    // Simulate API call - in production, this would call Firecrawl API
    const mockContent = `# Content from ${args.url}\n\nThis is simulated content for demonstration purposes.`;
    const tokens = this.tokenEstimator.estimate(mockContent);
    
    let content = mockContent;
    let truncated = false;
    
    // Check token limit and truncate if necessary
    if (tokens > maxTokens) {
      const ratio = maxTokens / tokens;
      const maxChars = Math.floor(mockContent.length * ratio * 0.9); // 90% to be safe
      content = mockContent.substring(0, maxChars) + '\n\n[Content truncated due to token limit]';
      truncated = true;
    }
    
    // Track usage
    this.trackUsage('scrape', this.tokenEstimator.estimate(content));
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            url: args.url,
            tokens: this.tokenEstimator.estimate(content),
            truncated,
            maxTokens,
            content: {
              markdown: content
            }
          }, null, 2)
        }
      ]
    };
  }

  private async handleCrawl(args: any) {
    const preset = this.getCurrentPreset();
    const maxDepth = args.maxDepth || preset.crawlDepth;
    const limit = args.limit || preset.maxPagesPerCrawl;
    const chunkSize = args.pageChunkSize || preset.pageChunkSize;
    
    // Simulate crawl with pagination
    const totalPages = Math.min(limit, 25); // Simulated page count
    const chunks = Math.ceil(totalPages / chunkSize);
    const results = [];
    
    for (let i = 0; i < chunks; i++) {
      const startPage = i * chunkSize;
      const endPage = Math.min((i + 1) * chunkSize, totalPages);
      const chunkPages = endPage - startPage;
      const chunkTokens = chunkPages * 2000; // Simulated ~2000 tokens per page
      
      results.push({
        chunk: i + 1,
        pages: chunkPages,
        tokens: chunkTokens,
        hasMore: i < chunks - 1,
        urls: Array.from({ length: chunkPages }, (_, j) => 
          `${args.url}/page-${startPage + j + 1}`
        )
      });
      
      this.trackUsage('crawl', chunkTokens);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            url: args.url,
            totalPages,
            totalChunks: chunks,
            maxTokensPerChunk: preset.maxTokensPerResponse,
            results
          }, null, 2)
        }
      ]
    };
  }

  private async handleSearch(args: any) {
    const preset = this.getCurrentPreset();
    const limit = args.limit || 10;
    
    // Simulate search results
    const results = [];
    let totalTokens = 0;
    const maxTokens = args.maxTokensPerResult || preset.maxTokensPerResponse;
    
    for (let i = 0; i < limit; i++) {
      const pageTokens = 1500; // Simulated tokens per result
      
      if (totalTokens + pageTokens > maxTokens) {
        break;
      }
      
      results.push({
        url: `https://example${i + 1}.com`,
        title: `Result ${i + 1} for: ${args.query}`,
        tokens: pageTokens
      });
      
      totalTokens += pageTokens;
    }
    
    this.trackUsage('search', totalTokens);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            query: args.query,
            resultsRequested: limit,
            resultsReturned: results.length,
            totalTokens,
            maxTokensReached: results.length < limit,
            results
          }, null, 2)
        }
      ]
    };
  }

  private async handleBatch(args: any) {
    const preset = this.getCurrentPreset();
    const maxTokensPerChunk = args.maxTokensPerChunk || preset.maxTokensPerResponse;
    
    const results = [];
    const chunks = [];
    let currentChunk = [];
    let currentTokens = 0;
    
    for (const url of args.urls) {
      const pageTokens = 2000; // Simulated tokens
      
      if (currentTokens + pageTokens > maxTokensPerChunk && currentChunk.length > 0) {
        chunks.push({
          urls: [...currentChunk],
          tokens: currentTokens
        });
        currentChunk = [];
        currentTokens = 0;
      }
      
      currentChunk.push(url);
      currentTokens += pageTokens;
      
      results.push({
        url,
        tokens: pageTokens,
        success: true
      });
    }
    
    if (currentChunk.length > 0) {
      chunks.push({
        urls: currentChunk,
        tokens: currentTokens
      });
    }
    
    const totalTokens = results.reduce((sum, r) => sum + r.tokens, 0);
    this.trackUsage('batch', totalTokens);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            totalUrls: args.urls.length,
            totalTokens,
            chunks: chunks.length,
            maxTokensPerChunk,
            results
          }, null, 2)
        }
      ]
    };
  }

  private async handleConfig(args: any) {
    switch (args.action) {
      case 'get':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                currentPreset: this.config.currentPreset,
                presetConfig: this.getCurrentPreset(),
                tokenManagement: this.config.tokenManagement,
                cache: this.config.cache
              }, null, 2)
            }
          ]
        };
        
      case 'set_preset':
        if (!args.preset || !this.config.presets[args.preset]) {
          throw new Error(`Invalid preset: ${args.preset}`);
        }
        this.config.currentPreset = args.preset;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                preset: args.preset,
                config: this.getCurrentPreset()
              }, null, 2)
            }
          ]
        };
        
      case 'update_tokens':
        if (!args.model || !args.tokenLimit) {
          throw new Error('Model and tokenLimit required');
        }
        this.config.tokenManagement.modelLimits[args.model] = args.tokenLimit;
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: true,
                model: args.model,
                tokenLimit: args.tokenLimit
              }, null, 2)
            }
          ]
        };
        
      case 'list_presets':
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                presets: Object.entries(this.config.presets).map(([name, config]) => ({
                  name,
                  maxTokens: config.maxTokensPerResponse,
                  maxPages: config.maxPagesPerCrawl,
                  depth: config.crawlDepth
                }))
              }, null, 2)
            }
          ]
        };
        
      default:
        throw new Error(`Unknown config action: ${args.action}`);
    }
  }

  private async handleUsage(args: any) {
    if (args.reset) {
      this.tokenUsage.clear();
      return {
        content: [
          {
            type: 'text',
            text: 'Token usage statistics reset'
          }
        ]
      };
    }
    
    const usage = Object.fromEntries(this.tokenUsage);
    const total = Array.from(this.tokenUsage.values()).reduce((a, b) => a + b, 0);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            totalTokens: total,
            byOperation: usage,
            currentPreset: this.config.currentPreset,
            presetTokenLimit: this.getCurrentPreset().maxTokensPerResponse
          }, null, 2)
        }
      ]
    };
  }

  private trackUsage(operation: string, tokens: number) {
    const current = this.tokenUsage.get(operation) || 0;
    this.tokenUsage.set(operation, current + tokens);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Firecrawl MCP Server running with preset:', this.config.currentPreset);
  }
}

// Start the server
const server = new FirecrawlMCPServer();
server.run().catch(console.error);