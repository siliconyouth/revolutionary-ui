import { NextRequest, NextResponse } from 'next/server'
import { EnhancedResourceService } from '../../../../../../src/services/enhanced-resource-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const resourceService = EnhancedResourceService.getInstance()
    
    // Get resource
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
      include: { 
        category: true,
        resourceType: true
      }
    })
    
    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }
    
    // Check if resource is premium and user has access
    if (resource.price > 0) {
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      // Check if user has purchased the resource
      const purchase = await prisma.purchase.findUnique({
        where: {
          userId_resourceId: {
            userId: session.user.id,
            resourceId: params.id
          }
        }
      })
      
      if (!purchase) {
        return NextResponse.json(
          { error: 'Purchase required' },
          { status: 402 }
        )
      }
    }
    
    // Track download
    if (session?.user?.id) {
      await prisma.download.create({
        data: {
          resourceId: params.id,
          userId: session.user.id,
          downloadType: 'CODE'
        }
      })
      
      // Update resource download count
      await prisma.resource.update({
        where: { id: params.id },
        data: {
          weeklyDownloads: { increment: 1 }
        }
      })
    }
    
    // Get presigned URLs for R2 storage
    const urls = await resourceService.getResourcePresignedUrls(params.id, 3600) // 1 hour
    
    // Get resource with code (for fallback)
    const resourceWithCode = await resourceService.getResourceWithCode(params.id)
    
    return NextResponse.json({
      resource: {
        id: resource.id,
        name: resource.name,
        slug: resource.slug,
        description: resource.description,
        category: resource.category.name,
        resourceType: resource.resourceType.name,
        frameworks: resource.frameworks,
        license: resource.license
      },
      download: {
        // Direct download URLs from R2
        codeUrl: urls.code,
        docsUrl: urls.docs,
        assetUrls: urls.assets,
        // Fallback inline content
        sourceCode: !urls.code ? resourceWithCode.code : undefined,
        documentation: !urls.docs ? resourceWithCode.docs : undefined
      }
    })
  } catch (error) {
    console.error('Failed to generate download links:', error)
    return NextResponse.json(
      { error: 'Failed to generate download links' },
      { status: 500 }
    )
  }
}