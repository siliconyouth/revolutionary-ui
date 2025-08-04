# Framework Transpilation System

The Framework Transpilation System enables seamless conversion of UI components between different JavaScript frameworks, allowing developers to reuse components across React, Vue, Angular, Svelte, and more.

## Overview

The transpilation system uses advanced AST (Abstract Syntax Tree) analysis and transformation to convert components while preserving functionality, maintaining framework-specific patterns, and generating idiomatic code for each target framework.

## Supported Frameworks

### Full Support (Bidirectional)
- **React** ⚛️ ↔️ **Vue** 🟢
- **React** ⚛️ ↔️ **Angular** 🔺
- **React** ⚛️ ↔️ **Svelte** 🧡
- **Vue** 🟢 ↔️ **Angular** 🔺
- **Vue** 🟢 ↔️ **Svelte** 🧡

### Partial Support (One Direction)
- **Solid** 🔷 → **React** ⚛️
- **Preact** ⚡ → **React** ⚛️
- **Lit** 🔥 → **React** ⚛️
- **Angular** 🔺 → **Svelte** 🧡
- **Svelte** 🧡 → **Angular** 🔺

## Features

### 🎯 Accurate Component Conversion
- **State Management**: Converts hooks, refs, signals, and class properties
- **Props/Inputs**: Maintains prop definitions with types and defaults
- **Event Handling**: Maps event handlers to framework conventions
- **Lifecycle Methods**: Translates lifecycle hooks appropriately
- **Computed Properties**: Preserves reactive computations
- **Two-way Binding**: Converts v-model, [(ngModel)], bind:value

