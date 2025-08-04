import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import fs from 'fs/promises'
import path from 'path'
import { AuthManager } from '../utils/auth-manager'
import { APIClient } from '../utils/api-client'
import { ConfigManager } from '../utils/config-manager'
import { validateComponentName, validateFramework, validateStyleSystem, validateAIProvider } from '../utils/validators'
import { FactoryRegistry } from '../../core/factory-registry'
import { ComponentFactory } from '../../factories/component-factory'

interface GenerateOptions {
  prompt?: string
  ai?: string
  framework?: string
  style?: string
  output?: string
  stream?: boolean
  variations?: number
}

export class GenerateCommand {
  private authManager: AuthManager
  private apiClient: APIClient
  private configManager: ConfigManager
  private factoryRegistry: FactoryRegistry

  constructor() {
    this.authManager = new AuthManager()
    this.apiClient = new APIClient()
    this.configManager = new ConfigManager()
    this.factoryRegistry = FactoryRegistry.getInstance()
  }

  async execute(type: string | undefined, options: GenerateOptions) {
    try {
      // Check authentication for AI features
      if (options.prompt || options.ai) {
        await this.authManager.requireAuth()
      }

      // Determine generation mode
      if (options.prompt) {
        await this.generateWithAI(options)
      } else if (type) {
        await this.generateWithFactory(type, options)
      } else {
        await this.interactiveGenerate(options)
      }
    } catch (error: any) {
      if (error.message.includes('Authentication required')) {
        console.error(chalk.red('❌ ' + error.message))
      } else {
        console.error(chalk.red(`❌ Generation failed: ${error.message}`))
      }
      process.exit(1)
    }
  }

  async executeInteractive() {
    const { mode } = await inquirer.prompt([{
      type: 'list',
      name: 'mode',
      message: 'How would you like to generate a component?',
      choices: [
        { name: '🤖 AI-Powered Generation (Natural Language)', value: 'ai' },
        { name: '🏭 Factory Pattern (Structured)', value: 'factory' },
        { name: '📚 From Catalog Template', value: 'catalog' },
        { name: '🔙 Back', value: 'back' }
      ]
    }])

    if (mode === 'back') return

    switch (mode) {
      case 'ai':
        await this.generateWithAI({})
        break
      case 'factory':
        await this.interactiveGenerate({})
        break
      case 'catalog':
        await this.generateFromCatalog()
        break
    }
  }

  private async generateWithAI(options: GenerateOptions) {
    console.log(chalk.cyan('\n🤖 AI-Powered Component Generation\n'))

    // Collect AI generation parameters
    const params = await this.collectAIParams(options)
    
    // Check user quota
    const user = await this.authManager.getCurrentUser()
    if (user?.usage) {
      console.log(chalk.gray(`\nAI Generations: ${user.usage.aiGenerations}/${user.usage.aiGenerationsLimit} this month`))
      
      if (user.usage.aiGenerations >= user.usage.aiGenerationsLimit) {
        console.error(chalk.red('\n❌ AI generation limit reached for this month'))
        console.log(chalk.yellow('💡 Upgrade to Pro for unlimited generations: https://revolutionary-ui.com/pricing'))
        return
      }
    }

    const spinner = ora('Generating component with AI...').start()

    try {
      if (params.stream) {
        spinner.stop()
        console.log(chalk.cyan('\n📝 AI Response:\n'))
        
        // Stream the response
        let fullResponse = ''
        await this.apiClient.stream('/ai/generate', {
          prompt: params.prompt,
          provider: params.provider,
          framework: params.framework,
          styleSystem: params.styleSystem,
          typescript: params.typescript,
          variations: params.variations
        }, (chunk) => {
          process.stdout.write(chunk)
          fullResponse += chunk
        })
        
        console.log('\n')
        
        // Parse and save the generated code
        await this.saveAIGeneratedCode(fullResponse, params)
      } else {
        // Non-streaming response
        const response = await this.apiClient.post('/ai/generate', {
          prompt: params.prompt,
          provider: params.provider,
          framework: params.framework,
          styleSystem: params.styleSystem,
          typescript: params.typescript,
          variations: params.variations
        })

        spinner.succeed('Component generated successfully!')
        
        // Display and save results
        await this.handleAIResponse(response.data, params)
      }

      // Show metrics
      console.log(chalk.cyan('\n📊 Generation Metrics:'))
      console.log(chalk.gray(`  • Code Reduction: ~${this.estimateCodeReduction(params.prompt)}%`))
      console.log(chalk.gray(`  • Time Saved: ~${this.estimateTimeSaved(params.prompt)} minutes`))
      console.log(chalk.gray(`  • Lines Generated: ${this.countGeneratedLines(params.output || '.')}`))
      
    } catch (error: any) {
      spinner.fail('AI generation failed')
      
      if (error.response?.status === 429) {
        console.error(chalk.red('❌ Rate limit exceeded. Please try again later.'))
      } else if (error.response?.status === 402) {
        console.error(chalk.red('❌ Insufficient credits. Please upgrade your plan.'))
      } else {
        console.error(chalk.red(`❌ ${error.message}`))
      }
    }
  }

