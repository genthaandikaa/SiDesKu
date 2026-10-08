---
trigger: always_on
description: SOP and Development Guidelines for SiDesKu (Sistem Informasi Desa Doko)
---

# SiDesKu Development & Prompt Guidelines

## 1. Aturan Alur Persetujuan Surat (Direct RT -> Desa)
- Alur persetujuan surat resmi desa adalah **langsung dari RT ke Kantor Desa (Bypass RW)**:
  `Pengajuan (Warga: pending_rt) ➔ ACC Ketua RT (processed_sekdes) ➔ Legalisasi & TTD QR Balai Desa (Sekdes / Kades) ➔ Selesai & Sah (completed)`
- Jangan menambahkan tahapan perantara RW pada alur baru.
- Dokumen sah ditandai dengan stempel QR Code resmi dan nomor surat otomatis terbit.

## 2. Acuan SOP Dokumen Wajib
- Baca `CLAUDE.md` di root, `frontend/CLAUDE.md`, dan `backend/CLAUDE.md` untuk standar arsitektur lengkap.
- Gunakan template prompt siap pakai di `PROMPT_GUIDE.md` untuk prompting tugas baru ke AI agent.

## 3. Frontend Standards
- Stack: React + TypeScript + Vite + Tailwind CSS.
- Desain bersih (Anti-Slop): kontras tinggi, micro-interaction responsif, adaptif mobile & desktop.
- Komponen dideklarasikan di luar fungsi render (patuh ESLint `react-hooks/static-components`).
- Hindari synchronous `setState` di dalam `useEffect` (patuh `react-hooks/set-state-in-effect`).
- Jalankan `npm run build` di folder `frontend` untuk memverifikasi nol error sebelum commit.

## 4. Backend Standards
- Stack: Laravel API + MySQL + Sanctum.
- Endpoint terstruktur berdasarkan role (`/api/warga/*`, `/api/rt/*`, `/api/sekdes/*`, `/api/public/*`).
- Validasi data menggunakan FormRequest / Request validation terstruktur dengan pesan bahasa Indonesia.
- Response API standar JSON: `{ "success": true/false, "message": "...", "data": ... }`.

## 5. Knowledge Graph (graphify)
- File knowledge graph berada di `graphify-out/`.
- Setelah melakukan modifikasi kode, jalankan perintah `graphify update .` untuk menjaga sinkronisasi graph secara otomatis.
