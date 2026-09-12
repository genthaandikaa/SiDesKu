import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify Orbital Ecosystem section, Mobile Preview & Rotating Animations', async ({ page, isMobile }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Locate the section
  const sectionHeading = page.locator('h2:has-text("Ekosistem Pelayanan Desa dalam Satu Alur Digital")');
  await expect(sectionHeading).toBeVisible({ timeout: 10000 });

  // Scroll section into view
  await sectionHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  // Verify the mobile preview image that is currently visible in viewport
  const mobileImg = page.locator('img[alt="SiDesKu Mobile Preview"]:visible');
  await expect(mobileImg).toBeVisible({ timeout: 10000 });

  const mode = isMobile ? 'mobile' : 'desktop';

  if (!isMobile) {
    // Check all 7 feature titles are present
    const features = [
      'Layanan Surat Mandiri',
      'Validasi Berjenjang RT/RW',
      'Legalitas QR Code & TTE',
      'Otomasi Bansos & WA',
      'Transparansi APBDes',
      'Pengaduan & Aspirasi',
      'Pelacak Resi Realtime',
    ];

    for (const title of features) {
      await expect(page.locator(`text=${title}`).first()).toBeVisible({ timeout: 5000 });
    }

    // Check pause/play toggle button
    const toggleBtn = page.locator('button:has-text("Jeda Orbit"), button:has-text("Putar Orbit")').first();
    await expect(toggleBtn).toBeVisible();

    // Take screenshot of the Orbital Ecosystem running
    const sectionContainer = page.locator('div.group\\/orbit');
    await sectionContainer.screenshot({
      path: path.resolve('e2e', 'screenshots', `02_Orbital_Ecosystem_${mode}.png`),
    });

    // Click toggle to pause
    await toggleBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=Putar Orbit')).toBeVisible();

    // Click toggle to resume
    await toggleBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator('text=Jeda Orbit')).toBeVisible();
  } else {
    const sectionContainer = page.locator('div.group\\/orbit');
    await sectionContainer.screenshot({
      path: path.resolve('e2e', 'screenshots', `02_Orbital_Ecosystem_${mode}.png`),
    });
  }
});
