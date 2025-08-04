# Radix UI Primitive Patterns Analysis

## Overview
Radix UI is an open-source library of unstyled, accessible UI primitives for building high-quality, customizable design systems and web applications. It serves as the foundation for many modern component libraries including shadcn/ui.

## Core Philosophy

### Mission Statement
"Most UI components on the web are inaccessible, non-performant, and lacking important features." Radix UI solves this by providing robust, standards-compliant primitives.

### Key Principles

1. **Accessibility First**
   - WAI-ARIA design pattern compliance
   - Automatic ARIA attribute management
   - Comprehensive keyboard navigation
   - Focus management and trapping
   - Screen reader optimization

2. **Unstyled by Design**
   - No visual opinions
   - Complete styling freedom
   - Works with any CSS solution
   - Enables custom design systems

3. **Developer Experience**
   - Fully typed TypeScript API
   - Consistent component interfaces
   - Incremental adoption support
   - Tree-shakeable architecture

4. **Customization**
   - Granular access to component parts
   - Custom event listeners
   - Prop spreading support
   - Polymorphic components with `asChild`

## Component Architecture

### Uncontrolled by Default
```tsx
// Most components work without state management
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### Controlled Mode Support
```tsx
// Optional controlled mode
const [open, setOpen] = useState(false)

<Dialog.Root open={open} onOpenChange={setOpen}>
  {/* ... */}
</Dialog.Root>
```

### Compound Component Pattern
All components use compound patterns for maximum flexibility:
- Root component manages state
- Child components access context
- Each part is individually targetable
- Clear component hierarchy

## Component Categories

### Overlays
- **Dialog**: Modal dialogs
- **AlertDialog**: Confirmation dialogs
- **Popover**: Floating panels
- **DropdownMenu**: Context menus
- **Tooltip**: Hover information
- **HoverCard**: Rich hover content
- **ContextMenu**: Right-click menus

### Forms
- **Form**: Form validation wrapper
- **Label**: Accessible labels
- **Switch**: Toggle switches
- **Checkbox**: Checkboxes
- **RadioGroup**: Radio buttons
- **Select**: Custom selects
- **Slider**: Range inputs
- **Toggle**: Toggle buttons

### Navigation
- **NavigationMenu**: Site navigation
- **Tabs**: Tabbed interfaces
- **Accordion**: Collapsible panels
- **Menubar**: Application menus
- **ToggleGroup**: Button groups

### Layout
- **ScrollArea**: Custom scrollbars
- **Separator**: Visual dividers
- **AspectRatio**: Aspect ratio containers
- **Collapsible**: Expandable sections

### Feedback
- **Progress**: Progress indicators
- **Toast**: Notifications
- **Avatar**: User avatars
- **Badge**: Status badges

## Key Features

### asChild Prop
Enables polymorphic components:
```tsx
// Render as a different element
<Dialog.Trigger asChild>
  <button className="custom-button">Open Dialog</button>
</Dialog.Trigger>

// Works with any component
<Dialog.Trigger asChild>
  <Link href="/modal">Open Dialog</Link>
</Dialog.Trigger>
```

### Portal Pattern
Renders content outside DOM hierarchy:
```tsx
<Tooltip.Root>
  <Tooltip.Trigger>Hover me</Tooltip.Trigger>
  <Tooltip.Portal>
    <Tooltip.Content>
      Rendered at document.body
    </Tooltip.Content>
  </Tooltip.Portal>
</Tooltip.Root>
```

### Event Handling
Comprehensive event support:
```tsx
<Dialog.Root
  onOpenChange={(open) => console.log('Dialog:', open)}
  onOpenAutoFocus={(event) => event.preventDefault()}
  onCloseAutoFocus={(event) => event.preventDefault()}
  onEscapeKeyDown={(event) => event.preventDefault()}
  onPointerDownOutside={(event) => event.preventDefault()}
  onInteractOutside={(event) => event.preventDefault()}
>
```

## Accessibility Patterns

### Focus Management
- Automatic focus trapping in modals
- Focus restoration on close
- Configurable auto-focus behavior
- Keyboard navigation support

### ARIA Implementation
- Proper ARIA roles and attributes
- Live regions for announcements
- Landmark roles
- Description and labeling associations

### Keyboard Navigation
- Tab navigation
- Arrow key navigation (menus, radio groups)
- Escape to close
- Enter/Space activation
- Home/End support

## Styling Approaches

### CSS Classes
```tsx
<Dialog.Content className="dialog-content">
  <Dialog.Title className="dialog-title">Title</Dialog.Title>
</Dialog.Content>
```

### CSS-in-JS
```tsx
const StyledContent = styled(Dialog.Content)`
  background: white;
  padding: 20px;
  border-radius: 8px;
`
```

### Tailwind CSS
```tsx
<Dialog.Content className="bg-white p-5 rounded-lg shadow-xl">
  <Dialog.Title className="text-lg font-semibold">Title</Dialog.Title>
</Dialog.Content>
```

### Data Attributes
Components expose state via data attributes:
```css
/* Style based on state */
[data-state="open"] { opacity: 1; }
[data-state="closed"] { opacity: 0; }
[data-side="top"] { transform-origin: bottom; }
[data-disabled] { opacity: 0.5; }
```

## Animation Support

### CSS Animations
```css
@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

[data-state="open"] {
  animation: slideIn 200ms ease-out;
}
```

### JavaScript Animations
```tsx
<Collapsible.Root
  onOpenChange={(open) => {
    // Trigger JS animations
  }}
>
```

## Best Practices

1. **Start with Primitives**: Use Radix for behavior, add your styling
2. **Maintain Accessibility**: Don't override ARIA attributes
3. **Use Compound Components**: Leverage the flexibility
4. **Handle Edge Cases**: Test keyboard, screen readers, RTL
5. **Progressive Enhancement**: Components work without JS

## Installation Patterns

### Full Package
```bash
npm install @radix-ui/react
```

### Individual Components
```bash
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-form
```

### With Design System
```bash
# Use with shadcn/ui, Mantine, etc.
npx shadcn-ui@latest add dialog
```

## Integration Examples

### With shadcn/ui
shadcn/ui builds styled components on top of Radix:
```tsx
// shadcn/ui Dialog uses Radix Dialog
import * as DialogPrimitive from "@radix-ui/react-dialog"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogContent = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn("fixed inset-0", className)}
      {...props}
    />
  </DialogPrimitive.Portal>
))
```

### Custom Design System
Build your own component library:
```tsx
// Your custom Dialog
export const Dialog = {
  Root: DialogPrimitive.Root,
  Trigger: styled(DialogPrimitive.Trigger, {
    // Your styles
  }),
  Content: styled(DialogPrimitive.Content, {
    // Your styles
  }),
  // ... other parts
}
```

## Performance Considerations

1. **Tree Shaking**: Import only what you need
2. **Code Splitting**: Components are separate bundles
3. **No Runtime Overhead**: Minimal JavaScript
4. **CSS Performance**: No CSS-in-JS runtime
5. **Lazy Loading**: Portal components support lazy loading

## Future Direction

Radix UI continues to evolve with:
- More primitive components
- Better animation APIs
- Enhanced mobile support
- Improved developer tools
- Tighter framework integrations