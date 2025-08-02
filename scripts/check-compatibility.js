#!/usr/bin/env node

/**
 * Revolutionary UI - Compatibility Checker
 * Detects framework versions and provides recommendations
 */

const fs = require('fs');
const path = require('path');

console.log('🏭 Revolutionary UI Factory - Compatibility Check');
console.log('================================================\n');

// Check if we're in a project with package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log('ℹ️  No package.json found. Skipping compatibility check.');
  process.exit(0);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

let warnings = [];
let recommendations = [];

// Check React version
if (deps.react) {
  const reactVersion = deps.react.match(/(\d+)/);
  if (reactVersion && parseInt(reactVersion[1]) >= 19) {
    warnings.push('React 19 detected');
    recommendations.push('• Use npm install --legacy-peer-deps for package installations');
    recommendations.push('• Revolutionary UI Factory fully supports React 19 concurrent features');
  }
}

// Check Tailwind CSS version
if (deps.tailwindcss) {
  const tailwindVersion = deps.tailwindcss.match(/(\d+)/);
  if (tailwindVersion && parseInt(tailwindVersion[1]) >= 4) {
    warnings.push('Tailwind CSS v4 detected');
    recommendations.push('• @apply directives are not supported in v4 - use direct utility classes');
    recommendations.push('• Use @import "tailwindcss" instead of @tailwind directives');
    recommendations.push('• Install @tailwindcss/postcss for PostCSS configuration');
  }
}

// Check Next.js version
if (deps.next) {
  const nextVersion = deps.next.match(/(\d+)/);
  if (nextVersion && parseInt(nextVersion[1]) >= 15) {
    warnings.push('Next.js 15 detected');
    recommendations.push('• Add --turbopack flag to dev script for 10x faster builds');
    recommendations.push('• Revolutionary UI Factory optimized for Next.js 15 App Router');
  }
}

// Check TypeScript version
if (deps.typescript) {
  const tsVersion = deps.typescript.match(/(\d+\.\d+)/);
  if (tsVersion && parseFloat(tsVersion[1]) >= 5.7) {
    recommendations.push('• TypeScript 5.7+ detected - all advanced features supported');
  }
}

// Display results
if (warnings.length > 0) {
  console.log('⚠️  Compatibility Warnings:');
  warnings.forEach(w => console.log(`   ${w}`));
  console.log('');
}

if (recommendations.length > 0) {
  console.log('📋 Recommendations:');
  recommendations.forEach(r => console.log(`   ${r}`));
  console.log('');
}

// Check for PostCSS config with Tailwind v4
if (deps.tailwindcss && deps.tailwindcss.includes('4')) {
  const postcssPath = path.join(process.cwd(), 'postcss.config.js');
  if (fs.existsSync(postcssPath)) {
    const postcssContent = fs.readFileSync(postcssPath, 'utf8');
    if (!postcssContent.includes('@tailwindcss/postcss')) {
      console.log('🔧 Action Required:');
      console.log('   Update your postcss.config.js to use @tailwindcss/postcss');
      console.log('   npm install -D @tailwindcss/postcss');
      console.log('');
    }
  }
}

console.log('✅ Revolutionary UI Factory is compatible with your project!');
console.log('');
console.log('🚀 Quick Start:');
console.log('   import { setup } from "@vladimirdukelic/revolutionary-ui/v2"');
console.log('   const ui = setup(); // Auto-detects your framework');
console.log('');
console.log('📚 Documentation: https://revolutionary-ui.com');
console.log('🐛 Issues: https://github.com/siliconyouth/revolutionary-ui/issues');