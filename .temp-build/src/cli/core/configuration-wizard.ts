import chalk from 'chalk'
import inquirer from 'inquirer'
import { ProjectAnalysis } from './project-analyzer'

export interface WizardConfig {
  project: {
    name: string
    framework: string
    language: string
    packageManager: string
    typescript: boolean
    styleSystem: string
    componentsDir: string
    outputDir: string
  }
  preferences: {
    aiProvider: string
    defaultFramework: string
    codeStyle: string
    componentNaming: string
    fileNaming: string
    importStyle: string
  }
  features: {
    ai: boolean
    catalog: boolean
    marketplace: boolean
    monitoring: boolean
    team: boolean
    cloud: boolean
    analytics: boolean
    visualBuilder: boolean
  }
  advanced: {
    cacheEnabled: boolean
    telemetry: boolean
    autoUpdate: boolean
    experimentalFeatures: boolean
    debugMode: boolean
  }
}

export class ConfigurationWizard {
  async runWizard(analysis: ProjectAnalysis, report: any): Promise<WizardConfig> {
    console.log(chalk.bold.cyan('\n🧙 Configuration Wizard\n'))
    console.log(chalk.gray('Let\'s set up Revolutionary UI for your project.\n'))

    // Project configuration
    const projectConfig = await this.configureProject(analysis)
    
    // Preferences
    const preferences = await this.configurePreferences(analysis)
    
    // Features
    const features = await this.configureFeatures(analysis)
    
    // Advanced settings
    const advanced = await this.configureAdvanced()

    const config: WizardConfig = {
      project: projectConfig,
      preferences,
      features,
      advanced
    }

    // Show summary
    await this.showConfigSummary(config)

    return config
  }

  async modifyExistingConfig(): Promise<void> {
    const { section } = await inquirer.prompt([{
      type: 'list',
      name: 'section',
      message: 'Which section would you like to modify?',
      choices: [
        { name: '📁 Project Settings', value: 'project' },
        { name: '🎨 Preferences', value: 'preferences' },
        { name: '✨ Features', value: 'features' },
        { name: '⚙️  Advanced Settings', value: 'advanced' },
        { name: '🔙 Back', value: 'back' }
      ]
    }])

    if (section === 'back') return

    // Load existing config and modify the selected section
    // Implementation depends on which section is selected
  }

