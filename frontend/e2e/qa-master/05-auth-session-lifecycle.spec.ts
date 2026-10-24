import { test, expect } from '@playwright/test';

test.describe('Tahap 5: Auth Session Lifecycle & HTTP 401 Handling Security Suite', () => {
  const backendBaseUrl = 'http://127.0.0.1:8000';
  const frontendBaseUrl = 'http://localhost:5173';

  let tokenWarga: string;

  test.beforeAll(async ({ request }) => {
    // Generate valid citizen auth token for baseline comparison
    const res = await request.post(`${backendBaseUrl}/api/auth/login`, {
      headers: { Accept: 'application/json' },
      data: { login: 'warga01', password: 'password123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    tokenWarga = body.token;
  });

  test('1. Protected API endpoint menolak request tanpa token dengan HTTP 401 Unauthenticated', async ({ request }) => {
    const res = await request.get(`${backendBaseUrl}/api/auth/me`, {
      headers: { Accept: 'application/json' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.message).toMatch(/Unauthenticated/i);
  });

  test('2. Protected API endpoint menolak token invalid / rusak dengan HTTP 401', async ({ request }) => {
    const res = await request.get(`${backendBaseUrl}/api/auth/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer invalid_garbage_token_999999',
      },
    });
    expect(res.status()).toBe(401);
  });

  test('3. HTTP 403 Forbidden TIDAK membatalkan token atau menghapus sesi pengguna (RBAC isolation)', async ({ request }) => {
    // Warga mencoba mengakses endpoint approval RT (otorisasi ditolak)
    const resForbidden = await request.post(`${backendBaseUrl}/api/surats/33/approve-rt`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${tokenWarga}`,
      },
      data: { catatan: 'Percobaan warga bypass otorisasi' },
    });

    // Harus ditolak dengan 403 Forbidden
    expect(resForbidden.status()).toBe(403);

    // Verifikasi bahwa setelah 403, sesi Warga TETAP SAH dan aktif (tidak logout)
    const resCheckMe = await request.get(`${backendBaseUrl}/api/auth/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${tokenWarga}`,
      },
    });
    expect(resCheckMe.status()).toBe(200);
    const bodyCheck = await resCheckMe.json();
    expect(bodyCheck.success).toBe(true);
    expect(bodyCheck.user.username).toBe('warga01');
  });

  test('4. Endpoint login dengan kredensial salah mengembalikan HTTP 422 tanpa memicu redirect loop', async ({ request, page }) => {
    // A. API verification
    const resApi = await request.post(`${backendBaseUrl}/api/auth/login`, {
      headers: { Accept: 'application/json' },
      data: { login: 'warga01', password: 'wrongpassword999' },
    });
    expect(resApi.status()).toBe(422);
    const bodyApi = await resApi.json();
    expect(bodyApi.errors || bodyApi.message).toBeTruthy();

    // B. Browser UI verification: pastikan pesan error tampil di formulir tanpa loop
    await page.goto(`${frontendBaseUrl}/login`);
    await page.fill('input[type="text"], input[name="login"], input[placeholder*="Username"]', 'warga01');
    await page.fill('input[type="password"]', 'wrongpassword999');
    await page.click('button[type="submit"]');

    // Tunggu banner error tampil
    const errorNotice = page.locator('div.bg-rose-50');
    await expect(errorNotice).toBeVisible();
    await expect(errorNotice).toContainText(/kredensial|tidak cocok|salah/i);

    // URL tetap berada di /login, tidak looping
    expect(page.url()).toContain('/login');
  });

  test('5. Halaman publik dapat diakses tanpa token tanpa dialihkan ke login', async ({ page }) => {
    // Beranda
    await page.goto(`${frontendBaseUrl}/`);
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toBe(`${frontendBaseUrl}/`);

    // Lacak Surat
    await page.goto(`${frontendBaseUrl}/lacak`);
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/lacak');

    // Berita Warta
    await page.goto(`${frontendBaseUrl}/berita`);
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/berita');

    // Transparansi
    await page.goto(`${frontendBaseUrl}/transparansi`);
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/transparansi');
  });

  test('6. Mengakses dashboard terproteksi tanpa token otomatis redirect ke /login dengan returnUrl', async ({ page }) => {
    // Pastikan localStorage kosong
    await page.goto(`${frontendBaseUrl}/login`);
    await page.evaluate(() => localStorage.clear());

    // Coba langsung buka /dashboard
    await page.goto(`${frontendBaseUrl}/dashboard`);
    await page.waitForURL(/\/login/);

    // Pastikan URL mengikutsertakan parameter returnUrl
    expect(page.url()).toContain('returnUrl=%2Fdashboard');
  });

  test('7. Token invalid pada localStorage langsung dibersihkan dan redirect ke /login (Ghost Login Prevention)', async ({ page }) => {
    // Injeksi token palsu / expired ke localStorage
    await page.goto(`${frontendBaseUrl}/login`);
    await page.evaluate(() => {
      localStorage.setItem('token', 'invalid_expired_token_mock_xyz_123');
    });

    // Coba muat ulang langsung ke dashboard
    await page.goto(`${frontendBaseUrl}/dashboard`);
    await page.waitForURL(/\/login/);

    // Token harus sudah dihapus dari localStorage oleh Axios interceptor / AuthContext
    const tokenInStorage = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenInStorage).toBeNull();

    // Konten dashboard tidak boleh terlihat (tidak ada ghost dashboard)
    const dashboardLayout = page.locator('aside, .dashboard-container');
    await expect(dashboardLayout).not.toBeVisible();
  });

  test('8. Login berhasil dengan returnUrl mengarahkan pengguna kembali ke halaman yang dituju', async ({ page }) => {
    // Buka halaman login dengan returnUrl
    await page.goto(`${frontendBaseUrl}/login?returnUrl=%2Fdashboard`);

    // Login via 1-klik akun Warga demo
    await page.click('button:has-text("Warga (NIK)")');
    await page.click('button[type="submit"]');

    // Harus diarahkan kembali ke returnUrl (/dashboard)
    await page.waitForURL(/\/dashboard/);
    expect(page.url()).toContain('/dashboard');

    // Token harus tersimpan di localStorage
    const savedToken = await page.evaluate(() => localStorage.getItem('token'));
    expect(savedToken).toBeTruthy();
  });

  test('9. Open Redirect Defense: returnUrl ke URL eksternal / protokol berbahaya ditolak dan diarahkan aman ke /dashboard', async ({ page }) => {
    // A. Coba serangan Open Redirect dengan tautan absolut eksternal
    await page.goto(`${frontendBaseUrl}/login?returnUrl=https%3A%2F%2Fevil-phishing-site.com%2Fsteal`);
    await page.click('button:has-text("Warga (NIK)")');
    await page.click('button[type="submit"]');

    // Harus dialihkan ke internal /dashboard, BUKAN ke situs eksternal
    await page.waitForURL(/\/dashboard/);
    expect(page.url()).not.toContain('evil-phishing-site.com');
    expect(page.url()).toContain('/dashboard');

    // B. Logout dan coba serangan Open Redirect variasi backslash / protocol-relative (/\\evil.com)
    await page.evaluate(() => localStorage.clear());
    await page.goto(`${frontendBaseUrl}/login?returnUrl=%2F%5C%5Cevil.com`);
    await page.click('button:has-text("Warga (NIK)")');
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/);
    expect(page.url()).not.toContain('evil.com');
    expect(page.url()).toContain('/dashboard');
  });

  test('10. Runtime 401 saat sesi aktif otomatis menghapus token dan redirect ke /login', async ({ page }) => {
    // Login terlebih dahulu
    await page.goto(`${frontendBaseUrl}/login`);
    await page.click('button:has-text("Warga (NIK)")');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);

    // Simulasikan token diubah menjadi invalid di tengah sesi aktif
    await page.evaluate(() => {
      localStorage.setItem('token', 'tampered_invalid_token_during_session');
    });

    // Panggil API lewat browser context untuk memicu interceptor
    await page.evaluate(async () => {
      try {
        const { default: api } = await import('/src/shared/lib/axios.ts');
        await api.get('/auth/me');
      } catch {
        // expected error
      }
    });

    // Tunggu interceptor memicu pembersihan dan redirect
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');

    // Token di localStorage sudah bersih
    const tokenAfter = await page.evaluate(() => localStorage.getItem('token'));
    expect(tokenAfter).toBeNull();
  });

  test('11. Debouncing 401: Multiple concurrent 401 requests ditangani secara aman tanpa crash atau loop', async ({ page }) => {
    await page.goto(`${frontendBaseUrl}/login`);
    await page.evaluate(() => {
      localStorage.setItem('token', 'broken_concurrent_token_123');
    });

    // Kirim 5 request paralel sekaligus dari browser
    const results = await page.evaluate(async () => {
      try {
        const { default: api } = await import('/src/shared/lib/axios.ts');
        const promises = [
          api.get('/auth/me').catch(e => e.response?.status),
          api.get('/surats').catch(e => e.response?.status),
          api.get('/auth/me').catch(e => e.response?.status),
          api.get('/surats').catch(e => e.response?.status),
          api.get('/auth/me').catch(e => e.response?.status),
        ];
        return await Promise.all(promises);
      } catch {
        return ['error'];
      }
    });

    // Semua request paralel menerima 401
    expect(results).toEqual([401, 401, 401, 401, 401]);

    // Token tetap terhapus dengan aman
    const storedToken = await page.evaluate(() => localStorage.getItem('token'));
    expect(storedToken).toBeNull();
  });
});
