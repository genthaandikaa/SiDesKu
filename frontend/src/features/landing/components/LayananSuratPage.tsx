import React, { useState, useEffect } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { useAuth } from '@/shared/context/AuthContext';
import { SuratRequest } from '@/shared/types';
import { QrVerificationModal } from '@/features/dashboard/components/QrVerificationModal';

interface SuratItem {
  id: number;
  kode: string;
  nama: string;
  kategori: string;
  waktu: string;
  biaya: string;
  syarat: string[];
  kegunaan: string;
}

interface LayananSuratPageProps {
  initialTab?: 'katalog' | 'lacak';
}

export const LayananSuratPage: React.FC<LayananSuratPageProps> = ({ initialTab = 'katalog' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Katalog States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
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

  const categories = [
    'Semua',
    'Kependudukan',
    'Bantuan & Sosial',
    'Usaha',
    'Kepolisian'
  ];

  const suratTypes: SuratItem[] = [
    {
      id: 1,
      kode: 'SKTM',
      nama: 'Surat Keterangan Tidak Mampu',
      kategori: 'Bantuan & Sosial',
      waktu: '15 Menit',
      biaya: 'Gratis',
      syarat: ['KTP Pemohon / Kartu Pelajar', 'Kartu Keluarga (KK)', 'Pernyataan Penghasilan'],
      kegunaan: 'Syarat beasiswa, KIP Kuliah, keringanan rumah sakit, atau bansos.'
    },
    {
      id: 2,
      kode: 'SKD',
      nama: 'Surat Keterangan Domisili',
      kategori: 'Kependudukan',
      waktu: '10 Menit',
      biaya: 'Gratis',
      syarat: ['KTP Pemohon', 'Kartu Keluarga (KK)'],
      kegunaan: 'Pembukaan rekening bank, perizinan, dan syarat lamaran kerja.'
    },
    {
      id: 3,
      kode: 'SKU',
      nama: 'Surat Keterangan Usaha',
      kategori: 'Usaha',
      waktu: '15 Menit',
      biaya: 'Gratis',
      syarat: ['KTP Pelaku Usaha', 'Kartu Keluarga (KK)', 'Foto Tempat / Produk Usaha'],
      kegunaan: 'Pengajuan pinjaman modal KUR Bank dan pengurusan NIB OSS UMKM.'
    },
    {
      id: 4,
      kode: 'SKCK',
      nama: 'Surat Pengantar SKCK',
      kategori: 'Kepolisian',
      waktu: '10 Menit',
      biaya: 'Gratis',
      syarat: ['KTP Pemohon', 'Kartu Keluarga (KK)', 'Pas Foto 4x6 Background Merah'],
      kegunaan: 'Pengantar permohonan SKCK di Polsek/Polres untuk melamar pekerjaan.'
    },
    {
      id: 5,
      kode: 'SKL',
      nama: 'Surat Keterangan Kelahiran',
      kategori: 'Kependudukan',
      waktu: '15 Menit',
      biaya: 'Gratis',
      syarat: ['Surat Kelahiran RS/Bidan', 'KTP Orang Tua', 'Buku Nikah', 'Kartu Keluarga'],
      kegunaan: 'Penerbitan akta kelahiran bayi dan penambahan nama di Kartu Keluarga.'
    },
    {
      id: 6,
      kode: 'SKM',
      nama: 'Surat Keterangan Kematian',
      kategori: 'Kependudukan',
      waktu: 'Prioritas',
      biaya: 'Gratis',
      syarat: ['KTP & KK Almarhum', 'KTP Pelapor/Ahli Waris', 'Surat Kematian RS/Dokter'],
      kegunaan: 'Penerbitan akta kematian, klaim asuransi/BPJS, dan pembaruan data KK.'
    },
    {
      id: 7,
      kode: 'SKBM',
      nama: 'Surat Keterangan Belum Menikah',
      kategori: 'Kependudukan',
      waktu: '10 Menit',
      biaya: 'Gratis',
      syarat: ['KTP Pemohon', 'Kartu Keluarga (KK)', 'Pernyataan Belum Menikah'],
      kegunaan: 'Pendaftaran pernikahan di KUA, seleksi kedinasan, atau beasiswa.'
    },
    {
      id: 8,
      kode: 'SKP',
      nama: 'Surat Pengantar Pindah Domisili',
      kategori: 'Kependudukan',
      waktu: '20 Menit',
      biaya: 'Gratis',
      syarat: ['KTP dan KK Asli', 'Alamat Tujuan Pindah Lengkap'],
      kegunaan: 'Penerbitan surat pindah (SKPWNI) di Dispendukcapil menuju kota lain.'
    }
  ];

  const filteredSuratTypes = suratTypes.filter((s) => {
    const matchCategory = selectedCategory === 'Semua' || s.kategori.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        s.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.kegunaan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans text-slate-800">
      
      {/* Clean Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Layanan Persuratan
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Pilih jenis surat yang Anda perlukan atau pantau status berkas yang telah diajukan.
        </p>

        {/* Minimal Segmented Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 mt-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('katalog');
              setSearchParams({});
            }}
            className={`py-2 px-5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'katalog'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Daftar Surat</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('lacak');
              setSearchParams({ tab: 'lacak' });
            }}
            className={`py-2 px-5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'lacak'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Lacak Status</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: DAFTAR SURAT (KATALOG)
          ========================================================================= */}
      {activeTab === 'katalog' && (
        <div className="space-y-6">
          {/* Controls: Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama surat atau kegunaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9.5 pr-8 py-2 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clean Letter Cards Grid */}
          {filteredSuratTypes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuratTypes.map((s) => (
                <div 
                  key={s.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {s.kode}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {s.kategori}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {s.nama}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {s.kegunaan}
                    </p>

                    <div className="pt-1 text-[11px] text-slate-500 leading-normal">
                      <span className="font-semibold text-slate-700">Syarat: </span>
                      <span>{s.syarat.join(' • ')}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {s.waktu}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">{s.biaya}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedSurat(s)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Ajukan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-800">Surat tidak ditemukan</p>
              <p className="text-xs text-slate-400">Tidak ada hasil yang sesuai dengan kata kunci "{searchQuery}".</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Reset pencarian
              </button>
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
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <form onSubmit={(e) => { e.preventDefault(); executeSearchTracking(trackingKeyword); }} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Masukkan nomor resi (contoh: REQ-20260818-001)"
                  value={trackingKeyword}
                  onChange={(e) => setTrackingKeyword(e.target.value)}
                  className="w-full pl-9.5 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-800"
                />
              </div>
              <button
                type="submit"
                disabled={isSearchingTracking}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
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
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-center gap-2">
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
                  <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-900">{item.nomor_resi}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyResi(item.nomor_resi)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Salin Nomor Resi"
                          >
                            {copiedResi === item.nomor_resi ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          {item.surat_type?.nama_surat}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Pemohon: <span className="font-semibold text-slate-700">{item.warga_profile?.nama_lengkap}</span>
                        </p>
                      </div>

                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    {/* Timeline logs */}
                    {item.trackings && item.trackings.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Riwayat Pemrosesan
                        </div>
                        <div className="space-y-1.5">
                          {item.trackings.map((t, idx) => (
                            <div key={t.id || idx} className="flex items-start gap-2.5 text-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-slate-700">
                                  <span className="font-semibold">{t.status_stage} • {t.status_action}</span>
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
                          className="px-4 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
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
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/60 font-sans animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedSurat(null);
          }}
        >
          <div 
            className="relative bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start pb-2 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {selectedSurat.kode}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                  {selectedSurat.nama}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSurat(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700">Kegunaan:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{selectedSurat.kegunaan}</p>
              </div>

              <div>
                <span className="font-semibold text-slate-700">Berkas yang Perlu Disiapkan:</span>
                <ul className="mt-1.5 space-y-1">
                  {selectedSurat.syarat.map((syarat, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span>{syarat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500">
                <span>Estimasi: <strong>{selectedSurat.waktu}</strong></span>
                <span>•</span>
                <span>Biaya: <strong className="text-emerald-600">{selectedSurat.biaya}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedSurat(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedSurat(null);
                  handleStartAjukan();
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <span>{user ? 'Lanjut Pengajuan' : 'Masuk Akun & Ajukan'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
