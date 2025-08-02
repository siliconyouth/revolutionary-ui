/**
 * Build script for Revolutionary UI Factory CLI
 * Resolves path aliases and prepares for npm publication
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏭 Building Revolutionary UI Factory CLI...\n');

// Step 1: Clean dist directory
console.log('📦 Cleaning dist directory...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Step 2: Copy source files to a temp directory with resolved paths
console.log('📋 Preparing source files...');
const tempDir = '.temp-build';
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

// Copy necessary directories
const dirs = ['src/lib/factory', 'src/bin', 'src/config'];
dirs.forEach(dir => {
  const targetDir = path.join(tempDir, dir);
  fs.mkdirSync(targetDir, { recursive: true });
  copyDir(dir, targetDir);
});

// Step 3: Replace path aliases in all TypeScript files
console.log('🔧 Resolving path aliases...');
replacePathAliases(tempDir);

// Step 4: Build with TypeScript
console.log('🔨 Building with TypeScript...');
execSync('npx tsc --project tsconfig.cli.build.json', { stdio: 'inherit' });

// Step 5: Copy package files
console.log('📄 Copying package files...');
if (fs.existsSync('README.npm.md')) {
  fs.copyFileSync('README.npm.md', 'dist/README.md');
} else {
  fs.copyFileSync('README.md', 'dist/README.md');
}

// Create a simple LICENSE file
fs.writeFileSync('dist/LICENSE', `MIT License

Copyright (c) 2025 Revolutionary UI Factory

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`);

// Step 6: Clean up
console.log('🧹 Cleaning up...');
fs.rmSync(tempDir, { recursive: true, force: true });

console.log('\n✅ Build complete! Package ready at ./dist/\n');
console.log('📦 To publish: cd dist && npm publish\n');

// Helper functions
function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function replacePathAliases(dir) {
  const files = getAllFiles(dir, '.ts');
  
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace @/config/* imports
    content = content.replace(/@\/config\//g, '../../config/');
    
    // Replace @/lib/* imports
    content = content.replace(/@\/lib\//g, '../../lib/');
    
    // Replace @/* imports
    content = content.replace(/@\//g, '../../');
    
    fs.writeFileSync(file, content);
  });
}

function getAllFiles(dir, ext) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, ext));
    } else if (entry.name.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  
  return files;
}