<?php

namespace App\Http\Controllers\Api;

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
        $user = $request->user()->load('role', 'wargaProfile.rt');
        $query = WargaProfile::with(['kartuKeluarga', 'rt.rw.dusun', 'user']);

        if ($user->hasRole('rt') || $user->hasRole('sekretaris_rt') || $user->hasRole('bendahara_rt')) {
            $rtId = $user->wargaProfile ? $user->wargaProfile->rt_id : 1;
            $query->where('rt_id', $rtId);
        } elseif ($user->hasRole('rw')) {
            $rwId = $user->wargaProfile && $user->wargaProfile->rt ? $user->wargaProfile->rt->rw_id : 1;
            $query->whereHas('rt', function ($q) use ($rwId) {
                $q->where('rw_id', $rwId);
            });
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
