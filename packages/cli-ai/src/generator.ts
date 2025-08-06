import { z } from 'zod';
import type { AIProvider, ComponentSpec, GenerateComponentOptions } from './types.js';
import { PromptBuilder } from './prompt-builder.js';
import { getProvider } from './providers/registry.js';
import { createLogger, Spinner, input, select, confirm } from '@revolutionary-ui/cli-core';
import chalk from 'chalk';
import { join } from 'path';
import { promises as fs } from 'fs';

const logger = createLogger();

export class ComponentGenerator {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async generateComponent(options: GenerateComponentOptions): Promise<void> {
    const {
      prompt,
      framework = 'react',
      outputPath,
      preview = true,
      interactive = true,
      factory,
    } = options;

    const spin = new Spinner('Generating component...');
    spin.start();

    try {
      // Build the appropriate prompt
      const aiPrompt = factory
        ? PromptBuilder.buildFactoryPrompt(prompt, factory, framework)
        : PromptBuilder.buildComponentPrompt(prompt, framework);

      // Generate with AI
      const result = await this.provider.generate(aiPrompt, {
        temperature: 0.7,
        maxTokens: 4000,
      });

      spin.stop();

      // Extract code from the response
      const code = this.extractCode(result.content);

      if (!code) {
        throw new Error('No code was generated. Please try again with a more specific prompt.');
      }

      // Preview the generated code
      if (preview) {
        logger.info(chalk.bold('\n📄 Generated Component:\n'));
        this.displayCode(code);
      }

      // Interactive mode - ask for confirmation and modifications
      if (interactive) {
        const shouldSave = await confirm('Save this component?', true);
        
        if (!shouldSave) {
          const whatToDo = await select('What would you like to do?', [
            { name: 'Regenerate with modifications', value: 'modify' },
            { name: 'Cancel', value: 'cancel' },
          ]);

          if (whatToDo === 'modify') {
            const modifications = await input('What changes would you like?');
            const modifiedPrompt = `${prompt}\n\nAdditional requirements: ${modifications}`;
            return this.generateComponent({ ...options, prompt: modifiedPrompt });
          } else {
            logger.info('Component generation cancelled.');
            return;
          }
        }
      }

      // Determine output path
      let finalPath = outputPath;
      if (!finalPath) {
        const componentName = await this.extractComponentName(code, prompt);
        finalPath = await input(
          'Where should the component be saved?',
          `./src/components/${componentName}.tsx`
        );
      }

      // Save the component
      await this.saveComponent(code, finalPath);

      logger.success(`\n✨ Component saved to ${chalk.cyan(finalPath)}`);

      // Show usage information
      this.showUsageInfo(finalPath, framework);

      // Display token usage if available
      if (result.usage) {
        logger.info(chalk.gray(`\nTokens used: ${result.usage.totalTokens}`));
      }
    } catch (error) {
      spin.stop();
      logger.error('Failed to generate component:', error);
      throw error;
    }
  }

  async analyzeComponent(filePath: string): Promise<void> {
    const spin = new Spinner('Analyzing component...');
    spin.start();

    try {
      const code = await fs.readFile(filePath, 'utf-8');
      const prompt = PromptBuilder.buildAnalysisPrompt(code);

      const result = await this.provider.generate(prompt, {
        temperature: 0.3,
        maxTokens: 2000,
      });

      spin.stop();

      logger.info(chalk.bold('\n🔍 Component Analysis:\n'));
      logger.info(result.content);
    } catch (error) {
      spin.stop();
      logger.error('Failed to analyze component:', error);
      throw error;
    }
  }

  async refactorComponent(
    filePath: string,
    improvements: string[]
  ): Promise<void> {
    const spin = new Spinner('Refactoring component...');
    spin.start();

    try {
      const code = await fs.readFile(filePath, 'utf-8');
      const prompt = PromptBuilder.buildRefactorPrompt(code, improvements);

      const result = await this.provider.generate(prompt, {
        temperature: 0.5,
        maxTokens: 4000,
      });

      spin.stop();

      const refactoredCode = this.extractCode(result.content);

      if (!refactoredCode) {
        throw new Error('Failed to extract refactored code');
      }

      logger.info(chalk.bold('\n♻️  Refactored Component:\n'));
      this.displayCode(refactoredCode);

      const shouldSave = await confirm('Save the refactored component?', true);
      
      if (shouldSave) {
        const backupPath = `${filePath}.backup`;
        await fs.copyFile(filePath, backupPath);
        await fs.writeFile(filePath, refactoredCode);
        
        logger.success(`\n✨ Component refactored and saved!`);
        logger.info(chalk.gray(`Backup saved to: ${backupPath}`));
      }
    } catch (error) {
      spin.stop();
      logger.error('Failed to refactor component:', error);
      throw error;
    }
  }

