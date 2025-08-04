// UI Catalog Data Import Script
// Populates the database with UI resources from various sources

import { PrismaClient } from '@prisma/client';
import { Octokit } from '@octokit/rest';
import axios from 'axios';

const prisma = new PrismaClient();
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// =====================================================
// DATA SOURCES
// =====================================================

const AWESOME_LISTS = [
  {
    repo: 'web-padawan/awesome-web-components',
    category: 'web-components',
  },
  {
    repo: 'brillout/awesome-react-components',
    category: 'react',
  },
  {
    repo: 'vuejs/awesome-vue',
    category: 'vue',
  },
  {
    repo: 'PatrickJS/awesome-angular',
    category: 'angular',
  },
];

const DESIGN_SYSTEMS = [
  {
    name: 'Material Web Components',
    githubUrl: 'https://github.com/material-components/material-web',
    designLanguage: 'Material Design',
    company: 'Google',
  },
  {
    name: 'Carbon Web Components',
    githubUrl: 'https://github.com/carbon-design-system/carbon-web-components',
    designLanguage: 'Carbon Design',
    company: 'IBM',
  },
  {
    name: 'Spectrum Web Components',
    githubUrl: 'https://github.com/adobe/spectrum-web-components',
    designLanguage: 'Spectrum',
    company: 'Adobe',
  },
];

// =====================================================
// IMPORT FUNCTIONS
// =====================================================

