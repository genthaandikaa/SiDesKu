# Graph Report - lomba  (2026-10-08)

## Corpus Check
- 189 files · ~1,021,511 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1490 nodes · 2182 edges · 134 communities (114 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f2309a4a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Controller
- Illuminate\Database\Migrations\Migration
- Illuminate\Database\Eloquent\Factories\HasFactory
- Illuminate\Http\JsonResponse
- SekdesDashboard.tsx
- DesaSetting
- lucide-react
- DashboardLayout.tsx
- types/index.ts
- compilerOptions
- frontend/package.json
- compilerOptions
- Illuminate\Http\Request
- backend/package.json
- MetricStatCard.tsx
- dependencies
- scripts
- WargaDashboard.tsx
- BeritaPage.tsx
- devDependencies
- brandkit/SKILL.md
- composer.json
- scripts
- require-dev
- config
- @playwright/test
- Illuminate\Database\Eloquent\Relations\BelongsTo
- AppServiceProvider
- require
- CORE DIRECTIVE: IMAGE-FIRST WEBSITE DESIGN TO CODE
- TestCase
- .oxlintrc.json
- CORE DIRECTIVE: PREMIUM MOBILE APP IMAGE DIRECTION
- High-Agency Frontend Skill
- bootstrap/app.php
- psr-4
- logging.php
- sanctum.php
- ApbdesRecord
- AuthContext.tsx
- ExampleTest
- autoload-dev
- extra
- console.php
- User
- SuratType
- tsconfig.json
- README.md
- Appendix B - Canonical Sources (read these before reinventing)
- Design Audit
- Analysis & Synthesis Instructions
- Agent Skill: Principal UI/UX Architect & Motion Choreographer (Awwwards-Tier)
- CORE DIRECTIVE: AWWWARDS-LEVEL IMAGE ART DIRECTION
- SKILL: Industrial Brutalism & Tactical Telemetry UI
- DatabaseSeeder.php
- 📋 SiDesKu — Product Requirements Document (PRD)
- 7. Gap Analysis & Kekurangan Backend
- Design System: Taste Standard
- 2. THE COMBINATORIAL VARIATION ENGINE
- 3. Skema Database Lengkap
- PROMPT_GUIDE.md
- BansosController
- 4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)
- 10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know)
- tasteskill: Anti-Slop Frontend Skill
- CORE DIRECTIVE: AWWWARDS-LEVEL DESIGN ENGINEERING
- 22. STYLE VARIATION ENGINE
- Protocol: Premium Utilitarian Minimalism UI Architect
- 6.2 Protected Routes (auth:sanctum)
- 11. COMPONENT EXECUTION GUIDELINES
- 18. EXTRA CREATIVITY & IMPLEMENTATION EDGE
- 8. Spesifikasi Fitur Lengkap
- 9. Spesifikasi UI/UX per Role
- backend/README.md
- 9. AI TELLS (Forbidden Patterns)
- 12. THE COMBINATORIAL VARIATION ENGINE
- 8. ANTI-AI-SLOP RULES
- 11. REDESIGN PROTOCOL
- 3. DEFAULT ARCHITECTURE & CONVENTIONS
- 6. PERFORMANCE & ACCESSIBILITY GUARDRAILS
- Full-Output Enforcement
- 33. CATEGORY-SPECIFIC BIAS
- 13. COLOR & MATERIAL RULES
- 4. HERO MINIMALISM RULES
- 29. ANTI-AI-SLOP RULES
- 5. IMAGE COUNT & PAGE SLICING
- WargaSuratController
- 0. BRIEF INFERENCE (Read the Room Before Anything Else)
- 12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)
- 5. CONTEXT-AWARE PROACTIVITY
- 8. DARK MODE PROTOCOL
- 21. MOBILE ANTI-AI-TELLS RULE
- 10. Roadmap Pengembangan Lanjutan
- CheckRole.php
- 7. DIAL DEFINITIONS (Technical Reference)
- 33. DEFAULT SECTION PACKS
- 14. HERO MINIMALISM RULES
- 37. EXAMPLE INTERPRETATIONS
- 2. PLATFORM MODE RULE
- 37. EXAMPLE INTERPRETATIONS
- 15. DEFAULT SITE PACKS
- 20. EXAMPLE INTERPRETATIONS
- React + TypeScript + Vite
- rules/graphify.md
- workflows/graphify.md
- RtDashboard.tsx
- axios.ts
- SOP Backend Development - SiDesKu
- @vitejs/plugin-react
- SuratRequest
- UserFactory.php
- react
- SiDesKu - Sistem Informasi Desa Doko
- Illuminate\Database\Eloquent\Relations\HasMany
- SOP Frontend Development - SiDesKu
- 9. Anti-Slop Design Taste (taste-skill)
- SiDesKu Development & Prompt Guidelines
- 14. Aturan Kualitas Kode - Hasil Review
- 14. Instruksi Khusus untuk AI Agent
- 2. Arsitektur Project
- 6. Aturan Fetching Data
- 10. Aturan Kerja Tim
- 4. Aturan Styling - Tailwind + index.css
- 7. Aturan Slicing dari Figma
- 8. Standar Penulisan Kode

