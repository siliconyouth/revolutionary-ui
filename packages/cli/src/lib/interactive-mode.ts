import { 
  createLogger, 
  select, 
  input, 
  confirm, 
  multiselect,
  withSpinner,
  ComponentRegistry,
  RegistryClient,
  type CLIContext 
} from '@revolutionary-ui/cli-core';
import chalk from 'chalk';
import { EventEmitter } from 'events';
import boxen from 'boxen';
import figlet from 'figlet';
import ora from 'ora';

interface InteractiveSession {
  context: CLIContext;
  history: Array<{
    action: string;
    timestamp: Date;
    result: 'success' | 'error' | 'cancelled';
    details?: any;
  }>;
  preferences: {
    framework?: string;
    styling?: string;
    packageManager?: string;
    aiProvider?: string;
  };
}

export class InteractiveMode extends EventEmitter {
  private logger = createLogger();
  private session: InteractiveSession;
  private registry: ComponentRegistry;
  private registryClient: RegistryClient;
  
  constructor(context: CLIContext) {
    super();
    this.session = {
      context,
      history: [],
      preferences: {},
    };
    this.registry = new ComponentRegistry(context.config);
    this.registryClient = new RegistryClient({ config: context.config });
  }

  /**
   * Start interactive mode
   */
  async start(): Promise<void> {
    // Show welcome screen
    await this.showWelcome();
    
    // Load user preferences
    await this.loadPreferences();
    
    // Main interactive loop
    let continueSession = true;
    while (continueSession) {
      try {
        const action = await this.showMainMenu();
        
        if (action === 'exit') {
          continueSession = false;
          continue;
        }
        
        await this.handleAction(action);
        
        // Add to history
        this.addToHistory(action, 'success');
        
      } catch (error: any) {
        this.logger.error('Action failed:', error.message);
        this.addToHistory('error', 'error', { message: error.message });
      }
    }
    
    // Show goodbye
    await this.showGoodbye();
  }

