#!/usr/bin/env tsx
/**
 * Test search for admin dashboard components using the API
 */

import chalk from 'chalk';

async function testAdminDashboardSearch() {
  console.log(chalk.blue.bold('\n🔍 Testing Search for Admin Dashboard Components via API\n'));
  
  const baseUrl = 'http://localhost:3001';
  const query = 'admin dashboard';
  
  try {
    // Test 1: Keyword Search
    console.log(chalk.cyan('1. Keyword Search:'));
    console.log('─'.repeat(50));
    
    const keywordResponse = await fetch(`${baseUrl}/api/search/unified?${new URLSearchParams({
      q: query,
      type: 'components',
      mode: 'keyword',
      limit: '10',
    })}`);
    
    if (!keywordResponse.ok) {
      throw new Error(`Keyword search failed: ${keywordResponse.status}`);
    }
    
    const keywordData = await keywordResponse.json();
    console.log(`Found ${keywordData.totalResults} results in ${keywordData.processingTime}ms\n`);
    
    keywordData.results.slice(0, 5).forEach((result: any, idx: number) => {
      console.log(chalk.green(`${idx + 1}. ${result.title}`));
      console.log(chalk.gray(`   Type: ${result.type} | Framework: ${result.framework || 'N/A'}`));
      console.log(chalk.gray(`   Category: ${result.category || 'N/A'}`));
      console.log();
    });
    
    // Test 2: Semantic Search
    console.log(chalk.cyan('\n2. Semantic Search:'));
    console.log('─'.repeat(50));
    
    const semanticResponse = await fetch(`${baseUrl}/api/search/unified?${new URLSearchParams({
      q: query,
      type: 'resources',
      mode: 'semantic',
      limit: '10',
    })}`);
    
    if (!semanticResponse.ok) {
      throw new Error(`Semantic search failed: ${semanticResponse.status}`);
    }
    
    const semanticData = await semanticResponse.json();
    console.log(`Found ${semanticData.totalResults} results in ${semanticData.processingTime}ms\n`);
    
    semanticData.results.slice(0, 5).forEach((result: any, idx: number) => {
      console.log(chalk.green(`${idx + 1}. ${result.title}`));
      console.log(chalk.gray(`   Type: ${result.type} | Score: ${result.score.toFixed(3)}`));
      console.log();
    });
    
    // Test 3: Hybrid Search with filters
    console.log(chalk.cyan('\n3. Hybrid Search (with filters):'));
    console.log('─'.repeat(50));
    
    const hybridResponse = await fetch(`${baseUrl}/api/search/unified?${new URLSearchParams({
      q: query,
      type: 'all',
      mode: 'hybrid',
      category: 'Admin & Dashboard',
      limit: '20',
    })}`);
    
    if (!hybridResponse.ok) {
      throw new Error(`Hybrid search failed: ${hybridResponse.status}`);
    }
    
    const hybridData = await hybridResponse.json();
    console.log(`Found ${hybridData.totalResults} results in ${hybridData.processingTime}ms\n`);
    
    // Group by type
    const grouped: any = {};
    hybridData.results.forEach((result: any) => {
      if (!grouped[result.type]) grouped[result.type] = [];
      grouped[result.type].push(result);
    });
    
    Object.entries(grouped).forEach(([type, results]: [string, any[]]) => {
      console.log(chalk.yellow(`\n${type.toUpperCase()}S (${results.length}):`));
      results.slice(0, 5).forEach((result, idx) => {
        console.log(chalk.green(`  ${idx + 1}. ${result.title}`));
        if (result.tags && result.tags.length > 0) {
          console.log(chalk.gray(`     Tags: ${result.tags.slice(0, 3).join(', ')}`));
        }
      });
    });
    
    // Test 4: Search for specific admin components
    console.log(chalk.cyan('\n\n4. Specific Admin Component Search:'));
    console.log('─'.repeat(50));
    
    const adminQueries = [
      'admin panel',
      'dashboard template',
      'analytics dashboard',
      'user management',
      'admin table',
    ];
    
    for (const adminQuery of adminQueries) {
      const response = await fetch(`${baseUrl}/api/search/unified?${new URLSearchParams({
        q: adminQuery,
        type: 'components',
        mode: 'hybrid',
        limit: '3',
      })}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(chalk.yellow(`\n"${adminQuery}": ${data.totalResults} results`));
        data.results.forEach((result: any) => {
          console.log(chalk.gray(`  • ${result.title}`));
        });
      }
    }
    
    console.log(chalk.green.bold('\n\n✅ Search test completed successfully!\n'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error:'), error);
    console.log(chalk.yellow('\nNote: Make sure the Next.js server is running on http://localhost:3000'));
    console.log(chalk.yellow('Run: cd marketplace-nextjs && npm run dev'));
  }
}

// Run the test
testAdminDashboardSearch().catch(console.error);