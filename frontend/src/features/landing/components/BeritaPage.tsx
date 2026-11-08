import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  Search,
  X,
  ChevronRight,
  Share2,
  Check
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { Berita } from '@/shared/types';

// Mock Data Editorial Desa Doko yang Realistis & Sesuai Spesifikasi
const fallbackBeritas: Berita[] = [
  {
    id: 1001,
    judul: 'Pembangunan Jalan Lingkungan Desa Doko Mulai Dilaksanakan',
    slug: 'pembangunan-jalan-lingkungan-desa-doko-mulai-dilaksanakan',
    kategori: 'Pembangunan',
    ringkasan: 'Pemerintah Desa Doko merealisasikan peningkatan infrastruktur jalan lingkungan sepanjang 850 meter dengan rabat beton berkualitas untuk kelancaran mobilitas warga.',
    konten: `Pemerintah Desa Doko, Kecamatan Ngasem, Kabupaten Kediri secara resmi memulai pengerjaan revitalisasi dan pembangunan jalan lingkungan di Dusun Krajan dan Dusun Doko. Proyek infrastruktur ini bersumber dari alokasi Dana Desa Tahun Anggaran 2026.

Kepala Desa Doko menyampaikan bahwa peningkatan jalan lingkungan ini difokuskan pada pengecoran rabat beton dengan ketebalan standar guna memastikan ketahanan terhadap beban kendaraan dan curah hujan tinggi. Selain itu, pengerjaan turut mengikutsertakan tenaga kerja lokal warga desa melalui skema Padat Karya Tunai Desa (PKTD).

"Dengan jalan yang mulus dan saluran pembuangan yang tertata, akses petani menuju lahan pertanian serta mobilitas harian anak sekolah menjadi jauh lebih aman dan nyaman," tutur Kepala Desa. Pengerjaan ditargetkan rampung dalam kurun waktu 30 hari kalender.`,
    gambar_cover: '/images/warta/jalan.svg',
    view_count: 512,
    is_published: true,
    published_at: '2026-11-08T08:00:00.000000Z',
  },
  {
    id: 1002,
    judul: 'Sosialisasi Program Ketahanan Pangan di Desa Doko',
    slug: 'sosialisasi-program-ketahanan-pangan-desa-doko',
    kategori: 'Kegiatan Desa',
    ringkasan: 'Pelatihan pemanfaatan pekarangan rumah untuk budidaya sayuran organik dan kolam terpal keluarga bersama kelompok tani desa.',
    konten: `Bertempat di Balai Pertemuan Desa Doko, diselenggarakan sosialisasi dan bimbingan teknis Gerakan Ketahanan Pangan Mandiri. Kegiatan ini diikuti oleh 60 perwakilan kelompok tani (Poktan), ibu-ibu PKK, serta pemuda karang taruna se-Desa Doko.

Program ini menghadirkan narasumber dari Dinas Pertanian dan Perkebunan Kabupaten Kediri. Materi yang diberikan meliputi teknik pembibitan hortikultura ramah lingkungan, pembuatan pupuk organik padat dan cair dari limbah rumah tangga, serta sistem budidaya ikan lele dalam ember (budikdamber).

Melalui inisiatif ini, setiap rukun warga (RW) ditargetkan memiliki demplot percontohan kebun gizi mandiri yang dapat menekan pengeluaran belanja harian keluarga sekaligus mencukupi kebutuhan gizi seimbang.`,
    gambar_cover: '/images/warta/ketahanan-pangan.svg',
    view_count: 328,
    is_published: true,
    published_at: '2026-11-06T10:15:00.000000Z',
  },
  {
    id: 1003,
    judul: 'Kegiatan Posyandu Rutin, Dukung Kesehatan Ibu dan Anak',
    slug: 'kegiatan-posyandu-rutin-dukung-kesehatan-ibu-dan-anak',
    kategori: 'Kesehatan',
    ringkasan: 'Pelayanan penimbangan balita, pemantauan status gizi, vaksinasi lengkap, serta pembagian makanan tambahan (PMT) kaya protein hewani di Balai RW 02.',
    konten: `Kader Posyandu Terpadu Desa Doko bekerja sama dengan Puskesmas Ngasem menggelar pos pelayanan terpadu (Posyandu) rutin bulanan. Sebanyak 85 balita dan 30 ibu hamil hadir mendapatkan pemeriksaan kesehatan berkala.

Fasilitas layanan mencakup pengukuran berat badan, tinggi badan, lingkar kepala, imunisasi dasar lengkap, serta konsultasi gizi pencegahan stunting. Pada kesempatan ini, Pemdes Doko menyalurkan bantuan Pemberian Makanan Tambahan (PMT) berupa telur, susu segar, dan bubur kacang hijau.

Ketua Tim Penggerak PKK Desa Doko menegaskan komitmen desa dalam mewujudkan Zero Stunting di wilayah Desa Doko melalui pengawasan intensif seribu hari pertama kehidupan.`,
    gambar_cover: '/images/warta/posyandu.svg',
    view_count: 440,
    is_published: true,
    published_at: '2026-11-04T09:00:00.000000Z',
  },
  {
    id: 1004,
    judul: 'Gotong Royong Bersihkan Lingkungan Desa',
    slug: 'gotong-royong-bersihkan-lingkungan-desa',
    kategori: 'Masyarakat',
    ringkasan: 'Ratusan warga di tiga dusun serentak membersihkan saluran drainase dan bahu jalan guna mengantisipasi genangan air musim penghujan.',
    konten: `Tradisi kegotongroyongan kembali ditunjukkan oleh masyarakat Desa Doko dalam aksi kerja bakti serentak di lingkungan RT dan RW. Kegiatan difokuskan pada pembersihan endapan sedimen di selokan utama, pemangkasan dahan pohon yang menghalangi penerangan jalan umum, serta pemilahan sampah anorganik.

Sekretaris Desa Doko mengapresiasi tingginya antusiasme masyarakat yang bahu-membahu membawa peralatan swadaya. Semangat guyub rukun ini menjadi modal sosial utama dalam menjaga kebersihan, kesehatan lingkungan, serta mempererat tali silaturahmi antarwarga.`,
    gambar_cover: '/images/warta/gotong-royong.svg',
    view_count: 275,
    is_published: true,
    published_at: '2026-11-02T07:30:00.000000Z',
  },
  {
    id: 1005,
    judul: 'Pelayanan Administrasi Kependudukan Terpadu Berbasis Digital',
    slug: 'pelayanan-administrasi-kependudukan-terpadu-digital',
    kategori: 'Layanan',
    ringkasan: 'Kantor Desa Doko menerapkan layanan permohonan surat pengantar, SKCK, dan keterangan domisili secara online tanpa antre berlama-lama.',
    konten: `Untuk meningkatkan kecepatan dan transparansi birokrasi, Kantor Desa Doko kini mengoptimalkan loket pelayanan digital siDes. Warga desa dapat mengajukan permohonan surat keterangan usaha, surat pengantar nikah, surat kematian, maupun keterangan tidak mampu secara daring dari ponsel masing-masing.

Dokumen yang telah diverifikasi oleh Ketua RT dan Sekdes langsung ditandatangani secara digital (TTE) oleh Kepala Desa dan dilengkapi barcode keabsahan resmi. Warga cukup mengunduh berkas PDF yang telah selesai atau mengambil salinan cetak di balai desa.`,
    gambar_cover: '/images/warta/layanan-digital.svg',
    view_count: 618,
    is_published: true,
    published_at: '2026-10-29T11:00:00.000000Z',
  },
  {
    id: 1006,
    judul: 'Musyawarah Rencana Pembangunan Desa (Musrenbangdes) 2027 Resmi Dibuka',
    slug: 'musrenbangdes-desa-doko-2027-resmi-dibuka',
    kategori: 'Pemerintahan',
    ringkasan: 'BPD bersama Pemdes dan tokoh masyarakat merumuskan skala prioritas pembangunan infrastruktur, ekonomi, dan pendidikan tahun depan.',
    konten: `Musrenbangdes Desa Doko dihadiri oleh jajaran Forkopimcam Ngasem, Kepala Desa, BPD, pengurus RT/RW, LPMD, serta perwakilan kelompok perempuan dan disabilitas.

Agenda utama musyawarah ini adalah menetapkan daftar usulan prioritas Rencana Kerja Pemerintah Desa (RKPDes) tahun 2027. Tiga pilar utama yang disepakati bersama mencakup percepatan infrastruktur sanitasi lingkungan, bantuan permodalan bagi pelaku UMKM desa, serta insentif bagi guru PAUD dan kader kesehatan.`,
    gambar_cover: '/images/warta/musrenbang.svg',
    view_count: 390,
    is_published: true,
    published_at: '2026-10-25T14:00:00.000000Z',
  },
  {
    id: 1007,
    judul: 'Gelar Bazar Produk Unggulan BUMDes Doko Makmur Tembus Pasar Digital',
    slug: 'gelar-bazar-produk-unggulan-bumdes-doko-makmur',
    kategori: 'Masyarakat',
    ringkasan: 'Olahan sambal pecel khas, kerajinan anyaman bambu, dan madu klanceng lokal dipamerkan dengan fasilitas pembayaran nontunai QRIS.',
    konten: `Pelataran Balai Desa Doko dipadati warga dalam gelaran Bazar UMKM BUMDes Doko Makmur. Puluhan pelaku usaha mikro desa menampilkan produk kuliner tradisional dan kerajinan tangan bernilai ekonomis tinggi.

Dalam acara ini, BUMDes memfasilitasi sertifikasi halal gratis serta integrasi toko online agar produk unggulan Desa Doko dapat dipesan oleh masyarakat luas di luar wilayah Kediri.`,
    gambar_cover: '/images/warta/bumdes.svg',
    view_count: 489,
    is_published: true,
    published_at: '2026-10-20T10:00:00.000000Z',
  },
];


