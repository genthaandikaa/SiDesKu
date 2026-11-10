import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  X, 
  FileText, 
  Clock, 
  ArrowRight, 
  Search, 
  Copy, 
  Check, 
  AlertCircle, 
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { useAuth } from '@/shared/context/AuthContext';
import { SuratRequest } from '@/shared/types';
import { QrVerificationModal } from '@/features/dashboard/components/QrVerificationModal';

export interface SuratItem {
  id: number;
  kode: string;
  nama: string;
  kategori: string;
  waktu: string;
  biaya: string;
  syarat: string[];
  kegunaan?: string;
}

interface LayananSuratPageProps {
  initialTab?: 'katalog' | 'lacak';
}

const ITEMS_PER_PAGE = 6;

// Helper to determine category from kode_surat
const getCategoryByKode = (kode: string): string => {
  switch (kode) {
    case 'SKTP':
    case 'SKKK':
    case 'SKD':
    case 'SKP':
    case 'SKBN':
      return 'Kependudukan';
    case 'SKTM':
    case 'SKPH':
      return 'Bantuan & Sosial';
    case 'SKU':
      return 'Usaha & Ekonomi';
    case 'SKCK':
    case 'SKIK':
      return 'Kepolisian & Hukum';
    case 'SKL':
    case 'SKM':
    case 'SKBM':
    case 'SKAW':
      return 'Keluarga & Catatan Sipil';
    default:
      return 'Kependudukan';
  }
};

