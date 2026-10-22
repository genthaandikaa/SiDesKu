import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Key,
  RefreshCw,
  Lock,
  Database,
  Activity,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Layers,
  Settings,
  Server,
  HardDrive,
  Eye,
  X,
  ChevronRight,
  ArrowRight,
  Check,
  Building2,
  DollarSign,
  HeartHandshake,
  FileCheck2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import api from '@/shared/lib/axios';
import { Pagination } from '@/shared/components/Pagination';

interface AdminDashboardProps {
  activeSubmenu?: string;
  onNavigate?: (menuId: string) => void;
}

interface UserItem {
  id: number;
  role_id: number;
  name: string;
  username: string;
  email: string | null;
  phone_number: string | null;
  avatar: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  role?: {
    id: number;
    name: string;
    slug: string;
    display_name: string;
  };
  warga_profile?: {
    nik: string;
    nama_lengkap: string;
    rt_id: number | null;
    rt?: {
      nomor_rt: string;
      rw?: {
        nomor_rw: string;
      };
    };
  };
}

interface RoleItem {
  id: number;
  name: string;
  slug: string;
  display_name: string;
  description?: string;
  users_count?: number;
}

interface ActivityLogItem {
  id: number;
  user_id: number;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  description: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    username: string;
    role?: {
      name: string;
      slug: string;
    };
  };
}

