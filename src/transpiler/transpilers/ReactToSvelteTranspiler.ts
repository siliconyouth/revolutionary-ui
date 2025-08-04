import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import { ComponentMetadata, TranspilerOptions } from '../types';
import { BaseTranspiler } from './BaseTranspiler';

export class ReactToSvelteTranspiler extends BaseTranspiler {
  async transpile(
    code: string,
    metadata: ComponentMetadata,
    options: TranspilerOptions = {}
  ): Promise<any> {
    const script = this.transformToSvelteScript(metadata, options);
    const template = this.transformJSXToSvelteTemplate(metadata.template);
    const styles = metadata.styles || '';

    const svelteSFC = this.generateSvelteSFC(script, template, styles);

    return {
      code: svelteSFC,
      metadata,
      warnings: this.warnings
    };
  }

  private transformToSvelteScript(
    metadata: ComponentMetadata,
    options: TranspilerOptions
  ): string {
    const imports: string[] = [];
    const exports: string[] = [];
    const reactiveStatements: string[] = [];
    const variables: string[] = [];
    const functions: string[] = [];

    // Add Svelte imports if needed
    if (metadata.lifecycle.mounted || metadata.lifecycle.unmounted) {
      imports.push("import { onMount, onDestroy } from 'svelte'");
    }

    // Add other imports
    metadata.dependencies.forEach(dep => {
      if (!dep.source.includes('react')) {
        const specs = dep.specifiers.map(spec => {
          if (spec.type === 'default') return spec.name;
          if (spec.type === 'named') return `{ ${spec.name} }`;
          return '';
        }).filter(Boolean).join(', ');
        
        imports.push(`import ${specs} from '${dep.source}'`);
      }
    });

    // Transform props to exported variables
    Object.entries(metadata.props).forEach(([name, prop]) => {
      const defaultValue = prop.default !== undefined ? ` = ${JSON.stringify(prop.default)}` : '';
      exports.push(`export let ${name}${defaultValue}`);
    });

    // Transform state to regular variables
    Object.entries(metadata.state).forEach(([name, state]) => {
      variables.push(`let ${name} = ${state.initial}`);
    });

    // Transform computed properties to reactive statements
    if (metadata.computed) {
      Object.entries(metadata.computed).forEach(([name, computed]) => {
        reactiveStatements.push(`$: ${name} = ${computed.get}`);
      });
    }

    // Transform methods to functions
    Object.entries(metadata.methods).forEach(([name, method]) => {
      functions.push(`function ${name}(${method.params.join(', ')}) ${method.body}`);
    });

    // Transform lifecycle hooks
    if (metadata.lifecycle.mounted) {
      functions.push(`onMount(() => ${metadata.lifecycle.mounted})`);
    }
    if (metadata.lifecycle.unmounted) {
      functions.push(`onDestroy(() => ${metadata.lifecycle.unmounted})`);
    }

    // Build the script content
    const scriptParts = [
      ...imports,
      '',
      ...exports,
      '',
      ...variables,
      '',
      ...reactiveStatements,
      '',
      ...functions
    ].filter(part => part !== undefined);

    return scriptParts.join('\n');
  }

  private transformJSXToSvelteTemplate(jsx: string): string {
    if (!jsx) return '<div></div>';

    let template = jsx;

    // Transform className to class
    template = template.replace(/className=/g, 'class=');

    // Transform event handlers
    template = template.replace(/onClick=\{(\w+)\}/g, 'on:click={$1}');
    template = template.replace(/onChange=\{(\w+)\}/g, 'on:change={$1}');
    template = template.replace(/onSubmit=\{(\w+)\}/g, 'on:submit={$1}');
    template = template.replace(/onInput=\{(\w+)\}/g, 'on:input={$1}');
    template = template.replace(/onKeyDown=\{(\w+)\}/g, 'on:keydown={$1}');
    template = template.replace(/onKeyUp=\{(\w+)\}/g, 'on:keyup={$1}');

    // Transform conditional rendering
    // {condition && <Component />} -> {#if condition}<Component />{/if}
    template = template.replace(
      /\{(\w+)\s*&&\s*<(\w+)([^>]*)\/>\}/g,
      '{#if $1}<$2$3/>{/if}'
    );
    template = template.replace(
      /\{(\w+)\s*&&\s*<(\w+)([^>]*)>(.*?)<\/\2>\}/g,
      '{#if $1}<$2$3>$4</$2>{/if}'
    );

    // Transform ternary operators
    template = template.replace(
      /\{(\w+)\s*\?\s*<(\w+)([^>]*)\/>\s*:\s*<(\w+)([^>]*)\/>\}/g,
      '{#if $1}<$2$3/>{:else}<$4$5/>{/if}'
    );

    // Transform list rendering
    // {items.map(item => <Component key={item.id} />)} -> {#each items as item}<Component />{/each}
    template = template.replace(
      /\{(\w+)\.map\((\w+)\s*=>\s*<(\w+)([^>]*)\s+key=\{([^}]+)\}([^>]*)>(.*?)<\/\3>\)\}/g,
      '{#each $1 as $2 ($5)}<$3$4$6>$7</$3>{/each}'
    );
    template = template.replace(
      /\{(\w+)\.map\((\w+)\s*=>\s*<(\w+)([^>]*)\s+key=\{([^}]+)\}([^>]*)\/>\)\}/g,
      '{#each $1 as $2 ($5)}<$3$4$6/>{/each}'
    );

    // Transform prop bindings (already in correct format for Svelte)
    // prop={value} stays as prop={value}

    // Transform style bindings
    // style={{color: 'red'}} -> style="color: red"
    template = template.replace(/style=\{\{([^}]+)\}\}/g, (match, styles) => {
      const styleStr = styles
        .split(',')
        .map((s: string) => {
          const [key, value] = s.split(':').map((str: string) => str.trim());
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `${cssKey}: ${value.replace(/['"]/g, '')}`;
        })
        .join('; ');
      return `style="${styleStr}"`;
    });

    // Transform two-way binding for inputs
    // value={value} onChange={handler} -> bind:value={value}
    template = template.replace(
      /value=\{(\w+)\}\s*on:change=\{[^}]+\}/g,
      'bind:value={$1}'
    );

    // Handle fragments - Svelte doesn't need them
    template = template.replace(/<\/?React\.Fragment>/g, '');
    template = template.replace(/<\/?>/g, '');

    return template;
  }

  private generateSvelteSFC(
    script: string,
    template: string,
    styles: string
  ): string {
    const parts: string[] = [];

    // Script section
    if (script.trim()) {
      parts.push(`<script>\n${script}\n</script>`);
    }

    // Template section (Svelte doesn't use template tags, just put the HTML)
    parts.push(`\n${template}`);

    // Style section
    if (styles.trim()) {
      parts.push(`\n<style>\n${styles}\n</style>`);
    }

    return parts.join('\n');
  }
}