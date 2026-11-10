import React, { useState, useRef, useEffect } from 'react';
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
  CheckCircle2, 
  BookOpen,
  ChevronRight,
  ChevronDown,
  FileText,
  X
} from 'lucide-react';

interface SmoothExpandableRowProps {
  isOpen: boolean;
  children: React.ReactNode;
}

const SmoothExpandableRow: React.FC<SmoothExpandableRowProps> = ({ isOpen, children }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [height, setHeight] = useState<string | number>(isOpen ? 'auto' : 0);
  const [opacity, setOpacity] = useState(isOpen ? 1 : 0);
  const [translateY, setTranslateY] = useState(isOpen ? 0 : -10);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isOpen) {
      setShouldRender(true);
      setHeight(0);
      setOpacity(0);
      setTranslateY(-10);

      // Double rAF ensures the initial state is painted before animating
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          if (contentRef.current) {
            const targetHeight = contentRef.current.scrollHeight;
            setHeight(targetHeight);
            setOpacity(1);
            setTranslateY(0);
          }
        });
        return () => cancelAnimationFrame(raf2);
      });

      timer = setTimeout(() => {
        setHeight('auto');
      }, 360);

      return () => {
        cancelAnimationFrame(raf1);
        clearTimeout(timer);
      };
    } else {
      if (shouldRender) {
        // Lock current height before collapsing down
        if (contentRef.current) {
          const currentHeight = contentRef.current.scrollHeight;
          setHeight(currentHeight);
        }

        const raf1 = requestAnimationFrame(() => {
          const raf2 = requestAnimationFrame(() => {
            setHeight(0);
            setOpacity(0);
            setTranslateY(-10);
          });
          return () => cancelAnimationFrame(raf2);
        });

        timer = setTimeout(() => {
          setShouldRender(false);
        }, 340);

        return () => {
          cancelAnimationFrame(raf1);
          clearTimeout(timer);
        };
      }
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <tr className="bg-slate-50/70 border-b border-slate-200">
      <td colSpan={4} className="p-0 overflow-hidden">
        <div
          ref={contentRef}
          style={{
            height: typeof height === 'number' ? `${height}px` : height,
            opacity,
            transform: `translateY(${translateY}px)`,
            transition: 'height 340ms cubic-bezier(0.16, 1, 0.3, 1), opacity 280ms ease, transform 340ms cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
            willChange: 'height, opacity, transform',
          }}
        >
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </div>
      </td>
    </tr>
  );
};

