import React, { useEffect } from 'react';
import { 
  X, AlertTriangle, CheckCircle2, Clock, ShieldCheck, 
  User, Printer, ArrowRight
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
  // Prevent background scrolling
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  const trackings = surat.trackings || [];
  
  // Find specific stage records
  const rtTracking = trackings.find(t => t.status_stage?.toLowerCase().includes('rt'));
  const rwTracking = trackings.find(t => t.status_stage?.toLowerCase().includes('rw'));
  const sekdesTracking = trackings.find(t => t.status_stage?.toLowerCase().includes('sekretaris') || t.status_stage?.toLowerCase().includes('desa'));
  const rejectTracking = trackings.find(t => t.status_action === 'Ditolak') || (surat.status === 'rejected' ? {
    status_stage: 'Petugas Lingkungan / Desa',
    catatan: surat.catatan_penolakan || 'Berkas persyaratan atau data pemohon belum memenuhi kelengkapan validasi.',
    created_at: surat.created_at,
  } : null);

  const isRejected = surat.status === 'rejected';
  const isCompleted = surat.status === 'completed';

  // Determine stage where rejection occurred
  const isRejectedAtRt = isRejected && (!rejectTracking?.status_stage || rejectTracking?.status_stage?.toLowerCase().includes('rt'));
  const isRejectedAtRw = isRejected && (rejectTracking?.status_stage?.toLowerCase().includes('rw'));
  const isRejectedAtSekdes = isRejected && (rejectTracking?.status_stage?.toLowerCase().includes('sekretaris') || rejectTracking?.status_stage?.toLowerCase().includes('desa'));

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-scale-up my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
              isRejected ? 'bg-rose-100 text-rose-700' :
              isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
            }`}>
              {isRejected ? <AlertTriangle className="w-5 h-5" /> :
               isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-500">{surat.nomor_resi}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  isRejected ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                  isCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {isRejected ? 'Permohonan Berhenti / Ditolak' : isCompleted ? 'Diterima & Sah' : 'Sedang Diproses'}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 leading-tight mt-0.5">
                {surat.surat_type?.nama_surat || 'Surat Permohonan'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* PROMINENT REJECTION REASON BANNER (IF REJECTED) */}
          {isRejected && (
            <div className="p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-3 shadow-xs animate-scale-up">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-black uppercase text-rose-700 tracking-wider">
                    Alasan Resmi Penolakan Surat
                  </div>
                  <div className="text-xs text-rose-800 mt-0.5">
                    Ditolak oleh: <strong>{rejectTracking?.status_stage || 'Ketua RT 01'}</strong>
                  </div>
                  
                  {/* The exact reason box */}
                  <div className="mt-3 p-3.5 rounded-2xl bg-white border border-rose-200 shadow-2xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Catatan / Alasan Penolakan:</div>
                    <p className="text-sm font-black text-rose-900 leading-relaxed font-sans">
                      "{surat.catatan_penolakan || rejectTracking?.catatan || 'Berkas persyaratan belum lengkap atau data pemohon belum valid.'}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-rose-800 text-[11px]">
                  💡 <strong>Solusi:</strong> Anda dapat memperbaiki data/berkas di atas dan mengajukan kembali secara online.
                </span>
                {onReapply && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onReapply(surat.surat_type_id, surat.keperluan);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-extrabold text-xs shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ajukan Ulang Surat Ini</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Letter Info Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Keperluan Pemohon:</span>
              <div className="font-bold text-slate-800 mt-0.5">{surat.keperluan}</div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Tanggal Pengajuan:</span>
              <div className="font-bold text-slate-800 mt-0.5">
                {new Date(surat.created_at).toLocaleDateString('id-ID', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
            </div>
          </div>

          {/* AUDIT TRAIL / TIMELINE PERSURATAN (TAHAPAN & CATATAN RT / RW / SEKDES) */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Alur Verifikasi & Catatan Lengkap Petugas</span>
            </h4>

            <div className="space-y-3 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              
              {/* STEP 1: WARGA PENGAJUAN */}
              <div className="relative flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold shrink-0 shadow-xs z-10">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      Tahap 1: Pengajuan Warga
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(surat.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <div className="font-extrabold text-xs text-slate-900">
                    Permohonan diajukan secara online oleh Pemohon
                  </div>
                  <p className="text-xs text-slate-500">
                    Keperluan: <em>"{surat.keperluan}"</em>
                  </p>
                </div>
              </div>

              {/* STEP 2: VERIFIKASI KETUA RT 01 */}
              <div className="relative flex items-start gap-4">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-xs z-10 ${
                  isRejectedAtRt ? 'bg-rose-600 text-white shadow-rose-200' :
                  rtTracking ? 'bg-emerald-600 text-white' : 
                  surat.status === 'pending_rt' ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-400'
                }`}>
                  {isRejectedAtRt ? <AlertTriangle className="w-5 h-5" /> :
                   rtTracking ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div className={`flex-1 p-4 rounded-2xl border shadow-2xs space-y-1.5 ${
                  isRejectedAtRt ? 'bg-rose-50/70 border-rose-300' :
                  rtTracking ? 'bg-white border-emerald-300' : 'bg-slate-50/80 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      isRejectedAtRt ? 'bg-rose-200 text-rose-900' :
                      rtTracking ? 'bg-emerald-100 text-emerald-800' :
                      surat.status === 'pending_rt' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-600'
                    }`}>
                      Tahap 2: Verifikasi Pengantar RT 01
                    </span>
                    {rtTracking && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(rtTracking.created_at).toLocaleDateString('id-ID')}
                      </span>
                    )}
                  </div>

                  <div className="font-extrabold text-xs text-slate-900 flex items-center justify-between">
                    <span>
                      {isRejectedAtRt ? '❌ Ditolak oleh Ketua RT 01 (Alur Berhenti)' :
                       rtTracking ? '✅ Disetujui oleh Ketua RT 01' :
                       surat.status === 'pending_rt' ? '⏳ Menunggu Persetujuan Ketua RT 01' : 'Menunggu antrean'}
                    </span>
                  </div>

                  {/* RT Notes / Reason Display */}
                  {(rtTracking?.catatan || isRejectedAtRt) && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs mt-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        💬 Catatan & Alasan RT 01:
                      </span>
                      <p className={`font-semibold ${
                        isRejectedAtRt ? 'text-rose-800' : 'text-slate-700'
                      }`}>
                        {isRejectedAtRt ? 
                          (surat.catatan_penolakan || rejectTracking?.catatan || 'Berkas permohonan ditolak di tingkat RT.') : 
                          (rtTracking?.catatan || 'Data warga valid dan terdaftar resmi di RT 01.')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* STEP 3: VERIFIKASI KETUA RW 01 (ONLY RENDER IF NOT REJECTED AT RT) */}
              {!isRejectedAtRt && (
                <div className="relative flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-xs z-10 ${
                    isRejectedAtRw ? 'bg-rose-600 text-white shadow-rose-200' :
                    rwTracking ? 'bg-emerald-600 text-white' : 
                    surat.status === 'pending_rw' ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isRejectedAtRw ? <AlertTriangle className="w-5 h-5" /> :
                     rwTracking ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className={`flex-1 p-4 rounded-2xl border shadow-2xs space-y-1.5 ${
                    isRejectedAtRw ? 'bg-rose-50/70 border-rose-300' :
                    rwTracking ? 'bg-white border-emerald-300' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        isRejectedAtRw ? 'bg-rose-200 text-rose-900' :
                        rwTracking ? 'bg-emerald-100 text-emerald-800' :
                        surat.status === 'pending_rw' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-600'
                      }`}>
                        Tahap 3: Verifikasi Pengantar RW 01
                      </span>
                      {rwTracking && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(rwTracking.created_at).toLocaleDateString('id-ID')}
                        </span>
                      )}
                    </div>

                    <div className="font-extrabold text-xs text-slate-900">
                      {isRejectedAtRw ? '❌ Ditolak oleh Ketua RW 01 (Alur Berhenti)' :
                       rwTracking ? '✅ Disetujui oleh Ketua RW 01' :
                       surat.status === 'pending_rw' ? '⏳ Menunggu Persetujuan Ketua RW 01' : 'Menunggu tahap RT selesai'}
                    </div>

                    {/* RW Notes / Reason Display */}
                    {(rwTracking?.catatan || isRejectedAtRw) && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs mt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                          💬 Catatan & Alasan RW 01:
                        </span>
                        <p className={`font-semibold ${
                          isRejectedAtRw ? 'text-rose-800' : 'text-slate-700'
                        }`}>
                          {isRejectedAtRw ? 
                            (surat.catatan_penolakan || rejectTracking?.catatan || 'Berkas permohonan ditolak di tingkat RW.') : 
                            (rwTracking?.catatan || 'Verifikasi pengantar RW lengkap. Diteruskan ke Kantor Desa untuk legalisasi.')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: PENGESAHAN SEKRETARIS DESA (ONLY RENDER IF NOT REJECTED AT RT AND NOT REJECTED AT RW) */}
              {!isRejectedAtRt && !isRejectedAtRw && (
                <div className="relative flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-xs z-10 ${
                    isRejectedAtSekdes ? 'bg-rose-600 text-white' :
                    isCompleted ? 'bg-emerald-700 text-white' :
                    surat.status === 'processed_sekdes' ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isRejectedAtSekdes ? <AlertTriangle className="w-5 h-5" /> :
                     isCompleted ? <ShieldCheck className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div className={`flex-1 p-4 rounded-2xl border shadow-2xs space-y-1.5 ${
                    isRejectedAtSekdes ? 'bg-rose-50/70 border-rose-300' :
                    isCompleted ? 'bg-white border-emerald-400' : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        isRejectedAtSekdes ? 'bg-rose-200 text-rose-900' :
                        isCompleted ? 'bg-emerald-100 text-emerald-800' :
                        surat.status === 'processed_sekdes' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-600'
                      }`}>
                        Tahap 4: Legalisasi Stempel QR & Terbit
                      </span>
                      {surat.nomor_surat_resmi && (
                        <span className="text-[10px] font-mono text-emerald-900 font-bold">
                          No: {surat.nomor_surat_resmi}
                        </span>
                      )}
                    </div>

                    <div className="font-extrabold text-xs text-slate-900">
                      {isRejectedAtSekdes ? '❌ Ditolak oleh Balai Desa (Alur Berhenti)' :
                       isCompleted ? '🏛️ Dokumen Resmi Diterbitkan & Sah Ber-QR' :
                       surat.status === 'processed_sekdes' ? '⏳ Sedang Diproses Legalisasi Sekretaris Desa' : 'Menunggu tahap sebelumnya selesai'}
                    </div>

                    {(sekdesTracking?.catatan || isRejectedAtSekdes) && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs mt-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                          💬 Catatan Kantor Balai Desa:
                        </span>
                        <p className={`font-semibold ${isRejectedAtSekdes ? 'text-rose-800' : 'text-slate-700'}`}>
                          {isRejectedAtSekdes ? (surat.catatan_penolakan || rejectTracking?.catatan) : sekdesTracking?.catatan}
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
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 font-medium">
            Sistem Informasi Desa Doko • Kab. Kediri
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && onPrint && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPrint(surat);
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Unduh PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
