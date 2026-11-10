import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Copy,
  Check,
  QrCode,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  UserCheck,
  Send,
  Building2
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
      setSearchError('Silakan masukkan nomor resi surat pengajuan.');
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
        setSearchError('Nomor resi tidak ditemukan dalam arsip pengajuan surat.');
      }
    } catch {
      setSearchError('Gagal memuat status surat. Pastikan format nomor resi benar.');
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
    <div className="page-enter relative w-full overflow-hidden flex flex-col font-sans text-slate-800">
      
      {/* Hero Section: Compact & Impactful */}
      <section className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-6 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[340px] bg-gradient-to-b from-sky-400/20 via-blue-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.16] max-w-3xl mx-auto mb-3">
          Lacak Posisi Berkas &{' '}
          <span className="text-blue-600">
            Keabsahan Tanda Tangan.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto mb-6">
          Pantau proses disposisi berkas Anda di meja RT, RW, hingga penerbitan tanda tangan digital Kades.
        </p>

        {/* Floating Search Console */}
        <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl border border-sky-200/80 p-4 sm:p-5 shadow-xl shadow-sky-500/10 space-y-3.5">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4.5 top-1/2 -translate-y-1/2 text-sky-500" />
              <input
                type="text"
                placeholder="Masukkan nomor resi (contoh: REQ-20260818-001)..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-12 pr-24 py-3 bg-slate-50/80 rounded-full border border-sky-200/80 text-xs sm:text-sm font-mono font-medium focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 shadow-2xs transition-all text-slate-800"
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
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-sky-100 hover:bg-sky-200 text-sky-800 font-extrabold text-[10px] transition-all cursor-pointer"
              >
                Tempel
              </button>
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-sky-500/20 transition-all press-down disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isSearching ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Mencari...</span>
                </>
              ) : (
                <>
                  <span>Lacak Berkas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Resi Helper Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="text-slate-400 font-medium text-[11px]">Uji Coba:</span>
            {['REQ-20260818-001', 'REQ-20260818-002'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setKeyword(sample);
                  executeSearch(sample);
                }}
                className="px-2.5 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 font-mono font-bold text-[10px] border border-sky-200/70 transition-all cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>

          {searchError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center flex items-center justify-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}
        </div>
      </section>

      {/* Main Results or Guided Preview */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-14 space-y-6">
        
        {hasSearched && trackingResults && trackingResults.length > 0 ? (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Ditemukan {trackingResults.length} Riwayat Permohonan
              </span>
              <span className="text-[11px] text-slate-400">Data realtime sinkron dengan database desa</span>
            </div>

            {trackingResults.map((item) => {
              const isExpanded = expandedTrackings[item.id] ?? true;
              
              let currentStep = 1;
              if (item.status === 'completed') currentStep = 4;
              else if (item.status === 'processed_sekdes' || item.status === 'approved_rt') currentStep = 3;
              else if (item.status === 'pending_rt') currentStep = 2;

              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-3xl p-5 sm:p-7 space-y-5 border border-sky-100 shadow-lg shadow-sky-500/5 transition-all"
                >
                  {/* Status & Resi Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/80">
                          <span className="text-[11px] font-mono text-slate-800 font-black">{item.nomor_resi}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.nomor_resi)}
                            className="text-xs text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer pl-1.5 border-l border-sky-200"
                            title="Salin Nomor Resi"
                          >
                            {copiedResi === item.nomor_resi ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </button>
                        </div>

                        {item.nomor_surat_resmi && (
                          <span className="text-[11px] font-mono font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                            No. Dok: {item.nomor_surat_resmi}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                        {item.surat_type?.nama_surat}
                      </h3>
                      <div className="text-xs text-slate-600">
                        Pemohon: <strong className="text-slate-900 font-extrabold">{item.warga_profile?.nama_lengkap}</strong>
                        {item.keperluan && <span className="text-slate-500"> • Untuk {item.keperluan}</span>}
                      </div>
                    </div>

                    <div className="text-left sm:text-right space-y-1">
                      <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black shadow-2xs ${
                        item.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' :
                        item.status === 'rejected' ? 'bg-rose-50 text-rose-800 border border-rose-300' :
                        'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}>
                        {item.status === 'completed' ? '✓ Dokumen Selesai & Sah' :
                         item.status === 'rejected' ? '✕ Permohonan Ditolak' :
                         ['processed_sekdes', 'approved_rt'].includes(item.status) ? '⏳ Antrean Meja Desa' :
                         item.status === 'pending_rw' ? '⏳ Antrean Meja Desa' : '⏳ Verifikasi RT'}
                      </span>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Diajukan: {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* 4-Step Interactive Milestone Tracker */}
                  <div className="py-1">
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
                      {[
                        { label: 'Pengajuan', num: 1 },
                        { label: 'Validasi RT', num: 2 },
                        { label: 'Persetujuan Desa', num: 3 },
                        { label: 'Terbit TTE QR', num: 4 },
                      ].map((st) => {
                        const isDone = currentStep >= st.num;
                        const isCurrent = currentStep === st.num;
                        return (
                          <div key={st.num} className="space-y-1.5">
                            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-black transition-all ${
                              isDone
                                ? 'bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}>
                              {isDone && currentStep > st.num ? <Check className="w-3.5 h-3.5" /> : st.num}
                            </div>
                            <div className={`font-bold truncate text-[11px] ${isCurrent ? 'text-sky-700 font-black' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                              {st.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Collapsible Action Logs */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => toggleTracking(item.id)}
                      className="w-full py-2 px-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50/60 border border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        <span>Riwayat Disposisi Berjenjang ({item.trackings?.length || 0})</span>
                      </div>
                      <span className="text-[11px] text-sky-700 font-extrabold flex items-center gap-1">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isExpanded ? 'Tutup' : 'Lihat'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-2 bg-slate-50/60 p-3 sm:p-4 rounded-2xl border border-slate-200/80 animate-fade-in">
                        {item.trackings && item.trackings.length > 0 ? (
                          item.trackings.map((t, idx) => (
                            <div key={t.id || idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                              <div className="flex-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-slate-900">{t.status_stage} — <span className="text-sky-700">{t.status_action}</span></span>
                                  <span className="text-[11px] text-slate-400 font-mono">{new Date(t.created_at).toLocaleString('id-ID')}</span>
                                </div>
                                {t.catatan && <p className="text-slate-600 mt-1 italic text-[11px]">{t.catatan}</p>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-400 italic text-center py-2">
                            Menunggu tindak lanjut dari Ketua RT setempat.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.qr_verification_hash || item.nomor_resi)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-slate-200 shadow-2xs press-down cursor-pointer"
                    >
                      {copiedResi === (item.qr_verification_hash || item.nomor_resi) ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Salin Kode Resi</span>
                        </>
                      )}
                    </button>

                    {item.status === 'completed' && (
                      <button
                        onClick={() => {
                          setQrVerifyHash(item.qr_verification_hash || item.nomor_resi);
                          setIsVerifyModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-extrabold transition-all shadow-md shadow-sky-500/20 press-down cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Uji Sertifikat QR</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Default Clean Guide when user has not tracked yet */
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <span className="text-xs font-extrabold tracking-wider text-sky-600 uppercase">
                PANDUAN TRANSPARANSI DISPOSISI
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Cara Kerja Pelacakan Berkas
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                Setiap perubahan status permohonan terekam secara kriptografis dan dapat dipantau oleh warga secara langsung.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { num: '1', title: 'Nomor Resi Unik', desc: 'Diterbitkan instan setelah submit formulir online atau dikirim via WhatsApp warga.' },
                { num: '2', title: 'Persetujuan RT & RW', desc: 'Pengurus lingkungan memvalidasi domisili dan kelayakan tanpa perlu tanda tangan basah di kertas.' },
                { num: '3', title: 'Disposisi Kantor Balai Desa', desc: 'Sekretaris Desa memverifikasi penomoran surat resmi dan menyiapkan draf TTE.' },
                { num: '4', title: 'Pengesahan TTE Kades', desc: 'Kepala Desa membubuhkan tanda tangan digital bersertifikasi dan dokumen PDF siap unduh.' },
              ].map((g) => (
                <div key={g.num} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    {g.num}
                  </div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">{g.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verifikator QR Quick Launcher Card */}
        <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-blue-700 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-4 text-center sm:text-left relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0">
              <QrCode className="w-6 h-6 text-sky-200" />
            </div>
            <div>
              <h4 className="font-black text-base sm:text-lg text-white">Ingin Uji Keaslian Dokumen Cetak?</h4>
              <p className="text-xs text-sky-100 max-w-md">
                Pindai kode barcode QR yang tertera pada lembaran surat untuk mengecek validitas tanda tangan elektronik Kepala Desa.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setQrVerifyHash(null);
              setIsVerifyModalOpen(true);
            }}
            className="px-6 py-2.5 rounded-full bg-white hover:bg-sky-50 text-blue-900 font-extrabold text-xs transition-all shadow-md press-down cursor-pointer shrink-0 relative z-10 flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Buka Verifikator QR</span>
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
