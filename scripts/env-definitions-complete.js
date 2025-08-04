// Complete environment variable definitions with documentation and setup links

const ENV_COMPLETE_DEFINITIONS = {
  // Core Database & Authentication
  'core-database': {
    title: 'Core Database Configuration',
    description: 'PostgreSQL database configuration for data persistence. Revolutionary UI uses Prisma ORM with PostgreSQL.',
    docs: 'https://www.prisma.io/docs/guides/database/supabase',
    vars: {
      DATABASE_URL: {
        description: 'PostgreSQL connection string for database migrations (direct connection)',
        example: 'postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres',
        required: true,
        setupUrl: 'https://supabase.com/dashboard/project/_/settings/database',
        setupSteps: [
          '1. Go to Supabase Dashboard > Settings > Database',
          '2. Find "Connection string" section',
          '3. Copy the URI and replace [YOUR-PASSWORD] with your database password',
          '4. Use port 5432 for direct connections'
        ],
        docs: 'https://supabase.com/docs/guides/database/connecting-to-postgres#direct-connections',
        recommended: 'Use the connection string from Supabase with port 5432'
      },
      DATABASE_URL_PRISMA: {
        description: 'PostgreSQL pooled connection string for application queries (connection pooling via PgBouncer)',
        example: 'postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1',
        required: true,
        setupUrl: 'https://supabase.com/dashboard/project/_/settings/database',
        setupSteps: [
          '1. Go to Supabase Dashboard > Settings > Database',
          '2. Find "Connection pooling" section',
          '3. Copy the connection string',
          '4. Add ?pgbouncer=true&connection_limit=1 to the end',
          '5. Use port 6543 for pooled connections'
        ],
        docs: 'https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler',
        recommended: 'Use pooled connection with port 6543 for better performance'
      },
      DIRECT_URL: {
        description: 'Direct database URL specifically for Prisma migrations (bypasses connection pooler)',
        example: 'postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres',
        required: true,
        setupUrl: 'https://supabase.com/dashboard/project/_/settings/database',
        setupSteps: [
          '1. This should be the same as DATABASE_URL',
          '2. Must use port 5432 (not 6543)',
          '3. Do not include pgbouncer parameters'
        ],
        docs: 'https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prismaclient-in-serverless-environments',
        recommended: 'Same as DATABASE_URL with port 5432'
      },
      DATABASE_POOL_MIN: {
        description: 'Minimum number of database connections in the pool',
        example: '2',
        required: false,
        docs: 'https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-pool',
        recommended: '2',
        explanation: 'Minimum connections to keep open. Higher = faster response but more resources.'
      },
      DATABASE_POOL_MAX: {
        description: 'Maximum number of database connections in the pool',
        example: '10',
        required: false,
        docs: 'https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-pool',
        recommended: '10',
        explanation: 'Maximum concurrent connections. Supabase free tier allows up to 60.'
      }
    }
  },
  
  'supabase': {
    title: 'Supabase Configuration',
    description: 'Supabase provides authentication, real-time subscriptions, storage, and edge functions.',
    docs: 'https://supabase.com/docs',
    vars: {
      NEXT_PUBLIC_SUPABASE_URL: {
        description: 'Your Supabase project URL (public, safe for browser)',
        example: 'https://[YOUR-PROJECT-REF].supabase.co',
        required: true,
        setupUrl: 'https://supabase.com/dashboard/project/_/settings/api',
        setupSteps: [
          '1. Go to Supabase Dashboard > Settings > API',
          '2. Find "Project URL"',
          '3. Copy the entire URL'
        ],
        docs: 'https://supabase.com/docs/guides/getting-started/quickstarts/nextjs',
        recommended: 'Copy from Supabase dashboard',
        explanation: 'This URL is used for client-side API calls and is safe to expose.'
      },
      NEXT_PUBLIC_SUPABASE_ANON_KEY: {
        description: 'Supabase anonymous key for client-side access (safe for browser)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: true,
        setupUrl: 'https://supabase.com/dashboard/project/_/settings/api',
        setupSteps: [
          '1. Go to Supabase Dashboard > Settings > API',
          '2. Find "Project API keys"',
          '3. Copy the "anon public" key',
          '4. This key is safe to use in browsers'
        ],
        docs: 'https://supabase.com/docs/guides/api/api-keys',
        recommended: 'Use the anon key from Supabase',
        explanation: 'This key has limited permissions based on your RLS policies.'
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        description: 'Supabase service role key with full admin access (server-side only!)',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: false,
        setupUrl: 'https://supabase.com/dashboard/project/_/settings/api',
        setupSteps: [
          '1. Go to Supabase Dashboard > Settings > API',
          '2. Find "Project API keys"',
          '3. Click "Reveal" on the "service_role secret" key',
          '4. NEVER expose this key in client-side code!'
        ],
        docs: 'https://supabase.com/docs/guides/api/api-keys#the-service_role-key',
        recommended: 'Only use if you need admin access from server',
        explanation: 'This key bypasses Row Level Security - keep it secret!'
      },
      SUPABASE_JWT_SECRET: {
        description: 'JWT secret for verifying Supabase tokens (advanced use)',
        example: 'your-super-secret-jwt-token',
        required: false,
        setupUrl: 'https://supabase.com/dashboard/project/_/settings/api',
        setupSteps: [
          '1. Go to Supabase Dashboard > Settings > API',
          '2. Find "JWT Settings"',
          '3. Copy the JWT Secret',
          '4. Only needed for custom JWT verification'
        ],
        docs: 'https://supabase.com/docs/guides/auth/jwts',
        recommended: 'Leave empty unless doing custom JWT verification',
        explanation: 'Used for manually verifying JWTs in edge functions or custom backends.'
      }
    }
  },

  'authentication': {
    title: 'Authentication Configuration',
    description: 'NextAuth.js configuration for secure authentication and session management.',
    docs: 'https://next-auth.js.org/configuration/options',
    vars: {
      NEXTAUTH_URL: {
        description: 'The canonical URL of your site used for callbacks',
        example: 'http://localhost:3000',
        required: true,
        setupSteps: [
          '1. For development: use http://localhost:3000',
          '2. For production: use your actual domain (https://yourdomain.com)',
          '3. Must match the URL users access your site from'
        ],
        docs: 'https://next-auth.js.org/configuration/options#nextauth_url',
        recommended: 'http://localhost:3000',
        explanation: 'NextAuth uses this for OAuth callbacks and email sign-in links.'
      },
      NEXTAUTH_SECRET: {
        description: 'Random string used to encrypt tokens and email verification hashes',
        example: 'your-nextauth-secret-key',
        required: true,
        setupSteps: [
          '1. Generate with: openssl rand -base64 32',
          '2. Or use: https://generate-secret.vercel.app/32',
          '3. Must be at least 32 characters',
          '4. Keep this secret and unique per environment'
        ],
        docs: 'https://next-auth.js.org/configuration/options#nextauth_secret',
        recommended: 'Generate a random 32+ character string',
        explanation: 'Used to encrypt JWT tokens and CSRF tokens. Must be kept secret!'
      },
      AUTH_TRUST_HOST: {
        description: 'Trust the X-Forwarded-Host header (needed for proxy deployments)',
        example: 'true',
        required: false,
        docs: 'https://authjs.dev/guides/upgrade-to-v5#edge-compatibility',
        recommended: 'true',
        explanation: 'Set to true if behind a proxy (Vercel, Heroku, etc).'
      },
      NEXTAUTH_URL_INTERNAL: {
        description: 'Internal URL for server-side auth calls (container environments)',
        example: 'http://localhost:3000',
        required: false,
        docs: 'https://next-auth.js.org/configuration/options#nextauth_url_internal',
        recommended: 'Leave empty unless using Docker',
        explanation: 'Only needed if your server-side code calls NextAuth from a different URL.'
      }
    }
  },

  'oauth-providers': {
    title: 'OAuth Providers',
    description: 'Social login providers for easy user authentication.',
    docs: 'https://next-auth.js.org/providers/',
    vars: {
      GITHUB_CLIENT_ID: {
        description: 'GitHub OAuth App Client ID',
        example: 'your-github-client-id',
        required: false,
        setupUrl: 'https://github.com/settings/applications/new',
        setupSteps: [
          '1. Go to GitHub Settings > Developer settings > OAuth Apps',
          '2. Click "New OAuth App"',
          '3. Application name: Revolutionary UI',
          '4. Homepage URL: http://localhost:3000',
          '5. Authorization callback URL: http://localhost:3000/api/auth/callback/github',
          '6. Click "Register application"',
          '7. Copy the Client ID'
        ],
        docs: 'https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app',
        recommended: 'Create an OAuth app for easy developer login',
        explanation: 'Allows users to sign in with their GitHub account.'
      },
      GITHUB_CLIENT_SECRET: {
        description: 'GitHub OAuth App Client Secret',
        example: 'your-github-client-secret',
        required: false,
        setupUrl: 'https://github.com/settings/developers',
        setupSteps: [
          '1. In your GitHub OAuth App settings',
          '2. Click "Generate a new client secret"',
          '3. Copy immediately (only shown once!)',
          '4. Keep this secret'
        ],
        docs: 'https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps',
        recommended: 'Required if using GitHub login',
        explanation: 'Secret key for GitHub OAuth - never expose publicly!'
      },
      GOOGLE_CLIENT_ID: {
        description: 'Google OAuth 2.0 Client ID',
        example: 'your-google-client-id.apps.googleusercontent.com',
        required: false,
        setupUrl: 'https://console.cloud.google.com/apis/credentials',
        setupSteps: [
          '1. Go to Google Cloud Console > APIs & Services > Credentials',
          '2. Click "Create Credentials" > "OAuth client ID"',
          '3. Application type: Web application',
          '4. Name: Revolutionary UI',
          '5. Authorized JavaScript origins: http://localhost:3000',
          '6. Authorized redirect URIs: http://localhost:3000/api/auth/callback/google',
          '7. Click Create and copy Client ID'
        ],
        docs: 'https://developers.google.com/identity/protocols/oauth2/web-server',
        recommended: 'Popular login option for users',
        explanation: 'Enables "Sign in with Google" functionality.'
      },
      GOOGLE_CLIENT_SECRET: {
        description: 'Google OAuth 2.0 Client Secret',
        example: 'your-google-client-secret',
        required: false,
        setupUrl: 'https://console.cloud.google.com/apis/credentials',
        setupSteps: [
          '1. In your OAuth 2.0 Client ID settings',
          '2. Find the Client Secret',
          '3. Copy and keep secure'
        ],
        docs: 'https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred',
        recommended: 'Required if using Google login',
        explanation: 'Secret key for Google OAuth - keep confidential!'
      },
      DISCORD_CLIENT_ID: {
        description: 'Discord OAuth2 Application ID',
        example: 'your-discord-client-id',
        required: false,
        setupUrl: 'https://discord.com/developers/applications',
        setupSteps: [
          '1. Go to Discord Developer Portal',
          '2. Click "New Application"',
          '3. Name it "Revolutionary UI"',
          '4. Go to OAuth2 > General',
          '5. Add redirect: http://localhost:3000/api/auth/callback/discord',
          '6. Copy the Client ID'
        ],
        docs: 'https://discord.com/developers/docs/topics/oauth2',
        recommended: 'Great for gaming/community focused apps',
        explanation: 'Allows Discord users to sign in easily.'
      },
      DISCORD_CLIENT_SECRET: {
        description: 'Discord OAuth2 Client Secret',
        example: 'your-discord-client-secret',
        required: false,
        setupUrl: 'https://discord.com/developers/applications',
        setupSteps: [
          '1. In your Discord app settings',
          '2. Go to OAuth2 > General',
          '3. Reset secret if needed',
          '4. Copy the Client Secret'
        ],
        docs: 'https://discord.com/developers/docs/topics/oauth2',
        recommended: 'Required if using Discord login'
      },
      TWITTER_CLIENT_ID: {
        description: 'Twitter OAuth 2.0 Client ID',
        example: 'your-twitter-client-id',
        required: false,
        setupUrl: 'https://developer.twitter.com/en/portal/dashboard',
        setupSteps: [
          '1. Go to Twitter Developer Portal',
          '2. Create a new App',
          '3. Set up OAuth 2.0',
          '4. Add callback URL: http://localhost:3000/api/auth/callback/twitter',
          '5. Copy Client ID'
        ],
        docs: 'https://developer.twitter.com/en/docs/authentication/oauth-2-0',
        recommended: 'Good for social media integration'
      },
      TWITTER_CLIENT_SECRET: {
        description: 'Twitter OAuth 2.0 Client Secret',
        example: 'your-twitter-client-secret',
        required: false,
        setupUrl: 'https://developer.twitter.com/en/portal/dashboard',
        docs: 'https://developer.twitter.com/en/docs/authentication/oauth-2-0',
        recommended: 'Required if using Twitter login'
      }
    }
  },

  'ai-providers': {
    title: 'AI Provider API Keys',
    description: 'API keys for various AI providers to enable component generation and AI features.',
    docs: 'https://revolutionary-ui.com/docs/ai-providers',
    vars: {
      OPENAI_API_KEY: {
        description: 'OpenAI API key for GPT-4, GPT-3.5, and DALL-E access',
        example: 'sk-...',
        required: false,
        setupUrl: 'https://platform.openai.com/api-keys',
        setupSteps: [
          '1. Go to OpenAI Platform > API keys',
          '2. Click "Create new secret key"',
          '3. Name it "Revolutionary UI"',
          '4. Copy the key (only shown once!)',
          '5. Set up billing at https://platform.openai.com/account/billing'
        ],
        docs: 'https://platform.openai.com/docs/quickstart',
        recommended: 'sk-... (create at OpenAI)',
        explanation: 'Most popular AI provider. Costs ~$0.03 per component generation.',
        pricing: 'https://openai.com/pricing'
      },
      OPENAI_ORG_ID: {
        description: 'OpenAI Organization ID (optional)',
        example: 'org-...',
        required: false,
        setupUrl: 'https://platform.openai.com/account/organization',
        setupSteps: [
          '1. Go to OpenAI Platform > Settings',
          '2. Find your Organization ID',
          '3. Only needed for organization accounts'
        ],
        docs: 'https://platform.openai.com/docs/guides/production-best-practices',
        recommended: 'Leave empty for personal accounts'
      },
      ANTHROPIC_API_KEY: {
        description: 'Anthropic API key for Claude 3 models',
        example: 'sk-ant-...',
        required: false,
        setupUrl: 'https://console.anthropic.com/account/keys',
        setupSteps: [
          '1. Go to Anthropic Console',
          '2. Sign up or sign in',
          '3. Go to API Keys',
          '4. Create new key',
          '5. Add billing info'
        ],
        docs: 'https://docs.anthropic.com/claude/docs/getting-access-to-claude',
        recommended: 'Great for complex code generation',
        explanation: 'Claude 3 offers 200k context window and excellent code understanding.',
        pricing: 'https://anthropic.com/api'
      },
      GOOGLE_AI_API_KEY: {
        description: 'Google AI API key for Gemini models',
        example: 'your-google-ai-key',
        required: false,
        setupUrl: 'https://makersuite.google.com/app/apikey',
        setupSteps: [
          '1. Go to Google AI Studio',
          '2. Click "Get API key"',
          '3. Create new API key',
          '4. Free tier available!'
        ],
        docs: 'https://ai.google.dev/tutorials/setup',
        recommended: 'Good free option to start',
        explanation: 'Gemini Pro is free up to 60 requests per minute.',
        pricing: 'https://ai.google.dev/pricing'
      },
      GOOGLE_GENERATIVE_AI_API_KEY: {
        description: 'Google Generative AI API key (newer API)',
        example: 'AIza...',
        required: false,
        setupUrl: 'https://makersuite.google.com/app/apikey',
        docs: 'https://ai.google.dev/tutorials/python_quickstart',
        recommended: 'Same as GOOGLE_AI_API_KEY',
        explanation: 'Alternative Google AI endpoint - use one or the other.'
      },
      GROQ_API_KEY: {
        description: 'Groq API key for ultra-fast LPU inference',
        example: 'gsk_...',
        required: false,
        setupUrl: 'https://console.groq.com/keys',
        setupSteps: [
          '1. Go to Groq Console',
          '2. Sign up (free)',
          '3. Create API key',
          '4. Very fast inference!'
        ],
        docs: 'https://console.groq.com/docs/quickstart',
        recommended: 'Fastest inference available',
        explanation: 'Groq uses custom LPU chips for incredibly fast responses.',
        pricing: 'https://wow.groq.com/pricing/'
      },
      MISTRAL_API_KEY: {
        description: 'Mistral AI API key for European AI models',
        example: 'your-mistral-key',
        required: false,
        setupUrl: 'https://console.mistral.ai/api-keys',
        setupSteps: [
          '1. Go to Mistral AI Console',
          '2. Sign up',
          '3. Create API key',
          '4. European data residency'
        ],
        docs: 'https://docs.mistral.ai/',
        recommended: 'Good for EU compliance',
        explanation: 'French AI company with strong coding models.',
        pricing: 'https://mistral.ai/technology/#pricing'
      },
      DEEPSEEK_API_KEY: {
        description: 'DeepSeek API key for specialized coding models',
        example: 'your-deepseek-key',
        required: false,
        setupUrl: 'https://platform.deepseek.com/api_keys',
        setupSteps: [
          '1. Go to DeepSeek Platform',
          '2. Register account',
          '3. Create API key',
          '4. Specialized for code'
        ],
        docs: 'https://platform.deepseek.com/api-docs',
        recommended: 'Excellent for code generation',
        explanation: 'DeepSeek Coder excels at programming tasks.',
        pricing: 'https://platform.deepseek.com/api-docs/pricing'
      },
      TOGETHER_API_KEY: {
        description: 'Together AI API key for 50+ open models',
        example: 'your-together-key',
        required: false,
        setupUrl: 'https://api.together.xyz/settings/api-keys',
        setupSteps: [
          '1. Go to Together AI',
          '2. Sign up',
          '3. Get $25 free credit',
          '4. Create API key'
        ],
        docs: 'https://docs.together.ai/docs/quickstart',
        recommended: 'Access many models with one key',
        explanation: 'Run Llama 2, CodeLlama, Stable Diffusion, and more.',
        pricing: 'https://www.together.ai/pricing'
      },
      REPLICATE_API_TOKEN: {
        description: 'Replicate API token for thousands of AI models',
        example: 'r8_...',
        required: false,
        setupUrl: 'https://replicate.com/account/api-tokens',
        setupSteps: [
          '1. Go to Replicate',
          '2. Sign up with GitHub',
          '3. Go to Account > API tokens',
          '4. Create token'
        ],
        docs: 'https://replicate.com/docs',
        recommended: 'Great for image generation',
        explanation: 'Easy access to Stable Diffusion, Whisper, and more.',
        pricing: 'https://replicate.com/pricing'
      },
      COHERE_API_KEY: {
        description: 'Cohere API key for language models',
        example: 'your-cohere-key',
        required: false,
        setupUrl: 'https://dashboard.cohere.com/api-keys',
        setupSteps: [
          '1. Go to Cohere Dashboard',
          '2. Sign up (free trial)',
          '3. Create API key'
        ],
        docs: 'https://docs.cohere.com/',
        recommended: 'Good for embeddings and search',
        pricing: 'https://cohere.com/pricing'
      },
      AI21_API_KEY: {
        description: 'AI21 Labs API key for Jurassic models',
        example: 'your-ai21-key',
        required: false,
        setupUrl: 'https://studio.ai21.com/account/api-keys',
        docs: 'https://docs.ai21.com/docs/getting-started',
        recommended: 'Alternative language model provider'
      },
      HUGGINGFACE_API_KEY: {
        description: 'Hugging Face API key for model inference',
        example: 'hf_...',
        required: false,
        setupUrl: 'https://huggingface.co/settings/tokens',
        setupSteps: [
          '1. Go to Hugging Face Settings',
          '2. Access Tokens',
          '3. Create new token',
          '4. Free tier available'
        ],
        docs: 'https://huggingface.co/docs/api-inference/quicktour',
        recommended: 'Access to thousands of models',
        pricing: 'https://huggingface.co/pricing'
      },
      PERPLEXITY_API_KEY: {
        description: 'Perplexity AI API key for online LLMs',
        example: 'pplx-...',
        required: false,
        setupUrl: 'https://www.perplexity.ai/settings/api',
        docs: 'https://docs.perplexity.ai/',
        recommended: 'Great for real-time information',
        explanation: 'Models with internet access for current information.'
      },
      STABILITY_API_KEY: {
        description: 'Stability AI API key for Stable Diffusion',
        example: 'sk-...',
        required: false,
        setupUrl: 'https://platform.stability.ai/account/keys',
        setupSteps: [
          '1. Go to Stability AI Platform',
          '2. Sign up',
          '3. Add payment method',
          '4. Create API key'
        ],
        docs: 'https://platform.stability.ai/docs/getting-started',
        recommended: 'Best for image generation',
        pricing: 'https://platform.stability.ai/pricing'
      },
      ELEVENLABS_API_KEY: {
        description: 'ElevenLabs API key for AI voice synthesis',
        example: 'your-elevenlabs-key',
        required: false,
        setupUrl: 'https://elevenlabs.io/app/settings/api-keys',
        setupSteps: [
          '1. Go to ElevenLabs',
          '2. Sign up (free tier)',
          '3. Go to Profile > API Key',
          '4. Copy your key'
        ],
        docs: 'https://elevenlabs.io/docs/api-reference/quick-start/introduction',
        recommended: 'Amazing voice quality',
        explanation: 'Convert text to natural-sounding speech.',
        pricing: 'https://elevenlabs.io/pricing'
      },
      AZURE_OPENAI_API_KEY: {
        description: 'Azure OpenAI Service API key',
        example: 'your-azure-openai-key',
        required: false,
        setupUrl: 'https://portal.azure.com/#create/Microsoft.CognitiveServicesOpenAI',
        setupSteps: [
          '1. Create Azure account',
          '2. Create OpenAI resource',
          '3. Go to Keys and Endpoint',
          '4. Copy KEY 1'
        ],
        docs: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart',
        recommended: 'For enterprise deployments',
        explanation: 'OpenAI models hosted on Azure infrastructure.'
      },
      AZURE_OPENAI_ENDPOINT: {
        description: 'Azure OpenAI endpoint URL',
        example: 'https://your-resource.openai.azure.com',
        required: false,
        setupUrl: 'https://portal.azure.com',
        docs: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart',
        recommended: 'Required with AZURE_OPENAI_API_KEY'
      },
      PALM_API_KEY: {
        description: 'Google PaLM API key (legacy, use Gemini instead)',
        example: 'your-palm-key',
        required: false,
        docs: 'https://developers.generativeai.google/guide/palm_api_overview',
        recommended: 'Use GOOGLE_AI_API_KEY instead',
        explanation: 'Legacy API - new projects should use Gemini.'
      }
    }
  },

  'ai-settings': {
    title: 'AI Configuration Settings',
    description: 'Fine-tune AI behavior and performance settings.',
    docs: 'https://revolutionary-ui.com/docs/ai-configuration',
    vars: {
      DEFAULT_AI_PROVIDER: {
        description: 'Default AI provider when user has no preference',
        example: 'openai',
        required: false,
        docs: 'https://revolutionary-ui.com/docs/ai-providers',
        recommended: 'openai',
        explanation: 'Options: openai, anthropic, google, groq, mistral, etc.',
        options: ['openai', 'anthropic', 'google', 'groq', 'mistral', 'deepseek', 'together']
      },
      AI_TEMPERATURE: {
        description: 'Default temperature for AI generation (0-2)',
        example: '0.7',
        required: false,
        docs: 'https://platform.openai.com/docs/guides/text-generation/how-should-i-set-the-temperature-parameter',
        recommended: '0.7',
        explanation: 'Lower = more focused/deterministic, Higher = more creative/random'
      },
      AI_MAX_TOKENS: {
        description: 'Default max tokens for AI responses',
        example: '2000',
        required: false,
        recommended: '2000',
        explanation: 'Maximum length of generated content. 1 token ≈ 4 characters.'
      },
      AI_TIMEOUT_MS: {
        description: 'AI request timeout in milliseconds',
        example: '30000',
        required: false,
        recommended: '30000',
        explanation: '30 seconds is usually enough for most AI responses.'
      },
      ENABLE_AI_CACHING: {
        description: 'Cache AI responses to reduce costs',
        example: 'true',
        required: false,
        recommended: 'true',
        explanation: 'Caches identical requests to save API costs.'
      },
      AI_CACHE_TTL_SECONDS: {
        description: 'How long to cache AI responses',
        example: '3600',
        required: false,
        recommended: '3600',
        explanation: '1 hour cache for generated components.'
      }
    }
  },

  'payment': {
    title: 'Payment Processing',
    description: 'Payment gateway configuration for marketplace transactions.',
    docs: 'https://stripe.com/docs',
    vars: {
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
        description: 'Stripe publishable key for Next.js (client-side)',
        example: 'pk_test_...',
        required: false,
        setupUrl: 'https://dashboard.stripe.com/test/apikeys',
        setupSteps: [
          '1. Go to Stripe Dashboard',
          '2. Sign up or sign in',
          '3. Toggle "Test mode" ON for development',
          '4. Go to Developers > API keys',
          '5. Copy "Publishable key"'
        ],
        docs: 'https://stripe.com/docs/keys',
        recommended: 'Required for Stripe in Next.js',
        explanation: 'Same as STRIPE_PUBLISHABLE_KEY but with NEXT_PUBLIC_ prefix for Next.js client-side access.'
      },
      STRIPE_PUBLISHABLE_KEY: {
        description: 'Stripe publishable key (legacy, use NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)',
        example: 'pk_test_...',
        required: false,
        setupUrl: 'https://dashboard.stripe.com/test/apikeys',
        setupSteps: [
          '1. Go to Stripe Dashboard',
          '2. Sign up or sign in',
          '3. Toggle "Test mode" ON for development',
          '4. Go to Developers > API keys',
          '5. Copy "Publishable key"'
        ],
        docs: 'https://stripe.com/docs/keys',
        recommended: 'Use NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY instead',
        explanation: 'This key is safe to use in browsers.'
      },
      STRIPE_SECRET_KEY: {
        description: 'Stripe secret key (server-side only)',
        example: 'sk_test_...',
        required: false,
        setupUrl: 'https://dashboard.stripe.com/test/apikeys',
        setupSteps: [
          '1. In Stripe Dashboard > API keys',
          '2. Copy "Secret key"',
          '3. Never expose this publicly!'
        ],
        docs: 'https://stripe.com/docs/keys#obtain-api-keys',
        recommended: 'Required for payment processing',
        explanation: 'Server-side key for creating charges and managing customers.'
      },
      STRIPE_WEBHOOK_SECRET: {
        description: 'Stripe webhook endpoint secret',
        example: 'whsec_...',
        required: false,
        setupUrl: 'https://dashboard.stripe.com/test/webhooks',
        setupSteps: [
          '1. Go to Stripe Dashboard > Webhooks',
          '2. Add endpoint: https://yourdomain.com/api/webhooks/stripe',
          '3. Select events: checkout.session.completed, etc.',
          '4. Copy "Signing secret"'
        ],
        docs: 'https://stripe.com/docs/webhooks/signatures',
        recommended: 'Required for secure webhooks',
        explanation: 'Verifies webhook requests are from Stripe.'
      },
      STRIPE_PRICE_ID_MONTHLY: {
        description: 'Stripe Price ID for monthly subscription',
        example: 'price_...',
        required: false,
        setupUrl: 'https://dashboard.stripe.com/test/products',
        setupSteps: [
          '1. Create a Product in Stripe',
          '2. Add a recurring price',
          '3. Copy the Price ID'
        ],
        docs: 'https://stripe.com/docs/products-prices/how-products-and-prices-work',
        recommended: 'Create subscription products'
      },
      STRIPE_PRICE_ID_YEARLY: {
        description: 'Stripe Price ID for yearly subscription',
        example: 'price_...',
        required: false,
        setupUrl: 'https://dashboard.stripe.com/test/products',
        docs: 'https://stripe.com/docs/billing/subscriptions/price-and-product-ids',
        recommended: 'Offer annual discount'
      },
      PAYPAL_CLIENT_ID: {
        description: 'PayPal app client ID',
        example: 'your-paypal-client-id',
        required: false,
        setupUrl: 'https://developer.paypal.com/dashboard/applications/sandbox',
        setupSteps: [
          '1. Go to PayPal Developer Dashboard',
          '2. Create app (Sandbox for testing)',
          '3. Copy Client ID'
        ],
        docs: 'https://developer.paypal.com/docs/checkout/standard/integrate/',
        recommended: 'Alternative payment method'
      },
      PAYPAL_CLIENT_SECRET: {
        description: 'PayPal app secret',
        example: 'your-paypal-client-secret',
        required: false,
        setupUrl: 'https://developer.paypal.com/dashboard/applications/sandbox',
        docs: 'https://developer.paypal.com/api/rest/',
        recommended: 'Required with PAYPAL_CLIENT_ID'
      },
      PADDLE_VENDOR_ID: {
        description: 'Paddle vendor ID',
        example: 'your-paddle-vendor-id',
        required: false,
        setupUrl: 'https://vendors.paddle.com/signup',
        docs: 'https://developer.paddle.com/getting-started/intro',
        recommended: 'Good for global payments',
        explanation: 'Paddle handles taxes and compliance globally.'
      },
      PADDLE_API_KEY: {
        description: 'Paddle API key',
        example: 'your-paddle-api-key',
        required: false,
        setupUrl: 'https://vendors.paddle.com/authentication',
        docs: 'https://developer.paddle.com/api-reference/api-authentication',
        recommended: 'Required with PADDLE_VENDOR_ID'
      }
    }
  },

  'email': {
    title: 'Email Configuration',
    description: 'Email service configuration for transactional emails.',
    docs: 'https://nodemailer.com/about/',
    vars: {
      SMTP_HOST: {
        description: 'SMTP server hostname',
        example: 'smtp.gmail.com',
        required: false,
        setupSteps: [
          'Common SMTP hosts:',
          '- Gmail: smtp.gmail.com',
          '- Outlook: smtp-mail.outlook.com',
          '- Yahoo: smtp.mail.yahoo.com',
          '- Custom: your-server.com'
        ],
        docs: 'https://nodemailer.com/smtp/',
        recommended: 'smtp.gmail.com',
        explanation: 'Your email provider\'s SMTP server.'
      },
      SMTP_PORT: {
        description: 'SMTP server port',
        example: '587',
        required: false,
        docs: 'https://nodemailer.com/smtp/#port',
        recommended: '587',
        explanation: 'Common ports: 587 (TLS), 465 (SSL), 25 (unencrypted)'
      },
      SMTP_USER: {
        description: 'SMTP username (usually email address)',
        example: 'your-email@gmail.com',
        required: false,
        recommended: 'Your email address',
        explanation: 'Usually your full email address.'
      },
      SMTP_PASSWORD: {
        description: 'SMTP password or app-specific password',
        example: 'your-smtp-password',
        required: false,
        setupSteps: [
          'For Gmail:',
          '1. Enable 2-factor authentication',
          '2. Go to https://myaccount.google.com/apppasswords',
          '3. Generate app password',
          '4. Use that instead of regular password'
        ],
        docs: 'https://support.google.com/accounts/answer/185833',
        recommended: 'Use app-specific password',
        explanation: 'Gmail/Yahoo require app passwords, not regular passwords.'
      },
      SMTP_SECURE: {
        description: 'Use TLS/SSL encryption',
        example: 'true',
        required: false,
        recommended: 'true',
        explanation: 'Set to false only for port 587 with STARTTLS.'
      },
      EMAIL_FROM: {
        description: 'Default sender email address',
        example: 'noreply@revolutionary-ui.com',
        required: false,
        recommended: 'noreply@yourdomain.com',
        explanation: 'Default "from" address for system emails.'
      },
      EMAIL_REPLY_TO: {
        description: 'Reply-to email address',
        example: 'support@revolutionary-ui.com',
        required: false,
        recommended: 'support@yourdomain.com',
        explanation: 'Where replies should go (if different from sender).'
      },
      RESEND_API_KEY: {
        description: 'Resend.com API key (modern email API)',
        example: 're_...',
        required: false,
        setupUrl: 'https://resend.com/api-keys',
        setupSteps: [
          '1. Go to Resend.com',
          '2. Sign up (free tier available)',
          '3. Verify your domain',
          '4. Create API key'
        ],
        docs: 'https://resend.com/docs/introduction',
        recommended: 'Modern alternative to SMTP',
        explanation: 'Easier than SMTP, better deliverability.',
        pricing: 'https://resend.com/pricing'
      },
      SENDGRID_API_KEY: {
        description: 'SendGrid API key',
        example: 'SG...',
        required: false,
        setupUrl: 'https://app.sendgrid.com/settings/api_keys',
        setupSteps: [
          '1. Sign up at SendGrid',
          '2. Create API key with full access',
          '3. Verify sender identity'
        ],
        docs: 'https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs',
        recommended: 'Industry standard',
        pricing: 'https://sendgrid.com/pricing/'
      },
      POSTMARK_API_KEY: {
        description: 'Postmark API key',
        example: 'your-postmark-key',
        required: false,
        setupUrl: 'https://account.postmarkapp.com/servers',
        docs: 'https://postmarkapp.com/developer/get-started/sending-email',
        recommended: 'Great for transactional email',
        explanation: 'Focuses on deliverability for transactional emails.'
      }
    }
  },

  'storage': {
    title: 'Storage Configuration',
    description: 'Cloud storage for user uploads, images, and assets.',
    docs: 'https://aws.amazon.com/s3/',
    vars: {
      S3_BUCKET_NAME: {
        description: 'AWS S3 bucket name',
        example: 'revolutionary-ui-assets',
        required: false,
        setupUrl: 'https://s3.console.aws.amazon.com/s3/bucket/create',
        setupSteps: [
          '1. Go to AWS S3 Console',
          '2. Create bucket',
          '3. Choose unique name (globally unique)',
          '4. Select region close to users',
          '5. Configure public access settings'
        ],
        docs: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html',
        recommended: 'your-app-name-assets',
        explanation: 'Must be globally unique across all AWS.'
      },
      S3_ACCESS_KEY_ID: {
        description: 'AWS Access Key ID',
        example: 'AKIA...',
        required: false,
        setupUrl: 'https://console.aws.amazon.com/iam/home#/security_credentials',
        setupSteps: [
          '1. Go to AWS IAM Console',
          '2. Create new user',
          '3. Attach S3 policy',
          '4. Create access key',
          '5. Copy Access Key ID'
        ],
        docs: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
        recommended: 'Create IAM user with S3 access only'
      },
      S3_SECRET_ACCESS_KEY: {
        description: 'AWS Secret Access Key',
        example: 'your-secret-key',
        required: false,
        setupUrl: 'https://console.aws.amazon.com/iam/',
        docs: 'https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html',
        recommended: 'Keep this very secure!',
        explanation: 'Shown only once when creating access key.'
      },
      S3_REGION: {
        description: 'AWS region for S3 bucket',
        example: 'us-east-1',
        required: false,
        docs: 'https://docs.aws.amazon.com/general/latest/gr/s3.html',
        recommended: 'us-east-1',
        explanation: 'Choose region closest to your users.',
        options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']
      },
      S3_ENDPOINT: {
        description: 'Custom S3 endpoint (for S3-compatible services)',
        example: 'https://s3.amazonaws.com',
        required: false,
        docs: 'https://docs.aws.amazon.com/general/latest/gr/s3.html',
        recommended: 'Leave empty for AWS S3',
        explanation: 'Only needed for DigitalOcean Spaces, MinIO, etc.'
      },
      CLOUDINARY_CLOUD_NAME: {
        description: 'Cloudinary cloud name',
        example: 'your-cloud-name',
        required: false,
        setupUrl: 'https://cloudinary.com/console',
        setupSteps: [
          '1. Sign up at Cloudinary',
          '2. Find cloud name in dashboard',
          '3. It\'s in your Cloudinary URL'
        ],
        docs: 'https://cloudinary.com/documentation/how_to_integrate_cloudinary',
        recommended: 'Great for image optimization',
        explanation: 'Automatic image optimization and transformation.',
        pricing: 'https://cloudinary.com/pricing'
      },
      CLOUDINARY_API_KEY: {
        description: 'Cloudinary API key',
        example: 'your-cloudinary-key',
        required: false,
        setupUrl: 'https://cloudinary.com/console/settings/security',
        docs: 'https://cloudinary.com/documentation/solution_overview#account_and_api_setup',
        recommended: 'Required with CLOUDINARY_CLOUD_NAME'
      },
      CLOUDINARY_API_SECRET: {
        description: 'Cloudinary API secret',
        example: 'your-cloudinary-secret',
        required: false,
        setupUrl: 'https://cloudinary.com/console/settings/security',
        docs: 'https://cloudinary.com/documentation/solution_overview#account_and_api_setup',
        recommended: 'Keep secret!'
      },
      UPLOADTHING_SECRET: {
        description: 'UploadThing secret key',
        example: 'sk_...',
        required: false,
        setupUrl: 'https://uploadthing.com/dashboard',
        setupSteps: [
          '1. Go to UploadThing',
          '2. Create new app',
          '3. Copy secret key'
        ],
        docs: 'https://docs.uploadthing.com/getting-started/appdir',
        recommended: 'Simple file uploads',
        explanation: 'Easy file uploads with built-in UI components.'
      },
      UPLOADTHING_APP_ID: {
        description: 'UploadThing app ID',
        example: 'your-app-id',
        required: false,
        setupUrl: 'https://uploadthing.com/dashboard',
        docs: 'https://docs.uploadthing.com/',
        recommended: 'Required with UPLOADTHING_SECRET'
      }
    }
  },

  'analytics': {
    title: 'Analytics & Monitoring',
    description: 'Track user behavior, errors, and performance.',
    docs: 'https://analytics.google.com/',
    vars: {
      NEXT_PUBLIC_GA_MEASUREMENT_ID: {
        description: 'Google Analytics 4 Measurement ID',
        example: 'G-XXXXXXXXXX',
        required: false,
        setupUrl: 'https://analytics.google.com/analytics/web/#/a/create',
        setupSteps: [
          '1. Go to Google Analytics',
          '2. Create new property (GA4)',
          '3. Add data stream for Web',
          '4. Enter your website URL',
          '5. Copy Measurement ID (G-XXXXX)'
        ],
        docs: 'https://support.google.com/analytics/answer/9304153',
        recommended: 'Free analytics',
        explanation: 'Track page views, events, and conversions.'
      },
      NEXT_PUBLIC_GTM_ID: {
        description: 'Google Tag Manager container ID',
        example: 'GTM-XXXXXX',
        required: false,
        setupUrl: 'https://tagmanager.google.com/',
        setupSteps: [
          '1. Go to Google Tag Manager',
          '2. Create account and container',
          '3. Copy GTM-XXXXX ID'
        ],
        docs: 'https://support.google.com/tagmanager/answer/6103696',
        recommended: 'For complex tracking',
        explanation: 'Manage all tracking codes in one place.'
      },
      NEXT_PUBLIC_MIXPANEL_TOKEN: {
        description: 'Mixpanel project token',
        example: 'your-mixpanel-token',
        required: false,
        setupUrl: 'https://mixpanel.com/project/new',
        setupSteps: [
          '1. Sign up at Mixpanel',
          '2. Create project',
          '3. Go to Project Settings',
          '4. Copy project token'
        ],
        docs: 'https://developer.mixpanel.com/docs/javascript-quickstart',
        recommended: 'Advanced user analytics',
        pricing: 'https://mixpanel.com/pricing/'
      },
      NEXT_PUBLIC_AMPLITUDE_API_KEY: {
        description: 'Amplitude project API key',
        example: 'your-amplitude-key',
        required: false,
        setupUrl: 'https://analytics.amplitude.com/',
        docs: 'https://www.docs.developers.amplitude.com/data/sdks/javascript/',
        recommended: 'Product analytics',
        explanation: 'Track user journeys and retention.'
      },
      NEXT_PUBLIC_POSTHOG_KEY: {
        description: 'PostHog project API key',
        example: 'phc_...',
        required: false,
        setupUrl: 'https://app.posthog.com/project/settings',
        setupSteps: [
          '1. Sign up at PostHog',
          '2. Create project',
          '3. Copy API key'
        ],
        docs: 'https://posthog.com/docs/integrate',
        recommended: 'Open source alternative',
        explanation: 'Privacy-friendly analytics and feature flags.'
      },
      NEXT_PUBLIC_POSTHOG_HOST: {
        description: 'PostHog API host',
        example: 'https://app.posthog.com',
        required: false,
        docs: 'https://posthog.com/docs/integrate/client/js#options',
        recommended: 'https://app.posthog.com',
        explanation: 'Use https://eu.posthog.com for EU hosting.'
      },
      SENTRY_DSN: {
        description: 'Sentry Data Source Name for error tracking',
        example: 'https://xxx@xxx.ingest.sentry.io/xxx',
        required: false,
        setupUrl: 'https://sentry.io/signup/',
        setupSteps: [
          '1. Sign up at Sentry',
          '2. Create new project',
          '3. Select Next.js platform',
          '4. Copy DSN from setup page'
        ],
        docs: 'https://docs.sentry.io/platforms/javascript/guides/nextjs/',
        recommended: 'Essential for production',
        explanation: 'Catch and fix errors before users report them.',
        pricing: 'https://sentry.io/pricing/'
      },
      SENTRY_AUTH_TOKEN: {
        description: 'Sentry auth token for source maps',
        example: 'your-sentry-auth-token',
        required: false,
        setupUrl: 'https://sentry.io/settings/account/api/auth-tokens/',
        setupSteps: [
          '1. Go to Sentry Settings',
          '2. Create auth token',
          '3. Scopes: project:releases'
        ],
        docs: 'https://docs.sentry.io/product/cli/configuration/#auth-token',
        recommended: 'For source map uploads'
      },
      SENTRY_ORG: {
        description: 'Sentry organization slug',
        example: 'your-org',
        required: false,
        docs: 'https://docs.sentry.io/product/cli/configuration/',
        recommended: 'Your organization name in Sentry'
      },
      SENTRY_PROJECT: {
        description: 'Sentry project slug',
        example: 'revolutionary-ui',
        required: false,
        docs: 'https://docs.sentry.io/product/cli/configuration/',
        recommended: 'Your project name in Sentry'
      },
      LOGROCKET_APP_ID: {
        description: 'LogRocket application ID',
        example: 'your-app/revolutionary-ui',
        required: false,
        setupUrl: 'https://app.logrocket.com/',
        docs: 'https://docs.logrocket.com/docs/quickstart-script',
        recommended: 'Session replay for debugging',
        explanation: 'Record user sessions to debug issues.'
      },
      DATADOG_API_KEY: {
        description: 'Datadog API key',
        example: 'your-datadog-key',
        required: false,
        setupUrl: 'https://app.datadoghq.com/organization-settings/api-keys',
        docs: 'https://docs.datadoghq.com/getting_started/api/',
        recommended: 'Full stack monitoring',
        explanation: 'Monitor infrastructure and applications.'
      },
      NEW_RELIC_LICENSE_KEY: {
        description: 'New Relic license key',
        example: 'your-new-relic-key',
        required: false,
        setupUrl: 'https://one.newrelic.com/api-keys',
        docs: 'https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/',
        recommended: 'APM and monitoring'
      }
    }
  },

  'search': {
    title: 'Search Configuration',
    description: 'Full-text search for components and documentation.',
    docs: 'https://www.algolia.com/doc/',
    vars: {
      ALGOLIA_APP_ID: {
        description: 'Algolia application ID',
        example: 'your-algolia-app-id',
        required: false,
        setupUrl: 'https://www.algolia.com/apps/new',
        setupSteps: [
          '1. Sign up at Algolia',
          '2. Create new application',
          '3. Copy Application ID',
          '4. Free tier: 10k searches/month'
        ],
        docs: 'https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/tutorials/quickstart/',
        recommended: 'Best search experience',
        pricing: 'https://www.algolia.com/pricing/'
      },
      ALGOLIA_SEARCH_API_KEY: {
        description: 'Algolia public search key',
        example: 'your-search-key',
        required: false,
        setupUrl: 'https://www.algolia.com/account/api-keys/',
        docs: 'https://www.algolia.com/doc/guides/security/api-keys/',
        recommended: 'Public key for frontend',
        explanation: 'This key is safe to expose in browsers.'
      },
      ALGOLIA_ADMIN_API_KEY: {
        description: 'Algolia admin API key',
        example: 'your-admin-key',
        required: false,
        setupUrl: 'https://www.algolia.com/account/api-keys/',
        docs: 'https://www.algolia.com/doc/guides/security/api-keys/#admin-api-key',
        recommended: 'Keep secret!',
        explanation: 'For indexing data - never expose publicly.'
      },
      ALGOLIA_INDEX_NAME: {
        description: 'Algolia index name',
        example: 'revolutionary_ui_components',
        required: false,
        recommended: 'prod_components',
        explanation: 'Like a database table for search data.'
      },
      ELASTICSEARCH_NODE: {
        description: 'Elasticsearch cluster URL',
        example: 'http://localhost:9200',
        required: false,
        setupUrl: 'https://www.elastic.co/cloud/elasticsearch-service/signup',
        docs: 'https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/introduction.html',
        recommended: 'Self-hosted option',
        explanation: 'Open source search engine.'
      },
      ELASTICSEARCH_API_KEY: {
        description: 'Elasticsearch API key',
        example: 'your-elasticsearch-key',
        required: false,
        docs: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/security-api-create-api-key.html',
        recommended: 'For cloud Elasticsearch'
      },
      MEILISEARCH_HOST: {
        description: 'MeiliSearch instance URL',
        example: 'http://localhost:7700',
        required: false,
        setupUrl: 'https://cloud.meilisearch.com/',
        setupSteps: [
          '1. Sign up for cloud OR',
          '2. Self-host with Docker:',
          '   docker run -p 7700:7700 getmeili/meilisearch'
        ],
        docs: 'https://docs.meilisearch.com/learn/getting_started/quick_start.html',
        recommended: 'Easy open source search',
        explanation: 'Simpler alternative to Elasticsearch.'
      },
      MEILISEARCH_API_KEY: {
        description: 'MeiliSearch master key',
        example: 'your-meilisearch-key',
        required: false,
        docs: 'https://docs.meilisearch.com/learn/security/master_api_keys.html',
        recommended: 'Generate secure key'
      },
      TYPESENSE_HOST: {
        description: 'Typesense server URL',
        example: 'http://localhost:8108',
        required: false,
        setupUrl: 'https://cloud.typesense.org/',
        docs: 'https://typesense.org/docs/guide/install-typesense.html',
        recommended: 'Fast typo-tolerant search',
        explanation: 'Designed for instant search experiences.'
      },
      TYPESENSE_API_KEY: {
        description: 'Typesense API key',
        example: 'your-typesense-key',
        required: false,
        docs: 'https://typesense.org/docs/latest/api/api-keys.html',
        recommended: 'Create search-only key for frontend'
      }
    }
  },

  'cache': {
    title: 'Cache Configuration',
    description: 'Caching layer for improved performance.',
    docs: 'https://redis.io/docs/',
    vars: {
      REDIS_URL: {
        description: 'Redis connection URL',
        example: 'redis://localhost:6379',
        required: false,
        setupSteps: [
          'Local development:',
          '1. Install Redis: brew install redis',
          '2. Start: redis-server',
          '3. Use: redis://localhost:6379',
          '',
          'Production:',
          '- Use Redis Cloud or AWS ElastiCache'
        ],
        docs: 'https://redis.io/docs/getting-started/',
        recommended: 'redis://localhost:6379',
        explanation: 'In-memory data store for caching.'
      },
      REDIS_PASSWORD: {
        description: 'Redis password (if configured)',
        example: 'your-redis-password',
        required: false,
        docs: 'https://redis.io/docs/manual/security/acl/',
        recommended: 'Required for production',
        explanation: 'Only if Redis requires authentication.'
      },
      UPSTASH_REDIS_REST_URL: {
        description: 'Upstash Redis REST API URL',
        example: 'https://xxx.upstash.io',
        required: false,
        setupUrl: 'https://console.upstash.com/',
        setupSteps: [
          '1. Sign up at Upstash',
          '2. Create Redis database',
          '3. Copy REST URL',
          '4. Serverless Redis!'
        ],
        docs: 'https://docs.upstash.com/redis',
        recommended: 'Great for serverless',
        explanation: 'Redis compatible, works in edge functions.',
        pricing: 'https://upstash.com/pricing'
      },
      UPSTASH_REDIS_REST_TOKEN: {
        description: 'Upstash Redis REST token',
        example: 'your-upstash-token',
        required: false,
        setupUrl: 'https://console.upstash.com/',
        docs: 'https://docs.upstash.com/redis/features/restapi',
        recommended: 'Required with UPSTASH_REDIS_REST_URL'
      },
      MEMCACHED_SERVERS: {
        description: 'Memcached server addresses',
        example: 'localhost:11211',
        required: false,
        docs: 'https://memcached.org/about',
        recommended: 'Alternative to Redis',
        explanation: 'Simpler caching, no persistence.'
      }
    }
  },

  'queue': {
    title: 'Queue & Background Jobs',
    description: 'Process tasks asynchronously for better performance.',
    docs: 'https://docs.bullmq.io/',
    vars: {
      QUEUE_TYPE: {
        description: 'Queue system to use',
        example: 'redis',
        required: false,
        recommended: 'redis',
        explanation: 'Options: redis (Bull), sqs (AWS), rabbitmq',
        options: ['redis', 'sqs', 'rabbitmq']
      },
      SQS_QUEUE_URL: {
        description: 'AWS SQS queue URL',
        example: 'https://sqs.region.amazonaws.com/account/queue-name',
        required: false,
        setupUrl: 'https://console.aws.amazon.com/sqs/',
        setupSteps: [
          '1. Go to AWS SQS Console',
          '2. Create queue',
          '3. Copy queue URL'
        ],
        docs: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html',
        recommended: 'For AWS deployments'
      },
      RABBITMQ_URL: {
        description: 'RabbitMQ connection URL',
        example: 'amqp://localhost',
        required: false,
        setupSteps: [
          'Local: docker run -p 5672:5672 rabbitmq',
          'Cloud: Use CloudAMQP'
        ],
        docs: 'https://www.rabbitmq.com/tutorials/tutorial-one-javascript.html',
        recommended: 'Advanced message queuing'
      },
      BULL_REDIS_URL: {
        description: 'Redis URL for Bull queue',
        example: 'redis://localhost:6379',
        required: false,
        docs: 'https://docs.bullmq.io/guide/connections',
        recommended: 'Same as REDIS_URL',
        explanation: 'Bull uses Redis for job storage.'
      }
    }
  },

  'cdn': {
    title: 'CDN Configuration',
    description: 'Content delivery network for fast asset serving.',
    docs: 'https://developers.cloudflare.com/',
    vars: {
      CDN_URL: {
        description: 'CDN base URL for assets',
        example: 'https://cdn.revolutionary-ui.com',
        required: false,
        recommended: 'https://cdn.yourdomain.com',
        explanation: 'Prefix for all static assets.'
      },
      CLOUDFLARE_ZONE_ID: {
        description: 'Cloudflare zone ID',
        example: 'your-zone-id',
        required: false,
        setupUrl: 'https://dash.cloudflare.com/',
        setupSteps: [
          '1. Add your domain to Cloudflare',
          '2. Go to Overview page',
          '3. Find Zone ID in right sidebar'
        ],
        docs: 'https://developers.cloudflare.com/fundamentals/get-started/basic-tasks/find-account-and-zone-ids/',
        recommended: 'For cache purging'
      },
      CLOUDFLARE_API_TOKEN: {
        description: 'Cloudflare API token',
        example: 'your-cloudflare-token',
        required: false,
        setupUrl: 'https://dash.cloudflare.com/profile/api-tokens',
        setupSteps: [
          '1. Create API token',
          '2. Use template: Edit zone',
          '3. Permissions: Cache Purge'
        ],
        docs: 'https://developers.cloudflare.com/api/tokens/create/',
        recommended: 'Scoped token, not global key'
      },
      FASTLY_API_KEY: {
        description: 'Fastly API key',
        example: 'your-fastly-key',
        required: false,
        setupUrl: 'https://manage.fastly.com/account/personal/tokens',
        docs: 'https://developer.fastly.com/reference/api/auth/',
        recommended: 'Alternative to Cloudflare'
      },
      FASTLY_SERVICE_ID: {
        description: 'Fastly service ID',
        example: 'your-service-id',
        required: false,
        docs: 'https://developer.fastly.com/reference/api/services/',
        recommended: 'Required with FASTLY_API_KEY'
      }
    }
  },

  'security': {
    title: 'Security Configuration',
    description: 'Security settings and encryption keys.',
    docs: 'https://cheatsheetseries.owasp.org/cheatsheets/DotNet_Security_Cheat_Sheet.html#encryption',
    vars: {
      ENCRYPTION_KEY: {
        description: 'Master encryption key for sensitive data (32 chars)',
        example: 'your-32-character-encryption-key',
        required: false,
        setupSteps: [
          'Generate secure key:',
          '1. openssl rand -hex 16',
          '2. Or use: https://generate-secret.vercel.app/32'
        ],
        recommended: 'Generate unique key',
        explanation: 'Used to encrypt sensitive data in database.'
      },
      JWT_SECRET: {
        description: 'JWT signing secret',
        example: 'your-jwt-secret',
        required: false,
        docs: 'https://jwt.io/introduction',
        recommended: 'Same as NEXTAUTH_SECRET',
        explanation: 'For custom JWT generation.'
      },
      CSRF_SECRET: {
        description: 'CSRF token secret',
        example: 'your-csrf-secret',
        required: false,
        docs: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html',
        recommended: 'Generate unique secret',
        explanation: 'Prevents cross-site request forgery attacks.'
      },
      RATE_LIMIT_MAX: {
        description: 'Max API requests per window',
        example: '100',
        required: false,
        recommended: '100',
        explanation: 'Prevent API abuse.'
      },
      RATE_LIMIT_WINDOW_MS: {
        description: 'Rate limit time window (ms)',
        example: '900000',
        required: false,
        recommended: '900000',
        explanation: '900000ms = 15 minutes'
      },
      ALLOWED_ORIGINS: {
        description: 'Allowed CORS origins (comma-separated)',
        example: 'http://localhost:3000,https://revolutionary-ui.com',
        required: false,
        docs: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS',
        recommended: 'Your domains only',
        explanation: 'Prevents unauthorized API access.'
      },
      CONTENT_SECURITY_POLICY: {
        description: 'CSP header value',
        example: "default-src 'self'",
        required: false,
        docs: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
        recommended: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
        explanation: 'Prevents XSS attacks.'
      },
      HCAPTCHA_SITE_KEY: {
        description: 'hCaptcha site key (public)',
        example: 'your-hcaptcha-site-key',
        required: false,
        setupUrl: 'https://dashboard.hcaptcha.com/sites/new',
        setupSteps: [
          '1. Sign up at hCaptcha',
          '2. Add new site',
          '3. Copy site key'
        ],
        docs: 'https://docs.hcaptcha.com/',
        recommended: 'Privacy-focused captcha',
        explanation: 'Alternative to Google reCAPTCHA.'
      },
      HCAPTCHA_SECRET_KEY: {
        description: 'hCaptcha secret key',
        example: 'your-hcaptcha-secret',
        required: false,
        setupUrl: 'https://dashboard.hcaptcha.com/',
        docs: 'https://docs.hcaptcha.com/configuration#verify-the-user-response-server-side',
        recommended: 'Required with HCAPTCHA_SITE_KEY'
      },
      RECAPTCHA_SITE_KEY: {
        description: 'Google reCAPTCHA v3 site key',
        example: 'your-recaptcha-site-key',
        required: false,
        setupUrl: 'https://www.google.com/recaptcha/admin/create',
        setupSteps: [
          '1. Go to reCAPTCHA admin',
          '2. Register new site',
          '3. Choose v3',
          '4. Add domains',
          '5. Copy site key'
        ],
        docs: 'https://developers.google.com/recaptcha/docs/v3',
        recommended: 'Popular option'
      },
      RECAPTCHA_SECRET_KEY: {
        description: 'Google reCAPTCHA secret key',
        example: 'your-recaptcha-secret',
        required: false,
        setupUrl: 'https://www.google.com/recaptcha/admin/',
        docs: 'https://developers.google.com/recaptcha/docs/verify',
        recommended: 'Required with RECAPTCHA_SITE_KEY'
      }
    }
  },

  'features': {
    title: 'Feature Flags',
    description: 'Enable or disable features without code changes.',
    docs: 'https://revolutionary-ui.com/docs/feature-flags',
    vars: {
      ENABLE_MARKETPLACE: {
        description: 'Enable component marketplace features',
        example: 'true',
        required: false,
        recommended: 'true',
        explanation: 'Allows buying/selling components.',
        options: ['true', 'false']
      },
      ENABLE_AI_GENERATION: {
        description: 'Enable AI component generation',
        example: 'true',
        required: false,
        recommended: 'true',
        explanation: 'AI-powered component creation.',
        options: ['true', 'false']
      },
      ENABLE_TEAM_FEATURES: {
        description: 'Enable team collaboration',
        example: 'true',
        required: false,
        recommended: 'true',
        explanation: 'Teams, projects, sharing.',
        options: ['true', 'false']
      },
      ENABLE_PRIVATE_REGISTRY: {
        description: 'Enable private NPM registry',
        example: 'false',
        required: false,
        recommended: 'false',
        explanation: 'Host private packages.',
        options: ['true', 'false']
      },
      ENABLE_ANALYTICS: {
        description: 'Enable analytics tracking',
        example: 'true',
        required: false,
        recommended: 'true',
        explanation: 'Track usage and errors.',
        options: ['true', 'false']
      },
      ENABLE_NOTIFICATIONS: {
        description: 'Enable notification system',
        example: 'true',
        required: false,
        recommended: 'true',
        explanation: 'Email and in-app notifications.',
        options: ['true', 'false']
      },
      ENABLE_WEBHOOKS: {
        description: 'Enable webhook system',
        example: 'true',
        required: false,
        recommended: 'true',
        explanation: 'Send events to external services.',
        options: ['true', 'false']
      },
      ENABLE_API_DOCS: {
        description: 'Enable API documentation UI',
        example: 'true',
        required: false,
        recommended: 'true',
        explanation: 'Swagger/OpenAPI docs.',
        options: ['true', 'false']
      },
      ENABLE_PLAYGROUND: {
        description: 'Enable component playground',
        example: 'true',
        required: false,
        recommended: 'true',
        explanation: 'Interactive component testing.',
        options: ['true', 'false']
      },
      ENABLE_VISUAL_BUILDER: {
        description: 'Enable visual component builder',
        example: 'true',
        required: false,
        recommended: 'true',
        explanation: 'Drag-and-drop UI builder.',
        options: ['true', 'false']
      },
      MAINTENANCE_MODE: {
        description: 'Enable maintenance mode',
        example: 'false',
        required: false,
        recommended: 'false',
        explanation: 'Shows maintenance page to users.',
        options: ['true', 'false']
      }
    }
  },

  'api': {
    title: 'API Configuration',
    description: 'API settings and authentication.',
    docs: 'https://revolutionary-ui.com/docs/api',
    vars: {
      API_URL: {
        description: 'Base API URL',
        example: 'http://localhost:3000/api',
        required: false,
        recommended: 'http://localhost:3000/api',
        explanation: 'For API client configuration.'
      },
      API_KEY: {
        description: 'Master API key for admin access',
        example: 'your-api-key',
        required: false,
        setupSteps: [
          'Generate secure key:',
          'openssl rand -base64 32'
        ],
        recommended: 'Generate unique key',
        explanation: 'Bypass auth for admin operations.'
      },
      API_RATE_LIMIT: {
        description: 'API requests per minute',
        example: '60',
        required: false,
        recommended: '60',
        explanation: 'Per-user rate limiting.'
      },
      WEBHOOK_SECRET: {
        description: 'Secret for webhook signatures',
        example: 'your-webhook-secret',
        required: false,
        recommended: 'Generate unique secret',
        explanation: 'Verify webhook authenticity.'
      },
      GRAPHQL_ENDPOINT: {
        description: 'GraphQL API endpoint path',
        example: '/api/graphql',
        required: false,
        recommended: '/api/graphql',
        explanation: 'If using GraphQL.'
      },
      REST_API_VERSION: {
        description: 'REST API version',
        example: 'v1',
        required: false,
        recommended: 'v1',
        explanation: 'API versioning prefix.'
      }
    }
  },

  'registry': {
    title: 'Private Registry Configuration',
    description: 'Host private component packages.',
    docs: 'https://docs.npmjs.com/creating-and-publishing-private-packages',
    vars: {
      NPM_REGISTRY_URL: {
        description: 'Private NPM registry URL',
        example: 'https://npm.revolutionary-ui.com',
        required: false,
        setupSteps: [
          'Options:',
          '1. Verdaccio (self-hosted)',
          '2. npm Enterprise',
          '3. GitHub Packages',
          '4. GitLab Package Registry'
        ],
        docs: 'https://verdaccio.org/docs/installation',
        recommended: 'Use Verdaccio for self-hosting',
        explanation: 'Host private packages internally.'
      },
      NPM_REGISTRY_TOKEN: {
        description: 'NPM registry auth token',
        example: 'your-registry-token',
        required: false,
        docs: 'https://docs.npmjs.com/creating-and-viewing-access-tokens',
        recommended: 'Generate from registry',
        explanation: 'For publishing packages.'
      },
      DOCKER_REGISTRY_URL: {
        description: 'Docker registry URL',
        example: 'docker.revolutionary-ui.com',
        required: false,
        docs: 'https://docs.docker.com/registry/',
        recommended: 'For container images',
        explanation: 'If using Docker deployments.'
      },
      DOCKER_REGISTRY_USER: {
        description: 'Docker registry username',
        example: 'your-docker-user',
        required: false,
        recommended: 'Registry username'
      },
      DOCKER_REGISTRY_PASSWORD: {
        description: 'Docker registry password',
        example: 'your-docker-password',
        required: false,
        recommended: 'Keep secure!'
      }
    }
  },

  'development': {
    title: 'Development Settings',
    description: 'Development environment configuration.',
    docs: 'https://nextjs.org/docs/basic-features/environment-variables',
    vars: {
      NODE_ENV: {
        description: 'Node environment',
        example: 'development',
        required: false,
        recommended: 'development',
        explanation: 'Set to production in production!',
        options: ['development', 'production', 'test']
      },
      PORT: {
        description: 'Server port',
        example: '3000',
        required: false,
        recommended: '3000',
        explanation: 'Port for local development.'
      },
      HOST: {
        description: 'Server host',
        example: '0.0.0.0',
        required: false,
        recommended: '0.0.0.0',
        explanation: '0.0.0.0 allows external access.'
      },
      LOG_LEVEL: {
        description: 'Logging verbosity',
        example: 'info',
        required: false,
        recommended: 'info',
        explanation: 'debug, info, warn, error',
        options: ['debug', 'info', 'warn', 'error']
      },
      DEBUG: {
        description: 'Debug namespaces',
        example: 'revolutionary-ui:*',
        required: false,
        docs: 'https://www.npmjs.com/package/debug',
        recommended: 'revolutionary-ui:*',
        explanation: 'Enable debug logs by namespace.'
      },
      ANALYZE_BUNDLE: {
        description: 'Enable bundle size analysis',
        example: 'false',
        required: false,
        recommended: 'false',
        explanation: 'Set to true to analyze bundle.',
        options: ['true', 'false']
      },
      NEXT_TELEMETRY_DISABLED: {
        description: 'Disable Next.js telemetry',
        example: '1',
        required: false,
        docs: 'https://nextjs.org/telemetry',
        recommended: '1',
        explanation: 'Opt out of anonymous telemetry.',
        options: ['1', '0']
      }
    }
  },

  'deployment': {
    title: 'Deployment Configuration',
    description: 'Platform-specific deployment settings.',
    docs: 'https://nextjs.org/docs/deployment',
    vars: {
      VERCEL_URL: {
        description: 'Vercel deployment URL (auto-set)',
        example: 'https://revolutionary-ui.vercel.app',
        required: false,
        docs: 'https://vercel.com/docs/concepts/projects/environment-variables#system-environment-variables',
        recommended: 'Automatically set by Vercel',
        explanation: 'Vercel provides this automatically.'
      },
      VERCEL_ENV: {
        description: 'Vercel environment (auto-set)',
        example: 'production',
        required: false,
        docs: 'https://vercel.com/docs/concepts/projects/environment-variables#system-environment-variables',
        recommended: 'Automatically set',
        options: ['production', 'preview', 'development']
      },
      NETLIFY_URL: {
        description: 'Netlify deployment URL',
        example: 'https://revolutionary-ui.netlify.app',
        required: false,
        setupUrl: 'https://app.netlify.com/',
        docs: 'https://docs.netlify.com/configure-builds/environment-variables/',
        recommended: 'Auto-set by Netlify'
      },
      RAILWAY_STATIC_URL: {
        description: 'Railway deployment URL',
        example: 'https://revolutionary-ui.railway.app',
        required: false,
        setupUrl: 'https://railway.app/',
        docs: 'https://docs.railway.app/develop/variables',
        recommended: 'Auto-set by Railway'
      },
      RENDER_EXTERNAL_URL: {
        description: 'Render deployment URL',
        example: 'https://revolutionary-ui.onrender.com',
        required: false,
        setupUrl: 'https://render.com/',
        docs: 'https://render.com/docs/environment-variables',
        recommended: 'Auto-set by Render'
      },
      FLY_APP_NAME: {
        description: 'Fly.io app name',
        example: 'revolutionary-ui',
        required: false,
        setupUrl: 'https://fly.io/',
        docs: 'https://fly.io/docs/reference/secrets/',
        recommended: 'Your app name on Fly'
      }
    }
  },

  'integrations': {
    title: 'Third-Party Integrations',
    description: 'Connect with external services and platforms.',
    docs: 'https://revolutionary-ui.com/docs/integrations',
    vars: {
      SLACK_WEBHOOK_URL: {
        description: 'Slack incoming webhook URL',
        example: 'https://hooks.slack.com/services/xxx/xxx/xxx',
        required: false,
        setupUrl: 'https://api.slack.com/messaging/webhooks',
        setupSteps: [
          '1. Go to Slack App Directory',
          '2. Create app or use "Incoming Webhooks"',
          '3. Add to workspace',
          '4. Choose channel',
          '5. Copy webhook URL'
        ],
        docs: 'https://api.slack.com/messaging/webhooks',
        recommended: 'For notifications',
        explanation: 'Send alerts to Slack channel.'
      },
      SLACK_BOT_TOKEN: {
        description: 'Slack bot user OAuth token',
        example: 'xoxb-...',
        required: false,
        setupUrl: 'https://api.slack.com/apps',
        setupSteps: [
          '1. Create Slack app',
          '2. Add OAuth scopes',
          '3. Install to workspace',
          '4. Copy bot token'
        ],
        docs: 'https://api.slack.com/authentication/oauth-v2',
        recommended: 'For interactive Slack bot'
      },
      DISCORD_WEBHOOK_URL: {
        description: 'Discord webhook URL',
        example: 'https://discord.com/api/webhooks/xxx/xxx',
        required: false,
        setupSteps: [
          '1. Open Discord server settings',
          '2. Go to Integrations > Webhooks',
          '3. Create webhook',
          '4. Copy URL'
        ],
        docs: 'https://discord.com/developers/docs/resources/webhook',
        recommended: 'For Discord notifications'
      },
      DISCORD_BOT_TOKEN: {
        description: 'Discord bot token',
        example: 'your-discord-bot-token',
        required: false,
        setupUrl: 'https://discord.com/developers/applications',
        docs: 'https://discord.com/developers/docs/getting-started',
        recommended: 'For Discord bot features'
      },
      TELEGRAM_BOT_TOKEN: {
        description: 'Telegram bot token',
        example: 'your-telegram-bot-token',
        required: false,
        setupSteps: [
          '1. Message @BotFather on Telegram',
          '2. Send /newbot',
          '3. Choose name and username',
          '4. Copy token'
        ],
        docs: 'https://core.telegram.org/bots#how-do-i-create-a-bot',
        recommended: 'For Telegram notifications'
      },
      TELEGRAM_CHAT_ID: {
        description: 'Telegram chat/channel ID',
        example: 'your-chat-id',
        required: false,
        setupSteps: [
          '1. Add bot to chat/channel',
          '2. Send message',
          '3. Visit: https://api.telegram.org/bot<token>/getUpdates',
          '4. Find chat.id'
        ],
        docs: 'https://core.telegram.org/bots/api#getupdates',
        recommended: 'Required with TELEGRAM_BOT_TOKEN'
      },
      TWILIO_ACCOUNT_SID: {
        description: 'Twilio account SID',
        example: 'AC...',
        required: false,
        setupUrl: 'https://console.twilio.com/',
        setupSteps: [
          '1. Sign up at Twilio',
          '2. Find Account SID in console',
          '3. Get phone number'
        ],
        docs: 'https://www.twilio.com/docs/iam/keys/api-key',
        recommended: 'For SMS notifications',
        pricing: 'https://www.twilio.com/pricing'
      },
      TWILIO_AUTH_TOKEN: {
        description: 'Twilio auth token',
        example: 'your-twilio-token',
        required: false,
        setupUrl: 'https://console.twilio.com/',
        docs: 'https://www.twilio.com/docs/iam/keys/api-key',
        recommended: 'Keep secret!'
      },
      TWILIO_PHONE_NUMBER: {
        description: 'Twilio phone number',
        example: '+1234567890',
        required: false,
        docs: 'https://www.twilio.com/docs/phone-numbers',
        recommended: 'Your Twilio number',
        explanation: 'Must be in E.164 format (+1234567890).'
      },
      ZAPIER_WEBHOOK_URL: {
        description: 'Zapier webhook URL',
        example: 'https://hooks.zapier.com/hooks/catch/xxx/xxx',
        required: false,
        setupUrl: 'https://zapier.com/apps/webhook/integrations',
        setupSteps: [
          '1. Create Zap',
          '2. Choose Webhooks by Zapier',
          '3. Select "Catch Hook"',
          '4. Copy webhook URL'
        ],
        docs: 'https://zapier.com/help/create/code-webhooks/trigger-zaps-from-webhooks',
        recommended: 'Connect 5000+ apps'
      },
      IFTTT_WEBHOOK_KEY: {
        description: 'IFTTT Webhooks key',
        example: 'your-ifttt-key',
        required: false,
        setupUrl: 'https://ifttt.com/maker_webhooks',
        setupSteps: [
          '1. Go to IFTTT Webhooks',
          '2. Click Documentation',
          '3. Copy key'
        ],
        docs: 'https://ifttt.com/maker_webhooks',
        recommended: 'Simple automations'
      }
    }
  },

  'scraping': {
    title: 'Web Scraping & Data Tools',
    description: 'Extract data from websites and documents.',
    docs: 'https://firecrawl.dev/docs',
    vars: {
      FIRECRAWL_API_KEY: {
        description: 'Firecrawl API key for web scraping',
        example: 'fc-...',
        required: false,
        setupUrl: 'https://firecrawl.dev/app/api-keys',
        setupSteps: [
          '1. Sign up at Firecrawl',
          '2. Go to API Keys',
          '3. Create new key',
          '4. 500 free credits/month'
        ],
        docs: 'https://docs.firecrawl.dev/',
        recommended: 'Best scraping tool',
        explanation: 'Scrape without getting blocked.',
        pricing: 'https://firecrawl.dev/pricing'
      },
      BROWSERLESS_API_KEY: {
        description: 'Browserless API key',
        example: 'your-browserless-key',
        required: false,
        setupUrl: 'https://cloud.browserless.io/account/',
        docs: 'https://docs.browserless.io/',
        recommended: 'Headless browser API',
        explanation: 'Run Puppeteer/Playwright in cloud.'
      },
      SCRAPINGBEE_API_KEY: {
        description: 'ScrapingBee API key',
        example: 'your-scrapingbee-key',
        required: false,
        setupUrl: 'https://app.scrapingbee.com/account/register',
        docs: 'https://www.scrapingbee.com/documentation/',
        recommended: 'JavaScript rendering',
        pricing: 'https://www.scrapingbee.com/pricing/'
      },
      SCRAPERAPI_KEY: {
        description: 'ScraperAPI key',
        example: 'your-scraperapi-key',
        required: false,
        setupUrl: 'https://dashboard.scraperapi.com/signup',
        docs: 'https://docs.scraperapi.com/',
        recommended: 'Proxy rotation',
        pricing: 'https://www.scraperapi.com/pricing/'
      },
      BRIGHTDATA_CUSTOMER_ID: {
        description: 'Bright Data customer ID',
        example: 'your-customer-id',
        required: false,
        setupUrl: 'https://brightdata.com/',
        docs: 'https://docs.brightdata.com/',
        recommended: 'Enterprise scraping',
        explanation: 'Formerly Luminati, premium proxies.'
      },
      BRIGHTDATA_PASSWORD: {
        description: 'Bright Data password',
        example: 'your-brightdata-password',
        required: false,
        docs: 'https://docs.brightdata.com/api',
        recommended: 'Required with customer ID'
      }
    }
  },

  'marketplace': {
    title: 'Marketplace Settings',
    description: 'Configure marketplace behavior and fees.',
    docs: 'https://revolutionary-ui.com/docs/marketplace',
    vars: {
      MARKETPLACE_FEE_PERCENTAGE: {
        description: 'Platform fee percentage (0-100)',
        example: '30',
        required: false,
        recommended: '30',
        explanation: 'Platform takes 30%, creator gets 70%.'
      },
      MARKETPLACE_MIN_PRICE: {
        description: 'Minimum component price in cents',
        example: '99',
        required: false,
        recommended: '99',
        explanation: '$0.99 minimum.'
      },
      MARKETPLACE_MAX_PRICE: {
        description: 'Maximum component price in cents',
        example: '99900',
        required: false,
        recommended: '99900',
        explanation: '$999.00 maximum.'
      },
      MARKETPLACE_CURRENCY: {
        description: 'Default marketplace currency',
        example: 'USD',
        required: false,
        recommended: 'USD',
        explanation: 'ISO 4217 currency code.',
        options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
      },
      MARKETPLACE_PAYOUT_DELAY_DAYS: {
        description: 'Days before creator payout',
        example: '7',
        required: false,
        recommended: '7',
        explanation: 'Hold period for refunds.'
      }
    }
  },

  'experimental': {
    title: 'Experimental Features',
    description: 'Try cutting-edge features (may be unstable).',
    docs: 'https://revolutionary-ui.com/docs/experimental',
    vars: {
      ENABLE_EDGE_FUNCTIONS: {
        description: 'Deploy components as edge functions',
        example: 'false',
        required: false,
        recommended: 'false',
        explanation: 'Experimental: Run components at edge.',
        options: ['true', 'false']
      },
      ENABLE_WASM_COMPONENTS: {
        description: 'WebAssembly component support',
        example: 'false',
        required: false,
        recommended: 'false',
        explanation: 'Experimental: WASM components.',
        options: ['true', 'false']
      },
      ENABLE_BLOCKCHAIN_INTEGRATION: {
        description: 'Blockchain features (NFT components)',
        example: 'false',
        required: false,
        recommended: 'false',
        explanation: 'Experimental: Web3 integration.',
        options: ['true', 'false']
      },
      ENABLE_AR_PREVIEW: {
        description: 'AR component preview',
        example: 'false',
        required: false,
        recommended: 'false',
        explanation: 'Experimental: View in AR.',
        options: ['true', 'false']
      },
      ENABLE_VOICE_COMMANDS: {
        description: 'Voice control interface',
        example: 'false',
        required: false,
        recommended: 'false',
        explanation: 'Experimental: Voice commands.',
        options: ['true', 'false']
      },
      EXPERIMENTAL_TURBO_MODE: {
        description: 'Turbo compilation mode',
        example: 'false',
        required: false,
        recommended: 'false',
        explanation: 'Experimental: Faster builds.',
        options: ['true', 'false']
      }
    }
  }
};

module.exports = { ENV_COMPLETE_DEFINITIONS };