import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'week';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    // Get trending components based on recent downloads and activity
    const trending = await prisma.marketplaceComponent.findMany({
      where: {
        published: true,
        downloads: {
          some: {
            createdAt: {
              gte: startDate
            }
          }
        }
      },
      orderBy: [
        {
          downloads: {
            _count: 'desc'
          }
        },
        {
          reviews: {
            _count: 'desc'
          }
        }
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
            reviews: true,
            downloads: {
              where: {
                createdAt: {
                  gte: startDate
                }
              }
            }
          }
        }
      }
    });

    // Transform data
    const transformedComponents = trending.map(component => ({
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
      updatedAt: component.updatedAt.toISOString(),
      trendingDownloads: component._count.downloads
    }));

    return NextResponse.json(transformedComponents);
  } catch (error) {
    console.error('Failed to fetch trending components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending components' },
      { status: 500 }
    );
  }
}