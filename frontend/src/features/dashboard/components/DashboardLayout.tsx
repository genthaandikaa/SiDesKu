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
  Sparkles,
  ChevronRight,
  QrCode,
  ArrowRight,
  Sliders,
  UserPlus,
  FolderCheck
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { WargaDashboard } from './WargaDashboard';
import { RtDashboard } from './RtDashboard';
import { RwDashboard } from './RwDashboard';
import { SekdesDashboard } from './SekdesDashboard';
import { BendaharaDashboard } from './BendaharaDashboard';
import { QrVerificationModal } from './QrVerificationModal';
import { KopSuratSetting } from './KopSuratSetting';
import { BansosManager } from './BansosManager';
import { BrandLogo } from '@/shared/components/BrandLogo';
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
    if (path.startsWith('/dashboard/ajukan')) {
      resolvedMenu = 'ajukan_surat';
    } else if (path.startsWith('/dashboard/berkas')) {
      resolvedMenu = 'berkas_kependudukan';
    } else if (path.startsWith('/dashboard/status-surat') || path.startsWith('/dashboard/status_surat')) {
      resolvedMenu = 'status_surat';
    } else if (path.startsWith('/dashboard/surat-selesai') || path.startsWith('/dashboard/surat_selesai')) {
      resolvedMenu = 'surat_selesai';
    } else if (path.startsWith('/dashboard/riwayat-surat') || path.startsWith('/dashboard/riwayat_surat')) {
      resolvedMenu = 'riwayat_surat';
    } else if (path.startsWith('/dashboard/pengumuman')) {
      resolvedMenu = 'pengumuman';
    } else if (path.startsWith('/dashboard/agenda')) {
      if (['rt', 'sekretaris_rt', 'bendahara_rt'].includes(roleSlug)) {
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
      resolvedMenu = queryTab;
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

  // Interactive Notifications System
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: 'Surat Pengantar Disetujui & Selesai',
      desc: 'Surat Keterangan Tidak Mampu (SKTM) Anda telah disahkan oleh Sekdes dengan tanda tangan QR Code resmi dan nomor surat terbit.',
      time: '10 menit lalu',
      category: 'surat',
      unread: true,
      meta: {
        nomorResi: 'REQ-20260818-001',
        nomorSurat: '401/042/418.66.04/2026',
        namaSurat: 'Surat Keterangan Tidak Mampu (SKTM)',
        signedBy: 'Sekretaris Desa (Doko)',
        actionLabel: 'Buka Surat Selesai & Cetak',
        targetMenu: 'surat_selesai',
      },
    },
    {
      id: 2,
      title: 'Verifikasi Pengantar Diteruskan ke RW',
      desc: 'Pengajuan surat pengantar telah diverifikasi oleh Ketua RT 01 dan diteruskan ke Ketua RW 01 untuk validasi berjenjang.',
      time: '1 jam lalu',
      category: 'surat',
      unread: true,
      meta: {
        nomorResi: 'REQ-20260818-002',
        namaSurat: 'Surat Keterangan Domisili Warga',
        signedBy: 'Ketua RT 01 (Pak Joko)',
        actionLabel: 'Pantau Status Berkas',
        targetMenu: 'status_surat',
      },
    },
    {
      id: 3,
      title: 'Penyaluran Bantuan PKH Tahap III 2026',
      desc: 'Jadwal pembagian bansos PKH dibuka hari ini pukul 08.30 WIB di Pendopo Balai Desa Doko dengan membawa KTP dan KK asli.',
      time: '1 hari lalu',
      category: 'bansos',
      unread: false,
      meta: {
        actionLabel: 'Buka Informasi Pengumuman',
        targetMenu: 'pengumuman',
      },
    },
  ]);

  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const [isNotifDetailOpen, setIsNotifDetailOpen] = useState(false);

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

  const roleSlug = user?.role?.slug || 'warga';

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
              { id: 'ajukan_surat', label: 'Ajukan Surat', icon: Plus, badge: 'Baru', badgeColor: 'bg-emerald-100 text-emerald-800' },
              { id: 'berkas_kependudukan', label: 'Berkas Kependudukan', icon: FolderCheck, badge: 'Master', badgeColor: 'bg-emerald-100 text-emerald-900' },
              { id: 'status_surat', label: 'Status Surat', icon: Clock },
              { id: 'surat_selesai', label: 'Surat Selesai', icon: Download },
              { id: 'riwayat_surat', label: 'Riwayat Surat', icon: FileText },
            ],
          },
          {
            title: 'Informasi Desa',
            items: [
              { id: 'pengumuman', label: 'Pengumuman', icon: Newspaper, badge: '3', badgeColor: 'bg-emerald-100 text-emerald-800' },
              { id: 'agenda_desa', label: 'Agenda Desa', icon: Calendar },
              { id: 'keuangan_desa', label: 'Keuangan Desa', icon: DollarSign },
            ],
          },
          {
            title: 'Akun',
            items: [
              { id: 'profil_saya', label: 'Profil Saya', icon: UserIcon },
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
            ],
          },
        ];

      case 'rt':
      case 'sekretaris_rt':
      case 'bendahara_rt':
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
              { id: 'pengumuman', label: 'Pengumuman', icon: Newspaper },
              { id: 'agenda_rt', label: 'Agenda RT', icon: Calendar },
              { id: 'profil_saya', label: 'Profil Akun', icon: UserIcon },
            ],
          },
        ];

      case 'rw':
        return [
          {
            title: 'Surat & Verifikasi',
            items: [
              { id: 'beranda', label: 'Beranda', icon: Home },
              { id: 'verifikasi_surat', label: 'Verifikasi Surat', icon: ShieldCheck },
              { id: 'riwayat_surat', label: 'Riwayat Surat', icon: Clock },
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
            ],
          },
          {
            title: 'Koordinasi Wilayah',
            items: [
              { id: 'daftar_rt', label: 'Daftar RT', icon: Building2 },
              { id: 'data_warga_rw', label: 'Data Warga RW', icon: Users },
              { id: 'rekap_statistik', label: 'Rekap Statistik', icon: TrendingUp },
            ],
          },
          {
            title: 'Informasi & Akun',
            items: [
              { id: 'pengumuman', label: 'Pengumuman', icon: Newspaper },
              { id: 'agenda_rw', label: 'Agenda RW', icon: Calendar },
              { id: 'profil_saya', label: 'Profil Akun', icon: UserIcon },
            ],
          },
        ];

      case 'sekdes':
      case 'kades':
        return [
          {
            title: 'Administrasi Surat',
            items: [
              { id: 'beranda', label: 'Beranda', icon: Home },
              { id: 'proses_surat', label: 'Proses Surat', icon: FileCheck2, badge: 'Siap TTD', badgeColor: 'bg-emerald-100 text-emerald-900' },
              { id: 'penomoran_surat', label: 'Format & No. Surat', icon: Sliders },
              { id: 'buat_surat_baru', label: 'Buat Surat Baru', icon: Plus },
              { id: 'arsip_surat', label: 'Arsip Surat', icon: FileText },
              { id: 'riwayat_surat', label: 'Riwayat Surat', icon: Clock },
              { id: 'template_surat', label: 'Template Surat & Kop', icon: Settings },
            ],
          },
          {
            title: 'Data Kependudukan',
            items: [
              { id: 'register_warga', label: 'Register Warga Baru', icon: UserPlus },
              { id: 'data_warga', label: 'Data Warga', icon: Users },
              { id: 'data_kk', label: 'Data KK', icon: Building2 },
              { id: 'mutasi_penduduk', label: 'Mutasi Penduduk', icon: RefreshCw },
            ],
          },
          {
            title: 'Informasi & Penyaluran',
            items: [
              { id: 'buat_pengumuman', label: 'Buat Pengumuman', icon: Newspaper },
              { id: 'agenda_desa', label: 'Agenda Desa', icon: Calendar },
              { id: 'bansos_manager', label: 'Bansos & WhatsApp', icon: HeartHandshake },
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell, badge: '4', badgeColor: 'bg-emerald-100 text-emerald-800' },
              { id: 'profil_saya', label: 'Profil Akun', icon: UserIcon },
            ],
          },
        ];

      case 'bendahara_desa':
        return [
          {
            title: 'Transaksi',
            items: [
              { id: 'beranda', label: 'Beranda', icon: Home },
              { id: 'input_pemasukan', label: 'Input Pemasukan', icon: Plus },
              { id: 'input_pengeluaran', label: 'Input Pengeluaran', icon: DollarSign },
              { id: 'daftar_transaksi', label: 'Daftar Transaksi', icon: FileText },
              { id: 'buat_laporan', label: 'Buat Laporan', icon: FileCheck2 },
            ],
          },
          {
            title: 'APBDes & Publikasi',
            items: [
              { id: 'realisasi_apbdes', label: 'Realisasi APBDes', icon: TrendingUp },
              { id: 'laporan_bulanan', label: 'Laporan Bulanan', icon: Calendar },
              { id: 'laporan_tahunan', label: 'Laporan Tahunan', icon: Award },
              { id: 'publikasi_laporan', label: 'Publikasi Laporan', icon: Globe },
              { id: 'ekspor_laporan', label: 'Ekspor Laporan', icon: Download },
            ],
          },
          {
            title: 'Akun',
            items: [
              { id: 'profil_saya', label: 'Profil Akun', icon: UserIcon },
              { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
            ],
          },
        ];

      case 'admin':
        return [
          {
            title: 'Sistem & User',
            items: [
              { id: 'beranda', label: 'Beranda', icon: Home },
              { id: 'statistik_sistem', label: 'Statistik Sistem', icon: Activity },
              { id: 'kelola_user', label: 'Kelola User', icon: Users },
              { id: 'atur_hak_akses', label: 'Atur Hak Akses', icon: ShieldCheck },
              { id: 'tambah_akun', label: 'Tambah Akun', icon: Plus },
              { id: 'log_aktivitas', label: 'Log Aktivitas', icon: Clock },
            ],
          },
          {
            title: 'Data & Konten',
            items: [
              { id: 'data_penduduk', label: 'Data Penduduk', icon: Users },
              { id: 'semua_surat', label: 'Semua Surat', icon: FileText },
              { id: 'data_keuangan', label: 'Data Keuangan', icon: DollarSign },
              { id: 'pengumuman', label: 'Pengumuman', icon: Newspaper },
            ],
          },
          {
            title: 'Pengaturan Sistem',
            items: [
              { id: 'pengaturan_desa', label: 'Pengaturan Desa', icon: Settings },
              { id: 'backup_data', label: 'Backup Data', icon: Database },
              { id: 'keamanan', label: 'Keamanan', icon: Lock },
              { id: 'profil_saya', label: 'Profil Admin', icon: UserIcon },
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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Render proper subviews depending on activeMenu
  const renderContent = () => {
    // 1. Shared views
    if (activeMenu === 'pengumuman' || activeMenu === 'buat_pengumuman') return <PengumumanView canCreate={['admin', 'sekdes', 'kades'].includes(roleSlug)} />;
    if (activeMenu === 'agenda_desa' || activeMenu === 'agenda_rt' || activeMenu === 'agenda_rw') return <AgendaDesaView />;
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
    if (activeMenu === 'template_surat' || activeMenu === 'pengaturan_desa') return <KopSuratSetting />;
    if (activeMenu === 'bansos_manager') return <BansosManager />;
    if (activeMenu === 'keuangan_desa' || activeMenu === 'realisasi_apbdes' || activeMenu === 'data_keuangan') return <BendaharaDashboard />;

    // 3. Primary Role Dashboards
    if (roleSlug === 'warga') return <WargaDashboard activeSubmenu={activeMenu} onNavigate={handleMenuNavigate} />;
    if (['rt', 'sekretaris_rt', 'bendahara_rt'].includes(roleSlug)) return <RtDashboard activeSubmenu={activeMenu} />;
    if (roleSlug === 'rw') return <RwDashboard activeSubmenu={activeMenu} />;
    if (roleSlug === 'bendahara_desa') return <BendaharaDashboard activeSubmenu={activeMenu} />;
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
        <div className="p-4 mx-4 mb-3 rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-emerald-100/40 border border-emerald-200/90 shadow-2xs space-y-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
              SIDes Digital Pro
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
            Sistem tata kelola desa terintegrasi legalitas QR Code, bansos PKH, dan transparansi APBDes.
          </p>
          <Link
            to="/lacak"
            className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-[11px] shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer press-down"
          >
            <span>Lacak Berkas Cepat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

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
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-2xl"
              aria-label="Open Sidebar"
            >
              <Menu size={20} />
            </button>
            
            <div className="hidden md:flex relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Cari surat, NIK, atau data warga..." 
                className="w-72 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-extrabold hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Globe size={13} />
              <span>Portal Publik</span>
            </Link>

            {/* Quick Scan QR Validator Button - Hanya untuk Admin dan Perangkat Desa (Admin, Kades, Sekdes, Bendahara Desa) */}
            {['admin', 'kades', 'sekdes', 'bendahara_desa'].includes(user?.role?.slug || '') && (
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
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 py-3 z-50 animate-slide-down">
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
                      Buka Semua Notifikasi ({notifications.length}) →
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
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500 shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-black flex items-center justify-center text-xs shadow-xs">
                    {displayName.charAt(0)}
                  </div>
                )}
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
            {renderContent()}
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
