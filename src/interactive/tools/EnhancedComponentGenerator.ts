import chalk from 'chalk';
import * as prettier from 'prettier';
import { MergedComponentData } from './CodeMerger';
import { TransformOptions } from './ComponentTransformer';

export interface GeneratedComponent {
  name: string;
  framework: string;
  files: {
    component: string;
    styles: string;
    types?: string;
    tests?: string;
    storybook?: string;
    documentation: string;
    designTokens?: string;
    theme?: string;
  };
  structure: {
    imports: string[];
    props: string[];
    state: string[];
    methods: string[];
    hooks: string[];
  };
}

export class EnhancedComponentGenerator {
  
  async generateComponent(
    mergedData: MergedComponentData,
    options: TransformOptions & { componentName: string }
  ): Promise<GeneratedComponent> {
    console.log(chalk.cyan(`🎨 Generating beautiful ${options.framework} component...`));
    
    const structure = this.analyzeComponentStructure(mergedData);
    
    let files: GeneratedComponent['files'];
    
    switch (options.framework) {
      case 'react':
        files = await this.generateReactComponent(mergedData, options, structure);
        break;
      case 'vue':
        files = await this.generateVueComponent(mergedData, options, structure);
        break;
      case 'angular':
        files = await this.generateAngularComponent(mergedData, options, structure);
        break;
      default:
        files = await this.generateVanillaComponent(mergedData, options, structure);
    }
    
    // Generate design tokens file
    files.designTokens = this.generateDesignTokens(mergedData.designSystem);
    
    // Generate theme file
    files.theme = this.generateThemeFile(mergedData.designSystem, options.framework);
    
    return {
      name: options.componentName,
      framework: options.framework,
      files,
      structure
    };
  }
  
  private analyzeComponentStructure(data: MergedComponentData): GeneratedComponent['structure'] {
    const structure: GeneratedComponent['structure'] = {
      imports: [],
      props: [],
      state: [],
      methods: [],
      hooks: []
    };
    
    // Analyze HTML for props
    const propsFromHTML = this.extractPropsFromHTML(data.html);
    structure.props.push(...propsFromHTML);
    
    // Analyze interactions for methods
    data.interactions.forEach((interaction, i) => {
      const methodName = `handle${this.capitalize(interaction.events[0])}${i}`;
      structure.methods.push(methodName);
    });
    
    // Analyze animations for state
    if (data.animations.length > 0) {
      structure.state.push('isAnimating');
      structure.hooks.push('useAnimation');
    }
    
    // Add framework-specific imports
    if (data.metadata.framework === 'React') {
      structure.imports.push('import React, { useState, useEffect, useCallback } from "react"');
      if (data.animations.length > 0) {
        structure.imports.push('import { motion, AnimatePresence } from "framer-motion"');
      }
    }
    
    return structure;
  }
  
  private extractPropsFromHTML(html: string): string[] {
    const props = new Set<string>();
    
    // Common props
    props.add('className');
    props.add('children');
    props.add('id');
    
    // Extract data attributes as props
    const dataAttrRegex = /data-([^=]+)=/g;
    let match;
    while ((match = dataAttrRegex.exec(html)) !== null) {
      const propName = this.toCamelCase(match[1]);
      props.add(propName);
    }
    
    // Extract from class names that might be props
    const classRegex = /class=["']([^"']+)["']/g;
    while ((match = classRegex.exec(html)) !== null) {
      const classes = match[1].split(' ');
      classes.forEach(cls => {
        if (cls.includes('--')) {
          // Modifier classes might be props
          const propName = this.toCamelCase(cls.split('--')[1]);
          props.add(propName);
        }
      });
    }
    
    return Array.from(props);
  }
  
  private async generateReactComponent(
    data: MergedComponentData,
    options: TransformOptions & { componentName: string },
    structure: GeneratedComponent['structure']
  ): Promise<GeneratedComponent['files']> {
    const componentName = options.componentName;
    
    // Generate component code
    const component = await this.buildReactComponent(data, options, structure);
    
    // Generate styles based on styling option
    const styles = await this.generateStyles(data, options);
    
    // Generate TypeScript types
    const types = options.typescript ? this.generateTypeScript(componentName, structure) : undefined;
    
    // Generate tests
    const tests = this.generateReactTests(componentName, structure);
    
    // Generate Storybook stories
    const storybook = this.generateReactStorybook(componentName, structure);
    
    // Generate documentation
    const documentation = this.generateDocumentation(componentName, data, options);
    
    return {
      component,
      styles,
      types,
      tests,
      storybook,
      documentation
    };
  }
  
