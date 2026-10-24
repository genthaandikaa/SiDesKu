<?php

namespace Tests\Feature;

use App\Models\ApbdesCategory;
use App\Models\ApbdesRecord;
use App\Models\BantuanPenerima;
use App\Models\BantuanSosial;
use App\Models\Berita;
use App\Models\KasRtCategory;
use App\Models\KasRtTransaction;
use App\Models\Role;
use App\Models\SuratRequest;
use App\Models\SuratType;
use App\Models\User;
use App\Models\WargaProfile;
use App\Services\LetterNumberService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class Phase4BusinessLogicAuditTest extends TestCase
{
    protected ?string $tokenWarga = null;
    protected ?string $tokenRt01 = null;
    protected ?string $tokenSekdes = null;
    protected ?string $tokenBendahara = null;

    protected function setUp(): void
    {
        parent::setUp();

        // Login Warga
        $resWarga = $this->postJson('/api/auth/login', [
            'login' => 'warga01',
            'password' => 'password123',
        ]);
        if ($resWarga->status() === 200) {
            $this->tokenWarga = $resWarga->json('token');
        }

        // Login RT 01
        $resRt = $this->postJson('/api/auth/login', [
            'login' => 'rt01',
            'password' => 'password123',
        ]);
        if ($resRt->status() === 200) {
            $this->tokenRt01 = $resRt->json('token');
        }

        // Login Sekdes
        $resSekdes = $this->postJson('/api/auth/login', [
            'login' => 'sekdes',
            'password' => 'password123',
        ]);
        if ($resSekdes->status() === 200) {
            $this->tokenSekdes = $resSekdes->json('token');
        }

        // Login Bendahara
        $resBen = $this->postJson('/api/auth/login', [
            'login' => 'bendahara_desa',
            'password' => 'password123',
        ]);
        if ($resBen->status() === 200) {
            $this->tokenBendahara = $resBen->json('token');
        }
    }

    /*
     * --------------------------------------------------------------------------
     * AREA A: AUTHENTICATION & PROFILE
     * --------------------------------------------------------------------------
     */

    public function test_auth_login_with_dob_password_format_variants(): void
    {
        $wargaProfile = WargaProfile::whereNotNull('tanggal_lahir')->first();
        $this->assertNotNull($wargaProfile);

        $dob = Carbon::parse($wargaProfile->tanggal_lahir);
        $dobFormatted = $dob->format('dmY'); // e.g. 15051984

        // 1. Login menggunakan NIK dan password format Tanggal Lahir (dmY)
        $res = $this->postJson('/api/auth/login', [
            'login' => $wargaProfile->nik,
            'password' => $dobFormatted,
        ]);

        $res->assertStatus(200)
            ->assertJson(['success' => true]);
        $this->assertNotEmpty($res->json('token'));
        $this->assertEquals($wargaProfile->nik, $res->json('user.warga_profile.nik'));
    }

    public function test_auth_self_registration_is_explicitly_blocked(): void
    {
        $res = $this->postJson('/api/auth/register', [
            'nik' => '3506049999990001',
            'name' => 'Warga Percobaan',
            'password' => 'password123',
        ]);

        $res->assertStatus(403)
            ->assertJson(['success' => false]);
        $this->assertStringContainsString('Pendaftaran warga mandiri tidak dibuka', $res->json('message'));
    }

    public function test_auth_update_password_validates_current_password_and_confirmation(): void
    {
        // A. Current password salah
        $resWrong = $this->withHeader('Authorization', "Bearer {$this->tokenWarga}")
            ->postJson('/api/auth/password', [
                'current_password' => 'wrongpass_xyz',
                'new_password' => 'newpassword123',
                'new_password_confirmation' => 'newpassword123',
            ]);
        $resWrong->assertStatus(422)
            ->assertJsonValidationErrors(['current_password']);

        // B. Konfirmasi password baru tidak cocok
        $resMismatch = $this->withHeader('Authorization', "Bearer {$this->tokenWarga}")
            ->postJson('/api/auth/password', [
                'current_password' => 'password123',
                'new_password' => 'newpassword123',
                'new_password_confirmation' => 'mismatchpass456',
            ]);
        $resMismatch->assertStatus(422)
            ->assertJsonValidationErrors(['new_password']);
    }

    public function test_auth_logout_revokes_token(): void
    {
        // Buat token sementara
        $loginRes = $this->postJson('/api/auth/login', [
            'login' => 'warga01',
            'password' => 'password123',
        ]);
        $tempToken = $loginRes->json('token');

        // Logout
        $logoutRes = $this->withHeader('Authorization', "Bearer {$tempToken}")
            ->postJson('/api/auth/logout');
        $logoutRes->assertStatus(200)
            ->assertJson(['success' => true]);

        // Coba gunakan token yang sudah di-logout -> 401
        auth()->forgetGuards();
        $checkRes = $this->withHeader('Authorization', "Bearer {$tempToken}")
            ->getJson('/api/auth/me');
        $checkRes->assertStatus(401);
    }

    /*
     * --------------------------------------------------------------------------
     * AREA B: SURAT MENYURAT & LIFECYCLE
     * --------------------------------------------------------------------------
     */

    public function test_surat_creation_requires_mandatory_fields(): void
    {
        $resEmpty = $this->withHeader('Authorization', "Bearer {$this->tokenWarga}")
            ->postJson('/api/surats', []);

        $resEmpty->assertStatus(422)
            ->assertJsonValidationErrors(['surat_type_id', 'keperluan']);
    }

    public function test_surat_full_lifecycle_and_tracking_consistency(): void
    {
        $suratType = SuratType::first();
        $suratTypeId = $suratType ? $suratType->id : 1;

        // 1. Warga mengajukan surat
        $createRes = $this->withHeader('Authorization', "Bearer {$this->tokenWarga}")
            ->postJson('/api/surats', [
                'surat_type_id' => $suratTypeId,
                'keperluan' => 'Permohonan surat uji siklus hidup QA Fase 4',
            ]);
        $createRes->assertStatus(201);
        $suratId = $createRes->json('data.id');
        $resiCode = $createRes->json('data.nomor_resi');

        $this->assertStringStartsWith('REQ-', $resiCode);
        $this->assertEquals('pending_rt', $createRes->json('data.status'));

        // Verifikasi tracking pertama
        $tracking1 = $createRes->json('data.trackings.0');
        $this->assertEquals('Warga', $tracking1['status_stage']);
        $this->assertEquals('Diajukan', $tracking1['status_action']);

        // 2. Warga memperbarui keperluan selama status masih pending_rt
        $updateRes = $this->withHeader('Authorization', "Bearer {$this->tokenWarga}")
            ->putJson("/api/surats/{$suratId}", [
                'keperluan' => 'Permohonan surat uji siklus hidup QA Fase 4 (Revisi)',
            ]);
        $updateRes->assertStatus(200)
            ->assertJson(['success' => true]);
        $this->assertEquals('Permohonan surat uji siklus hidup QA Fase 4 (Revisi)', $updateRes->json('data.keperluan'));

        // 3. RT 01 menyetujui surat
        auth()->forgetGuards();
        $approveRtRes = $this->withHeader('Authorization', "Bearer {$this->tokenRt01}")
            ->postJson("/api/surats/{$suratId}/approve-rt", [
                'catatan' => 'Disetujui RT 01 dan diteruskan ke Kantor Desa',
            ]);
        $approveRtRes->assertStatus(200);
        $this->assertEquals('processed_sekdes', $approveRtRes->json('data.status'));

        // 4. Warga TIDAK BISA lagi mengubah surat setelah diproses RT
        auth()->forgetGuards();
        $updateBlockedRes = $this->withHeader('Authorization', "Bearer {$this->tokenWarga}")
            ->putJson("/api/surats/{$suratId}", [
                'keperluan' => 'Mencoba ubah setelah ACC RT (harus ditolak)',
            ]);
        $updateBlockedRes->assertStatus(422);

        // 5. Warga TIDAK BISA lagi membatalkan surat setelah diproses RT
        $deleteBlockedRes = $this->withHeader('Authorization', "Bearer {$this->tokenWarga}")
            ->deleteJson("/api/surats/{$suratId}");
        $deleteBlockedRes->assertStatus(422);

        // 6. Sekdes memproses dan mengajukan surat ke antrean Kepala Desa
        auth()->forgetGuards();
        $processSekdesRes = $this->withHeader('Authorization', "Bearer {$this->tokenSekdes}")
            ->postJson("/api/surats/{$suratId}/process-sekdes");
        $processSekdesRes->assertStatus(200);
        $this->assertEquals('pending_kades', $processSekdesRes->json('data.status'));
        $this->assertNotEmpty($processSekdesRes->json('data.nomor_surat_resmi'));

        // 7. Kepala Desa menyetujui, menandatangani surat secara final & resmi
        auth()->forgetGuards();
        $resKades = $this->postJson('/api/auth/login', [
            'login' => 'kades',
            'password' => 'password123',
        ]);
        $tokenKades = $resKades->json('token');
        $this->assertNotEmpty($tokenKades);

        $approveKadesRes = $this->withHeader('Authorization', "Bearer {$tokenKades}")
            ->postJson("/api/kades/surats/{$suratId}/approve");
        $approveKadesRes->assertStatus(200);
        $this->assertEquals('completed', $approveKadesRes->json('data.status'));

        // 8. Verifikasi konsistensi trackings menyeluruh
        $suratCheck = SuratRequest::with('trackings')->find($suratId);
        $stages = $suratCheck->trackings->pluck('status_stage')->toArray();
        $this->assertContains('Warga', $stages);
        $this->assertContains('Ketua RT', $stages);
        $this->assertContains('Sekretaris Desa', $stages);
        $this->assertContains('Kepala Desa', $stages);

        // Cleanup
        $suratCheck->trackings()->delete();
        $suratCheck->delete();
    }

    public function test_surat_rejection_workflow_and_cancellation(): void
    {
        $suratType = SuratType::first();
        $suratTypeId = $suratType ? $suratType->id : 1;

        // 1. Warga mengajukan surat baru
        $createRes = $this->withHeader('Authorization', "Bearer {$this->tokenWarga}")
            ->postJson('/api/surats', [
                'surat_type_id' => $suratTypeId,
                'keperluan' => 'Permohonan surat uji pembatalan warga',
            ]);
        $createRes->assertStatus(201);
        $suratId = $createRes->json('data.id');

        // 2. Warga membatalkan surat sendiri saat masih pending_rt
        $deleteRes = $this->withHeader('Authorization', "Bearer {$this->tokenWarga}")
            ->deleteJson("/api/surats/{$suratId}");
        $deleteRes->assertStatus(200)
            ->assertJson(['success' => true]);

        // Verifikasi surat telah terhapus dari database
        $this->assertNull(SuratRequest::find($suratId));
    }

    /*
     * --------------------------------------------------------------------------
     * AREA D: PENERBITAN & VERIFIKASI SURAT
     * --------------------------------------------------------------------------
     */

    public function test_letter_number_service_formatting_and_sequence(): void
    {
        $suratType = clone SuratType::first();
        $this->assertNotNull($suratType);
        $suratType->format_nomor = '{KLASIFIKASI}/{NO}/418.66.04/{BULAN_ROMAWI}/{TAHUN}';

        $testDate = Carbon::create(2026, 8, 17, 10, 0, 0, 'Asia/Jakarta');
        $number = LetterNumberService::generateNumber($suratType, 42, $testDate);

        // Sequence terpadu 3 digit: 042
        $this->assertStringContainsString('042', $number);
        // Bulan Agustus -> Romawi VIII
        $this->assertStringContainsString('VIII', $number);
        // Tahun 2026
        $this->assertStringContainsString('2026', $number);
    }

    /*
     * --------------------------------------------------------------------------
     * AREA E: DOKUMEN KEPENDUDUKAN
     * --------------------------------------------------------------------------
     */

    public function test_dokumen_kependudukan_index_and_stats(): void
    {
        $res = $this->withHeader('Authorization', "Bearer {$this->tokenWarga}")
            ->getJson('/api/warga/dokumen');

        $res->assertStatus(200)
            ->assertJson(['success' => true]);

        $data = $res->json('data');
        $this->assertArrayHasKey('dokumen', $data);
        $this->assertArrayHasKey('stats', $data);
        $this->assertIsBool($data['stats']['is_ready_for_letters']);
        $this->assertIsInt($data['stats']['total_terunggah']);
    }

    /*
     * --------------------------------------------------------------------------
     * AREA F: BANTUAN SOSIAL (BANSOS)
     * --------------------------------------------------------------------------
     */

    public function test_bansos_queue_duplicate_prevention_and_disbursement_verification(): void
    {
        // 1. Sekdes membuat program bansos baru
        $createBansos = $this->withHeader('Authorization', "Bearer {$this->tokenSekdes}")
            ->postJson('/api/bansos', [
                'nama_bantuan' => 'BLT Dana Desa Uji QA Fase 4',
                'sumber_dana' => 'Dana Desa APBDes',
                'tahun' => 2026,
                'tahap' => 'Tahap III',
                'kuota_penerima' => 50,
                'nominal_per_penerima' => 300000,
                'tanggal_penyaluran' => '2026-10-25',
                'waktu_mulai' => '08:30',
                'lokasi_penyaluran' => 'Balai Desa Doko',
                'deskripsi' => 'Pengujian verifikasi alur bansos QA Fase 4',
            ]);
        $createBansos->assertStatus(201);
        $bansosId = $createBansos->json('data.id');

        $warga = WargaProfile::first();
        $this->assertNotNull($warga);

        // 2. Tambah warga sebagai penerima
        $addRecipientRes = $this->withHeader('Authorization', "Bearer {$this->tokenSekdes}")
            ->postJson("/api/bansos/{$bansosId}/penerima", [
                'warga_profile_id' => $warga->id,
            ]);
        $addRecipientRes->assertStatus(201);
        $penerima = $addRecipientRes->json('data');
        $this->assertEquals('A-001', $penerima['nomor_antrean']);
        $qrCode = $penerima['qr_bantuan_code'];
        $this->assertNotEmpty($qrCode);

        // 3. Tambah warga yang sama LAGI -> HARUS DITOLAK (Pencegahan Duplikasi Penerima)
        $addDuplicateRes = $this->withHeader('Authorization', "Bearer {$this->tokenSekdes}")
            ->postJson("/api/bansos/{$bansosId}/penerima", [
                'warga_profile_id' => $warga->id,
            ]);
        $addDuplicateRes->assertStatus(422)
            ->assertJson(['success' => false]);
        $this->assertStringContainsString('sudah terdaftar', $addDuplicateRes->json('message'));

        // 4. Publikasikan dan Broadcast
        $publishRes = $this->withHeader('Authorization', "Bearer {$this->tokenSekdes}")
            ->postJson("/api/bansos/{$bansosId}/publish-broadcast");
        $publishRes->assertStatus(200);

        // 5. Verifikasi penyaluran via QR Code
        $verifyRes = $this->withHeader('Authorization', "Bearer {$this->tokenSekdes}")
            ->postJson("/api/bansos/{$bansosId}/verify-disalurkan", [
                'qr_bantuan_code' => $qrCode,
            ]);
        $verifyRes->assertStatus(200);
        $this->assertEquals('Sudah Disalurkan', $verifyRes->json('data.status_penyaluran'));

        // 6. Percobaan penyaluran ULANG dengan QR yang sama -> HARUS DITOLAK (Anti Double Disbursement)
        $doubleDisburseRes = $this->withHeader('Authorization', "Bearer {$this->tokenSekdes}")
            ->postJson("/api/bansos/{$bansosId}/verify-disalurkan", [
                'qr_bantuan_code' => $qrCode,
            ]);
        $doubleDisburseRes->assertStatus(422);
        $this->assertStringContainsString('sudah disalurkan sebelumnya', $doubleDisburseRes->json('message'));

        // Cleanup
        BantuanPenerima::where('bantuan_sosial_id', $bansosId)->delete();
        BantuanSosial::where('id', $bansosId)->delete();
    }

    /*
     * --------------------------------------------------------------------------
     * AREA G: KEUANGAN RT & APBDES
     * --------------------------------------------------------------------------
     */

    public function test_kas_rt_balance_calculation_and_validation(): void
    {
        $userRt = User::where('username', 'rt01')->first();
        $rtId = $userRt?->getAuthorizedRtId() ?? \App\Models\Rt::first()?->id ?? 1;

        // Ambil saldo awal
        $initialRes = $this->withHeader('Authorization', "Bearer {$this->tokenRt01}")
            ->getJson("/api/kas-rt?rt_id={$rtId}");
        $initialRes->assertStatus(200);
        $initialSaldo = (float) $initialRes->json('summary.saldo');

        // 1. Input Pemasukan 100.000
        $inRes = $this->withHeader('Authorization', "Bearer {$this->tokenRt01}")
            ->postJson('/api/kas-rt/transactions', [
                'rt_id' => $rtId,
                'tipe' => 'Pemasukan',
                'jumlah' => 100000,
                'keterangan' => 'Uji Kas RT Pemasukan QA Fase 4',
                'tanggal_transaksi' => '2026-10-11',
            ]);
        $inRes->assertStatus(201);
        $inId = $inRes->json('data.id');

        // 2. Input Pengeluaran 30.000
        $outRes = $this->withHeader('Authorization', "Bearer {$this->tokenRt01}")
            ->postJson('/api/kas-rt/transactions', [
                'rt_id' => $rtId,
                'tipe' => 'Pengeluaran',
                'jumlah' => 30000,
                'keterangan' => 'Uji Kas RT Pengeluaran QA Fase 4',
                'tanggal_transaksi' => '2026-10-11',
            ]);
        $outRes->assertStatus(201);
        $outId = $outRes->json('data.id');

        // 3. Verifikasi perhitungan saldo: Saldo baru harus bertambah tepat 70.000
        $afterRes = $this->withHeader('Authorization', "Bearer {$this->tokenRt01}")
            ->getJson("/api/kas-rt?rt_id={$rtId}");
        $afterRes->assertStatus(200);
        $newSaldo = (float) $afterRes->json('summary.saldo');

        $this->assertEquals($initialSaldo + 70000, $newSaldo);

        // 4. Input jumlah bernilai 0 atau negatif harus DITOLAK
        $negRes = $this->withHeader('Authorization', "Bearer {$this->tokenRt01}")
            ->postJson('/api/kas-rt/transactions', [
                'rt_id' => $rtId,
                'tipe' => 'Pemasukan',
                'jumlah' => -5000,
                'keterangan' => 'Jumlah negatif harus ditolak',
            ]);
        $negRes->assertStatus(422);

        // Cleanup
        KasRtTransaction::whereIn('id', [$inId, $outId])->delete();
    }

    public function test_apbdes_summary_and_budget_record_lifecycle(): void
    {
        $cat = ApbdesCategory::first();
        $this->assertNotNull($cat);

        // 1. Bendahara menambah pos anggaran APBDes
        $storeRes = $this->withHeader('Authorization', "Bearer {$this->tokenBendahara}")
            ->postJson('/api/apbdes/records', [
                'category_id' => $cat->id,
                'tahun_anggaran' => 2026,
                'uraian' => 'Pos Anggaran Pengujian QA Fase 4',
                'anggaran' => 15000000,
                'realisasi' => 5000000,
            ]);
        $storeRes->assertStatus(201);
        $recordId = $storeRes->json('data.id');

        // 2. Ambil ringkasan publik APBDes
        $summaryRes = $this->getJson('/api/public/apbdes/summary?tahun=2026');
        $summaryRes->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertArrayHasKey('pendapatan', $summaryRes->json('summary'));
        $this->assertArrayHasKey('belanja', $summaryRes->json('summary'));

        // 3. Update realisasi
        $updateRes = $this->withHeader('Authorization', "Bearer {$this->tokenBendahara}")
            ->putJson("/api/apbdes/records/{$recordId}", [
                'realisasi' => 10000000,
            ]);
        $updateRes->assertStatus(200);
        $this->assertEquals(10000000, $updateRes->json('data.realisasi'));

        // Cleanup
        ApbdesRecord::where('id', $recordId)->delete();
    }

    /*
     * --------------------------------------------------------------------------
     * AREA H: GIS & INFORMASI PUBLIK
     * --------------------------------------------------------------------------
     */

    public function test_public_village_stats_are_consistent_and_non_negative(): void
    {
        $res = $this->getJson('/api/public/stats');
        $res->assertStatus(200);

        $stats = $res->json('stats');
        $this->assertGreaterThanOrEqual(0, $stats['total_warga']);
        $this->assertGreaterThanOrEqual(0, $stats['total_kk']);
        $this->assertGreaterThanOrEqual(0, $stats['total_surat_selesai']);
        $this->assertEquals($stats['total_warga'], $stats['total_laki'] + $stats['total_perempuan']);
    }

    public function test_public_beritas_only_returns_published_articles(): void
    {
        $res = $this->getJson('/api/public/beritas');
        $res->assertStatus(200);

        $data = $res->json('data');
        foreach ($data as $item) {
            $this->assertTrue((bool)$item['is_published']);
        }
    }

    /*
     * --------------------------------------------------------------------------
     * AREA I: STATE MACHINE & TERRITORIAL BOUNDARY REGRESSIONS (P0/P1)
     * --------------------------------------------------------------------------
     */

    public function test_sekdes_process_rejects_pending_rt_letter(): void
    {
        $userSekdes = User::where('username', 'sekdes')->first();
        $this->assertNotNull($userSekdes);

        $pendingSurat = SuratRequest::where('desa_id', $userSekdes->desa_id)->where('status', 'pending_rt')->first();
        if (!$pendingSurat) {
            $suratType = SuratType::where('desa_id', $userSekdes->desa_id)->first() ?? SuratType::first();
            $warga = WargaProfile::where('desa_id', $userSekdes->desa_id)->first() ?? WargaProfile::first();
            $pendingSurat = SuratRequest::create([
                'desa_id' => $userSekdes->desa_id,
                'nomor_resi' => 'RESI-' . strtoupper(uniqid()),
                'qr_verification_hash' => \Illuminate\Support\Str::random(32),
                'warga_profile_id' => $warga ? $warga->id : 1,
                'surat_type_id' => $suratType ? $suratType->id : 1,
                'status' => 'pending_rt',
                'keperluan' => 'Keperluan Uji Coba Sekdes',
            ]);
        }

        $res = $this->withHeader('Authorization', 'Bearer ' . $this->tokenSekdes)
            ->postJson("/api/surats/{$pendingSurat->id}/process-sekdes");

        $res->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
        $this->assertStringContainsString('tidak dapat diproses', $res->json('message'));
    }

    public function test_sekdes_cannot_process_or_reject_already_completed_letter(): void
    {
        $userSekdes = User::where('username', 'sekdes')->first();
        $this->assertNotNull($userSekdes);

        $completedSurat = SuratRequest::where('desa_id', $userSekdes->desa_id)->where('status', 'completed')->first();
        if (!$completedSurat) {
            $suratType = SuratType::where('desa_id', $userSekdes->desa_id)->first() ?? SuratType::first();
            $warga = WargaProfile::where('desa_id', $userSekdes->desa_id)->first() ?? WargaProfile::first();
            $completedSurat = SuratRequest::create([
                'desa_id' => $userSekdes->desa_id,
                'nomor_resi' => 'RESI-' . strtoupper(uniqid()),
                'qr_verification_hash' => \Illuminate\Support\Str::random(32),
                'warga_profile_id' => $warga ? $warga->id : 1,
                'surat_type_id' => $suratType ? $suratType->id : 1,
                'status' => 'completed',
                'nomor_surat_resmi' => '470/999/TEST/' . date('Y'),
                'keperluan' => 'Keperluan Uji Coba Sekdes Completed',
            ]);
        }

        // Coba proses lagi surat yang sudah completed -> harus 422
        $resProcess = $this->withHeader('Authorization', 'Bearer ' . $this->tokenSekdes)
            ->postJson("/api/surats/{$completedSurat->id}/process-sekdes");
        $resProcess->assertStatus(422);

        // Coba tolak surat yang sudah completed -> harus 422
        $resReject = $this->withHeader('Authorization', 'Bearer ' . $this->tokenSekdes)
            ->postJson("/api/surats/{$completedSurat->id}/reject", ['alasan' => 'Uji coba penolakan']);
        $resReject->assertStatus(422);
    }

    public function test_public_qr_verification_validity_reflects_letter_completion_status(): void
    {
        // 1. Surat completed -> valid: true
        $completedSurat = SuratRequest::where('status', 'completed')->whereNotNull('qr_verification_hash')->first();
        if ($completedSurat) {
            $res = $this->getJson("/api/public/surat/verify-qr/{$completedSurat->qr_verification_hash}");
            $res->assertStatus(200);
            $this->assertTrue($res->json('valid'));
            $this->assertEquals('completed', $res->json('status_surat'));
        }

        // 2. Surat pending_rt -> valid: false
        $pendingSurat = SuratRequest::where('status', 'pending_rt')->whereNotNull('qr_verification_hash')->first();
        if ($pendingSurat) {
            $res = $this->getJson("/api/public/surat/verify-qr/{$pendingSurat->qr_verification_hash}");
            $res->assertStatus(200);
            $this->assertFalse($res->json('valid'));
            $this->assertEquals('pending_rt', $res->json('status_surat'));
        }
    }

    public function test_rt_cannot_respond_to_complaint_from_other_rt(): void
    {
        $userRt01 = User::where('username', 'rt01')->first();
        $this->assertNotNull($userRt01);
        $rtId = $userRt01->getAuthorizedRtId();

        $otherComplaint = \App\Models\PengaduanWarga::where('desa_id', $userRt01->desa_id)->where('rt_id', '!=', $rtId)->first();
        if (!$otherComplaint) {
            $otherRt = \App\Models\Rt::where('desa_id', $userRt01->desa_id)->where('id', '!=', $rtId)->first();
            if (!$otherRt) {
                $otherRt = \App\Models\Rt::create([
                    'desa_id' => $userRt01->desa_id,
                    'rw_id' => $userRt01->wargaProfile?->rt?->rw_id ?? \App\Models\Rw::first()?->id ?? 1,
                    'nomor_rt' => '99',
                ]);
            }
            $wProfile = \App\Models\WargaProfile::where('desa_id', $userRt01->desa_id)->first() ?? \App\Models\WargaProfile::first();
            $otherComplaint = \App\Models\PengaduanWarga::create([
                'desa_id' => $userRt01->desa_id,
                'warga_profile_id' => $wProfile ? $wProfile->id : null,
                'rt_id' => $otherRt->id,
                'judul' => 'Aduan RT Lain',
                'deskripsi' => 'Uji coba batas teritorial',
                'kategori' => 'Keamanan',
                'status' => 'Ditinjau RT',
            ]);
        }

        if ($otherComplaint) {
            $res = $this->withHeader('Authorization', 'Bearer ' . $this->tokenRt01)
                ->postJson("/api/rt/pengaduan/{$otherComplaint->id}/respond", [
                    'tanggapan' => 'Saya mau balas aduan RT sebelah',
                    'status' => 'Selesai',
                ]);

            $res->assertStatus(403)
                ->assertJson(['success' => false]);
            $this->assertStringContainsString('Akses ditolak', $res->json('message'));
        }
    }

    public function test_private_citizen_document_storage_access_control(): void
    {
        $userWarga = User::where('username', 'warga01')->first();
        $this->assertNotNull($userWarga);
        $userId = $userWarga->id;

        $dir = storage_path("app/private/warga_dokumen/{$userId}");
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $testFile = 'ktp_test_sec_audit.png';
        $fullPath = $dir . '/' . $testFile;
        file_put_contents($fullPath, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='));

        try {
            // 1. Unauthenticated request -> 401
            $this->flushHeaders();
            auth()->forgetGuards();
            $resGuest = $this->getJson("/api/warga/dokumen/file/{$userId}/{$testFile}");
            $resGuest->assertStatus(401)
                ->assertJson(['success' => false]);

            // 2. Cross-citizen request (warga02 mencoba akses dokumen warga01) -> 403
            $loginWarga02 = $this->postJson('/api/auth/login', [
                'login' => 'warga02',
                'password' => 'password123',
            ]);
            $tokenWarga02 = $loginWarga02->json('token');
            if ($tokenWarga02) {
                auth()->forgetGuards();
                $resCross = $this->withHeader('Authorization', "Bearer {$tokenWarga02}")
                    ->getJson("/api/warga/dokumen/file/{$userId}/{$testFile}");
                $resCross->assertStatus(403)
                    ->assertJson(['success' => false]);
                $this->assertStringContainsString('Akses ditolak', $resCross->json('message'));
            }

            // 3. Authorized access by owner (Bearer token) -> 200
            auth()->forgetGuards();
            $resOwner = $this->withHeader('Authorization', "Bearer {$this->tokenWarga}")
                ->get("/api/warga/dokumen/file/{$userId}/{$testFile}");
            $resOwner->assertStatus(200);
            $this->assertEquals('image/png', $resOwner->headers->get('Content-Type'));

            // 4. Raw Query token parameter (?token=) must be rejected (401), while valid signed URL is accepted (200)
            $this->flushHeaders();
            auth()->forgetGuards();
            $resQueryToken = $this->get("/api/warga/dokumen/file/{$userId}/{$testFile}?token={$this->tokenWarga}");
            $resQueryToken->assertStatus(401);

            $signedUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
                'api.warga.dokumen.file',
                now()->addMinutes(15),
                ['userId' => $userId, 'filename' => $testFile]
            );
            $resSigned = $this->get($signedUrl);
            $resSigned->assertStatus(200);
            $this->assertEquals('image/png', $resSigned->headers->get('Content-Type'));

            // 5. Authorized access by Sekdes (Desa level authority) -> 200
            auth()->forgetGuards();
            $resSekdes = $this->withHeader('Authorization', "Bearer {$this->tokenSekdes}")
                ->get("/api/warga/dokumen/file/{$userId}/{$testFile}");
            $resSekdes->assertStatus(200);

            // 6. Authorized access by RT 01 (RT wilayah warga01) -> 200
            auth()->forgetGuards();
            $resRt = $this->withHeader('Authorization', "Bearer {$this->tokenRt01}")
                ->get("/api/warga/dokumen/file/{$userId}/{$testFile}");
            $resRt->assertStatus(200);

            // 7. Cross-RT access attempt: RT 01 mencoba akses dokumen warga RT 02 -> 403
            $userRt02Warga = User::where('username', 'test_qa_warga_rt02')->first();
            if ($userRt02Warga) {
                $dirRt2 = storage_path("app/private/warga_dokumen/{$userRt02Warga->id}");
                if (!is_dir($dirRt2)) {
                    mkdir($dirRt2, 0755, true);
                }
                $fileRt2 = $dirRt2 . '/ktp_rt2_test.png';
                file_put_contents($fileRt2, 'test');

                auth()->forgetGuards();
                $resCrossRt = $this->withHeader('Authorization', "Bearer {$this->tokenRt01}")
                    ->getJson("/api/warga/dokumen/file/{$userRt02Warga->id}/ktp_rt2_test.png");
                $resCrossRt->assertStatus(403)
                    ->assertJson(['success' => false]);
                $this->assertStringContainsString('wilayah RT', $resCrossRt->json('message'));

                @unlink($fileRt2);
            }
        } finally {
            if (file_exists($fullPath)) {
                @unlink($fullPath);
            }
        }
    }
}

