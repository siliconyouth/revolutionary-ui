import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortField = searchParams.get('sortField') || 'downloads';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const framework = searchParams.get('framework');
    const styling = searchParams.get('styling');
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const premium = searchParams.get('premium');
    const author = searchParams.get('author');
    const minRating = parseFloat(searchParams.get('rating') || '0');

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }
    
    if (category) where.category = category;
    if (framework) where.framework = { has: framework };
    if (styling) where.styling = { has: styling };
    if (author) where.authorId = author;
    if (premium !== null) where.premium = premium === 'true';
    
    where.price = { gte: minPrice, lte: maxPrice };
    where.rating = { gte: minRating };
    where.published = true;

    // Get total count
    const total = await prisma.marketplaceComponent.count({ where });

    // Get components with pagination
    const components = await prisma.marketplaceComponent.findMany({
      where,
      orderBy: {
        [sortField]: sortDirection
      },
      skip: (page - 1) * limit,
      take: limit,
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
    const transformedComponents = components.map(component => ({
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

    return NextResponse.json({
      components: transformedComponents,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Failed to fetch components:', error);
    return NextResponse.json(
      { error: 'Failed to fetch components' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { component, ...publishOptions } = data;

    // Create marketplace component
    const marketplaceComponent = await prisma.marketplaceComponent.create({
      data: {
        name: publishOptions.name,
        description: publishOptions.description,
        category: publishOptions.category,
        tags: publishOptions.tags,
        version: publishOptions.version,
        price: publishOptions.price,
        premium: publishOptions.price > 0,
        framework: publishOptions.framework,
        styling: publishOptions.styling,
        license: publishOptions.license,
        documentation: publishOptions.documentation,
        demoUrl: publishOptions.demoUrl,
        componentData: component,
        authorId: session.user.id,
        published: true,
        responsive: true,
        accessibility: true,
        downloads: 0,
        rating: 0
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Return transformed component
    return NextResponse.json({
      id: marketplaceComponent.id,
      name: marketplaceComponent.name,
      description: marketplaceComponent.description,
      category: marketplaceComponent.category,
      tags: marketplaceComponent.tags,
      author: {
        id: marketplaceComponent.author.id,
        name: marketplaceComponent.author.name || 'Anonymous',
        avatar: marketplaceComponent.author.image
      },
      version: marketplaceComponent.version,
      downloads: marketplaceComponent.downloads,
      rating: marketplaceComponent.rating,
      reviews: 0,
      price: marketplaceComponent.price,
      premium: marketplaceComponent.premium,
      framework: marketplaceComponent.framework,
      styling: marketplaceComponent.styling,
      responsive: marketplaceComponent.responsive,
      accessibility: marketplaceComponent.accessibility,
      thumbnail: marketplaceComponent.thumbnail,
      preview: marketplaceComponent.preview,
      component: marketplaceComponent.componentData,
      dependencies: marketplaceComponent.dependencies,
      createdAt: marketplaceComponent.createdAt.toISOString(),
      updatedAt: marketplaceComponent.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Failed to publish component:', error);
    return NextResponse.json(
      { error: 'Failed to publish component' },
      { status: 500 }
    );
  }
}