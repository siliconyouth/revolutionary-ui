import { AIGenerationOptions, AIGenerationResult } from './ai-service'

export class CustomAIService {
  async generateWithCustomProvider(
    options: AIGenerationOptions & {
      customSettings: {
        apiEndpoint: string
        headers?: Record<string, string>
        requestFormat: 'openai' | 'anthropic' | 'custom'
        responseFormat: 'openai' | 'anthropic' | 'custom'
        systemPrompt?: string
      }
    }
  ): Promise<AIGenerationResult> {
    const { customSettings } = options
    
    // Build request based on format
    let requestBody: any
    const systemPrompt = customSettings.systemPrompt || this.buildDefaultSystemPrompt(options.framework)
    
    switch (customSettings.requestFormat) {
      case 'openai':
        requestBody = {
          model: options.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: options.prompt }
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000,
          response_format: { type: 'json_object' }
        }
        break
        
      case 'anthropic':
        requestBody = {
          model: options.model,
          max_tokens: options.maxTokens || 2000,
          temperature: options.temperature || 0.7,
          system: systemPrompt,
          messages: [{ role: 'user', content: options.prompt }]
        }
        break
        
      case 'custom':
        // For custom format, we'll send a generic structure
        requestBody = {
          prompt: `${systemPrompt}\n\n${options.prompt}`,
          model: options.model,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 2000
        }
        break
    }
    
    // Make request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customSettings.headers
    }
    
    if (options.apiKey) {
      headers['Authorization'] = `Bearer ${options.apiKey}`
    }
    
    const response = await fetch(customSettings.apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Custom AI API error: ${response.status} - ${error}`)
    }
    
    const data = await response.json()
    
    // Parse response based on format
    let result: any
    switch (customSettings.responseFormat) {
      case 'openai':
        result = this.parseOpenAIResponse(data)
        break
        
      case 'anthropic':
        result = this.parseAnthropicResponse(data)
        break
        
      case 'custom':
        result = this.parseCustomResponse(data)
        break
    }
    
    return result
  }
  
  private buildDefaultSystemPrompt(framework: string): string {
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
}`
  }
  
  private parseOpenAIResponse(data: any): AIGenerationResult {
    const content = data.choices?.[0]?.message?.content || '{}'
    const result = JSON.parse(content)
    
    return {
      code: result.code || '',
      intent: {
        componentType: result.componentType || 'card',
        explanation: result.explanation || '',
        confidence: result.confidence || 0.5,
        config: result.config || {}
      },
      usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0
      }
    }
  }
  
  private parseAnthropicResponse(data: any): AIGenerationResult {
    const content = data.content?.[0]?.text || ''
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
        prompt_tokens: data.usage?.input_tokens || 0,
        completion_tokens: data.usage?.output_tokens || 0,
        total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      }
    }
  }
  
  private parseCustomResponse(data: any): AIGenerationResult {
    // Try to extract JSON from various response formats
    let result: any = {}
    
    if (typeof data === 'string') {
      const jsonMatch = data.match(/\{[\s\S]*\}/)
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    } else if (data.response || data.output || data.text) {
      const text = data.response || data.output || data.text
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    } else if (data.componentType) {
      // Already in expected format
      result = data
    }
    
    // Estimate tokens if not provided
    const estimatedTokens = Math.ceil((result.code?.length || 0) / 4)
    
    return {
      code: result.code || '',
      intent: {
        componentType: result.componentType || 'card',
        explanation: result.explanation || '',
        confidence: result.confidence || 0.5,
        config: result.config || {}
      },
      usage: {
        prompt_tokens: data.usage?.prompt_tokens || estimatedTokens,
        completion_tokens: data.usage?.completion_tokens || estimatedTokens,
        total_tokens: data.usage?.total_tokens || estimatedTokens * 2
      }
    }
  }
}