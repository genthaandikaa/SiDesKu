<div align="center">
  <!-- Header Banner: Animated Dark Emerald Wave with Twinkling Stars & High-Contrast Crisp Typography -->
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,50:064e3b,100:10b981&height=220&section=header&text=Nexora&fontSize=48&fontAlignY=38&fontColor=ffffff&desc=Sistem%20Informasi%20Desa%20%26%20Digitalisasi%20Layanan%20Publik%20Terpadu&descAlignY=58&descSize=17&descColor=34d399&animation=twinkling" width="100%"/>

  <br/>

  <!-- Dynamic Typing SVG -->
  <a href="https://github.com/genthaandikaa/SiDesKu">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=19&duration=3000&pause=1000&color=10B981&center=true&vCenter=true&width=680&lines=Platform+Smart+Village+%26+E-Government+Terpadu;Layanan+Persuratan+Digital+Multi-Tier+%2B+QR+Signature;Smart+City%3A+UMKM%2C+Loker+Lokal%2C+dan+Hunian+Desa;Monitoring+Agregat+Kecamatan+%26+Kabupaten%2FKota;Tracking+Resi+Surat+Real-Time+%26+Verifikasi+Keaslian;Transparansi+Anggaran+APBDes+%26+Bansos+Desa" alt="Typing Tagline" />
  </a>

  <br/><br/>

  <!-- Badges Grid -->
  <p>
    <img src="https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Laravel%2012%2F13-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" />
    <img src="https://img.shields.io/badge/PHP%208.4-777BB4?style=for-the-badge&logo=php&logoColor=white" alt="PHP 8.4" />
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  </p>

  <p>
    <img src="https://img.shields.io/badge/Architecture-Feature--Driven%20SPA%20%2B%20REST%20API-064e3b?style=flat-square" alt="Architecture" />
    <img src="https://img.shields.io/badge/Auth-Laravel%20Sanctum-10b981?style=flat-square" alt="Sanctum" />
    <img src="https://img.shields.io/badge/Security-Cryptographic%20QR%20Signature-0284c7?style=flat-square" alt="QR Security" />
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" />
  </p>
</div>

---

