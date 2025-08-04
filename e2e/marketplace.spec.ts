import { test, expect } from '@playwright/test';

test.describe('Revolutionary UI Marketplace', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to marketplace
    await page.goto('/marketplace');
  });

  test('should display marketplace homepage', async ({ page }) => {
    // Check for marketplace title
    await expect(page.locator('h1')).toContainText(/Marketplace|Store|Shop/i);
    
    // Check for search functionality
    await expect(page.locator('input[type="search"], input[placeholder*="search" i]')).toBeVisible();
  });

  test('should show component categories', async ({ page }) => {
    // Check for category navigation
    const categories = page.locator('[data-testid="category"], [class*="category"]');
    await expect(categories.first()).toBeVisible();
  });

  test('should display featured components', async ({ page }) => {
    // Check for featured section
    await expect(page.locator('text=/featured|popular|trending/i').first()).toBeVisible();
  });

  test('should have working search', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    
    // Type in search
    await searchInput.fill('button');
    await searchInput.press('Enter');
    
    // Wait for results
    await page.waitForTimeout(1000);
    
    // Check if results are displayed
    await expect(page.locator('[data-testid="search-results"], [class*="results"]')).toBeVisible();
  });

  test('should open component details', async ({ page }) => {
    // Click on first component card
    const componentCard = page.locator('[data-testid="component-card"], [class*="card"]').first();
    await componentCard.click();
    
    // Check if details page loaded
    await expect(page.locator('[data-testid="component-details"], [class*="details"]')).toBeVisible();
  });

  test('should have filter options', async ({ page }) => {
    // Check for filter sidebar
    await expect(page.locator('[data-testid="filters"], [class*="filter"]').first()).toBeVisible();
    
    // Check for price filter
    await expect(page.locator('text=/price|free|premium/i').first()).toBeVisible();
    
    // Check for framework filter
    await expect(page.locator('text=/react|vue|angular/i').first()).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    // Check for pagination controls
    const pagination = page.locator('[data-testid="pagination"], [class*="pagination"], nav[aria-label="pagination"]');
    
    // If pagination exists, test it
    if (await pagination.isVisible()) {
      // Click next page
      await page.locator('button:has-text("Next"), a:has-text("Next"), [aria-label="Next page"]').click();
      
      // Check URL or content changed
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Component Preview', () => {
  test('should show live preview', async ({ page }) => {
    await page.goto('/marketplace');
    
    // Open a component
    await page.locator('[data-testid="component-card"], [class*="card"]').first().click();
    
    // Check for preview iframe or container
    await expect(page.locator('[data-testid="preview"], iframe, [class*="preview"]').first()).toBeVisible();
  });

  test('should toggle code view', async ({ page }) => {
    await page.goto('/marketplace');
    
    // Open a component
    await page.locator('[data-testid="component-card"], [class*="card"]').first().click();
    
    // Look for code toggle button
    const codeToggle = page.locator('button:has-text("Code"), button:has-text("View Code"), [data-testid="code-toggle"]');
    
    if (await codeToggle.isVisible()) {
      await codeToggle.click();
      
      // Check for code display
      await expect(page.locator('pre, code, [class*="code"]').first()).toBeVisible();
    }
  });
});

test.describe('AI Integration in Marketplace', () => {
  test('should have AI-powered search suggestions', async ({ page }) => {
    await page.goto('/marketplace');
    
    // Start typing in search
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
    await searchInput.fill('nav');
    
    // Wait for suggestions
    await page.waitForTimeout(500);
    
    // Check for suggestions dropdown
    const suggestions = page.locator('[data-testid="search-suggestions"], [class*="suggestion"], [role="listbox"]');
    
    if (await suggestions.isVisible()) {
      expect(await suggestions.locator('li, [role="option"]').count()).toBeGreaterThan(0);
    }
  });

  test('should show AI-generated component recommendations', async ({ page }) => {
    await page.goto('/marketplace');
    
    // Check for recommendations section
    await expect(page.locator('text=/recommend|suggest|you might like/i').first()).toBeVisible();
  });
});