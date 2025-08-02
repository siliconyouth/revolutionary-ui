'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

// Mock component templates based on our CLI
const componentTypes = [
  { id: 'form', name: 'Form', icon: '📝', description: 'Contact forms, login forms, surveys' },
  { id: 'table', name: 'Data Table', icon: '📊', description: 'Tables with sorting, filtering, pagination' },
  { id: 'dashboard', name: 'Dashboard', icon: '📈', description: 'Analytics dashboards with charts' },
  { id: 'kanban', name: 'Kanban Board', icon: '📋', description: 'Drag-and-drop task boards' },
  { id: 'chat', name: 'Chat Interface', icon: '💬', description: 'Real-time messaging UI' },
  { id: 'card', name: 'Card Grid', icon: '🃏', description: 'Product cards, user profiles' },
  { id: 'timeline', name: 'Timeline', icon: '📅', description: 'Event timelines, activity feeds' },
  { id: 'gallery', name: 'Gallery', icon: '🖼️', description: 'Image galleries with lightbox' },
]

const frameworks = [
  { id: 'react', name: 'React', icon: '⚛️' },
  { id: 'vue', name: 'Vue', icon: '💚' },
  { id: 'angular', name: 'Angular', icon: '🅰️' },
  { id: 'svelte', name: 'Svelte', icon: '🔥' },
]

const stylingOptions = [
  { id: 'tailwind', name: 'Tailwind CSS' },
  { id: 'styled-components', name: 'Styled Components' },
  { id: 'css-modules', name: 'CSS Modules' },
  { id: 'emotion', name: 'Emotion' },
]

export default function GeneratePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState('')
  const [selectedFramework, setSelectedFramework] = useState('react')
  const [selectedStyling, setSelectedStyling] = useState('tailwind')
  const [componentName, setComponentName] = useState('')
  const [features, setFeatures] = useState<string[]>([])
  const [generating, setGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [metrics, setMetrics] = useState<any>(null)

  const featureOptions = {
    form: ['Validation', 'Error Handling', 'File Upload', 'Multi-step', 'Auto-save'],
    table: ['Sorting', 'Filtering', 'Pagination', 'Row Selection', 'Export'],
    dashboard: ['Charts', 'Real-time Updates', 'Filters', 'Dark Mode', 'Responsive'],
    kanban: ['Drag & Drop', 'Card Editing', 'Categories', 'Search', 'Assignments'],
    chat: ['Real-time', 'File Sharing', 'Typing Indicators', 'Reactions', 'Threads'],
    card: ['Hover Effects', 'Loading States', 'Actions', 'Grid Layout', 'Filtering'],
    timeline: ['Vertical/Horizontal', 'Grouping', 'Filtering', 'Zoom', 'Export'],
    gallery: ['Lightbox', 'Lazy Loading', 'Filters', 'Categories', 'Download'],
  }

  const handleGenerate = async () => {
    if (!selectedType || !componentName) {
      alert('Please select a component type and enter a name')
      return
    }

    setGenerating(true)

    // Simulate generation with mock data
    setTimeout(() => {
      const mockCode = generateMockCode()
      setGeneratedCode(mockCode)
      setMetrics({
        linesOfCode: 245,
        reduction: 78,
        timeEstimate: '3 hours',
        complexity: 'Medium'
      })
      setGenerating(false)
    }, 2000)
  }

  const generateMockCode = () => {
    if (selectedFramework === 'react') {
      return `import React, { useState, useEffect } from 'react'
${selectedStyling === 'tailwind' ? '' : "import styled from 'styled-components'"}

export const ${componentName} = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch data
    loadData()
  }, [])

  const loadData = async () => {
    // Implementation based on selected features
    ${features.map(f => `// ${f} implementation`).join('\n    ')}
    setLoading(false)
  }

  return (
    <div className="${selectedStyling === 'tailwind' ? 'p-6 bg-white rounded-lg shadow-lg' : ''}">
      <h2 className="${selectedStyling === 'tailwind' ? 'text-2xl font-bold mb-4' : ''}">
        ${componentName}
      </h2>
      
      {loading ? (
        <div className="${selectedStyling === 'tailwind' ? 'animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600' : ''}"></div>
      ) : (
        <div>
          {/* Component implementation */}
          {/* Generated with Revolutionary UI Factory */}
        </div>
      )}
    </div>
  )
}`
    }
    
    return '// Component code for ' + selectedFramework
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode)
    alert('Code copied to clipboard!')
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
              <h1 className="text-xl font-semibold">Component Generator</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Component Type */}
            <div>
              <h3 className="text-lg font-semibold mb-4">1. Select Component Type</h3>
              <div className="grid grid-cols-2 gap-4">
                {componentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedType === type.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-medium">{type.name}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Component Name */}
            <div>
              <h3 className="text-lg font-semibold mb-4">2. Component Name</h3>
              <input
                type="text"
                value={componentName}
                onChange={(e) => setComponentName(e.target.value)}
                placeholder="e.g., UserDataTable"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Framework */}
            <div>
              <h3 className="text-lg font-semibold mb-4">3. Framework</h3>
              <div className="grid grid-cols-2 gap-3">
                {frameworks.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setSelectedFramework(fw.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedFramework === fw.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl mr-2">{fw.icon}</span>
                    {fw.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Styling */}
            <div>
              <h3 className="text-lg font-semibold mb-4">4. Styling System</h3>
              <select
                value={selectedStyling}
                onChange={(e) => setSelectedStyling(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {stylingOptions.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Features */}
            {selectedType && (
              <div>
                <h3 className="text-lg font-semibold mb-4">5. Features</h3>
                <div className="space-y-2">
                  {featureOptions[selectedType as keyof typeof featureOptions]?.map((feature) => (
                    <label key={feature} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={features.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFeatures([...features, feature])
                          } else {
                            setFeatures(features.filter(f => f !== feature))
                          }
                        }}
                        className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span>{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedType || !componentName || generating}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                !selectedType || !componentName || generating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {generating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Component'
              )}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Generated Code</h3>
            
            {generatedCode ? (
              <>
                {/* Metrics */}
                {metrics && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Lines of Code:</span>
                        <span className="ml-2 font-semibold">{metrics.linesOfCode}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Code Reduction:</span>
                        <span className="ml-2 font-semibold text-green-600">{metrics.reduction}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Time Saved:</span>
                        <span className="ml-2 font-semibold">{metrics.timeEstimate}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Complexity:</span>
                        <span className="ml-2 font-semibold">{metrics.complexity}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Code Preview */}
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{generatedCode}</code>
                  </pre>
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Copy
                  </button>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => router.push('/dashboard/library')}
                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Save to Library
                  </button>
                  <button
                    onClick={() => setGeneratedCode('')}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Generate Another
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🎨</div>
                <p>Configure your component and click Generate</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}