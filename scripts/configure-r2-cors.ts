#!/usr/bin/env tsx

import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { config } from '@dotenvx/dotenvx';
import chalk from 'chalk';
import path from 'path';

// Load environment
config({ path: path.join(__dirname, '../.env.local') });

async function configureCORS() {
  console.log(chalk.blue('\n🚀 Configuring R2 CORS Policy\n'));

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  const corsConfiguration = {
    CORSRules: [
      {
        AllowedHeaders: ['*'],
        AllowedMethods: ['GET', 'HEAD', 'PUT', 'POST'],
        AllowedOrigins: [
          'http://localhost:3000',
          'http://localhost:3001',
          'https://revolutionary-ui.com',
          'https://www.revolutionary-ui.com',
          'https://components.revolutionary-ui.com',
          // Add your custom domain if different
          process.env.R2_PUBLIC_URL || 'https://pub-623b4f8f62e949fba7c96eac7f164a4a.r2.dev'
        ].filter(Boolean),
        ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type'],
        MaxAgeSeconds: 3600,
      },
    ],
  };

  try {
    const command = new PutBucketCorsCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      CORSConfiguration: corsConfiguration,
    });

    await client.send(command);
    console.log(chalk.green('✅ CORS policy configured successfully!\n'));
    
    console.log(chalk.yellow('Allowed Origins:'));
    corsConfiguration.CORSRules[0].AllowedOrigins.forEach(origin => {
      console.log(chalk.gray(`  - ${origin}`));
    });

    console.log(chalk.yellow('\nAllowed Methods:'));
    corsConfiguration.CORSRules[0].AllowedMethods.forEach(method => {
      console.log(chalk.gray(`  - ${method}`));
    });

    console.log(chalk.dim('\nNote: CORS changes may take a few minutes to propagate globally.'));
  } catch (error) {
    console.error(chalk.red('❌ Failed to configure CORS:'), error);
    console.log(chalk.yellow('\nAlternative: Configure CORS manually in Cloudflare Dashboard:'));
    console.log(chalk.gray('1. Go to R2 > Your Bucket > Settings > CORS'));
    console.log(chalk.gray('2. Add the CORS rules shown above'));
  }
}

configureCORS();