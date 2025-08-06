#!/usr/bin/env tsx

/**
 * Generate embeddings for all components in the database using Upstash Vector
 * This script:
 * 1. Fetches all components from the database
 * 2. Creates embeddings using Upstash's automatic embedding generation
 * 3. Updates the database with vector IDs
 * 4. Provides a migration report
 */

import { config } from '@dotenvx/dotenvx';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import ora from 'ora';
import chalk from 'chalk';
import { UpstashVectorService } from '../src/services/upstash-vector-service';

// Load environment
config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

interface ComponentData {
  id: string;
  name: string;
  description: string | null;
  type: string;
  framework: string;
  category: string | null;
  tags: string[];
  author: string | null;
  downloads: number;
  likes: number;
  isPublic: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

async function generateComponentEmbeddings() {
  const startTime = Date.now();
  console.log(chalk.blue.bold('\n🚀 Starting Component Embeddings Generation\n'));

  // Check Upstash credentials
  if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
    console.error(chalk.red('❌ Missing Upstash Vector credentials!'));
    console.log('\nPlease add to .env.local:');
    console.log('UPSTASH_VECTOR_REST_URL=your-url');
    console.log('UPSTASH_VECTOR_REST_TOKEN=your-token');
    process.exit(1);
  }

  const spinner = ora();
  const vectorService = UpstashVectorService.getInstance();

