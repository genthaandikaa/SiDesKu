<?php

namespace App\Http\Controllers\Api\Rw;

use App\Http\Controllers\Controller;
use App\Models\SuratRequest;
use App\Models\SuratTracking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RwSuratController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile.rt');
        $rwId = $user->wargaProfile && $user->wargaProfile->rt ? $user->wargaProfile->rt->rw_id : 1;

        $surats = SuratRequest::with(['suratType', 'wargaProfile.rt.rw', 'trackings.actorUser.role'])
            ->whereHas('wargaProfile.rt', function ($q) use ($rwId) {
                $q->where('rw_id', $rwId);
            })
            ->whereIn('status', ['approved_rt', 'pending_rw', 'approved_rw', 'processed_sekdes', 'completed', 'rejected'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $surats,
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

    public function reject(Request $request, $id): JsonResponse
    {
        $request->validate([
            'alasan' => 'nullable|string|max:500',
            'catatan' => 'nullable|string|max:500',
        ]);

        $alasan = $request->input('alasan') ?: $request->input('catatan', 'Pengajuan surat ditolak oleh RW.');

        $surat = SuratRequest::with('wargaProfile')->findOrFail($id);
        $user = $request->user();

        $surat->update([
            'status' => 'rejected',
            'catatan_penolakan' => $alasan,
        ]);

        SuratTracking::create([
            'surat_request_id' => $surat->id,
            'actor_user_id' => $user->id,
            'status_stage' => 'Ketua RW',
            'status_action' => 'Ditolak',
            'catatan' => 'Alasan: ' . $alasan,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permohonan surat telah ditolak oleh RW.',
            'data' => $surat->fresh(['trackings.actorUser']),
        ]);
    }
}
