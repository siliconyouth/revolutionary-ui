/**
 * UI Generation Engine for Revolutionary UI Factory
 * Implements advanced component generation with evaluation and streaming
 */

import { aiProviderManager } from './providers';
import { 
  COMPONENT_TEMPLATES, 
  UIGenerationContext, 
  createContextualPrompt,
  ComponentTemplate
} from './ui-generation-system-prompt';

export interface GenerationRequest {
  prompt: string;
  componentType?: keyof typeof COMPONENT_TEMPLATES;
  context?: UIGenerationContext;
  provider?: string;
  model?: string;
}

export interface GeneratedComponent {
  code: string;
  dependencies: string[];
  imports: string[];
  hasTypeScript: boolean;
  framework: string;
}

export interface ComponentEvaluation {
  typeScriptScore: number;
  accessibilityScore: number;
  performanceScore: number;
  designScore: number;
  overall: number;
  details: {
    typeScriptDetails: string;
    accessibilityDetails: string;
    performanceDetails: string;
    designDetails: string;
  };
}

export interface GenerationResult {
  component: GeneratedComponent;
  evaluation: ComponentEvaluation;
  suggestions: string[];
  metadata: {
    generationTime: number;
    provider: string;
    model: string;
    componentType: string;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
  };
}

export interface StreamChunk {
  content: string;
  isComplete: boolean;
  evaluation?: ComponentEvaluation;
  suggestions?: string[];
}

export class UIGenerationEngine {
  /**
   * Generate a UI component with evaluation
   */
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();
    
    // Determine component type
    const componentType = request.componentType || this.detectComponentType(request.prompt);
    
    // Build contextual prompt
    const contextualPrompt = createContextualPrompt(
      request.prompt,
      componentType,
      request.context
    );
    
    // Get AI provider
    const provider = request.provider || 'OpenAI';
    const aiProvider = aiProviderManager.getProvider(provider);
    
    // Generate component
    const response = await aiProvider.generateComponent(contextualPrompt, {
      ...request.context,
      componentType,
      framework: request.context.project?.framework || 'React'
    });
    
    // Parse and analyze the generated code
    const component = this.parseComponent(response.content);
    
    // Evaluate the component
    const evaluation = await this.evaluateComponent(component.code);
    
    // Generate improvement suggestions
    const suggestions = this.generateSuggestions(component, evaluation);
    
