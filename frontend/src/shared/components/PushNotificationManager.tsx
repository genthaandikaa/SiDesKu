import React, { useState, useEffect } from 'react';
import {
  BellRing,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Info,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { pushNotificationService, PushStatus } from '@/shared/services/pushNotificationService';

interface PushNotificationManagerProps {
  className?: string;
  compact?: boolean;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  className = '',
  compact = false,
}) => {
  const [status, setStatus] = useState<PushStatus>({
    isSupported: true,
    permission: 'default',
    isSubscribed: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [showPrePrompt, setShowPrePrompt] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const s = await pushNotificationService.getStatus();
      setStatus(s);
    } catch (e) {
      console.warn('Failed to load push status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleSubscribeClick = () => {
    setFeedback(null);
    if (status.permission === 'denied') {
      setFeedback({
        type: 'error',
        message: 'Izin notifikasi diblokir oleh browser Anda. Klik ikon gembok di bilah URL browser untuk mengizinkan notifikasi.',
      });
      return;
    }
    // Tampilkan penjelasan sebelum memicu dialog browser
    setShowPrePrompt(true);
  };

  const handleConfirmSubscribe = async () => {
    setShowPrePrompt(false);
    setActionLoading(true);
    setFeedback(null);

    const res = await pushNotificationService.subscribe();
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }

    await refreshStatus();
    setActionLoading(false);
  };

  const handleUnsubscribe = async () => {
    setActionLoading(true);
    setFeedback(null);

    const res = await pushNotificationService.unsubscribe();
    if (res.success) {
      setFeedback({ type: 'info', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }

    await refreshStatus();
    setActionLoading(false);
  };

  const handleTestPush = async () => {
    setActionLoading(true);
    setFeedback(null);

    const res = await pushNotificationService.sendTestPush();
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }

    setActionLoading(false);
  };

  if (!status.isSupported) {
    return (
      <div className={`p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 text-xs flex items-center gap-3 ${className}`}>
        <BellOff className="w-5 h-5 text-slate-400 shrink-0" />
        <div>
          <p className="font-semibold text-slate-800">Web Push Tidak Didukung</p>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Browser atau perangkat ini belum mendukung standar W3C Web Push Notification.
          </p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-xl ${className}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${status.isSubscribed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            <BellRing className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="text-xs font-bold text-slate-800 truncate">Notifikasi Web Push</p>
            <p className="text-[10px] text-slate-500">
              {status.isSubscribed ? 'Aktif di perangkat ini' : 'Belum diaktifkan'}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={actionLoading || loading}
          onClick={status.isSubscribed ? handleUnsubscribe : handleSubscribeClick}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
            status.isSubscribed
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
          }`}
        >
          {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
          {status.isSubscribed ? 'Nonaktifkan' : 'Aktifkan'}
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition ${className}`}>
      {/* Header Card */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/50 via-white to-transparent">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
            status.isSubscribed
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-100 text-slate-600'
          }`}>
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifikasi Web Push SiDesKu</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-800">
                Prioritas Rp0
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemberitahuan real-time langsung ke perangkat Anda bahkan saat aplikasi ditutup.
            </p>
          </div>
        </div>

        {/* Badge Status */}
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-600 flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> Memeriksa...
            </span>
          ) : status.isSubscribed ? (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Aktif (Terkoneksi)
            </span>
          ) : status.permission === 'denied' ? (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Izin Diblokir Browser
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 flex items-center gap-1.5">
              <BellOff className="w-3.5 h-3.5 text-slate-400" />
              Belum Diaktifkan
            </span>
          )}
        </div>
      </div>

      {/* Body Card */}
      <div className="p-5 space-y-4">
        {/* Feedback message */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : feedback.type === 'error'
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-slate-50 border border-slate-200 text-slate-700'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : feedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            )}
            <span className="flex-1 leading-relaxed">{feedback.message}</span>
          </div>
        )}

        {/* Value Proposition List */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Status Surat Real-Time</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Notifikasi instan saat surat diverifikasi RT atau disahkan Kades.</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Pusat Pesan Desa</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Dapatkan kabar pesan masuk dari perangkat desa atau sesama warga.</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Bebas Pulsa & Kuota (Rp0)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Menggunakan standar terbuka W3C VAPID tanpa biaya gateway berbayar.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          {status.isSubscribed ? (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleTestPush}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Kirim Uji Coba Notifikasi
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleUnsubscribe}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                Nonaktifkan Notifikasi
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleSubscribeClick}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
              Aktifkan Notifikasi Web Push
            </button>
          )}

          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 ml-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Privasi terlindungi: payload tidak memuat NIK atau dokumen privat.
          </p>
        </div>
      </div>

      {/* Pre-Prompt Modal Edukatif Sebelum Trigger Browser Permission Dialog */}
      {showPrePrompt && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-emerald-100 p-6 space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Izinkan Notifikasi SiDesKu?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Browser Anda akan menampilkan kotak konfirmasi izin. SiDesKu hanya mengirimkan informasi penting terkait surat, bansos, pesan, dan agenda desa Anda.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 text-xs text-slate-600 space-y-2 border border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tanpa iklan & tanpa pesan spam</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bisa dimatikan kapan saja melalui dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Terhubung aman via enkripsi standar VAPID Rp0</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowPrePrompt(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSubscribe}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                Izinkan & Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

