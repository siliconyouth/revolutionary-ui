#!/usr/bin/env tsx

import { config } from '@dotenvx/dotenvx';
import OpenAI from 'openai';
import path from 'path';
import chalk from 'chalk';

config({ path: path.join(__dirname, '../.env.local') });

async function testOpenAI() {
  console.log(chalk.blue('\n🔍 Testing OpenAI Connection\n'));

  // Check API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error(chalk.red('❌ OPENAI_API_KEY not found in environment'));
    return;
  }

  console.log(chalk.green('✅ API Key found'));
  console.log(chalk.gray(`Key starts with: ${apiKey.substring(0, 7)}...`));

  // Check organization
  const orgId = process.env.OPENAI_ORG_ID || process.env.OPENAI_ORGANIZATION;
  if (orgId && orgId !== '' && !orgId.includes('Leave empty')) {
    console.log(chalk.yellow(`⚠️  Organization ID set: ${orgId}`));
  } else {
    console.log(chalk.green('✅ No organization ID (using personal account)'));
  }

  // Test API connection
  try {
    const openai = new OpenAI({
      apiKey,
      // Only set organization if it's a valid ID
      organization: (orgId && !orgId.includes('Leave empty')) ? orgId : undefined,
    });

    console.log(chalk.blue('\nTesting embedding generation...'));
    
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: 'Hello, world!',
    });

    console.log(chalk.green('✅ OpenAI API connection successful!'));
    console.log(chalk.gray(`Embedding dimensions: ${response.data[0].embedding.length}`));
    console.log(chalk.gray(`Model used: ${response.model}`));
    console.log(chalk.gray(`Usage: ${response.usage.total_tokens} tokens`));

  } catch (error: any) {
    console.error(chalk.red('\n❌ OpenAI API Error:'));
    console.error(chalk.red(error.message));
    
    if (error.code === 'mismatched_organization') {
      console.log(chalk.yellow('\n💡 Solution: Remove or update OPENAI_ORG_ID in .env.local'));
    }
  }
}

testOpenAI().catch(console.error);