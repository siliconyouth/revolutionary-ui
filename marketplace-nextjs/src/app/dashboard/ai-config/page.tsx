'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AI_PROVIDERS } from '@/lib/ai/providers'
import { createClient } from '@/lib/supabase/client'
import { CheckCircleIcon, XCircleIcon } from 'lucide-react'

interface AIProviderSetting {
  id: string
  provider: string
  api_key?: string
  model: string
  is_active: boolean
}

export default function AIConfigPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [providers, setProviders] = useState<AIProviderSetting[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('openai')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [apiKey, setApiKey] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    } else if (user) {
      loadProviders()
      
      // Check for OAuth callback status
      const params = new URLSearchParams(window.location.search)
      const oauthStatus = params.get('oauth')
      const oauthProvider = params.get('provider')
      
      if (oauthStatus === 'success') {
        alert(`Successfully connected ${oauthProvider} via OAuth!`)
        // Clean up URL
        window.history.replaceState({}, '', '/dashboard/ai-config')
      } else if (oauthStatus === 'error') {
        alert(`Failed to connect ${oauthProvider}. Please try again or use an API key.`)
        // Clean up URL
        window.history.replaceState({}, '', '/dashboard/ai-config')
      }
    }
  }, [user, authLoading, router])

  const loadProviders = async () => {
    const { data, error } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('user_id', user!.id)

    if (!error && data) {
      setProviders(data)
      
      // Set active provider if exists
      const activeProvider = data.find(p => p.is_active)
      if (activeProvider) {
        setSelectedProvider(activeProvider.provider)
        setSelectedModel(activeProvider.model)
      }
    }
  }

  const saveProvider = async () => {
    if (!user || !apiKey || !selectedModel) return

    setLoading(true)
    try {
      // Check if provider already exists
      const existingProvider = providers.find(p => p.provider === selectedProvider)

      if (existingProvider) {
        // Update existing
        const { error } = await supabase
          .from('ai_providers')
          .update({
            api_key: apiKey,
            model: selectedModel,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProvider.id)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('ai_providers')
          .insert({
            user_id: user.id,
            provider: selectedProvider,
            api_key: apiKey,
            model: selectedModel,
            is_active: true,
            settings: {}
          })

        if (error) throw error
      }

      // Deactivate other providers
      await supabase
        .from('ai_providers')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .neq('provider', selectedProvider)

      await loadProviders()
      setApiKey('')
      
      alert('Provider configured successfully!')
    } catch (error: any) {
      alert('Failed to save provider: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testProvider = async (providerId: string) => {
    setTesting(providerId)
    
    try {
      const provider = providers.find(p => p.provider === providerId)
      if (!provider || !provider.api_key) {
        setTestResults({ ...testResults, [providerId]: false })
        return
      }

      // Test the API key
      const response = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: provider.provider,
          apiKey: provider.api_key,
          model: provider.model
        }),
      })

      const data = await response.json()
      setTestResults({ ...testResults, [providerId]: data.valid })
    } catch (error) {
      console.error('Test failed:', error)
      setTestResults({ ...testResults, [providerId]: false })
    } finally {
      setTesting(null)
    }
  }

  const currentProviderConfig = AI_PROVIDERS.find(p => p.id === selectedProvider)

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold">AI Configuration</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Provider Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Select AI Provider</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {AI_PROVIDERS.filter(p => p.id !== 'custom').map(provider => (
              <button
                key={provider.id}
                onClick={() => {
                  setSelectedProvider(provider.id)
                  setSelectedModel(provider.models[0]?.id || '')
                }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedProvider === provider.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-medium text-gray-900">{provider.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {provider.models.length} models available
                </p>
              </button>
            ))}
          </div>

          {/* Model Selection */}
          {currentProviderConfig && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {currentProviderConfig.models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} (Context: {model.context.toLocaleString()} tokens)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* API Key Input or OAuth */}
          <div className="mb-6">
            {currentProviderConfig?.supportsOAuth ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authentication Method
                </label>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => window.location.href = `/api/ai/oauth/${selectedProvider}?action=authorize`}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Connect with OAuth
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or use API key</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Enter your ${currentProviderConfig?.name} API key`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      onClick={saveProvider}
                      disabled={!apiKey || !selectedModel || loading}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={`Enter your ${currentProviderConfig?.name} API key`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={saveProvider}
                    disabled={!apiKey || !selectedModel || loading}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Your credentials are encrypted and stored securely.
            </p>
          </div>
        </div>

        {/* Configured Providers */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Configured Providers</h2>
          
          {providers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No providers configured yet. Add your first provider above.
            </p>
          ) : (
            <div className="space-y-4">
              {providers.map(provider => {
                const config = AI_PROVIDERS.find(p => p.id === provider.provider)
                return (
                  <div
                    key={provider.id}
                    className={`p-4 rounded-lg border-2 ${
                      provider.is_active
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {config?.name || provider.provider}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Model: {provider.model}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {testResults[provider.provider] !== undefined && (
                          <span className="flex items-center gap-1 text-sm">
                            {testResults[provider.provider] ? (
                              <>
                                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                <span className="text-green-600">Working</span>
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="w-4 h-4 text-red-600" />
                                <span className="text-red-600">Failed</span>
                              </>
                            )}
                          </span>
                        )}
                        <button
                          onClick={() => testProvider(provider.provider)}
                          disabled={testing === provider.provider}
                          className="px-4 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg font-medium disabled:opacity-50"
                        >
                          {testing === provider.provider ? 'Testing...' : 'Test'}
                        </button>
                        {provider.is_active && (
                          <span className="px-3 py-1 text-xs bg-green-600 text-white rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bring Your Own AI */}
        <div className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Bring Your Own AI</h3>
          <p className="text-sm opacity-90 mb-4">
            Want to use a custom AI provider or self-hosted model? Configure your own endpoint.
          </p>
          <button 
            onClick={() => router.push('/dashboard/custom-ai')}
            className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Configure Custom Provider
          </button>
        </div>
      </main>
    </div>
  )
}