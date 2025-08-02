import React, { useState, useEffect } from 'react';
import { 
  MarketplaceComponent, 
  MarketplaceFilter, 
  MarketplaceSort 
} from '../types';
import { getMarketplaceService } from '../services/marketplace-service';
import { ComponentNode } from '../../visual-builder/core/types';

interface MarketplaceBrowserProps {
  onImportComponent: (component: ComponentNode) => void;
  onClose: () => void;
  apiKey?: string;
}

export const MarketplaceBrowser: React.FC<MarketplaceBrowserProps> = ({
  onImportComponent,
  onClose,
  apiKey
}) => {
  const [components, setComponents] = useState<MarketplaceComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<MarketplaceComponent | null>(null);
  const [filter, setFilter] = useState<MarketplaceFilter>({});
  const [sort, setSort] = useState<MarketplaceSort>({ 
    field: 'downloads', 
    direction: 'desc' 
  });
  const [categories, setCategories] = useState<Array<{ id: string; name: string; count: number; icon: string }>>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'featured' | 'trending' | 'my-library'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const marketplaceService = getMarketplaceService(apiKey);

  useEffect(() => {
    loadCategories();
    loadComponents();
  }, [filter, sort, page, activeTab]);

  const loadCategories = async () => {
    try {
      const cats = await marketplaceService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadComponents = async () => {
    setLoading(true);
    try {
      let result;
      
      switch (activeTab) {
        case 'featured':
          const featured = await marketplaceService.getFeaturedComponents();
          result = {
            components: featured,
            total: featured.length,
            page: 1,
            totalPages: 1
          };
          break;
          
        case 'trending':
          const trending = await marketplaceService.getTrendingComponents('week');
          result = {
            components: trending,
            total: trending.length,
            page: 1,
            totalPages: 1
          };
          break;
          
        case 'my-library':
          const library = await marketplaceService.getUserLibrary();
          const libraryComponents = await Promise.all(
            library.purchased.map(id => marketplaceService.getComponent(id))
          );
          result = {
            components: libraryComponents,
            total: libraryComponents.length,
            page: 1,
            totalPages: 1
          };
          break;
          
        default:
          result = await marketplaceService.searchComponents(
            { ...filter, search: searchQuery },
            sort,
            page,
            20
          );
      }
      
      setComponents(result.components);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load components:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (component: MarketplaceComponent) => {
    try {
      const { component: componentData } = await marketplaceService.downloadComponent(component.id);
      onImportComponent(componentData);
      onClose();
    } catch (error) {
      console.error('Failed to import component:', error);
      alert('Failed to import component. Please try again.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadComponents();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Component Marketplace</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-6 mt-4">
            {(['browse', 'featured', 'trending', 'my-library'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`pb-2 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Filters */}
          <div className="w-64 border-r p-4 overflow-y-auto">
            <form onSubmit={handleSearch} className="mb-6">
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </form>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={!filter.category}
                    onChange={() => setFilter({ ...filter, category: undefined })}
                    className="mr-2"
                  />
                  <span>All Categories</span>
                </label>
                {categories.map(cat => (
                  <label key={cat.id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={cat.id}
                      checked={filter.category === cat.id}
                      onChange={() => setFilter({ ...filter, category: cat.id })}
                      className="mr-2"
                    />
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                      <span className="text-gray-500 text-sm">({cat.count})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Price</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filter.priceRange?.max === 0}
                    onChange={(e) => setFilter({
                      ...filter,
                      priceRange: e.target.checked ? { min: 0, max: 0 } : undefined
                    })}
                    className="mr-2"
                  />
                  <span>Free</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filter.premium === true}
                    onChange={(e) => setFilter({
                      ...filter,
                      premium: e.target.checked ? true : undefined
                    })}
                    className="mr-2"
                  />
                  <span>Premium</span>
                </label>
              </div>
            </div>

            {/* Sort Options */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Sort By</h3>
              <select
                value={`${sort.field}-${sort.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-') as [MarketplaceSort['field'], 'asc' | 'desc'];
                  setSort({ field, direction });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="downloads-desc">Most Downloaded</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="date-desc">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
            </div>
          </div>

          {/* Component Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : components.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No components found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {components.map(component => (
                    <ComponentCard
                      key={component.id}
                      component={component}
                      onSelect={setSelectedComponent}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Component Details Modal */}
        {selectedComponent && (
          <ComponentDetailsModal
            component={selectedComponent}
            onClose={() => setSelectedComponent(null)}
            onImport={() => handleImport(selectedComponent)}
          />
        )}
      </div>
    </div>
  );
};

// Component Card
interface ComponentCardProps {
  component: MarketplaceComponent;
  onSelect: (component: MarketplaceComponent) => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(component)}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative">
        {component.thumbnail ? (
          <img 
            src={component.thumbnail} 
            alt={component.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
            📦
          </div>
        )}
        {component.premium && (
          <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
            Premium
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{component.name}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{component.description}</p>
        
        {/* Meta */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              ⭐ {component.rating.toFixed(1)}
            </span>
            <span className="text-gray-500">
              {component.downloads} downloads
            </span>
          </div>
          <span className="font-semibold text-purple-600">
            {component.price === 0 ? 'Free' : `$${component.price}`}
          </span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          {component.author.avatar && (
            <img 
              src={component.author.avatar} 
              alt={component.author.name}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-sm text-gray-600">by {component.author.name}</span>
        </div>
      </div>
    </div>
  );
};

// Component Details Modal
interface ComponentDetailsModalProps {
  component: MarketplaceComponent;
  onClose: () => void;
  onImport: () => void;
}

const ComponentDetailsModal: React.FC<ComponentDetailsModalProps> = ({
  component,
  onClose,
  onImport
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'versions'>('overview');
  const [reviews, setReviews] = useState<any[]>([]);
  const [versions, setVersions] = useState<any[]>([]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-2">{component.name}</h3>
              <p className="text-gray-600">{component.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex gap-6">
            {(['overview', 'reviews', 'versions'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && ` (${component.reviews})`}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Preview */}
              {component.preview && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={component.preview} 
                    alt={component.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Component Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Version</dt>
                      <dd className="font-medium">{component.version}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Category</dt>
                      <dd className="font-medium">{component.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Downloads</dt>
                      <dd className="font-medium">{component.downloads.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Rating</dt>
                      <dd className="font-medium">⭐ {component.rating.toFixed(1)} ({component.reviews} reviews)</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Compatibility</h4>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-600 mb-1">Frameworks</dt>
                      <dd className="flex flex-wrap gap-1">
                        {component.framework.map(fw => (
                          <span key={fw} className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {fw}
                          </span>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-600 mb-1">Styling</dt>
                      <dd className="flex flex-wrap gap-1">
                        {component.styling.map(style => (
                          <span key={style} className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {style}
                          </span>
                        ))}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="font-semibold mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {component.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <p className="text-gray-500">Reviews coming soon...</p>
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-4">
              <p className="text-gray-500">Version history coming soon...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {component.price === 0 ? 'Free' : `$${component.price}`}
              </p>
              <p className="text-sm text-gray-600">
                by {component.author.name}
              </p>
            </div>
            <button
              onClick={onImport}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Import to Canvas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};