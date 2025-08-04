import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { ComponentMetadata, TranspilerOptions } from '../types';
import { BaseTranspiler } from './BaseTranspiler';

export class VueToReactTranspiler extends BaseTranspiler {
  async transpile(
    code: string,
    metadata: ComponentMetadata,
    options: TranspilerOptions = {}
  ): Promise<any> {
    // Parse Vue SFC or extract script content
    const scriptContent = this.extractScriptContent(code);
    const isCompositionAPI = this.detectCompositionAPI(scriptContent);

    // Transform Vue to React
    const reactComponent = isCompositionAPI
      ? this.transformFromCompositionAPI(scriptContent, metadata, options)
      : this.transformFromOptionsAPI(scriptContent, metadata, options);

    // Transform template to JSX
    const jsx = this.transformTemplateToJSX(metadata.template);

    // Combine everything
    const finalCode = this.generateReactComponent(reactComponent, jsx, metadata, options);

    return {
      code: finalCode,
      metadata,
      warnings: this.warnings
    };
  }

  private extractScriptContent(code: string): string {
    const scriptMatch = code.match(/<script.*?>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      return scriptMatch[1].trim();
    }
    // If no script tags, assume it's already just the script content
    return code;
  }

  private detectCompositionAPI(scriptContent: string): boolean {
    return scriptContent.includes('setup') || 
           scriptContent.includes('ref(') || 
           scriptContent.includes('reactive(') ||
           scriptContent.includes('defineComponent');
  }

  private transformFromCompositionAPI(
    scriptContent: string,
    metadata: ComponentMetadata,
    options: TranspilerOptions
  ): string {
    const imports: string[] = ['import React, { useState, useEffect, useCallback, useMemo } from "react"'];
    const hooks: string[] = [];
    const methods: string[] = [];

    // Add other imports
    metadata.dependencies.forEach(dep => {
      if (!dep.source.includes('vue')) {
        const specs = dep.specifiers.map(spec => {
          if (spec.type === 'default') return spec.name;
          if (spec.type === 'named') return `{ ${spec.name} }`;
          return '';
        }).filter(Boolean).join(', ');
        
        imports.push(`import ${specs} from '${dep.source}'`);
      }
    });

    // Transform reactive state to useState
    Object.entries(metadata.state).forEach(([name, def]) => {
      const setterName = `set${name.charAt(0).toUpperCase() + name.slice(1)}`;
      hooks.push(`const [${name}, ${setterName}] = useState(${def.initial})`);
    });

    // Transform computed to useMemo
    if (metadata.computed) {
      Object.entries(metadata.computed).forEach(([name, computed]) => {
        const deps = computed.dependencies.join(', ');
        hooks.push(`const ${name} = useMemo(() => ${computed.get}, [${deps}])`);
      });
    }

    // Transform methods to useCallback
    Object.entries(metadata.methods).forEach(([name, method]) => {
      methods.push(`const ${name} = useCallback((${method.params.join(', ')}) => ${method.body}, [])`);
    });

    // Transform lifecycle hooks
    if (metadata.lifecycle.mounted) {
      hooks.push(`useEffect(() => ${metadata.lifecycle.mounted}, [])`);
    }
    if (metadata.lifecycle.unmounted) {
      hooks.push(`useEffect(() => {
    return () => ${metadata.lifecycle.unmounted}
  }, [])`);
    }

    return { imports, hooks, methods };
  }

  private transformFromOptionsAPI(
    scriptContent: string,
    metadata: ComponentMetadata,
    options: TranspilerOptions
  ): string {
    const imports: string[] = ['import React, { Component } from "react"'];
    const stateInit: string[] = [];
    const methods: string[] = [];

    // Add other imports
    metadata.dependencies.forEach(dep => {
      if (!dep.source.includes('vue')) {
        imports.push(this.generateImportStatement(dep.specifiers, dep.source, 'react'));
      }
    });

    // Transform data to state
    Object.entries(metadata.state).forEach(([name, def]) => {
      stateInit.push(`${name}: ${def.initial}`);
    });

    // Transform methods
    Object.entries(metadata.methods).forEach(([name, method]) => {
      methods.push(`${name} = (${method.params.join(', ')}) => ${method.body}`);
    });

    return { imports, stateInit, methods };
  }

  private transformTemplateToJSX(template: string): string {
    if (!template) return '<div />';

    let jsx = template;

    // Transform Vue directives to JSX
    // v-if -> conditional rendering
    jsx = jsx.replace(/<(\w+)\s+v-if="([^"]+)"/g, '{$2 && <$1');
    jsx = jsx.replace(/<\/(\w+)>/g, '</$1>}');

    // v-for -> map
    jsx = jsx.replace(
      /<(\w+)\s+v-for="(\w+)\s+in\s+(\w+)"\s+:key="([^"]+)"/g,
      '{$3.map($2 => <$1 key={$4}'
    );

    // v-model -> value + onChange
    jsx = jsx.replace(
      /v-model="(\w+)"/g,
      'value={$1} onChange={(e) => set${$1.charAt(0).toUpperCase() + $1.slice(1)}(e.target.value)}'
    );

    // @ event handlers -> on handlers
    jsx = jsx.replace(/@click=/g, 'onClick=');
    jsx = jsx.replace(/@change=/g, 'onChange=');
    jsx = jsx.replace(/@submit=/g, 'onSubmit=');
    jsx = jsx.replace(/@input=/g, 'onInput=');

    // : prop bindings -> {}
    jsx = jsx.replace(/:(\w+)="([^"]+)"/g, '$1={$2}');

    // {{ }} interpolations -> { }
    jsx = jsx.replace(/\{\{([^}]+)\}\}/g, '{$1}');

    // class -> className
    jsx = jsx.replace(/\sclass=/g, ' className=');

    // slot -> children
    jsx = jsx.replace(/<slot\s*\/>/g, '{children}');
    jsx = jsx.replace(/<slot>([^<]*)<\/slot>/g, '{children || "$1"}');

    return jsx;
  }

  private generateReactComponent(
    componentParts: any,
    jsx: string,
    metadata: ComponentMetadata,
    options: TranspilerOptions
  ): string {
    const { imports, hooks, methods, stateInit } = componentParts;
    const isClassComponent = !!stateInit;

    if (isClassComponent) {
      // Generate class component
      return `${imports.join('\n')}

class ${metadata.name} extends Component {
  state = {
${stateInit.map(s => `    ${s}`).join(',\n')}
  }

${methods.map(m => `  ${m}`).join('\n\n')}

  ${metadata.lifecycle.mounted ? `componentDidMount() ${metadata.lifecycle.mounted}` : ''}
  ${metadata.lifecycle.unmounted ? `componentWillUnmount() ${metadata.lifecycle.unmounted}` : ''}

  render() {
    const { ${Object.keys(metadata.props).join(', ')} } = this.props
    const { ${Object.keys(metadata.state).join(', ')} } = this.state

    return (
      ${jsx}
    )
  }
}

export default ${metadata.name}`;
    } else {
      // Generate functional component
      const propsList = Object.keys(metadata.props);
      const propsParam = propsList.length > 0 ? `{ ${propsList.join(', ')} }` : '';

      return `${imports.join('\n')}

function ${metadata.name}(${propsParam}) {
  ${hooks.join('\n  ')}

  ${methods.join('\n  ')}

  return (
    ${jsx}
  )
}

export default ${metadata.name}`;
    }
  }
}