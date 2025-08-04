import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { ComponentMetadata, TranspilerOptions } from '../types';
import { BaseTranspiler } from './BaseTranspiler';

export class ReactToVueTranspiler extends BaseTranspiler {
  async transpile(
    code: string,
    metadata: ComponentMetadata,
    options: TranspilerOptions = {}
  ): Promise<any> {
    const useCompositionAPI = options.style === 'composition' || options.version === '3';
    
    // Parse React code
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    // Transform React to Vue
    const vueComponent = useCompositionAPI
      ? this.transformToCompositionAPI(ast, metadata)
      : this.transformToOptionsAPI(ast, metadata);

    // Generate Vue SFC
    const template = this.transformJSXToTemplate(metadata.template);
    const script = vueComponent;
    const styles = metadata.styles || '';

    return {
      code: this.generateVueSFC(template, script, styles, options),
      metadata,
      warnings: this.warnings
    };
  }

  private transformToCompositionAPI(ast: any, metadata: ComponentMetadata): string {
    const imports: string[] = [];
    const setup: string[] = [];
    const methods: string[] = [];

    // Add Vue imports
    const vueImports = ['defineComponent'];
    if (Object.keys(metadata.state).length > 0) {
      vueImports.push('ref', 'reactive');
    }
    if (Object.keys(metadata.lifecycle).length > 0) {
      if (metadata.lifecycle.mounted) vueImports.push('onMounted');
      if (metadata.lifecycle.unmounted) vueImports.push('onUnmounted');
    }
    if (Object.keys(metadata.computed || {}).length > 0) {
      vueImports.push('computed');
    }
    imports.push(`import { ${vueImports.join(', ')} } from 'vue'`);

    // Add other imports
    metadata.dependencies.forEach(dep => {
      if (dep.source !== 'react') {
        const specs = dep.specifiers.map(spec => {
          if (spec.type === 'default') return spec.name;
          if (spec.type === 'named') {
            return spec.imported === spec.name 
              ? spec.name 
              : `${spec.imported} as ${spec.name}`;
          }
          return '';
        }).filter(Boolean).join(', ');
        
        imports.push(`import ${specs} from '${dep.source}'`);
      }
    });

    // Transform props
    const propsDefinition = this.generatePropsDefinition(metadata.props);

    // Transform state
    Object.entries(metadata.state).forEach(([name, def]) => {
      if (typeof def.initial === 'object' && def.initial !== null) {
        setup.push(`const ${name} = reactive(${def.initial})`);
      } else {
        setup.push(`const ${name} = ref(${def.initial})`);
      }
    });

    // Transform methods
    Object.entries(metadata.methods).forEach(([name, method]) => {
      methods.push(`const ${name} = (${method.params.join(', ')}) => ${method.body}`);
    });

    // Transform lifecycle
    if (metadata.lifecycle.mounted) {
      setup.push(`onMounted(() => ${metadata.lifecycle.mounted})`);
    }
    if (metadata.lifecycle.unmounted) {
      setup.push(`onUnmounted(() => ${metadata.lifecycle.unmounted})`);
    }

    // Generate composition API component
    return `${imports.join('\n')}

export default defineComponent({
  name: '${metadata.name}',
  ${propsDefinition ? `props: ${propsDefinition},` : ''}
  setup(props) {
    ${setup.join('\n    ')}
    
    ${methods.join('\n    ')}
    
    return {
      ${Object.keys(metadata.state).join(',\n      ')},
      ${Object.keys(metadata.methods).join(',\n      ')}
    }
  }
})`;
  }

  private transformToOptionsAPI(ast: any, metadata: ComponentMetadata): string {
    const imports: string[] = [];
    
    // Add imports
    metadata.dependencies.forEach(dep => {
      if (dep.source !== 'react') {
        const specs = dep.specifiers.map(spec => {
          if (spec.type === 'default') return spec.name;
          if (spec.type === 'named') return `{ ${spec.name} }`;
          return '';
        }).filter(Boolean).join(', ');
        
        imports.push(`import ${specs} from '${dep.source}'`);
      }
    });

    // Generate options API component
    const options: string[] = [];
    
    options.push(`name: '${metadata.name}'`);
    
    // Props
    const propsDefinition = this.generatePropsDefinition(metadata.props);
    if (propsDefinition) {
      options.push(`props: ${propsDefinition}`);
    }

    // Data
    if (Object.keys(metadata.state).length > 0) {
      const dataProperties = Object.entries(metadata.state)
        .map(([name, def]) => `    ${name}: ${def.initial}`)
        .join(',\n');
      
      options.push(`data() {
    return {
${dataProperties}
    }
  }`);
    }

    // Methods
    if (Object.keys(metadata.methods).length > 0) {
      const methodsStr = Object.entries(metadata.methods)
        .map(([name, method]) => `    ${name}(${method.params.join(', ')}) ${method.body}`)
        .join(',\n');
      
      options.push(`methods: {
${methodsStr}
  }`);
    }

    // Lifecycle
    if (metadata.lifecycle.mounted) {
      options.push(`mounted() ${metadata.lifecycle.mounted}`);
    }
    if (metadata.lifecycle.unmounted) {
      options.push(`beforeUnmount() ${metadata.lifecycle.unmounted}`);
    }

    return `${imports.join('\n')}

export default {
  ${options.join(',\n  ')}
}`;
  }

