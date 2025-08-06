/**
 * Component Generation Pipeline - High-level wrapper for the AI generation system
 */

import { AIGenerationEngine } from './AIGenerationEngine';
import type { GenerationRequest, GeneratedComponent } from './types';
import { PrismaClient } from '@prisma/client';
import { UpstashVectorService } from '../../services/upstash-vector-service';
import fs from 'fs/promises';
import path from 'path';

interface PipelineOptions {
  model?: 'opus-4' | 'sonnet-4';
  saveToFile?: boolean;
  outputDir?: string;
  trackUsage?: boolean;
  useSessionAuth?: boolean;
}

interface GenerationResult {
  component: GeneratedComponent;
  filePath?: string;
  usage?: {
    tokensUsed: number;
    timeElapsed: number;
    contextSize: number;
  };
}

interface BatchGenerationRequest {
  requests: GenerationRequest[];
  options?: PipelineOptions;
}

export class ComponentGenerationPipeline {
  private engine: AIGenerationEngine;
  private prisma: PrismaClient;
  private vectorService: UpstashVectorService;
  private defaultOutputDir: string;

  constructor(options?: PipelineOptions) {
    this.engine = new AIGenerationEngine({
      model: options?.model,
      useSessionAuth: options?.useSessionAuth,
    });
    this.prisma = new PrismaClient();
    this.vectorService = UpstashVectorService.getInstance();
    this.defaultOutputDir = options?.outputDir || path.join(process.cwd(), 'generated-components');
  }

  /**
   * Generate a single component
   */
  async generateComponent(
    request: GenerationRequest,
    options?: PipelineOptions
  ): Promise<GenerationResult> {
    console.log('\n🚀 Starting component generation pipeline...');
    console.log(`📝 Request: "${request.prompt}"`);
    console.log(`🎯 Framework: ${request.framework || 'React'}`);
    console.log(`📁 Category: ${request.category || 'Auto-detected'}`);

    const startTime = Date.now();

    try {
      // Generate the component
      const component = await this.engine.generate(request);

      // Track usage if requested
      const usage = options?.trackUsage ? {
        tokensUsed: this.estimateTokens(component.code),
        timeElapsed: Date.now() - startTime,
        contextSize: JSON.stringify(component.metadata?.contextUsed || {}).length,
      } : undefined;

      // Save to file if requested
      let filePath: string | undefined;
      if (options?.saveToFile) {
        filePath = await this.saveComponentToFile(component, options.outputDir);
        console.log(`💾 Component saved to: ${filePath}`);
      }

      // Store in database for future reference
      await this.storeGenerationRecord(request, component);

      // Update vector embeddings for future searches
      await this.updateVectorEmbeddings(component);

      console.log('\n✅ Generation pipeline complete!');
      console.log(`⏱️  Time elapsed: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
      console.log(`📊 Quality score: ${component.qualityScore}/100`);

      return {
        component,
        filePath,
        usage,
      };
    } catch (error) {
      console.error('❌ Generation pipeline failed:', error);
      throw error;
    }
  }

  /**
   * Generate multiple components in batch
   */
  async generateBatch(batchRequest: BatchGenerationRequest): Promise<GenerationResult[]> {
    console.log(`\n🚀 Starting batch generation of ${batchRequest.requests.length} components...`);

    const results: GenerationResult[] = [];
    
    for (let i = 0; i < batchRequest.requests.length; i++) {
      console.log(`\n📦 Processing component ${i + 1}/${batchRequest.requests.length}`);
      
      try {
        const result = await this.generateComponent(
          batchRequest.requests[i],
          batchRequest.options
        );
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to generate component ${i + 1}:`, error);
        results.push({
          component: {
            code: '// Generation failed',
            framework: batchRequest.requests[i].framework || 'react',
            qualityScore: 0,
          },
        });
      }
    }

    console.log(`\n✅ Batch generation complete: ${results.filter(r => r.component.qualityScore > 0).length}/${batchRequest.requests.length} successful`);
    
