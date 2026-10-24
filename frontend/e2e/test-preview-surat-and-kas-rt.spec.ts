import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify Preview Surat Modal and Kas RT Transaction', async ({ page }) => {
  // Set viewport
  await page.setViewportSize({ width: 1280, height: 800 });

  // 1. Login as RT
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');

  // Fill login
  await page.fill('input[type="text"], input[name="login"], input[placeholder*="Username"]', 'rt01');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Wait for dashboard
  await page.waitForURL('**/dashboard**');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // 2. Open Preview Surat Modal from Antrean / Persetujuan Surat
  const detailButtons = page.locator('button:has-text("Detail Berkas")');
  await expect(detailButtons.first()).toBeVisible({ timeout: 10000 });
  await detailButtons.first().click();
  await page.waitForTimeout(600);

  // Verify PreviewSuratModal is visible
  const modal = page.locator('.modal-content:has-text("Detail Permohonan & Warga")');
  await expect(modal).toBeVisible();

  // Screenshot Tab 1: Detail
  const artifactDir = 'C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890';
  await page.screenshot({ path: path.join(artifactDir, '72_RT_PreviewSuratModal_Detail.png') });

  // Switch to Tab 2: Foto & Berkas Lampiran
  await page.click('button:has-text("Foto & Berkas Lampiran")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, '73_RT_PreviewSuratModal_Lampiran.png') });

  // Click on a thumbnail to open Lightbox Zoom if documents exist
  const firstDocCard = page.locator('.group:has-text("Lampiran #")').first();
  if (await firstDocCard.isVisible()) {
    await firstDocCard.locator('img, .cursor-pointer').first().click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(artifactDir, '74_RT_PreviewSuratModal_Lightbox.png') });

    // Press Escape to close Lightbox
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  // Close Preview Modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 3. Test Kas RT
  // Navigate to Kas RT submenu
  const kasMenu = page.locator('aside button:has-text("Buku Kas RT"), aside a:has-text("Buku Kas RT"), button:has-text("Pembukuan Kas")');
  if (await kasMenu.isVisible()) {
    await kasMenu.click();
  } else {
    await page.goto('http://localhost:5173/dashboard/kas_rt');
  }
  await page.waitForTimeout(800);

  // Click "Catat Transaksi Kas"
  const catatBtn = page.locator('button:has-text("Catat Transaksi Kas"), button:has-text("Catat Iuran")').first();
  await expect(catatBtn).toBeVisible({ timeout: 5000 });
  await catatBtn.click();
  await page.waitForTimeout(500);

  // Fill in Kas form
  const kasModalContent = page.locator('.modal-content:has-text("Catat Transaksi Kas")');
  await expect(kasModalContent).toBeVisible();

  await kasModalContent.locator('input[type="number"]').fill('75000');
  await kasModalContent.locator('input[type="text"][placeholder*="Contoh"]').fill('Iuran Sampah & Kebersihan Lingkungan - Verifikasi E2E');
  await page.screenshot({ path: path.join(artifactDir, '75_RT_KasModal_Input.png') });

  // Submit Kas form
  await kasModalContent.locator('button[type="submit"]').click();
  await page.waitForTimeout(1200);

  // Verify modal is closed and transaction appears
  await expect(kasModalContent).not.toBeVisible();
  await page.screenshot({ path: path.join(artifactDir, '76_RT_KasTable_Updated.png') });

  // 4. Logout & Login as Sekdes to verify Sekdes preview
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="text"], input[name="login"], input[placeholder*="Username"]', 'sekdes');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard**');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const sekdesDetailButtons = page.locator('button:has-text("Detail Berkas")');
  if (await sekdesDetailButtons.first().isVisible({ timeout: 5000 })) {
    await sekdesDetailButtons.first().click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(artifactDir, '77_Sekdes_PreviewSuratModal.png') });
  }
});
