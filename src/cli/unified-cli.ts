#!/usr/bin/env node

/**
 * Revolutionary UI v3.2.0 - Unified CLI
 * Combines all CLI features with context-aware commands and interactive wizard
 */

import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import fs from 'fs/promises'
import path from 'path'
import { homedir } from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

// Core modules
import { ProjectAnalyzer } from './core/project-analyzer'
import { SmartProjectAnalyzer } from './core/smart-project-analyzer'
import { ConfigurationWizard } from './core/configuration-wizard'
import { SessionManager } from './core/session-manager'
import { FeatureManager } from './core/feature-manager'
import { ReportGenerator } from './core/report-generator'
import { ChangeDetector } from './core/change-detector'
import { ProjectGenerator } from './core/project-generator'

// Feature modules
import { AuthManager } from './utils/auth-manager'
import { ConfigManager } from './utils/config-manager'
import { UpdateChecker } from './utils/update-checker'
import { TelemetryManager } from './utils/telemetry'
import { AIManager } from './features/ai-manager'
import { CatalogManager } from './features/catalog-manager'
import { MarketplaceManager } from './features/marketplace-manager'
import { MonitoringManager } from './features/monitoring-manager'
import { TeamManager } from './features/team-manager'
import { CloudManager } from './features/cloud-manager'
import { AnalyticsManager } from './features/analytics-manager'
import { VisualBuilderManager } from './features/visual-builder-manager'

// Command modules
import { AuthCommands } from './commands/auth'
import { analyzeCommand } from './commands/analyze'
import { GenerateCommand } from './commands/generate'
import { CatalogCommand } from './commands/catalog'
import { marketplaceCommand } from './commands/marketplace'
import { MonitorCommand } from './commands/monitor'
import { setupCommand } from './commands/setup'
import { configCommand } from './commands/config'
import { teamCommand } from './commands/team'
import { cloudCommand } from './commands/cloud'

// Version
const VERSION = '3.2.0'

// Project context
interface ProjectContext {
  isRevolutionaryProject: boolean
  hasPackageJson: boolean
  hasAuthentication: boolean
  hasTeamConfig: boolean
  hasCloudSync: boolean
  projectType: 'new' | 'existing' | 'none'
  framework?: string
  features: string[]
}

