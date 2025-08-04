import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'
import { WizardConfig } from '../core/configuration-wizard'
import { SessionManager } from '../core/session-manager'
import { AIProviderFactory } from '../../ai/services/ai-provider-factory'
import { loadEnvVariables } from '../utils/env-loader'
import fs from 'fs/promises'
import path from 'path'

export class AIManager {
  private config: WizardConfig
  private sessionManager: SessionManager
  private apiKeys: Record<string, string> = {}

  constructor(config: WizardConfig) {
    this.config = config
    this.sessionManager = new SessionManager()
    
    // Load environment variables to get API keys
    loadEnvVariables()
  }

  async hasAPIKeys(): Promise<boolean> {
    // Check environment variables first (no need to ask user)
    if (process.env.OPENAI_API_KEY || 
        process.env.ANTHROPIC_API_KEY ||
        process.env.GOOGLE_AI_API_KEY ||
        process.env.MISTRAL_API_KEY ||
        process.env.GROQ_API_KEY ||
        process.env.PERPLEXITY_API_KEY ||
        process.env.FIREWORKS_API_KEY) {
      return true
    }
    
    // Check for saved keys
    const providers = ['openai', 'anthropic', 'google', 'mistral', 'groq', 'perplexity', 'fireworks']
    for (const provider of providers) {
      const key = await this.sessionManager.loadSecureConfig(`${provider}_api_key`)
      if (key) return true
    }

    return false
  }

  async setupAPIKeys(): Promise<void> {
    console.log(chalk.yellow('\n🔑 AI Provider API Keys Setup\n'))
    console.log(chalk.gray('Your API keys will be securely encrypted and stored locally.\n'))

    const { providers } = await inquirer.prompt([{
      type: 'checkbox',
      name: 'providers',
      message: 'Select AI providers to configure:',
      choices: [
        { name: 'OpenAI (GPT-4)', value: 'openai', checked: true },
        { name: 'Anthropic (Claude 3)', value: 'anthropic' },
        { name: 'Google (Gemini)', value: 'google' },
        { name: 'Mistral', value: 'mistral' }
      ]
    }])

    for (const provider of providers) {
      await this.setupProviderKey(provider)
    }

    console.log(chalk.green('\n✓ API keys configured successfully'))
  }

