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
  success: (text) => console.log(`${colors.green}✅ ${text}${colors.reset}`),
  info: (text) => console.log(`${colors.dim}${text}${colors.reset}`),
};

// Import the complete definitions
const { ENV_COMPLETE_DEFINITIONS } = require('./env-definitions-complete');

// Old definitions kept for backward compatibility
const OLD_ENV_COMPLETE_DEFINITIONS = {
  // Core Database & Authentication
  'core-database': {
    title: 'Core Database Configuration',
    vars: {
      DATABASE_URL: {
        description: 'PostgreSQL connection string for migrations',
        example: 'postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres',
        required: true
      },
      DATABASE_URL_PRISMA: {
        description: 'PostgreSQL pooled connection string for queries',
        example: 'postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1',
        required: true
      },
      DIRECT_URL: {
        description: 'Direct database URL for migrations',
        example: 'postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres',
        required: true
      },
      DATABASE_POOL_MIN: {
        description: 'Minimum database pool connections',
        example: '2',
        required: false
      },
      DATABASE_POOL_MAX: {
        description: 'Maximum database pool connections',
        example: '10',
        required: false
      }
    }
  },
  
  'supabase': {
    title: 'Supabase Configuration',
    vars: {
      NEXT_PUBLIC_SUPABASE_URL: {
        description: 'Your Supabase project URL',
        example: 'https://[YOUR-PROJECT-REF].supabase.co',
        required: true
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        description: 'Supabase anonymous key (safe for browser)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: true
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        description: 'Supabase service role key (server-side only)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: false
      },
      SUPABASE_JWT_SECRET: {
        description: 'Supabase JWT secret for token verification',
        example: 'your-super-secret-jwt-token',
        required: false
      }
    }
  },

  'authentication': {
    title: 'Authentication Configuration',
    vars: {
      NEXTAUTH_URL: {
        description: 'Canonical URL of your site',
        example: 'http://localhost:3000',
        required: true
      },
      NEXTAUTH_SECRET: {
        description: 'Random string for JWT encryption',
        example: 'your-nextauth-secret-key',
        required: true
      },
      AUTH_TRUST_HOST: {
        description: 'Trust host header for proxy deployments',
        example: 'true',
        required: false
      },
      NEXTAUTH_URL_INTERNAL: {
        description: 'Internal URL for server-side auth calls',
        example: 'http://localhost:3000',
        required: false
      }
    }
  },

  'oauth-providers': {
    title: 'OAuth Providers',
    vars: {
      GITHUB_CLIENT_ID: {
        description: 'GitHub OAuth App Client ID',
        example: 'your-github-client-id',
        required: false
      },
      GITHUB_CLIENT_SECRET: {
        description: 'GitHub OAuth App Client Secret',
        example: 'your-github-client-secret',
        required: false
      },
      GOOGLE_CLIENT_ID: {
        description: 'Google OAuth Client ID',
        example: 'your-google-client-id.apps.googleusercontent.com',
        required: false
      },
      GOOGLE_CLIENT_SECRET: {
        description: 'Google OAuth Client Secret',
        example: 'your-google-client-secret',
        required: false
      },
      DISCORD_CLIENT_ID: {
        description: 'Discord OAuth Client ID',
        example: 'your-discord-client-id',
        required: false
      },
      DISCORD_CLIENT_SECRET: {
        description: 'Discord OAuth Client Secret',
        example: 'your-discord-client-secret',
        required: false
      },
      TWITTER_CLIENT_ID: {
        description: 'Twitter OAuth Client ID',
        example: 'your-twitter-client-id',
        required: false
      },
      TWITTER_CLIENT_SECRET: {
        description: 'Twitter OAuth Client Secret',
        example: 'your-twitter-client-secret',
        required: false
      }
    }
  },

  'ai-providers': {
    title: 'AI Provider API Keys',
    vars: {
      OPENAI_API_KEY: {
        description: 'OpenAI API key for GPT models',
        example: 'sk-...',
        required: false
      },
      OPENAI_ORG_ID: {
        description: 'OpenAI Organization ID',
        example: 'org-...',
        required: false
      },
      ANTHROPIC_API_KEY: {
        description: 'Anthropic API key for Claude models',
        example: 'sk-ant-...',
        required: false
      },
      GOOGLE_AI_API_KEY: {
        description: 'Google AI API key for Gemini',
        example: 'your-google-ai-key',
        required: false
      },
      GOOGLE_GENERATIVE_AI_API_KEY: {
        description: 'Google Generative AI API key',
        example: 'AIza...',
        required: false
      },
      GROQ_API_KEY: {
        description: 'Groq API key for fast inference',
        example: 'gsk_...',
        required: false
      },
      MISTRAL_API_KEY: {
        description: 'Mistral AI API key',
        example: 'your-mistral-key',
        required: false
      },
      DEEPSEEK_API_KEY: {
        description: 'DeepSeek AI API key',
        example: 'your-deepseek-key',
        required: false
      },
      TOGETHER_API_KEY: {
        description: 'Together AI API key',
        example: 'your-together-key',
        required: false
      },
      REPLICATE_API_TOKEN: {
        description: 'Replicate API token',
        example: 'r8_...',
        required: false
      },
      COHERE_API_KEY: {
        description: 'Cohere API key',
        example: 'your-cohere-key',
        required: false
      },
      AI21_API_KEY: {
        description: 'AI21 Labs API key',
        example: 'your-ai21-key',
        required: false
      },
      HUGGINGFACE_API_KEY: {
        description: 'Hugging Face API key',
        example: 'hf_...',
        required: false
      },
      PERPLEXITY_API_KEY: {
        description: 'Perplexity AI API key',
        example: 'pplx-...',
        required: false
      },
      STABILITY_API_KEY: {
        description: 'Stability AI API key for image generation',
        example: 'sk-...',
        required: false
      },
      ELEVENLABS_API_KEY: {
        description: 'ElevenLabs API key for voice synthesis',
        example: 'your-elevenlabs-key',
        required: false
      },
      AZURE_OPENAI_API_KEY: {
        description: 'Azure OpenAI API key',
        example: 'your-azure-openai-key',
        required: false
      },
      AZURE_OPENAI_ENDPOINT: {
        description: 'Azure OpenAI endpoint URL',
        example: 'https://your-resource.openai.azure.com',
        required: false
      },
      PALM_API_KEY: {
        description: 'Google PaLM API key (legacy)',
        example: 'your-palm-key',
        required: false
      }
    }
  },

  'ai-settings': {
    title: 'AI Configuration Settings',
    vars: {
      DEFAULT_AI_PROVIDER: {
        description: 'Default AI provider to use',
        example: 'openai',
        required: false
      },
      AI_TEMPERATURE: {
        description: 'Default temperature for AI generation',
        example: '0.7',
        required: false
      },
      AI_MAX_TOKENS: {
        description: 'Default max tokens for AI generation',
        example: '2000',
        required: false
      },
      AI_TIMEOUT_MS: {
        description: 'AI request timeout in milliseconds',
        example: '30000',
        required: false
      },
      ENABLE_AI_CACHING: {
        description: 'Enable AI response caching',
        example: 'true',
        required: false
      },
      AI_CACHE_TTL_SECONDS: {
        description: 'AI cache time-to-live in seconds',
        example: '3600',
        required: false
      }
    }
  },

  'payment': {
    title: 'Payment Processing',
    vars: {
      STRIPE_PUBLISHABLE_KEY: {
        description: 'Stripe publishable key',
        example: 'pk_test_...',
        required: false
      },
      STRIPE_SECRET_KEY: {
        description: 'Stripe secret key',
        example: 'sk_test_...',
        required: false
      },
      STRIPE_WEBHOOK_SECRET: {
        description: 'Stripe webhook endpoint secret',
        example: 'whsec_...',
        required: false
      },
      STRIPE_PRICE_ID_MONTHLY: {
        description: 'Stripe price ID for monthly subscription',
        example: 'price_...',
        required: false
      },
      STRIPE_PRICE_ID_YEARLY: {
        description: 'Stripe price ID for yearly subscription',
        example: 'price_...',
        required: false
      },
      PAYPAL_CLIENT_ID: {
        description: 'PayPal client ID',
        example: 'your-paypal-client-id',
        required: false
      },
      PAYPAL_CLIENT_SECRET: {
        description: 'PayPal client secret',
        example: 'your-paypal-client-secret',
        required: false
      },
      PADDLE_VENDOR_ID: {
        description: 'Paddle vendor ID',
        example: 'your-paddle-vendor-id',
        required: false
      },
      PADDLE_API_KEY: {
        description: 'Paddle API key',
        example: 'your-paddle-api-key',
        required: false
      }
    }
  },

  'email': {
    title: 'Email Configuration',
    vars: {
      SMTP_HOST: {
        description: 'SMTP server host',
        example: 'smtp.gmail.com',
        required: false
      },
      SMTP_PORT: {
        description: 'SMTP server port',
        example: '587',
        required: false
      },
      SMTP_USER: {
        description: 'SMTP username',
        example: 'your-email@gmail.com',
        required: false
      },
      SMTP_PASSWORD: {
        description: 'SMTP password',
        example: 'your-smtp-password',
        required: false
      },
      SMTP_SECURE: {
        description: 'Use secure connection (true/false)',
        example: 'true',
        required: false
      },
      EMAIL_FROM: {
        description: 'Default from email address',
        example: 'noreply@revolutionary-ui.com',
        required: false
      },
      EMAIL_REPLY_TO: {
        description: 'Reply-to email address',
        example: 'support@revolutionary-ui.com',
        required: false
      },
      RESEND_API_KEY: {
        description: 'Resend.com API key',
        example: 're_...',
        required: false
      },
      SENDGRID_API_KEY: {
        description: 'SendGrid API key',
        example: 'SG...',
        required: false
      },
      POSTMARK_API_KEY: {
        description: 'Postmark API key',
        example: 'your-postmark-key',
        required: false
      }
    }
  },

  'storage': {
    title: 'Storage Configuration',
    vars: {
      S3_BUCKET_NAME: {
        description: 'AWS S3 bucket name',
        example: 'revolutionary-ui-assets',
        required: false
      },
      S3_ACCESS_KEY_ID: {
        description: 'AWS Access Key ID',
        example: 'AKIA...',
        required: false
      },
      S3_SECRET_ACCESS_KEY: {
        description: 'AWS Secret Access Key',
        example: 'your-secret-key',
        required: false
      },
      S3_REGION: {
        description: 'AWS S3 region',
        example: 'us-east-1',
        required: false
      },
      S3_ENDPOINT: {
        description: 'Custom S3 endpoint (for S3-compatible services)',
        example: 'https://s3.amazonaws.com',
        required: false
      },
      CLOUDINARY_CLOUD_NAME: {
        description: 'Cloudinary cloud name',
        example: 'your-cloud-name',
        required: false
      },
      CLOUDINARY_API_KEY: {
        description: 'Cloudinary API key',
        example: 'your-cloudinary-key',
        required: false
      },
      CLOUDINARY_API_SECRET: {
        description: 'Cloudinary API secret',
        example: 'your-cloudinary-secret',
        required: false
      },
      UPLOADTHING_SECRET: {
        description: 'UploadThing secret key',
        example: 'sk_...',
        required: false
      },
      UPLOADTHING_APP_ID: {
        description: 'UploadThing app ID',
        example: 'your-app-id',
        required: false
      }
    }
  },

  'analytics': {
    title: 'Analytics & Monitoring',
    vars: {
      NEXT_PUBLIC_GA_MEASUREMENT_ID: {
        description: 'Google Analytics 4 Measurement ID',
        example: 'G-XXXXXXXXXX',
        required: false
      },
      NEXT_PUBLIC_GTM_ID: {
        description: 'Google Tag Manager ID',
        example: 'GTM-XXXXXX',
        required: false
      },
      NEXT_PUBLIC_MIXPANEL_TOKEN: {
        description: 'Mixpanel project token',
        example: 'your-mixpanel-token',
        required: false
      },
      NEXT_PUBLIC_AMPLITUDE_API_KEY: {
        description: 'Amplitude API key',
        example: 'your-amplitude-key',
        required: false
      },
      NEXT_PUBLIC_POSTHOG_KEY: {
        description: 'PostHog API key',
        example: 'phc_...',
        required: false
      },
      NEXT_PUBLIC_POSTHOG_HOST: {
        description: 'PostHog host URL',
        example: 'https://app.posthog.com',
        required: false
      },
      SENTRY_DSN: {
        description: 'Sentry error tracking DSN',
        example: 'https://xxx@xxx.ingest.sentry.io/xxx',
        required: false
      },
      SENTRY_AUTH_TOKEN: {
        description: 'Sentry auth token for source maps',
        example: 'your-sentry-auth-token',
        required: false
      },
      SENTRY_ORG: {
        description: 'Sentry organization slug',
        example: 'your-org',
        required: false
      },
      SENTRY_PROJECT: {
        description: 'Sentry project slug',
        example: 'revolutionary-ui',
        required: false
      },
      LOGROCKET_APP_ID: {
        description: 'LogRocket app ID',
        example: 'your-app/revolutionary-ui',
        required: false
      },
      DATADOG_API_KEY: {
        description: 'Datadog API key',
        example: 'your-datadog-key',
        required: false
      },
      NEW_RELIC_LICENSE_KEY: {
        description: 'New Relic license key',
        example: 'your-new-relic-key',
        required: false
      }
    }
  },

  'search': {
    title: 'Search Configuration',
    vars: {
      ALGOLIA_APP_ID: {
        description: 'Algolia application ID',
        example: 'your-algolia-app-id',
        required: false
      },
      ALGOLIA_SEARCH_API_KEY: {
        description: 'Algolia search-only API key',
        example: 'your-search-key',
        required: false
      },
      ALGOLIA_ADMIN_API_KEY: {
        description: 'Algolia admin API key',
        example: 'your-admin-key',
        required: false
      },
      ALGOLIA_INDEX_NAME: {
        description: 'Algolia index name',
        example: 'revolutionary_ui_components',
        required: false
      },
      ELASTICSEARCH_NODE: {
        description: 'Elasticsearch node URL',
        example: 'http://localhost:9200',
        required: false
      },
      ELASTICSEARCH_API_KEY: {
        description: 'Elasticsearch API key',
        example: 'your-elasticsearch-key',
        required: false
      },
      MEILISEARCH_HOST: {
        description: 'MeiliSearch host URL',
        example: 'http://localhost:7700',
        required: false
      },
      MEILISEARCH_API_KEY: {
        description: 'MeiliSearch API key',
        example: 'your-meilisearch-key',
        required: false
      },
      TYPESENSE_HOST: {
        description: 'Typesense host URL',
        example: 'http://localhost:8108',
        required: false
      },
      TYPESENSE_API_KEY: {
        description: 'Typesense API key',
        example: 'your-typesense-key',
        required: false
      }
    }
  },

  'cache': {
    title: 'Cache Configuration',
    vars: {
      REDIS_URL: {
        description: 'Redis connection URL',
        example: 'redis://localhost:6379',
        required: false
      },
      REDIS_PASSWORD: {
        description: 'Redis password',
        example: 'your-redis-password',
        required: false
      },
      UPSTASH_REDIS_REST_URL: {
        description: 'Upstash Redis REST URL',
        example: 'https://xxx.upstash.io',
        required: false
      },
      UPSTASH_REDIS_REST_TOKEN: {
        description: 'Upstash Redis REST token',
        example: 'your-upstash-token',
        required: false
      },
      MEMCACHED_SERVERS: {
        description: 'Memcached server addresses',
        example: 'localhost:11211',
        required: false
      }
    }
  },

  'queue': {
    title: 'Queue & Background Jobs',
    vars: {
      QUEUE_TYPE: {
        description: 'Queue system type (redis, sqs, rabbitmq)',
        example: 'redis',
        required: false
      },
      SQS_QUEUE_URL: {
        description: 'AWS SQS queue URL',
        example: 'https://sqs.region.amazonaws.com/account/queue-name',
        required: false
      },
      RABBITMQ_URL: {
        description: 'RabbitMQ connection URL',
        example: 'amqp://localhost',
        required: false
      },
      BULL_REDIS_URL: {
        description: 'Redis URL for Bull queue',
        example: 'redis://localhost:6379',
        required: false
      }
    }
  },

  'cdn': {
    title: 'CDN Configuration',
    vars: {
      CDN_URL: {
        description: 'CDN base URL',
        example: 'https://cdn.revolutionary-ui.com',
        required: false
      },
      CLOUDFLARE_ZONE_ID: {
        description: 'Cloudflare zone ID',
        example: 'your-zone-id',
        required: false
      },
      CLOUDFLARE_API_TOKEN: {
        description: 'Cloudflare API token',
        example: 'your-cloudflare-token',
        required: false
      },
      FASTLY_API_KEY: {
        description: 'Fastly API key',
        example: 'your-fastly-key',
        required: false
      },
      FASTLY_SERVICE_ID: {
        description: 'Fastly service ID',
        example: 'your-service-id',
        required: false
      }
    }
  },

  'security': {
    title: 'Security Configuration',
    vars: {
      ENCRYPTION_KEY: {
        description: 'Master encryption key for sensitive data',
        example: 'your-32-character-encryption-key',
        required: false
      },
      JWT_SECRET: {
        description: 'JWT signing secret',
        example: 'your-jwt-secret',
        required: false
      },
      CSRF_SECRET: {
        description: 'CSRF token secret',
        example: 'your-csrf-secret',
        required: false
      },
      RATE_LIMIT_MAX: {
        description: 'Max requests per window',
        example: '100',
        required: false
      },
      RATE_LIMIT_WINDOW_MS: {
        description: 'Rate limit window in milliseconds',
        example: '900000',
        required: false
      },
      ALLOWED_ORIGINS: {
        description: 'Comma-separated list of allowed CORS origins',
        example: 'http://localhost:3000,https://revolutionary-ui.com',
        required: false
      },
      CONTENT_SECURITY_POLICY: {
        description: 'Content Security Policy header',
        example: "default-src 'self'",
        required: false
      },
      HCAPTCHA_SITE_KEY: {
        description: 'hCaptcha site key',
        example: 'your-hcaptcha-site-key',
        required: false
      },
      HCAPTCHA_SECRET_KEY: {
        description: 'hCaptcha secret key',
        example: 'your-hcaptcha-secret',
        required: false
      },
      RECAPTCHA_SITE_KEY: {
        description: 'Google reCAPTCHA site key',
        example: 'your-recaptcha-site-key',
        required: false
      },
      RECAPTCHA_SECRET_KEY: {
        description: 'Google reCAPTCHA secret key',
        example: 'your-recaptcha-secret',
        required: false
      }
    }
  },

  'features': {
    title: 'Feature Flags',
    vars: {
      ENABLE_MARKETPLACE: {
        description: 'Enable component marketplace',
        example: 'true',
        required: false
      },
      ENABLE_AI_GENERATION: {
        description: 'Enable AI component generation',
        example: 'true',
        required: false
      },
      ENABLE_TEAM_FEATURES: {
        description: 'Enable team collaboration',
        example: 'true',
        required: false
      },
      ENABLE_PRIVATE_REGISTRY: {
        description: 'Enable private NPM registry',
        example: 'false',
        required: false
      },
      ENABLE_ANALYTICS: {
        description: 'Enable analytics tracking',
        example: 'true',
        required: false
      },
      ENABLE_NOTIFICATIONS: {
        description: 'Enable notification system',
        example: 'true',
        required: false
      },
      ENABLE_WEBHOOKS: {
        description: 'Enable webhook system',
        example: 'true',
        required: false
      },
      ENABLE_API_DOCS: {
        description: 'Enable API documentation',
        example: 'true',
        required: false
      },
      ENABLE_PLAYGROUND: {
        description: 'Enable component playground',
        example: 'true',
        required: false
      },
      ENABLE_VISUAL_BUILDER: {
        description: 'Enable visual component builder',
        example: 'true',
        required: false
      },
      MAINTENANCE_MODE: {
        description: 'Enable maintenance mode',
        example: 'false',
        required: false
      }
    }
  },

  'api': {
    title: 'API Configuration',
    vars: {
      API_URL: {
        description: 'Base API URL',
        example: 'http://localhost:3000/api',
        required: false
      },
      API_KEY: {
        description: 'Master API key',
        example: 'your-api-key',
        required: false
      },
      API_RATE_LIMIT: {
        description: 'API rate limit per minute',
        example: '60',
        required: false
      },
      WEBHOOK_SECRET: {
        description: 'Webhook signing secret',
        example: 'your-webhook-secret',
        required: false
      },
      GRAPHQL_ENDPOINT: {
        description: 'GraphQL API endpoint',
        example: '/api/graphql',
        required: false
      },
      REST_API_VERSION: {
        description: 'REST API version',
        example: 'v1',
        required: false
      }
    }
  },

  'registry': {
    title: 'Private Registry Configuration',
    vars: {
      NPM_REGISTRY_URL: {
        description: 'Private NPM registry URL',
        example: 'https://npm.revolutionary-ui.com',
        required: false
      },
      NPM_REGISTRY_TOKEN: {
        description: 'NPM registry auth token',
        example: 'your-registry-token',
        required: false
      },
      DOCKER_REGISTRY_URL: {
        description: 'Docker registry URL',
        example: 'docker.revolutionary-ui.com',
        required: false
      },
      DOCKER_REGISTRY_USER: {
        description: 'Docker registry username',
        example: 'your-docker-user',
        required: false
      },
      DOCKER_REGISTRY_PASSWORD: {
        description: 'Docker registry password',
        example: 'your-docker-password',
        required: false
      }
    }
  },

  'development': {
    title: 'Development Settings',
    vars: {
      NODE_ENV: {
        description: 'Node environment',
        example: 'development',
        required: false
      },
      PORT: {
        description: 'Server port',
        example: '3000',
        required: false
      },
      HOST: {
        description: 'Server host',
        example: '0.0.0.0',
        required: false
      },
      LOG_LEVEL: {
        description: 'Logging level',
        example: 'info',
        required: false
      },
      DEBUG: {
        description: 'Debug mode namespaces',
        example: 'revolutionary-ui:*',
        required: false
      },
      ANALYZE_BUNDLE: {
        description: 'Enable bundle analysis',
        example: 'false',
        required: false
      },
      NEXT_TELEMETRY_DISABLED: {
        description: 'Disable Next.js telemetry',
        example: '1',
        required: false
      }
    }
  },

  'deployment': {
    title: 'Deployment Configuration',
    vars: {
      VERCEL_URL: {
        description: 'Vercel deployment URL',
        example: 'https://revolutionary-ui.vercel.app',
        required: false
      },
      VERCEL_ENV: {
        description: 'Vercel environment',
        example: 'production',
        required: false
      },
      NETLIFY_URL: {
        description: 'Netlify deployment URL',
        example: 'https://revolutionary-ui.netlify.app',
        required: false
      },
      RAILWAY_STATIC_URL: {
        description: 'Railway deployment URL',
        example: 'https://revolutionary-ui.railway.app',
        required: false
      },
      RENDER_EXTERNAL_URL: {
        description: 'Render deployment URL',
        example: 'https://revolutionary-ui.onrender.com',
        required: false
      },
      FLY_APP_NAME: {
        description: 'Fly.io app name',
        example: 'revolutionary-ui',
        required: false
      }
    }
  },

  'integrations': {
    title: 'Third-Party Integrations',
    vars: {
      SLACK_WEBHOOK_URL: {
        description: 'Slack webhook URL for notifications',
        example: 'https://hooks.slack.com/services/xxx/xxx/xxx',
        required: false
      },
      SLACK_BOT_TOKEN: {
        description: 'Slack bot token',
        example: 'xoxb-...',
        required: false
      },
      DISCORD_WEBHOOK_URL: {
        description: 'Discord webhook URL',
        example: 'https://discord.com/api/webhooks/xxx/xxx',
        required: false
      },
      DISCORD_BOT_TOKEN: {
        description: 'Discord bot token',
        example: 'your-discord-bot-token',
        required: false
      },
      TELEGRAM_BOT_TOKEN: {
        description: 'Telegram bot token',
        example: 'your-telegram-bot-token',
        required: false
      },
      TELEGRAM_CHAT_ID: {
        description: 'Telegram chat ID',
        example: 'your-chat-id',
        required: false
      },
      TWILIO_ACCOUNT_SID: {
        description: 'Twilio account SID',
        example: 'AC...',
        required: false
      },
      TWILIO_AUTH_TOKEN: {
        description: 'Twilio auth token',
        example: 'your-twilio-token',
        required: false
      },
      TWILIO_PHONE_NUMBER: {
        description: 'Twilio phone number',
        example: '+1234567890',
        required: false
      },
      ZAPIER_WEBHOOK_URL: {
        description: 'Zapier webhook URL',
        example: 'https://hooks.zapier.com/hooks/catch/xxx/xxx',
        required: false
      },
      IFTTT_WEBHOOK_KEY: {
        description: 'IFTTT webhook key',
        example: 'your-ifttt-key',
        required: false
      }
    }
  },

  'scraping': {
    title: 'Web Scraping & Data Tools',
    vars: {
      FIRECRAWL_API_KEY: {
        description: 'Firecrawl API key for web scraping',
        example: 'fc-...',
        required: false
      },
      BROWSERLESS_API_KEY: {
        description: 'Browserless API key',
        example: 'your-browserless-key',
        required: false
      },
      SCRAPINGBEE_API_KEY: {
        description: 'ScrapingBee API key',
        example: 'your-scrapingbee-key',
        required: false
      },
      SCRAPERAPI_KEY: {
        description: 'ScraperAPI key',
        example: 'your-scraperapi-key',
        required: false
      },
      BRIGHTDATA_CUSTOMER_ID: {
        description: 'Bright Data customer ID',
        example: 'your-customer-id',
        required: false
      },
      BRIGHTDATA_PASSWORD: {
        description: 'Bright Data password',
        example: 'your-brightdata-password',
        required: false
      }
    }
  },

  'marketplace': {
    title: 'Marketplace Settings',
    vars: {
      MARKETPLACE_FEE_PERCENTAGE: {
        description: 'Platform fee percentage (0-100)',
        example: '30',
        required: false
      },
      MARKETPLACE_MIN_PRICE: {
        description: 'Minimum component price in cents',
        example: '99',
        required: false
      },
      MARKETPLACE_MAX_PRICE: {
        description: 'Maximum component price in cents',
        example: '99900',
        required: false
      },
      MARKETPLACE_CURRENCY: {
        description: 'Default marketplace currency',
        example: 'USD',
        required: false
      },
      MARKETPLACE_PAYOUT_DELAY_DAYS: {
        description: 'Days before creator payout',
        example: '7',
        required: false
      }
    }
  },

  'experimental': {
    title: 'Experimental Features',
    vars: {
      ENABLE_EDGE_FUNCTIONS: {
        description: 'Enable edge function deployment',
        example: 'false',
        required: false
      },
      ENABLE_WASM_COMPONENTS: {
        description: 'Enable WebAssembly components',
        example: 'false',
        required: false
      },
      ENABLE_BLOCKCHAIN_INTEGRATION: {
        description: 'Enable blockchain features',
        example: 'false',
        required: false
      },
      ENABLE_AR_PREVIEW: {
        description: 'Enable AR component preview',
        example: 'false',
        required: false
      },
      ENABLE_VOICE_COMMANDS: {
        description: 'Enable voice command interface',
        example: 'false',
        required: false
      },
      EXPERIMENTAL_TURBO_MODE: {
        description: 'Enable experimental turbo mode',
        example: 'false',
        required: false
      }
    }
  }
};

