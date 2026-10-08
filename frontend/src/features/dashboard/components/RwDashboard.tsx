import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Check, 
  Search,
  ShieldCheck,
  Eye,
  XCircle
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { SuratRequest } from '@/shared/types';
import { useAuth } from '@/shared/context/AuthContext';
import {
  MetricStatCard,
  AreaSplineChart,
  BarActivityChart,
  MiniCalendarWidget,
} from '@/shared/components/charts';
import { PreviewSuratModal } from './PreviewSuratModal';

interface RwDashboardProps {
  activeSubmenu?: string;
}

export const RwDashboard: React.FC<RwDashboardProps> = ({ activeSubmenu = 'beranda' }) => {
  const { user } = useAuth();
  const [surats, setSurats] = useState<SuratRequest[]>([]);
  const [previewSurat, setPreviewSurat] = useState<SuratRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRwSurats();
  }, []);

  const fetchRwSurats = async () => {
    try {
      const res = await api.get('/surats');
      if (res.data.success) {
        setSurats(res.data.data);
      }
    } catch {
      //
    }
  };

  const handleApproveRw = async (id: number) => {
    setIsProcessing(true);
    try {
      const res = await api.post(`/surats/${id}/approve-rw`, {
        catatan: 'Pengantar tingkat RW 01 diverifikasi dan diteruskan ke Sekretaris Desa.',
      });
      if (res.data.success) {
        setPreviewSurat(null);
        fetchRwSurats();
      }
    } catch (err: any) {
      alert('Gagal memverifikasi: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectRw = async (id: number, catatan: string) => {
    setIsProcessing(true);
    try {
      const res = await api.post(`/surats/${id}/reject`, {
        alasan: catatan,
      });
      if (res.data.success) {
        setPreviewSurat(null);
        fetchRwSurats();
      }
    } catch (err: any) {
      alert('Gagal menolak: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingRwSurats = surats.filter((s) => s.status === 'pending_rw');
  const completedSurats = surats.filter((s) => s.status === 'completed');

  const filteredSurats = surats.filter(s => 
    s.nomor_resi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.warga_profile?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.surat_type?.nama_surat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 page-enter font-sans">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <MetricStatCard
          title="Menunggu Verifikasi RW"
          value={`${pendingRwSurats.length} Berkas`}
          subvalue="Tingkat Lanjut"
          percentage={pendingRwSurats.length > 0 ? 60 : 100}
          color="amber"
          trend="SLA Rata-rata < 10 Menit"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Total RT Terkoordinasi"
          value="6 RT"
          subvalue="Wilayah RW 01"
          percentage={100}
          color="emerald"
          trend="RT 01 s/d RT 06 Aktif"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Total Warga Wilayah RW"
          value="980 Jiwa"
          subvalue="320 Kepala Keluarga"
          percentage={96}
          color="teal"
          trend="Data Sensus Sinkron"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Dokumen Diteruskan ke Desa"
          value={`${completedSurats.length} Surat`}
          subvalue="Validasi Berjenjang"
          percentage={100}
          color="sky"
          trend="100% Lolos Uji Lapangan"
          isPositiveTrend={true}
        />
      </div>

      {/* Performance Chart & Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left 8 Cols: Performance Overview Spline Area Chart */}
        <div className="xl:col-span-8 space-y-5">
          <AreaSplineChart
            title="Efisiensi Verifikasi Berjenjang RW 01"
            subtitle="Volume Pengantar RT Masuk & Diteruskan ke Balai Desa"
            data={[
              { label: 'Jan', value: 20, secondaryValue: 20, tooltipText: 'Pengantar Sah' },
              { label: 'Feb', value: 32, secondaryValue: 30, tooltipText: 'Pengantar Sah' },
              { label: 'Mar', value: 45, secondaryValue: 44, tooltipText: 'Pengantar Sah' },
              { label: 'Apr', value: 38, secondaryValue: 38, tooltipText: 'Pengantar Sah' },
              { label: 'Mei', value: 50, secondaryValue: 48, tooltipText: 'Pengantar Sah' },
              { label: 'Jun', value: 58, secondaryValue: 56, tooltipText: 'Pengantar Sah' },
              { label: 'Jul', value: 65, secondaryValue: 64, tooltipText: 'Pengantar Sah' },
              { label: 'Agu', value: Math.max(72, surats.length * 4), secondaryValue: completedSurats.length, tooltipText: 'Pengantar Sah' },
            ]}
            highlightValue="99.5%"
            highlightLabel="Kecepatan Koordinasi RT-RW"
            trendText="+14.2% vs bulan lalu"
          />

          {/* Sub-grid under Chart: Weekly Bar Activity (6 Col) + Quick Actions (6 Col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BarActivityChart
              title="Aktivitas Disposisi Mingguan"
              subtitle="Tingkat Responsif RW 01"
              data={[
                { label: 'Sen', value: 18 },
                { label: 'Sel', value: 28 },
                { label: 'Rab', value: 34, highlight: true },
                { label: 'Kam', value: 26 },
                { label: 'Jum', value: 42, highlight: true },
                { label: 'Sab', value: 15 },
                { label: 'Min', value: 8 },
              ]}
              mainValue="42 Jam"
              mainLabel="Waktu Disposisi Aktif Minggu Ini"
            />

            {/* Quick Action Box */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  Aksi Koordinasi
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">Pintasan Ketua RW 01</h4>
                <p className="text-xs text-slate-500 mt-0.5">Tindakan cepat verifikasi berjenjang RT ke Desa.</p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSearchTerm('pending_rw')}
                  className="w-full p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all press-down flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verifikasi Antrean Masuk ({pendingRwSurats.length})</span>
                  </span>
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">
                    ACC Cepat
                  </span>
                </button>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Status Koordinasi 6 RT</span>
                  </span>
                  <span className="text-emerald-700 font-extrabold text-[11px]">Semua Sinkron</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Personal Profile Card + Mini Calendar Widget */}
        <div className="xl:col-span-4 space-y-5">
          {/* Ketua RW Profile Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                Profil Pimpinan Wilayah
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
                  {user?.name?.charAt(0) || 'W'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 leading-snug break-words">
                  {user?.name || 'H. Sutarjo'}
                </h4>
                <div className="text-[11px] text-emerald-700 font-extrabold mt-0.5">
                  Ketua Rukun Warga (RW 01)
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  Wilayah: Dusun Doko Krajan
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Cakupan Koordinasi:</span>
                <span className="font-extrabold text-slate-900">RT 01 s/d RT 06</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Otoritas Validasi:</span>
                <span className="text-emerald-700 font-black">Level 2 (Pengantar RW)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Terusan Resmi:</span>
                <span className="text-slate-800 font-mono font-bold">Sekretaris Desa Doko</span>
              </div>
            </div>
          </div>

          {/* Mini Calendar & Agenda Widget */}
          <MiniCalendarWidget title="Kalender & Musyawarah RW 01" />
        </div>
      </div>

      {/* Table Permohonan Surat */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
              Daftar Permohonan Masuk
            </span>
            <h3 className="text-base font-black text-slate-900 mt-1">Antrean Pengantar dari RT (Wilayah RW 01)</h3>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pemohon / no resi..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Modern Table */}
        <div className="overflow-x-auto border border-gray-200/80 rounded-2xl shadow-sm">
          <table className="w-full text-left text-xs min-w-[720px] sm:min-w-0">
            <thead className="bg-slate-50/90 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3 sm:px-3.5">Nomor Resi</th>
                <th className="py-3 px-3 sm:px-3.5">Nama Pemohon & NIK</th>
                <th className="py-3 px-3 sm:px-3.5">Jenis Surat</th>
                <th className="py-3 px-3 sm:px-3.5">Keperluan</th>
                <th className="py-3 px-3 sm:px-3.5">Status Terkini</th>
                <th className="py-3 px-3 sm:px-3.5 text-right whitespace-nowrap sticky right-0 bg-slate-50 z-10 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)]">
                  Aksi Persetujuan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSurats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada data permohonan surat masuk.
                  </td>
                </tr>
              ) : (
                filteredSurats.map((s) => (
                  <tr key={s.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 sm:px-3.5 font-mono font-bold text-slate-800 whitespace-nowrap">{s.nomor_resi}</td>
                    <td className="py-3 px-3 sm:px-3.5">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">{s.warga_profile?.nama_lengkap}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">NIK: {s.warga_profile?.nik}</div>
                    </td>
                    <td className="py-3 px-3 sm:px-3.5">
                      <div className="font-bold text-emerald-800 text-xs leading-snug max-w-[160px] line-clamp-2">{s.surat_type?.nama_surat}</div>
                    </td>
                    <td className="py-3 px-3 sm:px-3.5 text-slate-600 text-xs max-w-[140px] truncate" title={s.keperluan}>{s.keperluan}</td>
                    <td className="py-3 px-3 sm:px-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        ['approved_rt', 'pending_rw'].includes(s.status) ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                        s.status === 'pending_rt' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        s.status === 'processed_sekdes' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' :
                        s.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        s.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {['approved_rt', 'pending_rw'].includes(s.status) ? 'Perlu ACC RW' :
                         s.status === 'pending_rt' ? 'Menunggu RT' :
                         s.status === 'processed_sekdes' ? 'Diproses Desa' :
                         s.status === 'completed' ? 'Diterima & Sah' :
                         s.status === 'rejected' ? '✕ Ditolak' : s.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-3.5 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] transition-colors">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setPreviewSurat(s)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors press-down flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Lihat Detail & Foto Berkas Lampiran"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Detail</span>
                        </button>

                        {['approved_rt', 'pending_rw'].includes(s.status) ? (
                          <>
                            <button
                              onClick={() => handleApproveRw(s.id)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all press-down flex items-center gap-1 cursor-pointer whitespace-nowrap"
                              title="ACC & Teruskan ke Kepala Desa"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>ACC</span>
                            </button>
                            <button
                              onClick={() => setPreviewSurat(s)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                              title="Tolak Permohonan (Buka Detail Berkas)"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </>
                        ) : s.status === 'rejected' ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 text-xs font-bold bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80 shadow-2xs whitespace-nowrap">
                            ✕ Ditolak
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 whitespace-nowrap">
                            {s.status === 'completed' ? '✓ Sah' : '✓ Telah Disetujui'}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview & Berkas Modal */}
      {previewSurat && (
        <PreviewSuratModal
          surat={previewSurat}
          role="rw"
          onClose={() => setPreviewSurat(null)}
          onApprove={(id) => handleApproveRw(id)}
          onReject={(id, catatan) => handleRejectRw(id, catatan)}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};
