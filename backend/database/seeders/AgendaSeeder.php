<?php

namespace Database\Seeders;

use App\Models\Agenda;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class AgendaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $agendas = [
            [
                'desa_id' => 1,
                'judul' => 'nobar',
                'tipe' => 'Sosial',
                'peserta' => 'Semuanya',
                'tanggal' => Carbon::now()->format('Y-m-d'),
                'waktu' => Carbon::now()->isoFormat('dddd, D MMMM Y') . ' • 21:30 WIB',
                'tempat' => 'Pendopo Balai Desa Doko',
                'is_custom' => true,
            ],
            [
                'desa_id' => 1,
                'judul' => 'Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes)',
                'tipe' => 'Pemerintahan',
                'peserta' => 'BPD, LPMD, Tokoh Masyarakat, Ketua RT/RW',
                'tanggal' => '2026-08-27',
                'waktu' => 'Rabu, 27 Agustus 2026 • 19.30 WIB',
                'tempat' => 'Pendopo Balai Desa Doko',
                'is_custom' => false,
            ],
            [
                'desa_id' => 1,
                'judul' => 'Posyandu Balita & Lansia Terpadu Dusun Krajan',
                'tipe' => 'Kesehatan',
                'peserta' => 'Ibu Hamil, Balita, & Lansia RT 01 - RT 04',
                'tanggal' => '2026-08-29',
                'waktu' => 'Jumat, 29 Agustus 2026 • 08.30 WIB',
                'tempat' => 'Posyandu Melati RT 01',
                'is_custom' => false,
            ],
            [
                'desa_id' => 1,
                'judul' => 'Penyaluran BLT Dana Desa Periode Agustus',
                'tipe' => 'Sosial',
                'peserta' => 'Warga Penerima Manfaat BLT-DD',
                'tanggal' => '2026-08-31',
                'waktu' => 'Senin, 31 Agustus 2026 • 08.00 WIB',
                'tempat' => 'Ruang Pelayanan Kantor Desa',
                'is_custom' => false,
            ],
            [
                'desa_id' => 1,
                'judul' => 'Penyaluran Bantuan Pangan Beras & PKH Tahap III',
                'tipe' => 'Sosial',
                'peserta' => 'Keluarga Penerima Manfaat (KPM) Terdaftar',
                'tanggal' => '2026-08-31',
                'waktu' => 'Senin, 31 Agustus 2026 • 08.00 WIB',
                'tempat' => 'Pendopo Balai Desa Doko',
                'is_custom' => false,
            ],
            [
                'desa_id' => 1,
                'judul' => 'Rapat Koordinasi Pengurus Wilayah RW 01',
                'tipe' => 'Keamanan',
                'peserta' => 'Ketua RT 01 s/d RT 06 & Tokoh Masyarakat',
                'tanggal' => '2026-09-01',
                'waktu' => 'Setiap Malam • 22.00 - 04.00 WIB',
                'tempat' => 'Balai Warga RW 01',
                'is_custom' => false,
            ],
        ];

        foreach ($agendas as $agenda) {
            Agenda::updateOrCreate(
                [
                    'desa_id' => $agenda['desa_id'],
                    'judul' => $agenda['judul'],
                ],
                $agenda
            );
        }
    }
}