## 📌 Daftar Isi
- [Tentang Nexora](#-tentang-nexora)
- [Masalah yang Diselesaikan](#-masalah-yang-diselesaikan)
- [Fitur Utama](#-fitur-utama)
- [Matriks Hak Akses (Role-Based Access Control)](#-matriks-hak-akses-role-based-access-control)
- [Alur Kerja Layanan Surat (Workflow Diagram)](#-alur-kerja-layanan-surat-workflow-diagram)
- [Teknologi & Arsitektur](#-teknologi--arsitektur)
- [Struktur Direktori](#-struktur-direktori)
- [Panduan Instalasi & Menjalankan](#-panduan-instalasi--menjalankan)
- [Akun Demo Pengujian](#-akun-demo-pengujian)
- [Referensi Endpoint API](#-referensi-endpoint-api)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

---

## 🏛️ Tentang Nexora

**Nexora** (*Sistem Informasi Desa & Smart Governance Terpadu*) adalah platform *Smart Village & Regional E-Government* modern yang dirancang untuk mentransformasi birokrasi konvensional menjadi sistem administrasi publik digital yang **efisien, transparan, akuntabel, dan bebas pemalsuan**.

Platform ini mengintegrasikan seluruh ekosistem pelayanan desa dan wilayah secara berjenjang—mulai dari warga masyarakat di tingkat Rukun Tetangga (RT), pengurus Rukun Warga (RW), perangkat pemerintah desa (Sekretaris Desa, Kepala Desa, Bendahara Desa), hingga pengawasan tingkat **Kecamatan** dan **Kabupaten/Kota** dalam satu arsitektur terpadu (*single-window service*).

---

## 💡 Masalah yang Diselesaikan

| Tantangan Konvensional | Solusi Digital Nexora |
| :--- | :--- |
| **Birokrasi Rumit & Antrean Fisik:** Warga harus bolak-balik mendatangi rumah RT, RW, lalu ke balai desa hanya untuk selembar surat pengantar. | **Pengajuan Mandiri Online:** Warga dapat mengajukan surat kapan saja via smartphone/laptop dengan pelacakan nomor resi otomatis secara real-time. |
| **Resiko Dokumen Palsu:** Tanda tangan dan stempel basah rawan dipalsukan. | **Verifikasi Tanda Tangan QR Code Kriptografis:** Dokumen resmi disahkan dengan QR Code unik ber-hash yang dapat diverifikasi keasliannya oleh instansi publik (Bank, Dispendukcapil, Sekolah) seketika. |
| **Status Surat Tidak Jelas:** Warga sering bingung apakah permohonan sudah diproses atau terhambat. | **Live Tracking Resi Berjenjang:** Warga dapat memantau status secara presisi (Diajukan $\rightarrow$ Diverifikasi RT $\rightarrow$ Validasi RW $\rightarrow$ Legalisasi Sekdes/Kades $\rightarrow$ Terbit). |
| **Ketidakterbukaan Anggaran Desa:** Informasi APBDes dan Bansos jarang diakses warga secara transparan. | **Portal Transparansi Publik:** Dashboard visual interaktif realisasi APBDes serta transparansi data penerima program Bantuan Sosial (Bansos). |
| **Pencatatan Iuran RT yang Tercecer:** Kas RT masih dicatat pada buku fisik yang rawan hilang. | **Buku Kas RT Digital:** Pencatatan otomatis iuran, pengeluaran, serta laporan neraca kas RT secara real-time. |
| **Potensi Ekonomi & Kerja Lokal Tersebar:** UMKM warga, lowongan kerja, dan hunian sewa sulit ditemukan. | **Smart City Desa Hub:** Etalase produk UMKM warga, bursa loker lokal terverifikasi, dan direktori kos/hunian desa. |
| **Silo Data Antar Instansi:** Data desa terisolasi dan lambat dilaporkan ke tingkat Kecamatan & Kabupaten. | **Regional Governance Dashboard:** Panel pemantauan agregat statistik & pelayanan untuk pihak Kecamatan & Kabupaten/Kota. |

---

## ✨ Fitur Utama

### 1. 📄 Layanan Persuratan Digital Multi-Tier (*E-Surat*)
* **Katalog Surat Lengkap:** Menyediakan berbagai jenis permohonan surat resmi:
  * Surat Keterangan Tidak Mampu (SKTM)
  * Surat Keterangan Usaha (SKU)
  * Surat Keterangan Domisili (SKD)
  * Surat Pengantar KTP-el & Kartu Keluarga (KK)
  * Surat Keterangan Nikah (Model N1 - N4)
  * Surat Keterangan Kelahiran & Kematian
  * Surat Izin Keramaian & Surat Pengantar Umum lainnya
* **Penerbitan Nomor Surat Otomatis:** Generator penomoran dinas terstandarisasi Permendagri (format kode klasifikasi/nomor urut/kode wilayah/tahun).
* **Unduh & Cetak PDF Resmi:** Dilengkapi Kop Surat dinas resmi, logo kabupaten/kota, detail pemohon, stempel desa, dan QR Code tanda tangan digital resmi.

### 2. 🔐 Verifikasi Keaslian Dokumen QR Code Publik (*Anti-Forgery*)
* Setiap surat yang disahkan menghasilkan *digital signature hash* unik (SHA-256).
* Portal publik **Lacak & Verifikasi QR**: siapapun dapat memindai QR Code menggunakan kamera smartphone atau menginput hash untuk memvalidasi keabsahan dokumen tanpa perlu login ke sistem.

### 3. 📦 Tracking Resi Pengajuan Surat Real-Time
* Warga mendapatkan **Nomor Resi Unik** (contoh: `REQ-20260818-001`) seketika saat permohonan dikirim.
* Pelacakan linimasa status secara transparan (*Pengajuan Warga $\rightarrow$ Persetujuan Ketua RT $\rightarrow$ Legalisasi & TTD QR Kepala Desa/Sekdes $\rightarrow$ Siap Unduh PDF*).

### 4. 🏙️ Smart City & Pemberdayaan Ekonomi Desa
* **Direktori UMKM Desa:** Etalase promosi produk lokal warga dengan detail kontak, katalog barang, dan estimasi ongkos kirim.
* **Bursa Lowongan Kerja (Loker) Lokal:** Publikasi peluang kerja di desa/sekitarnya lengkap dengan kualifikasi dan syarat dokumen.
* **Direktori Kos & Hunian:** Pencarian tempat tinggal, kos-kosan, dan kontrakan desa lengkap dengan fasilitas, harga, dan peta lokasi.

### 5. 🏛️ Regional Dashboard (Kecamatan & Kabupaten/Kota)
* Pemantauan agregat lintas desa untuk tingkat **Pemerintah Kecamatan** dan **Pemerintah Kabupaten/Kota**.
* Analitik kependudukan, kecepatan layanan surat per desa, status bansos, serta peta sebaran wilayah tugas secara terpadu.

### 6. 🔔 Notifikasi Real-Time Web Push & PWA (Progressive Web App)
* **Rp0 Biaya Operasional (Zero-Cost):** Menggunakan standar industri W3C Web Push & VAPID RFC 8291/8292 langsung ke push service browser (FCM Google Chrome, Mozilla autopush, Apple WebPush Safari) tanpa pihak ketiga berbayar.
* **Instalasi PWA 1-Klik:** Aplikasi dapat diinstal langsung di layar utama smartphone (Android/iOS) dan desktop layaknya aplikasi native.
* **Push Notification Lintas Perangkat:** Notifikasi instan diterima warga dan aparatur desa saat ada pengajuan surat masuk, surat disahkan, pengumuman darurat, dan penyaluran bansos.

### 7. 📊 Transparansi Keuangan Desa (APBDes)
* Visualisasi grafik interaktif realisasi Anggaran Pendapatan dan Belanja Desa.
* Breakdown terperinci: **Pendapatan Desa** (PAD, Dana Desa, ADD), **Belanja Desa** (Pemerintahan, Pembangunan, Pembinaan), dan **Pembiayaan**.

### 8. 🤝 Manajemen Bantuan Sosial (Bansos) Terbuka
* Manajemen alokasi program bantuan: PKH, BLT Dana Desa, BPNT, dan Bantuan Sembako.
* Filter data penerima berbasis kelayakan ekonomi, verifikasi lapangan, dan integrasi broadcast kartu QR bantuan.

### 9. 💵 Buku Kas & Iuran Warga Tingkat RT
* Pencatatan arus kas masuk (iuran sampah, jimpitan, dana sosial) dan kas keluar (pembangunan pos ronda, kerja bakti).
* Rekapitulasi saldo kas RT real-time yang dapat diakses oleh pengurus RT.

---

## 👥 Matriks Hak Akses (Role-Based Access Control)

| Peran / Role | Hak Akses & Tanggung Jawab Utama |
| :--- | :--- |
| **🌐 Tamu / Publik** | Akses landing page, baca profil desa & berita, lacak resi surat, verifikasi QR Code dokumen resmi, cek etalase Smart City (UMKM/Loker/Kos), lihat ringkasan APBDes. |
| **👨👩👧 Warga** | Mengajukan surat online mandiri, melacak status resi, unduh PDF surat berstempel QR, kelola UMKM/Loker/Kos miliknya, kirim aspirasi/pengaduan ke RT, dan cek status bansos. |
| **📋 Ketua RT** | Verifikasi & setujui pengantar surat warga RT, kelola data kependudukan RT, kelola Buku Kas & iuran warga RT, tindak lanjuti aspirasi warga. |
| **🏢 Ketua RW** | Monitoring demografi warga & koordinasi lingkungan lintas RT di tingkat Rukun Warga. |
| **🏛️ Sekretaris Desa (Sekdes)** | Tata laksana administrasi umum desa, buku register kependudukan, arsip surat sah, penerbitan surat loket, manajemen kop surat, dan program bansos. |
| **👑 Kepala Desa (Kades)** | Eksekutif & legalisasi akhir persuratan desa, penandatanganan stempel QR resmi desa, kebijakan umum, visi-misi, dan pengumuman publik. |
| **💰 Bendahara Desa** | Menginput pos anggaran, mencatat realisasi belanja & pendapatan desa, mempublikasikan transparansi APBDes ke masyarakat. |
| **⚙️ Admin Desa** | Akses penuh master data desa, manajemen pengguna, master jenis surat, konfigurasi wilayah & kop surat dinas. |
| **🏢 Kecamatan** | Dashboard monitoring agregat layanan desa, rekapitulasi data penduduk, dan performa birokrasi di wilayah kecamatan. |
| **🏛️ Kabupaten/Kota** | Dashboard eksekutif pemantauan lintas kecamatan, statistik demografi regional, dan agregasi data Smart City kabupaten/kota. |
| **🛡️ Super Administrator** | Pengelolaan multi-tenant platform Nexora lintas desa dan kabupaten/kota secara global. |

---

## 🔄 Alur Kerja Layanan Surat (Workflow Diagram)

```mermaid
flowchart TD
    A["Warga Mengajukan Surat Online"] -->|"Nomor Resi Diterbitkan (Status: pending_rt)"| B["Dashboard Ketua RT"]
    B -->|"Verifikasi Dokumen & Identitas"| C{"Persetujuan RT"}
    C -->|"Ditolak + Catatan Revisi"| X["Notifikasi Web Push Revisi ke Warga"]
    C -->|"Disetujui (Status: pending_kades)"| D["Dashboard Kepala Desa / Sekdes"]
    D -->|"Pemeriksaan & Otorisasi Dinas"| E{"Legalisasi Kepala Desa"}
    E -->|"Ditolak"| X
    E -->|"Disahkan (Status: completed)"| F["Penerbitan Nomor Surat Dinas & QR Signature Hash Resmi"]
    F --> G["Notifikasi Web Push Surat Selesai ke Warga"]
    G --> H["Warga Unduh Surat Format PDF Resmi"]
    H --> I["Pihak Ketiga Scan QR Code di Portal Publik"]
    I --> J["Verifikasi Keaslian Valid & Terdata Resmi di Database"]
```

---

## 🛠️ Teknologi & Arsitektur

### Frontend Ecosystem
* **Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tooling:** [Vite](https://vitejs.dev/) (Fast HMR & Optimized Bundler)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
* **Routing:** [React Router v6](https://reactrouter.com/) (Protected Routes & Code Splitting)
* **Mapping:** Leaflet & OpenStreetMap (Peta batas desa & direktori spasial)
* **Iconography:** [Lucide Icons](https://lucide.dev/)
* **Architecture:** *Feature-Driven Architecture* (`features/auth`, `features/surat`, `features/dashboard`, `features/smart-city`, `features/keuangan`, `shared/`)

### Backend Ecosystem
* **Core Framework:** [Laravel 12/13](https://laravel.com/) (RESTful API)
* **Runtime:** PHP 8.4+
* **Authentication:** [Laravel Sanctum](https://laravel.com/docs/sanctum) (Secure Bearer Token Authentication)
* **Database:** MySQL 8.x / MariaDB
* **Digital Signature & QR:** SVG QR Code Generator dengan hashing kriptografis SHA-256
* **Architecture:** Modular Role-Based RESTful Controllers (`Api/Admin`, `Api/Warga`, `Api/Rt`, `Api/Rw`, `Api/Sekdes`, `Api/Bendahara`, `Api/Regional`, `Api/Public`)

---

## 📂 Struktur Direktori

```text
Nexora/
├── backend/                       # RESTful API Backend (Laravel)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/   # Controller terbagi rapi berdasarkan Role
│   │   │   │   ├── Admin/         # Manajemen User, Warga & Pengaturan Kop Surat
│   │   │   │   ├── Auth/          # Login, Register & Profil Pengguna
│   │   │   │   ├── Bendahara/     # Realisasi & Kategori APBDes
│   │   │   │   ├── Public/        # Tracking Resi, Berita, Verifikasi QR Code
│   │   │   │   ├── Regional/      # Agregat Statistik Kecamatan & Kabupaten
│   │   │   │   ├── Rt/            # Verifikasi Surat RT, Kas RT, Pengaduan
│   │   │   │   ├── Rw/            # Verifikasi Pengantar RW
│   │   │   │   ├── Sekdes/        # Legalisasi Surat, QR TTD, Program Bansos
│   │   │   │   ├── SmartCity/     # UMKM, Loker Lokal, Kos & Hunian
│   │   │   │   └── Warga/         # Pengajuan Surat Mandiri & Pengaduan
│   │   │   └── Middleware/        # RBAC & Sanctum Route Guards
│   │   └── Models/                # Eloquent Models (Surat, User, APBDes, dll.)
│   ├── database/
│   │   ├── migrations/            # Skema Database Terstruktur
│   │   └── seeders/               # Data Awal Lengkap (Role, Desa, Akun Demo)
│   └── routes/
│       └── api.php                # Definisi Endpoint REST API
│
├── frontend/                      # Single Page Application (React 19 + TypeScript)
│   ├── src/
│   │   ├── assets/                # Aset Gambar, Logo & Ilustrasi
│   │   ├── features/              # Feature-Driven Modules:
│   │   │   ├── auth/              # Login & Register Forms
│   │   │   ├── bansos/            # Tampilan Program Bantuan Sosial
│   │   │   ├── dashboard/         # Dashboard Layout & Panel Khusus Per Role
│   │   │   ├── desa-setting/      # Pengaturan Kop Surat & Info Pemdes
│   │   │   ├── keuangan/          # Modul APBDes & Buku Kas RT
│   │   │   ├── landing/           # Halaman Publik, Tracking & Verifikasi
│   │   │   ├── pengaduan/         # Form Aspirasi & Respon Keluhan
│   │   │   ├── smart-city/        # Modul UMKM, Bursa Kerja & Direktori Kos
│   │   │   ├── surat/             # Form Pengajuan Surat & Detail Pelacakan
│   │   │   └── warga/             # Manajemen Penduduk & Kartu Keluarga
│   │   ├── shared/                # Shared Components, Context & Utilities
│   │   ├── App.tsx                # Konfigurasi Rute Aplikasi
│   │   └── main.tsx               # Entry Point
│   └── package.json
└── README.md                      # Dokumentasi Utama Repository
```

---

## ⚡ Panduan Instalasi & Menjalankan

### 1. Prasyarat Sistem
Pastikan perangkat Anda telah terpasang:
* **PHP** $\ge$ 8.2 (disarankan PHP 8.4)
* **Composer** $\ge$ 2.x
* **Node.js** $\ge$ 18.x & **npm**
* **MySQL** $\ge$ 8.0 atau **MariaDB** $\ge$ 10.4

---

### 2. Konfigurasi Backend (Laravel)

```bash
# 1. Masuk ke direktori backend
cd backend

# 2. Salin file konfigurasi environment
cp .env.example .env

# 3. Install dependensi PHP via Composer
composer install

# 4. Generate Application Encryption Key
php artisan key:generate

# 5. Buat symlink public storage untuk berkas & lampiran
php artisan storage:link

# 6. Konfigurasi Database di file .env:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=mycity
# DB_USERNAME=root
# DB_PASSWORD=

# 7. Jalankan migrasi tabel dan seeding data lengkap
php artisan migrate:fresh --seed

# 8. Jalankan server lokal Laravel
php artisan serve
```
> Server backend berjalan di: `http://localhost:8000`

---

### 3. Konfigurasi Frontend (React + Vite)

```bash
# 1. Buka terminal baru dan masuk ke direktori frontend
cd frontend

# 2. Install dependensi Node.js
npm install

# 3. Jalankan server pengembangan Vite
npm run dev
```
> Antarmuka web frontend dapat diakses di browser: `http://localhost:5173`

---

## 🔑 Akun Demo Pengujian

Setelah menjalankan `php artisan migrate:fresh --seed`, seluruh akun berikut dapat langsung digunakan untuk pengujian:

> **Kata Sandi (Password) untuk SEMUA akun di bawah ini adalah:** `password123`

| No | Peran (Role) | Username | Email | Kegunaan Pengujian |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **Kabupaten / Kota** | `kabupaten01` | `admin.kediri@nexora.local` | **Monitoring agregat tingkat Kabupaten/Kota, evaluasi pelayanan seluruh desa.** |
| 2 | **Kecamatan** | `kecamatan01` | `kecamatan.ngasem@nexora.local` | **Monitoring agregat tingkat Kecamatan atas desa-desa binaan.** |
| 3 | **Super Admin** | `superadmin` | `superadmin@sidesku.desa.id` | **Multi-tenant platform administrator lintas desa dan wilayah.** |
| 4 | **Administrator Desa** | `admin` | `admin@sidesku.desa.id` | **Konfigurasi master data desa, template kop surat dinas, dan akun pengguna.** |
| 5 | **Kepala Desa (Kades)** | `kades` | `kades@sidesku.desa.id` | **Legalisasi & TTD QR Resmi permohonan surat warga, penetapan kebijakan & pengumuman.** |
| 6 | **Sekretaris Desa (Sekdes)**| `sekdes` | `sekdes@sidesku.desa.id` | **Tata laksana administrasi, register KK/warga, arsip surat sah, loket mandiri, dan Bansos.** |
| 7 | **Bendahara Desa** | `bendahara_desa` | `bendahara.desa@sidesku.desa.id` | **Input realisasi pos APBDes dan laporan keuangan transparan.** |
| 8 | **Ketua RW 01** | `rw01` | `rw01@sidesku.desa.id` | **Monitoring demografi & koordinasi lingkungan tingkat Rukun Warga.** |
| 9 | **Ketua RT 01** | `rt01` | `rt01@sidesku.desa.id` | **Persetujuan awal surat pengantar (pending_rt $\rightarrow$ pending_kades) & kelola Kas RT 01.** |
| 10 | **Warga 1 (Pemohon)** | `warga01` | `warga01@sidesku.desa.id` | **Bambang Utomo: Pengajuan surat SKTM/SKU, cek resi, direktori Smart City, dan unduh PDF surat.** |
| 11 | **Warga 2** | `warga02` | `warga02@sidesku.desa.id` | **Siti Rahmawati: Pengajuan surat domisili, direktori UMKM & kirim aspirasi pengaduan.** |

---

## 📡 Referensi Endpoint API

Berikut adalah beberapa endpoint representatif dari sistem Nexora:

### 🌐 Publik (Tanpa Autentikasi)
| Metode | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/public/home` | Statistik ringkas demografi desa & banner publik |
| `GET` | `/api/public/surat/track?resi={resi}` | Lacak status pengajuan surat berdasarkan nomor resi |
| `GET` | `/api/public/surat/verify-qr/{hash}` | Verifikasi keaslian dokumen & keabsahan tanda tangan QR |
| `GET` | `/api/public/apbdes/summary` | Ringkasan grafik transparansi keuangan APBDes |
| `GET` | `/api/smart-city/umkm` | Katalog produk UMKM desa |
| `GET` | `/api/smart-city/kos` | Direktori kos dan hunian sewa desa |
| `GET` | `/api/smart-city/loker` | Bursa lowongan pekerjaan desa terverifikasi |
| `POST` | `/api/auth/login` | Otentikasi pengguna & penerbitan token Sanctum |

### 🔒 Terproteksi (Bearer Token Sanctum)
| Metode | Endpoint | Role Diizinkan | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/surats` | Warga, RT, RW, Sekdes | Daftar permohonan surat sesuai cakupan hak akses |
| `POST` | `/api/surats` | Warga | Mengajukan permohonan surat baru mandiri |
| `POST` | `/api/surats/{id}/approve-rt` | RT | Persetujuan surat pengantar tingkat RT (pending_rt $\rightarrow$ pending_kades) |
| `POST` | `/api/kades/surat/{id}/approve` | Kades | Penerbitan nomor surat resmi & legalisasi QR Code tanda tangan Kepala Desa |
| `POST` | `/api/kades/surat/{id}/reject` | Kades | Penolakan permohonan surat disertai catatan revisi dinas |
| `GET` | `/api/regional/overview` | Kecamatan, Kabupaten | Ringkasan metrik analitik regional lintas desa |
| `POST` | `/api/webpush/subscribe` | All Roles | Pendaftaran token VAPID Web Push perangkat untuk notifikasi real-time |
| `GET` | `/api/kas-rt` | Pengurus RT | Laporan arus kas iuran warga RT |
| `POST` | `/api/bansos/{id}/publish-broadcast`| Sekdes | Publikasi program bansos & broadcast pengumuman |
| `POST` | `/api/apbdes/records` | Bendahara | Mencatat pos realisasi anggaran desa |

---

## 🤝 Kontribusi

Kontribusi dari sesama pengembang sangat diapresiasi! Untuk berkontribusi:
1. *Fork* repositori ini
2. Buat branch fitur baru (`git checkout -b feature/NamaFiturKeren`)
3. Lakukan commit perubahan Anda (`git commit -m 'feat: menambahkan modul notifikasi telegram'`)
4. *Push* ke branch Anda (`git push origin feature/NamaFiturKeren`)
5. Ajukan *Pull Request* baru

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **[MIT License](LICENSE)**. Bebas digunakan, dikembangkan, dan diimplementasikan untuk kemajuan digitalisasi desa dan tata kelola pemerintahan cerdas di seluruh Indonesia.

<div align="center">
  <br/>
  <!-- Animated Footer Wave -->
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:10b981,50:064e3b,100:0d1117&height=120&section=footer" width="100%"/>
</div>
