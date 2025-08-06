/**
 * AI-Powered Interactive CLI Mode
 * With intelligent guidance, menu navigation, and ESC to go back
 */

import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { select, input, confirm, checkbox } from '@inquirer/prompts';
import { AIAssistant } from '../utils/ai-assistant';
import { AIAuthCommand } from './ai-auth';
import { AnalyzeCommand } from './analyze';
import { AIGenerateCommand } from './ai-generate';
import { SetupCommand } from './setup';
import { CatalogCommand } from './catalog';
import { SmartProjectAnalyzer } from '../core/smart-project-analyzer';
import { EnhancedResourceService } from '../../services/enhanced-resource-service';
import { AlgoliaSearchService } from '../../services/algolia-search-service';
import { UpstashVectorService } from '../../services/upstash-vector-service';
import { DatabaseResourceService } from '../../services/database-resource-service';
import { PrismaClient } from '@prisma/client';
import { TerminalUIIntegration } from '../ui/terminal-ui-integration';
import { SimpleTerminalUI } from '../ui/simple-terminal-ui';
import TerminalApp from '../ui/comprehensive-terminal-ui';

// Custom error for ESC key press
class EscapeError extends Error {
  constructor() {
    super('User pressed ESC');
    this.name = 'EscapeError';
  }
}

interface SessionContext {
  authenticated: boolean;
  projectAnalyzed: boolean;
  projectInfo?: any;
  framework?: string;
  preferences?: any;
  history: string[];
  menuStack: string[];
  escPressed?: boolean;
}

export class AIInteractiveCommand {
  private aiAssistant: AIAssistant;
  private context: SessionContext;
  private analyzer: SmartProjectAnalyzer;
  private resourceService: EnhancedResourceService;
  private searchService: AlgoliaSearchService | null = null;
  private vectorService: UpstashVectorService | null = null;
  private dbService: DatabaseResourceService;
  private prisma: PrismaClient;

  constructor() {
    this.aiAssistant = new AIAssistant();
    this.analyzer = new SmartProjectAnalyzer();
    this.context = {
      authenticated: false,
      projectAnalyzed: false,
      history: [],
      menuStack: ['main'],
      escPressed: false
    };
    
    // Initialize all services
    this.initializeServices();
    
    // Setup ESC key handling
    this.setupEscKeyHandling();
  }
  
  private setupEscKeyHandling() {
    // Setup a simple ESC check interval
    // This is a simpler approach that doesn't interfere with inquirer
    process.on('SIGINT', () => {
      console.log(chalk.cyan('\n\n👋 Thanks for using Revolutionary UI with AI!\n'));
      process.exit(0);
    });
  }

  private async initializeServices() {
    try {
      // Initialize database services
      this.resourceService = EnhancedResourceService.getInstance();
      this.dbService = DatabaseResourceService.getInstance();
      this.prisma = new PrismaClient();
      
      // Initialize search services if configured
      if (process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_API_KEY) {
        this.searchService = new AlgoliaSearchService(
          process.env.ALGOLIA_APP_ID,
          process.env.ALGOLIA_API_KEY
        );
      }
      
      // Initialize vector service if configured
      if (process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN) {
        this.vectorService = new UpstashVectorService();
      }
    } catch (error) {
      console.warn('Some services could not be initialized:', error.message);
    }
  }

  /**
   * Helper to handle prompt cancellation
   */
  private async handlePromptError(error: any): Promise<never> {
    // Handle different types of cancellation
    if (error.name === 'ExitPromptError' || 
        error.name === 'CancelPromptError' ||
        error.message?.includes('User force closed')) {
      throw new EscapeError();
    }
    throw error;
  }

  async execute(options?: { terminalUI?: boolean }) {
    // Terminal UI is now the default and only mode
    await this.executeWithTerminalUI();
  }

  /**
   * Execute with rich terminal UI using blessed
   */
  private async executeWithTerminalUI() {
    try {
      // Suppress blessed terminal warnings
      const originalStderr = process.stderr.write;
      process.stderr.write = function(chunk: any, ...args: any[]) {
        const str = chunk?.toString() || '';
        // Filter out terminal capability warnings
        if (str.includes('Error on xterm-256color') || 
            str.includes('Setulc') || 
            str.includes('stack = []') ||
            str.includes('v = params[')) {
          return true;
        }
        return originalStderr.apply(process.stderr, [chunk, ...args] as any);
      } as any;

      // Get AI service if authenticated
      const authStatus = await this.aiAssistant.getAuthStatus();
      const aiService = authStatus.isAuthenticated ? this.aiAssistant : undefined;
      
      // Import and create Terminal UI (using fixed version)
      const { createFixedTerminalUI } = await import('../ui/fixed-terminal-ui');
      const screen = createFixedTerminalUI(aiService);
      
      // Keep the process alive
      process.stdin.resume();
      
      // Prevent the process from exiting
      await new Promise(() => {
        // This promise never resolves, keeping the app running
        // The app will exit through the ESC handler
      });
    } catch (error) {
      console.error(chalk.red('\n❌ Terminal UI error:'), error);
      // Show full error details
      if (error instanceof Error) {
        console.error(chalk.red('Error message:'), error.message);
        console.error(chalk.red('Stack trace:'));
        console.error(error.stack);
      }
      // Exit on error instead of fallback
      process.exit(1);
    }
  }

  private async navigationLoop() {
    while (this.context.menuStack.length > 0) {
      const currentMenu = this.context.menuStack[this.context.menuStack.length - 1];
      
      try {
        switch (currentMenu) {
          case 'main':
            await this.showMainMenu();
            break;
          case 'settings':
            await this.showSettings();
            break;
          case 'exit':
            this.context.menuStack = [];
            break;
        }
      } catch (error) {
        if (error instanceof EscapeError) {
          // ESC was pressed, go back
          this.context.menuStack.pop();
          if (this.context.menuStack.length === 0) {
            // If we're at the top level, ask to confirm exit
            try {
              const confirmExit = await confirm({
                message: 'Are you sure you want to exit?',
                default: false
              });
              
              if (!confirmExit) {
                this.context.menuStack.push('main');
              }
            } catch (escError) {
              // ESC on exit confirm, stay in app
              this.context.menuStack.push('main');
            }
          } else {
            console.log(chalk.dim('\n← Going back...'));
          }
        } else {
          throw error;
        }
      }
    }
    
    console.log(chalk.cyan('\n👋 Thanks for using Revolutionary UI with AI!\n'));
  }

