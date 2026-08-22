import { test, expect } from '@playwright/test';
import { loginAsAdmin, createOwner, createEvent } from './fixtures';

// Chromium (like most non-Apple browsers) cannot decode HEIC, so this exercises the
// graceful-fallback path: the guest should see a clear, specific message rather than
// a generic "unsupported format" error or a silent failure.
test('a HEIC photo this browser cannot decode shows a clear, specific message', async ({ page }) => {
  await loginAsAdmin(page);
  await createOwner(page, 'HEIC Test Owner');
  const event = await createEvent(page, `HEIC Test Event ${Date.now()}`);

  await page.goto(`/en/e/${event.slug}`, { waitUntil: 'networkidle' });
  await page.click('button.event-main-button');
  await expect(page.locator('.upload-sheet')).toBeVisible();

  await page.setInputFiles('.upload-sheet input[type=file]', {
    name: 'IMG_0001.heic',
    mimeType: 'image/heic',
    buffer: Buffer.from('not a real image, just standing in for HEIC bytes Chromium cannot decode'),
  });

  await expect(page.locator('.upload-row small.danger')).toHaveText(/can't convert this iPhone photo/i, { timeout: 10000 });
});
