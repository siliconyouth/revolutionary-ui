import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Mistral } from '@mistralai/mistralai'
import Groq from 'groq-sdk'
import { loadEnvVariables } from '../../cli/utils/env-loader'

// Load environment variables
loadEnvVariables()

export interface AIProvider {
  name: string
  generateText(options: {
    messages: Array<{ role: string; content: string }>
    maxTokens?: number
    temperature?: number
  }): Promise<string>
  testConnection(): Promise<boolean>
}

class OpenAIProvider implements AIProvider {
  name = 'OpenAI'
  private client: OpenAI

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found')
    }
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  async generateText(options: {
    messages: Array<{ role: string; content: string }>
    maxTokens?: number
    temperature?: number
  }): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o', // Updated to latest model
      messages: options.messages as any,
      max_tokens: options.maxTokens || 4000,
      temperature: options.temperature || 0.7
    })
    return response.choices[0].message.content || ''
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list()
      return true
    } catch {
      return false
    }
  }
}

class AnthropicProvider implements AIProvider {
  name = 'Anthropic'
  private client: Anthropic

  constructor() {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not found')
    }
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })
  }

  async generateText(options: {
    messages: Array<{ role: string; content: string }>
    maxTokens?: number
    temperature?: number
  }): Promise<string> {
    // Extract system message if present
    const systemMessage = options.messages.find(m => m.role === 'system')
    const userMessages = options.messages.filter(m => m.role !== 'system')

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Updated to latest model
      max_tokens: options.maxTokens || 4000,
      temperature: options.temperature || 0.7,
      system: systemMessage?.content,
      messages: userMessages as any
    })
    
    const content = response.content[0]
    return content.type === 'text' ? content.text : ''
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.generateText({
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 10
      })
      return true
    } catch {
      return false
    }
  }
}

class GoogleAIProvider implements AIProvider {
  name = 'Google AI'
  private client: GoogleGenerativeAI

  constructor() {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('Google AI API key not found')
    }
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  }

  async generateText(options: {
    messages: Array<{ role: string; content: string }>
    maxTokens?: number
    temperature?: number
  }): Promise<string> {
    const model = this.client.getGenerativeModel({ model: 'gemini-1.5-pro' }) // Updated to latest model
    
    // Convert messages to prompt
    const prompt = options.messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n')
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.generateText({
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 10
      })
      return true
    } catch {
      return false
    }
  }
}

class GroqProvider implements AIProvider {
  name = 'Groq'
  private client: Groq

  constructor() {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Groq API key not found')
    }
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY
    })
  }

  async generateText(options: {
    messages: Array<{ role: string; content: string }>
    maxTokens?: number
    temperature?: number
  }): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile', // Updated to latest model
      messages: options.messages as any,
      max_tokens: options.maxTokens || 4000,
      temperature: options.temperature || 0.7
    })
    
    return response.choices[0].message.content || ''
  }

  async testConnection(): Promise<boolean> {
    try {
      const models = await this.client.models.list()
      return models.data.length > 0
    } catch {
      return false
    }
  }
}

class MistralProvider implements AIProvider {
  name = 'Mistral'
  private client: Mistral

  constructor() {
    if (!process.env.MISTRAL_API_KEY) {
      throw new Error('Mistral API key not found')
    }
    this.client = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY
    })
  }

  async generateText(options: {
    messages: Array<{ role: string; content: string }>
    maxTokens?: number
    temperature?: number
  }): Promise<string> {
    const response = await this.client.chat.complete({
      model: 'mistral-large-latest',
      messages: options.messages as any,
      maxTokens: options.maxTokens || 4000,
      temperature: options.temperature || 0.7
    })
    
    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response from Mistral')
    }
    
    const content = response.choices[0].message.content
    return typeof content === 'string' ? content : ''
  }

  async testConnection(): Promise<boolean> {
    try {
      const models = await this.client.models.list()
      return models.data.length > 0
    } catch {
      return false
    }
  }
}

export class AIProviderFactory {
  private static providers = new Map<string, new () => AIProvider>([
    ['openai', OpenAIProvider],
    ['anthropic', AnthropicProvider],
    ['google', GoogleAIProvider],
    ['groq', GroqProvider],
    ['mistral', MistralProvider]
  ])

  static createProvider(type: string): AIProvider {
    const ProviderClass = this.providers.get(type)
    if (!ProviderClass) {
      throw new Error(`Unknown provider type: ${type}`)
    }
    
    try {
      return new ProviderClass()
    } catch (error: any) {
      throw new Error(`Failed to create ${type} provider: ${error.message}`)
    }
  }

  static getAvailableProviders(): string[] {
    const available: string[] = []
    
    // Check each provider
    if (process.env.OPENAI_API_KEY) available.push('openai')
    if (process.env.ANTHROPIC_API_KEY) available.push('anthropic')
    if (process.env.GOOGLE_AI_API_KEY) available.push('google')
    if (process.env.GROQ_API_KEY) available.push('groq')
    if (process.env.MISTRAL_API_KEY) available.push('mistral')
    
    return available
  }
}