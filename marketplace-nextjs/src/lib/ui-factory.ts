/**
 * Revolutionary UI Factory Implementation for the Marketplace
 * This demonstrates how the Revolutionary UI Factory works
 * by using it to build its own website!
 */

import React from 'react'

// Revolutionary UI Factory Pattern Implementation
class RevolutionaryUIFactory {
  private framework: string = 'react'
  private styleSystem: string = 'tailwind'

  // Core factory method that generates components with 60-95% code reduction
  private createComponent(type: string, config: any): any {
    // This is where the magic happens - instead of writing hundreds of lines
    // of component code, we generate it from simple configurations
    
    switch (type) {
      case 'Layout':
        return this.generateLayout(config)
      case 'Navbar':
        return this.generateNavbar(config)
      case 'Grid':
        return this.generateGrid(config)
      case 'Card':
        return this.generateCard(config)
      case 'Hero':
        return this.generateHero(config)
      case 'Stats':
        return this.generateStats(config)
      case 'SearchBar':
        return this.generateSearchBar(config)
      case 'Select':
        return this.generateSelect(config)
      case 'Tabs':
        return this.generateTabs(config)
      case 'Footer':
        return this.generateFooter(config)
      case 'SectionHeader':
        return this.generateSectionHeader(config)
      case 'ButtonGroup':
        return this.generateButtonGroup(config)
      case 'EmptyState':
        return this.generateEmptyState(config)
      case 'CTA':
        return this.generateCTA(config)
      case 'Container':
        return this.generateContainer(config)
      case 'Sidebar':
        return this.generateSidebar(config)
      case 'PageHeader':
        return this.generatePageHeader(config)
      case 'TableOfContents':
        return this.generateTableOfContents(config)
      case 'Section':
        return this.generateSection(config)
      case 'Paragraph':
        return this.generateParagraph(config)
      case 'List':
        return this.generateList(config)
      case 'CodeBlock':
        return this.generateCodeBlock(config)
      case 'Alert':
        return this.generateAlert(config)
      case 'Accordion':
        return this.generateAccordion(config)
      case 'Callout':
        return this.generateCallout(config)
      case 'DataTable':
        return this.generateDataTable(config)
      default:
        return () => null
    }
  }

  // Layout Components
  createLayout(config: any) {
    return this.createComponent('Layout', config)
  }

  createContainer(config: any) {
    return this.createComponent('Container', config)
  }

  createGrid(config: any) {
    return this.createComponent('Grid', config)
  }

  createSidebar(config: any) {
    return this.createComponent('Sidebar', config)
  }

  // Navigation Components  
  createNavbar(config: any) {
    return this.createComponent('Navbar', config)
  }

  createTabs(config: any) {
    return this.createComponent('Tabs', config)
  }

  // Data Display Components
  createCard(config: any) {
    return this.createComponent('Card', config)
  }

  createStats(config: any) {
    return this.createComponent('Stats', config)
  }

  // Form Components
  createSearchBar(config: any) {
    return this.createComponent('SearchBar', config)
  }

  createSelect(config: any) {
    return this.createComponent('Select', config)
  }

  createButtonGroup(config: any) {
    return this.createComponent('ButtonGroup', config)
  }

  // Content Components
  createHero(config: any) {
    return this.createComponent('Hero', config)
  }

  createSectionHeader(config: any) {
    return this.createComponent('SectionHeader', config)
  }

  createEmptyState(config: any) {
    return this.createComponent('EmptyState', config)
  }

  createCTA(config: any) {
    return this.createComponent('CTA', config)
  }

  createFooter(config: any) {
    return this.createComponent('Footer', config)
  }

  // Documentation Components
  createPageHeader(config: any) {
    return this.createComponent('PageHeader', config)
  }

  createTableOfContents(config: any) {
    return this.createComponent('TableOfContents', config)
  }

  createSection(config: any) {
    return this.createComponent('Section', config)
  }

  createParagraph(config: any) {
    return this.createComponent('Paragraph', config)
  }

  createList(config: any) {
    return this.createComponent('List', config)
  }

