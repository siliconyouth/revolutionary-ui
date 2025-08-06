#!/usr/bin/env tsx

/**
 * Index resources and documentation to Algolia
 */

import { config } from '@dotenvx/dotenvx';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import ora from 'ora';
import chalk from 'chalk';
import { AlgoliaSearchService } from '../src/services/algolia-search-service';
import { glob } from 'glob';
import fs from 'fs/promises';

config({ path: path.join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

interface DocFile {
  id: string;
  title: string;
  content: string;
  url: string;
  category: string;
  tags: string[];
  headings: string[];
  type: 'guide' | 'api' | 'tutorial' | 'reference';
}

async function indexToAlgolia() {
  const startTime = Date.now();
  console.log(chalk.blue.bold('\n🚀 Starting Algolia Indexing\n'));

  // Check Algolia credentials
  if (!process.env.ALGOLIA_APP_ID || !process.env.ALGOLIA_ADMIN_API_KEY) {
    console.error(chalk.red('❌ Missing Algolia credentials!'));
    console.log('\nPlease add to .env.local:');
    console.log('ALGOLIA_APP_ID=your-app-id');
    console.log('ALGOLIA_ADMIN_API_KEY=your-admin-key');
    process.exit(1);
  }

  const spinner = ora();
  const algoliaService = AlgoliaSearchService.getInstance();

  try {
    // 1. Clear existing indices
    spinner.start('Clearing existing Algolia indices...');
    await algoliaService.clearIndices();
    spinner.succeed('Algolia indices cleared');

    // 2. Index resources from database
    spinner.start('Indexing resources to Algolia...');
    await algoliaService.indexResources();
    spinner.succeed('Resources indexed to Algolia');

    // 3. Index documentation files
    spinner.start('Scanning documentation files...');
    const docs = await indexDocumentationFiles();
    spinner.succeed(`Found ${docs.length} documentation files`);

    if (docs.length > 0) {
      spinner.start('Indexing documentation to Algolia...');
      await algoliaService.indexDocumentation(docs);
      spinner.succeed('Documentation indexed to Algolia');
    }

    // 4. Get index statistics
    spinner.start('Getting index statistics...');
    const stats = await algoliaService.getIndexStats();
    spinner.succeed('Index statistics retrieved');

    // 5. Test search functionality
    console.log(chalk.yellow('\n🔍 Testing Algolia Search...\n'));
    
    const testQueries = [
      { query: 'react table', type: 'components' as const },
      { query: 'authentication', type: 'all' as const },
      { query: 'setup guide', type: 'docs' as const },
      { query: 'typescript', filters: { hasTypescript: true } },
      { query: 'free components', filters: { isFree: true } },
    ];

    for (const test of testQueries) {
      spinner.start(`Testing: "${test.query}"${test.type ? ` (${test.type})` : ''}`);
      
      try {
        const results = await algoliaService.search({
          query: test.query,
          type: test.type || 'all',
          filters: test.filters || {},
          limit: 3,
          searchMode: 'hybrid',
        });
        
        if (results.results.length > 0) {
          spinner.succeed(`Found ${results.totalResults} results for "${test.query}" in ${results.processingTime}ms`);
          results.results.forEach((result, idx) => {
            console.log(chalk.gray(
              `  ${idx + 1}. ${result.title} (${result.type}) - Score: ${result.score.toFixed(3)}`
            ));
          });
        } else {
          spinner.warn(`No results found for "${test.query}"`);
        }
      } catch (error) {
        spinner.fail(`Search failed for "${test.query}": ${error}`);
      }
      
      console.log(); // Empty line between queries
    }

    // Generate report
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(chalk.blue.bold('\n📊 Indexing Report\n'));
    console.log(chalk.white('═'.repeat(50)));
    console.log(chalk.green(`✅ Components indexed: ${stats.components}`));
    console.log(chalk.green(`✅ Resources indexed: ${stats.resources}`));
    console.log(chalk.green(`✅ Documentation indexed: ${stats.documentation}`));
    console.log(chalk.cyan(`⏱️  Total time: ${duration} seconds`));
    console.log(chalk.white('═'.repeat(50)));

    console.log(chalk.green.bold('\n✨ Algolia indexing completed successfully!\n'));

  } catch (error) {
    spinner.fail('Indexing failed');
    console.error(chalk.red('\n💥 Fatal error:'), error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Index documentation files from the docs directory
 */
async function indexDocumentationFiles(): Promise<DocFile[]> {
  const docs: DocFile[] = [];
  
  // Find all markdown files in docs directory
  const docFiles = await glob('docs/**/*.md', {
    ignore: ['**/node_modules/**', '**/README.md'],
  });

  for (const filePath of docFiles) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const fileName = path.basename(filePath, '.md');
      const category = path.dirname(filePath).split('/').pop() || 'general';
      
      // Extract title from first H1 or filename
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : fileName.replace(/-/g, ' ');
      
      // Extract all headings
      const headings: string[] = [];
      const headingMatches = content.matchAll(/^#{1,6}\s+(.+)$/gm);
      for (const match of headingMatches) {
        headings.push(match[1]);
      }
      
      // Extract tags from content (look for common patterns)
      const tags: string[] = [];
      if (content.includes('React')) tags.push('react');
      if (content.includes('Vue')) tags.push('vue');
      if (content.includes('TypeScript')) tags.push('typescript');
      if (content.includes('API')) tags.push('api');
      if (content.includes('Guide')) tags.push('guide');
      if (content.includes('Tutorial')) tags.push('tutorial');
      
      // Determine type
      let type: DocFile['type'] = 'guide';
      if (fileName.includes('api') || fileName.includes('API')) type = 'api';
      else if (fileName.includes('tutorial')) type = 'tutorial';
      else if (fileName.includes('reference')) type = 'reference';
      
      docs.push({
        id: `doc-${fileName}`,
        title,
        content: content.substring(0, 5000), // Limit content size
        url: `/docs/${fileName}`,
        category,
        tags,
        headings: headings.slice(0, 10), // Limit headings
        type,
      });
    } catch (error) {
      console.warn(`Failed to process ${filePath}:`, error);
    }
  }
  
  return docs;
}

// Run the indexing
indexToAlgolia().catch(error => {
  console.error(chalk.red('💥 Unhandled error:'), error);
  process.exit(1);
});