/**
 * AI Configuration Manager for Revolutionary UI Factory
 * Manages custom AI provider configurations
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { AuthManager } from './auth-manager'
import chalk from 'chalk'

export interface AIConfig {
  provider: AIProvider
  apiKey?: string
  endpoint?: string
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  customHeaders?: Record<string, string>
}

export type AIProvider = 
  | 'openai' | 'anthropic' | 'google' | 'mistral' | 'groq' 
  | 'deepseek' | 'cohere' | 'custom' | 'local'

export interface AIProviderInfo {
  name: string
  models: string[]
  requiresApiKey: boolean
  supportsStreaming: boolean
  configFields: ConfigField[]
}

export interface ConfigField {
  name: string
  type: 'text' | 'password' | 'number' | 'select' | 'textarea'
  label: string
  required: boolean
  options?: string[]
  default?: any
  placeholder?: string
}

export class AIConfigManager {
  private static CONFIG_DIR = path.join(os.homedir(), '.revolutionary-ui')
  private static AI_CONFIG_FILE = 'ai-config.json'
  private static AI_CONFIG_PATH = path.join(AIConfigManager.CONFIG_DIR, AIConfigManager.AI_CONFIG_FILE)
  
  private static providers: Record<AIProvider, AIProviderInfo> = {
    openai: {
      name: 'OpenAI',
      models: ['gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
      requiresApiKey: true,
      supportsStreaming: true,
      configFields: [
        {
          name: 'apiKey',
          type: 'password',
          label: 'API Key',
          required: true,
          placeholder: 'sk-...'
        },
        {
          name: 'model',
          type: 'select',
          label: 'Model',
          required: true,
          options: ['gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo'],
          default: 'gpt-4'
        },
        {
          name: 'temperature',
          type: 'number',
          label: 'Temperature (0-2)',
          required: false,
          default: 0.7
        },
        {
          name: 'maxTokens',
          type: 'number',
          label: 'Max Tokens',
          required: false,
          default: 2000
        }
      ]
    },
    anthropic: {
      name: 'Anthropic (Claude)',
      models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      requiresApiKey: true,
      supportsStreaming: true,
      configFields: [
        {
          name: 'apiKey',
          type: 'password',
          label: 'API Key',
          required: true,
          placeholder: 'sk-ant-...'
        },
        {
          name: 'model',
          type: 'select',
          label: 'Model',
          required: true,
          options: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
          default: 'claude-3-opus-20240229'
        },
        {
          name: 'maxTokens',
          type: 'number',
          label: 'Max Tokens',
          required: false,
          default: 4000
        }
      ]
    },
    google: {
      name: 'Google (Gemini)',
      models: ['gemini-pro', 'gemini-pro-vision'],
      requiresApiKey: true,
      supportsStreaming: true,
      configFields: [
        {
          name: 'apiKey',
          type: 'password',
          label: 'API Key',
          required: true,
          placeholder: 'AI...'
        },
        {
          name: 'model',
          type: 'select',
          label: 'Model',
          required: true,
          options: ['gemini-pro', 'gemini-pro-vision'],
          default: 'gemini-pro'
        }
      ]
    },
    mistral: {
      name: 'Mistral AI',
      models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
      requiresApiKey: true,
      supportsStreaming: true,
      configFields: [
        {
          name: 'apiKey',
          type: 'password',
          label: 'API Key',
          required: true
        },
        {
          name: 'model',
          type: 'select',
          label: 'Model',
          required: true,
          options: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
          default: 'mistral-large-latest'
        }
      ]
    },
    groq: {
      name: 'Groq',
      models: ['mixtral-8x7b-32768', 'llama2-70b-4096'],
      requiresApiKey: true,
      supportsStreaming: true,
      configFields: [
        {
          name: 'apiKey',
          type: 'password',
          label: 'API Key',
          required: true
        },
        {
          name: 'model',
          type: 'select',
          label: 'Model',
          required: true,
          options: ['mixtral-8x7b-32768', 'llama2-70b-4096'],
          default: 'mixtral-8x7b-32768'
        }
      ]
    },
    deepseek: {
      name: 'DeepSeek',
      models: ['deepseek-coder', 'deepseek-chat'],
      requiresApiKey: true,
      supportsStreaming: true,
      configFields: [
        {
          name: 'apiKey',
          type: 'password',
          label: 'API Key',
          required: true
        },
        {
          name: 'model',
          type: 'select',
          label: 'Model',
          required: true,
          options: ['deepseek-coder', 'deepseek-chat'],
          default: 'deepseek-coder'
        }
      ]
    },
    cohere: {
      name: 'Cohere',
      models: ['command', 'command-light'],
      requiresApiKey: true,
      supportsStreaming: true,
      configFields: [
        {
          name: 'apiKey',
          type: 'password',
          label: 'API Key',
          required: true
        },
        {
          name: 'model',
          type: 'select',
          label: 'Model',
          required: true,
          options: ['command', 'command-light'],
          default: 'command'
        }
      ]
    },
    custom: {
      name: 'Custom API Endpoint',
      models: [],
      requiresApiKey: false,
      supportsStreaming: false,
      configFields: [
        {
          name: 'endpoint',
          type: 'text',
          label: 'API Endpoint URL',
          required: true,
          placeholder: 'https://api.example.com/v1/chat'
        },
        {
          name: 'apiKey',
          type: 'password',
          label: 'API Key (if required)',
          required: false
        },
        {
          name: 'model',
          type: 'text',
          label: 'Model Name',
          required: false
        },
        {
          name: 'customHeaders',
          type: 'textarea',
          label: 'Custom Headers (JSON)',
          required: false,
          placeholder: '{"X-Custom-Header": "value"}'
        }
      ]
    },
    local: {
      name: 'Local Model (Ollama, etc.)',
      models: ['llama2', 'codellama', 'mistral', 'mixtral'],
      requiresApiKey: false,
      supportsStreaming: true,
      configFields: [
        {
          name: 'endpoint',
          type: 'text',
          label: 'Local API Endpoint',
          required: true,
          default: 'http://localhost:11434/api/generate',
          placeholder: 'http://localhost:11434/api/generate'
        },
        {
          name: 'model',
          type: 'text',
          label: 'Model Name',
          required: true,
          placeholder: 'llama2'
        }
      ]
    }
  }
  
  /**
   * Initialize config directory
   */
  static async init(): Promise<void> {
    try {
      await fs.mkdir(this.CONFIG_DIR, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }
  }
  
  /**
   * Get current AI configuration
   */
  static async getConfig(): Promise<AIConfig | null> {
    try {
      const data = await fs.readFile(this.AI_CONFIG_PATH, 'utf-8')
      return JSON.parse(data)
    } catch {
      return null
    }
  }
  
  /**
   * Save AI configuration
   */
  static async saveConfig(config: AIConfig): Promise<void> {
    await this.init()
    
    // Validate config
    const provider = this.providers[config.provider]
    if (!provider) {
      throw new Error(`Unknown AI provider: ${config.provider}`)
    }
    
    // Don't save sensitive data to Revolutionary UI servers
    // Only save locally
    await fs.writeFile(this.AI_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
    
    // Set restrictive permissions
    await fs.chmod(this.AI_CONFIG_PATH, 0o600)
    
    // Notify server about provider choice (not the key)
    try {
      await AuthManager.apiRequest('/ai/config', {
        method: 'POST',
        body: JSON.stringify({
          provider: config.provider,
          model: config.model
          // Don't send API keys
        })
      })
    } catch {
      // Server notification is optional
    }
  }
  
  /**
   * Test AI configuration
   */
  static async testConfig(config: AIConfig): Promise<boolean> {
    try {
      // Test based on provider
      switch (config.provider) {
        case 'openai':
          return await this.testOpenAI(config)
        case 'anthropic':
          return await this.testAnthropic(config)
        case 'google':
          return await this.testGoogle(config)
        case 'local':
          return await this.testLocal(config)
        case 'custom':
          return await this.testCustom(config)
        default:
          // For other providers, assume valid if API key is present
          return !!config.apiKey
      }
    } catch (error) {
      return false
    }
  }
  
  /**
   * Test OpenAI configuration
   */
  private static async testOpenAI(config: AIConfig): Promise<boolean> {
    if (!config.apiKey) return false
    
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      })
      
      return response.ok
    } catch {
      return false
    }
  }
  
  /**
   * Test Anthropic configuration
   */
  private static async testAnthropic(config: AIConfig): Promise<boolean> {
    if (!config.apiKey) return false
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model || 'claude-3-opus-20240229',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10
        })
      })
      
      // Anthropic returns 200 for valid requests
      return response.ok || response.status === 400 // 400 might mean quota exceeded
    } catch {
      return false
    }
  }
  
  /**
   * Test Google configuration
   */
  private static async testGoogle(config: AIConfig): Promise<boolean> {
    if (!config.apiKey) return false
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`
      )
      
      return response.ok
    } catch {
      return false
    }
  }
  
  /**
   * Test local configuration
   */
  private static async testLocal(config: AIConfig): Promise<boolean> {
    if (!config.endpoint) return false
    
    try {
      // Try to connect to local endpoint
      const response = await fetch(config.endpoint.replace('/generate', '/tags'))
      return response.ok
    } catch {
      return false
    }
  }
  
  /**
   * Test custom configuration
   */
  private static async testCustom(config: AIConfig): Promise<boolean> {
    if (!config.endpoint) return false
    
    try {
      const headers: Record<string, string> = {}
      
      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`
      }
      
      if (config.customHeaders) {
        const customHeaders = typeof config.customHeaders === 'string' 
          ? JSON.parse(config.customHeaders) 
          : config.customHeaders
        Object.assign(headers, customHeaders)
      }
      
      const response = await fetch(config.endpoint, {
        method: 'GET',
        headers
      })
      
      return response.ok
    } catch {
      return false
    }
  }
  
  /**
   * Get provider info
   */
  static getProviderInfo(provider: AIProvider): AIProviderInfo | undefined {
    return this.providers[provider]
  }
  
  /**
   * Get all providers
   */
  static getAllProviders(): Array<{ key: AIProvider; info: AIProviderInfo }> {
    return Object.entries(this.providers).map(([key, info]) => ({
      key: key as AIProvider,
      info
    }))
  }
  
  /**
   * Generate component with custom AI
   */
  static async generateWithCustomAI(prompt: string, config: AIConfig): Promise<string> {
    // This would be implemented based on the provider
    // For now, return a placeholder
    throw new Error('Custom AI generation not yet implemented')
  }
}