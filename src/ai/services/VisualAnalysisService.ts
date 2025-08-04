import { AI_MODELS_CONFIG, getVisionModels, AIModelDetails } from '../models/AIModelsConfig';
import chalk from 'chalk';
import ora from 'ora';
import { readFileSync } from 'fs';

export interface VisualAnalysisOptions {
  provider?: string;
  model?: string;
  analysis?: {
    ui?: boolean;
    colors?: boolean;
    layout?: boolean;
    components?: boolean;
    accessibility?: boolean;
    code?: boolean;
  };
  outputFormat?: 'json' | 'markdown' | 'structured';
}

export interface VisualAnalysisResult {
  provider: string;
  model: string;
  timestamp: number;
  analysis: {
    ui?: UIAnalysis;
    colors?: ColorAnalysis;
    layout?: LayoutAnalysis;
    components?: ComponentAnalysis[];
    accessibility?: AccessibilityAnalysis;
    codeGeneration?: CodeGenerationResult;
  };
  rawResponse?: string;
}

export interface UIAnalysis {
  style: string;
  framework: string;
  designSystem: string;
  patterns: string[];
  modernityScore: number;
  consistency: number;
}

export interface ColorAnalysis {
  primary: string[];
  secondary: string[];
  accent: string[];
  background: string[];
  text: string[];
  contrast: { ratio: number; wcagLevel: string }[];
}

export interface LayoutAnalysis {
  type: string;
  grid: string;
  spacing: string;
  responsive: boolean;
  breakpoints: string[];
  sections: Array<{ name: string; purpose: string }>;
}

export interface ComponentAnalysis {
  name: string;
  type: string;
  location: string;
  description: string;
  properties?: Record<string, any>;
  interactions?: string[];
}

export interface AccessibilityAnalysis {
  score: number;
  issues: Array<{
    severity: 'critical' | 'major' | 'minor';
    description: string;
    element: string;
    recommendation: string;
  }>;
  positives: string[];
}

export interface CodeGenerationResult {
  framework: string;
  components: Array<{
    name: string;
    code: string;
    dependencies: string[];
  }>;
  styles: {
    type: 'css' | 'scss' | 'styled-components' | 'tailwind';
    code: string;
  };
  setup: string;
}

export class VisualAnalysisService {
  private visionModels = getVisionModels();
  
  async analyzeImage(
    imagePath: string,
    options: VisualAnalysisOptions = {}
  ): Promise<VisualAnalysisResult> {
    const spinner = ora('Analyzing image...').start();
    
    try {
      // Select the best vision model based on requirements
      const { provider, model } = this.selectVisionModel(options);
      
      spinner.text = `Using ${provider} - ${model.name} for analysis`;
      
      // Read image file
      const imageBuffer = readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      // Prepare analysis prompt
      const prompt = this.buildAnalysisPrompt(options.analysis);
      
      // Call the appropriate provider
      const result = await this.callVisionModel(provider, model, base64Image, prompt, options);
      
      spinner.succeed('Analysis complete');
      
      return result;
    } catch (error: any) {
      spinner.fail('Analysis failed');
      throw error;
    }
  }
  
  async analyzeScreenshot(
    screenshotPath: string,
    targetFramework: string = 'react',
    options: VisualAnalysisOptions = {}
  ): Promise<CodeGenerationResult> {
    console.log(chalk.cyan('🎨 Analyzing screenshot for code generation...'));
    
    const analysis = await this.analyzeImage(screenshotPath, {
      ...options,
      analysis: {
        ui: true,
        components: true,
        layout: true,
        colors: true,
        code: true
      }
    });
    
    // Generate code based on analysis
    return this.generateCodeFromAnalysis(analysis, targetFramework);
  }
  