// Helper gambar dokumentasi asli desa yang realistis dan konsisten per kategori
const CATEGORY_DOCUMENTARY_IMAGES: Record<string, string> = {
  pembangunan: '/images/warta/jalan.svg',
  kesehatan: '/images/warta/posyandu.svg',
  'kegiatan desa': '/images/warta/ketahanan-pangan.svg',
  masyarakat: '/images/warta/gotong-royong.svg',
  layanan: '/images/warta/layanan-digital.svg',
  pemerintahan: '/images/warta/musrenbang.svg',
  umkm: '/images/warta/bumdes.svg',
};

export const resolveBeritaImage = (berita?: Berita | null): string => {
  if (!berita) return '/images/warta/jalan.svg';
  // Jika gambar bukan stock photo event.jpg/kursus.jpg/about_img.webp, gunakan
  if (
    berita.gambar_cover &&
    !berita.gambar_cover.includes('event.jpg') &&
    !berita.gambar_cover.includes('kursus.jpg') &&
    !berita.gambar_cover.includes('about_img.webp')
  ) {
    return berita.gambar_cover;
  }
  const cat = (berita.kategori || '').toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_DOCUMENTARY_IMAGES)) {
    if (cat.includes(key) || key.includes(cat)) {
      return url;
    }
  }
  return '/images/warta/jalan.svg';
};

