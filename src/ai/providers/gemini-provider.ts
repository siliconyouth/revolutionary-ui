import { BaseAIProvider, AIProviderConfig, AIResponse, ComponentContext, StreamChunk } from './base-provider';

interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{
    text: string;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface GeminiStreamChunk {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason?: string;
  }>;
}

export class GeminiProvider extends BaseAIProvider {
  private defaultModel = 'gemini-pro';
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(config: AIProviderConfig) {
    super('Gemini', config);
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
      'multi-modal'
    ];
  }

  async generateComponent(
    prompt: string,
    context?: ComponentContext
  ): Promise<AIResponse> {
    const contents = this.buildContents(prompt, context);
    
    const response = await fetch(
      `${this.baseUrl}/models/${this.config.model || this.defaultModel}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: this.config.temperature || 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: this.config.maxTokens || 4000,
            stopSequences: []
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response generated from Gemini');
    }
    
    const candidate = data.candidates[0];
    const content = candidate.content.parts.map(part => part.text).join('');
    
    return {
      content,
      model: this.config.model || this.defaultModel,
      usage: data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount,
        completionTokens: data.usageMetadata.candidatesTokenCount,
        totalTokens: data.usageMetadata.totalTokenCount
      } : undefined,
      metadata: {
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings
      }
    };
  }

  async generateComponentStream(
    prompt: string,
    onChunk: (chunk: StreamChunk) => void,
    context?: ComponentContext
  ): Promise<void> {
    const contents = this.buildContents(prompt, context);
    
    const response = await fetch(
      `${this.baseUrl}/models/${this.config.model || this.defaultModel}:streamGenerateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: this.config.temperature || 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: this.config.maxTokens || 4000
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onChunk({ content: '', isComplete: true });
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const chunk: GeminiStreamChunk = JSON.parse(line);
              
              if (chunk.candidates && chunk.candidates[0]?.content?.parts) {
                const text = chunk.candidates[0].content.parts
                  .map(part => part.text)
                  .join('');
                
                if (text) {
                  onChunk({
                    content: text,
                    isComplete: false,
                    metadata: {
                      finishReason: chunk.candidates[0].finishReason
                    }
                  });
                }
                
                if (chunk.candidates[0].finishReason) {
                  onChunk({ content: '', isComplete: true });
                  return;
                }
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
    You are analyzing a ${context.framework} component. Provide exactly 5 specific, actionable suggestions for improvement.
    
    Component code:
    \`\`\`${context.framework.toLowerCase()}
    ${componentCode}
    \`\`\`
    
    Focus your suggestions on:
    1. Performance optimizations specific to ${context.framework}
    2. Accessibility improvements for WCAG 2.1 AA compliance
    3. Code organization and maintainability
    4. Modern ${context.framework} patterns and best practices
    5. Component reusability and composition patterns
    
    Respond with only a JSON array containing exactly 5 suggestion strings.
    Format: ["First suggestion", "Second suggestion", "Third suggestion", "Fourth suggestion", "Fifth suggestion"]
    `;

    const response = await this.generateComponent(prompt, context);
    
    try {
      // Extract JSON array from response
      const jsonMatch = response.content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return Array.isArray(suggestions) ? suggestions.slice(0, 5) : [];
      }
    } catch (e) {
      console.error('Error parsing suggestions:', e);
    }
    
    // Fallback: split by newlines and take first 5 non-empty lines
    return response.content
      .split('\n')
      .filter(line => line.trim() && !line.includes('[') && !line.includes(']'))
      .slice(0, 5)
      .map(line => line.replace(/^[\d\-\*\.\)]+\s*/, '').trim());
  }

  async analyzeComponent(
    componentCode: string,
    analysisType: 'performance' | 'accessibility' | 'best-practices' | 'security'
  ): Promise<AIResponse> {
    const analysisInstructions = {
      performance: `Analyze for performance issues:
        - Identify rendering bottlenecks and unnecessary re-renders
        - Find memory leaks and circular dependencies
        - Detect expensive computations that could be optimized
        - Evaluate bundle size impact and code splitting opportunities
        - Check for proper lazy loading and virtualization`,
      
      accessibility: `Perform accessibility audit:
        - Check WCAG 2.1 Level AA compliance
        - Verify keyboard navigation and focus management
        - Ensure proper ARIA labels and roles
        - Test color contrast ratios
        - Validate semantic HTML usage`,
      
      'best-practices': `Review code quality:
        - Evaluate component structure and organization
        - Check naming conventions and consistency
        - Assess error handling and edge cases
        - Review TypeScript usage and type safety
        - Analyze code maintainability and testability`,
      
      security: `Security vulnerability analysis:
        - Check for XSS vulnerabilities
        - Identify unsafe innerHTML usage
        - Find potential injection points
        - Review data validation and sanitization
        - Assess third-party dependency risks`
    };

    const prompt = `
    Perform a ${analysisType} analysis on this component.
    
    ${analysisInstructions[analysisType]}
    
    Component to analyze:
    \`\`\`javascript
    ${componentCode}
    \`\`\`
    
    Provide a comprehensive analysis with:
    1. Executive summary (2-3 sentences)
    2. Detailed findings organized by severity (High, Medium, Low)
    3. Specific fix recommendations with code examples
    4. Best practices and additional resources
    5. Overall score or assessment
    `;

    return this.generateComponent(prompt);
  }

  async transformComponent(
    componentCode: string,
    fromFramework: string,
    toFramework: string
  ): Promise<AIResponse> {
    const frameworkSpecifics = {
      'React': 'Use functional components with hooks (useState, useEffect, etc.)',
      'Vue': 'Use Composition API with setup() or <script setup>',
      'Angular': 'Use standalone components with proper decorators',
      'Svelte': 'Use reactive declarations and Svelte-specific syntax',
      'Solid': 'Use fine-grained reactivity with createSignal',
      'Preact': 'Use Preact-compatible syntax (similar to React but lighter)'
    };

    const prompt = `
    Transform this ${fromFramework} component into a ${toFramework} component.
    
    Source ${fromFramework} component:
    \`\`\`${fromFramework.toLowerCase()}
    ${componentCode}
    \`\`\`
    
    Transformation requirements:
    - ${frameworkSpecifics[toFramework] || `Follow ${toFramework} best practices`}
    - Preserve all functionality, props, and events
    - Maintain the same component API
    - Include all required imports
    - Add proper TypeScript types
    - Use ${toFramework}-specific optimizations
    - Only include necessary comments for complex transformations
    
    Generate only the complete ${toFramework} component code, ready for production use.
    `;

    return this.generateComponent(prompt, { framework: toFramework, componentType: 'transformed' });
  }

  private buildContents(prompt: string, context?: ComponentContext): GeminiContent[] {
    const systemContext = `You are an AI assistant specialized in generating UI components for the Revolutionary UI Factory System.
    Your goal is to create high-quality, production-ready components that reduce code by 60-95%.
    
    Guidelines:
    - Write clean, efficient, and maintainable code
    - Follow framework-specific conventions and best practices
    - Ensure accessibility and performance
    - Use modern JavaScript/TypeScript features
    - Include proper error handling
    - Make components reusable and composable`;

    const contents: GeminiContent[] = [
      {
        role: 'user',
        parts: [{ text: systemContext }]
      },
      {
        role: 'model',
        parts: [{ text: 'I understand. I will help generate high-quality UI components following best practices and achieving significant code reduction.' }]
      },
      {
        role: 'user',
        parts: [{ text: this.buildContextualPrompt(prompt, context) }]
      }
    ];

    return contents;
  }
}