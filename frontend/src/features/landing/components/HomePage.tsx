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
  Sparkles,
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
} from "lucide-react";
import api from "@/shared/lib/axios";
import { DesaSetting, Berita, Pengumuman } from "@/shared/types";
import { useAuth } from "@/shared/context/AuthContext";

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [desa, setDesa] = useState<DesaSetting | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [beritas, setBeritas] = useState<Berita[]>([]);
  const [pengumumans, setPengumumans] = useState<Pengumuman[]>([]);

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

  const featureCards = [
    {
      title: "Manajemen Surat Mandiri",
      desc: "Ajukan 8+ jenis surat keterangan secara online kapan saja tanpa perlu antre fisik.",
      icon: FileText,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      link: "/layanan-surat",
    },
    {
      title: "Validasi Berjenjang RT/RW",
      desc: "Koordinasi digital cepat dengan persetujuan satu-klik dari Ketua RT dan Ketua RW.",
      icon: Users,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      link: "/profil",
    },
    {
      title: "Otomasi WhatsApp Broadcast",
      desc: "Notifikasi jadwal dan nomor antrean bansos PKH/BLT otomatis masuk ke ponsel warga.",
      icon: Zap,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      link: "/bansos",
    },
    {
      title: "Transparansi APBDes Terbuka",
      desc: "Publikasi realisasi anggaran pendapatan dan belanja desa secara transparan & akuntabel.",
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      link: "/transparansi",
    },
  ];

  const capabilitiesList = [
    {
      title: "Surat Online 24/7",
      desc: "Pengajuan mandiri dari rumah tanpa perlu antre di balai desa.",
      icon: FileText,
    },
    {
      title: "Legalitas QR Sah",
      desc: "Tanda tangan elektronik bersertifikat standar DPMPD.",
      icon: ShieldCheck,
    },
    {
      title: "Pelacak Realtime",
      desc: "Pantau posisi disposisi dan tahapan berkas secara transparan.",
      icon: Search,
    },
    {
      title: "Otomasi Cepat",
      desc: "Penerbitan surat instan dengan SLA rata-rata < 15 menit.",
      icon: Sparkles,
    },
    {
      title: "APBDes Terbuka",
      desc: "Realisasi anggaran pendapatan & belanja desa akuntabel.",
      icon: TrendingUp,
    },
    {
      title: "Integrasi Bansos",
      desc: "Cek NIK penerima PKH/BLT dan verifikasi antrean dual-mode.",
      icon: Users,
    },
  ];

  const testimonials = [
    {
      quote: "Dulu urus surat keterangan usaha butuh waktu 2 hari karena harus cari tanda tangan RT/RW. Sekarang lewat SIDes cuma 15 menit langsung beres dari HP.",
      author: "Bambang Utomo",
      role: "Warga RT 01 / RW 01 Dusun Krajan",
      avatar: "/images/user.png",
      rating: 5,
    },
    {
      quote: "Sebagai Ketua RT, aplikasi ini sangat mempermudah verifikasi permohonan warga tanpa harus didatangi ke rumah malam-malam saat istirahat.",
      author: "Supriyadi",
      role: "Ketua RT 01 Desa Doko",
      avatar: "/images/landing/person1.png",
      rating: 5,
    },
    {
      quote: "Sistem penomoran surat otomatis dan TTD QR Code membuat administrasi desa tertib, rapi, dan dokumen sah diverifikasi pihak perbankan & kepolisian.",
      author: "Ahmad Fauzi, S.Kom",
      role: "Sekretaris Desa Doko",
      avatar: "/images/landing/Author.png",
      rating: 5,
    },
    {
      quote: "Pengajuan SKTM untuk beasiswa anak kuliah sangat cepat. Berkas langsung masuk ke balai desa dan TTD digital QR langsung keluar hari itu juga.",
      author: "Siti Rahmawati",
      role: "Warga RT 03 Dusun Doko",
      avatar: "/images/user.png",
      rating: 5,
    },
    {
      quote: "Penyaluran bansos PKH sekarang sangat tertib. Notifikasi jadwal dan nomor antrean QR otomatis masuk ke WhatsApp, tidak ada lagi antre berdesakan.",
      author: "Budi Santoso",
      role: "KPM Bansos RT 02 Dusun Krajan",
      avatar: "/images/landing/person1.png",
      rating: 5,
    },
    {
      quote: "Transparansi APBDes di web ini sangat terbuka. Semua pos anggaran pembangunan selokan dan jalan paving bisa dipantau langsung oleh seluruh warga.",
      author: "H. Mustofa",
      role: "Tokoh Masyarakat RW 01",
      avatar: "/images/landing/Author.png",
      rating: 5,
    },
    {
      quote: "Pelayanan di balai desa sekarang serba instan dan bebas pungli (Rp 0,-). Aplikasi kebanggaan warga Kabupaten Kediri!",
      author: "Dewi Lestari",
      role: "Pelaku UMKM Keripik Desa Doko",
      avatar: "/images/user.png",
      rating: 5,
    },
    {
      quote: "Fitur lacak status berkas dengan resi sangat transparan. Kita tahu posisi surat sudah sampai di RT, RW, atau balai desa secara realtime.",
      author: "Eko Prasetyo",
      role: "Warga RT 04 Dusun Doko",
      avatar: "/images/landing/person1.png",
      rating: 5,
    },
  ];

  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  const quickLetters = [
    { name: 'SKTM Siswa/Kuliah', code: 'SKTM' },
    { name: 'Keterangan Domisili', code: 'SKD' },
    { name: 'Keterangan Usaha (KUR)', code: 'SKU' },
    { name: 'Pengantar SKCK', code: 'SKCK' },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-6 page-enter bg-hero-glow relative overflow-hidden">
      
      {/* Background Matrix & Subtle Glowing Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] pointer-events-none -z-10" />
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-[500px] h-[500px] bg-teal-200/25 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Pengumuman Header Notification (Clean Balanced Spacing & Mobile Perfect) */}
      {pengumumans.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-6">
          <div className="bg-emerald-50/95 backdrop-blur-md border border-emerald-200/90 rounded-2xl p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs shadow-xs hover:border-emerald-300 transition-all animate-fade-in overflow-hidden">
            <div className="flex items-center gap-2.5 text-slate-800 font-medium min-w-0 flex-1 overflow-hidden">
              <span className="bg-emerald-700 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-2xs shrink-0 flex items-center gap-1.5">
                <BellRing className="w-3 h-3" />
                <span>Info Desa</span>
              </span>
              <p className="truncate text-xs text-slate-800 font-semibold min-w-0 flex-1">
                <span className="font-black text-emerald-950">{pengumumans[0].judul}</span>
                {pengumumans[0].isi ? ` — ${pengumumans[0].isi}` : ''}
              </p>
            </div>
            <Link
              to="/berita"
              className="text-emerald-700 font-extrabold text-xs hover:text-emerald-900 shrink-0 flex items-center justify-end gap-1 hover:underline group self-end sm:self-auto pt-0.5 sm:pt-0"
            >
              <span>Selengkapnya</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 sm:pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-black border border-emerald-200 shadow-2xs animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sistem Informasi & Tata Kelola Digital Desa Doko</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.08]">
              Satu Portal. <br />
              <span className="text-emerald-700">Semua Layanan Desa.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-medium">
              Platform terpadu yang mempermudah pengurusan surat mandiri, koordinasi berjenjang RT/RW, transparansi APBDes, dan verifikasi dokumen legal berstempel QR resmi.
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
                    if (e.key === 'Enter' && heroSearchQuery.trim()) {
                      navigate(`/layanan-surat?search=${encodeURIComponent(heroSearchQuery.trim())}`);
                    }
                  }}
                  placeholder="Cari jenis surat keterangan (SKTM, Domisili, Usaha, SKCK)..."
                  className="w-full pl-11 pr-32 py-3.5 bg-white/95 rounded-2xl border border-emerald-200 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-md shadow-emerald-950/5"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigate(heroSearchQuery.trim() ? `/layanan-surat?search=${encodeURIComponent(heroSearchQuery.trim())}` : '/layanan-surat');
                  }}
                  className="absolute right-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer press-down"
                >
                  Cari Surat
                </button>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2.5">
                <span className="text-[11px] text-slate-400 font-semibold">Populer:</span>
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
                className="px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-700/20 transition-all press-down flex items-center gap-2 hover-glow"
              >
                <span>Ajukan Surat Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/lacak"
                className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm border border-slate-200 shadow-xs hover:border-slate-300 transition-all press-down flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span>Lacak Berkas Resi</span>
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

          {/* Right Column: Sleek Simulated Dashboard Card (Flowora Style) */}
          <div className="lg:col-span-6 relative">
            {/* Ambient Backlight Blur */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 via-teal-400/10 to-blue-500/10 rounded-3xl blur-2xl -z-10 pointer-events-none" />

            <div className="card-elevated-mockup p-6 sm:p-7 space-y-5 relative bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-3xl hover:border-emerald-300 transition-colors">
              {/* Mockup Header: Official Lambang Kediri + QR Sah & Live Status */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img 
                    src="/images/logo-kediri.png" 
                    alt="Lambang Kediri" 
                    className="h-9 w-auto object-contain drop-shadow-xs shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-black text-sm text-slate-900 leading-tight truncate">
                      SIDes Portal Administrasi
                    </div>
                    <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <span className="truncate">Server Desa Aktif & Terverifikasi</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-[11px] font-black border border-emerald-200/80 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>QR TTD Sah</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-xs">
                    <span>Live</span>
                  </div>
                </div>
              </div>

              {/* 3 Metrics Mini Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gradient-to-b from-slate-50 to-emerald-50/30 p-3.5 rounded-2xl border border-slate-100 hover:border-emerald-300 hover:scale-102 transition-all">
                  <div className="text-2xl font-black text-slate-900 tracking-tight">{stats?.total_surat_selesai || 48}</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Surat Selesai</div>
                  <div className="mt-1 text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-block">↑ 100% Sah</div>
                </div>

                <div className="bg-gradient-to-b from-slate-50 to-teal-50/30 p-3.5 rounded-2xl border border-slate-100 hover:border-teal-300 hover:scale-102 transition-all">
                  <div className="text-2xl font-black text-emerald-700 tracking-tight">15m</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Rata-rata SLA</div>
                  <div className="mt-1 text-[9px] font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full inline-block">Cepat & Tepat</div>
                </div>

                <div className="bg-gradient-to-b from-slate-50 to-blue-50/30 p-3.5 rounded-2xl border border-slate-100 hover:border-blue-300 hover:scale-102 transition-all">
                  <div className="text-2xl font-black text-blue-600 tracking-tight">0%</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">Biaya (Gratis)</div>
                  <div className="mt-1 text-[9px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full inline-block">Anti-Pungli</div>
                </div>
              </div>

              {/* Live Activity Stream */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Aktivitas Berkas Terkini</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 shadow-2xs hover:bg-emerald-100/70 transition-all hover:translate-x-1 cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        ✓
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900">ACC Surat Domisili Usaha</div>
                        <div className="text-[11px] text-slate-500">Ketua RT 01 • Bpk. Bambang Utomo</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-800 font-bold font-mono bg-white px-2 py-0.5 rounded-md shadow-2xs">Baru saja</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-all hover:translate-x-1 cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        QR
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900">Penerbitan SKTM Beasiswa</div>
                        <div className="text-[11px] text-slate-500">Sekretaris Desa • No. 470/128/418.67</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">15m lalu</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-all hover:translate-x-1 cursor-default">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        WA
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900">Broadcast Bansos PKH Tahap III</div>
                        <div className="text-[11px] text-slate-500">Terkirim ke 84 Nomor WhatsApp KPM</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">1j lalu</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Quick Link */}
              <div className="pt-1">
                <Link
                  to="/lacak"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/30 press-down"
                >
                  <Search className="w-4 h-4" />
                  <span>Uji Pelacak Surat Publik Demo</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Conveyor */}
      <section className="py-8 sm:py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="max-w-3xl space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Semua yang Anda butuhkan untuk layanan desa digital & mandiri
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Infrastruktur terintegrasi dari pengajuan online, pelacakan dokumen, hingga transparansi dana desa.
            </p>
          </div>
        </div>

        {/* U-Shape Conveyor Belt */}
        <div className="relative w-full overflow-hidden py-8">

          <div className="animate-marquee gap-6 px-4 items-center">
            {[...capabilitiesList, ...capabilitiesList, ...capabilitiesList].map((cap, idx) => {
              const Icon = cap.icon;
              const uClass = `animate-u-${(idx % 6) + 1}`;
              return (
                <div
                  key={`cap-${idx}`}
                  className={`${uClass} w-[220px] sm:w-[250px] shrink-0 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col items-center text-center group cursor-pointer hover:scale-105`}
                >
                  <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-2xs mb-3.5">
                    <Icon className="w-6 h-6 stroke-[1.8]" />
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

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="pill-badge-emerald">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>FITUR UTAMA</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Semua yang Dibutuhkan untuk Layanan Cepat
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Solusi digital menyeluruh yang menggantikan birokrasi konvensional
            menjadi serba praktis, otomatis, dan akurat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureCards.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="card-modern p-7 flex flex-col justify-between hover-lift group"
              >
                <div className="space-y-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${f.color} shadow-2xs group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug">
                    {f.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {f.desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 mt-6">
                  <Link
                    to={f.link}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 group-hover:translate-x-1 transition-all"
                  >
                    <span>Pelajari Selengkapnya</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Showcase Section 1 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Illustration / Card with Overlays */}
          <div className="lg:col-span-6 relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white relative">
              <img
                src="/images/landing/about_img.webp"
                alt="Warga Layanan Online"
                className="w-full h-80 sm:h-96 object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <div className="font-extrabold text-lg">
                  Pengurusan Surat Keterangan Warga
                </div>
                <p className="text-xs text-slate-200">
                  Terbit tanpa perlu meninggalkan aktivitas pekerjaan harian.
                </p>
              </div>
            </div>

            {/* Floating Task Pill 1 */}
            <div className="absolute -top-4 -left-4 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 space-y-1 hidden sm:block animate-float">
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                SKTM Siswa Smk
              </div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Disetujui
                RT 01 & RW 01
              </div>
            </div>

            {/* Floating Task Pill 2 */}
            <div className="absolute -bottom-4 -right-4 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 space-y-1 hidden sm:block animate-float-gentle">
              <div className="text-[10px] text-slate-400 font-bold uppercase">
                Nomor Surat Resmi
              </div>
              <div className="text-xs font-mono font-black text-slate-900">
                470/084/418.67/2026
              </div>
            </div>
          </div>

          {/* Right Text & Checklist */}
          <div className="lg:col-span-6 space-y-6">
            <div className="pill-badge-emerald">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>LAYANAN SURAT BERJENJANG</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Urus Surat dari Rumah, Selesai Cepat & Tepat Waktu
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Tidak ada lagi antrean panjang di loket balai desa atau menunggu
              Ketua RT pulang kerja. Semua permohonan diverifikasi secara
              digital melalui ponsel perangkat yang bertugas.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium">
                  <strong>Pengajuan Bebas Antre:</strong> Pilih jenis surat, isi
                  keperluan, dan berkas langsung masuk ke antrean Ketua RT.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium">
                  <strong>Validasi Bertingkat Otomatis:</strong> Notifikasi ACC
                  mengalir berjenjang dari RT, RW, hingga penandatanganan
                  Sekdes.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium">
                  <strong>Tanda Tangan & QR Code Sah:</strong> Dilengkapi segel
                  elektronik yang dapat diverifikasi keasliannya oleh instansi
                  luar.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium">
                  <strong>Pelayanan 100% Gratis:</strong> Seluruh pengurusan
                  dokumen tidak dipungut biaya apapun (Rp 0,-).
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/layanan-surat"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors shadow-sm press-down"
              >
                <span>Lihat 8+ Jenis Surat & Syarat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Section 2 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6 order-2 lg:order-1">
            <div className="pill-badge-emerald">
              <BellRing className="w-3.5 h-3.5 text-emerald-600" />
              <span>JARING PENGAMAN SOSIAL</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Distribusi Bantuan Sosial Tepat Sasaran & Tanpa Potongan
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Saat bantuan PKH, BLT-DD, atau BPNT siap cair, desa cukup menekan
              tombol broadcast. Sistem seketika mendistribusikan pesan jadwal
              dan nomor antrean QR langsung ke nomor WhatsApp warga penerima
              manfaat.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium">
                  <strong>Pemberitahuan Waktu Pasti:</strong> Warga hadir sesuai
                  jam sesi sehingga tidak terjadi kerumunan di balai desa.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium">
                  <strong>Barcode Antrean Digital:</strong> Verifikasi penerima
                  di meja pencairan cepat dengan scan barcode NIK.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <div className="text-xs sm:text-sm text-slate-700 font-medium">
                  <strong>Pengecekan NIK Mandiri:</strong> Warga dapat memeriksa
                  status kepesertaan bansos kapan saja secara transparan.
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/bansos"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors shadow-sm press-down"
              >
                <span>Cek Status NIK Bansos Anda</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Simulated WhatsApp Phone Preview with Authentic Bright WhatsApp Theme & Real QR Code */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="card-elevated-mockup overflow-hidden rounded-3xl border border-slate-200/80 shadow-2xl bg-[#efeae2]">
              
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
                      <span>PEMERINTAH DESA DOKO</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">08.02</span>
                  </div>

                  <div className="text-xs text-slate-700 leading-relaxed space-y-1">
                    <p>Yth. Bpk/Ibu <strong className="text-slate-900 font-extrabold">Bambang Utomo</strong>,</p>
                    <p>Bantuan <strong className="text-[#008069]">PKH Tahap III 2026</strong> sebesar <strong className="text-slate-900 font-extrabold">Rp 750.000</strong> telah siap disalurkan.</p>
                  </div>

                  {/* Distribution Schedule Card */}
                  <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200/80 space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">📅 Tanggal:</span>
                      <strong className="text-slate-900 font-bold">25 Agustus 2026</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">⏰ Waktu:</span>
                      <strong className="text-slate-900 font-bold">08.30 WIB (Sesi 1)</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">📍 Tempat:</span>
                      <strong className="text-slate-900 font-bold">Pendopo Balai Desa Doko</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60">
                      <span className="text-emerald-800 font-bold">🎫 No. Antrean:</span>
                      <span className="text-base font-black text-[#008069] bg-white px-2.5 py-0.5 rounded-lg shadow-2xs border border-emerald-300">
                        A-014
                      </span>
                    </div>
                  </div>

                  {/* Dual Mode Card Inside WhatsApp (Visual QR + Plain Text) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    
                    {/* Opsi 1: Visual QR Code */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                      <div className="font-extrabold text-[11px] text-[#008069] flex items-center justify-center gap-1">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Opsi 1: Scan QR (Cepat)</span>
                      </div>
                      
                      {/* Real Vector QR Code Mockup */}
                      <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200 inline-block">
                        <svg viewBox="0 0 100 100" className="w-20 h-20 mx-auto fill-slate-900">
                          {/* Corner Top-Left */}
                          <rect x="5" y="5" width="30" height="30" rx="4" fill="#0f172a" />
                          <rect x="11" y="11" width="18" height="18" rx="2" fill="white" />
                          <rect x="16" y="16" width="8" height="8" rx="1" fill="#008069" />
                          {/* Corner Top-Right */}
                          <rect x="65" y="5" width="30" height="30" rx="4" fill="#0f172a" />
                          <rect x="71" y="11" width="18" height="18" rx="2" fill="white" />
                          <rect x="76" y="16" width="8" height="8" rx="1" fill="#008069" />
                          {/* Corner Bottom-Left */}
                          <rect x="5" y="65" width="30" height="30" rx="4" fill="#0f172a" />
                          <rect x="11" y="71" width="18" height="18" rx="2" fill="white" />
                          <rect x="16" y="76" width="8" height="8" rx="1" fill="#008069" />
                          {/* Data Matrix Dots */}
                          <rect x="42" y="10" width="8" height="8" rx="1" fill="#0f172a" />
                          <rect x="42" y="25" width="8" height="8" rx="1" fill="#0f172a" />
                          <rect x="10" y="42" width="8" height="8" rx="1" fill="#0f172a" />
                          <rect x="25" y="42" width="8" height="8" rx="1" fill="#0f172a" />
                          <rect x="42" y="42" width="16" height="16" rx="2" fill="#008069" />
                          <rect x="65" y="42" width="8" height="8" rx="1" fill="#0f172a" />
                          <rect x="80" y="42" width="8" height="8" rx="1" fill="#0f172a" />
                          <rect x="42" y="65" width="8" height="8" rx="1" fill="#0f172a" />
                          <rect x="42" y="80" width="8" height="8" rx="1" fill="#0f172a" />
                          <rect x="65" y="65" width="12" height="12" rx="1" fill="#0f172a" />
                          <rect x="82" y="82" width="10" height="10" rx="1" fill="#008069" />
                        </svg>
                        <div className="text-[9px] font-mono font-bold text-slate-500 mt-1">
                          PKH2026-A014-3506
                        </div>
                      </div>
                      
                      <p className="text-[10px] text-slate-500 font-medium leading-tight">
                        Scan di meja petugas 1 detik selesai.
                      </p>
                    </div>

                    {/* Opsi 2: Tunjukkan Chat (Lansia / Gaptek) */}
                    <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-[11px] space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                          <span>👵 Opsi 2: Tunjukkan Chat</span>
                        </div>
                        <p className="text-slate-700 text-[11px] leading-relaxed">
                          Bagi warga lansia/gaptek, <strong>cukup tunjukkan teks chat ini & KTP fisik asli</strong> ke petugas tanpa perlu repot scan QR.
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-white text-[10px] font-bold text-amber-900 border border-amber-200 shadow-2xs">
                        Petugas input manual: <span className="text-[#008069] font-black">No. Antrean A-014</span>
                      </div>
                    </div>

                  </div>

                  {/* Verification Guarantee Pill */}
                  <div className="text-[11px] text-[#008069] font-semibold flex items-center gap-1.5 pt-1 border-t border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-[#008069]" />
                    <span>Layanan ramah dan mudah untuk seluruh kalangan warga desa.</span>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-modern p-6 sm:p-8 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="space-y-1 pt-3 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {stats?.total_warga || 342}+
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Penduduk Terdata
              </div>
            </div>

            <div className="space-y-1 pt-3 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                {stats?.total_surat_selesai || 48}+
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Surat Sah Terbit
              </div>
            </div>

            <div className="space-y-1 pt-3 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                &lt; 15 Mnt
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Rata-rata Pelayanan
              </div>
            </div>

            <div className="space-y-1 pt-3 md:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                Rp 0,-
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Bebas Biaya (Gratis)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-8 overflow-hidden">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 px-4">
          <div className="pill-badge-emerald">
            <Star className="w-3 h-3 text-emerald-600 fill-emerald-600" />
            <span>TESTIMONI MASYARAKAT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Dipercaya Warga & Perangkat Desa
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Kesan dan pengalaman nyata masyarakat dalam menggunakan pelayanan digital Desa Doko.
          </p>
        </div>

        {/* Single Clean Infinite Marquee Slider Row */}
        <div className="relative w-full overflow-hidden py-4">

          <div className="animate-marquee gap-6 px-4">
            {[...testimonials, ...testimonials].map((t, idx) => (
              <div
                key={`testi-${idx}`}
                className="w-[340px] sm:w-[420px] shrink-0 card-modern p-6 sm:p-7 flex flex-col justify-between bg-white/95 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer rounded-3xl"
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
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Ambient Glows */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-3 max-w-xl text-center md:text-left relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Siap Merasakan Kemudahan Layanan Desa Digital?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-normal">
              Masuk ke akun warga Anda sekarang untuk mengajukan surat
              permohonan atau hubungi balai desa untuk informasi lebih lanjut.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 relative z-10 shrink-0">
            <Link
              to="/login"
              className="px-7 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs sm:text-sm shadow-xl transition-all press-down flex items-center justify-center gap-2 hover-glow"
            >
              <span>Masuk Portal Warga</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/layanan-surat"
              className="px-7 py-3.5 rounded-2xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm border border-emerald-500/50 transition-all flex items-center justify-center gap-2"
            >
              <span>Daftar Layanan</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
