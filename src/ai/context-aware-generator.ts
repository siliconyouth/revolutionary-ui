import { aiProviderManager, ComponentContext, AIResponse, StreamChunk } from './providers';
import { UniversalFactory } from '../index';
import * as fs from 'fs';
import * as path from 'path';

export interface ProjectContext {
  projectPath: string;
  framework?: string;
  dependencies?: Record<string, string>;
  existingComponents?: string[];
  projectStructure?: string;
  styleSystem?: string;
  tsConfig?: any;
  eslintConfig?: any;
}

export interface GenerationOptions {
  stream?: boolean;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  includeTests?: boolean;
  includeStorybook?: boolean;
}

export class ContextAwareGenerator {
  private projectContext: ProjectContext | null = null;
  private universalFactory: UniversalFactory;
  
  constructor() {
    this.universalFactory = new UniversalFactory();
  }

  /**
   * Analyze project and extract context
   */
  async analyzeProject(projectPath: string): Promise<ProjectContext> {
    const context: ProjectContext = {
      projectPath,
      existingComponents: [],
      dependencies: {}
    };

    // Read package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      context.dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      // Detect framework
      if (context.dependencies['react']) {
        context.framework = 'React';
      } else if (context.dependencies['vue']) {
        context.framework = 'Vue';
      } else if (context.dependencies['@angular/core']) {
        context.framework = 'Angular';
      } else if (context.dependencies['svelte']) {
        context.framework = 'Svelte';
      }

      // Detect style system
      if (context.dependencies['tailwindcss']) {
        context.styleSystem = 'tailwind';
      } else if (context.dependencies['styled-components']) {
        context.styleSystem = 'styled-components';
      } else if (context.dependencies['@emotion/react']) {
        context.styleSystem = 'emotion';
      }
    }

    // Scan for existing components
    const componentsDir = this.findComponentsDirectory(projectPath);
    if (componentsDir) {
      context.existingComponents = this.scanComponents(componentsDir);
    }

