#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const print = {
  title: (text) => console.log(`\n${colors.bright}${colors.blue}${text}${colors.reset}`),
  section: (text) => console.log(`\n${colors.bright}${colors.cyan}${text}${colors.reset}`),
  feature: (text) => console.log(`${colors.green}✅ ${text}${colors.reset}`),
  disabled: (text) => console.log(`${colors.dim}❌ ${text}${colors.reset}`),
  info: (text) => console.log(`   ${colors.dim}${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`),
};

// Load environment
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  print.error('No .env.local file found!');
  process.exit(1);
}

const env = dotenv.config({ path: envPath }).parsed || {};

// Feature definitions
const features = {
  core: {
    title: '🏭 Core Platform Features',
    items: [
      {
        name: 'Database & Authentication',
        enabled: () => env.DATABASE_URL && env.NEXTAUTH_URL,
        description: 'PostgreSQL database with Prisma ORM and NextAuth.js',
        capabilities: [
          'User management with roles (USER, CREATOR, MODERATOR, ADMIN)',
          'Session-based authentication',
          'Secure password handling',
          'Account linking'
        ]
      },
      {
        name: 'Supabase Backend',
        enabled: () => env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        description: 'Supabase BaaS with real-time capabilities',
        capabilities: [
          'Real-time database subscriptions',
          'Row-level security',
          'Storage buckets for file uploads',
          'Edge functions support'
        ]
      },
      {
        name: 'Component Marketplace',
        enabled: () => env.ENABLE_MARKETPLACE === 'true',
        description: 'Full e-commerce marketplace for UI components',
        capabilities: [
          'Browse and search components',
          'Purchase premium components',
          'Publish your own components',
          'Version control and updates',
          'Review and rating system'
        ]
      },
      {
        name: 'Team Collaboration',
        enabled: () => env.ENABLE_TEAM_FEATURES === 'true',
        description: 'Team management and collaboration features',
        capabilities: [
          'Create and manage teams',
          'Role-based permissions',
          'Share components within teams',
          'Collaborative projects',
          'Activity tracking'
        ]
      }
    ]
  },
  ai: {
    title: '🤖 AI & Generation Features',
    items: [
      {
        name: 'OpenAI Integration',
        enabled: () => env.OPENAI_API_KEY && env.OPENAI_API_KEY.startsWith('sk-'),
        description: 'GPT-4 and GPT-3.5 for component generation',
        capabilities: [
          'Natural language to component',
          'Code completion and suggestions',
          'Component optimization',
          'Documentation generation',
          'DALL-E image generation'
        ]
      },
      {
        name: 'Anthropic Claude',
        enabled: () => env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY.startsWith('sk-ant-'),
        description: 'Claude 3 models for safe AI generation',
        capabilities: [
          'Advanced code understanding',
          '200k token context window',
          'Constitutional AI safety',
          'Complex component generation'
        ]
      },
      {
        name: 'Google AI (Gemini)',
        enabled: () => env.GOOGLE_AI_API_KEY,
        description: 'Google Gemini for multimodal AI',
        capabilities: [
          'Code generation',
          'Image understanding',
          'Multi-turn conversations',
          'Free tier available'
        ]
      },
      {
        name: 'Google Generative AI',
        enabled: () => env.GOOGLE_GENERATIVE_AI_API_KEY,
        description: 'Additional Google AI models',
        capabilities: [
          'PaLM API access',
          'Embeddings generation',
          'Text generation',
          'Code understanding'
        ]
      },
      {
        name: 'Groq Fast Inference',
        enabled: () => env.GROQ_API_KEY && env.GROQ_API_KEY.startsWith('gsk_'),
        description: 'Ultra-fast LPU inference',
        capabilities: [
          'Mixtral 8x7B model',
          'Llama 2 70B model',
          'Sub-second response times',
          'Cost-effective generation'
        ]
      },
      {
        name: 'Mistral AI',
        enabled: () => env.MISTRAL_API_KEY,
        description: 'European AI models',
        capabilities: [
          'Mistral Large model',
          'Code generation',
          'JSON mode support',
          'Function calling'
        ]
      },
      {
        name: 'DeepSeek AI',
        enabled: () => env.DEEPSEEK_API_KEY,
        description: 'DeepSeek coding models',
        capabilities: [
          'Specialized code generation',
          'Code understanding',
          'Bug detection',
          'Code optimization'
        ]
      },
      {
        name: 'Together AI',
        enabled: () => env.TOGETHER_API_KEY,
        description: 'Access to 50+ open models',
        capabilities: [
          'Llama 2 & CodeLlama',
          'Stable Diffusion XL',
          'Custom model hosting',
          'Fine-tuning support'
        ]
      },
      {
        name: 'Replicate',
        enabled: () => env.REPLICATE_API_TOKEN,
        description: 'Run AI models in the cloud',
        capabilities: [
          'Thousands of models',
          'Image generation',
          'Audio generation',
          'Custom model deployment'
        ]
      },
      {
        name: 'ElevenLabs',
        enabled: () => env.ELEVENLABS_API_KEY,
        description: 'AI voice synthesis',
        capabilities: [
          'Text-to-speech',
          'Voice cloning',
          'Multiple languages',
          'Emotion control'
        ]
      }
    ]
  },
  integrations: {
    title: '🔌 Third-Party Integrations',
    items: [
      {
        name: 'Stripe Payments',
        enabled: () => env.STRIPE_SECRET_KEY && env.STRIPE_PUBLISHABLE_KEY,
        description: 'Payment processing for marketplace',
        capabilities: [
          'Secure payment processing',
          'Subscription management',
          'Invoice generation',
          'Webhook handling',
          'Revenue analytics'
        ]
      },
      {
        name: 'GitHub OAuth',
        enabled: () => env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET,
        description: 'GitHub authentication and integration',
        capabilities: [
          'Social login',
          'Repository access',
          'User profile import',
          'Gist integration'
        ]
      },
      {
        name: 'Google OAuth',
        enabled: () => env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
        description: 'Google authentication',
        capabilities: [
          'Social login',
          'Google Drive integration',
          'User profile import',
          'Calendar access'
        ]
      },
      {
        name: 'Firecrawl',
        enabled: () => env.FIRECRAWL_API_KEY,
        description: 'Web scraping and data extraction',
        capabilities: [
          'Website content extraction',
          'Structured data parsing',
          'Sitemap generation',
          'Change detection'
        ]
      },
      {
        name: 'Email Service',
        enabled: () => env.SMTP_HOST && env.SMTP_USER,
        description: 'Email sending capabilities',
        capabilities: [
          'Transactional emails',
          'Welcome emails',
          'Password reset',
          'Notifications'
        ]
      },
      {
        name: 'Google Analytics',
        enabled: () => env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
        description: 'Website analytics',
        capabilities: [
          'User behavior tracking',
          'Conversion tracking',
          'Custom events',
          'Real-time analytics'
        ]
      },
      {
        name: 'Sentry Monitoring',
        enabled: () => env.SENTRY_DSN,
        description: 'Error tracking and monitoring',
        capabilities: [
          'Error capture',
          'Performance monitoring',
          'Release tracking',
          'User feedback'
        ]
      },
      {
        name: 'AWS S3 Storage',
        enabled: () => env.S3_BUCKET_NAME && env.S3_ACCESS_KEY_ID,
        description: 'Cloud file storage',
        capabilities: [
          'Component asset storage',
          'Image optimization',
          'CDN distribution',
          'Backup storage'
        ]
      }
    ]
  },
  features: {
    title: '⚡ Feature Flags',
    items: [
      {
        name: 'Private NPM Registry',
        enabled: () => env.ENABLE_PRIVATE_REGISTRY === 'true',
        description: 'Host private component packages',
        capabilities: [
          'Scoped packages (@company/*)',
          'Access token management',
          'Version control',
          'Download statistics'
        ]
      },
      {
        name: 'AI Generation',
        enabled: () => env.ENABLE_AI_GENERATION === 'true',
        description: 'AI-powered component generation',
        capabilities: [
          'Natural language prompts',
          'Multi-provider support',
          'Streaming responses',
          'Context-aware suggestions'
        ]
      }
    ]
  }
};

