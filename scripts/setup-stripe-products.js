#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ No .env.local file found!');
  process.exit(1);
}

dotenv.config({ path: envPath });

// Check for Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found in .env.local');
  console.error('Please configure your Stripe API key first.');
  process.exit(1);
}

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const print = {
  title: (text) => console.log(`\n${colors.bright}${colors.blue}${text}${colors.reset}`),
  section: (text) => console.log(`\n${colors.bright}${colors.cyan}${text}${colors.reset}`),
  info: (text) => console.log(`${colors.dim}${text}${colors.reset}`),
  success: (text) => console.log(`${colors.green}✅ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}❌ ${text}${colors.reset}`),
  warning: (text) => console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`),
  price: (text) => console.log(`${colors.magenta}💰 ${text}${colors.reset}`),
};

// Product definitions
const PRODUCTS = [
  {
    id: 'beta_tester',
    name: 'Beta Tester',
    description: 'Free access for beta testers helping us improve Revolutionary UI',
    features: [
      'Access to all core features',
      'Early access to new features',
      'Direct feedback channel',
      'Beta tester badge',
      'Community recognition'
    ],
    metadata: {
      tier: 'beta',
      order: '1'
    },
    prices: {
      monthly: 0,
      yearly: 0
    }
  },
  {
    id: 'early_bird',
    name: 'Early Bird Access',
    description: 'Special pricing for early adopters of Revolutionary UI',
    features: [
      'All Beta features',
      'Priority support',
      'Early bird pricing locked in',
      '100 AI generations/month',
      'Access to component marketplace'
    ],
    metadata: {
      tier: 'early_bird',
      order: '2'
    },
    prices: {
      monthly: 999, // $9.99
      yearly: Math.floor(999 * 12 * 0.7) // 30% discount
    }
  },
  {
    id: 'personal',
    name: 'Personal',
    description: 'Perfect for individual developers and freelancers',
    features: [
      'All Early Bird features',
      'Unlimited AI generations',
      'Private components',
      'Advanced analytics',
      'Export to any framework',
      'Email support'
    ],
    metadata: {
      tier: 'personal',
      order: '3',
      popular: 'true'
    },
    prices: {
      monthly: 1999, // $19.99
      yearly: Math.floor(1999 * 12 * 0.7) // 30% discount
    }
  },
  {
    id: 'company',
    name: 'Company',
    description: 'For teams and growing companies',
    features: [
      'All Personal features',
      'Up to 10 team members',
      'Team collaboration',
      'Shared component library',
      'Priority support',
      'Custom component requests',
      'SSO authentication'
    ],
    metadata: {
      tier: 'company',
      order: '4',
      team_size: '10'
    },
    prices: {
      monthly: 4999, // $49.99
      yearly: Math.floor(4999 * 12 * 0.7) // 30% discount
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with advanced needs',
    features: [
      'All Company features',
      'Unlimited team members',
      'Dedicated support',
      'Custom AI model training',
      'On-premise deployment option',
      'SLA guarantee',
      'Advanced security features',
      'Custom integrations',
      'White-label options'
    ],
    metadata: {
      tier: 'enterprise',
      order: '5',
      team_size: 'unlimited'
    },
    prices: {
      monthly: 9999, // $99.99
      yearly: Math.floor(9999 * 12 * 0.7) // 30% discount
    }
  }
];

// Helper function to format price
function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

// Helper function to calculate yearly savings
function calculateSavings(monthlyPrice) {
  const yearlyWithoutDiscount = monthlyPrice * 12;
  const yearlyWithDiscount = Math.floor(yearlyWithoutDiscount * 0.7);
  const savings = yearlyWithoutDiscount - yearlyWithDiscount;
  return {
    yearly: yearlyWithDiscount,
    savings: savings,
    savingsPercent: 30
  };
}

// Main setup function
async function setupStripeProducts() {
  print.title('🚀 Revolutionary UI - Stripe Products Setup');
  print.info('Setting up subscription products and prices in Stripe...\n');

  // Check if we're in test mode
  const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
  if (isTestMode) {
    print.success('Using Stripe TEST mode');
  } else {
    print.warning('Using Stripe LIVE mode - charges will be real!');
  }

  const results = {
    products: [],
    prices: [],
    errors: []
  };

  // Create products and prices
  for (const productDef of PRODUCTS) {
    try {
      print.section(`Creating ${productDef.name}...`);
      
      // Create product
      const product = await stripe.products.create({
        name: productDef.name,
        description: productDef.description,
        metadata: {
          ...productDef.metadata,
          features: JSON.stringify(productDef.features) // Store features in metadata
        }
      });
      
      print.success(`Created product: ${product.id}`);
      results.products.push(product);

      // Create monthly price (if not free)
      if (productDef.prices.monthly > 0) {
        const monthlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: productDef.prices.monthly,
          currency: 'usd',
          recurring: {
            interval: 'month'
          },
          metadata: {
            tier: productDef.metadata.tier,
            billing_period: 'monthly'
          }
        });
        
        print.price(`Monthly price: ${formatPrice(productDef.prices.monthly)} - ID: ${monthlyPrice.id}`);
        results.prices.push({ 
          type: 'monthly', 
          tier: productDef.id, 
          price: monthlyPrice 
        });
      } else {
        print.info('Free tier - no monthly price created');
      }

      // Create yearly price (if not free)
      if (productDef.prices.yearly > 0) {
        const yearlyPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: productDef.prices.yearly,
          currency: 'usd',
          recurring: {
            interval: 'year'
          },
          metadata: {
            tier: productDef.metadata.tier,
            billing_period: 'yearly',
            discount_percent: '30'
          }
        });
        
        const monthlyCost = productDef.prices.monthly;
        const yearlyCost = productDef.prices.yearly;
        const yearlySavings = (monthlyCost * 12) - yearlyCost;
        
        print.price(`Yearly price: ${formatPrice(yearlyCost)} - ID: ${yearlyPrice.id}`);
        print.success(`Yearly savings: ${formatPrice(yearlySavings)} (30% off)`);
        
        results.prices.push({ 
          type: 'yearly', 
          tier: productDef.id, 
          price: yearlyPrice 
        });
      }

      // Show features
      print.info('\nFeatures:');
      productDef.features.forEach(feature => {
        print.info(`  • ${feature}`);
      });

    } catch (error) {
      print.error(`Failed to create ${productDef.name}: ${error.message}`);
      results.errors.push({ product: productDef.name, error: error.message });
    }
  }

  // Generate environment variables
  print.section('📝 Environment Variables to Add');
  print.info('\nAdd these to your .env.local file:\n');

  console.log('# Stripe Product IDs');
  results.products.forEach(product => {
    const tierName = product.metadata.tier.toUpperCase();
    console.log(`STRIPE_PRODUCT_${tierName}=${product.id}`);
  });

  console.log('\n# Stripe Price IDs');
  results.prices.forEach(({ type, tier, price }) => {
    const tierName = tier.toUpperCase();
    const periodName = type.toUpperCase();
    console.log(`STRIPE_PRICE_${tierName}_${periodName}=${price.id}`);
  });

  // Save to file
  const configPath = path.join(process.cwd(), 'stripe-products.json');
  const config = {
    created: new Date().toISOString(),
    mode: isTestMode ? 'test' : 'live',
    products: results.products.map(p => ({
      id: p.id,
      name: p.name,
      metadata: p.metadata
    })),
    prices: results.prices.map(({ type, tier, price }) => ({
      id: price.id,
      tier,
      type,
      amount: price.unit_amount,
      currency: price.currency,
      interval: price.recurring?.interval
    }))
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  print.success(`\nConfiguration saved to stripe-products.json`);

  // Summary
  print.title('📊 Summary');
  console.log('\n📦 Products Created:');
  PRODUCTS.forEach(product => {
    if (product.prices.monthly === 0) {
      console.log(`  • ${product.name}: FREE`);
    } else {
      const savings = calculateSavings(product.prices.monthly);
      console.log(`  • ${product.name}:`);
      console.log(`    - Monthly: ${formatPrice(product.prices.monthly)}`);
      console.log(`    - Yearly: ${formatPrice(product.prices.yearly)} (save ${formatPrice(savings.savings)})`);
    }
  });

  if (results.errors.length > 0) {
    print.warning('\n⚠️  Errors encountered:');
    results.errors.forEach(err => {
      print.error(`  ${err.product}: ${err.error}`);
    });
  }

  print.success('\n✨ Stripe products setup complete!');
  print.info('\nNext steps:');
  print.info('1. Add the environment variables to your .env.local');
  print.info('2. Update your pricing page with the new price IDs');
  print.info('3. Test the subscription flow in your application');
  
  if (isTestMode) {
    print.info('\n💡 Tip: Use Stripe test cards for testing:');
    print.info('   4242 4242 4242 4242 - Successful payment');
    print.info('   4000 0000 0000 0002 - Declined card');
  }
}

// Check if Stripe package is installed
async function checkDependencies() {
  try {
    require('stripe');
  } catch {
    print.warning('Installing Stripe package...');
    const { execSync } = require('child_process');
    execSync('npm install stripe', { stdio: 'inherit' });
  }
}

// Main execution
async function main() {
  try {
    await checkDependencies();
    await setupStripeProducts();
  } catch (error) {
    print.error(`\nFatal error: ${error.message}`);
    if (error.message.includes('API key')) {
      print.info('\nMake sure your STRIPE_SECRET_KEY is valid.');
      print.info('Get your API key from: https://dashboard.stripe.com/apikeys');
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { setupStripeProducts };