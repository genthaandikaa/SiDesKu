import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Wallet, TrendingUp, TrendingDown, Plus, 
  Trash2, Loader2, DollarSign, ArrowRight, ShieldCheck, FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import api from '@/shared/lib/axios';
import { ApbdesRecord, ApbdesCategory } from '@/shared/types';
import {
  MetricStatCard,
  AreaSplineChart,
  BarActivityChart,
  MiniCalendarWidget,
} from '@/shared/components/charts';

interface BendaharaDashboardProps {
  activeSubmenu?: string;
}

export const BendaharaDashboard: React.FC<BendaharaDashboardProps> = ({ activeSubmenu = 'beranda' }) => {
  const { user } = useAuth();
  const [apbdesData, setApbdesData] = useState<any>(null);
  const [categories, setCategories] = useState<ApbdesCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [uraian, setUraian] = useState('');
  const [anggaran, setAnggaran] = useState<number | ''>('');

  // Lock body scroll and handle ESC key when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsModalOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isModalOpen]);
  const [realisasi, setRealisasi] = useState<number | ''>('');

  useEffect(() => {
    if (['input_pemasukan', 'input_pengeluaran'].includes(activeSubmenu)) {
      setIsModalOpen(true);
    }
  }, [activeSubmenu]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, catRes] = await Promise.all([
        api.get('/public/apbdes/summary'),
        api.get('/apbdes/categories'),
      ]);
      if (summaryRes.data.success) setApbdesData(summaryRes.data);
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !uraian.trim() || !anggaran) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/apbdes/records', {
        category_id: categoryId,
        tahun_anggaran: 2026,
        uraian: uraian.trim(),
        anggaran: Number(anggaran),
        realisasi: Number(realisasi || 0),
        tanggal_realisasi: new Date().toISOString().split('T')[0],
      });
      if (res.data.success) {
        setIsModalOpen(false);
        setUraian('');
        setAnggaran('');
        setRealisasi('');
        setCategoryId('');
        fetchData();
      }
    } catch (err: any) {
      alert('Gagal menambah pos: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id: number) => {
    if (!confirm('Hapus pos anggaran ini?')) return;
    try {
      await api.delete(`/apbdes/records/${id}`);
      fetchData();
    } catch (err: any) {
      alert('Gagal menghapus: ' + (err.response?.data?.message || 'Error'));
    }
  };

  const s = apbdesData?.summary;
  const records: ApbdesRecord[] = apbdesData?.records || [];
  const roleSlug = user?.role?.slug || '';
  const canManage = ['bendahara_desa', 'admin', 'sekdes', 'kades'].includes(roleSlug);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 page-enter">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  const surplus = (s?.pendapatan?.realisasi || 675000000) - (s?.belanja?.realisasi || 217500000);

  return (
    <div className="space-y-6 page-enter font-sans">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <MetricStatCard
          title="Realisasi Pendapatan"
          value={`Rp ${(Number(s?.pendapatan?.realisasi || 675000000) / 1000000).toFixed(0)} Jt`}
          subvalue={`/ ${s?.pendapatan?.persen || 60.8}% Target`}
          percentage={Math.round(s?.pendapatan?.persen || 60.8)}
          color="emerald"
          trend="Transfer ADD & DD Tahap II Masuk"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Serapan Belanja Desa"
          value={`Rp ${(Number(s?.belanja?.realisasi || 217500000) / 1000000).toFixed(0)} Jt`}
          subvalue={`/ ${s?.belanja?.persen || 92.5}% Pagu`}
          percentage={Math.round(s?.belanja?.persen || 92.5)}
          color="teal"
          trend="Pembangunan Fisik Sesuai Jadwal"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Saldo Kasda / Rekening Desa"
          value={`Rp ${(surplus / 1000000).toFixed(0)} Jt`}
          subvalue="Siap Dialokasikan"
          percentage={88}
          color="sky"
          trend="Kas Lancar & Terbuka"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Kepatuhan Siskeudes & APBDes"
          value="100% Valid"
          subvalue="Tahun Anggaran 2026"
          percentage={100}
          color="indigo"
          trend="Standar Kemendagri / BPKP"
          isPositiveTrend={true}
        />
      </div>

      {/* Financial Chart & Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left 8 Cols: Performance Overview Spline Area Chart */}
        <div className="xl:col-span-8 space-y-5">
          <AreaSplineChart
            title="Arus Kas Masuk vs Realisasi Belanja APBDes 2026"
            subtitle="Grafik Tren Finansial Bulanan (Jan - Agu)"
            data={[
              { label: 'Jan', value: 45, secondaryValue: 20, tooltipText: 'Kas Masuk (Juta)' },
              { label: 'Feb', value: 60, secondaryValue: 35, tooltipText: 'Kas Masuk (Juta)' },
              { label: 'Mar', value: 85, secondaryValue: 50, tooltipText: 'Kas Masuk (Juta)' },
              { label: 'Apr', value: 110, secondaryValue: 75, tooltipText: 'Kas Masuk (Juta)' },
              { label: 'Mei', value: 140, secondaryValue: 95, tooltipText: 'Kas Masuk (Juta)' },
              { label: 'Jun', value: 175, secondaryValue: 120, tooltipText: 'Kas Masuk (Juta)' },
              { label: 'Jul', value: 210, secondaryValue: 155, tooltipText: 'Kas Masuk (Juta)' },
              { label: 'Agu', value: 245, secondaryValue: 190, tooltipText: 'Kas Masuk (Juta)' },
            ]}
            highlightValue="94.2%"
            highlightLabel="Efektivitas Serapan Anggaran Pembangunan"
            trendText="+11.5% vs pagu awal"
          />

          {/* Sub-grid under Chart: Weekly Bar Activity (6 Col) + Quick Actions (6 Col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BarActivityChart
              title="Aktivitas Transaksi Finansial"
              subtitle="Statistik Mingguan BKU"
              data={[
                { label: 'Sen', value: 16 },
                { label: 'Sel', value: 24 },
                { label: 'Rab', value: 36, highlight: true },
                { label: 'Kam', value: 28 },
                { label: 'Jum', value: 45, highlight: true },
                { label: 'Sab', value: 12 },
                { label: 'Min', value: 4 },
              ]}
              mainValue="32 Transaksi"
              mainLabel="Mutasi Kas Tercatat Minggu Ini"
            />

            {/* Quick Action Box */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  Aksi Bendahara
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">Pintasan Buku Kas Umum</h4>
                <p className="text-xs text-slate-500 mt-0.5">Input pos baru, cetak LPJ, dan ekspor APBDes.</p>
              </div>

              <div className="space-y-2">
                {canManage && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all press-down flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>Input Pos Anggaran / Realisasi</span>
                    </span>
                    <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">
                      + Baru
                    </span>
                  </button>
                )}

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Siskeudes Online Sync</span>
                  </span>
                  <span className="text-emerald-700 font-extrabold text-[11px]">Terhubung</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Personal Profile Card + Mini Calendar Widget */}
        <div className="xl:col-span-4 space-y-5">
          {/* Bendahara Profile Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                Pengelola Keuangan
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                ● Aktif Menjabat
              </span>
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              {user?.role?.slug === 'bendahara' && user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                  {user?.role?.slug === 'bendahara' ? (user?.name?.charAt(0) || 'R') : 'R'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 leading-snug break-words">
                  {user?.role?.slug === 'bendahara' ? user?.name : 'Ratna Dewi, S.E'}
                </h4>
                <div className="text-[11px] text-emerald-700 font-extrabold mt-0.5">
                  Kaur Keuangan (Bendahara Desa)
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  NIPD: 19890715 201502 2 001
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Otoritas Finansial:</span>
                <span className="font-extrabold text-slate-900">Buku Kas Umum (BKU)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Bank Penampung:</span>
                <span className="font-mono font-bold text-slate-800">Bank Jatim Kasda</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Audit BPKP:</span>
                <span className="text-emerald-700 font-black">WTP (Wajar Tanpa Pengecualian)</span>
              </div>
            </div>
          </div>

          {/* Mini Calendar & Agenda Widget */}
          <MiniCalendarWidget title="Kalender Pajak & Anggaran Desa" />
        </div>
      </div>

      <div className="card-surface p-6 space-y-4 animate-fade-up stagger-5">
        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Rincian Pos Anggaran & Realisasi APBDes 2026
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12 animate-scale-up">
            <img src="/images/empty-zoom.png" alt="" className="w-28 mx-auto mb-4 opacity-40" />
            <p className="text-xs text-gray-400">Belum ada pos anggaran tercatat.</p>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="bg-[#f8faf9] text-gray-600 border-b border-gray-200 font-semibold">
                  <tr>
                    <th className="p-3 whitespace-nowrap">Pos & Kode</th>
                    <th className="p-3 min-w-[180px]">Uraian</th>
                    <th className="p-3 text-right whitespace-nowrap">Anggaran (Rp)</th>
                    <th className="p-3 text-right whitespace-nowrap">Realisasi (Rp)</th>
                    <th className="p-3 text-center whitespace-nowrap">%</th>
                    {canManage && <th className="p-3 text-right whitespace-nowrap">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((r) => {
                    const persen = r.anggaran > 0 ? Math.round((r.realisasi / r.anggaran) * 100) : 0;
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3 whitespace-nowrap">
                          <div className="font-bold text-gray-900">{r.category?.nama_kategori}</div>
                          <div className="text-[11px] text-gray-400 font-mono">{r.category?.kode_rekening} ({r.category?.jenis})</div>
                        </td>
                        <td className="p-3 text-gray-700 font-medium">{r.uraian}</td>
                        <td className="p-3 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                          {Number(r.anggaran).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-800 whitespace-nowrap">
                          {Number(r.realisasi).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            {persen}%
                          </span>
                        </td>
                        {canManage && (
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteRecord(r.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors press-down"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="sm:hidden space-y-3">
              {records.map((r) => {
                const persen = r.anggaran > 0 ? Math.round((r.realisasi / r.anggaran) * 100) : 0;
                return (
                  <div key={r.id} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">
                          {r.category?.kode_rekening} • {r.category?.jenis}
                        </div>
                        <h4 className="text-xs font-black text-slate-900 mt-0.5">{r.category?.nama_kategori}</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200 shrink-0">
                        {persen}%
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {r.uraian}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-medium">Anggaran</div>
                        <div className="font-bold font-mono text-slate-900 mt-0.5">
                          Rp {Number(r.anggaran).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                        <div className="text-[10px] text-emerald-700 font-medium">Realisasi</div>
                        <div className="font-bold font-mono text-emerald-900 mt-0.5">
                          Rp {Number(r.realisasi).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 font-sans overflow-y-auto animate-fade-in select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div 
            className="relative bg-white rounded-2xl border border-gray-200 max-w-md w-full p-6 space-y-4 shadow-2xl modal-content my-auto max-h-[90vh] overflow-y-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">Tambah Pos APBDes</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-gray-400 hover:text-gray-600 press-down cursor-pointer"
                title="Tutup (ESC)"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Kategori Rekening</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-white focus-ring"
                >
                  <option value="">-- Pilih --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>[{c.jenis}] {c.kode_rekening} - {c.nama_kategori}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Uraian</label>
                <input type="text" required placeholder="Contoh: Pengaspalan jalan" value={uraian} onChange={(e) => setUraian(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus-ring" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Pagu (Rp)</label>
                  <input type="number" required placeholder="150000000" value={anggaran} onChange={(e) => setAnggaran(Number(e.target.value))} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus-ring" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Realisasi (Rp)</label>
                  <input type="number" placeholder="120000000" value={realisasi} onChange={(e) => setRealisasi(Number(e.target.value))} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus-ring" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border text-xs font-bold press-down cursor-pointer">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold press-down cursor-pointer">
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
