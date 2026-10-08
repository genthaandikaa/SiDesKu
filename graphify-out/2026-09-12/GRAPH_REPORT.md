# Graph Report - lomba  (2026-09-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 625 nodes · 1201 edges · 56 communities (36 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b3d77bee`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Illuminate\Http\JsonResponse
- Illuminate\Database\Migrations\Migration
- User
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Illuminate\Database\Eloquent\Factories\HasFactory
- Illuminate\Database\Eloquent\Relations\HasMany
- react
- DashboardLayout.tsx
- types/index.ts
- compilerOptions
- frontend/package.json
- compilerOptions
- DatabaseSeeder.php
- backend/package.json
- MetricStatCard.tsx
- dependencies
- scripts
- WargaDashboard.tsx
- lucide-react
- devDependencies
- WargaProfile
- composer.json
- scripts
- require-dev
- config
- @playwright/test
- SekdesDashboard.tsx
- AppServiceProvider
- require
- devDependencies
- TestCase
- .oxlintrc.json
- ApbdesRecord
- KartuKeluarga
- bootstrap/app.php
- psr-4
- logging.php
- sanctum.php
- LoginPage.tsx
- AuthContext.tsx
- ExampleTest
- autoload-dev
- extra
- console.php
- BrandLogo.tsx
- axios.ts
- tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `Controller` - 35 edges
2. `react` - 34 edges
3. `SuratRequest` - 32 edges
4. `lucide-react` - 27 edges
5. `WargaProfile` - 25 edges
6. `User` - 19 edges
7. `compilerOptions` - 19 edges
8. `SuratTracking` - 18 edges
9. `Rt` - 17 edges
10. `NotifikasiLog` - 16 edges

## Surprising Connections (you probably didn't know these)
- `BansosController` --inherits--> `BansosController`  [EXTRACTED]
  backend/app/Http/Controllers/Api/Admin/BansosController.php → backend/app/Http/Controllers/Api/Sekdes/BansosController.php
- `AuthController` --inherits--> `Controller`  [EXTRACTED]
  backend/app/Http/Controllers/Api/Auth/AuthController.php → backend/app/Http/Controllers/Controller.php
- `DesaSettingController` --inherits--> `Controller`  [EXTRACTED]
  backend/app/Http/Controllers/Api/Admin/DesaSettingController.php → backend/app/Http/Controllers/Controller.php
- `WargaController` --inherits--> `Controller`  [EXTRACTED]
  backend/app/Http/Controllers/Api/Admin/WargaController.php → backend/app/Http/Controllers/Controller.php
- `ApbdesController` --inherits--> `Controller`  [EXTRACTED]
  backend/app/Http/Controllers/Api/Bendahara/ApbdesController.php → backend/app/Http/Controllers/Controller.php

## Import Cycles
- None detected.

## Communities (56 total, 11 thin omitted)

### Community 0 - "Illuminate\Http\JsonResponse"
Cohesion: 0.06
Nodes (27): App\Http\Controllers\Api\Admin\AdminDesaSettingController, BansosController, DesaSettingController, WargaController, ApbdesController, PublicInfoController, PublicSuratController, KasRtController (+19 more)

### Community 1 - "Illuminate\Database\Migrations\Migration"
Cohesion: 0.09
Nodes (3): Illuminate\Database\Migrations\Migration, Illuminate\Database\Schema\Blueprint, Illuminate\Support\Facades\Schema

### Community 2 - "User"
Cohesion: 0.08
Nodes (14): AuthController, User, UserFactory, Illuminate\Database\Eloquent\Factories\Factory, Illuminate\Database\Eloquent\Relations\HasOne, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable, Illuminate\Support\Facades\Hash (+6 more)

### Community 3 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.11
Nodes (4): BantuanPenerima, KasRtTransaction, PengaduanWarga, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 4 - "Illuminate\Database\Eloquent\Factories\HasFactory"
Cohesion: 0.14
Nodes (7): ActivityLog, Berita, Pengumuman, Role, SuratType, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Eloquent\Model

### Community 5 - "Illuminate\Database\Eloquent\Relations\HasMany"
Cohesion: 0.12
Nodes (4): ApbdesCategory, Rt, Rw, Illuminate\Database\Eloquent\Relations\HasMany

### Community 6 - "react"
Cohesion: 0.15
Nodes (6): App(), PublicFooter(), NavItem, PublicNavbar(), react, react-router-dom

