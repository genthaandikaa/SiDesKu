<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\Rt;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class WebPushService
{
    protected ?WebPush $webPush = null;

    public function __construct()
    {
        $this->ensureOpenSslConfig();
    }

    /**
     * Pastikan OPENSSL_CONF terdefinisi pada Windows environment
     */
    protected function ensureOpenSslConfig(): void
    {
        if (DIRECTORY_SEPARATOR === '\\' && !getenv('OPENSSL_CONF')) {
            $possiblePaths = [
                'C:\Users\genn\.config\herd\openssl.cnf',
                'C:\Users\genn\.config\herd\bin\php84\extras\ssl\openssl.cnf',
                'C:\Program Files\Common Files\SSL\openssl.cnf',
            ];
            foreach ($possiblePaths as $path) {
                if (file_exists($path)) {
                    putenv('OPENSSL_CONF=' . $path);
                    break;
                }
            }
        }
    }

    /**
     * Dapatkan Public VAPID Key untuk client-side
     */
    public function getPublicKey(): ?string
    {
        return config('services.webpush.public_key') ?: env('VAPID_PUBLIC_KEY');
    }

    /**
     * Inisialisasi WebPush client secara lazy
     */
    protected function getWebPushClient(): ?WebPush
    {
        if ($this->webPush !== null) {
            return $this->webPush;
        }

        $publicKey = $this->getPublicKey();
        $privateKey = config('services.webpush.private_key') ?: env('VAPID_PRIVATE_KEY');
        $subject = config('services.webpush.subject') ?: env('VAPID_SUBJECT', 'mailto:admin@sidesku.desa.id');

        if (!$publicKey || !$privateKey) {
            Log::info('[WebPush] VAPID keys belum dikonfigurasi di backend, notifikasi push ditangguhkan.');
            return null;
        }

        try {
            $this->webPush = new WebPush([
                'VAPID' => [
                    'subject' => $subject,
                    'publicKey' => $publicKey,
                    'privateKey' => $privateKey,
                ],
            ]);
            // Timeout wajar 10 detik agar tidak menggantung request
            $this->webPush->setReuseVAPIDHeaders(true);
            return $this->webPush;
        } catch (\Throwable $e) {
            Log::warning('[WebPush] Gagal menginisialisasi WebPush client: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Simpan atau perbarui subscription milik user terautentikasi
     */
    public function saveSubscription(User $user, array $subscriptionData, ?string $userAgent = null): PushSubscription
    {
        $endpoint = (string) ($subscriptionData['endpoint'] ?? '');
        $keys = $subscriptionData['keys'] ?? [];
        $publicKey = (string) ($keys['p256dh'] ?? '');
        $authToken = (string) ($keys['auth'] ?? '');
        $encoding = (string) ($subscriptionData['contentEncoding'] ?? 'aes128gcm');

        if (empty($endpoint) || empty($publicKey) || empty($authToken)) {
            throw new \InvalidArgumentException('Format subscription push tidak lengkap (endpoint/keys kosong).');
        }

        $endpointHash = hash('sha256', $endpoint);

        return PushSubscription::updateOrCreate(
            [
                'user_id' => $user->id,
                'endpoint_hash' => $endpointHash,
            ],
            [
                'desa_id' => $user->desa_id,
                'endpoint' => $endpoint,
                'public_key' => $publicKey,
                'auth_token' => $authToken,
                'content_encoding' => $encoding,
                'user_agent' => $userAgent ? substr($userAgent, 0, 255) : null,
                'last_used_at' => now(),
            ]
        );
    }

    /**
     * Hapus subscription ketika user mematikan notifikasi
     */
    public function removeSubscription(User $user, string $endpoint): bool
    {
        $endpointHash = hash('sha256', $endpoint);

        $deleted = PushSubscription::where('user_id', $user->id)
            ->where('endpoint_hash', $endpointHash)
            ->delete();

        return $deleted > 0;
    }

    /**
     * Kirim notifikasi ke satu subscription spesifik
     */
    public function sendNotification(PushSubscription $subscription, array $payload): bool
    {
        $webPush = $this->getWebPushClient();
        if (!$webPush) {
            return false;
        }

        try {
            $subObj = Subscription::create([
                'endpoint' => $subscription->endpoint,
                'publicKey' => $subscription->public_key,
                'authToken' => $subscription->auth_token,
                'contentEncoding' => $subscription->content_encoding ?: 'aes128gcm',
            ]);

            // Bersihkan payload dari data sensitif (NIK, nama lengkap pribadi, alamat)
            $cleanPayload = [
                'title' => $payload['title'] ?? 'SiDesKu Notifikasi',
                'body' => $payload['body'] ?? 'Ada pembaruan layanan desa untuk Anda.',
                'icon' => $payload['icon'] ?? '/logo-kediri.png',
                'badge' => $payload['badge'] ?? '/favicon.svg',
                'url' => $payload['url'] ?? '/dashboard',
                'tag' => $payload['tag'] ?? 'sidesku-notif',
                'timestamp' => now()->timestamp,
            ];

            $report = $webPush->sendOneNotification(
                $subObj,
                json_encode($cleanPayload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
            );

            if ($report->isSuccess()) {
                $subscription->update(['last_used_at' => now()]);
                return true;
            }

            // Jika subscription kedaluwarsa atau ditolak provider (404/410) -> bersihkan database
            if ($report->isSubscriptionExpired()) {
                Log::info('[WebPush] Subscription expired or unsubscribed, removing from DB: ' . $subscription->id);
                $subscription->delete();
            } else {
                Log::warning('[WebPush] Provider delivery warning: ' . $report->getReason());
            }

            return false;
        } catch (\Throwable $e) {
            Log::warning('[WebPush] Error sending notification: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Kirim notifikasi ke seluruh perangkat aktif milik satu User
     */
    public function sendToUser(User $user, string $title, string $body, ?string $url = null, ?string $tag = null): int
    {
        $subscriptions = PushSubscription::where('user_id', $user->id)->get();
        if ($subscriptions->isEmpty()) {
            return 0;
        }

        $successCount = 0;
        $payload = [
            'title' => $title,
            'body' => $body,
            'url' => $url ?: '/dashboard',
            'tag' => $tag ?: 'sidesku-user-' . $user->id,
        ];

        foreach ($subscriptions as $sub) {
            if ($this->sendNotification($sub, $payload)) {
                $successCount++;
            }
        }

        return $successCount;
    }

    /**
     * Kirim notifikasi ke seluruh user dengan Role tertentu di desa tertentu
     */
    public function sendToRole(string $roleSlug, int $desaId, string $title, string $body, ?string $url = null, ?string $tag = null): int
    {
        $users = User::where('desa_id', $desaId)
            ->whereHas('role', function ($q) use ($roleSlug) {
                if ($roleSlug === 'admin' || $roleSlug === 'admin_desa') {
                    $q->whereIn('slug', ['admin', 'admin_desa']);
                } elseif ($roleSlug === 'bendahara' || $roleSlug === 'bendahara_desa') {
                    $q->whereIn('slug', ['bendahara', 'bendahara_desa']);
                } else {
                    $q->where('slug', $roleSlug);
                }
            })
            ->get();

        $count = 0;
        foreach ($users as $u) {
            $count += $this->sendToUser($u, $title, $body, $url, $tag);
        }

        return $count;
    }

    /**
     * Kirim notifikasi ke pengurus RT (Ketua RT / Sekretaris RT) yang relevan
     */
    public function sendToRtOfficials(int $desaId, int $rtId, string $title, string $body, ?string $url = null, ?string $tag = null): int
    {
        $rt = Rt::where('desa_id', $desaId)->where('id', $rtId)->first();
        if (!$rt) {
            return 0;
        }

        $userIds = array_filter([
            $rt->ketua_rt_user_id,
            $rt->sekretaris_rt_user_id,
        ]);

        if (empty($userIds)) {
            return 0;
        }

        $users = User::whereIn('id', $userIds)->get();
        $count = 0;
        foreach ($users as $u) {
            $count += $this->sendToUser($u, $title, $body, $url, $tag);
        }

        return $count;
    }
}

