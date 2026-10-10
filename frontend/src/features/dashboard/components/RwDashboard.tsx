import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Home,
  CheckCircle2, 
  Check, 
  Search,
  ShieldCheck,
  Eye,
  XCircle,
  Users,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Layers,
  TrendingUp,
  Plus,
  AlertCircle,
  Phone,
  Sparkles,
  Filter,
  Calendar,
  X,
  ExternalLink,
  ArrowRight,
  Download,
  Printer,
  ChevronRight,
  HeartHandshake,
  Compass,
  FileCheck2,
  FileText
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

interface RwDashboardProps {
  activeSubmenu?: string;
}

export const RwDashboard: React.FC<RwDashboardProps> = ({ activeSubmenu = 'beranda' }) => {
  const { user } = useAuth();

  // Core Data States
  const [surats, setSurats] = useState<SuratRequest[]>([]);
  const [wargas, setWargas] = useState<WargaProfile[]>([]);
  const [kartuKeluargas, setKartuKeluargas] = useState<any[]>([]);
  const [rtsData, setRtsData] = useState<any[]>([]);
  const [kasData, setKasData] = useState<any>(null);

  // Tab State on Beranda
  const [activeTab, setActiveTab] = useState<'antrean' | 'rt' | 'warga' | 'kas'>('antrean');

  // Modals & Action States
  const [previewSurat, setPreviewSurat] = useState<SuratRequest | null>(null);
  const [selectedWargaDetail, setSelectedWargaDetail] = useState<WargaProfile | null>(null);
  const [selectedKkDetail, setSelectedKkDetail] = useState<any | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filters & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRtFilter, setSelectedRtFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [wargaSearch, setWargaSearch] = useState('');
  const [wargaGenderFilter, setWargaGenderFilter] = useState<'all' | 'L' | 'P'>('all');
  const [kkSearch, setKkSearch] = useState('');

  // Kas Modal States
  const [showKasModal, setShowKasModal] = useState(false);
  const [kasTipe, setKasTipe] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [kasTanggal, setKasTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [kasJumlah, setKasJumlah] = useState<number | ''>('');
  const [kasKeterangan, setKasKeterangan] = useState('');
  const [kasCategoryId, setKasCategoryId] = useState<number | ''>('');
  const [kasRtId, setKasRtId] = useState<number | ''>(1);
  const [kasError, setKasError] = useState('');
  const [kasSuccess, setKasSuccess] = useState('');

  // Fetch all initial data for RW
  useEffect(() => {
    fetchRwAllData();
  }, []);

  const fetchRwAllData = async () => {
    try {
      const [suratsRes, wargasRes, kksRes, rtsRes, kasRes] = await Promise.allSettled([
        api.get('/surats'),
        api.get('/warga'),
        api.get('/warga/kartu-keluarga'),
        api.get('/rw/rts'),
        api.get('/kas-rt'),
      ]);

      if (suratsRes.status === 'fulfilled' && suratsRes.value.data.success) {
        setSurats(suratsRes.value.data.data);
      }
      if (wargasRes.status === 'fulfilled' && wargasRes.value.data.success) {
        setWargas(wargasRes.value.data.data);
      }
      if (kksRes.status === 'fulfilled' && kksRes.value.data.success) {
        setKartuKeluargas(kksRes.value.data.data);
      }
      if (rtsRes.status === 'fulfilled' && rtsRes.value.data.success) {
        setRtsData(rtsRes.value.data.data);
      }
      if (kasRes.status === 'fulfilled' && kasRes.value.data.success) {
        setKasData(kasRes.value.data);
      }
    } catch {
      // Fallback handled gracefully
    }
  };

  // Lock body scroll and ESC key for open modals
  useEffect(() => {
    if (previewSurat || selectedWargaDetail || selectedKkDetail || showKasModal) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setPreviewSurat(null);
          setSelectedWargaDetail(null);
          setSelectedKkDetail(null);
          setShowKasModal(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [previewSurat, selectedWargaDetail, selectedKkDetail, showKasModal]);

  // Handle Surat Approval by RW
  const handleApproveRw = async (id: number) => {
    setIsProcessing(true);
    try {
      const res = await api.post(`/surats/${id}/approve-rw`, {
        catatan: 'Pengantar tingkat RW 01 diverifikasi dan diteruskan ke Sekretaris Desa.',
      });
      if (res.data.success) {
        setPreviewSurat(null);
        fetchRwAllData();
      }
    } catch (err: any) {
      alert('Gagal memverifikasi: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Surat Rejection by RW
  const handleRejectRw = async (id: number, catatan: string) => {
    setIsProcessing(true);
    try {
      const res = await api.post(`/surats/${id}/reject`, {
        alasan: catatan,
      });
      if (res.data.success) {
        setPreviewSurat(null);
        fetchRwAllData();
      }
    } catch (err: any) {
      alert('Gagal menolak surat: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Add Kas Transaction
  const handleSaveKas = async (e: React.FormEvent) => {
    e.preventDefault();
    setKasError('');
    setKasSuccess('');

    if (!kasJumlah || Number(kasJumlah) <= 0) {
      setKasError('Nominal transaksi harus lebih dari Rp 0.');
      return;
    }
    if (!kasKeterangan.trim()) {
      setKasError('Keterangan transaksi wajib diisi.');
      return;
    }

    try {
      setIsProcessing(true);
      const res = await api.post('/kas-rt/transactions', {
        rt_id: kasRtId || 1,
        tipe: kasTipe,
        tanggal_transaksi: kasTanggal,
        jumlah: Number(kasJumlah),
        keterangan: `[RW 01] ${kasKeterangan.trim()}`,
        category_id: kasCategoryId || (kasData?.categories?.[0]?.id || 1),
      });

      if (res.data.success) {
        setKasSuccess('Transaksi Kas RW berhasil dicatat ke sistem.');
        setKasJumlah('');
        setKasKeterangan('');
        setTimeout(() => {
          setShowKasModal(false);
          setKasSuccess('');
        }, 1200);
        fetchRwAllData();
      }
    } catch (err: any) {
      setKasError(err.response?.data?.message || 'Gagal menyimpan transaksi kas.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Group wargas into normalized Kartu Keluarga objects
  const effectiveKkList = useMemo(() => {
    const map = new Map<string, any>();

    // 1. Seed from backend KK
    kartuKeluargas.forEach((kk) => {
      const rawMembers = kk.anggota_keluarga || kk.anggotaKeluarga || [];
      const kkNo = kk.no_kk || String(kk.id);
      map.set(kkNo, {
        ...kk,
        id: kk.id || kkNo,
        no_kk: kkNo,
        nomor_rt: kk.rt?.nomor_rt || '01',
        nama_kepala_keluarga: kk.nama_kepala_keluarga || 'Kepala Keluarga',
        alamat_lengkap: kk.alamat_lengkap || 'RW 01 Dusun Krajan, Desa Doko',
        no_telp_rumah: kk.no_telp_rumah || '-',
        status_ekonomi: kk.status_ekonomi || 'Keluarga Mandiri',
        anggotaKeluarga: [...rawMembers],
      });
    });

    // 2. Associate Wargas to their KK
    wargas.forEach((w) => {
      let matchedKkNo: string | null = null;
      if (w.kartu_keluarga?.no_kk && map.has(w.kartu_keluarga.no_kk)) {
        matchedKkNo = w.kartu_keluarga.no_kk;
      } else if (w.kk_id) {
        for (const [no, kkItem] of map.entries()) {
          if (kkItem.id === w.kk_id) {
            matchedKkNo = no;
            break;
          }
        }
      }

      if (matchedKkNo) {
        const item = map.get(matchedKkNo);
        const exists = item.anggotaKeluarga.some((m: any) => m.id === w.id || (m.nik && m.nik === w.nik));
        if (!exists) {
          item.anggotaKeluarga.push(w);
        }
        if (w.status_keluarga === 'Kepala Keluarga') {
          item.nama_kepala_keluarga = w.nama_lengkap;
        }
      } else {
        const newKkNo = w.kartu_keluarga?.no_kk || ('350604180820' + String(w.kk_id || w.id || 1).padStart(4, '0'));
        if (!map.has(newKkNo)) {
          map.set(newKkNo, {
            id: w.kk_id || w.id,
            no_kk: newKkNo,
            nomor_rt: w.rt?.nomor_rt || '01',
            nama_kepala_keluarga: w.status_keluarga === 'Kepala Keluarga' 
              ? w.nama_lengkap 
              : (w.kartu_keluarga?.nama_kepala_keluarga || w.nama_lengkap),
            alamat_lengkap: w.kartu_keluarga?.alamat_lengkap || w.alamat_ktp || 'RW 01 Dusun Krajan, Desa Doko',
            no_telp_rumah: w.kartu_keluarga?.no_telp_rumah || w.no_hp_wa || '-',
            status_ekonomi: w.status_ekonomi || 'Keluarga Mandiri',
            anggotaKeluarga: [w],
          });
        } else {
          const item = map.get(newKkNo);
          const exists = item.anggotaKeluarga.some((m: any) => m.id === w.id || (m.nik && m.nik === w.nik));
          if (!exists) {
            item.anggotaKeluarga.push(w);
          }
        }
      }
    });

    return Array.from(map.values());
  }, [kartuKeluargas, wargas]);

  // Derived filtered collections
  const pendingRwSurats = surats.filter((s) => ['approved_rt', 'pending_rw'].includes(s.status));
  const completedSurats = surats.filter((s) => s.status === 'completed');

  const filteredSurats = useMemo(() => {
    return surats.filter((s) => {
      const matchSearch = 
        s.nomor_resi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.warga_profile?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.surat_type?.nama_surat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.keperluan?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRt = selectedRtFilter === 'all' || s.warga_profile?.rt?.nomor_rt === selectedRtFilter;
      
      let matchStatus = true;
      if (selectedStatusFilter === 'pending') {
        matchStatus = ['approved_rt', 'pending_rw'].includes(s.status);
      } else if (selectedStatusFilter === 'completed') {
        matchStatus = s.status === 'completed';
      } else if (selectedStatusFilter === 'rejected') {
        matchStatus = s.status === 'rejected';
      }

      return matchSearch && matchRt && matchStatus;
    });
  }, [surats, searchTerm, selectedRtFilter, selectedStatusFilter]);

  const filteredWargas = useMemo(() => {
    return wargas.filter((w) => {
      const matchSearch = 
        w.nama_lengkap?.toLowerCase().includes(wargaSearch.toLowerCase()) ||
        w.nik?.toLowerCase().includes(wargaSearch.toLowerCase()) ||
        w.pekerjaan?.toLowerCase().includes(wargaSearch.toLowerCase());

      const matchGender = wargaGenderFilter === 'all' || w.jenis_kelamin === wargaGenderFilter;
      const matchRt = selectedRtFilter === 'all' || w.rt?.nomor_rt === selectedRtFilter;

      return matchSearch && matchGender && matchRt;
    });
  }, [wargas, wargaSearch, wargaGenderFilter, selectedRtFilter]);

  const filteredKkList = useMemo(() => {
    return effectiveKkList.filter((kk) => {
      const matchSearch = 
        kk.no_kk?.toLowerCase().includes(kkSearch.toLowerCase()) ||
        kk.nama_kepala_keluarga?.toLowerCase().includes(kkSearch.toLowerCase()) ||
        kk.alamat_lengkap?.toLowerCase().includes(kkSearch.toLowerCase());

      const matchRt = selectedRtFilter === 'all' || kk.nomor_rt === selectedRtFilter;

      return matchSearch && matchRt;
    });
  }, [effectiveKkList, kkSearch, selectedRtFilter]);

  // Facilities data for Territorial Map
  const facilityPins: MapFacilityItem[] = [
    {
      id: 'balai_rw',
      nama: 'Balai Warga RW 01',
      tipe: 'Pusat Koordinasi Wilayah',
      blok: 'Jalan Utama Dusun Krajan',
      pic: 'Suryanto (Ketua RW 01)',
      status: 'Buka Senin - Sabtu',
      jam: '08.00 - 20.00 WIB',
      icon: '🏛️',
      lat: -7.81792,
      lng: 112.04255,
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      desc: 'Pusat musyawarah warga RW 01, mediasi lingkungan, dan layanan administrasi terpadu tingkat RW.'
    },
    {
      id: 'pos_ronda_rw1',
      nama: 'Pos Kamling Induk RW 01',
      tipe: 'Pos Keamanan',
      blok: 'Simpang Tiga Krajan',
      pic: 'Regu Jaga Gabungan RT 01 & 02',
      status: 'Siaga 24 Jam',
      jam: '21.00 - 05.00 WIB',
      icon: '🛡️',
      lat: -7.81915,
      lng: 112.04130,
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      desc: 'Pos koordinasi keamanan wilayah terintegrasi patroli malam RT 01 dan RT 02.'
    },
    {
      id: 'posyandu_cempaka',
      nama: 'Posyandu Terpadu Cempaka RW 01',
      tipe: 'Kesehatan Balita & Lansia',
      blok: 'Balai Pertemuan Warga',
      pic: 'Kader Kesehatan RW 01',
      status: 'Jadwal Rutin Bulanan',
      jam: '08.00 - 11.30 WIB',
      icon: '🩺',
      lat: -7.81710,
      lng: 112.04380,
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      desc: 'Layanan penimbangan balita, PMT gizi gratis, serta cek kesehatan tensi dan gula darah lansia.'
    }
  ];

  // ==========================================
  // VIEW RENDERERS FOR SUBMENUS
  // ==========================================

  // 1. FOCUSED VIEW: Antrean & Verifikasi Surat RW
  if (activeSubmenu === 'verifikasi_surat' || activeSubmenu === 'persetujuan_surat') {
    return (
      <div className="space-y-6 page-enter font-sans">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                Verifikasi Surat RW 01
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">Antrean Surat Masuk dari RT</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verifikasi permohonan pengantar dari seluruh RT di wilayah RW 01 sebelum diteruskan ke Balai Desa.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-2xl bg-amber-50 text-amber-800 font-extrabold text-xs border border-amber-200 shadow-2xs">
              ⏳ {pendingRwSurats.length} Perlu Verifikasi
            </span>
            <span className="px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200 shadow-2xs">
              ✓ {completedSurats.length} Selesai & Sah
            </span>
          </div>
        </div>

        {renderSuratTableComponent()}
        {renderModals()}
      </div>
    );
  }

  // 2. FOCUSED VIEW: Riwayat Surat Sah & Selesai
  if (activeSubmenu === 'riwayat_surat') {
    return (
      <div className="space-y-6 page-enter font-sans">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                Arsip & Riwayat Resmi
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">Riwayat Surat Selesai & Tembusan RW</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar seluruh berkas pengantar warga yang telah sah diterbitkan stempel QR desa dan selesai diproses.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300">
              Total {completedSurats.length} Surat Selesai
            </span>
          </div>
        </div>

        {renderSuratTableComponent(true)}
        {renderModals()}
      </div>
    );
  }

  // 3. FOCUSED VIEW: Daftar RT di Wilayah RW
  if (activeSubmenu === 'daftar_rt') {
    return (
      <div className="space-y-6 page-enter font-sans">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              Koordinasi Rukun Tetangga
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">Daftar RT di Bawah Wilayah RW 01</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitoring pimpinan RT, data demografi per RT, dan status pelayanan administratif lingkungan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200">
              6 RT Terkoordinasi
            </span>
          </div>
        </div>

        {renderDaftarRtGrid()}
        {renderModals()}
      </div>
    );
  }

  // 4. FOCUSED VIEW: Data Warga RW
  if (activeSubmenu === 'data_warga_rw' || activeSubmenu === 'data_warga') {
    return (
      <div className="space-y-6 page-enter font-sans">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              Buku Induk Kependudukan RW
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">Data Seluruh Warga RW 01</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar identitas penduduk, nomor KK, pekerjaan, dan sebaran per RT di wilayah Dusun Doko Krajan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-2xl bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300">
              Total {wargas.length} Jiwa Terdata
            </span>
          </div>
        </div>

        {renderDataWargaTable()}
        {renderModals()}
      </div>
    );
  }

  // 5. FOCUSED VIEW: Data Keluarga (KK) RW
  if (activeSubmenu === 'data_keluarga_rw' || activeSubmenu === 'data_keluarga') {
    return (
      <div className="space-y-6 page-enter font-sans">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              Kartu Keluarga Terpadu
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">Daftar Kartu Keluarga (KK) RW 01</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Data kepala keluarga, alamat rumah, status ekonomi, dan rincian anggota keluarga.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-2xl bg-emerald-100 text-emerald-900 font-black text-xs border border-emerald-300">
              Total {effectiveKkList.length} Kartu Keluarga
            </span>
          </div>
        </div>

        {renderDataKkGrid()}
        {renderModals()}
      </div>
    );
  }

  // 6. FOCUSED VIEW: Peta Wilayah RW
  if (activeSubmenu === 'peta_wilayah_rw' || activeSubmenu === 'peta_wilayah') {
    return (
      <div className="space-y-6 page-enter font-sans">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              Geospasial & Pemetaan Wilayah
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">Peta Wilayah Lingkungan RW 01</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Denah batas teritorial RW 01, persebaran pos kamling, balai pertemuan, dan fasilitas warga Dusun Krajan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200">
              Dusun Doko Krajan
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs overflow-hidden">
          <RealRtMap
            facilities={facilityPins}
            onSelectPin={() => {}}
            wargas={wargas}
          />
        </div>
      </div>
    );
  }

  // 7. FOCUSED VIEW: Pembukuan Kas & Iuran RW
  if (activeSubmenu === 'kas_rw' || activeSubmenu === 'kas_rt') {
    return (
      <div className="space-y-6 page-enter font-sans">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              Akuntabilitas Finansial Wilayah
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">Pembukuan Kas & Iuran RW 01</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Catatan mutasi kas koordinasi lingkungan RW, iuran kegiatan warga, dan rekapitulasi transparan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowKasModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer press-down"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Mutasi Kas RW</span>
          </button>
        </div>

        {renderKasSection()}
        {renderModals()}
      </div>
    );
  }

  // 8. FOCUSED VIEW: Rekap Statistik & Demografi
  if (activeSubmenu === 'rekap_statistik') {
    return (
      <div className="space-y-6 page-enter font-sans">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              Demografi & Kependudukan
            </span>
            <h2 className="text-xl font-black text-slate-900 mt-1">Rekap Statistik Wilayah RW 01</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribusi komposisi penduduk, piramida gender, dan indikator pelayanan di Dusun Krajan.
            </p>
          </div>
        </div>

        {renderRekapStatistikSection()}
        {renderModals()}
      </div>
    );
  }

  // ==========================================
  // DEFAULT: BERANDA RW DASHBOARD
  // ==========================================
  return (
    <div className="space-y-6 page-enter font-sans">
      
      {/* 4 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <MetricStatCard
          title="Menunggu Verifikasi RW"
          value={`${pendingRwSurats.length} Berkas`}
          subvalue="Tingkat Lanjut"
          percentage={pendingRwSurats.length > 0 ? 65 : 100}
          color="amber"
          trend="SLA Rata-rata < 15 Menit"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="RT Terkoordinasi"
          value={`${rtsData.length || 2} RT Aktif`}
          subvalue="Wilayah RW 01"
          percentage={100}
          color="emerald"
          trend="RT 01 & RT 02 Sinkron"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Total Warga Wilayah RW"
          value={`${wargas.length || 980} Jiwa`}
          subvalue={`${effectiveKkList.length || 320} Kepala Keluarga`}
          percentage={96}
          color="teal"
          trend="Buku Induk Kependudukan Sah"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Surat Sah & Selesai"
          value={`${completedSurats.length} Surat`}
          subvalue="Legalisasi Balai Desa"
          percentage={100}
          color="sky"
          trend="100% Sah Bertanda Tangan QR"
          isPositiveTrend={true}
        />
      </div>

      {/* Performance Overview Spline Area Chart + Bar Activity + Profile & Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left 8 Cols: Charts */}
        <div className="xl:col-span-8 space-y-5">
          <AreaSplineChart
            title="Efisiensi Verifikasi & Pelayanan RW 01"
            subtitle="Volume Pengantar RT Masuk & Diteruskan ke Kantor Desa"
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
              subtitle="Tingkat Responsif Pelayanan RW 01"
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
                  Aksi Koordinasi Wilayah
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">Pintasan Ketua RW 01</h4>
                <p className="text-xs text-slate-500 mt-0.5">Tindakan cepat administrasi dan pemantauan wilayah.</p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowKasModal(true)}
                  className="w-full p-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition-all press-down flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Catat Iuran / Kas RW</span>
                  </span>
                  <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full">
                    Input Kas
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('antrean')}
                  className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Periksa Antrean Masuk ({pendingRwSurats.length})</span>
                  </span>
                  <span className="text-emerald-700 font-extrabold text-[11px]">
                    Verifikasi
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('warga')}
                  className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span>Buku Induk Kependudukan RW</span>
                  </span>
                  <span className="text-slate-500 text-[11px] font-mono">
                    {wargas.length} Jiwa
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Ketua RW Profile Card + Mini Calendar Widget */}
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
                  {user?.name?.charAt(0) || 'S'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 leading-snug break-words">
                  {user?.name || 'Suryanto (Ketua RW 01)'}
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
                <span className="text-slate-400 font-bold">Cakupan Wilayah:</span>
                <span className="font-extrabold text-slate-900">RT 01 s/d RT 06 Krajan</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Otoritas Validasi:</span>
                <span className="text-emerald-700 font-black">Level 2 (Tembusan / Verifikasi RW)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Terusan Resmi:</span>
                <span className="text-slate-800 font-mono font-bold">Sekretaris Desa Doko</span>
              </div>
            </div>
          </div>

          {/* Mini Calendar Widget */}
          <MiniCalendarWidget title="Kalender & Agenda RW 01" />
        </div>
      </div>

      {/* Main Tabbed Container: Antrean Surat, Koordinasi RT, Data Warga, Kas */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('antrean')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'antrean'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Antrean Surat ({pendingRwSurats.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rt')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'rt'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Koordinasi RT (6 RT)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('warga')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'warga'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Data Kependudukan ({wargas.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kas')}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'kas'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Pembukuan Kas RW</span>
            </button>
          </div>

          {/* RT Filter pill selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Filter RT:</span>
            <select
              value={selectedRtFilter}
              onChange={(e) => setSelectedRtFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Semua RT (RW 01)</option>
              <option value="01">RT 01 Krajan</option>
              <option value="02">RT 02 Krajan</option>
            </select>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'antrean' && renderSuratTableComponent()}
        {activeTab === 'rt' && renderDaftarRtGrid()}
        {activeTab === 'warga' && renderDataWargaTable()}
        {activeTab === 'kas' && renderKasSection()}
      </div>

      {renderModals()}
    </div>
  );

  // ==========================================
  // HELPER SUB-RENDERERS
  // ==========================================

  function renderSuratTableComponent(isOnlyCompleted = false) {
    const listToRender = isOnlyCompleted 
      ? filteredSurats.filter(s => s.status === 'completed')
      : filteredSurats;

    return (
      <div className="space-y-4">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {!isOnlyCompleted && (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedStatusFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Surat ({surats.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedStatusFilter === 'pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Perlu ACC RW ({pendingRwSurats.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatusFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedStatusFilter === 'completed'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  Selesai & Sah ({completedSurats.length})
                </button>
              </>
            )}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px] max-w-sm flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pemohon, NIK, jenis surat..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-2xl shadow-xs bg-white">
          <table className="w-full text-left text-xs min-w-[760px] sm:min-w-0">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5">Nomor Resi</th>
                <th className="py-3 px-3.5">Pemohon & RT Asal</th>
                <th className="py-3 px-3.5">Jenis Surat</th>
                <th className="py-3 px-3.5">Keperluan</th>
                <th className="py-3 px-3.5">Status Terkini</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap sticky right-0 bg-slate-50 z-10 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)]">
                  Aksi Persetujuan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {listToRender.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada permohonan surat yang sesuai filter.
                  </td>
                </tr>
              ) : (
                listToRender.map((s) => (
                  <tr key={s.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {s.nomor_resi}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                        {s.warga_profile?.nama_lengkap || 'Warga Doko'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>NIK: {s.warga_profile?.nik}</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-700">RT {s.warga_profile?.rt?.nomor_rt || '01'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-emerald-900 text-xs leading-snug max-w-[170px] line-clamp-2">
                        {s.surat_type?.nama_surat}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 text-xs max-w-[150px] truncate" title={s.keperluan}>
                      {s.keperluan}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
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
                         s.status === 'completed' ? '✓ Selesai & Sah' :
                         s.status === 'rejected' ? '✕ Ditolak' : s.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] transition-colors">
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
                              type="button"
                              onClick={() => handleApproveRw(s.id)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all press-down flex items-center gap-1 cursor-pointer whitespace-nowrap"
                              title="ACC & Teruskan ke Kantor Desa"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>ACC</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewSurat(s)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                              title="Tolak Permohonan"
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
                            {s.status === 'completed' ? '✓ Dokumen Sah' : '✓ Diteruskan ke Desa'}
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
    );
  }

  function renderDaftarRtGrid() {
    const listRt = [
      {
        nomor_rt: '01',
        nama_ketua: 'Supriyadi',
        telp: '0812-3456-7895',
        total_warga: wargas.filter(w => w.rt?.nomor_rt === '01').length || 185,
        total_kk: effectiveKkList.filter(kk => kk.nomor_rt === '01').length || 62,
        wilayah: 'Krajan Timur (Blok A-C)',
        status: 'Aktif Koordinasi'
      },
      {
        nomor_rt: '02',
        nama_ketua: 'Budi Santoso',
        telp: '0813-9876-5432',
        total_warga: wargas.filter(w => w.rt?.nomor_rt === '02').length || 160,
        total_kk: effectiveKkList.filter(kk => kk.nomor_rt === '02').length || 54,
        wilayah: 'Krajan Barat (Blok D-F)',
        status: 'Aktif Koordinasi'
      },
      {
        nomor_rt: '03',
        nama_ketua: 'Wahyudi Pratama',
        telp: '0815-5544-3322',
        total_warga: 172,
        total_kk: 58,
        wilayah: 'Krajan Tengah (Blok G-I)',
        status: 'Aktif Koordinasi'
      },
      {
        nomor_rt: '04',
        nama_ketua: 'Slamet Riyadi',
        telp: '0857-1122-3344',
        total_warga: 154,
        total_kk: 50,
        wilayah: 'Krajan Utara',
        status: 'Aktif Koordinasi'
      },
      {
        nomor_rt: '05',
        nama_ketua: 'Agus Setiawan',
        telp: '0812-9988-7766',
        total_warga: 168,
        total_kk: 56,
        wilayah: 'Krajan Selatan',
        status: 'Aktif Koordinasi'
      },
      {
        nomor_rt: '06',
        nama_ketua: 'Darmawan',
        telp: '0813-4455-6677',
        total_warga: 141,
        total_kk: 48,
        wilayah: 'Krajan Perbatasan',
        status: 'Aktif Koordinasi'
      }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {listRt.map((rt) => (
          <div key={rt.nomor_rt} className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/90 hover:border-emerald-300 transition-all shadow-2xs space-y-3.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-emerald-700 text-white font-black text-xs shadow-2xs">
                  RT {rt.nomor_rt}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ● {rt.status}
                </span>
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-base">{rt.nama_ketua}</h4>
                <div className="text-xs text-slate-500 font-medium">Ketua RT {rt.nomor_rt} Dusun Krajan</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
              <div className="p-2.5 rounded-2xl bg-white border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Jumlah Warga</div>
                <div className="text-sm font-black text-slate-900">{rt.total_warga} Jiwa</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Kepala Keluarga</div>
                <div className="text-sm font-black text-slate-900">{rt.total_kk} KK</div>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
              <span className="font-medium text-slate-600 truncate">{rt.wilayah}</span>
              <a 
                href={`https://wa.me/${rt.telp.replace(/[^0-9]/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0"
              >
                <Phone className="w-3 h-3" />
                <span>Kontak</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderDataWargaTable() {
    return (
      <div className="space-y-4">
        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Gender:</span>
            <select
              value={wargaGenderFilter}
              onChange={(e) => setWargaGenderFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
            >
              <option value="all">Semua Gender</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div className="relative min-w-[240px] max-w-sm flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={wargaSearch}
              onChange={(e) => setWargaSearch(e.target.value)}
              placeholder="Cari NIK, nama warga, pekerjaan..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Table of Wargas */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-2xl shadow-xs bg-white">
          <table className="w-full text-left text-xs min-w-[700px] sm:min-w-0">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5">Nama Lengkap & NIK</th>
                <th className="py-3 px-3.5">RT / RW</th>
                <th className="py-3 px-3.5">Gender</th>
                <th className="py-3 px-3.5">Pekerjaan</th>
                <th className="py-3 px-3.5">Status Keluarga</th>
                <th className="py-3 px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredWargas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada data warga terdaftar.
                  </td>
                </tr>
              ) : (
                filteredWargas.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">{w.nama_lengkap}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">NIK: {w.nik}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="font-bold text-emerald-800">
                        RT {w.rt?.nomor_rt || '01'} / RW 01
                      </span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        w.jenis_kelamin === 'L' ? 'bg-sky-50 text-sky-800' : 'bg-rose-50 text-rose-800'
                      }`}>
                        {w.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 truncate max-w-[150px]">
                      {w.pekerjaan || 'Wiraswasta'}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600">
                      {w.status_keluarga || 'Anggota Keluarga'}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedWargaDetail(w)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Detail Profil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderDataKkGrid() {
    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex justify-end">
          <div className="relative min-w-[240px] max-w-sm w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={kkSearch}
              onChange={(e) => setKkSearch(e.target.value)}
              placeholder="Cari No KK, kepala keluarga..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* KK Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredKkList.map((kk) => (
            <div key={kk.id} className="p-5 rounded-3xl bg-slate-50/70 border border-slate-200/90 hover:border-emerald-300 transition-all shadow-2xs space-y-3.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                    No KK: {kk.no_kk}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    RT {kk.nomor_rt || '01'}
                  </span>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">{kk.nama_kepala_keluarga}</h4>
                  <div className="text-xs text-slate-500 truncate">{kk.alamat_lengkap}</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Anggota Terdaftar:</span>
                <span className="font-black text-emerald-800">{kk.anggotaKeluarga?.length || 1} Jiwa</span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedKkDetail(kk)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer press-down"
              >
                <span>Lihat Anggota Keluarga</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderKasSection() {
    const totalMasuk = kasData?.summary?.total_masuk || 18500000;
    const totalKeluar = kasData?.summary?.total_keluar || 7200000;
    const saldo = kasData?.summary?.saldo || (totalMasuk - totalKeluar);
    const transactions = kasData?.transactions || [];

    return (
      <div className="space-y-5">
        {/* Kas Metric Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-emerald-700 text-white shadow-xs space-y-1.5">
            <div className="text-xs font-bold text-emerald-200 uppercase">Total Saldo Kas RW 01</div>
            <div className="text-2xl font-black">Rp {saldo.toLocaleString('id-ID')}</div>
            <div className="text-[10px] text-emerald-100">Akumulasi Iuran & Rekapitulasi Kas Lingkungan</div>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
            <div className="text-xs font-bold text-emerald-700 uppercase">Total Pemasukan</div>
            <div className="text-2xl font-black text-slate-900">Rp {totalMasuk.toLocaleString('id-ID')}</div>
            <div className="text-[10px] text-slate-400">Iuran Sampah, Siskamling & Sumbangan</div>
          </div>
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
            <div className="text-xs font-bold text-rose-600 uppercase">Total Pengeluaran</div>
            <div className="text-2xl font-black text-slate-900">Rp {totalKeluar.toLocaleString('id-ID')}</div>
            <div className="text-[10px] text-slate-400">Perawatan Lampu Jalan & Gotong Royong</div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-2xl shadow-xs bg-white">
          <table className="w-full text-left text-xs min-w-[650px] sm:min-w-0">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3.5">Tanggal</th>
                <th className="py-3 px-3.5">Tipe & Kategori</th>
                <th className="py-3 px-3.5">Keterangan</th>
                <th className="py-3 px-3.5 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Belum ada transaksi kas RW yang tercatat.
                  </td>
                </tr>
              ) : (
                transactions.map((t: any) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {new Date(t.tanggal_transaksi).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        t.tipe === 'Pemasukan' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                      }`}>
                        {t.tipe}
                      </span>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">{t.category?.nama_kategori || 'Kas Wilayah'}</div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-800 font-bold max-w-[280px]">
                      {t.keterangan}
                    </td>
                    <td className={`py-3 px-3.5 text-right font-black whitespace-nowrap ${
                      t.tipe === 'Pemasukan' ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {t.tipe === 'Pemasukan' ? '+' : '-'} Rp {Number(t.jumlah).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderRekapStatistikSection() {
    const totalPria = wargas.filter(w => w.jenis_kelamin === 'L').length || 490;
    const totalWanita = wargas.filter(w => w.jenis_kelamin === 'P').length || 490;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <h4 className="text-base font-black text-slate-900">Komposisi Gender RW 01</h4>
          <div className="flex items-center justify-around py-4">
            <div className="text-center">
              <div className="text-3xl font-black text-sky-700">{totalPria}</div>
              <div className="text-xs font-bold text-slate-500 mt-1">Laki-laki (50%)</div>
            </div>
            <div className="h-12 w-px bg-slate-200"></div>
            <div className="text-center">
              <div className="text-3xl font-black text-rose-600">{totalWanita}</div>
              <div className="text-xs font-bold text-slate-500 mt-1">Perempuan (50%)</div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <h4 className="text-base font-black text-slate-900">Sebaran RT di Bawah RW 01</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50">
              <span className="font-bold text-slate-700">RT 01 Krajan</span>
              <span className="font-black text-emerald-800">185 Jiwa (62 KK)</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50">
              <span className="font-bold text-slate-700">RT 02 Krajan</span>
              <span className="font-black text-emerald-800">160 Jiwa (54 KK)</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50">
              <span className="font-bold text-slate-700">RT 03 Krajan</span>
              <span className="font-black text-emerald-800">172 Jiwa (58 KK)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MODALS CONTAINER
  // ==========================================
  function renderModals() {
    return (
      <>
        {/* 1. Preview Surat & Lampiran Modal */}
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

        {/* 2. Modal Detail Warga */}
        {selectedWargaDetail && createPortal(
          <div 
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs font-sans overflow-y-auto animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedWargaDetail(null);
            }}
          >
            <div 
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up border border-slate-200 flex flex-col my-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 leading-tight">Detail Identitas Warga</h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">NIK: {selectedWargaDetail.nik}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedWargaDetail(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 font-bold block">Nama Lengkap</span>
                    <span className="text-slate-900 font-black text-sm">{selectedWargaDetail.nama_lengkap}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Jenis Kelamin</span>
                    <span className="text-slate-900 font-bold">{selectedWargaDetail.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Tempat, Tgl Lahir</span>
                    <span className="text-slate-900 font-bold">{selectedWargaDetail.tempat_lahir || 'Kediri'}, {selectedWargaDetail.tanggal_lahir || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Pekerjaan</span>
                    <span className="text-slate-900 font-bold">{selectedWargaDetail.pekerjaan || 'Wiraswasta'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Agama</span>
                    <span className="text-slate-900 font-bold">{selectedWargaDetail.agama || 'Islam'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Status Perkawinan</span>
                    <span className="text-slate-900 font-bold">{selectedWargaDetail.status_perkawinan || 'Kawin'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold block text-[11px]">Alamat Terdaftar</span>
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {selectedWargaDetail.alamat_ktp || 'RT 01 / RW 01 Dusun Krajan, Desa Doko, Kec. Ngasem, Kediri'}
                  </p>
                </div>
              </div>

              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedWargaDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* 3. Modal Detail Anggota KK */}
        {selectedKkDetail && createPortal(
          <div 
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs font-sans overflow-y-auto animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedKkDetail(null);
            }}
          >
            <div 
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-scale-up border border-slate-200 flex flex-col my-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 leading-tight">Daftar Anggota Kartu Keluarga</h3>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">No KK: {selectedKkDetail.no_kk}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedKkDetail(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-slate-400 font-bold text-[11px]">Kepala Keluarga: <strong className="text-slate-900 font-black">{selectedKkDetail.nama_kepala_keluarga}</strong></div>
                  <div className="text-slate-500 leading-relaxed">{selectedKkDetail.alamat_lengkap}</div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="p-3">Nama Anggota</th>
                        <th className="p-3">NIK</th>
                        <th className="p-3">Hubungan</th>
                        <th className="p-3">Gender</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedKkDetail.anggotaKeluarga?.map((m: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{m.nama_lengkap}</td>
                          <td className="p-3 font-mono text-slate-500">{m.nik}</td>
                          <td className="p-3 text-slate-700 font-medium">{m.status_keluarga || 'Anggota'}</td>
                          <td className="p-3">{m.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedKkDetail(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        {/* 4. Modal Catat Kas RW */}
        {showKasModal && createPortal(
          <div 
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs font-sans overflow-y-auto animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowKasModal(false);
            }}
          >
            <div 
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up border border-slate-200 flex flex-col my-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 leading-tight">Catat Mutasi Kas RW 01</h3>
                    <div className="text-[11px] text-slate-400 font-medium">Pembukuan Transparan Lingkungan</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKasModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveKas} className="p-6 space-y-4 text-xs">
                {kasError && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{kasError}</span>
                  </div>
                )}
                {kasSuccess && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{kasSuccess}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">Tipe Transaksi</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setKasTipe('Pemasukan')}
                      className={`py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                        kasTipe === 'Pemasukan'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      + Pemasukan Kas
                    </button>
                    <button
                      type="button"
                      onClick={() => setKasTipe('Pengeluaran')}
                      className={`py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                        kasTipe === 'Pengeluaran'
                          ? 'bg-rose-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      - Pengeluaran Kas
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">Nominal (Rp)</label>
                  <input
                    type="number"
                    min="1000"
                    value={kasJumlah}
                    onChange={(e) => setKasJumlah(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Contoh: 150000"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={kasTanggal}
                    onChange={(e) => setKasTanggal(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-bold mb-1.5">Keterangan Transaksi</label>
                  <textarea
                    rows={3}
                    value={kasKeterangan}
                    onChange={(e) => setKasKeterangan(e.target.value)}
                    placeholder="Contoh: Iuran kegiatan kerja bakti RW 01..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer press-down"
                  >
                    {isProcessing ? 'Menyimpan...' : 'Simpan Transaksi Kas RW'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }
};
