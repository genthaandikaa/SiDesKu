<?php

namespace App\Http\Controllers\Api\Rw;

use App\Http\Controllers\Controller;
use App\Models\Rw;
use App\Models\SuratRequest;
use App\Models\SuratTracking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RwSuratController extends Controller
{
    /**
     * Resolve RW ID for authenticated user
     */
    protected function resolveRwId($user): int
    {
        $rw = Rw::where('ketua_rw_user_id', $user->id)->first() ?? ($user->wargaProfile?->rt?->rw ?? Rw::first());
        return $rw ? $rw->id : 1;
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $rwId = $this->resolveRwId($user);

        $query = SuratRequest::with(['suratType', 'wargaProfile.rt.rw', 'trackings.actorUser.role'])
            ->whereHas('wargaProfile.rt', function ($q) use ($rwId) {
                $q->where('rw_id', $rwId);
            });

        if ($request->has('rt_id') && $request->query('rt_id') !== 'all') {
            $query->whereHas('wargaProfile', function ($q) use ($request) {
                $q->where('rt_id', $request->query('rt_id'));
            });
        }

        if ($request->has('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        $surats = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'rw_id' => $rwId,
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
