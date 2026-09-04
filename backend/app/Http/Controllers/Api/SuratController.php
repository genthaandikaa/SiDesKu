<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DesaSetting;
use App\Models\NotifikasiLog;
use App\Models\SuratRequest;
use App\Models\SuratTracking;
use App\Models\SuratType;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SuratController extends Controller
{
    public function getTypes(): JsonResponse
    {
        $types = SuratType::where('is_active', true)->get();
        return response()->json(['success' => true, 'data' => $types]);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('role', 'wargaProfile.rt.rw');
        $query = SuratRequest::with(['suratType', 'wargaProfile.rt.rw', 'trackings.actorUser.role']);

        // Role-based filtering
        if ($user->hasRole('warga')) {
            if (!$user->wargaProfile) {
                return response()->json(['success' => true, 'data' => []]);
            }
            $query->where('warga_profile_id', $user->wargaProfile->id);
        } elseif ($user->hasRole('rt') || $user->hasRole('sekretaris_rt') || $user->hasRole('bendahara_rt')) {
            // Filter by RT where user is assigned or profile RT
            $rtId = $user->wargaProfile ? $user->wargaProfile->rt_id : 1;
            $query->whereHas('wargaProfile', function ($q) use ($rtId) {
                $q->where('rt_id', $rtId);
            });
        } elseif ($user->hasRole('rw')) {
            $rwId = $user->wargaProfile && $user->wargaProfile->rt ? $user->wargaProfile->rt->rw_id : 1;
            $query->whereHas('wargaProfile.rt', function ($q) use ($rwId) {
                $q->where('rw_id', $rwId);
            })->whereIn('status', ['approved_rt', 'pending_rw', 'approved_rw', 'processed_sekdes', 'completed', 'rejected']);
        }

        $surats = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $surats,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile');
        if (!$user->wargaProfile) {
            return response()->json([
                'success' => false,
                'message' => 'Profil kependudukan warga Anda belum terdaftar.',
            ], 422);
        }

        $validated = $request->validate([
            'surat_type_id' => 'required|exists:surat_types,id',
            'keperluan' => 'required|string|max:500',
            'form_data' => 'nullable|array',
            'file_lampiran' => 'nullable|string',
        ]);

        $resiCode = 'REQ-' . date('Ymd') . '-' . strtoupper(Str::random(6));
        $qrHash = hash('sha256', $resiCode . '|' . $user->wargaProfile->nik . '|' . microtime(true));

        $suratReq = SuratRequest::create([
            'nomor_resi' => $resiCode,
            'warga_profile_id' => $user->wargaProfile->id,
            'surat_type_id' => $validated['surat_type_id'],
            'status' => 'pending_rt',
            'keperluan' => $validated['keperluan'],
            'form_data_json' => $validated['form_data'] ?? [],
            'file_lampiran' => $validated['file_lampiran'] ?? null,
            'qr_verification_hash' => $qrHash,
        ]);

        SuratTracking::create([
            'surat_request_id' => $suratReq->id,
            'actor_user_id' => $user->id,
            'status_stage' => 'Warga',
            'status_action' => 'Diajukan',
            'catatan' => 'Permohonan surat berhasil dibuat secara online oleh pemohon.',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permohonan surat berhasil diajukan.',
            'data' => $suratReq->load(['suratType', 'wargaProfile', 'trackings']),
        ], 201);
    }

    public function show($id): JsonResponse
    {
        $surat = SuratRequest::with(['suratType', 'wargaProfile.rt.rw.dusun', 'wargaProfile.kartuKeluarga', 'trackings.actorUser.role'])->find($id);

        if (!$surat) {
            return response()->json(['success' => false, 'message' => 'Surat tidak ditemukan'], 404);
        }

        $desa = DesaSetting::first();

        return response()->json([
            'success' => true,
            'data' => $surat,
            'desa' => $desa,
        ]);
    }

    public function approveRt(Request $request, $id): JsonResponse
    {
        $surat = SuratRequest::with('wargaProfile')->findOrFail($id);
        $user = $request->user();

        $catatan = $request->input('catatan', 'Permohonan disetujui RT 01 dan diteruskan ke Kepala Desa untuk legalisasi & TTD digital.');

        $surat->update([
            'status' => 'processed_sekdes',
        ]);

        SuratTracking::create([
            'surat_request_id' => $surat->id,
            'actor_user_id' => $user->id,
            'status_stage' => 'Ketua RT',
            'status_action' => 'Disetujui',
            'catatan' => $catatan,
        ]);

        // Kirim Notifikasi WA ke Warga
        if ($surat->wargaProfile && $surat->wargaProfile->no_hp_wa) {
            NotifikasiLog::create([
                'user_id' => $surat->wargaProfile->user_id,
                'warga_profile_id' => $surat->wargaProfile->id,
                'nomor_tujuan' => $surat->wargaProfile->no_hp_wa,
                'jenis_notifikasi' => 'SURAT_APPROVED_RT',
                'judul' => 'Surat Disetujui RT',
                'pesan' => "Halo {$surat->wargaProfile->nama_lengkap}, pengajuan surat {$surat->nomor_resi} telah DISETUJUI oleh Ketua RT dan diteruskan ke Kepala Desa untuk penerbitan dokumen sah.",
                'status_pengiriman' => 'TERKIRIM',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Surat berhasil disetujui RT dan diteruskan ke Kepala Desa / Sekdes.',
            'data' => $surat->fresh(['trackings.actorUser']),
        ]);
    }

    public function approveRw(Request $request, $id): JsonResponse
    {
        $surat = SuratRequest::with('wargaProfile')->findOrFail($id);
        $user = $request->user();

        $catatan = $request->input('catatan', 'Verifikasi pengantar RW lengkap. Diteruskan ke Kantor Desa untuk legalisasi.');

        $surat->update([
            'status' => 'processed_sekdes',
        ]);

        SuratTracking::create([
            'surat_request_id' => $surat->id,
            'actor_user_id' => $user->id,
            'status_stage' => 'Ketua RW',
            'status_action' => 'Disetujui',
            'catatan' => $catatan,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Surat berhasil disetujui RW dan masuk antrean Sekretaris Desa.',
            'data' => $surat->fresh(['trackings.actorUser']),
        ]);
    }

    public function processSekdes(Request $request, $id): JsonResponse
    {
        $surat = SuratRequest::with(['suratType', 'wargaProfile'])->findOrFail($id);
        $user = $request->user();

        $countYear = SuratRequest::whereYear('created_at', date('Y'))->whereNotNull('nomor_surat_resmi')->count() + 1;
        $paddedNo = str_pad($countYear, 3, '0', STR_PAD_LEFT);
        
        $format = $surat->suratType->format_nomor ?: '470/{NO}/418.66.04/{TAHUN}';
        $nomorResmi = str_replace(['{NO}', '{TAHUN}'], [$paddedNo, date('Y')], $format);

        $surat->update([
            'nomor_surat_resmi' => $nomorResmi,
            'status' => 'completed',
            'ttd_sekdes_at' => now(),
            'ttd_kades_at' => now(),
        ]);

        SuratTracking::create([
            'surat_request_id' => $surat->id,
            'actor_user_id' => $user->id,
            'status_stage' => 'Kepala Desa / Sekdes',
            'status_action' => 'Ditandatangani',
            'catatan' => "Surat resmi diterbitkan dengan nomor {$nomorResmi} dan dilegalisasi stempel QR digital sah Kepala Desa.",
        ]);

        // WhatsApp notification ready
        if ($surat->wargaProfile && $surat->wargaProfile->no_hp_wa) {
            NotifikasiLog::create([
                'user_id' => $surat->wargaProfile->user_id,
                'warga_profile_id' => $surat->wargaProfile->id,
                'nomor_tujuan' => $surat->wargaProfile->no_hp_wa,
                'jenis_notifikasi' => 'SURAT_READY',
                'judul' => 'Surat Selesai & Sah',
                'pesan' => "Halo {$surat->wargaProfile->nama_lengkap}, surat permohonan {$surat->suratType->nama_surat} ({$nomorResmi}) telah SELESAI dan disahkan dengan tanda tangan QR resmi. Anda dapat mengunduh dokumen PDF sah di portal SIDes.",
                'status_pengiriman' => 'TERKIRIM',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Surat resmi berhasil diterbitkan dan siap diunduh oleh warga.',
            'data' => $surat->fresh(['trackings.actorUser']),
        ]);
    }

    public function reject(Request $request, $id): JsonResponse
    {
        $request->validate([
            'alasan' => 'required|string|max:500',
        ]);

        $surat = SuratRequest::with('wargaProfile')->findOrFail($id);
        $user = $request->user()->load('role');

        $surat->update([
            'status' => 'rejected',
            'catatan_penolakan' => $request->alasan,
        ]);

        SuratTracking::create([
            'surat_request_id' => $surat->id,
            'actor_user_id' => $user->id,
            'status_stage' => $user->role ? $user->role->display_name : 'Petugas',
            'status_action' => 'Ditolak',
            'catatan' => 'Alasan: ' . $request->alasan,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permohonan surat telah ditolak dengan catatan perbaikan.',
            'data' => $surat->fresh(['trackings.actorUser']),
        ]);
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

        $svg = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')
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
