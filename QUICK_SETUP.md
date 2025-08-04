# Quick Supabase Setup for Revolutionary UI

## 🚀 Quick Start

### Option 1: Interactive Setup (Recommended)

Run the interactive setup wizard:

```bash
# Node.js version (more features)
node scripts/setup-env.js

# OR Shell version
./scripts/setup-env.sh
```

The wizard will:
- Read from `.env.local.backup` if it exists
- Guide you through each setting with explanations
- Validate your inputs
- Generate secure secrets automatically
- Create a properly formatted `.env.local`

### Option 2: Manual Setup

1. **Add these to your root `.env.local` file:**

```env
# From Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# From Supabase Dashboard > Settings > Database
# Replace [YOUR-PASSWORD] and [YOUR-PROJECT-REF] with actual values
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
DATABASE_URL_PRISMA=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

2. **Run the automated setup:**

```bash
# From root directory

# Option 1: Node.js version (recommended - better error handling)
node scripts/setup-database.js

# Option 2: Shell script version
./scripts/setup-database.sh
```

3. **Start development:**

```bash
# Terminal 1: Database GUI (optional)
npm run prisma:studio

# Terminal 2: Marketplace
cd marketplace-nextjs
npm run dev
```

## 📁 Project Structure

```
revolutionary-ui/
├── .env.local                 # ← Single source of truth for env vars
├── prisma/
│   └── schema.prisma         # ← Shared database schema
├── lib/
│   ├── prisma.ts            # ← Shared Prisma client
│   └── supabase.ts          # ← Shared Supabase client
└── marketplace-nextjs/
    ├── lib/
    │   ├── prisma.ts        # → Re-exports from root
    │   └── supabase.ts      # → Re-exports from root
    └── next.config.js       # → Loads env from root .env.local
```

## 🔑 Key Points

- **One Database**: Both projects share the same Supabase database
- **One Config**: All environment variables in root `.env.local`
- **One Schema**: Database schema defined in root `prisma/schema.prisma`
- **Shared Clients**: Prisma and Supabase clients are in root `lib/`

## 🛠️ Common Commands

```bash
# From root directory
npm run prisma:studio     # Open database GUI
npm run prisma:seed       # Add sample data
npm run db:reset          # Reset database (careful!)

# From marketplace-nextjs
npm run dev               # Start Next.js app
npm run build             # Build for production
```

## 🆘 Troubleshooting

1. **"Cannot find module"**: Run `npm install` in both root and marketplace-nextjs
2. **"Database connection failed"**: Check your `.env.local` values
3. **"Table not found"**: Run `npm run prisma:push` from root
4. **"Permission denied"**: Make sure `./scripts/setup-database.sh` is executable

## 📚 More Info

- Full setup guide: `docs/SUPABASE_SETUP.md`
- Supabase Dashboard: https://supabase.com/dashboard
- Support: https://github.com/siliconyouth/revolutionary-ui/issues