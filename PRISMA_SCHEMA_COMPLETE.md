# Revolutionary UI - Complete Database Schema Documentation

## Overview

The Revolutionary UI database schema is designed to support a comprehensive component marketplace, team collaboration, AI-powered generation, and enterprise features. Built with PostgreSQL via Supabase and managed through Prisma ORM.

## Database Models

### 🔐 User & Authentication

#### User
Central user model with role-based access control.
- **Roles**: USER, CREATOR, MODERATOR, ADMIN
- **Relations**: Owns resources, teams, projects, submissions
- **Features**: OAuth support, activity tracking, AI configurations

#### Account & Session
NextAuth.js compatible models for OAuth and session management.

### 📦 Component Library & Marketplace

#### Resource
The core component/resource model.
- **Types**: Component, Hook, Utility, Pattern
- **Features**: Multi-framework support, quality scores, marketplace pricing
- **Metadata**: Dependencies, bundle size, performance metrics

#### Category & Tag
Hierarchical categorization and tagging system.
- **Categories**: Nested structure with icons and sorting
- **Tags**: Flexible tagging for search and filtering

#### Preview
Interactive component previews.
- **Types**: LIVE, STATIC, SANDBOX, IFRAME
- **Features**: Framework-specific examples, responsive preview

### 🤖 AI Provider System

#### AIProvider
Configurable AI providers (OpenAI, Anthropic, Google, etc.).
- **Capabilities**: Chat, completion, embedding, vision, image
- **Configuration**: API endpoints, environment variables

#### AIModel
Specific models for each provider.
- **Pricing**: Cost per 1000 tokens (input/output)
- **Features**: Function calling, streaming support

#### AIUsage
Track AI usage for billing and analytics.
- **Metrics**: Token counts, cost estimation
- **Context**: Generated components, prompts

### 👥 Team Collaboration

#### Team
Organization unit for collaboration.
- **Features**: Billing integration, member management
- **Roles**: OWNER, ADMIN, MEMBER, VIEWER

#### Project
Team or personal projects.
- **Settings**: Framework, language, styling preferences
- **Components**: Project-specific component library

#### TeamResource
Shared resources within teams.

### 📚 Private Registry

#### PrivatePackage
NPM-compatible private packages.
- **Scoping**: @company/package-name format
- **Access**: Token-based authentication

#### PackageVersion
Versioned package releases.
- **Metadata**: Dependencies, tarball storage
- **Tags**: latest, beta, alpha

### 📊 Analytics & Monitoring

#### ComponentAnalytics
Track component usage and performance.
- **Events**: VIEW, PREVIEW, DOWNLOAD, GENERATE, etc.
- **Metrics**: Load time, render time, bundle size

#### PerformanceMetric
System-wide performance tracking.
- **Types**: API response, page load, generation time

#### ActivityLog
Audit trail for all system actions.

### 📢 Community & Submissions

#### ComponentSubmission
Community-contributed components.
- **Status**: DRAFT, SUBMITTED, IN_REVIEW, APPROVED, PUBLISHED
- **Review**: Quality scores, checklist, feedback

#### SubmissionReviewChecklist
Standardized review criteria.
- **Categories**: Code quality, documentation, testing, security

### 🔧 System Management

#### FeatureFlag
Dynamic feature rollout.
- **Targeting**: User/team specific, percentage rollout
- **Conditions**: Complex targeting rules

#### SystemConfig
Global configuration storage.
- **Security**: Secret flag for sensitive data

#### Notification
Multi-channel notification system.
- **Types**: Submissions, purchases, team invites, etc.

## Key Features

### 1. Multi-Framework Support
Resources support multiple frameworks (React, Vue, Angular, Svelte, etc.) with framework-specific examples and transpilation.

### 2. Quality Assurance
- Automated quality scores (code, documentation, design)
- Peer review system
- Submission guidelines and checklists

### 3. Monetization
- Premium components with Stripe integration
- Creator earnings and payout tracking
- Platform fee management

### 4. Enterprise Features
- Team collaboration with role-based access
- Private package registry
- Advanced analytics and monitoring
- Feature flags for gradual rollouts

### 5. AI Integration
- Multiple AI provider support
- Usage tracking and billing
- Component generation history

## Database Indexes

Strategic indexes for optimal performance:
- User lookups: email, role
- Resource queries: slug, category, author, published status
- Analytics: timestamps, event types
- Search: tags, frameworks, names

## Security Considerations

1. **Row-Level Security**: Implemented via Supabase RLS
2. **Encrypted Fields**: API keys, tokens
3. **Audit Trail**: Complete activity logging
4. **Access Control**: Role-based permissions

## Sample Queries

### Find Featured Components
```sql
SELECT r.*, array_agg(t.name) as tags
FROM resources r
LEFT JOIN _ResourceTags rt ON r.id = rt.A
LEFT JOIN tags t ON rt.B = t.id
WHERE r.is_featured = true 
  AND r.is_published = true
GROUP BY r.id
ORDER BY r.published_at DESC;
```

### Team Component Usage
```sql
SELECT 
  t.name as team_name,
  COUNT(DISTINCT tr.resource_id) as shared_components,
  COUNT(DISTINCT p.id) as projects
FROM teams t
LEFT JOIN team_resources tr ON t.id = tr.team_id
LEFT JOIN projects p ON t.id = p.team_id
GROUP BY t.id;
```

### AI Usage by Provider
```sql
SELECT 
  ap.name as provider,
  am.display_name as model,
  SUM(au.total_tokens) as total_tokens,
  SUM(au.estimated_cost) as total_cost
FROM ai_usage au
JOIN ai_providers ap ON au.provider_id = ap.id
JOIN ai_models am ON au.model_id = am.id
GROUP BY ap.id, am.id
ORDER BY total_cost DESC;
```

## Migration Strategy

1. **Initial Setup**: `prisma db push` for development
2. **Production**: Use migrations with `prisma migrate`
3. **Seeding**: Comprehensive seed script with sample data
4. **Backups**: Regular Supabase backups

## Future Enhancements

1. **Full-Text Search**: PostgreSQL FTS for components
2. **Time-Series Data**: Separate analytics database
3. **Caching Layer**: Redis for frequently accessed data
4. **GraphQL API**: Prisma + GraphQL integration