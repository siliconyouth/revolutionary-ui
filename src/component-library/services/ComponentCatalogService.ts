import crypto from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { 
  ComponentMetadata, 
  ComponentCategory, 
  ComponentType,
  FrameworkSupport,
  StylingSupport,
  ComponentFiles,
  AccessibilityInfo,
  PerformanceMetrics,
  DesignTokens
} from '../models/Component';
import { GeneratedComponent } from '../../interactive/tools/EnhancedComponentGenerator';
import { MergedComponentData } from '../../interactive/tools/CodeMerger';
import { DesignSystemData } from '../../interactive/tools/FirecrawlCodeExtractor';

export class ComponentCatalogService {
  private libraryPath: string;
  private dbPath: string;
  private componentsDb: Map<string, ComponentMetadata>;
  
  constructor() {
    this.libraryPath = join(process.cwd(), 'component-library');
    this.dbPath = join(this.libraryPath, 'components.db.json');
    
    // Ensure library directory exists
    if (!existsSync(this.libraryPath)) {
      mkdirSync(this.libraryPath, { recursive: true });
    }
    
    // Load or initialize database
    this.componentsDb = this.loadDatabase();
  }
  
  private loadDatabase(): Map<string, ComponentMetadata> {
    if (existsSync(this.dbPath)) {
      try {
        const data = JSON.parse(readFileSync(this.dbPath, 'utf-8'));
        return new Map(Object.entries(data));
      } catch (error) {
        console.warn(chalk.yellow('Failed to load component database, starting fresh'));
        return new Map();
      }
    }
    return new Map();
  }
  
  private saveDatabase(): void {
    const data = Object.fromEntries(this.componentsDb);
    writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
  }
  
  async catalogComponent(
    component: GeneratedComponent,
    sourceData?: {
      url?: string;
      mergedData?: MergedComponentData;
      designSystem?: DesignSystemData;
      extractionMethod?: 'playwright' | 'firecrawl' | 'both';
    } | {
      url?: string;
      extractionMethod?: 'playwright' | 'firecrawl' | 'both';
    }
  ): Promise<ComponentMetadata> {
    console.log(chalk.cyan(`📚 Cataloging component: ${component.name}`));
    
    const id = crypto.randomUUID();
    const timestamp = new Date();
    
    // Check if we have merged data
    const mergedData = (sourceData as any)?.mergedData;
    const designSystem = (sourceData as any)?.designSystem;
    
    // Auto-categorize the component
    const { category, type } = this.categorizeComponent(component, mergedData);
    
    // Extract tags and keywords
    const tags = this.extractTags(component, mergedData);
    const keywords = this.extractKeywords(component, mergedData);
    
    // Analyze component quality
    const quality = this.analyzeQuality(component, mergedData);
    
    // Prepare component files
    const componentDir = await this.prepareComponentDirectory(id, component);
    const files = this.saveComponentFiles(componentDir, component);
    
    // Build partial metadata first
    const partialMetadata = {
      id,
      name: component.name.toLowerCase().replace(/\s+/g, '-'),
      displayName: component.name,
      description: this.generateDescription(component, mergedData),
      version: '1.0.0',
      createdAt: timestamp,
      updatedAt: timestamp,
      usageCount: 0,
      source: {
        type: sourceData?.url ? 'scraped' : 'generated',
        url: sourceData?.url,
        extractionMethod: sourceData?.extractionMethod,
        extractedAt: timestamp,
        originalFramework: mergedData?.metadata.framework
      },
      category,
      type,
      tags,
      keywords,
      frameworks: this.getFrameworkSupport(component, componentDir),
      styling: this.getStylingSupport(component, componentDir),
      dependencies: this.extractDependencies(component, mergedData),
      designSystem: designSystem ? {
        name: this.inferDesignSystemName(sourceData?.url || '', designSystem),
        tokens: this.extractDesignTokens(designSystem)
      } : undefined,
      compatibility: {
        browsers: this.getDefaultBrowserSupport(),
        responsive: this.checkResponsiveness(component),
        accessibility: this.getAccessibilityInfo(mergedData),
        performance: await this.measurePerformance(component)
      },
      files,
      assets: {
        screenshots: await this.generateScreenshots(componentDir, component)
      },
      examples: this.generateExamples(component),
      useCases: this.inferUseCases(component, mergedData),
      relatedComponents: [],
      quality,
      popularity: 0,
      featured: false
    };
    
    // Build complete metadata with searchable text
    const metadata: ComponentMetadata = {
      ...partialMetadata,
      searchableText: this.buildSearchableText(component, partialMetadata)
    };
    
    // Save to database
    this.componentsDb.set(id, metadata);
    this.saveDatabase();
    
    // Update component index
    await this.updateComponentIndex(metadata);
    
    console.log(chalk.green(`✅ Component cataloged: ${metadata.displayName} (${id})`));
    console.log(chalk.dim(`   Category: ${category} | Type: ${type}`));
    console.log(chalk.dim(`   Tags: ${tags.join(', ')}`));
    console.log(chalk.dim(`   Quality Score: ${quality.score}/100`));
    
    return metadata;
  }
  
