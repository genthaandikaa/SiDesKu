import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  XCircle,
  FileText,
  Users,
  DollarSign,
  Clock,
  ShieldCheck
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { SuratRequest, WargaProfile } from '@/shared/types';
import { useAuth } from '@/shared/context/AuthContext';
import {
  MetricStatCard,
  AreaSplineChart,
  BarActivityChart,
  MiniCalendarWidget,
  DonutGauge,
} from '@/shared/components/charts';

interface RtDashboardProps {
  activeSubmenu?: string;
}

export const RtDashboard: React.FC<RtDashboardProps> = ({ activeSubmenu = 'beranda' }) => {
  const { user } = useAuth();
  const [surats, setSurats] = useState<SuratRequest[]>([]);
  const [wargas, setWargas] = useState<WargaProfile[]>([]);
  const [kasData, setKasData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'antrean' | 'warga' | 'kas'>('antrean');

  // Action modals & states
  const [selectedSurat, setSelectedSurat] = useState<SuratRequest | null>(null);
  const [actionCatatan, setActionCatatan] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // New Kas Transaction State
  const [showKasModal, setShowKasModal] = useState(false);
  const [kasTipe, setKasTipe] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [kasJumlah, setKasJumlah] = useState<number | ''>('');
  const [kasKeterangan, setKasKeterangan] = useState('');
  const [kasCategoryId, setKasCategoryId] = useState<number>(1);

  useEffect(() => {
    if (['data_warga', 'data_keluarga', 'peta_wilayah'].includes(activeSubmenu)) {
      setActiveTab('warga');
    } else if (activeSubmenu === 'kas_rt') {
      setActiveTab('kas');
    } else if (['persetujuan_surat', 'riwayat_surat'].includes(activeSubmenu)) {
      setActiveTab('antrean');
    }
  }, [activeSubmenu]);

  useEffect(() => {
    fetchRtData();
  }, []);

  const fetchRtData = async () => {
    try {
      const [suratRes, wargaRes, kasRes] = await Promise.all([
        api.get('/surats'),
        api.get('/warga'),
        api.get('/kas-rt'),
      ]);

      if (suratRes.data.success) setSurats(suratRes.data.data);
      if (wargaRes.data.success) setWargas(wargaRes.data.data);
      if (kasRes.data.success) setKasData(kasRes.data);
    } catch {
      //
    }
  };

  const handleApproveRt = async (suratId: number) => {
    setIsProcessing(true);
    try {
      const res = await api.post(`/surats/${suratId}/rt-action`, {
        action: 'approve',
        catatan: actionCatatan || 'Data warga valid dan terdaftar resmi di RT 01.',
      });
      if (res.data.success) {
        setSelectedSurat(null);
        setActionCatatan('');
        fetchRtData();
      }
    } catch (err: any) {
      alert('Gagal memproses persetujuan: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (suratId: number) => {
    if (!actionCatatan.trim()) {
      alert('Wajib mengisi alasan/catatan penolakan untuk warga pemohon.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.post(`/surats/${suratId}/rt-action`, {
        action: 'reject',
        catatan: actionCatatan,
      });
      if (res.data.success) {
        setSelectedSurat(null);
        setActionCatatan('');
        fetchRtData();
      }
    } catch (err: any) {
      alert('Gagal memproses penolakan: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddKas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kasJumlah || Number(kasJumlah) <= 0) {
      alert('Nominal transaksi kas harus valid dan lebih dari 0.');
      return;
    }
    if (!kasKeterangan.trim()) {
      alert('Keterangan transaksi kas wajib diisi.');
      return;
    }

    try {
      const res = await api.post('/kas-rt/transaction', {
        tipe: kasTipe,
        jumlah: Number(kasJumlah),
        keterangan: kasKeterangan,
        kas_category_id: kasCategoryId,
      });
      if (res.data.success) {
        setShowKasModal(false);
        setKasJumlah('');
        setKasKeterangan('');
        fetchRtData();
      }
    } catch (err: any) {
      alert('Gagal mencatat kas: ' + (err.response?.data?.message || 'Error'));
    }
  };

  const pendingSurats = surats.filter((s) => s.status === 'pending_rt');
  const completedSurats = surats.filter((s) => s.status === 'completed');

  return (
    <div className="space-y-6 page-enter font-sans">
      
      {/* Top 4 Modular Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricStatCard
          title="Menunggu Validasi RT"
          value={`${pendingSurats.length} Berkas`}
          subvalue="Perlu Tindakan"
          percentage={pendingSurats.length > 0 ? 55 : 100}
          color="amber"
          trend="SLA Rata-rata < 15 Menit"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Total Warga RT 01"
          value={`${wargas.length} Jiwa`}
          subvalue="Terdata Aktif"
          percentage={100}
          color="emerald"
          trend="+4 Jiwa Baru (Bulan Ini)"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Saldo Kas RT 01"
          value={`Rp ${kasData?.saldo ? Number(kasData.saldo).toLocaleString('id-ID') : '4.250.000'}`}
          subvalue="Buku Kas Terbuka"
          percentage={92}
          color="teal"
          trend="Iuran Warga 95% Lunas"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Surat Berhasil Diterbitkan"
          value={`${completedSurats.length} Surat`}
          subvalue="Disahkan Sekdes"
          percentage={100}
          color="indigo"
          trend="100% Legal & Sah"
          isPositiveTrend={true}
        />
      </div>

      {/* --- ROW 2: PERFORMANCE AREA CHART (8-COL) + MINI CALENDAR (4-COL) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left 8 Cols: Performance Overview Spline Area Chart */}
        <div className="lg:col-span-8 space-y-5">
          <AreaSplineChart
            title="Efisiensi Validasi & Alur Surat RT 01"
            subtitle="Statistik Pelayanan Warga Lingkungan"
            data={[
              { label: 'Jan', value: 12, secondaryValue: 12, tooltipText: 'Surat Disetujui' },
              { label: 'Feb', value: 18, secondaryValue: 17, tooltipText: 'Surat Disetujui' },
              { label: 'Mar', value: 24, secondaryValue: 24, tooltipText: 'Surat Disetujui' },
              { label: 'Apr', value: 20, secondaryValue: 19, tooltipText: 'Surat Disetujui' },
              { label: 'Mei', value: 28, secondaryValue: 27, tooltipText: 'Surat Disetujui' },
              { label: 'Jun', value: 35, secondaryValue: 34, tooltipText: 'Surat Disetujui' },
              { label: 'Jul', value: 40, secondaryValue: 39, tooltipText: 'Surat Disetujui' },
              { label: 'Agu', value: Math.max(45, surats.length * 3), secondaryValue: completedSurats.length, tooltipText: 'Surat Disetujui' },
            ]}
            highlightValue="99.2%"
            highlightLabel="Tingkat Validasi Akurat RT 01"
            trendText="+15.4% vs bulan lalu"
          />

          {/* Sub-grid under Chart: Weekly Bar Activity (6 Col) + Quick Actions (6 Col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BarActivityChart
              title="Aktivitas Pelayanan Harian"
              subtitle="Statistik Mingguan RT 01"
              data={[
                { label: 'Sen', value: 14 },
                { label: 'Sel', value: 22 },
                { label: 'Rab', value: 30, highlight: true },
                { label: 'Kam', value: 25 },
                { label: 'Jum', value: 38, highlight: true },
                { label: 'Sab', value: 18 },
                { label: 'Min', value: 10 },
              ]}
              mainValue="38.5 Jam"
              mainLabel="Waktu Pelayanan Aktif Minggu Ini"
            />

            {/* Quick Action & Kas Shortcut Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  Panel Tindakan Cepat
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">Aksi Pengurus RT 01</h4>
                <p className="text-xs text-slate-500 mt-0.5">Kelola verifikasi warga dan pencatatan buku kas.</p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowKasModal(true)}
                  className="w-full p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all press-down flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Catat Iuran / Pengeluaran Kas RT</span>
                  </span>
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">
                    + Transaksi
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('antrean')}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Periksa Berkas Masuk ({pendingSurats.length})</span>
                  </span>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {pendingSurats.length} Pending
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('warga')}
                  className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>Buku Induk Kependudukan ({wargas.length})</span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                    {wargas.length} Jiwa
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Personal Profile Card + Mini Calendar Widget */}
        <div className="lg:col-span-4 space-y-5">
          {/* Ketua RT Profile Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                Profil Pejabat Lingkungan
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
                  {user?.name?.charAt(0) || 'R'}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-sm font-black text-slate-900 leading-tight truncate">
                  {user?.name || 'Bambang Utomo'}
                </h4>
                <div className="text-[11px] text-emerald-700 font-extrabold mt-0.5">
                  Ketua Rukun Tetangga (RT 01)
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  Wilayah: Dusun Krajan RW 01
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Cakupan Wilayah:</span>
                <span className="font-extrabold text-slate-900">RT 01 / RW 01 Doko</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Total Kepala Keluarga:</span>
                <span className="font-mono font-bold text-slate-800">48 KK</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Otoritas Validasi:</span>
                <span className="text-emerald-700 font-black">Level 1 (Pengantar RT)</span>
              </div>
            </div>
          </div>

          {/* Mini Calendar & Agenda Widget */}
          <MiniCalendarWidget title="Kalender & Kegiatan RT 01" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 animate-fade-up stagger-2">
        <button
          onClick={() => setActiveTab('antrean')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all press-down ${
            activeTab === 'antrean' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Antrean Surat ({surats.length})
        </button>
        <button
          onClick={() => setActiveTab('warga')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all press-down ${
            activeTab === 'warga' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Data Kependudukan ({wargas.length})
        </button>
        <button
          onClick={() => setActiveTab('kas')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all press-down ${
            activeTab === 'kas' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Pembukuan Kas & Iuran
        </button>
      </div>

      {/* TAB 1: Antrean Surat */}
      {activeTab === 'antrean' && (
        <div className="card-surface p-6 sm:p-8 space-y-5 animate-fade-up stagger-3">
          <div className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
            <span>Daftar Permohonan Surat Masuk:</span>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4">No. Resi</th>
                  <th className="p-4">Nama Pemohon & NIK</th>
                  <th className="p-4">Jenis Surat</th>
                  <th className="p-4">Keperluan</th>
                  <th className="p-4">Status Terkini</th>
                  <th className="p-4 text-right">Aksi RT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {surats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      Tidak ada data surat
                    </td>
                  </tr>
                ) : (
                  surats.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-emerald-50/50 transition-colors" style={{ animationDelay: `${(idx + 1) * 50}ms` }}>
                      <td className="p-4 font-mono font-bold text-gray-700">{s.nomor_resi}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-900 text-base">{s.warga_profile?.nama_lengkap}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">NIK: {s.warga_profile?.nik}</div>
                      </td>
                      <td className="p-4 font-semibold text-emerald-800">{s.surat_type?.nama_surat}</td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">{s.keperluan}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          s.status === 'pending_rt' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          s.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          s.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                          'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {s.status === 'pending_rt' ? 'Perlu ACC RT' :
                           s.status === 'pending_rw' ? 'Diteruskan ke RW' :
                           s.status === 'processed_sekdes' ? 'Diproses Sekdes' :
                           s.status === 'completed' ? 'Selesai & Sah' : 'Ditolak'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {s.status === 'pending_rt' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApproveRt(s.id)}
                              disabled={isProcessing}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm press-down hover-glow flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" /> ACC & Teruskan
                            </button>
                            <button
                              onClick={() => setSelectedSurat(s)}
                              className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors press-down border border-rose-200 flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Tolak
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Telah Diperiksa</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Kependudukan RT */}
      {activeTab === 'warga' && (
        <div className="card-surface p-6 sm:p-8 space-y-5 animate-fade-up stagger-3">
          <div className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Buku Administrasi Data Penduduk RT 01:
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4">Nama Lengkap</th>
                  <th className="p-4">NIK & No. KK</th>
                  <th className="p-4">No. WhatsApp</th>
                  <th className="p-4">Status Keluarga</th>
                  <th className="p-4">Klasifikasi Ekonomi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {wargas.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Belum ada data warga</td></tr>
                ) : (
                  wargas.map((w, idx) => (
                    <tr key={w.id} className="hover:bg-emerald-50/50 transition-colors animate-fade-in" style={{ animationDelay: `${(idx + 1) * 50}ms` }}>
                      <td className="p-4 font-bold text-gray-900 text-base">{w.nama_lengkap}</td>
                      <td className="p-4 font-mono text-sm text-gray-600">
                        <div>NIK: {w.nik}</div>
                        <div className="text-xs text-gray-400 mt-0.5">KK: {w.kartu_keluarga?.no_kk || '-'}</div>
                      </td>
                      <td className="p-4 font-mono text-emerald-800 font-medium">{w.no_hp_wa || '-'}</td>
                      <td className="p-4 text-gray-700">{w.status_keluarga}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          w.status_ekonomi.includes('PKH') ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {w.status_ekonomi}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Kas RT */}
      {activeTab === 'kas' && (
        <div className="card-surface p-6 sm:p-8 space-y-6 animate-fade-up stagger-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Buku Kas & Iuran Rukun Tetangga (RT 01)</h3>
              <p className="text-sm text-gray-500 mt-1">Dikelola oleh Bendahara RT untuk iuran sampah, keamanan, dan perbaikan lingkungan.</p>
            </div>

            <button
              onClick={() => setShowKasModal(true)}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover-lift press-down hover-glow shrink-0"
            >
              <Plus className="w-5 h-5" /> Catat Transaksi Kas
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 hover-lift transition-all">
              <div className="text-gray-600 font-medium">Total Iuran Masuk</div>
              <div className="text-2xl font-black text-emerald-800 mt-2">
                Rp {Number(kasData?.summary?.total_masuk || 25000).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 hover-lift transition-all">
              <div className="text-gray-600 font-medium">Total Pengeluaran</div>
              <div className="text-2xl font-black text-rose-800 mt-2">
                Rp {Number(kasData?.summary?.total_keluar || 150000).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 hover-lift transition-all">
              <div className="text-gray-600 font-medium">Saldo Akhir Kas</div>
              <div className="text-2xl font-black text-blue-800 mt-2">
                Rp {Number(kasData?.summary?.saldo || 0).toLocaleString('id-ID')}
              </div>
            </div>
          </div>

          {/* Kas Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Keterangan</th>
                  <th className="p-4">Jenis</th>
                  <th className="p-4 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {kasData?.transactions && kasData.transactions.length > 0 ? (
                  kasData.transactions.map((tx: any, idx: number) => (
                    <tr key={tx.id} className="hover:bg-emerald-50/50 transition-colors animate-fade-in" style={{ animationDelay: `${(idx + 1) * 50}ms` }}>
                      <td className="p-4 font-mono text-gray-600">{new Date(tx.tanggal_transaksi).toLocaleDateString('id-ID')}</td>
                      <td className="p-4 font-bold text-gray-900">{tx.category?.nama_kategori || 'Kas RT'}</td>
                      <td className="p-4 text-gray-700">{tx.keterangan}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          tx.tipe === 'Pemasukan' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {tx.tipe}
                        </span>
                      </td>
                      <td className={`p-4 text-right font-bold font-mono text-base ${
                        tx.tipe === 'Pemasukan' ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {tx.tipe === 'Pemasukan' ? '+' : '-'} Rp {Number(tx.jumlah).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Belum ada transaksi kas</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Input Kas RT */}
      {showKasModal && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl modal-content">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h3 className="font-black text-xl text-gray-900">Catat Transaksi Kas RT 01</h3>
              <button onClick={() => setShowKasModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">✕</button>
            </div>

            <form onSubmit={handleAddKas} className="space-y-5">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setKasTipe('Pemasukan')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all press-down shadow-sm ${
                    kasTipe === 'Pemasukan' ? 'bg-emerald-600 text-white' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  + Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setKasTipe('Pengeluaran')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all press-down shadow-sm ${
                    kasTipe === 'Pengeluaran' ? 'bg-rose-600 text-white' : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  - Pengeluaran
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 50000"
                  value={kasJumlah}
                  onChange={(e) => setKasJumlah(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase mb-2">Keterangan Transaksi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Iuran sampah bulan September - KK Gunawan"
                  value={kasKeterangan}
                  onChange={(e) => setKasKeterangan(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowKasModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-bold hover:bg-gray-50 transition-colors press-down"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all shadow-md press-down hover-glow flex items-center justify-center min-w-[140px]"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reject Surat */}
      {selectedSurat && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl modal-content animate-scale-up">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-black text-xl text-gray-900">Tolak Permohonan Surat</h3>
              <button 
                onClick={() => {
                  setSelectedSurat(null);
                  setActionCatatan('');
                }} 
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Pilih alasan baku atau tulis catatan perbaikan berkas untuk pemohon (<strong className="text-gray-900">{selectedSurat.warga_profile?.nama_lengkap}</strong>). Alasan ini akan langsung tampil di akun warga.
            </p>

            {/* Quick Reason Presets */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-gray-500 uppercase">Pilihan Alasan Cepat:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Foto KTP / KK buram dan tidak terbaca jelas.',
                  'Berkas persyaratan administrasi belum lengkap.',
                  'Alamat domisili pemohon tidak sesuai catatan RT.',
                  'Keperluan permohonan surat belum spesifik / jelas.',
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setActionCatatan(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors font-medium text-left"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Catatan / Alasan Penolakan Resmi *</label>
              <textarea
                rows={3}
                required
                placeholder="Tulis alasan penolakan atau gunakan pilihan cepat di atas..."
                value={actionCatatan}
                onChange={(e) => setActionCatatan(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 transition-all outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => {
                  setSelectedSurat(null);
                  setActionCatatan('');
                }} 
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs sm:text-sm font-bold hover:bg-gray-50 transition-colors press-down cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={() => handleReject(selectedSurat.id)} 
                disabled={isProcessing || !actionCatatan.trim()}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold transition-all shadow-md press-down flex items-center justify-center min-w-[140px] cursor-pointer"
              >
                {isProcessing ? 'Memproses...' : 'Kirim Penolakan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
