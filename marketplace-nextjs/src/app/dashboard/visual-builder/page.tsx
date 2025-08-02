'use client'

import React, { useReducer, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

// Import visual builder components
import { ComponentPalette } from '@/../../../../src/visual-builder/components/ComponentPalette'
import { Canvas } from '@/../../../../src/visual-builder/components/Canvas'
import { PropertyPanel } from '@/../../../../src/visual-builder/components/PropertyPanel'
import { TemplateGallery } from '@/../../../../src/visual-builder/components/TemplatePreview'
import { builderReducer } from '@/../../../../src/visual-builder/store/builder-reducer'
import { useDragDrop } from '@/../../../../src/visual-builder/hooks/useDragDrop'
import { FactoryExporter } from '@/../../../../src/visual-builder/exporters/factory-exporter'
import { 
  BuilderActionType, 
  DragItem, 
  DropZone,
  ExportOptions,
  ComponentNode 
} from '@/../../../../src/visual-builder/core/types'
import { templateLibrary } from '@/../../../../src/visual-builder/core/template-library'

// Import marketplace components
import { MarketplaceBrowser } from '@/../../../../src/marketplace/components/MarketplaceBrowser'
import { ComponentPublisher } from '@/../../../../src/marketplace/components/ComponentPublisher'

export default function VisualBuilderPage() {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(builderReducer, {
    components: [],
    selectedComponentId: null,
    hoveredComponentId: null,
    draggedItem: null,
    dropZones: [],
    history: {
      past: [],
      present: [],
      future: [],
    },
    settings: {
      framework: 'react',
      styling: 'tailwind',
      devicePreview: 'desktop',
      showGrid: true,
      gridSize: 8,
      snapToGrid: true,
      autoSave: true,
      darkMode: false,
    },
  })

  const [showExportModal, setShowExportModal] = useState(false)
  const [showTemplateGallery, setShowTemplateGallery] = useState(false)
  const [showMarketplace, setShowMarketplace] = useState(false)
  const [showPublisher, setShowPublisher] = useState(false)
  const [templateSearchQuery, setTemplateSearchQuery] = useState('')
  const [templateCategory, setTemplateCategory] = useState('all')
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'factory',
    framework: 'react',
    styling: 'tailwind',
    typescript: true,
    prettier: true,
    includeImports: true,
  })

  const exporter = new FactoryExporter()

  // Drag and drop handlers
  const handleDrop = useCallback((dragItem: DragItem, dropZone: DropZone) => {
    dispatch({
      type: BuilderActionType.ADD_COMPONENT,
      payload: {
        type: dragItem.type,
        parentId: dropZone.parentId,
        index: dropZone.index,
      },
    })
  }, [])

  const handleReorder = useCallback((dragItem: DragItem, dropZone: DropZone) => {
    dispatch({
      type: BuilderActionType.MOVE_COMPONENT,
      payload: {
        componentId: dragItem.id,
        newParentId: dropZone.parentId,
        newIndex: dropZone.index,
      },
    })
  }, [])

  const dragDropHandlers = useDragDrop({
    onDrop: handleDrop,
    onReorder: handleReorder,
    snapToGrid: state.settings.snapToGrid,
    gridSize: state.settings.gridSize,
  })

  // Component handlers
  const handleUpdateProperty = useCallback((propertyName: string, value: any) => {
    if (!state.selectedComponentId) return

    dispatch({
      type: BuilderActionType.UPDATE_COMPONENT,
      payload: {
        id: state.selectedComponentId,
        updates: {
          props: {
            ...findComponentById(state.components, state.selectedComponentId)?.props,
            [propertyName]: value,
          },
        },
      },
    })
  }, [state.selectedComponentId, state.components])

  const handleDeleteComponent = useCallback(() => {
    if (!state.selectedComponentId) return

    dispatch({
      type: BuilderActionType.DELETE_COMPONENT,
      payload: { id: state.selectedComponentId },
    })
  }, [state.selectedComponentId])

  const handleDuplicateComponent = useCallback(() => {
    if (!state.selectedComponentId) return

    dispatch({
      type: BuilderActionType.DUPLICATE_COMPONENT,
      payload: { id: state.selectedComponentId },
    })
  }, [state.selectedComponentId])

  // Export handler
  const handleExport = () => {
    const code = exporter.export(state.components, exportOptions)
    
    // Copy to clipboard
    navigator.clipboard.writeText(code)
    alert('Code copied to clipboard!')
    setShowExportModal(false)
  }

  // Template handler
  const loadTemplate = (template: any) => {
    dispatch({
      type: BuilderActionType.LOAD_TEMPLATE,
      payload: { components: template.components },
    })
    setShowTemplateGallery(false)
  }

  // Marketplace handlers
  const handleImportFromMarketplace = (component: ComponentNode) => {
    dispatch({
      type: BuilderActionType.ADD_COMPONENT,
      payload: {
        type: component.type,
        parentId: null,
        index: state.components.length,
        props: component.props,
        children: component.children
      },
    })
    setShowMarketplace(false)
  }

  const handlePublishToMarketplace = () => {
    if (state.components.length === 0) {
      alert('Please create a component before publishing')
      return
    }
    setShowPublisher(true)
  }

  // Helper to find component by ID
  function findComponentById(components: any[], id: string): any {
    for (const component of components) {
      if (component.id === id) return component
      const found = findComponentById(component.children, id)
      if (found) return found
    }
    return null
  }

  const selectedComponent = state.selectedComponentId 
    ? findComponentById(state.components, state.selectedComponentId)
    : null

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              ← Back
            </Link>
            <h1 className="text-xl font-semibold">Visual Component Builder</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Device Preview */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => dispatch({
                  type: BuilderActionType.UPDATE_SETTINGS,
                  payload: { devicePreview: 'desktop' }
                })}
                className={`px-3 py-1.5 rounded text-sm ${
                  state.settings.devicePreview === 'desktop'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                🖥️ Desktop
              </button>
              <button
                onClick={() => dispatch({
                  type: BuilderActionType.UPDATE_SETTINGS,
                  payload: { devicePreview: 'tablet' }
                })}
                className={`px-3 py-1.5 rounded text-sm ${
                  state.settings.devicePreview === 'tablet'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                📱 Tablet
              </button>
              <button
                onClick={() => dispatch({
                  type: BuilderActionType.UPDATE_SETTINGS,
                  payload: { devicePreview: 'mobile' }
                })}
                className={`px-3 py-1.5 rounded text-sm ${
                  state.settings.devicePreview === 'mobile'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600'
                }`}
              >
                📱 Mobile
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch({ type: BuilderActionType.UNDO })}
                disabled={state.history.past.length === 0}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                title="Undo"
              >
                ↶
              </button>
              <button
                onClick={() => dispatch({ type: BuilderActionType.REDO })}
                disabled={state.history.future.length === 0}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                title="Redo"
              >
                ↷
              </button>
            </div>

            <button
              onClick={() => setShowTemplateGallery(true)}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Templates
            </button>

            <button
              onClick={() => setShowMarketplace(true)}
              className="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg"
            >
              🛍️ Marketplace
            </button>

            <button
              onClick={handlePublishToMarketplace}
              disabled={state.components.length === 0}
              className="px-4 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📤 Publish
            </button>

            <button
              onClick={() => dispatch({ type: BuilderActionType.CLEAR_CANVAS })}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
            >
              Clear
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Export Code
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Palette */}
        <ComponentPalette onStartDrag={dragDropHandlers.startDrag} />

        {/* Canvas */}
        <Canvas
          components={state.components}
          selectedComponentId={state.selectedComponentId}
          hoveredComponentId={state.hoveredComponentId}
          settings={state.settings}
          onSelectComponent={(id) => dispatch({
            type: BuilderActionType.SELECT_COMPONENT,
            payload: { id }
          })}
          onHoverComponent={(id) => dispatch({
            type: BuilderActionType.HOVER_COMPONENT,
            payload: { id }
          })}
          onDropZonesUpdate={(zones) => dispatch({
            type: BuilderActionType.UPDATE_DROP_ZONES,
            payload: { zones }
          })}
        />

        {/* Property Panel */}
        <PropertyPanel
          component={selectedComponent}
          onUpdateProperty={handleUpdateProperty}
          onDeleteComponent={handleDeleteComponent}
          onDuplicateComponent={handleDuplicateComponent}
        />
      </div>

      {/* Template Picker (shown when canvas is empty) */}
      {state.components.length === 0 && !showTemplateGallery && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4">
          <p className="text-sm text-gray-600 mb-3">Start with a template:</p>
          <div className="flex gap-3">
            {templateLibrary.slice(0, 4).map(template => (
              <button
                key={template.id}
                onClick={() => loadTemplate(template)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-3xl">{template.icon}</span>
                <span className="text-sm text-gray-700">{template.name}</span>
              </button>
            ))}
            <button
              onClick={() => setShowTemplateGallery(true)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-3xl">➕</span>
              <span className="text-sm text-gray-700">More...</span>
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Export Options</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Export Format
                </label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    format: e.target.value as any
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="factory">Factory Configuration</option>
                  <option value="code">Component Code</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              {exportOptions.format !== 'json' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Framework
                    </label>
                    <select
                      value={exportOptions.framework}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        framework: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="react">React</option>
                      <option value="vue">Vue</option>
                      <option value="angular">Angular</option>
                      <option value="svelte">Svelte</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Styling
                    </label>
                    <select
                      value={exportOptions.styling}
                      onChange={(e) => setExportOptions({
                        ...exportOptions,
                        styling: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="tailwind">Tailwind CSS</option>
                      <option value="styled-components">Styled Components</option>
                      <option value="css-modules">CSS Modules</option>
                      <option value="vanilla">Vanilla CSS</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.typescript}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          typescript: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm">TypeScript</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeImports}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          includeImports: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm">Include Imports</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.prettier}
                        onChange={(e) => setExportOptions({
                          ...exportOptions,
                          prettier: e.target.checked
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm">Format with Prettier</span>
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Export & Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Gallery Modal */}
      {showTemplateGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Choose a Template</h3>
                <button
                  onClick={() => setShowTemplateGallery(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <TemplateGallery
                templates={templateLibrary}
                onSelectTemplate={loadTemplate}
                searchQuery={templateSearchQuery}
                selectedCategory={templateCategory}
                onSearchChange={setTemplateSearchQuery}
                onCategoryChange={setTemplateCategory}
                size="medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Marketplace Browser Modal */}
      {showMarketplace && (
        <MarketplaceBrowser
          onImportComponent={handleImportFromMarketplace}
          onClose={() => setShowMarketplace(false)}
          apiKey={user?.id} // Use actual API key in production
        />
      )}

      {/* Component Publisher Modal */}
      {showPublisher && (
        <ComponentPublisher
          component={state.components[0]} // Publish the root component
          onClose={() => setShowPublisher(false)}
          onPublished={(componentId) => {
            console.log('Published component:', componentId)
            setShowPublisher(false)
          }}
          apiKey={user?.id} // Use actual API key in production
        />
      )}

      {/* Drag Preview */}
      <div
        ref={dragDropHandlers.dragPreviewRef}
        className="fixed pointer-events-none z-50"
        style={{
          left: 0,
          top: 0,
          transform: `translate(${dragDropHandlers.dragPosition.x}px, ${dragDropHandlers.dragPosition.y}px)`,
        }}
      />
    </div>
  )
}