  private categorizeComponent(
    component: GeneratedComponent, 
    mergedData?: MergedComponentData
  ): { category: ComponentCategory; type: ComponentType } {
    const name = component.name.toLowerCase();
    const patterns = mergedData?.metadata.patterns || [];
    
    // Navigation components
    if (name.includes('nav') || name.includes('menu') || patterns.includes('Navigation')) {
      if (name.includes('side')) return { category: ComponentCategory.Navigation, type: ComponentType.Sidebar };
      if (name.includes('bread')) return { category: ComponentCategory.Navigation, type: ComponentType.Breadcrumb };
      return { category: ComponentCategory.Navigation, type: ComponentType.Navbar };
    }
    
    // Layout components
    if (name.includes('hero') || patterns.includes('Hero Section')) {
      return { category: ComponentCategory.Layout, type: ComponentType.Hero };
    }
    if (name.includes('footer')) {
      return { category: ComponentCategory.Layout, type: ComponentType.Footer };
    }
    if (name.includes('grid') || name.includes('layout')) {
      return { category: ComponentCategory.Layout, type: ComponentType.Grid };
    }
    
    // Form components
    if (name.includes('form') || name.includes('input') || patterns.includes('Form')) {
      if (name.includes('select')) return { category: ComponentCategory.Forms, type: ComponentType.Select };
      if (name.includes('checkbox')) return { category: ComponentCategory.Forms, type: ComponentType.Checkbox };
      if (name.includes('radio')) return { category: ComponentCategory.Forms, type: ComponentType.Radio };
      return { category: ComponentCategory.Forms, type: ComponentType.Input };
    }
    
    // Data display
    if (name.includes('card') || patterns.includes('Card Layout')) {
      return { category: ComponentCategory.DataDisplay, type: ComponentType.Card };
    }
    if (name.includes('table')) {
      return { category: ComponentCategory.DataDisplay, type: ComponentType.Table };
    }
    if (name.includes('list')) {
      return { category: ComponentCategory.DataDisplay, type: ComponentType.List };
    }
    
    // Feedback
    if (name.includes('modal') || name.includes('dialog')) {
      return { category: ComponentCategory.Feedback, type: ComponentType.Modal };
    }
    if (name.includes('alert') || name.includes('notification')) {
      return { category: ComponentCategory.Feedback, type: ComponentType.Alert };
    }
    if (name.includes('toast')) {
      return { category: ComponentCategory.Feedback, type: ComponentType.Toast };
    }
    
    // Content
    if (name.includes('carousel') || name.includes('slider')) {
      return { category: ComponentCategory.Content, type: ComponentType.Carousel };
    }
    if (name.includes('accordion') || name.includes('collapse')) {
      return { category: ComponentCategory.Content, type: ComponentType.Accordion };
    }
    
    // Button
    if (name.includes('button') || name.includes('btn')) {
      return { category: ComponentCategory.Utility, type: ComponentType.Button };
    }
    
    // Default
    return { category: ComponentCategory.Utility, type: ComponentType.Custom };
  }
  
