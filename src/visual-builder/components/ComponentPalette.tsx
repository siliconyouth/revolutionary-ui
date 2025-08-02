import React, { useState } from 'react';
import { componentRegistry, getCategories, getComponentsByCategory } from '../core/component-registry';
import { DragItem } from '../core/types';

interface ComponentPaletteProps {
  onDragStart: (item: DragItem) => void;
}

export function ComponentPalette({ onDragStart }: ComponentPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getCategories();

  const filteredComponents = React.useMemo(() => {
    let components = componentRegistry;

    // Filter by category
    if (selectedCategory) {
      components = getComponentsByCategory(selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      components = components.filter(
        (comp) =>
          comp.name.toLowerCase().includes(query) ||
          comp.type.toLowerCase().includes(query) ||
          comp.description.toLowerCase().includes(query)
      );
    }

    return components;
  }, [searchQuery, selectedCategory]);

  const handleDragStart = (e: React.DragEvent, type: string) => {
    const dragItem: DragItem = {
      id: `new-${Date.now()}`,
      type,
      isNew: true,
    };
    
    onDragStart(dragItem);
    
    // Set drag data for native drag and drop
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', JSON.stringify(dragItem));
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-3">Components</h2>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components..."
            className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-2 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              !selectedCategory
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Components Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredComponents.map((component) => (
            <div
              key={component.type}
              draggable
              onDragStart={(e) => handleDragStart(e, component.type)}
              className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 cursor-move hover:border-purple-400 hover:bg-purple-50 transition-all group"
            >
              <div className="flex items-start gap-2">
                <span className="text-2xl">{component.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-900 truncate">
                    {component.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {component.description}
                  </p>
                </div>
              </div>
              
              {/* Drag hint */}
              <div className="mt-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                Drag to canvas
              </div>
            </div>
          ))}
        </div>

        {filteredComponents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No components found</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
          Import Custom Component
        </button>
      </div>
    </div>
  );
}