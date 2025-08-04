# E2E Tests with Playwright

This directory contains end-to-end tests for Revolutionary UI using Playwright.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

## Test Structure

- `example.spec.ts` - Basic Playwright example
- `revolutionary-ui.spec.ts` - Main UI component tests
- `marketplace.spec.ts` - Marketplace functionality tests
- `ai-features.spec.ts` - AI integration tests

## Writing Tests

### Basic test structure
```typescript
import { test, expect } from '@playwright/test';

test('should do something', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

### Test best practices
1. Use data-testid attributes for reliable element selection
2. Wait for elements to be visible before interacting
3. Use descriptive test names
4. Group related tests with describe blocks
5. Keep tests independent and atomic

### Useful selectors
```typescript
// By test ID
page.locator('[data-testid="component-name"]')

// By text
page.locator('text=/pattern/i')

// By role
page.getByRole('button', { name: 'Submit' })

// By placeholder
page.getByPlaceholder('Enter text')
```

## Configuration

See `playwright.config.ts` for:
- Browser configurations
- Base URL settings
- Screenshot and trace settings
- Parallel execution settings

## CI/CD

Tests run automatically on:
- Push to main/develop branches
- Pull requests

Results are uploaded as artifacts in GitHub Actions.

## Debugging Failed Tests

1. Check the HTML report:
   ```bash
   npm run test:e2e:report
   ```

2. Use trace viewer for failed tests:
   ```bash
   npx playwright show-trace trace.zip
   ```

3. Take screenshots on failure (automatic)

4. Use VS Code Playwright extension for debugging

## Tips

- Use `page.pause()` to pause execution during debugging
- Use `test.slow()` to triple the timeout for slow tests
- Use `test.skip()` to temporarily skip tests
- Use `test.only()` to run a single test (remove before commit!)

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)