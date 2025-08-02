# Visual Component Builder Documentation

The Revolutionary UI Factory System includes a powerful visual component builder that allows you to create UI components through an intuitive drag-and-drop interface. This tool generates factory configurations and code with real-time preview capabilities.

## Overview

The Visual Builder provides:
- 🎨 **Drag-and-Drop Interface**: Build components visually without writing code
- 👁️ **Real-Time Preview**: See your components update as you build them
- 🎯 **Property Panels**: Configure component properties through intuitive UI
- 📦 **Export Options**: Generate factory configurations, raw code, or JSON
- 🎭 **Framework Support**: Export to React, Vue, Angular, or Svelte
- 📱 **Responsive Preview**: Test components across desktop, tablet, and mobile views
- ↩️ **Undo/Redo**: Full history support for non-destructive editing
- 📋 **Templates**: Start with pre-built layouts for common patterns

## Getting Started

### Accessing the Visual Builder

Navigate to the Visual Builder from the dashboard:

```
Dashboard → Visual Builder
```

Or directly access it at: `/dashboard/visual-builder`

### Interface Overview

The Visual Builder interface consists of four main areas:

1. **Component Palette** (Left Panel)
   - Organized by categories: Layout, Text, Form, Media, Data Display
   - Search functionality to quickly find components
   - Drag components to the canvas to add them

2. **Canvas** (Center)
   - Visual representation of your component hierarchy
   - Drop zones appear when dragging components
   - Click to select, drag to reorder
   - Responsive preview modes

3. **Property Panel** (Right Panel)
   - Configure selected component properties
   - Different editors based on property type
   - Live updates as you modify values

4. **Header Toolbar**
   - Device preview switcher
   - Undo/Redo buttons
   - Clear canvas
   - Export code

## Building Components

### Adding Components

1. **From Palette**: Drag a component from the palette onto the canvas
2. **Drop Zones**: Green drop zones appear showing valid placement locations
3. **Nesting**: Drop components inside containers to create hierarchies

### Configuring Properties

Select a component to reveal its properties in the right panel:

- **Text Properties**: Content, font size, color, alignment
- **Layout Properties**: Padding, margin, display type, gap
- **Style Properties**: Background color, border radius, shadows
- **Interactive Properties**: Disabled state, click handlers (in code)

### Component Types

#### Layout Components
- **Container**: Flexible box for grouping elements
- **Grid**: Responsive grid layout
- **Flexbox**: Flexible box layout
- **Columns**: Multi-column layout

#### Text Components
- **Heading**: H1-H6 headings with customizable levels
- **Text**: Paragraph text
- **Label**: Form labels
- **Link**: Hyperlinks

#### Form Components
- **Input**: Text, email, password, number inputs
- **Textarea**: Multi-line text input
- **Select**: Dropdown selection
- **Checkbox**: Boolean toggles
- **Radio**: Single selection from options
- **Button**: Action buttons with variants

#### Media Components
- **Image**: Static images with alt text
- **Video**: Embedded video players
- **Icon**: Icon components

#### Data Display
- **Card**: Content cards with headers and bodies
- **List**: Ordered/unordered lists
- **Table**: Data tables
- **Badge**: Status indicators

## Templates

Start quickly with pre-built templates using our enhanced template gallery:

### Template Gallery Features

- **🔍 Search**: Find templates by name, description, or tags
- **📁 Categories**: Filter by landing, forms, dashboard, navigation, content, ecommerce, social
- **👁️ Visual Previews**: See miniature representations before selecting
- **🏷️ Metadata**: Difficulty levels (beginner, intermediate, advanced)
- **📱 Responsive**: All templates are mobile-friendly
- **⚡ Quick Access**: Popular templates shown on empty canvas

### Available Templates

#### Landing Page Templates
1. **Hero Section** (🏠)
   - Classic hero with badge, title, description
   - Dual CTA buttons (primary/secondary)
   - Centered layout with responsive spacing
   - Tags: hero, landing, cta, marketing

2. **Feature Grid** (🎯)
   - 3-column responsive grid
   - Icon + title + description per feature
   - Professional spacing and alignment
   - Tags: features, grid, marketing, showcase

#### Form Templates
3. **Contact Form** (✉️)
   - Professional contact form layout
   - Name fields (first/last in grid)
   - Email, subject, message fields
   - Full-width submit button
   - Tags: form, contact, email, validation

4. **Login Form** (🔐)
   - Modern authentication interface
   - Social login options (Google, GitHub)
   - Remember me & forgot password
   - Card-based design with shadow
   - Tags: form, login, authentication, auth

#### Dashboard Templates
5. **Stats Dashboard** (📊)
   - 4-column metrics grid
   - Cards with label, value, change indicator
   - Color-coded badges for trends
   - Responsive breakpoints
   - Tags: dashboard, stats, metrics, analytics

#### Navigation Templates
6. **Navigation Bar** (🧭)
   - Logo and brand name
   - Centered navigation links
   - Action buttons (Login/Sign Up)
   - Sticky positioning support
   - Tags: navigation, navbar, header, menu

### Using Templates

