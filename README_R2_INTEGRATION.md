# Cloudflare R2 Storage Integration for Revolutionary UI

This document provides a complete overview of the R2 storage integration implemented for the Revolutionary UI Factory System.

## 📋 What Was Implemented

### 1. **R2 Storage Service** (`src/services/r2-storage-service.ts`)
A comprehensive service for managing files in Cloudflare R2:
- Upload/download files and JSON data
- Batch operations for efficiency
- Presigned URL generation
- Content deduplication via hashing
- Public URL support
- Full S3-compatible API

### 2. **Database Schema Updates**
Added to `prisma/schema.prisma`:
- `StorageObject` model for tracking R2 files
- Storage relations on Resource, ComponentSubmission, Preview, and PackageVersion
- Support for multiple storage types (code, docs, assets, etc.)

### 3. **Enhanced Resource Service** (`src/services/enhanced-resource-service.ts`)
Automatic R2 integration for resources:
- Uploads code/docs to R2 when creating/updating resources
- Falls back to database storage if R2 not configured
- Manages asset uploads
- Provides presigned URLs for secure access

### 4. **Migration Script** (`scripts/migrate-to-r2.ts`)
Safe migration of existing data:
- Migrates component code from database to R2
- Tracks progress and handles errors
- Creates detailed migration report
- Verifies successful uploads

### 5. **Documentation**
- [Complete Setup Guide](./docs/R2_COMPLETE_GUIDE.md) - Detailed walkthrough with screenshots
- [Quick Start Guide](./docs/R2_QUICK_START.md) - Get running in 5 minutes
- [R2 Setup Documentation](./docs/R2_SETUP.md) - Technical reference

## 🚀 Quick Start

### 1. Get Cloudflare R2 Credentials

1. Sign up at https://dash.cloudflare.com/
2. Enable R2 (free)
3. Create bucket: `revolutionary-ui-components`
4. Generate API token with read/write permissions

### 2. Configure Environment

Add to `.env.local`:
```bash
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=revolutionary-ui-components
```

### 3. Update Database & Migrate

```bash
# Update database schema
npm run prisma:push

# Migrate existing components
npm run migrate:r2
```

## 📁 Storage Structure

```
revolutionary-ui-components/
├── resources/{id}/
│   ├── code/         # Source code files
│   ├── docs/         # Documentation
│   ├── preview/      # Screenshots/videos
│   └── assets/       # Additional files
├── submissions/{id}/ # User submissions
└── packages/{id}/    # NPM packages
```

## 💻 Usage Examples

### Creating a Component
```typescript
const service = EnhancedResourceService.getInstance()

const component = await service.createResource({
  name: 'Data Table',
  sourceCode: '// React component code',
  documentation: '# Data Table Docs'
})
// Automatically stored in R2!
```

### Fetching Component Code
```typescript
const component = await service.getResourceWithCode('resource-id')
console.log(component.code) // From R2
console.log(component.codeStorage?.url) // Public URL
```

## 💰 Cost Benefits

Cloudflare R2 vs AWS S3:
- **Storage**: $0.015/GB/month (same as S3)
- **Operations**: 90% cheaper than S3
- **Bandwidth**: FREE (vs $0.09/GB on S3)
- **No minimum fees**

For 10,000 components with 1M monthly downloads:
- AWS S3: ~$90/month
- Cloudflare R2: ~$5/month

## 🔗 Key Links

### Cloudflare Resources
- **Dashboard**: https://dash.cloudflare.com/
- **R2 Docs**: https://developers.cloudflare.com/r2/
- **API Reference**: https://developers.cloudflare.com/r2/api/
- **Pricing**: https://developers.cloudflare.com/r2/pricing/

### Revolutionary UI Docs
- **Full Guide**: [docs/R2_COMPLETE_GUIDE.md](./docs/R2_COMPLETE_GUIDE.md)
- **Quick Start**: [docs/R2_QUICK_START.md](./docs/R2_QUICK_START.md)
- **Setup Docs**: [docs/R2_SETUP.md](./docs/R2_SETUP.md)

## ✅ Benefits Achieved

1. **Scalability**: Unlimited component storage
2. **Performance**: Global CDN distribution
3. **Cost Savings**: Free bandwidth (huge savings!)
4. **Reliability**: 99.9% uptime SLA
5. **Security**: Presigned URLs for controlled access
6. **Simplicity**: S3-compatible API

## 📊 Migration Status

Run `npm run migrate:r2` to see current status:
- Resources to migrate
- Submissions to migrate
- Total size to upload
- Failed migrations (if any)

## 🛠️ Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify R2_ACCOUNT_ID matches dashboard
   - Check API token permissions

2. **Bucket Not Found**
   - Ensure bucket name is correct
   - Verify bucket exists in your account

3. **CORS Errors**
   - Configure CORS in bucket settings
   - Add your domains to allowed origins

See [Complete Guide](./docs/R2_COMPLETE_GUIDE.md#troubleshooting) for more.

## 🎯 Next Steps

1. **Enable public access** for component previews
2. **Set up custom domain** for branded URLs
3. **Configure lifecycle rules** for old versions
4. **Monitor usage** in Cloudflare dashboard
5. **Implement caching** for better performance

## 📧 Support

- **Documentation**: https://revolutionary-ui.com/docs
- **GitHub Issues**: https://github.com/siliconyouth/revolutionary-ui/issues
- **Email**: vladimir@dukelic.com

---

**Note**: R2 integration is optional. The system works with or without it, automatically falling back to database storage if R2 is not configured.