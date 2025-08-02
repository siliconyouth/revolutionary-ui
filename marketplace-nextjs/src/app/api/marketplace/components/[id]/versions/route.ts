import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get all versions
    const versions = await prisma.componentVersion.findMany({
      where: { componentId: params.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        componentId: true,
        version: true,
        changelog: true,
        componentData: true,
        createdAt: true
      }
    });

    // Transform data
    const transformedVersions = versions.map(version => ({
      id: version.id,
      componentId: version.componentId,
      version: version.version,
      changelog: version.changelog,
      component: version.componentData,
      createdAt: version.createdAt.toISOString()
    }));

    return NextResponse.json(transformedVersions);
  } catch (error) {
    console.error('Failed to fetch versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}