import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Modal Konfirmasi Sahkan QR Sekdes', () => {
  const frontendBaseUrl = 'http://localhost:5173';
  const artifactDir = path.resolve('C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890');

  test('Verify confirmation modal opens when clicking Sahkan QR', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // Step 1: Login as Sekdes
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'sekdes');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=Sekretaris Desa').first()).toBeVisible({ timeout: 10000 });

    // Step 2: Navigate to Proses Surat / Verifikasi & Legalisasi Surat
    await page.goto(`${frontendBaseUrl}/dashboard?tab=proses-surat`);
    await page.waitForTimeout(2000);

    // Verify header
    await expect(page.locator('text=Verifikasi & Legalisasi Surat Kepala Desa / Sekdes').first()).toBeVisible({ timeout: 10000 });

    page.on('dialog', async (dialog) => {
      console.log('Dialog popped up:', dialog.message());
      await dialog.accept();
    });

    // Step 3: Find "Sahkan QR" button in table
    const sahkanButtons = page.locator('[data-testid="btn-sahkan-qr"]');
    const count = await sahkanButtons.count();
    console.log(`Found ${count} Sahkan QR table buttons.`);

    if (count > 0) {
      // Click the first "Sahkan QR" button
      await sahkanButtons.first().click();

      // Step 4: Verify Modal appears
      const modal = page.locator('text=Konfirmasi Pengesahan QR').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(400); // Wait for scale-up animation

      // Verify Modal elements
      await expect(page.locator('text=Legalisasi & Penerbitan Surat').first()).toBeVisible();
      await expect(page.locator('text=Alur Pengesahan Resmi:').first()).toBeVisible();
      await expect(page.locator('[data-testid="btn-submit-sahkan-qr"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="btn-batal-sahkan"]').first()).toBeVisible();

      // Take screenshot of the Modal (initial state)
      await page.screenshot({
        path: path.join(artifactDir, '175_Sekdes_Modal_Konfirmasi_Sahkan_QR.png'),
        fullPage: false,
      });

      // Test typing a memo in the optional notes input
      const memoInput = page.locator('input[placeholder*="Berkas persyaratan lengkap"]');
      if (await memoInput.isVisible()) {
        await memoInput.fill('Berkas identitas & pengantar RT terverifikasi lengkap');
        await page.screenshot({
          path: path.join(artifactDir, '176_Sekdes_Modal_Sahkan_QR_Dengan_Catatan.png'),
          fullPage: false,
        });
      }

      // Test Batal button closes modal
      await page.click('[data-testid="btn-batal-sahkan"]');
      await page.waitForTimeout(600);
      await expect(page.locator('text=Konfirmasi Pengesahan QR')).not.toBeVisible();

      // Click again and confirm process
      await sahkanButtons.first().click();
      await page.waitForTimeout(400);
      await expect(page.locator('text=Konfirmasi Pengesahan QR').first()).toBeVisible();
      await page.click('[data-testid="btn-submit-sahkan-qr"]');

      // Wait for process completion & modal close
      await expect(page.locator('text=Konfirmasi Pengesahan QR')).not.toBeVisible({ timeout: 10000 });
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(artifactDir, '177_Sekdes_Surat_Berhasil_Disahkan_Ke_Kades.png'),
        fullPage: false,
      });
    } else {
      console.log('No pending letters with Sahkan QR button currently.');
      await page.screenshot({
        path: path.join(artifactDir, '175_Sekdes_Proses_Surat_Page.png'),
        fullPage: false,
      });
    }
  });
});
