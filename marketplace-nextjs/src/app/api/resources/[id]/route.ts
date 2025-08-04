import { NextRequest, NextResponse } from 'next/server'
import { EnhancedResourceService } from '../../../../../src/services/enhanced-resource-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resourceService = EnhancedResourceService.getInstance()
    
    // Get resource with code from R2 or database
    const resource = await resourceService.getResourceWithCode(params.id)
    
    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }
    
    // Return resource data with code and docs
    return NextResponse.json({
      id: resource.id,
      name: resource.name,
      slug: resource.slug,
      description: resource.description,
      category: resource.category,
      resourceType: resource.resourceType,
      frameworks: resource.frameworks,
      sourceCode: resource.code,
      documentation: resource.docs,
      githubUrl: resource.githubUrl,
      npmPackage: resource.npmPackage,
      demoUrl: resource.demoUrl,
      license: resource.license,
      codeStorage: resource.codeStorage ? {
        url: resource.codeStorage.publicUrl || resource.codeStorage.url,
        size: resource.codeStorage.size,
        contentType: resource.codeStorage.contentType
      } : null,
      docsStorage: resource.docsStorage ? {
        url: resource.docsStorage.publicUrl || resource.docsStorage.url,
        size: resource.docsStorage.size,
        contentType: resource.docsStorage.contentType
      } : null
    })
  } catch (error) {
    console.error('Failed to get resource:', error)
    return NextResponse.json(
      { error: 'Failed to get resource' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const resourceService = EnhancedResourceService.getInstance()
    
    // Update resource with R2 storage
    const updated = await resourceService.updateResource({
      id: params.id,
      ...body
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update resource:', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resourceService = EnhancedResourceService.getInstance()
    
    // Delete resource and R2 storage
    await resourceService.deleteResource(params.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete resource:', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}