  private extractTags(component: GeneratedComponent, mergedData?: MergedComponentData): string[] {
    const tags = new Set<string>();
    
    // Add framework tag
    tags.add(component.framework);
    
    // Add patterns as tags
    if (mergedData?.metadata.patterns) {
      mergedData.metadata.patterns.forEach(pattern => {
        tags.add(pattern.toLowerCase().replace(/\s+/g, '-'));
      });
    }
    
    // Add feature tags
    if (mergedData?.animations && mergedData.animations.length > 0) {
      tags.add('animated');
    }
    if (mergedData?.interactions && mergedData.interactions.length > 0) {
      tags.add('interactive');
    }
    if (mergedData?.metadata.accessibility.score >= 80) {
      tags.add('accessible');
    }
    
    // Add styling tags
    if (component.files.styles?.includes('tailwind')) {
      tags.add('tailwind');
    }
    if (component.files.styles?.includes('styled-components')) {
      tags.add('styled-components');
    }
    
    // Add responsive tag
    if (component.files.styles?.includes('@media') || component.files.styles?.includes('breakpoint')) {
      tags.add('responsive');
    }
    
    return Array.from(tags);
  }
  
  private extractKeywords(component: GeneratedComponent, mergedData?: MergedComponentData): string[] {
    const keywords = new Set<string>();
    
    // Extract from component name
    component.name.split(/(?=[A-Z])/).forEach(word => {
      keywords.add(word.toLowerCase());
    });
    
    // Extract from props
    component.structure.props.forEach(prop => {
      keywords.add(prop.toLowerCase());
    });
    
    // Extract from methods
    component.structure.methods.forEach(method => {
      const words = method.replace(/([A-Z])/g, ' $1').trim().split(' ');
      words.forEach(word => keywords.add(word.toLowerCase()));
    });
    
    // Common UI keywords
    const uiKeywords = ['ui', 'component', 'element', 'widget', 'module'];
    uiKeywords.forEach(keyword => keywords.add(keyword));
    
    return Array.from(keywords).filter(k => k.length > 2);
  }
  
  private analyzeQuality(component: GeneratedComponent, mergedData?: MergedComponentData): ComponentMetadata['quality'] {
    let codeQuality = 70; // Base score
    let documentation = 50;
    let testing = 50;
    let accessibility = mergedData?.metadata.accessibility.score || 50;
    let performance = 70;
    
    // Code quality bonuses
    if (component.files.types) codeQuality += 15; // TypeScript
    if (component.structure.props.length > 0) codeQuality += 5; // Configurable
    if (component.files.styles) codeQuality += 10; // Has styles
    
    // Documentation bonuses
    if (component.files.documentation) documentation += 30;
    if (component.files.storybook) documentation += 20;
    
    // Testing bonuses
    if (component.files.tests) testing += 40;
    if (component.files.storybook) testing += 10; // Storybook helps with testing
    
    // Performance bonuses
    if (component.files.styles?.includes('CSS Custom Properties')) performance += 10;
    if (mergedData?.metadata.patterns.includes('Lazy Loading')) performance += 10;
    
    // Calculate overall score
    const score = Math.round(
      (codeQuality * 0.25) +
      (documentation * 0.20) +
      (testing * 0.20) +
      (accessibility * 0.20) +
      (performance * 0.15)
    );
    
    return {
      score: Math.min(100, score),
      codeQuality: Math.min(100, codeQuality),
      documentation: Math.min(100, documentation),
      testing: Math.min(100, testing),
      accessibility: Math.min(100, accessibility),
      performance: Math.min(100, performance)
    };
  }
  
  private async prepareComponentDirectory(id: string, component: GeneratedComponent): Promise<string> {
    const componentDir = join(this.libraryPath, 'components', id);
    
    if (!existsSync(componentDir)) {
      mkdirSync(componentDir, { recursive: true });
    }
    
    return componentDir;
  }
  
