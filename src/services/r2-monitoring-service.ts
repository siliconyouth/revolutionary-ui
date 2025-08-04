/**
 * R2 Monitoring Service
 * Tracks usage, performance, and analytics for R2 storage
 */

import { PrismaClient } from '@prisma/client';
import { R2StorageService } from './r2-storage-service';
import { S3Client, ListObjectsV2Command, HeadBucketCommand } from '@aws-sdk/client-s3';

export interface StorageMetrics {
  totalObjects: number;
  totalSize: number;
  totalSizeGB: number;
  objectsByType: Record<string, number>;
  sizeByType: Record<string, number>;
  largestObjects: Array<{
    key: string;
    size: number;
    type: string;
  }>;
  oldestObjects: Array<{
    key: string;
    age: number;
    lastModified: Date;
  }>;
}

export interface AccessMetrics {
  totalDownloads: number;
  downloadsByResource: Record<string, number>;
  popularResources: Array<{
    resourceId: string;
    downloads: number;
    lastAccessed: Date;
  }>;
  bandwidthUsedGB: number;
}

export interface HealthStatus {
  bucketAccessible: boolean;
  apiLatency: number;
  errors: string[];
  lastChecked: Date;
}

export class R2MonitoringService {
  private prisma: PrismaClient;
  private r2Service: R2StorageService;
  private s3Client: S3Client;
  private static instance: R2MonitoringService;

  private constructor() {
    this.prisma = new PrismaClient();
    this.r2Service = R2StorageService.getInstance();
    
    const config = {
      accountId: process.env.R2_ACCOUNT_ID!,
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      bucketName: process.env.R2_BUCKET_NAME!,
    };

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  static getInstance(): R2MonitoringService {
    if (!R2MonitoringService.instance) {
      R2MonitoringService.instance = new R2MonitoringService();
    }
    return R2MonitoringService.instance;
  }

  /**
   * Get storage metrics
   */
  async getStorageMetrics(): Promise<StorageMetrics> {
    const metrics: StorageMetrics = {
      totalObjects: 0,
      totalSize: 0,
      totalSizeGB: 0,
      objectsByType: {},
      sizeByType: {},
      largestObjects: [],
      oldestObjects: [],
    };

    try {
      // Get all objects from R2
      let continuationToken: string | undefined;
      const allObjects: any[] = [];

      do {
        const command = new ListObjectsV2Command({
          Bucket: process.env.R2_BUCKET_NAME!,
          ContinuationToken: continuationToken,
          MaxKeys: 1000,
        });

        const response = await this.s3Client.send(command);
        if (response.Contents) {
          allObjects.push(...response.Contents);
        }
        continuationToken = response.NextContinuationToken;
      } while (continuationToken);

      // Calculate metrics
      metrics.totalObjects = allObjects.length;

      for (const obj of allObjects) {
        const size = obj.Size || 0;
        metrics.totalSize += size;

        // Determine type from key
        const type = this.getObjectType(obj.Key);
        metrics.objectsByType[type] = (metrics.objectsByType[type] || 0) + 1;
        metrics.sizeByType[type] = (metrics.sizeByType[type] || 0) + size;

        // Track largest objects
        if (metrics.largestObjects.length < 10 || size > metrics.largestObjects[9].size) {
          metrics.largestObjects.push({
            key: obj.Key,
            size,
            type,
          });
          metrics.largestObjects.sort((a, b) => b.size - a.size);
          metrics.largestObjects = metrics.largestObjects.slice(0, 10);
        }

        // Track oldest objects
        if (obj.LastModified) {
          const age = Date.now() - obj.LastModified.getTime();
          if (metrics.oldestObjects.length < 10 || age > metrics.oldestObjects[9].age) {
            metrics.oldestObjects.push({
              key: obj.Key,
              age,
              lastModified: obj.LastModified,
            });
            metrics.oldestObjects.sort((a, b) => b.age - a.age);
            metrics.oldestObjects = metrics.oldestObjects.slice(0, 10);
          }
        }
      }

      metrics.totalSizeGB = metrics.totalSize / (1024 * 1024 * 1024);

    } catch (error) {
      console.error('Error getting storage metrics:', error);
    }

    return metrics;
  }

  /**
   * Get access metrics from database
   */
  async getAccessMetrics(startDate?: Date, endDate?: Date): Promise<AccessMetrics> {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // Get download records
    const downloads = await this.prisma.download.findMany({
      where,
      include: {
        resource: true,
      },
    });

    const metrics: AccessMetrics = {
      totalDownloads: downloads.length,
      downloadsByResource: {},
      popularResources: [],
      bandwidthUsedGB: 0,
    };

    // Calculate downloads by resource
    const resourceStats = new Map<string, { downloads: number; lastAccessed: Date; size: number }>();

    for (const download of downloads) {
      if (download.resourceId) {
        const current = resourceStats.get(download.resourceId) || {
          downloads: 0,
          lastAccessed: download.createdAt,
          size: 0,
        };

        current.downloads++;
        if (download.createdAt > current.lastAccessed) {
          current.lastAccessed = download.createdAt;
        }

        // Get resource size for bandwidth calculation
        if (download.resource?.codeStorageId) {
          const storage = await this.prisma.storageObject.findUnique({
            where: { id: download.resource.codeStorageId },
          });
          if (storage?.size) {
            current.size = storage.size;
            metrics.bandwidthUsedGB += storage.size / (1024 * 1024 * 1024);
          }
        }

        resourceStats.set(download.resourceId, current);
        metrics.downloadsByResource[download.resourceId] = current.downloads;
      }
    }

    // Get popular resources
    metrics.popularResources = Array.from(resourceStats.entries())
      .map(([resourceId, stats]) => ({
        resourceId,
        downloads: stats.downloads,
        lastAccessed: stats.lastAccessed,
      }))
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 10);

    return metrics;
  }