  private async buildReactComponent(
    data: MergedComponentData,
    options: TransformOptions & { componentName: string },
    structure: GeneratedComponent['structure']
  ): Promise<string> {
    const { componentName } = options;
    const jsx = this.convertHTMLToJSX(data.html);
    
    let imports = [...structure.imports];
    
    // Add styling imports
    switch (options.styling) {
      case 'styled-components':
        imports.push(`import * as S from './styles'`);
        break;
      case 'css-modules':
        imports.push(`import styles from './${componentName}.module.css'`);
        break;
      case 'tailwind':
        // Tailwind is global
        break;
      default:
        imports.push(`import './${componentName}.css'`);
    }
    
    // Build props interface
    const propsInterface = options.typescript ? `
interface ${componentName}Props {
  ${structure.props.map(prop => `${prop}?: ${this.getPropType(prop)};`).join('\n  ')}
}` : '';
    
    // Build component
    let componentCode = `${imports.join('\n')}
${propsInterface}

export const ${componentName}${options.typescript ? `: React.FC<${componentName}Props>` : ''} = ({
  ${structure.props.map(prop => `${prop},`).join('\n  ')}
  ...props
}) => {`;
    
    // Add state
    if (structure.state.length > 0) {
      componentCode += '\n  // State';
      structure.state.forEach(state => {
        componentCode += `\n  const [${state}, set${this.capitalize(state)}] = useState(false);`;
      });
    }
    
    // Add methods
    if (structure.methods.length > 0) {
      componentCode += '\n\n  // Event handlers';
      structure.methods.forEach(method => {
        componentCode += `\n  const ${method} = useCallback((e${options.typescript ? ': React.MouseEvent' : ''}) => {
    // TODO: Implement ${method}
    console.log('${method} triggered');
  }, []);`;
      });
    }
    
    // Add effects for animations
    if (data.animations.length > 0) {
      componentCode += `\n\n  // Animation effects
  useEffect(() => {
    // Initialize animations
    ${data.animations.map(anim => `// ${anim.name} animation`).join('\n    ')}
  }, []);`;
    }
    
    // Build return statement
    componentCode += `\n\n  return (
    ${this.wrapWithAnimations(jsx, data.animations, options)}
  );
};

${componentName}.displayName = '${componentName}';

