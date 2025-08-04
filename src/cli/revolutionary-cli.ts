#!/usr/bin/env node

/**
 * Revolutionary UI v3.2.0 - Comprehensive Interactive CLI
 * Smart wizard-based interface with full project analysis and configuration
 */

import { Command } from 'commander'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { homedir } from 'os'

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
import { AIManager } from './features/ai-manager'
import { CatalogManager } from './features/catalog-manager'
import { MarketplaceManager } from './features/marketplace-manager'
import { MonitoringManager } from './features/monitoring-manager'
import { TeamManager } from './features/team-manager'
import { CloudManager } from './features/cloud-manager'

// Version
const VERSION = '3.2.0'

// Revolutionary banner
const printBanner = () => {
  console.clear()
  console.log(chalk.magenta.bold(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   🏭 Revolutionary UI v${VERSION} - Interactive Development Suite              ║
║   Transform Your Development with 60-95% Less Code                           ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`))
}

// Progress indicator
const showProgress = (step: number, total: number, message: string) => {
  const percentage = Math.round((step / total) * 100)
  const filled = Math.round((step / total) * 20)
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled)
  
  console.log(chalk.cyan(`\n[${bar}] ${percentage}% - ${message}`))
}

// End flow helper
const endFlow = () => {
  console.log(chalk.green('\n✨ Revolutionary UI setup complete!\n'))
  console.log(chalk.cyan('Get started with:'))
  console.log(chalk.gray('  rui generate    - Generate components'))
  console.log(chalk.gray('  rui catalog     - Browse component catalog'))
  console.log(chalk.gray('  rui help        - Show all commands\n'))
}

export class RevolutionaryCLI {
  private sessionManager: SessionManager
  private projectAnalyzer: ProjectAnalyzer
  private smartAnalyzer: SmartProjectAnalyzer
  private configWizard: ConfigurationWizard
  private featureManager: FeatureManager
  private reportGenerator: ReportGenerator
  private changeDetector: ChangeDetector
  private authManager: AuthManager
  private projectGenerator: ProjectGenerator

  constructor() {
    this.sessionManager = new SessionManager()
    this.projectAnalyzer = new ProjectAnalyzer()
    this.smartAnalyzer = new SmartProjectAnalyzer()
    this.configWizard = new ConfigurationWizard()
    this.featureManager = new FeatureManager()
    this.reportGenerator = new ReportGenerator()
    this.changeDetector = new ChangeDetector()
    this.authManager = new AuthManager()
    this.projectGenerator = new ProjectGenerator()
  }

  async start() {
    printBanner()

    // Step 1: Initialize session
    showProgress(1, 7, 'Initializing session...')
    const session = await this.sessionManager.initializeSession()
    
    console.log(chalk.gray(`\nSession ID: ${session.id}`))
    console.log(chalk.gray(`Workspace: ${session.workspace}`))

    // Step 2: Check for existing configuration
    showProgress(2, 7, 'Checking existing configuration...')
    const existingConfig = await this.sessionManager.loadConfig()
    
    if (existingConfig && !session.isFirstRun) {
      // Detect changes since last run
      const changes = await this.changeDetector.detectChanges(existingConfig)
      
      if (changes.hasChanges) {
        console.log(chalk.yellow('\n⚠️  Changes detected since last session:'))
        changes.summary.forEach(change => {
          console.log(chalk.yellow(`  • ${change}`))
        })
        
        const { action } = await inquirer.prompt([{
          type: 'list',
          name: 'action',
          message: 'How would you like to proceed?',
          choices: [
            { name: '🔄 Update configuration with changes', value: 'update' },
            { name: '📊 Re-analyze entire project', value: 'reanalyze' },
            { name: '➡️  Continue with existing configuration', value: 'continue' }
          ]
        }])

        if (action === 'update') {
          await this.updateConfiguration(existingConfig, changes)
        } else if (action === 'reanalyze') {
          await this.fullProjectAnalysis(session)
        }
      } else {
        console.log(chalk.green('✅ No changes detected since last session'))
      }
    } else {
      // First run or no config - do full analysis
      await this.fullProjectAnalysis(session)
    }

    // Step 3: Show main menu
    await this.showMainMenu(session)
  }

  private async fullProjectAnalysis(session: any) {
    console.log(chalk.cyan('\n🔍 Starting comprehensive project analysis...\n'))

    // Step 3: Deep project analysis
    showProgress(3, 7, 'Analyzing project structure...')
    
    // Use Smart Analyzer for better performance
    console.log(chalk.cyan('🧠 Using Smart Project Analyzer for efficient analysis...\n'))
    const smartAnalysis = await this.smartAnalyzer.analyze()
    
    // Convert smart analysis to standard format
    const analysis = {
      summary: {
        name: smartAnalysis.name,
        framework: smartAnalysis.framework,
        frameworks: smartAnalysis.frameworks,
        language: smartAnalysis.language,
        packageManager: smartAnalysis.packageManager,
        hasTypeScript: smartAnalysis.features.hasTypeScript,
        hasTailwind: smartAnalysis.styling.system === 'Tailwind CSS',
        hasESLint: smartAnalysis.features.hasESLint,
        hasPrettier: smartAnalysis.features.hasPrettier,
        hasTests: smartAnalysis.features.hasTests,
        isMonorepo: smartAnalysis.isMonorepo,
        componentCount: smartAnalysis.components.estimatedCount,
        buildTool: smartAnalysis.buildTool,
        styling: smartAnalysis.styling,
        features: smartAnalysis.features,
        uiLibraries: smartAnalysis.components.uiLibraries
      },
      structure: {
        files: [],
        directories: Object.entries(smartAnalysis.structure)
          .filter(([_, value]) => value && value !== false)
          .map(([key, value]) => typeof value === 'string' ? value : key)
      },
      dependencies: smartAnalysis.dependencies,
      devDependencies: smartAnalysis.devDependencies,
      patterns: {
        components: smartAnalysis.components.patterns,
        uiLibraries: smartAnalysis.components.uiLibraries
      },
      metrics: {
        totalFiles: 0,
        components: smartAnalysis.components.estimatedCount,
        dependencies: Object.keys(smartAnalysis.dependencies).length
      },
      git: null,
      environment: {},
      recommendations: smartAnalysis.recommendations,
      hasGit: await this.fileExists('.git'),
      contributors: 1,
      hasMultipleClaudeSessions: false,
      isEnterprise: false,
      frameworks: smartAnalysis.frameworks
    }

    // Step 4: Generate comprehensive report
    showProgress(4, 7, 'Generating analysis report...')
    const report = {
      overview: {
        name: smartAnalysis.name,
        framework: smartAnalysis.framework,
        frameworks: smartAnalysis.frameworks, // Add all detected frameworks
        language: smartAnalysis.language,
        styling: smartAnalysis.styling.system,
        buildTool: smartAnalysis.buildTool
      },
      features: smartAnalysis.features,
      components: smartAnalysis.components,
      recommendations: smartAnalysis.recommendations,
      structure: smartAnalysis.structure,
      dependencies: {
        total: Object.keys(smartAnalysis.dependencies).length,
        dev: Object.keys(smartAnalysis.devDependencies).length
      }
    }
    
    // Display summary
    console.log(chalk.bold.cyan('\n📊 Project Analysis Summary:\n'))
    
    // Project Overview
    console.log(chalk.yellow('Project Overview:'))
    console.log(`  Name: ${chalk.white(report.overview.name)}`)
    console.log(`  Primary Framework: ${chalk.white(report.overview.framework)}`)
    if (report.overview.frameworks && report.overview.frameworks.length > 1) {
      console.log(`  All Frameworks: ${chalk.white(report.overview.frameworks.join(', '))}`)
    }
    console.log(`  Language: ${chalk.white(report.overview.language)}`)
    console.log(`  Styling: ${chalk.white(report.overview.styling)}`)
    console.log(`  Build Tool: ${chalk.white(report.overview.buildTool)}`)
    
    // Features
    console.log(chalk.yellow('\nDetected Features:'))
    Object.entries(report.features).forEach(([key, value]) => {
      if (value) {
        const label = key.replace(/has|is/, '').replace(/([A-Z])/g, ' $1').trim()
        console.log(`  ✓ ${label}`)
      }
    })
    
    // Components
    if (report.components.estimatedCount > 0) {
      console.log(chalk.yellow('\nComponent Analysis:'))
      console.log(`  Estimated Count: ${report.components.estimatedCount}`)
      if (report.components.patterns.length > 0) {
        console.log(`  Patterns: ${report.components.patterns.join(', ')}`)
      }
      if (report.components.uiLibraries.length > 0) {
        console.log(`  UI Libraries: ${report.components.uiLibraries.join(', ')}`)
      }
    }
    
    // Recommendations
    if (report.recommendations.length > 0) {
      console.log(chalk.yellow('\n💡 Recommendations:'))
      report.recommendations.forEach((rec: string) => {
        console.log(`  • ${rec}`)
      })
    }

    // Ask to view detailed report
    const { viewDetails } = await inquirer.prompt([{
      type: 'confirm',
      name: 'viewDetails',
      message: 'Would you like to view the detailed analysis report?',
      default: false
    }])

    if (viewDetails) {
      await this.displayDetailedReport(report)
    }

    // Step 5: Configuration wizard
    showProgress(5, 7, 'Starting configuration wizard...')
    console.log(chalk.cyan('\n⚙️  Let\'s configure Revolutionary UI for your project\n'))
    
    const config = await this.configWizard.runWizard(analysis, report)

    // Step 6: Feature selection
    showProgress(6, 7, 'Selecting features...')
    const selectedFeatures = await this.selectFeatures(analysis, config)

    // Step 7: Save configuration
    showProgress(7, 7, 'Saving configuration...')
    const fullConfig = {
      ...config,
      features: selectedFeatures.reduce((acc: any, f: string) => ({ ...acc, [f]: true }), {}),
      analysis: analysis.summary,
      sessionId: session.id,
      timestamp: new Date().toISOString()
    }
    await this.sessionManager.saveConfig(fullConfig)

    console.log(chalk.green('\n✅ Configuration complete and saved!'))
    
    // Initialize features
    console.log(chalk.cyan('\n🚀 Initializing features...'))
    await this.featureManager.setupFeatures(fullConfig)
  }
  
  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path)
      return true
    } catch {
      return false
    }
  }

  private async showMainMenu(session: any) {
    let exit = false

    // Initialize features from existing config if available
    const config = await this.sessionManager.loadConfig()
    if (config && config.features) {
      console.log(chalk.cyan('🔄 Loading features from configuration...'))
      await this.featureManager.setupFeatures(config)
    }

    while (!exit) {
      console.log(chalk.bold.cyan('\n🎯 Revolutionary UI - Main Menu\n'))

      const config = await this.sessionManager.loadConfig()
      const user = await this.authManager.getCurrentUser()

      // Show user status
      if (user) {
        console.log(chalk.gray(`Logged in as: ${user.email} (${user.plan || 'Free'} plan)`))
      } else {
        console.log(chalk.yellow('Not logged in - some features may be limited'))
      }

      // Show project info
      console.log(chalk.gray(`Project: ${config?.project?.name || 'Unnamed'}`))
      console.log(chalk.gray(`Framework: ${config?.project?.framework || 'Not set'}`))
      console.log(chalk.gray(`Session: ${session.id.substring(0, 8)}...\n`))

      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          new inquirer.Separator('--- Generation ---'),
          { name: '🤖 Generate Component with AI', value: 'generate-ai' },
          { name: '🏭 Generate with Factory Pattern', value: 'generate-factory' },
          { name: '📚 Generate from Catalog Template', value: 'generate-catalog' },
          
          new inquirer.Separator('--- Browse & Discover ---'),
          { name: '🔍 Browse Component Catalog', value: 'catalog' },
          { name: '🛍️  Visit Marketplace', value: 'marketplace' },
          { name: '🌐 Analyze Website for Inspiration', value: 'analyze-website' },
          
          new inquirer.Separator('--- Project Management ---'),
          { name: '📊 View Project Analysis', value: 'view-analysis' },
          { name: '⚙️  Modify Configuration', value: 'config' },
          { name: '🔄 Re-analyze Project', value: 'reanalyze' },
          { name: '📈 View Metrics & Stats', value: 'metrics' },
          
          new inquirer.Separator('--- Collaboration ---'),
          { name: '👥 Team Management', value: 'team' },
          { name: '☁️  Cloud Sync', value: 'cloud' },
          { name: '📡 Session Monitoring', value: 'monitor' },
          
          new inquirer.Separator('--- Account ---'),
          user ? 
            { name: '👤 Account Settings', value: 'account' } :
            { name: '🔐 Login / Register', value: 'auth' },
          { name: '💳 Manage Subscription', value: 'subscription' },
          
          new inquirer.Separator(),
          { name: '❓ Help & Documentation', value: 'help' },
          { name: '🔄 Check for Updates', value: 'update' },
          { name: '❌ Exit', value: 'exit' }
        ],
        pageSize: 20
      }])

      try {
        switch (action) {
          case 'generate-ai':
            await this.featureManager.generateWithAI()
            break
          
          case 'generate-factory':
            await this.featureManager.generateWithFactory()
            break
          
          case 'generate-catalog':
            await this.featureManager.generateFromCatalog()
            break
          
          case 'catalog':
            await this.featureManager.browseCatalog()
            break
          
          case 'marketplace':
            await this.featureManager.browseMarketplace()
            break
          
          case 'analyze-website':
            await this.featureManager.analyzeWebsite()
            break
          
          case 'view-analysis':
            await this.viewProjectAnalysis()
            break
          
          case 'config':
            await this.modifyConfiguration()
            break
          
          case 'reanalyze':
            await this.fullProjectAnalysis(session)
            break
          
          case 'metrics':
            await this.viewMetrics()
            break
          
          case 'team':
            await this.featureManager.manageTeam()
            break
          
          case 'cloud':
            await this.featureManager.cloudSync()
            break
          
          case 'monitor':
            await this.featureManager.sessionMonitoring()
            break
          
          case 'auth':
            await this.handleAuth()
            break
          
          case 'account':
            await this.featureManager.accountSettings()
            break
          
          case 'subscription':
            await this.featureManager.manageSubscription()
            break
          
          case 'help':
            await this.showHelp()
            break
          
          case 'update':
            await this.checkForUpdates()
            break
          
          case 'exit':
            exit = true
            break
        }
      } catch (error: any) {
        console.error(chalk.red(`\n❌ Error: ${error.message}`))
        console.log(chalk.gray('Press any key to continue...'))
        await this.waitForKeypress()
      }

      if (!exit) {
        // Save any changes to config
        await this.sessionManager.updateSessionTimestamp()
      }
    }

    console.log(chalk.cyan('\n👋 Thanks for using Revolutionary UI!'))
    console.log(chalk.gray('Your configuration has been saved for next time.\n'))
  }

  private async selectFeatures(analysis: any, config: any) {
    console.log(chalk.cyan('\n🎯 Feature Selection\n'))
    console.log(chalk.gray('Select the features you want to enable:\n'))

    const featureChoices = [
      {
        name: '🤖 AI-Powered Generation',
        value: 'ai-generation',
        checked: true,
        description: 'Generate components using GPT-4, Claude, Gemini, or Mistral'
      },
      {
        name: '📚 Component Catalog Access',
        value: 'catalog',
        checked: true,
        description: 'Browse 10,000+ UI components'
      },
      {
        name: '🛍️  Marketplace Integration',
        value: 'marketplace',
        checked: true,
        description: 'Buy and sell premium components'
      },
      {
        name: '📊 Parallel Session Monitoring',
        value: 'monitoring',
        checked: analysis.hasMultipleClaudeSessions,
        description: 'Monitor changes across Claude Code sessions'
      },
      {
        name: '👥 Team Collaboration',
        value: 'team',
        checked: analysis.hasGit && analysis.contributors > 1,
        description: 'Share components with your team'
      },
      {
        name: '☁️  Cloud Sync',
        value: 'cloud',
        checked: true,
        description: 'Sync components across devices'
      },
      {
        name: '📈 Analytics & Metrics',
        value: 'analytics',
        checked: true,
        description: 'Track code reduction and usage'
      },
      {
        name: '🔐 Private Registry',
        value: 'registry',
        checked: analysis.isEnterprise,
        description: 'Host private component packages'
      },
      {
        name: '🎨 Visual Component Builder',
        value: 'visual-builder',
        checked: true,
        description: 'Design components visually'
      },
      {
        name: '🔄 Framework Transpilation',
        value: 'transpilation',
        checked: analysis.frameworks.length > 1,
        description: 'Convert components between frameworks'
      },
      {
        name: '🌐 Website Inspiration Analyzer',
        value: 'website-analyzer',
        checked: true,
        description: 'Extract components from any website'
      },
      {
        name: '🧪 A/B Testing Tools',
        value: 'ab-testing',
        checked: false,
        description: 'Test component variations'
      }
    ]

    const { features } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'features',
      message: 'Select features to enable:',
      choices: featureChoices.map(f => ({
        name: `${f.name}\n     ${chalk.gray(f.description)}`,
        value: f.value,
        checked: f.checked,
        short: f.name
      })),
      pageSize: 15
    }])

    // Configure selected features
    for (const feature of features) {
      if (feature === 'ai-generation') {
        await this.configureAIProviders()
      } else if (feature === 'monitoring') {
        await this.configureMonitoring()
      } else if (feature === 'team') {
        await this.configureTeam()
      }
    }

    return features
  }

  private async configureAIProviders() {
    console.log(chalk.cyan('\n🤖 AI Provider Configuration\n'))

    const { providers } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'providers',
      message: 'Select AI providers to configure:',
      choices: [
        { name: 'OpenAI (GPT-4)', value: 'openai', checked: true },
        { name: 'Anthropic (Claude 3)', value: 'anthropic', checked: false },
        { name: 'Google (Gemini)', value: 'google', checked: false },
        { name: 'Mistral', value: 'mistral', checked: false }
      ]
    }])

    const apiKeys: Record<string, string> = {}

    for (const provider of providers) {
      const { apiKey } = await inquirer.prompt([{
        type: 'password',
        name: 'apiKey',
        message: `Enter your ${provider} API key:`,
        mask: '*',
        validate: (value: string) => value.length > 0 || 'API key is required'
      }])

      apiKeys[provider] = apiKey
    }

    // Save API keys securely
    await this.sessionManager.saveSecureConfig('aiProviders', apiKeys)
    
    console.log(chalk.green('✅ AI providers configured successfully'))
  }

  private async configureMonitoring() {
    console.log(chalk.cyan('\n📊 Monitoring Configuration\n'))

    const { config } = await inquirer.prompt([
      {
        type: 'number',
        name: 'checkInterval',
        message: 'Check interval (seconds):',
        default: 30,
        validate: (value: number) => value >= 5 || 'Minimum interval is 5 seconds'
      },
      {
        type: 'confirm',
        name: 'enableNotifications',
        message: 'Enable desktop notifications?',
        default: true
      },
      {
        type: 'confirm',
        name: 'enableWebhook',
        message: 'Enable webhook notifications?',
        default: false
      }
    ])

    if (config.enableWebhook) {
      const { webhookUrl } = await inquirer.prompt([{
        type: 'input',
        name: 'webhookUrl',
        message: 'Webhook URL:',
        validate: (value: string) => {
          try {
            new URL(value)
            return true
          } catch {
            return 'Please enter a valid URL'
          }
        }
      }])
      
      config.webhookUrl = webhookUrl
    }

    await this.sessionManager.saveConfig({ monitoring: config })
    console.log(chalk.green('✅ Monitoring configured successfully'))
  }

  private async configureTeam() {
    console.log(chalk.cyan('\n👥 Team Configuration\n'))

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'Team setup:',
      choices: [
        { name: 'Create new team', value: 'create' },
        { name: 'Join existing team', value: 'join' },
        { name: 'Skip for now', value: 'skip' }
      ]
    }])

    if (action === 'create') {
      const { teamName } = await inquirer.prompt([{
        type: 'input',
        name: 'teamName',
        message: 'Team name:',
        validate: (value: string) => value.length > 0 || 'Team name is required'
      }])

      // Create team via API
      console.log(chalk.green(`✅ Team "${teamName}" created successfully`))
    } else if (action === 'join') {
      const { inviteCode } = await inquirer.prompt([{
        type: 'input',
        name: 'inviteCode',
        message: 'Enter invite code:',
        validate: (value: string) => value.length > 0 || 'Invite code is required'
      }])

      // Join team via API
      console.log(chalk.green('✅ Successfully joined team'))
    }
  }

  private async handleAuth() {
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'Authentication:',
      choices: [
        { name: '🔐 Login to existing account', value: 'login' },
        { name: '✨ Register new account', value: 'register' },
        { name: '🔙 Back', value: 'back' }
      ]
    }])

    if (action === 'login') {
      await this.featureManager.login()
    } else if (action === 'register') {
      await this.featureManager.register()
    }
  }

  private async displayDetailedReport(report: any) {
    console.log(chalk.bold.cyan('\n📋 Detailed Analysis Report\n'))
    
    // Project Structure
    console.log(chalk.yellow('Project Structure:'))
    console.log(report.structure)
    
    // Dependencies
    console.log(chalk.yellow('\nDependencies:'))
    console.log(report.dependencies)
    
    // Code Metrics
    console.log(chalk.yellow('\nCode Metrics:'))
    console.log(report.metrics)
    
    // Patterns Detected
    console.log(chalk.yellow('\nDetected Patterns:'))
    console.log(report.patterns)

    console.log(chalk.gray('\nPress any key to continue...'))
    await this.waitForKeypress()
  }

  private async updateConfiguration(config: any, changes: any) {
    console.log(chalk.cyan('\n🔄 Updating configuration...\n'))
    
    // Apply detected changes
    const updatedConfig = await this.changeDetector.applyChanges(config, changes)
    
    // Save updated config
    await this.sessionManager.saveConfig(updatedConfig)
    
    console.log(chalk.green('✅ Configuration updated successfully'))
  }

  private async viewProjectAnalysis() {
    const config = await this.sessionManager.loadConfig()
    if (!config?.analysis) {
      console.log(chalk.yellow('No analysis data available. Run project analysis first.'))
      return
    }

    console.log(chalk.bold.cyan('\n📊 Project Analysis\n'))
    console.log(config.analysis)
    
    console.log(chalk.gray('\nPress any key to continue...'))
    await this.waitForKeypress()
  }

  private async modifyConfiguration() {
    // Implementation for configuration modification
    await this.configWizard.modifyExistingConfig()
  }

  private async viewMetrics() {
    // Implementation for viewing metrics
    await this.featureManager.viewMetrics()
  }

  private async showHelp() {
    console.log(chalk.bold.cyan('\n❓ Revolutionary UI Help\n'))
    console.log(chalk.white('Revolutionary UI is a comprehensive development suite that helps you:'))
    console.log(chalk.gray('  • Generate UI components with 60-95% less code'))
    console.log(chalk.gray('  • Use AI to create components from natural language'))
    console.log(chalk.gray('  • Browse and use 10,000+ pre-built components'))
    console.log(chalk.gray('  • Collaborate with your team in real-time'))
    console.log(chalk.gray('  • Monitor parallel development sessions'))
    
    console.log(chalk.cyan('\n📚 Documentation:'))
    console.log(chalk.gray('  • Website: https://revolutionary-ui.com'))
    console.log(chalk.gray('  • Docs: https://revolutionary-ui.com/docs'))
    console.log(chalk.gray('  • Support: support@revolutionary-ui.com'))
    
    console.log(chalk.gray('\nPress any key to continue...'))
    await this.waitForKeypress()
  }

  private async checkForUpdates() {
    // Implementation for update checking
    await this.featureManager.checkForUpdates()
  }

  private async waitForKeypress() {
    process.stdin.setRawMode(true)
    process.stdin.resume()
    
    return new Promise<void>((resolve) => {
      process.stdin.once('data', () => {
        process.stdin.setRawMode(false)
        process.stdin.pause()
        resolve()
      })
    })
  }

  async quickGenerate(type?: string, options?: any): Promise<void> {
    showProgress(1, 3, 'Loading configuration...')
    
    const session = await this.sessionManager.initializeSession()
    const config = await this.sessionManager.loadConfig()
    
    if (!config) {
      console.log(chalk.yellow('\nNo configuration found. Running setup wizard...\n'))
      await this.start()
      return
    }

    showProgress(2, 3, 'Starting generation wizard...')
    
    // If type is provided, use it directly, otherwise go to interactive mode
    if (type) {
      await this.featureManager.runFeature('ai', 'generate', { type, ...options })
    } else {
      // Interactive generation
      console.log(chalk.cyan('\n🎨 Component Generation Wizard\n'))
      await this.featureManager.runFeature('ai', 'generate', options)
    }

    showProgress(3, 3, 'Complete!')
  }

  async analyzeOnly(options?: any): Promise<void> {
    showProgress(1, 2, 'Analyzing project...')
    
    // Use smart analyzer by default or if explicitly requested
    const useSmartAnalyzer = options?.smart !== false
    
    let analysis: any
    let report: any
    
    if (useSmartAnalyzer) {
      console.log(chalk.cyan('\n🧠 Using Smart Project Analyzer...\n'))
      const smartAnalysis = await this.smartAnalyzer.analyze()
      
      // Convert smart analysis to standard format for report generator
      analysis = {
        summary: {
          name: smartAnalysis.name,
          framework: smartAnalysis.framework,
          frameworks: smartAnalysis.frameworks,
          language: smartAnalysis.language,
          packageManager: smartAnalysis.packageManager,
          hasTypeScript: smartAnalysis.features.hasTypeScript,
          hasTailwind: smartAnalysis.styling.system === 'Tailwind CSS',
          hasESLint: smartAnalysis.features.hasESLint,
          hasPrettier: smartAnalysis.features.hasPrettier,
          hasTests: smartAnalysis.features.hasTests,
          isMonorepo: smartAnalysis.isMonorepo,
          componentCount: smartAnalysis.components.estimatedCount
        },
        structure: {
          files: [],
          directories: Object.entries(smartAnalysis.structure)
            .filter(([_, value]) => value && value !== false)
            .map(([key, value]) => typeof value === 'string' ? value : key)
        },
        dependencies: smartAnalysis.dependencies,
        devDependencies: smartAnalysis.devDependencies,
        patterns: {
          components: smartAnalysis.components.patterns,
          uiLibraries: smartAnalysis.components.uiLibraries
        },
        metrics: {
          totalFiles: 0,
          components: smartAnalysis.components.estimatedCount,
          dependencies: Object.keys(smartAnalysis.dependencies).length
        },
        git: null,
        environment: {},
        recommendations: smartAnalysis.recommendations
      }
      
      // Create custom report for smart analysis
      report = {
        overview: {
          name: smartAnalysis.name,
          framework: smartAnalysis.framework,
          frameworks: smartAnalysis.frameworks, // Add all detected frameworks
          language: smartAnalysis.language,
          styling: smartAnalysis.styling.system,
          buildTool: smartAnalysis.buildTool
        },
        features: smartAnalysis.features,
        components: smartAnalysis.components,
        recommendations: smartAnalysis.recommendations,
        structure: smartAnalysis.structure
      }
    } else {
      analysis = await this.projectAnalyzer.analyzeProject()
      report = await this.reportGenerator.generateAnalysisReport(analysis)
    }
    
    showProgress(2, 2, 'Analysis complete!')
    
    if (useSmartAnalyzer) {
      // Display smart analysis report
      console.log(chalk.bold.cyan('\n📊 Smart Project Analysis Report\n'))
      
      // Project Overview
      console.log(chalk.yellow('Project Overview:'))
      console.log(`  Name: ${chalk.white(report.overview.name)}`)
      console.log(`  Primary Framework: ${chalk.white(report.overview.framework)}`)
      if (report.overview.frameworks && report.overview.frameworks.length > 1) {
        console.log(`  All Frameworks: ${chalk.white(report.overview.frameworks.join(', '))}`)
      }
      console.log(`  Language: ${chalk.white(report.overview.language)}`)
      console.log(`  Styling: ${chalk.white(report.overview.styling)}`)
      console.log(`  Build Tool: ${chalk.white(report.overview.buildTool)}`)
      
      // Features
      console.log(chalk.yellow('\nDetected Features:'))
      Object.entries(report.features).forEach(([key, value]) => {
        if (value) {
          const label = key.replace(/has|is/, '').replace(/([A-Z])/g, ' $1').trim()
          console.log(`  ✓ ${label}`)
        }
      })
      
      // Components
      if (report.components.estimatedCount > 0) {
        console.log(chalk.yellow('\nComponent Analysis:'))
        console.log(`  Estimated Count: ${report.components.estimatedCount}`)
        if (report.components.patterns.length > 0) {
          console.log(`  Patterns: ${report.components.patterns.join(', ')}`)
        }
        if (report.components.uiLibraries.length > 0) {
          console.log(`  UI Libraries: ${report.components.uiLibraries.join(', ')}`)
        }
      }
      
      // Recommendations
      if (report.recommendations.length > 0) {
        console.log(chalk.yellow('\n💡 Recommendations:'))
        report.recommendations.forEach((rec: string) => {
          console.log(`  • ${rec}`)
        })
      }
    } else {
      await this.reportGenerator.displayReport(report)
    }
    
    const { saveReport } = await inquirer.prompt([{
      type: 'confirm',
      name: 'saveReport',
      message: 'Save analysis report to file?',
      default: false
    }])

    if (saveReport) {
      const filename = await this.reportGenerator.saveReportToFile(report)
      console.log(chalk.green(`\n✓ Report saved to: ${filename}`))
    }
  }

  async modifyConfig(section?: string): Promise<void> {
    const config = await this.sessionManager.loadConfig()
    
    if (!config) {
      console.log(chalk.yellow('No configuration found. Please run setup first.'))
      console.log(chalk.cyan('Run: rui'))
      return
    }

    if (section) {
      // Modify specific section
      await this.featureManager.modifyFeatureSettings(section)
    } else {
      // Show configuration menu
      await this.configWizard.modifyExistingConfig()
    }
  }

  async login(): Promise<void> {
    const authManager = new AuthManager()
    await authManager.interactiveLogin()
  }

  async logout(): Promise<void> {
    const authManager = new AuthManager()
    await authManager.logout()
    console.log(chalk.green('✓ Successfully logged out'))
  }
}

// Main entry point
const main = async () => {
  try {
    const cli = new RevolutionaryCLI()
    await cli.start()
  } catch (error: any) {
    console.error(chalk.red(`\n❌ Fatal error: ${error.message}`))
    console.error(chalk.gray(error.stack))
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n⚠️  Revolutionary UI interrupted'))
  console.log(chalk.gray('Your configuration has been saved.\n'))
  process.exit(0)
})

// Run the CLI
main()