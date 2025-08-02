# GEMINI.md - Revolutionary UI

**Note**: This file was migrated from `CLAUDE.md` and `CLAUDE_CONTEXT.md`.

---

# CLAUDE.md - Revolutionary UI

This file provides guidance to Claude Code (claude.ai/code) when working with the Revolutionary UI Factory System.

**CRITICAL INSTRUCTION**: Always read `CLAUDE_CONTEXT.md` FIRST before starting any work. This file contains comprehensive project context, conventions, and critical information that must be loaded into your context window. The context file is automatically maintained and updated with project-specific patterns, decisions, and accumulated knowledge.

## Quick Start
1. Read `CLAUDE_CONTEXT.md` for full project context
2. Check recent commits with `git log --oneline -10` 
3. Review package.json for current version and dependencies
4. Understand the factory pattern architecture before making changes

## Project Overview

The Revolutionary UI Factory System is a groundbreaking approach to UI component generation that achieves 60-95% code reduction through intelligent factory patterns and AI-powered generation.

**Current Version**: 2.4.0 (as of August 1, 2025)

## Core Principles

1. **Factory-First Design**: Every component should be generated through factories
2. **Declarative Over Imperative**: Configuration-driven component generation
3. **AI Integration**: Leverage AI for intelligent component creation
4. **Framework Agnostic**: Support React, Vue, Angular, Svelte, and more
5. **Token Efficiency**: Minimize context usage through smart patterns

## Key Features

### 🏭 Factory System
- Component factories for forms, tables, dashboards, charts
- Layout factories for common UI patterns
- Specialized factories for game UIs, admin panels, analytics
- Average 71% code reduction across 32+ production components

### 🤖 AI Integration
- Multiple AI provider support (OpenAI, Anthropic, Google, etc.)
- AI-powered component generation from natural language
- Intelligent code analysis and optimization
- Context-aware suggestions

### 👥 Team Collaboration
- Real-time component sharing
- Team member management with roles
- Activity tracking and permissions
- Collaborative component development

### ☁️ Cloud Sync
- Push/pull components across devices
- Conflict resolution
- Version control integration
- Automatic backup

### 📊 Analytics
- Component usage tracking
- Code reduction metrics
- Performance insights
- Export capabilities

### 🛍️ Component Marketplace
- **Real Backend**: PostgreSQL database with Prisma ORM
- **E-commerce Features**: Browse, search, purchase, and publish
- **Payment Processing**: Stripe integration for premium components
- **Version Control**: Track updates with changelogs
- **Review System**: Community ratings and feedback
- **User Library**: Manage purchased, favorite, and published components
- **Analytics**: Download tracking and revenue metrics
- **Security**: Authentication, authorization, and secure payments

### 🔐 Private Registry
- NPM-compatible package registry
- Access token management
- Scoped packages
- Download statistics

## Development Workflow

**MANDATORY:** After any changes:

1. ✅ **Make Changes** - Implement features/fixes
2. ✅ **Run Tests** - `npm test` to ensure nothing breaks
3. ✅ **Update Documentation**:
   - `CHANGELOG.md` - Always update
   - `CLAUDE.md` - Update features/status
   - `CLAUDE_CONTEXT.md` - Update patterns/decisions
   - `README.md` - Update if public API changes
4. ✅ **Build** - `npm run build` to verify compilation
5. ✅ **Version Decision** - Patch, minor, or major?

## Architecture

```
revolutionary-ui/
├── src/
│   ├── core/               # Core factory implementations
│   │   ├── base-factory.ts
│   │   ├── component-factory.ts
│   │   └── factory-registry.ts
│   ├── factories/          # Specialized factories
│   │   ├── form/
│   │   ├── table/
│   │   ├── dashboard/
│   │   └── chart/
│   ├── ai/                 # AI integration
│   │   ├── providers/
│   │   └── generators/
│   ├── lib/                # Utilities and helpers
│   │   └── factory/        # CLI and tools
│   ├── patterns/           # Design patterns
│   └── frameworks/         # Framework adapters
├── marketplace-nextjs/     # Web marketplace
├── templates/              # Component templates
├── examples/               # Usage examples
└── docs/                   # Documentation
```

## Key Commands

```bash
# Development
npm run dev              # Start development mode
npm run build            # Build for production
npm test                 # Run tests
npm run lint             # Lint code

# CLI Usage
npx revolutionary-ui analyze    # Analyze project
npx revolutionary-ui setup      # Initial setup
npx revolutionary-ui generate   # Generate component

# Publishing
npm run publish:patch    # Publish patch version
npm run publish:minor    # Publish minor version
npm run publish:major    # Publish major version
```

## Factory Types

### Component Factories
- **FormFactory**: Dynamic forms with validation
- **TableFactory**: Data tables with sorting/filtering
- **DashboardFactory**: Admin dashboards
- **ChartFactory**: Data visualization

### Layout Factories
- **PageLayoutFactory**: Common page layouts
- **GridFactory**: Responsive grids
- **ModalFactory**: Modal dialogs
- **NavigationFactory**: Navigation components

### Specialized Factories
- **GameUIFactory**: Game-specific components
- **AdminPanelFactory**: Admin interfaces
- **AnalyticsFactory**: Analytics dashboards
- **AuthFactory**: Authentication flows

## Best Practices

### Factory Creation
1. Extend from `BaseFactory` or appropriate base
2. Define clear configuration interfaces
3. Implement sensible defaults
4. Support multiple frameworks
5. Include comprehensive examples

### Component Generation
1. Start with factory selection
2. Configure declaratively
3. Preview before generating
4. Test generated code
5. Optimize for production

### AI Integration
1. Use appropriate prompts
2. Select suitable AI models
3. Review generated code
4. Iterate on results
5. Save successful patterns

## Testing Guidelines

- Unit tests for all factories
- Integration tests for CLI commands
- E2E tests for marketplace features
- Performance benchmarks
- Framework compatibility tests

## Security Considerations

- Validate all user inputs
- Sanitize generated code
- Secure API endpoints
- Protect access tokens
- Regular dependency updates

## Performance Optimization

- Lazy load factories
- Optimize bundle size
- Cache generated components
- Minimize API calls
- Use CDN for assets

## Common Issues & Solutions

### Issue: Factory not found
**Solution**: Ensure factory is registered in factory-registry.ts

### Issue: Framework compatibility
**Solution**: Check framework adapter implementation

### Issue: AI generation fails
**Solution**: Verify API keys and provider status

### Issue: Component styling broken
**Solution**: Check CSS framework configuration

## Future Roadmap

- [ ] Visual component builder
- [ ] More framework support
- [ ] Enhanced AI models
- [ ] Plugin system
- [ ] Mobile app
- [ ] Enterprise features

## Contributing

1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Write comprehensive tests
5. Update documentation
6. Submit pull request

## Support

- GitHub Issues: Bug reports and feature requests
- Discussions: General questions and ideas
- Documentation: https://revolutionary-ui.com/docs
- Email: vladimir@dukelic.com

---

Remember: The goal is to revolutionize UI development through intelligent automation while maintaining code quality and developer experience.

---
# CLAUDE_CONTEXT.md - Revolutionary UI

This context file provides comprehensive information for Claude Code to work effectively with the Revolutionary UI Factory System. It follows best practices for context engineering and is designed to maximize Claude's understanding and capabilities.

Last Updated: August 1, 2025 | Version: 2.1.0

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

## Project Identity

**Name**: Revolutionary UI Factory System
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

---
This file is automatically updated. Do not edit manually.
---
