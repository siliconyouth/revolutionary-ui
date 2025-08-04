# Revolutionary UI - Feature Access Control Guide

## 🎯 Overview

Revolutionary UI implements a comprehensive feature access control system based on subscription tiers. This system ensures users can only access features and stay within usage limits according to their subscription plan.

## 📊 Subscription Tiers & Features

### Tier Overview

| Tier | Monthly Price | Yearly Price | Key Features |
|------|--------------|--------------|--------------|
| **Beta Tester** | Free | Free | Core features, 50 AI generations/month |
| **Early Bird** | $9.99 | $83.91 | 100 AI generations, 10 private components |
| **Personal** | $19.99 | $167.91 | Unlimited AI, unlimited private components |
| **Company** | $29.99 | $251.91 | Team features, 10 members, SSO |
| **Enterprise** | $99.99 | $839.91 | Everything unlimited, custom features |

### Feature Matrix

#### Core Features
| Feature | Beta | Early Bird | Personal | Company | Enterprise |
|---------|------|------------|----------|---------|------------|
| Component Generation | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI Generation | ✅ | ✅ | ✅ | ✅ | ✅ |
| Marketplace Access | ✅ | ✅ | ✅ | ✅ | ✅ |
| Private Components | ❌ | ✅ | ✅ | ✅ | ✅ |
| Framework Export | ✅ | ✅ | ✅ | ✅ | ✅ |
| Version Control | ❌ | ✅ | ✅ | ✅ | ✅ |
| Custom CSS | ❌ | ✅ | ✅ | ✅ | ✅ |

#### Team Features
| Feature | Beta | Early Bird | Personal | Company | Enterprise |
|---------|------|------------|----------|---------|------------|
| Team Collaboration | ❌ | ❌ | ❌ | ✅ | ✅ |
| Shared Components | ❌ | ❌ | ❌ | ✅ | ✅ |
| Team Permissions | ❌ | ❌ | ❌ | ✅ | ✅ |
| Audit Logs | ❌ | ❌ | ❌ | ✅ | ✅ |

#### Support Features
| Feature | Beta | Early Bird | Personal | Company | Enterprise |
|---------|------|------------|----------|---------|------------|
| Email Support | ❌ | ❌ | ✅ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ❌ | ✅ | ✅ |
| Dedicated Support | ❌ | ❌ | ❌ | ❌ | ✅ |
| Custom Requests | ❌ | ❌ | ❌ | 5/mo | Unlimited |

### Usage Limits

| Metric | Beta | Early Bird | Personal | Company | Enterprise |
|--------|------|------------|----------|---------|------------|
| AI Generations/month | 50 | 100 | Unlimited | Unlimited | Unlimited |
| Private Components | 0 | 10 | Unlimited | Unlimited | Unlimited |
| Team Members | 1 | 1 | 1 | 10 | Unlimited |
| API Calls/day | 100 | 500 | 2,000 | 10,000 | Unlimited |
| Storage (GB) | 1 | 5 | 20 | 100 | Unlimited |
| Bandwidth (GB/mo) | 10 | 50 | 200 | 1,000 | Unlimited |

## 🔧 Implementation Guide

### 1. Backend - Protecting API Routes

#### Basic Feature Protection
```typescript
// pages/api/components/generate.ts
import { withFeatureAccess, FeatureFlag } from '@/middleware/feature-access';

export default withFeatureAccess(
  FeatureFlag.AI_GENERATION,
  async (req, res) => {
    // Your API logic here
    // User has access to AI generation
  }
);
```

#### With Usage Tracking
```typescript
// pages/api/components/generate.ts
import { combineMiddleware, requireFeature, trackUsage } from '@/middleware/feature-access';

export default async function handler(req, res) {
  await combineMiddleware(
    requireFeature(FeatureFlag.AI_GENERATION),
    trackUsage('ai_generations_monthly', 1),
    async (req, res) => {
      // Generate component
      // Usage is automatically tracked
    }
  )(req, res);
}
```

#### Multiple Requirements
```typescript
// pages/api/team/invite.ts
export default async function handler(req, res) {
  await combineMiddleware(
    requireFeature(FeatureFlag.TEAM_COLLABORATION),
    requireWithinLimit('team_members'),
    async (req, res) => {
      // Invite team member
    }
  )(req, res);
}
```

### 2. Frontend - React Hooks

#### Check Feature Access
```tsx
import { useFeatureAccess, FeatureFlag } from '@/hooks/useFeatureAccess';

function AIGeneratorButton() {
  const { hasAccess, loading, reason } = useFeatureAccess(FeatureFlag.AI_GENERATION);
  
  if (loading) return <Spinner />;
  
  if (!hasAccess) {
    return (
      <Button disabled>
        AI Generation (Upgrade Required)
        <Tooltip>{reason}</Tooltip>
      </Button>
    );
  }
  
  return <Button onClick={generateWithAI}>Generate with AI</Button>;
}
```

#### Check Usage Limits
```tsx
import { useUsageLimit } from '@/hooks/useFeatureAccess';

function UsageIndicator() {
  const { current, max, percentageUsed, isWithinLimit } = useUsageLimit('ai_generations_monthly');
  
  return (
    <div>
      <ProgressBar value={percentageUsed} />
      <span>{current} / {max === -1 ? '∞' : max} AI generations used</span>
      {!isWithinLimit && <UpgradePrompt />}
    </div>
  );
}
```

