import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  FolderCheck, 
  CreditCard, 
  Users, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  RefreshCw, 
  Upload, 
  Camera, 
  Trash2, 
  Plus, 
  X, 
  ExternalLink,
  ArrowRight,
  Loader2,
  Lock,
  ImageOff
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { CameraUploadModal } from '@/shared/components/CameraUploadModal';
import { getSafeMediaUrl } from '@/shared/utils/mediaUrl';
import { useNavigate } from 'react-router-dom';

interface DokumenKependudukanData {
  warga: {
    nik: string;
    nama_lengkap: string;
    no_kk?: string;
  };
  dokumen: {
    foto_ktp: string | null;
    foto_kk: string | null;
    foto_akta_lahir: string | null;
    foto_buku_nikah: string | null;
    dokumen_tambahan: Array<{
      id: string;
      nama: string;
      url: string;
      catatan?: string;
      uploaded_at?: string;
    }>;
  };
  stats: {
    has_ktp: boolean;
    has_kk: boolean;
    has_akta: boolean;
    has_nikah: boolean;
    total_terunggah: number;
    is_ready_for_letters: boolean;
  };
}

export interface BerkasKependudukanViewProps {
  onApplySurat?: () => void;
}

const DocumentImagePreview: React.FC<{
  url: string;
  title?: string;
  onPreview: (safeUrl: string) => void;
}> = ({ url, title, onPreview }) => {
  const [hasError, setHasError] = useState(false);
  const safeUrl = getSafeMediaUrl(url);

  useEffect(() => {
    setHasError(false);
  }, [url]);

  if (hasError) {
    return (
      <div className="w-full h-full p-4 bg-slate-50 flex flex-col items-center justify-center text-center space-y-1.5 border border-slate-200">
        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shadow-2xs">
          <ImageOff className="w-4 h-4" />
        </div>
        <p className="text-[11px] font-bold text-slate-700">Berkas Tersimpan</p>
        <p className="text-[10px] text-slate-400">Tersimpan aman di arsip database desa</p>
        <button
          type="button"
          onClick={() => onPreview(safeUrl)}
          className="mt-1 px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-600" />
          <span>Buka Berkas</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={safeUrl}
        alt={title || 'Dokumen'}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
        loading="lazy"
      />
      <button
        type="button"
        onClick={() => onPreview(safeUrl)}
        className="absolute bottom-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-800 text-[11px] font-extrabold border border-slate-200/90 shadow-sm flex items-center gap-1.5 cursor-pointer backdrop-blur-xs transition-all hover:scale-105 active:scale-95"
        title="Perbesar Tampilan Dokumen"
      >
        <Eye className="w-3.5 h-3.5 text-emerald-700" />
        <span>Perbesar</span>
      </button>
    </div>
  );
};

export const BerkasKependudukanView: React.FC<BerkasKependudukanViewProps> = ({ onApplySurat }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<DokumenKependudukanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload modal state
  const [activeUploadType, setActiveUploadType] = useState<'ktp' | 'kk' | 'akta' | 'nikah' | 'tambahan' | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadGuideType, setUploadGuideType] = useState<'ktp' | 'dokumen' | 'bebas'>('ktp');
  const [customDocName, setCustomDocName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Lightbox preview state
  const [previewDoc, setPreviewDoc] = useState<{ url: string; title: string } | null>(null);

  // Lock body scroll and listen for ESC key when preview modal is open
  useEffect(() => {
    if (previewDoc) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setPreviewDoc(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = orig;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [previewDoc]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isPdfDoc = (url?: string | null) => {
    if (!url) return false;
    return url.toLowerCase().includes('.pdf');
  };

  const renderThumbnail = (url?: string | null, title?: string, placeholder?: React.ReactNode) => {
    if (!url) return placeholder;
    const safeUrl = getSafeMediaUrl(url);

    if (isPdfDoc(url)) {
      return (
        <div className="w-full h-full p-4 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-center space-y-2 border border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Format Dokumen
            </span>
            <p className="text-[11px] font-bold text-slate-700 mt-1 truncate max-w-[180px]">
              Tersimpan di Database Desa
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreviewDoc({ url: safeUrl, title: title || 'Dokumen' })}
            className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-extrabold border border-slate-200 shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lihat Berkas</span>
          </button>
        </div>
      );
    }

    return (
      <DocumentImagePreview
        url={safeUrl}
        title={title}
        onPreview={(targetUrl) => setPreviewDoc({ url: targetUrl, title: title || 'Dokumen' })}
      />
    );
  };

  const fetchDokumen = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/warga/dokumen');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat berkas kependudukan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDokumen();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenUpload = (tipe: 'ktp' | 'kk' | 'akta' | 'nikah' | 'tambahan', title: string, guide: 'ktp' | 'dokumen' | 'bebas' = 'dokumen') => {
    setActiveUploadType(tipe);
    setUploadTitle(title);
    setUploadGuideType(guide);
  };

  const handleSaveUploadedFile = async (base64: string, fileName?: string) => {
    if (!activeUploadType) return;
    try {
      setIsUploading(true);
      const payload: any = {
        tipe: activeUploadType,
        file_data: base64,
      };

      if (activeUploadType === 'tambahan') {
        payload.nama_dokumen = customDocName.trim() || fileName || 'Dokumen Tambahan';
      }

      const res = await api.post('/warga/dokumen', payload);
      if (res.data.success) {
        showToast(res.data.message || 'Berkas berhasil disimpan!');
        setActiveUploadType(null);
        setCustomDocName('');
        fetchDokumen();
      }
    } catch (err: any) {
      alert('Gagal menyimpan berkas: ' + (err.response?.data?.message || 'Terjadi kesalahan'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDokumen = async (tipeOrId: string, label: string) => {
    if (!confirm(`Hapus berkas ${label} dari database kependudukan?`)) return;
    try {
      const res = await api.delete(`/warga/dokumen/${tipeOrId}`);
      if (res.data.success) {
        showToast(`Berkas ${label} berhasil dihapus.`);
        fetchDokumen();
      }
    } catch (err: any) {
      alert('Gagal menghapus berkas: ' + (err.response?.data?.message || 'Terjadi kesalahan'));
    }
  };

  if (loading) {
    return (
      <div className="card-surface p-12 text-center space-y-3 font-sans animate-fade-in">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Memuat berkas master kependudukan Anda...</p>
      </div>
    );
  }

  const doc = data?.dokumen;
  const stats = data?.stats;

  return (
    <div className="space-y-6 page-enter font-sans max-w-6xl mx-auto">
      
      {/* Toast Notification */}
      {toastMessage && createPortal(
        <div className="fixed top-5 right-5 z-[9999999] bg-emerald-950/90 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-400/40 backdrop-blur-md flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>,
        document.body
      )}

      {/* Header Banner: Solusi Cukup Sekali Upload (Clean White & Emerald Accent) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] font-black">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Master Berkas Kependudukan Terpadu</span>
          </div>

          <div className="max-w-2xl space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Cukup Upload Sekali, Otomatis untuk Semua Surat Desa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Foto KTP, Kartu Keluarga, dan berkas identitas Anda tersimpan aman di database arsip Desa Doko. Setiap kali Anda mengajukan surat apapun (SKTM, Domisili, SKU, dll.), sistem <strong className="text-slate-800 font-extrabold">otomatis melampirkan berkas resmi Anda</strong> tanpa perlu repot upload berulang kali.
            </p>
          </div>

          {/* Quick stats & verification badge */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono text-xs flex items-center gap-2 shadow-2xs">
              <span className="text-emerald-700 font-bold">NIK:</span>
              <span className="font-extrabold text-slate-900">{data?.warga.nik}</span>
            </div>
            {data?.warga.no_kk && (
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono text-xs flex items-center gap-2 shadow-2xs">
                <span className="text-emerald-700 font-bold">No. KK:</span>
                <span className="font-extrabold text-slate-900">{data.warga.no_kk}</span>
              </div>
            )}
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{stats?.total_terunggah || 0} Berkas Tersimpan</span>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onApplySurat) {
                  onApplySurat();
                } else {
                  navigate('/dashboard/ajukan');
                }
              }}
              className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all shadow-xs cursor-pointer press-down"
            >
              <span>Ajukan Surat Langsung</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Master Documents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Dokumen Identitas Wajib (KTP & Kartu Keluarga)
            </h3>
            <p className="text-xs text-slate-500">
              Dokumen utama yang paling sering disyaratkan untuk pengajuan surat resmi desa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* 1. KTP ELEKTRONIK */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">KTP Elektronik (e-KTP)</h4>
                    <p className="text-[11px] text-slate-400">Identitas utama pemohon</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  doc?.foto_ktp 
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' 
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {doc?.foto_ktp ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <AlertCircle className="w-3 h-3 text-amber-700" />}
                  <span>{doc?.foto_ktp ? 'Tersimpan di Desa' : 'Belum Diunggah'}</span>
                </span>
              </div>

              {/* Photo Preview or Placeholder */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-[16/10] flex items-center justify-center">
                {renderThumbnail(
                  doc?.foto_ktp,
                  'KTP Elektronik',
                  <div className="text-center p-6 space-y-2">
                    <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Foto KTP belum diunggah</p>
                    <p className="text-[10px] text-slate-400">Unggah sekali agar otomatis terlampir saat ajukan surat.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleOpenUpload('ktp', 'Ambil / Unggah Foto KTP', 'ktp')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer press-down"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{doc?.foto_ktp ? 'Ganti Foto KTP' : 'Upload KTP Sekarang'}</span>
              </button>
              {doc?.foto_ktp && (
                <button
                  type="button"
                  onClick={() => handleDeleteDokumen('ktp', 'KTP')}
                  className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Hapus KTP dari Database"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 2. KARTU KELUARGA (KK) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Kartu Keluarga (KK)</h4>
                    <p className="text-[11px] text-slate-400">Bukti susunan keluarga resmi</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  doc?.foto_kk 
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' 
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}>
                  {doc?.foto_kk ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <AlertCircle className="w-3 h-3 text-amber-700" />}
                  <span>{doc?.foto_kk ? 'Tersimpan di Desa' : 'Belum Diunggah'}</span>
                </span>
              </div>

              {/* Photo Preview or Placeholder */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-[16/10] flex items-center justify-center">
                {renderThumbnail(
                  doc?.foto_kk,
                  'Kartu Keluarga',
                  <div className="text-center p-6 space-y-2">
                    <Users className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Foto KK belum diunggah</p>
                    <p className="text-[10px] text-slate-400">Dokumen KK otomatis dilampirkan ke surat pengantar RT & Desa.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleOpenUpload('kk', 'Ambil / Unggah Foto Kartu Keluarga', 'dokumen')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer press-down"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{doc?.foto_kk ? 'Ganti Foto KK' : 'Upload KK Sekarang'}</span>
              </button>
              {doc?.foto_kk && (
                <button
                  type="button"
                  onClick={() => handleDeleteDokumen('kk', 'Kartu Keluarga')}
                  className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Hapus KK dari Database"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dokumen Pelengkap Tambahan */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Dokumen Tambahan & Khusus (Akta, Buku Nikah, dll.)
            </h3>
            <p className="text-xs text-slate-500">
              Dokumen opsional yang sering dibutuhkan untuk permohonan akta, nikah, waris, atau bantuan sosial.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Akta Lahir */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Akta Kelahiran</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  doc?.foto_akta_lahir ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {doc?.foto_akta_lahir ? 'Tersimpan' : 'Opsional'}
                </span>
              </div>
              <div className="h-32 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                {renderThumbnail(
                  doc?.foto_akta_lahir,
                  'Akta Kelahiran',
                  <span className="text-[11px] text-slate-400">Belum diunggah</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenUpload('akta', 'Upload Akta Kelahiran', 'dokumen')}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              {doc?.foto_akta_lahir ? 'Ganti Akta' : 'Upload Akta'}
            </button>
          </div>

          {/* Buku Nikah */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Buku / Akta Nikah</span>
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  doc?.foto_buku_nikah ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {doc?.foto_buku_nikah ? 'Tersimpan' : 'Opsional'}
                </span>
              </div>
              <div className="h-32 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                {renderThumbnail(
                  doc?.foto_buku_nikah,
                  'Buku Nikah',
                  <span className="text-[11px] text-slate-400">Belum diunggah</span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenUpload('nikah', 'Upload Buku Nikah', 'dokumen')}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              {doc?.foto_buku_nikah ? 'Ganti Buku Nikah' : 'Upload Buku Nikah'}
            </button>
          </div>

          {/* Dokumen Bebas Lainnya */}
          <div className="p-5 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-300 hover:border-emerald-400 transition-colors flex flex-col justify-between items-center text-center space-y-3 p-6">
            <div className="space-y-1">
              <Plus className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-xs font-black text-slate-900">Dokumen Custom / Tambahan</h4>
              <p className="text-[11px] text-slate-500">Ijazah, Surat Kematian, NPWP, atau berkas pendukung lainnya.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenUpload('tambahan', 'Tambah Dokumen Lainnya', 'dokumen')}
              className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition-all cursor-pointer press-down"
            >
              + Tambah Dokumen Baru
            </button>
          </div>
        </div>

        {/* List of Custom Uploaded Documents */}
        {doc?.dokumen_tambahan && doc.dokumen_tambahan.length > 0 && (
          <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Dokumen Tambahan Tersimpan ({doc.dokumen_tambahan.length}):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {doc.dokumen_tambahan.map((item) => {
                const isPdf = item.nama?.toLowerCase().endsWith('.pdf') || item.url?.toLowerCase().endsWith('.pdf');
                return (
                  <div key={item.id} className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all flex items-center justify-between gap-2">
                    <div 
                      onClick={() => setPreviewDoc({ url: item.url, title: item.nama })}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 overflow-hidden shrink-0 border border-emerald-100 flex items-center justify-center">
                        {isPdf ? (
                          <FileText className="w-5 h-5 text-emerald-700" />
                        ) : (
                          <img 
                            src={item.url} 
                            alt={item.nama} 
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <div className="min-w-0 truncate">
                        <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">{item.nama}</div>
                        <div className="text-[10px] text-slate-400">Klik untuk melihat</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDokumen(item.id, item.nama)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                      title="Hapus Dokumen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Reusable Camera & File Upload Modal */}
      {activeUploadType && (
        <CameraUploadModal
          isOpen={true}
          onClose={() => {
            setActiveUploadType(null);
            setCustomDocName('');
          }}
          initialMode="camera"
          title={uploadTitle}
          description="Posisikan dokumen kependudukan Anda di dalam bingkai kamera agar teks dan data terlihat tajam."
          guideType={uploadGuideType}
          onCapture={(base64, fileName) => handleSaveUploadedFile(base64, fileName)}
        />
      )}

      {/* Lightbox / Document Preview Modal - Mounted to body via createPortal, perfectly centered on screen */}
      {previewDoc && createPortal(
        <div 
          className="fixed inset-0 z-[9999999] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in font-sans"
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-3xl w-full max-h-[90vh] flex flex-col space-y-4 border border-slate-200 shadow-2xl animate-scale-up my-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <span className="text-sm font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Pratinjau Dokumen: {previewDoc.title}</span>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Tab Baru</span>
                </a>
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
                  title="Tutup (ESC)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center min-h-[350px]">
              {isPdfDoc(previewDoc.url) ? (
                <iframe 
                  src={previewDoc.url} 
                  title={previewDoc.title} 
                  className="w-full h-[65vh] rounded-2xl border-0"
                />
              ) : (
                <img 
                  src={previewDoc.url} 
                  alt={previewDoc.title} 
                  className="w-full h-full object-contain max-h-[70vh] rounded-xl" 
                />
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
