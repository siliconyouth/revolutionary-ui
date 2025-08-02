export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_providers: {
        Row: {
          id: string
          user_id: string
          provider: string
          api_key: string | null
          oauth_token: string | null
          oauth_refresh_token: string | null
          oauth_expires_at: string | null
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          api_key?: string | null
          oauth_token?: string | null
          oauth_refresh_token?: string | null
          oauth_expires_at?: string | null
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          api_key?: string | null
          oauth_token?: string | null
          oauth_refresh_token?: string | null
          oauth_expires_at?: string | null
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'free' | 'personal' | 'company' | 'enterprise'
          status: 'active' | 'canceled' | 'past_due'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: 'free' | 'personal' | 'company' | 'enterprise'
          status?: 'active' | 'canceled' | 'past_due'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'free' | 'personal' | 'company' | 'enterprise'
          status?: 'active' | 'canceled' | 'past_due'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      ai_usage: {
        Row: {
          id: string
          user_id: string
          provider: string
          model: string
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          cost: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          model: string
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          cost: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          model?: string
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
          cost?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}