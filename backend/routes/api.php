<?php

use App\Http\Controllers\Api\Admin\AdminDesaSettingController;
use App\Http\Controllers\Api\Admin\WargaController as AdminWargaController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Bendahara\ApbdesController;
use App\Http\Controllers\Api\Public\PublicInfoController;
use App\Http\Controllers\Api\Public\PublicSuratController;
use App\Http\Controllers\Api\Rt\KasRtController;
use App\Http\Controllers\Api\Rt\RtPengaduanController;
use App\Http\Controllers\Api\Rt\RtSuratController;
use App\Http\Controllers\Api\Rt\RtWargaController;
use App\Http\Controllers\Api\Rw\RwSuratController;
use App\Http\Controllers\Api\Sekdes\BansosController;
use App\Http\Controllers\Api\Sekdes\DesaSettingController;
use App\Http\Controllers\Api\Sekdes\SekdesSuratController;
use App\Http\Controllers\Api\Warga\PengaduanController as WargaPengaduanController;
use App\Http\Controllers\Api\Warga\WargaSuratController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SiDesKu API Routes - Struktur Berdasarkan Role
|--------------------------------------------------------------------------
|
| Rute API dikelompokkan secara terstruktur berdasarkan modul & role user:
| 1. Public (Tanpa Autentikasi)
| 2. Auth & Akun (Login, Register, Profil)
| 3. Warga (Pengajuan Surat, Pengaduan Warga)
| 4. RT (Verifikasi Surat RT, Kas RT, Data Warga RT)
| 5. RW (Verifikasi Surat RW)
| 6. Sekdes / Kades (Legalisasi & TTD QR, Bansos, Kop Surat)
| 7. Bendahara Desa (APBDes Keuangan Desa)
| 8. Admin (Master Kependudukan & Pengaturan Sistem)
|
*/

// =========================================================================
// 1. PUBLIC ROUTES (Tanpa Autentikasi)
// =========================================================================
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/settings/desa', [DesaSettingController::class, 'getSettings']);

// Informasi Publik Desa
Route::get('/public/beritas', [PublicInfoController::class, 'getBeritas']);
Route::get('/public/pengumumans', [PublicInfoController::class, 'getPengumumans']);
Route::get('/public/stats', [PublicInfoController::class, 'getVillageStats']);
Route::get('/public/apbdes/summary', [ApbdesController::class, 'publicSummary']);

// Layanan & Tracking Surat Publik
Route::get('/surat-types', [PublicSuratController::class, 'getTypes']);
Route::get('/public/surat/track', [PublicSuratController::class, 'trackPublic']);
Route::get('/public/surat/verify-qr/{hash}', [PublicSuratController::class, 'verifyQr']);
Route::get('/public/surat/qr/{hash?}', [PublicSuratController::class, 'getQrCodeSvg']);


