import { test, expect } from '@playwright/test';

test.describe('Public Navigation & Directory Features', () => {
  test('should load homepage and render breaking banner', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.breaking-banner')).toBeVisible();
  });

  test('should navigate to business directory and search', async ({ page }) => {
    await page.goto('/unternehmen');
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should navigate to news section', async ({ page }) => {
    await page.goto('/news');
    await expect(page).toHaveURL(/\/news/);
  });

  test('should display login page and perform invalid auth validation', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid@user.com');
    await page.fill('input[type="password"]', 'WrongPassword');
    
    // Listen for alert dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Authentication failed');
      await dialog.dismiss();
    });

    await page.click('button[type="submit"]');
  });
});
