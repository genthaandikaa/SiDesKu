# Nexora

> **Sistem Informasi Desa & Digitalisasi Layanan Publik Terpadu**  
> Platform *Smart Village* modern untuk pelayanan administrasi persuratan, transparansi anggaran desa, pemberdayaan ekonomi lokal (Smart City), dan pemantauan berjenjang dari tingkat RT/RW, Desa, hingga Kecamatan & Kabupaten/Kota.

---

## ⚡ Quick Installations

### 1. Prasyarat Sistem
* **PHP** $\ge$ 8.2 (disarankan PHP 8.4)
* **Composer** $\ge$ 2.x
* **Node.js** $\ge$ 18.x & **npm**
* **MySQL** $\ge$ 8.0 atau **MariaDB** $\ge$ 10.4

---

### 2. Backend Setup (Laravel)

Buka terminal di root project:

```bash
# Masuk ke folder backend
cd backend

# Salin environment file
cp .env.example .env

# Install dependensi PHP
composer install

# Generate application key
php artisan key:generate

# Hubungkan public storage untuk file lampiran & QR
php artisan storage:link
```

Sesuaikan konfigurasi database di file `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mycity
DB_USERNAME=root
DB_PASSWORD=
```

Jalankan migrasi database dan pengisian data demo:
```bash
php artisan migrate:fresh --seed
```

Jalankan server backend:
```bash
php artisan serve
```
> Server backend berjalan di: `http://127.0.0.1:8000`

---

### 3. Frontend Setup (React + Vite)

Buka terminal baru di root project:

```bash
# Masuk ke folder frontend
cd frontend

# Install dependensi frontend
npm install

# Jalankan server frontend
npm run dev
```
> Antarmuka web frontend dapat diakses di: `http://localhost:5173`

---

## 🔑 Informasi Akses & Kredensial Login

Setelah menjalankan `php artisan migrate:fresh --seed`, Anda dapat langsung masuk menggunakan akun pengujian di bawah ini:

> **Password untuk SEMUA Akun:** **`password123`**  
> *(Warga juga dapat masuk menggunakan NIK dan tanggal lahir)*

| No | Tingkatan / Role | Username | Email | Hak Akses Utama |
|:---:|:---|:---|:---|:---|
| 1 | **Kabupaten / Kota** | **`kabupaten01`** | `admin.kediri@nexora.local` | Pemantauan agregat regional tingkat Kota/Kabupaten |
| 2 | **Kecamatan** | **`kecamatan01`** | `kecamatan.ngasem@nexora.local` | Pemantauan agregat pelayanan seluruh desa di kecamatan |
| 3 | **Super Admin** | **`superadmin`** | `superadmin@sidesku.desa.id` | Pengelola multi-tenant platform lintas desa |
| 4 | **Admin Desa** | **`admin`** | `admin@sidesku.desa.id` | Master data kependudukan, template dinas & user |
| 5 | **Kepala Desa (Kades)** | **`kades`** | `kades@sidesku.desa.id` | Approval akhir & penerbitan legalitas QR Code dinas |
| 6 | **Sekretaris Desa (Sekdes)**| **`sekdes`** | `sekdes@sidesku.desa.id` | Verifikasi administrasi persuratan & bansos |
| 7 | **Bendahara Desa** | **`bendahara_desa`** | `bendahara.desa@sidesku.desa.id` | Laporan transparansi APBDes & keuangan desa |
| 8 | **Ketua RW** | **`rw01`** | `rw01@sidesku.desa.id` | Koordinasi lingkungan & verifikasi tingkat RW |
| 9 | **Ketua RT** | **`rt01`** | `rt01@sidesku.desa.id` | Pengantar surat warga & kelola Buku Kas RT 01 |
| 10 | **Warga 1 (Bambang Utomo)** | **`warga01`** | `warga01@sidesku.desa.id` | Pengajuan surat online mandiri, lacak resi & Smart City |
| 11 | **Warga 2 (Siti Rahmawati)**| **`warga02`** | `warga02@sidesku.desa.id` | Pengajuan surat domisili & aspirasi warga |

---

## 🌐 Live Demo Deployment

* **Website Utama (Nexora):** [https://kotaku.gentha.my.id/](https://kotaku.gentha.my.id/)
* **Platform Pendukung:** [https://scholarly.gentha.my.id/](https://scholarly.gentha.my.id/)
