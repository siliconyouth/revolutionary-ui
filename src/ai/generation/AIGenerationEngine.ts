/**
 * AI Generation Engine - Core implementation
 */

import { Anthropic } from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import { ClaudeSessionClient } from '../../cli/utils/claude-session-client';
import type {
  GenerationRequest,
  GeneratedComponent,
  EnhancedGenerationContext,
  ComponentMetadata,
} from './types';
import { DatabaseContextBuilder } from './DatabaseContextBuilder';
import { HybridSearchSystem } from './HybridSearchSystem';
import { R2CodeRepository } from './R2CodeRepository';
import { DocumentationIntegration } from './DocumentationIntegration';
import { AutomatedCodeReviewer } from './AutomatedCodeReviewer';
import { ContextBuilder } from './ContextBuilder';
import { ComponentOptimizer } from './ComponentOptimizer';
import { PromptBuilder } from './PromptBuilder';

export class AIGenerationEngine {
  private anthropic?: Anthropic;
  private sessionClient?: ClaudeSessionClient;
  private useSessionAuth: boolean = false;
  private prisma: PrismaClient;
  private contextBuilder: ContextBuilder;
  private searchSystem: HybridSearchSystem;
  private codeRepository: R2CodeRepository;
  private docIntegration: DocumentationIntegration;
  private codeReviewer: AutomatedCodeReviewer;
  private optimizer: ComponentOptimizer;
  private promptBuilder: PromptBuilder;
  private model: 'claude-3-opus-20240229' | 'claude-3-5-sonnet-20241022' = 'claude-3-5-sonnet-20241022';

