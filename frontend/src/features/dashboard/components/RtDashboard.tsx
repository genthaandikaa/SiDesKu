import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Check, 
  XCircle,
  FileText,
  Users,
  DollarSign,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Building2,
  MapPin,
  Home,
  Search,
  Phone,
  ExternalLink,
  HeartHandshake,
  Compass,
  Map as MapIcon,
  Filter,
  AlertTriangle,
  Layers,
  ChevronRight,
  Info,
  Calendar,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet
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
import { PreviewSuratModal } from './PreviewSuratModal';
import { RealRtMap, MapFacilityItem } from './RealRtMap';
import { UserAvatar } from '@/shared/components/UserAvatar';
import { Pagination } from '@/shared/components/Pagination';

interface RtDashboardProps {
  activeSubmenu?: string;
  onNavigate?: (menu: string) => void;
}

export const RtDashboard: React.FC<RtDashboardProps> = ({ activeSubmenu = 'beranda', onNavigate }) => {
  const { user } = useAuth();
  const tabsSectionRef = useRef<HTMLDivElement>(null);
  const [surats, setSurats] = useState<SuratRequest[]>([]);
  const [wargas, setWargas] = useState<WargaProfile[]>([]);
  const [kartuKeluargas, setKartuKeluargas] = useState<any[]>([]);
  const [kasData, setKasData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'antrean' | 'warga' | 'kas' | 'konfirmasi_warga'>(() => {
    const saved = localStorage.getItem('sides_rt_active_tab');
    if (saved === 'warga' || saved === 'kas' || saved === 'antrean' || saved === 'konfirmasi_warga') return saved as any;
    return 'antrean';
  });

  const [verifyWargaAlert, setVerifyWargaAlert] = useState<string | null>(null);
  const [pendingWargas, setPendingWargas] = useState([
    {
      id: 901,
      nama: 'Hendra Setiawan',
      nik: '3506041209950003',
      no_kk: '3506041102120005',
      alamat: 'Jl. Melati No. 4 RT 01 / RW 01 Dusun Krajan',
      no_hp_wa: '081234567891',
      pekerjaan: 'Karyawan Swasta',
      tanggal_daftar: '17 Okt 2026',
      status: 'Menunggu Verifikasi RT',
    },
    {
      id: 902,
      nama: 'Dewi Lestari',
      nik: '3506045508980002',
      no_kk: '3506041102120008',
      alamat: 'Jl. Mawar No. 14 RT 01 Dusun Krajan',
      no_hp_wa: '085790123456',
      pekerjaan: 'Wiraswasta',
      tanggal_daftar: '18 Okt 2026',
      status: 'Menunggu Verifikasi RT',
    }
  ]);

  const handleSetActiveTab = (tab: 'antrean' | 'warga' | 'kas' | 'konfirmasi_warga') => {
    setActiveTab(tab);
    localStorage.setItem('sides_rt_active_tab', tab);
    setTimeout(() => {
      tabsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Action modals & states
  const [selectedSurat, setSelectedSurat] = useState<SuratRequest | null>(null);
  const [confirmingApproveSurat, setConfirmingApproveSurat] = useState<SuratRequest | null>(null);
  const [previewSurat, setPreviewSurat] = useState<SuratRequest | null>(null);
  const [actionCatatan, setActionCatatan] = useState('');
  const [approveCatatan, setApproveCatatan] = useState('Data warga valid dan terdaftar resmi di RT 01.');
  const [isProcessing, setIsProcessing] = useState(false);

  // Detail modals for Warga & KK & Peta
  const [selectedWargaDetail, setSelectedWargaDetail] = useState<WargaProfile | null>(null);
  const [selectedKkDetail, setSelectedKkDetail] = useState<any | null>(null);
  const [selectedPetaPin, setSelectedPetaPin] = useState<any | null>(null);

  // Search & Filters
  const [wargaSearch, setWargaSearch] = useState('');
  const [wargaGenderFilter, setWargaGenderFilter] = useState<'all' | 'L' | 'P'>('all');
  const [wargaEkonomiFilter, setWargaEkonomiFilter] = useState<string>('all');
  const [kkSearch, setKkSearch] = useState('');
  const [kkBansosFilter, setKkBansosFilter] = useState<string>('all');
  const [wargaViewMode, setWargaViewMode] = useState<'per_kk' | 'semua_warga'>('per_kk');
  const [rtHistoryFilter, setRtHistoryFilter] = useState<'semua' | 'disetujui' | 'ditolak'>('semua');

  // Pagination States (8 data per halaman)
  const [suratPage, setSuratPage] = useState(1);
  const [completedSuratPage, setCompletedSuratPage] = useState(1);
  const [wargaPage, setWargaPage] = useState(1);
  const [kkPage, setKkPage] = useState(1);
  const [kasPage, setKasPage] = useState(1);
  const RT_PAGE_SIZE = 8;

  useEffect(() => {
    setWargaPage(1);
  }, [wargaSearch, wargaGenderFilter, wargaEkonomiFilter]);

  useEffect(() => {
    setKkPage(1);
  }, [kkSearch, kkBansosFilter]);

  useEffect(() => {
    setCompletedSuratPage(1);
  }, [rtHistoryFilter]);

  // Unified Status Badge Renderer with complete status mapping
  const renderStatusBadge = (s: SuratRequest) => {
    switch (s.status) {
      case 'pending_rt':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap bg-amber-100 text-amber-900 border border-amber-200">
            Perlu ACC RT 01
          </span>
        );
      case 'approved_rt':
      case 'processed_sekdes':
      case 'pending_kades':
      case 'approved_rw':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap bg-indigo-100 text-indigo-900 border border-indigo-200">
            Diteruskan ke Desa
          </span>
        );
      case 'pending_rw':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap bg-blue-100 text-blue-900 border border-blue-200">
            Diteruskan ke RW
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap bg-emerald-100 text-emerald-900 border border-emerald-200">
            Selesai & Sah
          </span>
        );
      case 'rejected':
      case 'rejected_rt':
      case 'rejected_kades':
        return (
          <div className="space-y-0.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap bg-rose-100 text-rose-900 border border-rose-200">
              Ditolak
            </span>
            {(s.catatan_penolakan || (s as any).catatan_penolakan_kades) && (
              <div className="text-[10px] text-rose-600 font-semibold max-w-[130px] truncate" title={s.catatan_penolakan || (s as any).catatan_penolakan_kades}>
                {s.catatan_penolakan || (s as any).catatan_penolakan_kades}
              </div>
            )}
          </div>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap bg-slate-100 text-slate-800 border border-slate-200">
            {s.status}
          </span>
        );
    }
  };

  // New Kas Transaction State
  const [showKasModal, setShowKasModal] = useState(false);
  const [kasTipe, setKasTipe] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [kasTanggal, setKasTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [kasJumlah, setKasJumlah] = useState<number | ''>('');
  const [kasKeterangan, setKasKeterangan] = useState('');
  const [kasCategoryId, setKasCategoryId] = useState<number | ''>('');
  const [kasWargaId, setKasWargaId] = useState<number | ''>('');
  const [isSubmittingKas, setIsSubmittingKas] = useState(false);

  // Lock body scroll and handle ESC key when any modal is open
  useEffect(() => {
    if (selectedSurat || showKasModal || previewSurat || selectedWargaDetail || selectedKkDetail) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedSurat(null);
          setPreviewSurat(null);
          setShowKasModal(false);
          setSelectedWargaDetail(null);
          setSelectedKkDetail(null);
          setActionCatatan('');
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedSurat, showKasModal, previewSurat, selectedWargaDetail, selectedKkDetail]);

  useEffect(() => {
    if (['data_warga', 'data_keluarga', 'peta_wilayah'].includes(activeSubmenu)) {
      handleSetActiveTab('warga');
    } else if (activeSubmenu === 'kas_rt') {
      handleSetActiveTab('kas');
    } else if (['persetujuan_surat', 'riwayat_surat'].includes(activeSubmenu)) {
      handleSetActiveTab('antrean');
    }
  }, [activeSubmenu]);

  useEffect(() => {
    fetchRtData();
  }, []);

  const fetchRtData = async () => {
    try {
      const [suratRes, wargaRes, kasRes, kkRes] = await Promise.all([
        api.get('/surats'),
        api.get('/warga'),
        api.get('/kas-rt'),
        api.get('/warga/kartu-keluarga').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (suratRes.data.success) setSurats(suratRes.data.data);
      if (wargaRes.data.success) {
        const rawWargas = Array.isArray(wargaRes.data.data) ? wargaRes.data.data : [];
        const seen = new Set<string>();
        const uniqueWargas = rawWargas.filter((w: any) => {
          const key = w.id ? `id-${w.id}` : `nik-${w.nik}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setWargas(uniqueWargas);
      }
      if (kkRes?.data?.success && Array.isArray(kkRes.data.data)) {
        const rawKks = kkRes.data.data;
        const seenKks = new Set<string>();
        const uniqueKks = rawKks.filter((k: any) => {
          const key = k.no_kk ? `no-${k.no_kk}` : `id-${k.id}`;
          if (seenKks.has(key)) return false;
          seenKks.add(key);
          return true;
        });
        setKartuKeluargas(uniqueKks);
      }
      if (kasRes.data.success) {
        setKasData(kasRes.data);
        if (kasRes.data.categories && kasRes.data.categories.length > 0) {
          const firstCat = kasRes.data.categories.find((c: any) => c.tipe === kasTipe);
          if (firstCat) setKasCategoryId(firstCat.id);
        }
      }
    } catch {
      //
    }
  };

  // Group wargas into KK units based strictly on genuine backend data with zero duplicates
  const effectiveKkList = React.useMemo(() => {
    const map = new Map<string, any>();

    // 1. Seed with kartuKeluargas from backend API
    kartuKeluargas.forEach((kk) => {
      const rawMembers = kk.anggota_keluarga || kk.anggotaKeluarga || [];
      const kkNo = String(kk.no_kk || kk.id).trim();
      const memberMap = new Map<string, any>();
      rawMembers.forEach((m: any) => {
        const mKey = String(m.id || m.nik);
        memberMap.set(mKey, m);
      });

      map.set(kkNo, {
        ...kk,
        id: kk.id || kkNo,
        no_kk: kkNo,
        nama_kepala_keluarga: kk.nama_kepala_keluarga || 'Kepala Keluarga',
        alamat_lengkap: kk.alamat_lengkap || 'RT 01 / RW 01 Dusun Krajan, Desa Doko',
        no_telp_rumah: kk.no_telp_rumah || '-',
        status_ekonomi: kk.status_ekonomi || 'Keluarga Mandiri',
        memberMap,
      });
    });

    // 2. Map and associate wargas into their respective KK without duplicating
    wargas.forEach((w) => {
      let matchedKkNo: string | null = null;
      if (w.kartu_keluarga?.no_kk && map.has(String(w.kartu_keluarga.no_kk).trim())) {
        matchedKkNo = String(w.kartu_keluarga.no_kk).trim();
      } else if (w.kk_id) {
        for (const [no, kkItem] of map.entries()) {
          if (String(kkItem.id) === String(w.kk_id)) {
            matchedKkNo = no;
            break;
          }
        }
      }

      const mKey = String(w.id || w.nik);
      if (matchedKkNo) {
        const item = map.get(matchedKkNo);
        item.memberMap.set(mKey, w);
        if (w.status_keluarga === 'Kepala Keluarga') {
          item.nama_kepala_keluarga = w.nama_lengkap;
        }
        if (w.status_ekonomi?.toLowerCase().includes('pkh')) {
          item.status_ekonomi = 'Penerima Bansos PKH';
        }
      } else {
        const autoKkNo = w.kartu_keluarga?.no_kk ? String(w.kartu_keluarga.no_kk).trim() : `KK-${w.nik}`;
        if (!map.has(autoKkNo)) {
          const memberMap = new Map<string, any>();
          memberMap.set(mKey, w);
          map.set(autoKkNo, {
            id: w.kk_id || autoKkNo,
            no_kk: autoKkNo,
            nama_kepala_keluarga: w.status_keluarga === 'Kepala Keluarga' ? w.nama_lengkap : (w.nama_lengkap || 'Kepala Keluarga'),
            alamat_lengkap: w.alamat || 'RT 01 / RW 01 Dusun Krajan',
            no_telp_rumah: w.no_hp_wa || '-',
            status_ekonomi: w.status_ekonomi?.toLowerCase().includes('pkh') ? 'Penerima Bansos PKH' : 'Keluarga Mandiri',
            memberMap,
          });
        } else {
          map.get(autoKkNo).memberMap.set(mKey, w);
        }
      }
    });

    return Array.from(map.values()).map((k) => {
      const members = Array.from(k.memberMap.values());
      return {
        ...k,
        anggotaKeluarga: members,
        anggota_keluarga: members,
      };
    });
  }, [kartuKeluargas, wargas]);

  const handleApproveRt = async (suratId: number, catatanParam?: string) => {
    setIsProcessing(true);
    try {
      const res = await api.post(`/surats/${suratId}/rt-action`, {
        action: 'approve',
        catatan: catatanParam || approveCatatan || 'Data warga valid dan terdaftar resmi di RT 01.',
      });
      if (res.data.success) {
        setConfirmingApproveSurat(null);
        setSelectedSurat(null);
        setPreviewSurat(null);
        setActionCatatan('');
        fetchRtData();
      }
    } catch (err: any) {
      alert('Gagal memproses persetujuan: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (suratId: number, catatanParam?: string) => {
    const catatan = catatanParam || actionCatatan;
    if (!catatan.trim()) {
      alert('Wajib mengisi alasan/catatan penolakan untuk warga pemohon.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await api.post(`/surats/${suratId}/rt-action`, {
        action: 'reject',
        catatan: catatan,
      });
      if (res.data.success) {
        setSelectedSurat(null);
        setPreviewSurat(null);
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
    if (isSubmittingKas) return; // Prevent double click / duplicate submission

    if (!kasJumlah || Number(kasJumlah) <= 0) {
      alert('Nominal transaksi kas harus valid dan lebih dari 0.');
      return;
    }
    if (!kasKeterangan.trim()) {
      alert('Keterangan transaksi kas wajib diisi.');
      return;
    }

    const idempotencyKey = `kas_rt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      setIsSubmittingKas(true);
      const res = await api.post('/kas-rt/transaction', {
        tipe: kasTipe,
        jumlah: Number(kasJumlah),
        keterangan: kasKeterangan,
        category_id: kasCategoryId || undefined,
        tanggal_transaksi: kasTanggal || new Date().toISOString().split('T')[0],
        warga_profile_id: kasWargaId || undefined,
      }, {
        headers: { 'X-Idempotency-Key': idempotencyKey }
      });
      if (res.data.success) {
        setShowKasModal(false);
        setKasJumlah('');
        setKasKeterangan('');
        setKasWargaId('');
        fetchRtData();
      }
    } catch (err: any) {
      alert('Gagal mencatat kas: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setIsSubmittingKas(false);
    }
  };

  const renderPreviewSuratModal = () => {
    if (!previewSurat) return null;
    return (
      <PreviewSuratModal
        surat={previewSurat}
        role="rt"
        onClose={() => setPreviewSurat(null)}
        onApprove={(id) => {
          setConfirmingApproveSurat(previewSurat);
          setApproveCatatan('Data warga valid dan terdaftar resmi di RT 01.');
        }}
        onReject={(id, catatan) => handleReject(id, catatan)}
        isProcessing={isProcessing}
      />
    );
  };

  const renderKasModal = () => {
    if (!showKasModal) return null;
    const filteredCategories = (kasData?.categories || []).filter(
      (c: any) => c.tipe === kasTipe
    );

    return createPortal(
      <div 
        className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 font-sans overflow-y-auto animate-fade-in select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowKasModal(false);
        }}
      >
        <div 
          className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl modal-content my-auto max-h-[90vh] overflow-y-auto border border-slate-100 animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md tracking-wider">
                Pembukuan Kas RT 01
              </span>
              <h3 className="font-black text-xl text-gray-900 mt-1">Catat Transaksi Kas</h3>
            </div>
            <button 
              type="button"
              onClick={() => setShowKasModal(false)} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full cursor-pointer"
              title="Tutup (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddKas} className="space-y-4 text-xs font-sans">
            {/* Tipe Selector */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setKasTipe('Pemasukan');
                  const firstCat = (kasData?.categories || []).find((c: any) => c.tipe === 'Pemasukan');
                  if (firstCat) setKasCategoryId(firstCat.id);
                }}
                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all press-down shadow-xs cursor-pointer ${
                  kasTipe === 'Pemasukan' 
                    ? 'bg-emerald-600 text-white shadow-emerald-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                + Pemasukan Kas
              </button>
              <button
                type="button"
                onClick={() => {
                  setKasTipe('Pengeluaran');
                  const firstCat = (kasData?.categories || []).find((c: any) => c.tipe === 'Pengeluaran');
                  if (firstCat) setKasCategoryId(firstCat.id);
                }}
                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all press-down shadow-xs cursor-pointer ${
                  kasTipe === 'Pengeluaran' 
                    ? 'bg-rose-600 text-white shadow-rose-200' 
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                - Pengeluaran Kas
              </button>
            </div>

            {/* Tanggal Transaksi */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Tanggal Transaksi *</label>
              <input
                type="date"
                required
                value={kasTanggal}
                onChange={(e) => setKasTanggal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              />
            </div>

            {/* Kategori Kas */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Kategori {kasTipe} *</label>
              <select
                value={kasCategoryId}
                onChange={(e) => setKasCategoryId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none font-medium"
              >
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.nama_kategori}
                    </option>
                  ))
                ) : (
                  <option value="">
                    {kasTipe === 'Pemasukan' ? 'Iuran Sampah & Kas Warga' : 'Operasional & Perawatan Fasilitas'}
                  </option>
                )}
              </select>
            </div>

            {/* Nominal (Rp) */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Nominal Transaksi (Rp) *</label>
              <input
                type="number"
                min="100"
                required
                placeholder="Contoh: 50000"
                value={kasJumlah}
                onChange={(e) => setKasJumlah(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none font-mono font-bold"
              />
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Keterangan / Uraian *</label>
              <input
                type="text"
                required
                placeholder={
                  kasTipe === 'Pemasukan'
                    ? 'Contoh: Iuran kebersihan bulan September - KK Bambang'
                    : 'Contoh: Pembelian lampu penerangan jalan gang 2'
                }
                value={kasKeterangan}
                onChange={(e) => setKasKeterangan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              />
            </div>

            {/* Warga Pemohon / Penyetor (Opsional jika Pemasukan) */}
            {kasTipe === 'Pemasukan' && wargas.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Warga Penyetor Iuran (Opsional)</label>
                <select
                  value={kasWargaId}
                  onChange={(e) => setKasWargaId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none font-medium"
                >
                  <option value="">-- Pilih Warga RT 01 (Bisa Dikosongkan) --</option>
                  {wargas.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nama_lengkap} (NIK: {w.nik})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowKasModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmittingKas}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md press-down hover-glow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingKas ? 'Menyimpan...' : 'Simpan Transaksi Kas'}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const pendingSurats = surats.filter((s) => s.status === 'pending_rt');
  const allHistorySurats = surats.filter((s) => s.status !== 'pending_rt');
  const filteredHistorySurats = allHistorySurats.filter((s) => {
    const isRejected = ['rejected', 'rejected_rt', 'rejected_kades'].includes(s.status);
    if (rtHistoryFilter === 'disetujui') return !isRejected;
    if (rtHistoryFilter === 'ditolak') return isRejected;
    return true;
  });
  const completedSurats = surats.filter((s) => s.status === 'completed');
  const paginatedSurats = pendingSurats.slice((suratPage - 1) * RT_PAGE_SIZE, suratPage * RT_PAGE_SIZE);
  const paginatedCompletedSurats = filteredHistorySurats.slice((completedSuratPage - 1) * RT_PAGE_SIZE, completedSuratPage * RT_PAGE_SIZE);

  // Persetujuan & Verifikasi Surat RT 01
  if (activeSubmenu === 'persetujuan_surat') {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Persetujuan Surat RT
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Verifikasi dan berikan persetujuan RT untuk permohonan warga.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-200">
              {pendingSurats.length} Menunggu persetujuan
            </span>
          </div>
        </div>

        <div className="card-surface p-4 sm:p-6 space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs min-w-[720px] sm:min-w-0">
              <thead className="bg-gray-50/90 text-gray-600 border-b border-gray-200 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 sm:px-4">No. Resi</th>
                  <th className="py-3 px-3 sm:px-4">Nama Pemohon & NIK</th>
                  <th className="py-3 px-3 sm:px-4">Jenis Surat</th>
                  <th className="py-3 px-3 sm:px-4">Keperluan</th>
                  <th className="py-3 px-3 sm:px-4">Status Terkini</th>
                  <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap sticky right-0 bg-gray-50 z-10 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {pendingSurats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      Belum ada permohonan surat masuk.
                    </td>
                  </tr>
                ) : (
                  paginatedSurats.map((s, idx) => (
                    <tr key={s.id} className="group hover:bg-emerald-50 transition-colors">
                      <td className="py-3 px-3 sm:px-4 font-mono font-bold text-xs text-gray-700 whitespace-nowrap">
                        {s.nomor_resi}
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm leading-tight">
                          {s.warga_profile?.nama_lengkap}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          NIK: {s.warga_profile?.nik}
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-bold text-emerald-800 text-xs leading-snug max-w-[160px] line-clamp-2">
                          {s.surat_type?.nama_surat}
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-gray-600 text-xs max-w-[140px] truncate" title={s.keperluan}>
                        {s.keperluan}
                      </td>
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        {renderStatusBadge(s)}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-emerald-50 z-10 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] transition-colors">
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

                          {s.status === 'pending_rt' ? (
                            <>
                              <button
                                onClick={() => {
                                  setConfirmingApproveSurat(s);
                                  setApproveCatatan('Data warga valid dan terdaftar resmi di RT 01.');
                                }}
                                disabled={isProcessing}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs press-down flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                title="Setujui permohonan surat"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Setujui</span>
                              </button>
                              <button
                                onClick={() => setSelectedSurat(s)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors press-down border border-rose-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                title="Tolak permohonan surat"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </>
                          ) : s.status === 'rejected' ? (
                            <span className="inline-flex items-center gap-1 text-rose-700 text-xs font-bold bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80 shadow-2xs whitespace-nowrap">
                              Ditolak
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-800 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80 shadow-2xs whitespace-nowrap">
                              {s.status === 'completed' ? 'Selesai' : 'Disetujui RT'}
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

          {/* Mobile Clean Card View - No Horizontal Scrolling Needed */}
          <div className="md:hidden space-y-3">
            {pendingSurats.length === 0 ? (
              <div className="p-8 text-center text-gray-400 bg-white border border-gray-200 rounded-2xl text-xs">
                Belum ada permohonan surat masuk.
              </div>
            ) : (
              paginatedSurats.map((s) => (
                <div 
                  key={s.id} 
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 animate-fade-in"
                >
                  {/* Top Bar: Resi & Status Terkini */}
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Resi:</span>
                      <span className="font-mono font-black text-xs text-slate-800 truncate">
                        {s.nomor_resi}
                      </span>
                    </div>
                    <div className="shrink-0">
                      {renderStatusBadge(s)}
                    </div>
                  </div>

                  {/* Citizen Info & Letter Type */}
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-slate-900 leading-tight truncate">
                          {s.warga_profile?.nama_lengkap}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500">
                          NIK: {s.warga_profile?.nik}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200 shrink-0">
                        {s.surat_type?.kode_surat || 'SURAT'}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-emerald-900">
                      {s.surat_type?.nama_surat}
                    </div>

                    {s.keperluan && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">
                          Keperluan:
                        </span>
                        <p className="line-clamp-2 leading-relaxed">{s.keperluan}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewSurat(s)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs press-down"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Detail</span>
                    </button>

                    {s.status === 'pending_rt' ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmingApproveSurat(s);
                            setApproveCatatan('Data warga valid dan terdaftar resmi di RT 01.');
                          }}
                          disabled={isProcessing}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-xs press-down flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSurat(s)}
                          className="py-2 px-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-extrabold text-xs transition-colors press-down border border-rose-200 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    ) : s.status === 'rejected' ? (
                      <span className="px-3 py-2 rounded-xl text-rose-700 text-xs font-bold bg-rose-50 border border-rose-200 text-center flex-1">
                        Ditolak
                      </span>
                    ) : (
                      <span className="px-3 py-2 rounded-xl text-emerald-800 text-xs font-bold bg-emerald-50 border border-emerald-200 text-center flex-1">
                        {s.status === 'completed' ? 'Selesai' : 'Disetujui RT'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination
            currentPage={suratPage}
            totalItems={pendingSurats.length}
            pageSize={RT_PAGE_SIZE}
            onPageChange={setSuratPage}
            itemLabel="permohonan surat"
          />
        </div>

        {/* Modal Konfirmasi Persetujuan Surat RT */}
        {confirmingApproveSurat && createPortal(
          <div 
            className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 font-sans overflow-y-auto animate-fade-in select-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setConfirmingApproveSurat(null);
              }
            }}
          >
            <div 
              className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl modal-content my-auto max-h-[90vh] overflow-y-auto border border-slate-100 animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-xl text-gray-900">Konfirmasi Persetujuan RT</h3>
                </div>
                <button 
                  onClick={() => setConfirmingApproveSurat(null)} 
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Applicant & Letter Summary */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Nama Pemohon:</span>
                  <span className="font-bold text-slate-900">{confirmingApproveSurat.warga_profile?.nama_lengkap || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">NIK Pemohon:</span>
                  <span className="font-mono font-bold text-slate-800">{confirmingApproveSurat.warga_profile?.nik || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Jenis Surat:</span>
                  <span className="font-bold text-emerald-900">{confirmingApproveSurat.surat_type?.nama_surat || (confirmingApproveSurat as any).jenis_surat || 'Surat Pengantar RT'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Tanggal Pengajuan:</span>
                  <span className="font-medium text-slate-700">{confirmingApproveSurat.created_at ? new Date(confirmingApproveSurat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                </div>
                {confirmingApproveSurat.keperluan && (
                  <div className="pt-1 border-t border-emerald-200/60">
                    <span className="text-slate-500 font-semibold block mb-0.5">Keperluan:</span>
                    <span className="text-slate-800 font-medium italic">"{confirmingApproveSurat.keperluan}"</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Catatan Validasi RT (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Catatan validasi domisili dan kelayakan warga..."
                  value={approveCatatan}
                  onChange={(e) => setApproveCatatan(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setConfirmingApproveSurat(null)} 
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  onClick={() => handleApproveRt(confirmingApproveSurat.id, approveCatatan)} 
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {isProcessing ? 'Memproses...' : 'Setujui'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Modal Reject Surat - Portaled, Auto-Centered, Highest Z-Index, No Blur */}
        {selectedSurat && createPortal(
          <div 
            className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 font-sans overflow-y-auto animate-fade-in select-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedSurat(null);
                setActionCatatan('');
              }
            }}
          >
            <div 
              className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl modal-content my-auto max-h-[90vh] overflow-y-auto border border-slate-100 animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-xl text-gray-900">Tolak Permohonan Surat</h3>
                </div>
                <button 
                  onClick={() => {
                    setSelectedSurat(null);
                    setActionCatatan('');
                  }} 
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                  title="Tutup (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Applicant & Letter Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Nama Pemohon:</span>
                  <span className="font-bold text-slate-900">{selectedSurat.warga_profile?.nama_lengkap || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">NIK Pemohon:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedSurat.warga_profile?.nik || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Jenis Surat:</span>
                  <span className="font-bold text-slate-900">{selectedSurat.surat_type?.nama_surat || (selectedSurat as any).jenis_surat || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Tanggal Pengajuan:</span>
                  <span className="font-medium text-slate-700">{selectedSurat.created_at ? new Date(selectedSurat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Alasan / Catatan Penolakan Wajib Diisi *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Berkas foto KTP buram, mohon upload ulang..."
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
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  onClick={() => handleReject(selectedSurat.id)} 
                  disabled={isProcessing || !actionCatatan.trim()}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {isProcessing ? 'Memproses...' : 'Tolak'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* Preview & Berkas Modal */}
        {renderPreviewSuratModal()}
      </div>
    );
  }

  // Riwayat Seluruh Pengajuan Surat RT 01
  if (activeSubmenu === 'riwayat_surat') {
    const approvedCount = allHistorySurats.filter(s => !['rejected', 'rejected_rt', 'rejected_kades'].includes(s.status)).length;
    const rejectedCount = allHistorySurats.filter(s => ['rejected', 'rejected_rt', 'rejected_kades'].includes(s.status)).length;

    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Riwayat Seluruh Pengajuan Surat
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Arsip berkas permohonan warga yang telah disetujui RT, diteruskan ke Kantor Desa, maupun yang ditolak.
            </p>
          </div>

          {/* Filter Status Riwayat */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => { setRtHistoryFilter('semua'); setCompletedSuratPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rtHistoryFilter === 'semua'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({allHistorySurats.length})
            </button>
            <button
              type="button"
              onClick={() => { setRtHistoryFilter('disetujui'); setCompletedSuratPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rtHistoryFilter === 'disetujui'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Disetujui ({approvedCount})
            </button>
            <button
              type="button"
              onClick={() => { setRtHistoryFilter('ditolak'); setCompletedSuratPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rtHistoryFilter === 'ditolak'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ditolak ({rejectedCount})
            </button>
          </div>
        </div>

        <div className="card-surface p-4 sm:p-6 space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs min-w-[720px] sm:min-w-0">
              <thead className="bg-gray-50/90 text-gray-600 border-b border-gray-200 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 sm:px-4">No. Resi & No. Resmi</th>
                  <th className="py-3 px-3 sm:px-4">Pemohon & NIK</th>
                  <th className="py-3 px-3 sm:px-4">Jenis Surat</th>
                  <th className="py-3 px-3 sm:px-4">Keperluan</th>
                  <th className="py-3 px-3 sm:px-4">Status Terkini</th>
                  <th className="py-3 px-3 sm:px-4 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredHistorySurats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      Tidak ada data surat dalam riwayat kategori ini.
                    </td>
                  </tr>
                ) : (
                  paginatedCompletedSurats.map((s) => (
                    <tr key={s.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 sm:px-4 font-mono">
                        <div className="font-bold text-slate-900 text-xs">{s.nomor_surat_resmi || s.nomor_resi}</div>
                        <div className="text-[11px] text-slate-400">Resi: {s.nomor_resi}</div>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">{s.warga_profile?.nama_lengkap}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">NIK: {s.warga_profile?.nik}</div>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-bold text-emerald-800 text-xs leading-snug max-w-[160px] line-clamp-2">{s.surat_type?.nama_surat}</div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-slate-600 text-xs max-w-[140px] truncate" title={s.keperluan}>{s.keperluan}</td>
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        {renderStatusBadge(s)}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setPreviewSurat(s)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs press-down"
                          title="Lihat Detail & Foto Berkas Lampiran"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Clean Card View */}
          <div className="md:hidden space-y-3">
            {filteredHistorySurats.length === 0 ? (
              <div className="p-8 text-center text-gray-400 bg-white border border-gray-200 rounded-2xl text-xs">
                Tidak ada data surat dalam riwayat kategori ini.
              </div>
            ) : (
              paginatedCompletedSurats.map((s) => {
                const isRejected = ['rejected', 'rejected_rt', 'rejected_kades'].includes(s.status);
                const rejectionReason = s.catatan_penolakan || (s as any).catatan_penolakan_kades;

                return (
                  <div 
                    key={s.id} 
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 animate-fade-in"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">No. Resmi / Resi:</span>
                        <span className="font-mono font-black text-xs text-slate-900 truncate block">
                          {s.nomor_surat_resmi || s.nomor_resi}
                        </span>
                      </div>
                      <div className="shrink-0">
                        {renderStatusBadge(s)}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div>
                        <h4 className="font-black text-sm text-slate-900 leading-tight">
                          {s.warga_profile?.nama_lengkap}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500">
                          NIK: {s.warga_profile?.nik}
                        </span>
                      </div>

                      <div className="font-bold text-xs text-emerald-900">
                        {s.surat_type?.nama_surat}
                      </div>

                      {s.keperluan && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">
                            Keperluan:
                          </span>
                          <p className="line-clamp-2 leading-relaxed">{s.keperluan}</p>
                        </div>
                      )}

                      {isRejected && rejectionReason && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                          <span className="text-[10px] font-black uppercase text-rose-600 block mb-0.5">
                            Alasan Penolakan:
                          </span>
                          <p className="line-clamp-2 leading-relaxed">{rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => setPreviewSurat(s)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs press-down"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Lihat Detail & Berkas</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Pagination
            currentPage={completedSuratPage}
            totalItems={filteredHistorySurats.length}
            pageSize={RT_PAGE_SIZE}
            onPageChange={setCompletedSuratPage}
            itemLabel="surat"
          />
        </div>

        {/* Preview & Berkas Modal */}
        {renderPreviewSuratModal()}
      </div>
    );
  }

  const renderKkDetailModal = () => {
    if (!selectedKkDetail) return null;
    const currentMembers = selectedKkDetail.anggotaKeluarga || selectedKkDetail.anggota_keluarga || [];
    return createPortal(
      <div
        className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/75 animate-fade-in font-sans"
        onClick={() => setSelectedKkDetail(null)}
      >
        <div
          className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-900 leading-tight">
                  Keluarga: {selectedKkDetail.nama_kepala_keluarga}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  No. KK: {selectedKkDetail.no_kk}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedKkDetail(null)}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase">Alamat Hunian:</span>
              <span className="font-bold text-slate-800">{selectedKkDetail.alamat_lengkap}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-teal-100 text-teal-800">
              {currentMembers.length} Anggota Jiwa
            </span>
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2.5">
              Daftar Anggota Dalam Kartu Keluarga (KK)
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Nama Anggota & NIK</th>
                    <th className="p-3">Hubungan</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Pekerjaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentMembers.length > 0 ? (
                    currentMembers.map((m: any, mIdx: number) => (
                      <tr key={m.id || mIdx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{m.nama_lengkap}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">NIK: {m.nik || '-'}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            m.status_keluarga === 'Kepala Keluarga'
                              ? 'bg-blue-100 text-blue-800'
                              : m.status_keluarga === 'Istri'
                              ? 'bg-purple-100 text-purple-800'
                              : m.status_keluarga === 'Anak'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {m.status_keluarga || 'Anggota'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">
                          {m.jenis_kelamin === 'L' ? 'Laki-laki' : m.jenis_kelamin === 'P' ? 'Perempuan' : (m.jenis_kelamin || '-')}
                        </td>
                        <td className="p-3 text-slate-600">
                          {m.pekerjaan || 'Wiraswasta / Belum Bekerja'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400">
                        Belum ada data anggota keluarga terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // 1. DATA WARGA RT 01 (Buku Induk Kependudukan Warga RT 01)
  if (activeSubmenu === 'data_warga') {
    const filteredWargas = wargas.filter((w) => {
      const matchSearch = !wargaSearch || 
        w.nama_lengkap.toLowerCase().includes(wargaSearch.toLowerCase()) || 
        w.nik.includes(wargaSearch) || 
        (w.kartu_keluarga?.no_kk && w.kartu_keluarga.no_kk.includes(wargaSearch));
      const matchGender = wargaGenderFilter === 'all' || w.jenis_kelamin === wargaGenderFilter;
      const matchEkonomi = wargaEkonomiFilter === 'all' || 
        (wargaEkonomiFilter === 'PKH' && w.status_ekonomi?.toLowerCase().includes('pkh')) ||
        (wargaEkonomiFilter === 'Rentan' && w.status_ekonomi?.toLowerCase().includes('rentan')) ||
        (wargaEkonomiFilter === 'Mampu' && !w.status_ekonomi?.toLowerCase().includes('pkh') && !w.status_ekonomi?.toLowerCase().includes('rentan'));
      return matchSearch && matchGender && matchEkonomi;
    });

    const paginatedWargas = filteredWargas.slice((wargaPage - 1) * RT_PAGE_SIZE, wargaPage * RT_PAGE_SIZE);

    const totalLaki = wargas.filter((w) => w.jenis_kelamin === 'L').length;
    const totalPerempuan = wargas.filter((w) => w.jenis_kelamin === 'P').length;
    const totalBansos = wargas.filter((w) => w.status_ekonomi?.toLowerCase().includes('pkh') || w.status_ekonomi?.toLowerCase().includes('rentan')).length;
    const totalKepalaKeluarga = wargas.filter((w) => w.status_keluarga === 'Kepala Keluarga').length;

    return (
      <div className="space-y-6 animate-fade-in font-sans">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Kependudukan RT 01
              </span>
              <span className="text-xs text-slate-400 font-bold">• RW 01 Dusun Krajan</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Buku Induk Kependudukan & Data Warga RT 01
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Database personal seluruh warga yang berdomisili di RT 01: NIK, status keluarga, kontak WhatsApp aktif, dan klasifikasi ekonomi.
            </p>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Total Warga RT 01</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{wargas.length}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Jiwa terdaftar aktif</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Komposisi Gender</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {totalLaki} <span className="text-sm font-bold text-slate-400">L</span> / {totalPerempuan} <span className="text-sm font-bold text-slate-400">P</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">{totalLaki} Laki-laki, {totalPerempuan} Perempuan</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Kepala Keluarga</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalKepalaKeluarga}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Kepala Rumah Tangga</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Penerima Bantuan</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <HeartHandshake className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-800 mt-2">{totalBansos}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Keluarga PKH & Rentan</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={wargaSearch}
              onChange={(e) => setWargaSearch(e.target.value)}
              placeholder="Cari Nama Lengkap, NIK, atau No KK..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Gender:</span>
              <select
                value={wargaGenderFilter}
                onChange={(e) => setWargaGenderFilter(e.target.value as any)}
                className="bg-transparent font-bold outline-none cursor-pointer"
              >
                <option value="all">Semua</option>
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
              <span>Ekonomi:</span>
              <select
                value={wargaEkonomiFilter}
                onChange={(e) => setWargaEkonomiFilter(e.target.value)}
                className="bg-transparent font-bold outline-none cursor-pointer"
              >
                <option value="all">Semua</option>
                <option value="PKH">Penerima PKH</option>
                <option value="Rentan">Rentan</option>
                <option value="Mampu">Mampu / Mandiri</option>
              </select>
            </div>
          </div>
        </div>

        {/* Toggle Mode Tampilan: Per-KK (Default) vs Seluruh Jiwa */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => { setWargaViewMode('per_kk'); setWargaPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                wargaViewMode === 'per_kk'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Data per Kartu Keluarga (Rapi)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${wargaViewMode === 'per_kk' ? 'bg-emerald-800 text-emerald-100' : 'bg-white text-slate-600 border border-slate-200'}`}>
                {effectiveKkList.length} KK
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setWargaViewMode('semua_warga'); setWargaPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                wargaViewMode === 'semua_warga'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Buku Induk Lengkap (Per Jiwa)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${wargaViewMode === 'semua_warga' ? 'bg-emerald-800 text-emerald-100' : 'bg-white text-slate-600 border border-slate-200'}`}>
                {wargas.length} Jiwa
              </span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {wargaViewMode === 'per_kk' 
              ? `Menampilkan Kartu Keluarga terdaftar di RT 01`
              : `Menampilkan ${filteredWargas.length} dari ${wargas.length} Jiwa Warga`}
          </span>
        </div>

        {/* Tabel Data: Mode Per-KK atau Mode Per-Jiwa */}
        {wargaViewMode === 'per_kk' ? (
          <div className="card-surface p-4 sm:p-6 space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
              <table className="w-full text-left text-xs min-w-[760px] sm:min-w-0">
                <thead className="bg-gray-50/90 text-gray-600 border-b border-gray-200 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3 sm:px-4">Nomor KK</th>
                    <th className="py-3 px-3 sm:px-4">Kepala Keluarga Aktif</th>
                    <th className="py-3 px-3 sm:px-4">Alamat Rumah di RT 01</th>
                    <th className="py-3 px-3 sm:px-4">Jumlah Jiwa</th>
                    <th className="py-3 px-3 sm:px-4">Klasifikasi Ekonomi</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Rincian Keluarga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {effectiveKkList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        Belum ada data Kartu Keluarga terdaftar di RT 01.
                      </td>
                    </tr>
                  ) : (
                    effectiveKkList
                      .filter((kk) => {
                        const matchSearch = !wargaSearch ||
                          kk.nama_kepala_keluarga?.toLowerCase().includes(wargaSearch.toLowerCase()) ||
                          kk.no_kk?.includes(wargaSearch) ||
                          (kk.alamat_lengkap && kk.alamat_lengkap.toLowerCase().includes(wargaSearch.toLowerCase())) ||
                          (kk.anggotaKeluarga && kk.anggotaKeluarga.some((m: any) => m.nama_lengkap.toLowerCase().includes(wargaSearch.toLowerCase()) || m.nik?.includes(wargaSearch)));
                        const matchEkonomi = wargaEkonomiFilter === 'all' ||
                          (wargaEkonomiFilter === 'PKH' && kk.status_ekonomi?.toLowerCase().includes('pkh')) ||
                          (wargaEkonomiFilter === 'Rentan' && kk.status_ekonomi?.toLowerCase().includes('rentan')) ||
                          (wargaEkonomiFilter === 'Mampu' && !kk.status_ekonomi?.toLowerCase().includes('pkh') && !kk.status_ekonomi?.toLowerCase().includes('rentan'));
                        return matchSearch && matchEkonomi;
                      })
                      .slice((wargaPage - 1) * RT_PAGE_SIZE, wargaPage * RT_PAGE_SIZE)
                      .map((kk, idx) => (
                        <tr key={kk.id || idx} className="hover:bg-emerald-50/70 transition-colors">
                          <td className="py-3 px-3 sm:px-4 font-mono font-bold text-slate-900">
                            <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl text-slate-800 border border-slate-200">
                              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>{kk.no_kk}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <div className="font-bold text-slate-900 text-xs sm:text-sm">{kk.nama_kepala_keluarga}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Kepala Keluarga Aktif</div>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-slate-600 max-w-[200px] truncate" title={kk.alamat_lengkap}>
                            <div className="flex items-center gap-1">
                              <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{kk.alamat_lengkap || 'RT 01 / RW 01 Dusun Krajan'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Users className="w-3 h-3" />
                              <span>{(kk.anggotaKeluarga || []).length} Jiwa</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              kk.status_ekonomi?.toLowerCase().includes('pkh')
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {kk.status_ekonomi?.toLowerCase().includes('pkh') ? 'Penerima Bansos PKH' : 'Keluarga Mandiri'}
                            </span>
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedKkDetail(kk)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 ml-auto cursor-pointer shadow-xs press-down"
                              title="Lihat Rincian Anggota Keluarga"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>Anggota ({(kk.anggotaKeluarga || []).length})</span>
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Clean Card List Mode Per-KK */}
            <div className="md:hidden space-y-3">
              {effectiveKkList.filter((kk) => {
                const matchSearch = !wargaSearch ||
                  kk.nama_kepala_keluarga?.toLowerCase().includes(wargaSearch.toLowerCase()) ||
                  kk.no_kk?.includes(wargaSearch) ||
                  (kk.alamat_lengkap && kk.alamat_lengkap.toLowerCase().includes(wargaSearch.toLowerCase())) ||
                  (kk.anggotaKeluarga && kk.anggotaKeluarga.some((m: any) => m.nama_lengkap.toLowerCase().includes(wargaSearch.toLowerCase()) || m.nik?.includes(wargaSearch)));
                const matchEkonomi = wargaEkonomiFilter === 'all' ||
                  (wargaEkonomiFilter === 'PKH' && kk.status_ekonomi?.toLowerCase().includes('pkh')) ||
                  (wargaEkonomiFilter === 'Rentan' && kk.status_ekonomi?.toLowerCase().includes('rentan')) ||
                  (wargaEkonomiFilter === 'Mampu' && !kk.status_ekonomi?.toLowerCase().includes('pkh') && !kk.status_ekonomi?.toLowerCase().includes('rentan'));
                return matchSearch && matchEkonomi;
              }).length === 0 ? (
                <div className="p-8 text-center text-gray-400 bg-white border border-gray-200 rounded-2xl text-xs">
                  Belum ada data Kartu Keluarga yang sesuai dengan filter.
                </div>
              ) : (
                effectiveKkList
                  .filter((kk) => {
                    const matchSearch = !wargaSearch ||
                      kk.nama_kepala_keluarga?.toLowerCase().includes(wargaSearch.toLowerCase()) ||
                      kk.no_kk?.includes(wargaSearch) ||
                      (kk.alamat_lengkap && kk.alamat_lengkap.toLowerCase().includes(wargaSearch.toLowerCase())) ||
                      (kk.anggotaKeluarga && kk.anggotaKeluarga.some((m: any) => m.nama_lengkap.toLowerCase().includes(wargaSearch.toLowerCase()) || m.nik?.includes(wargaSearch)));
                    const matchEkonomi = wargaEkonomiFilter === 'all' ||
                      (wargaEkonomiFilter === 'PKH' && kk.status_ekonomi?.toLowerCase().includes('pkh')) ||
                      (wargaEkonomiFilter === 'Rentan' && kk.status_ekonomi?.toLowerCase().includes('rentan')) ||
                      (wargaEkonomiFilter === 'Mampu' && !kk.status_ekonomi?.toLowerCase().includes('pkh') && !kk.status_ekonomi?.toLowerCase().includes('rentan'));
                    return matchSearch && matchEkonomi;
                  })
                  .slice((wargaPage - 1) * RT_PAGE_SIZE, wargaPage * RT_PAGE_SIZE)
                  .map((kk, idx) => {
                    const memberCount = (kk.anggotaKeluarga || []).length;
                    const isPkh = kk.status_ekonomi?.toLowerCase().includes('pkh');

                    return (
                      <div
                        key={kk.id || idx}
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 animate-fade-in"
                      >
                        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span className="font-mono font-black text-xs text-slate-800 truncate">
                              {kk.no_kk}
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                            isPkh
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {isPkh ? 'Bansos PKH' : 'Mandiri'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                Kepala Keluarga:
                              </span>
                              <h4 className="font-black text-sm text-slate-900 leading-tight">
                                {kk.nama_kepala_keluarga}
                              </h4>
                            </div>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                              <Users className="w-3 h-3" />
                              <span>{memberCount} Jiwa</span>
                            </span>
                          </div>

                          <div className="pt-1 flex items-start gap-1.5 text-xs text-slate-600">
                            <Home className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <p className="line-clamp-2 leading-relaxed">{kk.alamat_lengkap || 'RT 01 / RW 01 Dusun Krajan'}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setSelectedKkDetail(kk)}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs press-down"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Lihat Rincian Anggota ({memberCount} Jiwa)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <Pagination
              currentPage={wargaPage}
              totalItems={effectiveKkList.filter((kk) => {
                const matchSearch = !wargaSearch ||
                  kk.nama_kepala_keluarga?.toLowerCase().includes(wargaSearch.toLowerCase()) ||
                  kk.no_kk?.includes(wargaSearch) ||
                  (kk.alamat_lengkap && kk.alamat_lengkap.toLowerCase().includes(wargaSearch.toLowerCase())) ||
                  (kk.anggotaKeluarga && kk.anggotaKeluarga.some((m: any) => m.nama_lengkap.toLowerCase().includes(wargaSearch.toLowerCase()) || m.nik?.includes(wargaSearch)));
                const matchEkonomi = wargaEkonomiFilter === 'all' ||
                  (wargaEkonomiFilter === 'PKH' && kk.status_ekonomi?.toLowerCase().includes('pkh')) ||
                  (wargaEkonomiFilter === 'Rentan' && kk.status_ekonomi?.toLowerCase().includes('rentan')) ||
                  (wargaEkonomiFilter === 'Mampu' && !kk.status_ekonomi?.toLowerCase().includes('pkh') && !kk.status_ekonomi?.toLowerCase().includes('rentan'));
                return matchSearch && matchEkonomi;
              }).length}
              pageSize={RT_PAGE_SIZE}
              onPageChange={setWargaPage}
              itemLabel="kartu keluarga"
            />
          </div>
        ) : (
          <div className="card-surface p-4 sm:p-6 space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
              <table className="w-full text-left text-xs min-w-[760px] sm:min-w-0">
                <thead className="bg-gray-50/90 text-gray-600 border-b border-gray-200 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3 sm:px-4">Warga & NIK</th>
                    <th className="py-3 px-3 sm:px-4">No. KK & Hubungan</th>
                    <th className="py-3 px-3 sm:px-4">WhatsApp</th>
                    <th className="py-3 px-3 sm:px-4">L/P & Tempat Lahir</th>
                    <th className="py-3 px-3 sm:px-4">Status Ekonomi</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredWargas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        Tidak ada data warga yang cocok dengan pencarian atau filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedWargas.map((w) => (
                      <tr key={w.id} className="hover:bg-emerald-50/70 transition-colors">
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                              w.jenis_kelamin === 'P' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {w.nama_lengkap.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-xs sm:text-sm">{w.nama_lengkap}</div>
                              <div className="text-[11px] text-gray-400 font-mono mt-0.5">NIK: {w.nik}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            w.status_keluarga === 'Kepala Keluarga'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : w.status_keluarga === 'Istri'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {w.status_keluarga || 'Anggota Keluarga'}
                          </span>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            KK: {w.kartu_keluarga?.no_kk || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4 font-mono">
                          {w.no_hp_wa ? (
                            <a
                              href={`https://wa.me/${w.no_hp_wa.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                              title="Kirim Pesan WhatsApp"
                            >
                              <Phone className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{w.no_hp_wa}</span>
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-gray-600">
                          <div className="font-medium">{w.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5">{w.tempat_lahir || '-'}</div>
                        </td>
                        <td className="py-3 px-3 sm:px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            w.status_ekonomi?.toLowerCase().includes('pkh')
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : w.status_ekonomi?.toLowerCase().includes('rentan')
                              ? 'bg-orange-100 text-orange-900 border border-orange-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {w.status_ekonomi || 'Mampu'}
                          </span>
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedWargaDetail(w)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1 ml-auto cursor-pointer shadow-2xs press-down"
                            title="Lihat Profil Lengkap Warga"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Clean Card List Mode Per-Jiwa */}
            <div className="md:hidden space-y-3">
              {filteredWargas.length === 0 ? (
                <div className="p-8 text-center text-gray-400 bg-white border border-gray-200 rounded-2xl text-xs">
                  Tidak ada data warga yang cocok dengan pencarian atau filter.
                </div>
              ) : (
                paginatedWargas.map((w) => {
                  const isPkh = w.status_ekonomi?.toLowerCase().includes('pkh');
                  const isRentan = w.status_ekonomi?.toLowerCase().includes('rentan');

                  return (
                    <div
                      key={w.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 animate-fade-in"
                    >
                      {/* Header: Avatar, Name, Gender, NIK */}
                      <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                            w.jenis_kelamin === 'P' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {w.nama_lengkap.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-sm text-slate-900 leading-tight truncate">
                              {w.nama_lengkap}
                            </h4>
                            <span className="font-mono text-[11px] text-slate-400">
                              NIK: {w.nik}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                          isPkh ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                          isRentan ? 'bg-orange-100 text-orange-900 border border-orange-200' :
                          'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isPkh ? 'PKH' : isRentan ? 'Rentan' : 'Mandiri'}
                        </span>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Status Keluarga</span>
                          <span className="font-extrabold text-slate-800">{w.status_keluarga || 'Anggota'}</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Jenis Kelamin</span>
                          <span className="font-extrabold text-slate-800">{w.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                        </div>
                      </div>

                      {/* WhatsApp & KK Info */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div className="font-mono text-[11px] text-slate-500 truncate max-w-[170px]">
                          KK: {w.kartu_keluarga?.no_kk || '-'}
                        </div>
                        {w.no_hp_wa ? (
                          <a
                            href={`https://wa.me/${w.no_hp_wa.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-extrabold text-xs bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No WA: -</span>
                        )}
                      </div>

                      {/* Detail Button */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setSelectedWargaDetail(w)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs press-down"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lihat Profil Lengkap Warga</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <Pagination
              currentPage={wargaPage}
              totalItems={filteredWargas.length}
              pageSize={RT_PAGE_SIZE}
              onPageChange={setWargaPage}
              itemLabel="warga"
            />
          </div>
        )}

        {/* Modal Detail Profil Warga */}
        {selectedWargaDetail && createPortal(
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/75 animate-fade-in font-sans"
            onClick={() => setSelectedWargaDetail(null)}
          >
            <div
              className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
                    {selectedWargaDetail.nama_lengkap.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 leading-tight">
                      {selectedWargaDetail.nama_lengkap}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      NIK: {selectedWargaDetail.nik}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWargaDetail(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">No. Kartu Keluarga (KK)</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedWargaDetail.kartu_keluarga?.no_kk || '-'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Status Dalam Keluarga</span>
                  <span className="font-bold text-slate-900">{selectedWargaDetail.status_keluarga || '-'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Jenis Kelamin</span>
                  <span className="font-bold text-slate-900">{selectedWargaDetail.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Tempat & Tanggal Lahir</span>
                  <span className="font-bold text-slate-900">{selectedWargaDetail.tempat_lahir || '-'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Pekerjaan</span>
                  <span className="font-bold text-slate-900">{selectedWargaDetail.pekerjaan || 'Wiraswasta / Belum Mengisi'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Klasifikasi Ekonomi</span>
                  <span className="font-bold text-emerald-700">{selectedWargaDetail.status_ekonomi || 'Mampu'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Alamat Domisili KTP</span>
                <span className="font-medium text-slate-800 leading-relaxed">
                  {selectedWargaDetail.alamat_ktp || 'RT 01 / RW 01 Dusun Krajan, Desa Doko, Kec. Ngasem, Kab. Kediri'}
                </span>
              </div>

              {selectedWargaDetail.no_hp_wa && (
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${selectedWargaDetail.no_hp_wa.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all press-down"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Kirim Pesan WhatsApp Langsung</span>
                  </a>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

        {/* Modal Detail Anggota Keluarga (Untuk Mode Per-KK) */}
        {renderKkDetailModal()}
      </div>
    );
  }

  // 2. DATA KELUARGA (Buku Register Kartu Keluarga RT 01)
  if (activeSubmenu === 'data_keluarga') {
    const filteredKk = effectiveKkList.filter((kk) => {
      const matchSearch = !kkSearch || 
        kk.no_kk?.toLowerCase().includes(kkSearch.toLowerCase()) || 
        kk.nama_kepala_keluarga?.toLowerCase().includes(kkSearch.toLowerCase()) ||
        kk.alamat_lengkap?.toLowerCase().includes(kkSearch.toLowerCase());
      const matchBansos = kkBansosFilter === 'all' || 
        (kkBansosFilter === 'pkh' && kk.status_ekonomi?.toLowerCase().includes('pkh')) ||
        (kkBansosFilter === 'mandiri' && !kk.status_ekonomi?.toLowerCase().includes('pkh'));
      return matchSearch && matchBansos;
    });

    const paginatedKk = filteredKk.slice((kkPage - 1) * RT_PAGE_SIZE, kkPage * RT_PAGE_SIZE);

    const totalKk = effectiveKkList.length;
    const totalJiwa = effectiveKkList.reduce((acc, k) => acc + (k.anggotaKeluarga?.length || k.anggota_keluarga?.length || 0), 0) || wargas.length;
    const avgJiwaPerKk = totalKk > 0 ? (totalJiwa / totalKk).toFixed(1) : '0';
    const totalKkPkh = effectiveKkList.filter((k) => k.status_ekonomi?.toLowerCase().includes('pkh')).length;

    return (
      <div className="space-y-6 animate-fade-in font-sans">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
                Register Kartu Keluarga
              </span>
              <span className="text-xs text-slate-400 font-bold">• RT 01 Krajan</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Buku Register Kartu Keluarga (KK) RT 01
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Rekapitulasi unit rumah tangga, nama kepala keluarga, alamat hunian, jumlah jiwa per KK, dan status bantuan keluarga.
            </p>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Total Kepala Keluarga</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalKk}</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Kartu Keluarga Terdata</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Rata-rata Jiwa / KK</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              {avgJiwaPerKk} <span className="text-sm font-bold text-slate-400">Jiwa</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Per satu rumah tangga</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Keluarga Bansos PKH</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                <HeartHandshake className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-800 mt-2">{totalKkPkh} KK</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Penerima Bantuan Sosial</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Keluarga Mandiri</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-2">{totalKk - totalKkPkh} KK</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Swadaya & Sejahtera</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={kkSearch}
              onChange={(e) => setKkSearch(e.target.value)}
              placeholder="Cari No. KK, Nama Kepala Keluarga, atau Alamat..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status Bansos:</span>
              <select
                value={kkBansosFilter}
                onChange={(e) => setKkBansosFilter(e.target.value)}
                className="bg-transparent font-bold outline-none cursor-pointer"
              >
                <option value="all">Semua Keluarga</option>
                <option value="pkh">Penerima PKH</option>
                <option value="mandiri">Keluarga Mandiri</option>
              </select>
            </div>
          </div>
        </div>

        {/* KK Table & Mobile Card List */}
        <div className="card-surface p-4 sm:p-6 space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs min-w-[760px] sm:min-w-0">
              <thead className="bg-gray-50/90 text-gray-600 border-b border-gray-200 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 sm:px-4">Nomor Kartu Keluarga</th>
                  <th className="py-3 px-3 sm:px-4">Nama Kepala Keluarga</th>
                  <th className="py-3 px-3 sm:px-4">Alamat Rumah di RT 01</th>
                  <th className="py-3 px-3 sm:px-4">Jumlah Jiwa</th>
                  <th className="py-3 px-3 sm:px-4">Klasifikasi Bantuan</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Daftar Anggota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredKk.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      Tidak ada data keluarga yang sesuai dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  paginatedKk.map((kk, idx) => (
                    <tr key={kk.id || idx} className="hover:bg-teal-50/60 transition-colors">
                      <td className="py-3 px-3 sm:px-4 font-mono font-bold text-slate-900">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl text-slate-800 border border-slate-200">
                          <Building2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>{kk.no_kk}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{kk.nama_kepala_keluarga}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">Kepala Keluarga Aktif</div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-slate-600 max-w-[200px] truncate" title={kk.alamat_lengkap}>
                        <div className="flex items-center gap-1">
                          <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{kk.alamat_lengkap || 'RT 01 / RW 01 Dusun Krajan'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          <Users className="w-3 h-3" />
                          <span>{(kk.anggotaKeluarga || kk.anggota_keluarga || []).length} Jiwa</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          kk.status_ekonomi?.toLowerCase().includes('pkh')
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {kk.status_ekonomi?.toLowerCase().includes('pkh') ? 'Penerima Bansos PKH' : 'Keluarga Mandiri'}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedKkDetail(kk)}
                          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 ml-auto cursor-pointer shadow-xs press-down"
                          title="Lihat Anggota Keluarga"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Anggota ({(kk.anggotaKeluarga || kk.anggota_keluarga || []).length})</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Clean Card List */}
          <div className="md:hidden space-y-3">
            {filteredKk.length === 0 ? (
              <div className="p-8 text-center text-gray-400 bg-white border border-gray-200 rounded-2xl text-xs">
                Tidak ada data keluarga yang sesuai dengan kriteria pencarian.
              </div>
            ) : (
              paginatedKk.map((kk, idx) => {
                const memberCount = (kk.anggotaKeluarga || kk.anggota_keluarga || []).length;
                const isPkh = kk.status_ekonomi?.toLowerCase().includes('pkh');

                return (
                  <div
                    key={kk.id || idx}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 animate-fade-in"
                  >
                    {/* Header: No KK & Bansos Badge */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="font-mono font-black text-xs text-slate-800 truncate">
                          {kk.no_kk}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                        isPkh
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {isPkh ? 'Bansos PKH' : 'Mandiri'}
                      </span>
                    </div>

                    {/* Body: Kepala Keluarga & Alamat */}
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Kepala Keluarga:
                          </span>
                          <h4 className="font-black text-sm text-slate-900 leading-tight">
                            {kk.nama_kepala_keluarga}
                          </h4>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                          <Users className="w-3 h-3" />
                          <span>{memberCount} Jiwa</span>
                        </span>
                      </div>

                      <div className="pt-1 flex items-start gap-1.5 text-xs text-slate-600">
                        <Home className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <p className="line-clamp-2 leading-relaxed">{kk.alamat_lengkap || 'RT 01 / RW 01 Dusun Krajan'}</p>
                      </div>
                    </div>

                    {/* Footer Button: Detail Anggota */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSelectedKkDetail(kk)}
                        className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs press-down"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Lihat Rincian Anggota Keluarga ({memberCount} Jiwa)</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Pagination
            currentPage={kkPage}
            totalItems={filteredKk.length}
            pageSize={RT_PAGE_SIZE}
            onPageChange={setKkPage}
            itemLabel="kartu keluarga"
          />
        </div>

        {/* Modal Detail Anggota Keluarga */}
        {renderKkDetailModal()}
      </div>
    );
  }

  // 3. PETA WILAYAH RT 01 (Denah Lingkungan & Sebaran Hunian)
  if (activeSubmenu === 'peta_wilayah') {
    const facilityPins: MapFacilityItem[] = [
      {
        id: 'pos_ronda',
        nama: 'Pos Ronda / Kamling RT 01',
        tipe: 'Keamanan Lingkungan',
        blok: 'Pintu Gerbang Utama (Blok C)',
        pic: 'Pak Supriyadi (Ketua RT 01)',
        status: 'Aktif Setiap Malam',
        jam: '22.00 - 04.00 WIB',
        icon: 'shield',
        lat: -7.81915,
        lng: 112.04130,
        bg: 'bg-blue-50 border-blue-200 text-blue-800',
        desc: 'Pusat keamanan warga dan koordinasi jaga siskamling bergilir 4 regu ronda.'
      },
      {
        id: 'posyandu',
        nama: 'Posyandu Melati RT 01',
        tipe: 'Pelayanan Kesehatan',
        blok: 'Sentra RT 01 (Blok B)',
        pic: 'Ibu Eni Rahmawati (Kader Posyandu)',
        status: 'Layanan Rutin Bulanan',
        jam: 'Jumat Pekan ke-4 • 08.30 WIB',
        icon: 'baby',
        lat: -7.81770,
        lng: 112.04260,
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        desc: 'Pelayanan timbang balita, imunisasi dasar, penyuluhan gizi, dan pemeriksaan lansia.'
      },
      {
        id: 'musholla',
        nama: 'Musholla Al-Ikhlas RT 01',
        tipe: 'Tempat Ibadah & Sosial',
        blok: 'Pusat Pemukiman (Blok B)',
        pic: 'Ustadz H. Mahfud (Tokoh Agama)',
        status: 'Digunakan Harian',
        jam: '5 Waktu Shalat & TPQ Sore',
        icon: 'mosque',
        lat: -7.81740,
        lng: 112.04310,
        bg: 'bg-teal-50 border-teal-200 text-teal-800',
        desc: 'Tempat ibadah berjamaah warga, pengajian malam Jumat, dan taman pendidikan Al-Quran anak-anak.'
      },
      {
        id: 'lapangan',
        nama: 'Lapangan Serbaguna Warga',
        tipe: 'Fasilitas Olahraga & Umum',
        blok: 'Ujung Selatan (Blok C)',
        pic: 'Karang Taruna RT 01',
        status: 'Tersedia Bebas',
        jam: 'Pagi & Sore Hari',
        icon: 'ball',
        lat: -7.81890,
        lng: 112.04380,
        bg: 'bg-amber-50 border-amber-200 text-amber-800',
        desc: 'Sarana olahraga bola voli, senam sehat lansia setiap hari Minggu, dan area musyawarah terbuka.'
      },
      {
        id: 'tps',
        nama: 'Bank Sampah & TPS 3R Swadaya',
        tipe: 'Kebersihan Lingkungan',
        blok: 'Ujung Timur (Blok A)',
        pic: 'Koordinator Kebersihan RT',
        status: 'Pengangkutan Terjadwal',
        jam: 'Rabu & Sabtu Pagi',
        icon: 'trash',
        lat: -7.81680,
        lng: 112.04400,
        bg: 'bg-rose-50 border-rose-200 text-rose-800',
        desc: 'Pusat pilah sampah anorganik warga dan jadwal penjemputan sampah terpadu desa.'
      },
      {
        id: 'sumur',
        nama: 'Titik Sumur Bor & Resapan Siaga',
        tipe: 'Infrastruktur Air Bersih',
        blok: 'Blok Mawar (Utara)',
        pic: 'Seksi Pembangunan RT',
        status: 'Siaga 24 Jam',
        jam: 'Operasional Penuh',
        icon: 'water',
        lat: -7.81670,
        lng: 112.04160,
        bg: 'bg-cyan-50 border-cyan-200 text-cyan-800',
        desc: 'Sumber air bersih cadangan warga dan sumur resapan anti genangan air hujan.'
      },
    ];

    const activePin = selectedPetaPin || facilityPins[0];

    return (
      <div className="space-y-6 animate-fade-in font-sans">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Peta Geospasial Lingkungan
              </span>
              <span className="text-xs text-slate-400 font-bold">• RT 01 / RW 01 Dusun Krajan</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Peta Wilayah, Denah Lingkungan & Sebaran Hunian RT 01
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Visualisasi tata ruang dan teritorial RT 01 Dusun Krajan: sebaran blok hunian warga, titik fasilitas umum, dan batas wilayah administrasi.
            </p>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Luas Teritorial</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">1,45 <span className="text-sm font-bold text-slate-400">Ha</span></div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">± 14.500 m² wilayah pemukiman</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Bangunan Hunian</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Home className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">38 <span className="text-sm font-bold text-slate-400">Rumah</span></div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Tersebar di 3 Blok Lingkungan</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Fasilitas Publik</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">6 <span className="text-sm font-bold text-slate-400">Titik</span></div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Pos Ronda, Posyandu, Musholla, dll</div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Status Keamanan</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-2">Zona Hijau</div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Aman • Siskamling Aktif 24 Jam</div>
          </div>
        </div>

        {/* Full-width Map Card (disamakan seperti UI di RW) */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-700">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  Denah Tata Ruang Wilayah RT 01 Krajan
                </h3>
                <p className="text-xs text-slate-500">
                  GIS Interaktif Terverifikasi • Koordinat Asli Dusun Krajan, Desa Doko
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-2xl border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Satelit Esri & OSM
              </span>
              <span className="inline-flex items-center gap-1.5 text-blue-800 bg-blue-50 px-3 py-1 rounded-2xl border border-blue-200">
                6 Fasum + Hunian Warga
              </span>
            </div>
          </div>

          {/* Real GIS Leaflet Map with switchable layers, pins & polygon */}
          <RealRtMap
            facilities={facilityPins}
            selectedPinId={activePin.id}
            onSelectPin={(item) => setSelectedPetaPin(item)}
            wargas={wargas}
          />
        </div>

        {/* Selected Facility / House Card (Full Width responsive layout) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs transition-all">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
                {activePin.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {activePin.isHouse ? 'Hunian Warga Terdata' : 'Fasilitas Lingkungan RT'}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">• {activePin.blok}</span>
                </div>
                <h4 className="text-lg font-black text-slate-900 leading-tight">{activePin.nama}</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{activePin.desc}</p>
              </div>
            </div>

            {/* Quick Metrics / Meta & Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 px-3.5 text-left grow sm:grow-0">
                <div className="text-[10px] font-bold uppercase text-slate-400">Penanggung Jawab</div>
                <div className="text-xs font-black text-slate-900 truncate max-w-[140px]">{activePin.pic}</div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 px-3.5 text-left grow sm:grow-0">
                <div className="text-[10px] font-bold uppercase text-slate-400">Waktu / Jadwal</div>
                <div className="text-xs font-black text-slate-900 truncate max-w-[150px]">{activePin.jam}</div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 px-3.5 text-left grow sm:grow-0">
                <div className="text-[10px] font-bold uppercase text-slate-400">Status Sarana</div>
                <div className="text-xs font-black text-emerald-700">{activePin.status}</div>
              </div>

              {activePin.jam && activePin.jam.includes('WhatsApp:') ? (
                <a
                  href={`https://wa.me/${activePin.jam.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto p-2.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer press-down"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Hubungi WhatsApp</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* Batas Administrasi Wilayah RT 01 (4 Cards Horizontal Grid) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Compass className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Batas Administrasi 4 Arah RT 01 Krajan
            </h4>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                UTARA
              </span>
              <div className="text-xs font-bold text-slate-900 mt-1">RT 02 Dusun Krajan</div>
              <div className="text-[11px] text-slate-500">Saluran Irigasi Persawahan</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                SELATAN
              </span>
              <div className="text-xs font-bold text-slate-900 mt-1">Jalan Raya Ngasem - Doko</div>
              <div className="text-[11px] text-slate-500">Akses Utama Transportasi</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                TIMUR
              </span>
              <div className="text-xs font-bold text-slate-900 mt-1">Persawahan Kas Desa</div>
              <div className="text-[11px] text-slate-500">Lahan Produktif Pertanian</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                BARAT
              </span>
              <div className="text-xs font-bold text-slate-900 mt-1">RT 03 Dusun Krajan</div>
              <div className="text-[11px] text-slate-500">Gang Cempaka Pemukiman</div>
            </div>
          </div>
        </div>

        {/* Fasilitas & Inventaris Lingkungan (Desktop Table + Mobile Cards) */}
        <div className="card-surface p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              Daftar Fasilitas Umum & Inventaris Lingkungan RT 01
            </h3>
            <span className="text-xs text-slate-400 font-bold">6 Sarana Tercatat</span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/90 text-gray-600 border-b border-gray-200 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Fasilitas</th>
                  <th className="py-3 px-4">Bidang</th>
                  <th className="py-3 px-4">Lokasi Blok</th>
                  <th className="py-3 px-4">Penanggung Jawab (PIC)</th>
                  <th className="py-3 px-4">Jadwal Operasional</th>
                  <th className="py-3 px-4 text-right">Kondisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {facilityPins.map((f) => {
                  const isSelected = activePin.id === f.id;
                  return (
                    <tr 
                      key={f.id} 
                      onClick={() => setSelectedPetaPin(f)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/80 font-medium' : 'hover:bg-slate-50'
                      }`}
                      title="Klik untuk pusatkan peta ke fasilitas ini"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 font-bold text-slate-900">
                          <span className="text-base">{f.icon}</span>
                          <span>{f.nama}</span>
                          {isSelected && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black tracking-wide">
                              Terpilih
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{f.tipe}</td>
                      <td className="py-3 px-4 text-slate-600">{f.blok}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{f.pic}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{f.jam}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Terawat & Aktif</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (No Horizontal Scrollbar, Thumb Friendly!) */}
          <div className="grid grid-cols-1 gap-2.5 md:hidden">
            {facilityPins.map((f) => {
              const isSelected = activePin.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => {
                    setSelectedPetaPin(f);
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-slate-50 border border-slate-100">{f.icon}</span>
                    <div>
                      <div className="font-black text-xs text-slate-900">{f.nama}</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">{f.tipe}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">PIC: {f.pic} • {f.blok}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-2 px-3 rounded-xl bg-slate-900 text-white font-bold text-[10px] shrink-0"
                  >
                    Lihat
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Kas & Iuran RT 01
  if (activeSubmenu === 'kas_rt') {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pembukuan Kas & Iuran Warga RT 01
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pencatatan iuran kebersihan, keamanan, serta rekapitulasi pengeluaran kegiatan RT.
            </p>
          </div>

          <button
            onClick={() => setShowKasModal(true)}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover-glow shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Catat Transaksi Kas
          </button>
        </div>

        {/* Ringkasan Saldo: Desktop 3-Card Grid vs Mobile Modern Wallet Card */}
        {/* Desktop View */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-4 text-sm">
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="text-gray-600 font-medium">Total Iuran Masuk</div>
            <div className="text-2xl font-black text-emerald-800 mt-2">
              Rp {Number(kasData?.summary?.total_masuk || 25000).toLocaleString('id-ID')}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200">
            <div className="text-gray-600 font-medium">Total Pengeluaran</div>
            <div className="text-2xl font-black text-rose-800 mt-2">
              Rp {Number(kasData?.summary?.total_keluar || 150000).toLocaleString('id-ID')}
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
            <div className="text-gray-600 font-medium">Saldo Akhir Kas</div>
            <div className="text-2xl font-black text-blue-800 mt-2">
              Rp {Number(kasData?.summary?.saldo || 0).toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Mobile View: Modern Wallet Summary Card (Clean White) */}
        <div className="sm:hidden p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Saldo Kas RT 01
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Kas Aktif
            </span>
          </div>
          <div className="text-2xl font-black tracking-tight font-mono text-slate-900">
            Rp {Number(kasData?.summary?.saldo || 0).toLocaleString('id-ID')}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[10px] text-emerald-700 block font-medium">Total Masuk</span>
              <span className="font-black text-emerald-800 font-mono text-xs">
                +Rp {Number(kasData?.summary?.total_masuk || 25000).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-100">
              <span className="text-[10px] text-rose-700 block font-medium">Total Keluar</span>
              <span className="font-black text-rose-800 font-mono text-xs">
                -Rp {Number(kasData?.summary?.total_keluar || 150000).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        <div className="card-surface p-4 sm:p-6 space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
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
                {(() => {
                  const txList = kasData?.transactions || [];
                  const paginatedKas = txList.slice((kasPage - 1) * RT_PAGE_SIZE, kasPage * RT_PAGE_SIZE);

                  if (txList.length === 0) {
                    return <tr><td colSpan={5} className="p-8 text-center text-gray-400">Belum ada transaksi kas</td></tr>;
                  }

                  return paginatedKas.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-emerald-50 transition-colors">
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
                  ));
                })()}
              </tbody>
            </table>
          </div>

          {/* Mobile Clean Transaction Feed (Zero Horizontal Scroll!) */}
          <div className="md:hidden space-y-2.5">
            {(() => {
              const txList = kasData?.transactions || [];
              const paginatedKas = txList.slice((kasPage - 1) * RT_PAGE_SIZE, kasPage * RT_PAGE_SIZE);

              if (txList.length === 0) {
                return (
                  <div className="p-8 text-center text-gray-400 bg-white border border-gray-200 rounded-2xl text-xs">
                    Belum ada transaksi kas tercatat.
                  </div>
                );
              }

              return paginatedKas.map((tx: any) => {
                const isMasuk = tx.tipe === 'Pemasukan';
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 animate-fade-in"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                        isMasuk ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {isMasuk ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-xs text-slate-900 leading-snug line-clamp-2">
                          {tx.keterangan || tx.category?.nama_kategori || 'Transaksi Kas'}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-medium">
                          <span className={`px-1.5 py-0.5 rounded-md font-bold ${
                            isMasuk ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                          }`}>
                            {tx.category?.nama_kategori || (isMasuk ? 'Pemasukan' : 'Pengeluaran')}
                          </span>
                          <span>•</span>
                          <span className="font-mono">
                            {new Date(tx.tanggal_transaksi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`text-right shrink-0 font-mono font-black text-xs ${
                      isMasuk ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {isMasuk ? '+' : '-'} Rp {Number(tx.jumlah).toLocaleString('id-ID')}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          <Pagination
            currentPage={kasPage}
            totalItems={(kasData?.transactions || []).length}
            pageSize={RT_PAGE_SIZE}
            onPageChange={setKasPage}
            itemLabel="transaksi kas"
          />
        </div>

        {/* Modal Input Kas RT */}
        {renderKasModal()}
      </div>
    );
  }

  // Beranda Dashboard RT 01
  return (
    <div className="space-y-6 page-enter font-sans">
      
      {/* Top 4 Modular Stat Metric Cards (2x2 Grid di Mobile, 4-Col di Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
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
          trend="Data SIAK"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Surat Selesai"
          value={`${completedSurats.length} Surat`}
          subvalue="Bulan Ini"
          percentage={surats.length > 0 ? Math.round((completedSurats.length / surats.length) * 100) : 100}
          color="teal"
          trend="100% Ditandatangani"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Partisipasi Warga"
          value="98.5%"
          subvalue="Iuran Kas RT 01"
          percentage={98}
          color="sky"
          trend="Tertib BKU"
          isPositiveTrend={true}
        />
      </div>

      {/* Chart & Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left 8 Cols */}
        <div className="xl:col-span-8 space-y-5">
          {/* Performance Overview Spline Area Chart (Hidden on mobile to reduce clutter) */}
          <div className="hidden lg:block space-y-5">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="hidden lg:block">
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
            </div>

            {/* Quick Action & Kas Shortcut Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  Panel Tindakan Cepat
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">Aksi Cepat RT</h4>
                <p className="text-xs text-slate-500 mt-0.5">Kelola verifikasi warga dan pencatatan kas.</p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowKasModal(true)}
                  className="w-full p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all press-down flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Catat kas RT</span>
                  </span>
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">
                    + Kas
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('persetujuan_surat');
                    } else {
                      handleSetActiveTab('antrean');
                    }
                  }}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Periksa permohonan</span>
                  </span>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {pendingSurats.length} Pending
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('data_warga');
                    } else {
                      handleSetActiveTab('warga');
                    }
                  }}
                  className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <span>Data warga</span>
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
        <div className="xl:col-span-4 space-y-5">
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
              <UserAvatar
                src={user?.avatar}
                name={user?.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-xs shrink-0"
                fallbackClassName="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 leading-snug break-words">
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
      <div ref={tabsSectionRef} className="flex flex-wrap gap-2 border-b border-gray-200 pb-3 animate-fade-up stagger-2">
        <button
          onClick={() => handleSetActiveTab('antrean')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all press-down ${
            activeTab === 'antrean' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Antrean Surat ({surats.length})
        </button>
        <button
          onClick={() => handleSetActiveTab('warga')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all press-down ${
            activeTab === 'warga' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Data Kependudukan ({wargas.length})
        </button>
        <button
          onClick={() => handleSetActiveTab('kas')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all press-down ${
            activeTab === 'kas' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Pembukuan Kas & Iuran
        </button>
        <button
          onClick={() => handleSetActiveTab('konfirmasi_warga')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all press-down flex items-center gap-1.5 ${
            activeTab === 'konfirmasi_warga' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span>Konfirmasi Warga Baru</span>
          {pendingWargas.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-xs bg-amber-400 text-amber-950 font-black">
              {pendingWargas.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: Antrean Surat */}
      {activeTab === 'antrean' && (
        <div className="card-surface p-4 sm:p-6 space-y-4 animate-fade-up stagger-3">
          <div className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
            <span>Daftar Permohonan Surat Masuk ({surats.length}):</span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs min-w-[720px] sm:min-w-0">
              <thead className="bg-gray-50/90 text-gray-600 border-b border-gray-200 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-3 sm:px-4">No. Resi</th>
                  <th className="py-3 px-3 sm:px-4">Nama Pemohon & NIK</th>
                  <th className="py-3 px-3 sm:px-4">Jenis Surat</th>
                  <th className="py-3 px-3 sm:px-4">Keperluan</th>
                  <th className="py-3 px-3 sm:px-4">Status Terkini</th>
                  <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                    Aksi Persetujuan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {surats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">
                      Tidak ada data surat masuk.
                    </td>
                  </tr>
                ) : (
                  surats.map((s, idx) => (
                    <tr key={s.id} className="group hover:bg-emerald-50 transition-colors" style={{ animationDelay: `${(idx + 1) * 50}ms` }}>
                      <td className="py-3 px-3 sm:px-4 font-mono font-bold text-xs text-gray-700 whitespace-nowrap">
                        {s.nomor_resi}
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-bold text-gray-900 text-xs sm:text-sm leading-tight">{s.warga_profile?.nama_lengkap}</div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">NIK: {s.warga_profile?.nik}</div>
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-bold text-emerald-800 text-xs leading-snug max-w-[160px] line-clamp-2">{s.surat_type?.nama_surat}</div>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-gray-600 text-xs max-w-[140px] truncate" title={s.keperluan}>{s.keperluan}</td>
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        {renderStatusBadge(s)}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
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

                          {s.status === 'pending_rt' ? (
                            <>
                              <button
                                onClick={() => {
                                  setConfirmingApproveSurat(s);
                                  setApproveCatatan('Data warga valid dan terdaftar resmi di RT 01.');
                                }}
                                disabled={isProcessing}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs press-down flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                title="ACC & Teruskan ke Kantor Desa"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>ACC</span>
                              </button>
                              <button
                                onClick={() => setSelectedSurat(s)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors press-down border border-rose-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                                title="Tolak Permohonan Surat"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </>
                          ) : s.status === 'rejected' ? (
                            <span className="inline-flex items-center gap-1 text-rose-700 text-xs font-bold bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200/80 shadow-2xs whitespace-nowrap">
                              Ditolak
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-800 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200/80 shadow-2xs whitespace-nowrap">
                              {s.status === 'completed' ? 'Dokumen Sah' : 'Disetujui RT 01'}
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

          {/* Mobile Clean Card List */}
          <div className="md:hidden space-y-3">
            {surats.length === 0 ? (
              <div className="p-8 text-center text-gray-400 bg-white border border-gray-200 rounded-2xl text-xs">
                Tidak ada data surat masuk.
              </div>
            ) : (
              surats.map((s) => (
                <div 
                  key={s.id} 
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 animate-fade-in"
                >
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Resi:</span>
                      <span className="font-mono font-black text-xs text-slate-800 truncate">
                        {s.nomor_resi}
                      </span>
                    </div>
                    <div className="shrink-0">
                      {renderStatusBadge(s)}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-slate-900 leading-tight truncate">
                          {s.warga_profile?.nama_lengkap}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500">
                          NIK: {s.warga_profile?.nik}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200 shrink-0">
                        {s.surat_type?.kode_surat || 'SURAT'}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-emerald-900">
                      {s.surat_type?.nama_surat}
                    </div>

                    {s.keperluan && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-0.5">
                          Keperluan:
                        </span>
                        <p className="line-clamp-2 leading-relaxed">{s.keperluan}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewSurat(s)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs press-down"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Detail</span>
                    </button>

                    {s.status === 'pending_rt' ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmingApproveSurat(s);
                            setApproveCatatan('Data warga valid dan terdaftar resmi di RT 01.');
                          }}
                          disabled={isProcessing}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-xs press-down flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>ACC</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSurat(s)}
                          className="py-2 px-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-extrabold text-xs transition-colors press-down border border-rose-200 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    ) : s.status === 'rejected' ? (
                      <span className="px-3 py-2 rounded-xl text-rose-700 text-xs font-bold bg-rose-50 border border-rose-200 text-center flex-1">
                        Ditolak
                      </span>
                    ) : (
                      <span className="px-3 py-2 rounded-xl text-emerald-800 text-xs font-bold bg-emerald-50 border border-emerald-200 text-center flex-1">
                        {s.status === 'completed' ? 'Dokumen Sah' : 'Disetujui RT'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Kependudukan RT */}
      {activeTab === 'warga' && (
        <div className="card-surface p-4 sm:p-6 space-y-4 animate-fade-up stagger-3">
          <div className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
            <span>Buku Administrasi Data Penduduk RT 01 ({wargas.length} Jiwa):</span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs min-w-[700px] sm:min-w-0">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">NIK & No. KK</th>
                  <th className="py-3 px-4">No. WhatsApp</th>
                  <th className="py-3 px-4">Status Keluarga</th>
                  <th className="py-3 px-4">Klasifikasi Ekonomi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {wargas.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Belum ada data warga terdaftar</td></tr>
                ) : (
                  wargas.map((w, idx) => (
                    <tr key={w.id} className="hover:bg-emerald-50 transition-colors animate-fade-in" style={{ animationDelay: `${(idx + 1) * 50}ms` }}>
                      <td className="py-3 px-4 font-bold text-gray-900 text-xs sm:text-sm">{w.nama_lengkap}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-600">
                        <div>NIK: {w.nik}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">KK: {w.kartu_keluarga?.no_kk || '-'}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-800 font-medium text-xs">
                        {w.no_hp_wa ? (
                          <a
                            href={`https://wa.me/${w.no_hp_wa.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:underline text-emerald-700"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{w.no_hp_wa}</span>
                          </a>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-xs">{w.status_keluarga}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          w.status_ekonomi?.toLowerCase().includes('pkh') ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700 border border-gray-200'
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

          {/* Mobile Clean Card List */}
          <div className="md:hidden space-y-2.5">
            {wargas.length === 0 ? (
              <div className="p-8 text-center text-gray-400 bg-white border border-gray-200 rounded-2xl text-xs">
                Belum ada data warga terdaftar.
              </div>
            ) : (
              wargas.map((w) => (
                <div
                  key={w.id}
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2 animate-fade-in"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-black text-xs text-slate-900 truncate">
                        {w.nama_lengkap}
                      </h4>
                      <div className="text-[10px] font-mono text-slate-400">
                        NIK: {w.nik}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold shrink-0 ${
                      w.status_ekonomi?.toLowerCase().includes('pkh')
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {w.status_ekonomi}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                    <span className="text-slate-500">{w.status_keluarga || 'Anggota'}</span>
                    {w.no_hp_wa ? (
                      <a
                        href={`https://wa.me/${w.no_hp_wa.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Kas RT */}
      {activeTab === 'kas' && (
        <div className="card-surface p-4 sm:p-6 space-y-4 animate-fade-up stagger-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Buku Kas & Iuran Rukun Tetangga (RT 01)</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Dikelola oleh Bendahara RT untuk iuran sampah, keamanan, dan perbaikan lingkungan.</p>
            </div>

            <button
              onClick={() => setShowKasModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover-lift press-down hover-glow shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Catat Transaksi Kas
            </button>
          </div>

          {/* Ringkasan Saldo: Desktop 3 Cards vs Mobile Wallet Card */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-4 text-sm">
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

          {/* Mobile Modern Wallet Card (Clean White) */}
          <div className="sm:hidden p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Saldo Kas RT 01
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Kas Aktif
              </span>
            </div>
            <div className="text-2xl font-black tracking-tight font-mono text-slate-900">
              Rp {Number(kasData?.summary?.saldo || 0).toLocaleString('id-ID')}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[10px] text-emerald-700 block font-medium">Total Masuk</span>
                <span className="font-black text-emerald-800 font-mono text-xs">
                  +Rp {Number(kasData?.summary?.total_masuk || 25000).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-100">
                <span className="text-[10px] text-rose-700 block font-medium">Total Keluar</span>
                <span className="font-black text-rose-800 font-mono text-xs">
                  -Rp {Number(kasData?.summary?.total_keluar || 150000).toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Kas Table Desktop View */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
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
                    <tr key={tx.id} className="hover:bg-emerald-50 transition-colors animate-fade-in" style={{ animationDelay: `${(idx + 1) * 50}ms` }}>
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

          {/* Mobile Clean Transaction Feed */}
          <div className="md:hidden space-y-2.5">
            {kasData?.transactions && kasData.transactions.length > 0 ? (
              kasData.transactions.map((tx: any) => {
                const isMasuk = tx.tipe === 'Pemasukan';
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 animate-fade-in"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                        isMasuk ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {isMasuk ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-xs text-slate-900 leading-snug line-clamp-2">
                          {tx.keterangan || tx.category?.nama_kategori || 'Transaksi Kas'}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-medium">
                          <span className={`px-1.5 py-0.5 rounded-md font-bold ${
                            isMasuk ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                          }`}>
                            {tx.category?.nama_kategori || (isMasuk ? 'Pemasukan' : 'Pengeluaran')}
                          </span>
                          <span>•</span>
                          <span className="font-mono">
                            {new Date(tx.tanggal_transaksi).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`text-right shrink-0 font-mono font-black text-xs ${
                      isMasuk ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {isMasuk ? '+' : '-'} Rp {Number(tx.jumlah).toLocaleString('id-ID')}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-400 bg-white border border-gray-200 rounded-2xl text-xs">
                Belum ada transaksi kas tercatat.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Verifikasi & Konfirmasi Warga Baru (Digital Queue) */}
      {activeTab === 'konfirmasi_warga' && (
        <div className="card-surface p-4 sm:p-6 space-y-4 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                Verifikasi Mandiri Lingkungan RT 01
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Antrean Pendaftaran & Mutasi Warga Baru
              </h3>
              <p className="text-xs text-slate-500">
                Konfirmasi warga baru tanpa perlu datang ke rumah secara fisik. Cukup tinjau dokumen KTP/KK digital dan hubungi nomor WhatsApp terlampir.
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl w-fit">
              {pendingWargas.length} Menunggu Konfirmasi
            </span>
          </div>

          {verifyWargaAlert && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{verifyWargaAlert}</span>
            </div>
          )}

          {pendingWargas.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">Tidak ada antrean warga baru</p>
              <p className="text-slate-400">Seluruh permohonan pendaftaran warga RT 01 telah terverifikasi tuntas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingWargas.map((w) => (
                <div
                  key={w.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 transition space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {w.status}
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-1">{w.nama}</h4>
                      <p className="text-xs text-slate-500 font-mono">NIK: {w.nik} • KK: {w.no_kk}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{w.tanggal_daftar}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{w.alamat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{w.no_hp_wa}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Pekerjaan: {w.pekerjaan}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={`https://wa.me/62${w.no_hp_wa.replace(/^0/, '')}?text=Halo%20${encodeURIComponent(w.nama)},%20saya%20Ketua%20RT%2001%20Krajan%20mengenai%20pendaftaran%20warga%20Anda.`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hubungi WhatsApp</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const reason = prompt('Masukkan alasan penolakan berkas:');
                          if (reason) {
                            setPendingWargas((prev) => prev.filter((p) => p.id !== w.id));
                            setVerifyWargaAlert(`Pendaftaran ${w.nama} ditolak: ${reason}`);
                            setTimeout(() => setVerifyWargaAlert(null), 4000);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                      >
                        Tolak
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPendingWargas((prev) => prev.filter((p) => p.id !== w.id));
                          setVerifyWargaAlert(`Sukses: ${w.nama} resmi diverifikasi dan disahkan sebagai warga RT 01! Data telah diteruskan ke Sekdes.`);
                          setTimeout(() => setVerifyWargaAlert(null), 4500);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Verifikasi & Sahkan</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Input Kas RT */}
      {renderKasModal()}

      {/* Modal Preview & Berkas Surat */}
      {renderPreviewSuratModal()}

      {/* Modal Reject Surat - Portaled, Auto-Centered, Highest Z-Index, No Blur */}
      {selectedSurat && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 font-sans overflow-y-auto animate-fade-in select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedSurat(null);
              setActionCatatan('');
            }
          }}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl modal-content my-auto max-h-[90vh] overflow-y-auto border border-slate-100 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <h3 className="font-black text-xl text-gray-900">Tolak Permohonan Surat</h3>
              <button 
                onClick={() => {
                  setSelectedSurat(null);
                  setActionCatatan('');
                }} 
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                title="Tutup (ESC)"
              >
                <X className="w-5 h-5" />
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
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors font-medium text-left cursor-pointer"
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
        </div>,
        document.body
      )}
    </div>
  );
};
