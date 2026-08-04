import { test, expect } from '@playwright/test';

test.describe('Admin Login & Dashboard Flow', () => {
  test('should login as admin and load dashboard controls', async ({ page }) => {
    await page.goto('/login');
    
    // Fill credentials
    await page.fill('input[type="email"]', 'admin@private.com');
    await page.fill('input[type="password"]', 'Admin2026');
    
    // Submit form
    await page.click('button[type="submit"]');

    // Verify redirected to admin console
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('aside')).toContainText('Admin Console');
    await expect(page.locator('aside')).toContainText('admin@private.com');
  });

  test('should render sidebar tabs correctly', async ({ page }) => {
    // Inject session
    await page.addInitScript(() => {
      localStorage.setItem('userSession', JSON.stringify({
        id: 1,
        email: 'admin@private.com',
        role: 'admin'
      }));
    });

    await page.goto('/admin');
    await expect(page.locator('button:has-text("Overview")')).toBeVisible();
    await expect(page.locator('button:has-text("Companies")')).toBeVisible();
    await expect(page.locator('button:has-text("Translations")')).toBeVisible();
  });
});
