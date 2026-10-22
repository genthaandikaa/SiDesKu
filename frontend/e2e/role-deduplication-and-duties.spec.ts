import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Role Deduplication & Role-Specific Duties Verification Suite', () => {
  const frontendBaseUrl = 'http://localhost:5173';
  const artifactDir = path.resolve('C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890');

  test('1. Sekdes Deduplication: No redundant menus, unified Data Warga & Arsip', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Login Sekdes
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'sekdes');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=Sekretaris Desa').first()).toBeVisible({ timeout: 10000 });

    // Assert NO duplicate "Register Warga Baru" sidebar button exists (unified into Data & Registrasi Warga)
    const registerWargaBtn = page.locator('aside button:has-text("Register Warga Baru")');
    await expect(registerWargaBtn).toHaveCount(0);

    // Assert unified "Data & Registrasi Warga" button exists
    const dataWargaBtn = page.locator('aside button:has-text("Data & Registrasi Warga")').first();
    await expect(dataWargaBtn).toBeVisible({ timeout: 5000 });

    // Assert NO duplicate "Riwayat Surat" in sidebar (unified into Arsip Surat Sah)
    const riwayatSuratBtn = page.locator('aside button:has-text("Riwayat Surat")');
    await expect(riwayatSuratBtn).toHaveCount(0);

    const arsipSuratBtn = page.locator('aside button:has-text("Arsip Surat Sah")').first();
    await expect(arsipSuratBtn).toBeVisible({ timeout: 5000 });

    // Assert "Agenda & Notulensi Desa" exists
    const agendaBtn = page.locator('aside button:has-text("Agenda & Notulensi Desa")').first();
    await expect(agendaBtn).toBeVisible({ timeout: 5000 });

    // Test Data Warga view
    await dataWargaBtn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=/Master Data Penduduk|Daftarkan Warga Baru/i').first()).toBeVisible({ timeout: 10000 });

    // Screenshot Sekdes deduplicated
    await page.screenshot({
      path: path.join(artifactDir, '142_Sekdes_Deduplicated_Menus.png'),
      fullPage: false,
    });
  });

  test('2. Kades Executive Leadership: SK Kades, Pengawasan APBDes, Monitoring Surat, Aspirasi', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Login Kades
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'kades');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=/Kepala Desa|Bambang Prasetyo/i').first()).toBeVisible({ timeout: 10000 });

    // Verify Executive Dashboard content
    await expect(page.locator('text=Dashboard Eksekutif Kades').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Indeks Desa Membangun').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({
      path: path.join(artifactDir, '143_Kades_Executive_Dashboard.png'),
      fullPage: false,
    });

    // Verify Submenu: Keputusan & SK Kades
    await page.goto(`${frontendBaseUrl}/dashboard?tab=kebijakan-desa`);
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Buku Keputusan & Peraturan Kepala Desa').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({
      path: path.join(artifactDir, '144_Kades_Buku_SK_Keputusan.png'),
      fullPage: false,
    });

    // Verify Submenu: Pengawasan APBDes (PKPKD)
    await page.goto(`${frontendBaseUrl}/dashboard?tab=pengawasan-apbdes`);
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Pengawasan & Otorisasi APBDes').first()).toBeVisible({ timeout: 10000 });

    // Verify Submenu: Monitoring Surat
    await page.goto(`${frontendBaseUrl}/dashboard?tab=monitoring-surat`);
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Monitoring Penerbitan Surat Resmi Desa').first()).toBeVisible({ timeout: 10000 });

    // Verify Submenu: Aspirasi & Pengaduan Warga
    await page.goto(`${frontendBaseUrl}/dashboard?tab=aspirasi-warga`);
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Rekap Aspirasi & Pengaduan Warga').first()).toBeVisible({ timeout: 10000 });
  });

  test('3. Bendahara Desa Duties: BKU, Input Kas, Realisasi APBDes, LPJ, Ekspor', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Login Bendahara Desa
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'bendahara_desa');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=/Kaur Keuangan|Bendahara|Ratna Dewi/i').first()).toBeVisible({ timeout: 10000 });

    // Verify Submenu: Buku Kas Umum (BKU)
    await page.goto(`${frontendBaseUrl}/dashboard?tab=bku`);
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Buku Kas Umum Bendahara Desa').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Semua Transaksi")').first()).toBeVisible();
    await page.screenshot({
      path: path.join(artifactDir, '145_Bendahara_BKU_Buku_Kas_Umum.png'),
      fullPage: false,
    });

    // Verify Submenu: Matriks Realisasi APBDes
    await page.goto(`${frontendBaseUrl}/dashboard?tab=realisasi-apbdes`);
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Matriks Realisasi APBDes Per Bidang').first()).toBeVisible({ timeout: 10000 });

    // Verify Submenu: Laporan Pertanggungjawaban (LPJ)
    await page.goto(`${frontendBaseUrl}/dashboard?tab=laporan-keuangan`);
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Laporan Pertanggungjawaban (LPJ)').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({
      path: path.join(artifactDir, '146_Bendahara_LPJ_Keuangan.png'),
      fullPage: false,
    });

    // Verify Submenu: Ekspor & Cetak
    await page.goto(`${frontendBaseUrl}/dashboard?tab=ekspor-laporan`);
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Ekspor & Cetak Rekapitulasi Kas Desa').first()).toBeVisible({ timeout: 10000 });
  });
});
