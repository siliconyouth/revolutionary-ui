import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for submission
const submissionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  longDescription: z.string().optional(),
  categoryId: z.string().uuid(),
  resourceTypeId: z.string().uuid(),
  frameworks: z.array(z.string()).min(1),
  sourceCode: z.string().min(1),
  documentation: z.string().optional(),
  demoUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  npmPackage: z.string().optional(),
  dependencies: z.record(z.string()).optional(),
  hasTypescript: z.boolean(),
  hasTests: z.boolean(),
  hasDocumentation: z.boolean(),
  isResponsive: z.boolean(),
  isAccessible: z.boolean(),
  supportsDarkMode: z.boolean(),
  supportsRtl: z.boolean(),
  license: z.string(),
  copyrightOwner: z.string().optional(),
  acceptsTerms: z.boolean(),
  status: z.enum(['draft', 'submitted']),
  submissionDate: z.string().optional(),
  previews: z.array(z.object({
    framework: z.string(),
    code: z.string(),
    dependencies: z.record(z.string()).optional()
  })).optional(),
  attachments: z.array(z.object({
    type: z.enum(['screenshot', 'demo_video', 'documentation']),
    description: z.string().optional()
  })).optional()
});

// GET /api/submissions - Get user's submissions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const submissions = await prisma.componentSubmission.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        category: {
          select: { id: true, name: true }
        },
        resourceType: {
          select: { id: true, name: true }
        },
        previews: true,
        attachments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST /api/submissions - Create new submission
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = submissionSchema.parse(body);

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingSlug = await prisma.componentSubmission.findUnique({
      where: { slug }
    });

    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    // Create submission
    const submission = await prisma.componentSubmission.create({
      data: {
        userId: session.user.id,
        submitterName: session.user.name || 'Anonymous',
        submitterEmail: session.user.email || '',
        name: validatedData.name,
        slug: finalSlug,
        description: validatedData.description,
        longDescription: validatedData.longDescription,
        categoryId: validatedData.categoryId,
        resourceTypeId: validatedData.resourceTypeId,
        frameworks: validatedData.frameworks,
        sourceCode: validatedData.sourceCode,
        documentation: validatedData.documentation,
        demoUrl: validatedData.demoUrl || null,
        githubUrl: validatedData.githubUrl || null,
        npmPackage: validatedData.npmPackage || null,
        dependencies: validatedData.dependencies || {},
        hasTypescript: validatedData.hasTypescript,
        hasTests: validatedData.hasTests,
        hasDocumentation: validatedData.hasDocumentation,
        isResponsive: validatedData.isResponsive,
        isAccessible: validatedData.isAccessible,
        supportsDarkMode: validatedData.supportsDarkMode,
        supportsRtl: validatedData.supportsRtl,
        license: validatedData.license,
        copyrightOwner: validatedData.copyrightOwner,
        acceptsTerms: validatedData.acceptsTerms,
        status: validatedData.status as any,
        submissionDate: validatedData.status === 'submitted' ? new Date() : null
      },
      include: {
        category: true,
        resourceType: true
      }
    });

    // Create previews if provided
    if (validatedData.previews && validatedData.previews.length > 0) {
      await prisma.submissionPreview.createMany({
        data: validatedData.previews.map(preview => ({
          submissionId: submission.id,
          previewType: 'live',
          previewCode: preview.code,
          previewDependencies: preview.dependencies || {},
          framework: preview.framework,
          exampleCode: preview.code,
          exampleProps: {}
        }))
      });
    }

    return NextResponse.json(submission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid submission data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}

// PATCH /api/submissions - Update existing submission
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = submissionSchema.parse(body);

    if (!validatedData.id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Check ownership
    const existing = await prisma.componentSubmission.findUnique({
      where: { id: validatedData.id }
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Submission not found or unauthorized' },
        { status: 404 }
      );
    }

    // Prevent editing published submissions
    if (existing.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Cannot edit published submissions' },
        { status: 400 }
      );
    }

    // Update submission
    const submission = await prisma.componentSubmission.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        longDescription: validatedData.longDescription,
        categoryId: validatedData.categoryId,
        resourceTypeId: validatedData.resourceTypeId,
        frameworks: validatedData.frameworks,
        sourceCode: validatedData.sourceCode,
        documentation: validatedData.documentation,
        demoUrl: validatedData.demoUrl || null,
        githubUrl: validatedData.githubUrl || null,
        npmPackage: validatedData.npmPackage || null,
        dependencies: validatedData.dependencies || {},
        hasTypescript: validatedData.hasTypescript,
        hasTests: validatedData.hasTests,
        hasDocumentation: validatedData.hasDocumentation,
        isResponsive: validatedData.isResponsive,
        isAccessible: validatedData.isAccessible,
        supportsDarkMode: validatedData.supportsDarkMode,
        supportsRtl: validatedData.supportsRtl,
        license: validatedData.license,
        copyrightOwner: validatedData.copyrightOwner,
        acceptsTerms: validatedData.acceptsTerms,
        status: validatedData.status as any,
        submissionDate: validatedData.status === 'submitted' && !existing.submissionDate ? new Date() : existing.submissionDate
      },
      include: {
        category: true,
        resourceType: true,
        previews: true
      }
    });

    // Update previews if provided
    if (validatedData.previews) {
      // Delete existing previews
      await prisma.submissionPreview.deleteMany({
        where: { submissionId: submission.id }
      });

      // Create new previews
      if (validatedData.previews.length > 0) {
        await prisma.submissionPreview.createMany({
          data: validatedData.previews.map(preview => ({
            submissionId: submission.id,
            previewType: 'live',
            previewCode: preview.code,
            previewDependencies: preview.dependencies || {},
            framework: preview.framework,
            exampleCode: preview.code,
            exampleProps: {}
          }))
        });
      }
    }

    return NextResponse.json(submission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid submission data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}