  private async generateWithFactory(type: string, options: GenerateOptions) {
    console.log(chalk.cyan(`\n🏭 Generating ${type} component with factory pattern\n`))

    // Get factory for the component type
    const factory = this.factoryRegistry.getFactory(type)
    if (!factory) {
      console.error(chalk.red(`❌ Unknown component type: ${type}`))
      console.log(chalk.gray('\nAvailable types:'))
      this.factoryRegistry.listFactories().forEach(f => {
        console.log(chalk.gray(`  • ${f}`))
      })
      return
    }

    // Collect factory configuration
    const config = await this.collectFactoryConfig(type, options)
    
    const spinner = ora('Generating component...').start()

    try {
      // Generate with factory
      const generatedCode = factory.generate(config)
      
      spinner.succeed('Component generated successfully!')
      
      // Save generated code
      const outputPath = await this.saveGeneratedCode(
        generatedCode,
        type,
        config.name,
        options.output
      )
      
      console.log(chalk.green(`\n✅ Component saved to: ${outputPath}`))
      
      // Show code reduction metrics
      const metrics = factory.getMetrics()
      console.log(chalk.cyan('\n📊 Code Reduction Metrics:'))
      console.log(chalk.gray(`  • Traditional approach: ~${metrics.traditionalLines} lines`))
      console.log(chalk.gray(`  • Factory approach: ${metrics.factoryLines} lines`))
      console.log(chalk.gray(`  • Reduction: ${metrics.reductionPercentage}%`))
      console.log(chalk.gray(`  • Time saved: ~${metrics.timeSaved} minutes`))
      
    } catch (error: any) {
      spinner.fail('Generation failed')
      console.error(chalk.red(`❌ ${error.message}`))
    }
  }

  private async interactiveGenerate(options: GenerateOptions) {
    const { componentType } = await inquirer.prompt([{
      type: 'list',
      name: 'componentType',
      message: 'What type of component would you like to generate?',
      choices: [
        { name: '📋 Form', value: 'form' },
        { name: '📊 Table', value: 'table' },
        { name: '📈 Dashboard', value: 'dashboard' },
        { name: '📉 Chart', value: 'chart' },
        { name: '🎨 Card', value: 'card' },
        { name: '🧭 Navigation', value: 'navigation' },
        { name: '🎭 Modal', value: 'modal' },
        { name: '🏠 Landing Page', value: 'landing' },
        { name: '🎮 Game UI', value: 'game-ui' },
        { name: '💳 Pricing', value: 'pricing' },
        { name: '🔙 Back', value: 'back' }
      ]
    }])

    if (componentType === 'back') return

    await this.generateWithFactory(componentType, options)
  }

  private async generateFromCatalog() {
    console.log(chalk.cyan('\n📚 Generate from Catalog Template\n'))

    const spinner = ora('Fetching popular templates...').start()

    try {
      // Fetch popular templates
      const response = await this.apiClient.get('/catalog/templates', {
        params: { limit: 10, sort: 'popular' }
      })

      spinner.stop()

      const { template } = await inquirer.prompt([{
        type: 'list',
        name: 'template',
        message: 'Select a template:',
        choices: response.data.templates.map((t: any) => ({
          name: `${t.name} - ${t.description} (⭐ ${t.stars})`,
          value: t
        }))
      }])

      // Customize template
      const customization = await this.customizeTemplate(template)
      
      // Generate from template
      const generateSpinner = ora('Generating from template...').start()
      
      const generateResponse = await this.apiClient.post('/catalog/generate', {
        templateId: template.id,
        customization
      })

      generateSpinner.succeed('Component generated from template!')
      
      // Save generated code
      await this.saveGeneratedCode(
        generateResponse.data.code,
        template.type,
        customization.name,
        customization.output
      )
      
    } catch (error: any) {
      spinner.fail('Failed to fetch templates')
      console.error(chalk.red(`❌ ${error.message}`))
    }
  }

  private async collectAIParams(options: GenerateOptions) {
    const questions: any[] = []

    if (!options.prompt) {
      questions.push({
        type: 'input',
        name: 'prompt',
        message: 'Describe the component you want to generate:',
        validate: (value: string) => value.length > 10 || 'Please provide a detailed description'
      })
    }

    if (!options.ai) {
      questions.push({
        type: 'list',
        name: 'provider',
        message: 'Select AI provider:',
        choices: [
          { name: 'OpenAI GPT-4o (Best quality)', value: 'openai' },
          { name: 'Anthropic Claude 3 (Great explanations)', value: 'anthropic' },
          { name: 'Google Gemini Pro (Fast)', value: 'google' },
          { name: 'Mistral (Cost-effective)', value: 'mistral' }
        ],
        default: 'openai'
      })
    }

    if (!options.framework) {
      questions.push({
        type: 'list',
        name: 'framework',
        message: 'Select framework:',
        choices: [
          'React', 'Vue', 'Angular', 'Svelte', 'Solid',
          'Next.js', 'Nuxt', 'Remix', 'Astro', 'Vanilla JS'
        ]
      })
    }

    if (!options.style) {
      questions.push({
        type: 'list',
        name: 'styleSystem',
        message: 'Select styling approach:',
        choices: [
          { name: 'Tailwind CSS', value: 'tailwind' },
          { name: 'CSS Modules', value: 'css-modules' },
          { name: 'Styled Components', value: 'styled-components' },
          { name: 'Emotion', value: 'emotion' },
          { name: 'Plain CSS', value: 'css' },
          { name: 'SCSS/Sass', value: 'scss' }
        ]
      })
    }

    questions.push({
      type: 'confirm',
      name: 'typescript',
      message: 'Use TypeScript?',
      default: true
    })

    if (options.stream === undefined) {
      questions.push({
        type: 'confirm',
        name: 'stream',
        message: 'Stream AI response in real-time?',
        default: true
      })
    }

    if (!options.variations) {
      questions.push({
        type: 'number',
        name: 'variations',
        message: 'Number of variations to generate:',
        default: 1,
        validate: (value: number) => value >= 1 && value <= 5 || 'Please enter 1-5'
      })
    }

    const answers = await inquirer.prompt(questions)

    return {
      prompt: options.prompt || answers.prompt,
      provider: options.ai || answers.provider,
      framework: (options.framework || answers.framework).toLowerCase(),
      styleSystem: options.style || answers.styleSystem,
      typescript: answers.typescript,
      stream: options.stream ?? answers.stream,
      variations: options.variations || answers.variations,
      output: options.output
    }
  }

