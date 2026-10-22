import { Berita, Pengumuman, DesaSetting, ApbdesSummary } from '@/shared/types';

export interface VillageStats {
  total_warga?: number;
  total_laki?: number;
  total_perempuan?: number;
  total_kk?: number;
  total_surat_selesai?: number;
  pkh_eligible?: number;
  total_dusun?: number;
  total_rw?: number;
  total_rt?: number;
  penduduk_total?: number;
  kepala_keluarga?: number;
  surat_selesai?: number;
  bansos_tersalurkan?: number;
}

export interface PublicHomeData {
  desa?: DesaSetting;
  beritas: Berita[];
  pengumumans: Pengumuman[];
  stats: VillageStats;
  apbdes?: ApbdesSummary;
}
