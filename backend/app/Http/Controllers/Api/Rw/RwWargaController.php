<?php

namespace App\Http\Controllers\Api\Rw;

use App\Http\Controllers\Controller;
use App\Models\WargaProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RwWargaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile.rt');
        $rwId = $user->wargaProfile && $user->wargaProfile->rt ? $user->wargaProfile->rt->rw_id : 1;

        $query = WargaProfile::with(['kartuKeluarga', 'rt.rw.dusun', 'user'])
            ->whereHas('rt', function ($q) use ($rwId) {
                $q->where('rw_id', $rwId);
            });

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
}