#### Combined Check
```tsx
import { useCanPerformAction, FeatureFlag } from '@/hooks/useFeatureAccess';

function GenerateButton() {
  const { canPerform, loading, reason } = useCanPerformAction(
    FeatureFlag.AI_GENERATION,
    'ai_generations_monthly'
  );
  
  return (
    <Button 
      onClick={handleGenerate} 
      disabled={!canPerform || loading}
      title={reason}
    >
      {canPerform ? 'Generate Component' : 'Upgrade to Generate'}
    </Button>
  );
}
```

### 3. Service Layer Usage

#### Direct Service Calls
```typescript
import { SubscriptionService } from '@/services/subscription-service';

// Check feature access
const access = await SubscriptionService.hasFeatureAccess(userId, FeatureFlag.TEAM_COLLABORATION);
if (!access.hasAccess) {
  throw new Error(access.reason);
}

// Check and increment usage
const canUse = await SubscriptionService.checkLimit(userId, 'api_calls_daily');
if (canUse.isWithinLimit) {
  await SubscriptionService.incrementUsage(userId, 'api_calls_daily', 1);
}

// Get full access summary
const summary = await SubscriptionService.getUserAccessSummary(userId);
```

## 🎨 UI Components for Feature Access

### Feature Gate Component
```tsx
import { FeatureGate } from '@/components/subscription/FeatureGate';

<FeatureGate feature={FeatureFlag.ADVANCED_ANALYTICS}>
  <AnalyticsDashboard />
</FeatureGate>

// With fallback
<FeatureGate 
  feature={FeatureFlag.ADVANCED_ANALYTICS}
  fallback={<UpgradePrompt feature="Advanced Analytics" />}
>
  <AnalyticsDashboard />
</FeatureGate>
```

### Usage Limit Display
```tsx
import { UsageDisplay } from '@/components/subscription/UsageDisplay';

<UsageDisplay 
  metric="ai_generations_monthly"
  showUpgradePrompt={true}
  warningThreshold={80} // Show warning at 80% usage
/>
```

## 🔐 Security Considerations

1. **Always validate on the backend** - Frontend checks are for UX only
2. **Use middleware consistently** - Don't bypass feature checks
3. **Track usage accurately** - Increment counters after successful operations
4. **Handle edge cases** - Account for subscription changes mid-period
5. **Graceful degradation** - Show appropriate messages when limits are reached

## 📊 Analytics & Monitoring

### Track Feature Usage
```typescript
// Automatically tracked when using hasFeatureAccess
// Manual tracking:
await prisma.featureUsage.create({
  data: {
    userId,
    feature: FeatureFlag.CUSTOM_AI_TRAINING,
    metadata: { model: 'gpt-4', duration: 1234 }
  }
});
```

### Monitor Usage Patterns
```sql
-- Most used features by tier
SELECT 
  s.tier,
  fu.feature,
  COUNT(*) as usage_count
FROM feature_usage fu
JOIN subscriptions s ON fu.user_id = s.user_id
GROUP BY s.tier, fu.feature
ORDER BY usage_count DESC;

-- Users approaching limits
SELECT 
  u.email,
  ur.metric,
  ur.value as current_usage,
  tf.limit_value as max_limit,
  (ur.value::float / tf.limit_value) * 100 as percentage_used
FROM usage_records ur
JOIN users u ON ur.user_id = u.id
JOIN subscriptions s ON ur.subscription_id = s.id
JOIN tier_limits tf ON s.tier = tf.tier AND ur.metric = tf.metric
WHERE (ur.value::float / tf.limit_value) > 0.8;
```

## 🚀 Best Practices

1. **Progressive Enhancement**
   - Show all features but gate access
   - Provide clear upgrade paths
   - Explain benefits of upgrading

2. **User Experience**
   - Cache feature access checks
   - Show usage progress clearly
   - Warn before limits are reached
   - Provide upgrade prompts contextually

3. **Performance**
   - Batch feature checks when possible
   - Use React Query or SWR for caching
   - Implement optimistic UI updates

4. **Testing**
   ```typescript
   // Mock subscription service in tests
   jest.mock('@/services/subscription-service', () => ({
     hasFeatureAccess: jest.fn().mockResolvedValue({ hasAccess: true }),
     checkLimit: jest.fn().mockResolvedValue({ isWithinLimit: true })
   }));
   ```

## 🆘 Troubleshooting

### Common Issues

1. **Feature access denied incorrectly**
   - Check subscription status in database
   - Verify feature flag spelling
   - Ensure user session is valid

2. **Usage limits not enforcing**
   - Check period calculation (monthly vs daily)
   - Verify usage records are being created
   - Ensure middleware is applied to routes

3. **Subscription not syncing from Stripe**
   - Verify webhook endpoint is configured
   - Check webhook secret is correct
   - Review Stripe webhook logs

## 📝 Checklist for New Features

When adding a new feature that should be gated:

- [ ] Add feature flag to `FeatureFlag` enum
- [ ] Update `TIER_FEATURES` configuration
- [ ] Add to feature matrix documentation
- [ ] Protect API routes with middleware
- [ ] Add frontend feature checks
- [ ] Update pricing page to show feature
- [ ] Test with different subscription tiers
- [ ] Add usage tracking if applicable
- [ ] Update customer documentation

## 🎉 Next Steps

1. **Implement subscription management UI** - Let users view/change plans
2. **Add usage dashboard** - Show current usage and limits
3. **Create admin panel** - Monitor all subscriptions and usage
4. **Set up alerts** - Notify users approaching limits
5. **Implement grace periods** - Handle edge cases gracefully

The feature access system is now fully configured and ready to protect your application's premium features!