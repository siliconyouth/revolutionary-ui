# Troubleshooting Guide

## Common Issues and Solutions

### TypeScript Compilation Errors

#### Error: "Cannot find name 'createTableOfContents'"

**Problem**: This error occurs when methods are accidentally placed outside the UI object in mock implementations.

**Example of incorrect code**:
```typescript
export const ui = {
  createNavbar: () => { /* ... */ },
  createSidebar: () => { /* ... */ }
  // Missing comma above!
}
// These are outside the object - causes error!
createTableOfContents: () => { /* ... */ }
createPageHeader: () => { /* ... */ }
```

**Solution**: Ensure all methods are inside the UI object with proper commas:
```typescript
export const ui = {
  createNavbar: () => { /* ... */ },
  createSidebar: () => { /* ... */ }, // <-- Note the comma
  createTableOfContents: () => { /* ... */ },
  createPageHeader: () => { /* ... */ }
}; // All methods inside the object
```

**Best Practice**: Use the actual Revolutionary UI package:
```typescript
import { setup } from '@vladimirdukelic/revolutionary-ui';
export const ui = setup(); // No syntax errors possible!
```

### Import Errors

#### Error: "Module not found: @vladimirdukelic/revolutionary-ui-factory"

**Solution**: Install the package:
```bash
npm install @vladimirdukelic/revolutionary-ui
# or
yarn add @vladimirdukelic/revolutionary-ui
# or
pnpm add @vladimirdukelic/revolutionary-ui
```

### Framework Detection Issues

#### Error: "Framework 'X' not registered"

**Solution**: Manually specify the framework:
```typescript
import { setup } from '@vladimirdukelic/revolutionary-ui';

// Instead of auto-detection
const ui = setup('react', 'tailwind');
```

### Style System Issues

#### Components not styled correctly

**Problem**: Wrong style system adapter being used.

**Solution**: Explicitly set the style system:
```typescript
const ui = setup('react', 'tailwind'); // For Tailwind
const ui = setup('react', 'css-in-js'); // For CSS-in-JS
const ui = setup('react', 'css-modules'); // For CSS Modules
```

### TypeScript Type Errors

#### Error: "Property 'X' does not exist on type"

**Solution**: Use the TypeScript-first approach:
```typescript
import { UniversalComponentConfig } from '@vladimirdukelic/revolutionary-ui';

const config: UniversalComponentConfig = {
  variant: 'primary',
  size: 'lg',
  // ... other typed properties
};
```

### Performance Issues

#### Slow component generation

**Solution**: Enable caching:
```typescript
const factory = createFactory('react', {
  enableCache: true,
  cacheSize: 1000
});
```

### Build Errors

#### Error: "Iterator type not found" in older environments

**Solution**: Update your TypeScript target:
```json
{
  "compilerOptions": {
    "target": "es2015",
    "downlevelIteration": true
  }
}
```

### VSCode Extension Issues

#### Snippets not working

**Solution**: 
1. Ensure the extension is installed and enabled
2. Check that you're in a supported file type (.tsx, .jsx, .ts, .js)
3. Restart VSCode

### Common Mistakes to Avoid

1. **Don't manually recreate the factory methods** - Use the package
2. **Don't forget commas in object literals** - JavaScript syntax matters
3. **Don't mix framework code** - Keep React with React, Vue with Vue
4. **Don't ignore TypeScript errors** - They prevent runtime issues

### Getting Help

- GitHub Issues: https://github.com/siliconyouth/revolutionary-ui-factory-system/issues
- Documentation: https://revolutionary-ui.com/docs
- Examples: Check the `/examples` directory

### Debug Mode

Enable debug mode for detailed logging:
```typescript
const ui = setup('react', 'tailwind', {
  debug: true,
  logLevel: 'verbose'
});
```