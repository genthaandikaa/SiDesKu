<?php

namespace App\Http\Controllers\Api\Rt;

use App\Http\Controllers\Controller;
use App\Models\PengaduanWarga;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RtPengaduanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile.rt');
        $rtId = $user->wargaProfile ? $user->wargaProfile->rt_id : 1;

        $pengaduans = PengaduanWarga::with(['wargaProfile.rt.rw', 'ditanggapiByUser.role'])
            ->where('rt_id', $rtId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pengaduans,
        ]);
    }

    public function respond(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'tanggapan' => 'required|string',
            'status' => 'required|in:Ditinjau RT,Diproses Desa,Selesai,Ditolak',
        ]);

        $pengaduan = PengaduanWarga::findOrFail($id);
        $pengaduan->update([
            'tanggapan' => $validated['tanggapan'],
            'status' => $validated['status'],
            'ditanggapi_by_user_id' => $request->user()->id,
            'ditanggapi_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tanggapan resmi berhasil disimpan.',
            'data' => $pengaduan->fresh(['wargaProfile', 'ditanggapiByUser']),
        ]);
    }
}
