# Vector Search Implementation Guide

## Overview

Revolutionary UI v3.3 introduces AI-powered semantic search using PostgreSQL pgvector extension with HNSW indexing for lightning-fast natural language component discovery.

## Setup

### 1. Initialize Vector Database

```bash
# Run the setup script to create vector tables
npm run setup:vector-search

# Generate embeddings for all components
npm run embeddings:generate:local
```

### 2. Configure Environment

```env
# .env.local
# OpenAI (optional - for high-quality embeddings)
OPENAI_API_KEY=your-api-key

# Alternative providers
TOGETHER_API_KEY=your-api-key
COHERE_API_KEY=your-api-key
```

## API Usage

### Semantic Search

```typescript
// Search for components using natural language
const response = await fetch('/api/search/semantic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'responsive data table with sorting and filtering',
    limit: 10,
    threshold: 0.7,
    filters: {
      framework: 'react',
      category: 'tables',
      tags: ['responsive', 'data']
    }
  })
});

const { results } = await response.json();
```

### Find Similar Components

```typescript
// Get similar components based on vector similarity
const response = await fetch(`/api/resources/${resourceId}/similar?limit=5`);
const { similar } = await response.json();
```

## Embedding Providers

### Provider Hierarchy

1. **OpenAI** (1536 dimensions) - Highest quality
2. **Together AI** (768 dimensions) - Fast and reliable
3. **Cohere** (1024 dimensions) - Good balance
4. **Local Model** (384 dimensions) - No API limits

### Local Embeddings

Using Transformers.js for offline embedding generation:

```javascript
import { LocalVectorService } from '@/services/local-vector-service';

const service = LocalVectorService.getInstance();
const embedding = await service.generateEmbedding('your text here');
```

## Database Schema

### ResourceEmbedding Table

```sql
CREATE TABLE "ResourceEmbedding" (
  id TEXT PRIMARY KEY,
  "resourceId" TEXT NOT NULL UNIQUE,
  embedding vector(1536),
  model TEXT DEFAULT 'text-embedding-ada-002',
  provider TEXT DEFAULT 'openai',
  version INTEGER DEFAULT 1,
  "contentHash" TEXT NOT NULL,
  "originalDimensions" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("resourceId") REFERENCES "resources"(id) ON DELETE CASCADE
);

-- HNSW index for fast similarity search
CREATE INDEX embedding_idx ON "ResourceEmbedding" 
USING hnsw (embedding vector_cosine_ops);
```

### SearchQuery Table

```sql
CREATE TABLE "SearchQuery" (
  id TEXT PRIMARY KEY,
  query TEXT NOT NULL,
  embedding vector(1536),
  provider TEXT DEFAULT 'openai',
  "resultCount" INTEGER DEFAULT 0,
  "searchDuration" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

## Performance Optimization

### Batch Processing

```typescript
// Process embeddings in batches
const batchSize = 10;
for (let i = 0; i < resources.length; i += batchSize) {
  const batch = resources.slice(i, i + batchSize);
  await Promise.all(batch.map(r => generateEmbedding(r)));
}
```

### Caching Strategy

- Embeddings are cached based on content hash
- Only regenerated when content changes
- Popular searches tracked for optimization

## Troubleshooting

### Common Issues

1. **OpenAI Quota Exceeded**
   - Solution: Use alternative providers or local embeddings
   
2. **Dimension Mismatch**
   - Solution: All embeddings normalized to 1536 dimensions
   
3. **Slow Search Performance**
   - Solution: Ensure HNSW index is created
   - Check: `\di` in psql to list indexes

### Debug Commands

```bash
# Check embedding count
psql -d your_database -c 'SELECT COUNT(*) FROM "ResourceEmbedding"'

# Test vector operations
npm run test:vector-search

# Regenerate specific embedding
npm run embeddings:update -- --resourceId=123
```

## Best Practices

1. **Content Preparation**
   - Include name, description, tags, and code snippets
   - Normalize text before embedding generation
   
2. **Search Optimization**
   - Use appropriate thresholds (0.7-0.8 recommended)
   - Apply filters to reduce search space
   
3. **Monitoring**
   - Track popular searches
   - Monitor embedding generation times
   - Analyze search performance metrics

## Future Enhancements

- [ ] Real-time embedding updates
- [ ] Multi-language support
- [ ] Custom embedding models
- [ ] Hybrid search (vector + keyword)
- [ ] Relevance feedback loop