/**
 * Enhanced Resource Service with R2 Storage Integration
 * Manages resources with automatic R2 storage for code and documentation
 */

import { PrismaClient, Resource, StorageObject, Prisma } from '@prisma/client'
import { R2StorageService, StorageType, UploadOptions } from './r2-storage-service'
import { config } from '@dotenvx/dotenvx'
import { join } from 'path'

// Load environment variables
config({ path: join(__dirname, '../../.env.local') })

export interface CreateResourceInput {
  name: string
  slug: string
  description: string
  longDescription?: string
  categoryId: string
  resourceTypeId: string
  authorId: string
  sourceCode?: string
  documentation?: string
  frameworks?: string[]
  license?: string
  githubUrl?: string
  npmPackage?: string
  demoUrl?: string
  price?: number
  tags?: string[]
}

export interface UpdateResourceInput extends Partial<CreateResourceInput> {
  id: string
}

export interface ResourceWithStorage extends Resource {
  codeStorage?: StorageObject | null
  docsStorage?: StorageObject | null
  storageObjects?: StorageObject[]
}

export class EnhancedResourceService {
  private prisma: PrismaClient
  private r2Service: R2StorageService
  private static instance: EnhancedResourceService

  private constructor() {
    this.prisma = new PrismaClient()
    
    // Initialize R2 service if configured
    if (this.isR2Configured()) {
      this.r2Service = R2StorageService.getInstance({
        accountId: process.env.R2_ACCOUNT_ID!,
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        bucketName: process.env.R2_BUCKET_NAME!,
        publicUrl: process.env.R2_PUBLIC_URL,
      })
    }
  }

  static getInstance(): EnhancedResourceService {
    if (!EnhancedResourceService.instance) {
      EnhancedResourceService.instance = new EnhancedResourceService()
    }
    return EnhancedResourceService.instance
  }

  private isR2Configured(): boolean {
    return !!(
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME
    )
  }

