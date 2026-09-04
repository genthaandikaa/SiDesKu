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
        $rtId = $user->wargaProfile ? $user->wargaProfile->rt_id : 1;

        $query = WargaProfile::with(['kartuKeluarga', 'rt.rw.dusun', 'user'])
            ->where('rt_id', $rtId);

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
        $user = $request->user()->load('wargaProfile');
        $rtId = $user->wargaProfile ? $user->wargaProfile->rt_id : 1;

        $kks = KartuKeluarga::with(['rt.rw.dusun', 'anggotaKeluarga'])
            ->where('rt_id', $rtId)
            ->get();

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