  async convertComponent(
    filePath: string,
    fromFramework: string,
    toFramework: string
  ): Promise<void> {
    const spin = new Spinner(`Converting from ${fromFramework} to ${toFramework}...`);
    spin.start();

    try {
      const code = await fs.readFile(filePath, 'utf-8');
      const prompt = PromptBuilder.buildConversionPrompt(code, fromFramework, toFramework);

      const result = await this.provider.generate(prompt, {
        temperature: 0.5,
        maxTokens: 4000,
      });

      spin.stop();

      const convertedCode = this.extractCode(result.content);

      if (!convertedCode) {
        throw new Error('Failed to extract converted code');
      }

      logger.info(chalk.bold(`\n🔄 Converted to ${toFramework}:\n`));
      this.displayCode(convertedCode);

      const outputPath = await input(
        'Where should the converted component be saved?',
        filePath.replace(/\.\w+$/, `.${this.getFileExtension(toFramework)}`)
      );

      await this.saveComponent(convertedCode, outputPath);
      logger.success(`\n✨ Converted component saved to ${chalk.cyan(outputPath)}`);
    } catch (error) {
      spin.stop();
      logger.error('Failed to convert component:', error);
      throw error;
    }
  }

  private extractCode(content: string): string | null {
    // Try to extract code from markdown code blocks
    const codeBlockMatch = content.match(/```(?:tsx?|jsx?|vue|svelte)?\n([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }

    // Try to extract JSON for factory configurations
    const jsonMatch = content.match(/```json\n([\s\S]*?)```/);
    if (jsonMatch) {
      return jsonMatch[1].trim();
    }

    // If no code blocks, check if the entire content looks like code
    if (content.includes('export') || content.includes('import') || content.includes('function')) {
      return content.trim();
    }

    return null;
  }

  private async extractComponentName(code: string, prompt: string): Promise<string> {
    // Try to extract from export default
    const exportMatch = code.match(/export\s+default\s+(?:function\s+)?(\w+)/);
    if (exportMatch) {
      return exportMatch[1];
    }

    // Try to extract from component definition
    const componentMatch = code.match(/(?:function|const|class)\s+(\w+)/);
    if (componentMatch) {
      return componentMatch[1];
    }

    // Generate from prompt
    const words = prompt.toLowerCase().split(/\s+/);
    const name = words
      .slice(0, 3)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');
    
    return name || 'Component';
  }

  private async saveComponent(code: string, filePath: string): Promise<void> {
    // Ensure directory exists
    const dir = join(process.cwd(), filePath, '..');
    await fs.mkdir(dir, { recursive: true });

    // Save the file
    const fullPath = join(process.cwd(), filePath);
    await fs.writeFile(fullPath, code);
  }

  private displayCode(code: string): void {
    // Simple syntax highlighting for terminal
    const highlighted = code
      .replace(/\b(import|export|from|const|let|var|function|class|return|if|else)\b/g, chalk.blue('$1'))
      .replace(/\b(true|false|null|undefined)\b/g, chalk.yellow('$1'))
      .replace(/(['"`])([^'"`]*)(['"`])/g, chalk.green('$1$2$3'))
      .replace(/\/\/.*/g, chalk.gray('$&'));

    console.log(highlighted);
  }

  private showUsageInfo(filePath: string, framework: string): void {
    const importPath = filePath.replace(/^\.\/src\//, '@/').replace(/\.\w+$/, '');
    
    logger.info(chalk.bold('\n📖 Usage:\n'));
    
    switch (framework) {
      case 'react':
        logger.info(`import ${this.getComponentNameFromPath(filePath)} from '${importPath}';

function App() {
  return <${this.getComponentNameFromPath(filePath)} />;
}`);
        break;
        
      case 'vue':
        logger.info(`<script setup>
import ${this.getComponentNameFromPath(filePath)} from '${importPath}';
</script>

<template>
  <${this.getComponentNameFromPath(filePath)} />
</template>`);
        break;
        
      case 'angular':
        logger.info(`import { ${this.getComponentNameFromPath(filePath)} } from '${importPath}';

@Component({
  imports: [${this.getComponentNameFromPath(filePath)}],
  template: '<app-${this.toKebabCase(this.getComponentNameFromPath(filePath))}></app-${this.toKebabCase(this.getComponentNameFromPath(filePath))}>'
})`);
        break;
    }
  }

  private getComponentNameFromPath(filePath: string): string {
    const filename = filePath.split('/').pop() || '';
    return filename.replace(/\.\w+$/, '');
  }

  private toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  private getFileExtension(framework: string): string {
    const extensions: Record<string, string> = {
      react: 'tsx',
      vue: 'vue',
      angular: 'ts',
      svelte: 'svelte',
      solid: 'tsx',
    };
    return extensions[framework] || 'tsx';
  }
}

export async function generateWithAI(options: GenerateComponentOptions): Promise<void> {
  // Get the configured provider
  const providerName = process.env.RUI_AI_PROVIDER || 'openai';
  const provider = getProvider(providerName);

  // Check if provider is available
  if (!await provider.isAvailable()) {
    logger.error(`AI provider '${providerName}' is not available.`);
    logger.info('Please configure your API key or select a different provider.');
    logger.info(`\nSet API key: export ${providerName.toUpperCase()}_API_KEY=<your-key>`);
    logger.info(`Or select provider: export RUI_AI_PROVIDER=<openai|anthropic|google|local>`);
    throw new Error('AI provider not available');
  }

  const generator = new ComponentGenerator(provider);
  await generator.generateComponent(options);
}