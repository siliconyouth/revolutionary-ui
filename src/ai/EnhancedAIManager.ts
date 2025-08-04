import { AI_MODELS_CONFIG, AIProviderDetails, AIModelDetails } from './models/AIModelsConfig';
import { VisualAnalysisService } from './services/VisualAnalysisService';
import { CodingAIService } from './services/CodingAIService';
import chalk from 'chalk';

// Provider-specific client imports
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios, { AxiosInstance } from 'axios';

export interface AIProviderClient {
  generateResponse(prompt: string, options?: any): Promise<string>;
  generateStream(prompt: string, options?: any): AsyncGenerator<string>;
  supportsVision(): boolean;
  supportsFunctionCalling(): boolean;
}

export interface AIManagerConfig {
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  temperature?: number;
  maxTokens?: number;
}

export class EnhancedAIManager {
  private providers: Map<string, AIProviderClient> = new Map();
  private currentProvider: string = 'openai';
  private currentModel: string = 'gpt-4-turbo-preview';
  private visualService: VisualAnalysisService;
  private codingService: CodingAIService;
  private config: AIManagerConfig;
  
  constructor(config?: Partial<AIManagerConfig>) {
    // Load defaults from environment
    const defaultProvider = process.env.DEFAULT_AI_PROVIDER || 'openai';
    const defaultModel = process.env.DEFAULT_AI_MODEL || 'gpt-4-turbo-preview';
    const defaultTemp = parseFloat(process.env.DEFAULT_AI_TEMPERATURE || '0.7');
    const defaultMaxTokens = parseInt(process.env.DEFAULT_AI_MAX_TOKENS || '4096');
    
    this.config = {
      provider: defaultProvider,
      model: defaultModel,
      timeout: 30000,
      maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3'),
      temperature: defaultTemp,
      maxTokens: defaultMaxTokens,
      ...config
    };
    
    this.currentProvider = this.config.provider;
    this.currentModel = this.config.model;
    
    this.visualService = new VisualAnalysisService();
    this.codingService = new CodingAIService();
    
    // Auto-initialize providers with environment API keys
    this.autoInitializeProviders();
    
    if (config?.provider && config?.model) {
      this.setProvider(config.provider, config.model);
    }
  }
  
  // Auto-initialize providers from environment variables
  private async autoInitializeProviders() {
    const providerKeyMap: Record<string, string> = {
      'openai': 'OPENAI_API_KEY',
      'anthropic': 'ANTHROPIC_API_KEY',
      'google': 'GOOGLE_AI_API_KEY',
      'mistral': 'MISTRAL_API_KEY',
      'groq': 'GROQ_API_KEY',
      'deepseek': 'DEEPSEEK_API_KEY',
      'cohere': 'COHERE_API_KEY',
      'perplexity': 'PERPLEXITY_API_KEY',
      'together': 'TOGETHER_API_KEY',
      'xai': 'XAI_API_KEY',
      'replicate': 'REPLICATE_API_TOKEN',
      'huggingface': 'HUGGINGFACE_API_KEY'
    };
    
    for (const [providerId, envKey] of Object.entries(providerKeyMap)) {
      const apiKey = process.env[envKey];
      if (apiKey && !apiKey.startsWith('your_')) {
        try {
          await this.initializeProvider(providerId, apiKey);
          console.log(chalk.dim(`Auto-initialized ${providerId}`));
        } catch (error) {
          console.log(chalk.dim(`Failed to auto-initialize ${providerId}`));
        }
      }
    }
    
    // Initialize Ollama if available (no API key needed)
    try {
      const ollamaProvider = AI_MODELS_CONFIG.find(p => p.id === 'ollama');
      if (ollamaProvider) {
        const client = new OllamaProvider(ollamaProvider);
        this.providers.set('ollama', client);
        console.log(chalk.dim('Auto-initialized Ollama (local)'));
      }
    } catch (error) {
      console.log(chalk.dim('Ollama not available'));
    }
  }
  
