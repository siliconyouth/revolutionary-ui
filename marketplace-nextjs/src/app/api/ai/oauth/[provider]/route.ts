import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// OAuth configuration for AI providers
const OAUTH_CONFIG = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/generative-language.retriever'],
    clientId: process.env.GOOGLE_AI_CLIENT_ID,
    clientSecret: process.env.GOOGLE_AI_CLIENT_SECRET
  },
  azure: {
    authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scopes: ['https://cognitiveservices.azure.com/.default'],
    clientId: process.env.AZURE_AI_CLIENT_ID,
    clientSecret: process.env.AZURE_AI_CLIENT_SECRET
  },
  cohere: {
    authUrl: 'https://dashboard.cohere.com/oauth/authorize',
    tokenUrl: 'https://dashboard.cohere.com/oauth/token',
    scopes: ['generate', 'embed'],
    clientId: process.env.COHERE_CLIENT_ID,
    clientSecret: process.env.COHERE_CLIENT_SECRET
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get('action')
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  // Verify user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.redirect('/auth/signin')
  }

  const config = OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG]
  if (!config) {
    return NextResponse.json(
      { error: 'Unsupported OAuth provider' },
      { status: 400 }
    )
  }

  // Initiate OAuth flow
  if (action === 'authorize') {
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      provider,
      timestamp: Date.now()
    })).toString('base64')

    const authParams = new URLSearchParams({
      client_id: config.clientId!,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/ai/oauth/${provider}`,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent'
    })

    return NextResponse.redirect(`${config.authUrl}?${authParams}`)
  }

  // Handle OAuth callback
  if (code && state) {
    try {
      // Decode and verify state
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
      
      if (stateData.userId !== user.id) {
        throw new Error('State mismatch')
      }

      // Exchange code for tokens
      const tokenResponse = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/ai/oauth/${provider}`,
          client_id: config.clientId!,
          client_secret: config.clientSecret!
        })
      })

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text()
        console.error('Token exchange failed:', error)
        throw new Error('Failed to exchange authorization code')
      }

      const tokens = await tokenResponse.json()

      // Save tokens to database
      const { error: dbError } = await supabase
        .from('ai_providers')
        .upsert({
          user_id: user.id,
          provider,
          oauth_token: tokens.access_token,
          oauth_refresh_token: tokens.refresh_token,
          oauth_expires_at: tokens.expires_in 
            ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            : null,
          model: provider === 'google' ? 'gemini-pro' : 'default',
          is_active: true,
          settings: {
            token_type: tokens.token_type,
            scope: tokens.scope
          }
        })

      if (dbError) {
        console.error('Failed to save OAuth tokens:', dbError)
        throw dbError
      }

      // Redirect back to AI config page with success
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ai-config?oauth=success&provider=${provider}`
      )
    } catch (error) {
      console.error('OAuth callback error:', error)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/ai-config?oauth=error&provider=${provider}`
      )
    }
  }

  return NextResponse.json(
    { error: 'Invalid OAuth flow' },
    { status: 400 }
  )
}