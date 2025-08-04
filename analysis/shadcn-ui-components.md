# Shadcn/UI Component Analysis

## Overview
Shadcn/UI is a modern component library that provides copy-paste React components built with Radix UI and Tailwind CSS. It emphasizes customization and ownership of code.

## Key Design Principles
1. **Copy-paste approach**: Components are not installed as dependencies but copied into your project
2. **Built on Radix UI**: Accessible, unstyled primitives
3. **Tailwind CSS styling**: Utility-first CSS framework
4. **TypeScript first**: Full type safety
5. **Dark mode support**: Built-in theming capabilities

## Component Patterns Analyzed

### Button Component
- **Variants**: default, secondary, destructive, outline, ghost, link
- **Sizes**: default, sm, lg, icon
- **States**: loading, disabled
- **Composition**: Can use `asChild` prop for polymorphic behavior
- **Icon support**: Leading/trailing icons, icon-only buttons
- **Accessibility**: Proper ARIA attributes, keyboard navigation

Example patterns:
```tsx
// Basic button
<Button>Button</Button>

// With variant
<Button variant="outline">Outline</Button>

// With icon
<Button variant="outline" size="sm">
  <IconGitBranch /> New Branch
</Button>

// Loading state
<Button disabled>
  <Loader2Icon className="animate-spin" />
  Please wait
</Button>

// As link
<Button asChild>
  <Link href="/login">Login</Link>
</Button>
```

### Accordion Component
- **Type modes**: single, multiple
- **Collapsible**: Optional collapsible behavior
- **Animation**: Smooth expand/collapse transitions
- **Accessibility**: WAI-ARIA compliant
- **Customizable**: Trigger and content separation

Key features:
- Keyboard navigation (Arrow keys, Home, End)
- Screen reader announcements
- Customizable animations
- Default expanded state support

## Common Patterns Across Components

1. **Compound Components**: Most components use compound pattern (e.g., Accordion + AccordionItem + AccordionTrigger + AccordionContent)

2. **Prop Forwarding**: Components forward refs and spread props for maximum flexibility

3. **Variant System**: Consistent variant prop across components using class-variance-authority (cva)

4. **Size System**: Consistent sizing options (sm, default, lg)

5. **Dark Mode**: All components support dark mode through Tailwind's dark: prefix

6. **Accessibility First**: Built on Radix UI primitives ensuring WCAG compliance

## Styling Approach

- Uses Tailwind CSS utility classes
- cn() utility for conditional classes
- CSS variables for theming
- Consistent spacing scale (4px base)
- Consistent color palette with semantic naming

## Component Categories

1. **Layout Components**: Card, Sheet, Sidebar, Separator
2. **Form Components**: Input, Select, Checkbox, Radio, Switch, Textarea
3. **Navigation**: Navigation Menu, Breadcrumb, Tabs, Menubar
4. **Feedback**: Toast, Alert, Progress, Badge
5. **Overlay**: Dialog, Drawer, Popover, Tooltip, Hover Card
6. **Data Display**: Table, Data Table, Accordion, Collapsible
7. **Date & Time**: Calendar, Date Picker
8. **Advanced**: Command, Combobox, Context Menu

## Best Practices Identified

1. **Composition over Configuration**: Prefer compound components over complex props
2. **Accessibility by Default**: All interactive components are keyboard navigable
3. **Responsive Design**: Mobile-first approach with responsive utilities
4. **Performance**: Use of React.forwardRef, proper memoization
5. **Developer Experience**: TypeScript autocompletion, clear prop interfaces