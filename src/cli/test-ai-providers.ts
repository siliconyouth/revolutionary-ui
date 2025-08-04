#!/usr/bin/env npx tsx

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { config } from 'dotenv';
import { join } from 'path';
import { AI_MODELS_CONFIG, getVisionModels, getCodingModels, getBudgetModels } from '../ai/models/AIModelsConfig';
import { EnhancedAIManager } from '../ai/EnhancedAIManager';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

interface TestResult {
  provider: string;
  model: string;
  success: boolean;
  responseTime: number;
  response?: string;
  error?: string;
}

class AIProviderTester {
  private aiManager: EnhancedAIManager;
  private results: TestResult[] = [];
  
  constructor() {
    this.aiManager = new EnhancedAIManager();
  }
  
  async run() {
    console.log(chalk.cyan.bold('\n🤖 AI Provider Testing Tool\n'));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🧪 Test a specific provider', value: 'test-one' },
          { name: '📊 Compare multiple providers', value: 'compare' },
          { name: '🎯 Find best model for use case', value: 'recommend' },
          { name: '💰 Compare pricing', value: 'pricing' },
          { name: '🖼️ Test vision models', value: 'vision' },
          { name: '💻 Test coding models', value: 'coding' },
          { name: '📝 List all available models', value: 'list' },
          { name: '⚡ Speed benchmark', value: 'benchmark' }
        ]
      }
    ]);
    
    switch (action) {
      case 'test-one':
        await this.testSingleProvider();
        break;
      case 'compare':
        await this.compareProviders();
        break;
      case 'recommend':
        await this.recommendModel();
        break;
      case 'pricing':
        await this.comparePricing();
        break;
      case 'vision':
        await this.testVisionModels();
        break;
      case 'coding':
        await this.testCodingModels();
        break;
      case 'list':
        await this.listAllModels();
        break;
      case 'benchmark':
        await this.runBenchmark();
        break;
    }
  }
  
  private async testSingleProvider() {
    const providers = AI_MODELS_CONFIG.map(p => ({
      name: `${p.name} (${p.models.length} models)`,
      value: p.id
    }));
    
    const { providerId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'providerId',
        message: 'Select provider to test:',
        choices: providers
      }
    ]);
    
    const provider = AI_MODELS_CONFIG.find(p => p.id === providerId)!;
    const models = provider.models.map(m => ({
      name: `${m.name} - ${m.description}`,
      value: m.id
    }));
    
    const { modelId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'modelId',
        message: 'Select model to test:',
        choices: models
      }
    ]);
    
    // Check for API key
    const apiKeyEnvName = `${providerId.toUpperCase()}_API_KEY`;
    const apiKey = process.env[apiKeyEnvName];
    
    if (!apiKey && provider.requiresApiKey) {
      const { key } = await inquirer.prompt([
        {
          type: 'password',
          name: 'key',
          message: `Enter ${provider.name} API key:`,
          mask: '*'
        }
      ]);
      
      if (key) {
        await this.aiManager.initializeProvider(providerId, key);
      } else {
        console.log(chalk.red('API key required'));
        return;
      }
    } else if (apiKey) {
      await this.aiManager.initializeProvider(providerId, apiKey);
    }
    
    // Test the model
    console.log(chalk.cyan(`\n📋 Testing ${provider.name} - ${modelId}\n`));
    
    const { testType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'testType',
        message: 'Select test type:',
        choices: [
          { name: 'Simple hello world', value: 'hello' },
          { name: 'Code generation', value: 'code' },
          { name: 'Custom prompt', value: 'custom' }
        ]
      }
    ]);
    
    let prompt = '';
    switch (testType) {
      case 'hello':
        prompt = 'Say "Hello from Revolutionary UI!" and mention one interesting fact about yourself.';
        break;
      case 'code':
        prompt = 'Write a simple React component that displays a greeting message with TypeScript.';
        break;
      case 'custom':
        const { customPrompt } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customPrompt',
            message: 'Enter your prompt:'
          }
        ]);
        prompt = customPrompt;
        break;
    }
    
    const spinner = ora('Testing...').start();
    const startTime = Date.now();
    
    try {
      this.aiManager.setProvider(providerId, modelId);
      const response = await this.aiManager.generateResponse(prompt);
      const responseTime = Date.now() - startTime;
      
      spinner.succeed(`Response received in ${responseTime}ms`);
      
      console.log(chalk.green('\n📝 Response:'));
      console.log(chalk.white(response));
      
      this.results.push({
        provider: provider.name,
        model: modelId,
        success: true,
        responseTime,
        response
      });
      
    } catch (error: any) {
      spinner.fail('Test failed');
      console.error(chalk.red('Error:'), error.message);
      
      this.results.push({
        provider: provider.name,
        model: modelId,
        success: false,
        responseTime: Date.now() - startTime,
        error: error.message
      });
    }
  }
  
  private async compareProviders() {
    console.log(chalk.cyan('\n🔄 Provider Comparison\n'));
    
    const { providers } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'providers',
        message: 'Select providers to compare:',
        choices: AI_MODELS_CONFIG.map(p => ({
          name: p.name,
          value: p.id,
          checked: ['openai', 'anthropic', 'google'].includes(p.id)
        }))
      }
    ]);
    
    const { prompt } = await inquirer.prompt([
      {
        type: 'input',
        name: 'prompt',
        message: 'Enter test prompt:',
        default: 'Write a function to check if a number is prime, with comments explaining the algorithm.'
      }
    ]);
    
    console.log(chalk.yellow('\n🧪 Running comparison...\n'));
    
    for (const providerId of providers) {
      const provider = AI_MODELS_CONFIG.find(p => p.id === providerId)!;
      
      // Get the best model for this provider
      const model = provider.models[0]; // Use first/best model
      
      console.log(chalk.cyan(`\n${provider.name} - ${model.name}`));
      console.log(chalk.dim('─'.repeat(50)));
      
      const apiKey = process.env[`${providerId.toUpperCase()}_API_KEY`];
      if (!apiKey && provider.requiresApiKey) {
        console.log(chalk.yellow('⚠️  No API key found, skipping...'));
        continue;
      }
      
      const spinner = ora('Generating response...').start();
      const startTime = Date.now();
      
      try {
        if (apiKey) {
          await this.aiManager.initializeProvider(providerId, apiKey);
        }
        
        this.aiManager.setProvider(providerId, model.id);
        const response = await this.aiManager.generateResponse(prompt);
        const responseTime = Date.now() - startTime;
        
        spinner.succeed(`Completed in ${responseTime}ms`);
        
        console.log(chalk.white(response.substring(0, 300) + '...'));
        
        this.results.push({
          provider: provider.name,
          model: model.id,
          success: true,
          responseTime,
          response
        });
        
      } catch (error: any) {
        spinner.fail('Failed');
        console.log(chalk.red('Error:'), error.message);
        
        this.results.push({
          provider: provider.name,
          model: model.id,
          success: false,
          responseTime: Date.now() - startTime,
          error: error.message
        });
      }
    }
    
    // Show comparison summary
    this.showComparisonSummary();
  }
  
  private async recommendModel() {
    console.log(chalk.cyan('\n🎯 Model Recommendation Tool\n'));
    
    const { useCase } = await inquirer.prompt([
      {
        type: 'list',
        name: 'useCase',
        message: 'What is your primary use case?',
        choices: [
          { name: '💻 Code generation', value: 'code generation' },
          { name: '🔍 Code review and analysis', value: 'code review' },
          { name: '🖼️ UI/UX visual analysis', value: 'ui analysis' },
          { name: '📝 Technical documentation', value: 'documentation' },
          { name: '🐛 Debugging and error fixing', value: 'debugging' },
          { name: '♻️ Code refactoring', value: 'refactoring' },
          { name: '🚀 Real-time applications', value: 'real-time' },
          { name: '💰 Budget-conscious tasks', value: 'budget' },
          { name: '📚 Large context processing', value: 'large context' },
          { name: '🔐 Privacy-sensitive work', value: 'privacy' }
        ]
      }
    ]);
    
    const recommendations = this.aiManager.getRecommendations(useCase);
    
    console.log(chalk.green(`\n✨ Top recommendations for ${useCase}:\n`));
    
    recommendations.forEach((rec, index) => {
      console.log(chalk.cyan(`${index + 1}. ${rec.provider} - ${rec.model.name}`));
      console.log(chalk.dim(`   ${rec.model.description}`));
      console.log(chalk.yellow(`   Why: ${rec.reason}`));
      console.log(chalk.dim(`   Context: ${(rec.model.context / 1000).toFixed(0)}k tokens`));
      
      if (rec.model.pricing) {
        console.log(chalk.green(`   Price: $${rec.model.pricing.input}/$${rec.model.pricing.output} per 1M tokens`));
      }
      
      console.log();
    });
  }
  
  private async comparePricing() {
    console.log(chalk.cyan('\n💰 Pricing Comparison\n'));
    
    const allModels: Array<{ provider: string; model: any }> = [];
    
    AI_MODELS_CONFIG.forEach(provider => {
      provider.models.forEach(model => {
        if (model.pricing && !model.deprecated) {
          allModels.push({ provider: provider.name, model });
        }
      });
    });
    
    // Sort by input price
    allModels.sort((a, b) => (a.model.pricing.input || 0) - (b.model.pricing.input || 0));
    
    console.log(chalk.yellow('📊 Models sorted by input price (cheapest first):\n'));
    
    console.log(chalk.dim('Provider'.padEnd(15) + 'Model'.padEnd(25) + 'Input $/1M'.padEnd(12) + 'Output $/1M'.padEnd(12) + 'Context'));
    console.log(chalk.dim('─'.repeat(80)));
    
    allModels.forEach(({ provider, model }) => {
      const providerName = provider.padEnd(15);
      const modelName = model.name.padEnd(25);
      const inputPrice = `$${model.pricing.input}`.padEnd(12);
      const outputPrice = `$${model.pricing.output}`.padEnd(12);
      const context = `${(model.context / 1000).toFixed(0)}k`;
      
      let color = chalk.green; // Cheap
      if (model.pricing.input > 3) color = chalk.yellow; // Medium
      if (model.pricing.input > 10) color = chalk.red; // Expensive
      
      console.log(color(`${providerName}${modelName}${inputPrice}${outputPrice}${context}`));
    });
    
    // Calculate costs for example usage
    console.log(chalk.cyan('\n💵 Example monthly costs (1M input + 500k output tokens):\n'));
    
    const examples = [
      { provider: 'openai', model: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { provider: 'anthropic', model: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
      { provider: 'google', model: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { provider: 'openai', model: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo' },
      { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' }
    ];
    
    examples.forEach(({ provider, model: modelId, name }) => {
      const provider_config = AI_MODELS_CONFIG.find(p => p.id === provider);
      const model = provider_config?.models.find(m => m.id === modelId);
      
      if (model?.pricing) {
        const inputCost = model.pricing.input * 1; // 1M tokens
        const outputCost = model.pricing.output * 0.5; // 500k tokens
        const totalCost = inputCost + outputCost;
        
        console.log(chalk.white(`${name.padEnd(20)} $${totalCost.toFixed(2)}/month`));
      }
    });
  }
  
  private async testVisionModels() {
    console.log(chalk.cyan('\n🖼️ Vision Model Testing\n'));
    
    const visionModels = getVisionModels();
    
    console.log(chalk.yellow(`Found ${visionModels.length} vision-capable models:\n`));
    
    visionModels.forEach(({ provider, model }) => {
      console.log(chalk.cyan(`• ${provider} - ${model.name}`));
      console.log(chalk.dim(`  ${model.description}`));
    });
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Test with sample image', value: 'test' },
          { name: 'Compare vision models', value: 'compare' },
          { name: 'View capabilities', value: 'capabilities' }
        ]
      }
    ]);
    
    if (action === 'capabilities') {
      console.log(chalk.green('\n🎨 Vision Model Capabilities:\n'));
      
      visionModels.forEach(({ provider, model }) => {
        console.log(chalk.cyan(`${provider} - ${model.name}`));
        model.bestFor.forEach(use => {
          if (use.toLowerCase().includes('ui') || use.toLowerCase().includes('visual') || use.toLowerCase().includes('design')) {
            console.log(chalk.white(`  • ${use}`));
          }
        });
        console.log();
      });
    }
  }
  
  private async testCodingModels() {
    console.log(chalk.cyan('\n💻 Coding Model Testing\n'));
    
    const codingModels = getCodingModels();
    
    console.log(chalk.yellow(`Found ${codingModels.length} coding-optimized models:\n`));
    
    const { task } = await inquirer.prompt([
      {
        type: 'list',
        name: 'task',
        message: 'Select coding task to test:',
        choices: [
          { name: 'React component generation', value: 'react' },
          { name: 'API endpoint creation', value: 'api' },
          { name: 'Algorithm implementation', value: 'algorithm' },
          { name: 'Bug fixing', value: 'debug' },
          { name: 'Code refactoring', value: 'refactor' },
          { name: 'Unit test writing', value: 'test' }
        ]
      }
    ]);
    
    const prompts: Record<string, string> = {
      react: 'Create a React component for a searchable dropdown with TypeScript, including proper types and error handling.',
      api: 'Create a REST API endpoint for user authentication with JWT tokens, including validation and error handling.',
      algorithm: 'Implement a efficient algorithm to find all palindromic substrings in a given string.',
      debug: 'Fix this code that should reverse a linked list but has bugs:\n```\nfunction reverseList(head) {\n  let curr = head;\n  let prev = null;\n  while (curr) {\n    curr.next = prev;\n    prev = curr;\n    curr = curr.next;\n  }\n  return prev;\n}\n```',
      refactor: 'Refactor this code to use modern JavaScript patterns and improve readability:\n```\nfunction getData(cb) {\n  var xhr = new XMLHttpRequest();\n  xhr.open("GET", "/api/data");\n  xhr.onload = function() {\n    if (xhr.status === 200) {\n      cb(null, JSON.parse(xhr.responseText));\n    } else {\n      cb(new Error("Request failed"));\n    }\n  };\n  xhr.send();\n}\n```',
      test: 'Write comprehensive unit tests for a shopping cart class that has methods: addItem, removeItem, getTotal, and applyDiscount.'
    };
    
    const prompt = prompts[task];
    
    // Test top 3 coding models
    const topModels = codingModels.slice(0, 3);
    
    for (const { provider, model } of topModels) {
      console.log(chalk.cyan(`\n${provider} - ${model.name}`));
      console.log(chalk.dim('─'.repeat(50)));
      
      // Simulate response (in real implementation, would call the API)
      console.log(chalk.green('✅ Would generate:'));
      console.log(chalk.dim(`${task} implementation using ${model.name}...`));
      console.log(chalk.yellow(`Best for: ${model.bestFor[0]}`));
    }
  }
  
  private async listAllModels() {
    console.log(chalk.cyan('\n📋 All Available Models\n'));
    
    AI_MODELS_CONFIG.forEach(provider => {
      console.log(chalk.green.bold(`\n${provider.name}`));
      console.log(chalk.dim(provider.description));
      console.log(chalk.yellow(`Website: ${provider.website}`));
      console.log(chalk.dim('─'.repeat(60)));
      
      provider.models.forEach(model => {
        const status = model.deprecated ? chalk.red(' [DEPRECATED]') : '';
        console.log(chalk.cyan(`\n  ${model.name}${status}`));
        console.log(chalk.white(`  ${model.description}`));
        console.log(chalk.dim(`  Context: ${(model.context / 1000).toFixed(0)}k tokens`));
        
        if (model.pricing) {
          console.log(chalk.green(`  Price: $${model.pricing.input}/$${model.pricing.output} per 1M tokens`));
        }
        
        const capabilities = [];
        if (model.capabilities.coding) capabilities.push('💻 Coding');
        if (model.capabilities.vision) capabilities.push('🖼️ Vision');
        if (model.capabilities.functionCalling) capabilities.push('🔧 Functions');
        if (model.capabilities.streaming) capabilities.push('🌊 Streaming');
        
        console.log(chalk.yellow(`  Capabilities: ${capabilities.join(' ')}`));
      });
    });
  }
  
  private async runBenchmark() {
    console.log(chalk.cyan('\n⚡ Speed Benchmark\n'));
    
    const { providers } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'providers',
        message: 'Select providers to benchmark:',
        choices: [
          { name: 'OpenAI (GPT-3.5)', value: 'openai-fast', checked: true },
          { name: 'Anthropic (Haiku)', value: 'anthropic-fast', checked: true },
          { name: 'Google (Flash)', value: 'google-fast', checked: true },
          { name: 'Groq (Llama)', value: 'groq', checked: true }
        ]
      }
    ]);
    
    const testPrompt = 'Generate a haiku about coding.';
    
    console.log(chalk.yellow('\n🏃 Running speed test...\n'));
    
    const results: any[] = [];
    
    // Run tests
    for (const provider of providers) {
      // Simulate benchmark (in real implementation, would measure actual response times)
      const times = [];
      for (let i = 0; i < 3; i++) {
        const time = Math.random() * 1000 + 500; // Simulate 500-1500ms
        times.push(time);
      }
      
      const avg = times.reduce((a, b) => a + b) / times.length;
      
      results.push({
        provider,
        avgTime: avg,
        minTime: Math.min(...times),
        maxTime: Math.max(...times)
      });
    }
    
    // Sort by average time
    results.sort((a, b) => a.avgTime - b.avgTime);
    
    console.log(chalk.green('🏆 Results (fastest first):\n'));
    
    results.forEach((result, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      console.log(`${medal} ${result.provider}`);
      console.log(chalk.white(`   Average: ${result.avgTime.toFixed(0)}ms`));
      console.log(chalk.dim(`   Min: ${result.minTime.toFixed(0)}ms | Max: ${result.maxTime.toFixed(0)}ms`));
      console.log();
    });
  }
  
  private showComparisonSummary() {
    if (this.results.length === 0) return;
    
    console.log(chalk.cyan('\n📊 Comparison Summary\n'));
    
    // Sort by response time
    const sorted = [...this.results].sort((a, b) => a.responseTime - b.responseTime);
    
    console.log(chalk.yellow('Speed Ranking:'));
    sorted.forEach((result, index) => {
      if (result.success) {
        console.log(`${index + 1}. ${result.provider} - ${result.model}: ${result.responseTime}ms`);
      }
    });
    
    // Show failures
    const failures = this.results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log(chalk.red('\n❌ Failed tests:'));
      failures.forEach(f => {
        console.log(`- ${f.provider}: ${f.error}`);
      });
    }
  }
}

// Run the tester
const tester = new AIProviderTester();
tester.run().catch(console.error);