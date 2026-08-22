import { test, expect, Page } from '@playwright/test';
import { loginAsAdmin, createOwner } from './fixtures';

async function createEventForOwner(page: Page, ownerName: string, names: string) {
  await page.click('.sidebar-nav button:has-text("Create event")');
  const ownerSelect = page.locator('.wizard-panel select').first();
  const ownerValue = await ownerSelect.locator(`option:has-text("${ownerName}")`).getAttribute('value');
  await ownerSelect.selectOption(ownerValue!);
  await page.fill('.wizard-panel input[placeholder="Maya & Karim"]', names);
  await page.locator('input[type=datetime-local]').nth(0).fill('2027-01-01T10:00');
  await page.locator('input[type=datetime-local]').nth(1).fill('2027-02-01T10:00');
  await page.click('button:has-text("Continue")');
  await page.click('button:has-text("Continue")');
  const [publish] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/admin/events/publish')),
    page.click('button:has-text("Publish event")'),
  ]);
  return publish.json();
}

test('super admin can search, filter by owner, extend access, and disable an event link', async ({ page }) => {
  await loginAsAdmin(page);
  const ownerName = `Control Owner ${Date.now()}`;
  await createOwner(page, ownerName);
  const eventName = `Control Event ${Date.now()}`;
  const event = await createEventForOwner(page, ownerName, eventName);

  await page.click('button:has-text("All events")');
  await expect(page.locator('.data-table')).toBeVisible();

  // Search narrows the table down to the matching event.
  await page.fill('.filters-bar input[placeholder*="Name, slug"]', eventName);
  await expect(page.locator('.data-table tbody tr')).toHaveCount(1, { timeout: 5000 });
  await expect(page.locator('.data-table tbody tr').first()).toContainText(eventName);

  // Owner filter also narrows correctly.
  await page.fill('.filters-bar input[placeholder*="Name, slug"]', '');
  await page.selectOption('.filters-bar select >> nth=0', { label: ownerName });
  await expect(page.locator('.data-table tbody tr')).toHaveCount(1, { timeout: 5000 });
  await expect(page.locator('.data-table tbody tr').first()).toContainText(eventName);

  const row = page.locator('.data-table tbody tr').first();
  const expiresBeforeText = await row.locator('td').nth(4).locator('span').textContent();

  // Extend access via the inline (non-blocking) control.
  await row.locator('button:has-text("Extend")').click();
  await row.locator('.extend-inline input').fill('30');
  await row.locator('.extend-inline button:has-text("Confirm")').click();
  await expect(page.locator('.notice--success')).toContainText('Access extended by 30 days');
  await expect(row.locator('td').nth(4).locator('span')).not.toHaveText(expiresBeforeText ?? '');

  // Disable the link — status flips and the public page stops accepting guests.
  await row.locator('button:has-text("Disable link")').click();
  await expect(row.locator('.status-pill')).toHaveText('Disabled');
  await expect(page.locator('.notice--success')).toContainText('now disabled');

  const publicResponse = await page.request.get(`http://localhost:8080/api/public/events/${event.slug}`);
  expect(publicResponse.status()).toBe(410);

  // Re-enable restores it.
  await row.locator('button:has-text("Enable link")').click();
  await expect(row.locator('.status-pill')).toHaveText('Live');
  const publicResponseAfter = await page.request.get(`http://localhost:8080/api/public/events/${event.slug}`);
  expect(publicResponseAfter.status()).toBe(200);

  // Clear filters restores the full list.
  await page.click('.filters-bar button:has-text("Clear filters")');
  await expect(page.locator('.filters-bar select >> nth=0')).toHaveValue('');
});
