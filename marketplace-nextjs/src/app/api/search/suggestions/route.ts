/**
 * Search Suggestions API
 * Returns autocomplete suggestions based on query
 */

import { NextRequest, NextResponse } from 'next/server';
import { AlgoliaSearchService } from '@/services/algolia-search-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const searchService = AlgoliaSearchService.getInstance();
    const suggestions = await searchService.getSuggestions(query, limit);

    // Cache suggestions for 5 minutes
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300');

    return NextResponse.json({ suggestions }, { headers });

  } catch (error) {
    console.error('Suggestions API error:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}