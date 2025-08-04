#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { config } from '@dotenvx/dotenvx'
import path from 'path'
import chalk from 'chalk'

// Load environment
config({ path: path.join(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function checkMigrationStatus() {
  try {
    // Count storage objects
    const storageObjects = await prisma.storageObject.count()
    
    // Resources with R2 storage
    const resourcesWithStorage = await prisma.resource.count({
      where: { codeStorageId: { not: null } }
    })
    
    // Submissions with R2 storage
    const submissionsWithStorage = await prisma.componentSubmission.count({
      where: { codeStorageId: { not: null } }
    })
    
    // Total resources that should be migrated
    const totalResources = await prisma.resource.count({
      where: {
        OR: [
          { sourceCode: { not: '' } },
          { documentation: { not: '' } }
        ]
      }
    })
    
    // Total submissions that should be migrated  
    const totalSubmissions = await prisma.componentSubmission.count({
      where: { sourceCode: { not: '' } }
    })
    
    // Check sample storage objects
    const sampleStorageObjects = await prisma.storageObject.findMany({
      take: 5,
      orderBy: { uploadedAt: 'desc' },
      include: {
        resource: {
          select: { name: true, slug: true }
        },
        submission: {
          select: { name: true }
        }
      }
    })
    
    // Check R2 configuration
    const r2Configured = !!(
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
    )
    
    // Print status
    console.log(chalk.blue('\n🚀 R2 Migration Status Report\n'))
    
    console.log(chalk.yellow('📊 Configuration:'))
    console.log(`  R2 Configured: ${r2Configured ? chalk.green('✓ Yes') : chalk.red('✗ No')}`)
    if (r2Configured) {
      console.log(`  Account ID: ${process.env.R2_ACCOUNT_ID}`)
      console.log(`  Bucket: ${process.env.R2_BUCKET_NAME}`)
      console.log(`  Public URL: ${process.env.R2_PUBLIC_URL || 'Not configured'}`)
    }
    
    console.log(chalk.yellow('\n📦 Storage Objects:'))
    console.log(`  Total Objects: ${storageObjects}`)
    
    console.log(chalk.yellow('\n📚 Resources:'))
    console.log(`  With R2 Storage: ${resourcesWithStorage}/${totalResources}`)
    console.log(`  Migrated: ${resourcesWithStorage === totalResources ? chalk.green('✓ Complete') : chalk.yellow('⚠ Incomplete')}`)
    
    console.log(chalk.yellow('\n📝 Submissions:'))
    console.log(`  With R2 Storage: ${submissionsWithStorage}/${totalSubmissions}`)
    console.log(`  Migrated: ${submissionsWithStorage === totalSubmissions ? chalk.green('✓ Complete') : chalk.yellow('⚠ Incomplete')}`)
    
    if (sampleStorageObjects.length > 0) {
      console.log(chalk.yellow('\n🔍 Recent Storage Objects:'))
      for (const obj of sampleStorageObjects) {
        const name = obj.resource?.name || obj.submission?.name || 'Unknown'
        console.log(`  - ${name}: ${obj.key} (${obj.storageType})`)
      }
    }
    
    // Recommendations
    console.log(chalk.yellow('\n💡 Recommendations:'))
    
    if (!r2Configured) {
      console.log(chalk.red('  1. Configure R2 credentials in .env.local'))
      console.log('     - R2_ACCOUNT_ID')
      console.log('     - R2_ACCESS_KEY_ID')
      console.log('     - R2_SECRET_ACCESS_KEY')
      console.log('     - R2_BUCKET_NAME')
    }
    
    if (resourcesWithStorage < totalResources || submissionsWithStorage < totalSubmissions) {
      console.log(chalk.yellow('  2. Run migration script:'))
      console.log('     npm run migrate:r2')
    }
    
    if (!process.env.R2_PUBLIC_URL) {
      console.log(chalk.yellow('  3. Configure public URL for direct access:'))
      console.log('     R2_PUBLIC_URL=https://your-bucket.r2.dev')
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error checking migration status:'), error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMigrationStatus()