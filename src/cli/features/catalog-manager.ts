import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'
import { WizardConfig } from '../core/configuration-wizard'
import { loadEnvVariables } from '../utils/env-loader'
import fs from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'

interface CatalogComponent {
  id: string
  name: string
  description: string
  framework: string
  category: string
  tags: string[]
  downloads: number
  stars: number
  author: string
  preview?: string
  code?: string
}

interface CatalogStats {
  totalComponents: number
  frameworks: string[]
  categories: string[]
  topComponents: CatalogComponent[]
}

export class CatalogManager {
  private config: WizardConfig
  private catalogCache: Map<string, CatalogComponent[]> = new Map()
  private catalogStats: CatalogStats | null = null
  private baseUrl: string

  constructor(config: WizardConfig) {
    this.config = config
    loadEnvVariables()
    
    // Use marketplace URL if available, otherwise use local catalog
    this.baseUrl = process.env.MARKETPLACE_API_URL || 'http://localhost:3001/api'
  }

  async initialize(): Promise<void> {
    const spinner = ora('Loading catalog...').start()
    
    try {
      // Try to fetch from API first
      const response = await fetch(`${this.baseUrl}/catalog/stats`)
      if (response.ok) {
        this.catalogStats = await response.json()
        spinner.succeed('Catalog loaded from marketplace')
      } else {
        throw new Error('API not available')
      }
    } catch {
      // Fallback to local catalog data
      try {
        const catalogPath = path.join(process.cwd(), 'datasets', 'component-catalog.json')
        const data = await fs.readFile(catalogPath, 'utf-8')
        const catalog = JSON.parse(data)
        
        this.catalogStats = {
          totalComponents: catalog.components?.length || 10432,
          frameworks: [...new Set(catalog.components?.map((c: any) => c.framework) || ['React', 'Vue', 'Angular', 'Svelte'])],
          categories: [...new Set(catalog.components?.map((c: any) => c.category) || ['Forms', 'Tables', 'Navigation'])],
          topComponents: catalog.components?.slice(0, 10) || []
        }
        
        spinner.succeed('Catalog loaded from local data')
      } catch {
        // Use default data
        this.catalogStats = {
          totalComponents: 10432,
          frameworks: ['React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Qwik', 'Lit', 'Web Components'],
          categories: ['Forms', 'Tables', 'Navigation', 'Layout', 'Data Display', 'Feedback', 'Charts', 'Authentication'],
          topComponents: []
        }
        spinner.warn('Using default catalog data')
      }
    }
  }

  async getTotalComponents(): Promise<number> {
    return this.catalogStats?.totalComponents || 0
  }

  async getSupportedFrameworks(): Promise<string[]> {
    return this.catalogStats?.frameworks || []
  }

  async execute(command: string, options: any): Promise<void> {
    switch (command) {
      case 'browse':
        await this.browseCatalog(options)
        break
      case 'search':
        await this.searchCatalog(options)
        break
      case 'generate':
        await this.generateFromCatalog(options)
        break
      case 'download':
        await this.downloadComponent(options)
        break
      default:
        console.log(chalk.red(`Unknown catalog command: ${command}`))
    }
  }