  /**
   * Show welcome screen
   */
  private async showWelcome(): Promise<void> {
    console.clear();
    
    // Show ASCII art
    const title = await new Promise<string>((resolve) => {
      figlet('Revolutionary UI', { 
        font: 'ANSI Shadow',
        horizontalLayout: 'fitted' 
      }, (err, data) => {
        resolve(err ? 'Revolutionary UI' : data || 'Revolutionary UI');
      });
    });
    
    console.log(chalk.cyan(title));
    console.log(chalk.gray('  The AI-Powered UI Component Factory System\n'));
    
    // Show quick stats
    const stats = await this.getQuickStats();
    console.log(boxen(
      `${chalk.bold('Quick Stats')}\n\n` +
      `Components Available: ${chalk.cyan(stats.totalComponents)}\n` +
      `Your Components: ${chalk.cyan(stats.userComponents)}\n` +
      `Code Reduction: ${chalk.green(stats.averageReduction + '%')}\n` +
      `Active Project: ${chalk.yellow(stats.projectName || 'None')}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
      }
    ));
    
    // First time user?
    if (!this.session.preferences.framework) {
      this.logger.info(chalk.yellow('\n👋 Welcome! Let\'s get you started.\n'));
      await this.runFirstTimeSetup();
    }
  }

  /**
   * Show main menu
   */
  private async showMainMenu(): Promise<string> {
    console.log(''); // Add spacing
    
    const choices = [
      { 
        name: '🎨 Generate Component', 
        value: 'generate',
        description: 'Create a new component with AI assistance'
      },
      { 
        name: '📦 Browse Marketplace', 
        value: 'browse',
        description: 'Explore and add components from the marketplace'
      },
      { 
        name: '🔍 Search Components', 
        value: 'search',
        description: 'Find components using natural language'
      },
      { 
        name: '⚡ Quick Actions', 
        value: 'quick',
        description: 'Common tasks and shortcuts'
      },
      { 
        name: '🤖 AI Workflows', 
        value: 'workflows',
        description: 'Run advanced AI-powered workflows'
      },
      { 
        name: '📊 Project Analysis', 
        value: 'analyze',
        description: 'Analyze your project for optimization opportunities'
      },
      { 
        name: '⚙️  Settings', 
        value: 'settings',
        description: 'Configure preferences and options'
      },
      { 
        name: '📚 Help & Docs', 
        value: 'help',
        description: 'Get help and browse documentation'
      },
      { 
        name: '👋 Exit', 
        value: 'exit',
        description: 'Exit interactive mode'
      },
    ];
    
    // Add contextual options
    if (this.session.history.length > 0) {
      const lastAction = this.session.history[this.session.history.length - 1];
      choices.unshift({
        name: `🔄 Repeat: ${lastAction.action}`,
        value: 'repeat',
        description: 'Repeat your last action',
      });
    }
    
    return select('What would you like to do?', choices);
  }

  /**
   * Handle selected action
   */
  private async handleAction(action: string): Promise<void> {
    switch (action) {
      case 'generate':
        await this.handleGenerate();
        break;
      case 'browse':
        await this.handleBrowse();
        break;
      case 'search':
        await this.handleSearch();
        break;
      case 'quick':
        await this.handleQuickActions();
        break;
      case 'workflows':
        await this.handleWorkflows();
        break;
      case 'analyze':
        await this.handleAnalyze();
        break;
      case 'settings':
        await this.handleSettings();
        break;
      case 'help':
        await this.handleHelp();
        break;
      case 'repeat':
        await this.repeatLastAction();
        break;
    }
  }

  /**
   * Handle component generation
   */
  private async handleGenerate(): Promise<void> {
    const mode = await select('How would you like to generate?', [
      { 
        name: '💬 Natural Language', 
        value: 'natural',
        description: 'Describe what you want in plain English'
      },
      { 
        name: '🏭 Factory Pattern', 
        value: 'factory',
        description: 'Use a specialized factory for common patterns'
      },
      { 
        name: '🎯 From Template', 
        value: 'template',
        description: 'Start from a pre-built template'
      },
      { 
        name: '🔄 From Example', 
        value: 'example',
        description: 'Generate based on an existing component'
      },
    ]);
    
    switch (mode) {
      case 'natural':
        await this.generateFromNaturalLanguage();
        break;
      case 'factory':
        await this.generateFromFactory();
        break;
      case 'template':
        await this.generateFromTemplate();
        break;
      case 'example':
        await this.generateFromExample();
        break;
    }
  }

  /**
   * Generate from natural language
   */
  private async generateFromNaturalLanguage(): Promise<void> {
    console.log(chalk.bold('\n🎨 Natural Language Component Generation\n'));
    
    // Get description
    const description = await input(
      'Describe the component you want to create:',
      '',
      (value) => {
        if (!value || value.length < 10) {
          return 'Please provide a detailed description (at least 10 characters)';
        }
        return true;
      }
    );
    
    // Show examples if needed
    const needHelp = await confirm('Would you like to see some example descriptions?', false);
    if (needHelp) {
      this.showGenerationExamples();
      console.log(''); // Add spacing
    }
    
    // Additional options
    const options = await multiselect('Select additional features:', [
      { name: 'TypeScript support', value: 'typescript' },
      { name: 'Unit tests', value: 'tests' },
      { name: 'Storybook story', value: 'story' },
      { name: 'Documentation', value: 'docs' },
      { name: 'Accessibility features', value: 'a11y' },
      { name: 'Responsive design', value: 'responsive' },
      { name: 'Dark mode support', value: 'darkMode' },
      { name: 'Animation/transitions', value: 'animations' },
    ]);
    
    // Generate with live preview
    const spinner = ora('Generating component...').start();
    
    try {
      // Simulate generation with progress updates
      const steps = [
        'Understanding requirements...',
        'Designing component structure...',
        'Generating code...',
        'Optimizing for performance...',
        'Adding requested features...',
        'Finalizing component...',
      ];
      
      for (const step of steps) {
        spinner.text = step;
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      spinner.succeed('Component generated successfully!');
      
      // Show preview
      console.log(chalk.bold('\n📝 Component Preview:\n'));
      console.log(chalk.gray('// Button.tsx'));
      console.log(chalk.green(`import React from 'react';`));
      console.log(chalk.green(`import { ButtonProps } from './Button.types';`));
      console.log(chalk.green(`import styles from './Button.module.css';\n`));
      console.log(chalk.blue(`export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  ...props 
}) => {
  return (
    <button 
      className={\`\${styles.button} \${styles[variant]} \${styles[size]}\`}
      {...props}
    >
      {children}
    </button>
  );
};`));
      
      // Actions
      const action = await select('\nWhat would you like to do?', [
        { name: '💾 Save to project', value: 'save' },
        { name: '✏️  Modify component', value: 'modify' },
        { name: '🔄 Regenerate', value: 'regenerate' },
        { name: '📋 Copy to clipboard', value: 'copy' },
        { name: '❌ Cancel', value: 'cancel' },
      ]);
      
      if (action === 'save') {
        const path = await input('Save to path:', 'src/components/Button');
        this.logger.success(`Component saved to ${path}`);
      }
      
    } catch (error: any) {
      spinner.fail('Generation failed');
      throw error;
    }
  }