  private selectVisionModel(options: VisualAnalysisOptions): { provider: string; model: AIModelDetails } {
    // If specific provider/model requested
    if (options.provider && options.model) {
      const providerConfig = AI_MODELS_CONFIG.find(p => p.id === options.provider);
      const modelConfig = providerConfig?.models.find(m => m.id === options.model);
      
      if (modelConfig?.capabilities.vision) {
        return { provider: options.provider, model: modelConfig };
      }
    }
    
    // Auto-select based on requirements
    const visionModels = this.visionModels;
    
    // For UI/code analysis, prefer models with strong coding capabilities
    if (options.analysis?.code || options.analysis?.components) {
      // Prefer Claude 3.5 Sonnet or GPT-4 Vision
      const preferred = visionModels.find(vm => 
        vm.model.id === 'claude-3-5-sonnet-20241022' ||
        vm.model.id === 'gpt-4-vision-preview'
      );
      if (preferred) return preferred;
    }
    
    // Default to the best available vision model
    return visionModels[0];
  }
  
  private buildAnalysisPrompt(analysis?: VisualAnalysisOptions['analysis']): string {
    const sections: string[] = [];
    
    sections.push('Analyze this image of a user interface and provide detailed information about:');
    
    if (analysis?.ui !== false) {
      sections.push(`
### UI Analysis:
- Overall design style (modern, classic, minimalist, etc.)
- Likely framework or library used
- Design system or component library detected
- UI patterns and best practices observed
- Modernity score (1-10)
- Design consistency score (1-10)`);
    }
    
    if (analysis?.colors !== false) {
      sections.push(`
### Color Analysis:
- Primary colors (hex values)
- Secondary colors
- Accent colors
- Background colors
- Text colors
- Color contrast ratios and WCAG compliance`);
    }
    
    if (analysis?.layout !== false) {
      sections.push(`
### Layout Analysis:
- Layout type (grid, flexbox, etc.)
- Grid system details
- Spacing and rhythm
- Responsive design approach
- Identified sections and their purposes`);
    }
    
    if (analysis?.components !== false) {
      sections.push(`
### Component Analysis:
- List all UI components visible
- Component types and purposes
- Component hierarchy
- Interactive elements
- State variations visible`);
    }
    
    if (analysis?.accessibility !== false) {
      sections.push(`
### Accessibility Analysis:
- Accessibility score (1-100)
- Potential accessibility issues
- Color contrast problems
- Missing alt text or labels
- Positive accessibility features`);
    }
    
    if (analysis?.code) {
      sections.push(`
### Code Generation Hints:
- Recommended framework
- Component structure
- CSS approach (Tailwind, CSS Modules, styled-components)
- Required dependencies
- Implementation notes`);
    }
    
    sections.push('\nProvide your analysis in a structured format that can be parsed.');
    
    return sections.join('\n');
  }
  
  private async callVisionModel(
    providerId: string,
    model: AIModelDetails,
    base64Image: string,
    prompt: string,
    options: VisualAnalysisOptions
  ): Promise<VisualAnalysisResult> {
    // This is a placeholder - in real implementation, you'd call the actual APIs
    // For now, we'll simulate the response structure
    
    console.log(chalk.dim(`Calling ${providerId} API with model ${model.id}...`));
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response based on the model
    const mockAnalysis: VisualAnalysisResult = {
      provider: providerId,
      model: model.id,
      timestamp: Date.now(),
      analysis: {
        ui: {
          style: 'Modern, minimalist',
          framework: 'React with Material-UI',
          designSystem: 'Material Design 3',
          patterns: ['Card layout', 'Responsive grid', 'FAB', 'App bar'],
          modernityScore: 9,
          consistency: 8.5
        },
        colors: {
          primary: ['#1976d2', '#1565c0'],
          secondary: ['#dc004e', '#c51162'],
          accent: ['#ff9800', '#ffc107'],
          background: ['#ffffff', '#f5f5f5'],
          text: ['#212121', '#757575'],
          contrast: [
            { ratio: 7.1, wcagLevel: 'AAA' },
            { ratio: 4.5, wcagLevel: 'AA' }
          ]
        },
        layout: {
          type: 'CSS Grid with Flexbox',
          grid: '12-column responsive grid',
          spacing: '8px base unit (Material Design)',
          responsive: true,
          breakpoints: ['320px', '768px', '1024px', '1440px'],
          sections: [
            { name: 'Header', purpose: 'Navigation and branding' },
            { name: 'Hero', purpose: 'Main call-to-action' },
            { name: 'Features', purpose: 'Product features grid' },
            { name: 'Footer', purpose: 'Links and contact' }
          ]
        },
        components: [
          {
            name: 'AppBar',
            type: 'Navigation',
            location: 'Top',
            description: 'Primary navigation with logo and menu items',
            properties: { elevation: 4, position: 'fixed' }
          },
          {
            name: 'HeroSection',
            type: 'Content',
            location: 'Main',
            description: 'Large banner with CTA buttons',
            properties: { height: '80vh', backgroundImage: true }
          },
          {
            name: 'FeatureCard',
            type: 'Content',
            location: 'Grid',
            description: 'Card component for features',
            properties: { elevation: 2, padding: '24px' },
            interactions: ['Hover effect', 'Click to expand']
          }
        ],
        accessibility: {
          score: 85,
          issues: [
            {
              severity: 'minor',
              description: 'Some images may be missing alt text',
              element: 'img tags in hero section',
              recommendation: 'Add descriptive alt text to all images'
            }
          ],
          positives: [
            'Good color contrast ratios',
            'Semantic HTML structure',
            'Focus indicators visible'
          ]
        }
      },
      rawResponse: 'Full AI response would be here...'
    };
    
    return mockAnalysis;
  }
  