1. **Access Template Gallery**:
   - Click "Templates" button in toolbar
   - Or click "More..." when canvas is empty

2. **Find Your Template**:
   - Use search bar for keywords
   - Filter by category dropdown
   - Browse visual previews

3. **Load and Customize**:
   - Click template to load it
   - Modify components as needed
   - All properties are editable
   - Add/remove components freely

### Template System Architecture

Templates use the same component structure as the visual builder:
- Each template is a collection of `ComponentNode` objects
- Templates include metadata for search and categorization
- Preview generation creates visual representations
- Templates are framework-agnostic

## Exporting Code

### Export Options

Click "Export Code" to access export options:

#### Export Formats

1. **Factory Configuration**
   ```javascript
   const componentConfig = {
     framework: 'react',
     styling: 'tailwind',
     components: [
       {
         type: 'container',
         name: 'MainContainer',
         props: { padding: '16px' },
         children: []
       }
     ]
   };
   ```

2. **Component Code**
   - Direct component implementation
   - Includes chosen framework syntax
   - Ready to use in your project

3. **JSON**
   - Raw component tree structure
   - Useful for saving/loading designs
   - Can be imported back later

#### Framework Options
- React (with TypeScript support)
- Vue 3 (Composition API)
- Angular (Component syntax)
- Svelte

#### Styling Options
- Tailwind CSS (utility classes)
- Styled Components (CSS-in-JS)
- CSS Modules (scoped styles)
- Vanilla CSS (standard stylesheets)

#### Additional Options
- **TypeScript**: Generate typed components
- **Include Imports**: Add necessary import statements
- **Format with Prettier**: Clean, formatted output

### Export Workflow

1. Click "Export Code" button
2. Select export format
3. Choose framework and styling
4. Configure additional options
5. Click "Export & Copy"
6. Code is copied to clipboard

## Keyboard Shortcuts

- **Delete**: Remove selected component
- **Ctrl/Cmd + D**: Duplicate selected component
- **Ctrl/Cmd + Z**: Undo last action
- **Ctrl/Cmd + Shift + Z**: Redo
- **Escape**: Deselect component

## Advanced Features

### Responsive Design

Use the device preview to test your components:
- **Desktop**: Full width preview
- **Tablet**: 768px width
- **Mobile**: 375px width

Components automatically adapt based on their properties.

### Grid Snapping

Enable snap-to-grid for precise alignment:
- 8px grid by default
- Configurable grid size
- Toggle on/off in settings

### Component Reordering

Drag existing components to reorder:
1. Click and hold a component
2. Drag to new position
3. Drop zones show valid locations
4. Release to complete move

### History Management

All actions are recorded:
- Unlimited undo/redo
- History persists during session
- Clear history with "Clear Canvas"

## Best Practices

### Component Organization

1. **Use Containers**: Group related elements
2. **Semantic Naming**: Give components meaningful names
3. **Consistent Spacing**: Use standard padding/margin values
4. **Responsive First**: Design for mobile, enhance for desktop

### Performance Tips

1. **Minimize Nesting**: Keep component trees shallow
2. **Reuse Components**: Duplicate rather than rebuild
3. **Optimize Images**: Use appropriate sizes
4. **Clean Exports**: Remove unused properties

### Accessibility

1. **Alt Text**: Always add alt text to images
2. **Semantic HTML**: Use appropriate component types
3. **Color Contrast**: Ensure readable text
4. **Focus States**: Plan for keyboard navigation

## Troubleshooting

### Common Issues

**Components Not Dropping**
- Ensure you're dragging to a valid drop zone
- Some components can't contain others (e.g., inputs)
- Check if parent component accepts children

**Properties Not Updating**
- Click "Apply" for complex properties
- Some changes require re-selection
- Check property constraints

**Export Not Working**
- Ensure at least one component exists
- Check browser clipboard permissions
- Try different export format

### Getting Help

- **Documentation**: This guide and API reference
- **Examples**: Check the examples directory
- **Support**: File issues on GitHub
- **Community**: Join our Discord server

## Integration with Factories

The Visual Builder integrates seamlessly with the Revolutionary UI Factory System:

1. **Factory Generation**: Exports directly to factory configurations
2. **Component Registry**: Uses the same component definitions
3. **Framework Adapters**: Leverages existing framework support
4. **Optimization**: Generated code follows factory best practices

### Using Exported Configurations

```javascript
import { UniversalFactory } from '@vladimirdukelic/revolutionary-ui';
import componentConfig from './exported-config';

const factory = new UniversalFactory();
const Component = factory.generateFromConfig(componentConfig);

// Use in your app
export default Component;
```

## Future Enhancements

Planned features for the Visual Builder:

- [ ] Component library integration
- [ ] Custom component import
- [ ] Collaborative editing
- [ ] Version control
- [ ] AI-assisted design
- [ ] Animation editor
- [ ] Theme management
- [ ] Plugin system

## Conclusion

The Visual Builder democratizes UI development by allowing anyone to create professional components without deep coding knowledge. Combined with the Revolutionary UI Factory System, it provides a complete solution for rapid UI development with 60-95% code reduction.

Start building visually today and experience the future of UI development!