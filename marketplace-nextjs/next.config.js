/** @type {import('next').NextConfig} */
const path = require('path');
const { config } = require('@dotenvx/dotenvx');

// Load environment variables from the root .env.local file
const envPath = path.resolve(__dirname, '../.env.local');
if (require('fs').existsSync(envPath)) {
  config({ 
    path: envPath, 
    override: false,
    debug: false 
  });
  console.log('✅ Loaded environment from root .env.local');
} else {
  console.warn('⚠️  Root .env.local not found, using shell environment variables');
}

const nextConfig = {
  experimental: {
    externalDir: true,
  },
  
  // Share environment variables from root
  env: {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Database URLs for Prisma
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_PRISMA: process.env.DATABASE_URL_PRISMA,
    DIRECT_URL: process.env.DIRECT_URL,
    
    // Auth
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    
    // OAuth Providers
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    
    // Stripe
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    
    // AI Providers
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    
    // Feature Flags
    NEXT_PUBLIC_ENABLE_MARKETPLACE: process.env.NEXT_PUBLIC_ENABLE_MARKETPLACE,
    NEXT_PUBLIC_ENABLE_AI_GENERATION: process.env.NEXT_PUBLIC_ENABLE_AI_GENERATION,
    NEXT_PUBLIC_ENABLE_COMMUNITY_SUBMISSIONS: process.env.NEXT_PUBLIC_ENABLE_COMMUNITY_SUBMISSIONS,
  },
  
  // Other Next.js configurations
  images: {
    domains: ['localhost', 'supabase.co'],
  },
};

module.exports = nextConfig;
