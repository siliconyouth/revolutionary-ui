#!/usr/bin/env node

/**
 * Add shadcn/ui to the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addShadcnUI() {
  try {
    console.log('Adding shadcn/ui to database...\n');
    
    // Find UI Libraries category
    const uiCategory = await prisma.category.findUnique({
      where: { slug: 'ui-libraries' }
    });
    
    if (!uiCategory) {
      throw new Error('UI Libraries category not found');
    }
    
    // Find Library resource type
    const libraryType = await prisma.resourceType.findUnique({
      where: { slug: 'library' }
    });
    
    if (!libraryType) {
      throw new Error('Library resource type not found');
    }
    
    // Find or create a system user for resources
    const systemUser = await prisma.user.findFirst({
      where: { email: 'system@revolutionary-ui.com' }
    });
    
    if (!systemUser) {
      throw new Error('System user not found. Please ensure a user exists in the database.');
    }
    
    // Create shadcn/ui resource
    const shadcnUI = await prisma.resource.upsert({
      where: { slug: 'shadcn-ui' },
      update: {},
      create: {
        name: 'shadcn/ui',
        slug: 'shadcn-ui',
        description: 'Beautifully designed components built with Radix UI and Tailwind CSS. Copy and paste into your apps.',
        category: {
          connect: { id: uiCategory.id }
        },
        resourceType: {
          connect: { id: libraryType.id }
        },
        author: {
          connect: { id: systemUser.id }
        },
        isPublished: true,
        npmPackage: null, // shadcn/ui is not an npm package
        githubUrl: 'https://github.com/shadcn-ui/ui',
        demoUrl: 'https://ui.shadcn.com',
        documentationUrl: 'https://ui.shadcn.com/docs',
        frameworks: ['React', 'Next.js'],
        longDescription: 'shadcn/ui is a collection of reusable components built using Radix UI and Tailwind CSS. This is NOT a component library. It\'s a collection of re-usable components that you can copy and paste into your apps. Features include: Copy-paste components, Built on Radix UI primitives, Tailwind CSS styling, TypeScript support, Dark mode, Accessible, Customizable, No npm dependencies',
        hasTypescript: true,
        isAccessible: true,
        supportsDarkMode: true,
        githubStars: 75000,
        weeklyDownloads: 0, // Not applicable since it's not an npm package
        license: 'MIT'
      }
    });
    
    console.log('✅ Successfully added shadcn/ui to the database!');
    console.log(`   Category: ${uiCategory.name}`);
    console.log(`   Type: ${libraryType.name}`);
    console.log(`   Frameworks: ${shadcnUI.frameworks.join(', ')}`);
    
    // Also add a note about its unique nature
    console.log('\n📝 Note: shadcn/ui is a copy-paste component library, not a traditional npm package.');
    console.log('   Components are copied directly into your project for full customization.');
    
  } catch (error) {
    console.error('Error adding shadcn/ui:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addShadcnUI();