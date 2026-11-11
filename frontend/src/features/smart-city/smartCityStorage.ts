import { UmkmItem, HunianItem, LokerItem, LamaranLoker, JobSeekerProfile } from './types';

// Pusat Kota Kediri / Simpang Lima Gumul (SLG)
export const KEDIRI_DEFAULT_COORDS = {
  lat: -7.8166,
  lng: 112.0118,
  label: 'Balai Kota / Pusat Kediri'
};

/**
 * Formula Haversine untuk kalkulasi jarak radius bumi dalam kilometer
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.round(dist * 10) / 10;
}

/**
 * Format representasi jarak (meter jika < 1km, km jika >= 1km)
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm <= 0) return '0 m';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// ============================================================================
// SEED DATA: UMKM (Pure Dynamic Backend API - 50 items seeded in Laravel DB)
// ============================================================================
const SEED_UMKM: UmkmItem[] = [];

// ============================================================================
// SEED DATA: KOS & HUNIAN
// ============================================================================
const SEED_KOS: HunianItem[] = [
  {
    id: 'kos-1',
    nama: 'Kos Putri Griya Asri Doko (Dekat SLG)',
    tipe: 'Kos Putri',
    harga: 650000,
    periode: 'bulan',
    alamat: 'Jl. Kenanga No. 18, RT 02 / RW 01, Dusun Krajan',
    dusun: 'Dusun Krajan',
    rtRw: 'RT 02 / RW 01',
    lat: -7.8185,
    lng: 112.0142,
    sisaKamar: 3,
    deskripsi: 'Kos putri dengan lingkungan bersih, aman, dan tertib. Dekat dengan RSUD Simpang Lima Gumul dan akses kuliner 24 jam. Bebas jam malam khusus karyawati dengan kunci gerbang masing-masing.',
    fasilitas: ['WiFi Cepat 50 Mbps', 'Kamar Mandi Dalam', 'Kasur Springbed', 'Lemari Pakaian', 'Dapur Bersama', 'CCTV 24 Jam'],
    pemilikNama: 'Ibu Hj. Siti Masitoh',
    pemilikWa: '6281234567801',
    qrisUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570014ID.LINKAJA.WWW01189360091100213192025204581253033605802ID5918KOS_GRIYA_ASRI6006KEDIRI62070703A016304E1F2',
    fotoUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
    terverifikasi: true,
    createdAt: '2026-10-01'
  },
  {
    id: 'kos-2',
    nama: 'Kos Putra Mahasiswa & Karyawan Mandiri',
    tipe: 'Kos Putra',
    harga: 500000,
    periode: 'bulan',
    alamat: 'Jl. Melati RT 04 / RW 02, Dekat Kampus IIK',
    dusun: 'Dusun Doko Tengah',
    rtRw: 'RT 04 / RW 02',
    lat: -7.812,
    lng: 112.008,
    sisaKamar: 2,
    deskripsi: 'Lokasi strategis dekat kampus IIK dan Uniska Kediri. Lingkungan kondusif untuk belajar, parkiran motor dalam berpagar tinggi, air sumur jernih, dan WiFi kencang 100 Mbps.',
    fasilitas: ['WiFi 100 Mbps', 'Parkir Motor Luas', 'Kasur Busa Tebal', 'Meja Belajar', 'Air Bersih PDAM'],
    pemilikNama: 'Bapak Bambang Suprayogi',
    pemilikWa: '6281234567802',
    fotoUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80',
    terverifikasi: true,
    createdAt: '2026-10-03'
  },
  {
    id: 'kos-3',
    nama: 'Paviliun Eksklusif AC Campur Simpang Lima',
    tipe: 'Kos Campur',
    harga: 1250000,
    periode: 'bulan',
    alamat: 'Jl. Erlangga No. 7, Kawasan SLG Kediri',
    lat: -7.825,
    lng: 112.025,
    sisaKamar: 4,
    deskripsi: 'Paviliun mewah modern berpendingin AC di kawasan elit Simpang Lima Gumul. Parkir mobil luas, water heater kamar mandi pribadi, keamanan satpam 24 jam.',
    fasilitas: ['AC Inverter Dingin', 'Water Heater', 'Kamar Mandi Dalam', 'Smart TV', 'Parkir Mobil Aman', 'Security 24 Jam'],
    pemilikNama: 'dr. Hendra Pratama',
    pemilikWa: '6281234567803',
    qrisUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570014ID.LINKAJA.WWW01189360091100213192025204581253033605802ID5918PAVILIUN_SLG6006KEDIRI62070703A016304E1F2',
    fotoUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
    terverifikasi: true,
    createdAt: '2026-10-08'
  },
  {
    id: 'kos-4',
    nama: 'Kontrakan Rumah Asri 3 Kamar Tidur',
    tipe: 'Kontrakan Rumah',
    harga: 14000000,
    periode: 'tahun',
    alamat: 'Perum Doko Indah Blok C No. 12',
    lat: -7.82,
    lng: 112.015,
    sisaKamar: 1,
    deskripsi: 'Rumah sewa kontrakan siap huni untuk keluarga. Ruang tamu luas, dapur kitchen set, halaman depan rindang, jalan perumahan paving lebar 2 mobil papasan.',
    fasilitas: ['3 Kamar Tidur', '2 Kamar Mandi', 'Garasi Mobil', 'Taman Depan', 'Listrik 2200 VA', 'Air Sumur Bor Bening'],
    pemilikNama: 'H. Sudarsono',
    pemilikWa: '6281234567804',
    fotoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    terverifikasi: true,
    createdAt: '2026-10-12'
  }
];

// ============================================================================
// SEED DATA: LOKER (Matches Stitch Screen 2 & 3 Official Designs)
// ============================================================================
const SEED_LOKER: LokerItem[] = [
  {
    id: 'loker-1',
    posisi: 'Staf Administrasi & Pendataan Warga',
    perusahaan: 'PT Solusi Distribusi Kota',
    kodeReg: 'Kode Reg: DSK-8812',
    nib: '9120308821033',
    companyLogoText: 'SD',
    mitraStatus: 'Mitra Resmi Terverifikasi',
    tagVerifikasi: 'Terverifikasi Disnaker',
    kategori: 'Administrasi',
    tipeKerja: 'Penuh Waktu (Full-time)',
    lokasi: 'Kecamatan Pusat',
    distanceText: '1.2 km dari Anda',
    lat: -7.8166,
    lng: 112.0118,
    gajiLabel: 'STANDAR GAJI BULANAN',
    gajiMin: 4900000,
    gajiMax: 5500000,
    gajiSubtext: '/ bulan • di atas UMK',
    pendidikan: 'Min. SMK / D3 / S1',
    pengalaman: 'Fresh Graduate / 1 tahun',
    syaratCv: true,
    ringkasan: 'Pendidikan min. SMK/D3, mahir spreadsheet dan aplikasi kantor, teliti dalam pengarsipan berkas. Penempatan kantor operasional cabang pusat kota.',
    tags: ['Spreadsheet', 'Arsip Digital', 'BPJS Ketenagakerjaan'],
    waktuKerja: 'Senin - Jumat\n08.30 - 17.00 WIB',
    levelPekerjaan: 'Entry Level / Staf\nFresh graduate dipersilakan',
    fasilitasUtama: 'BPJS Lengkap\nTunjangan Makan & Transportasi',
    bidang: 'Logistik & Distribusi',
    alamatKantor: 'Kawasan Niaga C-12, Kec. Pusat Kota',
    batasPengajuan: '31 Maret 2025',
    kuotaKebutuhan: '2 Orang',
    waktuProses: '3 - 5 hari kerja',
    deskripsiDetail: 'Staf Administrasi & Pendataan Warga bertanggung jawab mengawal keakuratan data pelayanan publik dan alur logistik operasional harian kantor distribusi kawasan terpadu bersama tim koordinator wilayah.',
    deskripsi: [
      'Mengelola administrasi operasional harian dan pengarsipan digital berkas kependudukan kawasan melalui platform SiDesKu.',
      'Melakukan pendataan inventaris logistik, rekonsiliasi data rutin, dan pelaporan stok berkala.',
      'Berkoordinasi dengan koordinator wilayah dan staf lapangan untuk verifikasi dokumen tanda terima.',
      'Menyusun laporan administrasi mingguan dan bulanan secara terstruktur dan rapi.'
    ],
    tanggungJawab: [
      'Mengelola administrasi operasional harian dan pengarsipan digital berkas kependudukan kawasan melalui platform SiDesKu.',
      'Melakukan pendataan inventaris logistik, rekonsiliasi data rutin, dan pelaporan stok berkala.',
      'Berkoordinasi dengan koordinator wilayah dan staf lapangan untuk verifikasi dokumen tanda terima.',
      'Menyusun laporan administrasi mingguan dan bulanan secara terstruktur dan rapi.'
    ],
    persyaratan: [
      'Pendidikan minimal SMK / D3 / S1 semua jurusan (terbuka untuk Fresh Graduate).',
      'Memiliki ketelitian tinggi dalam penginputan data dan pengoperasian spreadsheet (Excel / Google Sheets).',
      'Mampu berkomunikasi dengan ramah, sopan, dan jelas secara lisan maupun tertulis.',
      'Berdomisili di wilayah Kecamatan Pusat atau bersedia bertugas di lokasi kantor (WFO).'
    ],
    benefits: [
      { title: 'Gaji Pokok Kompetitif', desc: 'Sesuai standar UMK kota dengan transparansi PPh.', icon: 'money' },
      { title: 'Jaminan Sosial Lengkap', desc: 'BPJS Kesehatan & BPJS Ketenagakerjaan aktif.', icon: 'shield' },
      { title: 'Tunjangan Operasional', desc: 'Tunjangan transportasi harian & uang makan.', icon: 'transport' },
      { title: 'Pengembangan Karir', desc: 'Jenjang karir jelas & pelatihan digital bersertifikasi.', icon: 'growth' }
    ],
    waHrd: '6281234567810',
    emailHrd: 'karir@distribusikota.co.id',
    disnakerVerified: true,
    tanggalPosting: 'Pembaruan Real-Time',
    jumlahPelamar: 42,
    createdAt: '2026-11-01'
  },
  {
    id: 'loker-2',
    posisi: 'Teknisi Servis & Maintenance AC',
    perusahaan: 'Paguyuban Teknisi Mandiri Sejahtera',
    companyLogoText: 'PT',
    mitraStatus: 'Mitra Komunitas Kota',
    tagVerifikasi: 'Sertifikasi BNSP',
    kategori: 'Teknik & Bengkel',
    tipeKerja: 'Jasa Mandiri / Freelance',
    isJasaMitra: true,
    lokasi: 'Kecamatan Sukamaju',
    distanceText: '800 m dari Anda',
    lat: -7.8185,
    lng: 112.0142,
    gajiLabel: 'TARIF JASA TEKNISI',
    gajiMin: 75000,
    gajiMax: 150000,
    gajiSubtext: '/ unit pengerjaan',
    pendidikan: 'SMK Teknik Pendingin / Pengalaman 1 th',
    pengalaman: 'Minimal 1 tahun atau punya alat dasar',
    syaratCv: false,
    ringkasan: 'Pengalaman min. 1 tahun, memiliki alat servis dasar mandiri. Sistem bagi hasil transparan langsung cair per panggilan servis rumah tinggal atau ruko warga.',
    tags: ['Cuci AC', 'Isi Freon', 'Jadwal Bebas'],
    waktuKerja: 'Fleksibel / Sesuai Panggilan Warga',
    levelPekerjaan: 'Teknisi Mandiri / Freelance',
    fasilitasUtama: 'Asuransi Kerja & Toolkit Pendukung',
    bidang: 'Jasa Perbaikan & Pendingin Udara',
    alamatKantor: 'Pusat Kemitraan Komunitas, Kec. Sukamaju',
    batasPengajuan: 'Terbuka Sepanjang Tahun',
    kuotaKebutuhan: '5 Orang',
    waktuProses: '1 - 2 hari kerja',
    deskripsiDetail: 'Program kemitraan mandiri Disnaker bersama Paguyuban Teknisi untuk mempertemukan teknisi bersertifikasi dengan warga perumahan yang membutuhkan servis AC cepat dan terstandar.',
    deskripsi: [
      'Menerima order panggilan servis cuci dan perawatan AC warga sekitar melalui aplikasi.',
      'Melakukan pengecekan tekanan freon, pembersihan evaporator, dan pipa drainase.',
      'Menjaga etika kerja profesional, kerapihan, dan transparansi biaya servis kepada warga pemesan.'
    ],
    tanggungJawab: [
      'Menerima order panggilan servis cuci dan perawatan AC warga sekitar melalui aplikasi.',
      'Melakukan pengecekan tekanan freon, pembersihan evaporator, dan pipa drainase.',
      'Menjaga etika kerja profesional, kerapihan, dan transparansi biaya servis kepada warga pemesan.'
    ],
    persyaratan: [
      'Memiliki keahlian teknik servis AC split (minimal cuci dan isi freon).',
      'Memiliki alat kerja sendiri (pompa cuci jet cleaner / manifold gauge).',
      'Jujur, ramah, dan bersedia mengikuti SOP pelayanan warga.'
    ],
    benefits: [
      { title: 'Penghasilan Langsung Cair', desc: 'Bagi hasil transparan langsung masuk dompet digital setiap pekerjaan selesai.', icon: 'money' },
      { title: 'Radius Panggilan Terdekat', desc: 'Sistem memprioritaskan order di sekitar tempat tinggal mitra.', icon: 'transport' },
      { title: 'Sertifikasi & Pelatihan', desc: 'Dukungan sertifikasi BNSP resmi berkala dari Pemkot.', icon: 'growth' },
      { title: 'Perlindungan Komunitas', desc: 'Didukung paguyuban resmi dan perlindungan keselamatan kerja.', icon: 'shield' }
    ],
    waHrd: '6281234567812',
    disnakerVerified: true,
    tanggalPosting: 'Hari ini',
    jumlahPelamar: 18,
    createdAt: '2026-11-03'
  },
  {
    id: 'loker-3',
    posisi: 'Barista & Operasional Kedai Kopi',
    perusahaan: 'Kopi Seduh Mandiri',
    companyLogoText: 'KS',
    mitraStatus: 'Usaha Mikro Binaan Kota',
    tagVerifikasi: 'UMKM Binaan Resmi',
    kategori: 'F&B / Kuliner',
    tipeKerja: 'Shift Fleksibel',
    lokasi: 'Jl. Kaliurang',
    distanceText: '2.4 km dari Anda',
    lat: -7.825,
    lng: 112.025,
    gajiLabel: 'STANDAR GAJI & TUNJANGAN',
    gajiMin: 3200000,
    gajiMax: 4000000,
    gajiSubtext: '/ bulan + Uang Makan Harian',
    pendidikan: 'SMA / SMK Sederajat',
    pengalaman: 'Terbuka untuk pemula yang ingin belajar',
    syaratCv: true,
    ringkasan: 'Ramah, komunikatif, bersedia bekerja dalam tim shift. Disediakan pelatihan espresso brewing dasar dan sistem kasir digital POS.',
    tags: ['Espresso Machine', 'Pelayanan Tamu', '+ Uang Makan'],
    waktuKerja: 'Shift Pagi / Sore (6-8 Jam/Hari)',
    levelPekerjaan: 'Kru Bar & Kasir (Pemula Welcome)',
    fasilitasUtama: 'Makan Harian & Tips Komisi',
    bidang: 'Food & Beverage / Coffee Shop',
    alamatKantor: 'Jl. Kaliurang No. 42, Kediri',
    batasPengajuan: '15 April 2025',
    kuotaKebutuhan: '3 Orang',
    waktuProses: '2 - 3 hari kerja',
    deskripsiDetail: 'Kedai Kopi Seduh Mandiri membuka peluang kerja ramah warga bagi pemuda lokal yang antusias mempelajari dunia hospitality kopi dan pelayanan barista profesional.',
    deskripsi: [
      'Menyeduh minuman kopi espresso based, manual brew, serta varian teh kekinian.',
      'Melayani pesanan pelanggan dengan ramah serta mengoperasikan sistem kasir POS.',
      'Menjaga kebersihan dan sanitasi bar, peralatan racik, dan area meja tamu.'
    ],
    tanggungJawab: [
      'Menyeduh minuman kopi espresso based, manual brew, serta varian teh kekinian.',
      'Melayani pesanan pelanggan dengan ramah serta mengoperasikan sistem kasir POS.',
      'Menjaga kebersihan dan sanitasi bar, peralatan racik, dan area meja tamu.'
    ],
    persyaratan: [
      'Usia min. 18 tahun, ramah, berpenampilan rapi, dan komunikatif.',
      'Terbuka untuk mahasiswa tingkat akhir atau fresh graduate SMA/SMK.',
      'Disiplin waktu dan sanggup bekerja secara tim.'
    ],
    benefits: [
      { title: 'Pelatihan Barista Gratis', desc: 'Dimentori barista profesional hingga mahir kalibrasi rasa espresso.', icon: 'growth' },
      { title: 'Uang Makan Harian', desc: 'Mendapatkan jatah makan harian dan jatah kopi seduh gratis.', icon: 'transport' },
      { title: 'Bonus Penjualan', desc: 'Insentif pencapaian target penjualan bulanan kedai.', icon: 'money' },
      { title: 'Jadwal Shift Fleksibel', desc: 'Bisa menyesuaikan jam kuliah atau aktivitas keluarga.', icon: 'shield' }
    ],
    waHrd: '6281234567811',
    disnakerVerified: true,
    tanggalPosting: '2 hari lalu',
    jumlahPelamar: 29,
    createdAt: '2026-11-04'
  },
  {
    id: 'loker-4',
    posisi: 'Staf Gudang & Penataan Logistik',
    perusahaan: 'Pusat Distribusi Sembako Warga',
    companyLogoText: 'PD',
    mitraStatus: 'BUMD Partner',
    tagVerifikasi: 'Terverifikasi Disnaker',
    kategori: 'Perdagangan & Retail',
    tipeKerja: 'Penuh Waktu',
    lokasi: 'Kawasan Industri Timur',
    distanceText: '4.1 km dari Anda',
    lat: -7.8105,
    lng: 112.0054,
    gajiLabel: 'STANDAR GAJI BULANAN',
    gajiMin: 5100000,
    gajiMax: 5800000,
    gajiSubtext: '/ bulan • BPJS TK & Kesehatan',
    pendidikan: 'SMA / SMK Sederajat',
    pengalaman: 'Fresh Graduate / Pengalaman 1 th',
    syaratCv: true,
    ringkasan: 'Fisik sehat dan disiplin, bertanggung jawab dalam pencatatan stok opname berkala, pemilahan barang masuk, serta pengepakan muatan armada harian.',
    tags: ['Stok Opname', 'Handling Barang', 'Insentif Kehadiran'],
    waktuKerja: 'Senin - Sabtu\n07.00 - 15.30 WIB',
    levelPekerjaan: 'Staf Logistik & Gudang',
    fasilitasUtama: 'BPJS Ketenagakerjaan & Asuransi',
    bidang: 'Logistik & Pangan Daerah',
    alamatKantor: 'Gudang Logistik Blok B, Kawasan Industri',
    batasPengajuan: '20 April 2025',
    kuotaKebutuhan: '4 Orang',
    waktuProses: '3 - 5 hari kerja',
    deskripsiDetail: 'Unit BUMD Pengadaan Komoditas Pangan Daerah mengundang putra-putri daerah untuk bergabung dalam divisi pergudangan guna menjaga rantai pasok sembako tetap stabil di seluruh kecamatan.',
    deskripsi: [
      'Melakukan penerimaan barang masuk dari suplier dan mencocokkan surat jalan.',
      'Menata komoditas pangan di rak pallet gudang sesuai standar FIFO.',
      'Melakukan scan barcode packing pesanan pasar rakyat dan memuat ke armada pengantar.'
    ],
    tanggungJawab: [
      'Melakukan penerimaan barang masuk dari suplier dan mencocokkan surat jalan.',
      'Menata komoditas pangan di rak pallet gudang sesuai standar FIFO.',
      'Melakukan scan barcode packing pesanan pasar rakyat dan memuat ke armada pengantar.'
    ],
    persyaratan: [
      'Pria/Wanita sehat jasmani dan rohani, sanggup beraktivitas fisik di gudang.',
      'Disiplin, teliti, dan bertanggung jawab terhadap keutuhan barang inventaris.',
      'Memahami dasar penggunaan scanner barcode atau aplikasi inventory menjadi nilai plus.'
    ],
    benefits: [
      { title: 'Gaji di Atas UMK', desc: 'Standar gaji BUMD transparan dengan jaminan kepastian kontrak kerja.', icon: 'money' },
      { title: 'BPJS TK & Kesehatan Lengkap', desc: 'Perlindungan penuh sejak hari pertama kerja.', icon: 'shield' },
      { title: 'Insentif Kehadiran & Lembur', desc: 'Kompensasi lembur sesuai ketentuan regulasi Kemenaker.', icon: 'growth' },
      { title: 'Seragam & APD Kerja', desc: 'Disediakan rompi, sepatu safety, dan perlengkapan gudang tanpa dipungut biaya.', icon: 'transport' }
    ],
    waHrd: '6281234567813',
    disnakerVerified: true,
    tanggalPosting: '3 hari lalu',
    jumlahPelamar: 35,
    createdAt: '2026-11-05'
  }
];

// ============================================================================
// SEED DATA: LAMARAN (Matches Stitch Screen 1 History)
// ============================================================================
const SEED_LAMARAN: LamaranLoker[] = [
  {
    id: 'lamaran-1',
    lokerId: 'loker-1',
    lokerPosisi: 'Staf Administrasi Operasional',
    lokerPerusahaan: 'PT Solusi Distribusi Kota',
    pelamarNama: 'Budi Pratama',
    pelamarNik: '3204************',
    pelamarEmail: 'budi.pratama@warga.sidesku.id',
    pelamarWa: '0812-8921-7740',
    cvFileName: 'CV_Budi_Pratama_Terbaru.pdf',
    portofolioFileName: 'Portofolio_Administrasi_Budi.pdf',
    status: 'Berkas Diterima HR - Wawancara Dijadwalkan',
    substatusText: 'Undangan via WhatsApp & Email',
    tanggalLamar: '10 Mei 2025',
    iconType: 'building'
  },
  {
    id: 'lamaran-2',
    lokerId: 'loker-3',
    lokerPosisi: 'Barista & Kasir Front-Office',
    lokerPerusahaan: 'Koperasi Seduh Mandiri',
    pelamarNama: 'Budi Pratama',
    pelamarNik: '3204************',
    pelamarEmail: 'budi.pratama@warga.sidesku.id',
    pelamarWa: '0812-8921-7740',
    cvFileName: 'CV_Budi_Pratama_Terbaru.pdf',
    status: 'Selesai Seleksi',
    substatusText: 'Status Final Tersimpan',
    tanggalLamar: '28 April 2025',
    iconType: 'coffee'
  }
];

// ============================================================================
// DEFAULT JOB SEEKER PROFILE (Matches Stitch Screen 1)
// ============================================================================
const DEFAULT_JOB_SEEKER_PROFILE: JobSeekerProfile = {
  nama: 'Budi Pratama',
  nik: '3204•••• •••• 1002',
  domisili: 'RW 04, Desa Mekar Mukti',
  statusKerja: 'Siap Bekerja (Open to Work)',
  terakhirUpdate: 'Diperbarui 2 hari lalu',
  email: 'budi.pratama@warga.sidesku.id',
  telepon: '0812-8921-7740',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  cvUtama: {
    name: 'CV_Budi_Pratama_Terbaru.pdf',
    size: '1.4 MB',
    lastUpdated: '14 Mei 2025',
    atsPassed: true
  },
  berkasPendukung: [
    {
      id: 'bp-1',
      judul: 'Sertifikat BNSP Administrasi',
      status: 'Valid',
      subjudul: 'Terbit 2024 • PDF (840 KB)',
      noReg: 'Reg. BNSP-9018',
      icon: 'award'
    },
    {
      id: 'bp-2',
      judul: 'Ijazah & Transkrip Nilai',
      status: 'Terverifikasi',
      subjudul: 'SMK Negeri 1 (Manajemen Bisnis)',
      noReg: 'Nilai: 88.5 / 100',
      icon: 'graduation'
    },
    {
      id: 'bp-3',
      judul: 'Pelatihan Excel Korporat',
      status: 'Valid',
      subjudul: 'BLK Disnaker • 40 Jam Sesi',
      noReg: 'Sertifikat: BLK-2023',
      icon: 'ribbon'
    }
  ],
  keahlian: [
    'Administrasi Perkantoran',
    'Microsoft Excel / Sheets',
    'Manajemen Arsip',
    'Bahasa Inggris Dasar'
  ],
  preferensi: {
    area: 'Kecamatan Pusat / Sukamaju',
    radius: 'Radius maksimal 15 km dari domisili',
    gaji: 'Rp 4.800.000+ / bulan',
    gajiSub: 'Sesuai UMK wilayah & tunjangan',
    tipe: 'Penuh Waktu (Full-time)',
    tipeSub: 'Tersedia untuk sistem kontrak PKWT / tetap'
  }
};

// ============================================================================
// STORAGE HANDLERS WITH LOCALSTORAGE BACKING
// ============================================================================

const STORAGE_KEY_UMKM = 'nexora_smartcity_umkm_v3';
const STORAGE_KEY_KOS = 'nexora_smartcity_kos_data';
const STORAGE_KEY_LOKER = 'nexora_smartcity_loker_data';
const STORAGE_KEY_LAMARAN = 'nexora_smartcity_lamaran_data';

// --- UMKM ---
export function getStoredUmkmList(): UmkmItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UMKM);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return SEED_UMKM;
}

export function saveStoredUmkmItem(item: UmkmItem): UmkmItem[] {
  const current = getStoredUmkmList();
  const index = current.findIndex(u => u.id === item.id);
  let updated: UmkmItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = item;
  } else {
    updated = [item, ...current];
  }
  try {
    localStorage.setItem(STORAGE_KEY_UMKM, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function deleteStoredUmkmItem(id: string): UmkmItem[] {
  const current = getStoredUmkmList();
  const updated = current.filter(u => u.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_UMKM, JSON.stringify(updated));
  } catch {}
  return updated;
}

// --- KOS ---
export function getStoredKosList(): HunianItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KOS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }
  return SEED_KOS;
}

export function saveStoredKosItem(item: HunianItem): HunianItem[] {
  const current = getStoredKosList();
  const index = current.findIndex(k => k.id === item.id);
  let updated: HunianItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = item;
  } else {
    updated = [item, ...current];
  }
  try {
    localStorage.setItem(STORAGE_KEY_KOS, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function deleteStoredKosItem(id: string): HunianItem[] {
  const current = getStoredKosList();
  const updated = current.filter(k => k.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_KOS, JSON.stringify(updated));
  } catch {}
  return updated;
}

const STORAGE_KEY_JOB_SEEKER = 'nexora_smartcity_job_seeker_v1';

// --- LOKER ---
export function getStoredLokerList(): LokerItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOKER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If items are missing rich fields, merge with SEED_LOKER
        const merged = parsed.map(item => {
          const seedMatch = SEED_LOKER.find(s => s.id === item.id);
          return seedMatch ? { ...seedMatch, ...item } : item;
        });
        return merged;
      }
    }
  } catch {
    // fallback
  }
  return SEED_LOKER;
}

export function getStoredLokerById(id: string): LokerItem | undefined {
  const list = getStoredLokerList();
  return list.find(l => l.id === id) || SEED_LOKER.find(s => s.id === id);
}

export function saveStoredLokerItem(item: LokerItem): LokerItem[] {
  const current = getStoredLokerList();
  const index = current.findIndex(l => l.id === item.id);
  let updated: LokerItem[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = item;
  } else {
    updated = [item, ...current];
  }
  try {
    localStorage.setItem(STORAGE_KEY_LOKER, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function deleteStoredLokerItem(id: string): LokerItem[] {
  const current = getStoredLokerList();
  const updated = current.filter(l => l.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY_LOKER, JSON.stringify(updated));
  } catch {}
  return updated;
}

// --- LAMARAN LOKER ---
export function getStoredLamaranList(): LamaranLoker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAMARAN);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return SEED_LAMARAN;
}

export function submitStoredLamaran(lamaran: LamaranLoker): LamaranLoker[] {
  const current = getStoredLamaranList();
  const updated = [lamaran, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_LAMARAN, JSON.stringify(updated));
  } catch {}
  return updated;
}

// --- JOB SEEKER PROFILE ---
export function getStoredJobSeekerProfile(): JobSeekerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_JOB_SEEKER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.nama) {
        return { ...DEFAULT_JOB_SEEKER_PROFILE, ...parsed };
      }
    }
  } catch {}
  return DEFAULT_JOB_SEEKER_PROFILE;
}

export function saveStoredJobSeekerProfile(profile: JobSeekerProfile): JobSeekerProfile {
  try {
    localStorage.setItem(STORAGE_KEY_JOB_SEEKER, JSON.stringify(profile));
  } catch {}
  return profile;
}
