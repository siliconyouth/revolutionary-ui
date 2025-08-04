// Script to import components from awesome-react-components
// Parses the repository and populates our database with React components

import { PrismaClient } from '@prisma/client';
import { Octokit } from '@octokit/rest';
import axios from 'axios';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// =====================================================
// REACT COMPONENT CATEGORIES MAPPING
// =====================================================

const CATEGORY_MAPPINGS: Record<string, string> = {
  // UI Components
  'Editable data grid / spreadsheet': 'editable-data-grid',
  'Table': 'tables',
  'Infinite Scroll': 'infinite-scroll',
  'Overlay': 'overlays',
  'Notification': 'notifications',
  'Tooltip': 'tooltips',
  'Menu': 'menus',
  'Sticky': 'ui-layout',
  'Tabs': 'ui-layout',
  'Loader': 'ui-animation',
  'Carousel': 'carousels',
  'Collapse': 'ui-layout',
  'Chart': 'charts',
  'Tree': 'ui-layout',
  'UI Navigation': 'menus',
  'Custom Scrollbar': 'ui-layout',
  'Audio / Video': 'video-audio',
  'Map': 'maps',
  'Time / Date / Age': 'time-date',
  'Photo / Image': 'image',
  'Icons': 'ui-components',
  'Paginator': 'ui-layout',
  'Markdown Viewer': 'markdown-editors',
  'Canvas': 'canvas',
  'Miscellaneous': 'ui-components',
  'Form Components': 'form-components',
  
  // Utilities
  'Reporter': 'visibility-reporters',
  'Device Input': 'device-input',
  'Meta Tags': 'meta-tags',
  'Portal': 'ui-layout',
  'Router': 'routing',
  
  // Dev Tools
  'Test': 'testing',
  'Redux': 'state-management',
  'Inspect': 'debugging',
  'Lazy Load': 'lazy-loading',
};

// Quality indicators mapping
const QUALITY_EMOJI_MAP: Record<string, string> = {
  '🚀': 'rocket',
  '🦄': 'unicorn',
  '🦋': 'butterfly',
  '🏆': 'trophy',
};

// =====================================================
// PARSING FUNCTIONS
// =====================================================

interface ParsedComponent {
  name: string;
  githubUrl?: string;
  npmPackage?: string;
  description: string;
  category: string;
  demoUrl?: string;
  qualityIndicators: string[];
  maintainerNote?: string;
}

async function fetchAwesomeReactComponents(): Promise<string> {
  try {
    const { data } = await axios.get(
      'https://raw.githubusercontent.com/brillout/awesome-react-components/master/README.md'
    );
    return data;
  } catch (error) {
    console.error('Failed to fetch awesome-react-components:', error);
    throw error;
  }
}

