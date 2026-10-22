import { test, expect } from '@playwright/test';

test.describe('Tahap 4: Duplicate Submission & Idempotency Security Suite', () => {
  const backendBaseUrl = 'http://127.0.0.1:8000';

  let tokenWarga: string;
  let tokenRt01: string;

  test.beforeAll(async ({ request }) => {
    // 1. Login Warga 01
    const resWarga = await request.post(`${backendBaseUrl}/api/auth/login`, {
      headers: { Accept: 'application/json' },
      data: { login: 'warga01', password: 'password123' },
    });
    expect(resWarga.status()).toBe(200);
    tokenWarga = (await resWarga.json()).token;

    // 2. Login RT 01
    const resRt = await request.post(`${backendBaseUrl}/api/auth/login`, {
      headers: { Accept: 'application/json' },
      data: { login: 'rt01', password: 'password123' },
    });
    expect(resRt.status()).toBe(200);
    tokenRt01 = (await resRt.json()).token;
  });

  test('1. Pengajuan surat dengan Idempotency-Key: Pengiriman ulang (retry) mengembalikan record yang sama (HTTP 201 Hit)', async ({ request }) => {
    const key = `test_surat_key_${Date.now()}_1`;
    const payload = {
      surat_type_id: 1,
      keperluan: 'Pengajuan surat uji idempotensi retry safety',
    };

    // Panggilan pertama
    const res1 = await request.post(`${backendBaseUrl}/api/surats`, {
      headers: {
        Authorization: `Bearer ${tokenWarga}`,
        Accept: 'application/json',
        'X-Idempotency-Key': key,
      },
      data: payload,
    });
    expect(res1.status()).toBe(201);
    const body1 = await res1.json();
    expect(body1.success).toBe(true);
    const resi1 = body1.data?.nomor_resi;
    expect(resi1).toBeTruthy();

    // Panggilan kedua dengan Key dan Payload yang persis sama (simulasi retry / double click)
    const res2 = await request.post(`${backendBaseUrl}/api/surats`, {
      headers: {
        Authorization: `Bearer ${tokenWarga}`,
        Accept: 'application/json',
        'X-Idempotency-Key': key,
      },
      data: payload,
    });
    expect(res2.status()).toBe(201);
    const body2 = await res2.json();
    expect(body2.success).toBe(true);
    const resi2 = body2.data?.nomor_resi;

    // Nomor resi dan ID surat HARUS SAMA PERSIS (tidak membuat surat kedua)
    expect(resi2).toBe(resi1);
    expect(body2.data?.id).toBe(body1.data?.id);
  });

  test('2. Concurrency / Parallel Race Condition: Dua request bersamaan dengan key yang sama tidak membuat 2 surat', async ({ request }) => {
    const key = `test_parallel_key_${Date.now()}_2`;
    const payload = {
      surat_type_id: 1,
      keperluan: 'Pengajuan surat uji race condition konkurensi',
    };

    // Eksekusi dua request secara paralel di saat yang sama
    const [resA, resB] = await Promise.all([
      request.post(`${backendBaseUrl}/api/surats`, {
        headers: {
          Authorization: `Bearer ${tokenWarga}`,
          Accept: 'application/json',
          'X-Idempotency-Key': key,
        },
        data: payload,
      }),
      request.post(`${backendBaseUrl}/api/surats`, {
        headers: {
          Authorization: `Bearer ${tokenWarga}`,
          Accept: 'application/json',
          'X-Idempotency-Key': key,
        },
        data: payload,
      }),
    ]);

    const statuses = [resA.status(), resB.status()];
    // Status harus salah satu: [201, 201] (satu memproses, satu dapat cache) atau [201, 409] (satu memproses, satu terkena conflict lock)
    expect(statuses.every((s) => s === 201 || s === 409)).toBe(true);

    // Ambil data dari yang berstatus 201
    const bodyA = await resA.json();
    const bodyB = await resB.json();

    if (resA.status() === 201 && resB.status() === 201) {
      expect(bodyA.data?.nomor_resi).toBe(bodyB.data?.nomor_resi);
    }
  });

  test('3. Key yang sama digunakan dengan payload berbeda DITOLAK (HTTP 422)', async ({ request }) => {
    const key = `test_tamper_key_${Date.now()}_3`;

    // 1. Panggilan awal
    const res1 = await request.post(`${backendBaseUrl}/api/surats`, {
      headers: {
        Authorization: `Bearer ${tokenWarga}`,
        Accept: 'application/json',
        'X-Idempotency-Key': key,
      },
      data: {
        surat_type_id: 1,
        keperluan: 'Keperluan awal surat',
      },
    });
    expect(res1.status()).toBe(201);

    // 2. Panggilan kedua dengan key yang sama tapi payload diubah
    const res2 = await request.post(`${backendBaseUrl}/api/surats`, {
      headers: {
        Authorization: `Bearer ${tokenWarga}`,
        Accept: 'application/json',
        'X-Idempotency-Key': key,
      },
      data: {
        surat_type_id: 1,
        keperluan: 'Keperluan diubah dengan niat manipulasi payload',
      },
    });

    expect(res2.status()).toBe(422);
    const body2 = await res2.json();
    expect(body2.success).toBe(false);
    expect(body2.message).toContain('Idempotency key telah digunakan');
  });

  test('4. Key baru dapat membuat permohonan surat baru yang sah', async ({ request }) => {
    const key1 = `test_distinct_key_a_${Date.now()}`;
    const key2 = `test_distinct_key_b_${Date.now()}`;

    const res1 = await request.post(`${backendBaseUrl}/api/surats`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json', 'X-Idempotency-Key': key1 },
      data: { surat_type_id: 1, keperluan: 'Permohonan Pertama' },
    });
    expect(res1.status()).toBe(201);
    const body1 = await res1.json();

    const res2 = await request.post(`${backendBaseUrl}/api/surats`, {
      headers: { Authorization: `Bearer ${tokenWarga}`, Accept: 'application/json', 'X-Idempotency-Key': key2 },
      data: { surat_type_id: 1, keperluan: 'Permohonan Kedua' },
    });
    expect(res2.status()).toBe(201);
    const body2 = await res2.json();

    expect(body1.data?.nomor_resi).not.toBe(body2.data?.nomor_resi);
    expect(body1.data?.id).not.toBe(body2.data?.id);
  });

  test('5. Kas RT: Retry request dengan idempotency key yang sama tidak membuat transaksi ganda', async ({ request }) => {
    const key = `test_kas_key_${Date.now()}_5`;
    const payload = {
      tipe: 'Pemasukan',
      jumlah: 75000,
      keterangan: 'Iuran Kebersihan & Keamanan September (Uji Idempotensi)',
      tanggal_transaksi: '2026-10-11',
    };

    // Submit pertama
    const res1 = await request.post(`${backendBaseUrl}/api/kas-rt/transaction`, {
      headers: {
        Authorization: `Bearer ${tokenRt01}`,
        Accept: 'application/json',
        'X-Idempotency-Key': key,
      },
      data: payload,
    });
    expect(res1.status()).toBe(201);
    const body1 = await res1.json();
    const txId1 = body1.data?.id;

    // Retry submit dengan key yang sama
    const res2 = await request.post(`${backendBaseUrl}/api/kas-rt/transaction`, {
      headers: {
        Authorization: `Bearer ${tokenRt01}`,
        Accept: 'application/json',
        'X-Idempotency-Key': key,
      },
      data: payload,
    });
    expect(res2.status()).toBe(201);
    const body2 = await res2.json();
    const txId2 = body2.data?.id;

    // Harus mengembalikan record transaksi yang sama persis
    expect(txId2).toBe(txId1);
  });

  test('6. Kas RT: Dua transaksi sah dengan nominal dan deskripsi yang sama TETAP BISA DICATAT jika key berbeda', async ({ request }) => {
    const keyA = `test_kas_identical_a_${Date.now()}`;
    const keyB = `test_kas_identical_b_${Date.now()}`;

    const sharedPayload = {
      tipe: 'Pemasukan',
      jumlah: 50000,
      keterangan: 'Iuran Sampah Warga RT 01 Rutin Bulanan',
      tanggal_transaksi: '2026-10-11',
    };

    // Transaksi A (Sah untuk Warga X)
    const resA = await request.post(`${backendBaseUrl}/api/kas-rt/transaction`, {
      headers: {
        Authorization: `Bearer ${tokenRt01}`,
        Accept: 'application/json',
        'X-Idempotency-Key': keyA,
      },
      data: sharedPayload,
    });
    expect(resA.status()).toBe(201);
    const bodyA = await resA.json();

    // Transaksi B (Sah untuk Warga Y, dengan nominal dan deskripsi yang identik)
    const resB = await request.post(`${backendBaseUrl}/api/kas-rt/transaction`, {
      headers: {
        Authorization: `Bearer ${tokenRt01}`,
        Accept: 'application/json',
        'X-Idempotency-Key': keyB,
      },
      data: sharedPayload,
    });
    expect(resB.status()).toBe(201);
    const bodyB = await resB.json();

    // Kedua transaksi sah harus berhasil dicatat dan memiliki ID yang berbeda!
    expect(bodyA.data?.id).not.toBe(bodyB.data?.id);
    expect(bodyA.data?.jumlah).toBe(bodyB.data?.jumlah);
  });

  test('7. Kegagalan validasi tidak membuat record transaksi kas RT', async ({ request }) => {
    const key = `test_kas_fail_${Date.now()}_7`;

    const res = await request.post(`${backendBaseUrl}/api/kas-rt/transaction`, {
      headers: {
        Authorization: `Bearer ${tokenRt01}`,
        Accept: 'application/json',
        'X-Idempotency-Key': key,
      },
      data: {
        tipe: 'Pemasukan',
        jumlah: -5000, // Invalid: jumlah harus >= 1
        keterangan: '', // Invalid: keterangan wajib diisi
      },
    });

    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.errors || body.success === false).toBeTruthy();
  });

  test('8. Isolasi Pengguna: User lain yang mengirim key yang sama tidak mengakses record milik user pertama', async ({ request }) => {
    const sharedKeyName = `shared_key_isolation_test_${Date.now()}`;

    // 1. Warga 01 mengirim request dengan key ini
    const resWarga = await request.post(`${backendBaseUrl}/api/surats`, {
      headers: {
        Authorization: `Bearer ${tokenWarga}`,
        Accept: 'application/json',
        'X-Idempotency-Key': sharedKeyName,
      },
      data: {
        surat_type_id: 1,
        keperluan: 'Pengajuan surat rahasia Warga 01',
      },
    });
    expect(resWarga.status()).toBe(201);
    const bodyWarga = await resWarga.json();

    // 2. RT 01 (user berbeda) membuat kas dengan string key yang sama
    const resRt = await request.post(`${backendBaseUrl}/api/kas-rt/transaction`, {
      headers: {
        Authorization: `Bearer ${tokenRt01}`,
        Accept: 'application/json',
        'X-Idempotency-Key': sharedKeyName,
      },
      data: {
        tipe: 'Pemasukan',
        jumlah: 25000,
        keterangan: 'Iuran RT 01',
      },
    });
    expect(resRt.status()).toBe(201);
    const bodyRt = await resRt.json();

    // Keduanya terisolasi per user_id + endpoint dan tidak saling membocorkan data
    expect(bodyRt.data?.id).not.toBe(bodyWarga.data?.id);
  });

  test('9. Operasi tanpa header Idempotency-Key tetap berjalan normal (backward compatibility)', async ({ request }) => {
    const res = await request.post(`${backendBaseUrl}/api/surats`, {
      headers: {
        Authorization: `Bearer ${tokenWarga}`,
        Accept: 'application/json',
      },
      data: {
        surat_type_id: 1,
        keperluan: 'Pengajuan surat reguler tanpa idempotency header',
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data?.nomor_resi).toBeTruthy();
  });
});
