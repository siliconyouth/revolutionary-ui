import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/bin/rui.ts'],
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
  minify: false,
  target: 'node18',
  external: [
    '@revolutionary-ui/cli-core',
    '@revolutionary-ui/cli-auth',
    '@revolutionary-ui/cli-generate',
    '@revolutionary-ui/cli-scaffold',
    '@revolutionary-ui/cli-marketplace',
    '@revolutionary-ui/cli-ai',
    '@revolutionary-ui/cli-config',
    'chalk',
    'commander',
  ],
});