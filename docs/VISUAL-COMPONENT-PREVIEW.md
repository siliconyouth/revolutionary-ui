# Visual Component Preview System

The Visual Component Preview System brings UI components to life with interactive previews, live code examples, and customizable playgrounds directly in the Revolutionary UI catalog.

## Overview

The preview system transforms static component documentation into an interactive experience where developers can:
- See components in action with live previews
- Experiment with different props and configurations
- Copy production-ready code
- Open components in external sandboxes
- Track component usage and popularity

## Features

### 🎯 Live Component Previews
- **Real-time Rendering**: Components render live in isolated iframes
- **Multiple Frameworks**: Support for React, Vue, Angular, Svelte, and more
- **Responsive Preview**: Test components at different screen sizes
- **Theme Support**: Preview components with different themes

### 🎮 Interactive Playgrounds
- **Visual Controls**: Adjust props with intuitive UI controls
- **Live Code Updates**: See code changes reflected instantly
- **Export Options**: Export to CodeSandbox, StackBlitz, or copy code
- **Preset Variations**: Quick access to common component configurations

### 📊 Analytics & Insights
- **Usage Tracking**: Monitor which components are most viewed
- **Interaction Metrics**: Track playground usage and code copies
- **Performance Data**: Component load times and bundle sizes
- **Popularity Trends**: Identify trending components

### 🔧 Developer Experience
- **TypeScript Support**: Full type definitions for all preview APIs
- **Framework Agnostic**: Works with any UI framework
- **Extensible**: Easy to add new preview providers
- **Performance Optimized**: Lazy loading and caching

## Architecture

### Database Schema

```sql
-- Core preview table
component_previews
├── id (UUID)
├── resource_id (FK to resources)
├── preview_type (live|static|sandbox|storybook|codepen)
├── preview_url
├── example_code
├── example_framework
├── example_dependencies (JSONB)
├── is_interactive
├── is_responsive
└── performance_metrics

-- Playground configuration
playground_templates
├── id (UUID)
├── resource_id (FK)
├── template_name
├── base_code
├── prop_controls (JSONB)
└── customization_options

-- Preview variations
preview_variations
├── id (UUID)
├── preview_id (FK)
├── name
├── props_override
└── code_snippet

-- Analytics tracking
preview_analytics
├── preview_id (FK)
├── view_count
├── interaction_count
├── copy_count
└── date
```

### Component Structure

```typescript
// Main preview component
<ComponentPreview
  preview={previewData}
  resourceName="Button Component"
  onOpenSandbox={handleSandbox}
/>

// Renders:
// - Preview iframe/image
// - Code editor with syntax highlighting
// - Interactive playground controls
// - Export/share options
```

## Implementation Guide

### Adding a Preview to a Component

1. **Create Preview Data**:
```typescript
const preview: ComponentPreviewType = {
  resourceId: 'component-id',
  previewType: 'live',
  exampleFramework: 'react',
  previewUrl: 'https://example.com/preview',
  exampleCode: `<Button>Click me</Button>`,
  exampleDependencies: {
    'react': '^18.0.0',
    '@ui/button': '^1.0.0'
  },
  isInteractive: true,
  isResponsive: true
};
```

2. **Add Playground Template** (optional):
```typescript
const playgroundTemplate: PlaygroundTemplate = {
  templateName: 'Button Playground',
  baseCode: `<Button variant="{{variant}}">{{text}}</Button>`,
  baseProps: {
    variant: 'primary',
    text: 'Click me'
  },
  propControls: {
    variant: {
      type: 'select',
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' }
      ]
    },
    text: {
      type: 'text',
      defaultValue: 'Click me'
    }
  }
};
```

3. **Create Preview via API**:
```typescript
await fetch('/api/preview', {
  method: 'POST',
  body: JSON.stringify({
    ...preview,
    playgroundTemplate
  })
});
```

### Preview Types

#### Live Preview
- Components render in real-time
- Supports hot reloading
- Best for interactive components

#### Static Preview
- Screenshot or GIF of component
- Faster loading
- Good for complex components

#### Sandbox Preview
- Embeds from CodeSandbox/StackBlitz
- Full IDE experience
- Best for complete examples

#### Storybook Preview
- Embeds Storybook stories
- Shows all component states
- Great for design systems

