import { Page, expect } from '@playwright/test';

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'admin@brava.test';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'AdminPass123!';

export async function loginAsAdmin(page: Page) {
  await page.goto('/en/login', { waitUntil: 'networkidle' });
  await page.fill('input[type=email]', ADMIN_EMAIL);
  await page.fill('input[type=password]', ADMIN_PASSWORD);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('**/admin', { timeout: 10000 });
}

export async function createOwner(page: Page, namePrefix = 'E2E Owner') {
  const [ownerResp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/admin/owners') && r.request().method() === 'POST'),
    (async () => {
      await page.click('.sidebar-nav button:has-text("All users")');
      await page.fill('input[name=name]', namePrefix);
      await page.fill('input[name=email]', `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`);
      await page.fill('input[name=password]', 'TempPass1234');
      await page.click('button:has-text("Create owner account")');
    })(),
  ]);
  return ownerResp.json();
}

export async function createEvent(page: Page, names: string) {
  await page.click('.sidebar-nav button:has-text("Create event")');
  await page.locator('.wizard-panel select').first().selectOption({ index: 1 });
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

export async function expectNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  return () => expect(errors, `Unexpected page errors: ${errors.join('; ')}`).toEqual([]);
}