  private saveComponentFiles(componentDir: string, component: GeneratedComponent): ComponentFiles {
    const files: ComponentFiles = {
      main: '',
      documentation: 'README.md'
    };
    
    // Determine file extensions
    const ext = component.framework === 'react' ? 'tsx' : 
                component.framework === 'vue' ? 'vue' : 'ts';
    
    // Save main component file
    const mainFile = `index.${ext}`;
    writeFileSync(join(componentDir, mainFile), component.files.component);
    files.main = mainFile;
    
    // Save styles
    if (component.files.styles) {
      const styleFile = component.files.styles.includes('styled') ? 'styles.ts' : 'styles.css';
      writeFileSync(join(componentDir, styleFile), component.files.styles);
      files.styles = [styleFile];
    }
    
    // Save types
    if (component.files.types) {
      writeFileSync(join(componentDir, 'types.ts'), component.files.types);
      files.types = 'types.ts';
    }
    
    // Save tests
    if (component.files.tests) {
      const testFile = `${component.name}.test.${ext}`;
      writeFileSync(join(componentDir, testFile), component.files.tests);
      files.tests = [testFile];
    }
    
    // Save storybook
    if (component.files.storybook) {
      const storyFile = `${component.name}.stories.tsx`;
      writeFileSync(join(componentDir, storyFile), component.files.storybook);
      files.stories = storyFile;
    }
    
    // Save documentation
    writeFileSync(join(componentDir, 'README.md'), component.files.documentation);
    
    // Save design tokens
    if (component.files.designTokens) {
      writeFileSync(join(componentDir, 'design-tokens.ts'), component.files.designTokens);
      files.designTokens = 'design-tokens.ts';
    }
    
    // Save theme
    if (component.files.theme) {
      const themeFile = component.framework === 'react' ? 'theme.ts' : 'theme.css';
      writeFileSync(join(componentDir, themeFile), component.files.theme);
      files.theme = themeFile;
    }
    
    return files;
  }
  
  private getFrameworkSupport(component: GeneratedComponent, componentDir: string): FrameworkSupport[] {
    const support: FrameworkSupport[] = [];
    
    // Add the main framework
    support.push({
      name: component.framework as any,
      version: '*',
      verified: true,
      path: join(componentDir, component.files.component)
    });
    
    // TODO: Add support for converting to other frameworks
    
    return support;
  }
  
  private getStylingSupport(component: GeneratedComponent, componentDir: string): StylingSupport[] {
    const support: StylingSupport[] = [];
    
    if (component.files.styles) {
      const styleType = this.detectStyleType(component.files.styles);
      support.push({
        type: styleType,
        path: join(componentDir, 'styles.css')
      });
    }
    
    return support;
  }
  
  private detectStyleType(styles: string): StylingSupport['type'] {
    if (styles.includes('styled-components')) return 'styled-components';
    if (styles.includes('@emotion')) return 'emotion';
    if (styles.includes('tailwind')) return 'tailwind';
    if (styles.includes('.module.')) return 'css-modules';
    if (styles.includes('$') && styles.includes('@')) return 'scss';
    return 'css';
  }
  
  private extractDependencies(component: GeneratedComponent, mergedData?: MergedComponentData): ComponentMetadata['dependencies'] {
    const deps: ComponentMetadata['dependencies'] = [];
    
    // Extract from merged data
    if (mergedData?.metadata.dependencies) {
      mergedData.metadata.dependencies.forEach(dep => {
        deps.push({
          name: dep,
          version: '*',
          required: true
        });
      });
    }
    
    // Add framework dependencies
    switch (component.framework) {
      case 'react':
        deps.push({ name: 'react', version: '>=16.8.0', required: true });
        deps.push({ name: 'react-dom', version: '>=16.8.0', required: true });
        break;
      case 'vue':
        deps.push({ name: 'vue', version: '>=3.0.0', required: true });
        break;
      case 'angular':
        deps.push({ name: '@angular/core', version: '>=12.0.0', required: true });
        break;
    }
    
    return deps;
  }
  
