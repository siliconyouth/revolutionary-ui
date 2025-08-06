#!/usr/bin/env tsx

/**
 * Migrate embeddings from PostgreSQL pgvector to Upstash Vector
 */

import { config } from '@dotenvx/dotenvx';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { UpstashVectorService } from '../src/services/upstash-vector-service';

config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function migrateToUpstash() {
  console.log('🚀 Starting migration to Upstash Vector...\n');

  // Check if Upstash credentials are configured
  if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
    console.error('❌ Missing Upstash Vector credentials in .env.local');
    console.log('\nPlease add:');
    console.log('UPSTASH_VECTOR_REST_URL=your-upstash-url');
    console.log('UPSTASH_VECTOR_REST_TOKEN=your-upstash-token\n');
    process.exit(1);
  }

  const upstashService = UpstashVectorService.getInstance();

  try {
    // Get total count of resources
    const totalResources = await prisma.resource.count();
    console.log(`Found ${totalResources} resources to migrate\n`);

    // Get index stats before migration
    console.log('📊 Upstash Vector Index Stats (Before):');
    const statsBefore = await upstashService.getStats();
    console.log(`  Vectors: ${statsBefore.vectorCount}`);
    console.log(`  Dimension: ${statsBefore.dimension}`);
    console.log(`  Index Size: ${statsBefore.indexSize}\n`);

    // Process in batches
    const batchSize = 20; // Upstash recommends smaller batches
    let migrated = 0;
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

      // Prepare batch data
      const batchData = resources.map(resource => ({
        id: resource.id,
        metadata: {
          name: resource.name,
          description: resource.description || undefined,
          framework: resource.frameworks?.[0],
          category: resource.category?.name,
          tags: resource.tags.map(t => t.name),
        },
      }));

      try {
        // Batch upsert to Upstash
        await upstashService.batchUpsertResources(batchData);
        migrated += batchData.length;
        console.log(`✅ Migrated ${batchData.length} resources`);
      } catch (error) {
        console.error(`❌ Failed to migrate batch:`, error);
        failed += batchData.length;
      }

      // Progress update
      console.log(`📊 Progress: ${migrated + failed}/${totalResources} (${Math.round(((migrated + failed) / totalResources) * 100)}%)`);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n✨ Migration Summary:');
    console.log(`  Total Resources: ${totalResources}`);
    console.log(`  Successfully Migrated: ${migrated}`);
    console.log(`  Failed: ${failed}`);

    // Get index stats after migration
    console.log('\n📊 Upstash Vector Index Stats (After):');
    const statsAfter = await upstashService.getStats();
    console.log(`  Vectors: ${statsAfter.vectorCount}`);
    console.log(`  Pending Vectors: ${statsAfter.pendingVectorCount}`);
    console.log(`  Index Size: ${statsAfter.indexSize}`);

    // Test search functionality
    console.log('\n🔍 Testing search functionality...');
    const testResults = await upstashService.searchSimilar('data table', { limit: 3 });
    
    if (testResults.length > 0) {
      console.log('✅ Search test successful!');
      console.log('\nTop 3 results for "data table":');
      testResults.forEach((result, index) => {
        console.log(`${index + 1}. ${result.metadata.name} (Score: ${result.score.toFixed(3)})`);
      });
    } else {
      console.log('⚠️  No search results found');
    }

  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateToUpstash().catch(console.error);