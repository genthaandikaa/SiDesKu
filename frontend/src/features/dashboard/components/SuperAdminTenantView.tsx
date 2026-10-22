import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Building2,
  Plus,
  Search,
  ShieldCheck,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  MapPin,
  Globe,
  Phone,
  Mail,
  X,
  ExternalLink,
  Activity,
  Layers,
  Lock,
  UserCheck,
  ArrowLeft,
  Info
} from 'lucide-react';
import api from '@/shared/lib/axios';

interface DesaTenant {
  id: number;
  nama_desa: string;
  kode_desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi?: string;
  kode_pos?: string;
  alamat_kantor?: string;
  telepon?: string;
  email?: string;
  website?: string;
  is_active: boolean;
  created_at?: string;
  users_count?: number;
  warga_profiles_count?: number;
  surat_requests_count?: number;
  dusuns_count?: number;
  setting?: {
    nama_kades?: string;
    nama_sekdes?: string;
    kop_atas?: string;
  };
}

interface SuperAdminTenantViewProps {
  initialAction?: 'list' | 'create';
  onNavigate?: (menuId: string) => void;
}

export const SuperAdminTenantView: React.FC<SuperAdminTenantViewProps> = ({ initialAction = 'list', onNavigate }) => {
  const [desas, setDesas] = useState<DesaTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'create'>(initialAction === 'create' ? 'create' : 'list');
  const [selectedDesa, setSelectedDesa] = useState<DesaTenant | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State for New Village Registration
  const [formData, setFormData] = useState({
    nama_desa: '',
    kode_desa: '',
    kecamatan: 'Kecamatan Ngasem',
    kabupaten: 'Kabupaten Kediri',
    provinsi: 'Jawa Timur',
    kode_pos: '64182',
    alamat_kantor: '',
    telepon: '',
    email: '',
    website: '',
    admin_name: '',
    admin_username: '',
    admin_email: '',
    admin_password: 'password123',
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchDesas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/desas');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setDesas(res.data.data);
      }
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Gagal memuat daftar tenant desa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesas();
  }, []);

  useEffect(() => {
    setViewMode(initialAction === 'create' ? 'create' : 'list');
  }, [initialAction]);

  // Filtered Village Tenants
  const filteredDesas = useMemo(() => {
    return desas.filter((d) => {
      const matchSearch =
        d.nama_desa.toLowerCase().includes(search.toLowerCase()) ||
        d.kode_desa.toLowerCase().includes(search.toLowerCase()) ||
        d.kecamatan.toLowerCase().includes(search.toLowerCase()) ||
        d.kabupaten.toLowerCase().includes(search.toLowerCase());

      const matchActive =
        filterActive === 'all'
          ? true
          : filterActive === 'active'
          ? d.is_active
          : !d.is_active;

      return matchSearch && matchActive;
    });
  }, [desas, search, filterActive]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = desas.length;
    const active = desas.filter((d) => d.is_active).length;
    const totalUsers = desas.reduce((acc, curr) => acc + (curr.users_count || 0), 0);
    const totalWarga = desas.reduce((acc, curr) => acc + (curr.warga_profiles_count || 0), 0);
    const totalSurat = desas.reduce((acc, curr) => acc + (curr.surat_requests_count || 0), 0);
    return { total, active, totalUsers, totalWarga, totalSurat };
  }, [desas]);

  // Handle Village Creation
  const handleCreateDesa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_desa || !formData.kode_desa || !formData.admin_username || !formData.admin_email) {
      showNotification('error', 'Nama desa, kode desa, username admin, dan email wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/super-admin/desas', formData);
      if (res.data?.success) {
        showNotification('success', res.data.message || 'Desa baru berhasil didaftarkan secara terisolasi.');
        setViewMode('list');
        onNavigate?.('kelola_desa');
        // Reset form
        setFormData({
          nama_desa: '',
          kode_desa: '',
          kecamatan: 'Kecamatan Ngasem',
          kabupaten: 'Kabupaten Kediri',
          provinsi: 'Jawa Timur',
          kode_pos: '64182',
          alamat_kantor: '',
          telepon: '',
          email: '',
          website: '',
          admin_name: '',
          admin_username: '',
          admin_email: '',
          admin_password: 'password123',
        });
        await fetchDesas();
      }
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Gagal mendaftarkan tenant desa baru.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (desa: DesaTenant) => {
    try {
      const newStatus = !desa.is_active;
      const res = await api.put(`/super-admin/desas/${desa.id}`, { is_active: newStatus });
      if (res.data?.success) {
        showNotification('success', `Status ${desa.nama_desa} berhasil diubah.`);
        setDesas((prev) =>
          prev.map((d) => (d.id === desa.id ? { ...d, is_active: newStatus } : d))
        );
        if (selectedDesa?.id === desa.id) {
          setSelectedDesa({ ...selectedDesa, is_active: newStatus });
        }
      }
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Gagal mengubah status desa.');
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 animate-fade-in">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {viewMode === 'create' ? (
        <div className="space-y-5 animate-fade-in">
          {/* Breadcrumb / Back Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setViewMode('list');
                onNavigate?.('kelola_desa');
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition cursor-pointer shadow-2xs group"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-0.5 transition" />
              <span>Kembali ke Daftar Tenant Desa</span>
            </button>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">Provisioning ID: REG-DESA-NEW</span>
          </div>

          {/* Header Banner Bersih Putih */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> Platform Super Administrator
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Arsitektur Multi-Tenant Terisolasi
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Registrasi & Provisioning Desa Baru
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
              Daftarkan entitas desa baru ke dalam platform SiDesKu. Sistem secara otomatis menyiapkan basis data tenant terisolasi (desa_id), kop surat default, katalog pelayanan surat, serta akun administrator desa perdana.
            </p>
          </div>

          {/* Dedicated Full-Page Form */}
          <form onSubmit={handleCreateDesa} className="space-y-5">
            {/* 1. Identitas Wilayah */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0 border border-emerald-100">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">1. Identitas Wilayah & Kantor Desa</h3>
                  <p className="text-xs text-slate-400">Informasi resmi desa untuk keperluan kop surat, legalitas, dan kontak pelayanan warga.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Desa <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_desa}
                    onChange={(e) => setFormData({ ...formData, nama_desa: e.target.value })}
                    placeholder="Contoh: Desa Sukorejo"
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kode Desa Kemendagri <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kode_desa}
                    onChange={(e) => setFormData({ ...formData, kode_desa: e.target.value })}
                    placeholder="Contoh: 35.06.04.2002"
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kecamatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kecamatan}
                    onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                    placeholder="Contoh: Kecamatan Ngasem"
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kabupaten <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kabupaten}
                    onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                    placeholder="Contoh: Kabupaten Kediri"
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    value={formData.provinsi}
                    onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                    placeholder="Jawa Timur"
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    value={formData.kode_pos}
                    onChange={(e) => setFormData({ ...formData, kode_pos: e.target.value })}
                    placeholder="64182"
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Alamat Kantor Balai Desa
                  </label>
                  <input
                    type="text"
                    value={formData.alamat_kantor}
                    onChange={(e) => setFormData({ ...formData, alamat_kantor: e.target.value })}
                    placeholder="Contoh: Jl. Sukorejo No. 01, Kec. Ngasem, Kab. Kediri"
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Telepon / WhatsApp Resmi Desa
                  </label>
                  <input
                    type="text"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="Contoh: 0354-689999 / 08123456789"
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Resmi Desa
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Contoh: pemdes.sukorejo@kedirikab.go.id"
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Website / Portal Resmi Desa
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="Contoh: https://sukorejo.desa.id"
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* 2. Akun Administrator Desa Utama */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0 border border-blue-100">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">2. Akun Administrator Desa Utama</h3>
                  <p className="text-xs text-slate-400">Akun dengan wewenang Admin Desa untuk mengelola sistem internal desa ini.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nama Lengkap Admin <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.admin_name}
                    onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                    placeholder="Contoh: Admin Desa Sukorejo"
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Username Login Admin <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.admin_username}
                    onChange={(e) => setFormData({ ...formData, admin_username: e.target.value })}
                    placeholder="Contoh: admin_sukorejo"
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Admin <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.admin_email}
                    onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                    placeholder="Contoh: admin@sukorejo.desa.id"
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Password Default Akun
                  </label>
                  <input
                    type="text"
                    value={formData.admin_password}
                    onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                    placeholder="password123"
                    className="w-full px-3.5 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="p-3 sm:p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Informasi Akses Administrator:</span>
                  <p className="text-slate-600 mt-0.5">
                    Admin desa baru dapat langsung login menggunakan username dan password di atas untuk mengonfigurasi perangkat desa, data RT/RW, dan katalog surat pelayanan warga.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Action Buttons */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setViewMode('list');
                  onNavigate?.('kelola_desa');
                }}
                className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer text-center"
              >
                Batal & Kembali
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition shadow-xs disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan Tenant...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan & Daftarkan Desa Baru</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* List View */
        <>
          {/* Header Banner */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> Platform Super Administrator
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Arsitektur Multi-Tenant Terisolasi
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                Manajemen Tenant & Registrasi Desa
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Kelola seluruh entitas desa terdaftar, provisioning tenant baru, dan pantau operasional antar desa secara aman.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
              <button
                onClick={fetchDesas}
                disabled={loading}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition shadow-2xs disabled:opacity-60 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                <span>Segarkan</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('create');
                  onNavigate?.('tambah_desa');
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Daftarkan Desa Baru</span>
              </button>
            </div>
          </div>

          {/* Metric Stat Cards (Compact 2-Col Grid on Mobile, 5-Col on Desktop) */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-3.5 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Tenant Desa
                </span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xl sm:text-3xl font-extrabold text-slate-900">{stats.total}</span>
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {stats.active} Aktif
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">Wilayah Terdaftar di Platform</p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-3.5 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Akun Pejabat
                </span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xl sm:text-3xl font-extrabold text-slate-900">{stats.totalUsers}</span>
                <span className="text-[10px] sm:text-xs font-medium text-slate-500">Akun</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">Admin, Kades, Sekdes, RT/RW</p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-3.5 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Jiwa Penduduk
                </span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xl sm:text-3xl font-extrabold text-slate-900">{stats.totalWarga}</span>
                <span className="text-[10px] sm:text-xs font-medium text-slate-500">Warga</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">Terdata di Buku Register</p>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-3.5 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Volume Surat
                </span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xl sm:text-3xl font-extrabold text-slate-900">{stats.totalSurat}</span>
                <span className="text-[10px] sm:text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Dokumen
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">Tercatat Lintas Desa</p>
            </div>

            <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-3.5 sm:p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Isolasi Data
                </span>
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 shrink-0">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-xl sm:text-3xl font-extrabold text-slate-900">100%</span>
                <span className="text-[10px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Ketat
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">Scope desa_id & Guard Aktif</p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama desa, kode desa, kecamatan..."
                className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
              />
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
              <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                {(['all', 'active', 'inactive'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterActive(f)}
                    className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer text-center ${
                      filterActive === f
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {f === 'all' ? 'Semua' : f === 'active' ? 'Aktif' : 'Non-Aktif'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Village Tenants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {filteredDesas.map((desa) => (
              <div
                key={desa.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Header Card */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {desa.kode_desa}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            desa.is_active
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {desa.is_active ? '● Aktif' : '○ Non-Aktif'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5 group-hover:text-emerald-700 transition truncate">
                        {desa.nama_desa}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{desa.kecamatan}, {desa.kabupaten}</span>
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-100">
                      <Building2 className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Tenant Operational Stats */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 border-b border-slate-100 text-center">
                    <div className="p-2 rounded-xl bg-slate-50">
                      <div className="text-base font-extrabold text-slate-900">
                        {desa.warga_profiles_count ?? 0}
                      </div>
                      <div className="text-[10px] font-medium text-slate-500">Warga</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50">
                      <div className="text-base font-extrabold text-slate-900">
                        {desa.surat_requests_count ?? 0}
                      </div>
                      <div className="text-[10px] font-medium text-slate-500">Surat</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50">
                      <div className="text-base font-extrabold text-slate-900">
                        {desa.users_count ?? 0}
                      </div>
                      <div className="text-[10px] font-medium text-slate-500">Petugas</div>
                    </div>
                  </div>

                  {/* Village Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {desa.telepon && (
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{desa.telepon}</span>
                      </div>
                    )}
                    {desa.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{desa.email}</span>
                      </div>
                    )}
                    {desa.alamat_kantor && (
                      <div className="text-[11px] text-slate-500 line-clamp-1">
                        {desa.alamat_kantor}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions (Thumb-Friendly, Equal Flex) */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-3">
                  <button
                    onClick={() => setSelectedDesa(desa)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Detail</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(desa)}
                    className={`flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs ${
                      desa.is_active
                        ? 'border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800'
                        : 'border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <span>{desa.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredDesas.length === 0 && !loading && (
            <div className="p-8 sm:p-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-xs">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Tidak ada tenant desa ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan kata kunci pencarian lain atau daftarkan tenant desa baru.
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal Detail Tenant */}
      {selectedDesa && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDesa(null);
          }}
          className="fixed inset-0 z-[999999] overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 flex min-h-full items-end sm:items-center justify-center animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-100 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedDesa.nama_desa}</h3>
                  <p className="text-xs text-slate-400 font-mono">Kode Kemendagri: {selectedDesa.kode_desa}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDesa(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-slate-400 font-medium">Kecamatan:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedDesa.kecamatan}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Kabupaten:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedDesa.kabupaten}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Provinsi:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedDesa.provinsi || 'Jawa Timur'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Kode Pos:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedDesa.kode_pos || '-'}</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <span className="text-slate-400 font-medium">Alamat Kantor:</span>
                <p className="font-medium text-slate-800">{selectedDesa.alamat_kantor || '-'}</p>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-slate-600">
                  <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /><span>{selectedDesa.telepon || '-'}</span></span>
                  <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /><span>{selectedDesa.email || '-'}</span></span>
                </div>
              </div>

              {selectedDesa.setting && (
                <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 space-y-1">
                  <span className="text-emerald-800 font-bold">Pejabat Utama Desa:</span>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <span className="text-slate-500 text-[11px]">Kepala Desa:</span>
                      <p className="font-bold text-slate-900">{selectedDesa.setting.nama_kades || '-'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px]">Sekretaris Desa:</span>
                      <p className="font-bold text-slate-900">{selectedDesa.setting.nama_sekdes || '-'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDesa(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
