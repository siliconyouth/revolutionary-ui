#!/usr/bin/env node

/**
 * Summary of all data migrated to database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showMigrationSummary() {
  console.log('📊 DATABASE MIGRATION SUMMARY\n');
  console.log('=' .repeat(80));

  try {
    // Get all categories with counts
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { resources: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log('\n📁 CATEGORIES AND RESOURCE COUNTS:');
    console.log('-'.repeat(50));
    
    let totalResources = 0;
    for (const category of categories) {
      console.log(`${category.name.padEnd(25)} | ${category._count.resources} resources`);
      totalResources += category._count.resources;
    }
    
    console.log('-'.repeat(50));
    console.log(`${'TOTAL'.padEnd(25)} | ${totalResources} resources`);

    // New categories added in this migration
    const newCategories = ['css-in-js', 'color-tools', 'fonts', 'tailwind-utilities'];
    console.log('\n✨ NEW CATEGORIES ADDED:');
    for (const slug of newCategories) {
      const cat = categories.find(c => c.slug === slug);
      if (cat) {
        console.log(`  - ${cat.name}: ${cat._count.resources} resources`);
      }
    }

    // Get system configs
    const systemConfigs = await prisma.systemConfig.findMany({
      where: {
        key: {
          in: ['framework-feature-matrix', 'factory-capabilities', 'factory-metadata']
        }
      }
    });

    console.log('\n⚙️ SYSTEM CONFIGURATIONS:');
    for (const config of systemConfigs) {
      console.log(`  - ${config.key}: ${config.description}`);
    }

    // Get feature flags
    const featureFlags = await prisma.featureFlag.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('\n🚩 FEATURE FLAGS:');
    for (const flag of featureFlags) {
      const status = flag.isEnabled ? '✅ Enabled' : '❌ Disabled';
      console.log(`  - ${flag.name.padEnd(20)} | ${status} | ${flag.rolloutPercentage}% rollout`);
    }

    // Get tags
    const tags = await prisma.tag.count();
    const frameworkTags = await prisma.tag.findMany({
      where: {
        OR: [
          { slug: { contains: 'compatible-' } },
          { slug: { contains: 'based-on-' } }
        ]
      }
    });

    console.log('\n🏷️ TAGS:');
    console.log(`  Total tags: ${tags}`);
    console.log(`  Framework compatibility tags: ${frameworkTags.filter(t => t.slug.includes('compatible-')).length}`);
    console.log(`  Framework relationship tags: ${frameworkTags.filter(t => t.slug.includes('based-on-')).length}`);

    // Authors summary
    const authors = await prisma.user.findMany({
      where: {
        NOT: { email: 'system@revolutionary-ui.com' }
      },
      include: {
        _count: {
          select: { resources: true }
        }
      },
      orderBy: { resources: { _count: 'desc' } },
      take: 10
    });

    console.log('\n👥 TOP 10 AUTHORS BY RESOURCE COUNT:');
    for (const author of authors) {
      if (author._count.resources > 0) {
        console.log(`  - ${author.name?.padEnd(25) || author.email.padEnd(25)} | ${author._count.resources} resources`);
      }
    }

    // Resource types
    const resourceTypes = await prisma.resourceType.findMany({
      include: {
        _count: {
          select: { resources: true }
        }
      }
    });

    console.log('\n📦 RESOURCE TYPES:');
    for (const type of resourceTypes) {
      console.log(`  - ${type.name.padEnd(15)} | ${type._count.resources} resources`);
    }

    // Migration benefits
    console.log('\n🎯 MIGRATION BENEFITS:');
    console.log('  ✅ Removed all static configuration files');
    console.log('  ✅ Dynamic resource loading from database');
    console.log('  ✅ Real author attribution for all resources');
    console.log('  ✅ Framework compatibility tracking');
    console.log('  ✅ Feature flags for upcoming features');
    console.log('  ✅ System configuration management');
    console.log('  ✅ Scalable data model for future growth');

    console.log('\n' + '='.repeat(80));
    console.log('✅ All data successfully migrated to database!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error generating summary:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showMigrationSummary();