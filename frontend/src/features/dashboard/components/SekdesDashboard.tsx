import React, { useState, useEffect } from 'react';
import { 
  FileText, CheckCircle, Clock, XCircle, Printer, Search, 
  Settings, Megaphone, Loader2, ShieldCheck, QrCode, ArrowRight, Check, Eye
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import api from '@/shared/lib/axios';
import { SuratRequest, DesaSetting } from '@/shared/types';
import { CetakSuratModal } from './CetakSuratModal';
import { KopSuratSetting } from './KopSuratSetting';
import { BansosManager } from './BansosManager';
import { PreviewSuratModal } from './PreviewSuratModal';
import {
  MetricStatCard,
  AreaSplineChart,
  BarActivityChart,
  MiniCalendarWidget,
} from '@/shared/components/charts';

interface SekdesDashboardProps {
  activeSubmenu?: string;
}

export const SekdesDashboard: React.FC<SekdesDashboardProps> = ({ activeSubmenu = 'beranda' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'antrean' | 'kop' | 'bansos'>('antrean');
  const [surats, setSurats] = useState<SuratRequest[]>([]);
  const [desa, setDesa] = useState<DesaSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [printSurat, setPrintSurat] = useState<SuratRequest | null>(null);
  const [previewSurat, setPreviewSurat] = useState<SuratRequest | null>(null);

  useEffect(() => {
    if (['template_surat', 'pengaturan_desa'].includes(activeSubmenu)) {
      setActiveTab('kop');
    } else if (activeSubmenu === 'bansos_manager') {
      setActiveTab('bansos');
    } else {
      setActiveTab('antrean');
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

  const handleProcessSekdes = async (id: number) => {
    setIsProcessing(true);
    try {
      const res = await api.post(`/surats/${id}/process-sekdes`);
      if (res.data.success) {
        setPreviewSurat(null);
        fetchData();
      }
    } catch (err: any) {
      alert('Gagal menerbitkan: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSekdes = async (id: number, catatan: string) => {
    setIsProcessing(true);
    try {
      const res = await api.post(`/surats/${id}/reject`, {
        alasan: catatan,
      });
      if (res.data.success) {
        setPreviewSurat(null);
        fetchData();
      }
    } catch (err: any) {
      alert('Gagal menolak: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPreviewModal = () => {
    if (!previewSurat) return null;
    return (
      <PreviewSuratModal
        surat={previewSurat}
        role="sekdes"
        onClose={() => setPreviewSurat(null)}
        onApprove={(id) => handleProcessSekdes(id)}
        onReject={(id, catatan) => handleRejectSekdes(id, catatan)}
        onPrint={(s) => setPrintSurat(s)}
        approveLabel="Terbitkan & Sahkan QR"
        isProcessing={isProcessing}
      />
    );
  };

  const filteredSurat = surats.filter(s => 
    s.warga_profile?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.surat_type?.nama_surat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nomor_resi?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = surats.filter(s => s.status === 'processed_sekdes' || s.status === 'approved_rt').length;
  const completedCount = surats.filter(s => s.status === 'completed').length;

  // Antrean Verifikasi & Legalisasi Surat
  if (['proses_surat', 'verifikasi_surat', 'persetujuan_surat'].includes(activeSubmenu)) {
    const pendingSuratList = surats.filter(s => s.status === 'processed_sekdes' || s.status === 'approved_rt');
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Verifikasi & Legalisasi Surat Kepala Desa / Sekdes
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Periksa permohonan yang telah disetujui RT dan berikan tanda tangan digital & stempel QR sah.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-200">
            {pendingCount} Dokumen Siap TTD QR
          </span>
        </div>

        <div className="card-surface p-4 sm:p-6 space-y-4">
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs min-w-[720px] sm:min-w-0">
              <thead className="bg-[#f8faf9] text-gray-600 border-b border-gray-200 font-semibold">
                <tr>
                  <th className="py-3 px-3 sm:px-3.5">No. Resi</th>
                  <th className="py-3 px-3 sm:px-3.5">Pemohon & NIK</th>
                  <th className="py-3 px-3 sm:px-3.5">Jenis Surat</th>
                  <th className="py-3 px-3 sm:px-3.5">Keperluan</th>
                  <th className="py-3 px-3 sm:px-3.5">Status Verifikasi</th>
                  <th className="py-3 px-3 sm:px-3.5 text-right whitespace-nowrap sticky right-0 bg-[#f8faf9] z-10 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)]">
                    Aksi Legalisasi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingSuratList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      Tidak ada antrean surat yang perlu ditandatangani saat ini.
                    </td>
                  </tr>
                ) : (
                  pendingSuratList.map((s) => (
                    <tr key={s.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 sm:px-3.5 font-mono font-bold text-gray-700 whitespace-nowrap">{s.nomor_resi}</td>
                      <td className="py-3 px-3 sm:px-3.5">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm leading-tight">{s.warga_profile?.nama_lengkap}</div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">NIK: {s.warga_profile?.nik}</div>
                      </td>
                      <td className="py-3 px-3 sm:px-3.5">
                        <div className="font-medium text-emerald-800 text-xs leading-snug max-w-[160px] line-clamp-2">{s.surat_type?.nama_surat}</div>
                      </td>
                      <td className="py-3 px-3 sm:px-3.5 text-gray-600 text-xs max-w-[140px] truncate" title={s.keperluan}>{s.keperluan}</td>
                      <td className="py-3 px-3 sm:px-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock size={10} />
                          <span>Siap TTD Kepala Desa</span>
                        </span>
                      </td>
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
                            onClick={() => handleProcessSekdes(s.id)}
                            disabled={isProcessing}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 press-down transition-all flex items-center gap-1 cursor-pointer shadow-xs whitespace-nowrap"
                            title="Terbitkan & Sahkan Surat dengan QR Code Resmi"
                          >
                            <ShieldCheck size={14} />
                            <span>Sahkan QR</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
      </div>
    );
  }

  // Riwayat Surat Selesai & Arsip Resmi Desa
  if (['riwayat_surat', 'arsip_surat'].includes(activeSubmenu)) {
    const completedSuratList = surats.filter(s => s.status === 'completed');
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Arsip & Riwayat Surat Selesai
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Buku register penerbitan dokumen resmi desa yang telah disahkan dengan TTD & Stempel QR Code.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
            {completedCount} Surat Resmi Terbit
          </span>
        </div>

        <div className="card-surface p-4 sm:p-6 space-y-4">
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
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
                {completedSuratList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      Belum ada riwayat surat selesai.
                    </td>
                  </tr>
                ) : (
                  completedSuratList.map((s) => (
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
                            onClick={() => setPrintSurat(s)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 press-down flex items-center gap-1 cursor-pointer border border-emerald-200 shadow-2xs whitespace-nowrap"
                          >
                            <Printer size={13} />
                            <span>Cetak PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
      </div>
    );
  }

  // Beranda Dashboard Sekdes
  return (
    <div className="space-y-6 page-enter font-sans">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <MetricStatCard
          title="Siap Diterbitkan & TTD QR"
          value={`${pendingCount} Berkas`}
          subvalue="Antrean Kantor Desa"
          percentage={pendingCount > 0 ? 65 : 100}
          color="amber"
          trend="SLA Rata-rata < 15 Menit"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Total Surat Diterbitkan"
          value={`${completedCount} Surat`}
          subvalue="Tercatat di Buku Register"
          percentage={100}
          color="emerald"
          trend="100% Berstempel QR Sah"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Template Surat Aktif"
          value="14 Jenis"
          subvalue="Katalog Lengkap Permendagri"
          percentage={100}
          color="teal"
          trend="Format Standar Resmi"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Efisiensi Pelayanan Desa"
          value="98.8%"
          subvalue="Tingkat Kepuasan Warga"
          percentage={99}
          color="indigo"
          trend="+16.2% Efisiensi Waktu"
          isPositiveTrend={true}
        />
      </div>

      {/* Performance Chart & Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left 8 Cols: Performance Overview Spline Area Chart */}
        <div className="xl:col-span-8 space-y-5">
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

          {/* Sub-grid under Chart: Weekly Bar Activity (6 Col) + Quick Actions (6 Col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  onClick={() => setActiveTab('antrean')}
                  className="w-full p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all press-down flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    <span>Legalisasi & Terbitkan Surat ({pendingCount})</span>
                  </span>
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">
                    TTD QR
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
                Pejabat Penandatangan
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                ● Aktif Menjabat
              </span>
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                  {user?.name?.charAt(0) || 'S'}
                </div>
              )}
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
                <span className="font-extrabold text-slate-900">Legalisasi & TTD QR Resmi</span>
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
          { key: 'antrean' as const, label: `Antrean Surat & QR (${surats.length})`, icon: FileText },
          { key: 'kop' as const, label: 'Kop Surat Editor', icon: Settings },
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
        {activeTab === 'antrean' && (
          <div className="card-surface p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Antrean Legalisasi Kepala Desa & Riwayat Surat</h2>
                <p className="text-xs text-slate-500 mt-0.5">Surat disetujui RT yang siap diverifikasi, ditandatangani QR, dan arsip dokumen selesai.</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Cari pemohon, resi, jenis..." 
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus-ring"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-900 text-white shadow-2xs"
              >
                Semua Surat ({surats.length})
              </button>
              <button
                type="button"
                onClick={() => setSearchTerm('processed_sekdes')}
                className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-100 text-amber-900 border border-amber-200"
              >
                ⏳ Verifikasi Kepala Desa ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setSearchTerm('completed')}
                className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200"
              >
                ✓ Riwayat Surat Selesai ({completedCount})
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-emerald-500" size={28} />
              </div>
            ) : filteredSurat.length === 0 ? (
              <div className="text-center py-12 animate-scale-up">
                <img src="/images/empty-zoom.png" alt="" className="w-28 mx-auto mb-4 opacity-40" />
                <p className="text-xs text-gray-400">Belum ada antrean surat saat ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8faf9] text-gray-600 border-b border-gray-200 font-semibold">
                    <tr>
                      <th className="p-3">No. Resi</th>
                      <th className="p-3">Pemohon & NIK</th>
                      <th className="p-3">Jenis Surat</th>
                      <th className="p-3">Nomor Resmi</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSurat.map((s, idx) => (
                      <tr key={s.id} className={`hover:bg-gray-50 transition-colors animate-fade-in stagger-${Math.min(idx + 1, 8)}`}>
                        <td className="p-3 font-mono font-bold text-gray-700">{s.nomor_resi}</td>
                        <td className="p-3">
                          <div className="font-bold text-gray-900">{s.warga_profile?.nama_lengkap}</div>
                          <div className="text-[11px] text-gray-400 font-mono">NIK: {s.warga_profile?.nik}</div>
                        </td>
                        <td className="p-3 font-medium text-emerald-800">{s.surat_type?.nama_surat}</td>
                        <td className="p-3 font-mono text-[11px]">
                          {s.nomor_surat_resmi ? (
                            <span className="font-bold text-emerald-800">{s.nomor_surat_resmi}</span>
                          ) : (
                            <span className="text-gray-400 italic">Otomatis saat terbit</span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                            ['processed_sekdes', 'approved_rt'].includes(s.status) ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            s.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {['processed_sekdes', 'approved_rt'].includes(s.status) && <Clock size={12} />}
                            {s.status === 'completed' && <CheckCircle size={12} />}
                            {['processed_sekdes', 'approved_rt'].includes(s.status) ? 'Siap Diterbitkan' :
                             s.status === 'completed' ? 'Selesai & Sah' : s.status}
                          </span>
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
                              <span>Detail Berkas</span>
                            </button>
                            {['processed_sekdes', 'approved_rt'].includes(s.status) && (
                              <button 
                                onClick={() => handleProcessSekdes(s.id)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 hover-glow press-down transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                              >
                                <ShieldCheck size={12} /> Terbitkan & Sahkan QR
                              </button>
                            )}
                            {s.status === 'completed' && (
                              <button 
                                onClick={() => setPrintSurat(s)}
                                className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 hover-glow press-down flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                              >
                                <Printer size={12} /> Cetak
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'kop' && <KopSuratSetting />}
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
    </div>
  );
};
