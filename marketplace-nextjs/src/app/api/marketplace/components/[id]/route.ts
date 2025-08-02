import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const component = await prisma.marketplaceComponent.findUnique({
      where: {
        id: params.id,
        published: true
      },
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

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    // Transform data
    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Failed to fetch component:', error);
    return NextResponse.json(
      { error: 'Failed to fetch component' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { component, changelog } = data;

    // Verify ownership
    const existingComponent = await prisma.marketplaceComponent.findUnique({
      where: { id: params.id },
      select: { authorId: true, version: true }
    });

    if (!existingComponent) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    if (existingComponent.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Increment version
    const versionParts = existingComponent.version.split('.');
    const patch = parseInt(versionParts[2]) + 1;
    const newVersion = `${versionParts[0]}.${versionParts[1]}.${patch}`;

    // Create version history entry
    await prisma.componentVersion.create({
      data: {
        componentId: params.id,
        version: newVersion,
        changelog,
        componentData: component
      }
    });

    // Update component
    const updatedComponent = await prisma.marketplaceComponent.update({
      where: { id: params.id },
      data: {
        componentData: component,
        version: newVersion,
        updatedAt: new Date()
      },
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

    // Return transformed component
    return NextResponse.json({
      id: updatedComponent.id,
      name: updatedComponent.name,
      description: updatedComponent.description,
      category: updatedComponent.category,
      tags: updatedComponent.tags,
      author: {
        id: updatedComponent.author.id,
        name: updatedComponent.author.name || 'Anonymous',
        avatar: updatedComponent.author.image
      },
      version: updatedComponent.version,
      downloads: updatedComponent.downloads,
      rating: updatedComponent.rating,
      reviews: updatedComponent._count.reviews,
      price: updatedComponent.price,
      premium: updatedComponent.premium,
      framework: updatedComponent.framework,
      styling: updatedComponent.styling,
      responsive: updatedComponent.responsive,
      accessibility: updatedComponent.accessibility,
      thumbnail: updatedComponent.thumbnail,
      preview: updatedComponent.preview,
      component: updatedComponent.componentData,
      dependencies: updatedComponent.dependencies,
      createdAt: updatedComponent.createdAt.toISOString(),
      updatedAt: updatedComponent.updatedAt.toISOString()
    });
  } catch (error) {
    console.error('Failed to update component:', error);
    return NextResponse.json(
      { error: 'Failed to update component' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify ownership
    const component = await prisma.marketplaceComponent.findUnique({
      where: { id: params.id },
      select: { authorId: true }
    });

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    if (component.authorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Soft delete (unpublish)
    await prisma.marketplaceComponent.update({
      where: { id: params.id },
      data: { published: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete component:', error);
    return NextResponse.json(
      { error: 'Failed to delete component' },
      { status: 500 }
    );
  }
}