  createCodeBlock(config: any) {
    return this.createComponent('CodeBlock', config)
  }

  createAlert(config: any) {
    return this.createComponent('Alert', config)
  }

  createAccordion(config: any) {
    return this.createComponent('Accordion', config)
  }

  createCallout(config: any) {
    return this.createComponent('Callout', config)
  }

  createDataTable(config: any) {
    return this.createComponent('DataTable', config)
  }

  // Component Generators - These demonstrate the 60-95% code reduction
  private generateLayout(config: any) {
    return ({ children }: any) => React.createElement('div', { className: config.className }, children)
  }

  private generateContainer(config: any) {
    return React.createElement('div', { 
      className: config.className || 'max-w-7xl mx-auto' 
    }, config.children)
  }

  private generateNavbar(config: any) {
    return () => React.createElement('nav', { className: 'nav-21st fixed top-8 left-1/2 -translate-x-1/2 z-50' }, 
      React.createElement('div', { className: 'bg-white/90 backdrop-blur-xl rounded-full px-8 py-3 shadow-lg flex items-center gap-8' },
        React.createElement('a', { href: config.logo.href, className: 'text-lg font-bold' }, config.logo.text),
        React.createElement('div', { className: 'flex items-center gap-6' },
          config.items.map((item: any) => 
            React.createElement('a', { 
              key: item.label, 
              href: item.href, 
              className: `text-gray-700 hover:text-gray-900 transition-colors ${item.active ? 'text-gray-900 font-medium' : ''}` 
            }, item.label)
          )
        ),
        config.actions && React.createElement('div', { className: 'flex items-center gap-4 ml-8' },
          config.actions.map((action: any, i: number) => {
            if (action.type === 'github') {
              return React.createElement('a', {
                key: i,
                href: action.href,
                className: 'text-gray-600 hover:text-gray-900',
                target: '_blank',
                rel: 'noopener noreferrer'
              }, React.createElement('svg', { 
                className: 'w-5 h-5', 
                fill: 'currentColor', 
                viewBox: '0 0 24 24' 
              }, React.createElement('path', {
                d: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'
              })))
            }
            return null
          })
        )
      )
    )
  }

  private generateGrid(config: any) {
    const getColumns = () => {
      if (config.columns) {
        return `grid-cols-${config.columns.xs} sm:grid-cols-${config.columns.sm || config.columns.xs} md:grid-cols-${config.columns.md || config.columns.sm} lg:grid-cols-${config.columns.lg || config.columns.md}`
      }
      return 'grid-cols-1'
    }

    const items = config.items || config.children || []
    const itemsWithKeys = Array.isArray(items) 
      ? items.map((item, index) => 
          React.isValidElement(item) 
            ? React.cloneElement(item as React.ReactElement, { key: index })
            : item
        )
      : items

    return React.createElement('div', {
      className: `grid ${getColumns()} gap-${config.gap || 6}`
    }, itemsWithKeys)
  }

