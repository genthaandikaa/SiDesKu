<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IdempotencyService
{
    /**
     * Ekstraksi dan sanitasi idempotency key dari header atau payload.
     */
    public static function extractKey(Request $request): ?string
    {
        $key = $request->header('X-Idempotency-Key')
            ?? $request->header('Idempotency-Key')
            ?? $request->input('idempotency_key');

        if (!$key || !is_string($key)) {
            return null;
        }

        $trimmed = trim($key);
        return !empty($trimmed) ? substr($trimmed, 0, 64) : null;
    }

    /**
     * Normalisasi payload untuk pembuatan hash kanonikal.
     */
    public static function normalizePayload(array $payload): array
    {
        // Abaikan field non-semantik
        unset($payload['_token'], $payload['idempotency_key']);

        ksort($payload);
        foreach ($payload as $key => $value) {
            if (is_array($value)) {
                $payload[$key] = self::normalizePayload($value);
            }
        }

        return $payload;
    }

    /**
     * Eksekusi operasi dengan jaminan idempotensi dan transaksi DB.
     *
     * @param User $user Pengguna yang melakukan request
     * @param string $endpoint Pengenal endpoint (misal: 'POST /api/surats')
     * @param string|null $key Idempotency key dari klien
     * @param array $payload Payload input untuk verifikasi integritas
     * @param callable $operation Callback bisnis yang menghasilkan JsonResponse
     * @return JsonResponse
     */
    public static function run(
        User $user,
        string $endpoint,
        ?string $key,
        array $payload,
        callable $operation
    ): JsonResponse {
        // Jika tidak ada idempotency key, eksekusi dalam DB transaction biasa
        if (!$key) {
            return DB::transaction(function () use ($operation) {
                return $operation();
            });
        }

        $normalized = self::normalizePayload($payload);
        $requestHash = hash('sha256', json_encode($normalized));

        // 1. Cek apakah record idempotensi sudah ada
        $existing = DB::table('idempotency_keys')
            ->where('user_id', $user->id)
            ->where('idempotency_key', $key)
            ->where('endpoint', $endpoint)
            ->first();

        if ($existing) {
            // Jika payload berbeda untuk key yang sama, tolak dengan 422 / 409
            if ($existing->request_hash !== $requestHash) {
                return response()->json([
                    'success' => false,
                    'message' => 'Idempotency key telah digunakan sebelumnya untuk payload permintaan yang berbeda.',
                ], 422);
            }

            // Jika status sudah selesai, kembalikan respons ter-cache tanpa eksekusi ulang
            if ($existing->status === 'completed') {
                $cachedBody = json_decode($existing->response_body, true) ?? [];
                return response()->json($cachedBody, $existing->response_code)
                    ->header('X-Idempotency-Status', 'HIT');
            }

            // Jika status masih processing dan dibuat kurang dari 30 detik lalu -> Tolak race condition
            $ageSeconds = now()->diffInSeconds($existing->created_at);
            if ($existing->status === 'processing' && $ageSeconds < 30) {
                return response()->json([
                    'success' => false,
                    'message' => 'Permintaan sedang diproses oleh permintaan lain secara bersamaan. Silakan tunggu.',
                ], 409);
            }

            // Jika stale processing (> 30s) atau failed, bersihkan untuk mencoba lagi
            DB::table('idempotency_keys')->where('id', $existing->id)->delete();
        }

        // 2. Kunci slot idempotensi dengan status 'processing' menggunakan atomic insert
        try {
            $insertedId = DB::table('idempotency_keys')->insertGetId([
                'desa_id' => $user->desa_id,
                'user_id' => $user->id,
                'idempotency_key' => $key,
                'endpoint' => $endpoint,
                'request_hash' => $requestHash,
                'status' => 'processing',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (QueryException $e) {
            // Terjadi tabrakan konkurensi tepat di milidetik yang sama
            $winner = DB::table('idempotency_keys')
                ->where('user_id', $user->id)
                ->where('idempotency_key', $key)
                ->where('endpoint', $endpoint)
                ->first();

            if ($winner && $winner->status === 'completed') {
                $cachedBody = json_decode($winner->response_body, true) ?? [];
                return response()->json($cachedBody, $winner->response_code)
                    ->header('X-Idempotency-Status', 'HIT');
            }

            return response()->json([
                'success' => false,
                'message' => 'Permintaan sedang diproses oleh permintaan lain secara bersamaan. Silakan tunggu.',
            ], 409);
        }

        // 3. Jalankan operasi bisnis di dalam transaksi database yang aman secara atomik
        try {
            $response = DB::transaction(function () use ($operation, $insertedId) {
                $res = $operation();
                $statusCode = $res->getStatusCode();

                // Jika respons berhasil (2xx), simpan cache respons dan tandai completed di dalam transaksi
                if ($statusCode >= 200 && $statusCode < 300) {
                    DB::table('idempotency_keys')->where('id', $insertedId)->update([
                        'status' => 'completed',
                        'response_code' => $statusCode,
                        'response_body' => json_encode($res->getData(true)),
                        'updated_at' => now(),
                    ]);
                }

                return $res;
            });

            $statusCode = $response->getStatusCode();
            if ($statusCode >= 200 && $statusCode < 300) {
                return $response->header('X-Idempotency-Status', 'STORED');
            }

            // Jika respons gagal/validasi error (4xx/5xx), bersihkan row agar user bisa retry payload
            DB::table('idempotency_keys')->where('id', $insertedId)->delete();
            return $response;

        } catch (\Throwable $e) {
            // Rollback lock idempotensi jika ada unhandled error agar tidak terkunci permanen
            DB::table('idempotency_keys')->where('id', $insertedId)->delete();
            throw $e;
        }
    }
}
