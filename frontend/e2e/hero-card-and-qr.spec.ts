import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify Enlarged Hero Mockup Card and Dynamic Backend QR Code', async ({ page, isMobile }) => {
  // Set viewport large enough
  await page.goto('/', { waitUntil: 'networkidle' });

  // 1. Verify Hero Mockup Card Title
  const portalTitle = page.locator('text=SIDes Portal Administrasi').first();
  await expect(portalTitle).toBeVisible();

  // Check metrics and activities inside card
  await expect(page.locator('text=Surat Selesai').first()).toBeVisible();
  await expect(page.locator('text=Rata-rata SLA').first()).toBeVisible();
  await expect(page.locator('text=Biaya (Gratis)').first()).toBeVisible();
  await expect(page.locator('text=Aktivitas Berkas Terkini').first()).toBeVisible();

  // On desktop, floating pills are visible
  if (!isMobile) {
    await expect(page.locator('text=SLA Terbit').first()).toBeVisible();
    await expect(page.locator('text=QR Code Sah DPMPD').first()).toBeVisible();
  }

  const mode = isMobile ? 'mobile' : 'desktop';

  // Screenshot Hero Area without waiting for infinite CSS animation stability
  await page.evaluate(() => {
    const el = document.querySelector('.card-elevated-mockup');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(600);

  // Capture hero screenshot with animations disabled to prevent jitter
  await page.screenshot({
    path: path.resolve('e2e', 'screenshots', `03_Hero_Mockup_Card_${mode}.png`),
    animations: 'disabled',
  });

  // 2. Scroll to Bansos WhatsApp Showcase
  const qrImage = page.locator('img[alt="QR Antrean PKH 2026"]').first();
  await expect(qrImage).toBeAttached();

  await page.evaluate(() => {
    const qr = document.querySelector('img[alt="QR Antrean PKH 2026"]');
    if (qr) qr.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(800);

  await expect(qrImage).toBeVisible();

  // Verify backend QR image actually rendered (naturalWidth > 0)
  const isLoaded = await qrImage.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
  expect(isLoaded).toBe(true);

  // Take screenshot of WhatsApp Mockup container
  await page.screenshot({
    path: path.resolve('e2e', 'screenshots', `03_Bansos_WhatsApp_QR_${mode}.png`),
    animations: 'disabled',
  });
});
