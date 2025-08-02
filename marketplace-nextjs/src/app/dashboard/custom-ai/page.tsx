'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi'

interface CustomAIProvider {
  id: string
  name: string
  apiEndpoint: string
  apiKey?: string
  headers?: Record<string, string>
  requestFormat: 'openai' | 'anthropic' | 'custom'
  responseFormat: 'openai' | 'anthropic' | 'custom'
  model?: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  isActive: boolean
}

export default function CustomAIPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [providers, setProviders] = useState<CustomAIProvider[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<CustomAIProvider>>({
    name: '',
    apiEndpoint: '',
    apiKey: '',
    requestFormat: 'openai',
    responseFormat: 'openai',
    model: '',
    temperature: 0.7,
    maxTokens: 1000,
    headers: {},
    systemPrompt: ''
  })
  const [customHeaders, setCustomHeaders] = useState<{ key: string; value: string }[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    } else if (user) {
      loadProviders()
    }
  }, [user, authLoading, router])

  const loadProviders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('user_id', user!.id)
        .like('provider', 'custom-%')
        .order('created_at', { ascending: false })

      if (error) throw error

      const customProviders = data?.map(p => ({
        id: p.id,
        name: p.settings?.name || 'Custom Provider',
        apiEndpoint: p.settings?.apiEndpoint || '',
        apiKey: p.api_key,
        headers: p.settings?.headers || {},
        requestFormat: p.settings?.requestFormat || 'openai',
        responseFormat: p.settings?.responseFormat || 'openai',
        model: p.model,
        systemPrompt: p.settings?.systemPrompt,
        temperature: p.settings?.temperature || 0.7,
        maxTokens: p.settings?.maxTokens || 1000,
        isActive: p.is_active
      })) || []

      setProviders(customProviders)
    } catch (error) {
      console.error('Failed to load custom providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProvider = async () => {
    if (!user || !formData.name || !formData.apiEndpoint) return

    setLoading(true)
    try {
      const providerId = editingId || `custom-${Date.now()}`
      
      // Convert headers array to object
      const headersObj = customHeaders.reduce((acc, { key, value }) => {
        if (key && value) acc[key] = value
        return acc
      }, {} as Record<string, string>)

      const settings = {
        name: formData.name,
        apiEndpoint: formData.apiEndpoint,
        headers: headersObj,
        requestFormat: formData.requestFormat,
        responseFormat: formData.responseFormat,
        systemPrompt: formData.systemPrompt,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens
      }

      if (editingId) {
        // Update existing
        const { error } = await supabase
          .from('ai_providers')
          .update({
            api_key: formData.apiKey,
            model: formData.model || 'custom',
            settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)

        if (error) throw error
      } else {
        // Create new
        const { error } = await supabase
          .from('ai_providers')
          .insert({
            user_id: user.id,
            provider: providerId,
            api_key: formData.apiKey,
            model: formData.model || 'custom',
            settings,
            is_active: false
          })

        if (error) throw error
      }

      // Reset form
      setFormData({
        name: '',
        apiEndpoint: '',
        apiKey: '',
        requestFormat: 'openai',
        responseFormat: 'openai',
        model: '',
        temperature: 0.7,
        maxTokens: 1000,
        headers: {},
        systemPrompt: ''
      })
      setCustomHeaders([])
      setShowForm(false)
      setEditingId(null)
      
      // Reload providers
      await loadProviders()
    } catch (error) {
      console.error('Failed to save provider:', error)
      alert('Failed to save custom provider')
    } finally {
      setLoading(false)
    }
  }

  const deleteProvider = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom provider?')) return

    try {
      const { error } = await supabase
        .from('ai_providers')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadProviders()
    } catch (error) {
      console.error('Failed to delete provider:', error)
      alert('Failed to delete provider')
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_providers')
        .update({ is_active: isActive })
        .eq('id', id)

      if (error) throw error

      await loadProviders()
    } catch (error) {
      console.error('Failed to toggle provider:', error)
    }
  }

  const editProvider = (provider: CustomAIProvider) => {
    setFormData(provider)
    setCustomHeaders(
      Object.entries(provider.headers || {}).map(([key, value]) => ({ key, value }))
    )
    setEditingId(provider.id)
    setShowForm(true)
  }

  const addHeader = () => {
    setCustomHeaders([...customHeaders, { key: '', value: '' }])
  }

  const removeHeader = (index: number) => {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index))
  }

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customHeaders]
    updated[index][field] = value
    setCustomHeaders(updated)
  }

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
              <h1 className="text-xl font-semibold">Custom AI Providers</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <FiPlus /> Add Provider
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-900 mb-2">Bring Your Own AI</h2>
          <p className="text-sm text-blue-700">
            Connect any AI provider that supports OpenAI or Anthropic API formats, or create your own custom integration.
            Your API keys are encrypted and stored securely.
          </p>
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6">
              {editingId ? 'Edit' : 'Add'} Custom Provider
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Custom AI"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Endpoint *
                </label>
                <input
                  type="url"
                  value={formData.apiEndpoint}
                  onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                  placeholder="https://api.example.com/v1/chat/completions"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Name
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="gpt-3.5-turbo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Format
                </label>
                <select
                  value={formData.requestFormat}
                  onChange={(e) => setFormData({ ...formData, requestFormat: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="openai">OpenAI Format</option>
                  <option value="anthropic">Anthropic Format</option>
                  <option value="custom">Custom Format</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Response Format
                </label>
                <select
                  value={formData.responseFormat}
                  onChange={(e) => setFormData({ ...formData, responseFormat: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="openai">OpenAI Format</option>
                  <option value="anthropic">Anthropic Format</option>
                  <option value="custom">Custom Format</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature
                </label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Tokens
                </label>
                <input
                  type="number"
                  min="1"
                  max="32000"
                  value={formData.maxTokens}
                  onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Custom Headers */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Custom Headers
                </label>
                <button
                  onClick={addHeader}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  + Add Header
                </button>
              </div>
              {customHeaders.map((header, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={header.key}
                    onChange={(e) => updateHeader(index, 'key', e.target.value)}
                    placeholder="Header Name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={header.value}
                    onChange={(e) => updateHeader(index, 'value', e.target.value)}
                    placeholder="Header Value"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeHeader(index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            {/* System Prompt */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Prompt (Optional)
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                placeholder="Custom system prompt for component generation..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingId(null)
                  setFormData({
                    name: '',
                    apiEndpoint: '',
                    apiKey: '',
                    requestFormat: 'openai',
                    responseFormat: 'openai',
                    model: '',
                    temperature: 0.7,
                    maxTokens: 1000,
                    headers: {},
                    systemPrompt: ''
                  })
                  setCustomHeaders([])
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={saveProvider}
                disabled={loading || !formData.name || !formData.apiEndpoint}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingId ? 'Update' : 'Save'} Provider
              </button>
            </div>
          </div>
        )}

        {/* Providers List */}
        <div className="space-y-4">
          {providers.length === 0 && !loading && (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No custom providers yet.</p>
              <p className="text-sm text-gray-400 mt-2">
                Add your first custom AI provider to get started.
              </p>
            </div>
          )}

          {providers.map((provider) => (
            <div key={provider.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{provider.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      provider.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {provider.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Endpoint:</span> {provider.apiEndpoint}
                    </div>
                    <div>
                      <span className="font-medium">Format:</span> {provider.requestFormat} → {provider.responseFormat}
                    </div>
                    <div>
                      <span className="font-medium">Model:</span> {provider.model || 'Not specified'}
                    </div>
                    <div>
                      <span className="font-medium">Temperature:</span> {provider.temperature}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(provider.id, !provider.isActive)}
                    className={`p-2 rounded-lg ${
                      provider.isActive
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {provider.isActive ? <FiCheck /> : <FiX />}
                  </button>
                  <button
                    onClick={() => editProvider(provider)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => deleteProvider(provider.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}