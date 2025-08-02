# Migration Guide to Revolutionary UI v2.0

## Overview

Revolutionary UI v2.0 is a major update that transforms the library from a React-only table/form generator to a universal component factory supporting 150+ component types across 10+ frameworks.

## Breaking Changes

### 1. Package Name Change
```bash
# Old
npm uninstall revolutionary-ui

# New
npm install @vladimirdukelic/revolutionary-ui
```

### 2. Import Changes
```typescript
// Old (v1.x)
import { createDataTable, createForm } from 'revolutionary-ui';

// New (v2.0)
import { setup, createRevolutionaryDataTable } from '@vladimirdukelic/revolutionary-ui';
// OR use the universal setup
const ui = setup();
const table = ui.createDataTable(config);
```

### 3. React Version Requirements
```json
// Old: React 17+
"react": "^17.0.0"

// New: React 19+
"react": "^19.0.0"
```

### 4. TypeScript Version
```json
// Old: TypeScript 4.5+
"typescript": "^4.5.0"

// New: TypeScript 5.0+
"typescript": "^5.0.0"
```

## API Changes

### Data Table Configuration

#### Old API (v1.x)
```typescript
const UserTable = createDataTable({
  columns: [...],
  data: users,
  // Limited options
});
```

#### New API (v2.0)
```typescript
const UserTable = ui.createDataTable({
  columns: [...],
  data: users,
  // Enhanced options
  features: {
    virtualScroll: true,
    columnResize: true,
    export: ['csv', 'excel', 'pdf'],
    realtime: true
  },
  theme: 'dark',
  responsive: true,
  accessibility: {
    announceRowChanges: true,
    keyboardNavigation: true
  }
});
```

### Form Configuration

#### Old API (v1.x)
```typescript
const ContactForm = createForm({
  fields: [...],
  onSubmit: handleSubmit
});
```

#### New API (v2.0)
```typescript
const ContactForm = ui.createForm({
  fields: [...],
  onSubmit: handleSubmit,
  // New features
  validation: 'zod', // or 'yup', 'joi'
  layout: 'multi-step',
  autosave: true,
  conditional: {
    showField: (values) => values.type === 'business'
  }
});
```

## New Features in v2.0

### 1. Universal Setup
```typescript
// Auto-detects your framework and style system
const ui = setup();

// Or specify explicitly
const ui = setup('react', 'tailwind');
```

### 2. 150+ Component Types
```typescript
// Beyond tables and forms
const dashboard = ui.createDashboard({...});
const kanban = ui.createKanban({...});
const calendar = ui.createCalendar({...});
const chart = ui.createChart({...});
const timeline = ui.createTimeline({...});
// ... and 145+ more
```

### 3. Framework Adapters
```typescript
// React
import { ReactAdapter } from '@vladimirdukelic/revolutionary-ui';

// Vue (coming soon)
import { VueAdapter } from '@vladimirdukelic/revolutionary-ui/vue';

// Angular (coming soon)
import { AngularAdapter } from '@vladimirdukelic/revolutionary-ui/angular';
```

### 4. Style System Adapters
```typescript
// Choose your style system
const ui = setup('react', 'tailwind');    // Tailwind CSS
const ui = setup('react', 'css-in-js');   // Emotion/Styled Components
const ui = setup('react', 'css-modules'); // CSS Modules
const ui = setup('react', 'vanilla');     // Plain CSS
```

## Step-by-Step Migration

### Step 1: Update Dependencies
```bash
# Remove old package
npm uninstall revolutionary-ui

# Install new package
npm install @vladimirdukelic/revolutionary-ui

# Update React (if needed)
npm install react@^19.0.0 react-dom@^19.0.0

# Update TypeScript (if needed)
npm install -D typescript@^5.0.0
```

### Step 2: Update Imports
```typescript
// Find all imports
// Search for: from 'revolutionary-ui'
// Replace with: from '@vladimirdukelic/revolutionary-ui'
```