## God Nodes (most connected - your core abstractions)
1. `Controller` - 43 edges
2. `react` - 39 edges
3. `CORE DIRECTIVE: IMAGE-FIRST WEBSITE DESIGN TO CODE` - 39 edges
4. `CORE DIRECTIVE: PREMIUM MOBILE APP IMAGE DIRECTION` - 39 edges
5. `SuratRequest` - 35 edges
6. `WargaProfile` - 34 edges
7. `lucide-react` - 32 edges
8. `User` - 23 edges
9. `@playwright/test` - 23 edges
10. `CORE DIRECTIVE: AWWWARDS-LEVEL IMAGE ART DIRECTION` - 22 edges

## Surprising Connections (you probably didn't know these)
- `BansosController` --inherits--> `BansosController`  [EXTRACTED]
  backend/app/Http/Controllers/Api/Admin/BansosController.php → backend/app/Http/Controllers/Api/Sekdes/BansosController.php
- `DesaSettingController` --inherits--> `Controller`  [EXTRACTED]
  backend/app/Http/Controllers/Api/Admin/DesaSettingController.php → backend/app/Http/Controllers/Controller.php
- `WargaController` --inherits--> `Controller`  [EXTRACTED]
  backend/app/Http/Controllers/Api/Admin/WargaController.php → backend/app/Http/Controllers/Controller.php
- `AuthController` --inherits--> `Controller`  [EXTRACTED]
  backend/app/Http/Controllers/Api/Auth/AuthController.php → backend/app/Http/Controllers/Controller.php
- `ApbdesController` --inherits--> `Controller`  [EXTRACTED]
  backend/app/Http/Controllers/Api/Bendahara/ApbdesController.php → backend/app/Http/Controllers/Controller.php

## Import Cycles
- None detected.

## Communities (134 total, 11 thin omitted)

### Community 0 - "Controller"
Cohesion: 0.20
Nodes (6): CalendarController, SuratSettingController, Controller, LetterNumberService, Carbon, Carbon\Carbon

### Community 1 - "Illuminate\Database\Migrations\Migration"
Cohesion: 0.07
Nodes (3): Illuminate\Database\Migrations\Migration, Illuminate\Database\Schema\Blueprint, Illuminate\Support\Facades\Schema

### Community 2 - "Illuminate\Database\Eloquent\Factories\HasFactory"
Cohesion: 0.15
Nodes (8): ActivityLog, Berita, Dusun, KasRtCategory, Role, Rw, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Eloquent\Model

### Community 3 - "Illuminate\Http\JsonResponse"
Cohesion: 0.10
Nodes (9): WargaController, PengumumanController, PublicInfoController, RtWargaController, RwWargaController, WargaManagementController, WargaProfile, Illuminate\Http\JsonResponse (+1 more)

### Community 4 - "SekdesDashboard.tsx"
Cohesion: 0.19
Nodes (9): BansosManager(), KopSuratSetting(), PendaftaranWargaDesa(), WargaItem, CalendarData, PenomoranSuratSetting(), SuratTypeSetting, SekdesDashboard() (+1 more)

### Community 5 - "DesaSetting"
Cohesion: 0.25
Nodes (3): DesaSettingController, DesaSettingController, DesaSetting

### Community 6 - "lucide-react"
Cohesion: 0.16
Nodes (5): PublicFooter(), NavItem, PublicNavbar(), lucide-react, react-router-dom

### Community 7 - "DashboardLayout.tsx"
Cohesion: 0.20
Nodes (10): BendaharaDashboard(), BendaharaDashboardProps, NavGroup, QrVerificationModal(), QrVerificationModalProps, AgendaDesaView(), NotificationItem, NotifikasiView() (+2 more)

### Community 8 - "types/index.ts"
Cohesion: 0.09
Nodes (22): ApbdesCategory, ApbdesRecord, BantuanPenerima, BantuanSosial, Berita, DesaSetting, Dusun, KartuKeluarga (+14 more)

### Community 9 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.10
Nodes (19): tailwindcss, @tailwindcss/vite, vite, name, private, type, version, clsx (+11 more)

### Community 11 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 12 - "Illuminate\Http\Request"
Cohesion: 0.13
Nodes (9): App\Http\Controllers\Api\Admin\AdminDesaSettingController, AuthController, KasRtController, RtPengaduanController, PengaduanController, Illuminate\Http\Request, Illuminate\Support\Facades\Route, Illuminate\Validation\Rule (+1 more)

### Community 13 - "backend/package.json"
Cohesion: 0.09
Nodes (20): devDependencies, concurrently, laravel-vite-plugin, tailwindcss, @tailwindcss/vite, vite, tailwindcss, @tailwindcss/vite (+12 more)

### Community 14 - "MetricStatCard.tsx"
Cohesion: 0.11
Nodes (10): AreaSplineChartProps, ChartDataPoint, BarActivityChartProps, BarDataPoint, colorMap, DonutGauge(), DonutGaugeProps, MetricStatCardProps (+2 more)

### Community 15 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, axios, clsx, jsqr, leaflet, lucide-react, react, react-dom (+7 more)

### Community 16 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, lint, preview, test:e2e, test:e2e:headed, test:security (+3 more)

### Community 17 - "WargaDashboard.tsx"
Cohesion: 0.15
Nodes (10): CetakSuratModal(), CetakSuratModalProps, SuratTrackingModal(), SuratTrackingModalProps, ActionToast, defaultSuratTypes, FormLampiranItem, WargaDashboardProps (+2 more)

