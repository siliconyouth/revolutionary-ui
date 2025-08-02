export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  features: string[]
  limits: {
    componentsPerMonth: number
    aiProvidersPerMonth: number
    customProviders: number
    teamMembers: number
    prioritySupport: boolean
    customIntegrations: boolean
    sla: boolean
  }
  prices: {
    monthly?: {
      amount: number
      priceId?: string
    }
    yearly?: {
      amount: number
      priceId?: string
    }
  }
  highlighted?: boolean
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'beta',
    name: 'Beta Tester',
    description: 'Early access for beta testers',
    features: [
      '50 components per month',
      'All AI providers',
      '2 custom AI providers',
      'Community support',
      'Beta features access',
      'Special beta tester badge'
    ],
    limits: {
      componentsPerMonth: 50,
      aiProvidersPerMonth: -1, // Unlimited
      customProviders: 2,
      teamMembers: 1,
      prioritySupport: false,
      customIntegrations: false,
      sla: false
    },
    prices: {
      monthly: { amount: 0 }, // Free for beta testers
      yearly: { amount: 0 }
    }
  },
  {
    id: 'free',
    name: 'Free',
    description: 'Get started with basic features',
    features: [
      '10 components per month',
      '1 AI provider (OpenAI)',
      'Community support',
      'Basic component types',
      'Export to React only'
    ],
    limits: {
      componentsPerMonth: 10,
      aiProvidersPerMonth: 1,
      customProviders: 0,
      teamMembers: 1,
      prioritySupport: false,
      customIntegrations: false,
      sla: false
    },
    prices: {
      monthly: { amount: 0 },
      yearly: { amount: 0 }
    }
  },
  {
    id: 'personal',
    name: 'Personal',
    description: 'Perfect for individual developers',
    features: [
      '100 components per month',
      'All AI providers',
      '5 custom AI providers',
      'All frameworks export',
      'Email support',
      'Advanced component types',
      'Component history',
      'Private components'
    ],
    limits: {
      componentsPerMonth: 100,
      aiProvidersPerMonth: -1, // Unlimited
      customProviders: 5,
      teamMembers: 1,
      prioritySupport: false,
      customIntegrations: false,
      sla: false
    },
    prices: {
      monthly: { 
        amount: 19,
        priceId: process.env.STRIPE_PRICE_PERSONAL_MONTHLY 
      },
      yearly: { 
        amount: 190, // 2 months free
        priceId: process.env.STRIPE_PRICE_PERSONAL_YEARLY 
      }
    }
  },
  {
    id: 'company',
    name: 'Company',
    description: 'For teams and growing businesses',
    features: [
      '1,000 components per month',
      'All AI providers',
      'Unlimited custom AI providers',
      'Team collaboration (5 seats)',
      'Priority email support',
      'Custom component libraries',
      'API access',
      'Analytics dashboard',
      'SSO authentication'
    ],
    limits: {
      componentsPerMonth: 1000,
      aiProvidersPerMonth: -1,
      customProviders: -1, // Unlimited
      teamMembers: 5,
      prioritySupport: true,
      customIntegrations: false,
      sla: false
    },
    prices: {
      monthly: { 
        amount: 99,
        priceId: process.env.STRIPE_PRICE_COMPANY_MONTHLY 
      },
      yearly: { 
        amount: 990, // 2 months free
        priceId: process.env.STRIPE_PRICE_COMPANY_YEARLY 
      }
    },
    highlighted: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large organizations',
    features: [
      'Unlimited components',
      'All AI providers + custom LLMs',
      'Unlimited custom AI providers',
      'Unlimited team members',
      'Dedicated support',
      'Custom integrations',
      'On-premise deployment option',
      '99.9% SLA',
      'Custom training',
      'White-label options'
    ],
    limits: {
      componentsPerMonth: -1, // Unlimited
      aiProvidersPerMonth: -1,
      customProviders: -1,
      teamMembers: -1,
      prioritySupport: true,
      customIntegrations: true,
      sla: true
    },
    prices: {
      monthly: { 
        amount: 499,
        priceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY 
      }
    }
  }
]

export function getPlanByPriceId(priceId: string): SubscriptionPlan | null {
  for (const plan of SUBSCRIPTION_PLANS) {
    if (plan.prices.monthly?.priceId === priceId || 
        plan.prices.yearly?.priceId === priceId) {
      return plan
    }
  }
  return null
}

export function getPlanById(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null
}

export function canUseFeature(
  planId: string, 
  feature: keyof SubscriptionPlan['limits'],
  currentUsage?: number
): boolean {
  const plan = getPlanById(planId)
  if (!plan) return false
  
  const limit = plan.limits[feature]
  
  // Boolean features
  if (typeof limit === 'boolean') return limit
  
  // Numeric features (-1 means unlimited)
  if (typeof limit === 'number') {
    if (limit === -1) return true
    if (currentUsage === undefined) return true
    return currentUsage < limit
  }
  
  return false
}