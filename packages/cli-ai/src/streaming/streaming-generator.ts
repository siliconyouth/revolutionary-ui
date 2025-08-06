import { EventEmitter } from 'events';
import { createLogger } from '@revolutionary-ui/cli-core';
import { BaseProvider } from '../providers/base-provider.js';
import { AutoFixEngine } from './autofix-engine.js';
import { ErrorDetector } from './error-detector.js';
import { PostProcessor } from './post-processor.js';

export interface StreamingOptions {
  autoFix: boolean;
  linting: boolean;
  validation: boolean;
  formatting: boolean;
  optimization: boolean;
}

export interface StreamChunk {
  content: string;
  type: 'code' | 'text' | 'error' | 'warning';
  fixes?: Fix[];
  metadata?: Record<string, any>;
}

export interface Fix {
  type: string;
  description: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

/**
 * Streaming AI Generator with real-time error detection and auto-fix
 * Implements v0-style composite model architecture
 */
export class StreamingGenerator extends EventEmitter {
  private logger = createLogger();
  private provider: BaseProvider;
  private autoFix: AutoFixEngine;
  private errorDetector: ErrorDetector;
  private postProcessor: PostProcessor;
  
  constructor(provider: BaseProvider) {
    super();
    this.provider = provider;
    this.autoFix = new AutoFixEngine();
    this.errorDetector = new ErrorDetector();
    this.postProcessor = new PostProcessor();
  }

  /**
   * Generate with streaming and real-time fixes
   */
  async *generateWithStream(
    prompt: string,
    options: Partial<StreamingOptions> = {}
  ): AsyncGenerator<StreamChunk> {
    const config: StreamingOptions = {
      autoFix: true,
      linting: true,
      validation: true,
      formatting: true,
      optimization: false,
      ...options,
    };

    try {
      // Start generation
      this.emit('stream:start', { prompt });
      
      // Buffer for multi-line error detection
      let buffer = '';
      let lineNumber = 0;
      
      // Stream from provider
      const stream = await this.provider.stream({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4000,
      });

      for await (const chunk of stream) {
        buffer += chunk.content;
        
        // Detect complete statements for processing
        const statements = this.extractCompleteStatements(buffer);
        
        for (const statement of statements.complete) {
          lineNumber++;
          
          // Real-time error detection
          const errors = await this.errorDetector.detect(statement, {
            context: buffer,
            lineNumber,
            language: this.detectLanguage(statement),
          });

          if (errors.length > 0 && config.autoFix) {
            // Apply auto-fixes
            const fixed = await this.autoFix.fix(statement, errors);
            
            yield {
              content: fixed.content,
              type: 'code',
              fixes: fixed.appliedFixes,
              metadata: { lineNumber, original: statement },
            };
            
            this.emit('fix:applied', { 
              original: statement, 
              fixed: fixed.content,
              fixes: fixed.appliedFixes,
            });
          } else if (errors.length > 0) {
            // Yield with warnings
            yield {
              content: statement,
              type: 'warning',
              fixes: errors.map(e => ({
                type: e.type,
                description: e.message,
                line: lineNumber,
                severity: e.severity as 'error' | 'warning' | 'info',
                suggestion: e.suggestion,
              })),
            };
          } else {
            // Clean statement
            yield {
              content: statement,
              type: 'code',
              metadata: { lineNumber },
            };
          }
        }
        
        // Update buffer with incomplete statement
        buffer = statements.incomplete;
      }

      // Process any remaining content
      if (buffer.trim()) {
        const processed = await this.processRemainingContent(buffer, config);
        yield processed;
      }

      // Final post-processing pass
      if (config.formatting || config.optimization) {
        this.emit('postprocess:start');
        
        const finalContent = await this.postProcessor.process(
          this.getAllContent(),
          {
            format: config.formatting,
            optimize: config.optimization,
            lint: config.linting,
          }
        );

        yield {
          content: finalContent,
          type: 'code',
          metadata: { phase: 'final', processed: true },
        };
        
        this.emit('postprocess:complete');
      }

      this.emit('stream:complete');
      
    } catch (error) {
      this.emit('stream:error', error);
      throw error;
    }
  }

  /**
   * Generate complete component with multi-pass optimization
   */
  async generateOptimized(
    prompt: string,
    options: Partial<StreamingOptions> = {}
  ): Promise<{
    content: string;
    fixes: Fix[];
    metadata: Record<string, any>;
  }> {
    const chunks: StreamChunk[] = [];
    const allFixes: Fix[] = [];

    // Collect all chunks
    for await (const chunk of this.generateWithStream(prompt, options)) {
      chunks.push(chunk);
      if (chunk.fixes) {
        allFixes.push(...chunk.fixes);
      }
    }

    // Combine content
    const content = chunks
      .map(chunk => chunk.content)
      .join('\n');

    // Multi-pass optimization
    const optimized = await this.multiPassOptimization(content);

    return {
      content: optimized.content,
      fixes: [...allFixes, ...optimized.fixes],
      metadata: {
        chunks: chunks.length,
        totalFixes: allFixes.length,
        optimizationPasses: optimized.passes,
      },
    };
  }

