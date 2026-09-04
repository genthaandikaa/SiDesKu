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

`
admin, kades, sekdes, bendahara_desa, rw, rt, sekretaris_rt, bendahara_rt, warga
`

### Aturan Universal (Berlaku di Frontend maupun Backend)

- **JANGAN MEMBUAT CODE ATAUPUN KOMEN SEMACAM AI BUAT SELAYAKNYA CODINGAN MANUSIA**
- **KETIKA ADA LOGO APPROVED JANGAN IKUT DI SLICING KARENA ITU HANYA TANDA BAHWA DESIGN SUDAH DISETUJUI**
- **Tanya dulu, jangan asumsikan** - jika ada yang tidak jelas, tanya user terlebih dahulu

---

*Last updated: September 2026*
