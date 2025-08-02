# Stripe Subscription Setup Complete ✅

## What Was Created

### Products (3 total)
1. **Personal Plan** (prod_SmnbmQUDVDFQlj)
   - $19/month (price_1RrE03AlB5kkCVbokg24MM6S)
   - $190/year (price_1RrE03AlB5kkCVbopPU1otnK)

2. **Company Plan** (prod_Smnb1CKJEbFuSL)
   - $99/month (price_1RrE05AlB5kkCVbo3ReYnBBG)
   - $990/year (price_1RrE05AlB5kkCVboQIPVVXQ4)

3. **Enterprise Plan** (prod_SmnbpwoLIAThIg)
   - $499/month (price_1RrE07AlB5kkCVboQtbLnn9m)

## Environment Variables Added

```env
# Stripe Price IDs
STRIPE_PRICE_PERSONAL_MONTHLY=price_1RrE03AlB5kkCVbokg24MM6S
STRIPE_PRICE_PERSONAL_YEARLY=price_1RrE03AlB5kkCVbopPU1otnK
STRIPE_PRICE_COMPANY_MONTHLY=price_1RrE05AlB5kkCVbo3ReYnBBG
STRIPE_PRICE_COMPANY_YEARLY=price_1RrE05AlB5kkCVboQIPVVXQ4
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_1RrE07AlB5kkCVboQtbLnn9m
```

## Testing the Setup

### 1. Local Webhook Testing

To test webhooks locally, run:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a webhook signing secret like:
```
STRIPE_WEBHOOK_SECRET=whsec_1234567890...
```

Add this to your .env.local file.

### 2. Test Checkout Flow

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:3000/pricing

3. Click "Subscribe" on any paid plan

4. Use test card numbers:
   - Success: `4242 4242 4242 4242`
   - Requires authentication: `4000 0025 0000 3155`
   - Declined: `4000 0000 0000 9995`

### 3. Test Webhook Events

With `stripe listen` running, complete a checkout to trigger:
- `checkout.session.completed`
- `customer.subscription.created`
- `invoice.payment_succeeded`

Check the terminal running `stripe listen` to see the events.

## Production Setup

### 1. Add Webhook Endpoint

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your production URL: `https://your-domain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the signing secret and add to production environment

### 2. Update Environment Variables

Ensure your production environment has:
- All Stripe API keys
- All price IDs
- Webhook signing secret
- `NEXT_PUBLIC_APP_URL` set to your production domain

## Subscription Features

### Free Tier (Default)
- 10 components/month
- 1 AI provider (OpenAI)
- Community support

### Beta Tier
- 50 components/month
- All AI providers
- 2 custom providers
- Beta features access

### Personal ($19/mo or $190/yr)
- 100 components/month
- All AI providers
- 5 custom providers
- Email support
- All frameworks export

### Company ($99/mo or $990/yr)
- 1,000 components/month
- Unlimited custom providers
- 5 team members
- Priority support
- API access

### Enterprise ($499/mo)
- Unlimited everything
- Dedicated support
- Custom integrations
- 99.9% SLA
- White-label options

## Usage Tracking

The system automatically:
1. Tracks component generation usage
2. Enforces limits based on subscription tier
3. Shows usage in dashboard
4. Prevents exceeding limits with helpful upgrade prompts

## Scripts Created

- `scripts/setup-stripe-products.js` - Creates products and prices
- `scripts/get-stripe-prices.js` - Lists existing prices
- `scripts/update-env-prices.js` - Updates .env.local

## Troubleshooting

### Webhook not receiving events
1. Ensure `stripe listen` is running
2. Check the webhook signing secret is correct
3. Verify the endpoint URL matches your app

### Checkout fails
1. Check Stripe API keys are correct
2. Verify price IDs exist in Stripe
3. Check browser console for errors

### Subscription not updating
1. Check webhook events in Stripe Dashboard
2. Verify database connection
3. Check server logs for webhook errors