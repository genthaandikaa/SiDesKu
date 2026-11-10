# Master Flowchart: Smart City & Urban Innovation (SDG 8, 9 & 11)

**FigJam Dedicated Board:** [Nexora Smart City Full Lifecycle - Complete Multi-Role Operations](https://www.figma.com/board/6r07oF5LAHnjYxXbuFLPw1)
**Versi:** 3.0 (Exhaustive Multi-Role Workflows, Zero Dead-Ends & End-to-End Decision Logic)

---

## Arsitektur Alur Multi-Peran (7 Role Lengkap)

Setiap peran (*role*) yang teridentifikasi setelah login pada Fase 2 memiliki cabang operasional kerja mandiri yang lengkap dengan menu, keputusan (*"jika valid lakukan X, jika bermasalah lakukan Y"*), dan keterhubungannya dengan siklus data perkotaan:

### 1. ALUR OPERASIONAL KETUA RT (`dashRt`)
Ketika Ketua RT masuk ke dashboard, ia memiliki 6 alur kerja terstruktur:
* **Verifikasi Permohonan Surat Warga Lingkungan**:
  - RT membuka antrean surat masuk dari warganya.
  - Memeriksa keabsahan berkas (KTP/KK) dan domisili faktual pemohon.
  - **Keputusan**:
    - *Berkas kurang/buram:* Input catatan revisi ➔ Notifikasi dikirim ke HP warga untuk diperbaiki.
    - *Permohonan tidak layak:* Tolak permohonan definitif dengan alasan resmi ➔ Arsip selesai.
    - *Data valid:* Klik `ACC Pengantar RT Digital` ➔ Otomatis diteruskan ke inbox Ketua RW.
* **Kelola Basis Data Kependudukan & Peta RT**:
  - Memetakan titik rumah warga RT pada peta spasial (`RealRtMap`).
  - Memantau status domisili (tetap, sewa/kontrak, kos).
* **Pembukuan Kas RT Digital**:
  - Mencatat iuran jimpitan, uang sampah, dan kas sosial kematian.
  - Menginput transaksi pemasukan/pengeluaran disertai bukti nota.
  - Menerbitkan laporan keuangan RT transparan yang bisa diakses warga RT.
* **Konfirmasi Akun Warga Baru**:
  - Memeriksa warga yang baru mendaftar akun di portal dan mengaku warga RT tersebut.
  - *Data fiktif:* Tolak pendaftaran.
  - *Data sah:* ACC akun warga menjadi warga terverifikasi.
* **Inspeksi & Validasi Listing Kos/Kontrakan**:
  - Memeriksa properti sewa baru yang didaftarkan pemilik kos di wilayah RT.
  - Ground check keamanan dan ketertiban lingkungan.
  - *Bangunan bermasalah/ilegal:* Tolak listing.
  - *Lingkungan tertib & aman:* Berikan lencana `Terverifikasi RT` agar tayang di peta hunian kota.
* **Audit Bansos Lapangan**:
  - Melakukan ground check usulan warga penerima DTKS Bansos agar tidak salah sasaran.

---

### 2. ALUR OPERASIONAL KETUA RW (`dashRw`)
* **Disposisi Surat Antar-RT**:
  - Memeriksa berkas surat yang telah mendapatkan ACC dari Ketua RT.
  - Memvalidasi keterpaduan zonasi kewilayahan RW.
  - **Keputusan**:
    - *Perlu perbaikan:* Kembalikan ke RT/warga.
    - *Disetujui:* Klik `Validasi Kewilayahan Digital` ➔ Otomatis terdisposisi ke meja registrasi Kelurahan.
* **Koordinasi Wilayah & Peta RW**:
  - Memantau batas wilayah seluruh RT di bawah naungan RW.
  - Mengawasi performa dan kecepatan disposisi antar-RT.
* **Pencarian Data Agregat Kependudukan**:
  - Filter pencarian kependudukan se-RW (gender, usia, status sosial, DTKS).
* **Pengelolaan Kas & Iuran RW**:
  - Mengelola dana subsidi lingkungan, pos kamling, dan kebersihan tingkat RW.

---

### 3. ALUR OPERASIONAL KELURAHAN & SEKRETARIS DESA (`dashKelurahan`)
* **Meja Pelayanan Administrasi**:
  - Kasi Pelayanan memverifikasi kelayakan yuridis dan kelengkapan berkas yang masuk dari RW.
  - *Cacat administrasi:* Tolak berkas dengan berita acara.
  - *Lengkap:* Masuk ke proses penomoran.
* **Penomoran Naskah Dinas Otomatis**:
  - Sistem meng-generate nomor surat dinas resmi berdasarkan kode klasifikasi kearsipan.
* **Paraf Digital Sekretaris Desa**:
  - Sekdes memeriksa draf akhir surat dan membubuhkan paraf digital berjenjang.
  - Meneruskan berkas ke meja eksekutif TTE Kades.
* **Pengelolaan Mutasi Kependudukan**:
  - Pencatatan peristiwa lahir, mati, pindah, dan datang.
* **Manajemen Bansos DTKS**:
  - Rekapitulasi kuota dan daftar penerima bansos kelurahan sebelum sinkronisasi dengan Dinsos.

---

### 4. ALUR OPERASIONAL KEPALA DESA / LURAH (`dashKades`)
* **Meja TTE Kriptografis BSrE BSSN**:
  - Memeriksa draf final surat yang telah diparaf Sekdes.
  - **Keputusan**:
    - *Tolak surat:* Berikan catatan evaluasi.
    - *Setuju TTE:* Masukkan PIN Kunci Otorisasi Digital Kades.
    - *Validasi PIN:* Jika salah, ulangi; jika cocok, sistem mengeksekusi enkripsi SHA-256 + TTE Digital BSrE BSSN + Segel QR Code + Watermark PDF sah.
* **Executive Monitoring Dashboard**:
  - Memantau statistik kependudukan, realisasi APBDes, indeks kepuasan publik, dan tren pengaduan.
* **Publikasi Pengumuman & Kebijakan Desa**:
  - Menyetujui pengumuman resmi untuk disiarkan ke aplikasi warga.
* **Monitoring Pengaduan Fasilitas Publik**:
  - Memantau laporan kerusakan fisik (jalan, PJU, jembatan) di wilayah desa.
  - Mengesahkan disposisi anggaran kas pelaksana desa pos APBDes untuk pengerjaan perbaikan.
* **Pengesahan LPJ APBDes**:
  - Menandatangani Laporan Pertanggungjawaban realisasi anggaran pendapatan dan belanja desa.

---

### 5. ALUR OPERASIONAL CAMAT & LOKET PATEN KECAMATAN (`dashCamat`)
* **Loket Pelayanan Administrasi Terpadu Kecamatan (PATEN)**:
  - Menerima eskalasi berkas dari Kelurahan/Desa untuk surat yang memerlukan pengesahan tingkat kecamatan (SKPWNI antar-kecamatan/kota, rekomendasi PBG, izin reklame).
  - Operator PATEN memverifikasi berkas:
    - *Kurang:* Kembalikan ke kelurahan untuk dilengkapi.
    - *Lengkap:* Diteruskan ke meja Camat.
* **Otorisasi TTE Camat**:
  - Camat menandatangani secara digital ➔ Surat Keputusan Camat Sah dan Terbit.
* **Evaluasi & Pengawasan Wilayah**:
  - Monitoring komparatif kinerja dan kecepatan pelayanan seluruh desa/kelurahan di wilayah kecamatan.

---

### 6. ALUR OPERASIONAL SMART CITY COMMAND CENTER KOTA (`dashCommand`)
* **Dinas PUPR Kota**:
  - Menerima pengaduan infrastruktur jalan kota/provinsi hasil evaluasi AI Vision & kuorum warga.
  - Menerjunkan Tim Reaksi Cepat untuk pengerjaan fisik di lokasi.
  - Mengunggah foto bukti selesai (*Photo After*) pada koordinat GPS yang identik.
  - Mengubah status menjadi Pin Hijau (Tuntas & Selesai).
* **Dinas Sosial Kota**:
  - Sinkronisasi basis data DTKS dengan Big Data Lake.
  - Audit silang bantuan sosial dengan data BULOG & Kemensos guna mengeliminasi data penerima ganda / fiktif.
* **Disnaker Kota**:
  - Memeriksa legalitas perusahaan dan lowongan kerja yang diunggah.
  - *Indikasi pungli / penipuan:* Tolak loker dan masukkan akun perusahaan ke daftar hitam (blacklist).
  - *Perusahaan resmi terdaftar NIB:* Berikan stempel verifikasi `Disnaker Verified (Anti-Fraud)` ➔ Terbit di Bursa Karir Kota.
* **Diskominfo Kota**:
  - Memantau Big Data Lake, performa server, integrasi API, dan audit log kriptografis verifikasi surat.
* **Walikota / Bupati (Executive City Dashboard)**:
  - Memantau heatmap isu perkotaan, indeks kepuasan masyarakat, dan serapan anggaran APBD secara real-time.

---

### 7. SIKLUS HIDUP 13 FASE END-TO-END
1. **Fase 1**: Akses, Identifikasi & Autentikasi Pengguna (Validasi NIK Dukcapil + OTP WA + Proteksi Brute Force).
2. **Fase 2**: Pemeriksaan Peran & Routing Akses (RBAC 7 Roles terisolasi).
3. **Fase 3 - 9**: Pengajuan Surat Mandiri ➔ Disposisi RT ➔ Disposisi RW ➔ Pelayanan Sekdes ➔ TTE Kades ➔ PATEN Camat ➔ Big Data Lake ➔ Notifikasi WA ➔ Unduh / Kios Cetak ➔ Audit Hash QR Code Pihak Ketiga (Bank, Kampus, BPJS).
4. **Fase 10**: Pengaduan Fasilitas Publik GIS ➔ AI Vision Audit ➔ Kuorum Upvote Warga ➔ Disposisi Kewenangan (Desa / Kecamatan / Dinas PUPR) ➔ Pengerjaan Fisik ➔ Foto After GPS ➔ Inspeksi ➔ Selesai.
5. **Fase 11**: Peta Spasial Hunian & Kos bagi Pendatang Baru ➔ Filter Tipe & Harga ➔ Pin Peta GPS ➔ Verifikasi Keamanan Pengurus RT ➔ Kontak Pemilik via WA Terverifikasi.
6. **Fase 12**: Pasar Bebas UMKM Kota Berbasis Radius Terdekat ➔ Filter Radius (<500m, <1.5km, <3km, <5km, Kota) ➔ Urutkan Jarak Paling Dekat ➔ Order via WhatsApp Bebas Potongan.
7. **Fase 13**: Bursa Karir & Lowongan Kerja Terpadu Kota ala LinkedIn ➔ Verifikasi NIB Disnaker Anti-Fraud ➔ Gaji Standar UMK ➔ Lamar Instan CV Online.
