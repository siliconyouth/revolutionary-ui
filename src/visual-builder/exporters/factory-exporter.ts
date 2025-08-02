import { ComponentNode, ExportOptions } from '../core/types';
import { getComponentDefinition } from '../core/component-registry';

export class FactoryExporter {
  export(components: ComponentNode[], options: ExportOptions): string {
    switch (options.format) {
      case 'factory':
        return this.exportToFactory(components, options);
      case 'code':
        return this.exportToCode(components, options);
      case 'json':
        return this.exportToJSON(components);
      default:
        throw new Error(`Unknown export format: ${options.format}`);
    }
  }

  private exportToFactory(components: ComponentNode[], options: ExportOptions): string {
    const { framework, styling, typescript, includeImports } = options;
    
    let code = '';

    // Add imports
    if (includeImports) {
      code += this.generateImports(framework, typescript);
      code += '\n\n';
    }

    // Generate factory configuration
    code += `const componentConfig = {\n`;
    code += `  framework: '${framework}',\n`;
    code += `  styling: '${styling}',\n`;
    code += `  components: [\n`;

    components.forEach((component, index) => {
      code += this.componentToFactory(component, 2);
      if (index < components.length - 1) code += ',';
      code += '\n';
    });

    code += `  ]\n`;
    code += `};\n\n`;

    // Generate factory usage
    code += `// Usage with Revolutionary UI Factory\n`;
    code += `import { UniversalFactory } from '@revolutionary/ui-factory';\n\n`;
    code += `const factory = new UniversalFactory();\n`;
    code += `const generatedComponent = factory.generateFromConfig(componentConfig);\n`;

    return this.formatCode(code, options);
  }

  private exportToCode(components: ComponentNode[], options: ExportOptions): string {
    const { framework, styling, typescript, includeImports } = options;
    
    let code = '';

    // Add imports
    if (includeImports) {
      code += this.generateImports(framework, typescript);
      code += '\n\n';
    }

    // Generate component code
    const componentName = 'GeneratedComponent';
    
    switch (framework) {
      case 'react':
        code += this.generateReactComponent(componentName, components, typescript, styling);
        break;
      case 'vue':
        code += this.generateVueComponent(componentName, components, typescript, styling);
        break;
      case 'angular':
        code += this.generateAngularComponent(componentName, components, typescript, styling);
        break;
      case 'svelte':
        code += this.generateSvelteComponent(componentName, components, styling);
        break;
      default:
        throw new Error(`Unsupported framework: ${framework}`);
    }

    return this.formatCode(code, options);
  }

  private exportToJSON(components: ComponentNode[]): string {
    return JSON.stringify(components, null, 2);
  }

  private componentToFactory(component: ComponentNode, indent: number): string {
    const spaces = ' '.repeat(indent);
    let code = `${spaces}{\n`;
    
    code += `${spaces}  type: '${component.type}',\n`;
    code += `${spaces}  name: '${component.name}',\n`;
    code += `${spaces}  props: ${JSON.stringify(component.props, null, 2).replace(/\n/g, '\n' + spaces + '  ')},\n`;
    
    if (component.children.length > 0) {
      code += `${spaces}  children: [\n`;
      component.children.forEach((child, index) => {
        code += this.componentToFactory(child, indent + 4);
        if (index < component.children.length - 1) code += ',';
        code += '\n';
      });
      code += `${spaces}  ]\n`;
    } else {
      code += `${spaces}  children: []\n`;
    }
    
    code += `${spaces}}`;
    return code;
  }

  private generateImports(framework: string, typescript: boolean): string {
    const imports: string[] = [];

    switch (framework) {
      case 'react':
        imports.push("import React from 'react';");
        if (typescript) {
          imports.push("import { FC } from 'react';");
        }
        break;
      case 'vue':
        imports.push("import { defineComponent, h } from 'vue';");
        break;
      case 'angular':
        imports.push("import { Component } from '@angular/core';");
        break;
      case 'svelte':
        // Svelte imports are handled in script tag
        break;
    }

    return imports.join('\n');
  }

  private generateReactComponent(
    name: string,
    components: ComponentNode[],
    typescript: boolean,
    styling: string
  ): string {
    let code = '';

    if (typescript) {
      code += `interface ${name}Props {\n`;
      code += `  // Add your props here\n`;
      code += `}\n\n`;
      code += `export const ${name}: FC<${name}Props> = (props) => {\n`;
    } else {
      code += `export const ${name} = (props) => {\n`;
    }

    code += `  return (\n`;
    code += this.renderComponentsJSX(components, 4, styling);
    code += `  );\n`;
    code += `};\n`;

    return code;
  }

