#!/usr/bin/env tsx

/**
 * Migration Script: Upload existing component code to Cloudflare R2
 * This script migrates sourceCode and documentation from database text fields to R2 storage
 */

import { PrismaClient, StorageType } from '@prisma/client'
import { R2StorageService } from '../src/services/r2-storage-service'
import chalk from 'chalk'
import ora from 'ora'
import { config } from '@dotenvx/dotenvx'
import path from 'path'
import fs from 'fs'

// Load environment
config({ path: path.join(__dirname, '../.env.local') })

// Validate required environment variables
const requiredEnvVars = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(chalk.red(`❌ Missing required environment variable: ${envVar}`))
    process.exit(1)
  }
}

const prisma = new PrismaClient()
const r2Service = R2StorageService.getInstance({
  accountId: process.env.R2_ACCOUNT_ID!,
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  bucketName: process.env.R2_BUCKET_NAME!,
  publicUrl: process.env.R2_PUBLIC_URL,
})

interface MigrationStats {
  totalResources: number
  totalSubmissions: number
  migratedResources: number
  migratedSubmissions: number
  failedResources: string[]
  failedSubmissions: string[]
  totalSizeUploaded: number
}

async function migrateResources(stats: MigrationStats) {
  const spinner = ora('Loading resources...').start()
  
  try {
    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          { sourceCode: { not: null } },
          { documentation: { not: null } }
        ],
        AND: {
          codeStorageId: null // Not yet migrated
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sourceCode: true,
        documentation: true,
      }
    })
    
    stats.totalResources = resources.length
    spinner.succeed(`Found ${resources.length} resources to migrate`)
    
    for (const resource of resources) {
      const resourceSpinner = ora(`Migrating resource: ${resource.name} (${resource.id})`).start()
      
      try {
        let codeStorageId: string | null = null
        let docsStorageId: string | null = null
        
        // Upload source code if exists
        if (resource.sourceCode) {
          const codeKey = r2Service.generateResourceKey(resource.id, 'code', `${resource.slug}.tsx`)
          const codeLocation = await r2Service.upload(codeKey, resource.sourceCode, {
            contentType: 'text/typescript',
            metadata: {
              resourceId: resource.id,
              resourceName: resource.name,
              type: 'source_code'
            }
          })
          
          // Create storage record
          const codeStorage = await prisma.storageObject.create({
            data: {
              bucket: codeLocation.bucket,
              key: codeLocation.key,
              url: codeLocation.url,
              publicUrl: codeLocation.url,
              size: codeLocation.size,
              contentType: codeLocation.contentType,
              etag: codeLocation.etag,
              storageType: StorageType.SOURCE_CODE,
              resourceId: resource.id,
              metadata: {
                originalField: 'sourceCode',
                migrationDate: new Date().toISOString()
              }
            }
          })
          
          codeStorageId = codeStorage.id
          stats.totalSizeUploaded += codeLocation.size || 0
        }
        
        // Upload documentation if exists
        if (resource.documentation) {
          const docsKey = r2Service.generateResourceKey(resource.id, 'docs', 'README.md')
          const docsLocation = await r2Service.upload(docsKey, resource.documentation, {
            contentType: 'text/markdown',
            metadata: {
              resourceId: resource.id,
              resourceName: resource.name,
              type: 'documentation'
            }
          })
          
          // Create storage record
          const docsStorage = await prisma.storageObject.create({
            data: {
              bucket: docsLocation.bucket,
              key: docsLocation.key,
              url: docsLocation.url,
              publicUrl: docsLocation.url,
              size: docsLocation.size,
              contentType: docsLocation.contentType,
              etag: docsLocation.etag,
              storageType: StorageType.DOCUMENTATION,
              resourceId: resource.id,
              metadata: {
                originalField: 'documentation',
                migrationDate: new Date().toISOString()
              }
            }
          })
          
          docsStorageId = docsStorage.id
          stats.totalSizeUploaded += docsLocation.size || 0
        }
        
        // Update resource with storage references
        await prisma.resource.update({
          where: { id: resource.id },
          data: {
            codeStorageId,
            docsStorageId,
          }
        })
        
        stats.migratedResources++
        resourceSpinner.succeed(`✅ Migrated: ${resource.name}`)
        
      } catch (error) {
        stats.failedResources.push(resource.id)
        resourceSpinner.fail(`❌ Failed: ${resource.name} - ${error.message}`)
      }
    }
    
  } catch (error) {
    spinner.fail(`Error loading resources: ${error.message}`)
    throw error
  }
}

