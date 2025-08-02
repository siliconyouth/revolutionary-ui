/**
 * Marketplace Client for Revolutionary UI Factory
 * Handles marketplace component browsing, search, and installation
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { AuthManager } from './auth-manager'
import { ComponentGenerator } from './component-generator'
import chalk from 'chalk'

export interface MarketplaceComponent {
  id: string
  name: string
  description: string
  category: ComponentCategory
  framework: string[]
  styling: string[]
  author: string
  downloads: number
  rating: number
  price: number
  screenshots: string[]
  features: string[]
  dependencies: string[]
  version: string
  updatedAt: string
  tags: string[]
}

export type ComponentCategory = 
  | 'forms' | 'tables' | 'navigation' | 'layout' | 'data-display'
  | 'feedback' | 'overlay' | 'inputs' | 'media' | 'charts'
  | 'calendars' | 'maps' | 'editors' | 'ecommerce' | 'dashboards'

export interface SearchOptions {
  query?: string
  category?: ComponentCategory
  framework?: string
  styling?: string
  priceRange?: { min: number; max: number }
  sortBy?: 'downloads' | 'rating' | 'updated' | 'price'
  page?: number
  limit?: number
}

export interface InstallOptions {
  outputDir?: string
  framework?: string
  styling?: string
  typescript?: boolean
  includeDemo?: boolean
}

export class MarketplaceClient {
  private cache: Map<string, any> = new Map()
  
  /**
   * Search marketplace components
   */
  async search(options: SearchOptions = {}): Promise<MarketplaceComponent[]> {
    // Check cache
    const cacheKey = JSON.stringify(options)
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }
    
    // Make API request
    const response = await AuthManager.apiRequest('/marketplace/search', {
      method: 'POST',
      body: JSON.stringify(options)
    })
    
    if (!response) {
      throw new Error('Failed to search marketplace')
    }
    
    const data = await response.json()
    
    // Cache results
    this.cache.set(cacheKey, data.components)
    
    return data.components
  }
  
  /**
   * Get component details
   */
  async getComponent(componentId: string): Promise<MarketplaceComponent> {
    const response = await AuthManager.apiRequest(`/marketplace/components/${componentId}`)
    
    if (!response) {
      throw new Error('Failed to get component details')
    }
    
    return await response.json()
  }
  
  /**
   * Install a marketplace component
   */
  async install(componentId: string, options: InstallOptions = {}): Promise<void> {
    // Get component details
    const component = await this.getComponent(componentId)
    
    // Get component code
    const response = await AuthManager.apiRequest(`/marketplace/components/${componentId}/download`, {
      method: 'POST',
      body: JSON.stringify({
        framework: options.framework,
        styling: options.styling,
        typescript: options.typescript
      })
    })
    
    if (!response) {
      throw new Error('Failed to download component')
    }
    
    const { files } = await response.json()
    
    // Save files
    const outputDir = options.outputDir || './src/components'
    
    for (const file of files) {
      const filePath = path.join(outputDir, file.path)
      const dir = path.dirname(filePath)
      
      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true })
      
      // Write file
      await fs.writeFile(filePath, file.content, 'utf-8')
      
      console.log(chalk.green(`✅ Created ${file.path}`))
    }
    
    // Install dependencies if needed
    if (component.dependencies && component.dependencies.length > 0) {
      console.log(chalk.cyan('\n📦 Installing dependencies...'))
      const { execSync } = require('child_process')
      
      try {
        execSync(`npm install ${component.dependencies.join(' ')}`, { 
          stdio: 'inherit',
          cwd: process.cwd()
        })
      } catch (error) {
        console.log(chalk.yellow('⚠️  Failed to install dependencies automatically'))
        console.log(chalk.gray('Please run: npm install ' + component.dependencies.join(' ')))
      }
    }
    
    // Track installation
    await AuthManager.apiRequest(`/marketplace/components/${componentId}/install`, {
      method: 'POST'
    })
  }
  
  /**
   * Get popular components
   */
  async getPopular(limit = 10): Promise<MarketplaceComponent[]> {
    return this.search({
      sortBy: 'downloads',
      limit
    })
  }
  
  /**
   * Get recently updated components
   */
  async getRecent(limit = 10): Promise<MarketplaceComponent[]> {
    return this.search({
      sortBy: 'updated',
      limit
    })
  }
  
  /**
   * Get components by category
   */
  async getByCategory(category: ComponentCategory, limit = 20): Promise<MarketplaceComponent[]> {
    return this.search({
      category,
      limit
    })
  }
  
  /**
   * Get featured components
   */
  async getFeatured(): Promise<MarketplaceComponent[]> {
    const response = await AuthManager.apiRequest('/marketplace/featured')
    
    if (!response) {
      throw new Error('Failed to get featured components')
    }
    
    return await response.json()
  }
}

