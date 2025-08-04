# Centralized Supabase Setup Guide for Revolutionary UI

**Important**: This project uses a centralized configuration where both the root Revolutionary UI project and the marketplace-nextjs subdirectory share the same Supabase database and environment configuration.

This guide will help you set up Supabase as your database for the Revolutionary UI project.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed
- Revolutionary UI project cloned locally

## Step 1: Create a Supabase Project

1. Log in to your Supabase dashboard
2. Click "New Project"
3. Fill in the project details:
   - **Name**: revolutionary-ui (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest to your users
   - **Pricing Plan**: Free tier is fine for development

## Step 2: Get Your Project Credentials

Once your project is created, navigate to:

1. **Settings > API** to find:
   - `Project URL` (your-project-ref.supabase.co)
   - `anon` public key (safe for browser)
   - `service_role` secret key (server-side only)

2. **Settings > Database** to find:
   - Direct connection string
   - Connection pooling string

## Step 3: Configure Environment Variables

### Centralized Configuration

This project uses a **single `.env.local` file in the root directory** that is shared by both the main project and the marketplace-nextjs subdirectory.

1. Copy `.env.sample` to `.env.local` in the **root directory**:
   ```bash
   # Make sure you're in the root directory
   cd /path/to/revolutionary-ui
   cp .env.sample .env.local
   ```

2. Update the following variables in `.env.local`:

   ```env
   # Replace with your actual values
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   
   # Database URLs - replace [YOUR-PASSWORD] and [YOUR-PROJECT-REF]
   DATABASE_URL=postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT-REF.supabase.co:5432/postgres
   DATABASE_URL_PRISMA=postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT-REF.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
   DIRECT_URL=postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT-REF.supabase.co:5432/postgres
   ```

## Step 4: Install Dependencies

Install dependencies for both projects:

```bash
# Install root project dependencies
npm install

# Install marketplace dependencies
cd marketplace-nextjs
npm install
cd ..
```

## Step 5: Set Up Prisma

### Automated Setup (Recommended)

Run the setup script from the root directory:

```bash
./scripts/setup-database.sh
```

This script will:
- Check your environment configuration
- Install dependencies
- Generate Prisma Client
- Push the schema to your database
- Seed initial data

### Manual Setup

If you prefer to run commands manually:

1. Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```

2. Push database schema:
   ```bash
   npm run prisma:push
   ```

3. (Optional) Seed the database with sample data:
   ```bash
   npm run prisma:seed
   ```

**Note**: The marketplace-nextjs project uses the same Prisma client and database. When you run Prisma commands from the marketplace directory, they reference the root Prisma configuration.

## Step 6: Enable Row Level Security (RLS)

For production, you should enable RLS on your tables:

1. Go to your Supabase dashboard
2. Navigate to **Authentication > Policies**
3. Enable RLS for tables that need protection
4. Create appropriate policies

Example policies for the `component_submissions` table:

```sql
-- Users can view their own submissions
CREATE POLICY "Users can view own submissions" ON component_submissions
FOR SELECT USING (auth.uid() = user_id);

-- Users can create submissions
CREATE POLICY "Users can create submissions" ON component_submissions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own draft submissions
CREATE POLICY "Users can update own drafts" ON component_submissions
FOR UPDATE USING (auth.uid() = user_id AND status = 'draft');

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions" ON component_submissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role IN ('ADMIN', 'MODERATOR')
  )
);
```

## Step 7: Set Up Authentication

1. In Supabase dashboard, go to **Authentication > Providers**
2. Enable the providers you want:
   - Email/Password
   - GitHub
   - Google
   - etc.

3. For OAuth providers, add the callback URL:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```

## Step 8: Configure Storage (Optional)

For file uploads (component screenshots, etc.):

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket named `component-submissions`
3. Set the bucket to public or configure policies as needed

## Step 9: Test Your Connection

Run the development server:

```bash
npm run dev
```

Test database connection:

```bash
npx prisma studio
```

This opens Prisma Studio where you can view and edit your database.

## Troubleshooting

### Connection Issues

1. **SSL Certificate Error**: Add `?sslmode=require` to your connection string
2. **Connection Pool Timeout**: Reduce `connection_limit` in the pooled URL
3. **Permission Denied**: Check your database password and user permissions

### Migration Issues

1. **Migration Failed**: Check if you have the correct database URL
2. **Schema Conflicts**: Run `npx prisma migrate reset` (WARNING: This drops all data)

### Common Errors

- `P1001`: Can't reach database - Check your connection string
- `P1002`: Database server timeout - Check if Supabase project is active
- `P2002`: Unique constraint violation - Data already exists

## Production Considerations

1. **Use connection pooling** for better performance
2. **Enable RLS** on all tables
3. **Set up proper indexes** for frequently queried fields
4. **Configure backup policies** in Supabase dashboard
5. **Monitor usage** to stay within limits
6. **Use environment variables** for all sensitive data

## Step 9: Test Your Connection

### Test from Root Project:

```bash
# Open Prisma Studio
npm run prisma:studio

# Run CLI
npm run cli
```

### Test from Marketplace:

```bash
# Start the Next.js development server
cd marketplace-nextjs
npm run dev
```

Visit http://localhost:3000 to see the marketplace application.

### Verify Shared Configuration:

The marketplace-nextjs project automatically uses:
- Environment variables from root `.env.local`
- Prisma client from root `lib/prisma.ts`
- Supabase client from root `lib/supabase.ts`
- Database schema from root `prisma/schema.prisma`

## Useful Commands

### Root Project Commands:

```bash
# Database management
npm run prisma:generate    # Generate Prisma client
npm run prisma:push       # Push schema changes
npm run prisma:studio     # Open database GUI
npm run prisma:seed       # Seed initial data
npm run db:setup          # Run generate + push
npm run db:reset          # Reset database (WARNING: Deletes all data)

# Development
npm run cli               # Run Revolutionary UI CLI
npm run test:ai          # Test AI providers
```

### Marketplace Commands:

```bash
cd marketplace-nextjs

# Development
npm run dev               # Start Next.js dev server

# Database (runs commands in root)
npm run prisma:generate   # Generate Prisma client
npm run prisma:studio     # Open database GUI
```

## Next Steps

1. Set up authentication in your Next.js app
2. Configure Supabase client in your application
3. Implement Row Level Security policies
4. Set up real-time subscriptions (if needed)
5. Configure backup and monitoring

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma with Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)
- [Next.js with Supabase](https://supabase.com/docs/guides/with-nextjs)
- [Revolutionary UI Documentation](./README.md)