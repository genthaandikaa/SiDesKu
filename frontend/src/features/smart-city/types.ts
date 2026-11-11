export interface UmkmItem {
  id: string;
  wargaId?: string;
  wargaNama?: string;
  nama: string;
  tokoNama: string;
  kelurahan?: string;
  rtRw?: string;
  kategori: 'Kuliner & Kudapan' | 'Bahan Pokok & Sembako' | 'Kriya & Kerajinan' | 'Jasa Panggilan' | 'Fashion & Batik' | string;
  badgeTag?: string; // e.g. 'SIAP ANTAR (COD)', 'KEBUTUHAN POKOK', 'KRIYA WARGA', 'JASA KILAT', 'PRODUKSI SENDIRI', 'KUDAPAN HANGAT'
  harga: number;
  ongkir?: number;
  satuan?: string;
  deskripsi: string;
  fotoUrl: string;
  galeri?: string[];
  alamat: string;
  lat: number;
  lng: number;
  waKontak: string;
  qrisUrl?: string;
  qrisNama?: string;
  qrisNmid?: string;
  metodePembayaran: {
    qris: boolean;
    cod: boolean;
    do: boolean; // Delivery Order
    transfer: boolean;
  };
  statusToko: 'Buka' | 'Tutup';
  rating: number;
  reviewsCount?: number;
  reviews?: UmkmReviewItem[];
  terjualText?: string;
  terjual?: number;
  bukaJamText?: string;
  isJasa?: boolean;
  // Specific Food Details
  pilihanAyam?: { nama: string; hargaExtra: number }[];
  pilihanSambal?: string[];
  keteranganHalal?: string;
  keteranganHigienis?: string;
  // Specific Jasa Details
  pilihanLayananJasa?: { id: string; nama: string; harga: number; unitText?: string }[];
  garansiText?: string;
  sertifikasiText?: string;
  radiusMaxKm?: number;
  createdAt: string;
}

export interface UmkmReviewItem {
  id: number | string;
  umkmId: string;
  userId?: number | null;
  rating: number;
  komentar: string;
  reviewerName: string;
  reviewerRtRw?: string;
  createdAt: string;
}

export interface HunianItem {
  id: string;
  wargaId?: string;
  nama: string;
  tipe: 'Kos Putri' | 'Kos Putra' | 'Kos Campur' | 'Kontrakan Rumah';
  harga: number;
  periode: 'bulan' | 'tahun';
  alamat: string;
  deskripsi?: string;
  dusun?: string;
  rtRw?: string;
  lat: number;
  lng: number;
  sisaKamar: number;
  fasilitas: string[];
  pemilikNama: string;
  pemilikWa: string;
  qrisUrl?: string;
  fotoUrl: string;
  terverifikasi: boolean;
  createdAt: string;
}

export interface LokerItem {
  id: string;
  wargaId?: string;
  posisi: string;
  perusahaan: string;
  kodeReg?: string;
  nib?: string;
  companyLogoText?: string;
  mitraStatus?: string;
  tagVerifikasi?: string;
  kategori: 'Administrasi' | 'IT & Digital' | 'F&B / Kuliner' | 'Teknik & Bengkel' | 'Pendidikan' | 'Perdagangan & Retail' | 'Jasa Warga' | string;
  tipeKerja: 'Full-time' | 'Part-time' | 'Harian' | 'Freelance' | 'Magang' | string;
  distanceText?: string;
  gajiLabel?: string;
  gajiMin: number;
  gajiMax: number;
  gajiSubtext?: string;
  lokasi: string;
  lat: number;
  lng: number;
  pendidikan: string;
  pengalaman: string;
  syaratCv: boolean;
  ringkasan?: string;
  deskripsi: string[];
  tags?: string[];
  waktuKerja?: string;
  levelPekerjaan?: string;
  fasilitasUtama?: string;
  bidang?: string;
  alamatKantor?: string;
  batasPengajuan?: string;
  kuotaKebutuhan?: string;
  waktuProses?: string;
  deskripsiDetail?: string;
  tanggungJawab?: string[];
  persyaratan?: string[];
  benefits?: { title: string; desc: string; icon: string }[];
  waHrd: string;
  emailHrd?: string;
  disnakerVerified: boolean;
  tanggalPosting: string;
  jumlahPelamar: number;
  isJasaMitra?: boolean;
  createdAt: string;
}

export interface LamaranLoker {
  id: string;
  lokerId: string;
  lokerPosisi: string;
  lokerPerusahaan: string;
  pelamarNama: string;
  pelamarNik?: string;
  pelamarWa: string;
  pelamarEmail: string;
  pendidikanTerakhir?: string;
  cvFileName: string;
  cvFileUrl?: string;
  portofolioUrl?: string;
  portofolioFileName?: string;
  portofolioFileUrl?: string;
  catatan?: string;
  status: 'Terkirim' | 'Berkas Diterima HR - Wawancara Dijadwalkan' | 'Ditinjau' | 'Selesai Seleksi' | 'Diterima' | string;
  substatusText?: string;
  tanggalLamar: string;
  iconType?: 'building' | 'coffee' | 'tools' | 'briefcase';
}

export interface JobSeekerProfile {
  nama: string;
  nik: string;
  domisili: string;
  statusKerja: string;
  terakhirUpdate: string;
  email: string;
  telepon: string;
  avatarUrl?: string;
  cvUtama: {
    name: string;
    size: string;
    lastUpdated: string;
    atsPassed: boolean;
    fileUrl?: string;
  };
  berkasPendukung: Array<{
    id: string;
    judul: string;
    status: 'Valid' | 'Terverifikasi' | string;
    subjudul: string;
    noReg: string;
    icon: 'award' | 'graduation' | 'ribbon' | 'file';
    fileUrl?: string;
  }>;
  keahlian: string[];
  preferensi: {
    area: string;
    radius: string;
    gaji: string;
    gajiSub: string;
    tipe: string;
    tipeSub: string;
  };
}
