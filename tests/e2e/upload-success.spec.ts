import { test, expect } from '@playwright/test';
import { loginAsAdmin, createOwner, createEvent } from './fixtures';

// A real, valid 1x1 transparent PNG — used to confirm a genuine upload still
// completes promptly through the finalize + status-polling flow.
const VALID_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

test('a valid guest upload completes to the success screen', async ({ page }) => {
  await loginAsAdmin(page);
  await createOwner(page, 'Upload Success Owner');
  const event = await createEvent(page, `Upload Success Event ${Date.now()}`);

  await page.goto(`/en/e/${event.slug}`, { waitUntil: 'networkidle' });
  await page.click('button.event-main-button');
  await expect(page.locator('.upload-sheet')).toBeVisible();

  await page.setInputFiles('.upload-sheet input[type=file]', {
    name: 'pixel.png',
    mimeType: 'image/png',
    buffer: Buffer.from(VALID_PNG_BASE64, 'base64'),
  });

  await page.click('.upload-sheet button:has-text("Upload memories")');

  await expect(page.locator('.upload-sheet .upload-success')).toBeVisible({ timeout: 15000 });
});
