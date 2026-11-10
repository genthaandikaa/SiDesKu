import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Newspaper, 
  Search, 
  Calendar, 
  Eye, 
  ChevronRight, 
  BellRing, 
  X, 
  Globe, 
  Building2, 
  HardHat, 
  HeartPulse, 
  ShoppingBag, 
  Users, 
  Clock, 
  ArrowRight,
  Bookmark
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { Berita, Pengumuman } from '@/shared/types';
import { Pagination } from '@/shared/components/Pagination';

const defaultBeritas: Berita[] = [
  {
    id: 1,
    judul: 'Pemerintah Kota Kediri Terapkan Ekosistem Smart City & Layanan Publik Terpadu Nexora',
    slug: 'pemkot-kediri-terapkan-ekosistem-smart-city-Nexora',
    kategori: 'Pemerintahan',
    ringkasan: 'Masyarakat kini dapat mengakses administrasi kependudukan, perizinan PATEN, hunian kos spasial, dan lowongan kerja resmi secara terpadu.',
    konten: 'Pemerintah Kota Kediri resmi memperluas platform Nexora ke skala perkotaan. Mengintegrasikan rantai birokrasi dari Ketua RT, RW, Kelurahan, hingga Kecamatan (PATEN) dengan validasi TTE BSrE tersertifikasi BSSN. Sistem ini dilengkapi fitur hunian spasial SDG 11, bursa kerja resmi verifikasi Disnaker SDG 8, dan pasar bebas UMKM dengan filter radius terdekat.',
    view_count: 1420,
    is_published: true,
    published_at: '2026-08-15T08:00:00.000000Z',
  },
  {
    id: 2,
    judul: 'Dinas PUPR & Tim Reaksi Cepat Tuntaskan Perbaikan Jalan Berbasis Pengaduan Spasial',
    slug: 'dinas-pupr-kediri-perbaikan-jalan-spasial',
    kategori: 'Pembangunan',
    ringkasan: 'Sistem pengaduan geospasial mempermudah pemetaan jalan berlubang dan saluran drainase di 3 kecamatan Kota Kediri.',
    konten: 'Dinas PUPR Kota Kediri menuntaskan perbaikan 24 titik jalan lingkungan dan drainase perkotaan. Setiap laporan warga yang masuk via portal Nexora terverifikasi melalui pin koordinat GPS dan validasi foto lapangan, mempercepat respon penanganan kurang dari 48 jam.',
    view_count: 890,
    is_published: true,
    published_at: '2026-08-14T09:30:00.000000Z',
  },
  {
    id: 3,
    judul: 'Disnaker Kota Kediri Buka Bursa Karir Terpadu Berstempel Anti-Loker Bodong',
    slug: 'disnaker-kota-kediri-bursa-karir-resmi',
    kategori: 'Sosial',
    ringkasan: 'Seluruh lowongan kerja terverifikasi legalitas NIB perusahaan dan kepatuhan standar UMK Kota Kediri.',
    konten: 'Dinas Tenaga Kerja Kota Kediri mengintegrasikan kanal Bursa Karir Digital pada portal Nexora. Langkah ini memitigasi penipuan lowongan kerja daring dengan mewajibkan verifikasi akun perusahaan, NIB resmi, dan kepatuhan terhadap standar upah minimum kota.',
    view_count: 1250,
    is_published: true,
    published_at: '2026-08-12T07:45:00.000000Z',
  },
  {
    id: 4,
    judul: 'Pemberdayaan Sentra UMKM & Pasar Komunitas Berbasis Radius Jarak Terdekat',
    slug: 'pasar-umkm-radius-terdekat-kota-kediri',
    kategori: 'UMKM',
    ringkasan: 'Warga dan pelaku usaha mikro dapat mempromosikan produk lokal dengan kalkulasi jarak realtime dan pembayaran QRIS.',
    konten: 'Dinas Koperasi dan UMTK Kota Kediri meluncurkan etalase digital UMKM berbasis geolocation radius. Konsumen dapat menemukan produk olahan kuliner, kriya tahu Kediri, dan jasa rumahan terdekat dalam radius 1 hingga 5 km dari titik tempat tinggal mereka.',
    view_count: 730,
    is_published: true,
    published_at: '2026-08-10T10:00:00.000000Z',
  },
  {
    id: 5,
    judul: 'Dinas Kesehatan Kota Kediri Gelar Posyandu & Skrining PTM Serentak di 46 Kelurahan',
    slug: 'posyandu-ptm-serentak-kota-kediri',
    kategori: 'Kesehatan',
    ringkasan: 'Pemeriksaan kesehatan preventif balita dan lansia serta penyaluran makanan tambahan bergizi di seluruh penjuru kota.',
    konten: 'Dinkes Kota Kediri mengoptimalkan kader kesehatan di seluruh kelurahan melalui pendataan digital kesehatan warga. Kegiatan mencakup pemantauan kurva tumbuh kembang anak untuk eliminasi stunting dan skrining tekanan darah serta gula darah bagi lansia.',
    view_count: 615,
    is_published: true,
    published_at: '2026-08-08T06:30:00.000000Z',
  },
  {
    id: 6,
    judul: 'Musrenbang Kota Kediri Perkuat Transformasi Digital dan Kota Berkelanjutan (SDG 9 & 11)',
    slug: 'musrenbang-kota-kediri-smart-city',
    kategori: 'Pemerintahan',
    ringkasan: 'Rembuk kota menyepakati alokasi prioritas untuk infrastruktur cerdas, sanitasi inklusif, dan ekonomi hijau.',
    konten: 'Musyawarah Perencanaan Pembangunan (Musrenbang) Kota Kediri menetapkan fokus investasi pada penguatan infrastruktur digital, perluasan jaringan pipa air bersih, serta subsidi pelatihan sertifikasi vokasi bagi angkatan kerja muda.',
    view_count: 540,
    is_published: true,
    published_at: '2026-08-16T13:00:00.000000Z',
  },
];

