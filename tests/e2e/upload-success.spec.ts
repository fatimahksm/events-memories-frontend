import { test, expect } from '@playwright/test';
import { loginAsAdmin, createOwner, createEvent } from './fixtures';

// A real, valid 1x1 transparent PNG — used to confirm a genuine upload still
// completes promptly through the finalize + status-polling flow.
const VALID_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

test('a valid guest upload closes the panel and shows a small thank-you toast', async ({ page }) => {
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

  // The panel auto-closes on full success — no dialog, no OK button to click.
  await expect(page.locator('.upload-sheet')).toBeHidden({ timeout: 15000 });
  const toast = page.locator('.memory-toast');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('❤');
  await expect(toast).toContainText('Thank you');
  // It self-dismisses without any user interaction.
  await expect(toast).toBeHidden({ timeout: 6000 });
});
