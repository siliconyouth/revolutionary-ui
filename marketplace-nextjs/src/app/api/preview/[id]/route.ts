import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PreviewUpdateInput } from '@/types/preview';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/preview/[id] - Get a specific preview
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const preview = await prisma.componentPreview.findUnique({
      where: { id: params.id },
      include: {
        resource: {
          select: {
            name: true,
            slug: true,
            category: true,
            resourceType: true
          }
        },
        variations: {
          orderBy: { sortOrder: 'asc' }
        },
        playgroundTemplate: true,
        analytics: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!preview) {
      return NextResponse.json(
        { error: 'Preview not found' },
        { status: 404 }
      );
    }

    // Calculate aggregated analytics
    const analytics = preview.analytics.reduce((acc, day) => ({
      totalViews: acc.totalViews + day.viewCount,
      totalInteractions: acc.totalInteractions + day.interactionCount,
      totalCopies: acc.totalCopies + day.copyCount,
      totalSandboxOpens: acc.totalSandboxOpens + day.sandboxOpens,
      avgLoadTime: day.avgLoadTimeMs || acc.avgLoadTime,
      successRate: day.successRate
    }), {
      totalViews: 0,
      totalInteractions: 0,
      totalCopies: 0,
      totalSandboxOpens: 0,
      avgLoadTime: 0,
      successRate: 100
    });

    return NextResponse.json({
      ...preview,
      aggregatedAnalytics: analytics
    });
  } catch (error) {
    console.error('Error fetching preview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preview' },
      { status: 500 }
    );
  }
}

// PATCH /api/preview/[id] - Update a preview
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const data: PreviewUpdateInput = await request.json();

    const preview = await prisma.componentPreview.update({
      where: { id: params.id },
      data: {
        previewUrl: data.previewUrl,
        exampleCode: data.exampleCode,
        exampleDependencies: data.exampleDependencies,
        isInteractive: data.isInteractive,
        isResponsive: data.isResponsive,
        sandboxConfig: data.sandboxConfig,
        updatedAt: new Date()
      },
      include: {
        resource: true,
        variations: true,
        playgroundTemplate: true
      }
    });

    return NextResponse.json(preview);
  } catch (error) {
    console.error('Error updating preview:', error);
    return NextResponse.json(
      { error: 'Failed to update preview' },
      { status: 500 }
    );
  }
}

// DELETE /api/preview/[id] - Delete a preview
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await prisma.componentPreview.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting preview:', error);
    return NextResponse.json(
      { error: 'Failed to delete preview' },
      { status: 500 }
    );
  }
}