function parseMarkdownContent(content: string): ParsedComponent[] {
  const components: ParsedComponent[] = [];
  const lines = content.split('\n');
  
  let currentCategory = '';
  
  for (const line of lines) {
    // Parse category headers
    if (line.startsWith('### ') || line.startsWith('#### ')) {
      const categoryMatch = line.match(/###+ (.+)/);
      if (categoryMatch) {
        const rawCategory = categoryMatch[1].trim();
        currentCategory = CATEGORY_MAPPINGS[rawCategory] || 'ui-components';
      }
      continue;
    }
    
    // Parse component entries
    if (line.trim().startsWith('- ') && currentCategory) {
      const component = parseComponentLine(line, currentCategory);
      if (component) {
        components.push(component);
      }
    }
  }
  
  return components;
}

function parseComponentLine(line: string, category: string): ParsedComponent | null {
  // Remove leading "- " 
  const content = line.trim().substring(2);
  
  // Extract quality indicators
  const qualityIndicators: string[] = [];
  for (const [emoji, indicator] of Object.entries(QUALITY_EMOJI_MAP)) {
    if (content.includes(emoji)) {
      qualityIndicators.push(indicator);
    }
  }
  
  // Parse links and text
  // Format: [name](url) - description _(maintainer note)_
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const matches = [...content.matchAll(linkRegex)];
  
  if (matches.length === 0) return null;
  
  const [fullMatch, name, url] = matches[0];
  
  // Extract description
  const afterLink = content.substring(content.indexOf(fullMatch) + fullMatch.length);
  const descriptionMatch = afterLink.match(/\s*-\s*(.+?)(?:_\(|$)/);
  const description = descriptionMatch ? descriptionMatch[1].trim() : '';
  
  // Extract maintainer note
  const noteMatch = afterLink.match(/_\(([^)]+)\)_/);
  const maintainerNote = noteMatch ? noteMatch[1] : undefined;
  
  // Determine if it's GitHub or npm
  const isGitHub = url.includes('github.com');
  const isNpm = url.includes('npmjs.com');
  
  // Extract demo URL if present
  let demoUrl: string | undefined;
  if (matches.length > 1) {
    demoUrl = matches[1][2];
  }
  
  // Clean up description from emojis and extra formatting
  const cleanDescription = description
    .replace(/[🚀🦄🦋🏆]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  return {
    name,
    githubUrl: isGitHub ? url : undefined,
    npmPackage: isNpm ? url.split('/package/')[1] : undefined,
    description: cleanDescription,
    category,
    demoUrl,
    qualityIndicators,
    maintainerNote,
  };
}

// =====================================================
// DATABASE IMPORT FUNCTIONS
// =====================================================

async function ensureReactFramework() {
  return await prisma.framework.upsert({
    where: { slug: 'react' },
    update: {},
    create: {
      name: 'React',
      slug: 'react',
      icon: 'react',
      websiteUrl: 'https://react.dev',
    },
  });
}

async function ensureCategory(categorySlug: string) {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });
  
  if (!category) {
    // Find parent category
    const parentSlug = ['ui-layout', 'ui-animation', 'ui-frameworks'].includes(categorySlug)
      ? 'libraries'
      : ['visibility-reporters', 'device-input', 'meta-tags', 'state-management', 'routing'].includes(categorySlug)
      ? 'utilities'
      : ['lazy-loading', 'virtualization'].includes(categorySlug)
      ? 'performance'
      : ['testing', 'debugging', 'build-tools'].includes(categorySlug)
      ? 'dev-tools'
      : 'components';
    
    const parent = await prisma.category.findUnique({
      where: { slug: parentSlug },
    });
    
    if (!parent) {
      console.error(`Parent category not found for ${categorySlug}`);
      return null;
    }
    
    return await prisma.category.create({
      data: {
        name: categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug: categorySlug,
        parentId: parent.id,
      },
    });
  }
  
  return category;
}