  private async ensureAuthentication() {
    const authStatus = await this.aiAssistant.getAuthStatus();
    
    if (!authStatus.isAuthenticated) {
      console.log(chalk.yellow('🔐 First, let\'s set up AI authentication for the best experience\n'));
      
      // Get AI recommendation for authentication
      try {
        const authRec = await this.aiAssistant.getRecommendation({
          phase: 'authentication',
          question: 'Which authentication method should I use?',
          currentChoices: ['session', 'apikey', 'skip']
        });
        
        if (authRec.explanation) {
          console.log(chalk.cyan('💡 AI Recommendation:'));
          console.log(chalk.gray(authRec.explanation + '\n'));
        }
      } catch {
        // Continue without recommendation
      }
      
      try {
        const authChoice = await select({
          message: 'How would you like to authenticate?',
          choices: [
            {
              name: '🌐 Browser Session (Recommended - No API limits)',
              value: 'session'
            },
            {
              name: '🔑 API Key (Traditional - Rate limited)',
              value: 'apikey'
            },
            {
              name: '❌ Skip for now (Limited functionality)',
              value: 'skip'
            }
          ]
        });
        
        if (authChoice !== 'skip') {
          const authCommand = new AIAuthCommand();
          await authCommand.execute({});
          
          // Verify authentication
          const newStatus = await this.aiAssistant.getAuthStatus();
          this.context.authenticated = newStatus.isAuthenticated;
          
          if (this.context.authenticated) {
            console.log(chalk.green('\n✅ AI authentication successful!\n'));
          }
        }
      } catch (error) {
        await this.handlePromptError(error);
      }
    } else {
      this.context.authenticated = true;
      console.log(chalk.green(`✅ Authenticated with ${authStatus.method === 'session' ? 'Claude AI session' : 'API key'}\n`));
    }
  }

  private async showInitialGuidance() {
    if (!this.context.authenticated) {
      console.log(chalk.yellow('\n⚠️  Running in limited mode without AI assistance\n'));
      return;
    }

    console.log(chalk.cyan('\n🤖 AI Assistant is analyzing your environment...\n'));
    
    const spinner = ora('Gathering project information...').start();
    
    try {
      // Quick project scan
      const analysis = await this.analyzer.analyze();
      this.context.projectInfo = analysis;
      this.context.projectAnalyzed = true;
      
      spinner.text = 'Loading database resources...';
      
      // Load additional context from databases
      const [frameworks, uiLibraries, totalResources] = await Promise.all([
        this.dbService.getFrameworks().catch(() => []),
        this.dbService.getUILibraries().catch(() => []),
        this.prisma.resource.count().catch(() => 0)
      ]);
      
      spinner.text = 'Analyzing with AI...';
      
      // Enrich context with database info
      this.context.projectInfo.availableFrameworks = frameworks.length;
      this.context.projectInfo.availableUILibraries = uiLibraries.length;
      this.context.projectInfo.totalResources = totalResources;
      
      spinner.succeed('Project context loaded with database intelligence');
      
      // Show database stats
      console.log(chalk.dim(`\n📊 Database Resources:`));
      console.log(chalk.dim(`   • ${frameworks.length} frameworks available`));
      console.log(chalk.dim(`   • ${uiLibraries.length} UI libraries cataloged`));
      console.log(chalk.dim(`   • ${totalResources} total components indexed`));
      if (this.searchService) console.log(chalk.dim(`   • Algolia search enabled`));
      if (this.vectorService) console.log(chalk.dim(`   • Vector semantic search enabled`));
      
      // Get AI overview with enriched context
      const overview = await this.aiAssistant.getRecommendation({
        phase: 'initial_guidance',
        question: 'What should I know about this project and what are the best next steps?',
        projectInfo: this.context.projectInfo,
        currentChoices: ['analyze', 'generate', 'setup', 'catalog']
      });
      
      console.log(chalk.cyan('\n📋 Project Overview:'));
      console.log(chalk.gray(overview.explanation || 'This appears to be a new or uninitialized project.'));
      
      if (overview.recommendations && overview.recommendations.length > 0) {
        console.log(chalk.cyan('\n💡 Recommended Actions:'));
        overview.recommendations.forEach((rec, i) => {
          console.log(chalk.gray(`${i + 1}. ${rec}`));
        });
      }
      
      // Search for relevant components if project has a framework
      if (this.context.projectInfo.framework && this.searchService) {
        spinner.start('Searching for relevant components...');
        try {
          const searchResults = await this.searchService.searchResources(
            this.context.projectInfo.framework,
            { limit: 3 }
          );
          
          if (searchResults.length > 0) {
            spinner.succeed('Found relevant components');
            console.log(chalk.cyan('\n🎯 Relevant Components for Your Project:'));
            searchResults.forEach((result, i) => {
              console.log(chalk.gray(`${i + 1}. ${result.name} - ${result.description}`));
            });
          } else {
            spinner.stop();
          }
        } catch {
          spinner.stop();
        }
      }
      
      console.log(chalk.dim('\n(Press Enter to continue or ESC to go back)'));
      try {
        await input({
          message: '',
          default: ''
        });
      } catch (error) {
        await this.handlePromptError(error);
      }
      
    } catch (error) {
      spinner.fail('Could not analyze project');
      console.log(chalk.gray('Continuing without project context...\n'));
    }
  }

  private async showMainMenu() {
    console.clear();
    console.log(chalk.magenta.bold('\n🏠 Revolutionary UI - Main Menu\n'));
    
    // Always show AI recommendations first
    if (this.context.authenticated) {
      try {
        const recommendation = await this.aiAssistant.getRecommendation({
          phase: 'main_menu',
          question: 'What should the user do next based on their project state?',
          projectInfo: this.context.projectInfo,
          userHistory: this.context.history,
          currentChoices: ['analyze', 'generate', 'setup', 'catalog', 'settings']
        });
        
        if (recommendation.explanation) {
          console.log(chalk.cyan('💡 AI Assistant:'));
          console.log(chalk.gray(recommendation.explanation + '\n'));
        }
        
        if (recommendation.defaultValue) {
          console.log(chalk.dim(`Recommended: ${recommendation.defaultValue}\n`));
        }
      } catch (error) {
        // Continue without recommendation
      }
    }

    const choices = [
      {
        name: '🔍 Analyze Project' + (this.context.projectAnalyzed ? ' (Update Analysis)' : ' (Recommended)'),
        value: 'analyze'
      },
      {
        name: '🤖 Generate Component with AI',
        value: 'generate',
        disabled: !this.context.authenticated ? 'Requires AI authentication' : false
      },
      {
        name: '🚀 Setup Project with Recommendations',
        value: 'setup'
      },
      {
        name: '📚 Browse Component Catalog',
        value: 'catalog'
      },
      {
        name: '⚙️  Settings & Configuration',
        value: 'settings'
      },
      {
        name: '❌ Exit Revolutionary UI',
        value: 'exit'
      }
    ];

    try {
      const action = await select({
        message: 'What would you like to do?',
        choices,
        pageSize: 10
      });
      
      // Track user action
      this.context.history.push(action);
      
      switch (action) {
        case 'analyze':
          await this.analyzeProject();
          break;
        case 'generate':
          await this.generateComponent();
          break;
        case 'setup':
          await this.setupProject();
          break;
        case 'catalog':
          await this.browseCatalog();
          break;
        case 'settings':
          this.context.menuStack.push('settings');
          break;
        case 'exit':
          this.context.menuStack = [];
          break;
      }
    } catch (error) {
      await this.handlePromptError(error);
    }
  }

