'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { getPlanById } from '@/lib/stripe/plans'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)
  const [usage, setUsage] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const supabase = createClient()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    } else if (user) {
      loadSubscriptionData()
      loadAnalyticsData()
    }
  }, [user, loading, router])

  const loadSubscriptionData = async () => {
    // Load subscription
    const { data: subData } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user!.id)
      .single()

    setSubscription(subData)

    // Load usage
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: usageData } = await supabase
      .from('subscription_usage')
      .select('usage_type, count')
      .eq('user_id', user!.id)
      .gte('created_at', startOfMonth.toISOString())

    const componentsUsed = usageData
      ?.filter(u => u.usage_type === 'component_generation')
      .reduce((sum, u) => sum + u.count, 0) || 0

    setUsage({ componentsUsed })
  }

  const loadAnalyticsData = async () => {
    // Mock analytics data - in production, this would come from the AnalyticsManager
    setStats({
      totalComponents: 156,
      totalGenerations: 1234,
      avgCodeReduction: '78%',
      timeSpent: 4320, // minutes
      topComponents: [
        { componentId: 'table-1', name: 'DataTable', uses: 234, codeReduction: '85%', lastUsed: new Date().toISOString() },
        { componentId: 'form-1', name: 'ContactForm', uses: 189, codeReduction: '72%', lastUsed: new Date().toISOString() }
      ]
    })
  }

  if (loading) {
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
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Revolutionary UI Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {profile?.full_name || profile?.email || user.email}
              </span>
              <Link
                href="/dashboard/profile"
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Components</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalComponents}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Code Reduction</p>
                  <p className="text-2xl font-bold text-green-600">{stats.avgCodeReduction}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Time Saved</p>
                  <p className="text-2xl font-bold text-blue-600">{Math.floor(stats.timeSpent / 60)}h</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⏱️</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Generations</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalGenerations}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Component Generator */}
          <Link
            href="/dashboard/generate"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">⚡</span>
              </div>
              <span className="text-sm font-medium text-purple-600">Core</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Component Generator</h3>
            <p className="text-sm text-gray-600">
              Generate UI components with 60-95% code reduction
            </p>
          </Link>

          {/* AI Generator */}
          <Link
            href="/dashboard/ai-generate"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <span className="text-sm font-medium text-blue-600">AI</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Generator</h3>
            <p className="text-sm text-gray-600">
              Create components from natural language descriptions
            </p>
          </Link>

          {/* Visual Builder */}
          <Link
            href="/dashboard/visual-builder"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-transparent hover:border-indigo-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <span className="text-2xl">🎨</span>
              </div>
              <span className="text-sm font-medium text-indigo-600">Visual</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Builder</h3>
            <p className="text-sm text-gray-600">
              Drag & drop interface for building components visually
            </p>
          </Link>

          {/* Visual Builder */}
          <Link
            href="/dashboard/visual-builder"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-transparent hover:border-yellow-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">🎨</span>
              </div>
              <span className="text-sm font-medium text-yellow-600">New</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Builder</h3>
            <p className="text-sm text-gray-600">
              Drag-and-drop component builder
            </p>
          </Link>

          {/* Component Library */}
          <Link
            href="/dashboard/library"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <span className="text-sm font-medium text-green-600">Pro</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Component Library</h3>
            <p className="text-sm text-gray-600">
              Manage your custom component collection
            </p>
          </Link>

          {/* Team Collaboration */}
          <Link
            href="/dashboard/team"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-transparent hover:border-orange-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <span className="text-sm font-medium text-orange-600">Team</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Collaboration</h3>
            <p className="text-sm text-gray-600">
              Invite members and manage permissions
            </p>
          </Link>

          {/* Cloud Sync */}
          <Link
            href="/dashboard/sync"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-transparent hover:border-cyan-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-100 rounded-lg">
                <span className="text-2xl">☁️</span>
              </div>
              <span className="text-sm font-medium text-cyan-600">Pro</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cloud Sync</h3>
            <p className="text-sm text-gray-600">
              Sync components across all your devices
            </p>
          </Link>

          {/* Analytics Dashboard */}
          <Link
            href="/dashboard/analytics"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-transparent hover:border-pink-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <span className="text-sm font-medium text-pink-600">Pro</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600">
              Track usage and performance metrics
            </p>
          </Link>

          {/* Marketplace */}
          <Link
            href="/dashboard/marketplace"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-transparent hover:border-indigo-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <span className="text-2xl">🛍️</span>
              </div>
              <span className="text-sm font-medium text-indigo-600">All</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketplace</h3>
            <p className="text-sm text-gray-600">
              Browse and install premium components
            </p>
          </Link>

          {/* Private Registry */}
          <Link
            href="/dashboard/registry"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-2 border-transparent hover:border-red-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <span className="text-2xl">🔒</span>
              </div>
              <span className="text-sm font-medium text-red-600">Enterprise</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Private Registry</h3>
            <p className="text-sm text-gray-600">
              Host your own component packages
            </p>
          </Link>
        </div>

        {/* Legacy Cards - Keep for backward compatibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Configuration Card */}
          <Link
            href="/dashboard/ai-config"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Configuration</h3>
            <p className="text-sm text-gray-600">
              Configure AI providers, models, and API keys for component generation
            </p>
          </Link>

          {/* Custom AI Providers Card */}
          <Link
            href="/dashboard/custom-ai"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">BYOAI</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom AI Providers</h3>
            <p className="text-sm text-gray-600">
              Bring Your Own AI - Add custom AI providers
            </p>
          </Link>

          {/* Usage & Billing Card */}
          <Link
            href="/dashboard/billing"
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-500">{getPlanById(subscription?.plan || 'free')?.name} Plan</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage & Billing</h3>
            <p className="text-sm text-gray-600">
              Track your AI usage and manage subscription
            </p>
          </Link>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Quick Start Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold">1</span>
                <h3 className="text-lg font-semibold">Configure AI Provider</h3>
              </div>
              <p className="text-sm opacity-90">
                Set up your preferred AI provider and add your API key
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold">2</span>
                <h3 className="text-lg font-semibold">Generate Components</h3>
              </div>
              <p className="text-sm opacity-90">
                Use natural language to describe what you want to build
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold">3</span>
                <h3 className="text-lg font-semibold">Export & Use</h3>
              </div>
              <p className="text-sm opacity-90">
                Copy the generated code and use it in your project
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/playground/ai"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Try AI Playground
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}