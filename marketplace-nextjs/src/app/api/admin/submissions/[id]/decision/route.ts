import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for review decision
const decisionSchema = z.object({
  decision: z.enum(['approve', 'reject', 'request-changes']),
  checklist: z.object({}).passthrough().optional(),
  scores: z.object({
    codeQuality: z.number().min(0).max(100),
    documentation: z.number().min(0).max(100),
    design: z.number().min(0).max(100)
  }).optional(),
  reviewNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  requiredChanges: z.array(z.string()).optional()
});

// POST /api/admin/submissions/[id]/decision - Submit review decision
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
      select: { role: true, name: true, email: true }
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = decisionSchema.parse(body);

    // Validate decision-specific requirements
    if (validatedData.decision === 'reject' && !validatedData.rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    if (validatedData.decision === 'request-changes' && (!validatedData.requiredChanges || validatedData.requiredChanges.length === 0)) {
      return NextResponse.json(
        { error: 'Required changes must be specified' },
        { status: 400 }
      );
    }

    // Check if submission exists
    const submission = await prisma.componentSubmission.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Determine new status based on decision
    let newStatus: string;
    switch (validatedData.decision) {
      case 'approve':
        newStatus = 'APPROVED';
        break;
      case 'reject':
        newStatus = 'REJECTED';
        break;
      case 'request-changes':
        newStatus = 'IN_REVIEW';
        break;
    }

    // Update submission with decision
    const updatedSubmission = await prisma.componentSubmission.update({
      where: { id: params.id },
      data: {
        status: newStatus as any,
        reviewerId: session.user.id,
        reviewNotes: validatedData.reviewNotes,
        rejectionReason: validatedData.decision === 'reject' ? validatedData.rejectionReason : null,
        requiredChanges: validatedData.decision === 'request-changes' ? validatedData.requiredChanges : [],
        codeQualityScore: validatedData.scores?.codeQuality,
        documentationScore: validatedData.scores?.documentation,
        designScore: validatedData.scores?.design,
        reviewCompletedAt: ['approve', 'reject'].includes(validatedData.decision) ? new Date() : null
      }
    });

    // Update checklist if provided
    if (validatedData.checklist) {
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
    }

    // Create a comment documenting the decision
    let commentText = '';
    switch (validatedData.decision) {
      case 'approve':
        commentText = `Submission approved by ${user.name}. ${validatedData.reviewNotes || ''}`;
        break;
      case 'reject':
        commentText = `Submission rejected by ${user.name}. Reason: ${validatedData.rejectionReason}`;
        break;
      case 'request-changes':
        commentText = `Changes requested by ${user.name}. Required changes: ${validatedData.requiredChanges?.join(', ')}`;
        break;
    }

    await prisma.submissionComment.create({
      data: {
        submissionId: params.id,
        userId: session.user.id,
        comment: commentText,
        commentType: 'GENERAL',
        isInternal: false
      }
    });

    // If approved, create the published resource
    if (validatedData.decision === 'approve') {
      // Create resource from submission
      const resource = await prisma.resource.create({
        data: {
          name: submission.name,
          slug: submission.slug || submission.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: submission.description,
          longDescription: submission.longDescription,
          categoryId: submission.categoryId,
          resourceTypeId: submission.resourceTypeId,
          authorId: submission.userId,
          githubUrl: submission.githubUrl,
          npmPackage: submission.npmPackage,
          demoUrl: submission.demoUrl,
          license: submission.license,
          frameworks: submission.frameworks,
          hasTypescript: submission.hasTypescript,
          hasTests: submission.hasTests,
          isResponsive: submission.isResponsive,
          isAccessible: submission.isAccessible,
          supportsDarkMode: submission.supportsDarkMode,
          supportsRtl: submission.supportsRtl,
          bundleSizeKb: submission.bundleSizeKb,
          dependencies: submission.dependencies,
          peerDependencies: submission.peerDependencies,
          devDependencies: submission.devDependencies,
          codeQualityScore: submission.codeQualityScore,
          documentationScore: submission.documentationScore,
          designScore: submission.designScore,
          sourceCode: submission.sourceCode,
          documentation: submission.documentation,
          isPublished: true,
          publishedAt: new Date()
        }
      });

      // Update submission with published resource ID
      await prisma.componentSubmission.update({
        where: { id: params.id },
        data: {
          publishedResourceId: resource.id,
          publishedAt: new Date(),
          status: 'PUBLISHED'
        }
      });

      // TODO: Send approval email to submitter
      // await sendApprovalEmail(submission.user.email, submission.name);
    } else if (validatedData.decision === 'reject') {
      // TODO: Send rejection email to submitter
      // await sendRejectionEmail(submission.user.email, submission.name, validatedData.rejectionReason);
    } else {
      // TODO: Send changes requested email to submitter
      // await sendChangesRequestedEmail(submission.user.email, submission.name, validatedData.requiredChanges);
    }

    return NextResponse.json({ success: true, submission: updatedSubmission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid decision data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error submitting decision:', error);
    return NextResponse.json(
      { error: 'Failed to submit decision' },
      { status: 500 }
    );
  }
}