import { test, expect } from '@playwright/test';

test.describe('AI-Powered Features', () => {
  test('should display AI provider settings', async ({ page }) => {
    await page.goto('/settings/ai');
    
    // Check for provider selection
    await expect(page.locator('text=/AI Provider|Model Selection/i')).toBeVisible();
    
    // Check for available providers
    await expect(page.locator('text=/OpenAI|Anthropic|Google|Claude|GPT/i').first()).toBeVisible();
  });

  test('should show AI code generation interface', async ({ page }) => {
    await page.goto('/generate');
    
    // Check for prompt input
    await expect(page.locator('textarea[placeholder*="describe"], textarea[placeholder*="prompt"]')).toBeVisible();
    
    // Check for generate button
    await expect(page.locator('button:has-text("Generate"), button:has-text("Create")')).toBeVisible();
  });

  test('should have AI chat interface', async ({ page }) => {
    await page.goto('/ai-chat');
    
    // Check for chat container
    await expect(page.locator('[data-testid="chat-container"], [class*="chat"]')).toBeVisible();
    
    // Check for message input
    await expect(page.locator('input[placeholder*="message"], textarea[placeholder*="ask"]')).toBeVisible();
  });

  test('should display model comparison', async ({ page }) => {
    await page.goto('/ai/compare');
    
    // Check for comparison table or cards
    await expect(page.locator('table, [data-testid="model-comparison"]')).toBeVisible();
    
    // Check for model names
    await expect(page.locator('text=/GPT-4|Claude|Gemini/i').first()).toBeVisible();
  });
});

test.describe('Screenshot Analysis', () => {
  test('should have screenshot upload interface', async ({ page }) => {
    await page.goto('/analyze');
    
    // Check for upload area
    await expect(page.locator('[data-testid="upload-area"], input[type="file"], [class*="upload"]')).toBeVisible();
    
    // Check for drag and drop text
    await expect(page.locator('text=/drag|drop|upload/i')).toBeVisible();
  });

  test('should show analysis options', async ({ page }) => {
    await page.goto('/analyze');
    
    // Check for analysis type selection
    await expect(page.locator('text=/UI Analysis|Code Generation|Visual/i').first()).toBeVisible();
  });
});

test.describe('Code Generation Workflow', () => {
  test('should show framework selection', async ({ page }) => {
    await page.goto('/generate');
    
    // Check for framework options
    await expect(page.locator('text=/React|Vue|Angular|Svelte/i').first()).toBeVisible();
  });

  test('should have style preferences', async ({ page }) => {
    await page.goto('/generate');
    
    // Check for styling options
    await expect(page.locator('text=/CSS|Tailwind|Styled Components|SCSS/i').first()).toBeVisible();
  });

  test('should display generated code', async ({ page }) => {
    await page.goto('/generate');
    
    // Fill prompt
    const promptInput = page.locator('textarea[placeholder*="describe"], textarea[placeholder*="prompt"]');
    await promptInput.fill('Create a simple button component');
    
    // Click generate
    await page.locator('button:has-text("Generate"), button:has-text("Create")').click();
    
    // Wait for generation
    await page.waitForTimeout(2000);
    
    // Check for code output
    await expect(page.locator('pre, code, [data-testid="generated-code"]').first()).toBeVisible();
  });
});

test.describe('Performance Tests', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have optimized images', async ({ page }) => {
    await page.goto('/');
    
    // Check for next/image usage or optimized formats
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      
      // Check for optimization indicators
      expect(src).toMatch(/(_next|\.webp|\.avif|optimized)/i);
    }
  });
});

test.describe('Accessibility Tests', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    await expect(page.locator('h1')).toBeVisible();
    
    // Check heading hierarchy
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // Alt attribute should exist and not be empty
      expect(alt).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if an element has focus
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).not.toBe('BODY');
  });
});