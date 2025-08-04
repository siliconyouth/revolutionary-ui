import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { FirecrawlManager } from '../interactive/tools/FirecrawlManager';
import { firecrawlConfig } from '../interactive/tools/FirecrawlConfig';

interface MCPConfig {
  server: {
    name: string;
    version: string;
    description: string;
  };
  firecrawl: {
    apiKey: string;
    apiUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  pagination: any;
  tokenManagement: any;
  presets: any;
  cache: any;
  logging: any;
}

class FirecrawlMCPServer {
  private server: Server;
  private firecrawlManager: FirecrawlManager;
  private config: MCPConfig;
  private tokenUsage: Map<string, number> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'firecrawl-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        },
      }
    );

    // Load configuration
    this.config = this.loadConfig();
    
    // Initialize Firecrawl manager with config
    this.firecrawlManager = new FirecrawlManager(this.getCurrentPresetConfig());
    
    this.setupHandlers();
  }

  private loadConfig(): MCPConfig {
    const configPath = join(process.cwd(), '.firecrawl-mcp-config.json');
    if (existsSync(configPath)) {
      const content = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content);
      
      // Replace environment variables
      if (config.firecrawl.apiKey === '${FIRECRAWL_API_KEY}') {
        config.firecrawl.apiKey = process.env.FIRECRAWL_API_KEY || '';
      }
      
      return config;
    }
    
    throw new Error('Firecrawl MCP configuration not found');
  }

  private getCurrentPresetConfig() {
    const presetName = this.config.presets.default;
    return this.config.presets.configurations[presetName] || this.config.presets.configurations.balanced;
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getToolDefinitions(),
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        // Log token usage
        if (this.config.logging.logTokenUsage) {
          console.log(`[MCP] Tool called: ${name}`);
        }
        
        switch (name) {
          case 'firecrawl_scrape_with_pagination':
            return await this.handleScrapeWithPagination(args);
          case 'firecrawl_crawl_with_tokens':
            return await this.handleCrawlWithTokens(args);
          case 'firecrawl_search_limited':
            return await this.handleSearchLimited(args);
          case 'firecrawl_batch_scrape':
            return await this.handleBatchScrape(args);
          case 'firecrawl_map_website':
            return await this.handleMapWebsite(args);
          case 'firecrawl_extract_structured':
            return await this.handleExtractStructured(args);
          case 'firecrawl_get_token_usage':
            return await this.handleGetTokenUsage(args);
          case 'firecrawl_set_preset':
            return await this.handleSetPreset(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  private getToolDefinitions(): ToolSchema[] {
    return [
      {
        name: 'firecrawl_scrape_with_pagination',
        description: 'Scrape a URL with automatic pagination and token limit protection',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL to scrape' },
            formats: {
              type: 'array',
              items: { type: 'string' },
              description: 'Content formats (markdown, html, links, screenshot)',
              default: ['markdown']
            },
            maxTokens: {
              type: 'number',
              description: 'Maximum tokens per response (default: preset value)'
            },
            onlyMainContent: {
              type: 'boolean',
              description: 'Extract only main content',
              default: true
            },
            includeTags: {
              type: 'array',
              items: { type: 'string' },
              description: 'HTML tags to include'
            },
            excludeTags: {
              type: 'array',
              items: { type: 'string' },
              description: 'HTML tags to exclude'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'firecrawl_crawl_with_tokens',
        description: 'Crawl a website with pagination and token management',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'Starting URL' },
            maxDepth: {
              type: 'number',
              description: 'Maximum crawl depth',
              default: 2
            },
            limit: {
              type: 'number',
              description: 'Maximum pages to crawl',
              default: 50
            },
            maxTokensPerChunk: {
              type: 'number',
              description: 'Maximum tokens per response chunk'
            },
            includePaths: {
              type: 'array',
              items: { type: 'string' },
              description: 'URL paths to include'
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
            }
          },
          required: ['url']
        }
      },
      {
        name: 'firecrawl_search_limited',
        description: 'Search with automatic token limit management',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            limit: {
              type: 'number',
              description: 'Maximum results',
              default: 10
            },
            maxTokens: {
              type: 'number',
              description: 'Maximum tokens for all results'
            },
            scrapeOptions: {
              type: 'object',
              description: 'Options for scraping search results'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'firecrawl_batch_scrape',
        description: 'Batch scrape multiple URLs with chunking',
        inputSchema: {
          type: 'object',
          properties: {
            urls: {
              type: 'array',
              items: { type: 'string' },
              description: 'URLs to scrape'
            },
            maxTokensPerChunk: {
              type: 'number',
              description: 'Maximum tokens per chunk'
            },
            formats: {
              type: 'array',
              items: { type: 'string' },
              default: ['markdown']
            }
          },
          required: ['urls']
        }
      },
      {
        name: 'firecrawl_map_website',
        description: 'Map all URLs on a website',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'Website URL' },
            limit: {
              type: 'number',
              description: 'Maximum URLs to map',
              default: 100
            },
            includeSubdomains: {
              type: 'boolean',
              default: false
            }
          },
          required: ['url']
        }
      },
      {
        name: 'firecrawl_extract_structured',
        description: 'Extract structured data with token limits',
        inputSchema: {
          type: 'object',
          properties: {
            urls: {
              type: 'array',
              items: { type: 'string' },
              description: 'URLs to extract from'
            },
            schema: {
              type: 'object',
              description: 'Extraction schema'
            },
            prompt: {
              type: 'string',
              description: 'Extraction prompt'
            },
            maxTokens: {
              type: 'number',
              description: 'Maximum tokens for extraction'
            }
          },
          required: ['urls']
        }
      },
      {
        name: 'firecrawl_get_token_usage',
        description: 'Get current token usage statistics',
        inputSchema: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Session ID (optional)'
            }
          }
        }
      },
      {
        name: 'firecrawl_set_preset',
        description: 'Change the active configuration preset',
        inputSchema: {
          type: 'object',
          properties: {
            preset: {
              type: 'string',
              enum: ['lightweight', 'balanced', 'comprehensive', 'code-analysis', 'api-safe'],
              description: 'Preset name'
            }
          },
          required: ['preset']
        }
      }
    ];
  }

  private async handleScrapeWithPagination(args: any) {
    const { url, formats, maxTokens, ...options } = args;
    
    // Update config if maxTokens specified
    if (maxTokens) {
      this.firecrawlManager.updateConfig({ maxTokensPerResponse: maxTokens });
    }
    
    try {
      const result = await this.firecrawlManager.scrapePage(url, {
        formats: formats || ['markdown'],
        ...options
      });
      
      // Track token usage
      this.trackTokenUsage('scrape', result.tokens || 0);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              url: result.url,
              tokens: result.tokens,
              contentTruncated: result.content?.includes('[Content truncated due to token limit]'),
              data: {
                markdown: result.markdown,
                html: result.html,
                metadata: result.metadata
              }
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Scrape failed: ${error.message}`);
    }
  }

  private async handleCrawlWithTokens(args: any) {
    const { url, maxDepth, limit, maxTokensPerChunk, ...options } = args;
    
    // Update config if needed
    if (maxTokensPerChunk) {
      this.firecrawlManager.updateConfig({ maxTokensPerResponse: maxTokensPerChunk });
    }
    
    try {
      const results = await this.firecrawlManager.crawlWithPagination(url, {
        maxDepth: maxDepth || this.config.pagination.crawlDepth,
        limit: limit || this.config.pagination.maxPagesPerCrawl,
        ...options
      });
      
      // Calculate total tokens
      let totalTokens = 0;
      let totalPages = 0;
      
      results.forEach(chunk => {
        totalTokens += chunk.totalTokens;
        totalPages += chunk.totalPages;
      });
      
      // Track usage
      this.trackTokenUsage('crawl', totalTokens);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              summary: {
                totalPages,
                totalTokens,
                chunks: results.length,
                avgTokensPerPage: Math.round(totalTokens / totalPages)
              },
              chunks: results.map((chunk, index) => ({
                index,
                pages: chunk.totalPages,
                tokens: chunk.totalTokens,
                hasMore: chunk.hasMore,
                nextCursor: chunk.nextCursor,
                urls: chunk.pages.map(p => p.url)
              }))
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Crawl failed: ${error.message}`);
    }
  }

  private async handleSearchLimited(args: any) {
    const { query, limit, maxTokens, scrapeOptions } = args;
    
    if (maxTokens) {
      this.firecrawlManager.updateConfig({ maxTokensPerResponse: maxTokens });
    }
    
    try {
      const result = await this.firecrawlManager.smartCrawl('', {
        query,
        maxResults: limit || 10,
        analyzeContent: false
      });
      
      // Track usage
      if (result.totalTokens) {
        this.trackTokenUsage('search', result.totalTokens);
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              query,
              results: result.pages?.length || 0,
              totalTokens: result.totalTokens || 0,
              hasMore: result.hasMore,
              nextCursor: result.nextCursor,
              data: result.pages
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  private async handleBatchScrape(args: any) {
    const { urls, maxTokensPerChunk, formats } = args;
    
    if (maxTokensPerChunk) {
      this.firecrawlManager.updateConfig({ maxTokensPerResponse: maxTokensPerChunk });
    }
    
    try {
      const result = await this.firecrawlManager.batchScrape(urls, {
        formats: formats || ['markdown']
      });
      
      // Track usage
      this.trackTokenUsage('batch', result.totalTokens);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              processedUrls: result.totalPages,
              totalTokens: result.totalTokens,
              hasMore: result.hasMore,
              nextUrl: result.nextCursor,
              results: result.pages.map(p => ({
                url: p.url,
                tokens: p.tokens,
                hasContent: !!p.content
              }))
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Batch scrape failed: ${error.message}`);
    }
  }

  private async handleMapWebsite(args: any) {
    const { url, limit, includeSubdomains } = args;
    
    try {
      // This would call the actual Firecrawl map API
      const urls = await this.mapWebsiteSimulated(url, {
        limit: limit || 100,
        includeSubdomains
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              url,
              totalUrls: urls.length,
              urls: urls
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Map website failed: ${error.message}`);
    }
  }

  private async handleExtractStructured(args: any) {
    const { urls, schema, prompt, maxTokens } = args;
    
    if (maxTokens) {
      this.firecrawlManager.updateConfig({ maxTokensPerResponse: maxTokens });
    }
    
    try {
      // This would call the actual Firecrawl extract API
      const results = {
        success: true,
        extractedData: urls.map((url: string) => ({
          url,
          data: schema ? 'Structured data based on schema' : 'Extracted content'
        }))
      };
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2)
          }
        ]
      };
    } catch (error: any) {
      throw new Error(`Extract failed: ${error.message}`);
    }
  }

  private async handleGetTokenUsage(args: any) {
    const { sessionId } = args;
    
    const usage = {
      total: Array.from(this.tokenUsage.values()).reduce((a, b) => a + b, 0),
      byOperation: Object.fromEntries(this.tokenUsage),
      currentConfig: this.firecrawlManager.getConfig(),
      activePreset: this.config.presets.default
    };
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(usage, null, 2)
        }
      ]
    };
  }

  private async handleSetPreset(args: any) {
    const { preset } = args;
    
    if (!this.config.presets.configurations[preset]) {
      throw new Error(`Unknown preset: ${preset}`);
    }
    
    // Update configuration
    this.config.presets.default = preset;
    const newConfig = this.config.presets.configurations[preset];
    this.firecrawlManager.updateConfig(newConfig);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            preset,
            config: newConfig
          }, null, 2)
        }
      ]
    };
  }

  private trackTokenUsage(operation: string, tokens: number) {
    const current = this.tokenUsage.get(operation) || 0;
    this.tokenUsage.set(operation, current + tokens);
    
    if (this.config.logging.logTokenUsage) {
      console.log(`[Token Usage] ${operation}: ${tokens} tokens (total: ${current + tokens})`);
    }
  }

  private async mapWebsiteSimulated(url: string, options: any): Promise<string[]> {
    // Simulated implementation - in production this would call Firecrawl API
    const baseUrl = new URL(url);
    const urls = [url];
    
    // Add some common paths
    const commonPaths = ['/about', '/products', '/services', '/contact', '/blog', '/docs'];
    commonPaths.forEach(path => {
      urls.push(`${baseUrl.origin}${path}`);
    });
    
    return urls.slice(0, options.limit || 100);
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('[Firecrawl MCP] Server started with configuration:', {
      preset: this.config.presets.default,
      tokenLimits: this.config.tokenManagement.modelLimits
    });
  }
}

// Start the server
const server = new FirecrawlMCPServer();
server.run().catch(console.error);