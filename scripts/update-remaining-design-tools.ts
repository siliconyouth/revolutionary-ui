#!/usr/bin/env node

/**
 * Update remaining design tools with proper authors
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DESIGN_TOOL_UPDATES = [
  {
    slug: 'figma-to-react',
    authorEmail: 'figma@github.com',
    description: 'Tool for converting Figma designs to React components',
    documentationUrl: 'https://www.figma.com/developers/api',
    githubUrl: 'https://github.com/figma-plus/figma-to-react'
  },
  {
    slug: 'react-figma',
    authorEmail: 'react-figma@github.com',
    description: 'Render React components to Figma',
    documentationUrl: 'https://react-figma.dev/docs/',
    githubUrl: 'https://github.com/react-figma/react-figma'
  },
  {
    slug: 'sketch-js',
    authorEmail: 'sketch@github.com',
    description: 'JavaScript framework for working with Sketch',
    documentationUrl: 'https://developer.sketch.com/javascript/',
    githubUrl: 'https://github.com/sketch-hq/sketch-js'
  },
  {
    slug: 'html-to-react',
    authorEmail: 'react-html-parser@github.com',
    description: 'Convert HTML strings to React components',
    documentationUrl: 'https://github.com/peternewnham/react-html-parser',
    githubUrl: 'https://github.com/peternewnham/react-html-parser'
  }
];

async function updateDesignTools() {
  console.log('🔄 Updating remaining design tools...\n');

  // First create any missing authors
  const authorsToCreate = [
    { email: 'react-figma@github.com', name: 'React Figma' },
    { email: 'sketch@github.com', name: 'Sketch' },
    { email: 'react-html-parser@github.com', name: 'React HTML Parser' }
  ];

  for (const authorData of authorsToCreate) {
    try {
      await prisma.user.upsert({
        where: { email: authorData.email },
        update: {},
        create: {
          email: authorData.email,
          name: authorData.name
        }
      });
      console.log(`✅ Ensured author exists: ${authorData.name}`);
    } catch (error) {
      console.error(`Error creating author ${authorData.email}:`, error.message);
    }
  }

  // Update the design tools
  for (const update of DESIGN_TOOL_UPDATES) {
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
          description: update.description,
          author: {
            connect: { id: author.id }
          },
          documentationUrl: update.documentationUrl,
          githubUrl: update.githubUrl
        }
      });

      console.log(`✅ Updated ${resource.name}: Author: ${author.name}`);
    } catch (error) {
      console.error(`❌ Error updating ${update.slug}:`, error.message);
    }
  }

  await prisma.$disconnect();
}

updateDesignTools();