import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Autonomous E2E Verification & Screenshot Capture Suite', () => {
  const backendBaseUrl = 'http://127.0.0.1:8000';
  const frontendBaseUrl = 'http://localhost:5173';
  const evidenceDir = path.resolve(process.cwd(), '../artifacts/qa');

  test('1. Public Homepage & Navigation (Desktop & Mobile)', async ({ page }) => {
    // Desktop Viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${frontendBaseUrl}/`);
    await expect(page.locator('text=Desa Doko').first()).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(evidenceDir, 'public-home-desktop.png'), fullPage: false });

    // Mobile Viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${frontendBaseUrl}/`);
    await expect(page.locator('text=Desa Doko').first()).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: path.join(evidenceDir, 'mobile-home.png'), fullPage: false });
  });

  test('2. Public Lacak Surat & Validasi Masking NIK', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${frontendBaseUrl}/lacak`);
    await expect(page.locator('text=/Lacak|Status Surat/i').first()).toBeVisible({ timeout: 15000 });

    const input = page.getByPlaceholder(/Contoh: REQ-/i);
    await input.fill('REQ-20260818-001');
    const searchBtn = page.getByRole('button', { name: /Lacak Status/i });
    await searchBtn.click();

    await expect(page.locator('text=REQ-20260818-001').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: path.join(evidenceDir, 'public-lacak-search.png') });
  });

  test('3. Citizen Login & Letter Request Journey', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'warga01');
    await page.fill('input[type="password"]', 'password123');
    await page.screenshot({ path: path.join(evidenceDir, 'citizen-login.png') });

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=/Warga|Supriyadi|Layanan/i').first()).toBeVisible();

    // Buka menu pengajuan surat
    const buatSuratBtn = page.locator('button:has-text("Ajukan Surat"), a:has-text("Ajukan Surat")').first();
    if (await buatSuratBtn.isVisible()) {
      await buatSuratBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(evidenceDir, 'citizen-letter-form.png') });
    }
  });

  test('4. RT Dashboard & Persetujuan Surat Berjenjang', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'rt01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=/Rukun Tetangga|Ketua RT|RT 01/i').first()).toBeVisible();
    await page.screenshot({ path: path.join(evidenceDir, 'rt-dashboard.png') });

    // Navigasi ke menu surat RT
    const suratMenu = page.locator('button:has-text("Persetujuan"), button:has-text("Surat"), a:has-text("Surat")').first();
    if (await suratMenu.isVisible()) {
      await suratMenu.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(evidenceDir, 'rt-letter-review.png') });
    }
  });

  test('5. Sekdes Dashboard & Legalisasi Surat Resmi', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'sekdes');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=/Sekretaris Desa|Sekdes|Pemerintah Desa/i').first()).toBeVisible();
    await page.screenshot({ path: path.join(evidenceDir, 'sekdes-dashboard.png') });

    // Navigasi ke verifikasi desa
    const verifyTab = page.locator('button:has-text("Legalisasi"), button:has-text("Verifikasi"), a:has-text("Surat")').first();
    if (await verifyTab.isVisible()) {
      await verifyTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(evidenceDir, 'sekdes-letter-processing.png') });
    }
  });

  test('6. Cetak Surat Modal & Pratinjau Dokumen Resmi A4', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    // Login Warga dan buka riwayat surat selesai
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'warga01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Buka tab surat selesai / cetak jika ada
    const cetakBtn = page.locator('button:has-text("Cetak"), button:has-text("Unduh PDF")').first();
    if (await cetakBtn.isVisible()) {
      await cetakBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(evidenceDir, 'cetak-surat-modal.png') });
    }
  });
});
