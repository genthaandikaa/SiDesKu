import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify 4 Individual Floating Cards Centered on Section Seam', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/', { waitUntil: 'networkidle' });

  // Locate the 4 cards
  const card1 = page.locator('div:has-text("Penduduk Terdata")').last();
  await expect(card1).toBeVisible({ timeout: 10000 });

  await page.waitForTimeout(1000);

  // Capture desktop view showing Hero bottom, floating cards, and Conveyor top
  await page.screenshot({
    path: path.resolve('e2e', 'screenshots', '10_Hero_and_Stats_Seam_Desktop.png'),
    clip: { x: 0, y: 500, width: 1440, height: 600 }
  });

  // Mobile test
  await page.setViewportSize({ width: 390, height: 1100 });
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: path.resolve('e2e', 'screenshots', '10_Hero_and_Stats_Seam_Mobile.png'),
    clip: { x: 0, y: 650, width: 390, height: 650 }
  });
});
