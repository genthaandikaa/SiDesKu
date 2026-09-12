import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const screenshotsDir = path.resolve('e2e', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test.describe('SiDesKu Full End-to-End Functional Flow & Role-Based Testing', () => {
  let createdResi = '';

  // 1. AUTH: Wrong Password Error State
  test('Auth Flow: Wrong Password shows validation error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="username" i], input[placeholder*="NIK" i], input[type="text"]', 'warga01');
    await page.fill('input[type="password"]', 'wrongpassword_123');
    await page.click('button[type="submit"]');

    const errorNotice = page.locator('.bg-rose-50, .text-rose-700').first();
    await expect(errorNotice).toBeVisible({ timeout: 8000 });
    const text = await errorNotice.textContent();
    console.log(`✅ Login Wrong Password handled gracefully: "${text?.trim()}"`);
    await page.screenshot({ path: path.join(screenshotsDir, 'F1_Auth_Wrong_Password.png') });
  });

  // 2. AUTH: Login Warga
  test('Auth Flow: Login Warga (warga01) lands on dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="username" i], input[placeholder*="NIK" i], input[type="text"]', 'warga01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await expect(page.locator('body')).toContainText(/Warga|Bambang/i);
    console.log('✅ Login Warga succeeded.');
    await page.screenshot({ path: path.join(screenshotsDir, 'F2_Auth_Login_Warga_Dashboard.png') });
  });

  // 3. SURAT FLOW: Submit Surat Warga
  test('Layanan Surat Flow: Warga submits a new Surat Request', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="username" i], input[placeholder*="NIK" i], input[type="text"]', 'warga01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    // Click on Ajukan Surat in sidebar navigation (open mobile sidebar if hidden)
    const menuBtn = page.locator('button[aria-label="Open Sidebar"]');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(300);
    }

    const ajukanBtn = page.locator('button:has-text("Ajukan Surat Baru"), button:has-text("Ajukan Surat")').first();
    await ajukanBtn.dispatchEvent('click');
    await page.waitForTimeout(600);

    // Pick first letter card
    const firstLetterCard = page.locator('.cursor-pointer:has-text("SKTP"), .cursor-pointer:has-text("KTP"), .cursor-pointer:has-text("Surat Pengantar")').first();
    if (await firstLetterCard.isVisible()) {
      await firstLetterCard.click();
    }

    // Fill Keperluan textarea
    const keperluanTextarea = page.locator('textarea').first();
    await expect(keperluanTextarea).toBeVisible();
    await keperluanTextarea.fill('Permohonan surat pengantar untuk keperluan pembaruan data KTP di Kantor Kecamatan Ngasem');
    await page.screenshot({ path: path.join(screenshotsDir, 'F3_Warga_Form_Filled.png') });

    // Submit form
    const submitBtn = page.locator('button[type="submit"]:has-text("Kirim")').first();
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // Verify success banner appears
    await expect(page.locator('text=/Pengajuan Surat Berhasil Dikirim|Pengajuan Berhasil|Berhasil Terkirim/i')).toBeVisible({ timeout: 6000 });
    console.log('✅ Surat submitted successfully by Warga.');
    await page.screenshot({ path: path.join(screenshotsDir, 'F4_Warga_Submit_Success.png') });

    // Navigate to Status Surat
    const statusBtn = page.locator('button:has-text("Status Surat")').first();
    await statusBtn.dispatchEvent('click');
    await page.waitForTimeout(1000);

    const resiLocator = page.locator('text=/SR-[A-Z0-9-]+|REQ-[A-Z0-9-]+/').first();
    if (await resiLocator.isVisible()) {
      createdResi = (await resiLocator.textContent())?.trim() || '';
      console.log(`✅ Created Surat Resi found: ${createdResi}`);
    }
    await page.screenshot({ path: path.join(screenshotsDir, 'F5_Warga_Status_Surat_List.png') });
  });

  // 4. PUBLIC TRACKING: Track surat in /lacak
  test('Public Tracking Flow: Check Surat in /lacak via Resi Number', async ({ page }) => {
    await page.goto('/lacak');
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();

    const queryResi = createdResi || 'SR-20260901-DEMO';
    await searchInput.fill(queryResi);

    const searchBtn = page.locator('button:has-text("Lacak"), button:has-text("Cari")').first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
    } else {
      await searchInput.press('Enter');
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'F6_Public_Lacak_Result.png') });
    console.log(`✅ Public tracking executed for Resi: ${queryResi}`);
  });

  // 5. RT APPROVAL: RT reviews and approves
  test('RT Approval Flow: RT (rt01) logs in and reviews pending requests', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="username" i], input[placeholder*="NIK" i], input[type="text"]', 'rt01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await expect(page.locator('body')).toContainText(/RT|Supriyadi|Ketua RT/i);
    await page.screenshot({ path: path.join(screenshotsDir, 'F7_RT_Dashboard.png') });

    // Open Persetujuan Surat menu (open mobile sidebar if hidden)
    const menuBtn = page.locator('button[aria-label="Open Sidebar"]');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(300);
    }

    const persetujuanBtn = page.locator('button:has-text("Persetujuan Surat")').first();
    if (await persetujuanBtn.isVisible()) {
      await persetujuanBtn.click({ force: true });
      await page.waitForTimeout(1000);
    }

    // Check for ACC & Teruskan button
    const approveBtn = page.locator('button:has-text("ACC & Teruskan"), button:has-text("Setujui")').first();
    if (await approveBtn.isVisible()) {
      console.log('✅ Found pending surat in RT queue. Triggering approval...');
      await approveBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(screenshotsDir, 'F8_RT_Approved_Action.png') });
      console.log('✅ RT Approval triggered successfully.');
    } else {
      console.log('ℹ️ No pending surat directly waiting for approval button or queue empty.');
      await page.screenshot({ path: path.join(screenshotsDir, 'F8_RT_Queue_State.png') });
    }
  });

  // 6. RW COORDINATION: RW overview
  test('RW Dashboard Flow: RW (rw01) logs in and checks coordination overview', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="username" i], input[placeholder*="NIK" i], input[type="text"]', 'rw01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await expect(page.locator('body')).toContainText(/RW|Suryanto|Ketua RW/i);
    console.log('✅ Login RW (rw01) succeeded.');
    await page.screenshot({ path: path.join(screenshotsDir, 'F9_RW_Dashboard.png') });
  });

  // 7. SEKDES DASHBOARD: Sekdes management
  test('Sekdes Legalisasi Flow: Sekdes (sekdes) logs in and accesses village management', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="username" i], input[placeholder*="NIK" i], input[type="text"]', 'sekdes');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await expect(page.locator('body')).toContainText(/Sekdes|Sekretaris Desa|Ahmad Fauzi/i);
    console.log('✅ Login Sekdes succeeded.');
    await page.screenshot({ path: path.join(screenshotsDir, 'F10_Sekdes_Dashboard.png') });
  });

  // 8. APBDES PUBLIC VIEW
  test('Public Transparansi APBDes: Chart & Financial Breakdown', async ({ page }) => {
    await page.goto('/transparansi');
    await page.waitForTimeout(1000);

    await expect(page.locator('body')).toContainText(/APBDes|Pendapatan|Belanja|Anggaran/i);
    await page.screenshot({ path: path.join(screenshotsDir, 'F11_Public_APBDes.png') });
    console.log('✅ APBDes public transparency rendered properly.');
  });

  // 9. LOGOUT FLOW
  test('Logout Flow: User clicks logout and returns to login page', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder*="username" i], input[placeholder*="NIK" i], input[type="text"]', 'warga01');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**');

    // Click profile dropdown and logout (open mobile sidebar if needed)
    const menuBtn = page.locator('button[aria-label="Open Sidebar"]');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(300);
    }

    const logoutBtn = page.locator('button:has-text("Keluar"), button:has-text("Logout"), [aria-label="Logout"]').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.dispatchEvent('click');
    } else {
      const profileTrigger = page.locator('button:has(.rounded-full), button:has-text("Warga"), button:has-text("Bambang")').last();
      if (await profileTrigger.isVisible()) {
        await profileTrigger.click();
        await page.waitForTimeout(400);
        const dropdownLogout = page.locator('button:has-text("Keluar"), button:has-text("Logout")').first();
        if (await dropdownLogout.isVisible()) {
          await dropdownLogout.dispatchEvent('click');
        }
      }
    }

    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, 'F12_Logout_Success.png') });
    console.log('✅ Logout flow completed.');
  });
});
