/**
 * AI-Powered Component Generation
 * Uses natural language to generate Revolutionary UI components
 */

import { UniversalFactory } from '../v2/UniversalFactory'
import { OpenAIProvider } from './providers/OpenAIProvider'
import { AnthropicProvider } from './providers/AnthropicProvider' 
import { GoogleAIProvider } from './providers/GoogleAIProvider'
import { AIProviderManager } from './AIProviderManager'

export interface AIProvider {
  name: string
  generateComponentConfig(prompt: string): Promise<ComponentIntent>
}

export interface ComponentIntent {
  componentType: string
  config: any
  explanation?: string
  confidence: number
}

export class AIComponentGenerator {
  private factory: UniversalFactory
  private providerManager: AIProviderManager
  
  constructor() {
    this.factory = new UniversalFactory()
    this.providerManager = new AIProviderManager()
  }
  
  /**
   * Generate a component from natural language
   */
  async generateFromPrompt(prompt: string, options?: {
    framework?: string
    provider?: string
  }): Promise<{
    component: any
    code: string
    intent: ComponentIntent
  }> {
    // Set framework if specified
    if (options?.framework) {
      this.factory.useFramework(options.framework)
    }
    
    // Set provider if specified
    if (options?.provider) {
      const model = this.providerManager.getCurrentModel()
      this.providerManager.setProvider(options.provider, model)
    }
    
    // Get AI provider
    const provider = this.providerManager.getCurrentProvider()
    if (!provider) {
      throw new Error(`No AI provider configured. Please set up an API key.`)
    }
    
    // Generate component configuration from prompt
    const intent = await provider.generateComponentConfig(prompt)
    
    // Create component using factory
    const component = this.createComponentFromIntent(intent)
    
    // Generate code
    const code = this.generateCode(intent, options?.framework || 'react')
    
    return {
      component,
      code,
      intent
    }
  }
  
  /**
   * Create component from AI intent
   */
  private createComponentFromIntent(intent: ComponentIntent): any {
    const methodName = `create${intent.componentType.charAt(0).toUpperCase()}${intent.componentType.slice(1)}`
    const method = (this.factory as any)[methodName]
    
    if (!method) {
      throw new Error(`Component type '${intent.componentType}' not supported`)
    }
    
    return method.call(this.factory, intent.config)
  }
  
  /**
   * Generate code for the component
   */
  private generateCode(intent: ComponentIntent, framework: string): string {
    const componentName = intent.componentType.charAt(0).toUpperCase() + intent.componentType.slice(1)
    const configString = JSON.stringify(intent.config, null, 2)
    
    switch (framework) {
      case 'react':
        return `import { setup } from '@vladimirdukelic/revolutionary-ui-factory/v2'

const ui = setup()

export function My${componentName}() {
  const ${componentName} = ui.create${componentName}(${configString})
  
  return <${componentName} />
}`
      
      case 'vue':
        return `<template>
  <${componentName} />
</template>

<script setup>
import { setup } from '@vladimirdukelic/revolutionary-ui-factory/v2'

const ui = setup({ framework: 'vue' })
const ${componentName} = ui.create${componentName}(${configString})
</script>`
      
      default:
        return `// ${framework} code generation not implemented yet`
    }
  }
  
  /**
   * Set API key for a provider
   */
  setApiKey(provider: string, apiKey: string) {
    this.providerManager.setApiKey(provider, apiKey)
  }
  
  /**
   * Set current AI provider and model
   */
  useProvider(provider: string, model: string) {
    this.providerManager.setProvider(provider, model)
  }
  
  /**
   * Get available providers
   */
  getProviders() {
    return this.providerManager.getAllProviders()
  }
  
  /**
   * Test provider connection
   */
  async testProvider(provider: string): Promise<boolean> {
    return this.providerManager.testConnection(provider)
  }
}

