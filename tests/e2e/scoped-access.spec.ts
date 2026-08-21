import { test, expect } from '@playwright/test';
import { loginAsAdmin, createOwner, createEvent } from './fixtures';

test('a per-event access link only ever sees its own event', async ({ page }) => {
  await loginAsAdmin(page);
  await createOwner(page, 'Scoped Access Owner');

  const event1 = await createEvent(page, `Scoped Event One ${Date.now()}`);
  await page.click('button:has-text("Create another event")');
  const event2 = await createEvent(page, `Scoped Event Two ${Date.now()}`);

  await page.click('.sidebar-footer button:has-text("Log out")');
  await page.waitForURL('**/login', { timeout: 10000 });

  await page.goto(`/en/event-access?token=${event1.accessToken}`, { waitUntil: 'networkidle' });
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  await expect(page.locator('.owner-event-form')).toHaveCount(0);
  await expect(page.locator('.event-tabs')).toHaveCount(0);
  await expect(page.locator('text=Event-only access')).toBeVisible();

  const response = await page.request.get(`http://localhost:8080/api/owner/events/${event2.id}/media`);
  expect(response.status()).toBe(403);
});