    return results;
  }

  /**
   * Generate component variations
   */
  async generateVariations(
    request: GenerationRequest,
    count: number = 3,
    options?: PipelineOptions
  ): Promise<GenerationResult[]> {
    console.log(`\n🎨 Generating ${count} variations of component...`);

    const variations = await this.engine.generateVariations(request, count);
    const results: GenerationResult[] = [];

    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      
      let filePath: string | undefined;
      if (options?.saveToFile) {
        filePath = await this.saveComponentToFile(
          variation,
          options.outputDir,
          `variation-${i + 1}`
        );
      }

      results.push({
        component: variation,
        filePath,
      });
    }

    return results;
  }

  /**
   * Translate component to different framework
   */
  async translateComponent(
    component: GeneratedComponent,
    targetFramework: string,
    options?: PipelineOptions
  ): Promise<GenerationResult> {
    console.log(`\n🔄 Translating component from ${component.framework} to ${targetFramework}...`);

    const translated = await this.engine.translateComponent(component, targetFramework);

    let filePath: string | undefined;
    if (options?.saveToFile) {
      filePath = await this.saveComponentToFile(
        translated,
        options.outputDir,
        `${targetFramework}-version`
      );
    }

    return {
      component: translated,
      filePath,
    };
  }

  /**
   * Generate component from natural language with interactive refinement
   */
  async generateInteractive(
    initialPrompt: string,
    options?: PipelineOptions
  ): Promise<GenerationResult> {
    console.log('\n🤖 Starting interactive component generation...');

    // First, analyze the prompt to extract requirements
    const requirements = await this.analyzePrompt(initialPrompt);
    
    console.log('\n📋 Detected requirements:');
    console.log(`   Framework: ${requirements.framework || 'React'}`);
    console.log(`   Category: ${requirements.category || 'Auto-detected'}`);
    console.log(`   Features: ${requirements.features?.join(', ') || 'Standard'}`);

    // Generate initial component
    const request: GenerationRequest = {
      prompt: initialPrompt,
      framework: requirements.framework,
      category: requirements.category,
      requirements: {
        typescript: true,
        accessibility: 'WCAG AA',
        responsive: true,
        features: requirements.features,
      },
    };

    return this.generateComponent(request, options);
  }

  /**
   * Generate component with specific design system
   */
  async generateWithDesignSystem(
    request: GenerationRequest,
    designSystemId: string,
    options?: PipelineOptions
  ): Promise<GenerationResult> {
    console.log(`\n🎨 Generating component with design system: ${designSystemId}`);

    // Fetch design system from database
    const designSystem = await this.fetchDesignSystem(designSystemId);

    // Enhance request with design system context
    const enhancedRequest: GenerationRequest = {
      ...request,
      designSystem: designSystemId,
      context: {
        ...request.context,
        designTokens: designSystem.tokens,
        colorPalette: designSystem.colorPalette,
        typographyScale: designSystem.typographyScale,
      },
    };

    return this.generateComponent(enhancedRequest, options);
  }

  /**
   * Validate generated component
   */
  async validateComponent(component: GeneratedComponent): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    console.log('\n🔍 Validating generated component...');

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for basic structure
    if (!component.code || component.code.trim().length === 0) {
      errors.push('Component code is empty');
    }

    // Check for export
    if (!component.code.includes('export')) {
      errors.push('Component is not exported');
    }

    // Check framework-specific requirements
    switch (component.framework) {
      case 'react':
        if (!component.code.includes('function') && !component.code.includes('const')) {
          errors.push('No React component found');
        }
        break;
      case 'vue':
        if (!component.code.includes('<template>') && !component.code.includes('render')) {
          errors.push('No Vue template found');
        }
        break;
      case 'angular':
        if (!component.code.includes('@Component')) {
          errors.push('No Angular component decorator found');
        }
        break;
    }

    // Check quality score
    if (component.qualityScore < 60) {
      warnings.push(`Low quality score: ${component.qualityScore}/100`);
    }

    const isValid = errors.length === 0;

    console.log(`   Valid: ${isValid ? '✅' : '❌'}`);
    if (errors.length > 0) {
      console.log(`   Errors: ${errors.join(', ')}`);
    }
    if (warnings.length > 0) {
      console.log(`   Warnings: ${warnings.join(', ')}`);
    }

    return { isValid, errors, warnings };
  }

  // Private helper methods

  private async saveComponentToFile(
    component: GeneratedComponent,
    outputDir?: string,
    suffix?: string
  ): Promise<string> {
    const dir = outputDir || this.defaultOutputDir;
    await fs.mkdir(dir, { recursive: true });

    const extension = this.getFileExtension(component.framework);
    const fileName = `${component.category?.toLowerCase().replace(/\s+/g, '-') || 'component'}${suffix ? `-${suffix}` : ''}.${extension}`;
    const filePath = path.join(dir, fileName);

    // Add file header with metadata
    const fileContent = `/**
 * Generated by Revolutionary UI - AI Generation System
 * Framework: ${component.framework}
 * Category: ${component.category || 'General'}
 * Quality Score: ${component.qualityScore}/100
 * Generated: ${new Date().toISOString()}
 * Tags: ${component.tags?.join(', ') || 'none'}
 */

${component.code}`;

    await fs.writeFile(filePath, fileContent, 'utf-8');

    return filePath;
  }

  private getFileExtension(framework: string): string {
    const extensions: Record<string, string> = {
      react: 'tsx',
      vue: 'vue',
      angular: 'ts',
      svelte: 'svelte',
    };
    return extensions[framework.toLowerCase()] || 'tsx';
  }

  private async storeGenerationRecord(
    request: GenerationRequest,
    component: GeneratedComponent
  ): Promise<void> {
    try {
      // Store in a generation history table (would need to be added to schema)
      console.log('📊 Storing generation record...');
      // This would store the generation in the database for analytics
    } catch (error) {
      console.warn('Failed to store generation record:', error);
    }
  }

  private async updateVectorEmbeddings(component: GeneratedComponent): Promise<void> {
    try {
      // Update vector embeddings for future searches
      console.log('🔄 Updating vector embeddings...');
      
      const embedding = {
        id: `generated-${Date.now()}`,
        content: `${component.category} ${component.tags?.join(' ')} ${component.code.substring(0, 500)}`,
        metadata: {
          framework: component.framework,
          category: component.category,
          tags: component.tags,
          qualityScore: component.qualityScore,
          generated: true,
        },
      };

      await this.vectorService.upsert([embedding]);
    } catch (error) {
      console.warn('Failed to update vector embeddings:', error);
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  private async analyzePrompt(prompt: string): Promise<{
    framework?: string;
    category?: string;
    features?: string[];
  }> {
    const requirements: any = {};

    // Detect framework
    const frameworkKeywords = {
      react: ['react', 'jsx', 'hooks', 'useState'],
      vue: ['vue', 'composition api', 'ref', 'reactive'],
      angular: ['angular', 'directive', 'service', 'observable'],
      svelte: ['svelte', 'store', 'reactive'],
    };

    for (const [framework, keywords] of Object.entries(frameworkKeywords)) {
      if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
        requirements.framework = framework;
        break;
      }
    }

    // Detect category
    const categoryKeywords = {
      'Forms & Inputs': ['form', 'input', 'validation', 'field'],
      'Data Display': ['table', 'list', 'grid', 'data'],
      'Navigation': ['nav', 'menu', 'breadcrumb', 'tabs'],
      'Overlays': ['modal', 'dialog', 'popup', 'tooltip'],
      'Data Visualization': ['chart', 'graph', 'visualization', 'analytics'],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
        requirements.category = category;
        break;
      }
    }

    // Extract features
    const features = [];
    if (prompt.includes('responsive')) features.push('responsive');
    if (prompt.includes('dark mode')) features.push('dark-mode');
    if (prompt.includes('animation')) features.push('animations');
    if (prompt.includes('real-time')) features.push('real-time');
    if (prompt.includes('filter')) features.push('filtering');
    if (prompt.includes('sort')) features.push('sorting');

    if (features.length > 0) {
      requirements.features = features;
    }

    return requirements;
  }

  private async fetchDesignSystem(designSystemId: string): Promise<any> {
    // Mock implementation - would fetch from database
    return {
      id: designSystemId,
      name: 'Default Design System',
      tokens: {
        colors: {
          primary: '#3b82f6',
          secondary: '#6366f1',
        },
        typography: {
          base: { fontSize: '16px', lineHeight: '1.5' },
        },
        spacing: {
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
        },
      },
      colorPalette: {
        name: 'default',
        colors: {
          primary: '#3b82f6',
        },
      },
      typographyScale: {
        name: 'default',
        sizes: {
          base: '1rem',
        },
      },
    };
  }

  /**
   * Get generation statistics
   */
  async getGenerationStats(): Promise<{
    totalGenerated: number;
    averageQuality: number;
    popularCategories: Array<{ category: string; count: number }>;
    frameworkDistribution: Record<string, number>;
  }> {
    // This would query the database for actual stats
    return {
      totalGenerated: 150,
      averageQuality: 85,
      popularCategories: [
        { category: 'Forms & Inputs', count: 45 },
        { category: 'Data Display', count: 38 },
        { category: 'Navigation', count: 25 },
      ],
      frameworkDistribution: {
        react: 80,
        vue: 35,
        angular: 20,
        svelte: 15,
      },
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.engine.cleanup();
    await this.prisma.$disconnect();
  }
}