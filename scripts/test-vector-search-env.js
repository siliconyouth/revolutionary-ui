#!/usr/bin/env node

/**
 * Test script to verify Upstash Vector environment setup
 */

const { ENV_COMPLETE_DEFINITIONS } = require('./env-definitions-complete');

console.log('🔍 Testing Upstash Vector Environment Setup\n');

// Check if vector-search category exists
if (!ENV_COMPLETE_DEFINITIONS['vector-search']) {
  console.error('❌ Vector search category not found in environment definitions!');
  process.exit(1);
}

const vectorSearchDef = ENV_COMPLETE_DEFINITIONS['vector-search'];
console.log('✅ Vector search category found');
console.log(`   Title: ${vectorSearchDef.title}`);
console.log(`   Description: ${vectorSearchDef.description}\n`);

// Check required variables
const vectorVars = Object.entries(vectorSearchDef.vars);
console.log(`📋 Vector search variables (${vectorVars.length} total):\n`);

vectorVars.forEach(([key, def]) => {
  console.log(`   ${key}:`);
  console.log(`     - Description: ${def.description}`);
  console.log(`     - Required: ${def.required ? 'Yes' : 'No'}`);
  console.log(`     - Example: ${def.example || 'N/A'}`);
  if (def.setupUrl) {
    console.log(`     - Setup URL: ${def.setupUrl}`);
  }
  console.log();
});

// Check for specific Upstash variables
const upstashVars = ['UPSTASH_VECTOR_REST_URL', 'UPSTASH_VECTOR_REST_TOKEN'];
const foundUpstashVars = upstashVars.filter(varName => varName in vectorSearchDef.vars);

if (foundUpstashVars.length === upstashVars.length) {
  console.log('✅ All Upstash Vector variables are defined');
} else {
  const missing = upstashVars.filter(v => !foundUpstashVars.includes(v));
  console.error(`❌ Missing Upstash variables: ${missing.join(', ')}`);
}

// Check if variables have proper setup instructions
const varsWithSetup = vectorVars.filter(([_, def]) => def.setupSteps && def.setupSteps.length > 0);
console.log(`\n📚 Variables with setup instructions: ${varsWithSetup.length}/${vectorVars.length}`);

// Check documentation links
const varsWithDocs = vectorVars.filter(([_, def]) => def.docs);
console.log(`📖 Variables with documentation links: ${varsWithDocs.length}/${vectorVars.length}`);

// Verify category ordering
const allCategories = Object.keys(ENV_COMPLETE_DEFINITIONS);
const vectorIndex = allCategories.indexOf('vector-search');
const aiIndex = allCategories.indexOf('ai-providers');
const r2Index = allCategories.indexOf('r2-storage');

console.log('\n📍 Category positioning:');
console.log(`   AI Providers: position ${aiIndex + 1}`);
console.log(`   Vector Search: position ${vectorIndex + 1}`);
console.log(`   R2 Storage: position ${r2Index + 1}`);

if (vectorIndex > aiIndex && vectorIndex < r2Index) {
  console.log('   ✅ Vector search is correctly positioned between AI and R2');
} else {
  console.log('   ⚠️  Vector search position might need adjustment');
}

console.log('\n✨ Environment setup test complete!');