# Revolutionary UI Environment Setup

## Centralized Environment Configuration

Revolutionary UI uses **dotenvx** for modern environment management with a single centralized `.env.local` file at the project root.

### Quick Setup

1. **Copy the sample environment file:**
   ```bash
   cp .env.sample .env.local
   ```

2. **Configure your environment variables in `.env.local`**

3. **Verify your configuration:**
   ```bash
   npm run env:check
   ```

### Key Features

- **Single Source of Truth**: All environment variables are stored in the root `.env.local` file
- **Automatic Loading**: dotenvx automatically loads the environment for all commands
- **Type Safety**: Full TypeScript support
- **Security**: `.env.local` is gitignored by default
- **Validation**: Built-in checks for required variables

### Environment Variables

The system requires the following environment variables:

#### Database Configuration
- `DATABASE_URL` - Direct PostgreSQL connection
- `DATABASE_URL_PRISMA` - Pooled connection for Prisma
- `DIRECT_URL` - Direct URL for migrations

#### Supabase
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key

#### Stripe
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Public key

#### AI Providers
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `GOOGLE_AI_API_KEY` - Google AI API key
- `MISTRAL_API_KEY` - Mistral API key
- `GROQ_API_KEY` - Groq API key

#### Authentication
- `NEXTAUTH_URL` - NextAuth base URL
- `NEXTAUTH_SECRET` - NextAuth secret

### Commands

```bash
# Check environment status
npm run env:check

# Test environment loading
npm run env:load

# Database commands (automatically use .env.local)
npm run prisma:generate
npm run prisma:push
npm run prisma:migrate
npm run prisma:studio
```

### How It Works

1. **Root `.env.local`**: All environment variables are defined here
2. **dotenvx Integration**: Automatically loads environment for all commands
3. **Subdirectory Support**: The marketplace-nextjs folder automatically uses the root .env.local
4. **CLI Tools**: All CLI commands inherit the environment automatically

### Troubleshooting

If environment variables aren't loading:

1. Ensure `.env.local` exists in the project root
2. Run `npm run env:check` to verify all variables are set
3. Check that dotenvx is installed: `npm list @dotenvx/dotenvx`
4. For debugging, set `debug: true` in `.dotenvx` config file

### Benefits of dotenvx

- **Encrypted .env files**: Keep sensitive data secure
- **Multiple environments**: Easy switching between dev/staging/prod
- **Better error handling**: Clear error messages
- **Type safety**: Full TypeScript support
- **Validation**: Ensure required variables are set
- **Expansion**: Support for variable expansion (e.g., `$OTHER_VAR`)