import { test, expect } from '@playwright/test';
import path from 'path';

test('Kades: Clicking Otorisasi Bansos opens Bansos view without redirecting to SK Kades', async ({ page }) => {
  const frontendBaseUrl = 'http://localhost:5173';
  const artifactDir = path.resolve('C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890');

  await page.setViewportSize({ width: 1280, height: 900 });

  // Step 1: Login as Kades
  await page.goto(`${frontendBaseUrl}/login`);
  await page.fill('input[type="text"], input[name="login"]', 'kades');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
  await expect(page.locator('text=/Kepala Desa|Bambang Prasetyo/i').first()).toBeVisible({ timeout: 10000 });

  // Step 2: Click sidebar menu "Otorisasi Bansos" directly
  const otorisasiBansosBtn = page.locator('aside button:has-text("Otorisasi Bansos")').first();
  await expect(otorisasiBansosBtn).toBeVisible({ timeout: 5000 });
  await otorisasiBansosBtn.click();
  await page.waitForTimeout(1500);

  // Step 3: Assert we are on Bansos view
  await expect(page.locator('text=Evaluasi & Kebijakan Bantuan Sosial Desa').first()).toBeVisible({ timeout: 10000 });
  
  // Assert we are NOT on SK Kades
  const skHeading = page.locator('text=Buku Keputusan & Peraturan Kepala Desa');
  await expect(skHeading).toHaveCount(0);

  // Capture screenshot evidence
  await page.screenshot({
    path: path.join(artifactDir, '147_Kades_Otorisasi_Bansos_Success.png'),
    fullPage: false,
  });
});