  private async analyzeProject() {
    console.clear();
    console.log(chalk.cyan.bold('\n🔍 AI-Powered Project Analysis\n'));

    if (!this.context.authenticated) {
      console.log(chalk.yellow('⚠️  Limited analysis without AI authentication\n'));
    } else {
      // Get AI context for analysis
      const helpText = await this.aiAssistant.getContextualHelp('project_analysis', this.context);
      console.log(chalk.gray(helpText + '\n'));
    }

    const spinner = ora('Analyzing your project...').start();

    try {
      const analysis = await this.analyzer.analyze();
      
      spinner.succeed('Project analysis complete');
      
      // Update context
      this.context.projectInfo = analysis;
      this.context.projectAnalyzed = true;
      
      // Display analysis results
      console.log(chalk.green('\n📊 Analysis Results:\n'));
      
      console.log(chalk.bold('Project Type:'), analysis.projectType || 'Unknown');
      console.log(chalk.bold('Framework:'), analysis.framework || 'None detected');
      console.log(chalk.bold('TypeScript:'), analysis.hasTypeScript ? '✅ Yes' : '❌ No');
      console.log(chalk.bold('Component Count:'), analysis.componentCount || 0);
      
      if (analysis.dependencies && analysis.dependencies.length > 0) {
        console.log(chalk.bold('\nKey Dependencies:'));
        analysis.dependencies.slice(0, 5).forEach(dep => {
          console.log(chalk.gray(`  - ${dep}`));
        });
      }
      
      // Get AI insights if authenticated
      if (this.context.authenticated) {
        console.log(chalk.cyan('\n🤖 AI Insights:\n'));
        
        try {
          const projectPath = process.cwd();
          const insights = await this.aiAssistant.analyzeProject(projectPath);
          
          console.log(chalk.bold('Summary:'), insights.summary);
          console.log(chalk.bold('Detected Framework:'), insights.framework);
          
          if (insights.recommendations.length > 0) {
            console.log(chalk.bold('\n📋 Recommendations:'));
            insights.recommendations.forEach((rec, i) => {
              console.log(chalk.gray(`${i + 1}. ${rec}`));
            });
          }
          
          if (insights.suggestedComponents.length > 0) {
            console.log(chalk.bold('\n🎯 Suggested Components to Generate:'));
            insights.suggestedComponents.forEach((comp, i) => {
              console.log(chalk.green(`${i + 1}. ${comp}`));
            });
          }
          
          if (insights.improvements.length > 0) {
            console.log(chalk.bold('\n💡 Improvement Opportunities:'));
            insights.improvements.forEach((imp, i) => {
              console.log(chalk.yellow(`${i + 1}. ${imp}`));
            });
          }
        } catch (error) {
          console.log(chalk.gray('Could not generate AI insights'));
        }
      }
      
    } catch (error) {
      spinner.fail('Analysis failed');
      console.error(chalk.red('Error:'), error.message);
    }
    
    console.log(chalk.dim('\n(Press Enter to continue or ESC to go back)'));
    try {
      await input({
        message: '',
        default: ''
      });
    } catch (error) {
      await this.handlePromptError(error);
    }
  }

  private async generateComponent() {
    if (!this.context.authenticated) {
      console.log(chalk.yellow('\n⚠️  AI generation requires authentication'));
      await this.ensureAuthentication();
      if (!this.context.authenticated) return;
    }

    console.clear();
    console.log(chalk.cyan.bold('\n🤖 AI Component Generation\n'));

    // Get AI guidance for generation
    const guidance = await this.aiAssistant.getContextualHelp('component_generation', this.context);
    console.log(chalk.gray(guidance + '\n'));

    const generateCommand = new AIGenerateCommand();
    await generateCommand.execute({});
  }

  private async setupProject() {
    console.clear();
    console.log(chalk.cyan.bold('\n🚀 AI-Powered Project Setup\n'));

    if (this.context.authenticated) {
      // Get setup recommendations
      const setupRec = await this.aiAssistant.getSetupRecommendations(this.context.projectInfo || {});
      
      console.log(chalk.cyan('💡 AI Recommendations:\n'));
      console.log(chalk.bold('Framework:'), setupRec.framework);
      console.log(chalk.bold('Styling:'), setupRec.styling);
      console.log(chalk.bold('TypeScript:'), setupRec.typescript ? '✅ Recommended' : '❌ Not needed');
      console.log(chalk.bold('Testing:'), setupRec.testing);
      
      if (setupRec.features.length > 0) {
        console.log(chalk.bold('\nRecommended Features:'));
        setupRec.features.forEach(feat => {
          console.log(chalk.green(`  ✓ ${feat}`));
        });
      }
      
      console.log(chalk.gray('\n' + setupRec.explanation + '\n'));
    }

    const setupCommand = new SetupCommand();
    // Pass --auto flag to skip the duplicate AI question when called from AI interactive mode
    await setupCommand.execute({ 
      'with-ai': this.context.authenticated,
      'auto': true  // This will skip the "Would you like AI assistance" prompt
    });
    
    // After setup completes, pause before returning to menu
    console.log(chalk.dim('\n(Press Enter to continue)'));
    try {
      await input({
        message: '',
        default: ''
      });
    } catch (error) {
      await this.handlePromptError(error);
    }
  }