### Step 3: Update Component Creation
```typescript
// Old way
import { createDataTable } from 'revolutionary-ui';
const Table = createDataTable(config);

// New way (Option 1 - Direct import)
import { createRevolutionaryDataTable } from '@vladimirdukelic/revolutionary-ui';
const Table = createRevolutionaryDataTable(config);

// New way (Option 2 - Universal setup, recommended)
import { setup } from '@vladimirdukelic/revolutionary-ui';
const ui = setup();
const Table = ui.createDataTable(config);
```

### Step 4: Update Configuration
```typescript
// Review and update your component configurations
// Most v1.x configs are compatible, but v2.0 offers many new options
```

## Compatibility Mode

For easier migration, v2.0 includes a compatibility mode:

```typescript
import { enableV1Compatibility } from '@vladimirdukelic/revolutionary-ui';

// Enable v1 API compatibility
enableV1Compatibility();

// Your old code should work with minimal changes
```

## Common Issues & Solutions

### Issue: React 19 Peer Dependency Warnings
```bash
npm install --legacy-peer-deps
```

### Issue: TypeScript Strict Mode Errors
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": false,
    "skipLibCheck": true
  }
}
```

### Issue: Tailwind CSS v4 Compatibility

**1. PostCSS Configuration**
```bash
# Install new plugin
npm install -D @tailwindcss/postcss
```

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // New v4 plugin
    autoprefixer: {},
  },
}
```

**2. CSS Import Syntax**
```css
/* OLD (v3) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* NEW (v4) */
@import "tailwindcss";
```

**3. @apply Directives**
```css
/* ❌ Not supported in v4 */
@layer components {
  .btn {
    @apply bg-blue-500 text-white px-4 py-2 rounded;
  }
}

/* ✅ Use plain CSS instead */
.btn {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}
```

**4. Theme Function**
```css
/* ❌ theme() function may not work */
color: theme(colors.primary.500);

/* ✅ Use CSS variables or hex values */
color: #3b82f6;
```

### Issue: Next.js 15 with Turbopack
```json
// package.json
{
  "scripts": {
    "dev": "next dev --turbopack", // 10x faster builds
    "build": "next build"
  }
}
```

### Issue: Missing Framework Adapter Methods
```typescript
// If you're implementing a custom adapter
class MyFrameworkAdapter implements FrameworkAdapter {
  // Required in v2.0.1+
  initialize?(): Promise<void> {
    // Optional initialization
  }
  
  cleanup?(): void {
    // Optional cleanup
  }
  
  getWrapper?(): any {
    // Optional wrapper component
  }
}
```

## Framework Version Compatibility

| Framework | Min Version | Recommended | Notes |
|-----------|------------|-------------|-------|
| React | 18.0 | 19.0 | Use --legacy-peer-deps for v19 |
| Next.js | 14.0 | 15.1 | Use --turbopack for speed |
| TypeScript | 5.0 | 5.7 | Better type inference |
| Tailwind CSS | 3.0 | 4.1 | Major syntax changes in v4 |
| Node.js | 18.0 | 20.0 | LTS recommended |

## Getting Help

- 📖 [Documentation](https://revolutionary-ui.com/docs)
- 💬 [GitHub Discussions](https://github.com/siliconyouth/revolutionary-ui-system/discussions)
- 🐛 [Report Issues](https://github.com/siliconyouth/revolutionary-ui-system/issues)
- 📧 [Email Support](mailto:vladimir@dukelic.com)

## What's Next?

After migrating to v2.0, explore the new features:

1. **Try New Components**: Explore 150+ component types beyond tables and forms
2. **Use the Marketplace**: Browse components at [revolutionary-ui.com](https://revolutionary-ui.com)
3. **Install VSCode Extension**: Get IntelliSense and snippets
4. **Join the Community**: Share your experience and get help

---

Thank you for using Revolutionary UI! We're excited to see what you build with v2.0's expanded capabilities.