  async configure(): Promise<void> {
    const choices = [
      { name: 'Change default AI provider', value: 'provider' },
      { name: 'Update API keys', value: 'keys' },
      { name: 'Configure generation settings', value: 'settings' },
      { name: 'Test AI providers', value: 'test' },
      { name: 'Back', value: 'back' }
    ]

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'AI Configuration:',
      choices
    }])

    switch (action) {
      case 'provider':
        await this.changeDefaultProvider()
        break
      case 'keys':
        await this.setupAPIKeys()
        break
      case 'settings':
        await this.configureSettings()
        break
      case 'test':
        await this.testProviders()
        break
    }
  }

  async execute(command: string, options: any): Promise<void> {
    switch (command) {
      case 'generate':
        await this.generateWithAI(options)
        break
      case 'explain':
        await this.explainCode(options)
        break
      case 'optimize':
        await this.optimizeCode(options)
        break
      default:
        console.log(chalk.red(`Unknown AI command: ${command}`))
    }
  }

  private async setupProviderKey(provider: string): Promise<void> {
    const providerNames: Record<string, string> = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google: 'Google',
      mistral: 'Mistral'
    }

    const envVarNames: Record<string, string> = {
      openai: 'OPENAI_API_KEY',
      anthropic: 'ANTHROPIC_API_KEY',
      google: 'GOOGLE_API_KEY',
      mistral: 'MISTRAL_API_KEY'
    }

    const { apiKey } = await inquirer.prompt([{
      type: 'password',
      name: 'apiKey',
      message: `Enter your ${providerNames[provider]} API key:`,
      mask: '*',
      validate: (value: string) => value.length > 0 || 'API key is required'
    }])

    // Save securely
    await this.sessionManager.saveSecureConfig(`${provider}_api_key`, apiKey)
    this.apiKeys[provider] = apiKey

    console.log(chalk.green(`✓ ${providerNames[provider]} API key saved securely`))
    console.log(chalk.gray(`  You can also set ${envVarNames[provider]} environment variable`))
  }

  private async changeDefaultProvider(): Promise<void> {
    const { provider } = await inquirer.prompt([{
      type: 'list',
      name: 'provider',
      message: 'Select default AI provider:',
      choices: [
        { name: 'OpenAI (GPT-4)', value: 'openai' },
        { name: 'Anthropic (Claude 3)', value: 'anthropic' },
        { name: 'Google (Gemini)', value: 'google' },
        { name: 'Mistral', value: 'mistral' }
      ],
      default: this.config.preferences.aiProvider
    }])

    this.config.preferences.aiProvider = provider
    await this.sessionManager.saveConfig({ preferences: this.config.preferences })
    
    console.log(chalk.green(`✓ Default AI provider set to ${provider}`))
  }

  private async configureSettings(): Promise<void> {
    console.log(chalk.yellow('\n⚙️  AI Generation Settings\n'))

    const settings = await inquirer.prompt([
      {
        type: 'number',
        name: 'maxTokens',
        message: 'Maximum tokens per generation:',
        default: 2000,
        validate: (v: number) => v > 0 && v <= 8000
      },
      {
        type: 'number',
        name: 'temperature',
        message: 'Temperature (0-1, higher = more creative):',
        default: 0.7,
        validate: (v: number) => v >= 0 && v <= 1
      },
      {
        type: 'confirm',
        name: 'streaming',
        message: 'Enable streaming responses?',
        default: true
      }
    ])

    await this.sessionManager.saveConfig({ 
      settings: { 
        ...this.config.settings,
        ai: settings 
      } 
    })

    console.log(chalk.green('✓ AI settings updated'))
  }

  private async testProviders(): Promise<void> {
    console.log(chalk.yellow('\n🧪 Testing AI Providers\n'))

    const providers = ['openai', 'anthropic', 'google', 'mistral']
    
    for (const provider of providers) {
      process.stdout.write(`Testing ${provider}... `)
      
      try {
        const key = this.apiKeys[provider] || 
                   await this.sessionManager.loadSecureConfig(`${provider}_api_key`) ||
                   process.env[`${provider.toUpperCase()}_API_KEY`]
        
        if (!key) {
          console.log(chalk.gray('No API key'))
          continue
        }

        // Test the provider
        const aiProvider = AIProviderFactory.createProvider(provider as any)
        const result = await aiProvider.testConnection()
        
        if (result) {
          console.log(chalk.green('✓ Working'))
        } else {
          console.log(chalk.red('✗ Failed'))
        }
      } catch (error: any) {
        console.log(chalk.red('✗ Error'))
      }
    }
  }

  private async generateWithAI(options: any): Promise<void> {
    const { mode } = options
    
    // Check if we have API keys
    if (!await this.hasAPIKeys()) {
      console.log(chalk.red('No AI providers configured. Please add API keys to your .env.local file.'))
      console.log(chalk.gray('\nExample: OPENAI_API_KEY=your-key-here'))
      return
    }

    console.log(chalk.cyan('\n🤖 AI Component Generator\n'))

    // Get component details
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'componentName',
        message: 'Component name:',
        validate: (value: string) => value.length > 0 || 'Component name is required'
      },
      {
        type: 'list',
        name: 'componentType',
        message: 'Component type:',
        choices: [
          'Form',
          'Table',
          'Chart',
          'Dashboard',
          'Navigation',
          'Card',
          'Modal',
          'Layout',
          'Custom'
        ]
      },
      {
        type: 'list',
        name: 'framework',
        message: 'Target framework:',
        choices: [
          'React',
          'Vue',
          'Angular',
          'Svelte',
          'Vanilla JS'
        ],
        default: this.config.project.framework || 'React'
      },
      {
        type: 'checkbox',
        name: 'features',
        message: 'Select features:',
        choices: [
          'TypeScript',
          'Responsive',
          'Dark Mode',
          'Accessibility',
          'Animations',
          'Form Validation',
          'API Integration',
          'State Management'
        ]
      },
      {
        type: 'input',
        name: 'description',
        message: 'Describe your component (be specific):'
      }
    ])

    const spinner = ora('Generating component...').start()

    try {
      // Get available provider
      const provider = await this.getAvailableProvider()
      
      if (!provider) {
        spinner.fail('No AI provider available')
        return
      }

      // Build prompt
      const prompt = this.buildComponentPrompt(answers, mode === 'factory')
      
      // Generate component
      const code = await provider.generateText({
        messages: [
          {
            role: 'system',
            content: 'You are an expert UI component developer. Generate clean, modern, and reusable components.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        maxTokens: 4000,
        temperature: 0.7
      })
      
      spinner.succeed('Component generated successfully!')
      
      // Save component
      await this.saveComponent(answers.componentName, answers.framework, code)
      
      // Show preview
      console.log(chalk.cyan('\n📄 Generated Component:\n'))
      console.log(code.slice(0, 500) + '...\n')
      
      // Track metrics
      await this.trackGeneration(answers)
      
    } catch (error: any) {
      spinner.fail(`Generation failed: ${error.message}`)
    }
  }

  private buildComponentPrompt(answers: any, useFactory: boolean): string {
    const { componentName, componentType, framework, features, description } = answers
    
    let prompt = `Generate a ${componentType} component named "${componentName}" for ${framework}.

Requirements:
- ${description}
- Features: ${features.join(', ')}
`

    if (useFactory) {
      prompt += `
- Use factory pattern for maximum reusability
- Include configuration options
- Support multiple variants
- Add comprehensive props/options
`
    }

    prompt += `
- Include proper TypeScript types if TypeScript is selected
- Add inline documentation
- Follow best practices for ${framework}
- Make it production-ready
- Include example usage

Generate the complete component code.`

    return prompt
  }

  private async saveComponent(name: string, framework: string, code: string) {
    const outputDir = path.join(this.config.outputPath || 'src/components', framework.toLowerCase())
    await fs.mkdir(outputDir, { recursive: true })
    
    const extension = framework === 'React' ? 'tsx' : framework === 'Vue' ? 'vue' : 'ts'
    const filePath = path.join(outputDir, `${name}.${extension}`)
    
    await fs.writeFile(filePath, code)
    console.log(chalk.green(`✓ Component saved to: ${filePath}`))
  }

  private async trackGeneration(details: any) {
    const metricsPath = path.join(process.cwd(), '.revolutionary-ui', 'metrics.json')
    
    try {
      let metrics = { generations: [] }
      try {
        const existing = await fs.readFile(metricsPath, 'utf-8')
        metrics = JSON.parse(existing)
      } catch {}
      
      metrics.generations.push({
        timestamp: new Date().toISOString(),
        component: details.componentName,
        type: details.componentType,
        framework: details.framework,
        features: details.features
      })
      
      await fs.mkdir(path.dirname(metricsPath), { recursive: true })
      await fs.writeFile(metricsPath, JSON.stringify(metrics, null, 2))
    } catch {
      // Metrics tracking is optional
    }
  }

  private async getAvailableProvider(): Promise<any> {
    // Try providers in order of preference
    const providers = [
      { name: 'openai', key: process.env.OPENAI_API_KEY },
      { name: 'anthropic', key: process.env.ANTHROPIC_API_KEY },
      { name: 'google', key: process.env.GOOGLE_AI_API_KEY },
      { name: 'groq', key: process.env.GROQ_API_KEY },
      { name: 'mistral', key: process.env.MISTRAL_API_KEY }
    ]

    for (const { name, key } of providers) {
      if (key) {
        try {
          return AIProviderFactory.createProvider(name as any)
        } catch {}
      }
    }

    return null
  }

  private async explainCode(options: any): Promise<void> {
    console.log(chalk.cyan('\n📖 AI Code Explainer\n'))
    
    const { filePath } = await inquirer.prompt([{
      type: 'input',
      name: 'filePath',
      message: 'Path to file to explain:',
      validate: async (value: string) => {
        try {
          await fs.access(value)
          return true
        } catch {
          return 'File not found'
        }
      }
    }])

    const spinner = ora('Analyzing code...').start()

    try {
      const code = await fs.readFile(filePath, 'utf-8')
      const provider = await this.getAvailableProvider()
      
      if (!provider) {
        spinner.fail('No AI provider available')
        return
      }

      const explanation = await provider.generateText({
        messages: [
          {
            role: 'system',
            content: 'You are a code expert. Explain code clearly and concisely.'
          },
          {
            role: 'user',
            content: `Explain this code:\n\n${code}`
          }
        ],
        maxTokens: 2000
      })
      
      spinner.succeed('Code analyzed!')
      console.log(chalk.cyan('\n📝 Explanation:\n'))
      console.log(explanation)
      
    } catch (error: any) {
      spinner.fail(`Analysis failed: ${error.message}`)
    }
  }

  private async optimizeCode(options: any): Promise<void> {
    console.log(chalk.cyan('\n⚡ AI Code Optimizer\n'))
    
    const { filePath } = await inquirer.prompt([{
      type: 'input',
      name: 'filePath',
      message: 'Path to file to optimize:',
      validate: async (value: string) => {
        try {
          await fs.access(value)
          return true
        } catch {
          return 'File not found'
        }
      }
    }])

    const spinner = ora('Optimizing code...').start()

    try {
      const code = await fs.readFile(filePath, 'utf-8')
      const provider = await this.getAvailableProvider()
      
      if (!provider) {
        spinner.fail('No AI provider available')
        return
      }

      const optimized = await provider.generateText({
        messages: [
          {
            role: 'system',
            content: 'You are a performance optimization expert. Optimize code for performance, readability, and best practices.'
          },
          {
            role: 'user',
            content: `Optimize this code and explain the improvements:\n\n${code}`
          }
        ],
        maxTokens: 4000
      })
      
      spinner.succeed('Code optimized!')
      
      // Ask if user wants to save
      const { save } = await inquirer.prompt([{
        type: 'confirm',
        name: 'save',
        message: 'Save optimized code?',
        default: true
      }])

      if (save) {
        const backupPath = filePath + '.backup'
        await fs.copyFile(filePath, backupPath)
        await fs.writeFile(filePath, optimized)
        console.log(chalk.green(`✓ Code optimized and saved. Backup created at ${backupPath}`))
      } else {
        console.log(chalk.cyan('\n📝 Optimized Code:\n'))
        console.log(optimized)
      }
      
    } catch (error: any) {
      spinner.fail(`Optimization failed: ${error.message}`)
    }
  }
}