import { NextResponse } from 'next/server'

export async function GET() {
  const env = {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    },
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing',
      secretKey: process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing',
      prices: {
        personalMonthly: process.env.STRIPE_PRICE_PERSONAL_MONTHLY ? '✅ Set' : '❌ Missing',
        personalYearly: process.env.STRIPE_PRICE_PERSONAL_YEARLY ? '✅ Set' : '❌ Missing',
        companyMonthly: process.env.STRIPE_PRICE_COMPANY_MONTHLY ? '✅ Set' : '❌ Missing',
        companyYearly: process.env.STRIPE_PRICE_COMPANY_YEARLY ? '✅ Set' : '❌ Missing',
        enterpriseMonthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY ? '✅ Set' : '❌ Missing',
      }
    },
    app: {
      url: process.env.NEXT_PUBLIC_APP_URL ? '✅ Set' : '❌ Missing',
    }
  }
  
  return NextResponse.json(env, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  })
}