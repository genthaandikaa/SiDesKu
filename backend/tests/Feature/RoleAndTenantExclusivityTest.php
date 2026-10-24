<?php

namespace Tests\Feature;

use App\Models\ApbdesCategory;
use App\Models\ApbdesRecord;
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

class RoleAndTenantExclusivityTest extends TestCase
{
    use DatabaseTransactions;

    protected Desa $desaA;
    protected Desa $desaB;
    protected User $userBendaharaA;
    protected User $userBendaharaB;
    protected User $userWargaA;
    protected User $userRtA;
    protected User $userRwA;
    protected User $userSekdesA;
    protected User $userAdminA;
    protected ApbdesCategory $catA;
    protected ApbdesCategory $catB;
    protected ApbdesRecord $recordB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->desaA = Desa::withoutGlobalScope('tenant')->where('id', 1)->first()
            ?? Desa::withoutGlobalScope('tenant')->firstOrCreate(
                ['kode_desa' => '35.06.04.2001'],
                ['nama_desa' => 'Desa Doko', 'kecamatan' => 'Ngasem', 'kabupaten' => 'Kediri', 'provinsi' => 'Jawa Timur', 'kode_pos' => '64182', 'is_active' => true]
            );
        $this->desaB = Desa::withoutGlobalScope('tenant')->where('kode_desa', '35.06.04.2002')->first()
            ?? Desa::withoutGlobalScope('tenant')->create(
                ['nama_desa' => 'Desa Sukorame', 'kode_desa' => '35.06.04.2002', 'kecamatan' => 'Mojoroto', 'kabupaten' => 'Kediri', 'provinsi' => 'Jawa Timur', 'kode_pos' => '64114', 'is_active' => true]
            );

        $roleBendahara = Role::firstOrCreate(['slug' => 'bendahara_desa'], ['name' => 'bendahara_desa', 'display_name' => 'Bendahara Desa']);
        $roleWarga = Role::firstOrCreate(['slug' => 'warga'], ['name' => 'warga', 'display_name' => 'Warga']);
        $roleRt = Role::firstOrCreate(['slug' => 'rt'], ['name' => 'rt', 'display_name' => 'Ketua RT']);
        $roleRw = Role::firstOrCreate(['slug' => 'rw'], ['name' => 'rw', 'display_name' => 'Ketua RW']);
        $roleSekdes = Role::firstOrCreate(['slug' => 'sekdes'], ['name' => 'sekdes', 'display_name' => 'Sekretaris Desa']);
        $roleAdmin = Role::firstOrCreate(['slug' => 'admin_desa'], ['name' => 'admin_desa', 'display_name' => 'Admin Desa']);

        $this->userBendaharaA = User::factory()->create([
            'desa_id' => $this->desaA->id,
            'role_id' => $roleBendahara->id,
        ]);

        $this->userBendaharaB = User::factory()->create([
            'desa_id' => $this->desaB->id,
            'role_id' => $roleBendahara->id,
        ]);

        $this->userWargaA = User::factory()->create([
            'desa_id' => $this->desaA->id,
            'role_id' => $roleWarga->id,
        ]);

        $this->userRtA = User::factory()->create([
            'desa_id' => $this->desaA->id,
            'role_id' => $roleRt->id,
        ]);

        $this->userRwA = User::factory()->create([
            'desa_id' => $this->desaA->id,
            'role_id' => $roleRw->id,
        ]);

        $this->userSekdesA = User::factory()->create([
            'desa_id' => $this->desaA->id,
            'role_id' => $roleSekdes->id,
        ]);

        $this->userAdminA = User::factory()->create([
            'desa_id' => $this->desaA->id,
            'role_id' => $roleAdmin->id,
        ]);

