import { test, expect } from '@playwright/test';
import { loginAsAdmin, createOwner, createEvent } from './fixtures';

test('a guest upload that fails backend validation is shown as an error, not a false success', async ({ page }) => {
  await loginAsAdmin(page);
  await createOwner(page, 'Upload Rejection Owner');
  const event = await createEvent(page, `Upload Rejection Event ${Date.now()}`);

  await page.goto(`/en/e/${event.slug}`, { waitUntil: 'networkidle' });
  await page.click('button.event-main-button');
  await expect(page.locator('.upload-sheet')).toBeVisible();

  await page.setInputFiles('.upload-sheet input[type=file]', {
    name: 'fake.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('this is not really a jpeg file, just plain text pretending to be one'),
  });

  await page.click('.upload-sheet button:has-text("Upload memories")');

  await expect(page.locator('.upload-row small.danger')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.upload-sheet .upload-success')).toHaveCount(0);
});
