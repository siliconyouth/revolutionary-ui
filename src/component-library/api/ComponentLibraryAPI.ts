import { 
  ComponentMetadata, 
  ComponentSearchQuery, 
  ComponentLibraryStats,
  ComponentCategory,
  ComponentType 
} from '../models/Component';
import { ComponentCatalogService } from '../services/ComponentCatalogService';
import { ComponentAnalyzer } from '../services/ComponentAnalyzer';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

export interface ComponentLibraryOptions {
  libraryPath?: string;
  autoAnalyze?: boolean;
  enableAI?: boolean;
}

export class ComponentLibraryAPI {
  private catalogService: ComponentCatalogService;
  private analyzer: ComponentAnalyzer;
  private libraryPath: string;
  private options: ComponentLibraryOptions;
  
  constructor(options: ComponentLibraryOptions = {}) {
    this.options = {
      libraryPath: join(process.cwd(), 'component-library'),
      autoAnalyze: true,
      enableAI: true,
      ...options
    };
    
    this.libraryPath = this.options.libraryPath!;
    this.catalogService = new ComponentCatalogService();
    this.analyzer = new ComponentAnalyzer();
  }
  
  // Search and Query Methods
  
  async search(query: ComponentSearchQuery): Promise<ComponentMetadata[]> {
    const results: ComponentMetadata[] = [];
    const components = await this.getAllComponents();
    
    for (const component of components) {
      if (this.matchesQuery(component, query)) {
        results.push(component);
      }
    }
    
    // Sort results
    return this.sortResults(results, query.sortBy);
  }
  
  async findById(id: string): Promise<ComponentMetadata | null> {
    const dbPath = join(this.libraryPath, 'components.db.json');
    
    if (!existsSync(dbPath)) {
      return null;
    }
    
    try {
      const data = JSON.parse(readFileSync(dbPath, 'utf-8'));
      return data[id] || null;
    } catch (error) {
      return null;
    }
  }
  
  async findByCategory(category: ComponentCategory): Promise<ComponentMetadata[]> {
    return this.search({ category });
  }
  
  async findByType(type: ComponentType): Promise<ComponentMetadata[]> {
    return this.search({ type });
  }
  
  async findByFramework(framework: string): Promise<ComponentMetadata[]> {
    return this.search({ frameworks: [framework] });
  }
  
  async findByTags(tags: string[]): Promise<ComponentMetadata[]> {
    return this.search({ tags });
  }
  
  async findSimilar(componentId: string): Promise<ComponentMetadata[]> {
    const component = await this.findById(componentId);
    if (!component) return [];
    
    const allComponents = await this.getAllComponents();
    const similarIds = await this.analyzer.findSimilarComponents(component, allComponents);
    
    return similarIds
      .map(id => allComponents.find(c => c.id === id))
      .filter(Boolean) as ComponentMetadata[];
  }
  
  // Component Management Methods
  
  async addComponent(
    componentData: any,
    sourceInfo?: {
      url?: string;
      extractionMethod?: 'playwright' | 'firecrawl' | 'both';
    }
  ): Promise<ComponentMetadata> {
    // If it's a generated component, catalog it
    if (componentData.files && componentData.framework) {
      return this.catalogService.catalogComponent(componentData, {
        url: sourceInfo?.url,
        extractionMethod: sourceInfo?.extractionMethod
      });
    }
    
    // Otherwise, analyze and catalog raw component
    const analysis = await this.analyzer.analyzeComponent(
      componentData.code || componentData.component || componentData,
      componentData.name || 'Unknown Component',
      {
        framework: componentData.framework,
        sourceUrl: sourceInfo?.url
      }
    );
    
    // Create a generated component structure
    const generatedComponent = {
      name: componentData.name || analysis.type,
      framework: componentData.framework || 'vanilla',
      files: {
        component: componentData.code || componentData,
        styles: componentData.styles || '',
        documentation: componentData.documentation || `# ${componentData.name}\n\nComponent documentation.`
      },
      structure: {
        imports: [],
        props: [],
        state: [],
        methods: [],
        hooks: []
      }
    };
    
    return this.catalogService.catalogComponent(generatedComponent, sourceInfo);
  }
  
