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
        $user = $request->user();

        if ($user->hasRole('admin') || $user->hasRole('kades') || $user->hasRole('sekdes')) {
            $query = PengaduanWarga::with(['wargaProfile.rt.rw.dusun', 'rt.rw.dusun', 'ditanggapiByUser.role']);

            if ($request->filled('rt_id') && $request->rt_id !== 'all') {
                $query->where('rt_id', $request->query('rt_id'));
            }

            if ($request->filled('rw_id') && $request->rw_id !== 'all') {
                $rwId = $request->query('rw_id');
                $query->whereHas('rt', function ($q) use ($rwId) {
                    $q->where('rw_id', $rwId);
                });
            }

            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->query('status'));
            }

            if ($request->filled('kategori') && $request->kategori !== 'all') {
                $query->where('kategori', $request->query('kategori'));
            }

            $pengaduans = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $pengaduans,
            ]);
        }

        $rtId = $user->getAuthorizedRtId();
        if (!$rtId) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak. Pengguna tidak terdaftar sebagai pengurus RT yang sah.',
            ], 403);
        }

        $pengaduans = PengaduanWarga::with(['wargaProfile.rt.rw.dusun', 'rt.rw.dusun', 'ditanggapiByUser.role'])
            ->where('rt_id', $rtId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $pengaduans,
        ]);
    }

    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        $pengaduan = PengaduanWarga::with(['wargaProfile.rt.rw.dusun', 'rt.rw.dusun', 'ditanggapiByUser.role'])->findOrFail($id);

        if ($user->hasRole('warga')) {
            if (!$user->wargaProfile || (int) $pengaduan->warga_profile_id !== (int) $user->wargaProfile->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Anda hanya berhak mengakses pengaduan milik Anda sendiri.',
                ], 403);
            }
        } elseif ($user->hasRole('rt')) {
            $authorizedRtId = $user->getAuthorizedRtId();
            if (!$authorizedRtId || (int) $pengaduan->rt_id !== (int) $authorizedRtId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Pengaduan berada di luar wilayah RT Anda.',
                ], 403);
            }
        } elseif ($user->hasRole('rw')) {
            $authorizedRwId = $user->getAuthorizedRwId();
            if (!$authorizedRwId || (int) ($pengaduan->rt?->rw_id ?? 0) !== (int) $authorizedRwId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Pengaduan berada di luar wilayah RW Anda.',
                ], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $pengaduan,
        ]);
    }

    public function respond(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'tanggapan' => 'required|string',
            'status' => 'nullable|string',
            'disposisi_ke' => 'nullable|string',
        ]);

        $user = $request->user();
        $pengaduan = PengaduanWarga::findOrFail($id);

        // Verifikasi batas wilayah teritorial RT (Desa dan Admin berwenang atas seluruh wilayah)
        if (!$user->hasRole('admin') && !$user->hasRole('kades') && !$user->hasRole('sekdes')) {
            $authorizedRtId = $user->getAuthorizedRtId();
            if (!$authorizedRtId || (int) $pengaduan->rt_id !== (int) $authorizedRtId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak. Anda tidak berwenang menanggapi pengaduan warga di luar wilayah RT Anda.',
                ], 403);
            }
        }

        return \Illuminate\Support\Facades\DB::transaction(function () use ($pengaduan, $validated, $user) {
            $disposisiTujuan = $validated['disposisi_ke'] ?? ($validated['status'] === 'Selesai' ? 'Selesai Ditangani' : ($pengaduan->disposisi_ke ?? 'Pemerintah Desa'));
            $statusValue = $validated['status'] ?? ($disposisiTujuan === 'Selesai Ditangani' ? 'Selesai' : 'Didisposisikan');

            $history = $pengaduan->riwayat_tanggapan ?? [];
            $history[] = [
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'actor_user_id' => $user->id,
                'actor_nama' => $user->name,
                'actor_role' => $user->role?->name ?? 'Petugas',
                'status_sebelumnya' => $pengaduan->status,
                'status_baru' => $statusValue,
                'disposisi_ke' => $disposisiTujuan,
                'tanggapan' => $validated['tanggapan'],
                'created_at' => now()->toIso8601String(),
            ];

            $pengaduan->update([
                'tanggapan' => $validated['tanggapan'],
                'riwayat_tanggapan' => $history,
                'status' => $statusValue,
                'disposisi_ke' => $disposisiTujuan,
                'ditanggapi_by_user_id' => $user->id,
                'ditanggapi_at' => now(),
            ]);

            // Push notification ke warga pemilik aspirasi/pengaduan
            try {
                $targetUser = $pengaduan->wargaProfile?->user;
                if ($targetUser) {
                    app(\App\Services\WebPushService::class)->sendToUser(
                        $targetUser,
                        'Pembaruan Aspirasi / Pengaduan',
                        'Aspirasi Anda mendapatkan tanggapan resmi: ' . \Illuminate\Support\Str::limit($validated['tanggapan'], 60),
                        '/dashboard?tab=aspirasi',
                        'aspirasi-' . $pengaduan->id
                    );
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('[WebPush] Aspirasi push error: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Tanggapan dan disposisi resmi berhasil dicatat ke riwayat pengaduan.',
                'data' => $pengaduan->fresh(['wargaProfile', 'ditanggapiByUser']),
            ]);
        });
    }
}