  private async browseCatalog() {
    console.clear();
    console.log(chalk.cyan.bold('\n📚 Component Catalog - Powered by AI & Semantic Search\n'));

    try {
      if (this.context.authenticated) {
        // Get catalog suggestions
        try {
        const suggestions = await this.aiAssistant.getRecommendation({
          phase: 'catalog_browse',
          question: 'What components should the user look for based on their project?',
          projectInfo: this.context.projectInfo,
          currentChoices: []
        });
        
        if (suggestions.explanation) {
          console.log(chalk.cyan('💡 AI Suggestions:'));
          console.log(chalk.gray(suggestions.explanation + '\n'));
        }
        
        // Show semantic search option if available
        if (this.vectorService) {
          const searchType = await select({
            message: 'How would you like to search?',
            choices: [
              {
                name: '🧠 Semantic Search (AI-powered similarity)',
                value: 'semantic'
              },
              {
                name: '🔍 Keyword Search (Traditional)',
                value: 'keyword'
              },
              {
                name: '📂 Browse Categories',
                value: 'browse'
              },
              {
                name: '← Back',
                value: 'back'
              }
            ]
          });
          
          if (searchType === 'back') return;
          
          if (searchType === 'semantic') {
            const query = await input({
              message: 'Describe what you\'re looking for:',
              validate: (value) => value.length > 0 ? true : 'Please enter a description'
            });
            
            const spinner = ora('Searching with AI...').start();
            
            try {
              // Use vector search for semantic similarity
              const results = await this.vectorService.searchSimilar(query, {
                limit: 10,
                includeMetadata: true
              });
              
              spinner.succeed(`Found ${results.length} relevant components`);
              
              if (results.length > 0) {
                console.log(chalk.cyan('\n🎯 Semantically Similar Components:\n'));
                
                for (const [index, result] of results.entries()) {
                  const metadata = result.metadata || {};
                  console.log(chalk.bold(`${index + 1}. ${metadata.name || 'Unknown'}`));
                  console.log(chalk.gray(`   ${metadata.description || 'No description'}`));
                  console.log(chalk.dim(`   Similarity: ${(result.score * 100).toFixed(1)}%`));
                  if (metadata.framework) {
                    console.log(chalk.dim(`   Framework: ${metadata.framework}`));
                  }
                  console.log();
                }
                
                const viewDetails = await confirm({
                  message: 'Would you like to view details of any component?',
                  default: true
                });
                
                if (viewDetails) {
                  const componentIndex = await input({
                    message: 'Enter component number:',
                    validate: (value) => {
                      const num = parseInt(value);
                      return num > 0 && num <= results.length ? true : 'Invalid selection';
                    }
                  });
                  
                  const selected = results[parseInt(componentIndex) - 1];
                  // Load full details from database
                  if (selected.id) {
                    const resource = await this.prisma.resource.findUnique({
                      where: { id: selected.id },
                      include: {
                        category: true,
                        author: true,
                        tags: true
                      }
                    });
                    
                    if (resource) {
                      console.log(chalk.cyan('\n📦 Component Details:\n'));
                      console.log(chalk.bold('Name:'), resource.name);
                      console.log(chalk.bold('Category:'), resource.category?.name || 'Uncategorized');
                      console.log(chalk.bold('Author:'), resource.author?.name || 'Unknown');
                      console.log(chalk.bold('Description:'), resource.description);
                      if (resource.longDescription) {
                        console.log(chalk.bold('\nDetailed Description:'));
                        console.log(chalk.gray(resource.longDescription));
                      }
                      if (resource.npmPackage) {
                        console.log(chalk.bold('\nNPM Package:'), resource.npmPackage);
                      }
                      if (resource.githubUrl) {
                        console.log(chalk.bold('GitHub:'), resource.githubUrl);
                      }
                      if (resource.tags && resource.tags.length > 0) {
                        console.log(chalk.bold('\nTags:'), resource.tags.map(t => t.name).join(', '));
                      }
                    }
                  }
                }
                
                console.log(chalk.dim('\n(Press Enter to continue or ESC to go back)'));
                try {
                  await input({
                    message: '',
                    default: ''
                  });
                } catch (error) {
                  await this.handlePromptError(error);
                }
                
                return;
              }
            } catch (error) {
              spinner.fail('Semantic search failed');
              console.error(chalk.red('Error:'), error.message);
            }
          }
        }
      } catch {
        // Continue without suggestions
      }
    }

      // Fall back to regular catalog command
      const catalogCommand = new CatalogCommand();
      await catalogCommand.browseInteractive();
    } catch (error) {
      await this.handlePromptError(error);
    }
  }

  private async showSettings() {
    console.clear();
    console.log(chalk.cyan.bold('\n⚙️  Settings & Configuration\n'));
    console.log(chalk.dim('Press ESC to go back\n'));

    try {
      const setting = await select({
      message: 'What would you like to configure?',
      choices: [
        {
          name: '🔐 AI Authentication',
          value: 'auth'
        },
        {
          name: '🎨 UI Preferences',
          value: 'ui'
        },
        {
          name: '📁 Project Settings',
          value: 'project'
        },
        {
          name: '🔄 Reset Configuration',
          value: 'reset'
        },
        {
          name: '← Back to Main Menu',
          value: 'back'
        }
      ]
    });

    switch (setting) {
      case 'auth':
        const authCommand = new AIAuthCommand();
        await authCommand.execute({ status: true });
        
        const changeAuth = await confirm({
          message: 'Would you like to change authentication?',
          default: false
        });
        
        if (changeAuth) {
          await authCommand.execute({});
        }
        break;
        
      case 'ui':
        await this.configureUIPreferences();
        break;
        
      case 'project':
        await this.configureProjectSettings();
        break;
        
      case 'reset':
        await this.resetConfiguration();
        break;
        
      case 'back':
        this.context.menuStack.pop();
        return;
    }
    
    if (setting !== 'back') {
      console.log(chalk.dim('\n(Press Enter to continue)'));
      try {
        await input({
          message: '',
          default: ''
        });
      } catch (error) {
        await this.handlePromptError(error);
      }
    }
    } catch (error) {
      await this.handlePromptError(error);
    }
  }

