export interface Desa {
  id: number;
  nama_desa: string;
  kode_desa: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  kode_pos?: string;
  telepon?: string;
  email?: string;
  is_active?: boolean;
}

export interface Role {
  id: number;
  name: string;
  slug: string;
  display_name: string;
  description?: string;
}

export interface User {
  id: number;
  role_id: number;
  desa_id?: number | null;
  name: string;
  username: string;
  email: string;
  phone_number?: string;
  avatar?: string;
  is_active: boolean;
  role?: Role;
  desa?: Desa;
  warga_profile?: WargaProfile;
  rt?: Rt;
  rw?: Rw;
}

export interface DesaSetting {
  id: number;
  nama_desa: string;
  kode_desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kode_pos: string;
  alamat_kantor: string;
  telepon?: string;
  email?: string;
  website?: string;
  kop_atas: string;
  kop_tengah: string;
  kop_bawah: string;
  kop_footer: string;
  logo_desa_path?: string;
  logo_kabupaten_path?: string;
  nama_kades: string;
  nip_kades?: string;
  nama_sekdes: string;
  nip_sekdes?: string;
  ttd_kades_image?: string;
  stempel_desa_image?: string;
  visi?: string;
  misi?: string;
  struktur_organisasi_json?: any;
  territory_geojson?: string;
}

export interface Dusun {
  id: number;
  nama_dusun: string;
  kode_dusun?: string;
  kepala_dusun?: string;
}

export interface Rw {
  id: number;
  dusun_id: number;
  nomor_rw: string;
  kas_status?: 'active' | 'inactive' | string;
  dusun?: Dusun;
}

export interface Rt {
  id: number;
  rw_id: number;
  nomor_rt: string;
  rw?: Rw;
}

export interface KartuKeluarga {
  id: number;
  no_kk: string;
  nama_kepala_keluarga: string;
  rt_id: number;
  alamat_lengkap: string;
  no_telp_rumah?: string;
  rt?: Rt;
}

export interface WargaProfile {
  id: number;
  user_id?: number;
  kk_id?: number;
  rt_id: number;
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: 'L' | 'P';
  agama: string;
  status_perkawinan: string;
  pekerjaan?: string;
  pendidikan_terakhir?: string;
  golongan_darah?: string;
  no_hp_wa?: string;
  alamat?: string;
  alamat_ktp: string;
  foto_ktp?: string | null;
  status_keluarga: string;
  status_ekonomi: string;
  status_kependudukan: string;
  kartu_keluarga?: KartuKeluarga;
  rt?: Rt;
  user?: User;
}

export interface SuratType {
  id: number;
  kode_surat: string;
  nama_surat: string;
  format_nomor: string;
  kode_klasifikasi?: string;
  deskripsi?: string;
  template_body?: string;
  persyaratan_json?: string[];
  masa_berlaku_hari: number;
  is_active: boolean;
}

export interface SuratTracking {
  id: number;
  surat_request_id: number;
  actor_user_id?: number;
  status_stage: string;
  status_action: 'Diajukan' | 'Disetujui' | 'Ditolak' | 'Revisi' | 'Ditandatangani' | 'Selesai';
  catatan?: string;
  created_at: string;
  actor_user?: User;
}

export interface LampiranDokumen {
  url: string;
  nama: string;
  tipe?: string;
}

export interface SuratRequest {
  id: number;
  nomor_resi: string;
  warga_profile_id: number;
  surat_type_id: number;
  nomor_surat_resmi?: string;
  status: 'draft' | 'pending_rt' | 'approved_rt' | 'pending_rw' | 'approved_rw' | 'processed_sekdes' | 'pending_kades' | 'completed' | 'rejected' | 'rejected_rt' | 'rejected_kades' | 'needs_correction';
  keperluan: string;
  form_data_json?: Record<string, any>;
  file_lampiran?: string | LampiranDokumen[] | null;
  file_surat_pdf?: string;
  qr_verification_hash: string;
  ttd_sekdes_at?: string;
  ttd_kades_at?: string;
  catatan_penolakan?: string;
  catatan_penolakan_rt?: string;
  catatan_penolakan_sekdes?: string;
  catatan_penolakan_kades?: string;
  verification_notes?: string;
  snapshot_data?: Record<string, any>;
  processed_by_sekdes_id?: number;
  sekdes_processed_at?: string;
  approved_by_kades_id?: number;
  kades_approved_at?: string;
  kades_rejected_at?: string;
  created_at: string;
  updated_at?: string;
  surat_type?: SuratType;
  warga_profile?: WargaProfile;
  trackings?: SuratTracking[];
}

