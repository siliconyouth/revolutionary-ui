import { BaseCommand, type CLIContext, createLogger, input, select } from '@revolutionary-ui/cli-core';
import { generateWithAI } from './generator.js';
import { getAllProviders } from './providers/registry.js';
import chalk from 'chalk';

export class AICommand extends BaseCommand {
  name = 'ai';
  description = 'Generate components using AI';
  
  constructor() {
    super();
    
    // Add options
    this.options = [
      {
        flags: '-p, --prompt <prompt>',
        description: 'Component description or prompt',
      },
      {
        flags: '-f, --framework <framework>',
        description: 'Target framework (react, vue, angular, svelte)',
        defaultValue: 'react',
      },
      {
        flags: '-o, --output <path>',
        description: 'Output file path',
      },
      {
        flags: '--factory <type>',
        description: 'Use factory pattern (form, table, dashboard, chart)',
      },
      {
        flags: '--no-preview',
        description: 'Skip preview',
      },
      {
        flags: '--no-interactive',
        description: 'Skip interactive prompts',
      },
      {
        flags: '--provider <provider>',
        description: 'AI provider (openai, anthropic, google, local)',
      },
    ];
  }
  
  async action(options: any, context: CLIContext): Promise<void> {
    const logger = createLogger();
    
    try {
      // Get prompt from options
      let finalPrompt = options.prompt;
      
      // Interactive mode if no prompt provided
      if (!finalPrompt && options.interactive !== false) {
        logger.info(chalk.bold('\n🤖 AI Component Generator\n'));
        
        finalPrompt = await input(
          'Describe the component you want to create:',
          'A modern dashboard with charts and statistics'
        );
      }
      
      if (!finalPrompt) {
        logger.error('No prompt provided. Use --prompt or provide it interactively.');
        return;
      }
      
      // Check available providers if not specified
      if (!options.provider && options.interactive !== false) {
        const providers = await getAllProviders();
        const availableProviders = providers.filter(p => p.available);
        
        if (availableProviders.length === 0) {
          logger.error('No AI providers are available.');
          logger.info('\nPlease configure an API key:');
          logger.info('  export OPENAI_API_KEY=<your-key>');
          logger.info('  export ANTHROPIC_API_KEY=<your-key>');
          logger.info('  export GOOGLE_API_KEY=<your-key>');
          logger.info('\nOr install Ollama for local AI:');
          logger.info('  https://ollama.ai');
          return;
        }
        
        if (availableProviders.length > 1) {
          options.provider = await select(
            'Select AI provider:',
            availableProviders.map(p => ({
              name: p.name,
              value: p.name,
              description: this.getProviderDescription(p.name),
            }))
          );
        } else {
          options.provider = availableProviders[0].name;
        }
      }
      
      // Set provider environment variable if specified
      if (options.provider) {
        process.env.RUI_AI_PROVIDER = options.provider;
      }
      
      // Generate the component
      await generateWithAI({
        prompt: finalPrompt,
        framework: options.framework,
        outputPath: options.output,
        preview: options.preview !== false,
        interactive: options.interactive !== false,
        factory: options.factory,
      });
      
    } catch (error: any) {
      logger.error('AI generation failed:', error.message);
      
      if (error.message.includes('API key')) {
        logger.info('\nTip: Make sure your API key is configured correctly.');
        logger.info('You can set it as an environment variable or in .env file.');
      }
    }
  }
  
  private getProviderDescription(provider: string): string {
    const descriptions: Record<string, string> = {
      openai: 'OpenAI GPT-4 (best for complex components)',
      anthropic: 'Claude 3 (excellent code generation)',
      google: 'Google Gemini (fast and efficient)',
      local: 'Ollama local models (privacy-focused)',
    };
    return descriptions[provider] || provider;
  }
}