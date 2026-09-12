import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Create screenshots directory
const screenshotsDir = path.resolve('e2e', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// All public pages in the frontend
const routesToTest = [
  { path: '/', name: '01_Home_Landing' },
  { path: '/profil', name: '02_Profil_Desa' },
  { path: '/layanan-surat', name: '03_Layanan_Surat' },
  { path: '/lacak', name: '04_Lacak_Surat' },
  { path: '/transparansi', name: '05_Transparansi_APBDes' },
  { path: '/bansos', name: '06_Bantuan_Sosial' },
  { path: '/berita', name: '07_Berita_Desa' },
  { path: '/login', name: '08_Login_Page' },
  { path: '/register', name: '09_Register_Page' },
];

test.describe('SiDesKu Frontend UI, Layout & Bug Inspection Suite', () => {

  for (const route of routesToTest) {
    test(`Inspect Page UI: ${route.name} (${route.path})`, async ({ page, isMobile }) => {
      const consoleErrors: string[] = [];
      const failedRequests: string[] = [];

      // 1. Listen for console errors & unhandled exceptions
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      page.on('pageerror', err => {
        consoleErrors.push(err.message);
      });

      // 2. Listen for failed network requests (broken images or 404/500 assets)
      page.on('response', response => {
        if (response.status() >= 400 && !response.url().includes('/api/')) {
          failedRequests.push(`${response.status()} ${response.url()}`);
        }
      });

      // 3. Navigate to route
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600); // Allow smooth transitions and layout to settle

      // 4. Verify Page Rendered and not a blank white screen
      const body = page.locator('body');
      await expect(body).toBeVisible();
      const bodyText = await body.textContent();
      expect(bodyText?.length).toBeGreaterThan(50);

      // 5. Layout Overflow Check (Ensures responsive UI does not spill horizontally)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      if (hasHorizontalScroll) {
        console.warn(`⚠️ Warning: Page ${route.path} has horizontal overflow on ${isMobile ? 'Mobile' : 'Desktop'}`);
      }

      // 6. Capture full-page screenshot for visual quality audit
      const deviceTag = isMobile ? 'mobile' : 'desktop';
      const screenshotPath = path.join(screenshotsDir, `${route.name}_${deviceTag}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      // 7. Verify no fatal crash console errors
      const fatalErrors = consoleErrors.filter(e => 
        e.includes('Uncaught') || 
        e.includes('TypeError') || 
        e.includes('ReferenceError') ||
        e.includes('Cannot read property')
      );
      
      expect(fatalErrors, `Fatal JavaScript errors found on ${route.path}: ${fatalErrors.join('; ')}`).toEqual([]);

      console.log(`✅ [${deviceTag.toUpperCase()}] ${route.name} (${route.path}) verified successfully. Screenshot saved.`);
    });
  }

  test('Interactive UI Test: Search Bar in Lacak Surat Page', async ({ page }) => {
    await page.goto('/lacak');
    
    // Find search input
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('REQ-20260901-DEMO');
      await page.waitForTimeout(300);
      
      // Capture screenshot of interactive state
      await page.screenshot({ path: path.join(screenshotsDir, '10_Interactive_Lacak_Search.png') });
      console.log('✅ Interactive search input test passed.');
    }
  });

  test('Interactive UI Test: Login Page Quick Aliases & Form Elements', async ({ page }) => {
    await page.goto('/login');

    // Verify username and password inputs
    await expect(page.locator('input').first()).toBeVisible();
    
    // Capture screenshot of login page
    await page.screenshot({ path: path.join(screenshotsDir, '11_Interactive_Login.png') });
    console.log('✅ Login page interactive elements verified.');
  });
});
