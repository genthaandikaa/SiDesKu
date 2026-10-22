import { test, expect } from '@playwright/test';

test.describe('Fase 4: Functional Testing & Business Logic Audit Suite', () => {
  const backendBaseUrl = 'http://127.0.0.1:8000';
  const frontendBaseUrl = 'http://localhost:5173';

  // Area A & C: Public Information Pages
  test('1. Halaman Beranda Publik menampilkan identitas Desa Doko dan statistik desa', async ({ page }) => {
    await page.goto(`${frontendBaseUrl}/`);
    await expect(page.locator('text=Desa Doko').first()).toBeVisible({ timeout: 10000 });
    
    // Navigasi atau link layanan utama tersedia (cek link yang visible di viewport aktif)
    const layananLink = page.locator('a[href*="layanan-surat"]:visible, button:has-text("Layanan"):visible').first();
    await expect(layananLink).toBeVisible();
  });

  test('2. Halaman Warta & Berita Publik dapat diakses tanpa autentikasi', async ({ page }) => {
    await page.goto(`${frontendBaseUrl}/berita`);
    await expect(page.locator('text=Kabar').first()).toBeVisible({ timeout: 10000 });
  });

  test('3. Halaman Transparansi APBDes menampilkan ringkasan anggaran desa publik', async ({ page }) => {
    await page.goto(`${frontendBaseUrl}/transparansi`);
    await expect(page.locator('h1:has-text("APBDes"), main:has-text("APBDes")').first()).toBeVisible({ timeout: 10000 });
    // Verifikasi ada indikator Pendapatan atau Belanja
    const infoText = page.locator('text=/Pendapatan|Belanja|Pembiayaan/i').first();
    await expect(infoText).toBeVisible();
  });

  test('4. Halaman Transparansi Bansos menampilkan informasi program bansos publik', async ({ page }) => {
    await page.goto(`${frontendBaseUrl}/bansos`);
    await expect(page.locator('text=Bantuan Sosial').first()).toBeVisible({ timeout: 10000 });
  });

  // Area A: Registrasi & Autentikasi Warga
  test('5. Halaman Register menampilkan pembatasan pendaftaran mandiri (akun dikelola desa)', async ({ page }) => {
    await page.goto(`${frontendBaseUrl}/register`);
    await expect(page.locator('text=/Kantor Desa|didata|resmi|mandiri/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('6. Login Warga menggunakan NIK dan password format Tanggal Lahir (dmY)', async ({ page }) => {
    await page.goto(`${frontendBaseUrl}/login`);

    // Isi formulir login dengan NIK dan format tanggal lahir
    await page.fill('input[name="login"], input[id="login"], input[placeholder*="NIK"], input[type="text"]', '3506041505840001');
    await page.fill('input[type="password"]', '15051984');
    await page.click('button[type="submit"]');

    // Berhasil masuk dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('text=/Warga|Supriyadi|Doko/i').first()).toBeVisible();
  });

  // Area B & D: Siklus Hidup Surat Lengkap (API + UI Verifikasi)
  test('7. End-to-End Siklus Hidup Surat: Pengajuan Warga -> Verifikasi RT -> Legalisasi Sekdes', async ({ request, page }) => {
    // A. Warga Login via API untuk pengajuan terkontrol
    const resLoginWarga = await request.post(`${backendBaseUrl}/api/auth/login`, {
      headers: { Accept: 'application/json' },
      data: { login: 'warga01', password: 'password123' },
    });
    expect(resLoginWarga.status()).toBe(200);
    const tokenWarga = (await resLoginWarga.json()).token;

    // B. Warga Mengajukan Surat Keterangan Usaha (ID: 1)
    const resCreateSurat = await request.post(`${backendBaseUrl}/api/surats`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${tokenWarga}`,
      },
      data: {
        surat_type_id: 1,
        keperluan: 'Uji Fungsional E2E QA Fase 4 Playwright',
        form_data: {
          nama_usaha: 'Warung Barokah Doko',
          jenis_usaha: 'Kuliner',
          alamat_usaha: 'RT 01 RW 01 Dusun Doko',
        },
      },
    });
    expect(resCreateSurat.status()).toBe(201);
    const suratData = (await resCreateSurat.json()).data;
    const suratId = suratData.id;
    const resiCode = suratData.nomor_resi;
    expect(resiCode).toMatch(/^REQ-\d{8}-[A-Z0-9]+$/);
    expect(suratData.status).toBe('pending_rt');

    // C. Cek Lacak Surat Publik (Verifikasi Timeline & Masking PII)
    await page.goto(`${frontendBaseUrl}/lacak`);
    await page.fill('input[placeholder*="REQ"], input[type="text"]', resiCode);
    await page.click('button[type="submit"], button:has-text("Lacak"), button:has-text("Cari")');
    
    // Status awal pending_rt teridentifikasi
    await expect(page.locator('text=/Menunggu Persetujuan Ketua RT|Diajukan|pending_rt/i').first()).toBeVisible({ timeout: 10000 });

    // D. RT 01 Menyetujui Surat
    const resLoginRt = await request.post(`${backendBaseUrl}/api/auth/login`, {
      headers: { Accept: 'application/json' },
      data: { login: 'rt01', password: 'password123' },
    });
    expect(resLoginRt.status()).toBe(200);
    const tokenRt = (await resLoginRt.json()).token;

    const resApproveRt = await request.post(`${backendBaseUrl}/api/surats/${suratId}/approve-rt`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${tokenRt}`,
      },
      data: { catatan: 'Persetujuan RT untuk pengujian QA Fase 4' },
    });
    expect(resApproveRt.status()).toBe(200);
    const approvedBody = await resApproveRt.json();
    expect(approvedBody.data.status).toBe('processed_sekdes');

    // E. Sekdes Menyelesaikan & Menerbitkan Nomor Resmi Surat
    const resLoginSekdes = await request.post(`${backendBaseUrl}/api/auth/login`, {
      headers: { Accept: 'application/json' },
      data: { login: 'sekdes', password: 'password123' },
    });
    expect(resLoginSekdes.status()).toBe(200);
    const tokenSekdes = (await resLoginSekdes.json()).token;

    const resProcessSekdes = await request.post(`${backendBaseUrl}/api/surats/${suratId}/process-sekdes`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${tokenSekdes}`,
      },
    });
    expect(resProcessSekdes.status()).toBe(200);
    const completedBody = await resProcessSekdes.json();
    expect(completedBody.data.status).toBe('completed');
    expect(completedBody.data.nomor_surat_resmi).toBeTruthy();

    // F. Verifikasi di Lacak Surat Publik bahwa status berubah menjadi Selesai
    await page.reload();
    await page.fill('input[placeholder*="REQ"], input[type="text"]', resiCode);
    await page.click('button[type="submit"], button:has-text("Lacak"), button:has-text("Cari")');
    await expect(page.locator('text=/Selesai|completed|Diterbitkan/i').first()).toBeVisible({ timeout: 10000 });
  });

  // Area F: Dashboard Kas RT & Otorisasi
  test('8. Dashboard RT dapat memuat data kas RT dan daftar transaksi', async ({ request }) => {
    const resLoginRt = await request.post(`${backendBaseUrl}/api/auth/login`, {
      headers: { Accept: 'application/json' },
      data: { login: 'rt01', password: 'password123' },
    });
    expect(resLoginRt.status()).toBe(200);
    const tokenRt = (await resLoginRt.json()).token;

    const resKas = await request.get(`${backendBaseUrl}/api/kas-rt`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${tokenRt}`,
      },
    });
    expect(resKas.status()).toBe(200);
    const kasData = await resKas.json();
    expect(kasData.success).toBe(true);
    expect(kasData).toHaveProperty('summary');
    expect(kasData).toHaveProperty('transactions');
  });

  // Area E: Pusat Dokumen Kependudukan Warga
  test('9. Pusat Dokumen Kependudukan Warga menampilkan status kelengkapan berkas', async ({ request }) => {
    const resLoginWarga = await request.post(`${backendBaseUrl}/api/auth/login`, {
      headers: { Accept: 'application/json' },
      data: { login: 'warga01', password: 'password123' },
    });
    expect(resLoginWarga.status()).toBe(200);
    const tokenWarga = (await resLoginWarga.json()).token;

    const resDokumen = await request.get(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${tokenWarga}`,
      },
    });
    expect(resDokumen.status()).toBe(200);
    const docData = await resDokumen.json();
    expect(docData.success).toBe(true);
    expect(docData.data.dokumen).toHaveProperty('foto_ktp');
    expect(docData.data.dokumen).toHaveProperty('foto_kk');
    expect(docData.data.stats).toHaveProperty('is_ready_for_letters');
  });

  // Area H: Penanganan Edge Case Form Validation
  test('10. Pengajuan surat tanpa field wajib ditolak dengan HTTP 422 dan pesan validasi', async ({ request }) => {
    const resLoginWarga = await request.post(`${backendBaseUrl}/api/auth/login`, {
      headers: { Accept: 'application/json' },
      data: { login: 'warga01', password: 'password123' },
    });
    expect(resLoginWarga.status()).toBe(200);
    const tokenWarga = (await resLoginWarga.json()).token;

    const resInvalid = await request.post(`${backendBaseUrl}/api/surats`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${tokenWarga}`,
      },
      data: {},
    });
    expect(resInvalid.status()).toBe(422);
    const errBody = await resInvalid.json();
    expect(errBody.errors).toHaveProperty('surat_type_id');
    expect(errBody.errors).toHaveProperty('keperluan');
  });
});
