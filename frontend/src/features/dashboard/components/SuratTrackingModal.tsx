import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Lightbulb,
  X, AlertTriangle, CheckCircle2, Clock, ShieldCheck, 
  User, Printer, ArrowRight, FileText, Check, Send
} from 'lucide-react';
import { SuratRequest, DesaSetting } from '@/shared/types';

interface SuratTrackingModalProps {
  surat: SuratRequest;
  desa?: DesaSetting | null;
  onClose: () => void;
  onReapply?: (suratTypeId: number, keperluan: string) => void;
  onPrint?: (surat: SuratRequest) => void;
}

export const SuratTrackingModal: React.FC<SuratTrackingModalProps> = ({
  surat,
  onClose,
  onReapply,
  onPrint,
}) => {
  // Prevent background scrolling and handle ESC key
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const trackings = surat.trackings || [];
  
  // Find specific stage records
  const rtTracking = trackings.find(t => t.status_stage?.toLowerCase().includes('rt'));
  const rwTracking = trackings.find(t => t.status_stage?.toLowerCase().includes('rw'));
  const desaTracking = trackings.find(t => 
    t.status_stage?.toLowerCase().includes('kepala desa') || 
    t.status_stage?.toLowerCase().includes('kades') || 
    t.status_stage?.toLowerCase().includes('desa') || 
    t.status_stage?.toLowerCase().includes('sekretaris')
  );
  const rejectTracking = trackings.find(t => t.status_action === 'Ditolak') || (['rejected', 'rejected_rt', 'rejected_kades'].includes(surat.status) ? {
    status_stage: surat.status === 'rejected_kades' ? 'Kepala Desa' : surat.status === 'rejected_rt' ? 'Ketua RT 01' : 'Petugas Lingkungan / Desa',
    catatan: surat.catatan_penolakan || surat.catatan_penolakan_kades || 'Berkas persyaratan atau data pemohon belum memenuhi kelengkapan validasi.',
    created_at: surat.created_at,
  } : null);

  const isRejected = ['rejected', 'rejected_rt', 'rejected_kades'].includes(surat.status);
  const isCompleted = surat.status === 'completed';

  // Determine stage where rejection occurred
  const isRejectedAtRt = (surat.status === 'rejected_rt') || (isRejected && (rejectTracking?.status_stage?.toLowerCase().includes('rt') || (!rejectTracking?.status_stage && surat.status === 'rejected')));
  const isRejectedAtRw = isRejected && (rejectTracking?.status_stage?.toLowerCase().includes('rw'));
  const isRejectedAtDesa = (surat.status === 'rejected_kades') || (isRejected && !isRejectedAtRt && !isRejectedAtRw);

  // Friendly status badge configuration
  const getStatusBadge = () => {
    if (isRejected) {
      return {
        label: 'Perlu Perbaikan / Ditolak',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500'
      };
    }
    if (isCompleted) {
      return {
        label: 'Selesai & Sah Ber-QR',
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500'
      };
    }
    if (['pending_kades', 'processed_sekdes', 'approved_rt'].includes(surat.status)) {
      return {
        label: 'Proses Pengesahan Kades',
        bg: 'bg-teal-50 text-teal-800 border-teal-200',
        dot: 'bg-teal-500'
      };
    }
    return {
      label: 'Menunggu Persetujuan RT',
      bg: 'bg-amber-50 text-amber-900 border-amber-200',
      dot: 'bg-amber-500'
    };
  };

  const statusBadge = getStatusBadge();

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fade-in font-sans overflow-y-auto select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200/90 animate-scale-up my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header: Clean & Informative */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
              isRejected ? 'bg-rose-100 text-rose-700' :
              isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isRejected ? <AlertTriangle className="w-5 h-5" /> :
               isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold text-slate-500 tracking-wider">
                  {surat.nomor_resi}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                  {statusBadge.label}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 truncate mt-0.5">
                {surat.surat_type?.nama_surat || 'Surat Permohonan'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-2"
            title="Tutup (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* BANNER PENOLAKAN (JIKA SURAT DITOLAK) */}
          {isRejected && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-950 space-y-3 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black uppercase text-rose-800 tracking-wider">
                    Permohonan Perlu Diperbaiki
                  </div>
                  <div className="text-xs text-rose-700 mt-0.5">
                    Ditolak oleh: <strong>{rejectTracking?.status_stage || 'Ketua RT 01'}</strong>
                  </div>
                  
                  {/* Alasan Penolakan dengan Typography Bersih */}
                  <div className="mt-2.5 p-3 rounded-xl bg-white border border-rose-200/90 text-xs text-rose-900 leading-relaxed font-medium">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Catatan Petugas:</span>
                    "{surat.catatan_penolakan || rejectTracking?.catatan || 'Berkas persyaratan belum lengkap atau data pemohon belum valid.'}"
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-rose-800 text-[11px]">
                  Anda dapat memperbaiki catatan di atas lalu mengajukan kembali.
                </span>
                {onReapply && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onReapply(surat.surat_type_id, surat.keperluan);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <span>Ajukan Ulang Sekarang</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* BANNER SURAT SAH & SIAP CETAK (JIKA COMPLETED) */}
          {isCompleted && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 space-y-3 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black uppercase text-emerald-800 tracking-wider">
                    Surat Telah Sah & Terbit
                  </div>
                  <div className="text-xs text-emerald-900 font-semibold mt-0.5">
                    Nomor Resmi: <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">{surat.nomor_surat_resmi || '-'}</span>
                  </div>
                  <p className="text-xs text-emerald-800/90 mt-1 leading-relaxed">
                    Dokumen ini telah disahkan dengan Stempel QR Code resmi Kantor Desa Doko dan diakui secara kedinasan.
                  </p>
                </div>
              </div>

              {onPrint && (
                <div className="pt-2 border-t border-emerald-200/70 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onPrint(surat);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak / Unduh PDF Sekarang</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Ringkasan Informasi Surat (Clean, No Nested Box) */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Keperluan Pemohon:</span>
              <p className="font-semibold text-slate-800 mt-0.5 text-xs sm:text-sm leading-relaxed">
                {surat.keperluan}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tanggal Pengajuan:</span>
              <p className="font-semibold text-slate-800 mt-0.5 text-xs sm:text-sm">
                {new Date(surat.created_at).toLocaleDateString('id-ID', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* TIMELINE PELACAKAN STATUS PERSURATAN (BERSIH & RAMAH WARGA) */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>Alur Verifikasi Surat (Direct RT ke Desa)</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">
                Pembaruan Real-Time
              </span>
            </div>

            {/* Vertikal Stepper Modern Tanpa Nested Box */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[11px] sm:before:left-[15px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              
              {/* TAHAP 1: PENGAJUAN ONLINE OLEH WARGA */}
              <div className="relative group">
                {/* Node Indicator */}
                <div className="absolute -left-6 sm:-left-8 top-0.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-xs z-10">
                  <Check className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
                </div>
                
                {/* Step Content */}
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      1. Pengajuan Surat Online
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(surat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Surat berhasil diajukan oleh pemohon dan otomatis diteruskan ke Ketua RT setempat.
                  </p>
                </div>
              </div>

              {/* TAHAP 2: VERIFIKASI & PENGANTAR KETUA RT 01 */}
              <div className="relative group">
                {/* Node Indicator */}
                <div className={`absolute -left-6 sm:-left-8 top-0.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center shadow-xs z-10 ${
                  isRejectedAtRt ? 'bg-rose-600 text-white' :
                  rtTracking ? 'bg-emerald-700 text-white' :
                  surat.status === 'pending_rt' ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse' :
                  'bg-slate-200 text-slate-400'
                }`}>
                  {isRejectedAtRt ? <AlertTriangle className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> :
                   rtTracking ? <Check className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" /> :
                   surat.status === 'pending_rt' ? <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> :
                   <span className="text-[10px] font-bold">2</span>}
                </div>

                {/* Step Content */}
                <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                      <span>2. Persetujuan Ketua RT 01</span>
                      {isRejectedAtRt && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Ditolak di RT
                        </span>
                      )}
                      {rtTracking && !isRejectedAtRt && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Disetujui RT
                        </span>
                      )}
                      {surat.status === 'pending_rt' && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Menunggu Review
                        </span>
                      )}
                    </span>

                    {rtTracking && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(rtTracking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {isRejectedAtRt ? 'Permohonan tidak dapat disetujui oleh Ketua RT setempat.' :
                     rtTracking ? 'Ketua RT 01 telah memvalidasi data pemohon dan memberikan rekomendasi ke Balai Desa.' :
                     surat.status === 'pending_rt' ? 'Menunggu Ketua RT 01 memeriksa kelengkapan data pemohon.' :
                     'Menunggu antrean verifikasi RT.'}
                  </p>

                  {/* Catatan RT dalam bentuk bubble halus tanpa border kotak ganda */}
                  {(rtTracking?.catatan || isRejectedAtRt) && (
                    <div className={`mt-2 p-3 rounded-xl text-xs leading-relaxed ${
                      isRejectedAtRt 
                        ? 'bg-rose-50/80 border-l-3 border-rose-500 text-rose-900' 
                        : 'bg-slate-50 border-l-3 border-emerald-500 text-slate-700'
                    }`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 opacity-70">
                        Catatan Ketua RT 01:
                      </span>
                      <p className="font-medium italic">
                        "{isRejectedAtRt ? 
                          (surat.catatan_penolakan || rejectTracking?.catatan || 'Berkas permohonan ditolak di tingkat RT.') : 
                          (rtTracking?.catatan || 'Data warga valid dan terdaftar resmi di RT 01.')}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* TAHAP KHUSUS RW (JIKA ADA RIWAYAT LEGACY RW) */}
              {!isRejectedAtRt && (rwTracking || surat.status === 'pending_rw' || isRejectedAtRw) && (
                <div className="relative group">
                  <div className={`absolute -left-6 sm:-left-8 top-0.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center shadow-xs z-10 ${
                    isRejectedAtRw ? 'bg-rose-600 text-white' :
                    rwTracking ? 'bg-emerald-700 text-white' :
                    'bg-slate-200 text-slate-400'
                  }`}>
                    {isRejectedAtRw ? <AlertTriangle className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> :
                     rwTracking ? <Check className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" /> :
                     <span className="text-[10px] font-bold">•</span>}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        Verifikasi Pengantar RW 01
                      </span>
                      {rwTracking && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(rwTracking.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {rwTracking ? 'Diverifikasi oleh Ketua RW 01.' : 'Menunggu tahap RW.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAHAP 3: LEGALISASI & PENGESAHAN KEPALA DESA */}
              {!isRejectedAtRt && !isRejectedAtRw && (
                <div className="relative group">
                  {/* Node Indicator */}
                  <div className={`absolute -left-6 sm:-left-8 top-0.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center shadow-xs z-10 ${
                    isRejectedAtDesa ? 'bg-rose-600 text-white' :
                    isCompleted ? 'bg-emerald-700 text-white' :
                    ['pending_kades', 'processed_sekdes', 'approved_rt'].includes(surat.status) ? 'bg-teal-600 text-white ring-4 ring-teal-100 animate-pulse' :
                    'bg-slate-200 text-slate-400'
                  }`}>
                    {isRejectedAtDesa ? <AlertTriangle className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> :
                     isCompleted ? <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> :
                     ['pending_kades', 'processed_sekdes', 'approved_rt'].includes(surat.status) ? <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> :
                     <span className="text-[10px] font-bold">3</span>}
                  </div>

                  {/* Step Content */}
                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <span>3. Legalisasi Stempel QR & TTD Kepala Desa</span>
                        {isCompleted && (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Resmi & Sah
                          </span>
                        )}
                        {['pending_kades', 'processed_sekdes', 'approved_rt'].includes(surat.status) && (
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                            Sedang Diproses
                          </span>
                        )}
                      </span>

                      {isCompleted && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {surat.kades_approved_at || (surat as any).ttd_kades_at ? new Date((surat.kades_approved_at || (surat as any).ttd_kades_at)!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Selesai'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {isRejectedAtDesa ? 'Permohonan ditolak oleh Kepala Desa.' :
                       isCompleted ? 'Surat telah ditandatangani dan dibubuhi stempel QR resmi oleh Kepala Desa Doko.' :
                       ['pending_kades', 'processed_sekdes', 'approved_rt'].includes(surat.status) ? 'Kepala Desa sedang memeriksa dan memproses pengesahan nomor resmi & tanda tangan QR.' :
                       'Menunggu persetujuan RT selesai sebelum disahkan oleh Kepala Desa.'}
                    </p>

                    {/* Catatan Balai Desa / Kades (jika ada) */}
                    {(desaTracking?.catatan || isRejectedAtDesa) && (
                      <div className={`mt-2 p-3 rounded-xl text-xs leading-relaxed ${
                        isRejectedAtDesa 
                          ? 'bg-rose-50/80 border-l-3 border-rose-500 text-rose-900' 
                          : 'bg-slate-50 border-l-3 border-teal-500 text-slate-700'
                      }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 opacity-70">
                          Catatan Kepala Desa:
                        </span>
                        <p className="font-medium italic">
                          "{isRejectedAtDesa ? (surat.catatan_penolakan || surat.catatan_penolakan_kades || rejectTracking?.catatan) : desaTracking?.catatan}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 font-medium hidden sm:block">
            Sistem Informasi Desa Doko • Kab. Kediri
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {isRejected && onReapply && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReapply(surat.surat_type_id, surat.keperluan);
                }}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Pengajuan Ulang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {isCompleted && onPrint && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPrint(surat);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