export interface ApbdesCategory {
  id: number;
  jenis: 'Pendapatan' | 'Belanja' | 'Pembiayaan';
  kode_rekening: string;
  nama_kategori: string;
}

export interface ApbdesRecord {
  id: number;
  category_id: number;
  tahun_anggaran: number;
  uraian: string;
  anggaran: number;
  realisasi: number;
  tanggal_realisasi?: string;
  category?: ApbdesCategory;
}

export interface ApbdesSummary {
  pendapatan?: { anggaran: number; realisasi: number; persen: number };
  belanja?: { anggaran: number; realisasi: number; persen: number };
  pembiayaan?: { anggaran: number; realisasi: number; persen?: number };
}

export interface KasRtCategory {
  id: number;
  rt_id: number;
  nama_kategori: string;
  tipe: 'Pemasukan' | 'Pengeluaran';
}

export interface KasRtTransaction {
  id: number;
  rt_id: number;
  category_id: number;
  warga_profile_id?: number;
  tanggal_transaksi: string;
  tipe: 'Pemasukan' | 'Pengeluaran';
  jumlah: number;
  keterangan: string;
  category?: KasRtCategory;
  warga_profile?: WargaProfile;
  created_by_user?: User;
}

export interface BantuanSosial {
  id: number;
  nama_bantuan: string;
  sumber_dana: string;
  tahun: number;
  tahap: string;
  kuota_penerima: number;
  nominal_per_penerima: number;
  tanggal_penyaluran: string;
  waktu_mulai?: string;
  lokasi_penyaluran: string;
  deskripsi?: string;
  status: 'draft' | 'published' | 'selesai';
  published_at?: string;
  total_terdaftar?: number;
  total_disalurkan?: number;
  penerimas?: BantuanPenerima[];
}

export interface BantuanPenerima {
  id: number;
  bantuan_sosial_id: number;
  warga_profile_id: number;
  kk_id?: number;
  nomor_antrean?: string;
  qr_bantuan_code: string;
  status_penyaluran: 'Terdaftar' | 'Siap Diambil' | 'Sudah Disalurkan';
  disalurkan_at?: string;
  warga_profile?: WargaProfile;
}

export interface PengaduanWarga {
  id: number;
  warga_profile_id: number;
  rt_id: number;
  kategori: string;
  judul: string;
  deskripsi: string;
  foto_lampiran?: string;
  status: string;
  disposisi_ke?: string;
  tanggapan?: string;
  riwayat_tanggapan?: any[];
  ditanggapi_at?: string;
  warga_profile?: WargaProfile;
  ditanggapi_by_user?: User;
  created_at: string;
}

export interface NotifikasiLog {
  id: number;
  user_id?: number;
  warga_profile_id?: number;
  nomor_tujuan: string;
  jenis_notifikasi: string;
  judul: string;
  pesan: string;
  status_pengiriman: string;
  created_at: string;
  warga_profile?: WargaProfile;
}

export interface Berita {
  id: number;
  judul: string;
  slug: string;
  kategori: string;
  ringkasan?: string;
  konten: string;
  gambar_cover?: string;
  view_count: number;
  is_published: boolean;
  published_at: string;
}

export interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  level_target: string;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  status?: 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected';
  is_active?: boolean;
  created_by_user_id?: number;
  approved_by_kades_id?: number;
  kades_approved_at?: string;
  kades_rejected_at?: string;
  catatan_penolakan_kades?: string;
  published_at?: string;
  creator?: User;
  kades_approver?: User;
  created_at?: string;
  updated_at?: string;
}
