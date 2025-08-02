// Export all AI providers and utilities
export * from './base-provider';
export * from './openai-provider';
export * from './anthropic-provider';
export * from './gemini-provider';
export * from './mistral-provider';

// Re-export singleton manager
export { aiProviderManager } from './base-provider';

// Convenience function to initialize all providers
import { AIProviderConfig, aiProviderManager } from './base-provider';
import { OpenAIProvider } from './openai-provider';
import { AnthropicProvider } from './anthropic-provider';
import { GeminiProvider } from './gemini-provider';
import { MistralProvider } from './mistral-provider';

export interface AIProvidersConfig {
  openai?: AIProviderConfig;
  anthropic?: AIProviderConfig;
  gemini?: AIProviderConfig;
  mistral?: AIProviderConfig;
  default?: 'openai' | 'anthropic' | 'gemini' | 'mistral';
}

export function initializeAIProviders(config: AIProvidersConfig): void {
  if (config.openai) {
    aiProviderManager.registerProvider(new OpenAIProvider(config.openai));
  }
  
  if (config.anthropic) {
    aiProviderManager.registerProvider(new AnthropicProvider(config.anthropic));
  }
  
  if (config.gemini) {
    aiProviderManager.registerProvider(new GeminiProvider(config.gemini));
  }
  
  if (config.mistral) {
    aiProviderManager.registerProvider(new MistralProvider(config.mistral));
  }
  
  if (config.default) {
    aiProviderManager.setDefaultProvider(config.default);
  }
}