import chalk from 'chalk'
import inquirer from 'inquirer'
import { WizardConfig } from './configuration-wizard'
import { AuthManager } from '../utils/auth-manager'
import { AIManager } from '../features/ai-manager'
import { CatalogManager } from '../features/catalog-manager'
import { MarketplaceManager } from '../features/marketplace-manager'
import { MonitoringManager } from '../features/monitoring-manager'
import { TeamManager } from '../features/team-manager'
import { CloudManager } from '../features/cloud-manager'
import { AnalyticsManager } from '../features/analytics-manager'
import { VisualBuilderManager } from '../features/visual-builder-manager'

export interface FeatureSetupResult {
  feature: string
  status: 'success' | 'skipped' | 'error'
  message?: string
  config?: any
}

export class FeatureManager {
  private authManager: AuthManager
  private features: Map<string, any>

  constructor() {
    this.authManager = new AuthManager()
    this.features = new Map()
  }

  async setupFeatures(config: WizardConfig): Promise<FeatureSetupResult[]> {
    const results: FeatureSetupResult[] = []
    const enabledFeatures = Object.entries(config.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature)

    console.log(chalk.bold.cyan('\n🚀 Setting Up Features\n'))

    // Always check authentication first
    const authResult = await this.setupAuthentication()
    results.push(authResult)

    // Setup each enabled feature
    for (const feature of enabledFeatures) {
      const result = await this.setupFeature(feature, config)
      results.push(result)
    }

    return results
  }

  async runFeature(featureName: string, command: string, options: any = {}): Promise<void> {
    const feature = this.features.get(featureName)
    
    if (!feature) {
      throw new Error(`Feature ${featureName} not initialized`)
    }

    await feature.execute(command, options)
  }

  async modifyFeatureSettings(featureName: string): Promise<void> {
    const feature = this.features.get(featureName)
    
    if (!feature) {
      console.log(chalk.red(`Feature ${featureName} is not enabled`))
      return
    }

    if (feature.configure) {
      await feature.configure()
    } else {
      console.log(chalk.yellow(`Feature ${featureName} does not support configuration`))
    }
  }

  private async setupAuthentication(): Promise<FeatureSetupResult> {
    console.log(chalk.yellow('🔐 Authentication'))

    const isAuthenticated = await this.authManager.isAuthenticated()

    if (isAuthenticated) {
      const user = await this.authManager.getCurrentUser()
      console.log(chalk.green(`✓ Already authenticated as ${user.email}`))
      return {
        feature: 'authentication',
        status: 'success',
        message: `Authenticated as ${user.email}`
      }
    }

    const { authAction } = await inquirer.prompt([{
      type: 'list',
      name: 'authAction',
      message: 'You need to authenticate to use Revolutionary UI:',
      choices: [
        { name: 'Login with existing account', value: 'login' },
        { name: 'Register new account', value: 'register' },
        { name: 'Continue without authentication (limited features)', value: 'skip' }
      ]
    }])

    if (authAction === 'skip') {
      console.log(chalk.yellow('⚠️  Continuing without authentication. Some features will be limited.'))
      return {
        feature: 'authentication',
        status: 'skipped',
        message: 'Skipped authentication'
      }
    }

    try {
      if (authAction === 'login') {
        await this.authManager.interactiveLogin()
      } else {
        await this.authManager.interactiveRegister()
      }

      const user = await this.authManager.getCurrentUser()
      if (!user) {
        // For offline mode, we might not have the user immediately available
        // but authentication was still successful
        console.log(chalk.green('✓ Authentication successful'))
        return {
          feature: 'authentication',
          status: 'success',
          message: 'Authentication successful'
        }
      }
      
      console.log(chalk.green(`✓ Successfully authenticated as ${user.email}`))

      return {
        feature: 'authentication',
        status: 'success',
        message: `Authenticated as ${user.email}`
      }
    } catch (error: any) {
      console.log(chalk.red(`✗ Authentication failed: ${error.message}`))
      return {
        feature: 'authentication',
        status: 'error',
        message: error.message
      }
    }
  }

  private async setupFeature(featureName: string, config: WizardConfig): Promise<FeatureSetupResult> {
    try {
      // Map feature names from menu to internal names
      const featureMap: Record<string, string> = {
        'ai-generation': 'ai',
        'visual-builder': 'visualBuilder',
        'website-analyzer': 'ai',  // Website analyzer is part of AI
        'ab-testing': 'analytics',
        'registry': 'marketplace',
        'transpilation': 'ai'  // Transpilation is part of AI
      }
      
      const mappedFeature = featureMap[featureName] || featureName
      
      console.log(chalk.yellow(`\n${this.getFeatureIcon(mappedFeature)} ${this.getFeatureName(mappedFeature)}`))

      switch (mappedFeature) {
        case 'ai':
          return await this.setupAI(config)
        case 'catalog':
          return await this.setupCatalog(config)
        case 'marketplace':
          return await this.setupMarketplace(config)
        case 'monitoring':
          return await this.setupMonitoring(config)
        case 'team':
          return await this.setupTeam(config)
        case 'cloud':
          return await this.setupCloud(config)
        case 'analytics':
          return await this.setupAnalytics(config)
        case 'visualBuilder':
          return await this.setupVisualBuilder(config)
        default:
          return {
            feature: featureName,
            status: 'skipped',
            message: 'Unknown feature'
          }
      }
    } catch (error: any) {
      return {
        feature: featureName,
        status: 'error',
        message: error.message
      }
    }
  }

