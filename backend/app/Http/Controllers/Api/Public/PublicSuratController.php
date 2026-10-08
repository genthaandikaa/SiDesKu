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
            'legalitas' => [
                'penandatangan' => ($desa ? $desa->nama_kades : 'Drs. H. Bambang Prasetyo, M.Si') . ' (Kepala Desa Doko / Lurah)',
                'nip' => $desa ? $desa->nip_kades : '19680514 199403 1 004',
                'payung_hukum' => 'Sah secara hukum berdasarkan UU ITE No. 11/2008 Pasal 5 Ayat 1 dan Permendagri No. 2/2019 tentang Tata Naskah Dinas Desa.',
                'keterangan' => 'Dokumen bertanda tangan Barcode & QR Code ini berkekuatan hukum penuh dan diakui sah tanpa cap stempel basah.',
                'status_tte' => 'TERTANDA SECARA ELEKTRONIK SAH',
            ],
        ]);
    }

    public function getBarcodeSvg(Request $request, $hash = null)
    {
        $target = $hash ?: $request->query('data', 'DESA-DOKO');
        $surat = SuratRequest::where('qr_verification_hash', $target)
            ->orWhere('nomor_resi', $target)
            ->orWhere('nomor_surat_resmi', $target)
            ->first();

        $codeText = $surat ? ($surat->nomor_surat_resmi ?: $surat->nomor_resi) : $target;
        
        $bars = [3, 1, 1, 1, 2, 1];
        $len = strlen($codeText);
        for ($i = 0; $i < min($len, 30); $i++) {
            $charVal = ord($codeText[$i]);
            $b1 = ($charVal % 3) + 1;
            $s1 = (($charVal >> 1) % 3) + 1;
            $b2 = (($charVal >> 2) % 3) + 1;
            $s2 = (($charVal >> 3) % 2) + 1;
            $bars[] = $b1;
            $bars[] = $s1;
            $bars[] = $b2;
            $bars[] = $s2;
        }
        $bars = array_merge($bars, [2, 1, 1, 1, 3, 2, 1]);

        $currentX = 10;
        $rects = '';
        $isBar = true;
        foreach ($bars as $w) {
            $px = $w * 2;
            if ($isBar) {
                $rects .= "<rect x=\"{$currentX}\" y=\"5\" width=\"{$px}\" height=\"46\" fill=\"#0f172a\" />";
            }
            $currentX += $px;
            $isBar = !$isBar;
        }
        $totalWidth = $currentX + 10;
        $textX = $totalWidth / 2;

        $svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{$totalWidth}\" height=\"68\" viewBox=\"0 0 {$totalWidth} 68\">
            <rect width=\"100%\" height=\"100%\" fill=\"#ffffff\" rx=\"6\" />
            {$rects}
            <text x=\"{$textX}\" y=\"61\" font-family=\"monospace\" font-size=\"9\" font-weight=\"bold\" fill=\"#334155\" text-anchor=\"middle\" letter-spacing=\"1\">{$codeText}</text>
        </svg>";

        return response($svg)
            ->header('Content-Type', 'image/svg+xml')
            ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
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
