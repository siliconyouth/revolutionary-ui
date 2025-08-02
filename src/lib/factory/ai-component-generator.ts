/**
 * AI Component Generator for Revolutionary UI Factory
 * Generates components from natural language descriptions
 */

import { ComponentGenerator, ComponentOptions, ComponentType } from './component-generator'
import { AuthManager } from './auth-manager'
import chalk from 'chalk'

export interface AIGenerationOptions {
  prompt: string
  framework?: string
  styling?: string
  typescript?: boolean
  outputDir?: string
  model?: AIModel
}

export type AIModel = 
  | 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet'
  | 'gemini-pro' | 'custom'

interface ParsedComponent {
  type: ComponentType
  name: string
  features: string[]
  description: string
  props?: Record<string, any>
}

export class AIComponentGenerator {
  private componentGenerator: ComponentGenerator
  
  constructor() {
    this.componentGenerator = new ComponentGenerator()
  }
  
  /**
   * Generate a component from natural language prompt
   */
  async generateFromPrompt(options: AIGenerationOptions): Promise<any> {
    // Parse the prompt to understand what component to generate
    const parsed = await this.parsePrompt(options.prompt, options.model)
    
    // Generate component options
    const componentOptions: ComponentOptions = {
      name: parsed.name,
      type: parsed.type,
      framework: options.framework as any,
      styling: options.styling as any,
      typescript: options.typescript,
      features: parsed.features,
      props: parsed.props
    }
    
    // Generate the component
    const result = await this.componentGenerator.generate(componentOptions)
    
    // Enhance with AI-specific metadata
    return {
      ...result,
      aiGenerated: true,
      prompt: options.prompt,
      parsedIntent: parsed
    }
  }
  
  /**
   * Parse natural language prompt to component specifications
   */
  private async parsePrompt(prompt: string, model?: AIModel): Promise<ParsedComponent> {
    // Try to use API if available
    if (await AuthManager.isAuthenticated()) {
      try {
        const response = await AuthManager.apiRequest('/ai/parse-component', {
          method: 'POST',
          body: JSON.stringify({ prompt, model })
        })
        
        if (response && response.ok) {
          return await response.json()
        }
      } catch (error) {
        console.log(chalk.yellow('⚠️  AI API unavailable, using local parsing'))
      }
    }
    
    // Local parsing fallback
    return this.parsePromptLocally(prompt)
  }
  
  /**
   * Local prompt parsing using pattern matching
   */
  private parsePromptLocally(prompt: string): ParsedComponent {
    const lowerPrompt = prompt.toLowerCase()
    
    // Detect component type
    let type: ComponentType = 'card'
    let features: string[] = []
    
    // Table detection
    if (lowerPrompt.includes('table') || lowerPrompt.includes('grid') || lowerPrompt.includes('data')) {
      type = 'table'
      
      if (lowerPrompt.includes('sort')) features.push('sort')
      if (lowerPrompt.includes('filter') || lowerPrompt.includes('search')) features.push('filter')
      if (lowerPrompt.includes('pagina')) features.push('pagination')
      if (lowerPrompt.includes('select') || lowerPrompt.includes('checkbox')) features.push('selection')
      if (lowerPrompt.includes('export')) features.push('export')
      
      // Default features for tables
      if (features.length === 0) {
        features = ['sort', 'filter', 'pagination']
      }
    }
    
    // Form detection
    else if (lowerPrompt.includes('form') || lowerPrompt.includes('input') || lowerPrompt.includes('field')) {
      type = 'form'
      
      if (lowerPrompt.includes('multi') || lowerPrompt.includes('step') || lowerPrompt.includes('wizard')) {
        features.push('multi-step')
      }
      if (lowerPrompt.includes('validat')) features.push('validation')
      if (lowerPrompt.includes('file') || lowerPrompt.includes('upload')) features.push('file-upload')
    }
    
    // Dashboard detection
    else if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('admin') || lowerPrompt.includes('panel')) {
      type = 'dashboard'
      
      if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph')) features.push('charts')
      if (lowerPrompt.includes('metric') || lowerPrompt.includes('stat')) features.push('metrics')
      if (lowerPrompt.includes('widget')) features.push('widgets')
    }
    
    // Button detection
    else if (lowerPrompt.includes('button') || lowerPrompt.includes('btn')) {
      type = 'button'
      
      if (lowerPrompt.includes('load')) features.push('loading')
      if (lowerPrompt.includes('icon')) features.push('icon')
      if (lowerPrompt.includes('group')) features.push('group')
    }
    
    // Modal detection
    else if (lowerPrompt.includes('modal') || lowerPrompt.includes('dialog') || lowerPrompt.includes('popup')) {
      type = 'modal'
      
      if (lowerPrompt.includes('confirm')) features.push('confirmation')
      if (lowerPrompt.includes('form')) features.push('form')
    }
    
