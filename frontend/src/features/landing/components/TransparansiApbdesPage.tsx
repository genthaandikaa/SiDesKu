import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Search,
  HeartHandshake,
  Download,
  Lock,
  FileText,
  AlertCircle,
  MapPin,
  Printer,
  Clock,
  Check,
  PieChart,
  BarChart3,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { ApbdesRecord } from '@/shared/types';

interface TransparansiApbdesPageProps {
  initialTab?: 'anggaran' | 'bansos';
}

interface DokumenLaporan {
  id: string;
  kodeKategori: string;
  kategori: string;
  badgeKategori: string;
  periode: string;
  ukuran: string;
  tahun: number;
  judul: string;
  deskripsi: string;
  hash: string;
  diunduh: number;
  fileUrl: string;
}

const DOKUMEN_DATA: DokumenLaporan[] = [
  {
    id: 'doc-01',
    kodeKategori: 'perda',
    kategori: 'Perda APBD',
    badgeKategori: 'Perda APBD',
    periode: 'TA 2025',
    ukuran: '14.8 MB',
    tahun: 2025,
    judul: 'Buku Induk Anggaran Pendapatan dan Belanja Daerah (APBD) Tahun 2025',
    deskripsi: 'Peraturan Daerah Nomor 04 Tahun 2024 tentang Anggaran Pendapatan dan Belanja Daerah Beserta Lampiran Penjabaran.',
    hash: 'SHA256: 8f4e2b0...1c93a',
    diunduh: 1428,
    fileUrl: '#'
  },
  {
    id: 'doc-02',
    kodeKategori: 'bpk',
    kategori: 'Laporan BPK RI',
    badgeKategori: 'Laporan BPK RI',
    periode: 'Audit 2024',
    ukuran: '8.2 MB',
    tahun: 2024,
    judul: 'Laporan Hasil Pemeriksaan (LHP) atas Laporan Keuangan Pemerintah Daerah TA 2024',
    deskripsi: 'Opini Wajar Tanpa Pengecualian (WTP) oleh Badan Pemeriksa Keuangan Republik Indonesia Perwakilan Provinsi.',
    hash: 'SHA256: 4a91f0c...99e71',
    diunduh: 912,
    fileUrl: '#'
  },
  {
    id: 'doc-03',
    kodeKategori: 'lakip',
    kategori: 'LAKIP',
    badgeKategori: 'LAKIP',
    periode: 'Periode 2024',
    ukuran: '6.4 MB',
    tahun: 2024,
    judul: 'Laporan Kinerja Instansi Pemerintah (LAKIP) Kota',
    deskripsi: 'Pengukuran capaian indikator kinerja utama daerah terhadap target rencana strategis tahunan seluruh Organisasi Perangkat Daerah.',
    hash: 'SHA256: d227ab1...65aa0',
    diunduh: 640,
    fileUrl: '#'
  },
  {
    id: 'doc-04',
    kodeKategori: 'rpjmd',
    kategori: 'RPJMD',
    badgeKategori: 'RPJMD',
    periode: '2021-2026',
    ukuran: '22.1 MB',
    tahun: 2025,
    judul: 'Rencana Pembangunan Jangka Menengah Daerah (RPJMD) Pemkot',
    deskripsi: 'Dokumen panduan strategis 5 tahunan arah pembangunan infrastruktur fisik, ekonomi mandiri, dan integrasi digital kota.',
    hash: 'SHA256: 77f9801...ee029',
    diunduh: 3810,
    fileUrl: '#'
  }
];

