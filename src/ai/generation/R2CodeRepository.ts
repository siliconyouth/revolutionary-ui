/**
 * R2 Code Repository - Manages code storage and retrieval from Cloudflare R2
 */

import { R2StorageService } from '../../services/r2-storage-service';
import type {
  GeneratedComponent,
  CodeTemplate,
  StoredComponent,
  ExtractedPatterns,
  HookPattern,
  TypePattern,
  StatePattern,
  StylePattern,
  PerformancePattern,
  AccessibilityPattern,
} from './types';

interface ComponentMetadata {
  generatedAt: Date;
  framework: string;
  category: string;
  tags: string[];
  qualityScore: number;
  dependencies?: string[];
  performanceMetrics?: {
    renderTime: number;
    bundleSize: number;
    memoryUsage: number;
  };
}

export class R2CodeRepository {
  private r2Service: R2StorageService;

  constructor() {
    this.r2Service = R2StorageService.getInstance();
  }

  /**
   * Retrieve component code from R2
   */
  async retrieveComponentCode(componentId: string): Promise<{
    fullCode: string;
    patterns: ExtractedPatterns;
    dependencies: string[];
    performanceMetrics?: any;
  }> {
    try {
      // Fetch from R2
      const storedData = await this.r2Service.getObject(`components/${componentId}/code.tsx`);
      
      if (!storedData) {
        throw new Error(`Component ${componentId} not found in R2`);
      }

      const code = typeof storedData === 'string' ? storedData : await this.streamToString(storedData);
      
      // Extract patterns from code
      const patterns = this.extractPatterns(code);
      
      // Extract dependencies
      const dependencies = this.extractDependencies(code);
      
      // Try to fetch performance metrics
      let performanceMetrics;
      try {
        const metricsData = await this.r2Service.getObject(`components/${componentId}/metrics.json`);
        if (metricsData) {
          performanceMetrics = JSON.parse(
            typeof metricsData === 'string' ? metricsData : await this.streamToString(metricsData)
          );
        }
      } catch (error) {
        console.debug('No performance metrics found for component');
      }

      return {
        fullCode: code,
        patterns,
        dependencies,
        performanceMetrics,
      };
    } catch (error) {
      console.error('Error retrieving component code:', error);
      throw new Error(`Failed to retrieve component ${componentId}`);
    }
  }

  /**
   * Find templates for a category and framework
   */
  async findTemplates(category: string, framework: string): Promise<CodeTemplate[]> {
    try {
      const prefix = `templates/${framework}/${this.normalizeCategoryName(category)}/`;
      const templates: CodeTemplate[] = [];
      
      // List objects in the template directory
      const objects = await this.r2Service.listObjects(prefix);
      
      // Fetch each template
      for (const object of objects) {
        if (object.key.endsWith('.tsx') || object.key.endsWith('.vue') || object.key.endsWith('.svelte')) {
          try {
            const code = await this.r2Service.getObject(object.key);
            const codeString = typeof code === 'string' ? code : await this.streamToString(code);
            
            // Extract metadata from code comments
            const metadata = this.extractTemplateMetadata(codeString);
            
            templates.push({
              id: object.key,
              code: codeString,
              metadata: {
                framework,
                category,
                description: metadata.description || 'Template component',
                dependencies: this.extractDependencies(codeString),
              },
            });
          } catch (error) {
            console.warn(`Failed to fetch template ${object.key}:`, error);
          }
        }
      }
      
      console.log(`Found ${templates.length} templates for ${framework}/${category}`);
      return templates;
    } catch (error) {
      console.warn('Error finding templates:', error);
      return [];
    }
  }

