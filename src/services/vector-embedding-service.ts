/**
 * Vector Embedding Service
 * Generates and manages vector embeddings for semantic search
 */

import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import crypto from 'crypto';

export interface EmbeddingInput {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  code?: string;
  framework?: string;
  category?: string;
}

export interface SearchResult {
  id: string;
  score: number;
  resource?: any;
  submission?: any;
}

export class VectorEmbeddingService {
  private prisma: PrismaClient;
  private openai: OpenAI;
  private static instance: VectorEmbeddingService;

  private constructor() {
    this.prisma = new PrismaClient();
    
    // Handle OpenAI organization carefully
    const orgId = process.env.OPENAI_ORG_ID || process.env.OPENAI_ORGANIZATION;
    const validOrgId = orgId && !orgId.includes('Leave empty') && orgId.trim() !== '' ? orgId : undefined;
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: validOrgId,
    });
  }

  static getInstance(): VectorEmbeddingService {
    if (!VectorEmbeddingService.instance) {
      VectorEmbeddingService.instance = new VectorEmbeddingService();
    }
    return VectorEmbeddingService.instance;
  }

  /**
   * Generate embedding for a component
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      throw new Error('Embedding generation failed');
    }
  }

  /**
   * Create searchable text from component data
   */
  createSearchableText(input: EmbeddingInput): string {
    const parts = [
      input.name,
      input.description || '',
      input.framework ? `Framework: ${input.framework}` : '',
      input.category ? `Category: ${input.category}` : '',
      input.tags ? `Tags: ${input.tags.join(', ')}` : '',
    ];

    // Add code snippet (first 500 chars)
    if (input.code) {
      const codeSnippet = input.code.substring(0, 500);
      parts.push(`Code: ${codeSnippet}`);
    }

    return parts.filter(Boolean).join(' | ');
  }

  /**
   * Generate content hash for caching
   */
  generateContentHash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Update embedding for a resource
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

    // Get code from R2 if needed
    let code = '';
    if (resource.codeStorageId) {
      const storage = await this.prisma.storageObject.findUnique({
        where: { id: resource.codeStorageId },
      });
      if (storage) {
        // In production, fetch from R2
        // For now, we'll use a placeholder
        code = '// Component code here';
      }
    }

    const input: EmbeddingInput = {
      id: resource.id,
      name: resource.name,
      description: resource.description || undefined,
      tags: resource.tags.map(t => t.name),
      code,
      framework: resource.frameworks?.[0], // frameworks is a string array
      category: resource.category?.name,
    };

    const searchableText = this.createSearchableText(input);
    const contentHash = this.generateContentHash(searchableText);

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
    const embedding = await this.generateEmbedding(searchableText);

    // Store in database
    if (existing.length > 0) {
      await this.prisma.$executeRaw`
        UPDATE "ResourceEmbedding" 
        SET embedding = ${embedding}::vector,
            "contentHash" = ${contentHash},
            "updatedAt" = NOW()
        WHERE "resourceId" = ${resourceId}
      `;
    } else {
      await this.prisma.$executeRaw`
        INSERT INTO "ResourceEmbedding" 
        (id, "resourceId", embedding, "contentHash", model, version)
        VALUES (
          ${crypto.randomUUID()},
          ${resourceId},
          ${embedding}::vector,
          ${contentHash},
          'text-embedding-ada-002',
          1
        )
      `;
    }
  }

  /**
   * Search for similar components
   */
  async searchSimilar(
    query: string,
    options: {
      limit?: number;
      threshold?: number;
      filters?: {
        framework?: string;
        category?: string;
        tags?: string[];
      };
    } = {}
  ): Promise<SearchResult[]> {
    const { limit = 10, threshold = 0.7, filters } = options;

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Build filter conditions
    let filterConditions = '';
    const filterParams: any[] = [];

    if (filters?.framework) {
      filterConditions += ` AND $${filterParams.length + 1} = ANY(r.frameworks)`;
      filterParams.push(filters.framework);
    }

    if (filters?.category) {
      filterConditions += ` AND r."categoryId" IN (
        SELECT id FROM "categories" WHERE name = $${filterParams.length + 1}
      )`;
      filterParams.push(filters.category);
    }

    if (filters?.tags && filters.tags.length > 0) {
      filterConditions += ` AND r.id IN (
        SELECT "_ResourceTags"."A" FROM "_ResourceTags"
        JOIN "tags" t ON "_ResourceTags"."B" = t.id
        WHERE t.name = ANY($${filterParams.length + 1}::text[])
      )`;
      filterParams.push(filters.tags);
    }

    // Perform vector similarity search
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT 
        r.id,
        r.name,
        r.description,
        r.slug,
        1 - (re.embedding <=> ${queryEmbedding}::vector) as score
      FROM "ResourceEmbedding" re
      JOIN "resources" r ON re."resourceId" = r.id
      WHERE 1 - (re.embedding <=> ${queryEmbedding}::vector) > ${threshold}
      ${filterConditions}
      ORDER BY score DESC
      LIMIT ${limit}
    `;

    // Track search query
    await this.trackSearchQuery(query, queryEmbedding, results.length);

    // Load full resource data
    const resourceIds = results.map(r => r.id);
    const resources = await this.prisma.resource.findMany({
      where: { id: { in: resourceIds } },
      include: {
        category: true,
        tags: true,
        author: true,
        _count: {
          select: {
            downloads: true,
            reviews: true,
          },
        },
      },
    });

    // Map results with scores
    const resourceMap = new Map(resources.map(r => [r.id, r]));
    
    return results.map(result => ({
      id: result.id,
      score: result.score,
      resource: resourceMap.get(result.id),
    }));
  }

  /**
   * Find similar components to a given component
   */
  async findSimilarComponents(
    resourceId: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    // Get the embedding for the resource
    const embedding = await this.prisma.$queryRaw<any[]>`
      SELECT embedding FROM "ResourceEmbedding" 
      WHERE "resourceId" = ${resourceId}
    `;

    if (embedding.length === 0) {
      return [];
    }

    // Find similar components
    const results = await this.prisma.$queryRaw<any[]>`
      SELECT 
        r.id,
        r.name,
        r.description,
        r.slug,
        1 - (re.embedding <=> ${embedding[0].embedding}::vector) as score
      FROM "ResourceEmbedding" re
      JOIN "resources" r ON re."resourceId" = r.id
      WHERE r.id != ${resourceId}
      ORDER BY score DESC
      LIMIT ${limit}
    `;

    // Load full resource data
    const resourceIds = results.map(r => r.id);
    const resources = await this.prisma.resource.findMany({
      where: { id: { in: resourceIds } },
      include: {
        category: true,
        tags: true,
        author: true,
        _count: {
          select: {
            downloads: true,
            reviews: true,
          },
        },
      },
    });

    const resourceMap = new Map(resources.map(r => [r.id, r]));
    
    return results.map(result => ({
      id: result.id,
      score: result.score,
      resource: resourceMap.get(result.id),
    }));
  }

  /**
   * Track search queries for analytics
   */
  private async trackSearchQuery(
    query: string,
    embedding: number[],
    resultCount: number
  ): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO "SearchQuery" 
      (id, query, embedding, "resultCount", "searchDuration", "createdAt")
      VALUES (
        ${crypto.randomUUID()},
        ${query},
        ${embedding}::vector,
        ${resultCount},
        0,
        NOW()
      )
    `;
  }

  /**
   * Batch update embeddings for all resources
   */
  async updateAllEmbeddings(batchSize: number = 10): Promise<void> {
    const totalResources = await this.prisma.resource.count();
    console.log(`Updating embeddings for ${totalResources} resources...`);

    let offset = 0;
    let processed = 0;

    while (offset < totalResources) {
      const resources = await this.prisma.resource.findMany({
        skip: offset,
        take: batchSize,
        select: { id: true },
      });

      // Process batch in parallel
      await Promise.all(
        resources.map(async (resource) => {
          try {
            await this.updateResourceEmbedding(resource.id);
            processed++;
            console.log(`Progress: ${processed}/${totalResources}`);
          } catch (error) {
            console.error(`Failed to update embedding for ${resource.id}:`, error);
          }
        })
      );

      offset += batchSize;

      // Rate limit to avoid hitting OpenAI limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Completed updating ${processed} embeddings`);
  }

  /**
   * Get popular search queries
   */
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    const queries = await this.prisma.$queryRaw<any[]>`
      SELECT query, COUNT(*) as count
      FROM "SearchQuery"
      WHERE "createdAt" > NOW() - INTERVAL '7 days'
      GROUP BY query
      ORDER BY count DESC
      LIMIT ${limit}
    `;

    return queries.map(q => q.query);
  }
}