import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Check,
  XCircle,
  Printer,
  Eye,
  Download,
  ExternalLink,
  FileText,
  User,
  MapPin,
  Phone,
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  MessageSquare,
  Copy,
  Paperclip,
  Building2,
  Info
} from 'lucide-react';
import { SuratRequest } from '@/shared/types';
import { parseLampiranDokumen } from './WargaDashboard';

export interface PreviewSuratModalProps {
  surat: SuratRequest | null;
  role?: 'rt' | 'rw' | 'sekdes' | 'kades' | 'admin' | 'warga';
  onClose: () => void;
  onApprove?: (suratId: number, catatan?: string) => Promise<void> | void;
  onReject?: (suratId: number, catatan: string) => Promise<void> | void;
  onPrint?: (surat: SuratRequest) => void;
  isProcessing?: boolean;
  approveLabel?: string;
}

export const PreviewSuratModal: React.FC<PreviewSuratModalProps> = ({
  surat,
  role = 'rt',
  onClose,
  onApprove,
  onReject,
  onPrint,
  isProcessing = false,
  approveLabel,
}) => {
  const [activeTab, setActiveTab] = useState<'detail' | 'berkas' | 'tracking'>('detail');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [catatanPenolakan, setCatatanPenolakan] = useState('');
  const [copiedResi, setCopiedResi] = useState(false);

  // Swipe-to-close state
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const isDragging = useRef(false);

  // Open & close animation states
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 640 : false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Trigger smooth entrance animation immediately after mount
    const timer = requestAnimationFrame(() => {
      setIsOpen(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  // Wrapper around onClose that triggers smooth closing animation
  const closeWithAnimation = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setSwipeOffset(0);
    setTimeout(() => {
      onClose();
    }, 280);
  }, [isClosing, onClose]);

  // Lock body scroll and handle keyboard ESC
  useEffect(() => {
    if (!surat) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxIndex !== null) {
          setLightboxIndex(null);
        } else if (isRejectMode) {
          setIsRejectMode(false);
        } else {
          closeWithAnimation();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [surat, lightboxIndex, isRejectMode, closeWithAnimation]);

  if (!surat) return null;

  // Normalize image URL to work across Vite proxy & mobile devices
  const cleanUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('data:')) return rawUrl;
    // Replace localhost:8000 or 127.0.0.1:8000 with relative paths so Vite proxy forwards properly
    let normalized = rawUrl.replace(/^http:\/\/(127\.0\.0\.1|localhost):8000/, '');
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://') && !normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    return normalized;
  };

  // Compile all attachments (uploaded lampiran + profile KTP if available)
  const parsedDocs = parseLampiranDokumen(surat.file_lampiran).map((d) => ({
    url: cleanUrl(d.url),
    nama: d.nama,
    isKtpProfil: false,
  }));

  // If applicant has profile KTP photo and it's not already in lampiran, add it for convenience
  const fotoKtpProfil = surat.warga_profile?.foto_ktp;
  const allDocs = [...parsedDocs];
  if (fotoKtpProfil) {
    const cleanedKtp = cleanUrl(fotoKtpProfil);
    const alreadyExists = allDocs.some((d) => d.url === cleanedKtp);
    if (!alreadyExists) {
      allDocs.unshift({
        url: cleanedKtp,
        nama: 'KTP Pemohon (Tersimpan di Profil SIAK)',
        isKtpProfil: true,
      });
    }
  }

  const handleCopyResi = () => {
    if (surat?.nomor_resi) {
      navigator.clipboard.writeText(surat.nomor_resi);
      setCopiedResi(true);
      setTimeout(() => setCopiedResi(false), 2000);
    }
  };

  const handleConfirmReject = () => {
    if (!catatanPenolakan.trim()) {
      alert('Wajib mengisi catatan / alasan penolakan berkas.');
      return;
    }
    if (onReject) {
      onReject(surat.id, catatanPenolakan.trim());
    }
  };

  // Determine if approval / rejection is available based on current status & role
  const canApprove =
    !!onApprove &&
    ((role === 'rt' && surat.status === 'pending_rt') ||
      (role === 'rw' && surat.status === 'pending_rw') ||
      (['sekdes', 'kades', 'admin'].includes(role) &&
        (surat.status === 'processed_sekdes' || surat.status === 'approved_rt' || surat.status === 'pending_rw' || surat.status === 'pending_rt')));

  const canReject =
    !!onReject &&
    surat.status !== 'completed' &&
    surat.status !== 'rejected' &&
    ((role === 'rt' && surat.status === 'pending_rt') ||
      (role === 'rw' && ['pending_rw', 'approved_rt'].includes(surat.status)) ||
      (['sekdes', 'kades', 'admin'].includes(role) &&
        ['processed_sekdes', 'pending_rw', 'approved_rt', 'pending_rt'].includes(surat.status)));

  const defaultApproveText =
    role === 'rt'
      ? 'ACC & Teruskan ke Kantor Desa'
      : role === 'rw'
      ? 'ACC & Teruskan ke Kantor Desa'
      : 'Terbitkan & Sahkan QR';

  const finalApproveLabel = approveLabel || defaultApproveText;

  // Format Status Badge
  const getStatusBadge = () => {
    switch (surat.status) {
      case 'pending_rt':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Menunggu ACC RT 01</span>
          </span>
        );
      case 'approved_rt':
      case 'processed_sekdes':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-300 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
            <span>Diteruskan ke Desa • Siap TTD QR</span>
          </span>
        );
      case 'pending_rw':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-900 border border-sky-300 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-sky-700" />
            <span>Disetujui RT • Menunggu RW</span>
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Dokumen Terbit & Sah</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>Permohonan Ditolak</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-300">
            {surat.status}
          </span>
        );
    }
  };

  // Swipe-to-close gesture handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isClosing) return;
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
    isDragging.current = true;
  }, [isClosing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    touchCurrentY.current = e.touches[0].clientY;
    // Only allow downward swipe
    if (delta > 0) {
      setSwipeOffset(delta);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    const delta = touchCurrentY.current - touchStartY.current;
    if (delta > 100) {
      closeWithAnimation();
    } else {
      setSwipeOffset(0);
    }
  }, [closeWithAnimation]);

  // Compute dynamic transform and opacity for mobile bottom-sheet vs desktop dialog
  const modalTransform = isMobile
    ? (!isOpen || isClosing ? 'translateY(100%)' : `translateY(${swipeOffset}px)`)
    : (!isOpen || isClosing ? 'scale(0.96) translateY(12px)' : 'scale(1) translateY(0)');

  const modalOpacity = !isOpen || isClosing ? 0 : 1;

  const modalTransition = isDragging.current
    ? 'none'
    : isClosing
    ? 'transform 0.28s cubic-bezier(0.32, 0, 0.67, 0), opacity 0.25s ease-in'
    : 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out';

  return createPortal(
    <div
      className={`fixed inset-0 z-[999999] flex items-end sm:items-center justify-center sm:p-4 lg:p-6 bg-slate-950/80 font-sans select-none overflow-hidden transition-opacity duration-300 ease-out ${
        isOpen && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && lightboxIndex === null) {
          closeWithAnimation();
        }
      }}
    >
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col border border-slate-200/90 overflow-hidden"
        style={{
          maxHeight: '92dvh',
          height: '92dvh',
          maxWidth: '100vw',
          transform: modalTransform,
          opacity: modalOpacity,
          transition: modalTransition,
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle bar for mobile bottom sheet - tap area to also close */}
        <div
          className="sm:hidden flex justify-center pt-2.5 pb-1.5 shrink-0 cursor-grab active:cursor-grabbing"
          onClick={() => closeWithAnimation()}
        >
          <div className="w-10 h-1 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors" />
        </div>

        {/* Modal Header - Compact */}
        <div className="flex items-start justify-between px-5 sm:px-7 pt-1 sm:pt-5 pb-3 border-b border-slate-100 gap-3 shrink-0">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                <span>Resi: {surat.nomor_resi}</span>
                <button
                  type="button"
                  onClick={handleCopyResi}
                  className="text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
                  title="Salin No. Resi"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </span>
              {copiedResi && (
                <span className="text-[10px] font-bold text-emerald-600 animate-fade-in">
                  Tersalin!
                </span>
              )}
              {getStatusBadge()}
            </div>
            <h3 className="font-black text-sm sm:text-xl text-slate-900 leading-tight line-clamp-2">
              {surat.surat_type?.nama_surat || 'Permohonan Surat Warga'}
            </h3>
            <p className="hidden sm:block text-xs text-slate-500">
              Diajukan pada:{' '}
              <strong className="text-slate-700">
                {new Date(surat.created_at).toLocaleString('id-ID', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })}
              </strong>
            </p>
          </div>

          {/* X close button - hidden on mobile (use swipe) */}
          <button
            type="button"
            onClick={closeWithAnimation}
            className="hidden sm:flex self-start text-slate-400 hover:text-slate-700 p-2 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup Modal (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation - Grid 3 columns on mobile: perfectly fits without cutting off */}
        <div className="shrink-0 border-b border-slate-100 px-3 sm:px-7 pt-3 pb-2.5">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('detail');
                setIsRejectMode(false);
              }}
              className={`w-full py-2 px-1 sm:px-3 rounded-xl transition-all press-down flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-[11px] sm:text-xs font-extrabold whitespace-nowrap ${
                activeTab === 'detail'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Detail</span>
              <span className="hidden md:inline">Pemohon</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('berkas');
                setIsRejectMode(false);
              }}
              className={`w-full py-2 px-1 sm:px-3 rounded-xl transition-all press-down flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-[11px] sm:text-xs font-extrabold whitespace-nowrap ${
                activeTab === 'berkas'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Berkas ({allDocs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('tracking');
                setIsRejectMode(false);
              }}
              className={`w-full py-2 px-1 sm:px-3 rounded-xl transition-all press-down flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-[11px] sm:text-xs font-extrabold whitespace-nowrap ${
                activeTab === 'tracking'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Riwayat ({surat.trackings?.length || 0})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto py-4 px-5 sm:px-7 space-y-5 text-slate-800">
          {/* TAB 1: Detail & Warga Profile */}
          {activeTab === 'detail' && (
            <div className="space-y-5 animate-fade-in">
              {/* Alert Penolakan jika Status Rejected */}
              {surat.status === 'rejected' && (
                <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 space-y-2 animate-fade-in shadow-xs">
                  <div className="flex items-center gap-2 text-rose-900 font-black text-xs sm:text-sm">
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
                    <span>Permohonan Surat Ditolak</span>
                  </div>
                  <div className="bg-white/95 p-3 rounded-xl border border-rose-200 text-xs space-y-1">
                    <span className="font-extrabold text-[10px] uppercase text-rose-600 tracking-wider block">
                      Catatan / Alasan Penolakan Petugas:
                    </span>
                    <p className="text-slate-800 font-semibold leading-relaxed">
                      {surat.catatan_penolakan || 'Tidak ada catatan penolakan spesifik dari verifikator.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Box Pemohon */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5">
                <div className="flex items-stretch justify-between gap-2">
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-2 rounded-xl tracking-wider flex items-center whitespace-nowrap">
                    📋 Profil Pemohon
                  </span>
                  {surat.warga_profile?.no_hp_wa && (
                    <a
                      href={`https://wa.me/${surat.warga_profile.no_hp_wa.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-[11px] hover:bg-emerald-700 transition-colors shadow-xs whitespace-nowrap"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>Chat WhatsApp</span>
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">
                      Nama Lengkap:
                    </span>
                    <span className="font-black text-sm text-slate-900 block">
                      {surat.warga_profile?.nama_lengkap || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">
                      NIK & Nomor KK:
                    </span>
                    <span className="font-mono font-bold text-slate-800 block">
                      NIK: {surat.warga_profile?.nik || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">
                      Wilayah Administrasi:
                    </span>
                    <span className="font-extrabold text-emerald-800 block">
                      RT {surat.warga_profile?.rt?.nomor_rt || '01'} / RW{' '}
                      {surat.warga_profile?.rt?.rw?.nomor_rw || '01'} Desa Doko
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">
                      Alamat KTP / Domisili:
                    </span>
                    <span className="font-medium text-slate-700 block">
                      {surat.warga_profile?.alamat_ktp || '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">
                      Tempat, Tanggal Lahir:
                    </span>
                    <span className="font-medium text-slate-700 block">
                      {surat.warga_profile?.tempat_lahir || '-'},{' '}
                      {surat.warga_profile?.tanggal_lahir
                        ? new Date(surat.warga_profile.tanggal_lahir).toLocaleDateString('id-ID', {
                            dateStyle: 'medium',
                          })
                        : '-'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">
                      Status Pekerjaan & Agama:
                    </span>
                    <span className="font-medium text-slate-700 block">
                      {surat.warga_profile?.pekerjaan || '-'} ({surat.warga_profile?.agama || '-'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Box Rincian Keperluan */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Maksud & Keperluan Permohonan Surat:</span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-emerald-950 font-medium text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {surat.keperluan || 'Tidak ada keterangan keperluan yang dilampirkan.'}
                </div>

                {surat.nomor_surat_resmi && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-bold">Nomor Surat Resmi Desa:</span>
                      <span className="font-mono font-black text-emerald-800 text-sm bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {surat.nomor_surat_resmi}
                      </span>
                    </div>

                    {/* Barcode & TTE Lurah Preview */}
                    <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-emerald-950 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>TTE Sah Lurah / Kepala Desa Doko</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                          UU ITE No. 11/2008
                        </span>
                      </div>
                      <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-emerald-200">
                        <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-200 shrink-0">
                          <img
                            src={`/api/public/surat/qr/${surat.qr_verification_hash || surat.nomor_resi}?v=300`}
                            alt="QR Verification"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <img
                            src={`/api/public/surat/barcode/${encodeURIComponent(surat.nomor_surat_resmi || surat.nomor_resi)}`}
                            alt="Barcode Lurah"
                            className="h-6 w-auto max-w-full object-contain"
                          />
                          <p className="text-[10px] text-slate-600 truncate">
                            Penandatangan: <strong>Drs. H. Bambang Prasetyo, M.Si</strong> (Kepala Desa Doko)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Box Isian Tambahan (form_data_json) */}
              {surat.form_data_json &&
                (Array.isArray(surat.form_data_json)
                  ? surat.form_data_json.length > 0
                  : Object.keys(surat.form_data_json).length > 0) && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md tracking-wider">
                      Data Isian Kuesioner / Formulir Tambahan
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {Array.isArray(surat.form_data_json)
                        ? surat.form_data_json.map((item: any, idx: number) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200">
                              <span className="text-slate-400 block font-bold text-[10px]">
                                {item.label || item.key || `Isian ${idx + 1}`}:
                              </span>
                              <span className="font-bold text-slate-800">
                                {typeof item.value !== 'undefined' ? String(item.value) : String(item)}
                              </span>
                            </div>
                          ))
                        : Object.entries(surat.form_data_json).map(([k, v], idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200">
                              <span className="text-slate-400 block font-bold text-[10px] uppercase">
                                {k.replace(/_/g, ' ')}:
                              </span>
                              <span className="font-bold text-slate-800">{String(v)}</span>
                            </div>
                          ))}
                    </div>
                  </div>
                )}

              {/* Notice Penolakan Sebelumnya jika ada */}
              {surat.catatan_penolakan && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1 text-xs">
                  <div className="font-black text-rose-900 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Catatan Penolakan / Perbaikan Berkas:</span>
                  </div>
                  <p className="text-rose-800 font-medium pl-5">{surat.catatan_penolakan}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Galeri Berkas Lampiran & Foto KTP */}
          {activeTab === 'berkas' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900">
                    Lampiran Berkas & Identitas Pemohon
                  </h4>
                  <p className="text-xs text-slate-500">
                    Klik pada foto untuk memperbesar / zoom tampilan dokumen verifikasi.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  {allDocs.length} Berkas Ditemukan
                </span>
              </div>

              {allDocs.length === 0 ? (
                <div className="p-10 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-2">
                  <Paperclip className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm text-slate-600">
                    Tidak ada foto atau berkas lampiran yang diunggah
                  </p>
                  <p className="text-xs text-slate-400">
                    Pemohon tidak menyertakan foto dokumen pelengkap pada saat pengajuan surat ini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allDocs.map((doc, idx) => {
                    const isPdf = doc.url.toLowerCase().endsWith('.pdf');
                    return (
                      <div
                        key={idx}
                        className="group relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 shadow-2xs hover:shadow-md transition-all flex flex-col"
                      >
                        {/* Image Preview Container */}
                        <div
                          onClick={() => setLightboxIndex(idx)}
                          className="relative h-48 w-full bg-slate-950 flex items-center justify-center cursor-pointer overflow-hidden"
                        >
                          {isPdf ? (
                            <div className="p-6 text-center space-y-2 text-white">
                              <FileText className="w-12 h-12 text-rose-400 mx-auto" />
                              <span className="text-xs font-bold block">Dokumen Format PDF</span>
                            </div>
                          ) : (
                            <img
                              src={doc.url}
                              alt={doc.nama}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
                              }}
                            />
                          )}

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <span className="px-3 py-1.5 rounded-xl bg-white/90 text-slate-900 font-extrabold text-xs flex items-center gap-1 shadow-md">
                              <ZoomIn className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Klik Perbesar</span>
                            </span>
                          </div>

                          {doc.isKtpProfil && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black shadow-xs">
                              KTP Profil Warga
                            </div>
                          )}
                        </div>

                        {/* Card Info & Actions */}
                        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="font-bold text-slate-900 truncate" title={doc.nama}>
                              {doc.nama}
                            </p>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Lampiran #{idx + 1}
                            </span>
                          </div>

                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition-colors shrink-0"
                            title="Buka di Tab Baru"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Riwayat Disposisi / Tracking */}
          {activeTab === 'tracking' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="font-black text-sm text-slate-900">
                Alur Persetujuan & Disposisi Surat Berjenjang
              </h4>

              {surat.trackings && surat.trackings.length > 0 ? (
                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {surat.trackings.map((tr, idx) => {
                    const isRejectedAction =
                      tr.status_action?.toLowerCase().includes('tolak') ||
                      tr.status_action?.toLowerCase().includes('reject');

                    return (
                      <div key={tr.id || idx} className="relative space-y-1 text-xs">
                        {/* Indicator Dot */}
                        <div
                          className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${
                            isRejectedAction ? 'bg-rose-600' : 'bg-emerald-600'
                          }`}
                        >
                          {isRejectedAction ? (
                            <XCircle className="w-2.5 h-2.5 text-white" />
                          ) : (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">
                            {tr.status_stage || 'Verifikator'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                              isRejectedAction
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {tr.status_action}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px] ml-auto">
                            {new Date(tr.created_at).toLocaleString('id-ID', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>

                        {tr.actor_user && (
                          <div className="text-slate-500 text-[11px]">
                            Petugas: <strong>{tr.actor_user.name}</strong> ({tr.actor_user.role?.name || 'Pengurus'})
                          </div>
                        )}

                        {tr.catatan && (
                          <div
                            className={`p-2.5 rounded-xl border mt-1 leading-relaxed ${
                              isRejectedAction
                                ? 'bg-rose-50/90 border-rose-200 text-rose-900 font-medium'
                                : 'bg-slate-50 border-slate-200/80 text-slate-700'
                            }`}
                          >
                            Catatan: &ldquo;{tr.catatan}&rdquo;
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Belum ada riwayat disposisi tercatat.</p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Quick Actions */}
        <div className="px-5 sm:px-7 pt-4 pb-5 sm:pb-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 safe-bottom">
          {isRejectMode ? (
            <div className="w-full space-y-3 bg-rose-50 p-4 rounded-2xl border border-rose-200 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Isi Catatan / Alasan Penolakan Permohonan</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsRejectMode(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
              </div>

              <textarea
                rows={2}
                value={catatanPenolakan}
                onChange={(e) => setCatatanPenolakan(e.target.value)}
                placeholder="Contoh: Foto KK kurang jelas / NIK pemohon tidak sesuai dengan database RT..."
                className="w-full p-3 rounded-xl border border-rose-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejectMode(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={isProcessing || !catatanPenolakan.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? 'Memproses...' : 'Kirim Penolakan Surat'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={closeWithAnimation}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>

              <div className="w-full sm:w-auto flex items-center justify-end gap-2">
                {surat.status === 'completed' && onPrint && (
                  <button
                    type="button"
                    onClick={() => onPrint(surat)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs transition-all shadow-sm press-down flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Surat Resmi</span>
                  </button>
                )}

                {canReject && (
                  <button
                    type="button"
                    onClick={() => setIsRejectMode(true)}
                    className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-extrabold text-xs transition-colors press-down flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Tolak Permohonan</span>
                  </button>
                )}

                {canApprove && onApprove && (
                  <button
                    type="button"
                    onClick={() => onApprove(surat.id)}
                    disabled={isProcessing}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-md press-down hover-glow flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isProcessing ? 'Memproses...' : finalApproveLabel}</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox Modal (Zoom In Attachment Image) */}
      {lightboxIndex !== null && allDocs[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[1000000] bg-black/95 flex flex-col items-center justify-center p-4 select-none animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxIndex(null);
          }}
        >
          {/* Lightbox Header */}
          <div className="w-full max-w-4xl flex items-center justify-between text-white pb-3 shrink-0">
            <div className="flex items-center gap-2 truncate pr-2">
              <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold text-xs truncate">
                {allDocs[lightboxIndex].nama}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono shrink-0">
                {lightboxIndex + 1} / {allDocs.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={allDocs[lightboxIndex].url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Buka Ukuran Penuh di Tab Baru"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup Preview (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Large Image Box */}
          <div className="relative max-w-4xl w-full flex-1 flex items-center justify-center overflow-hidden">
            <img
              src={allDocs[lightboxIndex].url}
              alt={allDocs[lightboxIndex].nama}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />

            {allDocs.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev !== null && prev > 0 ? prev - 1 : allDocs.length - 1
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-lg"
                  title="Dokumen Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev !== null && prev < allDocs.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-lg"
                  title="Dokumen Selanjutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

