import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Newspaper, 
  Search, 
  Calendar, 
  Eye, 
  ChevronRight, 
  ChevronDown,
  BellRing, 
  ShieldCheck, 
  CheckCircle2, 
  Check,
  X, 
  Filter, 
  ArrowUpDown, 
  SlidersHorizontal,
  Globe,
  Building2,
  HardHat,
  HeartPulse,
  ShoppingBag,
  Users,
  TrendingUp,
  Clock,
  LayoutGrid,
  List
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { Berita, Pengumuman } from '@/shared/types';
import { Pagination } from '@/shared/components/Pagination';

const defaultBeritas: Berita[] = [
  {
    id: 1,
    judul: 'Desa Doko Ngasem Luncurkan Sistem Pelayanan Publik Digital Terpadu SIDes',
    slug: 'desa-doko-luncurkan-sistem-pelayanan-publik-digital-sides',
    kategori: 'Pemerintahan',
    ringkasan: 'Sebagai upaya meningkatkan efisiensi dan transparansi, Pemerintah Desa Doko resmi mengadopsi platform digital desa terintegrasi dari tingkat RT hingga Kantor Desa.',
    konten: 'Pemerintah Desa Doko, Kecamatan Ngasem, Kabupaten Kediri melakukan inovasi pelayanan birokrasi masyarakat berbasis digital. Melalui platform SiDesKu, warga tidak lagi perlu membawa berkas fisik. Seluruh permohonan surat dari persetujuan RT hingga legalisasi Kepala Desa diproses secara online dan sah diakui.',
    view_count: 342,
    is_published: true,
    published_at: '2026-08-15T08:00:00.000000Z',
  },
  {
    id: 2,
    judul: 'Penyelesaian Drainase & Rabat Beton Dusun Krajan Menuju Ketahanan Iklim',
    slug: 'penyelesaian-drainase-rabat-beton-dusun-krajan',
    kategori: 'Pembangunan',
    ringkasan: 'Pemerintah Desa Doko menuntaskan revitalisasi saluran air dan drainase lingkungan sepanjang 450 meter dengan dana desa mandiri tahun 2026.',
    konten: 'Dusun Krajan, Desa Doko resmi merampungkan proyek infrastruktur drainase dan rabat beton jalan gang. Proyek ini bertujuan mencegah genangan air saat curah hujan tinggi serta memperlancar akses mobilitas warga ke jalan utama desa. Pembangunan dikerjakan secara swakelola dengan melibatkan tenaga kerja warga setempat.',
    view_count: 256,
    is_published: true,
    published_at: '2026-08-14T09:30:00.000000Z',
  },
  {
    id: 3,
    judul: 'Pemeriksaan Kesehatan Gratis & Penyaluran PMT Balita Posyandu Desa Doko',
    slug: 'pemeriksaan-kesehatan-gratis-pmt-balita',
    kategori: 'Kesehatan',
    ringkasan: 'Pelaksanaan posyandu serentak di 8 pos pelayanan Desa Doko mencatat kehadiran 140 balita dan 85 lansia dengan pemberian asupan gizi lengkap.',
    konten: 'Dalam rangka mendukung program zero stunting Kabupaten Kediri, Kader Kesehatan Desa Doko bekerja sama dengan Puskesmas Ngasem menggelar posyandu terpadu. Selain timbang berat dan ukur tinggi badan, dibagikan susu formula, telur, dan buah segar untuk balita serta cek tensi dan gula darah gratis bagi lansia.',
    view_count: 412,
    is_published: true,
    published_at: '2026-08-12T07:45:00.000000Z',
  },
  {
    id: 4,
    judul: 'Gelar Bazar Produk Unggulan BUMDes Doko Makmur Tembus Pasar Digital',
    slug: 'bazar-produk-unggulan-bumdes-doko-makmur',
    kategori: 'UMKM',
    ringkasan: 'Produk anyaman bambu, olahan pangan kedelai, dan kerajinan mebel khas Desa Doko dipamerkan dalam bazar dan mulai dipasarkan secara online.',
    konten: 'BUMDes Doko Makmur sukses menyelenggarakan expo UMKM di pelataran Balai Desa Doko. Puluhan perajin lokal memamerkan karya terbaik mereka, didukung dengan fasilitasi barcode pembayaran QRIS dan etalase digital SIDes untuk memperluas jangkauan pasar hingga luar Kabupaten Kediri.',
    view_count: 520,
    is_published: true,
    published_at: '2026-08-10T10:00:00.000000Z',
  },
  {
    id: 5,
    judul: 'Gotong Royong Bersih Saluran Air & Tradisi Sambut Musim Tanam 2026',
    slug: 'gotong-royong-bersih-saluran-air-musim-tanam',
    kategori: 'Sosial',
    ringkasan: 'Ratusan warga di 3 dusun turun ke sawah dan saluran irigasi menggelar kerja bakti massal menjaga kebersihan lingkungan desa.',
    konten: 'Semangat kebersamaan dan kegotongroyongan terus hidup di Desa Doko. Menyambut musim tanam padi tahun 2026, warga bersama jajaran pamong desa membersihkan gulma saluran tersier demi kelancaran pengairan 140 hektar sawah produktif.',
    view_count: 310,
    is_published: true,
    published_at: '2026-08-08T06:30:00.000000Z',
  },
  {
    id: 6,
    judul: 'Musyawarah Rencana Pembangunan Desa (Musrenbangdes) 2027 Resmi Dibuka',
    slug: 'musrenbangdes-doko-2027-resmi-dibuka',
    kategori: 'Pemerintahan',
    ringkasan: 'Kepala Desa bersama BPD dan delegasi RT/RW merumuskan prioritas usulan pembangunan dan transformasi ekonomi desa tahun anggaran mendatang.',
    konten: 'Musrenbangdes Doko menetapkan fokus kerja utama pada penguatan ketahanan pangan lokal, beasiswa pendidikan bagi keluarga pra-sejahtera, serta perluasan akses internet gratis di seluruh balai RW desa.',
    view_count: 184,
    is_published: true,
    published_at: '2026-08-16T13:00:00.000000Z',
  },
];

