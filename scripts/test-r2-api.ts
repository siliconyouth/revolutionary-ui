#!/usr/bin/env tsx

import chalk from 'chalk';
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api';

async function testEndpoint(name: string, url: string, options?: any) {
  try {
    console.log(chalk.yellow(`\nTesting ${name}...`));
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log(chalk.green(`✓ ${name} - Status: ${response.status}`));
      console.log(chalk.dim(JSON.stringify(data, null, 2).substring(0, 200) + '...'));
      return { success: true, data };
    } else {
      console.log(chalk.red(`✗ ${name} - Status: ${response.status}`));
      console.log(chalk.red(`Error: ${JSON.stringify(data)}`));
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(chalk.red(`✗ ${name} - Network Error`));
    console.log(chalk.red(`Error: ${error.message}`));
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log(chalk.blue('\n🚀 Testing R2 API Endpoints\n'));

  // Test 1: List resources
  const listResult = await testEndpoint(
    'List Resources',
    `${API_BASE}/resources?limit=5`
  );

  if (listResult.success && listResult.data.resources?.length > 0) {
    const firstResourceId = listResult.data.resources[0].id;
    
    // Test 2: Get specific resource
    await testEndpoint(
      'Get Resource with Code',
      `${API_BASE}/resources/${firstResourceId}`
    );

    // Test 3: Get download URLs
    const downloadResult = await testEndpoint(
      'Get Download URLs',
      `${API_BASE}/resources/${firstResourceId}/download`
    );

    if (downloadResult.success) {
      // Test 4: Verify R2 URL is accessible
      if (downloadResult.data.download?.codeUrl) {
        console.log(chalk.yellow('\nTesting direct R2 access...'));
        try {
          const r2Response = await fetch(downloadResult.data.download.codeUrl, {
            method: 'HEAD'
          });
          if (r2Response.ok) {
            console.log(chalk.green('✓ Direct R2 URL is accessible'));
          } else {
            console.log(chalk.red(`✗ R2 URL returned status: ${r2Response.status}`));
          }
        } catch (error) {
          console.log(chalk.red('✗ Could not access R2 URL directly'));
        }
      }
    }

    // Test 5: Create a test resource (optional)
    if (process.argv.includes('--write')) {
      await testEndpoint(
        'Create Test Resource',
        `${API_BASE}/resources`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test Component',
            slug: 'test-component-' + Date.now(),
            description: 'Test component for R2 integration',
            categoryId: 'cmdwcd8hs0001u2zepqc0s5pt', // Replace with actual category ID
            resourceTypeId: 'cmdwcd8ht0002u2ze5g4p91g6', // Replace with actual type ID
            authorId: 'test-author',
            sourceCode: `export const TestComponent = () => <div>Test</div>;`,
            documentation: '# Test Component\nThis is a test.',
            frameworks: ['React']
          })
        }
      );
    }
  }

  console.log(chalk.blue('\n✅ API Tests Complete\n'));
}

main().catch(console.error);