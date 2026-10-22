<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use App\Models\KartuKeluarga;
use App\Models\WargaProfile;
use App\Services\FileUploadSecurityService;
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
            'foto_ktp' => self::signDocumentUrl($profile->foto_ktp, $user->id),
            'foto_kk' => self::signDocumentUrl($fotoKk, $user->id),
            'foto_akta_lahir' => self::signDocumentUrl($profile->foto_akta_lahir, $user->id),
            'foto_buku_nikah' => self::signDocumentUrl($profile->foto_buku_nikah, $user->id),
            'dokumen_tambahan' => array_map(function ($d) use ($user) {
                if (isset($d['url'])) {
                    $d['url'] = self::signDocumentUrl($d['url'], $user->id);
                }
                return $d;
            }, $profile->dokumen_kependudukan_json ?? []),
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

        $imageOnlyTypes = ['ktp', 'kk'];
        $allowedMimes = in_array($validated['tipe'], $imageOnlyTypes)
            ? ['image/jpeg', 'image/png', 'image/webp']
            : ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

        $uploadResult = FileUploadSecurityService::processBase64Upload(
            $validated['file_data'],
            $allowedMimes,
            FileUploadSecurityService::MAX_DOCUMENT_SIZE,
            'warga_dokumen/' . $user->id,
            $validated['tipe']
        );

        if (! $uploadResult['success']) {
            return response()->json([
                'success' => false,
                'message' => $uploadResult['message'] ?? 'Gagal memproses file dokumen.',
            ], 422);
        }

        $url = $uploadResult['url'];

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
                'url' => self::signDocumentUrl($url, $user->id),
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
     * Helper to save base64 document/image to public storage directory.
     */
    private function saveImageFile(string $input, string $prefix, int $userId): ?string
    {
        $allowedMimes = in_array($prefix, ['ktp', 'kk'])
            ? ['image/jpeg', 'image/png', 'image/webp']
            : ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

        $result = FileUploadSecurityService::processBase64Upload(
            $input,
            $allowedMimes,
            FileUploadSecurityService::MAX_DOCUMENT_SIZE,
            'warga_dokumen/' . $userId,
            $prefix,
            true
        );

        return $result['success'] ? $result['url'] : null;
    }

    /**
     * Helper untuk menghasilkan Temporary Signed URL berkas privat dengan masa berlaku 30 menit.
     */
    public static function signDocumentUrl(?string $urlOrPath, ?int $userId, int $minutes = 30): ?string
    {
        if (empty($urlOrPath)) {
            return null;
        }

        $trimmed = trim($urlOrPath);

        // Data URI atau Blob URL adalah lokal di browser
        if (str_starts_with($trimmed, 'data:') || str_starts_with($trimmed, 'blob:')) {
            return $trimmed;
        }

        // Jika URL sudah memiliki signature aktif dan parameter expires, pertahankan
        if (str_contains($trimmed, 'signature=') && str_contains($trimmed, 'expires=')) {
            return $trimmed;
        }

        $extractedUserId = $userId;
        $extractedFilename = null;

        if (preg_match('#(?:/api)?/warga/dokumen/file/(\d+)/([^?\#]+)#', $trimmed, $matches)) {
            $extractedUserId = (int) $matches[1];
            $extractedFilename = basename($matches[2]);
        } elseif (preg_match('#warga_dokumen/(\d+)/([^?\#]+)#', $trimmed, $matches)) {
            $extractedUserId = (int) $matches[1];
            $extractedFilename = basename($matches[2]);
        } elseif ($userId) {
            $extractedFilename = basename($trimmed);
        }

        if ($extractedUserId && $extractedFilename) {
            return \Illuminate\Support\Facades\URL::temporarySignedRoute(
                'api.warga.dokumen.file',
                now()->addMinutes($minutes),
                ['userId' => $extractedUserId, 'filename' => $extractedFilename]
            );
        }

        return $trimmed;
    }

    /**
     * Endpoint untuk mendapatkan Temporary Signed URL bagi pemohon yang sah.
     */
    public function getSignedUrl(Request $request): JsonResponse
    {
        $user = $request->user();
        $targetUserId = (int) ($request->query('user_id') ?: $user->id);
        $filename = $request->query('filename') ?: basename((string) $request->query('url'));

        if (!$filename) {
            return response()->json([
                'success' => false,
                'message' => 'Parameter filename atau url dokumen wajib disertakan.',
            ], 422);
        }

        $targetUser = \App\Models\User::withoutGlobalScope('tenant')->find($targetUserId);
        if (!$targetUser) {
            return response()->json(['success' => false, 'message' => 'User target tidak ditemukan.'], 404);
        }

        // Multi-tenant check: Akses lintas desa ditolak mutlak (kecuali super_admin)
        if (!$user->hasRole('super_admin') && (int) $user->desa_id !== (int) $targetUser->desa_id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak lintas desa.'], 403);
        }

        $isOwner = ((int) $user->id === $targetUserId);
        $isAdmin = $user->hasRole('admin') || $user->hasRole('admin_desa');
        $isDesa = $user->hasRole('kades') || $user->hasRole('sekdes');
        $isRt = $user->hasRole('rt');
        $isRw = $user->hasRole('rw');

        if (!$isOwner && !$isAdmin && !$isDesa) {
            $targetProfile = WargaProfile::where('user_id', $targetUserId)->first();
            if (!$targetProfile) {
                return response()->json(['success' => false, 'message' => 'Profil kependudukan tidak ditemukan.'], 404);
            }

            if ($isRt) {
                $authorizedRtId = $user->getAuthorizedRtId();
                if (!$authorizedRtId || (int) $targetProfile->rt_id !== (int) $authorizedRtId) {
                    return response()->json(['success' => false, 'message' => 'Akses ditolak di luar RT Anda.'], 403);
                }
            } elseif ($isRw) {
                $authorizedRwId = $user->getAuthorizedRwId();
                if (!$authorizedRwId || (int) $targetProfile->rw_id !== (int) $authorizedRwId) {
                    return response()->json(['success' => false, 'message' => 'Akses ditolak di luar RW Anda.'], 403);
                }
            } else {
                return response()->json(['success' => false, 'message' => 'Akses ditolak untuk dokumen warga lain.'], 403);
            }
        }

        $signedUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'api.warga.dokumen.file',
            now()->addMinutes(30),
            ['userId' => $targetUserId, 'filename' => basename($filename)]
        );

        return response()->json([
            'success' => true,
            'signed_url' => $signedUrl,
            'expires_at' => now()->addMinutes(30)->toIso8601String(),
        ]);
    }

    /**
     * Layanan penyajian berkas privat kependudukan secara berotentikasi & berotorisasi.
     * Menggunakan validasi Bearer Token sah ATAU Temporary HMAC Signed URL yang valid.
     * Pengiriman raw Personal Access Token via query string (?token=) telah DIHAPUS demi keamanan PDP.
     */
    public function serveFile(Request $request, int|string $userId, string $filename)
    {
        $targetUserId = (int) $userId;
        $safeFilename = basename($filename);

        // 1. Validasi Autentikasi: Harus memiliki Bearer Token yang sah ATAU Signed URL yang valid
        $user = null;

        if ($request->bearerToken()) {
            $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->bearerToken());
            if ($token && $token->tokenable) {
                $user = $token->tokenable;
            }
        } elseif ($request->user()) {
            $user = $request->user();
        }

        if (!$user) {
            // Periksa apakah request memiliki URL Signature yang sah & belum kedaluwarsa
            if (!$request->hasValidSignature()) {
                if ($request->has('signature')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Tanda tangan digital dokumen tidak sah atau telah kedaluwarsa.',
                    ], 403);
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated: Akses ke dokumen kependudukan memerlukan login yang sah atau tanda tangan digital (Signed URL).',
                ], 401);
            }
        }

        // 2. Verifikasi Keberadaan Target User
        $targetUser = \App\Models\User::withoutGlobalScope('tenant')->find($targetUserId);
        if (!$targetUser) {
            return response()->json([
                'success' => false,
                'message' => 'User pemilik berkas tidak ditemukan.',
            ], 404);
        }

        // 3. Jika akses via Bearer token (pengguna login), evaluasi multi-tenant & hak akses teritorial
        if ($user) {
            // Multi-tenant check: Akses lintas desa ditolak mutlak (kecuali super_admin)
            if (!$user->hasRole('super_admin') && (int) $user->desa_id !== (int) $targetUser->desa_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak: Anda tidak memiliki wewenang mengakses dokumen warga dari desa lain.',
                ], 403);
            }

            $isOwner = ((int) $user->id === $targetUserId);
            $isAdmin = $user->hasRole('admin') || $user->hasRole('admin_desa');
            $isDesa = $user->hasRole('kades') || $user->hasRole('sekdes');
            $isRt = $user->hasRole('rt');
            $isRw = $user->hasRole('rw');

            // Evaluasi otorisasi teritorial dan hak akses
            if (!$isOwner && !$isAdmin && !$isDesa) {
                $targetProfile = WargaProfile::where('user_id', $targetUserId)->first();
                if (!$targetProfile) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Profil kependudukan pemilik berkas tidak ditemukan.',
                    ], 404);
                }

                if ($isRt) {
                    $authorizedRtId = $user->getAuthorizedRtId();
                    if (!$authorizedRtId || (int) $targetProfile->rt_id !== (int) $authorizedRtId) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Akses ditolak: Anda tidak memiliki wewenang mengakses dokumen warga di luar wilayah RT Anda.',
                        ], 403);
                    }
                } elseif ($isRw) {
                    $authorizedRwId = $user->getAuthorizedRwId();
                    if (!$authorizedRwId || (int) $targetProfile->rw_id !== (int) $authorizedRwId) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Akses ditolak: Anda tidak memiliki wewenang mengakses dokumen warga di luar wilayah RW Anda.',
                        ], 403);
                    }
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Akses ditolak: Anda tidak berwenang mengakses dokumen privat milik warga lain.',
                    ], 403);
                }
            }
        }

        // 4. File existence & serving (Sanitasi nama berkas untuk mencegah Path Traversal)
        $privatePath = storage_path('app/private/warga_dokumen/' . $targetUserId . '/' . $safeFilename);
        $legacyPath = public_path('uploads/warga_dokumen/' . $targetUserId . '/' . $safeFilename);
        $rootUploadsPath = public_path('uploads/' . $safeFilename);

        $targetPath = file_exists($privatePath) ? $privatePath : (file_exists($legacyPath) ? $legacyPath : (file_exists($rootUploadsPath) ? $rootUploadsPath : null));

        if (!$targetPath || !file_exists($targetPath)) {
            return response()->json([
                'success' => false,
                'message' => 'Berkas dokumen tidak ditemukan di server.',
            ], 404);
        }

        $mime = mime_content_type($targetPath) ?: 'application/octet-stream';

        return response()->file($targetPath, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . $safeFilename . '"',
            'Cache-Control' => 'private, no-cache, no-store, must-revalidate',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
