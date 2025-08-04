'use client'

import { useState, useRef, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
// TODO: Import from the actual package when available
// import { setup } from 'revolutionary-ui/v2'

// Mock setup function for now
const setup = (options?: any) => ({
  framework: options?.framework || 'react'
})

// Component types available in the playground
const COMPONENT_TYPES = [
  { id: 'dashboard', name: 'Dashboard', icon: '📊' },
  { id: 'datatable', name: 'Data Table', icon: '📋' },
  { id: 'form', name: 'Form', icon: '📝' },
  { id: 'kanban', name: 'Kanban Board', icon: '📌' },
  { id: 'chart', name: 'Chart', icon: '📈' },
  { id: 'calendar', name: 'Calendar', icon: '📅' },
  { id: 'timeline', name: 'Timeline', icon: '⏱️' },
  { id: 'card', name: 'Card', icon: '🃏' }
]

// Framework options
const FRAMEWORKS = [
  { id: 'react', name: 'React', version: '19.0' },
  { id: 'vue', name: 'Vue', version: '3.5' },
  { id: 'angular', name: 'Angular', version: '15.0' },
  { id: 'svelte', name: 'Svelte', version: '4.0' }
]

export default function PlaygroundPage() {
  const [selectedFramework, setSelectedFramework] = useState('react')
  const [selectedComponent, setSelectedComponent] = useState('dashboard')
  const [config, setConfig] = useState({})
  const [generatedCode, setGeneratedCode] = useState('')
  const [previewKey, setPreviewKey] = useState(0)
  const previewRef = useRef<HTMLDivElement>(null)

  // Calculate code reduction
  const calculateReduction = () => {
    const traditionalLines = {
      dashboard: 1000,
      datatable: 600,
      form: 500,
      kanban: 600,
      chart: 500,
      calendar: 800,
      timeline: 400,
      card: 200
    }
    
    const factoryLines = generatedCode.split('\n').length
    const traditional = traditionalLines[selectedComponent as keyof typeof traditionalLines] || 500
    const reduction = Math.round(((traditional - factoryLines) / traditional) * 100)
    
    return { traditional, factory: factoryLines, reduction }
  }

  // Generate component code based on framework and type
  const generateComponentCode = () => {
    const ui = setup({ framework: selectedFramework })
    
    let code = ''
    
    switch (selectedFramework) {
      case 'react':
        code = generateReactCode(selectedComponent, config)
        break
      case 'vue':
        code = generateVueCode(selectedComponent, config)
        break
      case 'angular':
        code = generateAngularCode(selectedComponent, config)
        break
      case 'svelte':
        code = generateSvelteCode(selectedComponent, config)
        break
    }
    
    setGeneratedCode(code)
    setPreviewKey(prev => prev + 1) // Force preview refresh
  }

  // Generate React code
  const generateReactCode = (componentType: string, config: any) => {
    return `import React from 'react'
import { setup } from 'revolutionary-ui/v2'

export function My${componentType.charAt(0).toUpperCase() + componentType.slice(1)}() {
  const ui = setup()
  
  const ${componentType.charAt(0).toUpperCase() + componentType.slice(1)} = ui.create${componentType.charAt(0).toUpperCase() + componentType.slice(1)}({
    ${JSON.stringify(getDefaultConfig(componentType), null, 2).slice(1, -1)}
  })
  
  return <${componentType.charAt(0).toUpperCase() + componentType.slice(1)} />
}`
  }

  // Generate Vue code
  const generateVueCode = (componentType: string, config: any) => {
    return `<template>
  <${componentType.charAt(0).toUpperCase() + componentType.slice(1)} />
</template>

<script setup lang="ts">
import { defineComponent } from 'vue'
import { setup } from 'revolutionary-ui/v2'

const ui = setup({ framework: 'vue' })

const ${componentType.charAt(0).toUpperCase() + componentType.slice(1)} = defineComponent({
  setup() {
    return ui.create${componentType.charAt(0).toUpperCase() + componentType.slice(1)}({
      ${JSON.stringify(getDefaultConfig(componentType), null, 2).slice(1, -1).split('\n').map(line => '  ' + line).join('\n')}
    })
  }
})
</script>`
  }

  // Generate Angular code
  const generateAngularCode = (componentType: string, config: any) => {
    return `import { Component, OnInit } from '@angular/core'
import { setup } from 'revolutionary-ui/v2'

@Component({
  selector: 'app-${componentType}',
  template: '<div #container></div>'
})
export class ${componentType.charAt(0).toUpperCase() + componentType.slice(1)}Component implements OnInit {
  ui = setup({ framework: 'angular' })
  
  ngOnInit() {
    const ${componentType} = this.ui.create${componentType.charAt(0).toUpperCase() + componentType.slice(1)}({
      ${JSON.stringify(getDefaultConfig(componentType), null, 2).slice(1, -1).split('\n').map(line => '    ' + line).join('\n')}
    })
    
    this.ui.mount(${componentType}, this.container.nativeElement)
  }
}`
  }

  // Generate Svelte code
  const generateSvelteCode = (componentType: string, config: any) => {
    return `<script>
  import { onMount } from 'svelte'
  import { setup } from 'revolutionary-ui/v2'
  
  let container
  const ui = setup({ framework: 'svelte' })
  
  onMount(() => {
    const ${componentType} = ui.create${componentType.charAt(0).toUpperCase() + componentType.slice(1)}({
      ${JSON.stringify(getDefaultConfig(componentType), null, 2).slice(1, -1).split('\n').map(line => '    ' + line).join('\n')}
    })
    
    ui.mount(${componentType}, container)
  })
</script>

<div bind:this={container}></div>`
  }

  // Get default configuration for component type
  const getDefaultConfig = (componentType: string) => {
    const configs: Record<string, any> = {
      dashboard: {
        widgets: [
          {
            id: 'revenue',
            type: 'stats',
            config: {
              value: 125600,
              label: 'Total Revenue',
              change: 12.5,
              trend: 'up'
            }
          },
          {
            id: 'chart',
            type: 'chart',
            config: {
              type: 'line',
              data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                datasets: [{
                  label: 'Revenue',
                  data: [65, 72, 78, 85, 95]
                }]
              }
            }
          }
        ]
      },
      datatable: {
        columns: [
          { id: 'id', header: 'ID', accessorKey: 'id' },
          { id: 'name', header: 'Name', accessorKey: 'name' },
          { id: 'email', header: 'Email', accessorKey: 'email' }
        ],
        data: [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ],
        features: {
          sorting: true,
          filtering: true,
          pagination: true
        }
      },
      form: {
        fields: [
          {
            id: 'name',
            name: 'name',
            label: 'Name',
            type: 'text',
            required: true
          },
          {
            id: 'email',
            name: 'email',
            label: 'Email',
            type: 'email',
            required: true
          }
        ],
        onSubmit: (data: any) => console.log('Form submitted:', data)
      },
      kanban: {
        columns: [
          {
            id: 'todo',
            title: 'To Do',
            items: [
              { id: '1', title: 'Task 1' },
              { id: '2', title: 'Task 2' }
            ]
          },
          {
            id: 'done',
            title: 'Done',
            items: [
              { id: '3', title: 'Task 3' }
            ]
          }
        ]
      },
      chart: {
        type: 'bar',
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [{
            label: 'Revenue',
            data: [120, 190, 300, 250]
          }]
        }
      },
      calendar: {
        events: [
          {
            id: '1',
            title: 'Meeting',
            date: new Date()
          }
        ]
      },
      timeline: {
        items: [
          {
            date: new Date(),
            title: 'Project Started',
            description: 'Initial kickoff'
          }
        ]
      },
      card: {
        title: 'Sample Card',
        subtitle: 'This is a revolutionary card',
        content: 'Card content goes here'
      }
    }
    
    return configs[componentType] || {}
  }

  useEffect(() => {
    generateComponentCode()
  }, [selectedFramework, selectedComponent])

  const metrics = calculateReduction()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Revolutionary UI Playground
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Try out components with instant code generation
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Framework</h3>
                <div className="grid grid-cols-2 gap-2">
                  {FRAMEWORKS.map(framework => (
                    <button
                      key={framework.id}
                      onClick={() => setSelectedFramework(framework.id)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedFramework === framework.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{framework.name}</div>
                      <div className="text-xs text-gray-500">v{framework.version}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Component Type</h3>
                <div className="space-y-2">
                  {COMPONENT_TYPES.map(component => (
                    <button
                      key={component.id}
                      onClick={() => setSelectedComponent(component.id)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                        selectedComponent === component.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{component.icon}</span>
                      <span className="font-medium">{component.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4">
                <h4 className="font-semibold mb-2">Code Reduction</h4>
                <div className="text-3xl font-bold">{metrics.reduction}%</div>
                <div className="text-sm mt-1 opacity-90">
                  {metrics.traditional} lines → {metrics.factory} lines
                </div>
              </div>
            </div>
          </div>

          {/* Code & Preview Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Generated Code */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Generated Code</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedCode)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Copy Code
                </button>
              </div>
              <div className="relative">
                <SyntaxHighlighter
                  language={selectedFramework === 'vue' ? 'vue' : 'typescript'}
                  style={vscDarkPlus}
                  customStyle={{
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    maxHeight: '400px'
                  }}
                >
                  {generatedCode}
                </SyntaxHighlighter>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Live Preview</h3>
              <div className="border-2 border-gray-200 rounded-lg p-4 min-h-[300px] bg-gray-50">
                <div className="text-center text-gray-500 py-12">
                  <div className="text-4xl mb-4">🚧</div>
                  <p className="text-lg font-medium">Preview Coming Soon</p>
                  <p className="text-sm mt-2">
                    The live preview feature is under development.
                    <br />
                    Copy the code above to use in your project!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}