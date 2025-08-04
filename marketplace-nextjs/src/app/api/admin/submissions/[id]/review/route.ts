import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for review data
const reviewSchema = z.object({
  checklist: z.object({
    codeFollowsStandards: z.boolean().optional(),
    codeIsClean: z.boolean().optional(),
    codeHasComments: z.boolean().optional(),
    noConsoleLogs: z.boolean().optional(),
    noSecurityIssues: z.boolean().optional(),
    readmeExists: z.boolean().optional(),
    apiDocumented: z.boolean().optional(),
    examplesProvided: z.boolean().optional(),
    propsDocumented: z.boolean().optional(),
    testsExist: z.boolean().optional(),
    testsPass: z.boolean().optional(),
    coverageAdequate: z.boolean().optional(),
    responsiveDesign: z.boolean().optional(),
    accessibleMarkup: z.boolean().optional(),
    consistentStyling: z.boolean().optional(),
    licenseAppropriate: z.boolean().optional(),
    noCopyrightIssues: z.boolean().optional(),
    dependenciesLicensed: z.boolean().optional()
  }),
  scores: z.object({
    codeQuality: z.number().min(0).max(100),
    documentation: z.number().min(0).max(100),
    design: z.number().min(0).max(100)
  }),
  reviewNotes: z.string().optional(),
  requiredChanges: z.array(z.string()).optional()
});

// POST /api/admin/submissions/[id]/review - Save review progress
export async function POST(
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
    const validatedData = reviewSchema.parse(body);

    // Check if submission exists
    const submission = await prisma.componentSubmission.findUnique({
      where: { id: params.id },
      select: { id: true, status: true }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Update submission with review data
    await prisma.componentSubmission.update({
      where: { id: params.id },
      data: {
        reviewNotes: validatedData.reviewNotes,
        requiredChanges: validatedData.requiredChanges || [],
        codeQualityScore: validatedData.scores.codeQuality,
        documentationScore: validatedData.scores.documentation,
        designScore: validatedData.scores.design,
        reviewerId: session.user.id,
        status: submission.status === 'SUBMITTED' ? 'IN_REVIEW' : submission.status,
        reviewStartedAt: submission.status === 'SUBMITTED' ? new Date() : undefined
      }
    });

    // Update or create checklist
    const existingChecklist = await prisma.submissionReviewChecklist.findUnique({
      where: { submissionId: params.id }
    });

    if (existingChecklist) {
      await prisma.submissionReviewChecklist.update({
        where: { id: existingChecklist.id },
        data: {
          ...validatedData.checklist,
          reviewerId: session.user.id,
          reviewedAt: new Date()
        }
      });
    } else {
      await prisma.submissionReviewChecklist.create({
        data: {
          submissionId: params.id,
          ...validatedData.checklist,
          reviewerId: session.user.id
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid review data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error saving review:', error);
    return NextResponse.json(
      { error: 'Failed to save review' },
      { status: 500 }
    );
  }
}

// GET /api/admin/submissions/[id]/review - Get review progress
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

    // Get submission review data
    const submission = await prisma.componentSubmission.findUnique({
      where: { id: params.id },
      select: {
        reviewNotes: true,
        requiredChanges: true,
        codeQualityScore: true,
        documentationScore: true,
        designScore: true,
        checklist: true
      }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      reviewNotes: submission.reviewNotes || '',
      requiredChanges: submission.requiredChanges || [],
      scores: {
        codeQuality: submission.codeQualityScore || 80,
        documentation: submission.documentationScore || 70,
        design: submission.designScore || 85
      },
      checklist: submission.checklist || {}
    });
  } catch (error) {
    console.error('Error fetching review data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review data' },
      { status: 500 }
    );
  }
}