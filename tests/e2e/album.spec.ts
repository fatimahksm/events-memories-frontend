import { test, expect, Page } from '@playwright/test';
import { loginAsAdmin, createOwner, createEvent } from './fixtures';

const VALID_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

async function uploadPublic(page: Page, slug: string) {
  await page.goto(`/en/e/${slug}`, { waitUntil: 'networkidle' });
  await page.click('button.event-main-button');
  await page.setInputFiles('.upload-sheet input[type=file]', { name: `pixel-${Date.now()}-${Math.random()}.png`, mimeType: 'image/png', buffer: Buffer.from(VALID_PNG_BASE64, 'base64') });
  await page.click('.upload-sheet button:has-text("Upload memories")');
  await expect(page.locator('.upload-sheet')).toBeHidden({ timeout: 15000 });
}

test('the public event page links "View album" to a dedicated, paginated album page', async ({ page }) => {
  await loginAsAdmin(page);
  await createOwner(page, 'Album Test Owner');
  const event = await createEvent(page, `Album Test Event ${Date.now()}`);

  await page.goto(`/en/e/${event.slug}`, { waitUntil: 'networkidle' });

  // The homepage highlights preview only ever shows liked media, so with nothing
  // liked yet it renders nothing at all — "View album" lives in the hero, unaffected.
  await expect(page.locator('#album')).toHaveCount(0);

  await page.click('a.event-ghost-button:has-text("View album")');
  await page.waitForURL('**/album', { timeout: 10000 });
  await expect(page.locator('.album-page__header h1')).toHaveText(new RegExp(event.names));
  await expect(page.locator('.album-page .empty-card')).toBeVisible();

  await page.click('a:has-text("Back to event")');
  await expect(page).toHaveURL(new RegExp(`/e/${event.slug}$`));
});

test('"View album" is a soft navigation, not a full page reload', async ({ page }) => {
  await loginAsAdmin(page);
  await createOwner(page, 'Album Nav Owner');
  const event = await createEvent(page, `Album Nav Event ${Date.now()}`);

  await uploadPublic(page, event.slug);
  await page.waitForTimeout(2200); // album refresh delay after upload

  // A value only a live JS context carries — a full reload would wipe this out.
  await page.evaluate(() => { (window as unknown as { __marker?: string }).__marker = 'still-here'; });

  await page.click('a.event-ghost-button:has-text("View album")');
  await page.waitForURL('**/album', { timeout: 10000 });

  const marker = await page.evaluate(() => (window as unknown as { __marker?: string }).__marker);
  expect(marker).toBe('still-here');
  await expect(page.locator('.masonry .memory-card').first()).toBeVisible({ timeout: 10000 });
});

test('the album sorts the most-liked media first', async ({ page }) => {
  await loginAsAdmin(page);
  await createOwner(page, 'Album Sort Owner');
  const event = await createEvent(page, `Album Sort Event ${Date.now()}`);

  await uploadPublic(page, event.slug);
  await uploadPublic(page, event.slug);
  await page.waitForTimeout(2200);

  await page.goto(`/en/e/${event.slug}/album`, { waitUntil: 'networkidle' });
  await expect(page.locator('.masonry .memory-card')).toHaveCount(2);

  // Like the second card — recency alone would keep it second, like-count order must move it first.
  await page.locator('.masonry .memory-card').nth(1).locator('.memory-like').click();
  await page.reload({ waitUntil: 'networkidle' });

  const firstCardLikes = await page.locator('.masonry .memory-card').first().locator('.memory-like span').textContent();
  expect(firstCardLikes).toBe('1');
});
