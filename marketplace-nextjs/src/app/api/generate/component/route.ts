import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canUseFeature } from '@/lib/stripe/plans'
import { AIService } from '@/lib/ai/ai-service'

// Token costs per 1000 tokens (in USD)
const TOKEN_COSTS = {
  openai: {
    'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
  },
  anthropic: {
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
  },
  google: {
    'gemini-pro': { input: 0.00025, output: 0.0005 },
    'gemini-pro-vision': { input: 0.00025, output: 0.0005 }
  },
  groq: {
    'mixtral-8x7b-32768': { input: 0.0005, output: 0.0005 },
    'llama2-70b-4096': { input: 0.0008, output: 0.0008 }
  },
  mistral: {
    'mistral-large-latest': { input: 0.008, output: 0.024 },
    'mistral-medium-latest': { input: 0.0027, output: 0.0081 },
    'mistral-small-latest': { input: 0.002, output: 0.006 }
  },
  mock: {
    'mock': { input: 0, output: 0 }
  }
}

function calculateTokenCost(
  provider: string, 
  model: string, 
  usage: { prompt_tokens: number; completion_tokens: number }
): number {
  const costs = TOKEN_COSTS[provider as keyof typeof TOKEN_COSTS]?.[model]
  if (!costs) return 0

  const inputCost = (usage.prompt_tokens / 1000) * costs.input
  const outputCost = (usage.completion_tokens / 1000) * costs.output
  
  return Math.round((inputCost + outputCost) * 1000000) / 1000000 // Round to 6 decimal places
}

