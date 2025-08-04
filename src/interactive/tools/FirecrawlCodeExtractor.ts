import chalk from 'chalk';
import ora from 'ora';
import { DirectWebTools } from './DirectWebTools';

export interface FirecrawlExtractedData {
  markdown: string;
  html: string;
  links: string[];
  metadata: {
    title: string;
    description: string;
    language: string;
    sourceURL: string;
    statusCode: number;
  };
  schema?: any;
  styles?: {
    inline: string[];
    external: string[];
    cssVariables: Record<string, string>;
    mediaQueries: string[];
  };
  scripts?: {
    inline: string[];
    external: string[];
    frameworks: string[];
  };
  assets?: {
    images: string[];
    fonts: string[];
    icons: string[];
  };
}

export interface DesignSystemData {
  colors: {
    primary: string[];
    secondary: string[];
    neutral: string[];
    semantic: Record<string, string>; // success, error, warning, info
    gradients: string[];
  };
  typography: {
    fontFamilies: string[];
    fontSizes: Record<string, string>;
    fontWeights: Record<string, string>;
    lineHeights: Record<string, string>;
    letterSpacing: Record<string, string>;
  };
  spacing: {
    base: string;
    scale: string[];
  };
  breakpoints: Record<string, string>;
  shadows: string[];
  animations: {
    durations: string[];
    easings: string[];
    keyframes: Record<string, string>;
  };
  components: {
    borderRadius: string[];
    borderWidths: string[];
    zIndex: Record<string, number>;
  };
}

export class FirecrawlCodeExtractor {
  private webTools: DirectWebTools;
  private apiKey: string;
  
