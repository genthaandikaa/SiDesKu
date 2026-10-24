import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify status badges, rejection explanation in detail modal, and refresh panel persistence', async ({ page }) => {
  const artifactDir = 'C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890';

  // Desktop viewport for table inspection
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

  // Scroll to table on Beranda
  const table = page.locator('table').first();
  await table.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  // Take screenshot of Table showing correct status badges (no blue "Ditolak")
  await page.screenshot({ path: path.join(artifactDir, '89_RT_Table_Correct_Status_Badges.png') });

  // 2. Test Refresh Persistence on Notifikasi panel
  console.log('Testing refresh persistence on Notifikasi...');
  const notifBell = page.locator('button[aria-label="Notifikasi"]');
  await notifBell.click();
  await page.waitForTimeout(300);

  const bukaSemuaNotifBtn = page.locator('button:has-text("Buka Semua Notifikasi")');
  await bukaSemuaNotifBtn.click();
  await page.waitForTimeout(500);

  // Verify Notifikasi panel is active
  await expect(page.locator('h3:has-text("Pusat Notifikasi"), h2:has-text("Notifikasi")').first()).toBeVisible();

  // RELOAD THE PAGE
  console.log('Reloading page while on Notifikasi...');
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Verify it stays on Notifikasi!
  await expect(page.locator('h3:has-text("Pusat Notifikasi"), h2:has-text("Notifikasi")').first()).toBeVisible();
  await page.screenshot({ path: path.join(artifactDir, '91_Panel_Notifikasi_After_Refresh.png') });

  // 3. Test Refresh Persistence on Data Warga RT
  console.log('Testing refresh persistence on Data Warga RT...');
  const dataWargaBtn = page.locator('aside button:has-text("Data Warga RT")');
  if (await dataWargaBtn.isVisible()) {
    await dataWargaBtn.click();
    await page.waitForTimeout(600);

    // RELOAD THE PAGE
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify Data Warga heading is visible
    await expect(page.locator('h2:has-text("Buku Induk Kependudukan & Data Warga RT 01")')).toBeVisible();
    await page.screenshot({ path: path.join(artifactDir, '92_Panel_DataWarga_After_Refresh.png') });
  }

  // 4. Test Mobile modal for rejected surat
  console.log('Testing mobile modal rejection explanation...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/dashboard?tab=persetujuan_surat');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  // Find rejected row or any row to view detail
  const rejectedRow = page.locator('tbody tr:has-text("Ditolak")').first();
  if (await rejectedRow.isVisible()) {
    const detailBtn = rejectedRow.locator('button:has-text("Detail")');
    await detailBtn.click();
    await page.waitForTimeout(600);

    // Check if rejection explanation banner is visible
    const rejectBanner = page.locator('text=Permohonan Surat Ditolak');
    await expect(rejectBanner).toBeVisible();
    await page.screenshot({ path: path.join(artifactDir, '93_Mobile_Modal_Detail_Rejection_Alert.png') });
  }
});