## API Reference

### REST Endpoints

```bash
# List previews
GET /api/preview?resourceId=xxx&framework=react

# Get specific preview
GET /api/preview/:id

# Create preview
POST /api/preview

# Update preview
PATCH /api/preview/:id

# Delete preview
DELETE /api/preview/:id

# Track analytics
POST /api/preview/analytics
```

### React Hooks

```typescript
// Track preview analytics
const { trackView, trackInteraction, trackCopy } = usePreviewAnalytics(previewId);

// Load preview data
const { preview, loading, error } = usePreview(previewId);

// Manage playground state
const { props, updateProp, resetProps } = usePlayground(template);
```

## Preview Providers

### Supported Providers

1. **CodeSandbox**
   - Best for: React, Vue, Angular
   - Features: Full IDE, npm support
   - Limits: 50 dependencies

2. **StackBlitz**
   - Best for: TypeScript projects
   - Features: WebContainers, offline support
   - Limits: Node.js APIs

3. **CodePen**
   - Best for: Quick demos
   - Features: Social sharing
   - Limits: No npm packages

4. **Custom Iframe**
   - Best for: Self-hosted previews
   - Features: Full control
   - Limits: CORS restrictions

### Adding a Custom Provider

```typescript
class MyPreviewProvider implements PreviewProvider {
  name = 'my-provider';
  
  async createPreview(config: PreviewConfig): Promise<string> {
    // Generate preview URL
    return `https://my-provider.com/embed/${id}`;
  }
  
  supports(framework: string): boolean {
    return ['react', 'vue'].includes(framework);
  }
}
```

## Performance Optimization

### Lazy Loading
- Previews load on-demand
- Intersection Observer for viewport detection
- Placeholder images while loading

### Caching Strategy
- CDN for static previews
- Service Worker for offline support
- LocalStorage for user preferences

### Bundle Optimization
- Code splitting per framework
- Dynamic imports for providers
- Tree shaking unused features

## Security Considerations

### Iframe Sandboxing
```html
<iframe
  sandbox="allow-scripts allow-same-origin"
  src={trustedUrl}
/>
```

### Content Security Policy
```javascript
// Only allow trusted domains
const allowedDomains = [
  'codesandbox.io',
  'stackblitz.com',
  'codepen.io'
];
```

### Input Validation
- Sanitize all user inputs
- Validate preview URLs
- Check dependencies for vulnerabilities

## Usage Examples

### Basic Preview
```tsx
<ComponentPreview
  preview={{
    id: '123',
    previewType: 'live',
    previewUrl: 'https://example.com/button',
    exampleCode: '<Button>Click</Button>',
    exampleFramework: 'react'
  }}
  resourceName="Button"
/>
```

### With Playground
```tsx
<ComponentPreview
  preview={previewWithPlayground}
  resourceName="Card Component"
  onOpenSandbox={() => {
    // Open in CodeSandbox
  }}
/>
```

### Analytics Tracking
```tsx
function MyPreview() {
  const { trackView, trackCopy } = usePreviewAnalytics('preview-123');
  
  useEffect(() => {
    trackView();
  }, []);
  
  const handleCopy = () => {
    trackCopy();
    // Copy code
  };
}
```

## Best Practices

1. **Keep Examples Focused**: Show one concept per preview
2. **Provide Variations**: Include common use cases
3. **Document Props**: Clear descriptions for playground controls
4. **Optimize Performance**: Minimize bundle sizes
5. **Test Responsiveness**: Ensure previews work on all devices
6. **Track Analytics**: Monitor what users find helpful

## Troubleshooting

### Preview Not Loading
- Check CORS headers
- Verify iframe permissions
- Confirm URL is accessible

### Playground Not Updating
- Check prop control configuration
- Verify template placeholders
- Console for errors

### Performance Issues
- Reduce preview complexity
- Enable lazy loading
- Check bundle sizes

## Future Enhancements

- **AI-Generated Previews**: Auto-create from component code
- **Collaborative Editing**: Real-time playground sharing
- **Version History**: Track preview changes over time
- **A/B Testing**: Compare component variations
- **Mobile App**: Native preview experience

## Conclusion

The Visual Component Preview System transforms how developers discover and evaluate UI components, making it easier to find the perfect component for any project.