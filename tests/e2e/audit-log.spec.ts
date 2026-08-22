import { test, expect } from '@playwright/test';
import { loginAsAdmin, createOwner } from './fixtures';

test('creating an owner shows up in the admin audit log', async ({ page }) => {
  await loginAsAdmin(page);
  await createOwner(page, `Audit Log Owner ${Date.now()}`);

  await page.click('.sidebar-nav button:has-text("Audit log")');
  await expect(page.locator('.data-table')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('.data-table tbody tr').first().locator('text=OWNER CREATED')).toBeVisible();
});