### Community 18 - "BeritaPage.tsx"
Cohesion: 0.40
Nodes (3): categoryConfigs, defaultBeritas, sortConfigs

### Community 19 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, oxlint, @playwright/test, @types/node, @types/react, @types/react-dom, typescript, vite (+2 more)

### Community 20 - "brandkit/SKILL.md"
Cohesion: 0.05
Nodes (43): 1. Logo Cover, 1. Monogram + Meaning, 2 × 3 REFERENCE-STYLE LAYOUT, 2. Logo Construction, 2. Product Action, 3. Digital Application, 3. Metaphor Fusion, 4. Brand Essence (+35 more)

### Community 21 - "composer.json"
Cohesion: 0.22
Nodes (8): description, keywords, license, minimum-stability, name, prefer-stable, $schema, type

### Community 22 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, dev, post-autoload-dump, post-create-project-cmd, post-root-package-install, post-update-cmd, pre-package-uninstall, setup (+1 more)

### Community 23 - "require-dev"
Cohesion: 0.25
Nodes (8): require-dev, fakerphp/faker, laravel/pail, laravel/pao, laravel/pint, mockery/mockery, nunomaduro/collision, phpunit/phpunit

### Community 24 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 25 - "@playwright/test"
Cohesion: 0.08
Nodes (4): routesToTest, screenshotsDir, screenshotsDir, @playwright/test

### Community 26 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.11
Nodes (5): BantuanPenerima, KasRtTransaction, NotifikasiLog, PengaduanWarga, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 28 - "require"
Cohesion: 0.33
Nodes (6): require, laravel/framework, laravel/sanctum, laravel/tinker, php, simplesoftwareio/simple-qrcode

### Community 29 - "CORE DIRECTIVE: IMAGE-FIRST WEBSITE DESIGN TO CODE"
Cohesion: 0.06
Nodes (34): 10. IMAGE-FIRST CODEX WEBSITE WORKFLOW, 11. WHEN TO TRIGGER IMAGE GENERATION FIRST, 13. WEBSITE REFERENCE RULE, 15. RESPONSIVE FIRST-VIEW RULE, 16. ANTI-NESTED-BOX RULE, 17. REDUCE MICRO-UI CLUTTER RULE, 18. SECTION IMAGE GENERATION RULE, 19. WEBSITE IMAGE SYSTEM RULE (+26 more)

### Community 30 - "TestCase"
Cohesion: 0.47
Nodes (3): ExampleTest, TestCase, Illuminate\Foundation\Testing\TestCase

### Community 31 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 32 - "CORE DIRECTIVE: PREMIUM MOBILE APP IMAGE DIRECTION"
Cohesion: 0.06
Nodes (34): 10. DEVICE MOCKUP FRAME RULE, 11. ONBOARDING FLOW RULE, 12. FIRST SCREEN CLEANLINESS RULE, 13. SAFE AREA AND SYSTEM REGION RULE, 14. NAVIGATION RULE, 15. CLEAN LAYOUT RULE, 16. CREATIVE IMAGE DIRECTION RULE, 17. BACKGROUND TEXTURE AND SURFACE RULE (+26 more)

### Community 33 - "High-Agency Frontend Skill"
Cohesion: 0.06
Nodes (30): 10. FINAL PRE-FLIGHT CHECK, 1. ACTIVE BASELINE CONFIGURATION, 2. DEFAULT ARCHITECTURE & CONVENTIONS, 3. DESIGN ENGINEERING DIRECTIVES (Bias Correction), 4. CREATIVE PROACTIVITY (Anti-Slop Implementation), 5. PERFORMANCE GUARDRAILS, 6. TECHNICAL REFERENCE (Dial Definitions), 7. AI TELLS (Forbidden Patterns) (+22 more)

### Community 34 - "bootstrap/app.php"
Cohesion: 0.40
Nodes (3): Illuminate\Foundation\Application, Illuminate\Foundation\Configuration\Exceptions, Illuminate\Foundation\Configuration\Middleware

### Community 35 - "psr-4"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 36 - "logging.php"
Cohesion: 0.40
Nodes (4): Monolog\Handler\NullHandler, Monolog\Handler\StreamHandler, Monolog\Handler\SyslogUdpHandler, Monolog\Processor\PsrLogMessageProcessor

### Community 37 - "sanctum.php"
Cohesion: 0.40
Nodes (4): Illuminate\Cookie\Middleware\EncryptCookies, Illuminate\Foundation\Http\Middleware\ValidateCsrfToken, Laravel\Sanctum\Http\Middleware\AuthenticateSession, Laravel\Sanctum\Sanctum

### Community 38 - "ApbdesRecord"
Cohesion: 0.19
Nodes (3): ApbdesController, ApbdesCategory, ApbdesRecord

### Community 41 - "autoload-dev"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 42 - "extra"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

### Community 44 - "User"
Cohesion: 0.23
Nodes (5): User, Illuminate\Database\Eloquent\Relations\HasOne, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable, Laravel\Sanctum\HasApiTokens

