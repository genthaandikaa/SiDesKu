<?php

namespace App\Http\Controllers\Api\Rt;

use App\Http\Controllers\Controller;
use App\Models\NotifikasiLog;
use App\Models\SuratRequest;
use App\Models\SuratTracking;
use App\Services\TenantSecurityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RtSuratController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasRole('admin')) {
            $surats = SuratRequest::with(['suratType', 'wargaProfile.rt.rw', 'trackings.actorUser.role'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $surats,
            ]);
        }

        $rtId = $user->getAuthorizedRtId();
        if (! $rtId) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Pengguna tidak terdaftar sebagai pengurus RT yang sah.',
            ], 403);
        }

        $surats = SuratRequest::with(['suratType', 'wargaProfile.rt.rw', 'trackings.actorUser.role'])
            ->whereHas('wargaProfile', function ($q) use ($rtId) {
                $q->where('rt_id', $rtId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $surats,
        ]);
    }

    /**
     * Otorisasi teritorial dan validasi status permohonan surat untuk RT.
     */
    private function authorizeRtAction($user, SuratRequest $surat): ?JsonResponse
    {
        // Enforce tenant boundary
        TenantSecurityService::validateSurat($user, $surat);

        // Admin Sistem tidak memiliki kewenangan menyetujui atau menandatangani surat pemerintahan
        if ($user->hasRole('admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Admin Sistem tidak memiliki kewenangan menyetujui atau menandatangani surat pemerintahan.',
            ], 403);
        }

        // Dapatkan RT ID yang berwenang dari user login
        $authorizedRtId = $user->getAuthorizedRtId();
        if (! $authorizedRtId) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Pengguna tidak memiliki kewenangan wilayah RT.',
            ], 403);
        }

        // Verifikasi wilayah surat terhadap wilayah RT pengguna
        $suratRtId = $surat->wargaProfile?->rt_id;
        if (! $suratRtId || (int) $suratRtId !== (int) $authorizedRtId) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Anda tidak berwenang memproses surat di luar wilayah RT Anda.',
            ], 403);
        }

        // Validasi status permohonan: Hanya surat pending_rt yang dapat diproses RT
        if ($surat->status !== 'pending_rt') {
            return response()->json([
                'success' => false,
                'message' => 'Status surat saat ini (' . $surat->status . ') tidak dapat diproses lagi oleh RT.',
            ], 422);
        }

        return null;
    }

    public function approveRt(Request $request, $id): JsonResponse
    {
        $surat = SuratRequest::withoutGlobalScope('tenant')->with('wargaProfile')->findOrFail($id);
        $user = $request->user();

        $authError = $this->authorizeRtAction($user, $surat);
        if ($authError) {
            return $authError;
        }

        $catatan = $request->input('catatan', 'Permohonan disetujui Ketua RT dan diteruskan langsung ke Kepala Desa untuk legalisasi & tanda tangan QR resmi.');

        $surat->update([
            'status' => 'pending_kades',
            'verified_rt_user_id' => $user->id,
            'verified_rt_at' => now(),
        ]);

        SuratTracking::create([
            'surat_request_id' => $surat->id,
            'actor_user_id' => $user->id,
            'status_stage' => 'Ketua RT',
            'status_action' => 'Disetujui',
            'catatan' => $catatan,
        ]);

        if ($surat->wargaProfile && $surat->wargaProfile->no_hp_wa) {
            NotifikasiLog::create([
                'user_id' => $surat->wargaProfile->user_id,
                'warga_profile_id' => $surat->wargaProfile->id,
                'nomor_tujuan' => $surat->wargaProfile->no_hp_wa,
                'jenis_notifikasi' => 'SURAT_PENDING_KADES',
                'judul' => 'Surat Disetujui RT & Menunggu Pengesahan Kades',
                'pesan' => "Halo {$surat->wargaProfile->nama_lengkap}, pengajuan surat {$surat->nomor_resi} telah DISETUJUI oleh Ketua RT dan diteruskan langsung ke Kepala Desa untuk pengesahan & tanda tangan resmi.",
                'status_pengiriman' => 'TERKIRIM',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Surat berhasil disetujui RT dan diteruskan langsung ke Kepala Desa.',
            'data' => $surat->fresh(['trackings.actorUser']),
        ]);
    }

    public function reject(Request $request, $id): JsonResponse
    {
        $request->validate([
            'alasan' => 'nullable|string|max:500',
            'catatan' => 'nullable|string|max:500',
        ]);

        $surat = SuratRequest::withoutGlobalScope('tenant')->with('wargaProfile')->findOrFail($id);
        $user = $request->user()->load('role');

        $authError = $this->authorizeRtAction($user, $surat);
        if ($authError) {
            return $authError;
        }

        $alasan = $request->input('alasan') ?: $request->input('catatan', 'Pengajuan surat ditolak.');

        $surat->update([
            'status' => 'rejected',
            'catatan_penolakan' => $alasan,
        ]);

        SuratTracking::create([
            'surat_request_id' => $surat->id,
            'actor_user_id' => $user->id,
            'status_stage' => 'Ketua RT',
            'status_action' => 'Ditolak',
            'catatan' => 'Alasan: ' . $alasan,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permohonan surat telah ditolak dengan catatan perbaikan.',
            'data' => $surat->fresh(['trackings.actorUser']),
        ]);
    }

    public function handleAction(Request $request, $id): JsonResponse
    {
        $action = strtolower($request->input('action', 'approve'));
        if ($action === 'reject') {
            return $this->reject($request, $id);
        }
        return $this->approveRt($request, $id);
    }
}
