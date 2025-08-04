#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

// Read existing content
let content = fs.readFileSync(envPath, 'utf8');

// Update Company price IDs
const updates = {
  'STRIPE_PRICE_COMPANY_MONTHLY=price_1RsDmsAlB5kkCVbouoIPi32r': 'STRIPE_PRICE_COMPANY_MONTHLY=price_1RsEAyAlB5kkCVbooqG92Ifp',
  'STRIPE_PRICE_COMPANY_YEARLY=price_1RsDmtAlB5kkCVbozrVbqReV': 'STRIPE_PRICE_COMPANY_YEARLY=price_1RsEAzAlB5kkCVbooZI9f5bx'
};

// Apply updates
for (const [oldValue, newValue] of Object.entries(updates)) {
  if (content.includes(oldValue)) {
    content = content.replace(oldValue, newValue);
    console.log(`✅ Updated: ${newValue.split('=')[0]}`);
  }
}

// Write back
fs.writeFileSync(envPath, content);

console.log('\n✅ Successfully updated Company tier price IDs in .env.local');
console.log('New prices: $49.99/mo, $419.91/yr (30% off)');