<?php

namespace Tests\Feature;

use App\Models\Pengumuman;
use App\Models\SuratRequest;
use App\Models\SuratType;
use App\Models\User;
use App\Models\WargaProfile;
use Tests\TestCase;

class RoleGovernanceAndApprovalWorkflowTest extends TestCase
{
    protected ?string $tokenWarga = null;
    protected ?string $tokenRt = null;
    protected ?string $tokenSekdes = null;
    protected ?string $tokenKades = null;
    protected ?string $tokenAdmin = null;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Login Warga
        $resWarga = $this->postJson('/api/auth/login', [
            'login' => 'warga01',
            'password' => 'password123',
        ]);
        if ($resWarga->status() === 200) {
            $this->tokenWarga = $resWarga->json('token');
        }

        // 2. Login RT 01
        $resRt = $this->postJson('/api/auth/login', [
            'login' => 'rt01',
            'password' => 'password123',
        ]);
        if ($resRt->status() === 200) {
            $this->tokenRt = $resRt->json('token');
        }

        // 3. Login Sekdes
        $resSekdes = $this->postJson('/api/auth/login', [
            'login' => 'sekdes',
            'password' => 'password123',
        ]);
        if ($resSekdes->status() === 200) {
            $this->tokenSekdes = $resSekdes->json('token');
        }

        // 4. Login Kades
        $resKades = $this->postJson('/api/auth/login', [
            'login' => 'kades',
            'password' => 'password123',
        ]);
        if ($resKades->status() === 200) {
            $this->tokenKades = $resKades->json('token');
        }

