import { test, expect } from '@playwright/test';
import { loginAsAdmin, ADMIN_EMAIL, ADMIN_PASSWORD } from './fixtures';

test.describe('Super Admin authentication', () => {
  test('signs in with valid credentials', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page).toHaveURL(/\/admin$/);
  });

  test('shows a clear error for wrong credentials', async ({ page }) => {
    await page.goto('/en/login', { waitUntil: 'networkidle' });
    await page.fill('input[type=email]', ADMIN_EMAIL);
    await page.fill('input[type=password]', 'definitely-wrong-password');
    await page.click('button:has-text("Sign in")');
    await expect(page.locator('text=Sign in failed')).toBeVisible({ timeout: 10000 });
  });

  test('shows a clear message instead of hanging when the backend is unreachable', async ({ page }) => {
    await page.route('**/api/auth/login', (route) => route.abort('failed'));
    await page.goto('/en/login', { waitUntil: 'networkidle' });
    await page.fill('input[type=email]', ADMIN_EMAIL);
    await page.fill('input[type=password]', ADMIN_PASSWORD);
    await page.click('button:has-text("Sign in")');
    await expect(page.locator('text=Cannot connect to the server')).toBeVisible({ timeout: 5000 });
  });
});