  private async configureUIPreferences() {
    console.clear();
    console.log(chalk.cyan.bold('\n🎨 UI Preferences Configuration\n'));

    try {
      const preferences = await this.loadUIPreferences();
      
      // Load options from database
      const spinner = ora('Loading options from database...').start();
      
      let frameworks: any[] = [];
      let uiLibraries: any[] = [];
      let cssFrameworks: any[] = [];
      let buildTools: any[] = [];
      let testingFrameworks: any[] = [];
      
      try {
        // Load all options from database
        [frameworks, uiLibraries] = await Promise.all([
          this.dbService.getFrameworks().catch(() => []),
          this.dbService.getUILibraries().catch(() => [])
        ]);
        
        // Load additional options from resources
        const resources = await this.prisma.resource.findMany({
          where: {
            OR: [
              { category: { name: { in: ['CSS Framework', 'Styling', 'CSS-in-JS'] } } },
              { category: { name: { in: ['Build Tool', 'Bundler', 'Compiler'] } } },
              { category: { name: { in: ['Testing', 'Test Framework', 'E2E Testing'] } } }
            ]
          },
          include: { category: true },
          distinct: ['name']
        }).catch(() => []);
        
        // Categorize resources
        cssFrameworks = resources.filter(r => 
          ['CSS Framework', 'Styling', 'CSS-in-JS'].includes(r.category?.name || '')
        );
        buildTools = resources.filter(r => 
          ['Build Tool', 'Bundler', 'Compiler'].includes(r.category?.name || '')
        );
        testingFrameworks = resources.filter(r => 
          ['Testing', 'Test Framework', 'E2E Testing'].includes(r.category?.name || '')
        );
        
        spinner.succeed(`Loaded ${frameworks.length} frameworks, ${uiLibraries.length} UI libraries, and more from database`);
      } catch (error) {
        spinner.fail('Could not load all options from database, using defaults');
      }
      
      console.log(chalk.dim('\nCurrent preferences:\n'));
      console.log(chalk.gray(`Theme: ${preferences.theme || 'Auto'}`));
      console.log(chalk.gray(`Component Style: ${preferences.componentStyle || 'Modern'}`));
      console.log(chalk.gray(`Default Framework: ${preferences.defaultFramework || 'React'}`));
      console.log(chalk.gray(`UI Library: ${preferences.uiLibrary || 'None'}`));
      console.log(chalk.gray(`CSS Framework: ${preferences.cssFramework || 'Tailwind CSS'}`));
      console.log(chalk.gray(`Build Tool: ${preferences.buildTool || 'Vite'}`));
      console.log(chalk.gray(`Testing Framework: ${preferences.testingFramework || 'Vitest'}`));
      console.log(chalk.gray(`Code Format: ${preferences.codeFormat || 'TypeScript'}`));
      console.log(chalk.gray(`Package Manager: ${preferences.packageManager || 'npm'}`));
      
      // Get AI recommendations if authenticated
      if (this.context.authenticated) {
        const recommendation = await this.aiAssistant.getRecommendation({
          phase: 'ui_preferences',
          question: 'What UI preferences would work best for this project?',
          projectInfo: this.context.projectInfo,
          currentChoices: ['theme', 'componentStyle', 'framework', 'styling', 'codeFormat']
        });
        
        if (recommendation.explanation) {
          console.log(chalk.cyan('\n💡 AI Recommendation:'));
          console.log(chalk.gray(recommendation.explanation));
        }
      }
      
      console.log(chalk.yellow('\n📝 Press Enter to modify preferences, or ESC to go back\n'));
      
      // Just wait for Enter key, no question prompt
      try {
        await input({
          message: '',
          default: ''
        });
      } catch (error) {
        // ESC was pressed
        await this.handlePromptError(error);
        return;
      }
      
      // Theme preference
      preferences.theme = await select({
          message: 'Select theme:',
          choices: [
            { name: '🌞 Light', value: 'light' },
            { name: '🌙 Dark', value: 'dark' },
            { name: '🔄 Auto (System)', value: 'auto' }
          ],
          default: preferences.theme || 'auto'
        });
        
        // Component style
        preferences.componentStyle = await select({
          message: 'Select component style:',
          choices: [
            { name: '✨ Modern (Rounded, shadows)', value: 'modern' },
            { name: '📐 Minimal (Clean, simple)', value: 'minimal' },
            { name: '🎯 Material (Google style)', value: 'material' },
            { name: '🍎 Cupertino (Apple style)', value: 'cupertino' }
          ],
          default: preferences.componentStyle || 'modern'
        });
        
        // Default framework - from database
        const frameworkChoices = frameworks.length > 0
          ? frameworks.map(f => ({
              name: `${f.icon || '🔧'} ${f.name}${f.description ? ` - ${f.description.substring(0, 50)}...` : ''}`,
              value: f.name.toLowerCase()
            }))
          : [
              { name: '⚛️ React', value: 'react' },
              { name: '💚 Vue', value: 'vue' },
              { name: '🅰️ Angular', value: 'angular' },
              { name: '🧡 Svelte', value: 'svelte' },
              { name: '⚡ Solid', value: 'solid' }
            ];
            
        preferences.defaultFramework = await select({
          message: 'Default framework for generation:',
          choices: frameworkChoices,
          default: preferences.defaultFramework || 'react',
          pageSize: 15
        });
        
        // UI Library selection - from database
        const uiLibraryChoices = [
          { name: '🚫 None (vanilla components)', value: 'none' },
          ...uiLibraries.map(lib => ({
            name: `${lib.icon || '📦'} ${lib.name}${lib.description ? ` - ${lib.description.substring(0, 40)}...` : ''}`,
            value: lib.name.toLowerCase().replace(/\s+/g, '-')
          }))
        ];
        
        preferences.uiLibrary = await select({
          message: 'Default UI component library:',
          choices: uiLibraryChoices,
          default: preferences.uiLibrary || 'none',
          pageSize: 15
        });
        
        // CSS Framework - from database
        const cssChoices = cssFrameworks.length > 0
          ? [
              { name: '🎨 None (custom CSS)', value: 'none' },
              ...cssFrameworks.map(css => ({
                name: `${css.category?.name === 'CSS-in-JS' ? '💅' : '🎨'} ${css.name}`,
                value: css.name.toLowerCase().replace(/\s+/g, '-')
              }))
            ]
          : [
              { name: '🎨 Tailwind CSS', value: 'tailwind' },
              { name: '💅 CSS-in-JS', value: 'css-in-js' },
              { name: '📦 CSS Modules', value: 'css-modules' },
              { name: '🎯 Vanilla CSS', value: 'vanilla-css' },
              { name: '💎 Sass/SCSS', value: 'sass' }
            ];
            
        preferences.cssFramework = await select({
          message: 'Default CSS/styling framework:',
          choices: cssChoices,
          default: preferences.cssFramework || preferences.defaultStyling || 'tailwind',
          pageSize: 15
        });
        
        // Build Tool - from database
        const buildToolChoices = buildTools.length > 0
          ? buildTools.map(tool => ({
              name: `${tool.category?.name === 'Bundler' ? '📦' : '🔧'} ${tool.name}`,
              value: tool.name.toLowerCase().replace(/\s+/g, '-')
            }))
          : [
              { name: '⚡ Vite', value: 'vite' },
              { name: '📦 Webpack', value: 'webpack' },
              { name: '🎯 Parcel', value: 'parcel' },
              { name: '🚀 Turbopack', value: 'turbopack' },
              { name: '⚡ esbuild', value: 'esbuild' }
            ];
            
        preferences.buildTool = await select({
          message: 'Default build tool:',
          choices: buildToolChoices,
          default: preferences.buildTool || 'vite',
          pageSize: 10
        });
        
        // Testing Framework - from database
        const testingChoices = testingFrameworks.length > 0
          ? testingFrameworks.map(test => ({
              name: `${test.category?.name === 'E2E Testing' ? '🎭' : '🧪'} ${test.name}`,
              value: test.name.toLowerCase().replace(/\s+/g, '-')
            }))
          : [
              { name: '🧪 Vitest', value: 'vitest' },
              { name: '🃏 Jest', value: 'jest' },
              { name: '🎭 Playwright', value: 'playwright' },
              { name: '🌐 Cypress', value: 'cypress' }
            ];
            
        preferences.testingFramework = await select({
          message: 'Default testing framework:',
          choices: testingChoices,
          default: preferences.testingFramework || 'vitest',
          pageSize: 10
        });
        
        // Package Manager
        preferences.packageManager = await select({
          message: 'Default package manager:',
          choices: [
            { name: '📦 npm', value: 'npm' },
            { name: '🐱 yarn', value: 'yarn' },
            { name: '🔥 pnpm', value: 'pnpm' },
            { name: '🥟 bun', value: 'bun' }
          ],
          default: preferences.packageManager || 'npm'
        });
        
        // Code format
        preferences.codeFormat = await select({
          message: 'Preferred code format:',
          choices: [
            { name: '📘 TypeScript (Recommended)', value: 'typescript' },
            { name: '📙 JavaScript', value: 'javascript' },
            { name: '📗 JavaScript with JSDoc', value: 'jsdoc' }
          ],
          default: preferences.codeFormat || 'typescript'
        });
        
        // Additional preferences
        const { configureMore } = await confirm({
          message: 'Configure additional preferences?',
          default: false
        });
        
        if (configureMore) {
          // Icon library preference
          preferences.iconLibrary = await select({
            message: 'Default icon library:',
            choices: [
              { name: '🎨 Lucide React', value: 'lucide-react' },
              { name: '📦 React Icons', value: 'react-icons' },
              { name: '🎯 Heroicons', value: 'heroicons' },
              { name: '💎 Tabler Icons', value: 'tabler-icons' },
              { name: '🚀 Phosphor Icons', value: 'phosphor-icons' },
              { name: '⚡ Radix Icons', value: 'radix-icons' }
            ],
            default: preferences.iconLibrary || 'lucide-react'
          });
          
          // State management
          preferences.stateManagement = await select({
            message: 'Default state management:',
            choices: [
              { name: '🚫 None (useState/local state)', value: 'none' },
              { name: '🔄 Redux Toolkit', value: 'redux-toolkit' },
              { name: '🐻 Zustand', value: 'zustand' },
              { name: '📦 MobX', value: 'mobx' },
              { name: '⚛️ Recoil', value: 'recoil' },
              { name: '🎯 Jotai', value: 'jotai' },
              { name: '🏪 Pinia (Vue)', value: 'pinia' },
              { name: '📦 VueX (Vue)', value: 'vuex' }
            ],
            default: preferences.stateManagement || 'none'
          });
          
          // Form library
          preferences.formLibrary = await select({
            message: 'Default form handling library:',
            choices: [
              { name: '🚫 None (native forms)', value: 'none' },
              { name: '📝 React Hook Form', value: 'react-hook-form' },
              { name: '📋 Formik', value: 'formik' },
              { name: '🎯 React Final Form', value: 'react-final-form' },
              { name: '📦 VeeValidate (Vue)', value: 'vee-validate' },
              { name: '🔧 Angular Forms', value: 'angular-forms' }
            ],
            default: preferences.formLibrary || 'none'
          });
          
          // Animation library
          preferences.animationLibrary = await select({
            message: 'Default animation library:',
            choices: [
              { name: '🚫 None (CSS animations)', value: 'none' },
              { name: '🎭 Framer Motion', value: 'framer-motion' },
              { name: '🌟 React Spring', value: 'react-spring' },
              { name: '✨ Auto-Animate', value: 'auto-animate' },
              { name: '🎯 GSAP', value: 'gsap' },
              { name: '📦 Lottie', value: 'lottie' }
            ],
            default: preferences.animationLibrary || 'none'
          });
        }
        
      // Save preferences
      await this.saveUIPreferences(preferences);
      console.log(chalk.green('\n✅ UI preferences saved successfully!'));
      
      console.log(chalk.dim('\n(Press Enter to continue)'));
      try {
        await input({
          message: '',
          default: ''
        });
      } catch (error) {
        await this.handlePromptError(error);
      }
      
    } catch (error) {
      if (error instanceof EscapeError) throw error;
      console.error(chalk.red('Failed to configure UI preferences:', error.message));
    }
  }

