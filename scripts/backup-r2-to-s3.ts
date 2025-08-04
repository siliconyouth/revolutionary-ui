#!/usr/bin/env tsx

/**
 * R2 to S3 Backup Script
 * Backs up R2 storage to AWS S3 or another R2 bucket
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
import { config } from '@dotenvx/dotenvx';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs';

config({ path: path.join(__dirname, '../.env.local') });

interface BackupConfig {
  source: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    endpoint: string;
  };
  destination: {
    accountId?: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    endpoint?: string;
    region?: string;
  };
}

class R2BackupService {
  private sourceClient: S3Client;
  private destClient: S3Client;
  private config: BackupConfig;
  private stats = {
    totalObjects: 0,
    backedUp: 0,
    skipped: 0,
    failed: 0,
    totalSize: 0,
  };

  constructor(config: BackupConfig) {
    this.config = config;

    // Source R2 client
    this.sourceClient = new S3Client({
      region: 'auto',
      endpoint: config.source.endpoint,
      credentials: {
        accessKeyId: config.source.accessKeyId,
        secretAccessKey: config.source.secretAccessKey,
      },
    });

    // Destination client (S3 or another R2)
    this.destClient = new S3Client({
      region: config.destination.region || 'auto',
      endpoint: config.destination.endpoint,
      credentials: {
        accessKeyId: config.destination.accessKeyId,
        secretAccessKey: config.destination.secretAccessKey,
      },
    });
  }

  async backup(options: {
    incremental?: boolean;
    prefix?: string;
    dryRun?: boolean;
  } = {}) {
    console.log(chalk.blue('\n🚀 R2 Backup Service\n'));
    console.log(chalk.yellow('Source:'), this.config.source.bucketName);
    console.log(chalk.yellow('Destination:'), this.config.destination.bucketName);
    
    if (options.dryRun) {
      console.log(chalk.yellow('\n⚠️  DRY RUN MODE - No files will be copied\n'));
    }

    const startTime = Date.now();
    const spinner = ora('Listing source objects...').start();

    try {
      // List all objects in source
      const sourceObjects = await this.listAllObjects(
        this.sourceClient,
        this.config.source.bucketName,
        options.prefix
      );

      this.stats.totalObjects = sourceObjects.length;
      spinner.succeed(`Found ${sourceObjects.length} objects to process`);

      // Process each object
      for (const obj of sourceObjects) {
        const objSpinner = ora(`Processing: ${obj.Key}`).start();

        try {
          const shouldBackup = await this.shouldBackupObject(obj, options.incremental);

          if (!shouldBackup) {
            this.stats.skipped++;
            objSpinner.info(`Skipped: ${obj.Key} (already exists)`);
            continue;
          }

          if (!options.dryRun) {
            await this.copyObject(obj);
          }

          this.stats.backedUp++;
          this.stats.totalSize += obj.Size || 0;
          objSpinner.succeed(`Backed up: ${obj.Key} (${this.formatSize(obj.Size || 0)})`);
        } catch (error) {
          this.stats.failed++;
          objSpinner.fail(`Failed: ${obj.Key} - ${error.message}`);
        }
      }

      const duration = (Date.now() - startTime) / 1000;
      this.printSummary(duration);
      this.saveBackupReport();

    } catch (error) {
      spinner.fail(`Backup failed: ${error.message}`);
      throw error;
    }
  }

  private async listAllObjects(
    client: S3Client,
    bucket: string,
    prefix?: string
  ): Promise<any[]> {
    const objects: any[] = [];
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      });

      const response = await client.send(command);
      if (response.Contents) {
        objects.push(...response.Contents);
      }
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return objects;
  }

  private async shouldBackupObject(obj: any, incremental: boolean): Promise<boolean> {
    if (!incremental) return true;

    try {
      // Check if object exists in destination
      const command = new HeadObjectCommand({
        Bucket: this.config.destination.bucketName,
        Key: obj.Key,
      });

      const destObj = await this.destClient.send(command);

      // Compare ETags or LastModified
      if (destObj.ETag === obj.ETag) {
        return false; // Same content, skip
      }

      if (destObj.LastModified && obj.LastModified) {
        return obj.LastModified > destObj.LastModified;
      }

      return true;
    } catch (error) {
      // Object doesn't exist in destination
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return true;
      }
      throw error;
    }
  }

  private async copyObject(obj: any): Promise<void> {
    // Get object from source
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    
    const getCommand = new GetObjectCommand({
      Bucket: this.config.source.bucketName,
      Key: obj.Key,
    });

    const response = await this.sourceClient.send(getCommand);
    
    if (!response.Body) {
      throw new Error('No body in response');
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    // Upload to destination
    const putCommand = new PutObjectCommand({
      Bucket: this.config.destination.bucketName,
      Key: obj.Key,
      Body: body,
      ContentType: response.ContentType,
      Metadata: response.Metadata,
    });

    await this.destClient.send(putCommand);
  }

  private formatSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  private printSummary(duration: number): void {
    console.log(chalk.green('\n✅ Backup Complete!\n'));
    console.log(chalk.white('📊 Summary:'));
    console.log(`  Total Objects: ${this.stats.totalObjects}`);
    console.log(`  Backed Up: ${chalk.green(this.stats.backedUp)}`);
    console.log(`  Skipped: ${chalk.yellow(this.stats.skipped)}`);
    console.log(`  Failed: ${chalk.red(this.stats.failed)}`);
    console.log(`  Total Size: ${this.formatSize(this.stats.totalSize)}`);
    console.log(`  Duration: ${duration.toFixed(1)}s`);
    console.log(`  Speed: ${(this.stats.backedUp / duration).toFixed(2)} objects/s`);
  }

  private saveBackupReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      source: this.config.source.bucketName,
      destination: this.config.destination.bucketName,
      stats: this.stats,
    };

    const reportPath = path.join(__dirname, '../backup-reports', `backup-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(chalk.gray(`\n📄 Report saved to: ${reportPath}`));
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const incremental = args.includes('--incremental');
  const prefix = args.find(arg => arg.startsWith('--prefix='))?.split('=')[1];

  // Configure backup
  const config: BackupConfig = {
    source: {
      accountId: process.env.R2_ACCOUNT_ID!,
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      bucketName: process.env.R2_BUCKET_NAME!,
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    },
    destination: {
      // Configure your backup destination (S3 or another R2 bucket)
      accessKeyId: process.env.BACKUP_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.BACKUP_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || '',
      bucketName: process.env.BACKUP_BUCKET_NAME || 'revolutionary-ui-backup',
      region: process.env.BACKUP_REGION || process.env.S3_REGION || 'us-east-1',
      // For S3: remove endpoint
      // For another R2: set endpoint like source
    },
  };

  if (!config.destination.accessKeyId || !config.destination.secretAccessKey) {
    console.error(chalk.red('\n❌ Missing backup destination credentials!'));
    console.log(chalk.yellow('\nSet these environment variables:'));
    console.log('  BACKUP_ACCESS_KEY_ID or S3_ACCESS_KEY_ID');
    console.log('  BACKUP_SECRET_ACCESS_KEY or S3_SECRET_ACCESS_KEY');
    console.log('  BACKUP_BUCKET_NAME (optional, defaults to revolutionary-ui-backup)');
    process.exit(1);
  }

  const backupService = new R2BackupService(config);
  
  try {
    await backupService.backup({
      dryRun,
      incremental,
      prefix,
    });
  } catch (error) {
    console.error(chalk.red('\n❌ Backup failed:'), error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}