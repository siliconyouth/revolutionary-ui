import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !anonKey) {
    console.error('Supabase environment variables missing:', {
      url: url ? 'Set' : 'Missing',
      anonKey: anonKey ? 'Set' : 'Missing'
    })
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
    )
  }

  return createServerClient(url, anonKey, {
    cookies: {
      async get(name: string) {
        return (await cookieStore).get(name)?.value
      },
      async set(name: string, value: string, options: any) {
        ;(await cookieStore).set({ name, value, ...options })
      },
      async remove(name: string, options: any) {
        ;(await cookieStore).set({ name, value: '', ...options })
      },
    },
  })
}