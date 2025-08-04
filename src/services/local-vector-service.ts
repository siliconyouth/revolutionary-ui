/**
 * Local Vector Embedding Service
 * Uses local transformer model for embeddings
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export class LocalVectorService {
  private prisma: PrismaClient;
  private model: any;
  private pipeline: any;
  private initialized = false;
  private static instance: LocalVectorService;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  static getInstance(): LocalVectorService {
    if (!LocalVectorService.instance) {
      LocalVectorService.instance = new LocalVectorService();
    }
    return LocalVectorService.instance;
  }

  private async initialize() {
    if (this.initialized) return;
    
    console.log('Initializing local embedding model...');
    const transformers = await import('@xenova/transformers');
    this.pipeline = transformers.pipeline;
    this.model = await this.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    this.initialized = true;
    console.log('Model initialized');
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    await this.initialize();
    
    const output = await this.model(text, {
      pooling: 'mean',
      normalize: true,
    });
    
    const embedding = Array.from(output.data);
    
    // Pad to 1536 dimensions
    while (embedding.length < 1536) {
      embedding.push(0);
    }
    
    return embedding;
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
  ): Promise<any[]> {
    const { limit = 10, threshold = 0.5, filters } = options;

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);
    const embeddingStr = `[${queryEmbedding.join(',')}]`;

    // Build filter conditions
    let filterConditions = '';
    const filterParams: any[] = [];

    if (filters?.framework) {
      filterConditions += ` AND '${filters.framework}' = ANY(r.frameworks)`;
    }

    if (filters?.category) {
      filterConditions += ` AND EXISTS (
        SELECT 1 FROM "categories" c 
        WHERE c.id = r."categoryId" AND c.name = '${filters.category}'
      )`;
    }

    if (filters?.tags && filters.tags.length > 0) {
      filterConditions += ` AND EXISTS (
        SELECT 1 FROM "_ResourceTags" rt
        JOIN "tags" t ON rt."B" = t.id
        WHERE rt."A" = r.id AND t.name = ANY(ARRAY[${filters.tags.map(t => `'${t}'`).join(',')}])
      )`;
    }

    // Perform vector similarity search
    const query = `
      SELECT 
        r.id,
        r.name,
        r.description,
        r.slug,
        r.frameworks,
        r."categoryId",
        r."authorId",
        r."createdAt",
        r."updatedAt",
        1 - (re.embedding <=> '${embeddingStr}'::vector) as score
      FROM "ResourceEmbedding" re
      JOIN "resources" r ON re."resourceId" = r.id
      WHERE 1 - (re.embedding <=> '${embeddingStr}'::vector) > ${threshold}
      ${filterConditions}
      ORDER BY score DESC
      LIMIT ${limit}
    `;

    const results = await this.prisma.$queryRawUnsafe(query);

    // Track search query
    await this.trackSearchQuery(query, queryEmbedding, (results as any[]).length);

    // Load full resource data
    const resourceIds = (results as any[]).map(r => r.id);
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
    
    return (results as any[]).map(result => ({
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
  ): Promise<any[]> {
    // Get the embedding for the resource
    const embeddingResult = await this.prisma.$queryRawUnsafe(`
      SELECT embedding FROM "ResourceEmbedding" 
      WHERE "resourceId" = '${resourceId}'
    `);

    if ((embeddingResult as any[]).length === 0) {
      return [];
    }

    const embedding = (embeddingResult as any[])[0].embedding;

    // Find similar components
    const query = `
      SELECT 
        r.id,
        r.name,
        r.description,
        r.slug,
        1 - (re.embedding <=> $1::vector) as score
      FROM "ResourceEmbedding" re
      JOIN "resources" r ON re."resourceId" = r.id
      WHERE r.id != '${resourceId}'
      ORDER BY score DESC
      LIMIT ${limit}
    `;

    const results = await this.prisma.$queryRawUnsafe(query, embedding);

    // Load full resource data
    const resourceIds = (results as any[]).map(r => r.id);
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
    
    return (results as any[]).map(result => ({
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
    const embeddingStr = `[${embedding.join(',')}]`;
    
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO "SearchQuery" 
      (id, query, embedding, provider, "resultCount", "searchDuration", "createdAt")
      VALUES (
        '${crypto.randomUUID()}',
        '${query.replace(/'/g, "''")}',
        '${embeddingStr}'::vector,
        'local',
        ${resultCount},
        0,
        NOW()
      )
    `);
  }

  /**
   * Get popular search queries
   */
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    const queries = await this.prisma.$queryRawUnsafe(`
      SELECT query, COUNT(*) as count
      FROM "SearchQuery"
      WHERE "createdAt" > NOW() - INTERVAL '7 days'
      GROUP BY query
      ORDER BY count DESC
      LIMIT ${limit}
    `);

    return (queries as any[]).map(q => q.query);
  }
}