  /**
   * Create a new resource with automatic R2 storage
   */
  async createResource(input: CreateResourceInput): Promise<ResourceWithStorage> {
    const { sourceCode, documentation, tags, ...resourceData } = input

    // Start a transaction
    return await this.prisma.$transaction(async (tx) => {
      // Create the resource
      const resource = await tx.resource.create({
        data: {
          ...resourceData,
          sourceCode: !this.isR2Configured() ? sourceCode : undefined,
          documentation: !this.isR2Configured() ? documentation : undefined,
        },
      })

      let codeStorageId: string | undefined
      let docsStorageId: string | undefined

      // Upload to R2 if configured
      if (this.isR2Configured()) {
        // Upload source code
        if (sourceCode) {
          const codeKey = this.r2Service.generateResourceKey(
            resource.id,
            'code',
            `${resource.slug}.tsx`
          )
          
          const codeLocation = await this.r2Service.upload(codeKey, sourceCode, {
            contentType: 'text/typescript',
            metadata: {
              resourceId: resource.id,
              resourceName: resource.name,
              type: 'source_code',
            },
          })

          const codeStorage = await tx.storageObject.create({
            data: {
              bucket: codeLocation.bucket,
              key: codeLocation.key,
              url: codeLocation.url,
              publicUrl: codeLocation.url,
              size: codeLocation.size,
              contentType: codeLocation.contentType,
              etag: codeLocation.etag,
              storageType: StorageType.SOURCE_CODE,
              resourceId: resource.id,
            },
          })

          codeStorageId = codeStorage.id
        }

        // Upload documentation
        if (documentation) {
          const docsKey = this.r2Service.generateResourceKey(
            resource.id,
            'docs',
            'README.md'
          )
          
          const docsLocation = await this.r2Service.upload(docsKey, documentation, {
            contentType: 'text/markdown',
            metadata: {
              resourceId: resource.id,
              resourceName: resource.name,
              type: 'documentation',
            },
          })

          const docsStorage = await tx.storageObject.create({
            data: {
              bucket: docsLocation.bucket,
              key: docsLocation.key,
              url: docsLocation.url,
              publicUrl: docsLocation.url,
              size: docsLocation.size,
              contentType: docsLocation.contentType,
              etag: docsLocation.etag,
              storageType: StorageType.DOCUMENTATION,
              resourceId: resource.id,
            },
          })

          docsStorageId = docsStorage.id
        }

        // Update resource with storage IDs
        if (codeStorageId || docsStorageId) {
          await tx.resource.update({
            where: { id: resource.id },
            data: {
              codeStorageId,
              docsStorageId,
            },
          })
        }
      }

      // Add tags if provided
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          const tag = await tx.tag.upsert({
            where: { name: tagName },
            create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') },
            update: {},
          })

          await tx.resource.update({
            where: { id: resource.id },
            data: {
              tags: {
                connect: { id: tag.id },
              },
            },
          })
        }
      }

      // Return the complete resource with storage
      return await tx.resource.findUnique({
        where: { id: resource.id },
        include: {
          codeStorage: true,
          docsStorage: true,
          storageObjects: true,
        },
      })
    })
  }

  /**
   * Update a resource with automatic R2 storage updates
   */
  async updateResource(input: UpdateResourceInput): Promise<ResourceWithStorage> {
    const { id, sourceCode, documentation, tags, ...updateData } = input

    return await this.prisma.$transaction(async (tx) => {
      // Get existing resource
      const existing = await tx.resource.findUnique({
        where: { id },
        include: {
          codeStorage: true,
          docsStorage: true,
        },
      })

      if (!existing) {
        throw new Error(`Resource ${id} not found`)
      }

      let codeStorageId = existing.codeStorageId
      let docsStorageId = existing.docsStorageId

      // Handle R2 updates if configured
      if (this.isR2Configured()) {
        // Update source code
        if (sourceCode !== undefined) {
          if (sourceCode) {
            // Upload new/updated code
            const codeKey = this.r2Service.generateResourceKey(
              id,
              'code',
              `${existing.slug}.tsx`
            )
            
            const codeLocation = await this.r2Service.upload(codeKey, sourceCode, {
              contentType: 'text/typescript',
              metadata: {
                resourceId: id,
                resourceName: existing.name,
                type: 'source_code',
                updatedAt: new Date().toISOString(),
              },
            })

            if (existing.codeStorage) {
              // Update existing storage record
              await tx.storageObject.update({
                where: { id: existing.codeStorage.id },
                data: {
                  size: codeLocation.size,
                  etag: codeLocation.etag,
                  contentHash: codeLocation.etag,
                  lastAccessed: new Date(),
                },
              })
            } else {
              // Create new storage record
              const codeStorage = await tx.storageObject.create({
                data: {
                  bucket: codeLocation.bucket,
                  key: codeLocation.key,
                  url: codeLocation.url,
                  publicUrl: codeLocation.url,
                  size: codeLocation.size,
                  contentType: codeLocation.contentType,
                  etag: codeLocation.etag,
                  storageType: StorageType.SOURCE_CODE,
                  resourceId: id,
                },
              })
              codeStorageId = codeStorage.id
            }
          } else {
            // Delete code from R2
            if (existing.codeStorage) {
              await this.r2Service.delete(existing.codeStorage.key)
              await tx.storageObject.delete({
                where: { id: existing.codeStorage.id },
              })
              codeStorageId = null
            }
          }
        }

        // Update documentation
        if (documentation !== undefined) {
          if (documentation) {
            // Upload new/updated docs
            const docsKey = this.r2Service.generateResourceKey(
              id,
              'docs',
              'README.md'
            )
            
            const docsLocation = await this.r2Service.upload(docsKey, documentation, {
              contentType: 'text/markdown',
              metadata: {
                resourceId: id,
                resourceName: existing.name,
                type: 'documentation',
                updatedAt: new Date().toISOString(),
              },
            })

            if (existing.docsStorage) {
              // Update existing storage record
              await tx.storageObject.update({
                where: { id: existing.docsStorage.id },
                data: {
                  size: docsLocation.size,
                  etag: docsLocation.etag,
                  contentHash: docsLocation.etag,
                  lastAccessed: new Date(),
                },
              })
            } else {
              // Create new storage record
              const docsStorage = await tx.storageObject.create({
                data: {
                  bucket: docsLocation.bucket,
                  key: docsLocation.key,
                  url: docsLocation.url,
                  publicUrl: docsLocation.url,
                  size: docsLocation.size,
                  contentType: docsLocation.contentType,
                  etag: docsLocation.etag,
                  storageType: StorageType.DOCUMENTATION,
                  resourceId: id,
                },
              })
              docsStorageId = docsStorage.id
            }
          } else {
            // Delete docs from R2
            if (existing.docsStorage) {
              await this.r2Service.delete(existing.docsStorage.key)
              await tx.storageObject.delete({
                where: { id: existing.docsStorage.id },
              })
              docsStorageId = null
            }
          }
        }
      }

      // Update the resource
      const updated = await tx.resource.update({
        where: { id },
        data: {
          ...updateData,
          sourceCode: !this.isR2Configured() && sourceCode !== undefined ? sourceCode : undefined,
          documentation: !this.isR2Configured() && documentation !== undefined ? documentation : undefined,
          codeStorageId,
          docsStorageId,
          updatedAt: new Date(),
        },
        include: {
          codeStorage: true,
          docsStorage: true,
          storageObjects: true,
        },
      })

      // Update tags if provided
      if (tags !== undefined) {
        // Remove all existing tags
        await tx.resource.update({
          where: { id },
          data: {
            tags: {
              set: [],
            },
          },
        })

        // Add new tags
        for (const tagName of tags) {
          const tag = await tx.tag.upsert({
            where: { name: tagName },
            create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') },
            update: {},
          })

          await tx.resource.update({
            where: { id },
            data: {
              tags: {
                connect: { id: tag.id },
              },
            },
          })
        }
      }

      return updated
    })
  }

  /**
   * Get resource with code and documentation from R2
   */
  async getResourceWithCode(id: string): Promise<ResourceWithStorage & { code?: string; docs?: string }> {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        codeStorage: true,
        docsStorage: true,
        storageObjects: true,
        category: true,
        resourceType: true,
        tags: true,
      },
    })

    if (!resource) {
      throw new Error(`Resource ${id} not found`)
    }

    let code: string | undefined
    let docs: string | undefined

    if (this.isR2Configured()) {
      // Fetch from R2
      if (resource.codeStorage) {
        try {
          code = await this.r2Service.downloadString(resource.codeStorage.key)
        } catch (error) {
          console.error('Error fetching code from R2:', error)
        }
      }

      if (resource.docsStorage) {
        try {
          docs = await this.r2Service.downloadString(resource.docsStorage.key)
        } catch (error) {
          console.error('Error fetching docs from R2:', error)
        }
      }
    } else {
      // Use database fields
      code = resource.sourceCode || undefined
      docs = resource.documentation || undefined
    }

    return {
      ...resource,
      code,
      docs,
    }
  }

  /**
   * Upload additional assets for a resource
   */
  async uploadResourceAsset(
    resourceId: string,
    filename: string,
    content: Buffer | string,
    options: UploadOptions = {}
  ): Promise<StorageObject> {
    if (!this.isR2Configured()) {
      throw new Error('R2 storage is not configured')
    }

    const key = this.r2Service.generateResourceKey(resourceId, 'asset', filename)
    const location = await this.r2Service.upload(key, content, options)

    const storageObject = await this.prisma.storageObject.create({
      data: {
        bucket: location.bucket,
        key: location.key,
        url: location.url,
        publicUrl: location.url,
        size: location.size,
        contentType: location.contentType,
        etag: location.etag,
        storageType: StorageType.ASSET,
        resourceId,
        metadata: {
          filename,
          uploadedAt: new Date().toISOString(),
        },
      },
    })

    return storageObject
  }

  /**
   * Get all resources with optional filters
   */
  async getResources(options: {
    categoryId?: string
    resourceTypeId?: string
    frameworks?: string[]
    isPublished?: boolean
    isFeatured?: boolean
    authorId?: string
    search?: string
    limit?: number
    offset?: number
  } = {}): Promise<{ resources: ResourceWithStorage[]; total: number }> {
    const where: Prisma.ResourceWhereInput = {}

    if (options.categoryId) where.categoryId = options.categoryId
    if (options.resourceTypeId) where.resourceTypeId = options.resourceTypeId
    if (options.frameworks) where.frameworks = { hasSome: options.frameworks }
    if (options.isPublished !== undefined) where.isPublished = options.isPublished
    if (options.isFeatured !== undefined) where.isFeatured = options.isFeatured
    if (options.authorId) where.authorId = options.authorId
    
    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
        { tags: { some: { name: { contains: options.search, mode: 'insensitive' } } } },
      ]
    }

    const [resources, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        include: {
          codeStorage: true,
          docsStorage: true,
          storageObjects: true,
          category: true,
          resourceType: true,
          tags: true,
        },
        take: options.limit || 20,
        skip: options.offset || 0,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.resource.count({ where }),
    ])

    return { resources, total }
  }

  /**
   * Delete a resource and its R2 storage
   */
  async deleteResource(id: string): Promise<void> {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        storageObjects: true,
      },
    })

    if (!resource) {
      throw new Error(`Resource ${id} not found`)
    }

    // Delete from R2 if configured
    if (this.isR2Configured() && resource.storageObjects.length > 0) {
      const keys = resource.storageObjects.map(obj => obj.key)
      await this.r2Service.batchDelete(keys)
    }

    // Delete from database (cascade will handle storage objects)
    await this.prisma.resource.delete({
      where: { id },
    })
  }

  /**
   * Generate presigned URLs for resource assets
   */
  async getResourcePresignedUrls(
    resourceId: string,
    expiresIn: number = 3600
  ): Promise<{ code?: string; docs?: string; assets: Record<string, string> }> {
    if (!this.isR2Configured()) {
      throw new Error('R2 storage is not configured')
    }

    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        codeStorage: true,
        docsStorage: true,
        storageObjects: {
          where: { storageType: StorageType.ASSET },
        },
      },
    })

    if (!resource) {
      throw new Error(`Resource ${resourceId} not found`)
    }

    const urls: { code?: string; docs?: string; assets: Record<string, string> } = {
      assets: {},
    }

    if (resource.codeStorage) {
      urls.code = await this.r2Service.getPresignedUrl(resource.codeStorage.key, { expiresIn })
    }

    if (resource.docsStorage) {
      urls.docs = await this.r2Service.getPresignedUrl(resource.docsStorage.key, { expiresIn })
    }

    for (const asset of resource.storageObjects) {
      const filename = asset.metadata?.filename || asset.key.split('/').pop() || asset.key
      urls.assets[filename] = await this.r2Service.getPresignedUrl(asset.key, { expiresIn })
    }

    return urls
  }
}