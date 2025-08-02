'use client'

import Link from 'next/link'
import { useState } from 'react'
import Navigation from '@/components/Navigation'
import { frameworks, categories, getComponentsByCategory } from '@/data/components-v2'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface ComponentDetailProps {
  component: any
}

export default function ComponentDetail({ component }: ComponentDetailProps) {
  const [selectedFramework, setSelectedFramework] = useState('react')
  const [copiedCode, setCopiedCode] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const category = categories.find(c => c.id === component.category)
  const relatedComponents = getComponentsByCategory(component.category).filter((c: any) => c.id !== component.id).slice(0, 3)

  const copyToClipboard = () => {
    const code = component.codeExamples?.[selectedFramework] || ''
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-purple-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/components" className="hover:text-purple-600 transition-colors">Components</Link>
            <span>/</span>
            <span className="text-gray-900">{component.name}</span>
          </div>
          
          <div className="flex items-start gap-6 mb-8">
            <div className="text-6xl">{component.icon}</div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{component.name}</h1>
              <p className="text-xl text-gray-600 mb-4">{component.description}</p>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Category:</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {category?.icon} {category?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Author:</span>
                  <span className="text-sm font-medium">{component.author || 'Vladimir Dukelic'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Added:</span>
                  <span className="text-sm">{new Date(component.dateAdded || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{component.reduction}%</div>
              <div className="text-sm text-gray-600">Code Reduction</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">{component.factoryLines}</div>
              <div className="text-sm text-gray-600">Factory Lines</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">{component.traditionalLines}</div>
              <div className="text-sm text-gray-600">Traditional Lines</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">{component.frameworks.length}</div>
              <div className="text-sm text-gray-600">Frameworks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-8">
                <nav className="flex gap-8">
                  {['overview', 'code', 'features', 'documentation'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 text-sm font-medium capitalize transition-colors relative ${
                        activeTab === tab
                          ? 'text-purple-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="prose prose-lg max-w-none">
                  <h2>Overview</h2>
                  <p>{component.description}</p>
                  
                  <h3>Key Benefits</h3>
                  <ul>
                    <li><strong>{component.reduction}% code reduction</strong> compared to traditional implementation</li>
                    <li>Only <strong>{component.factoryLines} lines</strong> instead of {component.traditionalLines} lines</li>
                    <li>Works with {component.frameworks.length} frameworks out of the box</li>
                    <li>Production-ready with all features included</li>
                  </ul>
                  
                  <h3>Supported Frameworks</h3>
                  <div className="flex items-center gap-3 not-prose mt-4">
                    {component.frameworks.map((fw: string) => {
                      const framework = frameworks.find(f => f.id === fw)
                      return (
                        <div
                          key={fw}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg border"
                          style={{ borderColor: framework?.color, backgroundColor: framework?.color + '10' }}
                        >
                          <span className="text-2xl">{framework?.icon}</span>
                          <span className="font-medium">{framework?.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'code' && (
                <div>
                  {/* Framework Selector */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm text-gray-600">Framework:</span>
                    <div className="flex gap-2">
                      {component.frameworks.map((fw: string) => {
                        const framework = frameworks.find(f => f.id === fw)
                        return (
                          <button
                            key={fw}
                            onClick={() => setSelectedFramework(fw)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              selectedFramework === fw
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {framework?.icon} {framework?.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Code Example */}
                  <div className="relative">
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        onClick={copyToClipboard}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        {copiedCode ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy Code
                          </>
                        )}
                      </button>
                    </div>
                    
                    <SyntaxHighlighter
                      language={selectedFramework === 'vue' ? 'vue' : 'javascript'}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.75rem',
                        fontSize: '14px',
                        padding: '2rem',
                      }}
                    >
                      {component.codeExamples?.[selectedFramework] || '// Code example not available for this framework'}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}

              {activeTab === 'features' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {component.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {component.tags && (
                    <>
                      <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {component.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'documentation' && (
                <div className="prose prose-lg max-w-none">
                  <h2>Documentation</h2>
                  <p>Complete documentation for the {component.name} component.</p>
                  
                  <h3>Installation</h3>
                  <pre><code>npm install @revolutionary-ui/factory</code></pre>
                  
                  <h3>Basic Usage</h3>
                  <p>Import and use the factory to create your component:</p>
                  <pre><code>{`import { ui } from '@revolutionary-ui/factory'

const My${component.name} = ui.create${component.name}({
  // Your configuration here
})`}</code></pre>
                  
                  <h3>Configuration Options</h3>
                  <p>The factory accepts various configuration options to customize the component's behavior and appearance.</p>
                  
                  <h3>Examples</h3>
                  <p>Check out the code examples in the "Code" tab for framework-specific implementations.</p>
                  
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg not-prose">
                    <p className="text-sm text-blue-800">
                      <strong>Need more help?</strong> Check out our{' '}
                      <Link href={component.documentationUrl || '/docs'} className="underline hover:no-underline">
                        full documentation
                      </Link>{' '}
                      or{' '}
                      <a href={component.githubPath || '#'} className="underline hover:no-underline" target="_blank" rel="noopener noreferrer">
                        view on GitHub
                      </a>.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Get Started</h3>
                <div className="space-y-3">
                  <Link
                    href={`/playground/ai?component=${component.id}`}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Try in AI Playground
                  </Link>
                  
                  {component.demoUrl && (
                    <a
                      href={component.demoUrl}
                      className="w-full px-4 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Live Demo
                    </a>
                  )}
                  
                  <a
                    href={component.githubPath || '#'}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    View on GitHub
                  </a>
                </div>
              </div>

              {/* Related Components */}
              {relatedComponents.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Related Components</h3>
                  <div className="space-y-4">
                    {relatedComponents.map((related: any) => (
                      <Link
                        key={related.id}
                        href={`/components/${related.id}`}
                        className="block group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{related.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                              {related.name}
                            </h4>
                            <p className="text-sm text-gray-500">{related.reduction}% reduction</p>
                          </div>
                          <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
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