import { useState } from 'react'
import Head from 'next/head'
import { ui, getGitHubLink, marketplaceTheme } from '@/lib/ui-factory'
import { frameworks, components } from '@/data/components-v2'

export default function FrameworksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)

  // Filter frameworks based on search
  const filteredFrameworks = frameworks.filter(fw =>
    fw.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fw.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Create page layout using Revolutionary UI
  const PageLayout = ui.createLayout({
    type: 'full',
    className: 'min-h-screen bg-gray-50 dark:bg-gray-950',
    features: { darkMode: true, responsive: true }
  })

  // Navigation
  const Navigation = ui.createNavbar({
    logo: { text: 'Revolutionary UI', href: '/' },
    items: [
      { label: 'Components', href: '/components' },
      { label: 'Frameworks', href: '/frameworks', active: true },
      { label: 'Docs', href: '/docs' },
      { label: 'Examples', href: '/examples' }
    ],
    actions: [
      { type: 'github', href: 'https://github.com/siliconyouth/revolutionary-ui-factory-system' },
      { type: 'darkMode' }
    ],
    className: 'glass sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800'
  })

  // Hero section
  const HeroSection = ui.createContainer({
    className: marketplaceTheme.spacing.section,
    children: [
      ui.createSectionHeader({
        title: 'Supported Frameworks',
        subtitle: 'Revolutionary UI Factory works with ALL major frameworks. Choose your favorite and start building.',
        className: 'text-center mb-12'
      }),
      
      // Search bar
      ui.createSearchBar({
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: 'Search frameworks...',
        className: 'max-w-xl mx-auto mb-12',
        features: { icon: true, clear: true }
      })
    ]
  })

  // Framework grid
  const FrameworkGrid = ui.createGrid({
    columns: { xs: 1, sm: 2, md: 3, lg: 4 },
    gap: 6,
    items: filteredFrameworks.map(framework => {
      const componentCount = components.filter(c => c.frameworks.includes(framework.id)).length
      
      return ui.createCard({
        key: framework.id,
        className: `card-hover cursor-pointer ${selectedFramework === framework.id ? 'border-primary-500' : ''}`,
        onClick: () => setSelectedFramework(framework.id),
        header: {
          icon: framework.icon,
          title: framework.name,
          badge: `${componentCount} components`
        },
        content: {
          description: `Full support for ${framework.name} with optimized code generation`,
          features: [
            'Type-safe components',
            'Framework idioms',
            'Best practices',
            'Performance optimized'
          ]
        },
        footer: {
          actions: [
            { 
              label: 'View Docs', 
              href: framework.documentationUrl || `/docs/frameworks/${framework.id}`,
              variant: 'primary',
              size: 'sm'
            },
            { 
              label: 'GitHub', 
              href: getGitHubLink('framework', framework.id),
              variant: 'outline',
              size: 'sm',
              external: true
            }
          ]
        },
        features: {
          hover: true,
          animation: 'fadeIn'
        }
      })
    })
  })

  // Framework details section
  const FrameworkDetails = selectedFramework ? ui.createContainer({
    className: `${marketplaceTheme.spacing.section} bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800`,
    children: [
      ui.createSectionHeader({
        title: frameworks.find(f => f.id === selectedFramework)?.name || '',
        subtitle: 'Example implementation and setup guide',
        className: 'mb-8'
      }),
      
      // Setup instructions
      ui.createCard({
        className: 'mb-8',
        header: { title: 'Quick Setup', icon: '🚀' },
        content: ui.createCodeBlock({
          language: 'bash',
          code: `# Install Revolutionary UI Factory
npm install revolutionary-ui

# Install framework-specific dependencies
npm install ${selectedFramework === 'react' ? 'react react-dom' : 
              selectedFramework === 'vue' ? 'vue' :
              selectedFramework === 'angular' ? '@angular/core @angular/common' :
              selectedFramework}`,
          features: { copy: true, lineNumbers: true }
        })
      }),
      
      // Code example
      ui.createCard({
        header: { title: 'Example Usage', icon: '💻' },
        content: ui.createCodeBlock({
          language: selectedFramework === 'angular' ? 'typescript' : 'javascript',
          code: getFrameworkExample(selectedFramework),
          features: { copy: true, lineNumbers: true, highlight: [1, 5] }
        })
      }),
      
      // Components using this framework
      ui.createContainer({
        className: 'mt-12',
        children: [
          ui.createSectionHeader({
            title: 'Components Available',
            subtitle: `${components.filter(c => c.frameworks.includes(selectedFramework)).length} components support ${frameworks.find(f => f.id === selectedFramework)?.name}`,
            className: 'mb-8'
          }),
          ui.createGrid({
            columns: { xs: 2, sm: 3, md: 4, lg: 6 },
            gap: 4,
            items: components
              .filter(c => c.frameworks.includes(selectedFramework))
              .slice(0, 12)
              .map(component => ui.createCard({
                href: `/components/${component.id}`,
                className: 'text-center p-4 hover:scale-105 transition-transform',
                content: {
                  icon: component.icon,
                  title: component.name,
                  subtitle: `${component.reduction}% reduction`
                }
              }))
          })
        ]
      })
    ]
  }) : null

  // Feature comparison
  const ComparisonSection = ui.createContainer({
    className: `${marketplaceTheme.spacing.section} bg-gray-50 dark:bg-gray-900`,
    children: [
      ui.createSectionHeader({
        title: 'Framework Comparison',
        subtitle: 'All frameworks get the same powerful features',
        className: 'text-center mb-12'
      }),
      ui.createDataTable({
        columns: [
          { id: 'feature', header: 'Feature', sticky: true },
          ...frameworks.slice(0, 5).map(fw => ({
            id: fw.id,
            header: fw.name,
            cell: () => '✅',
            className: 'text-center'
          }))
        ],
        data: [
          { feature: '60-95% Code Reduction' },
          { feature: 'Type Safety' },
          { feature: 'Component Library' },
          { feature: 'Dark Mode' },
          { feature: 'Accessibility' },
          { feature: 'Responsive Design' },
          { feature: 'Performance Optimized' },
          { feature: 'Tree Shaking' },
          { feature: 'Hot Module Replacement' },
          { feature: 'Custom Themes' }
        ],
        features: {
          striped: true,
          hover: true,
          responsive: true
        }
      })
    ]
  })

  // Footer
  const Footer = ui.createFooter({
    sections: [
      {
        title: 'Frameworks',
        links: frameworks.slice(0, 6).map(fw => ({
          label: fw.name,
          href: `/frameworks#${fw.id}`
        }))
      },
      {
        title: 'Resources',
        links: [
          { label: 'Setup Guide', href: '/docs/getting-started' },
          { label: 'Migration Guide', href: '/docs/migration' },
          { label: 'API Reference', href: '/docs/api' },
          { label: 'Examples', href: '/examples' }
        ]
      }
    ],
    className: 'bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800'
  })

  return (
    <>
      <Head>
        <title>Frameworks - Revolutionary UI Factory</title>
        <meta name="description" content="Revolutionary UI Factory supports React, Vue, Angular, Svelte, and 10+ more frameworks. Write once, use everywhere." />
      </Head>

      <PageLayout>
        {Navigation}
        {HeroSection}
        
        <div className={marketplaceTheme.spacing.container}>
          {FrameworkGrid}
        </div>
        
        {FrameworkDetails}
        {ComparisonSection}
        {Footer}
      </PageLayout>
    </>
  )
}

