'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface LibraryComponent {
  id: string
  name: string
  description: string
  type: string
  framework: string[]
  tags: string[]
  version: string
  author: string
  created: string
  updated: string
  published: boolean
  uses: number
  downloads: number
}

const mockComponents: LibraryComponent[] = [
  {
    id: '1',
    name: 'DataTable',
    description: 'Advanced data table with sorting, filtering, and pagination',
    type: 'table',
    framework: ['react', 'vue'],
    tags: ['table', 'data', 'sorting', 'filtering'],
    version: '2.1.0',
    author: 'John Doe',
    created: '2024-01-15',
    updated: '2024-07-28',
    published: true,
    uses: 234,
    downloads: 1567
  },
  {
    id: '2',
    name: 'ContactForm',
    description: 'Fully validated contact form with email integration',
    type: 'form',
    framework: ['react'],
    tags: ['form', 'contact', 'validation', 'email'],
    version: '1.3.2',
    author: 'Jane Smith',
    created: '2024-02-20',
    updated: '2024-07-25',
    published: true,
    uses: 189,
    downloads: 892
  },
  {
    id: '3',
    name: 'AdminDashboard',
    description: 'Complete admin dashboard layout with sidebar and navigation',
    type: 'dashboard',
    framework: ['react', 'vue', 'angular'],
    tags: ['dashboard', 'admin', 'layout', 'navigation'],
    version: '3.0.0',
    author: 'Admin Team',
    created: '2024-03-10',
    updated: '2024-07-20',
    published: true,
    uses: 145,
    downloads: 2341
  },
  {
    id: '4',
    name: 'ChartWidget',
    description: 'Interactive charts with multiple visualization types',
    type: 'chart',
    framework: ['react'],
    tags: ['chart', 'visualization', 'analytics', 'data'],
    version: '1.8.5',
    author: 'Data Viz Team',
    created: '2024-04-05',
    updated: '2024-07-15',
    published: false,
    uses: 98,
    downloads: 0
  },
  {
    id: '5',
    name: 'UserProfile',
    description: 'User profile component with avatar and social links',
    type: 'profile',
    framework: ['react', 'vue'],
    tags: ['user', 'profile', 'avatar', 'social'],
    version: '1.2.0',
    author: 'UI Team',
    created: '2024-05-12',
    updated: '2024-07-10',
    published: true,
    uses: 67,
    downloads: 456
  }
]

const componentTypes = [
  { id: 'all', name: 'All Types', icon: '📦' },
  { id: 'form', name: 'Forms', icon: '📝' },
  { id: 'table', name: 'Tables', icon: '📊' },
  { id: 'dashboard', name: 'Dashboards', icon: '📈' },
  { id: 'chart', name: 'Charts', icon: '📉' },
  { id: 'profile', name: 'Profiles', icon: '👤' },
  { id: 'other', name: 'Other', icon: '📁' }
]

const frameworks = ['all', 'react', 'vue', 'angular', 'svelte']

export default function LibraryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [components, setComponents] = useState<LibraryComponent[]>(mockComponents)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedFramework, setSelectedFramework] = useState('all')
  const [showOnlyPublished, setShowOnlyPublished] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'uses' | 'updated'>('updated')
  const [selectedComponent, setSelectedComponent] = useState<LibraryComponent | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const filteredComponents = components
    .filter(comp => {
      const matchesSearch = searchQuery === '' || 
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesType = selectedType === 'all' || comp.type === selectedType
      const matchesFramework = selectedFramework === 'all' || comp.framework.includes(selectedFramework)
      const matchesPublished = !showOnlyPublished || comp.published

      return matchesSearch && matchesType && matchesFramework && matchesPublished
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'uses':
          return b.uses - a.uses
        case 'updated':
          return new Date(b.updated).getTime() - new Date(a.updated).getTime()
        default:
          return 0
      }
    })

  const handlePublish = (componentId: string) => {
    setComponents(prev => prev.map(comp => 
      comp.id === componentId ? { ...comp, published: true } : comp
    ))
    alert('Component published successfully!')
  }

  const handleDelete = (componentId: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      setComponents(prev => prev.filter(comp => comp.id !== componentId))
      setSelectedComponent(null)
    }
  }

  const handleShare = (component: LibraryComponent) => {
    navigator.clipboard.writeText(`https://revolutionary-ui.com/library/${component.id}`)
    alert('Share link copied to clipboard!')
  }

  const handleExport = (component: LibraryComponent) => {
    // Mock export
    const exportData = {
      component,
      code: `// ${component.name} Component
import React from 'react'

export const ${component.name} = () => {
  return <div>${component.name} Component</div>
}`,
      metadata: {
        exported: new Date().toISOString(),
        version: component.version
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${component.name.toLowerCase()}-v${component.version}.json`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 mr-4">
                ← Back
              </Link>
              <h1 className="text-xl font-semibold">Component Library</h1>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              + Add Component
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search components..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Component Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Component Type
                </label>
                <div className="space-y-2">
                  {componentTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        selectedType === type.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span>{type.icon}</span>
                      <span className="text-sm">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Framework Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Framework
                </label>
                <select
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {frameworks.map(fw => (
                    <option key={fw} value={fw}>
                      {fw === 'all' ? 'All Frameworks' : fw.charAt(0).toUpperCase() + fw.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Published Filter */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showOnlyPublished}
                    onChange={(e) => setShowOnlyPublished(e.target.checked)}
                    className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Show only published</span>
                </label>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'uses' | 'updated')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="updated">Recently Updated</option>
                  <option value="uses">Most Used</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Component Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredComponents.length} components found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredComponents.map(component => (
                <div
                  key={component.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedComponent(component)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {componentTypes.find(t => t.id === component.type)?.icon || '📦'}
                        </span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{component.name}</h3>
                          <p className="text-sm text-gray-500">v{component.version}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        component.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {component.published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{component.description}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {component.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {component.tags.length > 3 && (
                        <span className="px-2 py-1 text-gray-500 text-xs">
                          +{component.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-500">
                        <span>{component.uses} uses</span>
                        {component.published && <span>{component.downloads} downloads</span>}
                      </div>
                      <div className="flex gap-1">
                        {component.framework.map(fw => (
                          <span key={fw} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            {fw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredComponents.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No components found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Component Detail Modal */}
      {selectedComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedComponent.name}</h2>
                <p className="text-sm text-gray-500">v{selectedComponent.version} by {selectedComponent.author}</p>
              </div>
              <button
                onClick={() => setSelectedComponent(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-600 mb-6">{selectedComponent.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">{new Date(selectedComponent.created).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">{new Date(selectedComponent.updated).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Uses</p>
                <p className="font-medium">{selectedComponent.uses}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Downloads</p>
                <p className="font-medium">{selectedComponent.downloads}</p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Frameworks</h4>
              <div className="flex gap-2">
                {selectedComponent.framework.map(fw => (
                  <span key={fw} className="px-3 py-1 bg-purple-100 text-purple-700 rounded">
                    {fw}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedComponent.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {!selectedComponent.published && (
                <button
                  onClick={() => handlePublish(selectedComponent.id)}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Publish
                </button>
              )}
              <button
                onClick={() => handleShare(selectedComponent)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Share
              </button>
              <button
                onClick={() => handleExport(selectedComponent)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Export
              </button>
              <button
                onClick={() => handleDelete(selectedComponent.id)}
                className="py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Component</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Component Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., DataTable"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe your component..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">📁</div>
                  <p className="text-sm text-gray-600">
                    Drag and drop your component file here
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    or click to browse
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  alert('Component added successfully!')
                }}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add Component
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}