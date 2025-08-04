# Revolutionary UI - Stripe Subscription Setup Guide

## 📋 Overview

Revolutionary UI uses Stripe for subscription management with 5 tiers:
- **Beta Tester** - Free
- **Early Bird Access** - $9.99/mo
- **Personal** - $19.99/mo
- **Company** - $49.99/mo
- **Enterprise** - $99.99/mo

All paid tiers include a 30% discount for yearly subscriptions.

## 🚀 Quick Setup

### 1. Run the Setup Script

```bash
node scripts/setup-stripe-products.js
```

This script will:
- Create all 5 products in Stripe
- Create monthly and yearly prices for each tier
- Generate environment variables
- Save configuration to `stripe-products.json`

### 2. Add Environment Variables

After running the script, add the generated environment variables to your `.env.local`:

```env
# Stripe Product IDs
STRIPE_PRODUCT_BETA_TESTER=prod_xxxxx
STRIPE_PRODUCT_EARLY_BIRD=prod_xxxxx
STRIPE_PRODUCT_PERSONAL=prod_xxxxx
STRIPE_PRODUCT_COMPANY=prod_xxxxx
STRIPE_PRODUCT_ENTERPRISE=prod_xxxxx

# Stripe Price IDs - Monthly
STRIPE_PRICE_EARLY_BIRD_MONTHLY=price_xxxxx
STRIPE_PRICE_PERSONAL_MONTHLY=price_xxxxx
STRIPE_PRICE_COMPANY_MONTHLY=price_xxxxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxxxx

# Stripe Price IDs - Yearly
STRIPE_PRICE_EARLY_BIRD_YEARLY=price_xxxxx
STRIPE_PRICE_PERSONAL_YEARLY=price_xxxxx
STRIPE_PRICE_COMPANY_YEARLY=price_xxxxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxxxx
```

## 💳 Pricing Structure

### Beta Tester (Free)
- **Monthly**: $0
- **Yearly**: $0
- **Features**:
  - Access to all core features
  - Early access to new features
  - Direct feedback channel
  - Beta tester badge
  - Community recognition
  - 50 AI generations/month

### Early Bird Access
- **Monthly**: $9.99
- **Yearly**: $83.93 (save $36.05)
- **Features**:
  - Everything in Beta
  - Priority support
  - Early bird pricing locked in forever
  - 100 AI generations/month
  - Access to component marketplace
  - 10 private components

### Personal
- **Monthly**: $19.99
- **Yearly**: $167.91 (save $72.17)
- **Features**:
  - Everything in Early Bird
  - Unlimited AI generations
  - Unlimited private components
  - Advanced analytics
  - Export to any framework
  - Email support

### Company
- **Monthly**: $49.99
- **Yearly**: $419.91 (save $179.97)
- **Features**:
  - Everything in Personal
  - Up to 10 team members
  - Team collaboration
  - Shared component library
  - Priority support
  - 5 custom component requests/month
  - SSO authentication

### Enterprise
- **Monthly**: $99.99
- **Yearly**: $839.91 (save $360.17)
- **Features**:
  - Everything in Company
  - Unlimited team members
  - Dedicated support
  - Custom AI model training
  - On-premise deployment option
  - 99.9% SLA guarantee
  - Advanced security features
  - Custom integrations
  - White-label options

## 🛠️ Implementation

### 1. Pricing Page Component

The pricing page is available at:
```
marketplace-nextjs/src/components/pricing/PricingPage.tsx
```

Usage:
```tsx
import { PricingPage } from '@/components/pricing/PricingPage';

export default function Pricing() {
  const handleSelectTier = (tierId: string, billingPeriod: 'monthly' | 'yearly') => {
    // Handle subscription creation
    console.log(`Selected ${tierId} - ${billingPeriod}`);
  };

  return (
    <PricingPage 
      currentTier="personal" 
      onSelectTier={handleSelectTier}
    />
  );
}
```

### 2. Subscription Management API

Create these API endpoints:

```typescript
// pages/api/subscriptions/create.ts
export async function POST(req: Request) {
  const { priceId } = await req.json();
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
  });
  
  return Response.json({ sessionId: session.id });
}
```

### 3. Webhook Handler

```typescript
// pages/api/webhooks/stripe.ts
export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  const event = stripe.webhooks.constructEvent(
    await req.text(),
    sig,
    webhookSecret
  );
  
  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful subscription
      break;
    case 'customer.subscription.updated':
      // Handle subscription changes
      break;
    case 'customer.subscription.deleted':
      // Handle cancellation
      break;
  }
  
  return Response.json({ received: true });
}
```

## 🧪 Testing

### Test Cards (Test Mode)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

### Test Subscriptions
1. Use test mode API keys
2. Create test subscriptions
3. Test upgrade/downgrade flows
4. Test cancellation
5. Test webhook handling

## 📊 Dashboard Management

### View in Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Navigate to Products to see all tiers
3. Check Prices for monthly/yearly options
4. Monitor Subscriptions for active customers

### Metrics to Track
- Monthly Recurring Revenue (MRR)
- Subscription growth rate
- Churn rate by tier
- Popular tiers
- Upgrade/downgrade patterns

## 🔧 Configuration Files

### pricing-tiers.js
Located at `config/pricing-tiers.js`, contains:
- Tier definitions
- Feature lists
- Pricing calculations
- Helper functions

### stripe-products.json
Generated after running setup script:
- Product IDs
- Price IDs
- Configuration metadata

## 🚨 Important Notes

1. **Test Mode First**: Always test in Stripe test mode before going live
2. **Webhook Security**: Set up webhook endpoint secret for security
3. **Proration**: Stripe automatically handles proration for plan changes
4. **Currencies**: Currently USD only, can add more currencies later
5. **Taxes**: Configure tax settings in Stripe Dashboard

## 📝 Checklist

- [ ] Run setup script
- [ ] Add environment variables
- [ ] Configure webhook endpoint
- [ ] Test subscription flow
- [ ] Set up customer portal
- [ ] Configure tax settings
- [ ] Test in production mode
- [ ] Monitor initial subscriptions

## 🆘 Troubleshooting

### Common Issues

1. **Invalid API Key**
   - Ensure you're using the correct key (test vs live)
   - Check key starts with `sk_test_` or `sk_live_`

2. **Webhook Failures**
   - Verify webhook secret is correct
   - Check endpoint URL is accessible
   - Ensure proper response (200 OK)

3. **Price Not Found**
   - Verify price IDs match environment variables
   - Check you're in the correct mode (test/live)

## 📞 Support

For Stripe-specific issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For Revolutionary UI integration:
- Check `/docs/stripe-integration.md`
- GitHub Issues: https://github.com/revolutionary-ui/issues