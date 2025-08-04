import chalk from 'chalk';
import ora from 'ora';
import { FirecrawlAPIClient } from './FirecrawlAPIClient';

interface FirecrawlConfig {
  maxTokensPerResponse: number;
  maxPagesPerCrawl: number;
  crawlDepth: number;
  pageChunkSize: number;
  formats: string[];
  onlyMainContent: boolean;
  waitFor: number;
  timeout: number;
}

interface CrawlResult {
  url: string;
  content: string;
  markdown?: string;
  html?: string;
  metadata?: any;
  tokens?: number;
}

interface PaginatedCrawlResult {
  pages: CrawlResult[];
  hasMore: boolean;
  nextCursor?: string;
  totalPages: number;
  totalTokens: number;
}

export class FirecrawlManager {
  private config: FirecrawlConfig;
  private tokenEstimator: TokenEstimator;
  private apiClient: FirecrawlAPIClient;

  constructor(config?: Partial<FirecrawlConfig>) {
    this.config = {
      maxTokensPerResponse: 100000, // Safe limit for most LLMs
      maxPagesPerCrawl: 50,
      crawlDepth: 2,
      pageChunkSize: 10, // Process 10 pages at a time
      formats: ['markdown'],
      onlyMainContent: true,
      waitFor: 1000,
      timeout: 30000,
      ...config
    };
    
    this.tokenEstimator = new TokenEstimator();
    this.apiClient = new FirecrawlAPIClient();
  }

  /**
   * Scrape a single URL with token limit protection
   */
  async scrapePage(url: string, options?: any): Promise<CrawlResult> {
    console.log(chalk.dim(`Scraping ${url}...`));
    
    try {
      // Use the real Firecrawl API
      const result = await this.apiClient.scrape(url, {
        formats: options?.formats || this.config.formats,
        onlyMainContent: options?.onlyMainContent ?? this.config.onlyMainContent,
        waitFor: options?.waitFor || this.config.waitFor,
        timeout: options?.timeout || this.config.timeout,
        includeTags: options?.includeTags,
        excludeTags: options?.excludeTags
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Scrape failed');
      }
      
      const content = result.data?.markdown || result.data?.content || '';
      const tokens = this.tokenEstimator.estimate(content);
      
      // Check if content exceeds token limit
      if (tokens > this.config.maxTokensPerResponse) {
        console.log(chalk.yellow(`Content exceeds token limit (${tokens} tokens). Chunking...`));
        return this.chunkContent({
          url,
          content,
          markdown: result.data?.markdown,
          html: result.data?.html,
          metadata: result.data?.metadata,
          tokens
        });
      }
      
      return {
        url,
        content,
        markdown: result.data?.markdown,
        html: result.data?.html,
        metadata: result.data?.metadata,
        tokens
      };
    } catch (error) {
      console.error(chalk.red(`Failed to scrape ${url}:`), error);
      throw error;
    }
  }

  /**
   * Crawl a website with pagination support
   */
  async crawlWithPagination(
    url: string, 
    options?: {
      maxDepth?: number;
      limit?: number;
      includePaths?: string[];
      excludePaths?: string[];
      allowExternalLinks?: boolean;
    }
  ): Promise<PaginatedCrawlResult[]> {
    const spinner = ora('Starting paginated crawl...').start();
    const results: PaginatedCrawlResult[] = [];
    let totalTokens = 0;
    let processedPages = 0;
    
    try {
      // First, map the website to get all URLs
      spinner.text = 'Mapping website structure...';
      const urls = await this.mapWebsite(url, options);
      spinner.succeed(`Found ${urls.length} pages to crawl`);
      
      // Calculate chunks based on token limits
      const chunks = this.calculateChunks(urls);
      
      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        spinner.text = `Processing chunk ${i + 1}/${chunks.length} (${chunk.length} pages)...`;
        
        const chunkResults: CrawlResult[] = [];
        let chunkTokens = 0;
        
        // Process pages in chunk
        for (const pageUrl of chunk) {
          try {
            const result = await this.scrapePage(pageUrl);
            
            // Check if adding this page would exceed token limit
            if (chunkTokens + (result.tokens || 0) > this.config.maxTokensPerResponse) {
              // Save current chunk and start new one
              results.push({
                pages: chunkResults,
                hasMore: true,
                nextCursor: pageUrl,
                totalPages: chunkResults.length,
                totalTokens: chunkTokens
              });
              
              // Start new chunk with current page
              chunkResults.length = 0;
              chunkTokens = 0;
            }
            
            chunkResults.push(result);
            chunkTokens += result.tokens || 0;
            totalTokens += result.tokens || 0;
            processedPages++;
            
            // Update spinner
            spinner.text = `Processing chunk ${i + 1}/${chunks.length} - Page ${processedPages}/${urls.length}`;
            
          } catch (error) {
            console.error(chalk.red(`Failed to process ${pageUrl}`));
          }
        }
        
        // Add remaining pages in chunk
        if (chunkResults.length > 0) {
          results.push({
            pages: chunkResults,
            hasMore: i < chunks.length - 1,
            nextCursor: i < chunks.length - 1 ? chunks[i + 1][0] : undefined,
            totalPages: chunkResults.length,
            totalTokens: chunkTokens
          });
        }
      }
      
      spinner.succeed(`Crawl completed: ${processedPages} pages, ${totalTokens} total tokens`);
      return results;
      
    } catch (error) {
      spinner.fail('Crawl failed');
      throw error;
    }
  }

