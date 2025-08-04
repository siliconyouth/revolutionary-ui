import { NextRequest, NextResponse } from 'next/server';
import { R2VersionService } from '@/services/r2-version-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const versionService = R2VersionService.getInstance();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const versions = await versionService.getVersions(params.id);
    
    return NextResponse.json({ versions });
  } catch (error) {
    console.error('Failed to get versions:', error);
    return NextResponse.json(
      { error: 'Failed to get versions' },
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

    const body = await request.json();
    const { sourceCode, documentation, version, changelog } = body;

    if (!sourceCode || !version) {
      return NextResponse.json(
        { error: 'Source code and version are required' },
        { status: 400 }
      );
    }

    const componentVersion = await versionService.createVersion({
      resourceId: params.id,
      sourceCode,
      documentation,
      version,
      changelog,
      author: session.user.email || session.user.id
    });

    return NextResponse.json({ version: componentVersion });
  } catch (error) {
    console.error('Failed to create version:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create version' },
      { status: 500 }
    );
  }
}