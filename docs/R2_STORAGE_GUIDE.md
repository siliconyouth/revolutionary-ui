# Cloudflare R2 Storage Integration Guide

## Overview

Revolutionary UI v3.3 stores all component code in Cloudflare R2, providing global CDN distribution, automatic versioning, and enterprise-grade reliability.

## Setup

### 1. Create R2 Bucket

```bash
# Using Wrangler CLI
wrangler r2 bucket create revolutionary-ui-components

# Or via Cloudflare Dashboard
# 1. Go to R2 section
# 2. Create bucket named "revolutionary-ui-components"
# 3. Note your account ID
```

### 2. Configure Environment

```env
# .env.local
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=revolutionary-ui-components
R2_PUBLIC_URL=https://your-bucket.r2.cloudflarestorage.com
```

### 3. Run Migration

```bash
# Migrate existing resources to R2
npm run migrate:resources-to-r2

# Configure CORS for web access
npm run configure:r2-cors

# Set up caching rules
npm run configure:r2-caching
```

## Architecture

### Storage Structure

```
revolutionary-ui-components/
├── resources/
│   ├── {resourceId}/
│   │   ├── code/
│   │   │   ├── latest.tsx
│   │   │   └── v{version}.tsx
│   │   └── metadata.json
├── backups/
│   └── {date}/
│       └── resources-backup.tar.gz
└── cache/
    └── popular/
        └── {resourceId}.tsx
```

### Service Architecture

```typescript
// R2StorageService handles all storage operations
const r2Service = R2StorageService.getInstance();

// Upload component code
await r2Service.uploadResource(resourceId, code, {
  contentType: 'text/typescript',
  metadata: { framework: 'react', version: '1.0.0' }
});

// Download with CDN URL
const url = await r2Service.getPublicUrl(resourceId);
```

## API Endpoints

### Upload Resource

```typescript
POST /api/resources/{id}/upload
Content-Type: multipart/form-data

{
  "code": "export const Component = () => {...}",
  "framework": "react",
  "version": "1.0.0"
}
```

### Download Resource

```typescript
// Stream directly from R2
GET /api/resources/{id}/download

// Get CDN URL
GET /api/resources/{id}/url
```

### Version Management

```typescript
// List all versions
GET /api/resources/{id}/versions

// Get specific version
GET /api/resources/{id}/download?version=1.2.0

// Restore previous version
POST /api/resources/{id}/restore
{
  "version": "1.1.0"
}
```

## Features

### Automatic Versioning

Every upload creates a new version:

```typescript
// Version tracking in database
StorageObject {
  id: string
  resourceId: string
  storageKey: string
  version: string
  size: bigint
  contentHash: string
  createdAt: Date
}
```

### Global CDN

Components are served from Cloudflare's edge network:

- 200+ locations worldwide
- <50ms latency for most users
- Automatic caching
- DDoS protection

### Backup & Restore

```bash
# Manual backup
npm run backup:r2

# Scheduled backups (cron)
0 2 * * * npm run backup:r2 -- --retention=30

# Restore from backup
npm run restore:r2 -- --date=2025-08-04
```

### Monitoring & Analytics

```typescript
// Get storage metrics
GET /api/admin/r2-monitoring

Response:
{
  "totalObjects": 115,
  "totalSize": "24.5 MB",
  "bandwidthUsed": "1.2 GB",
  "requestsToday": 4523,
  "popularResources": [...],
  "storageByFramework": {...}
}
```

## Performance Optimization

### Edge Caching

```typescript
// Configure cache headers
const cacheRules = {
  'resources/**/latest.tsx': {
    'Cache-Control': 'public, max-age=3600', // 1 hour
  },
  'resources/**/v*.tsx': {
    'Cache-Control': 'public, max-age=31536000', // 1 year (immutable)
  }
};
```

### Batch Operations

```typescript
// Upload multiple resources
await r2Service.batchUpload([
  { resourceId: '1', code: '...', metadata: {...} },
  { resourceId: '2', code: '...', metadata: {...} },
]);

// Batch delete old versions
await r2Service.cleanupOldVersions({ 
  keepLast: 5,
  olderThan: '30d' 
});
```

## Security

### Access Control

```typescript
// Signed URLs for temporary access
const signedUrl = await r2Service.getSignedUrl(resourceId, {
  expiresIn: 3600, // 1 hour
  permissions: ['read']
});
```

### CORS Configuration

```javascript
// Applied CORS rules
{
  "AllowedOrigins": ["https://revolutionary-ui.com"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3600
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   ```bash
   npm run configure:r2-cors
   ```

2. **Missing Permissions**
   - Ensure R2 API token has read/write access
   - Check bucket policies

3. **Slow Downloads**
   - Enable caching rules
   - Use CDN URLs instead of direct R2 access

### Debug Commands

```bash
# List all R2 objects
wrangler r2 object list revolutionary-ui-components

# Check specific resource
npm run r2:inspect -- --resourceId=123

# Verify CDN propagation
curl -I https://your-cdn-url/resources/123/latest.tsx
```

## Cost Optimization

### Storage Costs
- First 10GB free
- $0.015 per GB/month after

### Request Costs
- First 10M requests free
- Class A (write): $4.50 per million
- Class B (read): $0.36 per million

### Best Practices
1. Enable aggressive caching
2. Use batch operations
3. Clean up old versions regularly
4. Monitor usage with R2 analytics

## Migration from Previous Storage

```bash
# One-time migration script
npm run migrate:resources-to-r2

# Verify migration
npm run verify:r2-migration

# Cleanup old storage
npm run cleanup:old-storage
```

## Future Enhancements

- [ ] Image optimization pipeline
- [ ] Automatic code minification
- [ ] A/B testing for components
- [ ] Edge-side rendering
- [ ] Multi-region replication