### Community 56 - "README.md"
Cohesion: 0.07
Nodes (28): 1. 📄 Layanan Persuratan Digital Multi-Tier (*E-Surat*), 1. Prasyarat Sistem, 2. Konfigurasi Backend (Laravel), 2. 🔐 Verifikasi Keaslian Dokumen QR Code Publik (*Anti-Forgery*), 3. Konfigurasi Frontend (React + Vite), 3. 📦 Tracking Resi Pengajuan Surat Real-Time, 4. 📊 Transparansi Keuangan Desa (APBDes), 5. 🤝 Manajemen Bantuan Sosial (Bansos) Terbuka (+20 more)

### Community 57 - "Appendix B - Canonical Sources (read these before reinventing)"
Cohesion: 0.09
Nodes (21): APPENDICES - Real Source-Backed Reference Material, Appendix A - Install Commands per Design System, Appendix B - Canonical Sources (read these before reinventing), Appendix C - Apple Liquid Glass: Honest Web Approximation, Apple Liquid Glass (Apple platforms only), Atlassian, Bootstrap, Carbon (+13 more)

### Community 58 - "Design Audit"
Cohesion: 0.10
Nodes (19): Code Quality, Color and Surfaces, Component Patterns, Content, Design Audit, Fix Priority, How This Works, Iconography (+11 more)

### Community 59 - "Analysis & Synthesis Instructions"
Cohesion: 0.11
Nodes (18): 1. Define the Atmosphere, 2. Map the Color Palette, 3. Establish Typography Rules, 4. Define the Hero Section, 5. Describe Component Stylings, 6. Define Layout Principles, 7. Define Responsive Rules, 8. Encode Motion Philosophy (+10 more)

### Community 60 - "Agent Skill: Principal UI/UX Architect & Motion Choreographer (Awwwards-Tier)"
Cohesion: 0.11
Nodes (17): 1. Meta Information & Core Directive, 2. THE "ABSOLUTE ZERO" DIRECTIVE (STRICT ANTI-PATTERNS), 3. THE CREATIVE VARIANCE ENGINE, 4. HAPTIC MICRO-AESTHETICS (COMPONENT MASTERY), 5. MOTION CHOREOGRAPHY (FLUID DYNAMICS), 6. PERFORMANCE GUARDRAILS, 7. EXECUTION PROTOCOL, 8. PRE-OUTPUT CHECKLIST (+9 more)

### Community 61 - "CORE DIRECTIVE: AWWWARDS-LEVEL IMAGE ART DIRECTION"
Cohesion: 0.12
Nodes (16): 10. SECTION RHYTHM RULE, 12. DENSITY & SPACING DISCIPLINE, 14. IMAGE / MEDIA DIRECTION, 16. MULTI-IMAGE CONSISTENCY RULE, 17. CLARITY CHECK, 19. RESPONSE BEHAVIOR, 1. ACTIVE BASELINE CONFIGURATION, 21. FINAL GOAL (+8 more)

### Community 62 - "SKILL: Industrial Brutalism & Tactical Telemetry UI"
Cohesion: 0.12
Nodes (16): 1. Skill Meta, 2.1 Swiss Industrial Print, 2.2 Tactical Telemetry & CRT Terminal, 2. Visual Archetypes, 3.1 Macro-Typography (Structural Headers), 3.2 Micro-Typography (Data & Telemetry), 3.3 Textural Contrast (Artistic Disruption), 3. Typographic Architecture (+8 more)

### Community 63 - "DatabaseSeeder.php"
Cohesion: 0.16
Nodes (5): BantuanSosial, Pengumuman, BansosPengumumanSeeder, DatabaseSeeder, Illuminate\Database\Seeder

### Community 64 - "📋 SiDesKu — Product Requirements Document (PRD)"
Cohesion: 0.12
Nodes (15): 1. Ringkasan Eksekutif, 2.1 Kondisi Backend — Yang Sudah Ada ✅, 2.2 Kondisi Frontend — Komponen yang Ada ✅, 2. Analisis Kondisi Saat Ini (As-Is), 4.1 Role Definitions, 4.2 Matriks Akses Lengkap, 4. Matriks Role & Hak Akses, 5. Arsitektur Sistem (+7 more)

### Community 65 - "7. Gap Analysis & Kekurangan Backend"
Cohesion: 0.12
Nodes (16): 7.10 🟡 Tidak Ada Reset Password via Email/OTP, 7.11 🟡 Generator PDF Surat Belum Diimplementasikan, 7.12 🟡 Notifikasi WhatsApp Hanya Simulasi, 7.13 🟡 Tidak Ada Response Caching & Rate Limiting, 7.14 🟡 Tidak Ada Fitur Dashboard Kepala Desa (Kades), 7.15 🟡 Tidak Ada Export/Laporan, 7.1 🔴 Bug Kritis — Alur Persetujuan Surat, 7.2 🔴 Tidak Ada Middleware RBAC (Role-Based Access Control) (+8 more)

### Community 66 - "Design System: Taste Standard"
Cohesion: 0.13
Nodes (14): 1. Visual Theme & Atmosphere, 2. Color Palette & Roles, 3. Typography Rules, 4. Component Stylings, 5. Hero Section, 6. Layout Principles, 7. Responsive Rules, 8. Motion & Interaction (Code-Phase Intent) (+6 more)

