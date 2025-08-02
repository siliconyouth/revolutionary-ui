import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get total count
    const total = await prisma.componentReview.count({
      where: { componentId: params.id }
    });

    // Get reviews
    const reviews = await prisma.componentReview.findMany({
      where: { componentId: params.id },
      orderBy: [
        { helpful: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Transform data
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      componentId: review.componentId,
      userId: review.user.id,
      userName: review.user.name || 'Anonymous',
      userAvatar: review.user.image,
      rating: review.rating,
      comment: review.comment,
      helpful: review.helpful,
      createdAt: review.createdAt.toISOString()
    }));

    return NextResponse.json({
      reviews: transformedReviews,
      total
    });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

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

    const { rating, comment } = await request.json();

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating' },
        { status: 400 }
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

    // Check if user already reviewed
    const existingReview = await prisma.componentReview.findUnique({
      where: {
        userId_componentId: {
          userId: session.user.id,
          componentId: params.id
        }
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'Already reviewed' },
        { status: 409 }
      );
    }

    // Create review
    const review = await prisma.componentReview.create({
      data: {
        componentId: params.id,
        userId: session.user.id,
        rating,
        comment,
        helpful: 0
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Update component rating
    const allReviews = await prisma.componentReview.findMany({
      where: { componentId: params.id },
      select: { rating: true }
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.marketplaceComponent.update({
      where: { id: params.id },
      data: { rating: avgRating }
    });

    // Return transformed review
    return NextResponse.json({
      id: review.id,
      componentId: review.componentId,
      userId: review.user.id,
      userName: review.user.name || 'Anonymous',
      userAvatar: review.user.image,
      rating: review.rating,
      comment: review.comment,
      helpful: review.helpful,
      createdAt: review.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Failed to create review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}