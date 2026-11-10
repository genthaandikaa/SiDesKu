export const DEFAULT_PAGE_SIZE = 8;

export const DASHBOARD_ROLES = [
  'admin',
  'kecamatan',
  'kabupaten_kota',
  'kades',
  'sekdes',
  'bendahara_desa',
  'rw',
  'rt',
  'warga',
] as const;

export const SURAT_TABS = {
  PROSES: 'proses',
  SELESAI: 'selesai',
  DITOLAK: 'ditolak',
  RIWAYAT: 'riwayat',
} as const;
