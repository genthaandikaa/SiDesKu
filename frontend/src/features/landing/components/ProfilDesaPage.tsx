import React, { useState } from 'react';
import { 
  Building2, 
  Building, 
  Landmark, 
  Network, 
  Home, 
  Users, 
  Zap, 
  Eye, 
  ShieldCheck, 
  MapPin, 
  ArrowRight, 
  Download, 
  Info, 
  CheckCircle2, 
  BookOpen,
  ChevronRight,
  Layers,
  FileText,
  X
} from 'lucide-react';

export const ProfilDesaPage: React.FC = () => {
  const [activeKecamatan, setActiveKecamatan] = useState<number | null>(null);

  const kecamatanRows = [
    {
      nama: 'Kecamatan Wilayah Pusat',
      zona: 'Zona Inti Pemerintahan & Perdagangan',
      kelurahan: '6 Kelurahan',
      pusatLayanan: 'Jl. Pemuda No. 12',
      deskripsi: 'Sentra administrasi Balai Kota, perbankan, kawasan niaga, dan cagar budaya perkotaan.',
      kelurahanList: [
        { nama: 'Balowerti', kodePos: '64121', rtRw: '32 RT / 6 RW', alamat: 'Jl. Balowerti Gang 2 No. 15', status: 'Terhubung' },
        { nama: 'Banjaran', kodePos: '64124', rtRw: '28 RT / 5 RW', alamat: 'Jl. Slamet Riyadi No. 14', status: 'Terhubung' },
        { nama: 'Dandangan', kodePos: '64122', rtRw: '26 RT / 5 RW', alamat: 'Jl. Raden Patah No. 8', status: 'Terhubung' },
        { nama: 'Kampungdalem', kodePos: '64123', rtRw: '20 RT / 4 RW', alamat: 'Jl. KH Wachid Hasyim No. 12', status: 'Terhubung' },
        { nama: 'Kemasan', kodePos: '64125', rtRw: '22 RT / 4 RW', alamat: 'Jl. Pattimura No. 35', status: 'Terhubung' },
        { nama: 'Semampir', kodePos: '64121', rtRw: '35 RT / 7 RW', alamat: 'Jl. Mayor Bismo No. 42', status: 'Terhubung' },
      ]
    },
    {
      nama: 'Kecamatan Wilayah Barat',
      zona: 'Zona Residensial & Fasilitas Kesehatan',
      kelurahan: '8 Kelurahan',
      pusatLayanan: 'Jl. Raya Barat No. 88',
      deskripsi: 'Kawasan pemukiman tertata, rumah sakit rujukan daerah, dan sentra fasilitas umum.',
      kelurahanList: [
        { nama: 'Bandar Kidul', kodePos: '64118', rtRw: '25 RT / 5 RW', alamat: 'Jl. KH Agus Salim No. 19', status: 'Terhubung' },
        { nama: 'Bandar Lor', kodePos: '64117', rtRw: '30 RT / 6 RW', alamat: 'Jl. Mojoroto Indah No. 5', status: 'Terhubung' },
        { nama: 'Campurejo', kodePos: '64116', rtRw: '24 RT / 4 RW', alamat: 'Jl. Veteran No. 11', status: 'Terhubung' },
        { nama: 'Dermo', kodePos: '64111', rtRw: '22 RT / 4 RW', alamat: 'Jl. Dr. Sahardjo No. 7', status: 'Terhubung' },
        { nama: 'Lirboyo', kodePos: '64117', rtRw: '34 RT / 7 RW', alamat: 'Jl. KH Abdul Karim No. 1', status: 'Terhubung' },
        { nama: 'Mojoroto', kodePos: '64112', rtRw: '38 RT / 8 RW', alamat: 'Jl. Kawi No. 45', status: 'Terhubung' },
        { nama: 'Sukorame', kodePos: '64114', rtRw: '27 RT / 5 RW', alamat: 'Jl. Selomangleng No. 18', status: 'Terhubung' },
        { nama: 'Tamanan', kodePos: '64115', rtRw: '23 RT / 4 RW', alamat: 'Jl. Semeru No. 33', status: 'Terhubung' },
      ]
    },
    {
      nama: 'Kecamatan Wilayah Timur',
      zona: 'Kawasan Pendidikan Tinggi & Riset',
      kelurahan: '7 Kelurahan',
      pusatLayanan: 'Jl. Cendekia No. 04',
      deskripsi: 'Sentra perguruan tinggi, laboratorium riset mahasiswa, dan ekosistem pemuda kreatif.',
      kelurahanList: [
        { nama: 'Bangsal', kodePos: '64131', rtRw: '26 RT / 5 RW', alamat: 'Jl. Kapten Tendean No. 15', status: 'Terhubung' },
        { nama: 'Burengan', kodePos: '64131', rtRw: '29 RT / 6 RW', alamat: 'Jl. Letjen Sutoyo No. 22', status: 'Terhubung' },
        { nama: 'Jamsaren', kodePos: '64132', rtRw: '24 RT / 4 RW', alamat: 'Jl. Brigjen Pol IBH Pranoto No. 5', status: 'Terhubung' },
        { nama: 'Pakunden', kodePos: '64132', rtRw: '25 RT / 5 RW', alamat: 'Jl. Cendekia No. 4', status: 'Terhubung' },
        { nama: 'Singonegaran', kodePos: '64132', rtRw: '28 RT / 5 RW', alamat: 'Jl. Hos Cokroaminoto No. 9', status: 'Terhubung' },
        { nama: 'Tempurejo', kodePos: '64133', rtRw: '21 RT / 4 RW', alamat: 'Jl. Pesantren Indah No. 8', status: 'Terhubung' },
        { nama: 'Tosaren', kodePos: '64133', rtRw: '27 RT / 5 RW', alamat: 'Jl. Sunan Kalijaga No. 14', status: 'Terhubung' },
      ]
    },
    {
      nama: 'Kecamatan Wilayah Selatan',
      zona: 'Zona Resapan Air & Industri Ramah Lingkungan',
      kelurahan: '5 Kelurahan',
      pusatLayanan: 'Jl. Agro Selatan No. 102',
      deskripsi: 'Kawasan industri hijau, agribisnis perkotaan terpadu, dan lumbung logistik daerah.',
      kelurahanList: [
        { nama: 'Banaran', kodePos: '64135', rtRw: '22 RT / 4 RW', alamat: 'Jl. Agro Selatan No. 102', status: 'Terhubung' },
        { nama: 'Bawang', kodePos: '64136', rtRw: '20 RT / 4 RW', alamat: 'Jl. Bawang Raya No. 17', status: 'Terhubung' },
        { nama: 'Betet', kodePos: '64134', rtRw: '24 RT / 5 RW', alamat: 'Jl. Industri Selatan No. 2', status: 'Terhubung' },
        { nama: 'Blabak', kodePos: '64135', rtRw: '26 RT / 5 RW', alamat: 'Jl. Raya Kediri-Blitar No. 48', status: 'Terhubung' },
        { nama: 'Ketami', kodePos: '64136', rtRw: '19 RT / 4 RW', alamat: 'Jl. Ketami Indah No. 10', status: 'Terhubung' },
      ]
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 font-sans text-slate-800 space-y-16 sm:space-y-20">
      
      {/* =========================================================================
          HERO SECTION (High-Contrast Editorial)
          ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 text-slate-700 text-xs font-semibold border border-slate-200/80">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>PROFIL KOTA</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.12]">
            Mengenal Kota Lebih Dekat.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
            Informasi pemerintahan, wilayah administratif, dan komitmen pelayanan publik dalam satu ekosistem digital yang terintegrasi.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="#wilayah"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center gap-2 shadow-2xs"
            >
              <span>Jelajahi Wilayah</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#tata-kelola"
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200/90 transition-colors flex items-center gap-2 shadow-2xs"
            >
              <span>Pelajari Tata Kelola</span>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Metadata Row */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-4">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status Sipil</div>
              <div className="text-sm font-bold text-slate-900 mt-1">Pemerintah Kota</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Akreditasi Data</div>
              <div className="text-sm font-bold text-emerald-600 mt-1">Tingkat A-1</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pembaruan</div>
              <div className="text-sm font-bold text-slate-900 mt-1">Kuartal I 2025</div>
            </div>
          </div>
        </div>

        {/* Right Column: Civic Photo Card */}
        <div className="lg:col-span-5 rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-white">
          <div className="relative h-64 sm:h-80 overflow-hidden bg-slate-100">
            <img
              src="/images/landing/about_img.webp"
              alt="Pusat Pemerintahan Terpadu"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>PUSAT PEMERINTAHAN TERPADU</span>
            </div>
          </div>
          <div className="p-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">Kawasan Pusat Pemerintahan & Ruang Publik Terpadu</span>
            </div>
            <span className="font-mono text-slate-400 shrink-0 pl-2">KODEPOS: 40115</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: TENTANG KOTA (Headline Manifesto & 3 Strategic Cards)
          ========================================================================= */}
      <section className="space-y-8 pt-6 border-t border-slate-100">
        <div className="max-w-4xl space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Tentang Kota</div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-snug">
            Membangun kota dengan pemerintahan yang transparan, pelayanan responsif, dan partisipasi masyarakat.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Kecamatan */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Tingkat Pertama</span>
                <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">ADM-01</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">Kecamatan</h3>
                  <div className="text-xs font-semibold text-slate-400">Wilayah Administratif</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                Wilayah administratif kerja camat yang mengoordinasikan penyelenggaraan ketenteraman dan pelayanan perkotaan.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Fungsi Wilayah</span>
              <span className="text-blue-600 font-bold">Sentra PATEN</span>
            </div>
          </div>

          {/* Card 2: Kelurahan */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Tingkat Kelurahan</span>
                <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">ADM-02</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">Kelurahan</h3>
                  <div className="text-xs font-semibold text-slate-400">Layanan Garis Depan</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                Pusat pelayanan administratif warga garis depan untuk kependudukan, perizinan mikro, dan ketertiban lingkungan.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Fungsi Layanan</span>
              <span className="text-sky-600 font-bold">Administrasi Sipil</span>
            </div>
          </div>

          {/* Card 3: Jiwa Terdata */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">Demografi Agregat</span>
                <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">DUKCAPIL</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">Jiwa Terdata</h3>
                  <div className="text-xs font-semibold text-slate-400">Integrasi Kependudukan</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                Pembaruan berkala agregat kependudukan bersertifikasi resmi untuk perencanaan infrastruktur dan subsidi tepat sasaran.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Sinkronisasi Data</span>
              <span className="text-emerald-600 font-bold">Real-time SAKIP</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: PRINSIP TATA KELOLA (01 - 04)
          ========================================================================= */}
      <section id="tata-kelola" className="space-y-8 pt-6 border-t border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Prinsip Tata Kelola</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Pelayanan Publik, Dengan Komitmen.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 01: Transparansi */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-slate-200 group-hover:text-blue-200 transition-colors">01</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900">Transparansi</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Informasi publik yang terbuka dan mudah diakses bagi seluruh masyarakat melalui kanal resmi digital dan fisik.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-blue-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Keterbukaan Data</span>
            </div>
          </div>

          {/* 02: Akuntabilitas */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-slate-200 group-hover:text-emerald-200 transition-colors">02</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900">Akuntabilitas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pelayanan yang dapat dipertanggungjawabkan sesuai standar, alokasi anggaran terukur, dan regulasi baku daerah.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Audit Berkala</span>
            </div>
          </div>

          {/* 03: Responsivitas */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-slate-200 group-hover:text-amber-200 transition-colors">03</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900">Responsivitas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pelayanan yang cepat dan tanggap terhadap kebutuhan warga serta penanganan laporan keluhan secara real-time.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-amber-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              <span>SLA Pelaporan Terpantau</span>
            </div>
          </div>

          {/* 04: Inklusivitas */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-slate-200 group-hover:text-indigo-200 transition-colors">04</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900">Inklusivitas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pelayanan yang dapat dijangkau seluruh lapisan masyarakat tanpa diskriminasi, ramah difabel dan kelompok rentan.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[11px] font-bold text-indigo-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span>Aksesibilitas Universal</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: STRUKTUR WILAYAH ADMINISTRATIF (Connected Horizontal Flow)
          ========================================================================= */}
      <section id="wilayah" className="space-y-6 pt-6 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Hierarki Spasial</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Struktur Wilayah Administratif
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Kenali pembagian wilayah kota mulai dari kecamatan hingga lingkungan tempat tinggal masyarakat.
            </p>
          </div>
          <a
            href="#tabel-wilayah"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0 shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Lihat Seluruh Wilayah</span>
          </a>
        </div>

        {/* 5-Step Connected Hierarchy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* LEVEL 01 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">LEVEL 01</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">KOTA</h4>
              <p className="text-xs text-slate-400 font-medium">Pemerintah Kota Otonom</p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-snug">
              Regulasi & Kebijakan Makro
            </div>
          </div>

          {/* LEVEL 02 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">LEVEL 02</span>
              <Landmark className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">KECAMATAN</h4>
              <p className="text-xs text-slate-400 font-medium">Perangkat Daerah Wilayah</p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-snug">
              Koordinasi Pembinaan Sektor
            </div>
          </div>

          {/* LEVEL 03 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">LEVEL 03</span>
              <Building className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">KELURAHAN</h4>
              <p className="text-xs text-slate-400 font-medium">Penyelenggara Layanan Sipil</p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-snug">
              Layanan Administrasi Warga
            </div>
          </div>

          {/* RW */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">MITRA LKK</span>
              <Network className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">RW</h4>
              <p className="text-xs text-slate-400 font-medium">Rukun Warga</p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-snug">
              Integrasi Antar-Lingkungan
            </div>
          </div>

          {/* RT */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">MITRA LKK</span>
              <Home className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900">RT</h4>
              <p className="text-xs text-slate-400 font-medium">Rukun Tetangga</p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-snug">
              Koordinasi Kerukunan Warga
            </div>
          </div>
        </div>

        {/* Regulation Callout Note */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100/90 text-xs text-slate-600 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Catatan Regulasi:</strong> RT (Rukun Tetangga) dan RW (Rukun Warga) adalah Lembaga Kemasyarakatan Kelurahan (LKK) yang berperan sebagai mitra pemerintah kota dalam memelihara kerukunan serta membantu kelancaran pelayanan administrasi, dan bukan merupakan jenjang birokrasi pemerintahan daerah formal.
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION: TABEL WILAYAH KECAMATAN (Deck View)
          ========================================================================= */}
      <div id="tabel-wilayah" className="space-y-4 pt-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Kecamatan</th>
                  <th className="py-3.5 px-6">Wilayah Zona</th>
                  <th className="py-3.5 px-6">Kelurahan Naungan</th>
                  <th className="py-3.5 px-6">Pusat Layanan Warga</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {kecamatanRows.map((row, idx) => {
                  const isExpanded = activeKecamatan === idx;
                  return (
                    <React.Fragment key={idx}>
                      <tr 
                        className={`transition-colors cursor-pointer ${isExpanded ? 'bg-blue-50/60 font-semibold' : 'hover:bg-slate-50/60'}`}
                        onClick={() => setActiveKecamatan(isExpanded ? null : idx)}
                      >
                        <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            <span>{row.nama}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          <span>{row.zona}</span>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-md text-[11px] font-bold">
                            {row.kelurahan}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500 font-mono whitespace-nowrap">
                          {row.pusatLayanan}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveKecamatan(isExpanded ? null : idx);
                            }}
                            className="text-blue-600 font-semibold inline-flex items-center gap-1 group-hover:underline cursor-pointer"
                          >
                            <span>{isExpanded ? 'Tutup Detail' : 'Detail Wilayah'}</span>
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ease-out ${isExpanded ? 'rotate-90 text-blue-700' : 'text-blue-600'}`} />
                          </button>
                        </td>
                      </tr>

                      {/* Expand immediately underneath the selected row with smooth fluid animation */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan={5} className="p-0 overflow-hidden">
                            <div className="animate-table-expand overflow-hidden">
                              <div className="p-4 sm:p-6">
                                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                                    <div>
                                      <div className="inline-flex items-center gap-2 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/80">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                                        <span>TABEL LENGKAP KELURAHAN NAUNGAN</span>
                                      </div>
                                      <h4 className="text-sm sm:text-base font-black text-slate-900 mt-1">
                                        Daftar Kelurahan di {row.nama}
                                      </h4>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        {row.deskripsi}
                                      </p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-[11px] font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                                        Total: {row.kelurahanList.length} Kelurahan
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveKecamatan(null);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                        title="Tutup tabel rincian"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Complete Sub-Table */}
                                  <div className="rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
                                    <table className="w-full text-left border-collapse text-xs">
                                      <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                          <th className="py-2.5 px-3.5 w-12 text-center">No</th>
                                          <th className="py-2.5 px-3.5">Nama Kelurahan</th>
                                          <th className="py-2.5 px-3.5">Kode Pos</th>
                                          <th className="py-2.5 px-3.5">Cakupan Wilayah</th>
                                          <th className="py-2.5 px-3.5">Alamat Kantor Kelurahan</th>
                                          <th className="py-2.5 px-3.5 text-center">Status Portal</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {row.kelurahanList.map((kel, i) => (
                                          <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                                            <td className="py-2.5 px-3.5 text-center font-mono text-slate-400 text-[11px]">{i + 1}</td>
                                            <td className="py-2.5 px-3.5 font-bold text-slate-900">{kel.nama}</td>
                                            <td className="py-2.5 px-3.5 font-mono text-slate-500">{kel.kodePos}</td>
                                            <td className="py-2.5 px-3.5 text-slate-600 font-medium">{kel.rtRw}</td>
                                            <td className="py-2.5 px-3.5 text-slate-500">{kel.alamat}</td>
                                            <td className="py-2.5 px-3.5 text-center">
                                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                <span>{kel.status}</span>
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION: STRUKTUR PEMERINTAHAN KOTA (Bagan Birokrasi)
          ========================================================================= */}
      <section className="space-y-8 pt-6 border-t border-slate-100">
        <div className="max-w-2xl space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Bagan Birokrasi</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Struktur Pemerintahan Kota
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Struktur kepemimpinan eksekutif dan perangkat daerah penyelenggara urusan wajib dan pilihan perkotaan berdasarkan perundang-undangan.
          </p>
        </div>

        {/* Clean Organizational Architecture */}
        <div className="max-w-4xl mx-auto space-y-5">
          
          {/* Tier 1: Wali Kota & Wakil Wali Kota */}
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-5 border-2 border-blue-600 shadow-sm text-center space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              PIMPINAN EKSEKUTIF TERTINGGI
            </span>
            <h3 className="text-xl font-black text-slate-900 pt-1">
              Wali Kota & Wakil Wali Kota
            </h3>
            <p className="text-xs text-slate-500">
              Kepala Daerah & Wakil Kepala Daerah Otonom
            </p>
          </div>

          {/* Subtle Connector Node */}
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-5 bg-blue-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <div className="w-0.5 h-5 bg-blue-200" />
          </div>

          {/* Tier 2: Sekda */}
          <div className="max-w-md mx-auto bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs text-center space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
              KOORDINATOR ADMINISTRATIF
            </span>
            <h4 className="text-base font-extrabold text-slate-900 pt-1">
              Sekretariat Daerah (Sekda)
            </h4>
            <p className="text-xs text-slate-500">
              Penyusun Kebijakan Daerah & Pengoordinasi Perangkat Kerja
            </p>
          </div>

          {/* Subtle Split Connector */}
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-5 bg-slate-300" />
            <div className="w-full max-w-lg h-px bg-slate-200" />
          </div>

          {/* Tier 3: Dual Pillars (OPD & Satuan Kerja Kewilayahan) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Column 1: OPD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">FUNGSI PELAKSANA TEKNIS</div>
                  <h4 className="text-base font-black text-slate-900 mt-0.5">Organisasi Perangkat Daerah (OPD)</h4>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2.5">
                  <div>
                    <div className="font-bold text-slate-900">Dinas-Dinas Teknis Perkotaan</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Pekerjaan Umum, Kesehatan, Pendidikan, Perhubungan</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2.5">
                  <div>
                    <div className="font-bold text-slate-900">Badan Perencanaan & Pendapatan</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Bappeda, BPKAD, Bapenda Kota</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2.5">
                  <div>
                    <div className="font-bold text-slate-900">Inspektorat Daerah Kota</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Pengawasan Internal & Akuntabilitas Penyelenggaraan</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                </div>
              </div>
            </div>

            {/* Column 2: Satuan Kerja Kewilayahan */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">FUNGSI GARIS DEPAN</div>
                  <h4 className="text-base font-black text-slate-900 mt-0.5">Satuan Kerja Kewilayahan</h4>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2.5">
                  <div>
                    <div className="font-bold text-slate-900">Kantor-Kantor Kecamatan</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Pelaksana Urusan Pemerintahan Umum di Wilayah</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2.5">
                  <div>
                    <div className="font-bold text-slate-900">Kantor-Kantor Kelurahan</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Penyelenggaraan Administrasi Lingkungan & Layanan KTP/KK</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2.5">
                  <div>
                    <div className="font-bold text-slate-900">Lembaga Kemasyarakatan Kelurahan</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Fasilitasi Gotong Royong Rukun Warga & Rukun Tetangga</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Document Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Dokumen Resmi Tata Kerja Pemerintahan Daerah:</strong>
                <span className="text-slate-500 block sm:inline sm:ml-1">Sesuai Peraturan Daerah Kota tentang Pembentukan & Susunan Perangkat Daerah.</span>
              </span>
            </div>
            <button 
              type="button" 
              onClick={() => alert('Dokumen Perda Nomor 1 tentang Susunan Organisasi dan Tata Kerja Kota dapat diunduh melalui JDIH Resmi Kota.')}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold shrink-0 inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh Salinan Perda</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