export const ProfilDesaPage: React.FC = () => {
  const [activeKecamatan, setActiveKecamatan] = useState<number | null>(null);

  const kecamatanRows = [
    {
      nama: 'Kecamatan Wilayah Pusat',
      zona: 'Pemerintahan & Perdagangan',
      kelurahan: '6 Kelurahan',
      kelurahanList: [
        { nama: 'Balowerti', kodePos: '64121', rtRw: '32 RT / 6 RW', alamat: 'Jl. Balowerti Gang 2 No. 15' },
        { nama: 'Banjaran', kodePos: '64124', rtRw: '28 RT / 5 RW', alamat: 'Jl. Slamet Riyadi No. 14' },
        { nama: 'Dandangan', kodePos: '64122', rtRw: '26 RT / 5 RW', alamat: 'Jl. Raden Patah No. 8' },
        { nama: 'Kampungdalem', kodePos: '64123', rtRw: '20 RT / 4 RW', alamat: 'Jl. KH Wachid Hasyim No. 12' },
        { nama: 'Kemasan', kodePos: '64125', rtRw: '22 RT / 4 RW', alamat: 'Jl. Pattimura No. 35' },
        { nama: 'Semampir', kodePos: '64121', rtRw: '35 RT / 7 RW', alamat: 'Jl. Mayor Bismo No. 42' },
      ]
    },
    {
      nama: 'Kecamatan Wilayah Barat',
      zona: 'Residensial & Kesehatan',
      kelurahan: '8 Kelurahan',
      kelurahanList: [
        { nama: 'Bandar Kidul', kodePos: '64118', rtRw: '25 RT / 5 RW', alamat: 'Jl. KH Agus Salim No. 19' },
        { nama: 'Bandar Lor', kodePos: '64117', rtRw: '30 RT / 6 RW', alamat: 'Jl. Mojoroto Indah No. 5' },
        { nama: 'Campurejo', kodePos: '64116', rtRw: '24 RT / 4 RW', alamat: 'Jl. Veteran No. 11' },
        { nama: 'Dermo', kodePos: '64111', rtRw: '22 RT / 4 RW', alamat: 'Jl. Dr. Sahardjo No. 7' },
        { nama: 'Lirboyo', kodePos: '64117', rtRw: '34 RT / 7 RW', alamat: 'Jl. KH Abdul Karim No. 1' },
        { nama: 'Mojoroto', kodePos: '64112', rtRw: '38 RT / 8 RW', alamat: 'Jl. Kawi No. 45' },
        { nama: 'Sukorame', kodePos: '64114', rtRw: '27 RT / 5 RW', alamat: 'Jl. Selomangleng No. 18' },
        { nama: 'Tamanan', kodePos: '64115', rtRw: '23 RT / 4 RW', alamat: 'Jl. Semeru No. 33' },
      ]
    },
    {
      nama: 'Kecamatan Wilayah Timur',
      zona: 'Pendidikan Tinggi & Riset',
      kelurahan: '7 Kelurahan',
      kelurahanList: [
        { nama: 'Bangsal', kodePos: '64131', rtRw: '26 RT / 5 RW', alamat: 'Jl. Kapten Tendean No. 15' },
        { nama: 'Burengan', kodePos: '64131', rtRw: '29 RT / 6 RW', alamat: 'Jl. Letjen Sutoyo No. 22' },
        { nama: 'Jamsaren', kodePos: '64132', rtRw: '24 RT / 4 RW', alamat: 'Jl. Brigjen Pol IBH Pranoto No. 5' },
        { nama: 'Pakunden', kodePos: '64132', rtRw: '25 RT / 5 RW', alamat: 'Jl. Cendekia No. 4' },
        { nama: 'Singonegaran', kodePos: '64132', rtRw: '28 RT / 5 RW', alamat: 'Jl. Hos Cokroaminoto No. 9' },
        { nama: 'Tempurejo', kodePos: '64133', rtRw: '21 RT / 4 RW', alamat: 'Jl. Pesantren Indah No. 8' },
        { nama: 'Tosaren', kodePos: '64133', rtRw: '27 RT / 5 RW', alamat: 'Jl. Sunan Kalijaga No. 14' },
      ]
    },
    {
      nama: 'Kecamatan Wilayah Selatan',
      zona: 'Industri & Agribisnis',
      kelurahan: '5 Kelurahan',
      kelurahanList: [
        { nama: 'Banaran', kodePos: '64135', rtRw: '22 RT / 4 RW', alamat: 'Jl. Agro Selatan No. 102' },
        { nama: 'Bawang', kodePos: '64136', rtRw: '20 RT / 4 RW', alamat: 'Jl. Bawang Raya No. 17' },
        { nama: 'Betet', kodePos: '64134', rtRw: '24 RT / 5 RW', alamat: 'Jl. Industri Selatan No. 2' },
        { nama: 'Blabak', kodePos: '64135', rtRw: '26 RT / 5 RW', alamat: 'Jl. Raya Kediri-Blitar No. 48' },
        { nama: 'Ketami', kodePos: '64136', rtRw: '19 RT / 4 RW', alamat: 'Jl. Ketami Indah No. 10' },
      ]
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 font-sans text-slate-800 space-y-16 sm:space-y-20">

      {/* HERO SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="md:col-span-7 space-y-4 sm:space-y-6 text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Mengenal Kota Lebih Dekat.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
            Informasi pembagian wilayah administratif, tata kelola, dan komitmen pelayanan publik dalam satu ekosistem digital terpadu.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
            <a href="#wilayah" className="w-full sm:w-auto px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2">
              <span>Jelajahi Wilayah</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#tata-kelola" className="w-full sm:w-auto px-5 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200/90 transition-all flex items-center justify-center gap-2 shadow-2xs">
              <span>Tata Kelola</span>
              <BookOpen className="w-4 h-4 text-slate-400" />
            </a>
          </div>
        </div>

        <div className="md:col-span-5 rounded-3xl overflow-hidden border border-slate-200/90 shadow-md bg-white">
          <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 overflow-hidden bg-slate-100">
            <img src="/images/landing/about_img.webp" alt="Pusat Pemerintahan" className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>PUSAT PEMERINTAHAN TERPADU</span>
            </div>
          </div>
          <div className="p-3.5 sm:p-4 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">Kawasan Pusat Pemerintahan & Ruang Publik</span>
            </div>
            <span className="font-mono text-slate-400 shrink-0 pl-2">40115</span>
          </div>
        </div>
      </section>

      {/* TENTANG KOTA */}
      <section className="space-y-6 pt-6 border-t border-slate-100">
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Tentang Kota</div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-snug max-w-3xl">
            Membangun kota yang terhubung melalui pemerintahan transparan dan pelayanan responsif.
          </h2>
        </div>

        {/* Responsive 3-Metric Cards: Compact on mobile, 3-column on tablet/desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Tingkat Pertama</span>
                <span className="font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">ADM-01</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-1 bg-slate-900 rounded-full" />
                <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">Kecamatan</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Wilayah kerja camat yang mengoordinasikan penyelenggaraan ketenteraman dan pelayanan umum.
              </p>
            </div>
            <div className="pt-2.5 border-t border-slate-100 text-[11px] font-bold text-blue-600">Sentra PATEN</div>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Tingkat Kelurahan</span>
                <span className="font-mono text-sky-600 bg-sky-50 px-2 py-0.5 rounded">ADM-02</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-1 bg-slate-900 rounded-full" />
                <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-600 transition-colors">Kelurahan</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pusat layanan garis depan untuk administrasi kependudukan, perizinan mikro, dan ketertiban.
              </p>
            </div>
            <div className="pt-2.5 border-t border-slate-100 text-[11px] font-bold text-sky-600">Administrasi Sipil</div>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Demografi Agregat</span>
                <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">DUKCAPIL</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-4 h-1 bg-slate-900 rounded-full" />
                <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">Jiwa Terdata</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pembaruan berkala agregat kependudukan resmi untuk perencanaan subsidi dan fasilitas umum.
              </p>
            </div>
            <div className="pt-2.5 border-t border-slate-100 text-[11px] font-bold text-emerald-600">Integrasi SAKIP</div>
          </div>
        </div>
      </section>

      {/* PRINSIP TATA KELOLA */}
      <section id="tata-kelola" className="space-y-6 pt-6 border-t border-slate-100">
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Prinsip Tata Kelola</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Pelayanan Publik, Dengan Komitmen.</h2>
        </div>

        {/* 2x2 Grid on Mobile, 4-Cols on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {[
            { num: '01', title: 'Transparansi', desc: 'Informasi publik terbuka dan mudah diakses melalui kanal resmi digital dan fisik.', color: 'blue', Icon: Eye, dot: 'bg-blue-600', label: 'Keterbukaan Data', textColor: 'text-blue-700', dotHover: 'group-hover:text-blue-200' },
            { num: '02', title: 'Akuntabilitas', desc: 'Layanan terstandar, anggaran terukur, dan regulasi baku daerah yang dapat diaudit.', color: 'emerald', Icon: ShieldCheck, dot: 'bg-emerald-600', label: 'Audit Berkala', textColor: 'text-emerald-700', dotHover: 'group-hover:text-emerald-200' },
            { num: '03', title: 'Responsivitas', desc: 'Tanggap terhadap kebutuhan warga dan penanganan laporan keluhan secara real-time.', color: 'amber', Icon: Zap, dot: 'bg-amber-600', label: 'SLA Pelaporan', textColor: 'text-amber-700', dotHover: 'group-hover:text-amber-200' },
            { num: '04', title: 'Inklusivitas', desc: 'Layanan terjangkau semua lapisan masyarakat, ramah difabel dan kelompok rentan.', color: 'indigo', Icon: Users, dot: 'bg-indigo-600', label: 'Akses Universal', textColor: 'text-indigo-700', dotHover: 'group-hover:text-indigo-200' },
          ].map(({ num, title, desc, Icon, dot, label, textColor, dotHover, color }) => (
            <div key={num} className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all space-y-3 flex flex-col justify-between group">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-2xl sm:text-3xl font-black text-slate-200 transition-colors ${dotHover}`}>{num}</span>
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{title}</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-3 sm:line-clamp-none">{desc}</p>
              </div>
              <div className={`pt-2.5 border-t border-slate-100 text-[10px] sm:text-[11px] font-bold ${textColor} flex items-center gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                <span className="truncate">{label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STRUKTUR WILAYAH */}
      <section id="wilayah" className="space-y-6 pt-6 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Hierarki Spasial</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Struktur Wilayah Administratif</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Pembagian wilayah dari kota, kecamatan hingga lingkungan RT/RW.</p>
          </div>
          <a href="#tabel-wilayah" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            <span>Lihat Seluruh Wilayah</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* MOBILE VIEW (Swipeable Native Snap Cards) */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2 px-1">
            <span>Tingkatan Wilayah</span>
            <span className="text-blue-600 text-[11px] font-semibold flex items-center gap-1">
              Geser jenjang &rarr;
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4">
            {[
              { level: 'LEVEL 01', title: 'KOTA', sub: 'Pemerintah Kota Otonom', desc: 'Regulasi & Kebijakan Makro', Icon: Building2 },
              { level: 'LEVEL 02', title: 'KECAMATAN', sub: 'Perangkat Daerah Wilayah', desc: 'Koordinasi Pembinaan', Icon: Landmark },
              { level: 'LEVEL 03', title: 'KELURAHAN', sub: 'Penyelenggara Layanan Sipil', desc: 'Administrasi Warga', Icon: Building },
              { level: 'MITRA LKK', title: 'RW', sub: 'Rukun Warga', desc: 'Integrasi Antar-Lingkungan', Icon: Network, muted: true },
              { level: 'MITRA LKK', title: 'RT', sub: 'Rukun Tetangga', desc: 'Koordinasi Kerukunan', Icon: Home, muted: true },
            ].map(({ level, title, sub, desc, Icon, muted }) => (
              <div key={title} className="w-[72vw] max-w-[250px] shrink-0 snap-center bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${muted ? 'text-slate-600 bg-slate-100 border-slate-200' : 'text-blue-700 bg-blue-50 border-blue-100'}`}>{level}</span>
                  <Icon className={`w-4 h-4 ${muted ? 'text-slate-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">{title}</h4>
                  <p className="text-xs text-slate-400 font-medium">{sub}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* TABLET & DESKTOP VIEW (Grid) */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[
            { level: 'LEVEL 01', title: 'KOTA', sub: 'Pemerintah Kota Otonom', desc: 'Regulasi & Kebijakan Makro', Icon: Building2 },
            { level: 'LEVEL 02', title: 'KECAMATAN', sub: 'Perangkat Daerah Wilayah', desc: 'Koordinasi Pembinaan', Icon: Landmark },
            { level: 'LEVEL 03', title: 'KELURAHAN', sub: 'Penyelenggara Layanan Sipil', desc: 'Administrasi Warga', Icon: Building },
            { level: 'MITRA LKK', title: 'RW', sub: 'Rukun Warga', desc: 'Integrasi Antar-Lingkungan', Icon: Network, muted: true },
            { level: 'MITRA LKK', title: 'RT', sub: 'Rukun Tetangga', desc: 'Koordinasi Kerukunan', Icon: Home, muted: true },
          ].map(({ level, title, sub, desc, Icon, muted }) => (
            <div key={title} className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${muted ? 'text-slate-600 bg-slate-100 border-slate-200' : 'text-blue-700 bg-blue-50 border-blue-100'}`}>{level}</span>
                <Icon className={`w-4 h-4 ${muted ? 'text-slate-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">{title}</h4>
                <p className="text-xs text-slate-400 font-medium">{sub}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">{desc}</div>
            </div>
          ))}
        </div>

        {/* Catatan Regulasi LKK */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
          <BookOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-800">Catatan Regulasi:</strong> RT (Rukun Tetangga) dan RW (Rukun Warga) merupakan Lembaga Kemasyarakatan Kelurahan (LKK) mitra resmi pemerintah kota dalam memelihara kerukunan serta membantu kelancaran pelayanan administrasi warga.
          </span>
        </div>
      </section>

      {/* TABEL KECAMATAN & DETAIL WILAYAH */}
      <div id="tabel-wilayah" className="space-y-4 pt-4">
        {/* DESKTOP & TABLET VIEW (md:block) - Standard Reference Table */}
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Kecamatan</th>
                  <th className="py-3.5 px-6">Zona</th>
                  <th className="py-3.5 px-6">Kelurahan</th>
                  <th className="py-3.5 px-6 text-right">Detail</th>
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
                        <td className="py-4 px-6 text-slate-600">{row.zona}</td>
                        <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-md text-[11px] font-bold">{row.kelurahan}</span>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveKecamatan(isExpanded ? null : idx); }}
                            className="text-blue-600 font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Tutup' : 'Lihat'}</span>
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                        </td>
                      </tr>

                      <SmoothExpandableRow isOpen={isExpanded}>
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h4 className="text-sm sm:text-base font-black text-slate-900">
                              Kelurahan di {row.nama}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
                                {row.kelurahanList.length} Kelurahan
                              </span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setActiveKecamatan(null); }}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Tutup detail"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                  <th className="py-2.5 px-3.5 w-12 text-center">No</th>
                                  <th className="py-2.5 px-3.5">Kelurahan</th>
                                  <th className="py-2.5 px-3.5">Kode Pos</th>
                                  <th className="py-2.5 px-3.5">Cakupan</th>
                                  <th className="py-2.5 px-3.5">Alamat</th>
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
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </SmoothExpandableRow>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE VIEW (md:hidden) - Zero-Overflow Touch Accordion Cards */}
        <div className="md:hidden space-y-3">
          {kecamatanRows.map((row, idx) => {
            const isExpanded = activeKecamatan === idx;
            return (
              <div 
                key={idx} 
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-2xs ${
                  isExpanded ? 'border-blue-400 ring-2 ring-blue-500/10' : 'border-slate-200/90'
                }`}
              >
                {/* Mobile Kecamatan Header */}
                <div 
                  onClick={() => setActiveKecamatan(isExpanded ? null : idx)}
                  className={`p-4 flex items-center justify-between cursor-pointer select-none transition-colors ${
                    isExpanded ? 'bg-blue-50/60' : 'hover:bg-slate-50/60 active:bg-slate-100/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                      <h4 className="font-extrabold text-sm text-slate-900">{row.nama}</h4>
                    </div>
                    <div className="text-[11px] text-slate-500 pl-4.5 font-medium">{row.zona}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                      {row.kelurahan}
                    </span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 ${
                      isExpanded ? 'rotate-90 bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Mobile Smooth Accordion Body */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-3 sm:p-4 space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1 pb-1">
                      <span>Kelurahan di {row.nama}</span>
                      <button 
                        onClick={() => setActiveKecamatan(null)} 
                        className="text-blue-600 hover:text-blue-700 text-xs font-bold"
                      >
                        Tutup
                      </button>
                    </div>

                    <div className="space-y-2">
                      {row.kelurahanList.map((kel, kIdx) => (
                        <div key={kIdx} className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-700 font-mono text-[10px] font-bold flex items-center justify-center">
                                {kIdx + 1}
                              </span>
                              <span className="font-extrabold text-xs text-slate-900">{kel.nama}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {kel.kodePos}
                            </span>
                          </div>

                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-semibold text-slate-700">{kel.rtRw}</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[180px]">{kel.alamat}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* STRUKTUR PEMERINTAHAN (BAGAN BIROKRASI) */}
      <section className="space-y-6 pt-6 border-t border-slate-100">
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Bagan Birokrasi</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Struktur Pemerintahan Kota</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Kepemimpinan eksekutif dan perangkat daerah penyelenggara urusan perkotaan.</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-4 sm:p-5 border-2 border-blue-600 shadow-sm text-center space-y-1">
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Pimpinan Eksekutif Tertinggi</div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">Wali Kota & Wakil Wali Kota</h3>
            <p className="text-xs text-slate-500">Kepala Daerah & Wakil Kepala Daerah Otonom</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-0.5 h-4 sm:h-5 bg-blue-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <div className="w-0.5 h-4 sm:h-5 bg-blue-200" />
          </div>

          <div className="max-w-md mx-auto bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs text-center space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Koordinator Administratif</div>
            <h4 className="text-base font-extrabold text-slate-900">Sekretariat Daerah (Sekda)</h4>
            <p className="text-xs text-slate-500">Penyusun Kebijakan Daerah & Pengoordinasi Perangkat Kerja</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-0.5 h-4 sm:h-5 bg-slate-300" />
            <div className="w-full max-w-lg h-px bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pt-1">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fungsi Pelaksana Teknis</div>
                  <h4 className="text-base font-black text-slate-900">Organisasi Perangkat Daerah (OPD)</h4>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-2.5 text-xs">
                {[
                  { title: 'Dinas-Dinas Teknis', sub: 'PU, Kesehatan, Pendidikan, Perhubungan' },
                  { title: 'Badan Perencanaan & Pendapatan', sub: 'Bappeda, BPKAD, Bapenda' },
                  { title: 'Inspektorat Daerah', sub: 'Pengawasan Internal & Akuntabilitas' },
                ].map(({ title, sub }) => (
                  <div key={title} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2.5">
                    <div>
                      <div className="font-bold text-slate-900">{title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fungsi Garis Depan</div>
                  <h4 className="text-base font-black text-slate-900">Satuan Kerja Kewilayahan</h4>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-2.5 text-xs">
                {[
                  { title: 'Kantor Kecamatan', sub: 'Pelaksana Urusan Pemerintahan Wilayah' },
                  { title: 'Kantor Kelurahan', sub: 'Administrasi Lingkungan & Layanan KTP/KK' },
                  { title: 'Lembaga Kemasyarakatan', sub: 'Fasilitasi Gotong Royong RW & RT' },
                ].map(({ title, sub }) => (
                  <div key={title} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-2.5">
                    <div>
                      <div className="font-bold text-slate-900">{title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-700 text-center sm:text-left">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-slate-500">Sesuai Peraturan Daerah tentang Pembentukan & Susunan Perangkat Daerah.</span>
            </div>
            <button
              type="button"
              onClick={() => alert('Dokumen Perda dapat diunduh melalui JDIH Resmi Kota.')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold shrink-0 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh Perda</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};