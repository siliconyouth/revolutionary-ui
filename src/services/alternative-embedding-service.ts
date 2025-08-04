/**
 * Alternative Embedding Service
 * Supports multiple AI providers for embeddings when OpenAI quota is exceeded
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export interface EmbeddingProvider {
  name: string;
  generateEmbedding(text: string): Promise<number[]>;
}

// Together AI provider
class TogetherAIProvider implements EmbeddingProvider {
  name = 'together-ai';
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.together.xyz/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'BAAI/bge-base-en-v1.5',
        input: text,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Together AI error: ${response.status} - ${errorData}`);
    }
    
    const data = await response.json();
    return data.data[0].embedding;
  }
}

// Cohere provider
class CohereProvider implements EmbeddingProvider {
  name = 'cohere';
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.cohere.ai/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: [text],
        model: 'embed-english-v3.0',
        input_type: 'search_document',
        embedding_types: ['float'],
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Cohere error: ${response.status} - ${errorData}`);
    }
    
    const data = await response.json();
    return data.embeddings.float[0];
  }
}

// Local embeddings using transformers.js
class LocalEmbeddingProvider implements EmbeddingProvider {
  name = 'local';
  private model: any;
  private initialized = false;
  
  async initialize() {
    if (this.initialized) return;
    
    // Dynamic import to avoid loading if not needed
    const { pipeline } = await import('@xenova/transformers');
    this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    this.initialized = true;
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    await this.initialize();
    
    const output = await this.model(text, {
      pooling: 'mean',
      normalize: true,
    });
    
    return Array.from(output.data);
  }
}

export class AlternativeEmbeddingService {
  private prisma: PrismaClient;
  private providers: EmbeddingProvider[] = [];
  private currentProviderIndex = 0;
  
  constructor() {
    this.prisma = new PrismaClient();
    
    // Initialize providers based on available API keys
    if (process.env.TOGETHER_API_KEY) {
      this.providers.push(new TogetherAIProvider(process.env.TOGETHER_API_KEY));
    }
    
    if (process.env.COHERE_API_KEY) {
      this.providers.push(new CohereProvider(process.env.COHERE_API_KEY));
    }
    
    // Always add local provider as fallback
    this.providers.push(new LocalEmbeddingProvider());
  }
  
  /**
   * Generate embedding with fallback to alternative providers
   */
  async generateEmbedding(text: string): Promise<{ embedding: number[], provider: string, originalDimensions: number }> {
    let lastError: Error | null = null;
    
    // Try each provider in sequence
    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[(this.currentProviderIndex + i) % this.providers.length];
      
      try {
        console.log(`Trying ${provider.name} for embedding generation...`);
        const embedding = await provider.generateEmbedding(text);
        const originalDimensions = embedding.length;
        
        // Success - use this provider for next request too
        this.currentProviderIndex = (this.currentProviderIndex + i) % this.providers.length;
        
        return { 
          embedding: this.normalizeEmbedding(embedding), 
          provider: provider.name,
          originalDimensions 
        };
      } catch (error) {
        console.error(`${provider.name} failed:`, error);
        lastError = error as Error;
      }
    }
    
    throw new Error(`All embedding providers failed. Last error: ${lastError?.message}`);
  }
  
  /**
   * Check embedding dimensions and adjust if needed
   */
  normalizeEmbedding(embedding: number[], targetDimension: number = 1536): number[] {
    if (embedding.length === targetDimension) {
      return embedding;
    }
    
    if (embedding.length > targetDimension) {
      // Truncate
      return embedding.slice(0, targetDimension);
    }
    
    // Pad with zeros
    const padded = [...embedding];
    while (padded.length < targetDimension) {
      padded.push(0);
    }
    return padded;
  }
  
  /**
   * Update resource embedding using alternative providers
   */
  async updateResourceEmbedding(resourceId: string): Promise<void> {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        category: true,
        tags: true,
      },
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    // Create searchable text
    const searchableText = [
      resource.name,
      resource.description || '',
      resource.frameworks?.join(' ') || '',
      resource.category?.name || '',
      resource.tags.map(t => t.name).join(' '),
    ].filter(Boolean).join(' | ');
    
    const contentHash = crypto.createHash('sha256').update(searchableText).digest('hex');

    // Check if embedding exists and is up to date
    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id, "contentHash" FROM "ResourceEmbedding" 
      WHERE "resourceId" = ${resourceId}
    `;

    if (existing.length > 0 && existing[0].contentHash === contentHash) {
      // Embedding is up to date
      return;
    }

    // Generate new embedding
    const { embedding, provider, originalDimensions } = await this.generateEmbedding(searchableText);

    // Store in database
    if (existing.length > 0) {
      await this.prisma.$executeRaw`
        UPDATE "ResourceEmbedding" 
        SET embedding = ${embedding}::vector,
            "contentHash" = ${contentHash},
            provider = ${provider},
            "originalDimensions" = ${originalDimensions},
            "updatedAt" = NOW()
        WHERE "resourceId" = ${resourceId}
      `;
    } else {
      await this.prisma.$executeRaw`
        INSERT INTO "ResourceEmbedding" 
        (id, "resourceId", embedding, "contentHash", provider, "originalDimensions", version)
        VALUES (
          ${crypto.randomUUID()},
          ${resourceId},
          ${embedding}::vector,
          ${contentHash},
          ${provider},
          ${originalDimensions},
          1
        )
      `;
    }
  }
}