import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FileText, CheckCircle, Clock, XCircle, Printer, Search, 
  Settings, Megaphone, Loader2, ShieldCheck, QrCode, ArrowRight, Check, Eye,
  Sliders, UserPlus, X, AlertTriangle, Target
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import api from '@/shared/lib/axios';
import { SuratRequest, DesaSetting } from '@/shared/types';
import { CetakSuratModal } from './CetakSuratModal';
import { KopSuratSetting } from './KopSuratSetting';
import { BansosManager } from './BansosManager';
import { PreviewSuratModal } from './PreviewSuratModal';
import { PenomoranSuratSetting } from './PenomoranSuratSetting';
import { PendaftaranWargaDesa } from './PendaftaranWargaDesa';
import { DesaTerritoryMap } from './DesaTerritoryMap';
import { BuatSuratSekdesView } from './BuatSuratSekdesView';
import { DataKkSekdesView } from './DataKkSekdesView';
import { MutasiPendudukSekdesView } from './MutasiPendudukSekdesView';
import { KadesStrukturVisiMisiView } from './KadesStrukturVisiMisiView';
import {
  MetricStatCard,
  AreaSplineChart,
  BarActivityChart,
  MiniCalendarWidget,
} from '@/shared/components/charts';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { Pagination } from '@/shared/components/Pagination';

interface SekdesDashboardProps {
  activeSubmenu?: string;
}

