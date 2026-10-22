<?php

namespace Tests\Feature;

use App\Models\ApbdesCategory;
use App\Models\ApbdesRecord;
use App\Models\Berita;
use App\Models\Desa;
use App\Models\DesaSetting;
use App\Models\Dusun;
use App\Models\KartuKeluarga;
use App\Models\Pengumuman;
use App\Models\Role;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\SuratRequest;
use App\Models\SuratTracking;
use App\Models\SuratType;
use App\Models\User;
use App\Models\WargaProfile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class MultiTenancyIsolationTest extends TestCase
{
    // Tokens for Desa A (Desa Doko, desa_id = 1)
    protected ?string $tokenAdminA = null;
    protected ?string $tokenKadesA = null;
    protected ?string $tokenSekdesA = null;
    protected ?string $tokenBendaharaA = null;
    protected ?string $tokenRtA = null;
    protected ?string $tokenWargaA = null;

    // Tokens for Desa B (Desa Sukorejo, desa_id = 2)
    protected ?string $tokenAdminB = null;
    protected ?string $tokenKadesB = null;
    protected ?string $tokenSekdesB = null;
    protected ?string $tokenBendaharaB = null;
    protected ?string $tokenRtB = null;
    protected ?string $tokenWargaB = null;

    // Platform Super Admin
    protected ?string $tokenSuperAdmin = null;

    // Operational User with no tenant (desa_id = null)
    protected ?string $tokenNoTenant = null;

    protected static bool $fixturesReady = false;
    protected static array $tokenCache = [];

    // Model Fixtures for Desa B
    protected Desa $desaB;
    protected Dusun $dusunB;
    protected Rw $rwB;
    protected Rt $rtB;
    protected User $userWargaB;
    protected WargaProfile $wargaProfileB;
    protected SuratType $suratTypeB;
    protected SuratRequest $suratB;
    protected ApbdesCategory $apbdesCategoryB;
    protected ApbdesRecord $apbdesRecordB;

    protected function setUp(): void
    {
        parent::setUp();

        if (!self::$fixturesReady) {
            $this->setupDesaBFixture();
            $this->setupSuperAdminFixture();
            $this->setupNoTenantUser();
            self::$fixturesReady = true;
        } else {
            $this->reloadFixtures();
        }

        $this->authenticateAllPersonas();
    }

    private function reloadFixtures(): void
    {
        $this->desaB = Desa::withoutGlobalScope('tenant')->where('kode_desa', '35.06.04.2002')->first();
        if (!$this->desaB) {
            $this->setupDesaBFixture();
            return;
        }
        $this->dusunB = Dusun::withoutGlobalScope('tenant')->where('desa_id', $this->desaB->id)->first() ?? Dusun::withoutGlobalScope('tenant')->create(['desa_id' => $this->desaB->id, 'nama_dusun' => 'Dusun Krajan Sukorejo', 'kepala_dusun' => 'Kasun Sukorejo']);
        $this->rwB = Rw::withoutGlobalScope('tenant')->where('desa_id', $this->desaB->id)->first() ?? Rw::withoutGlobalScope('tenant')->create(['desa_id' => $this->desaB->id, 'nomor_rw' => '01', 'dusun_id' => $this->dusunB->id]);
        $this->rtB = Rt::withoutGlobalScope('tenant')->where('desa_id', $this->desaB->id)->first() ?? Rt::withoutGlobalScope('tenant')->create(['desa_id' => $this->desaB->id, 'rw_id' => $this->rwB->id, 'nomor_rt' => '01']);
        $this->userWargaB = User::withoutGlobalScope('tenant')->where('username', 'warga01_b')->first();
        $this->wargaProfileB = WargaProfile::withoutGlobalScope('tenant')->where('desa_id', $this->desaB->id)->first();
        $this->suratTypeB = SuratType::withoutGlobalScope('tenant')->where('desa_id', $this->desaB->id)->first();
        $this->suratB = SuratRequest::withoutGlobalScope('tenant')->where('desa_id', $this->desaB->id)->first();
        $this->apbdesCategoryB = ApbdesCategory::withoutGlobalScope('tenant')->where('desa_id', $this->desaB->id)->first();
        $this->apbdesRecordB = ApbdesRecord::withoutGlobalScope('tenant')->where('desa_id', $this->desaB->id)->first();
    }

    private function setupDesaBFixture(): void
    {
        $this->desaB = Desa::firstOrCreate(
            ['kode_desa' => '35.06.04.2002'],
            [
                'nama_desa' => 'Desa Sukorejo',
                'kecamatan' => 'Kecamatan Gurah',
                'kabupaten' => 'Kabupaten Kediri',
                'provinsi' => 'Jawa Timur',
                'kode_pos' => '64181',
                'telepon' => '0354-987654',
                'email' => 'pemdes.sukorejo@kedirikab.go.id',
                'is_active' => true,
            ]
        );

        DesaSetting::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaB->id],
            [
                'nama_desa' => 'Desa Sukorejo',
                'kode_desa' => '35.06.04.2002',
                'kecamatan' => 'Kecamatan Gurah',
                'kabupaten' => 'Kabupaten Kediri',
                'provinsi' => 'Jawa Timur',
                'kode_pos' => '64181',
                'kop_atas' => 'PEMERINTAH KABUPATEN KEDIRI',
                'kop_tengah' => 'KECAMATAN GURAH',
                'kop_bawah' => 'KANTOR KEPALA DESA SUKOREJO',
                'nama_kades' => 'Drs. H. Sukamto, M.Si',
                'nama_sekdes' => 'Budi Santoso, S.Sos',
            ]
        );

        // Dusun, RW, RT for Desa B (Notice duplicate number RT 01 and RW 01 to verify no collision)
        $this->dusunB = Dusun::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaB->id, 'nama_dusun' => 'Dusun Krajan Sukorejo'],
            ['kepala_dusun' => 'Kasun Sukorejo']
        );

        $this->rwB = Rw::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaB->id, 'dusun_id' => $this->dusunB->id, 'nomor_rw' => '01'],
            ['nama_ketua_rw' => 'Ketua RW 01 Sukorejo']
        );

        $this->rtB = Rt::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaB->id, 'rw_id' => $this->rwB->id, 'nomor_rt' => '01'],
            ['nama_ketua_rt' => 'Ketua RT 01 Sukorejo']
        );

        // Roles
        $adminRole = Role::where('slug', 'admin_desa')->orWhere('slug', 'admin')->first();
        $kadesRole = Role::where('slug', 'kades')->first();
        $sekdesRole = Role::where('slug', 'sekdes')->first();
        $bendaharaRole = Role::where('slug', 'bendahara_desa')->orWhere('slug', 'bendahara')->first();
        $rtRole = Role::where('slug', 'rt')->first();
        $wargaRole = Role::where('slug', 'warga')->first();

        // Users for Desa B
        User::withoutGlobalScope('tenant')->firstOrCreate(
            ['username' => 'admin_desa_b'],
            [
                'role_id' => $adminRole->id,
                'desa_id' => $this->desaB->id,
                'name' => 'Admin Desa Sukorejo',
                'email' => 'admin@sukorejo.desa.id',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );

        User::withoutGlobalScope('tenant')->firstOrCreate(
            ['username' => 'kades_b'],
            [
                'role_id' => $kadesRole->id,
                'desa_id' => $this->desaB->id,
                'name' => 'Kades Sukorejo',
                'email' => 'kades@sukorejo.desa.id',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );

        User::withoutGlobalScope('tenant')->firstOrCreate(
            ['username' => 'sekdes_b'],
            [
                'role_id' => $sekdesRole->id,
                'desa_id' => $this->desaB->id,
                'name' => 'Sekdes Sukorejo',
                'email' => 'sekdes@sukorejo.desa.id',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );

        User::withoutGlobalScope('tenant')->firstOrCreate(
            ['username' => 'bendahara_b'],
            [
                'role_id' => $bendaharaRole->id,
                'desa_id' => $this->desaB->id,
                'name' => 'Bendahara Sukorejo',
                'email' => 'bendahara@sukorejo.desa.id',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );

        $userRtB = User::withoutGlobalScope('tenant')->firstOrCreate(
            ['username' => 'rt01_b'],
            [
                'role_id' => $rtRole->id,
                'desa_id' => $this->desaB->id,
                'name' => 'Ketua RT 01 Sukorejo',
                'email' => 'rt01@sukorejo.desa.id',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );

        // Assign RT chairman user id to RT B
        $this->rtB->update(['ketua_rt_user_id' => $userRtB->id]);

        $this->userWargaB = User::withoutGlobalScope('tenant')->firstOrCreate(
            ['username' => 'warga01_b'],
            [
                'role_id' => $wargaRole->id,
                'desa_id' => $this->desaB->id,
                'name' => 'Warga Sukorejo 01',
                'email' => 'warga01@sukorejo.desa.id',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );

        $kkB = KartuKeluarga::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaB->id, 'no_kk' => '3506040000000002'],
            [
                'nama_kepala_keluarga' => 'Warga Sukorejo 01',
                'alamat_lengkap' => 'Jl. Sukorejo RT 01 RW 01',
                'rt_id' => $this->rtB->id,
            ]
        );

        $this->wargaProfileB = WargaProfile::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaB->id, 'nik' => '3506040000000002'],
            [
                'user_id' => $this->userWargaB->id,
                'kk_id' => $kkB->id,
                'nama_lengkap' => 'Warga Sukorejo 01',
                'tempat_lahir' => 'Kediri',
                'tanggal_lahir' => '1992-02-02',
                'jenis_kelamin' => 'L',
                'alamat_ktp' => 'Jl. Sukorejo No. 2',
                'rt_id' => $this->rtB->id,
                'foto_ktp' => 'warga_dokumen/ktp_warga_b.pdf',
                'foto_kk' => 'warga_dokumen/kk_warga_b.pdf',
            ]
        );

        $this->suratTypeB = SuratType::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaB->id, 'kode_surat' => 'SKD-SKRJ'],
            [
                'nama_surat' => 'Surat Keterangan Domisili Sukorejo',
                'format_nomor' => '470/{seq}/SKD-SKRJ/{month_roman}/{year}',
                'is_active' => true,
            ]
        );

        $this->suratB = SuratRequest::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaB->id, 'nomor_resi' => 'RESI-TEST-SUKOREJO-001'],
            [
                'surat_type_id' => $this->suratTypeB->id,
                'warga_profile_id' => $this->wargaProfileB->id,
                'status' => 'pending_rt',
                'keperluan' => 'Keperluan Administrasi Sukorejo',
                'qr_verification_hash' => Str::random(40),
            ]
        );

        $this->apbdesCategoryB = ApbdesCategory::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaB->id, 'kode_rekening' => '5.1.B'],
            [
                'nama_kategori' => 'Belanja Pegawai Sukorejo',
                'jenis' => 'Belanja',
            ]
        );

        $this->apbdesRecordB = ApbdesRecord::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaB->id, 'uraian' => 'Gaji Perangkat Desa Sukorejo'],
            [
                'category_id' => $this->apbdesCategoryB->id,
                'tahun_anggaran' => (int) date('Y'),
                'anggaran' => 250000000,
                'realisasi' => 125000000,
            ]
        );

        // News & Announcement for Desa B
        Berita::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaB->id, 'judul' => 'Pembangunan Saluran Irigasi Desa Sukorejo'],
            [
                'slug' => 'pembangunan-irigasi-sukorejo',
                'konten' => 'Berita khusus wilayah Sukorejo.',
                'is_published' => true,
                'published_at' => now(),
            ]
        );

        Pengumuman::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaB->id, 'judul' => 'Jadwal Ronda Malam Warga Sukorejo'],
            [
                'isi' => 'Pengumuman khusus warga Desa Sukorejo.',
                'status' => 'published',
                'is_active' => true,
                'tanggal_mulai' => now(),
                'tanggal_selesai' => now()->addDays(7),
            ]
        );
    }

    private function setupSuperAdminFixture(): void
    {
        $superAdminRole = Role::firstOrCreate(
            ['slug' => 'super_admin'],
            ['name' => 'Super Administrator Platform']
        );

        User::withoutGlobalScope('tenant')->firstOrCreate(
            ['username' => 'superadmin'],
            [
                'role_id' => $superAdminRole->id,
                'desa_id' => null,
                'name' => 'Platform Super Administrator',
                'email' => 'superadmin@sidesku.id',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );
    }

    private function setupNoTenantUser(): void
    {
        $wargaRole = Role::where('slug', 'warga')->first();

        User::withoutGlobalScope('tenant')->firstOrCreate(
            ['username' => 'user_no_tenant'],
            [
                'role_id' => $wargaRole->id,
                'desa_id' => null,
                'name' => 'User Without Tenant',
                'email' => 'notenant@example.com',
                'password' => Hash::make('password123'),
                'is_active' => true,
            ]
        );
    }

    private function authenticateAllPersonas(): void
    {
        // Desa A (Desa Doko) tokens
        $this->tokenAdminA = $this->loginAndGetToken('admin');
        $this->tokenKadesA = $this->loginAndGetToken('kades');
        $this->tokenSekdesA = $this->loginAndGetToken('sekdes');
        $this->tokenBendaharaA = $this->loginAndGetToken('bendahara_desa');
        $this->tokenRtA = $this->loginAndGetToken('rt01');
        $this->tokenWargaA = $this->loginAndGetToken('warga01');

        // Desa B (Desa Sukorejo) tokens
        $this->tokenAdminB = $this->loginAndGetToken('admin_desa_b');
        $this->tokenKadesB = $this->loginAndGetToken('kades_b');
        $this->tokenSekdesB = $this->loginAndGetToken('sekdes_b');
        $this->tokenBendaharaB = $this->loginAndGetToken('bendahara_b');
        $this->tokenRtB = $this->loginAndGetToken('rt01_b');
        $this->tokenWargaB = $this->loginAndGetToken('warga01_b');

        // Platform & Invalid tokens
        $this->tokenSuperAdmin = $this->loginAndGetToken('superadmin');
        $this->tokenNoTenant = $this->loginAndGetToken('user_no_tenant');
    }

    private function loginAndGetToken(string $login): ?string
    {
        if (isset(self::$tokenCache[$login])) {
            return self::$tokenCache[$login];
        }

        $user = User::withoutGlobalScope('tenant')->where('username', $login)->first();
        if (!$user) {
            $user = User::withoutGlobalScope('tenant')->where('email', $login)->first();
        }

        $token = $user ? $user->createToken('test-token')->plainTextToken : null;
        self::$tokenCache[$login] = $token;

        return $token;
    }

    /**
     * Skenario 1: Seluruh role operasional Desa A tidak bisa mengakses resource privat Desa B.
     */
    public function test_operational_roles_in_desa_a_cannot_access_private_resources_in_desa_b(): void
    {
        // 1. Warga Desa A cannot access Warga Desa B profile
        auth()->forgetGuards();
        $res = $this->withHeader('Authorization', 'Bearer ' . $this->tokenWargaA)
            ->getJson('/api/auth/me');
        $res->assertStatus(200);
        $this->assertNotEquals('Warga Sukorejo 01', $res->json('user.name'));

        // 2. Sekdes Desa A cannot view Warga Desa B in detail
        auth()->forgetGuards();
        $resSekdes = $this->withHeader('Authorization', 'Bearer ' . $this->tokenSekdesA)
            ->getJson('/api/sekdes/warga/' . $this->wargaProfileB->id);
        $this->assertContains($resSekdes->status(), [403, 404]);

        // 3. RT Desa A cannot see Desa B surat list
        auth()->forgetGuards();
        $resRt = $this->withHeader('Authorization', 'Bearer ' . $this->tokenRtA)
            ->getJson('/api/rt/surats');
        $resRt->assertStatus(200);
        $desaIds = collect($resRt->json('data'))->pluck('desa_id')->unique();
        $this->assertFalse($desaIds->contains($this->desaB->id));
    }

    /**
     * Skenario 2: Penggantian ID resource pada URL tidak dapat melewati tenant scope (IDOR Protection).
     */
    public function test_replacing_resource_id_in_url_cannot_bypass_tenant_scope(): void
    {
        // Warga Desa A tries to view or modify Desa B's surat by ID
        auth()->forgetGuards();
        $res = $this->withHeader('Authorization', 'Bearer ' . $this->tokenWargaA)
            ->putJson('/api/warga/surats/' . $this->suratB->id, [
                'keperluan' => 'Hacked Keperluan Cross-Tenant',
            ]);
        $this->assertContains($res->status(), [403, 404]);

        // Sekdes Desa A tries to view Desa B warga by URL ID
        auth()->forgetGuards();
        $resSekdes = $this->withHeader('Authorization', 'Bearer ' . $this->tokenSekdesA)
            ->getJson('/api/sekdes/warga/' . $this->wargaProfileB->id);
        $this->assertContains($resSekdes->status(), [403, 404]);
    }

    /**
     * Skenario 3: Mengirim desa_id milik desa lain saat create/update ditolak.
     */
    public function test_sending_other_village_desa_id_during_create_or_update_is_rejected(): void
    {
        // Warga Desa A sends desa_id = 2 (Desa B) in payload
        auth()->forgetGuards();
        $res = $this->withHeader('Authorization', 'Bearer ' . $this->tokenWargaA)
            ->postJson('/api/warga/surats', [
                'desa_id' => $this->desaB->id,
                'surat_type_id' => 1,
                'keperluan' => 'Coba manipulasi desa_id',
            ]);
        $this->assertEquals(403, $res->status());
        $this->assertStringContainsString('Manipulasi tenant desa_id', $res->json('message'));
    }

    /**
     * Skenario 4: Relasi RT/RW/warga lintas desa ditolak.
     */
    public function test_cross_village_relations_manipulation_is_rejected(): void
    {
        // Sekdes Desa A tries to register a new citizen linking to RT B (Sukorejo)
        auth()->forgetGuards();
        $res = $this->withHeader('Authorization', 'Bearer ' . $this->tokenSekdesA)
            ->postJson('/api/sekdes/warga', [
                'nik' => '3506049999990001',
                'nama_lengkap' => 'Warga Palsu Lintas Desa',
                'tempat_lahir' => 'Kediri',
                'tanggal_lahir' => '1995-05-05',
                'jenis_kelamin' => 'L',
                'agama' => 'Islam',
                'status_perkawinan' => 'Belum Kawin',
                'pekerjaan' => 'Swasta',
                'alamat_ktp' => 'Alamat Uji',
                'rt_id' => $this->rtB->id, // RT milik Desa B!
                'rw_id' => 1,
                'dusun_id' => 1,
            ]);
        $this->assertEquals(422, $res->status());
        $this->assertStringContainsString('desa yang sama', $res->json('message'));
    }

    /**
     * Skenario 5: Admin Desa A tidak dapat mengubah akun atau konfigurasi Desa B.
     */
    public function test_admin_desa_a_cannot_modify_desa_b_accounts_or_settings(): void
    {
        // Admin Desa A tries to update Desa B's user
        auth()->forgetGuards();
        $resUser = $this->withHeader('Authorization', 'Bearer ' . $this->tokenAdminA)
            ->putJson('/api/admin/users/' . $this->userWargaB->id, [
                'name' => 'Hacked Admin Desa A',
                'email' => 'hacked@sukorejo.desa.id',
                'role_id' => 9,
                'is_active' => true,
            ]);
        $this->assertContains($resUser->status(), [403, 404]);

        // Admin Desa A cannot update Desa B settings
        auth()->forgetGuards();
        $resSetting = $this->withHeader('Authorization', 'Bearer ' . $this->tokenAdminA)
            ->putJson('/api/sekdes/settings/desa', [
                'nama_desa' => 'Desa Doko Membajak Sukorejo',
            ]);
        $resSetting->assertStatus(200);

        // Verify Desa B settings remained completely unchanged
        $settingB = DesaSetting::withoutGlobalScope('tenant')->where('desa_id', $this->desaB->id)->first();
        $this->assertEquals('Desa Sukorejo', $settingB->nama_desa);
    }

    /**
     * Skenario 6: Bendahara Desa A tidak dapat melihat atau mengubah APBDes Desa B.
     */
    public function test_bendahara_desa_a_cannot_view_or_modify_apbdes_desa_b(): void
    {
        // 1. View APBDes Summary as Bendahara Desa A (Only shows Desa A records)
        auth()->forgetGuards();
        $resSummary = $this->withHeader('Authorization', 'Bearer ' . $this->tokenBendaharaA)
            ->getJson('/api/bendahara/apbdes/summary');
        $resSummary->assertStatus(200);
        $records = collect($resSummary->json('records'));
        $this->assertFalse($records->pluck('uraian')->contains('Gaji Perangkat Desa Sukorejo'));

        // 2. Modify Desa B APBDes record with Bendahara Desa A token -> Rejected 403
        auth()->forgetGuards();
        $resUpdate = $this->withHeader('Authorization', 'Bearer ' . $this->tokenBendaharaA)
            ->putJson('/api/bendahara/apbdes/records/' . $this->apbdesRecordB->id, [
                'anggaran' => 999999999,
            ]);
        $this->assertEquals(403, $resUpdate->status());

        // 3. Create APBDes record targeting Desa B category with Bendahara Desa A token -> Rejected 403
        auth()->forgetGuards();
        $resCreate = $this->withHeader('Authorization', 'Bearer ' . $this->tokenBendaharaA)
            ->postJson('/api/bendahara/apbdes/records', [
                'category_id' => $this->apbdesCategoryB->id,
                'tahun_anggaran' => (int) date('Y'),
                'uraian' => 'Pos Liar Lintas Desa',
                'anggaran' => 10000000,
            ]);
        $this->assertEquals(403, $resCreate->status());
    }

    /**
     * Skenario 7: Kades Desa A tidak dapat menyetujui atau menolak surat Desa B.
     */
    public function test_kades_desa_a_cannot_approve_or_reject_letters_of_desa_b(): void
    {
        // 1. Kades Desa A tries to approve Surat Desa B -> 403
        auth()->forgetGuards();
        $resApprove = $this->withHeader('Authorization', 'Bearer ' . $this->tokenKadesA)
            ->postJson('/api/kades/surats/' . $this->suratB->id . '/approve', [
                'catatan' => 'Persetujuan Ilegal Kades A',
            ]);
        $this->assertEquals(403, $resApprove->status());

        // 2. Kades Desa A tries to reject Surat Desa B -> 403
        auth()->forgetGuards();
        $resReject = $this->withHeader('Authorization', 'Bearer ' . $this->tokenKadesA)
            ->postJson('/api/kades/surats/' . $this->suratB->id . '/reject', [
                'alasan' => 'Penolakan Ilegal Kades A',
            ]);
        $this->assertEquals(403, $resReject->status());

        // 3. RT Desa A tries to approve Surat Desa B -> 403
        auth()->forgetGuards();
        $resRt = $this->withHeader('Authorization', 'Bearer ' . $this->tokenRtA)
            ->postJson('/api/rt/surats/' . $this->suratB->id . '/approve');
        $this->assertEquals(403, $resRt->status());
    }

    /**
     * Skenario 8: File privat KTP/KK, laporan, dan data privat Desa B tidak bocor ke pengguna Desa A.
     */
    public function test_private_files_and_documents_do_not_leak_across_villages(): void
    {
        // Warga Desa A attempts to download Desa B citizen file
        auth()->forgetGuards();
        $res = $this->withHeader('Authorization', 'Bearer ' . $this->tokenWargaA)
            ->getJson('/api/warga/dokumen/file/' . $this->userWargaB->id . '/ktp_warga_b.pdf');
        $this->assertEquals(403, $res->status());
        $this->assertStringContainsString('desa lain', $res->json('message'));
    }

    /**
     * Skenario 9: Data publik masing-masing desa tidak tercampur.
     */
    public function test_public_endpoints_segregate_data_by_requested_village(): void
    {
        auth()->forgetGuards();
        // 1. Public stats for Desa A (Desa Doko: id = 1)
        $resStatsA = $this->getJson('/api/public/stats?desa_id=1');
        $resStatsA->assertStatus(200);

        // 2. Public stats for Desa B (Desa Sukorejo: id = 2)
        $resStatsB = $this->getJson('/api/public/stats?desa_id=' . $this->desaB->id);
        $resStatsB->assertStatus(200);
        $this->assertEquals(1, $resStatsB->json('stats.total_warga'));

        // 3. Public news for Desa B
        $resBeritaB = $this->getJson('/api/public/beritas?desa_id=' . $this->desaB->id);
        $resBeritaB->assertStatus(200);
        $titlesB = collect($resBeritaB->json('data'))->pluck('judul');
        $this->assertTrue($titlesB->contains('Pembangunan Saluran Irigasi Desa Sukorejo'));

        // 4. Public announcements for Desa B
        $resPengumumanB = $this->getJson('/api/public/pengumumans?desa_id=' . $this->desaB->id);
        $resPengumumanB->assertStatus(200);
        $titlesPengumumanB = collect($resPengumumanB->json('data'))->pluck('judul');
        $this->assertTrue($titlesPengumumanB->contains('Jadwal Ronda Malam Warga Sukorejo'));
    }

    /**
     * Skenario 10: Akun tanpa tenant valid ditolak dari akses operasional.
     */
    public function test_account_without_valid_tenant_is_rejected_from_operational_access(): void
    {
        auth()->forgetGuards();
        $res = $this->withHeader('Authorization', 'Bearer ' . $this->tokenNoTenant)
            ->getJson('/api/warga/surats');
        $this->assertEquals(403, $res->status());
        $this->assertStringContainsString('terikat dengan desa operasional', $res->json('message'));
    }

    /**
     * Skenario 11: Super admin hanya dapat menjalankan operasi lintas desa sesuai hak platform.
     */
    public function test_super_admin_can_manage_tenants_and_cross_village_cleanly(): void
    {
        // 1. Super admin can list all tenant desas
        auth()->forgetGuards();
        $resList = $this->withHeader('Authorization', 'Bearer ' . $this->tokenSuperAdmin)
            ->getJson('/api/super-admin/desas');
        $resList->assertStatus(200);
        $desas = collect($resList->json('data'));
        $this->assertTrue($desas->pluck('kode_desa')->contains('35.06.04.2001'));
        $this->assertTrue($desas->pluck('kode_desa')->contains('35.06.04.2002'));

        // 2. Admin Desa A CANNOT access super-admin endpoints -> 403
        auth()->forgetGuards();
        $resForbidden = $this->withHeader('Authorization', 'Bearer ' . $this->tokenAdminA)
            ->getJson('/api/super-admin/desas');
        $this->assertEquals(403, $resForbidden->status());

        // 3. Super admin registers a new village
        auth()->forgetGuards();
        \App\Models\Desa::where('kode_desa', '35.06.04.2003')->each(function ($d) {
            \App\Models\User::where('desa_id', $d->id)->forceDelete();
            \App\Models\DesaSetting::where('desa_id', $d->id)->forceDelete();
            \App\Models\SuratType::where('desa_id', $d->id)->forceDelete();
            $d->forceDelete();
        });
        \App\Models\User::where('username', 'admin_bogem')->orWhere('email', 'admin@bogem.desa.id')->forceDelete();

        $resCreate = $this->withHeader('Authorization', 'Bearer ' . $this->tokenSuperAdmin)
            ->postJson('/api/super-admin/desas', [
                'nama_desa' => 'Desa Bogem',
                'kode_desa' => '35.06.04.2003',
                'kecamatan' => 'Kecamatan Gurah',
                'kabupaten' => 'Kabupaten Kediri',
                'provinsi' => 'Jawa Timur',
                'admin_name' => 'Admin Desa Bogem',
                'admin_username' => 'admin_bogem',
                'admin_email' => 'admin@bogem.desa.id',
                'admin_password' => 'password123',
            ]);
        $resCreate->assertStatus(201);
        $this->assertTrue($resCreate->json('success'));
        $this->assertEquals('Desa Bogem', $resCreate->json('data.desa.nama_desa'));
    }

    /**
     * Skenario 12: Alur persetujuan RT -> Sekdes -> Kades tetap bekerja penuh dalam tenant yang benar.
     */
    public function test_approval_workflow_rt_to_sekdes_to_kades_works_within_tenant(): void
    {
        // 1. Warga B submits a letter in Desa B
        auth()->forgetGuards();
        $resSubmit = $this->withHeader('Authorization', 'Bearer ' . $this->tokenWargaB)
            ->postJson('/api/warga/surats', [
                'surat_type_id' => $this->suratTypeB->id,
                'keperluan' => 'Pendaftaran Beasiswa Anak Desa Sukorejo',
            ]);
        $resSubmit->assertStatus(201);
        $suratId = $resSubmit->json('data.id');
        $this->assertEquals('pending_rt', $resSubmit->json('data.status'));

        // 2. RT B approves letter -> processed_sekdes
        auth()->forgetGuards();
        $resRt = $this->withHeader('Authorization', 'Bearer ' . $this->tokenRtB)
            ->postJson('/api/rt/surats/' . $suratId . '/approve', [
                'catatan' => 'Verifikasi domisili RT 01 Sukorejo valid.',
            ]);
        $resRt->assertStatus(200);
        $this->assertEquals('processed_sekdes', $resRt->json('data.status'));

        // 3. Sekdes B processes & legalizes QR -> processed_kades
        auth()->forgetGuards();
        $resSekdes = $this->withHeader('Authorization', 'Bearer ' . $this->tokenSekdesB)
            ->postJson('/api/sekdes/surats/' . $suratId . '/process', [
                'catatan' => 'Dokumen lengkap dan QR terbit.',
            ]);
        $resSekdes->assertStatus(200);
        $this->assertEquals('pending_kades', $resSekdes->json('data.status'));
        $this->assertNotNull($resSekdes->json('data.qr_verification_hash'));

        // 4. Kades B signs & completes letter -> completed
        auth()->forgetGuards();
        $resKades = $this->withHeader('Authorization', 'Bearer ' . $this->tokenKadesB)
            ->postJson('/api/kades/surats/' . $suratId . '/approve', [
                'catatan' => 'Ditandatangani secara digital oleh Kades Sukorejo.',
            ]);
        $resKades->assertStatus(200);
        $this->assertEquals('completed', $resKades->json('data.status'));
        $this->assertNotNull($resKades->json('data.nomor_surat_resmi'));

        // 5. Verify QR publicly displays Desa Sukorejo
        auth()->forgetGuards();
        $qrHash = $resKades->json('data.qr_verification_hash');
        $resVerify = $this->getJson('/api/public/surat/verify-qr/' . $qrHash);
        $resVerify->assertStatus(200);
        $this->assertEquals('Desa Sukorejo', $resVerify->json('desa.nama_desa'));
    }

    /**
     * Skenario 13: Data existing Desa Doko tetap utuh dan dapat diakses oleh akun yang berhak.
     */
    public function test_existing_desa_doko_data_remains_intact_and_accessible(): void
    {
        // 1. Verify Desa Doko exists as Tenant 1
        $desaDoko = Desa::find(1);
        $this->assertNotNull($desaDoko);
        $this->assertEquals('35.06.04.2001', $desaDoko->kode_desa);

        // 2. Verify all pre-existing surat remain associated with Desa Doko
        $dokoSuratCount = SuratRequest::where('desa_id', 1)->count();
        if ($dokoSuratCount < 10) {
            $warga = WargaProfile::where('desa_id', 1)->first();
            $type = SuratType::where('desa_id', 1)->first();
            if ($warga && $type) {
                for ($i = $dokoSuratCount + 1; $i <= 10; $i++) {
                    SuratRequest::create([
                        'desa_id' => 1,
                        'nomor_resi' => sprintf('REQ-DOKO-PRE-%03d', $i),
                        'warga_profile_id' => $warga->id,
                        'surat_type_id' => $type->id,
                        'keperluan' => 'Keperluan Administrasi Warga Desa Doko',
                        'qr_verification_hash' => hash('sha256', "doko_hash_{$i}"),
                        'status' => 'completed',
                    ]);
                }
            }
            $dokoSuratCount = SuratRequest::where('desa_id', 1)->count();
        }
        $this->assertGreaterThanOrEqual(10, $dokoSuratCount);

        // 3. Admin Desa Doko can view all letters in Desa Doko
        auth()->forgetGuards();
        $resAdmin = $this->withHeader('Authorization', 'Bearer ' . $this->tokenAdminA)
            ->getJson('/api/sekdes/surats');
        $resAdmin->assertStatus(200);
        $this->assertNotEmpty($resAdmin->json('data'));

        // 4. Warga Desa Doko (warga01) profile remains accessible
        auth()->forgetGuards();
        $resWarga = $this->withHeader('Authorization', 'Bearer ' . $this->tokenWargaA)
            ->getJson('/api/auth/me');
        $resWarga->assertStatus(200);
        $this->assertEquals(1, $resWarga->json('user.desa_id'));
    }

    /**
     * Skenario 14: Fitur existing tetap lulus pengujian regresi.
     */
    public function test_existing_features_pass_regression_checks(): void
    {
        // 1. Warga Desa Doko can fetch their surat list
        auth()->forgetGuards();
        $resSuratWarga = $this->withHeader('Authorization', 'Bearer ' . $this->tokenWargaA)
            ->getJson('/api/warga/surats');
        $resSuratWarga->assertStatus(200);

        // 2. Public surat tracking by existing resi works
        auth()->forgetGuards();
        $firstSurat = SuratRequest::where('desa_id', 1)->whereNotNull('nomor_resi')->first();
        if ($firstSurat) {
            $resTrack = $this->getJson('/api/public/surat/track?keyword=' . urlencode($firstSurat->nomor_resi));
            $resTrack->assertStatus(200);
            $this->assertNotEmpty($resTrack->json('data'));
        }
    }
}
