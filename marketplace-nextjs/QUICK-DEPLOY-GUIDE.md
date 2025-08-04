# Quick Deployment Guide - Revolutionary UI Marketplace

## 🚀 Deploy to Vercel (Recommended)

### 1. Prepare Your Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install --legacy-peer-deps`

### 3. Add Environment Variables
In Vercel dashboard, add all variables from `.env.sample`:

```env
DATABASE_URL=your_production_database_url
DIRECT_URL=your_direct_database_url
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate_with_openssl_rand_-base64_32
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 4. Deploy
Click "Deploy" and wait for the build to complete.

### 5. Post-Deployment

#### Set up Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.*`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET` in Vercel

#### Run Database Migrations
```bash
# From your local machine with production DATABASE_URL
DATABASE_URL="your_production_url" npx prisma migrate deploy
DATABASE_URL="your_production_url" npm run db:seed
```

## 🚀 Deploy to Netlify

### 1. Install Netlify Adapter
```bash
npm install -D @netlify/plugin-nextjs
```

### 2. Create netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 3. Deploy via CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify deploy --prod
```

### 4. Add Environment Variables
In Netlify dashboard → Site settings → Environment variables

## 🚀 Deploy to Custom VPS

### 1. Server Setup
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt-get install nginx
```

### 2. Deploy Application
```bash
# Clone repository
git clone https://github.com/your-repo/revolutionary-ui.git
cd revolutionary-ui/marketplace-nextjs

# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables
cp .env.sample .env.production
# Edit .env.production with your values

# Build application
npm run build

# Start with PM2
pm2 start npm --name "revolutionary-ui" -- start
pm2 save
pm2 startup
```

### 3. Configure Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL with Let's Encrypt
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔍 Verify Deployment

Run the deployment checklist:
```bash
node scripts/deploy-checklist.js
```

Test critical flows:
1. ✅ Homepage loads
2. ✅ Authentication works
3. ✅ Stripe checkout completes
4. ✅ Database queries work
5. ✅ API routes respond

## 🆘 Troubleshooting

### Build Fails
- Check build logs for specific errors
- Ensure all dependencies are installed
- Verify environment variables are set

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database is accessible from deployment platform
- Run migrations: `npx prisma migrate deploy`

### Stripe Webhook Errors
- Verify webhook endpoint URL
- Check webhook signing secret
- Test with Stripe CLI: `stripe listen --forward-to https://your-domain.com/api/webhooks/stripe`

### 500 Errors
- Check application logs
- Verify all environment variables
- Ensure database is seeded

## 📞 Support

- **Documentation**: Check DEPLOYMENT-CHECKLIST.md
- **Issues**: GitHub Issues
- **Email**: vladimir@dukelic.com

---

🎉 **Congratulations on deploying Revolutionary UI Marketplace!**