    // Card detection
    else if (lowerPrompt.includes('card') || lowerPrompt.includes('tile')) {
      type = 'card'
      
      if (lowerPrompt.includes('image') || lowerPrompt.includes('photo')) features.push('image')
      if (lowerPrompt.includes('action')) features.push('actions')
    }
    
    // Kanban detection
    else if (lowerPrompt.includes('kanban') || lowerPrompt.includes('board') || lowerPrompt.includes('drag')) {
      type = 'kanban'
      features = ['drag-drop', 'columns', 'cards']
    }
    
    // Calendar detection
    else if (lowerPrompt.includes('calendar') || lowerPrompt.includes('schedule') || lowerPrompt.includes('event')) {
      type = 'calendar'
      
      if (lowerPrompt.includes('month')) features.push('month-view')
      if (lowerPrompt.includes('week')) features.push('week-view')
      if (lowerPrompt.includes('day')) features.push('day-view')
    }
    
    // Chart detection
    else if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph') || lowerPrompt.includes('plot')) {
      type = 'chart'
      
      if (lowerPrompt.includes('line')) features.push('line')
      if (lowerPrompt.includes('bar')) features.push('bar')
      if (lowerPrompt.includes('pie')) features.push('pie')
    }
    
    // Navigation detection
    else if (lowerPrompt.includes('nav') || lowerPrompt.includes('menu')) {
      if (lowerPrompt.includes('side')) {
        type = 'sidebar'
      } else {
        type = 'navbar'
      }
    }
    
    // Pricing detection
    else if (lowerPrompt.includes('pricing') || lowerPrompt.includes('plan') || lowerPrompt.includes('tier')) {
      type = 'pricing'
      
      if (lowerPrompt.includes('compare')) features.push('comparison')
      if (lowerPrompt.includes('toggle')) features.push('toggle')
    }
    
    // Generate a name from the prompt
    const name = this.generateComponentName(prompt, type)
    
    return {
      type,
      name,
      features,
      description: prompt,
      props: this.extractProps(prompt)
    }
  }
  
  /**
   * Generate component name from prompt
   */
  private generateComponentName(prompt: string, type: ComponentType): string {
    // Extract key words
    const words = prompt
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !this.isStopWord(w))
    
    // Take first 2-3 meaningful words
    const nameWords = words.slice(0, 2)
    
    // Add component type if not already included
    if (!nameWords.some(w => w.toLowerCase().includes(type.toLowerCase()))) {
      nameWords.push(type)
    }
    
    // Convert to PascalCase
    return nameWords
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('')
  }
  
  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'with', 'for', 'to', 'from',
      'create', 'make', 'build', 'generate', 'need', 'want', 'please',
      'that', 'has', 'have', 'can', 'should', 'would', 'could'
    ]
    
    return stopWords.includes(word.toLowerCase())
  }
  
  /**
   * Extract props from prompt
   */
  private extractProps(prompt: string): Record<string, any> {
    const props: Record<string, any> = {}
    
    // Extract numbers
    const numbers = prompt.match(/\d+/g)
    if (numbers) {
      if (prompt.toLowerCase().includes('column') || prompt.toLowerCase().includes('tier')) {
        props.columns = parseInt(numbers[0])
      }
      if (prompt.toLowerCase().includes('row')) {
        props.rows = parseInt(numbers[0])
      }
    }
    
    // Extract colors
    const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info']
    colors.forEach(color => {
      if (prompt.toLowerCase().includes(color)) {
        props.variant = color
      }
    })
    
    // Extract sizes
    const sizes = ['small', 'medium', 'large', 'sm', 'md', 'lg', 'xl']
    sizes.forEach(size => {
      if (prompt.toLowerCase().includes(size)) {
        props.size = size.substring(0, 2).toLowerCase()
      }
    })
    
    return props
  }
  
  /**
   * Get AI model configuration
   */
  async getModelConfig(): Promise<any> {
    const response = await AuthManager.apiRequest('/ai/models')
    
    if (!response) {
      return {
        available: ['gpt-3.5-turbo'],
        default: 'gpt-3.5-turbo'
      }
    }
    
    return await response.json()
  }
  
  /**
   * Save custom AI configuration
   */
  async saveCustomAIConfig(config: any): Promise<void> {
    await AuthManager.apiRequest('/ai/config', {
      method: 'POST',
      body: JSON.stringify(config)
    })
  }
}

// Example prompts for reference
export const examplePrompts = [
  "Create a responsive data table with sorting, filtering, and pagination",
  "Build a multi-step form wizard with validation",
  "Generate a dashboard with 4 stat cards and a chart",
  "Make a pricing table with 3 tiers and a monthly/yearly toggle",
  "Create a kanban board with drag and drop functionality",
  "Build a calendar component with month and week views",
  "Generate a navigation sidebar with collapsible sections",
  "Create a product card with image, title, price, and add to cart button",
  "Make a modal dialog with form inputs and validation",
  "Build a hero section with headline, description, and CTA buttons"
]