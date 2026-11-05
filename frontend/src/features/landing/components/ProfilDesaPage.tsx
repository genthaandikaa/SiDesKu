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
      
      {/* Hero follows the centered, softly lit style used on Beranda. */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 sm:pb-16 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[520px] bg-gradient-to-b from-blue-500/15 via-sky-400/10 to-transparent blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-gradient-to-tr from-blue-500/20 via-sky-400/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold mb-6 shadow-2xs animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Profil Wilayah Desa Doko</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-950 tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6">
          Profil &{' '}
          <span className="text-blue-600">Tata Kelola Desa.</span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium mb-8">
              Kenali wilayah, aparatur, dan penduduk Desa Doko.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#direktori-desa"
                className="px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-600/25 transition-all press-down flex items-center gap-2 hover-glow"
              >
                <span>Lihat wilayah</span>
                <ArrowRight className="w-4 h-4" />
              </a>
        </div>
      </section>

      {/* Div 2: Direktori Desa Terdaftar & Pencarian Wilayah (Full-Width Pure White Band) */}
      <section id="direktori-desa" className="w-full bg-white pt-10 sm:pt-12 pb-16 sm:pb-24 border-y border-slate-200/80 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header & Search Bar */}
          <div className="flex flex-col items-center text-center gap-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Desa Terdaftar di Kab. Kediri
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Cari desa untuk melihat ringkasan wilayah.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative max-w-md w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari desa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Village Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVillages.map((v) => (
              <div 
                key={v.id} 
                className={`bg-slate-50/60 hover:bg-white rounded-3xl p-6 border transition-all duration-300 space-y-4 hover:shadow-xl ${
                  v.isCurrent ? 'border-blue-400 shadow-md ring-2 ring-blue-500/10' : 'border-slate-200/80 shadow-xs'
                }`}
              >
                {/* Village Title & Status */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{v.nama}</h3>
                      {v.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black border border-blue-200">
                          Desa Aktif
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">{v.kecamatan}, Kab. Kediri</p>
                  </div>

                  <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>

                {/* Ringkasan wilayah */}
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
                    <div className="text-sm font-black text-blue-700">{v.populasi}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Penduduk</div>
                  </div>
                </div>

                {/* Kepala desa */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Kades</span>
                    <strong className="text-slate-800 font-bold">{v.kades}</strong>
                  </div>
                </div>

                {/* Login Prompt Link */}
                <div className="pt-2 border-t border-slate-200/60">
                  <Link
                    to="/login"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs press-down"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk ke {v.nama}</span>
                  </Link>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Div 3: Visi & Misi Pembangunan Desa (Full-Width Emerald Background Banner Band) */}
      <section className="w-full bg-gradient-to-b from-[#1e3a5f] via-[#1d4ed8] to-[#172554] py-16 sm:py-24 text-white relative overflow-hidden">
        {/* Concentric Circle Orbit Watermark */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Visi & Misi Desa Doko
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
              Arah pembangunan Desa Doko 2021–2027.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            {/* Visi Card */}
            <div className="md:col-span-5 bg-white/10 backdrop-blur-xl border border-white/15 p-8 rounded-3xl space-y-5 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black shadow-inner">
                  <Target className="w-6 h-6 text-blue-200" />
                </div>
                <div className="text-xs font-extrabold text-blue-200 uppercase tracking-widest">
                  Visi Desa 2021 - 2027
                </div>
                <blockquote className="text-lg sm:text-xl font-black text-white leading-snug">
                  "{desaSetting?.visi || 'Desa Doko yang maju, sejahtera, mandiri, dan unggul dalam layanan berbasis teknologi.'}"
                </blockquote>
              </div>
              <div className="pt-4 border-t border-white/15 text-xs text-blue-200/90 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-300" />
                  <span>RPJMDes 2021–2027</span>
              </div>
            </div>

            {/* Misi Card */}
            <div className="md:col-span-7 bg-white/10 backdrop-blur-xl border border-white/15 p-8 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-white/15">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black">
                    <Award className="w-5 h-5 text-blue-200" />
                  </div>
                  <div>
                    <div className="font-black text-sm text-white">4 Misi Utama</div>
                    <div className="text-[11px] text-blue-200">Fokus pembangunan</div>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-bold border border-white/20">
                  Prioritas Pembangunan
                </span>
              </div>

              <ul className="space-y-4 text-xs sm:text-sm text-blue-50/95 font-medium pt-2">
                {typeof desaSetting?.misi === 'string' && desaSetting.misi.trim().length > 0 ? (
                  desaSetting.misi.split('\n').filter((l: string) => l.trim().length > 0).map((line: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                      <span className="w-6 h-6 rounded-xl bg-white text-blue-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">
                        {idx + 1}
                      </span>
                      <span className="line-clamp-2">{line.replace(/^\d+[\.\)]\s*/, '')}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-3.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                      <span className="w-6 h-6 rounded-xl bg-white text-blue-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">
                        1
                      </span>
                      <span>Digitalkan administrasi dan layanan desa.</span>
                    </li>
                    <li className="flex items-start gap-3.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                      <span className="w-6 h-6 rounded-xl bg-white text-blue-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">
                        2
                      </span>
                      <span>Bangun jalan, irigasi, dan drainase secara merata.</span>
                    </li>
                    <li className="flex items-start gap-3.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                      <span className="w-6 h-6 rounded-xl bg-white text-blue-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">
                        3
                      </span>
                      <span>Kembangkan pertanian, UMKM, dan BUMDes.</span>
                    </li>
                    <li className="flex items-start gap-3.5 bg-white/5 p-3 rounded-2xl border border-white/10">
                      <span className="w-6 h-6 rounded-xl bg-white text-blue-800 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm">
                        4
                      </span>
                      <span>Kelola APBDes secara terbuka dan akuntabel.</span>
                    </li>
                  </>
                )}
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
            <div className="text-center max-w-2xl mx-auto space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Aparatur Desa Doko
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Perangkat pemerintah yang melayani masyarakat Desa Doko.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {aparaturList.map((a, i) => (
                <div key={i} className="bg-slate-50/70 hover:bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-lg hover:border-blue-300 transition-all group">
                  <img 
                    src={a.image} 
                    alt={a.nama} 
                    className="w-14 h-14 rounded-2xl object-cover bg-blue-100 border border-slate-200 shrink-0 group-hover:scale-105 transition-transform" 
                  />
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">{a.nama}</h3>
                    <div className="text-xs font-bold text-blue-700">{a.jabatan}</div>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/80 uppercase tracking-widest">
                Pembagian Wilayah
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Daftar Dusun di Desa Doko
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Ringkasan wilayah dan jumlah warga per dusun.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dusunList.map((d, i) => (
                <div key={i} className="bg-slate-50/70 hover:bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:border-blue-300 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900">{d.nama}</h3>
                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black border border-blue-200">
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
                      <strong className="text-blue-700 font-extrabold">{d.jiwa} Jiwa</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Div 5: Potensi Unggulan Desa & Portal Akses Warga CTA (Full-Width Emerald Background Banner Band) */}
      <section className="w-full bg-gradient-to-b from-[#1e3a5f] via-[#1d4ed8] to-[#172554] py-16 sm:py-24 text-white relative overflow-hidden">
        {/* Concentric Circle Orbit Watermark */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -left-20 bottom-0 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          
          {/* Potensi Cards Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-blue-200 text-xs font-black border border-white/20">
              <span>KETAHANAN PANGAN & EKONOMI KERAKYATAN</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Potensi Ekonomi & Keunggulan Desa
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
              Pertanian, UMKM, dan usaha desa.
            </p>
          </div>

          {/* 3 Potensi Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black">
                <TreePine className="w-6 h-6 text-blue-200" />
              </div>
              <h3 className="font-extrabold text-base text-white">Pertanian & Holtikultura</h3>
              <p className="text-xs text-blue-100/85 leading-relaxed">
                Sawah 140 hektar untuk padi, jagung, cabai, dan sayuran.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black">
                <Briefcase className="w-6 h-6 text-blue-200" />
              </div>
              <h3 className="font-extrabold text-base text-white">UMKM Kerajinan & Olahan</h3>
              <p className="text-xs text-blue-100/85 leading-relaxed">
                Mebel, anyaman bambu, dan olahan pangan lokal.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center font-black">
                <Layers className="w-6 h-6 text-blue-200" />
              </div>
              <h3 className="font-extrabold text-base text-white">BUMDes Doko Makmur</h3>
              <p className="text-xs text-blue-100/85 leading-relaxed">
                Layanan alat tani, simpan pinjam, dan air bersih.
              </p>
            </div>
          </div>

          {/* Citizen Call to Action Banner Box */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white/15 backdrop-blur-xl border border-white/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Warga Desa Doko?
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl">
                Masuk untuk mengajukan surat, melacak berkas, dan cek bansos.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-blue-50 text-blue-900 font-extrabold text-xs sm:text-sm shadow-lg transition-all press-down flex items-center gap-2"
              >
                <span>Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/layanan-surat"
                className="px-6 py-3.5 rounded-2xl bg-blue-800/80 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm border border-white/20 shadow-sm transition-all"
              >
                <span>Layanan surat</span>
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
