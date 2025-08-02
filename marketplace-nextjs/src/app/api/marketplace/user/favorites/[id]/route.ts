import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
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

    // Check if component exists
    const component = await prisma.marketplaceComponent.findUnique({
      where: { id: params.id },
      select: { id: true }
    });

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    // Add to favorites
    await prisma.componentFavorite.create({
      data: {
        userId: session.user.id,
        componentId: params.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle unique constraint violation (already favorited)
    if ((error as any).code === 'P2002') {
      return NextResponse.json(
        { error: 'Already in favorites' },
        { status: 409 }
      );
    }

    console.error('Failed to add to favorites:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
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

    // Remove from favorites
    await prisma.componentFavorite.delete({
      where: {
        userId_componentId: {
          userId: session.user.id,
          componentId: params.id
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove from favorites:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}