        $this->catA = ApbdesCategory::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaA->id, 'kode_rekening' => '5.1.A'],
            ['nama_kategori' => 'Belanja Barang Desa A', 'jenis' => 'Belanja']
        );

        $this->catB = ApbdesCategory::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaB->id, 'kode_rekening' => '5.1.B_EX'],
            ['nama_kategori' => 'Belanja Barang Desa B', 'jenis' => 'Belanja']
        );

        $this->recordB = ApbdesRecord::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desaB->id, 'uraian' => 'Anggaran Khusus Desa B'],
            [
                'category_id' => $this->catB->id,
                'tahun_anggaran' => (int) date('Y'),
                'anggaran' => 75000000,
                'realisasi' => 25000000,
            ]
        );
    }

    /**
     * 1. BENDAHARA: Tidak bisa melihat atau memanipulasi APBDes desa lain.
     */
    public function test_bendahara_cannot_access_or_modify_other_village_financials(): void
    {
        // Mencoba update anggaran milik Desa B
        $resUpdate = $this->actingAs($this->userBendaharaA)
            ->putJson("/api/bendahara/apbdes/records/{$this->recordB->id}", [
                'anggaran' => 999999999,
            ]);
        $resUpdate->assertStatus(403);

        // Mencoba hapus anggaran milik Desa B
        $resDelete = $this->actingAs($this->userBendaharaA)
            ->deleteJson("/api/bendahara/apbdes/records/{$this->recordB->id}");
        $resDelete->assertStatus(403);

        // Mencoba buat anggaran baru menggunakan kategori Desa B
        $resStore = $this->actingAs($this->userBendaharaA)
            ->postJson('/api/bendahara/apbdes/records', [
                'category_id' => $this->catB->id,
                'tahun_anggaran' => (int) date('Y'),
                'uraian' => 'Penyusupan Finansial Lintas Desa',
                'anggaran' => 5000000,
            ]);
        $resStore->assertStatus(403);
    }

    /**
     * 2. BENDAHARA: Tidak bisa mengakses modul di luar tupoksinya (Admin, Warga, RT, Kades).
     */
    public function test_bendahara_cannot_access_unauthorized_operational_roles(): void
    {
        // Bendahara mencoba akses daftar user admin atau mereset password
        $resAdmin = $this->actingAs($this->userBendaharaA)
            ->getJson('/api/admin/users');
        $resAdmin->assertStatus(403);

        // Bendahara mencoba approve surat RT
        $resApprove = $this->actingAs($this->userBendaharaA)
            ->postJson('/api/rt/surats/1/approve');
        $resApprove->assertStatus(403);

        // Bendahara mencoba kirim pengaduan sebagai warga pada portal /api/warga
        $resWargaSurat = $this->actingAs($this->userBendaharaA)
            ->getJson('/api/warga/surats');
        $resWargaSurat->assertStatus(403);
    }

    /**
     * 3. WARGA: Tidak bisa mengakses data atau mutasi keuangan Bendahara maupun Admin.
     */
    public function test_warga_cannot_mutate_finances_or_admin(): void
    {
        // Warga mencoba manipulasi APBDes
        $resApbdes = $this->actingAs($this->userWargaA)
            ->postJson('/api/bendahara/apbdes/records', [
                'category_id' => $this->catA->id,
                'tahun_anggaran' => (int) date('Y'),
                'uraian' => 'Warga Ubah Kas Desa',
                'anggaran' => 1000000,
            ]);
        $resApbdes->assertStatus(403);

        // Warga mencoba intip backup admin
        $resBackup = $this->actingAs($this->userWargaA)
            ->getJson('/api/admin/backup');
        $resBackup->assertStatus(403);

        // Warga mencoba verifikasi surat di tingkat RT
        $resRt = $this->actingAs($this->userWargaA)
            ->getJson('/api/rt/surats');
        $resRt->assertStatus(403);
    }

    /**
     * 4. RT & RW: Tidak bisa mengakses atau mengubah modul satu sama lain atau admin/keuangan.
     */
    public function test_rt_rw_strict_role_boundary(): void
    {
        // RT tidak bisa akses RW portal
        $resRw = $this->actingAs($this->userRtA)
            ->getJson('/api/rw/rts');
        $resRw->assertStatus(403);

        // RW tidak bisa akses pencatatan kas RT
        $resRtKas = $this->actingAs($this->userRwA)
            ->postJson('/api/rt/kas/transaksi', [
                'tanggal' => now()->toDateString(),
                'tipe' => 'Pemasukan',
                'jumlah' => 100000,
                'keterangan' => 'Kas RT',
            ]);
        $resRtKas->assertStatus(403);

        // RT tidak bisa akses admin users
        $resAdmin = $this->actingAs($this->userRtA)
            ->getJson('/api/admin/users');
        $resAdmin->assertStatus(403);

        // RT tidak bisa input APBDes
        $resApbdes = $this->actingAs($this->userRtA)
            ->postJson('/api/bendahara/apbdes/records', [
                'category_id' => $this->catA->id,
                'tahun_anggaran' => (int) date('Y'),
                'uraian' => 'RT input APBDes',
                'anggaran' => 5000000,
            ]);
        $resApbdes->assertStatus(403);
    }

    /**
     * 5. CROSS-TENANT INJECTION: Seluruh role ditolak jika memanipulasi parameter desa_id.
     */
    public function test_cross_tenant_injection_aborted_by_middleware(): void
    {
        // Bendahara Desa A mencoba menyuntikkan desa_id Desa B
        $res = $this->actingAs($this->userBendaharaA)
            ->getJson("/api/bendahara/apbdes/summary?desa_id={$this->desaB->id}");
        $res->assertStatus(403);

        // Warga Desa A mencoba menyuntikkan desa_id Desa B
        $resWarga = $this->actingAs($this->userWargaA)
            ->getJson("/api/warga/pengaduan?desa_id={$this->desaB->id}");
        $resWarga->assertStatus(403);
    }
}
