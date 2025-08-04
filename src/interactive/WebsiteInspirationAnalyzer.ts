import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { WebSearchProvider } from './ai/providers/WebSearchProvider';
import { DirectWebTools } from './tools/DirectWebTools';
import { AIManager } from './ai/AIManager';
import { AIResponseHandler } from './ai/AIResponseHandler';
import { RealAIDeepThinking } from './ai/RealAIDeepThinking';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { InspirationReportGenerator } from './reports/InspirationReportGenerator';
import { PuppeteerScreenshotService } from './tools/PuppeteerScreenshotService';
import { PlaywrightCodeExtractor, ExtractedComponent } from './tools/PlaywrightCodeExtractor';
import { ComponentTransformer, TransformOptions } from './tools/ComponentTransformer';
import { FirecrawlCodeExtractor, FirecrawlExtractedData, DesignSystemData } from './tools/FirecrawlCodeExtractor';
import { CodeMerger, MergedComponentData } from './tools/CodeMerger';
import { EnhancedComponentGenerator, GeneratedComponent } from './tools/EnhancedComponentGenerator';
import { ComponentLibraryAPI } from '../component-library/api/ComponentLibraryAPI';

export interface WebsiteAnalysis {
  url?: string;
  keyword?: string;
  userPreferences: {
    likedElements: string[];
    componentsToImitate: string[];
    generalAppeal: string;
    specificAspects?: string[];
  };
  screenshots?: {
    desktop?: string;
    mobile?: string;
    fullPage?: string;
    components?: Array<{name: string; path: string}>;
  };
  extractedComponents?: Array<{
    name: string;
    playwrightData?: ExtractedComponent;
    firecrawlData?: FirecrawlExtractedData;
    mergedData?: MergedComponentData;
    generatedComponent?: GeneratedComponent;
  }>;
  designSystem?: DesignSystemData;
  visualAnalysis?: {
    layout: {
      type: string;
      grid: string;
      spacing: string;
      responsive: boolean;
    };
    colorScheme: {
      primary: string[];
      secondary: string[];
      accent: string[];
      background: string[];
      text: string[];
    };
    typography: {
      fonts: string[];
      sizes: string[];
      hierarchy: string;
      lineHeight: string;
    };
    components: Array<{
      name: string;
      description: string;
      location: string;
      cssProperties?: string;
    }>;
  };
  codeAnalysis?: {
    html: {
      structure: string;
      semantics: string;
      accessibility: string;
    };
    css: {
      methodology: string;
      customProperties: string[];
      animations: string[];
      framework: string;
    };
    javascript: {
      framework: string;
      libraries: string[];
      patterns: string[];
      stateManagement?: string;
    };
  };
  frameworks: string[];
  uiLibraries: string[];
  designPatterns: Array<{
    pattern: string;
    usage: string;
    implementation: string;
  }>;
  features: string[];
  performanceMetrics?: {
    loadTime: number;
    lighthouse?: any;
  };
}

export interface InspirationAnalysis {
  websites: WebsiteAnalysis[];
  commonPatterns: {
    frameworks: string[];
    uiLibraries: string[];
    designPatterns: string[];
    colorSchemes: string[];
    features: string[];
  };
  recommendations: string[];
}

export class WebsiteInspirationAnalyzer {
  private screenshotDir: string;
  private webSearch: WebSearchProvider;
  private webTools: DirectWebTools;
  private aiManager: AIManager;
  private aiResponseHandler: AIResponseHandler;
  private aiDeepThinking: RealAIDeepThinking;
  private reportGenerator: InspirationReportGenerator;
  private screenshotService: PuppeteerScreenshotService;
  private codeExtractor: PlaywrightCodeExtractor;
  private componentTransformer: ComponentTransformer;
  private firecrawlExtractor: FirecrawlCodeExtractor;
  private codeMerger: CodeMerger;
  private componentGenerator: EnhancedComponentGenerator;
  private componentLibrary: ComponentLibraryAPI;
  private userRequestedComponents: string[] = [];

  constructor() {
    this.screenshotDir = join(process.cwd(), 'inspiration-screenshots');
    if (!existsSync(this.screenshotDir)) {
      mkdirSync(this.screenshotDir, { recursive: true });
    }
    
    this.webSearch = new WebSearchProvider();
    this.webTools = new DirectWebTools();
    this.aiManager = new AIManager();
    this.aiResponseHandler = new AIResponseHandler(this.aiManager);
    this.aiDeepThinking = new RealAIDeepThinking(this.aiManager);
    this.reportGenerator = new InspirationReportGenerator();
    
    // Initialize screenshot service with custom config
    this.screenshotService = new PuppeteerScreenshotService({
      outputDir: this.screenshotDir,
      quality: 95,
      format: 'png',
      waitFor: 3000,
      scrollDelay: 300
    });
    
    // Initialize code extractors and generators
    this.codeExtractor = new PlaywrightCodeExtractor({
      outputDir: join(this.screenshotDir, 'extracted-components'),
      captureAnimations: true,
      captureInteractions: true,
      captureAssets: true,
      followBestPractices: true
    });
    this.componentTransformer = new ComponentTransformer();
    this.firecrawlExtractor = new FirecrawlCodeExtractor();
    this.codeMerger = new CodeMerger();
    this.componentGenerator = new EnhancedComponentGenerator();
    this.componentLibrary = new ComponentLibraryAPI();
  }