// Revolutionary banner
const printBanner = (showStats = true) => {
  console.clear()
  console.log(chalk.magenta.bold(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║  ██████╗ ███████╗██╗   ██╗ ██████╗ ██╗     ██╗   ██╗████████╗██╗ ██████╗ ███╗   ██╗ ║
║  ██╔══██╗██╔════╝██║   ██║██╔═══██╗██║     ██║   ██║╚══██╔══╝██║██╔═══██╗████╗  ██║ ║
║  ██████╔╝█████╗  ██║   ██║██║   ██║██║     ██║   ██║   ██║   ██║██║   ██║██╔██╗ ██║ ║
║  ██╔══██╗██╔══╝  ╚██╗ ██╔╝██║   ██║██║     ██║   ██║   ██║   ██║██║   ██║██║╚██╗██║ ║
║  ██║  ██║███████╗ ╚████╔╝ ╚██████╔╝███████╗╚██████╔╝   ██║   ██║╚██████╔╝██║ ╚████║ ║
║  ╚═╝  ╚═╝╚══════╝  ╚═══╝   ╚═════╝ ╚══════╝ ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ║
║                                                                               ║
║              U I   F A C T O R Y   v${VERSION}  -  Interactive Suite              ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`))

  if (showStats) {
    console.log(chalk.cyan(`
  📊 Factory Stats:
  • 50+ Frameworks Supported     • 10,000+ UI Components
  • 60-95% Code Reduction        • 4 AI Providers
  • 150+ Component Types         • Real-time Collaboration
`))
  }
}

export class UnifiedCLI {
  private sessionManager: SessionManager
  private featureManager: FeatureManager
  private authManager: AuthManager
  private configManager: ConfigManager
  private updateChecker: UpdateChecker
  private telemetryManager: TelemetryManager
  private context: ProjectContext | null = null

  constructor() {
    this.sessionManager = new SessionManager()
    this.featureManager = new FeatureManager()
    this.authManager = new AuthManager()
    this.configManager = new ConfigManager()
    this.updateChecker = new UpdateChecker()
    this.telemetryManager = new TelemetryManager()
  }

  /**
   * Analyze project context to determine available commands
   */
  private async analyzeContext(): Promise<ProjectContext> {
    const context: ProjectContext = {
      isRevolutionaryProject: false,
      hasPackageJson: false,
      hasAuthentication: false,
      hasTeamConfig: false,
      hasCloudSync: false,
      projectType: 'none',
      features: []
    }

    try {
      // Check for package.json
      const packageJsonPath = path.join(process.cwd(), 'package.json')
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
        context.hasPackageJson = true
        
        // Check if it's a Revolutionary UI project
        if (packageJson.dependencies?.['revolutionary-ui'] || 
            packageJson.devDependencies?.['revolutionary-ui']) {
          context.isRevolutionaryProject = true
          context.projectType = 'existing'
        }

        // Detect framework
        if (packageJson.dependencies?.['react']) context.framework = 'react'
        else if (packageJson.dependencies?.['vue']) context.framework = 'vue'
        else if (packageJson.dependencies?.['@angular/core']) context.framework = 'angular'
        else if (packageJson.dependencies?.['svelte']) context.framework = 'svelte'
      } catch {}

      // Check for Revolutionary UI config
      const configPath = path.join(process.cwd(), '.revolutionary-ui.json')
      try {
        const config = JSON.parse(await fs.readFile(configPath, 'utf-8'))
        context.isRevolutionaryProject = true
        context.features = config.features || []
        context.hasAuthentication = !!config.auth
        context.hasTeamConfig = !!config.team
        context.hasCloudSync = !!config.cloud
      } catch {}

      // Check for auth token
      const authToken = await this.authManager.getStoredAuth()
      if (authToken) {
        context.hasAuthentication = true
      }

    } catch (error) {
      // Ignore errors during context analysis
    }

    this.context = context
    return context
  }

  /**
   * Get available menu options based on context
   */
  private async getContextualMenuOptions(): Promise<any[]> {
    const context = await this.analyzeContext()
    const options: any[] = []

    if (context.projectType === 'none') {
      // No project - offer creation options
      options.push(
        { name: '🆕 Create a new Revolutionary UI project', value: 'create' },
        { name: '📊 Analyze current directory', value: 'analyze' },
        { name: '🔧 Initialize Revolutionary UI in current directory', value: 'init' }
      )
    } else if (context.isRevolutionaryProject) {
      // Existing Revolutionary UI project - full menu
      options.push(
        { name: '🎨 Generate UI components', value: 'generate' },
        { name: '📊 Analyze project', value: 'analyze' },
        { name: '📚 Browse component catalog', value: 'catalog' },
        { name: '🛍️  Marketplace', value: 'marketplace' }
      )

      if (context.hasAuthentication) {
        options.push(
          { name: '👥 Team management', value: 'team' },
          { name: '☁️  Cloud sync', value: 'cloud' },
          { name: '📈 Analytics & monitoring', value: 'analytics' }
        )
      } else {
        options.push({ name: '🔐 Sign in / Sign up', value: 'auth' })
      }

      options.push(
        { name: '⚙️  Configuration', value: 'config' },
        { name: '🔄 Check for updates', value: 'update' }
      )
    } else {
      // Has package.json but not Revolutionary UI
      options.push(
        { name: '🔧 Add Revolutionary UI to project', value: 'add' },
        { name: '📊 Analyze project for compatibility', value: 'analyze' },
        { name: '🎨 Quick component generation', value: 'generate' }
      )
    }

    options.push(
      { name: '📖 Documentation & help', value: 'help' },
      { name: '❌ Exit', value: 'exit' }
    )

    return options
  }

  /**
   * Main interactive wizard
   */
  async interactiveWizard(): Promise<void> {
    printBanner()

    // Load session
    const session = await this.sessionManager.loadSession()
    if (session) {
      console.log(chalk.gray(`\n  Resuming session: ${session.sessionId}`))
    }

    // Check for updates
    if (!session || Date.now() - session.lastUpdateCheck > 86400000) {
      const updateAvailable = await this.updateChecker.checkForUpdates()
      if (updateAvailable) {
        console.log(chalk.yellow(`\n  📦 Update available: v${updateAvailable.version}`))
        console.log(chalk.gray(`     Run 'npm update -g revolutionary-ui' to update\n`))
      }
    }

    // Get contextual menu options
    const menuOptions = await this.getContextualMenuOptions()

    // Main menu
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: menuOptions,
      pageSize: 15
    }])

    // Handle action
    await this.handleAction(action)
  }

  /**
   * Handle selected action
   */
  private async handleAction(action: string): Promise<void> {
    switch (action) {
      case 'create':
        await this.createNewProject()
        break

      case 'init':
      case 'add':
        await this.initializeProject()
        break

      case 'generate':
        await this.generateComponent()
        break

      case 'analyze':
        await this.analyzeProject()
        break

      case 'catalog':
        await this.browseCatalog()
        break

      case 'marketplace':
        await this.openMarketplace()
        break

      case 'auth':
        await this.handleAuth()
        break

      case 'team':
        await this.manageTeam()
        break

      case 'cloud':
        await this.manageCloud()
        break

      case 'analytics':
        await this.viewAnalytics()
        break

      case 'config':
        await this.manageConfig()
        break

      case 'update':
        await this.checkUpdates()
        break

      case 'help':
        await this.showHelp()
        break

      case 'exit':
        console.log(chalk.yellow('\n👋 Thanks for using Revolutionary UI!\n'))
        process.exit(0)

      default:
        console.log(chalk.red(`\n❌ Unknown action: ${action}`))
    }

    // After action, show menu again
    const { continueChoice } = await inquirer.prompt([{
      type: 'confirm',
      name: 'continueChoice',
      message: 'Would you like to do something else?',
      default: true
    }])

    if (continueChoice) {
      await this.interactiveWizard()
    } else {
      console.log(chalk.yellow('\n👋 Thanks for using Revolutionary UI!\n'))
    }
  }

  /**
   * Create new project
   */
  private async createNewProject(): Promise<void> {
    const { CreateAppCLI } = await import('./create-app')
    const cli = new CreateAppCLI()
    await cli.create()
  }

  /**
   * Initialize project
   */
  private async initializeProject(): Promise<void> {
    const wizard = new ConfigurationWizard()
    const config = await wizard.runFullConfiguration()
    
    const spinner = ora('Setting up Revolutionary UI...').start()
    
    // Install package
    const execAsync = promisify(exec)
    try {
      await execAsync('npm install revolutionary-ui --save-dev')
      spinner.succeed('Revolutionary UI installed successfully!')
    } catch (error) {
      spinner.fail('Failed to install Revolutionary UI')
      console.error(error)
      return
    }

    // Save configuration
    await this.configManager.saveConfig(config)
    
    console.log(chalk.green('\n✅ Revolutionary UI is ready to use!'))
    console.log(chalk.gray('\n  Try generating your first component:'))
    console.log(chalk.cyan('  revolutionary-ui generate\n'))
  }

  /**
   * Generate component
   */
  private async generateComponent(): Promise<void> {
    const aiManager = new AIManager()
    const generateCmd = new GenerateCommand()
    
    const { generationType } = await inquirer.prompt([{
      type: 'list',
      name: 'generationType',
      message: 'How would you like to generate components?',
      choices: [
        { name: '🤖 AI-powered generation (describe what you need)', value: 'ai' },
        { name: '🏭 Factory-based generation (use templates)', value: 'factory' },
        { name: '📋 From component catalog', value: 'catalog' },
        { name: '🎨 Visual builder (coming soon)', value: 'visual' }
      ]
    }])

    switch (generationType) {
      case 'ai':
        const { prompt } = await inquirer.prompt([{
          type: 'input',
          name: 'prompt',
          message: 'Describe the component you need:',
          validate: input => input.length > 0
        }])
        
        await generateCmd.generateFromPrompt(prompt)
        break

      case 'factory':
        await generateCmd.interactiveGenerate()
        break

      case 'catalog':
        const catalogManager = new CatalogManager()
        await catalogManager.browseAndGenerate()
        break

      case 'visual':
        console.log(chalk.yellow('\n🚧 Visual builder is coming soon in v3.3.0!'))
        break
    }
  }

  /**
   * Analyze project
   */
  private async analyzeProject(): Promise<void> {
    const analyzer = new SmartProjectAnalyzer()
    const spinner = ora('Analyzing project...').start()
    
    try {
      const analysis = await analyzer.analyzeProject(process.cwd())
      spinner.succeed('Analysis complete!')
      
      const reportGenerator = new ReportGenerator()
      const report = await reportGenerator.generateReport(analysis)
      
      console.log(report)
      
      // Offer to save report
      const { saveReport } = await inquirer.prompt([{
        type: 'confirm',
        name: 'saveReport',
        message: 'Save analysis report to file?',
        default: false
      }])
      
      if (saveReport) {
        const reportPath = path.join(process.cwd(), 'revolutionary-ui-analysis.json')
        await fs.writeFile(reportPath, JSON.stringify(analysis, null, 2))
        console.log(chalk.green(`\n✅ Report saved to: ${reportPath}`))
      }
    } catch (error) {
      spinner.fail('Analysis failed')
      console.error(error)
    }
  }

  /**
   * Browse catalog
   */
  private async browseCatalog(): Promise<void> {
    const catalogCmd = new CatalogCommand()
    await catalogCmd.interactiveBrowse()
  }

  /**
   * Open marketplace
   */
  private async openMarketplace(): Promise<void> {
    const marketplaceManager = new MarketplaceManager()
    await marketplaceManager.interactiveMarketplace()
  }

  /**
   * Handle authentication
   */
  private async handleAuth(): Promise<void> {
    const authCmd = new AuthCommands()
    
    const { authAction } = await inquirer.prompt([{
      type: 'list',
      name: 'authAction',
      message: 'Authentication:',
      choices: [
        { name: '🔐 Sign in', value: 'login' },
        { name: '📝 Sign up', value: 'register' },
        { name: '🔑 Manage API keys', value: 'keys' },
        { name: '🚪 Sign out', value: 'logout' }
      ]
    }])

    switch (authAction) {
      case 'login':
        await authCmd.login()
        break
      case 'register':
        await authCmd.register()
        break
      case 'keys':
        await authCmd.manageKeys()
        break
      case 'logout':
        await authCmd.logout()
        break
    }
  }

  /**
   * Manage team
   */
  private async manageTeam(): Promise<void> {
    const teamManager = new TeamManager()
    await teamManager.interactiveTeamManagement()
  }

  /**
   * Manage cloud sync
   */
  private async manageCloud(): Promise<void> {
    const cloudManager = new CloudManager()
    await cloudManager.interactiveCloudManagement()
  }

  /**
   * View analytics
   */
  private async viewAnalytics(): Promise<void> {
    const analyticsManager = new AnalyticsManager()
    const monitoringManager = new MonitoringManager()
    
    const { analyticsType } = await inquirer.prompt([{
      type: 'list',
      name: 'analyticsType',
      message: 'What would you like to view?',
      choices: [
        { name: '📊 Component usage analytics', value: 'usage' },
        { name: '📈 Performance metrics', value: 'performance' },
        { name: '💰 Code reduction stats', value: 'reduction' },
        { name: '🔍 Real-time monitoring', value: 'monitoring' },
        { name: '📋 Generate report', value: 'report' }
      ]
    }])

    switch (analyticsType) {
      case 'usage':
        await analyticsManager.showUsageAnalytics()
        break
      case 'performance':
        await analyticsManager.showPerformanceMetrics()
        break
      case 'reduction':
        await analyticsManager.showCodeReductionStats()
        break
      case 'monitoring':
        await monitoringManager.startMonitoring()
        break
      case 'report':
        await analyticsManager.generateAnalyticsReport()
        break
    }
  }

  /**
   * Manage configuration
   */
  private async manageConfig(): Promise<void> {
    const { configAction } = await inquirer.prompt([{
      type: 'list',
      name: 'configAction',
      message: 'Configuration:',
      choices: [
        { name: '⚙️  View current config', value: 'view' },
        { name: '✏️  Edit configuration', value: 'edit' },
        { name: '🎨 UI preferences', value: 'ui' },
        { name: '🤖 AI provider settings', value: 'ai' },
        { name: '🔄 Reset to defaults', value: 'reset' }
      ]
    }])

    await configCommand(configAction)
  }

  /**
   * Check for updates
   */
  private async checkUpdates(): Promise<void> {
    const spinner = ora('Checking for updates...').start()
    
    try {
      const update = await this.updateChecker.checkForUpdates()
      
      if (update) {
        spinner.succeed(`Update available: v${update.version}`)
        console.log(chalk.gray(`\nCurrent version: v${VERSION}`))
        console.log(chalk.green(`Latest version: v${update.version}`))
        
        if (update.changelog) {
          console.log(chalk.bold('\nChangelog:'))
          console.log(update.changelog)
        }
        
        const { doUpdate } = await inquirer.prompt([{
          type: 'confirm',
          name: 'doUpdate',
          message: 'Would you like to update now?',
          default: true
        }])
        
        if (doUpdate) {
          const updateSpinner = ora('Updating Revolutionary UI...').start()
          const execAsync = promisify(exec)
          
          try {
            await execAsync('npm update -g revolutionary-ui')
            updateSpinner.succeed('Revolutionary UI updated successfully!')
            console.log(chalk.green('\n✅ Please restart the CLI to use the new version.'))
            process.exit(0)
          } catch (error) {
            updateSpinner.fail('Update failed')
            console.error(error)
          }
        }
      } else {
        spinner.succeed('You are running the latest version!')
      }
    } catch (error) {
      spinner.fail('Failed to check for updates')
      console.error(error)
    }
  }

  /**
   * Show help
   */
  private async showHelp(): Promise<void> {
    console.log(chalk.bold('\n📖 Revolutionary UI Help\n'))
    
    console.log(chalk.cyan('Overview:'))
    console.log('  Revolutionary UI is a factory-based UI generation system that reduces')
    console.log('  code by 60-95% through intelligent component generation.\n')
    
    console.log(chalk.cyan('Key Features:'))
    console.log('  • AI-powered component generation from natural language')
    console.log('  • 150+ component types across 50+ frameworks')
    console.log('  • Real-time collaboration and cloud sync')
    console.log('  • Component marketplace with 10,000+ components')
    console.log('  • Advanced analytics and monitoring')
    console.log('  • Team management and sharing\n')
    
    console.log(chalk.cyan('Quick Commands:'))
    console.log('  revolutionary-ui              - Start interactive wizard')
    console.log('  revolutionary-ui generate     - Generate components')
    console.log('  revolutionary-ui analyze      - Analyze your project')
    console.log('  revolutionary-ui --help       - Show all commands\n')
    
    console.log(chalk.cyan('Resources:'))
    console.log('  Documentation: https://revolutionary-ui.com/docs')
    console.log('  GitHub: https://github.com/siliconyouth/revolutionary-ui')
    console.log('  Support: vladimir@dukelic.com\n')
    
    const { openDocs } = await inquirer.prompt([{
      type: 'confirm',
      name: 'openDocs',
      message: 'Open documentation in browser?',
      default: false
    }])
    
    if (openDocs) {
      const { exec } = await import('child_process')
      exec('open https://revolutionary-ui.com/docs')
    }
  }

  /**
   * Start the CLI
   */
  async start(): Promise<void> {
    try {
      // Initialize telemetry (respects user preferences)
      await this.telemetryManager.initialize()
      
      // Run interactive wizard
      await this.interactiveWizard()
    } catch (error) {
      console.error(chalk.red('\n❌ An error occurred:'), error)
      process.exit(1)
    }
  }
}

// Export for use in other files
export default UnifiedCLI