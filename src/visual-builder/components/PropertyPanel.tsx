import React, { useMemo } from 'react';
import { ComponentNode, PropSchema } from '../core/types';
import { getComponentDefinition } from '../core/component-registry';
import { PropertyEditor } from './property-editors';

interface PropertyPanelProps {
  component: ComponentNode | null;
  onUpdateComponent: (id: string, updates: Partial<ComponentNode>) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (id: string) => void;
}

export function PropertyPanel({
  component,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent
}: PropertyPanelProps) {
  const definition = useMemo(
    () => component ? getComponentDefinition(component.type) : null,
    [component?.type]
  );

  if (!component || !definition) {
    return (
      <div className="h-full bg-white border-l border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <div className="text-5xl mb-4">🎨</div>
          <h3 className="text-lg font-medium mb-2">No Component Selected</h3>
          <p className="text-sm">
            Select a component from the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const handlePropChange = (propName: string, value: any) => {
    onUpdateComponent(component.id, {
      props: {
        ...component.props,
        [propName]: value
      }
    });
  };

  const handleNameChange = (name: string) => {
    onUpdateComponent(component.id, { name });
  };

  // Group properties by category
  const groupedProps = useMemo(() => {
    const groups: Record<string, PropSchema[]> = {};
    
    definition.propSchema.forEach(prop => {
      const category = prop.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      
      // Check if property should be shown based on conditions
      if (!prop.condition || prop.condition(component.props)) {
        groups[category].push(prop);
      }
    });
    
    return groups;
  }, [definition.propSchema, component.props]);

  return (
    <div className="h-full bg-white border-l border-gray-200 overflow-y-auto">
      {/* Component Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{definition.icon}</span>
          <div className="flex-1">
            <input
              type="text"
              value={component.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-2 py-1 text-lg font-semibold border-b border-transparent hover:border-gray-300 focus:border-purple-500 focus:outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">{definition.type}</p>
          </div>
        </div>
        
        {/* Component Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onDuplicateComponent(component.id)}
            className="flex-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="Duplicate"
          >
            📋 Duplicate
          </button>
          <button
            onClick={() => onDeleteComponent(component.id)}
            className="flex-1 px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
            title="Delete"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* Properties */}
      <div className="p-4 space-y-6">
        {Object.entries(groupedProps).map(([category, props]) => (
          <div key={category}>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <span className="mr-2">{getCategoryIcon(category)}</span>
              {category}
            </h4>
            <div className="space-y-4">
              {props.map(prop => (
                <PropertyEditor
                  key={prop.name}
                  schema={prop}
                  value={component.props[prop.name]}
                  onChange={(value) => handlePropChange(prop.name, value)}
                  componentProps={component.props}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Component Info */}
      <div className="p-4 border-t border-gray-200">
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer font-medium mb-2">
            Component Info
          </summary>
          <dl className="space-y-1">
            <div className="flex justify-between">
              <dt>ID:</dt>
              <dd className="font-mono">{component.id.slice(0, 8)}...</dd>
            </div>
            <div className="flex justify-between">
              <dt>Type:</dt>
              <dd>{component.type}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Children:</dt>
              <dd>{component.children.length}</dd>
            </div>
            {component.position && (
              <>
                <div className="flex justify-between">
                  <dt>X:</dt>
                  <dd>{component.position.x}px</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Y:</dt>
                  <dd>{component.position.y}px</dd>
                </div>
              </>
            )}
          </dl>
        </details>
      </div>
    </div>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    'Content': '📝',
    'Appearance': '🎨',
    'Layout': '📐',
    'Style': '💅',
    'Spacing': '📏',
    'Type': '🏷️',
    'State': '🔄',
    'Events': '⚡',
    'Validation': '✅',
    'Size': '📐',
    'Grid': '⚏',
    'General': '⚙️'
  };
  
  return icons[category] || '📋';
}