const categoryConfigs = [
  { id: 'Semua', label: 'Semua Kategori Warta', shortLabel: 'Semua', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'Pemerintahan', label: 'Pemerintahan Desa', shortLabel: 'Pemerintahan', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'Pembangunan', label: 'Pembangunan & Sarpras', shortLabel: 'Pembangunan', icon: HardHat, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'Kesehatan', label: 'Kesehatan & Posyandu', shortLabel: 'Kesehatan', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'UMKM', label: 'UMKM & Ekonomi Kreatif', shortLabel: 'UMKM', icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'Sosial', label: 'Sosial & Kemasyarakatan', shortLabel: 'Sosial', icon: Users, color: 'text-teal-600', bg: 'bg-teal-50' },
];

const sortConfigs = [
  { id: 'terbaru', label: 'Terbaru (Terkini)', desc: 'Publikasi warta paling anyar', icon: ArrowUpDown, color: 'text-emerald-600' },
  { id: 'terpopuler', label: 'Paling Banyak Dibaca', desc: 'Artikel paling diminati warga', icon: TrendingUp, color: 'text-amber-600' },
  { id: 'terlama', label: 'Terlama (Arsip)', desc: 'Arsip publikasi terdahulu', icon: Clock, color: 'text-slate-500' },
];

export const BeritaPage: React.FC = () => {
  const [beritas, setBeritas] = useState<Berita[]>(defaultBeritas);
  const [pengumumans, setPengumumans] = useState<Pengumuman[]>([]);
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [sortBy, setSortBy] = useState('terbaru');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBerita, setSelectedBerita] = useState<Berita | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedKategori, searchQuery, sortBy]);

  // Custom Dropdown Popover States & Click Outside
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll and handle ESC key when modal is open
  useEffect(() => {
    if (selectedBerita) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSelectedBerita(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedBerita]);

  const categories = ['Semua', 'Pemerintahan', 'Pembangunan', 'Kesehatan', 'UMKM', 'Sosial'];
  const activeCategory = categoryConfigs.find(c => c.id.toLowerCase() === selectedKategori.toLowerCase()) || categoryConfigs[0];
  const activeSort = sortConfigs.find(s => s.id === sortBy) || sortConfigs[0];

  useEffect(() => {
    const fetchBerita = async () => {
      try {
        const [beritaRes, pengumumanRes] = await Promise.all([
          api.get('/public/beritas'),
          api.get('/public/pengumumans'),
        ]);

        if (beritaRes.data?.success && Array.isArray(beritaRes.data.data) && beritaRes.data.data.length > 0) {
          // Merge with default list to guarantee rich coverage across all categories
          const fetched: Berita[] = beritaRes.data.data;
          const merged = [...fetched];
          defaultBeritas.forEach((db) => {
            if (!merged.some(m => m.id === db.id || m.slug === db.slug)) {
              merged.push(db);
            }
          });
          setBeritas(merged);
        }
        if (pengumumanRes.data?.success && Array.isArray(pengumumanRes.data.data)) {
          setPengumumans(pengumumanRes.data.data);
        }
      } catch {
        // Fallback to rich defaults
      }
    };
    fetchBerita();
  }, []);

  const formatBeritaDate = (dateStr?: string | null): string => {
    if (!dateStr) return 'Terkini';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Terkini';
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return 'Terkini';
    }
  };

  const filteredBeritas = (beritas || [])
    .filter((b) => {
      if (!b) return false;
      const cat = b.kategori || 'Pemerintahan';
      const judul = b.judul || '';
      const ringkasan = b.ringkasan || '';
      const konten = b.konten || '';
      const matchCat = selectedKategori === 'Semua' || cat.toLowerCase() === selectedKategori.toLowerCase();
      const matchSearch = judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (ringkasan || konten).toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'terpopuler') {
        return (b?.view_count || 0) - (a?.view_count || 0);
      }
      const timeA = a?.published_at ? new Date(a.published_at).getTime() : 0;
      const timeB = b?.published_at ? new Date(b.published_at).getTime() : 0;
      if (sortBy === 'terlama') {
        return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
      }
      // default: terbaru
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });

  const pageSize = 6;
  const paginatedBeritas = filteredBeritas.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="page-enter relative w-full overflow-hidden flex flex-col font-sans text-slate-800">
      
      {/* Div 1: Clean Ambient Hero Section with SVG Vectors (Canvas Mint) */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-16 sm:pb-20 overflow-hidden">
        {/* SVG Ambient Concentric Watermark Vectors */}
        <svg className="absolute -right-20 -top-20 w-[500px] h-[500px] text-emerald-200/35 pointer-events-none -z-10" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="90" stroke="currentColor" strokeWidth="1" />
          <circle cx="200" cy="200" r="40" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg className="absolute -left-20 top-1/4 w-[420px] h-[420px] text-teal-200/25 pointer-events-none -z-10" viewBox="0 0 400 400" fill="none">
          <path d="M 0,200 Q 100,70 200,200 T 400,200" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 0,230 Q 100,100 200,230 T 400,230" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
        </svg>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column (60% Fibonacci): Title and Description */}
          <div className="lg:col-span-7 space-y-3 text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Warta &{' '}
              <span className="relative whitespace-nowrap text-emerald-700 inline-block">
                Kabar Terkini
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-400" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0 15 Q 50 0, 100 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium max-w-xl">
              Kabar terkini, agenda pembangunan, dan pengumuman resmi Desa Doko.
            </p>
          </div>

          {/* Right Column (40% Fibonacci): Featured News Card Preview */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="w-full max-w-md animate-float-gentle">
              <div className="card-elevated-mockup p-6 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-900/5 space-y-4">
                
                {/* Top Bar with Badge */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                      <Newspaper className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-xs text-slate-900 leading-tight">
                        Liputan Khusus
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold">
                        Desa Doko, Kediri
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-200">
                    Terbit Hari Ini
                  </span>
                </div>

                {/* Featured Snippet */}
                <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Pembangunan</span>
                    <span className="text-[10px] text-slate-400 font-medium">Bulan Ini</span>
                  </div>
                  <h4 className="font-black text-slate-900 leading-snug">
                    Penyelesaian Drainase Dusun Krajan Menuju Ketahanan Iklim
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    Pemerintah Desa Doko menuntaskan revitalisasi saluran air sepanjang 450 meter dengan dana desa mandiri.
                  </p>
                </div>

                {/* Trust Badge */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Arsip Publik Transparan</span>
                  </span>
                  <span className="font-bold text-slate-700">100% Akurat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Filter Bar - Straddling Seam Line (Fibonacci Golden Ratio) */}
      <div className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mb-[48px] sm:-mb-[54px]">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] border border-slate-200/90 p-4 sm:p-5 shadow-xl shadow-slate-900/10 space-y-3.5">
          
          {/* Main Filter Controls Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            
            {/* Search Box (5 cols) */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari judul warta atau topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Custom Category Dropdown Popover (4 cols) */}
            <div className="md:col-span-4 relative" ref={categoryRef}>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryOpen(prev => !prev);
                  setIsSortOpen(false);
                }}
                className={`w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                  isCategoryOpen 
                    ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-white' 
                    : 'border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <activeCategory.icon className={`w-3.5 h-3.5 flex-shrink-0 ${activeCategory.color}`} />
                  <span className="text-xs font-bold truncate">
                    {activeCategory.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-600 font-extrabold">
                    {selectedKategori === 'Semua' 
                      ? beritas.length 
                      : beritas.filter(b => b.kategori?.toLowerCase() === selectedKategori.toLowerCase()).length}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isCategoryOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                </div>
              </button>

              {/* Custom Popover Menu */}
              {isCategoryOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 max-w-[90vw] bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 p-2 z-50 ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span>Pilih Kategori Warta</span>
                    <span className="text-emerald-700 font-bold">{beritas.length} Total</span>
                  </div>
                  <div className="space-y-1">
                    {categoryConfigs.map((cat) => {
                      const count = cat.id === 'Semua' 
                        ? beritas.length 
                        : beritas.filter(b => b.kategori?.toLowerCase() === cat.id.toLowerCase()).length;
                      const isSelected = selectedKategori.toLowerCase() === cat.id.toLowerCase();
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedKategori(cat.id);
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-950 font-black border border-emerald-200/70 shadow-2xs'
                              : 'text-slate-700 hover:bg-slate-100/80 font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-6 h-6 rounded-lg ${cat.bg} flex items-center justify-center`}>
                              <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                            </div>
                            <span>{cat.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                              isSelected ? 'bg-emerald-200/80 text-emerald-900' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {count}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Sort Dropdown Popover (3 cols) */}
            <div className="md:col-span-3 relative" ref={sortRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSortOpen(prev => !prev);
                  setIsCategoryOpen(false);
                }}
                className={`w-full flex items-center justify-between pl-3.5 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/90 rounded-2xl border transition-all cursor-pointer shadow-2xs ${
                  isSortOpen 
                    ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-white' 
                    : 'border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {activeSort?.icon ? (
                    React.createElement(activeSort.icon as any, {
                      className: `w-3.5 h-3.5 flex-shrink-0 ${activeSort.color}`
                    })
                  ) : (
                    <ArrowUpDown className={`w-3.5 h-3.5 flex-shrink-0 ${activeSort?.color || 'text-emerald-600'}`} />
                  )}
                  <span className="text-xs font-bold truncate">
                    {activeSort?.label}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1 ${isSortOpen ? 'rotate-180 text-emerald-600' : ''}`} />
              </button>

              {/* Custom Popover Menu */}
              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 max-w-[90vw] bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 p-2 z-50 ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Urutkan Berdasarkan
                  </div>
                  <div className="space-y-1">
                    {sortConfigs.map((item) => {
                      const isSelected = sortBy === item.id;
                      const Icon = item.icon as any;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSortBy(item.id);
                            setIsSortOpen(false);
                          }}
                          className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/70 shadow-2xs'
                              : 'text-slate-700 hover:bg-slate-100/80'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                              {Icon ? (
                                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                              ) : (
                                <ArrowUpDown className={`w-3.5 h-3.5 ${item.color}`} />
                              )}
                            </div>
                            <div>
                              <div className={`text-xs ${isSelected ? 'font-black text-emerald-950' : 'font-bold text-slate-800'}`}>
                                {item.label}
                              </div>
                              <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                                {item.desc}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Quick Category Chips & Active Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
              <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1 flex-shrink-0">
                <SlidersHorizontal className="w-3 h-3 text-emerald-600" />
                <span>Kategori Cepat:</span>
              </span>
              {categoryConfigs.map((cat) => {
                const count = cat.id === 'Semua' ? beritas.length : beritas.filter(b => b.kategori?.toLowerCase() === cat.id.toLowerCase()).length;
                const isSelected = selectedKategori.toLowerCase() === cat.id.toLowerCase();
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedKategori(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100/90 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/60'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`} />
                    <span>{cat.shortLabel}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-white text-slate-500 font-extrabold'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Actions: Reset Button (only shown when filters active) */}
            {(selectedKategori !== 'Semua' || searchQuery || sortBy !== 'terbaru') && (
              <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedKategori('Semua');
                    setSearchQuery('');
                    setSortBy('terbaru');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-[11px] border border-rose-200 transition-colors cursor-pointer shadow-2xs"
                >
                  <X className="w-3 h-3" />
                  <span>Reset Filter</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Div 2: Berita Grid & Headline (Full-Width Pure White Band) */}
      <section className="w-full bg-white pt-20 sm:pt-24 pb-16 sm:pb-24 border-y border-slate-200/80 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Active Filter Results Counter & Single Mode Icon Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span>
                Menampilkan <strong className="text-slate-900 font-black">{filteredBeritas.length}</strong> warta{' '}
                {selectedKategori !== 'Semua' && (
                  <>kategori <span className="text-emerald-700 font-bold">"{selectedKategori}"</span></>
                )}
                {searchQuery && (
                  <> dengan kata kunci <span className="text-emerald-700 font-bold">"{searchQuery}"</span></>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-[11px] text-slate-400 hidden sm:block">
                Urutan: <span className="text-slate-700 font-bold">{sortBy === 'terpopuler' ? 'Paling Populer' : sortBy === 'terlama' ? 'Terlama' : 'Terkini'}</span>
              </div>

              {/* Segmented View Mode Toggle: Grid vs List */}
              <div className="flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Grid Kartu"
                  aria-label="Tampilan Grid Kartu"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden xs:inline text-[11px]">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan List Warta"
                  aria-label="Tampilan List Warta"
                >
                  <List className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden xs:inline text-[11px]">List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Conditional Layout: List View vs Grid Kartu */}
          {viewMode === 'list' ? (
            filteredBeritas.length > 0 ? (
              <div className="max-w-4xl mx-auto divide-y divide-slate-100">
                {paginatedBeritas.map((b, idx) => {
                  const thumb = idx % 3 === 0 ? '/images/event.jpg' : idx % 3 === 1 ? '/images/kursus.jpg' : '/images/landing/about_img.webp';
                  const relativeTimes = ['12 menit lalu', '50 menit lalu', '53 menit lalu', '2 jam lalu', '5 jam lalu', '1 hari lalu'];
                  const relTime = relativeTimes[idx % relativeTimes.length];
                  const isRekomendasi = idx % 2 === 0;

                  return (
                    <article
                      key={b.id}
                      onClick={() => setSelectedBerita(b)}
                      className="group flex flex-row items-start gap-3.5 sm:gap-6 py-4 sm:py-5 cursor-pointer transition-all hover:bg-slate-50/80 p-2 sm:p-3 rounded-2xl"
                    >
                      {/* Left Thumbnail: Compact square on mobile, wide on desktop */}
                      <div className="w-24 h-24 xs:w-28 xs:h-28 sm:w-60 md:w-72 sm:h-36 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-2xs group-hover:shadow-md transition-all relative">
                        <img
                          src={thumb}
                          alt={b.judul}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Right Content */}
                      <div className="flex-1 flex flex-col justify-between self-stretch py-0.5 min-w-0">
                        <div className="space-y-1 sm:space-y-1.5">
                          {/* Top Badge: Rekomendasi or Category & Relative Time */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-block px-2 sm:px-2.5 py-0.5 rounded-md font-bold text-[10px] sm:text-xs tracking-wide ${
                              isRekomendasi 
                                ? 'bg-sky-50 text-sky-700' 
                                : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {isRekomendasi ? 'Rekomendasi' : b.kategori}
                            </span>
                            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                              {relTime}
                            </span>
                          </div>

                          {/* Title: 2 lines clamp, crisp bold font */}
                          <h3 className="font-bold text-xs xs:text-sm sm:text-lg text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                            {b.judul}
                          </h3>

                          {/* Desktop Excerpt */}
                          {b.ringkasan && (
                            <p className="hidden md:line-clamp-2 text-xs text-slate-500 leading-relaxed pt-0.5">
                              {b.ringkasan}
                            </p>
                          )}
                        </div>

                        {/* Bottom Meta: Category & Published Date */}
                        <div className="pt-2 sm:pt-3 text-[10px] sm:text-xs text-slate-500 font-medium flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-400">
                            <span className="font-semibold text-slate-700">
                              {b.kategori}
                            </span>
                            <span>•</span>
                            <span>{formatBeritaDate(b.published_at)}</span>
                          </div>
                          <span className="hidden sm:flex items-center gap-1 text-slate-400">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            {b.view_count || 120} views
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400 space-y-3 max-w-md mx-auto">
                <Newspaper className="w-10 h-10 mx-auto text-slate-300" />
                <div className="font-bold text-sm text-slate-700">Tidak ada warta yang sesuai</div>
                <p className="text-xs text-slate-500">
                  Tidak ditemukan berita dengan kategori atau kata kunci tersebut. Silakan ubah filter atau tekan tombol reset.
                </p>
              </div>
            )
          ) : (
            /* Grid View */
            <>
              {/* Featured Headline Article (Only when on 'Semua' without search query and on first page) */}
              {selectedKategori === 'Semua' && !searchQuery && filteredBeritas.length > 0 && currentPage === 1 && (
                <div className="bg-slate-50/80 rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:border-emerald-300 transition-all grid grid-cols-1 lg:grid-cols-12 gap-0 group">
                  <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full overflow-hidden bg-slate-900">
                    <img
                      src="/images/event.jpg"
                      alt={filteredBeritas[0].judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-emerald-600 text-white text-[11px] font-black uppercase px-3.5 py-1 rounded-full shadow-md">
                      Berita Utama Terkini
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {filteredBeritas[0].kategori}
                        </span>
                        <span>•</span>
                        <span>{formatBeritaDate(filteredBeritas[0].published_at)}</span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                        {filteredBeritas[0].judul}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-4">
                        {filteredBeritas[0].ringkasan || filteredBeritas[0].konten}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200/60">
                      <button
                        onClick={() => setSelectedBerita(filteredBeritas[0])}
                        className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-xs press-down flex items-center gap-2 cursor-pointer"
                      >
                        <span>Baca selengkapnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Berita Cards Grid */}
              {filteredBeritas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedBeritas.map((b, idx) => {
                    const thumb = idx % 3 === 0 ? '/images/event.jpg' : idx % 3 === 1 ? '/images/kursus.jpg' : '/images/landing/about_img.webp';
                    return (
                      <div key={b.id} className="bg-slate-50/60 hover:bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                        <div className="h-48 w-full overflow-hidden bg-gray-100 relative">
                          <img
                            src={thumb}
                            alt={b.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-3 left-3 text-[10px] font-black text-emerald-950 bg-white/95 px-2.5 py-1 rounded-full shadow-2xs">
                            {b.kategori}
                          </span>
                        </div>

                        <div className="p-5 space-y-3 flex-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                              {formatBeritaDate(b.published_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              {b.view_count || 120} views
                            </span>
                          </div>

                          <h3 className="font-black text-base text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                            {b.judul}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                            {b.ringkasan || b.konten}
                          </p>
                        </div>

                        <div className="p-5 pt-0">
                          <button
                            onClick={() => setSelectedBerita(b)}
                            className="w-full py-2.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-black transition-colors flex items-center justify-center gap-1 border border-slate-200/80 cursor-pointer shadow-2xs"
                          >
                            Baca selengkapnya <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-3xl border border-slate-200 p-10 text-center text-xs text-slate-400 space-y-3 max-w-md mx-auto">
                  <Newspaper className="w-10 h-10 mx-auto text-slate-300" />
                  <div className="font-bold text-sm text-slate-700">Tidak ada warta</div>
                  <p className="text-xs text-slate-500">
                    Tidak ditemukan berita untuk filter yang dipilih.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedKategori('Semua');
                      setSearchQuery('');
                      setSortBy('terbaru');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Reset filter
                  </button>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredBeritas.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="warta desa"
            className="pt-6"
          />
        </div>
      </section>

      {/* Div 3: Pengumuman Resmi & Agenda Warga (Full-Width Emerald Background Banner Band) */}
      <section className="w-full bg-gradient-to-b from-[#065f46] via-[#047857] to-[#064e3b] py-16 sm:py-24 text-white relative overflow-hidden">
        {/* Concentric Circle Orbit Watermark */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-black border border-white/20">
              <BellRing className="w-3.5 h-3.5 text-emerald-300" />
              <span>AGENDA & PENGUMUMAN RESMI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Pengumuman Pemerintah Desa Doko
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
              Agenda penting masyarakat desa, kerja bakti lingkungan RT/RW, dan jadwal pelayanan terpadu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pengumumans.length > 0 ? (
              pengumumans.map((p) => (
                <div key={p.id} className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-950 bg-emerald-200/90 px-3 py-1 rounded-full shadow-xs">
                      {p.level_target || 'Seluruh Warga'}
                    </span>
                    <span className="text-[11px] text-emerald-200/90 font-mono font-medium">
                      {new Date(p.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-white">{p.judul}</h4>
                  <p className="text-xs text-emerald-100/85 leading-relaxed">{p.isi}</p>
                </div>
              ))
            ) : (
              /* Fallback Pengumuman Default */
              <>
                <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-950 bg-emerald-200/90 px-3 py-1 rounded-full shadow-xs">
                      Seluruh Warga
                    </span>
                    <span className="text-[11px] text-emerald-200/90 font-mono font-medium">
                      Agustus 2026
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-white">Jadwal Pelayanan Posyandu Balita & Pemeriksaan Lansia Gratis</h4>
                  <p className="text-xs text-emerald-100/85 leading-relaxed">
                    Pelaksanaan posyandu serentak di 8 titik balai RW Desa Doko dimulai setiap tanggal 10 pukul 08.00 WIB. Diharapkan kehadiran ibu dan balita.
                  </p>
                </div>
                <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-950 bg-emerald-200/90 px-3 py-1 rounded-full shadow-xs">
                      Pengurus RT/RW
                    </span>
                    <span className="text-[11px] text-emerald-200/90 font-mono font-medium">
                      Agustus 2026
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-white">Sosialisasi Pelayanan Digital Mandiri SiDesKu</h4>
                  <p className="text-xs text-emerald-100/85 leading-relaxed">
                    Bimtek verifikasi permohonan surat online bagi seluruh ketua RT di Balai Desa Doko guna percepatan pelayanan warga.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Modal Baca Artikel Lengkap - Portaled, Auto-Centered, Highest Z-Index, No Blur */}
      {selectedBerita && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 font-sans overflow-y-auto animate-fade-in select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBerita(null);
          }}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl modal-content my-auto max-h-[90vh] overflow-y-auto border border-slate-100 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start pb-3 border-b border-gray-100">
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {selectedBerita.kategori}
              </span>
              <button 
                onClick={() => setSelectedBerita(null)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                title="Tutup (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {selectedBerita.judul}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-b border-slate-100 pb-3">
                <span>{formatBeritaDate(selectedBerita.published_at)}</span>
                <span>{selectedBerita.view_count || 120} pembaca</span>
                <span>Humas Pemdes Doko</span>
              </div>

              <div className="h-64 rounded-2xl overflow-hidden bg-slate-100">
                <img 
                  src="/images/event.jpg" 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line">
                {selectedBerita.konten}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBerita(null)}
                className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition-colors cursor-pointer shadow-xs"
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