    return {
      component,
      evaluation,
      suggestions,
      metadata: {
        generationTime: Date.now() - startTime,
        provider,
        model: response.model,
        componentType,
        tokenUsage: {
          prompt: response.usage?.promptTokens || 0,
          completion: response.usage?.completionTokens || 0,
          total: response.usage?.totalTokens || 0
        }
      }
    };
  }

  /**
   * Stream component generation
   */
  async generateStream(
    request: GenerationRequest,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    const componentType = request.componentType || this.detectComponentType(request.prompt);
    
    const contextualPrompt = createContextualPrompt(
      request.prompt,
      componentType,
      request.context
    );
    
    const provider = request.provider || 'OpenAI';
    const aiProvider = aiProviderManager.getProvider(provider);
    
    let fullContent = '';
    
    await aiProvider.generateComponentStream(
      contextualPrompt,
      {
        ...request.context,
        componentType,
        framework: request.context.project?.framework || 'React'
      },
      async (chunk) => {
        fullContent += chunk.content;
        
        if (chunk.isComplete) {
          // Parse and evaluate the complete component
          const component = this.parseComponent(fullContent);
          const evaluation = await this.evaluateComponent(component.code);
          const suggestions = this.generateSuggestions(component, evaluation);
          
          onChunk({
            content: chunk.content,
            isComplete: true,
            evaluation,
            suggestions
          });
        } else {
          onChunk({
            content: chunk.content,
            isComplete: false
          });
        }
      }
    );
  }

  /**
   * Detect component type from prompt
   */
  private detectComponentType(prompt: string): keyof typeof COMPONENT_TEMPLATES {
    const lowercasePrompt = prompt.toLowerCase();
    
    // Check for specific component mentions
    const typeChecks: Array<[keyof typeof COMPONENT_TEMPLATES, string[]]> = [
      ['form', ['form', 'input', 'field', 'validation', 'submit']],
      ['table', ['table', 'grid', 'data', 'rows', 'columns']],
      ['dashboard', ['dashboard', 'analytics', 'metrics', 'widgets']],
      ['modal', ['modal', 'dialog', 'popup', 'overlay']],
      ['navigation', ['nav', 'menu', 'header', 'sidebar']],
      ['card', ['card', 'tile', 'preview']],
      ['chart', ['chart', 'graph', 'visualization', 'plot']],
      ['notification', ['notification', 'alert', 'toast', 'message']],
      ['pricing', ['pricing', 'plans', 'subscription', 'tiers']],
      ['testimonial', ['testimonial', 'review', 'feedback', 'quote']],
      ['footer', ['footer', 'bottom', 'copyright']],
      ['hero', ['hero', 'banner', 'landing', 'header']],
      ['feature', ['feature', 'benefit', 'capability']],
      ['gallery', ['gallery', 'images', 'photos', 'portfolio']],
      ['timeline', ['timeline', 'history', 'roadmap', 'milestone']],
      ['stats', ['stats', 'statistics', 'numbers', 'metrics']],
      ['cta', ['cta', 'call to action', 'convert', 'signup']],
      ['faq', ['faq', 'questions', 'answers', 'help']]
    ];
    
    for (const [type, keywords] of typeChecks) {
      if (keywords.some(keyword => lowercasePrompt.includes(keyword))) {
        return type;
      }
    }
    
    return 'component'; // Default fallback
  }

  /**
   * Parse generated code to extract component details
   */
  private parseComponent(code: string): GeneratedComponent {
    // Extract imports
    const importRegex = /import\s+(?:{[^}]+}|[\w\s,]+)\s+from\s+['"]([^'"]+)['"]/g;
    const imports: string[] = [];
    const dependencies: string[] = [];
    
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const importPath = match[1];
      imports.push(importPath);
      
      // If it's not a relative import, it's a dependency
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        dependencies.push(importPath);
      }
    }
    
    // Detect framework
    let framework = 'React'; // Default
    if (imports.includes('react')) {
      framework = 'React';
    } else if (imports.includes('vue')) {
      framework = 'Vue';
    } else if (imports.includes('@angular/core')) {
      framework = 'Angular';
    } else if (imports.includes('svelte')) {
      framework = 'Svelte';
    }
    
    // Check for TypeScript
    const hasTypeScript = 
      code.includes('interface ') || 
      code.includes('type ') ||
      code.includes(': string') ||
      code.includes(': number') ||
      code.includes(': boolean') ||
      code.includes('React.FC') ||
      code.includes('<') && code.includes('>');
    
    return {
      code,
      dependencies: [...new Set(dependencies)],
      imports: [...new Set(imports)],
      hasTypeScript,
      framework
    };
  }

  /**
   * Evaluate component quality
   */
  private async evaluateComponent(code: string): Promise<ComponentEvaluation> {
    // TypeScript evaluation
    const typeScriptScore = this.evaluateTypeScript(code);
    
    // Accessibility evaluation
    const accessibilityScore = this.evaluateAccessibility(code);
    
    // Performance evaluation
    const performanceScore = this.evaluatePerformance(code);
    
    // Design evaluation
    const designScore = this.evaluateDesign(code);
    
    // Calculate overall score
    const overall = Math.round(
      (typeScriptScore + accessibilityScore + performanceScore + designScore) / 4
    );
    
    return {
      typeScriptScore,
      accessibilityScore,
      performanceScore,
      designScore,
      overall,
      details: {
        typeScriptDetails: this.getTypeScriptDetails(code, typeScriptScore),
        accessibilityDetails: this.getAccessibilityDetails(code, accessibilityScore),
        performanceDetails: this.getPerformanceDetails(code, performanceScore),
        designDetails: this.getDesignDetails(code, designScore)
      }
    };
  }

  /**
   * Evaluate TypeScript quality
   */
  private evaluateTypeScript(code: string): number {
    let score = 0;
    const maxScore = 100;
    
    // Check for interfaces
    if (code.includes('interface ')) score += 20;
    
    // Check for type annotations
    if (code.match(/:\s*(string|number|boolean|any|\w+)/g)) score += 15;
    
    // Check for generics
    if (code.match(/<\w+>/g)) score += 10;
    
    // Check for proper prop types
    if (code.includes('Props') || code.includes('props:')) score += 15;
    
    // Check for React.FC or similar
    if (code.includes('React.FC') || code.includes(': FC')) score += 10;
    
    // Check for return type annotations
    if (code.match(/\):\s*\w+/g)) score += 10;
    
    // Check for proper event handler types
    if (code.includes('React.MouseEvent') || code.includes('React.ChangeEvent')) score += 10;
    
    // Check for no 'any' types (deduct points)
    const anyCount = (code.match(/:\s*any/g) || []).length;
    score -= anyCount * 5;
    
    // Basic TypeScript presence
    if (score === 0 && code.includes('const')) score = 10;
    
    return Math.max(0, Math.min(maxScore, score));
  }

  /**
   * Evaluate accessibility
   */
  private evaluateAccessibility(code: string): number {
    let score = 0;
    const maxScore = 100;
    
    // ARIA attributes
    if (code.includes('aria-')) score += 20;
    if (code.includes('role=')) score += 15;
    
    // Semantic HTML
    const semanticTags = ['nav', 'main', 'header', 'footer', 'section', 'article', 'aside'];
    semanticTags.forEach(tag => {
      if (code.includes(`<${tag}`)) score += 5;
    });
    
    // Alt text for images
    if (code.includes('img') && code.includes('alt=')) score += 15;
    
    // Labels for inputs
    if (code.includes('label') || code.includes('htmlFor')) score += 15;
    
    // Keyboard navigation
    if (code.includes('onKeyDown') || code.includes('onKeyPress')) score += 10;
    
    // Focus management
    if (code.includes('focus') || code.includes('tabIndex')) score += 10;
    
    // Screen reader text
    if (code.includes('sr-only') || code.includes('visually-hidden')) score += 10;
    
    return Math.min(maxScore, score);
  }

  /**
   * Evaluate performance
   */
  private evaluatePerformance(code: string): number {
    let score = 50; // Start with base score
    const maxScore = 100;
    
    // React optimizations
    if (code.includes('React.memo') || code.includes('memo(')) score += 15;
    if (code.includes('useMemo')) score += 10;
    if (code.includes('useCallback')) score += 10;
    
    // Lazy loading
    if (code.includes('lazy') || code.includes('Suspense')) score += 10;
    
    // Efficient updates
    if (code.includes('key=') && !code.includes('key={index}')) score += 10;
    
    // Debouncing/throttling
    if (code.includes('debounce') || code.includes('throttle')) score += 10;
    
    // Virtual scrolling
    if (code.includes('virtual') || code.includes('window')) score += 5;
    
    // Deduct for performance issues
    if (code.includes('key={index}')) score -= 10;
    if (code.includes('.map(') && !code.includes('key=')) score -= 15;
    
    return Math.max(0, Math.min(maxScore, score));
  }

  /**
   * Evaluate design quality
   */
  private evaluateDesign(code: string): number {
    let score = 30; // Base score for any styled component
    const maxScore = 100;
    
    // Modern styling approaches
    if (code.includes('tailwind') || code.match(/className=["'][^"']*\w+-\w+/)) score += 20;
    if (code.includes('styled-components') || code.includes('emotion')) score += 15;
    
    // Animations and transitions
    if (code.includes('transition') || code.includes('animation')) score += 15;
    if (code.includes('transform') || code.includes('scale')) score += 10;
    
    // Modern design patterns
    if (code.includes('backdrop-blur') || code.includes('glassmorphism')) score += 10;
    if (code.includes('gradient')) score += 5;
    if (code.includes('shadow')) score += 5;
    
    // Responsive design
    if (code.includes('md:') || code.includes('lg:') || code.includes('@media')) score += 10;
    
    // Dark mode support
    if (code.includes('dark:') || code.includes('dark mode')) score += 5;
    
    return Math.min(maxScore, score);
  }

  /**
   * Get TypeScript evaluation details
   */
  private getTypeScriptDetails(code: string, score: number): string {
    const details: string[] = [];
    
    if (score >= 80) {
      details.push('Excellent TypeScript usage');
    } else if (score >= 60) {
      details.push('Good TypeScript usage');
    } else if (score >= 40) {
      details.push('Basic TypeScript usage');
    } else {
      details.push('Limited TypeScript usage');
    }
    
    if (code.includes('interface ')) {
      details.push('✓ Proper interfaces defined');
    }
    
    if (code.includes(': any')) {
      details.push('⚠ Avoid using "any" type');
    }
    
    if (!code.includes('React.FC') && code.includes('export')) {
      details.push('💡 Consider using React.FC for component typing');
    }
    
    return details.join('. ');
  }

  /**
   * Get accessibility evaluation details
   */
  private getAccessibilityDetails(code: string, score: number): string {
    const details: string[] = [];
    
    if (score >= 80) {
      details.push('Excellent accessibility');
    } else if (score >= 60) {
      details.push('Good accessibility');
    } else if (score >= 40) {
      details.push('Basic accessibility');
    } else {
      details.push('Needs accessibility improvements');
    }
    
    if (code.includes('aria-')) {
      details.push('✓ ARIA attributes present');
    } else {
      details.push('💡 Add ARIA attributes for better accessibility');
    }
    
    if (code.includes('img') && !code.includes('alt=')) {
      details.push('⚠ Add alt text to images');
    }
    
    return details.join('. ');
  }

  /**
   * Get performance evaluation details
   */
  private getPerformanceDetails(code: string, score: number): string {
    const details: string[] = [];
    
    if (score >= 80) {
      details.push('Excellent performance optimizations');
    } else if (score >= 60) {
      details.push('Good performance practices');
    } else if (score >= 40) {
      details.push('Basic performance considerations');
    } else {
      details.push('Consider performance optimizations');
    }
    
    if (code.includes('memo')) {
      details.push('✓ Uses React.memo for optimization');
    }
    
    if (code.includes('useMemo') || code.includes('useCallback')) {
      details.push('✓ Implements memoization');
    }
    
    if (code.includes('key={index}')) {
      details.push('⚠ Avoid using index as key');
    }
    
    return details.join('. ');
  }

  /**
   * Get design evaluation details
   */
  private getDesignDetails(code: string, score: number): string {
    const details: string[] = [];
    
    if (score >= 80) {
      details.push('Beautiful modern design');
    } else if (score >= 60) {
      details.push('Good design implementation');
    } else if (score >= 40) {
      details.push('Basic styling present');
    } else {
      details.push('Enhance visual design');
    }
    
    if (code.includes('transition') || code.includes('animation')) {
      details.push('✓ Includes animations');
    }
    
    if (code.includes('gradient')) {
      details.push('✓ Uses modern gradients');
    }
    
    if (!code.includes('hover:')) {
      details.push('💡 Add hover states for interactivity');
    }
    
    return details.join('. ');
  }

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(
    component: GeneratedComponent,
    evaluation: ComponentEvaluation
  ): string[] {
    const suggestions: string[] = [];
    
    // TypeScript suggestions
    if (evaluation.typeScriptScore < 60) {
      suggestions.push('Add comprehensive TypeScript interfaces for all props');
      suggestions.push('Use specific types instead of "any"');
    }
    
    // Accessibility suggestions
    if (evaluation.accessibilityScore < 60) {
      suggestions.push('Add ARIA labels and roles for better screen reader support');
      suggestions.push('Ensure all interactive elements are keyboard accessible');
    }
    
    // Performance suggestions
    if (evaluation.performanceScore < 60) {
      suggestions.push('Consider using React.memo for performance optimization');
      suggestions.push('Implement useMemo/useCallback for expensive operations');
    }
    
    // Design suggestions
    if (evaluation.designScore < 60) {
      suggestions.push('Add smooth transitions and micro-interactions');
      suggestions.push('Implement hover and focus states for better UX');
    }
    
    // Framework-specific suggestions
    if (component.framework === 'React' && !component.code.includes('useState')) {
      suggestions.push('Consider if component needs state management');
    }
    
    // General suggestions
    if (!component.code.includes('loading')) {
      suggestions.push('Add loading states for async operations');
    }
    
    if (!component.code.includes('error')) {
      suggestions.push('Implement error handling and error states');
    }
    
    return suggestions;
  }
}

// Export singleton instance
export const uiGenerationEngine = new UIGenerationEngine();