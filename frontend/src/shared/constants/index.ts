export const APP_NAME = 'Nexora';
export const VILLAGE_NAME = 'Kota Kediri';
export const DISTRICT_NAME = 'Kecamatan PATEN Kota Kediri';
export const REGENCY_NAME = 'Pemerintah Kota Kediri';

export const USER_ROLES = {
  ADMIN: 'admin',
  KECAMATAN: 'kecamatan',
  KABUPATEN_KOTA: 'kabupaten_kota',
  KADES: 'kades',
  SEKDES: 'sekdes',
  BENDAHARA_DESA: 'bendahara_desa',
  RW: 'rw',
  RT: 'rt',
  WARGA: 'warga',
} as const;

export const SURAT_STATUS = {
  PENDING_RT: 'pending_rt',
  PROCESSED_SEKDES: 'processed_sekdes',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
} as const;