  /**
   * Check R2 health status
   */
  async checkHealth(): Promise<HealthStatus> {
    const status: HealthStatus = {
      bucketAccessible: false,
      apiLatency: 0,
      errors: [],
      lastChecked: new Date(),
    };

    const startTime = Date.now();

    try {
      // Check bucket access
      const command = new HeadBucketCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
      });

      await this.s3Client.send(command);
      status.bucketAccessible = true;

      // Test upload/download
      const testKey = 'health-check/test.txt';
      const testContent = `Health check at ${new Date().toISOString()}`;

      await this.r2Service.upload(testKey, testContent);
      const downloaded = await this.r2Service.downloadString(testKey);
      await this.r2Service.delete(testKey);

      if (downloaded !== testContent) {
        status.errors.push('Upload/download content mismatch');
      }

    } catch (error) {
      status.errors.push(error.message);
    }

    status.apiLatency = Date.now() - startTime;

    // Store health check result
    await this.storeHealthCheck(status);

    return status;
  }

  /**
   * Get monitoring dashboard data
   */
  async getDashboardData(): Promise<{
    storage: StorageMetrics;
    access: AccessMetrics;
    health: HealthStatus;
    recentActivity: any[];
  }> {
    const [storage, access, health] = await Promise.all([
      this.getStorageMetrics(),
      this.getAccessMetrics(),
      this.checkHealth(),
    ]);

    // Get recent activity
    const recentActivity = await this.prisma.storageObject.findMany({
      take: 20,
      orderBy: { uploadedAt: 'desc' },
      include: {
        resource: {
          select: { name: true, slug: true },
        },
      },
    });

    return {
      storage,
      access,
      health,
      recentActivity,
    };
  }

  /**
   * Set up automated monitoring alerts
   */
  async checkAlerts(): Promise<string[]> {
    const alerts: string[] = [];
    const metrics = await this.getStorageMetrics();

    // Check storage usage
    if (metrics.totalSizeGB > 100) {
      alerts.push(`High storage usage: ${metrics.totalSizeGB.toFixed(2)} GB`);
    }

    // Check for large objects
    const veryLargeObjects = metrics.largestObjects.filter(obj => obj.size > 50 * 1024 * 1024);
    if (veryLargeObjects.length > 0) {
      alerts.push(`Found ${veryLargeObjects.length} objects larger than 50MB`);
    }

    // Check health
    const health = await this.checkHealth();
    if (!health.bucketAccessible) {
      alerts.push('R2 bucket is not accessible!');
    }
    if (health.apiLatency > 5000) {
      alerts.push(`High API latency: ${health.apiLatency}ms`);
    }

    return alerts;
  }

  private getObjectType(key: string): string {
    if (key.includes('/code/')) return 'code';
    if (key.includes('/docs/')) return 'documentation';
    if (key.includes('/preview/')) return 'preview';
    if (key.includes('/asset/')) return 'asset';
    if (key.includes('/versions/')) return 'version';
    return 'other';
  }

  private async storeHealthCheck(status: HealthStatus): Promise<void> {
    // Store in a dedicated monitoring table or as JSON in a generic table
    // For now, we'll log it
    console.log('Health check:', status);
  }
}