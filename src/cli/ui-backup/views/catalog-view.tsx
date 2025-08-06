/**
 * Catalog Browser View for Terminal UI
 */

import React, { useState, useEffect } from 'react';
import { DatabaseResourceService } from '../../../services/database-resource-service.js';
import { EnhancedResourceService } from '../../../services/enhanced-resource-service.js';

interface CatalogViewProps {
  dbService: DatabaseResourceService;
  resourceService: EnhancedResourceService;
  onBack: () => void;
  addLog: (message: string) => void;
}

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  framework: string;
  category: string;
  downloads?: number;
  rating?: number;
}

export const CatalogView: React.FC<CatalogViewProps> = ({ 
  dbService, 
  resourceService, 
  onBack, 
  addLog 
}) => {
  const [categories, setCategories] = useState<string[]>([
    'All Components',
    'Forms & Inputs',
    'Tables & Data',
    'Navigation',
    'Layout',
    'Charts & Visualization',
    'Modals & Overlays',
    'Media & Content',
    'E-commerce',
    'Authentication'
  ]);
  
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState(0);
  const [components, setComponents] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedPanel, setFocusedPanel] = useState<'categories' | 'components' | 'details'>('categories');

  useEffect(() => {
    loadComponents();
  }, [selectedCategory]);

  const loadComponents = async () => {
    setLoading(true);
    addLog(`Loading components for ${categories[selectedCategory]}...`);
    
    try {
      const category = selectedCategory === 0 ? undefined : categories[selectedCategory];
      const results = await resourceService.searchComponents('', {
        category,
        limit: 50
      });
      
      setComponents(results.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        framework: r.framework,
        category: r.category,
        downloads: r.downloads,
        rating: r.rating
      })));
      addLog(`Loaded ${results.length} components`);
    } catch (error) {
      addLog('Failed to load components');
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  const selectedComponentData = components[selectedComponent];

  return (
    <>
      {/* Categories Panel */}
      <box
        top={4}
        left={0}
        width="25%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: focusedPanel === 'categories' ? 'green' : 'cyan' },
          label: { fg: 'magenta' }
        }}
        label=" Categories "
      >
        <list
          items={categories.map((cat, i) => 
            i === selectedCategory ? `> ${cat}` : `  ${cat}`
          )}
          style={{
            selected: { bg: 'blue', fg: 'white' }
          }}
        />
      </box>

      {/* Components List */}
      <box
        top={4}
        left="25%"
        width="35%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: focusedPanel === 'components' ? 'green' : 'cyan' },
          label: { fg: 'magenta' }
        }}
        label={` Components ${loading ? '(Loading...)' : `(${components.length})` } `}
      >
        {loading ? (
          <box content="{center}Loading components...{/center}" tags={true} />
        ) : components.length === 0 ? (
          <box content="{center}No components found{/center}" tags={true} />
        ) : (
          <list
            items={components.map((comp, i) => {
              const prefix = i === selectedComponent ? '> ' : '  ';
              return `${prefix}${comp.name} - ${comp.framework}`;
            })}
            style={{
              selected: { bg: 'blue', fg: 'white' }
            }}
          />
        )}
      </box>

      {/* Component Details */}
      <box
        top={4}
        left="60%"
        width="40%"
        height="70%"
        border={{ type: 'line' }}
        style={{
          border: { fg: focusedPanel === 'details' ? 'green' : 'cyan' },
          label: { fg: 'magenta' }
        }}
        label=" Component Details "
        content={selectedComponentData ? `
{bold}${selectedComponentData.name}{/bold}
{gray-fg}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/gray-fg}

{cyan-fg}Framework:{/cyan-fg} ${selectedComponentData.framework}
{cyan-fg}Category:{/cyan-fg} ${selectedComponentData.category || 'Uncategorized'}
{cyan-fg}Downloads:{/cyan-fg} ${selectedComponentData.downloads || 0}
{cyan-fg}Rating:{/cyan-fg} ${selectedComponentData.rating ? '⭐'.repeat(Math.round(selectedComponentData.rating)) : 'Not rated'}

{yellow-fg}Description:{/yellow-fg}
${selectedComponentData.description || 'No description available'}

{gray-fg}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{/gray-fg}
{green-fg}Press Enter to use this component{/green-fg}
{gray-fg}Press Tab to switch panels{/gray-fg}
        ` : '{center}Select a component to view details{/center}'}
        tags={true}
        scrollable={true}
        alwaysScroll={true}
      />

      {/* Instructions */}
      <box
        bottom={3}
        left={0}
        width="100%"
        height={3}
        border={{ type: 'line' }}
        style={{
          border: { fg: 'cyan' }
        }}
        content="{center}Tab: Switch Panel | ↑↓: Navigate | Enter: Select | ESC: Back to Menu{/center}"
        tags={true}
      />
    </>
  );
};