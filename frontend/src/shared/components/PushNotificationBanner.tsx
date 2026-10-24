import React, { useState, useEffect } from 'react';
import { BellRing, CheckCircle2, X, Loader2, Smartphone } from 'lucide-react';
import { pushNotificationService, PushStatus } from '@/shared/services/pushNotificationService';

interface PushNotificationBannerProps {
  className?: string;
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('sidesku_push_banner_dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
      setLoading(false);
      return;
    }

    pushNotificationService.getStatus()
      .then((s) => setStatus(s))
      .catch((e) => console.warn('[WebPush] Banner status error:', e))
      .finally(() => setLoading(false));
  }, []);

  const handleActivate = async () => {
    setActionLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await pushNotificationService.subscribe();
      if (res.success) {
        setSuccessMsg('Notifikasi berhasil diaktifkan! Anda akan menerima update langsung di perangkat.');
        const updated = await pushNotificationService.getStatus();
        setStatus(updated);
        setTimeout(() => {
          setDismissed(true);
        }, 4000);
      } else {
        setErrorMsg(res.message);
      }
    } catch (e: any) {
      setErrorMsg('Gagal mengaktifkan notifikasi: ' + (e?.message || 'Terjadi kendala koneksi push.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('sidesku_push_banner_dismissed', 'true');
  };

  // Jangan tampilkan jika: loading, dismissed, tidak didukung, sudah subscribe, atau izin sudah ditolak keras
  if (loading || dismissed || !status || !status.isSupported || status.isSubscribed || status.permission === 'denied') {
    return null;
  }

  return (
    <div className={`mb-4 sm:mb-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white p-3.5 sm:p-4 shadow-md border border-emerald-500/40 relative animate-in fade-in slide-in-from-top-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0 pr-6 sm:pr-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
            <BellRing className="w-5 h-5 text-white animate-bounce-gentle" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-extrabold tracking-tight">
                Aktifkan Notifikasi SiDesKu di HP
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/50 text-[10px] font-bold uppercase tracking-wider text-emerald-100 border border-emerald-400/30">
                Penting
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-100 mt-0.5 leading-snug">
              {successMsg || errorMsg || 'Dapatkan notifikasi instan saat surat Anda selesai, disetujui RT/Kades, atau ada pesan baru dari desa.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {successMsg ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 text-white text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Aktif</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleActivate}
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-800" />
                  <span>Menghubungkan...</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Aktifkan Sekarang</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup pemberitahuan"
            className="w-7 h-7 rounded-lg hover:bg-white/10 text-emerald-200 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
