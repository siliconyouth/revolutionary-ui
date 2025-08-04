# R2 Storage Quick Start Guide

Get up and running with Cloudflare R2 in 5 minutes!

## 🚀 Quick Setup

### 1. Enable R2 in Cloudflare

1. **Sign up/Login**: https://dash.cloudflare.com/
2. **Enable R2**: Click "R2" in sidebar → "Get started"
3. **Copy Account ID**: Click your profile → Find "Account ID"

### 2. Create Bucket & API Token

```bash
# In Cloudflare Dashboard:
1. R2 → "Create bucket" → Name: "revolutionary-ui-components"
2. R2 → "Manage R2 API tokens" → "Create API token"
   - Name: "Revolutionary UI"
   - Permissions: "Object Read & Write"
   - Bucket: Select your bucket
   - Create and SAVE credentials!
```

### 3. Configure Environment

Add to `.env.local`:

```bash
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_BUCKET_NAME=revolutionary-ui-components
```

### 4. Update Database & Migrate

```bash
# Update database schema
npm run prisma:push

# Migrate existing components to R2
npm run migrate:r2
```

## ✅ That's it! Your components are now in R2.

## 📖 Common Tasks

### View Component Code from R2

```typescript
const service = EnhancedResourceService.getInstance()
const component = await service.getResourceWithCode('resource-id')
console.log(component.code) // Source code from R2
```

### Create New Component

```typescript
await service.createResource({
  name: 'My Component',
  slug: 'my-component',
  description: 'Description',
  categoryId: 'cat-123',
  resourceTypeId: 'type-456',
  authorId: 'user-789',
  sourceCode: '// Your component code',
  documentation: '# Component docs'
})
// Automatically stored in R2!
```

### Get Public URLs

```typescript
const resource = await service.getResourceWithCode('resource-id')
console.log('Public URL:', resource.codeStorage?.url)
```

## 🔗 Important Links

- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **R2 Documentation**: https://developers.cloudflare.com/r2/
- **Full Guide**: [R2_COMPLETE_GUIDE.md](./R2_COMPLETE_GUIDE.md)

## 💰 Cost Calculator

| Usage | Monthly Cost |
|-------|--------------|
| 1,000 components (10KB each) | $0.00015 |
| 100,000 downloads | $0.036 |
| 1TB bandwidth | $0 (FREE!) |

## 🆘 Need Help?

- Check [Troubleshooting](./R2_COMPLETE_GUIDE.md#troubleshooting)
- Email: vladimir@dukelic.com
- GitHub: https://github.com/siliconyouth/revolutionary-ui/issues