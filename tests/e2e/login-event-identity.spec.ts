import { test, expect } from '@playwright/test';
import { loginAsAdmin, createOwner, createEvent } from './fixtures';

test('the owner login link carries its event\'s identity onto the login page', async ({ page }) => {
  await loginAsAdmin(page);
  await createOwner(page, 'Login Identity Owner');
  const event = await createEvent(page, `Login Identity Event ${Date.now()}`);

  await expect(page.locator('text=Owner login (email + password)')).toBeVisible();
  const ownerLoginUrl = await page.locator('.copy-link:has-text("Owner login") code').textContent();
  expect(ownerLoginUrl).toContain(`event=${event.slug}`);

  await page.click('.sidebar-footer button:has-text("Log out")');
  await page.waitForURL('**/login', { timeout: 10000 });

  await page.goto(ownerLoginUrl!.replace(/^https?:\/\/[^/]+/, ''), { waitUntil: 'networkidle' });
  await expect(page.locator('.auth-eyebrow')).toContainText(event.names.toUpperCase());
  await expect(page.locator('.auth-visual__content h2')).toContainText(event.names);

  // A bare /login (no event context) must still show the generic panel, unaffected.
  await page.goto('/en/login', { waitUntil: 'networkidle' });
  await expect(page.locator('.auth-eyebrow')).toHaveText('ACCOUNT ACCESS');
});