  /**
   * Store generated component in R2
   */
  async storeGeneratedComponent(component: GeneratedComponent): Promise<string> {
    const componentId = this.generateComponentId(component);
    const timestamp = new Date();
    
    try {
      // Store component code
      await this.r2Service.putObject(
        `components/${componentId}/code.tsx`,
        component.code,
        {
          framework: component.framework,
          category: component.category || 'uncategorized',
          tags: (component.tags || []).join(','),
          generatedAt: timestamp.toISOString(),
          qualityScore: String(component.qualityScore || 0),
        }
      );
      
      // Store metadata
      const metadata: ComponentMetadata = {
        generatedAt: timestamp,
        framework: component.framework,
        category: component.category || 'uncategorized',
        tags: component.tags || [],
        qualityScore: component.qualityScore || 0,
        dependencies: component.dependencies,
      };
      
      await this.r2Service.putObject(
        `components/${componentId}/metadata.json`,
        JSON.stringify(metadata, null, 2),
        {
          contentType: 'application/json',
        }
      );
      
      // Store patterns for future learning
      const patterns = this.extractPatterns(component.code);
      await this.r2Service.putObject(
        `components/${componentId}/patterns.json`,
        JSON.stringify(patterns, null, 2),
        {
          contentType: 'application/json',
        }
      );
      
      // Update component index
      await this.updateComponentIndex(componentId, component);
      
      console.log(`✅ Stored component ${componentId} in R2`);
      return componentId;
    } catch (error) {
      console.error('Error storing component:', error);
      throw new Error('Failed to store component in R2');
    }
  }

  /**
   * Extract reusable patterns from code
   */
  extractPatterns(code: string): ExtractedPatterns {
    return {
      typePatterns: this.extractTypePatterns(code),
      hookPatterns: this.extractHookPatterns(code),
      statePatterns: this.extractStatePatterns(code),
      stylePatterns: this.extractStylePatterns(code),
      performancePatterns: this.extractPerformancePatterns(code),
      a11yPatterns: this.extractA11yPatterns(code),
    };
  }

  /**
   * Get stored components by category
   */
  async getStoredComponents(
    category: string,
    framework: string,
    limit: number = 10
  ): Promise<StoredComponent[]> {
    try {
      // Fetch component index
      const indexData = await this.r2Service.getObject('indexes/components.json');
      const index = JSON.parse(
        typeof indexData === 'string' ? indexData : await this.streamToString(indexData)
      );
      
      // Filter by category and framework
      const filtered = index.components
        .filter((c: any) => c.category === category && c.framework === framework)
        .sort((a: any, b: any) => b.qualityScore - a.qualityScore)
        .slice(0, limit);
      
      // Fetch full component data
      const components = await Promise.all(
        filtered.map(async (item: any) => {
          const { fullCode, patterns } = await this.retrieveComponentCode(item.id);
          return {
            id: item.id,
            code: fullCode,
            framework: item.framework,
            category: item.category,
            tags: item.tags,
            qualityScore: item.qualityScore,
            performanceMetrics: item.performanceMetrics,
          };
        })
      );
      
      return components;
    } catch (error) {
      console.warn('Error fetching stored components:', error);
      return [];
    }
  }

  /**
   * Search for patterns across all stored components
   */
  async searchPatterns(
    patternType: string,
    framework: string
  ): Promise<Array<{ pattern: any; frequency: number; examples: string[] }>> {
    try {
      const patternData = await this.r2Service.getObject(
        `analytics/patterns/${framework}/${patternType}.json`
      );
      
      if (!patternData) {
        return [];
      }
      
      const patterns = JSON.parse(
        typeof patternData === 'string' ? patternData : await this.streamToString(patternData)
      );
      
      return patterns.sort((a: any, b: any) => b.frequency - a.frequency);
    } catch (error) {
      console.warn('Error searching patterns:', error);
      return [];
    }
  }

  // Private helper methods

  private extractTypePatterns(code: string): TypePattern[] {
    const patterns: TypePattern[] = [];
    
    // Extract interface definitions
    const interfaceRegex = /interface\s+(\w+)\s*(?:<[^>]+>)?\s*{([^}]+)}/g;
    const interfaces = code.matchAll(interfaceRegex);
    
    for (const match of interfaces) {
      patterns.push({
        name: match[1],
        definition: match[0],
        usage: this.findUsages(code, match[1]),
      });
    }
    
    // Extract type aliases
    const typeRegex = /type\s+(\w+)\s*(?:<[^>]+>)?\s*=\s*([^;]+);/g;
    const types = code.matchAll(typeRegex);
    
    for (const match of types) {
      patterns.push({
        name: match[1],
        definition: match[0],
        usage: this.findUsages(code, match[1]),
      });
    }
    
