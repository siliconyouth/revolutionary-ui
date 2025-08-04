#!/usr/bin/env node

/**
 * Migrate additional resources to database:
 * - CSS-in-JS solutions
 * - Color manipulation tools
 * - Fonts
 * - Tailwind utilities
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CSS-in-JS Solutions
const CSS_IN_JS_SOLUTIONS = [
  {
    slug: 'styled-components',
    name: 'Styled Components',
    description: 'Visual primitives for the component age. Use the best bits of ES6 and CSS to style your apps without stress',
    npmPackage: 'styled-components',
    authorEmail: 'styled-components@github.com',
    githubUrl: 'https://github.com/styled-components/styled-components',
    documentationUrl: 'https://styled-components.com/',
    license: 'MIT'
  },
  {
    slug: 'emotion',
    name: 'Emotion',
    description: 'CSS-in-JS library designed for high performance style composition',
    npmPackage: '@emotion/react',
    authorEmail: 'emotion-js@github.com',
    githubUrl: 'https://github.com/emotion-js/emotion',
    documentationUrl: 'https://emotion.sh/',
    license: 'MIT'
  },
  {
    slug: 'stitches',
    name: 'Stitches',
    description: 'CSS-in-JS with near-zero runtime, SSR, multi-variant support, and a best-in-class developer experience',
    npmPackage: '@stitches/react',
    authorEmail: 'modulz@github.com',
    githubUrl: 'https://github.com/stitchesjs/stitches',
    documentationUrl: 'https://stitches.dev/',
    license: 'MIT'
  },
  {
    slug: 'vanilla-extract',
    name: 'Vanilla Extract',
    description: 'Zero-runtime Stylesheets-in-TypeScript',
    npmPackage: '@vanilla-extract/css',
    authorEmail: 'seek-oss@github.com',
    githubUrl: 'https://github.com/vanilla-extract-css/vanilla-extract',
    documentationUrl: 'https://vanilla-extract.style/',
    license: 'MIT'
  },
  {
    slug: 'styled-system',
    name: 'Styled System',
    description: 'Style props for rapid UI development',
    npmPackage: 'styled-system',
    authorEmail: 'jxnblk@github.com',
    githubUrl: 'https://github.com/styled-system/styled-system',
    documentationUrl: 'https://styled-system.com/',
    license: 'MIT'
  }
];

// Color manipulation tools
const COLOR_TOOLS = [
  {
    slug: 'chroma-js',
    name: 'Chroma.js',
    description: 'JavaScript library for all kinds of color conversions and color scales',
    npmPackage: 'chroma-js',
    authorEmail: 'gka@github.com',
    githubUrl: 'https://github.com/gka/chroma.js',
    documentationUrl: 'https://gka.github.io/chroma.js/',
    license: 'MIT'
  },
  {
    slug: 'tinycolor',
    name: 'TinyColor',
    description: 'Fast, small color manipulation and conversion library',
    npmPackage: 'tinycolor2',
    authorEmail: 'bgrins@github.com',
    githubUrl: 'https://github.com/bgrins/TinyColor',
    documentationUrl: 'https://bgrins.github.io/TinyColor/',
    license: 'MIT'
  },
  {
    slug: 'color',
    name: 'Color',
    description: 'Color conversion and manipulation library with support for CSS color strings',
    npmPackage: 'color',
    authorEmail: 'Qix-@github.com',
    githubUrl: 'https://github.com/Qix-/color',
    documentationUrl: 'https://github.com/Qix-/color#readme',
    license: 'MIT'
  },
  {
    slug: 'polished',
    name: 'Polished',
    description: 'A lightweight toolset for writing styles in JavaScript',
    npmPackage: 'polished',
    authorEmail: 'styled-components@github.com',
    githubUrl: 'https://github.com/styled-components/polished',
    documentationUrl: 'https://polished.js.org/',
    license: 'MIT'
  }
];

// Font configurations
const FONTS = [
  {
    slug: 'inter',
    name: 'Inter',
    description: 'A typeface carefully crafted & designed for computer screens',
    npmPackage: '@fontsource/inter',
    authorEmail: 'rsms@github.com',
    githubUrl: 'https://github.com/rsms/inter',
    documentationUrl: 'https://rsms.me/inter/',
    license: 'OFL-1.1'
  },
  {
    slug: 'roboto',
    name: 'Roboto',
    description: 'The Roboto font family by Google',
    npmPackage: '@fontsource/roboto',
    authorEmail: 'google@github.com',
    githubUrl: 'https://github.com/googlefonts/roboto',
    documentationUrl: 'https://fonts.google.com/specimen/Roboto',
    license: 'Apache-2.0'
  },
  {
    slug: 'poppins',
    name: 'Poppins',
    description: 'Geometric sans serif typeface by Indian Type Foundry',
    npmPackage: '@fontsource/poppins',
    authorEmail: 'indiantypefoundry@github.com',
    githubUrl: 'https://github.com/itfoundry/Poppins',
    documentationUrl: 'https://fonts.google.com/specimen/Poppins',
    license: 'OFL-1.1'
  },
  {
    slug: 'nunito',
    name: 'Nunito',
    description: 'A well balanced sans serif typeface',
    npmPackage: '@fontsource/nunito',
    authorEmail: 'vernon-adams@github.com',
    githubUrl: 'https://github.com/googlefonts/nunito',
    documentationUrl: 'https://fonts.google.com/specimen/Nunito',
    license: 'OFL-1.1'
  },
  {
    slug: 'open-sans',
    name: 'Open Sans',
    description: 'Humanist sans serif typeface designed by Steve Matteson',
    npmPackage: '@fontsource/open-sans',
    authorEmail: 'steve-matteson@github.com',
    githubUrl: 'https://github.com/googlefonts/opensans',
    documentationUrl: 'https://fonts.google.com/specimen/Open+Sans',
    license: 'OFL-1.1'
  },
  {
    slug: 'montserrat',
    name: 'Montserrat',
    description: 'Geometric sans-serif typeface designed by Julieta Ulanovsky',
    npmPackage: '@fontsource/montserrat',
    authorEmail: 'julieta-ulanovsky@github.com',
    githubUrl: 'https://github.com/JulietaUla/Montserrat',
    documentationUrl: 'https://fonts.google.com/specimen/Montserrat',
    license: 'OFL-1.1'
  },
  {
    slug: 'raleway',
    name: 'Raleway',
    description: 'Elegant sans-serif typeface family',
    npmPackage: '@fontsource/raleway',
    authorEmail: 'theleagueof@github.com',
    githubUrl: 'https://github.com/theleagueof/raleway',
    documentationUrl: 'https://fonts.google.com/specimen/Raleway',
    license: 'OFL-1.1'
  },
  {
    slug: 'playfair-display',
    name: 'Playfair Display',
    description: 'Transitional design serif typeface',
    npmPackage: '@fontsource/playfair-display',
    authorEmail: 'claus-eggers-sorensen@github.com',
    githubUrl: 'https://github.com/clauseggers/Playfair-Display',
    documentationUrl: 'https://fonts.google.com/specimen/Playfair+Display',
    license: 'OFL-1.1'
  }
];

// Tailwind utilities
const TAILWIND_UTILITIES = [
  {
    slug: 'tailwindcss-forms',
    name: '@tailwindcss/forms',
    description: 'A plugin that provides a basic reset for form styles',
    npmPackage: '@tailwindcss/forms',
    authorEmail: 'tailwindlabs@github.com',
    githubUrl: 'https://github.com/tailwindlabs/tailwindcss-forms',
    documentationUrl: 'https://github.com/tailwindlabs/tailwindcss-forms#readme',
    license: 'MIT'
  },
  {
    slug: 'tailwindcss-typography',
    name: '@tailwindcss/typography',
    description: 'Beautiful typographic defaults for HTML you don\'t control',
    npmPackage: '@tailwindcss/typography',
    authorEmail: 'tailwindlabs@github.com',
    githubUrl: 'https://github.com/tailwindlabs/tailwindcss-typography',
    documentationUrl: 'https://tailwindcss.com/docs/typography-plugin',
    license: 'MIT'
  },
  {
    slug: 'tailwindcss-aspect-ratio',
    name: '@tailwindcss/aspect-ratio',
    description: 'A plugin that provides utilities for controlling aspect ratios',
    npmPackage: '@tailwindcss/aspect-ratio',
    authorEmail: 'tailwindlabs@github.com',
    githubUrl: 'https://github.com/tailwindlabs/tailwindcss-aspect-ratio',
    documentationUrl: 'https://github.com/tailwindlabs/tailwindcss-aspect-ratio#readme',
    license: 'MIT'
  },
  {
    slug: 'tailwindcss-container-queries',
    name: '@tailwindcss/container-queries',
    description: 'A plugin for container queries',
    npmPackage: '@tailwindcss/container-queries',
    authorEmail: 'tailwindlabs@github.com',
    githubUrl: 'https://github.com/tailwindlabs/tailwindcss-container-queries',
    documentationUrl: 'https://github.com/tailwindlabs/tailwindcss-container-queries#readme',
    license: 'MIT'
  },
  {
    slug: 'tailwindcss-animate',
    name: 'tailwindcss-animate',
    description: 'A Tailwind CSS plugin for creating beautiful animations',
    npmPackage: 'tailwindcss-animate',
    authorEmail: 'jamiebuilds@github.com',
    githubUrl: 'https://github.com/jamiebuilds/tailwindcss-animate',
    documentationUrl: 'https://github.com/jamiebuilds/tailwindcss-animate#readme',
    license: 'MIT'
  },
  {
    slug: 'tailwind-merge',
    name: 'tailwind-merge',
    description: 'Merge Tailwind CSS classes without style conflicts',
    npmPackage: 'tailwind-merge',
    authorEmail: 'dcastil@github.com',
    githubUrl: 'https://github.com/dcastil/tailwind-merge',
    documentationUrl: 'https://github.com/dcastil/tailwind-merge#readme',
    license: 'MIT'
  },
  {
    slug: 'class-variance-authority',
    name: 'Class Variance Authority',
    description: 'CSS-in-TS API for creating composable components',
    npmPackage: 'class-variance-authority',
    authorEmail: 'joe-bell@github.com',
    githubUrl: 'https://github.com/joe-bell/cva',
    documentationUrl: 'https://cva.style/docs',
    license: 'Apache-2.0'
  }
];

async function migrateResources() {
  console.log('🚀 Starting migration of additional resources to database...\n');

  try {
    // Get resource types
    const libraryType = await prisma.resourceType.findUnique({ where: { slug: 'library' } });
    const utilityType = await prisma.resourceType.findUnique({ where: { slug: 'utility' } });
    
    if (!libraryType || !utilityType) {
      throw new Error('Required resource types not found');
    }

    // Create categories if they don't exist
    const categories = [
      { name: 'CSS-in-JS', slug: 'css-in-js', description: 'CSS-in-JS solutions for styling React components' },
      { name: 'Color Tools', slug: 'color-tools', description: 'Libraries for color manipulation and conversion' },
      { name: 'Fonts', slug: 'fonts', description: 'Web fonts and typography' },
      { name: 'Tailwind Utilities', slug: 'tailwind-utilities', description: 'Tailwind CSS plugins and utilities' }
    ];

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat
      });
      console.log(`✅ Category ensured: ${cat.name}`);
    }

    // Create authors
    const uniqueAuthors = new Map();
    [...CSS_IN_JS_SOLUTIONS, ...COLOR_TOOLS, ...FONTS, ...TAILWIND_UTILITIES].forEach(resource => {
      if (!uniqueAuthors.has(resource.authorEmail)) {
        uniqueAuthors.set(resource.authorEmail, {
          email: resource.authorEmail,
          name: resource.authorEmail.replace('@github.com', '').replace(/-/g, ' ')
        });
      }
    });

    for (const [email, data] of uniqueAuthors) {
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: data
      });
      console.log(`✅ Author ensured: ${data.name}`);
    }

    // Migrate CSS-in-JS solutions
    console.log('\n📦 Migrating CSS-in-JS solutions...');
    const cssInJsCategory = await prisma.category.findUnique({ where: { slug: 'css-in-js' } });
    for (const solution of CSS_IN_JS_SOLUTIONS) {
      const author = await prisma.user.findUnique({ where: { email: solution.authorEmail } });
      await prisma.resource.upsert({
        where: { slug: solution.slug },
        update: {
          description: solution.description,
          npmPackage: solution.npmPackage,
          githubUrl: solution.githubUrl,
          documentationUrl: solution.documentationUrl,
          license: solution.license,
          author: { connect: { id: author.id } }
        },
        create: {
          slug: solution.slug,
          name: solution.name,
          description: solution.description,
          npmPackage: solution.npmPackage,
          githubUrl: solution.githubUrl,
          documentationUrl: solution.documentationUrl,
          license: solution.license,
          category: { connect: { id: cssInJsCategory.id } },
          resourceType: { connect: { id: libraryType.id } },
          author: { connect: { id: author.id } },
          hasTypescript: true,
          isAccessible: false,
          supportsDarkMode: false
        }
      });
      console.log(`  ✅ ${solution.name}`);
    }

    // Migrate color tools
    console.log('\n🎨 Migrating color tools...');
    const colorToolsCategory = await prisma.category.findUnique({ where: { slug: 'color-tools' } });
    for (const tool of COLOR_TOOLS) {
      const author = await prisma.user.findUnique({ where: { email: tool.authorEmail } });
      await prisma.resource.upsert({
        where: { slug: tool.slug },
        update: {
          description: tool.description,
          npmPackage: tool.npmPackage,
          githubUrl: tool.githubUrl,
          documentationUrl: tool.documentationUrl,
          license: tool.license,
          author: { connect: { id: author.id } }
        },
        create: {
          slug: tool.slug,
          name: tool.name,
          description: tool.description,
          npmPackage: tool.npmPackage,
          githubUrl: tool.githubUrl,
          documentationUrl: tool.documentationUrl,
          license: tool.license,
          category: { connect: { id: colorToolsCategory.id } },
          resourceType: { connect: { id: libraryType.id } },
          author: { connect: { id: author.id } },
          hasTypescript: true,
          isAccessible: false,
          supportsDarkMode: false
        }
      });
      console.log(`  ✅ ${tool.name}`);
    }

    // Migrate fonts
    console.log('\n✏️ Migrating fonts...');
    const fontsCategory = await prisma.category.findUnique({ where: { slug: 'fonts' } });
    for (const font of FONTS) {
      const author = await prisma.user.findUnique({ where: { email: font.authorEmail } });
      await prisma.resource.upsert({
        where: { slug: font.slug },
        update: {
          description: font.description,
          npmPackage: font.npmPackage,
          githubUrl: font.githubUrl,
          documentationUrl: font.documentationUrl,
          license: font.license,
          author: { connect: { id: author.id } }
        },
        create: {
          slug: font.slug,
          name: font.name,
          description: font.description,
          npmPackage: font.npmPackage,
          githubUrl: font.githubUrl,
          documentationUrl: font.documentationUrl,
          license: font.license,
          category: { connect: { id: fontsCategory.id } },
          resourceType: { connect: { id: libraryType.id } },
          author: { connect: { id: author.id } },
          hasTypescript: false,
          isAccessible: false,
          supportsDarkMode: false
        }
      });
      console.log(`  ✅ ${font.name}`);
    }

    // Migrate Tailwind utilities
    console.log('\n🔧 Migrating Tailwind utilities...');
    const tailwindCategory = await prisma.category.findUnique({ where: { slug: 'tailwind-utilities' } });
    for (const utility of TAILWIND_UTILITIES) {
      const author = await prisma.user.findUnique({ where: { email: utility.authorEmail } });
      await prisma.resource.upsert({
        where: { slug: utility.slug },
        update: {
          description: utility.description,
          npmPackage: utility.npmPackage,
          githubUrl: utility.githubUrl,
          documentationUrl: utility.documentationUrl,
          license: utility.license,
          author: { connect: { id: author.id } }
        },
        create: {
          slug: utility.slug,
          name: utility.name,
          description: utility.description,
          npmPackage: utility.npmPackage,
          githubUrl: utility.githubUrl,
          documentationUrl: utility.documentationUrl,
          license: utility.license,
          category: { connect: { id: tailwindCategory.id } },
          resourceType: { connect: { id: utilityType.id } },
          author: { connect: { id: author.id } },
          hasTypescript: true,
          isAccessible: false,
          supportsDarkMode: false
        }
      });
      console.log(`  ✅ ${utility.name}`);
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateResources();