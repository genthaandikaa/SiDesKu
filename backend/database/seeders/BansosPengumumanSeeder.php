<?php

namespace Database\Seeders;

use App\Models\BantuanPenerima;
use App\Models\BantuanSosial;
use App\Models\Pengumuman;
use App\Models\User;
use App\Models\WargaProfile;
use Illuminate\Database\Seeder;

class BansosPengumumanSeeder extends Seeder
{
    public function run(): void
    {
        $sekdes = User::where('username', 'sekdes')->first() ?? User::first();
        $warga1 = WargaProfile::find(1);

        // 1. Program Bantuan Pangan Beras (CBP) 2026 - Perum BULOG
        $bulog = BantuanSosial::updateOrCreate(
            ['nama_bantuan' => 'Bantuan Pangan Beras (CBP) 2026 - Perum BULOG'],
            [
                'sumber_dana' => 'Badan Pangan Nasional & Perum BULOG',
                'tahun' => 2026,
                'tahap' => 'Periode Juli - September 2026',
                'kuota_penerima' => 120,
                'nominal_per_penerima' => 0,
                'tanggal_penyaluran' => '2026-08-18',
                'waktu_mulai' => '08:30:00',
                'lokasi_penyaluran' => 'Pendopo Balai Desa Doko',
                'deskripsi' => 'Penyaluran Cadangan Beras Pemerintah (CBP) seberat 30 (tiga puluh) Kg Beras alokasi bulan Juli sampai dengan September 2026 bagi KPM terdaftar.',
                'status' => 'published',
                'published_at' => '2026-08-13 08:00:00',
                'created_by_user_id' => $sekdes ? $sekdes->id : null,
            ]
        );

        // 2. Tambah Penerima Tiket Resmi untuk Bambang Utomo (Warga 1)
        if ($warga1) {
            BantuanPenerima::updateOrCreate(
                ['bantuan_sosial_id' => $bulog->id, 'warga_profile_id' => $warga1->id],
                [
                    'kk_id' => $warga1->kk_id,
                    'nomor_antrean' => '1340',
                    'qr_bantuan_code' => '350606200801340',
                    'status_penyaluran' => 'Siap Diambil',
                    'catatan' => 'Alokasi 30 Kg Beras CBP 2026 - No. Undangan UND/18/08/26/115001',
                ]
            );
        }

        // 3. Pengumuman Resmi Desa
        Pengumuman::updateOrCreate(
            ['judul' => 'Penyaluran Bantuan Pangan Beras & PKH Tahap III Tahun 2026'],
            [
                'kategori' => 'Bansos',
                'oleh' => 'Pemerintah Desa Doko & Perum BULOG',
                'status_label' => 'Penting',
                'bantuan_sosial_id' => $bulog->id,
                'isi' => 'Diberitahukan kepada seluruh KPM penerima bantuan pangan beras alokasi Juli - September 2026 agar hadir di Pendopo Balai Desa Doko sesuai sesi antrean masing-masing dengan membawa surat undangan resmi ini, KTP asli/IKD, dan Kartu Keluarga (KK).',
                'level_target' => 'Semua',
                'tanggal_mulai' => '2026-08-13',
                'tanggal_selesai' => '2026-08-25',
                'is_active' => true,
                'created_by_user_id' => $sekdes ? $sekdes->id : null,
            ]
        );

        Pengumuman::updateOrCreate(
            ['judul' => 'Kerja Bakti Lingkungan & Pembersihan Saluran Air Musim Hujan'],
            [
                'kategori' => 'Lingkungan',
                'oleh' => 'Ketua RW 01',
                'status_label' => 'Umum',
                'bantuan_sosial_id' => null,
                'isi' => 'Seluruh warga RT 01 dan RT 02 diimbau bergotong royong membersihkan selokan lingkungan demi mencegah genangan air.',
                'level_target' => 'RW',
                'target_id' => 1,
                'tanggal_mulai' => '2026-08-20',
                'tanggal_selesai' => '2026-08-22',
                'is_active' => true,
                'created_by_user_id' => $sekdes ? $sekdes->id : null,
            ]
        );

        Pengumuman::updateOrCreate(
            ['judul' => 'Pelayanan Rekam KTP-El Keliling Dispendukcapil di Balai Desa'],
            [
                'kategori' => 'Layanan',
                'oleh' => 'Sekretariat Desa Doko',
                'status_label' => 'Resmi',
                'bantuan_sosial_id' => null,
                'isi' => 'Bagi warga berusia 17 tahun atau yang belum memiliki KTP elektronik, layanan rekam biometrik dibuka pukul 08.30 - 14.00 WIB.',
                'level_target' => 'Semua',
                'tanggal_mulai' => '2026-08-16',
                'tanggal_selesai' => '2026-08-18',
                'is_active' => true,
                'created_by_user_id' => $sekdes ? $sekdes->id : null,
            ]
        );
    }
}
