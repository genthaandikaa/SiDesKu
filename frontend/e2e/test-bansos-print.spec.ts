import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify perfect 1-page print isolation for Surat Undangan Bulog', async ({ page }) => {
  await page.goto('/bansos', { waitUntil: 'networkidle' });

  // 1. Click Ibu Yati's NIK
  await page.click('button:has-text("3506064303760001")');
  await page.click('button[type="submit"]:has-text("Cek Status NIK")');
  await page.waitForSelector('text=UNDANGAN PENERIMA');

  // 2. Emulate print media
  await page.emulateMedia({ media: 'print' });

  // 3. Verify #surat-undangan-print-portal is visible
  const printPortal = page.locator('#surat-undangan-print-portal');
  await expect(printPortal).toBeVisible();

  // 4. Verify #root is completely hidden (display: none)
  const rootElement = page.locator('#root');
  await expect(rootElement).toBeHidden();

  // 5. Verify vital print content inside the portal
  await expect(printPortal.locator('text=UNDANGAN PENERIMA')).toBeVisible();
  await expect(printPortal.locator('text=YATI HANDAYANI')).toBeVisible();
  await expect(printPortal.locator('text=UND/18/08/26/115001')).toBeVisible();
  await expect(printPortal.getByText('1340', { exact: true })).toBeVisible();
  await expect(printPortal.locator('text=350606200801340')).toBeVisible();

  // 6. Capture clean screenshot of print media
  await page.screenshot({ 
    path: path.resolve('e2e', 'screenshots', '06_Surat_Undangan_Bulog_Print_Preview.png'), 
    fullPage: true 
  });

  // 7. Generate PDF
  await page.pdf({
    path: path.resolve('e2e', 'screenshots', '06_Surat_Undangan_Bulog_A4.pdf'),
    format: 'A4',
    printBackground: true,
    margin: { top: '8mm', bottom: '8mm', left: '10mm', right: '10mm' }
  });
});