export default ${componentName};`;
    
    // Format with Prettier
    return this.formatCode(componentCode, 'typescript');
  }
  
  private convertHTMLToJSX(html: string): string {
    return html
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/tabindex=/g, 'tabIndex=')
      .replace(/colspan=/g, 'colSpan=')
      .replace(/rowspan=/g, 'rowSpan=')
      .replace(/style="([^"]*)"/g, (match, styles) => {
        const jsxStyles = styles
          .split(';')
          .filter((s: string) => s.trim())
          .map((s: string) => {
            const [prop, value] = s.split(':').map((p: string) => p.trim());
            const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            return `${camelProp}: '${value}'`;
          })
          .join(', ');
        return `style={{${jsxStyles}}}`;
      })
      .replace(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)([^>]*)>/g, '<$1$2 />')
      .replace(/<!--(.*?)-->/g, '{/* $1 */}');
  }
  
  private wrapWithAnimations(jsx: string, animations: MergedComponentData['animations'], options: TransformOptions): string {
    if (!options.animations || animations.length === 0) {
      return jsx;
    }
    
    // For React with Framer Motion
    if (options.framework === 'react') {
      const mainAnimation = animations[0];
      return `<motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
      {...props}
    >
      ${jsx}
    </motion.div>`;
    }
    
    return jsx;
  }
  
  private async generateStyles(
    data: MergedComponentData,
    options: TransformOptions & { componentName: string }
  ): Promise<string> {
    switch (options.styling) {
      case 'styled-components':
        return this.generateStyledComponents(data, options);
      case 'tailwind':
        return this.generateTailwindStyles(data, options);
      case 'scss':
        return this.generateSCSS(data, options);
      case 'css-modules':
        return this.generateCSSModules(data, options);
      default:
        return this.generateOptimizedCSS(data, options);
    }
  }
  
  private generateStyledComponents(
    data: MergedComponentData,
    options: { componentName: string }
  ): string {
    const { componentName } = options;
    
    let styles = `import styled, { css, keyframes } from 'styled-components';\n\n`;
    
    // Add animations as keyframes
    data.animations.forEach(anim => {
      if (anim.keyframes) {
        styles += `const ${anim.name} = keyframes\`${anim.keyframes}\`;\n\n`;
      }
    });
    
    // Parse CSS and create styled components
    const components = this.parseStyledComponents(data.css);
    
    // Main wrapper
    styles += `export const ${componentName}Wrapper = styled.div\`
  ${this.extractMainStyles(data.css)}
  
  \${props => props.isAnimating && css\`
    animation: \${${data.animations[0]?.name || 'fadeIn'}} 0.3s ease-out;
  \`}
\`;\n\n`;
    
    // Add other styled components
    Object.entries(components).forEach(([name, cssRules]) => {
      styles += `export const ${name} = styled.div\`
  ${cssRules}
\`;\n\n`;
    });
    
    return this.formatCode(styles, 'typescript');
  }
  
  private parseStyledComponents(css: string): Record<string, string> {
    const components: Record<string, string> = {};
    const rules = css.match(/([^{]+){([^}]+)}/g) || [];
    
    rules.forEach(rule => {
      const [selector, styles] = rule.split('{');
      const cleanSelector = selector.trim();
      
      if (cleanSelector.startsWith('.')) {
        const componentName = this.selectorToComponentName(cleanSelector);
        components[componentName] = styles.replace('}', '').trim();
      }
    });
    
    return components;
  }
  
  private selectorToComponentName(selector: string): string {
    return selector
      .replace(/^\./, '')
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
  
  private extractMainStyles(css: string): string {
    // Extract root-level styles
    const rootStyles: string[] = [];
    const rules = css.match(/([^{]+){([^}]+)}/g) || [];
    
    rules.forEach(rule => {
      const [selector, styles] = rule.split('{');
      if (selector.trim() === ':root' || selector.includes('body') || !selector.includes('.')) {
        rootStyles.push(styles.replace('}', '').trim());
      }
    });
    
    return rootStyles.join('\n  ');
  }
  
  private generateOptimizedCSS(
    data: MergedComponentData,
    options: { componentName: string }
  ): string {
    let css = `/* ${options.componentName} Styles */\n\n`;
    
    // Add design system CSS
    css += data.css;
    
    // Add animations
    data.animations.forEach(anim => {
      if (anim.keyframes) {
        css += `\n${anim.keyframes}\n`;
      }
    });
    
    // Add responsive styles
    css += this.generateResponsiveStyles(data);
    
    // Add dark mode support
    css += this.generateDarkModeStyles(data);
    
    return this.formatCode(css, 'css');
  }
  
  private generateResponsiveStyles(data: MergedComponentData): string {
    let responsive = '\n/* Responsive Styles */\n';
    
    const breakpoints = data.designSystem.breakpoints;
    
    Object.entries(breakpoints).forEach(([name, value]) => {
      responsive += `\n@media (min-width: ${value}) {
  /* ${name} styles */
}\n`;
    });
    
    return responsive;
  }
  
  private generateDarkModeStyles(data: MergedComponentData): string {
    let darkMode = '\n/* Dark Mode Support */\n';
    
    darkMode += `@media (prefers-color-scheme: dark) {
  :root {`;
    
    // Invert color variables for dark mode
    Object.entries(data.designSystem.colors.semantic).forEach(([name, _]) => {
      darkMode += `\n    --color-${name}-dark: var(--color-${name});`;
    });
    
    darkMode += `\n  }
}\n`;
    
    return darkMode;
  }
  
  private generateTypeScript(componentName: string, structure: GeneratedComponent['structure']): string {
    let types = `// ${componentName} TypeScript Definitions\n\n`;
    
    // Props interface
    types += `export interface ${componentName}Props {\n`;
    structure.props.forEach(prop => {
      types += `  ${prop}?: ${this.getPropType(prop)};\n`;
    });
    types += `  [key: string]: any;\n}\n\n`;
    
    // State type
    if (structure.state.length > 0) {
      types += `export interface ${componentName}State {\n`;
      structure.state.forEach(state => {
        types += `  ${state}: boolean;\n`;
      });
      types += `}\n\n`;
    }
    
    // Event handler types
    types += `export interface ${componentName}Handlers {\n`;
    structure.methods.forEach(method => {
      types += `  ${method}: (event: React.MouseEvent) => void;\n`;
    });
    types += `}\n`;
    
    return types;
  }
  
  private getPropType(prop: string): string {
    // Common prop type mappings
    const typeMap: Record<string, string> = {
      className: 'string',
      children: 'React.ReactNode',
      id: 'string',
      onClick: '(event: React.MouseEvent) => void',
      disabled: 'boolean',
      active: 'boolean',
      size: "'small' | 'medium' | 'large'",
      variant: "'primary' | 'secondary' | 'tertiary'",
      color: 'string',
      style: 'React.CSSProperties'
    };
    
    return typeMap[prop] || 'any';
  }
  
  private generateReactTests(componentName: string, structure: GeneratedComponent['structure']): string {
    return `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
  });

  it('accepts and applies className prop', () => {
    const { container } = render(<${componentName} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders children correctly', () => {
    render(<${componentName}>Test Content</${componentName}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  ${structure.methods.map(method => `
  it('calls ${method} when clicked', () => {
    const handleClick = jest.fn();
    render(<${componentName} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });`).join('\n')}

  it('matches snapshot', () => {
    const { container } = render(<${componentName} />);
    expect(container).toMatchSnapshot();
  });
});`;
  }
  
  private generateReactStorybook(componentName: string, structure: GeneratedComponent['structure']): string {
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${componentName}';

const meta = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Beautiful, accessible ${componentName} component with design system integration.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    ${structure.props.map(prop => `${prop}: { control: '${this.getControlType(prop)}' }`).join(',\n    ')}
  },
} satisfies Meta<typeof ${componentName}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default ${componentName}'
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary ${componentName}'
  },
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-styling',
    children: 'Custom Styled'
  },
};

