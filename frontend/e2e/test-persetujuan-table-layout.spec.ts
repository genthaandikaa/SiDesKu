import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify Persetujuan Table Layout Not Cut Off Across Viewports', async ({ page }) => {
  const artifactDir = 'C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890';

  // 1. Test at 1280x800 (Standard Laptop Resolution)
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="text"], input[name="login"], input[placeholder*="Username"]', 'rt01');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard**');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Navigate to Persetujuan & Verifikasi Surat RT 01
  const persetujuanMenu = page.locator('aside button:has-text("Persetujuan Surat"), aside a:has-text("Persetujuan Surat"), button:has-text("Persetujuan & Verifikasi")');
  if (await persetujuanMenu.isVisible()) {
    await persetujuanMenu.click();
    await page.waitForTimeout(600);
  }

  // Ensure heading is visible
  await expect(page.locator('h2:has-text("Persetujuan & Verifikasi Surat RT 01")')).toBeVisible();

  // Screenshot 1: 1280x800 Laptop View (Matches the user's view)
  await page.screenshot({ path: path.join(artifactDir, '78_RT_Persetujuan_Table_1280px.png') });

  // 2. Test at 1024x768 (Smaller Screen / Split Screen)
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, '79_RT_Persetujuan_Table_1024px.png') });

  // Verify all action buttons are clearly visible and clickable
  const accButtons = page.locator('button:has-text("ACC")');
  await expect(accButtons.first()).toBeVisible();

  const tolakButtons = page.locator('button:has-text("Tolak")');
  await expect(tolakButtons.first()).toBeVisible();

  const detailButtons = page.locator('button:has-text("Detail")');
  await expect(detailButtons.first()).toBeVisible();

  // 3. Test Mobile / Tablet View (768px) to verify sticky right column
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, '80_RT_Persetujuan_Table_768px.png') });
});
