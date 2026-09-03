<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\ApbdesCategory;
use App\Models\ApbdesRecord;
use App\Models\BantuanPenerima;
use App\Models\BantuanSosial;
use App\Models\Berita;
use App\Models\DesaSetting;
use App\Models\Dusun;
use App\Models\KartuKeluarga;
use App\Models\KasRtCategory;
use App\Models\KasRtTransaction;
use App\Models\NotifikasiLog;
use App\Models\PengaduanWarga;
use App\Models\Pengumuman;
use App\Models\Role;
use App\Models\Rt;
use App\Models\Rw;
use App\Models\SuratRequest;
use App\Models\SuratTracking;
use App\Models\SuratType;
use App\Models\User;
use App\Models\WargaProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Roles
        $roles = [
            ['name' => 'Super Admin', 'slug' => 'admin', 'display_name' => 'Administrator Sistem', 'description' => 'Akses penuh seluruh konfigurasi dan master data sistem'],
            ['name' => 'Kepala Desa', 'slug' => 'kades', 'display_name' => 'Kepala Desa', 'description' => 'Monitoring analitik desa, persetujuan kebijakan dan laporan umum'],
            ['name' => 'Sekretaris Desa', 'slug' => 'sekdes', 'display_name' => 'Sekretaris Desa', 'description' => 'Pengelolaan administrasi persuratan dan legalisasi stempel QR resmi'],
            ['name' => 'Bendahara Desa', 'slug' => 'bendahara_desa', 'display_name' => 'Kaur Keuangan / Bendahara Desa', 'description' => 'Pengelolaan APBDes dan laporan realisasi keuangan desa transparan'],
            ['name' => 'Ketua RW', 'slug' => 'rw', 'display_name' => 'Ketua RW', 'description' => 'Verifikasi pengantar dari seluruh RT di wilayah RW'],
            ['name' => 'Ketua RT', 'slug' => 'rt', 'display_name' => 'Ketua RT', 'description' => 'Persetujuan awal surat pengantar dan manajemen warga tingkat RT'],
            ['name' => 'Sekretaris RT', 'slug' => 'sekretaris_rt', 'display_name' => 'Sekretaris RT', 'description' => 'Bantu pencatatan administrasi dan data kependudukan RT'],
            ['name' => 'Bendahara RT', 'slug' => 'bendahara_rt', 'display_name' => 'Bendahara RT', 'description' => 'Pengelolaan kas iuran warga RT dan laporan keuangan tingkat RT'],
            ['name' => 'Warga', 'slug' => 'warga', 'display_name' => 'Warga Masyarakat', 'description' => 'Pengajuan surat online, cek tracking, transparansi dana & bansos'],
        ];

        $roleMap = [];
        foreach ($roles as $r) {
            $roleMap[$r['slug']] = Role::create($r);
        }

        // 2. Desa Settings (Dynamic Kop Surat)
        DesaSetting::create([
            'nama_desa' => 'Desa Doko',
            'kode_desa' => '35.06.04.2001',
            'kecamatan' => 'Kecamatan Ngasem',
            'kabupaten' => 'Kabupaten Kediri',
            'provinsi' => 'Jawa Timur',
            'kode_pos' => '64182',
            'alamat_kantor' => 'Jl. Raya Doko No. 12, Kec. Ngasem, Kab. Kediri, Jawa Timur',
            'telepon' => '0354-681234',
            'email' => 'pemdes.doko@kedirikab.go.id',
            'website' => 'https://doko.kedirikab.go.id',
            'kop_atas' => 'PEMERINTAH KABUPATEN KEDIRI',
            'kop_tengah' => 'KECAMATAN NGASEM',
            'kop_bawah' => 'KANTOR KEPALA DESA DOKO',
            'kop_footer' => 'Jl. Raya Doko No. 12 Kec. Ngasem Kab. Kediri 64182, Telp. (0354) 681234, Email: pemdes.doko@kedirikab.go.id',
            'nama_kades' => 'Drs. H. Bambang Prasetyo, M.Si',
            'nip_kades' => '19680514 199403 1 004',
            'nama_sekdes' => 'Ahmad Fauzi, S.Kom',
            'nip_sekdes' => '19850412 201101 1 003',
        ]);

        $defaultPassword = Hash::make('password123');

        // 3. User Akun Petinggi Desa
        $adminUser = User::create([
            'role_id' => $roleMap['admin']->id,
            'name' => 'Administrator SIDes',
            'username' => 'admin',
            'email' => 'admin@sidesku.desa.id',
            'phone_number' => '081234567890',
            'password' => $defaultPassword,
            'is_active' => true,
        ]);

        $kadesUser = User::create([
            'role_id' => $roleMap['kades']->id,
            'name' => 'Drs. H. Bambang Prasetyo, M.Si',
            'username' => 'kades',
            'email' => 'kades@sidesku.desa.id',
            'phone_number' => '081234567891',
            'password' => $defaultPassword,
            'is_active' => true,
        ]);

        $sekdesUser = User::create([
            'role_id' => $roleMap['sekdes']->id,
            'name' => 'Ahmad Fauzi, S.Kom',
            'username' => 'sekdes',
            'email' => 'sekdes@sidesku.desa.id',
            'phone_number' => '081234567892',
            'password' => $defaultPassword,
            'is_active' => true,
        ]);

        $bendaharaDesaUser = User::create([
            'role_id' => $roleMap['bendahara_desa']->id,
            'name' => 'Ratna Dewi Kusuma, S.E',
            'username' => 'bendahara_desa',
            'email' => 'bendahara.desa@sidesku.desa.id',
            'phone_number' => '081234567893',
            'password' => $defaultPassword,
            'is_active' => true,
        ]);

        // 4. Akun RW & RT
        $rwUser = User::create([
            'role_id' => $roleMap['rw']->id,
            'name' => 'Suryanto (Ketua RW 01)',
            'username' => 'rw01',
            'email' => 'rw01@sidesku.desa.id',
            'phone_number' => '081234567894',
            'password' => $defaultPassword,
            'is_active' => true,
        ]);

        $rtUser = User::create([
            'role_id' => $roleMap['rt']->id,
            'name' => 'Supriyadi (Ketua RT 01)',
            'username' => 'rt01',
            'email' => 'rt01@sidesku.desa.id',
            'phone_number' => '081234567895',
            'password' => $defaultPassword,
            'is_active' => true,
        ]);

        $sekretarisRtUser = User::create([
            'role_id' => $roleMap['sekretaris_rt']->id,
            'name' => 'Hendro Santoso (Sekretaris RT 01)',
            'username' => 'sekretaris_rt01',
            'email' => 'sekretaris.rt01@sidesku.desa.id',
            'phone_number' => '081234567896',
            'password' => $defaultPassword,
            'is_active' => true,
        ]);

        $bendaharaRtUser = User::create([
            'role_id' => $roleMap['bendahara_rt']->id,
            'name' => 'Sri Wahyuni (Bendahara RT 01)',
            'username' => 'bendahara_rt01',
            'email' => 'bendahara.rt01@sidesku.desa.id',
            'phone_number' => '081234567897',
            'password' => $defaultPassword,
            'is_active' => true,
        ]);

        // 5. Akun Warga
        $wargaUser1 = User::create([
            'role_id' => $roleMap['warga']->id,
            'name' => 'Bambang Utomo',
            'username' => 'warga01',
            'email' => 'warga01@sidesku.desa.id',
            'phone_number' => '085712345678',
            'password' => $defaultPassword,
            'is_active' => true,
        ]);

        $wargaUser2 = User::create([
            'role_id' => $roleMap['warga']->id,
            'name' => 'Siti Rahmawati',
            'username' => 'warga02',
            'email' => 'warga02@sidesku.desa.id',
            'phone_number' => '085887654321',
            'password' => $defaultPassword,
            'is_active' => true,
        ]);

        // 6. Master Wilayah
        $dusun1 = Dusun::create([
            'nama_dusun' => 'Dusun Doko Krajan',
            'kode_dusun' => 'DSN-01',
            'kepala_dusun' => 'Mochammad Taufik',
        ]);

        $dusun2 = Dusun::create([
            'nama_dusun' => 'Dusun Doko Selatan',
            'kode_dusun' => 'DSN-02',
            'kepala_dusun' => 'Hadi Sucipto',
        ]);

        $rw1 = Rw::create([
            'dusun_id' => $dusun1->id,
            'nomor_rw' => '01',
            'ketua_rw_user_id' => $rwUser->id,
        ]);

        $rw2 = Rw::create([
            'dusun_id' => $dusun1->id,
            'nomor_rw' => '02',
            'ketua_rw_user_id' => null,
        ]);

        $rt1 = Rt::create([
            'rw_id' => $rw1->id,
            'nomor_rt' => '01',
            'ketua_rt_user_id' => $rtUser->id,
            'sekretaris_rt_user_id' => $sekretarisRtUser->id,
            'bendahara_rt_user_id' => $bendaharaRtUser->id,
        ]);

        $rt2 = Rt::create([
            'rw_id' => $rw1->id,
            'nomor_rt' => '02',
            'ketua_rt_user_id' => null,
            'sekretaris_rt_user_id' => null,
            'bendahara_rt_user_id' => null,
        ]);

        // 7. Kartu Keluarga & Data Warga
        $kk1 = KartuKeluarga::create([
            'no_kk' => '3506041208010001',
            'nama_kepala_keluarga' => 'Bambang Utomo',
            'rt_id' => $rt1->id,
            'alamat_lengkap' => 'Jl. Kenanga No. 14, RT 01 / RW 01, Dusun Doko Krajan, Desa Doko',
            'no_telp_rumah' => '0354-682341',
        ]);

        $kk2 = KartuKeluarga::create([
            'no_kk' => '3506041208010002',
            'nama_kepala_keluarga' => 'Gunawan Wibisono',
            'rt_id' => $rt1->id,
            'alamat_lengkap' => 'Jl. Melati No. 05, RT 01 / RW 01, Dusun Doko Krajan, Desa Doko',
            'no_telp_rumah' => '0354-682342',
        ]);

        $wargaProfile1 = WargaProfile::create([
            'user_id' => $wargaUser1->id,
            'kk_id' => $kk1->id,
            'rt_id' => $rt1->id,
            'nik' => '3506041505840001',
            'nama_lengkap' => 'Bambang Utomo',
            'tempat_lahir' => 'Kediri',
            'tanggal_lahir' => '1984-05-15',
            'jenis_kelamin' => 'L',
            'agama' => 'Islam',
            'status_perkawinan' => 'Kawin',
            'pekerjaan' => 'Buruh Harian Lepas / Petani',
            'pendidikan_terakhir' => 'SMA/Sederajat',
            'golongan_darah' => 'O',
            'no_hp_wa' => '085712345678',
            'alamat_ktp' => 'Jl. Kenanga No. 14, RT 01 / RW 01, Dusun Doko Krajan, Desa Doko',
            'status_keluarga' => 'Kepala Keluarga',
            'status_ekonomi' => 'Kurang Mampu (PKH/BLT Eligible)',
            'status_kependudukan' => 'Tetap',
        ]);

        $wargaProfile2 = WargaProfile::create([
            'user_id' => $wargaUser2->id,
            'kk_id' => $kk1->id,
            'rt_id' => $rt1->id,
            'nik' => '3506045812890002',
            'nama_lengkap' => 'Siti Rahmawati',
            'tempat_lahir' => 'Kediri',
            'tanggal_lahir' => '1989-12-18',
            'jenis_kelamin' => 'P',
            'agama' => 'Islam',
            'status_perkawinan' => 'Kawin',
            'pekerjaan' => 'Ibu Rumah Tangga / Pedagang',
            'pendidikan_terakhir' => 'SMP/Sederajat',
            'golongan_darah' => 'B',
            'no_hp_wa' => '085887654321',
            'alamat_ktp' => 'Jl. Kenanga No. 14, RT 01 / RW 01, Dusun Doko Krajan, Desa Doko',
            'status_keluarga' => 'Istri',
            'status_ekonomi' => 'Kurang Mampu (PKH/BLT Eligible)',
            'status_kependudukan' => 'Tetap',
        ]);

        // 8. Master Jenis Surat (Lengkap Seluruh Kebutuhan Warga Desa)
        $suratTypes = [
            [
                'kode_surat' => 'SKTP',
                'nama_surat' => 'Surat Pengantar Pembuatan / Rekam KTP-el',
                'format_nomor' => '471/{NO}/418.66.04/{TAHUN}',
                'template_body' => 'Menerangkan bahwa pemohon adalah benar warga penduduk Desa Doko dan surat pengantar ini dibuat untuk permohonan penerbitan / penggantian / rekam biometrik KTP Elektronik di Dispendukcapil Kabupaten Kediri.',
                'persyaratan_json' => ['Foto Kartu Keluarga (KK)', 'Surat Pengantar RT/RW', 'KTP Lama / Surat Kehilangan (bila hilang/rusak)'],
                'masa_berlaku_hari' => 30,
                'is_active' => true,
            ],
            [
                'kode_surat' => 'SKKK',
                'nama_surat' => 'Surat Pengantar Kartu Keluarga (KK Baru / Perubahan)',
                'format_nomor' => '472/{NO}/418.66.04/{TAHUN}',
                'template_body' => 'Menerangkan bahwa pemohon mengajukan pembuatan / penambahan anggota / perubahan data Kartu Keluarga di wilayah Desa Doko.',
                'persyaratan_json' => ['KK Asli Lama', 'Buku Nikah / Akta Cerai', 'Surat Keterangan Lahir / Pindah'],
                'masa_berlaku_hari' => 30,
                'is_active' => true,
            ],
            [
                'kode_surat' => 'SKTM',
                'nama_surat' => 'Surat Keterangan Tidak Mampu (SKTM)',
                'format_nomor' => '401/{NO}/418.66.04/{TAHUN}',
                'template_body' => 'Yang bertanda tangan di bawah ini Kepala Desa Doko menerangkan dengan sebenarnya bahwa orang tersebut di atas adalah benar-benar warga penduduk Desa Doko yang tergolong keluarga tidak mampu (ekonomi lemah).',
                'persyaratan_json' => ['Foto KTP Pemohon', 'Foto Kartu Keluarga', 'Surat Pengantar RT'],
                'masa_berlaku_hari' => 30,
                'is_active' => true,
            ],
            [
                'kode_surat' => 'SKD',
                'nama_surat' => 'Surat Keterangan Domisili Warga / Lembaga',
                'format_nomor' => '470/{NO}/418.66.04/{TAHUN}',
                'template_body' => 'Menerangkan bahwa nama tersebut di atas adalah benar berdomisili dan bertempat tinggal di lingkungan wilayah Desa Doko.',
                'persyaratan_json' => ['Foto KTP', 'Foto KK'],
                'masa_berlaku_hari' => 90,
                'is_active' => true,
            ],
            [
                'kode_surat' => 'SKU',
                'nama_surat' => 'Surat Keterangan Usaha (SKU)',
                'format_nomor' => '503/{NO}/418.66.04/{TAHUN}',
                'template_body' => 'Menerangkan bahwa nama tersebut di atas benar-benar memiliki usaha yang masih aktif beroperasi di wilayah Desa Doko.',
                'persyaratan_json' => ['Foto KTP', 'Foto KK', 'Foto Tempat/Aktivitas Usaha'],
                'masa_berlaku_hari' => 60,
                'is_active' => true,
            ],
            [
                'kode_surat' => 'SKCK',
                'nama_surat' => 'Surat Pengantar SKCK (Catatan Kepolisian)',
                'format_nomor' => '300/{NO}/418.66.04/{TAHUN}',
                'template_body' => 'Menerangkan bahwa yang bersangkutan berkelakuan baik, belum pernah tersangkut perkara pidana, dan surat ini dibuat untuk persyaratan pengurusan SKCK di Polsek Ngasem.',
                'persyaratan_json' => ['Foto KTP', 'Foto KK', 'Pas Foto 4x6'],
                'masa_berlaku_hari' => 30,
                'is_active' => true,
            ],
            [
                'kode_surat' => 'SKL',
                'nama_surat' => 'Surat Keterangan Kelahiran / Pengantar Akta Lahir',
                'format_nomor' => '474.1/{NO}/418.66.04/{TAHUN}',
                'template_body' => 'Menerangkan bahwa telah lahir seorang anak dari pasangan suami istri yang sah yang bertempat tinggal di Desa Doko.',
                'persyaratan_json' => ['Surat Keterangan Lahir Bidan/RS', 'KTP Ayah & Ibu', 'Buku Nikah Asli', 'KK Asli'],
                'masa_berlaku_hari' => 60,
                'is_active' => true,
            ],
            [
                'kode_surat' => 'SKM',
                'nama_surat' => 'Surat Keterangan Kematian / Pengantar Akta Kematian',
                'format_nomor' => '474.3/{NO}/418.66.04/{TAHUN}',
                'template_body' => 'Menerangkan dengan sebenarnya bahwa yang bersangkutan telah meninggal dunia di wilayah Desa Doko.',
                'persyaratan_json' => ['Surat Kematian RS / Saksi RT', 'KTP & KK Almarhum/Almarhumah', 'KTP Pelapor (Ahli Waris)'],
                'masa_berlaku_hari' => 60,
                'is_active' => true,
            ],
            [
                'kode_surat' => 'SKBM',
                'nama_surat' => 'Surat Keterangan Belum Pernah Menikah (Model N1-N4)',
                'format_nomor' => '474.2/{NO}/418.66.04/{TAHUN}',
                'template_body' => 'Menerangkan bahwa nama tersebut di atas sampai saat ini berstatus Perjaka / Perawan dan belum pernah melangsungkan pernikahan dengan siapapun.',
                'persyaratan_json' => ['KTP Pemohon', 'KK Asli', 'Pernyataan Belum Menikah Bermaterai'],
                'masa_berlaku_hari' => 30,
                'is_active' => true,
            ],
            [
                'kode_surat' => 'SKP',
                'nama_surat' => 'Surat Pengantar Pindah Domisili (SKPWNI)',
                'format_nomor' => '475/{NO}/418.66.04/{TAHUN}',
                'template_body' => 'Menerangkan bahwa yang bersangkutan mengajukan permohonan pindah domisili dari Desa Doko menuju alamat tujuan baru.',
                'persyaratan_json' => ['KTP & KK Asli', 'Alamat Tujuan Lengkap (RT/RW/Desa/Kec/Kab)', 'Surat Bebas Tanggungan RT'],
                'masa_berlaku_hari' => 30,
                'is_active' => true,
            ],
            [
                'kode_surat' => 'SKBN',
                'nama_surat' => 'Surat Keterangan Beda Nama (Ijazah / KTP / KK)',
                'format_nomor' => '470/{NO}/418.66.04/{TAHUN}',
                'template_body' => 'Menerangkan bahwa nama yang tercantum pada dokumen A dan dokumen B adalah benar satu orang yang sama.',
                'persyaratan_json' => ['KTP & KK Asli', 'Dokumen/Ijazah yang Beda Nama', 'Surat Pengantar RT'],
                'masa_berlaku_hari' => 60,
                'is_active' => true,
            ],
            [
                'kode_surat' => 'SKPH',
                'nama_surat' => 'Surat Keterangan Penghasilan Orang Tua / Wali',
                'format_nomor' => '401/{NO}/418.66.04/{TAHUN}',
                'template_body' => 'Menerangkan rata-rata penghasilan orang tua/wali per bulan untuk keperluan administrasi beasiswa/perkuliahan.',
                'persyaratan_json' => ['KTP Orang Tua', 'KK Asli', 'Rincian Penghasilan / Slip Usaha'],
                'masa_berlaku_hari' => 30,
                'is_active' => true,
            ],
            [
                'kode_surat' => 'SKAW',
                'nama_surat' => 'Surat Keterangan Ahli Waris',
                'format_nomor' => '470/{NO}/418.66.04/{TAHUN}',
                'template_body' => 'Menerangkan susunan ahli waris yang sah dari almarhum/almarhumah untuk keperluan pengurusan administrasi waris.',
                'persyaratan_json' => ['Surat Kematian Almarhum', 'Buku Nikah / Akta Cerai', 'KTP & KK Seluruh Ahli Waris', 'Pernyataan Ahli Waris Disaksikan RT/RW'],
                'masa_berlaku_hari' => 60,
                'is_active' => true,
            ],
            [
                'kode_surat' => 'SKIK',
                'nama_surat' => 'Surat Pengantar Izin Keramaian / Hajatan Warga',
                'format_nomor' => '300/{NO}/418.66.04/{TAHUN}',
                'template_body' => 'Menerangkan bahwa warga yang bersangkutan bermaksud menyelenggarakan acara/hajatan dan memohon rekomendasi izin keramaian.',
                'persyaratan_json' => ['KTP Tuan Rumah', 'Surat Persetujuan Tetangga Sekitar', 'Rekomendasi Ketua RT & RW'],
                'masa_berlaku_hari' => 14,
                'is_active' => true,
            ],
        ];

        $sktmType = null;
        foreach ($suratTypes as $st) {
            $created = SuratType::create($st);
            if ($st['kode_surat'] === 'SKTM') {
                $sktmType = $created;
            }
        }

        // 9. Sample Permohonan Surat & Tracking
        $hashSample = Str::random(32);
        $sampleReq = SuratRequest::create([
            'nomor_resi' => 'REQ-20260818-001',
            'warga_profile_id' => $wargaProfile1->id,
            'surat_type_id' => $sktmType->id,
            'nomor_surat_resmi' => '401/042/418.66.04/2026',
            'status' => 'completed',
            'keperluan' => 'Pengajuan Beasiswa Pendidikan Anak ke Dinas Sosial Kabupaten Kediri',
            'form_data_json' => [
                'nama_anak' => 'Rizky Pratama Utomo',
                'sekolah' => 'SMKN 1 Ngasem Kediri',
                'penghasilan_per_bulan' => 1200000,
            ],
            'qr_verification_hash' => $hashSample,
            'ttd_sekdes_at' => now()->subHours(2),
            'ttd_kades_at' => now()->subHour(),
        ]);

        SuratTracking::create([
            'surat_request_id' => $sampleReq->id,
            'actor_user_id' => $wargaUser1->id,
            'status_stage' => 'Warga',
            'status_action' => 'Diajukan',
            'catatan' => 'Permohonan surat diajukan online oleh warga',
            'created_at' => now()->subDays(2),
        ]);

        SuratTracking::create([
            'surat_request_id' => $sampleReq->id,
            'actor_user_id' => $rtUser->id,
            'status_stage' => 'RT 01',
            'status_action' => 'Disetujui',
            'catatan' => 'Data warga valid dan terdaftar di RT 01',
            'created_at' => now()->subDay(),
        ]);

        SuratTracking::create([
            'surat_request_id' => $sampleReq->id,
            'actor_user_id' => $rwUser->id,
            'status_stage' => 'RW 01',
            'status_action' => 'Disetujui',
            'catatan' => 'Verifikasi pengantar tingkat RW disetujui',
            'created_at' => now()->subHours(6),
        ]);

        SuratTracking::create([
            'surat_request_id' => $sampleReq->id,
            'actor_user_id' => $sekdesUser->id,
            'status_stage' => 'Sekretaris Desa',
            'status_action' => 'Ditandatangani',
            'catatan' => 'Nomor surat diterbitkan dan dilegalisasi stempel QR sah',
            'created_at' => now()->subHour(),
        ]);

        // 10. APBDes 2026 Data (Transparansi Keuangan Desa)
        $catPendapatan = ApbdesCategory::create(['jenis' => 'Pendapatan', 'kode_rekening' => '4.1', 'nama_kategori' => 'Pendapatan Transfer (Dana Desa & ADD)']);
        $catPADes = ApbdesCategory::create(['jenis' => 'Pendapatan', 'kode_rekening' => '4.2', 'nama_kategori' => 'Pendapatan Asli Desa (PADes)']);
        $catPembangunan = ApbdesCategory::create(['jenis' => 'Belanja', 'kode_rekening' => '5.2', 'nama_kategori' => 'Bidang Pelaksanaan Pembangunan Desa']);
        $catPemberdayaan = ApbdesCategory::create(['jenis' => 'Belanja', 'kode_rekening' => '5.4', 'nama_kategori' => 'Bidang Pemberdayaan Masyarakat']);

        ApbdesRecord::create([
            'category_id' => $catPendapatan->id,
            'tahun_anggaran' => 2026,
            'uraian' => 'Dana Desa (APBN) Tahap I & II Tahun 2026',
            'anggaran' => 985000000.00,
            'realisasi' => 590000000.00,
            'tanggal_realisasi' => '2026-06-15',
            'created_by_user_id' => $bendaharaDesaUser->id,
        ]);

        ApbdesRecord::create([
            'category_id' => $catPADes->id,
            'tahun_anggaran' => 2026,
            'uraian' => 'Hasil Pengelolaan Tanah Kas Desa (TKD) & BUMDes',
            'anggaran' => 125000000.00,
            'realisasi' => 85000000.00,
            'tanggal_realisasi' => '2026-07-20',
            'created_by_user_id' => $bendaharaDesaUser->id,
        ]);

        ApbdesRecord::create([
            'category_id' => $catPembangunan->id,
            'tahun_anggaran' => 2026,
            'uraian' => 'Pembangunan Saluran Irigasi Pertanian Dusun Doko (350 Meter)',
            'anggaran' => 175000000.00,
            'realisasi' => 172500000.00,
            'tanggal_realisasi' => '2026-05-10',
            'created_by_user_id' => $bendaharaDesaUser->id,
        ]);

        ApbdesRecord::create([
            'category_id' => $catPemberdayaan->id,
            'tahun_anggaran' => 2026,
            'uraian' => 'Pelatihan Digital Marketing & Bantuan Alat Kemasan UMKM Desa',
            'anggaran' => 60000000.00,
            'realisasi' => 45000000.00,
            'tanggal_realisasi' => '2026-07-05',
            'created_by_user_id' => $bendaharaDesaUser->id,
        ]);

        // 11. Kas RT 01
        $catIuranWarga = KasRtCategory::create(['rt_id' => $rt1->id, 'nama_kategori' => 'Iuran Sampah & Keamanan Bulanan', 'tipe' => 'Pemasukan']);
        $catPengeluaranLampu = KasRtCategory::create(['rt_id' => $rt1->id, 'nama_kategori' => 'Perawatan Fasilitas & Lampu Jalan', 'tipe' => 'Pengeluaran']);

        KasRtTransaction::create([
            'rt_id' => $rt1->id,
            'category_id' => $catIuranWarga->id,
            'warga_profile_id' => $wargaProfile1->id,
            'tanggal_transaksi' => '2026-08-01',
            'tipe' => 'Pemasukan',
            'jumlah' => 25000.00,
            'keterangan' => 'Iuran RT Bulan Agustus 2026 - KK Bambang Utomo',
            'created_by_user_id' => $bendaharaRtUser->id,
        ]);

        KasRtTransaction::create([
            'rt_id' => $rt1->id,
            'category_id' => $catPengeluaranLampu->id,
            'tanggal_transaksi' => '2026-08-10',
            'tipe' => 'Pengeluaran',
            'jumlah' => 150000.00,
            'keterangan' => 'Penggantian 3 unit bohlam LED PJU Gang Kenanga',
            'created_by_user_id' => $bendaharaRtUser->id,
        ]);

        // 12. Program Bansos & Penerima (PKH)
        $bansosPkh = BantuanSosial::create([
            'nama_bantuan' => 'Program Keluarga Harapan (PKH) Tahap III',
            'sumber_dana' => 'Kementerian Sosial RI',
            'tahun' => 2026,
            'tahap' => 'Tahap III (Juli - September)',
            'kuota_penerima' => 85,
            'nominal_per_penerima' => 750000.00,
            'tanggal_penyaluran' => '2026-08-25',
            'waktu_mulai' => '08:30:00',
            'lokasi_penyaluran' => 'Pendopo Balai Desa Doko',
            'deskripsi' => 'Bantuan sosial tunai bersyarat bagi keluarga pra-sejahtera komponen pendidikan dan kesehatan.',
            'status' => 'published',
            'published_at' => now(),
            'created_by_user_id' => $sekdesUser->id,
        ]);

        $bantuanPenerima1 = BantuanPenerima::create([
            'bantuan_sosial_id' => $bansosPkh->id,
            'warga_profile_id' => $wargaProfile1->id,
            'kk_id' => $kk1->id,
            'nomor_antrean' => 'A-014',
            'qr_bantuan_code' => 'PKH2026-3506041505840001',
            'status_penyaluran' => 'Siap Diambil',
        ]);

        // 13. Log Notifikasi WhatsApp Broadcast
        NotifikasiLog::create([
            'user_id' => $wargaUser1->id,
            'warga_profile_id' => $wargaProfile1->id,
            'nomor_tujuan' => '085712345678',
            'jenis_notifikasi' => 'BANSOS_CAIR',
            'judul' => 'Pemberitahuan Pencairan PKH Tahap III 2026',
            'pesan' => 'Yth. Bpk/Ibu Bambang Utomo, Bantuan PKH Tahap III Tahun 2026 sebesar Rp 750.000 telah siap disalurkan. Jadwal: Selasa, 25 Agustus 2026 Pukul 08.30 WIB di Pendopo Balai Desa Doko. Tunjukkan QR Bantuan Anda.',
            'status_pengiriman' => 'TERKIRIM',
        ]);

        // 14. Berita & Pengumuman
        Berita::create([
            'judul' => 'Desa Doko Ngasem Luncurkan Sistem Pelayanan Publik Digital Terpadu SIDes',
            'slug' => 'desa-doko-luncurkan-sistem-pelayanan-publik-digital-sides',
            'kategori' => 'Pemerintahan',
            'ringkasan' => 'Sebagai upaya meningkatkan efisiensi dan transparansi, Pemerintah Desa Doko resmi mengadopsi platform digital desa terintegrasi dari tingkat RT hingga Kantor Desa.',
            'konten' => 'Pemerintah Desa Doko, Kecamatan Ngasem, Kabupaten Kediri melakukan inovasi pelayanan birokrasi masyarakat berbasis digital. Melalui platform SIDes (Sistem Informasi Desa Terpadu), warga tidak lagi perlu bolak-balik fisik membawa berkas kertas...',
            'view_count' => 342,
            'is_published' => true,
            'published_at' => now()->subDays(3),
            'author_id' => $sekdesUser->id,
        ]);

        Pengumuman::create([
            'judul' => 'Jadwal Layanan Posyandu Balita & Pemeriksaan Lansia Gratis',
            'isi' => 'Diberitahukan kepada seluruh warga RT 01 & RT 02 RW 01 Dusun Doko Krajan bahwa Posyandu Cempaka akan dilaksanakan pada hari Sabtu, 22 Agustus 2026 di Balai RT 01 mulai pukul 08.00 WIB.',
            'level_target' => 'RW',
            'target_id' => $rw1->id,
            'tanggal_mulai' => '2026-08-18',
            'tanggal_selesai' => '2026-08-22',
            'is_active' => true,
            'created_by_user_id' => $sekdesUser->id,
        ]);
    }
}
