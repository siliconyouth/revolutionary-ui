#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create dist directory
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copy simple files
const filesToCopy = [
  { src: 'src/index-simple.ts', dest: 'dist/index.js' },
  { src: 'src/version.ts', dest: 'dist/version.js' }
];

// Simple TypeScript to JavaScript conversion (remove types)
filesToCopy.forEach(({ src, dest }) => {
  const srcPath = path.join(__dirname, '..', src);
  const destPath = path.join(__dirname, '..', dest);
  
  if (fs.existsSync(srcPath)) {
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // Remove TypeScript type annotations (simple approach)
    content = content.replace(/: any/g, '');
    content = content.replace(/: \{ framework: string \}/g, '');
    content = content.replace(/export \* from '\.\/types\/base';/g, '');
    
    // Convert import/export to CommonJS
    content = content.replace(/export function/g, 'exports.');
    content = content.replace(/export const/g, 'exports.');
    content = content.replace(/export \{/g, 'module.exports = {');
    
    fs.writeFileSync(destPath, content);
    console.log(`✅ Created ${dest}`);
  }
});

// Create index.d.ts
const dtsContent = `export declare function setup(config: { framework: string }): {
  createNavbar: (options: any) => any;
  createForm: (options: any) => any;
  createTable: (options: any) => any;
};

export declare const version: string;
`;

fs.writeFileSync(path.join(distDir, 'index.d.ts'), dtsContent);
console.log('✅ Created dist/index.d.ts');

// Copy package.json info
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// Create a minimal package.json in dist
const distPkg = {
  name: pkg.name,
  version: pkg.version,
  main: 'index.js',
  types: 'index.d.ts',
  description: pkg.description,
  author: pkg.author,
  license: pkg.license
};

fs.writeFileSync(
  path.join(distDir, 'package.json'),
  JSON.stringify(distPkg, null, 2)
);

console.log('✅ Simple build completed!');