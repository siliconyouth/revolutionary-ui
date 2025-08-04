import chalk from 'chalk';
import { ExtractedComponent } from './PlaywrightCodeExtractor';
import { FirecrawlExtractedData, DesignSystemData } from './FirecrawlCodeExtractor';

export interface MergedComponentData {
  html: string;
  css: string;
  javascript: string;
  animations: Array<{
    name: string;
    keyframes: string;
    usage: string[];
  }>;
  interactions: Array<{
    element: string;
    events: string[];
    handlers: string[];
  }>;
  assets: {
    images: string[];
    fonts: string[];
    icons: string[];
  };
  designSystem: DesignSystemData;
  metadata: {
    framework: string;
    uiLibrary?: string;
    dependencies: string[];
    patterns: string[];
    accessibility: {
      score: number;
      issues: string[];
      improvements: string[];
    };
  };
}

export class CodeMerger {
  
  async mergeExtractedData(
    playwrightData: ExtractedComponent,
    firecrawlData: FirecrawlExtractedData,
    designSystem: DesignSystemData
  ): Promise<MergedComponentData> {
    console.log(chalk.cyan('🔄 Merging extracted data from multiple sources...'));
    
    // Merge HTML
    const mergedHTML = this.mergeHTML(playwrightData.html, firecrawlData.html);
    
    // Merge CSS
    const mergedCSS = this.mergeCSS(
      playwrightData.css,
      firecrawlData.styles?.inline.join('\n') || '',
      designSystem
    );
    
    // Extract and merge JavaScript
    const mergedJS = this.mergeJavaScript(
      playwrightData.interactions,
      firecrawlData.scripts?.inline.join('\n') || ''
    );
    
    // Merge animations
    const mergedAnimations = this.mergeAnimations(
      playwrightData.animations,
      designSystem.animations.keyframes
    );
    
    // Merge interactions
    const mergedInteractions = this.mergeInteractions(
      playwrightData.interactions,
      firecrawlData
    );
    
    // Merge assets
    const mergedAssets = this.mergeAssets(
      playwrightData.assets,
      firecrawlData.assets || { images: [], fonts: [], icons: [] }
    );
    
    // Analyze accessibility
    const accessibility = this.analyzeAccessibility(
      mergedHTML,
      playwrightData.metadata.accessibility
    );
    
    // Detect patterns
    const patterns = this.detectPatterns(mergedHTML, mergedCSS);
    
    return {
      html: mergedHTML,
      css: mergedCSS,
      javascript: mergedJS,
      animations: mergedAnimations,
      interactions: mergedInteractions,
      assets: mergedAssets,
      designSystem,
      metadata: {
        framework: this.detectFramework(playwrightData, firecrawlData),
        uiLibrary: this.detectUILibrary(playwrightData, firecrawlData),
        dependencies: this.mergeDependencies(playwrightData, firecrawlData),
        patterns,
        accessibility
      }
    };
  }
  
  private mergeHTML(playwrightHTML: string, firecrawlHTML: string): string {
    // If Playwright HTML is more complete (has the component), use it as base
    if (playwrightHTML && playwrightHTML.trim()) {
      return this.enrichHTML(playwrightHTML, firecrawlHTML);
    }
    
    // Otherwise, extract component from Firecrawl HTML
    return this.extractComponentFromFullHTML(firecrawlHTML);
  }
  
  private enrichHTML(baseHTML: string, additionalHTML: string): string {
    // Parse both HTML strings
    const parser = new DOMParser();
    const baseDoc = parser.parseFromString(baseHTML, 'text/html');
    const additionalDoc = parser.parseFromString(additionalHTML, 'text/html');
    
    // Extract additional attributes, classes, or data attributes
    const baseElements = baseDoc.querySelectorAll('*');
    
    baseElements.forEach(element => {
      const tagName = element.tagName.toLowerCase();
      const classes = Array.from(element.classList);
      
      // Find corresponding elements in additional HTML
      const selector = tagName + (classes.length > 0 ? '.' + classes.join('.') : '');
      const correspondingElements = additionalDoc.querySelectorAll(selector);
      
      correspondingElements.forEach(correspondingEl => {
        // Merge attributes
        Array.from(correspondingEl.attributes).forEach(attr => {
          if (!element.hasAttribute(attr.name)) {
            element.setAttribute(attr.name, attr.value);
          }
        });
        
        // Merge classes
        Array.from(correspondingEl.classList).forEach(className => {
          if (!element.classList.contains(className)) {
            element.classList.add(className);
          }
        });
      });
    });
    
    return baseDoc.body.innerHTML;
  }
  