const KATEGORI_OPTIONS = [
  'Semua Berita',
  'Pemerintahan',
  'Pembangunan',
  'Kegiatan Desa',
  'Kesehatan',
  'Layanan',
  'Masyarakat',
];

export const BeritaPage: React.FC = () => {
  const [beritas, setBeritas] = useState<Berita[]>(fallbackBeritas);
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua Berita');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBerita, setSelectedBerita] = useState<Berita | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(6);

  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Fetch dari backend API terintegrasi
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const beritaRes = await api.get('/public/beritas').catch(() => null);

        if (isMounted) {
          if (beritaRes?.data?.success && Array.isArray(beritaRes.data.data) && beritaRes.data.data.length > 0) {
            const fetched = beritaRes.data.data;
            // Utamakan daftar editorial resmi desa di awal, gabungkan data backend lainnya
            const merged = [...fallbackBeritas];
            fetched.forEach((f: Berita) => {
              if (!merged.some((m) => m.judul.trim().toLowerCase() === f.judul.trim().toLowerCase())) {
                merged.push(f);
              }
            });
            setBeritas(merged);
          }
        }
      } catch {
        // Fallback sudah aktif
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Lock scroll saat modal terbuka
  useEffect(() => {
    if (selectedBerita) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedBerita]);

  // Handle ESC untuk menutup modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedBerita(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Format tanggal bergaya editorial Indonesia dengan bulan 3 huruf (contoh: 8 Nov 2026, 15 Jan 2026)
  const formatDate = (dateStr?: string | null): string => {
    if (!dateStr) return 'Terkini';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Terkini';
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return 'Terkini';
    }
  };

  // Filter warta berdasarkan kategori dan pencarian
  const filteredBeritas = useMemo(() => {
    return beritas.filter((item) => {
      const matchKategori =
        selectedKategori === 'Semua Berita' ||
        (item.kategori && item.kategori.toLowerCase() === selectedKategori.toLowerCase());

      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchKategori;

      const judul = (item.judul || '').toLowerCase();
      const ringkasan = (item.ringkasan || '').toLowerCase();
      const konten = (item.konten || '').toLowerCase();

      return matchKategori && (judul.includes(query) || ringkasan.includes(query) || konten.includes(query));
    });
  }, [beritas, selectedKategori, searchQuery]);

  // Berita paling atas (Lead Story): Pilihan pertama yang relevan
  const topNews = useMemo(() => {
    if (filteredBeritas.length === 0) return null;
    if (selectedKategori === 'Semua Berita' && !searchQuery) {
      const premier = filteredBeritas.find((b) => b.kategori?.toLowerCase() === 'pembangunan');
      if (premier) return premier;
    }
    return filteredBeritas[0];
  }, [filteredBeritas, selectedKategori, searchQuery]);

  // Berita kedua dan ketiga: Hanya tulisan, hook berita, dan tanggal upload (Tanpa foto)
  const secondaryNews = useMemo(() => {
    if (!topNews) return [];
    const list = filteredBeritas.filter((b) => b.id !== topNews.id);
    return list.slice(0, 2);
  }, [filteredBeritas, topNews]);

  // Berita lainnya (item ke-4 dan seterusnya)
  const remainingNews = useMemo(() => {
    if (!topNews) return [];
    const list = filteredBeritas.filter((b) => b.id !== topNews.id);
    return list.slice(2, visibleCount);
  }, [filteredBeritas, topNews, visibleCount]);

  const handleShare = async (berita: Berita) => {
    const shareData = {
      title: berita.judul,
      text: berita.ringkasan || berita.judul,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleResetFilter = () => {
    setSelectedKategori('Semua Berita');
    setSearchQuery('');
    setVisibleCount(6);
  };

  const scrollToCategories = () => {
    categoryScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="page-enter relative w-full overflow-hidden flex flex-col min-h-[60vh] text-[#101828] font-sans antialiased selection:bg-[#155EEF]/10 selection:text-[#155EEF]">

      {/* ========================================================================= */}
      {/* 4.B HERO SECTION: Judul "Warta dan Informasi" (Tanpa Deskripsi)           */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden pt-7 pb-8 sm:pt-11 sm:pb-12 border-b-2 border-slate-200/80 bg-gradient-to-b from-[#cfe6fc] via-[#e6f2fd] to-white">
        {/* Soft radial glow ambient light persis Foto No 1 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-blue-400/25 via-sky-300/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[480px] h-[200px] bg-gradient-to-tr from-blue-500/20 via-sky-400/25 to-indigo-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          {/* Pill Badge persis Foto No 1 & No 3 */}
          <div className="flex justify-center mb-3 sm:mb-3.5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-blue-200 text-blue-700 text-xs font-bold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Warta dan Informasi</span>
            </div>
          </div>

          {/* Headline: Warta dan Informasi (Tanpa Deskripsi) */}
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#101828] tracking-tight leading-tight">
              Warta dan <span className="text-blue-600">Informasi</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">

        {/* ========================================================================= */}
        {/* 4.F KATEGORI BERITA (Horizontal Scrollable Pill Bar)                      */}
        {/* ========================================================================= */}
        <section ref={categoryScrollRef} id="kategori-warta" className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider">
              Kategori Warta
            </span>
            {searchQuery && (
              <span className="text-xs text-[#155EEF] font-medium">
                Pencarian: "{searchQuery}" ({filteredBeritas.length} warta)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 sm:mx-0 sm:px-0">
            {KATEGORI_OPTIONS.map((cat) => {
              const isActive = selectedKategori.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedKategori(cat);
                    setVisibleCount(6);
                  }}
                  className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#155EEF] text-white shadow-xs font-semibold'
                      : 'bg-[#F8FAFC] text-[#475467] hover:bg-slate-100 hover:text-[#101828] border border-[#EAECF0]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#155EEF]/20 border-t-[#155EEF] rounded-full animate-spin" />
            <span className="text-xs text-[#667085] font-medium">Memuat warta Desa Doko...</span>
          </div>
        )}

        {/* Empty State jika tidak ada warta sesuai filter/pencarian */}
        {!isLoading && filteredBeritas.length === 0 && (
          <div className="bg-[#F8FAFC] rounded-xl border border-[#EAECF0] p-8 text-center space-y-3 max-w-md mx-auto">
            <Search className="w-8 h-8 text-[#667085] mx-auto opacity-50" />
            <h3 className="text-sm font-semibold text-[#101828]">Warta Tidak Ditemukan</h3>
            <p className="text-xs text-[#667085] leading-relaxed">
              Tidak ada berita yang cocok dengan kata kunci atau filter kategori yang dipilih.
            </p>
            <button
              type="button"
              onClick={handleResetFilter}
              className="px-4 py-2 rounded-lg bg-[#155EEF] text-white text-xs font-semibold hover:bg-[#003B95] transition-colors cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

        {/* Konten Berita Terpadu (Editorial Layout Sesuai Arahan) */}
        {!isLoading && filteredBeritas.length > 0 && (
          <div className="space-y-6 sm:space-y-8">
            
            {/* ========================================================================= */}
            {/* 1. BERITA PALING ATAS: FOTO -> JUDUL BERITA -> HOOK BERITA                 */}
            {/* ========================================================================= */}
            {topNews && (
              <section aria-label="Berita Utama Paling Atas">
                <article
                  onClick={() => setSelectedBerita(topNews)}
                  className="group block cursor-pointer bg-white border border-[#EAECF0] rounded-2xl overflow-hidden hover:border-[#155EEF]/50 transition-all shadow-xs p-3.5 sm:p-5 space-y-3.5"
                >
                  {/* URUTAN 1: FOTO */}
                  <div className="relative aspect-[16/9] w-full bg-slate-100 rounded-xl overflow-hidden">
                    <img
                      src={resolveBeritaImage(topNews)}
                      alt={topNews.judul}
                      loading="eager"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/warta/jalan.svg';
                      }}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-[#155EEF] text-white font-bold text-xs shadow-xs">
                        {topNews.kategori || 'Pembangunan'}
                      </span>
                    </div>
                  </div>

                  {/* URUTAN 2: JUDUL BERITA */}
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-[#101828] leading-snug group-hover:text-[#155EEF] transition-colors">
                    {topNews.judul}
                  </h2>

                  {/* URUTAN 3: HOOK BERITA (Ringkasan / Hook) */}
                  {topNews.ringkasan && (
                    <p className="text-xs sm:text-sm md:text-base text-[#475467] leading-relaxed font-normal">
                      {topNews.ringkasan}
                    </p>
                  )}

                  {/* Footer Tanggal Upload & Aksi Baca */}
                  <div className="pt-2 border-t border-[#EAECF0] flex items-center justify-between text-xs text-[#667085]">
                    <span>{formatDate(topNews.published_at)}</span>
                    <div className="flex items-center gap-1 font-semibold text-[#155EEF]">
                      <span>Baca</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </article>
              </section>
            )}

            {/* ========================================================================= */}
            {/* 2. BERITA KEDUA DAN KETIGA: CUKUP TULISAN, HOOK BERITA, DAN TANGGAL UPLOAD */}
            {/* ========================================================================= */}
            {secondaryNews.length > 0 && (
              <section aria-label="Berita Kedua dan Ketiga" className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  {secondaryNews.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => setSelectedBerita(item)}
                      className="group cursor-pointer bg-white border border-[#EAECF0] hover:border-[#155EEF]/50 rounded-2xl p-4 sm:p-5 hover:bg-[#F8FAFC]/60 transition-all shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        {/* Tulisan / Judul Berita */}
                        <h3 className="text-sm sm:text-base font-bold text-[#101828] leading-snug group-hover:text-[#155EEF] transition-colors">
                          {item.judul}
                        </h3>

                        {/* Hook Berita */}
                        {item.ringkasan && (
                          <p className="text-xs sm:text-sm text-[#475467] leading-relaxed line-clamp-3 font-normal">
                            {item.ringkasan}
                          </p>
                        )}
                      </div>

                      {/* Tanggal Upload */}
                      <div className="pt-2.5 border-t border-[#EAECF0] text-[11px] sm:text-xs text-[#667085] flex items-center justify-between">
                        <span>{formatDate(item.published_at)}</span>
                        <span className="text-[#155EEF] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          <span>Baca</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* ========================================================================= */}
            {/* 3. BERITA LAINNYA (Item ke-4 dan seterusnya, jika ada)                    */}
            {/* ========================================================================= */}
            {remainingNews.length > 0 && (
              <section aria-label="Daftar Berita Lainnya" className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#EAECF0]">
                  <h3 className="text-sm sm:text-base font-bold text-[#101828]">
                    Berita Lainnya
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {remainingNews.map((item) => (
                    <article
                      key={item.id}
                      onClick={() => setSelectedBerita(item)}
                      className="group cursor-pointer bg-white border border-[#EAECF0] hover:border-[#155EEF]/50 rounded-2xl p-4 hover:bg-[#F8FAFC]/60 transition-all shadow-xs flex flex-col justify-between space-y-2.5"
                    >
                      <div className="space-y-1.5">
                        <h4 className="text-xs sm:text-sm font-semibold text-[#101828] leading-snug line-clamp-2 group-hover:text-[#155EEF] transition-colors">
                          {item.judul}
                        </h4>
                        {item.ringkasan && (
                          <p className="text-xs text-[#475467] leading-relaxed line-clamp-2 font-normal">
                            {item.ringkasan}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#EAECF0] text-[11px] text-[#667085] flex items-center justify-between">
                        <span>{formatDate(item.published_at)}</span>
                        <span className="text-[#155EEF] font-semibold text-[11px] flex items-center gap-0.5">
                          <span>Baca</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </article>
                  ))}
                </div>

                {visibleCount < filteredBeritas.length && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + 6)}
                      className="px-4 py-2 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 text-[#475467] hover:text-[#101828] border border-[#EAECF0] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Tampilkan Berita Lainnya
                    </button>
                  </div>
                )}
              </section>
            )}

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL BACA ARTIKEL DETAIL (Editorial Typography, Responsif, Interaktif)   */}
      {/* ========================================================================= */}
      {selectedBerita &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedBerita(null);
            }}
          >
            <div
              className="bg-white rounded-xl border border-[#EAECF0] max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-xl p-5 sm:p-7 space-y-4 my-auto animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EAECF0]">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-[#155EEF] bg-[#155EEF]/10">
                  {selectedBerita.kategori || 'Warta Desa'}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBerita(null)}
                  className="p-1 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                  title="Tutup (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title & Meta Header */}
              <div className="space-y-2">
                <h1 className="text-lg sm:text-2xl font-bold text-[#101828] leading-snug">
                  {selectedBerita.judul}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#667085] pb-1">
                  <span>{formatDate(selectedBerita.published_at)}</span>
                </div>
              </div>

              {/* Foto Artikel Besar */}
              <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={resolveBeritaImage(selectedBerita)}
                  alt={selectedBerita.judul}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/warta/jalan.svg';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Isi Konten Artikel Editorial */}
              <div className="text-xs sm:text-sm text-[#475467] leading-relaxed space-y-3 pt-1 whitespace-pre-line">
                {selectedBerita.konten}
              </div>

              {/* Modal Action Buttons Footer */}
              <div className="pt-4 border-t border-[#EAECF0] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleShare(selectedBerita)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#EAECF0] hover:bg-[#F8FAFC] text-xs font-semibold text-[#475467] transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tautan Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Bagikan Warta</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedBerita(null)}
                  className="px-4 py-2 rounded-lg bg-[#155EEF] hover:bg-[#003B95] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Tutup Artikel
                </button>
              </div>

            </div>
          </div>,
          document.body
        )}



    </div>
  );
};