  private async configureProjectSettings() {
    console.clear();
    console.log(chalk.cyan.bold('\n📁 Project Settings Configuration\n'));

    try {
      const settings = await this.loadProjectSettings();
      
      // Load UI preferences for defaults
      const uiPrefs = await this.loadUIPreferences();
      
      console.log(chalk.dim('Current project settings:\n'));
      console.log(chalk.gray(`Project Name: ${settings.projectName || 'Not set'}`));
      console.log(chalk.gray(`Project Type: ${settings.projectType || 'Not set'}`));
      console.log(chalk.gray(`Components Path: ${settings.componentsPath || './src/components'}`));
      console.log(chalk.gray(`Output Directory: ${settings.outputDirectory || './generated'}`));
      console.log(chalk.gray(`Auto-import: ${settings.autoImport ? 'Enabled' : 'Disabled'}`));
      console.log(chalk.gray(`Generate Tests: ${settings.generateTests ? 'Yes' : 'No'}`));
      console.log(chalk.gray(`Generate Stories: ${settings.generateStories ? 'Yes' : 'No'}`));
      console.log(chalk.gray(`Generate Documentation: ${settings.generateDocs ? 'Yes' : 'No'}`));
      console.log(chalk.gray(`Component Naming: ${settings.componentNaming || 'PascalCase'}`));
      console.log(chalk.gray(`File Extension: ${settings.fileExtension || '.tsx'}`));
      
      // Get AI recommendations if authenticated
      if (this.context.authenticated) {
        const recommendation = await this.aiAssistant.getRecommendation({
          phase: 'project_settings',
          question: 'What project settings would work best?',
          projectInfo: this.context.projectInfo,
          currentChoices: ['paths', 'testing', 'generation']
        });
        
        if (recommendation.explanation) {
          console.log(chalk.cyan('\n💡 AI Recommendation:'));
          console.log(chalk.gray(recommendation.explanation));
        }
      }
      
      console.log(chalk.yellow('\n📝 Press Enter to modify settings, or ESC to go back\n'));
      
      // Just wait for Enter key
      try {
        await input({
          message: '',
          default: ''
        });
      } catch (error) {
        // ESC was pressed
        await this.handlePromptError(error);
        return;
      }
      
      // Project name
      settings.projectName = await input({
        message: 'Project name:',
        default: settings.projectName || this.context.projectInfo?.projectName || 'my-app'
      });
      
      // Project type
      settings.projectType = await select({
        message: 'Project type:',
        choices: [
          { name: '🌐 Web Application', value: 'web-app' },
          { name: '📱 Mobile App (React Native)', value: 'mobile-app' },
          { name: '🖥️ Desktop App (Electron)', value: 'desktop-app' },
          { name: '📚 Component Library', value: 'component-library' },
          { name: '🎨 Design System', value: 'design-system' },
          { name: '🛍️ E-commerce', value: 'ecommerce' },
          { name: '📊 Dashboard/Admin', value: 'dashboard' },
          { name: '🎮 Game UI', value: 'game-ui' },
          { name: '🏢 Enterprise Application', value: 'enterprise' },
          { name: '🚀 Landing Page', value: 'landing-page' }
        ],
        default: settings.projectType || 'web-app'
      });
      
      // Directory structure
      console.log(chalk.cyan('\n📂 Directory Configuration:'));
      
      settings.componentsPath = await input({
        message: 'Components directory:',
        default: settings.componentsPath || './src/components',
        validate: (value) => value.length > 0 ? true : 'Path is required'
      });
      
      settings.outputDirectory = await input({
        message: 'Generated files output directory:',
        default: settings.outputDirectory || './generated'
      });
      
      settings.templatesPath = await input({
        message: 'Templates directory:',
        default: settings.templatesPath || './templates'
      });
      
      settings.stylesPath = await input({
        message: 'Styles directory:',
        default: settings.stylesPath || './src/styles'
      });
      
      // File naming conventions
      console.log(chalk.cyan('\n📝 Naming Conventions:'));
      
      settings.componentNaming = await select({
        message: 'Component naming convention:',
        choices: [
          { name: 'PascalCase (MyComponent)', value: 'PascalCase' },
          { name: 'kebab-case (my-component)', value: 'kebab-case' },
          { name: 'camelCase (myComponent)', value: 'camelCase' }
        ],
        default: settings.componentNaming || 'PascalCase'
      });
      
      settings.fileExtension = await select({
        message: 'File extension for components:',
        choices: [
          { name: '.tsx (TypeScript + JSX)', value: '.tsx' },
          { name: '.ts (TypeScript)', value: '.ts' },
          { name: '.jsx (JavaScript + JSX)', value: '.jsx' },
          { name: '.js (JavaScript)', value: '.js' },
          { name: '.vue (Vue SFC)', value: '.vue' },
          { name: '.svelte (Svelte)', value: '.svelte' }
        ],
        default: settings.fileExtension || (uiPrefs.codeFormat === 'typescript' ? '.tsx' : '.jsx')
      });
      
      settings.cssFileExtension = await select({
        message: 'CSS file extension:',
        choices: [
          { name: '.module.css (CSS Modules)', value: '.module.css' },
          { name: '.css (Plain CSS)', value: '.css' },
          { name: '.scss (Sass)', value: '.scss' },
          { name: '.less (Less)', value: '.less' },
          { name: '.styled.ts (Styled Components)', value: '.styled.ts' },
          { name: 'No separate CSS files', value: 'none' }
        ],
        default: settings.cssFileExtension || '.module.css'
      });
      
      // Generation options
      console.log(chalk.cyan('\n⚙️ Generation Options:'));
      
      settings.autoImport = await confirm({
        message: 'Enable auto-import in generated components?',
        default: settings.autoImport !== false
      });
      
      settings.generateTests = await confirm({
        message: 'Generate test files with components?',
        default: settings.generateTests === true
      });
      
      if (settings.generateTests) {
        settings.testFileLocation = await select({
          message: 'Test file location:',
          choices: [
            { name: 'Same directory (__tests__/Component.test.tsx)', value: 'same-dir' },
            { name: 'Separate tests directory (tests/components/)', value: 'separate' },
            { name: 'Next to component (Component.test.tsx)', value: 'adjacent' }
          ],
          default: settings.testFileLocation || 'same-dir'
        });
      }
      
      settings.generateStories = await confirm({
        message: 'Generate Storybook stories?',
        default: settings.generateStories === true
      });
      
      settings.generateDocs = await confirm({
        message: 'Generate documentation (JSDoc/TSDoc)?',
        default: settings.generateDocs === true
      });
      
      settings.generateTypes = await confirm({
        message: 'Generate TypeScript type definitions?',
        default: settings.generateTypes === true
      });
      
      settings.generatePropTypes = await confirm({
        message: 'Generate PropTypes (for React)?',
        default: settings.generatePropTypes === false
      });
        
      // Advanced settings
      const { configureAdvanced } = await confirm({
        message: 'Configure advanced project settings?',
        default: false
      });
      
      if (configureAdvanced) {
        console.log(chalk.cyan('\n🔧 Advanced Settings:'));
        
        // Component export style
        settings.exportStyle = await select({
          message: 'Component export style:',
          choices: [
            { name: 'Named export (export const Component)', value: 'named' },
            { name: 'Default export (export default Component)', value: 'default' },
            { name: 'Both named and default', value: 'both' }
          ],
          default: settings.exportStyle || 'named'
        });
        
        // Import style
        settings.importStyle = await select({
          message: 'Import style preference:',
          choices: [
            { name: 'Absolute imports (from ../../components)', value: 'absolute' },
            { name: 'Relative imports (from ./components)', value: 'relative' },
            { name: 'Barrel imports (from ../../components/index)', value: 'barrel' }
          ],
          default: settings.importStyle || 'absolute'
        });
        
        // Component structure
        settings.componentStructure = await select({
          message: 'Component file structure:',
          choices: [
            { name: 'Single file (Component.tsx)', value: 'single' },
            { name: 'Folder with index (Component/index.tsx)', value: 'folder-index' },
            { name: 'Folder with files (Component/Component.tsx, styles.css)', value: 'folder-files' },
            { name: 'Atomic design (atoms/molecules/organisms)', value: 'atomic' }
          ],
          default: settings.componentStructure || 'single'
        });
        
        // Code style preferences
        settings.codeStyle = {
          semicolons: await confirm({
            message: 'Use semicolons?',
            default: true
          }),
          quotes: await select({
            message: 'Quote style:',
            choices: [
              { name: "Single quotes (')", value: 'single' },
              { name: 'Double quotes (")', value: 'double' }
            ],
            default: 'single'
          }),
          trailingComma: await select({
            message: 'Trailing comma:',
            choices: [
              { name: 'None', value: 'none' },
              { name: 'ES5 (objects, arrays)', value: 'es5' },
              { name: 'All (including functions)', value: 'all' }
            ],
            default: 'es5'
          }),
          indentation: await select({
            message: 'Indentation:',
            choices: [
              { name: '2 spaces', value: 2 },
              { name: '4 spaces', value: 4 },
              { name: 'Tabs', value: 'tab' }
            ],
            default: 2
          })
        };
        
        // Accessibility features
        settings.accessibility = {
          ariaLabels: await confirm({
            message: 'Generate ARIA labels?',
            default: true
          }),
          semanticHTML: await confirm({
            message: 'Enforce semantic HTML?',
            default: true
          }),
          keyboardNavigation: await confirm({
            message: 'Add keyboard navigation support?',
            default: true
          })
        };
        
        // Performance optimizations
        settings.performance = {
          lazyLoading: await confirm({
            message: 'Enable lazy loading for components?',
            default: true
          }),
          memoization: await confirm({
            message: 'Add React.memo/useMemo where appropriate?',
            default: true
          }),
          virtualScrolling: await confirm({
            message: 'Use virtual scrolling for lists?',
            default: false
          })
        };
        
        // Git configuration
        settings.gitIntegration = await confirm({
          message: 'Enable Git integration?',
          default: settings.gitIntegration === true
        });
        
        if (settings.gitIntegration) {
          settings.gitCommitStyle = await select({
            message: 'Git commit style:',
            choices: [
              { name: 'Conventional Commits (feat: add button)', value: 'conventional' },
              { name: 'Emoji commits (✨ add button)', value: 'emoji' },
              { name: 'Simple (Add button component)', value: 'simple' }
            ],
            default: settings.gitCommitStyle || 'conventional'
          });
        }
        
        // CI/CD integration
        settings.cicd = await select({
          message: 'CI/CD integration:',
          choices: [
            { name: 'None', value: 'none' },
            { name: 'GitHub Actions', value: 'github-actions' },
            { name: 'GitLab CI', value: 'gitlab-ci' },
            { name: 'CircleCI', value: 'circleci' },
            { name: 'Jenkins', value: 'jenkins' }
          ],
          default: settings.cicd || 'none'
        });
      }
        
        // Save settings
        await this.saveProjectSettings(settings);
        console.log(chalk.green('\n✅ Project settings saved successfully!'));
        
      // Update context
      this.context.preferences = {
        ...this.context.preferences,
        ...settings
      };
      
      console.log(chalk.dim('\n(Press Enter to continue)'));
      try {
        await input({
          message: '',
          default: ''
        });
      } catch (error) {
        await this.handlePromptError(error);
      }
      
    } catch (error) {
      if (error instanceof EscapeError) throw error;
      console.error(chalk.red('Failed to configure project settings:', error.message));
    }
  }