async function importReactComponent(component: ParsedComponent) {
  try {
    // Get category
    const category = await ensureCategory(component.category);
    if (!category) {
      console.error(`Category not found: ${component.category}`);
      return;
    }
    
    // Get resource type
    const resourceType = await prisma.resourceType.findUnique({
      where: { slug: 'component' },
    });
    
    if (!resourceType) {
      console.error('Component resource type not found');
      return;
    }
    
    // Generate slug
    const slug = component.name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    
    // Fetch GitHub metadata if available
    let githubData = null;
    if (component.githubUrl) {
      githubData = await fetchGitHubMetadata(component.githubUrl);
    }
    
    // Create or update resource
    const resource = await prisma.resource.upsert({
      where: { slug },
      update: {
        description: component.description,
        githubStars: githubData?.githubStars || 0,
        lastUpdated: githubData?.lastUpdated,
        qualityIndicators: component.qualityIndicators,
      },
      create: {
        name: component.name,
        slug,
        description: component.description,
        longDescription: component.maintainerNote,
        resourceTypeId: resourceType.id,
        categoryId: category.id,
        githubUrl: component.githubUrl,
        npmPackage: component.npmPackage,
        demoUrl: component.demoUrl,
        githubStars: githubData?.githubStars || 0,
        lastUpdated: githubData?.lastUpdated,
        license: githubData?.license,
        isOpenSource: true,
        isMaintained: true,
        qualityIndicators: component.qualityIndicators,
        // React-specific defaults
        supportsReactNative: false,
        hasTypescriptDefs: false,
      },
    });
    
    // Add React framework compatibility
    const reactFramework = await ensureReactFramework();
    await prisma.resourceFramework.upsert({
      where: {
        resourceId_frameworkId: {
          resourceId: resource.id,
          frameworkId: reactFramework.id,
        },
      },
      update: {},
      create: {
        resourceId: resource.id,
        frameworkId: reactFramework.id,
        compatibilityLevel: 'full',
      },
    });
    
    // Add quality tags
    for (const indicator of component.qualityIndicators) {
      const tag = await prisma.tag.upsert({
        where: { slug: indicator },
        update: {},
        create: {
          name: indicator.charAt(0).toUpperCase() + indicator.slice(1),
          slug: indicator,
          category: 'quality',
        },
      });
      
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
    
    console.log(`Imported: ${component.name} (${component.category})`);
  } catch (error) {
    console.error(`Failed to import ${component.name}:`, error);
  }
}

async function fetchGitHubMetadata(githubUrl: string) {
  try {
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    
    const [, owner, repo] = match;
    const { data } = await octokit.repos.get({ 
      owner, 
      repo: repo.replace(/\/$/, ''), // Remove trailing slash
    });
    
    // Check for TypeScript
    const languages = await octokit.repos.listLanguages({ owner, repo: repo.replace(/\/$/, '') });
    const hasTypescript = 'TypeScript' in languages.data;
    
    return {
      githubStars: data.stargazers_count,
      description: data.description,
      license: data.license?.spdx_id,
      lastUpdated: new Date(data.updated_at),
      hasTypescript,
    };
  } catch (error) {
    console.error(`Failed to fetch GitHub data for ${githubUrl}:`, error);
    return null;
  }
}

// =====================================================
// MAIN IMPORT FUNCTION
// =====================================================

async function importAwesomeReactComponentsList() {
  try {
    console.log('Fetching awesome-react-components...');
    const content = await fetchAwesomeReactComponents();
    
    console.log('Parsing components...');
    const components = parseMarkdownContent(content);
    console.log(`Found ${components.length} components`);
    
    // Group by category for summary
    const categorySummary: Record<string, number> = {};
    components.forEach(c => {
      categorySummary[c.category] = (categorySummary[c.category] || 0) + 1;
    });
    
    console.log('Category summary:', categorySummary);
    
    // Import components in batches to avoid rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < components.length; i += BATCH_SIZE) {
      const batch = components.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(importReactComponent));
      
      // Rate limit pause
      if (i + BATCH_SIZE < components.length) {
        console.log(`Processed ${i + batch.length}/${components.length} components, pausing...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('Import completed!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export async function updateReactComponentMetrics() {
  const resources = await prisma.resource.findMany({
    where: {
      frameworks: {
        some: {
          framework: {
            slug: 'react',
          },
        },
      },
      isMaintained: true,
    },
  });
  
  console.log(`Updating metrics for ${resources.length} React components...`);
  
  for (const resource of resources) {
    try {
      // Update GitHub metrics
      if (resource.githubUrl) {
        const data = await fetchGitHubMetadata(resource.githubUrl);
        if (data) {
          await prisma.resource.update({
            where: { id: resource.id },
            data: {
              githubStars: data.githubStars,
              lastUpdated: data.lastUpdated,
              hasTypescriptDefs: data.hasTypescript,
            },
          });
          
          // Record metrics
          await prisma.resourceMetric.create({
            data: {
              resourceId: resource.id,
              metricDate: new Date(),
              githubStars: data.githubStars,
            },
          });
        }
      }
      
      // Update npm metrics
      if (resource.npmPackage) {
        try {
          const { data } = await axios.get(
            `https://api.npmjs.org/downloads/point/last-week/${resource.npmPackage}`
          );
          
          await prisma.resource.update({
            where: { id: resource.id },
            data: {
              npmDownloads: data.downloads,
            },
          });
          
          await prisma.resourceMetric.updateMany({
            where: {
              resourceId: resource.id,
              metricDate: new Date(),
            },
            data: {
              npmWeeklyDownloads: data.downloads,
            },
          });
        } catch (error) {
          console.error(`Failed to fetch npm data for ${resource.npmPackage}`);
        }
      }
    } catch (error) {
      console.error(`Failed to update metrics for ${resource.name}:`, error);
    }
  }
}

// Run the import if this script is executed directly
if (require.main === module) {
  importAwesomeReactComponentsList();
}