import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/submissions - Get submissions for admin review
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const framework = searchParams.get('framework');
    const hasTests = searchParams.get('hasTests') === 'true';
    const hasTypescript = searchParams.get('hasTypescript') === 'true';
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (framework && framework !== 'all') {
      where.frameworks = {
        has: framework
      };
    }

    if (hasTests) {
      where.hasTests = true;
    }

    if (hasTypescript) {
      where.hasTypescript = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { submitterName: { contains: search, mode: 'insensitive' } },
        { submitterEmail: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch submissions
    const submissions = await prisma.componentSubmission.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true }
        },
        resourceType: {
          select: { id: true, name: true }
        },
        reviewer: {
          select: { id: true, name: true }
        },
        _count: {
          select: {
            comments: true,
            attachments: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { submissionDate: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Transform data for frontend
    const transformedSubmissions = submissions.map(sub => ({
      id: sub.id,
      name: sub.name,
      description: sub.description,
      submitterName: sub.submitterName,
      submitterEmail: sub.submitterEmail,
      category: sub.category,
      frameworks: sub.frameworks,
      status: sub.status.toLowerCase(),
      submissionDate: sub.submissionDate,
      hasTypescript: sub.hasTypescript,
      hasTests: sub.hasTests,
      codeQualityScore: sub.codeQualityScore,
      documentationScore: sub.documentationScore,
      designScore: sub.designScore,
      commentCount: sub._count.comments,
      attachmentCount: sub._count.attachments,
      reviewer: sub.reviewer
    }));

    return NextResponse.json({ submissions: transformedSubmissions });
  } catch (error) {
    console.error('Error fetching admin submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// GET /api/admin/submissions/stats - Get submission statistics
export async function GET_STATS(request: NextRequest) {
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

    // Get submission statistics
    const stats = await prisma.componentSubmission.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Get recent submissions
    const recentSubmissions = await prisma.componentSubmission.findMany({
      where: {
        status: 'SUBMITTED'
      },
      take: 5,
      orderBy: {
        submissionDate: 'desc'
      },
      include: {
        category: {
          select: { name: true }
        }
      }
    });

    // Get reviewer workload
    const reviewerWorkload = await prisma.componentSubmission.groupBy({
      by: ['reviewerId'],
      where: {
        status: 'IN_REVIEW',
        reviewerId: {
          not: null
        }
      },
      _count: {
        reviewerId: true
      }
    });

    return NextResponse.json({
      stats,
      recentSubmissions,
      reviewerWorkload
    });
  } catch (error) {
    console.error('Error fetching submission stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}