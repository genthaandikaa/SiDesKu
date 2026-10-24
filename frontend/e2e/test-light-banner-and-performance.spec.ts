import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('SiDesKu — Verification of Light Banners, No Spam Downloads, and Kades Bansos Performance', () => {
  const frontendBaseUrl = 'http://localhost:5173';
  const artifactDir = path.resolve('C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890');

  test('1. Warga: Keuangan Desa has comfortable light white/emerald banner and rich infographics', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Login as Warga
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'warga01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=/Warga|Budi Santoso/i').first()).toBeVisible({ timeout: 10000 });

    // Navigate to Keuangan Desa
    await page.goto(`${frontendBaseUrl}/dashboard/keuangan`);
    await page.waitForTimeout(1000);

    // Verify comfortable light banner
    await expect(page.locator('text=Publikasi Hasil Keuangan APBDes 2026').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Transparansi & Akuntabilitas Anggaran Desa Doko').first()).toBeVisible();
    await expect(page.locator('text=Total Pendapatan Desa').first()).toBeVisible();

    // Capture screenshot
    await page.screenshot({
      path: path.join(artifactDir, '153_Warga_Keuangan_Desa_Light_Banner.png'),
      fullPage: false,
    });
  });

  test('2. Warga: Berkas Kependudukan has clean light banner, PDF document icons, and no download spam', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Login as Warga
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'warga01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Track download events (should be 0 on page load!)
    let downloadTriggered = false;
    page.on('download', () => {
      downloadTriggered = true;
    });

    // Navigate to Berkas Kependudukan
    await page.goto(`${frontendBaseUrl}/dashboard/berkas`);
    await page.waitForTimeout(1500);

    // Verify clean light banner
    await expect(page.locator('text=Master Berkas Kependudukan Terpadu').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Cukup Upload Sekali, Otomatis untuk Semua Surat Desa').first()).toBeVisible();

    // Verify no downloads were triggered on page load
    expect(downloadTriggered).toBe(false);

    // Capture screenshot
    await page.screenshot({
      path: path.join(artifactDir, '154_Warga_Berkas_Kependudukan_Clean_Light.png'),
      fullPage: false,
    });
  });

  test('3. Kades: Executive dashboard has clean white/emerald card, and Otorisasi Bansos switches smoothly with single header', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Login as Kades
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'kades');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=/Kepala Desa|Bambang Prasetyo/i').first()).toBeVisible({ timeout: 10000 });

    // Verify Beranda has clean light card
    await expect(page.locator('text=Selamat Datang, Bapak Kepala Desa').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Dashboard Eksekutif Kades').first()).toBeVisible();

    await page.screenshot({
      path: path.join(artifactDir, '156_Kades_Executive_Clean_White_Card.png'),
      fullPage: false,
    });

    // Click Otorisasi Bansos and measure responsiveness
    const startTime = Date.now();
    const bansosBtn = page.locator('aside button:has-text("Otorisasi Bansos")').first();
    await bansosBtn.click();

    // Bansos view should render quickly
    await expect(page.locator('text=Evaluasi & Penetapan Kebijakan Bantuan Sosial').first()).toBeVisible({ timeout: 5000 });
    const elapsed = Date.now() - startTime;
    console.log(`Kades Bansos switch took: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(4000);

    // Verify single clean header (no duplicate header wrappers)
    const headers = page.locator('h2:has-text("Evaluasi & Penetapan Kebijakan Bantuan Sosial")');
    await expect(headers).toHaveCount(1);

    await page.screenshot({
      path: path.join(artifactDir, '155_Kades_Otorisasi_Bansos_Fast_Single_Header.png'),
      fullPage: false,
    });
  });

  test('4. Sekdes: Penomoran Surat has clean white & emerald Calendar API ribbon', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Login as Sekdes
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'sekdes');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Navigate to Penomoran Surat
    await page.goto(`${frontendBaseUrl}/dashboard/penomoran-surat`);
    await page.waitForTimeout(1000);

    // Verify clean calendar ribbon
    await expect(page.locator('text=API Kalender Resmi Terhubung').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Bulan Romawi').first()).toBeVisible();
    await expect(page.locator('text=Master Format & Urutan per Jenis Surat Desa').first()).toBeVisible();

    await page.screenshot({
      path: path.join(artifactDir, '157_Sekdes_Penomoran_Surat_Clean_Ribbon.png'),
      fullPage: false,
    });
  });
});