### Community 7 - "DashboardLayout.tsx"
Cohesion: 0.13
Nodes (15): BendaharaDashboard(), BendaharaDashboardProps, NavGroup, QrVerificationModal(), QrVerificationModalProps, AgendaDesaView(), NotificationItem, NotifikasiView() (+7 more)

### Community 8 - "types/index.ts"
Cohesion: 0.09
Nodes (21): ApbdesCategory, ApbdesRecord, BantuanPenerima, BantuanSosial, Berita, DesaSetting, Dusun, KartuKeluarga (+13 more)

### Community 9 - "compilerOptions"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 10 - "frontend/package.json"
Cohesion: 0.11
Nodes (16): vite, name, private, type, version, clsx, oxlint, react-icons (+8 more)

### Community 11 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 12 - "DatabaseSeeder.php"
Cohesion: 0.16
Nodes (5): BantuanSosial, Dusun, KasRtCategory, DatabaseSeeder, Illuminate\Database\Seeder

### Community 13 - "backend/package.json"
Cohesion: 0.12
Nodes (14): tailwindcss, @tailwindcss/vite, vite, optionalDependencies, @laravel/multiplex, private, $schema, scripts (+6 more)

### Community 14 - "MetricStatCard.tsx"
Cohesion: 0.14
Nodes (8): AreaSplineChartProps, ChartDataPoint, colorMap, DonutGauge(), DonutGaugeProps, MetricStatCardProps, AgendaItem, MiniCalendarWidgetProps

### Community 15 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, axios, clsx, jsqr, lucide-react, react, react-dom, react-icons (+5 more)

### Community 16 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, dev, lint, preview, test:e2e, test:e2e:headed, test:security (+3 more)

### Community 17 - "WargaDashboard.tsx"
Cohesion: 0.22
Nodes (8): CetakSuratModal(), CetakSuratModalProps, SuratTrackingModal(), SuratTrackingModalProps, defaultSuratTypes, WargaDashboard(), WargaDashboardProps, react-dom

### Community 18 - "lucide-react"
Cohesion: 0.18
Nodes (3): BarActivityChartProps, BarDataPoint, lucide-react

### Community 19 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, oxlint, @playwright/test, @types/node, @types/react, @types/react-dom, typescript, vite (+2 more)

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
Cohesion: 0.29
Nodes (3): routesToTest, screenshotsDir, @playwright/test

### Community 26 - "SekdesDashboard.tsx"
Cohesion: 0.38
Nodes (4): BansosManager(), KopSuratSetting(), SekdesDashboard(), SekdesDashboardProps

### Community 28 - "require"
Cohesion: 0.33
Nodes (6): require, laravel/framework, laravel/sanctum, laravel/tinker, php, simplesoftwareio/simple-qrcode

### Community 29 - "devDependencies"
Cohesion: 0.33
Nodes (6): devDependencies, concurrently, laravel-vite-plugin, tailwindcss, @tailwindcss/vite, vite

### Community 30 - "TestCase"
Cohesion: 0.47
Nodes (3): ExampleTest, TestCase, Illuminate\Foundation\Testing\TestCase

### Community 31 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

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

### Community 41 - "autoload-dev"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 42 - "extra"
Cohesion: 0.67
Nodes (3): extra, laravel, dont-discover

## Knowledge Gaps
- **186 isolated node(s):** `AreaSplineChartProps`, `ChartDataPoint`, `DonutGaugeProps`, `MetricStatCardProps`, `AgendaItem` (+181 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 281 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `LoginPage.tsx`, `DashboardLayout.tsx`, `AuthContext.tsx`, `frontend/package.json`, `BrandLogo.tsx`, `MetricStatCard.tsx`, `WargaDashboard.tsx`, `lucide-react`, `SekdesDashboard.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `LoginPage.tsx`, `DashboardLayout.tsx`, `react`, `frontend/package.json`, `MetricStatCard.tsx`, `WargaDashboard.tsx`, `SekdesDashboard.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `User` connect `User` to `Illuminate\Database\Eloquent\Factories\HasFactory`, `DatabaseSeeder.php`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `AreaSplineChartProps`, `ChartDataPoint`, `DonutGaugeProps` to the rest of the system?**
  _186 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Illuminate\Http\JsonResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.061855670103092786 - nodes in this community are weakly interconnected._
- **Should `Illuminate\Database\Migrations\Migration` be split into smaller, more focused modules?**
  _Cohesion score 0.0873015873015873 - nodes in this community are weakly interconnected._
- **Should `User` be split into smaller, more focused modules?**
  _Cohesion score 0.08377896613190731 - nodes in this community are weakly interconnected._