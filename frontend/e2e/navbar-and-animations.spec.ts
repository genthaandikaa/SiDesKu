import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify Fixed Navbar, Typewriter & Counter Animations', async ({ page, isMobile }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // 1. Check typewriter animation is underway
  const heroParagraph = page.locator('p:has-text("Platform")');
  await expect(heroParagraph).toBeVisible();

  // 2. Wait for typewriter to complete
  await expect(heroParagraph).toContainText('Platform terpadu di Kabupaten Kediri', { timeout: 8000 });
  await expect(heroParagraph).toContainText('QR resmi', { timeout: 8000 });

  // 3. Check stats are counted up
  const wargaStat = page.locator('text=Penduduk Terdata').locator('..').locator('div').first();
  await expect(wargaStat).toBeVisible();
  const wargaVal = await wargaStat.textContent();
  expect(wargaVal).toContain('+');

  const mode = isMobile ? 'mobile' : 'desktop';

  // Screenshot completed typewriter
  await page.screenshot({ path: path.resolve('e2e', 'screenshots', `01_Home_Full_Typewriter_${mode}.png`) });

  // 4. Test Scroll: Navbar must stay fixed at top (y = 0)
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);

  const header = page.locator('header');
  await expect(header).toBeVisible();
  const boundingBox = await header.boundingBox();
  expect(boundingBox?.y).toBe(0);

  // Take screenshot while scrolled
  await page.screenshot({ path: path.resolve('e2e', 'screenshots', `01_Home_Scrolled_Fixed_Navbar_${mode}.png`) });
});
