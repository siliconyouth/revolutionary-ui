import React, { useEffect, useRef } from 'react';
import { ComponentNode, BuilderSettings } from '../core/types';
import { ComponentRenderer } from './ComponentRenderer';

interface CanvasProps {
  components: ComponentNode[];
  selectedComponentId: string | null;
  hoveredComponentId: string | null;
  settings: BuilderSettings;
  onSelectComponent: (id: string | null) => void;
  onHoverComponent: (id: string | null) => void;
  onDropZonesUpdate: (zones: any[]) => void;
}

export function Canvas({
  components,
  selectedComponentId,
  hoveredComponentId,
  settings,
  onSelectComponent,
  onHoverComponent,
  onDropZonesUpdate,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Update drop zones when components change
  useEffect(() => {
    if (canvasRef.current) {
      // This would be called by the drag-drop hook
      // to register drop zones based on current components
    }
  }, [components, onDropZonesUpdate]);

  const renderComponents = (nodes: ComponentNode[]): React.ReactNode => {
    return nodes.map(node => (
      <ComponentRenderer
        key={node.id}
        node={node}
        isSelected={selectedComponentId === node.id}
        isHovered={hoveredComponentId === node.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectComponent(node.id);
        }}
        onMouseEnter={() => onHoverComponent(node.id)}
        onMouseLeave={() => onHoverComponent(null)}
      >
        {node.children.length > 0 && renderComponents(node.children)}
      </ComponentRenderer>
    ));
  };

  const getDeviceClasses = () => {
    switch (settings.devicePreview) {
      case 'tablet':
        return 'max-w-3xl';
      case 'mobile':
        return 'max-w-sm';
      default:
        return 'max-w-full';
    }
  };

  return (
    <div className="flex-1 bg-gray-100 overflow-auto">
      <div className="min-h-full p-8">
        {/* Device Frame */}
        <div
          className={`mx-auto bg-white rounded-lg shadow-xl ${getDeviceClasses()}`}
          style={{
            minHeight: '600px',
            backgroundImage: settings.showGrid
              ? `
                linear-gradient(to right, #f3f4f6 1px, transparent 1px),
                linear-gradient(to bottom, #f3f4f6 1px, transparent 1px)
              `
              : 'none',
            backgroundSize: settings.showGrid
              ? `${settings.gridSize}px ${settings.gridSize}px`
              : 'auto',
          }}
        >
          <div
            ref={canvasRef}
            className="p-4"
            onClick={() => onSelectComponent(null)}
            data-drop-container
            data-component-id="root"
          >
            {components.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-lg font-medium">Start building!</p>
                  <p className="text-sm mt-2">
                    Drag components from the left panel to get started
                  </p>
                </div>
              </div>
            ) : (
              renderComponents(components)
            )}
          </div>
        </div>

        {/* Device Preview Indicator */}
        {settings.devicePreview !== 'desktop' && (
          <div className="text-center mt-4">
            <span className="text-sm text-gray-500">
              {settings.devicePreview === 'tablet' ? '📱 Tablet Preview' : '📱 Mobile Preview'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}