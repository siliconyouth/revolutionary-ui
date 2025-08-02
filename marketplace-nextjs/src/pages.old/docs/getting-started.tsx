import Head from 'next/head'
import { ui, marketplaceTheme } from '@/lib/ui-factory'

export default function GettingStartedPage() {
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
          { label: 'Quick Start', href: '/docs/getting-started', active: true },
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
          { label: 'Migration Guide', href: '/docs/migration' }
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
        title: 'Getting Started',
        description: 'Get up and running with Revolutionary UI Factory in minutes',
        breadcrumbs: [
          { label: 'Docs', href: '/docs' },
          { label: 'Getting Started' }
        ]
      }),

      // Table of contents
      ui.createTableOfContents({
        items: [
          { label: 'Prerequisites', href: '#prerequisites' },
          { label: 'Installation', href: '#installation' },
          { label: 'Basic Setup', href: '#basic-setup' },
          { label: 'Your First Component', href: '#first-component' },
          { label: 'Framework Examples', href: '#framework-examples' },
          { label: 'Next Steps', href: '#next-steps' }
        ],
        className: 'mb-12'
      }),

      // Prerequisites section
      ui.createSection({
        id: 'prerequisites',
        title: 'Prerequisites',
        content: [
          ui.createParagraph({
            text: 'Before you begin, make sure you have the following installed:'
          }),
          ui.createList({
            items: [
              'Node.js 18.0 or higher',
              'npm 8.0 or higher (or yarn/pnpm)',
              'A code editor (we recommend VS Code with our extension)',
              'Basic knowledge of your chosen framework (React, Vue, etc.)',
              'TypeScript 5.0+ (optional but recommended)'
            ],
            type: 'checklist'
          })
        ]
      }),

      // Installation section
      ui.createSection({
        id: 'installation',
        title: 'Installation',
        content: [
          ui.createParagraph({
            text: 'Install Revolutionary UI Factory using your preferred package manager:'
          }),
          ui.createTabs({
            items: [
              {
                label: 'npm',
                content: ui.createCodeBlock({
                  language: 'bash',
                  code: 'npm install @vladimirdukelic/revolutionary-ui-factory',
                  features: { copy: true }
                })
              },
              {
                label: 'yarn',
                content: ui.createCodeBlock({
                  language: 'bash',
                  code: 'yarn add @vladimirdukelic/revolutionary-ui-factory',
                  features: { copy: true }
                })
              },
              {
                label: 'pnpm',
                content: ui.createCodeBlock({
                  language: 'bash',
                  code: 'pnpm add @vladimirdukelic/revolutionary-ui-factory',
                  features: { copy: true }
                })
              }
            ]
          }),
          ui.createAlert({
            type: 'info',
            title: 'VS Code Extension',
            content: 'For the best experience, install our VS Code extension "Revolutionary UI Factory" from the marketplace.',
            className: 'mt-6'
          }),
          ui.createCallout({
            type: 'success',
            title: 'Latest Updates (August 2025)',
            content: 'Revolutionary UI Factory v2.0 now supports React 19, Next.js 15 with Turbopack, and Tailwind CSS v4. See the migration guide for upgrade instructions.',
            actions: [
              { label: 'View Migration Guide', href: '/docs/migration', variant: 'primary' }
            ],
            className: 'mt-6'
          })
        ]
      }),

      // Basic setup section
      ui.createSection({
        id: 'basic-setup',
        title: 'Basic Setup',
        content: [
          ui.createParagraph({
            text: 'Revolutionary UI Factory automatically detects your framework and style system. Simply import and initialize:'
          }),
          ui.createCodeBlock({
            language: 'javascript',
            code: `import { setup } from '@vladimirdukelic/revolutionary-ui-factory'

// Auto-detects your framework and style system
const ui = setup()

// Or explicitly specify
const ui = setup('react', 'tailwind')`,
            features: { copy: true, lineNumbers: true }
          })
        ]
      }),

      // First component section
      ui.createSection({
        id: 'first-component',
        title: 'Your First Component',
        content: [
          ui.createParagraph({
            text: "Let's create a data table with 94% less code than traditional approaches:"
          }),
          ui.createCodeBlock({
            language: 'javascript',
            code: `// Traditional approach: ~800 lines
// Revolutionary UI approach: ~50 lines

const UserTable = ui.createDataTable({
  columns: [
    { id: 'name', header: 'Name', sortable: true },
    { id: 'email', header: 'Email', sortable: true },
    { id: 'role', header: 'Role', filterable: true },
    { id: 'status', header: 'Status', 
      cell: (user) => <StatusBadge status={user.status} /> 
    }
  ],
  data: users,
  features: {
    search: true,
    pagination: true,
    export: true,
    selection: true
  }
})

// That's it! You now have a fully-featured data table`,
            features: { copy: true, lineNumbers: true, highlight: [4, 5, 6, 7, 8, 9, 10] }
          }),
          ui.createStats({
            items: [
              { label: 'Traditional Code', value: '800 lines', icon: '😓' },
              { label: 'Revolutionary UI', value: '50 lines', icon: '🚀' },
              { label: 'Code Reduction', value: '94%', icon: '📉' },
              { label: 'Time Saved', value: '~2 hours', icon: '⏰' }
            ],
            className: 'mt-8 grid-cols-4'
          })
        ]
      }),

      // Framework examples section
      ui.createSection({
        id: 'framework-examples',
        title: 'Framework Examples',
        content: [
          ui.createParagraph({
            text: 'Revolutionary UI Factory works seamlessly with all major frameworks:'
          }),
          ui.createAccordion({
            items: [
              {
                title: 'React Example',
                content: ui.createCodeBlock({
                  language: 'jsx',
                  code: `import { setup } from '@vladimirdukelic/revolutionary-ui-factory'

const ui = setup('react', 'tailwind')

export default function App() {
  const Dashboard = ui.createDashboard({
    widgets: [
      { type: 'stats', config: statsConfig },
      { type: 'chart', config: chartConfig },
      { type: 'table', config: tableConfig }
    ]
  })
  
  return <Dashboard />
}`,
                  features: { copy: true }
                })
              },
              {
                title: 'Vue Example',
                content: ui.createCodeBlock({
                  language: 'vue',
                  code: `<template>
  <Dashboard :widgets="widgets" />
</template>

<script setup>
import { setup } from '@vladimirdukelic/revolutionary-ui-factory'

const ui = setup('vue', 'tailwind')
const Dashboard = ui.createDashboard({ framework: 'vue' })

const widgets = [
  { type: 'stats', config: statsConfig },
  { type: 'chart', config: chartConfig }
]
</script>`,
                  features: { copy: true }
                })
              },
              {
                title: 'Next.js Example',
                content: ui.createCodeBlock({
                  language: 'jsx',
                  code: `import { setup } from '@vladimirdukelic/revolutionary-ui-factory'

const ui = setup('react', 'tailwind')

export default function DashboardPage() {
  const Dashboard = ui.createDashboard({
    widgets: dashboardWidgets,
    layout: 'grid',
    features: {
      realtime: true,
      darkMode: true,
      responsive: true
    }
  })
  
  return (
    <main>
      <Dashboard />
    </main>
  )
}`,
                  features: { copy: true }
                })
              }
            ]
          })
        ]
      }),

      // Next steps section
      ui.createSection({
        id: 'next-steps',
        title: 'Next Steps',
        content: [
          ui.createParagraph({
            text: "Now that you've created your first component, explore more possibilities:"
          }),
          ui.createGrid({
            columns: { xs: 1, md: 2 },
            gap: 6,
            items: [
              ui.createCard({
                href: '/components',
                header: { icon: '🧩', title: 'Browse Components' },
                content: 'Explore 150+ pre-built components with 60-95% code reduction',
                features: { hover: true }
              }),
              ui.createCard({
                href: '/docs/component-api',
                header: { icon: '📚', title: 'Component API' },
                content: 'Learn the full API for customizing and extending components',
                features: { hover: true }
              }),
              ui.createCard({
                href: '/examples',
                header: { icon: '💡', title: 'View Examples' },
                content: 'See real-world examples and complete applications',
                features: { hover: true }
              }),
              ui.createCard({
                href: '/docs/custom-components',
                header: { icon: '🛠️', title: 'Custom Components' },
                content: 'Learn how to create your own factory components',
                features: { hover: true }
              })
            ]
          })
        ]
      }),

      // Support section
      ui.createCallout({
        type: 'success',
        title: 'Need Help?',
        content: 'Join our community on Discord or check out our GitHub repository for support and updates.',
        actions: [
          { label: 'Join Discord', href: '/discord', variant: 'primary' },
          { label: 'GitHub', href: 'https://github.com/siliconyouth/revolutionary-ui-factory-system', variant: 'outline' }
        ],
        className: 'mt-12'
      })
    ]
  })

  return (
    <>
      <Head>
        <title>Getting Started - Revolutionary UI Factory</title>
        <meta name="description" content="Get up and running with Revolutionary UI Factory in minutes. Learn how to install, setup, and create your first component." />
      </Head>

      <PageLayout>
        {Navigation}
        <div className="flex flex-1">
          {Sidebar}
          {MainContent}
        </div>
      </PageLayout>
    </>
  )
}