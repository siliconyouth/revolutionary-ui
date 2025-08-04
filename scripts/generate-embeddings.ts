#!/usr/bin/env tsx

/**
 * Generate Vector Embeddings for All Resources
 * Uses OpenAI API to create embeddings for semantic search
 */

import { config } from '@dotenvx/dotenvx';
import { PrismaClient } from '@prisma/client';
import { VectorEmbeddingService } from '../src/services/vector-embedding-service';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';

config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function generateEmbeddings() {
  console.log(chalk.blue('\n🚀 Generating Vector Embeddings\n'));

  // Check OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error(chalk.red('❌ Missing OPENAI_API_KEY environment variable'));
    console.log(chalk.yellow('\nPlease add your OpenAI API key to .env.local:'));
    console.log('OPENAI_API_KEY=sk-...');
    process.exit(1);
  }

  const spinner = ora('Checking resources...').start();

  try {
    // Get total count
    const totalResources = await prisma.resource.count();
    spinner.succeed(`Found ${totalResources} resources`);

    if (totalResources === 0) {
      console.log(chalk.yellow('\n⚠️  No resources found to generate embeddings for'));
      return;
    }

    // Check existing embeddings
    const existingEmbeddings = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM "ResourceEmbedding"
    `;
    const existingCount = parseInt(existingEmbeddings[0]?.count || '0');

    console.log(chalk.gray(`Existing embeddings: ${existingCount}`));
    console.log(chalk.gray(`New embeddings needed: ${totalResources - existingCount}`));

    // Confirm with user
    const estimatedCost = ((totalResources - existingCount) * 0.0001).toFixed(4);
    console.log(chalk.yellow(`\n💰 Estimated OpenAI cost: $${estimatedCost}`));
    console.log(chalk.gray('(Based on ada-002 pricing: $0.0001 per 1K tokens)\n'));

    // Parse command line arguments
    const args = process.argv.slice(2);
    const forceAll = args.includes('--force-all');
    const batchSize = parseInt(args.find(arg => arg.startsWith('--batch='))?.split('=')[1] || '10');
    const dryRun = args.includes('--dry-run');

    if (dryRun) {
      console.log(chalk.yellow('🔍 DRY RUN MODE - No embeddings will be generated\n'));
    }

    // Get embedding service
    const embeddingService = VectorEmbeddingService.getInstance();

    // Generate sample embedding to test
    if (!dryRun) {
      spinner.start('Testing OpenAI connection...');
      try {
        await embeddingService.generateEmbedding('test');
        spinner.succeed('OpenAI connection successful');
      } catch (error) {
        spinner.fail('OpenAI connection failed');
        console.error(chalk.red('\nError:'), error.message);
        process.exit(1);
      }
    }

    // Process resources
    console.log(chalk.blue('\n📊 Processing Resources\n'));

    let processed = 0;
    let skipped = 0;
    let failed = 0;
    let offset = 0;

    while (offset < totalResources) {
      const resources = await prisma.resource.findMany({
        skip: offset,
        take: batchSize,
        include: {
          category: true,
          tags: true,
        },
      });

      for (const resource of resources) {
        const progressBar = `[${processed + skipped + failed}/${totalResources}]`;
        const resourceInfo = `${progressBar} ${resource.name}`;

        if (!dryRun) {
          spinner.start(resourceInfo);

          try {
            // Check if embedding exists
            const exists = await prisma.$queryRaw<any[]>`
              SELECT id FROM "ResourceEmbedding" WHERE "resourceId" = ${resource.id}
            `;

            if (exists.length > 0 && !forceAll) {
              skipped++;
              spinner.info(`${resourceInfo} - Already has embedding`);
              continue;
            }

            await embeddingService.updateResourceEmbedding(resource.id);
            processed++;
            spinner.succeed(`${resourceInfo} - Embedding generated`);
          } catch (error) {
            failed++;
            spinner.fail(`${resourceInfo} - Failed: ${error.message}`);
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          console.log(chalk.gray(`${resourceInfo} - Would generate embedding`));
          processed++;
        }
      }

      offset += batchSize;
    }

    // Summary
    console.log(chalk.green('\n✅ Embedding Generation Complete!\n'));
    console.log(chalk.white('📊 Summary:'));
    console.log(`  Total Resources: ${totalResources}`);
    console.log(`  Processed: ${chalk.green(processed)}`);
    console.log(`  Skipped: ${chalk.yellow(skipped)}`);
    console.log(`  Failed: ${chalk.red(failed)}`);

    if (!dryRun) {
      const actualCost = (processed * 0.0001).toFixed(4);
      console.log(`  Estimated Cost: $${actualCost}`);
    }

    // Test search
    if (!dryRun && processed > 0) {
      console.log(chalk.blue('\n🔍 Testing Semantic Search\n'));
      
      const testQuery = 'responsive form with validation';
      spinner.start(`Searching for: "${testQuery}"`);

      try {
        const results = await embeddingService.searchSimilar(testQuery, { limit: 3 });
        spinner.succeed(`Found ${results.length} results`);

        if (results.length > 0) {
          console.log('\nTop results:');
          results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.resource?.name || 'Unknown'} (${Math.round(result.score * 100)}% match)`);
          });
        }
      } catch (error) {
        spinner.fail('Search test failed');
        console.error(error);
      }
    }

    // Next steps
    console.log(chalk.yellow('\n📝 Next Steps:\n'));
    console.log('1. Test the semantic search API:');
    console.log('   curl -X POST http://localhost:3000/api/search/semantic \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"query": "data table with sorting"}\'');
    console.log('\n2. View the search UI at: http://localhost:3000/search');
    console.log('\n3. Set up a cron job to update embeddings regularly');

  } catch (error) {
    spinner.fail('Failed to generate embeddings');
    console.error(chalk.red('\nError:'), error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Show usage
function showUsage() {
  console.log(chalk.blue('\n📖 Usage:\n'));
  console.log('  npm run embeddings:generate [options]');
  console.log('\nOptions:');
  console.log('  --force-all       Regenerate all embeddings (ignore existing)');
  console.log('  --batch=<number>  Set batch size (default: 10)');
  console.log('  --dry-run         Show what would be done without making changes');
  console.log('\nExamples:');
  console.log('  npm run embeddings:generate');
  console.log('  npm run embeddings:generate --force-all --batch=20');
  console.log('  npm run embeddings:generate --dry-run');
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
  } else {
    generateEmbeddings().catch(console.error);
  }
}

export { generateEmbeddings };