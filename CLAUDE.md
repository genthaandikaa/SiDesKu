# SiDesKu - Sistem Informasi Desa Doko

SOP pengembangan project SiDesKu telah **dipecah** menjadi dua dokumen terpisah
sesuai domain masing-masing:

---

## Baca SOP yang Sesuai Domain Pekerjaan Kamu

### Frontend (React + Vite + TypeScript + Tailwind)

`
frontend/CLAUDE.md
`

Berisi:
- Stack & teknologi frontend (Vite, React 19, Tailwind v4, TanStack Query, dll.)
- Arsitektur folder dan aturan import
- Workflow wajib 7 tahap
- Aturan styling dengan index.css
- Aturan fetching data dan komponen
- Anti-Slop Design Taste (taste-skill) - DESIGN_VARIANCE:5, MOTION_INTENSITY:4, VISUAL_DENSITY:5
- Panduan testing step-by-step
- Instruksi khusus untuk AI agent
- Checklist dan aturan kualitas kode

### Backend (Laravel 13 + PHP 8.3 + Sanctum + MySQL)

`
backend/CLAUDE.md
`

Berisi:
- Stack & teknologi backend
- Arsitektur folder dan status implementasi saat ini
- Rule 1: FormRequest Validation
- Rule 2: PHPDoc pada setiap method
- Rule 3: Try-Catch wajib
- Rule 4: ResponseHelper
- Rule 5: API Resource
- Rule 6: Service Layer
- Rule 7: Repository Pattern
- Diagram flow request yang benar
- Instruksi khusus untuk AI agent

---

## Info Umum Project

| Info | Detail |
|---|---|
| Nama Project | SiDesKu (Sistem Informasi Desa Doko) |
| Frontend | Port 5173 (Vite + React SPA) |
| Backend | Port 8000 (Laravel API) |
| Database | MySQL - sidesku (root, no password) |
| Auth | Laravel Sanctum (Bearer token) |
| Password default seed | password123 |

### Roles yang Ada

```
admin, kades, sekdes, bendahara_desa, rw, rt, sekretaris_rt, bendahara_rt, warga
```

### Aturan Universal (Berlaku di Frontend maupun Backend)

- **JANGAN MEMBUAT CODE ATAUPUN KOMEN SEMACAM AI BUAT SELAYAKNYA CODINGAN MANUSIA**
- **KETIKA ADA LOGO APPROVED JANGAN IKUT DI SLICING KARENA ITU HANYA TANDA BAHWA DESIGN SUDAH DISETUJUI**
- **Tanya dulu, jangan asumsikan** - jika ada yang tidak jelas, tanya user terlebih dahulu

---

## Graphify Knowledge Graph

Graph sudah dibangun di `e:\fd\lomba\graphify-out\` — **625 node, 1201 edge, 56 komunitas**.

### Aturan Wajib: Sebelum Baca File Raw, Query Graphify Dulu

```powershell
# Cari tahu tentang suatu konsep atau komponen
graphify query "surat approval flow"

# Lacak hubungan antara dua komponen
graphify path "RtSuratController" "RwSuratController"

# Detail satu node spesifik
graphify explain "SuratRequest"

# Update graph setelah ubah kode PHP/TypeScript
graphify update .
```

> Semua perintah dijalankan dari `e:\fd\lomba` (root project).
> Jika `graphify` tidak dikenal di PATH, gunakan: `& "C:\Users\genn\.local\bin\graphify.exe"`

### File Graph

| File | Keterangan |
|---|---|
| `graphify-out/graph.json` | Graph JSON mentah (625 node) |
| `graphify-out/GRAPH_REPORT.md` | Laporan arsitektur lengkap |
| `graphify-out/graph.html` | Visualisasi interaktif (buka di browser) |

### Kapan Harus Update Graph

Jalankan `graphify update .` setelah:
- Membuat file PHP atau TypeScript baru
- Mengubah struktur folder
- Menambah/menghapus model, controller, atau komponen

---

## Playwright E2E Testing

Test dikonfigurasi di `e:\fd\lomba\frontend\playwright.config.ts`.
Browser: **Google Chrome lokal** (tidak perlu download Chromium).

### Perintah Testing

```powershell
# Jalankan dari folder: e:\fd\lomba\frontend

# Test semua (headless)
npx playwright test

# Test UI/layout seluruh halaman publik
npm run test:ui

# Test UI dengan browser terlihat (debug mode)
npm run test:ui:headed

# Test keamanan (XSS, sanitasi)
npm run test:security

# Test mobile viewport
npm run test:ui:mobile
```

### File Test yang Ada

| File | Isi |
|---|---|
| `e2e/frontend-ui-audit.spec.ts` | Crawl 9 halaman publik, cek console error, overflow, screenshot |
| `e2e/security-audit.spec.ts` | XSS sanitasi, injection test |
| `e2e/prd-tracker.spec.ts` | PRD interactive tracker, localStorage persistence |

### Output Test

- Screenshot: `e:\fd\lomba\frontend\e2e\screenshots\`
- Report HTML: `e:\fd\lomba\frontend\playwright-report\`

### Kapan Harus Jalankan Test

- Setelah setiap perubahan frontend (UI, komponen, layout)
- Setelah fix bug
- Setelah tambah halaman baru
- Wajib lulus sebelum commit ke branch utama

---

## Bug Backend Kritis (Belum Diperbaiki)

| # | Lokasi | Bug | Fix yang Dibutuhkan |
|---|---|---|---|
| 1 | `RtSuratController::approveRt()` | Status langsung ke `processed_sekdes`, melewati RW | Ganti ke `approved_rt` |
| 2 | `routes/api.php` | Tidak ada role-check middleware, hanya `auth:sanctum` | Buat `CheckRole` middleware |
| 3 | Semua list endpoint | Pakai `->get()` tanpa paginasi, berat di production | Ganti ke `->paginate(15)` |

---

*Last updated: September 2026*