  private async resetConfiguration() {
    console.clear();
    console.log(chalk.cyan.bold('\n🔄 Reset Configuration\n'));
    console.log(chalk.yellow('⚠️  This will reset Revolutionary UI settings to defaults.\n'));

    try {
      console.log(chalk.dim('Available reset options:\n'));
      console.log(chalk.gray('• AI Authentication - Reset Claude session and API keys'));
      console.log(chalk.gray('• UI Preferences - Reset theme and component preferences'));
      console.log(chalk.gray('• Project Settings - Reset project configuration'));
      console.log(chalk.gray('• Component History - Clear generated component history'));
      console.log(chalk.gray('• Cached Data - Clear all cached data'));
      
      console.log(chalk.yellow('\n📝 Press Enter to select what to reset, or ESC to go back\n'));
      
      // Wait for Enter key
      try {
        await input({
          message: '',
          default: ''
        });
      } catch (error) {
        // ESC was pressed
        await this.handlePromptError(error);
        return;
      }
      
      const configs = [
        { name: '🔐 AI Authentication', value: 'auth', checked: true },
        { name: '🎨 UI Preferences', value: 'ui', checked: true },
        { name: '📁 Project Settings', value: 'project', checked: true },
        { name: '📜 Component History', value: 'history', checked: false },
        { name: '💾 Cached Data', value: 'cache', checked: false }
      ];
      
      // Let user select what to reset
      const toReset = await checkbox({
        message: 'Select configurations to reset (Space to toggle, Enter to confirm):',
        choices: configs
      });
      
      if (toReset.length === 0) {
        console.log(chalk.gray('\nNo configurations selected.'));
        console.log(chalk.dim('\n(Press Enter to continue)'));
        await input({ message: '', default: '' });
        return;
      }
      
      // Show what will be reset
      console.log(chalk.yellow(`\n⚠️  About to reset ${toReset.length} configuration(s):`));
      toReset.forEach(config => {
        const configName = configs.find(c => c.value === config)?.name || config;
        console.log(chalk.gray(`  • ${configName}`));
      });
      
      console.log(chalk.red('\n⚠️  This action cannot be undone!'));
      console.log(chalk.yellow('\nType "RESET" to confirm, or press ESC to cancel:\n'));
      
      let confirmation;
      try {
        confirmation = await input({
          message: '',
          validate: (value) => {
            if (value === 'RESET') return true;
            if (value === '') return 'Type RESET to confirm';
            return 'Type RESET to confirm or press ESC to cancel';
          }
        });
      } catch (error) {
        // ESC was pressed
        console.log(chalk.gray('\nReset cancelled.'));
        return;
      }
      
      if (confirmation === 'RESET') {
        const spinner = ora('Resetting configurations...').start();
        
        for (const config of toReset) {
          switch (config) {
            case 'auth':
              await this.resetAuthConfig();
              spinner.text = 'Reset AI authentication';
              break;
            case 'ui':
              await this.resetUIPreferences();
              spinner.text = 'Reset UI preferences';
              break;
            case 'project':
              await this.resetProjectSettings();
              spinner.text = 'Reset project settings';
              break;
            case 'history':
              await this.resetComponentHistory();
              spinner.text = 'Cleared component history';
              break;
            case 'cache':
              await this.clearCache();
              spinner.text = 'Cleared cache';
              break;
          }
        }
        
        spinner.succeed('Configuration reset complete!');
        
        // Reset context
        this.context = {
          authenticated: false,
          projectAnalyzed: false,
          history: [],
          menuStack: ['main']
        };
        
        console.log(chalk.yellow('\n⚠️  You may need to re-authenticate and re-analyze your project.'));
        
        console.log(chalk.dim('\n(Press Enter to continue)'));
        try {
          await input({
            message: '',
            default: ''
          });
        } catch (error) {
          await this.handlePromptError(error);
        }
      }
      
    } catch (error) {
      if (error instanceof EscapeError) throw error;
      console.error(chalk.red('Failed to reset configuration:', error.message));
    }
  }

