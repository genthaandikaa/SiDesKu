import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Search, 
  ShieldCheck, 
  FileCheck2, 
  AlertCircle, 
  Loader2, 
  Calendar, 
  User, 
  Building2, 
  CheckCircle2, 
  Clock, 
  FileText,
  Camera,
  Image as ImageIcon,
  RotateCw,
  Zap,
  ZapOff,
  Sparkles,
  RefreshCw,
  QrCode
} from 'lucide-react';
import jsQR from 'jsqr';
import api from '@/shared/lib/axios';
import { SuratRequest, DesaSetting } from '@/shared/types';

interface QrVerificationModalProps {
  hash?: string;
  onClose: () => void;
}

export const QrVerificationModal: React.FC<QrVerificationModalProps> = ({ hash, onClose }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'photo' | 'manual'>('camera');
  const [searchHash, setSearchHash] = useState(hash || '');
  const [loading, setLoading] = useState(false);
  const [surat, setSurat] = useState<SuratRequest | null>(null);
  const [desa, setDesa] = useState<DesaSetting | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [recentSurats, setRecentSurats] = useState<SuratRequest[]>([]);

  // Camera Scanner States & Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const directMobileCameraRef = useRef<HTMLInputElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Lock body scroll and handle ESC key
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopCamera();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Helper to extract clean query/hash from any QR code content (URL, params, or raw hash)
  const extractHashFromQr = (qrRaw: string): string => {
    const trimmed = qrRaw.trim();
    try {
      // Check if it is a valid URL
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        const url = new URL(trimmed);
        const hashParam = url.searchParams.get('hash') || url.searchParams.get('data') || url.searchParams.get('resi');
        if (hashParam) return hashParam;

        const pathSegments = url.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          return pathSegments[pathSegments.length - 1];
        }
      }
    } catch {
      // Not a standard URL, fallback to raw parsing
    }

    if (trimmed.includes('hash=')) {
      const match = trimmed.match(/hash=([^&]+)/);
      if (match) return match[1];
    }

    return trimmed;
  };

  // Perform backend verification
  const handleVerify = async (queryHash: string) => {
    const cleanHash = extractHashFromQr(queryHash);
    if (!cleanHash) return;
    
    stopCamera();
    setLoading(true);
    setError(null);
    setSurat(null);
    setDesa(null);
    
    try {
      const res = await api.get(`/public/surat/verify-qr/${encodeURIComponent(cleanHash)}`);
      if (res.data.success && res.data.data) {
        setSurat(res.data.data);
        if (res.data.desa) setDesa(res.data.desa);
      } else {
        setError(res.data.message || 'Dokumen tidak ditemukan atau tanda tangan tidak sah.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Dokumen tidak valid atau tanda tangan digital tidak terdaftar di database Pemdes Doko.');
    } finally {
      setLoading(false);
    }
  };

  // Start Live Camera
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setCameraActive(false);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Browser HP memblokir live webcam karena koneksi lokal belum HTTPS. Gunakan tombol "Buka Kamera HP & Jepret" di bawah untuk memindai secara instan!'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);

        // Check torch capability
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.() as any;
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        } else {
          setHasTorch(false);
        }
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError' 
          ? 'Izin kamera ditolak. Silakan izinkan akses kamera di browser HP Anda.' 
          : 'Kamera langsung tidak dapat diakses (koneksi HTTP lokal). Gunakan tombol "Buka Kamera HP & Jepret" di bawah.'
      );
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  // Toggle Camera Flash/Torch
  const toggleTorch = async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      try {
        const nextTorch = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextTorch }],
        });
        setTorchOn(nextTorch);
      } catch {
        // Torch not supported
      }
    }
  };

  // Flip Camera Front/Back
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Camera continuous scan frame loop
  useEffect(() => {
    let animId: number;
    let isScanning = true;

    const scanFrame = () => {
      if (!isScanning) return;

      if (
        cameraActive &&
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
        canvasRef.current
      ) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data && code.data.trim() !== '') {
            isScanning = false;
            // Highlight frame feedback
            handleVerify(code.data);
            return;
          }
        }
      }

      animId = requestAnimationFrame(scanFrame);
    };

    if (cameraActive && activeTab === 'camera' && !surat) {
      animId = requestAnimationFrame(scanFrame);
    }

    return () => {
      isScanning = false;
      cancelAnimationFrame(animId);
    };
  }, [cameraActive, activeTab, surat]);

  // Tab & Camera lifecycle
  useEffect(() => {
    if (activeTab === 'camera' && !surat) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, facingMode, surat]);

  // Initial load
  useEffect(() => {
    if (hash && hash.trim() !== '') {
      setSearchHash(hash);
      handleVerify(hash);
    } else {
      // Load recent documents for 1-click test
      api.get('/public/surat/track')
        .then((res) => {
          if (res.data.success && res.data.data) {
            setRecentSurats(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [hash]);

  const [isDecodingPhoto, setIsDecodingPhoto] = useState(false);

  // Multi-Engine QR Decoder from Image (BarcodeDetector + Multi-scale jsQR downsampling)
  const decodeQrFromImage = async (img: HTMLImageElement): Promise<string | null> => {
    // Strategy 1: Native BarcodeDetector (Hardware Accelerated on Android/iOS)
    if ('BarcodeDetector' in window) {
      try {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
        const results = await detector.detect(img);
        if (results && results.length > 0 && results[0].rawValue) {
          return results[0].rawValue;
        }
      } catch (e) {
        console.warn('BarcodeDetector error, fallback to multi-scale canvas:', e);
      }
    }

    // Strategy 2: Multi-Scale Downsampling Canvas with jsQR
    // Phone cameras take 4000x3000px photos which break single-scale decoders. We downsample systematically:
    const targetScales = [1200, 800, 600, 1600];
    const originalMax = Math.max(img.width, img.height);
    
    for (const maxDim of targetScales) {
      const scale = originalMax > maxDim ? maxDim / originalMax : 1.0;
      const targetW = Math.round(img.width * scale);
      const targetH = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) continue;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // Attempt 1: Standard RGBA decoding
      const imageData = ctx.getImageData(0, 0, targetW, targetH);
      let code = jsQR(imageData.data, targetW, targetH, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data && code.data.trim() !== '') {
        return code.data;
      }

      // Attempt 2: High Contrast Adaptive Grayscale Thresholding
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        const val = avg > 128 ? 255 : 0;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      ctx.putImageData(imageData, 0, 0);
      code = jsQR(data, targetW, targetH, {
        inversionAttempts: 'attemptBoth',
      });
      if (code && code.data && code.data.trim() !== '') {
        return code.data;
      }
    }

    return null;
  };

  // Handle Photo Upload & QR Decode
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);
    setPhotoPreview(null);
    setIsDecodingPhoto(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoPreview(dataUrl);

      const img = new Image();
      img.src = dataUrl;
      img.onload = async () => {
        try {
          const qrData = await decodeQrFromImage(img);
          if (qrData) {
            setIsDecodingPhoto(false);
            handleVerify(qrData);
          } else {
            setIsDecodingPhoto(false);
            setPhotoError(
              'QR Code tidak terdeteksi pada foto ini. Pastikan foto QR tampak utuh, terang, dan tidak tertutup bayangan tebal.'
            );
          }
        } catch {
          setIsDecodingPhoto(false);
          setPhotoError('Terjadi kesalahan saat memproses gambar.');
        }
      };
      img.onerror = () => {
        setIsDecodingPhoto(false);
        setPhotoError('Gagal membaca file gambar dari perangkat.');
      };
    };
    reader.readAsDataURL(file);
  };

  const onSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(searchHash);
  };

  const resetToScanAgain = () => {
    setSurat(null);
    setError(null);
    setPhotoError(null);
    setPhotoPreview(null);
    setIsDecodingPhoto(false);
    setActiveTab('camera');
  };

  const w = surat?.warga_profile;

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 animate-fade-in bg-slate-950/75 font-sans overflow-y-auto select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopCamera();
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-scale-up border border-slate-200 flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Hidden Canvas for QR video frame decoding */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-600 text-white shadow-2xs">
                  Petugas Desa / Admin
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Pemdes Doko</span>
              </div>
              <h3 className="font-black text-sm text-slate-900 leading-tight mt-0.5">
                Pemindai QR & Uji Keabsahan Surat Resmi
              </h3>
            </div>
          </div>
          <button 
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Tutup (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs (Only shown when not showing verified result) */}
        {!surat && !loading && (
          <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'camera'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Kamera Langsung</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('photo')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'photo'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Scan dari Foto / Berkas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cari Manual / Arsip</span>
            </button>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: LIVE CAMERA SCANNER */}
          {activeTab === 'camera' && !surat && !loading && (
            <div className="space-y-4">
              <div className="relative w-full aspect-4/3 sm:aspect-16/10 bg-slate-950 rounded-3xl overflow-hidden shadow-inner border-2 border-emerald-500/80 flex items-center justify-center">
                
                {/* Live Video Feed */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />

                {/* Laser Scanning Overlay & Viewfinder Reticle */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                    {/* Viewfinder Target Box */}
                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-emerald-400/90 rounded-3xl shadow-2xl bg-emerald-950/10 backdrop-blur-[1px] flex items-center justify-center">
                      {/* Corner Target Markers */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                      {/* Moving Red/Green Laser Line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse" />
                    </div>

                    <div className="mt-4 px-3 py-1.5 rounded-full bg-slate-950/80 text-emerald-300 text-[11px] font-bold tracking-wide backdrop-blur-md shadow-md border border-emerald-500/30">
                      ⚡ Mengarahkan kamera ke QR Code...
                    </div>
                  </div>
                )}

                {/* Hidden input for Native Mobile Direct Camera Shutter */}
                <input
                  ref={directMobileCameraRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                {/* Error Fallback in Camera */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/95 p-6 flex flex-col items-center justify-center text-center text-white space-y-3 z-30">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                      <Camera className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-black text-white">Mode Kamera Handphone</h4>
                    <p className="text-xs text-slate-300 max-w-xs leading-relaxed">{cameraError}</p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 w-full max-w-xs">
                      <button
                        type="button"
                        onClick={() => directMobileCameraRef.current?.click()}
                        className="w-full px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer press-down"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Buka Kamera HP & Jepret QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('photo')}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Pilih Foto dari Galeri</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Camera Control Toolbar (Flip & Flashlight) */}
                {cameraActive && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20">
                    {hasTorch && (
                      <button
                        type="button"
                        onClick={toggleTorch}
                        className={`p-2.5 rounded-2xl backdrop-blur-md text-white border transition-colors cursor-pointer ${
                          torchOn ? 'bg-amber-500 border-amber-300' : 'bg-slate-900/80 border-slate-700 hover:bg-slate-800'
                        }`}
                        title="Senter / Flashlight"
                      >
                        {torchOn ? <Zap className="w-4 h-4 text-white" /> : <ZapOff className="w-4 h-4" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={flipCamera}
                      className="p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md text-white border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Balik Kamera Depan / Belakang"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Instant Mobile Direct Capture Action Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => directMobileCameraRef.current?.click()}
                  className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-emerald-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>Jepret QR Kamera HP</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('photo')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  <span>Unggah Gambar / Galeri</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SCAN DARI FOTO / BERKAS GAMBAR */}
          {activeTab === 'photo' && !surat && !loading && (
            <div className="space-y-4">
              <label className="block p-8 rounded-3xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 transition-all text-center cursor-pointer space-y-3 group">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs text-emerald-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">
                    Pilih atau Seret Foto Dokumen Ber-QR
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Mendukung format PNG, JPG, JPEG, WEBP langsung dari galeri atau berkas komputer/HP.
                  </p>
                </div>
                <span className="inline-block px-4 py-2 rounded-xl bg-emerald-700 text-white font-extrabold text-xs shadow-xs group-hover:bg-emerald-800 transition-colors">
                  Jelajahi File Foto...
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {photoPreview && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 animate-fade-in">
                  <img
                    src={photoPreview}
                    alt="Preview Unggahan"
                    className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-200 shrink-0"
                  />
                  <div className="text-xs text-slate-600">
                    <div className="font-black text-slate-900 flex items-center gap-2">
                      <span>Foto Berhasil Diunggah</span>
                      {isDecodingPhoto && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {isDecodingPhoto ? '🔍 Sedang mendeteksi & mendekode matriks QR Code...' : 'Pemindaian selesai.'}
                    </div>
                  </div>
                </div>
              )}

              {photoError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{photoError}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MANUAL INPUT & 1-CLICK SELECT */}
          {activeTab === 'manual' && !surat && !loading && (
            <div className="space-y-4">
              <form onSubmit={onSubmitManual} className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Ketik Kode Resi / Hash SHA-256 Surat
                </label>
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    value={searchHash}
                    onChange={(e) => setSearchHash(e.target.value)}
                    placeholder="Contoh: REQ-20260818-XXX atau Kode Hash..."
                    className="w-full pl-10 pr-24 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={loading || !searchHash.trim()}
                    className="absolute right-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    Verifikasi
                  </button>
                </div>
              </form>

              {/* 1-Click Selectable List of Recent Village Letters */}
              {recentSurats.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <div className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Arsip Dokumen Terdaftar:</span>
                    <span className="text-[10px] text-emerald-700 font-bold">1-Klik Uji Langsung</span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {recentSurats.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSearchHash(item.nomor_resi);
                          handleVerify(item.nomor_resi);
                        }}
                        className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between group shadow-2xs"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <div className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-800 truncate">
                            {item.surat_type?.nama_surat}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {item.warga_profile?.nama_lengkap} • <span className="font-mono font-bold text-slate-700">{item.nomor_resi}</span>
                          </div>
                        </div>

                        <span className="shrink-0 text-[11px] font-extrabold text-emerald-700 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          Uji Sah →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-3 animate-fade-in">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
              <p className="text-sm font-extrabold text-slate-900">Memverifikasi Tanda Tangan Digital...</p>
              <p className="text-[11px] text-slate-400 font-mono">Mengecek integritas kriptografi SHA-256 pada register desa</p>
            </div>
          )}

          {/* ERROR VERIFICATION STATE */}
          {error && !loading && (
            <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 flex flex-col items-center text-center space-y-3 animate-scale-up">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-rose-950">Dokumen Tidak Sah / Palsu</h4>
              <p className="text-xs text-rose-800 leading-relaxed max-w-sm">{error}</p>
              <button
                type="button"
                onClick={resetToScanAgain}
                className="mt-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Scan Dokumen Lain
              </button>
            </div>
          )}

          {/* VERIFIED SUCCESSFUL DOCUMENT STATE */}
          {surat && !loading && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Authenticity Certificate Header Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-[#ecf8f2] to-emerald-50 border-2 border-emerald-400 flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-white p-1.5 border border-emerald-200 flex items-center justify-center shrink-0 shadow-xs">
                    <img 
                      src="/images/logo-kediri.png" 
                      alt="Kediri Shield" 
                      className="w-full h-full object-contain filter contrast-125"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/images/Kediri.png';
                      }}
                    />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-black text-[10px] uppercase shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dokumen Terverifikasi Sah</span>
                    </div>
                    <h4 className="font-black text-sm text-emerald-950 mt-1">
                      Terdaftar di Buku Register Arsip Desa
                    </h4>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Pemerintah Desa Doko • Kec. Ngasem, Kab. Kediri
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Tanda Tangan QR:</div>
                  <div className="text-xs font-mono font-black text-emerald-900">VALID ASLI</div>
                </div>
              </div>

              {/* Document Details Grid */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 space-y-3.5 text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Jenis Surat Resmi</span>
                    <div className="font-black text-slate-900 text-sm mt-0.5">{surat.surat_type?.nama_surat}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Nomor Registrasi Desa</span>
                    <div className="font-mono font-bold text-emerald-800 text-xs mt-0.5">
                      {surat.nomor_surat_resmi || surat.nomor_resi}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Nama Pemohon:</span>
                    <span className="font-black text-slate-900 uppercase">{w?.nama_lengkap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">NIK Pemohon:</span>
                    <span className="font-mono font-bold text-slate-800">{w?.nik}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Wilayah RT / RW:</span>
                    <span className="font-bold text-slate-800">RT 01 / RW 01 Dusun Krajan</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Keperluan:</span>
                    <span className="font-medium text-slate-800 text-right max-w-[240px] truncate">{surat.keperluan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Pejabat Pengesah:</span>
                    <span className="font-bold text-emerald-900">{desa?.nama_sekdes || 'Ahmad Fauzi, S.Kom'} (Sekretaris Desa)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Tanggal Pengesahan:</span>
                    <span className="font-bold text-slate-800">
                      {new Date(surat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Verification Hash Stamp */}
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono break-all bg-white p-2.5 rounded-2xl border border-slate-200">
                  <div className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Hash Integritas Kriptografi (SHA-256):</div>
                  <div className="text-emerald-800 font-bold">{surat.qr_verification_hash}</div>
                </div>

              </div>

              {/* Audit Timeline */}
              {surat.trackings && surat.trackings.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Jejak Riwayat Verifikasi Berjenjang
                  </div>
                  <div className="space-y-2">
                    {surat.trackings.map((t, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-black text-slate-900">{t.status_stage}</span>
                            <span className="text-slate-500 text-[11px] ml-1.5">• {t.status_action}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{new Date(t.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          {surat ? (
            <button
              type="button"
              onClick={resetToScanAgain}
              className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Pindai Surat Lain</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 font-mono">
              Mode: {activeTab === 'camera' ? 'Kamera Realtime' : activeTab === 'photo' ? 'File Foto' : 'Cari Arsip'}
            </div>
          )}

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors shadow-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
