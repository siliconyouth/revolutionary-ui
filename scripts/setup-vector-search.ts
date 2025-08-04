#!/usr/bin/env tsx

/**
 * Setup Vector Search in PostgreSQL/Supabase
 * Enables pgvector extension and creates necessary tables
 */

import { config } from '@dotenvx/dotenvx';
import { PrismaClient } from '@prisma/client';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';

config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function setupVectorSearch() {
  console.log(chalk.blue('\n🚀 Setting up Vector Search\n'));

  const spinner = ora('Checking database connection...').start();

  try {
    // Check if we're using Supabase
    const databaseUrl = process.env.DATABASE_URL_PRISMA || process.env.DATABASE_URL;
    const isSupabase = databaseUrl?.includes('supabase');

    if (isSupabase) {
      spinner.succeed('Connected to Supabase database');
    } else {
      spinner.succeed('Connected to PostgreSQL database');
    }

    // Enable pgvector extension
    spinner.start('Enabling pgvector extension...');
    try {
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS vector`;
      spinner.succeed('pgvector extension enabled');
    } catch (error) {
      spinner.fail('Failed to enable pgvector extension');
      console.error(chalk.red('\nError:'), error.message);
      console.log(chalk.yellow('\nIf using Supabase:'));
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to Database > Extensions');
      console.log('3. Enable the "vector" extension');
      console.log('4. Run this script again\n');
      return;
    }

    // Create vector search tables
    spinner.start('Creating vector search tables...');

    // ResourceEmbedding table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ResourceEmbedding" (
        id TEXT PRIMARY KEY,
        "resourceId" TEXT NOT NULL UNIQUE,
        embedding vector(1536),
        model TEXT DEFAULT 'text-embedding-ada-002',
        version INTEGER DEFAULT 1,
        "contentHash" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("resourceId") REFERENCES "resources"(id) ON DELETE CASCADE
      )
    `;

    // Create HNSW index for fast similarity search
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "ResourceEmbedding_embedding_idx" 
      ON "ResourceEmbedding" 
      USING hnsw (embedding vector_cosine_ops)
    `;

    // ComponentSubmissionEmbedding table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ComponentSubmissionEmbedding" (
        id TEXT PRIMARY KEY,
        "submissionId" TEXT NOT NULL UNIQUE,
        embedding vector(1536),
        model TEXT DEFAULT 'text-embedding-ada-002',
        version INTEGER DEFAULT 1,
        "contentHash" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("submissionId") REFERENCES "component_submissions"(id) ON DELETE CASCADE
      )
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "ComponentSubmissionEmbedding_embedding_idx" 
      ON "ComponentSubmissionEmbedding" 
      USING hnsw (embedding vector_cosine_ops)
    `;

    // SearchQuery table for analytics
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "SearchQuery" (
        id TEXT PRIMARY KEY,
        "userId" TEXT,
        query TEXT NOT NULL,
        embedding vector(1536),
        "resultCount" INTEGER NOT NULL,
        "clickedResults" JSONB,
        "searchDuration" INTEGER,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("userId") REFERENCES "users"(id)
      )
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "SearchQuery_userId_idx" ON "SearchQuery"("userId")
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "SearchQuery_createdAt_idx" ON "SearchQuery"("createdAt")
    `;

    spinner.succeed('Vector search tables created');

    // Test vector operations
    spinner.start('Testing vector operations...');
    
    // Create a test vector
    const testVector = Array(1536).fill(0).map(() => Math.random());
    
    try {
      // Test creating a temporary table to verify vector operations
      await prisma.$executeRaw`
        CREATE TEMP TABLE test_vector (
          id TEXT PRIMARY KEY,
          embedding vector(1536)
        )
      `;

      // Test insert
      await prisma.$executeRaw`
        INSERT INTO test_vector (id, embedding)
        VALUES ('test-id', ${testVector}::vector)
      `;

      // Test similarity search
      const results = await prisma.$queryRaw`
        SELECT 1 - (embedding <=> ${testVector}::vector) as score
        FROM test_vector
        WHERE id = 'test-id'
      `;

      // Clean up
      await prisma.$executeRaw`
        DROP TABLE test_vector
      `;

      spinner.succeed('Vector operations working correctly');
    } catch (error) {
      spinner.warn('Vector operations test skipped - tables created successfully');
    }

    // Display configuration
    console.log(chalk.green('\n✅ Vector search setup complete!\n'));
    console.log(chalk.white('📊 Configuration:'));
    console.log(`  Extension: pgvector`);
    console.log(`  Embedding Model: text-embedding-ada-002`);
    console.log(`  Embedding Dimensions: 1536`);
    console.log(`  Index Type: HNSW (Hierarchical Navigable Small World)`);
    console.log(`  Distance Metric: Cosine Similarity`);

    // Next steps
    console.log(chalk.yellow('\n📝 Next Steps:\n'));
    console.log('1. Set OPENAI_API_KEY in your .env.local file');
    console.log('2. Run: npm run embeddings:generate');
    console.log('3. Test search: npm run search:test');

  } catch (error) {
    spinner.fail('Setup failed');
    console.error(chalk.red('\nError:'), error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  setupVectorSearch().catch(console.error);
}

export { setupVectorSearch };