  // Helper methods for configuration
  private async loadUIPreferences(): Promise<any> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const os = await import('os');
      
      const configDir = path.join(os.homedir(), '.revolutionary-ui');
      const filePath = path.join(configDir, 'ui-preferences.json');
      
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  private async saveUIPreferences(preferences: any): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    
    const configDir = path.join(os.homedir(), '.revolutionary-ui');
    const filePath = path.join(configDir, 'ui-preferences.json');
    
    // Ensure directory exists
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(preferences, null, 2), 'utf-8');
  }

  private async loadProjectSettings(): Promise<any> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const os = await import('os');
      
      const configDir = path.join(os.homedir(), '.revolutionary-ui');
      const filePath = path.join(configDir, 'project-settings.json');
      
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  private async saveProjectSettings(settings: any): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    
    const configDir = path.join(os.homedir(), '.revolutionary-ui');
    const filePath = path.join(configDir, 'project-settings.json');
    
    // Ensure directory exists
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf-8');
  }

  private async resetAuthConfig(): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    
    const configDir = path.join(os.homedir(), '.revolutionary-ui');
    
    try {
      await fs.unlink(path.join(configDir, 'claude-session.json'));
    } catch {}
    
    try {
      await fs.unlink(path.join(configDir, 'api-keys.json'));
    } catch {}
  }

  private async resetUIPreferences(): Promise<void> {
    await this.saveUIPreferences({});
  }

  private async resetProjectSettings(): Promise<void> {
    await this.saveProjectSettings({});
  }

  private async resetComponentHistory(): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    
    const configDir = path.join(os.homedir(), '.revolutionary-ui');
    const filePath = path.join(configDir, 'component-history.json');
    
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ history: [] }, null, 2), 'utf-8');
  }

  private async clearCache(): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    
    const configDir = path.join(os.homedir(), '.revolutionary-ui');
    const filePath = path.join(configDir, 'cache.json');
    
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({}, null, 2), 'utf-8');
  }
}