<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use App\Models\PengaduanWarga;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PengaduanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile.rt');
        
        if (!$user->wargaProfile) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $pengaduans = PengaduanWarga::with(['wargaProfile.rt.rw', 'ditanggapiByUser.role'])
            ->where('warga_profile_id', $user->wargaProfile->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pengaduans,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile');
        if (!$user->wargaProfile) {
            return response()->json(['success' => false, 'message' => 'Profil warga tidak ditemukan.'], 422);
        }

        $validated = $request->validate([
            'kategori' => 'required|string|max:50',
            'judul' => 'required|string|max:200',
            'deskripsi' => 'required|string',
            'foto_lampiran' => 'nullable|string',
        ]);

        $validated['warga_profile_id'] = $user->wargaProfile->id;
        $validated['rt_id'] = $user->wargaProfile->rt_id;
        $validated['status'] = 'Terkirim';

        $pengaduan = PengaduanWarga::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Aduan/aspirasi Anda berhasil dikirim ke pengurus RT dan Balai Desa.',
            'data' => $pengaduan->load('wargaProfile'),
        ], 201);
    }
}
