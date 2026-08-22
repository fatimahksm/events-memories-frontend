import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './fixtures';

test('an owner signs in with email and password, landing on their own dashboard', async ({ page }) => {
  await loginAsAdmin(page);

  const email = `owner-login-${Date.now()}@example.com`;
  const password = 'OwnerPass1234';
  const [ownerResp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/admin/owners') && r.request().method() === 'POST'),
    (async () => {
      await page.click('.sidebar-nav button:has-text("All users")');
      await page.fill('input[name=name]', 'Owner Login Test');
      await page.fill('input[name=email]', email);
      await page.fill('input[name=password]', password);
      await page.click('button:has-text("Create owner account")');
    })(),
  ]);
  expect(ownerResp.ok()).toBeTruthy();

  await page.click('.sidebar-footer button:has-text("Log out")');
  await page.waitForURL('**/login', { timeout: 10000 });

  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', password);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  // A fresh owner has no event yet (only Super Admin creates events) — the dashboard
  // shows the "not set up yet" empty state rather than a self-service create form.
  await expect(page.locator('.owner-empty-card')).toBeVisible();
});
