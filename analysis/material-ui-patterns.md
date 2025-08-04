# Material UI Component Patterns Analysis

## Overview
Material UI (MUI) is a comprehensive React component library implementing Google's Material Design system. It provides enterprise-ready components with extensive customization options.

## Button Component Patterns

### Variants
1. **Text** (default) - Low emphasis, typically for less important actions
2. **Contained** - High emphasis with elevation and fill
3. **Outlined** - Medium emphasis, border without fill

### Key Features
- **Colors**: primary, secondary, success, error, warning, info + custom colors
- **Sizes**: small, medium (default), large
- **States**: hover, focus, disabled, loading
- **Icons**: startIcon, endIcon props for icon placement
- **Loading**: Built-in loading state with spinner (v6.4.0+)

### Code Patterns
```tsx
// Basic variants
<Button variant="text">Text</Button>
<Button variant="contained">Contained</Button>
<Button variant="outlined">Outlined</Button>

// With icons
<Button startIcon={<DeleteIcon />}>Delete</Button>
<Button endIcon={<SendIcon />}>Send</Button>

// Loading state
<Button loading loadingIndicator="Loading…">Submit</Button>

// Icon button
<IconButton aria-label="delete">
  <DeleteIcon />
</IconButton>

// File upload
<Button component="label">
  Upload
  <VisuallyHiddenInput type="file" />
</Button>
```

### Icon Button Patterns
- Commonly used in app bars and toolbars
- Requires `aria-label` for accessibility
- Supports all color props and sizes
- Can be combined with Badge component
- Loading state support

### Accessibility Features
- Proper ARIA labels required for icon buttons
- Keyboard navigation support
- Focus visible states
- Disabled state handling with pointer-events

### Customization Approaches
1. **sx prop** - One-off styling
2. **styled()** - Reusable styled components
3. **Theme overrides** - Global customization
4. **CSS classes** - Direct className application

## Material Design Principles

1. **Elevation & Depth**: Use of shadows to show hierarchy
2. **Motion**: Meaningful transitions and animations
3. **Color System**: Primary, secondary, error, warning, info, success
4. **Typography**: Roboto font with predefined scales
5. **Spacing**: 8px grid system
6. **States**: Hover, focus, pressed, selected, disabled

## Component Architecture

### ButtonBase
- Foundation for all button-like components
- Handles ripple effects
- Touch/click interactions
- Keyboard navigation
- Can be used for custom interactive components

### Props Pattern
- Extensive prop APIs for customization
- Component prop for polymorphic behavior
- Ref forwarding for DOM access
- Event handlers (onClick, etc.)

## Best Practices

1. **Variant Selection**:
   - Text: Dialog actions, cards
   - Contained: Primary actions
   - Outlined: Secondary actions

2. **Color Usage**:
   - Primary: Main brand actions
   - Secondary: Supporting actions
   - Error: Destructive actions
   - Success: Positive confirmations

3. **Icon Usage**:
   - Always include text labels when possible
   - Use aria-label for icon-only buttons
   - Consider tooltip for additional context

4. **Loading States**:
   - Disable interaction during loading
   - Show loading indicator
   - Maintain button dimensions

5. **Accessibility**:
   - Meaningful button text
   - Proper ARIA attributes
   - Keyboard navigation support
   - Focus management