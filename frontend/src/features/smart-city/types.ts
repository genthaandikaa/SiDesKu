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

export interface HunianItem {
  id: string;
  wargaId?: string;
  nama: string;
  tipe: 'Kos Putri' | 'Kos Putra' | 'Kos Campur' | 'Kontrakan Rumah';
  harga: number;
  periode: 'bulan' | 'tahun';
  alamat: string;
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
  kategori: 'Administrasi' | 'IT & Digital' | 'F&B / Kuliner' | 'Teknik & Bengkel' | 'Pendidikan' | 'Perdagangan & Retail' | 'Jasa Warga';
  tipeKerja: 'Full-time' | 'Part-time' | 'Harian' | 'Freelance' | 'Magang';
  gajiMin: number;
  gajiMax: number;
  lokasi: string;
  lat: number;
  lng: number;
  pendidikan: string;
  pengalaman: string;
  syaratCv: boolean;
  deskripsi: string[];
  waHrd: string;
  emailHrd?: string;
  disnakerVerified: boolean;
  tanggalPosting: string;
  jumlahPelamar: number;
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
  pendidikanTerakhir: string;
  cvFileName: string;
  cvFileUrl?: string;
  catatan?: string;
  status: 'Terkirim' | 'Ditinjau' | 'Wawancara' | 'Diterima';
  tanggalLamar: string;
}
