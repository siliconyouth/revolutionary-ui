/**
 * R2 Version Service
 * Manages versioned storage of components in R2
 */

import { PrismaClient, StorageObject } from '@prisma/client';
import { R2StorageService, StorageLocation } from './r2-storage-service';
import { createHash } from 'crypto';

export interface ComponentVersion {
  version: string;
  storageId: string;
  createdAt: Date;
  size: number;
  contentHash: string;
  changelog?: string;
}

export interface CreateVersionInput {
  resourceId: string;
  sourceCode: string;
  documentation?: string;
  version: string;
  changelog?: string;
  author?: string;
}

export class R2VersionService {
  private prisma: PrismaClient;
  private r2Service: R2StorageService;
  private static instance: R2VersionService;

  private constructor() {
    this.prisma = new PrismaClient();
    this.r2Service = R2StorageService.getInstance();
  }

  static getInstance(): R2VersionService {
    if (!R2VersionService.instance) {
      R2VersionService.instance = new R2VersionService();
    }
    return R2VersionService.instance;
  }

  /**
   * Create a new version of a component
   */
  async createVersion(input: CreateVersionInput): Promise<ComponentVersion> {
    const { resourceId, sourceCode, documentation, version, changelog, author } = input;

    // Generate content hash to detect duplicates
    const contentHash = this.generateContentHash(sourceCode + (documentation || ''));

    // Check if this exact content already exists
    const existingVersion = await this.prisma.storageObject.findFirst({
      where: {
        resourceId,
        metadata: {
          path: ['contentHash'],
          equals: contentHash
        }
      }
    });

    if (existingVersion) {
      throw new Error('This exact version already exists');
    }

    // Upload to R2 with version in path
    const codeKey = `resources/${resourceId}/versions/${version}/code.tsx`;
    const codeLocation = await this.r2Service.upload(codeKey, sourceCode, {
      contentType: 'text/typescript',
      metadata: {
        resourceId,
        version,
        type: 'source_code',
        author: author || 'unknown',
        contentHash,
        timestamp: new Date().toISOString()
      }
    });

    // Create storage record
    const storageObject = await this.prisma.storageObject.create({
      data: {
        bucket: codeLocation.bucket,
        key: codeLocation.key,
        url: codeLocation.url,
        publicUrl: codeLocation.url,
        size: codeLocation.size || 0,
        contentType: codeLocation.contentType,
        etag: codeLocation.etag,
        contentHash,
        storageType: 'SOURCE_CODE',
        resourceId,
        metadata: {
          version,
          changelog,
          author,
          contentHash,
          isVersion: true
        }
      }
    });

    // If documentation provided, store it too
    if (documentation) {
      const docsKey = `resources/${resourceId}/versions/${version}/docs.md`;
      await this.r2Service.upload(docsKey, documentation, {
        contentType: 'text/markdown',
        metadata: {
          resourceId,
          version,
          type: 'documentation',
          author: author || 'unknown',
          timestamp: new Date().toISOString()
        }
      });
    }

    return {
      version,
      storageId: storageObject.id,
      createdAt: storageObject.uploadedAt,
      size: storageObject.size || 0,
      contentHash,
      changelog
    };
  }

  /**
   * Get all versions of a component
   */
  async getVersions(resourceId: string): Promise<ComponentVersion[]> {
    const versions = await this.prisma.storageObject.findMany({
      where: {
        resourceId,
        metadata: {
          path: ['isVersion'],
          equals: true
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    return versions.map(v => ({
      version: v.metadata?.version as string,
      storageId: v.id,
      createdAt: v.uploadedAt,
      size: v.size || 0,
      contentHash: v.contentHash || '',
      changelog: v.metadata?.changelog as string | undefined
    }));
  }

  /**
   * Get a specific version
   */
  async getVersion(resourceId: string, version: string): Promise<{
    code: string;
    docs?: string;
    metadata: any;
  }> {
    const codeKey = `resources/${resourceId}/versions/${version}/code.tsx`;
    const docsKey = `resources/${resourceId}/versions/${version}/docs.md`;

    const code = await this.r2Service.downloadString(codeKey);
    
    let docs: string | undefined;
    try {
      docs = await this.r2Service.downloadString(docsKey);
    } catch {
      // Documentation is optional
    }

    const storageObject = await this.prisma.storageObject.findFirst({
      where: {
        key: codeKey
      }
    });

    return {
      code,
      docs,
      metadata: storageObject?.metadata || {}
    };
  }

  /**
   * Compare two versions
   */
  async compareVersions(
    resourceId: string,
    versionA: string,
    versionB: string
  ): Promise<{
    versionA: { code: string; metadata: any };
    versionB: { code: string; metadata: any };
    changes: string[];
  }> {
    const [a, b] = await Promise.all([
      this.getVersion(resourceId, versionA),
      this.getVersion(resourceId, versionB)
    ]);

    // Simple line-based diff (you could use a proper diff library)
    const linesA = a.code.split('\n');
    const linesB = b.code.split('\n');
    const changes: string[] = [];

    const maxLines = Math.max(linesA.length, linesB.length);
    for (let i = 0; i < maxLines; i++) {
      if (linesA[i] !== linesB[i]) {
        changes.push(`Line ${i + 1}: Changed`);
      }
    }

    return {
      versionA: { code: a.code, metadata: a.metadata },
      versionB: { code: b.code, metadata: b.metadata },
      changes
    };
  }

  /**
   * Rollback to a specific version
   */
  async rollbackToVersion(resourceId: string, version: string): Promise<void> {
    const versionData = await this.getVersion(resourceId, version);
    
    // Update the main resource code storage
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
      include: { codeStorage: true }
    });

    if (!resource) {
      throw new Error('Resource not found');
    }

    // Upload as current version
    const codeKey = this.r2Service.generateResourceKey(resourceId, 'code', `${resource.slug}.tsx`);
    const location = await this.r2Service.upload(codeKey, versionData.code, {
      contentType: 'text/typescript',
      metadata: {
        resourceId,
        rolledBackFrom: version,
        timestamp: new Date().toISOString()
      }
    });

    // Update storage record
    if (resource.codeStorage) {
      await this.prisma.storageObject.update({
        where: { id: resource.codeStorage.id },
        data: {
          size: location.size,
          etag: location.etag,
          contentHash: this.generateContentHash(versionData.code),
          metadata: {
            ...resource.codeStorage.metadata,
            lastRollback: {
              version,
              timestamp: new Date().toISOString()
            }
          }
        }
      });
    }
  }

  /**
   * Delete old versions (retention policy)
   */
  async cleanupOldVersions(
    resourceId: string,
    keepCount: number = 10,
    keepDays: number = 90
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - keepDays);

    // Get all versions
    const versions = await this.prisma.storageObject.findMany({
      where: {
        resourceId,
        metadata: {
          path: ['isVersion'],
          equals: true
        }
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    // Keep the most recent N versions
    const toDelete = versions
      .slice(keepCount)
      .filter(v => v.uploadedAt < cutoffDate);

    // Delete from R2 and database
    for (const version of toDelete) {
      await this.r2Service.delete(version.key);
      await this.prisma.storageObject.delete({
        where: { id: version.id }
      });
    }

    return toDelete.length;
  }

  private generateContentHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }
}