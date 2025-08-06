/**
 * Context Builder - Aggregates context from all sources
 */

import { DatabaseContextBuilder } from './DatabaseContextBuilder';
import { HybridSearchSystem } from './HybridSearchSystem';
import { R2CodeRepository } from './R2CodeRepository';
import { DocumentationIntegration } from './DocumentationIntegration';
import type {
  GenerationRequest,
  EnhancedGenerationContext,
  DatabaseContext,
  SearchContext,
  CodeContext,
  DocumentationContext,
} from './types';

interface GenerationInsights {
  popularPatterns: string[];
  commonPitfalls: string[];
  performanceOptimizations: string[];
  accessibilityFeatures: string[];
}

interface GenerationRecommendations {
  suggestedFeatures: string[];
  bestPractices: string[];
  avoidPatterns: string[];
}

export class ContextBuilder {
  private dbBuilder: DatabaseContextBuilder;
  private searchSystem: HybridSearchSystem;
  private codeRepository: R2CodeRepository;
  private docIntegration: DocumentationIntegration;

  constructor() {
    this.dbBuilder = new DatabaseContextBuilder();
    this.searchSystem = new HybridSearchSystem();
    this.codeRepository = new R2CodeRepository();
    this.docIntegration = new DocumentationIntegration();
  }

  /**
   * Build comprehensive context from all sources
   */
  async buildContext(request: GenerationRequest): Promise<EnhancedGenerationContext & {
    insights: GenerationInsights;
    recommendations: GenerationRecommendations;
  }> {
    console.log('🔨 Building comprehensive context...');

    // Run all context gathering in parallel
    const [dbContext, searchContext, codeContext, docContext] = await Promise.all([
      this.buildDatabaseContext(request),
      this.buildSearchContext(request),
      this.buildCodeContext(request),
      this.buildDocumentationContext(request),
    ]);

    // Merge contexts
    const mergedContext: EnhancedGenerationContext = {
      database: dbContext,
      search: searchContext,
      code: codeContext,
      documentation: docContext,
    };

    // Generate insights
    const insights = await this.generateInsights(mergedContext);

    // Generate recommendations
    const recommendations = this.generateRecommendations(insights);

    console.log('✅ Context building complete');
    console.log(`   Database: ${dbContext.similarComponents.length} similar components`);
    console.log(`   Search: ${searchContext.vectorMatches.length} vector matches`);
    console.log(`   Code: ${codeContext.templates.length} templates found`);
    console.log(`   Docs: ${docContext.officialDocs.length} documentation pages`);

    return {
      ...mergedContext,
      insights,
      recommendations,
    };
  }

  /**
   * Build database context
   */
  private async buildDatabaseContext(request: GenerationRequest): Promise<DatabaseContext> {
    return this.dbBuilder.buildContext(request);
  }

  /**
   * Build search context
   */
  private async buildSearchContext(request: GenerationRequest): Promise<SearchContext> {
    const searchResults = await this.searchSystem.findSimilarComponents(request);
    
    // Extract vector and keyword matches
    const vectorMatches = searchResults.results
      .filter(r => r.metadata?.source === 'vector')
      .map(r => ({
        id: r.id,
        score: r.score,
        metadata: r.metadata,
      }));

    const keywordMatches = searchResults.results
      .filter(r => r.metadata?.source === 'algolia')
      .map(r => ({
        id: r.id,
        type: 'component' as const,
        title: r.title || '',
        description: r.description || '',
        framework: r.framework,
        category: r.category,
        tags: r.tags,
        score: r.score,
      }));

    // Create relevance scores map
    const relevanceScores = new Map<string, number>();
    searchResults.results.forEach(r => {
      relevanceScores.set(r.id, r.score);
    });

    return {
      vectorMatches,
      keywordMatches,
      relevanceScores,
    };
  }

  /**
   * Build code context
   */
  private async buildCodeContext(request: GenerationRequest): Promise<CodeContext> {
    const framework = request.framework || 'react';
    const category = request.category || this.inferCategory(request.prompt);

    // Get templates and stored components
    const [templates, storedComponents] = await Promise.all([
      this.codeRepository.findTemplates(category, framework),
      this.codeRepository.getStoredComponents(category, framework, 5),
    ]);

    // Get design tokens (mock for now)
    const designTokens = this.getDefaultDesignTokens();

    return {
      templates,
      implementations: storedComponents,
      designTokens,
    };
  }

