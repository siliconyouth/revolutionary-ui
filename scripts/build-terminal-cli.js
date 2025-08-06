#!/usr/bin/env node

/**
 * Build script for Terminal CLI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏭 Building Revolutionary UI Terminal CLI...\n');

// Clean dist directory
const distDir = path.join(__dirname, '../dist/terminal-cli');
if (fs.existsSync(distDir)) {
  console.log('🧹 Cleaning dist directory...');
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Build TypeScript
console.log('🔨 Compiling TypeScript...');
try {
  execSync('npx tsc --project src/terminal-cli/tsconfig.json', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ TypeScript compilation successful!\n');
} catch (error) {
  console.error('❌ TypeScript compilation failed');
  process.exit(1);
}

// Create executable
console.log('📦 Creating executable...');
const shebang = '#!/usr/bin/env node\n';
const indexPath = path.join(distDir, 'index.js');
const content = fs.readFileSync(indexPath, 'utf8');
fs.writeFileSync(indexPath, shebang + content);
fs.chmodSync(indexPath, 0o755);

// Create bin symlink
const binDir = path.join(__dirname, '../bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir);
}

const binPath = path.join(binDir, 'rui');
if (fs.existsSync(binPath)) {
  fs.unlinkSync(binPath);
}
fs.symlinkSync(indexPath, binPath);

console.log('✅ Build complete!');
console.log('\n📟 Run the Terminal CLI with:');
console.log('   ./bin/rui');
console.log('   or');
console.log('   node dist/terminal-cli/index.js\n');