  // Initialize a provider with API key
  async initializeProvider(providerId: string, apiKey: string): Promise<void> {
    const providerConfig = AI_MODELS_CONFIG.find(p => p.id === providerId);
    if (!providerConfig) {
      throw new Error(`Provider ${providerId} not found`);
    }
    
    let client: AIProviderClient;
    
    switch (providerId) {
      case 'openai':
        client = new OpenAIProvider(apiKey, providerConfig);
        break;
      case 'anthropic':
        client = new AnthropicProvider(apiKey, providerConfig);
        break;
      case 'google':
        client = new GoogleProvider(apiKey, providerConfig);
        break;
      case 'mistral':
      case 'groq':
      case 'together':
      case 'deepseek':
      case 'cohere':
      case 'perplexity':
      case 'xai':
        client = new OpenAICompatibleProvider(apiKey, providerConfig);
        break;
      case 'replicate':
        client = new ReplicateProvider(apiKey, providerConfig);
        break;
      case 'huggingface':
        client = new HuggingFaceProvider(apiKey, providerConfig);
        break;
      case 'ollama':
        client = new OllamaProvider(providerConfig);
        break;
      default:
        throw new Error(`Provider ${providerId} not implemented`);
    }
    
    this.providers.set(providerId, client);
    console.log(chalk.green(`✅ Initialized ${providerConfig.name}`));
  }
  
