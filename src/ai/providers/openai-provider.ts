import { BaseAIProvider, AIProviderConfig, AIResponse, ComponentContext, StreamChunk } from './base-provider';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
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
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenAIStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

export class OpenAIProvider extends BaseAIProvider {
  private defaultModel = 'gpt-4-turbo-preview';
  private baseUrl = 'https://api.openai.com/v1';

  constructor(config: AIProviderConfig) {
    super('OpenAI', config);
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
      'function-calling'
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
        'Authorization': `Bearer ${this.config.apiKey}`,
        ...(this.config.organization && { 'OpenAI-Organization': this.config.organization })
      },
      body: JSON.stringify({
        model: this.config.model || this.defaultModel,
        messages,
        max_tokens: this.config.maxTokens || 4000,
        temperature: this.config.temperature || 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      } : undefined,
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
        'Authorization': `Bearer ${this.config.apiKey}`,
        ...(this.config.organization && { 'OpenAI-Organization': this.config.organization })
      },
      body: JSON.stringify({
        model: this.config.model || this.defaultModel,
        messages,
        max_tokens: this.config.maxTokens || 4000,
        temperature: this.config.temperature || 0.7,
        stream: true,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
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
              const parsed: OpenAIStreamResponse = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              
              if (content) {
                onChunk({
                  content,
                  isComplete: false,
                  metadata: {
                    model: parsed.model,
                    id: parsed.id
                  }
                });
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
    Analyze this ${context.framework} component and provide 5 specific suggestions for improvement:
    
    \`\`\`${context.framework.toLowerCase()}
    ${componentCode}
    \`\`\`
    
    Consider:
    - Performance optimizations
    - Accessibility improvements
    - Code organization
    - Best practices for ${context.framework}
    - Reusability
    
    Return only a JSON array of strings with the suggestions.
    `;

    const response = await this.generateComponent(prompt, context);
    
    try {
      const suggestions = JSON.parse(response.content);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch {
      // Fallback: extract suggestions from text
      const lines = response.content.split('\n').filter(line => line.trim());
      return lines.slice(0, 5);
    }
  }

  async analyzeComponent(
    componentCode: string,
    analysisType: 'performance' | 'accessibility' | 'best-practices' | 'security'
  ): Promise<AIResponse> {
    const prompts = {
      performance: `Analyze this component for performance issues and provide specific optimization recommendations:`,
      accessibility: `Analyze this component for accessibility issues and provide WCAG 2.1 compliance recommendations:`,
      'best-practices': `Analyze this component for code quality and best practices violations:`,
      security: `Analyze this component for security vulnerabilities and provide remediation steps:`
    };

    const prompt = `
    ${prompts[analysisType]}
    
    \`\`\`javascript
    ${componentCode}
    \`\`\`
    
    Provide a detailed analysis with:
    1. Issues found (if any)
    2. Severity levels
    3. Specific recommendations
    4. Code examples for fixes
    `;

    return this.generateComponent(prompt);
  }

  async transformComponent(
    componentCode: string,
    fromFramework: string,
    toFramework: string
  ): Promise<AIResponse> {
    const prompt = `
    Transform this ${fromFramework} component to ${toFramework}:
    
    \`\`\`${fromFramework.toLowerCase()}
    ${componentCode}
    \`\`\`
    
    Requirements:
    - Maintain all functionality
    - Use ${toFramework} best practices and idioms
    - Preserve component props/inputs
    - Include necessary imports
    - Add appropriate TypeScript types if applicable
    - Include brief comments explaining major changes
    
    Return only the transformed component code.
    `;

    return this.generateComponent(prompt, { framework: toFramework, componentType: 'transformed' });
  }

  private buildMessages(prompt: string, context?: ComponentContext): OpenAIMessage[] {
    const systemMessage: OpenAIMessage = {
      role: 'system',
      content: `You are an expert UI component generator for the Revolutionary UI Factory System. 
      You specialize in creating high-quality, production-ready components with 60-95% less code.
      Always follow best practices, ensure accessibility, and write clean, maintainable code.
      When generating components, use the factory pattern approach and modern JavaScript/TypeScript.`
    };

    const userMessage: OpenAIMessage = {
      role: 'user',
      content: this.buildContextualPrompt(prompt, context)
    };

    return [systemMessage, userMessage];
  }
}