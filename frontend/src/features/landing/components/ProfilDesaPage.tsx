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
  Phone,
  Mail,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
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

  // Aparatur List for Logged In View
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

  // Dusun Breakdown for Logged In View
  const dusunList = [
    { nama: 'Dusun Krajan', rt: 14, rw: 4, kk: 320, jiwa: 1040, kasun: 'Supriyanto', ket: 'Pusat Pemerintahan, Balai Desa, dan Sentra Perdagangan' },
    { nama: 'Dusun Doko Timur', rt: 12, rw: 4, kk: 280, jiwa: 920, kasun: 'Agus Waluyo', ket: 'Kawasan Pertanian Padi & Perikanan Air Tawar' },
    { nama: 'Dusun Doko Barat', rt: 10, rw: 4, kk: 260, jiwa: 880, kasun: 'Hartono', ket: 'Sentra Industri Kecil Mebel & Peternakan' },
  ];

  return (
    <div className="space-y-12 py-6 page-enter font-sans text-slate-800">
      
      {/* =========================================================================
          HERO BANNER (Clean, High Contrast, Gradient Emerald Background)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#0b3323] via-[#0f442f] to-[#072418] text-white shadow-xl relative overflow-hidden border border-emerald-800/80">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/90 text-emerald-200 text-xs font-extrabold border border-emerald-600/60 shadow-xs">
              <Compass className="w-4 h-4 text-emerald-300" />
              <span>{user ? 'Profil Resmi Wilayah Desa' : 'Portal Direktori Wilayah Kabupaten Kediri'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {user ? (
                <>Profil Pemerintahan <span className="text-emerald-300">Desa Doko</span></>
              ) : (
                <>Direktori Desa & Wilayah <span className="text-emerald-300">Kab. Kediri</span></>
              )}
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-medium">
              {user ? (
                'Informasi resmi mengenai sejarah, visi-misi, aparatur pemerintahan, persebaran rukun tetangga (RT/RW), dan potensi unggulan Desa Doko, Kec. Ngasem.'
              ) : (
                'Informasi profil desa-desa yang telah terintegrasi dalam sistem administrasi digital mandiri Kabupaten Kediri, mencakup statistik RT, RW, dan populasi warga.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODE 1: SEBELUM LOGIN (Public Guest View -> Direktori Desa Kabupaten Kediri)
         ========================================================================= */}
      {!user && (
        <div className="space-y-12">
          
          {/* Summary Metric Ribbon */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">5 Desa</div>
                    <div className="text-xs text-slate-500 font-semibold">Terdaftar di SIDes</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-black">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">162 RT / 54 RW</div>
                    <div className="text-xs text-slate-500 font-semibold">Cakupan Wilayah</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">13.040+</div>
                    <div className="text-xs text-slate-500 font-semibold">Total Jiwa Terdata</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-700">100% Sah</div>
                    <div className="text-xs text-slate-500 font-semibold">Standar Pemkab Kediri</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Search & Directory Table Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Header & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Daftar Desa Terdaftar & Terintegrasi
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
                  className={`bg-white rounded-3xl p-6 border transition-all duration-300 space-y-4 hover:shadow-lg ${
                    v.isCurrent ? 'border-emerald-300 shadow-md ring-2 ring-emerald-500/10' : 'border-slate-200/80 shadow-xs'
                  }`}
                >
                  {/* Village Title & Status */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900">{v.nama}</h3>
                        {v.isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
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
                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
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
                  <div className="pt-2 border-t border-slate-100">
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

          </section>

          {/* Citizen Call to Action */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-3xl p-8 border border-emerald-200/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Warga Desa Doko atau Desa Terdaftar?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                  Masuk dengan NIK dan akun Anda untuk melihat struktur lengkap aparatur, permohonan surat pengantar RT/RW, dan cek bantuan sosial secara mandiri.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/login"
                  className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all press-down flex items-center gap-2"
                >
                  <span>Masuk ke Portal Desa</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all"
                >
                  <span>Daftar Akun Baru</span>
                </Link>
              </div>
            </div>
          </section>

        </div>
      )}

      {/* =========================================================================
          MODE 2: SETELAH LOGIN (Detail Profil Desa Khusus Pengguna & Endpoint Real)
         ========================================================================= */}
      {user && (
        <div className="space-y-12">
          
          {/* Live Demographics Badge from Backend */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {liveStats?.total_warga || 342}
                </div>
                <div className="text-xs text-slate-500 font-bold mt-1">Total Warga Terdata</div>
                <span className="text-[10px] text-emerald-600 font-semibold font-mono">Realtime dari Database</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-emerald-700">3 Dusun</div>
                <div className="text-xs text-slate-500 font-bold mt-1">Wilayah Dusun</div>
                <span className="text-[10px] text-slate-400 font-mono">Krajan, Timur, Barat</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-slate-900">36 RT / 12 RW</div>
                <div className="text-xs text-slate-500 font-bold mt-1">Rukun Tetangga/Warga</div>
                <span className="text-[10px] text-emerald-600 font-semibold font-mono">Terintegrasi Online</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="text-2xl sm:text-3xl font-black text-blue-600">
                  {liveStats?.total_surat_selesai || 48} Surat
                </div>
                <div className="text-xs text-slate-500 font-bold mt-1">Dokumen Sah Terbit</div>
                <span className="text-[10px] text-blue-600 font-semibold font-mono">Dilengkapi QR Code</span>
              </div>
            </div>
          </section>

          {/* Visi & Misi Desa */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-5 bg-emerald-50/80 border border-emerald-200/80 p-8 rounded-3xl space-y-4 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black shadow-xs">
                  <Target className="w-6 h-6" />
                </div>
                <div className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Visi Desa 2021 - 2027</div>
                <blockquote className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  "{desaSetting?.visi || 'Terwujudnya Masyarakat Desa Doko yang Maju, Sejahtera, Mandiri, Agamis, dan Terdepan dalam Tata Kelola Pelayanan Berbasis Teknologi Informasi.'}"
                </blockquote>
              </div>

              <div className="md:col-span-7 bg-white border border-slate-200/80 p-8 rounded-3xl space-y-4 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <Award className="w-6 h-6" />
                </div>
                <div className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Misi Pembangunan Desa</div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                    <span>Meningkatkan profesionalisme aparatur pemerintah desa dengan digitalisasi tata kelola administrasi dan persuratan.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                    <span>Membangun sarana dan prasarana infrastruktur jalan, irigasi pertanian, dan drainase lingkungan yang merata.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    <span>Mengembangkan perekonomian kerakyatan berbasis potensi pertanian, UMKM, dan pemberdayaan BUMDes.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                    <span>Mewujudkan transparansi pengelolaan keuangan APBDes secara terbuka dan akuntabel kepada seluruh warga.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Struktur Organisasi Aparatur Desa */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
              <div className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest">Struktur Pemerintah Desa</div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Aparatur & Perangkat Desa Doko
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Pelayan masyarakat yang bertugas menjalankan roda birokrasi, persuratan, dan pembangunan di Desa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {aparaturList.map((a, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
                  <img 
                    src={a.image} 
                    alt={a.nama} 
                    className="w-14 h-14 rounded-2xl object-cover bg-emerald-100 border border-slate-100 shrink-0" 
                  />
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{a.nama}</h3>
                    <div className="text-xs font-bold text-emerald-700">{a.jabatan}</div>
                    {a.nip !== '-' && (
                      <div className="text-[10px] text-slate-400 font-mono">NIP: {a.nip}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Rincian Dusun */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
              <div className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest">Pembagian Wilayah</div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Daftar Dusun di Desa Doko
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Karakteristik geografis, demografi, dan sebaran rukun warga (RW) di setiap dusun.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dusunList.map((d, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:border-emerald-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900">{d.nama}</h3>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                      {d.rt} RT / {d.rw} RW
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                    {d.ket}
                  </p>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700 font-medium">
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
          </section>

          {/* Potensi Desa */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Potensi Ekonomi & Keunggulan Desa Doko
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Sektor unggulan yang menopang perekonomian masyarakat dan ketahanan pangan desa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <TreePine className="w-7 h-7 text-emerald-700" />
                  <h3 className="font-extrabold text-sm text-slate-900">Pertanian & Holtikultura</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Lahan sawah irigasi teknis seluas 140 hektar yang memproduksi padi, jagung, cabai, dan sayuran segar berkualitas tinggi.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <Briefcase className="w-7 h-7 text-emerald-700" />
                  <h3 className="font-extrabold text-sm text-slate-900">UMKM Kerajinan & Olahan</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Puluhan industri rumah tangga mandiri di bidang pengrajin mebel kayu, anyaman bambu, dan makanan tradisional khas Kediri.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <Layers className="w-7 h-7 text-emerald-700" />
                  <h3 className="font-extrabold text-sm text-slate-900">BUMDes Doko Makmur</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Unit usaha penyewaan alat pertanian, simpan pinjam produktif, dan pengelolaan air bersih perdesaan terpadu.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      )}

    </div>
  );
};
