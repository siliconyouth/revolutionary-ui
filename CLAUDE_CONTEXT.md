# CLAUDE_CONTEXT.md - Revolutionary UI Factory System

This context file provides comprehensive information for Claude Code to work effectively with the Revolutionary UI Factory System. It follows best practices for context engineering and is designed to maximize Claude's understanding and capabilities.

Last Updated: August 4, 2025 | Version: 3.2.0

## Table of Contents
1. [Project Identity](#project-identity)
2. [Technical Stack](#technical-stack)
3. [Core Concepts](#core-concepts)
4. [Architecture Patterns](#architecture-patterns)
5. [Code Conventions](#code-conventions)
6. [Common Tasks](#common-tasks)
7. [Error Patterns](#error-patterns)
8. [Performance Considerations](#performance-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Process](#deployment-process)
11. [UI Component Catalog](#ui-component-catalog)
12. [AI Training Datasets](#ai-training-datasets)

## Project Identity

**Name**: Revolutionary UI
**Purpose**: Achieve 60-95% code reduction in UI development through intelligent factory patterns
**Target Users**: Frontend developers, UI/UX teams, full-stack developers
**Core Value**: Transform imperative UI code into declarative configurations

### Key Metrics
- **Average Code Reduction**: 71%
- **Components Transformed**: 32+ production components
- **Time Saved**: 70-90% in component development
- **Frameworks Supported**: React, Vue, Angular, Svelte, Solid

## Technical Stack

### Core Technologies
```typescript
{
  "runtime": "Node.js 18+",
  "language": "TypeScript 5.3+",
  "packageManager": "npm 9+",
  "bundler": "Rollup + ESBuild",
  "testing": "Jest + Testing Library",
  "linting": "ESLint + Prettier",
  "documentation": "TypeDoc + Markdown"
}
```

### Dependencies
```json
{
  "commander": "^12.0.0",      // CLI framework
  "chalk": "^5.3.0",           // Terminal styling
  "ora": "^8.0.1",             // Loading spinners
  "prompts": "^2.4.2",         // Interactive prompts
  "zod": "^3.22.4",            // Schema validation
  "axios": "^1.6.0",           // HTTP client
  "express": "^4.18.0",        // API server
  "supabase": "^1.110.0"       // Backend services
}
```

### Framework Adapters
- React 18+ with hooks and suspense
- Vue 3+ with composition API
- Angular 15+ with standalone components
- Svelte 4+ with SvelteKit
- Solid.js with fine-grained reactivity

## Core Concepts

### Factory Pattern
```typescript
// Every UI component is generated through a factory
interface Factory<TConfig, TOutput> {
  name: string
  version: string
  configure(config: TConfig): void
  generate(): TOutput
  validate(): ValidationResult
}
```

### Configuration-Driven Development
```typescript
// Components are defined as configurations, not code
const tableConfig: TableConfig = {
  columns: [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', filterable: true }
  ],
  features: ['sorting', 'filtering', 'pagination'],
  styling: 'tailwind'
}
```

### AI Integration Pattern
```typescript
// AI enhances but doesn't replace developer control
interface AIContext {
  prompt: string
  model: 'gpt-4' | 'claude-3' | 'gemini-pro'
  temperature: number
  maxTokens: number
  examples?: ComponentExample[]
}
```

## Architecture Patterns

### Factory Hierarchy
```
BaseFactory (abstract)
  ├── ComponentFactory
  │   ├── FormFactory
  │   ├── TableFactory
  │   ├── DashboardFactory
  │   └── ChartFactory
  ├── LayoutFactory
  │   ├── PageLayoutFactory
  │   ├── GridFactory
  │   └── NavigationFactory
  └── SpecializedFactory
      ├── GameUIFactory
      ├── AdminPanelFactory
      └── AnalyticsFactory
```

### Plugin Architecture
```typescript
// Factories can be extended via plugins
interface FactoryPlugin {
  name: string
  version: string
  factory: typeof BaseFactory
  register(): void
  unregister(): void
}
```

### State Management
- Local state: Component-level useState/ref
- Global state: Context/Provide-Inject pattern
- Server state: React Query/SWR patterns
- Form state: Controlled with validation

## Code Conventions

### Naming Conventions
```typescript
// Files
component-name.factory.ts    // Factory files
component-name.config.ts     // Configuration types
component-name.test.ts       // Test files

// Classes/Interfaces
class ComponentFactory       // PascalCase for classes
interface TableConfig        // PascalCase for interfaces
type ColumnDef = {...}       // PascalCase for types

// Functions/Variables
const generateComponent      // camelCase for functions
let tableConfig             // camelCase for variables
const MAX_ROWS = 1000       // UPPER_SNAKE_CASE for constants
```

### Code Style
```typescript
// Always use explicit types
const processData = (data: TableData[]): ProcessedData => {
  // Function implementation
}

// Prefer composition over inheritance
const EnhancedTable = compose(
  withSorting,
  withFiltering,
  withPagination
)(BaseTable)

// Use early returns for clarity
if (!isValid) return null
if (isLoading) return <Spinner />
return <Component />
```

### Documentation Standards
```typescript
/**
 * Generates a data table component with advanced features
 * @param config - Table configuration object
 * @returns Generated component code
 * @example
 * const table = new TableFactory()
 * const code = table.generate({
 *   columns: [...],
 *   features: ['sorting', 'filtering']
 * })
 */
```

## Common Tasks

### Creating a New Factory
```bash
# Use the CLI scaffolding
npx revolutionary-ui create-factory MyCustomFactory

# Or manually:
# 1. Create factory file in src/factories/
# 2. Extend appropriate base class
# 3. Register in factory-registry.ts
# 4. Add tests
# 5. Update documentation
```

### Adding Framework Support
```typescript
// 1. Create adapter in src/frameworks/
export class SvelteAdapter implements FrameworkAdapter {
  name = 'svelte'
  version = '4.0'
  
  generateComponent(config: ComponentConfig): string {
    // Svelte-specific generation
  }
}

// 2. Register adapter
FrameworkRegistry.register(new SvelteAdapter())
```

### Implementing AI Generation
```typescript
// 1. Define AI context
const context: AIContext = {
  prompt: 'Create a user profile card',
  model: 'gpt-4',
  temperature: 0.7,
  examples: [...]
}

// 2. Use AI generator
const generator = new AIComponentGenerator()
const result = await generator.generate(context)

// 3. Validate and refine
const validated = validator.check(result)
```

## Error Patterns

### Common Errors and Solutions

#### Factory Registration
```typescript
// Error: Factory not found
// Solution: Ensure factory is registered
FactoryRegistry.register('table', TableFactory)
```

#### Configuration Validation
```typescript
// Error: Invalid configuration
// Solution: Use Zod schemas
const schema = z.object({
  columns: z.array(columnSchema),
  features: z.array(z.string())
})
```

#### Framework Compatibility
```typescript
// Error: Framework not supported
// Solution: Check adapter exists
if (!FrameworkRegistry.has(framework)) {
  throw new Error(`Framework ${framework} not supported`)
}
```

### Error Handling Strategy
```typescript
try {
  const result = await factory.generate(config)
  return { success: true, data: result }
} catch (error) {
  logger.error('Factory generation failed', { error, config })
  return { 
    success: false, 
    error: error.message,
    suggestion: getSuggestion(error)
  }
}
```

## Performance Considerations

### Optimization Strategies
1. **Lazy Loading**: Load factories on demand
2. **Caching**: Cache generated components
3. **Bundle Splitting**: Separate framework adapters
4. **Tree Shaking**: Remove unused factories
5. **Memoization**: Cache expensive computations

### Performance Metrics
```typescript
// Track generation performance
const metrics = {
  generationTime: measureTime(() => factory.generate()),
  bundleSize: getBundleSize(generatedCode),
  codeReduction: calculateReduction(before, after),
  complexityScore: analyzeComplexity(generatedCode)
}
```

### Memory Management
- Clear caches periodically
- Dispose of unused factories
- Limit concurrent generations
- Use streaming for large outputs

## Testing Strategy

### Test Categories
1. **Unit Tests**: Individual factory methods
2. **Integration Tests**: Factory combinations
3. **Framework Tests**: Each adapter
4. **Performance Tests**: Generation speed
5. **Snapshot Tests**: Generated output

### Test Patterns
```typescript
describe('TableFactory', () => {
  let factory: TableFactory
  
  beforeEach(() => {
    factory = new TableFactory()
  })
  
  it('should generate valid table component', () => {
    const config = mockTableConfig()
    const result = factory.generate(config)
    
    expect(result).toMatchSnapshot()
    expect(validateComponent(result)).toBe(true)
  })
  
  it('should handle edge cases', () => {
    const config = { columns: [] }
    expect(() => factory.generate(config)).toThrow()
  })
})
```

### Coverage Requirements
- Minimum 80% code coverage
- 100% coverage for critical paths
- E2E tests for all user workflows
- Performance regression tests

## Deployment Process

### Release Workflow
```bash
# 1. Update version
npm version patch|minor|major

# 2. Run checks
npm run lint
npm test
npm run build

# 3. Generate changelog
npm run changelog

# 4. Publish
npm publish

# 5. Tag release
git tag v2.1.0
git push --tags
```

### CI/CD Pipeline
```yaml
# GitHub Actions workflow
on: [push, pull_request]
jobs:
  test:
    - npm install
    - npm run lint
    - npm test
    - npm run build
  
  publish:
    if: startsWith(github.ref, 'refs/tags/v')
    - npm publish
    - create GitHub release
```

### Environment Configuration
```bash
# Development
NODE_ENV=development
API_URL=http://localhost:3001
LOG_LEVEL=debug

# Production
NODE_ENV=production
API_URL=https://api.revolutionary-ui.com
LOG_LEVEL=error
```

## Advanced Patterns

### Composition Pattern
```typescript
// Combine multiple factories
const EnhancedDashboard = compose(
  withCharts(ChartFactory),
  withTables(TableFactory),
  withForms(FormFactory)
)(DashboardFactory)
```

### Middleware Pattern
```typescript
// Add cross-cutting concerns
const factory = new TableFactory()
  .use(loggingMiddleware)
  .use(validationMiddleware)
  .use(performanceMiddleware)
```

### Event System
```typescript
// Subscribe to factory events
factory.on('beforeGenerate', (config) => {
  console.log('Generating with config:', config)
})

factory.on('afterGenerate', (result) => {
  analytics.track('component_generated', result)
})
```

## UI Component Catalog

### Database Schema Overview

The UI Component Catalog uses a comprehensive PostgreSQL database with 20+ tables:

#### Core Tables
- `resources` - Main catalog of UI components/libraries
- `categories` - Hierarchical categorization system
- `resource_types` - Component, Library, Framework, Tool classifications
- `paradigms` - Programming approaches (Functional, Class-Based, etc.)
- `tags` - Flexible tagging system
- `frameworks` - 50+ frameworks tracked with features

#### React-Specific Tables
- `react_component_features` - Hooks, styling, architecture patterns
- `react_ecosystem_compatibility` - Next.js, Gatsby, Remix support
- `component_dependencies` - Package dependency tracking
- `performance_metrics` - Bundle size, render performance

#### Framework Tables
- `framework_categories` - Full-stack, Frontend, SSG, Backend, etc.
- `framework_features` - SSR, SSG, ISR, TypeScript support
- `vercel_framework_metadata` - Vercel-specific optimizations

### Catalog Usage

```typescript
// Search for React components
const components = await searchComponents({
  framework: 'react',
  category: 'charts',
  features: {
    typescript: true,
    ssr: true,
    bundleSize: { max: 50 } // KB
  }
})

// Get framework recommendations
const frameworks = await recommendFrameworks({
  projectType: 'webapp',
  requirements: {
    ssr: true,
    typescript: true,
    ecosystem: 'react'
  }
})
```

### Import Scripts

```bash
# Import React components from awesome-react-components
ts-node scripts/import-awesome-react-components.ts

# Update catalog metrics
ts-node scripts/catalog-data-import.ts
```

## AI Training Datasets

### Dataset Structure

JSON Lines format with system prompts and examples:

```jsonl
{
  "system": "You are an expert UI developer...",
  "messages": [
    {"role": "user", "content": "Create a pricing table..."},
    {"role": "assistant", "content": "I'll create...```tsx..."}
  ]
}
```

### Available Datasets

1. **Pricing Components** (`ui-generation-pricing-components.jsonl`)
   - 6 comprehensive examples
   - Startup, SaaS, Enterprise patterns

2. **Form Components** (`ui-generation-form-components.jsonl`)
   - Contact forms, multi-step, dynamic builders

3. **Dashboard Components** (`ui-generation-dashboard-components.jsonl`)
   - Analytics, project management, financial

4. **Table/Data Display** (`ui-generation-table-components.jsonl`)
   - Data tables, kanban boards, grids

5. **Navigation** (`ui-generation-navigation-components.jsonl`)
   - Navbars, sidebars, breadcrumbs

6. **Modals/Dialogs** (`ui-generation-modal-components.jsonl`)
   - Modal systems, command palettes, sheets

7. **Cards** (`ui-generation-card-components.jsonl`)
   - Product cards, glassmorphism, 3D effects

8. **Notifications** (`ui-generation-notification-components.jsonl`)
   - Toasts, notification centers, snackbars

9. **Hero/Landing** (`ui-generation-hero-landing-components.jsonl`)
   - Hero sections, feature grids, CTAs

### UI Library Analysis

Comprehensive analysis of major UI libraries in `/analysis/`:
- shadcn/ui - Compound components, dark mode
- Material UI - Design system principles
- Ant Design - Enterprise patterns
- Tailwind UI - Premium components
- Chakra UI v3 - Open compound architecture
- Radix UI - Unstyled primitives
- v0.dev - AI generation patterns
- Vercel AI SDK - Generative UI
- Framer - No-code patterns

## Debugging Tips

### Enable Debug Mode
```bash
DEBUG=revolutionary:* npm run dev
```

### Inspect Factory State
```typescript
console.log(factory.inspect())
// Output: { name, version, config, state }
```

### Trace Generation
```typescript
const trace = factory.trace(config)
// Returns step-by-step generation process
```

## Security Guidelines

1. **Input Validation**: Always validate user input
2. **Code Sanitization**: Sanitize generated code
3. **API Security**: Use authentication tokens
4. **Dependency Scanning**: Regular security audits
5. **Content Security**: CSP headers for web app

## Resource Management

### Token Usage
- Optimize prompts for efficiency
- Batch similar requests
- Cache AI responses
- Monitor usage metrics

### API Rate Limiting
```typescript
const rateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000 // 1 minute
})
```

## Troubleshooting Guide

### Factory Issues
- Check registration in factory-registry
- Verify configuration schema
- Ensure framework adapter exists
- Review error logs

### Performance Issues
- Profile generation time
- Check bundle size
- Review caching strategy
- Optimize configurations

### Integration Issues
- Verify API endpoints
- Check authentication
- Review CORS settings
- Test network connectivity

## Future Considerations

### Upcoming Features
- Visual component builder
- Real-time collaboration
- Advanced AI models
- Plugin marketplace
- Mobile applications

### Migration Planning
- Backward compatibility
- Deprecation warnings
- Migration guides
- Version coexistence

---

## Quick Reference

### Essential Commands
```bash
npm run dev                 # Start development
npm test                    # Run tests
npm run build              # Build project
npm run analyze            # Analyze codebase
npx revolutionary-ui setup  # Initial setup
```

### Key Files
- `src/core/base-factory.ts` - Base factory class
- `src/lib/factory/cli.ts` - CLI implementation
- `src/index.ts` - Main entry point
- `factory-registry.ts` - Factory registration
- `package.json` - Project configuration

### Important URLs
- Repository: https://github.com/siliconyouth/revolutionary-ui-factory-system
- Documentation: https://revolutionary-ui.com/docs
- NPM Package: https://npm.im/@vladimirdukelic/revolutionary-ui
- Support: vladimir@dukelic.com

Remember: Context is king. The more context Claude has, the better the assistance.

## Recent Architectural Decisions

### UI Component Catalog (August 2025)
- Chose PostgreSQL + Prisma for type-safe database access
- Implemented hierarchical categorization with unlimited depth
- Multi-dimensional classification (type, category, paradigm, tags)
- Full-text search using PostgreSQL tsvector
- Historical metrics tracking for trend analysis

### Framework Intelligence (August 2025)
- Cataloged 50+ frameworks from Vercel documentation
- Created feature matrix tracking (SSR, SSG, ISR, etc.)
- Framework relationship mapping (based_on, works_with)
- Deployment platform compatibility tracking

### AI Training Strategy (August 2025)
- JSONL format for fine-tuning datasets
- 21st.dev-style component generation focus
- Comprehensive examples across 9 component categories
- Pattern extraction from top UI libraries

## Recent Updates (v3.2.0)

### Package Updates and Deprecation Fixes
- **Critical Updates**:
  - Puppeteer: Updated from v23 to v24, fixed deprecated APIs
  - OpenAI SDK: Migrated from v4 to v5 with new patterns
  - Mistral AI: Updated to v1.7.5 from v0.4.0
  - Environment Management: Migrated to @dotenvx/dotenvx

### API Migration Patterns
```typescript
// Old (Deprecated)
import { PuppeteerLaunchOptions } from 'puppeteer'
await page.waitForTimeout(1000)

// New (Current)
import { LaunchOptions } from 'puppeteer'
await page.waitForFunction(() => true, { timeout: 1000 })
```

### AI Model Updates
```typescript
// Updated model references
const models = {
  openai: 'gpt-4o',        // was: gpt-4
  openaiMini: 'gpt-4o-mini', // was: gpt-3.5-turbo
  anthropic: 'claude-3-5-sonnet', // was: claude-3-sonnet
  google: 'gemini-1.5-pro'  // was: gemini-pro
}
```

### TypeScript Best Practices
- Always add explicit return types to functions
- Replace `any` with proper types or type assertions
- Use ES module imports instead of require() in TS files
- Ensure proper parameter ordering in method calls

### Environment Management
- Centralized .env.local at project root
- All scripts use: `dotenvx run -f .env.local -- <command>`
- Required environment variables: 16 (validated by check-env.js)

### UI Component Architecture
- Created shadcn/ui component stubs for missing modules
- All components use React.forwardRef pattern
- Proper TypeScript interfaces for all props

### Database Schema Updates
- Added FeatureUsage model for tracking feature usage
- Updated User model with featureUsages relation
- Schema validation with `npm run prisma:generate`
