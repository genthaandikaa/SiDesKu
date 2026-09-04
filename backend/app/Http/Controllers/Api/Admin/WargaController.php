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

        if ($request->has('rt_id')) {
            $query->where('rt_id', $request->query('rt_id'));
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
            'data' => $wargas,
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
