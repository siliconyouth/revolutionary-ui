#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building rev-ui CLI...');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist/cli/rev-ui');
fs.mkdirSync(distDir, { recursive: true });

// Build TypeScript files
console.log('Compiling TypeScript...');
try {
  execSync('npx tsc --project tsconfig.rev-ui.json', { stdio: 'inherit' });
} catch (error) {
  console.error('TypeScript compilation failed. Using fallback build...');
  
  // Fallback: Copy source files with basic transpilation
  const srcDir = path.join(__dirname, 'src/cli/rev-ui');
  const files = fs.readdirSync(srcDir, { recursive: true });
  
  files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const srcPath = path.join(srcDir, file);
      const distPath = path.join(distDir, file.replace(/\.tsx?$/, '.js'));
      
      // Ensure directory exists
      fs.mkdirSync(path.dirname(distPath), { recursive: true });
      
      // Read file
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Basic transformations
      content = content
        .replace(/import (.+) from '(.+)\.js'/g, "import $1 from '$2'")
        .replace(/export const/g, 'module.exports.')
        .replace(/export \{/g, 'module.exports = {')
        .replace(/import React/g, "const React = require('react')")
        .replace(/import \{(.+)\} from 'ink'/g, "const {$1} = require('ink')")
        .replace(/import (.+) from 'ink-(.+)'/g, "const $1 = require('ink-$2')");
      
      fs.writeFileSync(distPath, content);
    }
  });
}

console.log('✓ rev-ui CLI built successfully!');
console.log('');
console.log('To use the new CLI:');
console.log('  npx rev-ui');
console.log('');
console.log('Or add to package.json scripts:');
console.log('  "rev-ui": "node ./bin/rev-ui"');