  /**
   * Map a website to get all URLs
   */
  private async mapWebsite(url: string, options?: any): Promise<string[]> {
    console.log(chalk.dim('Mapping website...'));
    
    try {
      // Use the real Firecrawl API
      const result = await this.apiClient.map(url, {
        limit: options?.limit || this.config.maxPagesPerCrawl,
        includeSubdomains: options?.includeSubdomains || false
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Map failed');
      }
      
      return result.data || [];
    } catch (error) {
      console.error(chalk.red('Failed to map website:'), error);
      // Fallback to basic URL list
      return [url];
    }
  }

  /**
   * Calculate optimal chunks based on estimated tokens
   */
  private calculateChunks(urls: string[]): string[][] {
    const chunks: string[][] = [];
    let currentChunk: string[] = [];
    
    for (const url of urls) {
      currentChunk.push(url);
      
      if (currentChunk.length >= this.config.pageChunkSize) {
        chunks.push([...currentChunk]);
        currentChunk = [];
      }
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  /**
   * Chunk content that exceeds token limit
   */
  private chunkContent(result: CrawlResult): CrawlResult {
    const maxChunkTokens = Math.floor(this.config.maxTokensPerResponse * 0.9); // 90% to be safe
    const content = result.content || '';
    
    // Simple chunking by character count (rough estimation)
    const avgTokensPerChar = (result.tokens || 0) / content.length;
    const maxCharsPerChunk = Math.floor(maxChunkTokens / avgTokensPerChar);
    
    // Return first chunk
    const chunkedContent = content.substring(0, maxCharsPerChunk);
    
    return {
      ...result,
      content: chunkedContent + '\n\n[Content truncated due to token limit]',
      markdown: result.markdown ? result.markdown.substring(0, maxCharsPerChunk) + '\n\n[Content truncated due to token limit]' : undefined,
      tokens: this.tokenEstimator.estimate(chunkedContent)
    };
  }

  /**
   * Batch scrape multiple URLs with token management
   */
  async batchScrape(urls: string[], options?: any): Promise<PaginatedCrawlResult> {
    const results: CrawlResult[] = [];
    let totalTokens = 0;
    const maxTokens = this.config.maxTokensPerResponse;
    
    console.log(chalk.cyan(`Batch scraping ${urls.length} URLs...`));
    
    for (const url of urls) {
      try {
        const result = await this.scrapePage(url, options);
        const resultTokens = result.tokens || 0;
        
        // Check if adding this result would exceed token limit
        if (totalTokens + resultTokens > maxTokens && results.length > 0) {
          console.log(chalk.yellow(`Token limit reached. Processed ${results.length}/${urls.length} URLs`));
          
          return {
            pages: results,
            hasMore: true,
            nextCursor: url,
            totalPages: results.length,
            totalTokens
          };
        }
        
        results.push(result);
        totalTokens += resultTokens;
        
      } catch (error) {
        console.error(chalk.red(`Failed to scrape ${url}`));
      }
    }
    
    return {
      pages: results,
      hasMore: false,
      totalPages: results.length,
      totalTokens
    };
  }

  /**
   * Smart crawl with automatic pagination and token management
   */
  async smartCrawl(url: string, options?: {
    query?: string;
    maxResults?: number;
    analyzeContent?: boolean;
  }): Promise<any> {
    console.log(chalk.cyan.bold('\n🔍 Smart Crawl with Token Management\n'));
    
    // If it's a search query
    if (options?.query) {
      return this.searchWithPagination(options.query, options.maxResults);
    }
    
    // Otherwise, crawl the website
    const crawlResults = await this.crawlWithPagination(url, {
      maxDepth: this.config.crawlDepth,
      limit: this.config.maxPagesPerCrawl
    });
    
    // Optionally analyze content
    if (options?.analyzeContent) {
      return this.analyzeResults(crawlResults);
    }
    
    return crawlResults;
  }

  /**
   * Search with pagination support
   */
  private async searchWithPagination(query: string, maxResults: number = 10): Promise<PaginatedCrawlResult> {
    console.log(chalk.dim(`Searching for: ${query}`));
    
    try {
      // Use the real Firecrawl API
      const searchResult = await this.apiClient.search(query, {
        limit: maxResults,
        scrape: true
      });
      
      if (!searchResult.success) {
        throw new Error(searchResult.error || 'Search failed');
      }
      
      const results: CrawlResult[] = [];
      let totalTokens = 0;
      
      // Process search results with token limits
      for (const item of searchResult.data || []) {
        const content = item.content || item.description || '';
        const tokens = this.tokenEstimator.estimate(content);
        
        if (totalTokens + tokens > this.config.maxTokensPerResponse && results.length > 0) {
          return {
            pages: results,
            hasMore: true,
            nextCursor: item.url,
            totalPages: results.length,
            totalTokens
          };
        }
        
        results.push({
          url: item.url,
          content,
          metadata: { title: item.title, description: item.description },
          tokens
        });
        totalTokens += tokens;
      }
      
      return {
        pages: results,
        hasMore: false,
        totalPages: results.length,
        totalTokens
      };
    } catch (error) {
      console.error(chalk.red('Search failed:'), error);
      return {
        pages: [],
        hasMore: false,
        totalPages: 0,
        totalTokens: 0
      };
    }
  }

  /**
   * Analyze crawl results
   */
  private async analyzeResults(results: PaginatedCrawlResult[]): Promise<any> {
    const analysis = {
      totalPages: 0,
      totalTokens: 0,
      chunks: results.length,
      summary: [] as string[]
    };
    
    for (const result of results) {
      analysis.totalPages += result.totalPages;
      analysis.totalTokens += result.totalTokens;
      
      // Create summary for each chunk
      const chunkSummary = `Chunk: ${result.totalPages} pages, ${result.totalTokens} tokens`;
      analysis.summary.push(chunkSummary);
    }
    
    return analysis;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<FirecrawlConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): FirecrawlConfig {
    return { ...this.config };
  }
}

/**
 * Simple token estimator
 */
class TokenEstimator {
  // Rough estimation: 1 token ≈ 4 characters for English text
  private readonly CHARS_PER_TOKEN = 4;
  
  estimate(text: string): number {
    if (!text) return 0;
    
    // More accurate estimation based on word count and special characters
    const words = text.split(/\s+/).length;
    const specialChars = (text.match(/[^\w\s]/g) || []).length;
    
    // Rough formula: words * 1.3 + specialChars * 0.3
    const tokenEstimate = Math.ceil(words * 1.3 + specialChars * 0.3);
    
    // Fallback to character-based estimation
    const charEstimate = Math.ceil(text.length / this.CHARS_PER_TOKEN);
    
    // Return the higher estimate to be safe
    return Math.max(tokenEstimate, charEstimate);
  }
}

// Export a singleton instance
export const firecrawlManager = new FirecrawlManager();