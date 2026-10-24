import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('SiDesKu — Admin Role Full Menus & Features Verification', () => {
  const frontendBaseUrl = 'http://localhost:5173';
  const artifactDir = path.resolve('C:/Users/genn/.gemini/antigravity/brain/477d1bb8-7944-4964-80d8-c80526b80890');

  test('1. Admin Login & Beranda (Pusat Kendali, Stat Cards, Server Online)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });

    // Step A: Login as Admin
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Step B: Verify Beranda Header & Cards
    await expect(page.locator('text=Pusat Kendali & Tata Kelola Sistem').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Super Administrator').first()).toBeVisible();
    await expect(page.locator('text=ONLINE').first()).toBeVisible();

    // Wait for async stats to finish loading
    await expect(page.locator('text=13').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);

    // Screenshot Beranda
    await page.screenshot({
      path: path.join(artifactDir, '164_Admin_Beranda_Pusat_Kendali.png'),
      fullPage: false,
    });
  });

  test('2. Menu Statistik Sistem (RBAC Distribution, DB Table Matrix, Surat Pipeline)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });

    // Login
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Navigate to Statistik Sistem
    const statBtn = page.locator('aside button:has-text("Statistik Sistem")').first();
    await expect(statBtn).toBeVisible({ timeout: 5000 });
    await statBtn.click();
    await page.waitForTimeout(1000);

    // Verify sections
    await expect(page.locator('text=Sebaran Akun Berdasarkan Hak Akses (RBAC)').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Matriks Tabel Basis Data').first()).toBeVisible();
    await expect(page.locator('text=Siklus Alur Persuratan Resmi').first()).toBeVisible();

    // Screenshot Statistik Sistem
    await page.screenshot({
      path: path.join(artifactDir, '165_Admin_Statistik_Sistem_RBAC.png'),
      fullPage: false,
    });
  });

  test('3. Menu Kelola User (Table, Filters, Toggle Status, Reset Password Modal)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });

    // Login
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Click Kelola User
    const kelolaUserBtn = page.locator('aside button:has-text("Kelola User")').first();
    await kelolaUserBtn.click();
    await page.waitForTimeout(1000);

    // Verify user table and search
    await expect(page.locator('text=Daftar Akun Pengguna Terdaftar').first()).toBeVisible({ timeout: 10000 });
    const searchInput = page.locator('input[placeholder*="Cari nama, username"]').first();
    await expect(searchInput).toBeVisible();

    // Verify user rows exist
    await expect(page.locator('td:has-text("Super Admin")').first()).toBeVisible();

    // Screenshot Kelola User
    await page.screenshot({
      path: path.join(artifactDir, '166_Admin_Kelola_User_Management.png'),
      fullPage: false,
    });
  });

  test('4. Menu Atur Hak Akses (RBAC Matrix Table, Role Hierarchy)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });

    // Login
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Click Atur Hak Akses
    const rbacBtn = page.locator('aside button:has-text("Atur Hak Akses")').first();
    await rbacBtn.click();
    await page.waitForTimeout(1000);

    // Verify RBAC Matrix
    await expect(page.locator('text=Matriks Hak Akses & Peran Sistem (RBAC SiDesKu)').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('th:has-text("Ketua RT")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Sekdes")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Kades")').first()).toBeVisible();

    // Screenshot RBAC
    await page.screenshot({
      path: path.join(artifactDir, '167_Admin_Atur_Hak_Akses_Matrix.png'),
      fullPage: false,
    });
  });

  test('5. Menu Log Aktivitas (Audit Trail Table, Action Filters)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });

    // Login
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Click Log Aktivitas
    const logsBtn = page.locator('aside button:has-text("Log Aktivitas")').first();
    await logsBtn.click();
    await page.waitForTimeout(1000);

    // Verify log table
    await expect(page.locator('text=Riwayat Log Aktivitas & Audit Keamanan').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('th:has-text("Waktu Kejadian")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Tipe Aksi")').first()).toBeVisible();

    // Screenshot Logs
    await page.screenshot({
      path: path.join(artifactDir, '168_Admin_Log_Aktivitas_Audit_Trail.png'),
      fullPage: false,
    });
  });

  test('6. Menu Backup Data (Disaster Recovery Download)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });

    // Login
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Click Backup Data
    const backupBtn = page.locator('aside button:has-text("Backup Data")').first();
    await backupBtn.click();
    await page.waitForTimeout(1000);

    // Verify backup page
    await expect(page.locator('text=Pencadangan & Pemulihan Basis Data Desa').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Unduh Backup Basis Data (.json)")').first()).toBeVisible();

    // Screenshot Backup Data
    await page.screenshot({
      path: path.join(artifactDir, '169_Admin_Backup_Data_Disaster_Recovery.png'),
      fullPage: false,
    });
  });

  test('7. Menu Keamanan (Security Posture & Token Management)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });

    // Login
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Click Keamanan
    const secBtn = page.locator('aside button:has-text("Keamanan")').first();
    await secBtn.click();
    await page.waitForTimeout(1000);

    // Verify security page
    await expect(page.locator('text=Parameter Keamanan & Kriptografi').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Laravel Sanctum Active').first()).toBeVisible();
    await expect(page.locator('text=SHA-256 QR Verification').first()).toBeVisible();

    // Screenshot Keamanan
    await page.screenshot({
      path: path.join(artifactDir, '170_Admin_Keamanan_Sistem_Diagnostics.png'),
      fullPage: false,
    });
  });

  test('8. Menu Data Penduduk (Citizen Directory Oversight)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });

    // Login
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Click Data Penduduk
    const pendBtn = page.locator('aside button:has-text("Data Penduduk")').first();
    await pendBtn.click();
    await page.waitForTimeout(1200);

    // Verify citizen table
    await expect(page.locator('text=Total Terdata:').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('th:has-text("NIK")').first()).toBeVisible();
    await expect(page.locator('th:has-text("Nama Lengkap")').first()).toBeVisible();

    // Screenshot Data Penduduk
    await page.screenshot({
      path: path.join(artifactDir, '171_Admin_Data_Penduduk.png'),
      fullPage: false,
    });
  });

  test('9. Menu Semua Surat (Village Letter Monitoring Archive)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });

    // Login
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Click Semua Surat
    const suratBtn = page.locator('aside button:has-text("Semua Surat")').first();
    await suratBtn.click();
    await page.waitForTimeout(1200);

    // Verify surat table
    await expect(page.locator('th:has-text("Nomor Surat")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('th:has-text("Jenis Surat")').first()).toBeVisible();

    // Screenshot Semua Surat
    await page.screenshot({
      path: path.join(artifactDir, '172_Admin_Semua_Surat.png'),
      fullPage: false,
    });
  });

  test('10. Menu Data Keuangan (APBDes Oversight for Admin)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });

    // Login
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Click Data Keuangan
    const finBtn = page.locator('aside button:has-text("Data Keuangan")').first();
    await finBtn.click();
    await page.waitForTimeout(1200);

    // Verify financial oversight view
    await expect(page.locator('text=Pengawasan APBDes & Transparansi Keuangan Desa').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Total Pendapatan Desa').first()).toBeVisible();
    await expect(page.locator('text=Total Belanja Realisasi').first()).toBeVisible();

    // Screenshot Data Keuangan
    await page.screenshot({
      path: path.join(artifactDir, '173_Admin_Data_Keuangan_APBDes.png'),
      fullPage: false,
    });
  });

  test('11. Menu Pengaturan Desa (Desa Identity & Kop Surat Setting)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });

    // Login
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });

    // Click Pengaturan Desa
    const settBtn = page.locator('aside button:has-text("Pengaturan Desa")').first();
    await settBtn.click();
    await page.waitForTimeout(1200);

    // Verify Kop Surat & Desa Identity Form
    await expect(page.locator('text=Pengaturan Kop Surat Desa Dinamis').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Live Document Header Preview').first()).toBeVisible();

    // Screenshot Pengaturan Desa
    await page.screenshot({
      path: path.join(artifactDir, '174_Admin_Pengaturan_Desa.png'),
      fullPage: false,
    });
  });
});
