# Chakra UI v3 Component Patterns Analysis

## Overview
Chakra UI v3 is a complete rewrite focusing on performance, speed, and consistency. It combines Ark UI (headless library) with Panda CSS (styling APIs) and Park UI (design system) to create a unified ecosystem.

## Key Architectural Changes

### From Closed to Open Components
- **v2**: Closed, monolithic components
- **v3**: Open, compound components by default
- Easier composition and reduced maintenance
- More flexibility for developers

### Unified Ecosystem
1. **Ark UI**: Headless component library
2. **Panda CSS**: Styling APIs
3. **Park UI**: Design system layer
4. **Chakra UI v3**: Complete solution

## Component Categories

### Layout Components
- **Box**: Most abstract styling component
- **Center**: Centering utility
- **SimpleGrid**: Responsive grid layout
- **Stack**: Vertical/horizontal layouts
- **Container**: Responsive container
- **Flex**: Flexbox utilities

### Form Components
- **Input**: Text input fields
- **NumberInput**: Numeric inputs with controls
- **Select**: Dropdown selections
- **Textarea**: Multi-line text input
- **FileUpload**: File upload component
- **Checkbox**: Boolean selection
- **Radio**: Single selection from options
- **Switch**: Toggle switches
- **Slider**: Range selection
- **PinInput**: OTP/PIN entry

### Display Components
- **Card**: Content containers
- **Badge**: Status indicators
- **Alert**: Feedback messages
- **Table**: Data tables
- **Skeleton**: Loading placeholders
- **Avatar**: User representations
- **Image**: Responsive images
- **Tooltip**: Contextual information

### Typography
- **Heading**: Semantic headings (h1-h6)
- **Text**: Body text component
- **Highlight**: Text highlighting
- **Code**: Inline code display
- **Kbd**: Keyboard key display

### Interactive Components
- **Collapsible**: Expandable content
- **Pagination**: Page navigation
- **Rating**: Star ratings
- **Tabs**: Tabbed interfaces
- **Accordion**: Collapsible panels
- **Menu**: Dropdown menus
- **Popover**: Floating content
- **Modal**: Dialog windows
- **Drawer**: Slide-out panels

### Advanced Components
- **Combobox**: Text input + listbox combination
- **QRCode**: QR code generator
- **DatePicker**: Date selection
- **ColorPicker**: Color selection
- **TagsInput**: Multi-value input
- **RangeSlider**: Multi-handle slider

## Design Patterns

### Compound Component Pattern
```tsx
// v3 approach - open and composable
<Card.Root>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Body>
    <Card.Description>Description</Card.Description>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card.Root>
```

### Design Tokens
- Consistent spacing scale
- Semantic color tokens
- Typography scales
- Shadow system
- Border radius tokens
- Animation tokens

### Styling Approach

#### Recipe System (replacing styleConfig)
```tsx
// v3 Recipe pattern
const buttonRecipe = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  variants: {
    size: {
      sm: { height: '8', px: '3' },
      md: { height: '10', px: '4' },
      lg: { height: '12', px: '6' },
    },
    variant: {
      solid: { bg: 'blue.500', color: 'white' },
      outline: { borderWidth: '1px', borderColor: 'blue.500' },
    },
  },
})
```

#### Slot Recipes (for compound components)
```tsx
const cardRecipe = slotRecipe({
  slots: ['root', 'header', 'body', 'footer'],
  base: {
    root: { borderWidth: '1px', borderRadius: 'lg' },
    header: { p: '4', borderBottomWidth: '1px' },
    body: { p: '4' },
    footer: { p: '4', borderTopWidth: '1px' },
  },
})
```

## Accessibility Features

1. **WAI-ARIA Compliance**: All components follow ARIA guidelines
2. **Keyboard Navigation**: Full keyboard support
3. **Focus Management**: Proper focus trapping and restoration
4. **Screen Reader Support**: Semantic HTML and ARIA labels
5. **Color Contrast**: WCAG AA/AAA compliance
6. **Reduced Motion**: Respects prefers-reduced-motion

## Server Components Support

### Next.js RSC Compatibility
- Works with React Server Components
- Client components marked with 'use client'
- Optimized bundle splitting
- Streaming support

### Usage Pattern
```tsx
// Server Component
export default function Page() {
  return (
    <Box>
      <Heading>Server Rendered</Heading>
      <ClientButton />
    </Box>
  )
}

// Client Component
'use client'
export function ClientButton() {
  return <Button onClick={() => alert('Clicked')}>Click me</Button>
}
```

## Theming System

### Theme Structure
```tsx
const theme = {
  tokens: {
    colors: { /* color tokens */ },
    spacing: { /* spacing scale */ },
    fonts: { /* font families */ },
  },
  semanticTokens: {
    colors: {
      'bg.primary': { value: { base: 'white', _dark: 'gray.900' } },
    },
  },
  recipes: { /* component recipes */ },
  slotRecipes: { /* compound component recipes */ },
}
```

### Dark Mode
- Built-in dark mode support
- Semantic color tokens
- Automatic color scheme detection
- Manual toggle support

## Performance Optimizations

1. **Zero Runtime CSS-in-JS**: Using Panda CSS
2. **Tree Shaking**: Only import what you use
3. **Code Splitting**: Automatic component splitting
4. **Lazy Loading**: Built-in lazy loading support
5. **Memoization**: Optimized re-renders

## Migration from v2

### Key Changes
1. Remove @emotion/styled and framer-motion
2. Install updated @chakra-ui/react
3. Replace styleConfig with recipes
4. Update import paths
5. Adopt compound component syntax

### Deprecated Features
- styleConfig and multiStyleConfig
- Some prop names changed
- Component APIs updated
- Theme structure modified

## Best Practices

1. **Use Compound Components**: Leverage the new open architecture
2. **Design Tokens First**: Build with tokens for consistency
3. **Accessibility**: Always include ARIA labels and keyboard support
4. **Performance**: Use dynamic imports for large components
5. **Type Safety**: Leverage TypeScript for better DX

## CLI and Tooling

### Chakra CLI
```bash
# Add snippets to project
npx @chakra-ui/cli snippet add

# Generate component
npx @chakra-ui/cli generate

# Check accessibility
npx @chakra-ui/cli a11y
```

### Snippets System
- Pre-built component patterns
- Customizable templates
- Easy integration
- Type-safe by default

## Future Roadmap

- More components (25+ already added)
- Enhanced animation system
- Better form handling
- Advanced data components
- Mobile-specific patterns