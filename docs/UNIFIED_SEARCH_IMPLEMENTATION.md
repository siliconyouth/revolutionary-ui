# Unified Search Implementation

This document describes the comprehensive search implementation for Revolutionary UI that combines multiple search technologies for optimal performance and relevance.

## Overview

The unified search system integrates:
- **Algolia**: Fast keyword-based full-text search
- **Upstash Vector**: AI-powered semantic search
- **Upstash Redis**: High-performance caching layer
- **Prisma/Supabase**: Direct database queries
- **Documentation Search**: Markdown file indexing

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│  Search API  │────▶│   Cache     │
│  (React)    │     │   (Next.js)  │     │(Redis)      │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │                     │
                           ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │   Algolia    │     │   Vector    │
                    │  (Keyword)   │     │ (Semantic)  │
                    └──────────────┘     └─────────────┘
                           │                     │
                           └──────┬──────────────┘
                                  ▼
                           ┌──────────────┐
                           │   Database   │
                           │  (Supabase)  │
                           └──────────────┘
```

## Search Modes

### 1. Keyword Search (Algolia)
- Best for: Exact matches, typo tolerance, faceted search
- Speed: < 50ms
- Features: Highlighting, snippets, facets

### 2. Semantic Search (Upstash Vector)
- Best for: Natural language queries, similarity matching
- Speed: < 100ms  
- Features: AI embeddings, context understanding

### 3. Hybrid Search (Default)
- Combines both keyword and semantic results
- Deduplicates and merges scores
- Provides best overall relevance

## Setup

### 1. Environment Variables

```env
# Algolia
ALGOLIA_APP_ID=your-app-id
ALGOLIA_SEARCH_API_KEY=your-search-key  # Public, safe for frontend
ALGOLIA_ADMIN_API_KEY=your-admin-key    # Private, for indexing only

# Upstash Vector (already configured)
UPSTASH_VECTOR_REST_URL=https://your-index.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your-token
UPSTASH_VECTOR_NAMESPACE=revolutionary-ui-components

# Upstash Redis (already configured)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Search Configuration
SEARCH_MODE=hybrid              # keyword, semantic, or hybrid
SEARCH_CACHE_TTL=300           # Cache TTL in seconds
```

### 2. Index Your Data

```bash
# Index resources to Algolia
npm run index:algolia

# Index resources to Upstash Vector (already done)
npm run index:resources
```

## API Endpoints

### Unified Search
```http
GET /api/search/unified?q=react+table&type=components&mode=hybrid
```

Parameters:
- `q` or `query`: Search query (required)
- `type`: all, components, docs, resources
- `mode`: keyword, semantic, hybrid
- `framework`: Filter by framework
- `category`: Filter by category
- `tag`: Filter by tags (can be multiple)
- `free`: true/false
- `premium`: true/false
- `typescript`: true/false
- `limit`: Results per page (default: 20)
- `page`: Page number (default: 0)

Response:
```json
{
  "results": [
    {
      "id": "resource-id",
      "type": "component",
      "title": "Advanced Data Table",
      "description": "...",
      "framework": "react",
      "category": "Data Display",
      "tags": ["table", "data", "responsive"],
      "score": 0.95,
      "highlights": {
        "title": "Advanced <em>Data Table</em>",
        "description": "..."
      }
    }
  ],
  "totalResults": 167,
  "page": 0,
  "totalPages": 9,
  "processingTime": 45,
  "searchMode": "hybrid"
}
```

### Search Suggestions
```http
GET /api/search/suggestions?q=rea
```

Response:
```json
{
  "suggestions": ["react", "react table", "react form", "real-time", "responsive"]
}
```

### Documentation Search
```http
GET /api/search/docs?q=setup&category=guides
```

## React Integration

### Using the Hook

```tsx
import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';

