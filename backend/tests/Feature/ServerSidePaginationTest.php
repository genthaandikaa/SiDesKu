<?php

namespace Tests\Feature;

use App\Models\Desa;
use App\Models\Role;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\SuratRequest;
use App\Models\SuratType;
use App\Models\User;
use App\Models\WargaProfile;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class ServerSidePaginationTest extends TestCase
{
    use DatabaseTransactions;

    protected Desa $desaA;
    protected Desa $desaB;
    protected User $adminDesaA;
    protected User $kadesDesaA;
    protected User $rtDesaA;
    protected User $adminDesaB;
    protected Rt $rt1DesaA;
    protected Rt $rt2DesaA;
    protected Rt $rtDesaB;

    protected function setUp(): void
    {
        parent::setUp();

        $roleAdmin = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'admin', 'display_name' => 'Administrator']);
        $roleKades = Role::firstOrCreate(['slug' => 'kades'], ['name' => 'kades', 'display_name' => 'Kepala Desa']);
        $roleRt = Role::firstOrCreate(['slug' => 'rt'], ['name' => 'rt', 'display_name' => 'Ketua RT']);
        $roleWarga = Role::firstOrCreate(['slug' => 'warga'], ['name' => 'warga', 'display_name' => 'Warga']);

        // 1. Setup Desa A
        $this->desaA = Desa::withoutGlobalScope('tenant')->where('id', 1)->first()
            ?? Desa::withoutGlobalScope('tenant')->firstOrCreate(
                ['kode_desa' => '35.06.04.2001'],
                [
                    'nama_desa' => 'Desa Doko',
                    'kecamatan' => 'Kecamatan Ngasem',
                    'kabupaten' => 'Kabupaten Kediri',
                    'provinsi' => 'Jawa Timur',
                    'kode_pos' => '64182',
                ]
            );

        $dusunA = \App\Models\Dusun::withoutGlobalScope('tenant')->where('desa_id', $this->desaA->id)->first()
            ?? \App\Models\Dusun::withoutGlobalScope('tenant')->create([
                'desa_id' => $this->desaA->id,
                'nama_dusun' => 'Dusun Krajan',
            ]);

        $rwA = Rw::withoutGlobalScope('tenant')->where('desa_id', $this->desaA->id)->first()
            ?? Rw::withoutGlobalScope('tenant')->create([
                'desa_id' => $this->desaA->id,
                'nomor_rw' => '01',
                'dusun_id' => $dusunA->id,
            ]);

        $this->rt1DesaA = Rt::withoutGlobalScope('tenant')->where('desa_id', $this->desaA->id)->where('nomor_rt', '01')->first()
            ?? Rt::withoutGlobalScope('tenant')->create([
                'desa_id' => $this->desaA->id,
                'rw_id' => $rwA->id,
                'nomor_rt' => '01',
            ]);

        $this->rt2DesaA = Rt::withoutGlobalScope('tenant')->where('desa_id', $this->desaA->id)->where('nomor_rt', '02')->first()
            ?? Rt::withoutGlobalScope('tenant')->create([
                'desa_id' => $this->desaA->id,
                'rw_id' => $rwA->id,
                'nomor_rt' => '02',
            ]);

        $this->adminDesaA = User::factory()->create([
            'desa_id' => $this->desaA->id,
            'role_id' => $roleAdmin->id,
        ]);

        $this->kadesDesaA = User::factory()->create([
            'desa_id' => $this->desaA->id,
            'role_id' => $roleKades->id,
        ]);

        $this->rtDesaA = User::factory()->create([
            'desa_id' => $this->desaA->id,
            'role_id' => $roleRt->id,
        ]);

        WargaProfile::create([
            'desa_id' => $this->desaA->id,
            'user_id' => $this->rtDesaA->id,
            'rt_id' => $this->rt1DesaA->id,
            'nama_lengkap' => 'Ketua RT 01 Test',
            'nik' => '350604010190' . rand(1000, 9999),
            'tempat_lahir' => 'Kediri',
            'tanggal_lahir' => '1980-01-01',
            'jenis_kelamin' => 'L',
            'alamat_ktp' => 'Jl. RT 01 Desa Sukamaju',
        ]);

        // 2. Setup Desa B
        $this->desaB = Desa::withoutGlobalScope('tenant')->where('kode_desa', '35.06.04.2002')->first()
            ?? Desa::withoutGlobalScope('tenant')->firstOrCreate(
                ['kode_desa' => '35.06.04.2002'],
                [
                    'nama_desa' => 'Desa Sukorejo',
                    'kecamatan' => 'Kecamatan Gurah',
                    'kabupaten' => 'Kabupaten Kediri',
                    'provinsi' => 'Jawa Timur',
                    'kode_pos' => '64181',
                ]
            );

        $dusunB = \App\Models\Dusun::withoutGlobalScope('tenant')->where('desa_id', $this->desaB->id)->first()
            ?? \App\Models\Dusun::withoutGlobalScope('tenant')->create([
                'desa_id' => $this->desaB->id,
                'nama_dusun' => 'Dusun Sukorame',
            ]);

        $rwB = Rw::withoutGlobalScope('tenant')->where('desa_id', $this->desaB->id)->first()
            ?? Rw::withoutGlobalScope('tenant')->create([
                'desa_id' => $this->desaB->id,
                'nomor_rw' => '01',
                'dusun_id' => $dusunB->id,
            ]);

        $this->rtDesaB = Rt::withoutGlobalScope('tenant')->where('desa_id', $this->desaB->id)->first()
            ?? Rt::withoutGlobalScope('tenant')->create([
                'desa_id' => $this->desaB->id,
                'rw_id' => $rwB->id,
                'nomor_rt' => '01',
            ]);

        $this->adminDesaB = User::factory()->create([
            'desa_id' => $this->desaB->id,
            'role_id' => $roleAdmin->id,
        ]);

        // Buat 15 warga unik di RT1 Desa A
        for ($i = 1; $i <= 15; $i++) {
            $user = User::factory()->create(['desa_id' => $this->desaA->id, 'role_id' => $roleWarga->id]);
            WargaProfile::create([
                'desa_id' => $this->desaA->id,
                'user_id' => $user->id,
                'rt_id' => $this->rt1DesaA->id,
                'nama_lengkap' => sprintf('Warga RT1 Pagination %02d', $i),
                'nik' => sprintf('3506041111%02d%04d', $i, rand(1000, 9999)),
                'tempat_lahir' => 'Kediri',
                'tanggal_lahir' => '1995-05-15',
                'jenis_kelamin' => $i % 2 === 0 ? 'P' : 'L',
                'alamat_ktp' => 'Jl. RT 01 Desa Sukamaju',
            ]);
        }

        // Buat 5 warga unik di RT2 Desa A
        for ($i = 1; $i <= 5; $i++) {
            $user = User::factory()->create(['desa_id' => $this->desaA->id, 'role_id' => $roleWarga->id]);
            WargaProfile::create([
                'desa_id' => $this->desaA->id,
                'user_id' => $user->id,
                'rt_id' => $this->rt2DesaA->id,
                'nama_lengkap' => sprintf('Warga RT2 Pagination %02d', $i),
                'nik' => sprintf('3506042222%02d%04d', $i, rand(1000, 9999)),
                'tempat_lahir' => 'Kediri',
                'tanggal_lahir' => '1992-08-20',
                'jenis_kelamin' => 'L',
                'alamat_ktp' => 'Jl. RT 02 Desa Sukamaju',
            ]);
        }

        // Buat 5 warga di Desa B
        for ($i = 1; $i <= 5; $i++) {
            $user = User::factory()->create(['desa_id' => $this->desaB->id, 'role_id' => $roleWarga->id]);
            WargaProfile::create([
                'desa_id' => $this->desaB->id,
                'user_id' => $user->id,
                'rt_id' => $this->rtDesaB->id,
                'nama_lengkap' => sprintf('Warga DesaB Pagination %02d', $i),
                'nik' => sprintf('3506049999%02d%04d', $i, rand(1000, 9999)),
                'tempat_lahir' => 'Nganjuk',
                'tanggal_lahir' => '1993-03-10',
                'jenis_kelamin' => 'P',
                'alamat_ktp' => 'Jl. Desa Makmur',
            ]);
        }
    }

    /**
     * 1. GET /api/admin/warga: Pagination default, metadata struktur, dan tenant isolation.
     */
    public function test_admin_warga_pagination_returns_correct_structure_and_tenant_data(): void
    {
        $res = $this->actingAs($this->adminDesaA)
            ->getJson('/api/admin/warga?per_page=10&page=1');

        $res->assertStatus(200);
        $res->assertJsonStructure([
            'success',
            'data',
            'pagination' => ['current_page', 'per_page', 'total', 'last_page', 'has_more'],
        ]);

        $this->assertCount(10, $res->json('data'));
        $this->assertGreaterThanOrEqual(21, $res->json('pagination.total'));
        $this->assertEquals(1, $res->json('pagination.current_page'));
        $this->assertTrue($res->json('pagination.has_more'));

        // Pastikan tidak ada data warga Desa B yang bocor ke Desa A
        foreach ($res->json('data') as $item) {
            $this->assertEquals($this->desaA->id, $item['desa_id']);
        }
    }

    /**
     * 2. GET /api/admin/warga: Validasi dan clamping parameter per_page.
     */
    public function test_admin_warga_pagination_clamps_per_page_bounds(): void
    {
        // per_page negatif di-clamp ke min 1
        $resNeg = $this->actingAs($this->adminDesaA)
            ->getJson('/api/admin/warga?per_page=-5');
        $resNeg->assertStatus(200);
        $this->assertEquals(1, $resNeg->json('pagination.per_page'));
        $this->assertCount(1, $resNeg->json('data'));

        // per_page lebih dari 100 di-clamp ke max 100
        $resOver = $this->actingAs($this->adminDesaA)
            ->getJson('/api/admin/warga?per_page=9999');
        $resOver->assertStatus(200);
        $this->assertEquals(100, $resOver->json('pagination.per_page'));
    }

    /**
     * 3. GET /api/admin/warga: Filter pencarian server-side dan halaman di luar batas.
     */
    public function test_admin_warga_pagination_search_and_out_of_bounds_page(): void
    {
        $resSearch = $this->actingAs($this->adminDesaA)
            ->getJson('/api/admin/warga?search=RT2 Pagination');
        $resSearch->assertStatus(200);
        $this->assertEquals(5, $resSearch->json('pagination.total'));

        // Out of bound page returns empty array without error
        $resEmpty = $this->actingAs($this->adminDesaA)
            ->getJson('/api/admin/warga?page=999');
        $resEmpty->assertStatus(200);
        $this->assertCount(0, $resEmpty->json('data'));
        $this->assertFalse($resEmpty->json('pagination.has_more'));
    }

    /**
     * 4. GET /api/rt/warga: Terisolasi khusus wilayah RT penugasan dan mendukung pagination.
     */
    public function test_rt_warga_pagination_is_territorially_scoped(): void
    {
        $res = $this->actingAs($this->rtDesaA)
            ->getJson('/api/rt/warga?per_page=5&page=1');

        $res->assertStatus(200);
        $res->assertJsonStructure([
            'success',
            'data',
            'pagination' => ['current_page', 'per_page', 'total', 'last_page', 'has_more'],
        ]);

        $this->assertCount(5, $res->json('data'));

        // Semua warga yang dikembalikan harus dari RT 01
        foreach ($res->json('data') as $item) {
            $this->assertEquals($this->rt1DesaA->id, $item['rt_id']);
        }
    }

    /**
     * 5. GET /api/kades/surats: Pagination antrean surat Kades dan filter status.
     */
    public function test_kades_surats_pagination_and_status_filter(): void
    {
        $suratType = SuratType::firstOrCreate(
            ['nama_surat' => 'Surat Keterangan Usaha'],
            ['desa_id' => $this->desaA->id, 'kode_surat' => 'SKU']
        );

        $wargaA = WargaProfile::where('desa_id', $this->desaA->id)->first();

        // Buat 12 surat pending_kades dan 3 surat completed
        for ($i = 1; $i <= 12; $i++) {
            SuratRequest::create([
                'desa_id' => $this->desaA->id,
                'surat_type_id' => $suratType->id,
                'warga_profile_id' => $wargaA->id,
                'nomor_resi' => sprintf('RESI-KADES-PEND-%02d-%d', $i, rand(100, 999)),
                'keperluan' => 'Pengurusan Izin Usaha Mikro',
                'qr_verification_hash' => hash('sha256', 'hash_pend_' . $i . rand(1000, 9999)),
                'status' => 'pending_kades',
            ]);
        }

        for ($i = 1; $i <= 3; $i++) {
            SuratRequest::create([
                'desa_id' => $this->desaA->id,
                'surat_type_id' => $suratType->id,
                'warga_profile_id' => $wargaA->id,
                'nomor_resi' => sprintf('RESI-KADES-COMP-%02d-%d', $i, rand(100, 999)),
                'keperluan' => 'Pengurusan Surat Keterangan Selesai',
                'qr_verification_hash' => hash('sha256', 'hash_comp_' . $i . rand(1000, 9999)),
                'status' => 'completed',
            ]);
        }

        // Test filter status pending_kades
        $res = $this->actingAs($this->kadesDesaA)
            ->getJson('/api/kades/surats?status=pending_kades&per_page=5&page=1');

        $res->assertStatus(200);
        $res->assertJsonStructure([
            'success',
            'data',
            'stats',
            'pagination' => ['current_page', 'per_page', 'total', 'last_page', 'has_more'],
        ]);

        $this->assertEquals(5, count($res->json('data')));
        $this->assertGreaterThanOrEqual(12, $res->json('pagination.total'));
        $this->assertGreaterThanOrEqual(12, $res->json('stats.pending_kades'));

        // Non-Kades ditolak 403
        $resForbidden = $this->actingAs($this->adminDesaA)
            ->getJson('/api/kades/surats');
        $resForbidden->assertStatus(403);
    }
}
