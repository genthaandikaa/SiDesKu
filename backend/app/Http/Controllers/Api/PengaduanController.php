<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PengaduanWarga;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PengaduanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('wargaProfile.rt');
        $query = PengaduanWarga::with(['wargaProfile.rt.rw', 'ditanggapiByUser.role']);

        if ($user->hasRole('warga')) {
            if (!$user->wargaProfile) {
                return response()->json(['success' => true, 'data' => []]);
            }
            $query->where('warga_profile_id', $user->wargaProfile->id);
        } elseif ($user->hasRole('rt') || $user->hasRole('sekretaris_rt')) {
            $rtId = $user->wargaProfile ? $user->wargaProfile->rt_id : 1;
            $query->where('rt_id', $rtId);
        }

        $pengaduans = $query->orderBy('created_at', 'desc')->get();

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
