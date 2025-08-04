#!/usr/bin/env node

/**
 * Verify all resources have been updated with real data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUpdates() {
  console.log('🔍 Verifying resource updates...\n');

  // Get all resources grouped by category
  const categories = ['frameworks', 'ui-libraries', 'icon-libraries', 'css-frameworks', 'design-tools'];

  for (const categorySlug of categories) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug }
    });

    if (!category) continue;

    const resources = await prisma.resource.findMany({
      where: { categoryId: category.id },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`\n📂 ${category.name} (${resources.length})`);
    console.log('='.repeat(80));

    for (const resource of resources) {
      const hasGithub = resource.githubUrl ? '✅' : '❌';
      const hasDocs = resource.documentationUrl ? '✅' : '❌';
      const hasLicense = resource.license !== 'MIT' ? `(${resource.license})` : '';
      const authorName = resource.author.name;
      const isSystemAuthor = resource.author.email === 'system@revolutionary-ui.com';

      console.log(
        `${resource.name.padEnd(25)} | ` +
        `Author: ${authorName.padEnd(20)} ${isSystemAuthor ? '⚠️' : '✅'} | ` +
        `GitHub: ${hasGithub} | ` +
        `Docs: ${hasDocs} | ` +
        `${resource.license} ${hasLicense}`
      );
    }
  }

  // Summary statistics
  const allResources = await prisma.resource.findMany({
    include: {
      author: true
    }
  });

  const systemAuthored = allResources.filter(r => r.author.email === 'system@revolutionary-ui.com');
  const missingGithub = allResources.filter(r => !r.githubUrl);
  const missingDocs = allResources.filter(r => !r.documentationUrl);

  console.log('\n📊 Summary Statistics:');
  console.log('='.repeat(50));
  console.log(`Total Resources: ${allResources.length}`);
  console.log(`System Authored (needs update): ${systemAuthored.length}`);
  console.log(`Missing GitHub URL: ${missingGithub.length}`);
  console.log(`Missing Documentation URL: ${missingDocs.length}`);

  if (systemAuthored.length > 0) {
    console.log('\n⚠️  Resources still authored by system:');
    systemAuthored.forEach(r => {
      console.log(`  - ${r.name} (${r.slug})`);
    });
  }

  if (missingGithub.length > 0) {
    console.log('\n❌ Resources missing GitHub URL:');
    missingGithub.forEach(r => {
      console.log(`  - ${r.name} (${r.slug})`);
    });
  }

  await prisma.$disconnect();
}

verifyUpdates();