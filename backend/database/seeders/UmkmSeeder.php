<?php

namespace Database\Seeders;

use App\Models\Umkm;
use App\Models\UmkmReview;
use Illuminate\Database\Seeder;

class UmkmSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'id' => 'umkm-1',
                'desa_id' => 1,
                'nama' => 'Paket Nasi Liwet Komplit Ayam Goreng Rempah',
                'toko_nama' => 'Warung Bu Dewi Sukamaju',
                'kelurahan' => 'Kel. Sukamaju',
                'rt_rw' => 'RT 03 / RW 04',
                'kategori' => 'Kuliner & Kudapan',
                'badge_tag' => 'SIAP ANTAR (COD)',
                'harga' => 28000,
                'satuan' => 'Porsi Kenyang',
                'deskripsi' => 'Nasi liwet beras rojolele petani binaan dengan ayam goreng rempah kuning, tahu tempe bacem, lalapan segar, dan sambal khas Sunda-Jawa.',
                'foto_url' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
                'galeri' => [
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
                ],
                'alamat' => 'Jl. Kaliurang Gg. Mawar No. 4, RT 03 / RW 04, Kel. Sukamaju',
                'lat' => -7.8185,
                'lng' => 112.0135,
                'wa_kontak' => '6281234567801',
                'qris_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570014ID.LINKAJA.WWW01189360091100213192025204581253033605802ID5918WARUNG_BU_DEWI6006KEDIRI62070703A016304E1F2',
                'qris_nama' => 'QRIS WARUNG BU DEWI',
                'qris_nmid' => 'ID10293847281',
                'metode_pembayaran' => [
                    'qris' => true,
                    'cod' => true,
                    'do' => true,
                    'transfer' => true
                ],
                'status_toko' => 'Buka',
                'rating' => 4.9,
                'reviews_count' => 42,
                'terjual_text' => '120+ terjual • Buka Hari Ini',
                'terjual' => 120,
                'buka_jam_text' => 'Buka Hari Ini (08.00 - 20.00)',
                'is_jasa' => false,
                'pilihan_ayam' => [
                    ['id' => 'paha', 'nama' => 'Paha Rempah', 'hargaTambahan' => 0],
                    ['id' => 'dada', 'nama' => 'Dada Rempah', 'hargaTambahan' => 0],
                    ['id' => 'kampung', 'nama' => 'Ayam Kampung', 'hargaTambahan' => 7000]
                ],
                'pilihan_sambal' => [
                    ['id' => 'terasi', 'nama' => 'Sambal Terasi Segar'],
                    ['id' => 'korek', 'nama' => 'Bawang Korek 🔥'],
                    ['id' => 'tomat', 'nama' => 'Tomat Manis']
                ],
                'keterangan_halal' => 'ID02170000189231',
                'keterangan_higienis' => 'Lolos Uji Puskesmas Sukamaju',
            ],
            [
                'id' => 'umkm-2',
                'desa_id' => 1,
                'nama' => 'Beras Premium Rojolele Wangi 5 Kg',
                'toko_nama' => 'Toko Kelontong Barokah RT 03',
                'kelurahan' => 'RT 03 / RW 01',
                'rt_rw' => 'RT 03 / RW 01',
                'kategori' => 'Bahan Pokok & Sembako',
                'badge_tag' => 'KEBUTUHAN POKOK',
                'harga' => 74500,
                'satuan' => 'Netto 5 Kg',
                'deskripsi' => 'Beras pulen hasil panen langsung dari gabungan kelompok tani binaan kelurahan, tanpa pemutih dan tanpa pengawet.',
                'foto_url' => 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
                'galeri' => ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'],
                'alamat' => 'Pos Ronda Barat RT 03, Kel. Sukamaju',
                'lat' => -7.8140,
                'lng' => 112.0190,
                'wa_kontak' => '6281234567802',
                'qris_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570014ID.LINKAJA.WWW01189360091100213192025204581253033605802ID5918TOKO_BAROKAH6006KEDIRI62070703A016304E1F2',
                'qris_nama' => 'QRIS KELONTONG BAROKAH',
                'qris_nmid' => 'ID10293847282',
                'metode_pembayaran' => [
                    'qris' => true,
                    'cod' => true,
                    'do' => true,
                    'transfer' => true
                ],
                'status_toko' => 'Buka',
                'rating' => 4.8,
                'reviews_count' => 18,
                'terjual_text' => '65+ terjual • Stok Banyak',
                'terjual' => 65,
                'buka_jam_text' => 'Stok Banyak Ready',
                'is_jasa' => false,
            ],
            [
                'id' => 'umkm-3',
                'desa_id' => 1,
                'nama' => 'Tas Selempang Anyaman Bambu & Kulit',
                'toko_nama' => 'Kriya Anyam Lestari Warga',
                'kelurahan' => 'Paguyuban Ibu Sukamaju',
                'rt_rw' => 'RT 01 / RW 02',
                'kategori' => 'Kriya & Kerajinan',
                'badge_tag' => 'KRIYA WARGA',
                'harga' => 115000,
                'satuan' => 'Original Lokal',
                'deskripsi' => 'Kerajinan tangan otentik anyaman bambu apus halus dengan lining kain blacu dan strap kulit sintetis premium.',
                'foto_url' => 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
                'galeri' => ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'],
                'alamat' => 'Rumah Kreatif Sukamaju Blok C-12',
                'lat' => -7.8115,
                'lng' => 112.0080,
                'wa_kontak' => '6281234567803',
                'qris_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570014ID.LINKAJA.WWW01189360091100213192025204581253033605802ID5918ANYAM_LESTARI6006KEDIRI62070703A016304E1F2',
                'qris_nama' => 'QRIS ANYAM LESTARI',
                'qris_nmid' => 'ID10293847283',
                'metode_pembayaran' => [
                    'qris' => true,
                    'cod' => false,
                    'do' => true,
                    'transfer' => true
                ],
                'status_toko' => 'Buka',
                'rating' => 5.0,
                'reviews_count' => 12,
                'terjual_text' => '34 terjual • Handmade',
                'terjual' => 34,
                'buka_jam_text' => 'Handmade Siap Antar',
                'is_jasa' => false,
            ],
            [
                'id' => 'umkm-4',
                'desa_id' => 1,
                'nama' => 'Cuci & Servis Rutin AC Rumah (0.5 - 2 PK)',
                'toko_nama' => 'Bengkel Teknik AC Mas Agus',
                'kelurahan' => 'Teknisi Bersertifikat',
                'rt_rw' => 'RT 02 / RW 05',
                'kategori' => 'Jasa Panggilan',
                'badge_tag' => 'JASA KILAT',
                'harga' => 65000,
                'satuan' => '/unit',
                'deskripsi' => 'Layanan perawatan pendingin ruangan komprehensif oleh teknisi warga berlisensi BNSP. Meliputi cuci blower indoor, desinfeksi evaporator, dan cek tekanan freon.',
                'foto_url' => 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
                'galeri' => ['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'],
                'alamat' => 'Basecamp Teknisi RW 05, Kel. Sukamaju',
                'lat' => -7.7950,
                'lng' => 112.0150,
                'wa_kontak' => '6281234567804',
                'qris_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570014ID.LINKAJA.WWW01189360091100213192025204581253033605802ID5918TEKNIK_AC_AGUS6006KEDIRI62070703A016304E1F2',
                'qris_nama' => 'QRIS TEKNIK AC MAS AGUS',
                'qris_nmid' => 'ID10293847284',
                'metode_pembayaran' => [
                    'qris' => true,
                    'cod' => true,
                    'do' => true,
                    'transfer' => true
                ],
                'status_toko' => 'Buka',
                'rating' => 4.9,
                'reviews_count' => 112,
                'terjual_text' => '112+ panggilan • Garansi 30 Hari',
                'terjual' => 112,
                'buka_jam_text' => 'Buka Tiap Hari (08.00 - 17.00)',
                'is_jasa' => true,
                'pilihan_layanan_jasa' => [
                    ['id' => 'j-1', 'nama' => 'Cuci Ringan AC (0.5 - 1 PK)', 'harga' => 65000, 'unitText' => '/unit'],
                    ['id' => 'j-2', 'nama' => 'Cuci AC Besar (1.5 - 2 PK)', 'harga' => 85000, 'unitText' => '/unit'],
                    ['id' => 'j-3', 'nama' => 'Tambah Freon R32 / R410A', 'harga' => 120000, 'unitText' => 'penuh'],
                    ['id' => 'j-4', 'nama' => 'Perbaikan Kelistrikan / Bocor', 'harga' => 50000, 'unitText' => 'mulai']
                ],
            ],
            [
                'id' => 'umkm-5',
                'desa_id' => 1,
                'nama' => 'Kemeja Batik Cap Katun Primissima',
                'toko_nama' => 'Oemah Batik Canting Bu Siti',
                'kelurahan' => 'Konveksi Warga',
                'rt_rw' => 'RT 04 / RW 03',
                'kategori' => 'Fashion & Batik',
                'badge_tag' => 'PRODUKSI SENDIRI',
                'harga' => 89000,
                'satuan' => 'Ukuran M - XXL',
                'deskripsi' => 'Motif batik khas Kediri motif Jaranan & Teratai, kain primissima halus menyerap keringat dan jahitan rapi kuat.',
                'foto_url' => 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
                'galeri' => ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80'],
                'alamat' => 'Sentra Batik Warga RT 04',
                'lat' => -7.7840,
                'lng' => 112.0250,
                'wa_kontak' => '6281234567805',
                'qris_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570014ID.LINKAJA.WWW01189360091100213192025204581253033605802ID5918BATIK_BU_SITI6006KEDIRI62070703A016304E1F2',
                'qris_nama' => 'QRIS BATIK BU SITI',
                'qris_nmid' => 'ID10293847285',
                'metode_pembayaran' => [
                    'qris' => true,
                    'cod' => true,
                    'do' => true,
                    'transfer' => true
                ],
                'status_toko' => 'Buka',
                'rating' => 4.8,
                'reviews_count' => 24,
                'terjual_text' => '89+ terjual • Katun Halus Adem',
                'terjual' => 89,
                'buka_jam_text' => 'Buka 08.00 - 18.00 WIB',
                'is_jasa' => false,
            ],
            [
                'id' => 'umkm-6',
                'desa_id' => 1,
                'nama' => 'Pastel Renyah Telur Sayur (Paket 10 Pcs)',
                'toko_nama' => 'Dapur Kue Mak Rohmah',
                'kelurahan' => 'Kue Tradisional',
                'rt_rw' => 'RT 05 / RW 02',
                'kategori' => 'Kuliner & Kudapan',
                'badge_tag' => 'KUDAPAN HANGAT',
                'harga' => 35000,
                'satuan' => 'Isi 10 Pcs + Cabai',
                'deskripsi' => 'Pastel isi wortel manis, kentang dadu, dan irisan telur ayam rebus. Kulit pastry berlapis renyah tanpa minyak berlebih.',
                'foto_url' => 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
                'galeri' => ['https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80'],
                'alamat' => 'Gang Flamboyan No. 2, RT 05',
                'lat' => -7.7760,
                'lng' => 112.0290,
                'wa_kontak' => '6281234567806',
                'qris_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570014ID.LINKAJA.WWW01189360091100213192025204581253033605802ID5918DAPUR_MAK_ROHMAH6006KEDIRI62070703A016304E1F2',
                'qris_nama' => 'QRIS MAK ROHMAH',
                'qris_nmid' => 'ID10293847286',
                'metode_pembayaran' => [
                    'qris' => true,
                    'cod' => true,
                    'do' => true,
                    'transfer' => true
                ],
                'status_toko' => 'Buka',
                'rating' => 4.9,
                'reviews_count' => 37,
                'terjual_text' => '140+ box • Goreng Dadakan',
                'terjual' => 140,
                'buka_jam_text' => 'Buka 06.00 - 17.00 WIB',
                'is_jasa' => false,
            ]
        ];

        foreach ($items as $itemData) {
            Umkm::updateOrCreate(
                ['id' => $itemData['id']],
                $itemData
            );
        }

        // Add some sample initial reviews for umkm-1 and umkm-4
        UmkmReview::firstOrCreate(
            ['umkm_id' => 'umkm-1', 'reviewer_name' => 'Pak Hendra (Warga RT 02)'],
            [
                'rating' => 5,
                'komentar' => 'Ayam gorengnya gurih banget dan sambalnya mantap. Diantar langsung oleh penjual masih hangat dalam 15 menit ke rumah. Rekomended!',
                'reviewer_rt_rw' => 'RT 02 / RW 04',
            ]
        );

        UmkmReview::firstOrCreate(
            ['umkm_id' => 'umkm-1', 'reviewer_name' => 'Ibu Ratna Dewi'],
            [
                'rating' => 5,
                'komentar' => 'Nasi liwetnya wangi rempah asli dan porsinya kenyang. Sangat cocok buat sarapan dan makan siang keluarga.',
                'reviewer_rt_rw' => 'RT 01 / RW 04',
            ]
        );

        UmkmReview::firstOrCreate(
            ['umkm_id' => 'umkm-4', 'reviewer_name' => 'Pak Bambang S.'],
            [
                'rating' => 5,
                'komentar' => 'Servis Mas Agus sangat teliti dan rapi. AC yang sebelumnya berisik dan kurang dingin sekarang dingin menusuk tulang. Ada garansi tertulis juga.',
                'reviewer_rt_rw' => 'RT 03 / RW 05',
            ]
        );
    }
}