async function importCategories() {
  console.log('Importing categories...');
  
  const categories = [
    { name: 'Standards', slug: 'standards', description: 'Web Components standards and specifications', sortOrder: 1 },
    { name: 'Guides', slug: 'guides', description: 'Learning resources and best practices', sortOrder: 2 },
    { name: 'Articles', slug: 'articles', description: 'In-depth articles and discussions', sortOrder: 3 },
    { name: 'Real World', slug: 'real-world', description: 'Production implementations and case studies', sortOrder: 4 },
    { name: 'Libraries', slug: 'libraries', description: 'Web Components libraries and frameworks', sortOrder: 5 },
    { name: 'Frameworks', slug: 'frameworks', description: 'Framework integrations and support', sortOrder: 6 },
    { name: 'Ecosystem', slug: 'ecosystem', description: 'Tools, testing, and development ecosystem', sortOrder: 7 },
    { name: 'Design Systems', slug: 'design-systems', description: 'Complete design system implementations', sortOrder: 8 },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  // Add subcategories
  const realWorldCategory = await prisma.category.findUnique({ where: { slug: 'real-world' } });
  if (realWorldCategory) {
    await prisma.category.createMany({
      data: [
        { name: 'Components', slug: 'components', parentId: realWorldCategory.id, sortOrder: 1 },
        { name: 'Component Libraries', slug: 'component-libraries', parentId: realWorldCategory.id, sortOrder: 2 },
      ],
      skipDuplicates: true,
    });
  }
}

async function importResourceTypes() {
  console.log('Importing resource types...');
  
  const types = [
    { name: 'Component', slug: 'component', description: 'Individual UI component' },
    { name: 'Library', slug: 'library', description: 'Component library or collection' },
    { name: 'Framework', slug: 'framework', description: 'UI framework or meta-framework' },
    { name: 'Design System', slug: 'design-system', description: 'Complete design system implementation' },
    { name: 'Tool', slug: 'tool', description: 'Development tool or utility' },
    { name: 'Guide', slug: 'guide', description: 'Tutorial or learning resource' },
    { name: 'Article', slug: 'article', description: 'Technical article or blog post' },
    { name: 'Example', slug: 'example', description: 'Code example or demo' },
    { name: 'Integration', slug: 'integration', description: 'Framework integration or adapter' },
  ];

  for (const type of types) {
    await prisma.resourceType.upsert({
      where: { slug: type.slug },
      update: type,
      create: type,
    });
  }
}

async function importParadigms() {
  console.log('Importing paradigms...');
  
  const paradigms = [
    { name: 'Class-Based', description: 'Object-oriented approach using ES6 classes' },
    { name: 'Functional', description: 'Functional programming approach with hooks' },
    { name: 'Declarative', description: 'Declarative component definition' },
    { name: 'Compiler-Based', description: 'Compile-time optimization approach' },
    { name: 'Hybrid', description: 'Mixed paradigm approach' },
  ];

  for (const paradigm of paradigms) {
    await prisma.paradigm.upsert({
      where: { name: paradigm.name },
      update: paradigm,
      create: paradigm,
    });
  }
}

async function importFrameworks() {
  console.log('Importing frameworks...');
  
  const frameworks = [
    { name: 'React', slug: 'react', icon: 'react' },
    { name: 'Vue', slug: 'vue', icon: 'vue' },
    { name: 'Angular', slug: 'angular', icon: 'angular' },
    { name: 'Svelte', slug: 'svelte', icon: 'svelte' },
    { name: 'Vanilla JS', slug: 'vanilla', icon: 'javascript' },
    { name: 'Web Components', slug: 'web-components', icon: 'web-components' },
  ];

  for (const framework of frameworks) {
    await prisma.framework.upsert({
      where: { slug: framework.slug },
      update: framework,
      create: framework,
    });
  }
}

async function importTags() {
  console.log('Importing tags...');
  
  const tags = [
    { name: 'Accessible', slug: 'accessible', category: 'feature' },
    { name: 'TypeScript', slug: 'typescript', category: 'tech' },
    { name: 'Responsive', slug: 'responsive', category: 'feature' },
    { name: 'Material Design', slug: 'material-design', category: 'design' },
    { name: 'Dark Mode', slug: 'dark-mode', category: 'feature' },
    { name: 'SSR Compatible', slug: 'ssr-compatible', category: 'feature' },
    { name: 'Tree-Shakeable', slug: 'tree-shakeable', category: 'feature' },
    { name: 'Zero Dependencies', slug: 'zero-dependencies', category: 'feature' },
    { name: 'Enterprise', slug: 'enterprise', category: 'use-case' },
    { name: 'Mobile-First', slug: 'mobile-first', category: 'feature' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
  }
}

async function fetchGitHubMetadata(githubUrl: string) {
  try {
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;

    const [, owner, repo] = match;
    const { data } = await octokit.repos.get({ owner, repo });

    return {
      githubStars: data.stargazers_count,
      description: data.description,
      license: data.license?.spdx_id,
      lastUpdated: new Date(data.updated_at),
      websiteUrl: data.homepage,
    };
  } catch (error) {
    console.error(`Failed to fetch GitHub data for ${githubUrl}:`, error);
    return null;
  }
}

async function fetchNpmMetadata(packageName: string) {
  try {
    const { data } = await axios.get(`https://api.npmjs.org/downloads/point/last-week/${packageName}`);
    return {
      npmDownloads: data.downloads,
    };
  } catch (error) {
    console.error(`Failed to fetch npm data for ${packageName}:`, error);
    return null;
  }
}

async function importResource(resourceData: any) {
  const category = await prisma.category.findFirst({ where: { slug: resourceData.categorySlug } });
  const resourceType = await prisma.resourceType.findFirst({ where: { slug: resourceData.typeSlug } });
  
  if (!category || !resourceType) {
    console.error(`Missing category or type for resource: ${resourceData.name}`);
    return;
  }

  // Fetch additional metadata
  const githubData = resourceData.githubUrl ? await fetchGitHubMetadata(resourceData.githubUrl) : null;
  const npmData = resourceData.npmPackage ? await fetchNpmMetadata(resourceData.npmPackage) : null;

  const resource = await prisma.resource.upsert({
    where: { slug: resourceData.slug },
    update: {
      description: resourceData.description || githubData?.description,
      githubStars: githubData?.githubStars || 0,
      npmDownloads: npmData?.npmDownloads || 0,
      lastUpdated: githubData?.lastUpdated,
      license: githubData?.license,
      websiteUrl: resourceData.websiteUrl || githubData?.websiteUrl,
    },
    create: {
      name: resourceData.name,
      slug: resourceData.slug,
      description: resourceData.description || githubData?.description,
      categoryId: category.id,
      resourceTypeId: resourceType.id,
      githubUrl: resourceData.githubUrl,
      npmPackage: resourceData.npmPackage,
      websiteUrl: resourceData.websiteUrl || githubData?.websiteUrl,
      documentationUrl: resourceData.documentationUrl,
      author: resourceData.author,
      organization: resourceData.organization,
      license: githubData?.license,
      githubStars: githubData?.githubStars || 0,
      npmDownloads: npmData?.npmDownloads || 0,
      lastUpdated: githubData?.lastUpdated,
      isTypescript: resourceData.isTypescript || false,
      isOpenSource: resourceData.isOpenSource !== false,
      isMaintained: true,
    },
  });

  // Add tags
  if (resourceData.tags) {
    for (const tagSlug of resourceData.tags) {
      const tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
      if (tag) {
        await prisma.resourceTag.upsert({
          where: {
            resourceId_tagId: {
              resourceId: resource.id,
              tagId: tag.id,
            },
          },
          update: {},
          create: {
            resourceId: resource.id,
            tagId: tag.id,
          },
        });
      }
    }
  }

  // Add framework compatibility
  if (resourceData.frameworks) {
    for (const fw of resourceData.frameworks) {
      const framework = await prisma.framework.findUnique({ where: { slug: fw.slug } });
      if (framework) {
        await prisma.resourceFramework.upsert({
          where: {
            resourceId_frameworkId: {
              resourceId: resource.id,
              frameworkId: framework.id,
            },
          },
          update: {
            compatibilityLevel: fw.compatibility,
            minVersion: fw.minVersion,
          },
          create: {
            resourceId: resource.id,
            frameworkId: framework.id,
            compatibilityLevel: fw.compatibility,
            minVersion: fw.minVersion,
          },
        });
      }
    }
  }

  console.log(`Imported resource: ${resource.name}`);
  return resource;
}

async function importSampleData() {
  console.log('Importing sample resources...');

  // Import some popular libraries
  const sampleResources = [
    {
      name: 'Lit',
      slug: 'lit',
      description: 'Simple. Fast. Web Components.',
      githubUrl: 'https://github.com/lit/lit',
      npmPackage: 'lit',
      websiteUrl: 'https://lit.dev',
      documentationUrl: 'https://lit.dev/docs/',
      organization: 'Google',
      categorySlug: 'libraries',
      typeSlug: 'library',
      paradigmSlug: 'class-based',
      isTypescript: true,
      tags: ['typescript', 'accessible', 'tree-shakeable'],
      frameworks: [
        { slug: 'web-components', compatibility: 'full' },
        { slug: 'react', compatibility: 'plugin' },
      ],
    },
    {
      name: 'Stencil',
      slug: 'stencil',
      description: 'A compiler for generating Web Components',
      githubUrl: 'https://github.com/ionic-team/stencil',
      npmPackage: '@stencil/core',
      websiteUrl: 'https://stenciljs.com',
      organization: 'Ionic',
      categorySlug: 'libraries',
      typeSlug: 'library',
      paradigmSlug: 'compiler-based',
      isTypescript: true,
      tags: ['typescript', 'compiler-based'],
      frameworks: [
        { slug: 'web-components', compatibility: 'full' },
        { slug: 'react', compatibility: 'full' },
        { slug: 'vue', compatibility: 'full' },
        { slug: 'angular', compatibility: 'full' },
      ],
    },
  ];

  for (const resourceData of sampleResources) {
    await importResource(resourceData);
  }
}

// =====================================================
// MAIN IMPORT FUNCTION
// =====================================================

async function main() {
  try {
    console.log('Starting UI Catalog data import...');

    // Import base data
    await importCategories();
    await importResourceTypes();
    await importParadigms();
    await importFrameworks();
    await importTags();

    // Import sample resources
    await importSampleData();

    console.log('Data import completed successfully!');
  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
main();

// =====================================================
// UTILITY FUNCTIONS FOR ONGOING IMPORTS
// =====================================================

export async function parseAwesomeList(repoUrl: string) {
  // Parse README.md from awesome lists to extract resources
  // This would involve:
  // 1. Fetching the README content
  // 2. Parsing markdown to extract links and descriptions
  // 3. Categorizing based on section headers
  // 4. Creating resource entries
}

export async function updateMetrics() {
  // Periodically update GitHub stars, npm downloads, etc.
  const resources = await prisma.resource.findMany({
    where: { isMaintained: true },
  });

  for (const resource of resources) {
    if (resource.githubUrl) {
      const data = await fetchGitHubMetadata(resource.githubUrl);
      if (data) {
        await prisma.resource.update({
          where: { id: resource.id },
          data: {
            githubStars: data.githubStars,
            lastUpdated: data.lastUpdated,
          },
        });

        // Record historical metrics
        await prisma.resourceMetric.create({
          data: {
            resourceId: resource.id,
            metricDate: new Date(),
            githubStars: data.githubStars,
          },
        });
      }
    }
  }
}

export async function discoverRelationships() {
  // Analyze resources to find relationships
  // - Check package.json for dependencies
  // - Look for forks in GitHub data
  // - Find similar descriptions for alternatives
  // - Parse documentation for integrations
}