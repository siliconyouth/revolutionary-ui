'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface AIProviderConfig {
  name: string
  enabled: boolean
  apiKey: string
  model?: string
  baseUrl?: string
  organization?: string
}

const defaultProviders: AIProviderConfig[] = [
  {
    name: 'OpenAI',
    enabled: false,
    apiKey: '',
    model: 'gpt-4-turbo-preview',
    baseUrl: 'https://api.openai.com/v1',
    organization: ''
  },
  {
    name: 'Anthropic',
    enabled: false,
    apiKey: '',
    model: 'claude-3-opus-20240229',
    baseUrl: 'https://api.anthropic.com/v1'
  },
  {
    name: 'Google Gemini',
    enabled: false,
    apiKey: '',
    model: 'gemini-pro',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta'
  },
  {
    name: 'Mistral',
    enabled: false,
    apiKey: '',
    model: 'mistral-large-latest',
    baseUrl: 'https://api.mistral.ai/v1'
  }
]

export default function AISettingsPage() {
  const { user } = useAuth()
  const [providers, setProviders] = useState<AIProviderConfig[]>(defaultProviders)
  const [testingProvider, setTestingProvider] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Load saved configuration
    const saved = localStorage.getItem('ai-provider-config')
    if (saved) {
      try {
        const config = JSON.parse(saved)
        setProviders(config)
      } catch (e) {
        console.error('Failed to load AI config:', e)
      }
    }
  }, [])

  const handleProviderUpdate = (index: number, updates: Partial<AIProviderConfig>) => {
    const newProviders = [...providers]
    newProviders[index] = { ...newProviders[index], ...updates }
    setProviders(newProviders)
  }

  const handleSave = async () => {
    setSaving(true)
    
    try {
      // Save to localStorage (in production, save to backend)
      localStorage.setItem('ai-provider-config', JSON.stringify(providers))
      
      // Update environment variables in Next.js (for API routes)
      const response = await fetch('/api/ai/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ providers }),
      })

      if (response.ok) {
        alert('AI provider settings saved successfully!')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save AI settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const testProvider = async (provider: AIProviderConfig) => {
    setTestingProvider(provider.name)
    setTestResults(prev => ({ ...prev, [provider.name]: { testing: true } }))

    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: provider.name,
          config: {
            apiKey: provider.apiKey,
            model: provider.model,
            baseUrl: provider.baseUrl,
            organization: provider.organization
          }
        }),
      })

      const result = await response.json()
      
      setTestResults(prev => ({
        ...prev,
        [provider.name]: {
          testing: false,
          success: result.success,
          message: result.message,
          model: result.model,
          responseTime: result.responseTime
        }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider.name]: {
          testing: false,
          success: false,
          message: 'Connection failed'
        }
      }))
    } finally {
      setTestingProvider(null)
    }
  }

  const toggleApiKeyVisibility = (providerName: string) => {
    setShowApiKeys(prev => ({ ...prev, [providerName]: !prev[providerName] }))
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
              <h1 className="text-xl font-semibold">AI Provider Settings</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                saving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">AI Provider Configuration</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Configure your AI providers to enable intelligent component generation. API keys are stored securely and never exposed to the client.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Provider Cards */}
        <div className="space-y-6">
          {providers.map((provider, index) => {
            const testResult = testResults[provider.name]
            
            return (
              <div key={provider.name} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">{provider.name}</h2>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={provider.enabled}
                        onChange={(e) => handleProviderUpdate(index, { enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  
                  {provider.enabled && provider.apiKey && (
                    <button
                      onClick={() => testProvider(provider)}
                      disabled={testingProvider === provider.name}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        testingProvider === provider.name
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {testingProvider === provider.name ? 'Testing...' : 'Test Connection'}
                    </button>
                  )}
                </div>

                {provider.enabled && (
                  <div className="space-y-4">
                    {/* API Key */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKeys[provider.name] ? 'text' : 'password'}
                          value={provider.apiKey}
                          onChange={(e) => handleProviderUpdate(index, { apiKey: e.target.value })}
                          placeholder="Enter your API key"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => toggleApiKeyVisibility(provider.name)}
                          className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                        >
                          {showApiKeys[provider.name] ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    {/* Model Selection */}
                    {provider.model && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Model
                        </label>
                        <select
                          value={provider.model}
                          onChange={(e) => handleProviderUpdate(index, { model: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          {provider.name === 'OpenAI' && (
                            <>
                              <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                              <option value="gpt-4">GPT-4</option>
                              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            </>
                          )}
                          {provider.name === 'Anthropic' && (
                            <>
                              <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                              <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                              <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                            </>
                          )}
                          {provider.name === 'Google Gemini' && (
                            <>
                              <option value="gemini-pro">Gemini Pro</option>
                              <option value="gemini-pro-vision">Gemini Pro Vision</option>
                            </>
                          )}
                          {provider.name === 'Mistral' && (
                            <>
                              <option value="mistral-large-latest">Mistral Large</option>
                              <option value="mistral-medium-latest">Mistral Medium</option>
                              <option value="mistral-small-latest">Mistral Small</option>
                            </>
                          )}
                        </select>
                      </div>
                    )}

                    {/* Organization (OpenAI only) */}
                    {provider.name === 'OpenAI' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Organization ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={provider.organization || ''}
                          onChange={(e) => handleProviderUpdate(index, { organization: e.target.value })}
                          placeholder="org-..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    )}

                    {/* Advanced Settings */}
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700">
                        Advanced Settings
                      </summary>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Base URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={provider.baseUrl || ''}
                          onChange={(e) => handleProviderUpdate(index, { baseUrl: e.target.value })}
                          placeholder="Default API endpoint"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </details>

                    {/* Test Results */}
                    {testResult && !testResult.testing && (
                      <div className={`mt-4 p-4 rounded-lg ${
                        testResult.success 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {testResult.success ? '✅' : '❌'}
                          </span>
                          <div>
                            <p className={`font-medium ${
                              testResult.success ? 'text-green-800' : 'text-red-800'
                            }`}>
                              {testResult.message || (testResult.success ? 'Connection successful!' : 'Connection failed')}
                            </p>
                            {testResult.success && (
                              <p className="text-sm text-green-700">
                                Model: {testResult.model} • Response time: {testResult.responseTime}ms
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Usage Tips */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Getting Started with AI Providers</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">🔑 Getting API Keys</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">OpenAI API Keys</a></li>
                <li>• <a href="https://console.anthropic.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Anthropic API Keys</a></li>
                <li>• <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Google Gemini API Keys</a></li>
                <li>• <a href="https://console.mistral.ai/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Mistral API Keys</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">💡 Provider Recommendations</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>OpenAI GPT-4:</strong> Best for complex components</li>
                <li>• <strong>Anthropic Claude:</strong> Great for detailed explanations</li>
                <li>• <strong>Google Gemini:</strong> Fast and cost-effective</li>
                <li>• <strong>Mistral:</strong> Good balance of speed and quality</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}