  constructor() {
    this.webTools = new DirectWebTools();
    this.apiKey = process.env.FIRECRAWL_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn(chalk.yellow('⚠️ FIRECRAWL_API_KEY not set. Some features may be limited.'));
    }
  }
  
  async extractWithFirecrawl(url: string): Promise<FirecrawlExtractedData> {
    const spinner = ora(`Extracting with Firecrawl: ${url}`).start();
    
    try {
      // Use Firecrawl to scrape the page
      const scrapedData = await this.firecrawlScrape(url);
      
      // Extract additional code and styles
      const styles = await this.extractStyles(scrapedData);
      const scripts = await this.extractScripts(scrapedData);
      const assets = await this.extractAssets(scrapedData);
      
      spinner.succeed('Firecrawl extraction complete');
      
      return {
        markdown: scrapedData.markdown || '',
        html: scrapedData.html || scrapedData.rawHtml || '',
        links: scrapedData.links || [],
        metadata: {
          title: scrapedData.metadata?.title || '',
          description: scrapedData.metadata?.description || '',
          language: scrapedData.metadata?.language || 'en',
          sourceURL: url,
          statusCode: scrapedData.metadata?.statusCode || 200
        },
        schema: scrapedData.extract,
        styles,
        scripts,
        assets
      };
    } catch (error: any) {
      spinner.fail(`Firecrawl extraction failed: ${error.message}`);
      throw error;
    }
  }
  
  private async firecrawlScrape(url: string): Promise<any> {
    try {
      // Try using the MCP Firecrawl tool if available
      const result = await (global as any).mcp__firecrawl__firecrawl_scrape?.({
        url,
        formats: ['markdown', 'html', 'rawHtml', 'links', 'extract'],
        onlyMainContent: false,
        includeTags: ['style', 'script', 'link'],
        waitFor: 3000,
        extract: {
          schema: {
            type: 'object',
            properties: {
              designTokens: {
                type: 'object',
                properties: {
                  colors: { type: 'array', items: { type: 'string' } },
                  fonts: { type: 'array', items: { type: 'string' } },
                  spacing: { type: 'array', items: { type: 'string' } }
                }
              },
              componentPatterns: { type: 'array', items: { type: 'string' } },
              frameworks: { type: 'array', items: { type: 'string' } }
            }
          },
          systemPrompt: 'Extract design tokens, component patterns, and framework information from the webpage.'
        }
      });
      
      return result?.data || {};
    } catch (error) {
      // Fallback to API if MCP tool not available
      return this.firecrawlAPI(url);
    }
  }
  
  private async firecrawlAPI(url: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('FIRECRAWL_API_KEY is required for API access');
    }
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'html', 'rawHtml', 'links'],
        onlyMainContent: false,
        waitFor: 3000
      })
    });
    
    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  }
  
  private async extractStyles(data: any): Promise<FirecrawlExtractedData['styles']> {
    const styles: FirecrawlExtractedData['styles'] = {
      inline: [],
      external: [],
      cssVariables: {},
      mediaQueries: []
    };
    
    // Extract from raw HTML if available
    const html = data.rawHtml || data.html || '';
    
    // Extract inline styles
    const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let match;
    while ((match = styleTagRegex.exec(html)) !== null) {
      styles.inline.push(match[1]);
    }
    
    // Extract external stylesheets
    const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
    while ((match = linkRegex.exec(html)) !== null) {
      styles.external.push(match[1]);
    }
    
    // Extract CSS variables from all styles
    const allStyles = styles.inline.join('\n');
    const cssVarRegex = /--([\w-]+):\s*([^;]+);/g;
    while ((match = cssVarRegex.exec(allStyles)) !== null) {
      styles.cssVariables[`--${match[1]}`] = match[2].trim();
    }
    
    // Extract media queries
    const mediaQueryRegex = /@media[^{]+{[^}]*}/g;
    const mediaQueries = allStyles.match(mediaQueryRegex) || [];
    styles.mediaQueries = [...new Set(mediaQueries)];
    
    return styles;
  }
  
  private async extractScripts(data: any): Promise<FirecrawlExtractedData['scripts']> {
    const scripts: FirecrawlExtractedData['scripts'] = {
      inline: [],
      external: [],
      frameworks: []
    };
    
    const html = data.rawHtml || data.html || '';
    
    // Extract inline scripts
    const scriptTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = scriptTagRegex.exec(html)) !== null) {
      if (match[1].trim()) {
        scripts.inline.push(match[1]);
      }
    }
    
    // Extract external scripts
    const scriptSrcRegex = /<script[^>]+src=["']([^"']+)["']/gi;
    while ((match = scriptSrcRegex.exec(html)) !== null) {
      scripts.external.push(match[1]);
    }
    
    // Detect frameworks
    const frameworkPatterns = {
      'React': /react|ReactDOM/i,
      'Vue': /Vue|createApp/i,
      'Angular': /angular|ng-version/i,
      'Next.js': /_next|next\.js/i,
      'Nuxt': /_nuxt|nuxt/i,
      'Svelte': /svelte/i,
      'jQuery': /jquery/i,
      'Bootstrap': /bootstrap/i,
      'Tailwind': /tailwind/i
    };
    
    const allScripts = [...scripts.inline, ...scripts.external].join(' ');
    
    for (const [framework, pattern] of Object.entries(frameworkPatterns)) {
      if (pattern.test(allScripts) || pattern.test(html)) {
        scripts.frameworks.push(framework);
      }
    }
    
    return scripts;
  }
  
  private async extractAssets(data: any): Promise<FirecrawlExtractedData['assets']> {
    const assets: FirecrawlExtractedData['assets'] = {
      images: [],
      fonts: [],
      icons: []
    };
    
    const html = data.rawHtml || data.html || '';
    
    // Extract images
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      assets.images.push(match[1]);
    }
    
    // Extract background images from styles
    const bgImageRegex = /url\(['"]?([^'")]+)['"]?\)/gi;
    const allStyles = data.styles?.inline.join('\n') || '';
    while ((match = bgImageRegex.exec(allStyles)) !== null) {
      if (!match[1].startsWith('data:')) {
        assets.images.push(match[1]);
      }
    }
    
    // Extract fonts
    const fontFaceRegex = /@font-face[^{]*{[^}]*src:[^}]*url\(['"]?([^'")]+)['"]?\)[^}]*}/gi;
    while ((match = fontFaceRegex.exec(allStyles)) !== null) {
      assets.fonts.push(match[1]);
    }
    
    // Extract icons (favicon, etc.)
    const iconRegex = /<link[^>]+rel=["'](?:icon|apple-touch-icon|shortcut icon)["'][^>]+href=["']([^"']+)["']/gi;
    while ((match = iconRegex.exec(html)) !== null) {
      assets.icons.push(match[1]);
    }
    
    // Remove duplicates
    assets.images = [...new Set(assets.images)];
    assets.fonts = [...new Set(assets.fonts)];
    assets.icons = [...new Set(assets.icons)];
    
    return assets;
  }
  
  async extractDesignSystem(url: string, firecrawlData?: FirecrawlExtractedData): Promise<DesignSystemData> {
    console.log(chalk.cyan('🎨 Extracting design system...'));
    
    const data = firecrawlData || await this.extractWithFirecrawl(url);
    
    const designSystem: DesignSystemData = {
      colors: {
        primary: [],
        secondary: [],
        neutral: [],
        semantic: {},
        gradients: []
      },
      typography: {
        fontFamilies: [],
        fontSizes: {},
        fontWeights: {},
        lineHeights: {},
        letterSpacing: {}
      },
      spacing: {
        base: '8px',
        scale: []
      },
      breakpoints: {},
      shadows: [],
      animations: {
        durations: [],
        easings: [],
        keyframes: {}
      },
      components: {
        borderRadius: [],
        borderWidths: [],
        zIndex: {}
      }
    };
    
    // Extract from CSS variables
    if (data.styles?.cssVariables) {
      this.extractFromCSSVariables(data.styles.cssVariables, designSystem);
    }
    
    // Extract from inline styles
    if (data.styles?.inline) {
      this.extractFromInlineStyles(data.styles.inline.join('\n'), designSystem);
    }
    
    // Extract from Firecrawl schema if available
    if (data.schema?.designTokens) {
      this.mergeDesignTokens(data.schema.designTokens, designSystem);
    }
    
    return designSystem;
  }
  
  private extractFromCSSVariables(cssVars: Record<string, string>, designSystem: DesignSystemData): void {
    for (const [varName, value] of Object.entries(cssVars)) {
      const lowerVar = varName.toLowerCase();
      
      // Colors
      if (lowerVar.includes('color') || lowerVar.includes('clr')) {
        if (lowerVar.includes('primary')) {
          designSystem.colors.primary.push(value);
        } else if (lowerVar.includes('secondary')) {
          designSystem.colors.secondary.push(value);
        } else if (lowerVar.includes('neutral') || lowerVar.includes('gray')) {
          designSystem.colors.neutral.push(value);
        } else if (lowerVar.includes('success')) {
          designSystem.colors.semantic.success = value;
        } else if (lowerVar.includes('error') || lowerVar.includes('danger')) {
          designSystem.colors.semantic.error = value;
        } else if (lowerVar.includes('warning')) {
          designSystem.colors.semantic.warning = value;
        } else if (lowerVar.includes('info')) {
          designSystem.colors.semantic.info = value;
        }
      }
      
      // Typography
      if (lowerVar.includes('font')) {
        if (lowerVar.includes('family')) {
          designSystem.typography.fontFamilies.push(value);
        } else if (lowerVar.includes('size')) {
          const key = varName.replace('--', '');
          designSystem.typography.fontSizes[key] = value;
        } else if (lowerVar.includes('weight')) {
          const key = varName.replace('--', '');
          designSystem.typography.fontWeights[key] = value;
        }
      }
      
      // Spacing
      if (lowerVar.includes('space') || lowerVar.includes('spacing')) {
        designSystem.spacing.scale.push(value);
      }
      
      // Shadows
      if (lowerVar.includes('shadow')) {
        designSystem.shadows.push(value);
      }
      
      // Border radius
      if (lowerVar.includes('radius')) {
        designSystem.components.borderRadius.push(value);
      }
      
      // Breakpoints
      if (lowerVar.includes('breakpoint') || lowerVar.includes('screen')) {
        const key = varName.replace('--', '');
        designSystem.breakpoints[key] = value;
      }
      
      // Animations
      if (lowerVar.includes('duration')) {
        designSystem.animations.durations.push(value);
      } else if (lowerVar.includes('easing') || lowerVar.includes('timing')) {
        designSystem.animations.easings.push(value);
      }
    }
  }
  
  private extractFromInlineStyles(styles: string, designSystem: DesignSystemData): void {
    // Extract colors
    const colorRegex = /#[0-9a-f]{3,8}|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)|hsla\([^)]+\)/gi;
    const colors = styles.match(colorRegex) || [];
    
    // Group colors by frequency and context
    const colorFrequency = new Map<string, number>();
    colors.forEach(color => {
      const normalized = color.toLowerCase();
      colorFrequency.set(normalized, (colorFrequency.get(normalized) || 0) + 1);
    });
    
    // Sort by frequency and assign to categories
    const sortedColors = Array.from(colorFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([color]) => color);
    
    if (sortedColors.length > 0) {
      designSystem.colors.primary.push(...sortedColors.slice(0, 3));
      designSystem.colors.secondary.push(...sortedColors.slice(3, 6));
      designSystem.colors.neutral.push(...sortedColors.slice(6, 10));
    }
    
    // Extract gradients
    const gradientRegex = /linear-gradient\([^)]+\)|radial-gradient\([^)]+\)/gi;
    const gradients = styles.match(gradientRegex) || [];
    designSystem.colors.gradients.push(...gradients);
    
    // Extract font families
    const fontFamilyRegex = /font-family:\s*([^;]+);/gi;
    let match;
    while ((match = fontFamilyRegex.exec(styles)) !== null) {
      const fonts = match[1].split(',').map(f => f.trim().replace(/["']/g, ''));
      designSystem.typography.fontFamilies.push(...fonts);
    }
    
    // Extract animations
    const keyframesRegex = /@keyframes\s+([\w-]+)\s*{([^}]+)}/gi;
    while ((match = keyframesRegex.exec(styles)) !== null) {
      designSystem.animations.keyframes[match[1]] = match[2];
    }
    
    // Remove duplicates
    designSystem.colors.primary = [...new Set(designSystem.colors.primary)];
    designSystem.colors.secondary = [...new Set(designSystem.colors.secondary)];
    designSystem.colors.neutral = [...new Set(designSystem.colors.neutral)];
    designSystem.colors.gradients = [...new Set(designSystem.colors.gradients)];
    designSystem.typography.fontFamilies = [...new Set(designSystem.typography.fontFamilies)];
  }
  
  private mergeDesignTokens(tokens: any, designSystem: DesignSystemData): void {
    if (tokens.colors) {
      designSystem.colors.primary.push(...tokens.colors);
    }
    
    if (tokens.fonts) {
      designSystem.typography.fontFamilies.push(...tokens.fonts);
    }
    
    if (tokens.spacing) {
      designSystem.spacing.scale.push(...tokens.spacing);
    }
    
    // Remove duplicates after merge
    designSystem.colors.primary = [...new Set(designSystem.colors.primary)];
    designSystem.typography.fontFamilies = [...new Set(designSystem.typography.fontFamilies)];
    designSystem.spacing.scale = [...new Set(designSystem.spacing.scale)];
  }
}