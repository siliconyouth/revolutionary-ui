import { AIProvider } from './AIComponentGenerator'
import { OpenAIProvider } from './providers/OpenAIProvider'
import { AnthropicProvider } from './providers/AnthropicProvider'
import { GoogleAIProvider } from './providers/GoogleAIProvider'
import { CustomProvider, CustomProviderConfig } from './providers/CustomProvider'

export interface AIProviderConfig {
  id: string
  name: string
  models: Array<{
    id: string
    name: string
    context: number
  }>
  requiresApiKey: boolean
  supportsOAuth?: boolean
}

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', context: 128000 },
      { id: 'gpt-4', name: 'GPT-4', context: 8192 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', context: 16385 }
    ],
    requiresApiKey: true,
    supportsOAuth: false
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', context: 200000 },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', context: 200000 },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', context: 200000 }
    ],
    requiresApiKey: true,
    supportsOAuth: false
  },
  {
    id: 'google',
    name: 'Google AI',
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro', context: 30720 },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', context: 12288 }
    ],
    requiresApiKey: true,
    supportsOAuth: true
  },
  {
    id: 'groq',
    name: 'Groq',
    models: [
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', context: 32768 },
      { id: 'llama2-70b-4096', name: 'LLaMA2 70B', context: 4096 }
    ],
    requiresApiKey: true,
    supportsOAuth: false
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', context: 32000 },
      { id: 'mistral-medium-latest', name: 'Mistral Medium', context: 32000 },
      { id: 'mistral-small-latest', name: 'Mistral Small', context: 32000 }
    ],
    requiresApiKey: true,
    supportsOAuth: false
  },
  {
    id: 'custom',
    name: 'Custom Provider',
    models: [],
    requiresApiKey: true,
    supportsOAuth: false
  }
]

export class AIProviderManager {
  private providers: Map<string, AIProvider> = new Map()
  private customProviders: Map<string, CustomProviderConfig> = new Map()
  private currentProviderId: string = 'openai'
  private currentModel: string = 'gpt-4-turbo-preview'

  constructor() {
    // Initialize with empty providers (no API keys)
    this.providers.set('openai', new OpenAIProvider())
    this.providers.set('anthropic', new AnthropicProvider())
    this.providers.set('google', new GoogleAIProvider())
  }

  setProvider(providerId: string, model: string) {
    const provider = AI_PROVIDERS.find(p => p.id === providerId)
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`)
    }

    const modelExists = provider.models.some(m => m.id === model)
    if (!modelExists && providerId !== 'custom') {
      throw new Error(`Model ${model} not found for provider ${providerId}`)
    }

    this.currentProviderId = providerId
    this.currentModel = model
  }

  setApiKey(providerId: string, apiKey: string) {
    const provider = this.providers.get(providerId)
    
    if (providerId === 'openai' || !provider) {
      const openaiProvider = new OpenAIProvider(apiKey, this.currentModel)
      this.providers.set('openai', openaiProvider)
    } else if (providerId === 'anthropic') {
      const anthropicProvider = new AnthropicProvider(apiKey, this.currentModel)
      this.providers.set('anthropic', anthropicProvider)
    } else if (providerId === 'google') {
      const googleProvider = new GoogleAIProvider(apiKey, this.currentModel)
      this.providers.set('google', googleProvider)
    } else if (providerId.startsWith('custom-')) {
      // Handle custom provider
      const customConfig = this.customProviders.get(providerId)
      if (customConfig) {
        const customProvider = new CustomProvider({ ...customConfig, apiKey })
        this.providers.set(providerId, customProvider)
      }
    }
    // Add more providers as needed
  }

  getCurrentProvider(): AIProvider | null {
    return this.providers.get(this.currentProviderId) || null
  }

  getCurrentProviderId(): string {
    return this.currentProviderId
  }

  getCurrentModel(): string {
    return this.currentModel
  }

  getProviderConfig(providerId: string): AIProviderConfig | undefined {
    return AI_PROVIDERS.find(p => p.id === providerId)
  }

  getAllProviders(): AIProviderConfig[] {
    return AI_PROVIDERS
  }

  async testConnection(providerId: string): Promise<boolean> {
    const provider = this.providers.get(providerId)
    if (!provider) return false

    try {
      // Test with a simple prompt
      await provider.generateComponentConfig('Create a simple card')
      return true
    } catch (error) {
      return false
    }
  }
  
  addCustomProvider(config: CustomProviderConfig): string {
    const id = `custom-${Date.now()}`
    this.customProviders.set(id, config)
    
    // Add to AI_PROVIDERS dynamically
    AI_PROVIDERS.push({
      id,
      name: config.name,
      models: config.model ? [{ id: config.model, name: config.model, context: 4096 }] : [],
      requiresApiKey: true,
      supportsOAuth: false
    })
    
    // Create provider instance if API key is provided
    if (config.apiKey) {
      const customProvider = new CustomProvider(config)
      this.providers.set(id, customProvider)
    }
    
    return id
  }
  
  removeCustomProvider(id: string): boolean {
    if (!id.startsWith('custom-')) return false
    
    this.customProviders.delete(id)
    this.providers.delete(id)
    
    // Remove from AI_PROVIDERS
    const index = AI_PROVIDERS.findIndex(p => p.id === id)
    if (index !== -1) {
      AI_PROVIDERS.splice(index, 1)
    }
    
    return true
  }
  
  getCustomProviders(): Array<{ id: string; config: CustomProviderConfig }> {
    return Array.from(this.customProviders.entries()).map(([id, config]) => ({ id, config }))
  }
}