  async updateComponent(id: string, updates: Partial<ComponentMetadata>): Promise<ComponentMetadata | null> {
    const component = await this.findById(id);
    if (!component) return null;
    
    const updated = {
      ...component,
      ...updates,
      updatedAt: new Date()
    };
    
    // Save to database
    const dbPath = join(this.libraryPath, 'components.db.json');
    const data = JSON.parse(readFileSync(dbPath, 'utf-8'));
    data[id] = updated;
    writeFileSync(dbPath, JSON.stringify(data, null, 2));
    
    return updated;
  }
  
  async deleteComponent(id: string): Promise<boolean> {
    const dbPath = join(this.libraryPath, 'components.db.json');
    
    if (!existsSync(dbPath)) return false;
    
    try {
      const data = JSON.parse(readFileSync(dbPath, 'utf-8'));
      if (!data[id]) return false;
      
      delete data[id];
      writeFileSync(dbPath, JSON.stringify(data, null, 2));
      
      // TODO: Also delete component files
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Usage and Popularity Methods
  
  async trackUsage(componentId: string): Promise<void> {
    const component = await this.findById(componentId);
    if (!component) return;
    
    await this.updateComponent(componentId, {
      usageCount: component.usageCount + 1,
      lastUsedAt: new Date()
    });
  }
  
  async getPopularComponents(limit: number = 10): Promise<ComponentMetadata[]> {
    const components = await this.getAllComponents();
    return components
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }
  
  async getFeaturedComponents(): Promise<ComponentMetadata[]> {
    const components = await this.getAllComponents();
    return components.filter(c => c.featured);
  }
  
  async getRecentComponents(limit: number = 10): Promise<ComponentMetadata[]> {
    const components = await this.getAllComponents();
    return components
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  
  // Statistics Methods
  
  async getStats(): Promise<ComponentLibraryStats> {
    const components = await this.getAllComponents();
    
    const byCategory: Record<ComponentCategory, number> = {} as any;
    const byFramework: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    
    let totalQuality = 0;
    
    for (const component of components) {
      // Category stats
      byCategory[component.category] = (byCategory[component.category] || 0) + 1;
      
      // Framework stats
      component.frameworks.forEach(fw => {
        byFramework[fw.name] = (byFramework[fw.name] || 0) + 1;
      });
      
      // Source stats
      bySource[component.source.type] = (bySource[component.source.type] || 0) + 1;
      
      // Quality stats
      totalQuality += component.quality.score;
    }
    
    return {
      totalComponents: components.length,
      byCategory,
      byFramework,
      bySource,
      averageQuality: components.length > 0 ? Math.round(totalQuality / components.length) : 0,
      lastUpdated: new Date()
    };
  }
  
  // Export and Import Methods
  
  async exportComponent(componentId: string): Promise<any> {
    const component = await this.findById(componentId);
    if (!component) return null;
    
    const componentDir = join(this.libraryPath, 'components', componentId);
    const files: Record<string, string> = {};
    
    // Read all component files
    if (component.files.main && existsSync(join(componentDir, component.files.main))) {
      files.main = readFileSync(join(componentDir, component.files.main), 'utf-8');
    }
    
    if (component.files.styles) {
      component.files.styles.forEach(styleFile => {
        const path = join(componentDir, styleFile);
        if (existsSync(path)) {
          files[styleFile] = readFileSync(path, 'utf-8');
        }
      });
    }
    
    if (component.files.types && existsSync(join(componentDir, component.files.types))) {
      files.types = readFileSync(join(componentDir, component.files.types), 'utf-8');
    }
    
    return {
      metadata: component,
      files
    };
  }
  
  async importComponent(componentPackage: any): Promise<ComponentMetadata> {
    // Validate package structure
    if (!componentPackage.metadata || !componentPackage.files) {
      throw new Error('Invalid component package structure');
    }
    
    // Create component structure
    const component = {
      name: componentPackage.metadata.name,
      framework: componentPackage.metadata.frameworks[0]?.name || 'vanilla',
      files: componentPackage.files,
      structure: {
        imports: [],
        props: componentPackage.metadata.structure?.props || [],
        state: componentPackage.metadata.structure?.state || [],
        methods: componentPackage.metadata.structure?.methods || [],
        hooks: componentPackage.metadata.structure?.hooks || []
      }
    };
    
    return this.catalogService.catalogComponent(component, {
      url: componentPackage.metadata.source?.url
    });
  }
  
  // Private Helper Methods
  
  private async getAllComponents(): Promise<ComponentMetadata[]> {
    const dbPath = join(this.libraryPath, 'components.db.json');
    
    if (!existsSync(dbPath)) {
      return [];
    }
    
    try {
      const data = JSON.parse(readFileSync(dbPath, 'utf-8'));
      return Object.values(data).map(this.deserializeComponent);
    } catch (error) {
      return [];
    }
  }
  
  private deserializeComponent(data: any): ComponentMetadata {
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      lastUsedAt: data.lastUsedAt ? new Date(data.lastUsedAt) : undefined
    };
  }
  
  private matchesQuery(component: ComponentMetadata, query: ComponentSearchQuery): boolean {
    // Text search
    if (query.query) {
      const searchText = query.query.toLowerCase();
      if (!component.searchableText.includes(searchText)) {
        return false;
      }
    }
    
    // Category filter
    if (query.category && component.category !== query.category) {
      return false;
    }
    
    // Type filter
    if (query.type && component.type !== query.type) {
      return false;
    }
    
    // Framework filter
    if (query.frameworks && query.frameworks.length > 0) {
      const hasFramework = query.frameworks.some(fw => 
        component.frameworks.some(cf => cf.name === fw)
      );
      if (!hasFramework) return false;
    }
    
    // Tag filter
    if (query.tags && query.tags.length > 0) {
      const hasAllTags = query.tags.every(tag => component.tags.includes(tag));
      if (!hasAllTags) return false;
    }
    
    // Quality filter
    if (query.minQuality && component.quality.score < query.minQuality) {
      return false;
    }
    
    return true;
  }
  
  private sortResults(results: ComponentMetadata[], sortBy?: string): ComponentMetadata[] {
    switch (sortBy) {
      case 'popularity':
        return results.sort((a, b) => b.usageCount - a.usageCount);
      case 'quality':
        return results.sort((a, b) => b.quality.score - a.quality.score);
      case 'recent':
        return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'name':
        return results.sort((a, b) => a.displayName.localeCompare(b.displayName));
      default:
        return results;
    }
  }
  
  // Batch Operations
  
  async batchImport(components: any[]): Promise<ComponentMetadata[]> {
    const imported: ComponentMetadata[] = [];
    
    for (const component of components) {
      try {
        const metadata = await this.addComponent(component);
        imported.push(metadata);
      } catch (error) {
        console.error(chalk.red(`Failed to import component: ${error}`));
      }
    }
    
    return imported;
  }
  
  async batchUpdate(updates: Array<{ id: string; updates: Partial<ComponentMetadata> }>): Promise<number> {
    let updated = 0;
    
    for (const { id, updates: componentUpdates } of updates) {
      const result = await this.updateComponent(id, componentUpdates);
      if (result) updated++;
    }
    
    return updated;
  }
  
  async batchDelete(ids: string[]): Promise<number> {
    let deleted = 0;
    
    for (const id of ids) {
      const result = await this.deleteComponent(id);
      if (result) deleted++;
    }
    
    return deleted;
  }
}