  private async collectFactoryConfig(type: string, options: GenerateOptions) {
    const questions: any[] = [
      {
        type: 'input',
        name: 'name',
        message: 'Component name:',
        validate: (value: string) => {
          if (!validateComponentName(value)) {
            return 'Component name must be in PascalCase (e.g., MyComponent)'
          }
          return true
        }
      }
    ]

    if (!options.framework) {
      questions.push({
        type: 'list',
        name: 'framework',
        message: 'Select framework:',
        choices: ['React', 'Vue', 'Angular', 'Svelte', 'Solid']
      })
    }

    // Add type-specific configuration questions
    const typeConfig = await this.getTypeSpecificQuestions(type)
    questions.push(...typeConfig)

    const answers = await inquirer.prompt(questions)

    return {
      name: answers.name,
      framework: (options.framework || answers.framework).toLowerCase(),
      ...answers
    }
  }

  private async getTypeSpecificQuestions(type: string): Promise<any[]> {
    switch (type) {
      case 'form':
        return [
          {
            type: 'checkbox',
            name: 'fields',
            message: 'Select form fields:',
            choices: [
              'Text Input', 'Email', 'Password', 'Textarea',
              'Select', 'Checkbox', 'Radio', 'Date Picker',
              'File Upload', 'Number Input'
            ]
          },
          {
            type: 'confirm',
            name: 'validation',
            message: 'Include validation?',
            default: true
          }
        ]
      
      case 'table':
        return [
          {
            type: 'number',
            name: 'columns',
            message: 'Number of columns:',
            default: 5
          },
          {
            type: 'checkbox',
            name: 'features',
            message: 'Select table features:',
            choices: [
              'Sorting', 'Filtering', 'Pagination',
              'Row Selection', 'Expandable Rows', 'Bulk Actions'
            ]
          }
        ]
      
      case 'dashboard':
        return [
          {
            type: 'checkbox',
            name: 'widgets',
            message: 'Select dashboard widgets:',
            choices: [
              'Stats Cards', 'Charts', 'Tables',
              'Activity Feed', 'Calendar', 'Tasks'
            ]
          }
        ]
      
      default:
        return []
    }
  }

  private async saveAIGeneratedCode(response: string, params: any) {
    // Parse code blocks from AI response
    const codeBlocks = this.extractCodeBlocks(response)
    
    if (codeBlocks.length === 0) {
      console.error(chalk.red('❌ No code blocks found in AI response'))
      return
    }

    // Save each code block
    for (let i = 0; i < codeBlocks.length; i++) {
      const block = codeBlocks[i]
      const filename = block.filename || `component${i + 1}.${this.getFileExtension(params.framework, block.language)}`
      const outputPath = path.join(params.output || '.', filename)
      
      await fs.writeFile(outputPath, block.code, 'utf-8')
      console.log(chalk.green(`✅ Saved: ${outputPath}`))
    }
  }

  private async handleAIResponse(data: any, params: any) {
    console.log(chalk.cyan('\n📝 Generated Component:\n'))
    
    if (data.variations && data.variations.length > 1) {
      // Multiple variations
      for (let i = 0; i < data.variations.length; i++) {
        console.log(chalk.yellow(`\nVariation ${i + 1}:`))
        console.log(data.variations[i].code)
        
        if (data.variations[i].explanation) {
          console.log(chalk.gray(`\nExplanation: ${data.variations[i].explanation}`))
        }
      }
      
      // Ask which variation to save
      const { selectedVariation } = await inquirer.prompt([{
        type: 'list',
        name: 'selectedVariation',
        message: 'Which variation would you like to save?',
        choices: data.variations.map((v: any, i: number) => ({
          name: `Variation ${i + 1}`,
          value: i
        })).concat([{ name: 'Save all', value: -1 }])
      }])
      
      if (selectedVariation === -1) {
        // Save all variations
        for (let i = 0; i < data.variations.length; i++) {
          await this.saveGeneratedCode(
            data.variations[i].code,
            'component',
            `Component_V${i + 1}`,
            params.output
          )
        }
      } else {
        // Save selected variation
        await this.saveGeneratedCode(
          data.variations[selectedVariation].code,
          'component',
          'Component',
          params.output
        )
      }
    } else {
      // Single result
      console.log(data.code)
      
      if (data.explanation) {
        console.log(chalk.gray(`\nExplanation: ${data.explanation}`))
      }
      
      await this.saveGeneratedCode(data.code, 'component', 'Component', params.output)
    }
  }

