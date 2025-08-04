# CLAUDE.md - Revolutionary UI Factory System

This file provides guidance to Claude Code (claude.ai/code) when working with the Revolutionary UI Factory System.

**CRITICAL INSTRUCTION**: Always read `CLAUDE_CONTEXT.md` FIRST before starting any work. This file contains comprehensive project context, conventions, and critical information that must be loaded into your context window. The context file is automatically maintained and updated with project-specific patterns, decisions, and accumulated knowledge.

## Quick Start
1. Read `CLAUDE_CONTEXT.md` for full project context
2. Check recent commits with `git log --oneline -10` 
3. Review package.json for current version and dependencies
4. Understand the factory pattern architecture before making changes

## Project Overview

The Revolutionary UI Factory System is a groundbreaking approach to UI component generation that achieves 60-95% code reduction through intelligent factory patterns and AI-powered generation.

**Current Version**: 3.3.0 (as of August 4, 2025)

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

### 🔍 Semantic Search (v3.3)
- **Vector Embeddings**: PostgreSQL pgvector with HNSW indexing
- **Natural Language Search**: Find components using plain English
- **Multi-Provider Support**: OpenAI, Together AI, Cohere, and local models
- **183 Components Indexed**: Complete coverage of all marketplace resources
- **Similar Components**: Find related components using vector similarity

### ☁️ R2 Storage Integration (v3.3)
- **Complete Migration**: 115/116 resources stored in Cloudflare R2
- **Global CDN**: Components served from 200+ edge locations
- **Automatic Versioning**: Track all component versions
- **Backup & Restore**: Automated backup with configurable retention
- **Analytics**: Real-time storage metrics and usage tracking

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

### 📚 UI Component Catalog
- **Comprehensive Database**: 50+ frameworks, 10K+ components cataloged
- **Intelligent Classification**: Hierarchical categories with multi-dimensional tagging
- **Framework Intelligence**: Tracks compatibility across React, Vue, Angular, Svelte, etc.
- **Quality Metrics**: GitHub stars, npm downloads, performance scores
- **React Ecosystem**: Deep integration with awesome-react-components curation
- **Vercel Framework Matrix**: Complete framework feature tracking

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
│   │   ├── generators/
│   │   └── ui-generation-engine.ts
│   ├── lib/                # Utilities and helpers
│   │   └── factory/        # CLI and tools
│   ├── patterns/           # Design patterns
│   ├── frameworks/         # Framework adapters
│   └── types/              # TypeScript definitions
│       ├── ui-catalog.ts   # Component catalog types
│       ├── react-catalog.ts # React-specific types
│       └── frameworks-catalog.ts # Framework types
├── marketplace-nextjs/     # Web marketplace
├── prisma/                 # Database schemas
│   ├── schema.prisma       # Main schema
│   ├── schema-ui-catalog.prisma # UI catalog schema
│   └── schema-react-enhancements.prisma
├── scripts/                # Automation scripts
│   ├── catalog-data-import.ts
│   └── import-awesome-react-components.ts
├── datasets/               # AI training datasets
│   ├── ui-generation-*.jsonl
│   └── ...
├── analysis/               # UI library analysis
│   ├── shadcn-ui-components.md
│   ├── material-ui-patterns.md
│   └── ...
├── templates/              # Component templates
├── examples/               # Usage examples
└── docs/                   # Documentation
    ├── UI-CATALOG-*.md     # Catalog documentation
    ├── REACT-CATEGORIZATION-ANALYSIS.md
    └── FRAMEWORKS-CATALOG-SUMMARY.md
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

- [x] Visual component builder (v2.3.0)
- [x] More framework support (v3.0.0 - 50+ frameworks)
- [x] Enhanced AI models (v3.0.0 - GPT-4o, Claude 3)
- [x] UI Component Catalog (v3.0.0)
- [x] AI Fine-tuning Datasets (v3.0.0)
- [x] Visual component preview in catalog (v3.1.0)
- [x] Framework transpilation (v3.2.0) 
- [x] Production-Ready Marketplace with Stripe (v3.1.0)
- [ ] Plugin system
- [ ] Mobile app
- [ ] Enterprise features
- [ ] Community component submissions
- [ ] Design system integration (Figma, Sketch)
- [ ] Performance analytics dashboard
- [ ] Cloud components (SSR, edge deployment)

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
