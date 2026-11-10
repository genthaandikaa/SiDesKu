export const APP_NAME = 'SiDesKu';
export const VILLAGE_NAME = 'Kota Kediri';
export const DISTRICT_NAME = 'Kecamatan PATEN Kota Kediri';
export const REGENCY_NAME = 'Pemerintah Kota Kediri';

export const USER_ROLES = {
  ADMIN: 'admin',
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
