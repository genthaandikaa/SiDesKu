<?php

use App\Http\Controllers\Api\Admin\AdminDesaSettingController;
use App\Http\Controllers\Api\Admin\WargaController as AdminWargaController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Bendahara\ApbdesController;
use App\Http\Controllers\Api\PengumumanController;
use App\Http\Controllers\Api\Public\PublicInfoController;
use App\Http\Controllers\Api\Public\PublicSuratController;
use App\Http\Controllers\Api\Rt\KasRtController;
use App\Http\Controllers\Api\Rt\RtPengaduanController;
use App\Http\Controllers\Api\Rt\RtSuratController;
use App\Http\Controllers\Api\Rt\RtWargaController;
use App\Http\Controllers\Api\Rw\RwSuratController;
use App\Http\Controllers\Api\Rw\RwWargaController;
use App\Http\Controllers\Api\Sekdes\BansosController;
use App\Http\Controllers\Api\Sekdes\DesaSettingController;
use App\Http\Controllers\Api\Sekdes\SekdesSuratController;
use App\Http\Controllers\Api\Warga\PengaduanController as WargaPengaduanController;
use App\Http\Controllers\Api\Warga\WargaSuratController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/settings/desa', [DesaSettingController::class, 'getSettings']);

// Informasi Publik Desa
Route::get('/public/beritas', [PublicInfoController::class, 'getBeritas']);
Route::get('/public/pengumumans', [PengumumanController::class, 'index']);
Route::get('/public/stats', [PublicInfoController::class, 'getVillageStats']);
Route::get('/public/home', [PublicInfoController::class, 'getPublicHome']);
Route::get('/public/apbdes/summary', [ApbdesController::class, 'publicSummary']);

// Layanan & Tracking Surat Publik
Route::get('/surat-types', [PublicSuratController::class, 'getTypes']);
Route::get('/public/surat/track', [PublicSuratController::class, 'trackPublic']);
Route::get('/public/surat/verify-qr/{hash}', [PublicSuratController::class, 'verifyQr'])->where('hash', '.*');
Route::get('/public/surat/qr/{hash?}', [PublicSuratController::class, 'getQrCodeSvg'])->where('hash', '.*');
Route::get('/public/surat/barcode/{hash?}', [PublicSuratController::class, 'getBarcodeSvg'])->where('hash', '.*');
Route::get('/calendar/today', [\App\Http\Controllers\Api\Public\CalendarController::class, 'getToday']);
Route::get('/public/calendar/today', [\App\Http\Controllers\Api\Public\CalendarController::class, 'getToday']);