  /**
   * Build documentation context
   */
  private async buildDocumentationContext(request: GenerationRequest): Promise<DocumentationContext> {
    const framework = request.framework || 'react';
    const componentType = this.inferComponentType(request.prompt);

    const docs = await this.docIntegration.fetchFrameworkDocs(framework, componentType);

    return {
      officialDocs: docs.sections.map(section => ({
        framework,
        topic: componentType,
        content: section.content,
        examples: section.examples || [],
        url: section.url || '',
      })),
      bestPractices: docs.bestPractices || [],
      apiReferences: docs.apiReferences || [],
    };
  }

  /**
   * Generate insights from context
   */
  private async generateInsights(context: EnhancedGenerationContext): Promise<GenerationInsights> {
    const popularPatterns = this.analyzePopularPatterns(context.database.similarComponents);
    const commonPitfalls = this.identifyCommonPitfalls(context.search.vectorMatches);
    const performanceOptimizations = this.extractPerformanceOptimizations(context.code.templates);
    const accessibilityFeatures = this.extractAccessibilityFeatures(
      context.database.similarComponents.filter(c => c.rating >= 4.5)
    );

    return {
      popularPatterns,
      commonPitfalls,
      performanceOptimizations,
      accessibilityFeatures,
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(insights: GenerationInsights): GenerationRecommendations {
    const suggestedFeatures = this.suggestFeatures(insights.popularPatterns);
    const bestPractices = this.compileBestPractices(insights);
    const avoidPatterns = this.identifyAntiPatterns(insights.commonPitfalls);

    return {
      suggestedFeatures,
      bestPractices,
      avoidPatterns,
    };
  }

  // Helper methods

  private analyzePopularPatterns(components: any[]): string[] {
    const patterns: Map<string, number> = new Map();

    components.forEach(component => {
      // Analyze tags
      component.tags?.forEach((tag: any) => {
        const tagName = typeof tag === 'string' ? tag : tag.name;
        patterns.set(tagName, (patterns.get(tagName) || 0) + 1);
      });
    });

    // Sort by frequency and return top patterns
    return Array.from(patterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([pattern]) => pattern);
  }

  private identifyCommonPitfalls(vectorMatches: any[]): string[] {
    const pitfalls: string[] = [];

    // Analyze low-scoring matches for common issues
    const lowScoring = vectorMatches.filter(m => m.score < 0.5);
    
    if (lowScoring.length > 0) {
      pitfalls.push('Component naming inconsistency');
      pitfalls.push('Missing TypeScript types');
      pitfalls.push('Inadequate error handling');
    }

    return pitfalls;
  }

  private extractPerformanceOptimizations(templates: any[]): string[] {
    const optimizations = new Set<string>();

    templates.forEach(template => {
      const code = template.code;
      
      if (code.includes('React.memo')) optimizations.add('Component memoization');
      if (code.includes('useMemo')) optimizations.add('Expensive computation memoization');
      if (code.includes('useCallback')) optimizations.add('Callback memoization');
      if (code.includes('lazy')) optimizations.add('Code splitting');
      if (code.includes('Suspense')) optimizations.add('Suspense boundaries');
    });

    return Array.from(optimizations);
  }

  private extractAccessibilityFeatures(components: any[]): string[] {
    const features = new Set<string>();

    components.forEach(component => {
      const tags = component.tags?.map((t: any) => typeof t === 'string' ? t : t.name) || [];
      
      if (tags.includes('accessible')) features.add('Full accessibility support');
      if (tags.includes('aria')) features.add('ARIA attributes');
      if (tags.includes('keyboard-navigation')) features.add('Keyboard navigation');
      if (tags.includes('screen-reader')) features.add('Screen reader support');
    });

    return Array.from(features);
  }

  private suggestFeatures(patterns: string[]): string[] {
    const suggestions: string[] = [];

    if (patterns.includes('form')) {
      suggestions.push('Form validation');
      suggestions.push('Error handling');
      suggestions.push('Loading states');
    }

    if (patterns.includes('data-display')) {
      suggestions.push('Pagination');
      suggestions.push('Sorting');
      suggestions.push('Filtering');
    }

    if (patterns.includes('interactive')) {
      suggestions.push('Keyboard shortcuts');
      suggestions.push('Touch gestures');
      suggestions.push('Animations');
    }

    return suggestions;
  }

  private compileBestPractices(insights: GenerationInsights): string[] {
    const practices: string[] = [];

    if (insights.performanceOptimizations.length > 0) {
      practices.push('Use memoization for expensive operations');
      practices.push('Implement code splitting for large components');
    }

    if (insights.accessibilityFeatures.length > 0) {
      practices.push('Include ARIA labels for all interactive elements');
      practices.push('Ensure keyboard navigation support');
    }

    practices.push('Use TypeScript for type safety');
    practices.push('Follow framework-specific conventions');
    practices.push('Include comprehensive error handling');

    return practices;
  }

  private identifyAntiPatterns(pitfalls: string[]): string[] {
    const antiPatterns: string[] = [];

    pitfalls.forEach(pitfall => {
      if (pitfall.includes('naming')) {
        antiPatterns.push('Inconsistent component naming');
      }
      if (pitfall.includes('TypeScript')) {
        antiPatterns.push('Using any type');
      }
      if (pitfall.includes('error')) {
        antiPatterns.push('Silent error failures');
      }
    });

    antiPatterns.push('Inline function definitions in render');
    antiPatterns.push('Direct DOM manipulation in frameworks');
    antiPatterns.push('Neglecting loading and error states');

    return antiPatterns;
  }

  private inferCategory(prompt: string): string {
    const lowercasePrompt = prompt.toLowerCase();
    
    if (lowercasePrompt.includes('form') || lowercasePrompt.includes('input')) {
      return 'Forms & Inputs';
    }
    if (lowercasePrompt.includes('table') || lowercasePrompt.includes('grid') || lowercasePrompt.includes('list')) {
      return 'Data Display';
    }
    if (lowercasePrompt.includes('nav') || lowercasePrompt.includes('menu')) {
      return 'Navigation';
    }
    if (lowercasePrompt.includes('chart') || lowercasePrompt.includes('graph')) {
      return 'Data Visualization';
    }
    if (lowercasePrompt.includes('dashboard') || lowercasePrompt.includes('admin')) {
      return 'Admin & Dashboard';
    }
    if (lowercasePrompt.includes('modal') || lowercasePrompt.includes('dialog')) {
      return 'Overlays';
    }
    
    return 'Layout';
  }

  private inferComponentType(prompt: string): string {
    const lowercasePrompt = prompt.toLowerCase();
    
    if (lowercasePrompt.includes('form') || lowercasePrompt.includes('input')) return 'form';
    if (lowercasePrompt.includes('table') || lowercasePrompt.includes('grid')) return 'table';
    if (lowercasePrompt.includes('chart') || lowercasePrompt.includes('graph')) return 'chart';
    if (lowercasePrompt.includes('modal') || lowercasePrompt.includes('dialog')) return 'modal';
    if (lowercasePrompt.includes('nav') || lowercasePrompt.includes('menu')) return 'navigation';
    if (lowercasePrompt.includes('card') || lowercasePrompt.includes('tile')) return 'card';
    if (lowercasePrompt.includes('dashboard')) return 'dashboard';
    if (lowercasePrompt.includes('button')) return 'button';
    
    return 'component';
  }

  private getDefaultDesignTokens(): any[] {
    return [{
      id: 'default',
      name: 'Default Design System',
      frameworks: ['react', 'vue', 'angular', 'svelte'],
      colorPalettes: [{
        name: 'default',
        colors: {
          primary: '#3b82f6',
          secondary: '#6366f1',
          accent: '#8b5cf6',
          neutral: '#6b7280',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      }],
      typographyScales: [{
        name: 'default',
        sizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
        },
        lineHeights: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75',
        },
        fontWeights: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
      }],
      spacingSystems: [{
        base: 4,
        scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64],
      }],
      componentTokens: [],
    }];
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await Promise.all([
      this.dbBuilder.cleanup(),
      this.searchSystem.cleanup(),
    ]);
  }
}