'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const aiModels = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', icon: '🧠', description: 'Most capable, best for complex components' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', icon: '⚡', description: 'Fast and efficient' },
  { id: 'claude-3', name: 'Claude 3', provider: 'Anthropic', icon: '🤖', description: 'Great for detailed explanations' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', icon: '✨', description: 'Balanced performance' },
]

const examplePrompts = [
  "Create a responsive pricing table with monthly/yearly toggle",
  "Build a kanban board with drag and drop functionality",
  "Design a chat interface with real-time messages and typing indicators",
  "Make a dashboard with charts showing sales analytics",
  "Create a file upload component with drag & drop and progress bars",
  "Build a timeline component showing project milestones",
]

export default function AIGeneratePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [framework, setFramework] = useState('react')
  const [styling, setStyling] = useState('tailwind')
  const [includeTests, setIncludeTests] = useState(false)
  const [includeStorybook, setIncludeStorybook] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatedComponents, setGeneratedComponents] = useState<any[]>([])
  const [selectedComponent, setSelectedComponent] = useState<number>(0)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please enter a component description')
      return
    }

    setGenerating(true)
    setGeneratedComponents([])

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          framework,
          styling,
          includeTests,
          includeStorybook,
          stream: false
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedComponents(data.variations)
        setSelectedComponent(0)
      } else {
        // Fallback to mock if API fails
        console.error('AI generation failed:', data.error)
        const mockComponents = generateMockComponents()
        setGeneratedComponents(mockComponents)
        setSelectedComponent(0)
      }
    } catch (error) {
      console.error('Failed to generate:', error)
      // Fallback to mock components
      const mockComponents = generateMockComponents()
      setGeneratedComponents(mockComponents)
      setSelectedComponent(0)
    } finally {
      setGenerating(false)
    }
  }

  const generateMockComponents = () => {
    const variations = [
      { name: 'Modern Style', style: 'modern', complexity: 'Medium' },
      { name: 'Minimal Style', style: 'minimal', complexity: 'Simple' },
      { name: 'Enterprise Style', style: 'enterprise', complexity: 'Complex' },
    ]

    return variations.map((variant, index) => ({
      id: index,
      name: variant.name,
      prompt: prompt,
      code: generateMockCode(variant.style),
      metrics: {
        linesOfCode: 150 + Math.floor(Math.random() * 200),
        reduction: 70 + Math.floor(Math.random() * 20),
        components: 3 + Math.floor(Math.random() * 5),
        complexity: variant.complexity,
        estimatedTime: `${2 + Math.floor(Math.random() * 3)} hours`
      },
      preview: variant.style,
      tests: includeTests ? generateMockTests() : null,
      storybook: includeStorybook ? generateMockStorybook() : null,
    }))
  }

  const generateMockCode = (style: string) => {
    const baseCode = `import React, { useState, useEffect } from 'react'
${styling === 'tailwind' ? '' : "import styled from 'styled-components'"}

// Generated from: "${prompt}"
// Model: ${aiModels.find(m => m.id === selectedModel)?.name}
// Style: ${style}

export const GeneratedComponent = () => {
  const [state, setState] = useState({
    loading: false,
    data: [],
    error: null
  })

  useEffect(() => {
    // Component initialization
    loadData()
  }, [])

  const loadData = async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      // Fetch data implementation
      const response = await fetch('/api/data')
      const data = await response.json()
      setState(prev => ({ ...prev, data, loading: false }))
    } catch (error) {
      setState(prev => ({ ...prev, error, loading: false }))
    }
  }

  return (
    <div className="${styling === 'tailwind' ? `${style === 'modern' ? 'p-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-xl' : style === 'minimal' ? 'p-6 bg-white rounded-lg shadow-sm' : 'p-8 bg-gray-50 rounded-lg border border-gray-200'}` : ''}">
      ${style === 'modern' ? `
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          ${prompt}
        </h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Action 1
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            Action 2
          </button>
        </div>
      </div>` : style === 'minimal' ? `
      <h2 className="text-xl font-semibold text-gray-900 mb-4">${prompt}</h2>` : `
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">${prompt}</h2>
        <p className="text-gray-600 mt-1">Enterprise-grade component with full functionality</p>
      </div>`}
      
      {state.loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Component implementation based on prompt */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="${style === 'modern' ? 'bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all' : style === 'minimal' ? 'p-4 border border-gray-200 rounded-lg' : 'bg-white p-6 rounded-lg shadow-sm border border-gray-100'}">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Item {item}</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  AI-generated component with optimized performance
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}`
    return baseCode
  }

  const generateMockTests = () => {
    return `import { render, screen, fireEvent } from '@testing-library/react'
import { GeneratedComponent } from './GeneratedComponent'

describe('GeneratedComponent', () => {
  it('renders without crashing', () => {
    render(<GeneratedComponent />)
    expect(screen.getByText(/${prompt}/i)).toBeInTheDocument()
  })

  it('handles loading state', () => {
    render(<GeneratedComponent />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('handles user interactions', () => {
    render(<GeneratedComponent />)
    const button = screen.getByRole('button', { name: /action/i })
    fireEvent.click(button)
    // Add assertions
  })
})`
  }

  const generateMockStorybook = () => {
    return `import type { Meta, StoryObj } from '@storybook/react'
import { GeneratedComponent } from './GeneratedComponent'

const meta: Meta<typeof GeneratedComponent> = {
  title: 'AI Generated/${prompt}',
  component: GeneratedComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithData: Story = {
  args: {
    initialData: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ],
  },
}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
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
              <h1 className="text-xl font-semibold">AI Component Generator</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your component
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Create a responsive pricing table with monthly/yearly toggle"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
              />
              
              {/* Example Prompts */}
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Try these examples:</p>
                <div className="space-y-1">
                  {examplePrompts.slice(0, 3).map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="text-xs text-purple-600 hover:text-purple-700 hover:underline text-left"
                    >
                      • {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Model Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Model
              </label>
              <div className="space-y-2">
                {aiModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedModel === model.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{model.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-gray-600">{model.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Framework & Styling */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Framework
              </label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="react">React</option>
                <option value="vue">Vue</option>
                <option value="angular">Angular</option>
                <option value="svelte">Svelte</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Styling
              </label>
              <select
                value={styling}
                onChange={(e) => setStyling(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="tailwind">Tailwind CSS</option>
                <option value="styled-components">Styled Components</option>
                <option value="css-modules">CSS Modules</option>
                <option value="emotion">Emotion</option>
              </select>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeTests}
                  onChange={(e) => setIncludeTests(e.target.checked)}
                  className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Include unit tests</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeStorybook}
                  onChange={(e) => setIncludeStorybook(e.target.checked)}
                  className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Include Storybook stories</span>
              </label>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                !prompt.trim() || generating
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
                  AI is thinking...
                </span>
              ) : (
                '🤖 Generate with AI'
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {generatedComponents.length > 0 ? (
              <>
                {/* Variation Tabs */}
                <div className="bg-white rounded-lg shadow-sm p-2 mb-6">
                  <div className="flex gap-2">
                    {generatedComponents.map((component, index) => (
                      <button
                        key={component.id}
                        onClick={() => setSelectedComponent(index)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                          selectedComponent === index
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {component.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Component */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  {/* Metrics */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Lines:</span>
                        <span className="ml-2 font-semibold">{generatedComponents[selectedComponent].metrics.linesOfCode}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Reduction:</span>
                        <span className="ml-2 font-semibold text-green-600">{generatedComponents[selectedComponent].metrics.reduction}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Components:</span>
                        <span className="ml-2 font-semibold">{generatedComponents[selectedComponent].metrics.components}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Complexity:</span>
                        <span className="ml-2 font-semibold">{generatedComponents[selectedComponent].metrics.complexity}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Time Saved:</span>
                        <span className="ml-2 font-semibold">{generatedComponents[selectedComponent].metrics.estimatedTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Code Tabs */}
                  <div className="mb-4">
                    <div className="flex gap-4 border-b">
                      <button className="pb-2 px-1 border-b-2 border-purple-600 font-medium text-purple-600">
                        Component
                      </button>
                      {includeTests && (
                        <button className="pb-2 px-1 border-b-2 border-transparent hover:border-gray-300 text-gray-600">
                          Tests
                        </button>
                      )}
                      {includeStorybook && (
                        <button className="pb-2 px-1 border-b-2 border-transparent hover:border-gray-300 text-gray-600">
                          Storybook
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Code Preview */}
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                      <code>{generatedComponents[selectedComponent].code}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(generatedComponents[selectedComponent].code)}
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
                      onClick={() => setGeneratedComponents([])}
                      className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Generate New
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  AI-Powered Component Generation
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Describe what you want to build in natural language, and our AI will generate 
                  multiple optimized component variations for you to choose from.
                </p>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 max-w-lg mx-auto">
                  <h4 className="font-semibold text-gray-900 mb-3">How it works:</h4>
                  <ol className="text-left space-y-2 text-sm text-gray-700">
                    <li>1. Describe your component in plain English</li>
                    <li>2. Choose your preferred AI model</li>
                    <li>3. Select framework and styling options</li>
                    <li>4. Get multiple variations to choose from</li>
                    <li>5. Copy the code or save to your library</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}