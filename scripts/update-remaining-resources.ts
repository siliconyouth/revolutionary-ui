#!/usr/bin/env node

/**
 * Update remaining resources with correct slugs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Remaining updates with correct slugs
const REMAINING_UPDATES = [
  // Frameworks
  {
    slug: 'next',
    authorEmail: 'vercel@github.com',
    githubUrl: 'https://github.com/vercel/next.js',
    documentationUrl: 'https://nextjs.org/docs',
    license: 'MIT'
  },
  {
    slug: 'solid',
    authorEmail: 'solidjs@github.com',
    githubUrl: 'https://github.com/solidjs/solid',
    documentationUrl: 'https://www.solidjs.com/docs/latest',
    license: 'MIT'
  },
  {
    slug: 'alpine',
    authorEmail: 'alpinejs@github.com',
    githubUrl: 'https://github.com/alpinejs/alpine',
    documentationUrl: 'https://alpinejs.dev/start-here',
    license: 'MIT'
  },
  {
    slug: 'ember',
    authorEmail: 'emberjs@github.com',
    githubUrl: 'https://github.com/emberjs/ember.js',
    documentationUrl: 'https://guides.emberjs.com',
    license: 'MIT'
  },

  // UI Libraries
  {
    slug: 'mui',
    authorEmail: 'mui@github.com',
    githubUrl: 'https://github.com/mui/material-ui',
    documentationUrl: 'https://mui.com/material-ui/getting-started/',
    license: 'MIT'
  },
  {
    slug: 'antd',
    authorEmail: 'ant-design@github.com',
    githubUrl: 'https://github.com/ant-design/ant-design',
    documentationUrl: 'https://ant.design/docs/react/introduce',
    license: 'MIT'
  },
  {
    slug: 'chakra',
    authorEmail: 'chakra-ui@github.com',
    githubUrl: 'https://github.com/chakra-ui/chakra-ui',
    documentationUrl: 'https://chakra-ui.com/docs/getting-started',
    license: 'MIT'
  },
  {
    slug: 'radix',
    authorEmail: 'radix-ui@github.com',
    githubUrl: 'https://github.com/radix-ui/primitives',
    documentationUrl: 'https://www.radix-ui.com/docs/primitives/overview/introduction',
    license: 'MIT'
  },
  {
    slug: 'headless',
    authorEmail: 'tailwindlabs@github.com',
    githubUrl: 'https://github.com/tailwindlabs/headlessui',
    documentationUrl: 'https://headlessui.com/',
    license: 'MIT'
  },
  {
    slug: 'arco',
    authorEmail: 'arco-design@github.com',
    githubUrl: 'https://github.com/arco-design/arco-design',
    documentationUrl: 'https://arco.design/react/docs/start',
    license: 'MIT'
  },
  {
    slug: 'tailwind',
    authorEmail: 'tailwindlabs@github.com',
    githubUrl: 'https://github.com/tailwindlabs/tailwindcss',
    documentationUrl: 'https://tailwindcss.com/docs',
    license: 'MIT'
  },

  // Icon Libraries
  {
    slug: 'lucide',
    authorEmail: 'lucide-icons@github.com',
    githubUrl: 'https://github.com/lucide-icons/lucide',
    documentationUrl: 'https://lucide.dev/guide/',
    license: 'ISC'
  },
  {
    slug: 'fa',
    authorEmail: 'FortAwesome@github.com',
    githubUrl: 'https://github.com/FortAwesome/Font-Awesome',
    documentationUrl: 'https://fontawesome.com/docs',
    license: 'Various (Free: OFL-1.1, MIT, CC-BY-4.0)'
  },
  {
    slug: 'material-icons',
    authorEmail: 'google@github.com',
    githubUrl: 'https://github.com/google/material-design-icons',
    documentationUrl: 'https://developers.google.com/fonts/docs/material_icons',
    license: 'Apache-2.0'
  },
  {
    slug: 'tabler',
    authorEmail: 'tabler@github.com',
    githubUrl: 'https://github.com/tabler/tabler-icons',
    documentationUrl: 'https://tabler-icons.io/',
    license: 'MIT'
  },
  {
    slug: 'phosphor',
    authorEmail: 'phosphor-icons@github.com',
    githubUrl: 'https://github.com/phosphor-icons/phosphor-home',
    documentationUrl: 'https://phosphoricons.com/',
    license: 'MIT'
  },
  {
    slug: 'feather',
    authorEmail: 'feathericons@github.com',
    githubUrl: 'https://github.com/feathericons/feather',
    documentationUrl: 'https://feathericons.com/',
    license: 'MIT'
  },

  // Icon library packages with specific names
  {
    slug: 'ant-icons',
    authorEmail: 'ant-design@github.com',
    githubUrl: 'https://github.com/ant-design/ant-design-icons',
    documentationUrl: 'https://ant.design/components/icon',
    license: 'MIT'
  },
  {
    slug: 'chakra-icons',
    authorEmail: 'chakra-ui@github.com',
    githubUrl: 'https://github.com/chakra-ui/chakra-ui/tree/main/packages/icons',
    documentationUrl: 'https://chakra-ui.com/docs/components/icon',
    license: 'MIT'
  },
  {
    slug: 'blueprint-icons',
    authorEmail: 'palantir@github.com',
    githubUrl: 'https://github.com/palantir/blueprint/tree/develop/packages/icons',
    documentationUrl: 'https://blueprintjs.com/docs/#icons',
    license: 'Apache-2.0'
  },
  {
    slug: 'prime-icons',
    authorEmail: 'primefaces@github.com',
    githubUrl: 'https://github.com/primefaces/primeicons',
    documentationUrl: 'https://primereact.org/icons/',
    license: 'MIT'
  },

  // Color tools
  {
    slug: 'chroma',
    authorEmail: 'gka@github.com',
    githubUrl: 'https://github.com/gka/chroma.js',
    documentationUrl: 'https://gka.github.io/chroma.js/',
    license: 'MIT'
  }
];

async function updateRemainingResources() {
  console.log('🔄 Updating remaining resources...\n');

  let updatedCount = 0;
  let notFoundCount = 0;

  for (const update of REMAINING_UPDATES) {
    try {
      // Find the author
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
      if (error.code === 'P2025') {
        console.log(`⚠️  Resource not found: ${update.slug}`);
        notFoundCount++;
      } else {
        console.error(`❌ Error updating ${update.slug}:`, error.message);
      }
    }
  }

  console.log('\n📊 Update Summary:');
  console.log(`✅ Successfully updated: ${updatedCount} resources`);
  console.log(`⚠️  Not found: ${notFoundCount} resources`);

  await prisma.$disconnect();
}

updateRemainingResources();