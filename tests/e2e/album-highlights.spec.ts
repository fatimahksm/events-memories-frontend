import { test, expect } from '@playwright/test';
import { loginAsAdmin, createOwner, createEvent } from './fixtures';

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

test('the homepage highlights only liked memories, and hides itself when none are liked', async ({ page }) => {
  await loginAsAdmin(page);
  await createOwner(page, `Highlights Owner ${Date.now()}`);
  const event = await createEvent(page, `Highlights Event ${Date.now()}`);

  await page.goto(`/en/e/${event.slug}`, { waitUntil: 'networkidle' });
  for (let i = 0; i < 4; i++) {
    await page.click('button.event-main-button');
    await page.setInputFiles('.upload-sheet input[type=file]', { name: `h${i}.png`, mimeType: 'image/png', buffer: Buffer.from(PNG, 'base64') });
    await page.click('.upload-sheet button:has-text("Upload memories")');
    await expect(page.locator('.upload-sheet')).toBeHidden({ timeout: 15000 });
  }

  // With uploads present but nothing liked yet, the highlights section doesn't render at all.
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('#album')).toHaveCount(0);

  // Like two of the four photos from the full album page.
  await page.goto(`/en/e/${event.slug}/album`, { waitUntil: 'networkidle' });
  await page.locator('.memory-like').nth(0).click();
  await page.locator('.memory-like').nth(1).click();
  await page.waitForTimeout(400);

  // The homepage now shows exactly the liked photos, capped at 3, and still links to the full album.
  await page.goto(`/en/e/${event.slug}`, { waitUntil: 'networkidle' });
  await expect(page.locator('#album')).toBeVisible();
  await expect(page.locator('#album .memory-card')).toHaveCount(2);
  await expect(page.locator('#album .memory-like span')).toHaveText(['1', '1']);
  await expect(page.locator('#album .load-more')).toContainText('4');
});
