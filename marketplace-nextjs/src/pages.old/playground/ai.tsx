'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
// TODO: Import from the actual package when AI module is exported
// import { AIComponentGenerator } from '@vladimirdukelic/revolutionary-ui-factory/ai'

// For now, create a mock implementation
class AIComponentGenerator {
  async generateFromPrompt(prompt: string, options: any) {
    // Mock implementation
    const lowerPrompt = prompt.toLowerCase()
    
    let componentType = 'card'
    let explanation = 'Created a generic card component'
    let confidence = 0.5
    
    if (lowerPrompt.includes('dashboard')) {
      componentType = 'dashboard'
      explanation = 'Created a dashboard with stats and chart widgets'
      confidence = 0.9
    } else if (lowerPrompt.includes('form') || lowerPrompt.includes('contact')) {
      componentType = 'form'
      explanation = 'Created a contact form with name, email, and message fields'
      confidence = 0.85
    } else if (lowerPrompt.includes('table') || lowerPrompt.includes('list')) {
      componentType = 'dataTable'
      explanation = 'Created a data table for displaying information'
      confidence = 0.8
    }
    
    const intent = {
      componentType,
      explanation,
      confidence,
      config: {}
    }
    
    const code = this.generateCode(componentType, options.framework)
    
    return { code, intent }
  }
  
  private generateCode(componentType: string, framework: string) {
    const componentName = componentType.charAt(0).toUpperCase() + componentType.slice(1)
    
    if (framework === 'react') {
      return `import { setup } from '@vladimirdukelic/revolutionary-ui-factory/v2'

const ui = setup()

export function My${componentName}() {
  const ${componentName} = ui.create${componentName}({
    // Configuration generated from your prompt
  })
  
  return <${componentName} />
}`
    }
    
    return '// Code generation for ' + framework
  }
}

const EXAMPLE_PROMPTS = [
  "Create a dashboard showing revenue stats and a line chart",
  "Build a contact form with name, email, and message fields",
  "Make a user table with sorting and filtering",
  "Design a kanban board for project management",
  "Create a product card with image, title, price, and buy button",
  "Build a timeline showing project milestones",
  "Make a calendar component for event scheduling",
  "Create a chat interface with message history"
]

const FRAMEWORKS = [
  { id: 'react', name: 'React', icon: '⚛️' },
  { id: 'vue', name: 'Vue', icon: '🟢' },
  { id: 'angular', name: 'Angular', icon: '🔴' },
  { id: 'svelte', name: 'Svelte', icon: '🟠' }
]

export default function AIPlaygroundPage() {
  const [prompt, setPrompt] = useState('')
  const [selectedFramework, setSelectedFramework] = useState('react')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    code: string
    intent: any
    error?: string
  } | null>(null)
  
  const generator = new AIComponentGenerator()
  
  const generateComponent = async () => {
    if (!prompt.trim()) return
    
    setLoading(true)
    setResult(null)
    
    try {
      const generated = await generator.generateFromPrompt(prompt, {
        framework: selectedFramework,
        provider: 'mock' // Using mock provider for demo
      })
      
      setResult({
        code: generated.code,
        intent: generated.intent
      })
    } catch (error) {
      setResult({
        code: '',
        intent: null,
        error: error instanceof Error ? error.message : 'Failed to generate component'
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI-Powered Component Generation
              </h1>
              <p className="mt-2 text-gray-600">
                Describe what you want to build in natural language
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                ✨ AI Beta
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prompt Input */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your component
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Create a dashboard with revenue stats and charts..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={4}
              />
              
              {/* Framework Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Framework
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FRAMEWORKS.map(fw => (
                    <button
                      key={fw.id}
                      onClick={() => setSelectedFramework(fw.id)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        selectedFramework === fw.id
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span>{fw.icon}</span>
                      <span className="font-medium">{fw.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Generate Button */}
              <button
                onClick={generateComponent}
                disabled={!prompt.trim() || loading}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  '🪄 Generate Component'
                )}
              </button>
            </div>
            
            {/* Example Prompts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Example Prompts
              </h3>
              <div className="space-y-2">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {result && (
              <>
                {/* AI Intent */}
                {result.intent && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span>🤖</span> AI Understanding
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Component Type:</span>
                        <span className="font-medium capitalize">{result.intent.componentType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <span className="font-medium">{Math.round(result.intent.confidence * 100)}%</span>
                      </div>
                      {result.intent.explanation && (
                        <div className="pt-3 border-t">
                          <p className="text-sm text-gray-600">{result.intent.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Generated Code */}
                {result.code && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Generated Code</h3>
                      <button
                        onClick={() => navigator.clipboard.writeText(result.code)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                      >
                        📋 Copy Code
                      </button>
                    </div>
                    <SyntaxHighlighter
                      language={selectedFramework === 'vue' ? 'vue' : 'typescript'}
                      style={vscDarkPlus}
                      customStyle={{
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                    >
                      {result.code}
                    </SyntaxHighlighter>
                  </div>
                )}
                
                {/* Error */}
                {result.error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-700 mb-2">
                      Error
                    </h3>
                    <p className="text-red-600">{result.error}</p>
                  </div>
                )}
              </>
            )}
            
            {/* Empty State */}
            {!result && !loading && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Generate
                </h3>
                <p className="text-gray-600">
                  Describe the component you want to build and let AI do the rest!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Info Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">🚀 How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <div className="font-medium mb-1">1. Describe</div>
              <p className="text-sm opacity-90">
                Tell us what component you need in plain English
              </p>
            </div>
            <div>
              <div className="font-medium mb-1">2. AI Analyzes</div>
              <p className="text-sm opacity-90">
                Our AI understands your intent and creates the config
              </p>
            </div>
            <div>
              <div className="font-medium mb-1">3. Factory Generates</div>
              <p className="text-sm opacity-90">
                Revolutionary UI Factory creates optimized component code
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}