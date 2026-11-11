import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Upload,
  Download,
  CheckCircle2,
  Share2,
  Edit3,
  Award,
  GraduationCap,
  Ribbon,
  Eye,
  Plus,
  Building2,
  Coffee,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Banknote,
  Clock,
  Sparkles,
  Check,
  X,
  MoreVertical,
  Bell,
  Bookmark,
  Home,
  ArrowRight
} from 'lucide-react';
import { JobSeekerProfile, LamaranLoker } from '../types';
import { smartCityApi } from '../api/smartCityApi';
import {
  getStoredJobSeekerProfile,
  saveStoredJobSeekerProfile,
  getStoredLamaranList,
  sanitizeJobSeekerProfile
} from '../smartCityStorage';
import { useAuth } from '@/shared/context/AuthContext';

export const LokerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [lamaranList, setLamaranList] = useState<LamaranLoker[]>([]);
  const [activeTab, setActiveTab] = useState<'profil' | 'riwayat' | 'disimpan' | 'notifikasi'>('profil');

  // Interactive feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit Profile Form State
  const [editNama, setEditNama] = useState('');
  const [editDomisili, setEditDomisili] = useState('');
  const [editStatusKerja, setEditStatusKerja] = useState('');
  const [editGaji, setEditGaji] = useState('');
  const [editArea, setEditArea] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    // Fetch from backend API
    smartCityApi.getJobSeekerProfile().then((raw) => {
      const p = sanitizeJobSeekerProfile(raw);
      if (user?.name && (!p.nama || p.nama === 'Budi Pratama')) {
        p.nama = user.name;
      }
      setProfile(p);
      setEditNama(p.nama);
      setEditDomisili(p.domisili);
      setEditStatusKerja(p.statusKerja);
      setEditGaji(p.preferensi.gaji);
      setEditArea(p.preferensi.area);
    }).catch(() => {
      const raw = getStoredJobSeekerProfile();
      const p = sanitizeJobSeekerProfile(raw);
      if (user?.name && (!p.nama || p.nama === 'Budi Pratama')) {
        p.nama = user.name;
      }
      setProfile(p);
      setEditNama(p.nama);
      setEditDomisili(p.domisili);
      setEditStatusKerja(p.statusKerja);
      setEditGaji(p.preferensi.gaji);
      setEditArea(p.preferensi.area);
    });

    smartCityApi.getLokerApplications().then((apps) => {
      setLamaranList(apps);
    }).catch(() => {
      setLamaranList(getStoredLamaranList());
    });
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Tautan profil pencari kerja berhasil disalin ke clipboard!');
  };

  const handleReplaceCv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const updatedProfile: JobSeekerProfile = {
        ...profile,
        cvUtama: {
          ...profile.cvUtama,
          name: file.name,
          size: `${sizeMb} MB`,
          lastUpdated: 'Hari ini'
        }
      };
      smartCityApi.saveJobSeekerProfile(updatedProfile);
      setProfile(updatedProfile);
      showToast(`Berkas CV berhasil diperbarui: ${file.name}`);
    }
  };

  const handleDownloadCv = () => {
    showToast(`Mengunduh berkas ${profile?.cvUtama.name}...`);
  };

  const handleSaveProfileEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const updated: JobSeekerProfile = {
      ...profile,
      nama: editNama,
      domisili: editDomisili,
      statusKerja: editStatusKerja,
      terakhirUpdate: 'Baru saja',
      preferensi: {
        ...profile.preferensi,
        gaji: editGaji,
        area: editArea
      }
    };
    smartCityApi.saveJobSeekerProfile(updated);
    setProfile(updated);
    setIsEditModalOpen(false);
    showToast('Perubahan profil berhasil disimpan!');
  };

  if (!user) {
    return (
      <div className="w-full pb-20 font-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/smart-city/loker" className="hover:text-blue-600 transition-colors">
              Bursa Kerja
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold">Profil Pencari Kerja</span>
          </nav>

          {/* Auth Gate Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Masuk untuk Mengakses Profil & Riwayat Lamaran
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Untuk menjaga privasi berkas kependudukan dan kurasi bursa kerja terpercaya, Anda perlu masuk ke akun terlebih dahulu sebelum melihat CV aktif, sertifikat, dan memantau status lamaran.
              </p>
            </div>

            {/* Demographics Information: Warga Kediri vs Luar Kediri */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto pt-2">
              <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Warga Kota Kediri</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gunakan akun warga yang didaftarkan kelurahan/RT setempat. NIK otomatis terverifikasi dan mendapat prioritas penempatan program kerja lokal dan kemitraan usaha.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <span>Pencari Kerja Luar Daerah</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bagi pencari kerja dari luar wilayah Kota Kediri (Kabupaten Kediri, Nganjuk, Tulungagung, Surabaya, dsb), Anda tetap dapat melamar lowongan kerja bertanda terbuka luas.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <Link
                to="/login?redirect=/smart-city/loker/profil"
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Masuk ke Akun Saya</span>
              </Link>
              <Link
                to="/smart-city/loker"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Jelajahi Lowongan Terbuka</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-sans">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 text-blue-600 flex items-center justify-center mb-4">
          <Briefcase className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Memuat profil pencari kerja...</h2>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 text-xs text-slate-500 mb-6 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/90 shadow-2xs backdrop-blur-sm flex-wrap">
          <Link to="/" className="hover:text-blue-600 transition-colors inline-flex items-center gap-1 font-medium text-slate-600">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Beranda</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/smart-city/loker" className="hover:text-blue-600 transition-colors inline-flex items-center gap-1 font-medium text-slate-600">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Bursa Kerja</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Profil & CV Saya</span>
          </span>
        </nav>

        {/* Profile Header Banner (Matching Stitch Screen 1) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Citizen Info with Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              {/* Avatar with Verified Badge */}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-sky-100 shrink-0 bg-slate-100">
                <img
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={profile.nama}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Warga Terverifikasi">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              {/* Names & Metadata */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {profile.nama}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-blue-700 border border-sky-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Warga Terverifikasi NIK: {profile.nik}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Pencari Kerja Aktif • Domisili {profile.domisili}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {profile.statusKerja}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {profile.terakhirUpdate}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
              <button
                type="button"
                onClick={handleShareProfile}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan Profil</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs transition-all shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profil</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Matching Stitch Screen 1) */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('profil')}
              className={`pb-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'profil'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Profil & CV Saya</span>
              {activeTab === 'profil' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('riwayat')}
              className={`pb-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'riwayat'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Riwayat Lamaran</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                {lamaranList.length}
              </span>
              {activeTab === 'riwayat' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('disimpan')}
              className={`pb-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'disimpan'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Lowongan Disimpan</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                5
              </span>
              {activeTab === 'disimpan' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('notifikasi')}
              className={`pb-3 text-xs sm:text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'notifikasi'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Pemberitahuan Seleksi</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              {activeTab === 'notifikasi' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Tab 1 Content: Profil & CV Saya */}
        {activeTab === 'profil' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (65%) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Section 1: CV Utama Aktif */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      DOKUMEN KURIKULUM VITAE
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">CV Utama Aktif</h2>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-blue-700 border border-sky-200">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    Terlihat oleh HR Terverifikasi
                  </span>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-extrabold text-xs shadow-xs">
                      PDF
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base break-all">
                          {profile.cvUtama.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                          {profile.cvUtama.size}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>Terakhir diperbarui: {profile.cvUtama.lastUpdated}</span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center text-emerald-700 font-semibold">
                          <Check className="w-3 h-3 mr-0.5 stroke-[3]" /> Lolos Format ATS
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={handleDownloadCv}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </button>

                    <label className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Ganti CV</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleReplaceCv}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 2: Berkas Pendukung & Portofolio (3 Cards) */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      KELENGKAPAN ADMINISTRASI
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">Berkas Pendukung & Portofolio</h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast('Pilih dokumen ijazah atau sertifikat pendukung dari perangkat Anda.')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Berkas</span>
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.berkasPendukung.map((berkas) => {
                    let IconComp = Award;
                    if (berkas.icon === 'graduation') IconComp = GraduationCap;
                    if (berkas.icon === 'ribbon') IconComp = Ribbon;

                    return (
                      <div
                        key={berkas.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/30 transition-colors flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                              <IconComp className="w-5 h-5" />
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                berkas.status === 'Valid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {berkas.status}
                            </span>
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                            {berkas.judul}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-1">
                            {berkas.subjudul}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700">{berkas.noReg}</span>
                          <button
                            type="button"
                            onClick={() => showToast(`Opsi berkas ${berkas.judul}`)}
                            className="p-1 hover:text-slate-800 text-slate-400"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Status Lamaran Terkini */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      JEJAK AKTIVITAS
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">Status Lamaran Terkini</h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('riwayat')}
                    className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors gap-1"
                  >
                    <span>Lihat Seluruh Riwayat ({lamaranList.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {lamaranList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          {item.iconType === 'coffee' ? (
                            <Coffee className="w-5 h-5" />
                          ) : (
                            <Building2 className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900">
                            {item.lokerPosisi}
                          </h4>
                          <p className="text-xs text-slate-600 mt-0.5">
                            • {item.lokerPerusahaan}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Dikirimkan: {item.tanggalLamar} • Menggunakan {item.cvFileName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div className="md:text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                              item.status.includes('Wawancara')
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            {item.status}
                          </span>
                          <span className="block text-[11px] text-slate-500 mt-1">
                            {item.substatusText || 'Status Terupdate'}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (35%) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card 1: Keahlian Terdata */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Keahlian Terdata</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const skill = prompt('Masukkan keahlian baru:');
                      if (skill && profile) {
                        const updated: JobSeekerProfile = {
                          ...profile,
                          keahlian: [...profile.keahlian, skill.trim()]
                        };
                        saveStoredJobSeekerProfile(updated);
                        setProfile(updated);
                        showToast(`Keahlian ditambahkan: ${skill}`);
                      }
                    }}
                    className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center font-bold text-sm"
                    title="Tambah Keahlian"
                  >
                    +
                  </button>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Keahlian terverifikasi membantu algoritma SiDesKu mencocokkan CV Anda dengan rekrutmen mitra BUMDes dan perusahaan kawasan.
                </p>

                <div className="space-y-2 pt-2">
                  {profile.keahlian.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Preferensi Kerja */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Preferensi Kerja</h3>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Ubah
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Area Penempatan</span>
                    </div>
                    <p className="font-bold text-slate-900 mt-0.5">{profile.preferensi.area}</p>
                    <p className="text-slate-400 text-[11px]">{profile.preferensi.radius}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Banknote className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ekspektasi Gaji</span>
                    </div>
                    <p className="font-bold text-slate-900 mt-0.5">{profile.preferensi.gaji}</p>
                    <p className="text-slate-400 text-[11px]">{profile.preferensi.gajiSub}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tipe Pekerjaan</span>
                    </div>
                    <p className="font-bold text-slate-900 mt-0.5">{profile.preferensi.tipe}</p>
                    <p className="text-slate-400 text-[11px]">{profile.preferensi.tipeSub}</p>
                  </div>
                </div>
              </div>

              {/* Card 3: Perlindungan Data Warga */}
              <div className="p-5 rounded-3xl bg-blue-50/50 border border-blue-100 space-y-2.5">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Perlindungan Data Warga</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Data NIK dan nomor kontak Anda dienkripsi. Hanya mitra pengusaha dan HR yang telah divalidasi oleh Tim Desa Terpadu yang dapat melihat nomor kontak langsung Anda.
                </p>
                <a
                  href="#privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Kebijakan Privasi Data Tenaga Kerja SiDesKu aktif sesuai regulasi perlindungan data pribadi.');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 pt-1"
                >
                  <span>Pengaturan Privasi & Izin Data</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2 Content: Riwayat Lamaran */}
        {activeTab === 'riwayat' && (
          <div className="mt-8 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
              Daftar Riwayat Pengajuan Lamaran ({lamaranList.length})
            </h2>

            <div className="mt-6 space-y-4">
              {lamaranList.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      {item.iconType === 'coffee' ? (
                        <Coffee className="w-6 h-6" />
                      ) : (
                        <Building2 className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {item.lokerPosisi}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        {item.lokerPerusahaan}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Tanggal Mengajukan: {item.tanggalLamar} • Berkas: {item.cvFileName}
                      </p>
                    </div>
                  </div>

                  <div className="md:text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        item.status.includes('Wawancara')
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      {item.status}
                    </span>
                    <span className="block text-xs text-slate-500 mt-1">
                      {item.substatusText || 'Berkas Terverifikasi'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3 Content: Lowongan Disimpan */}
        {activeTab === 'disimpan' && (
          <div className="mt-8 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
              Lowongan Yang Anda Simpan (5)
            </h2>
            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Staf Administrasi & Pendataan Warga</h4>
                  <p className="text-xs text-slate-500">PT Solusi Distribusi Kota • Rp 4.900.000 – Rp 5.500.000</p>
                </div>
                <Link
                  to="/smart-city/loker/loker-1"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                >
                  Lihat Detail
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4 Content: Pemberitahuan Seleksi */}
        {activeTab === 'notifikasi' && (
          <div className="mt-8 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 pb-4 border-b border-slate-100">
              Pemberitahuan Seleksi & Undangan Wawancara
            </h2>
            <div className="mt-6 space-y-3">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-3">
                <Bell className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Undangan Wawancara: PT Solusi Distribusi Kota</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Selamat! Berkas CV Anda lolos kurasi tahap administrasi. Tim HRD telah mengirimkan tautan jadwal wawancara virtual via WhatsApp dan email.
                  </p>
                  <span className="block text-[11px] text-slate-400 mt-1">10 Mei 2025 • 09.30 WIB</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Edit Profil Pencari Kerja</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileEdit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Domisili Warga</label>
                <input
                  type="text"
                  value={editDomisili}
                  onChange={(e) => setEditDomisili(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Status Kesiapan Kerja</label>
                <select
                  value={editStatusKerja}
                  onChange={(e) => setEditStatusKerja(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                >
                  <option value="Siap Bekerja (Open to Work)">Siap Bekerja (Open to Work)</option>
                  <option value="Sedang Bekerja / Membuka Peluang">Sedang Bekerja / Membuka Peluang</option>
                  <option value="Fokus Studi / Pelatihan">Fokus Studi / Pelatihan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Ekspektasi Gaji</label>
                  <input
                    type="text"
                    value={editGaji}
                    onChange={(e) => setEditGaji(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Area Penempatan</label>
                  <input
                    type="text"
                    value={editArea}
                    onChange={(e) => setEditArea(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};