    return patterns;
  }

  private extractHookPatterns(code: string): HookPattern[] {
    const patterns: HookPattern[] = [];
    
    // Custom hooks
    const customHookRegex = /const\s+(use\w+)\s*=\s*\(([^)]*)\)\s*(?::\s*[^{]+)?\s*=>\s*{([\s\S]*?)^}/gm;
    const customHooks = code.matchAll(customHookRegex);
    
    for (const match of customHooks) {
      patterns.push({
        name: match[1],
        params: match[2].trim(),
        implementation: match[3].trim(),
        type: 'custom',
      });
    }
    
    // Built-in hook patterns
    const builtInHooks = [
      { regex: /useEffect\(\(\)\s*=>\s*{([\s\S]*?)},\s*\[([^\]]*)\]\)/g, type: 'effect' },
      { regex: /useState(?:<[^>]+>)?\(([^)]*)\)/g, type: 'state' },
      { regex: /useMemo\(\(\)\s*=>\s*([\s\S]*?),\s*\[([^\]]*)\]\)/g, type: 'memo' },
      { regex: /useCallback\(\((.*?)\)\s*=>\s*{([\s\S]*?)},\s*\[([^\]]*)\]\)/g, type: 'callback' },
    ];
    
    for (const { regex, type } of builtInHooks) {
      const matches = code.matchAll(regex);
      for (const match of matches) {
        patterns.push({
          name: type,
          implementation: match[1] || match[0],
          dependencies: match[2] || match[3],
          type: type as any,
        });
      }
    }
    
    return patterns;
  }

  private extractStatePatterns(code: string): StatePattern[] {
    const patterns: StatePattern[] = [];
    
    // Local state
    if (code.includes('useState')) {
      patterns.push({
        type: 'local',
        implementation: 'React.useState',
      });
    }
    
    // Context
    if (code.includes('useContext') || code.includes('createContext')) {
      patterns.push({
        type: 'context',
        implementation: 'React Context API',
      });
    }
    
    // Redux
    if (code.includes('useSelector') || code.includes('useDispatch')) {
      patterns.push({
        type: 'redux',
        implementation: 'Redux Toolkit',
      });
    }
    
    // Global state management
    if (code.includes('atom') || code.includes('useRecoilState')) {
      patterns.push({
        type: 'global',
        implementation: 'Recoil',
      });
    }
    
    return patterns;
  }

  private extractStylePatterns(code: string): StylePattern[] {
    const patterns: StylePattern[] = [];
    
    // CSS Modules
    if (code.includes('styles.') || code.includes('.module.css')) {
      patterns.push({
        type: 'css',
        implementation: 'CSS Modules',
      });
    }
    
    // Tailwind
    if (code.includes('className=') && code.match(/className=["'][^"']*\b(w-|h-|p-|m-|flex|grid)/)) {
      patterns.push({
        type: 'tailwind',
        implementation: 'Tailwind CSS',
      });
    }
    
    // Styled Components
    if (code.includes('styled.') || code.includes('styled(')) {
      patterns.push({
        type: 'styled-components',
        implementation: 'Styled Components',
      });
    }
    
    // CSS-in-JS
    if (code.includes('css`') || code.includes('@emotion')) {
      patterns.push({
        type: 'css-in-js',
        implementation: 'Emotion',
      });
    }
    
    return patterns;
  }

  private extractPerformancePatterns(code: string): PerformancePattern[] {
    const patterns: PerformancePattern[] = [];
    
    // Memoization
    if (code.includes('React.memo') || code.includes('useMemo')) {
      patterns.push({
        type: 'memoization',
        implementation: code.includes('React.memo') ? 'React.memo' : 'useMemo',
      });
    }
    
    // Lazy loading
    if (code.includes('React.lazy') || code.includes('lazy(')) {
      patterns.push({
        type: 'lazy-loading',
        implementation: 'React.lazy',
      });
    }
    
    // Virtualization
    if (code.includes('react-window') || code.includes('react-virtualized')) {
      patterns.push({
        type: 'virtualization',
        implementation: 'List virtualization',
      });
    }
    
    // Debouncing
    if (code.includes('debounce') || code.includes('throttle')) {
      patterns.push({
        type: 'debouncing',
        implementation: 'Event debouncing',
      });
    }
    
    return patterns;
  }

  private extractA11yPatterns(code: string): AccessibilityPattern[] {
    const patterns: AccessibilityPattern[] = [];
    
    // ARIA attributes
    if (code.match(/aria-\w+=/)) {
      patterns.push({
        type: 'aria',
        implementation: 'ARIA attributes',
      });
    }
    
    // Keyboard handling
    if (code.includes('onKeyDown') || code.includes('onKeyPress')) {
      patterns.push({
        type: 'keyboard',
        implementation: 'Keyboard event handlers',
      });
    }
    
    // Screen reader support
    if (code.includes('sr-only') || code.includes('visually-hidden')) {
      patterns.push({
        type: 'screen-reader',
        implementation: 'Screen reader only content',
      });
    }
    
    // Focus management
    if (code.includes('focus') || code.includes('tabIndex')) {
      patterns.push({
        type: 'focus-management',
        implementation: 'Focus management',
      });
    }
    
    return patterns;
  }

  private extractDependencies(code: string): string[] {
    const dependencies = new Set<string>();
    
    // Extract import statements
    const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;
    const matches = code.matchAll(importRegex);
    
    for (const match of matches) {
      const dep = match[1];
      // Filter out relative imports and built-in modules
      if (!dep.startsWith('.') && !dep.startsWith('@/') && !['react', 'vue', 'angular'].includes(dep)) {
        dependencies.add(dep);
      }
    }
    
    return Array.from(dependencies);
  }

  private extractTemplateMetadata(code: string): { description?: string } {
    const metadata: { description?: string } = {};
    
    // Look for JSDoc comments at the top
    const jsdocRegex = /^\/\*\*\s*\n([^*]|\*[^/])*\*\//;
    const match = code.match(jsdocRegex);
    
    if (match) {
      const comment = match[0];
      const descMatch = comment.match(/@description\s+(.+)/);
      if (descMatch) {
        metadata.description = descMatch[1].trim();
      }
    }
    
    return metadata;
  }

  private findUsages(code: string, typeName: string): string[] {
    const usages: string[] = [];
    const regex = new RegExp(`\\b${typeName}\\b`, 'g');
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      if (regex.test(line) && !line.includes(`interface ${typeName}`) && !line.includes(`type ${typeName}`)) {
        usages.push(`Line ${index + 1}: ${line.trim()}`);
      }
    });
    
    return usages.slice(0, 5); // Limit to 5 examples
  }

  private generateComponentId(component: GeneratedComponent): string {
    const timestamp = Date.now();
    const framework = component.framework.toLowerCase();
    const category = (component.category || 'general').toLowerCase().replace(/\s+/g, '-');
    const random = Math.random().toString(36).substring(2, 8);
    
    return `${framework}-${category}-${timestamp}-${random}`;
  }

  private normalizeCategoryName(category: string): string {
    return category.toLowerCase().replace(/\s+&?\s*/g, '-');
  }

  private async streamToString(stream: ReadableStream): Promise<string> {
    const reader = stream.getReader();
    let result = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
      }
    } finally {
      reader.releaseLock();
    }
    
    return result;
  }

  private async updateComponentIndex(componentId: string, component: GeneratedComponent): Promise<void> {
    try {
      // Fetch existing index
      let index: any;
      try {
        const indexData = await this.r2Service.getObject('indexes/components.json');
        index = JSON.parse(
          typeof indexData === 'string' ? indexData : await this.streamToString(indexData)
        );
      } catch {
        // Create new index if it doesn't exist
        index = { components: [], lastUpdated: new Date().toISOString() };
      }
      
      // Add new component
      index.components.push({
        id: componentId,
        framework: component.framework,
        category: component.category || 'uncategorized',
        tags: component.tags || [],
        qualityScore: component.qualityScore || 0,
        generatedAt: new Date().toISOString(),
      });
      
      // Update index
      index.lastUpdated = new Date().toISOString();
      
      // Store updated index
      await this.r2Service.putObject(
        'indexes/components.json',
        JSON.stringify(index, null, 2),
        {
          contentType: 'application/json',
        }
      );
    } catch (error) {
      console.warn('Failed to update component index:', error);
    }
  }
}