function getFrameworkExample(frameworkId: string): string {
  const examples: Record<string, string> = {
    react: `import { setup } from 'revolutionary-ui'

// Initialize for React
const ui = setup('react', 'tailwind')

// Create any component with massive code reduction
export default function App() {
  const Dashboard = ui.createDashboard({
    widgets: [
      { type: 'stats', config: { value: 1234, label: 'Users' } },
      { type: 'chart', config: { type: 'line', data: salesData } }
    ]
  })
  
  return <Dashboard />
}`,
    
    vue: `<template>
  <Dashboard :widgets="widgets" />
</template>

<script setup>
import { setup } from 'revolutionary-ui'

const ui = setup('vue', 'tailwind')
const Dashboard = ui.createDashboard({ framework: 'vue' })

const widgets = [
  { type: 'stats', config: { value: 1234, label: 'Users' } },
  { type: 'chart', config: { type: 'line', data: salesData } }
]
</script>`,

    angular: `import { Component } from '@angular/core'
import { setup } from 'revolutionary-ui'

@Component({
  selector: 'app-root',
  template: \`
    <revolutionary-dashboard 
      [widgets]="widgets">
    </revolutionary-dashboard>
  \`
})
export class AppComponent {
  ui = setup('angular', 'tailwind')
  Dashboard = this.ui.createDashboard({ framework: 'angular' })
  
  widgets = [
    { type: 'stats', config: { value: 1234, label: 'Users' } },
    { type: 'chart', config: { type: 'line', data: this.salesData } }
  ]
}`,

    svelte: `<script>
import { setup } from 'revolutionary-ui'

const ui = setup('svelte', 'tailwind')
const Dashboard = ui.createDashboard({ framework: 'svelte' })

const widgets = [
  { type: 'stats', config: { value: 1234, label: 'Users' } },
  { type: 'chart', config: { type: 'line', data: salesData } }
]
</script>

<Dashboard {widgets} />`,

    solid: `import { setup } from 'revolutionary-ui'

const ui = setup('solid', 'tailwind')

export default function App() {
  const Dashboard = ui.createDashboard({ framework: 'solid' })
  
  const widgets = [
    { type: 'stats', config: { value: 1234, label: 'Users' } },
    { type: 'chart', config: { type: 'line', data: salesData } }
  ]
  
  return <Dashboard widgets={widgets} />
}`
  }
  
  return examples[frameworkId] || examples.react
}