// Main function
function showAvailableFeatures() {
  print.title('🚀 Revolutionary UI - Available Features & Functionalities');
  print.info(`Based on your .env.local configuration\n`);

  let totalEnabled = 0;
  let totalFeatures = 0;

  for (const [key, category] of Object.entries(features)) {
    print.section(category.title);
    
    for (const feature of category.items) {
      totalFeatures++;
      const isEnabled = feature.enabled();
      
      if (isEnabled) {
        totalEnabled++;
        print.feature(feature.name);
        print.info(feature.description);
        
        if (feature.capabilities && feature.capabilities.length > 0) {
          for (const capability of feature.capabilities) {
            print.info(`  • ${capability}`);
          }
        }
      } else {
        print.disabled(feature.name);
        print.info(`Configure to enable: ${feature.description}`);
      }
      console.log(); // Empty line
    }
  }

  // Summary
  print.title('📊 Configuration Summary');
  console.log(`\nEnabled Features: ${colors.green}${totalEnabled}/${totalFeatures}${colors.reset}`);
  
  // Recommendations
  const missingCore = features.core.items.filter(f => !f.enabled());
  const missingAI = features.ai.items.filter(f => !f.enabled());
  
  if (missingCore.length > 0 || missingAI.length > 0) {
    print.section('💡 Recommendations');
    
    if (missingCore.length > 0) {
      print.warning('Consider enabling these core features:');
      missingCore.forEach(f => print.info(`  • ${f.name}`));
    }
    
    if (missingAI.length > 0 && missingAI.length <= 5) {
      print.info('\nOptional AI providers not configured:');
      missingAI.forEach(f => print.info(`  • ${f.name}`));
    }
  }

  // Quick start
  print.section('🎯 Quick Start Commands');
  print.info('Start the development server:');
  print.info('  cd marketplace-nextjs && npm run dev\n');
  print.info('View your database:');
  print.info('  npm run prisma:studio\n');
  print.info('Generate a component:');
  print.info('  npx revolutionary-ui generate\n');
}

// Run
if (require.main === module) {
  showAvailableFeatures();
}

module.exports = { showAvailableFeatures };