### Community 67 - "2. THE COMBINATORIAL VARIATION ENGINE"
Cohesion: 0.14
Nodes (14): 2. THE COMBINATORIAL VARIATION ENGINE, Background Character, Background Mode (per-section), Composition Anchor (per-section), CTA Variation, Hero Architecture, Hero Scale (per-page), Motion-Implied Language (+6 more)

### Community 68 - "3. Skema Database Lengkap"
Cohesion: 0.14
Nodes (14): 3.10 Tabel Keuangan, 3.11 Tabel Bansos, 3.12 Tabel Komunikasi, 3.1 Tabel `roles`, 3.2 Tabel `users`, 3.3 Tabel `desa_settings`, 3.4 Tabel Wilayah (`dusuns`, `rws`, `rts`), 3.5 Tabel `kartu_keluargas` (+6 more)

### Community 69 - "PROMPT_GUIDE.md"
Cohesion: 0.14
Nodes (13): 10. Perbaiki / Tandai Status Fitur di PRD, 11. Refactor Kode, 12. Tambah Middleware / Keamanan, 1. Buat Fitur Baru - Frontend, 2. Buat Fitur Baru - Backend, 3. Perbaiki UI / Layout, 4. Fix Bug - Frontend, 5. Fix Bug - Backend (+5 more)

### Community 70 - "BansosController"
Cohesion: 0.15
Nodes (4): BansosController, BansosController, Illuminate\Support\Str, Pdo\Mysql

### Community 71 - "4. DESIGN ENGINEERING DIRECTIVES (Bias Correction)"
Cohesion: 0.17
Nodes (12): 4.10 Quotes & Testimonials, 4.11 Page Theme Lock (Light / Dark Mode Consistency), 4.1 Typography, 4.2 Color Calibration, 4.3 Layout Diversification, 4.4 Materiality, Shadows, Cards, 4.5 Interactive UI States, 4.6 Data & Form Patterns (+4 more)

### Community 72 - "10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know)"
Cohesion: 0.20
Nodes (10): 10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know), Animation Library Choice, Cards & Containers, Galleries & Media, Hero Paradigms, Layout & Grids, Micro-Interactions & Effects, Navigation & Menus (+2 more)

### Community 73 - "tasteskill: Anti-Slop Frontend Skill"
Cohesion: 0.20
Nodes (10): 13. OUT OF SCOPE, 14. FINAL PRE-FLIGHT CHECK, 1.A Dial Inference (design read → dial values), 1.B Use-Case Presets, 1.C How the Dials Drive Output, 1. THE THREE DIALS (Core Configuration), 2.A When to reach for a real design system (use official packages), 2.B When the brief is an aesthetic, not a system (+2 more)

### Community 74 - "CORE DIRECTIVE: AWWWARDS-LEVEL DESIGN ENGINEERING"
Cohesion: 0.20
Nodes (9): 1. PYTHON-DRIVEN TRUE RANDOMIZATION (BREAKING THE LOOP), 2. AIDA STRUCTURE & SPACING, 3. HERO ARCHITECTURE & THE 2-LINE IRON RULE, 4. THE GAPLESS BENTO GRID, 5. ADVANCED GSAP MOTION & HOVER PHYSICS, 6. COMPONENT ARSENAL & CREATIVITY, 7. CONTENT, ASSETS & STRICT BANS, 8. MANDATORY PRE-FLIGHT <design_plan> (+1 more)

### Community 75 - "22. STYLE VARIATION ENGINE"
Cohesion: 0.20
Nodes (10): 22. STYLE VARIATION ENGINE, Decorative Asset Set, Image Art Direction Bias, Motion-Implied Language, Palette Logic, Signature Component Set, Structure Bias, Texture / Surface Treatment (+2 more)

### Community 76 - "Protocol: Premium Utilitarian Minimalism UI Architect"
Cohesion: 0.20
Nodes (9): 1. Protocol Overview, 2. Absolute Negative Constraints (Banned Elements), 3. Typographic Architecture, 4. Color Palette (Warm Monochrome + Spot Pastels), 5. Component Specifications, 6. Iconography & Imagery Directives, 7. Subtle Motion & Micro-Animations, 8. Execution Protocol (+1 more)

### Community 77 - "6.2 Protected Routes (auth:sanctum)"
Cohesion: 0.20
Nodes (10): 6.1 Public Routes (No Auth), 6.2 Protected Routes (auth:sanctum), 6. Inventarisasi API Endpoint, Auth & Profile, Bansos, Data Warga & Wilayah, Keuangan & Kas, Pengaduan (+2 more)

### Community 78 - "11. COMPONENT EXECUTION GUIDELINES"
Cohesion: 0.22
Nodes (9): 11. COMPONENT EXECUTION GUIDELINES, 3D Cascading Card Deck, Diagonal Staggered Square Masonry, Hover-Accordion Slice Layout, Off-Grid Editorial Layout, Pristine Gapless Bento Grid, Product UI Panel Stack, Turning Polaroid Arc (+1 more)

### Community 79 - "18. EXTRA CREATIVITY & IMPLEMENTATION EDGE"
Cohesion: 0.22
Nodes (9): 18. EXTRA CREATIVITY & IMPLEMENTATION EDGE, Composition variety check, Conversion focus, Cross-section contrast, CTA specificity, Cultural / tonal alignment, Data-viz restraint, Image variety inside one comp (+1 more)

