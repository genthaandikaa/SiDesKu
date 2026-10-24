import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('SiDesKu — Aspirasi & Pengaduan Warga, RT/RW Filtering Kades, and Zero IDM Download Alert', () => {
  const frontendBaseUrl = 'http://localhost:5173';
  const artifactDir = path.resolve('C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890');

  test('1. Warga can submit Aspirasi & Pengaduan with category, description, and auto RT/RW tagging', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Step A: Login as Warga
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'warga01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Step B: Verify Sidebar has "Aspirasi & Pengaduan" and click it
    const aspirasiNavBtn = page.locator('aside button:has-text("Aspirasi & Pengaduan")').first();
    await expect(aspirasiNavBtn).toBeVisible({ timeout: 5000 });
    await aspirasiNavBtn.click();
    await page.waitForTimeout(1000);

    // Verify page header
    await expect(page.locator('text=Aspirasi & Pengaduan Warga Masyarakat').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Kanal Aspirasi & Suara Warga Doko').first()).toBeVisible();

    // Step C: Click "+ Sampaikan Aspirasi Baru"
    const submitBtn = page.locator('button:has-text("Sampaikan Aspirasi Baru")').first();
    await submitBtn.click();
    await page.waitForTimeout(500);

    // Fill form
    await page.selectOption('select:has-text("Infrastruktur & Jalan")', 'Infrastruktur & Jalan');
    await page.fill('input[placeholder*="Lampu Penerangan"]', 'Lampu Penerangan Jalan Gang Melati Padam');
    await page.fill('textarea[placeholder*="Jelaskan secara rinci"]', 'Mohon perbaikan lampu penerangan jalan di Gang Melati RT 01 yang sudah padam selama 4 hari.');

    // Submit
    await page.click('button[type="submit"]:has-text("Kirim Laporan")');
    await page.waitForTimeout(1500);

    // Verify complaint appears in the list
    await expect(page.locator('text=Lampu Penerangan Jalan Gang Melati Padam').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=RT 01 / RW 01').first()).toBeVisible();

    await page.screenshot({
      path: path.join(artifactDir, '158_Warga_Aspirasi_Pengaduan_Success.png'),
      fullPage: false,
    });
  });

  test('2. Kades can filter Aspirasi by RT & RW and give official Disposisi / Arahan', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Step A: Login as Kades
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'kades');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Step B: Navigate to "Aspirasi & Pengaduan" in Kades sidebar
    const aspirasiNav = page.locator('aside button:has-text("Aspirasi & Pengaduan")').first();
    await expect(aspirasiNav).toBeVisible({ timeout: 5000 });
    await aspirasiNav.click();
    await page.waitForTimeout(1000);

    // Verify RT/RW filter controls are visible
    await expect(page.locator('text=Pusat Pengawasan Aspirasi Wilayah').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('label:has-text("Pilih Rukun Warga (RW)")').first()).toBeVisible();
    await expect(page.locator('label:has-text("Pilih Rukun Tetangga (RT)")').first()).toBeVisible();

    // Select RW 01 and RT 01
    await page.selectOption('select:has-text("Semua RW")', { index: 1 }); // RW 01
    await page.waitForTimeout(500);
    await page.selectOption('select:has-text("Semua RT")', { index: 1 }); // RT 01
    await page.waitForTimeout(500);

    // Find the complaint submitted by warga
    const targetCard = page.locator('div:has-text("Lampu Penerangan Jalan Gang Melati Padam")').first();
    await expect(targetCard).toBeVisible({ timeout: 5000 });

    // Click "Disposisi / Tanggapi"
    const disposisiBtn = targetCard.locator('button:has-text("Disposisi / Tanggapi"), button:has-text("Perbarui Disposisi")').first();
    await disposisiBtn.click();
    await page.waitForTimeout(500);

    // Fill response
    await page.selectOption('select:has-text("Diproses Desa")', 'Diproses Desa');
    await page.fill('textarea[placeholder*="Telah dikoordinasikan"]', 'Telah dikoordinasikan dengan Kasi Kesejahteraan dan Ketua RT 01 untuk perbaikan bohlam pada hari Rabu.');
    await page.click('button[type="submit"]:has-text("Simpan Disposisi Resmi")');
    await page.waitForTimeout(1500);

    // Verify response box appears on the card
    await expect(page.locator('text=Telah dikoordinasikan dengan Kasi Kesejahteraan').first()).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: path.join(artifactDir, '159_Kades_Aspirasi_Filter_RT_RW_Disposisi.png'),
      fullPage: false,
    });
  });

  test('3. Warga: Berkas Kependudukan page loads with zero download intercepts and PDF card handling', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Track download events
    let downloadTriggered = false;
    page.on('download', () => {
      downloadTriggered = true;
    });

    // Login as Warga
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'warga01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Navigate to Berkas Kependudukan
    await page.goto(`${frontendBaseUrl}/dashboard/berkas`);
    await page.waitForTimeout(1500);

    // Verify page rendered
    await expect(page.locator('text=Master Berkas Kependudukan Terpadu').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Cukup Upload Sekali, Otomatis untuk Semua Surat Desa').first()).toBeVisible();

    // Verify no download events were fired
    expect(downloadTriggered).toBe(false);

    // Verify that NO <img> tag has .pdf as src!
    const pdfInImgCount = await page.locator('img[src*=".pdf"]').count();
    expect(pdfInImgCount).toBe(0);

    await page.screenshot({
      path: path.join(artifactDir, '160_Warga_Berkas_Kependudukan_Zero_Alert.png'),
      fullPage: false,
    });
  });
});
