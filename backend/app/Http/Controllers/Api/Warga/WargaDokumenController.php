<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use App\Models\KartuKeluarga;
use App\Models\WargaProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WargaDokumenController extends Controller
{
    /**
     * Get all master kependudukan documents for the logged in warga.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load(['wargaProfile.kartuKeluarga']);
        $profile = $user->wargaProfile;

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Profil kependudukan belum terhubung dengan akun Anda.',
            ], 404);
        }

        // Resolving foto_kk from profile or linked kartu_keluarga
        $fotoKk = $profile->foto_kk ?? $profile->kartuKeluarga?->foto_kk;

        $dokumenList = [
            'foto_ktp' => $profile->foto_ktp,
            'foto_kk' => $fotoKk,
            'foto_akta_lahir' => $profile->foto_akta_lahir,
            'foto_buku_nikah' => $profile->foto_buku_nikah,
            'dokumen_tambahan' => $profile->dokumen_kependudukan_json ?? [],
        ];

        $terisi = 0;
        if (!empty($dokumenList['foto_ktp'])) $terisi++;
        if (!empty($dokumenList['foto_kk'])) $terisi++;
        if (!empty($dokumenList['foto_akta_lahir'])) $terisi++;
        if (!empty($dokumenList['foto_buku_nikah'])) $terisi++;
        $terisi += count($dokumenList['dokumen_tambahan']);

        return response()->json([
            'success' => true,
            'message' => 'Master berkas kependudukan berhasil diambil.',
            'data' => [
                'warga' => [
                    'nik' => $profile->nik,
                    'nama_lengkap' => $profile->nama_lengkap,
                    'no_kk' => $profile->kartuKeluarga?->no_kk,
                ],
                'dokumen' => $dokumenList,
                'stats' => [
                    'has_ktp' => !empty($dokumenList['foto_ktp']),
                    'has_kk' => !empty($dokumenList['foto_kk']),
                    'has_akta' => !empty($dokumenList['foto_akta_lahir']),
                    'has_nikah' => !empty($dokumenList['foto_buku_nikah']),
                    'total_terunggah' => $terisi,
                    'is_ready_for_letters' => (!empty($dokumenList['foto_ktp']) || !empty($dokumenList['foto_kk'])),
                ],
            ],
        ]);
    }

    /**
     * Upload or update master kependudukan documents.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user()->load(['wargaProfile.kartuKeluarga']);
        $profile = $user->wargaProfile;

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Profil kependudukan tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'tipe' => 'required|string|in:ktp,kk,akta,nikah,tambahan',
            'file_data' => 'required|string', // base64 or url
            'nama_dokumen' => 'nullable|string|max:150',
            'catatan' => 'nullable|string|max:255',
        ]);

        $url = $this->saveImageFile($validated['file_data'], $validated['tipe'], $user->id);

        if (!$url) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses file dokumen. Pastikan format gambar JPG, PNG, atau WebP valid.',
            ], 422);
        }

        $now = now()->toDateTimeString();

        switch ($validated['tipe']) {
            case 'ktp':
                $profile->foto_ktp = $url;
                $profile->save();
                break;

            case 'kk':
                $profile->foto_kk = $url;
                $profile->save();
                // Also update KartuKeluarga model if exists
                if ($profile->kk_id) {
                    KartuKeluarga::where('id', $profile->kk_id)->update(['foto_kk' => $url]);
                }
                break;

            case 'akta':
                $profile->foto_akta_lahir = $url;
                $profile->save();
                break;

            case 'nikah':
                $profile->foto_buku_nikah = $url;
                $profile->save();
                break;

            case 'tambahan':
                $current = $profile->dokumen_kependudukan_json ?? [];
                $current[] = [
                    'id' => 'doc_' . time() . '_' . Str::random(4),
                    'nama' => $validated['nama_dokumen'] ?? 'Dokumen Pendukung',
                    'url' => $url,
                    'catatan' => $validated['catatan'] ?? '',
                    'uploaded_at' => $now,
                ];
                $profile->dokumen_kependudukan_json = $current;
                $profile->save();
                break;
        }

        return response()->json([
            'success' => true,
            'message' => 'Berkas ' . strtoupper($validated['tipe']) . ' berhasil disimpan ke database desa.',
            'data' => [
                'tipe' => $validated['tipe'],
                'url' => $url,
            ],
        ]);
    }

    /**
     * Delete / Reset a master document.
     */
    public function destroy(Request $request, string $tipe): JsonResponse
    {
        $user = $request->user()->load(['wargaProfile']);
        $profile = $user->wargaProfile;

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Profil kependudukan tidak ditemukan.',
            ], 404);
        }

        switch ($tipe) {
            case 'ktp':
                $profile->foto_ktp = null;
                $profile->save();
                break;

            case 'kk':
                $profile->foto_kk = null;
                $profile->save();
                if ($profile->kk_id) {
                    KartuKeluarga::where('id', $profile->kk_id)->update(['foto_kk' => null]);
                }
                break;

            case 'akta':
                $profile->foto_akta_lahir = null;
                $profile->save();
                break;

            case 'nikah':
                $profile->foto_buku_nikah = null;
                $profile->save();
                break;

            default:
                // If it's a specific document id in dokumen_kependudukan_json
                $current = $profile->dokumen_kependudukan_json ?? [];
                $filtered = array_values(array_filter($current, fn($d) => ($d['id'] ?? '') !== $tipe));
                $profile->dokumen_kependudukan_json = $filtered;
                $profile->save();
                break;
        }

        return response()->json([
            'success' => true,
            'message' => 'Berkas berhasil dihapus dari database kependudukan.',
        ]);
    }

    /**
     * Helper to save base64 image to public storage directory.
     */
    private function saveImageFile(string $input, string $prefix, int $userId): ?string
    {
        if (empty($input)) return null;

        // If it's already a hosted URL, return as is
        if (str_starts_with($input, 'http://') || str_starts_with($input, 'https://') || str_starts_with($input, '/uploads/')) {
            return $input;
        }

        if (str_starts_with($input, 'data:image')) {
            try {
                if (preg_match('/^data:image\/(\w+);base64,/', $input, $type)) {
                    $imageData = substr($input, strpos($input, ',') + 1);
                    $extension = strtolower($type[1]);
                    if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
                        $extension = 'jpg';
                    }
                    $decoded = base64_decode($imageData);
                    if ($decoded !== false) {
                        $dir = public_path('uploads/warga_dokumen/' . $userId);
                        if (!file_exists($dir)) {
                            mkdir($dir, 0755, true);
                        }
                        $fileName = $prefix . '_' . time() . '_' . Str::random(4) . '.' . $extension;
                        file_put_contents($dir . DIRECTORY_SEPARATOR . $fileName, $decoded);
                        return url('uploads/warga_dokumen/' . $userId . '/' . $fileName);
                    }
                }
            } catch (\Exception $e) {
                return null;
            }
        }

        return null;
    }
}
