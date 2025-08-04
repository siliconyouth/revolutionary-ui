import fs from 'fs'
import path from 'path'
import { config } from '@dotenvx/dotenvx'

export function loadEnvVariables(): void {
  // Use only the root .env.local as the central environment file
  const rootEnvPath = path.resolve(path.join(__dirname, '../../../.env.local'))
  
  // Check if we're in a subdirectory and adjust path accordingly
  const possiblePaths = [
    rootEnvPath,
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '../.env.local'),
    path.join(process.cwd(), '../../.env.local')
  ]

  let loaded = false
  
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      try {
        config({ 
          path: envPath,
          override: false, // Don't override existing env vars
          debug: false // Set to true for debugging
        })
        loaded = true
        console.log(`✅ Loaded environment from: ${path.relative(process.cwd(), envPath)}`)
        break
      } catch (error) {
        // Continue to next path if this one fails
      }
    }
  }

  // Also load from process environment (for CI/CD)
  if (!loaded && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Warning: No .env.local file found. Using environment variables from shell.')
  }
}