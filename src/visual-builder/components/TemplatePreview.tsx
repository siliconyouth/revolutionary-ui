import React from 'react';
import { ComponentNode } from '../core/types';

interface TemplatePreviewProps {
  template: {
    id: string;
    name: string;
    description: string;
    icon: string;
    components: ComponentNode[];
    category: string;
    tags?: string[];
    preview?: string;
  };
  onClick: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ 
  template, 
  onClick,
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'w-48 h-32',
    medium: 'w-64 h-48',
    large: 'w-80 h-60'
  };

  // Render a mini preview of the template structure
  const renderMiniPreview = () => {
    if (template.preview) {
      return (
        <img 
          src={template.preview} 
          alt={template.name}
          className="w-full h-full object-cover"
        />
      );
    }

    // Generate a simple visual representation
    return (
      <div className="w-full h-full p-2 bg-gradient-to-br from-gray-50 to-gray-100">
        {template.components.slice(0, 3).map((component, index) => (
          <div
            key={index}
            className={`
              ${component.type === 'container' ? 'border border-gray-300 rounded p-1 mb-1' : ''}
              ${component.type === 'heading' ? 'h-3 bg-gray-400 rounded mb-1' : ''}
              ${component.type === 'text' ? 'h-2 bg-gray-300 rounded mb-1' : ''}
              ${component.type === 'button' ? 'h-4 w-16 bg-purple-400 rounded mx-auto' : ''}
              ${component.type === 'grid' ? 'grid grid-cols-3 gap-1' : ''}
              ${component.type === 'card' ? 'border border-gray-200 rounded p-1' : ''}
              ${component.type === 'input' ? 'h-3 border border-gray-300 rounded' : ''}
            `}
            style={{
              opacity: 1 - (index * 0.2)
            }}
          >
            {component.type === 'grid' && (
              <>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        relative overflow-hidden rounded-lg border-2 border-gray-200
        hover:border-purple-500 hover:shadow-lg
        transition-all duration-200 group
        bg-white
      `}
    >
      {/* Preview Area */}
      <div className="absolute inset-0">
        {renderMiniPreview()}
      </div>

      {/* Overlay with template info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{template.icon}</span>
            <h3 className="font-semibold text-sm">{template.name}</h3>
          </div>
          {template.description && (
            <p className="text-xs opacity-90">{template.description}</p>
          )}
          {template.tags && (
            <div className="flex gap-1 mt-1">
              {template.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="text-xs bg-white/20 px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Badge */}
      {template.category && (
        <span className="absolute top-2 right-2 text-xs bg-gray-900/70 text-white px-2 py-1 rounded">
          {template.category}
        </span>
      )}
    </button>
  );
};

// Template Gallery Component
interface TemplateGalleryProps {
  templates: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    components: ComponentNode[];
    category: string;
    tags?: string[];
    preview?: string;
  }>;
  onSelectTemplate: (template: any) => void;
  searchQuery?: string;
  selectedCategory?: string;
  size?: 'small' | 'medium' | 'large';
}

interface EnhancedTemplateGalleryProps extends TemplateGalleryProps {
  onSearchChange?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
}

export const TemplateGallery: React.FC<EnhancedTemplateGalleryProps> = ({
  templates,
  onSelectTemplate,
  searchQuery = '',
  selectedCategory = 'all',
  size = 'medium',
  onSearchChange,
  onCategoryChange
}) => {
  // Filter templates based on search and category
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories
  const categories = ['all', ...new Set(templates.map(t => t.category))];

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange?.(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className={`
        grid gap-4
        ${size === 'small' ? 'grid-cols-4' : ''}
        ${size === 'medium' ? 'grid-cols-3' : ''}
        ${size === 'large' ? 'grid-cols-2' : ''}
      `}>
        {filteredTemplates.map(template => (
          <TemplatePreview
            key={template.id}
            template={template}
            onClick={() => onSelectTemplate(template)}
            size={size}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No templates found matching your criteria</p>
        </div>
      )}
    </div>
  );
};