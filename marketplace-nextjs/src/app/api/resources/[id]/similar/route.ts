import { NextRequest, NextResponse } from 'next/server';
import { LocalVectorService } from '@/services/simple-vector-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5');
    
    const embeddingService = LocalVectorService.getInstance();
    const similarComponents = await embeddingService.findSimilarComponents(
      params.id,
      limit
    );
    
    return NextResponse.json({
      resourceId: params.id,
      similar: similarComponents.map(result => ({
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
        } : null,
      })),
    });
  } catch (error) {
    console.error('Failed to find similar components:', error);
    return NextResponse.json(
      { error: 'Failed to find similar components' },
      { status: 500 }
    );
  }
}