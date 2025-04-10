const { test, expect } = require('@playwright/test');

test.describe('Step Towards the Light', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('shows main navigation', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav')).toContainText('Home');
    await expect(page.locator('nav')).toContainText('About');
    await expect(page.locator('nav')).toContainText('Content');
    await expect(page.locator('nav')).toContainText('Community');
    await expect(page.locator('nav')).toContainText('Events');
    await expect(page.locator('nav')).toContainText('Shop');
  });

  test('can navigate to all main pages', async ({ page }) => {
    // Home page content
    await expect(page.locator('h1')).toContainText('Welcome to Step Towards the Light');
    
    // About page
    await page.click('nav >> text=About');
    await expect(page.locator('h1')).toContainText('About Us');
    
    // Content page
    await page.click('nav >> text=Content');
    await expect(page.locator('h1')).toContainText('Islamic Content');
    
    // Community page
    await page.click('nav >> text=Community');
    await expect(page.locator('h1')).toContainText('Our Community');
    
    // Events page
    await page.click('nav >> text=Events');
    await expect(page.locator('h1')).toContainText('Events Calendar');
    
    // Shop page
    await page.click('nav >> text=Shop');
    await expect(page.locator('h1')).toContainText('Islamic Shop');
  });

  test('checks responsive design', async ({ page }) => {
    // Mobile view
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    await expect(page.locator('nav')).toBeVisible();
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await expect(page.locator('nav')).toBeVisible();
    
    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('nav')).toBeVisible();
  });
});