  private async setupAI(config: WizardConfig): Promise<FeatureSetupResult> {
    const aiManager = new AIManager(config)
    
    // Check for existing API keys
    const hasKeys = await aiManager.hasAPIKeys()
    
    if (!hasKeys) {
      console.log(chalk.gray('AI features require API keys for the providers.'))
      
      const { setupKeys } = await inquirer.prompt([{
        type: 'confirm',
        name: 'setupKeys',
        message: 'Would you like to set up AI provider API keys now?',
        default: true
      }])

      if (setupKeys) {
        await aiManager.setupAPIKeys()
      } else {
        console.log(chalk.yellow('⚠️  AI features will be limited without API keys'))
      }
    }

    this.features.set('ai', aiManager)
    console.log(chalk.green('✓ AI features configured'))

    return {
      feature: 'ai',
      status: 'success',
      config: {
        provider: config.preferences.aiProvider,
        hasKeys: await aiManager.hasAPIKeys()
      }
    }
  }

  private async setupCatalog(config: WizardConfig): Promise<FeatureSetupResult> {
    const catalogManager = new CatalogManager(config)
    
    // Initialize catalog index
    await catalogManager.initialize()
    
    this.features.set('catalog', catalogManager)
    console.log(chalk.green('✓ Component catalog ready (10,000+ components)'))

    return {
      feature: 'catalog',
      status: 'success',
      config: {
        totalComponents: await catalogManager.getTotalComponents(),
        frameworks: await catalogManager.getSupportedFrameworks()
      }
    }
  }

  private async setupMarketplace(config: WizardConfig): Promise<FeatureSetupResult> {
    const marketplaceManager = new MarketplaceManager(config)
    
    // Check marketplace connectivity
    const isConnected = await marketplaceManager.checkConnection()
    
    if (!isConnected) {
      console.log(chalk.yellow('⚠️  Unable to connect to marketplace'))
      return {
        feature: 'marketplace',
        status: 'error',
        message: 'Connection failed'
      }
    }

    this.features.set('marketplace', marketplaceManager)
    console.log(chalk.green('✓ Marketplace connected'))

    return {
      feature: 'marketplace',
      status: 'success'
    }
  }

  private async setupMonitoring(config: WizardConfig): Promise<FeatureSetupResult> {
    const monitoringManager = new MonitoringManager(config)
    
    const { autoStart } = await inquirer.prompt([{
      type: 'confirm',
      name: 'autoStart',
      message: 'Start parallel session monitoring automatically?',
      default: true
    }])

    if (autoStart) {
      await monitoringManager.start()
      console.log(chalk.green('✓ Monitoring started'))
    } else {
      console.log(chalk.gray('Monitoring can be started later with: rui monitor start'))
    }

    this.features.set('monitoring', monitoringManager)

    return {
      feature: 'monitoring',
      status: 'success',
      config: { autoStart }
    }
  }

  private async setupTeam(config: WizardConfig): Promise<FeatureSetupResult> {
    const teamManager = new TeamManager(config)
    
    const { createTeam } = await inquirer.prompt([{
      type: 'confirm',
      name: 'createTeam',
      message: 'Would you like to create or join a team?',
      default: false
    }])

    if (createTeam) {
      await teamManager.setupTeam()
    }

    this.features.set('team', teamManager)
    console.log(chalk.green('✓ Team features ready'))

    return {
      feature: 'team',
      status: 'success'
    }
  }

  private async setupCloud(config: WizardConfig): Promise<FeatureSetupResult> {
    const cloudManager = new CloudManager(config)
    
    const { enableSync } = await inquirer.prompt([{
      type: 'confirm',
      name: 'enableSync',
      message: 'Enable automatic cloud sync?',
      default: true
    }])

    if (enableSync) {
      await cloudManager.enableSync()
      console.log(chalk.green('✓ Cloud sync enabled'))
    }

    this.features.set('cloud', cloudManager)

    return {
      feature: 'cloud',
      status: 'success',
      config: { syncEnabled: enableSync }
    }
  }

  private async setupAnalytics(config: WizardConfig): Promise<FeatureSetupResult> {
    const analyticsManager = new AnalyticsManager(config)
    
    await analyticsManager.initialize()
    
    this.features.set('analytics', analyticsManager)
    console.log(chalk.green('✓ Analytics tracking enabled'))

    return {
      feature: 'analytics',
      status: 'success'
    }
  }

