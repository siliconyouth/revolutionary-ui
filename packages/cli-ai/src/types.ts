import { z } from 'zod';

export interface AIProvider {
  name: string;
  generate(prompt: string, options?: GenerateOptions): Promise<GenerateResult>;
  isAvailable(): Promise<boolean>;
}

export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stream?: boolean;
  onStream?: (chunk: string) => void;
}

export interface GenerateResult {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export const ComponentSpecSchema = z.object({
  name: z.string(),
  description: z.string(),
  framework: z.enum(['react', 'vue', 'angular', 'svelte', 'solid', 'qwik']),
  type: z.enum(['component', 'page', 'layout', 'hook', 'utility']),
  props: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean().optional(),
    default: z.any().optional(),
    description: z.string().optional(),
  })).optional(),
  dependencies: z.array(z.string()).optional(),
  styling: z.enum(['tailwind', 'css-modules', 'styled-components', 'emotion', 'none']).optional(),
});

export type ComponentSpec = z.infer<typeof ComponentSpecSchema>;

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateComponentOptions {
  prompt: string;
  framework?: string;
  outputPath?: string;
  preview?: boolean;
  interactive?: boolean;
  factory?: string;
}