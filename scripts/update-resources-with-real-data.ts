#!/usr/bin/env node

/**
 * Update all resources with real author information, correct links, and licenses
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Real author/organization data
const AUTHORS = {
  meta: { name: 'Meta (Facebook)', github: 'facebook' },
  vercel: { name: 'Vercel', github: 'vercel' },
  google: { name: 'Google', github: 'google' },
  vuejs: { name: 'Vue.js', github: 'vuejs' },
  angular: { name: 'Angular Team', github: 'angular' },
  svelte: { name: 'Svelte', github: 'sveltejs' },
  alibaba: { name: 'Alibaba', github: 'alibaba' },
  antDesign: { name: 'Ant Design', github: 'ant-design' },
  chakra: { name: 'Chakra UI', github: 'chakra-ui' },
  mantinedev: { name: 'Mantine', github: 'mantinedev' },
  mui: { name: 'MUI', github: 'mui' },
  radixui: { name: 'Radix UI', github: 'radix-ui' },
  tailwindlabs: { name: 'Tailwind Labs', github: 'tailwindlabs' },
  shadcn: { name: 'shadcn', github: 'shadcn-ui' },
  solidjs: { name: 'SolidJS', github: 'solidjs' },
  builderio: { name: 'Builder.io', github: 'BuilderIO' },
  preact: { name: 'Preact', github: 'preactjs' },
  lit: { name: 'Lit', github: 'lit' },
  alpinejs: { name: 'Alpine.js', github: 'alpinejs' },
  emberjs: { name: 'Ember.js', github: 'emberjs' },
  arco: { name: 'Arco Design', github: 'arco-design' },
  palantir: { name: 'Palantir', github: 'palantir' },
  primefaces: { name: 'PrimeTek', github: 'primefaces' },
  bootstrap: { name: 'Bootstrap', github: 'twbs' },
  styled: { name: 'Styled Components', github: 'styled-components' },
  emotion: { name: 'Emotion', github: 'emotion-js' },
  vanilla: { name: 'Vanilla Extract', github: 'vanilla-extract-css' },
  stitches: { name: 'Stitches', github: 'stitchesjs' },
  lucide: { name: 'Lucide', github: 'lucide-icons' },
  reacticons: { name: 'React Icons', github: 'react-icons' },
  fontawesome: { name: 'Font Awesome', github: 'FortAwesome' },
  tabler: { name: 'Tabler', github: 'tabler' },
  heroicons: { name: 'Heroicons', github: 'tailwindlabs' },
  phosphor: { name: 'Phosphor Icons', github: 'phosphor-icons' },
  feather: { name: 'Feather Icons', github: 'feathericons' },
  figma: { name: 'Figma', github: 'figma' },
  chroma: { name: 'Gregor Aisch', github: 'gka' },
  tinycolor: { name: 'Brian Grinstead', github: 'bgrins' },
  color: { name: 'Qix', github: 'Qix-' },
  polished: { name: 'styled-components', github: 'styled-components' }
};

// Resource updates with real data
const RESOURCE_UPDATES = [
  // Frameworks
  {
    slug: 'react',
    author: AUTHORS.meta,
    githubUrl: 'https://github.com/facebook/react',
    documentationUrl: 'https://react.dev',
    license: 'MIT'
  },
  {
    slug: 'next-js',
    author: AUTHORS.vercel,
    githubUrl: 'https://github.com/vercel/next.js',
    documentationUrl: 'https://nextjs.org/docs',
    license: 'MIT'
  },
  {
    slug: 'vue',
    author: AUTHORS.vuejs,
    githubUrl: 'https://github.com/vuejs/core',
    documentationUrl: 'https://vuejs.org/guide/',
    license: 'MIT'
  },
  {
    slug: 'nuxt',
    author: AUTHORS.vuejs,
    githubUrl: 'https://github.com/nuxt/nuxt',
    documentationUrl: 'https://nuxt.com/docs',
    license: 'MIT'
  },
  {
    slug: 'angular',
    author: AUTHORS.angular,
    githubUrl: 'https://github.com/angular/angular',
    documentationUrl: 'https://angular.io/docs',
    license: 'MIT'
  },
  {
    slug: 'svelte',
    author: AUTHORS.svelte,
    githubUrl: 'https://github.com/sveltejs/svelte',
    documentationUrl: 'https://svelte.dev/docs',
    license: 'MIT'
  },
  {
    slug: 'solidjs',
    author: AUTHORS.solidjs,
    githubUrl: 'https://github.com/solidjs/solid',
    documentationUrl: 'https://www.solidjs.com/docs/latest',
    license: 'MIT'
  },
  {
    slug: 'qwik',
    author: AUTHORS.builderio,
    githubUrl: 'https://github.com/BuilderIO/qwik',
    documentationUrl: 'https://qwik.builder.io/docs/',
    license: 'MIT'
  },
  {
    slug: 'preact',
    author: AUTHORS.preact,
    githubUrl: 'https://github.com/preactjs/preact',
    documentationUrl: 'https://preactjs.com/guide/v10/getting-started',
    license: 'MIT'
  },
  {
    slug: 'lit',
    author: AUTHORS.lit,
    githubUrl: 'https://github.com/lit/lit',
    documentationUrl: 'https://lit.dev/docs/',
    license: 'BSD-3-Clause'
  },
  {
    slug: 'alpine-js',
    author: AUTHORS.alpinejs,
    githubUrl: 'https://github.com/alpinejs/alpine',
    documentationUrl: 'https://alpinejs.dev/start-here',
    license: 'MIT'
  },
  {
    slug: 'ember-js',
    author: AUTHORS.emberjs,
    githubUrl: 'https://github.com/emberjs/ember.js',
    documentationUrl: 'https://guides.emberjs.com',
    license: 'MIT'
  },

  // UI Libraries
  {
    slug: 'material-ui',
    author: AUTHORS.mui,
    githubUrl: 'https://github.com/mui/material-ui',
    documentationUrl: 'https://mui.com/material-ui/getting-started/',
    license: 'MIT'
  },
  {
    slug: 'ant-design',
    author: AUTHORS.antDesign,
    githubUrl: 'https://github.com/ant-design/ant-design',
    documentationUrl: 'https://ant.design/docs/react/introduce',
    license: 'MIT'
  },
  {
    slug: 'chakra-ui',
    author: AUTHORS.chakra,
    githubUrl: 'https://github.com/chakra-ui/chakra-ui',
    documentationUrl: 'https://chakra-ui.com/docs/getting-started',
    license: 'MIT'
  },
  {
    slug: 'mantine',
    author: AUTHORS.mantinedev,
    githubUrl: 'https://github.com/mantinedev/mantine',
    documentationUrl: 'https://mantine.dev/docs/getting-started',
    license: 'MIT'
  },
  {
    slug: 'radix-ui',
    author: AUTHORS.radixui,
    githubUrl: 'https://github.com/radix-ui/primitives',
    documentationUrl: 'https://www.radix-ui.com/docs/primitives/overview/introduction',
    license: 'MIT'
  },
  {
    slug: 'headless-ui',
    author: AUTHORS.tailwindlabs,
    githubUrl: 'https://github.com/tailwindlabs/headlessui',
    documentationUrl: 'https://headlessui.com/',
    license: 'MIT'
  },
  {
    slug: 'arco-design',
    author: AUTHORS.arco,
    githubUrl: 'https://github.com/arco-design/arco-design',
    documentationUrl: 'https://arco.design/react/docs/start',
    license: 'MIT'
  },
  {
    slug: 'blueprint',
    author: AUTHORS.palantir,
    githubUrl: 'https://github.com/palantir/blueprint',
    documentationUrl: 'https://blueprintjs.com/docs/',
    license: 'Apache-2.0'
  },
  {
    slug: 'primereact',
    author: AUTHORS.primefaces,
    githubUrl: 'https://github.com/primefaces/primereact',
    documentationUrl: 'https://primereact.org/installation/',
    license: 'MIT'
  },
  {
    slug: 'bootstrap',
    author: AUTHORS.bootstrap,
    githubUrl: 'https://github.com/twbs/bootstrap',
    documentationUrl: 'https://getbootstrap.com/docs/',
    license: 'MIT'
  },
  {
    slug: 'tailwind-css',
    author: AUTHORS.tailwindlabs,
    githubUrl: 'https://github.com/tailwindlabs/tailwindcss',
    documentationUrl: 'https://tailwindcss.com/docs',
    license: 'MIT'
  },
  {
    slug: 'styled-components',
    author: AUTHORS.styled,
    githubUrl: 'https://github.com/styled-components/styled-components',
    documentationUrl: 'https://styled-components.com/docs',
    license: 'MIT'
  },
  {
    slug: 'emotion',
    author: AUTHORS.emotion,
    githubUrl: 'https://github.com/emotion-js/emotion',
    documentationUrl: 'https://emotion.sh/docs/introduction',
    license: 'MIT'
  },
  {
    slug: 'vanilla-extract',
    author: AUTHORS.vanilla,
    githubUrl: 'https://github.com/vanilla-extract-css/vanilla-extract',
    documentationUrl: 'https://vanilla-extract.style/documentation/',
    license: 'MIT'
  },
  {
    slug: 'stitches',
    author: AUTHORS.stitches,
    githubUrl: 'https://github.com/stitchesjs/stitches',
    documentationUrl: 'https://stitches.dev/docs/introduction',
    license: 'MIT'
  },
  {
    slug: 'shadcn-ui',
    author: AUTHORS.shadcn,
    githubUrl: 'https://github.com/shadcn-ui/ui',
    documentationUrl: 'https://ui.shadcn.com/docs',
    license: 'MIT'
  },

  // Icon Libraries
  {
    slug: 'lucide-icons',
    author: AUTHORS.lucide,
    githubUrl: 'https://github.com/lucide-icons/lucide',
    documentationUrl: 'https://lucide.dev/guide/',
    license: 'ISC'
  },
  {
    slug: 'react-icons',
    author: AUTHORS.reacticons,
    githubUrl: 'https://github.com/react-icons/react-icons',
    documentationUrl: 'https://react-icons.github.io/react-icons/',
    license: 'MIT'
  },
  {
    slug: 'font-awesome',
    author: AUTHORS.fontawesome,
    githubUrl: 'https://github.com/FortAwesome/Font-Awesome',
    documentationUrl: 'https://fontawesome.com/docs',
    license: 'Various (Free: OFL-1.1, MIT, CC-BY-4.0)'
  },
  {
    slug: 'material-icons',
    author: AUTHORS.google,
    githubUrl: 'https://github.com/google/material-design-icons',
    documentationUrl: 'https://developers.google.com/fonts/docs/material_icons',
    license: 'Apache-2.0'
  },
  {
    slug: 'tabler-icons',
    author: AUTHORS.tabler,
    githubUrl: 'https://github.com/tabler/tabler-icons',
    documentationUrl: 'https://tabler-icons.io/',
    license: 'MIT'
  },
  {
    slug: 'heroicons',
    author: AUTHORS.heroicons,
    githubUrl: 'https://github.com/tailwindlabs/heroicons',
    documentationUrl: 'https://heroicons.com/',
    license: 'MIT'
  },
  {
    slug: 'phosphor-icons',
    author: AUTHORS.phosphor,
    githubUrl: 'https://github.com/phosphor-icons/phosphor-home',
    documentationUrl: 'https://phosphoricons.com/',
    license: 'MIT'
  },
  {
    slug: 'feather-icons',
    author: AUTHORS.feather,
    githubUrl: 'https://github.com/feathericons/feather',
    documentationUrl: 'https://feathericons.com/',
    license: 'MIT'
  },

  // Design Tools
  {
    slug: 'figma-js',
    author: AUTHORS.figma,
    githubUrl: 'https://github.com/figma/figma-js',
    documentationUrl: 'https://www.figma.com/developers/api',
    license: 'MIT'
  },

  // Color Tools
  {
    slug: 'chroma-js',
    author: AUTHORS.chroma,
    githubUrl: 'https://github.com/gka/chroma.js',
    documentationUrl: 'https://gka.github.io/chroma.js/',
    license: 'MIT'
  },
  {
    slug: 'tinycolor',
    author: AUTHORS.tinycolor,
    githubUrl: 'https://github.com/bgrins/TinyColor',
    documentationUrl: 'https://bgrins.github.io/TinyColor/',
    license: 'MIT'
  },
  {
    slug: 'color',
    author: AUTHORS.color,
    githubUrl: 'https://github.com/Qix-/color',
    documentationUrl: 'https://github.com/Qix-/color#readme',
    license: 'MIT'
  },
  {
    slug: 'polished',
    author: AUTHORS.polished,
    githubUrl: 'https://github.com/styled-components/polished',
    documentationUrl: 'https://polished.js.org/docs/',
    license: 'MIT'
  }
];

async function updateResources() {
  console.log('🔄 Updating resources with real author data and links...\n');

  try {
    // First, create or find authors
    const authorMap = new Map();
    
    for (const [key, authorData] of Object.entries(AUTHORS)) {
      const author = await prisma.user.upsert({
        where: { email: `${authorData.github}@github.com` },
        update: {
          name: authorData.name
        },
        create: {
          email: `${authorData.github}@github.com`,
          name: authorData.name
        }
      });
      
      authorMap.set(key, author.id);
      console.log(`✅ Created/Updated author: ${authorData.name}`);
    }

    console.log('\n📦 Updating resources...\n');

    // Update each resource
    let updatedCount = 0;
    let notFoundCount = 0;

    for (const update of RESOURCE_UPDATES) {
      try {
        // Find the author key
        const authorKey = Object.keys(AUTHORS).find(key => AUTHORS[key] === update.author);
        const authorId = authorMap.get(authorKey);

        if (!authorId) {
          console.error(`❌ Author not found for ${update.slug}`);
          continue;
        }

        const resource = await prisma.resource.update({
          where: { slug: update.slug },
          data: {
            authorId: authorId,
            githubUrl: update.githubUrl,
            documentationUrl: update.documentationUrl,
            license: update.license
          }
        });

        console.log(`✅ Updated ${resource.name}: Author: ${update.author.name}, License: ${update.license}`);
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
    console.log(`📝 Total authors created/updated: ${authorMap.size}`);

  } catch (error) {
    console.error('Error during update:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateResources();