/**
 * Unified Search API
 * 
 * Combines Algolia, Upstash Vector, and database search
 * with Redis caching for optimal performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { AlgoliaSearchService } from '@/services/algolia-search-service';
import { z } from 'zod';

// Request validation schema
const searchSchema = z.object({
  query: z.string().min(1).max(200),
  type: z.enum(['all', 'components', 'docs', 'resources']).default('all'),
  searchMode: z.enum(['keyword', 'semantic', 'hybrid']).default('hybrid'),
  filters: z.object({
    framework: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isFree: z.boolean().optional(),
    isPremium: z.boolean().optional(),
    hasTypescript: z.boolean().optional(),
  }).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  page: z.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = {
      query: searchParams.get('q') || searchParams.get('query') || '',
      type: searchParams.get('type') as any || 'all',
      searchMode: searchParams.get('mode') as any || 'hybrid',
      filters: {
        framework: searchParams.get('framework') || undefined,
        category: searchParams.get('category') || undefined,
        tags: searchParams.getAll('tag'),
        isFree: searchParams.get('free') ? searchParams.get('free') === 'true' : undefined,
        isPremium: searchParams.get('premium') ? searchParams.get('premium') === 'true' : undefined,
        hasTypescript: searchParams.get('typescript') ? searchParams.get('typescript') === 'true' : undefined,
      },
      limit: parseInt(searchParams.get('limit') || '20'),
      page: parseInt(searchParams.get('page') || '0'),
    };

    // Validate parameters
    const validated = searchSchema.parse(params);

    // Get search service
    const searchService = AlgoliaSearchService.getInstance();

    // Perform search
    const results = await searchService.search({
      query: validated.query,
      type: validated.type,
      searchMode: validated.searchMode,
      filters: validated.filters,
      limit: validated.limit,
      page: validated.page,
      useCache: true, // Always use cache for API
    });

    // Add response headers for caching
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    headers.set('X-Search-Mode', results.searchMode);
    headers.set('X-Processing-Time', results.processingTime.toString());

    return NextResponse.json(results, { headers });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate parameters
    const validated = searchSchema.parse(body);

    // Get search service
    const searchService = AlgoliaSearchService.getInstance();

    // Perform search
    const results = await searchService.search({
      query: validated.query,
      type: validated.type,
      searchMode: validated.searchMode,
      filters: validated.filters,
      limit: validated.limit,
      page: validated.page,
      useCache: true,
    });

    return NextResponse.json(results);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}