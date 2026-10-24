<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use App\Services\WebPushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushNotificationController extends Controller
{
    public function __construct(protected WebPushService $webPushService)
    {
    }

    /**
     * Dapatkan Public VAPID Key untuk pendaftaran push client-side
     */
    public function getPublicKey(): JsonResponse
    {
        $key = $this->webPushService->getPublicKey();

        return response()->json([
            'success' => true,
            'data' => [
                'publicKey' => $key,
                'isConfigured' => !empty($key),
            ],
        ]);
    }

    /**
     * Simpan PushSubscription baru milik user terautentikasi
     */
    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string', 'url', 'max:500'],
            'keys' => ['required', 'array'],
            'keys.p256dh' => ['required', 'string'],
            'keys.auth' => ['required', 'string'],
            'contentEncoding' => ['nullable', 'string', 'max:32'],
        ], [
            'endpoint.required' => 'Endpoint Web Push browser wajib disertakan.',
            'endpoint.url' => 'Endpoint harus berupa URL yang valid.',
            'keys.required' => 'Kunci enkripsi browser wajib disertakan.',
            'keys.p256dh.required' => 'Kunci publik p256dh wajib disertakan.',
            'keys.auth.required' => 'Kunci autentikasi push wajib disertakan.',
        ]);

        $user = $request->user();

        $subscription = $this->webPushService->saveSubscription(
            $user,
            $validated,
            $request->userAgent()
        );

        return response()->json([
            'success' => true,
            'message' => 'Perangkat berhasil didaftarkan untuk notifikasi Web Push SiDesKu.',
            'data' => [
                'id' => $subscription->id,
                'created_at' => $subscription->created_at,
            ],
        ]);
    }

    /**
     * Hapus PushSubscription dari user terautentikasi
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string'],
        ], [
            'endpoint.required' => 'Endpoint browser wajib disertakan untuk menghapus langganan.',
        ]);

        $user = $request->user();

        $removed = $this->webPushService->removeSubscription($user, $validated['endpoint']);

        return response()->json([
            'success' => true,
            'message' => $removed
                ? 'Notifikasi Web Push pada perangkat ini telah dinonaktifkan.'
                : 'Langganan notifikasi tidak ditemukan atau sudah tidak aktif.',
        ]);
    }

    /**
     * Kirim notifikasi uji coba ke perangkat user yang sedang login
     */
    public function sendTestPush(Request $request): JsonResponse
    {
        $user = $request->user();

        $activeSubscriptions = PushSubscription::where('user_id', $user->id)->count();

        if ($activeSubscriptions === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Belum ada perangkat yang terdaftar untuk notifikasi push pada akun ini.',
            ], 422);
        }

        $sentCount = $this->webPushService->sendToUser(
            $user,
            'SiDesKu: Uji Coba Berhasil',
            'Notifikasi Web Push aktif dan berhasil terhubung dengan akun Anda.',
            '/dashboard',
            'sidesku-test-push'
        );

        return response()->json([
            'success' => true,
            'message' => "Notifikasi uji coba berhasil dikirim ke {$sentCount} perangkat terdaftar.",
            'data' => [
                'sentCount' => $sentCount,
                'totalSubscriptions' => $activeSubscriptions,
            ],
        ]);
    }

    /**
     * Cek status aktif notifikasi push akun saat ini
     */
    public function getStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        $count = PushSubscription::where('user_id', $user->id)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'hasActiveSubscription' => $count > 0,
                'subscriptionCount' => $count,
                'isConfigured' => !empty($this->webPushService->getPublicKey()),
            ],
        ]);
    }
}

