import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  FileText,
  Search,
  ShieldCheck,
  TrendingUp,
  BellRing,
  Users,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  ChevronRight,
  Clock,
  Award,
  Star,
  Check,
  Send,
  Zap,
  Lock,
  Layers,
  ArrowUpRight,
  Activity,
  QrCode,
  ChevronDown,
  HelpCircle,
  MessageSquare,
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

  // Typewriter animation effect for hero description
  const heroFullText =
    "Layanan surat mandiri warga, transparansi APBDes, dan verifikasi dokumen resmi ber-QR Code.";
  const [typedHeroText, setTypedHeroText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);

  useEffect(() => {
    let charIndex = 0;
    const typingInterval = setInterval(() => {
      charIndex++;
      if (charIndex <= heroFullText.length) {
        setTypedHeroText(heroFullText.slice(0, charIndex));
      } else {
        setIsTypingDone(true);
        clearInterval(typingInterval);
      }
    }, 12);

    return () => clearInterval(typingInterval);
  }, []);

  // Stats number counting animation starting from 0
  const [countWarga, setCountWarga] = useState(0);
  const [countSurat, setCountSurat] = useState(0);
  const [countSla, setCountSla] = useState(0);
  const [countDusun, setCountDusun] = useState(0);
  const [countRt, setCountRt] = useState(0);

  useEffect(() => {
    const targetW = stats?.total_warga ?? stats?.penduduk_total ?? 2;
    const targetS = stats?.total_surat_selesai ?? stats?.surat_selesai ?? 14;
    const targetSl = 15;
    const targetD = stats?.total_dusun ?? 2;
    const targetR = stats?.total_rt ?? 2;

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
        const [desaRes, statsRes, beritaRes, pengumumanRes] = await Promise.all(
          [
            api.get("/settings/desa"),
            api.get("/public/stats"),
            api.get("/public/beritas"),
            api.get("/public/pengumumans"),
          ],
        );

        if (desaRes.data.success) setDesa(desaRes.data.data);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (beritaRes.data.success) setBeritas(beritaRes.data.data.slice(0, 3));
        if (pengumumanRes.data.success)
          setPengumumans(pengumumanRes.data.data.slice(0, 1));
      } catch {
        // Fallback default
      }
    };
    fetchHomeData();
  }, []);

  const orbitalNodes = [
    {
      id: "surat",
      title: "Layanan Surat",
      desc: "Pengajuan surat mandiri 24/7.",
      icon: FileText,
      link: "/layanan-surat",
      x: -168,
      y: -345,
    },
    {
      id: "validasi",
      title: "Persetujuan Langsung",
      desc: "Disposisi RT ke Kepala Desa.",
      icon: Users,
      link: "/login",
      x: 168,
      y: -345,
    },
    {
      id: "legalitas",
      title: "Legalitas QR Code",
      desc: "Stempel digital resmi desa.",
      icon: ShieldCheck,
      link: "/lacak-surat",
      x: 375,
      y: -85,
    },
    {
      id: "bansos",
      title: "Bantuan Sosial",
      desc: "Jadwal dan antrean bansos.",
      icon: Zap,
      link: "/bansos",
      x: 300,
      y: 240,
    },
    {
      id: "apbdes",
      title: "Transparansi APBDes",
      desc: "Publikasi anggaran desa.",
      icon: TrendingUp,
      link: "/apbdes",
      x: 0,
      y: 385,
    },
    {
      id: "aduan",
      title: "Aspirasi Warga",
      desc: "Kanal pengaduan warga.",
      icon: MessageSquare,
      link: "/layanan-surat",
      x: -300,
      y: 240,
    },
    {
      id: "pelacak",
      title: "Pelacak Berkas",
      desc: "Lacak status surat realtime.",
      icon: Search,
      link: "/lacak-surat",
      x: -375,
      y: -85,
    },
  ];

  const capabilitiesList = [
    {
      title: "Surat Online",
      desc: "Pengajuan mandiri dari rumah tanpa antre ke balai desa.",
      icon: FileText,
    },
    {
      title: "Legalitas QR Sah",
      desc: "Tanda tangan elektronik standar DPMPD.",
      icon: ShieldCheck,
    },
    {
      title: "Pelacak Realtime",
      desc: "Pantau posisi dan tahapan berkas secara transparan.",
      icon: Search,
    },
    {
      title: "Otomasi Cepat",
      desc: "Penerbitan surat dengan rata-rata < 15 menit.",
      icon: Zap,
    },
    {
      title: "APBDes Terbuka",
      desc: "Realisasi anggaran pendapatan & belanja desa akuntabel.",
      icon: TrendingUp,
    },
    {
      title: "Integrasi Bansos",
      desc: "Cek NIK penerima Bansos dan verifikasi antrean.",
      icon: Users,
    },
  ];

  const testimonials = [
    {
      quote:
        "Dulu urus surat keterangan usaha butuh waktu 2 hari karena harus cari tanda tangan RT/RW. Sekarang lewat SIDes cuma 15 menit langsung beres dari HP.",
      author: "Bambang Utomo",
      role: "Warga RT 01 / RW 01 Dusun Krajan",
      avatar: "/images/user.png",
      rating: 5,
    },
    {
      quote:
        "Sebagai Ketua RT, aplikasi ini sangat mempermudah verifikasi permohonan warga tanpa harus didatangi ke rumah malam-malam saat istirahat.",
      author: "Supriyadi",
      role: "Ketua RT 01 Desa Doko",
      avatar: "/images/landing/person1.png",
      rating: 5,
    },
    {
      quote:
        "Sistem penomoran surat otomatis dan TTD QR Code membuat administrasi desa tertib, rapi, dan dokumen sah diverifikasi pihak perbankan & kepolisian.",
      author: "Ahmad Fauzi, S.Kom",
      role: "Sekretaris Desa Doko",
      avatar: "/images/landing/Author.png",
      rating: 5,
    },
    {
      quote:
        "Pengajuan SKTM untuk beasiswa anak kuliah sangat cepat. Berkas langsung masuk ke balai desa dan TTD digital QR langsung keluar hari itu juga.",
      author: "Siti Rahmawati",
      role: "Warga RT 03 Dusun Doko",
      avatar: "/images/user.png",
      rating: 5,
    },
    {
      quote:
        "Penyaluran bansos PKH sekarang sangat tertib. Notifikasi jadwal dan nomor antrean QR otomatis masuk ke WhatsApp, tidak ada lagi antre berdesakan.",
      author: "Budi Santoso",
      role: "KPM Bansos RT 02 Dusun Krajan",
      avatar: "/images/landing/person1.png",
      rating: 5,
    },
    {
      quote:
        "Transparansi APBDes di web ini sangat terbuka. Semua pos anggaran pembangunan selokan dan jalan paving bisa dipantau langsung oleh seluruh warga.",
      author: "H. Mustofa",
      role: "Tokoh Masyarakat RW 01",
      avatar: "/images/landing/Author.png",
      rating: 5,
    },
    {
      quote:
        "Pelayanan di balai desa sekarang serba instan dan bebas pungli (Rp 0,-). Aplikasi kebanggaan warga Kabupaten Kediri!",
      author: "Dewi Lestari",
      role: "Pelaku UMKM Keripik Desa Doko",
      avatar: "/images/user.png",
      rating: 5,
    },
    {
      quote:
        "Fitur lacak status berkas dengan resi sangat transparan. Kita tahu posisi surat sudah sampai di RT, RW, atau balai desa secara realtime.",
      author: "Eko Prasetyo",
      role: "Warga RT 04 Dusun Doko",
      avatar: "/images/landing/person1.png",
      rating: 5,
    },
  ];

  const [heroSearchQuery, setHeroSearchQuery] = useState("");

  const quickLetters = [
    { name: "SKTM Siswa/Kuliah", code: "SKTM" },
    { name: "Keterangan Domisili", code: "SKD" },
    { name: "Keterangan Usaha (KUR)", code: "SKU" },
    { name: "Pengantar SKCK", code: "SKCK" },
  ];

  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Berapa biaya pengurusan surat keterangan di SiDesKu?",
      a: "Seluruh pengurusan surat keterangan dan dokumen administrasi desa di SiDesKu 100% Bebas Biaya (Rp 0,-). Pelayanan ini disediakan secara gratis untuk seluruh warga Desa Doko tanpa ada pungutan liar apapun.",
    },
    {
      q: "Berapa lama proses pembuatan surat sampai terbit?",
      a: "Rata-rata waktu pemrosesan (SLA) adalah kurang dari 15 menit jika Ketua RT, Ketua RW, dan Sekretaris Desa sedang aktif. Berkas langsung mengalir secara realtime antar perangkat yang berwenang.",
    },
    {
      q: "Bagaimana cara mengecek status surat yang sudah diajukan?",
      a: "Warga dapat memasukkan kode resi unik (contoh: RESI-SKTM-084) pada menu 'Lacak Surat'. Halaman tersebut akan menampilkan timeline disposisi surat secara realtime dari tahapan RT, RW, hingga penerbitan Sekdes.",
    },
    {
      q: "Apakah surat ber-QR Code sah untuk instansi luar?",
      a: "Ya, sah secara hukum. Dokumen digital dilengkapi stempel digital ber-QR Code dan tanda tangan elektronik dengan hash code unik standar DPMPD Kabupaten Kediri, sehingga dapat diverifikasi validitasnya oleh pihak perbankan, kepolisian, dinas sosial, dan kampus.",
    },
    {
      q: "Bagaimana jika warga belum memiliki smartphone atau lansia?",
      a: "Pemerintah Desa Doko tetap membuka loket pelayanan langsung di balai desa pada jam kerja (Senin - Jumat 08.00 - 15.30 WIB). Petugas loket siap mendampingi dan memasukkan permohonan ke dalam sistem digital desa.",
    },
  ];

  return (
    <div className="page-enter relative w-full overflow-hidden flex flex-col">
      {/* Hero Section (Clean Full-Width Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.08]">
              <span className="text-emerald-700">Semua Layanan Desa.</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-medium min-h-[4.5rem] sm:min-h-[4rem]">
              {typedHeroText}
              {!isTypingDone && (
                <span className="inline-block w-0.5 h-5 ml-1 bg-emerald-600 animate-pulse align-middle" />
              )}
            </p>

            {/* Quick Search Surat Bar */}
            <div className="relative max-w-xl">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-4 h-4 text-emerald-600 pointer-events-none" />
                <input
                  type="text"
                  value={heroSearchQuery}
                  onChange={(e) => setHeroSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && heroSearchQuery.trim()) {
                      navigate(
                        `/layanan-surat?search=${encodeURIComponent(heroSearchQuery.trim())}`,
                      );
                    }
                  }}
                  placeholder="Cari jenis surat keterangan (SKTM, Domisili, Usaha, SKCK)..."
                  className="w-full pl-11 pr-32 py-3.5 bg-white/95 rounded-2xl border border-emerald-200 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-md shadow-emerald-950/5"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigate(
                      heroSearchQuery.trim()
                        ? `/layanan-surat?search=${encodeURIComponent(heroSearchQuery.trim())}`
                        : "/layanan-surat",
                    );
                  }}
                  className="absolute right-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer press-down"
                >
                  Cari Surat
                </button>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2.5">
                <span className="text-[11px] text-slate-400 font-semibold">
                  Populer:
                </span>
                {quickLetters.map((ql) => (
                  <Link
                    key={ql.code}
                    to={`/layanan-surat?search=${encodeURIComponent(ql.code)}`}
                    className="px-2.5 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200/60 transition-all"
                  >
                    {ql.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                to="/layanan-surat"
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all press-down flex items-center gap-2 hover-glow"
              >
                <span>Ajukan surat</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/lacak"
                className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs sm:text-sm border border-slate-200 shadow-xs hover:border-slate-300 transition-all press-down flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Lacak berkas</span>
              </Link>
            </div>

            {/* Social Trust Proof (Avatar Stack + Stars) */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
              <div className="flex -space-x-2.5 overflow-hidden">
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover bg-emerald-100 shadow-xs"
                  src="/images/user.png"
                  alt="Warga 1"
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover bg-emerald-100 shadow-xs"
                  src="/images/landing/person1.png"
                  alt="Warga 2"
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover bg-emerald-100 shadow-xs"
                  src="/images/landing/Author.png"
                  alt="Warga 3"
                />
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-white bg-emerald-700 text-white font-extrabold text-xs shadow-xs">
                  +1.2k
                </div>
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1 text-amber-400 mb-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-slate-800 font-extrabold text-xs ml-1">
                    5.0 / 5.0
                  </span>
                </div>
                <div className="text-slate-500 font-medium">
                  Dipercaya 1.200+ Warga di 3 Dusun & 36 RT
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Spacious Hero Mockup Card */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end pt-5 pb-5">
            <div className="w-full max-w-[450px] sm:max-w-[465px] relative">
              {/* Floating Pill Accent 1 */}
              <div className="absolute -top-3.5 -left-3.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200/90 z-20 hidden sm:flex items-center gap-2 animate-float">
                <div className="w-6 h-6 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                    SLA Terbit
                  </div>
                  <div className="text-xs font-black text-emerald-800 leading-tight mt-0.5">
                    &lt; 15 Menit Sah
                  </div>
                </div>
              </div>

              {/* Floating Pill Accent 2 */}
              <div className="absolute -bottom-3.5 -right-3.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200/90 z-20 hidden sm:flex items-center gap-2 animate-float-gentle">
                <div className="w-6 h-6 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                    Legalitas Resmi
                  </div>
                  <div className="text-xs font-black text-slate-900 leading-tight mt-0.5">
                    QR Code Sah DPMPD
                  </div>
                </div>
              </div>

              {/* Ambient Backlight Blur */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/15 via-teal-400/10 to-blue-500/10 rounded-3xl blur-2xl -z-10 pointer-events-none" />

              <div className="card-elevated-mockup p-5 sm:p-6 space-y-4 relative bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-[2rem] hover:border-emerald-300 transition-all animate-float-gentle">
                {/* Mockup Header: Official Lambang Kediri + QR Sah & Live Status */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src="/images/logo-kediri.png"
                      alt="Lambang Kediri"
                      className="h-9 sm:h-10 w-auto object-contain drop-shadow-xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-black text-sm sm:text-base text-slate-900 leading-snug whitespace-nowrap">
                        SIDes Portal Administrasi
                      </div>
                      <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="truncate">
                          Server Desa Aktif & Terverifikasi
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="hidden sm:flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full text-[11px] font-black border border-emerald-200/80">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>QR Sah</span>
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1 rounded-full text-[11px] font-extrabold shadow-xs">
                      <span>Live</span>
                    </div>
                  </div>
                </div>

                {/* 3 Metrics Mini Cards */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-gradient-to-b from-slate-50 to-emerald-50/30 p-3 sm:p-3.5 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:scale-102 transition-all shadow-2xs">
                    <div className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-none">
                      {countSurat}
                    </div>
                    <div className="text-[11px] text-slate-500 font-bold mt-1.5">
                      Surat Selesai
                    </div>
                    <div className="mt-1.5 text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block">
                      100% Sah
                    </div>
                  </div>

                  <div className="bg-gradient-to-b from-slate-50 to-teal-50/30 p-3 sm:p-3.5 rounded-2xl border border-slate-100 hover:border-teal-300 hover:scale-102 transition-all shadow-2xs">
                    <div className="text-2xl sm:text-[26px] font-black text-emerald-700 tracking-tight leading-none">
                      {countSla}m
                    </div>
                    <div className="text-[11px] text-slate-500 font-bold mt-1.5">
                      Rata-rata SLA
                    </div>
                    <div className="mt-1.5 text-[9px] font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full inline-block">
                      Cepat & Tepat
                    </div>
                  </div>

                  <div className="bg-gradient-to-b from-slate-50 to-blue-50/30 p-3 sm:p-3.5 rounded-2xl border border-slate-100 hover:border-blue-300 hover:scale-102 transition-all shadow-2xs">
                    <div className="text-2xl sm:text-[26px] font-black text-blue-600 tracking-tight leading-none">
                      0%
                    </div>
                    <div className="text-[11px] text-slate-500 font-bold mt-1.5">
                      Biaya (Gratis)
                    </div>
                    <div className="mt-1.5 text-[9px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full inline-block">
                      Anti-Pungli
                    </div>
                  </div>
                </div>

                {/* Live Activity Stream */}
                <div className="space-y-2">
                  <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between pb-0.5">
                    <span>Aktivitas Berkas Terkini</span>
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 shadow-2xs hover:bg-emerald-100/70 transition-all cursor-default">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs sm:text-[13px] text-slate-900 truncate">
                            ACC Surat Domisili Usaha
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            Ketua RT 01 • Bpk. Bambang
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-800 font-bold font-mono bg-white px-2 py-1 rounded-md shadow-2xs shrink-0 border border-emerald-100">
                        Baru saja
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-all cursor-default">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
                          QR
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs sm:text-[13px] text-slate-900 truncate">
                            Penerbitan SKTM Beasiswa
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            Sekdes • No. 470/128/418.67
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 bg-white px-2 py-1 rounded-md border border-slate-100">
                        15m lalu
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-all cursor-default">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-2xs">
                          WA
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs sm:text-[13px] text-slate-900 truncate">
                            Broadcast Bansos PKH III
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            Terkirim ke 84 Nomor KPM
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0 bg-white px-2 py-1 rounded-md border border-slate-100">
                        1j lalu
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer Quick Link */}
                <div className="pt-1">
                  <Link
                    to="/lacak"
                    className="w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20 hover:shadow-lg press-down"
                  >
                    <Search className="w-4 h-4" />
                    <span>Lacak status surat</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Individual Statistics Cards - Fibonacci Golden Ratio Dimensions & Typography */}
      <div className="relative z-30 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mb-[52px] sm:-mb-[58px]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Komponen 1: Penduduk Terdata */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg hover:shadow-2xl rounded-2xl py-4 px-4 sm:py-5 sm:px-5 text-center space-y-1.5 transition-all duration-300 hover:-translate-y-1 group">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:scale-105 transition-transform">
              {countWarga}+
            </div>
            <div className="text-xs sm:text-[13px] font-bold text-slate-700">
              Penduduk Terdata
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                {countDusun} Dusun • {countRt} RT
              </span>
            </div>
          </div>

          {/* Komponen 2: Surat Sah Terbit */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg hover:shadow-2xl rounded-2xl py-4 px-4 sm:py-5 sm:px-5 text-center space-y-1.5 transition-all duration-300 hover:-translate-y-1 group">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight leading-none group-hover:scale-105 transition-transform">
              {countSurat}+
            </div>
            <div className="text-xs sm:text-[13px] font-bold text-slate-700">
              Surat Sah Terbit
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                100% Legal Ber-QR
              </span>
            </div>
          </div>

          {/* Komponen 3: Rata-rata SLA */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg hover:shadow-2xl rounded-2xl py-4 px-4 sm:py-5 sm:px-5 text-center space-y-1.5 transition-all duration-300 hover:-translate-y-1 group">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none group-hover:scale-105 transition-transform">
              &lt; {countSla} Mnt
            </div>
            <div className="text-xs sm:text-[13px] font-bold text-slate-700">
              Rata-rata SLA
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                Disposisi Realtime
              </span>
            </div>
          </div>

          {/* Komponen 4: Bebas Biaya (Gratis) */}
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-lg hover:shadow-2xl rounded-2xl py-4 px-4 sm:py-5 sm:px-5 text-center space-y-1.5 transition-all duration-300 hover:-translate-y-1 group">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight leading-none group-hover:scale-105 transition-transform">
              Rp 0,-
            </div>
            <div className="text-xs sm:text-[13px] font-bold text-slate-700">
              Bebas Biaya (Gratis)
            </div>
            <div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                Resmi Anti-Pungli
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities Conveyor (Full-Width White Band) */}
      <section className="w-full bg-white pt-20 sm:pt-24 pb-14 sm:pb-20 border-y border-slate-200/80 overflow-hidden relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="max-w-3xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Layanan Unggulan Desa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Layanan surat mandiri, pelacakan status berkas, dan dokumen sah ber-QR Code.
            </p>
          </div>
        </div>

        {/* U-Shape Conveyor Belt with Elegant Fade Edges */}
        <div className="relative w-full overflow-hidden py-4">
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
          <div className="animate-marquee gap-6 px-4 items-center">
            {[
              ...capabilitiesList,
              ...capabilitiesList,
              ...capabilitiesList,
            ].map((cap, idx) => {
              const Icon = cap.icon || Zap;
              const uClass = `animate-u-${(idx % 6) + 1}`;
              return (
                <div
                  key={`cap-${idx}`}
                  className={`${uClass} w-[220px] sm:w-[250px] shrink-0 p-6 rounded-3xl bg-slate-50/90 border border-slate-200/90 shadow-xs hover:shadow-xl hover:bg-white hover:border-emerald-300 transition-all duration-300 flex flex-col items-center text-center group cursor-pointer hover:scale-105`}
                >
                  <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-2xs mb-3.5">
                    {Icon && <Icon className="w-6 h-6 stroke-[1.8]" />}
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    {cap.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SmartRT / Photo 4: Unified Orbital Ecosystem Section (Full-Width Edge-to-Edge Banner) */}
      <section className="w-full bg-gradient-to-b from-[#065f46] via-[#047857] to-[#064e3b] text-white py-16 sm:py-24 relative overflow-hidden shadow-2xl">
        {/* Subtle Ambient Glows & Dot Grid */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Row (Directly matching SmartRT Reference in Screenshot 1) */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12">
            <div className="space-y-2 max-w-3xl">
              <span className="text-xs sm:text-sm font-bold tracking-widest text-emerald-200 uppercase">
                ARSITEKTUR DIGITAL TERINTEGRASI
              </span>
            </div>
            <Link
              to="/layanan-surat"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white hover:text-emerald-200 shrink-0 mb-1 transition-colors group underline underline-offset-4"
            >
              <span>Pelajari Selengkapnya</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Seamless Canvas Container */}
          <div className="relative overflow-hidden py-2 sm:py-6 group/orbit">
            {/* Desktop Orbital Stage (>= 1024px) */}
            <div className="hidden lg:flex items-center justify-center relative min-h-[920px] w-full overflow-hidden select-none">
              {/* Concentric Orbit Rings in Crisp White Translucent (Matching SmartRT Screenshot 1) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div className="w-[390px] h-[390px] rounded-full border border-white/25 absolute" />
                <div className="w-[580px] h-[580px] rounded-full border border-white/20 absolute" />
                <div className="w-[760px] h-[760px] rounded-full border border-white/15 absolute" />
                <div className="w-[940px] h-[940px] rounded-full border border-white/10 absolute" />
                {/* Subtle Center Radial Backlight */}
                <div className="w-[500px] h-[500px] rounded-full bg-emerald-300/15 blur-3xl absolute" />
              </div>

              {/* Center Static Smartphone Mockup (Drop Shadow on Colored Background) */}
              <div className="relative z-20 flex flex-col items-center justify-center pointer-events-auto">
                <img
                  src="/images/landing/mobile-preview-clean.png"
                  alt="SiDesKu Mobile Preview"
                  className="w-[270px] xl:w-[285px] h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.45)] animate-float-gentle select-none pointer-events-none"
                />
              </div>

              {/* Rotating Orbital Track (Nodes circle around the phone) */}
              <div className="absolute inset-0 w-full h-full animate-orbit-rotate group-hover/orbit:[animation-play-state:paused] pointer-events-none z-20">
                {orbitalNodes.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                      style={{
                        left: `calc(50% + ${item.x}px)`,
                        top: `calc(50% + ${item.y}px)`,
                      }}
                    >
                      {/* Counter-rotation ensures text & icon stay 100% upright and readable */}
                      <div className="animate-orbit-counter group-hover/orbit:[animation-play-state:paused]">
                        <Link
                          to={item.link}
                          className="group flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-white text-slate-900 border border-white/80 shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer max-w-[275px]"
                        >
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                              {item.title}
                            </h4>
                            <p className="text-slate-500 text-[11px] leading-snug mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile & Tablet Responsive View (< 1024px) */}
            <div className="block lg:hidden space-y-8 relative z-10 select-none">
              {/* Center Mobile Phone with Ambient Glowing Rings */}
              <div className="relative flex items-center justify-center py-6">
                <div className="absolute w-64 h-64 rounded-full border border-white/25 pointer-events-none" />
                <div className="absolute w-80 h-80 rounded-full border border-white/15 pointer-events-none" />
                <div className="absolute w-48 h-48 rounded-full bg-emerald-300/20 blur-2xl pointer-events-none" />
                <img
                  src="/images/landing/mobile-preview-clean.png"
                  alt="SiDesKu Mobile Preview"
                  className="w-56 sm:w-64 h-auto object-contain drop-shadow-2xl relative z-10 animate-float-gentle"
                />
              </div>

              {/* Mobile Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {orbitalNodes.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.link}
                      className="flex items-start gap-3.5 p-4 rounded-2xl bg-white text-slate-900 border border-white/90 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 text-emerald-600">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section 1 (Full-Width Pure White Band) */}
      <section className="w-full bg-white py-16 sm:py-24 text-slate-900 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Illustration / Card with Overlays */}
            <div className="lg:col-span-6 relative">
              {/* Ambient Glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/15 via-teal-400/10 to-blue-500/10 rounded-3xl blur-2xl -z-10 pointer-events-none" />

              <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 bg-white relative group">
                {/* Window Header / Mac-style Titlebar */}
                <div className="bg-slate-100/90 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[11px] font-mono font-bold text-slate-500 bg-white px-3 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                    sidesku.desa.id/admin/persuratan
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Realtime Live</span>
                  </div>
                </div>

                {/* Admin Panel Screenshot */}
                <div className="relative overflow-hidden bg-slate-900/5">
                  <img
                    src="/images/landing/admin-dashboard-preview.png"
                    alt="Portal Administrasi Persuratan SiDesKu"
                    className="w-full h-auto object-cover object-top hover:scale-[1.02] transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Floating Task Pill 1 */}
              <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200/90 space-y-1 hidden sm:block animate-float z-10">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  SKTM Siswa SMK
                </div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Disetujui RT 01 & RW 01</span>
                </div>
              </div>

              {/* Floating Task Pill 2 */}
              <div className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-slate-200/90 space-y-1 hidden sm:block animate-float-gentle z-10">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Nomor Surat Resmi
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-black text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>470/084/418.67/2026</span>
                </div>
              </div>
            </div>

            {/* Right Text & Checklist */}
            <div className="lg:col-span-6 space-y-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Pengurusan Surat Mandiri & Cepat
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Permohonan surat diproses digital dari ponsel tanpa perlu antre fisik di kantor desa.
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700">
                    <strong>Bebas antre:</strong> Ajukan surat online dan pantau status berkas secara realtime.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700">
                    <strong>Alur langsung RT ke Kades:</strong> Persetujuan cepat tanpa birokrasi berbelit.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700">
                    <strong>Legalitas QR sah:</strong> Dokumen resmi berstempel dan tanda tangan elektronik.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs sm:text-sm text-slate-700">
                    <strong>Bebas biaya:</strong> Seluruh pengurusan dokumen 100% gratis (Rp 0).
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/layanan-surat"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors shadow-sm press-down"
                >
                  <span>Katalog surat & syarat</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section 2 (Full-Width Emerald/Teal Banner Band at 1 Div Distance) */}
      <section className="w-full bg-gradient-to-b from-[#065f46] via-[#047857] to-[#064e3b] text-white py-16 sm:py-24 relative overflow-hidden shadow-2xl">
        {/* Subtle Ambient Decorative Accents */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-30" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Text */}
            <div className="lg:col-span-6 space-y-5 order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Distribusi Bantuan Sosial Tepat Sasaran
              </h2>

              <p className="text-sm text-emerald-100 leading-relaxed font-normal">
                Pemberitahuan jadwal pencairan dan barcode antrean dikirim langsung ke WhatsApp warga penerima manfaat.
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-50">
                    <strong className="text-white">Jadwal berjenjang:</strong> Warga hadir sesuai sesi untuk menghindari antrean.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-50">
                    <strong className="text-white">Barcode antrean digital:</strong> Verifikasi cepat di meja pencairan.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-400 text-emerald-950 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-50">
                    <strong className="text-white">Cek mandiri:</strong> Periksa status kepesertaan bansos kapan saja.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/bansos"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-xs sm:text-sm transition-all shadow-xl press-down"
                >
                  <span>Cek kepesertaan bansos</span>
                  <ArrowRight className="w-4 h-4 text-emerald-800" />
                </Link>
              </div>
            </div>

            {/* Right Simulated WhatsApp Phone Preview with Authentic Bright WhatsApp Theme & Real QR Code */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="card-elevated-mockup overflow-hidden rounded-3xl border border-white/20 shadow-2xl bg-[#efeae2]">
                {/* WhatsApp App Header (Authentic Bright Green) */}
                <div className="bg-[#008069] text-white px-5 py-3.5 flex items-center justify-between shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-sm shrink-0">
                      <img
                        src="/images/logo-kediri.png"
                        alt="Logo Kediri"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-white flex items-center gap-1.5 leading-tight">
                        <span>Pemerintah Desa Doko</span>
                        <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-300 text-[#008069]" />
                      </div>
                      <div className="text-[11px] text-emerald-100/90 font-medium">
                        WhatsApp Gateway Resmi • Online
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#006a57] px-3 py-1 rounded-full text-[11px] font-bold text-emerald-100 border border-emerald-500/30">
                    <span>Dual Verifikasi</span>
                  </div>
                </div>

                {/* Chat Canvas (Light Wallpaper + Bubble) */}
                <div className="p-4 sm:p-6 space-y-3 font-sans">
                  {/* Date Pill */}
                  <div className="flex justify-center">
                    <span className="bg-white/80 backdrop-blur-xs text-[10px] font-bold text-slate-500 px-3 py-1 rounded-full shadow-2xs uppercase tracking-wider">
                      Hari Ini • 08.00 WIB
                    </span>
                  </div>

                  {/* WhatsApp Chat Bubble */}
                  <div className="bg-white rounded-2xl rounded-tl-xs p-4 sm:p-5 text-slate-800 shadow-md border border-slate-200/70 space-y-3 relative">
                    {/* Sender Badge */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2 text-xs font-black text-[#008069]">
                        <Building2 className="w-4 h-4 text-[#008069]" />
                        <span>PEMERINTAH DESA & PERUM BULOG</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        08.02
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 leading-relaxed space-y-1">
                      <p className="font-extrabold text-[#008069]">
                        Undangan Resmi Penyaluran Bantuan Pangan Beras & PKH
                        :
                      </p>
                    </div>

                    {/* Distribution Schedule Card */}
                    <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200/80 space-y-1.5 text-xs text-slate-700 font-sans">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">
                          Nama Penerima :
                        </span>
                        <strong className="text-slate-900 font-bold">
                          Supriyanto
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">
                          Hari & Tanggal :
                        </span>
                        <strong className="text-slate-900 font-bold">
                          Selasa, 18 Agustus 2026
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">waktu ⏰ :</span>
                        <strong className="text-slate-900 font-bold">
                          08:30 WIB - Selesai
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Lokasi :</span>
                        <strong className="text-slate-900 font-bold">
                          Kantor Balai Desa Doko
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">
                          Alokasi Bantuan :
                        </span>
                        <strong className="text-slate-900 font-bold">
                          30 Kg Beras (Juli - Sept 2026)
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Biaya Tebus :</span>
                        <strong className="text-emerald-700 font-bold">
                          GRATIS (Rp 0,-)
                        </strong>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60">
                        <span className="text-emerald-800 font-bold">
                          No. Urut Antrean :
                        </span>
                        <span className="text-base font-black text-[#008069] bg-white px-2.5 py-0.5 rounded-lg shadow-2xs border border-emerald-300 font-mono">
                          1340
                        </span>
                      </div>
                    </div>

                    {/* Dual Mode Card Inside WhatsApp (Visual QR + Plain Text) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Opsi 1: Visual QR Code */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                        <div className="font-extrabold text-[11px] text-[#008069] flex items-center justify-center gap-1">
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Opsi 1: Scan Barcode Bulog</span>
                        </div>

                        {/* Real Backend Generated Vector QR Code */}
                        <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-200 inline-block">
                          <img
                            src="/api/public/surat/qr?data=350606200801340"
                            alt="QR Barcode Bantuan Pangan 350606200801340"
                            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto object-contain"
                            loading="lazy"
                          />
                          <div className="text-[9px] font-mono font-bold text-slate-700 mt-1 tracking-wider">
                            350606200801340
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 font-medium leading-tight">
                          Scan cepat di meja petugas balai desa.
                        </p>
                      </div>

                      {/* Opsi 2: Tunjukkan Chat (Lansia / Gaptek) */}
                      <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-[11px] space-y-2 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                            <span>Opsi 2: Tunjukkan Chat</span>
                          </div>
                          <p className="text-slate-700 text-[11px] leading-relaxed">
                            Bagi warga lansia/ibu rumah tangga,{" "}
                            <strong>
                              cukup sebutkan No. Urut 1340 & tunjukkan KTP
                              fisik/IKD asli
                            </strong>{" "}
                            ke petugas tanpa perlu cetak kertas.
                          </p>
                        </div>
                        <div className="p-2 rounded-xl bg-white text-[10px] font-bold text-amber-900 border border-amber-200 shadow-2xs">
                          Petugas input manual:{" "}
                          <span className="text-[#008069] font-black font-mono">
                            No. Urut 1340
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verification Guarantee Pill */}
                    <div className="text-[11px] text-[#008069] font-semibold flex items-center justify-between pt-1 border-t border-slate-100 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#008069] shrink-0" />
                        <span>Penyaluran Resmi Bapanas & Perum BULOG</span>
                      </div>
                      <Link
                        to="/bansos"
                        className="text-[11px] font-bold text-slate-800 hover:text-emerald-700 underline flex items-center gap-1"
                      >
                        <span>Cek Undangan Digital</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SmartRT Interactive FAQ Accordion Section (Full-Width Pure White Band) */}
      <section className="w-full bg-white py-16 sm:py-24 text-slate-900 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-emerald-600 uppercase">
              PERTANYAAN UMUM (FAQ)
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Pertanyaan yang sering diajukan warga seputar pengurusan berkas,
              legalitas QR, dan tata cara layanan mandiri SiDesKu.
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
                      ? "bg-white border-emerald-300 shadow-md ring-2 ring-emerald-500/10"
                      : "bg-white/80 border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left gap-4 cursor-pointer select-none"
                  >
                    <span
                      className={`text-sm sm:text-base font-extrabold ${isOpen ? "text-emerald-800" : "text-slate-800"}`}
                    >
                      {faq.q}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen
                          ? "bg-emerald-100 text-emerald-700 rotate-180"
                          : "bg-slate-100 text-slate-500"
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

      {/* Testimonials (Full-Width Soft Mint Band) */}
      <section className="w-full bg-[#f0f9f5] py-16 sm:py-24 border-t border-emerald-100/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 px-4">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-emerald-700 uppercase">
              TESTIMONI MASYARAKAT
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Dipercaya Warga & Perangkat Desa
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Kesan dan pengalaman nyata masyarakat dalam menggunakan pelayanan
              digital Desa Doko.
            </p>
          </div>

          {/* Single Clean Infinite Marquee Slider Row */}
          <div className="relative w-full overflow-hidden py-4">
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#f0f9f5] to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#f0f9f5] to-transparent pointer-events-none z-10" />
            <div className="animate-marquee gap-6 px-4">
              {[...testimonials, ...testimonials].map((t, idx) => (
                <div
                  key={`testi-${idx}`}
                  className="w-[340px] sm:w-[420px] shrink-0 card-modern p-6 sm:p-7 flex flex-col justify-between bg-white border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer rounded-3xl"
                >
                  <div className="space-y-3">
                    {/* 5 Stars */}
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal italic">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-5 flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.author}
                      className="w-10 h-10 rounded-full object-cover bg-emerald-100 ring-2 ring-emerald-100"
                    />
                    <div>
                      <div className="font-extrabold text-xs sm:text-sm text-slate-900">
                        {t.author}
                      </div>
                      <div className="text-[11px] text-slate-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