async function migrateSubmissions(stats: MigrationStats) {
  const spinner = ora('Loading component submissions...').start()
  
  try {
    const submissions = await prisma.componentSubmission.findMany({
      where: {
        sourceCode: { not: '' },
        codeStorageId: null // Not yet migrated
      },
      select: {
        id: true,
        name: true,
        sourceCode: true,
        documentation: true,
      }
    })
    
    stats.totalSubmissions = submissions.length
    spinner.succeed(`Found ${submissions.length} submissions to migrate`)
    
    for (const submission of submissions) {
      const submissionSpinner = ora(`Migrating submission: ${submission.name} (${submission.id})`).start()
      
      try {
        // Upload source code
        const codeKey = r2Service.generateSubmissionKey(submission.id, 'code', 'component.tsx')
        const codeLocation = await r2Service.upload(codeKey, submission.sourceCode, {
          contentType: 'text/typescript',
          metadata: {
            submissionId: submission.id,
            submissionName: submission.name,
            type: 'source_code'
          }
        })
        
        // Create storage record
        const codeStorage = await prisma.storageObject.create({
          data: {
            bucket: codeLocation.bucket,
            key: codeLocation.key,
            url: codeLocation.url,
            publicUrl: codeLocation.url,
            size: codeLocation.size,
            contentType: codeLocation.contentType,
            etag: codeLocation.etag,
            storageType: StorageType.SOURCE_CODE,
            submissionId: submission.id,
            metadata: {
              originalField: 'sourceCode',
              migrationDate: new Date().toISOString()
            }
          }
        })
        
        // Update submission with storage reference
        await prisma.componentSubmission.update({
          where: { id: submission.id },
          data: {
            codeStorageId: codeStorage.id,
          }
        })
        
        stats.migratedSubmissions++
        stats.totalSizeUploaded += codeLocation.size || 0
        submissionSpinner.succeed(`✅ Migrated: ${submission.name}`)
        
      } catch (error) {
        stats.failedSubmissions.push(submission.id)
        submissionSpinner.fail(`❌ Failed: ${submission.name} - ${error.message}`)
      }
    }
    
  } catch (error) {
    spinner.fail(`Error loading submissions: ${error.message}`)
    throw error
  }
}

async function verifyMigration() {
  const spinner = ora('Verifying migration...').start()
  
  try {
    // Check a sample of migrated resources
    const sampleResources = await prisma.resource.findMany({
      where: {
        codeStorageId: { not: null }
      },
      take: 5,
      include: {
        codeStorage: true,
        docsStorage: true,
      }
    })
    
    for (const resource of sampleResources) {
      if (resource.codeStorage) {
        // Verify we can download the content
        const content = await r2Service.downloadString(resource.codeStorage.key)
        if (!content) {
          throw new Error(`Failed to verify content for resource ${resource.id}`)
        }
      }
    }
    
    spinner.succeed('Migration verification passed')
  } catch (error) {
    spinner.fail(`Migration verification failed: ${error.message}`)
    throw error
  }
}

async function main() {
  console.log(chalk.blue('\n🚀 Revolutionary UI - R2 Storage Migration\n'))
  
  const stats: MigrationStats = {
    totalResources: 0,
    totalSubmissions: 0,
    migratedResources: 0,
    migratedSubmissions: 0,
    failedResources: [],
    failedSubmissions: [],
    totalSizeUploaded: 0,
  }
  
  try {
    // Test R2 connection
    const testSpinner = ora('Testing R2 connection...').start()
    const testKey = 'test/connection-test.txt'
    await r2Service.upload(testKey, 'Connection test successful', {
      contentType: 'text/plain'
    })
    await r2Service.delete(testKey)
    testSpinner.succeed('R2 connection successful')
    
    // Migrate resources
    console.log(chalk.yellow('\n📦 Migrating Resources...'))
    await migrateResources(stats)
    
    // Migrate submissions
    console.log(chalk.yellow('\n📦 Migrating Submissions...'))
    await migrateSubmissions(stats)
    
    // Verify migration
    console.log(chalk.yellow('\n🔍 Verifying Migration...'))
    await verifyMigration()
    
    // Print summary
    console.log(chalk.green('\n✅ Migration Complete!\n'))
    console.log(chalk.white('📊 Summary:'))
    console.log(`  Resources: ${stats.migratedResources}/${stats.totalResources} migrated`)
    console.log(`  Submissions: ${stats.migratedSubmissions}/${stats.totalSubmissions} migrated`)
    console.log(`  Total Size Uploaded: ${(stats.totalSizeUploaded / 1024 / 1024).toFixed(2)} MB`)
    
    if (stats.failedResources.length > 0) {
      console.log(chalk.red(`\n⚠️  Failed Resources: ${stats.failedResources.join(', ')}`))
    }
    if (stats.failedSubmissions.length > 0) {
      console.log(chalk.red(`⚠️  Failed Submissions: ${stats.failedSubmissions.join(', ')}`))
    }
    
    // Create migration report
    const report = {
      date: new Date().toISOString(),
      stats,
      environment: {
        bucket: process.env.R2_BUCKET_NAME,
        publicUrl: process.env.R2_PUBLIC_URL || 'Not configured'
      }
    }
    
    const reportPath = path.join(__dirname, '../migration-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(chalk.gray(`\n📄 Migration report saved to: ${reportPath}`))
    
  } catch (error) {
    console.error(chalk.red('\n❌ Migration failed:'), error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
main().catch(console.error)