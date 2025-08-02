'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface RegistryPackage {
  name: string
  version: string
  description: string
  author: string
  published: string
  downloads: number
  private: boolean
  tags: string[]
  deprecated?: boolean
  deprecationMessage?: string
}

interface RegistryStats {
  totalPackages: number
  totalDownloads: number
  totalVersions: number
  storageUsed: string
  lastPublished: string
}

interface AccessToken {
  token: string
  name: string
  created: string
  lastUsed: string
  permissions: string[]
}

const mockPackages: RegistryPackage[] = [
  {
    name: '@revolutionary/ui-table',
    version: '2.1.0',
    description: 'Advanced data table component with built-in features',
    author: 'Revolutionary Team',
    published: new Date(Date.now() - 86400000).toISOString(),
    downloads: 1234,
    private: false,
    tags: ['table', 'data', 'ui']
  },
  {
    name: '@revolutionary/form-builder',
    version: '1.5.3',
    description: 'Dynamic form builder with validation',
    author: 'Revolutionary Team',
    published: new Date(Date.now() - 172800000).toISOString(),
    downloads: 892,
    private: true,
    tags: ['form', 'validation', 'builder']
  },
  {
    name: '@revolutionary/dashboard-kit',
    version: '3.0.0',
    description: 'Complete dashboard component kit',
    author: 'UI Team',
    published: new Date(Date.now() - 259200000).toISOString(),
    downloads: 2341,
    private: false,
    tags: ['dashboard', 'admin', 'kit']
  },
  {
    name: '@revolutionary/charts',
    version: '1.2.0',
    description: 'Chart components with multiple visualization types',
    author: 'Data Team',
    published: new Date(Date.now() - 345600000).toISOString(),
    downloads: 567,
    private: true,
    tags: ['charts', 'visualization', 'data'],
    deprecated: true,
    deprecationMessage: 'Use @revolutionary/charts-v2 instead'
  }
]

const mockStats: RegistryStats = {
  totalPackages: 47,
  totalDownloads: 15678,
  totalVersions: 124,
  storageUsed: '2.3 GB',
  lastPublished: new Date(Date.now() - 3600000).toISOString()
}

const mockTokens: AccessToken[] = [
  {
    token: 'rev-abcd1234...',
    name: 'ci-token',
    created: '2024-06-15',
    lastUsed: '2024-07-31',
    permissions: ['read', 'write', 'publish']
  },
  {
    token: 'rev-efgh5678...',
    name: 'dev-token',
    created: '2024-07-01',
    lastUsed: '2024-07-30',
    permissions: ['read', 'write']
  }
]