export const TransparansiApbdesPage: React.FC<TransparansiApbdesPageProps> = ({ initialTab = 'anggaran' }) => {
  const [activeTab, setActiveTab] = useState<'anggaran' | 'bansos'>(initialTab);

  // Chart & Breakdown State
  const [chartMode, setChartMode] = useState<'pendapatan' | 'belanja'>('pendapatan');
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);

  // Document Repository States
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [selectedDocYear, setSelectedDocYear] = useState<string>('2025');
  const [selectedDocCategory, setSelectedDocCategory] = useState<string>('Semua');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  // Bansos States
  const [nikSearch, setNikSearch] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [isSearchingBansos, setIsSearchingBansos] = useState(false);
  const [hasSearchedBansos, setHasSearchedBansos] = useState(false);

  useEffect(() => {
    if (initialTab === 'bansos') {
      setActiveTab('bansos');
    }
  }, [initialTab]);

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-bulog-active');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handlePrintBulog = () => {
    document.body.classList.add('printing-bulog-active');
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
      }, 50);
    });
  };

  const handleDownloadDoc = (doc: DokumenLaporan) => {
    setDownloadSuccessToast(`Mengunduh: ${doc.judul}`);
    setTimeout(() => {
      setDownloadSuccessToast(null);
    }, 3000);
  };

  // Data for Charts
  const pendapatanBreakdown = [
    { label: 'Pendapatan Transfer Pusat & Provinsi', nominal: 'Rp 1,34 T', pagu: 'Rp 1,42 T', persen: 62, color: '#2563eb', bg: 'bg-blue-600', lightBg: 'bg-blue-50', textColor: 'text-blue-700' },
    { label: 'Pendapatan Asli Daerah (PAD)', nominal: 'Rp 670 M', pagu: 'Rp 780 M', persen: 31, color: '#0284c7', bg: 'bg-sky-600', lightBg: 'bg-sky-50', textColor: 'text-sky-700' },
    { label: 'Lain-lain Pendapatan Daerah Sah', nominal: 'Rp 150 M', pagu: 'Rp 160 M', persen: 7, color: '#10b981', bg: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-700' },
  ];

  const belanjaBreakdown = [
    { label: 'Belanja Operasi (Layanan, Pendidikan & Kesehatan)', nominal: 'Rp 1,13 T', pagu: 'Rp 1,18 T', persen: 54, color: '#3b82f6', bg: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-700' },
    { label: 'Belanja Modal & Infrastruktur Fisik', nominal: 'Rp 588 M', pagu: 'Rp 640 M', persen: 28, color: '#0ea5e9', bg: 'bg-sky-500', lightBg: 'bg-sky-50', textColor: 'text-sky-700' },
    { label: 'Belanja Transfer (Alokasi Kewilayahan / RT / RW)', nominal: 'Rp 252 M', pagu: 'Rp 280 M', persen: 12, color: '#6366f1', bg: 'bg-indigo-500', lightBg: 'bg-indigo-50', textColor: 'text-indigo-700' },
    { label: 'Belanja Tidak Terduga (Darurat & Bencana)', nominal: 'Rp 126 M', pagu: 'Rp 150 M', persen: 6, color: '#f59e0b', bg: 'bg-amber-500', lightBg: 'bg-amber-50', textColor: 'text-amber-700' },
  ];

  const activeBreakdown = chartMode === 'pendapatan' ? pendapatanBreakdown : belanjaBreakdown;

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return DOKUMEN_DATA.filter((doc) => {
      const q = searchDocQuery.toLowerCase().trim();
      const matchSearch = !q || 
        doc.judul.toLowerCase().includes(q) || 
        doc.deskripsi.toLowerCase().includes(q) || 
        doc.kategori.toLowerCase().includes(q) ||
        doc.hash.toLowerCase().includes(q);
      const matchYear = selectedDocYear === 'Semua' || selectedDocYear === '2025' || doc.tahun.toString() === selectedDocYear;
      const matchCategory = selectedDocCategory === 'Semua' || doc.kategori === selectedDocCategory;
      return matchSearch && matchYear && matchCategory;
    });
  }, [searchDocQuery, selectedDocYear, selectedDocCategory]);

  const bansosPrograms = [
    {
      nama: 'Bantuan Pangan Beras (CBP Bulog)',
      sumber: 'Bapanas & Bulog',
      nominal: '30 Kg Beras',
      tahap: 'Juli–September 2026',
      kriteria: 'Keluarga terdaftar di basis data PBP Bapanas pusat.',
      jadwal: 'Selasa, 18 Agustus 2026 (08.30 WIB)',
      lokasi: 'Balai Kelurahan Setempat',
    },
    {
      nama: 'Program Keluarga Harapan (PKH)',
      sumber: 'Kemensos RI',
      nominal: 'Rp 750.000 / Tahap',
      tahap: 'Tahap III 2026',
      kriteria: 'Keluarga DTKS dengan anak sekolah, balita, atau lansia.',
      jadwal: '25 Agustus 2026 (08.30 WIB)',
      lokasi: 'Pendopo Kecamatan / Balai Kelurahan',
    },
    {
      nama: 'Bantuan Langsung Tunai (BLT Daerah)',
      sumber: 'APBD Kota Kediri',
      nominal: 'Rp 300.000 / Bulan',
      tahap: 'Alokasi Berjalan 2026',
      kriteria: 'Keluarga rentan non-penerima PKH/BPNT terverifikasi lurah.',
      jadwal: '28 Agustus 2026 (09.00 WIB)',
      lokasi: 'Loket Layanan Kelurahan',
    },
  ];

  const handleCekNik = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nikSearch.trim()) return;

    setIsSearchingBansos(true);
    setHasSearchedBansos(true);

    setTimeout(() => {
      const q = nikSearch.trim().toLowerCase();
      if (q.includes('430376') || q.includes('supriyadi') || q.includes('1340') || q.includes('350606') || q === '3506064303760001') {
        setSearchResult({
          tipe: 'undangan_bulog',
          judulSurat: 'UNDANGAN PENERIMA BANTUAN PANGAN BERAS PERIODE BULAN JULI SAMPAI DENGAN SEPTEMBER TAHUN 2026',
          provinsi: 'JAWA TIMUR',
          kabupaten: 'KOTA KEDIRI',
          kecamatan: 'Kecamatan Wilayah Pusat',
          desa: 'Kelurahan Balowerti',
          tanggalSurat: 'Kota Kediri, Kamis, 13 Agustus 2026',
          nomorSurat: 'UND/18/08/26/115001',
          perihal: 'UNDANGAN',
          nama: 'Supriyadi',
          nik: '3506064303760001',
          nikMasked: '******4303760001',
          alamat: 'RT 38 / RW 6',
          hariTanggal: 'Selasa, 18 Agustus 2026',
          jam: '08:30 WIB s.d Selesai',
          tempat: 'BALAI KELURAHAN BALOWERTI',
          keperluan: 'Mengambil Bantuan Pangan alokasi bulan Juli - September 2026 sejumlah 30 (tiga puluh) Kg Beras',
          alokasi: '30 (Tiga Puluh) Kg Beras',
          noUrut: '1340',
          barcode: '350606200801340',
          status: 'Undangan Resmi Terbit • Siap Diambil',
          persyaratan: [
            'Membawa bukti undangan fisik atau digital',
            'KTP asli / Identitas Kependudukan Digital (IKD)',
            'Jika diwakilkan dalam 1 KK: KTP asli pengambil & KK asli'
          ],
          catatanBatas: 'Harap hadir tepat waktu sesuai sesi yang telah ditentukan.'
        });
      } else if (q.includes('35060415') || q.includes('bambang') || q === '3506041505840001') {
        setSearchResult({
          tipe: 'reguler',
          nik: '3506041505840001',
          nama: 'Bambang Utomo',
          rt: '01 / RW 01',
          dusun: 'Wilayah Barat',
          program: 'Program Keluarga Harapan (PKH) Tahap III 2026',
          status: 'Terdaftar & Siap Disalurkan',
          antrean: 'A-014',
          jadwal: '25 Agustus 2026, Pukul 08.30 WIB',
          lokasi: 'Kantor Kelurahan Setempat',
          nominal: 'Rp 750.000,-',
          barcode: 'PKH2026-A014-3506',
        });
      } else {
        setSearchResult(null);
      }
      setIsSearchingBansos(false);
    }, 400);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 font-sans text-slate-800 space-y-16 sm:space-y-20">

      {/* TOAST NOTIFICATION */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in border border-slate-800 text-xs">
          <Download className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{downloadSuccessToast}</span>
          <span className="font-mono text-emerald-400 font-bold text-[10px] bg-slate-800 px-2 py-0.5 rounded">SHA-256 OK</span>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
          Transparansi Anggaran & Tata Kelola
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Publikasi realisasi Anggaran Pendapatan & Belanja Daerah (APBD), visualisasi distribusi dana, serta repositori dokumen resmi yang dapat diakses seluruh warga.
        </p>

        {/* Segmented Switcher */}
        <div className="pt-2">
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('anggaran')}
              className={`py-2 px-5 sm:px-6 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'anggaran'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>APBD & Dokumen Publik</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bansos')}
              className={`py-2 px-5 sm:px-6 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'bansos'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-slate-600" />
              <span>Cek Bansos (DTKS)</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TAB 1: APBD, DIAGRAM & DOKUMEN REPOSITORI
          ========================================================================= */}
      {activeTab === 'anggaran' && (
        <div className="space-y-16 sm:space-y-20 animate-fade-in">

          {/* 3 CORE FINANCIAL METRICS */}
          <section className="space-y-6">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Ringkasan Eksekutif</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Realisasi Fiskal Daerah Tahun 2025</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {/* Card 1: Pendapatan */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4 hover:border-blue-400 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Pendapatan Daerah
                  </span>
                  <span className="font-bold text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    68.4% Realisasi
                  </span>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Rp 1,48 Triliun
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Target Pagu: Rp 2,16 Triliun
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-700" style={{ width: '68.4%' }} />
                </div>

                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between font-medium">
                  <span>PAD & Transfer Pusat</span>
                  <span className="font-bold text-slate-700">Semua Wilayah</span>
                </div>
              </div>

              {/* Card 2: Belanja */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4 hover:border-blue-400 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-sky-600" />
                    Belanja Daerah
                  </span>
                  <span className="font-bold text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                    74.2% Terserap
                  </span>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Rp 1,56 Triliun
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-1">
                    Alokasi Pagu: Rp 2,10 Triliun
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full transition-all duration-700" style={{ width: '74.2%' }} />
                </div>

                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between font-medium">
                  <span>Layanan, Modal & Operasi</span>
                  <span className="font-bold text-slate-700">Prioritas Publik</span>
                </div>
              </div>

              {/* Card 3: Akuntabilitas & Audit */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4 hover:border-blue-400 hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    Kepatuhan & Audit
                  </span>
                  <span className="font-bold text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Opini WTP
                  </span>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    WTP BPK RI
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold mt-1">
                    10 Tahun Berturut-turut WTP
                  </div>
                </div>

                <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-full" />
                </div>

                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between font-medium">
                  <span>Audit Kinerja & Keuangan</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Terverifikasi
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              DIAGRAM INTERAKTIF DISTRIBUSI ANGGARAN (VISUAL CHART)
              ========================================================================= */}
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Visualisasi Anggaran</div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Diagram Distribusi Pos Keuangan Daerah
                </h3>
              </div>

              {/* Mode Switcher: Pendapatan vs Belanja */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    setChartMode('pendapatan');
                    setActiveSegmentIndex(null);
                  }}
                  className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartMode === 'pendapatan'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Struktur Pendapatan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChartMode('belanja');
                    setActiveSegmentIndex(null);
                  }}
                  className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    chartMode === 'belanja'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Struktur Belanja
                </button>
              </div>
            </div>

            {/* Grid: Donut Chart on Left, Breakdown Cards on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* SVG Donut Chart */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
                <div className="relative w-56 h-56 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    {/* Background Ring */}
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="20"
                    />

                    {/* Dynamic Segments */}
                    {(() => {
                      const circumference = 2 * Math.PI * 70; // ~439.82
                      let accumulatedPercent = 0;
                      return activeBreakdown.map((item, idx) => {
                        const strokeDasharray = `${(item.persen / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                        accumulatedPercent += item.persen;
                        const isHovered = activeSegmentIndex === idx;

                        return (
                          <circle
                            key={idx}
                            cx="100"
                            cy="100"
                            r="70"
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth={isHovered ? "25" : "20"}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="butt"
                            className="transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setActiveSegmentIndex(idx)}
                            onMouseLeave={() => setActiveSegmentIndex(null)}
                          />
                        );
                      });
                    })()}
                  </svg>

                  {/* Donut Center Display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {activeSegmentIndex !== null ? 'Proporsi Pos' : 'Total Nilai'}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-900">
                      {activeSegmentIndex !== null ? `${activeBreakdown[activeSegmentIndex].persen}%` : (chartMode === 'pendapatan' ? 'Rp 2,16 T' : 'Rp 2,10 T')}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium truncate max-w-[130px]">
                      {activeSegmentIndex !== null ? activeBreakdown[activeSegmentIndex].nominal : (chartMode === 'pendapatan' ? 'Pagu Pendapatan' : 'Pagu Belanja')}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 mt-2 text-center">
                  Arahkan kursor pada diagram untuk melihat rincian pos
                </div>
              </div>

              {/* Breakdown List Cards on the Right */}
              <div className="lg:col-span-7 space-y-3">
                {activeBreakdown.map((item, idx) => {
                  const isHovered = activeSegmentIndex === idx;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setActiveSegmentIndex(idx)}
                      onMouseLeave={() => setActiveSegmentIndex(null)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isHovered 
                          ? 'bg-blue-50/50 border-blue-400 shadow-xs' 
                          : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span 
                            className="w-3 h-3 rounded-full shrink-0" 
                            style={{ backgroundColor: item.color }} 
                          />
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            {item.label}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-black text-slate-900 shrink-0">
                          {item.persen}%
                        </span>
                      </div>

                      <div className="mt-2 pl-5.5 flex items-center justify-between text-xs text-slate-500">
                        <span>Realisasi: <strong className="text-slate-800">{item.nominal}</strong></span>
                        <span className="text-slate-400">Pagu: {item.pagu}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </section>

          {/* =========================================================================
              3 SHOWCASE PROYEK STRATEGIS (KARTU FOTO DARI REFERENSI)
              ========================================================================= */}
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              
              {/* Card 1: Infrastruktur Transportasi */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xs border border-slate-200/80 group aspect-[16/10] sm:aspect-auto sm:h-52 md:h-56 bg-slate-900">
                <img 
                  src="/images/transparansi/transportasi.webp" 
                  alt="Infrastruktur Berkelanjutan - Jalur Transportasi Terpadu"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="sr-only">Infrastruktur Berkelanjutan - Jalur Transportasi Terpadu</span>
              </div>

              {/* Card 2: Fasilitas Kesehatan Inklusif */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xs border border-slate-200/80 group aspect-[16/10] sm:aspect-auto sm:h-52 md:h-56 bg-slate-900">
                <img 
                  src="/images/transparansi/kesehatan.webp" 
                  alt="Aksesibilitas Universal - Fasilitas Kesehatan Inklusif"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="sr-only">Aksesibilitas Universal - Fasilitas Kesehatan Inklusif</span>
              </div>

              {/* Card 3: Monitoring Wilayah Terpusat */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xs border border-slate-200/80 group aspect-[16/10] sm:aspect-auto sm:h-52 md:h-56 bg-slate-900">
                <img 
                  src="/images/transparansi/monitoring.webp" 
                  alt="Pemerintahan Digital - Monitoring Wilayah Terpusat"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="sr-only">Pemerintahan Digital - Monitoring Wilayah Terpusat</span>
              </div>

            </div>
          </section>

          {/* =========================================================================
              BAB 03 • REPOSITORI KETERBUKAAN (DOKUMEN PUBLIK & LAPORAN PERTANGGUNGJAWABAN)
              Presisi 1:1 Mengikuti Gambar Referensi Stitch/Figma Pengguna
              ========================================================================= */}
          <section id="repositori" className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
            
            {/* Header & Verification Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  BAB 03 • REPOSITORI KETERBUKAAN
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Dokumen Publik & Laporan Pertanggungjawaban
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Unduh berkas resmi hasil audit, rancangan peraturan daerah, dan indikator kinerja tanpa perantara.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0 pt-1">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Integritas Terenkripsi SHA-256</span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
              {/* Search Bar */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari nama dokumen, nomor perda, atau kata kunci..."
                  value={searchDocQuery}
                  onChange={(e) => setSearchDocQuery(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
                />
              </div>

              {/* Year Dropdown */}
              <div className="sm:col-span-3">
                <select
                  value={selectedDocYear}
                  onChange={(e) => setSelectedDocYear(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="2025">Tahun 2025 (Berjalan)</option>
                  <option value="Semua">Semua Tahun</option>
                  <option value="2024">Tahun 2024</option>
                  <option value="2023">Tahun 2023</option>
                </select>
              </div>

              {/* Category Dropdown */}
              <div className="sm:col-span-3">
                <select
                  value={selectedDocCategory}
                  onChange={(e) => setSelectedDocCategory(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 font-medium focus:bg-white focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Perda APBD">Perda APBD</option>
                  <option value="Laporan BPK RI">Laporan BPK RI</option>
                  <option value="LAKIP">LAKIP</option>
                  <option value="RPJMD">RPJMD</option>
                </select>
              </div>
            </div>

            {/* Document Rows (Matching Stitch/Figma Design) */}
            <div className="space-y-3.5 pt-2">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-5 sm:p-6 bg-slate-50/50 hover:bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    {/* Left File Info */}
                    <div className="flex items-start gap-4">
                      {/* PDF Red Badge Icon */}
                      <div className="w-12 h-14 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-rose-600 shrink-0 shadow-2xs">
                        <FileText className="w-5 h-5" />
                        <span className="text-[9px] font-black uppercase tracking-wider mt-0.5">PDF</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                            {doc.badgeKategori}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {doc.periode} • Ukuran: {doc.ukuran}
                          </span>
                        </div>

                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                          {doc.judul}
                        </h4>

                        <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                          {doc.deskripsi}
                        </p>

                        <div className="text-[11px] text-emerald-700 font-mono font-medium flex items-center gap-1.5 pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{doc.hash} (Tersertifikasi Balai Sertifikasi Elektronik)</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Download CTA */}
                    <div className="flex flex-col items-end shrink-0 pt-2 md:pt-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadDoc(doc)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        <span>Unduh Dokumen</span>
                      </button>
                      <span className="text-[11px] text-slate-400 font-medium mt-1.5">
                        {doc.diunduh.toLocaleString('id-ID')}x Diunduh
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Tidak ada dokumen yang sesuai dengan kata kunci "{searchDocQuery}".
                </div>
              )}
            </div>

          </section>

        </div>
      )}

      {/* =========================================================================
          TAB 2: BANTUAN SOSIAL (BANSOS)
          ========================================================================= */}
      {activeTab === 'bansos' && (
        <div className="max-w-4xl mx-auto space-y-8 pb-14 animate-fade-in">
          
          {/* NIK Checker Console */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs space-y-4">
            <div className="text-center space-y-1 mb-2">
              <h3 className="font-black text-lg text-slate-900">Pengecekan Mandiri Kepesertaan Bansos (DTKS)</h3>
              <p className="text-xs text-slate-500">Masukkan 16 digit NIK KTP Anda untuk melihat status jadwal dan antrean.</p>
            </div>

            <form onSubmit={handleCekNik} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Masukkan 16 digit NIK KTP..."
                  value={nikSearch}
                  onChange={(e) => setNikSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-slate-800"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingBansos}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs shadow-blue-600/20"
              >
                {isSearchingBansos ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Memeriksa...</span>
                  </>
                ) : (
                  <>
                    <span>Cek Status NIK</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick NIK helper chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span className="text-slate-400 font-medium text-[11px]">Contoh Pengujian:</span>
              <button
                type="button"
                onClick={() => setNikSearch('3506064303760001')}
                className="px-2.5 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-mono font-bold text-[10px] border border-blue-200 transition-all cursor-pointer"
              >
                3506064303760001 (Bulog 30 Kg)
              </button>
              <button
                type="button"
                onClick={() => setNikSearch('3506041505840001')}
                className="px-2.5 py-0.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono font-bold text-[10px] border border-slate-200 transition-all cursor-pointer"
              >
                3506041505840001 (PKH)
              </button>
            </div>
          </div>

          {/* Results Display */}
          {hasSearchedBansos && !isSearchingBansos && (
            <div className="animate-fade-in">
              {searchResult ? (
                searchResult.tipe === 'undangan_bulog' ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4 print:hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          {searchResult.status}
                        </span>
                        <h3 className="font-black text-lg text-slate-900 mt-1">Undangan Bantuan Pangan Beras 30 Kg</h3>
                        <div className="text-xs text-slate-500 font-mono">No. Surat: {searchResult.nomorSurat}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">No. Antrean</div>
                        <div className="text-3xl font-black font-mono text-slate-900">{searchResult.noUrut}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold">Penerima Manfaat</div>
                        <div className="font-extrabold text-slate-900 mt-0.5">{searchResult.nama}</div>
                        <div className="text-[11px] font-mono text-slate-500">{searchResult.nikMasked}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold">Jadwal Pengambilan</div>
                        <div className="font-extrabold text-slate-900 mt-0.5">{searchResult.hariTanggal}</div>
                        <div className="text-[11px] text-slate-500">{searchResult.jam} di Balai Kelurahan</div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <div className="text-[10px] text-emerald-600 font-bold">Alokasi Beras</div>
                        <div className="font-extrabold text-emerald-800 text-sm mt-0.5">{searchResult.alokasi}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold">100% Bebas Biaya</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={`/api/public/surat/qr?data=${searchResult.barcode}`}
                          alt={searchResult.barcode}
                          className="w-14 h-14 rounded-xl border border-slate-200 p-1 bg-white"
                        />
                        <div>
                          <div className="text-[10px] text-slate-400 font-mono">Kode Barcode Bulog</div>
                          <div className="font-mono font-black text-xs text-slate-900">{searchResult.barcode}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePrintBulog}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Surat Undangan</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                          {searchResult.status}
                        </span>
                        <h3 className="font-black text-lg text-slate-900 mt-1">{searchResult.nama}</h3>
                        <div className="text-xs text-slate-500 font-mono">NIK: {searchResult.nik} • {searchResult.dusun} (RT {searchResult.rt})</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Antrean</div>
                        <div className="text-3xl font-black text-blue-600 font-mono">{searchResult.antrean}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <div className="text-slate-400 text-[10px] font-bold">Program Bantuan</div>
                        <div className="font-black text-slate-900 mt-0.5">{searchResult.program}</div>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <div className="text-slate-400 text-[10px] font-bold">Nominal Penyaluran</div>
                        <div className="font-black text-blue-600 mt-0.5 text-sm">{searchResult.nominal}</div>
                      </div>
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <div className="text-slate-400 text-[10px] font-bold">Jadwal & Lokasi</div>
                        <div className="font-black text-slate-900 mt-0.5">{searchResult.jadwal}</div>
                        <div className="text-[11px] text-slate-500">{searchResult.lokasi}</div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
                  <div className="font-bold text-sm text-slate-900">NIK Belum Terdaftar Pada Penyaluran Periode Berjalan</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Data penerima bantuan diperbarui berkala sesuai DTKS Kemensos. Silakan hubungi pengurus RT setempat bila membutuhkan konsultasi pendataan bansos.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3 Active Bansos Programs */}
          <div className="space-y-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Agenda Penyaluran</div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Program Bansos Berjalan di Kota Kediri
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bansosPrograms.map((b) => (
                <div 
                  key={b.nama} 
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {b.tahap}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">{b.sumber}</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{b.nama}</h4>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold">Nominal / Alokasi</div>
                      <div className="font-black text-sm text-blue-600">{b.nominal}</div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {b.kriteria}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 text-xs space-y-1 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{b.jadwal}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{b.lokasi}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Official 1-Page A4 Authentic Bulog Printable Portal */}
      {searchResult && searchResult.tipe === 'undangan_bulog' && createPortal(
        <div id="surat-undangan-print-portal" className="hidden print:block font-sans text-black bg-white">
          <div className="border-2 border-dashed border-slate-700 p-6 sm:p-7 space-y-3.5 max-w-[700px] mx-auto text-black bg-white">
            <div className="border-b-2 border-slate-700 pb-2.5 text-center space-y-0.5">
              <div className="text-[13px] font-black tracking-widest uppercase leading-tight">
                UNDANGAN PENERIMA
              </div>
              <div className="text-[15px] font-black tracking-tight uppercase leading-tight">
                BANTUAN PANGAN BERAS PERIODE BULAN JULI SAMPAI SEPTEMBER 2026
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[12px] font-semibold text-black border-b border-slate-700 pb-2">
              <div className="space-y-0.5">
                <div className="flex"><span className="w-24 text-slate-700">Provinsi</span><span>: {searchResult.provinsi}</span></div>
                <div className="flex"><span className="w-24 text-slate-700">Kecamatan</span><span>: {searchResult.kecamatan}</span></div>
              </div>
              <div className="space-y-0.5">
                <div className="flex"><span className="w-28 text-slate-700">Kabupaten/Kota</span><span>: {searchResult.kabupaten}</span></div>
                <div className="flex"><span className="w-28 text-slate-700">Kelurahan/Desa</span><span>: {searchResult.desa}</span></div>
              </div>
            </div>

            <div className="text-right text-[12px] text-slate-800 font-medium">
              {searchResult.tanggalSurat}
            </div>

            <div className="grid grid-cols-2 gap-4 text-[12px] pt-0.5">
              <div className="space-y-1">
                <div className="flex"><span className="w-16 text-slate-700">Nomor</span><span className="font-mono font-bold">: {searchResult.nomorSurat}</span></div>
                <div className="flex"><span className="w-16 text-slate-700">Perihal</span><span className="font-bold uppercase">: {searchResult.perihal}</span></div>
              </div>
              <div className="space-y-0.5 text-left">
                <div className="text-slate-700">Kepada Yth :</div>
                <div className="text-[14px] font-black text-black uppercase tracking-wide">
                  {searchResult.nama}
                </div>
                <div className="font-mono text-slate-800 font-bold">
                  {searchResult.nikMasked}
                </div>
                <div className="font-bold text-slate-900">
                  {searchResult.alamat}
                </div>
              </div>
            </div>

            <div className="text-[12px] space-y-1 pt-1">
              <p className="font-medium text-black">
                Mengharapkan kehadiran Bapak/Ibu/Saudara besok pada :
              </p>
              <div className="pl-3 space-y-1 text-black font-medium">
                <div className="flex"><span className="w-28 text-slate-700 shrink-0">Hari/Tanggal</span><span className="font-bold">: {searchResult.hariTanggal}</span></div>
                <div className="flex"><span className="w-28 text-slate-700 shrink-0">Jam</span><span className="font-bold">: {searchResult.jam}</span></div>
                <div className="flex"><span className="w-28 text-slate-700 shrink-0">Tempat</span><span className="font-bold uppercase">: {searchResult.tempat}</span></div>
                <div className="flex items-start">
                  <span className="w-28 text-slate-700 shrink-0">Keperluan</span>
                  <span className="leading-snug">
                    : Mengambil Bantuan Pangan alokasi bulan Juli - September 2026 sejumlah <strong>{searchResult.alokasi}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] space-y-1 pt-1 text-black">
              <div className="font-bold">Persyaratan :</div>
              <ol className="list-decimal pl-4 space-y-0.5 leading-snug">
                {searchResult.persyaratan.map((syarat: string, sIdx: number) => (
                  <li key={sIdx}>{syarat}</li>
                ))}
              </ol>
            </div>

            <div className="text-[11px] text-slate-900 font-medium leading-relaxed pt-1">
              <p>{searchResult.catatanBatas}</p>
              <p className="mt-0.5">Demikian atas kehadirannya disampaikan terima kasih.</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-300">
              <div className="text-center">
                <div className="inline-block p-1 border border-slate-400 bg-white">
                  <img
                    src={`/api/public/surat/qr?data=${searchResult.barcode}`}
                    alt={`Barcode Bantuan ${searchResult.barcode}`}
                    className="w-24 h-24 object-contain mx-auto"
                    crossOrigin="anonymous"
                  />
                  <div className="text-[11px] font-mono font-bold text-black tracking-wider mt-1">
                    {searchResult.barcode}
                  </div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-[12px] font-medium text-black">
                  <div>Hormat Kami,</div>
                  <div className="font-bold">Perum BULOG</div>
                </div>
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    No. Urut
                  </div>
                  <div className="text-4xl font-black font-mono tracking-tight text-black">
                    {searchResult.noUrut}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
