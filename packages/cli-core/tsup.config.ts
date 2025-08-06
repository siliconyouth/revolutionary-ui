import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false, // Temporarily disabled due to build issues
  splitting: false,
  sourcemap: false,
  clean: true,
  shims: false,
  minify: false,
  target: 'node18',
  // Mark ALL dependencies as external - don't bundle anything
  external: [
    /^[^./]/,  // Mark all node_modules as external
  ],
  noExternal: [], // Don't bundle any deps
  platform: 'node',
  skipNodeModulesBundle: true,
});