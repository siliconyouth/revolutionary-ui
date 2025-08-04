#!/usr/bin/env tsx

/**
 * Update ResourceEmbedding table to support variable embedding dimensions
 */

import { config } from '@dotenvx/dotenvx';
import { PrismaClient } from '@prisma/client';
import path from 'path';

config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function updateEmbeddingDimensions() {
  console.log('🔄 Updating embedding dimensions support...\n');

  try {
    // Drop the existing table if it exists
    await prisma.$executeRaw`
      DROP TABLE IF EXISTS "ResourceEmbedding" CASCADE
    `;
    console.log('✅ Dropped existing ResourceEmbedding table');

    // Create new table without specifying vector dimension
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "ResourceEmbedding" (
        id TEXT PRIMARY KEY,
        "resourceId" TEXT NOT NULL UNIQUE,
        embedding vector,
        model TEXT DEFAULT 'text-embedding-ada-002',
        version INTEGER DEFAULT 1,
        dimensions INTEGER NOT NULL,
        "contentHash" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("resourceId") REFERENCES "resources"(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ Created new ResourceEmbedding table with flexible dimensions');

    // Create index for vector similarity search
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS embedding_idx ON "ResourceEmbedding" 
      USING hnsw (embedding vector_cosine_ops)
    `;
    console.log('✅ Created HNSW index for vector similarity search');

    // Also update SearchQuery table
    await prisma.$executeRaw`
      DROP TABLE IF EXISTS "SearchQuery" CASCADE
    `;

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "SearchQuery" (
        id TEXT PRIMARY KEY,
        query TEXT NOT NULL,
        embedding vector,
        dimensions INTEGER NOT NULL,
        "resultCount" INTEGER DEFAULT 0,
        "searchDuration" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Updated SearchQuery table');

    console.log('\n✅ Successfully updated embedding tables to support variable dimensions');

  } catch (error) {
    console.error('❌ Failed to update embedding dimensions:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateEmbeddingDimensions().catch(console.error);