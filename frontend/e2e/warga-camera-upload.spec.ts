import { test, expect } from '@playwright/test';
import path from 'path';

test('Verify Warga Multi-Document Attachments and Optional Attachment Submission', async ({ page }) => {
  // Set larger viewport to avoid collapsed sidebar
  await page.setViewportSize({ width: 1280, height: 900 });

  const dummyKtpBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkWPjfDwAEeQHzE19fGQAAAABJRU5ErkJggg==',
    'base64'
  );
  const dummyKkBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mNkWMrwHwMDw38GBgYGANoUA/5jGZ8rAAAAAElFTkSuQmCC',
    'base64'
  );

  // 1. Login as Warga
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[placeholder*="username" i], input[placeholder*="NIK" i], input[type="text"]', 'warga01');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Wait for dashboard to load
  await page.waitForURL('**/dashboard**', { timeout: 15000 });
  await page.waitForTimeout(1000);

  // -------------------------------------------------------------
  // TEST 1: OPTIONAL ATTACHMENT (Pengajuan tanpa foto - e.g. Hajatan)
  // -------------------------------------------------------------
  const ajukanNavBtn = page.locator('button:has-text("Ajukan Surat")').first();
  if (await ajukanNavBtn.isVisible()) {
    await ajukanNavBtn.click();
  } else {
    await page.click('button:has-text("Ajukan Surat Baru")');
  }

  await page.waitForSelector('text=1. Pilih Jenis Surat', { timeout: 8000 });

  // Select letter (SKIK - Izin Keramaian/Hajatan, or first available card)
  const hajatanCard = page.locator('text=Surat Pengantar Izin Keramaian / Hajatan Warga, text=SKIK, text=Surat Keterangan Domisili').first();
  if (await hajatanCard.isVisible()) {
    await hajatanCard.click();
  }

  // Verify badge "Opsional / Tidak Wajib" is visible
  await expect(page.locator('text=Opsional / Tidak Wajib')).toBeVisible();

  // Fill Keperluan without attaching any document
  await page.fill('textarea', 'Permohonan izin keramaian untuk acara hajatan syukuran warga RT 01 tanpa lampiran berkas fisik.');

  // Submit letter without photos
  await page.click('button[type="submit"]:has-text("Kirim Permohonan Surat")');

  // Verify submission SUCCEEDS even with 0 photos
  await expect(page.locator('text=Pengajuan Surat Berhasil Dikirim!')).toBeVisible({ timeout: 10000 });
  console.log('✅ Berhasil verifikasi pengajuan surat TANPA lampiran foto (Opsional).');

  // -------------------------------------------------------------
  // TEST 2: MULTI-DOCUMENT ATTACHMENT (KTP + KK + Dokumen Lain)
  // -------------------------------------------------------------
  // Click "Ajukan Surat Lain"
  await page.click('button:has-text("Ajukan Surat Lain")');
  await page.waitForSelector('text=1. Pilih Jenis Surat', { timeout: 8000 });

  // Select Surat Keterangan Usaha (SKU)
  const skuCard = page.locator('text=Surat Keterangan Usaha (SKU)').first();
  if (await skuCard.isVisible()) {
    await skuCard.click();
  }

  // A. Attach 1st document (Foto KTP)
  await page.click('button:has-text("Foto KTP")');
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles({
    name: 'foto_ktp_asli.png',
    mimeType: 'image/png',
    buffer: dummyKtpBuffer,
  });

  // Verify 1st document appears in the list
  await expect(page.locator('text=Dokumen Terlampir (1):')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('text=Foto KTP #1')).toBeVisible();

  // B. Attach 2nd document (Kartu Keluarga - KK)
  await page.click('button:has-text("Kartu Keluarga (KK)")');
  await fileInput.setInputFiles({
    name: 'kartu_keluarga_asli.png',
    mimeType: 'image/png',
    buffer: dummyKkBuffer,
  });

  // Verify BOTH documents appear in list
  await expect(page.locator('text=Dokumen Terlampir (2):')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('text=Foto KTP #1')).toBeVisible();
  await expect(page.locator('text=Kartu Keluarga (KK) #2')).toBeVisible();

  // Fill Keperluan for multi-attachment letter
  await page.fill('textarea', 'Permohonan SKU untuk keperluan survei modal usaha mikro UMKM dengan lampiran KTP dan KK.');

  // Take screenshot of form with multi-document list
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.resolve('e2e', 'screenshots', '08_Warga_Multi_Document_Form.png'),
    fullPage: true,
  });

  // C. Test Multi-Image Lightbox Gallery
  const firstEyeBtn = page.locator('button[title="Perbesar Foto"]').first();
  await firstEyeBtn.click();

  // Verify Lightbox opened with multiple image indicators
  await expect(page.locator('text=Pratinjau Dokumen Lampiran')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('text=1 / 2')).toBeVisible();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.resolve('e2e', 'screenshots', '08_Warga_Lightbox_Multi_Gallery.png'),
    fullPage: false,
  });

  // Test Next Document in Lightbox
  const nextBtn = page.locator('button[title="Dokumen Selanjutnya"]');
  if (await nextBtn.isVisible()) {
    await nextBtn.click();
    await expect(page.locator('text=2 / 2')).toBeVisible();
  }

  // Close Lightbox
  const closeBtn = page.locator('div.fixed.z-\\[999999\\] button').first();
  await closeBtn.click();
  await expect(page.locator('text=Pratinjau Dokumen Lampiran')).not.toBeVisible({ timeout: 5000 });

  // Submit letter with multi-attachments
  await page.click('button[type="submit"]:has-text("Kirim Permohonan Surat")');
  await expect(page.locator('text=Pengajuan Surat Berhasil Dikirim!')).toBeVisible({ timeout: 10000 });
  console.log('✅ Berhasil mengirim surat dengan Multi-Dokumen Lampiran (KTP + KK).');

  // -------------------------------------------------------------
  // TEST 3: VERIFY IN STATUS SURAT (Multi-document badge & gallery)
  // -------------------------------------------------------------
  const statusBtn = page.locator('button:has-text("Status Surat")').first();
  await statusBtn.click();
  await page.waitForTimeout(1000);

  // Verify button "Foto Lampiran (2)" is present
  const multiLampiranBtn = page.locator('button:has-text("Foto Lampiran (2)")').first();
  await expect(multiLampiranBtn).toBeVisible({ timeout: 8000 });

  await page.screenshot({
    path: path.resolve('e2e', 'screenshots', '08_Status_Surat_Multi_Badge.png'),
    fullPage: false,
  });

  // Click Foto Lampiran (2) to open gallery from status surat
  await multiLampiranBtn.click();
  await expect(page.locator('text=Pratinjau Dokumen Lampiran')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('text=1 / 2')).toBeVisible();

  // Close gallery
  await page.locator('div.fixed.z-\\[999999\\] button').first().click();
});
