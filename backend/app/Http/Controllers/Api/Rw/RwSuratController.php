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
    protected function resolveRwId($user): ?int
    {
        if ($user->hasRole('admin') || $user->hasRole('sekdes') || $user->hasRole('kades')) {
            $reqRw = request()->query('rw_id');
            if ($reqRw) return (int) $reqRw;
            return Rw::value('id');
        }

        return $user->getAuthorizedRwId();
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $rwId = $this->resolveRwId($user);
        if (!$rwId) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Pengguna tidak terdaftar dalam wilayah RW yang sah.',
            ], 403);
        }

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
        return response()->json([
            'success' => false,
            'message' => 'Alur persetujuan surat resmi SiDesKu adalah langsung dari RT ke Kantor Desa (Bypass RW). Verifikasi surat oleh RW telah dinonaktifkan.',
        ], 403);
    }

    public function reject(Request $request, $id): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Alur persetujuan surat resmi SiDesKu adalah langsung dari RT ke Kantor Desa (Bypass RW). Penolakan surat oleh RW telah dinonaktifkan.',
        ], 403);
    }
}