interface SystemStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    by_role: Array<{
      id: number;
      slug: string;
      name: string;
      display_name: string;
      count: number;
    }>;
  };
  surats: {
    total: number;
    pending_rt: number;
    processed_sekdes: number;
    completed: number;
    rejected: number;
  };
  warga: {
    total_warga: number;
    total_kk: number;
    total_rt: number;
    total_rw: number;
  };
  database: Record<string, number>;
  server: {
    php_version: string;
    laravel_version: string;
    db_connection: string;
    server_time: string;
    timezone: string;
    active_tokens_count: number;
    storage_writable: boolean;
    status: string;
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeSubmenu = 'beranda' }) => {
  const { user: currentAdmin } = useAuth();
  const menu = activeSubmenu.toLowerCase();

  // State Management
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [wargas, setWargas] = useState<any[]>([]);
  const [wargaTotal, setWargaTotal] = useState<number>(0);
  const [isWargaLoading, setIsWargaLoading] = useState<boolean>(false);
  const [surats, setSurats] = useState<any[]>([]);
  const [apbdesData, setApbdesData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filters & Search
  const [userSearch, setUserSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [logActionFilter, setLogActionFilter] = useState<string>('all');
  const [logSearch, setLogSearch] = useState<string>('');
  const [wargaSearch, setWargaSearch] = useState<string>('');
  const [suratSearch, setSuratSearch] = useState<string>('');
  const [suratStatusFilter, setSuratStatusFilter] = useState<string>('all');

  // Pagination States (8 data per halaman)
  const [userPage, setUserPage] = useState<number>(1);
  const [logPage, setLogPage] = useState<number>(1);
  const [wargaPage, setWargaPage] = useState<number>(1);
  const [suratPage, setSuratPage] = useState<number>(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    setUserPage(1);
  }, [userSearch, roleFilter, statusFilter]);

  useEffect(() => {
    setLogPage(1);
  }, [logActionFilter, logSearch]);

  useEffect(() => {
    setWargaPage(1);
  }, [wargaSearch]);

  useEffect(() => {
    setSuratPage(1);
  }, [suratSearch, suratStatusFilter]);

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<UserItem | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [showRevokeTokensModal, setShowRevokeTokensModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dynamic RBAC Matrix (Non-IT User Customization)
  const defaultRbacMatrix: Record<string, Record<string, boolean>> = {
    'surat_online': { warga: true, rt: false, rw: false, sekdes: false, bendahara: false, kades: false, admin: false },
    'acc_rt': { warga: false, rt: true, rw: false, sekdes: false, bendahara: false, kades: false, admin: false },
    'legalisasi_desa': { warga: false, rt: false, rw: false, sekdes: true, bendahara: false, kades: true, admin: false },
    'apbdes_bku': { warga: false, rt: false, rw: false, sekdes: false, bendahara: true, kades: true, admin: false },
    'bansos_broadcast': { warga: false, rt: false, rw: false, sekdes: true, bendahara: false, kades: true, admin: false },
    'agenda_desa': { warga: false, rt: true, rw: true, sekdes: true, bendahara: false, kades: true, admin: true },
    'verifikasi_warga': { warga: false, rt: true, rw: true, sekdes: true, bendahara: false, kades: false, admin: true },
    'manajemen_user': { warga: false, rt: false, rw: false, sekdes: false, bendahara: false, kades: false, admin: true },
    'audit_backup': { warga: false, rt: false, rw: false, sekdes: false, bendahara: false, kades: false, admin: true },
  };

  const [rbacMatrix, setRbacMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const saved = localStorage.getItem('sidesku_dynamic_rbac_matrix');
      return saved ? JSON.parse(saved) : defaultRbacMatrix;
    } catch {
      return defaultRbacMatrix;
    }
  });

  const [rbacSaveAlert, setRbacSaveAlert] = useState<string | null>(null);

  const handleToggleRbac = (moduleKey: string, roleKey: string) => {
    setRbacMatrix((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [roleKey]: !prev[moduleKey]?.[roleKey],
      },
    }));
  };

  const handleSaveRbac = () => {
    localStorage.setItem('sidesku_dynamic_rbac_matrix', JSON.stringify(rbacMatrix));
    setRbacSaveAlert('Konfigurasi Hak Akses Berhasil Disimpan! Perubahan wewenang peran baru telah diterapkan langsung ke sistem tanpa perlu modifikasi kode program.');
    setTimeout(() => setRbacSaveAlert(null), 5000);
  };

  const handleResetRbac = () => {
    setRbacMatrix(defaultRbacMatrix);
    localStorage.removeItem('sidesku_dynamic_rbac_matrix');
    setRbacSaveAlert('Hak akses berhasil dikembalikan ke standar awal UU Desa.');
    setTimeout(() => setRbacSaveAlert(null), 4000);
  };

  // Restore State
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePreview, setRestorePreview] = useState<any | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [showRestoreConfirmModal, setShowRestoreConfirmModal] = useState<boolean>(false);
  const restoreFileInputRef = React.useRef<HTMLInputElement>(null);

  // Form State: Tambah User
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    email: '',
    phone_number: '',
    role_id: '',
    password: '',
    nik: '',
    rt_id: '',
  });

  // Initial Data Fetch
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, usersRes, rolesRes, logsRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/roles'),
        api.get('/admin/activity-logs'),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
        setStats(statsRes.value.data.data);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.data.success) {
        setUsers(usersRes.value.data.data);
      }
      if (rolesRes.status === 'fulfilled' && rolesRes.value.data.success) {
        setRoles(rolesRes.value.data.data);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value.data.success) {
        setActivityLogs(logsRes.value.data.data);
      }
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Lazy load specific data when submenu matches
  useEffect(() => {
    if (activeSubmenu === 'data_penduduk' || menu === 'data_penduduk' || menu === 'penduduk') {
      setIsWargaLoading(true);
      api.get('/admin/warga', {
        params: {
          page: wargaPage,
          per_page: PAGE_SIZE,
          search: wargaSearch || undefined,
        },
      })
        .then((res) => {
          if (res.data.success) {
            setWargas(res.data.data);
            if (res.data.pagination) {
              setWargaTotal(res.data.pagination.total);
            } else {
              setWargaTotal(res.data.data.length);
            }
          }
        })
        .catch((e) => console.error(e))
        .finally(() => setIsWargaLoading(false));
    }
    if ((activeSubmenu === 'semua_surat' || menu === 'semua_surat' || menu === 'surat') && surats.length === 0) {
      api.get('/surats')
        .then((res) => {
          if (res.data.success) setSurats(res.data.data);
        })
        .catch((e) => console.error(e));
    }
    if ((activeSubmenu === 'data_keuangan' || activeSubmenu === 'keuangan' || menu === 'data_keuangan' || menu === 'keuangan') && !apbdesData) {
      api.get('/public/apbdes/summary')
        .then((res) => {
          if (res.data.success) setApbdesData(res.data);
        })
        .catch((e) => console.error(e));
    }
  }, [activeSubmenu, menu, wargaPage, wargaSearch, PAGE_SIZE]);

  // Flash message helper
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setNotificationMsg({ type, text });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // User Actions: Toggle Active
  const handleToggleUserStatus = async (userItem: UserItem) => {
    if (userItem.id === currentAdmin?.id) {
      showToast('Anda tidak dapat menonaktifkan akun sendiri.', 'error');
      return;
    }
    try {
      const res = await api.post(`/admin/users/${userItem.id}/toggle-status`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userItem.id ? { ...u, is_active: !u.is_active } : u))
        );
        showToast(res.data.message || 'Status akun berhasil diperbarui.');
        loadDashboardData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mengubah status akun.', 'error');
    }
  };

  // User Actions: Reset Password
  const handleConfirmResetPassword = async () => {
    if (!selectedUserForReset || !newPasswordInput.trim()) return;
    try {
      setIsSubmitting(true);
      const res = await api.post(`/admin/users/${selectedUserForReset.id}/reset-password`, {
        new_password: newPasswordInput.trim(),
      });
      if (res.data.success) {
        showToast(res.data.message || 'Kata sandi berhasil direset.');
        setShowResetPasswordModal(false);
        setSelectedUserForReset(null);
        setNewPasswordInput('');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mereset kata sandi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // User Actions: Tambah Akun
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.username || !newUserForm.role_id || !newUserForm.password) {
      showToast('Mohon lengkapi semua bidang bertanda wajib.', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await api.post('/admin/users', newUserForm);
      if (res.data.success) {
        showToast(`Akun ${newUserForm.username} berhasil dibuat!`);
        setShowAddUserModal(false);
        setNewUserForm({
          name: '',
          username: '',
          email: '',
          phone_number: '',
          role_id: '',
          password: '',
          nik: '',
          rt_id: '',
        });
        loadDashboardData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal membuat akun.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Backup: Unduh JSON Database Backup
  const handleDownloadBackup = async () => {
    try {
      showToast('Menyiapkan paket pencadangan basis data...');
      const res = await api.get('/admin/backup');
      if (res.data.success) {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data.backup, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `sidesku_backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('Cadangan basis data berhasil diunduh ke komputer Anda.');
        loadDashboardData();
      }
    } catch (err) {
      showToast('Gagal menghasilkan file pencadangan.', 'error');
    }
  };

  // Restore: Pilih Berkas JSON
  const handleRestoreFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      showToast('Harap pilih berkas cadangan dengan format .json', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON format');
        }
        setRestoreFile(file);
        setRestorePreview(parsed);
        showToast(`Berkas cadangan "${file.name}" siap dipulihkan.`);
      } catch (err) {
        showToast('Berkas JSON tidak valid atau struktur rusak.', 'error');
        setRestoreFile(null);
        setRestorePreview(null);
      }
    };
    reader.readAsText(file);
  };

  // Restore: Eksekusi Pemulihan Basis Data
  const handleExecuteRestore = async () => {
    if (!restoreFile) {
      showToast('Pilih berkas cadangan JSON terlebih dahulu.', 'error');
      return;
    }

    try {
      setIsRestoring(true);
      const formData = new FormData();
      formData.append('backup_file', restoreFile);

      const res = await api.post('/admin/restore', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        showToast(res.data.message || 'Pemulihan basis data berhasil diselesaikan.');
        setShowRestoreConfirmModal(false);
        setRestoreFile(null);
        setRestorePreview(null);
        if (restoreFileInputRef.current) restoreFileInputRef.current.value = '';
        await loadDashboardData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal memulihkan basis data.', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  // Revoke All Tokens
  const handleRevokeAllTokens = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.post('/admin/security/revoke-tokens');
      if (res.data.success) {
        showToast(res.data.message || 'Semua sesi otentikasi berhasil dicabut.');
        setShowRevokeTokensModal(false);
        loadDashboardData();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mencabut sesi otentikasi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.warga_profile?.nik && u.warga_profile.nik.includes(userSearch));

      const matchRole = roleFilter === 'all' || u.role?.slug === roleFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && u.is_active) ||
        (statusFilter === 'inactive' && !u.is_active);

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, userSearch, roleFilter, statusFilter]);

  // Filtered Activity Logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((log) => {
      const matchAction = logActionFilter === 'all' || log.action === logActionFilter;
      const matchSearch =
        log.description.toLowerCase().includes(logSearch.toLowerCase()) ||
        (log.user?.name && log.user.name.toLowerCase().includes(logSearch.toLowerCase())) ||
        (log.user?.username && log.user.username.toLowerCase().includes(logSearch.toLowerCase())) ||
        (log.ip_address && log.ip_address.includes(logSearch));

      return matchAction && matchSearch;
    });
  }, [activityLogs, logActionFilter, logSearch]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, userPage, PAGE_SIZE]);

  const paginatedLogs = useMemo(() => {
    const start = (logPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, logPage, PAGE_SIZE]);

  // Warga data is now paginated and filtered on server-side
  const paginatedWargas = wargas;

  const filteredSurats = useMemo(() => {
    return surats.filter((s) => {
      const matchStatus = suratStatusFilter === 'all' || s.status === suratStatusFilter;
      const matchSearch =
        (s.nomor_surat && s.nomor_surat.toLowerCase().includes(suratSearch.toLowerCase())) ||
        (s.surat_type?.nama_surat && s.surat_type.nama_surat.toLowerCase().includes(suratSearch.toLowerCase())) ||
        (s.warga?.nama_lengkap && s.warga.nama_lengkap.toLowerCase().includes(suratSearch.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [surats, suratStatusFilter, suratSearch]);

  const paginatedSurats = useMemo(() => {
    const start = (suratPage - 1) * PAGE_SIZE;
    return filteredSurats.slice(start, start + PAGE_SIZE);
  }, [filteredSurats, suratPage, PAGE_SIZE]);

  // Role Badge Helper
  const getRoleBadge = (slug?: string) => {
    switch (slug) {
      case 'super_admin':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Super Admin</span>;
      case 'admin_desa':
      case 'admin':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">Admin Desa</span>;
      case 'kades':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Kepala Desa</span>;
      case 'sekdes':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Sekretaris Desa</span>;
      case 'bendahara_desa':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Bendahara Desa</span>;
      case 'rw':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">Ketua RW</span>;
      case 'rt':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">Ketua RT</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Warga</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 animate-fade-in">
      {/* Toast Notification */}
      {notificationMsg && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-bounce-subtle ${
            notificationMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {notificationMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* TOP HEADER BAR (Clean White Surface with subtle emerald trim, Responsive Mobile) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Dashboard Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola pengguna, keamanan, dan pemantauan sistem desa.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <button
            onClick={() => loadDashboardData()}
            disabled={refreshing}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition shadow-2xs disabled:opacity-60 cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah akun</span>
          </button>
          <button
            onClick={handleDownloadBackup}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Backup</span>
          </button>
        </div>
      </div>
      
      {(menu === 'beranda' || menu === 'overview') && (
        <div className="space-y-4 sm:space-y-6">
          {/* Key Metric Stat Cards (2x2 Grid di Mobile, 4-Col di Desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-3.5 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Pengguna
                </span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xl sm:text-3xl font-extrabold text-slate-900">
                  {stats?.users.total ?? users.length}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {stats?.users.active ?? 0} Aktif
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 truncate">
                Tersebar di {roles.length} hak akses resmi
              </p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-3.5 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Kependudukan
                </span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xl sm:text-3xl font-extrabold text-slate-900">
                  {stats?.warga.total_warga ?? 0}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium">
                  Jiwa ({stats?.warga.total_kk ?? 0} KK)
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 truncate">
                {stats?.warga.total_rt ?? 3} RT dalam {stats?.warga.total_rw ?? 1} RW terdata
              </p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-3.5 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Persuratan
                </span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
                  <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xl sm:text-3xl font-extrabold text-slate-900">
                  {stats?.surats.total ?? 0}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {stats?.surats.completed ?? 0} Sah
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 truncate">
                {stats?.surats.pending_rt ?? 0} Menunggu RT • {stats?.surats.processed_sekdes ?? 0} Kantor Desa
              </p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-3.5 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Keamanan
                </span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 shrink-0">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xl sm:text-3xl font-extrabold text-slate-900">
                  100%
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  OPTIMAL
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 truncate">
                Sanctum Token: {stats?.server.active_tokens_count ?? 1} sesi aktif
              </p>
            </div>
          </div>

          {/* Quick Action Hub & System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Quick Actions (2 Cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  Pintasan Tata Kelola Administrator
                </h2>
                <span className="text-xs text-slate-400 hidden sm:inline">Aksi Cepat Tanggap</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setShowAddUserModal(true)}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform shrink-0">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        Tambah Akun Pejabat / Warga
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Buat akses baru untuk RT, RW, Kades, atau Staf Desa
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={handleDownloadBackup}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                        Unduh Snapshot Database
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Ekspor cadangan JSON seluruh data desa terkini
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => {
                    const el = document.getElementById('tab-log_aktivitas');
                    if (el) el.click();
                  }}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/30 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 group-hover:scale-105 transition-transform shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-purple-700 transition">
                        Audit Log Aktivitas
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Pantau rekam jejak aksi dan audit trail pengguna
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setShowRevokeTokensModal(true)}
                  className="p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/30 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 group-hover:scale-105 transition-transform shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-700 transition">
                        Sanitasi Sesi Kredensial
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Cabut seluruh token aktif jika terdeteksi anomali
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roles Distribution Bar */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                  <span>Distribusi Hak Akses Terdaftar</span>
                  <span className="text-slate-400">{users.length} Akun Terdata</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {roles.map((r) => {
                    const cnt = users.filter((u) => u.role_id === r.id).length;
                    return (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {r.name}: <strong className="text-slate-900">{cnt}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Server & Environment Diagnostic (1 Col) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-600" />
                    Status Server
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    ONLINE
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Versi PHP</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {stats?.server.php_version || '8.2+'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Framework Core</span>
                    <span className="font-mono font-semibold text-slate-800">
                      Laravel {stats?.server.laravel_version || '11.x'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Engine Database</span>
                    <span className="font-mono font-semibold text-slate-800">
                      MySQL
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Protokol Keamanan</span>
                    <span className="font-semibold text-emerald-700">
                      Sanctum Token Auth
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Alur Persetujuan</span>
                    <span className="font-semibold text-emerald-700">
                      Direct RT ke Kantor Desa
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500">Stempel Sah Digital</span>
                    <span className="font-semibold text-emerald-700">
                      QR Code 
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <HardDrive className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kapasitas penyimpanan media privat aman</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Security Logs Preview (Dual-Mode: Mobile Card Feed & Desktop Table) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Rekam Jejak Log Aktivitas Terkini
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit trail transaksi sistem dan perubahan hak akses terkini
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
                Audit Trail Aktif
              </span>
            </div>

            {/* 1. Mobile Feed View (Anti-Terpotong, Ramah Orang Awam) */}
            <div className="block md:hidden space-y-2.5">
              {activityLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                        {(log.user?.name || 'S').charAt(0)}
                      </span>
                      <span className="font-bold text-slate-900">{log.user?.name || 'Sistem'}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="text-xs text-slate-800 font-medium leading-relaxed">
                    {log.description}
                  </div>

                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60 text-slate-500 font-mono">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold">
                      {log.action}
                    </span>
                    <span>IP: {log.ip_address || '127.0.0.1'}</span>
                  </div>
                </div>
              ))}
              {activityLogs.length === 0 && (
                <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Belum ada aktivitas yang tercatat.
                </div>
              )}
            </div>

            {/* 2. Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Tipe Aksi</th>
                    <th className="py-3 px-4">Deskripsi Audit</th>
                    <th className="py-3 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activityLogs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                        {log.user?.name || 'Sistem'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-md truncate">
                        {log.description}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                  {activityLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Belum ada aktivitas yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MENU: STATISTIK SISTEM */}
      {/* ============================================================== */}
      {menu === 'statistik_sistem' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* User Breakdown by Role */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 md:col-span-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                Sebaran Akun Berdasarkan Hak Akses (RBAC)
              </h2>
              <p className="text-xs text-slate-500 mb-4 sm:mb-6">
                Komposisi peran pengguna yang terdaftar di database SiDesKu
              </p>

              <div className="space-y-3.5">
                {roles.filter((r) => r.slug !== 'super_admin').map((r) => {
                  const count = users.filter((u) => u.role_id === r.id).length;
                  const percent = users.length > 0 ? Math.round((count / users.length) * 100) : 0;
                  return (
                    <div key={r.id} className="space-y-1.5 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                        <span className="text-slate-800 flex items-center gap-1.5 flex-wrap">
                          {getRoleBadge(r.slug)}
                          <span className="text-slate-900 font-bold">{r.name}</span>
                        </span>
                        <span className="text-slate-600 font-mono text-[11px] shrink-0 font-bold">
                          {count} Akun ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Database Row Counters */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Database className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Matriks Tabel Basis Data
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Jumlah baris data entitas utama
              </p>

              <div className="divide-y divide-slate-100 text-xs">
                {stats?.database ? (
                  Object.entries(stats.database).map(([table, count]) => (
                    <div key={table} className="py-2.5 flex items-center justify-between">
                      <span className="font-mono text-slate-600 truncate mr-2">{table}</span>
                      <span className="font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0 font-mono text-[11px]">
                        {count.toLocaleString('id-ID')} baris
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-slate-400">Memuat data...</div>
                )}
              </div>
            </div>
          </div>

          {/* Letter Pipeline Analytics (2x2 Grid di Mobile, 4-Col di Desktop) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              Siklus Alur Persuratan Resmi (Direct RT ke Kepala Desa)
            </h2>
            <p className="text-xs text-slate-500 mb-4 sm:mb-6">
              Status pengajuan surat di seluruh wilayah Desa Doko
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-1">
                <span className="text-[10px] sm:text-xs font-semibold text-amber-800">Menunggu Verifikasi RT</span>
                <div className="text-lg sm:text-2xl font-black text-amber-900 font-mono">
                  {stats?.surats.pending_rt ?? 0}
                </div>
                <p className="text-[10px] text-amber-700/80">pending_rt</p>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-1">
                <span className="text-[10px] sm:text-xs font-semibold text-blue-800">Menunggu ACC Kades</span>
                <div className="text-lg sm:text-2xl font-black text-blue-900 font-mono">
                  {stats?.surats.processed_sekdes ?? 0}
                </div>
                <p className="text-[10px] text-blue-700/80">pending_kades</p>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-1">
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-800">Selesai & Sah (QR)</span>
                <div className="text-lg sm:text-2xl font-black text-emerald-900 font-mono">
                  {stats?.surats.completed ?? 0}
                </div>
                <p className="text-[10px] text-emerald-700/80">completed</p>
              </div>

              <div className="p-3 sm:p-4 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-1">
                <span className="text-[10px] sm:text-xs font-semibold text-rose-800">Ditolak</span>
                <div className="text-lg sm:text-2xl font-black text-rose-900 font-mono">
                  {stats?.surats.rejected ?? 0}
                </div>
                <p className="text-[10px] text-rose-700/80">rejected</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MENU: KELOLA USER & TAMBAH AKUN */}
      {/* ============================================================== */}
      {(menu === 'kelola_user' || menu === 'tambah_akun' || menu === 'users') && (
        <div className="space-y-4 sm:space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, username, email, NIK..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              {/* Filters & Action */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:border-emerald-600 transition"
                  >
                    <option value="all">Semua Peran ({users.length})</option>
                    {roles.map((r) => (
                      <option key={r.slug} value={r.slug}>
                        {r.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:border-emerald-600 transition"
                  >
                    <option value="all">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Akun Baru</span>
                </button>
              </div>
            </div>
          </div>

          {/* User List & Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar Akun Pengguna Terdaftar ({filteredUsers.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Kelola status aktivasi akun dan setel ulang kredensial akses
                </p>
              </div>
            </div>

            {/* Mobile Card List View (Thumb-Friendly, Anti-Terpotong) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {paginatedUsers.map((item) => (
                <div key={item.id} className="p-4 space-y-3 hover:bg-slate-50/50 transition">
                  {/* Top: Avatar, Name, Role */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs border border-slate-200 shrink-0">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 text-sm block truncate">{item.name}</span>
                        <span className="font-mono text-[11px] text-slate-400 block truncate">@{item.username}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getRoleBadge(item.role?.slug)}
                    </div>
                  </div>

                  {/* Middle Info */}
                  <div className="grid grid-cols-1 gap-1.5 text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-slate-600 gap-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">Kontak:</span>
                      <span className="truncate font-medium text-slate-800">{item.email || '-'}</span>
                    </div>
                    {item.warga_profile?.nik && (
                      <div className="flex items-center justify-between text-slate-600 gap-2">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">NIK:</span>
                        <span className="font-mono font-medium text-slate-800">{item.warga_profile.nik}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-600 gap-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0">Wilayah:</span>
                      {item.warga_profile?.rt ? (
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                          RT {item.warga_profile.rt.nomor_rt} / RW {item.warga_profile.rt.rw?.nomor_rw || '01'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pusat Balai Desa</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar Mobile */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleToggleUserStatus(item)}
                      disabled={item.id === currentAdmin?.id}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                        item.is_active
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                      }`}
                      title={item.is_active ? 'Klik untuk menonaktifkan' : 'Klik untuk mengaktifkan'}
                    >
                      {item.is_active ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Status: Aktif</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3.5 h-3.5 text-rose-600" />
                          <span>Status: Nonaktif</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedUserForReset(item);
                        setNewPasswordInput('');
                        setShowResetPasswordModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-amber-800 text-xs font-semibold transition cursor-pointer shadow-2xs"
                      title="Reset Kata Sandi"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      <span>Reset Sandi</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="py-10 text-center text-slate-400 text-xs">
                  Tidak ada pengguna yang cocok dengan kriteria pencarian.
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Pengguna</th>
                    <th className="py-3.5 px-4">Peran (Role)</th>
                    <th className="py-3.5 px-4">Kontak / NIK</th>
                    <th className="py-3.5 px-4">Wilayah RT/RW</th>
                    <th className="py-3.5 px-4">Status Akun</th>
                    <th className="py-3.5 px-4 text-center">Aksi Administrator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs border border-slate-200">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{item.name}</span>
                            <span className="font-mono text-[11px] text-slate-400">@{item.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getRoleBadge(item.role?.slug)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="block text-slate-700">{item.email || '-'}</span>
                          {item.warga_profile?.nik && (
                            <span className="font-mono text-[11px] text-slate-400">
                              NIK: {item.warga_profile.nik}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.warga_profile?.rt ? (
                          <span className="inline-flex items-center gap-1 font-medium">
                            RT {item.warga_profile.rt.nomor_rt} / RW {item.warga_profile.rt.rw?.nomor_rw || '01'}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Desa (Pusat)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleUserStatus(item)}
                          disabled={item.id === currentAdmin?.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                            item.is_active
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                          }`}
                          title={item.is_active ? 'Klik untuk menonaktifkan' : 'Klik untuk mengaktifkan'}
                        >
                          {item.is_active ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Aktif
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5 text-rose-600" /> Nonaktif
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUserForReset(item);
                              setNewPasswordInput('');
                              setShowResetPasswordModal(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-amber-800 text-xs font-medium transition cursor-pointer"
                            title="Reset Kata Sandi"
                          >
                            <Key className="w-3.5 h-3.5 text-amber-600" />
                            <span>Reset Sandi</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Tidak ada pengguna yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={userPage}
                totalItems={filteredUsers.length}
                pageSize={PAGE_SIZE}
                onPageChange={setUserPage}
                itemLabel="pengguna"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MENU: ATUR HAK AKSES (RBAC MATRIX) */}
      {/* ============================================================== */}
      {/* ============================================================== */}
      {menu === 'atur_hak_akses' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Matriks Hak Akses & Peran Sistem (Dynamic RBAC SiDesKu)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Ubah hak akses dan wewenang fitur tanpa perlu mengedit kode program (Cocok untuk staf Non-IT).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetRbac}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition cursor-pointer"
                >
                  Reset Standar
                </button>
                <button
                  type="button"
                  onClick={handleSaveRbac}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Hak Akses</span>
                </button>
              </div>
            </div>

            {rbacSaveAlert && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{rbacSaveAlert}</span>
              </div>
            )}

            {/* Mobile Scroll Hint */}
            <div className="sm:hidden mb-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 text-emerald-600 inline" />
              <span>Centang atau batalkan izin pada kolom peran yang diinginkan, lalu klik Simpan.</span>
            </div>

            <div className="overflow-x-auto pb-2">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden min-w-[700px]">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Fitur / Modul</th>
                    <th className="py-3 px-3 text-center">Warga</th>
                    <th className="py-3 px-3 text-center">Ketua RT</th>
                    <th className="py-3 px-3 text-center">Ketua RW</th>
                    <th className="py-3 px-3 text-center">Sekdes</th>
                    <th className="py-3 px-3 text-center">Bendahara</th>
                    <th className="py-3 px-3 text-center">Kades</th>
                    <th className="py-3 px-3 text-center">Admin Desa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { key: 'surat_online', label: 'Pengajuan Surat Online & Lacak Berkas' },
                    { key: 'acc_rt', label: 'ACC Pengantar RT (Direct to Desa)' },
                    { key: 'legalisasi_desa', label: 'Legalisasi & Stempel QR Balai Desa' },
                    { key: 'apbdes_bku', label: 'Buku Kas Umum (BKU) & APBDes' },
                    { key: 'bansos_broadcast', label: 'Penyaluran Bansos & Broadcast WhatsApp' },
                    { key: 'agenda_desa', label: 'Pembuatan & Manajemen Agenda Desa' },
                    { key: 'verifikasi_warga', label: 'Verifikasi Warga Baru (Digital Queue)' },
                    { key: 'manajemen_user', label: 'Manajemen Pengguna & Tambah Akun' },
                    { key: 'audit_backup', label: 'Audit Keamanan & Cadangan Database' },
                  ].map((row) => (
                    <tr key={row.key} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{row.label}</td>
                      {['warga', 'rt', 'rw', 'sekdes', 'bendahara', 'kades', 'admin'].map((roleKey) => {
                        const isChecked = rbacMatrix[row.key]?.[roleKey] || false;
                        return (
                          <td key={roleKey} className="py-3.5 px-3 text-center">
                            <label className="inline-flex items-center justify-center cursor-pointer p-1">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleRbac(row.key, roleKey)}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 transition cursor-pointer"
                              />
                            </label>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                <strong>Panduan Admin Non-IT:</strong> Anda bebas mengubah hak akses peran di atas dengan mencentang kotak. Setelah disimpan, wewenang akses akan langsung aktif pada saat peran terkait membuka sistem tanpa perlu memodifikasi kode program.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MENU: LOG AKTIVITAS */}
      {/* ============================================================== */}
      {(menu === 'log_aktivitas' || menu === 'logs') && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari deskripsi, username, IP..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <select
                  value={logActionFilter}
                  onChange={(e) => setLogActionFilter(e.target.value)}
                  className="flex-1 sm:flex-none px-3 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:border-emerald-600 transition"
                >
                  <option value="all">Semua Tipe Aksi</option>
                  <option value="ADMIN_LOGIN">ADMIN_LOGIN</option>
                  <option value="USER_CREATE">USER_CREATE</option>
                  <option value="USER_STATUS_TOGGLE">USER_STATUS_TOGGLE</option>
                  <option value="PASSWORD_RESET">PASSWORD_RESET</option>
                  <option value="DATABASE_BACKUP_EXPORT">DATABASE_BACKUP_EXPORT</option>
                  <option value="SECURITY_REVOKE_ALL_TOKENS">SECURITY_REVOKE_ALL_TOKENS</option>
                </select>

                <button
                  onClick={() => loadDashboardData()}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shrink-0 cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Segarkan</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Riwayat Log Aktivitas & Audit Keamanan ({filteredLogs.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Catatan kronologis immutable setiap operasi administratif sensitif
                </p>
              </div>
            </div>

            {/* Mobile Activity Log Cards (Anti-Terpotong, Ramah Orang Awam) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {paginatedLogs.map((log) => (
                <div key={log.id} className="p-4 space-y-2.5 hover:bg-slate-50/50 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[11px] text-slate-700 shrink-0 border border-slate-200">
                        {(log.user?.name || 'S').charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 text-xs block truncate">{log.user?.name || 'Sistem Otomatis'}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {new Date(log.created_at).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200 shrink-0">
                      {log.action}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    {log.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-0.5">
                    <span>IP: {log.ip_address || '127.0.0.1'}</span>
                  </div>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div className="py-10 text-center text-slate-400 text-xs">
                  Tidak ada catatan log aktivitas yang cocok.
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Waktu Kejadian</th>
                    <th className="py-3.5 px-4">Eksekutor</th>
                    <th className="py-3.5 px-4">Tipe Aksi</th>
                    <th className="py-3.5 px-4">Uraian Transaksi</th>
                    <th className="py-3.5 px-4">Alamat IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-700">
                            {(log.user?.name || 'S').charAt(0)}
                          </span>
                          <span>{log.user?.name || 'Sistem Otomatis'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {log.description}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Tidak ada catatan log aktivitas yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={logPage}
                totalItems={filteredLogs.length}
                pageSize={PAGE_SIZE}
                onPageChange={setLogPage}
                itemLabel="log aktivitas"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MENU: DATA PENDUDUK */}
      {/* ============================================================== */}
      {(menu === 'data_penduduk' || menu === 'penduduk') && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama lengkap, NIK..."
                  value={wargaSearch}
                  onChange={(e) => setWargaSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-semibold text-slate-600 bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-xl border border-slate-100 sm:border-0">
                <span>Total Terdata:</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">{wargaTotal} Warga</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Master Data Kependudukan Desa Doko
                </h3>
                <p className="text-xs text-slate-400">
                  Data kependudukan resmi terintegrasi dengan administrasi surat dan bansos
                </p>
              </div>
            </div>

            {/* Mobile Citizen Cards (Anti-Terpotong, Ramah Orang Awam) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {paginatedWargas.map((w) => (
                <div key={w.id} className="p-4 space-y-2.5 hover:bg-slate-50/50 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 text-sm block truncate">{w.nama_lengkap}</span>
                      <span className="font-mono text-xs font-semibold text-emerald-800">NIK: {w.nik}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      {w.status_kependudukan || 'Tetap'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Wilayah</span>
                      <span className="font-semibold text-slate-700">
                        {w.rt ? `RT ${w.rt.nomor_rt} / RW ${w.rt.rw?.nomor_rw || '01'}` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Jenis Kelamin</span>
                      <span className="font-semibold text-slate-700">{w.jenis_kelamin || '-'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pekerjaan</span>
                      <span className="font-medium text-slate-700">{w.pekerjaan || '-'}</span>
                    </div>
                  </div>
                </div>
              ))}

              {paginatedWargas.length === 0 && (
                <div className="py-10 text-center text-slate-400 text-xs">
                  {isWargaLoading ? 'Memuat master data kependudukan...' : 'Tidak ada data warga yang cocok dengan pencarian.'}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">NIK</th>
                    <th className="py-3.5 px-4">Nama Lengkap</th>
                    <th className="py-3.5 px-4">Wilayah</th>
                    <th className="py-3.5 px-4">Jenis Kelamin</th>
                    <th className="py-3.5 px-4">Pekerjaan</th>
                    <th className="py-3.5 px-4">Status Kependudukan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedWargas.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{w.nik}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{w.nama_lengkap}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {w.rt ? `RT ${w.rt.nomor_rt} / RW ${w.rt.rw?.nomor_rw || '01'}` : '-'}
                      </td>
                      <td className="py-3.5 px-4">{w.jenis_kelamin || '-'}</td>
                      <td className="py-3.5 px-4">{w.pekerjaan || '-'}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {w.status_kependudukan || 'Tetap'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paginatedWargas.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {isWargaLoading ? 'Memuat master data kependudukan...' : 'Tidak ada data warga yang cocok dengan pencarian.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={wargaPage}
                totalItems={wargaTotal}
                pageSize={PAGE_SIZE}
                onPageChange={setWargaPage}
                itemLabel="warga"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MENU: SEMUA SURAT */}
      {/* ============================================================== */}
      {(menu === 'semua_surat' || menu === 'surat') && (
        <div className="space-y-4 sm:space-y-6">
          {/* Visual Analytics & Diagram Status Pengajuan Surat (2x2 Grid di Mobile, 4-Col di Desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 font-bold">
                <span>Total Pengajuan</span>
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
              </div>
              <div className="text-lg sm:text-2xl font-black text-slate-900 font-mono">{surats.length} Surat</div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">Seluruh permohonan warga</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-emerald-700 font-bold">
                <span>Sah & Selesai</span>
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              </div>
              <div className="text-lg sm:text-2xl font-black text-emerald-950 font-mono">
                {surats.filter(s => s.status === 'completed').length} Surat
              </div>
              <div className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold truncate">
                {surats.length > 0 ? Math.round((surats.filter(s => s.status === 'completed').length / surats.length) * 100) : 0}% Penyelesaian
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-blue-700 font-bold">
                <span>Di Balai Desa</span>
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <div className="text-lg sm:text-2xl font-black text-blue-950 font-mono">
                {surats.filter(s => s.status === 'processed_sekdes' || s.status === 'pending_kades').length} Surat
              </div>
              <div className="text-[10px] sm:text-[11px] text-blue-600 font-semibold truncate">
                Legalisasi & TTD Kades
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-5 space-y-1.5 sm:space-y-2">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-amber-700 font-bold">
                <span>Menunggu RT</span>
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
              </div>
              <div className="text-lg sm:text-2xl font-black text-amber-950 font-mono">
                {surats.filter(s => s.status === 'pending_rt').length} Surat
              </div>
              <div className="text-[10px] sm:text-[11px] text-amber-600 font-semibold truncate">
                Pengantar Ketua RT
              </div>
            </div>
          </div>

          {/* Diagram Bar Proporsi Alur Layanan Surat */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Distribusi Alur Surat Resmi (Direct RT ke Kepala Desa)</span>
              <span className="text-[11px] font-mono text-slate-500">{surats.length} Surat</span>
            </div>
            {(() => {
              const total = Math.max(surats.length, 1);
              const nSah = surats.filter(s => s.status === 'completed').length;
              const nDesa = surats.filter(s => s.status === 'processed_sekdes' || s.status === 'pending_kades').length;
              const nRt = surats.filter(s => s.status === 'pending_rt').length;
              const nTolak = surats.filter(s => s.status === 'rejected' || s.status === 'rejected_kades').length;
              const pSah = Math.round((nSah / total) * 100);
              const pDesa = Math.round((nDesa / total) * 100);
              const pRt = Math.round((nRt / total) * 100);
              const pTolak = Math.max(0, 100 - (pSah + pDesa + pRt));

              return (
                <div className="space-y-2">
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                    <div style={{ width: `${pSah}%` }} className="bg-emerald-600 transition-all duration-500" title={`Sah & Selesai: ${pSah}%`} />
                    <div style={{ width: `${pDesa}%` }} className="bg-blue-500 transition-all duration-500" title={`Kantor Desa: ${pDesa}%`} />
                    <div style={{ width: `${pRt}%` }} className="bg-amber-500 transition-all duration-500" title={`Menunggu RT: ${pRt}%`} />
                    <div style={{ width: `${pTolak}%` }} className="bg-rose-500 transition-all duration-500" title={`Ditolak: ${pTolak}%`} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-semibold text-slate-600 pt-1">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Sah & Selesai ({pSah}%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Balai Desa ({pDesa}%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Menunggu RT ({pRt}%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Ditolak ({pTolak}%)</span>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nomor surat, nama pemohon, jenis surat..."
                  value={suratSearch}
                  onChange={(e) => setSuratSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                />
              </div>

              <select
                value={suratStatusFilter}
                onChange={(e) => setSuratStatusFilter(e.target.value)}
                className="px-3 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:outline-none focus:border-emerald-600 transition"
              >
                <option value="all">Semua Status Persuratan</option>
                <option value="pending_rt">Menunggu RT (pending_rt)</option>
                <option value="processed_sekdes">Di Kantor Desa (pending_kades)</option>
                <option value="completed">Selesai & Sah (completed)</option>
                <option value="rejected">Ditolak (rejected)</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Daftar Seluruh Pengajuan Surat ({filteredSurats.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Rekapitulasi lengkap berkas permohonan surat warga Desa Doko
                </p>
              </div>
            </div>

            {/* Mobile Letter Cards (Anti-Terpotong, Ramah Orang Awam) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {paginatedSurats.map((s) => (
                <div key={s.id} className="p-4 space-y-2.5 hover:bg-slate-50/50 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 text-sm block truncate">
                        {s.surat_type?.nama_surat || 'Surat Keterangan'}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 font-medium block truncate">
                        {s.nomor_surat || '(Menunggu Pengesahan Kades)'}
                      </span>
                    </div>
                    <div className="shrink-0">
                      {s.status === 'completed' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Sah & Selesai
                        </span>
                      )}
                      {(s.status === 'processed_sekdes' || s.status === 'pending_kades') && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          Di Balai Desa
                        </span>
                      )}
                      {s.status === 'pending_rt' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Menunggu RT
                        </span>
                      )}
                      {(s.status === 'rejected' || s.status === 'rejected_kades') && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Ditolak
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <div className="min-w-0 mr-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pemohon</span>
                      <span className="font-semibold text-slate-800 truncate block">{s.warga?.nama_lengkap || '-'}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tgl Pengajuan</span>
                      <span className="font-mono text-slate-600">{new Date(s.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              ))}

              {filteredSurats.length === 0 && (
                <div className="py-10 text-center text-slate-400 text-xs">
                  {surats.length === 0 ? 'Memuat data persuratan...' : 'Tidak ada data surat yang cocok dengan filter.'}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Nomor Surat</th>
                    <th className="py-3.5 px-4">Jenis Surat</th>
                    <th className="py-3.5 px-4">Pemohon</th>
                    <th className="py-3.5 px-4">Tgl Pengajuan</th>
                    <th className="py-3.5 px-4">Status Alur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedSurats.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {s.nomor_surat || '(Menunggu Pengesahan)'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {s.surat_type?.nama_surat || 'Surat Keterangan'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {s.warga?.nama_lengkap || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {new Date(s.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="py-3.5 px-4">
                        {s.status === 'completed' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Sah & Selesai
                          </span>
                        )}
                        {(s.status === 'processed_sekdes' || s.status === 'pending_kades') && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Di Kantor Desa
                          </span>
                        )}
                        {s.status === 'pending_rt' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Menunggu ACC RT
                          </span>
                        )}
                        {(s.status === 'rejected' || s.status === 'rejected_kades') && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Ditolak
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredSurats.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        {surats.length === 0 ? 'Memuat data persuratan...' : 'Tidak ada data surat yang cocok dengan filter.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={suratPage}
                totalItems={filteredSurats.length}
                pageSize={PAGE_SIZE}
                onPageChange={setSuratPage}
                itemLabel="surat"
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. MENU: DATA KEUANGAN (PENGAWASAN APBDES) */}
      {/* ============================================================== */}
      {(menu === 'data_keuangan' || menu === 'keuangan') && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Pengawasan APBDes & Transparansi Keuangan Desa
                </h2>
                <p className="text-xs text-slate-500">
                  Ringkasan realisasi APBDes dan ikhtisar kas desa yang dikelola oleh Bendahara Desa
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-4 sm:my-6">
              <div className="p-3.5 sm:p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <span className="text-xs font-semibold text-emerald-800">Total Pendapatan Desa</span>
                <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-emerald-900">
                  Rp {(apbdesData?.summary?.pendapatan?.realisasi || 675000000).toLocaleString('id-ID')}
                </div>
                <p className="text-[11px] sm:text-xs text-emerald-700/80 mt-1">
                  Anggaran: Rp {(apbdesData?.summary?.pendapatan?.anggaran || 1110000000).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl border border-blue-200 bg-blue-50/40">
                <span className="text-xs font-semibold text-blue-800">Total Belanja Realisasi</span>
                <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-blue-900">
                  Rp {(apbdesData?.summary?.belanja?.realisasi || 217500000).toLocaleString('id-ID')}
                </div>
                <p className="text-[11px] sm:text-xs text-blue-700/80 mt-1">
                  Anggaran: Rp {(apbdesData?.summary?.belanja?.anggaran || 235000000).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl border border-purple-200 bg-purple-50/40">
                <span className="text-xs font-semibold text-purple-800">Surplus / Saldo Kas Desa</span>
                <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold text-purple-900">
                  Rp {((apbdesData?.summary?.pendapatan?.realisasi || 675000000) - (apbdesData?.summary?.belanja?.realisasi || 217500000)).toLocaleString('id-ID')}
                </div>
                <p className="text-[11px] sm:text-xs text-purple-700/80 mt-1">Kondisi Fiskal Desa: SEHAT</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
              <span>Pengelolaan teknis pembukuan harian dijalankan oleh Kaur Keuangan / Bendahara Desa.</span>
              <span className="font-semibold text-emerald-700">Tersinkronisasi dengan Portal APBDes</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. MENU: BACKUP DATA */}
      {/* ============================================================== */}
      {(menu === 'backup_data' || menu === 'backup') && (
        <div className="space-y-4 sm:space-y-6">
          {/* Header Banner Bersih Putih */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                <Database className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Disaster Recovery & Business Continuity
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Snapshot Engine v2.0
                  </span>
                </div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 mt-1">
                  Pencadangan & Pemulihan Basis Data (Backup & Restore)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Amankan data warga, transaksi kas, dan arsip persuratan dalam satu berkas terenkripsi, serta pulihkan kembali kapanpun dibutuhkan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-3 border-t border-slate-100">
              <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] sm:text-xs text-slate-500 block">Frekuensi Pencadangan</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1 block">Otomatis / Sesuai Permintaan</span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] sm:text-xs text-slate-500 block">Format Berkas Snapshot</span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 mt-1 block">JSON Structured Snapshot</span>
              </div>
              <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] sm:text-xs text-slate-500 block">Status Integritas Data</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-700 mt-1 block">Tersinkronisasi 100%</span>
              </div>
            </div>
          </div>

          {/* Dual Operation Cards: Backup (Export) & Restore (Import) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* KARTU 1: BACKUP (EKSPOR DATA) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0 border border-emerald-100">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">1. Ekspor Cadangan Data (Backup)</h3>
                    <p className="text-xs text-slate-500">Unduh salinan data sistem lengkap dalam format JSON terenkripsi.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <span className="font-bold text-slate-800 block">Cakupan Data Cadangan:</span>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    <li>Identitas & Kop Surat Resmi Desa (DesaSetting)</li>
                    <li>Master Wilayah Rukun Tetangga (RT) & Rukun Warga (RW)</li>
                    <li>Katalog Pengguna & Pejabat Desa Terdaftar</li>
                    <li>Metadata Kependudukan & Riwayat Pengajuan Surat</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Snapshot dibuat secara langsung (real-time) dari basis data aktif tanpa mengganggu operasional sistem.</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Backup Basis Data (.json)</span>
                </button>
              </div>
            </div>

            {/* KARTU 2: RESTORE (PEMULIHAN DATA) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0 border border-blue-100">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">2. Pemulihan Data dari Cadangan (Restore)</h3>
                    <p className="text-xs text-slate-500">Unggah berkas snapshot JSON untuk mengembalikan data sistem.</p>
                  </div>
                </div>

                {/* File Upload Dropzone / Trigger */}
                <input
                  type="file"
                  ref={restoreFileInputRef}
                  accept=".json,application/json"
                  onChange={handleRestoreFileSelect}
                  className="hidden"
                />

                {!restoreFile ? (
                  <button
                    type="button"
                    onClick={() => restoreFileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 p-6 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition cursor-pointer text-center group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                        Pilih Berkas Cadangan (.json)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Klik untuk memilih berkas snapshot dari komputer Anda
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <FileCheck2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 block truncate">{restoreFile.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{(restoreFile.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRestoreFile(null);
                          setRestorePreview(null);
                          if (restoreFileInputRef.current) restoreFileInputRef.current.value = '';
                        }}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer shrink-0"
                      >
                        Batal
                      </button>
                    </div>

                    {restorePreview && (
                      <div className="p-2.5 rounded-xl bg-white border border-blue-100 text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Sistem:</span>
                          <span className="font-semibold text-slate-700">{restorePreview.system || 'SiDesKu'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Versi:</span>
                          <span className="font-semibold text-slate-700">{restorePreview.version || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Tanggal Ekspor:</span>
                          <span className="font-semibold text-slate-700">
                            {restorePreview.exported_at ? new Date(restorePreview.exported_at).toLocaleString('id-ID') : '-'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Pemulihan akan memperbarui konfigurasi desa, data wilayah RT/RW, dan akun pengguna sesuai isi berkas cadangan.</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRestoreConfirmModal(true)}
                  disabled={!restoreFile || isRestoring}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Mulai Pemulihan Basis Data (Restore)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. MENU: KEAMANAN SISTEM */}
      {/* ============================================================== */}
      {(menu === 'keamanan' || menu === 'security') && (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Security Posture Check */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <span>Parameter Keamanan & Kriptografi</span>
              </h2>
              <p className="text-xs text-slate-500 mb-4 sm:mb-6">
                Standar pengamanan akses data sensitif warga dan arsip legal
              </p>

              <div className="space-y-2.5 sm:space-y-3.5 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-emerald-950">Autentikasi Token Kriptografis</span>
                  </div>
                  <span className="font-bold text-emerald-800 text-[11px] sm:text-xs">Sanctum Active</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-emerald-950">Algoritma Hashing Kata Sandi</span>
                  </div>
                  <span className="font-bold text-emerald-800 text-[11px] sm:text-xs">bcrypt (Cost: 12)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-emerald-950">Integritas Dokumen Sah</span>
                  </div>
                  <span className="font-bold text-emerald-800 text-[11px] sm:text-xs">SHA-256 QR</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-emerald-950">Perlindungan Berkas Privat</span>
                  </div>
                  <span className="font-bold text-emerald-800 text-[11px] sm:text-xs">UU PDP Strict</span>
                </div>
              </div>
            </div>

            {/* Token & Session Management */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-600" />
                  <span>Sesi Pengguna & Revokasi Akses</span>
                </h2>
                <p className="text-xs text-slate-500 mb-4 sm:mb-6">
                  Manajemen kredensial aktif untuk mitigasi insiden siber
                </p>

                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50 mb-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Sesi Token Aktif Sistem:</span>
                    <span className="text-emerald-700 font-bold font-mono">
                      {stats?.server.active_tokens_count ?? 1} Token Terverifikasi
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Jika Anda mencurigai adanya kebocoran kredensial atau perangkat hilang, Anda dapat mencabut seluruh token sesi dalam satu klik.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowRevokeTokensModal(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs transition cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Cabut Seluruh Sesi Otentikasi (Revoke Tokens)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TAMBAH AKUN BARU */}
      {/* ============================================================== */}
      {showAddUserModal && createPortal(
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddUserModal(false); }}
          className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 flex min-h-full items-end sm:items-center justify-center animate-fade-in"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-4 sm:p-6 relative my-auto">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Tambah Akun Pengguna Baru</h3>
                <p className="text-xs text-slate-500">Daftarkan akun pejabat desa atau warga masyarakat</p>
              </div>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 sm:space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, S.Sos."
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: rt01_doko"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Peran (Role) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={newUserForm.role_id}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 transition bg-white"
                  >
                    <option value="">Pilih Peran...</option>
                    {roles
                      .filter((r) => {
                        if (currentAdmin?.role?.slug === 'super_admin') {
                          return r.slug !== 'super_admin';
                        }
                        // Admin desa hanya boleh membuat peran kades s/d warga
                        return r.slug !== 'super_admin' && r.slug !== 'admin';
                      })
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="nama@sidesku.desa.id"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={newUserForm.phone_number}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi Sementara <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Minimal 6 karakter"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-600 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const rand = 'Desa' + Math.floor(1000 + Math.random() * 9000) + '!';
                      setNewUserForm({ ...newUserForm, password: rand });
                    }}
                    className="px-3 py-2.5 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                  >
                    Acak Sandi
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* MODAL: RESET PASSWORD PAKSA */}
      {/* ============================================================== */}
      {showResetPasswordModal && selectedUserForReset && createPortal(
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowResetPasswordModal(false); }}
          className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 flex min-h-full items-end sm:items-center justify-center animate-fade-in"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-4 sm:p-6 relative my-auto">
            <button
              onClick={() => setShowResetPasswordModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Reset Kata Sandi Akun</h3>
                <p className="text-xs text-slate-500">
                  Untuk pengguna: <strong>{selectedUserForReset.name}</strong> (@{selectedUserForReset.username})
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Masukkan sandi baru..."
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-600 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const rand = 'Pass' + Math.floor(10000 + Math.random() * 90000) + '#';
                      setNewPasswordInput(rand);
                    }}
                    className="px-3 py-2.5 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                  >
                    Acak
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                Perubahan ini bersifat langsung. Pengguna akan menggunakan kata sandi baru ini pada saat login berikutnya.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResetPassword}
                  disabled={isSubmitting || !newPasswordInput.trim()}
                  className="px-5 py-2.5 sm:py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* MODAL: REVOKE ALL TOKENS CONFIRMATION */}
      {/* ============================================================== */}
      {showRevokeTokensModal && createPortal(
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowRevokeTokensModal(false); }}
          className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 flex min-h-full items-end sm:items-center justify-center animate-fade-in"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-4 sm:p-6 relative my-auto">
            <button
              onClick={() => setShowRevokeTokensModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Cabut Seluruh Sesi Otentikasi?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Tindakan ini akan menghapus seluruh Personal Access Tokens yang aktif. Seluruh pengguna dan pejabat desa yang sedang login akan diminta memasukkan username dan password kembali pada permintaan berikutnya.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setShowRevokeTokensModal(false)}
                className="px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleRevokeAllTokens}
                disabled={isSubmitting}
                className="px-5 py-2.5 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? 'Memproses...' : 'Ya, Cabut Seluruh Sesi'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* MODAL: KONFIRMASI RESTORE DATABASE */}
      {/* ============================================================== */}
      {showRestoreConfirmModal && createPortal(
        <div 
          onClick={(e) => { if (e.target === e.currentTarget && !isRestoring) setShowRestoreConfirmModal(false); }}
          className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 flex min-h-full items-end sm:items-center justify-center animate-fade-in"
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-4 sm:p-6 relative my-auto space-y-4">
            <button
              onClick={() => !isRestoring && setShowRestoreConfirmModal(false)}
              disabled={isRestoring}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer disabled:opacity-40"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Konfirmasi Pemulihan Data (Restore)</h3>
                <p className="text-xs text-slate-500">Tindakan pemulihan basis data sistem</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="font-semibold text-slate-900">Berkas yang akan dipulihkan:</div>
              <div className="font-mono text-blue-700 truncate">{restoreFile?.name}</div>
              <div className="text-slate-500 text-[11px] pt-1">
                Sistem akan memproses dan menyinkronkan data profil desa, struktur RT/RW, dan kredensial akun pengguna dari berkas snapshot tersebut.
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Pastikan berkas JSON cadangan yang Anda pilih berasal dari sumber resmi sistem SiDesKu. Apakah Anda yakin ingin melanjutkan?
            </p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => setShowRestoreConfirmModal(false)}
                disabled={isRestoring}
                className="px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteRestore}
                disabled={isRestoring}
                className="px-5 py-2.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs disabled:opacity-60 flex items-center gap-2 cursor-pointer"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memulihkan Data...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Ya, Pulihkan Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
