import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'AI test endpoint temporarily disabled for production build' },
    { status: 503 }
  );
}

/* Original implementation commented out for production build
import { 
  OpenAIProvider, 
  AnthropicProvider, 
  GeminiProvider, 
  MistralProvider,
  AIProviderConfig 
} from '../../../../src/ai/providers'

export async function POST(request: NextRequest) {
  try {
    const { provider, config } = await request.json()
    
    if (!config.apiKey) {
      return NextResponse.json({
        success: false,
        message: 'API key is required'
      })
    }
    
    const startTime = Date.now()
    let aiProvider: any
    
    // Create provider instance
    switch (provider) {
      case 'OpenAI':
        aiProvider = new OpenAIProvider(config as AIProviderConfig)
        break
      case 'Anthropic':
        aiProvider = new AnthropicProvider(config as AIProviderConfig)
        break
      case 'Google Gemini':
        aiProvider = new GeminiProvider(config as AIProviderConfig)
        break
      case 'Mistral':
        aiProvider = new MistralProvider(config as AIProviderConfig)
        break
      default:
        return NextResponse.json({
          success: false,
          message: 'Unknown provider'
        })
    }
    
    // Test with a simple prompt
    const testPrompt = 'Generate a simple React button component that says "Hello World".'
    
    try {
      const response = await aiProvider.generateComponent(testPrompt, {
        framework: 'React',
        componentType: 'button'
      })
      
      const responseTime = Date.now() - startTime
      
      // Verify response has content
      if (!response.content || response.content.length < 10) {
        throw new Error('Invalid response from AI provider')
      }
      
      return NextResponse.json({
        success: true,
        message: 'Connection successful!',
        model: response.model,
        responseTime,
        usage: response.usage
      })
    } catch (providerError: any) {
      console.error(`Provider ${provider} test failed:`, providerError)
      
      // Parse error message
      let errorMessage = 'Connection failed'
      
      if (providerError.message.includes('401') || providerError.message.includes('Unauthorized')) {
        errorMessage = 'Invalid API key'
      } else if (providerError.message.includes('429')) {
        errorMessage = 'Rate limit exceeded'
      } else if (providerError.message.includes('403')) {
        errorMessage = 'Access forbidden - check your API key permissions'
      } else if (providerError.message.includes('timeout')) {
        errorMessage = 'Request timed out'
      } else if (providerError.message) {
        errorMessage = providerError.message
      }
      
      return NextResponse.json({
        success: false,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? providerError.stack : undefined
      })
    }
  } catch (error: any) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Test failed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
*/