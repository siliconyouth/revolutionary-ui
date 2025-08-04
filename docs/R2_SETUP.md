# Cloudflare R2 Storage Setup

This guide explains how to configure Cloudflare R2 storage for the Revolutionary UI system.

## Prerequisites

1. A Cloudflare account
2. R2 storage enabled (available in the Cloudflare dashboard)

## Setup Steps

### 1. Create R2 Bucket

1. Log in to your Cloudflare dashboard
2. Navigate to R2 section
3. Click "Create bucket"
4. Name it `revolutionary-ui-components` (or your preferred name)
5. Choose a region close to your users

### 2. Generate API Credentials

1. In R2 dashboard, go to "Manage R2 API tokens"
2. Click "Create API token"
3. Configure permissions:
   - Permission: Object Read & Write
   - Specify bucket: Select your bucket
   - TTL: Set as needed (or leave unlimited)
4. Create token and save the credentials

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# R2 Account ID (found in Cloudflare dashboard > R2)
R2_ACCOUNT_ID=your_account_id_here

# R2 Access Keys (from the API token you created)
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here

# R2 Bucket Name
R2_BUCKET_NAME=revolutionary-ui-components

# Optional: Custom domain for public access
# R2_PUBLIC_URL=https://components.your-domain.com
```

### 4. Set Up Public Access (Optional)

For public component access without presigned URLs:

1. Go to your R2 bucket settings
2. Navigate to "Settings" > "Public access"
3. Enable public access
4. Configure custom domain if desired

### 5. Configure CORS (if needed)

For browser-based uploads:

```json
[
  {
    "AllowedOrigins": ["https://your-domain.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## Storage Structure

Components are organized in R2 as follows:

```
revolutionary-ui-components/
├── resources/
│   ├── {resourceId}/
│   │   ├── code/
│   │   │   ├── component.tsx
│   │   │   └── component.vue
│   │   ├── docs/
│   │   │   └── README.md
│   │   ├── preview/
│   │   │   └── screenshot.png
│   │   └── assets/
│   │       └── icon.svg
├── submissions/
│   ├── {submissionId}/
│   │   ├── code/
│   │   ├── docs/
│   │   └── preview/
└── packages/
    └── {packageId}/
        └── {version}/
            └── package.tar.gz
```

## Usage

The R2 storage service is automatically initialized when the application starts. Component code and resources are automatically stored in R2 when:

- New components are created
- Components are updated
- Users submit new components
- Packages are published

## Migration

To migrate existing components to R2:

```bash
npm run migrate:r2
```

This will:
1. Read all existing components from the database
2. Upload their code and documentation to R2
3. Update database records with R2 storage locations
4. Verify the migration

## Monitoring

Monitor R2 usage in the Cloudflare dashboard:
- Storage used
- Bandwidth consumed
- Request count
- Cost analysis

## Best Practices

1. **Use content hashing** - Prevents duplicate uploads
2. **Set appropriate cache headers** - Improves performance
3. **Use presigned URLs** - For temporary access to private content
4. **Implement lifecycle rules** - Auto-delete old versions
5. **Monitor costs** - R2 charges for storage and operations

## Troubleshooting

### Common Issues

1. **Authentication errors**: Verify your API credentials
2. **Access denied**: Check bucket permissions and CORS settings
3. **Slow uploads**: Consider multipart uploads for large files
4. **404 errors**: Ensure the bucket name and key are correct

### Debug Mode

Enable debug logging:

```typescript
const r2Service = R2StorageService.getInstance({
  // ... config
  debug: true
})
```