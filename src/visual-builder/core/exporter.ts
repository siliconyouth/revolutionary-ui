import { ComponentNode, ExportOptions } from './types';
import { getComponentDefinition } from './component-registry';

export class ComponentExporter {
  /**
   * Export components to factory configuration
   */
  static exportToFactory(
    components: ComponentNode[],
    options: ExportOptions
  ): string {
    const { framework, styling, typescript, includeImports } = options;

    let code = '';

    // Add imports
    if (includeImports) {
      code += this.generateImports(framework, components);
      code += '\n\n';
    }

    // Generate factory configuration
    code += this.generateFactoryConfig(components, framework, typescript);

    // Format with prettier if requested
    if (options.prettier) {
      // In a real implementation, we'd use prettier here
      code = this.formatCode(code);
    }

    return code;
  }

  /**
   * Export components as raw code
   */
  static exportToCode(
    components: ComponentNode[],
    options: ExportOptions
  ): string {
    const { framework, styling, typescript, includeImports } = options;

    let code = '';

    // Add imports
    if (includeImports) {
      code += this.generateImports(framework, components);
      code += '\n\n';
    }

    // Generate component code
    code += this.generateComponentCode(components[0], framework, styling, typescript);

    return code;
  }

  /**
   * Export components as JSON
   */
  static exportToJSON(components: ComponentNode[]): string {
    return JSON.stringify(components, null, 2);
  }

  private static generateImports(framework: string, components: ComponentNode[]): string {
    const imports: string[] = [];

    switch (framework) {
      case 'react':
        imports.push("import React from 'react';");
        imports.push("import { UniversalFactory } from '@revolutionary/ui-factory';");
        break;
      case 'vue':
        imports.push("import { defineComponent, h } from 'vue';");
        imports.push("import { UniversalFactory } from '@revolutionary/ui-factory';");
        break;
      case 'angular':
        imports.push("import { Component } from '@angular/core';");
        imports.push("import { UniversalFactory } from '@revolutionary/ui-factory';");
        break;
    }

    return imports.join('\n');
  }

  private static generateFactoryConfig(
    components: ComponentNode[],
    framework: string,
    typescript: boolean
  ): string {
    const rootComponent = components[0];
    if (!rootComponent) return '';

    const config = this.buildComponentConfig(rootComponent);
    
    let code = `const factory = new UniversalFactory();\n\n`;
    
    if (typescript) {
      code += `const componentConfig: ComponentConfig = ${JSON.stringify(config, null, 2)};\n\n`;
    } else {
      code += `const componentConfig = ${JSON.stringify(config, null, 2)};\n\n`;
    }

    code += `const Component = factory.create${this.capitalizeFirst(rootComponent.type)}(componentConfig);\n\n`;
    code += `export default Component;`;

    return code;
  }

  private static buildComponentConfig(node: ComponentNode): any {
    const definition = getComponentDefinition(node.type);
    if (!definition) return {};

    const config: any = {
      name: node.name,
      ...node.props
    };

    // Add children configuration
    if (node.children.length > 0) {
      config.children = node.children.map(child => this.buildComponentConfig(child));
    }

    return config;
  }

  private static generateComponentCode(
    node: ComponentNode,
    framework: string,
    styling: string,
    typescript: boolean
  ): string {
    switch (framework) {
      case 'react':
        return this.generateReactComponent(node, styling, typescript);
      case 'vue':
        return this.generateVueComponent(node, styling, typescript);
      case 'angular':
        return this.generateAngularComponent(node, styling, typescript);
      default:
        return '// Unsupported framework';
    }
  }

  private static generateReactComponent(
    node: ComponentNode,
    styling: string,
    typescript: boolean
  ): string {
    const componentName = this.capitalizeFirst(node.name.replace(/\s+/g, ''));
    
    let code = '';
    
    if (typescript) {
      code += `interface ${componentName}Props {\n  // Add props here\n}\n\n`;
      code += `export const ${componentName}: React.FC<${componentName}Props> = (props) => {\n`;
    } else {
      code += `export const ${componentName} = (props) => {\n`;
    }

    code += `  return (\n`;
    code += this.generateJSX(node, styling, '    ');
    code += `  );\n`;
    code += `};\n`;

    return code;
  }

