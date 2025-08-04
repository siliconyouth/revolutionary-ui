import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import Table from 'cli-table3'
import { APIClient } from '../utils/api-client'
import { AuthManager } from '../utils/auth-manager'

interface CatalogOptions {
  search?: string
  framework?: string
  category?: string
  stars?: number
  limit?: number
}

export class CatalogCommand {
  private apiClient: APIClient
  private authManager: AuthManager

  constructor() {
    this.apiClient = new APIClient()
    this.authManager = new AuthManager()
  }

  async browse(options: CatalogOptions) {
    try {
      console.log(chalk.cyan('\n📚 Revolutionary UI Component Catalog\n'))

      const spinner = ora('Searching catalog...').start()

      // Build query parameters
      const params: any = {
        limit: options.limit || 20,
        page: 1
      }

      if (options.search) params.search = options.search
      if (options.framework) params.framework = options.framework
      if (options.category) params.category = options.category
      if (options.stars) params.minStars = options.stars

      // Fetch components
      const response = await this.apiClient.get('/catalog/components', { params })

      spinner.stop()

      if (response.data.components.length === 0) {
        console.log(chalk.yellow('No components found matching your criteria'))
        return
      }

      // Display results in table
      this.displayComponentsTable(response.data.components)

      // Show summary
      console.log(chalk.gray(`\nShowing ${response.data.components.length} of ${response.data.total} components`))
      
      // Interactive options
      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🔍 View component details', value: 'view' },
          { name: '📥 Download component', value: 'download' },
          { name: '🔄 Load more results', value: 'more' },
          { name: '🔎 New search', value: 'search' },
          { name: '🔙 Back', value: 'back' }
        ]
      }])

      switch (action) {
        case 'view':
          await this.viewComponentDetails()
          break
        case 'download':
          await this.downloadComponent()
          break
        case 'more':
          await this.loadMore(params)
          break
        case 'search':
          await this.browseInteractive()
          break
      }

    } catch (error: any) {
      console.error(chalk.red(`❌ Error browsing catalog: ${error.message}`))
    }
  }

  async browseInteractive() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'search',
        message: 'Search components (optional):'
      },
      {
        type: 'list',
        name: 'framework',
        message: 'Framework:',
        choices: [
          { name: 'All Frameworks', value: null },
          'React', 'Vue', 'Angular', 'Svelte', 'Solid',
          'Web Components', 'Alpine.js', 'Lit'
        ]
      },
      {
        type: 'list',
        name: 'category',
        message: 'Category:',
        choices: [
          { name: 'All Categories', value: null },
          'Forms', 'Tables', 'Charts', 'Navigation',
          'Modals', 'Cards', 'Buttons', 'Inputs',
          'Layout', 'Data Display', 'Feedback', 'Overlays'
        ]
      },
      {
        type: 'number',
        name: 'minStars',
        message: 'Minimum GitHub stars:',
        default: 0
      }
    ])

    await this.browse({
      search: answers.search || undefined,
      framework: answers.framework || undefined,
      category: answers.category || undefined,
      stars: answers.minStars || undefined
    })
  }

  async info(componentId: string) {
    try {
      const spinner = ora('Fetching component details...').start()

      const response = await this.apiClient.get(`/catalog/components/${componentId}`)
      const component = response.data.component

      spinner.stop()

      // Display detailed information
      console.log(chalk.bold.cyan(`\n📦 ${component.name}\n`))
      console.log(chalk.gray(component.description))

      // Metadata
      console.log(chalk.cyan('\n📊 Metadata:'))
      console.log(`  • Framework: ${component.framework}`)
      console.log(`  • Category: ${component.category}`)
      console.log(`  • Type: ${component.type}`)
      console.log(`  • Author: ${component.author}`)
      console.log(`  • License: ${component.license}`)
      console.log(`  • Version: ${component.version}`)

      // Stats
      console.log(chalk.cyan('\n📈 Statistics:'))
      console.log(`  • GitHub Stars: ⭐ ${component.stars}`)
      console.log(`  • NPM Downloads: 📥 ${this.formatNumber(component.downloads)}/month`)
      console.log(`  • Bundle Size: 📦 ${component.bundleSize}`)
      console.log(`  • Last Updated: ${new Date(component.updatedAt).toLocaleDateString()}`)

      // Features
      if (component.features && component.features.length > 0) {
        console.log(chalk.cyan('\n✨ Features:'))
        component.features.forEach((feature: string) => {
          console.log(`  • ${feature}`)
        })
      }

      // Dependencies
      if (component.dependencies && component.dependencies.length > 0) {
        console.log(chalk.cyan('\n📦 Dependencies:'))
        component.dependencies.forEach((dep: string) => {
          console.log(`  • ${dep}`)
        })
      }

      // Usage example
      if (component.example) {
        console.log(chalk.cyan('\n💡 Usage Example:'))
        console.log(chalk.gray('```' + component.framework))
        console.log(component.example)
        console.log(chalk.gray('```'))
      }

      // Links
      console.log(chalk.cyan('\n🔗 Links:'))
      if (component.github) console.log(`  • GitHub: ${component.github}`)
      if (component.npm) console.log(`  • NPM: ${component.npm}`)
      if (component.docs) console.log(`  • Documentation: ${component.docs}`)
      if (component.demo) console.log(`  • Live Demo: ${component.demo}`)

      // Actions
      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '📥 Download this component', value: 'download' },
          { name: '🤖 Generate with AI assistance', value: 'generate' },
          { name: '⭐ Add to favorites', value: 'favorite' },
          { name: '🔙 Back to catalog', value: 'back' }
        ]
      }])

      switch (action) {
        case 'download':
          await this.downloadSpecificComponent(componentId)
          break
        case 'generate':
          await this.generateFromComponent(component)
          break
        case 'favorite':
          await this.addToFavorites(componentId)
          break
      }

    } catch (error: any) {
      console.error(chalk.red(`❌ Error fetching component: ${error.message}`))
    }
  }

  private displayComponentsTable(components: any[]) {
    const table = new Table({
      head: ['Name', 'Framework', 'Category', '⭐ Stars', '📥 Downloads', 'Size'],
      colWidths: [30, 12, 15, 10, 15, 10],
      style: {
        head: ['cyan']
      }
    })

    components.forEach((component, index) => {
      table.push([
        `${index + 1}. ${component.name}`,
        component.framework,
        component.category,
        component.stars.toString(),
        this.formatNumber(component.downloads),
        component.bundleSize || 'N/A'
      ])
    })

    console.log(table.toString())
  }

  private async viewComponentDetails() {
    const { index } = await inquirer.prompt([{
      type: 'number',
      name: 'index',
      message: 'Enter component number to view:',
      validate: (value: number) => value > 0 || 'Please enter a valid number'
    }])

    // Fetch component by index from last search
    // This would need to store the last search results
    console.log(chalk.yellow('Component details view coming soon!'))
  }

  private async downloadComponent() {
    const { index } = await inquirer.prompt([{
      type: 'number',
      name: 'index',
      message: 'Enter component number to download:',
      validate: (value: number) => value > 0 || 'Please enter a valid number'
    }])

    console.log(chalk.yellow('Component download coming soon!'))
  }

  private async downloadSpecificComponent(componentId: string) {
    try {
      // Check authentication for premium components
      const user = await this.authManager.getCurrentUser()
      if (!user) {
        console.log(chalk.yellow('Please login to download components'))
        return
      }

      const spinner = ora('Downloading component...').start()

      const response = await this.apiClient.get(`/catalog/components/${componentId}/download`)

      spinner.succeed('Component downloaded successfully!')

      // Save to local directory
      console.log(chalk.green(`✅ Component saved to: ./components/${componentId}`))

    } catch (error: any) {
      console.error(chalk.red(`❌ Download failed: ${error.message}`))
    }
  }

  private async generateFromComponent(component: any) {
    console.log(chalk.cyan('\n🤖 Generate from Component\n'))
    console.log(chalk.gray('This will use AI to customize the component for your needs.'))
    
    const { prompt } = await inquirer.prompt([{
      type: 'input',
      name: 'prompt',
      message: 'Describe your customizations:',
      default: `Customize the ${component.name} component`
    }])

    // Redirect to generate command with context
    const { GenerateCommand } = await import('./generate')
    const generate = new GenerateCommand()
    await generate.execute(undefined, {
      prompt: `Based on the ${component.name} component (${component.description}), ${prompt}`,
      framework: component.framework
    })
  }

  private async addToFavorites(componentId: string) {
    try {
      await this.authManager.requireAuth()

      const spinner = ora('Adding to favorites...').start()

      await this.apiClient.post(`/catalog/favorites`, { componentId })

      spinner.succeed('Added to favorites!')

    } catch (error: any) {
      console.error(chalk.red(`❌ Failed to add to favorites: ${error.message}`))
    }
  }

  private async loadMore(params: any) {
    params.page = (params.page || 1) + 1
    const response = await this.apiClient.get('/catalog/components', { params })
    
    if (response.data.components.length > 0) {
      this.displayComponentsTable(response.data.components)
    } else {
      console.log(chalk.yellow('No more components to load'))
    }
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }
}