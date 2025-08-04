'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search, Sparkles, Filter, X, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { ResourceCard } from '@/components/marketplace/ResourceCard';

interface SearchResult {
  id: string;
  score: number;
  resource: {
    id: string;
    name: string;
    slug: string;
    description: string;
    framework?: string;
    category?: string;
    tags: string[];
    author: {
      name: string;
      image?: string;
    };
    downloads: number;
    reviews: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface SearchFilters {
  framework?: string;
  category?: string;
  tags?: string[];
}

export function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  
  const debouncedQuery = useDebounce(query, 300);

  // Fetch popular searches
  useEffect(() => {
    fetch('/api/search/semantic')
      .then(res => res.json())
      .then(data => setPopularSearches(data.popularSearches || []))
      .catch(console.error);
  }, []);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/search/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          filters: searchFilters,
          limit: 20,
          threshold: 0.6,
        }),
      });

      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search when query or filters change
  useEffect(() => {
    performSearch(debouncedQuery, filters);
  }, [debouncedQuery, filters, performSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-500" />
          AI-Powered Component Search
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Find the perfect component using natural language
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what you're looking for... (e.g., 'responsive data table with sorting')"
            className="w-full pl-12 pr-12 py-4 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-700"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-14 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
          </div>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Framework</label>
              <select
                value={filters.framework || ''}
                onChange={(e) => setFilters({ ...filters, framework: e.target.value || undefined })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">All Frameworks</option>
                <option value="react">React</option>
                <option value="vue">Vue</option>
                <option value="angular">Angular</option>
                <option value="svelte">Svelte</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">All Categories</option>
                <option value="forms">Forms</option>
                <option value="tables">Tables</option>
                <option value="charts">Charts</option>
                <option value="navigation">Navigation</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <input
                type="text"
                placeholder="responsive, accessible"
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                  setFilters({ ...filters, tags: tags.length > 0 ? tags : undefined });
                }}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* Popular Searches */}
      {!query && popularSearches.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
            Popular searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => setQuery(search)}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              Search Results
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                ({results.length} components found)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <div key={result.id} className="relative">
                {/* Relevance score badge */}
                <div className="absolute -top-2 -right-2 z-10 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  {Math.round(result.score * 100)}% match
                </div>
                
                <ResourceCard resource={result.resource} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {!loading && query && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No components found matching "{query}"
          </p>
          <p className="text-sm text-gray-500">
            Try different keywords or remove some filters
          </p>
        </div>
      )}

      {/* Empty state */}
      {!query && !loading && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Start typing to search components
          </p>
          <p className="text-sm text-gray-500">
            Try: "responsive navigation menu" or "data visualization chart"
          </p>
        </div>
      )}
    </div>
  );
}