  private inferDesignSystemName(url: string, designSystem: DesignSystemData): string {
    // Try to infer from URL
    const urlParts = new URL(url).hostname.split('.');
    const domain = urlParts[urlParts.length - 2] || urlParts[0];
    
    return `${domain.charAt(0).toUpperCase() + domain.slice(1)} Design System`;
  }
  
  private extractDesignTokens(designSystem: DesignSystemData): DesignTokens {
    return {
      colors: {
        ...Object.fromEntries(
          designSystem.colors.primary.map((color, i) => [`primary-${i + 1}`, color])
        ),
        ...designSystem.colors.semantic
      },
      typography: {
        fonts: designSystem.typography.fontFamilies,
        sizes: designSystem.typography.fontSizes,
        weights: designSystem.typography.fontWeights
      },
      spacing: Object.fromEntries(
        designSystem.spacing.scale.map((space, i) => [`space-${i + 1}`, space])
      ),
      shadows: Object.fromEntries(
        designSystem.shadows.map((shadow, i) => [`shadow-${i + 1}`, shadow])
      ),
      animations: designSystem.animations,
      breakpoints: designSystem.breakpoints
    };
  }
  
  private getDefaultBrowserSupport(): ComponentMetadata['compatibility']['browsers'] {
    return [
      { name: 'Chrome', minVersion: '90' },
      { name: 'Firefox', minVersion: '88' },
      { name: 'Safari', minVersion: '14' },
      { name: 'Edge', minVersion: '90' }
    ];
  }
  
  private checkResponsiveness(component: GeneratedComponent): boolean {
    return component.files.styles?.includes('@media') || 
           component.files.styles?.includes('breakpoint') ||
           false;
  }
  
  private getAccessibilityInfo(mergedData?: MergedComponentData): AccessibilityInfo {
    if (mergedData?.metadata.accessibility) {
      const { score, issues, improvements } = mergedData.metadata.accessibility;
      
      return {
        score,
        wcagLevel: score >= 90 ? 'AAA' : score >= 80 ? 'AA' : score >= 70 ? 'A' : 'None',
        ariaCompliant: score >= 70,
        keyboardNavigable: !issues.includes('keyboard'),
        screenReaderTested: false,
        issues
      };
    }
    
    return {
      score: 50,
      wcagLevel: 'None',
      ariaCompliant: false,
      keyboardNavigable: false,
      screenReaderTested: false,
      issues: ['Not analyzed']
    };
  }
  
  private async measurePerformance(component: GeneratedComponent): Promise<PerformanceMetrics> {
    // Calculate bundle size (rough estimate)
    const componentSize = Buffer.byteLength(component.files.component, 'utf8');
    const stylesSize = component.files.styles ? Buffer.byteLength(component.files.styles, 'utf8') : 0;
    const bundleSize = componentSize + stylesSize;
    
    return {
      bundleSize,
      gzipSize: Math.round(bundleSize * 0.3), // Rough estimate
      renderTime: 50 // Default estimate
    };
  }
  
  private async generateScreenshots(componentDir: string, component: GeneratedComponent): Promise<ComponentMetadata['assets']['screenshots']> {
    // TODO: Implement actual screenshot generation
    return [
      {
        path: join(componentDir, 'preview.png'),
        type: 'component',
        description: `Preview of ${component.name}`
      }
    ];
  }
  
  private generateExamples(component: GeneratedComponent): ComponentMetadata['examples'] {
    const examples: ComponentMetadata['examples'] = [];
    
    // Basic usage example
    examples.push({
      title: 'Basic Usage',
      code: this.generateBasicExample(component),
      language: component.framework === 'react' ? 'jsx' : component.framework
    });
    
    // With props example
    if (component.structure.props.length > 3) {
      examples.push({
        title: 'With Props',
        code: this.generatePropsExample(component),
        language: component.framework === 'react' ? 'jsx' : component.framework
      });
    }
    
    return examples;
  }
  
  private generateBasicExample(component: GeneratedComponent): string {
    switch (component.framework) {
      case 'react':
        return `import { ${component.name} } from '@/components/${component.name}';

function App() {
  return <${component.name} />;
}`;
      case 'vue':
        return `<template>
  <${component.name} />
</template>

<script setup>
import ${component.name} from '@/components/${component.name}';
</script>`;
      default:
        return `// Import and use ${component.name}`;
    }
  }
  
