<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\DesaSetting;
use App\Models\SuratRequest;
use App\Models\SuratType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class PublicSuratController extends Controller
{
    public function getTypes(): JsonResponse
    {
        $types = SuratType::where('is_active', true)->get();
        return response()->json(['success' => true, 'data' => $types]);
    }

    public function trackPublic(Request $request): JsonResponse
    {
        $keyword = $request->query('keyword');

        $query = SuratRequest::with(['suratType', 'wargaProfile.rt.rw.dusun', 'trackings.actorUser.role']);

        if ($keyword) {
            $query->where('nomor_resi', $keyword)
                ->orWhere('qr_verification_hash', $keyword)
                ->orWhere('nomor_surat_resmi', $keyword)
                ->orWhereHas('wargaProfile', function ($q) use ($keyword) {
                    $q->where('nik', $keyword)
                      ->orWhere('nama_lengkap', 'like', "%{$keyword}%");
                });
        }

        $surats = $query->orderBy('created_at', 'desc')->take(10)->get();

        return response()->json([
            'success' => true,
            'data' => $surats,
        ]);
    }

    public function verifyQr($hash): JsonResponse
    {
        $surat = SuratRequest::with(['suratType', 'wargaProfile.rt.rw.dusun', 'trackings.actorUser.role'])
            ->where('qr_verification_hash', $hash)
            ->orWhere('nomor_resi', $hash)
            ->first();

        if (!$surat) {
            return response()->json([
                'success' => false,
                'valid' => false,
                'message' => 'Dokumen tidak valid atau tanda tangan digital tidak terdaftar di arsip Pemerintah Desa.',
            ], 404);
        }

        $desa = DesaSetting::first();

        return response()->json([
            'success' => true,
            'valid' => true,
            'message' => 'Dokumen Asli dan Terdaftar Resmi di Buku Register Desa',
            'data' => $surat,
            'desa' => $desa,
        ]);
    }

    public function getQrCodeSvg(Request $request, $hash = null)
    {
        $targetHash = $hash ?: $request->query('data', 'DESA-DOKO-VERIFIED');

        $surat = SuratRequest::where('qr_verification_hash', $targetHash)
            ->orWhere('nomor_resi', $targetHash)
            ->first();

        $verifyHash = $surat ? $surat->qr_verification_hash : $targetHash;
        $frontendUrl = config('app.frontend_url', 'http://localhost:5174');
        $verifyUrl = "{$frontendUrl}/lacak?hash={$verifyHash}";

        $svg = QrCode::format('svg')
            ->size(500)
            ->errorCorrection('M')
            ->margin(2)
            ->color(11, 47, 33)
            ->backgroundColor(255, 255, 255)
            ->generate($verifyUrl);

        return response($svg)
            ->header('Content-Type', 'image/svg+xml')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
            ->header('Pragma', 'no-cache')
            ->header('Expires', '0');
    }
}
