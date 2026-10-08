import { test, expect } from '@playwright/test';
import path from 'path';
test('Verify Authentic Surat Undangan Bantuan Pangan Bulog and Home WhatsApp Showcase', async ({ page, isMobile }) => {
  await page.goto('/bansos', { waitUntil: 'domcontentloaded' });

  // 1. Verify Bantuan Pangan Program in List
  await expect(page.locator('text=Bantuan Pangan Beras (CBP) 2026 - Perum BULOG').first()).toBeVisible();
  await expect(page.locator('text=30 (Tiga Puluh) Kg Beras').first()).toBeVisible();

  // 2. Click Quick NIK button for Ibu Yati Handayani
  const yatiButton = page.locator('button:has-text("3506064303760001")').first();
  await expect(yatiButton).toBeVisible();
  await yatiButton.click();

  // 3. Submit Cek NIK
  const submitBtn = page.locator('button[type="submit"]:has-text("Cek Status NIK")');
  await submitBtn.click();

  // 4. Verify the Authentic Surat Undangan Document appears
  const letterHeader = page.locator('text=UNDANGAN PENERIMA').first();
  await expect(letterHeader).toBeVisible();
  await expect(page.locator('text=BANTUAN PANGAN BERAS PERIODE BULAN JULI').first()).toBeVisible();
  await expect(page.locator('text=UND/18/08/26/115001').first()).toBeVisible();
  await expect(page.locator('text=YATI HANDAYANI').first()).toBeVisible();
  await expect(page.locator('text=RT 38 / RW 6').first()).toBeVisible();
  await expect(page.locator('text=30 (tiga puluh) Kg Beras').first()).toBeVisible();
  await expect(page.locator('text=1340').first()).toBeVisible();

  // Verify Barcode QR image rendered
  const barcodeImg = page.locator('img[alt*="350606200801340"]').first();
  await expect(barcodeImg).toBeVisible();
  const isLoaded = await barcodeImg.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
  expect(isLoaded).toBe(true);

  const mode = isMobile ? 'mobile' : 'desktop';

  // Screenshot the official letter document
  const letterDoc = letterHeader.locator('xpath=ancestor::div[contains(@class, "border-2") or contains(@class, "rounded-3xl")]').first();
  await letterDoc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await letterDoc.screenshot({
    path: path.resolve('e2e', 'screenshots', `05_Surat_Undangan_Bulog_${mode}.png`),
    animations: 'disabled',
  });

  // 5. Navigate to Home Page and check WhatsApp Showcase
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const waSection = page.locator('text=PEMERINTAH DESA & PERUM BULOG').first();
  await waSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  await expect(waSection).toBeVisible();
  await expect(page.locator('text=Yati Handayani').first()).toBeVisible();
  await expect(page.locator('text=1340').first()).toBeVisible();
  await expect(page.locator('text=350606200801340').first()).toBeVisible();

  const waContainer = page.locator('text=Distribusi Bantuan Sosial Tepat Sasaran').locator('xpath=ancestor::section').first();
  await waContainer.screenshot({
    path: path.resolve('e2e', 'screenshots', `05_Home_WhatsApp_Bulog_${mode}.png`),
    animations: 'disabled',
  });
});
