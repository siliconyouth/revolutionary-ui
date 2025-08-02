import React, { useState, useMemo } from 'react'
import Head from 'next/head'
import { ui, MarketplaceComponents, marketplaceTheme } from '@/lib/ui-factory'
import { components, categories, frameworks, getStats } from '@/data/components-v2'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const stats = getStats()

  // Simple search filter like 21st.dev
  const filteredComponents = useMemo(() => {
    if (!searchQuery) return components.slice(0, 12) // Show first 12 by default
    
    const query = searchQuery.toLowerCase()
    return components.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query)
    ).slice(0, 24) // Limit results
  }, [searchQuery])

  // Create page layout using Revolutionary UI with gradient background
  const PageLayout = ({ children }: any) => React.createElement('div', { 
    className: 'min-h-screen bg-white',
    style: {
      background: 'radial-gradient(ellipse at top, rgba(147, 51, 234, 0.05) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(59, 130, 246, 0.05) 0%, transparent 50%)'
    }
  }, children)

  // Create navigation
  const Navigation = MarketplaceComponents.Navigation()

  // Create hero section
  const HeroSection = MarketplaceComponents.HeroSection()

  // Create simple search section like 21st.dev
  const SearchSection = ui.createContainer({
    className: 'py-12 px-4',
    children: ui.createSearchBar({
      value: searchQuery,
      onChange: setSearchQuery,
      placeholder: 'Search components...',
      className: 'max-w-xl mx-auto',
      features: {
        icon: true,
        clear: true
      }
    })
  })

  // Create component grid
  const ComponentSection = React.createElement('div', { className: 'max-w-7xl mx-auto px-4 pb-24' },
    searchQuery && React.createElement('p', { 
      className: 'text-center text-gray-600 mb-8' 
    }, `${filteredComponents.length} results for "${searchQuery}"`),
    MarketplaceComponents.ComponentGrid(filteredComponents)
  )

  // Simple footer like 21st.dev
  const Footer = React.createElement('footer', { 
    className: 'border-t border-gray-200 mt-24' 
  },
    React.createElement('div', { className: 'max-w-7xl mx-auto px-4 py-12' },
      React.createElement('div', { className: 'flex justify-between items-center' },
        React.createElement('div', {},
          React.createElement('p', { className: 'text-gray-600' }, '© 2024 Revolutionary UI Factory'),
          React.createElement('p', { className: 'text-sm text-gray-500 mt-1' }, 'Created by Vladimir Dukelic')
        ),
        React.createElement('div', { className: 'flex gap-6' },
          React.createElement('a', { 
            href: 'https://github.com/siliconyouth/revolutionary-ui-factory-system',
            className: 'text-gray-600 hover:text-gray-900',
            target: '_blank',
            rel: 'noopener noreferrer'
          }, 'GitHub'),
          React.createElement('a', { 
            href: '/docs',
            className: 'text-gray-600 hover:text-gray-900'
          }, 'Docs'),
          React.createElement('a', { 
            href: 'mailto:vladimir@dukelic.com',
            className: 'text-gray-600 hover:text-gray-900'
          }, 'Contact')
        )
      )
    )
  )

  return (
    <>
      <Head>
        <title>Revolutionary UI Factory - Generate ANY Component with 60-95% Less Code</title>
        <meta name="description" content="The ultimate SDK for building user interfaces. 150+ components for React, Vue, Angular, and more. Write less, achieve more." />
        <meta property="og:title" content="Revolutionary UI Factory" />
        <meta property="og:description" content="Generate ANY UI component for ANY framework with 60-95% code reduction" />
        <meta property="og:url" content="https://revolutionary-ui.com" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://revolutionary-ui.com" />
      </Head>

      <PageLayout>
        {Navigation}
        {HeroSection}
        {SearchSection}
        {ComponentSection}
        {Footer}
      </PageLayout>
    </>
  )
}