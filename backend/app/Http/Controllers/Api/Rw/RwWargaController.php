<?php

namespace App\Http\Controllers\Api\Rw;

use App\Http\Controllers\Controller;
use App\Models\KartuKeluarga;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\WargaProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RwWargaController extends Controller
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

    /**
     * Daftar seluruh warga di wilayah RW
     */
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

        $query = WargaProfile::with(['kartuKeluarga', 'rt.rw.dusun', 'user'])
            ->whereHas('rt', function ($q) use ($rwId) {
                $q->where('rw_id', $rwId);
            });

        if ($request->has('rt_id') && $request->query('rt_id') !== 'all') {
            $query->where('rt_id', $request->query('rt_id'));
        }

        if ($request->has('jenis_kelamin') && $request->query('jenis_kelamin') !== 'all') {
            $query->where('jenis_kelamin', $request->query('jenis_kelamin'));
        }

        if ($request->has('search')) {
            $s = $request->query('search');
            $query->where(function ($q) use ($s) {
                $q->where('nama_lengkap', 'like', "%{$s}%")
                  ->orWhere('nik', 'like', "%{$s}%");
            });
        }

        $wargas = $query->orderBy('nama_lengkap')->get();

        return response()->json([
            'success' => true,
            'rw_id' => $rwId,
            'data' => $wargas,
        ]);
    }

    /**
     * Daftar seluruh Kartu Keluarga (KK) di wilayah RW
     */
    public function getKartuKeluargas(Request $request): JsonResponse
    {
        $user = $request->user();
        $rwId = $this->resolveRwId($user);
        if (!$rwId) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Pengguna tidak terdaftar dalam wilayah RW yang sah.',
            ], 403);
        }

        $query = KartuKeluarga::with(['rt.rw.dusun', 'anggotaKeluarga'])
            ->whereHas('rt', function ($q) use ($rwId) {
                $q->where('rw_id', $rwId);
            });

        if ($request->has('rt_id') && $request->query('rt_id') !== 'all') {
            $query->where('rt_id', $request->query('rt_id'));
        }

        if ($request->has('search')) {
            $s = $request->query('search');
            $query->where(function ($q) use ($s) {
                $q->where('nama_kepala_keluarga', 'like', "%{$s}%")
                  ->orWhere('no_kk', 'like', "%{$s}%");
            });
        }

        $kks = $query->orderBy('nama_kepala_keluarga')->get();

        return response()->json([
            'success' => true,
            'rw_id' => $rwId,
            'data' => $kks,
        ]);
    }

    /**
     * Daftar seluruh RT di bawah koordinasi RW
     */
    public function getRts(Request $request): JsonResponse
    {
        $user = $request->user();
        $rwId = $this->resolveRwId($user);
        if (!$rwId) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Pengguna tidak terdaftar dalam wilayah RW yang sah.',
            ], 403);
        }

        $rw = Rw::find($rwId);

        $rts = Rt::with(['ketuaRtUser', 'wargaProfiles', 'kartuKeluargas'])
            ->where('rw_id', $rwId)
            ->orderBy('nomor_rt')
            ->get();

        return response()->json([
            'success' => true,
            'rw' => $rw,
            'data' => $rts,
        ]);
    }
}
