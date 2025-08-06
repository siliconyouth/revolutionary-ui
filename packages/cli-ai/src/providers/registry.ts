import type { AIProvider } from '../types.js';
import { OpenAIProvider } from './openai.js';
import { AnthropicProvider } from './anthropic.js';
import { GoogleProvider } from './google.js';
import { LocalProvider } from './local.js';
import { createLogger } from '@revolutionary-ui/cli-core';

const providers = new Map<string, AIProvider>();
const logger = createLogger();

// Register default providers
providers.set('openai', new OpenAIProvider());
providers.set('anthropic', new AnthropicProvider());
providers.set('google', new GoogleProvider());
providers.set('local', new LocalProvider());

export function getProvider(name: string, apiKey?: string): AIProvider {
  let provider = providers.get(name);
  
  if (!provider) {
    throw new Error(`Unknown AI provider: ${name}`);
  }

  // If API key is provided, create a new instance with the key
  if (apiKey) {
    switch (name) {
      case 'openai':
        provider = new OpenAIProvider(apiKey);
        break;
      case 'anthropic':
        provider = new AnthropicProvider(apiKey);
        break;
      case 'google':
        provider = new GoogleProvider(apiKey);
        break;
    }
  }

  return provider;
}

export async function getAllProviders(): Promise<{ name: string; available: boolean }[]> {
  // Check all providers in parallel for better performance
  const providerEntries = Array.from(providers.entries());
  
  const results = await Promise.all(
    providerEntries.map(async ([name, provider]) => {
      try {
        const available = await provider.isAvailable();
        return { name, available };
      } catch {
        return { name, available: false };
      }
    })
  );
  
  return results;
}

export function registerProvider(name: string, provider: AIProvider): void {
  if (providers.has(name)) {
    logger.warn(`Overwriting existing provider: ${name}`);
  }
  providers.set(name, provider);
}