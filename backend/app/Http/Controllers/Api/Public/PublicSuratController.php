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
    public function getTypes(Request $request): JsonResponse
    {
        $user = $request->user('sanctum');
        $desaId = $user && $user->desa_id ? (int) $user->desa_id : (int) ($request->query('desa_id') ?? 1);
        $types = SuratType::withoutGlobalScope('tenant')
            ->where('desa_id', $desaId)
            ->where('is_active', true)
            ->orderBy('id')
            ->get();
        return response()->json(['success' => true, 'data' => $types]);
    }

    public function trackPublic(Request $request): JsonResponse
    {
        $keyword = trim((string) $request->query('keyword', ''));

        if (empty($keyword)) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor resi atau kode pelacakan valid wajib diisi.',
            ], 422);
        }

        // Exact match on official tracking identifiers only (anti-harvesting / anti-PII disclosure)
        $query = SuratRequest::with(['suratType', 'wargaProfile', 'trackings'])
            ->where(function ($q) use ($keyword) {
                $q->where('nomor_resi', $keyword)
                  ->orWhere('qr_verification_hash', $keyword)
                  ->orWhere('nomor_surat_resmi', $keyword);
            });

        $surats = $query->orderBy('created_at', 'desc')->take(5)->get();

        $mapped = $surats->map(function ($surat) {
            return [
                'id' => $surat->id,
                'nomor_resi' => $surat->nomor_resi,
                'nomor_surat_resmi' => $surat->nomor_surat_resmi,
                'status' => $surat->status,
                'keperluan' => $surat->keperluan,
                'qr_verification_hash' => $surat->qr_verification_hash,
                'created_at' => $surat->created_at,
                'updated_at' => $surat->updated_at,
                'surat_type' => $surat->suratType ? [
                    'id' => $surat->suratType->id,
                    'nama_surat' => $surat->suratType->nama_surat,
                    'kode_surat' => $surat->suratType->kode_surat,
                ] : null,
                'warga_profile' => $surat->wargaProfile ? [
                    'nama_lengkap' => $this->maskName($surat->wargaProfile->nama_lengkap),
                ] : null,
                'trackings' => $surat->trackings->map(function ($t) {
                    return [
                        'id' => $t->id,
                        'status_stage' => $t->status_stage,
                        'status_action' => $t->status_action,
                        'catatan' => $t->catatan,
                        'created_at' => $t->created_at,
                    ];
                }),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $mapped,
        ]);
    }

    public function verifyQr($hash): JsonResponse
    {
        $surat = SuratRequest::withoutGlobalScope('tenant')
            ->with(['suratType', 'wargaProfile.rt.rw.dusun', 'trackings.actorUser.role'])
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

        $desa = DesaSetting::withoutGlobalScope('tenant')->where('desa_id', $surat->desa_id)->first()
            ?? DesaSetting::first();

        // Safe DTO: Mask PII (NIK & Name) and strictly omit documents/photos/phone
        $safeSurat = [
            'id' => $surat->id,
            'nomor_resi' => $surat->nomor_resi,
            'nomor_surat_resmi' => $surat->nomor_surat_resmi,
            'status' => $surat->status,
            'keperluan' => $surat->keperluan,
            'qr_verification_hash' => $surat->qr_verification_hash,
            'created_at' => $surat->created_at,
            'surat_type' => $surat->suratType ? [
                'id' => $surat->suratType->id,
                'nama_surat' => $surat->suratType->nama_surat,
                'kode_surat' => $surat->suratType->kode_surat,
            ] : null,
            'warga_profile' => $surat->wargaProfile ? [
                'nama_lengkap' => $this->maskName($surat->wargaProfile->nama_lengkap),
                'nik' => $this->maskNik($surat->wargaProfile->nik),
                'rt' => $surat->wargaProfile->rt ? [
                    'nomor_rt' => $surat->wargaProfile->rt->nomor_rt,
                    'rw' => $surat->wargaProfile->rt->rw ? [
                        'nomor_rw' => $surat->wargaProfile->rt->rw->nomor_rw,
                        'dusun' => $surat->wargaProfile->rt->rw->dusun ? [
                            'nama_dusun' => $surat->wargaProfile->rt->rw->dusun->nama_dusun,
                        ] : null,
                    ] : null,
                ] : null,
            ] : null,
        ];

        $isCompleted = ($surat->status === 'completed');
        $message = match ($surat->status) {
            'completed' => 'Dokumen Asli dan Terdaftar Resmi di Buku Register Desa',
            'rejected' => 'Dokumen Tidak Sah: Permohonan surat ini telah ditolak oleh Pemerintah Desa.',
            default => 'Dokumen Belum Sah: Permohonan surat masih dalam proses (' . $surat->status . ') dan belum diterbitkan resmi oleh Balai Desa.',
        };

        $statusTte = match ($surat->status) {
            'completed' => 'TERTANDA SECARA ELEKTRONIK SAH',
            'rejected' => 'DITOLAK / TIDAK BERLAKU',
            default => 'DALAM PROSES / BELUM TERBIT',
        };

        return response()->json([
            'success' => true,
            'valid' => $isCompleted,
            'status_surat' => $surat->status,
            'message' => $message,
            'data' => $safeSurat,
            'desa' => $desa,
            'legalitas' => [
                'penandatangan' => ($desa ? $desa->nama_kades : 'Drs. H. Bambang Prasetyo, M.Si') . ' (Kepala Desa Doko / Lurah)',
                'nip' => $desa ? $desa->nip_kades : '19680514 199403 1 004',
                'payung_hukum' => 'Sah secara administrasi desa berdasarkan verifikasi registrasi digital SiDesKu dan Permendagri No. 2/2019 tentang Tata Naskah Dinas Desa.',
                'keterangan' => 'Dokumen bertanda tangan Barcode & QR Code ini terdaftar resmi dalam arsip persuratan digital Pemerintah Desa.',
                'status_tte' => $statusTte,
            ],
        ]);
    }

    private function maskName(?string $name): string
    {
        if (!$name) {
            return 'Warga';
        }
        $words = preg_split('/\s+/', trim($name));
        $maskedWords = [];
        foreach ($words as $word) {
            $len = mb_strlen($word);
            if ($len <= 2) {
                $maskedWords[] = mb_substr($word, 0, 1) . '*';
            } else {
                $maskedWords[] = mb_substr($word, 0, 1) . str_repeat('*', min(4, $len - 2)) . mb_substr($word, -1, 1);
            }
        }
        return implode(' ', $maskedWords);
    }

    private function maskNik(?string $nik): string
    {
        if (!$nik) {
            return '****************';
        }
        $len = strlen($nik);
        if ($len <= 6) {
            return str_repeat('*', $len);
        }
        return substr($nik, 0, 4) . str_repeat('*', max(4, $len - 8)) . substr($nik, -4);
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
        $safeCodeText = htmlspecialchars(strip_tags((string) $codeText), ENT_XML1 | ENT_QUOTES, 'UTF-8');

        $svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{$totalWidth}\" height=\"68\" viewBox=\"0 0 {$totalWidth} 68\">
            <rect width=\"100%\" height=\"100%\" fill=\"#ffffff\" rx=\"6\" />
            {$rects}
            <text x=\"{$textX}\" y=\"61\" font-family=\"monospace\" font-size=\"9\" font-weight=\"bold\" fill=\"#334155\" text-anchor=\"middle\" letter-spacing=\"1\">{$safeCodeText}</text>
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
