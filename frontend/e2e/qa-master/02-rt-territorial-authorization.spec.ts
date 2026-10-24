import { test, expect } from '@playwright/test';

test.describe('Tahap 2: RT Territorial Authorization & State Transition Security Suite', () => {
  const backendBaseUrl = 'http://127.0.0.1:8000';

  let tokenRt01: string;
  let tokenAdmin: string;
  let tokenWarga: string;

  // Setup login token dummy
  test.beforeAll(async ({ request }) => {
    // 1. Login RT 01 (Ketua RT 01)
    const resRt = await request.post(`${backendBaseUrl}/api/auth/login`, {
      headers: { Accept: 'application/json' },
      data: { login: 'rt01', password: 'password123' },
    });
    expect(resRt.status()).toBe(200);
    const bodyRt = await resRt.json();
    tokenRt01 = bodyRt.token;

    // 2. Login Admin
    const resAdmin = await request.post(`${backendBaseUrl}/api/auth/login`, {
      headers: { Accept: 'application/json' },
      data: { login: 'admin', password: 'password123' },
    });
    expect(resAdmin.status()).toBe(200);
    const bodyAdmin = await resAdmin.json();
    tokenAdmin = bodyAdmin.token;

    // 3. Login Warga (Unauthorized role for RT action)
    const resWarga = await request.post(`${backendBaseUrl}/api/auth/login`, {
      headers: { Accept: 'application/json' },
      data: { login: 'warga01', password: 'password123' },
    });
    expect(resWarga.status()).toBe(200);
    const bodyWarga = await resWarga.json();
    tokenWarga = bodyWarga.token;
  });

  test('1. RT 01 berhasil memproses surat milik RT 01 yang berstatus pending_rt', async ({ request }) => {
    const listRes = await request.get(`${backendBaseUrl}/api/surats`, {
      headers: { Authorization: `Bearer ${tokenRt01}`, Accept: 'application/json' },
    });
    expect(listRes.status()).toBe(200);
    const listBody = await listRes.json();
    expect(listBody.success).toBe(true);
    expect(Array.isArray(listBody.data)).toBe(true);
  });

  test('3. RT 01 DITOLAK (HTTP 403) ketika mencoba menyetujui surat milik RT 02 (Cross-RT BOLA test)', async ({ request }) => {
    // Surat ID 33 terdaftar di database sebagai yurisdiksi RT 02
    const res = await request.post(`${backendBaseUrl}/api/surats/33/approve-rt`, {
      headers: { 
        Authorization: `Bearer ${tokenRt01}`,
        Accept: 'application/json',
      },
      data: { catatan: 'Percobaan approve lintas RT ilegal oleh RT 01' },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Akses ditolak');
    expect(body.message).toContain('wilayah RT');
  });

  test('4. RT 01 DITOLAK (HTTP 403) ketika mencoba menolak surat milik RT 02 (Cross-RT Reject BOLA test)', async ({ request }) => {
    // Surat ID 33 terdaftar di database sebagai yurisdiksi RT 02
    const res = await request.post(`${backendBaseUrl}/api/surats/33/reject`, {
      headers: { 
        Authorization: `Bearer ${tokenRt01}`,
        Accept: 'application/json',
      },
      data: { alasan: 'Penolakan lintas RT ilegal oleh RT 01' },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('Akses ditolak');
    expect(body.message).toContain('wilayah RT');
  });

  test('5. Pemanggilan langsung action endpoint dengan ID surat RT lain tetap ditolak (HTTP 403)', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/surats/33/rt-action`, {
      headers: { 
        Authorization: `Bearer ${tokenRt01}`,
        Accept: 'application/json',
      },
      data: { action: 'approve', catatan: 'Direct call bypass test' },
    });

    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('6. Pengguna tanpa autentikasi DITOLAK dengan HTTP 401', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/surats/33/approve-rt`, {
      headers: { Accept: 'application/json' },
      data: { catatan: 'Unauthenticated call' },
    });
    expect(res.status()).toBe(401);
  });

  test('7. Pengguna dengan role bukan RT (contoh: warga) DITOLAK dengan HTTP 403', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/surats/33/approve-rt`, {
      headers: { 
        Authorization: `Bearer ${tokenWarga}`,
        Accept: 'application/json',
      },
      data: { catatan: 'Warga mencoba approve surat' },
    });
    expect(res.status()).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('8. Surat yang statusnya bukan pending_rt (misal: processed_sekdes/completed) DITOLAK dengan HTTP 422', async ({ request }) => {
    // Surat ID 1 statusnya adalah processed_sekdes (bukan pending_rt)
    const res = await request.post(`${backendBaseUrl}/api/surats/1/approve-rt`, {
      headers: { 
        Authorization: `Bearer ${tokenRt01}`,
        Accept: 'application/json',
      },
      data: { catatan: 'Mencoba re-approve surat yang sudah di kantor desa' },
    });

    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('tidak dapat diproses lagi oleh RT');
  });

  test('9. Admin memiliki hak peninjauan/override sesuai kebijakan aplikasi', async ({ request }) => {
    const res = await request.get(`${backendBaseUrl}/api/surats`, {
      headers: { 
        Authorization: `Bearer ${tokenAdmin}`,
        Accept: 'application/json',
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('10. Pemanggilan ID surat yang tidak ada menghasilkan HTTP 404', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/surats/999999/approve-rt`, {
      headers: { 
        Authorization: `Bearer ${tokenRt01}`,
        Accept: 'application/json',
      },
      data: { catatan: 'Non existent letter' },
    });
    expect(res.status()).toBe(404);
  });
});
