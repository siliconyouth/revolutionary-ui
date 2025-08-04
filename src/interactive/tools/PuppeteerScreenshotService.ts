import puppeteer, { Browser, Page, LaunchOptions, ScreenshotOptions } from 'puppeteer';
import chalk from 'chalk';
import ora from 'ora';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ScreenshotConfig {
  outputDir?: string;
  quality?: number;
  fullPage?: boolean;
  viewport?: {
    width: number;
    height: number;
  };
  waitFor?: number;
  scrollDelay?: number;
  maxHeight?: number;
  format?: 'png' | 'jpeg' | 'webp';
  omitBackground?: boolean;
  captureBeyondViewport?: boolean;
}

export interface ScreenshotResult {
  success: boolean;
  path?: string;
  buffer?: Buffer;
  error?: string;
  metadata?: {
    url: string;
    timestamp: number;
    dimensions?: {
      width: number;
      height: number;
    };
    fileSize?: number;
  };
}

export interface MultiScreenshotResult {
  desktop?: ScreenshotResult;
  mobile?: ScreenshotResult;
  tablet?: ScreenshotResult;
  fullPage?: ScreenshotResult;
  components?: Array<{
    name: string;
    selector: string;
    result: ScreenshotResult;
  }>;
}

export class PuppeteerScreenshotService {
  private browser: Browser | null = null;
  private config: ScreenshotConfig;
  private defaultViewports = {
    desktop: { width: 1920, height: 1080 },
    laptop: { width: 1366, height: 768 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 812 }
  };

  constructor(config?: ScreenshotConfig) {
    this.config = {
      outputDir: join(process.cwd(), 'screenshots'),
      quality: 90,
      fullPage: false,
      viewport: this.defaultViewports.desktop,
      waitFor: 2000,
      scrollDelay: 500,
      maxHeight: 30000, // Maximum height for full-page screenshots
      format: 'png',
      omitBackground: false,
      captureBeyondViewport: true,
      ...config
    };

    // Ensure output directory exists
    if (!existsSync(this.config.outputDir!)) {
      mkdirSync(this.config.outputDir!, { recursive: true });
    }
  }