  private extractComponentFromFullHTML(fullHTML: string): string {
    // Use main content extraction heuristics
    const parser = new DOMParser();
    const doc = parser.parseFromString(fullHTML, 'text/html');
    
    // Try to find the main component container
    const mainSelectors = [
      '[role="main"]',
      'main',
      '.main-content',
      '#main-content',
      'article',
      '.component',
      '[data-component]'
    ];
    
    for (const selector of mainSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        return element.outerHTML;
      }
    }
    
    // Fallback to body content
    return doc.body.innerHTML;
  }
  
  private mergeCSS(
    playwrightCSS: string,
    firecrawlCSS: string,
    designSystem: DesignSystemData
  ): string {
    const mergedRules = new Map<string, string>();
    
    // Parse and merge CSS rules
    const parseCSS = (css: string) => {
      const rules = css.match(/([^{]+){([^}]+)}/g) || [];
      
      rules.forEach(rule => {
        const [selector, styles] = rule.split('{');
        const cleanSelector = selector.trim();
        const cleanStyles = styles.replace('}', '').trim();
        
        if (mergedRules.has(cleanSelector)) {
          // Merge styles
          const existingStyles = mergedRules.get(cleanSelector)!;
          const merged = this.mergeStyleDeclarations(existingStyles, cleanStyles);
          mergedRules.set(cleanSelector, merged);
        } else {
          mergedRules.set(cleanSelector, cleanStyles);
        }
      });
    };
    
    parseCSS(playwrightCSS);
    parseCSS(firecrawlCSS);
    
    // Apply design system
    let finalCSS = this.generateDesignSystemCSS(designSystem);
    
    // Add merged rules
    mergedRules.forEach((styles, selector) => {
      const optimizedStyles = this.optimizeStyles(styles, designSystem);
      finalCSS += `\n${selector} {\n  ${optimizedStyles}\n}`;
    });
    
    return finalCSS;
  }
  
  private mergeStyleDeclarations(existing: string, additional: string): string {
    const styleMap = new Map<string, string>();
    
    // Parse existing styles
    existing.split(';').forEach(style => {
      const [prop, value] = style.split(':').map(s => s.trim());
      if (prop && value) {
        styleMap.set(prop, value);
      }
    });
    
    // Merge additional styles (override if exists)
    additional.split(';').forEach(style => {
      const [prop, value] = style.split(':').map(s => s.trim());
      if (prop && value) {
        styleMap.set(prop, value);
      }
    });
    
    // Convert back to string
    return Array.from(styleMap.entries())
      .map(([prop, value]) => `${prop}: ${value}`)
      .join(';\n  ');
  }
  
  private generateDesignSystemCSS(designSystem: DesignSystemData): string {
    let css = ':root {\n';
    
    // Colors
    designSystem.colors.primary.forEach((color, i) => {
      css += `  --color-primary-${i + 1}: ${color};\n`;
    });
    
    designSystem.colors.secondary.forEach((color, i) => {
      css += `  --color-secondary-${i + 1}: ${color};\n`;
    });
    
    designSystem.colors.neutral.forEach((color, i) => {
      css += `  --color-neutral-${i + 1}: ${color};\n`;
    });
    
    // Semantic colors
    Object.entries(designSystem.colors.semantic).forEach(([name, color]) => {
      css += `  --color-${name}: ${color};\n`;
    });
    
    // Typography
    designSystem.typography.fontFamilies.forEach((font, i) => {
      css += `  --font-family-${i + 1}: ${font};\n`;
    });
    
    Object.entries(designSystem.typography.fontSizes).forEach(([name, size]) => {
      css += `  --font-size-${name}: ${size};\n`;
    });
    
    // Spacing
    designSystem.spacing.scale.forEach((space, i) => {
      css += `  --space-${i + 1}: ${space};\n`;
    });
    
    // Shadows
    designSystem.shadows.forEach((shadow, i) => {
      css += `  --shadow-${i + 1}: ${shadow};\n`;
    });
    
    // Animations
    designSystem.animations.durations.forEach((duration, i) => {
      css += `  --duration-${i + 1}: ${duration};\n`;
    });
    
    designSystem.animations.easings.forEach((easing, i) => {
      css += `  --easing-${i + 1}: ${easing};\n`;
    });
    
    css += '}\n';
    
    return css;
  }
  
  private optimizeStyles(styles: string, designSystem: DesignSystemData): string {
    let optimized = styles;
    
    // Replace colors with CSS variables
    designSystem.colors.primary.forEach((color, i) => {
      const regex = new RegExp(color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      optimized = optimized.replace(regex, `var(--color-primary-${i + 1})`);
    });
    
    // Replace font families with CSS variables
    designSystem.typography.fontFamilies.forEach((font, i) => {
      const regex = new RegExp(font.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      optimized = optimized.replace(regex, `var(--font-family-${i + 1})`);
    });
    
    // Replace spacing values with CSS variables
    designSystem.spacing.scale.forEach((space, i) => {
      const regex = new RegExp(`\\b${space}\\b`, 'g');
      optimized = optimized.replace(regex, `var(--space-${i + 1})`);
    });
    
    return optimized;
  }
  
  private mergeJavaScript(
    interactions: ExtractedComponent['interactions'],
    firecrawlJS: string
  ): string {
    const jsCode: string[] = [];
    
    // Generate event listeners from interactions
    interactions.forEach((interaction, i) => {
      const elementVar = `element${i}`;
      const selector = interaction.selector.startsWith('.') 
        ? interaction.selector 
        : `.${interaction.selector}`;
      
      jsCode.push(`
// ${interaction.selector} interactions
const ${elementVar} = document.querySelector('${selector}');
if (${elementVar}) {`);
      
      interaction.events.forEach(event => {
        jsCode.push(`  ${elementVar}.addEventListener('${event}', (e) => {
    // ${event} handler
    console.log('${event} on ${interaction.selector}');
    // Add your logic here
  });`);
      });
      
      jsCode.push('}\n');
    });
    
    // Add any additional JavaScript from Firecrawl
    if (firecrawlJS && firecrawlJS.trim()) {
      jsCode.push('// Additional JavaScript from page analysis');
      jsCode.push(firecrawlJS);
    }
    
    return jsCode.join('\n');
  }
  
  private mergeAnimations(
    playwrightAnimations: ExtractedComponent['animations'],
    firecrawlKeyframes: Record<string, string>
  ): MergedComponentData['animations'] {
    const animationMap = new Map<string, MergedComponentData['animations'][0]>();
    
    // Process Playwright animations
    playwrightAnimations.forEach(anim => {
      if (anim.type === 'animation' && anim.keyframes) {
        const name = anim.properties[0] || 'animation';
        animationMap.set(name, {
          name,
          keyframes: anim.keyframes,
          usage: [anim.selector]
        });
      }
    });
    
    // Merge Firecrawl keyframes
    Object.entries(firecrawlKeyframes).forEach(([name, keyframes]) => {
      if (animationMap.has(name)) {
        // Merge usage
        const existing = animationMap.get(name)!;
        existing.keyframes = keyframes; // Prefer Firecrawl's complete keyframes
      } else {
        animationMap.set(name, {
          name,
          keyframes: `@keyframes ${name} {${keyframes}}`,
          usage: []
        });
      }
    });
    
    return Array.from(animationMap.values());
  }
  
  private mergeInteractions(
    playwrightInteractions: ExtractedComponent['interactions'],
    firecrawlData: FirecrawlExtractedData
  ): MergedComponentData['interactions'] {
    const merged: MergedComponentData['interactions'] = [];
    
    // Convert Playwright interactions
    playwrightInteractions.forEach(interaction => {
      merged.push({
        element: interaction.selector,
        events: interaction.events,
        handlers: interaction.handlers
      });
    });
    
    // Add any additional interactions detected from Firecrawl scripts
    if (firecrawlData.scripts?.inline) {
      const additionalInteractions = this.detectInteractionsFromScripts(
        firecrawlData.scripts.inline.join('\n')
      );
      
      additionalInteractions.forEach(interaction => {
        const existing = merged.find(m => m.element === interaction.element);
        if (existing) {
          // Merge events
          interaction.events.forEach(event => {
            if (!existing.events.includes(event)) {
              existing.events.push(event);
            }
          });
        } else {
          merged.push(interaction);
        }
      });
    }
    
    return merged;
  }
  
  private detectInteractionsFromScripts(scripts: string): MergedComponentData['interactions'] {
    const interactions: MergedComponentData['interactions'] = [];
    
    // Detect addEventListener patterns
    const eventListenerRegex = /(?:querySelector|getElementById|getElementsByClassName)\(['"]([^'"]+)['"]\)[^.]*\.addEventListener\(['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = eventListenerRegex.exec(scripts)) !== null) {
      const [, selector, event] = match;
      interactions.push({
        element: selector,
        events: [event],
        handlers: [`${event} handler`]
      });
    }
    
    // Detect jQuery event patterns
    const jqueryRegex = /\$\(['"]([^'"]+)['"]\)\.(?:on|click|hover|focus|blur|change|submit)\(/g;
    while ((match = jqueryRegex.exec(scripts)) !== null) {
      const [fullMatch, selector] = match;
      const event = fullMatch.match(/\.(on|click|hover|focus|blur|change|submit)\(/)?.[1] || 'click';
      interactions.push({
        element: selector,
        events: [event],
        handlers: [`jQuery ${event} handler`]
      });
    }
    
    return interactions;
  }
  
  private mergeAssets(
    playwrightAssets: ExtractedComponent['assets'],
    firecrawlAssets: FirecrawlExtractedData['assets']
  ): MergedComponentData['assets'] {
    return {
      images: [...new Set([
        ...playwrightAssets.map(a => a.url),
        ...firecrawlAssets.images
      ])],
      fonts: [...new Set([
        ...playwrightAssets.filter(a => a.type === 'font').map(a => a.url),
        ...firecrawlAssets.fonts
      ])],
      icons: [...new Set(firecrawlAssets.icons)]
    };
  }
  
  private analyzeAccessibility(html: string, playwrightAccessibility: any): MergedComponentData['metadata']['accessibility'] {
    const issues: string[] = [];
    const improvements: string[] = [];
    let score = 0;
    
    // Check for ARIA labels
    if (!html.includes('aria-label') && !html.includes('aria-labelledby')) {
      issues.push('Missing ARIA labels on interactive elements');
      improvements.push('Add aria-label or aria-labelledby to buttons and links');
    } else {
      score += 25;
    }
    
    // Check for alt text on images
    const imgRegex = /<img[^>]*>/g;
    const images = html.match(imgRegex) || [];
    const imagesWithoutAlt = images.filter(img => !img.includes('alt='));
    
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} images missing alt text`);
      improvements.push('Add descriptive alt text to all images');
    } else if (images.length > 0) {
      score += 25;
    }
    
    // Check for semantic HTML
    const semanticTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
    const hasSemanticHTML = semanticTags.some(tag => html.includes(`<${tag}`));
    
    if (!hasSemanticHTML) {
      issues.push('Limited use of semantic HTML elements');
      improvements.push('Replace generic divs with semantic HTML5 elements');
    } else {
      score += 25;
    }
    
    // Check for form labels
    if (html.includes('<input') || html.includes('<select') || html.includes('<textarea')) {
      if (!html.includes('<label')) {
        issues.push('Form inputs missing associated labels');
        improvements.push('Add label elements for all form inputs');
      } else {
        score += 25;
      }
    }
    
    // Combine with Playwright accessibility data
    if (playwrightAccessibility.keyboardNav) {
      score = Math.min(100, score + 10);
    } else {
      issues.push('Keyboard navigation may be limited');
      improvements.push('Ensure all interactive elements are keyboard accessible');
    }
    
    return { score, issues, improvements };
  }
  
  private detectPatterns(html: string, css: string): string[] {
    const patterns: string[] = [];
    const combined = html + css;
    
    // Common UI patterns
    const patternChecks = [
      { pattern: 'Card Layout', check: /class=["'][^"']*card[^"']*["']/i },
      { pattern: 'Grid System', check: /grid|col-\d+|columns/i },
      { pattern: 'Flexbox Layout', check: /flex|flex-row|flex-col/i },
      { pattern: 'Hero Section', check: /hero|jumbotron|banner/i },
      { pattern: 'Navigation Bar', check: /nav|navbar|navigation/i },
      { pattern: 'Modal/Dialog', check: /modal|dialog|popup/i },
      { pattern: 'Carousel/Slider', check: /carousel|slider|swiper/i },
      { pattern: 'Accordion', check: /accordion|collapse|expandable/i },
      { pattern: 'Tabs', check: /tabs|tab-content|tab-pane/i },
      { pattern: 'Breadcrumb', check: /breadcrumb/i },
      { pattern: 'Pagination', check: /pagination|pager/i },
      { pattern: 'Form Validation', check: /validate|validation|error-message/i },
      { pattern: 'Loading States', check: /loading|spinner|skeleton/i },
      { pattern: 'Dark Mode', check: /dark-mode|theme-dark|dark-theme/i },
      { pattern: 'Responsive Design', check: /@media|mobile|tablet|desktop/i }
    ];
    
    patternChecks.forEach(({ pattern, check }) => {
      if (check.test(combined)) {
        patterns.push(pattern);
      }
    });
    
    return patterns;
  }
  
  private detectFramework(
    playwrightData: ExtractedComponent,
    firecrawlData: FirecrawlExtractedData
  ): string {
    // Combine framework detections
    const frameworks = new Set<string>();
    
    if (playwrightData.metadata.framework) {
      frameworks.add(playwrightData.metadata.framework);
    }
    
    if (firecrawlData.scripts?.frameworks) {
      firecrawlData.scripts.frameworks.forEach(f => frameworks.add(f));
    }
    
    // Return the most likely framework
    const priority = ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt'];
    
    for (const fw of priority) {
      if (frameworks.has(fw)) {
        return fw;
      }
    }
    
    return Array.from(frameworks)[0] || 'Vanilla JavaScript';
  }
  
  private detectUILibrary(
    playwrightData: ExtractedComponent,
    firecrawlData: FirecrawlExtractedData
  ): string | undefined {
    const libraries = new Set<string>();
    
    // Check dependencies
    playwrightData.metadata.dependencies.forEach(dep => {
      if (dep.includes('tailwind')) libraries.add('Tailwind CSS');
      if (dep.includes('bootstrap')) libraries.add('Bootstrap');
      if (dep.includes('mui')) libraries.add('Material-UI');
      if (dep.includes('antd')) libraries.add('Ant Design');
    });
    
    // Check CSS for library signatures
    const css = playwrightData.css + (firecrawlData.styles?.inline.join(' ') || '');
    
    if (css.includes('tailwind')) libraries.add('Tailwind CSS');
    if (css.includes('bootstrap')) libraries.add('Bootstrap');
    if (css.includes('mui') || css.includes('MuiButton')) libraries.add('Material-UI');
    if (css.includes('ant-')) libraries.add('Ant Design');
    
    return Array.from(libraries)[0];
  }
  
  private mergeDependencies(
    playwrightData: ExtractedComponent,
    firecrawlData: FirecrawlExtractedData
  ): string[] {
    const deps = new Set<string>(playwrightData.metadata.dependencies);
    
    // Add frameworks as dependencies
    if (firecrawlData.scripts?.frameworks) {
      firecrawlData.scripts.frameworks.forEach(fw => {
        // Map framework to package name
        const packageMap: Record<string, string> = {
          'React': 'react',
          'Vue': 'vue',
          'Angular': '@angular/core',
          'Next.js': 'next',
          'Nuxt': 'nuxt',
          'jQuery': 'jquery',
          'Bootstrap': 'bootstrap',
          'Tailwind': 'tailwindcss'
        };
        
        const pkg = packageMap[fw];
        if (pkg) {
          deps.add(pkg);
        }
      });
    }
    
    return Array.from(deps);
  }
}