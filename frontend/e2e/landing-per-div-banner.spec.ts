import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify Landing Page Per-Div Structure and ARSITEKTUR DIGITAL TERINTEGRASI Background Banner', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });

  // 1. Verify Hero & Floating Bridge Stats Ribbon
  const statsRibbon = page.locator('text=Penduduk Terdata');
  await expect(statsRibbon).toBeVisible({ timeout: 10000 });

  // 2. Locate and capture Capabilities Conveyor Div (Div 1)
  const conveyorHeading = page.locator('h2:has-text("Semua yang Anda butuhkan untuk layanan desa digital & mandiri")');
  await expect(conveyorHeading).toBeVisible({ timeout: 10000 });
  await conveyorHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const conveyorSection = page.locator('section:has-text("Semua yang Anda butuhkan")');
  await conveyorSection.screenshot({
    path: path.resolve('e2e', 'screenshots', '09_Landing_Conveyor_Div.png'),
  });

  // 3. Locate and capture ARSITEKTUR DIGITAL TERINTEGRASI Background Banner Div (Div 2)
  const arsitekturHeading = page.locator('h2:has-text("Ekosistem Pelayanan Desa dalam Satu Alur Digital")');
  await expect(arsitekturHeading).toBeVisible({ timeout: 10000 });
  await arsitekturHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  // Verify badge ARSITEKTUR DIGITAL TERINTEGRASI
  const arsitekturBadge = page.locator('text=ARSITEKTUR DIGITAL TERINTEGRASI');
  await expect(arsitekturBadge).toBeVisible();

  const arsitekturSection = page.locator('section:has-text("ARSITEKTUR DIGITAL TERINTEGRASI")');
  await arsitekturSection.screenshot({
    path: path.resolve('e2e', 'screenshots', '09_Landing_Arsitektur_Banner_Div.png'),
  });

  // 4. Locate and capture Showcase 1 (White Card Div 3) & Showcase 2 (Banner Div 4)
  const showcase1Heading = page.locator('h2:has-text("Urus Surat dari Rumah, Selesai Cepat & Tepat Waktu")');
  await expect(showcase1Heading).toBeVisible({ timeout: 10000 });
  await showcase1Heading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const showcase1Section = page.locator('section:has-text("LAYANAN SURAT BERJENJANG")');
  await showcase1Section.screenshot({
    path: path.resolve('e2e', 'screenshots', '09_Landing_Showcase1_White_Div.png'),
  });

  const showcase2Heading = page.locator('h2:has-text("Distribusi Bantuan Sosial Tepat Sasaran & Tanpa Potongan")');
  await expect(showcase2Heading).toBeVisible({ timeout: 10000 });
  await showcase2Heading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);

  const showcase2Section = page.locator('section:has-text("JARING PENGAMAN SOSIAL")');
  await showcase2Section.screenshot({
    path: path.resolve('e2e', 'screenshots', '09_Landing_Showcase2_Banner_Div.png'),
  });

  // 5. Locate and capture FAQ and Testimonials
  const faqHeading = page.locator('h2:has-text("Frequently Asked Questions")');
  await expect(faqHeading).toBeVisible({ timeout: 10000 });
  await faqHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const faqSection = page.locator('section:has-text("PERTANYAAN UMUM (FAQ)")');
  await faqSection.screenshot({
    path: path.resolve('e2e', 'screenshots', '09_Landing_FAQ_Div.png'),
  });
});
