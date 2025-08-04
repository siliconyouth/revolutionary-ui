import { test, expect } from '@playwright/test';

test.describe('Revolutionary UI Components', () => {
  test('should load the main page', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    
    // Check if the page has loaded
    await expect(page).toHaveTitle(/Revolutionary UI/);
  });

  test('should navigate to component factory', async ({ page }) => {
    await page.goto('/');
    
    // Look for factory-related content
    await expect(page.locator('text=/factory/i')).toBeVisible();
  });

  test('should display AI provider options', async ({ page }) => {
    await page.goto('/');
    
    // Check for AI provider mentions
    await expect(page.locator('text=/ai|claude|gpt/i').first()).toBeVisible();
  });
});

test.describe('CLI Interface Tests', () => {
  test('should have CLI commands documented', async ({ page }) => {
    await page.goto('/docs');
    
    // Check for CLI documentation
    await expect(page.locator('text=/revolutionary-ui/i')).toBeVisible();
  });
});

test.describe('Visual Builder Tests', () => {
  test('should load visual builder interface', async ({ page }) => {
    await page.goto('/visual-builder');
    
    // Check for builder elements
    await expect(page.locator('[data-testid="visual-builder"]')).toBeVisible();
  });

  test('should allow component selection', async ({ page }) => {
    await page.goto('/visual-builder');
    
    // Check for component palette
    await expect(page.locator('[data-testid="component-palette"]')).toBeVisible();
  });
});

test.describe('AI Integration Tests', () => {
  test('should show AI provider selection', async ({ page }) => {
    await page.goto('/settings');
    
    // Check for AI provider dropdown
    await expect(page.locator('text=/Select AI Provider/i')).toBeVisible();
  });

  test('should display available AI models', async ({ page }) => {
    await page.goto('/settings');
    
    // Check for model options
    await expect(page.locator('text=/GPT-4|Claude|Gemini/i').first()).toBeVisible();
  });
});

test.describe('Responsive Design Tests', () => {
  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if mobile menu is visible
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check layout adjustments
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Screenshot Tests', () => {
  test('capture homepage screenshot', async ({ page }) => {
    await page.goto('/');
    await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true });
  });

  test('capture visual builder screenshot', async ({ page }) => {
    await page.goto('/visual-builder');
    await page.screenshot({ path: 'screenshots/visual-builder.png' });
  });
});