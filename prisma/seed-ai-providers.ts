import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedAIProviders() {
  console.log('🤖 Seeding AI providers...');

  // Create AI Providers
  const providers = await Promise.all([
    prisma.aIProvider.create({
      data: {
        name: 'OpenAI',
        slug: 'openai',
        description: 'OpenAI GPT models for advanced AI generation',
        icon: '🤖',
        apiEndpoint: 'https://api.openai.com/v1',
        apiKeyEnvVar: 'OPENAI_API_KEY',
        supportsChat: true,
        supportsCompletion: true,
        supportsEmbedding: true,
        supportsImage: true,
        supportsVision: true,
        isDefault: true,
      }
    }),
    prisma.aIProvider.create({
      data: {
        name: 'Anthropic',
        slug: 'anthropic',
        description: 'Claude models for safe and helpful AI',
        icon: '🧠',
        apiEndpoint: 'https://api.anthropic.com',
        apiKeyEnvVar: 'ANTHROPIC_API_KEY',
        supportsChat: true,
        supportsCompletion: true,
        supportsVision: true,
      }
    }),
    prisma.aIProvider.create({
      data: {
        name: 'Google AI',
        slug: 'google',
        description: 'Gemini models for multimodal AI',
        icon: '🌟',
        apiEndpoint: 'https://generativelanguage.googleapis.com',
        apiKeyEnvVar: 'GOOGLE_AI_API_KEY',
        supportsChat: true,
        supportsCompletion: true,
        supportsEmbedding: true,
        supportsVision: true,
      }
    }),
    prisma.aIProvider.create({
      data: {
        name: 'Groq',
        slug: 'groq',
        description: 'Ultra-fast inference for open models',
        icon: '⚡',
        apiEndpoint: 'https://api.groq.com',
        apiKeyEnvVar: 'GROQ_API_KEY',
        supportsChat: true,
        supportsCompletion: true,
      }
    }),
    prisma.aIProvider.create({
      data: {
        name: 'Mistral AI',
        slug: 'mistral',
        description: 'European AI models for various tasks',
        icon: '🌬️',
        apiEndpoint: 'https://api.mistral.ai',
        apiKeyEnvVar: 'MISTRAL_API_KEY',
        supportsChat: true,
        supportsCompletion: true,
        supportsEmbedding: true,
      }
    }),
    prisma.aIProvider.create({
      data: {
        name: 'Ollama',
        slug: 'ollama',
        description: 'Local AI models running on your machine',
        icon: '🦙',
        apiEndpoint: 'http://localhost:11434',
        apiKeyEnvVar: '',
        supportsChat: true,
        supportsCompletion: true,
        supportsEmbedding: true,
      }
    }),
  ]);

  // Create AI Models
  const models = await Promise.all([
    // OpenAI Models
    prisma.aIModel.create({
      data: {
        providerId: providers[0].id,
        modelName: 'gpt-4-turbo-preview',
        displayName: 'GPT-4 Turbo',
        description: 'Most capable GPT-4 model with 128k context',
        maxTokens: 128000,
        supportsFunctions: true,
        supportsStreaming: true,
        inputCostPer1k: 0.01,
        outputCostPer1k: 0.03,
        isDefault: true,
      }
    }),
    prisma.aIModel.create({
      data: {
        providerId: providers[0].id,
        modelName: 'gpt-3.5-turbo',
        displayName: 'GPT-3.5 Turbo',
        description: 'Fast and cost-effective model',
        maxTokens: 16385,
        supportsFunctions: true,
        supportsStreaming: true,
        inputCostPer1k: 0.0005,
        outputCostPer1k: 0.0015,
      }
    }),
    // Anthropic Models
    prisma.aIModel.create({
      data: {
        providerId: providers[1].id,
        modelName: 'claude-3-opus-20240229',
        displayName: 'Claude 3 Opus',
        description: 'Most powerful Claude model',
        maxTokens: 200000,
        supportsFunctions: false,
        supportsStreaming: true,
        inputCostPer1k: 0.015,
        outputCostPer1k: 0.075,
        isDefault: true,
      }
    }),
    prisma.aIModel.create({
      data: {
        providerId: providers[1].id,
        modelName: 'claude-3-sonnet-20240229',
        displayName: 'Claude 3 Sonnet',
        description: 'Balanced performance and cost',
        maxTokens: 200000,
        supportsFunctions: false,
        supportsStreaming: true,
        inputCostPer1k: 0.003,
        outputCostPer1k: 0.015,
      }
    }),
    // Google Models
    prisma.aIModel.create({
      data: {
        providerId: providers[2].id,
        modelName: 'gemini-pro',
        displayName: 'Gemini Pro',
        description: 'Google\'s advanced AI model',
        maxTokens: 32768,
        supportsFunctions: true,
        supportsStreaming: true,
        inputCostPer1k: 0.00025,
        outputCostPer1k: 0.0005,
        isDefault: true,
      }
    }),
    // Groq Models
    prisma.aIModel.create({
      data: {
        providerId: providers[3].id,
        modelName: 'mixtral-8x7b-32768',
        displayName: 'Mixtral 8x7B',
        description: 'Fast open-source model',
        maxTokens: 32768,
        supportsFunctions: false,
        supportsStreaming: true,
        inputCostPer1k: 0.00027,
        outputCostPer1k: 0.00027,
        isDefault: true,
      }
    }),
    // Mistral Models
    prisma.aIModel.create({
      data: {
        providerId: providers[4].id,
        modelName: 'mistral-large-latest',
        displayName: 'Mistral Large',
        description: 'Most capable Mistral model',
        maxTokens: 32768,
        supportsFunctions: true,
        supportsStreaming: true,
        inputCostPer1k: 0.008,
        outputCostPer1k: 0.024,
        isDefault: true,
      }
    }),
    // Ollama Models
    prisma.aIModel.create({
      data: {
        providerId: providers[5].id,
        modelName: 'llama3:latest',
        displayName: 'Llama 3',
        description: 'Open-source model running locally',
        maxTokens: 8192,
        supportsFunctions: false,
        supportsStreaming: true,
        inputCostPer1k: 0,
        outputCostPer1k: 0,
        isDefault: true,
      }
    }),
  ]);

  console.log(`✅ Created ${providers.length} AI providers`);
  console.log(`✅ Created ${models.length} AI models`);
}