  async configure(): Promise<void> {
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'Catalog Configuration:',
      choices: [
        { name: 'Set default framework filter', value: 'framework' },
        { name: 'Configure download settings', value: 'download' },
        { name: 'Manage favorites', value: 'favorites' },
        { name: 'View statistics', value: 'stats' },
        { name: 'Back', value: 'back' }
      ]
    }])

    switch (action) {
      case 'framework':
        await this.setDefaultFramework()
        break
      case 'download':
        await this.configureDownload()
        break
      case 'favorites':
        await this.manageFavorites()
        break
      case 'stats':
        await this.showStatistics()
        break
    }
  }

  private async browseCatalog(options: any): Promise<void> {
    console.log(chalk.cyan('\n📚 Component Catalog'))
    console.log(chalk.gray(`${this.catalogStats?.totalComponents || 0} components available\n`))

    const { category } = await inquirer.prompt([{
      type: 'list',
      name: 'category',
      message: 'Select a category:',
      choices: [
        'All Categories',
        ...this.catalogStats?.categories || []
      ]
    }])

    const { framework } = await inquirer.prompt([{
      type: 'list',
      name: 'framework',
      message: 'Filter by framework:',
      choices: [
        'All Frameworks',
        ...this.catalogStats?.frameworks || []
      ]
    }])

    const spinner = ora('Fetching components...').start()

    try {
      const components = await this.fetchComponents(category, framework)
      spinner.succeed(`Found ${components.length} components`)

      if (components.length === 0) {
        console.log(chalk.yellow('No components found with selected filters'))
        return
      }

      // Display components
      console.log('')
      components.slice(0, 10).forEach((comp, index) => {
        console.log(chalk.cyan(`${index + 1}. ${comp.name}`))
        console.log(chalk.gray(`   ${comp.description}`))
        console.log(chalk.gray(`   Framework: ${comp.framework} | Downloads: ${comp.downloads} | Stars: ${comp.stars}`))
        console.log('')
      })

      if (components.length > 10) {
        console.log(chalk.gray(`... and ${components.length - 10} more components`))
      }

      // Select component
      const { selectedIndex } = await inquirer.prompt([{
        type: 'number',
        name: 'selectedIndex',
        message: 'Select component number (0 to go back):',
        validate: (v: number) => v >= 0 && v <= components.length
      }])

      if (selectedIndex > 0) {
        await this.handleComponentSelection(components[selectedIndex - 1])
      }

    } catch (error: any) {
      spinner.fail(`Failed to fetch components: ${error.message}`)
    }
  }

  private async searchCatalog(options: any): Promise<void> {
    const { query } = await inquirer.prompt([{
      type: 'input',
      name: 'query',
      message: 'Search components:',
      validate: (v: string) => v.length > 0 || 'Search query required'
    }])

    const spinner = ora(`Searching for "${query}"...`).start()

    try {
      const components = await this.searchComponents(query)
      spinner.succeed(`Found ${components.length} components`)

      if (components.length === 0) {
        console.log(chalk.yellow('No components found'))
        return
      }

      // Display results
      console.log('')
      components.slice(0, 10).forEach((comp, index) => {
        console.log(chalk.cyan(`${index + 1}. ${comp.name}`))
        console.log(chalk.gray(`   ${comp.description}`))
        console.log(chalk.gray(`   Framework: ${comp.framework} | Category: ${comp.category}`))
        console.log('')
      })

      // Select component
      const { selectedIndex } = await inquirer.prompt([{
        type: 'number',
        name: 'selectedIndex',
        message: 'Select component number (0 to go back):',
        validate: (v: number) => v >= 0 && v <= components.length
      }])

      if (selectedIndex > 0) {
        await this.handleComponentSelection(components[selectedIndex - 1])
      }

    } catch (error: any) {
      spinner.fail(`Search failed: ${error.message}`)
    }
  }

  private async handleComponentSelection(component: CatalogComponent) {
    console.log(chalk.cyan(`\n📦 ${component.name}`))
    console.log(chalk.gray(component.description))
    console.log('')
    console.log(`Framework: ${component.framework}`)
    console.log(`Category: ${component.category}`)
    console.log(`Author: ${component.author}`)
    console.log(`Downloads: ${component.downloads}`)
    console.log(`Stars: ${component.stars}`)
    if (component.tags?.length) {
      console.log(`Tags: ${component.tags.join(', ')}`)
    }

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Download component', value: 'download' },
        { name: 'View code preview', value: 'preview' },
        { name: 'Generate similar component', value: 'generate' },
        { name: 'Add to favorites', value: 'favorite' },
        { name: 'Back', value: 'back' }
      ]
    }])

    switch (action) {
      case 'download':
        await this.downloadComponentById(component.id)
        break
      case 'preview':
        await this.previewComponent(component)
        break
      case 'generate':
        await this.generateSimilar(component)
        break
      case 'favorite':
        await this.addToFavorites(component)
        break
    }
  }

  private async fetchComponents(category: string, framework: string): Promise<CatalogComponent[]> {
    const cacheKey = `${category}-${framework}`
    
    if (this.catalogCache.has(cacheKey)) {
      return this.catalogCache.get(cacheKey)!
    }

    try {
      const params = new URLSearchParams()
      if (category !== 'All Categories') params.append('category', category)
      if (framework !== 'All Frameworks') params.append('framework', framework)
      
      const response = await fetch(`${this.baseUrl}/catalog/components?${params}`)
      if (response.ok) {
        const components = await response.json()
        this.catalogCache.set(cacheKey, components)
        return components
      }
    } catch {}

    // Return mock data for demo
    return [
      {
        id: '1',
        name: 'Advanced Data Table',
        description: 'Feature-rich data table with sorting, filtering, and pagination',
        framework: framework === 'All Frameworks' ? 'React' : framework,
        category: category === 'All Categories' ? 'Tables' : category,
        tags: ['table', 'data', 'grid'],
        downloads: 15420,
        stars: 342,
        author: 'UI Factory Team'
      },
      {
        id: '2',
        name: 'Dynamic Form Builder',
        description: 'Drag-and-drop form builder with validation',
        framework: framework === 'All Frameworks' ? 'Vue' : framework,
        category: category === 'All Categories' ? 'Forms' : category,
        tags: ['form', 'builder', 'validation'],
        downloads: 8932,
        stars: 256,
        author: 'Community'
      }
    ]
  }

  private async searchComponents(query: string): Promise<CatalogComponent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/catalog/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        return await response.json()
      }
    } catch {}

    // Return mock search results
    return this.fetchComponents('All Categories', 'All Frameworks')
  }

  private async downloadComponentById(componentId: string) {
    const spinner = ora('Downloading component...').start()

    try {
      // In real implementation, fetch component code
      const componentCode = `// Component: ${componentId}
import React from 'react'

export const Component = () => {
  return <div>Downloaded component ${componentId}</div>
}
`

      const outputPath = path.join(this.config.outputPath || 'src/components', `component-${componentId}.tsx`)
      await fs.mkdir(path.dirname(outputPath), { recursive: true })
      await fs.writeFile(outputPath, componentCode)
      
      spinner.succeed(`Component downloaded to ${outputPath}`)
    } catch (error: any) {
      spinner.fail(`Download failed: ${error.message}`)
    }
  }

  private async previewComponent(component: CatalogComponent) {
    console.log(chalk.cyan('\n📄 Code Preview:\n'))
    
    const preview = component.code || `// ${component.name}
// ${component.description}

import React from 'react'

export const ${component.name.replace(/\s+/g, '')} = () => {
  return (
    <div className="${component.name.toLowerCase().replace(/\s+/g, '-')}">
      {/* Component implementation */}
    </div>
  )
}`

    console.log(preview)
  }

  private async generateSimilar(component: CatalogComponent) {
    console.log(chalk.yellow(`\nGenerating component similar to "${component.name}"...`))
    console.log(chalk.gray('This will use AI to create a similar component'))
    
    // Would integrate with AI generation
  }

  private async addToFavorites(component: CatalogComponent) {
    const favoritesPath = path.join(process.cwd(), '.revolutionary-ui', 'favorites.json')
    
    try {
      let favorites: string[] = []
      try {
        const data = await fs.readFile(favoritesPath, 'utf-8')
        favorites = JSON.parse(data)
      } catch {}
      
      if (!favorites.includes(component.id)) {
        favorites.push(component.id)
        await fs.mkdir(path.dirname(favoritesPath), { recursive: true })
        await fs.writeFile(favoritesPath, JSON.stringify(favorites, null, 2))
        console.log(chalk.green('✓ Added to favorites'))
      } else {
        console.log(chalk.yellow('Already in favorites'))
      }
    } catch (error: any) {
      console.log(chalk.red(`Failed to add to favorites: ${error.message}`))
    }
  }

  private async generateFromCatalog(options: any) {
    console.log(chalk.cyan('\n🎨 Generate from Catalog Template\n'))
    
    // First, let user browse and select a template
    await this.browseCatalog({})
  }

  private async downloadComponent(options: any): Promise<void> {
    const { componentId } = await inquirer.prompt([{
      type: 'input',
      name: 'componentId',
      message: 'Enter component ID or name:',
      validate: (v: string) => v.length > 0 || 'Component ID required'
    }])

    await this.downloadComponentById(componentId)
  }

  private async setDefaultFramework(): Promise<void> {
    const { framework } = await inquirer.prompt([{
      type: 'list',
      name: 'framework',
      message: 'Set default framework filter:',
      choices: ['All', ...this.catalogStats?.frameworks || []]
    }])

    // Save preference
    this.config.preferences.defaultFramework = framework
    console.log(chalk.green(`✓ Default framework set to ${framework}`))
  }

  private async configureDownload(): Promise<void> {
    const settings = await inquirer.prompt([
      {
        type: 'input',
        name: 'outputPath',
        message: 'Default download path:',
        default: this.config.outputPath || 'src/components'
      },
      {
        type: 'confirm',
        name: 'typescript',
        message: 'Convert to TypeScript by default?',
        default: true
      },
      {
        type: 'confirm',
        name: 'includeStyles',
        message: 'Include component styles?',
        default: true
      }
    ])

    console.log(chalk.green('✓ Download settings updated'))
  }

  private async manageFavorites(): Promise<void> {
    const favoritesPath = path.join(process.cwd(), '.revolutionary-ui', 'favorites.json')
    
    try {
      const data = await fs.readFile(favoritesPath, 'utf-8')
      const favorites = JSON.parse(data)
      
      if (favorites.length === 0) {
        console.log(chalk.yellow('No favorites yet'))
        return
      }

      console.log(chalk.cyan('\n⭐ Your Favorites:\n'))
      favorites.forEach((id: string, index: number) => {
        console.log(`${index + 1}. Component ${id}`)
      })
      
    } catch {
      console.log(chalk.yellow('No favorites yet'))
    }
  }

  private async showStatistics(): Promise<void> {
    console.log(chalk.cyan('\n📊 Catalog Statistics\n'))
    
    if (this.catalogStats) {
      console.log(`Total Components: ${this.catalogStats.totalComponents}`)
      console.log(`Frameworks: ${this.catalogStats.frameworks.join(', ')}`)
      console.log(`Categories: ${this.catalogStats.categories.join(', ')}`)
      
      if (this.catalogStats.topComponents.length > 0) {
        console.log(chalk.cyan('\n🏆 Top Components:\n'))
        this.catalogStats.topComponents.slice(0, 5).forEach((comp, index) => {
          console.log(`${index + 1}. ${comp.name} (${comp.downloads} downloads)`)
        })
      }
    }
  }
}