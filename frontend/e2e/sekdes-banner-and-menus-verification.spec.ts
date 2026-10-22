import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Sekdes Banner Contrast & Complete Duties Menus Verification', () => {
  const frontendBaseUrl = 'http://localhost:5173';
  const artifactDir = path.resolve('C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890');

  test('Sekdes login, Penomoran Surat Banner Contrast, and New Submenus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Step 1: Login as Sekdes
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'sekdes');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=Sekretaris Desa').first()).toBeVisible({ timeout: 10000 });

    // Step 2: Test Penomoran Surat & Calendar Ribbon Contrast
    await page.goto(`${frontendBaseUrl}/dashboard?tab=penomoran-surat`);
    await page.waitForTimeout(1500);

    // Verify calendar text visibility
    const calendarText = page.locator('text=API Kalender Resmi Terhubung').first();
    await expect(calendarText).toBeVisible({ timeout: 10000 });
    
    // Screenshot fixed banner
    await page.screenshot({ 
      path: path.join(artifactDir, '138_Sekdes_Penomoran_Surat_Banner_Fixed.png'),
      fullPage: false 
    });

    // Step 3: Test Buat Surat Baru (Loket Mandiri Sekdes)
    await page.goto(`${frontendBaseUrl}/dashboard?tab=buat-surat`);
    await page.waitForTimeout(1500);
    await expect(page.locator('text=/Loket Pelayanan/i').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ 
      path: path.join(artifactDir, '139_Sekdes_Loket_Buat_Surat_Mandiri.png'),
      fullPage: false 
    });

    // Step 4: Test Buku Register KK
    await page.goto(`${frontendBaseUrl}/dashboard?tab=data-kk`);
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Buku Register Kartu Keluarga').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ 
      path: path.join(artifactDir, '140_Sekdes_Buku_Register_KK.png'),
      fullPage: false 
    });

    // Step 5: Test Buku Mutasi Penduduk (Model A.2)
    await page.goto(`${frontendBaseUrl}/dashboard?tab=mutasi-penduduk`);
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Buku Mutasi Penduduk').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ 
      path: path.join(artifactDir, '141_Sekdes_Buku_Mutasi_Penduduk.png'),
      fullPage: false 
    });
  });
});