const DEFAULT_SURAT_TYPES: SuratItem[] = [
  {
    id: 1,
    kode: 'SKTP',
    nama: 'Surat Pengantar KTP-el',
    kategori: 'Kependudukan',
    waktu: '15 Menit',
    biaya: 'Gratis',
    syarat: ['Foto Kartu Keluarga (KK)', 'Surat Pengantar RT/RW', 'KTP Lama / Surat Kehilangan (bila hilang/rusak)'],
    kegunaan: 'Permohonan penerbitan, penggantian, atau rekam biometrik KTP Elektronik di Dispendukcapil.'
  },
  {
    id: 2,
    kode: 'SKKK',
    nama: 'Surat Pengantar Kartu Keluarga',
    kategori: 'Kependudukan',
    waktu: '15 Menit',
    biaya: 'Gratis',
    syarat: ['KK Asli Lama', 'Buku Nikah / Akta Cerai', 'Surat Keterangan Lahir / Pindah'],
    kegunaan: 'Pembuatan KK baru, penambahan anggota keluarga, atau pemutakhiran data Kartu Keluarga.'
  },
  {
    id: 3,
    kode: 'SKTM',
    nama: 'Surat Keterangan Tidak Mampu',
    kategori: 'Bantuan & Sosial',
    waktu: '15 Menit',
    biaya: 'Gratis',
    syarat: ['Foto KTP Pemohon', 'Foto Kartu Keluarga (KK)', 'Surat Pengantar RT'],
    kegunaan: 'Syarat beasiswa, KIP Kuliah, keringanan biaya rumah sakit, atau subsidi bantuan sosial.'
  },
  {
    id: 4,
    kode: 'SKD',
    nama: 'Surat Keterangan Domisili',
    kategori: 'Kependudukan',
    waktu: '10 Menit',
    biaya: 'Gratis',
    syarat: ['Foto KTP Pemohon', 'Foto Kartu Keluarga (KK)'],
    kegunaan: 'Pembukaan rekening perbankan, kelengkapan perizinan, dan syarat lamaran pekerjaan.'
  },
  {
    id: 5,
    kode: 'SKU',
    nama: 'Surat Keterangan Usaha',
    kategori: 'Usaha & Ekonomi',
    waktu: '15 Menit',
    biaya: 'Gratis',
    syarat: ['Foto KTP Pelaku Usaha', 'Foto Kartu Keluarga (KK)', 'Foto Tempat / Aktivitas Usaha'],
    kegunaan: 'Pengajuan pinjaman modal KUR Bank dan pengurusan perizinan NIB OSS UMKM.'
  },
  {
    id: 6,
    kode: 'SKCK',
    nama: 'Surat Pengantar SKCK',
    kategori: 'Kepolisian & Hukum',
    waktu: '10 Menit',
    biaya: 'Gratis',
    syarat: ['Foto KTP Pemohon', 'Foto Kartu Keluarga (KK)', 'Pas Foto 4x6 Background Merah'],
    kegunaan: 'Pengantar permohonan SKCK di Polsek/Polres untuk seleksi kerja atau administrasi resmi.'
  },
  {
    id: 7,
    kode: 'SKL',
    nama: 'Surat Keterangan Kelahiran',
    kategori: 'Keluarga & Catatan Sipil',
    waktu: '15 Menit',
    biaya: 'Gratis',
    syarat: ['Surat Kelahiran RS/Bidan', 'KTP Ayah & Ibu', 'Buku Nikah Asli', 'Kartu Keluarga'],
    kegunaan: 'Penerbitan akta kelahiran bayi dan penambahan nama anggota keluarga baru di Kartu Keluarga.'
  },
  {
    id: 8,
    kode: 'SKM',
    nama: 'Surat Keterangan Kematian',
    kategori: 'Keluarga & Catatan Sipil',
    waktu: 'Prioritas (10 Menit)',
    biaya: 'Gratis',
    syarat: ['Surat Kematian RS / Saksi RT', 'KTP & KK Almarhum/Almarhumah', 'KTP Pelapor (Ahli Waris)'],
    kegunaan: 'Penerbitan akta kematian, klaim santunan asuransi/BPJS, dan pemutakhiran data kependudukan.'
  },
  {
    id: 9,
    kode: 'SKBM',
    nama: 'Surat Keterangan Belum Menikah',
    kategori: 'Keluarga & Catatan Sipil',
    waktu: '10 Menit',
    biaya: 'Gratis',
    syarat: ['Foto KTP Pemohon', 'Kartu Keluarga Asli', 'Pernyataan Belum Menikah Bermaterai'],
    kegunaan: 'Pendaftaran nikah di KUA (Model N1-N4), seleksi instansi kedinasan, atau beasiswa.'
  },
  {
    id: 10,
    kode: 'SKP',
    nama: 'Surat Pengantar Pindah Domisili',
    kategori: 'Kependudukan',
    waktu: '20 Menit',
    biaya: 'Gratis',
    syarat: ['KTP & Kartu Keluarga Asli', 'Alamat Tujuan Pindah Lengkap', 'Surat Bebas Tanggungan RT'],
    kegunaan: 'Penerbitan surat pindah (SKPWNI) di Dispendukcapil menuju domisili daerah lain.'
  },
  {
    id: 11,
    kode: 'SKBN',
    nama: 'Surat Keterangan Beda Nama',
    kategori: 'Kependudukan',
    waktu: '15 Menit',
    biaya: 'Gratis',
    syarat: ['KTP & Kartu Keluarga Asli', 'Dokumen / Ijazah yang Berbeda Ejaan', 'Surat Pengantar RT'],
    kegunaan: 'Penegasan identitas hukum bila terdapat perbedaan nama pada KTP, Ijazah, atau Paspor.'
  },
  {
    id: 12,
    kode: 'SKPH',
    nama: 'Surat Keterangan Penghasilan',
    kategori: 'Bantuan & Sosial',
    waktu: '15 Menit',
    biaya: 'Gratis',
    syarat: ['Foto KTP Orang Tua', 'Kartu Keluarga Asli', 'Rincian Penghasilan / Slip Usaha'],
    kegunaan: 'Keterangan penghasilan orang tua/wali untuk permohonan beasiswa kuliah atau bantuan pendidikan.'
  },
  {
    id: 13,
    kode: 'SKAW',
    nama: 'Surat Keterangan Ahli Waris',
    kategori: 'Keluarga & Catatan Sipil',
    waktu: '30 Menit',
    biaya: 'Gratis',
    syarat: ['Surat Kematian Almarhum', 'Buku Nikah / Akta Cerai', 'KTP & KK Seluruh Ahli Waris', 'Pernyataan Ahli Waris'],
    kegunaan: 'Penetapan susunan ahli waris yang sah untuk urusan perbankan, pertanahan, atau asuransi.'
  },
  {
    id: 14,
    kode: 'SKIK',
    nama: 'Surat Pengantar Izin Keramaian',
    kategori: 'Kepolisian & Hukum',
    waktu: '15 Menit',
    biaya: 'Gratis',
    syarat: ['Foto KTP Tuan Rumah', 'Surat Persetujuan Tetangga Sekitar', 'Rekomendasi Ketua RT & RW'],
    kegunaan: 'Rekomendasi izin penyelenggaraan acara hajatan atau kegiatan keramaian warga ke Polsek setempat.'
  }
];

