import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AIService } from '@/lib/ai/ai-service'

export async function POST(req: Request) {
  try {
    const { provider, apiKey, model } = await req.json()

    if (!provider || !apiKey || !model) {
      return NextResponse.json(
        { error: 'Provider, API key, and model are required' },
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

    // Test the API key
    const aiService = new AIService()
    const isValid = await aiService.testAPIKey(provider, apiKey, model)

    return NextResponse.json({
      success: true,
      valid: isValid
    })
  } catch (error: any) {
    console.error('API key test error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to test API key',
        message: error.message 
      },
      { status: 500 }
    )
  }
}