import { chromium, Browser, Page, BrowserContext } from 'playwright';
import chalk from 'chalk';
import ora from 'ora';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface ExtractedComponent {
  html: string;
  css: string;
  animations: AnimationData[];
  interactions: InteractionData[];
  assets: AssetData[];
  metadata: ComponentMetadata;
}

export interface AnimationData {
  selector: string;
  type: 'transition' | 'animation' | 'transform';
  properties: string[];
  duration: string;
  timing: string;
  keyframes?: string;
}

export interface InteractionData {
  selector: string;
  events: string[];
  handlers: string[];
  states: Record<string, any>;
}

export interface AssetData {
  type: 'image' | 'font' | 'icon';
  url: string;
  localPath?: string;
}

export interface ComponentMetadata {
  name: string;
  type: string;
  framework?: string;
  dependencies: string[];
  responsive: boolean;
  accessibility: AccessibilityData;
}

export interface AccessibilityData {
  ariaLabels: boolean;
  semanticHTML: boolean;
  keyboardNav: boolean;
  colorContrast: boolean;
}

export interface ExtractionOptions {
  outputDir?: string;
  captureAnimations?: boolean;
  captureInteractions?: boolean;
  captureAssets?: boolean;
  followBestPractices?: boolean;
  generateComponents?: boolean;
  framework?: 'react' | 'vue' | 'angular' | 'vanilla';
}

export class PlaywrightCodeExtractor {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private outputDir: string;
  
  constructor(options: ExtractionOptions = {}) {
    this.outputDir = options.outputDir || join(process.cwd(), 'extracted-components');
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }
  
