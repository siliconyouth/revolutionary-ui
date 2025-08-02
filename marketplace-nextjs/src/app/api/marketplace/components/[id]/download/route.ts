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

    // Get component
    const component = await prisma.marketplaceComponent.findUnique({
      where: {
        id: params.id,
        published: true
      }
    });

    if (!component) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    // Check if it's a premium component
    if (component.premium && component.price > 0) {
      // Check if user has purchased
      const purchase = await prisma.componentPurchase.findUnique({
        where: {
          userId_componentId: {
            userId: session.user.id,
            componentId: params.id
          }
        }
      });

      if (!purchase) {
        return NextResponse.json(
          { error: 'Purchase required' },
          { status: 402 }
        );
      }
    }

    // Increment download count
    await prisma.marketplaceComponent.update({
      where: { id: params.id },
      data: {
        downloads: {
          increment: 1
        }
      }
    });

    // Track download
    await prisma.componentDownload.create({
      data: {
        componentId: params.id,
        userId: session.user.id
      }
    });

    // Return component data with license
    return NextResponse.json({
      component: component.componentData,
      license: component.license
    });
  } catch (error) {
    console.error('Failed to download component:', error);
    return NextResponse.json(
      { error: 'Failed to download component' },
      { status: 500 }
    );
  }
}