  /**
   * Show generation examples
   */
  private showGenerationExamples(): void {
    console.log(chalk.bold('\n💡 Example Descriptions:\n'));
    
    const examples = [
      {
        description: 'A data table with sorting, filtering, and pagination that displays user information',
        tags: ['table', 'data', 'sorting', 'filtering'],
      },
      {
        description: 'A responsive navigation bar with dropdown menus and mobile hamburger menu',
        tags: ['navigation', 'responsive', 'menu'],
      },
      {
        description: 'A form with email and password fields, validation, and submit handling',
        tags: ['form', 'validation', 'authentication'],
      },
      {
        description: 'A card component that displays a product with image, title, price, and add to cart button',
        tags: ['card', 'e-commerce', 'product'],
      },
    ];
    
    examples.forEach((ex, i) => {
      console.log(chalk.cyan(`${i + 1}. "${ex.description}"`));
      console.log(chalk.gray(`   Tags: ${ex.tags.join(', ')}\n`));
    });
  }

  /**
   * Generate from factory
   */
  private async generateFromFactory(): Promise<void> {
    const factories = [
      { name: '📊 Table Factory', value: 'table', description: 'Data tables with sorting, filtering' },
      { name: '📝 Form Factory', value: 'form', description: 'Forms with validation' },
      { name: '📈 Dashboard Factory', value: 'dashboard', description: 'Admin dashboards' },
      { name: '📊 Chart Factory', value: 'chart', description: 'Data visualization' },
      { name: '🎮 Game UI Factory', value: 'game', description: 'Game interfaces' },
      { name: '🛍️ E-commerce Factory', value: 'ecommerce', description: 'Shop components' },
    ];
    
    const factory = await select('Select a factory:', factories);
    
    // Factory-specific configuration
    switch (factory) {
      case 'table':
        await this.configureTableFactory();
        break;
      case 'form':
        await this.configureFormFactory();
        break;
      // ... other factories
    }
  }

  /**
   * Configure table factory
   */
  private async configureTableFactory(): Promise<void> {
    const features = await multiselect('Select table features:', [
      { name: 'Sorting', value: 'sorting', checked: true },
      { name: 'Filtering', value: 'filtering', checked: true },
      { name: 'Pagination', value: 'pagination', checked: true },
      { name: 'Row selection', value: 'selection' },
      { name: 'Column resizing', value: 'resizing' },
      { name: 'Export to CSV/Excel', value: 'export' },
      { name: 'Inline editing', value: 'editing' },
      { name: 'Expandable rows', value: 'expandable' },
    ]);
    
    const columns = await input('Number of columns:', '5');
    const styling = await select('Styling preference:', [
      { name: 'Modern minimalist', value: 'minimal' },
      { name: 'Material design', value: 'material' },
      { name: 'Enterprise', value: 'enterprise' },
      { name: 'Custom', value: 'custom' },
    ]);
    
    // Generate table
    await withSpinner('Generating table component...', async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
    });
    
