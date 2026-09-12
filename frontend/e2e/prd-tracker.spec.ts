import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('SiDesKu PRD Interactive Tracker & UI Validation', () => {
  test('should load PRD document, verify sections, and test interactive task status toggles', async ({ page }) => {
    // Resolve absolute path to PRD_SiDesKu.html
    const prdPath = path.resolve('..', 'PRD_SiDesKu.html');
    const fileUrl = 'file:///' + prdPath.replace(/\\/g, '/');

    // 1. Open the PRD document in real Chrome
    await page.goto(fileUrl);
    await expect(page).toHaveTitle(/SiDesKu/);

    // 2. Verify all major sections exist
    await expect(page.locator('#tracker')).toBeVisible();
    await expect(page.locator('#s1-ringkasan')).toBeVisible();
    await expect(page.locator('#s4-roles')).toBeVisible();
    await expect(page.locator('#s8-uiux')).toBeVisible();
    await expect(page.locator('#s9-roadmap')).toBeVisible();

    // 3. Verify 4.2 Matriks Akses table is rendered
    const matrixTitle = page.locator('text=4.2 Matriks Hak Akses Lengkap');
    await expect(matrixTitle).toBeVisible();

    // 4. Verify visual mockups (Browser frame & Phone frame)
    await expect(page.locator('text=https://sidesku.doko.desa.id')).toBeVisible();
    await expect(page.locator('text=Warga RT 02 / RW 01')).toBeVisible();

    // 5. Test Interactive Task Status Toggle
    const firstTaskStatusBtn = page.locator('.task-item button').first();
    await expect(firstTaskStatusBtn).toContainText('Belum');

    // Click to change from 'Pending' -> 'In Progress'
    await firstTaskStatusBtn.click();
    await expect(firstTaskStatusBtn).toContainText('Sedang Dikerjakan');

    // Click to change from 'In Progress' -> 'Done'
    await firstTaskStatusBtn.click();
    await expect(firstTaskStatusBtn).toContainText('Selesai');

    // Verify progress percentage increases
    const percentage = page.locator('#tracker-percentage');
    await expect(percentage).not.toHaveText('0%');

    // 6. Test LocalStorage persistence after page reload
    await page.reload();
    const reloadedStatusBtn = page.locator('.task-item button').first();
    await expect(reloadedStatusBtn).toContainText('Selesai');

    // 7. Capture an automated testing screenshot
    await page.screenshot({ path: 'e2e/test-results-prd-tracker.png', fullPage: false });
    console.log('Automated testing completed successfully! Screenshot saved to e2e/test-results-prd-tracker.png');
  });
});