  // Set current provider and model
  setProvider(providerId: string, modelId: string): void {
    const provider = AI_MODELS_CONFIG.find(p => p.id === providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }
    
    const model = provider.models.find(m => m.id === modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found for provider ${providerId}`);
    }
    
    this.currentProvider = providerId;
    this.currentModel = modelId;
    this.config.provider = providerId;
    this.config.model = modelId;
    
    console.log(chalk.cyan(`Switched to ${provider.name} - ${model.name}`));
  }
  
  // Get current provider info
  getCurrentProviderInfo(): { provider: AIProviderDetails; model: AIModelDetails } | null {
    const provider = AI_MODELS_CONFIG.find(p => p.id === this.currentProvider);
    if (!provider) return null;
    
    const model = provider.models.find(m => m.id === this.currentModel);
    if (!model) return null;
    
    return { provider, model };
  }
  
  // Generate response using current provider
  async generateResponse(prompt: string, options?: any): Promise<string> {
    const client = this.providers.get(this.currentProvider);
    if (!client) {
      throw new Error(`Provider ${this.currentProvider} not initialized. Call initializeProvider() first.`);
    }
    
    try {
      return await client.generateResponse(prompt, {
        model: this.currentModel,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        ...options
      });
    } catch (error: any) {
      console.error(chalk.red(`Error with ${this.currentProvider}:`, error.message));
      throw error;
    }
  }
  
  // Stream response using current provider
  async* streamResponse(prompt: string, options?: any): AsyncGenerator<string> {
    const client = this.providers.get(this.currentProvider);
    if (!client) {
      throw new Error(`Provider ${this.currentProvider} not initialized`);
    }
    
    try {
      const stream = client.generateStream(prompt, {
        model: this.currentModel,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        ...options
      });
      
      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error: any) {
      console.error(chalk.red(`Stream error with ${this.currentProvider}:`, error.message));
      throw error;
    }
  }
  
  // Vision-specific methods
  async analyzeImage(imagePath: string, prompt?: string): Promise<any> {
    const info = this.getCurrentProviderInfo();
    if (!info?.model.capabilities.vision) {
      throw new Error(`Current model ${this.currentModel} does not support vision`);
    }
    
    return this.visualService.analyzeImage(imagePath, {
      provider: this.currentProvider,
      model: this.currentModel
    });
  }
  
  // Coding-specific methods
  async generateCode(task: string, options?: any): Promise<any> {
    return this.codingService.generateCode({
      task,
      options: {
        provider: this.currentProvider,
        model: this.currentModel,
        ...options
      }
    });
  }
  
  async reviewCode(code: string, language: string, focus?: string[]): Promise<any> {
    return this.codingService.reviewCode({
      code,
      language,
      focus: focus as any
    });
  }
  
  // List all available providers
  listProviders(): AIProviderDetails[] {
    return AI_MODELS_CONFIG;
  }
  
  // List models for a provider
  listModels(providerId?: string): AIModelDetails[] {
    const id = providerId || this.currentProvider;
    const provider = AI_MODELS_CONFIG.find(p => p.id === id);
    return provider?.models || [];
  }
  
  // Get model recommendations
  getRecommendations(useCase: string): Array<{ provider: string; model: AIModelDetails; reason: string }> {
    const recommendations: Array<{ provider: string; model: AIModelDetails; reason: string }> = [];
    
    AI_MODELS_CONFIG.forEach(provider => {
      provider.models.forEach(model => {
        const score = this.calculateModelScore(model, useCase);
        if (score > 0.7) {
          recommendations.push({
            provider: provider.name,
            model,
            reason: this.getRecommendationReason(model, useCase)
          });
        }
      });
    });
    
    return recommendations.sort((a, b) => {
      const scoreA = this.calculateModelScore(a.model, useCase);
      const scoreB = this.calculateModelScore(b.model, useCase);
      return scoreB - scoreA;
    }).slice(0, 5);
  }
  
  private calculateModelScore(model: AIModelDetails, useCase: string): number {
    let score = 0;
    const useCaseLower = useCase.toLowerCase();
    
    // Check if model is good for the use case
    model.bestFor.forEach(bestUse => {
      if (bestUse.toLowerCase().includes(useCaseLower)) {
        score += 0.3;
      }
    });
    
    // Check strengths
    model.strengths.forEach(strength => {
      if (strength.toLowerCase().includes(useCaseLower)) {
        score += 0.2;
      }
    });
    
    // Check capabilities
    if (useCaseLower.includes('vision') && model.capabilities.vision) {
      score += 0.3;
    }
    if (useCaseLower.includes('code') && model.capabilities.coding) {
      score += 0.3;
    }
    if (useCaseLower.includes('function') && model.capabilities.functionCalling) {
      score += 0.2;
    }
    
    // Consider context size for large tasks
    if (useCaseLower.includes('large') || useCaseLower.includes('context')) {
      score += Math.min(model.context / 1000000, 0.3);
    }
    
    // Consider pricing for budget-conscious use cases
    if (useCaseLower.includes('budget') || useCaseLower.includes('cheap')) {
      if (model.pricing) {
        score += Math.max(0, 0.3 - (model.pricing.input / 10));
      }
    }
    
    return Math.min(score, 1);
  }
  
  private getRecommendationReason(model: AIModelDetails, useCase: string): string {
    const reasons: string[] = [];
    const useCaseLower = useCase.toLowerCase();
    
    if (useCaseLower.includes('vision') && model.capabilities.vision) {
      reasons.push('Supports vision/image analysis');
    }
    
    if (useCaseLower.includes('code')) {
      const codeStrengths = model.strengths.filter(s => 
        s.toLowerCase().includes('code') || s.toLowerCase().includes('programming')
      );
      if (codeStrengths.length > 0) {
        reasons.push(codeStrengths[0]);
      }
    }
    
    if (useCaseLower.includes('fast') || useCaseLower.includes('speed')) {
      const speedStrengths = model.strengths.filter(s => 
        s.toLowerCase().includes('fast') || s.toLowerCase().includes('quick')
      );
      if (speedStrengths.length > 0) {
        reasons.push(speedStrengths[0]);
      }
    }
    
    if (model.context > 100000 && (useCaseLower.includes('large') || useCaseLower.includes('context'))) {
      reasons.push(`Large context window (${(model.context / 1000).toFixed(0)}k tokens)`);
    }
    
    return reasons.join('; ') || model.description;
  }
  
  // Test provider connection
  async testConnection(providerId?: string): Promise<boolean> {
    const id = providerId || this.currentProvider;
    const client = this.providers.get(id);
    
    if (!client) {
      console.log(chalk.yellow(`Provider ${id} not initialized`));
      return false;
    }
    
    try {
      await client.generateResponse('Say "Hello"', { maxTokens: 10 });
      console.log(chalk.green(`✅ ${id} connection successful`));
      return true;
    } catch (error: any) {
      console.log(chalk.red(`❌ ${id} connection failed:`, error.message));
      return false;
    }
  }
  
  // Batch test multiple providers
  async testAllProviders(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    for (const [providerId, client] of this.providers) {
      const success = await this.testConnection(providerId);
      results.set(providerId, success);
    }
    
    return results;
  }
}

// Provider implementations
class OpenAIProvider implements AIProviderClient {
  private client: OpenAI;
  private config: AIProviderDetails;
  
  constructor(apiKey: string, config: AIProviderDetails) {
    this.client = new OpenAI({ apiKey });
    this.config = config;
  }
  
  async generateResponse(prompt: string, options?: any): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4096,
      ...options
    });
    
    return response.choices[0].message.content || '';
  }
  
  async *generateStream(prompt: string, options?: any): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: options.model || 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4096,
      stream: true,
      ...options
    });
    
    const reader = stream as any;
    for await (const chunk of reader) {
      yield chunk.choices[0]?.delta?.content || '';
    }
  }
  
  supportsVision(): boolean {
    return true;
  }
  
  supportsFunctionCalling(): boolean {
    return true;
  }
}

class AnthropicProvider implements AIProviderClient {
  private client: Anthropic;
  private config: AIProviderDetails;
  
  constructor(apiKey: string, config: AIProviderDetails) {
    this.client = new Anthropic({ apiKey });
    this.config = config;
  }
  
  async generateResponse(prompt: string, options?: any): Promise<string> {
    const response = await this.client.messages.create({
      model: options.model || 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      ...options
    });
    
    return response.content[0].type === 'text' ? response.content[0].text : '';
  }
  
  async *generateStream(prompt: string, options?: any): AsyncGenerator<string> {
    const stream = await this.client.messages.create({
      model: options.model || 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      stream: true,
      ...options
    });
    
    const reader = stream as any;
    for await (const chunk of reader) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }
  
  supportsVision(): boolean {
    return true;
  }
  
  supportsFunctionCalling(): boolean {
    return false; // Claude doesn't have native function calling yet
  }
}

class GoogleProvider implements AIProviderClient {
  private client: GoogleGenerativeAI;
  private config: AIProviderDetails;
  
  constructor(apiKey: string, config: AIProviderDetails) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.config = config;
  }
  
  async generateResponse(prompt: string, options?: any): Promise<string> {
    const model = this.client.getGenerativeModel({ 
      model: options.model || 'gemini-1.5-pro' 
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
  
  async *generateStream(prompt: string, options?: any): AsyncGenerator<string> {
    const model = this.client.getGenerativeModel({ 
      model: options.model || 'gemini-1.5-pro' 
    });
    
    const result = await model.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
      yield chunk.text();
    }
  }
  
  supportsVision(): boolean {
    return true;
  }
  
  supportsFunctionCalling(): boolean {
    return true;
  }
}

// OpenAI-compatible provider for Mistral, Groq, Together, etc.
class OpenAICompatibleProvider implements AIProviderClient {
  private client: AxiosInstance;
  private apiKey: string;
  private config: AIProviderDetails;
  
  constructor(apiKey: string, config: AIProviderDetails) {
    this.apiKey = apiKey;
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }
  
  async generateResponse(prompt: string, options?: any): Promise<string> {
    const response = await this.client.post('/chat/completions', {
      model: options.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4096,
      ...options
    });
    
    return response.data.choices[0].message.content;
  }
  
  async *generateStream(prompt: string, options?: any): AsyncGenerator<string> {
    const response = await this.client.post('/chat/completions', {
      model: options.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4096,
      stream: true,
      ...options
    }, {
      responseType: 'stream'
    });
    
    // Parse SSE stream
    for await (const chunk of response.data) {
      const lines = chunk.toString().split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data);
              yield parsed.choices[0]?.delta?.content || '';
            } catch {}
          }
        }
      }
    }
  }
  
  supportsVision(): boolean {
    return false; // Most don't support vision yet
  }
  
  supportsFunctionCalling(): boolean {
    return this.config.features.includes('Function calling');
  }
}

// Ollama provider for local models
class OllamaProvider implements AIProviderClient {
  private client: AxiosInstance;
  private config: AIProviderDetails;
  
  constructor(config: AIProviderDetails) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl || 'http://localhost:11434/api'
    });
  }
  
  async generateResponse(prompt: string, options?: any): Promise<string> {
    const response = await this.client.post('/generate', {
      model: options.model,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.maxTokens || 4096
      }
    });
    
    return response.data.response;
  }
  
  async *generateStream(prompt: string, options?: any): AsyncGenerator<string> {
    const response = await this.client.post('/generate', {
      model: options.model,
      prompt,
      stream: true,
      options: {
        temperature: options.temperature || 0.7,
        num_predict: options.maxTokens || 4096
      }
    }, {
      responseType: 'stream'
    });
    
    for await (const chunk of response.data) {
      try {
        const parsed = JSON.parse(chunk.toString());
        yield parsed.response || '';
      } catch {}
    }
  }
  
  supportsVision(): boolean {
    return false;
  }
  
  supportsFunctionCalling(): boolean {
    return false;
  }
}

// Replicate provider
class ReplicateProvider implements AIProviderClient {
  private apiKey: string;
  private config: AIProviderDetails;
  private client: AxiosInstance;
  
  constructor(apiKey: string, config: AIProviderDetails) {
    this.apiKey = apiKey;
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.replicate.com/v1',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }
  
  async generateResponse(prompt: string, options?: any): Promise<string> {
    // Create prediction
    const prediction = await this.client.post('/predictions', {
      version: options.model?.replace('/', ':'),
      input: {
        prompt,
        max_new_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7
      }
    });
    
    // Poll for completion
    let result = prediction.data;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await this.client.get(`/predictions/${result.id}`);
      result = response.data;
    }
    
    if (result.status === 'failed') {
      throw new Error(`Replicate prediction failed: ${result.error}`);
    }
    
    return result.output.join('');
  }
  
  async *generateStream(prompt: string, options?: any): AsyncGenerator<string> {
    // Replicate doesn't have native streaming, so we'll simulate it
    const response = await this.generateResponse(prompt, options);
    yield response;
  }
  
  supportsVision(): boolean {
    return false;
  }
  
  supportsFunctionCalling(): boolean {
    return false;
  }
}

// HuggingFace provider
class HuggingFaceProvider implements AIProviderClient {
  private apiKey: string;
  private config: AIProviderDetails;
  private client: AxiosInstance;
  
  constructor(apiKey: string, config: AIProviderDetails) {
    this.apiKey = apiKey;
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api-inference.huggingface.co/models',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }
  
  async generateResponse(prompt: string, options?: any): Promise<string> {
    const response = await this.client.post(`/${options.model}`, {
      inputs: prompt,
      parameters: {
        max_new_tokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
        do_sample: true
      }
    });
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data[0].generated_text || '';
    } else if (response.data.generated_text) {
      return response.data.generated_text;
    } else {
      return JSON.stringify(response.data);
    }
  }
  
  async *generateStream(prompt: string, options?: any): AsyncGenerator<string> {
    // HuggingFace doesn't have streaming for most models
    const response = await this.generateResponse(prompt, options);
    yield response;
  }
  
  supportsVision(): boolean {
    return false;
  }
  
  supportsFunctionCalling(): boolean {
    return false;
  }
}

// Export singleton instance
export const aiManager = new EnhancedAIManager();