### Community 80 - "8. Spesifikasi Fitur Lengkap"
Cohesion: 0.22
Nodes (9): 8.1 Modul Autentikasi, 8.2 Modul Layanan Surat (E-Surat), 8.3 Modul Transparansi Keuangan (APBDes), 8.4 Modul Kas RT, 8.5 Modul Bantuan Sosial (Bansos), 8.6 Modul Pengaduan Warga, 8.7 Modul Informasi Publik, 8.8 Modul Admin & Manajemen Sistem (+1 more)

### Community 81 - "9. Spesifikasi UI/UX per Role"
Cohesion: 0.22
Nodes (9): 9.1 Halaman Publik (Tanpa Login), 9.2 Dashboard Layout (Semua Role), 9.3 Dashboard Warga — Menu Items, 9.4 Dashboard RT — Menu Items, 9.5 Dashboard RW — Menu Items, 9.6 Dashboard Sekdes — Menu Items, 9.7 Dashboard Bendahara — Menu Items, 9.8 Dashboard Admin — Menu Items (+1 more)

### Community 82 - "backend/README.md"
Cohesion: 0.25
Nodes (7): About Laravel, Agentic Development, Code of Conduct, Contributing, Learning Laravel, License, Security Vulnerabilities

### Community 83 - "9. AI TELLS (Forbidden Patterns)"
Cohesion: 0.25
Nodes (8): 9.A Visual & CSS, 9. AI TELLS (Forbidden Patterns), 9.B Typography, 9.C Layout & Spacing, 9.D Content & Data ("Jane Doe" Effect), 9.E External Resources & Components, 9.F Production-Test Tells (banned outright), 9.G EM-DASH BAN (the single most-violated Tell)

### Community 84 - "12. THE COMBINATORIAL VARIATION ENGINE"
Cohesion: 0.25
Nodes (8): 12. THE COMBINATORIAL VARIATION ENGINE, Background Character, Hero Architecture, Motion-Implied Language, Section System, Signature Component Set, Theme Paradigm, Typography Character

### Community 85 - "8. ANTI-AI-SLOP RULES"
Cohesion: 0.25
Nodes (8): 8. ANTI-AI-SLOP RULES, Carousel / marquee slop (layout), Content slop, Data / KPI slop, Density slop, Layout slop, Typography slop, Visual slop

### Community 86 - "11. REDESIGN PROTOCOL"
Cohesion: 0.29
Nodes (7): 11.A Detect the Mode (first action), 11.B Audit Before Touching, 11.C Preservation Rules, 11.D Modernisation Levers (priority order), 11.E Decision Tree: Targeted Evolution vs Full Redesign, 11.F What Never Changes Silently, 11. REDESIGN PROTOCOL

### Community 87 - "3. DEFAULT ARCHITECTURE & CONVENTIONS"
Cohesion: 0.29
Nodes (7): 3.A Stack, 3.B State, 3.C Icons, 3.D Emoji Policy, 3. DEFAULT ARCHITECTURE & CONVENTIONS, 3.E Responsiveness & Layout Mechanics, 3.F Dependency Verification (mandatory)

### Community 88 - "6. PERFORMANCE & ACCESSIBILITY GUARDRAILS"
Cohesion: 0.29
Nodes (7): 6.A Hardware Acceleration, 6.B Reduced Motion (mandatory), 6.C Dark Mode (mandatory for any consumer-facing page), 6.D Core Web Vitals Targets, 6.E DOM Cost, 6.F Z-Index Restraint, 6. PERFORMANCE & ACCESSIBILITY GUARDRAILS

### Community 89 - "Full-Output Enforcement"
Cohesion: 0.29
Nodes (6): Banned Output Patterns, Baseline, Execution Process, Full-Output Enforcement, Handling Long Outputs, Quick Check

### Community 90 - "33. CATEGORY-SPECIFIC BIAS"
Cohesion: 0.29
Nodes (7): 33. CATEGORY-SPECIFIC BIAS, Commerce, Fintech, Health / Fitness, Productivity, Social, Wellness / Lifestyle

### Community 91 - "13. COLOR & MATERIAL RULES"
Cohesion: 0.29
Nodes (7): 13. COLOR & MATERIAL RULES, Background Confidence Rule, Background-image harmony, Gradient Discipline, Materiality, Palette Discipline, Strong guidance

### Community 92 - "4. HERO MINIMALISM RULES"
Cohesion: 0.29
Nodes (7): 4. HERO MINIMALISM RULES, Absolute Hero Rules, Graphic Restraint, Headline Rule, Hero Composition Bias, Pre-output check, Typography Execution

### Community 93 - "29. ANTI-AI-SLOP RULES"
Cohesion: 0.33
Nodes (6): 29. ANTI-AI-SLOP RULES, Content slop, Density slop, Layout slop, Typography slop, Visual slop

### Community 94 - "5. IMAGE COUNT & PAGE SLICING"
Cohesion: 0.33
Nodes (6): 5. IMAGE COUNT & PAGE SLICING, Continuity Rule, Counting rule, Format, Section size variety, THIS IS THE PRIMARY OUTPUT RULE

### Community 96 - "0. BRIEF INFERENCE (Read the Room Before Anything Else)"
Cohesion: 0.40
Nodes (5): 0.A Read these signals first, 0.B Output a one-line "Design Read" before generating, 0. BRIEF INFERENCE (Read the Room Before Anything Else), 0.C If the brief is ambiguous, ask one question, do not guess, 0.D Anti-Default Discipline

