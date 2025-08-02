/**
 * Custom AI Provider
 * Allows users to bring their own AI provider
 */

import { AIProvider, ComponentIntent } from '../AIComponentGenerator'

export interface CustomProviderConfig {
  name: string
  apiEndpoint: string
  apiKey: string
  headers?: Record<string, string>
  requestFormat?: 'openai' | 'anthropic' | 'custom'
  responseFormat?: 'openai' | 'anthropic' | 'custom'
  model?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export class CustomProvider implements AIProvider {
  name: string
  private config: CustomProviderConfig
  
  constructor(config: CustomProviderConfig) {
    this.name = config.name
    this.config = config
  }
  
  async generateComponentConfig(prompt: string): Promise<ComponentIntent> {
    const systemPrompt = this.config.systemPrompt || `You are an AI assistant that helps generate UI component configurations. Based on the user's prompt, determine the most appropriate component type and generate its configuration.

The response should be in JSON format with these fields:
- componentType: string (e.g., "dashboard", "form", "dataTable", "kanban", "card", "chart", "calendar", "timeline")
- config: object with component-specific configuration
- explanation: string describing what was created
- confidence: number between 0 and 1 indicating confidence in the interpretation

Example response:
{
  "componentType": "dashboard",
  "config": {
    "widgets": [
      {
        "id": "stats1",
        "type": "stats",
        "config": {
          "value": 125600,
          "label": "Total Revenue",
          "change": 12.5,
          "trend": "up"
        }
      }
    ]
  },
  "explanation": "Created a dashboard with revenue statistics",
  "confidence": 0.9
}`
    
    try {
      const requestBody = this.buildRequestBody(prompt, systemPrompt)
      
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...this.config.headers
        },
        body: JSON.stringify(requestBody)
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      return this.parseResponse(data)
      
    } catch (error) {
      console.error('Custom provider error:', error)
      
      // Fallback response
      return {
        componentType: 'card',
        config: {
          title: 'Error',
          content: `Failed to generate component: ${error.message}`
        },
        explanation: 'An error occurred while generating the component',
        confidence: 0
      }
    }
  }
  
  private buildRequestBody(prompt: string, systemPrompt: string): any {
    switch (this.config.requestFormat) {
      case 'openai':
        return {
          model: this.config.model || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1000,
          response_format: { type: 'json_object' }
        }
        
      case 'anthropic':
        return {
          model: this.config.model || 'claude-3-sonnet-20240229',
          system: systemPrompt,
          messages: [
            { role: 'user', content: prompt }
          ],
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1000
        }
        
      case 'custom':
      default:
        // User must handle their own format
        return {
          prompt,
          systemPrompt,
          model: this.config.model,
          temperature: this.config.temperature || 0.7,
          maxTokens: this.config.maxTokens || 1000
        }
    }
  }
  
  private parseResponse(data: any): ComponentIntent {
    switch (this.config.responseFormat) {
      case 'openai':
        const openaiContent = data.choices?.[0]?.message?.content
        if (typeof openaiContent === 'string') {
          try {
            return JSON.parse(openaiContent)
          } catch {
            return this.createFallbackIntent(openaiContent)
          }
        }
        return this.createFallbackIntent('No content in response')
        
      case 'anthropic':
        const anthropicContent = data.content?.[0]?.text
        if (typeof anthropicContent === 'string') {
          try {
            return JSON.parse(anthropicContent)
          } catch {
            return this.createFallbackIntent(anthropicContent)
          }
        }
        return this.createFallbackIntent('No content in response')
        
      case 'custom':
      default:
        // Assume the response is already in the correct format
        if (data.componentType) {
          return data as ComponentIntent
        }
        // Try to extract from common patterns
        if (data.result) return data.result
        if (data.data) return data.data
        if (data.output) return data.output
        
        return this.createFallbackIntent(JSON.stringify(data))
    }
  }
  
  private createFallbackIntent(content: string): ComponentIntent {
    return {
      componentType: 'card',
      config: {
        title: 'Generated Content',
        content
      },
      explanation: 'Generated content from custom provider',
      confidence: 0.5
    }
  }
  
  async testConnection(): Promise<boolean> {
    try {
      // Simple test - try to generate something
      await this.generateComponentConfig('Create a simple button')
      return true
    } catch {
      return false
    }
  }
}