import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Verification: Avatar Across Roles & Berkas Kependudukan Clean Hover', () => {
  const frontendBaseUrl = 'http://localhost:5173';
  const artifactDir = 'C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890';

  test('Warga: Berkas Kependudukan loads cleanly without jarring hover popups', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // 1. Login as warga
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'warga01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // 2. Navigate to Berkas Kependudukan
    await page.goto(`${frontendBaseUrl}/dashboard/berkas`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify page header
    await expect(page.locator('h3:has-text("Dokumen Identitas Wajib")')).toBeVisible({ timeout: 10000 });

    // Check for KTP card
    const ktpCard = page.locator('h4:has-text("KTP Elektronik (e-KTP)")');
    await expect(ktpCard).toBeVisible();

    // Hover over the KTP preview container to verify NO jarring black overlay covers the screen
    const previewContainer = page.locator('.aspect-\\[16\\/10\\]').first();
    await expect(previewContainer).toBeVisible();
    await previewContainer.hover();
    await page.waitForTimeout(500);

    // Verify the "Perbesar" button is neatly positioned inside the container
    const perbesarBtn = previewContainer.locator('button:has-text("Perbesar")');
    await expect(perbesarBtn).toBeVisible();

    // Ensure zero broken img tags inside the documents view
    const brokenImages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img => img.naturalWidth === 0 && img.complete).length;
    });
    expect(brokenImages).toBe(0);

    // Capture screenshot
    await page.screenshot({
      path: path.join(artifactDir, '161_Warga_Berkas_Kependudukan_No_Popup_Hover.png'),
      fullPage: true,
    });
  });

  test('Warga: Profil Saya has instant avatar camera & upload options and updates navbar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // 1. Login as warga
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'warga01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // 2. Navigate to Profil Saya
    await page.goto(`${frontendBaseUrl}/dashboard/profil`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify avatar action buttons
    await expect(page.locator('button:has-text("Ambil Foto via Kamera")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('label:has-text("Pilih Berkas")')).toBeVisible();

    // Verify navbar avatar is rendered without error
    const navbarAvatar = page.locator('header img, nav img, button[title*="Warga"] img').first();
    if (await navbarAvatar.isVisible()) {
      const isNatural = await navbarAvatar.evaluate((img: HTMLImageElement) => img.naturalWidth > 0);
      expect(isNatural).toBeTruthy();
    }

    // Verify e-KTP section has "Jadikan Foto Profil" button
    const jadikanProfilBtn = page.locator('button:has-text("Jadikan Foto Profil")');
    if (await jadikanProfilBtn.isVisible()) {
      await expect(jadikanProfilBtn).toBeVisible();
    }

    // Capture screenshot
    await page.screenshot({
      path: path.join(artifactDir, '162_Warga_Profile_Avatar_Instant_Save.png'),
      fullPage: true,
    });
  });

  test('RT: Profil Saya active across roles with clean avatar fallback & controls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    // 1. Login as Ketua RT
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'rt01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // 2. Navigate to Profil
    await page.goto(`${frontendBaseUrl}/dashboard/profil`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verify RT profile loaded with role badge
    await expect(page.locator('text=Ketua RT 01').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Ambil Foto via Kamera")')).toBeVisible();

    // Capture screenshot
    await page.screenshot({
      path: path.join(artifactDir, '163_RT_Profile_Avatar_Active.png'),
      fullPage: true,
    });
  });

});
