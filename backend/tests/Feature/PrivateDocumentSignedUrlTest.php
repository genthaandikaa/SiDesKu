<?php

namespace Tests\Feature;

use App\Models\Desa;
use App\Models\Role;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\User;
use App\Models\WargaProfile;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class PrivateDocumentSignedUrlTest extends TestCase
{
    use DatabaseTransactions;

    protected Desa $desa1;
    protected Desa $desa2;
    protected User $userWarga1;
    protected User $userWarga2DesaB;
    protected WargaProfile $profile1;
    protected string $testFilename = 'test_ktp_doc.jpg';

    protected function setUp(): void
    {
        parent::setUp();

        $this->desa1 = Desa::withoutGlobalScope('tenant')->where('id', 1)->first()
            ?? Desa::withoutGlobalScope('tenant')->firstOrCreate(
                ['kode_desa' => '35.06.04.2001'],
                ['nama_desa' => 'Desa Doko', 'kecamatan' => 'Ngasem', 'kabupaten' => 'Kediri', 'provinsi' => 'Jawa Timur', 'kode_pos' => '64182', 'is_active' => true]
            );

        $this->desa2 = Desa::withoutGlobalScope('tenant')->where('kode_desa', '35.06.04.2002')->first()
            ?? Desa::withoutGlobalScope('tenant')->create(
                ['nama_desa' => 'Desa Sukorame', 'kode_desa' => '35.06.04.2002', 'kecamatan' => 'Mojoroto', 'kabupaten' => 'Kediri', 'provinsi' => 'Jawa Timur', 'kode_pos' => '64114', 'is_active' => true]
            );

        $roleWarga = Role::firstOrCreate(['slug' => 'warga'], ['name' => 'warga', 'display_name' => 'Warga']);

        $dusun1 = \App\Models\Dusun::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desa1->id],
            ['nama_dusun' => 'Dusun Krajan']
        );

        $rw1 = Rw::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desa1->id, 'nomor_rw' => '01'],
            ['dusun_id' => $dusun1->id]
        );
        $rt1 = Rt::withoutGlobalScope('tenant')->firstOrCreate(['desa_id' => $this->desa1->id, 'rw_id' => $rw1->id, 'nomor_rt' => '01']);

        $this->userWarga1 = User::factory()->create([
            'desa_id' => $this->desa1->id,
            'role_id' => $roleWarga->id,
        ]);

        $this->profile1 = WargaProfile::create([
            'desa_id' => $this->desa1->id,
            'user_id' => $this->userWarga1->id,
            'rt_id' => $rt1->id,
            'nik' => '350604123456' . rand(1000, 9999),
            'nama_lengkap' => 'Warga Dokumen Test',
            'tempat_lahir' => 'Kediri',
            'tanggal_lahir' => '1990-01-01',
            'jenis_kelamin' => 'L',
            'alamat_ktp' => 'Jl. Doko Indah',
        ]);

        $this->userWarga2DesaB = User::factory()->create([
            'desa_id' => $this->desa2->id,
            'role_id' => $roleWarga->id,
        ]);

        // Siapkan dummy file di storage privat warga
        $dir = storage_path('app/private/warga_dokumen/' . $this->userWarga1->id);
        if (!is_dir($dir)) {
            @mkdir($dir, 0755, true);
        }
        file_put_contents($dir . DIRECTORY_SEPARATOR . $this->testFilename, 'DUMMY_IMAGE_BINARY_DATA');
    }

    protected function tearDown(): void
    {
        $filePath = storage_path('app/private/warga_dokumen/' . $this->userWarga1->id . DIRECTORY_SEPARATOR . $this->testFilename);
        if (file_exists($filePath)) {
            @unlink($filePath);
        }
        parent::tearDown();
    }

    /**
     * 1. Akses tanpa otentikasi dan tanpa signed URL ditolak 401.
     */
    public function test_unauthenticated_access_without_signature_is_rejected(): void
    {
        $res = $this->getJson("/api/warga/dokumen/file/{$this->userWarga1->id}/{$this->testFilename}");
        $res->assertStatus(401);
        $res->assertJsonFragment(['success' => false]);
    }

    /**
     * 2. Pengiriman raw token via query string (?token=...) tidak lagi berlaku dan ditolak 401.
     */
    public function test_raw_token_in_query_string_is_ignored_and_rejected(): void
    {
        $token = $this->userWarga1->createToken('test')->plainTextToken;
        $res = $this->getJson("/api/warga/dokumen/file/{$this->userWarga1->id}/{$this->testFilename}?token={$token}");
        $res->assertStatus(401);
    }

    /**
     * 3. Akses dengan signed URL yang dimanipulasi (tampered) ditolak 403.
     */
    public function test_tampered_signed_url_is_rejected_with_403(): void
    {
        $signedUrl = URL::temporarySignedRoute(
            'api.warga.dokumen.file',
            now()->addMinutes(10),
            ['userId' => $this->userWarga1->id, 'filename' => $this->testFilename]
        );

        // Ubah filename di URL yang sudah ditandatangani
        $tamperedUrl = str_replace($this->testFilename, 'other_file.jpg', $signedUrl);

        $res = $this->get($tamperedUrl);
        $res->assertStatus(403);
        $res->assertJsonFragment(['success' => false]);
    }

    /**
     * 4. Akses dengan signed URL yang sudah kedaluwarsa ditolak 403.
     */
    public function test_expired_signed_url_is_rejected_with_403(): void
    {
        // URL kedaluwarsa 5 menit lalu
        $expiredUrl = URL::temporarySignedRoute(
            'api.warga.dokumen.file',
            now()->subMinutes(5),
            ['userId' => $this->userWarga1->id, 'filename' => $this->testFilename]
        );

        $res = $this->get($expiredUrl);
        $res->assertStatus(403);
    }

    /**
     * 5. Akses dengan temporary signed URL yang sah berhasil (200 OK dengan header privasi).
     */
    public function test_valid_temporary_signed_url_succeeds_with_privacy_headers(): void
    {
        $signedUrl = URL::temporarySignedRoute(
            'api.warga.dokumen.file',
            now()->addMinutes(30),
            ['userId' => $this->userWarga1->id, 'filename' => $this->testFilename]
        );

        $res = $this->get($signedUrl);
        $res->assertStatus(200);
        $this->assertEquals('DUMMY_IMAGE_BINARY_DATA', file_get_contents($res->getFile()->getPathname()));
        $this->assertStringContainsString('no-store', $res->headers->get('Cache-Control'));
        $this->assertEquals('nosniff', $res->headers->get('X-Content-Type-Options'));
    }

    /**
     * 6. Akses dengan Bearer token yang sah dari pemilik dokumen berhasil.
     */
    public function test_bearer_token_authenticated_access_succeeds(): void
    {
        $res = $this->actingAs($this->userWarga1)
            ->get("/api/warga/dokumen/file/{$this->userWarga1->id}/{$this->testFilename}");

        $res->assertStatus(200);
        $this->assertEquals('DUMMY_IMAGE_BINARY_DATA', file_get_contents($res->getFile()->getPathname()));
    }

    /**
     * 7. Akses lintas desa ditolak 403 (User Desa B mencoba membuka dokumen warga Desa A).
     */
    public function test_cross_tenant_document_access_is_forbidden(): void
    {
        $res = $this->actingAs($this->userWarga2DesaB)
            ->get("/api/warga/dokumen/file/{$this->userWarga1->id}/{$this->testFilename}");

        $res->assertStatus(403);
    }

    /**
     * 8. Endpoint getSignedUrl menghasilkan URL bertanda tangan yang valid.
     */
    public function test_get_signed_url_endpoint_generates_valid_url(): void
    {
        $res = $this->actingAs($this->userWarga1)
            ->getJson("/api/warga/dokumen/signed-url?filename={$this->testFilename}");

        $res->assertStatus(200);
        $res->assertJsonFragment(['success' => true]);
        $signedUrl = $res->json('signed_url');
        $this->assertNotEmpty($signedUrl);
        $this->assertStringContainsString('signature=', $signedUrl);

        // Uji URL hasil generate
        $fileRes = $this->get($signedUrl);
        $fileRes->assertStatus(200);
    }
}
