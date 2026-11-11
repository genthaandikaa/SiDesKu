<?php

namespace Database\Seeders;

use App\Models\Loker;
use App\Models\LamaranLoker;
use App\Models\JobSeekerProfile;
use Illuminate\Database\Seeder;

class LokerSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Lowongan Kerja Resmi
        $lokers = [
            [
                'id' => 'loker-1',
                'posisi' => 'Staf Administrasi & Pendataan Warga',
                'perusahaan' => 'PT Solusi Distribusi Kota',
                'kode_reg' => null,
                'nib' => null,
                'company_logo_text' => 'SD',
                'mitra_status' => 'Mitra Resmi Terverifikasi',
                'tag_verifikasi' => null,
                'kategori' => 'Administrasi',
                'tipe_kerja' => 'Penuh Waktu (Full-time)',
                'lokasi' => 'Kecamatan Pusat',
                'distance_text' => '1.2 km dari Anda',
                'lat' => -7.8166,
                'lng' => 112.0118,
                'gaji_label' => 'Estimasi Gaji',
                'gaji_min' => 4900000,
                'gaji_max' => 5500000,
                'gaji_subtext' => null,
                'pendidikan' => 'Min. SMK / D3 / S1',
                'pengalaman' => 'Fresh Graduate / 1 tahun',
                'syarat_cv' => true,
                'syarat_dokumen' => [
                    'Curriculum Vitae (CV / Resume)',
                    'Ijazah & Transkrip Nilai',
                    'KTP / Identitas Kependudukan'
                ],
                'ringkasan' => 'Pendidikan min. SMK/D3, mahir spreadsheet dan aplikasi kantor, teliti dalam pengarsipan berkas. Penempatan kantor operasional cabang pusat kota.',
                'tags' => ['Spreadsheet', 'Arsip Digital', 'BPJS Ketenagakerjaan'],
                'waktu_kerja' => "Senin - Jumat\n08.30 - 17.00 WIB",
                'level_pekerjaan' => "Entry Level / Staf\nFresh graduate dipersilakan",
                'fasilitas_utama' => "BPJS Lengkap\nTunjangan Makan & Transportasi",
                'bidang' => 'Logistik & Distribusi',
                'alamat_kantor' => 'Kawasan Niaga C-12, Kec. Pusat Kota',
                'batas_pengajuan' => '31 Maret 2025',
                'kuota_kebutuhan' => '2 Orang',
                'waktu_proses' => '3 - 5 hari kerja',
                'deskripsi_detail' => 'Staf Administrasi & Pendataan Warga bertanggung jawab mengawal keakuratan data pelayanan publik dan alur logistik operasional harian kantor distribusi kawasan terpadu bersama tim koordinator wilayah.',
                'deskripsi' => [
                    'Mengelola administrasi operasional harian dan pengarsipan digital berkas kependudukan kawasan melalui platform SiDesKu.',
                    'Melakukan pendataan inventaris logistik, rekonsiliasi data rutin, dan pelaporan stok berkala.',
                    'Berkoordinasi dengan koordinator wilayah dan staf lapangan untuk verifikasi dokumen tanda terima.',
                    'Menyusun laporan administrasi mingguan dan bulanan secara terstruktur dan rapi.'
                ],
                'tanggung_jawab' => [
                    'Mengelola administrasi operasional harian dan pengarsipan digital berkas kependudukan kawasan melalui platform SiDesKu.',
                    'Melakukan pendataan inventaris logistik, rekonsiliasi data rutin, dan pelaporan stok berkala.',
                    'Berkoordinasi dengan koordinator wilayah dan staf lapangan untuk verifikasi dokumen tanda terima.',
                    'Menyusun laporan administrasi mingguan dan bulanan secara terstruktur dan rapi.'
                ],
                'persyaratan' => [
                    'Pendidikan minimal SMK / D3 / S1 semua jurusan (terbuka untuk Fresh Graduate).',
                    'Memiliki ketelitian tinggi dalam penginputan data dan pengoperasian spreadsheet (Excel / Google Sheets).',
                    'Mampu berkomunikasi dengan ramah, sopan, dan jelas secara lisan maupun tertulis.',
                    'Berdomisili di wilayah Kecamatan Pusat atau bersedia bertugas di lokasi kantor (WFO).'
                ],
                'benefits' => [
                    ['title' => 'Gaji Pokok Kompetitif', 'desc' => 'Sesuai standar UMK kota dengan transparansi PPh.', 'icon' => 'money'],
                    ['title' => 'Jaminan Sosial Lengkap', 'desc' => 'BPJS Kesehatan & BPJS Ketenagakerjaan aktif.', 'icon' => 'shield'],
                    ['title' => 'Tunjangan Operasional', 'desc' => 'Tunjangan transportasi harian & uang makan.', 'icon' => 'transport'],
                    ['title' => 'Pengembangan Karir', 'desc' => 'Jenjang karir jelas & pelatihan digital bersertifikasi.', 'icon' => 'growth']
                ],
                'wa_hrd' => '081234567810',
                'email_hrd' => 'karir@distribusikota.co.id',
                'disnaker_verified' => true,
                'tanggal_posting' => 'Pembaruan Real-Time',
                'jumlah_pelamar' => 42,
                'is_active' => true,
            ],
            [
                'id' => 'loker-2',
                'posisi' => 'Teknisi Servis & Maintenance AC',
                'perusahaan' => 'Paguyuban Teknisi Mandiri Sejahtera',
                'company_logo_text' => 'PT',
                'mitra_status' => 'Mitra Komunitas Kota',
                'tag_verifikasi' => null,
                'kategori' => 'Teknik & Bengkel',
                'tipe_kerja' => 'Jasa Mandiri / Freelance',
                'is_jasa_mitra' => true,
                'lokasi' => 'Kecamatan Sukamaju',
                'distance_text' => '800 m dari Anda',
                'lat' => -7.8185,
                'lng' => 112.0142,
                'gaji_label' => 'Estimasi Biaya Jasa',
                'gaji_min' => 75000,
                'gaji_max' => 150000,
                'gaji_subtext' => null,
                'pendidikan' => 'SMK Teknik Pendingin / Pengalaman 1 th',
                'pengalaman' => 'Minimal 1 tahun atau punya alat dasar',
                'syarat_cv' => false,
                'syarat_dokumen' => [
                    'KTP / Identitas Kependudukan',
                    'Sertifikat Keahlian / Pelatihan',
                    'Surat Pengalaman Kerja / Paklaring'
                ],
                'ringkasan' => 'Pengalaman min. 1 tahun, memiliki alat servis dasar mandiri. Sistem bagi hasil transparan langsung cair per panggilan servis rumah tinggal atau ruko warga.',
                'tags' => ['Cuci AC', 'Isi Freon', 'Jadwal Bebas'],
                'waktu_kerja' => 'Fleksibel / Sesuai Panggilan Warga',
                'level_pekerjaan' => 'Teknisi Mandiri / Freelance',
                'fasilitas_utama' => 'Asuransi Kerja & Toolkit Pendukung',
                'bidang' => 'Jasa Perbaikan & Pendingin Udara',
                'alamat_kantor' => 'Pusat Kemitraan Komunitas, Kec. Sukamaju',
                'batas_pengajuan' => 'Terbuka Sepanjang Tahun',
                'kuota_kebutuhan' => '5 Orang',
                'waktu_proses' => '1 - 2 hari kerja',
                'deskripsi_detail' => 'Program kemitraan mandiri bersama Paguyuban Teknisi untuk mempertemukan teknisi bersertifikasi dengan warga perumahan yang membutuhkan servis AC cepat dan terstandar.',
                'deskripsi' => [
                    'Menerima order panggilan servis cuci dan perawatan AC warga sekitar melalui aplikasi.',
                    'Melakukan pengecekan tekanan freon, pembersihan evaporator, dan pipa drainase.',
                    'Menjaga etika kerja profesional, kerapihan, dan transparansi biaya servis kepada warga pemesan.'
                ],
                'tanggung_jawab' => [
                    'Menerima order panggilan servis cuci dan perawatan AC warga sekitar melalui aplikasi.',
                    'Melakukan pengecekan tekanan freon, pembersihan evaporator, dan pipa drainase.',
                    'Menjaga etika kerja profesional, kerapihan, dan transparansi biaya servis kepada warga pemesan.'
                ],
                'persyaratan' => [
                    'Memiliki keahlian teknik servis AC split (minimal cuci dan isi freon).',
                    'Memiliki alat kerja sendiri (pompa cuci jet cleaner / manifold gauge).',
                    'Jujur, ramah, dan bersedia mengikuti SOP pelayanan warga.'
                ],
                'benefits' => [
                    ['title' => 'Penghasilan Langsung Cair', 'desc' => 'Bagi hasil transparan langsung masuk dompet digital setiap pekerjaan selesai.', 'icon' => 'money'],
                    ['title' => 'Radius Panggilan Terdekat', 'desc' => 'Sistem memprioritaskan order di sekitar tempat tinggal mitra.', 'icon' => 'transport'],
                    ['title' => 'Keahlian & Pelatihan', 'desc' => 'Dukungan pelatihan berkala dari mitra industri.', 'icon' => 'growth'],
                    ['title' => 'Perlindungan Komunitas', 'desc' => 'Didukung paguyuban resmi dan perlindungan keselamatan kerja.', 'icon' => 'shield']
                ],
                'wa_hrd' => '081234567812',
                'disnaker_verified' => false,
                'tanggal_posting' => 'Hari ini',
                'jumlah_pelamar' => 18,
                'is_active' => true,
            ],
            [
                'id' => 'loker-3',
                'posisi' => 'Barista & Operasional Kedai Kopi',
                'perusahaan' => 'Kopi Seduh Mandiri',
                'company_logo_text' => 'KS',
                'mitra_status' => 'Usaha Mikro Binaan Kota',
                'tag_verifikasi' => null,
                'kategori' => 'F&B / Kuliner',
                'tipe_kerja' => 'Shift Fleksibel',
                'lokasi' => 'Jl. Kaliurang',
                'distance_text' => '2.4 km dari Anda',
                'lat' => -7.825,
                'lng' => 112.025,
                'gaji_label' => 'Estimasi Gaji',
                'gaji_min' => 3200000,
                'gaji_max' => 4000000,
                'gaji_subtext' => null,
                'pendidikan' => 'SMA / SMK Sederajat',
                'pengalaman' => 'Terbuka untuk pemula yang ingin belajar',
                'syarat_cv' => true,
                'syarat_dokumen' => [
                    'Curriculum Vitae (CV / Resume)',
                    'KTP / Identitas Kependudukan'
                ],
                'ringkasan' => 'Ramah, komunikatif, bersedia bekerja dalam tim shift. Disediakan pelatihan espresso brewing dasar dan sistem kasir digital POS.',
                'tags' => ['Espresso Machine', 'Pelayanan Tamu', '+ Uang Makan'],
                'waktu_kerja' => 'Shift Pagi / Sore (6-8 Jam/Hari)',
                'level_pekerjaan' => 'Kru Bar & Kasir (Pemula Welcome)',
                'fasilitas_utama' => 'Makan Harian & Tips Komisi',
                'bidang' => 'Food & Beverage / Coffee Shop',
                'alamat_kantor' => 'Jl. Kaliurang No. 42, Kediri',
                'batas_pengajuan' => '15 April 2025',
                'kuota_kebutuhan' => '3 Orang',
                'waktu_proses' => '2 - 3 hari kerja',
                'deskripsi_detail' => 'Kedai Kopi Seduh Mandiri membuka peluang kerja ramah warga bagi pemuda lokal yang antusias mempelajari dunia hospitality kopi dan pelayanan barista profesional.',
                'deskripsi' => [
                    'Menyeduh minuman kopi espresso based, manual brew, serta varian teh kekinian.',
                    'Melayani pesanan pelanggan dengan ramah serta mengoperasikan sistem kasir POS.',
                    'Menjaga kebersihan dan sanitasi bar, peralatan racik, dan area meja tamu.'
                ],
                'tanggung_jawab' => [
                    'Menyeduh minuman kopi espresso based, manual brew, serta varian teh kekinian.',
                    'Melayani pesanan pelanggan dengan ramah serta mengoperasikan sistem kasir POS.',
                    'Menjaga kebersihan dan sanitasi bar, peralatan racik, dan area meja tamu.'
                ],
                'persyaratan' => [
                    'Usia min. 18 tahun, ramah, berpenampilan rapi, dan komunikatif.',
                    'Terbuka untuk mahasiswa tingkat akhir atau fresh graduate SMA/SMK.',
                    'Disiplin waktu dan sanggup bekerja secara tim.'
                ],
                'benefits' => [
                    ['title' => 'Pelatihan Barista Gratis', 'desc' => 'Dimentori barista profesional hingga mahir kalibrasi rasa espresso.', 'icon' => 'growth'],
                    ['title' => 'Uang Makan Harian', 'desc' => 'Mendapatkan jatah makan harian dan jatah kopi seduh gratis.', 'icon' => 'transport'],
                    ['title' => 'Bonus Penjualan', 'desc' => 'Insentif pencapaian target penjualan bulanan kedai.', 'icon' => 'money'],
                    ['title' => 'Jadwal Shift Fleksibel', 'desc' => 'Bisa menyesuaikan jam kuliah atau aktivitas keluarga.', 'icon' => 'shield']
                ],
                'wa_hrd' => '081234567811',
                'disnaker_verified' => false,
                'tanggal_posting' => '2 hari lalu',
                'jumlah_pelamar' => 29,
                'is_active' => true,
            ],
            [
                'id' => 'loker-4',
                'posisi' => 'Staf Gudang & Penataan Logistik',
                'perusahaan' => 'Pusat Distribusi Sembako Warga',
                'company_logo_text' => 'PD',
                'mitra_status' => 'BUMD Partner',
                'tag_verifikasi' => null,
                'kategori' => 'Perdagangan & Retail',
                'tipe_kerja' => 'Penuh Waktu',
                'lokasi' => 'Kawasan Industri Timur',
                'distance_text' => '4.1 km dari Anda',
                'lat' => -7.8105,
                'lng' => 112.0054,
                'gaji_label' => 'Estimasi Gaji',
                'gaji_min' => 5100000,
                'gaji_max' => 5800000,
                'gaji_subtext' => null,
                'pendidikan' => 'SMA / SMK Sederajat',
                'pengalaman' => 'Fresh Graduate / Pengalaman 1 th',
                'syarat_cv' => true,
                'syarat_dokumen' => [
                    'Curriculum Vitae (CV / Resume)',
                    'Ijazah & Transkrip Nilai',
                    'KTP / Identitas Kependudukan'
                ],
                'ringkasan' => 'Fisik sehat dan disiplin, bertanggung jawab dalam pencatatan stok opname berkala, pemilahan barang masuk, serta pengepakan muatan armada harian.',
                'tags' => ['Stok Opname', 'Handling Barang', 'Insentif Kehadiran'],
                'waktu_kerja' => "Senin - Sabtu\n07.00 - 15.30 WIB",
                'level_pekerjaan' => 'Staf Logistik & Gudang',
                'fasilitas_utama' => 'BPJS Ketenagakerjaan & Asuransi',
                'bidang' => 'Logistik & Pangan Daerah',
                'alamat_kantor' => 'Gudang Logistik Blok B, Kawasan Industri',
                'batas_pengajuan' => '20 April 2025',
                'kuota_kebutuhan' => '4 Orang',
                'waktu_proses' => '3 - 5 hari kerja',
                'deskripsi_detail' => 'Unit BUMD Pengadaan Komoditas Pangan Daerah mengundang putra-putri daerah untuk bergabung dalam divisi pergudangan guna menjaga rantai pasok sembako tetap stabil di seluruh kecamatan.',
                'deskripsi' => [
                    'Melakukan penerimaan barang masuk dari suplier dan mencocokkan surat jalan.',
                    'Menata komoditas pangan di rak pallet gudang sesuai standar FIFO.',
                    'Melakukan scan barcode packing pesanan pasar rakyat dan memuat ke armada pengantar.'
                ],
                'tanggung_jawab' => [
                    'Melakukan penerimaan barang masuk dari suplier dan mencocokkan surat jalan.',
                    'Menata komoditas pangan di rak pallet gudang sesuai standar FIFO.',
                    'Melakukan scan barcode packing pesanan pasar rakyat dan memuat ke armada pengantar.'
                ],
                'persyaratan' => [
                    'Pria/Wanita sehat jasmani dan rohani, sanggup beraktivitas fisik di gudang.',
                    'Disiplin, teliti, dan bertanggung jawab terhadap keutuhan barang inventaris.',
                    'Memahami dasar penggunaan scanner barcode atau aplikasi inventory menjadi nilai plus.'
                ],
                'benefits' => [
                    ['title' => 'Gaji di Atas UMK', 'desc' => 'Standar gaji BUMD transparan dengan jaminan kepastian kontrak kerja.', 'icon' => 'money'],
                    ['title' => 'BPJS TK & Kesehatan Lengkap', 'desc' => 'Perlindungan penuh sejak hari pertama kerja.', 'icon' => 'shield'],
                    ['title' => 'Insentif Kehadiran & Lembur', 'desc' => 'Kompensasi lembur sesuai ketentuan regulasi Kemenaker.', 'icon' => 'growth'],
                    ['title' => 'Seragam & APD Kerja', 'desc' => 'Disediakan rompi, sepatu safety, dan perlengkapan gudang tanpa dipungut biaya.', 'icon' => 'transport']
                ],
                'wa_hrd' => '081234567813',
                'disnaker_verified' => true,
                'tanggal_posting' => '3 hari lalu',
                'jumlah_pelamar' => 35,
                'is_active' => true,
            ]
        ];

        foreach ($lokers as $lokerData) {
            Loker::updateOrCreate(
                ['id' => $lokerData['id']],
                $lokerData
            );
        }

        // 2. Seed Default Citizen Seeker Profile (Budi Pratama - Stitch Screen 1)
        JobSeekerProfile::updateOrCreate(
            ['nama' => 'Budi Pratama'],
            [
                'nik' => '3204•••• •••• 1002',
                'domisili' => 'RW 04, Desa Mekar Mukti',
                'status_kerja' => 'Siap Bekerja (Open to Work)',
                'terakhir_update' => 'Diperbarui 2 hari lalu',
                'email' => 'budi.pratama@warga.sidesku.id',
                'telepon' => '0812-8921-7740',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                'cv_utama' => [
                    'name' => 'CV_Budi_Pratama_Terbaru.pdf',
                    'size' => '1.4 MB',
                    'lastUpdated' => '14 Mei 2025',
                    'atsPassed' => true
                ],
                'berkas_pendukung' => [
                    [
                        'id' => 'bp-1',
                        'judul' => 'Sertifikat Keahlian Administrasi',
                        'status' => 'Valid',
                        'subjudul' => 'Terbit 2024 • PDF (840 KB)',
                        'noReg' => 'No. SK-9018',
                        'icon' => 'award'
                    ],
                    [
                        'id' => 'bp-2',
                        'judul' => 'Ijazah & Transkrip Nilai',
                        'status' => 'Terverifikasi',
                        'subjudul' => 'SMK Negeri 1 (Manajemen Bisnis)',
                        'noReg' => 'Nilai: 88.5 / 100',
                        'icon' => 'graduation'
                    ],
                    [
                        'id' => 'bp-3',
                        'judul' => 'Pelatihan Excel Korporat',
                        'status' => 'Valid',
                        'subjudul' => 'Pusat Pelatihan Kerja • 40 Jam Sesi',
                        'noReg' => 'Sertifikat: PK-2023',
                        'icon' => 'ribbon'
                    ]
                ],
                'keahlian' => [
                    'Administrasi Perkantoran',
                    'Microsoft Excel / Sheets',
                    'Manajemen Arsip',
                    'Bahasa Inggris Dasar'
                ],
                'preferensi' => [
                    'area' => 'Kecamatan Pusat / Sukamaju',
                    'radius' => 'Radius maksimal 15 km dari domisili',
                    'gaji' => '4.8 jt / bulan',
                    'gajiSub' => 'Sesuai kualifikasi & penempatan',
                    'tipe' => 'Penuh Waktu (Full-time)',
                    'tipeSub' => 'Tersedia untuk sistem kontrak PKWT / tetap'
                ]
            ]
        );

        // 3. Seed Existing Applications (Stitch Screen 1 History)
        $lamarans = [
            [
                'id' => 'lamaran-1',
                'loker_id' => 'loker-1',
                'loker_posisi' => 'Staf Administrasi Operasional',
                'loker_perusahaan' => 'PT Solusi Distribusi Kota',
                'pelamar_nama' => 'Budi Pratama',
                'pelamar_nik' => '3204************',
                'pelamar_email' => 'budi.pratama@warga.sidesku.id',
                'pelamar_wa' => '0812-8921-7740',
                'cv_file_name' => 'CV_Budi_Pratama_Terbaru.pdf',
                'portofolio_file_name' => 'Portofolio_Administrasi_Budi.pdf',
                'status' => 'Berkas Diterima HR - Wawancara Dijadwalkan',
                'substatus_text' => 'Undangan via WhatsApp & Email',
                'tanggal_lamar' => '10 Mei 2025',
                'icon_type' => 'building'
            ],
            [
                'id' => 'lamaran-2',
                'loker_id' => 'loker-3',
                'loker_posisi' => 'Barista & Kasir Front-Office',
                'loker_perusahaan' => 'Koperasi Seduh Mandiri',
                'pelamar_nama' => 'Budi Pratama',
                'pelamar_nik' => '3204************',
                'pelamar_email' => 'budi.pratama@warga.sidesku.id',
                'pelamar_wa' => '0812-8921-7740',
                'cv_file_name' => 'CV_Budi_Pratama_Terbaru.pdf',
                'status' => 'Selesai Seleksi',
                'substatus_text' => 'Status Final Tersimpan',
                'tanggal_lamar' => '28 April 2025',
                'icon_type' => 'coffee'
            ]
        ];

        foreach ($lamarans as $lamaranData) {
            LamaranLoker::updateOrCreate(
                ['id' => $lamaranData['id']],
                $lamaranData
            );
        }
    }
}