  private static generateJSX(node: ComponentNode, styling: string, indent: string): string {
    const definition = getComponentDefinition(node.type);
    if (!definition) return `${indent}<div>Unknown component</div>\n`;

    switch (node.type) {
      case 'container':
        return this.generateContainerJSX(node, styling, indent);
      case 'heading':
        return this.generateHeadingJSX(node, indent);
      case 'text':
        return `${indent}<p style={{${this.styleToJSX(node.props)}}}>${node.props.text}</p>\n`;
      case 'button':
        return this.generateButtonJSX(node, styling, indent);
      case 'input':
        return this.generateInputJSX(node, indent);
      case 'image':
        return `${indent}<img src="${node.props.src}" alt="${node.props.alt}" style={{${this.styleToJSX(node.props)}}} />\n`;
      default:
        return `${indent}<div>/* ${node.type} component */</div>\n`;
    }
  }

  private static generateContainerJSX(node: ComponentNode, styling: string, indent: string): string {
    let jsx = `${indent}<div`;
    
    if (styling === 'tailwind') {
      jsx += ` className="${this.propsToTailwind(node.props)}"`;
    } else {
      jsx += ` style={{${this.styleToJSX(node.props)}}}`;
    }
    
    jsx += `>\n`;
    
    if (node.children.length > 0) {
      node.children.forEach(child => {
        jsx += this.generateJSX(child, styling, indent + '  ');
      });
    }
    
    jsx += `${indent}</div>\n`;
    
    return jsx;
  }

  private static generateHeadingJSX(node: ComponentNode, indent: string): string {
    const tag = `h${node.props.level || 2}`;
    return `${indent}<${tag} style={{${this.styleToJSX(node.props)}}}>${node.props.text}</${tag}>\n`;
  }

  private static generateButtonJSX(node: ComponentNode, styling: string, indent: string): string {
    let jsx = `${indent}<button`;
    
    if (styling === 'tailwind') {
      jsx += ` className="${this.buttonPropsToTailwind(node.props)}"`;
    } else {
      jsx += ` style={{${this.styleToJSX(node.props)}}}`;
    }
    
    if (node.props.disabled) {
      jsx += ` disabled`;
    }
    
    jsx += `>${node.props.text}</button>\n`;
    
    return jsx;
  }

  private static generateInputJSX(node: ComponentNode, indent: string): string {
    let jsx = '';
    
    if (node.props.label) {
      jsx += `${indent}<div>\n`;
      jsx += `${indent}  <label>${node.props.label}</label>\n`;
      jsx += `${indent}  <input type="${node.props.type}" placeholder="${node.props.placeholder}" />\n`;
      jsx += `${indent}</div>\n`;
    } else {
      jsx += `${indent}<input type="${node.props.type}" placeholder="${node.props.placeholder}" />\n`;
    }
    
    return jsx;
  }

  private static generateVueComponent(
    node: ComponentNode,
    styling: string,
    typescript: boolean
  ): string {
    const componentName = this.capitalizeFirst(node.name.replace(/\s+/g, ''));
    
    let code = '<template>\n';
    code += this.generateVueTemplate(node, styling, '  ');
    code += '</template>\n\n';
    
    code += typescript ? '<script setup lang="ts">\n' : '<script setup>\n';
    code += '// Component logic here\n';
    code += '</script>\n';
    
    if (styling === 'css') {
      code += '\n<style scoped>\n/* Component styles */\n</style>\n';
    }
    
    return code;
  }

  private static generateVueTemplate(node: ComponentNode, styling: string, indent: string): string {
    // Similar to JSX generation but with Vue template syntax
    return `${indent}<div>Vue component template</div>\n`;
  }

