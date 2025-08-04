# Complete Guide: Cloudflare R2 Storage Integration

This comprehensive guide covers all aspects of setting up and using Cloudflare R2 storage with Revolutionary UI.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Cloudflare Account Setup](#cloudflare-account-setup)
3. [R2 Configuration](#r2-configuration)
4. [Environment Setup](#environment-setup)
5. [Database Migration](#database-migration)
6. [Usage Examples](#usage-examples)
7. [API Reference](#api-reference)
8. [Monitoring & Management](#monitoring--management)
9. [Troubleshooting](#troubleshooting)
10. [Cost Optimization](#cost-optimization)

## Prerequisites

Before starting, ensure you have:

- A Cloudflare account (free tier works)
- Node.js 18+ installed
- PostgreSQL database running
- Revolutionary UI v3.2.0 or higher

## Cloudflare Account Setup

### 1. Create a Cloudflare Account

1. Visit [Cloudflare Sign Up](https://dash.cloudflare.com/sign-up)
2. Create your account (free plan is sufficient)
3. Verify your email address

### 2. Enable R2 Storage

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2** in the left sidebar
3. Click **"Get started"** to enable R2
4. Accept the terms of service

### 3. Find Your Account ID

1. In the Cloudflare dashboard, click your account name (top right)
2. Look for **Account ID** in the right sidebar
3. Copy this value - you'll need it for `R2_ACCOUNT_ID`

## R2 Configuration

### 1. Create Your R2 Bucket

1. Go to **R2** → **"Create bucket"**
2. Configure your bucket:
   ```
   Bucket name: revolutionary-ui-components
   Region: Automatic (recommended) or choose closest to your users
   Storage class: Standard
   ```
3. Click **"Create bucket"**

### 2. Generate API Credentials

1. Navigate to **R2** → **"Manage R2 API tokens"**
2. Click **"Create API token"**
3. Configure the token:
   ```
   Token name: Revolutionary UI Production
   Permissions: Object Read & Write
   Specify bucket: Select "revolutionary-ui-components"
   TTL: Permanent (or set expiration as needed)
   ```
4. Click **"Create API Token"**
5. **IMPORTANT**: Save these credentials immediately:
   - Access Key ID → `R2_ACCESS_KEY_ID`
   - Secret Access Key → `R2_SECRET_ACCESS_KEY`
   - You won't be able to see the secret again!

### 3. Configure Public Access (Optional)

For public component previews without authentication:

1. Go to your bucket → **"Settings"** → **"Public access"**
2. Click **"Configure"**
3. Enable public access
4. Note the public URL format:
   ```
   https://pub-<hash>.r2.dev/<bucket-name>/<key>
   ```

### 4. Set Up Custom Domain (Optional)

For branded URLs like `components.yourdomain.com`:

1. Go to your bucket → **"Settings"** → **"Custom domains"**
2. Click **"Connect domain"**
3. Enter your subdomain: `components.yourdomain.com`
4. Add the CNAME record to your DNS:
   ```
   Type: CNAME
   Name: components
   Content: <bucket-name>.<account-id>.r2.cloudflarestorage.com
   ```
5. Wait for DNS propagation (5-30 minutes)
6. Your R2_PUBLIC_URL will be: `https://components.yourdomain.com`

### 5. Configure CORS (For Browser Uploads)

1. Go to your bucket → **"Settings"** → **"CORS policy"**
2. Add this configuration:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://your-production-domain.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

## Environment Setup

### 1. Update Your `.env.local`

Add these variables to your `.env.local` file:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=abc123def456ghi789  # From dashboard
R2_ACCESS_KEY_ID=xxx123xxx456xxx789  # From API token
R2_SECRET_ACCESS_KEY=yyy123yyy456yyy789  # From API token
R2_BUCKET_NAME=revolutionary-ui-components  # Your bucket name

# Optional: Custom domain for public access
R2_PUBLIC_URL=https://components.yourdomain.com  # If configured
```

### 2. Verify Configuration

Run the environment check:

```bash
npm run env:check
```

You should see:
```
📦 Cloudflare R2:
  ✅ R2_ACCOUNT_ID = abc123def456ghi7...
  ✅ R2_ACCESS_KEY_ID = xxx123xxx456xxx7...
  ✅ R2_SECRET_ACCESS_KEY = yyy123yyy456yyy7...
  ✅ R2_BUCKET_NAME = revolutionary-ui-components
```

## Database Migration

### 1. Update Database Schema

First, push the new schema to your database:

```bash
npm run prisma:push
```

This adds:
- `StorageObject` table for tracking R2 files
- Storage relation fields to existing tables

### 2. Run the Migration

Migrate existing component code to R2:

```bash
npm run migrate:r2
```

Expected output:
```
🚀 Revolutionary UI - R2 Storage Migration

✅ R2 connection successful

📦 Migrating Resources...
✅ Migrated: Button Component
✅ Migrated: Form Factory
✅ Migrated: Dashboard Template
...

📦 Migrating Submissions...
✅ Migrated: Custom Calendar
✅ Migrated: Data Grid Pro
...

🔍 Verifying Migration...
✅ Migration verification passed

✅ Migration Complete!

📊 Summary:
  Resources: 156/156 migrated
  Submissions: 42/42 migrated
  Total Size Uploaded: 12.34 MB

📄 Migration report saved to: /path/to/migration-report.json
```

### 3. Verify Migration

Check the migration report:

```bash
cat migration-report.json
```

## Usage Examples

### 1. Creating a Resource with R2 Storage

```typescript
import { EnhancedResourceService } from './services/enhanced-resource-service'

const service = EnhancedResourceService.getInstance()

// Create a new component
const component = await service.createResource({
  name: 'Advanced Data Table',
  slug: 'advanced-data-table',
  description: 'Feature-rich data table with sorting, filtering, and pagination',
  categoryId: 'category-123',
  resourceTypeId: 'type-456',
  authorId: 'user-789',
  sourceCode: `
    import React from 'react'
    
    export const DataTable = ({ data, columns }) => {
      // Component implementation
      return <table>...</table>
    }
  `,
  documentation: `
    # Advanced Data Table
    
    A powerful data table component with:
    - Server-side pagination
    - Multi-column sorting
    - Advanced filtering
    - Export functionality
  `,
  frameworks: ['react', 'vue'],
  npmPackage: '@revolutionary-ui/data-table',
  tags: ['table', 'data-grid', 'pagination']
})

console.log('Component stored in R2:', component.codeStorage?.url)
```

### 2. Fetching Component Code from R2

```typescript
// Get component with code
const componentWithCode = await service.getResourceWithCode('resource-id-123')

console.log('Component:', componentWithCode.name)
console.log('Code:', componentWithCode.code)
console.log('Docs:', componentWithCode.docs)
console.log('R2 URL:', componentWithCode.codeStorage?.url)
```

### 3. Uploading Additional Assets

```typescript
// Upload a preview image
const previewImage = await service.uploadResourceAsset(
  'resource-id-123',
  'preview.png',
  imageBuffer,
  {
    contentType: 'image/png',
    cacheControl: 'public, max-age=31536000'
  }
)

// Upload a demo video
const demoVideo = await service.uploadResourceAsset(
  'resource-id-123',
  'demo.mp4',
  videoBuffer,
  {
    contentType: 'video/mp4'
  }
)
```

### 4. Generating Presigned URLs

For temporary access to private content:

```typescript
// Get presigned URLs (expire in 1 hour)
const urls = await service.getResourcePresignedUrls('resource-id-123', 3600)

console.log('Code URL:', urls.code)  // Temporary URL for source code
console.log('Docs URL:', urls.docs)  // Temporary URL for documentation
console.log('Assets:', urls.assets)  // Map of filename to URL
```

### 5. Direct R2 Service Usage

```typescript
import { R2StorageService } from './services/r2-storage-service'

const r2 = R2StorageService.getInstance({
  accountId: process.env.R2_ACCOUNT_ID!,
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  bucketName: process.env.R2_BUCKET_NAME!,
})

// Upload JSON data
await r2.uploadJson('config/settings.json', {
  theme: 'dark',
  features: ['ai', 'collaboration']
})

// Download JSON data
const settings = await r2.downloadJson('config/settings.json')

// List all resources
const files = await r2.list('resources/')

// Check if file exists
const exists = await r2.exists('resources/abc123/code/component.tsx')

// Delete a file
await r2.delete('old/unused-file.js')
```

## API Reference

### R2StorageService Methods

| Method | Description | Example |
|--------|-------------|---------|
| `upload(key, content, options)` | Upload content to R2 | `await r2.upload('file.txt', 'content')` |
| `uploadJson(key, data)` | Upload JSON data | `await r2.uploadJson('data.json', {})` |
| `download(key)` | Download raw buffer | `await r2.download('file.txt')` |
| `downloadString(key)` | Download as string | `await r2.downloadString('file.txt')` |
| `downloadJson(key)` | Download as JSON | `await r2.downloadJson('data.json')` |
| `exists(key)` | Check if file exists | `await r2.exists('file.txt')` |
| `delete(key)` | Delete a file | `await r2.delete('file.txt')` |
| `list(prefix)` | List files with prefix | `await r2.list('resources/')` |
| `copy(source, dest)` | Copy a file | `await r2.copy('old.txt', 'new.txt')` |
| `getPresignedUrl(key, options)` | Generate temporary URL | `await r2.getPresignedUrl('file.txt')` |
| `getPublicUrl(key)` | Get public URL | `r2.getPublicUrl('file.txt')` |

### Storage Key Structure

```
revolutionary-ui-components/
├── resources/
│   └── {resourceId}/
│       ├── code/
│       │   ├── component.tsx
│       │   ├── component.vue
│       │   └── component.svelte
│       ├── docs/
│       │   ├── README.md
│       │   └── API.md
│       ├── preview/
│       │   ├── screenshot.png
│       │   └── demo.gif
│       └── assets/
│           ├── icon.svg
│           └── styles.css
├── submissions/
│   └── {submissionId}/
│       ├── code/
│       ├── docs/
│       └── preview/
└── packages/
    └── {packageId}/
        └── {version}/
            └── package.tar.gz
```

## Monitoring & Management

### 1. R2 Dashboard Metrics

Monitor usage in [Cloudflare Dashboard](https://dash.cloudflare.com/) → **R2**:

- **Storage Used**: Total storage consumption
- **Class A Operations**: Writes, lists, deletes
- **Class B Operations**: Reads
- **Bandwidth**: Data transfer out

### 2. Usage Analytics

View detailed analytics:

1. Go to your bucket → **"Analytics"**
2. Monitor:
   - Request count by operation
   - Bandwidth usage
   - Error rates
   - Popular objects

### 3. Cost Tracking

R2 Pricing (as of 2024):
- **Storage**: $0.015 per GB/month
- **Class A Operations**: $4.50 per million (writes)
- **Class B Operations**: $0.36 per million (reads)
- **Bandwidth**: FREE (no egress fees!)

### 4. Set Up Alerts

1. Go to **"Notifications"** in Cloudflare
2. Create alerts for:
   - Usage thresholds
   - Error rate spikes
   - Billing alerts

## Troubleshooting

### Common Issues

#### 1. Authentication Errors

```
Error: Invalid credentials
```

**Solution**:
- Verify R2_ACCOUNT_ID matches your dashboard
- Ensure API token has correct permissions
- Check token hasn't expired

#### 2. Bucket Not Found

```
Error: NoSuchBucket
```

**Solution**:
- Verify R2_BUCKET_NAME is correct
- Ensure bucket exists in your account
- Check you're using the right account

#### 3. CORS Issues

```
Error: CORS policy blocked
```

**Solution**:
- Update CORS configuration in bucket settings
- Include your domain in AllowedOrigins
- Clear browser cache

#### 4. Upload Failures

```
Error: Failed to upload to R2
```

**Solution**:
- Check file size (R2 limit: 5TB per object)
- Verify network connectivity
- Ensure sufficient permissions

### Debug Mode

Enable detailed logging:

```typescript
// In your service initialization
const r2Service = R2StorageService.getInstance({
  // ... config
  debug: process.env.NODE_ENV === 'development'
})
```

### Test R2 Connection

```bash
# Create a test script
cat > test-r2.js << 'EOF'
const { R2StorageService } = require('./dist/services/r2-storage-service')

async function test() {
  const r2 = R2StorageService.getInstance({
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
  })
  
  // Test upload
  await r2.upload('test.txt', 'Hello R2!')
  console.log('✅ Upload successful')
  
  // Test download
  const content = await r2.downloadString('test.txt')
  console.log('✅ Download successful:', content)
  
  // Cleanup
  await r2.delete('test.txt')
  console.log('✅ Delete successful')
}

test().catch(console.error)
EOF

# Run test
node test-r2.js
```

## Cost Optimization

### 1. Enable Compression

Compress text content before upload:

```typescript
import { gzipSync } from 'zlib'

const compressed = gzipSync(sourceCode)
await r2.upload(key, compressed, {
  contentEncoding: 'gzip',
  contentType: 'text/typescript'
})
```

### 2. Set Lifecycle Rules

Configure in bucket settings:
- Delete old versions after 30 days
- Move infrequently accessed files to Infrequent Access storage

### 3. Use Caching Headers

```typescript
await r2.upload(key, content, {
  cacheControl: 'public, max-age=31536000, immutable'
})
```

### 4. Batch Operations

```typescript
// Instead of individual uploads
for (const file of files) {
  await r2.upload(file.key, file.content)
}

// Use batch upload
await r2.batchUpload(files.map(f => ({
  key: f.key,
  content: f.content,
  options: { contentType: f.type }
})))
```

## Additional Resources

### Official Documentation
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [R2 API Reference](https://developers.cloudflare.com/r2/api/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [S3 API Compatibility](https://developers.cloudflare.com/r2/api/s3/)

### SDK Documentation
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [S3 Client Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)

### Community Resources
- [Cloudflare Community Forum](https://community.cloudflare.com/c/r2-object-storage/)
- [R2 Discord Channel](https://discord.cloudflare.com)

### Revolutionary UI Specific
- [GitHub Issues](https://github.com/siliconyouth/revolutionary-ui/issues)
- [Documentation](https://revolutionary-ui.com/docs)
- Support: vladimir@dukelic.com

## Next Steps

1. **Set up monitoring** - Configure alerts for usage thresholds
2. **Implement backups** - Set up cross-region replication
3. **Optimize performance** - Enable caching and compression
4. **Plan scaling** - Design sharding strategy for millions of components
5. **Security audit** - Review access controls and encryption

---

Remember: R2 provides **zero egress fees**, making it ideal for component distribution. Take advantage of this for your marketplace!