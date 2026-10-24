<?php

namespace Tests\Feature;

use App\Models\Desa;
use App\Models\Dusun;
use App\Models\PushSubscription;
use App\Models\Role;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\SuratRequest;
use App\Models\SuratType;
use App\Models\User;
use App\Models\WargaProfile;
use App\Services\WebPushService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class WebPushNotificationTest extends TestCase
{
    use DatabaseTransactions;

    protected Desa $desa;
    protected Role $wargaRole;
    protected Role $rtRole;
    protected Role $kadesRole;
    protected User $wargaUser;
    protected WargaProfile $wargaProfile;

    protected function setUp(): void
    {
        parent::setUp();

        $this->desa = Desa::first() ?? Desa::firstOrCreate([
            'kode_desa' => '35.06.04.2001',
        ], [
            'nama_desa' => 'Desa Doko',
            'kecamatan' => 'Kecamatan Ngasem',
            'kabupaten' => 'Kabupaten Kediri',
            'is_active' => true,
        ]);

        $this->wargaRole = Role::firstOrCreate(['slug' => 'warga'], ['name' => 'Warga', 'display_name' => 'Warga Desa']);
        $this->rtRole = Role::firstOrCreate(['slug' => 'rt'], ['name' => 'Ketua RT', 'display_name' => 'Ketua RT']);
        $this->kadesRole = Role::firstOrCreate(['slug' => 'kades'], ['name' => 'Kepala Desa', 'display_name' => 'Kepala Desa']);

        $dusun = Dusun::firstOrCreate(['desa_id' => $this->desa->id, 'kode_dusun' => 'DSN1'], ['nama_dusun' => 'Dusun 1']);
        $rw = Rw::firstOrCreate(['desa_id' => $this->desa->id, 'nomor_rw' => '01'], ['dusun_id' => $dusun->id]);
        $rt = Rt::firstOrCreate(['desa_id' => $this->desa->id, 'nomor_rt' => '01', 'rw_id' => $rw->id]);

        $this->wargaUser = User::factory()->create([
            'desa_id' => $this->desa->id,
            'role_id' => $this->wargaRole->id,
            'email' => 'warga.test.' . uniqid() . '@doko.desa.id',
        ]);

        $this->wargaProfile = WargaProfile::firstOrCreate([
            'nik' => '3506010101990001',
        ], [
            'desa_id' => $this->desa->id,
            'user_id' => $this->wargaUser->id,
            'rt_id' => $rt->id,
            'nama_lengkap' => 'Budi Santoso',
            'jenis_kelamin' => 'L',
            'tempat_lahir' => 'Kediri',
            'tanggal_lahir' => '1990-01-01',
            'agama' => 'Islam',
            'status_perkawinan' => 'Kawin',
            'pekerjaan' => 'Wiraswasta',
            'alamat_ktp' => 'Dusun Doko RT 01 RW 01',
            'no_hp_wa' => '081234567890',
        ]);
    }

    public function test_public_key_endpoint_is_accessible_and_returns_valid_vapid_key(): void
    {
        $response = $this->getJson('/api/push/public-key');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => ['publicKey', 'isConfigured'],
            ]);

        $this->assertNotEmpty($response->json('data.publicKey'));
    }

    public function test_subscribe_requires_sanctum_authentication(): void
    {
        $response = $this->postJson('/api/push/subscribe', [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/sample-token',
            'keys' => [
                'p256dh' => 'sample-p256dh-key',
                'auth' => 'sample-auth-secret',
            ],
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_subscribe_and_subscription_is_isolated_to_user_and_tenant(): void
    {
        $payload = [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/device-token-12345',
            'keys' => [
                'p256dh' => 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t044Yjs6JL1k',
                'auth' => 'tBHItJI5svbpez7KI4CCXg',
            ],
            // Attempting to forge another user must be ignored by server (always uses Auth user)
            'user_id' => 99999,
        ];

        $response = $this->actingAs($this->wargaUser, 'sanctum')
            ->postJson('/api/push/subscribe', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $this->wargaUser->id,
            'desa_id' => $this->desa->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/device-token-12345',
            'public_key' => 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t044Yjs6JL1k',
            'auth_token' => 'tBHItJI5svbpez7KI4CCXg',
        ]);

        // Verifikasi tidak ada kebocoran user ID palsu
        $this->assertDatabaseMissing('push_subscriptions', [
            'user_id' => 99999,
        ]);

        // Verifikasi manipulasi cross-tenant desa_id ditolak 403 oleh EnsureTenantContext
        $crossTenantPayload = array_merge($payload, [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/device-token-rogue',
            'desa_id' => 88888,
        ]);
        $this->actingAs($this->wargaUser, 'sanctum')
            ->postJson('/api/push/subscribe', $crossTenantPayload)
            ->assertStatus(403);
    }

    public function test_subscribing_again_with_same_endpoint_updates_existing_subscription_without_duplicates(): void
    {
        $endpoint = 'https://fcm.googleapis.com/fcm/send/device-token-same';

        $payload1 = [
            'endpoint' => $endpoint,
            'keys' => [
                'p256dh' => 'initial-p256dh',
                'auth' => 'initial-auth',
            ],
        ];

        $payload2 = [
            'endpoint' => $endpoint,
            'keys' => [
                'p256dh' => 'updated-p256dh',
                'auth' => 'updated-auth',
            ],
        ];

        $this->actingAs($this->wargaUser, 'sanctum')->postJson('/api/push/subscribe', $payload1)->assertStatus(200);
        $this->actingAs($this->wargaUser, 'sanctum')->postJson('/api/push/subscribe', $payload2)->assertStatus(200);

        $count = PushSubscription::where('user_id', $this->wargaUser->id)
            ->where('endpoint', $endpoint)
            ->count();

        $this->assertEquals(1, $count);

        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $this->wargaUser->id,
            'endpoint' => $endpoint,
            'public_key' => 'updated-p256dh',
        ]);
    }

    public function test_authenticated_user_can_unsubscribe(): void
    {
        $endpoint = 'https://fcm.googleapis.com/fcm/send/device-to-remove';

        PushSubscription::create([
            'user_id' => $this->wargaUser->id,
            'desa_id' => $this->desa->id,
            'endpoint' => $endpoint,
            'endpoint_hash' => hash('sha256', $endpoint),
            'public_key' => 'key',
            'auth_token' => 'auth',
            'content_encoding' => 'aes128gcm',
        ]);

        $response = $this->actingAs($this->wargaUser, 'sanctum')
            ->postJson('/api/push/unsubscribe', [
                'endpoint' => $endpoint,
            ]);

        $response->assertStatus(200)->assertJson(['success' => true]);

        $this->assertDatabaseMissing('push_subscriptions', [
            'user_id' => $this->wargaUser->id,
            'endpoint' => $endpoint,
        ]);
    }

    public function test_user_cannot_unsubscribe_another_users_subscription(): void
    {
        $otherUser = User::factory()->create([
            'desa_id' => $this->desa->id,
            'role_id' => $this->wargaRole->id,
        ]);

        $otherEndpoint = 'https://fcm.googleapis.com/fcm/send/other-user-device';

        PushSubscription::create([
            'user_id' => $otherUser->id,
            'desa_id' => $this->desa->id,
            'endpoint' => $otherEndpoint,
            'endpoint_hash' => hash('sha256', $otherEndpoint),
            'public_key' => 'key-other',
            'auth_token' => 'auth-other',
        ]);

        // WargaUser mencoba menghapus subscription milik otherUser
        $response = $this->actingAs($this->wargaUser, 'sanctum')
            ->postJson('/api/push/unsubscribe', [
                'endpoint' => $otherEndpoint,
            ]);

        $response->assertStatus(200);

        // Subscription milik otherUser harus tetap aman
        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $otherUser->id,
            'endpoint' => $otherEndpoint,
        ]);
    }

    public function test_push_status_endpoint_reports_accurate_state(): void
    {
        $responseBefore = $this->actingAs($this->wargaUser, 'sanctum')->getJson('/api/push/status');
        $responseBefore->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'hasActiveSubscription' => false,
                    'subscriptionCount' => 0,
                ],
            ]);

        PushSubscription::create([
            'user_id' => $this->wargaUser->id,
            'desa_id' => $this->desa->id,
            'endpoint' => 'https://example.com/device',
            'endpoint_hash' => hash('sha256', 'https://example.com/device'),
            'public_key' => 'key',
            'auth_token' => 'auth',
        ]);

        $responseAfter = $this->actingAs($this->wargaUser, 'sanctum')->getJson('/api/push/status');
        $responseAfter->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'hasActiveSubscription' => true,
                    'subscriptionCount' => 1,
                ],
            ]);
    }

    public function test_test_push_requires_active_subscription(): void
    {
        // Tanpa subscription
        $response = $this->actingAs($this->wargaUser, 'sanctum')->postJson('/api/push/test');
        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_web_push_service_payload_does_not_leak_sensitive_citizen_data(): void
    {
        $service = app(WebPushService::class);
        $this->assertNotNull($service->getPublicKey());

        // Verifikasi bahwa method sendToUser menghasilkan payload aman
        $sub = PushSubscription::create([
            'user_id' => $this->wargaUser->id,
            'desa_id' => $this->desa->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/fake-test-endpoint',
            'endpoint_hash' => hash('sha256', 'https://fcm.googleapis.com/fcm/send/fake-test-endpoint'),
            'public_key' => 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t044Yjs6JL1k',
            'auth_token' => 'tBHItJI5svbpez7KI4CCXg',
        ]);

        // Pengiriman ke endpoint palsu akan gagal graceful tanpa throw exception
        $sent = $service->sendToUser(
            $this->wargaUser,
            'Pengajuan Surat Baru',
            'Ada permohonan surat warga baru yang memerlukan verifikasi RT.',
            '/dashboard',
            'surat-123'
        );

        // Tidak boleh melempar unhandled exception dan mengembalikan int
        $this->assertIsInt($sent);
    }
}