### 🎨 Template/JSX Transformation
- **Conditional Rendering**: if/else, v-if, *ngIf, {#if}
- **List Rendering**: map, v-for, *ngFor, {#each}
- **Event Bindings**: onClick, @click, (click), on:click
- **Class/Style Bindings**: Dynamic classes and styles
- **Slots/Children**: Content projection patterns

### 🔧 Framework-Specific Features
- **React**: Hooks, Context, Refs, Fragments
- **Vue**: Composition/Options API, Directives, Scoped Slots
- **Angular**: Decorators, Services, Pipes, RxJS
- **Svelte**: Reactive statements, Stores, Actions
- **Solid**: Signals, Effects, Show/For components

## Architecture

### Core Components

```typescript
// Main transpiler engine
class FrameworkTranspiler {
  transpile(
    code: string,
    sourceFramework: FrameworkType,
    targetFramework: FrameworkType,
    options?: TranspilerOptions
  ): Promise<TranspilationResult>
}

// Framework-specific transpilers
abstract class BaseTranspiler {
  abstract transpile(
    code: string,
    metadata: ComponentMetadata,
    options: TranspilerOptions
  ): Promise<any>
}
```

### Transpilation Process

1. **Parse** - Extract AST from source code
2. **Analyze** - Extract component metadata
3. **Transform** - Convert to target framework patterns
4. **Generate** - Produce idiomatic target code
5. **Format** - Apply framework conventions

## Usage Examples

### Basic Counter Component

#### React → Vue
```typescript
// Input (React)
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="counter">
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

// Output (Vue)
<template>
  <div class="counter">
    <h2>Count: {{ count }}</h2>
    <button @click="count++">
      Increment
    </button>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'Counter',
  setup() {
    const count = ref(0);
    
    return { count };
  }
};
</script>
```

#### Vue → Angular
```typescript
// Input (Vue)
<template>
  <div class="user-card">
    <h3>{{ user.name }}</h3>
    <p v-if="showEmail">{{ user.email }}</p>
    <button @click="toggleEmail">
      {{ showEmail ? 'Hide' : 'Show' }} Email
    </button>
  </div>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showEmail: false
    };
  },
  methods: {
    toggleEmail() {
      this.showEmail = !this.showEmail;
    }
  }
};
</script>

// Output (Angular)
import { Component, Input } from '@angular/core';

@Component({
  selector: 'user-card',
  template: `
    <div class="user-card">
      <h3>{{ user.name }}</h3>
      <p *ngIf="showEmail">{{ user.email }}</p>
      <button (click)="toggleEmail()">
        {{ showEmail ? 'Hide' : 'Show' }} Email
      </button>
    </div>
  `
})
export class UserCardComponent {
  @Input() user: any;
  showEmail: boolean = false;

  toggleEmail() {
    this.showEmail = !this.showEmail;
  }
}
```

### Complex Form Component

#### React → Svelte
```typescript
// Input (React)
import React, { useState, useEffect } from 'react';

function ContactForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.message) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      await onSubmit(formData);
      setIsSubmitting(false);
    } else {
      setErrors(newErrors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      
      <div>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your Message"
        />
        {errors.message && <span className="error">{errors.message}</span>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

// Output (Svelte)
<script>
  export let onSubmit;
  
  let formData = {
    name: '',
    email: '',
    message: ''
  };
  let errors = {};
  let isSubmitting = false;

  function validateForm() {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.message) newErrors.message = 'Message is required';
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      isSubmitting = true;
      await onSubmit(formData);
      isSubmitting = false;
    } else {
      errors = newErrors;
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    formData[name] = value;
    if (errors[name]) {
      errors[name] = '';
    }
  }
</script>

<form on:submit={handleSubmit}>
  <div>
    <input
      name="name"
      bind:value={formData.name}
      on:input={handleChange}
      placeholder="Your Name"
    />
    {#if errors.name}<span class="error">{errors.name}</span>{/if}
  </div>
  
  <div>
    <input
      name="email"
      type="email"
      bind:value={formData.email}
      on:input={handleChange}
      placeholder="Your Email"
    />
    {#if errors.email}<span class="error">{errors.email}</span>{/if}
  </div>
  
  <div>
    <textarea
      name="message"
      bind:value={formData.message}
      on:input={handleChange}
      placeholder="Your Message"
    />
    {#if errors.message}<span class="error">{errors.message}</span>{/if}
  </div>
  
  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? 'Sending...' : 'Send Message'}
  </button>
</form>
```

## API Reference

### Transpiler Options

```typescript
interface TranspilerOptions {
  // Preserve comments in output
  preserveComments?: boolean;
  
  // Generate TypeScript code
  typescript?: boolean;
  
  // Format output code
  format?: boolean;
  
  // Component style (for Vue)
  style?: 'options' | 'composition' | 'class';
  
  // Target framework version
  version?: string;
}
```

### REST API

```bash
# Transpile component
POST /api/transpiler/transpile
{
  "code": "component code",
  "sourceFramework": "react",
  "targetFramework": "vue",
  "options": {
    "typescript": true,
    "format": true
  }
}

# Get available transpilation paths
GET /api/transpiler/transpile
```

## Advanced Features

### Pattern Recognition
The transpiler recognizes common UI patterns:
- Form handling
- List rendering with keys
- Conditional rendering
- Event handling
- State management
- Side effects

### Optimization
- Dead code elimination
- Import optimization
- Bundle size awareness
- Performance patterns

### Error Handling
- Graceful degradation
- Warning for unsupported features
- Suggestions for manual fixes
- Partial transpilation support

## Limitations

### Current Limitations
1. **Complex State Management**: Redux, Vuex, NgRx require manual adaptation
2. **Framework-Specific APIs**: Some APIs have no direct equivalent
3. **Custom Directives/Decorators**: May need manual conversion
4. **Third-Party Libraries**: Component library bindings need adjustment
5. **Advanced Patterns**: HOCs, Render Props, Scoped Slots

### Workarounds
- Use comments for manual intervention points
- Provide framework-specific implementations
- Create adapter patterns
- Use compatibility libraries

## Best Practices

### For Best Results
1. **Keep Components Simple**: Single responsibility principle
2. **Use Standard Patterns**: Avoid framework-specific tricks
3. **Type Your Props**: Helps with accurate conversion
4. **Minimize Side Effects**: Easier lifecycle mapping
5. **Comment Complex Logic**: Helps transpiler understand intent

### Post-Transpilation
1. **Review Generated Code**: Check for idiomatic patterns
2. **Run Framework Linter**: Ensure style compliance
3. **Test Functionality**: Verify behavior matches original
4. **Optimize Imports**: Remove unnecessary dependencies
5. **Add Type Definitions**: For TypeScript projects

## Integration Guide

### CLI Integration
```bash
# Install globally
npm install -g revolutionary-ui

# Transpile file
revolutionary-ui transpile MyComponent.jsx --from react --to vue --output MyComponent.vue

# Transpile directory
revolutionary-ui transpile ./src/components --from react --to angular --output ./angular-components
```

### Programmatic Usage
```typescript
import { FrameworkTranspiler } from '@revolutionary-ui/transpiler';

const transpiler = new FrameworkTranspiler();

const result = await transpiler.transpile(
  componentCode,
  'react',
  'vue',
  { typescript: true, style: 'composition' }
);

if (result.success) {
  console.log(result.code);
} else {
  console.error(result.error);
}
```

### Build Tool Integration
```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: {
          loader: '@revolutionary-ui/transpiler-loader',
          options: {
            target: 'vue',
            typescript: true
          }
        }
      }
    ]
  }
};
```

## Future Enhancements

- **More Frameworks**: Qwik, Alpine.js, Marko
- **AI-Powered Optimization**: Smart pattern detection
- **Visual Transpilation**: Drag-and-drop UI
- **Real-time Collaboration**: Team transpilation sessions
- **Component Library Support**: Material-UI → Vuetify
- **Style Transpilation**: CSS-in-JS → CSS Modules
- **Test Transpilation**: Jest → Vitest
- **Documentation Generation**: JSDoc → framework-specific

## Conclusion

The Framework Transpilation System breaks down the barriers between JavaScript frameworks, enabling true component portability and reducing development time when working with multiple frameworks.