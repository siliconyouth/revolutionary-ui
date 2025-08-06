/**
 * Documentation Search API
 * Specialized endpoint for searching documentation
 */

import { NextRequest, NextResponse } from 'next/server';
import { AlgoliaSearchService } from '@/services/algolia-search-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const category = searchParams.get('category') || undefined;
    const type = searchParams.get('type') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const searchService = AlgoliaSearchService.getInstance();
    const results = await searchService.searchDocumentation(query, {
      category,
      type: type as any,
      limit,
    });

    // Cache doc search for 10 minutes
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=600');

    return NextResponse.json({ results }, { headers });

  } catch (error) {
    console.error('Documentation search API error:', error);
    return NextResponse.json(
      { error: 'Documentation search failed' },
      { status: 500 }
    );
  }
}