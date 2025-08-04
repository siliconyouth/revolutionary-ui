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

export interface TranspilerOptions {
  preserveComments?: boolean;
  typescript?: boolean;
  format?: boolean;
  style?: 'options' | 'composition' | 'class';
  version?: string;
}