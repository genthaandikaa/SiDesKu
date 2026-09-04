<?php

use App\Http\Controllers\Api\ApbdesController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BansosController;
use App\Http\Controllers\Api\DesaSettingController;
use App\Http\Controllers\Api\KasRtController;
use App\Http\Controllers\Api\PengaduanController;
use App\Http\Controllers\Api\PublicInfoController;
use App\Http\Controllers\Api\SuratController;
use App\Http\Controllers\Api\WargaController;
use Illuminate\Support\Facades\Route;

// Public Routes (No Authentication Required)
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/settings/desa', [DesaSettingController::class, 'getSettings']);
Route::get('/public/surat/track', [SuratController::class, 'trackPublic']);
Route::get('/public/surat/verify-qr/{hash}', [SuratController::class, 'verifyQr']);
Route::get('/public/surat/qr/{hash?}', [SuratController::class, 'getQrCodeSvg']);
Route::get('/public/apbdes/summary', [ApbdesController::class, 'publicSummary']);
Route::get('/public/beritas', [PublicInfoController::class, 'getBeritas']);
Route::get('/public/pengumumans', [PublicInfoController::class, 'getPengumumans']);
Route::get('/public/stats', [PublicInfoController::class, 'getVillageStats']);
Route::get('/surat-types', [SuratController::class, 'getTypes']);

// Protected Routes (Authentication Required)
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::match(['put', 'post'], '/auth/profile', [AuthController::class, 'updateProfile']);
    Route::match(['put', 'post'], '/auth/password', [AuthController::class, 'updatePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Desa Settings & Kop Surat Configuration (Admin / Sekdes / Kades)
    Route::put('/settings/desa', [DesaSettingController::class, 'updateSettings']);

    // Persuratan Digital Workflow
    Route::get('/surats', [SuratController::class, 'index']);
    Route::post('/surats', [SuratController::class, 'store']);
    Route::get('/surats/{id}', [SuratController::class, 'show']);
    Route::post('/surats/{id}/approve-rt', [SuratController::class, 'approveRt']);
    Route::post('/surats/{id}/approve-rw', [SuratController::class, 'approveRw']);
    Route::post('/surats/{id}/process-sekdes', [SuratController::class, 'processSekdes']);
    Route::post('/surats/{id}/reject', [SuratController::class, 'reject']);

    // APBDes Keuangan Desa (Bendahara Desa / Kades / Sekdes)
    Route::get('/apbdes/categories', [ApbdesController::class, 'getCategories']);
    Route::post('/apbdes/records', [ApbdesController::class, 'store']);
    Route::put('/apbdes/records/{id}', [ApbdesController::class, 'update']);
    Route::delete('/apbdes/records/{id}', [ApbdesController::class, 'destroy']);

    // Kas Keuangan RT (Bendahara RT / Ketua RT)
    Route::get('/kas-rt', [KasRtController::class, 'index']);
    Route::post('/kas-rt/categories', [KasRtController::class, 'storeCategory']);
    Route::post('/kas-rt/transactions', [KasRtController::class, 'store']);

    // Bansos & WhatsApp Broadcast (Desa / Sekdes / Admin)
    Route::get('/bansos', [BansosController::class, 'index']);
    Route::post('/bansos', [BansosController::class, 'store']);
    Route::get('/bansos/{id}', [BansosController::class, 'show']);
    Route::post('/bansos/{id}/penerima', [BansosController::class, 'addPenerima']);
    Route::post('/bansos/{id}/publish-broadcast', [BansosController::class, 'publishAndBroadcast']);
    Route::post('/bansos/{id}/verify-disalurkan', [BansosController::class, 'verifyDisalurkan']);

    // Data Kependudukan & Wilayah
    Route::get('/warga', [WargaController::class, 'index']);
    Route::get('/warga/kartu-keluarga', [WargaController::class, 'getKartuKeluargas']);
    Route::get('/wilayah', [WargaController::class, 'getWilayah']);

    // Pengaduan Warga
    Route::get('/pengaduan', [PengaduanController::class, 'index']);
    Route::post('/pengaduan', [PengaduanController::class, 'store']);
    Route::post('/pengaduan/{id}/respond', [PengaduanController::class, 'respond']);

    // Notifikasi & Activity Logs
    Route::get('/notifikasi-logs', [PublicInfoController::class, 'getNotifikasiLogs']);
});
