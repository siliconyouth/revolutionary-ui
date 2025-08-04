import axios, { AxiosInstance } from 'axios';
import chalk from 'chalk';

interface FirecrawlOptions {
  formats?: string[];
  onlyMainContent?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
  waitFor?: number;
  timeout?: number;
  maxRetries?: number;
}

interface ScrapeResponse {
  success: boolean;
  data?: {
    content?: string;
    markdown?: string;
    html?: string;
    metadata?: any;
    links?: string[];
    screenshot?: string;
  };
  error?: string;
}

interface CrawlResponse {
  success: boolean;
  id?: string;
  url?: string;
  status?: string;
  total?: number;
  completed?: number;
  data?: any[];
  error?: string;
}

interface SearchResponse {
  success: boolean;
  data?: Array<{
    url: string;
    title: string;
    description?: string;
    content?: string;
  }>;
  error?: string;
}

export class FirecrawlAPIClient {
  private client: AxiosInstance;
  private apiKey: string;
  private tokenEstimator: TokenEstimator;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.FIRECRAWL_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn(chalk.yellow('⚠️  Firecrawl API key not provided. Some features will be limited.'));
    }
    
    this.client = axios.create({
      baseURL: 'https://api.firecrawl.dev/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });
    
    this.tokenEstimator = new TokenEstimator();
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          console.error(chalk.red(`Firecrawl API Error: ${error.response.status} - ${error.response.data?.error || error.message}`));
        } else if (error.request) {
          console.error(chalk.red('Firecrawl API Error: No response received'));
        } else {
          console.error(chalk.red(`Firecrawl API Error: ${error.message}`));
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Scrape a single URL
   */
  async scrape(url: string, options: FirecrawlOptions = {}): Promise<ScrapeResponse> {
    try {
      console.log(chalk.dim(`Scraping ${url}...`));
      
      const response = await this.client.post('/scrape', {
        url,
        formats: options.formats || ['markdown'],
        onlyMainContent: options.onlyMainContent !== false,
        includeTags: options.includeTags,
        excludeTags: options.excludeTags,
        waitFor: options.waitFor,
        timeout: options.timeout || 30000
      });
      
      const data = response.data;
      
      // Estimate tokens
      if (data.data?.markdown) {
        const tokens = this.tokenEstimator.estimate(data.data.markdown);
        console.log(chalk.dim(`  Tokens: ${tokens.toLocaleString()}`));
      }
      
      return {
        success: true,
        data: data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Start a crawl job
   */
  async crawl(url: string, options: {
    maxCrawlPages?: number;
    maxDepth?: number;
    includes?: string[];
    excludes?: string[];
    allowExternalLinks?: boolean;
    scrapeOptions?: FirecrawlOptions;
  } = {}): Promise<CrawlResponse> {
    try {
      console.log(chalk.dim(`Starting crawl of ${url}...`));
      
      const response = await this.client.post('/crawl', {
        url,
        maxCrawlPages: options.maxCrawlPages || 50,
        maxDepth: options.maxDepth || 2,
        includes: options.includes,
        excludes: options.excludes,
        allowExternalLinks: options.allowExternalLinks || false,
        scrapeOptions: {
          formats: options.scrapeOptions?.formats || ['markdown'],
          onlyMainContent: options.scrapeOptions?.onlyMainContent !== false
        }
      });
      
      return {
        success: true,
        id: response.data.id,
        url: response.data.url,
        status: 'started'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Check crawl job status
   */
  async getCrawlStatus(jobId: string): Promise<CrawlResponse> {
    try {
      const response = await this.client.get(`/crawl/${jobId}`);
      const data = response.data;
      
      return {
        success: true,
        id: jobId,
        status: data.status,
        total: data.total,
        completed: data.completed,
        data: data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Cancel a crawl job
   */
  async cancelCrawl(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.client.delete(`/crawl/${jobId}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Search the web
   */
  async search(query: string, options: {
    limit?: number;
    scrape?: boolean;
  } = {}): Promise<SearchResponse> {
    try {
      console.log(chalk.dim(`Searching for: ${query}`));
      
      const response = await this.client.post('/search', {
        query,
        limit: options.limit || 10,
        scrape: options.scrape !== false
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Map a website to get all URLs
   */
  async map(url: string, options: {
    limit?: number;
    includeSubdomains?: boolean;
  } = {}): Promise<{ success: boolean; data?: string[]; error?: string }> {
    try {
      console.log(chalk.dim(`Mapping ${url}...`));
      
      const response = await this.client.post('/map', {
        url,
        limit: options.limit || 100,
        includeSubdomains: options.includeSubdomains || false
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Batch scrape multiple URLs
   */
  async batchScrape(urls: string[], options: FirecrawlOptions = {}): Promise<{
    success: boolean;
    data?: ScrapeResponse[];
    error?: string;
  }> {
    try {
      console.log(chalk.dim(`Batch scraping ${urls.length} URLs...`));
      
      const results: ScrapeResponse[] = [];
      
      // Process URLs in batches to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const batchPromises = batch.map(url => this.scrape(url, options));
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Add delay between batches to respect rate limits
        if (i + batchSize < urls.length) {
          await this.delay(1000);
        }
      }
      
      return {
        success: true,
        data: results
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract structured data from URLs
   */
  async extract(urls: string[], options: {
    schema?: any;
    prompt?: string;
    systemPrompt?: string;
  } = {}): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(chalk.dim(`Extracting from ${urls.length} URLs...`));
      
      const response = await this.client.post('/extract', {
        urls,
        schema: options.schema,
        prompt: options.prompt,
        systemPrompt: options.systemPrompt
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Crawl with pagination based on token limits
   */
  async crawlWithPagination(url: string, options: {
    maxTokensPerChunk?: number;
    maxDepth?: number;
    maxPages?: number;
    includes?: string[];
    excludes?: string[];
  } = {}): Promise<Array<{
    pages: any[];
    totalTokens: number;
    hasMore: boolean;
    nextCursor?: string;
  }>> {
    const maxTokens = options.maxTokensPerChunk || 100000;
    const chunks: any[] = [];
    
    // First, map the website to get all URLs
    const mapResult = await this.map(url, { limit: options.maxPages || 100 });
    if (!mapResult.success || !mapResult.data) {
      throw new Error(`Failed to map website: ${mapResult.error}`);
    }
    
    const urls = mapResult.data;
    console.log(chalk.dim(`Found ${urls.length} URLs to crawl`));
    
    // Process URLs in chunks based on token limits
    let currentChunk: any[] = [];
    let currentTokens = 0;
    
    for (let i = 0; i < urls.length; i++) {
      const scrapeResult = await this.scrape(urls[i], {
        formats: ['markdown'],
        onlyMainContent: true
      });
      
      if (scrapeResult.success && scrapeResult.data) {
        const content = scrapeResult.data.markdown || '';
        const tokens = this.tokenEstimator.estimate(content);
        
        // Check if adding this page would exceed token limit
        if (currentTokens + tokens > maxTokens && currentChunk.length > 0) {
          // Save current chunk
          chunks.push({
            pages: currentChunk,
            totalTokens: currentTokens,
            hasMore: true,
            nextCursor: urls[i]
          });
          
          // Start new chunk
          currentChunk = [];
          currentTokens = 0;
        }
        
        currentChunk.push({
          url: urls[i],
          content,
          tokens
        });
        currentTokens += tokens;
      }
      
      // Add delay to respect rate limits
      await this.delay(500);
    }
    
    // Add final chunk
    if (currentChunk.length > 0) {
      chunks.push({
        pages: currentChunk,
        totalTokens: currentTokens,
        hasMore: false
      });
    }
    
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Token estimator for content
 */
class TokenEstimator {
  estimate(text: string): number {
    if (!text) return 0;
    
    const words = text.split(/\s+/).length;
    const specialChars = (text.match(/[^\w\s]/g) || []).length;
    
    const tokenEstimate = Math.ceil(words * 1.3 + specialChars * 0.3);
    const charEstimate = Math.ceil(text.length / 4);
    
    return Math.max(tokenEstimate, charEstimate);
  }
}

// Export singleton instance with API key
export const firecrawlAPI = new FirecrawlAPIClient();