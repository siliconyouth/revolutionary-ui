#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Email template for different user segments
const EMAIL_TEMPLATES = {
  beta_tester: {
    subject: '🎉 Amazing News: Your Beta Tester Account Now Has UNLIMITED Features!',
    body: `
Hi {{name}},

We have some incredible news for you! As a valued Beta Tester, your account has been upgraded with:

🚀 What's New:
• UNLIMITED AI generations (was 50/month)
• UNLIMITED private components (was 5)
• 20GB storage (was 1GB)
• 2,000 API calls/day (was 100)
• All Personal tier features - completely FREE!

That's right - you now have access to EVERYTHING in our Personal tier ($19.99/mo value) at no cost!

Why are we doing this? Simple - we believe in giving back to the community that helps us improve. Your feedback has been invaluable, and this is our way of saying thank you.

🎯 What This Means For You:
• No more worrying about limits
• Build unlimited projects
• Generate components without restrictions
• Store as many private components as you need

The only features you don't have are team collaboration features, which are reserved for our Company and Enterprise tiers.

If you ever want priority support, consider our Early Bird tier at just $9.99/mo - but honestly, you might not need it with all these unlimited features!

Happy building!
The Revolutionary UI Team

P.S. This is not a limited-time offer. These features are yours to keep as a Beta Tester!
`
  },
  
  early_bird: {
    subject: '🐦 Your Early Bird Account Just Got SUPERCHARGED!',
    body: `
Hi {{name}},

Great news! Your Early Bird account has been massively upgraded:

✨ What's New:
• UNLIMITED AI generations (was 100/month)
• UNLIMITED private components (was 10)
• 20GB storage (was 5GB)
• 2,000 API calls/day (was 500)

You now have the same unlimited features as our Personal tier ($19.99/mo) for just $9.99/mo!

🎁 Your Exclusive Benefits:
• Priority support (exclusive to Early Bird!)
• Locked-in pricing forever
• All unlimited features
• Supporting Revolutionary UI development

Thank you for being an early supporter. Your $9.99/mo helps us keep improving Revolutionary UI while giving you incredible value.

Happy building with your new unlimited features!
The Revolutionary UI Team
`
  },
  
  personal: {
    subject: '📢 Important Pricing Update - You\'re Not Affected!',
    body: `
Hi {{name}},

We wanted to let you know about some pricing changes at Revolutionary UI. The good news? Your Personal plan pricing remains unchanged!

What's happening:
• Beta Tester (Free) now has unlimited features
• Early Bird ($9.99) now has unlimited features
• Company tier is now $49.99/mo (was $29.99)
• Your Personal tier remains $19.99/mo

🤔 What this means for you:
Honestly? The Beta Tester tier now has the same features as your Personal tier. We understand if you want to switch to save money. 

However, if you'd like to continue supporting Revolutionary UI at $19.99/mo, we're incredibly grateful. Your support helps us maintain and improve the platform.

If you decide to switch to Beta Tester (free) or Early Bird ($9.99 for priority support), we completely understand. Just email us at support@revolutionary-ui.com.

Thank you for your continued support!
The Revolutionary UI Team
`
  },
  
  company: {
    subject: '📊 Pricing Update: Company Tier Now $49.99/mo',
    body: `
Hi {{name}},

We're writing to inform you of a pricing change for the Company tier.

📈 What's Changing:
• Monthly price: $49.99 (was $29.99)
• Yearly price: $419.91 (was $251.91)
• All features remain the same
• No changes to your current billing cycle

🎁 Good News:
Your current subscription will continue at $29.99/mo until your next renewal. The new pricing will only apply when you renew.

Why the change?
We've significantly enhanced our individual tiers (Beta and Early Bird now have unlimited features), and we're adjusting Company pricing to better reflect the value of team collaboration features.

🤝 Your Options:
1. Continue with Company tier at the new price (great for teams)
2. If you don't need team features, switch to Beta Tester (free with unlimited features)
3. Lock in yearly pricing for additional savings (30% off)

We value your business and want to ensure you're on the right plan. If you have any questions or concerns, please reach out to support@revolutionary-ui.com.

Thank you for your understanding.
The Revolutionary UI Team
`
  }
};