        // 5. Login Admin Sistem
        $resAdmin = $this->postJson('/api/auth/login', [
            'login' => 'admin',
            'password' => 'password123',
        ]);
        if ($resAdmin->status() === 200) {
            $this->tokenAdmin = $resAdmin->json('token');
        }
    }

    /**
     * Test 1: Admin Sistem DITOLAK (403) pada seluruh endpoint persetujuan pemerintahan.
     */
    public function test_admin_is_strictly_forbidden_from_approving_letters_and_announcements(): void
    {
        $this->assertNotEmpty($this->tokenAdmin);

        // Cari atau buat surat dummy
        $surat = SuratRequest::where('status', 'pending_kades')->first() 
            ?? SuratRequest::where('status', 'processed_sekdes')->first()
            ?? SuratRequest::first();

        // Admin mencoba ACC RT -> 403
        $resRt = $this->withHeader('Authorization', "Bearer {$this->tokenAdmin}")
            ->postJson("/api/surats/{$surat->id}/approve-rt");
        $this->assertEquals(403, $resRt->status());

        // Admin mencoba Proses Sekdes -> 403
        $resSekdes = $this->withHeader('Authorization', "Bearer {$this->tokenAdmin}")
            ->postJson("/api/surats/{$surat->id}/process-sekdes");
        $this->assertEquals(403, $resSekdes->status());

        // Admin mencoba ACC Kades -> 403
        $resKades = $this->withHeader('Authorization', "Bearer {$this->tokenAdmin}")
            ->postJson("/api/kades/surats/{$surat->id}/approve");
        $this->assertEquals(403, $resKades->status());

        // Admin mencoba Tolak Kades -> 403
        $resReject = $this->withHeader('Authorization', "Bearer {$this->tokenAdmin}")
            ->postJson("/api/kades/surats/{$surat->id}/reject", ['alasan' => 'Admin mencoba menolak']);
        $this->assertEquals(403, $resReject->status());
    }

    /**
     * Test 2: Alur Lengkap Surat Warga -> RT -> Sekdes -> Kades Rejection & Resubmission -> Kades Approval.
     */
    public function test_surat_complete_governance_workflow_with_kades_rejection_and_approval(): void
    {
        $suratType = \App\Models\SuratType::first();
        $suratTypeId = $suratType ? $suratType->id : 1;

        // 1. Warga mengajukan surat baru
        auth()->forgetGuards();
        $createRes = $this->withHeader('Authorization', "Bearer {$this->tokenWarga}")
            ->postJson('/api/surats', [
                'surat_type_id' => $suratTypeId,
                'keperluan' => 'Permohonan surat uji governance lengkap RT - Sekdes - Kades',
            ]);
        $createRes->assertStatus(201);
        $suratId = $createRes->json('data.id');
        $this->assertEquals('pending_rt', $createRes->json('data.status'));

        // 2. Kades TIDAK BISA langsung menyetujui surat yang masih pending_rt -> 422
        auth()->forgetGuards();
        $kadesEarlyRes = $this->withHeader('Authorization', "Bearer {$this->tokenKades}")
            ->postJson("/api/kades/surats/{$suratId}/approve");
        $kadesEarlyRes->assertStatus(422);

        // 3. RT 01 Menyetujui surat
        auth()->forgetGuards();
        $approveRtRes = $this->withHeader('Authorization', "Bearer {$this->tokenRt}")
            ->postJson("/api/surats/{$suratId}/approve-rt", [
                'catatan' => 'Identitas dan domisili terverifikasi sah oleh RT 01',
            ]);
        $approveRtRes->assertStatus(200);
        $this->assertEquals('processed_sekdes', $approveRtRes->json('data.status'));

        // 4. Sekdes memproses dan meneruskan ke Kades (Status menjadi pending_kades, BUKAN completed!)
        auth()->forgetGuards();
        $processSekdesRes = $this->withHeader('Authorization', "Bearer {$this->tokenSekdes}")
            ->postJson("/api/surats/{$suratId}/process-sekdes", [
                'catatan' => 'Berkas lengkap, diajukan ke Kades',
            ]);
        $processSekdesRes->assertStatus(200);
        $this->assertEquals('pending_kades', $processSekdesRes->json('data.status'));

        // 5. Kades menolak surat karena data kurang lengkap (Wajib alasan, min 5 karakter)
        auth()->forgetGuards();
        $rejectNoReasonRes = $this->withHeader('Authorization', "Bearer {$this->tokenKades}")
            ->postJson("/api/kades/surats/{$suratId}/reject", [
                'alasan' => 'abc', // kurang dari 5 karakter -> harus 422
            ]);
        $rejectNoReasonRes->assertStatus(422);

        $rejectKadesRes = $this->withHeader('Authorization', "Bearer {$this->tokenKades}")
            ->postJson("/api/kades/surats/{$suratId}/reject", [
                'alasan' => 'Mohon lampirkan fotokopi bukti pembayaran PBB tahun berjalan.',
            ]);
        $rejectKadesRes->assertStatus(200);
        $this->assertEquals('rejected_kades', $rejectKadesRes->json('data.status'));
        $this->assertEquals('Mohon lampirkan fotokopi bukti pembayaran PBB tahun berjalan.', $rejectKadesRes->json('data.catatan_penolakan_kades'));

        // 6. Sekdes merevisi dan mengajukan ulang ke Kades
        auth()->forgetGuards();
        $resubmitRes = $this->withHeader('Authorization', "Bearer {$this->tokenSekdes}")
            ->postJson("/api/surats/{$suratId}/process-sekdes", [
                'catatan' => 'Bukti lunas PBB telah dilampirkan pemohon, diajukan kembali ke Kades.',
            ]);
        $resubmitRes->assertStatus(200);
        $this->assertEquals('pending_kades', $resubmitRes->json('data.status'));

        // 7. Kades menyetujui dan menandatangani surat secara final
        auth()->forgetGuards();
        $approveKadesRes = $this->withHeader('Authorization', "Bearer {$this->tokenKades}")
            ->postJson("/api/kades/surats/{$suratId}/approve", [
                'catatan' => 'Disetujui dan disahkan secara digital oleh Kepala Desa Doko.',
            ]);
        $approveKadesRes->assertStatus(200);
        $this->assertEquals('completed', $approveKadesRes->json('data.status'));
        $this->assertNotEmpty($approveKadesRes->json('data.nomor_surat_resmi'));
        $this->assertNotEmpty($approveKadesRes->json('data.qr_verification_hash'));

        // 8. Verifikasi QR Code surat yang completed sah via endpoint publik
        $qrHash = $approveKadesRes->json('data.qr_verification_hash');
        $verifyRes = $this->getJson("/api/public/surat/verify-qr/{$qrHash}");
        $verifyRes->assertStatus(200);
        $this->assertTrue($verifyRes->json('valid'));

        // Cleanup
        $suratCheck = SuratRequest::with('trackings')->find($suratId);
        $suratCheck->trackings()->delete();
        $suratCheck->delete();
    }

    /**
     * Test 3: Alur Pengumuman Desa (Sekdes Buat Draf -> Kades Tinjau & Setujui -> Publikasi Sah).
     */
    public function test_pengumuman_draft_approval_and_public_isolation(): void
    {
        // 1. Sekdes membuat draf pengumuman
        auth()->forgetGuards();
        $createRes = $this->withHeader('Authorization', "Bearer {$this->tokenSekdes}")
            ->postJson('/api/pengumumans', [
                'judul' => 'Pengumuman Musrenbangdes Tahun Anggaran 2027',
                'kategori' => 'Pemerintahan',
                'isi' => 'Rapat Musyawarah Rencana Pembangunan Desa Doko bertempat di Pendopo Balai Desa.',
                'level_target' => 'Semua',
                'tanggal_mulai' => now()->addDays(2)->toDateString(),
            ]);
        $createRes->assertStatus(201);
        $pengumumanId = $createRes->json('data.id');
        $this->assertEquals('pending_approval', $createRes->json('data.status'));
        $this->assertFalse((bool)$createRes->json('data.is_active'));

        // 2. Publik / Warga TIDAK BISA melihat pengumuman yang belum disetujui
        auth()->forgetGuards();
        $this->flushHeaders();
        $publicListRes = $this->getJson('/api/public/pengumumans');
        $publicIds = collect($publicListRes->json('data'))->pluck('id')->toArray();

        // Warga juga tidak bisa melihat
        auth()->forgetGuards();
        $wargaListRes = $this->withHeader('Authorization', "Bearer {$this->tokenWarga}")
            ->getJson('/api/pengumumans');
        $wargaIds = collect($wargaListRes->json('data'))->pluck('id')->toArray();

        $this->assertNotContains($pengumumanId, $publicIds);
        $this->assertNotContains($pengumumanId, $wargaIds);

        // 3. Kades menolak draf untuk diperbaiki
        auth()->forgetGuards();
        $rejectRes = $this->withHeader('Authorization', "Bearer {$this->tokenKades}")
            ->postJson("/api/kades/pengumumans/{$pengumumanId}/reject", [
                'alasan' => 'Harap cantumkan susunan acara dan peserta undangan RT/RW.',
            ]);
        $rejectRes->assertStatus(200);
        $this->assertEquals('rejected', $rejectRes->json('data.status'));

        // 4. Sekdes merevisi dan mengajukan kembali
        auth()->forgetGuards();
        $updateRes = $this->withHeader('Authorization', "Bearer {$this->tokenSekdes}")
            ->putJson("/api/pengumumans/{$pengumumanId}", [
                'isi' => 'Rapat Musrenbangdes Desa Doko. Susunan acara terlampir, seluruh Ketua RT dan RW wajib hadir.',
            ]);
        $updateRes->assertStatus(200);
        $this->assertEquals('pending_approval', $updateRes->json('data.status'));

        // 5. Kades menyetujui pengumuman
        auth()->forgetGuards();
        $approveRes = $this->withHeader('Authorization', "Bearer {$this->tokenKades}")
            ->postJson("/api/kades/pengumumans/{$pengumumanId}/approve", [
                'publish_immediately' => true,
            ]);
        $approveRes->assertStatus(200);
        $this->assertEquals('published', $approveRes->json('data.status'));
        $this->assertTrue((bool)$approveRes->json('data.is_active'));

        // 6. Sekarang pengumuman MUNCUL di daftar publik
        $publicListResAfter = $this->getJson('/api/public/pengumumans');
        $publicIdsAfter = collect($publicListResAfter->json('data'))->pluck('id')->toArray();
        $this->assertContains($pengumumanId, $publicIdsAfter);

        // Cleanup
        Pengumuman::destroy($pengumumanId);
    }
}