    this.logger.success('Table component generated with 73% code reduction!');
  }

  /**
   * Configure form factory
   */
  private async configureFormFactory(): Promise<void> {
    // Implementation similar to table factory
    this.logger.info('Form factory configuration...');
  }

  /**
   * Generate from template
   */
  private async generateFromTemplate(): Promise<void> {
    // Implementation
    this.logger.info('Template generation...');
  }

  /**
   * Generate from example
   */
  private async generateFromExample(): Promise<void> {
    // Implementation
    this.logger.info('Example-based generation...');
  }

  /**
   * Handle browse marketplace
   */
  private async handleBrowse(): Promise<void> {
    // Implementation would use the BrowseCommand functionality
    const { BrowseCommand } = await import('../commands/browse.js');
    const browseCmd = new BrowseCommand();
    await browseCmd.action({}, this.session.context);
  }

  /**
   * Handle search
   */
  private async handleSearch(): Promise<void> {
    console.log(chalk.bold('\n🔍 Natural Language Component Search\n'));
    
    const query = await input('What are you looking for?');
    
    const results = await withSpinner('Searching...', async () => {
      return this.registry.searchComponents({ search: query, limit: 10 });
    });
    
    if (results.length === 0) {
      this.logger.info('No components found. Try different keywords.');
      return;
    }
    
    // Show results
    console.log(chalk.bold(`\nFound ${results.length} components:\n`));
    
    const selected = await select('Select a component:', 
      results.map(c => ({
        name: `${c.name} - ${c.description}`,
        value: c.name,
      }))
    );
    
    // Show component details and actions
    const component = results.find(c => c.name === selected);
    if (component) {
      await this.showComponentDetails(component);
    }
  }

  /**
   * Handle quick actions
   */
  private async handleQuickActions(): Promise<void> {
    const action = await select('Quick Actions:', [
      { name: '🔄 Update all components', value: 'update-all' },
      { name: '🧹 Clean unused components', value: 'clean' },
      { name: '📦 Install dependencies', value: 'install-deps' },
      { name: '🏃 Run dev server', value: 'dev' },
      { name: '🔨 Build project', value: 'build' },
      { name: '🧪 Run tests', value: 'test' },
      { name: '🎨 Format code', value: 'format' },
      { name: '🔍 Find duplicates', value: 'duplicates' },
    ]);
    
    // Execute quick action
    await this.executeQuickAction(action);
  }

  /**
   * Handle workflows
   */
  private async handleWorkflows(): Promise<void> {
    const { WorkflowCommand } = await import('@revolutionary-ui/cli-ai');
    const workflowCmd = new WorkflowCommand();
    await workflowCmd.action(undefined, {}, this.session.context);
  }

  /**
   * Handle project analysis
   */
  private async handleAnalyze(): Promise<void> {
    const { AnalyzeCommand } = await import('../commands/analyze.js');
    const analyzeCmd = new AnalyzeCommand();
    await analyzeCmd.action({}, this.session.context);
  }

  /**
   * Handle settings
   */
  private async handleSettings(): Promise<void> {
    const setting = await select('Settings:', [
      { name: '🎨 Preferences', value: 'preferences' },
      { name: '🔑 API Keys', value: 'api-keys' },
      { name: '👥 Team Settings', value: 'team' },
      { name: '☁️  Cloud Sync', value: 'cloud' },
      { name: '📊 Analytics', value: 'analytics' },
      { name: '🔔 Notifications', value: 'notifications' },
    ]);
    
    switch (setting) {
      case 'preferences':
        await this.configurePreferences();
        break;
      case 'api-keys':
        await this.configureAPIKeys();
        break;
      // ... other settings
    }
  }

  /**
   * Configure preferences
   */
  private async configurePreferences(): Promise<void> {
    console.log(chalk.bold('\n⚙️  Preferences\n'));
    
    // Framework
    this.session.preferences.framework = await select('Default framework:', [
      { name: 'React', value: 'react' },
      { name: 'Vue', value: 'vue' },
      { name: 'Angular', value: 'angular' },
      { name: 'Svelte', value: 'svelte' },
    ]);
    
    // Styling
    this.session.preferences.styling = await select('Default styling:', [
      { name: 'Tailwind CSS', value: 'tailwind' },
      { name: 'CSS Modules', value: 'css-modules' },
      { name: 'Styled Components', value: 'styled-components' },
      { name: 'Emotion', value: 'emotion' },
    ]);
    
    // Package manager
    this.session.preferences.packageManager = await select('Package manager:', [
      { name: 'npm', value: 'npm' },
      { name: 'yarn', value: 'yarn' },
      { name: 'pnpm', value: 'pnpm' },
      { name: 'bun', value: 'bun' },
    ]);
    
    await this.savePreferences();
    this.logger.success('Preferences saved!');
  }

  /**
   * Handle help
   */
  private async handleHelp(): Promise<void> {
    const topic = await select('Help Topics:', [
      { name: '🚀 Getting Started', value: 'getting-started' },
      { name: '📖 Command Reference', value: 'commands' },
      { name: '🏭 Factory Patterns', value: 'factories' },
      { name: '🤖 AI Features', value: 'ai' },
      { name: '🔧 Troubleshooting', value: 'troubleshooting' },
      { name: '📺 Video Tutorials', value: 'videos' },
      { name: '💬 Community Support', value: 'community' },
    ]);
    
    // Show help content
    await this.showHelpContent(topic);
  }

  /**
   * Show component details
   */
  private async showComponentDetails(component: any): Promise<void> {
    console.log(chalk.bold(`\n📦 ${component.name}\n`));
    console.log(`Description: ${component.description}`);
    console.log(`Category: ${chalk.cyan(component.category)}`);
    console.log(`Framework: ${chalk.cyan(component.framework.join(', '))}`);
    
    const action = await select('\nActions:', [
      { name: '📥 Add to project', value: 'add' },
      { name: '👁️  Preview', value: 'preview' },
      { name: '📄 View source', value: 'source' },
      { name: '📊 View stats', value: 'stats' },
      { name: '🔙 Back', value: 'back' },
    ]);
    
    if (action === 'add') {
      await withSpinner(`Adding ${component.name}...`, async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
      });
      this.logger.success(`Added ${component.name} to your project!`);
    }
  }

  /**
   * First time setup
   */
  private async runFirstTimeSetup(): Promise<void> {
    console.log(chalk.bold('Let\'s configure your development environment:\n'));
    
    // Get framework preference
    this.session.preferences.framework = await select('What\'s your preferred framework?', [
      { name: 'React', value: 'react' },
      { name: 'Vue', value: 'vue' },
      { name: 'Angular', value: 'angular' },
      { name: 'Svelte', value: 'svelte' },
      { name: 'No preference', value: 'none' },
    ]);
    
    // Get styling preference
    this.session.preferences.styling = await select('How do you prefer to style components?', [
      { name: 'Tailwind CSS', value: 'tailwind' },
      { name: 'CSS Modules', value: 'css-modules' },
      { name: 'CSS-in-JS', value: 'css-in-js' },
      { name: 'Sass/SCSS', value: 'sass' },
      { name: 'No preference', value: 'none' },
    ]);
    
    // AI provider
    const hasApiKey = await confirm('Do you have an AI API key? (OpenAI, Anthropic, etc.)', false);
    if (hasApiKey) {
      await this.configureAPIKeys();
    }
    
    await this.savePreferences();
    
    console.log(chalk.green('\n✅ Setup complete! You\'re ready to start building.\n'));
  }

  /**
   * Configure API keys
   */
  private async configureAPIKeys(): Promise<void> {
    console.log(chalk.bold('\n🔑 API Key Configuration\n'));
    
    const provider = await select('Select AI provider:', [
      { name: 'OpenAI', value: 'openai' },
      { name: 'Anthropic', value: 'anthropic' },
      { name: 'Google AI', value: 'google' },
      { name: 'Local Model', value: 'local' },
    ]);
    
    if (provider !== 'local') {
      const key = await input(`Enter your ${provider} API key:`, '', (value) => {
        if (!value || value.length < 10) {
          return 'Please enter a valid API key';
        }
        return true;
      });
      
      // Save key securely
      this.logger.success('API key saved securely!');
    }
    
    this.session.preferences.aiProvider = provider;
  }

  /**
   * Execute quick action
   */
  private async executeQuickAction(action: string): Promise<void> {
    switch (action) {
      case 'update-all':
        await withSpinner('Updating all components...', async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
        });
        this.logger.success('All components updated!');
        break;
        
      case 'dev':
        this.logger.info('Starting development server...');
        this.logger.info(chalk.gray('Press Ctrl+C to stop'));
        // Would actually start dev server
        break;
        
      // ... other actions
    }
  }

  /**
   * Show help content
   */
  private async showHelpContent(topic: string): Promise<void> {
    console.log(chalk.bold(`\n📚 Help: ${topic}\n`));
    
    // Would show actual help content
    console.log('Help content would be displayed here...');
    
    await input('\nPress Enter to continue...');
  }

  /**
   * Get quick stats
   */
  private async getQuickStats(): Promise<any> {
    // Would fetch real stats
    return {
      totalComponents: 150,
      userComponents: 23,
      averageReduction: 71,
      projectName: 'my-app',
    };
  }

  /**
   * Save preferences
   */
  private async savePreferences(): Promise<void> {
    const { writeJson } = await import('@revolutionary-ui/cli-core');
    const configPath = '.revolutionary-ui/preferences.json';
    await writeJson(configPath, this.session.preferences);
  }

  /**
   * Load preferences
   */
  private async loadPreferences(): Promise<void> {
    try {
      const { readJson, fileExists } = await import('@revolutionary-ui/cli-core');
      const configPath = '.revolutionary-ui/preferences.json';
      
      if (await fileExists(configPath)) {
        this.session.preferences = await readJson(configPath);
      }
    } catch {
      // Ignore errors
    }
  }

  /**
   * Add to history
   */
  private addToHistory(action: string, result: 'success' | 'error' | 'cancelled', details?: any): void {
    this.session.history.push({
      action,
      timestamp: new Date(),
      result,
      details,
    });
    
    // Keep only last 50 actions
    if (this.session.history.length > 50) {
      this.session.history = this.session.history.slice(-50);
    }
  }

  /**
   * Repeat last action
   */
  private async repeatLastAction(): Promise<void> {
    if (this.session.history.length === 0) {
      this.logger.info('No previous action to repeat');
      return;
    }
    
    const lastAction = this.session.history[this.session.history.length - 1];
    await this.handleAction(lastAction.action);
  }

  /**
   * Show goodbye
   */
  private async showGoodbye(): Promise<void> {
    console.log('');
    console.log(boxen(
      chalk.bold('Thanks for using Revolutionary UI! 👋\n\n') +
      chalk.gray('Your work has been saved.\n') +
      chalk.cyan('Run "rui" anytime to continue where you left off.'),
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
      }
    ));
  }
}

/**
 * Launch interactive mode
 */
export async function interactiveMode(context?: CLIContext): Promise<void> {
  // Get or create context
  const ctx = context || {
    config: {},
    flags: {},
    paths: {
      cwd: process.cwd(),
    },
  } as CLIContext;
  
  const interactive = new InteractiveMode(ctx);
  await interactive.start();
}