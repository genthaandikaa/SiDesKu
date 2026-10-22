<?php

use App\Http\Controllers\Api\Admin\AdminDesaSettingController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminSystemController;
use App\Http\Controllers\Api\Admin\WargaController as AdminWargaController;
use App\Http\Controllers\Api\AgendaController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Bendahara\ApbdesController;
use App\Http\Controllers\Api\Kades\KadesKeputusanController;
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
Route::get('/public/keputusan', [KadesKeputusanController::class, 'publicIndex']);
Route::get('/public/agendas', [AgendaController::class, 'index']);

// Layanan & Tracking Surat Publik
Route::get('/surat-types', [PublicSuratController::class, 'getTypes']);
Route::get('/public/surat/track', [PublicSuratController::class, 'trackPublic']);
Route::get('/public/surat/verify-qr/{hash}', [PublicSuratController::class, 'verifyQr'])->where('hash', '.*');
Route::get('/public/surat/qr/{hash?}', [PublicSuratController::class, 'getQrCodeSvg'])->where('hash', '.*');
Route::get('/public/surat/barcode/{hash?}', [PublicSuratController::class, 'getBarcodeSvg'])->where('hash', '.*');
Route::get('/calendar/today', [\App\Http\Controllers\Api\Public\CalendarController::class, 'getToday']);
Route::get('/public/calendar/today', [\App\Http\Controllers\Api\Public\CalendarController::class, 'getToday']);

// Chat Pusat Bantuan Desa Publik (Lupa Akun / Bantuan Warga)
Route::post('/chat/support/initiate', [\App\Http\Controllers\Api\ChatController::class, 'initiateGuestSupport']);
Route::get('/chat/support/{ticket}/messages', [\App\Http\Controllers\Api\ChatController::class, 'getGuestSupportMessages']);
Route::post('/chat/support/{ticket}/messages', [\App\Http\Controllers\Api\ChatController::class, 'sendGuestSupportMessage']);

// Dokumen Kependudukan (UU PDP)
Route::get('/warga/dokumen/file/{userId}/{filename}', [\App\Http\Controllers\Api\Warga\WargaDokumenController::class, 'serveFile'])->name('api.warga.dokumen.file');