// Load current environment
const currentEnvPath = path.join(process.cwd(), '.env.local');
let currentEnv = {};

if (fs.existsSync(currentEnvPath)) {
  const result = dotenv.config({ path: currentEnvPath });
  currentEnv = result.parsed || {};
}

// Generate .env.sample
function generateEnvSample() {
  print.title('📝 Generating Complete .env.sample');
  
  let content = `# Revolutionary UI - Complete Environment Configuration
# Generated on ${new Date().toISOString()}
# 
# This file contains ALL possible environment variables for Revolutionary UI
# Copy this file to .env.local and configure as needed
#
# Required variables are marked with [REQUIRED]
# Optional variables can be left empty or removed
#
# Run 'node scripts/setup-all-env.js' for interactive setup

`;

  let totalVars = 0;
  let currentlySet = 0;

  for (const [categoryKey, category] of Object.entries(ENV_COMPLETE_DEFINITIONS)) {
    content += `\n# ${'='.repeat(60)}\n`;
    content += `# ${category.title}\n`;
    content += `# ${'='.repeat(60)}\n\n`;

    for (const [varName, varDef] of Object.entries(category.vars)) {
      totalVars++;
      
      // Add description
      content += `# ${varDef.description}\n`;
      if (varDef.required) {
        content += `# [REQUIRED]\n`;
      }
      
      // Check if currently set
      if (currentEnv[varName]) {
        currentlySet++;
        content += `# Status: Currently configured ✓\n`;
      } else {
        content += `# Status: Not configured\n`;
      }
      
      // Add example
      content += `# Example: ${varDef.example}\n`;
      
      // Add the variable
      content += `${varName}=${varDef.example}\n\n`;
    }
  }

  // Write the file
  const samplePath = path.join(process.cwd(), '.env.sample');
  fs.writeFileSync(samplePath, content);
  
  print.success(`Generated .env.sample with ${totalVars} variables`);
  print.info(`Currently configured: ${currentlySet}/${totalVars} variables`);
  print.info(`File saved to: ${samplePath}`);
  
  return { totalVars, currentlySet };
}

// Main execution
if (require.main === module) {
  generateEnvSample();
  print.info('\nNext step: Run "node scripts/setup-all-env.js" for interactive configuration');
}

module.exports = { ENV_COMPLETE_DEFINITIONS, generateEnvSample };