  /**
   * Extract complete statements from buffer
   */
  private extractCompleteStatements(buffer: string): {
    complete: string[];
    incomplete: string;
  } {
    const lines = buffer.split('\n');
    const complete: string[] = [];
    let incomplete = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is a complete statement
      if (this.isCompleteStatement(line, lines.slice(0, i + 1).join('\n'))) {
        complete.push(line);
      } else if (i === lines.length - 1) {
        // Last line might be incomplete
        incomplete = line;
      } else {
        complete.push(line);
      }
    }

    return { complete, incomplete };
  }

  /**
   * Check if a line represents a complete statement
   */
  private isCompleteStatement(line: string, context: string): boolean {
    // Check for incomplete brackets, quotes, etc.
    const openBrackets = (context.match(/\{/g) || []).length;
    const closeBrackets = (context.match(/\}/g) || []).length;
    const openParens = (context.match(/\(/g) || []).length;
    const closeParens = (context.match(/\)/g) || []).length;
    
    // Simple heuristic - can be improved
    return openBrackets === closeBrackets && openParens === closeParens;
  }

  /**
   * Detect programming language from content
   */
  private detectLanguage(content: string): string {
    if (content.includes('import React') || content.includes('jsx')) {
      return 'typescript-react';
    }
    if (content.includes('import { Component }') && content.includes('@angular')) {
      return 'typescript-angular';
    }
    if (content.includes('<template>') || content.includes('Vue.component')) {
      return 'vue';
    }
    if (content.includes('export default function') || content.includes('const')) {
      return 'typescript';
    }
    return 'javascript';
  }

  /**
   * Process remaining buffer content
   */
  private async processRemainingContent(
    buffer: string,
    config: StreamingOptions
  ): Promise<StreamChunk> {
    if (config.autoFix) {
      const errors = await this.errorDetector.detect(buffer, {
        context: '',
        lineNumber: -1,
        language: this.detectLanguage(buffer),
      });

      if (errors.length > 0) {
        const fixed = await this.autoFix.fix(buffer, errors);
        return {
          content: fixed.content,
          type: 'code',
          fixes: fixed.appliedFixes,
          metadata: { phase: 'final-buffer' },
        };
      }
    }

    return {
      content: buffer,
      type: 'code',
      metadata: { phase: 'final-buffer' },
    };
  }

  /**
   * Multi-pass optimization
   */
  private async multiPassOptimization(content: string): Promise<{
    content: string;
    fixes: Fix[];
    passes: number;
  }> {
    let optimized = content;
    const fixes: Fix[] = [];
    let passes = 0;
    const maxPasses = 3;

    while (passes < maxPasses) {
      passes++;
      
      const errors = await this.errorDetector.detect(optimized, {
        context: optimized,
        lineNumber: -1,
        language: this.detectLanguage(optimized),
        deep: true,
      });

      if (errors.length === 0) break;

      const result = await this.autoFix.fix(optimized, errors);
      
      if (result.content === optimized) break; // No changes made
      
      optimized = result.content;
      fixes.push(...result.appliedFixes);
    }

    return { content: optimized, fixes, passes };
  }

  /**
   * Get all generated content (for post-processing)
   */
  private getAllContent(): string {
    // This would be implemented to track all generated content
    return '';
  }

  /**
   * Generate with specific framework optimizations
   */
  async generateForFramework(
    prompt: string,
    framework: 'react' | 'vue' | 'angular' | 'svelte',
    options: Partial<StreamingOptions> = {}
  ): AsyncGenerator<StreamChunk> {
    // Add framework-specific context
    const enhancedPrompt = this.enhancePromptForFramework(prompt, framework);
    
    // Configure framework-specific error detection
    this.errorDetector.setFramework(framework);
    this.autoFix.setFramework(framework);
    
    yield* this.generateWithStream(enhancedPrompt, options);
  }

  /**
   * Enhance prompt with framework-specific context
   */
  private enhancePromptForFramework(prompt: string, framework: string): string {
    const frameworkContext = {
      react: 'Generate a React component with TypeScript, using functional components and hooks.',
      vue: 'Generate a Vue 3 component using Composition API with TypeScript.',
      angular: 'Generate an Angular component with TypeScript, using standalone components.',
      svelte: 'Generate a Svelte component with TypeScript support.',
    };

    return `${frameworkContext[framework as keyof typeof frameworkContext]}\n\n${prompt}`;
  }
}