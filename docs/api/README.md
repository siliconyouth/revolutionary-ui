# API Reference

The Revolutionary UI Factory provides a powerful API for generating UI components with massive code reduction across any framework.

## 🎯 Core Concepts

### Factory Pattern
The factory pattern allows you to define components declaratively and generate framework-specific implementations automatically.

### Universal Adapter
Our universal adapter system detects your framework and style system automatically, or you can specify them explicitly.

### Component Registry
Access 150+ pre-built component definitions that work across all frameworks.

## 🚀 Basic Usage

### Auto-Setup (Recommended)
```typescript
import { setup } from '@vladimirdukelic/revolutionary-ui-factory';

// Automatically detects your framework and style system
const ui = setup();
```

### Manual Setup
```typescript
import { UniversalFactory } from '@vladimirdukelic/revolutionary-ui-factory';

const ui = new UniversalFactory({
  framework: 'react',      // or 'vue', 'angular', 'svelte', etc.
  styling: 'tailwind',     // or 'css-modules', 'styled-components', etc.
  typescript: true,
  plugins: []
});
```

## 📊 Component Generation

### Data Table
```typescript
const DataTable = ui.DataTable({
  // Data source
  data: users,
  
  // Column configuration
  columns: [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', filterable: true },
    { 
      key: 'actions',
      label: 'Actions',
      render: (row) => <ActionButtons user={row} />
    }
  ],
  
  // Features
  features: ['sort', 'filter', 'pagination', 'selection'],
  
  // Styling
  variant: 'striped',
  size: 'compact'
});
```

### Form
```typescript
const UserForm = ui.Form({
  // Schema definition
  schema: {
    name: { type: 'text', required: true },
    email: { type: 'email', required: true },
    role: { 
      type: 'select',
      options: ['admin', 'user', 'guest']
    },
    notifications: { type: 'checkbox' }
  },
  
  // Validation
  validation: 'zod', // or 'yup', 'joi', custom function
  
  // Layout
  layout: 'vertical', // or 'horizontal', 'inline'
  
  // Submission
  onSubmit: async (data) => {
    await saveUser(data);
  }
});
```

### Dashboard
```typescript
const Dashboard = ui.Dashboard({
  layout: 'grid',
  sections: [
    {
      id: 'stats',
      component: 'StatsGrid',
      span: 12,
      data: { stats: dashboardStats }
    },
    {
      id: 'chart',
      component: 'AreaChart',
      span: 8,
      data: { series: salesData }
    },
    {
      id: 'activity',
      component: 'ActivityFeed',
      span: 4,
      data: { activities: recentActivities }
    }
  ]
});
```

## 🔧 Advanced Features

### Custom Components
```typescript
// Register a custom component
ui.register('CustomCard', {
  props: {
    title: { type: 'string', required: true },
    content: { type: 'node' },
    actions: { type: 'node' }
  },
  
  render: (props, { framework }) => {
    // Framework-specific rendering
    if (framework === 'react') {
      return `
        <div className="card">
          <h3>{${props.title}}</h3>
          <div>{${props.content}}</div>
          <div className="card-actions">{${props.actions}}</div>
        </div>
      `;
    }
    // ... other frameworks
  }
});
```

### Theming
```typescript
const ui = setup({
  theme: {
    colors: {
      primary: '#3B82F6',
      secondary: '#8B5CF6'
    },
    spacing: {
      unit: 4
    },
    components: {
      DataTable: {
        headerBackground: '#F3F4F6'
      }
    }
  }
});
```

### Plugins
```typescript
import { chartPlugin } from '@revolutionary-ui/charts';
import { animationPlugin } from '@revolutionary-ui/animations';

const ui = setup({
  plugins: [
    chartPlugin(),
    animationPlugin({ duration: 300 })
  ]
});
```

## 📚 Component Types

### Data Display
- `DataTable` - Advanced data tables
- `List` - Flexible lists
- `Tree` - Tree views
- `Timeline` - Timeline displays
- `Calendar` - Calendar views
- `Kanban` - Kanban boards

### Forms & Inputs
- `Form` - Dynamic forms
- `Input` - Text inputs
- `Select` - Dropdowns
- `DatePicker` - Date selection
- `FileUpload` - File uploading
- `RichTextEditor` - Rich text editing

### Layout
- `Dashboard` - Dashboard layouts
- `Grid` - Grid systems
- `Split` - Split panes
- `Tabs` - Tab interfaces
- `Accordion` - Accordions
- `Modal` - Modals

### Navigation
- `Menu` - Navigation menus
- `Breadcrumb` - Breadcrumbs
- `Pagination` - Pagination
- `Stepper` - Step indicators

### Feedback
- `Alert` - Alert messages
- `Toast` - Toast notifications
- `Progress` - Progress indicators
- `Skeleton` - Loading skeletons

## 🎯 Framework Adapters

### React Adapter
```typescript
const ui = setup({ framework: 'react' });

// Generates React components with hooks
const Table = ui.DataTable({ /* config */ });

// Use in your React app
function App() {
  return <Table />;
}
```

### Vue Adapter
```typescript
const ui = setup({ framework: 'vue' });

// Generates Vue 3 composition API components
const Table = ui.DataTable({ /* config */ });

// Use in your Vue app
export default {
  components: { Table },
  template: '<Table />'
};
```

### Angular Adapter
```typescript
const ui = setup({ framework: 'angular' });

// Generates Angular components
const TableComponent = ui.DataTable({ /* config */ });

// Use in your Angular module
@NgModule({
  declarations: [TableComponent]
})
```

## 🎨 Style Adapters

### Tailwind CSS
```typescript
const ui = setup({ styling: 'tailwind' });
// Generates components with Tailwind classes
```

### CSS Modules
```typescript
const ui = setup({ styling: 'css-modules' });
// Generates components with CSS modules
```

### Styled Components
```typescript
const ui = setup({ styling: 'styled-components' });
// Generates styled-components
```

### Emotion
```typescript
const ui = setup({ styling: 'emotion' });
// Generates Emotion-styled components
```

## 🔌 TypeScript Support

Full TypeScript support with intelligent type inference:

```typescript
// Type-safe configuration
const Table = ui.DataTable<User>({
  data: users,
  columns: [
    { key: 'name', label: 'Name' }, // Autocomplete for User properties
    { key: 'email', label: 'Email' }
  ]
});

// Type-safe props
interface TableProps {
  onRowClick?: (user: User) => void;
}
```

## 📖 API Methods

### Core Methods
- `setup(options?)` - Initialize with auto-detection
- `create(type, config)` - Create a component
- `register(name, definition)` - Register custom component
- `extend(component, extensions)` - Extend existing component

### Utility Methods
- `detectFramework()` - Detect current framework
- `detectStyling()` - Detect styling system
- `getRegistry()` - Get component registry
- `getTheme()` - Get current theme

## 🚀 Next Steps

- [Core API Details](./core.md)
- [Factory API](./factory.md)
- [Component Types](./component-types.md)
- [Framework Adapters](./framework-adapters.md)
- [Style Adapters](./style-adapters.md)

---

For more examples and patterns, visit [revolutionary-ui.com/docs/api](https://revolutionary-ui.com/docs/api)