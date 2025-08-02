import Anthropic from '@anthropic-ai/sdk'
import { AIProvider, ComponentIntent } from '../AIComponentGenerator'

export class AnthropicProvider implements AIProvider {
  name = 'anthropic'
  private client: Anthropic | null = null
  private model: string = 'claude-3-opus-20240229'

  constructor(apiKey?: string, model?: string) {
    if (apiKey) {
      this.client = new Anthropic({ apiKey })
    }
    if (model) {
      this.model = model
    }
  }

  setApiKey(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  setModel(model: string) {
    this.model = model
  }

  async generateComponentConfig(prompt: string): Promise<ComponentIntent> {
    if (!this.client) {
      throw new Error('Anthropic API key not configured')
    }

    const systemPrompt = `You are an AI that generates UI component configurations for Revolutionary UI Factory.
    
    Available component types:
    - dashboard: Complex dashboard with widgets (stats, charts, tables, etc.)
    - dataTable: Data table with sorting, filtering, pagination
    - form: Form with various field types and validation
    - kanban: Kanban board with drag-and-drop
    - chart: Various chart types (line, bar, pie, etc.)
    - calendar: Calendar with events
    - timeline: Timeline of events
    - card: Card component with title, content, actions
    - commandPalette: Command palette for quick actions
    - navbar: Navigation bar with menu items
    - chat: Chat interface
    - productCard: E-commerce product card
    - bottomSheet: Mobile-style bottom sheet
    - workflow: Visual workflow builder
    
    Analyze the user's prompt and return a JSON object with:
    {
      "componentType": "the most appropriate component type",
      "config": { /* component-specific configuration */ },
      "explanation": "Brief explanation of what was created",
      "confidence": 0.0-1.0 confidence score
    }
    
    Return ONLY valid JSON, no other text.`

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Extract JSON from response
    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    
    return {
      componentType: result.componentType || 'card',
      config: result.config || {},
      explanation: result.explanation || 'Generated component from prompt',
      confidence: result.confidence || 0.5
    }
  }
}

export const ANTHROPIC_MODELS = [
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', context: 200000 },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', context: 200000 },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', context: 200000 },
  { id: 'claude-2.1', name: 'Claude 2.1', context: 200000 },
  { id: 'claude-2.0', name: 'Claude 2.0', context: 100000 }
]