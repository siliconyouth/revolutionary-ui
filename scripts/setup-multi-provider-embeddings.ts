#!/usr/bin/env tsx

/**
 * Set up embeddings table with standard 1536 dimensions
 * All providers will normalize to this dimension
 */

import { config } from '@dotenvx/dotenvx';
import { PrismaClient } from '@prisma/client';
import path from 'path';

config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function setupMultiProviderEmbeddings() {
  console.log('🔧 Setting up multi-provider embeddings support...\n');

  try {
    // Drop and recreate tables
    await prisma.$executeRaw`
      DROP TABLE IF EXISTS "ResourceEmbedding" CASCADE
    `;
    
    await prisma.$executeRaw`
      DROP TABLE IF EXISTS "SearchQuery" CASCADE
    `;

    // Create ResourceEmbedding table with standard 1536 dimensions
    await prisma.$executeRaw`
      CREATE TABLE "ResourceEmbedding" (
        id TEXT PRIMARY KEY,
        "resourceId" TEXT NOT NULL UNIQUE,
        embedding vector(1536),
        model TEXT DEFAULT 'text-embedding-ada-002',
        provider TEXT DEFAULT 'openai',
        version INTEGER DEFAULT 1,
        "contentHash" TEXT NOT NULL,
        "originalDimensions" INTEGER,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY ("resourceId") REFERENCES "resources"(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ Created ResourceEmbedding table');

    // Create index
    await prisma.$executeRaw`
      CREATE INDEX embedding_idx ON "ResourceEmbedding" 
      USING hnsw (embedding vector_cosine_ops)
    `;
    console.log('✅ Created HNSW index');

    // Create SearchQuery table
    await prisma.$executeRaw`
      CREATE TABLE "SearchQuery" (
        id TEXT PRIMARY KEY,
        query TEXT NOT NULL,
        embedding vector(1536),
        provider TEXT DEFAULT 'openai',
        "resultCount" INTEGER DEFAULT 0,
        "searchDuration" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Created SearchQuery table');

    console.log('\n✅ Successfully set up multi-provider embeddings support');
    console.log('   All embeddings will be normalized to 1536 dimensions');

  } catch (error) {
    console.error('❌ Failed to set up embeddings:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupMultiProviderEmbeddings().catch(console.error);