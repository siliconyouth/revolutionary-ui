import { ComponentMetadata, TranspilerOptions, FrameworkType } from '../types';

export abstract class BaseTranspiler {
  protected warnings: string[] = [];
  protected errors: string[] = [];

  abstract transpile(
    code: string,
    metadata: ComponentMetadata,
    options: TranspilerOptions
  ): Promise<any>;

  protected addWarning(message: string): void {
    this.warnings.push(message);
  }

  protected addError(message: string): void {
    this.errors.push(message);
  }

  protected normalizeIdentifier(name: string): string {
    // Ensure identifier is valid for all frameworks
    return name.replace(/[^a-zA-Z0-9_$]/g, '_');
  }

  protected convertCamelToKebab(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  protected convertKebabToCamel(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  protected extractStylesFromCode(code: string): string {
    // Extract inline styles or styled-components
    const styleRegex = /styled\.[a-z]+`([^`]+)`/g;
    const matches = code.matchAll(styleRegex);
    const styles: string[] = [];
    
    for (const match of matches) {
      styles.push(match[1]);
    }
    
    return styles.join('\n');
  }

  protected mapEventName(eventName: string, targetFramework: FrameworkType): string {
    const eventMap: Record<string, Record<FrameworkType, string>> = {
      'onClick': {
        react: 'onClick',
        vue: '@click',
        angular: '(click)',
        svelte: 'on:click',
        solid: 'onClick',
        preact: 'onClick',
        lit: '@click'
      },
      'onChange': {
        react: 'onChange',
        vue: '@change',
        angular: '(change)',
        svelte: 'on:change',
        solid: 'onChange',
        preact: 'onChange',
        lit: '@change'
      },
      'onInput': {
        react: 'onInput',
        vue: '@input',
        angular: '(input)',
        svelte: 'on:input',
        solid: 'onInput',
        preact: 'onInput',
        lit: '@input'
      },
      'onSubmit': {
        react: 'onSubmit',
        vue: '@submit',
        angular: '(submit)',
        svelte: 'on:submit',
        solid: 'onSubmit',
        preact: 'onSubmit',
        lit: '@submit'
      }
    };

    return eventMap[eventName]?.[targetFramework] || eventName;
  }

  protected mapLifecycleMethod(method: string, targetFramework: FrameworkType): string {
    const lifecycleMap: Record<string, Record<FrameworkType, string>> = {
      'componentDidMount': {
        react: 'componentDidMount',
        vue: 'mounted',
        angular: 'ngOnInit',
        svelte: 'onMount',
        solid: 'onMount',
        preact: 'componentDidMount',
        lit: 'connectedCallback'
      },
      'componentWillUnmount': {
        react: 'componentWillUnmount',
        vue: 'beforeUnmount',
        angular: 'ngOnDestroy',
        svelte: 'onDestroy',
        solid: 'onCleanup',
        preact: 'componentWillUnmount',
        lit: 'disconnectedCallback'
      },
      'componentDidUpdate': {
        react: 'componentDidUpdate',
        vue: 'updated',
        angular: 'ngOnChanges',
        svelte: 'afterUpdate',
        solid: 'createEffect',
        preact: 'componentDidUpdate',
        lit: 'updated'
      }
    };

    return lifecycleMap[method]?.[targetFramework] || method;
  }

  protected generateImportStatement(
    specifiers: Array<{ name: string; type: 'default' | 'named'; imported?: string }>,
    source: string,
    framework: FrameworkType
  ): string {
    const defaultImport = specifiers.find(s => s.type === 'default');
    const namedImports = specifiers.filter(s => s.type === 'named');

    let importStr = 'import ';
    
    if (defaultImport) {
      importStr += defaultImport.name;
      if (namedImports.length > 0) {
        importStr += ', ';
      }
    }
    
    if (namedImports.length > 0) {
      const named = namedImports.map(s => 
        s.imported && s.imported !== s.name 
          ? `${s.imported} as ${s.name}`
          : s.name
      ).join(', ');
      importStr += `{ ${named} }`;
    }
    
    importStr += ` from '${source}'`;
    
    return importStr;
  }

  protected transformTwoWayBinding(
    elementName: string,
    valueProp: string,
    framework: FrameworkType
  ): { attribute: string; value: string } {
    switch (framework) {
      case 'vue':
        return { attribute: 'v-model', value: valueProp };
      case 'angular':
        return { attribute: '[(ngModel)]', value: valueProp };
      case 'svelte':
        return { attribute: 'bind:value', value: valueProp };
      default:
        return { attribute: 'value', value: valueProp };
    }
  }

  protected transformConditionalRendering(
    condition: string,
    framework: FrameworkType
  ): string {
    switch (framework) {
      case 'vue':
        return `v-if="${condition}"`;
      case 'angular':
        return `*ngIf="${condition}"`;
      case 'svelte':
        return `{#if ${condition}}`;
      case 'solid':
        return `<Show when={${condition}}>`;
      default:
        return `{${condition} && `;
    }
  }

  protected transformListRendering(
    items: string,
    itemName: string,
    framework: FrameworkType
  ): string {
    switch (framework) {
      case 'vue':
        return `v-for="${itemName} in ${items}" :key="${itemName}.id"`;
      case 'angular':
        return `*ngFor="let ${itemName} of ${items}"`;
      case 'svelte':
        return `{#each ${items} as ${itemName}}`;
      case 'solid':
        return `<For each={${items}}>{${itemName} =>`;
      default:
        return `{${items}.map(${itemName} =>`;
    }
  }
}