  private generatePropsDefinition(props: Record<string, any>): string {
    if (Object.keys(props).length === 0) return '';

    const propEntries = Object.entries(props).map(([name, def]) => {
      if (typeof def === 'object' && def.type) {
        return `    ${name}: {
      type: ${this.mapPropType(def.type)},
      required: ${def.required || false},
      ${def.default !== undefined ? `default: ${JSON.stringify(def.default)}` : ''}
    }`;
      }
      return `    ${name}: null`;
    });

    return `{
${propEntries.join(',\n')}
  }`;
  }

  private mapPropType(reactType: string): string {
    const typeMap: Record<string, string> = {
      'string': 'String',
      'number': 'Number',
      'boolean': 'Boolean',
      'array': 'Array',
      'object': 'Object',
      'function': 'Function',
      'symbol': 'Symbol'
    };
    
    return typeMap[reactType.toLowerCase()] || 'null';
  }

  private transformJSXToTemplate(jsx: string): string {
    if (!jsx) return '<div></div>';

    let template = jsx;

    // Transform JSX to Vue template syntax
    // Replace className with class
    template = template.replace(/className=/g, 'class=');
    
    // Transform event handlers
    template = template.replace(/onClick=/g, '@click=');
    template = template.replace(/onChange=/g, '@change=');
    template = template.replace(/onSubmit=/g, '@submit=');
    template = template.replace(/onInput=/g, '@input=');
    template = template.replace(/onKeyDown=/g, '@keydown=');
    template = template.replace(/onKeyUp=/g, '@keyup=');
    template = template.replace(/onFocus=/g, '@focus=');
    template = template.replace(/onBlur=/g, '@blur=');

    // Transform conditional rendering
    // {condition && <Component />} -> <Component v-if="condition" />
    template = template.replace(/\{([^}]+)\s*&&\s*<([^>]+)>\}/g, '<$2 v-if="$1">');
    
    // Transform ternary operators
    // {condition ? <A /> : <B />} -> <template v-if="condition"><A /></template><template v-else><B /></template>
    template = template.replace(
      /\{([^}]+)\s*\?\s*<([^>]+)>\s*:\s*<([^>]+)>\}/g,
      '<template v-if="$1"><$2 /></template><template v-else><$3 /></template>'
    );

    // Transform list rendering
    // {items.map(item => <Component key={item.id} />)} -> <Component v-for="item in items" :key="item.id" />
    template = template.replace(
      /\{(\w+)\.map\((\w+)\s*=>\s*<([^>]+)\s+key=\{([^}]+)\}([^>]*)>\s*\)\}/g,
      '<$3 v-for="$2 in $1" :key="$4"$5>'
    );

    // Transform prop bindings
    // prop={value} -> :prop="value"
    template = template.replace(/\s(\w+)=\{([^}]+)\}/g, ' :$1="$2"');

    // Transform style bindings
    // style={{color: 'red'}} -> :style="{color: 'red'}"
    template = template.replace(/style=\{\{([^}]+)\}\}/g, ':style="{$1}"');

    // Clean up any remaining JSX expressions
    template = template.replace(/\{([^}]+)\}/g, '{{ $1 }}');

    return template;
  }

  private generateVueSFC(
    template: string,
    script: string,
    styles: string,
    options: TranspilerOptions
  ): string {
    const parts: string[] = [];

    // Template section
    parts.push(`<template>\n  ${template}\n</template>`);

    // Script section
    const lang = options.typescript ? ' lang="ts"' : '';
    const setup = options.style === 'composition' ? ' setup' : '';
    parts.push(`\n<script${lang}${setup}>\n${script}\n</script>`);

    // Style section
    if (styles) {
      parts.push(`\n<style scoped>\n${styles}\n</style>`);
    }

    return parts.join('\n');
  }
}