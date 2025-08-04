import { ExtractedComponent, AnimationData } from './PlaywrightCodeExtractor';
import * as prettier from 'prettier';
import chalk from 'chalk';

export interface TransformOptions {
  framework: 'react' | 'vue' | 'angular' | 'vanilla';
  styling: 'css' | 'scss' | 'styled-components' | 'tailwind' | 'css-modules';
  typescript: boolean;
  accessibility: boolean;
  optimization: boolean;
  animations: boolean;
}

export interface TransformedComponent {
  name: string;
  code: string;
  styles: string;
  types?: string;
  tests?: string;
  storybook?: string;
  documentation: string;
}

export class ComponentTransformer {
  
  async transform(
    component: ExtractedComponent,
    options: TransformOptions
  ): Promise<TransformedComponent> {
    console.log(chalk.cyan('🔄 Transforming component to follow best practices...'));
    
    const name = this.generateComponentName(component);
    
    // Transform based on framework
    let code = '';
    let styles = '';
    let types = '';
    
    switch (options.framework) {
      case 'react':
        ({ code, styles, types } = await this.transformToReact(component, options));
        break;
      case 'vue':
        code = await this.transformToVue(component, options);
        break;
      case 'angular':
        code = await this.transformToAngular(component, options);
        break;
      default:
        ({ code, styles } = await this.transformToVanilla(component, options));
    }
    
    // Generate additional files
    const tests = this.generateTests(name, options.framework);
    const storybook = this.generateStorybook(name, options.framework);
    const documentation = this.generateDocumentation(component, name);
    
    return {
      name,
      code,
      styles,
      types,
      tests,
      storybook,
      documentation
    };
  }
  
  private generateComponentName(component: ExtractedComponent): string {
    const baseName = component.metadata.name
      .replace(/extracted-/, '')
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    return baseName || 'CustomComponent';
  }
  
  private async transformToReact(
    component: ExtractedComponent,
    options: TransformOptions
  ): Promise<{ code: string; styles: string; types: string }> {
    const componentName = this.generateComponentName(component);
    
    // Clean and transform HTML to JSX
    const jsx = this.htmlToJSX(component.html);
    
    // Transform CSS based on styling option
    const { styles, styleImport } = this.transformStyles(component, options);
    
    // Extract props from component
    const props = this.extractProps(component);
    
    // Generate TypeScript interfaces
    const types = options.typescript ? this.generateTypeScript(componentName, props) : '';
    
    // Build component code
    let code = `import React${props.hasState ? ', { useState, useEffect }' : ''} from 'react';
${styleImport}
${options.animations ? "import { motion } from 'framer-motion';" : ''}

${types}

export const ${componentName}${options.typescript ? `: React.FC<${componentName}Props>` : ''} = ({
  ${props.list.map(p => `${p.name} = ${p.defaultValue}`).join(',\n  ')},
  ...props
}) => {
  ${props.hasState ? this.generateStateLogic(component) : ''}
  
  ${component.interactions.length > 0 ? this.generateEventHandlers(component) : ''}
  
  return (
    ${options.animations && component.animations.length > 0 ? 
      this.wrapWithAnimation(jsx, component.animations) : jsx}
  );
};

${componentName}.displayName = '${componentName}';

export default ${componentName};`;
    
    // Format code
    code = await this.formatCode(code, 'typescript');
    
    return { code, styles, types };
  }
  
  private htmlToJSX(html: string): string {
    let jsx = html
      // Convert attributes
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/tabindex=/g, 'tabIndex=')
      .replace(/colspan=/g, 'colSpan=')
      .replace(/rowspan=/g, 'rowSpan=')
      