  private async saveGeneratedCode(code: string, type: string, name: string, outputDir?: string): Promise<string> {
    const dir = outputDir || './components'
    await fs.mkdir(dir, { recursive: true })
    
    const filename = `${name}.tsx` // Default to TypeScript React
    const outputPath = path.join(dir, filename)
    
    await fs.writeFile(outputPath, code, 'utf-8')
    
    return outputPath
  }

  private async customizeTemplate(template: any): Promise<any> {
    const questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Component name:',
        default: template.name,
        validate: validateComponentName
      },
      {
        type: 'input',
        name: 'output',
        message: 'Output directory:',
        default: './components'
      }
    ]

    // Add template-specific customization options
    if (template.customizationOptions) {
      questions.push(...template.customizationOptions)
    }

    return inquirer.prompt(questions)
  }

  private extractCodeBlocks(text: string): Array<{ code: string; language?: string; filename?: string }> {
    const blocks: Array<{ code: string; language?: string; filename?: string }> = []
    const regex = /```(\w+)?\s*(\/\/\s*filename:\s*(.+?)\n)?([\s\S]*?)```/g
    
    let match
    while ((match = regex.exec(text)) !== null) {
      blocks.push({
        code: match[4].trim(),
        language: match[1],
        filename: match[3]
      })
    }
    
    return blocks
  }

  private getFileExtension(framework: string, language?: string): string {
    if (language) {
      const extensions: Record<string, string> = {
        typescript: 'ts',
        javascript: 'js',
        tsx: 'tsx',
        jsx: 'jsx',
        vue: 'vue',
        svelte: 'svelte',
        css: 'css',
        scss: 'scss',
        html: 'html'
      }
      return extensions[language.toLowerCase()] || 'txt'
    }

    // Default extensions by framework
    const frameworkExtensions: Record<string, string> = {
      react: 'tsx',
      vue: 'vue',
      angular: 'ts',
      svelte: 'svelte',
      solid: 'tsx',
      vanilla: 'js'
    }
    
    return frameworkExtensions[framework] || 'js'
  }

  private estimateCodeReduction(prompt: string): number {
    // Estimate based on component complexity
    const complexityKeywords = ['complex', 'advanced', 'full', 'complete', 'interactive']
    const isComplex = complexityKeywords.some(keyword => prompt.toLowerCase().includes(keyword))
    
    return isComplex ? 85 : 70
  }

  private estimateTimeSaved(prompt: string): number {
    // Rough estimate based on component type
    const timeEstimates: Record<string, number> = {
      form: 30,
      table: 45,
      dashboard: 90,
      chart: 20,
      modal: 15,
      landing: 60
    }
    
    const type = Object.keys(timeEstimates).find(t => prompt.toLowerCase().includes(t))
    return timeEstimates[type || 'default'] || 25
  }

  private async countGeneratedLines(outputDir: string): Promise<number> {
    try {
      const files = await fs.readdir(outputDir)
      let totalLines = 0
      
      for (const file of files) {
        if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
          const content = await fs.readFile(path.join(outputDir, file), 'utf-8')
          totalLines += content.split('\n').length
        }
      }
      
      return totalLines
    } catch {
      return 0
    }
  }
}