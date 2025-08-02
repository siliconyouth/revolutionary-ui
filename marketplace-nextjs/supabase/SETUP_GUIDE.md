# Supabase Database Setup Guide

This guide helps you set up the database schema for the Revolutionary UI.

## Prerequisites

- A Supabase project (create one at https://app.supabase.com)
- Database access credentials

## Project Details

- **Project Name**: revolutionary-ui  
- **Project Ref**: dddpacosylkmyfiouvop
- **Region**: Central EU (Frankfurt)
- **Dashboard URL**: https://supabase.com/dashboard/project/dddpacosylkmyfiouvop

## Setup Steps

### Option 1: Using Supabase CLI (Recommended)

1. **Link to the project** (requires database password):
   ```bash
   supabase link --project-ref dddpacosylkmyfiouvop
   ```

2. **Push migrations**:
   ```bash
   supabase db push
   ```

### Option 2: Using Supabase Dashboard

1. **Navigate to SQL Editor**:
   - Go to https://supabase.com/dashboard/project/dddpacosylkmyfiouvop/sql
   - Click "New query"

2. **Run the complete schema**:
   - Copy the contents of `supabase/migrations/complete_schema.sql`
   - Paste into the SQL editor
   - Click "Run"

### Option 3: Using Individual Migrations

Run these migrations in order:
1. `001_initial_schema.sql` - Creates base tables and RLS policies
2. `002_subscription_updates.sql` - Adds subscription features and functions

## Post-Setup Configuration

### 1. Enable Authentication Providers

Navigate to Authentication > Providers in your Supabase dashboard:

- **Email**: Enable email authentication
- **GitHub**: Add OAuth credentials
- **Google**: Add OAuth credentials

### 2. Configure Environment Variables

Update your `.env.local` file with values from:
- **Settings > API**: Get your project URL and anon key
- **Settings > Database**: Get your service role key (keep this secret!)

```env
NEXT_PUBLIC_SUPABASE_URL=https://dddpacosylkmyfiouvop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Stripe Integration

1. Create products and price IDs in Stripe Dashboard
2. Configure webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Update environment variables with Stripe keys and price IDs

## Verification

After setup, verify the installation:

1. **Check tables exist**:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

   Expected tables:
   - profiles
   - ai_providers
   - user_subscriptions
   - ai_usage
   - generated_components
   - subscription_usage
   - billing_events

2. **Check RLS is enabled**:
   ```sql
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```
   
   All tables should show `rowsecurity = true`

3. **Test functions**:
   ```sql
   -- Test usage limit check (replace with actual user ID)
   SELECT * FROM check_usage_limit(
     'user-uuid-here'::uuid, 
     'component_generation'
   );
   ```

## Troubleshooting

### Database Password Issues
If you forgot your database password:
1. Go to Settings > Database in Supabase Dashboard
2. Click "Reset database password"
3. Use the new password when linking with CLI

### Migration Errors
If migrations fail:
1. Check for existing tables that might conflict
2. Run migrations one at a time to identify issues
3. Check Supabase logs for detailed error messages

### RLS Policy Issues
If users can't access their data:
1. Verify auth.uid() is returning the correct user ID
2. Check that RLS is enabled on all tables
3. Test policies in SQL editor with security context

## Next Steps

1. Test authentication flow at `/auth/signup`
2. Configure AI providers at `/dashboard/ai-config`
3. Try generating a component at `/playground/ai`
4. Set up Stripe products and webhooks
5. Monitor usage and subscriptions at `/dashboard`

## Support

For issues specific to:
- **Database setup**: Check Supabase documentation
- **Application code**: See README.md in project root
- **Stripe integration**: Check `/docs/stripe-setup.md`