  private generateCard(config: any) {
    // Clean card design like 21st.dev
    return React.createElement(
      config.href ? 'a' : 'div',
      { 
        className: `group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-200 ${config.className || ''}`,
        href: config.href,
        onClick: config.onClick
      },
      [
        // Component preview area
        React.createElement('div', { 
          key: 'preview',
          className: 'aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden'
        },
          config.preview || React.createElement('div', { className: 'text-4xl' }, config.icon || '🧩')
        ),
        
        // Component info
        React.createElement('div', { key: 'info' },
          React.createElement('h3', { className: 'font-semibold text-gray-900 mb-1' }, config.name),
          React.createElement('p', { className: 'text-sm text-gray-600 mb-3 line-clamp-2' }, config.description),
          
          // Tags/badges
          React.createElement('div', { className: 'flex items-center gap-2 flex-wrap' },
            config.reduction && React.createElement('span', { 
              className: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800' 
            }, `${config.reduction}% reduction`),
            config.frameworks && config.frameworks.slice(0, 2).map((fw: string) => 
              React.createElement('span', { 
                key: fw,
                className: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700' 
              }, fw)
            )
          )
        ),
        
        // Hover state arrow
        config.href && React.createElement('div', { 
          key: 'arrow',
          className: 'absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity'
        },
          React.createElement('svg', { 
            className: 'w-5 h-5 text-gray-400',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24'
          },
            React.createElement('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M17 8l4 4m0 0l-4 4m4-4H3'
            })
          )
        )
      ]
    )
  }

  private generateHero(config: any) {
    return React.createElement('div', { 
      className: 'min-h-screen flex items-center justify-center relative overflow-hidden',
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite'
      }
    },
      // Gradient overlay
      React.createElement('div', { 
        className: 'absolute inset-0',
        style: {
          background: 'radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.3) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(102, 126, 234, 0.2) 0%, transparent 50%)'
        }
      }),
      React.createElement('div', { className: 'container-custom text-center relative z-10' },
        React.createElement('h1', { className: 'text-6xl md:text-7xl font-black mb-6 text-white' }, config.title),
        React.createElement('p', { className: 'text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto' }, config.subtitle),
        React.createElement('div', { className: 'flex gap-4 justify-center flex-wrap' },
          config.actions.map((action: any, i: number) => 
            React.createElement('a', {
              key: i,
              href: action.href,
              className: action.variant === 'primary' 
                ? 'bg-gray-900 text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all hover:scale-105 flex items-center gap-2'
                : 'bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-medium hover:bg-white/30 transition-all hover:scale-105 border border-white/30'
            }, 
              action.label,
              action.variant === 'primary' && React.createElement('span', {}, '→')
            )
          )
        ),
        config.integrations && React.createElement('div', { className: 'mt-20' },
          React.createElement('p', { className: 'text-white/80 mb-6' }, 'Optimized for'),
          React.createElement('div', { className: 'flex gap-6 justify-center flex-wrap' },
            config.integrations.map((integration: any) => 
              React.createElement('div', { 
                key: integration.name,
                className: 'bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 text-white/90'
              },
                integration.icon && React.createElement('span', {}, integration.icon),
                React.createElement('span', { className: 'font-medium' }, integration.name)
              )
            )
          )
        )
      )
    )
  }

  private generateStats(config: any) {
    return React.createElement('div', { className: `grid ${config.className}` },
      config.items.map((stat: any) => 
        React.createElement('div', { key: stat.label, className: 'text-center' },
          React.createElement('div', { className: 'text-4xl mb-2' }, stat.icon),
          React.createElement('div', { className: 'text-3xl font-bold' }, stat.value),
          React.createElement('div', { className: 'text-gray-600' }, stat.label),
          stat.trend && React.createElement('div', { className: 'text-green-600 text-sm mt-1' }, stat.trend)
        )
      )
    )
  }

  private generateSearchBar(config: any) {
    return React.createElement('div', { className: `relative ${config.className}` },
      React.createElement('input', {
        type: 'text',
        value: config.value,
        onChange: (e: any) => config.onChange(e.target.value),
        placeholder: config.placeholder,
        className: 'w-full px-5 py-4 pl-14 bg-gray-50 border border-transparent rounded-2xl text-lg focus:outline-none focus:bg-white focus:border-gray-200 focus:shadow-sm transition-all'
      }),
      React.createElement('svg', { 
        className: 'absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400',
        fill: 'none',
        stroke: 'currentColor',
        viewBox: '0 0 24 24'
      }, React.createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 1.5,
        d: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
      })),
      config.features?.clear && config.value && React.createElement('button', {
        className: 'absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600',
        onClick: () => config.onChange('')
      }, '✕')
    )
  }

  private generateSelect(config: any) {
    return React.createElement('div', {},
      config.label && React.createElement('label', { className: 'block text-sm font-medium mb-1' }, config.label),
      React.createElement('select', {
        value: config.value,
        onChange: (e: any) => config.onChange(e.target.value),
        className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500'
      }, config.options.map((opt: any) => 
        React.createElement('option', { key: opt.value, value: opt.value }, opt.label)
      ))
    )
  }

  private generateSectionHeader(config: any) {
    return React.createElement('div', { className: config.className },
      React.createElement('h2', { className: 'text-4xl font-bold mb-4' }, config.title),
      React.createElement('p', { className: 'text-xl text-gray-600' }, config.subtitle)
    )
  }

  private generateTabs(config: any) {
    return React.createElement('div', {},
      React.createElement('div', { className: 'flex border-b mb-4' },
        config.items.map((tab: any) => 
          React.createElement('button', {
            key: tab.label,
            className: 'px-4 py-2 font-medium hover:text-primary-600'
          }, tab.label)
        )
      ),
      React.createElement('div', {}, config.items[0].content)
    )
  }

  private generateButtonGroup(config: any) {
    return React.createElement('div', { className: 'flex rounded-lg border border-gray-300 overflow-hidden' },
      config.buttons.map((btn: any) => 
        React.createElement('button', {
          key: btn.value,
          className: `px-4 py-2 ${config.selected === btn.value ? 'bg-primary-600 text-white' : 'bg-white hover:bg-gray-50'}`,
          title: btn.label
        }, btn.icon)
      )
    )
  }

  private generateEmptyState(config: any) {
    return React.createElement('div', { className: 'text-center py-16' },
      React.createElement('div', { className: 'text-6xl mb-4' }, config.icon),
      React.createElement('h3', { className: 'text-xl font-semibold mb-2' }, config.title),
      React.createElement('p', { className: 'text-gray-600 mb-6' }, config.description),
      config.actions && React.createElement('div', { className: 'flex gap-3 justify-center' },
        config.actions.map((action: any, i: number) => 
          React.createElement('button', {
            key: i,
            onClick: action.onClick,
            className: 'btn btn-primary'
          }, action.label)
        )
      )
    )
  }

  private generateCTA(config: any) {
    return React.createElement('div', { className: 'text-center' },
      React.createElement('h2', { className: 'text-3xl font-bold text-white mb-4' }, config.title),
      React.createElement('p', { className: 'text-xl text-white/90 mb-8 max-w-2xl mx-auto' }, config.description),
      React.createElement('div', { className: 'flex gap-4 justify-center' },
        config.actions.map((action: any, i: number) => 
          React.createElement('a', {
            key: i,
            href: action.href,
            className: `btn btn-lg ${action.className}`,
            target: action.external ? '_blank' : undefined
          }, action.label)
        )
      )
    )
  }

  private generateFooter(config: any) {
    return React.createElement('footer', { className: config.className },
      React.createElement('div', { className: 'container-custom py-12' },
        React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-8 mb-8' },
          config.sections.map((section: any) => 
            React.createElement('div', { key: section.title },
              React.createElement('h3', { className: 'font-semibold mb-4' }, section.title),
              React.createElement('ul', { className: 'space-y-2' },
                section.links.map((link: any) => 
                  React.createElement('li', { key: link.label },
                    React.createElement('a', { 
                      href: link.href,
                      className: 'text-gray-600 hover:text-gray-900'
                    }, link.label)
                  )
                )
              )
            )
          )
        ),
        config.bottom && React.createElement('div', { className: 'border-t border-gray-200 pt-8 text-center text-sm text-gray-600' },
          React.createElement('p', {}, config.bottom.copyright),
          React.createElement('p', { className: 'mt-2' }, config.bottom.author)
        )
      )
    )
  }

  // Documentation-specific generators
  private generateSidebar(config: any) {
    return React.createElement('aside', { className: config.className },
      React.createElement('nav', { className: 'p-6' },
        config.sections.map((section: any) => 
          React.createElement('div', { key: section.title, className: 'mb-8' },
            React.createElement('h3', { className: 'font-semibold text-gray-900 mb-3' }, section.title),
            React.createElement('ul', { className: 'space-y-2' },
              section.items.map((item: any) => 
                React.createElement('li', { key: item.label },
                  React.createElement('a', {
                    href: item.href,
                    className: `block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 ${item.active ? 'bg-primary-50 text-primary-600 font-medium' : ''}`
                  }, item.label)
                )
              )
            )
          )
        )
      )
    )
  }

  private generatePageHeader(config: any) {
    const breadcrumbElements: any[] = []
    if (config.breadcrumbs) {
      config.breadcrumbs.forEach((crumb: any, i: number) => {
        if (i > 0) {
          breadcrumbElements.push(
            React.createElement('span', { key: `sep-${i}`, className: 'text-gray-400' }, '/')
          )
        }
        breadcrumbElements.push(
          React.createElement('li', { key: crumb.label },
            crumb.href 
              ? React.createElement('a', { href: crumb.href, className: 'text-gray-600 hover:text-gray-900' }, crumb.label)
              : React.createElement('span', { className: 'text-gray-900' }, crumb.label)
          )
        )
      })
    }

    return React.createElement('div', { className: 'mb-8' },
      config.breadcrumbs && React.createElement('nav', { className: 'mb-4' },
        React.createElement('ol', { className: 'flex items-center space-x-2 text-sm' },
          breadcrumbElements
        )
      ),
      React.createElement('h1', { className: 'text-4xl font-bold mb-4' }, config.title),
      React.createElement('p', { className: 'text-xl text-gray-600' }, config.description)
    )
  }

  private generateTableOfContents(config: any) {
    return React.createElement('div', { className: `card p-6 ${config.className}` },
      React.createElement('h3', { className: 'font-semibold mb-4' }, 'On this page'),
      React.createElement('ul', { className: 'space-y-2' },
        config.items.map((item: any) => 
          React.createElement('li', { key: item.label },
            React.createElement('a', {
              href: item.href,
              className: 'text-gray-600 hover:text-primary-600'
            }, item.label)
          )
        )
      )
    )
  }

  private generateSection(config: any) {
    return React.createElement('section', { id: config.id, className: 'mb-12' },
      React.createElement('h2', { className: 'text-2xl font-bold mb-4' }, config.title),
      config.content
    )
  }

  private generateParagraph(config: any) {
    return React.createElement('p', { className: 'text-gray-600 mb-4' }, config.text)
  }

  private generateList(config: any) {
    return React.createElement('ul', { className: 'space-y-2 mb-4' },
      config.items.map((item: string) => 
        React.createElement('li', { key: item, className: 'flex items-start' },
          React.createElement('span', { className: 'text-green-600 mr-2' }, config.type === 'checklist' ? '✓' : '•'),
          React.createElement('span', {}, item)
        )
      )
    )
  }

  private generateCodeBlock(config: any) {
    return React.createElement('div', { className: 'code-block' },
      React.createElement('pre', {},
        React.createElement('code', { className: `language-${config.language}` }, config.code)
      ),
      config.features?.copy && React.createElement('button', { className: 'copy-btn' }, 'Copy')
    )
  }

  private generateAlert(config: any) {
    return React.createElement('div', { 
      className: `rounded-lg p-4 ${config.type === 'info' ? 'bg-blue-50 text-blue-800' : ''} ${config.className}` 
    },
      React.createElement('div', { className: 'font-medium mb-1' }, config.title),
      React.createElement('div', {}, config.content)
    )
  }

  private generateAccordion(config: any) {
    return React.createElement('div', { className: 'space-y-4' },
      config.items.map((item: any) => 
        React.createElement('div', { key: item.title, className: 'card' },
          React.createElement('button', { className: 'w-full px-6 py-4 text-left font-medium' }, item.title),
          React.createElement('div', { className: 'px-6 pb-4' }, item.content)
        )
      )
    )
  }

  private generateCallout(config: any) {
    return React.createElement('div', { 
      className: `rounded-lg p-6 ${config.type === 'success' ? 'bg-green-50' : ''} ${config.className}` 
    },
      React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, config.title),
      React.createElement('p', { className: 'mb-4' }, config.content),
      config.actions && React.createElement('div', { className: 'flex gap-3' },
        config.actions.map((action: any, i: number) => 
          React.createElement('a', {
            key: i,
            href: action.href,
            className: `btn btn-sm ${action.variant === 'primary' ? 'btn-primary' : 'btn-outline'}`
          }, action.label)
        )
      )
    )
  }

  private generateDataTable(config: any) {
    return React.createElement('div', { className: 'overflow-x-auto' },
      React.createElement('table', { className: 'min-w-full' },
        React.createElement('thead', {},
          React.createElement('tr', {},
            config.columns.map((col: any) => 
              React.createElement('th', { 
                key: col.id,
                className: `px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${col.className || ''}`
              }, col.header)
            )
          )
        ),
        React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
          config.data.map((row: any, i: number) => 
            React.createElement('tr', { key: i },
              config.columns.map((col: any) => 
                React.createElement('td', { 
                  key: col.id,
                  className: `px-6 py-4 whitespace-nowrap ${col.className || ''}`
                }, col.cell ? col.cell(row) : row[col.id] || '✅')
              )
            )
          )
        )
      )
    )
  }
}

