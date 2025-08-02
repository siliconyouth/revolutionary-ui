/**
 * Base AI Provider Interface
 * Defines the contract for all AI providers in the Revolutionary UI Factory System
 */

export interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  organization?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

export interface StreamChunk {
  content: string;
  isComplete: boolean;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

export interface ComponentContext {
  framework: string;
  componentType: string;
  existingComponents?: string[];
  projectStructure?: string;
  dependencies?: string[];
  styleSystem?: string;
  userPreferences?: Record<string, any>;
}

export abstract class BaseAIProvider {
  protected config: AIProviderConfig;
  protected name: string;

  constructor(name: string, config: AIProviderConfig) {
    this.name = name;
    this.config = config;
    this.validateConfig();
  }

  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error(`API key is required for ${this.name} provider`);
    }
  }

  /**
   * Generate a UI component based on a natural language prompt
   */
  abstract generateComponent(
    prompt: string,
    context?: ComponentContext
  ): Promise<AIResponse>;

  /**
   * Generate a UI component with streaming response
   */
  abstract generateComponentStream(
    prompt: string,
    onChunk: (chunk: StreamChunk) => void,
    context?: ComponentContext
  ): Promise<void>;

  /**
   * Get context-aware suggestions for component improvements
   */
  abstract getSuggestions(
    componentCode: string,
    context: ComponentContext
  ): Promise<string[]>;

  /**
   * Analyze component code and provide insights
   */
  abstract analyzeComponent(
    componentCode: string,
    analysisType: 'performance' | 'accessibility' | 'best-practices' | 'security'
  ): Promise<AIResponse>;

  /**
   * Transform component between frameworks
   */
  abstract transformComponent(
    componentCode: string,
    fromFramework: string,
    toFramework: string
  ): Promise<AIResponse>;

  /**
   * Get provider information
   */
  getInfo() {
    return {
      name: this.name,
      model: this.config.model,
      capabilities: this.getCapabilities()
    };
  }

  /**
   * Get provider capabilities
   */
  protected abstract getCapabilities(): string[];

  /**
   * Build context-aware prompt
   */
  protected buildContextualPrompt(basePrompt: string, context?: ComponentContext): string {
    if (!context) return basePrompt;

    let contextualPrompt = basePrompt + '\n\nContext:\n';
    
    if (context.framework) {
      contextualPrompt += `- Framework: ${context.framework}\n`;
    }
    
    if (context.componentType) {
      contextualPrompt += `- Component Type: ${context.componentType}\n`;
    }
    
    if (context.styleSystem) {
      contextualPrompt += `- Style System: ${context.styleSystem}\n`;
    }
    
    if (context.dependencies?.length) {
      contextualPrompt += `- Available Dependencies: ${context.dependencies.join(', ')}\n`;
    }
    
    if (context.existingComponents?.length) {
      contextualPrompt += `- Existing Components: ${context.existingComponents.join(', ')}\n`;
    }

    return contextualPrompt;
  }
}

/**
 * AI Provider Manager
 * Manages multiple AI providers and handles failover
 */
export class AIProviderManager {
  private providers: Map<string, BaseAIProvider> = new Map();
  private defaultProvider: string | null = null;

  /**
   * Register a new AI provider
   */
  registerProvider(provider: BaseAIProvider): void {
    const info = provider.getInfo();
    this.providers.set(info.name, provider);
    
    if (!this.defaultProvider) {
      this.defaultProvider = info.name;
    }
  }

  /**
   * Set default provider
   */
  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider ${name} not found`);
    }
    this.defaultProvider = name;
  }

  /**
   * Get a specific provider
   */
  getProvider(name?: string): BaseAIProvider {
    const providerName = name || this.defaultProvider;
    
    if (!providerName) {
      throw new Error('No AI provider configured');
    }
    
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }
    
    return provider;
  }

  /**
   * Get all registered providers
   */
  getAllProviders(): BaseAIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Generate component with automatic failover
   */
  async generateComponentWithFailover(
    prompt: string,
    context?: ComponentContext,
    preferredProvider?: string
  ): Promise<AIResponse> {
    const providers = this.getProviderOrder(preferredProvider);
    
    let lastError: Error | null = null;
    
    for (const provider of providers) {
      try {
        return await provider.generateComponent(prompt, context);
      } catch (error) {
        console.error(`Provider ${provider.getInfo().name} failed:`, error);
        lastError = error as Error;
        continue;
      }
    }
    
    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
  }

  private getProviderOrder(preferredProvider?: string): BaseAIProvider[] {
    const providers = Array.from(this.providers.values());
    
    if (preferredProvider && this.providers.has(preferredProvider)) {
      const preferred = this.providers.get(preferredProvider)!;
      return [preferred, ...providers.filter(p => p.getInfo().name !== preferredProvider)];
    }
    
    return providers;
  }
}

// Export singleton instance
export const aiProviderManager = new AIProviderManager();