import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify Admin Panel Showcase in HomePage', async ({ page, isMobile }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  // Find the showcase section
  const sectionHeading = page.locator('text=Urus Surat dari Rumah, Selesai Cepat & Tepat Waktu').first();
  await expect(sectionHeading).toBeVisible();

  // Find the admin dashboard preview image
  const dashboardImg = page.locator('img[alt="Portal Administrasi Persuratan SiDesKu"]').first();
  await expect(dashboardImg).toBeAttached();

  await dashboardImg.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  await expect(dashboardImg).toBeVisible();

  // Verify image is loaded
  const isLoaded = await dashboardImg.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
  expect(isLoaded).toBe(true);

  // Verify window titlebar on desktop
  if (!isMobile) {
    await expect(page.locator('text=sidesku.desa.id/admin/persuratan').first()).toBeVisible();
    await expect(page.locator('text=Realtime Live').first()).toBeVisible();
    await expect(page.locator('text=Disetujui RT 01 & RW 01').first()).toBeVisible();
    await expect(page.locator('text=470/084/418.67/2026').first()).toBeVisible();
  }

  const mode = isMobile ? 'mobile' : 'desktop';

  // Screenshot section
  const section = sectionHeading.locator('xpath=ancestor::section').first();
  await section.screenshot({
    path: path.resolve('e2e', 'screenshots', `04_Admin_Panel_Showcase_${mode}.png`),
    animations: 'disabled',
  });
});