export const SekdesDashboard: React.FC<SekdesDashboardProps> = ({ activeSubmenu = 'beranda' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'arsip' | 'penomoran' | 'warga' | 'kop' | 'bansos' | 'visi_misi'>('arsip');
  const [surats, setSurats] = useState<SuratRequest[]>([]);
  const [desa, setDesa] = useState<DesaSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [printSurat, setPrintSurat] = useState<SuratRequest | null>(null);
  const [previewSurat, setPreviewSurat] = useState<SuratRequest | null>(null);
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => setToastNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  // Pagination states (8 data per halaman)
  const [berandaPage, setBerandaPage] = useState(1);
  const [riwayatPage, setRiwayatPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    if (['template_surat', 'pengaturan_desa'].includes(activeSubmenu)) {
      setActiveTab('kop');
    } else if (['visi_misi', 'struktur_desa', 'visi', 'misi'].includes(activeSubmenu)) {
      setActiveTab('visi_misi');
    } else if (activeSubmenu === 'bansos_manager') {
      setActiveTab('bansos');
    } else if (['penomoran_surat', 'format_surat', 'penomoran'].includes(activeSubmenu)) {
      setActiveTab('penomoran');
    } else if (['register_warga', 'data_warga', 'warga'].includes(activeSubmenu)) {
      setActiveTab('warga');
    } else {
      setActiveTab('arsip');
    }
  }, [activeSubmenu]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suratRes, desaRes] = await Promise.all([
        api.get('/surats'),
        api.get('/settings/desa'),
      ]);
      if (suratRes.data.success) setSurats(suratRes.data.data);
      if (desaRes.data.success) setDesa(desaRes.data.data);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const renderPreviewModal = () => {
    if (!previewSurat) return null;
    return (
      <PreviewSuratModal
        surat={previewSurat}
        role="sekdes"
        onClose={() => setPreviewSurat(null)}
        onPrint={(s) => setPrintSurat(s)}
      />
    );
  };

  const renderToast = () => {
    if (!toastNotification) return null;
    return createPortal(
      <div className="fixed top-5 right-5 z-[999999] max-w-md w-full px-4 animate-fade-in pointer-events-none">
        <div className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 pointer-events-auto ${
          toastNotification.type === 'success' 
            ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20'
            : toastNotification.type === 'error'
            ? 'bg-rose-900 text-white border-rose-700 shadow-rose-950/20'
            : 'bg-slate-900 text-white border-slate-700 shadow-slate-950/20'
        }`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            toastNotification.type === 'success' ? 'bg-emerald-800 text-emerald-200' :
            toastNotification.type === 'error' ? 'bg-rose-800 text-rose-200' :
            'bg-slate-800 text-slate-200'
          }`}>
            {toastNotification.type === 'success' ? <CheckCircle size={18} /> : <ShieldCheck size={18} />}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-xs font-bold leading-relaxed">{toastNotification.message}</p>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-white/60 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      </div>,
      document.body
    );
  };

  const filteredSurat = surats.filter(s => 
    s.warga_profile?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.surat_type?.nama_surat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nomor_resi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = surats.filter(s => s.status === 'processed_sekdes' || s.status === 'approved_rt').length;
  const completedCount = surats.filter(s => s.status === 'completed').length;

  const normalizedSubmenu = (activeSubmenu || '').replace(/-/g, '_');

  // Buku Register Arsip Surat Sah Desa (Direct RT -> Kepala Desa)
  if (['arsip_surat', 'riwayat_surat', 'proses_surat', 'verifikasi_surat', 'persetujuan_surat'].includes(normalizedSubmenu)) {
    const completedSuratList = surats.filter(s => s.status === 'completed');
    const filteredCompleted = completedSuratList.filter(s => 
      s.warga_profile?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.surat_type?.nama_surat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nomor_resi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nomor_surat_resmi?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const riwayatTotal = filteredCompleted.length;
    const riwayatPaginated = filteredCompleted.slice((riwayatPage - 1) * PAGE_SIZE, riwayatPage * PAGE_SIZE);

    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Arsip Surat Desa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Buku register dan arsip dokumen resmi yang telah disahkan.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
            {completedCount} Surat terbit
          </span>
        </div>

        <div className="card-surface p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <input 
                type="text" 
                placeholder="Cari pemohon, nomor resmi, resi..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus-ring"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setRiwayatPage(1);
                }}
              />
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Menampilkan {filteredCompleted.length} dokumen sah
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs min-w-[720px] sm:min-w-0">
              <thead className="bg-[#f8faf9] text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="py-3 px-3 sm:px-3.5">No. Surat Resmi</th>
                  <th className="py-3 px-3 sm:px-3.5">No. Resi</th>
                  <th className="py-3 px-3 sm:px-3.5">Pemohon & NIK</th>
                  <th className="py-3 px-3 sm:px-3.5">Jenis Surat</th>
                  <th className="py-3 px-3 sm:px-3.5">Tanggal Terbit</th>
                  <th className="py-3 px-3 sm:px-3.5 text-right whitespace-nowrap sticky right-0 bg-[#f8faf9] z-10 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCompleted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      Belum ada riwayat surat selesai yang sesuai dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  riwayatPaginated.map((s) => (
                    <tr key={s.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 sm:px-3.5 font-mono font-black text-emerald-800 whitespace-nowrap">{s.nomor_surat_resmi || '-'}</td>
                      <td className="py-3 px-3 sm:px-3.5 font-mono text-gray-500 whitespace-nowrap">{s.nomor_resi}</td>
                      <td className="py-3 px-3 sm:px-3.5">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm leading-tight">{s.warga_profile?.nama_lengkap}</div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">NIK: {s.warga_profile?.nik}</div>
                      </td>
                      <td className="py-3 px-3 sm:px-3.5">
                        <div className="font-medium text-slate-800 text-xs leading-snug max-w-[160px] line-clamp-2">{s.surat_type?.nama_surat}</div>
                      </td>
                      <td className="py-3 px-3 sm:px-3.5 text-slate-500 whitespace-nowrap">{new Date(s.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 px-3 sm:px-3.5 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-gray-50 z-10 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] transition-colors">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setPreviewSurat(s)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors press-down flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Lihat Detail & Foto Berkas Lampiran"
                          >
                            <Eye size={13} className="text-emerald-600" />
                            <span>Detail</span>
                          </button>
                          <button 
                            type="button"
                            onClick={() => setPrintSurat(s)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 press-down flex items-center gap-1 cursor-pointer border border-emerald-200 shadow-2xs whitespace-nowrap"
                          >
                            <Printer size={13} />
                            <span>Cetak</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Clean Card View - No Horizontal Scrolling Needed */}
          <div className="md:hidden space-y-3">
            {filteredCompleted.length === 0 ? (
              <div className="p-8 text-center text-gray-400 bg-white border border-gray-200 rounded-2xl text-xs">
                Belum ada surat selesai.
              </div>
            ) : (
              riwayatPaginated.map((s) => (
                <div 
                  key={s.id} 
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 truncate">
                      {s.nomor_surat_resmi || s.nomor_resi}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {new Date(s.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-black text-sm text-slate-900 leading-tight">
                      {s.warga_profile?.nama_lengkap}
                    </h4>
                    <div className="text-[11px] font-mono text-slate-500">
                      NIK: {s.warga_profile?.nik} • Resi: {s.nomor_resi}
                    </div>
                    <div className="font-bold text-xs text-emerald-900 pt-0.5">
                      {s.surat_type?.nama_surat}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewSurat(s)}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs press-down"
                    >
                      <Eye size={13} className="text-emerald-600" />
                      <span>Detail</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setPrintSurat(s)}
                      className="flex-1 py-2 px-3 bg-emerald-600 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-700 press-down transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      <Printer size={13} />
                      <span>Cetak</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Arsip Surat Selesai */}
          <Pagination
            currentPage={riwayatPage}
            totalItems={riwayatTotal}
            pageSize={PAGE_SIZE}
            onPageChange={setRiwayatPage}
            itemLabel="arsip surat"
          />
        </div>

        {printSurat && (
          <CetakSuratModal 
            surat={printSurat} 
            desa={desa}
            onClose={() => setPrintSurat(null)} 
          />
        )}

        {/* Modal Preview & Berkas Surat */}
        {renderPreviewModal()}
        {renderToast()}
      </div>
    );
  }

  // Pengaturan Format & Urutan Penomoran Surat Desa (API Kalender)
  if (['penomoran_surat', 'format_surat', 'penomoran'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <PenomoranSuratSetting />
      </div>
    );
  }

  // Buat Surat Baru (Penerbitan Mandiri di Loket Pelayanan Balai Desa)
  if (['buat_surat_baru', 'buat_surat'].includes(normalizedSubmenu)) {
    return <BuatSuratSekdesView />;
  }

  // Buku Register & Pendaftaran Warga Desa (NIK & Tanggal Lahir)
  if (['register_warga', 'data_warga'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <PendaftaranWargaDesa />
      </div>
    );
  }

  // Buku Register Kartu Keluarga (KK) Desa Doko
  if (['data_kk', 'kartu_keluarga', 'kk'].includes(normalizedSubmenu)) {
    return <DataKkSekdesView />;
  }

  // Buku Mutasi Penduduk Desa Doko (Permendagri No. 47/2016 Model A.2)
  if (['mutasi_penduduk', 'mutasi'].includes(normalizedSubmenu)) {
    return <MutasiPendudukSekdesView />;
  }

  // Visi, Misi & Struktur Pemerintahan Desa (RPJMDes)
  if (['visi_misi', 'visi', 'misi', 'struktur_desa', 'struktur_pemerintahan'].includes(normalizedSubmenu)) {
    return <KadesStrukturVisiMisiView />;
  }

  // Peta Geospasial Wilayah Desa Doko (Hierarki RW -> RT -> Fasum/Warga)
  if (['peta_desa', 'peta_wilayah', 'peta'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-6 page-enter font-sans">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                Sistem Informasi Geografis Desa (GIS)
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">Peta Wilayah Terpadu Desa Doko</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemetaan teritorial berjenjang tingkat Desa: pembagian blok RW, kotak-kotak teritorial RT binaan, dan fasilitas umum desa.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200 shadow-2xs">
              Desa Doko, Kec. Ngasem
            </span>
            <span className="px-3.5 py-1.5 rounded-2xl bg-slate-900 text-white font-extrabold text-xs shadow-2xs">
              3 RW • 13 RT Terdata
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs overflow-hidden">
          <DesaTerritoryMap />
        </div>
      </div>
    );
  }

  // Beranda Dashboard Sekdes
  return (
    <div className="space-y-6 page-enter font-sans">
      
      {/* Metric Cards (2x2 Grid di Mobile, 4-Col di Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <MetricStatCard
          title="Siap Diterbitkan"
          value={`${pendingCount} Berkas`}
          subvalue="Antrean Kantor Desa"
          percentage={pendingCount > 0 ? 65 : 100}
          color="amber"
          trend="SLA Rata-rata < 15 Menit"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Surat Diterbitkan"
          value={`${completedCount} Surat`}
          subvalue="Tercatat di Buku Register"
          percentage={100}
          color="emerald"
          trend="100% Berstempel QR"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Template Surat"
          value="14 Jenis"
          subvalue="Katalog Permendagri"
          percentage={100}
          color="teal"
          trend="Format Standar Resmi"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Efisiensi Pelayanan"
          value="98.8%"
          subvalue="Tingkat Kepuasan"
          percentage={99}
          color="indigo"
          trend="+16.2% Efisiensi"
          isPositiveTrend={true}
        />
      </div>

      {/* Performance Chart & Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left 8 Cols */}
        <div className="xl:col-span-8 space-y-5">
          <div className="hidden lg:block space-y-5">
            <AreaSplineChart
              title="Statistik Pelayanan Persuratan & Digital Signature"
              subtitle="Volume Penerbitan Dokumen Resmi Desa Doko (Jan - Agu)"
              data={[
                { label: 'Jan', value: 24, secondaryValue: 24, tooltipText: 'Dokumen Sah' },
                { label: 'Feb', value: 36, secondaryValue: 35, tooltipText: 'Dokumen Sah' },
                { label: 'Mar', value: 48, secondaryValue: 47, tooltipText: 'Dokumen Sah' },
                { label: 'Apr', value: 42, secondaryValue: 42, tooltipText: 'Dokumen Sah' },
                { label: 'Mei', value: 55, secondaryValue: 54, tooltipText: 'Dokumen Sah' },
                { label: 'Jun', value: 68, secondaryValue: 66, tooltipText: 'Dokumen Sah' },
                { label: 'Jul', value: 75, secondaryValue: 74, tooltipText: 'Dokumen Sah' },
                { label: 'Agu', value: Math.max(82, surats.length * 4), secondaryValue: completedCount, tooltipText: 'Dokumen Sah' },
              ]}
              highlightValue="99.8%"
              highlightLabel="Kecepatan Legalisasi QR Balai Desa"
              trendText="+18.4% vs bulan lalu"
            />
          </div>

          {/* Sub-grid: Weekly Bar Activity + Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="hidden lg:block">
              <BarActivityChart
                title="Aktivitas Jam Layanan Kantor"
                subtitle="Statistik Mingguan Pelayanan"
                data={[
                  { label: 'Sen', value: 25 },
                  { label: 'Sel', value: 34 },
                  { label: 'Rab', value: 42, highlight: true },
                  { label: 'Kam', value: 36 },
                  { label: 'Jum', value: 48, highlight: true },
                  { label: 'Sab', value: 20 },
                  { label: 'Min', value: 8 },
                ]}
                mainValue="48.5 Jam"
                mainLabel="Waktu Aktif Loket Pelayanan"
              />
            </div>

            {/* Quick Action Box */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  Aksi Eksekutif
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">Pintasan Sekretaris Desa</h4>
                <p className="text-xs text-slate-500 mt-0.5">Kelola template surat, bansos PKH, dan pengaturan desa.</p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('arsip')}
                  className="w-full p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all press-down flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Buku Register & Arsip Surat Sah ({completedCount})</span>
                  </span>
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">
                    Arsip Sah
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('penomoran')}
                  className="w-full p-3 rounded-2xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200 text-teal-900 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-teal-700" />
                    <span>Format & Urutan No. Surat (API Kalender)</span>
                  </span>
                  <span className="text-[10px] font-black text-teal-800 bg-teal-200/60 px-2 py-0.5 rounded-full">
                    Katalog No.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('warga')}
                  className="w-full p-3 rounded-2xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-blue-900 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-blue-700" />
                    <span>Register Warga Baru (Login NIK & Tgl Lahir)</span>
                  </span>
                  <span className="text-[10px] font-black text-blue-800 bg-blue-200/60 px-2 py-0.5 rounded-full">
                    Buku Warga
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('bansos')}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-emerald-700" />
                    <span>Manajemen Bansos & Broadcast WhatsApp</span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    KPM Aktif
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('kop')}
                  className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-emerald-700" />
                    <span>Kop Surat & Pengaturan Pemdes</span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                    Format Resmi
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Personal Profile Card + Mini Calendar Widget */}
        <div className="xl:col-span-4 space-y-5">
          {/* Sekdes Profile Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                Tata Usaha & Administrasi
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                ● Aktif Menjabat
              </span>
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              <UserAvatar
                src={user?.avatar}
                name={user?.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-xs shrink-0"
                fallbackClassName="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 leading-snug break-words">
                  {user?.name || 'Ahmad Fauzi, S.AP'}
                </h4>
                <div className="text-[11px] text-emerald-700 font-extrabold mt-0.5">
                  Sekretaris Desa Doko
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  NIPD: 19850412 201201 1 002
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Kewenangan:</span>
                <span className="font-extrabold text-slate-900">Tata Usaha & Arsip Persuratan Desa</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Instansi:</span>
                <span className="font-mono font-bold text-slate-800">Pemerintah Desa Doko</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Kecamatan / Kab:</span>
                <span className="text-emerald-700 font-black">Ngasem / Kediri</span>
              </div>
            </div>
          </div>

          {/* Mini Calendar & Agenda Widget */}
          <MiniCalendarWidget title="Kalender & Rapat Kantor Desa" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 animate-fade-up stagger-2">
        {[
          { key: 'arsip' as const, label: `Buku Arsip Dokumen Sah (${completedCount})`, icon: FileText },
          { key: 'penomoran' as const, label: 'Format & Urutan No. Surat', icon: Sliders },
          { key: 'warga' as const, label: 'Buku Register Warga Desa', icon: UserPlus },
          { key: 'kop' as const, label: 'Kop Surat Editor', icon: Settings },
          { key: 'visi_misi' as const, label: 'Visi & Misi Desa', icon: Target },
          { key: 'bansos' as const, label: 'Bansos & Broadcast WA', icon: Megaphone },
        ].map((tab) => (
          <button 
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all press-down flex items-center gap-2 ${
              activeTab === tab.key 
                ? 'bg-emerald-600 text-white shadow-md' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-up stagger-3">
        {activeTab === 'arsip' && (
          <div className="card-surface p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Buku Register & Arsip Surat Sah Desa</h2>
                <p className="text-xs text-slate-500 mt-0.5">Seluruh surat resmi yang telah disahkan langsung oleh Kepala Desa dengan TTD QR.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input 
                  type="text" 
                  placeholder="Cari pemohon, nomor resmi, resi..." 
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus-ring"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setBerandaPage(1);
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-emerald-500" size={28} />
              </div>
            ) : (() => {
              const completedList = surats.filter(s => s.status === 'completed');
              const filteredList = completedList.filter(s => 
                s.warga_profile?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.surat_type?.nama_surat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.nomor_resi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.nomor_surat_resmi?.toLowerCase().includes(searchTerm.toLowerCase())
              );
              const totalItems = filteredList.length;
              const paginatedList = filteredList.slice((berandaPage - 1) * PAGE_SIZE, berandaPage * PAGE_SIZE);

              if (filteredList.length === 0) {
                return (
                  <div className="text-center py-12 animate-scale-up">
                    <img src="/images/empty-zoom.png" alt="" className="w-28 mx-auto mb-4 opacity-40" />
                    <p className="text-xs text-gray-400">Belum ada arsip surat sah yang sesuai dengan pencarian.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8faf9] text-gray-600 border-b border-gray-200 font-semibold">
                        <tr>
                          <th className="p-3">No. Surat Sah</th>
                          <th className="p-3">No. Resi</th>
                          <th className="p-3">Pemohon & NIK</th>
                          <th className="p-3">Jenis Surat</th>
                          <th className="p-3">Tanggal Terbit</th>
                          <th className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedList.map((s, idx) => (
                          <tr 
                            key={s.id} 
                            className={`transition-all animate-fade-in stagger-${Math.min(idx + 1, 8)} hover:bg-gray-50`}
                          >
                            <td className="p-3 font-mono font-bold text-emerald-800 whitespace-nowrap">
                              {s.nomor_surat_resmi || '-'}
                            </td>
                            <td className="p-3 font-mono text-gray-600">{s.nomor_resi}</td>
                            <td className="p-3">
                              <div className="font-bold text-gray-900">{s.warga_profile?.nama_lengkap}</div>
                              <div className="text-[11px] text-gray-400 font-mono">NIK: {s.warga_profile?.nik}</div>
                            </td>
                            <td className="p-3 font-medium text-slate-800">{s.surat_type?.nama_surat}</td>
                            <td className="p-3 text-slate-500 whitespace-nowrap">
                              {new Date(s.created_at).toLocaleDateString('id-ID')}
                            </td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <div className="flex justify-end items-center gap-1.5 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => setPreviewSurat(s)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="Lihat Detail & Foto Berkas Lampiran"
                                >
                                  <Eye size={12} className="text-emerald-600" />
                                  <span>Detail</span>
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setPrintSurat(s)}
                                  className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 hover-glow press-down flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                                >
                                  <Printer size={12} /> Cetak
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Clean Card View - No Horizontal Scroll */}
                  <div className="md:hidden space-y-3">
                    {paginatedList.map((s) => (
                      <div 
                        key={s.id} 
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 animate-fade-in"
                      >
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 truncate">
                            {s.nomor_surat_resmi || s.nomor_resi}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            {new Date(s.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-black text-sm text-slate-900 leading-tight">
                            {s.warga_profile?.nama_lengkap}
                          </h4>
                          <div className="text-[11px] font-mono text-slate-500">
                            NIK: {s.warga_profile?.nik} • Resi: {s.nomor_resi}
                          </div>
                          <div className="font-bold text-xs text-emerald-900 pt-0.5">
                            {s.surat_type?.nama_surat}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewSurat(s)}
                            className="flex-1 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs press-down"
                          >
                            <Eye size={13} className="text-emerald-600" />
                            <span>Detail</span>
                          </button>
                          <button 
                            type="button"
                            onClick={() => setPrintSurat(s)}
                            className="flex-1 py-2 px-3 bg-emerald-600 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-700 press-down transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                          >
                            <Printer size={13} />
                            <span>Cetak Surat</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Beranda Daftar Surat */}
                  <Pagination
                    currentPage={berandaPage}
                    totalItems={totalItems}
                    pageSize={PAGE_SIZE}
                    onPageChange={setBerandaPage}
                    itemLabel="dokumen sah"
                  />
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'penomoran' && <PenomoranSuratSetting />}
        {activeTab === 'warga' && <PendaftaranWargaDesa />}
        {activeTab === 'kop' && <KopSuratSetting />}
        {activeTab === 'visi_misi' && <KadesStrukturVisiMisiView />}
        {activeTab === 'bansos' && <BansosManager />}
      </div>

      {printSurat && (
        <CetakSuratModal 
          surat={printSurat} 
          desa={desa}
          onClose={() => setPrintSurat(null)} 
        />
      )}

      {/* Modal Preview & Berkas Surat */}
      {renderPreviewModal()}
      {renderToast()}
    </div>
  );
};
