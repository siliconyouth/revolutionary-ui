#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function updatePricing() {
  console.log('🔄 Running pricing update migration...\n');
  
  try {
    // Update Beta Tester subscriptions
    const betaResult = await prisma.subscription.updateMany({
      where: { tier: 'beta_tester' },
      data: {
        metadata: {
          features: {
            ai_generations_monthly: -1,
            private_components: -1,
            storage_gb: 20,
            api_calls_daily: 2000,
            bandwidth_gb_monthly: 200
          }
        }
      }
    });
    console.log(`✅ Updated ${betaResult.count} Beta Tester subscriptions`);
    
    // Update Early Bird subscriptions
    const earlyResult = await prisma.subscription.updateMany({
      where: { tier: 'early_bird' },
      data: {
        metadata: {
          features: {
            ai_generations_monthly: -1,
            private_components: -1,
            storage_gb: 20,
            api_calls_daily: 2000,
            bandwidth_gb_monthly: 200
          }
        }
      }
    });
    console.log(`✅ Updated ${earlyResult.count} Early Bird subscriptions`);
    
    // Update Company tier pricing
    const companyResult = await prisma.subscription.updateMany({
      where: { tier: 'company' },
      data: {
        metadata: {
          pricing: {
            monthly: 4999,
            yearly: 41991
          }
        }
      }
    });
    console.log(`✅ Updated ${companyResult.count} Company subscriptions`);
    
    console.log('\n🎉 Pricing update migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updatePricing();