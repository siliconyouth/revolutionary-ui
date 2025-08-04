require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createTestUserWithSubscription() {
  try {
    // Create a test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@revolutionary-ui.com' },
      update: {},
      create: {
        id: 'test-user-id-123',
        email: 'test@revolutionary-ui.com',
        name: 'Test User',
        image: 'https://avatars.githubusercontent.com/u/1?v=4'
      }
    })

    console.log('✅ Test user created:', testUser.email)

    // Create subscription for the user
    const subscription = await prisma.subscription.upsert({
      where: { userId: testUser.id },
      update: {
        tier: 'personal',
        status: 'active',
        billingPeriod: 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeSubscriptionId: 'sub_test_123',
        stripeCustomerId: 'cus_test_123',
        stripePriceId: 'price_test_123'
      },
      create: {
        userId: testUser.id,
        tier: 'personal',
        status: 'active',
        billingPeriod: 'monthly',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeSubscriptionId: 'sub_test_123',
        stripeCustomerId: 'cus_test_123',
        stripePriceId: 'price_test_123'
      }
    })

    console.log('✅ Subscription created:', subscription.tier)

    // Create some usage records
    const metrics = ['ai_generations', 'private_components', 'api_calls_daily']
    const today = new Date()
    const period = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    
    for (const metric of metrics) {
      await prisma.usageRecord.create({
        data: {
          userId: testUser.id,
          subscriptionId: subscription.id,
          metric,
          value: Math.floor(Math.random() * 100),
          period,
          metadata: {}
        }
      })
    }

    console.log('✅ Usage records created')

    // Create some invoices
    for (let i = 0; i < 3; i++) {
      const periodStart = new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000)
      const periodEnd = new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000)
      
      await prisma.invoice.create({
        data: {
          userId: testUser.id,
          subscriptionId: subscription.id,
          stripeInvoiceId: `in_test_${i}`,
          amount: 1999, // $19.99 in cents
          currency: 'usd',
          status: 'paid',
          periodStart,
          periodEnd,
          paidAt: periodEnd,
          metadata: {
            invoice_pdf: `https://stripe.com/invoice/test_${i}.pdf`
          }
        }
      })
    }

    console.log('✅ Invoices created')

    console.log('\n📋 Test data created successfully!')
    console.log('You can now test the billing page with user ID:', testUser.id)
    console.log('\nTo test the billing page:')
    console.log('1. Make sure your app is configured to use this user ID for authentication')
    console.log('2. Visit http://localhost:3001/dashboard/billing')
    
  } catch (error) {
    console.error('❌ Error creating test data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUserWithSubscription()