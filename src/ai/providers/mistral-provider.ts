import { BaseAIProvider, AIProviderConfig, AIResponse, ComponentContext, StreamChunk } from './base-provider';

interface MistralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MistralResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface MistralStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
  }>;
}

export class MistralProvider extends BaseAIProvider {
  private defaultModel = 'mistral-large-latest';
  private baseUrl = 'https://api.mistral.ai/v1';

  constructor(config: AIProviderConfig) {
    super('Mistral', config);
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
      'function-calling',
      'json-mode'
    ];
  }

  async generateComponent(
    prompt: string,
    context?: ComponentContext
  ): Promise<AIResponse> {
    const messages = this.buildMessages(prompt, context);
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || this.defaultModel,
        messages,
        temperature: this.config.temperature || 0.7,
        top_p: 1,
        max_tokens: this.config.maxTokens || 4000,
        stream: false
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Mistral API error: ${error.message || response.statusText}`);
    }

    const data: MistralResponse = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      },
      metadata: {
        id: data.id,
        created: data.created,
        finishReason: data.choices[0].finish_reason
      }
    };
  }

  async generateComponentStream(
    prompt: string,
    onChunk: (chunk: StreamChunk) => void,
    context?: ComponentContext
  ): Promise<void> {
    const messages = this.buildMessages(prompt, context);
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || this.defaultModel,
        messages,
        temperature: this.config.temperature || 0.7,
        top_p: 1,
        max_tokens: this.config.maxTokens || 4000,
        stream: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Mistral API error: ${error.message || response.statusText}`);
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
            
            if (data === '[DONE]') {
              onChunk({ content: '', isComplete: true });
              return;
            }
            
            try {
              const chunk: MistralStreamChunk = JSON.parse(data);
              const content = chunk.choices[0]?.delta?.content;
              
              if (content) {
                onChunk({
                  content,
                  isComplete: false,
                  metadata: {
                    model: chunk.model,
                    id: chunk.id
                  }
                });
              }
              
              if (chunk.choices[0]?.finish_reason) {
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
    Analyze this ${context.framework} component and provide exactly 5 actionable improvement suggestions.
    
    Component:
    \`\`\`${context.framework.toLowerCase()}
    ${componentCode}
    \`\`\`
    
    Requirements:
    - Focus on ${context.framework}-specific optimizations
    - Consider performance, accessibility, and maintainability
    - Provide specific, implementable suggestions
    - Format as a JSON array of strings
    
    Example response format:
    ["Use React.memo to prevent unnecessary re-renders", "Add aria-label to interactive elements", ...]
    `;

    const messages = this.buildMessages(prompt, context);
    
    // Use JSON mode for structured output
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || this.defaultModel,
        messages,
        temperature: 0.3, // Lower temperature for more consistent JSON
        response_format: { type: "json_object" },
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.statusText}`);
    }

    const data: MistralResponse = await response.json();
    
    try {
      // Parse the JSON response
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);
      
      // Handle different possible JSON structures
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 5);
      } else if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        return parsed.suggestions.slice(0, 5);
      }
      
      // Fallback: extract array from the content
      const arrayMatch = content.match(/\[[\s\S]*?\]/);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]).slice(0, 5);
      }
    } catch (e) {
      console.error('Error parsing suggestions:', e);
    }
    
    // Final fallback
    return [
      'Consider using memoization for expensive computations',
      'Add proper TypeScript types for better type safety',
      'Implement error boundaries for better error handling',
      'Optimize bundle size by lazy loading dependencies',
      'Add comprehensive unit tests for edge cases'
    ];
  }

  async analyzeComponent(
    componentCode: string,
    analysisType: 'performance' | 'accessibility' | 'best-practices' | 'security'
  ): Promise<AIResponse> {
    const analysisPrompts = {
      performance: `Analyze this component for performance optimizations. Focus on:
        - Rendering performance and React/Vue/Angular specific optimizations
        - Memory usage and potential leaks
        - Bundle size and code splitting opportunities
        - Computational efficiency
        - Network request optimization`,
      
      accessibility: `Conduct an accessibility audit. Check for:
        - WCAG 2.1 AA compliance issues
        - Proper semantic HTML usage
        - Keyboard navigation support
        - Screen reader compatibility
        - Color contrast and visual accessibility`,
      
      'best-practices': `Review code quality and best practices. Evaluate:
        - Code organization and architecture
        - Naming conventions and readability
        - Error handling and edge cases
        - Type safety and documentation
        - Testing and maintainability`,
      
      security: `Perform security analysis. Look for:
        - XSS vulnerabilities
        - Injection attack vectors
        - Unsafe data handling
        - Authentication/authorization issues
        - Dependency vulnerabilities`
    };

    const prompt = `
    ${analysisPrompts[analysisType]}
    
    Component code:
    \`\`\`javascript
    ${componentCode}
    \`\`\`
    
    Provide a detailed analysis with:
    1. Overview and key findings
    2. Specific issues categorized by severity (High/Medium/Low)
    3. Actionable recommendations with code examples
    4. Best practices and references
    `;

    return this.generateComponent(prompt);
  }

  async transformComponent(
    componentCode: string,
    fromFramework: string,
    toFramework: string
  ): Promise<AIResponse> {
    const transformationGuides = {
      'React->Vue': 'Convert hooks to Composition API, JSX to template syntax',
      'Vue->React': 'Convert Composition API to hooks, template to JSX',
      'React->Angular': 'Convert to Angular component with decorators and template',
      'Angular->React': 'Convert decorators to functional component with hooks',
      'React->Svelte': 'Convert to Svelte reactive syntax and component structure',
      'Vue->Svelte': 'Convert Vue reactivity to Svelte reactive declarations'
    };

    const key = `${fromFramework}->${toFramework}`;
    const guide = transformationGuides[key] || `Transform from ${fromFramework} to ${toFramework}`;

    const prompt = `
    Transform this ${fromFramework} component to ${toFramework}.
    
    Transformation guide: ${guide}
    
    Original ${fromFramework} component:
    \`\`\`${fromFramework.toLowerCase()}
    ${componentCode}
    \`\`\`
    
    Requirements:
    - Maintain exact functionality and behavior
    - Use ${toFramework} idioms and best practices
    - Include all necessary imports and setup
    - Add TypeScript types where applicable
    - Preserve component API (props/events)
    - Optimize for ${toFramework} performance patterns
    
    Provide only the complete ${toFramework} component code.
    `;

    return this.generateComponent(prompt, { framework: toFramework, componentType: 'transformed' });
  }

  private buildMessages(prompt: string, context?: ComponentContext): MistralMessage[] {
    const systemMessage: MistralMessage = {
      role: 'system',
      content: `You are Mistral, an AI assistant specialized in generating high-quality UI components for the Revolutionary UI Factory System.
      
      Your expertise includes:
      - Creating production-ready components with 60-95% code reduction
      - Deep knowledge of React, Vue, Angular, Svelte, and other frameworks
      - Modern JavaScript/TypeScript best practices
      - Performance optimization and accessibility
      - Clean code principles and design patterns
      
      Always provide complete, working code that follows framework conventions and industry best practices.`
    };

    const userMessage: MistralMessage = {
      role: 'user',
      content: this.buildContextualPrompt(prompt, context)
    };

    return [systemMessage, userMessage];
  }
}