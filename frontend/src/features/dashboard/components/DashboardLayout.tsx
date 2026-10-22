import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Users, 
  DollarSign, 
  Bell, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  ChevronDown, 
  Award, 
  Settings, 
  ShieldCheck, 
  BellRing,
  Globe,
  CheckCircle2,
  Clock,
  Download,
  Newspaper,
  Calendar,
  User as UserIcon,
  Plus,
  TrendingUp,
  Building2,
  RefreshCw,
  HeartHandshake,
  Database,
  Lock,
  Activity,
  MapPin,
  FileCheck2,
  Layers,
  ChevronRight,
  QrCode,
  ArrowRight,
  Sliders,
  Target,
  UserPlus,
  FolderCheck,
  FileSpreadsheet,
  MessageSquare,
  Megaphone,
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { useAuth } from '@/shared/context/AuthContext';
import { BrandLogo } from '@/shared/components/BrandLogo';

// Role Dashboards (Code-split with React.lazy)
const WargaDashboard = React.lazy(() => import('./WargaDashboard').then((m) => ({ default: m.WargaDashboard })));
const RtDashboard = React.lazy(() => import('./RtDashboard').then((m) => ({ default: m.RtDashboard })));
const RwDashboard = React.lazy(() => import('./RwDashboard').then((m) => ({ default: m.RwDashboard })));
const SekdesDashboard = React.lazy(() => import('./SekdesDashboard').then((m) => ({ default: m.SekdesDashboard })));
const KadesDashboard = React.lazy(() => import('./KadesDashboard').then((m) => ({ default: m.KadesDashboard })));
const BendaharaDashboard = React.lazy(() => import('./BendaharaDashboard').then((m) => ({ default: m.BendaharaDashboard })));
const AdminDashboard = React.lazy(() => import('./AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const SuperAdminTenantView = React.lazy(() => import('./SuperAdminTenantView').then((m) => ({ default: m.SuperAdminTenantView })));
const BansosManager = React.lazy(() => import('./BansosManager').then((m) => ({ default: m.BansosManager })));
const KopSuratSetting = React.lazy(() => import('./KopSuratSetting').then((m) => ({ default: m.KopSuratSetting })));
const KadesStrukturVisiMisiView = React.lazy(() => import('./KadesStrukturVisiMisiView').then((m) => ({ default: m.KadesStrukturVisiMisiView })));
const PusatPesanView = React.lazy(() => import('./PusatPesanView').then((m) => ({ default: m.PusatPesanView })));

import { KeuanganDesaWargaView } from './KeuanganDesaWargaView';
import { AspirasiPengaduanWargaView } from './AspirasiPengaduanWargaView';
import { QrVerificationModal } from './QrVerificationModal';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { 
  PengumumanView, 
  AgendaDesaView, 
  ProfileSayaView, 
  NotifikasiView,
  NotificationItem 
} from './RoleDashboardViews';

interface NavGroup {
  title: string;
  items: {
    id: string;
    label: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
  }[];
}

export interface SuratTypeCatalogItem {
  id: number;
  kode_surat: string;
  nama_surat: string;
  persyaratan: string[];
  keywords: string[];
}

export const defaultSuratTypesCatalog: SuratTypeCatalogItem[] = [
  {
    id: 1,
    kode_surat: 'SKTP',
    nama_surat: 'Surat Pembuatan / E-KTP',
    persyaratan: ['KTP Lama', 'Kartu Keluarga (KK)', 'Surat Pengantar RT'],
    keywords: ['ktp', 'e-ktp', 'ektp', 'identitas', 'nik', 'foto ktp', 'rekam ktp', 'pembuatan ktp', 'ktp baru'],
  },
  {
    id: 2,
    kode_surat: 'SKKK',
    nama_surat: 'Surat Kartu Keluarga (KK Baru / Perubahan)',
    persyaratan: ['KK Asli Lama', 'Buku Nikah / Akta Cerai', 'Keterangan Lahir/Pindah'],
    keywords: ['kk', 'kartu keluarga', 'kk baru', 'tambah anggota', 'pecah kk', 'kepala keluarga'],
  },
  {
    id: 3,
    kode_surat: 'SKTM',
    nama_surat: 'Surat Keterangan Tidak Mampu (SKTM)',
    persyaratan: ['KTP Pemohon', 'Kartu Keluarga', 'Surat Pengantar RT'],
    keywords: ['sktm', 'tidak mampu', 'miskin', 'beasiswa', 'kip', 'bantuan', 'keringanan', 'rumah sakit', 'bansos'],
  },
  {
    id: 4,
    kode_surat: 'SKD',
    nama_surat: 'Surat Keterangan Domisili Warga / Lembaga',
    persyaratan: ['KTP', 'Kartu Keluarga'],
    keywords: ['skd', 'domisili', 'tempat tinggal', 'alamat', 'tinggal', 'pendatang', 'lembaga', 'usaha'],
  },
  {
    id: 5,
    kode_surat: 'SKU',
    nama_surat: 'Surat Keterangan Usaha (SKU)',
    persyaratan: ['KTP', 'Kartu Keluarga', 'Foto Tempat/Aktivitas Usaha'],
    keywords: ['sku', 'usaha', 'dagang', 'toko', 'warung', 'kredit', 'kur', 'bank', 'umkm', 'bisnis', 'jualan'],
  },
  {
    id: 6,
    kode_surat: 'SKCK',
    nama_surat: 'Surat Pengantar SKCK (Catatan Kepolisian)',
    persyaratan: ['KTP', 'Kartu Keluarga', 'Pas Foto 4x6'],
    keywords: ['skck', 'polisi', 'catatan kepolisian', 'kelakuan baik', 'lamaran kerja', 'cpns', 'bumn'],
  },
  {
    id: 7,
    kode_surat: 'SKL',
    nama_surat: 'Surat Kelahiran / Akta Lahir',
    persyaratan: ['Keterangan Lahir Bidan/RS', 'KTP Ayah & Ibu', 'Buku Nikah', 'KK'],
    keywords: ['skl', 'kelahiran', 'lahir', 'akta lahir', 'anak baru', 'bayi', 'melahirkan'],
  },
  {
    id: 8,
    kode_surat: 'SKM',
    nama_surat: 'Surat Kematian',
    persyaratan: ['Keterangan Kematian RS/RT', 'KTP & KK Almarhum', 'KTP Pelapor'],
    keywords: ['skm', 'kematian', 'meninggal', 'wafat', 'almarhum', 'meninggal dunia'],
  },
  {
    id: 9,
    kode_surat: 'SKBM',
    nama_surat: 'Surat Belum Pernah Menikah (N1-N4)',
    persyaratan: ['KTP Pemohon', 'KK Asli', 'Pernyataan Belum Menikah'],
    keywords: ['skbm', 'belum menikah', 'belum kawin', 'lajang', 'bujang', 'n1', 'n4', 'pernikahan', 'kua'],
  },
  {
    id: 10,
    kode_surat: 'SKP',
    nama_surat: 'Surat Pindah Domisili (SKPWNI)',
    persyaratan: ['KTP & KK Asli', 'Alamat Tujuan Lengkap'],
    keywords: ['skp', 'pindah', 'skpwni', 'pindah domisili', 'keluar desa', 'pindah kk'],
  },
  {
    id: 11,
    kode_surat: 'SKBN',
    nama_surat: 'Surat Beda Nama (Ijazah / KTP / KK)',
    persyaratan: ['KTP & KK Asli', 'Dokumen/Ijazah Beda Nama'],
    keywords: ['skbn', 'beda nama', 'ijazah', 'salah nama', 'pembetulan nama', 'ejaan'],
  },
  {
    id: 12,
    kode_surat: 'SKPH',
    nama_surat: 'Surat Penghasilan Orang Tua / Wali',
    persyaratan: ['KTP Orang Tua', 'KK Asli', 'Rincian Penghasilan / Slip Usaha'],
    keywords: ['skph', 'penghasilan', 'gaji', 'slip gaji', 'pendapatan', 'wali', 'uang kuliah', 'ukt'],
  },
  {
    id: 13,
    kode_surat: 'SKAW',
    nama_surat: 'Surat Keterangan Ahli Waris',
    persyaratan: ['Surat Kematian', 'Buku Nikah / Akta Cerai', 'KTP & KK Ahli Waris'],
    keywords: ['skaw', 'ahli waris', 'warisan', 'waris', 'tanah', 'sertifikat', 'pembagian waris'],
  },
  {
    id: 14,
    kode_surat: 'SKIK',
    nama_surat: 'Surat Izin Keramaian / Hajatan',
    persyaratan: ['KTP Tuan Rumah', 'Persetujuan Tetangga', 'Rekomendasi RT/RW'],
    keywords: ['skik', 'izin keramaian', 'keramaian', 'hajatan', 'mantu', 'pesta', 'hiburan', 'tontonan'],
  },
];

const DashboardLoadingFallback: React.FC = () => (
  <div className="min-h-[400px] flex flex-col items-center justify-center p-8 font-sans animate-fade-in">
    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
      <div className="w-6 h-6 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
    </div>
    <div className="text-sm font-black text-slate-800">Menyiapkan Dashboard...</div>
    <div className="text-xs text-slate-400 mt-1">Memuat modul kerja dan data terverifikasi</div>
  </div>
);

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(() => {
    try {
      const path = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') : '';
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
      const queryTab = searchParams.get('tab') || searchParams.get('menu');
      if (path.startsWith('/dashboard/ajukan')) return 'ajukan_surat';
      if (path.startsWith('/dashboard/berkas')) return 'berkas_kependudukan';
      if (path.startsWith('/dashboard/status-surat') || path.startsWith('/dashboard/status_surat')) return 'status_surat';
      if (path.startsWith('/dashboard/surat-selesai') || path.startsWith('/dashboard/surat_selesai')) return 'surat_selesai';
      if (path.startsWith('/dashboard/riwayat-surat') || path.startsWith('/dashboard/riwayat_surat')) return 'riwayat_surat';
      if (path.startsWith('/dashboard/pengumuman')) return 'pengumuman';
      if (path.startsWith('/dashboard/agenda')) return 'agenda_desa';
      if (path.startsWith('/dashboard/keuangan')) return 'keuangan_desa';
      if (path.startsWith('/dashboard/profil')) return 'profil_saya';
      if (path.startsWith('/dashboard/notifikasi')) return 'notifikasi';
      if (queryTab) return queryTab;
      const saved = localStorage.getItem('sides_active_dashboard_tab');
      if (saved) return saved;
    } catch (e) {
      // ignore
    }
    return 'beranda';
  });
  const [showQrModal, setShowQrModal] = useState(false);

  const handleMenuNavigate = (menuId: string) => {
    setActiveMenu(menuId);
    try {
      localStorage.setItem('sides_active_dashboard_tab', menuId);
    } catch (e) {
      // ignore
    }

    const pathToMenu: Record<string, string> = {
      beranda: '/dashboard',
      ajukan_surat: '/dashboard/ajukan',
      berkas_kependudukan: '/dashboard/berkas',
      status_surat: '/dashboard/status-surat',
      surat_selesai: '/dashboard/surat-selesai',
      riwayat_surat: '/dashboard/riwayat-surat',
      pengumuman: '/dashboard/pengumuman',
      buat_pengumuman: '/dashboard/pengumuman',
      agenda_desa: '/dashboard/agenda',
      agenda_rt: '/dashboard/agenda',
      agenda_rw: '/dashboard/agenda',
      keuangan_desa: '/dashboard/keuangan',
      profil_saya: '/dashboard/profil',
      notifikasi: '/dashboard/notifikasi',
      penomoran_surat: '/dashboard/penomoran-surat',
      buat_surat_baru: '/dashboard/buat-surat',
      data_kk: '/dashboard/data-kk',
      mutasi_penduduk: '/dashboard/mutasi-penduduk',
      kebijakan_desa: '/dashboard/kebijakan-desa',
      persetujuan_surat: '/dashboard/persetujuan-surat',
      persetujuan_pengumuman: '/dashboard/persetujuan-pengumuman',
      monitoring_surat: '/dashboard/monitoring-surat',
      pengawasan_apbdes: '/dashboard/pengawasan-apbdes',
      kebijakan_bansos: '/dashboard/otorisasi-bansos',
      aspirasi_warga: '/dashboard/aspirasi-warga',
      daftar_transaksi: '/dashboard/bku',
      input_transaksi: '/dashboard/input-transaksi',
      input_pemasukan: '/dashboard/input-transaksi',
      input_pengeluaran: '/dashboard/input-transaksi',
      realisasi_apbdes: '/dashboard/realisasi-apbdes',
      laporan_keuangan: '/dashboard/laporan-keuangan',
      publikasi_laporan: '/dashboard/publikasi-laporan',
      ekspor_laporan: '/dashboard/ekspor-laporan',
      kelola_desa: '/dashboard/kelola-desa',
      tambah_desa: '/dashboard/tambah-desa',
      statistik_sistem: '/dashboard/statistik-sistem',
      kelola_user: '/dashboard/kelola-user',
      atur_hak_akses: '/dashboard/atur-hak-akses',
      tambah_akun: '/dashboard/tambah-akun',
      log_aktivitas: '/dashboard/log-aktivitas',
      data_penduduk: '/dashboard/data-penduduk',
      semua_surat: '/dashboard/semua-surat',
      data_keuangan: '/dashboard/data-keuangan',
      pengaturan_desa: '/dashboard/pengaturan-desa',
      backup_data: '/dashboard/backup-data',
      keamanan: '/dashboard/keamanan',
    };

    if (pathToMenu[menuId]) {
      navigate(pathToMenu[menuId]);
    } else {
      navigate(`/dashboard?tab=${menuId}`);
    }

    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Synchronize browser URL & storage with active dashboard menu
  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '');
    const searchParams = new URLSearchParams(location.search);
    const queryTab = searchParams.get('tab') || searchParams.get('menu');

    let resolvedMenu = 'beranda';
    if (path.startsWith('/dashboard/kelola-desa')) {
      resolvedMenu = 'kelola_desa';
    } else if (path.startsWith('/dashboard/tambah-desa')) {
      resolvedMenu = 'tambah_desa';
    } else if (path.startsWith('/dashboard/statistik-sistem')) {
      resolvedMenu = 'statistik_sistem';
    } else if (path.startsWith('/dashboard/kelola-user')) {
      resolvedMenu = 'kelola_user';
    } else if (path.startsWith('/dashboard/atur-hak-akses')) {
      resolvedMenu = 'atur_hak_akses';
    } else if (path.startsWith('/dashboard/tambah-akun')) {
      resolvedMenu = 'kelola_user';
    } else if (path.startsWith('/dashboard/log-aktivitas')) {
      resolvedMenu = 'log_aktivitas';
    } else if (path.startsWith('/dashboard/data-penduduk')) {
      resolvedMenu = 'data_penduduk';
    } else if (path.startsWith('/dashboard/semua-surat')) {
      resolvedMenu = 'semua_surat';
    } else if (path.startsWith('/dashboard/data-keuangan')) {
      resolvedMenu = 'data_keuangan';
    } else if (path.startsWith('/dashboard/pengaturan-desa')) {
      resolvedMenu = 'pengaturan_desa';
    } else if (path.startsWith('/dashboard/backup-data')) {
      resolvedMenu = 'backup_data';
    } else if (path.startsWith('/dashboard/keamanan')) {
      resolvedMenu = 'keamanan';
    } else if (path.startsWith('/dashboard/ajukan')) {
      resolvedMenu = 'ajukan_surat';
    } else if (path.startsWith('/dashboard/berkas')) {
      resolvedMenu = 'berkas_kependudukan';
    } else if (path.startsWith('/dashboard/status-surat') || path.startsWith('/dashboard/status_surat')) {
      resolvedMenu = 'status_surat';
    } else if (path.startsWith('/dashboard/surat-selesai') || path.startsWith('/dashboard/surat_selesai')) {
      resolvedMenu = 'surat_selesai';
    } else if (path.startsWith('/dashboard/riwayat-surat') || path.startsWith('/dashboard/riwayat_surat')) {
      resolvedMenu = 'riwayat_surat';
    } else if (path.startsWith('/dashboard/penomoran-surat') || path.startsWith('/dashboard/penomoran_surat')) {
      resolvedMenu = 'penomoran_surat';
    } else if (path.startsWith('/dashboard/buat-surat') || path.startsWith('/dashboard/buat_surat')) {
      resolvedMenu = 'buat_surat_baru';
    } else if (path.startsWith('/dashboard/data-kk') || path.startsWith('/dashboard/data_kk')) {
      resolvedMenu = 'data_kk';
    } else if (path.startsWith('/dashboard/mutasi')) {
      resolvedMenu = 'mutasi_penduduk';
    } else if (path.startsWith('/dashboard/otorisasi-bansos') || path.startsWith('/dashboard/kebijakan-bansos') || path.startsWith('/dashboard/bansos')) {
      resolvedMenu = 'kebijakan_bansos';
    } else if (path.startsWith('/dashboard/persetujuan-surat')) {
      resolvedMenu = 'persetujuan_surat';
    } else if (path.startsWith('/dashboard/persetujuan-pengumuman')) {
      resolvedMenu = 'persetujuan_pengumuman';
    } else if (path.startsWith('/dashboard/kebijakan-desa') || path.startsWith('/dashboard/kebijakan')) {
      resolvedMenu = 'kebijakan_desa';
    } else if (path.startsWith('/dashboard/monitoring')) {
      resolvedMenu = 'monitoring_surat';
    } else if (path.startsWith('/dashboard/pengawasan')) {
      resolvedMenu = 'pengawasan_apbdes';
    } else if (path.startsWith('/dashboard/aspirasi')) {
      resolvedMenu = 'aspirasi_warga';
    } else if (path.startsWith('/dashboard/bku') || path.startsWith('/dashboard/daftar-transaksi')) {
      resolvedMenu = 'daftar_transaksi';
    } else if (path.startsWith('/dashboard/input-transaksi') || path.startsWith('/dashboard/input-pemasukan') || path.startsWith('/dashboard/input-pengeluaran')) {
      resolvedMenu = 'input_transaksi';
    } else if (path.startsWith('/dashboard/realisasi')) {
      resolvedMenu = 'realisasi_apbdes';
    } else if (path.startsWith('/dashboard/laporan')) {
      resolvedMenu = 'laporan_keuangan';
    } else if (path.startsWith('/dashboard/publikasi')) {
      resolvedMenu = 'publikasi_laporan';
    } else if (path.startsWith('/dashboard/ekspor')) {
      resolvedMenu = 'ekspor_laporan';
    } else if (path.startsWith('/dashboard/pengumuman')) {
      resolvedMenu = 'pengumuman';
    } else if (path.startsWith('/dashboard/agenda')) {
      if (roleSlug === 'rt') {
        resolvedMenu = 'agenda_rt';
      } else if (roleSlug === 'rw') {
        resolvedMenu = 'agenda_rw';
      } else {
        resolvedMenu = 'agenda_desa';
      }
    } else if (path.startsWith('/dashboard/keuangan')) {
      resolvedMenu = 'keuangan_desa';
    } else if (path.startsWith('/dashboard/profil')) {
      resolvedMenu = 'profil_saya';
    } else if (path.startsWith('/dashboard/notifikasi')) {
      resolvedMenu = 'notifikasi';
    } else if (queryTab) {
      resolvedMenu = queryTab.replace(/-/g, '_');
    } else if (path === '/dashboard' || path === '') {
      const saved = localStorage.getItem('sides_active_dashboard_tab');
      if (saved && saved !== 'beranda') {
        resolvedMenu = saved;
        navigate(`/dashboard?tab=${saved}`, { replace: true });
      }
    }

    setActiveMenu(resolvedMenu);
    try {
      localStorage.setItem('sides_active_dashboard_tab', resolvedMenu);
    } catch (e) {
      // ignore
    }
  }, [location.pathname, location.search]);

  // Interactive Notifications System (Dynamic & Role-Aware)
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: 'Portal Digital SiDesKu Aktif',
      desc: 'Pelayanan surat pengantar mandiri warga langsung terverifikasi oleh Ketua RT dan dilegalisasi tanda tangan QR resmi Kepala Desa.',
      time: 'Hari ini',
      category: 'umum',
      unread: false,
      meta: {
        actionLabel: 'Ajukan Permohonan Surat',
        targetMenu: 'buat_surat',
      },
    },
    {
      id: 2,
      title: 'Kanal Aspirasi & Suara Warga',
      desc: 'Sampaikan aspirasi pembangunan dan keluhan fasilitas lingkungan, langsung didisposisikan ke perangkat desa terkait.',
      time: 'Hari ini',
      category: 'aspirasi',
      unread: false,
      meta: {
        actionLabel: 'Buka Kanal Aspirasi',
        targetMenu: 'pengaduan',
      },
    },
  ]);

  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [isNotifDetailOpen, setIsNotifDetailOpen] = useState(false);

  // Dynamic Real-time Notifications Loader for Warga & Other Roles
  useEffect(() => {
    let isMounted = true;
    const fetchUserNotifications = async () => {
      try {
        const role = user?.role?.slug || 'warga';
        if (role === 'warga') {
          const [suratsRes, pengaduanRes] = await Promise.all([
            api.get('/warga/surats').catch(() => api.get('/surats')).catch(() => ({ data: [] })),
            api.get('/warga/pengaduan').catch(() => ({ data: [] })),
          ]);

          const rawSurats = suratsRes.data?.data || suratsRes.data || [];
          const rawPengaduan = pengaduanRes.data?.data || pengaduanRes.data || [];

          const dynamicNotifs: NotificationItem[] = [];
          let counter = 10;

          if (Array.isArray(rawSurats) && rawSurats.length > 0) {
            rawSurats.slice(0, 5).forEach((surat: any) => {
              const nama = surat.surat_type?.nama_surat || surat.jenis_surat || 'Surat Pengantar';
              if (surat.status === 'completed') {
                dynamicNotifs.push({
                  id: counter++,
                  title: 'Surat Disetujui & Diterbitkan',
                  desc: `${nama} telah selesai diproses dan disahkan tanda tangan QR resmi Kepala Desa.`,
                  time: surat.updated_at ? new Date(surat.updated_at).toLocaleDateString('id-ID') : 'Baru saja',
                  category: 'surat',
                  unread: true,
                  meta: {
                    nomorResi: surat.nomor_resi,
                    nomorSurat: surat.nomor_surat,
                    namaSurat: nama,
                    signedBy: 'Kepala Desa',
                    actionLabel: 'Buka Surat Selesai & Cetak',
                    targetMenu: 'surat_selesai',
                  },
                });
              } else if (surat.status === 'pending_kades') {
                dynamicNotifs.push({
                  id: counter++,
                  title: 'Disetujui Ketua RT - Menunggu Kades',
                  desc: `Pengajuan ${nama} telah diverifikasi RT dan sedang menunggu legalisasi QR resmi Kepala Desa.`,
                  time: surat.updated_at ? new Date(surat.updated_at).toLocaleDateString('id-ID') : 'Hari ini',
                  category: 'surat',
                  unread: true,
                  meta: {
                    nomorResi: surat.nomor_resi,
                    namaSurat: nama,
                    signedBy: 'Ketua RT Setempat',
                    actionLabel: 'Pantau Status Surat',
                    targetMenu: 'status_surat',
                  },
                });
              } else if (surat.status === 'rejected') {
                dynamicNotifs.push({
                  id: counter++,
                  title: 'Permohonan Surat Ditolak',
                  desc: `Permohonan ${nama} belum disetujui. ${surat.catatan_penolakan ? `Catatan: ${surat.catatan_penolakan}` : 'Silakan periksa kembali persyaratan pengajuan.'}`,
                  time: surat.updated_at ? new Date(surat.updated_at).toLocaleDateString('id-ID') : 'Hari ini',
                  category: 'surat',
                  unread: true,
                  meta: {
                    nomorResi: surat.nomor_resi,
                    namaSurat: nama,
                    actionLabel: 'Lihat Riwayat Surat',
                    targetMenu: 'riwayat_surat',
                  },
                });
              } else if (surat.status === 'pending_rt') {
                dynamicNotifs.push({
                  id: counter++,
                  title: 'Permohonan Surat Terkirim',
                  desc: `Permohonan ${nama} menunggu verifikasi pengantar dari Ketua RT.`,
                  time: surat.created_at ? new Date(surat.created_at).toLocaleDateString('id-ID') : 'Baru saja',
                  category: 'surat',
                  unread: false,
                  meta: {
                    nomorResi: surat.nomor_resi,
                    namaSurat: nama,
                    actionLabel: 'Pantau Status Berkas',
                    targetMenu: 'status_surat',
                  },
                });
              }
            });
          }

          if (Array.isArray(rawPengaduan) && rawPengaduan.length > 0) {
            rawPengaduan.slice(0, 3).forEach((item: any) => {
              if (item.disposisi_ke && item.status !== 'Selesai') {
                dynamicNotifs.push({
                  id: counter++,
                  title: `Didisposisikan ke ${item.disposisi_ke}`,
                  desc: `Aspirasi "${item.judul}" telah diteruskan ke ${item.disposisi_ke} untuk penanganan lapangan.`,
                  time: item.updated_at ? new Date(item.updated_at).toLocaleDateString('id-ID') : 'Baru saja',
                  category: 'aspirasi',
                  unread: true,
                  meta: {
                    namaSurat: item.judul,
                    actionLabel: 'Buka Aspirasi & Pengaduan',
                    targetMenu: 'pengaduan',
                  },
                });
              } else if (item.status === 'Selesai') {
                dynamicNotifs.push({
                  id: counter++,
                  title: 'Aspirasi Warga Tuntas Ditangani',
                  desc: `Aspirasi "${item.judul}" telah diselesaikan secara tuntas.`,
                  time: item.updated_at ? new Date(item.updated_at).toLocaleDateString('id-ID') : 'Baru saja',
                  category: 'aspirasi',
                  unread: false,
                  meta: {
                    namaSurat: item.judul,
                    actionLabel: 'Lihat Catatan Tanggapan',
                    targetMenu: 'pengaduan',
                  },
                });
              }
            });
          }

          if (isMounted && dynamicNotifs.length > 0) {
            setNotifications(dynamicNotifs);
          }
        }
      } catch {
        // preserve defaults
      }
    };

    fetchUserNotifications();
    return () => { isMounted = false; };
  }, [user?.id, user?.role?.slug]);

  // Lock body scroll and handle ESC key when notification modal is open
  useEffect(() => {
    if (isNotifDetailOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsNotifDetailOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isNotifDetailOpen]);

  const handleOpenNotifDetail = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
    );
    setSelectedNotif(notif);
    setIsNotificationsOpen(false);
    setIsNotifDetailOpen(true);
  };

  const profileRef = React.useRef<HTMLDivElement>(null);
  const notificationRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [suratsData, setSuratsData] = useState<any[]>([]);
  const [suratTypesCatalog, setSuratTypesCatalog] = useState<SuratTypeCatalogItem[]>(defaultSuratTypesCatalog);
  const [hasLoadedSurats, setHasLoadedSurats] = useState(false);
  const [isSearchingSurat, setIsSearchingSurat] = useState(false);

  const roleSlug = user?.role?.slug || 'warga';

  // Lazy fetch surats & surat-types catalog when search is focused/opened
  useEffect(() => {
    if (isSearchOpen && !hasLoadedSurats) {
      setIsSearchingSurat(true);
      Promise.all([
        api.get('/surats').catch(() => ({ data: [] })),
        api.get('/surat-types').catch(() => ({ data: [] })),
      ])
        .then(([suratRes, typeRes]) => {
          const rawSurats = suratRes.data?.data || suratRes.data || [];
          setSuratsData(Array.isArray(rawSurats) ? rawSurats : []);

          const rawTypes = typeRes.data?.data || typeRes.data || [];
          if (Array.isArray(rawTypes) && rawTypes.length > 0) {
            setSuratTypesCatalog(() => {
              return rawTypes.map((t: any) => {
                const matchDefault = defaultSuratTypesCatalog.find(
                  (d) => d.id === t.id || d.kode_surat.toLowerCase() === (t.kode_surat || '').toLowerCase()
                );
                return {
                  id: t.id,
                  kode_surat: t.kode_surat || matchDefault?.kode_surat || '',
                  nama_surat: t.nama_surat || matchDefault?.nama_surat || '',
                  persyaratan: t.persyaratan_json || matchDefault?.persyaratan || [],
                  keywords: [
                    ...(matchDefault?.keywords || []),
                    (t.nama_surat || '').toLowerCase(),
                    (t.kode_surat || '').toLowerCase(),
                  ],
                };
              });
            });
          }
          setHasLoadedSurats(true);
        })
        .catch(() => {
          setHasLoadedSurats(true);
        })
        .finally(() => {
          setIsSearchingSurat(false);
        });
    }
  }, [isSearchOpen, hasLoadedSurats]);

  // Global keyboard shortcut (Ctrl+K / Cmd+K and Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global click-outside listener to instantly close dropdowns with 1 click anywhere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // badge pengumuman logic
  const [unreadPengumumanCount, setUnreadPengumumanCount] = useState(0);

  useEffect(() => {
    const fetchUnreadPengumumanCount = async () => {
      try {
        const response = await api.get('/pengumuman/unread-count');
        if (response.data && typeof response.data.unread_count === 'number') {
          setUnreadPengumumanCount(response.data.unread_count);
        }
      } catch (error) {
        console.error('Error fetching unread pengumuman count:', error);
      }
    };

    fetchUnreadPengumumanCount();
  }, []);

  // badge & state chat pesan logic
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  useEffect(() => {
    const fetchChatUnreadCount = async () => {
      try {
        const response = await api.get('/chat/unread-count');
        if (response.data && typeof response.data.unread_count === 'number') {
          setChatUnreadCount(response.data.unread_count);
        }
      } catch (error) {
        // quiet fail
      }
    };

    fetchChatUnreadCount();
    const interval = setInterval(fetchChatUnreadCount, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleSideNav = (e: any) => {
      if (e.detail) {
        handleMenuNavigate(e.detail);
      }
    };
    window.addEventListener('sidesku-navigate-menu', handleSideNav);
    return () => window.removeEventListener('sidesku-navigate-menu', handleSideNav);
  }, []);

  // Build the exact grouped navigation tree for each role
  const getNavGroups = (): NavGroup[] => {
    switch (roleSlug) {
      case 'warga':
        return [
          {
            title: 'Surat & Layanan',
            items: [
              { id: 'beranda', label: 'Beranda', icon: Home },
              { id: 'ajukan_surat', label: 'Ajukan Surat', icon: Plus },
              { id: 'berkas_kependudukan', label: 'Berkas Kependudukan', icon: FolderCheck },
              { id: 'status_surat', label: 'Status Surat', icon: Clock },
              { id: 'surat_selesai', label: 'Surat Selesai', icon: Download },
              { id: 'riwayat_surat', label: 'Riwayat Surat', icon: FileText },
            ],
          },
          {
            title: 'Informasi Desa',
            items: [
              { id: 'pengumuman', label: 'Pengumuman', icon: Newspaper, badge: unreadPengumumanCount > 0 ? unreadPengumumanCount.toString() : '', badgeColor: 'bg-emerald-100 text-emerald-800' },
              { id: 'agenda_desa', label: 'Agenda Desa', icon: Calendar },
              { id: 'keuangan_desa', label: 'Keuangan Desa', icon: DollarSign },
              { id: 'aspirasi_warga', label: 'Aspirasi & Pengaduan', icon: MessageSquare },
            ],
          },
          {
            title: 'Akun & Komunikasi',
            items: [
              { id: 'pesan', label: 'Pusat Pesan & Chat', icon: MessageSquare, badge: chatUnreadCount > 0 ? chatUnreadCount.toString() : '', badgeColor: 'bg-emerald-600 text-white' },
              { id: 'profil_saya', label: 'Profil Saya', icon: UserIcon },
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
            ],
          },
        ];

      case 'rt':
        return [
          {
            title: 'Surat & Persetujuan',
            items: [
              { id: 'beranda', label: 'Beranda', icon: Home },
              { id: 'persetujuan_surat', label: 'Persetujuan Surat', icon: FileCheck2 },
              { id: 'riwayat_surat', label: 'Riwayat Surat', icon: Clock },
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
            ],
          },
          {
            title: 'Data Warga RT',
            items: [
              { id: 'data_warga', label: 'Data Warga RT', icon: Users },
              { id: 'data_keluarga', label: 'Data Keluarga', icon: Building2 },
              { id: 'peta_wilayah', label: 'Peta Wilayah RT', icon: MapPin },
              { id: 'kas_rt', label: 'Kas & Iuran RT', icon: DollarSign },
            ],
          },
          {
            title: 'Informasi & Akun',
            items: [
              { id: 'pesan', label: 'Pusat Pesan & Chat', icon: MessageSquare, badge: chatUnreadCount > 0 ? chatUnreadCount.toString() : '', badgeColor: 'bg-emerald-600 text-white' },
              { id: 'pengumuman', label: 'Pengumuman', icon: Newspaper },
              { id: 'agenda_rt', label: 'Agenda RT', icon: Calendar },
              { id: 'profil_saya', label: 'Profil Akun', icon: UserIcon },
            ],
          },
        ];

      case 'rw':
        return [
          {
            title: 'Monitoring Wilayah',
            items: [
              { id: 'beranda', label: 'Beranda', icon: Home },
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
              { id: 'daftar_rt', label: 'Daftar RT', icon: Layers },
              { id: 'data_warga_rw', label: 'Data Warga RW', icon: Users },
              { id: 'data_keluarga_rw', label: 'Data Keluarga (KK)', icon: Building2 },
              { id: 'peta_wilayah_rw', label: 'Peta Wilayah RW', icon: MapPin },
              ...(user?.rw?.kas_status === 'active' ? [
                { id: 'kas_rw', label: 'Kas & Iuran RW', icon: DollarSign },
              ] : []),
              { id: 'rekap_statistik', label: 'Rekap Statistik', icon: TrendingUp },
            ],
          },
          {
            title: 'Informasi & Akun',
            items: [
              { id: 'pesan', label: 'Pusat Pesan & Chat', icon: MessageSquare, badge: chatUnreadCount > 0 ? chatUnreadCount.toString() : '', badgeColor: 'bg-emerald-600 text-white' },
              { id: 'pengumuman', label: 'Pengumuman', icon: Newspaper },
              { id: 'agenda_rw', label: 'Agenda RW', icon: Calendar },
              { id: 'profil_saya', label: 'Profil Akun', icon: UserIcon },
            ],
          },
        ];

      case 'sekdes':
        return [
          {
            title: 'Administrasi Surat',
            items: [
              { id: 'beranda', label: 'Beranda', icon: Home },
              { id: 'arsip_surat', label: 'Arsip Surat Sah', icon: FileText },
              { id: 'penomoran_surat', label: 'Format & No. Surat', icon: Sliders },
              { id: 'buat_surat_baru', label: 'Buat Surat Baru', icon: Plus },
              { id: 'template_surat', label: 'Template Surat & Kop', icon: Settings },
            ],
          },
          {
            title: 'Data Kependudukan',
            items: [
              { id: 'data_warga', label: 'Data Warga', icon: Users },
              { id: 'data_kk', label: 'Data KK', icon: Building2 },
              { id: 'mutasi_penduduk', label: 'Mutasi Penduduk', icon: RefreshCw },
              { id: 'peta_desa', label: 'Peta Wilayah Desa', icon: MapPin },
            ],
          },
          {
            title: 'Informasi & Penyaluran',
            items: [
              { id: 'pesan', label: 'Pusat Pesan & Chat', icon: MessageSquare, badge: chatUnreadCount > 0 ? chatUnreadCount.toString() : '', badgeColor: 'bg-emerald-600 text-white' },
              { id: 'agenda_desa', label: 'Agenda & Notulensi Desa', icon: Calendar },
              { id: 'pengumuman', label: 'Pengumuman Desa', icon: Newspaper },
              { id: 'bansos_manager', label: 'Bansos Manager', icon: HeartHandshake },
              { id: 'visi_misi', label: 'Visi & Misi Desa', icon: Target },
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell, badge: '4', badgeColor: 'bg-emerald-100 text-emerald-800' },
              { id: 'profil_saya', label: 'Profil Akun', icon: UserIcon },
            ],
          },
        ];

      case 'kades':
        return [
          {
            title: 'Pimpinan Eksekutif',
            items: [
              { id: 'beranda', label: 'Beranda', icon: Home },
              { id: 'persetujuan_surat', label: 'Persetujuan Surat', icon: FileCheck2 },
              { id: 'persetujuan_pengumuman', label: 'Persetujuan Pengumuman', icon: Megaphone },
              { id: 'kebijakan_desa', label: 'SK Kades', icon: ShieldCheck },
              { id: 'visi_misi', label: 'Visi & Misi Desa', icon: Target },
            ],
          },
          {
            title: 'Pengawasan & Kebijakan',
            items: [
              { id: 'pengawasan_apbdes', label: 'Pengawasan APBDes', icon: DollarSign },
              { id: 'kebijakan_bansos', label: 'Kebijakan Bansos', icon: HeartHandshake },
              { id: 'aspirasi_warga', label: 'Aspirasi & Pengaduan', icon: MessageSquare },
              { id: 'peta_desa', label: 'Peta Wilayah Desa', icon: MapPin },
            ],
          },
          {
            title: 'Informasi & Akun',
            items: [
              { id: 'pesan', label: 'Pusat Pesan & Chat', icon: MessageSquare, badge: chatUnreadCount > 0 ? chatUnreadCount.toString() : '', badgeColor: 'bg-emerald-600 text-white' },
              { id: 'agenda_desa', label: 'Agenda Kegiatan Desa', icon: Calendar },
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
              { id: 'profil_saya', label: 'Profil Akun', icon: UserIcon },
            ],
          },
        ];

      case 'bendahara_desa':
        return [
          {
            title: 'Buku Kas Umum (BKU)',
            items: [
              { id: 'beranda', label: 'Dashboard', icon: Home },
              { id: 'daftar_transaksi', label: 'Buku Kas Umum (BKU)', icon: FileSpreadsheet },
              { id: 'input_transaksi', label: 'Pencatatan Kas Desa', icon: Plus },
            ],
          },
          {
            title: 'APBDes & Pertanggungjawaban',
            items: [
              { id: 'realisasi_apbdes', label: 'Realisasi APBDes', icon: TrendingUp },
              { id: 'laporan_keuangan', label: 'Laporan Keuangan', icon: FileCheck2 },
              { id: 'publikasi_laporan', label: 'Publikasi Laporan Keuangan', icon: Globe },
              { id: 'ekspor_laporan', label: 'Ekspor Laporan Keuangan', icon: Download },
            ],
          },
          {
            title: 'Akun & Notifikasi',
            items: [
              { id: 'pesan', label: 'Pusat Pesan & Chat', icon: MessageSquare, badge: chatUnreadCount > 0 ? chatUnreadCount.toString() : '', badgeColor: 'bg-emerald-600 text-white' },
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
              { id: 'profil_saya', label: 'Profil Akun', icon: UserIcon },
            ],
          },
        ];

      case 'admin':
      case 'admin_desa':
        return [
          {
            title: 'Tata Kelola Administrator',
            items: [
              { id: 'beranda', label: 'Dashboard', icon: Home },
              { id: 'statistik_sistem', label: 'Statistik Sistem', icon: Activity },
              { id: 'kelola_user', label: 'Kelola User', icon: Users },
              { id: 'atur_hak_akses', label: 'Hak Akses', icon: ShieldCheck },
              { id: 'log_aktivitas', label: 'Log Aktivitas', icon: Clock },
            ],
          },
          {
            title: 'Data & Layanan Desa',
            items: [
              { id: 'pesan', label: 'Pusat Pesan & Chat', icon: MessageSquare, badge: chatUnreadCount > 0 ? chatUnreadCount.toString() : '', badgeColor: 'bg-emerald-600 text-white' },
              { id: 'data_penduduk', label: 'Data Penduduk', icon: Users },
              { id: 'semua_surat', label: 'Semua Pengajuan Surat', icon: FileText },
              { id: 'data_keuangan', label: 'Data Keuangan & APBDes', icon: DollarSign },
              { id: 'pengumuman', label: 'Pengumuman & Warta', icon: Newspaper },
            ],
          },
          {
            title: 'Konfigurasi & Keamanan',
            items: [
              { id: 'pengaturan_desa', label: 'Identitas & Kop Surat', icon: Settings },
              { id: 'visi_misi', label: 'Visi & Misi Desa', icon: Target },
              { id: 'backup_data', label: 'Backup & Restore Data', icon: Database },
              { id: 'keamanan', label: 'Keamanan', icon: Lock },
              { id: 'profil_saya', label: 'Profil Administrator', icon: UserIcon },
            ],
          },
        ];

      case 'super_admin':
        return [
          {
            title: 'Platform Multi-Desa',
            items: [
              { id: 'beranda', label: 'Dashboard', icon: Home },
              { id: 'kelola_desa', label: 'Kelola Desa', icon: Building2, badgeColor: 'bg-rose-100 text-rose-800' },
              { id: 'tambah_desa', label: 'Daftarkan Desa Baru', icon: Plus, badge: 'Baru', badgeColor: 'bg-emerald-100 text-emerald-800' },
            ],
          },
          {
            title: 'Tata Kelola Global',
            items: [
              { id: 'pesan', label: 'Pusat Pesan & Chat', icon: MessageSquare, badge: chatUnreadCount > 0 ? chatUnreadCount.toString() : '', badgeColor: 'bg-emerald-600 text-white' },
              { id: 'kelola_user', label: 'Mastes Pengguna', icon: Users },
              { id: 'atur_hak_akses', label: 'Hak Akses', icon: ShieldCheck },
              { id: 'log_aktivitas', label: 'Log Aktivitas', icon: Clock },
            ],
          },
          {
            title: 'Infrastruktur & Keamanan',
            items: [
              { id: 'statistik_sistem', label: 'Statistik Sistem', icon: Activity },
              { id: 'backup_data', label: 'Recovery / Backup', icon: Database },
              { id: 'keamanan', label: 'Keamanan Sistem', icon: Lock },
              { id: 'profil_saya', label: 'Profil', icon: UserIcon },
            ],
          },
        ];

      default:
        return [
          {
            title: 'Menu Utama',
            items: [{ id: 'beranda', label: 'Beranda', icon: Home }],
          },
        ];
    }
  };

  const navGroups = getNavGroups();

  // Flatten all navigation items from all groups for search
  const allNavItems = React.useMemo(() => {
    return navGroups.flatMap(group => 
      group.items.map(item => ({
        ...item,
        groupTitle: group.title,
      }))
    );
  }, [navGroups]);

  // Keyword dictionary for robust search matching across all roles
  const getNavKeywords = (id: string): string[] => {
    const map: Record<string, string[]> = {
      beranda: ['home', 'dashboard', 'utama'],
      pesan: ['pesan', 'chat', 'obrolan', 'kontak', 'kades', 'sekdes', 'rt', 'rw', 'komunikasi', 'kirim'],
      ajukan_surat: ['surat', 'ajukan', 'buat', 'layanan', 'permohonan', 'sktm', 'sku', 'domisili', 'ktp', 'kk'],
      berkas_kependudukan: ['berkas', 'ktp', 'kk', 'akta', 'nikah', 'dokumen', 'master', 'arsip', 'kependudukan'],
      status_surat: ['status', 'surat', 'pantau', 'resi', 'lacak', 'antrean', 'proses'],
      surat_selesai: ['selesai', 'sah', 'unduh', 'cetak', 'download', 'qr', 'ttd', 'surat'],
      riwayat_surat: ['riwayat', 'surat', 'arsip', 'lampau', 'tolak', 'selesai', 'monitoring'],
      pengumuman: ['pengumuman', 'warta', 'berita', 'kabar', 'informasi'],
      buat_pengumuman: ['buat', 'tulis', 'pengumuman', 'warta', 'berita', 'publikasi'],
      persetujuan_pengumuman: ['persetujuan', 'acc', 'pengumuman', 'kades', 'warta'],
      agenda_desa: ['agenda', 'jadwal', 'acara', 'kegiatan', 'notulensi', 'rapat'],
      agenda_rt: ['agenda', 'jadwal', 'acara', 'kegiatan', 'rt'],
      agenda_rw: ['agenda', 'jadwal', 'acara', 'kegiatan', 'rw'],
      keuangan_desa: ['keuangan', 'apbdes', 'transparansi', 'dana', 'anggaran', 'kas'],
      aspirasi_warga: ['aspirasi', 'pengaduan', 'lapor', 'keluhan', 'aduan', 'komplain'],
      profil_saya: ['profil', 'akun', 'password', 'nama', 'email', 'nohp', 'biodata'],
      notifikasi: ['notifikasi', 'pemberitahuan', 'pesan', 'lonceng', 'alert'],
      persetujuan_surat: ['persetujuan', 'acc', 'surat', 'setujui', 'tolak', 'ttd', 'verifikasi'],
      proses_surat: ['proses', 'surat', 'sekdes', 'nomor', 'stempel', 'qr', 'cetak', 'verifikasi'],
      penomoran_surat: ['nomor', 'format', 'penomoran', 'klasifikasi', 'kode', 'setting'],
      buat_surat_baru: ['buat', 'surat', 'langsung', 'mandiri', 'perangkat'],
      arsip_surat: ['arsip', 'surat', 'sah', 'riwayat', 'dokumen'],
      template_surat: ['template', 'kop', 'format', 'surat', 'desain'],
      data_warga: ['data', 'warga', 'penduduk', 'nik', 'registrasi', 'nama', 'ktp'],
      data_warga_rw: ['data', 'warga', 'rw', 'penduduk', 'nik'],
      data_keluarga: ['data', 'keluarga', 'kk', 'nomor kk', 'kepala keluarga'],
      data_keluarga_rw: ['data', 'keluarga', 'kk', 'nomor kk', 'rw'],
      data_kk: ['data', 'kk', 'kartu keluarga', 'nomor kk', 'anggota keluarga'],
      mutasi_penduduk: ['mutasi', 'pindah', 'datang', 'lahir', 'meninggal', 'penduduk'],
      peta_wilayah: ['peta', 'wilayah', 'gis', 'lokasi', 'denah'],
      peta_wilayah_rw: ['peta', 'wilayah', 'rw', 'gis'],
      peta_desa: ['peta', 'wilayah', 'desa', 'gis'],
      kas_rt: ['kas', 'iuran', 'keuangan', 'saldo', 'rt', 'setoran'],
      kas_rw: ['kas', 'iuran', 'keuangan', 'saldo', 'rw'],
      daftar_rt: ['daftar', 'rt', 'koordinasi', 'wilayah'],
      rekap_statistik: ['rekap', 'statistik', 'grafik', 'demografi'],
      kebijakan_desa: ['sk', 'kades', 'kebijakan', 'surat keputusan', 'kepala desa'],
      pengawasan_apbdes: ['pengawasan', 'apbdes', 'pkpkd', 'anggaran', 'realisasi', 'keuangan'],
      kebijakan_bansos: ['bansos', 'bantuan', 'blt', 'pkh', 'otorisasi', 'kades'],
      bansos_manager: ['bansos', 'bantuan', 'whatsapp', 'penerima', 'blt', 'pkh'],
      daftar_transaksi: ['transaksi', 'bku', 'buku kas umum', 'kas', 'pembukuan'],
      input_transaksi: ['input', 'transaksi', 'tambah', 'pemasukan', 'pengeluaran', 'kas'],
      realisasi_apbdes: ['realisasi', 'apbdes', 'persentase', 'anggaran', 'keuangan'],
      laporan_keuangan: ['laporan', 'keuangan', 'pertanggungjawaban', 'lpj', 'bku'],
      publikasi_laporan: ['publikasi', 'laporan', 'portal', 'transparansi'],
      ekspor_laporan: ['ekspor', 'cetak', 'excel', 'pdf', 'bku', 'laporan'],
      statistik_sistem: ['statistik', 'sistem', 'telemetri', 'server', 'pengguna'],
      kelola_user: ['kelola', 'pengguna', 'user', 'akun', 'tambah akun', 'role'],
      atur_hak_akses: ['hak akses', 'matrix', 'rbac', 'role', 'izin'],
      log_aktivitas: ['log', 'aktivitas', 'audit', 'trail', 'riwayat akses'],
      data_penduduk: ['data', 'penduduk', 'warga', 'kependudukan', 'nik'],
      semua_surat: ['semua', 'surat', 'pengajuan', 'rekap', 'administrasi'],
      data_keuangan: ['data', 'keuangan', 'apbdes', 'anggaran'],
      pengaturan_desa: ['pengaturan', 'desa', 'identitas', 'kop', 'profil desa'],
      backup_data: ['backup', 'restore', 'cadangan', 'database'],
      keamanan: ['keamanan', 'diagnostik', 'security', 'enkripsi', 'sesi'],
      kelola_desa: ['kelola', 'desa', 'tenant', 'multi-desa'],
      tambah_desa: ['tambah', 'desa', 'daftar desa', 'tenant baru'],
    };
    return map[id] || [];
  };

  const filteredNavItems = React.useMemo(() => {
    if (!searchQuery.trim()) return allNavItems.slice(0, 5);
    const q = searchQuery.toLowerCase().trim();
    return allNavItems.filter((item) => {
      const labelMatch = item.label.toLowerCase().includes(q);
      const groupMatch = item.groupTitle.toLowerCase().includes(q);
      const keywords = getNavKeywords(item.id);
      const keywordMatch = keywords.some((k) => k.includes(q) || q.includes(k));
      return labelMatch || groupMatch || keywordMatch;
    });
  }, [allNavItems, searchQuery]);

  const filteredSurats = React.useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return suratsData.filter((s: any) => {
      const resiMatch = (s.nomor_resi || '').toLowerCase().includes(q);
      const suratNoMatch = (s.nomor_surat || '').toLowerCase().includes(q);
      const namaSuratMatch = (s.surat_type?.nama_surat || s.nama_surat || '').toLowerCase().includes(q);
      const pemohonMatch = (s.user?.name || s.pemohon_nama || '').toLowerCase().includes(q);
      const nikMatch = (s.user?.nik || s.pemohon_nik || '').toLowerCase().includes(q);
      const keperluanMatch = (s.keperluan || '').toLowerCase().includes(q);
      return resiMatch || suratNoMatch || namaSuratMatch || pemohonMatch || nikMatch || keperluanMatch;
    }).slice(0, 5);
  }, [suratsData, searchQuery]);

  // Filter letter types catalog for applying letters (SKU, SKTM, KTP, etc.)
  const filteredSuratTypes = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return suratTypesCatalog.filter((item) => {
      const matchKode = item.kode_surat.toLowerCase().includes(q);
      const matchNama = item.nama_surat.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some((k) => k.includes(q) || q.includes(k));
      const matchSyarat = item.persyaratan.some((p) => p.toLowerCase().includes(q));
      return matchKode || matchNama || matchKeywords || matchSyarat;
    });
  }, [suratTypesCatalog, searchQuery]);

  const handleSelectSuratType = (suratType: SuratTypeCatalogItem) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    if (roleSlug === 'warga') {
      navigate(`/dashboard/ajukan/${suratType.id}`);
    } else {
      handleMenuNavigate('ajukan_surat');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Render proper subviews depending on activeMenu
  const renderContent = () => {
    // 1. Shared views
    if (activeMenu === 'pengumuman' || activeMenu === 'buat_pengumuman') {
      return (
        <PengumumanView 
          canCreate={['admin', 'admin_desa', 'super_admin', 'sekdes', 'kades'].includes(roleSlug)} 
          initialOpenCreate={false} 
        />
      );
    }
    if (activeMenu === 'agenda_desa' || activeMenu === 'agenda_rt' || activeMenu === 'agenda_rw') return <AgendaDesaView />;
    if (activeMenu === 'pesan' || activeMenu === 'chat') {
      return (
        <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Memuat Pusat Pesan Desa...</div>}>
          <PusatPesanView />
        </React.Suspense>
      );
    }
    if (activeMenu === 'profil_saya' || activeMenu === 'profil') return <ProfileSayaView />;
    if (activeMenu === 'notifikasi') {
      return (
        <NotifikasiView 
          notifications={notifications} 
          onSelectNotification={(n) => handleOpenNotifDetail(n)} 
        />
      );
    }

    // 2. Specific Views
    if (activeMenu === 'kelola_desa' || activeMenu === 'tambah_desa') {
      return <SuperAdminTenantView initialAction={activeMenu === 'tambah_desa' ? 'create' : 'list'} onNavigate={handleMenuNavigate} />;
    }
    if (activeMenu === 'template_surat' || activeMenu === 'pengaturan_desa') return <KopSuratSetting />;
    if (['visi_misi', 'struktur_desa', 'struktur_pemerintahan', 'visi'].includes(activeMenu)) return <KadesStrukturVisiMisiView />;
    if (activeMenu === 'bansos_manager' && roleSlug !== 'kades') return <BansosManager />;
    if (activeMenu === 'keuangan_desa' || activeMenu === 'data_keuangan') {
      if (roleSlug === 'warga') return <KeuanganDesaWargaView />;
      if (roleSlug !== 'kades' && roleSlug !== 'admin' && roleSlug !== 'admin_desa' && roleSlug !== 'super_admin') return <BendaharaDashboard />;
    }
    if (activeMenu === 'aspirasi_warga' || activeMenu === 'pengaduan') {
      if (roleSlug === 'warga') return <AspirasiPengaduanWargaView />;
    }

    // 3. Primary Role Dashboards
    if (roleSlug === 'warga') return <WargaDashboard activeSubmenu={activeMenu} onNavigate={handleMenuNavigate} />;
    if (roleSlug === 'rt') return <RtDashboard activeSubmenu={activeMenu} onNavigate={handleMenuNavigate} />;
    if (roleSlug === 'rw') return <RwDashboard activeSubmenu={activeMenu} onNavigate={handleMenuNavigate} />;
    if (roleSlug === 'bendahara_desa') return <BendaharaDashboard activeSubmenu={activeMenu} />;
    if (roleSlug === 'kades') return <KadesDashboard activeSubmenu={activeMenu} onNavigate={handleMenuNavigate} />;
    if (roleSlug === 'admin' || roleSlug === 'admin_desa' || roleSlug === 'super_admin') {
      return <AdminDashboard activeSubmenu={activeMenu} onNavigate={handleMenuNavigate} />;
    }
    return <SekdesDashboard activeSubmenu={activeMenu} />;
  };

  const displayName = user?.warga_profile?.nama_lengkap || user?.name || user?.username || 'Pengguna';

  return (
    <div className="min-h-screen bg-[#f4f8f5] flex text-[#0f241d] font-sans relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#0f241d]/40 z-40 lg:hidden backdrop-blur-sm animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Modern Sidebar with Role-Specific Tree - Fixed on Desktop */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-72 h-screen max-h-screen
        bg-white border-r border-[#e2ebe4] 
        flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0 z-50' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header Branding (h-16 matches topbar perfectly) */}
        <div className="h-16 flex items-center px-6 border-b border-[#e8efe9] justify-between shrink-0">
          <Link to="/" className="hover:opacity-95 transition-opacity">
            <BrandLogo size="md" />
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
            aria-label="Tutup Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Grouped Navigation items */}
        <div className="flex-1 overflow-y-auto py-4 px-3.5 space-y-5 min-h-0">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 mb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                {group.title}
              </div>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id || 
                  (item.id.startsWith('agenda_') && activeMenu.startsWith('agenda_'));
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-extrabold text-xs transition-all press-down ${
                      isActive 
                        ? 'bg-emerald-700 text-white shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-white/20 text-white' : (item.badgeColor || 'bg-emerald-100 text-emerald-800')
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Promotional Highlight Box (Level Up Your Desa System) */}
        {/* Sidebar Footer */}
        <div className="p-4 space-y-2 border-t border-[#e8efe9] shrink-0 bg-white">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-emerald-900 bg-emerald-50 hover:bg-emerald-100 font-extrabold text-xs transition-colors border border-emerald-200 shadow-2xs"
          >
            <Globe size={14} />
            <span>Lihat Halaman Publik</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-rose-600 font-extrabold text-xs hover:bg-rose-50 transition-colors press-down"
          >
            <LogOut size={14} />
            <span>Keluar Akun (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - Left padded on desktop for fixed sidebar, top padded for fixed header */}
      <main className="flex-1 w-full min-w-0 lg:pl-72 pt-16 min-h-screen flex flex-col bg-[#f4f8f5]">
        {/* Fixed Topbar Header */}
        <header className="fixed top-0 right-0 left-0 lg:left-72 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-[#e2ebe4] flex items-center justify-between px-4 lg:px-8 shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 mr-2 sm:mr-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-2xl cursor-pointer shrink-0"
              aria-label="Open Sidebar"
            >
              <Menu size={20} />
            </button>
            
            {/* Unified Global Search Bar (Mobile & Desktop for all roles) */}
            <div className="relative flex-1 max-w-xs sm:max-w-md lg:max-w-lg min-w-0" ref={searchRef}>
              <div className="relative flex items-center">
                <Search className="absolute left-3 sm:left-3.5 text-slate-400 pointer-events-none" size={14} />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!isSearchOpen) setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Cari menu, surat, NIK warga..." 
                  className="w-full pl-8 sm:pl-9 pr-8 sm:pr-14 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-2xs transition-all"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <X size={12} />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex absolute right-2.5 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs pointer-events-none">
                    ⌘K
                  </kbd>
                )}
              </div>

              {/* Search Results Attached Dropdown (No Double Modal & Clean Layout) */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 sm:min-w-[440px] md:min-w-[500px] lg:min-w-[540px] mt-2 z-50 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[72vh] flex flex-col font-sans animate-slide-down">
                  {/* Scrollable Results Area */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-3 space-y-3 min-h-0">
                      
                      {/* KONDISI 1: Belum Mengetik (Saran Cepat & Menu Populer) */}
                      {!searchQuery.trim() && (
                        <div className="space-y-3">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1 flex items-center gap-1.5">
                              <span>PKlik untuk Cari:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { label: 'Surat Keterangan Usaha (SKU)', q: 'SKU' },
                                { label: 'Surat Tidak Mampu (SKTM)', q: 'SKTM' },
                                { label: 'Surat Domisili (SKD)', q: 'Domisili' },
                                { label: 'Surat E-KTP (SKTP)', q: 'KTP' },
                                { label: 'Kartu Keluarga (SKKK)', q: 'Kartu Keluarga' },
                                { label: 'Surat Pengantar SKCK', q: 'SKCK' },
                                { label: 'Master Berkas Kependudukan', q: 'Berkas' },
                                { label: 'Status Surat Berjalan', q: 'Status' },
                                { label: 'Pengumuman Resmi', q: 'Pengumuman' },
                              ].map((chip, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setSearchQuery(chip.q)}
                                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-100/70 text-slate-700 hover:text-emerald-900 font-bold text-[11px] transition-colors cursor-pointer border border-slate-200/70"
                                >
                                  {chip.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 px-1">
                              Navigasi Menu Cepat
                            </div>
                            <div className="space-y-1">
                              {allNavItems.slice(0, 6).map((item) => {
                                const IconComponent = item.icon || FileText;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => {
                                      handleMenuNavigate(item.id);
                                      setSearchQuery('');
                                      setIsSearchOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center shrink-0 transition-colors">
                                        <IconComponent size={14} />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-xs font-black text-slate-800 group-hover:text-emerald-800 truncate">
                                          {item.label}
                                        </div>
                                        <div className="text-[10px] text-slate-400 truncate">
                                          {item.groupTitle}
                                        </div>
                                      </div>
                                    </div>
                                    <ArrowRight size={12} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* KONDISI 2: Sudah Mengetik -> TAMPILKAN HASIL TERORGANISIR */}
                      {searchQuery.trim() && (
                        <>
                          {/* 1. SEKSI KATALOG SURAT UNTUK DIAJUKAN */}
                          {filteredSuratTypes.length > 0 && (
                            <div className="space-y-1.5 pb-2">
                              <div className="px-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <Plus size={12} className="text-emerald-600" />
                                  <span>Katalog Pengajuan Surat ({filteredSuratTypes.length})</span>
                                </span>
                                <span className="text-[9px] text-slate-400">Klik untuk langsung membuka form</span>
                              </div>
                              <div className="space-y-1.5">
                                {filteredSuratTypes.map((type) => (
                                  <div
                                    key={type.id}
                                    onClick={() => handleSelectSuratType(type)}
                                    className="p-2.5 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-200/80 hover:border-emerald-300 flex items-center justify-between gap-3 transition-all cursor-pointer group shadow-2xs"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                                        {type.kode_surat}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-xs font-black text-slate-900 group-hover:text-emerald-800 truncate">
                                          {type.nama_surat}
                                        </div>
                                        <div className="text-[10px] text-slate-500 truncate">
                                          Syarat: {type.persyaratan.join(', ') || 'KTP & KK'}
                                        </div>
                                      </div>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectSuratType(type);
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] shrink-0 shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      <span>Ajukan</span>
                                      <ArrowRight size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 2. SEKSI MENU & FITUR DASHBOARD */}
                          {filteredNavItems.length > 0 && (
                            <div className="space-y-1 pt-2">
                              <div className="px-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Menu & Halaman ({filteredNavItems.length})
                              </div>
                              <div className="space-y-1">
                                {filteredNavItems.map((item) => {
                                  const IconComponent = item.icon || FileText;
                                  return (
                                    <button
                                      key={item.id}
                                      type="button"
                                      onClick={() => {
                                        handleMenuNavigate(item.id);
                                        setSearchQuery('');
                                        setIsSearchOpen(false);
                                      }}
                                      className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center shrink-0 transition-colors">
                                          <IconComponent size={14} />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-xs font-black text-slate-800 group-hover:text-emerald-800 truncate">
                                            {item.label}
                                          </div>
                                          <div className="text-[10px] text-slate-400 truncate">
                                            {item.groupTitle}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                        {item.badge && (
                                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                                            {item.badge}
                                          </span>
                                        )}
                                        <ArrowRight size={12} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 3. SEKSI DATA PERMOHONAN SURAT */}
                          {filteredSurats.length > 0 && (
                            <div className="space-y-1 pt-2">
                              <div className="px-1 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                <span>Data Permohonan Surat ({filteredSurats.length})</span>
                                {isSearchingSurat && <span className="text-[10px] text-emerald-600 animate-pulse">Memuat...</span>}
                              </div>
                              <div className="space-y-1">
                                {filteredSurats.map((surat: any) => {
                                  const getStatusBadge = (status: string) => {
                                    switch (status) {
                                      case 'pending_rt':
                                        return { label: 'Menunggu RT', bg: 'bg-amber-100 text-amber-800' };
                                      case 'processed_sekdes':
                                      case 'approved_rt':
                                        return { label: 'Proses Desa', bg: 'bg-blue-100 text-blue-800' };
                                      case 'completed':
                                        return { label: 'Selesai & Sah', bg: 'bg-emerald-100 text-emerald-800' };
                                      case 'rejected':
                                        return { label: 'Ditolak', bg: 'bg-rose-100 text-rose-800' };
                                      default:
                                        return { label: status, bg: 'bg-slate-100 text-slate-700' };
                                    }
                                  };
                                  const badge = getStatusBadge(surat.status);

                                  const handleSuratClick = () => {
                                    if (roleSlug === 'warga') {
                                      if (surat.status === 'completed') handleMenuNavigate('surat_selesai');
                                      else if (surat.status === 'rejected') handleMenuNavigate('riwayat_surat');
                                      else handleMenuNavigate('status_surat');
                                    } else if (roleSlug === 'rt') {
                                      if (surat.status === 'pending_rt') handleMenuNavigate('persetujuan_surat');
                                      else handleMenuNavigate('riwayat_surat');
                                    } else if (roleSlug === 'rw') {
                                      handleMenuNavigate('riwayat_surat');
                                    } else if (roleSlug === 'sekdes') {
                                      handleMenuNavigate('arsip_surat');
                                    } else if (roleSlug === 'kades') {
                                      handleMenuNavigate('persetujuan_surat');
                                    } else {
                                      handleMenuNavigate('semua_surat');
                                    }
                                    setSearchQuery('');
                                    setIsSearchOpen(false);
                                  };

                                  return (
                                    <button
                                      key={surat.id}
                                      type="button"
                                      onClick={handleSuratClick}
                                      className="w-full flex items-center justify-between px-3 py-2 rounded-2xl hover:bg-slate-50 text-left transition-colors group cursor-pointer"
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-7 h-7 rounded-xl bg-blue-50 group-hover:bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 transition-colors">
                                          <FileText size={14} />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-xs font-black text-slate-800 group-hover:text-emerald-800 truncate">
                                            {surat.surat_type?.nama_surat || surat.nama_surat || 'Surat Permohonan'}
                                          </div>
                                          <div className="text-[10px] text-slate-400 truncate flex items-center gap-2">
                                            <span>{surat.nomor_resi || `#${surat.id}`}</span>
                                            {surat.keperluan && <span>• {surat.keperluan}</span>}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold ${badge.bg}`}>
                                          {badge.label}
                                        </span>
                                        <ArrowRight size={12} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* KONDISI TIDAK DITEMUKAN HASIL */}
                          {filteredSuratTypes.length === 0 && filteredNavItems.length === 0 && filteredSurats.length === 0 && (
                            <div className="p-8 text-center space-y-2">
                              <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                                <Search size={18} />
                              </div>
                              <div className="text-xs font-bold text-slate-700">Tidak ada hasil untuk "{searchQuery}"</div>
                              <div className="text-[11px] text-slate-400 max-w-xs mx-auto">
                                Coba kata kunci lain seperti: <strong>SKU</strong>, <strong>Usaha</strong>, <strong>KTP</strong>, <strong>SKTM</strong>, <strong>Domisili</strong>, atau <strong>Bansos</strong>.
                              </div>
                            </div>
                          )}
                        </>
                      )}

                    </div>

                    {/* Footer Hint */}
                    <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 px-4 shrink-0">
                      <span>Pencarian cepat terintegrasi SiDesKu</span>
                      <button
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        className="text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                      >
                        Tutup (Esc)
                      </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-extrabold hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Globe size={13} />
              <span>Public</span>
            </Link>

            {/* Quick Scan QR Validator Button - Hanya untuk Admin dan Perangkat Desa */}
            {['admin', 'admin_desa', 'super_admin', 'kades', 'sekdes', 'bendahara_desa'].includes(user?.role?.slug || '') && (
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black transition-all shadow-2xs press-down cursor-pointer"
                title="Pindai / Validasi QR Code Kamera & Foto (Admin / Perangkat Desa)"
              >
                <QrCode size={14} />
                <span className="hidden md:inline">Scan QR Dokumen</span>
              </button>
            )}

            {/* Direct Chat / Pusat Pesan Button */}
            <button
              type="button"
              onClick={() => handleMenuNavigate('pesan')}
              className={`p-2.5 rounded-2xl transition-colors relative cursor-pointer ${
                activeMenu === 'pesan' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Pusat Pesan & Chat Desa"
              aria-label="Pusat Pesan & Chat"
            >
              <MessageSquare size={18} />
              {chatUnreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-emerald-600 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                  {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                </span>
              )}
            </button>

            {/* Notification Bell & Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors relative cursor-pointer"
                aria-label="Notifikasi"
              >
                <Bell size={18} />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-600 rounded-full ring-2 ring-white animate-pulse"></span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-full mt-1 sm:mt-2 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 py-3 z-50 animate-slide-down">
                  <div className="px-5 pb-2.5 border-b border-slate-100 font-extrabold text-xs text-slate-900 flex items-center justify-between">
                    <span>Notifikasi Masuk</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      {notifications.filter(n => n.unread).length} Baru
                    </span>
                  </div>

                  <div className="p-2.5 space-y-1.5 max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleOpenNotifDetail(n)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer text-xs space-y-1 ${
                          n.unread
                            ? 'bg-emerald-50/80 border-emerald-200 hover:bg-emerald-100/70 shadow-2xs'
                            : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-extrabold text-slate-900 flex items-center gap-1.5 truncate">
                            {n.unread && <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />}
                            <span className="truncate">{n.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="px-3 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        handleMenuNavigate('notifikasi');
                        setIsNotificationsOpen(false);
                      }}
                      className="w-full py-2 text-center text-xs font-black text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <span className="inline-flex items-center justify-center gap-1">
                        <span>Buka Semua Notifikasi ({notifications.length})</span>
                        <ArrowRight size={13} />
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* User Profile Pill & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-50 border border-slate-200 transition-all shadow-2xs cursor-pointer"
              >
                <UserAvatar
                  src={user?.avatar}
                  name={displayName}
                  className="w-8 h-8 rounded-full object-cover border border-emerald-500 shadow-xs"
                  fallbackClassName="w-8 h-8 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center text-xs shadow-xs"
                />
                <div className="text-left hidden md:block">
                  <div className="text-xs font-black text-slate-900 leading-tight max-w-[120px] truncate">{displayName}</div>
                  <div className="text-[10px] text-emerald-700 font-bold capitalize leading-none mt-0.5">
                    {user?.role?.display_name || roleSlug}
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-xl border border-slate-200 py-2 z-50 animate-slide-down space-y-1">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-400 uppercase">Pengguna Aktif</div>
                    <div className="text-xs font-black text-slate-900 truncate">{displayName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{user?.email || user?.username}</div>
                  </div>

                  <button
                    onClick={() => {
                      handleMenuNavigate('profil_saya');
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <UserIcon size={14} />
                    <span>Profil & Data Diri</span>
                  </button>

                  <div className="pt-1 border-t border-slate-100">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Keluar dari Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Dynamic Main Body */}
        <div className="flex-1 p-4 sm:p-5 lg:p-6 xl:p-8">
          <div className="max-w-7xl mx-auto">
            <React.Suspense fallback={<DashboardLoadingFallback />}>
              {renderContent()}
            </React.Suspense>
          </div>
        </div>

      </main>

      {/* Global QR Verification Modal */}
      {showQrModal && (
        <QrVerificationModal 
          onClose={() => setShowQrModal(false)} 
        />
      )}

      {/* Modal Detail Notifikasi - Portaled, Auto-Centered, Highest Z-Index, No Blur */}
      {isNotifDetailOpen && selectedNotif && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 animate-fade-in bg-slate-950/75 font-sans overflow-y-auto select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsNotifDetailOpen(false);
          }}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up border border-slate-200 flex flex-col my-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {selectedNotif.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{selectedNotif.time}</span>
                  </div>
                  <h3 className="font-black text-sm text-slate-900 leading-tight mt-0.5">Detail Notifikasi</h3>
                </div>
              </div>
              <button
                onClick={() => setIsNotifDetailOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                title="Tutup (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <h4 className="text-base font-black text-slate-900">{selectedNotif.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{selectedNotif.desc}</p>
              </div>

              {selectedNotif.meta && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                  <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Informasi Dokumen / Pelayanan Terkait
                  </div>
                  {selectedNotif.meta.namaSurat && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Jenis Dokumen:</span>
                      <span className="font-extrabold text-slate-900">{selectedNotif.meta.namaSurat}</span>
                    </div>
                  )}
                  {selectedNotif.meta.nomorResi && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Nomor Resi:</span>
                      <span className="font-mono font-bold text-emerald-800">{selectedNotif.meta.nomorResi}</span>
                    </div>
                  )}
                  {selectedNotif.meta.nomorSurat && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Nomor Surat Resmi:</span>
                      <span className="font-mono font-bold text-emerald-800">{selectedNotif.meta.nomorSurat}</span>
                    </div>
                  )}
                  {selectedNotif.meta.signedBy && (
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Diverifikasi / Ditandatangani:</span>
                      <span className="font-bold text-slate-800">{selectedNotif.meta.signedBy}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsNotifDetailOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              {selectedNotif.meta?.targetMenu && (
                <button
                  type="button"
                  onClick={() => {
                    handleMenuNavigate(selectedNotif.meta!.targetMenu!);
                    setIsNotifDetailOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-sm transition-all press-down cursor-pointer flex items-center gap-1.5"
                >
                  <span>{selectedNotif.meta.actionLabel || 'Buka Halaman Terkait'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
