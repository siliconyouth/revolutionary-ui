#!/usr/bin/env node

/**
 * Migrate framework feature matrix to database
 * Creates relationships between frameworks and their supported libraries
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Framework feature matrix from config
const FRAMEWORK_FEATURE_MATRIX = {
  react: {
    frameworks: ['next', 'gatsby', 'remix', 'vite'],
    uiLibraries: ['mui', 'antd', 'chakra', 'mantine', 'radix', 'headlessui'],
    styling: ['styled-components', 'emotion', 'tailwind', 'css-modules'],
    testing: ['jest', 'testing-library', 'cypress', 'playwright']
  },
  vue: {
    frameworks: ['nuxt', 'vitepress', 'quasar'],
    uiLibraries: ['vuetify', 'element-plus', 'naive-ui', 'headlessui'],
    styling: ['tailwind', 'css-modules', 'scss'],
    testing: ['vitest', 'cypress', 'playwright']
  },
  angular: {
    frameworks: ['ionic', 'ngrx'],
    uiLibraries: ['material', 'primeng', 'ng-bootstrap'],
    styling: ['tailwind', 'scss', 'css-modules'],
    testing: ['karma', 'jasmine', 'cypress']
  },
  svelte: {
    frameworks: ['sveltekit'],
    uiLibraries: ['carbon-components-svelte', 'smelte'],
    styling: ['tailwind', 'scss', 'postcss'],
    testing: ['vitest', 'playwright']
  }
};

async function migrateFrameworkFeatures() {
  console.log('🚀 Starting migration of framework feature matrix...\n');

  try {
    // Create or update tags for framework compatibility
    const compatibilityTags = new Map<string, any>();
    
    for (const [framework, features] of Object.entries(FRAMEWORK_FEATURE_MATRIX)) {
      const tagSlug = `compatible-${framework}`;
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: {
          name: `${framework.charAt(0).toUpperCase() + framework.slice(1)} Compatible`,
          slug: tagSlug
        }
      });
      compatibilityTags.set(framework, tag);
      console.log(`✅ Created/ensured tag: ${tag.name}`);
    }

    // Update resources with framework compatibility tags
    console.log('\n📦 Updating UI libraries with framework compatibility...');
    
    for (const [framework, features] of Object.entries(FRAMEWORK_FEATURE_MATRIX)) {
      const compatTag = compatibilityTags.get(framework);
      
      // Update UI libraries
      for (const libName of features.uiLibraries) {
        try {
          // Map library names to actual slugs in database
          const libSlugMap: Record<string, string> = {
            'mui': 'material-ui',
            'antd': 'ant-design',
            'chakra': 'chakra-ui',
            'mantine': 'mantine',
            'radix': 'radix-ui',
            'headlessui': 'headlessui',
            'vuetify': 'vuetify',
            'element-plus': 'element-plus',
            'naive-ui': 'naive-ui',
            'material': 'angular-material',
            'primeng': 'primeng',
            'ng-bootstrap': 'ng-bootstrap',
            'carbon-components-svelte': 'carbon-components-svelte',
            'smelte': 'smelte'
          };
          
          const slug = libSlugMap[libName] || libName;
          const resource = await prisma.resource.findUnique({ where: { slug } });
          
          if (resource) {
            await prisma.resource.update({
              where: { id: resource.id },
              data: {
                tags: {
                  connect: { id: compatTag.id }
                },
                frameworks: {
                  push: framework
                }
              }
            });
            console.log(`  ✅ Updated ${resource.name} - added ${framework} compatibility`);
          } else {
            console.log(`  ⚠️ Resource not found: ${slug}`);
          }
        } catch (error) {
          console.error(`  ❌ Error updating ${libName}:`, error.message);
        }
      }
      
      // Update CSS-in-JS libraries
      for (const stylingLib of features.styling) {
        try {
          const resource = await prisma.resource.findUnique({ where: { slug: stylingLib } });
          
          if (resource) {
            await prisma.resource.update({
              where: { id: resource.id },
              data: {
                tags: {
                  connect: { id: compatTag.id }
                },
                frameworks: {
                  push: framework
                }
              }
            });
            console.log(`  ✅ Updated ${resource.name} - added ${framework} compatibility`);
          }
        } catch (error) {
          // CSS modules and SCSS are not in our database, skip silently
        }
      }
    }

    // Create system config for framework features
    console.log('\n📊 Storing framework feature matrix in system config...');
    
    await prisma.systemConfig.upsert({
      where: { key: 'framework-feature-matrix' },
      update: {
        value: FRAMEWORK_FEATURE_MATRIX,
        description: 'Framework compatibility and feature support matrix'
      },
      create: {
        key: 'framework-feature-matrix',
        value: FRAMEWORK_FEATURE_MATRIX,
        description: 'Framework compatibility and feature support matrix',
        isSecret: false
      }
    });
    
    console.log('✅ Framework feature matrix stored in system config');

    // Create relationships between parent frameworks and their sub-frameworks
    console.log('\n🔗 Creating framework relationships...');
    
    const frameworkRelations = [
      { parent: 'react', children: ['next', 'gatsby', 'remix'] },
      { parent: 'vue', children: ['nuxt', 'vitepress', 'quasar'] },
      { parent: 'angular', children: ['ionic'] },
      { parent: 'svelte', children: ['sveltekit'] }
    ];
    
    for (const relation of frameworkRelations) {
      const parentResource = await prisma.resource.findUnique({ 
        where: { slug: relation.parent } 
      });
      
      if (parentResource) {
        const parentTag = await prisma.tag.upsert({
          where: { slug: `based-on-${relation.parent}` },
          update: {},
          create: {
            name: `${relation.parent.charAt(0).toUpperCase() + relation.parent.slice(1)} Based`,
            slug: `based-on-${relation.parent}`
          }
        });
        
        for (const childSlug of relation.children) {
          const childResource = await prisma.resource.findUnique({ 
            where: { slug: childSlug } 
          });
          
          if (childResource) {
            await prisma.resource.update({
              where: { id: childResource.id },
              data: {
                tags: {
                  connect: { id: parentTag.id }
                }
              }
            });
            console.log(`  ✅ Linked ${childResource.name} as ${relation.parent}-based framework`);
          }
        }
      }
    }

    console.log('\n✅ Framework feature matrix migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateFrameworkFeatures();