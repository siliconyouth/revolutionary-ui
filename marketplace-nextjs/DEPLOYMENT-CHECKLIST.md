# Revolutionary UI Marketplace - Production Deployment Checklist

## Pre-Deployment Verification ✅

### 1. Build Verification
- [x] Production build completes successfully (`npm run build`)
- [x] No TypeScript errors
- [x] All dependencies installed
- [ ] Run production build locally (`npm run start`)
- [ ] Test critical user flows in production mode

### 2. Environment Variables
- [ ] Verify all environment variables are set in root `.env.local` file
- [ ] Note: This project uses centralized environment configuration from root `.env.local`
- [ ] Required variables:
  ```
  # Database
  - [ ] DATABASE_URL
  - [ ] DIRECT_URL (for Prisma migrations)
  
  # Authentication
  - [ ] NEXTAUTH_URL (https://your-domain.com)
  - [ ] NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
  
  # Stripe
  - [ ] STRIPE_SECRET_KEY (production key)
  - [ ] STRIPE_PUBLISHABLE_KEY (production key)
  - [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (same as above)
  - [ ] STRIPE_WEBHOOK_SECRET (production webhook endpoint secret)
  
  # Supabase
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  
  # Email (if applicable)
  - [ ] EMAIL_FROM
  - [ ] EMAIL_SERVER_HOST
  - [ ] EMAIL_SERVER_PORT
  - [ ] EMAIL_SERVER_USER
  - [ ] EMAIL_SERVER_PASSWORD
  
  # AI Providers (optional)
  - [ ] OPENAI_API_KEY
  - [ ] ANTHROPIC_API_KEY
  - [ ] GOOGLE_AI_API_KEY
  ```

### 3. Database Setup
- [ ] Production database provisioned
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Seed initial data (features, pricing tiers): `npm run db:seed`
- [ ] Verify database connections
- [ ] Set up database backups

### 4. Stripe Configuration
- [ ] Switch to production Stripe keys
- [ ] Configure webhook endpoint in Stripe Dashboard:
  - Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
  - Events to listen for:
    - [ ] `checkout.session.completed`
    - [ ] `customer.subscription.created`
    - [ ] `customer.subscription.updated`
    - [ ] `customer.subscription.deleted`
    - [ ] `invoice.payment_succeeded`
    - [ ] `invoice.payment_failed`
- [ ] Copy webhook signing secret to environment variables
- [ ] Test webhook endpoint with Stripe CLI: `stripe listen --forward-to https://your-domain.com/api/webhooks/stripe`

### 5. Security Checklist
- [ ] HTTPS enabled (SSL certificate)
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Rate limiting implemented for API routes
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection (React handles this)
- [ ] CORS properly configured
- [ ] Secrets not exposed in client-side code

## Deployment Process 🚀

### 1. Platform Setup (Choose One)

#### Option A: Vercel
- [ ] Connect GitHub repository to Vercel
- [ ] Configure build settings:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install --legacy-peer-deps`
- [ ] Add all environment variables in Vercel dashboard
- [ ] Deploy to production

#### Option B: Netlify
- [ ] Install Next.js adapter: `npm install -D @netlify/plugin-nextjs`
- [ ] Create `netlify.toml`:
  ```toml
  [build]
    command = "npm run build"
    publish = ".next"
  
  [[plugins]]
    package = "@netlify/plugin-nextjs"
  ```
- [ ] Add environment variables in Netlify dashboard
- [ ] Deploy to production

#### Option C: Custom VPS
- [ ] Install Node.js 18+ on server
- [ ] Install PM2: `npm install -g pm2`
- [ ] Clone repository
- [ ] Install dependencies: `npm install --legacy-peer-deps`
- [ ] Build application: `npm run build`
- [ ] Create PM2 ecosystem file
- [ ] Start with PM2: `pm2 start ecosystem.config.js`
- [ ] Set up Nginx as reverse proxy
- [ ] Configure SSL with Let's Encrypt

### 2. DNS Configuration
- [ ] Point domain to hosting platform
- [ ] Configure www subdomain
- [ ] Set up SSL certificate
- [ ] Verify HTTPS redirect works

### 3. Post-Deployment Verification
- [ ] Site loads on production URL
- [ ] All pages render correctly
- [ ] Authentication flow works
- [ ] Stripe checkout process completes
- [ ] Webhook events are received
- [ ] Database queries perform well
- [ ] No console errors in browser
- [ ] Mobile responsive design works

## Monitoring & Maintenance 📊

### 1. Monitoring Setup
- [ ] Error tracking (Sentry, LogRocket, etc.)
- [ ] Performance monitoring (Vercel Analytics, Google Analytics)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Database monitoring
- [ ] Log aggregation

### 2. Backup Strategy
- [ ] Database automated backups
- [ ] Code repository backups
- [ ] Environment variables backed up securely
- [ ] Disaster recovery plan documented

### 3. Performance Optimization
- [ ] Enable Next.js Image Optimization
- [ ] Configure CDN for static assets
- [ ] Implement caching strategies
- [ ] Optimize database queries
- [ ] Enable gzip compression

## Launch Tasks 🎯

### 1. Content & Marketing
- [ ] Update pricing page with live Stripe products
- [ ] Create launch announcement
- [ ] Update social media profiles
- [ ] Prepare email to notify users
- [ ] Update documentation

### 2. Legal & Compliance
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Cookie Policy (if applicable)
- [ ] GDPR compliance (if applicable)
- [ ] Refund policy documented

### 3. Support Setup
- [ ] Support email configured
- [ ] FAQ page created
- [ ] Contact form tested
- [ ] Support ticket system (optional)

## Rollback Plan 🔄

### If Issues Occur:
1. [ ] Document the issue
2. [ ] Revert to previous deployment
3. [ ] Restore database from backup if needed
4. [ ] Notify affected users
5. [ ] Fix issues in staging environment
6. [ ] Re-deploy when resolved

## Final Checks ✓

- [ ] All checklist items completed
- [ ] Team notified of deployment
- [ ] Celebration planned! 🎉

---

## Quick Commands Reference

```bash
# Build for production
npm run build

# Start production server locally
npm run start

# Run database migrations
npx prisma migrate deploy

# Seed production database
npm run db:seed

# Test Stripe webhooks
stripe listen --forward-to https://your-domain.com/api/webhooks/stripe

# Check production logs (Vercel)
vercel logs --prod

# Monitor production (PM2)
pm2 monit
```

## Emergency Contacts

- **Database Issues**: Check Supabase dashboard
- **Payment Issues**: Stripe support
- **Hosting Issues**: Platform-specific support
- **Domain/DNS**: Registrar support

---

**Remember**: Deploy during low-traffic periods and have the team on standby for the first few hours after deployment.