<?php

namespace App\Services;

use Illuminate\Support\Str;

class FileUploadSecurityService
{
    // Maximum sizes in bytes
    public const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024; // 5 MB
    public const MAX_AVATAR_SIZE = 2 * 1024 * 1024;   // 2 MB
    public const MIN_FILE_SIZE = 64;                  // 64 bytes (reject empty/near-empty files)

    // Allowed MIME mappings to safe extension
    public const MIME_MAP = [
        'image/jpeg' => 'jpg',
        'image/jpg'  => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
        'application/pdf' => 'pdf',
    ];

    /**
     * Memvalidasi dan menyimpan input base64/Data URL ke disk secara aman.
     *
     * @param string $input Base64 string atau Data URL
     * @param array $allowedMimes Array MIME yang diizinkan (misal ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
     * @param int $maxSizeBytes Batas maksimum dalam byte (default 5MB)
     * @param string $storageRelativeDir Direktori relatif penyimpanan (misal: 'warga_dokumen/1')
     * @param string $filenamePrefix Prefix untuk nama file acak
     * @param bool $isPrivate Apakah berkas disimpan di storage private berotentikasi (bukan public webroot)
     * @return array ['success' => bool, 'url' => ?string, 'filename' => ?string, 'message' => ?string]
     */
    public static function processBase64Upload(
        string $input,
        array $allowedMimes,
        int $maxSizeBytes = self::MAX_DOCUMENT_SIZE,
        string $storageRelativeDir = 'warga_dokumen',
        string $filenamePrefix = 'doc',
        bool $isPrivate = false
    ): array {
        // 1. Jika sudah berupa URL publik yang sah, tidak perlu didecode ulang
        $inputTrimmed = trim($input);
        if (
            str_starts_with($inputTrimmed, 'http://') ||
            str_starts_with($inputTrimmed, 'https://') ||
            str_starts_with($inputTrimmed, '/uploads/')
        ) {
            return [
                'success' => true,
                'url' => $inputTrimmed,
                'is_existing_url' => true,
            ];
        }

        // 2. Validasi panjang string sebelum decoding untuk mencegah pembengkakan memori
        // Base64 overhead adalah sekitar 4/3 (~1.33x) + Data URL header (~30-50 karakter).
        // Batas karakter aman = (maxSizeBytes * 1.45) + 1024
        $maxStringLength = (int) ceil(($maxSizeBytes * 1.45) + 1024);
        if (strlen($inputTrimmed) > $maxStringLength) {
            return [
                'success' => false,
                'message' => 'Ukuran berkas melebihi batas maksimum yang diizinkan (' . round($maxSizeBytes / (1024 * 1024), 1) . ' MB).',
            ];
        }

        // 3. Ekstraksi format Data URL / Base64
        $base64Data = '';
        $claimedMime = null;

        if (str_starts_with($inputTrimmed, 'data:')) {
            // Format: data:<mime>;base64,<data>
            if (!preg_match('/^data:([a-zA-Z0-9\/\-\+\.]+);base64,(.*)$/s', $inputTrimmed, $matches)) {
                return [
                    'success' => false,
                    'message' => 'Format Data URL tidak valid atau rusak.',
                ];
            }
            $claimedMime = strtolower($matches[1]);
            $base64Data = $matches[2];
        } else {
            // Raw base64 string
            $base64Data = $inputTrimmed;
        }

        // Bersihkan whitespace atau newlines dari base64 payload
        $base64DataClean = preg_replace('/\s+/', '', $base64Data);

        if (empty($base64DataClean)) {
            return [
                'success' => false,
                'message' => 'Payload berkas Base64 kosong atau tidak memiliki data.',
            ];
        }

        // 4. Verifikasi karakter Base64 valid (RFC 4648 standard base64)
        if (!preg_match('/^[a-zA-Z0-9\/\+\=]+$/', $base64DataClean) || (strlen($base64DataClean) % 4 !== 0)) {
            return [
                'success' => false,
                'message' => 'Encoding Base64 tidak valid atau malformed.',
            ];
        }

        // 5. Strict Base64 Decoding
        $binary = base64_decode($base64DataClean, true);
        if ($binary === false) {
            return [
                'success' => false,
                'message' => 'Gagal mendekode data berkas Base64.',
            ];
        }

        $binaryLength = strlen($binary);

        // 6. Validasi Ukuran Binary Aktual
        if ($binaryLength < self::MIN_FILE_SIZE) {
            return [
                'success' => false,
                'message' => 'Berkas kosong atau data tidak lengkap (kurang dari batas minimum).',
            ];
        }

        if ($binaryLength > $maxSizeBytes) {
            return [
                'success' => false,
                'message' => 'Ukuran berkas melebihi batas maksimum yang diizinkan (' . round($maxSizeBytes / (1024 * 1024), 1) . ' MB).',
            ];
        }

        // 7. Deteksi MIME Asli Berdasarkan Magic Bytes & Content Inspection (FINFO)
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $detectedMime = $finfo->buffer($binary);

        if (!$detectedMime) {
            return [
                'success' => false,
                'message' => 'Gagal mengidentifikasi tipe konten berkas.',
            ];
        }

        // Cegah format aktif atau skrip berbahaya (SVG, XML, HTML, PHP, JS, dll)
        if (
            str_contains($detectedMime, 'svg') ||
            str_contains($detectedMime, 'xml') ||
            str_contains($detectedMime, 'html') ||
            str_contains($detectedMime, 'php') ||
            str_contains($detectedMime, 'javascript') ||
            str_contains($detectedMime, 'text/')
        ) {
            return [
                'success' => false,
                'message' => 'Format berkas (' . $detectedMime . ') tidak diizinkan atau berpotensi membahayakan keamanan.',
            ];
        }

        // Verifikasi bahwa MIME yang terdeteksi ada dalam daftar yang diizinkan
        if (!in_array($detectedMime, $allowedMimes)) {
            return [
                'success' => false,
                'message' => 'Tipe berkas tidak didukung (' . $detectedMime . '). Format yang diizinkan: ' . implode(', ', array_unique(array_map(fn($m) => self::MIME_MAP[$m] ?? $m, $allowedMimes))),
            ];
        }

        // 8. Validasi Spesifik Format File
        if (str_starts_with($detectedMime, 'image/')) {
            // Verifikasi integritas gambar menggunakan parser GD
            $imageInfo = @getimagesizefromstring($binary);
            if ($imageInfo === false || empty($imageInfo[0]) || empty($imageInfo[1])) {
                return [
                    'success' => false,
                    'message' => 'Struktur berkas gambar rusak atau tidak dapat dibaca.',
                ];
            }
        } elseif ($detectedMime === 'application/pdf') {
            // Verifikasi signature magic bytes PDF (%PDF-) pada awal berkas
            if (!str_starts_with($binary, '%PDF-')) {
                return [
                    'success' => false,
                    'message' => 'Signature berkas PDF tidak valid atau rusak.',
                ];
            }

            // Cegah PDF yang mengandung script aktif berbahaya (JavaScript, Launch action)
            if (preg_match('/\/Launch|\/JavaScript|\/JS\b/i', $binary)) {
                return [
                    'success' => false,
                    'message' => 'Berkas PDF terdeteksi mengandung script aktif atau instruksi eksekusi yang tidak diizinkan.',
                ];
            }
        }

        // 9. Simpan Berkas Secara Aman dengan Nama Acak Kriptografis
        $extension = self::MIME_MAP[$detectedMime] ?? 'bin';
        $safePrefix = Str::slug($filenamePrefix, '_');
        $randomHash = bin2hex(random_bytes(8));
        $filename = $safePrefix . '_' . time() . '_' . $randomHash . '.' . $extension;

        $isPrivateStorage = $isPrivate || str_starts_with(trim($storageRelativeDir, '/'), 'warga_dokumen');

        if ($isPrivateStorage) {
            $targetDirectory = storage_path('app/private/' . trim($storageRelativeDir, '/'));
        } else {
            $targetDirectory = public_path('uploads/' . trim($storageRelativeDir, '/'));
        }

        if (!file_exists($targetDirectory)) {
            if (!mkdir($targetDirectory, 0755, true) && !is_dir($targetDirectory)) {
                return [
                    'success' => false,
                    'message' => 'Gagal menyiapkan direktori penyimpanan di server.',
                ];
            }
        }

        $targetPath = $targetDirectory . DIRECTORY_SEPARATOR . $filename;
        $bytesWritten = @file_put_contents($targetPath, $binary, LOCK_EX);

        if ($bytesWritten === false || $bytesWritten !== $binaryLength) {
            // Jika penulisan gagal atau parsial, bersihkan file parsial jika ada
            if (file_exists($targetPath)) {
                @unlink($targetPath);
            }
            return [
                'success' => false,
                'message' => 'Gagal menulis berkas ke media penyimpanan.',
            ];
        }

        // Tentukan URL berkas yang tepat
        if ($isPrivateStorage) {
            $cleanDir = trim($storageRelativeDir, '/');
            $parts = explode('/', $cleanDir);
            $userIdParam = end($parts);
            $fileUrl = url('api/warga/dokumen/file/' . $userIdParam . '/' . $filename);
        } else {
            $fileUrl = '/uploads/' . trim($storageRelativeDir, '/') . '/' . $filename;
        }

        return [
            'success' => true,
            'url' => $fileUrl,
            'filename' => $filename,
            'size' => $binaryLength,
            'mime' => $detectedMime,
            'extension' => $extension,
            'is_private' => $isPrivateStorage,
        ];
    }
}
