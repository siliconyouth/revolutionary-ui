import { NextRequest, NextResponse } from 'next/server';
import { VectorEmbeddingService } from '@/services/vector-embedding-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { resourceId, batchSize } = body;

    const embeddingService = VectorEmbeddingService.getInstance();

    if (resourceId) {
      // Generate embedding for specific resource
      await embeddingService.updateResourceEmbedding(resourceId);
      
      return NextResponse.json({
        success: true,
        message: `Embedding generated for resource ${resourceId}`,
      });
    } else {
      // Generate embeddings for all resources
      // This should be done in a background job in production
      const promise = embeddingService.updateAllEmbeddings(batchSize || 10);
      
      // Don't wait for completion, return immediately
      promise.catch(error => {
        console.error('Background embedding generation failed:', error);
      });

      return NextResponse.json({
        success: true,
        message: 'Embedding generation started in background',
        note: 'Check logs for progress',
      });
    }
  } catch (error) {
    console.error('Failed to generate embeddings:', error);
    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}