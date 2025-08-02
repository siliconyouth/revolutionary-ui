import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get featured components (manually curated or algorithmic)
    const featured = await prisma.marketplaceComponent.findMany({
      where: {
        published: true,
        OR: [
          { featured: true }, // Manually featured
          { 
            AND: [
              { rating: { gte: 4.5 } },
              { downloads: { gte: 100 } },
              { reviews: { some: {} } }
            ]
          }
        ]
      },
      orderBy: [
        { featured: 'desc' },
        { rating: 'desc' },
        { downloads: 'desc' }
      ],
      take: 12,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            reviews: true
          }
        }
      }
    });

    // Transform data
    const transformedComponents = featured.map(component => ({
      id: component.id,
      name: component.name,
      description: component.description,
      category: component.category,
      tags: component.tags,
      author: {
        id: component.author.id,
        name: component.author.name || 'Anonymous',
        avatar: component.author.image
      },
      version: component.version,
      downloads: component.downloads,
      rating: component.rating,
      reviews: component._count.reviews,
      price: component.price,
      premium: component.premium,
      framework: component.framework,
      styling: component.styling,
      responsive: component.responsive,
      accessibility: component.accessibility,
      thumbnail: component.thumbnail,
      preview: component.preview,
      component: component.componentData,
      dependencies: component.dependencies,
      createdAt: component.createdAt.toISOString(),
      updatedAt: component.updatedAt.toISOString()
    }));

    return NextResponse.json(transformedComponents);
  } catch (error) {
    console.error('Failed to fetch featured components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured components' },
      { status: 500 }
    );
  }
}