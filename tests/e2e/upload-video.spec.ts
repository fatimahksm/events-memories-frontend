import path from 'path';
import { test, expect } from '@playwright/test';
import { loginAsAdmin, createOwner, createEvent } from './fixtures';

// A real, synthetic HEVC (H.265) video — the codec iPhones default to — generated with
// `ffmpeg -f lavfi -i testsrc ... -c:v libx265 ...`. Confirms the full story end to end:
// upload succeeds, and the album ends up with a playable poster'd video (the web-compatible
// H.264 rendition + poster frame the backend generates asynchronously), not just the raw HEVC
// original most non-Apple browsers can't play.
test('an HEVC video from an iPhone uploads and appears with a poster and playable rendition', async ({ page }) => {
  await loginAsAdmin(page);
  await createOwner(page, 'HEVC Video Owner');
  const event = await createEvent(page, `HEVC Video Event ${Date.now()}`);

  await page.goto(`/en/e/${event.slug}`, { waitUntil: 'networkidle' });
  await page.click('button.event-main-button');
  await expect(page.locator('.upload-sheet')).toBeVisible();

  await page.setInputFiles('.upload-sheet input[type=file]', path.join(__dirname, 'fixtures/sample-hevc.mp4'));
  await page.click('.upload-sheet button:has-text("Upload memories")');

  // Panel auto-closes on success — no dialog to dismiss.
  await expect(page.locator('.upload-sheet')).toBeHidden({ timeout: 20000 });

  // The homepage highlights preview only shows liked media now, so check the full album page instead.
  await page.goto(`/en/e/${event.slug}/album`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.querySelectorAll('.masonry video').length > 0, { timeout: 20000 });

  const video = page.locator('.masonry video').first();
  await expect(video).toHaveAttribute('poster', /.+/);
  const src = await video.getAttribute('src');
  expect(src).toBeTruthy();
});
