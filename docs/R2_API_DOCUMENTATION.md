# R2 Storage API Documentation

## Overview

The Revolutionary UI Factory System uses Cloudflare R2 for storing all component source code, documentation, previews, and assets. This document covers the complete R2 API implementation including storage, versioning, monitoring, and backup capabilities.

## Table of Contents

1. [Architecture](#architecture)
2. [API Endpoints](#api-endpoints)
3. [Frontend Integration](#frontend-integration)
4. [Versioning System](#versioning-system)
5. [Monitoring & Analytics](#monitoring--analytics)
6. [Backup & Recovery](#backup--recovery)
7. [Performance Optimization](#performance-optimization)
8. [Security & Access Control](#security--access-control)
9. [Development Guide](#development-guide)
10. [Troubleshooting](#troubleshooting)

## Architecture

### Storage Structure

```
revolutionary-ui-components/
├── resources/
│   ├── {resourceId}/
│   │   ├── code/
│   │   │   └── source.tsx
│   │   ├── docs/
│   │   │   └── README.md
│   │   ├── preview/
│   │   │   └── preview.png
│   │   ├── assets/
│   │   │   └── {asset-files}
│   │   └── versions/
│   │       ├── v1.0.0/
│   │       ├── v1.0.1/
│   │       └── v1.1.0/
└── health-check/
```

### Core Services

- **R2StorageService**: Low-level R2 operations (upload, download, delete)
- **EnhancedResourceService**: Resource management with automatic R2 integration
- **R2VersionService**: Component versioning system
- **R2MonitoringService**: Usage tracking and analytics

## API Endpoints

### Resource Endpoints

#### Get Resource with Code
```http
GET /api/resources/{id}
```

**Response:**
```json
{
  "id": "clxyz123",
  "name": "Dynamic Form Component",
  "slug": "dynamic-form",
  "code": "export const DynamicForm = () => { ... }",
  "docs": "# Dynamic Form Component\n...",
  "storageObjects": [
    {
      "id": "storage123",
      "bucket": "revolutionary-ui-components",
      "key": "resources/clxyz123/code/source.tsx",
      "url": "https://r2.example.com/...",
      "publicUrl": "https://cdn.example.com/...",
      "storageType": "SOURCE_CODE"
    }
  ]
}
```

#### Get Download URLs
```http
GET /api/resources/{id}/download
```

**Response:**
```json
{
  "code": {
    "url": "https://r2.example.com/presigned-url-for-code",
    "expiresAt": "2024-01-01T12:00:00Z"
  },
  "docs": {
    "url": "https://r2.example.com/presigned-url-for-docs",
    "expiresAt": "2024-01-01T12:00:00Z"
  },
  "preview": {
    "url": "https://cdn.example.com/preview.png"
  }
}
```

#### Update Resource
```http
PUT /api/resources/{id}
Content-Type: application/json

{
  "code": "export const UpdatedComponent = () => { ... }",
  "docs": "# Updated Documentation",
  "preview": "data:image/png;base64,..."
}
```

#### Delete Resource
```http
DELETE /api/resources/{id}
```

### Version Management

#### List Versions
```http
GET /api/resources/{id}/versions
```

**Response:**
```json
{
  "versions": [
    {
      "id": "ver123",
      "version": "1.1.0",
      "createdAt": "2024-01-01T10:00:00Z",
      "author": "user@example.com",
      "changelog": "Added new props",
      "storageKey": "resources/clxyz123/versions/v1.1.0/",
      "size": 12345
    }
  ]
}
```

#### Create Version
```http
POST /api/resources/{id}/versions
Content-Type: application/json

{
  "sourceCode": "export const Component = () => { ... }",
  "documentation": "# Component v1.1.0",
  "version": "1.1.0",
  "changelog": "- Added TypeScript support\n- Fixed styling issues"
}
```

#### Get Specific Version
```http
GET /api/resources/{id}/versions/{versionId}
```

#### Download Version
```http
GET /api/resources/{id}/versions/{versionId}/download
```

#### Rollback to Version
```http
POST /api/resources/{id}/versions/{versionId}/rollback
```

### Monitoring Endpoints

#### Get Dashboard Data
```http
GET /api/admin/r2-monitoring
```

**Response:**
```json
{
  "storage": {
    "totalObjects": 1234,
    "totalSizeGB": 45.6,
    "objectsByType": {
      "code": 500,
      "documentation": 400,
      "preview": 300,
      "asset": 34
    }
  },
  "access": {
    "totalDownloads": 5678,
    "popularResources": [
      {
        "resourceId": "clxyz123",
        "downloads": 234,
        "lastAccessed": "2024-01-01T12:00:00Z"
      }
    ],
    "bandwidthUsedGB": 123.4
  },
  "health": {
    "bucketAccessible": true,
    "apiLatency": 123,
    "lastChecked": "2024-01-01T12:00:00Z"
  }
}
```

#### Get Storage Metrics
```http
GET /api/admin/r2-monitoring?type=storage
```

#### Get Access Metrics
```http
GET /api/admin/r2-monitoring?type=access&startDate=2024-01-01&endDate=2024-01-31
```

#### Health Check
```http
GET /api/admin/r2-monitoring?type=health
```

## Frontend Integration

### React Hooks

#### useR2Resource Hook
```typescript
import { useR2Resource } from '@/hooks/useR2Resource';

function ComponentViewer({ resourceId }) {
  const { resource, downloadUrls, loading, error } = useR2Resource(resourceId);
  
  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  
  return (
    <div>
      <h1>{resource.name}</h1>
      <CodeEditor value={resource.code} />
      <DownloadButton url={downloadUrls.code.url} />
    </div>
  );
}
```

#### useR2Versions Hook
```typescript
import { useR2Versions } from '@/hooks/useR2Versions';

function VersionHistory({ resourceId }) {
  const { versions, loading, createVersion, rollback } = useR2Versions(resourceId);
  
  const handleCreateVersion = async () => {
    await createVersion({
      sourceCode: currentCode,
      version: '1.1.0',
      changelog: 'Added new features'
    });
  };
  
  return (
    <div>
      {versions.map(version => (
        <VersionItem 
          key={version.id}
          version={version}
          onRollback={() => rollback(version.id)}
        />
      ))}
    </div>
  );
}
```

### Components

#### ResourceDownloadButton
```typescript
import { ResourceDownloadButton } from '@/components/r2/ResourceDownloadButton';

<ResourceDownloadButton 
  resourceId="clxyz123"
  type="code"
  className="btn-primary"
/>
```

#### ResourceCodeViewer
```typescript
import { ResourceCodeViewer } from '@/components/r2/ResourceCodeViewer';

<ResourceCodeViewer 
  resourceId="clxyz123"
  height={400}
  theme="dark"
/>
```

## Versioning System

### Creating Versions

```typescript
// Server-side
const versionService = R2VersionService.getInstance();

const version = await versionService.createVersion({
  resourceId: 'clxyz123',
  sourceCode: 'export const Component = () => { ... }',
  documentation: '# Component Documentation',
  version: '1.1.0',
  changelog: '- Added TypeScript support',
  author: 'user@example.com'
});
```

### Version Comparison

```typescript
const diff = await versionService.compareVersions(
  'clxyz123',
  'v1.0.0',
  'v1.1.0'
);

console.log(diff.changes); // Array of changes
```

### Rollback Strategy

```typescript
// Rollback to a specific version
await versionService.rollbackToVersion('clxyz123', 'ver123');

// This creates a new version with the old content
// preserving the version history
```

## Monitoring & Analytics

### Setting Up Monitoring

```typescript
// Initialize monitoring service
const monitoring = R2MonitoringService.getInstance();

// Get real-time metrics
const metrics = await monitoring.getStorageMetrics();
console.log(`Total storage: ${metrics.totalSizeGB} GB`);

// Track access patterns
const access = await monitoring.getAccessMetrics(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);
```

### Alert Configuration

```typescript
// Check for alerts
const alerts = await monitoring.checkAlerts();

// Custom alert rules
if (metrics.totalSizeGB > 100) {
  sendNotification('High storage usage alert');
}

if (metrics.largestObjects[0].size > 50 * 1024 * 1024) {
  sendNotification('Large file detected');
}
```

### Dashboard Integration

```typescript
// Admin dashboard component
function R2MonitoringDashboard() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/admin/r2-monitoring')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  return (
    <Dashboard>
      <StorageChart data={data?.storage} />
      <AccessMetrics data={data?.access} />
      <HealthStatus status={data?.health} />
    </Dashboard>
  );
}
```

## Backup & Recovery

### Automated Backup

```bash
# Run backup script
npm run backup:r2

# With options
npm run backup:r2 -- --incremental --prefix=resources/

# Dry run
npm run backup:r2 -- --dry-run
```

### Backup Configuration

```javascript
// .env.local
BACKUP_ACCESS_KEY_ID=your-s3-key
BACKUP_SECRET_ACCESS_KEY=your-s3-secret
BACKUP_BUCKET_NAME=revolutionary-ui-backup
BACKUP_REGION=us-east-1
```

### Recovery Process

```typescript
// Restore from backup
const backupService = new R2BackupService({
  source: { /* backup config */ },
  destination: { /* R2 config */ }
});

await backupService.restore({
  prefix: 'resources/clxyz123/',
  point_in_time: '2024-01-01'
});
```

## Performance Optimization

### Caching Strategy

```typescript
// Cache configuration
const CACHE_CONFIGS = {
  immutable: {
    pattern: /\/versions\//,
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'CDN-Cache-Control': 'max-age=31536000',
    },
  },
  code: {
    pattern: /\.(tsx?|jsx?)$/,
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'CDN-Cache-Control': 'max-age=86400',
    },
  }
};
```

### CDN Integration

```typescript
// Configure Cloudflare Page Rules
const pageRules = [
  {
    url: 'https://cdn.example.com/resources/*/versions/*',
    settings: {
      'Browser Cache TTL': '1 year',
      'Edge Cache TTL': '1 month',
      'Cache Level': 'Cache Everything',
    }
  }
];
```

### Cache Purging

```bash
# Purge specific patterns
npm run purge-cache -- "resources/*/code/*"

# Purge everything
npm run purge-cache -- "*"
```

## Security & Access Control

### Authentication

```typescript
// Middleware for protected endpoints
export async function authenticateRequest(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Authentication required');
  }
  
  return session.user;
}
```

### Presigned URLs

```typescript
// Generate temporary access URLs
const downloadUrl = await r2Service.getPresignedUrl(
  'resources/clxyz123/code/source.tsx',
  { expiresIn: 3600 } // 1 hour
);
```

### CORS Configuration

```typescript
// R2 bucket CORS rules
const corsRules = [
  {
    AllowedOrigins: ['https://revolutionary-ui.com'],
    AllowedMethods: ['GET', 'HEAD'],
    AllowedHeaders: ['*'],
    MaxAgeSeconds: 3600
  }
];
```

## Development Guide

### Local Development

```bash
# Set up environment
cp .env.sample .env.local

# Add R2 credentials
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=revolutionary-ui-components
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Run migration
npm run migrate:r2

# Test locally
npm run dev
```

### Testing R2 Integration

```typescript
// Test script
import { R2StorageService } from '@/services/r2-storage-service';

async function testR2() {
  const r2 = R2StorageService.getInstance();
  
  // Test upload
  const key = 'test/hello.txt';
  await r2.upload(key, 'Hello R2!');
  
  // Test download
  const content = await r2.downloadString(key);
  console.log(content); // "Hello R2!"
  
  // Cleanup
  await r2.delete(key);
}
```

### Error Handling

```typescript
try {
  const resource = await resourceService.getResourceWithCode(id);
} catch (error) {
  if (error.code === 'NoSuchKey') {
    // Handle missing file
    console.error('Resource not found in R2');
  } else if (error.code === 'AccessDenied') {
    // Handle permission error
    console.error('R2 access denied');
  } else {
    // Handle other errors
    console.error('R2 error:', error);
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Missing Environment Variables
```bash
Error: Missing R2_ACCOUNT_ID environment variable

Solution:
npx dotenvx run -f .env.local -- npm run script
```

#### 2. CORS Errors
```
Error: CORS policy blocked request

Solution:
1. Check R2 bucket CORS configuration
2. Verify allowed origins include your domain
3. Use presigned URLs for temporary access
```

#### 3. Large File Uploads
```
Error: Request entity too large

Solution:
1. Use multipart upload for files > 5MB
2. Implement chunked upload on frontend
3. Increase server body size limit
```

#### 4. Version Conflicts
```
Error: Version already exists

Solution:
1. Use semantic versioning
2. Check existing versions before creating
3. Use auto-increment for patch versions
```

### Performance Tips

1. **Use Batch Operations**
   ```typescript
   // Good
   await r2Service.uploadBatch(files);
   
   // Avoid
   for (const file of files) {
     await r2Service.upload(file.key, file.content);
   }
   ```

2. **Enable Compression**
   ```typescript
   await r2Service.upload(key, content, {
     contentEncoding: 'gzip',
     metadata: { compressed: 'true' }
   });
   ```

3. **Use Streaming for Large Files**
   ```typescript
   const stream = fs.createReadStream(largefile);
   await r2Service.uploadStream(key, stream);
   ```

### Monitoring Best Practices

1. **Set Up Alerts**
   - Storage usage > 80%
   - API latency > 1000ms
   - Failed uploads > 10/hour

2. **Regular Health Checks**
   ```bash
   # Add to cron
   0 */6 * * * /usr/bin/npm run check:r2-health
   ```

3. **Track Key Metrics**
   - Total storage used
   - Bandwidth consumption
   - Popular resources
   - Error rates

## Migration Guide

### From Local Storage to R2

```bash
# Run migration script
npm run migrate:to-r2

# Verify migration
npm run verify:r2-migration

# Update environment
npm run update:env-r2
```

### Rollback Procedure

```typescript
// If migration fails
const rollback = async () => {
  // 1. Stop new uploads
  process.env.USE_R2_STORAGE = 'false';
  
  // 2. Copy back from R2
  await backupService.restore({
    source: 'r2',
    destination: 'local'
  });
  
  // 3. Update database
  await prisma.storageObject.deleteMany({
    where: { bucket: 'revolutionary-ui-components' }
  });
};
```

## API Reference

### R2StorageService Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `upload(key, content, options)` | Upload file to R2 | key: string, content: Buffer\|string, options?: UploadOptions | Promise<UploadResult> |
| `download(key)` | Download file as Buffer | key: string | Promise<Buffer> |
| `downloadString(key)` | Download file as string | key: string | Promise<string> |
| `delete(key)` | Delete file | key: string | Promise<void> |
| `exists(key)` | Check if file exists | key: string | Promise<boolean> |
| `getPresignedUrl(key, options)` | Get temporary URL | key: string, options?: PresignOptions | Promise<string> |
| `list(prefix, options)` | List objects | prefix?: string, options?: ListOptions | Promise<StorageObject[]> |

### EnhancedResourceService Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `createResource(input)` | Create resource with R2 | input: CreateResourceInput | Promise<ResourceWithStorage> |
| `updateResource(id, input)` | Update resource and R2 | id: string, input: UpdateResourceInput | Promise<ResourceWithStorage> |
| `getResourceWithCode(id)` | Get resource with content | id: string | Promise<ResourceWithCode> |
| `deleteResource(id)` | Delete resource and R2 files | id: string | Promise<void> |

## Support & Resources

- **GitHub Issues**: [Report bugs](https://github.com/revolutionary-ui/issues)
- **Documentation**: [Full docs](https://revolutionary-ui.com/docs)
- **Community**: [Discord server](https://discord.gg/revolutionary-ui)
- **Email Support**: support@revolutionary-ui.com

---

Last updated: January 2025