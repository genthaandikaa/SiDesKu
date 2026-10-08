import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  MapPin, 
  Compass, 
  Award, 
  Target, 
  ShieldCheck, 
  Layers, 
  TreePine, 
  Briefcase,
  ChevronRight,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogIn
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import api from '@/shared/lib/axios';

export const ProfilDesaPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [liveStats, setLiveStats] = useState<any>(null);
  const [desaSetting, setDesaSetting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real endpoint data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await api.get('/public/home');
        if (res.data?.success) {
          setLiveStats(res.data.data.stats);
          setDesaSetting(res.data.data.desa);
        }
      } catch (err) {
        console.error('Failed to load profile data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Pre-Login Village Directory in Kabupaten Kediri
  const registeredVillages = [
    {
      id: 1,
      nama: 'Desa Doko',
      kecamatan: 'Kecamatan Ngasem',
      dusun: 3,
      rw: 12,
      rt: 36,
      populasi: liveStats?.total_warga ? `${liveStats.total_warga * 8} Jiwa` : '2.840 Jiwa',
      kk: '860 KK',
      kades: 'Drs. H. Bambang Prasetyo, M.Si',
      status: 'Aktif Penuh',
      unggulan: 'Sentra UMKM Kerajinan & Pertanian Organik',
      isCurrent: true,
    },
    {
      id: 2,
      nama: 'Desa Sukorejo',
      kecamatan: 'Kecamatan Gurah',
      dusun: 4,
      rw: 14,
      rt: 42,
      populasi: '3.420 Jiwa',
      kk: '980 KK',
      kades: 'H. Suwandi, S.E',
      status: 'Aktif Penuh',
      unggulan: 'Budidaya Ikan Koi & Tanaman Hias',
      isCurrent: false,
    },
    {
      id: 3,
      nama: 'Desa Sambirejo',
      kecamatan: 'Kecamatan Gampengrejo',
      dusun: 3,
      rw: 10,
      rt: 30,
      populasi: '2.150 Jiwa',
      kk: '720 KK',
      kades: 'Dra. Endang Sri Wahyuni',
      status: 'Aktif Penuh',
      unggulan: 'Kawasan Hortikultura & Olahan Kedelai',
      isCurrent: false,
    },
    {
      id: 4,
      nama: 'Desa Tugurejo',
      kecamatan: 'Kecamatan Ngasem',
      dusun: 3,
      rw: 11,
      rt: 34,
      populasi: '2.680 Jiwa',
      kk: '810 KK',
      kades: 'Ir. Agus Hariyanto',
      status: 'Aktif Penuh',
      unggulan: 'Kawasan Wisata Budaya & Agrowisata',
      isCurrent: false,
    },
    {
      id: 5,
      nama: 'Desa Kwadungan',
      kecamatan: 'Kecamatan Ngasem',
      dusun: 2,
      rw: 8,
      rt: 24,
      populasi: '1.950 Jiwa',
      kk: '610 KK',
      kades: 'M. Nur Cholis, S.Pd',
      status: 'Aktif Penuh',
      unggulan: 'Sentra Pertanian Padi & Peternakan Sapi',
      isCurrent: false,
    },
  ];

  // Filtered villages
  const filteredVillages = registeredVillages.filter(v => 
    v.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.kecamatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.unggulan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Aparatur List
  const aparaturList = [
    { nama: desaSetting?.nama_kepala_desa || 'Drs. H. Bambang Prasetyo, M.Si', jabatan: 'Kepala Desa', image: '/images/landing/Author.png', nip: '197204121998031005' },
    { nama: desaSetting?.nama_sekretaris_desa || 'Ahmad Fauzi, S.Kom', jabatan: 'Sekretaris Desa', image: '/images/user.png', nip: '198506152010011012' },
    { nama: 'Ratna Dewi, S.E', jabatan: 'Kaur Keuangan (Bendahara Desa)', image: '/images/user.png', nip: '-' },
    { nama: 'M. Rizky Pratama', jabatan: 'Kaur Perencanaan & Umum', image: '/images/user.png', nip: '-' },
    { nama: 'Budi Santoso', jabatan: 'Kasi Pemerintahan', image: '/images/user.png', nip: '-' },
    { nama: 'Siti Aminah, S.Sos', jabatan: 'Kasi Pelayanan & Kesejahteraan', image: '/images/user.png', nip: '-' },
    { nama: 'Supriyanto', jabatan: 'Kepala Dusun Krajan', image: '/images/user.png', nip: '-' },
    { nama: 'Agus Waluyo', jabatan: 'Kepala Dusun Doko Timur', image: '/images/user.png', nip: '-' },
    { nama: 'Hartono', jabatan: 'Kepala Dusun Doko Barat', image: '/images/user.png', nip: '-' },
  ];

  // Dusun Breakdown
  const dusunList = [
    { nama: 'Dusun Krajan', rt: 14, rw: 4, kk: 320, jiwa: 1040, kasun: 'Supriyanto', ket: 'Pusat Pemerintahan, Balai Desa, dan Sentra Perdagangan' },
    { nama: 'Dusun Doko Timur', rt: 12, rw: 4, kk: 280, jiwa: 920, kasun: 'Agus Waluyo', ket: 'Kawasan Pertanian Padi & Perikanan Air Tawar' },
    { nama: 'Dusun Doko Barat', rt: 10, rw: 4, kk: 260, jiwa: 880, kasun: 'Hartono', ket: 'Sentra Industri Kecil Mebel & Peternakan' },
  ];

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
          
          {/* Left Column (60% Fibonacci): Title, Eyebrow, and Description */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-black border border-emerald-200 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Portal Direktori & Profil Wilayah Terpadu</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
              Profil Wilayah &{' '}
              <span className="relative whitespace-nowrap text-emerald-700 inline-block">
                Tata Pamong Desa
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-400" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0 15 Q 50 0, 100 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium max-w-xl">
              Informasi profil resmi mengenai sejarah, visi-misi, aparatur pemerintahan desa, sebaran rukun warga (RT/RW), dan potensi unggulan wilayah Kabupaten Kediri.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="#direktori-desa"
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all press-down flex items-center gap-2 hover-glow"
              >
                <span>Jelajahi Wilayah Terdaftar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Standar DPMPD Pemkab Kediri</span>
              </div>
            </div>
          </div>

          {/* Right Column (40% Fibonacci): Regional Summary Mockup */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="w-full max-w-md animate-float-gentle">
              <div className="card-elevated-mockup p-6 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-900/5 space-y-4">
                
                {/* Top Bar with Kediri Emblem */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/images/logo-kediri.png" 
                      alt="Kabupaten Kediri" 
                      className="h-8 w-auto object-contain"
                    />
                    <div>
                      <div className="font-black text-xs text-slate-900 leading-tight">
                        Pusat Data Wilayah
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold">
                        Kabupaten Kediri
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-200">
                    Sistem Aktif
                  </span>
                </div>

                {/* Summary Card Details */}
                <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-slate-900">Desa Doko (Percontohan)</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      Kec. Ngasem
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Kawasan pusat layanan terintegrasi digital dengan 3 Dusun mandiri, 12 RW, dan 36 RT terdata sah.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px]">
                    <div className="bg-white p-2 rounded-xl border border-slate-200/80 font-bold text-slate-800 shadow-2xs">
                      3 Dusun
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200/80 font-bold text-slate-800 shadow-2xs">
                      12 RW
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200/80 font-bold text-emerald-700 shadow-2xs">
                      36 RT
                    </div>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Data Kependudukan Realtime</span>
                  </span>
                  <span className="font-bold text-slate-700">100% Sah</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating 4 Demographic Cards - Straddling Seam Line (Fibonacci Golden Ratio) */}
      <div className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mb-[52px] sm:-mb-[58px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Card 1 */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg hover:shadow-2xl rounded-2xl py-4 px-4 sm:py-5 sm:px-5 text-center space-y-1.5 transition-all duration-300 hover:-translate-y-1 group">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:scale-105 transition-transform">
              5
            </div>
            <div className="text-xs sm:text-[13px] font-bold text-slate-700">
              Desa Terdaftar
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                Kab. Kediri
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg hover:shadow-2xl rounded-2xl py-4 px-4 sm:py-5 sm:px-5 text-center space-y-1.5 transition-all duration-300 hover:-translate-y-1 group">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight leading-none group-hover:scale-105 transition-transform">
              162 / 54
            </div>
            <div className="text-xs sm:text-[13px] font-bold text-slate-700">
              RT / RW Cakupan
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                Wilayah Sah
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg hover:shadow-2xl rounded-2xl py-4 px-4 sm:py-5 sm:px-5 text-center space-y-1.5 transition-all duration-300 hover:-translate-y-1 group">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:scale-105 transition-transform">
              13.040+
            </div>
            <div className="text-xs sm:text-[13px] font-bold text-slate-700">
              Jiwa Terdata
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                Data Realtime
              </span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg hover:shadow-2xl rounded-2xl py-4 px-4 sm:py-5 sm:px-5 text-center space-y-1.5 transition-all duration-300 hover:-translate-y-1 group">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight leading-none group-hover:scale-105 transition-transform">
              100%
            </div>
            <div className="text-xs sm:text-[13px] font-bold text-slate-700">
              Standar Pemkab
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                DPMPD Terpadu
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Div 2: Direktori Desa Terdaftar & Pencarian Wilayah (Full-Width Pure White Band) */}
      <section id="direktori-desa" className="w-full bg-white pt-20 sm:pt-24 pb-16 sm:pb-24 border-y border-slate-200/80 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 uppercase tracking-widest mb-1.5">
                Wilayah Terintegrasi
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Daftar Desa Terdaftar di Kab. Kediri
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Pilih atau cari desa Anda untuk melihat ringkasan data kependudukan dan struktur wilayah.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari desa atau kecamatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Village Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVillages.map((v) => (
              <div 
                key={v.id} 
                className={`bg-slate-50/60 hover:bg-white rounded-3xl p-6 border transition-all duration-300 space-y-4 hover:shadow-xl ${
                  v.isCurrent ? 'border-emerald-400 shadow-md ring-2 ring-emerald-500/10' : 'border-slate-200/80 shadow-xs'
                }`}
              >
                {/* Village Title & Status */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{v.nama}</h3>
                      {v.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                          Desa Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">{v.kecamatan}, Kab. Kediri</p>
                  </div>

                  <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Village Key Demographics (Dusun, RW, RT, Warga) */}
                <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-white border border-slate-200/80 text-center shadow-2xs">
                  <div>
                    <div className="text-sm font-black text-slate-900">{v.dusun}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Dusun</div>
                  </div>
                  <div className="border-x border-slate-200/80">
                    <div className="text-sm font-black text-slate-900">{v.rt} RT / {v.rw} RW</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Lingkungan</div>
                  </div>
                  <div>
                    <div className="text-sm font-black text-emerald-700">{v.populasi}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Penduduk</div>
                  </div>
                </div>

                {/* Kades & Potential */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Kepala Desa:</span>
                    <strong className="text-slate-800 font-bold">{v.kades}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Potensi:</span>
                    <span className="text-emerald-700 font-bold text-right text-[11px] truncate max-w-[170px]">{v.unggulan}</span>
                  </div>
                </div>

                {/* Login Prompt Link */}
                <div className="pt-2 border-t border-slate-200/60">
                  <Link
                    to="/login"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs press-down"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk Portal Layanan {v.nama}</span>
                  </Link>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Div 3: Visi & Misi Pembangunan Desa (Full-Width Emerald Background Banner Band) */}
      <section className="w-full bg-gradient-to-b from-[#065f46] via-[#047857] to-[#064e3b] py-16 sm:py-24 text-white relative overflow-hidden">
        {/* Concentric Circle Orbit Watermark */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-black border border-white/20">
              <Target className="w-3.5 h-3.5 text-emerald-300" />
              <span>ARAH KEBIJAKAN PEMERINTAH DESA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Visi & Misi Pembangunan Desa Doko
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
              Landasan strategis periode 2021 - 2027 menuju desa mandiri, transparan, dan terdepan dalam pelayanan digital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            {/* Visi Card */}
            <div className="md:col-span-5 bg-white/10 backdrop-blur-xl border border-white/15 p-8 rounded-3xl space-y-5 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black shadow-inner">
                  <Target className="w-6 h-6 text-emerald-200" />
                </div>
                <div className="text-xs font-extrabold text-emerald-200 uppercase tracking-widest">
                  Visi Desa 2021 - 2027
                </div>
                <blockquote className="text-lg sm:text-xl font-black text-white leading-snug">
                  "{desaSetting?.visi || 'Terwujudnya Masyarakat Desa Doko yang Maju, Sejahtera, Mandiri, Agamis, dan Terdepan dalam Tata Kelola Pelayanan Berbasis Teknologi Informasi.'}"
                </blockquote>
              </div>
              <div className="pt-4 border-t border-white/15 text-xs text-emerald-200/90 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Rencana Pembangunan Jangka Menengah Desa (RPJMDes)</span>
              </div>
            </div>

            {/* Misi Card */}
            <div className="md:col-span-7 bg-white/10 backdrop-blur-xl border border-white/15 p-8 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/15">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black">
                    <Award className="w-5 h-5 text-emerald-200" />
                  </div>
                  <div>
                    <div className="font-black text-sm text-white">4 Misi Utama</div>
                    <div className="text-[11px] text-emerald-200">Aksi Nyata Pelayanan Publik</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-bold border border-white/20">
                  Prioritas Pembangunan
                </span>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-emerald-50/95 font-medium pt-2">
                <li className="flex items-start gap-3.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <span className="w-6 h-6 rounded-xl bg-white text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">
                    1
                  </span>
                  <span>Meningkatkan profesionalisme aparatur pemerintah desa dengan digitalisasi tata kelola administrasi dan persuratan realtime.</span>
                </li>
                <li className="flex items-start gap-3.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <span className="w-6 h-6 rounded-xl bg-white text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">
                    2
                  </span>
                  <span>Membangun sarana dan prasarana infrastruktur jalan, irigasi pertanian tersier, serta drainase lingkungan yang merata.</span>
                </li>
                <li className="flex items-start gap-3.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <span className="w-6 h-6 rounded-xl bg-white text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">
                    3
                  </span>
                  <span>Mengembangkan perekonomian kerakyatan berbasis potensi pertanian organik, UMKM kerajinan, dan pemberdayaan BUMDes.</span>
                </li>
                <li className="flex items-start gap-3.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                  <span className="w-6 h-6 rounded-xl bg-white text-emerald-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">
                    4
                  </span>
                  <span>Mewujudkan transparansi pengelolaan keuangan APBDes secara terbuka dan akuntabel kepada seluruh warga.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Div 4: Struktur Organisasi Aparatur & Rincian Dusun (Full-Width Pure White Band) */}
      <section className="w-full bg-white py-16 sm:py-24 border-b border-slate-200/80 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Aparatur Desa Section */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 uppercase tracking-widest">
                Struktur Pemerintah Desa
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Aparatur & Perangkat Desa Doko
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Pelayan masyarakat yang bertugas menjalankan roda birokrasi, persuratan, dan pembangunan di Desa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {aparaturList.map((a, i) => (
                <div key={i} className="bg-slate-50/70 hover:bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-lg hover:border-emerald-300 transition-all group">
                  <img 
                    src={a.image} 
                    alt={a.nama} 
                    className="w-14 h-14 rounded-2xl object-cover bg-emerald-100 border border-slate-200 shrink-0 group-hover:scale-105 transition-transform" 
                  />
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">{a.nama}</h3>
                    <div className="text-xs font-bold text-emerald-700">{a.jabatan}</div>
                    {a.nip !== '-' && (
                      <div className="text-[10px] text-slate-400 font-mono">NIP: {a.nip}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rincian Dusun Section */}
          <div className="space-y-8 pt-8 border-t border-slate-100">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/80 uppercase tracking-widest">
                Pembagian Wilayah
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Daftar Dusun di Desa Doko
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Karakteristik geografis, demografi, dan sebaran rukun warga (RW) di setiap dusun.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dusunList.map((d, i) => (
                <div key={i} className="bg-slate-50/70 hover:bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:border-emerald-300 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900">{d.nama}</h3>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200">
                      {d.rt} RT / {d.rw} RW
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                    {d.ket}
                  </p>

                  <div className="pt-3 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-700 font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kepala Dusun:</span>
                      <strong className="text-slate-900 font-bold">{d.kasun}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jumlah KK:</span>
                      <span>{d.kk} Kepala Keluarga</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Populasi:</span>
                      <strong className="text-emerald-700 font-extrabold">{d.jiwa} Jiwa</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Div 5: Potensi Unggulan Desa & Portal Akses Warga CTA (Full-Width Emerald Background Banner Band) */}
      <section className="w-full bg-gradient-to-b from-[#065f46] via-[#047857] to-[#064e3b] py-16 sm:py-24 text-white relative overflow-hidden">
        {/* Concentric Circle Orbit Watermark */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          
          {/* Potensi Cards Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-black border border-white/20">
              <span>KETAHANAN PANGAN & EKONOMI KERAKYATAN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Potensi Ekonomi & Keunggulan Desa
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
              Sektor unggulan yang menopang perekonomian masyarakat dan ketahanan pangan di Desa Doko.
            </p>
          </div>

          {/* 3 Potensi Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black">
                <TreePine className="w-6 h-6 text-emerald-200" />
              </div>
              <h3 className="font-extrabold text-base text-white">Pertanian & Holtikultura</h3>
              <p className="text-xs text-emerald-100/85 leading-relaxed">
                Lahan sawah irigasi teknis seluas 140 hektar yang memproduksi padi, jagung, cabai, dan sayuran segar berkualitas tinggi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black">
                <Briefcase className="w-6 h-6 text-emerald-200" />
              </div>
              <h3 className="font-extrabold text-base text-white">UMKM Kerajinan & Olahan</h3>
              <p className="text-xs text-emerald-100/85 leading-relaxed">
                Puluhan industri rumah tangga mandiri di bidang pengrajin mebel kayu, anyaman bambu, dan makanan tradisional khas Kediri.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black">
                <Layers className="w-6 h-6 text-emerald-200" />
              </div>
              <h3 className="font-extrabold text-base text-white">BUMDes Doko Makmur</h3>
              <p className="text-xs text-emerald-100/85 leading-relaxed">
                Unit usaha penyewaan alat pertanian, simpan pinjam produktif, dan pengelolaan air bersih perdesaan terpadu.
              </p>
            </div>
          </div>

          {/* Citizen Call to Action Banner Box */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white/15 backdrop-blur-xl border border-white/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Warga Desa Doko atau Desa Terdaftar?
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
                Masuk dengan NIK dan akun Anda untuk pengajuan surat pengantar RT/RW secara mandiri, lacak berkas dokumen, dan cek bansos online.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs sm:text-sm shadow-lg transition-all press-down flex items-center gap-2"
              >
                <span>Masuk ke Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-2xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm border border-white/20 shadow-sm transition-all"
              >
                <span>Daftar Akun Baru</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
