/**
 * Cloudflare R2 Storage Service
 * Manages component code and resource files in R2 object storage
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
  PutObjectCommandInput,
  GetObjectCommandInput,
  DeleteObjectCommandInput,
  HeadObjectCommandInput,
  ListObjectsV2CommandInput,
  CopyObjectCommandInput,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Readable } from 'stream'
import { createHash } from 'crypto'

export interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicUrl?: string
}

export interface StorageLocation {
  bucket: string
  key: string
  url: string
  size?: number
  contentType?: string
  etag?: string
  lastModified?: Date
}

export interface UploadOptions {
  contentType?: string
  metadata?: Record<string, string>
  cacheControl?: string
  contentEncoding?: string
}

export interface PresignedUrlOptions {
  expiresIn?: number // seconds, default 3600 (1 hour)
  responseContentType?: string
  responseContentDisposition?: string
}

export class R2StorageService {
  private static instance: R2StorageService
  private client: S3Client
  private config: R2Config

  private constructor(config: R2Config) {
    this.config = config
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    })
  }

  static getInstance(config?: R2Config): R2StorageService {
    if (!R2StorageService.instance) {
      if (!config) {
        throw new Error('R2StorageService requires configuration on first initialization')
      }
      R2StorageService.instance = new R2StorageService(config)
    }
    return R2StorageService.instance
  }

  /**
   * Generate a storage key for a resource
   */
  generateResourceKey(resourceId: string, type: 'code' | 'docs' | 'preview' | 'asset', filename: string): string {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    return `resources/${resourceId}/${type}/${sanitizedFilename}`
  }

  /**
   * Generate a storage key for a component submission
   */
  generateSubmissionKey(submissionId: string, type: 'code' | 'docs' | 'preview', filename: string): string {
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    return `submissions/${submissionId}/${type}/${sanitizedFilename}`
  }

  /**
   * Generate a content hash for deduplication
   */
  private generateContentHash(content: string | Buffer): string {
    return createHash('sha256').update(content).digest('hex')
  }

  /**
   * Upload content to R2
   */
  async upload(
    key: string,
    content: string | Buffer | Readable,
    options: UploadOptions = {}
  ): Promise<StorageLocation> {
    try {
      const contentBuffer = content instanceof Buffer 
        ? content 
        : typeof content === 'string' 
          ? Buffer.from(content, 'utf-8')
          : await this.streamToBuffer(content as Readable)

      const contentHash = this.generateContentHash(contentBuffer)
      
      const params: PutObjectCommandInput = {
        Bucket: this.config.bucketName,
        Key: key,
        Body: contentBuffer,
        ContentType: options.contentType || 'text/plain',
        CacheControl: options.cacheControl || 'public, max-age=31536000',
        ContentEncoding: options.contentEncoding,
        Metadata: {
          ...options.metadata,
          contentHash,
          uploadedAt: new Date().toISOString(),
        },
      }

      const command = new PutObjectCommand(params)
      const response = await this.client.send(command)

      const location: StorageLocation = {
        bucket: this.config.bucketName,
        key,
        url: this.getPublicUrl(key),
        size: contentBuffer.length,
        contentType: options.contentType || 'text/plain',
        etag: response.ETag,
        lastModified: new Date(),
      }

      return location
    } catch (error) {
      console.error('Error uploading to R2:', error)
      throw new Error(`Failed to upload to R2: ${error.message}`)
    }
  }

  /**
   * Upload JSON data
   */
  async uploadJson(key: string, data: any, options: UploadOptions = {}): Promise<StorageLocation> {
    const content = JSON.stringify(data, null, 2)
    return this.upload(key, content, {
      ...options,
      contentType: 'application/json',
    })
  }

  /**
   * Download content from R2
   */
  async download(key: string): Promise<{ content: Buffer; metadata: Record<string, string> }> {
    try {
      const params: GetObjectCommandInput = {
        Bucket: this.config.bucketName,
        Key: key,
      }

      const command = new GetObjectCommand(params)
      const response = await this.client.send(command)

      if (!response.Body) {
        throw new Error('No content found')
      }

      const content = await this.streamToBuffer(response.Body as Readable)
      
      return {
        content,
        metadata: response.Metadata || {},
      }
    } catch (error) {
      console.error('Error downloading from R2:', error)
      throw new Error(`Failed to download from R2: ${error.message}`)
    }
  }

  /**
   * Download JSON data
   */
  async downloadJson<T = any>(key: string): Promise<T> {
    const { content } = await this.download(key)
    return JSON.parse(content.toString('utf-8'))
  }

  /**
   * Download as string
   */
  async downloadString(key: string): Promise<string> {
    const { content } = await this.download(key)
    return content.toString('utf-8')
  }

  /**
   * Check if object exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const params: HeadObjectCommandInput = {
        Bucket: this.config.bucketName,
        Key: key,
      }

      const command = new HeadObjectCommand(params)
      await this.client.send(command)
      return true
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false
      }
      throw error
    }
  }

  /**
   * Delete object
   */
  async delete(key: string): Promise<void> {
    try {
      const params: DeleteObjectCommandInput = {
        Bucket: this.config.bucketName,
        Key: key,
      }

      const command = new DeleteObjectCommand(params)
      await this.client.send(command)
    } catch (error) {
      console.error('Error deleting from R2:', error)
      throw new Error(`Failed to delete from R2: ${error.message}`)
    }
  }

  /**
   * List objects with prefix
   */
  async list(prefix: string, maxKeys: number = 1000): Promise<StorageLocation[]> {
    try {
      const params: ListObjectsV2CommandInput = {
        Bucket: this.config.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      }

      const command = new ListObjectsV2Command(params)
      const response = await this.client.send(command)

      return (response.Contents || []).map(obj => ({
        bucket: this.config.bucketName,
        key: obj.Key!,
        url: this.getPublicUrl(obj.Key!),
        size: obj.Size,
        etag: obj.ETag,
        lastModified: obj.LastModified,
      }))
    } catch (error) {
      console.error('Error listing from R2:', error)
      throw new Error(`Failed to list from R2: ${error.message}`)
    }
  }

  /**
   * Copy object
   */
  async copy(sourceKey: string, destinationKey: string): Promise<StorageLocation> {
    try {
      const params: CopyObjectCommandInput = {
        Bucket: this.config.bucketName,
        CopySource: `${this.config.bucketName}/${sourceKey}`,
        Key: destinationKey,
      }

      const command = new CopyObjectCommand(params)
      const response = await this.client.send(command)

      return {
        bucket: this.config.bucketName,
        key: destinationKey,
        url: this.getPublicUrl(destinationKey),
        etag: response.CopyObjectResult?.ETag,
        lastModified: new Date(),
      }
    } catch (error) {
      console.error('Error copying in R2:', error)
      throw new Error(`Failed to copy in R2: ${error.message}`)
    }
  }

  /**
   * Generate a presigned URL for temporary access
   */
  async getPresignedUrl(key: string, options: PresignedUrlOptions = {}): Promise<string> {
    try {
      const params: GetObjectCommandInput = {
        Bucket: this.config.bucketName,
        Key: key,
        ResponseContentType: options.responseContentType,
        ResponseContentDisposition: options.responseContentDisposition,
      }

      const command = new GetObjectCommand(params)
      const url = await getSignedUrl(this.client, command, {
        expiresIn: options.expiresIn || 3600, // 1 hour default
      })

      return url
    } catch (error) {
      console.error('Error generating presigned URL:', error)
      throw new Error(`Failed to generate presigned URL: ${error.message}`)
    }
  }

  /**
   * Get public URL for an object
   */
  getPublicUrl(key: string): string {
    if (this.config.publicUrl) {
      return `${this.config.publicUrl}/${key}`
    }
    return `https://${this.config.bucketName}.${this.config.accountId}.r2.cloudflarestorage.com/${key}`
  }

  /**
   * Convert stream to buffer
   */
  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk))
    }
    return Buffer.concat(chunks)
  }

  /**
   * Batch upload multiple files
   */
  async batchUpload(
    uploads: Array<{ key: string; content: string | Buffer; options?: UploadOptions }>
  ): Promise<StorageLocation[]> {
    const results = await Promise.all(
      uploads.map(({ key, content, options }) => this.upload(key, content, options))
    )
    return results
  }

  /**
   * Batch delete multiple files
   */
  async batchDelete(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.delete(key)))
  }
}

export default R2StorageService