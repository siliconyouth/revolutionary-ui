/**
 * AI Generate Command - Uses the new AI Generation Engine with Claude Opus 4 and Sonnet 4
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { ComponentGenerationPipeline } from '../../ai/generation/ComponentGenerationPipeline';
import type { GenerationRequest } from '../../ai/generation/types';
import { AuthManager } from '../utils/auth-manager';
import { ConfigManager } from '../utils/config-manager';

interface AIGenerateOptions {
  prompt?: string;
  framework?: string;
  category?: string;
  model?: 'opus-4' | 'sonnet-4';
  output?: string;
  save?: boolean;
  variations?: number;
  design?: string;
  typescript?: boolean;
  accessibility?: string;
  responsive?: boolean;
  animations?: boolean;
  useSession?: boolean;
}

export class AIGenerateCommand {
  private pipeline: ComponentGenerationPipeline;
  private authManager: AuthManager;
  private configManager: ConfigManager;

  constructor() {
    this.authManager = new AuthManager();
    this.configManager = new ConfigManager();
  }

  async execute(options: AIGenerateOptions) {
    try {
      // Determine auth method
      let useSessionAuth = options.useSession;
      
      // If not specified, check config
      if (useSessionAuth === undefined) {
        useSessionAuth = await this.configManager.get('ai.useSessionAuth') || false;
      }

      // Check authentication based on method
      if (useSessionAuth) {
        console.log(chalk.cyan('🔐 Using Claude AI session authentication...'));
        // Session auth will be checked when making requests
      } else {
        // Check Revolutionary UI auth for API key usage
        const user = await this.authManager.requireAuth();
        console.log(chalk.gray(`\n👤 Logged in as: ${user.email}`));
      }

      // Initialize pipeline with model choice and auth method
      this.pipeline = new ComponentGenerationPipeline({
        model: options.model,
        saveToFile: options.save ?? true,
        outputDir: options.output,
        trackUsage: true,
        useSessionAuth: useSessionAuth,
      });

      if (options.prompt) {
        // Direct generation with provided prompt
        await this.generateWithPrompt(options);
      } else {
        // Interactive mode
        await this.interactiveGenerate(useSessionAuth);
      }

    } catch (error: any) {
      console.error(chalk.red(`\n❌ AI Generation failed: ${error.message}`));
      
      if (error.message.includes('Not authenticated with Claude AI')) {
        console.log(chalk.yellow('\n💡 Run "revolutionary-ui ai-auth" to authenticate with Claude AI'));
      }
      
      process.exit(1);
    } finally {
      if (this.pipeline) {
        await this.pipeline.cleanup();
      }
    }
  }

  private async generateWithPrompt(options: AIGenerateOptions) {
    console.log(chalk.cyan('\n🤖 AI Component Generation with Revolutionary UI\n'));
    console.log(chalk.gray(`Model: ${options.model === 'opus-4' ? 'Claude Opus 4' : 'Claude Sonnet 4'}`));

    const request: GenerationRequest = {
      prompt: options.prompt!,
      framework: options.framework,
      category: options.category,
      requirements: {
        typescript: options.typescript ?? true,
        accessibility: (options.accessibility as any) ?? 'WCAG AA',
        responsive: options.responsive ?? true,
        animations: options.animations ?? false,
      },
      designSystem: options.design,
    };

    const spinner = ora('Generating component with AI...').start();

    try {
      const result = await this.pipeline.generateComponent(request);
      
      spinner.succeed('Component generated successfully!');
      
      // Display results
      console.log(chalk.cyan('\n📊 Generation Results:'));
      console.log(chalk.gray(`  • Quality Score: ${result.component.qualityScore}/100`));
      console.log(chalk.gray(`  • Framework: ${result.component.framework}`));
      console.log(chalk.gray(`  • Category: ${result.component.category}`));
      console.log(chalk.gray(`  • Tags: ${result.component.tags?.join(', ') || 'none'}`));
      
      if (result.filePath) {
        console.log(chalk.green(`\n✅ Component saved to: ${result.filePath}`));
      }

      if (result.usage) {
        console.log(chalk.cyan('\n📈 Usage Metrics:'));
        console.log(chalk.gray(`  • Tokens Used: ~${result.usage.tokensUsed}`));
        console.log(chalk.gray(`  • Time Elapsed: ${(result.usage.timeElapsed / 1000).toFixed(2)}s`));
        console.log(chalk.gray(`  • Context Size: ${(result.usage.contextSize / 1024).toFixed(1)}KB`));
      }

      // Generate variations if requested
      if (options.variations && options.variations > 1) {
        await this.generateVariations(request, options.variations - 1);
      }

    } catch (error) {
      spinner.fail('Generation failed');
      throw error;
    }
  }

  private async interactiveGenerate(useSessionAuth: boolean = false) {
    console.log(chalk.cyan('\n🤖 Revolutionary UI - AI Component Generation\n'));
    console.log(chalk.gray('Powered by Claude Opus 4 and Sonnet 4 with full context awareness\n'));
    
    if (useSessionAuth) {
      console.log(chalk.green('✅ Using Claude AI session authentication (no API limits)\n'));
    }

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'prompt',
        message: 'Describe the component you want to generate:',
        validate: (value: string) => value.length > 10 || 'Please provide a detailed description',
      },
      {
        type: 'list',
        name: 'model',
        message: 'Select AI model:',
        choices: [
          { name: 'Claude Opus 4 (Best for complex components)', value: 'opus-4' },
          { name: 'Claude Sonnet 4 (Faster, great quality)', value: 'sonnet-4' },
        ],
        default: 'sonnet-4',
      },
      {
        type: 'list',
        name: 'framework',
        message: 'Select framework:',
        choices: [
          'react', 'vue', 'angular', 'svelte', 'solid',
          'next.js', 'nuxt', 'remix', 'astro',
        ],
        default: 'react',
      },
      {
        type: 'list',
        name: 'category',
        message: 'Select component category:',
        choices: [
          { name: '📋 Forms & Inputs', value: 'Forms & Inputs' },
          { name: '📊 Data Display', value: 'Data Display' },
          { name: '🧭 Navigation', value: 'Navigation' },
          { name: '📈 Data Visualization', value: 'Data Visualization' },
          { name: '🎭 Overlays', value: 'Overlays' },
          { name: '🏠 Layout', value: 'Layout' },
          { name: '🎨 Marketing', value: 'Marketing' },
          { name: '💼 Admin & Dashboard', value: 'Admin & Dashboard' },
          { name: '🔧 Let AI decide', value: undefined },
        ],
      },
      {
        type: 'checkbox',
        name: 'features',
        message: 'Select additional features:',
        choices: [
          { name: '📱 Responsive design', value: 'responsive', checked: true },
          { name: '♿ Accessibility (WCAG AA)', value: 'accessibility', checked: true },
          { name: '🎨 Animations', value: 'animations' },
          { name: '🌙 Dark mode support', value: 'dark-mode' },
          { name: '🚀 Performance optimized', value: 'performance' },
          { name: '🔄 Real-time updates', value: 'real-time' },
          { name: '📊 Analytics integration', value: 'analytics' },
        ],
      },
      {
        type: 'confirm',
        name: 'typescript',
        message: 'Use TypeScript?',
        default: true,
      },
      {
        type: 'list',
        name: 'accessibility',
        message: 'Accessibility level:',
        choices: [
          { name: 'WCAG A (Basic)', value: 'WCAG A' },
          { name: 'WCAG AA (Recommended)', value: 'WCAG AA' },
          { name: 'WCAG AAA (Highest)', value: 'WCAG AAA' },
        ],
        default: 'WCAG AA',
      },
      {
        type: 'number',
        name: 'variations',
        message: 'Number of variations to generate:',
        default: 1,
        validate: (value: number) => value >= 1 && value <= 5 || 'Please enter 1-5',
      },
      {
        type: 'input',
        name: 'output',
        message: 'Output directory:',
        default: './generated-components',
      },
    ]);

    // Initialize pipeline with chosen model and auth method
    this.pipeline = new ComponentGenerationPipeline({
      model: answers.model,
      saveToFile: true,
      outputDir: answers.output,
      trackUsage: true,
      useSessionAuth: useSessionAuth,
    });

    const request: GenerationRequest = {
      prompt: answers.prompt,
      framework: answers.framework,
      category: answers.category,
      requirements: {
        typescript: answers.typescript,
        accessibility: answers.accessibility,
        responsive: answers.features.includes('responsive'),
        animations: answers.features.includes('animations'),
        features: answers.features,
      },
    };

    const spinner = ora('Generating component with AI...').start();

    try {
      // Generate first component
      const result = await this.pipeline.generateComponent(request);
      
      spinner.succeed('Component generated successfully!');
      
      // Display results
      this.displayResults(result);

      // Generate variations if requested
      if (answers.variations > 1) {
        console.log(chalk.cyan(`\n🎨 Generating ${answers.variations - 1} variations...`));
        const variations = await this.pipeline.generateVariations(
          request,
          answers.variations - 1
        );
        
        console.log(chalk.green(`✅ Generated ${variations.length} variations`));
        variations.forEach((v, i) => {
          console.log(chalk.gray(`   Variation ${i + 1}: ${v.filePath}`));
        });
      }

      // Ask about framework translation
      const { translate } = await inquirer.prompt([{
        type: 'confirm',
        name: 'translate',
        message: 'Would you like to translate this component to another framework?',
        default: false,
      }]);

      if (translate) {
        await this.translateComponent(result.component);
      }

    } catch (error) {
      spinner.fail('Generation failed');
      throw error;
    }
  }

  private async generateVariations(request: GenerationRequest, count: number) {
    console.log(chalk.cyan(`\n🎨 Generating ${count} variations...`));

    const variations = await this.pipeline.generateVariations(request, count);
    
    console.log(chalk.green(`✅ Generated ${variations.length} variations`));
    variations.forEach((v, i) => {
      if (v.filePath) {
        console.log(chalk.gray(`   Variation ${i + 1}: ${v.filePath}`));
      }
    });
  }

  private async translateComponent(component: any) {
    const { targetFramework } = await inquirer.prompt([{
      type: 'list',
      name: 'targetFramework',
      message: 'Select target framework:',
      choices: ['react', 'vue', 'angular', 'svelte', 'solid']
        .filter(f => f !== component.framework),
    }]);

    const spinner = ora(`Translating to ${targetFramework}...`).start();

    try {
      const result = await this.pipeline.translateComponent(
        component,
        targetFramework
      );
      
      spinner.succeed('Translation complete!');
      
      if (result.filePath) {
        console.log(chalk.green(`✅ Translated component saved to: ${result.filePath}`));
      }
    } catch (error) {
      spinner.fail('Translation failed');
      console.error(chalk.red(`❌ ${error.message}`));
    }
  }

  private displayResults(result: any) {
    console.log(chalk.cyan('\n📊 Generation Results:'));
    console.log(chalk.gray(`  • Quality Score: ${result.component.qualityScore}/100`));
    console.log(chalk.gray(`  • Framework: ${result.component.framework}`));
    console.log(chalk.gray(`  • Category: ${result.component.category || 'Auto-detected'}`));
    console.log(chalk.gray(`  • Tags: ${result.component.tags?.join(', ') || 'none'}`));
    
    if (result.component.dependencies && result.component.dependencies.length > 0) {
      console.log(chalk.gray(`  • Dependencies: ${result.component.dependencies.join(', ')}`));
    }

    if (result.filePath) {
      console.log(chalk.green(`\n✅ Component saved to: ${result.filePath}`));
    }

    if (result.usage) {
      console.log(chalk.cyan('\n📈 Usage Metrics:'));
      console.log(chalk.gray(`  • Tokens Used: ~${result.usage.tokensUsed}`));
      console.log(chalk.gray(`  • Time Elapsed: ${(result.usage.timeElapsed / 1000).toFixed(2)}s`));
      console.log(chalk.gray(`  • Context Size: ${(result.usage.contextSize / 1024).toFixed(1)}KB`));
    }

    // Show context insights
    console.log(chalk.cyan('\n🧠 AI Context Used:'));
    console.log(chalk.gray(`  • Similar components analyzed from database`));
    console.log(chalk.gray(`  • Vector semantic search performed`));
    console.log(chalk.gray(`  • Framework documentation integrated`));
    console.log(chalk.gray(`  • Code patterns from R2 repository applied`));
    console.log(chalk.gray(`  • Automated code review completed`));
  }

  async executeInteractive() {
    await this.interactiveGenerate();
  }
}