#!/usr/bin/env node

/**
 * Migrate factory capabilities configuration to database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Factory capabilities from config
const FACTORY_CAPABILITIES = {
  componentGeneration: {
    frameworks: 16, // Will be updated dynamically
    uiLibraries: 30, // Will be updated dynamically
    customization: 'Full theme and variant support',
    codeReduction: '60-95%'
  },
  designImport: {
    figma: true,
    sketch: true,
    adobe: false, // Coming soon
    penpot: false // Coming soon
  },
  aiFeatures: {
    naturalLanguage: true,
    codeGeneration: true,
    designToCode: true,
    optimization: true
  },
  export: {
    formats: ['React', 'Vue', 'Angular', 'Svelte', 'Web Components'],
    styling: ['Tailwind', 'CSS-in-JS', 'CSS Modules', 'Vanilla CSS'],
    typescript: true,
    testing: true
  }
};

async function migrateFactoryCapabilities() {
  console.log('🚀 Starting migration of factory capabilities...\n');

  try {
    // Get actual counts from database
    const frameworkCategory = await prisma.category.findUnique({
      where: { slug: 'frameworks' },
      include: { resources: true }
    });
    
    const uiLibraryCategory = await prisma.category.findUnique({
      where: { slug: 'ui-libraries' },
      include: { resources: true }
    });

    // Update counts with actual data
    if (frameworkCategory) {
      FACTORY_CAPABILITIES.componentGeneration.frameworks = frameworkCategory.resources.length;
    }
    
    if (uiLibraryCategory) {
      FACTORY_CAPABILITIES.componentGeneration.uiLibraries = uiLibraryCategory.resources.length;
    }

    console.log(`📊 Factory Capabilities Summary:`);
    console.log(`  - Frameworks: ${FACTORY_CAPABILITIES.componentGeneration.frameworks}`);
    console.log(`  - UI Libraries: ${FACTORY_CAPABILITIES.componentGeneration.uiLibraries}`);
    console.log(`  - Code Reduction: ${FACTORY_CAPABILITIES.componentGeneration.codeReduction}`);

    // Store factory capabilities in system config
    await prisma.systemConfig.upsert({
      where: { key: 'factory-capabilities' },
      update: {
        value: FACTORY_CAPABILITIES,
        description: 'Revolutionary UI Factory system capabilities and features'
      },
      create: {
        key: 'factory-capabilities',
        value: FACTORY_CAPABILITIES,
        description: 'Revolutionary UI Factory system capabilities and features',
        isSecret: false
      }
    });
    
    console.log('\n✅ Factory capabilities stored in system config');

    // Store additional metadata
    const metadata = {
      version: '3.0.0',
      lastUpdated: new Date().toISOString(),
      supportedPackageManagers: ['npm', 'yarn', 'pnpm', 'bun'],
      cliFeatures: [
        'analyze - Analyze project structure',
        'generate - Generate components',
        'setup - Initial project setup',
        'cloud-sync - Sync with cloud',
        'marketplace - Browse marketplace'
      ],
      factoryTypes: [
        'FormFactory',
        'TableFactory',
        'DashboardFactory',
        'ChartFactory',
        'PageLayoutFactory',
        'GridFactory',
        'ModalFactory',
        'NavigationFactory',
        'GameUIFactory',
        'AdminPanelFactory',
        'AnalyticsFactory',
        'AuthFactory'
      ]
    };

    await prisma.systemConfig.upsert({
      where: { key: 'factory-metadata' },
      update: {
        value: metadata,
        description: 'Revolutionary UI Factory metadata and feature list'
      },
      create: {
        key: 'factory-metadata',
        value: metadata,
        description: 'Revolutionary UI Factory metadata and feature list',
        isSecret: false
      }
    });
    
    console.log('✅ Factory metadata stored in system config');

    // Create feature flags for upcoming features
    const upcomingFeatures = [
      {
        key: 'adobe-xd-import',
        name: 'Adobe XD Import',
        description: 'Import designs from Adobe XD',
        isEnabled: false,
        rolloutPercentage: 0
      },
      {
        key: 'penpot-import',
        name: 'Penpot Import',
        description: 'Import designs from Penpot',
        isEnabled: false,
        rolloutPercentage: 0
      },
      {
        key: 'plugin-system',
        name: 'Plugin System',
        description: 'Extensible plugin architecture',
        isEnabled: false,
        rolloutPercentage: 0
      },
      {
        key: 'mobile-app',
        name: 'Mobile App',
        description: 'Revolutionary UI mobile application',
        isEnabled: false,
        rolloutPercentage: 0
      },
      {
        key: 'figma-integration',
        name: 'Figma Integration',
        description: 'Direct Figma plugin integration',
        isEnabled: true,
        rolloutPercentage: 100
      }
    ];

    console.log('\n🚩 Creating feature flags...');
    for (const feature of upcomingFeatures) {
      await prisma.featureFlag.upsert({
        where: { key: feature.key },
        update: {
          name: feature.name,
          description: feature.description,
          isEnabled: feature.isEnabled,
          rolloutPercentage: feature.rolloutPercentage
        },
        create: feature
      });
      console.log(`  ✅ Feature flag: ${feature.name} (${feature.isEnabled ? 'enabled' : 'disabled'})`);
    }

    // Get total resources count
    const totalResources = await prisma.resource.count();
    const totalCategories = await prisma.category.count();
    const totalTags = await prisma.tag.count();

    console.log('\n📈 Database Statistics:');
    console.log(`  - Total Resources: ${totalResources}`);
    console.log(`  - Total Categories: ${totalCategories}`);
    console.log(`  - Total Tags: ${totalTags}`);

    console.log('\n✅ Factory capabilities migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateFactoryCapabilities();