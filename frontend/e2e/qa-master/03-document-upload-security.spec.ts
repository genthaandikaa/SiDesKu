import { test, expect } from '@playwright/test';

test.describe('Tahap 3: Document Upload & Base64 Payload Security Suite', () => {
  const backendBaseUrl = 'http://127.0.0.1:8000';

  let tokenWarga: string;
  let initialKtpUrl: string | null = null;

  // Synthetic valid test payloads
  const VALID_PNG_BASE64 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const VALID_PDF_BASE64 =
    'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgMzAwIDE0NF0+PmVuZG9iagp4cmVmCjAgNAowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA0L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKMTkwCiUlRU9GCg==';

  // Synthetic attack / invalid payloads
  const MALFORMED_BASE64 = 'data:image/jpeg;base64,!!!INVALID_BASE64_CHARS@@@===';
  const SVG_SCRIPT_DATA_URL =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxzY3JpcHQ+YWxlcnQoMSk8L3NjcmlwdD48L3N2Zz4=';
  const FAKE_MIME_TEXT_AS_JPEG =
    'data:image/jpeg;base64,SGVsbG8gV29ybGQhIFRoaXMgaXMganVzdCBhIHBsYWluIHRleHQgZmlsZSBub3QgYSByZWFsIEpQRUcgaW1hZ2UuIFBsZWFzZSByZWplY3QgbWUgc2VjdXJlbHku';
  const CORRUPTED_IMAGE_BYTES =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAA' + '00000000CORRUPT_BYTES';
  const EMPTY_BASE64 = 'data:image/jpeg;base64,';

  // Generate ~8 MB oversized string (> 5MB decoded)
  const OVERSIZED_BASE64 = 'data:image/jpeg;base64,' + 'A'.repeat(8 * 1024 * 1024);

  test.beforeAll(async ({ request }) => {
    // Login as warga01
    const res = await request.post(`${backendBaseUrl}/api/auth/login`, {
      headers: { Accept: 'application/json' },
      data: { login: 'warga01', password: 'password123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    tokenWarga = body.token;

    // Fetch initial document state to verify immutability later
    const docRes = await request.get(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
    });
    expect(docRes.status()).toBe(200);
    const docBody = await docRes.json();
    initialKtpUrl = docBody.data?.dokumen?.foto_ktp || null;
  });

  test('1. Upload file gambar valid (PNG/JPEG) dalam batas ukuran berhasil (HTTP 200)', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        tipe: 'ktp',
        file_data: VALID_PNG_BASE64,
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data?.url).toMatch(/\/api\/warga\/dokumen\/file\/|\/uploads\/warga_dokumen\//);
    expect(body.data?.url).toMatch(/\.(png|jpg|jpeg|webp)$/);
  });

  test('2. Upload PDF valid berhasil pada tipe yang mendukung (tambahan) (HTTP 200)', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        tipe: 'tambahan',
        file_data: VALID_PDF_BASE64,
        nama_dokumen: 'Ijazah Pendidikan Terakhir.pdf',
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data?.url).toMatch(/\/api\/warga\/dokumen\/file\/|\/uploads\/warga_dokumen\//);
    expect(body.data?.url).toMatch(/\.pdf$/);
  });

  test('3. Upload PDF DITOLAK (HTTP 422) pada tipe foto identitas KTP (Hanya Gambar)', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        tipe: 'ktp',
        file_data: VALID_PDF_BASE64,
      },
    });

    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/(tidak didukung|format gambar|tipe berkas)/i);
  });

  test('4. Payload Base64 malformed DITOLAK (HTTP 422)', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        tipe: 'ktp',
        file_data: MALFORMED_BASE64,
      },
    });

    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('5. Data URL dengan format tidak diizinkan / SVG berisiko DITOLAK (HTTP 422)', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        tipe: 'ktp',
        file_data: SVG_SCRIPT_DATA_URL,
      },
    });

    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('6. MIME type palsu (Text disguised as JPEG) DITOLAK oleh magic bytes inspection (HTTP 422)', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        tipe: 'ktp',
        file_data: FAKE_MIME_TEXT_AS_JPEG,
      },
    });

    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('7. File gambar rusak atau corrupted bytes DITOLAK (HTTP 422)', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        tipe: 'ktp',
        file_data: CORRUPTED_IMAGE_BYTES,
      },
    });

    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('8. Payload melebihi batas ukuran maksimum (>5MB) DITOLAK sebelum decoding (HTTP 422)', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        tipe: 'ktp',
        file_data: OVERSIZED_BASE64,
      },
    });

    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/(melebihi batas|maksimum|ukuran)/i);
  });

  test('9. Payload kosong DITOLAK (HTTP 422)', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        tipe: 'ktp',
        file_data: EMPTY_BASE64,
      },
    });

    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('10. Penggantian dokumen yang gagal TIDAK merusak dokumen lama', async ({ request }) => {
    // 1. Dapatkan foto_ktp saat ini
    const beforeRes = await request.get(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
    });
    const beforeKtp = (await beforeRes.json()).data?.dokumen?.foto_ktp;

    // 2. Lakukan upload palsu / rusak yang gagal
    const failRes = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        tipe: 'ktp',
        file_data: FAKE_MIME_TEXT_AS_JPEG,
      },
    });
    expect(failRes.status()).toBe(422);

    // 3. Verifikasi foto_ktp tetap utuh sama seperti semula
    const afterRes = await request.get(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
    });
    const afterKtp = (await afterRes.json()).data?.dokumen?.foto_ktp;
    expect(afterKtp).toBe(beforeKtp);
  });

  test('11. File tersimpan dengan nama acak unik dan ekstensi sesuai deteksi server (bukan nama klien)', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        tipe: 'tambahan',
        file_data: VALID_PNG_BASE64,
        nama_dokumen: '../../../malicious_traversal_name.exe',
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    // URL harus berada di api/warga/dokumen/file/ atau uploads/warga_dokumen/ dan berakhiran .png
    expect(body.data?.url).toMatch(/\/api\/warga\/dokumen\/file\/|\/uploads\/warga_dokumen\//);
    expect(body.data?.url).not.toContain('malicious_traversal_name');
    expect(body.data?.url).not.toContain('.exe');
    expect(body.data?.url).toMatch(/\.png$/);
  });

  test('12. Endpoint upload menolak request tanpa token autentikasi (HTTP 401)', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Accept: 'application/json' },
      data: {
        tipe: 'ktp',
        file_data: VALID_PNG_BASE64,
      },
    });

    expect(res.status()).toBe(401);
  });

  test('13. Upload dokumen sah untuk seluruh tipe master yang didukung (kk, akta, nikah) berhasil', async ({ request }) => {
    // 1. KK (Gambar)
    const resKk = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: { tipe: 'kk', file_data: VALID_PNG_BASE64 },
    });
    expect(resKk.status()).toBe(200);

    // 2. Akta (PDF didukung)
    const resAkta = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: { tipe: 'akta', file_data: VALID_PDF_BASE64 },
    });
    expect(resAkta.status()).toBe(200);

    // 3. Buku Nikah (Gambar)
    const resNikah = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: { tipe: 'nikah', file_data: VALID_PNG_BASE64 },
    });
    expect(resNikah.status()).toBe(200);
  });

  test('14. Upload avatar profil: tolak payload berbahaya dan terima gambar valid', async ({ request }) => {
    // 1. Tolak avatar palsu / teks
    const failRes = await request.put(`${backendBaseUrl}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        name: 'Warga 01',
        username: 'warga01',
        email: 'warga01@sidesku.desa.id',
        avatar: FAKE_MIME_TEXT_AS_JPEG,
      },
    });
    expect(failRes.status()).toBe(422);

    // 2. Terima avatar valid
    const okRes = await request.put(`${backendBaseUrl}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        name: 'Warga 01',
        username: 'warga01',
        email: 'warga01@sidesku.desa.id',
        avatar: VALID_PNG_BASE64,
      },
    });
    expect(okRes.status()).toBe(200);
    const body = await okRes.json();
    expect(body.success).toBe(true);
    const avatarUrl = body.user?.avatar || body.data?.user?.avatar;
    expect(avatarUrl).toContain('/uploads/avatars/');
  });

  test('15. Pengajuan surat dengan lampiran base64 valid tersimpan dengan aman', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/surats`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        surat_type_id: 1,
        keperluan: 'Uji Lampiran Surat QA Fase 3 Tahap 3',
        file_lampiran: [
          { url: VALID_PNG_BASE64, nama: 'Bukti Validasi Surat.png' },
          { url: VALID_PDF_BASE64, nama: 'Dokumen Pendukung.pdf' },
        ],
      },
    });

    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data?.file_lampiran).toBeTruthy();
    const lampirans = JSON.parse(body.data.file_lampiran);
    expect(Array.isArray(lampirans)).toBe(true);
    expect(lampirans.some((l: any) => l.url.includes('/uploads/lampiran/'))).toBe(true);
  });

  test('16. Berkas PDF yang mengandung script aktif berbahaya (/JavaScript /Launch) DITOLAK (HTTP 422)', async ({ request }) => {
    // PDF dengan embedded active JavaScript
    const MALICIOUS_JS_PDF = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R /Names << /JavaScript 3 0 R >> >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Names [(JS) 5 0 R] >>\nendobj\n4 0 obj\n<< /Type /Page /Parent 2 0 R >>\nendobj\n5 0 obj\n<< /S /JavaScript /JS (app.alert("malicious");) >>\nendobj\ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n250\n%%EOF'
    ).toString('base64');

    const res = await request.post(`${backendBaseUrl}/api/warga/dokumen`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json' },
      data: {
        tipe: 'akta',
        file_data: `data:application/pdf;base64,${MALICIOUS_JS_PDF}`,
      },
    });

    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/(script aktif|instruksi eksekusi)/i);
  });
});
