// Revolutionary UI Pricing Tiers Configuration

const PRICING_TIERS = {
  beta_tester: {
    id: 'beta_tester',
    name: 'Beta Tester',
    badge: '🚀 Beta',
    description: 'Free access for beta testers helping us improve',
    prices: {
      monthly: 0,
      yearly: 0
    },
    features: [
      { text: 'All Personal features included', included: true, highlight: true },
      { text: 'UNLIMITED AI generations', included: true, highlight: true },
      { text: 'UNLIMITED private components', included: true, highlight: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Version control', included: true },
      { text: 'Email support', included: true },
      { text: 'Export to ALL frameworks', included: true },
      { text: '20GB storage (same as Personal)', included: true },
      { text: 'Beta tester badge', included: true },
      { text: 'Direct feedback channel', included: true },
      { text: 'Team collaboration', included: false }
    ],
    highlighted: false,
    cta: 'Join Beta',
    disabled: false
  },
  
  early_bird: {
    id: 'early_bird',
    name: 'Early Bird Access',
    badge: '🐦 Early Bird',
    description: 'Special pricing for early adopters',
    prices: {
      monthly: 999, // $9.99
      yearly: 8393 // $83.93 (30% off)
    },
    features: [
      { text: 'All Personal features included', included: true, highlight: true },
      { text: 'UNLIMITED AI generations', included: true, highlight: true },
      { text: 'UNLIMITED private components', included: true, highlight: true },
      { text: 'Priority support (exclusive)', included: true, highlight: true },
      { text: 'Early bird pricing locked in forever', included: true, highlight: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Export to ALL frameworks', included: true },
      { text: '20GB storage (same as Personal)', included: true },
      { text: 'Team collaboration', included: false },
      { text: 'Custom component requests', included: false }
    ],
    highlighted: false,
    cta: 'Get Early Access',
    disabled: false
  },
  
  personal: {
    id: 'personal',
    name: 'Personal',
    badge: '⭐ Popular',
    description: 'Perfect for individual developers',
    prices: {
      monthly: 1999, // $19.99
      yearly: 16791 // $167.91 (30% off)
    },
    features: [
      { text: 'Everything in Early Bird', included: true },
      { text: 'AI generations per month', value: 'Unlimited', highlight: true },
      { text: 'Private components', value: 'Unlimited' },
      { text: 'Advanced analytics', included: true },
      { text: 'Export to any framework', included: true },
      { text: 'Email support', included: true },
      { text: 'Component version control', included: true },
      { text: 'Custom CSS/styling', included: true },
      { text: 'Team collaboration', included: false }
    ],
    highlighted: true,
    popular: true,
    cta: 'Start Personal',
    disabled: false
  },
  
  company: {
    id: 'company',
    name: 'Company',
    description: 'For teams and growing companies',
    prices: {
      monthly: 4999, // $49.99
      yearly: 41991 // $419.91 (30% off)
    },
    features: [
      { text: 'Everything in Personal', included: true },
      { text: 'Team members', value: 'Up to 10' },
      { text: 'Team collaboration', included: true, highlight: true },
      { text: 'Shared component library', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom component requests', value: '5/month' },
      { text: 'SSO authentication', included: true },
      { text: 'Advanced permissions', included: true },
      { text: 'Audit logs', included: true },
      { text: 'White-label options', included: false }
    ],
    highlighted: false,
    cta: 'Start Company',
    disabled: false
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    badge: '🏢 Enterprise',
    description: 'For large organizations',
    prices: {
      monthly: 9999, // $99.99
      yearly: 83991 // $839.91 (30% off)
    },
    features: [
      { text: 'Everything in Company', included: true },
      { text: 'Team members', value: 'Unlimited', highlight: true },
      { text: 'Dedicated support', included: true },
      { text: 'Custom AI model training', included: true },
      { text: 'On-premise deployment', included: true },
      { text: 'SLA guarantee', value: '99.9%' },
      { text: 'Advanced security features', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'White-label options', included: true },
      { text: 'Dedicated account manager', included: true }
    ],
    highlighted: false,
    cta: 'Contact Sales',
    contactSales: true,
    disabled: false
  }
};

// Helper functions
const pricingHelpers = {
  formatPrice(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(cents / 100);
  },

  getMonthlyPrice(tier) {
    return PRICING_TIERS[tier]?.prices.monthly || 0;
  },

  getYearlyPrice(tier) {
    return PRICING_TIERS[tier]?.prices.yearly || 0;
  },

  getYearlySavings(tier) {
    const monthly = this.getMonthlyPrice(tier);
    const yearly = this.getYearlyPrice(tier);
    const monthlyAnnualized = monthly * 12;
    return monthlyAnnualized - yearly;
  },

  getYearlySavingsPercent(tier) {
    return 30; // Fixed 30% discount for all tiers
  },

  getTierByStripeProductId(productId) {
    // This would be populated after running setup-stripe-products.js
    // For now, return null
    return null;
  },

  getTierFeatures(tier) {
    return PRICING_TIERS[tier]?.features || [];
  },

  getIncludedFeatures(tier) {
    return this.getTierFeatures(tier).filter(f => f.included);
  },

  getTierLimits(tier) {
    const features = this.getTierFeatures(tier);
    const limits = {};
    
    features.forEach(feature => {
      if (feature.value && !feature.included) {
        const key = feature.text.toLowerCase().replace(/\s+/g, '_');
        limits[key] = feature.value;
      }
    });
    
    return limits;
  }
};

// Comparison data for pricing page
const TIER_COMPARISON = {
  categories: [
    {
      name: 'Core Features',
      features: [
        { 
          name: 'Component Generation', 
          tiers: {
            beta_tester: true,
            early_bird: true,
            personal: true,
            company: true,
            enterprise: true
          }
        },
        { 
          name: 'AI Generations/month', 
          tiers: {
            beta_tester: '50',
            early_bird: '100',
            personal: 'Unlimited',
            company: 'Unlimited',
            enterprise: 'Unlimited'
          }
        },
        { 
          name: 'Framework Support', 
          tiers: {
            beta_tester: 'All',
            early_bird: 'All',
            personal: 'All',
            company: 'All',
            enterprise: 'All'
          }
        },
        { 
          name: 'Component Marketplace', 
          tiers: {
            beta_tester: true,
            early_bird: true,
            personal: true,
            company: true,
            enterprise: true
          }
        }
      ]
    },
    {
      name: 'Collaboration',
      features: [
        { 
          name: 'Team Members', 
          tiers: {
            beta_tester: false,
            early_bird: false,
            personal: '1',
            company: 'Up to 10',
            enterprise: 'Unlimited'
          }
        },
        { 
          name: 'Shared Components', 
          tiers: {
            beta_tester: false,
            early_bird: false,
            personal: false,
            company: true,
            enterprise: true
          }
        },
        { 
          name: 'Team Permissions', 
          tiers: {
            beta_tester: false,
            early_bird: false,
            personal: false,
            company: true,
            enterprise: true
          }
        }
      ]
    },
    {
      name: 'Support',
      features: [
        { 
          name: 'Community Support', 
          tiers: {
            beta_tester: true,
            early_bird: true,
            personal: true,
            company: true,
            enterprise: true
          }
        },
        { 
          name: 'Email Support', 
          tiers: {
            beta_tester: false,
            early_bird: false,
            personal: true,
            company: true,
            enterprise: true
          }
        },
        { 
          name: 'Priority Support', 
          tiers: {
            beta_tester: false,
            early_bird: true,
            personal: false,
            company: true,
            enterprise: true
          }
        },
        { 
          name: 'Dedicated Support', 
          tiers: {
            beta_tester: false,
            early_bird: false,
            personal: false,
            company: false,
            enterprise: true
          }
        }
      ]
    },
    {
      name: 'Enterprise',
      features: [
        { 
          name: 'SSO Authentication', 
          tiers: {
            beta_tester: false,
            early_bird: false,
            personal: false,
            company: true,
            enterprise: true
          }
        },
        { 
          name: 'Custom AI Training', 
          tiers: {
            beta_tester: false,
            early_bird: false,
            personal: false,
            company: false,
            enterprise: true
          }
        },
        { 
          name: 'On-Premise Deploy', 
          tiers: {
            beta_tester: false,
            early_bird: false,
            personal: false,
            company: false,
            enterprise: true
          }
        },
        { 
          name: 'SLA Guarantee', 
          tiers: {
            beta_tester: false,
            early_bird: false,
            personal: false,
            company: false,
            enterprise: '99.9%'
          }
        }
      ]
    }
  ]
};

module.exports = {
  PRICING_TIERS,
  TIER_COMPARISON,
  pricingHelpers
};