export const Interactive: Story = {
  args: {
    children: 'Click me!',
    onClick: () => alert('Clicked!')
  },
};`;
  }
  
  private getControlType(prop: string): string {
    if (prop.includes('color') || prop.includes('Color')) return 'color';
    if (prop === 'children') return 'text';
    if (prop === 'disabled' || prop === 'active') return 'boolean';
    if (prop === 'size' || prop === 'variant') return 'select';
    return 'text';
  }
  
  private generateDocumentation(
    componentName: string,
    data: MergedComponentData,
    options: TransformOptions
  ): string {
    return `# ${componentName}

## Overview
A beautiful, accessible ${componentName} component built with ${options.framework} and ${options.styling}.

## Features
- 🎨 **Design System Integration** - Uses consistent design tokens
- ♿ **Accessibility** - Score: ${data.metadata.accessibility.score}/100
- 📱 **Responsive** - Works on all screen sizes
- 🌙 **Dark Mode Support** - Automatic theme switching
- 🎬 **Animations** - ${data.animations.length} smooth animations
- 🖱️ **Interactions** - ${data.interactions.length} interactive behaviors

## Installation

\`\`\`bash
npm install ${componentName.toLowerCase()}
\`\`\`

## Usage

\`\`\`${options.framework === 'react' ? 'jsx' : options.framework}
import { ${componentName} } from './components/${componentName}';

function App() {
  return (
    <${componentName} className="my-custom-class">
      Your content here
    </${componentName}>
  );
}
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
${data.metadata.patterns.map(prop => `| ${prop} | \`${this.getPropType(prop)}\` | \`undefined\` | ${this.getPropDescription(prop)} |`).join('\n')}