  private async configureProject(analysis: ProjectAnalysis): Promise<WizardConfig['project']> {
    console.log(chalk.yellow('\n📁 Project Configuration\n'))

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: analysis.summary.name,
        validate: (value: string) => value.length > 0 || 'Project name is required'
      },
      {
        type: 'list',
        name: 'framework',
        message: 'Primary framework:',
        default: analysis.summary.framework,
        choices: [
          'React',
          'Vue',
          'Angular',
          'Svelte',
          'Solid',
          'Next.js',
          'Nuxt',
          'Remix',
          'Astro',
          'Qwik',
          'Other'
        ]
      },
      {
        type: 'list',
        name: 'language',
        message: 'Primary language:',
        default: analysis.summary.language,
        choices: [
          { name: 'TypeScript', value: 'TypeScript' },
          { name: 'JavaScript', value: 'JavaScript' }
        ]
      },
      {
        type: 'list',
        name: 'packageManager',
        message: 'Package manager:',
        default: analysis.summary.packageManager,
        choices: ['npm', 'yarn', 'pnpm', 'bun']
      },
      {
        type: 'list',
        name: 'styleSystem',
        message: 'Styling system:',
        default: this.detectStyleSystem(analysis),
        choices: [
          { name: 'Tailwind CSS', value: 'tailwind' },
          { name: 'CSS Modules', value: 'css-modules' },
          { name: 'Styled Components', value: 'styled-components' },
          { name: 'Emotion', value: 'emotion' },
          { name: 'Plain CSS', value: 'css' },
          { name: 'Sass/SCSS', value: 'scss' },
          { name: 'Vanilla Extract', value: 'vanilla-extract' },
          { name: 'Stitches', value: 'stitches' },
          { name: 'Panda CSS', value: 'panda-css' }
        ]
      },
      {
        type: 'input',
        name: 'componentsDir',
        message: 'Components directory:',
        default: this.detectComponentsDir(analysis) || './components',
        validate: (value: string) => value.length > 0 || 'Components directory is required'
      },
      {
        type: 'input',
        name: 'outputDir',
        message: 'Default output directory for generated components:',
        default: './components/generated',
        validate: (value: string) => value.length > 0 || 'Output directory is required'
      }
    ])

    return {
      ...answers,
      typescript: analysis.summary.hasTypeScript
    }
  }

  private async configurePreferences(analysis: ProjectAnalysis): Promise<WizardConfig['preferences']> {
    console.log(chalk.yellow('\n🎨 Preferences\n'))

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'aiProvider',
        message: 'Preferred AI provider:',
        choices: [
          { name: 'OpenAI (GPT-4)', value: 'openai' },
          { name: 'Anthropic (Claude 3)', value: 'anthropic' },
          { name: 'Google (Gemini)', value: 'google' },
          { name: 'Mistral', value: 'mistral' },
          { name: 'Let me choose each time', value: 'prompt' }
        ],
        default: 'openai'
      },
      {
        type: 'list',
        name: 'codeStyle',
        message: 'Code style preference:',
        choices: [
          { name: 'Airbnb', value: 'airbnb' },
          { name: 'Standard', value: 'standard' },
          { name: 'Google', value: 'google' },
          { name: 'Custom/Project specific', value: 'custom' }
        ],
        default: this.detectCodeStyle(analysis)
      },
      {
        type: 'list',
        name: 'componentNaming',
        message: 'Component naming convention:',
        choices: [
          { name: 'PascalCase (MyComponent)', value: 'PascalCase' },
          { name: 'kebab-case (my-component)', value: 'kebab-case' },
          { name: 'camelCase (myComponent)', value: 'camelCase' }
        ],
        default: 'PascalCase'
      },
      {
        type: 'list',
        name: 'fileNaming',
        message: 'File naming convention:',
        choices: [
          { name: 'PascalCase.tsx (MyComponent.tsx)', value: 'PascalCase' },
          { name: 'kebab-case.tsx (my-component.tsx)', value: 'kebab-case' },
          { name: 'index.tsx in folder (MyComponent/index.tsx)', value: 'folder-index' }
        ],
        default: 'PascalCase'
      },
      {
        type: 'list',
        name: 'importStyle',
        message: 'Import style preference:',
        choices: [
          { name: 'Named exports', value: 'named' },
          { name: 'Default exports', value: 'default' },
          { name: 'Mixed (context-dependent)', value: 'mixed' }
        ],
        default: 'named'
      }
    ])

    return {
      ...answers,
      defaultFramework: analysis.summary.framework
    }
  }

  private async configureFeatures(analysis: ProjectAnalysis): Promise<WizardConfig['features']> {
    console.log(chalk.yellow('\n✨ Features\n'))
    
    // These are just boolean confirmations since detailed feature config happens elsewhere
    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'ai',
        message: 'Enable AI-powered generation?',
        default: true
      },
      {
        type: 'confirm',
        name: 'catalog',
        message: 'Enable component catalog access?',
        default: true
      },
      {
        type: 'confirm',
        name: 'marketplace',
        message: 'Enable marketplace integration?',
        default: true
      },
      {
        type: 'confirm',
        name: 'monitoring',
        message: 'Enable parallel session monitoring?',
        default: analysis.hasMultipleClaudeSessions
      },
      {
        type: 'confirm',
        name: 'team',
        message: 'Enable team collaboration features?',
        default: (analysis.git?.contributors || 0) > 1
      },
      {
        type: 'confirm',
        name: 'cloud',
        message: 'Enable cloud sync?',
        default: true
      },
      {
        type: 'confirm',
        name: 'analytics',
        message: 'Enable analytics and metrics?',
        default: true
      },
      {
        type: 'confirm',
        name: 'visualBuilder',
        message: 'Enable visual component builder?',
        default: true
      }
    ])

    return answers
  }

  private async configureAdvanced(): Promise<WizardConfig['advanced']> {
    console.log(chalk.yellow('\n⚙️  Advanced Settings\n'))

    const { showAdvanced } = await inquirer.prompt([{
      type: 'confirm',
      name: 'showAdvanced',
      message: 'Configure advanced settings?',
      default: false
    }])

    if (!showAdvanced) {
      return {
        cacheEnabled: true,
        telemetry: true,
        autoUpdate: true,
        experimentalFeatures: false,
        debugMode: false
      }
    }

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'cacheEnabled',
        message: 'Enable component caching?',
        default: true
      },
      {
        type: 'confirm',
        name: 'telemetry',
        message: 'Enable anonymous usage telemetry?',
        default: true
      },
      {
        type: 'confirm',
        name: 'autoUpdate',
        message: 'Enable automatic update checks?',
        default: true
      },
      {
        type: 'confirm',
        name: 'experimentalFeatures',
        message: 'Enable experimental features?',
        default: false
      },
      {
        type: 'confirm',
        name: 'debugMode',
        message: 'Enable debug mode?',
        default: false
      }
    ])

    return answers
  }

  private async showConfigSummary(config: WizardConfig): Promise<void> {
    console.log(chalk.bold.cyan('\n📋 Configuration Summary\n'))

    // Project
    console.log(chalk.yellow('Project:'))
    console.log(`  Name: ${config.project.name}`)
    console.log(`  Framework: ${config.project.framework}`)
    console.log(`  Language: ${config.project.language}`)
    console.log(`  Style System: ${config.project.styleSystem}`)
    console.log(`  Components: ${config.project.componentsDir}`)

    // Features
    console.log(chalk.yellow('\nEnabled Features:'))
    const enabledFeatures = Object.entries(config.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature)
    
    enabledFeatures.forEach(feature => {
      console.log(`  ✓ ${this.formatFeatureName(feature)}`)
    })

    // Preferences
    console.log(chalk.yellow('\nPreferences:'))
    console.log(`  AI Provider: ${config.preferences.aiProvider}`)
    console.log(`  Code Style: ${config.preferences.codeStyle}`)
    console.log(`  Component Naming: ${config.preferences.componentNaming}`)

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: '\nIs this configuration correct?',
      default: true
    }])

    if (!confirm) {
      // Allow modification
      console.log(chalk.yellow('\nRestarting configuration wizard...\n'))
      throw new Error('RESTART_WIZARD')
    }
  }

  private detectStyleSystem(analysis: ProjectAnalysis): string {
    if (analysis.summary.hasTailwind) return 'tailwind'
    if (analysis.patterns.stylingPattern === 'CSS Modules') return 'css-modules'
    if (analysis.patterns.stylingPattern === 'Styled Components') return 'styled-components'
    if (analysis.patterns.stylingPattern === 'Emotion') return 'emotion'
    if (analysis.patterns.stylingPattern === 'Sass/SCSS') return 'scss'
    return 'css'
  }

  private detectComponentsDir(analysis: ProjectAnalysis): string | null {
    // Common component directory patterns
    const patterns = [
      'src/components',
      'components',
      'src/ui',
      'ui',
      'src/shared/components',
      'lib/components'
    ]

    // This would need actual file system checking in production
    return patterns[0]
  }

  private detectCodeStyle(analysis: ProjectAnalysis): string {
    if (analysis.summary.hasESLint) {
      // Would need to parse ESLint config to determine style
      return 'custom'
    }
    return 'standard'
  }

  private formatFeatureName(feature: string): string {
    const names: Record<string, string> = {
      ai: 'AI-Powered Generation',
      catalog: 'Component Catalog',
      marketplace: 'Marketplace Integration',
      monitoring: 'Session Monitoring',
      team: 'Team Collaboration',
      cloud: 'Cloud Sync',
      analytics: 'Analytics & Metrics',
      visualBuilder: 'Visual Builder'
    }
    return names[feature] || feature
  }
}