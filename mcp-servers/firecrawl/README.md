# Firecrawl MCP Server

A Model Context Protocol (MCP) server for Firecrawl with advanced pagination and token management.

## Features

- **Automatic Token Management**: Prevents exceeding LLM token limits
- **Smart Pagination**: Splits large crawls into manageable chunks
- **Configurable Presets**: Multiple presets for different use cases
- **Model-Aware Limits**: Different token limits for different AI models
- **Content Chunking**: Automatically chunks oversized content
- **Cache Support**: Built-in caching for improved performance

## Installation

1. Clone or download this directory
2. Run the setup script:
   ```bash
   ./setup.sh
   ```
3. Update `.env` with your Firecrawl API key

## Configuration

### Presets

The server includes several presets optimized for different use cases:

| Preset | Max Tokens | Max Pages | Depth | Use Case |
|--------|------------|-----------|-------|----------|
| lightweight | 50,000 | 20 | 1 | Quick overviews |
| balanced | 100,000 | 50 | 2 | General use (default) |
| comprehensive | 150,000 | 100 | 3 | Deep analysis |
| api-safe | 30,000 | 10 | 1 | Rate-limited APIs |

### Model Token Limits

The server automatically applies appropriate token limits based on the model:

- GPT-4: 128,000 tokens
- Claude 3: 200,000 tokens
- Gemini Pro: 32,760 tokens
- GPT-3.5 Turbo: 16,385 tokens

## Usage

### Adding to MCP Client

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "node",
      "args": ["/path/to/firecrawl-mcp/dist/index.js"],
      "env": {
        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
      }
    }
  }
}
```

### Available Tools

#### firecrawl_scrape
Scrape a single URL with automatic token limit protection.

```typescript
await use_mcp_tool("firecrawl", "firecrawl_scrape", {
  url: "https://example.com",
  formats: ["markdown"],
  onlyMainContent: true,
  maxTokens: 50000  // Optional override
});
```

#### firecrawl_crawl
Crawl a website with automatic pagination based on token limits.

```typescript
await use_mcp_tool("firecrawl", "firecrawl_crawl", {
  url: "https://docs.example.com",
  maxDepth: 2,
  limit: 100,
  includePaths: ["/docs", "/api"],
  pageChunkSize: 10
});
```

#### firecrawl_search
Search and scrape results with token limit management.

```typescript
await use_mcp_tool("firecrawl", "firecrawl_search", {
  query: "AI development tools",
  limit: 20,
  scrapeResults: true,
  maxTokensPerResult: 5000
});
```

#### firecrawl_batch
Batch scrape multiple URLs with automatic chunking.

```typescript
await use_mcp_tool("firecrawl", "firecrawl_batch", {
  urls: ["url1", "url2", "url3"],
  formats: ["markdown"],
  maxTokensPerChunk: 80000
});
```

#### firecrawl_config
Configure settings and presets.

```typescript
// Get current configuration
await use_mcp_tool("firecrawl", "firecrawl_config", {
  action: "get"
});

// Change preset
await use_mcp_tool("firecrawl", "firecrawl_config", {
  action: "set_preset",
  preset: "api-safe"
});

// Update model token limit
await use_mcp_tool("firecrawl", "firecrawl_config", {
  action: "update_tokens",
  model: "custom-model",
  tokenLimit: 50000
});
```

#### firecrawl_usage
Get token usage statistics.

```typescript
await use_mcp_tool("firecrawl", "firecrawl_usage", {
  reset: false  // Set to true to reset stats
});
```

## Examples

### Example 1: Crawl Documentation Site

```typescript
// Use code-analysis preset for documentation
await use_mcp_tool("firecrawl", "firecrawl_config", {
  action: "set_preset",
  preset: "comprehensive"
});

// Crawl with pagination
const result = await use_mcp_tool("firecrawl", "firecrawl_crawl", {
  url: "https://docs.example.com",
  maxDepth: 3,
  includePaths: ["/docs", "/api", "/guides"]
});

// Result will contain multiple chunks if content exceeds token limits
```

### Example 2: Safe Search with Token Limits

```typescript
// Switch to API-safe preset
await use_mcp_tool("firecrawl", "firecrawl_config", {
  action: "set_preset",
  preset: "api-safe"
});

// Search with automatic truncation
const results = await use_mcp_tool("firecrawl", "firecrawl_search", {
  query: "machine learning frameworks comparison",
  limit: 10,
  maxTokensPerResult: 3000
});
```

### Example 3: Batch Processing Large URL Lists

```typescript
const urls = [/* list of 50 URLs */];

// Process in chunks to avoid token limits
const result = await use_mcp_tool("firecrawl", "firecrawl_batch", {
  urls: urls,
  maxTokensPerChunk: 80000  // Will create multiple chunks
});

// Check token usage
const usage = await use_mcp_tool("firecrawl", "firecrawl_usage", {});
console.log(`Total tokens used: ${usage.totalTokens}`);
```

## Token Management Strategy

1. **Automatic Chunking**: Content exceeding limits is automatically chunked
2. **Safety Factor**: 80% of actual limits used to prevent errors
3. **Progressive Loading**: Crawls return partial results when limits reached
4. **Cursor Support**: Resume crawls from where they stopped

## Troubleshooting

### Common Issues

1. **Token limit exceeded errors**
   - Switch to a smaller preset (e.g., "lightweight" or "api-safe")
   - Reduce `limit` or `maxDepth` parameters
   - Enable `onlyMainContent` to reduce content size

2. **Rate limiting**
   - Use "api-safe" preset which includes delays
   - Reduce `pageChunkSize` for smaller batches

3. **Memory issues with large crawls**
   - Process results in chunks
   - Use pagination cursors to resume
   - Clear token usage stats regularly

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Clean build
npm run clean
```

## License

MIT