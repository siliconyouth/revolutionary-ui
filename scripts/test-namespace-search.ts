#!/usr/bin/env tsx

/**
 * Test Upstash Vector search with namespace
 */

import { config } from '@dotenvx/dotenvx';
import path from 'path';
import { Index } from '@upstash/vector';
import chalk from 'chalk';

config({ path: path.join(__dirname, '../.env.local') });

const NAMESPACE = 'revolutionary-ui-components';

interface VectorMetadata {
  resourceId: string;
  name: string;
  description: string;
  framework: string;
  frameworks: string[];
  category: string;
  tags: string[];
  type: string;
  author: string;
  downloads: number;
  favorites: number;
  reviews: number;
  price: number;
  isFree: boolean;
  isPremium: boolean;
  isFeatured: boolean;
  hasTypescript: boolean;
  hasTests: boolean;
  license: string;
  createdAt: string;
  updatedAt: string;
}

async function testNamespaceSearch() {
  console.log(chalk.blue.bold('\n🔍 Testing Upstash Vector Search with Namespace\n'));
  console.log(chalk.cyan(`📁 Namespace: ${NAMESPACE}\n`));

  const index = new Index<VectorMetadata>({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    namespace: NAMESPACE,
  });

  try {
    // Get index info
    const info = await index.info();
    console.log(chalk.green(`✅ Connected to index (Dimension: ${info.dimension})\n`));

    // Test queries
    const queries = [
      'table',
      'form', 
      'button',
      'chart',
      'dashboard',
      'react table',
      'vue component',
      'angular',
      'free',
      'premium',
      'typescript',
      'mantine',
      'material ui',
      'component library'
    ];

    for (const query of queries) {
      console.log(chalk.yellow(`\nQuery: "${query}"`));
      
      const results = await index.query({
        data: query,
        topK: 5,
        includeMetadata: true,
      });

      if (results.length > 0) {
        results.forEach((result, idx) => {
          const meta = result.metadata as VectorMetadata;
          console.log(chalk.white(
            `${idx + 1}. ${meta.name} (${meta.framework}) - Score: ${result.score.toFixed(3)}`
          ));
          console.log(chalk.gray(
            `   ${meta.type} | ${meta.category} | ${meta.downloads} downloads | ${meta.isFree ? 'Free' : `$${meta.price}`}`
          ));
          if (meta.tags.length > 0) {
            console.log(chalk.gray(`   Tags: ${meta.tags.slice(0, 5).join(', ')}`));
          }
        });
      } else {
        console.log(chalk.red('   No results found'));
      }
    }

    // Test with filters
    console.log(chalk.blue.bold('\n\n🎯 Testing with Filters\n'));

    // Filter by framework
    console.log(chalk.yellow('Filter: framework = "react"'));
    const reactResults = await index.query({
      data: 'component',
      topK: 3,
      includeMetadata: true,
      filter: 'framework = "react"'
    });

    if (reactResults.length > 0) {
      reactResults.forEach((result, idx) => {
        const meta = result.metadata as VectorMetadata;
        console.log(`${idx + 1}. ${meta.name} - ${meta.type}`);
      });
    } else {
      console.log(chalk.red('No React components found'));
    }

    // Filter by price
    console.log(chalk.yellow('\nFilter: isFree = true'));
    const freeResults = await index.query({
      data: 'ui component',
      topK: 3,
      includeMetadata: true,
      filter: 'isFree = true'
    });

    if (freeResults.length > 0) {
      freeResults.forEach((result, idx) => {
        const meta = result.metadata as VectorMetadata;
        console.log(`${idx + 1}. ${meta.name} - Free`);
      });
    } else {
      console.log(chalk.red('No free components found'));
    }

    // Get namespace stats
    console.log(chalk.blue.bold('\n\n📊 Namespace Statistics\n'));
    
    // Sample some vectors to get stats
    const sampleResults = await index.query({
      data: 'component',
      topK: 100,
      includeMetadata: true,
    });

    if (sampleResults.length > 0) {
      const frameworks = new Set<string>();
      const categories = new Set<string>();
      const types = new Set<string>();
      let freeCount = 0;
      let premiumCount = 0;
      let typescriptCount = 0;

      sampleResults.forEach(result => {
        const meta = result.metadata as VectorMetadata;
        frameworks.add(meta.framework);
        categories.add(meta.category);
        types.add(meta.type);
        if (meta.isFree) freeCount++;
        if (meta.isPremium) premiumCount++;
        if (meta.hasTypescript) typescriptCount++;
      });

      console.log(chalk.cyan('Sample of indexed resources:'));
      console.log(`  Frameworks: ${Array.from(frameworks).slice(0, 10).join(', ')}`);
      console.log(`  Categories: ${Array.from(categories).slice(0, 10).join(', ')}`);
      console.log(`  Types: ${Array.from(types).join(', ')}`);
      console.log(`  Free: ${freeCount}, Premium: ${premiumCount}`);
      console.log(`  TypeScript support: ${typescriptCount}`);
    }

  } catch (error) {
    console.error(chalk.red('\n💥 Error:'), error);
  }
}

testNamespaceSearch().catch(console.error);