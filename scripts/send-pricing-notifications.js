#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

const NOTIFICATION_TEMPLATE = {
  betaTester: {
    title: '🎉 Amazing News! Your Beta Tester Benefits Just Got Better!',
    message: `Dear Beta Tester,

We have exciting news! As a valued Beta Tester, you now have access to ALL Personal tier features - completely FREE!

What's new for you:
✅ UNLIMITED AI generations (previously limited)
✅ UNLIMITED private components
✅ 20GB storage (same as Personal)
✅ 2000 API calls daily
✅ 200GB monthly bandwidth
✅ All export formats supported

You're getting $19.99/month worth of features at no cost. This is our way of saying thank you for being an early supporter!

Best regards,
The Revolutionary UI Team`,
    priority: 'high'
  },
  
  earlyBird: {
    title: '🚀 Early Bird Benefits Upgraded!',
    message: `Dear Early Bird Member,

Great news! Your Early Bird subscription just became even more valuable!

What's changed:
✅ UNLIMITED AI generations (no more monthly limits!)
✅ UNLIMITED private components
✅ All Personal tier features included
✅ Still only $9.99/month (50% off regular price!)

You're now getting the full $19.99/month Personal experience for just $9.99. That's incredible value!

Thank you for being an early adopter,
The Revolutionary UI Team`,
    priority: 'high'
  },
  
  company: {
    title: '💼 Important: Company Tier Pricing Update',
    message: `Dear Company Plan Subscriber,

We're writing to inform you of an upcoming change to our Company tier pricing.

What's changing:
• Monthly price: $29.99 → $49.99 (effective next billing cycle)
• Yearly price: $251.91 → $419.91 (30% discount maintained)

Why the change?
We've significantly expanded Company tier features including:
✅ Team workspaces
✅ Private registry access
✅ Advanced analytics
✅ CI/CD integration
✅ Webhook support
✅ Priority support

Your current billing cycle will remain at the old price. The new pricing will take effect on your next renewal.

If you have any questions or concerns, please reach out to our support team.

Best regards,
The Revolutionary UI Team`,
    priority: 'high'
  },
  
  general: {
    title: '📢 Revolutionary UI Pricing Update',
    message: `Dear Revolutionary UI User,

We've made some exciting changes to our pricing tiers!

Key Updates:
🎉 Beta Testers now get ALL Personal features FREE
🚀 Early Bird members get UNLIMITED usage for just $9.99/month
💼 Company tier enhanced with more features (pricing adjusted to $49.99/month)
🏢 Enterprise tier remains at $99.99/month with exclusive features

Visit our pricing page to learn more about what's included in each tier.

Thank you for being part of the Revolutionary UI community!

Best regards,
The Revolutionary UI Team`,
    priority: 'medium'
  }
};

async function sendNotifications() {
  console.log('📧 Sending pricing update notifications...\n');
  
  try {
    // Get all users with subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active'
      },
      include: {
        user: true
      }
    });
    
    console.log(`Found ${subscriptions.length} active subscriptions\n`);
    
    // Group by tier
    const byTier = {
      beta_tester: [],
      early_bird: [],
      company: [],
      personal: [],
      enterprise: []
    };
    
    subscriptions.forEach(sub => {
      if (byTier[sub.tier]) {
        byTier[sub.tier].push(sub);
      }
    });
    
    // Send notifications
    let totalSent = 0;
    
    // Beta Testers
    if (byTier.beta_tester.length > 0) {
      console.log(`📤 Sending to ${byTier.beta_tester.length} Beta Testers...`);
      for (const sub of byTier.beta_tester) {
        await createNotification(sub.userId, NOTIFICATION_TEMPLATE.betaTester);
        totalSent++;
      }
    }
    
    // Early Bird
    if (byTier.early_bird.length > 0) {
      console.log(`📤 Sending to ${byTier.early_bird.length} Early Bird members...`);
      for (const sub of byTier.early_bird) {
        await createNotification(sub.userId, NOTIFICATION_TEMPLATE.earlyBird);
        totalSent++;
      }
    }
    
    // Company
    if (byTier.company.length > 0) {
      console.log(`📤 Sending to ${byTier.company.length} Company subscribers...`);
      for (const sub of byTier.company) {
        await createNotification(sub.userId, NOTIFICATION_TEMPLATE.company);
        totalSent++;
      }
    }
    
    // All other users (general announcement)
    const allUsers = await prisma.user.findMany({
      where: {
        subscription: null
      }
    });
    
    if (allUsers.length > 0) {
      console.log(`📤 Sending general announcement to ${allUsers.length} users...`);
      for (const user of allUsers) {
        await createNotification(user.id, NOTIFICATION_TEMPLATE.general);
        totalSent++;
      }
    }
    
    console.log(`\n✅ Sent ${totalSent} notifications successfully!`);
    
  } catch (error) {
    console.error('❌ Error sending notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createNotification(userId, template) {
  return prisma.notification.create({
    data: {
      userId,
      type: 'PRICING_UPDATE',
      title: template.title,
      message: template.message
    }
  });
}

sendNotifications();