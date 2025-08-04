export type FrameworkType = 'react' | 'vue' | 'angular' | 'svelte' | 'solid' | 'preact' | 'lit';

export interface TranspilationResult {
  success: boolean;
  code: string;
  framework: FrameworkType;
  error?: string;
  warnings: string[];
  metadata?: ComponentMetadata;
  imports?: ImportStatement[];
  sourceMap?: string;
}

export interface ComponentMetadata {
  name: string;
  props: Record<string, PropDefinition>;
  state: Record<string, StateDefinition>;
  methods: Record<string, MethodDefinition>;
  lifecycle: Record<string, string>;
  dependencies: DependencyInfo[];
  styles: string;
  template: string;
  computed?: Record<string, ComputedDefinition>;
  emits?: string[];
  slots?: SlotDefinition[];
}

export interface PropDefinition {
  type: string;
  required: boolean;
  default?: any;
  validator?: string;
}

export interface StateDefinition {
  type: string;
  initial: string;
  reactive?: boolean;
}

export interface MethodDefinition {
  params: string[];
  body: string;
  async?: boolean;
  return?: string;
}

export interface ComputedDefinition {
  get?: string;
  set?: string;
  dependencies: string[];
}

export interface DependencyInfo {
  source: string;
  specifiers: Array<{
    name: string;
    type: 'default' | 'named' | 'namespace';
    imported?: string;
  }>;
}

export interface ImportStatement {
  source: string;
  specifiers: string[];
  type: 'default' | 'named' | 'namespace';
}

export interface SlotDefinition {
  name: string;
  props?: Record<string, any>;
  fallback?: string;
}

export interface ComponentAST {
  type: 'Program';
  body: any[];
  sourceType: 'module' | 'script';
}

export interface TranspilerOptions {
  preserveComments?: boolean;
  typescript?: boolean;
  format?: boolean;
  style?: 'options' | 'composition' | 'class';
  version?: string;
}

export interface FrameworkFeatures {
  hasJSX: boolean;
  hasTemplates: boolean;
  hasStyles: boolean;
  hasTypeScript: boolean;
  reactivity: 'hooks' | 'proxy' | 'getter-setter' | 'compiler';
  componentFormat: 'function' | 'class' | 'object' | 'sfc';
}

export const FRAMEWORK_FEATURES: Record<FrameworkType, FrameworkFeatures> = {
  react: {
    hasJSX: true,
    hasTemplates: false,
    hasStyles: false,
    hasTypeScript: true,
    reactivity: 'hooks',
    componentFormat: 'function'
  },
  vue: {
    hasJSX: false,
    hasTemplates: true,
    hasStyles: true,
    hasTypeScript: true,
    reactivity: 'proxy',
    componentFormat: 'sfc'
  },
  angular: {
    hasJSX: false,
    hasTemplates: true,
    hasStyles: true,
    hasTypeScript: true,
    reactivity: 'getter-setter',
    componentFormat: 'class'
  },
  svelte: {
    hasJSX: false,
    hasTemplates: true,
    hasStyles: true,
    hasTypeScript: true,
    reactivity: 'compiler',
    componentFormat: 'sfc'
  },
  solid: {
    hasJSX: true,
    hasTemplates: false,
    hasStyles: false,
    hasTypeScript: true,
    reactivity: 'proxy',
    componentFormat: 'function'
  },
  preact: {
    hasJSX: true,
    hasTemplates: false,
    hasStyles: false,
    hasTypeScript: true,
    reactivity: 'hooks',
    componentFormat: 'function'
  },
  lit: {
    hasJSX: false,
    hasTemplates: true,
    hasStyles: true,
    hasTypeScript: true,
    reactivity: 'getter-setter',
    componentFormat: 'class'
  }
};

// Mapping of common UI patterns between frameworks
export const PATTERN_MAPPINGS = {
  // State management
  state: {
    react: 'useState',
    vue: 'ref/reactive',
    angular: 'property',
    svelte: 'let',
    solid: 'createSignal',
    preact: 'useState',
    lit: '@property'
  },
  
  // Event handling
  events: {
    react: 'onClick',
    vue: '@click',
    angular: '(click)',
    svelte: 'on:click',
    solid: 'onClick',
    preact: 'onClick',
    lit: '@click'
  },
  
  // Conditional rendering
  conditional: {
    react: '{condition && <Component />}',
    vue: 'v-if',
    angular: '*ngIf',
    svelte: '{#if condition}',
    solid: '<Show when={condition}>',
    preact: '{condition && <Component />}',
    lit: '${condition ? html`` : html``}'
  },
  
  // List rendering
  list: {
    react: 'items.map(item => <Component key={item.id} />)',
    vue: 'v-for',
    angular: '*ngFor',
    svelte: '{#each items as item}',
    solid: '<For each={items}>',
    preact: 'items.map(item => <Component key={item.id} />)',
    lit: '${items.map(item => html``)}'
  },
  
  // Two-way binding
  twoWay: {
    react: 'value + onChange',
    vue: 'v-model',
    angular: '[(ngModel)]',
    svelte: 'bind:value',
    solid: 'value + onInput',
    preact: 'value + onInput',
    lit: '.value + @input'
  }
};