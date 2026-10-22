import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X,
  Wallet, TrendingUp, TrendingDown, Plus, 
  Trash2, Loader2, DollarSign, ArrowRight, ShieldCheck, FileSpreadsheet,
  Calendar, FileText, Printer, Download, Eye, CheckCircle2, ArrowDownLeft,
  ArrowUpRight, Filter, Search, Globe, ChevronRight, AlertCircle
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
import { ProfileSayaView } from './RoleDashboardViews';
import { CetakLpjModal } from './CetakLpjModal';
import { Pagination } from '@/shared/components/Pagination';

interface BendaharaDashboardProps {
  activeSubmenu?: string;
}

export const BendaharaDashboard: React.FC<BendaharaDashboardProps> = ({ activeSubmenu = 'beranda' }) => {
  const { user } = useAuth();
  const [apbdesData, setApbdesData] = useState<any>(null);
  const [categories, setCategories] = useState<ApbdesCategory[]>([]);
  const [desa, setDesa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLpjModal, setShowLpjModal] = useState(false);
  const [showTtdModal, setShowTtdModal] = useState(false);
  const [targetTtdRole, setTargetTtdRole] = useState<'bendahara' | 'kades'>('bendahara');
  const [ttdBendaharaUrl, setTtdBendaharaUrl] = useState<string>('');
  const [ttdKadesUrl, setTtdKadesUrl] = useState<string>('');
  const [ttdMode, setTtdMode] = useState<'upload' | 'draw' | 'url'>('upload');
  const signatureCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSavingTtd, setIsSavingTtd] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Unified Transaction State
  const [txType, setTxType] = useState<'Pendapatan' | 'Belanja'>('Pendapatan');
  const [sumberDana, setSumberDana] = useState<string>('DDS');
  const [nomorBukti, setNomorBukti] = useState<string>('');
  const [tanggalTransaksi, setTanggalTransaksi] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [uraian, setUraian] = useState('');
  const [anggaran, setAnggaran] = useState<number | ''>('');
  const [realisasi, setRealisasi] = useState<number | ''>('');
  const [filterJenis, setFilterJenis] = useState<'all' | 'Pendapatan' | 'Belanja'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPublished, setIsPublished] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sides_apbdes_is_published');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const handleTogglePublish = () => {
    const next = !isPublished;
    setIsPublished(next);
    try {
      localStorage.setItem('sides_apbdes_is_published', String(next));
    } catch {
      // ignore
    }
  };

  const normalizedSubmenu = (activeSubmenu || '').replace(/-/g, '_');

  useEffect(() => {
    if (normalizedSubmenu === 'input_pengeluaran') {
      setTxType('Belanja');
    } else if (normalizedSubmenu === 'input_pemasukan') {
      setTxType('Pendapatan');
    }
  }, [normalizedSubmenu]);

  // Lock body scroll and handle ESC key when modal is open
  useEffect(() => {
    if (isModalOpen || showTtdModal || showLpjModal) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsModalOpen(false);
          setShowTtdModal(false);
          setShowLpjModal(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isModalOpen, showTtdModal, showLpjModal]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, catRes, desaRes] = await Promise.all([
        api.get('/public/apbdes/summary'),
        api.get('/apbdes/categories'),
        api.get('/settings/desa'),
      ]);
      if (summaryRes.data.success) setApbdesData(summaryRes.data);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (desaRes.data?.success && desaRes.data?.data) {
        setDesa(desaRes.data.data);
        if (desaRes.data.data.ttd_bendahara_url) {
          setTtdBendaharaUrl(desaRes.data.data.ttd_bendahara_url);
        }
        if (desaRes.data.data.ttd_kades_url) {
          setTtdKadesUrl(desaRes.data.data.ttd_kades_url);
        }
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Pilih file gambar tanda tangan (PNG atau JPG)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (targetTtdRole === 'bendahara') {
        setTtdBendaharaUrl(result);
      } else {
        setTtdKadesUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveTtd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingTtd(true);
    try {
      let finalUrl = targetTtdRole === 'bendahara' ? ttdBendaharaUrl : ttdKadesUrl;
      if (ttdMode === 'draw' && signatureCanvasRef.current) {
        finalUrl = signatureCanvasRef.current.toDataURL('image/png');
      }

      if (!finalUrl.trim()) {
        alert('Tanda tangan belum tersedia. Silakan upload gambar, gambar langsung, atau masukkan URL.');
        setIsSavingTtd(false);
        return;
      }

      const payload: any = {};
      if (targetTtdRole === 'bendahara') {
        payload.ttd_bendahara_url = finalUrl;
        setTtdBendaharaUrl(finalUrl);
      } else {
        payload.ttd_kades_url = finalUrl;
        setTtdKadesUrl(finalUrl);
      }

      const res = await api.post('/settings/desa', payload);
      if (res.data.success) {
        setShowTtdModal(false);
        fetchData();
        alert(`Tanda tangan digital ${targetTtdRole === 'bendahara' ? 'Kaur Keuangan / Bendahara' : 'Kepala Desa'} berhasil disimpan!`);
      }
    } catch (err: any) {
      alert('Gagal menyimpan tanda tangan: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setIsSavingTtd(false);
    }
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !uraian.trim() || !anggaran) return;

    const currentSurplus = (apbdesData?.summary?.pendapatan?.realisasi || 675000000) - (apbdesData?.summary?.belanja?.realisasi || 217500000);
    const nominalKeluar = Number(realisasi || anggaran);
    if (txType === 'Belanja' && nominalKeluar > currentSurplus && currentSurplus > 0) {
      const proceed = confirm(`Perhatian: Nilai pengeluaran kas (Rp ${nominalKeluar.toLocaleString('id-ID')}) melampaui estimasi sisa surplus kas aktif (Rp ${currentSurplus.toLocaleString('id-ID')}). Tetap lanjutkan pencatatan mutasi kas?`);
      if (!proceed) return;
    }

    setIsSubmitting(true);
    try {
      const prefix = nomorBukti.trim() ? `[${nomorBukti.trim()}] ` : '';
      const suffix = sumberDana ? ` (${sumberDana})` : '';
      const fullUraian = `${prefix}${uraian.trim()}${suffix}`;

      const res = await api.post('/apbdes/records', {
        category_id: categoryId,
        tahun_anggaran: 2026,
        uraian: fullUraian,
        anggaran: Number(anggaran),
        realisasi: Number(realisasi || anggaran),
        tanggal_realisasi: tanggalTransaksi || new Date().toISOString().split('T')[0],
      });
      if (res.data.success) {
        setIsModalOpen(false);
        setUraian('');
        setNomorBukti('');
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

  const handleExportCsv = () => {
    const records: ApbdesRecord[] = apbdesData?.records || [];
    const headers = 'ID,Tahun,Kategori,Jenis,Uraian,Pagu Anggaran,Realisasi,Tanggal Realisasi\n';
    const rows = records.map(r => 
      `"${r.id}","${r.tahun_anggaran}","${r.category?.nama_kategori || ''}","${r.category?.jenis || ''}","${r.uraian.replace(/"/g, '""')}","${r.anggaran}","${r.realisasi}","${r.tanggal_realisasi || ''}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BKU_APBDes_Doko_2026_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const s = apbdesData?.summary;
  const records: ApbdesRecord[] = apbdesData?.records || [];
  const surplus = (s?.pendapatan?.realisasi || 675000000) - (s?.belanja?.realisasi || 217500000);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterJenis, searchQuery]);

  const filteredRecords = records.filter(r => {
    const matchJenis = filterJenis === 'all' || r.category?.jenis === filterJenis;
    const matchSearch = r.uraian.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (r.category?.nama_kategori || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchJenis && matchSearch;
  });

  const paginatedRecords = filteredRecords.slice((currentPage - 1) * 10, currentPage * 10);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 page-enter">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  // SUBMENU: BUKU KAS UMUM / DAFTAR TRANSAKSI
  if (['daftar_transaksi', 'bku', 'transaksi'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Buku Kas Umum (BKU)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pencatatan penerimaan dan pengeluaran kas desa.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer press-down"
          >
            <Plus size={16} />
            <span>Tambah transaksi</span>
          </button>
        </div>

        {/* Ringkasan Kas BKU (Grid Adaptif: Saldo Utama + Pemasukan & Pengeluaran) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1 sm:order-last">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Saldo Kas Saat Ini</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Wallet size={15} className="text-emerald-600" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
              Rp {surplus.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">Status kas desa surplus & likuid</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Penerimaan (Debet)</span>
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-800 font-mono">
              Rp {Number(s?.pendapatan?.realisasi || 675000000).toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] text-slate-400">Total akumulasi kas masuk</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Pengeluaran (Kredit)</span>
              <TrendingDown size={16} className="text-teal-600" />
            </div>
            <div className="text-lg sm:text-xl font-black text-teal-800 font-mono">
              Rp {Number(s?.belanja?.realisasi || 217500000).toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] text-slate-400">Total belanja kas keluar</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="card-surface p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto">
              <button
                onClick={() => setFilterJenis('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filterJenis === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({records.length})
              </button>
              <button
                onClick={() => setFilterJenis('Pendapatan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filterJenis === 'Pendapatan' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                Penerimaan (Debet)
              </button>
              <button
                onClick={() => setFilterJenis('Belanja')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  filterJenis === 'Belanja' ? 'bg-teal-700 text-white shadow-xs' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                }`}
              >
                Pengeluaran (Kredit)
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Cari uraian transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* 1. TAMPILAN MOBILE: Card List View (Thumb-Friendly, Jelas, & Nyaman untuk Orang Awam) */}
          <div className="block md:hidden space-y-3">
            {filteredRecords.length === 0 ? (
              <div className="py-10 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-4">
                Tidak ada data transaksi yang cocok dengan filter.
              </div>
            ) : (
              paginatedRecords.map((r) => {
                const isPendapatan = r.category?.jenis === 'Pendapatan';
                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3 transition-all hover:border-emerald-300"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            isPendapatan ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {isPendapatan ? 'Penerimaan' : 'Pengeluaran'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {r.tanggal_realisasi ? new Date(r.tanggal_realisasi).toLocaleDateString('id-ID') : '18 Agu 2026'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteRecord(r.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Pos"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">{r.uraian}</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {r.category?.nama_kategori || 'Bidang Kas Desa'}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[9px] font-bold uppercase text-slate-400">Pagu Anggaran</div>
                        <div className="font-mono text-slate-700 font-bold">
                          Rp {Number(r.anggaran).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] font-bold uppercase text-slate-400">Kas Terealisasi</div>
                        <div className={`font-mono font-black text-sm ${isPendapatan ? 'text-emerald-800' : 'text-teal-800'}`}>
                          Rp {Number(r.realisasi).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 2. TAMPILAN DESKTOP: Tabel Lengkap */}
          <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5">Tanggal</th>
                  <th className="py-3 px-3.5">Bidang / Kategori</th>
                  <th className="py-3 px-3.5">Uraian Transaksi</th>
                  <th className="py-3 px-3.5 text-center">Jenis</th>
                  <th className="py-3 px-3.5 text-right">Pagu Anggaran</th>
                  <th className="py-3 px-3.5 text-right">Realisasi Kas</th>
                  <th className="py-3 px-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Tidak ada data transaksi yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((r) => {
                    const isPendapatan = r.category?.jenis === 'Pendapatan';
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap font-mono">
                          {r.tanggal_realisasi ? new Date(r.tanggal_realisasi).toLocaleDateString('id-ID') : '18/08/2026'}
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-800">
                          {r.category?.nama_kategori || 'Bidang Kas'}
                        </td>
                        <td className="py-3 px-3.5 text-slate-700 max-w-[240px]">
                          {r.uraian}
                        </td>
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${isPendapatan ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'}`}>
                            {isPendapatan ? 'Penerimaan' : 'Pengeluaran'}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          Rp {Number(r.anggaran).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-bold whitespace-nowrap text-emerald-800">
                          Rp {Number(r.realisasi).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <button
                            onClick={() => handleDeleteRecord(r.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Pos"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredRecords.length}
            pageSize={10}
            onPageChange={setCurrentPage}
            itemLabel="transaksi kas"
          />
        </div>

        {/* Modal Form Tambah */}
        {renderModalForm()}
      </div>
    );
  }

  // SUBMENU: INPUT TRANSAKSI (PEMASUKAN & PENGELUARAN UNIFIED)
  if (['input_pemasukan', 'input_pengeluaran', 'tambah_transaksi'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-6 animate-fade-in font-sans max-w-2xl mx-auto">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Modul Transaksi Kas Desa
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Pencatatan Buku Kas Umum Terpadu
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Catat penerimaan pendapatan atau pengeluaran belanja APBDes dengan validasi saldo kas otomatis.
          </p>
        </div>

        <div className="card-surface p-6 rounded-3xl shadow-sm space-y-5">
          {/* Selector Jenis Transaksi */}
          <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setTxType('Pendapatan'); setCategoryId(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                txType === 'Pendapatan'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp size={15} />
              <span>Penerimaan Kas (Pemasukan)</span>
            </button>
            <button
              type="button"
              onClick={() => { setTxType('Belanja'); setCategoryId(''); }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                txType === 'Belanja'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown size={15} />
              <span>Pengeluaran Kas (Belanja / SPP)</span>
            </button>
          </div>

          <form onSubmit={handleAddRecord} className="space-y-4 text-xs font-semibold">
            {/* Saldo Warning Banner */}
            {txType === 'Belanja' && Number(realisasi || anggaran) > surplus && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black">Peringatan Likuiditas Kas:</span>
                  <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                    Nominal belanja yang dimasukkan melebihi sisa surplus kas aktif saat ini (Rp {surplus.toLocaleString('id-ID')}).
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-700">Tanggal Transaksi *</label>
                <input
                  type="date"
                  required
                  value={tanggalTransaksi}
                  onChange={(e) => setTanggalTransaksi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700">No. Bukti / SPP / Kwitansi</label>
                <input
                  type="text"
                  placeholder="Contoh: BKU/012/2026 atau SPP-04"
                  value={nomorBukti}
                  onChange={(e) => setNomorBukti(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-700">Kategori Rekening APBDes ({txType}) *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- Pilih Pos Kategori --</option>
                  {categories
                    .filter((c) => c.jenis === txType)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.kode_rekening}] {c.nama_kategori}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700">Sumber Dana APBDes *</label>
                <select
                  value={sumberDana}
                  onChange={(e) => setSumberDana(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="DDS">DDS - Dana Desa (APBN)</option>
                  <option value="ADD">ADD - Alokasi Dana Desa (Kabupaten)</option>
                  <option value="PAD">PADes - Pendapatan Asli Desa</option>
                  <option value="BHP">BHP - Bagi Hasil Pajak & Retribusi</option>
                  <option value="DLL">DLL - Bantuan Keuangan Lainnya</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700">Uraian Transaksi Kas *</label>
              <input
                type="text"
                required
                placeholder={txType === 'Pendapatan' ? 'Contoh: Penerimaan Dana Desa Tahap I dari Kas Daerah...' : 'Contoh: Belanja Pembelian Semen & Pasir Rabat Beton RW 02...'}
                value={uraian}
                onChange={(e) => setUraian(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-700">Pagu Anggaran Pos (Rp) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="Contoh: 150000000"
                  value={anggaran}
                  onChange={(e) => setAnggaran(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700">Nominal Kas Terealisasi (Rp) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="Contoh: 150000000"
                  value={realisasi}
                  onChange={(e) => setRealisasi(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 press-down"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Menyimpan Transaksi...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Simpan Transaksi Kas</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // SUBMENU: REALISASI APBDES (MATRIKS BIDANG)
  if (['realisasi_apbdes', 'realisasi'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Matriks Realisasi Anggaran
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Matriks Realisasi APBDes Per Bidang
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Rasio serapan pagu anggaran per bidang sesuai Standar Akuntansi Keuangan Desa (Siskeudes).
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Ekspor Matriks CSV</span>
          </button>
        </div>

        {/* Ringkasan KPI Realisasi (2x2 Grid di Mobile, 4-Col di Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Total Pagu Belanja</span>
            <div className="text-base sm:text-2xl font-black text-slate-900 font-mono tracking-tight">Rp 1,11 M</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">APBDes TA 2026</div>
          </div>
          <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Kas Terealisasi</span>
            <div className="text-base sm:text-2xl font-black text-emerald-800 font-mono tracking-tight">Rp 948 Jt</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-700 font-bold">85.4% Serapan</div>
          </div>
          <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Sisa Pagu Belanja</span>
            <div className="text-base sm:text-2xl font-black text-teal-800 font-mono tracking-tight">Rp 162 Jt</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Tersedia di Kas</div>
          </div>
          <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-400">Kinerja Realisasi</span>
            <div className="text-base sm:text-xl font-black text-indigo-900 tracking-tight">SANGAT TINGGI</div>
            <div className="text-[10px] sm:text-[11px] text-indigo-700 font-bold">Target Q4 Tercapai</div>
          </div>
        </div>

        {/* Visual Comparison Chart: Pagu vs Realisasi 5 Bidang */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
          {/* Left 8 Cols: Diagram Batang Komparasi */}
          <div className="lg:col-span-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm sm:text-base font-black text-slate-900">Diagram Komparasi: Pagu vs Realisasi</h4>
                <p className="text-xs text-slate-500">Perbandingan pagu anggaran dan kas belanja 5 bidang</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold shrink-0">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-md bg-slate-300 inline-block" /> Pagu
                </span>
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-md bg-emerald-600 inline-block" /> Realisasi
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {[
                { bidang: '1. Penyelenggaraan Pemdes', pagu: 120, realisasi: 114, pct: 95.0, color: 'bg-emerald-600' },
                { bidang: '2. Pembangunan Desa (Fisik)', pagu: 650, realisasi: 572, pct: 88.0, color: 'bg-teal-600' },
                { bidang: '3. Pembinaan Kemasyarakatan', pagu: 85, realisasi: 66.3, pct: 78.0, color: 'bg-sky-600' },
                { bidang: '4. Pemberdayaan Masyarakat', pagu: 160, realisasi: 131.2, pct: 82.0, color: 'bg-indigo-600' },
                { bidang: '5. Bencana & Keadaan Darurat', pagu: 95, realisasi: 66.5, pct: 70.0, color: 'bg-amber-600' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5 bg-slate-50/60 p-2.5 sm:p-3 rounded-2xl border border-slate-100">
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-xs">
                    <span className="text-slate-900 font-extrabold text-[12px] sm:text-xs">{item.bidang}</span>
                    <div className="flex items-center justify-between xs:justify-end gap-2">
                      <span className="text-slate-600 font-mono text-[11px]">
                        <strong>Rp {item.realisasi} Jt</strong> / <span className="text-slate-400">Rp {item.pagu} Jt</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                        {item.pct}%
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2.5 sm:h-3 rounded-full overflow-hidden flex relative">
                    <div 
                      className={`h-full rounded-full ${item.color} transition-all duration-700`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 4 Cols: Komposisi Sumber Dana */}
          <div className="lg:col-span-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-black text-slate-900">Komposisi Sumber Dana</h4>
              <p className="text-xs text-slate-500">Struktur penerimaan APBDes Tahun 2026</p>

              <div className="space-y-3 pt-3">
                {[
                  { label: 'DDS - Dana Desa (APBN)', nominal: 'Rp 480.000.000', pct: 58, color: 'bg-emerald-600' },
                  { label: 'ADD - Alokasi Dana Desa (Kab)', nominal: 'Rp 150.000.000', pct: 24, color: 'bg-teal-600' },
                  { label: 'PADes - Pendapatan Asli Desa', nominal: 'Rp 45.000.000', pct: 12, color: 'bg-sky-600' },
                  { label: 'BHP - Bagi Hasil Pajak/Retribusi', nominal: 'Rp 25.000.000', pct: 6, color: 'bg-amber-600' },
                ].map((dana, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700 truncate text-[11px] sm:text-xs">{dana.label}</span>
                      <span className="text-slate-900 font-mono text-[11px] shrink-0">{dana.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${dana.color}`} style={{ width: `${dana.pct}%` }} />
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono text-right">{dana.nominal}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium mt-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 inline mr-1" /> <strong>Kepatuhan Fiskal:</strong> Seluruh pencairan DDS Tahap I & ADD telah sesuai PMK No. 145/2023.
            </div>
          </div>
        </div>

        {/* 5 Bidang Cards (Grid Adaptif) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
            <span className="text-xs font-bold text-slate-500">Bidang 1: Penyelenggaraan Pemdes</span>
            <div className="text-lg sm:text-xl font-black text-slate-900">Rp 120.000.000</div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-[95%]" />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
              <span>Realisasi: Rp 114 Jt</span>
              <span className="text-emerald-700 font-bold">95.0% Serapan</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
            <span className="text-xs font-bold text-slate-500">Bidang 2: Pembangunan Desa</span>
            <div className="text-lg sm:text-xl font-black text-slate-900">Rp 650.000.000</div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-teal-600 h-full w-[88%]" />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
              <span>Realisasi: Rp 572 Jt</span>
              <span className="text-teal-700 font-bold">88.0% Serapan</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
            <span className="text-xs font-bold text-slate-500">Bidang 3: Pembinaan Kemasyarakatan</span>
            <div className="text-lg sm:text-xl font-black text-slate-900">Rp 85.000.000</div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-sky-600 h-full w-[78%]" />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
              <span>Realisasi: Rp 66,3 Jt</span>
              <span className="text-sky-700 font-bold">78.0% Serapan</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
            <span className="text-xs font-bold text-slate-500">Bidang 4: Pemberdayaan Masyarakat</span>
            <div className="text-lg sm:text-xl font-black text-slate-900">Rp 160.000.000</div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full w-[82%]" />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
              <span>Realisasi: Rp 131,2 Jt</span>
              <span className="text-indigo-700 font-bold">82.0% Serapan</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5 sm:col-span-2 lg:col-span-1">
            <span className="text-xs font-bold text-slate-500">Bidang 5: Bencana & Keadaan Darurat</span>
            <div className="text-lg sm:text-xl font-black text-slate-900">Rp 95.000.000</div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-600 h-full w-[70%]" />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-semibold">
              <span>Realisasi: Rp 66,5 Jt</span>
              <span className="text-amber-700 font-bold">70.0% Serapan</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SUBMENU: LAPORAN KEUANGAN & LPJ KAS BULANAN / TAHUNAN
  if (['laporan_keuangan', 'laporan_bulanan', 'laporan_tahunan', 'buat_laporan'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Pertanggungjawaban Keuangan
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Laporan Pertanggungjawaban (LPJ) Kas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Dokumen resmi pertanggungjawaban realisasi kas APBDes Tahun Anggaran 2026.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setTargetTtdRole('bendahara'); setShowTtdModal(true); }}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>TTD Bendahara</span>
            </button>
            <button
              onClick={() => { setTargetTtdRole('kades'); setShowTtdModal(true); }}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 transition-all cursor-pointer"
            >
              <ShieldCheck size={14} className="text-slate-600" />
              <span>TTD Kades</span>
            </button>
            <button
              onClick={() => setShowLpjModal(true)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>Cetak Dokumen LPJ Fisik</span>
            </button>
          </div>
        </div>

        {/* Paper Preview Card (Responsive Padding & Layout) */}
        <div id="lpj-preview-paper" className="printable-paper bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm max-w-3xl mx-auto space-y-5 text-slate-800 text-xs">
          <div className="text-center border-b pb-4 space-y-1">
            <h3 className="font-black text-xs sm:text-sm uppercase tracking-wide">Pemerintah Kabupaten Kediri</h3>
            <h4 className="font-extrabold text-xs sm:text-sm uppercase">Kecamatan Ngasem - Desa Doko</h4>
            <h5 className="font-black text-xs underline uppercase text-emerald-900 tracking-tight pt-1">
              Laporan Realisasi Pelaksanaan APBDes Tahun Anggaran 2026
            </h5>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between font-bold border-b pb-1 text-slate-500 text-[11px]">
              <span>Uraian Akun</span>
              <span>Jumlah Realisasi (Rp)</span>
            </div>

            <div className="flex items-center justify-between text-emerald-900 font-black text-xs sm:text-sm pt-1">
              <span>1. PENDAPATAN DESA</span>
              <span className="font-mono">Rp {Number(s?.pendapatan?.realisasi || 675000000).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center justify-between pl-3 text-slate-600 text-[11px] sm:text-xs">
              <span className="truncate pr-2">• Pendapatan Asli Desa (PADes)</span>
              <span className="font-mono font-medium shrink-0">Rp 45.000.000</span>
            </div>
            <div className="flex items-center justify-between pl-3 text-slate-600 text-[11px] sm:text-xs">
              <span className="truncate pr-2">• Dana Desa (Transfer APBN)</span>
              <span className="font-mono font-medium shrink-0">Rp 480.000.000</span>
            </div>
            <div className="flex items-center justify-between pl-3 text-slate-600 text-[11px] sm:text-xs">
              <span className="truncate pr-2">• Alokasi Dana Desa (ADD Kab)</span>
              <span className="font-mono font-medium shrink-0">Rp 150.000.000</span>
            </div>

            <div className="flex items-center justify-between text-teal-900 font-black text-xs sm:text-sm pt-2 border-t border-slate-100">
              <span>2. BELANJA DESA</span>
              <span className="font-mono">Rp {Number(s?.belanja?.realisasi || 217500000).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center justify-between pl-3 text-slate-600 text-[11px] sm:text-xs">
              <span className="truncate pr-2">• Belanja Pegawai & Operasional</span>
              <span className="font-mono font-medium shrink-0">Rp 85.000.000</span>
            </div>
            <div className="flex items-center justify-between pl-3 text-slate-600 text-[11px] sm:text-xs">
              <span className="truncate pr-2">• Belanja Barang & Jasa</span>
              <span className="font-mono font-medium shrink-0">Rp 42.500.000</span>
            </div>
            <div className="flex items-center justify-between pl-3 text-slate-600 text-[11px] sm:text-xs">
              <span className="truncate pr-2">• Belanja Modal Pembangunan</span>
              <span className="font-mono font-medium shrink-0">Rp 90.000.000</span>
            </div>

            <div className="flex items-center justify-between text-slate-900 font-black border-t-2 border-slate-800 pt-2.5 text-xs sm:text-sm">
              <span>SURPLUS / (DEFISIT) KAS</span>
              <span className="text-emerald-800 font-mono">Rp {surplus.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Area Tanda Tangan (Touch-Friendly & Responsif) */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
            <div 
              onClick={() => { setTargetTtdRole('kades'); setShowTtdModal(true); }}
              className="cursor-pointer group p-2 rounded-2xl hover:bg-slate-50 transition-colors"
              title="Klik untuk mengatur tanda tangan Kepala Desa"
            >
              <p className="text-[11px] text-slate-500">Mengetahui,</p>
              <p className="font-bold text-slate-900 text-xs">Kepala Desa Doko</p>
              <div className="h-16 flex items-center justify-center my-1">
                {desa?.ttd_kades_url ? (
                  <img src={desa.ttd_kades_url} alt="TTD Kades" className="h-14 object-contain group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="h-12 sm:h-14 flex items-center justify-center text-[10px] text-slate-400 italic border border-dashed border-slate-300 rounded-xl w-full max-w-[130px] sm:max-w-[150px] mx-auto px-1 bg-slate-50/50">
                    + Pasang TTD Kades
                  </div>
                )}
              </div>
              <p className="font-black underline text-slate-900 text-[11px] sm:text-xs truncate">{desa?.nama_kades || 'Drs. H. Bambang Prasetyo, M.Si'}</p>
            </div>

            <div 
              onClick={() => { setTargetTtdRole('bendahara'); setShowTtdModal(true); }}
              className="cursor-pointer group p-2 rounded-2xl hover:bg-slate-50 transition-colors"
              title="Klik untuk mengatur tanda tangan Bendahara"
            >
              <p className="text-[11px] text-slate-500">Doko, 12 Okt 2026</p>
              <p className="font-bold text-slate-900 text-xs">Kaur Keuangan</p>
              <div className="h-16 flex items-center justify-center my-1">
                {desa?.ttd_bendahara_url ? (
                  <img src={desa.ttd_bendahara_url} alt="TTD Bendahara" className="h-14 object-contain group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="h-12 sm:h-14 flex items-center justify-center text-[10px] text-slate-400 italic border border-dashed border-slate-300 rounded-xl w-full max-w-[130px] sm:max-w-[150px] mx-auto px-1 bg-slate-50/50">
                    + Pasang TTD Bendahara
                  </div>
                )}
              </div>
              <p className="font-black underline text-slate-900 text-[11px] sm:text-xs truncate">{desa?.nama_bendahara || 'Ratna Dewi Kusuma, S.E'}</p>
            </div>
          </div>
        </div>

        {showLpjModal && (
          <CetakLpjModal 
            apbdesData={apbdesData} 
            desa={desa}
            onClose={() => setShowLpjModal(false)} 
          />
        )}

        {renderTtdModal()}
      </div>
    );
  }

  // SUBMENU: PUBLIKASI LAPORAN (TRANSPARANSI PUBLIK)
  if (['publikasi_laporan', 'publikasi'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Keterbukaan Informasi Publik (KIP)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Publikasi APBDes Portal Warga
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Saklar kendali transparansi anggaran desa untuk halaman portal warga dan publik.
            </p>
          </div>
        </div>

        {/* Kotak Edukasi yang Ramah Orang Awam (Clean & Warm) */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-200/90 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black shrink-0">
              <Globe size={18} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900">Panduan Visibilitas APBDes untuk Warga</h3>
              <p className="text-[11px] text-slate-500">Regulasi: UU No. 14/2008 KIP & Permendagri No. 20/2018</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-black text-emerald-800 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Status AKTIF (Live Terbuka):</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Ringkasan anggaran, pendapatan, dan realisasi belanja kas otomatis tayang terbuka di <strong>Portal Warga</strong> agar masyarakat dapat mengawal dana desa.
              </p>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 font-black text-amber-800 text-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Status NON-AKTIF (Draft Tertutup):</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Data disembunyikan sementara dari portal warga (misal saat penyusunan RAPBDes baru atau audit internal BPD/Inspektorat belum selesai).
              </p>
            </div>
          </div>
        </div>

        {/* Control Card Toggle (Thumb-Friendly di Mobile) */}
        <div className="card-surface p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-100">
            <div>
              <h4 className="font-black text-sm sm:text-base text-slate-900">Saklar Visibilitas Portal Publik</h4>
              <p className="text-xs text-slate-500 mt-0.5">Kendalikan tayangan infografis keuangan desa untuk warga sekarang</p>
            </div>
            <button
              onClick={handleTogglePublish}
              className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95 ${
                isPublished 
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20' 
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <Globe size={16} />
              <span>{isPublished ? 'Publikasi Aktif (Live di Portal Warga)' : 'Draft (Khusus Internal Pemdes)'}</span>
            </button>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-xs sm:text-sm">Endpoint `/api/public/apbdes/summary` Sinkron Otomatis</span>
              <p className="text-emerald-800/90 mt-0.5 leading-relaxed text-[11px] sm:text-xs">
                Ketika saklar ini diaktifkan, infografis APBDes terbaru otomatis tersinkronisasi ke portal warga tanpa perlu konfigurasi teknis manual.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SUBMENU: EKSPOR LAPORAN
  if (['ekspor_laporan', 'ekspor'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Pusat Unduhan & Arsip Kas
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Ekspor & Cetak Rekapitulasi Kas Desa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Unduh data pembukuan Buku Kas Umum (BKU) dalam format spreadsheet Excel/CSV atau cetak dokumen resmi.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet size={20} />
            </div>
            <h4 className="font-black text-sm text-slate-900">Buku Kas Umum (.CSV / Excel)</h4>
            <p className="text-xs text-slate-500">Ekspor seluruh baris transaksi kas masuk dan keluar tahun anggaran 2026.</p>
            <button
              onClick={handleExportCsv}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Download size={14} />
              <span>Unduh Spreadsheet CSV</span>
            </button>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Printer size={20} />
            </div>
            <h4 className="font-black text-sm text-slate-900">Cetak Laporan Pertanggungjawaban</h4>
            <p className="text-xs text-slate-500">Pratinjau cetak formulir resmi pertanggungjawaban realisasi APBDes.</p>
            <button
              onClick={() => setShowLpjModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>Cetak Dokumen LPJ Fisik</span>
            </button>
          </div>
        </div>

        {showLpjModal && (
          <CetakLpjModal 
            apbdesData={apbdesData} 
            onClose={() => setShowLpjModal(false)} 
          />
        )}
      </div>
    );
  }

  // SUBMENU: PROFIL SAYA
  if (['profil_saya', 'profil'].includes(normalizedSubmenu)) {
    return <ProfileSayaView />;
  }

  // DEFAULT VIEW: BERANDA IKHTISAR KEUANGAN
  return (
    <div className="space-y-6 page-enter font-sans">
      {/* Metric Cards (2x2 Grid di Mobile, 4-Col di Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <MetricStatCard
          title="Realisasi Pendapatan"
          value={`Rp ${(Number(s?.pendapatan?.realisasi || 675000000) / 1000000).toFixed(0)} Jt`}
          subvalue={`/ ${s?.pendapatan?.persen || 60.8}% Target`}
          percentage={Math.round(s?.pendapatan?.persen || 60.8)}
          color="emerald"
          trend="ADD & DD Masuk"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Serapan Belanja"
          value={`Rp ${(Number(s?.belanja?.realisasi || 217500000) / 1000000).toFixed(0)} Jt`}
          subvalue={`/ ${s?.belanja?.persen || 92.5}% Pagu`}
          percentage={Math.round(s?.belanja?.persen || 92.5)}
          color="teal"
          trend="Sesuai Target"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Saldo Kasda Desa"
          value={`Rp ${(surplus / 1000000).toFixed(0)} Jt`}
          subvalue="Siap Dialokasikan"
          percentage={88}
          color="sky"
          trend="Kas Lancar"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Kepatuhan Siskeudes"
          value="100% Valid"
          subvalue="T.A 2026"
          percentage={100}
          color="indigo"
          trend="Kemendagri"
          isPositiveTrend={true}
        />
      </div>

      {/* Financial Chart & Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        <div className="xl:col-span-8 space-y-5">
          <div className="hidden lg:block space-y-5">
            <AreaSplineChart
              title="Arus Kas Masuk vs Realisasi Belanja APBDes 2026"
              subtitle="Grafik Tren Finansial Bulanan"
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="hidden lg:block">
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
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  Aksi Kaur Keuangan
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">Pintasan Buku Kas Umum</h4>
                <p className="text-xs text-slate-500 mt-0.5">Input pos baru, cetak LPJ, dan ekspor APBDes.</p>
              </div>

              <div className="space-y-2 text-xs font-bold">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-between transition-colors shadow-xs cursor-pointer"
                >
                  <span>Catat Transaksi Baru</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={handleExportCsv}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Ekspor Spreadsheet (.CSV)</span>
                  <Download size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-5">
          <MiniCalendarWidget
            title="Kalender Fiskal & Kas Desa"
            initialDate={new Date()}
            agendas={[
              { id: '1', date: 15, title: 'Rekonsiliasi BKU Mingguan', time: '09:00 WIB', category: 'Keuangan', color: 'emerald' },
              { id: '2', date: 20, title: 'Batas Penyerahan SPP', time: '14:00 WIB', category: 'Keuangan', color: 'amber' },
              { id: '3', date: 28, title: 'Penyaluran BLT-DD', time: '08:30 WIB', category: 'Bansos', color: 'sky' },
            ]}
          />
        </div>
      </div>

      {/* Modal Form Tambah */}
      {renderModalForm()}
      {renderTtdModal()}
    </div>
  );

  function renderTtdModal() {
    if (!showTtdModal) return null;
    const currentUrl = targetTtdRole === 'bendahara' ? ttdBendaharaUrl : ttdKadesUrl;

    return createPortal(
      <div 
        data-interactive-modal="true"
        className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in"
        onClick={() => setShowTtdModal(false)}
      >
        <div 
          className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up border border-slate-200 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Tanda Tangan Digital LPJ & APBDes</h3>
                <p className="text-xs text-slate-500">Pengesahan dokumen resmi pertanggungjawaban kas</p>
              </div>
            </div>
            <button
              onClick={() => setShowTtdModal(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Pejabat Target Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Pilih Pejabat Penandatangan:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTargetTtdRole('bendahara')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  targetTtdRole === 'bendahara'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Kaur Keuangan / Bendahara</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetTtdRole('kades')}
                className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  targetTtdRole === 'kades'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Kepala Desa</span>
              </button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Metode Tanda Tangan:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTtdMode('upload')}
                className={`py-2 px-2 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  ttdMode === 'upload' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Upload File</span>
              </button>
              <button
                type="button"
                onClick={() => setTtdMode('draw')}
                className={`py-2 px-2 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  ttdMode === 'draw' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Gambar Manual</span>
              </button>
              <button
                type="button"
                onClick={() => setTtdMode('url')}
                className={`py-2 px-2 rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  ttdMode === 'url' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Input URL</span>
              </button>
            </div>
          </div>

          {/* Form Body based on Mode */}
          <div className="space-y-3 pt-1">
            {ttdMode === 'upload' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                <input
                  type="file"
                  id="ttd-file-input"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="ttd-file-input"
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download size={14} className="rotate-180" />
                  <span>Pilih Gambar Tanda Tangan (PNG / JPG)</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Format PNG dengan latar transparan direkomendasikan agar cetak LPJ terlihat rapi dan presisi.
                </p>
              </div>
            )}

            {ttdMode === 'draw' && (
              <div className="space-y-2">
                <div className="border border-slate-300 rounded-2xl bg-white p-1 overflow-hidden shadow-inner">
                  <canvas
                    ref={signatureCanvasRef}
                    width={440}
                    height={160}
                    className="w-full h-36 bg-slate-50 rounded-xl cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Goreskan tanda tangan menggunakan mouse atau layar sentuh.</span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors cursor-pointer"
                  >
                    Hapus / Bersihkan
                  </button>
                </div>
              </div>
            )}

            {ttdMode === 'url' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">URL Gambar Tanda Tangan:</label>
                <input
                  type="text"
                  placeholder="https://... atau /images/ttd-pejabat.png"
                  value={currentUrl}
                  onChange={(e) => {
                    if (targetTtdRole === 'bendahara') setTtdBendaharaUrl(e.target.value);
                    else setTtdKadesUrl(e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs"
                />
              </div>
            )}

            {/* Preview Current / Saved Signature */}
            {currentUrl && ttdMode !== 'draw' && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Pratinjau TTD Aktif ({targetTtdRole === 'bendahara' ? 'Bendahara' : 'Kepala Desa'}):
                </span>
                <div className="h-16 flex items-center justify-center bg-white rounded-xl border border-dashed border-slate-200 p-2">
                  <img
                    src={currentUrl}
                    alt="Preview TTD"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowTtdModal(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={isSavingTtd}
              onClick={() => handleSaveTtd()}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 press-down"
            >
              {isSavingTtd ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              <span>Simpan & Terapkan TTD</span>
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  function renderModalForm() {
    if (!isModalOpen) return null;
    return createPortal(
      <div 
        className="fixed inset-0 bg-slate-900/60 z-[999999] flex items-center justify-center p-4 backdrop-blur-xs font-sans animate-fade-in"
        onClick={() => setIsModalOpen(false)}
      >
        <div 
          className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up border border-slate-200 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">Catat Pos Transaksi Kas Desa</h3>
              <p className="text-xs text-slate-500">Mutasi Buku Kas Umum (BKU) Tahun Anggaran 2026</p>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Segmented Mode Selector */}
          <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setTxType('Pendapatan'); setCategoryId(''); }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                txType === 'Pendapatan'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp size={14} />
              <span>Penerimaan (Debet)</span>
            </button>
            <button
              type="button"
              onClick={() => { setTxType('Belanja'); setCategoryId(''); }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                txType === 'Belanja'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown size={14} />
              <span>Pengeluaran (Kredit)</span>
            </button>
          </div>

          <form onSubmit={handleAddRecord} className="space-y-4 text-xs font-semibold">
            {txType === 'Belanja' && Number(realisasi || anggaran) > surplus && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black">Peringatan Likuiditas Kas:</span>
                  <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                    Nominal melebihi sisa surplus kas aktif saat ini (Rp {surplus.toLocaleString('id-ID')}).
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-700">Tanggal Transaksi *</label>
                <input
                  type="date"
                  required
                  value={tanggalTransaksi}
                  onChange={(e) => setTanggalTransaksi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700">No. Bukti / SPP / Kwitansi</label>
                <input
                  type="text"
                  placeholder="Contoh: BKU/012/2026 atau SPP-04"
                  value={nomorBukti}
                  onChange={(e) => setNomorBukti(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-700">Kategori Rekening ({txType}) *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">-- Pilih Pos Kategori --</option>
                  {categories
                    .filter((c) => c.jenis === txType)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.kode_rekening}] {c.nama_kategori}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700">Sumber Dana APBDes *</label>
                <select
                  value={sumberDana}
                  onChange={(e) => setSumberDana(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="DDS">DDS - Dana Desa (APBN)</option>
                  <option value="ADD">ADD - Alokasi Dana Desa (Kabupaten)</option>
                  <option value="PAD">PADes - Pendapatan Asli Desa</option>
                  <option value="BHP">BHP - Bagi Hasil Pajak & Retribusi</option>
                  <option value="DLL">DLL - Bantuan Keuangan Lainnya</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700">Uraian Transaksi Kas *</label>
              <input
                type="text"
                required
                placeholder={txType === 'Pendapatan' ? 'Contoh: Penerimaan Dana Desa Tahap I dari Kas Daerah...' : 'Contoh: Belanja Operasional Posyandu Anggrek...'}
                value={uraian}
                onChange={(e) => setUraian(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-slate-700">Pagu Anggaran Pos (Rp) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  placeholder="Contoh: 15000000"
                  value={anggaran}
                  onChange={(e) => setAnggaran(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700">Nominal Kas Terealisasi (Rp) *</label>
                <input
                  type="number"
                  min={0}
                  placeholder="Contoh: 12500000"
                  value={realisasi}
                  onChange={(e) => setRealisasi(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 press-down"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={15} />}
                <span>Simpan Pos Mutasi</span>
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  }
};
