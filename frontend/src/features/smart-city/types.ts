export interface UmkmItem {
  id: string;
  wargaId?: string;
  wargaNama?: string;
  nama: string;
  tokoNama: string;
  kategori: 'Kuliner' | 'Pertanian' | 'Kerajinan' | 'Jasa & Servis' | 'Sembako' | 'Fashion' | 'Lainnya';
  harga: number;
  satuan?: string;
  deskripsi: string;
  fotoUrl: string;
  alamat: string;
  lat: number;
  lng: number;
  waKontak: string;
  qrisUrl?: string;
  qrisNama?: string;
  metodePembayaran: {
    qris: boolean;
    cod: boolean;
    do: boolean; // Delivery Order
    transfer: boolean;
  };
  statusToko: 'Buka' | 'Tutup';
  rating: number;
  terjual: number;
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
