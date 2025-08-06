/**
 * Unified Search Hook
 * 
 * React hook for easy integration of the unified search API
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { SearchOptions, SearchResponse, SearchResult } from '@/services/algolia-search-service';
import debounce from 'lodash.debounce';

interface UseUnifiedSearchOptions {
  debounceMs?: number;
  initialQuery?: string;
  initialType?: SearchOptions['type'];
  initialMode?: SearchOptions['searchMode'];
  autoSearch?: boolean;
}

interface UseUnifiedSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  totalResults: number;
  isLoading: boolean;
  error: Error | null;
  search: (options?: Partial<SearchOptions>) => Promise<void>;
  clearResults: () => void;
  searchOptions: Partial<SearchOptions>;
  setSearchOptions: (options: Partial<SearchOptions>) => void;
  suggestions: string[];
  getSuggestions: (query: string) => Promise<void>;
}

export function useUnifiedSearch(options: UseUnifiedSearchOptions = {}): UseUnifiedSearchReturn {
  const {
    debounceMs = 300,
    initialQuery = '',
    initialType = 'all',
    initialMode = 'hybrid',
    autoSearch = true,
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchOptions, setSearchOptions] = useState<Partial<SearchOptions>>({
    type: initialType,
    searchMode: initialMode,
    filters: {},
    limit: 20,
    page: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string, options: Partial<SearchOptions> = {}) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't search empty queries
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalResults(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: options.type || searchOptions.type || 'all',
        mode: options.searchMode || searchOptions.searchMode || 'hybrid',
        limit: String(options.limit || searchOptions.limit || 20),
        page: String(options.page || searchOptions.page || 0),
      });

      // Add filters
      const filters = options.filters || searchOptions.filters || {};
      if (filters.framework) params.append('framework', filters.framework);
      if (filters.category) params.append('category', filters.category);
      if (filters.tags) filters.tags.forEach(tag => params.append('tag', tag));
      if (filters.isFree !== undefined) params.append('free', String(filters.isFree));
      if (filters.isPremium !== undefined) params.append('premium', String(filters.isPremium));
      if (filters.hasTypescript !== undefined) params.append('typescript', String(filters.hasTypescript));

      const response = await fetch(`/api/search/unified?${params}`, {
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();
      
      setResults(data.results);
      setTotalResults(data.totalResults);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err);
        console.error('Search error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchOptions]);

  // Debounced search
  const debouncedSearch = useRef(
    debounce((searchQuery: string, options: Partial<SearchOptions> = {}) => {
      performSearch(searchQuery, options);
    }, debounceMs)
  ).current;

  // Search function
  const search = useCallback(async (options?: Partial<SearchOptions>) => {
    const searchQuery = options?.query || query;
    if (debounceMs > 0) {
      debouncedSearch(searchQuery, options);
    } else {
      await performSearch(searchQuery, options);
    }
  }, [query, debouncedSearch, performSearch, debounceMs]);

  // Get suggestions
  const getSuggestions = useCallback(async (suggestionQuery: string) => {
    if (!suggestionQuery || suggestionQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(suggestionQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error('Failed to get suggestions:', err);
    }
  }, []);

  // Auto search on query change
  useEffect(() => {
    if (autoSearch && query) {
      search();
    }
  }, [query, autoSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear results
  const clearResults = useCallback(() => {
    setResults([]);
    setTotalResults(0);
    setSuggestions([]);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return {
    query,
    setQuery,
    results,
    totalResults,
    isLoading,
    error,
    search,
    clearResults,
    searchOptions,
    setSearchOptions,
    suggestions,
    getSuggestions,
  };
}