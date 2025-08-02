'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface SyncStatus {
  lastSync: string
  localChanges: number
  remoteChanges: number
  conflicts: string[]
}

interface SyncableItem {
  id: string
  type: 'component' | 'config' | 'template'
  name: string
  localPath: string
  checksum: string
  modifiedAt: string
  status?: 'synced' | 'modified' | 'new' | 'conflict'
}

const mockSyncStatus: SyncStatus = {
  lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  localChanges: 5,
  remoteChanges: 3,
  conflicts: []
}

const mockLocalItems: SyncableItem[] = [
  {
    id: '1',
    type: 'component',
    name: 'DataTable',
    localPath: './src/components/DataTable.tsx',
    checksum: 'abc123',
    modifiedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'modified'
  },
  {
    id: '2',
    type: 'component',
    name: 'UserForm',
    localPath: './src/components/UserForm.tsx',
    checksum: 'def456',
    modifiedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    status: 'modified'
  },
  {
    id: '3',
    type: 'template',
    name: 'DashboardLayout',
    localPath: './src/templates/Dashboard.tsx',
    checksum: 'ghi789',
    modifiedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    status: 'new'
  },
  {
    id: '4',
    type: 'config',
    name: 'FactoryConfig',
    localPath: './factory.config.json',
    checksum: 'jkl012',
    modifiedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    status: 'new'
  },
  {
    id: '5',
    type: 'component',
    name: 'ChartWidget',
    localPath: './src/components/ChartWidget.tsx',
    checksum: 'mno345',
    modifiedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    status: 'modified'
  }
]

const mockRemoteItems: SyncableItem[] = [
  {
    id: 'r1',
    type: 'component',
    name: 'RemoteTable',
    localPath: './src/components/RemoteTable.tsx',
    checksum: 'remote123',
    modifiedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'new'
  },
  {
    id: 'r2',
    type: 'template',
    name: 'AdminTemplate',
    localPath: './src/templates/Admin.tsx',
    checksum: 'remote456',
    modifiedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    status: 'new'
  },
  {
    id: 'r3',
    type: 'component',
    name: 'SharedModal',
    localPath: './src/components/SharedModal.tsx',
    checksum: 'remote789',
    modifiedAt: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
    status: 'new'
  }
]

export default function CloudSyncPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(mockSyncStatus)
  const [localItems, setLocalItems] = useState<SyncableItem[]>(mockLocalItems)
  const [remoteItems, setRemoteItems] = useState<SyncableItem[]>(mockRemoteItems)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [syncing, setSyncing] = useState(false)
  const [syncDirection, setSyncDirection] = useState<'push' | 'pull'>('push')
  const [showConflictModal, setShowConflictModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'local' | 'remote'>('local')

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = () => {
    const items = activeTab === 'local' ? localItems : remoteItems
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(items.map(item => item.id)))
    }
  }

  const handleSync = async () => {
    if (selectedItems.size === 0) {
      alert('Please select items to sync')
      return
    }

    setSyncing(true)
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update sync status
    setSyncStatus({
      ...syncStatus,
      lastSync: new Date().toISOString(),
      localChanges: syncDirection === 'push' ? 0 : syncStatus.localChanges,
      remoteChanges: syncDirection === 'pull' ? 0 : syncStatus.remoteChanges
    })
    
    // Clear selections
    setSelectedItems(new Set())
    setSyncing(false)
    
    alert(`Successfully ${syncDirection === 'push' ? 'pushed' : 'pulled'} ${selectedItems.size} items`)
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'synced': return 'text-green-600 bg-green-100'
      case 'modified': return 'text-yellow-600 bg-yellow-100'
      case 'new': return 'text-blue-600 bg-blue-100'
      case 'conflict': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'component': return '📦'
      case 'template': return '📄'
      case 'config': return '⚙️'
      default: return '📄'
    }
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
              <h1 className="text-xl font-semibold">Cloud Sync</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sync Status Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sync Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Last Sync</p>
              <p className="text-lg font-medium text-gray-900">
                {formatRelativeTime(syncStatus.lastSync)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Local Changes</p>
              <p className="text-lg font-medium text-blue-600">
                {syncStatus.localChanges} pending
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Remote Changes</p>
              <p className="text-lg font-medium text-green-600">
                {syncStatus.remoteChanges} available
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Conflicts</p>
              <p className="text-lg font-medium text-red-600">
                {syncStatus.conflicts.length} to resolve
              </p>
            </div>
          </div>

          {syncStatus.conflicts.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                ⚠️ You have {syncStatus.conflicts.length} conflict{syncStatus.conflicts.length > 1 ? 's' : ''} to resolve before syncing.
              </p>
              <button
                onClick={() => setShowConflictModal(true)}
                className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
              >
                Resolve Conflicts
              </button>
            </div>
          )}
        </div>

        {/* Sync Direction Toggle */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Direction</h3>
          
          <div className="flex gap-4">
            <button
              onClick={() => setSyncDirection('push')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                syncDirection === 'push'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">⬆️</div>
              <h4 className="font-medium text-gray-900">Push to Cloud</h4>
              <p className="text-sm text-gray-600 mt-1">
                Upload local changes to cloud storage
              </p>
            </button>
            
            <button
              onClick={() => setSyncDirection('pull')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                syncDirection === 'pull'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">⬇️</div>
              <h4 className="font-medium text-gray-900">Pull from Cloud</h4>
              <p className="text-sm text-gray-600 mt-1">
                Download remote changes to local
              </p>
            </button>
          </div>
        </div>

        {/* Items to Sync */}
        <div className="bg-white rounded-xl shadow-sm">
          {/* Tabs */}
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => {
                  setActiveTab('local')
                  setSelectedItems(new Set())
                }}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'local'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Local Changes ({localItems.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('remote')
                  setSelectedItems(new Set())
                }}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'remote'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Remote Changes ({remoteItems.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Select All / Actions */}
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.size === (activeTab === 'local' ? localItems : remoteItems).length}
                  onChange={handleSelectAll}
                  className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Select All</span>
              </label>
              
              <button
                onClick={handleSync}
                disabled={selectedItems.size === 0 || syncing}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedItems.size === 0 || syncing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {syncing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Syncing...
                  </span>
                ) : (
                  `${syncDirection === 'push' ? 'Push' : 'Pull'} Selected (${selectedItems.size})`
                )}
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              {(activeTab === 'local' ? localItems : remoteItems).map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center p-4 rounded-lg border transition-all ${
                    selectedItems.has(item.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="mr-4 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.localPath}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(item.modifiedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {(activeTab === 'local' ? localItems : remoteItems).length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">
                  {activeTab === 'local' ? '✨' : '☁️'}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab === 'local' ? 'local' : 'remote'} changes
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'local' 
                    ? 'All your components are synced with the cloud'
                    : 'No new updates available from the cloud'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Conflict Resolution Modal */}
      {showConflictModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resolve Conflicts</h2>
            
            <p className="text-gray-600 mb-6">
              Choose how to resolve conflicts between local and remote versions:
            </p>
            
            <div className="space-y-3">
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50">
                <h4 className="font-medium text-gray-900">Keep Local Version</h4>
                <p className="text-sm text-gray-600">Use your local changes and overwrite remote</p>
              </button>
              
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50">
                <h4 className="font-medium text-gray-900">Keep Remote Version</h4>
                <p className="text-sm text-gray-600">Use remote changes and overwrite local</p>
              </button>
              
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50">
                <h4 className="font-medium text-gray-900">Merge Changes</h4>
                <p className="text-sm text-gray-600">Combine both versions (when possible)</p>
              </button>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConflictModal(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConflictModal(false)
                  setSyncStatus({ ...syncStatus, conflicts: [] })
                }}
                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Apply Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}