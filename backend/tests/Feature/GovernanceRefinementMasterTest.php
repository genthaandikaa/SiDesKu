<?php

namespace Tests\Feature;

use App\Models\Desa;
use App\Models\KeputusanKades;
use App\Models\PengaduanWarga;
use App\Models\Role;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\SuratRequest;
use App\Models\SuratType;
use App\Models\User;
use App\Models\WargaProfile;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class GovernanceRefinementMasterTest extends TestCase
{
    use DatabaseTransactions;

    protected Desa $desa1;
    protected Desa $desa2;
    protected Rw $rw1;
    protected Rw $rw2;
    protected Rt $rt1;
    protected Rt $rt2;
    protected User $userRt1;
    protected User $userRw1;
    protected User $userWarga1;
    protected User $userWarga2;
    protected WargaProfile $wargaProfile1;
    protected WargaProfile $wargaProfile2;
    protected User $userSekdes;
    protected User $userKades;

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

        $dusun1 = \App\Models\Dusun::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desa1->id],
            ['nama_dusun' => 'Dusun Krajan']
        );
        $dusun2 = \App\Models\Dusun::withoutGlobalScope('tenant')->firstOrCreate(
            ['desa_id' => $this->desa2->id],
            ['nama_dusun' => 'Dusun Sukorame']
        );

        $this->rw1 = Rw::withoutGlobalScope('tenant')->firstOrCreate(['desa_id' => $this->desa1->id, 'nomor_rw' => '01'], ['dusun_id' => $dusun1->id]);
        $this->rw2 = Rw::withoutGlobalScope('tenant')->firstOrCreate(['desa_id' => $this->desa2->id, 'nomor_rw' => '01'], ['dusun_id' => $dusun2->id]);

        $this->rt1 = Rt::withoutGlobalScope('tenant')->firstOrCreate(['desa_id' => $this->desa1->id, 'rw_id' => $this->rw1->id, 'nomor_rt' => '01']);
        $this->rt2 = Rt::withoutGlobalScope('tenant')->firstOrCreate(['desa_id' => $this->desa1->id, 'rw_id' => $this->rw1->id, 'nomor_rt' => '02']);

        $roleRt = Role::firstOrCreate(['slug' => 'rt'], ['name' => 'Ketua RT']);
        $roleRw = Role::firstOrCreate(['slug' => 'rw'], ['name' => 'Ketua RW']);
        $roleWarga = Role::firstOrCreate(['slug' => 'warga'], ['name' => 'Warga']);
        $roleSekdes = Role::firstOrCreate(['slug' => 'sekdes'], ['name' => 'Sekretaris Desa']);
        $roleKades = Role::firstOrCreate(['slug' => 'kades'], ['name' => 'Kepala Desa']);

        $this->userRt1 = User::factory()->create([
            'desa_id' => $this->desa1->id,
            'role_id' => $roleRt->id,
        ]);
        $this->rt1->update(['ketua_rt_user_id' => $this->userRt1->id]);

        $this->userRw1 = User::factory()->create([
            'desa_id' => $this->desa1->id,
            'role_id' => $roleRw->id,
        ]);
        $this->rw1->update(['ketua_rw_user_id' => $this->userRw1->id]);

        $this->userWarga1 = User::factory()->create([
            'desa_id' => $this->desa1->id,
            'role_id' => $roleWarga->id,
        ]);
        $this->wargaProfile1 = WargaProfile::create([
            'user_id' => $this->userWarga1->id,
            'desa_id' => $this->desa1->id,
            'rt_id' => $this->rt1->id,
            'nik' => '350604111111' . rand(1000, 9999),
            'nama_lengkap' => 'Warga Satu Doko',
            'tempat_lahir' => 'Kediri',
            'tanggal_lahir' => '1990-01-01',
            'jenis_kelamin' => 'L',
            'alamat_ktp' => 'Jl. Doko RT 01',
        ]);

        $this->userWarga2 = User::factory()->create([
            'desa_id' => $this->desa1->id,
            'role_id' => $roleWarga->id,
        ]);
        $this->wargaProfile2 = WargaProfile::create([
            'user_id' => $this->userWarga2->id,
            'desa_id' => $this->desa1->id,
            'rt_id' => $this->rt2->id,
            'nik' => '350604222222' . rand(1000, 9999),
            'nama_lengkap' => 'Warga Dua Doko',
            'tempat_lahir' => 'Kediri',
            'tanggal_lahir' => '1995-05-05',
            'jenis_kelamin' => 'P',
            'alamat_ktp' => 'Jl. Doko RT 02',
        ]);

        $this->userSekdes = User::factory()->create([
            'desa_id' => $this->desa1->id,
            'role_id' => $roleSekdes->id,
        ]);

        $this->userKades = User::factory()->create([
            'desa_id' => $this->desa1->id,
            'role_id' => $roleKades->id,
        ]);
    }

    /**
     * 1. Multi-Tenant Territorial Isolation:
     * RT only sees warga belonging to its authorized RT.
     */
    public function test_rt_can_only_view_warga_in_own_territory(): void
    {
        $response = $this->actingAs($this->userRt1)
            ->getJson('/api/rt/warga');

        $response->assertStatus(200);
        $data = $response->json('data');

        foreach ($data as $item) {
            $this->assertEquals($this->rt1->id, $item['rt_id']);
        }
    }

    /**
     * 2. Direct RT -> Balai Desa (RW approval bypass):
     * RW approval endpoint returns 403 Forbidden.
     */
    public function test_rw_approval_returns_403_forbidden_enforcing_direct_flow(): void
    {
        $suratType = SuratType::firstOrCreate(
            ['nama_surat' => 'Surat Pengantar RT'],
            ['desa_id' => $this->desa1->id, 'kode_surat' => 'SP-RT']
        );

        $surat = SuratRequest::create([
            'desa_id' => $this->desa1->id,
            'warga_profile_id' => $this->wargaProfile1->id,
            'surat_type_id' => $suratType->id,
            'nomor_resi' => 'RESI-' . uniqid(),
            'status' => 'pending_rt',
            'keperluan' => 'Urus KTP',
            'qr_verification_hash' => bin2hex(random_bytes(16)),
        ]);

        $responseApprove = $this->actingAs($this->userRw1)
            ->postJson("/api/surats/{$surat->id}/approve-rw");

        $responseApprove->assertStatus(403);
        $responseApprove->assertJsonFragment(['success' => false]);

        $responseReject = $this->actingAs($this->userRw1)
            ->postJson("/api/surats/{$surat->id}/reject", ['alasan' => 'Ditolak RW']);

        $responseReject->assertStatus(403);
    }

    /**
     * 3. Warga Complaint IDOR Prevention:
     * Citizen cannot view detail of another citizen's complaint.
     */
    public function test_citizen_cannot_view_another_citizens_complaint(): void
    {
        $pengaduanWarga2 = PengaduanWarga::create([
            'desa_id' => $this->desa1->id,
            'warga_profile_id' => $this->wargaProfile2->id,
            'rt_id' => $this->rt2->id,
            'kategori' => 'Fasilitas Umum',
            'judul' => 'Lampu Jalan Rusak RT 02',
            'deskripsi' => 'Mohon diperbaiki tiang lampu jalan RT 02',
            'status' => 'Terkirim',
        ]);

        // Warga 1 attempts to access Warga 2's complaint detail
        $response = $this->actingAs($this->userWarga1)
            ->getJson("/api/warga/pengaduan/{$pengaduanWarga2->id}");

        $response->assertStatus(403);
    }

    /**
     * 4. Immutable Complaint Disposition History:
     * Dispositions append sequentially to riwayat_tanggapan without overwriting past entries.
     */
    public function test_complaint_disposition_appends_to_immutable_history(): void
    {
        $pengaduan = PengaduanWarga::create([
            'desa_id' => $this->desa1->id,
            'warga_profile_id' => $this->wargaProfile1->id,
            'rt_id' => $this->rt1->id,
            'kategori' => 'Fasilitas Umum',
            'judul' => 'Saluran Air Mampet',
            'deskripsi' => 'Gorong-gorong tersumbat sampah',
            'status' => 'Terkirim',
        ]);

        // Response 1 from RT
        $this->actingAs($this->userRt1)
            ->postJson("/api/rt/pengaduan/{$pengaduan->id}/respond", [
                'tanggapan' => 'Sudah dicek ke lokasi oleh Ketua RT.',
                'status' => 'Ditinjau RT',
            ])->assertStatus(200);

        // Response 2 from Kades
        $this->actingAs($this->userKades)
            ->postJson("/api/pengaduan/{$pengaduan->id}/respond", [
                'tanggapan' => 'Disposisi ke Tim Pelaksana Desa untuk pengerukan besok.',
                'status' => 'Diproses Desa',
            ])->assertStatus(200);

        $fresh = $pengaduan->fresh();
        $this->assertEquals('Diproses Desa', $fresh->status);
        $this->assertIsArray($fresh->riwayat_tanggapan);
        $this->assertCount(2, $fresh->riwayat_tanggapan);
        $this->assertEquals('Sudah dicek ke lokasi oleh Ketua RT.', $fresh->riwayat_tanggapan[0]['tanggapan']);
        $this->assertEquals('Disposisi ke Tim Pelaksana Desa untuk pengerukan besok.', $fresh->riwayat_tanggapan[1]['tanggapan']);
    }

    /**
     * 5. Kas RW Activation Lifecycle:
     * Inactive RW cannot record kas; after activation review, transactions are permitted.
     */
    public function test_kas_rw_activation_workflow(): void
    {
        // 1. Initially inactive: transaction rejected
        $this->rw1->update(['kas_status' => 'inactive']);

        $resBlocked = $this->actingAs($this->userRw1)
            ->postJson('/api/rw/kas/transaksi', [
                'tanggal' => now()->toDateString(),
                'tipe' => 'Pemasukan',
                'jumlah' => 500000,
                'keterangan' => 'Iuran RW',
            ]);
        $resBlocked->assertStatus(403);

        // 2. Request activation
        $resReq = $this->actingAs($this->userRw1)
            ->postJson('/api/rw/kas/request-activation', [
                'alasan' => 'Dibutuhkan untuk pembukuan swadaya kebersihan lingkungan tingkat RW.',
            ]);
        $resReq->assertStatus(200);
        $this->assertEquals('requested', $this->rw1->fresh()->kas_status);

        // 3. Sekdes/Kades approves activation
        $resApprove = $this->actingAs($this->userSekdes)
            ->postJson("/api/sekdes/rw-kas/{$this->rw1->id}/review", [
                'action' => 'approve',
                'catatan' => 'Disetujui untuk akuntabilitas kegiatan RW.',
            ]);
        $resApprove->assertStatus(200);
        $this->assertEquals('active', $this->rw1->fresh()->kas_status);

        // 4. Now transaction is permitted
        $resAllowed = $this->actingAs($this->userRw1)
            ->postJson('/api/rw/kas/transaksi', [
                'tanggal' => now()->toDateString(),
                'tipe' => 'Pemasukan',
                'jumlah' => 500000,
                'keterangan' => 'Iuran RW Kas Sah',
            ]);
        $resAllowed->assertStatus(201);
    }

    /**
     * 6. SK Kades CRUD & Public Visibility:
     * Kades can create, index, and update SK; public only sees is_public records.
     */
    public function test_sk_kades_crud_and_public_visibility(): void
    {
        // Create SK Kades
        $resCreate = $this->actingAs($this->userKades)
            ->postJson('/api/kades/keputusan', [
                'nomor_sk' => '188.4/05/SK/2026',
                'tanggal_tetap' => now()->toDateString(),
                'tentang' => 'Penetapan Jam Malam Ramadhan',
                'kategori' => 'Tata Kelola',
                'keterangan' => 'Pemberlakuan ronda malam intensif.',
                'status' => 'Berlaku',
                'is_public' => true,
            ]);
        $resCreate->assertStatus(201);
        $skId = $resCreate->json('data.id');

        // Check index
        $resIndex = $this->actingAs($this->userKades)
            ->getJson('/api/kades/keputusan');
        $resIndex->assertStatus(200);
        $this->assertNotEmpty($resIndex->json('data'));

        // Public index
        $resPublic = $this->getJson("/api/public/keputusan?desa_id={$this->desa1->id}");
        $resPublic->assertStatus(200);
        $publicData = $resPublic->json('data');
        $this->assertTrue(collect($publicData)->contains('id', $skId));
    }
}
