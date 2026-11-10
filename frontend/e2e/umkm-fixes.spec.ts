import { test, expect } from '@playwright/test';

test.describe('UMKM 50 Items, Location Picker, and Distance Dropdown', () => {
  test('UMKM catalog loads 50 backend items, has dropdown distance filter, and map location picker', async ({ page }) => {
    // 1. Visit UMKM page
    await page.goto('/smart-city/umkm', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // 2. Verify 50 products are loaded from backend
    const countBadge = page.locator('#umkm-catalog-section');
    await expect(countBadge).toContainText('50 Produk');

    // 3. Verify bottom banner is gone
    const bottomBanner = page.locator('text=Tentukan Jarak Maksimal yang Anda Inginkan');
    await expect(bottomBanner).toHaveCount(0);

    // Take screenshot of catalog
    await page.screenshot({
      path: '/Users/gentha/.gemini/antigravity/brain/d62b5d19-6bb0-4860-8f77-ad5845dcae57/test-50-products-catalog.png',
      fullPage: false
    });

    // 4. Test Distance Filter Dropdown
    const distButton = page.locator("label:has-text('Jarak Radius') + button");
    await expect(distButton).toBeVisible();
    await expect(distButton).toContainText('Semua Jarak');

    // Click to open dropdown
    await distButton.click();
    await page.waitForTimeout(300);

    // Check popover content
    const popoverHeading = page.locator('text=Pilih Radius Maksimal');
    await expect(popoverHeading).toBeVisible();

    // Check custom distance input inside dropdown
    const customDistInput = page.locator("input[placeholder='Contoh: 2.5']");
    await expect(customDistInput).toBeVisible();

    // Take screenshot of distance dropdown opened
    await page.screenshot({
      path: '/Users/gentha/.gemini/antigravity/brain/d62b5d19-6bb0-4860-8f77-ad5845dcae57/test-distance-dropdown-opened.png',
      fullPage: false
    });

    // Click 3 km preset inside dropdown
    const opt3km = page.locator("button:has-text('Maksimal 3 km')");
    await opt3km.click();
    await page.waitForTimeout(500);

    // Check button updated
    await expect(distButton).toContainText('Maks. 3 km');

    // 5. Test Ubah Titik Lokasi Modal
    const ubahBtn = page.locator("button:has-text('Ubah Titik Lokasi')");
    await ubahBtn.click();
    await page.waitForTimeout(600);

    // Modal should be visible
    const modalHeading = page.locator("h3:has-text('Ubah Titik Lokasi Anda')");
    await expect(modalHeading).toBeVisible();

    // Leaflet map container should be mounted
    const leafletMap = page.locator('.leaflet-container');
    await expect(leafletMap).toBeVisible();

    // Take screenshot of interactive map modal
    await page.screenshot({
      path: '/Users/gentha/.gemini/antigravity/brain/d62b5d19-6bb0-4860-8f77-ad5845dcae57/test-location-modal-interactive-map.png',
      fullPage: false
    });

    // Select preset Simpang Lima Gumul (SLG)
    const slgPreset = page.locator("button:has-text('Simpang Lima Gumul (SLG)')");
    await slgPreset.click();
    await page.waitForTimeout(400);

    // Click "Terapkan Titik Lokasi Ini"
    const applyBtn = page.locator("button:has-text('Terapkan Titik Lokasi Ini')");
    await applyBtn.click();
    await page.waitForTimeout(600);

    // Check navbar location label updated
    const locationBanner = page.locator("span:has-text('Simpang Lima Gumul (SLG)')");
    await expect(locationBanner.first()).toBeVisible();

    // 6. Test Pagination
    const page2Btn = page.locator("button:has-text('2')").first();
    await expect(page2Btn).toBeVisible();
    await page2Btn.click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: '/Users/gentha/.gemini/antigravity/brain/d62b5d19-6bb0-4860-8f77-ad5845dcae57/test-catalog-page2.png',
      fullPage: false
    });
  });
});
