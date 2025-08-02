import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's purchased components
    const purchases = await prisma.componentPurchase.findMany({
      where: { userId: session.user.id },
      select: { componentId: true }
    });

    // Get user's favorite components
    const favorites = await prisma.componentFavorite.findMany({
      where: { userId: session.user.id },
      select: { componentId: true }
    });

    // Get user's published components
    const published = await prisma.marketplaceComponent.findMany({
      where: { 
        authorId: session.user.id,
        published: true
      },
      select: { id: true }
    });

    return NextResponse.json({
      userId: session.user.id,
      purchased: purchases.map(p => p.componentId),
      favorites: favorites.map(f => f.componentId),
      published: published.map(p => p.id)
    });
  } catch (error) {
    console.error('Failed to fetch user library:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user library' },
      { status: 500 }
    );
  }
}