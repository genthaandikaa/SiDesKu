import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify mobile modal 3-column grid tabs and close animation', async ({ page }) => {
  const artifactDir = 'C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890';

  // Use iPhone dimensions
  await page.setViewportSize({ width: 390, height: 844 });

  // Login as RT
  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="text"], input[name="login"], input[placeholder*="Username"]', 'rt01');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Open Detail button
  const mainContent = page.locator('main');
  const detailBtn = mainContent.locator('button:has-text("Detail")').first();
  await expect(detailBtn).toBeVisible({ timeout: 10000 });
  await detailBtn.click();
  await page.waitForTimeout(600);

  // Verify modal is visible
  const modal = page.locator('.fixed.inset-0.z-\\[999999\\]');
  await expect(modal).toBeVisible();

  // Find all 3 tabs
  const tab1 = modal.locator('button:has-text("Detail")').first();
  const tab2 = modal.locator('button').filter({ hasText: /Berkas/ });
  const tab3 = modal.locator('button').filter({ hasText: /Riwayat/ });

  await expect(tab1).toBeVisible();
  await expect(tab2).toBeVisible();
  await expect(tab3).toBeVisible();

  // Verify tab3 bounding box is completely inside the 390px viewport (not cut off!)
  const tab3Box = await tab3.boundingBox();
  expect(tab3Box).not.toBeNull();
  if (tab3Box) {
    console.log('Tab 3 Bounding Box:', tab3Box);
    expect(tab3Box.x + tab3Box.width).toBeLessThanOrEqual(390);
  }

  // Screenshot 1: Grid tabs - all 3 tabs visible with zero cutoff
  await page.screenshot({ path: path.join(artifactDir, '86_Mobile_Modal_GridTabs_NoCutoff.png') });

  // Click tab 3 (Riwayat) to make sure it functions properly
  await tab3.click();
  await page.waitForTimeout(400);

  // Click "Tutup" button to test close animation
  const tutupBtn = modal.locator('button:has-text("Tutup")');
  await expect(tutupBtn).toBeVisible();
  await tutupBtn.click();

  // Take screenshot mid-animation (around 100ms into the 280ms slide-down)
  await page.waitForTimeout(120);
  await page.screenshot({ path: path.join(artifactDir, '87_Mobile_Modal_Closing_Animation.png') });

  // Wait for animation to finish and modal to unmount
  await page.waitForTimeout(300);
  await expect(modal).not.toBeVisible();

  // Screenshot 3: Modal fully closed
  await page.screenshot({ path: path.join(artifactDir, '88_Mobile_Modal_AfterClosed.png') });
});
