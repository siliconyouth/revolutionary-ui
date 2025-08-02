'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import Navigation from '@/components/Navigation'
import Link from 'next/link'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'


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
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [selectedFramework, setSelectedFramework] = useState('react')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    code: string
    intent: any
    error?: string
    usage?: { used: number; limit: number }
  } | null>(null)
  const [providers, setProviders] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && user) {
      loadProviders()
    }
  }, [user, authLoading])

  const loadProviders = async () => {
    const { data } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('user_id', user!.id)
      .eq('is_active', true)

    setProviders(data || [])
  }
  
  const generateComponent = async () => {
    if (!prompt.trim()) return

    if (!user) {
      router.push('/auth/signin?redirect=/playground/ai')
      return
    }
    
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/generate/component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          framework: selectedFramework,
          provider: providers.length > 0 ? providers[0].provider : 'mock'
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setResult({
            code: '',
            intent: null,
            error: `Usage limit exceeded (${data.used}/${data.limit}). Please upgrade your plan.`,
            usage: { used: data.used, limit: data.limit }
          })
        } else {
          setResult({
            code: '',
            intent: null,
            error: data.error || 'Failed to generate component'
          })
        }
        return
      }
      
      setResult({
        code: data.code,
        intent: data.intent,
        usage: data.usage
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
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-40 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full mb-6">
            <span className="text-purple-600 font-medium text-sm">✨ AI-Powered Generation Beta</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Generate Components with
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Natural Language
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Describe what you want to build in plain English. Our AI understands your intent 
            and generates production-ready components using the Revolutionary UI Factory.
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Multiple AI Providers</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>All Frameworks</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>60-95% Less Code</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="py-12 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Panel */}
            <div className="lg:col-span-1 space-y-6">
              {/* Prompt Input */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              {/* Usage indicator */}
              {user && result?.usage && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly Usage</span>
                    <span className="text-sm font-medium">
                      {result.usage.used} / {result.usage.limit === -1 ? '∞' : result.usage.limit}
                    </span>
                  </div>
                  {result.usage.limit !== -1 && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((result.usage.used / result.usage.limit) * 100, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your component
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Create a dashboard with revenue stats and charts..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all"
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
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  Example Prompts
                </h3>
                <div className="space-y-2">
                  {EXAMPLE_PROMPTS.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-all duration-200 hover:translate-x-1"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tips */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pro Tips</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Be specific about the features you want</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Mention if you need responsive design</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-0.5">•</span>
                    <span>Specify any interactions or animations</span>
                  </li>
                </ul>
              </div>
            </div>
          
          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {result && (
              <>
                  {/* AI Intent */}
                  {result.intent && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="text-2xl">🤖</span> AI Understanding
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Component Type:</span>
                          <span className="font-semibold text-purple-600 capitalize">{result.intent.componentType}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-600">Confidence:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
                                style={{ width: `${result.intent.confidence * 100}%` }}
                              />
                            </div>
                            <span className="font-medium text-sm">{Math.round(result.intent.confidence * 100)}%</span>
                          </div>
                        </div>
                        {result.intent.explanation && (
                          <div className="pt-4 border-t">
                            <p className="text-gray-700 leading-relaxed">{result.intent.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                
                  {/* Generated Code */}
                  {result.code && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <span className="text-2xl">💻</span>
                          Generated Code
                        </h3>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(result.code)
                            // You could add a toast notification here
                          }}
                          className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Code
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
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
                  <div className="text-8xl mb-6">🎨</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Ready to Generate
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Describe the component you want to build and let AI do the rest!
                  </p>
                </div>
              )}
              
              {/* Loading State */}
              {loading && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-purple-200 rounded-full animate-pulse"></div>
                      <div className="absolute top-0 left-0 w-24 h-24 border-4 border-purple-600 rounded-full animate-spin border-t-transparent"></div>
                    </div>
                    <p className="mt-6 text-lg font-medium text-gray-900">AI is thinking...</p>
                    <p className="mt-2 text-gray-600">Analyzing your prompt and generating code</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to generate any component</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold transform group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Describe</h3>
              <p className="text-gray-600">
                Tell us what component you need in plain English - be as detailed as you like
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold transform group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analyzes</h3>
              <p className="text-gray-600">
                Our AI understands your intent and determines the best component structure
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold transform group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Factory Generates</h3>
              <p className="text-gray-600">
                Revolutionary UI Factory creates optimized, production-ready component code
              </p>
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              href="/docs/ai-generation"
              className="inline-flex items-center px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all"
            >
              Learn More About AI Generation
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  )
}