## Design Tokens

This component uses the following design tokens:

### Colors
${Object.entries(data.designSystem.colors.semantic).map(([name, value]) => `- \`--color-${name}\`: ${value}`).join('\n')}

### Typography
${data.designSystem.typography.fontFamilies.map((font, i) => `- \`--font-family-${i + 1}\`: ${font}`).join('\n')}

### Spacing
${data.designSystem.spacing.scale.slice(0, 5).map((space, i) => `- \`--space-${i + 1}\`: ${space}`).join('\n')}

## Patterns Used
${data.metadata.patterns.map(pattern => `- ${pattern}`).join('\n')}

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License
MIT`;
  }
  
  private getPropDescription(prop: string): string {
    const descriptions: Record<string, string> = {
      className: 'Additional CSS classes',
      children: 'Child elements to render',
      id: 'Unique identifier',
      onClick: 'Click event handler',
      disabled: 'Disable interaction',
      active: 'Active state',
      size: 'Component size',
      variant: 'Visual variant',
      color: 'Color theme'
    };
    
    return descriptions[prop] || 'Component prop';
  }
  
  private generateDesignTokens(designSystem: DesignSystemData): string {
    const tokens = {
      colors: designSystem.colors,
      typography: designSystem.typography,
      spacing: designSystem.spacing,
      breakpoints: designSystem.breakpoints,
      shadows: designSystem.shadows,
      animations: designSystem.animations,
      components: designSystem.components
    };
    
    return `// Design Tokens
export const designTokens = ${JSON.stringify(tokens, null, 2)};

export default designTokens;`;
  }
  
  private generateThemeFile(designSystem: DesignSystemData, framework: string): string {
    if (framework === 'react') {
      return this.generateReactTheme(designSystem);
    } else if (framework === 'vue') {
      return this.generateVueTheme(designSystem);
    }
    
    return this.generateCSSTheme(designSystem);
  }
  
  private generateReactTheme(designSystem: DesignSystemData): string {
    return `// Theme configuration for React
import { createContext, useContext } from 'react';

export const theme = {
  colors: {
    primary: '${designSystem.colors.primary[0]}',
    secondary: '${designSystem.colors.secondary[0]}',
    ...${JSON.stringify(designSystem.colors.semantic, null, 4)}
  },
  typography: ${JSON.stringify(designSystem.typography, null, 2)},
  spacing: ${JSON.stringify(designSystem.spacing, null, 2)},
  breakpoints: ${JSON.stringify(designSystem.breakpoints, null, 2)},
  shadows: ${JSON.stringify(designSystem.shadows, null, 2)}
};

export const ThemeContext = createContext(theme);
export const useTheme = () => useContext(ThemeContext);

export default theme;`;
  }
  
  private generateVueTheme(designSystem: DesignSystemData): string {
    return `// Theme configuration for Vue
export default {
  install(app) {
    app.config.globalProperties.$theme = {
      colors: ${JSON.stringify(designSystem.colors, null, 2)},
      typography: ${JSON.stringify(designSystem.typography, null, 2)},
      spacing: ${JSON.stringify(designSystem.spacing, null, 2)},
      breakpoints: ${JSON.stringify(designSystem.breakpoints, null, 2)}
    };
  }
};`;
  }
  
  private generateCSSTheme(designSystem: DesignSystemData): string {
    return `/* CSS Theme Variables */
:root {
  /* Colors */
${designSystem.colors.primary.map((color, i) => `  --color-primary-${i + 1}: ${color};`).join('\n')}
${designSystem.colors.secondary.map((color, i) => `  --color-secondary-${i + 1}: ${color};`).join('\n')}
${Object.entries(designSystem.colors.semantic).map(([name, color]) => `  --color-${name}: ${color};`).join('\n')}
  
  /* Typography */
${designSystem.typography.fontFamilies.map((font, i) => `  --font-family-${i + 1}: ${font};`).join('\n')}
  
  /* Spacing */
  --space-base: ${designSystem.spacing.base};
${designSystem.spacing.scale.map((space, i) => `  --space-${i + 1}: ${space};`).join('\n')}
  
  /* Breakpoints */
${Object.entries(designSystem.breakpoints).map(([name, value]) => `  --breakpoint-${name}: ${value};`).join('\n')}
}`;
  }
  
  private async generateVueComponent(
    data: MergedComponentData,
    options: TransformOptions & { componentName: string },
    structure: GeneratedComponent['structure']
  ): Promise<GeneratedComponent['files']> {
    // Similar implementation for Vue
    const component = `<template>
  ${data.html}
</template>

<script setup lang="${options.typescript ? 'ts' : 'js'}">
import { ref, computed } from 'vue';

// Props
const props = defineProps({
  ${structure.props.map(prop => `${prop}: ${this.getVuePropType(prop)}`).join(',\n  ')}
});

// State
${structure.state.map(state => `const ${state} = ref(false);`).join('\n')}

// Methods
${structure.methods.map(method => `const ${method} = () => {
  console.log('${method} triggered');
};`).join('\n\n')}
</script>

<style ${options.styling === 'scss' ? 'lang="scss"' : ''} scoped>
${data.css}
</style>`;
    
    return {
      component: await this.formatCode(component, 'vue'),
      styles: '', // Styles are in the SFC
      documentation: this.generateDocumentation(options.componentName, data, options)
    };
  }
  
  private getVuePropType(prop: string): string {
    const typeMap: Record<string, string> = {
      className: 'String',
      children: 'String',
      id: 'String',
      disabled: 'Boolean',
      active: 'Boolean'
    };
    
    return typeMap[prop] || 'String';
  }
  
  private async generateAngularComponent(
    data: MergedComponentData,
    options: TransformOptions & { componentName: string },
    structure: GeneratedComponent['structure']
  ): Promise<GeneratedComponent['files']> {
    // Similar implementation for Angular
    const component = `import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-${options.componentName.toLowerCase()}',
  template: \`${data.html}\`,
  styles: [\`${data.css}\`]
})
export class ${options.componentName}Component {
  ${structure.props.map(prop => `@Input() ${prop}: any;`).join('\n  ')}
  
  ${structure.methods.map(method => `${method}(event: Event): void {
    console.log('${method} triggered');
  }`).join('\n\n  ')}
}`;
    
    return {
      component: await this.formatCode(component, 'typescript'),
      styles: '', // Styles are in the component
      documentation: this.generateDocumentation(options.componentName, data, options)
    };
  }
  
  private async generateVanillaComponent(
    data: MergedComponentData,
    options: TransformOptions & { componentName: string },
    structure: GeneratedComponent['structure']
  ): Promise<GeneratedComponent['files']> {
    const component = `// ${options.componentName}.js
class ${options.componentName} {
  constructor(element, options = {}) {
    this.element = element;
    this.options = { ...this.defaultOptions, ...options };
    this.init();
  }
  
  get defaultOptions() {
    return {
      ${structure.props.map(prop => `${prop}: null`).join(',\n      ')}
    };
  }
  
  init() {
    this.setupEventListeners();
    this.applyInitialState();
  }
  
  setupEventListeners() {
    ${data.interactions.map(interaction => `
    this.element.addEventListener('${interaction.events[0]}', (e) => {
      this.handle${this.capitalize(interaction.events[0])}(e);
    });`).join('\n')}
  }
  
  ${structure.methods.map(method => `${method}(event) {
    console.log('${method} triggered');
  }`).join('\n\n  ')}
  
  applyInitialState() {
    // Apply initial styles and state
    if (this.options.className) {
      this.element.classList.add(this.options.className);
    }
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('[data-component="${options.componentName.toLowerCase()}"]');
  elements.forEach(el => new ${options.componentName}(el));
});

export default ${options.componentName};`;
    
    return {
      component: await this.formatCode(component, 'javascript'),
      styles: data.css,
      documentation: this.generateDocumentation(options.componentName, data, options)
    };
  }
  
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  private toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }
  
  private async formatCode(code: string, parser: string): Promise<string> {
    try {
      return await prettier.format(code, {
        parser,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
        printWidth: 100
      });
    } catch (error) {
      console.warn('Prettier formatting failed:', error);
      return code;
    }
  }
}