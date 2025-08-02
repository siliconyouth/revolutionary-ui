import OpenAI from 'openai'
import { AIProvider, ComponentIntent } from '../AIComponentGenerator'

export class OpenAIProvider implements AIProvider {
  name = 'openai'
  private client: OpenAI | null = null
  private model: string = 'gpt-4-turbo-preview'

  constructor(apiKey?: string, model?: string) {
    if (apiKey) {
      this.client = new OpenAI({ apiKey })
    }
    if (model) {
      this.model = model
    }
  }

  setApiKey(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  setModel(model: string) {
    this.model = model
  }

  async generateComponentConfig(prompt: string): Promise<ComponentIntent> {
    if (!this.client) {
      throw new Error('OpenAI API key not configured')
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
    }`

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    
    return {
      componentType: result.componentType || 'card',
      config: result.config || {},
      explanation: result.explanation || 'Generated component from prompt',
      confidence: result.confidence || 0.5
    }
  }
}

export const OPENAI_MODELS = [
  { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', context: 128000 },
  { id: 'gpt-4', name: 'GPT-4', context: 8192 },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', context: 16385 },
  { id: 'gpt-3.5-turbo-0125', name: 'GPT-3.5 Turbo Latest', context: 16385 }
]