# Upstash Vector Setup Guide

## Overview

Revolutionary UI v3.4 uses Upstash Vector for serverless, managed vector search with automatic embedding generation.

## Benefits over pgvector

- **Serverless**: No database to manage or scale
- **Global Edge Network**: Low latency worldwide
- **Automatic Embeddings**: Built-in embedding generation
- **Simple Pricing**: Pay per request, not for idle resources
- **REST API**: Works everywhere, including edge functions

## Setup Instructions

### 1. Create Upstash Account

1. Go to [console.upstash.com](https://console.upstash.com)
2. Sign up for a free account
3. Navigate to Vector section

### 2. Create Vector Index

```bash
# Create a new index with these settings:
- Name: revolutionary-ui-components
- Dimensions: 1536 (or "Auto" for automatic)
- Metric: Cosine
- Reserved Capacity: Start with 0 (pay as you go)
```

### 3. Configure Environment

Add to your `.env.local`:

```env
# Upstash Vector
UPSTASH_VECTOR_REST_URL=https://talented-owl-123456.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your-token-here
```

### 4. Run Migration

```bash
# Migrate existing data from pgvector to Upstash
npm run migrate:to-upstash

# The script will:
# - Check Upstash credentials
# - Migrate all resources with metadata
# - Test search functionality
# - Show migration statistics
```

## API Usage

### Search Components

```typescript
// Natural language search
POST /api/search/semantic
{
  "query": "responsive data table with sorting",
  "limit": 10,
  "filters": {
    "framework": "react",
    "category": "tables"
  }
}
```

### Find Similar

```typescript
// Get similar components
GET /api/resources/{id}/similar?limit=5
```

## Upstash Features

### Automatic Embeddings

Upstash automatically generates embeddings for your text:

```typescript
// Just provide text, no need to generate embeddings
await index.upsert({
  id: 'resource-123',
  data: 'React data table component with sorting and filtering',
  metadata: { name: 'DataTable', framework: 'react' }
});
```

### Metadata Filtering

Filter results using metadata:

```typescript
// Upstash filter syntax
const filter = 'framework = "react" AND "responsive" in tags';

const results = await index.query({
  data: 'data table',
  filter,
  topK: 10
});
```

### Namespace Support

Organize vectors by namespace:

```typescript
// Separate namespaces for different content types
const componentsIndex = index.namespace('components');
const templatesIndex = index.namespace('templates');
```

## Cost Optimization

### Pricing Model

- **Free Tier**: 10,000 requests/day
- **Pay as You Go**: 
  - Queries: $0.4 per 100K requests
  - Updates: $1 per 100K requests
  - Storage: Included

### Best Practices

1. **Batch Operations**: Use batch upsert for multiple vectors
2. **Metadata Only Updates**: Update metadata without re-embedding
3. **Caching**: Cache popular searches on your end
4. **Monitoring**: Track usage in Upstash console

## Migration from pgvector

### Data Migration

```typescript
// The migration script handles:
1. Fetching all resources from PostgreSQL
2. Creating searchable text from metadata
3. Batch uploading to Upstash
4. Verifying migration success
```

### API Compatibility

The API remains the same:

```typescript
// Before (pgvector)
const service = LocalVectorService.getInstance();
const results = await service.searchSimilar(query);

// After (Upstash)
const service = UpstashVectorService.getInstance();
const results = await service.searchSimilar(query);
```

## Monitoring

### Upstash Console

Monitor your usage at `console.upstash.com`:

- Request count
- Storage usage
- Latency metrics
- Error rates

### API Stats

```typescript
// Get index statistics
const stats = await upstashService.getStats();
console.log(`Vectors: ${stats.vectorCount}`);
console.log(`Index Size: ${stats.indexSize}`);
```

## Troubleshooting

### Common Issues

1. **Rate Limits**
   - Solution: Implement retry logic with exponential backoff
   - Use batch operations to reduce requests

2. **Filter Syntax Errors**
   - Check Upstash filter documentation
   - Test filters in Upstash console

3. **Dimension Mismatch**
   - Upstash auto-detects dimensions
   - Ensure consistent text preprocessing

### Debug Mode

```typescript
// Enable debug logging
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  cache: false, // Disable cache for debugging
});
```

## Advanced Features

### Hybrid Search

Combine vector and keyword search:

```typescript
// Use metadata for keyword filtering
const results = await index.query({
  data: query,
  filter: `name CONTAINS "${keyword}"`,
  topK: 10
});
```

### Multi-Modal Embeddings

Upstash supports various embedding models:

```typescript
// Configure different models (coming soon)
await index.upsert({
  id: 'resource-123',
  data: componentCode,
  metadata: { type: 'code' },
  model: 'code-embedding-model'
});
```

## Next Steps

1. Sign up for Upstash account
2. Create vector index
3. Add credentials to `.env.local`
4. Run migration script
5. Test search functionality
6. Monitor usage in console