# AI Integration Guide

The Revolutionary UI Factory System now includes powerful AI capabilities for component generation, code analysis, and intelligent suggestions. This guide covers how to use and configure the AI features.

## Table of Contents

1. [Overview](#overview)
2. [Supported AI Providers](#supported-ai-providers)
3. [Configuration](#configuration)
4. [Using AI Features](#using-ai-features)
5. [API Reference](#api-reference)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Overview

The AI integration provides:

- **Natural Language Component Generation**: Describe components in plain English
- **Multi-Provider Support**: Choose from OpenAI, Anthropic, Google Gemini, or Mistral
- **Streaming Responses**: Real-time generation with progress updates
- **Context-Aware Suggestions**: Get improvements based on your project setup
- **Framework Transformation**: Convert components between frameworks
- **Code Analysis**: Performance, accessibility, security, and best practices checks

## Supported AI Providers

### OpenAI (GPT-4, GPT-3.5)
- **Best for**: Complex component generation, detailed code analysis
- **Models**: gpt-4-turbo-preview, gpt-4, gpt-3.5-turbo
- **Features**: Function calling, streaming, high accuracy

### Anthropic (Claude 3)
- **Best for**: Detailed explanations, long context understanding
- **Models**: claude-3-opus, claude-3-sonnet, claude-3-haiku
- **Features**: 200k token context, vision capabilities

### Google Gemini
- **Best for**: Fast responses, cost-effective generation
- **Models**: gemini-pro, gemini-pro-vision
- **Features**: Multi-modal support, competitive pricing

### Mistral
- **Best for**: Balanced performance and cost
- **Models**: mistral-large, mistral-medium, mistral-small
- **Features**: JSON mode, function calling

## Configuration

### 1. Environment Variables

Add your API keys to `.env.local`:

```bash
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-... # Optional

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Google Gemini
GOOGLE_AI_API_KEY=...

# Mistral
MISTRAL_API_KEY=...
```

### 2. Programmatic Configuration

```typescript
import { initializeAIProviders } from '@vladimirdukelic/revolutionary-ui'

initializeAIProviders({
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-turbo-preview',
    temperature: 0.7
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-opus-20240229'
  },
  gemini: {
    apiKey: process.env.GOOGLE_AI_API_KEY,
    model: 'gemini-pro'
  },
  mistral: {
    apiKey: process.env.MISTRAL_API_KEY,
    model: 'mistral-large-latest'
  },
  default: 'openai' // Set default provider
})
```

### 3. Web UI Configuration

Navigate to `/dashboard/settings/ai` to:
- Configure API keys securely
- Test connections
- Select preferred models
- Set default providers

## Using AI Features

### Component Generation

```typescript
import { aiProviderManager } from '@vladimirdukelic/revolutionary-ui'

// Basic generation
const provider = aiProviderManager.getProvider('openai')
const response = await provider.generateComponent(
  'Create a responsive pricing table with monthly/yearly toggle',
  {
    framework: 'React',
    componentType: 'table',
    styleSystem: 'tailwind'
  }
)

console.log(response.content) // Generated component code
```

### Streaming Generation

```typescript
// Stream responses for real-time updates
await provider.generateComponentStream(
  prompt,
  context,
  (chunk) => {
    console.log(chunk.content) // Partial content
    if (chunk.isComplete) {
      console.log('Generation complete!')
    }
  }
)
```

### Context-Aware Generation

```typescript
import { ContextAwareGenerator } from '@vladimirdukelic/revolutionary-ui'

const generator = new ContextAwareGenerator()

// Analyze your project
const context = await generator.analyzeProject('/path/to/project')

// Generate with project context
const response = await generator.generateComponent(
  'Create a user profile card',
  {
    stream: true,
    provider: 'anthropic',
    includeTests: true,
    includeStorybook: true
  }
)
```

### Get AI Suggestions

```typescript
// Get improvement suggestions for existing code
const suggestions = await provider.getSuggestions(
  componentCode,
  {
    framework: 'React',
    componentType: 'form',
    styleSystem: 'styled-components'
  }
)

console.log(suggestions)
// [
//   "Use React.memo to prevent unnecessary re-renders",
//   "Add aria-labels to form inputs for better accessibility",
//   "Extract validation logic into a custom hook",
//   ...
// ]
```

### Code Analysis

```typescript
// Analyze component for various aspects
const analysis = await provider.analyzeComponent(
  componentCode,
  'performance' // or 'accessibility', 'best-practices', 'security'
)

console.log(analysis.content)
// Detailed analysis with issues, recommendations, and code examples
```

### Framework Transformation

```typescript
// Transform component between frameworks
const vueComponent = await provider.transformComponent(
  reactComponentCode,
  'React',
  'Vue'
)

console.log(vueComponent.content)
// Vue 3 Composition API version of the component
```

## API Reference

### AIProvider Methods

#### `generateComponent(prompt, context?)`
Generate a component from natural language description.

**Parameters:**
- `prompt`: String description of the component
- `context`: Optional ComponentContext object

**Returns:** AIResponse with generated code

#### `generateComponentStream(prompt, context?, onChunk)`
Stream component generation for real-time updates.

**Parameters:**
- `prompt`: String description
- `context`: Optional ComponentContext
- `onChunk`: Callback function for stream chunks

#### `getSuggestions(code, context)`
Get improvement suggestions for existing code.

**Parameters:**
- `code`: Component source code
- `context`: ComponentContext with framework info

**Returns:** Array of suggestion strings

#### `analyzeComponent(code, analysisType)`
Analyze component for specific aspects.

**Parameters:**
- `code`: Component source code
- `analysisType`: 'performance' | 'accessibility' | 'best-practices' | 'security'

**Returns:** AIResponse with detailed analysis

#### `transformComponent(code, from, to)`
Transform component between frameworks.

**Parameters:**
- `code`: Source component code
- `from`: Source framework name
- `to`: Target framework name

**Returns:** AIResponse with transformed code

### Context Types

```typescript
interface ComponentContext {
  framework: string
  componentType: string
  existingComponents?: string[]
  projectStructure?: string
  dependencies?: string[]
  styleSystem?: string
  userPreferences?: Record<string, any>
}

interface AIResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  metadata?: Record<string, any>
}
```

## Best Practices

### 1. Choose the Right Provider

- **Complex Components**: Use GPT-4 or Claude 3 Opus
- **Simple Components**: GPT-3.5 or Mistral Small are sufficient
- **Long Context**: Claude 3 excels with large codebases
- **Budget Conscious**: Gemini or Mistral offer good value

### 2. Optimize Prompts

```typescript
// Good prompt
const prompt = `
Create a responsive data table component with:
- Sortable columns
- Pagination (10/25/50 items per page)
- Search/filter functionality
- Row selection with checkbox
- Export to CSV button
- Mobile-friendly card view
Use React with TypeScript and Tailwind CSS.
`

// Too vague
const prompt = "Make a table"
```

### 3. Use Context Effectively

```typescript
// Provide rich context for better results
const context = {
  framework: 'React',
  componentType: 'table',
  styleSystem: 'tailwind',
  existingComponents: ['Button', 'Card', 'Modal'],
  dependencies: ['react-table', 'date-fns'],
  userPreferences: {
    typescript: true,
    testingLibrary: 'jest',
    accessibility: 'wcag-aa'
  }
}
```

### 4. Handle Errors Gracefully

```typescript
try {
  const response = await provider.generateComponent(prompt, context)
  return response
} catch (error) {
  // Try fallback provider
  const fallbackResponse = await aiProviderManager.generateComponentWithFailover(
    prompt,
    context,
    'openai' // Preferred provider
  )
  return fallbackResponse
}
```

### 5. Cache Results

```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, AIResponse>({
  max: 100,
  ttl: 1000 * 60 * 60 // 1 hour
})

const cacheKey = `${prompt}-${framework}-${provider}`
const cached = cache.get(cacheKey)

if (cached) return cached

const response = await provider.generateComponent(prompt, context)
cache.set(cacheKey, response)
return response
```

## Troubleshooting

### Common Issues

#### "API key is invalid"
- Verify your API key is correct
- Check if the key has proper permissions
- Ensure no extra spaces or quotes

#### "Rate limit exceeded"
- Implement exponential backoff
- Use a different provider temporarily
- Upgrade your API plan

#### "Timeout error"
- Reduce prompt complexity
- Use streaming for long generations
- Increase timeout in provider config

#### "No providers configured"
- Ensure at least one API key is set
- Check environment variable names
- Verify initialization code runs

### Debug Mode

Enable debug logging:

```typescript
// Set debug mode
process.env.DEBUG = 'revolutionary:ai:*'

// Or use provider-specific debugging
const provider = new OpenAIProvider({
  apiKey: '...',
  debug: true
})
```

### Testing Connection

```bash
# Test via CLI
revolutionary-ui test-ai --provider openai

# Test via API
curl -X POST http://localhost:3000/api/ai/test \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "OpenAI",
    "config": {
      "apiKey": "sk-...",
      "model": "gpt-4"
    }
  }'
```

## Security Notes

1. **Never expose API keys in client-side code**
2. **Use environment variables for sensitive data**
3. **Implement rate limiting on your endpoints**
4. **Validate and sanitize AI-generated code**
5. **Monitor API usage and costs**

## Future Enhancements

- **Visual Component Builder**: Drag-and-drop with AI assistance
- **Multi-Agent Collaboration**: Multiple AIs working together
- **Fine-Tuned Models**: Custom models for your design system
- **Offline Mode**: Local model support
- **Voice Input**: Describe components verbally

---

For more information, see the [main documentation](./README.md) or visit [revolutionary-ui.com](https://revolutionary-ui.com).
