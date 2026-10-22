<?php

namespace App\Http\Controllers\Api\Kades;

use App\Http\Controllers\Controller;
use App\Models\Pengumuman;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KadesPengumumanController extends Controller
{
    /**
     * Daftar seluruh pengumuman untuk peninjauan Kepala Desa.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('kades') && !$user->hasRole('admin') && !$user->hasRole('admin_desa') && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Hanya Kepala Desa atau Administrator yang berwenang meninjau dan menyetujui pengumuman desa.',
            ], 403);
        }

        $query = Pengumuman::with(['createdByUser', 'approvedByKadesUser', 'bantuanSosial'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $pengumumans = $query->get();

        $stats = [
            'pending_approval' => Pengumuman::where('status', 'pending_approval')->count(),
            'approved' => Pengumuman::where('status', 'approved')->count(),
            'published' => Pengumuman::where('status', 'published')->count(),
            'rejected' => Pengumuman::where('status', 'rejected')->count(),
            'draft' => Pengumuman::where('status', 'draft')->count(),
            'total' => Pengumuman::count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $pengumumans,
            'stats' => $stats,
        ]);
    }

    /**
     * Persetujuan Pengumuman oleh Kepala Desa sebelum publikasi.
     */
    public function approve(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('kades') && !$user->hasRole('admin') && !$user->hasRole('admin_desa') && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Kepala Desa atau Administrator yang memiliki kewenangan menyetujui pengumuman resmi pemerintahan.',
            ], 403);
        }

        $pengumuman = Pengumuman::findOrFail($id);

        if ($pengumuman->status === 'published') {
            return response()->json([
                'success' => false,
                'message' => 'Pengumuman ini telah disetujui dan telah dipublikasikan sebelumnya.',
            ], 422);
        }

        if ($pengumuman->status !== 'pending_approval') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya pengumuman berstatus pending_approval yang dapat disetujui oleh Kepala Desa.',
            ], 422);
        }

        $request->validate([
            'scheduled_publish_at' => 'nullable|date',
            'publish_immediately' => 'nullable|boolean',
        ]);

        $publishImmediately = $request->boolean('publish_immediately', true);
        $scheduledAt = $request->filled('scheduled_publish_at') ? Carbon::parse($request->input('scheduled_publish_at')) : null;

        // Jika dijadwalkan di masa depan
        if ($scheduledAt && $scheduledAt->isFuture() && !$publishImmediately) {
            $pengumuman->update([
                'status' => 'approved',
                'is_active' => false,
                'approved_by_kades_user_id' => $user->id,
                'approved_at' => now(),
                'published_at' => $scheduledAt,
                'catatan_penolakan_kades' => null,
            ]);
            $msg = 'Draf pengumuman berhasil disetujui Kepala Desa dan dijadwalkan tayang pada ' . $scheduledAt->translatedFormat('d F Y H:i');
        } else {
            // Publikasi langsung
            $pengumuman->update([
                'status' => 'published',
                'is_active' => true,
                'approved_by_kades_user_id' => $user->id,
                'approved_at' => now(),
                'published_at' => now(),
                'catatan_penolakan_kades' => null,
            ]);
            $msg = 'Draf pengumuman berhasil disetujui Kepala Desa dan langsung dipublikasikan secara resmi.';
        }

        return response()->json([
            'success' => true,
            'message' => $msg,
            'data' => $pengumuman->fresh(['createdByUser', 'approvedByKadesUser']),
        ]);
    }

    /**
     * Penolakan Pengumuman oleh Kepala Desa (Wajib alasan).
     */
    public function reject(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole('kades') && !$user->hasRole('admin') && !$user->hasRole('admin_desa') && !$user->hasRole('super_admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Kepala Desa atau Administrator yang memiliki kewenangan menolak pengumuman resmi pemerintahan.',
            ], 403);
        }

        $request->validate([
            'alasan' => 'required|string|min:5|max:500',
        ], [
            'alasan.required' => 'Alasan penolakan pengumuman oleh Kepala Desa wajib diisi.',
            'alasan.min' => 'Alasan penolakan pengumuman minimal 5 karakter.',
        ]);

        $pengumuman = Pengumuman::findOrFail($id);

        if ($pengumuman->status !== 'pending_approval') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya draf pengumuman berstatus pending_approval yang dapat ditolak oleh Kepala Desa.',
            ], 422);
        }

        $alasan = trim($request->input('alasan'));

        $pengumuman->update([
            'status' => 'rejected',
            'is_active' => false,
            'catatan_penolakan_kades' => $alasan,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Draf pengumuman telah ditolak dengan catatan resmi Kepala Desa untuk direvisi oleh Sekdes.',
            'data' => $pengumuman->fresh(['createdByUser']),
        ]);
    }
}