  /**
   * Launch Puppeteer browser
   */
  private async launchBrowser(): Promise<Browser> {
    if (this.browser) {
      return this.browser;
    }

    const spinner = ora('Launching browser...').start();
    
    try {
      const options: LaunchOptions = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      };

      this.browser = await puppeteer.launch(options);
      spinner.succeed('Browser launched');
      return this.browser;
    } catch (error) {
      spinner.fail('Failed to launch browser');
      throw error;
    }
  }

  /**
   * Take a screenshot of a URL
   */
  async screenshot(url: string, options?: Partial<ScreenshotConfig>): Promise<ScreenshotResult> {
    const config = { ...this.config, ...options };
    const spinner = ora(`Taking screenshot of ${url}...`).start();

    try {
      const browser = await this.launchBrowser();
      const page = await browser.newPage();

      // Set viewport
      await page.setViewport({
        width: config.viewport!.width,
        height: config.viewport!.height,
        deviceScaleFactor: 1
      });

      // Navigate to URL
      await page.goto(url, {
        waitUntil: ['networkidle2', 'domcontentloaded'],
        timeout: 30000
      });

      // Wait for content to load
      if (config.waitFor) {
        await page.waitForFunction(() => true, { timeout: config.waitFor });
      }

      // Handle full-page screenshots with scrolling
      let screenshotOptions: ScreenshotOptions = {
        type: config.format,
        quality: config.format === 'jpeg' ? config.quality : undefined,
        omitBackground: config.omitBackground,
        captureBeyondViewport: config.captureBeyondViewport
      };

      if (config.fullPage) {
        // Scroll to load lazy-loaded content
        await this.autoScroll(page, config.scrollDelay!);
        screenshotOptions.fullPage = true;
      }

      // Generate filename
      const filename = `${uuidv4()}.${config.format}`;
      const filepath = join(config.outputDir!, filename);
      screenshotOptions.path = filepath;

      // Take screenshot
      const buffer = await page.screenshot(screenshotOptions) as Buffer;

      // Get page dimensions
      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight
      }));

      await page.close();
      spinner.succeed('Screenshot captured');

      return {
        success: true,
        path: filepath,
        buffer,
        metadata: {
          url,
          timestamp: Date.now(),
          dimensions,
          fileSize: buffer.length
        }
      };
    } catch (error: any) {
      spinner.fail('Screenshot failed');
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Take multiple screenshots with different viewports
   */
  async multiScreenshot(url: string, options?: {
    viewports?: string[];
    selectors?: Array<{ name: string; selector: string }>;
  }): Promise<MultiScreenshotResult> {
    console.log(chalk.cyan(`Taking multiple screenshots of ${url}...`));
    
    const results: MultiScreenshotResult = {};
    const viewports = options?.viewports || ['desktop', 'mobile'];

    // Take viewport-based screenshots
    for (const viewport of viewports) {
      if (viewport in this.defaultViewports) {
        console.log(chalk.dim(`  ${viewport} screenshot...`));
        const viewportConfig = this.defaultViewports[viewport as keyof typeof this.defaultViewports];
        
        results[viewport as keyof MultiScreenshotResult] = await this.screenshot(url, {
          viewport: viewportConfig,
          fullPage: false
        });
      }
    }

    // Take full-page screenshot
    if (viewports.includes('fullPage')) {
      console.log(chalk.dim('  Full-page screenshot...'));
      results.fullPage = await this.screenshot(url, {
        fullPage: true
      });
    }

    // Take component screenshots
    if (options?.selectors && options.selectors.length > 0) {
      results.components = [];
      
      for (const { name, selector } of options.selectors) {
        console.log(chalk.dim(`  Component screenshot: ${name}...`));
        const componentResult = await this.screenshotElement(url, selector, { name });
        results.components.push({
          name,
          selector,
          result: componentResult
        });
      }
    }

    return results;
  }

  /**
   * Take a screenshot of a specific element
   */
  async screenshotElement(url: string, selector: string, options?: {
    name?: string;
    padding?: number;
  }): Promise<ScreenshotResult> {
    const spinner = ora(`Taking screenshot of element ${selector}...`).start();

    try {
      const browser = await this.launchBrowser();
      const page = await browser.newPage();

      // Set viewport
      await page.setViewport(this.config.viewport!);

      // Navigate to URL
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait for element
      await page.waitForSelector(selector, {
        visible: true,
        timeout: 10000
      });

      // Get element
      const element = await page.$(selector);
      if (!element) {
        throw new Error(`Element not found: ${selector}`);
      }

      // Take screenshot of element
      const filename = `${options?.name || 'element'}-${uuidv4()}.${this.config.format}`;
      const filepath = join(this.config.outputDir!, filename);
      
      const buffer = await element.screenshot({
        path: filepath,
        type: this.config.format as any,
        quality: this.config.format === 'jpeg' ? this.config.quality : undefined
      });

      // Get element dimensions
      const box = await element.boundingBox();

      await page.close();
      spinner.succeed('Element screenshot captured');

      return {
        success: true,
        path: filepath,
        buffer,
        metadata: {
          url,
          timestamp: Date.now(),
          dimensions: box ? {
            width: Math.round(box.width),
            height: Math.round(box.height)
          } : undefined
        }
      };
    } catch (error: any) {
      spinner.fail('Element screenshot failed');
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Auto-scroll page to trigger lazy loading
   */
  private async autoScroll(page: Page, delay: number = 500): Promise<void> {
    await page.evaluate(async (scrollDelay) => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const maxHeight = document.body.scrollHeight;
        
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight || totalHeight >= 30000) {
            clearInterval(timer);
            // Scroll back to top
            window.scrollTo(0, 0);
            setTimeout(() => resolve(), 1000);
          }
        }, scrollDelay);
      });
    }, delay);
  }

  /**
   * Capture screenshots with different themes (light/dark)
   */
  async screenshotWithThemes(url: string, options?: {
    lightThemeSelector?: string;
    darkThemeSelector?: string;
    themeToggleSelector?: string;
  }): Promise<{
    light: ScreenshotResult;
    dark: ScreenshotResult;
  }> {
    console.log(chalk.cyan('Taking themed screenshots...'));
    
    const results = {
      light: {} as ScreenshotResult,
      dark: {} as ScreenshotResult
    };

    try {
      const browser = await this.launchBrowser();
      const page = await browser.newPage();
      await page.setViewport(this.config.viewport!);
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Light theme screenshot
      console.log(chalk.dim('  Light theme...'));
      results.light = await this.screenshot(url, {
        fullPage: this.config.fullPage
      });

      // Try to switch to dark theme
      if (options?.themeToggleSelector) {
        try {
          await page.click(options.themeToggleSelector);
          await page.waitForFunction(() => true, { timeout: 1000 });
        } catch {}
      } else {
        // Try common dark mode methods
        await page.emulateMediaFeatures([
          { name: 'prefers-color-scheme', value: 'dark' }
        ]);
      }

      // Dark theme screenshot
      console.log(chalk.dim('  Dark theme...'));
      const darkFilename = `dark-${uuidv4()}.${this.config.format}`;
      const darkPath = join(this.config.outputDir!, darkFilename);
      
      const darkBuffer = await page.screenshot({
        path: darkPath,
        fullPage: this.config.fullPage,
        type: this.config.format as any
      });

      results.dark = {
        success: true,
        path: darkPath,
        buffer: darkBuffer,
        metadata: {
          url,
          timestamp: Date.now()
        }
      };

      await page.close();
    } catch (error: any) {
      console.error(chalk.red('Theme screenshot error:'), error);
    }

    return results;
  }

  /**
   * Batch screenshot multiple URLs
   */
  async batchScreenshot(urls: string[], options?: Partial<ScreenshotConfig>): Promise<ScreenshotResult[]> {
    console.log(chalk.cyan(`Taking screenshots of ${urls.length} URLs...`));
    
    const results: ScreenshotResult[] = [];
    
    for (let i = 0; i < urls.length; i++) {
      console.log(chalk.dim(`  [${i + 1}/${urls.length}] ${urls[i]}`));
      const result = await this.screenshot(urls[i], options);
      results.push(result);
      
      // Small delay between screenshots
      if (i < urls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Compare screenshots (before/after)
   */
  async compareScreenshots(url1: string, url2: string, options?: {
    label1?: string;
    label2?: string;
  }): Promise<{
    before: ScreenshotResult;
    after: ScreenshotResult;
    comparison?: string;
  }> {
    console.log(chalk.cyan('Taking comparison screenshots...'));
    
    const before = await this.screenshot(url1, {
      ...this.config,
      outputDir: join(this.config.outputDir!, 'comparisons')
    });
    
    const after = await this.screenshot(url2, {
      ...this.config,
      outputDir: join(this.config.outputDir!, 'comparisons')
    });

    return {
      before,
      after,
      comparison: 'Use image diff tools to compare'
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ScreenshotConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Ensure output directory exists
    if (config.outputDir && !existsSync(config.outputDir)) {
      mkdirSync(config.outputDir, { recursive: true });
    }
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log(chalk.dim('Browser closed'));
    }
  }

  /**
   * Get screenshot metadata
   */
  getMetadata(result: ScreenshotResult): string {
    if (!result.metadata) return 'No metadata';
    
    const meta = result.metadata;
    return `
URL: ${meta.url}
Time: ${new Date(meta.timestamp).toLocaleString()}
Dimensions: ${meta.dimensions?.width}x${meta.dimensions?.height}
Size: ${meta.fileSize ? (meta.fileSize / 1024).toFixed(2) + ' KB' : 'Unknown'}
    `.trim();
  }
}

// Export singleton instance
export const screenshotService = new PuppeteerScreenshotService();