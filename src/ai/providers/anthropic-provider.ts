import { BaseAIProvider, AIProviderConfig, AIResponse, ComponentContext, StreamChunk } from './base-provider';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AnthropicStreamEvent {
  type: string;
  message?: AnthropicResponse;
  index?: number;
  delta?: {
    type: string;
    text: string;
    stop_reason?: string;
  };
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicProvider extends BaseAIProvider {
  private defaultModel = 'claude-3-opus-20240229';
  private baseUrl = 'https://api.anthropic.com/v1';

  constructor(config: AIProviderConfig) {
    super('Anthropic', config);
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
    if (!config.model) {
      this.config.model = this.defaultModel;
    }
  }

  protected getCapabilities(): string[] {
    return [
      'component-generation',
      'streaming',
      'context-aware',
      'code-analysis',
      'framework-transformation',
      'multi-language',
      'long-context',
      'vision'
    ];
  }

  async generateComponent(
    prompt: string,
    context?: ComponentContext
  ): Promise<AIResponse> {
    const messages = this.buildMessages(prompt, context);
    
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || this.defaultModel,
        messages,
        max_tokens: this.config.maxTokens || 4000,
        temperature: this.config.temperature || 0.7,
        system: this.getSystemPrompt()
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data: AnthropicResponse = await response.json();
    
    return {
      content: data.content[0].text,
      model: data.model,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      },
      metadata: {
        id: data.id,
        stopReason: data.stop_reason
      }
    };
  }

  async generateComponentStream(
    prompt: string,
    onChunk: (chunk: StreamChunk) => void,
    context?: ComponentContext
  ): Promise<void> {
    const messages = this.buildMessages(prompt, context);
    
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || this.defaultModel,
        messages,
        max_tokens: this.config.maxTokens || 4000,
        temperature: this.config.temperature || 0.7,
        stream: true,
        system: this.getSystemPrompt()
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            try {
              const event: AnthropicStreamEvent = JSON.parse(data);
              
              if (event.type === 'content_block_delta' && event.delta?.text) {
                onChunk({
                  content: event.delta.text,
                  isComplete: false,
                  metadata: { index: event.index }
                });
              } else if (event.type === 'message_stop') {
                onChunk({ content: '', isComplete: true });
                return;
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async getSuggestions(
    componentCode: string,
    context: ComponentContext
  ): Promise<string[]> {
    const prompt = `
    Analyze this ${context.framework} component and provide exactly 5 specific, actionable suggestions for improvement:
    
    \`\`\`${context.framework.toLowerCase()}
    ${componentCode}
    \`\`\`
    
    Focus on:
    - Performance optimizations specific to ${context.framework}
    - Accessibility improvements (WCAG 2.1 AA compliance)
    - Code organization and maintainability
    - Modern ${context.framework} best practices
    - Component reusability and composition
    
    Return your response as a JSON array of strings, each containing one specific suggestion.
    Example format: ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4", "Suggestion 5"]
    `;

    const response = await this.generateComponent(prompt, context);
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return Array.isArray(suggestions) ? suggestions.slice(0, 5) : [];
      }
    } catch (e) {
      console.error('Error parsing suggestions:', e);
    }
    
    // Fallback: extract numbered items
    const suggestionRegex = /(?:^|\n)\s*(?:\d+\.|[-*])\s*(.+)/gm;
    const matches = Array.from(response.content.matchAll(suggestionRegex));
    return matches.slice(0, 5).map(match => match[1].trim());
  }

  async analyzeComponent(
    componentCode: string,
    analysisType: 'performance' | 'accessibility' | 'best-practices' | 'security'
  ): Promise<AIResponse> {
    const analysisPrompts = {
      performance: `Perform a detailed performance analysis of this component. Identify:
        - Unnecessary re-renders
        - Memory leaks
        - Expensive computations
        - Bundle size impacts
        - Runtime performance issues`,
      
      accessibility: `Conduct a comprehensive accessibility audit of this component. Check for:
        - WCAG 2.1 Level AA compliance
        - Keyboard navigation support
        - Screen reader compatibility
        - Color contrast issues
        - ARIA attribute usage`,
      
      'best-practices': `Review this component for code quality and best practices. Evaluate:
        - Code organization and structure
        - Naming conventions
        - Error handling
        - Type safety
        - Maintainability`,
      
      security: `Analyze this component for security vulnerabilities. Look for:
        - XSS vulnerabilities
        - Unsafe data handling
        - Injection risks
        - Sensitive data exposure
        - Third-party dependency risks`
    };

    const prompt = `
    ${analysisPrompts[analysisType]}
    
    Component to analyze:
    \`\`\`javascript
    ${componentCode}
    \`\`\`
    
    Provide a structured analysis with:
    1. Summary of findings
    2. Detailed issues (with severity: high/medium/low)
    3. Specific recommendations with code examples
    4. Resources for further reading
    `;

    return this.generateComponent(prompt);
  }

  async transformComponent(
    componentCode: string,
    fromFramework: string,
    toFramework: string
  ): Promise<AIResponse> {
    const frameworkMappings = {
      'React': { hooks: 'useState, useEffect', jsx: 'JSX syntax' },
      'Vue': { api: 'Composition API', template: 'template syntax' },
      'Angular': { decorators: '@Component', template: 'Angular template syntax' },
      'Svelte': { reactivity: 'reactive statements', syntax: 'Svelte syntax' }
    };

    const prompt = `
    Transform this ${fromFramework} component to a modern ${toFramework} component:
    
    Original ${fromFramework} component:
    \`\`\`${fromFramework.toLowerCase()}
    ${componentCode}
    \`\`\`
    
    Requirements for the ${toFramework} version:
    - Use ${frameworkMappings[toFramework]?.api || toFramework + ' best practices'}
    - Maintain all functionality and behavior
    - Preserve component API (props/events/slots)
    - Include all necessary imports
    - Add TypeScript types where applicable
    - Use ${frameworkMappings[toFramework]?.syntax || toFramework + ' syntax'}
    - Include comments only for non-obvious transformations
    
    Provide only the complete, production-ready ${toFramework} component code.
    `;

    return this.generateComponent(prompt, { framework: toFramework, componentType: 'transformed' });
  }

  private buildMessages(prompt: string, context?: ComponentContext): AnthropicMessage[] {
    return [
      {
        role: 'user',
        content: this.buildContextualPrompt(prompt, context)
      }
    ];
  }

  private getSystemPrompt(): string {
    return `You are Claude, an expert UI component generator for the Revolutionary UI Factory System. 
    You specialize in creating high-quality, production-ready components that achieve 60-95% code reduction.
    
    Key principles:
    - Write clean, maintainable, and performant code
    - Follow framework-specific best practices and idioms
    - Ensure accessibility (WCAG 2.1 AA compliance)
    - Use modern JavaScript/TypeScript features appropriately
    - Implement proper error handling and edge cases
    - Consider performance implications
    - Write self-documenting code with minimal comments
    
    When generating components:
    - Use the factory pattern approach where applicable
    - Leverage existing UI libraries when available
    - Provide complete, runnable code
    - Include all necessary imports
    - Add TypeScript types for better developer experience`;
  }
}