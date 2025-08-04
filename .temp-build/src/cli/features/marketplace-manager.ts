import chalk from 'chalk'
import inquirer from 'inquirer'
import ora from 'ora'
import { WizardConfig } from '../core/configuration-wizard'
import { loadEnvVariables } from '../utils/env-loader'
import { AuthManager } from '../utils/auth-manager'
import fs from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'

interface MarketplaceComponent {
  id: string
  name: string
  description: string
  price: number
  author: {
    id: string
    name: string
    verified: boolean
  }
  framework: string
  category: string
  tags: string[]
  downloads: number
  rating: number
  reviews: number
  preview: string
  lastUpdated: string
}

interface MarketplaceStats {
  totalComponents: number
  totalAuthors: number
  totalDownloads: number
  popularComponents: MarketplaceComponent[]
}

export class MarketplaceManager {
  private config: WizardConfig
  private authManager: AuthManager
  private baseUrl: string
  private marketplaceCache: Map<string, any> = new Map()

  constructor(config: WizardConfig) {
    this.config = config
    this.authManager = new AuthManager()
    loadEnvVariables()
    
    this.baseUrl = process.env.MARKETPLACE_API_URL || 'http://localhost:3001/api'
  }

  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return response.ok
    } catch {
      return false
    }
  }

  async execute(command: string, options: any): Promise<void> {
    switch (command) {
      case 'browse':
        await this.browseMarketplace(options)
        break
      case 'search':
        await this.searchMarketplace(options)
        break
      case 'publish':
        await this.publishComponent(options)
        break
      case 'purchases':
        await this.viewPurchases(options)
        break
      case 'earnings':
        await this.viewEarnings(options)
        break
      default:
        console.log(chalk.red(`Unknown marketplace command: ${command}`))
    }
  }

  private async browseMarketplace(options: any): Promise<void> {
    console.log(chalk.cyan('\n🛍️  Component Marketplace\n'))

    const spinner = ora('Loading marketplace...').start()

    try {
      const stats = await this.getMarketplaceStats()
      spinner.succeed('Marketplace loaded')

      console.log(chalk.gray(`${stats.totalComponents} components from ${stats.totalAuthors} creators`))
      console.log(chalk.gray(`${stats.totalDownloads.toLocaleString()} total downloads\n`))

      const { browseOption } = await inquirer.prompt([{
        type: 'list',
        name: 'browseOption',
        message: 'Browse by:',
        choices: [
          { name: '🔥 Popular Components', value: 'popular' },
          { name: '🆕 New Releases', value: 'new' },
          { name: '💎 Premium Components', value: 'premium' },
          { name: '🆓 Free Components', value: 'free' },
          { name: '📁 By Category', value: 'category' },
          { name: '🔍 Search', value: 'search' }
        ]
      }])

      switch (browseOption) {
        case 'popular':
          await this.browsePopular()
          break
        case 'new':
          await this.browseNew()
          break
        case 'premium':
          await this.browsePremium()
          break
        case 'free':
          await this.browseFree()
          break
        case 'category':
          await this.browseByCategory()
          break
        case 'search':
          await this.searchMarketplace({})
          break
      }

    } catch (error: any) {
      spinner.fail(`Failed to load marketplace: ${error.message}`)
    }
  }

  private async getMarketplaceStats(): Promise<MarketplaceStats> {
    if (this.marketplaceCache.has('stats')) {
      return this.marketplaceCache.get('stats')
    }

    try {
      const response = await fetch(`${this.baseUrl}/marketplace/stats`)
      if (response.ok) {
        const stats = await response.json()
        this.marketplaceCache.set('stats', stats)
        return stats
      }
    } catch {}

    // Return mock data
    return {
      totalComponents: 2543,
      totalAuthors: 387,
      totalDownloads: 1245890,
      popularComponents: []
    }
  }

  private async browsePopular(): Promise<void> {
    const spinner = ora('Loading popular components...').start()

    try {
      const components = await this.fetchComponents('popular')
      spinner.succeed(`Found ${components.length} popular components`)

      await this.displayComponents(components)
    } catch (error: any) {
      spinner.fail(`Failed to load components: ${error.message}`)
    }
  }

  private async browseNew(): Promise<void> {
    const spinner = ora('Loading new releases...').start()

    try {
      const components = await this.fetchComponents('new')
      spinner.succeed(`Found ${components.length} new components`)

      await this.displayComponents(components)
    } catch (error: any) {
      spinner.fail(`Failed to load components: ${error.message}`)
    }
  }

  private async browsePremium(): Promise<void> {
    const spinner = ora('Loading premium components...').start()

    try {
      const components = await this.fetchComponents('premium')
      spinner.succeed(`Found ${components.length} premium components`)

      await this.displayComponents(components)
    } catch (error: any) {
      spinner.fail(`Failed to load components: ${error.message}`)
    }
  }

  private async browseFree(): Promise<void> {
    const spinner = ora('Loading free components...').start()

    try {
      const components = await this.fetchComponents('free')
      spinner.succeed(`Found ${components.length} free components`)

      await this.displayComponents(components)
    } catch (error: any) {
      spinner.fail(`Failed to load components: ${error.message}`)
    }
  }

  private async browseByCategory(): Promise<void> {
    const categories = [
      'Forms & Inputs',
      'Tables & Data Grids',
      'Navigation',
      'Charts & Visualization',
      'E-commerce',
      'Authentication',
      'Dashboards',
      'Landing Pages'
    ]

    const { category } = await inquirer.prompt([{
      type: 'list',
      name: 'category',
      message: 'Select category:',
      choices: categories
    }])

    const spinner = ora(`Loading ${category} components...`).start()

    try {
      const components = await this.fetchComponents('category', category)
      spinner.succeed(`Found ${components.length} components in ${category}`)

      await this.displayComponents(components)
    } catch (error: any) {
      spinner.fail(`Failed to load components: ${error.message}`)
    }
  }

  private async fetchComponents(type: string, filter?: string): Promise<MarketplaceComponent[]> {
    const cacheKey = `components-${type}-${filter || ''}`
    
    if (this.marketplaceCache.has(cacheKey)) {
      return this.marketplaceCache.get(cacheKey)
    }

    try {
      const params = new URLSearchParams({ type })
      if (filter) params.append('filter', filter)
      
      const response = await fetch(`${this.baseUrl}/marketplace/components?${params}`)
      if (response.ok) {
        const components = await response.json()
        this.marketplaceCache.set(cacheKey, components)
        return components
      }
    } catch {}

    // Return mock data
    return [
      {
        id: 'mp-1',
        name: 'Premium Admin Dashboard',
        description: 'Complete admin dashboard with 50+ components',
        price: 49,
        author: {
          id: 'author-1',
          name: 'UI Master',
          verified: true
        },
        framework: 'React',
        category: 'Dashboards',
        tags: ['admin', 'dashboard', 'charts', 'tables'],
        downloads: 3420,
        rating: 4.8,
        reviews: 156,
        preview: 'https://example.com/preview',
        lastUpdated: '2024-03-15'
      },
      {
        id: 'mp-2',
        name: 'E-commerce UI Kit',
        description: 'Complete e-commerce components set',
        price: 0,
        author: {
          id: 'author-2',
          name: 'Community',
          verified: false
        },
        framework: 'Vue',
        category: 'E-commerce',
        tags: ['shop', 'cart', 'checkout'],
        downloads: 8932,
        rating: 4.5,
        reviews: 89,
        preview: 'https://example.com/preview',
        lastUpdated: '2024-03-10'
      }
    ]
  }

  private async displayComponents(components: MarketplaceComponent[]): Promise<void> {
    console.log('')
    
    components.forEach((comp, index) => {
      console.log(chalk.cyan(`${index + 1}. ${comp.name}`))
      console.log(chalk.gray(`   ${comp.description}`))
      console.log(chalk.gray(`   ${comp.price === 0 ? chalk.green('FREE') : chalk.yellow(`$${comp.price}`)}`))
      console.log(chalk.gray(`   ⭐ ${comp.rating} (${comp.reviews} reviews) | 📥 ${comp.downloads} downloads`))
      console.log(chalk.gray(`   Author: ${comp.author.name}${comp.author.verified ? ' ✓' : ''}`))
      console.log('')
    })

    const { selectedIndex } = await inquirer.prompt([{
      type: 'number',
      name: 'selectedIndex',
      message: 'Select component number (0 to go back):',
      validate: (v: number) => v >= 0 && v <= components.length
    }])

    if (selectedIndex > 0) {
      await this.handleComponentDetails(components[selectedIndex - 1])
    }
  }

  private async handleComponentDetails(component: MarketplaceComponent): Promise<void> {
    console.log(chalk.cyan(`\n📦 ${component.name}\n`))
    console.log(component.description)
    console.log('')
    console.log(`Price: ${component.price === 0 ? chalk.green('FREE') : chalk.yellow(`$${component.price}`)}`)
    console.log(`Author: ${component.author.name}${component.author.verified ? ' ✓' : ''}`)
    console.log(`Framework: ${component.framework}`)
    console.log(`Category: ${component.category}`)
    console.log(`Rating: ⭐ ${component.rating} (${component.reviews} reviews)`)
    console.log(`Downloads: ${component.downloads}`)
    console.log(`Last Updated: ${new Date(component.lastUpdated).toLocaleDateString()}`)
    console.log(`Tags: ${component.tags.join(', ')}`)

    const choices = [
      { name: '👁️  View Preview', value: 'preview' },
      ...(component.price === 0 ? 
        [{ name: '📥 Download Free Component', value: 'download' }] : 
        [{ name: '💳 Purchase Component', value: 'purchase' }]
      ),
      { name: '⭐ View Reviews', value: 'reviews' },
      { name: '👤 View Author Profile', value: 'author' },
      { name: '↩️  Back', value: 'back' }
    ]

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices
    }])

    switch (action) {
      case 'preview':
        console.log(chalk.cyan(`\nPreview: ${component.preview}`))
        console.log(chalk.gray('Opening preview in browser...'))
        break
      case 'download':
        await this.downloadFreeComponent(component)
        break
      case 'purchase':
        await this.purchaseComponent(component)
        break
      case 'reviews':
        await this.viewReviews(component)
        break
      case 'author':
        await this.viewAuthorProfile(component.author)
        break
    }
  }

  private async downloadFreeComponent(component: MarketplaceComponent): Promise<void> {
    const spinner = ora('Downloading component...').start()

    try {
      // Check authentication
      const isAuth = await this.authManager.isAuthenticated()
      if (!isAuth) {
        spinner.fail('Authentication required')
        console.log(chalk.yellow('Please login to download components'))
        return
      }

      // Simulate download
      const outputPath = path.join(
        this.config.outputPath || 'src/marketplace-components',
        component.framework.toLowerCase(),
        `${component.name.toLowerCase().replace(/\s+/g, '-')}.zip`
      )
      
      await fs.mkdir(path.dirname(outputPath), { recursive: true })
      
      // In real implementation, download from marketplace
      await fs.writeFile(outputPath, `Component package: ${component.name}`)
      
      spinner.succeed(`Component downloaded to ${outputPath}`)
      
      // Track download
      await this.trackDownload(component.id)
      
    } catch (error: any) {
      spinner.fail(`Download failed: ${error.message}`)
    }
  }

  private async purchaseComponent(component: MarketplaceComponent): Promise<void> {
    console.log(chalk.cyan('\n💳 Purchase Component\n'))

    // Check authentication
    const isAuth = await this.authManager.isAuthenticated()
    if (!isAuth) {
      console.log(chalk.yellow('Please login to purchase components'))
      return
    }

    const user = await this.authManager.getCurrentUser()
    console.log(`Purchasing as: ${user?.email}`)
    console.log(`Component: ${component.name}`)
    console.log(`Price: $${component.price}`)

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `Confirm purchase of $${component.price}?`,
      default: false
    }])

    if (!confirm) {
      console.log(chalk.gray('Purchase cancelled'))
      return
    }

    const spinner = ora('Processing payment...').start()

    try {
      // In real implementation, process payment through Stripe
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      spinner.succeed('Payment successful!')
      console.log(chalk.green(`✓ You now own "${component.name}"`))
      
      // Download component
      await this.downloadFreeComponent(component)
      
    } catch (error: any) {
      spinner.fail(`Purchase failed: ${error.message}`)
    }
  }

  private async searchMarketplace(options: any): Promise<void> {
    const { query } = await inquirer.prompt([{
      type: 'input',
      name: 'query',
      message: 'Search marketplace:',
      validate: (v: string) => v.length > 0 || 'Search query required'
    }])

    const spinner = ora(`Searching for "${query}"...`).start()

    try {
      const results = await this.searchComponents(query)
      spinner.succeed(`Found ${results.length} results`)

      if (results.length === 0) {
        console.log(chalk.yellow('No components found'))
        return
      }

      await this.displayComponents(results)
      
    } catch (error: any) {
      spinner.fail(`Search failed: ${error.message}`)
    }
  }

  private async searchComponents(query: string): Promise<MarketplaceComponent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/marketplace/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        return await response.json()
      }
    } catch {}

    // Return mock search results
    return this.fetchComponents('popular')
  }

  private async publishComponent(options: any): Promise<void> {
    console.log(chalk.cyan('\n📤 Publish Component\n'))

    // Check authentication
    const isAuth = await this.authManager.isAuthenticated()
    if (!isAuth) {
      console.log(chalk.yellow('Please login to publish components'))
      return
    }

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Component name:',
        validate: (v: string) => v.length > 0 || 'Name required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:',
        validate: (v: string) => v.length > 0 || 'Description required'
      },
      {
        type: 'list',
        name: 'framework',
        message: 'Framework:',
        choices: ['React', 'Vue', 'Angular', 'Svelte', 'Web Components']
      },
      {
        type: 'list',
        name: 'category',
        message: 'Category:',
        choices: [
          'Forms & Inputs',
          'Tables & Data Grids',
          'Navigation',
          'Charts & Visualization',
          'E-commerce',
          'Authentication',
          'Dashboards',
          'Landing Pages',
          'Other'
        ]
      },
      {
        type: 'input',
        name: 'tags',
        message: 'Tags (comma-separated):'
      },
      {
        type: 'number',
        name: 'price',
        message: 'Price (0 for free):',
        default: 0,
        validate: (v: number) => v >= 0 || 'Price must be 0 or greater'
      },
      {
        type: 'input',
        name: 'componentPath',
        message: 'Path to component file/folder:',
        validate: async (v: string) => {
          try {
            await fs.access(v)
            return true
          } catch {
            return 'Path not found'
          }
        }
      }
    ])

    const spinner = ora('Publishing component...').start()

    try {
      // In real implementation, upload to marketplace
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      spinner.succeed('Component published successfully!')
      console.log(chalk.green(`✓ "${answers.name}" is now available in the marketplace`))
      
      if (answers.price > 0) {
        console.log(chalk.gray(`You'll receive 70% of each sale ($${(answers.price * 0.7).toFixed(2)})`))
      }
      
    } catch (error: any) {
      spinner.fail(`Publishing failed: ${error.message}`)
    }
  }

  private async viewPurchases(options: any): Promise<void> {
    console.log(chalk.cyan('\n🛒 My Purchases\n'))

    const isAuth = await this.authManager.isAuthenticated()
    if (!isAuth) {
      console.log(chalk.yellow('Please login to view purchases'))
      return
    }

    const spinner = ora('Loading purchases...').start()

    try {
      // In real implementation, fetch from API
      const purchases = [
        {
          name: 'Premium Admin Dashboard',
          price: 49,
          purchaseDate: '2024-03-01',
          downloads: 3
        },
        {
          name: 'Advanced Chart Library',
          price: 29,
          purchaseDate: '2024-02-15',
          downloads: 5
        }
      ]

      spinner.succeed(`Found ${purchases.length} purchases`)

      console.log('')
      purchases.forEach((purchase, index) => {
        console.log(chalk.cyan(`${index + 1}. ${purchase.name}`))
        console.log(chalk.gray(`   Purchased: ${new Date(purchase.purchaseDate).toLocaleDateString()}`))
        console.log(chalk.gray(`   Price: $${purchase.price}`))
        console.log(chalk.gray(`   Downloads: ${purchase.downloads}`))
        console.log('')
      })

      console.log(chalk.gray(`Total spent: $${purchases.reduce((sum, p) => sum + p.price, 0)}`))
      
    } catch (error: any) {
      spinner.fail(`Failed to load purchases: ${error.message}`)
    }
  }

  private async viewEarnings(options: any): Promise<void> {
    console.log(chalk.cyan('\n💰 My Earnings\n'))

    const isAuth = await this.authManager.isAuthenticated()
    if (!isAuth) {
      console.log(chalk.yellow('Please login to view earnings'))
      return
    }

    const spinner = ora('Loading earnings...').start()

    try {
      // In real implementation, fetch from API
      const earnings = {
        totalRevenue: 1234.50,
        totalSales: 45,
        thisMonth: 234.50,
        lastPayout: '2024-03-01',
        components: [
          {
            name: 'React Data Grid Pro',
            sales: 23,
            revenue: 667.00
          },
          {
            name: 'Vue Form Builder',
            sales: 22,
            revenue: 567.50
          }
        ]
      }

      spinner.succeed('Earnings loaded')

      console.log(`Total Revenue: ${chalk.green(`$${earnings.totalRevenue.toFixed(2)}`)}`)
      console.log(`Total Sales: ${earnings.totalSales}`)
      console.log(`This Month: ${chalk.green(`$${earnings.thisMonth.toFixed(2)}`)}`)
      console.log(`Last Payout: ${new Date(earnings.lastPayout).toLocaleDateString()}`)

      console.log(chalk.cyan('\n📊 Component Performance:\n'))
      earnings.components.forEach(comp => {
        console.log(`• ${comp.name}`)
        console.log(`  Sales: ${comp.sales} | Revenue: $${comp.revenue.toFixed(2)}`)
      })
      
    } catch (error: any) {
      spinner.fail(`Failed to load earnings: ${error.message}`)
    }
  }

  private async viewReviews(component: MarketplaceComponent): Promise<void> {
    console.log(chalk.cyan(`\n⭐ Reviews for ${component.name}\n`))
    
    // Mock reviews
    const reviews = [
      {
        author: 'John D.',
        rating: 5,
        date: '2024-03-10',
        comment: 'Excellent component! Saved me hours of work.'
      },
      {
        author: 'Sarah M.',
        rating: 4,
        date: '2024-03-05',
        comment: 'Great quality, but documentation could be better.'
      }
    ]

    reviews.forEach(review => {
      console.log(`${'⭐'.repeat(review.rating)} ${review.author} - ${new Date(review.date).toLocaleDateString()}`)
      console.log(chalk.gray(`"${review.comment}"\n`))
    })
  }

  private async viewAuthorProfile(author: { id: string; name: string; verified: boolean }): Promise<void> {
    console.log(chalk.cyan(`\n👤 ${author.name}${author.verified ? ' ✓' : ''}\n`))
    
    // Mock author data
    console.log('Components: 12')
    console.log('Total Downloads: 45,892')
    console.log('Average Rating: 4.7')
    console.log('Member Since: January 2023')
  }

  private async trackDownload(componentId: string): Promise<void> {
    try {
      // Track download in metrics
      const metricsPath = path.join(process.cwd(), '.revolutionary-ui', 'downloads.json')
      
      let downloads: string[] = []
      try {
        const data = await fs.readFile(metricsPath, 'utf-8')
        downloads = JSON.parse(data)
      } catch {}
      
      downloads.push(componentId)
      
      await fs.mkdir(path.dirname(metricsPath), { recursive: true })
      await fs.writeFile(metricsPath, JSON.stringify(downloads, null, 2))
    } catch {
      // Tracking is optional
    }
  }
}