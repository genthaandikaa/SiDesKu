import React, { useState, useEffect } from 'react';
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
  Filter,
  Search,
  HeartHandshake,
  QrCode,
  BellRing,
  AlertCircle,
  MapPin,
  Printer,
  Smartphone,
  Clock,
  Check
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { ApbdesRecord } from '@/shared/types';
import { Pagination } from '@/shared/components/Pagination';

interface TransparansiApbdesPageProps {
  initialTab?: 'apbdes' | 'bansos';
}

export const TransparansiApbdesPage: React.FC<TransparansiApbdesPageProps> = ({ initialTab = 'apbdes' }) => {
  const [activeTab, setActiveTab] = useState<'apbdes' | 'bansos'>(initialTab);

  // APBDes States
  const [apbdesData, setApbdesData] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<'Semua' | 'Pendapatan' | 'Belanja' | 'Pembiayaan'>('Semua');
  const [currentPage, setCurrentPage] = useState(1);

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
    const fetchApbdes = async () => {
      try {
        const res = await api.get('/public/apbdes/summary');
        if (res.data.success) {
          setApbdesData(res.data);
        }
      } catch {
        // Fallback
      }
    };
    fetchApbdes();
  }, []);

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

  const s = apbdesData?.summary;
  const records: ApbdesRecord[] = apbdesData?.records || [];

  const filteredRecords = records.filter((r) => {
    if (selectedFilter === 'Semua') return true;
    return r.category?.jenis?.toLowerCase() === selectedFilter.toLowerCase();
  });

  const pageSize = 10;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const surplus = (s?.pendapatan?.realisasi || 675000000) - (s?.belanja?.realisasi || 217500000);

  const bansosPrograms = [
    {
      nama: 'Bantuan Pangan Beras (CBP)',
      sumber: 'Bapanas & Bulog',
      nominal: '30 (Tiga Puluh) Kg Beras',
      tahap: 'Juli–September 2026',
      kriteria: 'Keluarga terdaftar di data PBP Bapanas pusat.',
      jadwal: 'Selasa, 18 Agustus 2026 (08.30 - Selesai)',
      lokasi: 'Kantor Kelurahan / Balai Pelayanan',
      noSurat: 'UND/18/08/26/115001',
    },
    {
      nama: 'Program Keluarga Harapan (PKH)',
      sumber: 'Kemensos RI',
      nominal: 'Rp 600.000 - Rp 750.000 / Tahap',
      tahap: 'Tahap III Tahun 2026',
      kriteria: 'Keluarga DTKS dengan anak sekolah, balita, atau lansia.',
      jadwal: '25 Agustus 2026 (08.30 - 14.00 WIB)',
      lokasi: 'Pendopo Kecamatan / Balai Kelurahan',
      noSurat: 'PKH/2026/A-014/KEDIRI',
    },
    {
      nama: 'Bantuan Langsung Tunai (BLT-DD)',
      sumber: 'Dana Desa APBDes',
      nominal: 'Rp 300.000 / Bulan',
      tahap: 'Bulan Juli - Agustus 2026',
      kriteria: 'Keluarga desil 1 yang tidak menerima PKH maupun BPNT.',
      jadwal: '28 Agustus 2026 (09.00 - 12.00 WIB)',
      lokasi: 'Ruang Pelayanan Balai Desa',
      noSurat: 'BLT-DD/2026/08/DOKO',
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
          kabupaten: 'KAB. KEDIRI',
          kecamatan: 'Wates / Ngasem',
          desa: 'Kelurahan Setempat',
          tanggalSurat: 'Kab. Kediri, Kamis, 13 Agustus 2026',
          nomorSurat: 'UND/18/08/26/115001',
          perihal: 'UNDANGAN',
          nama: 'Supriyadi',
          nik: '3506064303760001',
          nikMasked: '******4303760001',
          alamat: 'RT 38 / RW 6',
          hariTanggal: 'Selasa, 18 Agustus 2026',
          jam: '08:30 WIB s.d Selesai',
          tempat: 'KANTOR DESA DOKO',
          keperluan: 'Mengambil Bantuan Pangan alokasi bulan Juli - September 2026 sejumlah 30 (tiga puluh) Kg Beras',
          alokasi: '30 (tiga puluh) Kg Beras',
          noUrut: '1340',
          barcode: '350606200801340',
          status: 'Undangan Resmi Terbit • Siap Diambil',
          persyaratan: [
            'Membawa bukti undangan ini (di HP atau Cetak)',
            'Jika diambil sendiri: Membawa KTP asli / IKD',
            'Jika diwakilkan dalam 1 KK: KTP asli pengambil & KK',
            'Jika diwakilkan luar KK: membawa surat kuasa resmi & fotocopy KTP'
          ],
          catatanBatas: 'Harap hadir tepat jadwal. Jika 5 hari kerja tidak diambil tanpa konfirmasi, hak bantuan dialihkan sesuai regulasi Bapanas.'
        });
      } else if (q.includes('35060415') || q.includes('bambang') || q === '3506041505840001') {
        setSearchResult({
          tipe: 'reguler',
          nik: '3506041505840001',
          nama: 'Bambang Utomo',
          rt: '01 / RW 01',
          dusun: 'Dusun Krajan',
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
    }, 450);
  };

  return (
    <div className="page-enter relative w-full overflow-hidden flex flex-col font-sans text-slate-800">
      
      {/* Top Header & Segmented Mode Switcher */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 text-center">

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.16] max-w-3xl mx-auto mb-3">
          Transparansi Anggaran &{' '}
          <span className="text-blue-600">
            Bantuan Sosial.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto mb-6">
          Keterbukaan informasi realisasi anggaran pendapatan & belanja publik serta pengecekan mandiri kepesertaan DTKS bansos beras, PKH, BPNT, dan BLT se-Kota Kediri.
        </p>

        {/* Segmented Mode Switcher: APBDes vs Bansos */}
        <div className="inline-flex p-1.5 rounded-full bg-slate-100/90 border border-sky-200/70 shadow-xs max-w-md w-full justify-center">
          <button
            type="button"
            onClick={() => setActiveTab('apbdes')}
            className={`flex-1 py-2.5 px-4 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'apbdes'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Realisasi Anggaran Publik</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bansos')}
            className={`flex-1 py-2.5 px-4 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'bansos'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Bantuan Sosial (Bansos)</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          TAB 1: REALISASI APBDES KEUANGAN
          ========================================================================= */}
      {activeTab === 'apbdes' && (
        <div className="animate-fade-in space-y-8 pb-14">
          
          {/* 3 Core Financial KPI Cards */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              
              {/* Card 1: Pendapatan */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-md shadow-sky-500/5 space-y-3 hover:border-sky-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                    <TrendingUp className="w-4 h-4 text-sky-600" />
                    Pendapatan Desa
                  </span>
                  <span className="text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-sky-200">
                    {s?.pendapatan?.persen || 60.8}% Terealisasi
                  </span>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                    Rp {Number(s?.pendapatan?.realisasi || 675000000).toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Pagu: Rp {Number(s?.pendapatan?.anggaran || 1110000000).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-sky-400 to-blue-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${s?.pendapatan?.persen || 60.8}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-snug">
                  Sumber: PADes, Dana Desa (DD), ADD, dan Bagi Hasil Pajak.
                </p>
              </div>

              {/* Card 2: Belanja */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-md shadow-sky-500/5 space-y-3 hover:border-sky-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                    <TrendingDown className="w-4 h-4 text-blue-600" />
                    Belanja Pembangunan
                  </span>
                  <span className="text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-blue-200">
                    {s?.belanja?.persen || 92.5}% Terserap
                  </span>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-sky-600 tracking-tight leading-none">
                    Rp {Number(s?.belanja?.realisasi || 217500000).toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Pagu: Rp {Number(s?.belanja?.anggaran || 235000000).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-sky-500 to-blue-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${s?.belanja?.persen || 92.5}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-snug">
                  Alokasi: Irigasi sawah, paving jalan RT, Posyandu, dan BUMDes.
                </p>
              </div>

              {/* Card 3: Surplus & Kas */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-md shadow-sky-500/5 space-y-3 hover:border-sky-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-700">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    Saldo Kas Desa (RKD)
                  </span>
                  <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px] border border-emerald-200">
                    Surplus Kas
                  </span>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                    Rp {surplus.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Rekening Kas Desa Bank Jatim Cabang Kediri
                  </div>
                </div>

                <div className="w-full bg-emerald-100/70 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full w-full" />
                </div>

                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Status Audit: Opini Wajar Tanpa Pengecualian</span>
                </p>
              </div>

            </div>
          </div>

          {/* Buku Kas Table with Category Pills */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Buku Kas Rincian Pos Anggaran ({filteredRecords.length})
              </span>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {(['Semua', 'Pendapatan', 'Belanja', 'Pembiayaan'] as const).map((filter) => {
                  const isSelected = selectedFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setSelectedFilter(filter);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-sky-50 text-slate-600 border border-slate-200/90'
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto border border-sky-100 rounded-3xl shadow-xs bg-white">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead className="bg-slate-50/80 text-slate-700 font-black border-b border-sky-100">
                  <tr>
                    <th className="p-3.5 pl-5">Kode</th>
                    <th className="p-3.5">Kategori & Uraian</th>
                    <th className="p-3.5 text-right">Pagu (Rp)</th>
                    <th className="p-3.5 text-right">Realisasi (Rp)</th>
                    <th className="p-3.5 pr-5 text-center">Persen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length > 0 ? (
                    paginatedRecords.map((r) => {
                      const persen = r.anggaran > 0 ? Math.round((r.realisasi / r.anggaran) * 100) : 0;
                      return (
                        <tr key={r.id} className="hover:bg-sky-50/30 transition-colors">
                          <td className="p-3.5 pl-5 font-mono font-bold text-slate-500 text-[11px]">
                            {r.category?.kode_rekening}
                          </td>
                          <td className="p-3.5">
                            <div className="font-extrabold text-slate-900 leading-tight">{r.uraian}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                                r.category?.jenis === 'Pendapatan' ? 'bg-sky-100 text-sky-800' :
                                r.category?.jenis === 'Belanja' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                              }`}>
                                {r.category?.nama_kategori}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-slate-700">
                            {Number(r.anggaran).toLocaleString('id-ID')}
                          </td>
                          <td className="p-3.5 text-right font-mono font-bold text-sky-700">
                            {Number(r.realisasi).toLocaleString('id-ID')}
                          </td>
                          <td className="p-3.5 pr-5 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 text-[10px] font-black border border-sky-200">
                              {persen}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        Tidak ada rincian pos anggaran untuk kategori ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredRecords.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              itemLabel="pos anggaran"
              className="pt-2"
            />
          </div>

          {/* 5 Focus Pillars Bento Grid */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-extrabold tracking-wider text-sky-600 uppercase">
                ALOKASI DANA DESA
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                5 Pilar Fokus Pembangunan Tahun {apbdesData?.tahun || 2026}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { num: '1', title: 'Infrastruktur Pertanian', desc: 'Normalisasi irigasi tersier 850 m di Dusun Krajan & Doko Timur untuk 140 Ha sawah.' },
                { num: '2', title: 'Pavingisasi Jalan Lingkungan', desc: 'Paving jalan gang di 6 titik RT serta perbaikan drainase cegah genangan air.' },
                { num: '3', title: 'Zero Stunting & Posyandu', desc: 'Pemberian makanan tambahan (PMT) bergizi balita & cek kesehatan gratis 8 Posyandu.' },
                { num: '4', title: 'Pemberdayaan BUMDes & UMKM', desc: 'Penguatan modal simpan pinjam desa dan fasilitasi etalase barcode QRIS UMKM.' },
                { num: '5', title: 'Transformasi SiDesKu Digital', desc: 'Server mandiri desa, Wi-Fi gratis balai desa, dan bimtek literasi digital RT/RW.' },
              ].map((p, idx) => (
                <div 
                  key={p.num} 
                  className={`p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2 ${
                    idx === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {p.num}
                    </div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">{p.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed pl-9">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 2: BANTUAN SOSIAL (BANSOS)
          ========================================================================= */}
      {activeTab === 'bansos' && (
        <div className="animate-fade-in max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-14">
          
          {/* NIK Checker Console */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-sky-200/80 p-5 sm:p-6 shadow-xl shadow-sky-500/10 space-y-3.5">
            <div className="text-center space-y-1 mb-2">
              <h3 className="font-black text-base sm:text-lg text-slate-900">Cek Status Kepesertaan Bansos Anda</h3>
              <p className="text-xs text-slate-500">Masukkan 16 digit NIK untuk melihat jadwal dan nomor antrean bantuan.</p>
            </div>

            <form onSubmit={handleCekNik} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-4.5 top-1/2 -translate-y-1/2 text-sky-500" />
                <input
                  type="text"
                  placeholder="Masukkan 16 digit NIK KTP..."
                  value={nikSearch}
                  onChange={(e) => setNikSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50/80 rounded-full border border-sky-200/80 text-xs sm:text-sm font-mono font-medium focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 shadow-2xs transition-all text-slate-800"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingBansos}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-500/20 transition-all press-down disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {isSearchingBansos ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Memeriksa...</span>
                  </>
                ) : (
                  <>
                    <span>Cek Status NIK</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick NIK helper chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span className="text-slate-400 font-medium text-[11px]">Uji Coba Cepat:</span>
              <button
                type="button"
                onClick={() => setNikSearch('3506064303760001')}
                className="px-2.5 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 font-mono font-bold text-[10px] border border-sky-200 transition-all cursor-pointer"
              >
                3506064303760001 (Bulog 30 Kg)
              </button>
              <button
                type="button"
                onClick={() => setNikSearch('3506041505840001')}
                className="px-2.5 py-0.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono font-bold text-[10px] border border-slate-200 transition-all cursor-pointer"
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
                  <div className="bg-white rounded-3xl border border-sky-200 p-5 sm:p-7 shadow-xl space-y-4 print:hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-dashed border-sky-200">
                      <div>
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {searchResult.status}
                        </span>
                        <h3 className="font-black text-lg text-slate-900 mt-1">Undangan Bantuan Pangan Beras 30 Kg</h3>
                        <div className="text-xs text-slate-500 font-mono">No. Surat: {searchResult.nomorSurat}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">No. Antrean</div>
                        <div className="text-3xl font-black font-mono text-slate-900">{searchResult.noUrut}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100">
                        <div className="text-[10px] text-slate-400 font-bold">Penerima Manfaat</div>
                        <div className="font-extrabold text-slate-900 mt-0.5">{searchResult.nama}</div>
                        <div className="text-[11px] font-mono text-slate-500">{searchResult.nikMasked}</div>
                      </div>
                      <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100">
                        <div className="text-[10px] text-slate-400 font-bold">Jadwal Pengambilan</div>
                        <div className="font-extrabold text-slate-900 mt-0.5">{searchResult.hariTanggal}</div>
                        <div className="text-[11px] text-slate-500">{searchResult.jam} di Balai Desa</div>
                      </div>
                      <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
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
                          className="w-14 h-14 rounded-xl border border-sky-200 p-1 bg-white"
                        />
                        <div>
                          <div className="text-[10px] text-slate-400 font-mono">Kode Barcode Bulog</div>
                          <div className="font-mono font-black text-xs text-slate-900">{searchResult.barcode}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePrintBulog}
                        className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer press-down"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Surat Undangan</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 sm:p-6 bg-white rounded-3xl border border-sky-200 shadow-xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                          {searchResult.status}
                        </span>
                        <h3 className="font-black text-lg text-slate-900 mt-1">{searchResult.nama}</h3>
                        <div className="text-xs text-slate-500 font-mono">NIK: {searchResult.nik} • {searchResult.dusun} (RT {searchResult.rt})</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Antrean</div>
                        <div className="text-3xl font-black text-sky-600 font-mono">{searchResult.antrean}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100">
                        <div className="text-slate-400 text-[10px] font-bold">Program Bantuan</div>
                        <div className="font-black text-slate-900 mt-0.5">{searchResult.program}</div>
                      </div>
                      <div className="bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100">
                        <div className="text-slate-400 text-[10px] font-bold">Nominal Penyaluran</div>
                        <div className="font-black text-sky-600 mt-0.5 text-sm">{searchResult.nominal}</div>
                      </div>
                      <div className="bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100">
                        <div className="text-slate-400 text-[10px] font-bold">Jadwal & Lokasi</div>
                        <div className="font-black text-slate-900 mt-0.5">{searchResult.jadwal}</div>
                        <div className="text-[11px] text-slate-500">{searchResult.lokasi}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Silakan bawa KTP asli dan KK ke Kantor Kelurahan / Titik Lokasi pada jadwal yang ditentukan.</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200 text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                  <div className="font-black text-sm text-slate-900">NIK Tidak Terdaftar Sebagai Penerima Bansos Aktif</div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    NIK tidak tercatat pada daftar penerima bantuan tahap berjalan. Hubungi Ketua RT setempat apabila Anda memenuhi syarat untuk diusulkan ke DTKS.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3 Active Bansos Programs */}
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-xs font-extrabold tracking-wider text-sky-600 uppercase">
                PROGRAM BERJALAN
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Program Bansos Berjalan di Wilayah Kota Kediri
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bansosPrograms.map((b) => (
                <div 
                  key={b.nama} 
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-lg transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                        {b.tahap}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">{b.sumber}</span>
                    </div>

                    <div>
                      <h4 className="font-black text-sm sm:text-base text-slate-900 leading-snug">{b.nama}</h4>
                      <div className="mt-2 p-2.5 bg-sky-50/60 rounded-2xl border border-sky-100">
                        <div className="text-[10px] text-slate-400 font-bold">Nominal / Alokasi</div>
                        <div className="font-black text-sm text-sky-700">{b.nominal}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      <strong>Syarat:</strong> {b.kriteria}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span className="truncate">{b.jadwal}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                      <span>{b.lokasi}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Dual-Mode Accessibility Showcase */}
          <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-blue-700 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
              <div className="md:col-span-7 space-y-3">
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  Notifikasi Undangan Bansos via WhatsApp
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-1">
                    <div className="font-extrabold text-white flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-sky-300" />
                      <span>Jalur QR Cepat</span>
                    </div>
                    <p className="text-sky-100 text-[11px] leading-snug">
                      Tunjukkan barcode di WA untuk langsung scan antrean di balai desa.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-1">
                    <div className="font-extrabold text-white flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-sky-300" />
                      <span>Ramah Lansia</span>
                    </div>
                    <p className="text-sky-100 text-[11px] leading-snug">
                      Cukup sebutkan nomor urut dan tunjukkan KTP asli ke petugas loket.
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5">
                <div className="bg-white rounded-2xl p-4 text-slate-800 shadow-xl space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                        WA
                      </div>
                      <div>
                        <div className="font-black text-xs text-slate-900">Pemerintah Kota Kediri</div>
                        <div className="text-[10px] text-sky-600 font-semibold">Broadcast Resmi Bansos</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">08:00</span>
                  </div>

                  <div className="bg-sky-50/70 p-2.5 rounded-xl border border-sky-100 text-xs space-y-1">
                    <div className="font-bold text-sky-900">Undangan Bantuan Pangan Beras</div>
                    <div className="text-slate-600 text-[11px]">Nama: <strong>Supriyadi</strong> (No: <strong>1340</strong>)</div>
                    <div className="text-slate-600 text-[11px]">Jadwal: <strong>Selasa, 18 Agustus 2026</strong></div>
                    <div className="text-[10px] font-mono font-bold text-sky-800 bg-white p-1 rounded border border-sky-200 text-center mt-1">
                      Barcode: 350606200801340
                    </div>
                  </div>
                </div>
              </div>
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