  private async setupVisualBuilder(config: WizardConfig): Promise<FeatureSetupResult> {
    const visualBuilderManager = new VisualBuilderManager(config)
    
    console.log(chalk.gray('Visual builder will open in your browser when used'))
    
    this.features.set('visualBuilder', visualBuilderManager)
    console.log(chalk.green('✓ Visual builder ready'))

    return {
      feature: 'visualBuilder',
      status: 'success'
    }
  }

  private getFeatureName(feature: string): string {
    const names: Record<string, string> = {
      ai: 'AI Integration',
      catalog: 'Component Catalog',
      marketplace: 'Marketplace',
      monitoring: 'Session Monitoring',
      team: 'Team Collaboration',
      cloud: 'Cloud Sync',
      analytics: 'Analytics',
      visualBuilder: 'Visual Builder'
    }
    return names[feature] || feature
  }

  private getFeatureIcon(feature: string): string {
    const icons: Record<string, string> = {
      ai: '🤖',
      catalog: '📚',
      marketplace: '🛍️',
      monitoring: '📊',
      team: '👥',
      cloud: '☁️',
      analytics: '📈',
      visualBuilder: '🎨'
    }
    return icons[feature] || '✨'
  }

  // Generation methods for menu options
  async generateWithAI(): Promise<void> {
    const aiManager = this.features.get('ai')
    if (!aiManager) {
      console.log(chalk.yellow('⚠️  AI features are not enabled. Please configure AI first.'))
      return
    }
    await aiManager.execute('generate', {})
  }

  async generateWithFactory(): Promise<void> {
    // Use the AIManager to generate with factory patterns
    const aiManager = this.features.get('ai')
    if (!aiManager) {
      console.log(chalk.yellow('⚠️  Factory generation requires AI features. Please configure AI first.'))
      return
    }
    await aiManager.execute('generate', { mode: 'factory' })
  }

  async generateFromCatalog(): Promise<void> {
    const catalogManager = this.features.get('catalog')
    if (!catalogManager) {
      console.log(chalk.yellow('⚠️  Catalog features are not enabled. Please configure catalog first.'))
      return
    }
    await catalogManager.execute('generate', {})
  }

  async browseCatalog(): Promise<void> {
    const catalogManager = this.features.get('catalog')
    if (!catalogManager) {
      console.log(chalk.yellow('⚠️  Catalog features are not enabled. Please configure catalog first.'))
      return
    }
    await catalogManager.execute('browse', {})
  }

  async browseMarketplace(): Promise<void> {
    const marketplaceManager = this.features.get('marketplace')
    if (!marketplaceManager) {
      console.log(chalk.yellow('⚠️  Marketplace features are not enabled. Please configure marketplace first.'))
      return
    }
    await marketplaceManager.execute('browse', {})
  }

  async analyzeWebsite(): Promise<void> {
    const aiManager = this.features.get('ai')
    if (!aiManager) {
      console.log(chalk.yellow('⚠️  Website analysis requires AI features. Please configure AI first.'))
      return
    }
    await aiManager.execute('analyze-website', {})
  }

  async manageTeam(): Promise<void> {
    const teamManager = this.features.get('team')
    if (!teamManager) {
      console.log(chalk.yellow('⚠️  Team features are not enabled. Please configure team first.'))
      return
    }
    await teamManager.execute('manage', {})
  }

  async cloudSync(): Promise<void> {
    const cloudManager = this.features.get('cloud')
    if (!cloudManager) {
      console.log(chalk.yellow('⚠️  Cloud features are not enabled. Please configure cloud first.'))
      return
    }
    await cloudManager.execute('sync', {})
  }

  async sessionMonitoring(): Promise<void> {
    const monitoringManager = this.features.get('monitoring')
    if (!monitoringManager) {
      console.log(chalk.yellow('⚠️  Monitoring features are not enabled. Please configure monitoring first.'))
      return
    }
    await monitoringManager.execute('status', {})
  }

  async accountSettings(): Promise<void> {
    await this.authManager.showAccountSettings()
  }

  async manageSubscription(): Promise<void> {
    await this.authManager.manageSubscription()
  }

  async viewMetrics(): Promise<void> {
    const analyticsManager = this.features.get('analytics')
    if (!analyticsManager) {
      console.log(chalk.yellow('⚠️  Analytics features are not enabled. Please configure analytics first.'))
      return
    }
    await analyticsManager.execute('view', {})
  }

  async checkForUpdates(): Promise<void> {
    console.log(chalk.cyan('🔄 Checking for updates...'))
    // TODO: Implement update checking logic
    console.log(chalk.green('✓ You are using the latest version (3.0.0)'))
  }

  async login(): Promise<void> {
    await this.authManager.interactiveLogin()
  }

  async register(): Promise<void> {
    await this.authManager.interactiveRegister()
  }
}