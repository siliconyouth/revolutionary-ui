import React, { useState } from 'react';
import { ComponentNode } from '../../visual-builder/core/types';
import { PublishOptions } from '../types';
import { getMarketplaceService } from '../services/marketplace-service';
import { ComponentExporter } from '../../visual-builder/core/component-exporter';

interface ComponentPublisherProps {
  component: ComponentNode;
  onClose: () => void;
  onPublished?: (componentId: string) => void;
  apiKey?: string;
}

export const ComponentPublisher: React.FC<ComponentPublisherProps> = ({
  component,
  onClose,
  onPublished,
  apiKey
}) => {
  const [publishOptions, setPublishOptions] = useState<PublishOptions>({
    name: component.name || 'Untitled Component',
    description: '',
    category: 'other',
    tags: [],
    version: '1.0.0',
    price: 0,
    framework: ['react', 'vue', 'angular', 'svelte'],
    styling: ['tailwind', 'css', 'styled-components'],
    license: 'MIT',
    documentation: '',
    demoUrl: ''
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewCode, setPreviewCode] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'preview' | 'pricing'>('details');

  const marketplaceService = getMarketplaceService(apiKey);
  const exporter = new ComponentExporter();

  const categories = [
    { id: 'layout', name: 'Layout', icon: '📐' },
    { id: 'navigation', name: 'Navigation', icon: '🧭' },
    { id: 'forms', name: 'Forms', icon: '📝' },
    { id: 'data-display', name: 'Data Display', icon: '📊' },
    { id: 'feedback', name: 'Feedback', icon: '💬' },
    { id: 'media', name: 'Media', icon: '🖼️' },
    { id: 'ecommerce', name: 'E-commerce', icon: '🛍️' },
    { id: 'social', name: 'Social', icon: '👥' },
    { id: 'other', name: 'Other', icon: '📦' }
  ];

  const licenses = [
    { id: 'MIT', name: 'MIT License', description: 'Permissive license with minimal restrictions' },
    { id: 'Apache-2.0', name: 'Apache 2.0', description: 'Permissive license with patent protection' },
    { id: 'GPL-3.0', name: 'GPL 3.0', description: 'Copyleft license requiring derivative works to be open source' },
    { id: 'Proprietary', name: 'Proprietary', description: 'All rights reserved' }
  ];

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTag.trim() && !publishOptions.tags.includes(currentTag.trim())) {
      setPublishOptions({
        ...publishOptions,
        tags: [...publishOptions.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setPublishOptions({
      ...publishOptions,
      tags: publishOptions.tags.filter(t => t !== tag)
    });
  };

  const handlePublish = async () => {
    if (!publishOptions.name || !publishOptions.description) {
      alert('Please provide a name and description for your component');
      return;
    }

    setIsPublishing(true);
    try {
      const published = await marketplaceService.publishComponent(component, publishOptions);
      onPublished?.(published.id);
      alert('Component published successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to publish component:', error);
      alert('Failed to publish component. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const generatePreview = () => {
    const code = exporter.exportToCode([component], {
      format: 'code',
      framework: 'react',
      styling: 'tailwind',
      typescript: true,
      includeImports: true,
      prettier: true
    });
    setPreviewCode(code);
  };

  React.useEffect(() => {
    generatePreview();
  }, [component]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Publish Component</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-6 mt-4">
            {(['details', 'preview', 'pricing'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Component Name *
                    </label>
                    <input
                      type="text"
                      value={publishOptions.name}
                      onChange={(e) => setPublishOptions({ ...publishOptions, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="My Awesome Component"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={publishOptions.description}
                      onChange={(e) => setPublishOptions({ ...publishOptions, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={4}
                      placeholder="Describe what your component does and when to use it..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={publishOptions.category}
                      onChange={(e) => setPublishOptions({ ...publishOptions, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      value={publishOptions.version}
                      onChange={(e) => setPublishOptions({ ...publishOptions, version: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="1.0.0"
                    />
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <form onSubmit={handleAddTag} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Add
                  </button>
                </form>
                <div className="flex flex-wrap gap-2">
                  {publishOptions.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-purple-500 hover:text-purple-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Compatibility */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Compatibility</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supported Frameworks
                    </label>
                    <div className="space-y-2">
                      {['react', 'vue', 'angular', 'svelte'].map(fw => (
                        <label key={fw} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={publishOptions.framework.includes(fw)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPublishOptions({
                                  ...publishOptions,
                                  framework: [...publishOptions.framework, fw]
                                });
                              } else {
                                setPublishOptions({
                                  ...publishOptions,
                                  framework: publishOptions.framework.filter(f => f !== fw)
                                });
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="capitalize">{fw}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Styling Support
                    </label>
                    <div className="space-y-2">
                      {['tailwind', 'css', 'styled-components', 'css-modules'].map(style => (
                        <label key={style} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={publishOptions.styling.includes(style)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPublishOptions({
                                  ...publishOptions,
                                  styling: [...publishOptions.styling, style]
                                });
                              } else {
                                setPublishOptions({
                                  ...publishOptions,
                                  styling: publishOptions.styling.filter(s => s !== style)
                                });
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="capitalize">{style.replace('-', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentation */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Documentation</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Instructions (Markdown)
                    </label>
                    <textarea
                      value={publishOptions.documentation}
                      onChange={(e) => setPublishOptions({ ...publishOptions, documentation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                      rows={6}
                      placeholder="## Usage&#10;&#10;```jsx&#10;import { MyComponent } from '@your-package/components'&#10;&#10;<MyComponent />&#10;```"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Demo URL (optional)
                    </label>
                    <input
                      type="url"
                      value={publishOptions.demoUrl}
                      onChange={(e) => setPublishOptions({ ...publishOptions, demoUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="https://your-demo.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Component Preview</h3>
                <div className="bg-gray-100 rounded-lg p-8 mb-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    {/* This would render the actual component preview */}
                    <p className="text-gray-500 text-center">Component preview will appear here</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Generated Code</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{previewCode}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Pricing Model</h3>
                <div className="space-y-4">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="pricing"
                      checked={publishOptions.price === 0}
                      onChange={() => setPublishOptions({ ...publishOptions, price: 0 })}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-semibold">Free</p>
                      <p className="text-sm text-gray-600">
                        Make your component available to everyone at no cost
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="pricing"
                      checked={publishOptions.price > 0}
                      onChange={() => setPublishOptions({ ...publishOptions, price: 9.99 })}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <p className="font-semibold">Premium</p>
                      <p className="text-sm text-gray-600">
                        Charge a one-time fee for your component
                      </p>
                      {publishOptions.price > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-lg">$</span>
                          <input
                            type="number"
                            value={publishOptions.price}
                            onChange={(e) => setPublishOptions({ 
                              ...publishOptions, 
                              price: parseFloat(e.target.value) || 0 
                            })}
                            className="w-32 px-3 py-1 border border-gray-300 rounded"
                            min="0.99"
                            step="0.01"
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">License</h3>
                <div className="space-y-3">
                  {licenses.map(license => (
                    <label key={license.id} className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="license"
                        value={license.id}
                        checked={publishOptions.license === license.id}
                        onChange={() => setPublishOptions({ 
                          ...publishOptions, 
                          license: license.id as PublishOptions['license'] 
                        })}
                        className="mr-3 mt-1"
                      />
                      <div>
                        <p className="font-semibold">{license.name}</p>
                        <p className="text-sm text-gray-600">{license.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {publishOptions.price > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Revenue Information</h4>
                  <p className="text-sm text-blue-800">
                    You'll receive 70% of each sale after payment processing fees.
                    For a ${publishOptions.price.toFixed(2)} component, you'll earn approximately 
                    ${(publishOptions.price * 0.7).toFixed(2)} per sale.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              By publishing, you agree to the marketplace terms and conditions
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing || !publishOptions.name || !publishOptions.description}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? 'Publishing...' : 'Publish Component'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};