#!/bin/bash

# Revolutionary UI - Database Setup Script
# This script helps set up the Supabase database connection

echo "🚀 Revolutionary UI - Database Setup"
echo "=================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.sample..."
    cp .env.sample .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  Please edit .env.local and add your Supabase credentials:"
    echo "   - NEXT_PUBLIC_SUPABASE_URL"
    echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - DATABASE_URL"
    echo "   - DATABASE_URL_PRISMA"
    echo "   - DIRECT_URL"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Load environment variables from .env.local
if [ -f .env.local ]; then
    # Export variables while reading the file
    set -a
    source .env.local
    set +a
else
    echo "❌ Error: .env.local file not found!"
    echo "Please run ./scripts/setup-env.sh first to create it."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$DATABASE_URL_PRISMA" ]; then
    echo "❌ Error: DATABASE_URL_PRISMA is not set in .env.local"
    echo "Please add your Supabase database connection string."
    echo ""
    echo "Your .env.local should contain:"
    echo "  DATABASE_URL_PRISMA=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
    exit 1
fi

# Also check other critical variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local"
    echo "Please run ./scripts/setup-env.sh to configure your environment."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔄 Generating Prisma client..."
npm run prisma:generate

echo ""
echo "📊 Pushing database schema..."
npm run prisma:push

echo ""
echo "🌱 Seeding database with initial data..."
npm run prisma:seed

echo ""
echo "✅ Database setup complete!"
echo ""
echo "You can now:"
echo "  - Run 'npm run prisma:studio' to view your database"
echo "  - Run 'cd marketplace-nextjs && npm run dev' to start the Next.js app"
echo "  - Run 'npm run cli' to use the Revolutionary UI CLI"
echo ""
echo "🎉 Happy coding!"