export default function RegistryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'packages' | 'tokens' | 'settings'>('packages')
  const [packages, setPackages] = useState<RegistryPackage[]>(mockPackages)
  const [tokens, setTokens] = useState<AccessToken[]>(mockTokens)
  const [searchQuery, setSearchQuery] = useState('')
  const [showPrivateOnly, setShowPrivateOnly] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<RegistryPackage | null>(null)

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = searchQuery === '' ||
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesPrivate = !showPrivateOnly || pkg.private

    return matchesSearch && matchesPrivate
  })

  const handleUnpublish = (packageName: string) => {
    if (confirm(`Are you sure you want to unpublish ${packageName}?`)) {
      setPackages(prev => prev.filter(pkg => pkg.name !== packageName))
      alert(`${packageName} has been unpublished`)
    }
  }

  const handleDeprecate = (packageName: string) => {
    const message = prompt('Enter deprecation message:')
    if (message) {
      setPackages(prev => prev.map(pkg => 
        pkg.name === packageName 
          ? { ...pkg, deprecated: true, deprecationMessage: message }
          : pkg
      ))
      alert(`${packageName} has been deprecated`)
    }
  }

  const handleCreateToken = (name: string, permissions: string[]) => {
    const newToken: AccessToken = {
      token: `rev-${Math.random().toString(36).substr(2, 8)}...`,
      name,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      permissions
    }
    setTokens(prev => [...prev, newToken])
    alert(`Token created: ${newToken.token}`)
  }

  const handleRevokeToken = (tokenName: string) => {
    if (confirm(`Are you sure you want to revoke token "${tokenName}"?`)) {
      setTokens(prev => prev.filter(token => token.name !== tokenName))
      alert('Token revoked successfully')
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return 'Just now'
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
              <h1 className="text-xl font-semibold">Private Registry</h1>
            </div>
            {activeTab === 'packages' && (
              <button
                onClick={() => setShowPublishModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                + Publish Package
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Registry Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-sm text-gray-600">Total Packages</p>
            <p className="text-2xl font-bold text-gray-900">{mockStats.totalPackages}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-sm text-gray-600">Total Downloads</p>
            <p className="text-2xl font-bold text-gray-900">{mockStats.totalDownloads}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-sm text-gray-600">Total Versions</p>
            <p className="text-2xl font-bold text-gray-900">{mockStats.totalVersions}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-sm text-gray-600">Storage Used</p>
            <p className="text-2xl font-bold text-gray-900">{mockStats.storageUsed}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <p className="text-sm text-gray-600">Last Published</p>
            <p className="text-sm font-medium text-gray-900">{formatRelativeTime(mockStats.lastPublished)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('packages')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'packages'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Packages
              </button>
              <button
                onClick={() => setActiveTab('tokens')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'tokens'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Access Tokens
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Packages Tab */}
            {activeTab === 'packages' && (
              <div>
                {/* Search and Filters */}
                <div className="mb-6 flex gap-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search packages..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showPrivateOnly}
                      onChange={(e) => setShowPrivateOnly(e.target.checked)}
                      className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Private only</span>
                  </label>
                </div>

                {/* Package List */}
                <div className="space-y-4">
                  {filteredPackages.map((pkg) => (
                    <div
                      key={pkg.name}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedPackage(pkg)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-gray-900">{pkg.name}</h3>
                            <span className="text-sm text-gray-600">v{pkg.version}</span>
                            {pkg.private && (
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                Private
                              </span>
                            )}
                            {pkg.deprecated && (
                              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                Deprecated
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{pkg.description}</p>
                          {pkg.deprecationMessage && (
                            <p className="text-sm text-yellow-700 mt-1">⚠️ {pkg.deprecationMessage}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>by {pkg.author}</span>
                            <span>•</span>
                            <span>{pkg.downloads} downloads</span>
                            <span>•</span>
                            <span>Published {formatRelativeTime(pkg.published)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!pkg.deprecated && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeprecate(pkg.name)
                              }}
                              className="px-3 py-1 text-sm border border-yellow-300 text-yellow-700 rounded hover:bg-yellow-50"
                            >
                              Deprecate
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUnpublish(pkg.name)
                            }}
                            className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                          >
                            Unpublish
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredPackages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            )}

            {/* Tokens Tab */}
            {activeTab === 'tokens' && (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Manage access tokens for publishing and accessing private packages
                  </p>
                  <button
                    onClick={() => setShowTokenModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Generate New Token
                  </button>
                </div>

                <div className="space-y-4">
                  {tokens.map((token) => (
                    <div key={token.name} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{token.name}</h4>
                          <p className="text-sm text-gray-600 font-mono">{token.token}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Created: {token.created}</span>
                            <span>•</span>
                            <span>Last used: {token.lastUsed}</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {token.permissions.map(perm => (
                              <span key={perm} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                                {perm}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRevokeToken(token.name)}
                          className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Using tokens</h4>
                  <p className="text-sm text-blue-800">Add to your .npmrc file:</p>
                  <pre className="mt-2 p-2 bg-white rounded text-sm font-mono">
                    {`//registry.revolutionary-ui.com/:_authToken=YOUR_TOKEN`}
                  </pre>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Registry Configuration</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registry URL
                      </label>
                      <input
                        type="text"
                        defaultValue="https://registry.revolutionary-ui.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Package Scope
                      </label>
                      <input
                        type="text"
                        defaultValue="@revolutionary"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Access Level
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="restricted">Restricted (Private by default)</option>
                        <option value="public">Public</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Require approval for publishing</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      Save Settings
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">NPM Configuration</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Generate .npmrc configuration for your projects
                  </p>
                  <button
                    onClick={() => {
                      const config = `@revolutionary:registry=https://registry.revolutionary-ui.com
//registry.revolutionary-ui.com/:_authToken=\${REVOLUTIONARY_TOKEN}`
                      navigator.clipboard.writeText(config)
                      alert('.npmrc configuration copied to clipboard!')
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Copy .npmrc Configuration
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Package Detail Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{selectedPackage.name}</h2>
              <button
                onClick={() => setSelectedPackage(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Install</p>
                <pre className="mt-1 p-3 bg-gray-100 rounded text-sm font-mono">
                  npm install {selectedPackage.name}@{selectedPackage.version}
                </pre>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Versions</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <span className="text-sm font-medium">{selectedPackage.version} (latest)</span>
                    <span className="text-xs text-gray-500">{formatRelativeTime(selectedPackage.published)}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm">2.0.0</span>
                    <span className="text-xs text-gray-500">5 days ago</span>
                  </div>
                  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm">1.9.8</span>
                    <span className="text-xs text-gray-500">2 weeks ago</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Tags</p>
                <div className="mt-2 flex gap-2">
                  {selectedPackage.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Package Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Publish Package</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Path
                </label>
                <input
                  type="text"
                  placeholder="./path/to/package"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag
                </label>
                <input
                  type="text"
                  defaultValue="latest"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Level
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                  <option value="restricted">Restricted (Team only)</option>
                  <option value="public">Public</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Dry run (preview without publishing)</span>
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPublishModal(false)
                  alert('Package published successfully!')
                }}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Token Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Access Token</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., ci-token"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" />
                    <span className="text-sm">Read packages</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" />
                    <span className="text-sm">Write packages</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" />
                    <span className="text-sm">Publish packages</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowTokenModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleCreateToken('new-token', ['read', 'write', 'publish'])
                  setShowTokenModal(false)
                }}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Generate Token
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}