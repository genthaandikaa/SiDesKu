<?php

namespace App\Http\Controllers\Api\Rt;

use App\Http\Controllers\Controller;
use App\Models\NotifikasiLog;
use App\Models\SuratRequest;
use App\Models\SuratTracking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RtSuratController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile.rt.rw');
        $rtId = $user->wargaProfile ? $user->wargaProfile->rt_id : 1;

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

    public function approveRt(Request $request, $id): JsonResponse
    {
        $surat = SuratRequest::with('wargaProfile')->findOrFail($id);
        $user = $request->user();

        $catatan = $request->input('catatan', 'Permohonan disetujui RT dan diteruskan ke Kantor Desa untuk legalisasi.');

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

        if ($surat->wargaProfile && $surat->wargaProfile->no_hp_wa) {
            NotifikasiLog::create([
                'user_id' => $surat->wargaProfile->user_id,
                'warga_profile_id' => $surat->wargaProfile->id,
                'nomor_tujuan' => $surat->wargaProfile->no_hp_wa,
                'jenis_notifikasi' => 'SURAT_APPROVED_RT',
                'judul' => 'Surat Disetujui RT',
                'pesan' => "Halo {$surat->wargaProfile->nama_lengkap}, pengajuan surat {$surat->nomor_resi} telah DISETUJUI oleh Ketua RT dan diteruskan ke Kantor Desa.",
                'status_pengiriman' => 'TERKIRIM',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Surat berhasil disetujui RT dan diteruskan ke Kantor Desa / Sekdes.',
            'data' => $surat->fresh(['trackings.actorUser']),
        ]);
    }

    public function reject(Request $request, $id): JsonResponse
    {
        $request->validate([
            'alasan' => 'nullable|string|max:500',
            'catatan' => 'nullable|string|max:500',
        ]);

        $alasan = $request->input('alasan') ?: $request->input('catatan', 'Pengajuan surat ditolak.');

        $surat = SuratRequest::with('wargaProfile')->findOrFail($id);
        $user = $request->user()->load('role');

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