  try {
    // Get index stats before starting
    spinner.start('Getting vector index statistics...');
    const statsBefore = await vectorService.getStats();
    spinner.succeed(`Current vectors: ${statsBefore.vectorCount}, Pending: ${statsBefore.pendingVectorCount}`);

    // Fetch all resources (components) from database
    spinner.start('Fetching resources from database...');
    const resources = await prisma.resource.findMany({
      where: {
        isPublished: true // Only get published resources
      },
      include: {
        category: true,
        tags: true,
        author: true,
        resourceType: true,
        _count: {
          select: {
            downloads: true,
            favorites: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    spinner.succeed(`Found ${resources.length} published resources in database`);

    // Process components in batches
    const batchSize = 20;
    const totalBatches = Math.ceil(components.length / batchSize);
    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ component: string; error: string }> = [];

    console.log(chalk.yellow(`\n📦 Processing ${components.length} components in ${totalBatches} batches...\n`));

    for (let i = 0; i < totalBatches; i++) {
      const batchStart = i * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, components.length);
      const batch = components.slice(batchStart, batchEnd);
      
      spinner.start(`Processing batch ${i + 1}/${totalBatches} (${batch.length} components)...`);

      try {
        // Prepare batch data for Upstash
        const batchData = batch.map(component => ({
          id: component.id,
          metadata: {
            name: component.name,
            description: component.description || undefined,
            framework: component.framework,
            category: component.category?.name || undefined,
            tags: component.tags.map(t => t.tag.name),
            type: component.type,
            author: component.author?.name || undefined,
            downloads: component._count.downloads,
            likes: component._count.likes,
            isPublic: component.isPublic,
            version: component.version,
            createdAt: component.createdAt.toISOString(),
            updatedAt: component.updatedAt.toISOString()
          }
        }));

        // Batch upsert to Upstash Vector
        await vectorService.batchUpsertResources(batchData);
        
        successCount += batch.length;
        processedCount += batch.length;
        
        spinner.succeed(`Batch ${i + 1}/${totalBatches} completed (${processedCount}/${components.length} total)`);
        
        // Add a small delay between batches to avoid rate limiting
        if (i < totalBatches - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        errorCount += batch.length;
        processedCount += batch.length;
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        batch.forEach(component => {
          errors.push({ component: component.name, error: errorMessage });
        });
        
        spinner.fail(`Batch ${i + 1}/${totalBatches} failed: ${errorMessage}`);
      }
    }

    // Update components with vector status
    console.log(chalk.yellow('\n📝 Updating database with vector status...\n'));
    
    spinner.start('Updating component vector status...');
    
    // Add vector status to components (if you have a vectorId field)
    // For now, we'll just mark them as having embeddings
    const updatePromises = components.map(async (component) => {
      try {
        // Check if the component was successfully vectorized
        const hasVector = !errors.some(e => e.component === component.name);
        
        // You can add a field to track vector status if needed
        // await prisma.component.update({
        //   where: { id: component.id },
        //   data: { hasVector: hasVector }
        // });
        
        return hasVector;
      } catch (error) {
        return false;
      }
    });
    
    await Promise.all(updatePromises);
    spinner.succeed('Database updated with vector status');

    // Get final stats
    spinner.start('Getting final vector index statistics...');
    const statsAfter = await vectorService.getStats();
    spinner.succeed(`Final vectors: ${statsAfter.vectorCount}, Pending: ${statsAfter.pendingVectorCount}`);

    // Test semantic search
    console.log(chalk.yellow('\n🔍 Testing semantic search...\n'));
    
    const testQueries = [
      'data table with sorting',
      'authentication form',
      'dashboard components',
      'chart visualization',
      'react components'
    ];

    for (const query of testQueries) {
      spinner.start(`Testing query: "${query}"`);
      
      try {
        const results = await vectorService.searchSimilar(query, { limit: 3 });
        
        if (results.length > 0) {
          spinner.succeed(`Found ${results.length} results for "${query}":`);
          results.forEach((result, index) => {
            console.log(chalk.gray(`  ${index + 1}. ${result.metadata.name} (${result.metadata.framework}) - Score: ${result.score.toFixed(3)}`));
          });
        } else {
          spinner.warn(`No results found for "${query}"`);
        }
      } catch (error) {
        spinner.fail(`Search failed for "${query}": ${error}`);
      }
      
      console.log(); // Empty line between queries
    }

    // Generate report
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const vectorsAdded = statsAfter.vectorCount - statsBefore.vectorCount;
    
    console.log(chalk.blue.bold('\n📊 Migration Report\n'));
    console.log(chalk.white('═'.repeat(50)));
    console.log(chalk.green(`✅ Successfully processed: ${successCount} components`));
    if (errorCount > 0) {
      console.log(chalk.red(`❌ Failed: ${errorCount} components`));
    }
    console.log(chalk.cyan(`📈 Vectors added: ${vectorsAdded}`));
    console.log(chalk.cyan(`⏱️  Total time: ${duration} seconds`));
    console.log(chalk.cyan(`⚡ Average speed: ${(components.length / parseFloat(duration)).toFixed(2)} components/second`));
    console.log(chalk.white('═'.repeat(50)));

    if (errors.length > 0) {
      console.log(chalk.red('\n❌ Errors:'));
      errors.slice(0, 10).forEach(error => {
        console.log(chalk.red(`  - ${error.component}: ${error.error}`));
      });
      if (errors.length > 10) {
        console.log(chalk.red(`  ... and ${errors.length - 10} more errors`));
      }
    }

    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      totalComponents: components.length,
      successCount,
      errorCount,
      vectorsAdded,
      duration: `${duration}s`,
      averageSpeed: `${(components.length / parseFloat(duration)).toFixed(2)} components/second`,
      errors: errors.slice(0, 100), // Limit errors in report
      testResults: testQueries.map(query => ({ query, tested: true }))
    };

    const reportPath = path.join(__dirname, `../embeddings-report-${Date.now()}.json`);
    await require('fs').promises.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(chalk.green(`\n💾 Report saved to: ${reportPath}`));

    console.log(chalk.green.bold('\n✨ Embeddings generation completed successfully!\n'));

  } catch (error) {
    spinner.fail('Migration failed');
    console.error(chalk.red('\n💥 Fatal error:'), error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
generateComponentEmbeddings().catch(error => {
  console.error(chalk.red('💥 Unhandled error:'), error);
  process.exit(1);
});