// Mock data for development
export const mockComponents: MarketplaceComponent[] = [
  {
    id: 'advanced-data-table',
    name: 'Advanced Data Table',
    description: 'Feature-rich data table with sorting, filtering, pagination, and export',
    category: 'tables',
    framework: ['react', 'vue'],
    styling: ['tailwind', 'css'],
    author: 'Revolutionary UI',
    downloads: 15420,
    rating: 4.8,
    price: 0,
    screenshots: ['/screenshots/data-table-1.png'],
    features: ['Virtual scrolling', 'Column resizing', 'Row selection', 'Export to CSV/Excel'],
    dependencies: [],
    version: '2.1.0',
    updatedAt: '2025-07-28',
    tags: ['table', 'data', 'grid']
  },
  {
    id: 'multi-step-form',
    name: 'Multi-Step Form Wizard',
    description: 'Beautiful multi-step form with validation and progress tracking',
    category: 'forms',
    framework: ['react', 'vue', 'angular'],
    styling: ['tailwind', 'styled-components'],
    author: 'Revolutionary UI',
    downloads: 12350,
    rating: 4.9,
    price: 0,
    screenshots: ['/screenshots/form-wizard-1.png'],
    features: ['Step validation', 'Progress bar', 'Save & continue', 'Custom themes'],
    dependencies: ['react-hook-form', 'zod'],
    version: '1.5.0',
    updatedAt: '2025-07-25',
    tags: ['form', 'wizard', 'validation']
  },
  {
    id: 'dashboard-layout',
    name: 'Admin Dashboard Layout',
    description: 'Complete admin dashboard with sidebar, header, and responsive layout',
    category: 'dashboards',
    framework: ['react', 'vue'],
    styling: ['tailwind'],
    author: 'Revolutionary UI',
    downloads: 23500,
    rating: 4.7,
    price: 0,
    screenshots: ['/screenshots/dashboard-1.png'],
    features: ['Responsive sidebar', 'Dark mode', 'Breadcrumbs', 'User menu'],
    dependencies: [],
    version: '3.0.0',
    updatedAt: '2025-07-20',
    tags: ['dashboard', 'admin', 'layout']
  },
  {
    id: 'kanban-board-pro',
    name: 'Kanban Board Pro',
    description: 'Drag-and-drop Kanban board with swimlanes and custom cards',
    category: 'data-display',
    framework: ['react'],
    styling: ['tailwind', 'css'],
    author: 'UI Masters',
    downloads: 8900,
    rating: 4.6,
    price: 29,
    screenshots: ['/screenshots/kanban-1.png'],
    features: ['Drag & drop', 'Swimlanes', 'Custom cards', 'Filters'],
    dependencies: ['@dnd-kit/sortable'],
    version: '2.0.0',
    updatedAt: '2025-07-22',
    tags: ['kanban', 'board', 'drag-drop']
  },
  {
    id: 'calendar-scheduler',
    name: 'Calendar & Scheduler',
    description: 'Full-featured calendar with event management and scheduling',
    category: 'calendars',
    framework: ['react', 'vue'],
    styling: ['tailwind'],
    author: 'Revolutionary UI',
    downloads: 11200,
    rating: 4.8,
    price: 0,
    screenshots: ['/screenshots/calendar-1.png'],
    features: ['Month/Week/Day views', 'Event drag & drop', 'Recurring events', 'Timezone support'],
    dependencies: ['date-fns'],
    version: '1.8.0',
    updatedAt: '2025-07-18',
    tags: ['calendar', 'scheduler', 'events']
  }
]