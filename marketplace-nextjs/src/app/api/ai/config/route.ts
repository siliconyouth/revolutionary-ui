import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// Store configuration in .env.local file
const ENV_FILE_PATH = path.join(process.cwd(), '.env.local')

export async function POST(request: NextRequest) {
  try {
    const { providers } = await request.json()
    
    // Build environment variables
    const envVars: Record<string, string> = {}
    
    for (const provider of providers) {
      if (provider.enabled && provider.apiKey) {
        switch (provider.name) {
          case 'OpenAI':
            envVars.OPENAI_API_KEY = provider.apiKey
            if (provider.organization) {
              envVars.OPENAI_ORG_ID = provider.organization
            }
            break
          case 'Anthropic':
            envVars.ANTHROPIC_API_KEY = provider.apiKey
            break
          case 'Google Gemini':
            envVars.GOOGLE_AI_API_KEY = provider.apiKey
            break
          case 'Mistral':
            envVars.MISTRAL_API_KEY = provider.apiKey
            break
        }
      }
    }
    
    // Read existing .env.local
    let envContent = ''
    try {
      envContent = await fs.readFile(ENV_FILE_PATH, 'utf-8')
    } catch (e) {
      // File doesn't exist, create new one
    }
    
    // Update or add AI provider keys
    const lines = envContent.split('\n')
    const updatedLines: string[] = []
    const processedKeys = new Set<string>()
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        updatedLines.push(line)
        continue
      }
      
      const [key] = trimmedLine.split('=')
      if (key && envVars[key]) {
        updatedLines.push(`${key}=${envVars[key]}`)
        processedKeys.add(key)
      } else if (!key || !['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_AI_API_KEY', 'MISTRAL_API_KEY', 'OPENAI_ORG_ID'].includes(key)) {
        updatedLines.push(line)
      }
    }
    
    // Add new keys
    for (const [key, value] of Object.entries(envVars)) {
      if (!processedKeys.has(key)) {
        updatedLines.push(`${key}=${value}`)
      }
    }
    
    // Write back to file
    await fs.writeFile(ENV_FILE_PATH, updatedLines.join('\n'))
    
    // Update process.env for current runtime
    for (const [key, value] of Object.entries(envVars)) {
      process.env[key] = value
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to save AI config:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return current configuration (without exposing API keys)
    const config = {
      openai: {
        enabled: !!process.env.OPENAI_API_KEY,
        hasKey: !!process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORG_ID || ''
      },
      anthropic: {
        enabled: !!process.env.ANTHROPIC_API_KEY,
        hasKey: !!process.env.ANTHROPIC_API_KEY
      },
      gemini: {
        enabled: !!process.env.GOOGLE_AI_API_KEY,
        hasKey: !!process.env.GOOGLE_AI_API_KEY
      },
      mistral: {
        enabled: !!process.env.MISTRAL_API_KEY,
        hasKey: !!process.env.MISTRAL_API_KEY
      }
    }
    
    return NextResponse.json({ success: true, config })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}