  private generatePropsExample(component: GeneratedComponent): string {
    const props = component.structure.props.slice(0, 3);
    
    switch (component.framework) {
      case 'react':
        return `import { ${component.name} } from '@/components/${component.name}';

function App() {
  return (
    <${component.name}
      ${props.map(prop => `${prop}="value"`).join('\n      ')}
    />
  );
}`;
      default:
        return `// Example with props`;
    }
  }
  
  private inferUseCases(component: GeneratedComponent, mergedData?: MergedComponentData): string[] {
    const useCases: string[] = [];
    const name = component.name.toLowerCase();
    
    // Infer from component type
    if (name.includes('hero')) {
      useCases.push('Landing page hero section', 'Marketing page header', 'Product showcase');
    } else if (name.includes('nav')) {
      useCases.push('Main navigation', 'Site header', 'Mobile menu');
    } else if (name.includes('card')) {
      useCases.push('Product listings', 'Blog posts', 'User profiles', 'Feature highlights');
    } else if (name.includes('form')) {
      useCases.push('User registration', 'Contact forms', 'Data input', 'Settings pages');
    } else if (name.includes('modal')) {
      useCases.push('Confirmations', 'Media galleries', 'Form submissions', 'Notifications');
    }
    
    return useCases;
  }
  
  private generateDescription(component: GeneratedComponent, mergedData?: MergedComponentData): string {
    const features: string[] = [];
    
    if (mergedData?.animations.length) {
      features.push(`${mergedData.animations.length} smooth animations`);
    }
    if (mergedData?.interactions.length) {
      features.push(`${mergedData.interactions.length} interactive elements`);
    }
    if (mergedData?.metadata.accessibility.score >= 80) {
      features.push('fully accessible');
    }
    if (this.checkResponsiveness(component)) {
      features.push('responsive design');
    }
    
    const featureText = features.length > 0 ? ` with ${features.join(', ')}` : '';
    
    return `A ${component.framework} ${component.name} component${featureText}. ` +
           `Built with ${this.detectStyleType(component.files.styles || '')} styling.`;
  }
  
  private buildSearchableText(component: GeneratedComponent, metadata: Partial<ComponentMetadata>): string {
    const parts = [
      metadata.displayName,
      metadata.description,
      metadata.category,
      metadata.type,
      ...metadata.tags || [],
      ...metadata.keywords || [],
      ...metadata.useCases || [],
      component.framework
    ];
    
    return parts.filter(Boolean).join(' ').toLowerCase();
  }
  
  private async updateComponentIndex(metadata: ComponentMetadata): Promise<void> {
    const indexPath = join(this.libraryPath, 'index.json');
    let index: any = {};
    
    if (existsSync(indexPath)) {
      try {
        index = JSON.parse(readFileSync(indexPath, 'utf-8'));
      } catch (error) {
        index = {};
      }
    }
    
    // Update category index
    if (!index.byCategory) index.byCategory = {};
    if (!index.byCategory[metadata.category]) index.byCategory[metadata.category] = [];
    index.byCategory[metadata.category].push(metadata.id);
    
    // Update framework index
    if (!index.byFramework) index.byFramework = {};
    metadata.frameworks.forEach(fw => {
      if (!index.byFramework[fw.name]) index.byFramework[fw.name] = [];
      index.byFramework[fw.name].push(metadata.id);
    });
    
    // Update type index
    if (!index.byType) index.byType = {};
    if (!index.byType[metadata.type]) index.byType[metadata.type] = [];
    index.byType[metadata.type].push(metadata.id);
    
    // Update tag index
    if (!index.byTag) index.byTag = {};
    metadata.tags.forEach(tag => {
      if (!index.byTag[tag]) index.byTag[tag] = [];
      index.byTag[tag].push(metadata.id);
    });
    
    // Save updated index
    writeFileSync(indexPath, JSON.stringify(index, null, 2));
  }
}