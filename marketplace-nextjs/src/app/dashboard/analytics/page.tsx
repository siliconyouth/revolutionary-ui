'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface ComponentMetrics {
  componentId: string
  name: string
  uses: number
  lastUsed: string
  avgGenerationTime: number
  codeReduction: string
}

interface UsageStats {
  totalComponents: number
  totalGenerations: number
  avgCodeReduction: string
  topComponents: ComponentMetrics[]
  timeSpent: number
}

interface DailyBreakdown {
  date: string
  generations: number
  components: number
  codeReduction: string
}

const mockStats: UsageStats = {
  totalComponents: 156,
  totalGenerations: 1234,
  avgCodeReduction: '78%',
  timeSpent: 4320, // minutes
  topComponents: [
    {
      componentId: 'table-1',
      name: 'DataTable',
      uses: 234,
      lastUsed: new Date().toISOString(),
      avgGenerationTime: 1.2,
      codeReduction: '85%'
    },
    {
      componentId: 'form-1',
      name: 'ContactForm',
      uses: 189,
      lastUsed: new Date(Date.now() - 86400000).toISOString(),
      avgGenerationTime: 0.8,
      codeReduction: '72%'
    },
    {
      componentId: 'dashboard-1',
      name: 'AdminDashboard',
      uses: 145,
      lastUsed: new Date(Date.now() - 172800000).toISOString(),
      avgGenerationTime: 2.1,
      codeReduction: '79%'
    },
    {
      componentId: 'chart-1',
      name: 'AnalyticsChart',
      uses: 98,
      lastUsed: new Date(Date.now() - 259200000).toISOString(),
      avgGenerationTime: 1.5,
      codeReduction: '68%'
    },
    {
      componentId: 'modal-1',
      name: 'ConfirmModal',
      uses: 76,
      lastUsed: new Date(Date.now() - 345600000).toISOString(),
      avgGenerationTime: 0.5,
      codeReduction: '81%'
    }
  ]
}

const generateDailyData = (days: number): DailyBreakdown[] => {
  const data: DailyBreakdown[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000)
    data.push({
      date: date.toISOString().split('T')[0],
      generations: Math.floor(Math.random() * 50) + 10,
      components: Math.floor(Math.random() * 10) + 1,
      codeReduction: `${Math.floor(Math.random() * 20) + 70}%`
    })
  }
  return data
}

const frameworkStats = {
  react: 456,
  vue: 234,
  angular: 123,
  svelte: 89,
  solid: 45
}

const featureUsage = {
  typescript: 789,
  styling: 654,
  testing: 432,
  accessibility: 321,
  animations: 210
}

