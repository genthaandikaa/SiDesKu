import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify KK Members Modal displays real members correctly', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  // 1. Login as RT
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="text"], input[name="login"], input[placeholder*="Username"]', 'rt01');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard**');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const artifactDir = 'C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890';

  // Navigate to Data Keluarga
  const dataKeluargaButton = page.locator('aside button:has-text("Data Keluarga")');
  await expect(dataKeluargaButton).toBeVisible();
  await dataKeluargaButton.click();
  await page.waitForTimeout(1000);

  // Take screenshot of Data Keluarga table
  await page.screenshot({ path: path.join(artifactDir, '106_KK_Table_With_Correct_Members_Count.png') });

  // Click on "Anggota" button for Bambang Utomo
  const anggotaBtnBambang = page.locator('tr:has-text("Bambang Utomo") button:has-text("Anggota")');
  await expect(anggotaBtnBambang).toBeVisible();
  await anggotaBtnBambang.click();
  await page.waitForTimeout(800);

  // Check that modal shows real members: Bambang Utomo and Siti Rahmawati
  await expect(page.locator('h3:has-text("Keluarga: Bambang Utomo")')).toBeVisible();
  await expect(page.locator('span:has-text("2 Anggota Jiwa")')).toBeVisible();
  const modalContainer = page.locator('.fixed.inset-0');
  await expect(modalContainer.locator('table td:has-text("Bambang Utomo")')).toBeVisible();
  await expect(modalContainer.locator('table td:has-text("Siti Rahmawati")')).toBeVisible();

  await page.screenshot({ path: path.join(artifactDir, '107_KK_Bambang_Utomo_Members_Modal_Fixed.png') });

  // Close modal with ESC or X
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Click on "Anggota" button for Gunawan Wibisono
  const anggotaBtnGunawan = page.locator('tr:has-text("Gunawan Wibisono") button:has-text("Anggota")');
  if (await anggotaBtnGunawan.isVisible()) {
    await anggotaBtnGunawan.click();
    await page.waitForTimeout(800);
    await expect(page.locator('h3:has-text("Keluarga: Gunawan Wibisono")')).toBeVisible();
    await expect(modalContainer.locator('table td:has-text("Gunawan Wibisono")')).toBeVisible();
    await page.screenshot({ path: path.join(artifactDir, '108_KK_Gunawan_Wibisono_Members_Modal_Fixed.png') });
  }
});
