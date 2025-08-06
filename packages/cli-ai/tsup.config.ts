import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // Disable for now due to type issues
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
  minify: false,
  target: 'node18',
  external: [
    '@revolutionary-ui/cli-core',
    'openai',
    '@anthropic-ai/sdk',
    '@google/generative-ai',
    'ollama',
    'chalk',
  ],
});