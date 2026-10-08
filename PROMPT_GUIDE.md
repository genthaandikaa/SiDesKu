# Panduan Prompt SiDesKu

> File ini berisi template prompt siap pakai untuk diketik ke Antigravity (AI agent).
> Copy-paste, sesuaikan bagian `[...]`, kirim.

---

## 1. Buat Fitur Baru - Frontend

```
buat [nama fitur] di [nama file / folder fitur].
Kebutuhan:
- [detail 1]
- [detail 2]
Role yang terlibat: [warga / rt / sekdes / dst.]
Ikuti pola komponen yang sudah ada di [nama komponen referensi].
```

**Contoh:**
```
buat halaman daftar pengaduan untuk warga di features/pengaduan/.
Kebutuhan:
- tampilkan list pengaduan milik user yang login
- ada badge status (pending, proses, selesai)
- bisa klik untuk lihat detail
Role yang terlibat: warga
Ikuti pola fetch dan tampilan dari WargaDashboard.tsx
```

---

## 2. Buat Fitur Baru - Backend

```
buat [nama fitur] di [nama controller].
Endpoint: [METHOD] /api/[path]
Role yang boleh akses: [role]
Ikuti SOP backend CLAUDE.md: FormRequest, Service, Repository, ResponseHelper, ApiResource.
```

**Contoh:**
```
buat CRUD kategori berita di AdminBeritaController.php.
Endpoint: GET/POST/PUT/DELETE /api/admin/beritas
Role yang boleh akses: admin, sekdes
Ikuti SOP backend CLAUDE.md: FormRequest, Service, Repository, ResponseHelper, ApiResource.
```

---

## 3. Perbaiki UI / Layout

```
perbaiki tampilan [nama halaman / komponen].
Masalah: [jelaskan masalah visual atau layout]
Referensi desain: [nama komponen lain yang sudah bagus sebagai acuan]
Cek juga di mobile 375px.
```

**Contoh:**
```
perbaiki tampilan halaman BeritaPage.tsx.
Masalah: card berita terlalu rapat, tidak ada empty state, tombol tidak ada hover effect.
Referensi desain: LayananSuratPage.tsx sudah bagus, ikuti pola layoutnya.
Cek juga di mobile 375px.
```

---

## 4. Fix Bug - Frontend

```
[nama file] -- [gejala bug yang terlihat].
Langkah reproduksi:
1. [langkah 1]
2. [langkah 2]
Harapan: [seharusnya terjadi apa]
```

**Contoh:**
```
LoginPage.tsx -- setelah klik tombol login, halaman blank/putih dan tidak redirect.
Langkah reproduksi:
1. Buka http://localhost:5173/login
2. Isi email dan password yang benar
3. Klik tombol Login
Harapan: redirect ke /dashboard sesuai role
```

---

## 5. Fix Bug - Backend

```
[nama controller] / [nama endpoint] -- [gejala bug].
Langkah reproduksi:
1. [langkah 1]
2. [langkah 2]
Harapan: [seharusnya terjadi apa]
Ikuti SOP backend CLAUDE.md setelah fix.
```

**Contoh:**
```
RtSuratController.php / POST /api/surats/{id}/approve-rt -- setelah RT approve,
status surat langsung jadi processed_sekdes padahal harusnya approved_rt dulu.
Langkah reproduksi:
1. Login sebagai RT
2. POST /api/surats/1/approve-rt dengan Bearer token RT
3. Cek status surat -- langsung processed_sekdes
Harapan: status berubah ke approved_rt, bukan loncat ke processed_sekdes
Ikuti SOP backend CLAUDE.md setelah fix.
```

---

## 6. Jalankan Testing Playwright

```
jalankan playwright test untuk [halaman / fitur / semua halaman].
Tunjukkan hasilnya dan screenshot jika ada bug visual.
```

**Variasi:**
```
# Test semua halaman publik
jalankan npm run test:ui dan tunjukkan hasilnya

# Test dengan browser terlihat (untuk debug)
jalankan npm run test:ui:headed

# Test keamanan
jalankan npm run test:security dan laporan hasilnya

# Test mobile
jalankan npm run test:ui:mobile dan cek yang overflow
```

---

## 7. Tanya Arsitektur / Alur Sistem

```
bagaimana alur [proses] bekerja dari [titik awal] sampai [titik akhir]?
```

```
komponen / file apa saja yang terhubung dengan [nama komponen]?
```

```
di mana [nama fungsi / logika] diimplementasikan di codebase ini?
```

**Contoh:**
```
bagaimana alur approval surat bekerja dari warga submit sampai sekdes legalisasi?

komponen apa saja yang terhubung dengan AuthContext?

di mana logika generate nomor resi surat diimplementasikan?
```

---

## 8. Update Knowledge Graph Graphify

```
update graphify setelah perubahan tadi
```

> Jalankan setelah membuat atau mengubah file PHP / TypeScript.

---

## 9. Tambah Halaman / Route Baru

```
tambah halaman [nama halaman] dengan route [/path].
Halaman ini untuk role: [role]
Konten: [deskripsi konten]
Daftarkan di App.tsx dan tambahkan link di [navbar / sidebar].
```

**Contoh:**
```
tambah halaman pengumuman desa dengan route /pengumuman.
Halaman ini untuk: publik (semua orang bisa akses)
Konten: list pengumuman dari API GET /api/public/pengumumans, tampilkan judul, tanggal, isi ringkas.
Daftarkan di App.tsx dan tambahkan link di PublicNavbar.tsx.
```

---

## 10. Perbaiki / Tandai Status Fitur di PRD

```
tandai fitur [nama fitur] di PRD sebagai [Done / In Progress / Pending]
```

> Buka PRD_SiDesKu.html di browser, klik badge status di setiap fitur untuk ganti statusnya.
> Status tersimpan otomatis di localStorage browser.

---

## 11. Refactor Kode

```
refactor [nama file] supaya sesuai SOP [frontend / backend] CLAUDE.md.
Fokus pada: [FormRequest / Service Layer / Repository / loading state / error state / dst.]
Jangan ubah fungsionalitas, hanya struktur kode.
```

**Contoh:**
```
refactor RtSuratController.php supaya sesuai SOP backend CLAUDE.md.
Fokus pada: pisahkan business logic ke SuratService, query ke SuratRepository,
bungkus semua method dengan try-catch, gunakan ResponseHelper.
Jangan ubah fungsionalitas endpoint yang sudah ada.
```

---

## 12. Tambah Middleware / Keamanan

```
tambahkan role check middleware untuk endpoint [path].
Hanya role [role1, role2] yang boleh akses.
Ikuti SOP backend CLAUDE.md.
```

**Contoh:**
```
tambahkan role check middleware untuk semua endpoint /api/surats/{id}/approve-*.
Hanya role rt dan sekretaris_rt yang boleh akses approve-rt.
Hanya role rw yang boleh akses approve-rw.
Ikuti SOP backend CLAUDE.md.
```

---

## Tips Umum

| Tips | Kenapa |
|---|---|
| Sebut nama file yang spesifik | Supaya tidak salah edit file |
| Sebut role yang terlibat | RBAC ini kompleks, 9 role berbeda |
| Tunjukkan screenshot untuk bug UI | Lebih cepat dari deskripsi teks |
| Minta "ikuti SOP CLAUDE.md" | Pastikan standar kode terjaga |
| Satu prompt = satu topik | Jangan campur frontend + backend + testing sekaligus |
| Sebut "jangan ubah X" jika ada | Mencegah perubahan yang tidak diinginkan |

---

*Last updated: September 2026*
