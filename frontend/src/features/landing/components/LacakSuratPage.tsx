import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  Printer, 
  QrCode, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { SuratRequest } from '@/shared/types';
import { QrVerificationModal } from '@/features/dashboard/components/QrVerificationModal';

export const LacakSuratPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [trackingResults, setTrackingResults] = useState<SuratRequest[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [expandedTrackings, setExpandedTrackings] = useState<Record<number, boolean>>({});
  const [copiedResi, setCopiedResi] = useState<string | null>(null);
  const [qrVerifyHash, setQrVerifyHash] = useState<string | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  useEffect(() => {
    const initKeyword = searchParams.get('keyword');
    const initHash = searchParams.get('hash');

    if (initKeyword) {
      setKeyword(initKeyword);
      executeSearch(initKeyword);
    }

    if (initHash) {
      setQrVerifyHash(initHash);
      setIsVerifyModalOpen(true);
    }
  }, [searchParams]);

  const executeSearch = async (kw: string) => {
    if (!kw.trim()) {
      setSearchError('Silakan masukkan nomor resi atau NIK pemohon.');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setHasSearched(true);

    try {
      const res = await api.get(`/public/surat/track?keyword=${encodeURIComponent(kw.trim())}`);
      if (res.data.success && res.data.data.length > 0) {
        setTrackingResults(res.data.data);
        // Expand first result by default
        setExpandedTrackings({ [res.data.data[0].id]: true });
      } else {
        setTrackingResults([]);
        setSearchError('Nomor resi atau NIK tidak ditemukan dalam arsip pengajuan surat.');
      }
    } catch {
      setSearchError('Gagal memuat status surat. Pastikan format nomor resi atau NIK benar.');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleTracking = (id: number) => {
    setExpandedTrackings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResi(text);
    setTimeout(() => setCopiedResi(null), 2000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(keyword);
  };

  return (
    <div className="space-y-12 py-8 page-enter">
      {/* Clean Ambient Hero Section with SVG Vectors (Seamless) */}
      <section className="relative pt-4 sm:pt-6 pb-16 sm:pb-20 overflow-hidden">
        
        {/* SVG Ambient Concentric Watermark Vectors */}
        <svg className="absolute -right-20 -top-20 w-[500px] h-[500px] text-emerald-200/35 pointer-events-none -z-10" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="90" stroke="currentColor" strokeWidth="1" />
          <circle cx="200" cy="200" r="40" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg className="absolute -left-20 top-1/4 w-[420px] h-[420px] text-teal-200/25 pointer-events-none -z-10" viewBox="0 0 400 400" fill="none">
          <path d="M 0,200 Q 100,70 200,200 T 400,200" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 0,230 Q 100,100 200,230 T 400,230" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column (60% Fibonacci): Title, Eyebrow, and Description */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-black border border-emerald-200 shadow-2xs">
                <Search className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pelacak Berkas Publik & QR Realtime</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
                Lacak Status Surat &{' '}
                <span className="relative whitespace-nowrap text-emerald-700 inline-block">
                  Validasi QR
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-400" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 15 Q 50 0, 100 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium max-w-xl">
                Pantau tahapan verifikasi pengajuan surat Anda secara realtime atau lakukan uji keaslian tanda tangan elektronik dan stempel QR resmi dokumen di Kabupaten Kediri.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <strong className="text-slate-800">Tracking Otomatis</strong> per tahap
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <strong className="text-slate-800">Validasi Sertifikat QR</strong> sah
                </span>
              </div>
            </div>

            {/* Right Column (40% Fibonacci): QR Validation Card Preview */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="w-full max-w-md animate-float-gentle">
                <div className="card-elevated-mockup p-6 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-900/5 space-y-4">
                  
                  {/* Top Bar with QR Scanner Badge */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-black text-xs text-slate-900 leading-tight">
                          Scanner Keabsahan QR
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold">
                          Integritas Dokumen Terjamin
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-200">
                      Live Verify
                    </span>
                  </div>

                  {/* Flow Stages Indicator */}
                  <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 space-y-2 text-xs">
                    <div className="font-black text-slate-900 text-xs flex items-center justify-between">
                      <span>Proses Disposisi Berjenjang</span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">4 Tahap</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold pt-1">
                      <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg border border-emerald-200">1. Warga</div>
                      <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg border border-emerald-200">2. RT</div>
                      <div className="bg-emerald-100 text-emerald-800 p-1.5 rounded-lg border border-emerald-200">3. RW</div>
                      <div className="bg-emerald-600 text-white p-1.5 rounded-lg shadow-xs">4. Sah QR</div>
                    </div>
                  </div>

                  {/* Instant Lookup Hint */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Masukkan No. Resi atau NIK</span>
                    </span>
                    <span className="font-bold text-slate-700">Akurat 100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Search Bar: Floating Bridge Card (Golden Ratio Anchor) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 -mt-10 sm:-mt-12 relative z-20">
        <div className="bg-white rounded-[2rem] border border-slate-200/80 p-6 sm:p-8 space-y-5 shadow-xl shadow-slate-900/5">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-gray-900">
              Cek Posisi Dokumen Anda
            </h2>
            <p className="text-xs text-gray-500">
              Ketikkan Nomor Resi Surat atau 16 Digit NIK Pemohon
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Contoh: REQ-20260818-001 atau 35060415..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-24 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs transition-all font-mono"
              />
              <button
                type="button"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                      setKeyword(text.trim());
                      executeSearch(text.trim());
                    }
                  } catch {
                    // Fallback
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-[10px] transition-all cursor-pointer"
              >
                Paste / Tempel
              </button>
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all press-down disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSearching ? 'Mencari...' : 'Lacak Status'}
            </button>
          </form>

          {/* Quick Resi Helper Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span className="font-semibold text-slate-400">Contoh Resi Uji Coba:</span>
            {['REQ-20260818-001', 'REQ-20260818-002', '3506041205900001'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setKeyword(sample);
                  executeSearch(sample);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono font-bold text-[11px] border border-emerald-200/80 transition-all cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>

          {searchError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center max-w-xl mx-auto flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </div>

        {/* Tracking Results */}
        {hasSearched && trackingResults && trackingResults.length > 0 && (
          <div className="space-y-6 mt-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Hasil Pelacakan Berkas ({trackingResults.length})</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Klik verifikasi untuk cek sertifikat sah</span>
            </div>

            {trackingResults.map((item) => {
              const isExpanded = expandedTrackings[item.id] ?? true;
              
              // Calculate current active step index (1 to 5)
              let currentStep = 1;
              if (item.status === 'completed') currentStep = 5;
              else if (item.status === 'processed_sekdes') currentStep = 4;
              else if (item.status === 'pending_rw') currentStep = 3;
              else if (item.status === 'pending_rt') currentStep = 2;

              return (
                <div key={item.id} className="bg-white rounded-3xl p-6 sm:p-7 space-y-6 border border-slate-200/80 hover:border-emerald-300 shadow-xl shadow-emerald-950/5 transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 bg-slate-100/90 px-3 py-1 rounded-xl border border-slate-200/80 shadow-2xs">
                          <span className="text-[11px] font-mono text-slate-800 font-black">{item.nomor_resi}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.nomor_resi)}
                            className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer pl-1.5 border-l border-slate-200"
                            title="Salin Nomor Resi"
                          >
                            {copiedResi === item.nomor_resi ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[10px] text-emerald-700 font-extrabold">Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span className="text-[10px] text-slate-600">Salin</span>
                              </>
                            )}
                          </button>
                        </div>

                        {item.nomor_surat_resmi && (
                          <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                            No: {item.nomor_surat_resmi}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-slate-900 leading-snug">{item.surat_type?.nama_surat}</h3>
                      <div className="text-xs text-slate-600">
                        Pemohon: <strong className="text-slate-900 font-extrabold">{item.warga_profile?.nama_lengkap}</strong> (NIK: <span className="font-mono">{item.warga_profile?.nik}</span>)
                      </div>
                      <div className="text-xs text-slate-500">Keperluan: <span className="text-slate-800 font-medium">{item.keperluan}</span></div>
                    </div>

                    <div className="text-right space-y-1.5">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black shadow-xs ${
                        item.status === 'completed' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                        item.status === 'rejected' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                        'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {item.status === 'completed' ? '✓ Surat Selesai & Sah' :
                         item.status === 'rejected' ? '✕ Ditolak' :
                         item.status === 'processed_sekdes' ? '⏳ Antrean Sekdes' :
                         item.status === 'pending_rw' ? '⏳ Menunggu RW' : '⏳ Menunggu RT'}
                      </span>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* 5-Step Visual Stepper Bar */}
                  <div className="py-2">
                    <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs">
                      {[
                        { label: 'Pengajuan', num: 1 },
                        { label: 'Ketua RT', num: 2 },
                        { label: 'Ketua RW', num: 3 },
                        { label: 'TTD Sekdes', num: 4 },
                        { label: 'Selesai', num: 5 },
                      ].map((st) => {
                        const isDone = currentStep >= st.num;
                        const isCurrent = currentStep === st.num;
                        return (
                          <div key={st.num} className="space-y-1.5">
                            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-black transition-all ${
                              isDone
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-200'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}>
                              {isDone && currentStep > st.num ? '✓' : st.num}
                            </div>
                            <div className={`font-bold truncate ${isCurrent ? 'text-emerald-700 font-black' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                              {st.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Collapsible Timeline Header Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleTracking(item.id)}
                    className="w-full py-2.5 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 flex items-center justify-between text-xs font-black text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Tahapan Riwayat Persetujuan Berjenjang ({item.trackings?.length || 0})</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1">
                      {isExpanded ? 'Sembunyikan ▲' : 'Buka Detail ▼'}
                    </span>
                  </button>

                  {/* Collapsible Progress Steps Timeline */}
                  {isExpanded && (
                    <div className="space-y-2 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 animate-fade-in">
                      {item.trackings && item.trackings.length > 0 ? (
                        item.trackings.map((t, idx) => (
                          <div key={t.id || idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="flex-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold text-slate-900">{t.status_stage} — <span className="text-emerald-700">{t.status_action}</span></span>
                                <span className="text-[11px] text-slate-400 font-medium font-mono">{new Date(t.created_at).toLocaleString('id-ID')}</span>
                              </div>
                              {t.catatan && <p className="text-slate-600 mt-1 italic">{t.catatan}</p>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-slate-400 italic p-2">Riwayat tahapan sedang diproses oleh petugas RT setempat.</div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-1 flex flex-wrap gap-2.5 justify-end">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.qr_verification_hash || item.nomor_resi)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shadow-2xs press-down cursor-pointer"
                    >
                      {copiedResi === (item.qr_verification_hash || item.nomor_resi) ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Kode Berhasil Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-slate-600" />
                          <span>Salin Kode Validasi</span>
                        </>
                      )}
                    </button>

                    {item.status === 'completed' && (
                      <button
                        onClick={() => {
                          setQrVerifyHash(item.qr_verification_hash || item.nomor_resi);
                          setIsVerifyModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-extrabold hover:bg-emerald-800 transition-all shadow-sm press-down cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Uji Sertifikat Validasi QR
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section Verifikasi QR Mandiri */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="card-surface p-8 bg-emerald-50/50 border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
              <QrCode className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-900">Punya Dokumen Bertanda Tangan QR?</h3>
              <p className="text-xs text-gray-600 mt-0.5">
                Periksa keaslian surat yang Anda terima dari Desa Doko dengan memindai kode QR atau memasukkan kode verifikasi.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setQrVerifyHash(null);
              setIsVerifyModalOpen(true);
            }}
            className="px-5 py-3 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shrink-0 shadow-sm press-down cursor-pointer"
          >
            Buka Verifikator QR
          </button>
        </div>
      </section>

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
