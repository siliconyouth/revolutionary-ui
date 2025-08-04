import { NextRequest, NextResponse } from 'next/server'
import { EnhancedResourceService } from '../../../../src/services/enhanced-resource-service'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const resourceService = EnhancedResourceService.getInstance()
    
    // Get resources with optional filters
    const result = await resourceService.getResources({
      categoryId: searchParams.get('categoryId') || undefined,
      resourceTypeId: searchParams.get('resourceTypeId') || undefined,
      frameworks: searchParams.get('frameworks')?.split(',') || undefined,
      isPublished: searchParams.get('published') === 'true' ? true : 
                   searchParams.get('published') === 'false' ? false : undefined,
      isFeatured: searchParams.get('featured') === 'true' ? true : undefined,
      authorId: searchParams.get('authorId') || undefined,
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to get resources:', error)
    return NextResponse.json(
      { error: 'Failed to get resources' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const resourceService = EnhancedResourceService.getInstance()
    
    // Create resource with R2 storage
    const resource = await resourceService.createResource(body)
    
    return NextResponse.json(resource)
  } catch (error) {
    console.error('Failed to create resource:', error)
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}