  constructor(config?: { model?: 'opus-4' | 'sonnet-4'; useSessionAuth?: boolean }) {
    // Set model based on config
    if (config?.model === 'opus-4') {
      this.model = 'claude-3-opus-20240229';
    }

    // Initialize auth based on config
    this.useSessionAuth = config?.useSessionAuth || false;
    
    if (this.useSessionAuth) {
      // Use session-based auth
      this.sessionClient = new ClaudeSessionClient();
    } else {
      // Use API key auth
      if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('⚠️  No ANTHROPIC_API_KEY found. Consider using session auth with --use-session flag.');
      }
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY || '',
      });
    }

    // Initialize services
    this.prisma = new PrismaClient();
    this.contextBuilder = new ContextBuilder();
    this.searchSystem = new HybridSearchSystem();
    this.codeRepository = new R2CodeRepository();
    this.docIntegration = new DocumentationIntegration();
    this.codeReviewer = new AutomatedCodeReviewer();
    this.optimizer = new ComponentOptimizer();
    this.promptBuilder = new PromptBuilder();
  }

  /**
   * Generate a UI component with full context
   */
  async generate(request: GenerationRequest): Promise<GeneratedComponent> {
    console.log('🚀 Starting AI component generation...');
    
    try {
      // 1. Build comprehensive context
      console.log('📊 Building context from all sources...');
      const context = await this.contextBuilder.buildContext(request);
      
      // 2. Search for similar components
      console.log('🔍 Searching for similar components...');
      const similarComponents = await this.searchSystem.findSimilarComponents(request);
      
      // 3. Fetch relevant documentation
      console.log('📚 Fetching framework documentation...');
      const documentation = await this.docIntegration.fetchFrameworkDocs(
        request.framework || 'react',
        this.inferComponentType(request.prompt)
      );
      
      // 4. Retrieve code templates and patterns
      console.log('📝 Retrieving code patterns...');
      const codePatterns = await this.codeRepository.findTemplates(
        request.category || this.inferCategory(request.prompt),
        request.framework || 'react'
      );
      
      // 5. Generate component with AI
      console.log('🤖 Generating component with Claude...');
      const generatedComponent = await this.generateWithAI({
        request,
        context,
        similarComponents: similarComponents.results,
        documentation,
        codePatterns,
      });
      
      // 6. Review and validate
      console.log('🔍 Reviewing generated code...');
      const reviewResult = await this.codeReviewer.reviewComponent(
        generatedComponent,
        documentation
      );
      
      // 7. Optimize and enhance
      console.log('⚡ Optimizing component...');
      const optimizedComponent = await this.optimizer.optimize(
        generatedComponent,
        reviewResult
      );
      
      // 8. Store in R2
      console.log('💾 Storing component...');
      const componentId = await this.codeRepository.storeGeneratedComponent(
        optimizedComponent
      );
      
      // Add metadata
      const finalComponent: GeneratedComponent = {
        ...optimizedComponent,
        id: componentId,
        metadata: {
          generatedAt: new Date(),
          contextUsed: context,
          similarComponents: similarComponents.results.map(c => c.id),
          reviewScore: reviewResult.score,
          performanceOptimizations: this.optimizer.getAppliedOptimizations(),
          accessibilityFeatures: this.extractAccessibilityFeatures(optimizedComponent.code),
        },
      };
      
      console.log('✅ Component generation complete!');
      console.log(`📊 Quality Score: ${reviewResult.score}/100`);
      console.log(`🎯 Similar components found: ${similarComponents.results.length}`);
      
      return finalComponent;
      
    } catch (error) {
      console.error('❌ Error generating component:', error);
      throw new Error(`Component generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if authenticated (for session auth)
   */
  async ensureAuthenticated(): Promise<void> {
    if (this.useSessionAuth && this.sessionClient) {
      const isAuth = await this.sessionClient.isAuthenticated();
      if (!isAuth) {
        throw new Error('Not authenticated with Claude AI. Run "revolutionary-ui ai-auth" first.');
      }
    }
  }

  /**
   * Generate component using Claude
   */
  private async generateWithAI(fullContext: {
    request: GenerationRequest;
    context: EnhancedGenerationContext;
    similarComponents: any[];
    documentation: any;
    codePatterns: any[];
  }): Promise<GeneratedComponent> {
    // Build enhanced prompt with all context
    const prompt = this.promptBuilder.buildEnhancedPrompt(fullContext);
    const systemPrompt = this.promptBuilder.buildSystemPrompt(fullContext.context);
    
    try {
      let responseText: string;
      
      if (this.useSessionAuth && this.sessionClient) {
        // Use session-based auth
        await this.ensureAuthenticated();
        
        const response = await this.sessionClient.createMessage({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          system: systemPrompt,
          max_tokens: 8000,
          temperature: 0.7,
        });
        
        responseText = response.content;
      } else if (this.anthropic) {
        // Use API key auth
        const response = await this.anthropic.messages.create({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          system: systemPrompt,
          max_tokens: 8000,
          temperature: 0.7,
        });
        
        // Extract code from response
        const content = response.content[0];
        if (content.type !== 'text') {
          throw new Error('Unexpected response type from Claude');
        }
        
        responseText = content.text;
      } else {
        throw new Error('No authentication method configured');
      }
      
      const generatedCode = this.extractCodeFromResponse(responseText);
      const dependencies = this.extractDependencies(generatedCode);
      const tags = this.extractTags(generatedCode, fullContext.request);
      
      return {
        code: generatedCode,
        framework: fullContext.request.framework || 'react',
        category: fullContext.request.category || this.inferCategory(fullContext.request.prompt),
        tags,
        dependencies,
        qualityScore: 0, // Will be set by reviewer
      };
      
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw new Error('Failed to generate component with AI');
    }
  }

  /**
   * Extract code from AI response
   */
  private extractCodeFromResponse(response: string): string {
    // Look for code blocks
    const codeBlockRegex = /```(?:typescript|tsx|javascript|jsx)?\n([\s\S]*?)```/g;
    const matches = [...response.matchAll(codeBlockRegex)];
    
    if (matches.length > 0) {
      // Combine all code blocks
      return matches.map(match => match[1].trim()).join('\n\n');
    }
    
    // If no code blocks, assume the entire response is code
    return response.trim();
  }

  /**
   * Extract dependencies from code
   */
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

  /**
   * Extract tags from code and request
   */
  private extractTags(code: string, request: GenerationRequest): string[] {
    const tags = new Set<string>();
    
    // Add framework tag
    if (request.framework) {
      tags.add(request.framework);
    }
    
    // Add requirement tags
    if (request.requirements?.typescript) tags.add('typescript');
    if (request.requirements?.responsive) tags.add('responsive');
    if (request.requirements?.animations) tags.add('animations');
    if (request.requirements?.accessibility) tags.add('accessible');
    
    // Detect features from code
    if (code.includes('useState') || code.includes('ref(')) tags.add('interactive');
    if (code.includes('form') || code.includes('input')) tags.add('form');
    if (code.includes('table') || code.includes('grid')) tags.add('data-display');
    if (code.includes('chart') || code.includes('graph')) tags.add('visualization');
    if (code.includes('animation') || code.includes('transition')) tags.add('animated');
    if (code.includes('async') || code.includes('await')) tags.add('async');
    if (code.includes('websocket') || code.includes('socket')) tags.add('real-time');
    
    return Array.from(tags);
  }

  /**
   * Extract accessibility features from code
   */
  private extractAccessibilityFeatures(code: string): string[] {
    const features = [];
    
    if (code.includes('aria-')) features.push('ARIA labels');
    if (code.includes('role=')) features.push('ARIA roles');
    if (code.includes('tabIndex')) features.push('Keyboard navigation');
    if (code.includes('onKeyDown') || code.includes('onKeyPress')) features.push('Keyboard shortcuts');
    if (code.includes('focus')) features.push('Focus management');
    if (code.includes('alt=') || code.includes('title=')) features.push('Alternative text');
    
    return features;
  }

  /**
   * Infer component type from prompt
   */
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

  /**
   * Infer category from prompt
   */
  private inferCategory(prompt: string): string {
    const lowercasePrompt = prompt.toLowerCase();
    
    if (lowercasePrompt.includes('form') || lowercasePrompt.includes('input')) return 'Forms & Inputs';
    if (lowercasePrompt.includes('table') || lowercasePrompt.includes('grid') || lowercasePrompt.includes('list')) return 'Data Display';
    if (lowercasePrompt.includes('nav') || lowercasePrompt.includes('menu') || lowercasePrompt.includes('breadcrumb')) return 'Navigation';
    if (lowercasePrompt.includes('modal') || lowercasePrompt.includes('dialog') || lowercasePrompt.includes('popup')) return 'Overlays';
    if (lowercasePrompt.includes('chart') || lowercasePrompt.includes('graph') || lowercasePrompt.includes('analytics')) return 'Data Visualization';
    if (lowercasePrompt.includes('dashboard') || lowercasePrompt.includes('admin')) return 'Admin & Dashboard';
    if (lowercasePrompt.includes('hero') || lowercasePrompt.includes('landing') || lowercasePrompt.includes('cta')) return 'Marketing';
    
    return 'Layout';
  }

  /**
   * Generate multiple variations of a component
   */
  async generateVariations(
    request: GenerationRequest,
    count: number = 3
  ): Promise<GeneratedComponent[]> {
    console.log(`🎨 Generating ${count} variations...`);
    
    const variations = await Promise.all(
      Array.from({ length: count }, (_, i) => 
        this.generate({
          ...request,
          prompt: `${request.prompt} (Variation ${i + 1})`,
        })
      )
    );
    
    return variations;
  }

  /**
   * Translate component to different framework
   */
  async translateComponent(
    component: GeneratedComponent,
    targetFramework: string
  ): Promise<GeneratedComponent> {
    console.log(`🔄 Translating component from ${component.framework} to ${targetFramework}...`);
    
    const request: GenerationRequest = {
      prompt: `Translate this ${component.framework} component to ${targetFramework}. Maintain all functionality, styling, and features.`,
      framework: targetFramework,
      category: component.category,
      requirements: {
        typescript: component.code.includes('interface') || component.code.includes(': '),
        accessibility: 'WCAG AA',
        responsive: true,
      },
      context: {
        existingComponents: [component.code],
      },
    };
    
    return this.generate(request);
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}