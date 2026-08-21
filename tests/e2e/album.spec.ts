import { test, expect } from '@playwright/test';
import { loginAsAdmin, createOwner, createEvent } from './fixtures';

test('the public event page links "View album" to a dedicated, paginated album page', async ({ page }) => {
  await loginAsAdmin(page);
  await createOwner(page, 'Album Test Owner');
  const event = await createEvent(page, `Album Test Event ${Date.now()}`);

  await page.goto(`/en/e/${event.slug}`, { waitUntil: 'networkidle' });

  await expect(page.locator('#album')).toBeVisible();
  await expect(page.locator('#album .empty-card')).toBeVisible();

  await page.click('a.event-ghost-button:has-text("View album")');
  await page.waitForURL('**/album', { timeout: 10000 });
  await expect(page.locator('.album-page__header h1')).toHaveText(new RegExp(event.names));
  await expect(page.locator('.album-page .empty-card')).toBeVisible();

  await page.click('a:has-text("Back to event")');
  await expect(page).toHaveURL(new RegExp(`/e/${event.slug}$`));
});
