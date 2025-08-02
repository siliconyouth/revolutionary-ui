'use client'

import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function GettingStartedPage() {
  const [activeTab, setActiveTab] = useState('npm')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const docsSidebar = [
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
  ]

  const tocItems = [
    { label: 'Prerequisites', href: '#prerequisites' },
    { label: 'Installation', href: '#installation' },
    { label: 'Basic Setup', href: '#basic-setup' },
    { label: 'Your First Component', href: '#first-component' },
    { label: 'Framework Examples', href: '#framework-examples' },
    { label: 'Next Steps', href: '#next-steps' }
  ]

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob"></div>
          <div className="absolute bottom-10 right-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/docs" className="hover:text-purple-600 transition-colors">Docs</Link>
            <span>/</span>
            <span className="text-gray-900">Getting Started</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Getting Started
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Get up and running with Revolutionary UI Factory in minutes. 
            Build production-ready components with 60-95% less code.
          </p>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <nav className="sticky top-24 space-y-6">
                {docsSidebar.map((section) => (
                  <div key={section.title}>
                    <h3 className="font-semibold text-gray-900 mb-3">{section.title}</h3>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                              item.active
                                ? 'bg-purple-100 text-purple-700 font-medium'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </aside>
            
            {/* Content */}
            <main className="lg:col-span-3">
              <div className="prose prose-lg max-w-none">
                {/* Table of Contents */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-12 not-prose">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Table of Contents</h2>
                  <ul className="space-y-2">
                    {tocItems.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          className="text-purple-600 hover:text-purple-700 transition-colors"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Prerequisites */}
                <section id="prerequisites" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Prerequisites</h2>
                  <p className="text-gray-600 mb-4">
                    Before you begin, make sure you have the following installed:
                  </p>
                  <ul className="space-y-3 not-prose">
                    {[
                      'Node.js 18.0 or higher',
                      'npm 8.0 or higher (or yarn/pnpm)',
                      'A code editor (we recommend VS Code with our extension)',
                      'Basic knowledge of your chosen framework (React, Vue, etc.)',
                      'TypeScript 5.0+ (optional but recommended)'
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Installation */}
                <section id="installation" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Installation</h2>
                  <p className="text-gray-600 mb-6">
                    Install Revolutionary UI Factory using your preferred package manager:
                  </p>
                  
                  {/* Package Manager Tabs */}
                  <div className="bg-gray-900 rounded-xl overflow-hidden mb-6">
                    <div className="flex border-b border-gray-700">
                      {['npm', 'yarn', 'pnpm'].map((pm) => (
                        <button
                          key={pm}
                          onClick={() => setActiveTab(pm)}
                          className={`px-6 py-3 text-sm font-medium transition-colors ${
                            activeTab === pm
                              ? 'text-white bg-gray-800'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {pm}
                        </button>
                      ))}
                    </div>
                    <div className="relative p-6">
                      <pre className="text-gray-300">
                        <code>
                          {activeTab === 'npm' && 'npm install @revolutionary-ui/factory'}
                          {activeTab === 'yarn' && 'yarn add @revolutionary-ui/factory'}
                          {activeTab === 'pnpm' && 'pnpm add @revolutionary-ui/factory'}
                        </code>
                      </pre>
                      <button
                        onClick={() => copyCode(
                          activeTab === 'npm' ? 'npm install @revolutionary-ui/factory' :
                          activeTab === 'yarn' ? 'yarn add @revolutionary-ui/factory' :
                          'pnpm add @revolutionary-ui/factory',
                          'install'
                        )}
                        className="absolute top-4 right-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                      >
                        {copiedCode === 'install' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Info Alert */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-blue-900">VS Code Extension</h4>
                        <p className="text-blue-700 text-sm mt-1">
                          For the best experience, install our VS Code extension "Revolutionary UI Factory" from the marketplace.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Success Callout */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <span className="text-xl">🎉</span>
                      Latest Updates (August 2025)
                    </h4>
                    <p className="text-green-800 mb-4">
                      Revolutionary UI Factory v2.0 now supports React 19, Next.js 15 with Turbopack, and Tailwind CSS v4.
                    </p>
                    <Link
                      href="/docs/migration"
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                      View Migration Guide
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </section>

                {/* Basic Setup */}
                <section id="basic-setup" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Basic Setup</h2>
                  <p className="text-gray-600 mb-6">
                    Revolutionary UI Factory automatically detects your framework and style system. Simply import and initialize:
                  </p>
                  
                  <div className="relative bg-gray-900 rounded-xl p-6 overflow-hidden">
                    <pre className="text-gray-300 overflow-x-auto">
                      <code>{`import { ui } from '@revolutionary-ui/factory'

// Auto-detects your framework and style system
const ui = setup()

// Or explicitly specify
const ui = setup({ 
  framework: 'react', 
  styling: 'tailwind' 
})`}</code>
                    </pre>
                    <button
                      onClick={() => copyCode(
                        `import { ui } from '@revolutionary-ui/factory'\n\n// Auto-detects your framework and style system\nconst ui = setup()\n\n// Or explicitly specify\nconst ui = setup({ framework: 'react', styling: 'tailwind' })`,
                        'setup'
                      )}
                      className="absolute top-4 right-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                    >
                      {copiedCode === 'setup' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </section>

                {/* Your First Component */}
                <section id="first-component" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Your First Component</h2>
                  <p className="text-gray-600 mb-6">
                    Let's create a data table with 94% less code than traditional approaches:
                  </p>
                  
                  <div className="relative bg-gray-900 rounded-xl p-6 overflow-hidden mb-8">
                    <pre className="text-gray-300 overflow-x-auto">
                      <code>{`// Traditional approach: ~800 lines
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

// That's it! You now have a fully-featured data table`}</code>
                    </pre>
                    <button
                      onClick={() => copyCode(
                        `const UserTable = ui.createDataTable({\n  columns: [\n    { id: 'name', header: 'Name', sortable: true },\n    { id: 'email', header: 'Email', sortable: true },\n    { id: 'role', header: 'Role', filterable: true },\n    { id: 'status', header: 'Status', cell: (user) => <StatusBadge status={user.status} /> }\n  ],\n  data: users,\n  features: { search: true, pagination: true, export: true, selection: true }\n})`,
                        'table'
                      )}
                      className="absolute top-4 right-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                    >
                      {copiedCode === 'table' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Traditional Code', value: '800 lines', icon: '😓', color: 'red' },
                      { label: 'Revolutionary UI', value: '50 lines', icon: '🚀', color: 'green' },
                      { label: 'Code Reduction', value: '94%', icon: '📉', color: 'purple' },
                      { label: 'Time Saved', value: '~2 hours', icon: '⏰', color: 'blue' }
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100">
                        <div className="text-4xl mb-2">{stat.icon}</div>
                        <div className={`text-2xl font-bold text-${stat.color}-600 mb-1`}>
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Framework Examples */}
                <section id="framework-examples" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Framework Examples</h2>
                  <p className="text-gray-600 mb-6">
                    Revolutionary UI Factory works seamlessly with all major frameworks:
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      {
                        title: 'React Example',
                        language: 'jsx',
                        code: `import { ui } from '@revolutionary-ui/factory'

const ui = setup({ framework: 'react', styling: 'tailwind' })

export default function App() {
  const Dashboard = ui.createDashboard({
    widgets: [
      { type: 'stats', config: statsConfig },
      { type: 'chart', config: chartConfig },
      { type: 'table', config: tableConfig }
    ]
  })
  
  return <Dashboard />
}`
                      },
                      {
                        title: 'Vue Example',
                        language: 'vue',
                        code: `<template>
  <Dashboard :widgets="widgets" />
</template>

<script setup>
import { ui } from '@revolutionary-ui/factory'

const ui = setup({ framework: 'vue', styling: 'tailwind' })
const Dashboard = ui.createDashboard({ framework: 'vue' })

const widgets = [
  { type: 'stats', config: statsConfig },
  { type: 'chart', config: chartConfig }
]
</script>`
                      },
                      {
                        title: 'Next.js Example',
                        language: 'jsx',
                        code: `import { ui } from '@revolutionary-ui/factory'

const ui = setup({ framework: 'react', styling: 'tailwind' })

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
}`
                      }
                    ].map((example) => (
                      <div key={example.title} className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                          <h3 className="font-semibold text-gray-900">{example.title}</h3>
                        </div>
                        <div className="relative bg-gray-900 p-6">
                          <pre className="text-gray-300 overflow-x-auto text-sm">
                            <code>{example.code}</code>
                          </pre>
                          <button
                            onClick={() => copyCode(example.code, example.title)}
                            className="absolute top-4 right-4 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                          >
                            {copiedCode === example.title ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Next Steps */}
                <section id="next-steps" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Next Steps</h2>
                  <p className="text-gray-600 mb-8">
                    Now that you've created your first component, explore more possibilities:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        icon: '🧩',
                        title: 'Browse Components',
                        description: 'Explore 150+ pre-built components with 60-95% code reduction',
                        href: '/components'
                      },
                      {
                        icon: '📚',
                        title: 'Component API',
                        description: 'Learn the full API for customizing and extending components',
                        href: '/docs/component-api'
                      },
                      {
                        icon: '💡',
                        title: 'View Examples',
                        description: 'See real-world examples and complete applications',
                        href: '/examples'
                      },
                      {
                        icon: '🛠️',
                        title: 'Custom Components',
                        description: 'Learn how to create your own factory components',
                        href: '/docs/custom-components'
                      }
                    ].map((card) => (
                      <Link
                        key={card.title}
                        href={card.href}
                        className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all"
                      >
                        <div className="text-4xl mb-4">{card.icon}</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-gray-600">{card.description}</p>
                      </Link>
                    ))}
                  </div>
                </section>
                
                {/* Support Callout */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-3">Need Help?</h3>
                  <p className="text-white/90 mb-6">
                    Join our community on Discord or check out our GitHub repository for support and updates.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href="/discord"
                      className="inline-flex items-center justify-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Join Discord
                    </a>
                    <a
                      href="https://github.com/siliconyouth/revolutionary-ui-factory-system"
                      className="inline-flex items-center justify-center px-6 py-3 bg-transparent text-white border-2 border-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </>
  )
}