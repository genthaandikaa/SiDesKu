<?php

namespace App\Http\Controllers\Api\Sekdes;

use App\Http\Controllers\Controller;
use App\Models\NotifikasiLog;
use App\Models\SuratRequest;
use App\Models\SuratTracking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SekdesSuratController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $surats = SuratRequest::with(['suratType', 'wargaProfile.rt.rw', 'trackings.actorUser.role'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $surats,
        ]);
    }

    public function processSekdes(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        // 1. Otorisasi role: Hanya Sekdes
        if (!$user->hasRole('sekdes')) {
            return response()->json([
                'success' => false,
                'message' => 'Admin Sistem dan peran lain tidak memiliki kewenangan memproses surat atas nama Sekretaris Desa.',
            ], 403);
        }

        $surat = SuratRequest::withoutGlobalScope('tenant')->with(['suratType', 'wargaProfile'])->findOrFail($id);
        \App\Services\TenantSecurityService::validateSurat($user, $surat);

        // 2. Validasi State Machine: Hanya surat yang sudah disetujui RT (processed_sekdes / approved_rt) atau perlu perbaikan kades yang dapat diproses
        if (!in_array($surat->status, ['processed_sekdes', 'approved_rt', 'rejected_kades'])) {
            return response()->json([
                'success' => false,
                'message' => 'Surat dengan status "' . $surat->status . '" tidak dapat diproses oleh Sekdes. Surat harus disetujui terlebih dahulu oleh Ketua RT atau menunggu perbaikan dari Kades.',
            ], 422);
        }

        // Ambil jenis surat
        $suratType = $surat->suratType;
        
        // Cek apakah nomor manual dikirim dari modal konfirmasi desa
        if ($request->filled('nomor_surat_resmi')) {
            $nomorResmi = trim($request->input('nomor_surat_resmi'));
            if ($suratType) {
                $suratType->increment('nomor_terakhir');
            }
        } elseif (!empty($surat->nomor_surat_resmi)) {
            $nomorResmi = $surat->nomor_surat_resmi;
        } elseif ($suratType) {
            $nextSeq = ($suratType->nomor_terakhir ?? 0) + 1;
            $nomorResmi = \App\Services\LetterNumberService::generateNumber($suratType, $nextSeq);
            $suratType->update(['nomor_terakhir' => $nextSeq]);
        } else {
            $countYear = SuratRequest::whereYear('created_at', date('Y'))->whereNotNull('nomor_surat_resmi')->count() + 1;
            $paddedNo = str_pad($countYear, 3, '0', STR_PAD_LEFT);
            $nomorResmi = "470/{$paddedNo}/418.66.04/" . date('Y');
        }

        $catatan = $request->input('catatan', 'Berkas administratif telah diverifikasi dan diajukan ke Kepala Desa untuk persetujuan & tanda tangan digital.');

        $surat->update([
            'nomor_surat_resmi' => $nomorResmi,
            'status' => 'pending_kades',
            'processed_sekdes_user_id' => $user->id,
            'processed_sekdes_at' => now(),
            'ttd_sekdes_at' => now(),
            'catatan_penolakan_kades' => null,
        ]);

        SuratTracking::create([
            'surat_request_id' => $surat->id,
            'actor_user_id' => $user->id,
            'status_stage' => 'Sekretaris Desa',
            'status_action' => 'Diajukan ke Kepala Desa',
            'catatan' => $catatan,
        ]);

        if ($surat->wargaProfile && $surat->wargaProfile->no_hp_wa) {
            $namaSurat = $suratType ? $suratType->nama_surat : 'Surat';
            NotifikasiLog::create([
                'user_id' => $surat->wargaProfile->user_id,
                'warga_profile_id' => $surat->wargaProfile->id,
                'nomor_tujuan' => $surat->wargaProfile->no_hp_wa,
                'jenis_notifikasi' => 'SURAT_PENDING_KADES',
                'judul' => 'Surat Menunggu Tanda Tangan Kepala Desa',
                'pesan' => "Halo {$surat->wargaProfile->nama_lengkap}, pengajuan surat {$namaSurat} ({$nomorResmi}) telah selesai diverifikasi oleh Sekdes dan kini menunggu persetujuan & tanda tangan resmi Kepala Desa.",
                'status_pengiriman' => 'TERKIRIM',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Surat berhasil diproses dan diajukan ke antrean persetujuan Kepala Desa.',
            'data' => $surat->fresh(['suratType', 'wargaProfile', 'trackings.actorUser.role']),
        ]);
    }

    public function reject(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        // 1. Otorisasi role: Hanya Sekdes
        if (!$user->hasRole('sekdes')) {
            return response()->json([
                'success' => false,
                'message' => 'Admin Sistem dan peran lain tidak memiliki kewenangan menolak surat atas nama Sekretaris Desa.',
            ], 403);
        }

        $request->validate([
            'alasan' => 'nullable|string|max:500',
            'catatan' => 'nullable|string|max:500',
        ]);

        $alasan = trim($request->input('alasan') ?: $request->input('catatan', 'Pengajuan surat ditolak oleh Pemerintah Desa.'));
        if (strlen($alasan) < 5) {
            return response()->json([
                'success' => false,
                'message' => 'Alasan penolakan surat minimal 5 karakter.',
            ], 422);
        }

        $surat = SuratRequest::with('wargaProfile')->findOrFail($id);

        if ($surat->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Surat yang sudah berstatus selesai (completed) tidak dapat ditolak secara langsung.',
            ], 422);
        }

        $surat->update([
            'status' => 'rejected',
            'catatan_penolakan' => $alasan,
        ]);

        SuratTracking::create([
            'surat_request_id' => $surat->id,
            'actor_user_id' => $user->id,
            'status_stage' => 'Sekretaris Desa',
            'status_action' => 'Ditolak',
            'catatan' => 'Alasan: ' . $alasan,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permohonan surat telah ditolak dengan catatan perbaikan.',
            'data' => $surat->fresh(['trackings.actorUser']),
        ]);
    }

    /**
     * Penerbitan Surat Mandiri & Cepat oleh Balai Desa (Loket Pelayanan Langsung)
     */
    public function createDirectSurat(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasRole('sekdes')) {
            return response()->json([
                'success' => false,
                'message' => 'Admin Sistem dan peran lain tidak berwenang menerbitkan surat atas nama Sekdes.',
            ], 403);
        }

        $validated = $request->validate([
            'warga_profile_id' => 'required|exists:warga_profiles,id',
            'surat_type_id' => 'required|exists:surat_types,id',
            'keperluan' => 'required|string|max:500',
            'form_data' => 'nullable|array',
            'keterangan_loket' => 'nullable|string|max:255',
        ]);

        $suratType = \App\Models\SuratType::findOrFail($validated['surat_type_id']);
        $wargaProfile = \App\Models\WargaProfile::findOrFail($validated['warga_profile_id']);

        // Generate nomor resi
        $today = date('Ymd');
        $random = strtoupper(\Illuminate\Support\Str::random(4));
        $nomorResi = "REQ-{$today}-{$random}";

        // Generate verification hash
        $hashData = $nomorResi . '|' . $wargaProfile->nik . '|' . now()->toIso8601String();
        $qrHash = hash('sha256', $hashData);

        // Generate official letter number
        $nextSeq = ($suratType->nomor_terakhir ?? 0) + 1;
        $nomorResmi = \App\Services\LetterNumberService::generateNumber($suratType, $nextSeq);
        $suratType->update(['nomor_terakhir' => $nextSeq]);

        // Buat record surat diajukan ke antrean persetujuan Kades
        $surat = SuratRequest::create([
            'nomor_resi' => $nomorResi,
            'nomor_surat_resmi' => $nomorResmi,
            'qr_verification_hash' => $qrHash,
            'warga_profile_id' => $wargaProfile->id,
            'surat_type_id' => $suratType->id,
            'keperluan' => $validated['keperluan'],
            'form_data_json' => !empty($validated['form_data']) ? $validated['form_data'] : null,
            'status' => 'pending_kades',
            'processed_sekdes_user_id' => $user->id,
            'processed_sekdes_at' => now(),
            'ttd_sekdes_at' => now(),
        ]);

        // Trackings
        SuratTracking::create([
            'surat_request_id' => $surat->id,
            'actor_user_id' => $user->id,
            'status_stage' => 'Loket Pelayanan Desa',
            'status_action' => 'Diajukan',
            'catatan' => $validated['keterangan_loket'] ?? 'Penerbitan surat mandiri via Loket Pelayanan Balai Desa',
        ]);

        SuratTracking::create([
            'surat_request_id' => $surat->id,
            'actor_user_id' => $user->id,
            'status_stage' => 'Sekretaris Desa',
            'status_action' => 'Diajukan ke Kepala Desa',
            'catatan' => "Surat loket desa telah disiapkan Sekdes dengan nomor {$nomorResmi} dan diajukan ke Kepala Desa untuk pengesahan & tanda tangan digital.",
        ]);

        if ($wargaProfile->no_hp_wa) {
            $namaSurat = $suratType->nama_surat ?? 'Surat';
            NotifikasiLog::create([
                'user_id' => $wargaProfile->user_id,
                'warga_profile_id' => $wargaProfile->id,
                'nomor_tujuan' => $wargaProfile->no_hp_wa,
                'jenis_notifikasi' => 'SURAT_PENDING_KADES',
                'judul' => 'Surat Loket Menunggu Tanda Tangan Kepala Desa',
                'pesan' => "Halo {$wargaProfile->nama_lengkap}, surat permohonan {$namaSurat} ({$nomorResmi}) telah diproses via Loket Desa dan kini diajukan ke Kepala Desa untuk tanda tangan digital.",
                'status_pengiriman' => 'TERKIRIM',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => "Surat loket desa {$suratType->nama_surat} berhasil disiapkan dan diajukan ke Kepala Desa.",
            'data' => $surat->load(['suratType', 'wargaProfile.rt.rw', 'trackings.actorUser.role']),
        ], 201);
    }
}

