<?php

namespace App\Http\Controllers\Api\Rt;

use App\Http\Controllers\Controller;
use App\Models\KartuKeluarga;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\WargaProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RtWargaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('role', 'wargaProfile.rt');
        if ($user->hasRole('admin') || $user->hasRole('sekdes') || $user->hasRole('kades')) {
            $rtId = $request->query('rt_id');
        } else {
            $rtId = $user->getAuthorizedRtId();
            if (!$rtId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Pengguna tidak terdaftar dalam wilayah RT yang sah.',
                ], 403);
            }
        }

        $query = WargaProfile::with(['kartuKeluarga', 'rt.rw.dusun', 'user']);
        if ($rtId) {
            $query->where('rt_id', $rtId);
        }

        if ($request->filled('search')) {
            $s = $request->query('search');
            $query->where(function ($q) use ($s) {
                $q->where('nama_lengkap', 'like', "%{$s}%")
                  ->orWhere('nik', 'like', "%{$s}%");
            });
        }

        $query->orderBy('nama_lengkap');

        // Parameter per_page validation & clamping [1, 100]
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        if ($request->boolean('all')) {
            $wargas = $query->limit(200)->get();
            return response()->json([
                'success' => true,
                'data' => $wargas,
                'pagination' => [
                    'current_page' => 1,
                    'per_page' => $wargas->count(),
                    'total' => $wargas->count(),
                    'last_page' => 1,
                    'has_more' => false,
                ],
            ]);
        }

        $paginator = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ]);
    }

    public function getKartuKeluargas(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile');
        if ($user->hasRole('admin') || $user->hasRole('sekdes') || $user->hasRole('kades')) {
            $rtId = $request->query('rt_id');
        } else {
            $rtId = $user->getAuthorizedRtId();
            if (!$rtId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Pengguna tidak terdaftar dalam wilayah RT yang sah.',
                ], 403);
            }
        }

        $query = KartuKeluarga::with(['rt.rw.dusun', 'anggotaKeluarga']);
        if ($rtId) {
            $query->where('rt_id', $rtId);
        }

        $kks = $query->get();

        return response()->json(['success' => true, 'data' => $kks]);
    }

    public function getWilayah(): JsonResponse
    {
        $rts = Rt::with('rw.dusun')->get();
        $rws = Rw::with('dusun')->get();
        return response()->json([
            'success' => true,
            'rts' => $rts,
            'rws' => $rws,
        ]);
    }
}