export const LayananSuratPage: React.FC<LayananSuratPageProps> = ({ initialTab = 'katalog' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const katalogTopRef = useRef<HTMLDivElement>(null);

  // Tab State: 'katalog' | 'lacak'
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'katalog' | 'lacak'>(() => {
    if (tabParam === 'lacak' || searchParams.get('keyword') || searchParams.get('hash') || initialTab === 'lacak') {
      return 'lacak';
    }
    return 'katalog';
  });

  useEffect(() => {
    if (initialTab === 'lacak' || tabParam === 'lacak' || searchParams.get('keyword') || searchParams.get('hash')) {
      setActiveTab('lacak');
    }
  }, [initialTab, tabParam, searchParams]);

  // Data States
  const [suratTypes, setSuratTypes] = useState<SuratItem[]>(DEFAULT_SURAT_TYPES);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSurat, setSelectedSurat] = useState<SuratItem | null>(null);

  // Lacak States
  const [trackingKeyword, setTrackingKeyword] = useState(searchParams.get('keyword') || '');
  const [trackingResults, setTrackingResults] = useState<SuratRequest[] | null>(null);
  const [hasSearchedTracking, setHasSearchedTracking] = useState(false);
  const [isSearchingTracking, setIsSearchingTracking] = useState(false);
  const [searchTrackingError, setSearchTrackingError] = useState('');
  const [copiedResi, setCopiedResi] = useState<string | null>(null);
  const [qrVerifyHash, setQrVerifyHash] = useState<string | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  // Fetch real types from backend if available
  useEffect(() => {
    let isMounted = true;
    const fetchTypes = async () => {
      try {
        const res = await api.get('/surat-types');
        if (isMounted && res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          interface BackendSuratType {
            id: number;
            kode_surat: string;
            nama_surat: string;
            persyaratan_json?: string[] | string;
            template_body?: string;
          }
          const mapped: SuratItem[] = res.data.data.map((item: BackendSuratType) => {
            let parsedSyarat: string[] = [];
            if (Array.isArray(item.persyaratan_json)) {
              parsedSyarat = item.persyaratan_json;
            } else if (typeof item.persyaratan_json === 'string') {
              try {
                parsedSyarat = JSON.parse(item.persyaratan_json);
              } catch {
                parsedSyarat = [item.persyaratan_json];
              }
            }

            return {
              id: item.id,
              kode: item.kode_surat,
              nama: item.nama_surat,
              kategori: getCategoryByKode(item.kode_surat),
              waktu: item.kode_surat === 'SKM' ? 'Prioritas (10 Menit)' : '10-15 Menit',
              biaya: 'Gratis',
              syarat: parsedSyarat.length > 0 ? parsedSyarat : ['KTP Asli', 'Kartu Keluarga'],
              kegunaan: ''
            };
          });
          setSuratTypes(mapped);
        }
      } catch {
        // Fallback to DEFAULT_SURAT_TYPES
      }
    };
    fetchTypes();
    return () => {
      isMounted = false;
    };
  }, []);

  // Lacak init query params
  useEffect(() => {
    const initKeyword = searchParams.get('keyword');
    const initHash = searchParams.get('hash');

    if (initKeyword) {
      setTrackingKeyword(initKeyword);
      executeSearchTracking(initKeyword);
    }
    if (initHash) {
      setQrVerifyHash(initHash);
      setIsVerifyModalOpen(true);
    }
  }, [searchParams]);

  // Modal ESC & Scroll Lock
  useEffect(() => {
    if (selectedSurat) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSelectedSurat(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedSurat]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const categories = [
    'Semua',
    'Kependudukan',
    'Bantuan & Sosial',
    'Usaha & Ekonomi',
    'Kepolisian & Hukum',
    'Keluarga & Catatan Sipil'
  ];

  // Dynamic count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: suratTypes.length };
    categories.forEach(cat => {
      if (cat !== 'Semua') {
        counts[cat] = suratTypes.filter(s => s.kategori === cat).length;
      }
    });
    return counts;
  }, [suratTypes]);

  // Filtered letters
  const filteredSuratTypes = useMemo(() => {
    return suratTypes.filter((s) => {
      const matchCategory = selectedCategory === 'Semua' || s.kategori.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        s.nama.toLowerCase().includes(q) || 
        s.kode.toLowerCase().includes(q) ||
        s.syarat.some(sy => sy.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [suratTypes, selectedCategory, searchQuery]);

  // Pagination calculation
  const totalItems = filteredSuratTypes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedSuratTypes = filteredSuratTypes.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === safeCurrentPage) return;
    setCurrentPage(newPage);
    if (katalogTopRef.current) {
      katalogTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const executeSearchTracking = async (kw: string) => {
    if (!kw.trim()) {
      setSearchTrackingError('Masukkan nomor resi surat.');
      return;
    }

    setIsSearchingTracking(true);
    setSearchTrackingError('');
    setHasSearchedTracking(true);

    try {
      const res = await api.get(`/public/surat/track?keyword=${encodeURIComponent(kw.trim())}`);
      if (res.data.success && res.data.data.length > 0) {
        setTrackingResults(res.data.data);
      } else {
        setTrackingResults([]);
        setSearchTrackingError('Nomor resi tidak ditemukan. Pastikan nomor resi sudah sesuai.');
      }
    } catch {
      setSearchTrackingError('Gagal memuat status surat. Silakan coba kembali.');
    } finally {
      setIsSearchingTracking(false);
    }
  };

  const handleCopyResi = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResi(text);
    setTimeout(() => setCopiedResi(null), 2000);
  };

  const handleStartAjukan = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login?returnUrl=/dashboard');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 font-sans text-slate-800 space-y-8 sm:space-y-12">
      
      {/* Clean Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          Layanan Persuratan Warga
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Pilih jenis permohonan surat administrasi secara online atau pantau progres berkas yang telah diajukan secara real-time.
        </p>

        {/* Minimal Segmented Switcher */}
        <div className="pt-2">
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab('katalog');
                setSearchParams({});
              }}
              className={`py-2 px-5 sm:px-6 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'katalog'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Daftar Surat ({suratTypes.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('lacak');
                setSearchParams({ tab: 'lacak' });
              }}
              className={`py-2 px-5 sm:px-6 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'lacak'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4 text-slate-600" />
              <span>Lacak Status</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: DAFTAR SURAT (KATALOG DENGAN PAGINATION)
          ========================================================================= */}
      {activeTab === 'katalog' && (
        <div ref={katalogTopRef} className="space-y-6 sm:space-y-8">
          
          {/* Controls: Search & Category Filter */}
          <div className="space-y-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari nama surat, kode, atau syarat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-8 py-2.5 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status info bar */}
              <div className="text-xs text-slate-500 flex items-center gap-1.5 self-center sm:self-auto font-medium">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {totalItems > 0 
                    ? `Menampilkan ${startIndex + 1}–${endIndex} dari ${totalItems} layanan`
                    : 'Tidak ada layanan'}
                </span>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-200/70 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clean Letter Cards Grid */}
          {paginatedSuratTypes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {paginatedSuratTypes.map((s) => (
                <div 
                  key={s.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 hover:border-blue-500 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100/80">
                        {s.kode}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-100">
                        {s.kategori}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {s.nama}
                    </h3>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                      <div className="font-bold text-slate-700">Persyaratan Utama:</div>
                      <div className="space-y-1">
                        {s.syarat.slice(0, 2).map((req, rIdx) => (
                          <div key={rIdx} className="flex items-center gap-1.5 text-slate-500 truncate">
                            <span className="w-1 h-1 rounded-full bg-blue-600 shrink-0" />
                            <span className="truncate">{req}</span>
                          </div>
                        ))}
                        {s.syarat.length > 2 && (
                          <span className="text-blue-600 text-[10px] font-semibold pl-2.5">
                            +{s.syarat.length - 2} dokumen lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {s.waktu}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">{s.biaya}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedSurat(s)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shadow-blue-600/20 active:scale-95"
                    >
                      <span>Ajukan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-10 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Layanan tidak ditemukan</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Tidak ada jenis surat yang cocok dengan kata kunci "{searchQuery}" pada kategori {selectedCategory}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Semua');
                }}
                className="inline-flex px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Reset Filter & Pencarian
              </button>
            </div>
          )}

          {/* ================= PAGINATION BAR ================= */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-6 border-t border-slate-100/80">
              <div className="text-xs text-slate-500 font-medium order-2 sm:order-1">
                Halaman <span className="font-bold text-slate-800">{safeCurrentPage}</span> dari{' '}
                <span className="font-bold text-slate-800">{totalPages}</span>
              </div>

              <div className="inline-flex items-center gap-1.5 order-1 sm:order-2">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                  aria-label="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                {/* Page Number Pills */}
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => {
                  const isActive = pageNum === safeCurrentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      aria-label={`Halaman ${pageNum}`}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                  aria-label="Halaman Berikutnya"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          TAB 2: LACAK STATUS (TRACKING)
          ========================================================================= */}
      {activeTab === 'lacak' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Tracking Search Input */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3">
            <form onSubmit={(e) => { e.preventDefault(); executeSearchTracking(trackingKeyword); }} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Masukkan nomor resi (contoh: REQ-20260818-001)"
                  value={trackingKeyword}
                  onChange={(e) => setTrackingKeyword(e.target.value)}
                  className="w-full pl-9.5 pr-3 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingTracking}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs shadow-blue-600/20"
              >
                {isSearchingTracking ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Mencari...</span>
                  </>
                ) : (
                  <span>Lacak</span>
                )}
              </button>
            </form>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
              <span>Contoh:</span>
              {['REQ-20260818-001', 'REQ-20260818-002'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setTrackingKeyword(sample);
                    executeSearchTracking(sample);
                  }}
                  className="font-mono text-blue-600 hover:underline cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>

            {searchTrackingError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchTrackingError}</span>
              </div>
            )}
          </div>

          {/* Tracking Result Card */}
          {hasSearchedTracking && trackingResults && trackingResults.length > 0 && (
            <div className="space-y-4">
              {trackingResults.map((item) => {
                let statusLabel = 'Menunggu Persetujuan RT';
                let statusColor = 'bg-amber-50 text-amber-800 border-amber-200';
                
                if (item.status === 'completed') {
                  statusLabel = 'Selesai & Sah (TTE)';
                  statusColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                } else if (item.status === 'rejected') {
                  statusLabel = 'Ditolak / Perlu Perbaikan';
                  statusColor = 'bg-rose-50 text-rose-800 border-rose-200';
                } else if (item.status === 'processed_sekdes' || item.status === 'approved_rt') {
                  statusLabel = 'Verifikasi Kelurahan';
                  statusColor = 'bg-blue-50 text-blue-800 border-blue-200';
                }

                return (
                  <div key={item.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-900">{item.nomor_resi}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyResi(item.nomor_resi)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded"
                            title="Salin Nomor Resi"
                          >
                            {copiedResi === item.nomor_resi ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900 mt-1">
                          {item.surat_type?.nama_surat}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pemohon: <span className="font-semibold text-slate-700">{item.warga_profile?.nama_lengkap}</span>
                        </p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Timeline logs */}
                    {item.trackings && item.trackings.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Riwayat Pemrosesan
                        </div>
                        <div className="space-y-2">
                          {item.trackings.map((t, idx) => (
                            <div key={t.id || idx} className="flex items-start gap-2.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-slate-700">
                                  <span className="font-bold">{t.status_stage} • {t.status_action}</span>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    {new Date(t.created_at).toLocaleDateString('id-ID')}
                                  </span>
                                </div>
                                {t.catatan && <p className="text-slate-500 italic mt-0.5">{t.catatan}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action */}
                    {item.status === 'completed' && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setQrVerifyHash(item.qr_verification_hash || item.nomor_resi);
                            setIsVerifyModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Periksa Tanda Tangan QR</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Simple Link to QR Verifier */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setQrVerifyHash(null);
                setIsVerifyModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-400" />
              <span>Verifikasi keaslian surat fisik melalui kode QR</span>
            </button>
          </div>
        </div>
      )}

      {/* Clean Detail & Application Modal */}
      {selectedSurat && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/60 font-sans backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedSurat(null);
          }}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {selectedSurat.kode}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {selectedSurat.kategori}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  {selectedSurat.nama}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSurat(null)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-800 text-sm">Berkas Persyaratan yang Perlu Disiapkan:</span>
                <div className="mt-2.5 space-y-2">
                  {selectedSurat.syarat.map((syarat, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{syarat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Estimasi Pengerjaan: <strong>{selectedSurat.waktu}</strong></span>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
                  {selectedSurat.biaya}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedSurat(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedSurat(null);
                  handleStartAjukan();
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm shadow-blue-600/25 active:scale-95"
              >
                <span>{user ? 'Lanjut Pengajuan' : 'Masuk Akun & Ajukan'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal QR Verification */}
      {isVerifyModalOpen && (
        <QrVerificationModal
          hash={qrVerifyHash || undefined}
          onClose={() => {
            setIsVerifyModalOpen(false);
            setQrVerifyHash(null);
          }}
        />
      )}

    </div>
  );
};
