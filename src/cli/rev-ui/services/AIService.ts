import { ClaudeSessionClient } from '../../utils/claude-session-client.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

interface AIConfig {
  provider: 'claude-session' | 'api-key' | 'none';
  sessionKey?: string;
  apiKey?: string;
}

class AIServiceClass {
  private client: ClaudeSessionClient | null = null;
  private initialized = false;
  private config: AIConfig = { provider: 'none' };

  async initialize(): Promise<boolean> {
    try {
      // Check for existing auth
      const configPath = path.join(os.homedir(), '.revolutionary-ui', 'claude-session.json');
      const configData = await fs.readFile(configPath, 'utf-8');
      const savedConfig = JSON.parse(configData);

      if (savedConfig.sessionKey) {
        this.config = { provider: 'claude-session', sessionKey: savedConfig.sessionKey };
        this.client = new ClaudeSessionClient(savedConfig.sessionKey);
        // Test the connection
        await this.client.sendMessage('test', { model: 'claude-3-5-sonnet-20241022' });
        this.initialized = true;
        return true;
      }
    } catch (error) {
      console.error('AI initialization failed:', error);
    }

    // Check for API key
    if (process.env.ANTHROPIC_API_KEY) {
      this.config = { provider: 'api-key', apiKey: process.env.ANTHROPIC_API_KEY };
      this.initialized = true;
      return true;
    }

    return false;
  }

  async getWelcomeMessage(): Promise<string> {
    if (!this.initialized) {
      return 'Welcome to Revolutionary UI! I\'m your AI assistant. To unlock my full capabilities, authenticate with Claude AI using the Settings menu.';
    }

    try {
      const response = await this.sendMessage(
        'Generate a brief, friendly welcome message for Revolutionary UI v3.4.1. Mention that you can help with component generation, project setup, and answering questions. Keep it under 2 sentences.'
      );
      return response;
    } catch {
      return 'Welcome to Revolutionary UI v3.4.1! I\'m here to help you generate components, set up projects, and answer any questions you have about the framework.';
    }
  }

  async getContextualHelp(screen: string): Promise<string> {
    const contextMap: Record<string, string> = {
      setup: 'I\'ll help you create the perfect project setup. Based on current trends, React with TypeScript and Tailwind CSS is a popular choice for modern applications.',
      generate: 'Ready to generate components! Describe what you need, and I\'ll use the factory pattern to create optimized, accessible components with 60-95% less code.',
      browse: 'Explore our catalog of 10,000+ components. Use natural language to search, or browse by category. Each component shows framework compatibility and quality metrics.',
      settings: 'Configure your preferences here. I recommend setting up Claude AI authentication for the best experience and unlimited AI assistance.',
      analytics: 'Track your productivity gains! Most users see 70-90% reduction in development time. Check your code reduction metrics and component usage patterns.'
    };

    if (!this.initialized) {
      return contextMap[screen] || 'Select an option to continue. For AI-powered assistance, configure authentication in Settings.';
    }

    try {
      const response = await this.sendMessage(
        `Generate a helpful 1-2 sentence tip for the "${screen}" screen in Revolutionary UI. ${contextMap[screen]}`
      );
      return response;
    } catch {
      return contextMap[screen] || 'How can I help you today?';
    }
  }

  async getProjectRecommendation(): Promise<string> {
    if (!this.initialized) {
      return 'For a modern web application, I recommend React with TypeScript, Tailwind CSS, and Vite. This combination offers excellent developer experience and performance.';
    }

    try {
      const response = await this.sendMessage(
        'Recommend a project setup for a modern web application in 2025. Consider current best practices. Keep it to 2 sentences.'
      );
      return response;
    } catch {
      return 'For 2025, I recommend React 19 with TypeScript 5.7, Tailwind CSS v4, and Vite 7. This stack provides excellent DX, performance, and type safety.';
    }
  }

  async getFrameworkRecommendation(config: any): Promise<string> {
    const projectName = config.name;
    
    if (!this.initialized) {
      return `For "${projectName}", React is a solid choice with its mature ecosystem. Vue or Svelte are great alternatives if you prefer simpler syntax.`;
    }

    try {
      const response = await this.sendMessage(
        `The user is creating a project called "${projectName}". Provide a 1-2 sentence recommendation about framework choice.`
      );
      return response;
    } catch {
      return `For "${projectName}", React offers the largest ecosystem and community. Consider Vue for easier learning curve or Svelte for better performance.`;
    }
  }

  async getUILibraryRecommendation(config: any, framework: string): Promise<string> {
    if (!this.initialized) {
      const recommendations: Record<string, string> = {
        React: 'For React, Chakra UI offers great DX with built-in accessibility. Material-UI is excellent for enterprise apps.',
        Vue: 'For Vue, Vuetify provides comprehensive Material Design components. Element Plus is great for admin dashboards.',
        Angular: 'For Angular, Angular Material is the official choice. PrimeNG offers more components for complex applications.',
        Svelte: 'For Svelte, consider Tailwind UI components or build custom with the Revolutionary UI factories.'
      };
      return recommendations[framework] || 'Choose a UI library that matches your design needs, or go custom for full control.';
    }

    try {
      const response = await this.sendMessage(
        `Recommend a UI library for a ${framework} project. Keep it to 1-2 sentences with specific library names.`
      );
      return response;
    } catch {
      return `For ${framework}, popular choices include established libraries with good documentation and active communities.`;
    }
  }

  async getCSSRecommendation(config: any, uiLibrary: string): Promise<string> {
    if (!this.initialized) {
      if (uiLibrary === 'none') {
        return 'With custom components, Tailwind CSS provides excellent utility classes. CSS-in-JS like styled-components offers component scoping.';
      }
      return `Since you're using ${uiLibrary}, check if it has built-in styling. You can still add Tailwind CSS for additional utilities.`;
    }

    try {
      const response = await this.sendMessage(
        `Recommend a CSS approach for a project using ${uiLibrary}. Consider modern best practices. Keep it to 1-2 sentences.`
      );
      return response;
    } catch {
      return 'Tailwind CSS is the most popular choice in 2025. For CSS-in-JS, consider Emotion or styled-components.';
    }
  }

  async getFeatureRecommendation(config: any): Promise<string> {
    if (!this.initialized) {
      return 'I recommend including all suggested features. TypeScript and testing are essential for maintainable code in 2025.';
    }

    try {
      const response = await this.sendMessage(
        'Briefly explain why TypeScript, testing, and CI/CD are important for modern web projects. Keep it to 1-2 sentences.'
      );
      return response;
    } catch {
      return 'TypeScript prevents bugs, testing ensures reliability, and CI/CD automates deployments. These are standard in professional projects.';
    }
  }

  async generateComponent(prompt: string, config: any): Promise<string> {
    if (!this.initialized) {
      return 'Please configure AI authentication in Settings to generate components. You can also browse our catalog for pre-built options.';
    }

    try {
      const response = await this.sendMessage(
        `Generate a ${config.framework} component: ${prompt}. Use ${config.cssFramework} for styling. Include TypeScript types. Return only the code.`
      );
      return response;
    } catch (error) {
      return `// Error generating component. Try browsing the catalog or check AI settings.\n// ${error}`;
    }
  }

  private async sendMessage(message: string): Promise<string> {
    if (!this.initialized || !this.client) {
      throw new Error('AI not initialized');
    }

    try {
      const response = await this.client.sendMessage(message, {
        model: 'claude-3-5-sonnet-20241022'
      });
      return response.text;
    } catch (error) {
      console.error('AI request failed:', error);
      throw error;
    }
  }
}

export const AIService = new AIServiceClass();