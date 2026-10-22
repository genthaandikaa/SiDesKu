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
        ], [
            'kategori.required' => 'Kategori aduan/aspirasi wajib dipilih.',
            'judul.required' => 'Judul laporan aduan wajib diisi.',
            'judul.max' => 'Judul laporan maksimal 200 karakter.',
            'deskripsi.required' => 'Uraian pengaduan wajib diisi dengan lengkap.',
        ]);

        // Proses penyimpanan berkas foto jika dikirim berupa Base64 Data URL
        if (!empty($validated['foto_lampiran'])) {
            $fotoInput = trim($validated['foto_lampiran']);
            if (str_starts_with($fotoInput, 'data:image')) {
                try {
                    $uploadRes = \App\Services\FileUploadSecurityService::processBase64Upload(
                        $fotoInput,
                        ['image/jpeg', 'image/png', 'image/webp'],
                        \App\Services\FileUploadSecurityService::MAX_DOCUMENT_SIZE,
                        'pengaduan',
                        'pengaduan_' . $user->id
                    );
                    if ($uploadRes['success']) {
                        $validated['foto_lampiran'] = $uploadRes['url'];
                    }
                } catch (\Throwable $e) {
                    // Jika gagal proses base64, kosongkan lampiran agar transaksi tidak crash
                    $validated['foto_lampiran'] = null;
                }
            }
        }

        $validated['warga_profile_id'] = $user->wargaProfile->id;
        $validated['rt_id'] = $user->wargaProfile->rt_id;
        $validated['status'] = 'Menunggu Disposisi';
        $validated['disposisi_ke'] = 'Ketua RT';

        $pengaduan = PengaduanWarga::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Aduan/aspirasi Anda berhasil dikirim ke pengurus RT dan Balai Desa.',
            'data' => $pengaduan->load('wargaProfile'),
        ], 201);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user()->load('wargaProfile');
        if (!$user->wargaProfile) {
            return response()->json(['success' => false, 'message' => 'Profil warga tidak ditemukan.'], 403);
        }

        $pengaduan = PengaduanWarga::with(['wargaProfile.rt.rw', 'ditanggapiByUser.role'])->findOrFail($id);

        if ((int) $pengaduan->warga_profile_id !== (int) $user->wargaProfile->id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Anda tidak berwenang melihat detail pengaduan milik warga lain.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $pengaduan,
        ]);
    }
}