// protected routes
Route::middleware(['auth:sanctum', 'tenant'])->group(function () {

    // Chat Terenkripsi & Komunikasi Desa
    Route::get('/chat/contacts', [\App\Http\Controllers\Api\ChatController::class, 'getContacts']);
    Route::get('/chat/rooms', [\App\Http\Controllers\Api\ChatController::class, 'getRooms']);
    Route::post('/chat/rooms', [\App\Http\Controllers\Api\ChatController::class, 'getOrCreateRoom']);
    Route::get('/chat/unread-count', [\App\Http\Controllers\Api\ChatController::class, 'getUnreadCount']);
    Route::get('/chat/rooms/{roomId}/messages', [\App\Http\Controllers\Api\ChatController::class, 'getMessages']);
    Route::post('/chat/rooms/{roomId}/messages', [\App\Http\Controllers\Api\ChatController::class, 'sendMessage']);

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
    Route::put('/pengumumans/{id}', [PengumumanController::class, 'update']);

    // agenda kegiatan desa
    Route::get('/agendas', [AgendaController::class, 'index']);
    Route::get('/agendas/{id}', [AgendaController::class, 'show']);
    Route::post('/agendas', [AgendaController::class, 'store']);
    Route::put('/agendas/{id}', [AgendaController::class, 'update']);
    Route::delete('/agendas/{id}', [AgendaController::class, 'destroy']);

    // surat digitalisasi & tracking
    Route::get('/surats', function (Request $request) {
        $user = $request->user();
        if ($user->hasRole('warga')) {
            return app(WargaSuratController::class)->index($request);
        } elseif ($user->hasRole('rt')) {
            return app(RtSuratController::class)->index($request);
        } elseif ($user->hasRole('rw')) {
            return app(RwSuratController::class)->index($request);
        } elseif ($user->hasRole('kades')) {
            return app(\App\Http\Controllers\Api\Kades\KadesSuratController::class)->index($request);
        }
        return app(SekdesSuratController::class)->index($request);
    });

    // Detail & Pengajuan Surat (Warga)
    Route::post('/surats', [WargaSuratController::class, 'store']);
    Route::get('/surats/{id}', [WargaSuratController::class, 'show']);
    Route::put('/surats/{id}', [WargaSuratController::class, 'update']);
    Route::delete('/surats/{id}', [WargaSuratController::class, 'destroy']);

    // Master Dokumen Kependudukan Warga
    Route::get('/warga/dokumen', [\App\Http\Controllers\Api\Warga\WargaDokumenController::class, 'index']);
    Route::post('/warga/dokumen', [\App\Http\Controllers\Api\Warga\WargaDokumenController::class, 'store']);
    Route::delete('/warga/dokumen/{tipe}', [\App\Http\Controllers\Api\Warga\WargaDokumenController::class, 'destroy']);
    Route::get('/warga/dokumen/signed-url', [\App\Http\Controllers\Api\Warga\WargaDokumenController::class, 'getSignedUrl']);

    // Verifikasi & Aksi Ketua RT
    Route::middleware('role:rt')->group(function () {
        Route::post('/surats/{id}/approve-rt', [RtSuratController::class, 'approveRt']);
        Route::post('/surats/{id}/rt-action', [RtSuratController::class, 'handleAction']);
    });

    // Verifikasi Ketua RW
    Route::middleware('role:rw')->group(function () {
        Route::post('/surats/{id}/approve-rw', [RwSuratController::class, 'approveRw']);
    });

    // Verifikasi & Pemrosesan Berkas oleh Sekdes
    Route::middleware('role:sekdes')->group(function () {
        Route::post('/surats/{id}/process-sekdes', [SekdesSuratController::class, 'processSekdes']);
    });

    // Persetujuan & Pengesahan Digital oleh Kepala Desa
    Route::middleware('role:kades')->group(function () {
        Route::post('/surats/{id}/approve-kades', [\App\Http\Controllers\Api\Kades\KadesSuratController::class, 'approve']);
        Route::post('/surats/{id}/reject-kades', [\App\Http\Controllers\Api\Kades\KadesSuratController::class, 'reject']);
    });

    // Penolakan Surat Berdasarkan Role Petugas
    Route::middleware('role:rt,rw,sekdes,kades')->post('/surats/{id}/reject', function (Request $request, $id) {
        $user = $request->user();
        if ($user->hasRole('rt')) {
            return app(RtSuratController::class)->reject($request, $id);
        } elseif ($user->hasRole('rw')) {
            return app(RwSuratController::class)->reject($request, $id);
        } elseif ($user->hasRole('kades')) {
            return app(\App\Http\Controllers\Api\Kades\KadesSuratController::class)->reject($request, $id);
        }
        return app(SekdesSuratController::class)->reject($request, $id);
    });

    // kas dan keuangan RT (Api\Rt\KasRtController)
    Route::get('/kas-rt', [KasRtController::class, 'index']);
    Route::middleware('role:rt,rw,admin')->group(function () {
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
    Route::middleware('role:sekdes,kades,admin,admin_desa')->group(function () {
        Route::post('/bansos', [BansosController::class, 'store']);
        Route::get('/bansos/{id}', [BansosController::class, 'show']);
        Route::put('/bansos/{id}', [BansosController::class, 'update']);
        Route::post('/bansos/{id}/penerima', [BansosController::class, 'addPenerima']);
        Route::post('/bansos/{id}/publish-broadcast', [BansosController::class, 'publishAndBroadcast']);
        Route::post('/bansos/{id}/verify-disalurkan', [BansosController::class, 'verifyDisalurkan']);
    });

    // pengaturan desa & settings (Api\Admin\DesaSettingController)
    Route::middleware('role:admin,sekdes,kades')->put('/settings/desa', [DesaSettingController::class, 'updateSettings']);

    // data warga & kartu keluarga (Api\Admin\WargaController, Api\Rt\RtWargaController, Api\Rw\RwWargaController)
    Route::get('/warga', function (Request $request) {
        $user = $request->user();
        if ($user->hasRole('rt')) {
            return app(RtWargaController::class)->index($request);
        } elseif ($user->hasRole('rw')) {
            return app(RwWargaController::class)->index($request);
        }
        return app(AdminWargaController::class)->index($request);
    });
    Route::get('/warga/kartu-keluarga', function (Request $request) {
        $user = $request->user();
        if ($user->hasRole('rt')) {
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
        if ($user->hasRole('rt') || $user->hasRole('kades') || $user->hasRole('sekdes') || $user->hasRole('admin')) {
            return app(RtPengaduanController::class)->index($request);
        }
        return app(WargaPengaduanController::class)->index($request);
    });
    Route::get('/pengaduan/{id}', function (Request $request, $id) {
        $user = $request->user();
        if ($user->hasRole('warga')) {
            return app(WargaPengaduanController::class)->show($request, $id);
        }
        return app(RtPengaduanController::class)->show($request, $id);
    });
    Route::post('/pengaduan', [WargaPengaduanController::class, 'store']);
    Route::post('/pengaduan/{id}/respond', [RtPengaduanController::class, 'respond']);

    // Route groups for specific roles (Warga, RT, RW, Sekdes, Bendahara)
    Route::prefix('admin')->middleware('role:admin,admin_desa')->group(function () {
        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/roles', [AdminUserController::class, 'roles']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::put('/users/{id}', [AdminUserController::class, 'update']);
        Route::post('/users/{id}/toggle-status', [AdminUserController::class, 'toggleStatus']);
        Route::post('/users/{id}/reset-password', [AdminUserController::class, 'resetPassword']);

        Route::get('/stats', [AdminSystemController::class, 'stats']);
        Route::get('/activity-logs', [AdminSystemController::class, 'activityLogs']);
        Route::get('/backup', [AdminSystemController::class, 'backupDatabase']);
        Route::post('/restore', [AdminSystemController::class, 'restoreDatabase']);
        Route::get('/security', [AdminSystemController::class, 'securityStatus']);
        Route::post('/security/revoke-tokens', [AdminSystemController::class, 'revokeTokens']);

        Route::get('/warga', [AdminWargaController::class, 'index']);
        Route::get('/warga/kartu-keluarga', [AdminWargaController::class, 'getKartuKeluargas']);
        Route::get('/wilayah', [AdminWargaController::class, 'getWilayah']);
    });

    Route::prefix('warga')->middleware('role:warga')->group(function () {
        Route::get('/surats', [WargaSuratController::class, 'index']);
        Route::post('/surats', [WargaSuratController::class, 'store']);
        Route::put('/surats/{id}', [WargaSuratController::class, 'update']);
        Route::delete('/surats/{id}', [WargaSuratController::class, 'destroy']);
        Route::get('/pengaduan', [WargaPengaduanController::class, 'index']);
        Route::get('/pengaduan/{id}', [WargaPengaduanController::class, 'show']);
        Route::post('/pengaduan', [WargaPengaduanController::class, 'store']);
    });

    Route::prefix('rt')->middleware('role:rt')->group(function () {
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

    Route::prefix('rw')->middleware('role:rw')->group(function () {
        Route::get('/surats', [RwSuratController::class, 'index']);
        Route::post('/surats/{id}/approve', [RwSuratController::class, 'approveRw']);
        Route::post('/surats/{id}/reject', [RwSuratController::class, 'reject']);
        Route::get('/warga', [RwWargaController::class, 'index']);
        Route::get('/kartu-keluarga', [RwWargaController::class, 'getKartuKeluargas']);
        Route::get('/rts', [RwWargaController::class, 'getRts']);
        Route::get('/kas', [KasRtController::class, 'index']);
        Route::post('/kas/transaksi', [KasRtController::class, 'store']);
        Route::get('/kas/status', [KasRtController::class, 'getRwKasStatus']);
        Route::post('/kas/request-activation', [KasRtController::class, 'requestRwActivation']);
    });

    Route::prefix('sekdes')->middleware('role:sekdes,admin,admin_desa,kades')->group(function () {
        Route::get('/surats', [SekdesSuratController::class, 'index']);
        Route::post('/surats/{id}/process', [SekdesSuratController::class, 'processSekdes']);
        Route::post('/surats/{id}/reject', [SekdesSuratController::class, 'reject']);
        Route::get('/bansos', [BansosController::class, 'index']);
        Route::put('/bansos/{id}', [BansosController::class, 'update']);
        Route::post('/bansos/{id}/broadcast', [BansosController::class, 'publishAndBroadcast']);
        Route::post('/rw-kas/{id}/review', [KasRtController::class, 'reviewRwActivation']);
        Route::put('/settings/desa', [DesaSettingController::class, 'updateSettings']);
        
        // Penomoran & Format Surat Desa
        Route::get('/surat-types', [\App\Http\Controllers\Api\Sekdes\SuratSettingController::class, 'index']);
        Route::put('/surat-types/{id}', [\App\Http\Controllers\Api\Sekdes\SuratSettingController::class, 'update']);
        Route::get('/surat-types/{id}/preview', [\App\Http\Controllers\Api\Sekdes\SuratSettingController::class, 'preview']);

        // Pendaftaran Warga oleh Desa
        Route::get('/warga', [\App\Http\Controllers\Api\Sekdes\WargaManagementController::class, 'index']);
        Route::get('/warga/{id}', [\App\Http\Controllers\Api\Sekdes\WargaManagementController::class, 'show']);
        Route::post('/warga', [\App\Http\Controllers\Api\Sekdes\WargaManagementController::class, 'store']);

        // Penerbitan Surat Langsung / Loket Mandiri Desa
        Route::post('/surats/direct', [SekdesSuratController::class, 'createDirectSurat']);

        // Buku Mutasi Penduduk Desa 
        Route::get('/mutasi', [\App\Http\Controllers\Api\Sekdes\MutasiPendudukController::class, 'index']);
        Route::post('/mutasi', [\App\Http\Controllers\Api\Sekdes\MutasiPendudukController::class, 'store']);
        Route::delete('/mutasi/{id}', [\App\Http\Controllers\Api\Sekdes\MutasiPendudukController::class, 'destroy']);
    });

    Route::prefix('bendahara')->middleware('role:bendahara_desa,bendahara,sekdes,kades,admin')->group(function () {
        Route::get('/apbdes/summary', [ApbdesController::class, 'publicSummary']);
        Route::get('/apbdes/categories', [ApbdesController::class, 'getCategories']);
        Route::post('/apbdes/records', [ApbdesController::class, 'store']);
        Route::put('/apbdes/records/{id}', [ApbdesController::class, 'update']);
        Route::delete('/apbdes/records/{id}', [ApbdesController::class, 'destroy']);
    });

    Route::get('/kades/keputusan', [KadesKeputusanController::class, 'index']);
    Route::prefix('kades')->middleware('role:kades,admin,admin_desa,super_admin')->group(function () {
        Route::get('/surats', [\App\Http\Controllers\Api\Kades\KadesSuratController::class, 'index']);
        Route::post('/surats/{id}/approve', [\App\Http\Controllers\Api\Kades\KadesSuratController::class, 'approve']);
        Route::post('/surats/{id}/reject', [\App\Http\Controllers\Api\Kades\KadesSuratController::class, 'reject']);

        Route::get('/pengumumans', [\App\Http\Controllers\Api\Kades\KadesPengumumanController::class, 'index']);
        Route::post('/pengumumans/{id}/approve', [\App\Http\Controllers\Api\Kades\KadesPengumumanController::class, 'approve']);
        Route::post('/pengumumans/{id}/reject', [\App\Http\Controllers\Api\Kades\KadesPengumumanController::class, 'reject']);

        Route::get('/keputusan', [KadesKeputusanController::class, 'index']);
        Route::post('/keputusan', [KadesKeputusanController::class, 'store']);
        Route::get('/keputusan/{id}', [KadesKeputusanController::class, 'show']);
        Route::put('/keputusan/{id}', [KadesKeputusanController::class, 'update']);
        Route::post('/rw-kas/{id}/review', [KasRtController::class, 'reviewRwActivation']);
    });

    // Platform Super Admin
    Route::prefix('super-admin')->middleware('role:super_admin')->group(function () {
        Route::get('/desas', [\App\Http\Controllers\Api\SuperAdmin\SuperAdminTenantController::class, 'index']);
        Route::post('/desas', [\App\Http\Controllers\Api\SuperAdmin\SuperAdminTenantController::class, 'store']);
        Route::get('/desas/{id}', [\App\Http\Controllers\Api\SuperAdmin\SuperAdminTenantController::class, 'show']);
        Route::put('/desas/{id}', [\App\Http\Controllers\Api\SuperAdmin\SuperAdminTenantController::class, 'update']);
    });
});

