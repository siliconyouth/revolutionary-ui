#!/usr/bin/env tsx

/**
 * Generate embeddings locally using Transformers.js
 * No API rate limits!
 */

import { config } from '@dotenvx/dotenvx';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import crypto from 'crypto';

config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

// Dynamically import transformers
let pipeline: any;
let model: any;

async function initializeModel() {
  console.log('🚀 Loading local embedding model...');
  const transformers = await import('@xenova/transformers');
  pipeline = transformers.pipeline;
  model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log('✅ Model loaded successfully\n');
}

async function generateLocalEmbedding(text: string): Promise<number[]> {
  const output = await model(text, {
    pooling: 'mean',
    normalize: true,
  });
  
  const embedding = Array.from(output.data);
  
  // Pad to 1536 dimensions for compatibility
  while (embedding.length < 1536) {
    embedding.push(0);
  }
  
  return embedding;
}

async function generateEmbeddings() {
  console.log('🎯 Starting local embedding generation...\n');
  
  await initializeModel();

  try {
    // Get total count
    const totalResources = await prisma.resource.count();
    console.log(`Found ${totalResources} resources to process\n`);

    const batchSize = 10;
    let processed = 0;
    let failed = 0;

    for (let offset = 0; offset < totalResources; offset += batchSize) {
      const resources = await prisma.resource.findMany({
        skip: offset,
        take: batchSize,
        include: {
          category: true,
          tags: true,
        },
      });

      console.log(`\n📦 Processing batch ${Math.floor(offset / batchSize) + 1}/${Math.ceil(totalResources / batchSize)}`);

      for (const resource of resources) {
        try {
          // Create searchable text
          const searchableText = [
            resource.name,
            resource.description || '',
            resource.frameworks?.join(' ') || '',
            resource.category?.name || '',
            resource.tags.map(t => t.name).join(' '),
          ].filter(Boolean).join(' | ');
          
          const contentHash = crypto.createHash('sha256').update(searchableText).digest('hex');

          console.log(`🔄 Processing: ${resource.name}`);
          
          // Generate embedding
          const embedding = await generateLocalEmbedding(searchableText);
          
          // Check if embedding exists
          const existing = await prisma.$queryRaw<any[]>`
            SELECT id FROM "ResourceEmbedding" 
            WHERE "resourceId" = ${resource.id}
          `;

          // Convert embedding array to string format for PostgreSQL
          const embeddingStr = `[${embedding.join(',')}]`;
          
          if (existing.length > 0) {
            await prisma.$executeRawUnsafe(`
              UPDATE "ResourceEmbedding" 
              SET embedding = '${embeddingStr}'::vector,
                  "contentHash" = '${contentHash}',
                  provider = 'local',
                  "originalDimensions" = 384,
                  "updatedAt" = NOW()
              WHERE "resourceId" = '${resource.id}'
            `);
          } else {
            await prisma.$executeRawUnsafe(`
              INSERT INTO "ResourceEmbedding" 
              (id, "resourceId", embedding, "contentHash", provider, "originalDimensions", version)
              VALUES (
                '${crypto.randomUUID()}',
                '${resource.id}',
                '${embeddingStr}'::vector,
                '${contentHash}',
                'local',
                384,
                1
              )
            `);
          }
          
          processed++;
          console.log(`✅ Generated embedding for: ${resource.name}`);
        } catch (error) {
          console.error(`❌ Failed for ${resource.name}:`, error);
          failed++;
        }
      }

      // Progress update
      console.log(`\n📊 Progress: ${processed + failed}/${totalResources} (${Math.round(((processed + failed) / totalResources) * 100)}%)`);
      console.log(`   ✅ Processed: ${processed}`);
      console.log(`   ❌ Failed: ${failed}`);
    }

    console.log('\n🎉 Embedding generation completed!');
    console.log(`   Total resources: ${totalResources}`);
    console.log(`   Successfully processed: ${processed}`);
    console.log(`   Failed: ${failed}`);

    // Verify final count
    const finalCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM "ResourceEmbedding"
    `;
    console.log(`\n📈 Total embeddings in database: ${finalCount[0].count}`);

  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateEmbeddings().catch(console.error);