const categoryConfigs = [
  { id: 'Semua', label: 'Semua Warta', icon: Globe },
  { id: 'Pemerintahan', label: 'Pemerintahan', icon: Building2 },
  { id: 'Pembangunan', label: 'Pembangunan', icon: HardHat },
  { id: 'Kesehatan', label: 'Kesehatan', icon: HeartPulse },
  { id: 'UMKM', label: 'UMKM', icon: ShoppingBag },
  { id: 'Sosial', label: 'Sosial', icon: Users },
];

export const BeritaPage: React.FC = () => {
  const [beritas, setBeritas] = useState<Berita[]>(defaultBeritas);
  const [pengumumans, setPengumumans] = useState<Pengumuman[]>([]);
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBerita, setSelectedBerita] = useState<Berita | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedKategori, searchQuery]);

  // Lock body scroll for modal
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

  useEffect(() => {
    const fetchBerita = async () => {
      try {
        const [beritaRes, pengumumanRes] = await Promise.all([
          api.get('/public/beritas'),
          api.get('/public/pengumumans'),
        ]);

        if (beritaRes.data?.success && Array.isArray(beritaRes.data.data) && beritaRes.data.data.length > 0) {
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
        // Fallback
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

  const filteredBeritas = (beritas || []).filter((b) => {
    if (!b) return false;
    const cat = b.kategori || 'Pemerintahan';
    const judul = b.judul || '';
    const ringkasan = b.ringkasan || '';
    const matchCat = selectedKategori === 'Semua' || cat.toLowerCase() === selectedKategori.toLowerCase();
    const matchSearch = judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        ringkasan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const pageSize = 6;
  const paginatedBeritas = filteredBeritas.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="page-enter relative w-full overflow-hidden flex flex-col font-sans text-slate-800">
      
      {/* Hero: Bersih, Rapi, Bernuansa Majalah Digital */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[340px] bg-gradient-to-b from-sky-400/20 via-blue-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.16] max-w-3xl mx-auto mb-3">
          Warta & Kabar Terkini{' '}
          <span className="text-blue-600">
            Kota Kediri.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto mb-6">
          Kumpulan berita resmi, dokumentasi infrastruktur kota, peluang bursa karir Disnaker, agenda publik, dan pengumuman pemerintahan kota.
        </p>

        {/* Search Bar Minimalis */}
        <div className="max-w-xl mx-auto relative mb-6">
          <Search className="w-4 h-4 text-sky-500 absolute left-4.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari topik atau judul berita..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-white rounded-full border border-sky-200 shadow-md shadow-sky-500/5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Kategori Filter Pill Halus */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categoryConfigs.map((cat) => {
            const isSelected = selectedKategori === cat.id;
            const count = cat.id === 'Semua' 
              ? beritas.length 
              : beritas.filter(b => b.kategori?.toLowerCase() === cat.id.toLowerCase()).length;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedKategori(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
                    : 'bg-white hover:bg-sky-50 text-slate-600 border border-slate-200/90 hover:border-sky-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-14 space-y-8">
        
        {/* Featured Story (Ditampilkan jika di Semua kategori & halaman 1 tanpa pencarian) */}
        {selectedKategori === 'Semua' && !searchQuery && filteredBeritas.length > 0 && currentPage === 1 && (
          <div 
            onClick={() => setSelectedBerita(filteredBeritas[0])}
            className="bg-white rounded-3xl overflow-hidden border border-sky-100 shadow-lg hover:border-sky-300 hover:shadow-xl transition-all grid grid-cols-1 md:grid-cols-12 gap-0 group cursor-pointer"
          >
            <div className="md:col-span-6 h-60 md:h-auto overflow-hidden bg-slate-900 relative">
              <img
                src="/images/event.jpg"
                alt={filteredBeritas[0].judul}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3.5 left-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                Warta Terkini
              </span>
            </div>

            <div className="md:col-span-6 p-6 sm:p-7 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono text-sky-800 font-bold bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                    {filteredBeritas[0].kategori}
                  </span>
                  <span>•</span>
                  <span>{formatBeritaDate(filteredBeritas[0].published_at)}</span>
                  <span>•</span>
                  <span>3 mnt baca</span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-sky-700 transition-colors leading-snug">
                  {filteredBeritas[0].judul}
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3">
                  {filteredBeritas[0].ringkasan || filteredBeritas[0].konten}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Eye className="w-3.5 h-3.5 text-sky-600" />
                  {filteredBeritas[0].view_count || 120} pembaca
                </span>
                <span className="font-extrabold text-sky-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Baca Artikel Lengkap <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Grid Artikel Warta: Bersih, Rapi & Lega */}
        {filteredBeritas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedBeritas.map((b, idx) => {
              const thumb = idx % 3 === 0 ? '/images/event.jpg' : idx % 3 === 1 ? '/images/kursus.jpg' : '/images/landing/about_img.webp';
              return (
                <div 
                  key={b.id}
                  onClick={() => setSelectedBerita(b)}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                      <img
                        src={thumb}
                        alt={b.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 text-[10px] font-black text-sky-900 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-2xs border border-sky-100">
                        {b.kategori}
                      </span>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-sky-600" />
                          {formatBeritaDate(b.published_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-slate-400" />
                          {b.view_count || 120}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 leading-snug">
                        {b.judul}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {b.ringkasan || b.konten}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="w-full py-2 rounded-full bg-sky-50 text-sky-800 text-xs font-bold text-center group-hover:bg-sky-100 transition-colors border border-sky-200/70 flex items-center justify-center gap-1">
                      <span>Baca Selengkapnya</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-sky-100 p-10 text-center space-y-3">
            <Newspaper className="w-10 h-10 text-sky-300 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900">Belum Ada Warta yang Cocok</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ditemukan artikel untuk kata kunci "{searchQuery}". Silakan coba kata kunci lain.
            </p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={filteredBeritas.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemLabel="warta desa"
          className="pt-2"
        />

      </section>

      {/* Reader Modal: Nyaman Dibaca & Tipografi Lega */}
      {selectedBerita && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 font-sans overflow-y-auto animate-fade-in select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBerita(null);
          }}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 space-y-4 shadow-2xl modal-content my-auto max-h-[90vh] overflow-y-auto border border-sky-100 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <span className="text-[10px] font-black text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                {selectedBerita.kategori}
              </span>
              <button 
                onClick={() => setSelectedBerita(null)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
                title="Tutup (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-base sm:text-xl font-black text-slate-900 leading-snug">
                {selectedBerita.judul}
              </h2>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 border-b border-slate-100 pb-2">
                <span>{formatBeritaDate(selectedBerita.published_at)}</span>
                <span>•</span>
                <span>{selectedBerita.view_count || 120} pembaca</span>
                <span>•</span>
                <span>Diskominfo / Humas Pemkot Kediri</span>
              </div>

              <div className="h-48 rounded-2xl overflow-hidden bg-slate-100">
                <img 
                  src="/images/event.jpg" 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2 whitespace-pre-line">
                {selectedBerita.konten}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBerita(null)}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Tutup Bacaan
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