export default function AnalyticsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [stats, setStats] = useState<UsageStats>(mockStats)
  const [dailyData, setDailyData] = useState<DailyBreakdown[]>([])
  const [selectedMetric, setSelectedMetric] = useState<'generations' | 'components' | 'reduction'>('generations')
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json')

  useEffect(() => {
    // Generate daily data based on period
    const days = period === 'week' ? 7 : period === 'year' ? 365 : 30
    setDailyData(generateDailyData(days))
  }, [period])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  const getInsights = () => {
    const insights = []
    
    if (parseFloat(stats.avgCodeReduction) > 75) {
      insights.push({
        type: 'success',
        message: `Excellent efficiency! You're achieving ${stats.avgCodeReduction} code reduction on average.`,
        icon: '🎯'
      })
    }
    
    if (stats.topComponents.length > 0) {
      const mostUsed = stats.topComponents[0]
      insights.push({
        type: 'info',
        message: `Your most used component is ${mostUsed.name} with ${mostUsed.uses} generations.`,
        icon: '⭐'
      })
    }
    
    if (stats.timeSpent > 0) {
      const hoursSaved = Math.floor(stats.timeSpent / 60)
      insights.push({
        type: 'success',
        message: `You've saved approximately ${hoursSaved} hours of development time.`,
        icon: '⏱️'
      })
    }
    
    if (stats.totalGenerations > 1000) {
      insights.push({
        type: 'achievement',
        message: `Power user! You've generated over ${stats.totalGenerations} components.`,
        icon: '🚀'
      })
    }
    
    return insights
  }

  const handleExport = () => {
    const data = {
      stats,
      dailyBreakdown: dailyData,
      frameworkStats,
      featureUsage,
      exportDate: new Date().toISOString()
    }
    
    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.json`
      a.click()
    } else {
      // CSV export
      let csv = 'Date,Generations,Components,Code Reduction\n'
      dailyData.forEach(day => {
        csv += `${day.date},${day.generations},${day.components},${day.codeReduction}\n`
      })
      
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    }
  }

  const getChartHeight = (value: number, max: number) => {
    return `${(value / max) * 100}%`
  }

  const maxGenerations = Math.max(...dailyData.map(d => d.generations))

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
              <h1 className="text-xl font-semibold">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Period Selector */}
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}
                className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="year">Last year</option>
              </select>
              
              {/* Export Button */}
              <div className="flex items-center gap-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'json' | 'csv')}
                  className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
                <button
                  onClick={handleExport}
                  className="px-4 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Components</p>
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalComponents}</p>
            <p className="text-xs text-green-600 mt-1">+12% from last {period}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Generations</p>
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalGenerations}</p>
            <p className="text-xs text-green-600 mt-1">+23% from last {period}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Avg Code Reduction</p>
              <span className="text-2xl">📉</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.avgCodeReduction}</p>
            <p className="text-xs text-gray-600 mt-1">Efficiency score</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Time Saved</p>
              <span className="text-2xl">⏱️</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatTime(stats.timeSpent)}</p>
            <p className="text-xs text-gray-600 mt-1">Development time</p>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h2>
          <div className="space-y-3">
            {getInsights().map((insight, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-2xl">{insight.icon}</span>
                <p className="text-sm text-gray-700">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Activity Overview</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMetric('generations')}
                className={`px-3 py-1 text-sm rounded-lg ${
                  selectedMetric === 'generations'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Generations
              </button>
              <button
                onClick={() => setSelectedMetric('components')}
                className={`px-3 py-1 text-sm rounded-lg ${
                  selectedMetric === 'components'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Components
              </button>
              <button
                onClick={() => setSelectedMetric('reduction')}
                className={`px-3 py-1 text-sm rounded-lg ${
                  selectedMetric === 'reduction'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Code Reduction
              </button>
            </div>
          </div>
          
          {/* Simple Chart */}
          <div className="h-64 flex items-end gap-1">
            {dailyData.slice(-30).map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-purple-500 rounded-t transition-all duration-300 hover:bg-purple-600"
                  style={{ 
                    height: getChartHeight(
                      selectedMetric === 'generations' ? day.generations :
                      selectedMetric === 'components' ? day.components * 10 :
                      parseFloat(day.codeReduction), 
                      selectedMetric === 'reduction' ? 100 : maxGenerations
                    )
                  }}
                />
                {index % 5 === 0 && (
                  <span className="text-xs text-gray-500 mt-1">
                    {new Date(day.date).getDate()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Components */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Components</h2>
            <div className="space-y-4">
              {stats.topComponents.map((component, index) => (
                <div key={component.componentId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-gray-500">#{index + 1}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{component.name}</h4>
                      <p className="text-sm text-gray-600">
                        {component.uses} uses • {component.codeReduction} reduction
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {component.avgGenerationTime}s
                    </p>
                    <p className="text-xs text-gray-500">avg time</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Framework Usage */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Framework Usage</h2>
            <div className="space-y-4">
              {Object.entries(frameworkStats).map(([framework, count]) => (
                <div key={framework}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{framework}</span>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(count / Math.max(...Object.values(frameworkStats))) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Usage */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(featureUsage).map(([feature, count]) => (
              <div key={feature} className="text-center">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-purple-600">
                    {Math.round((count / Math.max(...Object.values(featureUsage))) * 100)}%
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 capitalize">{feature}</p>
                <p className="text-xs text-gray-500">{count} uses</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}