### Community 97 - "12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)"
Cohesion: 0.40
Nodes (5): 12.A File Location, 12.B Required Frontmatter, 12.C Required Body Sections, 12.D Block-Library Discipline, 12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)

### Community 98 - "5. CONTEXT-AWARE PROACTIVITY"
Cohesion: 0.40
Nodes (5): 5.A Sticky-Stack - Canonical Skeleton, 5.B Horizontal-Pan - Canonical Skeleton, 5.C Scroll-Reveal Stagger - Canonical Skeleton (lighter alternative), 5. CONTEXT-AWARE PROACTIVITY, 5.D Forbidden Animation Patterns

### Community 99 - "8. DARK MODE PROTOCOL"
Cohesion: 0.40
Nodes (5): 8.A Token Strategy (pick one, stick to it), 8.B Do Not Prescribe Specific Colors Here, 8.C Default Mode, 8.D Test in Both Modes Before Finishing, 8. DARK MODE PROTOCOL

### Community 100 - "21. MOBILE ANTI-AI-TELLS RULE"
Cohesion: 0.40
Nodes (5): 21. MOBILE ANTI-AI-TELLS RULE, Copy AI tells, Layout AI tells, UI clutter tells, Visual AI tells

### Community 101 - "10. Roadmap Pengembangan Lanjutan"
Cohesion: 0.40
Nodes (5): 10. Roadmap Pengembangan Lanjutan, 🔴 Phase 1 — Critical Fixes (Segera), 🟡 Phase 2 — Core Completions (Sprint 1-2), 🟢 Phase 3 — Enhancements (Sprint 3-4), 🔵 Phase 4 — Advanced Features (Future)

### Community 102 - "CheckRole.php"
Cohesion: 0.60
Nodes (3): CheckRole, Closure, Symfony\Component\HttpFoundation\Response

### Community 103 - "7. DIAL DEFINITIONS (Technical Reference)"
Cohesion: 0.50
Nodes (4): 7. DIAL DEFINITIONS (Technical Reference), DESIGN_VARIANCE (Level 1-10), MOTION_INTENSITY (Level 1-10), VISUAL_DENSITY (Level 1-10)

### Community 104 - "33. DEFAULT SECTION PACKS"
Cohesion: 0.50
Nodes (4): 12-section pack, 33. DEFAULT SECTION PACKS, 4-section pack, 8-section pack

### Community 105 - "14. HERO MINIMALISM RULES"
Cohesion: 0.50
Nodes (4): 14. HERO MINIMALISM RULES, Absolute Hero Rules, Headline Rule, Hero Cleanliness Rule

### Community 106 - "37. EXAMPLE INTERPRETATIONS"
Cohesion: 0.50
Nodes (4): 37. EXAMPLE INTERPRETATIONS, Example 1, Example 2, Example 3

### Community 107 - "2. PLATFORM MODE RULE"
Cohesion: 0.50
Nodes (4): 2. PLATFORM MODE RULE, Android-native premium, Cross-platform premium neutral, iOS-native premium

### Community 108 - "37. EXAMPLE INTERPRETATIONS"
Cohesion: 0.50
Nodes (4): 37. EXAMPLE INTERPRETATIONS, Example 1, Example 2, Example 3

### Community 109 - "15. DEFAULT SITE PACKS"
Cohesion: 0.50
Nodes (4): 12-section pack, 15. DEFAULT SITE PACKS, 4-section pack, 8-section pack

### Community 110 - "20. EXAMPLE INTERPRETATIONS"
Cohesion: 0.50
Nodes (4): 20. EXAMPLE INTERPRETATIONS, Example 1, Example 2, Example 3

### Community 111 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 114 - "RtDashboard.tsx"
Cohesion: 0.17
Nodes (12): PreviewSuratModal(), PreviewSuratModalProps, MapFacilityItem, RealRtMap(), RealRtMapProps, RtDashboard(), RtDashboardProps, RwDashboard() (+4 more)

### Community 116 - "SOP Backend Development - SiDesKu"
Cohesion: 0.05
Nodes (42): 10. Ringkasan & Diagram Flow, 11. Instruksi Khusus untuk AI Agent, 1. Stack & Teknologi, 2. Arsitektur Project Backend, 3. Rule 1 - Form Request Validation, 4. Rule 2 - PHPDoc pada Setiap Method, 5. Rule 3 - Try-Catch Wajib, 6. Rule 4 - ResponseHelper (+34 more)

### Community 119 - "SuratRequest"
Cohesion: 0.10
Nodes (7): PublicSuratController, RtSuratController, RwSuratController, SekdesSuratController, SuratRequest, SuratTracking, SimpleSoftwareIO\QrCode\Facades\QrCode

### Community 120 - "UserFactory.php"
Cohesion: 0.38
Nodes (4): UserFactory, Illuminate\Database\Eloquent\Factories\Factory, Illuminate\Support\Facades\Hash, static

### Community 121 - "react"
Cohesion: 0.19
Nodes (5): App(), AuthPageProps, LoginPage(), BrandLogoProps, react