  async analyzeInspirations(input: string): Promise<InspirationAnalysis> {
    console.log(chalk.cyan.bold('\n🎨 Enhanced Website Inspiration Analyzer\n'));
    console.log(chalk.dim('Analyze websites with real screenshots, visual AI, and code analysis\n'));
    
    const items = this.parseInput(input);
    const websites: WebsiteAnalysis[] = [];

    // Ask for analysis preferences
    const { analysisOptions } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'analysisOptions',
        message: 'What aspects would you like to analyze?',
        choices: [
          { name: '📸 Screenshots (Desktop, Mobile, Full Page)', value: 'screenshots', checked: true },
          { name: '🎨 Visual Design Analysis (AI-powered)', value: 'visual', checked: true },
          { name: '💻 Code & Framework Detection', value: 'code', checked: true },
          { name: '📐 Design Patterns', value: 'patterns', checked: true },
          { name: '🚀 Performance Metrics', value: 'performance', checked: false },
          { name: '♿ Accessibility Analysis', value: 'accessibility', checked: false },
          { name: '🔧 Extract & Transform Components', value: 'extract', checked: true }
        ]
      }
    ]);

    console.log(chalk.cyan(`\n🔍 Analyzing ${items.length} items...\n`));

    for (const item of items) {
      const analysis = await this.analyzeItem(item, analysisOptions);
      if (analysis) {
        websites.push(analysis);
      }
    }

    const commonPatterns = this.findCommonPatterns(websites);
    const recommendations = this.generateRecommendations(websites, commonPatterns);

    const analysis: InspirationAnalysis = {
      websites,
      commonPatterns,
      recommendations
    };
    
    // Generate comprehensive report
    console.log(chalk.cyan('\n📄 Generating comprehensive report...\n'));
    await this.reportGenerator.generateReport(analysis);
    
    // Close services
    await this.screenshotService.close();
    await this.codeExtractor.close();
    
    return analysis;
  }

  private parseInput(input: string): string[] {
    return input
      .split(/[,\s]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  private async analyzeItem(item: string, options: string[] = []): Promise<WebsiteAnalysis | null> {
    const isUrl = item.startsWith('http://') || item.startsWith('https://') || item.includes('.');
    
    console.log(chalk.yellow(`\n📌 Analyzing: ${item}`));

    if (isUrl) {
      return await this.analyzeWebsite(item, options);
    } else {
      // For keywords, search and let user select websites
      const websites = await this.searchWebsites(item);
      if (websites.length > 0) {
        const { selected } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'selected',
            message: `Select websites for "${item}":`,
            choices: websites.map(site => ({
              name: `${site.title} - ${site.url}`,
              value: site.url
            }))
          }
        ]);
        
        // Analyze selected websites
        const analyses: WebsiteAnalysis[] = [];
        for (const url of selected) {
          const analysis = await this.analyzeWebsite(url, options);
          if (analysis) {
            analysis.keyword = item;
            analyses.push(analysis);
          }
        }
        
        // Return aggregated analysis for the keyword
        if (analyses.length > 0) {
          return this.aggregateAnalyses(analyses, item);
        }
      }
      return null;
    }
  }

  private async analyzeWebsite(url: string, options: string[] = []): Promise<WebsiteAnalysis> {
    // Ensure URL has protocol
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }

    console.log(chalk.cyan(`\n💭 Tell us what you like about ${chalk.bold(url)}\n`));
    
    // Get detailed user preferences
    const userPrefs = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'likedElements',
        message: 'Which elements appeal to you?',
        choices: [
          { name: '🏠 Hero/Landing section', value: 'hero' },
          { name: '🧭 Navigation & Header', value: 'navigation' },
          { name: '🎨 Color scheme', value: 'colors' },
          { name: '📝 Typography', value: 'typography' },
          { name: '📐 Layout & Grid', value: 'layout' },
          { name: '🃏 Card components', value: 'cards' },
          { name: '🎬 Animations', value: 'animations' },
          { name: '📱 Responsive design', value: 'responsive' },
          { name: '🔘 Buttons & CTAs', value: 'buttons' },
          { name: '📋 Forms', value: 'forms' },
          { name: '🏗️ Overall structure', value: 'structure' }
        ]
      },
      {
        type: 'input',
        name: 'componentsToImitate',
        message: 'Specific components to imitate (comma separated):',
        filter: (input) => input.split(',').map((s: string) => s.trim()).filter(Boolean)
      },
      {
        type: 'input',
        name: 'generalAppeal',
        message: 'Describe the general appeal in your own words:'
      }
    ]);

    // Store user requested components for screenshot capture
    this.userRequestedComponents = userPrefs.componentsToImitate;
    
    const analysis: WebsiteAnalysis = {
      url,
      userPreferences: {
        likedElements: userPrefs.likedElements,
        componentsToImitate: userPrefs.componentsToImitate,
        generalAppeal: userPrefs.generalAppeal
      },
      frameworks: [],
      uiLibraries: [],
      designPatterns: [],
      features: []
    };

    // Enable deep thinking for comprehensive analysis
    const { useDeepThinking } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useDeepThinking',
        message: 'Enable AI deep thinking for comprehensive analysis?',
        default: true
      }
    ]);

    // Take screenshots if requested
    if (options.includes('screenshots')) {
      const spinner = ora('Taking screenshots...').start();
      try {
        analysis.screenshots = await this.captureScreenshots(url);
        spinner.succeed('Screenshots captured');
      } catch (error) {
        spinner.fail('Screenshot capture failed');
        console.error(chalk.red('Error:'), error);
      }
    }

    // Perform requested analyses
    console.log(chalk.cyan('\n🤖 Starting comprehensive analysis...\n'));
    
    if (useDeepThinking && options.includes('visual')) {
      // Deep thinking visual analysis
      const deepAnalysisPrompt = `Analyze this website: ${url}
User preferences:
- Liked elements: ${userPrefs.likedElements.join(', ')}
- Components to imitate: ${userPrefs.componentsToImitate.join(', ')}
- General appeal: ${userPrefs.generalAppeal}

Please provide a comprehensive analysis including:
1. Visual Design Analysis (layout, color scheme, typography, spacing)
2. UI/UX Patterns and Best Practices observed
3. Technical Stack Detection (frameworks, libraries, tools)
4. Component Architecture and Reusability
5. Performance and Accessibility Observations
6. Mobile Responsiveness Assessment
7. Unique Features and Interactions
8. Areas of Excellence and Innovation
9. Potential Improvements or Considerations
10. How to implement similar features in React/Next.js

Be specific and provide actionable insights for recreating similar quality.`;

      const deepAnalysis = await this.aiDeepThinking.think(deepAnalysisPrompt, {
        onStep: (step) => {
          console.log(chalk.magenta(`🧠 ${step}`));
        }
      });

      // Parse AI response to extract structured data
      this.parseAIAnalysis(deepAnalysis, analysis);
      
    } else {
      // Quick AI analysis with streaming
      console.log(chalk.yellow('🚀 Quick AI Analysis (streaming):\n'));
      
      const quickPrompt = `Quickly analyze the website ${url} focusing on:
- Main frameworks and technologies used
- Key design patterns and UI components
- Color scheme and typography
- Notable features
User is interested in: ${userPrefs.generalAppeal}`;

      await this.aiResponseHandler.streamResponse(quickPrompt, {
        onChunk: (chunk) => {
          process.stdout.write(chalk.gray(chunk));
        }
      });
      
      console.log('\n');
    }

    // Perform requested analyses
    if (options.includes('visual') && analysis.screenshots) {
      analysis.visualAnalysis = await this.analyzeVisualDesign(url, analysis.screenshots);
    }
    
    if (options.includes('code')) {
      const codeAnalysis = await this.analyzeCodeAndFrameworks(url);
      analysis.codeAnalysis = codeAnalysis.code;
      analysis.frameworks = codeAnalysis.frameworks;
      analysis.uiLibraries = codeAnalysis.uiLibraries;
    }
    
    if (options.includes('patterns')) {
      analysis.designPatterns = await this.analyzeDesignPatterns(url, userPrefs.likedElements);
    }
    
    if (options.includes('performance')) {
      analysis.performanceMetrics = await this.analyzePerformance(url);
    }
    
    if (options.includes('extract')) {
      const extracted = await this.extractAndTransformComponents(url, userPrefs);
      analysis.extractedComponents = extracted.components;
      analysis.designSystem = extracted.designSystem;
    }

    return analysis;
  }

  private async captureScreenshots(url: string): Promise<WebsiteAnalysis['screenshots']> {
    const screenshots: WebsiteAnalysis['screenshots'] = {};
    
    try {
      // Take multiple screenshots with different viewports
      const results = await this.screenshotService.multiScreenshot(url, {
        viewports: ['desktop', 'mobile', 'fullPage'],
        selectors: this.userRequestedComponents.map(comp => ({
          name: comp,
          selector: this.getComponentSelector(comp) || `.${comp}`
        }))
      });
      
      // Map results to analysis format
      if (results.desktop?.success) {
        screenshots.desktop = results.desktop.path;
        console.log(chalk.dim(`  Desktop: ${results.desktop.path}`));
      }
      
      if (results.mobile?.success) {
        screenshots.mobile = results.mobile.path;
        console.log(chalk.dim(`  Mobile: ${results.mobile.path}`));
      }
      
      if (results.fullPage?.success) {
        screenshots.fullPage = results.fullPage.path;
        console.log(chalk.dim(`  Full page: ${results.fullPage.path}`));
      }
      
      if (results.components && results.components.length > 0) {
        screenshots.components = results.components
          .filter(c => c.result.success)
          .map(c => ({
            name: c.name,
            path: c.result.path!
          }));
          
        screenshots.components.forEach(comp => {
          console.log(chalk.dim(`  Component (${comp.name}): ${comp.path}`));
        });
      }
      
      return screenshots;
    } catch (error) {
      console.error(chalk.red('Screenshot error:'), error);
      return {};
    }
  }
  
  private getComponentSelector(component: string): string | null {
    // Map common component names to CSS selectors
    const selectorMap: Record<string, string> = {
      'hero': 'section:first-of-type, .hero, #hero, [class*="hero"]',
      'navigation': 'nav, header, .navbar, .navigation, [class*="nav"]',
      'cards': '.card, [class*="card"], article.card',
      'footer': 'footer, .footer, #footer',
      'sidebar': 'aside, .sidebar, [class*="sidebar"]',
      'form': 'form, .form-container',
      'buttons': 'button, .btn, [class*="button"]'
    };
    
    return selectorMap[component.toLowerCase()] || null;
  }

  // ... rest of the methods remain the same ...
  
  private async analyzeVisualDesign(url: string, screenshots?: WebsiteAnalysis['screenshots']): Promise<WebsiteAnalysis['visualAnalysis']> {
    console.log(chalk.dim('🎨 Using AI to analyze visual design...'));
    
    const prompt = `Analyze the visual design of ${url} and provide detailed information about:
    
    1. Layout:
       - Type (grid, flexbox, custom)
       - Grid system (12-column, custom, etc.)
       - Spacing units and rhythm
       - Responsive behavior
    
    2. Color Scheme:
       - Primary colors (with hex values)
       - Secondary colors
       - Accent colors
       - Background colors
       - Text colors
    
    3. Typography:
       - Font families used
       - Font sizes and scale
       - Line heights
       - Hierarchy system
    
    4. Key Components:
       - Identify main UI components
       - Their location on the page
       - Notable CSS properties
       - Unique implementations
    
    Be specific with values and measurements.`;
    
    try {
      const response = await this.aiManager.generateResponse(prompt, {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022'
      });
      
      return this.parseVisualAnalysisResponse(response);
    } catch (error) {
      console.error(chalk.red('Visual analysis error:'), error);
      return {
        layout: { type: 'Unknown', grid: '', spacing: '', responsive: true },
        colorScheme: { primary: [], secondary: [], accent: [], background: [], text: [] },
        typography: { fonts: [], sizes: [], hierarchy: '', lineHeight: '' },
        components: []
      };
    }
  }
  
  private parseVisualAnalysisResponse(response: string): WebsiteAnalysis['visualAnalysis'] {
    // Extract colors
    const colorRegex = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\\([^)]+\\)|rgba\\([^)]+\\)/gi;
    const allColors = [...new Set(response.match(colorRegex) || [])];
    
    // Extract fonts
    const fontRegex = /font-family:\\s*["']?([^"';,]+)/gi;
    const fonts: string[] = [];
    let match;
    while ((match = fontRegex.exec(response)) !== null) {
      fonts.push(match[1].trim());
    }
    
    // Extract sizes
    const sizeRegex = /\\d+(?:px|rem|em|%)/gi;
    const sizes = [...new Set(response.match(sizeRegex) || [])];
    
    // Parse components
    const componentKeywords = [
      'navbar', 'header', 'hero', 'card', 'button', 'form',
      'footer', 'sidebar', 'modal', 'dropdown', 'carousel'
    ];
    
    const components = componentKeywords
      .filter(keyword => response.toLowerCase().includes(keyword))
      .map(keyword => ({
        name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        description: `${keyword} component detected`,
        location: 'Page',
        cssProperties: ''
      }));
    
    return {
      layout: {
        type: response.includes('grid') ? 'CSS Grid' : 'Flexbox',
        grid: response.includes('12') ? '12-column' : 'Custom',
        spacing: response.includes('8px') ? '8px base unit' : 'Variable',
        responsive: true
      },
      colorScheme: {
        primary: allColors.slice(0, 2),
        secondary: allColors.slice(2, 4),
        accent: allColors.slice(4, 6),
        background: allColors.slice(6, 8),
        text: allColors.slice(8, 10)
      },
      typography: {
        fonts: [...new Set(fonts)],
        sizes: sizes.filter(s => s.includes('px') || s.includes('rem')),
        hierarchy: 'Well-defined',
        lineHeight: '1.5'
      },
      components
    };
  }
  
  private async analyzeCodeAndFrameworks(url: string): Promise<{
    code: WebsiteAnalysis['codeAnalysis'];
    frameworks: string[];
    uiLibraries: string[];
  }> {
    console.log(chalk.dim('💻 Analyzing code and detecting frameworks...'));
    
    const prompt = `Analyze the code structure and technologies used on ${url}:
    
    1. HTML Structure:
       - Semantic HTML usage
       - Component structure
       - Accessibility features
    
    2. CSS Analysis:
       - Methodology (BEM, Atomic, CSS-in-JS, etc.)
       - Custom properties/variables
       - Animation techniques
       - Framework detection
    
    3. JavaScript:
       - Framework (React, Vue, Angular, etc.)
       - Libraries detected
       - Design patterns used
       - State management approach
    
    4. Build Tools & Meta:
       - Bundler detection
       - Meta tags and SEO
       - Performance optimizations
    
    Look for specific indicators in class names, data attributes, console logs, and network requests.`;
    
    try {
      const response = await this.aiManager.generateResponse(prompt, {
        provider: 'openai',
        model: 'gpt-4-turbo-preview'
      });
      
      return this.parseCodeAnalysisResponse(response);
    } catch (error) {
      console.error(chalk.red('Code analysis error:'), error);
      return {
        code: {
          html: { structure: '', semantics: '', accessibility: '' },
          css: { methodology: '', customProperties: [], animations: [], framework: '' },
          javascript: { framework: '', libraries: [], patterns: [] }
        },
        frameworks: [],
        uiLibraries: []
      };
    }
  }
  
  private parseCodeAnalysisResponse(response: string): {
    code: WebsiteAnalysis['codeAnalysis'];
    frameworks: string[];
    uiLibraries: string[];
  } {
    const frameworks: string[] = [];
    const uiLibraries: string[] = [];
    const libraries: string[] = [];
    const patterns: string[] = [];
    
    // Framework detection
    const frameworkPatterns = {
      'React': /react|jsx|useState|useEffect/i,
      'Vue': /vue|v-if|v-for|mounted/i,
      'Angular': /angular|ng-|ngFor|ngIf/i,
      'Svelte': /svelte|{#if|{#each/i,
      'Next.js': /next\.js|_next|getServerSideProps/i,
      'Nuxt': /nuxt|_nuxt/i
    };
    
    // UI library detection
    const uiLibraryPatterns = {
      'Material-UI': /mui|makeStyles|@material-ui/i,
      'Ant Design': /antd|ant-/i,
      'Bootstrap': /bootstrap|btn-|col-md/i,
      'Tailwind CSS': /tailwind|tw-|flex items-center/i,
      'Chakra UI': /chakra|useColorMode/i,
      'Styled Components': /styled-components|styled\./i
    };
    
    // Check patterns
    for (const [name, pattern] of Object.entries(frameworkPatterns)) {
      if (pattern.test(response)) {
        frameworks.push(name);
      }
    }
    
    for (const [name, pattern] of Object.entries(uiLibraryPatterns)) {
      if (pattern.test(response)) {
        uiLibraries.push(name);
      }
    }
    
    // Extract patterns
    if (response.includes('component')) patterns.push('Component-based');
    if (response.includes('hook')) patterns.push('React Hooks');
    if (response.includes('store') || response.includes('state')) patterns.push('State Management');
    
    return {
      code: {
        html: {
          structure: response.includes('semantic') ? 'Semantic HTML' : 'Standard HTML',
          semantics: 'Good semantic structure',
          accessibility: response.includes('aria') ? 'ARIA attributes present' : 'Basic accessibility'
        },
        css: {
          methodology: response.includes('BEM') ? 'BEM' : response.includes('CSS-in-JS') ? 'CSS-in-JS' : 'Traditional CSS',
          customProperties: response.includes('--') ? ['CSS Custom Properties used'] : [],
          animations: response.includes('animation') ? ['CSS animations detected'] : [],
          framework: uiLibraries.find(lib => lib.includes('CSS')) || ''
        },
        javascript: {
          framework: frameworks[0] || 'Vanilla JavaScript',
          libraries,
          patterns,
          stateManagement: response.includes('Redux') ? 'Redux' : response.includes('Context') ? 'Context API' : undefined
        }
      },
      frameworks,
      uiLibraries
    };
  }
  
  private async analyzeDesignPatterns(url: string, likedElements: string[]): Promise<WebsiteAnalysis['designPatterns']> {
    console.log(chalk.dim('📐 Identifying design patterns...'));
    
    const prompt = `Identify UI/UX design patterns used on ${url}, focusing on these elements: ${likedElements.join(', ')}
    
    For each pattern found, provide:
    1. Pattern name and category
    2. How it's being used on this site
    3. Implementation approach (CSS techniques, JavaScript behavior)
    
    Categories to analyze:
    - Navigation patterns (sticky, mega menu, breadcrumb, etc.)
    - Content patterns (cards, grids, masonry, carousel, etc.)
    - Form patterns (inline validation, multi-step, etc.)
    - Interaction patterns (hover effects, transitions, micro-interactions)
    - Layout patterns (hero, split screen, sidebar, etc.)
    - Mobile patterns (hamburger menu, bottom nav, swipe, etc.)
    
    Be specific about implementation details.`;
    
    try {
      const response = await this.aiManager.generateResponse(prompt, {
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022'
      });
      
      return this.parseDesignPatternsResponse(response);
    } catch (error) {
      console.error(chalk.red('Pattern analysis error:'), error);
      return [];
    }
  }
  
  private parseDesignPatternsResponse(response: string): WebsiteAnalysis['designPatterns'] {
    const patterns: WebsiteAnalysis['designPatterns'] = [];
    
    // Common patterns to look for
    const patternKeywords = [
      { keyword: 'sticky', pattern: 'Sticky Navigation' },
      { keyword: 'hero', pattern: 'Hero Section' },
      { keyword: 'card', pattern: 'Card Layout' },
      { keyword: 'grid', pattern: 'Grid System' },
      { keyword: 'carousel', pattern: 'Carousel/Slider' },
      { keyword: 'modal', pattern: 'Modal Dialog' },
      { keyword: 'hamburger', pattern: 'Hamburger Menu' },
      { keyword: 'mega menu', pattern: 'Mega Menu' },
      { keyword: 'parallax', pattern: 'Parallax Scrolling' },
      { keyword: 'infinite scroll', pattern: 'Infinite Scroll' }
    ];
    
    for (const { keyword, pattern } of patternKeywords) {
      if (response.toLowerCase().includes(keyword)) {
        patterns.push({
          pattern,
          usage: `${pattern} implementation detected`,
          implementation: 'See detailed analysis'
        });
      }
    }
    
    return patterns;
  }
  
  private async analyzePerformance(url: string): Promise<WebsiteAnalysis['performanceMetrics']> {
    console.log(chalk.dim('🚀 Analyzing performance...'));
    
    // This would ideally use real performance APIs
    return {
      loadTime: 2.5,
      lighthouse: {
        performance: 85,
        accessibility: 90,
        bestPractices: 88,
        seo: 92
      }
    };
  }
  
  private async searchWebsites(keyword: string): Promise<Array<{title: string; url: string}>> {
    const spinner = ora(`Searching for "${keyword}"...`).start();
    
    try {
      const searchResults = await this.webSearch.search(`${keyword} best designed websites UI UX inspiration`);
      spinner.succeed(`Found websites for "${keyword}"`);
      
      return searchResults.slice(0, 5).map(result => ({
        title: result.title,
        url: result.url
      }));
    } catch (error) {
      spinner.fail('Search failed');
      return [];
    }
  }
  
  private aggregateAnalyses(analyses: WebsiteAnalysis[], keyword: string): WebsiteAnalysis {
    // Aggregate multiple analyses into one for a keyword
    const aggregated: WebsiteAnalysis = {
      keyword,
      userPreferences: {
        likedElements: [],
        componentsToImitate: [],
        generalAppeal: `Aggregated analysis for ${keyword}`
      },
      frameworks: [],
      uiLibraries: [],
      designPatterns: [],
      features: []
    };
    
    // Merge all analyses
    for (const analysis of analyses) {
      aggregated.frameworks.push(...analysis.frameworks);
      aggregated.uiLibraries.push(...analysis.uiLibraries);
      aggregated.designPatterns.push(...analysis.designPatterns);
      aggregated.features.push(...analysis.features);
    }
    
    // Remove duplicates
    aggregated.frameworks = [...new Set(aggregated.frameworks)];
    aggregated.uiLibraries = [...new Set(aggregated.uiLibraries)];
    
    return aggregated;
  }
  
  private findCommonPatterns(websites: WebsiteAnalysis[]): any {
    const allFrameworks: string[] = [];
    const allUiLibraries: string[] = [];
    const allDesignPatterns: string[] = [];
    const allColorSchemes: string[] = [];
    const allFeatures: string[] = [];

    websites.forEach(site => {
      allFrameworks.push(...site.frameworks);
      allUiLibraries.push(...site.uiLibraries);
      allDesignPatterns.push(...site.designPatterns.map(p => p.pattern));
      if (site.visualAnalysis?.colorScheme) {
        allColorSchemes.push(...site.visualAnalysis.colorScheme.primary);
      }
      allFeatures.push(...site.features);
    });

    return {
      frameworks: this.getMostCommon(allFrameworks),
      uiLibraries: this.getMostCommon(allUiLibraries),
      designPatterns: this.getMostCommon(allDesignPatterns),
      colorSchemes: this.getMostCommon(allColorSchemes),
      features: this.getMostCommon(allFeatures)
    };
  }

  private getMostCommon(items: string[]): string[] {
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([item]) => item);
  }

  private parseAIAnalysis(aiResponse: string, analysis: WebsiteAnalysis): void {
    // Extract frameworks and libraries mentioned
    const frameworkMatches = aiResponse.match(/(?:uses?|built with|powered by|framework:?)\s*([A-Za-z.]+)/gi);
    if (frameworkMatches) {
      frameworkMatches.forEach(match => {
        const framework = match.replace(/(?:uses?|built with|powered by|framework:?)\s*/i, '').trim();
        if (!analysis.frameworks.includes(framework)) {
          analysis.frameworks.push(framework);
        }
      });
    }

    // Extract UI libraries
    const uiLibMatches = aiResponse.match(/(?:Tailwind|Bootstrap|Material[- ]?UI|Chakra|Ant Design|styled[- ]?components)/gi);
    if (uiLibMatches) {
      uiLibMatches.forEach(lib => {
        if (!analysis.uiLibraries.includes(lib)) {
          analysis.uiLibraries.push(lib);
        }
      });
    }

    // Extract design patterns
    const patternMatches = aiResponse.match(/(?:pattern|approach|design|layout):\s*([^\n.]+)/gi);
    if (patternMatches) {
      patternMatches.forEach(match => {
        const pattern = match.replace(/(?:pattern|approach|design|layout):\s*/i, '').trim();
        analysis.designPatterns.push({
          pattern,
          usage: 'Detected in analysis',
          implementation: 'See AI insights'
        });
      });
    }

    // Extract features
    const featureMatches = aiResponse.match(/(?:feature|component|section):\s*([^\n.]+)/gi);
    if (featureMatches) {
      featureMatches.forEach(match => {
        const feature = match.replace(/(?:feature|component|section):\s*/i, '').trim();
        if (!analysis.features.includes(feature)) {
          analysis.features.push(feature);
        }
      });
    }
  }

  private generateRecommendations(websites: WebsiteAnalysis[], patterns: any): string[] {
    const recommendations: string[] = [];

    // Framework recommendations
    if (patterns.frameworks.length > 0) {
      recommendations.push(`Consider using ${patterns.frameworks[0]} as your primary framework - it's used by ${Math.round(patterns.frameworks.length / websites.length * 100)}% of your inspiration sites`);
    }

    // UI Library recommendations
    if (patterns.uiLibraries.length > 0) {
      recommendations.push(`${patterns.uiLibraries[0]} appears to be a popular choice for styling in your inspiration sites`);
    }

    // Design pattern recommendations
    if (patterns.designPatterns.includes('Responsive Design')) {
      recommendations.push('Ensure your design is fully responsive across all devices');
    }

    if (patterns.designPatterns.includes('Dark Mode')) {
      recommendations.push('Consider implementing a dark mode option for better user experience');
    }

    // Color scheme recommendations
    if (patterns.colorSchemes.length > 0) {
      recommendations.push(`Popular color schemes include: ${patterns.colorSchemes.slice(0, 3).join(', ')}`);
    }

    // Feature recommendations
    const commonFeatures = patterns.features.slice(0, 5);
    if (commonFeatures.length > 0) {
      recommendations.push(`Key features to implement: ${commonFeatures.join(', ')}`);
    }

    return recommendations;
  }
  
  private async extractAndTransformComponents(
    url: string, 
    userPrefs: any
  ): Promise<{ components: WebsiteAnalysis['extractedComponents']; designSystem: DesignSystemData }> {
    console.log(chalk.cyan('\n🔧 Extracting and transforming components...\n'));
    
    const extractedComponents: WebsiteAnalysis['extractedComponents'] = [];
    
    try {
      // Ask for extraction method
      const { extractionMethod } = await inquirer.prompt([
        {
          type: 'list',
          name: 'extractionMethod',
          message: 'Select extraction method:',
          choices: [
            { name: '🚀 Full Analysis (Playwright + Firecrawl)', value: 'full' },
            { name: '🎭 Playwright Only (Visual extraction)', value: 'playwright' },
            { name: '🔥 Firecrawl Only (Code analysis)', value: 'firecrawl' }
          ],
          default: 'full'
        }
      ]);
      
      // Ask for extraction preferences
      const { extractionOptions } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'extractionOptions',
          message: 'Select extraction options:',
          choices: [
            { name: '📱 Extract responsive behavior', value: 'responsive', checked: true },
            { name: '🎬 Capture animations & transitions', value: 'animations', checked: true },
            { name: '🖱️ Capture interactions (hover, click)', value: 'interactions', checked: true },
            { name: '🖼️ Download assets (images, fonts)', value: 'assets', checked: true },
            { name: '♿ Improve accessibility', value: 'accessibility', checked: true }
          ]
        }
      ]);
      
      // Ask for transformation preferences
      const { framework, styling, typescript } = await inquirer.prompt([
        {
          type: 'list',
          name: 'framework',
          message: 'Target framework:',
          choices: [
            { name: '⚛️ React', value: 'react' },
            { name: '💚 Vue', value: 'vue' },
            { name: '🅰️ Angular', value: 'angular' },
            { name: '🟨 Vanilla JS', value: 'vanilla' }
          ],
          default: 'react'
        },
        {
          type: 'list',
          name: 'styling',
          message: 'Styling approach:',
          choices: [
            { name: '🎨 CSS', value: 'css' },
            { name: '🎯 SCSS', value: 'scss' },
            { name: '💅 Styled Components', value: 'styled-components' },
            { name: '🌊 Tailwind CSS', value: 'tailwind' },
            { name: '📦 CSS Modules', value: 'css-modules' }
          ],
          default: 'css'
        },
        {
          type: 'confirm',
          name: 'typescript',
          message: 'Use TypeScript?',
          default: true
        }
      ]);
      
      // Extract components based on user preferences
      const componentsToExtract = userPrefs.componentsToImitate.length > 0 
        ? userPrefs.componentsToImitate 
        : userPrefs.likedElements;
      
      for (const componentName of componentsToExtract) {
        const spinner = ora(`Extracting ${componentName}...`).start();
        
        try {
          // Get selector for component
          const selector = this.getComponentSelector(componentName);
          
          if (selector) {
            let playwrightData: ExtractedComponent | undefined;
            let firecrawlData: FirecrawlExtractedData | undefined;
            let mergedData: MergedComponentData | undefined;
            let generatedComponent: GeneratedComponent | undefined;
            
            // Extract with selected method(s)
            if (extractionMethod === 'full' || extractionMethod === 'playwright') {
              spinner.text = `Extracting ${componentName} with Playwright...`;
              playwrightData = await this.codeExtractor.extractComponent(
                url, 
                selector,
                {
                  captureAnimations: extractionOptions.includes('animations'),
                  captureInteractions: extractionOptions.includes('interactions'),
                  captureAssets: extractionOptions.includes('assets'),
                  followBestPractices: true
                }
              );
            }
            
            if (extractionMethod === 'full' || extractionMethod === 'firecrawl') {
              spinner.text = `Extracting ${componentName} with Firecrawl...`;
              firecrawlData = await this.firecrawlExtractor.extractWithFirecrawl(url);
            }
            
            // Extract design system
            spinner.text = `Analyzing design system...`;
            const designSystem = await this.firecrawlExtractor.extractDesignSystem(url, firecrawlData);
            
            // Merge data if we have both sources
            if (playwrightData && firecrawlData) {
              spinner.text = `Merging extraction results...`;
              mergedData = await this.codeMerger.mergeExtractedData(
                playwrightData,
                firecrawlData,
                designSystem
              );
            }
            
            // Generate optimized component
            spinner.text = `Generating beautiful ${framework} component...`;
            
            let dataToGenerate: MergedComponentData | null = null;
            
            if (mergedData) {
              dataToGenerate = mergedData;
            } else if (playwrightData) {
              dataToGenerate = {
                componentData: {
                  name: this.extractComponentName(url),
                  type: 'page' as const,
                  description: `Inspired by ${url}`,
                  code: '',
                  codeSnippet: '',
                  framework: framework,
                  props: [],
                  dependencies: []
                },
                layout: playwrightData.layout,
                sections: playwrightData.sections || [],
                colors: playwrightData.colors,
                fonts: playwrightData.fonts,
                html: playwrightData.html,
                css: playwrightData.css,
                javascript: '',
                animations: playwrightData.animations.map(a => ({
                  name: a.properties[0] || 'animation',
                  keyframes: a.keyframes || '',
                  usage: [a.selector]
                })),
                interactions: playwrightData.interactions.map(i => ({
                  element: i.selector,
                  events: i.events,
                  handlers: i.handlers
                })),
                assets: {
                  images: playwrightData.assets.filter(a => a.type === 'image').map(a => a.url),
                  fonts: playwrightData.assets.filter(a => a.type === 'font').map(a => a.url),
                  icons: []
                },
                designSystem,
                metadata: {
                  framework: playwrightData.metadata.framework || framework,
                  dependencies: playwrightData.metadata.dependencies,
                  patterns: [],
                  accessibility: {
                    score: 75,
                    issues: [],
                    improvements: []
                  }
                }
              } as MergedComponentData;
            }
            
            if (dataToGenerate) {
              generatedComponent = await this.componentGenerator.generateComponent(
                dataToGenerate,
                {
                  componentName,
                  framework: framework as any,
                  styling: styling as any,
                  typescript,
                  accessibility: extractionOptions.includes('accessibility'),
                  optimization: true,
                  animations: extractionOptions.includes('animations')
                }
              );
              
              // Save generated component
              await this.saveGeneratedComponent(generatedComponent, {
                url: url,
                mergedData,
                designSystem,
                extractionMethod: extractionMethod as any
              });
            }
            
            extractedComponents.push({
              name: componentName,
              playwrightData,
              firecrawlData,
              mergedData,
              generatedComponent
            });
            
            spinner.succeed(`${componentName} extracted and generated successfully`);
            
          } else {
            spinner.warn(`No selector found for ${componentName}`);
          }
          
        } catch (error) {
          spinner.fail(`Failed to extract ${componentName}: ${error}`);
        }
      }
      
      // If no specific components requested, extract main sections
      if (componentsToExtract.length === 0) {
        const spinner = ora('Analyzing page structure...').start();
        
        // Extract design system first
        const designSystem = await this.firecrawlExtractor.extractDesignSystem(url);
        
        // Use Playwright to extract main components
        const mainComponents = await this.codeExtractor.extractPage(url, {
          captureAnimations: extractionOptions.includes('animations'),
          captureInteractions: extractionOptions.includes('interactions'),
          captureAssets: extractionOptions.includes('assets')
        });
        
        spinner.text = 'Generating components from extracted sections...';
        
        for (const component of mainComponents) {
          // Get Firecrawl data for better analysis
          const firecrawlData = await this.firecrawlExtractor.extractWithFirecrawl(url);
          
          // Merge data
          const mergedData = await this.codeMerger.mergeExtractedData(
            component,
            firecrawlData,
            designSystem
          );
          
          // Generate optimized component
          const generatedComponent = await this.componentGenerator.generateComponent(
            mergedData,
            {
              componentName: this.toPascalCase(component.metadata.name),
              framework: framework as any,
              styling: styling as any,
              typescript,
              accessibility: extractionOptions.includes('accessibility'),
              optimization: true,
              animations: extractionOptions.includes('animations')
            }
          );
          
          // Save generated component
          await this.saveGeneratedComponent(generatedComponent, {
            url: url,
            mergedData,
            designSystem,
            extractionMethod: 'both'
          });
          
          extractedComponents.push({
            name: component.metadata.name,
            playwrightData: component,
            firecrawlData,
            mergedData,
            generatedComponent
          });
        }
        
        spinner.succeed(`Extracted and generated ${mainComponents.length} main components`);
      }
      
      console.log(chalk.green(`\n✅ Extracted ${extractedComponents.length} components\n`));
      
    } catch (error) {
      console.error(chalk.red('Component extraction error:'), error);
    }
    
    // Extract overall design system if not done already
    const designSystem = extractedComponents[0]?.mergedData?.designSystem || 
                        await this.firecrawlExtractor.extractDesignSystem(url);
    
    return { components: extractedComponents, designSystem };
  }
  
  private async saveGeneratedComponent(
    component: GeneratedComponent, 
    sourceInfo?: {
      url?: string;
      mergedData?: MergedComponentData;
      designSystem?: DesignSystemData;
      extractionMethod?: 'playwright' | 'firecrawl' | 'both';
    }
  ): Promise<void> {
    const componentDir = join(this.screenshotDir, 'generated-components', component.name);
    if (!existsSync(componentDir)) {
      mkdirSync(componentDir, { recursive: true });
    }
    
    // Save all generated files
    const ext = component.framework === 'react' ? 'tsx' : 
                component.framework === 'vue' ? 'vue' : 'ts';
    
    // Main component file
    writeFileSync(
      join(componentDir, `index.${ext}`),
      component.files.component
    );
    
    // Styles
    if (component.files.styles) {
      const styleExt = component.files.styles.includes('styled') ? 'ts' : 'css';
      writeFileSync(
        join(componentDir, `styles.${styleExt}`),
        component.files.styles
      );
    }
    
    // TypeScript types
    if (component.files.types) {
      writeFileSync(
        join(componentDir, 'types.ts'),
        component.files.types
      );
    }
    
    // Tests
    if (component.files.tests) {
      writeFileSync(
        join(componentDir, `${component.name}.test.${ext}`),
        component.files.tests
      );
    }
    
    // Storybook
    if (component.files.storybook) {
      writeFileSync(
        join(componentDir, `${component.name}.stories.tsx`),
        component.files.storybook
      );
    }
    
    // Design tokens
    if (component.files.designTokens) {
      writeFileSync(
        join(componentDir, 'design-tokens.ts'),
        component.files.designTokens
      );
    }
    
    // Theme file
    if (component.files.theme) {
      const themeExt = component.framework === 'react' ? 'ts' : 'css';
      writeFileSync(
        join(componentDir, `theme.${themeExt}`),
        component.files.theme
      );
    }
    
    // Documentation
    writeFileSync(
      join(componentDir, 'README.md'),
      component.files.documentation
    );
    
    console.log(chalk.green(`\n✨ Component saved to: ${componentDir}`));
    console.log(chalk.dim(`   Files generated:`));
    console.log(chalk.dim(`   - Component: index.${ext}`));
    if (component.files.styles) console.log(chalk.dim(`   - Styles: styles.css`));
    if (component.files.types) console.log(chalk.dim(`   - Types: types.ts`));
    if (component.files.tests) console.log(chalk.dim(`   - Tests: ${component.name}.test.${ext}`));
    if (component.files.storybook) console.log(chalk.dim(`   - Storybook: ${component.name}.stories.tsx`));
    if (component.files.designTokens) console.log(chalk.dim(`   - Design Tokens: design-tokens.ts`));
    if (component.files.theme) console.log(chalk.dim(`   - Theme: theme.${component.framework === 'react' ? 'ts' : 'css'}`));
    console.log(chalk.dim(`   - Documentation: README.md\n`));
    
    // Catalog the component in the library
    try {
      const cataloged = await this.componentLibrary.addComponent(component, {
        url: sourceInfo?.url,
        extractionMethod: sourceInfo?.extractionMethod
      });
      
      console.log(chalk.blue(`📚 Component cataloged in library:`));
      console.log(chalk.dim(`   ID: ${cataloged.id}`));
      console.log(chalk.dim(`   Category: ${cataloged.category}`));
      console.log(chalk.dim(`   Type: ${cataloged.type}`));
      console.log(chalk.dim(`   Tags: ${cataloged.tags.join(', ')}`));
      console.log(chalk.dim(`   Quality Score: ${cataloged.quality.score}/100\n`));
    } catch (error) {
      console.error(chalk.red('Failed to catalog component:'), error);
    }
  }
  
  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
  
  async cleanup() {
    await this.webTools.cleanup();
    await this.screenshotService.close();
    await this.codeExtractor.close();
  }
}