// =========================================================================
// PROTECTED ROUTES (Memerlukan Token Sanctum)
// =========================================================================
Route::middleware('auth:sanctum')->group(function () {

    // =====================================================================
    // 2. AUTH & PROFIL (Api\Auth)
    // =====================================================================
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::match(['put', 'post'], '/auth/profile', [AuthController::class, 'updateProfile']);
    Route::match(['put', 'post'], '/auth/password', [AuthController::class, 'updatePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/notifikasi-logs', [PublicInfoController::class, 'getNotifikasiLogs']);

    // =====================================================================
    // 3. PERSURATAN DIGITAL WORKFLOW (Multi-Role Dispatcher)
    // =====================================================================
    // List surat otomatis difilter sesuai role pemohon / verifikator
    Route::get('/surats', function (Request $request) {
        $user = $request->user();
        if ($user->hasRole('warga')) {
            return app(WargaSuratController::class)->index($request);
        } elseif ($user->hasRole('rt') || $user->hasRole('sekretaris_rt') || $user->hasRole('bendahara_rt')) {
            return app(RtSuratController::class)->index($request);
        } elseif ($user->hasRole('rw')) {
            return app(RwSuratController::class)->index($request);
        }
        return app(SekdesSuratController::class)->index($request);
    });

    // Detail & Pengajuan Surat (Warga)
    Route::post('/surats', [WargaSuratController::class, 'store']);
    Route::get('/surats/{id}', [WargaSuratController::class, 'show']);

    // Verifikasi & Aksi Ketua RT
    Route::post('/surats/{id}/approve-rt', [RtSuratController::class, 'approveRt']);
    Route::post('/surats/{id}/rt-action', [RtSuratController::class, 'handleAction']);

    // Verifikasi Ketua RW
    Route::post('/surats/{id}/approve-rw', [RwSuratController::class, 'approveRw']);

    // Legalisasi & TTD QR Kepala Desa / Sekdes
    Route::post('/surats/{id}/process-sekdes', [SekdesSuratController::class, 'processSekdes']);

    // Penolakan Surat (RT / RW / Sekdes)
    Route::post('/surats/{id}/reject', function (Request $request, $id) {
        $user = $request->user();
        if ($user->hasRole('rt')) {
            return app(RtSuratController::class)->reject($request, $id);
        } elseif ($user->hasRole('rw')) {
            return app(RwSuratController::class)->reject($request, $id);
        }
        return app(SekdesSuratController::class)->reject($request, $id);
    });

    // =====================================================================
    // 4. KAS KEUANGAN RT (Api\Rt)
    // =====================================================================
    Route::get('/kas-rt', [KasRtController::class, 'index']);
    Route::post('/kas-rt/categories', [KasRtController::class, 'storeCategory']);
    Route::post('/kas-rt/transactions', [KasRtController::class, 'store']);
    Route::post('/kas-rt/transaction', [KasRtController::class, 'store']); // alias

    // =====================================================================
    // 5. APBDES KEUANGAN DESA (Api\Bendahara)
    // =====================================================================
    Route::get('/apbdes/categories', [ApbdesController::class, 'getCategories']);
    Route::post('/apbdes/records', [ApbdesController::class, 'store']);
    Route::put('/apbdes/records/{id}', [ApbdesController::class, 'update']);
    Route::delete('/apbdes/records/{id}', [ApbdesController::class, 'destroy']);

    // =====================================================================
    // 6. BANTUAN SOSIAL & BROADCAST WA (Api\Sekdes & Api\Admin)
    // =====================================================================
    Route::get('/bansos', [BansosController::class, 'index']);
    Route::post('/bansos', [BansosController::class, 'store']);
    Route::get('/bansos/{id}', [BansosController::class, 'show']);
    Route::post('/bansos/{id}/penerima', [BansosController::class, 'addPenerima']);
    Route::post('/bansos/{id}/publish-broadcast', [BansosController::class, 'publishAndBroadcast']);
    Route::post('/bansos/{id}/verify-disalurkan', [BansosController::class, 'verifyDisalurkan']);

    // =====================================================================
    // 7. PENGATURAN IDENTITAS DESA & KOP SURAT (Api\Sekdes & Api\Admin)
    // =====================================================================
    Route::put('/settings/desa', [DesaSettingController::class, 'updateSettings']);

    // =====================================================================
    // 8. DATA KEPENDUDUKAN & WILAYAH (Api\Admin & Api\Rt)
    // =====================================================================
    Route::get('/warga', function (Request $request) {
        $user = $request->user();
        if ($user->hasRole('rt') || $user->hasRole('sekretaris_rt')) {
            return app(RtWargaController::class)->index($request);
        }
        return app(AdminWargaController::class)->index($request);
    });
    Route::get('/warga/kartu-keluarga', [AdminWargaController::class, 'getKartuKeluargas']);
    Route::get('/wilayah', [AdminWargaController::class, 'getWilayah']);

    // =====================================================================
    // 9. PENGADUAN & ASPIRASI WARGA (Api\Warga & Api\Rt)
    // =====================================================================
    Route::get('/pengaduan', function (Request $request) {
        $user = $request->user();
        if ($user->hasRole('rt') || $user->hasRole('sekretaris_rt')) {
            return app(RtPengaduanController::class)->index($request);
        }
        return app(WargaPengaduanController::class)->index($request);
    });
    Route::post('/pengaduan', [WargaPengaduanController::class, 'store']);
    Route::post('/pengaduan/{id}/respond', [RtPengaduanController::class, 'respond']);

    // =====================================================================
    // 10. DIRECT ROLE-PREFIXED ENDPOINTS (Kemudahan Navigasi & Coding)
    // =====================================================================
    Route::prefix('warga')->group(function () {
        Route::get('/surats', [WargaSuratController::class, 'index']);
        Route::post('/surats', [WargaSuratController::class, 'store']);
        Route::get('/pengaduan', [WargaPengaduanController::class, 'index']);
        Route::post('/pengaduan', [WargaPengaduanController::class, 'store']);
    });

    Route::prefix('rt')->group(function () {
        Route::get('/surats', [RtSuratController::class, 'index']);
        Route::post('/surats/{id}/approve', [RtSuratController::class, 'approveRt']);
        Route::post('/surats/{id}/action', [RtSuratController::class, 'handleAction']);
        Route::post('/surats/{id}/reject', [RtSuratController::class, 'reject']);
        Route::get('/kas', [KasRtController::class, 'index']);
        Route::post('/kas/transaksi', [KasRtController::class, 'store']);
        Route::get('/warga', [RtWargaController::class, 'index']);
        Route::get('/pengaduan', [RtPengaduanController::class, 'index']);
        Route::post('/pengaduan/{id}/respond', [RtPengaduanController::class, 'respond']);
    });

    Route::prefix('rw')->group(function () {
        Route::get('/surats', [RwSuratController::class, 'index']);
        Route::post('/surats/{id}/approve', [RwSuratController::class, 'approveRw']);
        Route::post('/surats/{id}/reject', [RwSuratController::class, 'reject']);
    });

    Route::prefix('sekdes')->group(function () {
        Route::get('/surats', [SekdesSuratController::class, 'index']);
        Route::post('/surats/{id}/process', [SekdesSuratController::class, 'processSekdes']);
        Route::post('/surats/{id}/reject', [SekdesSuratController::class, 'reject']);
        Route::get('/bansos', [BansosController::class, 'index']);
        Route::put('/settings/desa', [DesaSettingController::class, 'updateSettings']);
    });

    Route::prefix('bendahara')->group(function () {
        Route::get('/apbdes/summary', [ApbdesController::class, 'publicSummary']);
        Route::get('/apbdes/categories', [ApbdesController::class, 'getCategories']);
        Route::post('/apbdes/records', [ApbdesController::class, 'store']);
        Route::put('/apbdes/records/{id}', [ApbdesController::class, 'update']);
        Route::delete('/apbdes/records/{id}', [ApbdesController::class, 'destroy']);
    });
});
