import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for comment
const commentSchema = z.object({
  comment: z.string().min(1),
  isInternal: z.boolean().optional(),
  commentType: z.enum(['general', 'code_review', 'design_feedback', 'documentation']).optional(),
  lineNumber: z.number().optional(),
  filePath: z.string().optional()
});

// POST /api/admin/submissions/[id]/comments - Add comment to submission
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or moderator for internal comments
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const body = await request.json();
    const validatedData = commentSchema.parse(body);

    // Only admins/moderators can post internal comments
    if (validatedData.isInternal && user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
      return NextResponse.json(
        { error: 'Only administrators can post internal comments' },
        { status: 403 }
      );
    }

    // Check if submission exists
    const submission = await prisma.componentSubmission.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Create comment
    const comment = await prisma.submissionComment.create({
      data: {
        submissionId: params.id,
        userId: session.user.id,
        comment: validatedData.comment,
        commentType: validatedData.commentType?.toUpperCase() || 'GENERAL',
        isInternal: validatedData.isInternal || false,
        lineNumber: validatedData.lineNumber,
        filePath: validatedData.filePath
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    // Transform for frontend
    const transformedComment = {
      ...comment,
      commentType: comment.commentType.toLowerCase()
    };

    // TODO: Send notification to submitter (if not internal)
    if (!validatedData.isInternal && submission.userId !== session.user.id) {
      // await sendCommentNotification(submission.userId, submission.name, comment.comment);
    }

    return NextResponse.json(transformedComment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid comment data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

// GET /api/admin/submissions/[id]/comments - Get submission comments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has access
    const submission = await prisma.componentSubmission.findUnique({
      where: { id: params.id },
      select: { userId: true }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Check if user is admin/moderator or submission owner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdminOrModerator = user?.role === 'ADMIN' || user?.role === 'MODERATOR';
    const isOwner = submission.userId === session.user.id;

    // Build where clause based on access
    const where: any = {
      submissionId: params.id
    };

    // Non-admins can't see internal comments unless they're the owner
    if (!isAdminOrModerator && !isOwner) {
      where.isInternal = false;
    }

    // Fetch comments
    const comments = await prisma.submissionComment.findMany({
      where,
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
    });

    // Transform for frontend
    const transformedComments = comments.map(comment => ({
      ...comment,
      commentType: comment.commentType.toLowerCase()
    }));

    return NextResponse.json({ comments: transformedComments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/submissions/[id]/comments/[commentId] - Update comment (mark as resolved)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { isResolved } = body;

    // Check if comment exists and user has permission
    const comment = await prisma.submissionComment.findUnique({
      where: { id: params.commentId },
      include: {
        submission: {
          select: { userId: true }
        }
      }
    });

    if (!comment || comment.submissionId !== params.id) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user is admin/moderator or comment author
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    const isAdminOrModerator = user?.role === 'ADMIN' || user?.role === 'MODERATOR';
    const isAuthor = comment.userId === session.user.id;
    const isSubmissionOwner = comment.submission.userId === session.user.id;

    if (!isAdminOrModerator && !isAuthor && !isSubmissionOwner) {
      return NextResponse.json(
        { error: 'You do not have permission to update this comment' },
        { status: 403 }
      );
    }

    // Update comment
    const updatedComment = await prisma.submissionComment.update({
      where: { id: params.commentId },
      data: {
        isResolved: isResolved
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}