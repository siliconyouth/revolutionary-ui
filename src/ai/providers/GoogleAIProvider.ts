import { GoogleGenerativeAI } from '@google/generative-ai'
import { AIProvider, ComponentIntent } from '../AIComponentGenerator'

export class GoogleAIProvider implements AIProvider {
  name = 'google'
  private client: GoogleGenerativeAI | null = null
  private model: string = 'gemini-pro'

  constructor(apiKey?: string, model?: string) {
    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey)
    }
    if (model) {
      this.model = model
    }
  }

  setApiKey(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey)
  }

  setModel(model: string) {
    this.model = model
  }

  async generateComponentConfig(prompt: string): Promise<ComponentIntent> {
    if (!this.client) {
      throw new Error('Google AI API key not configured')
    }

    const model = this.client.getGenerativeModel({ model: this.model })

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
    
    User prompt: ${prompt}
    
    Return ONLY valid JSON, no other text.`

    const result = await model.generateContent(systemPrompt)
    const response = result.response.text()
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}
    
    return {
      componentType: parsed.componentType || 'card',
      config: parsed.config || {},
      explanation: parsed.explanation || 'Generated component from prompt',
      confidence: parsed.confidence || 0.5
    }
  }
}

export const GOOGLE_AI_MODELS = [
  { id: 'gemini-pro', name: 'Gemini Pro', context: 30720 },
  { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', context: 12288 }
]