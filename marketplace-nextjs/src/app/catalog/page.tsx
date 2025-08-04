'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Eye,
  Code2,
  Play,
  Star,
  Download,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CatalogResource {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: {
    name: string;
    slug: string;
  };
  resourceType: {
    name: string;
  };
  githubStars: number;
  npmDownloads: number;
  isTypescript: boolean;
  isFeatured: boolean;
  hasPreview: boolean;
  previewCount: number;
  frameworks: string[];
  thumbnailUrl?: string;
}

interface CatalogFilters {
  search: string;
  category: string;
  resourceType: string;
  framework: string;
  hasPreview: boolean;
  isTypescript: boolean;
  sortBy: 'popularity' | 'name' | 'recent' | 'stars';
}

export default function CatalogPage() {
  const [resources, setResources] = useState<CatalogResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<CatalogFilters>({
    search: '',
    category: 'all',
    resourceType: 'all',
    framework: 'all',
    hasPreview: false,
    isTypescript: false,
    sortBy: 'popularity'
  });
  
  const [categories, setCategories] = useState<Array<{id: string, name: string, slug: string}>>([]);
  const [resourceTypes, setResourceTypes] = useState<Array<{id: string, name: string}>>([]);
  const [frameworks, setFrameworks] = useState<string[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [catResponse, typeResponse] = await Promise.all([
        fetch('/api/catalog/categories'),
        fetch('/api/catalog/resource-types')
      ]);

      const catData = await catResponse.json();
      const typeData = await typeResponse.json();

      setCategories(catData.categories || []);
      setResourceTypes(typeData.types || []);
      
      // Extract unique frameworks from initial load
      const frameworkSet = new Set<string>();
      catData.categories?.forEach((cat: any) => {
        cat.resources?.forEach((res: any) => {
          res.frameworks?.forEach((f: string) => frameworkSet.add(f));
        });
      });
      setFrameworks(Array.from(frameworkSet).sort());
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.resourceType !== 'all') params.append('type', filters.resourceType);
      if (filters.framework !== 'all') params.append('framework', filters.framework);
      if (filters.hasPreview) params.append('hasPreview', 'true');
      if (filters.isTypescript) params.append('typescript', 'true');
      params.append('sortBy', filters.sortBy);

      const response = await fetch(`/api/catalog/resources?${params}`);
      const data = await response.json();
      
      setResources(data.resources || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof CatalogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">UI Component Catalog</h1>
        <p className="text-xl text-gray-600">
          Browse over 10,000+ UI components from the best libraries and frameworks
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-2xl font-bold">10,000+</div>
          <div className="text-gray-600">Components</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">50+</div>
          <div className="text-gray-600">Frameworks</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">1,000+</div>
          <div className="text-gray-600">With Live Preview</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold">500+</div>
          <div className="text-gray-600">Interactive Playgrounds</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-8">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search components..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilter('category', value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </Select>

            <Select
              value={filters.resourceType}
              onValueChange={(value) => updateFilter('resourceType', value)}
            >
              <option value="all">All Types</option>
              {resourceTypes.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))}
            </Select>

            <Select
              value={filters.framework}
              onValueChange={(value) => updateFilter('framework', value)}
            >
              <option value="all">All Frameworks</option>
              {frameworks.map(fw => (
                <option key={fw} value={fw}>{fw}</option>
              ))}
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value) => updateFilter('sortBy', value as any)}
            >
              <option value="popularity">Most Popular</option>
              <option value="stars">Most Stars</option>
              <option value="recent">Recently Updated</option>
              <option value="name">Name (A-Z)</option>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={filters.hasPreview ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('hasPreview', !filters.hasPreview)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button
                variant={filters.isTypescript ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('isTypescript', !filters.isTypescript)}
              >
                TS
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/catalog/preview/${resource.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  {resource.thumbnailUrl && (
                    <div className="h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                      <img 
                        src={resource.thumbnailUrl} 
                        alt={resource.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{resource.name}</h3>
                      {resource.isFeatured && (
                        <Badge className="bg-yellow-500">Featured</Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {resource.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{resource.category.name}</Badge>
                      <Badge variant="secondary">{resource.resourceType.name}</Badge>
                      {resource.isTypescript && <Badge className="bg-blue-500">TS</Badge>}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-3">
                        {resource.githubStars > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {formatNumber(resource.githubStars)}
                          </span>
                        )}
                        {resource.npmDownloads > 0 && (
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {formatNumber(resource.npmDownloads)}
                          </span>
                        )}
                      </div>
                      
                      {resource.hasPreview && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Eye className="w-4 h-4" />
                          {resource.previewCount} preview{resource.previewCount !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    
                    {resource.frameworks.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex flex-wrap gap-1">
                          {resource.frameworks.slice(0, 3).map(fw => (
                            <Badge key={fw} variant="outline" className="text-xs">
                              {fw}
                            </Badge>
                          ))}
                          {resource.frameworks.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{resource.frameworks.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <Link key={resource.id} href={`/catalog/preview/${resource.slug}`}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{resource.name}</h3>
                      {resource.isFeatured && (
                        <Badge className="bg-yellow-500">Featured</Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{resource.description}</p>
                    
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{resource.category.name}</Badge>
                      <Badge variant="secondary">{resource.resourceType.name}</Badge>
                      {resource.isTypescript && <Badge className="bg-blue-500">TS</Badge>}
                      
                      {resource.githubStars > 0 && (
                        <span className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4" />
                          {formatNumber(resource.githubStars)}
                        </span>
                      )}
                      
                      {resource.hasPreview && (
                        <span className="flex items-center gap-1 text-sm text-green-600">
                          <Eye className="w-4 h-4" />
                          {resource.previewCount} preview{resource.previewCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}