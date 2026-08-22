import { test, expect, Page } from '@playwright/test';
import { loginAsAdmin } from './fixtures';

const VALID_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

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

test('an owner can see, download (all + individually), and delete guest uploads', async ({ page }) => {
  await loginAsAdmin(page);
  const ownerName = `Owner Media Test ${Date.now()}`;
  const email = `owner-media-${Date.now()}@example.com`;
  const password = 'OwnerPass1234';
  const [ownerResp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/admin/owners') && r.request().method() === 'POST'),
    (async () => {
      await page.click('.sidebar-nav button:has-text("All users")');
      await page.fill('input[name=name]', ownerName);
      await page.fill('input[name=email]', email);
      await page.fill('input[name=password]', password);
      await page.click('button:has-text("Create owner account")');
    })(),
  ]);
  expect(ownerResp.ok()).toBeTruthy();
  const event = await createEventForOwner(page, ownerName, `Owner Media Event ${Date.now()}`);

  // A guest uploads a photo publicly, exactly as it would happen for real.
  await page.goto(`/en/e/${event.slug}`, { waitUntil: 'networkidle' });
  await page.click('button.event-main-button');
  await page.setInputFiles('.upload-sheet input[type=file]', { name: 'owner-media.png', mimeType: 'image/png', buffer: Buffer.from(VALID_PNG_BASE64, 'base64') });
  await page.click('.upload-sheet button:has-text("Upload memories")');
  await expect(page.locator('.upload-sheet')).toBeHidden({ timeout: 15000 });

  // Sign in as the owner (log out of the admin session first).
  await page.goto('/en/admin', { waitUntil: 'networkidle' });
  await page.click('.sidebar-footer button:has-text("Log out")');
  await page.waitForURL('**/login', { timeout: 10000 });
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', password);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  await expect(page.locator('.event-hero--owner h1')).toHaveText(event.names);
  await expect(page.locator('.owner-media-card')).toHaveCount(1, { timeout: 10000 });

  // Download-all resolves to a real zip archive, not an error page.
  const downloadAllHref = await page.locator('a:has-text("Download all memories")').getAttribute('href');
  const zipResponse = await page.request.get(downloadAllHref!);
  expect(zipResponse.status()).toBe(200);
  expect(zipResponse.headers()['content-type']).toContain('application/zip');

  // The individual photo has its own working download link.
  const card = page.locator('.owner-media-card').first();
  const downloadHref = await card.locator('a:has-text("Download")').getAttribute('href');
  expect(downloadHref).toBeTruthy();
  const singleResponse = await page.request.get(downloadHref!);
  expect(singleResponse.status()).toBe(200);

  // Deleting a photo the owner doesn't like removes it for good, via the custom confirm dialog (not a native popup).
  await card.locator('button:has-text("Delete")').click();
  await page.waitForSelector('.confirm-card', { timeout: 5000 });
  await page.click('.confirm-card button:has-text("Cancel")');
  await expect(page.locator('.confirm-card')).toHaveCount(0);
  await expect(page.locator('.owner-media-card')).toHaveCount(1);

  await card.locator('button:has-text("Delete")').click();
  await page.waitForSelector('.confirm-card', { timeout: 5000 });
  await page.click('.confirm-card button:has-text("Delete")');
  await expect(page.locator('.owner-media-card')).toHaveCount(0, { timeout: 10000 });
  await expect(page.locator('button:has-text("Memories (0)")')).toBeVisible();
});