// protected routes (auth:sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // authenticated user info & profile management
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::match(['put', 'post'], '/auth/profile', [AuthController::class, 'updateProfile']);
    Route::match(['put', 'post'], '/auth/password', [AuthController::class, 'updatePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/notifikasi-logs', [PublicInfoController::class, 'getNotifikasiLogs']);
    Route::get('/pengumumans', [PengumumanController::class, 'index']);
    Route::get('/pengumumans/{id}', [PengumumanController::class, 'show']);
    Route::post('/pengumumans', [PengumumanController::class, 'store']);

    // surat digitalisasi & tracking (Api\Warga, Api\Rt, Api\Rw, Api\Sekdes)
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
    Route::put('/surats/{id}', [WargaSuratController::class, 'update']);
    Route::delete('/surats/{id}', [WargaSuratController::class, 'destroy']);

    // Master Dokumen Kependudukan Warga (Upload Sekali Tersimpan Permanen di Database Desa)
    Route::get('/warga/dokumen', [\App\Http\Controllers\Api\Warga\WargaDokumenController::class, 'index']);
    Route::post('/warga/dokumen', [\App\Http\Controllers\Api\Warga\WargaDokumenController::class, 'store']);
    Route::delete('/warga/dokumen/{tipe}', [\App\Http\Controllers\Api\Warga\WargaDokumenController::class, 'destroy']);

    // Verifikasi & Aksi Ketua RT
    Route::middleware('role:rt,sekretaris_rt,admin')->group(function () {
        Route::post('/surats/{id}/approve-rt', [RtSuratController::class, 'approveRt']);
        Route::post('/surats/{id}/rt-action', [RtSuratController::class, 'handleAction']);
    });

    // Verifikasi Ketua RW
    Route::middleware('role:rw,admin')->group(function () {
        Route::post('/surats/{id}/approve-rw', [RwSuratController::class, 'approveRw']);
    });

    // Legalisasi & TTD QR Kepala Desa / Sekdes
    Route::middleware('role:sekdes,kades,admin')->group(function () {
        Route::post('/surats/{id}/process-sekdes', [SekdesSuratController::class, 'processSekdes']);
    });

    // Penolakan Surat (RT / RW / Sekdes / Admin)
    Route::middleware('role:rt,rw,sekdes,kades,admin')->post('/surats/{id}/reject', function (Request $request, $id) {
        $user = $request->user();
        if ($user->hasRole('rt')) {
            return app(RtSuratController::class)->reject($request, $id);
        } elseif ($user->hasRole('rw')) {
            return app(RwSuratController::class)->reject($request, $id);
        }
        return app(SekdesSuratController::class)->reject($request, $id);
    });

    // kas dan keuangan RT (Api\Rt\KasRtController)
    Route::get('/kas-rt', [KasRtController::class, 'index']);
    Route::middleware('role:rt,bendahara_rt,rw,admin')->group(function () {
        Route::post('/kas-rt/categories', [KasRtController::class, 'storeCategory']);
        Route::post('/kas-rt/transactions', [KasRtController::class, 'store']);
        Route::post('/kas-rt/transaction', [KasRtController::class, 'store']); // alias
    });

    // APBDes & Keuangan Desa (Api\Bendahara\ApbdesController)
    Route::get('/apbdes/categories', [ApbdesController::class, 'getCategories']);
    Route::middleware('role:bendahara_desa,sekdes,kades,admin')->group(function () {
        Route::post('/apbdes/records', [ApbdesController::class, 'store']);
        Route::put('/apbdes/records/{id}', [ApbdesController::class, 'update']);
        Route::delete('/apbdes/records/{id}', [ApbdesController::class, 'destroy']);
    });

    // bantuan sosial & bansos desa (Api\Sekdes\BansosController)
    Route::get('/bansos', [BansosController::class, 'index']);
    Route::middleware('role:sekdes,kades,admin')->group(function () {
        Route::post('/bansos', [BansosController::class, 'store']);
        Route::get('/bansos/{id}', [BansosController::class, 'show']);
        Route::post('/bansos/{id}/penerima', [BansosController::class, 'addPenerima']);
        Route::post('/bansos/{id}/publish-broadcast', [BansosController::class, 'publishAndBroadcast']);
        Route::post('/bansos/{id}/verify-disalurkan', [BansosController::class, 'verifyDisalurkan']);
    });

    // pengaturan desa & settings (Api\Admin\DesaSettingController)
    Route::middleware('role:admin,sekdes,kades')->put('/settings/desa', [DesaSettingController::class, 'updateSettings']);

    // data warga & kartu keluarga (Api\Admin\WargaController, Api\Rt\RtWargaController, Api\Rw\RwWargaController)
    Route::get('/warga', function (Request $request) {
        $user = $request->user();
        if ($user->hasRole('rt') || $user->hasRole('sekretaris_rt')) {
            return app(RtWargaController::class)->index($request);
        } elseif ($user->hasRole('rw')) {
            return app(RwWargaController::class)->index($request);
        }
        return app(AdminWargaController::class)->index($request);
    });
    Route::get('/warga/kartu-keluarga', function (Request $request) {
        $user = $request->user();
        if ($user->hasRole('rt') || $user->hasRole('sekretaris_rt') || $user->hasRole('bendahara_rt')) {
            return app(RtWargaController::class)->getKartuKeluargas($request);
        } elseif ($user->hasRole('rw')) {
            return app(RwWargaController::class)->getKartuKeluargas($request);
        }
        return app(AdminWargaController::class)->getKartuKeluargas($request);
    });
    Route::get('/wilayah', [AdminWargaController::class, 'getWilayah']);

    // pengaduan warga (Api\Warga\PengaduanController & Api\Rt\RtPengaduanController)
    Route::get('/pengaduan', function (Request $request) {
        $user = $request->user();
        if ($user->hasRole('rt') || $user->hasRole('sekretaris_rt')) {
            return app(RtPengaduanController::class)->index($request);
        }
        return app(WargaPengaduanController::class)->index($request);
    });
    Route::post('/pengaduan', [WargaPengaduanController::class, 'store']);
    Route::post('/pengaduan/{id}/respond', [RtPengaduanController::class, 'respond']);

    // Route groups for specific roles (Warga, RT, RW, Sekdes, Bendahara)
    Route::prefix('admin')->group(function () {
        Route::get('/warga', [AdminWargaController::class, 'index']);
        Route::get('/warga/kartu-keluarga', [AdminWargaController::class, 'getKartuKeluargas']);
        Route::get('/wilayah', [AdminWargaController::class, 'getWilayah']);
    });

    Route::prefix('warga')->group(function () {
        Route::get('/surats', [WargaSuratController::class, 'index']);
        Route::post('/surats', [WargaSuratController::class, 'store']);
        Route::put('/surats/{id}', [WargaSuratController::class, 'update']);
        Route::delete('/surats/{id}', [WargaSuratController::class, 'destroy']);
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
        Route::get('/warga', [RwWargaController::class, 'index']);
        Route::get('/kartu-keluarga', [RwWargaController::class, 'getKartuKeluargas']);
        Route::get('/rts', [RwWargaController::class, 'getRts']);
        Route::get('/kas', [KasRtController::class, 'index']);
        Route::post('/kas/transaksi', [KasRtController::class, 'store']);
    });

    Route::prefix('sekdes')->group(function () {
        Route::get('/surats', [SekdesSuratController::class, 'index']);
        Route::post('/surats/{id}/process', [SekdesSuratController::class, 'processSekdes']);
        Route::post('/surats/{id}/reject', [SekdesSuratController::class, 'reject']);
        Route::get('/bansos', [BansosController::class, 'index']);
        Route::put('/settings/desa', [DesaSettingController::class, 'updateSettings']);
        
        // Penomoran & Format Surat Desa
        Route::get('/surat-types', [\App\Http\Controllers\Api\Sekdes\SuratSettingController::class, 'index']);
        Route::put('/surat-types/{id}', [\App\Http\Controllers\Api\Sekdes\SuratSettingController::class, 'update']);
        Route::get('/surat-types/{id}/preview', [\App\Http\Controllers\Api\Sekdes\SuratSettingController::class, 'preview']);

        // Pendaftaran Warga oleh Desa
        Route::get('/warga', [\App\Http\Controllers\Api\Sekdes\WargaManagementController::class, 'index']);
        Route::post('/warga', [\App\Http\Controllers\Api\Sekdes\WargaManagementController::class, 'store']);
    });

    Route::prefix('bendahara')->group(function () {
        Route::get('/apbdes/summary', [ApbdesController::class, 'publicSummary']);
        Route::get('/apbdes/categories', [ApbdesController::class, 'getCategories']);
        Route::post('/apbdes/records', [ApbdesController::class, 'store']);
        Route::put('/apbdes/records/{id}', [ApbdesController::class, 'update']);
        Route::delete('/apbdes/records/{id}', [ApbdesController::class, 'destroy']);
    });
});
