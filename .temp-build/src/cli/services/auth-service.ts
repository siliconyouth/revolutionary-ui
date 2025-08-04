import { createClient } from '@supabase/supabase-js'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { loadEnvVariables } from '../utils/env-loader'

// Load environment variables
loadEnvVariables()

// These should come from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export interface AuthResponse {
  user: {
    id: string
    email: string
    name: string
    company?: string
    plan?: string
    createdAt: string
  }
  token: string
  refreshToken: string
}

export class AuthService {
  private supabase

  constructor() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.')
    }
    
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }

  async register(email: string, password: string, name: string, company?: string): Promise<AuthResponse> {
    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            company: company || null
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Registration failed')

      // Create user profile in database
      const { error: profileError } = await this.supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: name,
          company: company || null,
          plan: 'free',
          created_at: new Date().toISOString()
        })

      if (profileError) {
        console.warn('Profile creation failed:', profileError)
        // Continue anyway - profile can be created later
      }

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          name: name,
          company: company,
          plan: 'free',
          createdAt: authData.user.created_at
        },
        token: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token || ''
      }
    } catch (error: any) {
      if (error.message?.includes('already registered')) {
        throw new Error('This email is already registered. Please login instead.')
      }
      throw error
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Login failed')

      // Get user profile
      const { data: profile } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          name: profile?.full_name || authData.user.user_metadata?.full_name || 'User',
          company: profile?.company || authData.user.user_metadata?.company,
          plan: profile?.plan || 'free',
          createdAt: authData.user.created_at
        },
        token: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token || ''
      }
    } catch (error: any) {
      if (error.message?.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password')
      }
      throw error
    }
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut()
  }

  async refreshSession(refreshToken: string): Promise<{ token: string; refreshToken: string } | null> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken
      })

      if (error || !data.session) return null

      return {
        token: data.session.access_token,
        refreshToken: data.session.refresh_token
      }
    } catch {
      return null
    }
  }

  async getUser(token: string): Promise<SupabaseUser | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token)
      if (error || !user) return null
      return user
    } catch {
      return null
    }
  }
}