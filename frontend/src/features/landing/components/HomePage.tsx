import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  Check,
  Zap,
  QrCode,
  ChevronDown,
  Layers,
  Smartphone,
  Building2,
  ExternalLink,
  Activity,
  CheckSquare,
  Send,
  MessageSquare,
  Award,
  Home,
  Briefcase
} from "lucide-react";
import api from "@/shared/lib/axios";
import { DesaSetting, Berita, Pengumuman } from "@/shared/types";
import { VillageStats } from "../types";
import { useAuth } from "@/shared/context/AuthContext";

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [desa, setDesa] = useState<DesaSetting | null>(null);
  const [stats, setStats] = useState<VillageStats | null>(null);
  const [beritas, setBeritas] = useState<Berita[]>([]);
  const [pengumumans, setPengumumans] = useState<Pengumuman[]>([]);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const featureScrollRef = React.useRef<HTMLDivElement>(null);
  const testimonialScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollToFeature = (idx: number) => {
    setActiveFeatureIndex(idx);
    if (featureScrollRef.current) {
      const card = featureScrollRef.current.children[idx] as HTMLElement;
      if (card) {
        card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  };

  const scrollToTestimonial = (idx: number) => {
    setActiveTestimonialIndex(idx);
    if (testimonialScrollRef.current) {
      const card = testimonialScrollRef.current.children[idx] as HTMLElement;
      if (card) {
        card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  };

  // Stats number counting animation starting from 0
  const [countWarga, setCountWarga] = useState(0);
  const [countSurat, setCountSurat] = useState(0);
  const [countSla, setCountSla] = useState(0);
  const [countDusun, setCountDusun] = useState(0);
  const [countRt, setCountRt] = useState(0);

  useEffect(() => {
    const targetW = stats?.total_warga ?? stats?.penduduk_total ?? 286500;
    const targetS = stats?.total_surat_selesai ?? stats?.surat_selesai ?? 18450;
    const targetSl = 15;
    const targetD = stats?.total_dusun ?? 46;
    const targetR = stats?.total_rt ?? 1420;

    let startTimestamp: number | null = null;
    const duration = 1200; // ms
    let animFrame: number;

    const animateCounts = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      setCountWarga(Math.round(ease * targetW));
      setCountSurat(Math.round(ease * targetS));
      setCountSla(Math.round(ease * targetSl));
      setCountDusun(Math.round(ease * targetD));
      setCountRt(Math.round(ease * targetR));

      if (progress < 1) {
        animFrame = requestAnimationFrame(animateCounts);
      } else {
        setCountWarga(targetW);
        setCountSurat(targetS);
        setCountSla(targetSl);
        setCountDusun(targetD);
        setCountRt(targetR);
      }
    };

    animFrame = requestAnimationFrame(animateCounts);
    return () => cancelAnimationFrame(animFrame);
  }, [stats]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [desaRes, statsRes, beritaRes, pengumumanRes] = await Promise.all([
          api.get("/settings/desa").catch(() => null),
          api.get("/public/stats").catch(() => null),
          api.get("/public/beritas").catch(() => null),
          api.get("/public/pengumumans").catch(() => null),
        ]);

        if (desaRes?.data?.data) setDesa(desaRes.data.data);
        if (statsRes?.data?.data) setStats(statsRes.data.data);
        if (beritaRes?.data?.data) setBeritas(beritaRes.data.data.slice(0, 3));
        if (pengumumanRes?.data?.data) setPengumumans(pengumumanRes.data.data.slice(0, 3));
      } catch (err) {
        console.error("Failed loading home data", err);
      }
    };

    fetchHomeData();
  }, []);

  const bentoFeatures = [
    {
      id: "surat",
      tag: "LAYANAN MANDIRI",
      title: "Pengajuan Administrasi Terpadu",
      desc: "Urus 14+ jenis surat resmi dan rekomendasi izin langsung dari smartphone tanpa antre.",
      icon: FileText,
      iconBg: "bg-sky-50 text-sky-600 border border-sky-100",
      link: "/layanan-surat",
    },
    {
      id: "kolaborasi",
      tag: "DISPOSISI TINGKAT RT/RW & PATEN",
      title: "Alur Tata Kelola Berjenjang",
      desc: "Validasi berjenjang oleh RT, RW, Kelurahan hingga loket PATEN Kecamatan secara real-time.",
      icon: Users,
      iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
      link: "/profil",
    },
    {
      id: "otomasi",
      tag: "TTE & LEGALITAS SAH BSrE",
      title: "Tanda Tangan QR Kriptografis",
      desc: "Sertifikasi tanda tangan elektronik berstandar BSSN dengan segel QR audit hash anti-pemalsuan.",
      icon: QrCode,
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      link: "/lacak",
    },
    {
      id: "transparansi",
      tag: "AKUNTABILITAS PUBLIK",
      title: "Transparansi Anggaran & Bansos",
      desc: "Publikasi terbuka realisasi APBD/APBDes dan keterpaduan data penerima bantuan sosial DTKS.",
      icon: TrendingUp,
      iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
      link: "/transparansi",
    },
    {
      id: "hunian",
      tag: "PETA HUNIAN SPASIAL (SDG 11)",
      title: "Pencarian Kos & Kontrakan",
      desc: "Titik lokasi akurat di peta GIS, kontak pemilik terverifikasi RT, dan bebas penipuan sewa hunian.",
      icon: Home,
      iconBg: "bg-sky-50 text-sky-600 border border-sky-100",
      link: "/smart-city?tab=hunian",
    },
    {
      id: "pasar-loker",
      tag: "UMKM & LOKER KOTA (SDG 8 & 9)",
      title: "Pasar Dekat & Bursa Karir",
      desc: "Filter produk UMKM radius terdekat tanpa potongan dan portal bursa kerja resmi terverifikasi Disnaker.",
      icon: Briefcase,
      iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
      link: "/smart-city?tab=pasar",
    },
  ];

  const testimonials = [
    {
      quote: "Urus surat keterangan usaha dan izin cuma butuh waktu 15 menit dari HP. Sangat membantu pelaku UMKM kuliner di Kota Kediri tanpa perlu tutup warung untuk antre di kantor.",
      author: "Dewi Lestari",
      role: "Pelaku UMKM Kuliner Kota Kediri",
      avatar: "/images/user.png",
      rating: 5,
    },
    {
      quote: "Sebagai Ketua RT di wilayah perkotaan, verifikasi berkas warga dan listing kos baru sangat praktis. Notifikasi masuk realtime dan bisa di-ACC kapan saja dengan aman.",
      author: "Supriyadi",
      role: "Ketua RT Wilayah Kota Kediri",
      avatar: "/images/landing/person1.png",
      rating: 5,
    },
    {
      quote: "Cari tempat kos dekat kampus sangat mudah lewat Peta Hunian Spasial SiDesKu. Lokasinya akurat dan sudah ada lencana verifikasi RT jadi bebas penipuan calo.",
      author: "Siti Rahmawati",
      role: "Mahasiswa Pendatang Baru di Kota Kediri",
      avatar: "/images/landing/Author.png",
      rating: 5,
    },
    {
      quote: "Melamar kerja lewat Bursa Karir SiDesKu jauh lebih tenang karena seluruh perusahaannya diaudit dan diverifikasi langsung oleh Disnaker Kota Kediri, bebas pungli!",
      author: "Kevin Pratama",
      role: "Pencari Kerja Kota Kediri",
      avatar: "/images/landing/person1.png",
      rating: 5,
    },
  ];

  const faqs = [
    {
      q: "Berapa biaya pengurusan dokumen administrasi dan surat di SiDesKu?",
      a: "Seluruh pengurusan dokumen administrasi pemerintahan dan persuratan di SiDesKu 100% Bebas Biaya (Rp 0,-). Pelayanan publik ini disediakan secara gratis tanpa pungutan liar apapun.",
    },
    {
      q: "Berapa lama proses pembuatan surat dan disposisi hingga selesai?",
      a: "Rata-rata waktu pemrosesan berkas (SLA) adalah kurang dari 15 menit melalui alur disposisi berjenjang digital dari RT, RW, Kelurahan, hingga Camat.",
    },
    {
      q: "Bagaimana cara memverifikasi keaslian dokumen ber-QR Code?",
      a: "Setiap surat resmi yang diterbitkan memuat kode segel QR kriptografis unik. Siapa pun dapat memindai barcode tersebut atau memasukkan nomor resi pada menu Lacak Surat untuk verifikasi audit hash integritas dokumen.",
    },
    {
      q: "Bagaimana keterhubungan sistem dari lingkungan warga hingga ke tingkat Kota?",
      a: "SiDesKu mengintegrasikan tata kelola dari unit terkecil (RT/RW), Kelurahan, Kecamatan (Loket PATEN), hingga Command Center Kota Kediri (PUPR, Dinsos, Disnaker, dan Diskominfo).",
    },
  ];

  return (
    <div className="page-enter relative w-full overflow-hidden flex flex-col font-sans">
      
      {/* =========================================================================
          HERO SECTION (Flowora SaaS / Modern Product Landing Page Style)
          ========================================================================= */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16 lg:pb-24">
        
        {/* Subtle Ambient Backlight Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[420px] bg-gradient-to-b from-sky-400/20 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & CTAs (7 Cols on Desktop) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* City Scale Badge */}

            {/* Massive Bold Headline with Structured Gradient */}
            <h1 className="text-2xl sm:text-4xl text-title-accent lg:text-5xl font-extrabold tracking-tight leading-[1.18] sm:leading-[1.15]">
              Ekosistem Kota Cerdas, <br className="hidden sm:inline" />
              <span className="text-title-accent">
                Pelayanan Publik Tanpa Batas.
              </span>
            </h1>

            {/* Descriptive Subtitle - Simple & Clear for Regular Citizens */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
              Layanan digital terpadu warga Kota Kediri: urus surat mandiri, cek resi dokumen ber-QR, info kos, pasar UMKM, dan bursa kerja tanpa perlu antre di kantor.
            </p>

            {/* Action Buttons (Flowora Style: Primary Gradient Pill + Secondary Outlined Pill) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                to="/smart-city"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-sky-500/25 transition-all press-down flex items-center justify-center gap-2.5 group"
              >
                <span>Jelajahi Smart City Hub</span>
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/layanan-surat"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm sm:text-base border border-slate-200/90 shadow-2xs hover:border-sky-300 transition-all press-down flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Layanan Persuratan</span>
              </Link>
            </div>

            {/* Quick Access Tiles - Super Easy for Regular Citizens (Orang Awam) on Mobile & Tablet */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
              <Link
                to="/layanan-surat"
                className="p-3 rounded-2xl bg-white/90 border border-slate-200/90 hover:border-sky-300 hover:bg-sky-50/40 shadow-2xs transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-black text-slate-900 group-hover:text-sky-700 transition-colors truncate">Buat Surat</div>
                  <div className="text-[10px] text-slate-400 truncate">14+ Jenis Mandiri</div>
                </div>
              </Link>

              <Link
                to="/lacak"
                className="p-3 rounded-2xl bg-white/90 border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/40 shadow-2xs transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Search className="w-4.5 h-4.5" />
                </div>
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors truncate">Lacak Berkas</div>
                  <div className="text-[10px] text-slate-400 truncate">Resi & Segel QR</div>
                </div>
              </Link>

              <Link
                to="/smart-city"
                className="p-3 rounded-2xl bg-white/90 border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/40 shadow-2xs transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Home className="w-4.5 h-4.5" />
                </div>
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">Smart City</div>
                  <div className="text-[10px] text-slate-400 truncate">Kos, UMKM & Loker</div>
                </div>
              </Link>

              <Link
                to="/transparansi"
                className="p-3 rounded-2xl bg-white/90 border border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/40 shadow-2xs transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-4.5 h-4.5" />
                </div>
                <div className="text-left overflow-hidden">
                  <div className="text-xs font-black text-slate-900 group-hover:text-amber-700 transition-colors truncate">Transparansi</div>
                  <div className="text-[10px] text-slate-400 truncate">Anggaran & Bansos</div>
                </div>
              </Link>
            </div>

            {/* Trust Snippet & Social Proof Avatars */}
            <div className="pt-4 flex items-center gap-4 border-t border-slate-100">
              <div className="flex -space-x-2.5 overflow-hidden">
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="/images/user.png" alt="Warga 1" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="/images/landing/person1.png" alt="Warga 2" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" src="/images/landing/Author.png" alt="Warga 3" />
              </div>
              <div className="text-xs text-slate-600">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                  <span className="font-extrabold text-slate-900 ml-1 text-xs">4.9/5</span>
                </div>
                <div className="text-slate-500 mt-0.5 font-medium">Dipercaya oleh <strong className="text-slate-800">280.000+ Warga</strong>, 46 Kelurahan & {countRt} RT di Kota Kediri</div>
              </div>
            </div>

          </div>

          {/* Right Column: Flowora-Style Floating 3D Dashboard Mockup (5 Cols on Desktop) */}
          <div className="lg:col-span-5 relative perspective-mockup">
            
            {/* Ambient Decorative Gradient Orbs */}
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-tr from-sky-400/25 to-blue-500/15 rounded-full blur-2xl pointer-events-none -z-10" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-blue-400/25 to-sky-300/20 rounded-full blur-2xl pointer-events-none -z-10" />

            {/* Elevated Dashboard Mockup Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-sky-100/90 shadow-2xl shadow-sky-500/10 overflow-hidden relative tilted-mockup">
              
              {/* Window Header / Search Bar */}
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div className="flex-1 max-w-[200px] bg-white border border-slate-200/70 rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Search className="w-3 h-3 text-slate-400" />
                  <span className="truncate">Cari layanan atau berkas...</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              </div>

              {/* Mockup Dashboard Content */}
              <div className="p-5 space-y-4">
                
                {/* Dashboard Title & Mini Counter Strip */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Dashboard Pelayanan</h3>
                    <p className="text-[10px] text-slate-400">Statistik berkas hari ini</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Sistem Aktif 99.9%
                  </span>
                </div>

                {/* 3 Mini Stat Pills inside Mockup */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-semibold">Total Surat</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">128 <span className="text-[9px] text-emerald-600 font-bold">+24%</span></div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100/70">
                    <div className="text-[10px] text-sky-600 font-semibold">Selesai (QR)</div>
                    <div className="text-sm font-black text-sky-700 mt-0.5">96 <span className="text-[9px] text-emerald-600 font-bold">+18%</span></div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100/70">
                    <div className="text-[10px] text-blue-600 font-semibold">Proses RT</div>
                    <div className="text-sm font-black text-blue-700 mt-0.5">32 <span className="text-[9px] text-blue-600 font-bold">Live</span></div>
                  </div>
                </div>

                {/* Live Activity Row */}
                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aktivitas Terkini</div>
                  
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-xs font-bold">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-800">SKTM Siswa - SMK 1 Kediri</div>
                        <div className="text-[9px] text-slate-400">Diverifikasi oleh Ketua RT 01</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Selesai</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-slate-800">Surat Ket. Usaha (KUR)</div>
                        <div className="text-[9px] text-slate-400">TTE QR Terbit oleh Kepala Desa</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">Terverifikasi</span>
                  </div>
                </div>

                {/* Floating Widget: Performance Gauge */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100/80 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[11px] font-black text-slate-900">Kecepatan Pelayanan (SLA)</div>
                    <div className="text-[10px] text-slate-500">Rata-rata penerbitan surat: &lt; 15 menit</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-sky-200 flex items-center justify-center font-black text-xs text-sky-700">
                    98%
                  </div>
                </div>

              </div>

            </div>

            {/* Floating Quick Badges (Flowora Style) */}
            <div className="absolute -top-3 -left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-sky-100 hidden sm:flex items-center gap-2 animate-float">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <div className="text-xs font-black text-slate-800">Legalitas QR Sah DPMPD</div>
            </div>

            <div className="absolute -bottom-4 -right-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-sky-100 hidden sm:flex items-center gap-2 animate-float-gentle">
              <div className="text-xs font-black text-slate-800">100% Gratis</div>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================================================
          TRUST LOGOS STRIP (Responsive Civic Badges)
          ========================================================================= */}
      <section className="w-full bg-white/80 border-y border-slate-200/60 py-5 sm:py-8 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3.5">
          <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
            Terintegrasi dengan Standar Pelayanan Pemerintahan & Keamanan Siber
          </p>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center items-center gap-2.5 sm:gap-6 lg:gap-10">
            <div className="p-2 sm:p-0 rounded-xl bg-slate-50/80 sm:bg-transparent border sm:border-0 border-slate-100 flex items-center justify-center gap-2 font-black text-xs text-slate-700">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Kemendagri RI</span>
            </div>
            <div className="p-2 sm:p-0 rounded-xl bg-slate-50/80 sm:bg-transparent border sm:border-0 border-slate-100 flex items-center justify-center gap-2 font-black text-xs text-slate-700">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>BSSN - TTE Sah</span>
            </div>
            <div className="p-2 sm:p-0 rounded-xl bg-slate-50/80 sm:bg-transparent border sm:border-0 border-slate-100 flex items-center justify-center gap-2 font-black text-xs text-slate-700">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Dispendukcapil Kediri</span>
            </div>
            <div className="p-2 sm:p-0 rounded-xl bg-slate-50/80 sm:bg-transparent border sm:border-0 border-slate-100 flex items-center justify-center gap-2 font-black text-xs text-slate-700">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Perum BULOG & Bapanas</span>
            </div>
            <div className="col-span-2 sm:col-span-auto p-2 sm:p-0 rounded-xl bg-slate-50/80 sm:bg-transparent border sm:border-0 border-slate-100 flex items-center justify-center gap-2 font-black text-xs text-slate-700">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>DPMPD Jawa Timur</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURE SHOWCASE (Responsive: Swipeable on Mobile, Grid on Tablet, Marquee on Desktop)
          ========================================================================= */}
      <section className="w-full py-12 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Semua Kebutuhan Dalam
              <br />
              Satu Portal Kota
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Layanan administrasi kependudukan, perizinan, hingga ekosistem ekonomi dan hunian kota.
            </p>
          </div>

          {/* MOBILE VIEW (Swipeable Native Snap Carousel + Indicator Dots) */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2 px-1">
              <span>Layanan Terpadu ({activeFeatureIndex + 1}/{bentoFeatures.length})</span>
              <span className="text-sky-600 text-[11px] font-semibold flex items-center gap-1">
                Geser layanan &rarr;
              </span>
            </div>
            <div 
              ref={featureScrollRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                const cardWidth = el.scrollWidth / bentoFeatures.length;
                const idx = Math.round(el.scrollLeft / cardWidth);
                if (idx !== activeFeatureIndex && idx >= 0 && idx < bentoFeatures.length) {
                  setActiveFeatureIndex(idx);
                }
              }}
              className="flex gap-3.5 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4"
            >
              {bentoFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link
                    key={feature.id}
                    to={feature.link}
                    className="w-[84vw] max-w-[320px] shrink-0 snap-center bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs active:scale-[0.98] transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-2xs ${feature.iconBg}`}>
                        <Icon className="w-5 h-5 stroke-[1.8]" />
                      </div>

                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                          {feature.tag}
                        </div>
                        <h3 className="text-base font-extrabold text-slate-900">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {feature.desc}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
                      <span>Akses Layanan</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Swipe Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-3">
              {bentoFeatures.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToFeature(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeFeatureIndex === idx
                      ? "w-6 bg-sky-600"
                      : "w-2 bg-slate-200 hover:bg-slate-300"
                  }`}
                  aria-label={`Lihat layanan ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* TABLET VIEW (Clean 2-Column Responsive Grid) */}
          <div className="hidden sm:grid lg:hidden sm:grid-cols-2 gap-4">
            {bentoFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.id}
                  to={feature.link}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs ${feature.iconBg}`}>
                      <Icon className="w-6 h-6 stroke-[1.8]" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                        {feature.tag}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:text-sky-700">
                    <span>Akses Layanan</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

        </div>

        {/* DESKTOP VIEW (Horizontal Infinite Marquee Running Right-to-Left with Pause on Hover) */}
        <div className="hidden lg:block relative w-full overflow-hidden py-4 group">
          {/* Gradient Edge Masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

          {/* Marquee Track */}
          <div className="flex w-max animate-marquee gap-6 px-4">
            {[...bentoFeatures, ...bentoFeatures].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={`${feature.id}-${idx}`}
                  to={feature.link}
                  className="w-[280px] sm:w-[320px] md:w-[350px] shrink-0 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-sky-300 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group/card cursor-pointer"
                >
                  <div className="space-y-4">
                    {/* Pastel Squircle Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover/card:scale-110 shadow-2xs ${feature.iconBg}`}>
                      <Icon className="w-6 h-6 stroke-[1.8]" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">
                        {feature.tag}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover/card:text-sky-700 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                        {feature.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600 group-hover/card:text-sky-700">
                    <span>Akses Layanan</span>
                    <ArrowRight className="w-4 h-4 group-hover/card:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SHOWCASE SPLIT SECTION (Flowora "Plan, collaborate and deliver projects" Style)
          ========================================================================= */}
      <section className="w-full bg-gradient-to-b from-sky-50/50 via-white to-blue-50/30 py-16 sm:py-24 border-y border-sky-100/80 relative overflow-hidden">
        
        {/* Soft Ambient Radial Blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left (Desktop) / Bottom (Mobile): Interactive Resident Visual Showcase */}
            <div className="lg:col-span-6 relative order-2 lg:order-1">
              <div className="rounded-3xl overflow-hidden shadow-2xl border border-sky-100 bg-white relative">
                
                {/* Simulated Admin Portal Preview Header */}
                <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">sidesku.desa.id/persuratan</span>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200/60">
                    Live Valid
                  </span>
                </div>

                <img
                  src="/images/landing/admin-dashboard-preview.png"
                  alt="Admin Dashboard Preview"
                  className="w-full h-auto object-cover object-top hover:scale-[1.01] transition-transform duration-500"
                />
              </div>

              {/* Floating Status Card (Top Left) */}
              <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-sky-100 space-y-1 hidden sm:block animate-float z-10">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status Berkas</div>
                <div className="flex items-center gap-1.5 text-xs font-black text-sky-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Disetujui RT 01 & Kades</span>
                </div>
              </div>

              {/* Floating QR Tag (Bottom Right) */}
              <div className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-sky-100 space-y-1 hidden sm:block animate-float-gentle z-10">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tanda Tangan Elektronik</div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-black text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>470/084/418.67/2026</span>
                </div>
              </div>

            </div>

            {/* Right (Desktop) / Top (Mobile): Feature Bulletpoints & Mobile Mockup Preview */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              <div className="space-y-3">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  Ajukan, Pantau, dan Terima Surat Tanpa Perlu Antre
                </h2>
              </div>

              {/* Checkmark Bullets */}
              <div className="space-y-3.5 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700">
                    <strong className="text-slate-900">Pemberitahuan Otomatis ke WhatsApp.</strong> 
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700">
                    <strong className="text-slate-900">Nomor Resi Pelacak Publik.</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700">
                    <strong className="text-slate-900">100% Bebas Biaya.</strong> 
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  to="/layanan-surat"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm transition-all shadow-md press-down flex items-center justify-center gap-2"
                >
                  <span>Pelajari Katalog Surat</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/lacak"
                  className="w-full sm:w-auto text-center py-2 text-xs sm:text-sm font-bold text-sky-700 hover:text-sky-800 underline underline-offset-4 flex items-center justify-center gap-1"
                >
                  <span>Cek Resi Sekarang</span>
                </Link>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* =========================================================================
          KEY STATS STRIP (Flowora Modern Stats Counter Strip - Responsive Grid)
          ========================================================================= */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
        <div className="bg-white/95 backdrop-blur-xl border border-sky-100 rounded-3xl p-4 sm:p-8 shadow-xl shadow-sky-500/5 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 text-center">
          
          <div className="space-y-1 p-2.5 sm:p-3 rounded-2xl bg-slate-50/50 sm:bg-transparent border sm:border-0 border-slate-100/80">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-1.5 shadow-2xs">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {countWarga.toLocaleString()}+
            </div>
            <div className="text-xs font-bold text-slate-700">Penduduk Terdata</div>
            <div className="text-[10px] text-sky-700 font-semibold line-clamp-1">{countDusun} Kelurahan • {countRt} RT</div>
          </div>

          <div className="space-y-1 p-2.5 sm:p-3 rounded-2xl bg-slate-50/50 sm:bg-transparent border sm:border-0 border-slate-100/80">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-xl sm:text-3xl font-black text-sky-600 tracking-tight">
              {countSurat.toLocaleString()}+
            </div>
            <div className="text-xs font-bold text-slate-700">Surat Sah Terbit</div>
            <div className="text-[10px] text-sky-700 font-semibold line-clamp-1">100% Legal Ber-QR Code</div>
          </div>

          <div className="space-y-1 p-2.5 sm:p-3 rounded-2xl bg-slate-50/50 sm:bg-transparent border sm:border-0 border-slate-100/80">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-1.5 shadow-2xs">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              &lt; {countSla} Menit
            </div>
            <div className="text-xs font-bold text-slate-700">Rata-rata Waktu SLA</div>
            <div className="text-[10px] text-sky-600 font-semibold line-clamp-1">Disposisi Cepat Real-Time</div>
          </div>

          <div className="space-y-1 p-2.5 sm:p-3 rounded-2xl bg-slate-50/50 sm:bg-transparent border sm:border-0 border-slate-100/80">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-1.5 shadow-2xs">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-xl sm:text-3xl font-black text-sky-600 tracking-tight">
              4.9 / 5.0
            </div>
            <div className="text-xs font-bold text-slate-700">Indeks Kepuasan</div>
            <div className="text-[10px] text-emerald-600 font-semibold line-clamp-1">Bebas Pungli (Rp 0,-)</div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          TESTIMONIALS (Responsive: Swipeable on Mobile, Grid on Tablet, Marquee on Desktop)
          ========================================================================= */}
      <section className="w-full py-12 sm:py-20 bg-gradient-to-b from-white via-sky-50/20 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Review Warga Kota Kediri
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pengalaman nyata masyarakat dalam mengurus dokumen dan mengakses layanan kota.
            </p>
          </div>

          {/* MOBILE VIEW (Swipeable Native Snap Reviews + Indicator Dots) */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2 px-1">
              <span>Ulasan Warga ({activeTestimonialIndex + 1}/{testimonials.length})</span>
              <span className="text-sky-600 text-[11px] font-semibold flex items-center gap-1">
                Geser ulasan &rarr;
              </span>
            </div>
            <div 
              ref={testimonialScrollRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                const cardWidth = el.scrollWidth / testimonials.length;
                const idx = Math.round(el.scrollLeft / cardWidth);
                if (idx !== activeTestimonialIndex && idx >= 0 && idx < testimonials.length) {
                  setActiveTestimonialIndex(idx);
                }
              }}
              className="flex gap-3.5 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4"
            >
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="w-[84vw] max-w-[320px] shrink-0 snap-center bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic line-clamp-4">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.author}
                      className="w-9 h-9 rounded-full object-cover bg-sky-100 ring-2 ring-sky-200 shrink-0"
                    />
                    <div>
                      <div className="font-extrabold text-xs text-slate-900">{t.author}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Swipe Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-3">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToTestimonial(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeTestimonialIndex === idx
                      ? "w-6 bg-sky-600"
                      : "w-2 bg-slate-200 hover:bg-slate-300"
                  }`}
                  aria-label={`Lihat ulasan ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* TABLET VIEW (Clean 2-Column Grid) */}
          <div className="hidden sm:grid lg:hidden sm:grid-cols-2 gap-4">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-10 h-10 rounded-full object-cover bg-sky-100 ring-2 ring-sky-200 shrink-0"
                  />
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-slate-900">{t.author}</div>
                    <div className="text-[11px] text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* DESKTOP VIEW (Infinite Marquee) */}
        <div className="hidden lg:block relative w-full overflow-hidden py-4 group">
          {/* Subtle Ambient Vignette / Gradient Edge Masks */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

          {/* Marquee Track */}
          <div className="flex w-max animate-marquee-slow gap-6 px-4">
            {[...testimonials, ...testimonials].map((t, idx) => (
              <div
                key={idx}
                className="w-[320px] sm:w-[380px] shrink-0 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-5 mt-6 border-t border-slate-100 flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-10 h-10 rounded-full object-cover bg-sky-100 ring-2 ring-sky-200 shrink-0"
                  />
                  <div>
                    <div className="font-extrabold text-xs sm:text-sm text-slate-900">{t.author}</div>
                    <div className="text-[11px] text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ ACCORDION SECTION
          ========================================================================= */}
      <section className="w-full bg-white py-16 sm:py-20 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/60 text-sky-700 text-xs font-bold">
              Pusat Bantuan & Regulasi
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Jawaban cepat dan ringkas seputar tata cara buat surat, biaya layanan, dan legalitas dokumen.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "bg-white border-sky-300 shadow-md ring-2 ring-sky-500/10"
                      : "bg-white/80 border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left gap-4 cursor-pointer select-none"
                  >
                    <span className={`text-sm sm:text-base font-extrabold ${isOpen ? "text-sky-700" : "text-slate-800"}`}>
                      {faq.q}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? "bg-sky-100 text-sky-700 rotate-180" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};
