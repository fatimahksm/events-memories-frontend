import { test, expect } from '@playwright/test';
import { loginAsAdmin, createOwner, createEvent } from './fixtures';

test('creates and publishes an event with a public link, admin link, and QR code', async ({ page }) => {
  await loginAsAdmin(page);
  await createOwner(page, 'Wizard Test Owner');
  const event = await createEvent(page, `Wizard Test Event ${Date.now()}`);

  expect(event.slug).toBeTruthy();

  await expect(page.locator('text=Public guest link')).toBeVisible();
  await expect(page.locator('text=Admin management link')).toBeVisible();
  await expect(page.locator('.qr-card img')).toBeVisible();
});