  private static generateAngularComponent(
    node: ComponentNode,
    styling: string,
    typescript: boolean
  ): string {
    const componentName = this.capitalizeFirst(node.name.replace(/\s+/g, ''));
    
    let code = `@Component({\n`;
    code += `  selector: 'app-${node.name.toLowerCase().replace(/\s+/g, '-')}',\n`;
    code += `  template: \`\n`;
    code += this.generateAngularTemplate(node, styling, '    ');
    code += `  \`,\n`;
    code += `  styles: [\`/* Component styles */\`]\n`;
    code += `})\n`;
    code += `export class ${componentName}Component {\n`;
    code += `  // Component logic here\n`;
    code += `}\n`;
    
    return code;
  }

  private static generateAngularTemplate(node: ComponentNode, styling: string, indent: string): string {
    // Similar to JSX generation but with Angular template syntax
    return `${indent}<div>Angular component template</div>\n`;
  }

  private static styleToJSX(props: any): string {
    const styles: string[] = [];
    
    if (props.color) styles.push(`color: '${props.color}'`);
    if (props.backgroundColor) styles.push(`backgroundColor: '${props.backgroundColor}'`);
    if (props.fontSize) styles.push(`fontSize: '${props.fontSize}'`);
    if (props.padding) styles.push(`padding: '${props.padding}'`);
    if (props.margin) styles.push(`margin: '${props.margin}'`);
    if (props.borderRadius) styles.push(`borderRadius: '${props.borderRadius}'`);
    if (props.width) styles.push(`width: '${props.width}'`);
    if (props.height) styles.push(`height: '${props.height}'`);
    
    return styles.join(', ');
  }

  private static propsToTailwind(props: any): string {
    const classes: string[] = [];
    
    // Convert props to Tailwind classes
    if (props.padding) {
      const px = parseInt(props.padding);
      if (px === 0) classes.push('p-0');
      else if (px <= 4) classes.push('p-1');
      else if (px <= 8) classes.push('p-2');
      else if (px <= 16) classes.push('p-4');
      else if (px <= 32) classes.push('p-8');
      else classes.push('p-16');
    }
    
    if (props.display === 'flex') {
      classes.push('flex');
      if (props.flexDirection === 'column') classes.push('flex-col');
      if (props.gap) {
        const gap = parseInt(props.gap);
        if (gap <= 8) classes.push('gap-2');
        else if (gap <= 16) classes.push('gap-4');
        else classes.push('gap-8');
      }
    }
    
    if (props.backgroundColor && props.backgroundColor !== 'transparent') {
      classes.push('bg-gray-100'); // Simplified
    }
    
    if (props.borderRadius) {
      const radius = parseInt(props.borderRadius);
      if (radius > 0 && radius <= 4) classes.push('rounded');
      else if (radius <= 8) classes.push('rounded-lg');
      else if (radius > 8) classes.push('rounded-xl');
    }
    
    return classes.join(' ');
  }

  private static buttonPropsToTailwind(props: any): string {
    const classes: string[] = ['font-medium', 'rounded-lg', 'transition-colors'];
    
    // Size classes
    if (props.size === 'small') classes.push('px-3 py-1.5 text-sm');
    else if (props.size === 'large') classes.push('px-6 py-3 text-lg');
    else classes.push('px-4 py-2');
    
    // Variant classes
    if (props.variant === 'secondary') {
      classes.push('bg-gray-200 text-gray-900 hover:bg-gray-300');
    } else if (props.variant === 'outline') {
      classes.push('border-2 border-purple-600 text-purple-600 hover:bg-purple-50');
    } else if (props.variant === 'ghost') {
      classes.push('text-gray-600 hover:bg-gray-100');
    } else {
      classes.push('bg-purple-600 text-white hover:bg-purple-700');
    }
    
    if (props.fullWidth) classes.push('w-full');
    if (props.disabled) classes.push('opacity-50 cursor-not-allowed');
    
    return classes.join(' ');
  }

  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private static formatCode(code: string): string {
    // Simple formatting - in production, use prettier
    return code
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n');
  }
}