  private async generateCodeFromAnalysis(
    analysis: VisualAnalysisResult,
    framework: string
  ): Promise<CodeGenerationResult> {
    console.log(chalk.cyan(`Generating ${framework} code from analysis...`));
    
    // Based on the analysis, generate appropriate code
    const codeResult: CodeGenerationResult = {
      framework,
      components: [],
      styles: {
        type: 'css',
        code: ''
      },
      setup: ''
    };
    
    // Generate components based on detected components
    if (analysis.analysis.components) {
      for (const component of analysis.analysis.components) {
        codeResult.components.push(
          this.generateComponent(component, framework, analysis)
        );
      }
    }
    
    // Generate styles based on colors and layout
    codeResult.styles = this.generateStyles(analysis, framework);
    
    // Generate setup instructions
    codeResult.setup = this.generateSetupInstructions(analysis, framework);
    
    return codeResult;
  }
  
  private generateComponent(
    component: ComponentAnalysis,
    framework: string,
    analysis: VisualAnalysisResult
  ): { name: string; code: string; dependencies: string[] } {
    // Generate component code based on framework
    if (framework === 'react') {
      return {
        name: component.name,
        dependencies: ['react'],
        code: `import React from 'react';

interface ${component.name}Props {
  // Add props based on analysis
}

export const ${component.name}: React.FC<${component.name}Props> = (props) => {
  return (
    <div className="${component.name.toLowerCase()}">
      {/* Component implementation based on ${component.description} */}
    </div>
  );
};`
      };
    }
    
    // Add other frameworks as needed
    return {
      name: component.name,
      code: '// Framework not implemented',
      dependencies: []
    };
  }
  
  private generateStyles(
    analysis: VisualAnalysisResult,
    framework: string
  ): { type: 'css' | 'scss' | 'styled-components' | 'tailwind'; code: string } {
    const colors = analysis.analysis.colors;
    
    if (!colors) {
      return { type: 'css', code: '' };
    }
    
    // Generate CSS variables
    const cssVars = `
:root {
  /* Primary Colors */
  ${colors.primary.map((c, i) => `--color-primary-${i}: ${c};`).join('\n  ')}
  
  /* Secondary Colors */
  ${colors.secondary.map((c, i) => `--color-secondary-${i}: ${c};`).join('\n  ')}
  
  /* Background Colors */
  ${colors.background.map((c, i) => `--color-bg-${i}: ${c};`).join('\n  ')}
  
  /* Text Colors */
  ${colors.text.map((c, i) => `--color-text-${i}: ${c};`).join('\n  ')}
  
  /* Spacing */
  --spacing-unit: 8px;
  --spacing-xs: calc(var(--spacing-unit) * 0.5);
  --spacing-sm: var(--spacing-unit);
  --spacing-md: calc(var(--spacing-unit) * 2);
  --spacing-lg: calc(var(--spacing-unit) * 3);
  --spacing-xl: calc(var(--spacing-unit) * 4);
}`;
    
    return {
      type: 'css',
      code: cssVars
    };
  }
  
