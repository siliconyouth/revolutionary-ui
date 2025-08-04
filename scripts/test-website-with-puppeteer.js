const puppeteer = require('puppeteer');

async function testWebsite() {
  let browser;
  
  try {
    console.log('🚀 Starting Puppeteer tests...\n');
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 800 });
    
    // Test pages
    const pagesToTest = [
      { url: 'http://localhost:3000', name: 'Home Page' },
      { url: 'http://localhost:3000/test-simple', name: 'Simple Test Page' },
      { url: 'http://localhost:3000/test', name: 'Environment Test Page' },
      { url: 'http://localhost:3000/test/billing', name: 'Billing Test Page' },
      { url: 'http://localhost:3000/pricing', name: 'Pricing Page' },
      { url: 'http://localhost:3000/auth/signin', name: 'Sign In Page' },
      { url: 'http://localhost:3000/dashboard/billing', name: 'Dashboard Billing Page' }
    ];
    
    for (const testPage of pagesToTest) {
      console.log(`\n📄 Testing ${testPage.name} (${testPage.url})...`);
      
      try {
        // Navigate to page
        const response = await page.goto(testPage.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        
        // Check response status
        const status = response.status();
        console.log(`   Status: ${status}`);
        
        // Get page title
        const title = await page.title();
        console.log(`   Title: ${title}`);
        
        // Check for errors in console
        page.on('console', msg => {
          if (msg.type() === 'error') {
            console.log(`   ❌ Console Error: ${msg.text()}`);
          }
        });
        
        // Check for page content
        const bodyText = await page.evaluate(() => document.body.innerText);
        console.log(`   Content length: ${bodyText.length} characters`);
        
        // Check for specific elements
        if (testPage.url.includes('/test-simple')) {
          const hasH1 = await page.$('h1') !== null;
          console.log(`   Has H1: ${hasH1 ? '✅' : '❌'}`);
        }
        
        if (testPage.url.includes('/test/billing')) {
          const hasButton = await page.$('button') !== null;
          console.log(`   Has Button: ${hasButton ? '✅' : '❌'}`);
          
          // Try to set test auth
          const authButton = await page.$('button');
          if (authButton) {
            const buttonText = await page.evaluate(el => el.textContent, authButton);
            console.log(`   Button text: "${buttonText}"`);
          }
        }
        
        // Take screenshot
        await page.screenshot({ 
          path: `screenshots/test-${testPage.name.toLowerCase().replace(/\s+/g, '-')}.png`,
          fullPage: true 
        });
        console.log(`   ✅ Screenshot saved`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    // Test billing API with authentication
    console.log('\n🔐 Testing authenticated billing flow...');
    
    try {
      // First set test auth
      await page.goto('http://localhost:3000/test/billing');
      await page.waitForSelector('button', { timeout: 5000 });
      
      // Click "Set Test Auth" button
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text.includes('Set Test Auth')) {
          await button.click();
          console.log('   ✅ Clicked "Set Test Auth" button');
          await page.waitForTimeout(1000);
          break;
        }
      }
      
      // Click "Test All Endpoints" button
      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text.includes('Test All Endpoints')) {
          await button.click();
          console.log('   ✅ Clicked "Test All Endpoints" button');
          await page.waitForTimeout(3000);
          break;
        }
      }
      
      // Check for results
      const preElements = await page.$$('pre');
      console.log(`   Found ${preElements.length} result sections`);
      
      // Take screenshot of results
      await page.screenshot({ 
        path: 'screenshots/test-billing-results.png',
        fullPage: true 
      });
      
    } catch (error) {
      console.log(`   ❌ Auth test error: ${error.message}`);
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync('screenshots')) {
  fs.mkdirSync('screenshots');
}

// Run tests
testWebsite();