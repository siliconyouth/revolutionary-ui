# Supabase Database Setup

## Quick Setup

1. Create a new Supabase project at https://supabase.com
2. Copy the project URL and anon key from your project settings
3. Create `.env.local` file from the sample:
   ```bash
   cp .env.sample .env.local
   ```
4. Update `.env.local` with your Supabase credentials

## Database Migration

To set up the database tables, run the SQL migration in the Supabase SQL editor:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy and paste the contents of `migrations/001_initial_schema.sql`
5. Execute the query

This will create:
- `profiles` table - User profiles
- `ai_providers` table - AI provider configurations
- `user_subscriptions` table - Subscription management
- `ai_usage` table - Usage tracking
- `generated_components` table - Component generation history
- All necessary RLS policies and triggers

## Manual Table Creation (Alternative)

If you prefer to create tables through the UI:

### 1. Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Enable Row Level Security
After creating tables, enable RLS for each table in the Authentication > Policies section.

## Testing the Setup

1. Sign up for a new account on the marketplace
2. Check that a profile is automatically created
3. Configure an AI provider in the dashboard
4. Generate a component to test the full flow