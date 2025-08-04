#!/usr/bin/env tsx

/**
 * Generate embeddings for all resources using alternative providers
 * Falls back through Together AI, Cohere, and local embeddings
 */

import { config } from '@dotenvx/dotenvx';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { AlternativeEmbeddingService } from '../src/services/alternative-embedding-service';

config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function generateEmbeddings() {
  console.log('🚀 Starting embedding generation with alternative providers...\n');

  const embeddingService = new AlternativeEmbeddingService();

  try {
    // Get total count
    const totalResources = await prisma.resource.count();
    console.log(`Found ${totalResources} resources to process\n`);

    // Check existing embeddings
    const existingCount = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM "ResourceEmbedding"
    `;
    console.log(`Existing embeddings: ${existingCount[0].count}`);

    const batchSize = 5; // Smaller batch size for alternative providers
    let processed = 0;
    let failed = 0;
    let skipped = 0;

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
          // Check if embedding already exists
          const existing = await prisma.$queryRaw<any[]>`
            SELECT id FROM "ResourceEmbedding" 
            WHERE "resourceId" = ${resource.id}
          `;

          if (existing.length > 0) {
            console.log(`⏭️  Skipping ${resource.name} (already has embedding)`);
            skipped++;
            continue;
          }

          console.log(`🔄 Processing: ${resource.name}`);
          await embeddingService.updateResourceEmbedding(resource.id);
          processed++;
          console.log(`✅ Generated embedding for: ${resource.name}`);
        } catch (error) {
          console.error(`❌ Failed to generate embedding for ${resource.name}:`, error);
          failed++;
        }
      }

      // Progress update
      const total = processed + failed + skipped;
      console.log(`\n📊 Progress: ${total}/${totalResources} (${Math.round((total / totalResources) * 100)}%)`);
      console.log(`   ✅ Processed: ${processed}`);
      console.log(`   ⏭️  Skipped: ${skipped}`);
      console.log(`   ❌ Failed: ${failed}`);

      // Small delay between batches to avoid rate limits
      if (offset + batchSize < totalResources) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('\n🎉 Embedding generation completed!');
    console.log(`   Total resources: ${totalResources}`);
    console.log(`   Successfully processed: ${processed}`);
    console.log(`   Skipped (existing): ${skipped}`);
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