export async function POST(req: Request) {
  try {
    const { prompt, framework, provider } = await req.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Verify user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single()

    const userPlan = subscription?.plan || 'free'

    // Check usage limits
    const { data: usageCheck } = await supabase
      .rpc('check_usage_limit', {
        p_user_id: user.id,
        p_usage_type: 'component_generation'
      })

    if (!usageCheck?.[0]?.can_use) {
      return NextResponse.json(
        { 
          error: 'Usage limit exceeded',
          limit: usageCheck?.[0]?.limit_amount,
          used: usageCheck?.[0]?.used,
          upgrade_url: '/pricing'
        },
        { status: 429 }
      )
    }

    // Get user's AI provider configuration
    const { data: aiProvider } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', provider || 'openai')
      .eq('is_active', true)
      .single()

    if (!aiProvider && provider !== 'mock') {
      return NextResponse.json(
        { 
          error: 'AI provider not configured',
          message: 'Please configure your AI provider in dashboard settings',
          configure_url: '/dashboard/ai-config'
        },
        { status: 400 }
      )
    }

    // Use real AI service
    const aiService = new AIService()
    
    let result
    try {
      if (provider === 'mock' || !aiProvider) {
        // Use mock implementation if no provider configured
        const mockResponse = generateMockComponent(prompt, framework || 'react')
        result = {
          code: mockResponse.code,
          intent: mockResponse.intent,
          usage: {
            prompt_tokens: 100,
            completion_tokens: 200,
            total_tokens: 300
          }
        }
      } else {
        // Use real AI provider
        const generationOptions: any = {
          provider: aiProvider.provider,
          model: aiProvider.model,
          apiKey: aiProvider.api_key!,
          prompt,
          framework: framework || 'react',
          temperature: 0.7,
          maxTokens: 2000
        }

        // Add custom settings if it's a custom provider
        if (aiProvider.provider.startsWith('custom-')) {
          generationOptions.customSettings = {
            apiEndpoint: aiProvider.settings?.apiEndpoint,
            headers: aiProvider.settings?.headers || {},
            requestFormat: aiProvider.settings?.requestFormat || 'openai',
            responseFormat: aiProvider.settings?.responseFormat || 'openai',
            systemPrompt: aiProvider.settings?.systemPrompt
          }
        }

        result = await aiService.generateComponent(generationOptions)
      }
    } catch (aiError: any) {
      console.error('AI generation error:', aiError)
      return NextResponse.json(
        { 
          error: 'Failed to generate component',
          message: aiError.message,
          details: aiError.response?.data || aiError.toString()
        },
        { status: 500 }
      )
    }

    // Calculate token cost
    const tokenCost = calculateTokenCost(provider || 'mock', aiProvider?.model || 'mock', result.usage)

    // Record usage
    const { data: recorded } = await supabase
      .rpc('record_usage', {
        p_user_id: user.id,
        p_usage_type: 'component_generation',
        p_metadata: {
          prompt,
          framework,
          provider: provider || 'mock',
          component_type: result.intent.componentType,
          tokens: result.usage.total_tokens,
          cost: tokenCost
        }
      })

    if (!recorded) {
      console.error('Failed to record usage')
    }

    // Record AI usage for billing
    await supabase
      .from('ai_usage')
      .insert({
        user_id: user.id,
        provider: provider || 'mock',
        model: aiProvider?.model || 'mock',
        prompt_tokens: result.usage.prompt_tokens,
        completion_tokens: result.usage.completion_tokens,
        total_tokens: result.usage.total_tokens,
        cost: tokenCost
      })

    // Save generated component
    await supabase
      .from('generated_components')
      .insert({
        user_id: user.id,
        prompt,
        component_type: result.intent.componentType,
        framework: framework || 'react',
        code: result.code,
        config: result.intent.config,
        ai_provider: provider || 'mock',
        ai_model: aiProvider?.model || 'mock',
        confidence: result.intent.confidence
      })

    return NextResponse.json({
      success: true,
      code: result.code,
      intent: result.intent,
      usage: {
        used: usageCheck?.[0]?.used + 1,
        limit: usageCheck?.[0]?.limit_amount,
        tokens: result.usage.total_tokens,
        cost: tokenCost
      }
    })
  } catch (error: any) {
    console.error('Component generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateMockComponent(prompt: string, framework: string) {
  const lowerPrompt = prompt.toLowerCase()
  
  let componentType = 'card'
  let explanation = 'Created a generic card component'
  let confidence = 0.5
  let config: any = {
    title: 'Card Title',
    content: 'Card content'
  }
  
  if (lowerPrompt.includes('dashboard')) {
    componentType = 'dashboard'
    explanation = 'Created a dashboard with stats and chart widgets'
    confidence = 0.9
    config = {
      widgets: [
        {
          id: 'stats1',
          type: 'stats',
          config: {
            value: 125600,
            label: 'Total Revenue',
            change: 12.5,
            trend: 'up'
          }
        }
      ]
    }
  } else if (lowerPrompt.includes('form') || lowerPrompt.includes('contact')) {
    componentType = 'form'
    explanation = 'Created a contact form with name, email, and message fields'
    confidence = 0.85
    config = {
      fields: [
        { id: 'name', name: 'name', label: 'Name', type: 'text', required: true },
        { id: 'email', name: 'email', label: 'Email', type: 'email', required: true },
        { id: 'message', name: 'message', label: 'Message', type: 'textarea', required: true }
      ]
    }
  } else if (lowerPrompt.includes('table') || lowerPrompt.includes('list')) {
    componentType = 'dataTable'
    explanation = 'Created a data table for displaying information'
    confidence = 0.8
    config = {
      columns: [
        { id: 'id', header: 'ID', accessorKey: 'id' },
        { id: 'name', header: 'Name', accessorKey: 'name' },
        { id: 'email', header: 'Email', accessorKey: 'email' },
        { id: 'status', header: 'Status', accessorKey: 'status' }
      ],
      data: []
    }
  }
  
  const code = generateCode(componentType, config, framework)
  
  return {
    component: { type: componentType, config },
    code,
    intent: {
      componentType,
      config,
      explanation,
      confidence
    }
  }
}

function generateCode(componentType: string, config: any, framework: string): string {
  const componentName = componentType.charAt(0).toUpperCase() + componentType.slice(1)
  const configString = JSON.stringify(config, null, 2)
  
  switch (framework) {
    case 'react':
      return `import { setup } from '@vladimirdukelic/revolutionary-ui-factory'

const ui = setup()

export function My${componentName}() {
  const ${componentName} = ui.create${componentName}(${configString})
  
  return <${componentName} />
}`
    
    case 'vue':
      return `<template>
  <${componentName} />
</template>

<script setup>
import { setup } from '@vladimirdukelic/revolutionary-ui-factory'

const ui = setup({ framework: 'vue' })
const ${componentName} = ui.create${componentName}(${configString})
</script>`
    
    default:
      return `// ${framework} code generation not implemented yet`
  }
}