function generateEmailList() {
  // This would connect to your database to get user emails
  // For now, returning sample data structure
  return {
    beta_tester: [
      { email: 'user1@example.com', name: 'Beta User 1' },
      { email: 'user2@example.com', name: 'Beta User 2' }
    ],
    early_bird: [
      { email: 'earlybird1@example.com', name: 'Early Bird 1' }
    ],
    personal: [
      { email: 'personal1@example.com', name: 'Personal User 1' }
    ],
    company: [
      { email: 'company1@example.com', name: 'Company User 1' }
    ]
  };
}

function saveEmailBatch(tier, users, template) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `email-batch-${tier}-${timestamp}.json`;
  const filepath = path.join(process.cwd(), 'email-notifications', filename);
  
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const batch = {
    tier,
    template: template.subject,
    created_at: new Date().toISOString(),
    recipients: users.map(user => ({
      email: user.email,
      name: user.name,
      personalized_body: template.body.replace(/{{name}}/g, user.name || 'there')
    }))
  };
  
  fs.writeFileSync(filepath, JSON.stringify(batch, null, 2));
  console.log(`✅ Created email batch: ${filename}`);
  
  return filepath;
}

function generateAnnouncement() {
  const announcement = `
# 🎉 Revolutionary Pricing Update!

We've made some incredible changes to our pricing:

## What's New:

### 🆓 Beta Tester (Free)
- Now includes **UNLIMITED** AI generations
- **UNLIMITED** private components  
- 20GB storage
- All Personal features for FREE!

### 🐦 Early Bird ($9.99/mo)
- Everything Beta Tester has
- Plus **Priority Support** (exclusive!)
- Locked pricing forever

### 💼 Company ($49.99/mo)
- Updated from $29.99/mo
- All team collaboration features
- Up to 10 team members

## Why These Changes?

We believe in giving back to our community. Individual developers can now access unlimited features for free, while teams get premium collaboration tools at a fair price.

## FAQ

**Q: I'm a Personal subscriber. Should I downgrade?**
A: Honestly, Beta Tester now has all the same features. We'd understand if you switch, but we're grateful if you continue supporting us.

**Q: Will Beta Tester always be free with unlimited features?**
A: Yes! This is our permanent model, not a limited-time offer.

**Q: I'm a Company subscriber. When does the new price apply?**
A: At your next renewal. Current billing cycle continues at the old price.

Learn more at [revolutionary-ui.com/pricing](https://revolutionary-ui.com/pricing)
`;

  const announcementPath = path.join(process.cwd(), 'PRICING_ANNOUNCEMENT.md');
  fs.writeFileSync(announcementPath, announcement);
  console.log(`✅ Created announcement: PRICING_ANNOUNCEMENT.md`);
  
  return announcementPath;
}

async function main() {
  console.log('📧 Generating Pricing Change Notifications\n');
  
  // Generate email batches for each tier
  const emailLists = generateEmailList();
  const batches = [];
  
  for (const [tier, users] of Object.entries(emailLists)) {
    if (EMAIL_TEMPLATES[tier] && users.length > 0) {
      const batchPath = saveEmailBatch(tier, users, EMAIL_TEMPLATES[tier]);
      batches.push(batchPath);
    }
  }
  
  // Generate public announcement
  const announcementPath = generateAnnouncement();
  
  console.log('\n✅ Notification preparation complete!');
  console.log('\nGenerated:');
  console.log(`- ${batches.length} email batches`);
  console.log('- 1 public announcement');
  
  console.log('\nNext steps:');
  console.log('1. Review email batches in email-notifications/');
  console.log('2. Send emails through your email service');
  console.log('3. Post announcement on website/blog');
  console.log('4. Share on social media');
}

if (require.main === module) {
  main();
}

module.exports = { EMAIL_TEMPLATES };