      // Convert styles
      .replace(/style="([^"]*)"/g, (match, styles) => {
        const jsxStyles = styles
          .split(';')
          .filter((s: string) => s.trim())
          .map((s: string) => {
            const [prop, value] = s.split(':').map((p: string) => p.trim());
            const camelCaseProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            return `${camelCaseProp}: '${value}'`;
          })
          .join(', ');
        
        return `style={{${jsxStyles}}}`;
      })
      
      // Self-closing tags
      .replace(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)([^>]*)>/g, '<$1$2 />')
      
      // Comments
      .replace(/<!--(.*?)-->/g, '{/* $1 */}');
    
    // Add accessibility improvements
    jsx = this.improveAccessibility(jsx);
    
    return jsx;
  }
  
  private improveAccessibility(jsx: string): string {
    // Add ARIA labels to interactive elements without them
    jsx = jsx.replace(/<button([^>]*)>/g, (match, attrs) => {
      if (!attrs.includes('aria-label') && !attrs.includes('aria-labelledby')) {
        // Try to extract text content for label
        const textMatch = match.match(/>([^<]+)</);
        const label = textMatch ? textMatch[1].trim() : 'Button';
        return `<button${attrs} aria-label="${label}">`;
      }
      return match;
    });
    
    // Add alt text to images
    jsx = jsx.replace(/<img([^>]*)>/g, (match, attrs) => {
      if (!attrs.includes('alt=')) {
        return `<img${attrs} alt="">`;
      }
      return match;
    });
    
    // Add role attributes where needed
    jsx = jsx.replace(/<div([^>]*className="[^"]*nav[^"]*"[^>]*)>/g, '<nav$1 role="navigation">');
    jsx = jsx.replace(/<div([^>]*className="[^"]*search[^"]*"[^>]*)>/g, '<div$1 role="search">');
    
    return jsx;
  }
  
  private transformStyles(
    component: ExtractedComponent,
    options: TransformOptions
  ): { styles: string; styleImport: string } {
    let styles = component.css;
    let styleImport = '';
    
    switch (options.styling) {
      case 'styled-components':
        return this.transformToStyledComponents(component);
        
      case 'tailwind':
        return this.transformToTailwind(component);
        
      case 'css-modules':
        styleImport = `import styles from './${component.metadata.name}.module.css';`;
        styles = this.optimizeCSS(styles);
        break;
        
      case 'scss':
        styleImport = `import './${component.metadata.name}.scss';`;
        styles = this.cssToSCSS(styles);
        break;
        
      default:
        styleImport = `import './${component.metadata.name}.css';`;
        styles = this.optimizeCSS(styles);
    }
    
    return { styles, styleImport };
  }
  
  private transformToStyledComponents(component: ExtractedComponent): { 
    styles: string; 
    styleImport: string 
  } {
    const styles = `import styled from 'styled-components';

${this.cssToStyledComponents(component.css)}
`;
    
    return {
      styles: '',
      styleImport: styles
    };
  }
  
  private cssToStyledComponents(css: string): string {
    // Parse CSS and convert to styled-components
    const rules = css.match(/([^{]+){([^}]+)}/g) || [];
    const styledComponents: string[] = [];
    
    rules.forEach(rule => {
      const [selector, styles] = rule.split('{');
      const cleanSelector = selector.trim();
      
      if (cleanSelector.startsWith('.')) {
        const componentName = this.selectorToComponentName(cleanSelector);
        const styledCSS = styles.replace('}', '').trim();
        
        styledComponents.push(`export const ${componentName} = styled.div\`
  ${styledCSS.split(';').join(';\n  ')}
\`;`);
      }
    });
    
    return styledComponents.join('\n\n');
  }
  
  private selectorToComponentName(selector: string): string {
    return selector
      .replace(/^\./, '')
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
  
  private transformToTailwind(component: ExtractedComponent): { 
    styles: string; 
    styleImport: string 
  } {
    // Convert CSS to Tailwind classes
    const tailwindClasses = this.cssToTailwindClasses(component.css);
    
    // Update component HTML with Tailwind classes
    component.html = this.applyTailwindClasses(component.html, tailwindClasses);
    
    return {
      styles: '', // No separate CSS file needed
      styleImport: '' // Tailwind imported globally
    };
  }
  
  private cssToTailwindClasses(css: string): Map<string, string> {
    const classMap = new Map<string, string>();
    
    // Parse CSS rules and convert to Tailwind
    const rules = css.match(/([^{]+){([^}]+)}/g) || [];
    
    rules.forEach(rule => {
      const [selector, styles] = rule.split('{');
      const cleanSelector = selector.trim();
      const tailwindClasses: string[] = [];
      
      // Parse individual style properties
      const properties = styles.split(';').filter(p => p.trim());
      
      properties.forEach(prop => {
        const [property, value] = prop.split(':').map(p => p.trim());
        const tailwindClass = this.cssPropertyToTailwind(property, value);
        if (tailwindClass) {
          tailwindClasses.push(tailwindClass);
        }
      });
      
      if (tailwindClasses.length > 0) {
        classMap.set(cleanSelector, tailwindClasses.join(' '));
      }
    });
    
    return classMap;
  }
  
  private cssPropertyToTailwind(property: string, value: string): string | null {
    // Map common CSS properties to Tailwind classes
    const mappings: Record<string, (val: string) => string | null> = {
      'display': (val) => {
        const displays: Record<string, string> = {
          'flex': 'flex',
          'grid': 'grid',
          'block': 'block',
          'inline': 'inline',
          'none': 'hidden'
        };
        return displays[val] || null;
      },
      'padding': (val) => {
        const match = val.match(/(\d+)px/);
        if (match) {
          const px = parseInt(match[1]);
          const rem = px / 4; // Tailwind uses 0.25rem units
          return `p-${rem}`;
        }
        return null;
      },
      'margin': (val) => {
        const match = val.match(/(\d+)px/);
        if (match) {
          const px = parseInt(match[1]);
          const rem = px / 4;
          return `m-${rem}`;
        }
        return null;
      },
      'background-color': (val) => {
        // Would need a color palette mapping
        return null;
      },
      'color': (val) => {
        // Would need a color palette mapping
        return null;
      }
    };
    
    const mapper = mappings[property];
    return mapper ? mapper(value) : null;
  }
  
  private applyTailwindClasses(html: string, classMap: Map<string, string>): string {
    classMap.forEach((tailwindClasses, selector) => {
      if (selector.startsWith('.')) {
        const className = selector.substring(1);
        html = html.replace(
          new RegExp(`class="${className}"`, 'g'),
          `className="${tailwindClasses}"`
        );
      }
    });
    
    return html;
  }
  
  private optimizeCSS(css: string): string {
    // Remove vendor prefixes (add back with PostCSS)
    css = css.replace(/-webkit-|-moz-|-ms-|-o-/g, '');
    
    // Convert colors to CSS variables
    const colors = new Map<string, string>();
    const colorRegex = /#[0-9a-f]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/gi;
    let colorIndex = 1;
    
    css = css.replace(colorRegex, (match) => {
      if (!colors.has(match)) {
        colors.set(match, `--color-${colorIndex++}`);
      }
      return `var(${colors.get(match)})`;
    });
    
    // Add CSS variables
    if (colors.size > 0) {
      const vars = Array.from(colors.entries())
        .map(([value, varName]) => `  ${varName}: ${value};`)
        .join('\n');
      
      css = `:root {\n${vars}\n}\n\n${css}`;
    }
    
    // Convert px to rem for better scaling
    css = css.replace(/(\d+)px/g, (match, px) => {
      const value = parseInt(px);
      if (value >= 16) {
        return `${(value / 16).toFixed(2)}rem`;
      }
      return match;
    });
    
    return css;
  }
  
  private cssToSCSS(css: string): string {
    let scss = css;
    
    // Convert CSS variables to SCSS variables
    scss = scss.replace(/var\(--([^)]+)\)/g, '$$$1');
    scss = scss.replace(/:root\s*{([^}]+)}/g, (match, vars) => {
      const scssVars = vars
        .split(';')
        .filter((v: string) => v.trim())
        .map((v: string) => {
          const [name, value] = v.split(':').map((s: string) => s.trim());
          return `$${name.replace('--', '')}: ${value};`;
        })
        .join('\n');
      
      return scssVars;
    });
    
    // Add nesting where appropriate
    // This is simplified - a real implementation would parse the CSS properly
    
    return scss;
  }
  
  private extractProps(component: ExtractedComponent): {
    list: Array<{ name: string; type: string; defaultValue: string }>;
    hasState: boolean;
  } {
    const props: Array<{ name: string; type: string; defaultValue: string }> = [
      { name: 'className', type: 'string', defaultValue: "''" },
      { name: 'children', type: 'React.ReactNode', defaultValue: 'null' }
    ];
    
    // Check if component needs state
    const hasState = component.interactions.length > 0 || 
                    component.animations.some(a => a.type === 'animation');
    
    // Extract data attributes as props
    const dataAttrRegex = /data-([^=]+)="([^"]*)"/g;
    const matches = component.html.matchAll(dataAttrRegex);
    
    for (const match of matches) {
      const propName = match[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      props.push({
        name: propName,
        type: 'string',
        defaultValue: `'${match[2]}'`
      });
    }
    
    return { list: props, hasState };
  }
  
  private generateTypeScript(
    componentName: string,
    props: { list: Array<{ name: string; type: string; defaultValue: string }> }
  ): string {
    const propsInterface = `export interface ${componentName}Props {
  ${props.list.map(p => `${p.name}?: ${p.type};`).join('\n  ')}
  [key: string]: any;
}`;
    
    return propsInterface;
  }
  
  private generateStateLogic(component: ExtractedComponent): string {
    const states: string[] = [];
    
    // Generate state for animations
    if (component.animations.some(a => a.type === 'animation')) {
      states.push('const [isAnimating, setIsAnimating] = useState(false);');
    }
    
    // Generate state for interactions
    component.interactions.forEach((interaction, i) => {
      if (interaction.events.includes('click')) {
        states.push(`const [isActive${i}, setIsActive${i}] = useState(false);`);
      }
      if (interaction.events.includes('hover')) {
        states.push(`const [isHovered${i}, setIsHovered${i}] = useState(false);`);
      }
    });
    
    return states.join('\n  ');
  }
  
  private generateEventHandlers(component: ExtractedComponent): string {
    const handlers: string[] = [];
    
    component.interactions.forEach((interaction, i) => {
      if (interaction.events.includes('click')) {
        handlers.push(`
  const handleClick${i} = () => {
    setIsActive${i}(!isActive${i});
    // Add your click logic here
  };`);
      }
    });
    
    return handlers.join('\n');
  }
  
  private wrapWithAnimation(jsx: string, animations: AnimationData[]): string {
    // Find the main animation
    const mainAnimation = animations.find(a => a.type === 'animation') || animations[0];
    
    if (!mainAnimation) return jsx;
    
    return `<motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: ${mainAnimation.duration} }}
    >
      ${jsx}
    </motion.div>`;
  }
  
  private async transformToVue(
    component: ExtractedComponent,
    options: TransformOptions
  ): Promise<string> {
    const componentName = this.generateComponentName(component);
    const { styles } = this.transformStyles(component, options);
    
    const code = `<template>
  ${component.html}
</template>

<script${options.typescript ? ' lang="ts"' : ''}>
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: '${componentName}',
  props: {
    className: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    ${component.interactions.length > 0 ? this.generateVueLogic(component) : '// Component logic here'}
    
    return {
      // Exposed to template
    };
  }
});
</script>

<style${options.styling === 'scss' ? ' lang="scss"' : ''} scoped>
${styles}
</style>`;
    
    return await this.formatCode(code, 'vue');
  }
  
  private generateVueLogic(component: ExtractedComponent): string {
    const logic: string[] = [];
    
    component.interactions.forEach((interaction, i) => {
      if (interaction.events.includes('click')) {
        logic.push(`
    const handleClick${i} = () => {
      // Add your click logic here
    };`);
      }
    });
    
    return logic.join('\n');
  }
  
  private async transformToAngular(
    component: ExtractedComponent,
    options: TransformOptions
  ): Promise<string> {
    const componentName = this.generateComponentName(component);
    const { styles } = this.transformStyles(component, options);
    
    const code = `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-${component.metadata.name}',
  template: \`
    ${component.html}
  \`,
  styles: [\`
    ${styles}
  \`]
})
export class ${componentName}Component {
  @Input() className = '';
  
  ${component.interactions.length > 0 ? this.generateAngularMethods(component) : '// Component logic here'}
}`;
    
    return await this.formatCode(code, 'typescript');
  }
  
  private generateAngularMethods(component: ExtractedComponent): string {
    const methods: string[] = [];
    
    component.interactions.forEach((interaction, i) => {
      if (interaction.events.includes('click')) {
        methods.push(`
  handleClick${i}(): void {
    // Add your click logic here
  }`);
      }
    });
    
    return methods.join('\n');
  }
  
  private async transformToVanilla(
    component: ExtractedComponent,
    options: TransformOptions
  ): Promise<{ code: string; styles: string }> {
    const { styles } = this.transformStyles(component, options);
    
    const code = `<!-- ${component.metadata.name}.html -->
${component.html}

<script>
class ${this.generateComponentName(component)} {
  constructor(element) {
    this.element = element;
    this.init();
  }
  
  init() {
    ${component.interactions.length > 0 ? this.generateVanillaEventListeners(component) : '// Initialize component'}
  }
}

// Auto-initialize components
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('[data-component="${component.metadata.name}"]');
  elements.forEach(el => new ${this.generateComponentName(component)}(el));
});
</script>`;
    
    return { code, styles };
  }
  
  private generateVanillaEventListeners(component: ExtractedComponent): string {
    const listeners: string[] = [];
    
    component.interactions.forEach((interaction, i) => {
      interaction.events.forEach(event => {
        listeners.push(`
    this.element.addEventListener('${event}', (e) => {
      this.handle${event.charAt(0).toUpperCase() + event.slice(1)}${i}(e);
    });`);
      });
    });
    
    return listeners.join('\n');
  }
  
  private generateTests(name: string, framework: string): string {
    switch (framework) {
      case 'react':
        return this.generateReactTests(name);
      case 'vue':
        return this.generateVueTests(name);
      case 'angular':
        return this.generateAngularTests(name);
      default:
        return this.generateVanillaTests(name);
    }
  }
  
  private generateReactTests(name: string): string {
    return `import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
  });
  
  it('applies custom className', () => {
    render(<${name} className="custom-class" />);
    expect(screen.getByRole('region')).toHaveClass('custom-class');
  });
  
  it('renders children', () => {
    render(<${name}>Test Content</${name}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});`;
  }
  
  private generateVueTests(name: string): string {
    return `import { mount } from '@vue/test-utils';
import ${name} from './${name}.vue';

describe('${name}', () => {
  it('renders properly', () => {
    const wrapper = mount(${name});
    expect(wrapper.exists()).toBe(true);
  });
  
  it('accepts className prop', () => {
    const wrapper = mount(${name}, {
      props: { className: 'custom-class' }
    });
    expect(wrapper.classes()).toContain('custom-class');
  });
});`;
  }
  
  private generateAngularTests(name: string): string {
    return `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ${name}Component } from './${name}.component';

describe('${name}Component', () => {
  let component: ${name}Component;
  let fixture: ComponentFixture<${name}Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ${name}Component ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(${name}Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});`;
  }
  
  private generateVanillaTests(name: string): string {
    return `describe('${name}', () => {
  let container;
  
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  
  afterEach(() => {
    document.body.removeChild(container);
  });
  
  test('initializes correctly', () => {
    container.innerHTML = '<div data-component="${name.toLowerCase()}"></div>';
    const component = new ${name}(container.firstChild);
    expect(component.element).toBeTruthy();
  });
});`;
  }
  
  private generateStorybook(name: string, framework: string): string {
    if (framework !== 'react') return ''; // Simplified for now
    
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta = {
  title: 'Components/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
} satisfies Meta<typeof ${name}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomClass: Story = {
  args: {
    className: 'custom-styling',
  },
};`;
  }
  
  private generateDocumentation(component: ExtractedComponent, name: string): string {
    return `# ${name}

## Overview
${component.metadata.type.charAt(0).toUpperCase() + component.metadata.type.slice(1)} component extracted and optimized from ${component.metadata.framework || 'web'} source.

## Features
- **Responsive**: ${component.metadata.responsive ? 'Yes' : 'No'}
- **Accessible**: ${this.getAccessibilityScore(component.metadata.accessibility)}/4
- **Animations**: ${component.animations.length} animations
- **Interactions**: ${component.interactions.length} interactive elements

## Usage

\`\`\`jsx
import { ${name} } from '@/components/${name}';

function App() {
  return (
    <${name} className="my-custom-class">
      Your content here
    </${name}>
  );
}
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | string | '' | Additional CSS classes |
| children | React.ReactNode | null | Child elements |

## Styling

${component.metadata.dependencies.includes('tailwindcss') ? 
  'This component uses Tailwind CSS classes.' : 
  'This component includes scoped CSS styles.'}

## Accessibility

${this.generateAccessibilityNotes(component.metadata.accessibility)}

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT`;
  }
  
  private getAccessibilityScore(accessibility: any): number {
    let score = 0;
    if (accessibility.ariaLabels) score++;
    if (accessibility.semanticHTML) score++;
    if (accessibility.keyboardNav) score++;
    if (accessibility.colorContrast) score++;
    return score;
  }
  
  private generateAccessibilityNotes(accessibility: any): string {
    const notes: string[] = [];
    
    if (accessibility.ariaLabels) {
      notes.push('- ✅ ARIA labels implemented');
    } else {
      notes.push('- ⚠️ Consider adding ARIA labels');
    }
    
    if (accessibility.semanticHTML) {
      notes.push('- ✅ Semantic HTML structure');
    } else {
      notes.push('- ⚠️ Consider using semantic HTML elements');
    }
    
    if (accessibility.keyboardNav) {
      notes.push('- ✅ Keyboard navigation supported');
    } else {
      notes.push('- ⚠️ Add keyboard navigation support');
    }
    
    if (accessibility.colorContrast) {
      notes.push('- ✅ Color contrast meets WCAG standards');
    } else {
      notes.push('- ⚠️ Check color contrast ratios');
    }
    
    return notes.join('\n');
  }
  
  private async formatCode(code: string, parser: string): Promise<string> {
    try {
      // In a real implementation, you would use prettier
      return code;
    } catch (error) {
      return code;
    }
  }
}