### Community 122 - "SiDesKu - Sistem Informasi Desa Doko"
Cohesion: 0.11
Nodes (17): Aturan Universal (Berlaku di Frontend maupun Backend), Aturan Wajib: Sebelum Baca File Raw, Query Graphify Dulu, Baca SOP yang Sesuai Domain Pekerjaan Kamu, Backend (Laravel 13 + PHP 8.3 + Sanctum + MySQL), Bug Backend Kritis (Belum Diperbaiki), File Graph, File Test yang Ada, Frontend (React + Vite + TypeScript + Tailwind) (+9 more)

### Community 124 - "Illuminate\Database\Eloquent\Relations\HasMany"
Cohesion: 0.12
Nodes (3): KartuKeluarga, Rt, Illuminate\Database\Eloquent\Relations\HasMany

### Community 125 - "SOP Frontend Development - SiDesKu"
Cohesion: 0.20
Nodes (9): 11. Graphify - Wajib Sebelum Baca File Raw, 12. Playwright E2E Testing - Wajib Setelah Selesai Coding, 13. Checklist Sebelum Selesai, 13. Panduan Testing Manual - Wajib Setelah Selesai Coding, 1. Stack & Teknologi, 3. Workflow Wajib Pengerjaan Task, 5. Aturan Komponen - Reuse Dulu, Checklist Playwright (+1 more)

### Community 126 - "9. Anti-Slop Design Taste (taste-skill)"
Cohesion: 0.22
Nodes (9): 9.1 Design Read Project SiDesKu, 9.2 Dial Setting (TETAP - tidak boleh diubah tanpa konfirmasi), 9.3 Palet Warna Project, 9.4 Tipografi, 9.5 Layout Anti-Slop Rules, 9.6 State UI yang Wajib Diimplementasi, 9.7 Konten & Data - Anti-Slop Content Rules, 9.8 Performance & Accessibility (+1 more)

### Community 127 - "SiDesKu Development & Prompt Guidelines"
Cohesion: 0.29
Nodes (6): 1. Aturan Alur Persetujuan Surat (Direct RT -> Desa), 2. Acuan SOP Dokumen Wajib, 3. Frontend Standards, 4. Backend Standards, 5. Knowledge Graph (graphify), SiDesKu Development & Prompt Guidelines

### Community 128 - "14. Aturan Kualitas Kode - Hasil Review"
Cohesion: 0.29
Nodes (7): 14.1 Pemisahan Layer, 14.2 Dilarang Keras - Dummy Data & Fallback Palsu, 14.3 TypeScript - Strict Typing, 14.4 State Management, 14.5 Search - Wajib Debounce, 14.6 FormData Upload, 14. Aturan Kualitas Kode - Hasil Review

### Community 129 - "14. Instruksi Khusus untuk AI Agent"
Cohesion: 0.50
Nodes (4): 14. Instruksi Khusus untuk AI Agent, Aturan Coding untuk AI, Format Laporan Wajib Setelah Selesai, Sebelum Mulai Apapun

### Community 130 - "2. Arsitektur Project"
Cohesion: 0.50
Nodes (4): 2. Arsitektur Project, Aturan Import (Urutan Wajib), Prinsip Utama, Struktur Folder Aktual

### Community 131 - "6. Aturan Fetching Data"
Cohesion: 0.50
Nodes (4): 6. Aturan Fetching Data, Axios Instance - WAJIB, Handle State Wajib di Komponen, Pola Aktual Project (useEffect + useState)

### Community 132 - "10. Aturan Kerja Tim"
Cohesion: 0.67
Nodes (3): 10. Aturan Kerja Tim, Hal yang Tidak Boleh Dilakukan Tanpa Konfirmasi Tim, Sebelum Mulai Task

### Community 133 - "4. Aturan Styling - Tailwind + index.css"
Cohesion: 0.67
Nodes (3): 4. Aturan Styling - Tailwind + index.css, Aturan Wajib Styling, Class Custom Tersedia di src/index.css

### Community 134 - "7. Aturan Slicing dari Figma"
Cohesion: 0.67
Nodes (3): 7. Aturan Slicing dari Figma, Responsif, Yang Wajib Ada di Setiap Halaman

### Community 135 - "8. Standar Penulisan Kode"
Cohesion: 0.67
Nodes (3): 8. Standar Penulisan Kode, Penamaan, Yang Dilarang

## Knowledge Gaps
- **834 isolated node(s):** `$schema`, `name`, `type`, `description`, `keywords` (+829 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 976 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `SekdesDashboard.tsx`, `lucide-react`, `DashboardLayout.tsx`, `AuthContext.tsx`, `frontend/package.json`, `MetricStatCard.tsx`, `WargaDashboard.tsx`, `RtDashboard.tsx`, `BeritaPage.tsx`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `frontend/package.json`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `SekdesDashboard.tsx`, `DashboardLayout.tsx`, `frontend/package.json`, `MetricStatCard.tsx`, `WargaDashboard.tsx`, `RtDashboard.tsx`, `BeritaPage.tsx`, `react`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `$schema`, `name`, `type` to the rest of the system?**
  _834 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Illuminate\Database\Migrations\Migration` be split into smaller, more focused modules?**
  _Cohesion score 0.0707070707070707 - nodes in this community are weakly interconnected._
- **Should `Illuminate\Http\JsonResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.10476190476190476 - nodes in this community are weakly interconnected._
- **Should `types/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._