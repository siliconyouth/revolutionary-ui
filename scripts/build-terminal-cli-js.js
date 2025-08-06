#!/usr/bin/env node

/**
 * Build script for Terminal CLI (JavaScript version)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏭 Building Revolutionary UI Terminal CLI (JS mode)...\n');

// Clean dist directory
const distDir = path.join(__dirname, '../dist/terminal-cli');
if (fs.existsSync(distDir)) {
  console.log('🧹 Cleaning dist directory...');
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy source files and transform JSX
console.log('📋 Copying and transforming files...');
const srcDir = path.join(__dirname, '../src/terminal-cli');

// Use babel to transform JSX
try {
  execSync(`npx babel ${srcDir} --out-dir ${distDir} --presets=@babel/preset-react --extensions=".tsx,.ts,.jsx,.js"`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
} catch (error) {
  console.log('Babel not available, copying files directly...');
  // Fallback: copy files directly
  copyRecursive(srcDir, distDir);
}

// Create executable
console.log('📦 Creating executable...');
const indexPath = path.join(distDir, 'index.js');
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf8');
  fs.writeFileSync(indexPath, '#!/usr/bin/env node\n' + content);
  fs.chmodSync(indexPath, 0o755);
}

// Create bin symlink
const binDir = path.join(__dirname, '../bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir);
}

const binPath = path.join(binDir, 'rui');
if (fs.existsSync(binPath)) {
  fs.unlinkSync(binPath);
}
if (fs.existsSync(indexPath)) {
  fs.symlinkSync(indexPath, binPath);
}

console.log('✅ Build complete!');
console.log('\n📟 Run the Terminal CLI with:');
console.log('   ./bin/rui');
console.log('   or');
console.log('   node dist/terminal-cli/index.js\n');

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name.replace(/\.tsx?$/, '.js'));
    
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      // Simple transform: remove TypeScript syntax
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Remove type imports
      content = content.replace(/import type .* from .*;?\n/g, '');
      content = content.replace(/export type .*;\n/g, '');
      
      // Remove type annotations
      content = content.replace(/: \w+(\[\])?/g, '');
      content = content.replace(/<\w+>/g, '');
      content = content.replace(/as \w+/g, '');
      
      // Remove interface/type declarations
      content = content.replace(/interface \w+ \{[\s\S]*?\}\n/g, '');
      content = content.replace(/type \w+ = [\s\S]*?;\n/g, '');
      
      // Fix imports
      content = content.replace(/from '(.*)\.js'/g, "from '$1'");
      content = content.replace(/from '(.*)'/g, (match, p1) => {
        if (p1.startsWith('.') && !p1.endsWith('.js')) {
          return `from '${p1}.js'`;
        }
        return match;
      });
      
      fs.writeFileSync(destPath, content);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}