'use client'

import React from 'react'
import { ui, marketplaceTheme } from '@/lib/ui-factory'

export default function MigrationGuidePage() {
  // Create page layout using Revolutionary UI
  const PageLayout = ui.createLayout({
    type: 'sidebar',
    className: 'min-h-screen bg-gray-50 dark:bg-gray-950',
    features: { darkMode: true, responsive: true }
  })

  // Navigation
  const Navigation = ui.createNavbar({
    logo: { text: 'Revolutionary UI', href: '/' },
    items: [
      { label: 'Components', href: '/components' },
      { label: 'Frameworks', href: '/frameworks' },
      { label: 'Docs', href: '/docs', active: true },
      { label: 'Examples', href: '/examples' }
    ],
    actions: [
      { type: 'github', href: 'https://github.com/siliconyouth/revolutionary-ui-factory-system' },
      { type: 'darkMode' }
    ],
    className: 'glass sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800'
  })

  // Documentation sidebar
  const Sidebar = ui.createSidebar({
    sections: [
      {
        title: 'Getting Started',
        items: [
          { label: 'Introduction', href: '/docs/introduction' },
          { label: 'Quick Start', href: '/docs/getting-started' },
          { label: 'Installation', href: '/docs/installation' },
          { label: 'Basic Usage', href: '/docs/basic-usage' }
        ]
      },
      {
        title: 'Core Concepts',
        items: [
          { label: 'Factory Pattern', href: '/docs/factory-pattern' },
          { label: 'Component Generation', href: '/docs/component-generation' },
          { label: 'Framework Adapters', href: '/docs/framework-adapters' },
          { label: 'Style Systems', href: '/docs/style-systems' }
        ]
      },
      {
        title: 'Components',
        items: [
          { label: 'Component Catalog', href: '/docs/components' },
          { label: 'Custom Components', href: '/docs/custom-components' },
          { label: 'Component API', href: '/docs/component-api' }
        ]
      },
      {
        title: 'Advanced',
        items: [
          { label: 'TypeScript', href: '/docs/typescript' },
          { label: 'Performance', href: '/docs/performance' },
          { label: 'Testing', href: '/docs/testing' },
          { label: 'Migration Guide', href: '/docs/migration', active: true }
        ]
      }
    ],
    className: 'w-64 border-r border-gray-200 dark:border-gray-800'
  })

  // Main content
  const MainContent = ui.createContainer({
    className: 'flex-1 px-8 py-12 max-w-4xl',
    children: [
      // Page header
      ui.createPageHeader({
        title: 'Migration Guide to v2.0',
        description: 'Upgrade from v1.x to Revolutionary UI Factory v2.0 with confidence',
        breadcrumbs: [
          { label: 'Docs', href: '/docs' },
          { label: 'Advanced', href: '/docs/advanced' },
          { label: 'Migration Guide' }
        ]
      }),

      // Table of contents
      ui.createTableOfContents({
        items: [
          { label: 'Overview', href: '#overview' },
          { label: 'Breaking Changes', href: '#breaking-changes' },
          { label: 'Step-by-Step Migration', href: '#migration-steps' },
          { label: 'New Features', href: '#new-features' },
          { label: 'Troubleshooting', href: '#troubleshooting' },
          { label: 'Support', href: '#support' }
        ],
        className: 'mb-12'
      }),

      // Overview section
      ui.createSection({
        id: 'overview',
        title: 'Overview',
        content: [
          ui.createParagraph({
            text: 'Revolutionary UI Factory v2.0 is a major update that transforms the library from a React-only table/form generator to a universal component factory supporting 150+ component types across 10+ frameworks.'
          }),
          ui.createStats({
            items: [
              { label: 'Component Types', value: '150+', icon: '🧩', trend: 'up' },
              { label: 'Frameworks', value: '10+', icon: '🔧', trend: 'up' },
              { label: 'Code Reduction', value: '60-95%', icon: '📉' },
              { label: 'Breaking Changes', value: 'Minimal', icon: '✅' }
            ],
            className: 'mt-8 grid-cols-4'
          })
        ]
      }),

      // Breaking changes section
      ui.createSection({
        id: 'breaking-changes',
        title: 'Breaking Changes',
        content: [
          ui.createAccordion({
            items: [
              {
                title: '1. Package Name Change',
                content: ui.createCodeBlock({
                  language: 'bash',
                  code: `# Old
npm uninstall revolutionary-ui-factory

# New
npm install @vladimirdukelic/revolutionary-ui-factory`,
                  features: { copy: true }
                })
              },
              {
                title: '2. Import Changes',
                content: ui.createCodeBlock({
                  language: 'typescript',
                  code: `// Old (v1.x)
import { createDataTable, createForm } from 'revolutionary-ui-factory';

// New (v2.0)
import { setup } from '@vladimirdukelic/revolutionary-ui-factory';
const ui = setup();
const table = ui.createDataTable(config);`,
                  features: { copy: true }
                })
              },
              {
                title: '3. React Version Requirements',
                content: React.createElement('div', {},
                  ui.createParagraph({ text: 'Revolutionary UI Factory v2.0 requires React 19 or higher:' }),
                  ui.createCodeBlock({
                    language: 'json',
                    code: `{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}`,
                    features: { copy: true }
                  })
                )
              },
              {
                title: '4. TypeScript Version',
                content: React.createElement('div', {},
                  ui.createParagraph({ text: 'Update to TypeScript 5.0 or higher:' }),
                  ui.createCodeBlock({
                    language: 'json',
                    code: `{
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}`,
                    features: { copy: true }
                  })
                )
              }
            ]
          })
        ]
      }),

      // Migration steps section
      ui.createSection({
        id: 'migration-steps',
        title: 'Step-by-Step Migration',
        content: [
          ui.createDataTable({
            columns: [
              { id: 'step', header: 'Step', width: 60 },
              { id: 'action', header: 'Action', width: 300 },
              { id: 'command', header: 'Command/Code', cell: (row: any) => 
                React.createElement('code', { className: 'text-sm bg-gray-100 px-2 py-1 rounded' }, row.command)
              }
            ],
            data: [
              { step: 1, action: 'Remove old package', command: 'npm uninstall revolutionary-ui-factory' },
              { step: 2, action: 'Install new package', command: 'npm install @vladimirdukelic/revolutionary-ui-factory' },
              { step: 3, action: 'Update React', command: 'npm install react@^19.0.0 react-dom@^19.0.0' },
              { step: 4, action: 'Update TypeScript', command: 'npm install -D typescript@^5.0.0' },
              { step: 5, action: 'Update imports', command: "Replace 'revolutionary-ui-factory' with '@vladimirdukelic/revolutionary-ui-factory'" },
              { step: 6, action: 'Update component creation', command: 'const ui = setup(); ui.createDataTable(...)' }
            ]
          })
        ]
      }),

      // New features section
      ui.createSection({
        id: 'new-features',
        title: 'New Features in v2.0',
        content: [
          ui.createGrid({
            columns: { xs: 1, md: 2 },
            gap: 6,
            items: [
              ui.createCard({
                header: { icon: '🎯', title: 'Universal Setup' },
                content: {
                  description: 'Auto-detects your framework and style system',
                  tags: ['Auto-detection', 'Zero-config']
                }
              }),
              ui.createCard({
                header: { icon: '🧩', title: '150+ Components' },
                content: {
                  description: 'From basic buttons to complex dashboards',
                  tags: ['Dashboards', 'Kanban', 'Calendar']
                }
              }),
              ui.createCard({
                header: { icon: '🔧', title: '10+ Frameworks' },
                content: {
                  description: 'React, Vue, Angular, Svelte, and more',
                  tags: ['Framework-agnostic', 'Adapters']
                }
              }),
              ui.createCard({
                header: { icon: '🎨', title: 'Any Style System' },
                content: {
                  description: 'Tailwind, CSS-in-JS, CSS Modules, etc.',
                  tags: ['Style adapters', 'Theming']
                }
              })
            ]
          })
        ]
      }),

      // Troubleshooting section
      ui.createSection({
        id: 'troubleshooting',
        title: 'Troubleshooting',
        content: [
          ui.createAccordion({
            items: [
              {
                title: 'React 19 Peer Dependency Warnings',
                content: React.createElement('div', {},
                  ui.createParagraph({ text: 'If you encounter peer dependency issues:' }),
                  ui.createCodeBlock({
                    language: 'bash',
                    code: 'npm install --legacy-peer-deps',
                    features: { copy: true }
                  })
                )
              },
              {
                title: 'Tailwind CSS v4 PostCSS Error',
                content: React.createElement('div', {},
                  ui.createParagraph({ text: 'Update your postcss.config.js:' }),
                  ui.createCodeBlock({
                    language: 'javascript',
                    code: `module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},  // New v4 plugin
    autoprefixer: {},
  },
}`,
                    features: { copy: true }
                  })
                )
              },
              {
                title: 'TypeScript Strict Mode Errors',
                content: React.createElement('div', {},
                  ui.createParagraph({ text: 'If experiencing TypeScript errors, temporarily disable strict mode:' }),
                  ui.createCodeBlock({
                    language: 'json',
                    code: `{
  "compilerOptions": {
    "strict": false,
    "skipLibCheck": true
  }
}`,
                    features: { copy: true }
                  })
                )
              },
              {
                title: 'Next.js 15 with Turbopack',
                content: React.createElement('div', {},
                  ui.createParagraph({ text: 'Enable Turbopack in your package.json:' }),
                  ui.createCodeBlock({
                    language: 'json',
                    code: `{
  "scripts": {
    "dev": "next dev --turbopack"
  }
}`,
                    features: { copy: true }
                  })
                )
              }
            ]
          })
        ]
      }),

      // Compatibility mode
      ui.createCallout({
        type: 'info',
        title: 'Compatibility Mode',
        content: 'For easier migration, v2.0 includes a compatibility mode that supports most v1.x APIs:',
        className: 'mt-8'
      }),
      ui.createCodeBlock({
        language: 'javascript',
        code: `import { enableV1Compatibility } from '@vladimirdukelic/revolutionary-ui-factory';

// Enable v1 API compatibility
enableV1Compatibility();

// Your old code should work with minimal changes`,
        features: { copy: true },
        className: 'mb-12'
      }),

      // Support section
      ui.createSection({
        id: 'support',
        title: 'Getting Help',
        content: [
          ui.createParagraph({
            text: 'Need assistance with your migration? We\'re here to help:'
          }),
          ui.createGrid({
            columns: { xs: 1, md: 2 },
            gap: 6,
            items: [
              ui.createCard({
                href: 'https://github.com/siliconyouth/revolutionary-ui-factory-system/discussions',
                header: { icon: '💬', title: 'Community Support' },
                content: 'Ask questions and share experiences in our GitHub Discussions',
                features: { hover: true }
              }),
              ui.createCard({
                href: 'https://github.com/siliconyouth/revolutionary-ui-factory-system/issues',
                header: { icon: '🐛', title: 'Report Issues' },
                content: 'Found a bug? Let us know on GitHub Issues',
                features: { hover: true }
              }),
              ui.createCard({
                href: '/docs',
                header: { icon: '📚', title: 'Documentation' },
                content: 'Browse our comprehensive documentation',
                features: { hover: true }
              }),
              ui.createCard({
                href: 'mailto:vladimir@dukelic.com',
                header: { icon: '📧', title: 'Email Support' },
                content: 'Contact the author directly for critical issues',
                features: { hover: true }
              })
            ]
          })
        ]
      }),

      // Success message
      ui.createAlert({
        type: 'success',
        title: 'Thank you for upgrading!',
        content: 'We\'re excited to see what you build with Revolutionary UI Factory v2.0\'s expanded capabilities.',
        className: 'mt-12'
      })
    ]
  })

  return (
    <PageLayout>
      {Navigation}
      <div className="flex flex-1">
        {Sidebar}
        {MainContent}
      </div>
    </PageLayout>
  )
}