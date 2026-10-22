import { test, expect } from '@playwright/test';

test.describe('Tahap 1: Public Tracking Security & Privacy Regression Suite', () => {
  const backendBaseUrl = 'http://127.0.0.1:8000';

  test('1. Request tanpa identifier harus ditolak dengan HTTP 422', async ({ request }) => {
    // Test empty query parameter
    const resEmpty = await request.get(`${backendBaseUrl}/api/public/surat/track`);
    expect(resEmpty.status()).toBe(422);
    const bodyEmpty = await resEmpty.json();
    expect(bodyEmpty.success).toBe(false);
    expect(bodyEmpty.data).toBeUndefined();

    // Test whitespace-only query parameter
    const resWhitespace = await request.get(`${backendBaseUrl}/api/public/surat/track?keyword=%20%20`);
    expect(resWhitespace.status()).toBe(422);
    const bodyWhitespace = await resWhitespace.json();
    expect(bodyWhitespace.success).toBe(false);
  });

  test('2. Identifier yang tidak dikenal harus mengembalikan data kosong tanpa error', async ({ request }) => {
    const res = await request.get(`${backendBaseUrl}/api/public/surat/track?keyword=REQ-99999999-NOTFOUND`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(0);
  });

  test('3. Nomor resi valid harus mengembalikan data yang aman dan nama tersamarkan (masked)', async ({ request }) => {
    const res = await request.get(`${backendBaseUrl}/api/public/surat/track?keyword=REQ-20260818-001`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);

    const surat = body.data[0];
    expect(surat.nomor_resi).toBe('REQ-20260818-001');

    // Pastikan nama tersamarkan (berisi karakter asteris '*')
    expect(surat.warga_profile).toBeDefined();
    expect(surat.warga_profile.nama_lengkap).toContain('*');

    // Pastikan field sensitif TIDAK PERNAH ADA di warga_profile
    expect(surat.warga_profile.nik).toBeUndefined();
    expect(surat.warga_profile.no_hp_wa).toBeUndefined();
    expect(surat.warga_profile.alamat_ktp).toBeUndefined();
    expect(surat.warga_profile.foto_ktp).toBeUndefined();
    expect(surat.warga_profile.foto_kk).toBeUndefined();
    expect(surat.warga_profile.foto_akta_lahir).toBeUndefined();
    expect(surat.warga_profile.foto_buku_nikah).toBeUndefined();
    expect(surat.warga_profile.dokumen_kependudukan_json).toBeUndefined();

    // Pastikan lampiran formulir sensitif pemohon tidak disertakan di respons publik
    expect(surat.form_data_json).toBeUndefined();
    expect(surat.file_lampiran).toBeUndefined();
  });

  test('4. Pencarian substring nama warga tidak boleh membuka daftar surat', async ({ request }) => {
    // Mencoba mencari substring nama "a"
    const resA = await request.get(`${backendBaseUrl}/api/public/surat/track?keyword=a`);
    const bodyA = await resA.json();
    expect(resA.status()).toBe(200);
    // Tidak boleh mengembalikan surat apapun jika bukan resi eksak
    expect(bodyA.data.length).toBe(0);

    // Mencoba mencari nama warga dummy
    const resNama = await request.get(`${backendBaseUrl}/api/public/surat/track?keyword=Budi`);
    const bodyNama = await resNama.json();
    expect(resNama.status()).toBe(200);
    expect(bodyNama.data.length).toBe(0);
  });

  test('5. Pencarian potongan NIK tidak boleh membuka daftar surat warga', async ({ request }) => {
    const resNik = await request.get(`${backendBaseUrl}/api/public/surat/track?keyword=3506`);
    const bodyNik = await resNik.json();
    expect(resNik.status()).toBe(200);
    expect(bodyNik.data.length).toBe(0);
  });

  test('6. Verifikasi alur antarmuka publik pada /lacak (Browser UI)', async ({ page }) => {
    await page.goto('/lacak');

    // 1. Submit form kosong -> harus menampilkan validasi error di UI
    const searchBtn = page.getByRole('button', { name: /Lacak Status/i });
    await searchBtn.click();
    await expect(page.locator('text=Silakan masukkan nomor resi')).toBeVisible();

    // 2. Input nomor resi valid -> memunculkan stepper dan nama tersamarkan
    const input = page.getByPlaceholder(/Contoh: REQ-/i);
    await input.fill('REQ-20260818-001');
    await searchBtn.click();

    // Card status surat harus muncul
    await expect(page.locator('text=REQ-20260818-001').first()).toBeVisible();
    await expect(page.locator('text=Tahapan Riwayat Persetujuan Berjenjang')).toBeVisible();

    // Pastikan UI tidak merender teks 16 digit NIK
    const pageContent = await page.content();
    expect(pageContent).not.toMatch(/3506\d{12}/);
  });
});
