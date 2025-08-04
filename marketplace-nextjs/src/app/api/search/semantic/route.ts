import { NextRequest, NextResponse } from 'next/server';
import { LocalVectorService } from '@/services/simple-vector-service';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().min(1).max(50).optional().default(10),
  threshold: z.number().min(0).max(1).optional().default(0.7),
  filters: z.object({
    framework: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = searchSchema.parse(body);
    
    // Get embedding service
    const embeddingService = LocalVectorService.getInstance();
    
    // Perform semantic search
    const results = await embeddingService.searchSimilar(
      validatedData.query,
      {
        limit: validatedData.limit,
        threshold: validatedData.threshold,
        filters: validatedData.filters,
      }
    );
    
    // Format response
    const response = {
      query: validatedData.query,
      results: results.map(result => ({
        id: result.id,
        score: result.score,
        resource: result.resource ? {
          id: result.resource.id,
          name: result.resource.name,
          slug: result.resource.slug,
          description: result.resource.description,
          framework: result.resource.frameworks?.[0], // frameworks is a string array
          category: result.resource.category?.name,
          tags: result.resource.tags.map((t: any) => t.name),
          author: {
            name: result.resource.author.name,
            image: result.resource.author.image,
          },
          downloads: result.resource._count.downloads,
          reviews: result.resource._count.reviews,
          createdAt: result.resource.createdAt,
          updatedAt: result.resource.updatedAt,
        } : null,
      })),
      totalResults: results.length,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Semantic search error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Search failed', message: error.message },
      { status: 500 }
    );
  }
}

// Get popular searches
export async function GET(request: NextRequest) {
  try {
    const embeddingService = LocalVectorService.getInstance();
    const popularSearches = await embeddingService.getPopularSearches();
    
    return NextResponse.json({
      popularSearches,
    });
  } catch (error) {
    console.error('Failed to get popular searches:', error);
    return NextResponse.json(
      { error: 'Failed to get popular searches' },
      { status: 500 }
    );
  }
}