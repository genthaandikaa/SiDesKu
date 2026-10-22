<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\KartuKeluarga;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\WargaProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WargaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = WargaProfile::with(['kartuKeluarga', 'rt.rw.dusun', 'user']);

        if ($request->filled('rt_id')) {
            $query->where('rt_id', $request->query('rt_id'));
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
        $kks = KartuKeluarga::with(['rt.rw.dusun', 'anggotaKeluarga'])->get();
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
