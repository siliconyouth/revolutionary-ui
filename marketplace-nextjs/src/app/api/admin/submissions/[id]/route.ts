import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/submissions/[id] - Get submission details for review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch submission with all related data
    const submission = await prisma.componentSubmission.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        resourceType: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        previews: true,
        attachments: true,
        checklist: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        versions: {
          orderBy: {
            versionNumber: 'desc'
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Transform data for frontend
    const transformedSubmission = {
      ...submission,
      status: submission.status.toLowerCase(),
      comments: submission.comments.map(comment => ({
        ...comment,
        commentType: comment.commentType.toLowerCase()
      }))
    };

    return NextResponse.json(transformedSubmission);
  } catch (error) {
    console.error('Error fetching submission details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission details' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/submissions/[id] - Update submission status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { status, reviewerId } = body;

    // Validate status
    const validStatuses = ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update submission
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      
      // Set timestamps based on status changes
      if (status === 'IN_REVIEW' && !updateData.reviewStartedAt) {
        updateData.reviewStartedAt = new Date();
        updateData.reviewerId = session.user.id;
      }
      
      if (['APPROVED', 'REJECTED'].includes(status)) {
        updateData.reviewCompletedAt = new Date();
      }
      
      if (status === 'PUBLISHED') {
        updateData.publishedAt = new Date();
      }
    }
    
    if (reviewerId !== undefined) {
      updateData.reviewerId = reviewerId;
    }

    const submission = await prisma.componentSubmission.update({
      where: { id: params.id },
      data: updateData,
      include: {
        category: true,
        resourceType: true,
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}