import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import { MistralClient } from '@mistralai/mistralai'
import { CustomAIService } from './custom-ai-service'

export interface AIGenerationOptions {
  provider: string
  model: string
  apiKey: string
  prompt: string
  framework: string
  maxTokens?: number
  temperature?: number
  customSettings?: {
    apiEndpoint: string
    headers?: Record<string, string>
    requestFormat: 'openai' | 'anthropic' | 'custom'
    responseFormat: 'openai' | 'anthropic' | 'custom'
    systemPrompt?: string
  }
}

export interface AIGenerationResult {
  code: string
  intent: {
    componentType: string
    explanation: string
    confidence: number
    config: any
  }
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class AIService {
  private openai?: OpenAI
  private anthropic?: Anthropic
  private google?: GoogleGenerativeAI
  private groq?: Groq
  private mistral?: MistralClient

  async generateComponent(options: AIGenerationOptions): Promise<AIGenerationResult> {
    const systemPrompt = this.buildSystemPrompt(options.framework)
    const userPrompt = this.buildUserPrompt(options.prompt)

    // Handle custom providers
    if (options.provider.startsWith('custom-')) {
      if (!options.customSettings) {
        throw new Error('Custom settings required for custom provider')
      }
      const customService = new CustomAIService()
      return customService.generateWithCustomProvider({
        ...options,
        customSettings: options.customSettings
      })
    }

    switch (options.provider) {
      case 'openai':
        return this.generateWithOpenAI(options, systemPrompt, userPrompt)
      case 'anthropic':
        return this.generateWithAnthropic(options, systemPrompt, userPrompt)
      case 'google':
        return this.generateWithGoogle(options, systemPrompt, userPrompt)
      case 'groq':
        return this.generateWithGroq(options, systemPrompt, userPrompt)
      case 'mistral':
        return this.generateWithMistral(options, systemPrompt, userPrompt)
      default:
        throw new Error(`Unsupported provider: ${options.provider}`)
    }
  }

  private buildSystemPrompt(framework: string): string {
    return `You are an expert UI component generator for the Revolutionary UI Factory system.
Your task is to analyze user requests and generate component configurations that work with the factory pattern.

Framework: ${framework}

For each request, you should:
1. Determine the most appropriate component type (dashboard, form, dataTable, card, etc.)
2. Create a configuration object with all necessary properties
3. Generate the actual code using the Revolutionary UI Factory
4. Provide a confidence score (0-1) for your understanding

Return a JSON response with this structure:
{
  "componentType": "string",
  "explanation": "string",
  "confidence": number,
  "config": {},
  "code": "string"
}

The code should use the Revolutionary UI Factory like:
import { setup } from 'revolutionary-ui'
const ui = setup()
const MyComponent = ui.createComponentType(config)`
  }

  private buildUserPrompt(prompt: string): string {
    return `User request: ${prompt}

Generate a UI component based on this description. Focus on creating a clean, modern design with good UX.`
  }

  private async generateWithOpenAI(
    options: AIGenerationOptions,
    systemPrompt: string,
    userPrompt: string
  ): Promise<AIGenerationResult> {
    if (!this.openai) {
      this.openai = new OpenAI({ apiKey: options.apiKey })
    }

    const response = await this.openai.chat.completions.create({
      model: options.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    
    return {
      code: result.code,
      intent: {
        componentType: result.componentType,
        explanation: result.explanation,
        confidence: result.confidence,
        config: result.config
      },
      usage: {
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0
      }
    }
  }

  private async generateWithAnthropic(
    options: AIGenerationOptions,
    systemPrompt: string,
    userPrompt: string
  ): Promise<AIGenerationResult> {
    if (!this.anthropic) {
      this.anthropic = new Anthropic({ apiKey: options.apiKey })
    }

    const response = await this.anthropic.messages.create({
      model: options.model,
      max_tokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })

    // Extract JSON from the response
    const content = response.content[0].type === 'text' 
      ? response.content[0].text 
      : ''
    
    // Parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return {
      code: result.code || '',
      intent: {
        componentType: result.componentType || 'card',
        explanation: result.explanation || '',
        confidence: result.confidence || 0.5,
        config: result.config || {}
      },
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens
      }
    }
  }

  private async generateWithGoogle(
    options: AIGenerationOptions,
    systemPrompt: string,
    userPrompt: string
  ): Promise<AIGenerationResult> {
    if (!this.google) {
      this.google = new GoogleGenerativeAI(options.apiKey)
    }

    const model = this.google.getGenerativeModel({ model: options.model })
    
    const prompt = `${systemPrompt}\n\n${userPrompt}`
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    // Google doesn't provide token usage in the same way
    const estimatedTokens = Math.ceil(text.length / 4)

    return {
      code: parsed.code || '',
      intent: {
        componentType: parsed.componentType || 'card',
        explanation: parsed.explanation || '',
        confidence: parsed.confidence || 0.5,
        config: parsed.config || {}
      },
      usage: {
        prompt_tokens: estimatedTokens,
        completion_tokens: estimatedTokens,
        total_tokens: estimatedTokens * 2
      }
    }
  }

  private async generateWithGroq(
    options: AIGenerationOptions,
    systemPrompt: string,
    userPrompt: string
  ): Promise<AIGenerationResult> {
    if (!this.groq) {
      this.groq = new Groq({ apiKey: options.apiKey })
    }

    const response = await this.groq.chat.completions.create({
      model: options.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

    return {
      code: result.code,
      intent: {
        componentType: result.componentType,
        explanation: result.explanation,
        confidence: result.confidence,
        config: result.config
      },
      usage: {
        prompt_tokens: response.usage?.prompt_tokens || 0,
        completion_tokens: response.usage?.completion_tokens || 0,
        total_tokens: response.usage?.total_tokens || 0
      }
    }
  }

  private async generateWithMistral(
    options: AIGenerationOptions,
    systemPrompt: string,
    userPrompt: string
  ): Promise<AIGenerationResult> {
    if (!this.mistral) {
      this.mistral = new MistralClient(options.apiKey)
    }

    const response = await this.mistral.chat({
      model: options.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 2000,
      responseFormat: { type: 'json_object' }
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

    return {
      code: result.code,
      intent: {
        componentType: result.componentType,
        explanation: result.explanation,
        confidence: result.confidence,
        config: result.config
      },
      usage: {
        prompt_tokens: response.usage?.promptTokens || 0,
        completion_tokens: response.usage?.completionTokens || 0,
        total_tokens: response.usage?.totalTokens || 0
      }
    }
  }

  async testAPIKey(provider: string, apiKey: string, model: string): Promise<boolean> {
    try {
      const result = await this.generateComponent({
        provider,
        apiKey,
        model,
        prompt: 'Create a simple card component',
        framework: 'react',
        maxTokens: 100
      })
      
      return !!result.code
    } catch (error) {
      console.error(`API key test failed for ${provider}:`, error)
      return false
    }
  }
}