// Initialize the factory
export const ui = new RevolutionaryUIFactory()

// Helper function for GitHub links
export function getGitHubLink(type: string, path: string) {
  const base = 'https://github.com/siliconyouth/revolutionary-ui-factory-system/tree/main'
  const folders: Record<string, string> = {
    component: 'src/components',
    framework: 'src/frameworks',
    docs: 'docs'
  }
  return `${base}/${folders[type]}/${path}`
}

// Theme configuration
export const marketplaceTheme = {
  spacing: {
    section: 'py-20 sm:py-24',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
  },
  sectionHeader: {
    className: 'text-center mb-12 sm:mb-16'
  }
}

// Marketplace-specific components using Revolutionary UI
export const MarketplaceComponents = {
  Navigation: () => ui.createNavbar({
    logo: { text: 'Revolutionary UI', href: '/' },
    items: [
      { label: 'Components', href: '/components' },
      { label: 'Frameworks', href: '/frameworks' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Docs', href: '/docs' },
      { label: 'Dashboard', href: '/dashboard' }
    ],
    actions: [
      { type: 'github', href: 'https://github.com/siliconyouth/revolutionary-ui-factory-system' },
      { type: 'darkMode' }
    ],
    className: 'glass sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800'
  }),
  
  HeroSection: () => ui.createHero({
    title: 'Discover, share & remix the best UI components',
    subtitle: 'Built by design engineers, loved by vibe coders.',
    actions: [
      { label: 'Browse components', href: '/components', variant: 'primary' },
      { label: 'Integrate in IDE AI Agent', href: '/docs/getting-started', variant: 'outline' }
    ],
    integrations: [
      { name: 'CURSOR', icon: '🖱️' },
      { name: '+', icon: null },
      { name: 'Windsurf', icon: '🏄' },
      { name: 'v0', icon: '⚡' },
      { name: 'bolt', icon: '⚡' },
      { name: 'lovable', icon: '❤️' },
      { name: 'replit', icon: '🔁' }
    ]
  }),
  
  ComponentGrid: (components: any[]) => ui.createGrid({
    columns: { xs: 1, sm: 2, md: 3 },
    gap: 8,
    items: components.map(component => ui.createCard({
      ...component,
      icon: component.icon,
      preview: component.preview
    }))
  }),
  
  StatsSection: (stats: any) => ui.createStats({
    items: [
      { label: 'Components', value: stats.totalComponents, icon: '🧩', trend: '+12' },
      { label: 'Frameworks', value: stats.frameworks, icon: '🔧', trend: '+3' },
      { label: 'Avg. Reduction', value: `${stats.avgReduction}%`, icon: '📉' },
      { label: 'Downloads', value: stats.downloads, icon: '📦', trend: '+24%' }
    ],
    className: 'grid-cols-2 lg:grid-cols-4 gap-6'
  })
}

// Mock function to demonstrate factory capabilities
export function setup(framework: string = 'react', styleSystem: string = 'tailwind') {
  // In the real implementation, this would configure the factory
  // for the specified framework and style system
  return ui
}

// Export type definitions for TypeScript support
export interface UniversalComponentConfig {
  variant?: string
  size?: string
  className?: string
  style?: Record<string, any>
  [key: string]: any
}