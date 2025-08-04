import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PreviewCreateInput, PreviewSearchParams } from '@/types/preview';

// GET /api/preview - Search and list previews
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params: PreviewSearchParams = {
      resourceId: searchParams.get('resourceId') || undefined,
      previewType: searchParams.get('previewType') || undefined,
      framework: searchParams.get('framework') || undefined,
      isInteractive: searchParams.get('isInteractive') === 'true',
      hasPlayground: searchParams.get('hasPlayground') === 'true',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const where: any = {};
    
    if (params.resourceId) where.resourceId = params.resourceId;
    if (params.previewType) where.previewType = params.previewType;
    if (params.framework) where.exampleFramework = params.framework;
    if (params.isInteractive !== undefined) where.isInteractive = params.isInteractive;
    
    const previews = await prisma.componentPreview.findMany({
      where,
      include: {
        resource: {
          select: {
            name: true,
            slug: true,
            category: true
          }
        },
        variations: true,
        playgroundTemplate: params.hasPlayground ? {
          select: { id: true }
        } : false
      },
      take: params.limit,
      skip: params.offset,
      orderBy: { createdAt: 'desc' }
    });

    // Filter by hasPlayground if specified
    const filtered = params.hasPlayground 
      ? previews.filter(p => p.playgroundTemplate)
      : previews;

    const total = await prisma.componentPreview.count({ where });

    return NextResponse.json({
      previews: filtered,
      total,
      limit: params.limit,
      offset: params.offset
    });
  } catch (error) {
    console.error('Error fetching previews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch previews' },
      { status: 500 }
    );
  }
}

// POST /api/preview - Create a new preview
export async function POST(request: NextRequest) {
  try {
    const data: PreviewCreateInput = await request.json();

    // Validate required fields
    if (!data.resourceId || !data.previewType || !data.exampleFramework) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if resource exists
    const resource = await prisma.resource.findUnique({
      where: { id: data.resourceId }
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Create preview with optional playground template
    const preview = await prisma.componentPreview.create({
      data: {
        resourceId: data.resourceId,
        previewType: data.previewType,
        exampleFramework: data.exampleFramework,
        exampleCode: data.exampleCode,
        previewUrl: data.previewUrl,
        sandboxTemplate: data.sandboxTemplate,
        playgroundTemplate: data.playgroundTemplate ? {
          create: {
            resourceId: data.resourceId,
            templateName: data.playgroundTemplate.templateName || 'Default Template',
            templateDescription: data.playgroundTemplate.templateDescription,
            baseCode: data.playgroundTemplate.baseCode || data.exampleCode || '',
            baseProps: data.playgroundTemplate.baseProps,
            baseStyles: data.playgroundTemplate.baseStyles,
            editableProps: data.playgroundTemplate.editableProps,
            propControls: data.playgroundTemplate.propControls,
            themeOptions: data.playgroundTemplate.themeOptions,
            requiredPackages: data.playgroundTemplate.requiredPackages,
            cdnLinks: data.playgroundTemplate.cdnLinks
          }
        } : undefined
      },
      include: {
        resource: true,
        playgroundTemplate: true
      }
    });

    return NextResponse.json(preview, { status: 201 });
  } catch (error) {
    console.error('Error creating preview:', error);
    return NextResponse.json(
      { error: 'Failed to create preview' },
      { status: 500 }
    );
  }
}