  private generateSetupInstructions(
    analysis: VisualAnalysisResult,
    framework: string
  ): string {
    const ui = analysis.analysis.ui;
    
    let instructions = `# Setup Instructions for ${framework}\n\n`;
    
    if (ui?.framework.includes('Material')) {
      instructions += `## Install Material-UI\n\`\`\`bash\nnpm install @mui/material @emotion/react @emotion/styled\n\`\`\`\n\n`;
    }
    
    instructions += `## Project Structure\n\`\`\`
src/
  components/
    ${analysis.analysis.components?.map(c => c.name + '.tsx').join('\n    ') || ''}
  styles/
    variables.css
    global.css
  App.tsx
\`\`\`\n\n`;
    
    instructions += `## Implementation Notes\n`;
    instructions += `- Design style: ${ui?.style || 'Not detected'}\n`;
    instructions += `- Grid system: ${analysis.analysis.layout?.grid || 'Not detected'}\n`;
    instructions += `- Responsive breakpoints: ${analysis.analysis.layout?.breakpoints?.join(', ') || 'Not detected'}\n`;
    
    return instructions;
  }
  
  // Compare multiple vision models on the same image
  async compareModels(
    imagePath: string,
    models: Array<{ provider: string; model: string }>,
    options: VisualAnalysisOptions = {}
  ): Promise<Array<VisualAnalysisResult>> {
    console.log(chalk.cyan('🔄 Comparing vision models...\n'));
    
    const results: VisualAnalysisResult[] = [];
    
    for (const { provider, model } of models) {
      console.log(chalk.yellow(`Testing ${provider} - ${model}...`));
      
      try {
        const result = await this.analyzeImage(imagePath, {
          ...options,
          provider,
          model
        });
        
        results.push(result);
        console.log(chalk.green(`✅ ${provider} complete\n`));
      } catch (error) {
        console.log(chalk.red(`❌ ${provider} failed: ${error}\n`));
      }
    }
    
    return results;
  }
  
  // Get recommended models for specific use cases
  getRecommendedModels(useCase: 'ui-analysis' | 'code-generation' | 'accessibility' | 'general'): Array<{ provider: string; model: AIModelDetails; reason: string }> {
    const recommendations: Array<{ provider: string; model: AIModelDetails; reason: string }> = [];
    
    switch (useCase) {
      case 'ui-analysis':
        recommendations.push({
          provider: 'anthropic',
          model: AI_MODELS_CONFIG.find(p => p.id === 'anthropic')!.models.find(m => m.id === 'claude-3-5-sonnet-20241022')!,
          reason: 'Best-in-class vision understanding and detailed analysis'
        });
        recommendations.push({
          provider: 'openai',
          model: AI_MODELS_CONFIG.find(p => p.id === 'openai')!.models.find(m => m.id === 'gpt-4-vision-preview')!,
          reason: 'Excellent at identifying UI patterns and frameworks'
        });
        break;
        
      case 'code-generation':
        recommendations.push({
          provider: 'anthropic',
          model: AI_MODELS_CONFIG.find(p => p.id === 'anthropic')!.models.find(m => m.id === 'claude-3-5-sonnet-20241022')!,
          reason: 'Superior at generating clean, production-ready code from visuals'
        });
        recommendations.push({
          provider: 'openai',
          model: AI_MODELS_CONFIG.find(p => p.id === 'openai')!.models.find(m => m.id === 'gpt-4-turbo-preview')!,
          reason: 'Great at understanding requirements and generating modular code'
        });
        break;
        
      case 'accessibility':
        recommendations.push({
          provider: 'google',
          model: AI_MODELS_CONFIG.find(p => p.id === 'google')!.models.find(m => m.id === 'gemini-1.5-pro')!,
          reason: 'Comprehensive analysis with attention to detail'
        });
        break;
        
      case 'general':
        recommendations.push({
          provider: 'google',
          model: AI_MODELS_CONFIG.find(p => p.id === 'google')!.models.find(m => m.id === 'gemini-1.5-flash')!,
          reason: 'Fast and cost-effective for quick analysis'
        });
        break;
    }
    
    return recommendations;
  }
}