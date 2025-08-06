import { z } from 'zod';

/**
 * Component file schema
 */
export const ComponentFileSchema = z.object({
  path: z.string().describe('Relative path from component directory'),
  content: z.string().describe('File content'),
  type: z.enum(['component', 'style', 'test', 'story', 'types', 'utils']),
});

/**
 * Tailwind configuration schema
 */
export const TailwindConfigSchema = z.object({
  config: z.record(z.any()).optional(),
  plugins: z.array(z.string()).optional(),
  content: z.array(z.string()).optional(),
});

/**
 * CSS variables schema
 */
export const CSSVariableSchema = z.object({
  name: z.string(),
  value: z.string(),
  dark: z.string().optional(),
});

/**
 * Component style schema
 */
export const ComponentStyleSchema = z.object({
  tailwind: TailwindConfigSchema.optional(),
  cssVariables: z.array(CSSVariableSchema).optional(),
  globalStyles: z.string().optional(),
});

/**
 * Framework-specific config schema
 */
export const FrameworkConfigSchema = z.object({
  react: z.object({
    version: z.string().optional(),
    typescript: z.boolean().default(true),
  }).optional(),
  vue: z.object({
    version: z.string().optional(),
    composition: z.boolean().default(true),
  }).optional(),
  angular: z.object({
    version: z.string().optional(),
    standalone: z.boolean().default(true),
  }).optional(),
  svelte: z.object({
    version: z.string().optional(),
  }).optional(),
});

/**
 * Main component schema (shadcn-style)
 */
export const ComponentSchema = z.object({
  name: z.string().describe('Component name'),
  type: z.enum(['ui', 'composite', 'layout', 'primitive']).default('ui'),
  description: z.string().describe('Component description'),
  files: z.array(ComponentFileSchema).describe('Component files'),
  dependencies: z.record(z.string()).default({}).describe('NPM dependencies'),
  devDependencies: z.record(z.string()).default({}).describe('NPM dev dependencies'),
  registryDependencies: z.array(z.string()).default([]).describe('Dependencies on other registry components'),
  style: ComponentStyleSchema.optional(),
  framework: FrameworkConfigSchema.optional(),
  meta: z.object({
    version: z.string().default('1.0.0'),
    author: z.string().optional(),
    license: z.string().default('MIT'),
    tags: z.array(z.string()).default([]),
    category: z.string().optional(),
  }).optional(),
});

/**
 * Registry index schema
 */
export const RegistryIndexSchema = z.object({
  version: z.string(),
  components: z.array(z.object({
    name: z.string(),
    type: z.string(),
    description: z.string(),
    files: z.array(z.string()),
    dependencies: z.array(z.string()).optional(),
    registryDependencies: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  })),
});

export type ComponentFile = z.infer<typeof ComponentFileSchema>;
export type ComponentStyle = z.infer<typeof ComponentStyleSchema>;
export type ComponentSchema = z.infer<typeof ComponentSchema>;
export type RegistryIndex = z.infer<typeof RegistryIndexSchema>;

/**
 * Validate component schema
 */
export function validateComponentSchema(data: unknown): ComponentSchema {
  return ComponentSchema.parse(data);
}

/**
 * Create component manifest
 */
export function createComponentManifest(component: ComponentSchema): string {
  return JSON.stringify(component, null, 2);
}