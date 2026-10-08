import { test } from '@playwright/test';
import path from 'path';

test('Capture 2x Crisp Dashboard Screenshots', async ({ page }) => {
  // 2x Retina scale for ultra sharp screenshot
  await page.setViewportSize({ width: 1360, height: 850 });

  // 1. Sekdes Dashboard
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="text"]', 'sekdes');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard**', { timeout: 10000 });
  await page.waitForTimeout(2500);

  await page.screenshot({
    path: path.resolve('e2e', 'screenshots', 'admin_sekdes_2x_overview.png'),
    fullPage: false,
  });

  // 2. RT Dashboard
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="text"]', 'rt01');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard**', { timeout: 10000 });
  await page.waitForTimeout(2500);

  await page.screenshot({
    path: path.resolve('e2e', 'screenshots', 'admin_rt_2x_overview.png'),
    fullPage: false,
  });
});
