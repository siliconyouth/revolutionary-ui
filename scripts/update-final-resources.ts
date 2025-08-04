#!/usr/bin/env node

/**
 * Update final missing resources
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FINAL_UPDATES = [
  {
    slug: 'headlessui',
    authorEmail: 'tailwindlabs@github.com',
    githubUrl: 'https://github.com/tailwindlabs/headlessui',
    documentationUrl: 'https://headlessui.com/',
    license: 'MIT'
  },
  {
    slug: 'fontawesome',
    authorEmail: 'FortAwesome@github.com',
    githubUrl: 'https://github.com/FortAwesome/Font-Awesome',
    documentationUrl: 'https://fontawesome.com/docs',
    license: 'Various (Free: OFL-1.1, MIT, CC-BY-4.0)'
  },
  {
    slug: 'mui-icons',
    authorEmail: 'google@github.com',
    githubUrl: 'https://github.com/google/material-design-icons',
    documentationUrl: 'https://developers.google.com/fonts/docs/material_icons',
    license: 'Apache-2.0'
  },
  {
    slug: 'primeicons',
    authorEmail: 'primefaces@github.com',
    githubUrl: 'https://github.com/primefaces/primeicons',
    documentationUrl: 'https://primereact.org/icons/',
    license: 'MIT'
  }
];

async function updateFinalResources() {
  console.log('🔄 Updating final resources...\n');

  let updatedCount = 0;

  for (const update of FINAL_UPDATES) {
    try {
      const author = await prisma.user.findUnique({
        where: { email: update.authorEmail }
      });

      if (!author) {
        console.error(`❌ Author not found: ${update.authorEmail}`);
        continue;
      }

      const resource = await prisma.resource.update({
        where: { slug: update.slug },
        data: {
          authorId: author.id,
          githubUrl: update.githubUrl,
          documentationUrl: update.documentationUrl,
          license: update.license
        }
      });

      console.log(`✅ Updated ${resource.name}: Author: ${author.name}, License: ${update.license}`);
      updatedCount++;
    } catch (error) {
      console.error(`❌ Error updating ${update.slug}:`, error.message);
    }
  }

  console.log(`\n✅ Successfully updated: ${updatedCount} resources`);
  await prisma.$disconnect();
}

updateFinalResources();