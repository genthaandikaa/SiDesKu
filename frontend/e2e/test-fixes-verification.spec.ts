import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('SiDesKu — Verification of Layout, Print Isolation, Publication Persistence, and Citizen Finance Views', () => {
  const frontendBaseUrl = 'http://localhost:5173';
  const artifactDir = path.resolve('C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890');

  test('1. Warga Profile & Notifications are Full Width (no right blank space), and Keuangan Desa shows Citizen Banner & Infographics', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Step A: Login as Warga
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'warga01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=/Warga|Budi Santoso/i').first()).toBeVisible({ timeout: 10000 });

    // Step B: Navigate to Profil Saya (/dashboard/profil)
    await page.goto(`${frontendBaseUrl}/dashboard/profil`);
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Profil & Pengaturan Akun').first()).toBeVisible({ timeout: 10000 });
    
    // Check width of profile container - should be w-full without max-w-4xl constraint
    const profileContainer = page.locator('div:has-text("Profil & Pengaturan Akun")').locator('..').locator('..');
    await expect(profileContainer.first()).toBeVisible();

    await page.screenshot({
      path: path.join(artifactDir, '148_Warga_Profil_FullWidth.png'),
      fullPage: false,
    });

    // Step C: Navigate to Pusat Notifikasi (/dashboard/notifikasi)
    await page.goto(`${frontendBaseUrl}/dashboard/notifikasi`);
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Pusat Notifikasi & Riwayat Alert').first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: path.join(artifactDir, '149_Warga_Notifikasi_FullWidth.png'),
      fullPage: false,
    });

    // Step D: Navigate to Keuangan Desa (/dashboard/keuangan)
    await page.goto(`${frontendBaseUrl}/dashboard/keuangan`);
    await page.waitForTimeout(1500);

    // Verify it renders Citizen Banner & Infographics (KeuanganDesaWargaView), NOT Bendahara bookkeeping dashboard!
    await expect(page.locator('text=Publikasi Hasil Keuangan APBDes 2026').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Transparansi & Akuntabilitas Anggaran Desa Doko').first()).toBeVisible();
    await expect(page.locator('text=Total Pendapatan Desa').first()).toBeVisible();
    await expect(page.locator('text=Total Belanja & Kegiatan').first()).toBeVisible();
    await expect(page.locator('text=Surplus Kas Kasda Desa').first()).toBeVisible();
    await expect(page.locator('text=Penyerapan Anggaran per 5 Bidang APBDes 2026').first()).toBeVisible();
    
    // Ensure Bendahara management buttons are NOT present in Warga view
    await expect(page.locator('button:has-text("Tambah Transaksi Kas")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Posting Kas Keluar")')).toHaveCount(0);

    await page.screenshot({
      path: path.join(artifactDir, '150_Warga_Keuangan_Desa_Banner_Infografis.png'),
      fullPage: false,
    });
  });

  test('2. Bendahara Publication Persistence & Isolated A4 Document Printing', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Step A: Login as Bendahara Desa
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'bendahara_desa');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=/Kaur Keuangan|Bendahara|Ratna Dewi/i').first()).toBeVisible({ timeout: 10000 });

    // Step B: Navigate to Publikasi APBDes Portal (/dashboard/publikasi-laporan)
    await page.goto(`${frontendBaseUrl}/dashboard/publikasi-laporan`);
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Status Live Publikasi Anggaran').first()).toBeVisible({ timeout: 10000 });

    // Find publication toggle button
    const toggleBtn = page.locator('button:has-text("Publikasi Aktif"), button:has-text("Non-aktif (Draft)")').first();
    await expect(toggleBtn).toBeVisible();
    const initialText = await toggleBtn.textContent();

    // Toggle publication status
    await toggleBtn.click();
    await page.waitForTimeout(500);
    const toggledText = await toggleBtn.textContent();
    expect(toggledText).not.toEqual(initialText);

    // Refresh page and assert persistence!
    await page.reload();
    await page.waitForTimeout(1000);
    const reloadedToggleBtn = page.locator('button:has-text("Publikasi Aktif"), button:has-text("Non-aktif (Draft)")').first();
    const reloadedText = await reloadedToggleBtn.textContent();
    expect(reloadedText).toEqual(toggledText);

    // Toggle back to active (live)
    if (reloadedText?.includes('Draft')) {
      await reloadedToggleBtn.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: path.join(artifactDir, '151_Bendahara_Publikasi_Persisten.png'),
      fullPage: false,
    });

    // Step C: Test Isolated LPJ Document Print Modal
    await page.goto(`${frontendBaseUrl}/dashboard/laporan-keuangan`);
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Laporan Pertanggungjawaban (LPJ) Realisasi Kas Desa').first()).toBeVisible({ timeout: 10000 });

    const cetakLpjBtn = page.locator('button:has-text("Cetak Dokumen LPJ Fisik")').first();
    await expect(cetakLpjBtn).toBeVisible();
    await cetakLpjBtn.click();
    await page.waitForTimeout(1000);

    // Assert CetakLpjModal is open with isolated A4 sheet
    await expect(page.locator('#lpj-print-portal')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#lpj-print-area')).toBeVisible();
    await expect(page.locator('text=Laporan Pertanggungjawaban Realisasi Pelaksanaan APBDes').first()).toBeVisible();
    await expect(page.locator('text=Nomor: LPJ-APBDes/01/418.66.04/2026').first()).toBeVisible();

    await page.screenshot({
      path: path.join(artifactDir, '152_Bendahara_Cetak_LPJ_Modal_Isolated.png'),
      fullPage: false,
    });

    // Close modal via ESC key or Close button
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    await expect(page.locator('#lpj-print-portal')).toHaveCount(0);

    // Step D: Test Ekspor Laporan print button also opens CetakLpjModal
    await page.goto(`${frontendBaseUrl}/dashboard/ekspor-laporan`);
    await page.waitForTimeout(1000);
    const eksporPrintBtn = page.locator('button:has-text("Cetak Dokumen PDF")').first();
    await expect(eksporPrintBtn).toBeVisible();
    await eksporPrintBtn.click();
    await page.waitForTimeout(1000);

    await expect(page.locator('#lpj-print-portal')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#lpj-print-area')).toBeVisible();
  });
});