  private generateVueComponent(
    name: string,
    components: ComponentNode[],
    typescript: boolean,
    styling: string
  ): string {
    let code = `<template>\n`;
    code += this.renderComponentsVue(components, 2, styling);
    code += `</template>\n\n`;

    code += `<script${typescript ? ' lang="ts"' : ''}>\n`;
    code += `import { defineComponent } from 'vue';\n\n`;
    code += `export default defineComponent({\n`;
    code += `  name: '${name}',\n`;
    code += `  props: {},\n`;
    code += `  setup(props) {\n`;
    code += `    return {};\n`;
    code += `  }\n`;
    code += `});\n`;
    code += `</script>\n`;

    return code;
  }

  private generateAngularComponent(
    name: string,
    components: ComponentNode[],
    typescript: boolean,
    styling: string
  ): string {
    let code = `@Component({\n`;
    code += `  selector: 'app-${name.toLowerCase()}',\n`;
    code += `  template: \`\n`;
    code += this.renderComponentsAngular(components, 4, styling);
    code += `  \`\n`;
    code += `})\n`;
    code += `export class ${name}Component {\n`;
    code += `  // Component logic here\n`;
    code += `}\n`;

    return code;
  }

  private generateSvelteComponent(
    name: string,
    components: ComponentNode[],
    styling: string
  ): string {
    let code = `<script>\n`;
    code += `  // Component logic here\n`;
    code += `</script>\n\n`;
    
    code += this.renderComponentsSvelte(components, 0, styling);
    
    code += `\n<style>\n`;
    code += `  /* Component styles here */\n`;
    code += `</style>\n`;

    return code;
  }

  private renderComponentsJSX(
    components: ComponentNode[],
    indent: number,
    styling: string
  ): string {
    const spaces = ' '.repeat(indent);
    let jsx = '';

    if (components.length === 0) {
      return `${spaces}<></>\n`;
    }

    if (components.length === 1) {
      jsx += this.renderComponentJSX(components[0], indent, styling);
    } else {
      jsx += `${spaces}<>\n`;
      components.forEach(component => {
        jsx += this.renderComponentJSX(component, indent + 2, styling);
      });
      jsx += `${spaces}</>\n`;
    }

    return jsx;
  }

  private renderComponentJSX(
    component: ComponentNode,
    indent: number,
    styling: string
  ): string {
    const spaces = ' '.repeat(indent);
    const definition = getComponentDefinition(component.type);
    
    let jsx = `${spaces}<`;
    
    // Map component type to JSX element
    const elementMap: Record<string, string> = {
      container: 'div',
      grid: 'div',
      heading: `h${component.props.level || 2}`,
      text: 'p',
      button: 'button',
      input: 'input',
      image: 'img',
      card: 'div',
      list: component.props.ordered ? 'ol' : 'ul',
    };
    
    jsx += elementMap[component.type] || 'div';
    
    // Add props
    const props = this.generateJSXProps(component, styling);
    if (props) {
      jsx += ` ${props}`;
    }
    
    if (component.children.length > 0 || component.props.text) {
      jsx += '>\n';
      
      if (component.props.text) {
        jsx += `${spaces}  ${component.props.text}\n`;
      }
      
      if (component.children.length > 0) {
        component.children.forEach(child => {
          jsx += this.renderComponentJSX(child, indent + 2, styling);
        });
      }
      
      jsx += `${spaces}</${elementMap[component.type] || 'div'}>\n`;
    } else {
      jsx += ' />\n';
    }
    
    return jsx;
  }

  private generateJSXProps(component: ComponentNode, styling: string): string {
    const props: string[] = [];
    
    if (styling === 'tailwind' && component.props.className) {
      props.push(`className="${component.props.className}"`);
    }
    
    if (component.props.style) {
      const styleStr = JSON.stringify(component.props.style);
      props.push(`style={${styleStr}}`);
    }
    
    // Add other props based on component type
    Object.entries(component.props).forEach(([key, value]) => {
      if (key !== 'style' && key !== 'className' && key !== 'text' && key !== 'children') {
        if (typeof value === 'string') {
          props.push(`${key}="${value}"`);
        } else if (typeof value === 'boolean') {
          if (value) props.push(key);
        } else {
          props.push(`${key}={${JSON.stringify(value)}}`);
        }
      }
    });
    
    return props.join(' ');
  }

  private renderComponentsVue(
    components: ComponentNode[],
    indent: number,
    styling: string
  ): string {
    // Similar implementation for Vue templates
    return '  <!-- Vue template implementation -->\n';
  }

  private renderComponentsAngular(
    components: ComponentNode[],
    indent: number,
    styling: string
  ): string {
    // Similar implementation for Angular templates
    return '    <!-- Angular template implementation -->\n';
  }

  private renderComponentsSvelte(
    components: ComponentNode[],
    indent: number,
    styling: string
  ): string {
    // Similar implementation for Svelte templates
    return '<!-- Svelte template implementation -->\n';
  }

  private formatCode(code: string, options: ExportOptions): string {
    if (!options.prettier) return code;
    
    // In a real implementation, we'd use prettier here
    // For now, just return the code as-is
    return code;
  }
}