    // Read TypeScript config
    const tsConfigPath = path.join(projectPath, 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      context.tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));
    }

    // Read ESLint config
    const eslintPaths = ['.eslintrc.json', '.eslintrc.js', '.eslintrc'];
    for (const eslintPath of eslintPaths) {
      const fullPath = path.join(projectPath, eslintPath);
      if (fs.existsSync(fullPath)) {
        if (eslintPath.endsWith('.json')) {
          context.eslintConfig = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        }
        break;
      }
    }

    // Generate project structure summary
    context.projectStructure = this.generateProjectStructure(projectPath);

    this.projectContext = context;
    return context;
  }

  /**
   * Generate component with context awareness
   */
  async generateComponent(
    prompt: string,
    options: GenerationOptions = {}
  ): Promise<AIResponse> {
    if (!this.projectContext) {
      throw new Error('Project context not analyzed. Run analyzeProject() first.');
    }

    const componentContext: ComponentContext = {
      framework: this.projectContext.framework || 'React',
      componentType: this.detectComponentType(prompt),
      existingComponents: this.projectContext.existingComponents,
      projectStructure: this.projectContext.projectStructure,
      dependencies: Object.keys(this.projectContext.dependencies || {}),
      styleSystem: this.projectContext.styleSystem,
      userPreferences: {
        typescript: !!this.projectContext.tsConfig,
        eslint: !!this.projectContext.eslintConfig,
        includeTests: options.includeTests,
        includeStorybook: options.includeStorybook
      }
    };

    const provider = aiProviderManager.getProvider(options.provider);
    
    if (options.stream) {
      // For streaming, we'll collect chunks and return the full response
      let fullContent = '';
      await provider.generateComponentStream(
        prompt,
        (chunk: StreamChunk) => {
          fullContent += chunk.content;
          // You could emit events here for real-time updates
        },
        componentContext
      );
      
      return {
        content: fullContent,
        model: provider.getInfo().model || 'unknown',
        metadata: { streamed: true }
      };
    } else {
      return provider.generateComponent(prompt, componentContext);
    }
  }

  /**
   * Get context-aware suggestions for existing component
   */
  async getSuggestions(componentCode: string, componentPath?: string): Promise<string[]> {
    if (!this.projectContext) {
      throw new Error('Project context not analyzed. Run analyzeProject() first.');
    }

    const context: ComponentContext = {
      framework: this.projectContext.framework || 'React',
      componentType: this.detectComponentTypeFromCode(componentCode),
      existingComponents: this.projectContext.existingComponents,
      styleSystem: this.projectContext.styleSystem
    };

    // Use all available providers and aggregate suggestions
    const providers = aiProviderManager.getAllProviders();
    const allSuggestions: string[] = [];

    for (const provider of providers) {
      try {
        const suggestions = await provider.getSuggestions(componentCode, context);
        allSuggestions.push(...suggestions);
      } catch (error) {
        console.error(`Provider ${provider.getInfo().name} failed:`, error);
      }
    }

    // Deduplicate and prioritize suggestions
    const uniqueSuggestions = Array.from(new Set(allSuggestions));
    return this.prioritizeSuggestions(uniqueSuggestions, context);
  }

  /**
   * Transform component to factory pattern
   */
  async transformToFactory(componentCode: string): Promise<string> {
    const prompt = `
    Transform this component into a factory-based implementation that reduces code by 60-95%.
    Use the Revolutionary UI Factory pattern.
    
    Component to transform:
    \`\`\`javascript
    ${componentCode}
    \`\`\`
    
    Requirements:
    - Extract configuration from implementation
    - Create a factory function that generates the component
    - Reduce boilerplate and repetitive code
    - Maintain all functionality
    - Add TypeScript types if applicable
    `;

    const response = await this.generateComponent(prompt);
    return response.content;
  }

  /**
   * Batch generate related components
   */
  async generateComponentSet(
    basePrompt: string,
    componentNames: string[],
    options: GenerationOptions = {}
  ): Promise<Map<string, AIResponse>> {
    const results = new Map<string, AIResponse>();

    for (const componentName of componentNames) {
      const prompt = `${basePrompt}\n\nComponent name: ${componentName}`;
      const response = await this.generateComponent(prompt, options);
      results.set(componentName, response);
    }

    return results;
  }

  // Private helper methods

  private findComponentsDirectory(projectPath: string): string | null {
    const possiblePaths = [
      'src/components',
      'components',
      'src/ui',
      'app/components',
      'lib/components'
    ];

    for (const possiblePath of possiblePaths) {
      const fullPath = path.join(projectPath, possiblePath);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    return null;
  }

  private scanComponents(componentsDir: string): string[] {
    const components: string[] = [];
    
    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          scanDir(path.join(dir, entry.name));
        } else if (entry.isFile() && /\.(tsx?|jsx?|vue|svelte)$/.test(entry.name)) {
          const componentName = entry.name.replace(/\.(tsx?|jsx?|vue|svelte)$/, '');
          if (componentName !== 'index') {
            components.push(componentName);
          }
        }
      }
    };

    scanDir(componentsDir);
    return components;
  }

  private generateProjectStructure(projectPath: string): string {
    const structure: string[] = [];
    
    const walkDir = (dir: string, prefix: string = '', depth: number = 0) => {
      if (depth > 3) return; // Limit depth
      
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const filtered = entries.filter(e => 
        !e.name.startsWith('.') && 
        e.name !== 'node_modules' && 
        e.name !== 'dist' &&
        e.name !== 'build'
      );
      
      filtered.forEach((entry, index) => {
        const isLast = index === filtered.length - 1;
        const marker = isLast ? '└── ' : '├── ';
        structure.push(prefix + marker + entry.name);
        
        if (entry.isDirectory() && depth < 3) {
          const extension = isLast ? '    ' : '│   ';
          walkDir(path.join(dir, entry.name), prefix + extension, depth + 1);
        }
      });
    };

    walkDir(projectPath);
    return structure.join('\n');
  }

  private detectComponentType(prompt: string): string {
    const lowercasePrompt = prompt.toLowerCase();
    
    if (lowercasePrompt.includes('form')) return 'form';
    if (lowercasePrompt.includes('table') || lowercasePrompt.includes('grid')) return 'table';
    if (lowercasePrompt.includes('modal') || lowercasePrompt.includes('dialog')) return 'modal';
    if (lowercasePrompt.includes('nav') || lowercasePrompt.includes('menu')) return 'navigation';
    if (lowercasePrompt.includes('card')) return 'card';
    if (lowercasePrompt.includes('button')) return 'button';
    if (lowercasePrompt.includes('chart') || lowercasePrompt.includes('graph')) return 'chart';
    if (lowercasePrompt.includes('dashboard')) return 'dashboard';
    
    return 'component';
  }

  private detectComponentTypeFromCode(code: string): string {
    const lowercaseCode = code.toLowerCase();
    
    if (lowercaseCode.includes('form') || lowercaseCode.includes('input')) return 'form';
    if (lowercaseCode.includes('table') || lowercaseCode.includes('thead')) return 'table';
    if (lowercaseCode.includes('modal') || lowercaseCode.includes('dialog')) return 'modal';
    if (lowercaseCode.includes('nav')) return 'navigation';
    
    return 'component';
  }

  private prioritizeSuggestions(suggestions: string[], context: ComponentContext): string[] {
    // Prioritize based on context
    const priorityKeywords = [
      context.framework?.toLowerCase(),
      'performance',
      'accessibility',
      'typescript',
      context.styleSystem
    ].filter(Boolean);

    return suggestions.sort((a, b) => {
      const aScore = priorityKeywords.reduce((score, keyword) => 
        score + (a.toLowerCase().includes(keyword!) ? 1 : 0), 0
      );
      const bScore = priorityKeywords.reduce((score, keyword) => 
        score + (b.toLowerCase().includes(keyword!) ? 1 : 0), 0
      );
      
      return bScore - aScore;
    }).slice(0, 10); // Return top 10 suggestions
  }
}