  async initialize() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.context = await this.browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
    }
  }
  
  async extractComponent(url: string, selector: string, options: ExtractionOptions = {}): Promise<ExtractedComponent> {
    const spinner = ora(`Extracting component from ${url}`).start();
    
    try {
      await this.initialize();
      const page = await this.context!.newPage();
      
      // Navigate and wait for network idle
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForSelector(selector, { timeout: 30000 });
      
      // Extract HTML
      const html = await this.extractHTML(page, selector);
      
      // Extract CSS
      const css = await this.extractCSS(page, selector);
      
      // Extract animations
      const animations = options.captureAnimations !== false ? 
        await this.extractAnimations(page, selector) : [];
      
      // Extract interactions
      const interactions = options.captureInteractions !== false ?
        await this.extractInteractions(page, selector) : [];
      
      // Extract assets
      const assets = options.captureAssets !== false ?
        await this.extractAssets(page, selector) : [];
      
      // Analyze component
      const metadata = await this.analyzeComponent(page, selector, html, css);
      
      await page.close();
      spinner.succeed('Component extracted successfully');
      
      const component: ExtractedComponent = {
        html,
        css,
        animations,
        interactions,
        assets,
        metadata
      };
      
      // Transform to best practices if requested
      if (options.followBestPractices !== false) {
        return this.transformToBestPractices(component, options);
      }
      
      return component;
      
    } catch (error: any) {
      spinner.fail(`Extraction failed: ${error.message}`);
      throw error;
    }
  }
  
  private async extractHTML(page: Page, selector: string): Promise<string> {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return '';
      
      // Clone element to avoid modifying the original
      const clone = element.cloneNode(true) as HTMLElement;
      
      // Clean up inline styles (we'll use extracted CSS instead)
      clone.querySelectorAll('*').forEach(el => {
        el.removeAttribute('style');
      });
      
      // Add semantic class names if missing
      if (!clone.className) {
        const tag = clone.tagName.toLowerCase();
        clone.className = `extracted-${tag}`;
      }
      
      return clone.outerHTML;
    }, selector);
  }
  
  private async extractCSS(page: Page, selector: string): Promise<string> {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return '';
      
      const cssRules: string[] = [];
      const processedSelectors = new Set<string>();
      
      // Get computed styles for the element and its children
      const elements = [element, ...element.querySelectorAll('*')];
      
      // Extract styles from all stylesheets
      for (const stylesheet of Array.from(document.styleSheets)) {
        try {
          const rules = Array.from(stylesheet.cssRules || []);
          
          for (const rule of rules) {
            if (rule instanceof CSSStyleRule) {
              // Check if this rule applies to our elements
              const matchingElements = elements.filter(el => el.matches(rule.selectorText));
              
              if (matchingElements.length > 0 && !processedSelectors.has(rule.selectorText)) {
                processedSelectors.add(rule.selectorText);
                cssRules.push(rule.cssText);
              }
            } else if (rule instanceof CSSKeyframesRule) {
              // Always include keyframes
              cssRules.push(rule.cssText);
            } else if (rule instanceof CSSMediaRule) {
              // Include media queries that contain relevant rules
              const mediaRules: string[] = [];
              for (const mediaRule of Array.from(rule.cssRules)) {
                if (mediaRule instanceof CSSStyleRule) {
                  const matchingElements = elements.filter(el => el.matches(mediaRule.selectorText));
                  if (matchingElements.length > 0) {
                    mediaRules.push(mediaRule.cssText);
                  }
                }
              }
              if (mediaRules.length > 0) {
                cssRules.push(`@media ${rule.conditionText} {\n${mediaRules.join('\n')}\n}`);
              }
            }
          }
        } catch (e) {
          // Skip cross-origin stylesheets
        }
      }
      
      // Also get computed styles for custom properties
      const computedStyle = window.getComputedStyle(element);
      const customProperties: string[] = [];
      
      for (const prop of Array.from(computedStyle)) {
        if (prop.startsWith('--')) {
          customProperties.push(`${prop}: ${computedStyle.getPropertyValue(prop)};`);
        }
      }
      
      if (customProperties.length > 0) {
        cssRules.unshift(`:root {\n  ${customProperties.join('\n  ')}\n}`);
      }
      
      return cssRules.join('\n\n');
    }, selector);
  }
  
  private async extractAnimations(page: Page, selector: string): Promise<AnimationData[]> {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return [];
      
      const animations: AnimationData[] = [];
      const elements = [element, ...element.querySelectorAll('*')];
      
      elements.forEach(el => {
        const computed = window.getComputedStyle(el);
        
        // Extract transitions
        const transition = computed.transition;
        if (transition && transition !== 'none' && transition !== 'all 0s ease 0s') {
          animations.push({
            selector: el.className || el.tagName.toLowerCase(),
            type: 'transition',
            properties: computed.transitionProperty.split(',').map(p => p.trim()),
            duration: computed.transitionDuration,
            timing: computed.transitionTimingFunction,
          });
        }
        
        // Extract animations
        const animation = computed.animation;
        if (animation && animation !== 'none') {
          const animationName = computed.animationName;
          
          // Find keyframes
          let keyframes = '';
          for (const stylesheet of Array.from(document.styleSheets)) {
            try {
              for (const rule of Array.from(stylesheet.cssRules || [])) {
                if (rule instanceof CSSKeyframesRule && rule.name === animationName) {
                  keyframes = rule.cssText;
                  break;
                }
              }
            } catch (e) {}
          }
          
          animations.push({
            selector: el.className || el.tagName.toLowerCase(),
            type: 'animation',
            properties: [animationName],
            duration: computed.animationDuration,
            timing: computed.animationTimingFunction,
            keyframes
          });
        }
        
        // Extract transforms
        const transform = computed.transform;
        if (transform && transform !== 'none') {
          animations.push({
            selector: el.className || el.tagName.toLowerCase(),
            type: 'transform',
            properties: [transform],
            duration: '0s',
            timing: 'linear'
          });
        }
      });
      
      return animations;
    }, selector);
  }
  
  private async extractInteractions(page: Page, selector: string): Promise<InteractionData[]> {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return [];
      
      const interactions: InteractionData[] = [];
      const elements = [element, ...element.querySelectorAll('*')];
      
      elements.forEach(el => {
        const listeners = (el as any).getEventListeners?.() || {};
        const events = Object.keys(listeners);
        
        if (events.length > 0) {
          interactions.push({
            selector: el.className || el.tagName.toLowerCase(),
            events,
            handlers: events.map(e => `${e} handler`),
            states: {
              hover: el.matches(':hover'),
              focus: el.matches(':focus'),
              active: el.matches(':active')
            }
          });
        }
      });
      
      return interactions;
    }, selector);
  }
  
  private async extractAssets(page: Page, selector: string): Promise<AssetData[]> {
    return await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return [];
      
      const assets: AssetData[] = [];
      const processedUrls = new Set<string>();
      
      // Extract images
      element.querySelectorAll('img').forEach(img => {
        if (img.src && !processedUrls.has(img.src)) {
          processedUrls.add(img.src);
          assets.push({
            type: 'image',
            url: img.src
          });
        }
      });
      
      // Extract background images
      const elements = [element, ...element.querySelectorAll('*')];
      elements.forEach(el => {
        const bgImage = window.getComputedStyle(el).backgroundImage;
        const match = bgImage.match(/url\(['"]?(.+?)['"]?\)/);
        if (match && match[1] && !processedUrls.has(match[1])) {
          processedUrls.add(match[1]);
          assets.push({
            type: 'image',
            url: match[1]
          });
        }
      });
      
      // Extract fonts
      const computed = window.getComputedStyle(element);
      const fontFamily = computed.fontFamily;
      if (fontFamily) {
        const fonts = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''));
        fonts.forEach(font => {
          if (!['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'].includes(font)) {
            assets.push({
              type: 'font',
              url: font
            });
          }
        });
      }
      
      return assets;
    }, selector);
  }
  
  private async analyzeComponent(page: Page, selector: string, html: string, css: string): Promise<ComponentMetadata> {
    const analysis = await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (!element) return null;
      
      // Detect component type
      const tag = element.tagName.toLowerCase();
      let type = 'generic';
      
      if (element.matches('nav, header')) type = 'navigation';
      else if (element.matches('button, .btn')) type = 'button';
      else if (element.matches('form')) type = 'form';
      else if (element.matches('.card, article')) type = 'card';
      else if (element.matches('.modal, .dialog')) type = 'modal';
      else if (element.matches('.carousel, .slider')) type = 'carousel';
      
      // Check accessibility
      const hasAriaLabels = !!element.querySelector('[aria-label], [aria-labelledby]');
      const hasSemanticHTML = !!element.querySelector('header, nav, main, section, article, aside, footer');
      const hasKeyboardNav = !!element.querySelector('[tabindex], button, a, input, select, textarea');
      
      // Check responsiveness
      const hasMediaQueries = document.styleSheets.length > 0;
      
      return {
        type,
        hasAriaLabels,
        hasSemanticHTML,
        hasKeyboardNav,
        hasMediaQueries
      };
    }, selector);
    
    // Detect framework
    const framework = await this.detectFramework(page);
    
    return {
      name: `extracted-${analysis?.type || 'component'}`,
      type: analysis?.type || 'generic',
      framework,
      dependencies: this.extractDependencies(html, css),
      responsive: analysis?.hasMediaQueries || false,
      accessibility: {
        ariaLabels: analysis?.hasAriaLabels || false,
        semanticHTML: analysis?.hasSemanticHTML || false,
        keyboardNav: analysis?.hasKeyboardNav || false,
        colorContrast: true // Would need proper analysis
      }
    };
  }
  
  private async detectFramework(page: Page): Promise<string | undefined> {
    return await page.evaluate(() => {
      // Check for common framework indicators
      if ((window as any).React || document.querySelector('[data-reactroot]')) return 'react';
      if ((window as any).Vue || document.querySelector('[data-v-]')) return 'vue';
      if ((window as any).angular || document.querySelector('[ng-version]')) return 'angular';
      if (document.querySelector('[class*="svelte"]')) return 'svelte';
      return undefined;
    });
  }
  
  private extractDependencies(html: string, css: string): string[] {
    const deps: string[] = [];
    
    // Check for common UI libraries
    if (css.includes('tailwind') || html.includes('tw-')) deps.push('tailwindcss');
    if (css.includes('bootstrap') || html.includes('btn-')) deps.push('bootstrap');
    if (css.includes('mui') || html.includes('Mui')) deps.push('@mui/material');
    if (css.includes('antd') || html.includes('ant-')) deps.push('antd');
    
    return deps;
  }
  
  private async transformToBestPractices(
    component: ExtractedComponent, 
    options: ExtractionOptions
  ): Promise<ExtractedComponent> {
    // Clean and optimize CSS
    component.css = this.optimizeCSS(component.css);
    
    // Improve HTML semantics
    component.html = this.improveHTMLSemantics(component.html);
    
    // Generate framework-specific component
    if (options.generateComponents && options.framework) {
      const componentCode = this.generateFrameworkComponent(
        component,
        options.framework
      );
      
      // Save component
      this.saveComponent(component, componentCode, options.framework);
    }
    
    return component;
  }
  
  private optimizeCSS(css: string): string {
    // Remove vendor prefixes (we'll add them back with autoprefixer)
    css = css.replace(/-webkit-|-moz-|-ms-|-o-/g, '');
    
    // Convert to CSS custom properties
    const colors = new Map<string, string>();
    const colorRegex = /#[0-9a-f]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/gi;
    let colorIndex = 1;
    
    css = css.replace(colorRegex, (match) => {
      if (!colors.has(match)) {
        colors.set(match, `--color-${colorIndex++}`);
      }
      return `var(${colors.get(match)})`;
    });
    
    // Add custom properties
    if (colors.size > 0) {
      const customProps = Array.from(colors.entries())
        .map(([value, prop]) => `  ${prop}: ${value};`)
        .join('\n');
      
      css = `:root {\n${customProps}\n}\n\n${css}`;
    }
    
    // Convert fixed units to relative
    css = css.replace(/(\d+)px/g, (match, num) => {
      const value = parseInt(num);
      if (value >= 16) {
        return `${(value / 16).toFixed(2)}rem`;
      }
      return match;
    });
    
    return css;
  }
  
  private improveHTMLSemantics(html: string): string {
    // Convert divs to semantic elements where appropriate
    html = html.replace(/<div([^>]*class="[^"]*nav[^"]*"[^>]*)>/gi, '<nav$1>');
    html = html.replace(/<div([^>]*class="[^"]*header[^"]*"[^>]*)>/gi, '<header$1>');
    html = html.replace(/<div([^>]*class="[^"]*footer[^"]*"[^>]*)>/gi, '<footer$1>');
    html = html.replace(/<div([^>]*class="[^"]*card[^"]*"[^>]*)>/gi, '<article$1>');
    
    // Add ARIA labels where missing
    html = html.replace(/<button([^>]*)>/gi, (match, attrs) => {
      if (!attrs.includes('aria-label')) {
        return `<button${attrs} aria-label="Button">`;
      }
      return match;
    });
    
    return html;
  }
  
  private generateFrameworkComponent(
    component: ExtractedComponent,
    framework: 'react' | 'vue' | 'angular' | 'vanilla'
  ): string {
    switch (framework) {
      case 'react':
        return this.generateReactComponent(component);
      case 'vue':
        return this.generateVueComponent(component);
      case 'angular':
        return this.generateAngularComponent(component);
      default:
        return this.generateVanillaComponent(component);
    }
  }
  
  private generateReactComponent(component: ExtractedComponent): string {
    const componentName = this.toPascalCase(component.metadata.name);
    
    return `import React from 'react';
import './styles.css';

interface ${componentName}Props {
  className?: string;
  children?: React.ReactNode;
}

export const ${componentName}: React.FC<${componentName}Props> = ({ 
  className = '', 
  children 
}) => {
  return (
    ${this.convertHTMLToJSX(component.html)}
  );
};

export default ${componentName};`;
  }
  
  private generateVueComponent(component: ExtractedComponent): string {
    return `<template>
  ${component.html}
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Component logic here
</script>

<style scoped>
${component.css}
</style>`;
  }
  
  private generateAngularComponent(component: ExtractedComponent): string {
    const componentName = this.toPascalCase(component.metadata.name);
    
    return `import { Component } from '@angular/core';

@Component({
  selector: 'app-${component.metadata.name}',
  template: \`${component.html}\`,
  styles: [\`${component.css}\`]
})
export class ${componentName}Component {
  // Component logic here
}`;
  }
  
  private generateVanillaComponent(component: ExtractedComponent): string {
    return `<!-- ${component.metadata.name}.html -->
${component.html}

<!-- ${component.metadata.name}.css -->
<style>
${component.css}
</style>

<!-- ${component.metadata.name}.js -->
<script>
// Component initialization
document.addEventListener('DOMContentLoaded', () => {
  // Add interactions here
});
</script>`;
  }
  
  private convertHTMLToJSX(html: string): string {
    // Convert HTML to JSX
    html = html.replace(/class=/g, 'className=');
    html = html.replace(/for=/g, 'htmlFor=');
    html = html.replace(/style="([^"]*)"/g, (match, styles) => {
      const jsxStyles = styles
        .split(';')
        .filter(s => s.trim())
        .map(s => {
          const [prop, value] = s.split(':').map(p => p.trim());
          const camelCaseProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
          return `${camelCaseProp}: '${value}'`;
        })
        .join(', ');
      
      return `style={{${jsxStyles}}}`;
    });
    
    return html;
  }
  
  private toPascalCase(str: string): string {
    return str
      .split(/[-_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
  
  private saveComponent(
    component: ExtractedComponent,
    code: string,
    framework: string
  ): void {
    const componentDir = join(this.outputDir, component.metadata.name);
    if (!existsSync(componentDir)) {
      mkdirSync(componentDir, { recursive: true });
    }
    
    // Save component code
    const ext = framework === 'react' ? 'tsx' : framework === 'vue' ? 'vue' : 'ts';
    writeFileSync(join(componentDir, `index.${ext}`), code);
    
    // Save CSS
    writeFileSync(join(componentDir, 'styles.css'), component.css);
    
    // Save metadata
    writeFileSync(
      join(componentDir, 'metadata.json'),
      JSON.stringify(component, null, 2)
    );
    
    // Save animations
    if (component.animations.length > 0) {
      writeFileSync(
        join(componentDir, 'animations.json'),
        JSON.stringify(component.animations, null, 2)
      );
    }
    
    console.log(chalk.green(`✅ Component saved to ${componentDir}`));
  }
  
  async extractPage(url: string, options: ExtractionOptions = {}): Promise<ExtractedComponent[]> {
    const spinner = ora(`Extracting components from ${url}`).start();
    
    try {
      await this.initialize();
      const page = await this.context!.newPage();
      
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Find all major components on the page
      const componentSelectors = await page.evaluate(() => {
        const selectors: string[] = [];
        
        // Common component patterns
        const patterns = [
          'header', 'nav', '.navbar',
          '.hero', 'section.hero',
          '.card', 'article',
          '.feature', '.features',
          'footer', '.footer',
          '.modal', '.popup',
          'form', '.form-container'
        ];
        
        patterns.forEach(pattern => {
          const elements = document.querySelectorAll(pattern);
          if (elements.length > 0) {
            selectors.push(pattern);
          }
        });
        
        return selectors;
      });
      
      const components: ExtractedComponent[] = [];
      
      for (const selector of componentSelectors) {
        try {
          const component = await this.extractComponent(url, selector, options);
          components.push(component);
        } catch (error) {
          console.error(chalk.yellow(`Failed to extract ${selector}`));
        }
      }
      
      await page.close();
      spinner.succeed(`Extracted ${components.length} components`);
      
      return components;
      
    } catch (error: any) {
      spinner.fail(`Page extraction failed: ${error.message}`);
      throw error;
    }
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
    }
  }
}