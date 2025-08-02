#!/usr/bin/env node

/**
 * Simple test runner for Revolutionary UI Factory System
 * Executes all tests and reports results
 */

console.log('🏭 Revolutionary UI Factory System - Test Runner');
console.log('================================================\n');

// Simple test framework
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let currentDescribe = '';

global.describe = (name, fn) => {
  currentDescribe = name;
  console.log(`\n📋 ${name}`);
  fn();
};

global.test = (name, fn) => {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ ${name}`);
  } catch (error) {
    failedTests++;
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error.message}`);
  }
};

global.expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected} but got ${actual}`);
    }
  },
  toBeGreaterThan: (value) => {
    if (!(actual > value)) {
      throw new Error(`Expected ${actual} to be greater than ${value}`);
    }
  },
  toBeGreaterThanOrEqual: (value) => {
    if (!(actual >= value)) {
      throw new Error(`Expected ${actual} to be greater than or equal to ${value}`);
    }
  },
  toBeLessThanOrEqual: (value) => {
    if (!(actual <= value)) {
      throw new Error(`Expected ${actual} to be less than or equal to ${value}`);
    }
  },
  toContain: (value) => {
    if (!actual.includes(value)) {
      throw new Error(`Expected ${actual} to contain ${value}`);
    }
  }
});

// Run tests
try {
  require('./core.test.js');
} catch (error) {
  console.error('Failed to load tests:', error);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Test Summary:');
console.log(`   Total Tests: ${totalTests}`);
console.log(`   ✅ Passed: ${passedTests}`);
console.log(`   ❌ Failed: ${failedTests}`);
console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log('='.repeat(50));

if (failedTests === 0) {
  console.log('\n🎉 All tests passed! The Revolutionary UI Factory System is working correctly!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please fix the issues before publishing.');
  process.exit(1);
}