function SearchComponent() {
  const {
    query,
    setQuery,
    results,
    totalResults,
    isLoading,
    error,
    search,
    suggestions,
    getSuggestions,
    setSearchOptions
  } = useUnifiedSearch({
    debounceMs: 300,
    autoSearch: true,
    initialMode: 'hybrid'
  });

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Get suggestions for autocomplete
    if (value.length >= 2) {
      getSuggestions(value);
    }
  };

  // Apply filters
  const applyFilters = () => {
    setSearchOptions({
      filters: {
        framework: 'react',
        isFree: true,
        hasTypescript: true
      }
    });
    search(); // Trigger new search
  };

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={handleSearch}
        placeholder="Search components..."
      />
      
      {/* Show suggestions */}
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map(suggestion => (
            <li key={suggestion} onClick={() => setQuery(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
      
      {/* Show results */}
      {isLoading && <div>Searching...</div>}
      {error && <div>Error: {error.message}</div>}
      
      <div>
        Found {totalResults} results
        {results.map(result => (
          <SearchResult key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}
```

### Direct API Usage

```typescript
// Search with fetch
const searchComponents = async (query: string) => {
  const params = new URLSearchParams({
    q: query,
    type: 'components',
    mode: 'hybrid',
    framework: 'react',
    free: 'true'
  });

  const response = await fetch(`/api/search/unified?${params}`);
  const data = await response.json();
  
  return data;
};

// Search documentation
const searchDocs = async (query: string) => {
  const response = await fetch(`/api/search/docs?q=${encodeURIComponent(query)}`);
  const data = await response.json();
  
  return data.results;
};
```

## Indexing

### Automatic Indexing

The system automatically indexes:
1. **Resources**: All published components from the database
2. **Documentation**: Markdown files in the docs directory
3. **Metadata**: Tags, categories, frameworks, etc.

### Manual Re-indexing

```bash
# Re-index everything
npm run index:algolia
npm run index:resources

# Clear and re-index
node -e "
  const { AlgoliaSearchService } = require('./src/services/algolia-search-service');
  const service = AlgoliaSearchService.getInstance();
  await service.clearIndices();
  await service.indexResources();
"
```

## Performance Optimization

### 1. Caching Strategy
- Search results: 5 minutes (300s)
- Suggestions: 5 minutes
- Documentation: 10 minutes
- Cache key includes query, filters, and page

### 2. Request Optimization
- Debounced search input (300ms default)
- Request cancellation for outdated searches
- Parallel execution of keyword and semantic search
- Result deduplication in hybrid mode

### 3. Index Configuration
- Custom ranking by downloads, favorites, rating
- Searchable attributes prioritization
- Faceted search for efficient filtering
- Distinct results to avoid duplicates

## Search Quality

### Relevance Tuning

1. **Algolia Settings**:
   - Searchable attributes order
   - Custom ranking metrics
   - Typo tolerance
   - Synonyms configuration

2. **Vector Search**:
   - 1024-dimension embeddings
   - Cosine similarity metric
   - Metadata filtering
   - Automatic embedding generation

3. **Hybrid Scoring**:
   - Keyword matches get 1.2x boost
   - Duplicate results average their scores
   - Sort by final score descending

### Adding Synonyms

```javascript
// Add to Algolia index settings
await index.saveSynonyms([
  {
    objectID: 'ui-components',
    type: 'synonym',
    synonyms: ['ui', 'components', 'widgets', 'elements']
  },
  {
    objectID: 'data-table',
    type: 'synonym',
    synonyms: ['table', 'grid', 'datagrid', 'datatable']
  }
]);
```

## Monitoring

### Search Analytics

```javascript
// Get search statistics
const stats = await algoliaService.getIndexStats();
console.log('Indexed items:', stats);

// Track popular searches (implement in API)
await trackSearch(query, resultsCount, userId);
```

### Performance Metrics
- Monitor response times in API headers
- Track cache hit rates
- Monitor Algolia/Upstash usage
- Set up alerts for slow queries

## Troubleshooting

### No Results Found
1. Check if data is indexed: `npm run index:algolia`
2. Verify Algolia credentials are correct
3. Check Vector namespace matches
4. Try different search modes

### Slow Search
1. Ensure Redis cache is working
2. Check network latency to services
3. Reduce result limit
4. Use more specific filters

### Relevance Issues
1. Adjust searchable attributes order
2. Update custom ranking
3. Try semantic search for natural queries
4. Add relevant synonyms

## Best Practices

1. **Index Updates**: Re-index when adding new content
2. **Cache Warming**: Pre-cache popular searches
3. **Error Handling**: Always handle search failures gracefully
4. **Security**: Never expose admin API keys
5. **Monitoring**: Track search metrics and user behavior

## Future Enhancements

1. **Personalization**: User-specific search results
2. **ML Ranking**: Learn from user interactions
3. **Multi-language**: Support for international content
4. **Voice Search**: Natural language processing
5. **Visual Search**: Search by component screenshots
6. **Real-time Updates**: Live index updates on content changes

---

The unified search system provides a powerful, flexible, and performant search experience that scales with your application needs.