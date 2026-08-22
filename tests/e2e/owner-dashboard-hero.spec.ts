import { test, expect, Page } from '@playwright/test';
import { loginAsAdmin, createOwner } from './fixtures';

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

test('the owner dashboard is a single-event hero, not a self-service create form', async ({ page }) => {
  await loginAsAdmin(page);
  // Super Admin's own sidebar must stay the plain, untinted default — theming is owner-only.
  await expect(page.locator('.app-sidebar--themed')).toHaveCount(0);

  const ownerName = `Hero Owner ${Date.now()}`;
  const owner = await createOwner(page, ownerName);
  const email: string = owner.email;
  const password = 'TempPass1234';

  const eventName = `Hero Event ${Date.now()}`;
  const event = await createEventForOwner(page, ownerName, eventName);

  // Confirm owners can no longer self-create events server-side, not just that the button is hidden.
  const blocked = await page.request.post('http://localhost:8080/api/owner/events', {
    data: { names: 'Should not work', expiresAt: '2027-01-01T00:00:00Z', mediaDeleteAt: '2027-02-01T00:00:00Z' },
    failOnStatusCode: false,
  });
  expect(blocked.status()).toBe(405);

  await page.click('.sidebar-footer button:has-text("Log out")');
  await page.waitForURL('**/login', { timeout: 10000 });
  await page.fill('input[type=email]', email);
  await page.fill('input[type=password]', password);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  await expect(page.locator('.owner-event-form')).toHaveCount(0);
  await expect(page.locator('.app-sidebar--themed')).toBeVisible();
  await expect(page.locator('.event-hero--owner')).toBeVisible();
  await expect(page.locator('.event-hero--owner h1')).toHaveText(eventName);
  await expect(page.locator('.event-hero--owner')).toContainText('LIVE');

  // Single event → no event switcher clutter.
  await expect(page.locator('.event-switcher-minor')).toHaveCount(0);

  const actions = page.locator('.event-hero--owner .event-hero__actions');
  await expect(actions.locator('a:has-text("Public link")')).toHaveAttribute('href', new RegExp(`/e/${event.slug}$`));
  await expect(actions.locator('button:has-text("Share & print")')).toBeVisible();
  await expect(actions.locator('button:has-text("Edit design & content")')).toBeVisible();
  await expect(actions.locator('a:has-text("Download all memories")')).toBeVisible();
});
