/**
 * AI Assistant - Provides AI-powered assistance throughout the CLI
 */

import chalk from 'chalk';
import ora from 'ora';
import { Anthropic } from '@anthropic-ai/sdk';
import { ConfigManager } from './config-manager';
import { ClaudeSessionClient } from './claude-session-client';

interface AIResponse {
  content: string;
  recommendations?: string[];
  defaultValue?: any;
  explanation?: string;
}

export class AIAssistant {
  private anthropic: Anthropic | null = null;
  private sessionClient: ClaudeSessionClient | null = null;
  private configManager: ConfigManager;
  private isAuthenticated: boolean = false;
  private authMethod: 'session' | 'apikey' | 'none' = 'none';

  constructor() {
    this.configManager = new ConfigManager();
    this.initializeClient();
  }

  private async initializeClient() {
    // Check for session authentication first
    const authMethod = await this.configManager.get('ai.authMethod');
    
    if (authMethod === 'session') {
      this.sessionClient = new ClaudeSessionClient();
      const isSessionAuth = await this.sessionClient.isAuthenticated();
      if (isSessionAuth) {
        this.authMethod = 'session';
        this.isAuthenticated = true;
        return;
      }
    }
    
    // Fall back to API key
    const apiKey = process.env.ANTHROPIC_API_KEY || await this.configManager.get('ai.apiKey');
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey });
      this.authMethod = 'apikey';
      this.isAuthenticated = true;
    }
  }

  /**
   * Ensure AI is authenticated before any operation
   */
  async ensureAuthenticated(): Promise<boolean> {
    // Re-check in case env var was set after initialization
    if (!this.isAuthenticated) {
      await this.initializeClient();
    }
    
    return this.isAuthenticated;
  }

  /**
   * Prompt user to authenticate if not already
   */
  async requireAuthentication(): Promise<void> {
    const isAuth = await this.ensureAuthenticated();
    if (!isAuth) {
      console.log(chalk.cyan('🔐 Let\'s set up AI authentication first\n'));
      console.log(chalk.gray('You have three options:'));
      console.log(chalk.gray('1. Browser Session - No API limits, uses your Claude subscription'));
      console.log(chalk.gray('2. Claude Code - Official CLI integration'));
      console.log(chalk.gray('3. API Key - Traditional method, subject to rate limits\n'));
      
      throw new Error('Please run "revolutionary-ui ai-auth" to authenticate');
    }
  }

  /**
   * Get AI recommendation for a specific question
   */
  async getRecommendation(context: {
    phase: string;
    question: string;
    projectInfo?: any;
    userHistory?: any;
    currentChoices?: string[];
  }): Promise<AIResponse> {
    await this.requireAuthentication();

    const prompt = `You are an expert UI developer assistant helping with the Revolutionary UI CLI.

Context:
- Phase: ${context.phase}
- Question: ${context.question}
${context.projectInfo ? `- Project: ${JSON.stringify(context.projectInfo, null, 2)}` : ''}
${context.currentChoices ? `- Available choices: ${context.currentChoices.join(', ')}` : ''}

Provide a helpful recommendation for this question. Include:
1. A brief explanation of what this choice means
2. The recommended option based on best practices
3. Why this recommendation makes sense for their context

Format your response as JSON:
{
  "explanation": "Brief explanation of what this choice affects",
  "recommendation": "The recommended choice",
  "reasoning": "Why this is recommended",
  "defaultValue": "The default value to use"
}`;

    try {
      const response = await this.makeAIRequest({
        prompt,
        max_tokens: 1000,
        temperature: 0.3
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';

      // Parse JSON response
      try {
        const parsed = JSON.parse(content);
        return {
          content: content,
          explanation: parsed.explanation,
          recommendations: [parsed.recommendation],
          defaultValue: parsed.defaultValue || parsed.recommendation
        };
      } catch {
        // Fallback if not valid JSON
        return {
          content: content,
          explanation: content
        };
      }
    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('authentication')) {
        console.log(chalk.yellow('\n⚠️  AI features require authentication'));
        console.log(chalk.gray('Run "revolutionary-ui ai-auth" to set up AI access'));
      }
      return {
        content: 'Unable to get AI recommendation',
        explanation: 'Please proceed with your best judgment'
      };
    }
  }

  /**
   * Analyze project using AI
   */
  async analyzeProject(projectPath: string): Promise<{
    summary: string;
    framework: string;
    recommendations: string[];
    suggestedComponents: string[];
    improvements: string[];
  }> {
    await this.requireAuthentication();

    const spinner = ora('Analyzing project with AI...').start();

    try {
      // First, gather project information
      const projectInfo = await this.gatherProjectInfo(projectPath);

      const prompt = `Analyze this project and provide insights for UI component generation:

Project Information:
${JSON.stringify(projectInfo, null, 2)}

Provide a comprehensive analysis including:
1. Project summary and main purpose
2. Detected framework and tech stack
3. Recommended Revolutionary UI components to implement
4. Suggested improvements for better code organization
5. Opportunities for code reduction using factory patterns

Format as JSON:
{
  "summary": "Brief project summary",
  "framework": "Primary framework",
  "techStack": ["tech1", "tech2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "suggestedComponents": ["component1", "component2"],
  "improvements": ["improvement1", "improvement2"],
  "codeReductionOpportunities": ["opportunity1", "opportunity2"]
}`;

      const response = await this.makeAIRequest({
        prompt,
        max_tokens: 2000,
        temperature: 0.5
      });

      spinner.succeed('Project analysis complete');

      const content = response.content[0].type === 'text' ? response.content[0].text : '';

      // Parse response
      try {
        const analysis = JSON.parse(content);
        return {
          summary: analysis.summary,
          framework: analysis.framework,
          recommendations: analysis.recommendations || [],
          suggestedComponents: analysis.suggestedComponents || [],
          improvements: analysis.improvements || []
        };
      } catch {
        return {
          summary: content,
          framework: 'react',
          recommendations: [],
          suggestedComponents: [],
          improvements: []
        };
      }
    } catch (error) {
      spinner.fail('Project analysis failed');
      throw error;
    }
  }

  /**
   * Get AI explanation for a CLI option
   */
  async explainOption(option: string, context: string): Promise<string> {
    await this.requireAuthentication();

    const prompt = `Explain this Revolutionary UI CLI option in simple terms:
Option: ${option}
Context: ${context}

Provide a brief, user-friendly explanation of what this option does and when to use it.`;

    try {
      const response = await this.makeAIRequest({
        prompt,
        max_tokens: 500,
        temperature: 0.3
      });

      return response.content[0].type === 'text' ? response.content[0].text : 'This option helps configure your project settings.';
    } catch (error) {
      return 'This option helps configure your project settings.';
    }
  }

  /**
   * Get setup recommendations based on project
   */
  async getSetupRecommendations(projectInfo: any): Promise<{
    framework: string;
    styling: string;
    typescript: boolean;
    testing: string;
    features: string[];
    explanation: string;
  }> {
    await this.requireAuthentication();

    const prompt = `Based on this project information, recommend the best Revolutionary UI setup:

Project Info:
${JSON.stringify(projectInfo, null, 2)}

Consider:
1. Existing tech stack compatibility
2. Best practices for the project type
3. Maximum code reduction potential
4. Developer experience

Provide recommendations as JSON:
{
  "framework": "recommended framework",
  "styling": "recommended styling approach",
  "typescript": true/false,
  "testing": "recommended testing framework",
  "features": ["feature1", "feature2"],
  "explanation": "Why these recommendations make sense"
}`;

    try {
      const response = await this.makeAIRequest({
        prompt,
        max_tokens: 1000,
        temperature: 0.4
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const recommendations = JSON.parse(content);
      return recommendations;
    } catch (error) {
      // Fallback recommendations
      return {
        framework: 'react',
        styling: 'tailwind',
        typescript: true,
        testing: 'vitest',
        features: ['ai-generation', 'component-catalog'],
        explanation: 'These are recommended defaults for modern web development.'
      };
    }
  }

  /**
   * Generate smart defaults for component generation
   */
  async getComponentDefaults(prompt: string): Promise<{
    name: string;
    framework: string;
    category: string;
    features: string[];
    styling: string;
  }> {
    await this.requireAuthentication();

    const aiPrompt = `Based on this component description, suggest smart defaults:

Description: "${prompt}"

Analyze and provide:
1. A good component name (PascalCase)
2. Most suitable framework
3. Component category
4. Required features
5. Best styling approach

Format as JSON:
{
  "name": "ComponentName",
  "framework": "framework",
  "category": "category",
  "features": ["feature1", "feature2"],
  "styling": "styling approach",
  "reasoning": "Brief explanation"
}`;

    try {
      const response = await this.makeAIRequest({
        prompt: aiPrompt,
        max_tokens: 800,
        temperature: 0.3
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const defaults = JSON.parse(content);
      return {
        name: defaults.name,
        framework: defaults.framework,
        category: defaults.category,
        features: defaults.features,
        styling: defaults.styling
      };
    } catch {
      return {
        name: 'MyComponent',
        framework: 'react',
        category: 'general',
        features: [],
        styling: 'tailwind'
      };
    }
  }

  /**
   * Validate user input with AI assistance
   */
  async validateInput(input: string, type: string): Promise<{
    isValid: boolean;
    suggestion?: string;
    explanation?: string;
  }> {
    const prompt = `Validate this user input for Revolutionary UI:
Input: "${input}"
Type: ${type}

Check if it's valid and provide suggestions if needed.

Format as JSON:
{
  "isValid": true/false,
  "suggestion": "improved version if needed",
  "explanation": "why it's invalid or how to improve"
}`;

    try {
      const response = await this.makeAIRequest({
        prompt,
        max_tokens: 500,
        temperature: 0.2
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      return JSON.parse(content);
    } catch {
      return { isValid: true };
    }
  }

  /**
   * Get contextual help for any CLI phase
   */
  async getContextualHelp(phase: string, previousChoices?: any): Promise<string> {
    const prompt = `Provide helpful context for this Revolutionary UI CLI phase:
Phase: ${phase}
${previousChoices ? `Previous choices: ${JSON.stringify(previousChoices)}` : ''}

Give a brief, encouraging explanation of what happens in this phase and any tips.`;

    try {
      const response = await this.makeAIRequest({
        prompt,
        max_tokens: 500,
        temperature: 0.5
      });

      return response.content[0].type === 'text' ? response.content[0].text : 'Let\'s continue setting up your project!';
    } catch {
      return `Let's continue setting up your project!`;
    }
  }

  // Private helper methods

  private async gatherProjectInfo(projectPath: string): Promise<any> {
    const fs = require('fs').promises;
    const path = require('path');
    
    const info: any = {
      path: projectPath,
      files: [],
      packageJson: null,
      framework: null,
      hasTypeScript: false,
      hasTailwind: false
    };

    try {
      // Read package.json
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      info.packageJson = {
        name: packageJson.name,
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {})
      };

      // Detect framework
      const deps = [...info.packageJson.dependencies, ...info.packageJson.devDependencies];
      if (deps.includes('react')) info.framework = 'react';
      else if (deps.includes('vue')) info.framework = 'vue';
      else if (deps.includes('@angular/core')) info.framework = 'angular';
      else if (deps.includes('svelte')) info.framework = 'svelte';

      // Detect TypeScript
      info.hasTypeScript = deps.includes('typescript');

      // Detect Tailwind
      info.hasTailwind = deps.includes('tailwindcss');

      // List some key files
      const files = await fs.readdir(projectPath);
      info.files = files.filter(f => !f.startsWith('.') && f !== 'node_modules').slice(0, 20);

    } catch (error) {
      // Basic info if can't read project
      info.error = 'Could not read project details';
    }

    return info;
  }

  /**
   * Get current auth status
   */
  async getAuthStatus(): Promise<{
    isAuthenticated: boolean;
    method: 'session' | 'apikey' | 'none';
  }> {
    await this.ensureAuthenticated();
    
    return { 
      isAuthenticated: this.isAuthenticated, 
      method: this.authMethod 
    };
  }

  /**
   * Helper method to make AI requests using either session or API key
   */
  private async makeAIRequest(params: {
    prompt: string;
    model?: string;
    max_tokens?: number;
    temperature?: number;
    system?: string;
  }): Promise<any> {
    if (this.authMethod === 'session' && this.sessionClient) {
      return await this.sessionClient.createMessage({
        messages: [{
          role: 'user',
          content: params.prompt
        }],
        model: params.model || 'claude-3-5-sonnet-20241022',
        max_tokens: params.max_tokens || 1000,
        temperature: params.temperature || 0.3,
        system: params.system
      });
    } else if (this.anthropic) {
      return await this.anthropic.messages.create({
        messages: [{
          role: 'user',
          content: params.prompt
        }],
        model: params.model || 'claude-3-5-sonnet-20241022',
        max_tokens: params.max_tokens || 1000,
        temperature: params.temperature || 0.3,
      });
    } else {
      throw new Error('AI not initialized');
    }
  }
}