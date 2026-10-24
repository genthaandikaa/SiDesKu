import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify Real RT Map with GIS OpenStreetMap and Esri Satellite', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 860 });

  // 1. Login as RT
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');

  await page.fill('input[type="text"], input[name="login"], input[placeholder*="Username"]', 'rt01');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard**');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const artifactDir = 'C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890';

  // Navigate to Peta Wilayah RT
  const petaWilayahButton = page.locator('aside button:has-text("Peta Wilayah RT")');
  await expect(petaWilayahButton).toBeVisible();
  await petaWilayahButton.click();
  await page.waitForTimeout(1500);

  // Check that Leaflet map container is mounted
  const leafletMap = page.locator('.leaflet-container');
  await expect(leafletMap).toBeVisible();

  // Verify markers and map controls
  await expect(page.locator('button:has-text("Peta Jalan")')).toBeVisible();
  await expect(page.locator('button:has-text("Foto Satelit")')).toBeVisible();

  // 1. Screenshot Default Street View
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(artifactDir, '100_Real_GIS_Map_Streets_View.png') });

  // 2. Switch to Satellite View (Esri World Imagery)
  const satButton = page.locator('button:has-text("Foto Satelit")');
  await satButton.click();
  await page.waitForTimeout(2000); // Allow satellite tiles to fetch
  await page.screenshot({ path: path.join(artifactDir, '101_Real_GIS_Map_Satellite_View.png') });

  // 3. Click on a facility pin or table row (e.g. Musholla Al-Ikhlas)
  const mushollaRow = page.locator('tr:has-text("Musholla Al-Ikhlas RT 01")');
  if (await mushollaRow.isVisible()) {
    await mushollaRow.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(artifactDir, '102_Real_GIS_Map_Facility_Selected_Sync.png') });
  }

  // 4. Filter to Fasilitas Publik only
  const fasumFilterBtn = page.locator('button:has-text("Fasum (6)")');
  if (await fasumFilterBtn.isVisible()) {
    await fasumFilterBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(artifactDir, '103_Real_GIS_Map_Fasum_Filter.png') });
  }

  // 5. Filter to Hunian Warga
  const hunianFilterBtn = page.locator('button:has-text("Hunian Warga")');
  if (await hunianFilterBtn.isVisible()) {
    await hunianFilterBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(artifactDir, '104_Real_GIS_Map_Hunian_Filter.png') });
  }

  // 6. Mobile View Test
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, '105_Real_GIS_Map_Mobile_View.png') });
});
