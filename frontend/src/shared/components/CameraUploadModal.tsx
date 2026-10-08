import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Camera, 
  RefreshCw, 
  X, 
  Check, 
  Upload, 
  Image as ImageIcon, 
  Eye, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  FlipHorizontal
} from 'lucide-react';

interface CameraUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string, fileName?: string) => void;
  title?: string;
  description?: string;
  guideType?: 'ktp' | 'dokumen' | 'bebas';
  initialMode?: 'camera' | 'upload';
}

export const CameraUploadModal: React.FC<CameraUploadModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Ambil Foto Dokumen / KTP',
  description = 'Posisikan KTP atau dokumen Anda di dalam area bingkai panduan agar data terbaca jelas.',
  guideType = 'ktp',
  initialMode = 'camera',
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>(initialMode);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [flashAnimation, setFlashAnimation] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Check multiple cameras (e.g. front & back on smartphone)
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        if (videoDevices.length > 1) {
          setHasMultipleCameras(true);
        }
      }).catch(() => {});
    }
  }, []);

  // Stop camera helper with stable reference (avoids re-triggering effects)
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStream(null);
  }, []);

  // Start live camera stream with fallback constraints
  const startCamera = useCallback(async (desiredFacing: 'user' | 'environment') => {
    // Stop any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Peramban atau jaringan tidak mendukung akses kamera langsung (WebRTC). Silakan gunakan opsi pilih dari galeri berkas atau kamera HP.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: desiredFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (firstErr) {
        console.warn('Initial camera constraint failed, retrying with basic video: true', firstErr);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn('Video play error:', e));
        };
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let msg = 'Tidak dapat mengakses kamera perangkat.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Izin akses kamera ditolak oleh browser. Silakan klik ikon gembok di address bar untuk mengizinkan kamera atau pilih berkas dari galeri.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Kamera tidak ditemukan pada perangkat ini. Silakan pilih berkas foto dari galeri.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi lain atau pilih berkas dari galeri.';
      }
      setCameraError(msg);
      setMode('upload');
    }
  }, []);

  // Sync cameraStream to videoRef when mode or stream updates
  useEffect(() => {
    if (mode === 'camera' && videoRef.current && cameraStream) {
      if (videoRef.current.srcObject !== cameraStream) {
        videoRef.current.srcObject = cameraStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn('Video play error:', e));
        };
      }
    }
  }, [cameraStream, mode]);

  // Handle open/close modal lifecycle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          stopCameraStream();
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      const targetMode = initialMode || 'camera';
      setMode(targetMode);
      setCapturedImage(null);
      setCameraError(null);

      if (targetMode === 'camera') {
        startCamera(facingMode);
      }

      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        stopCameraStream();
      };
    } else {
      stopCameraStream();
    }
  }, [isOpen, initialMode, facingMode, startCamera, stopCameraStream, onClose]);

  // Toggle camera direction (front / back)
  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Compression helper
  const compressCanvasToJpeg = (canvas: HTMLCanvasElement, quality = 0.75): string => {
    return canvas.toDataURL('image/jpeg', quality);
  };

  // Capture photo from video stream
  const handleShutter = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);
    setFlashAnimation(true);

    setTimeout(() => {
      setFlashAnimation(false);
      try {
        const video = videoRef.current;
        if (!video) return;

        const canvas = document.createElement('canvas');
        const videoWidth = video.videoWidth || 640;
        const videoHeight = video.videoHeight || 480;

        // Max dimension cap for fast upload (< 100KB)
        const maxDim = 1024;
        let finalWidth = videoWidth;
        let finalHeight = videoHeight;

        if (finalWidth > maxDim || finalHeight > maxDim) {
          if (finalWidth > finalHeight) {
            finalHeight = Math.round((finalHeight * maxDim) / finalWidth);
            finalWidth = maxDim;
          } else {
            finalWidth = Math.round((finalWidth * maxDim) / finalHeight);
            finalHeight = maxDim;
          }
        }

        canvas.width = finalWidth;
        canvas.height = finalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, finalWidth, finalHeight);
          const dataUrl = compressCanvasToJpeg(canvas, 0.72);
          setCapturedImage(dataUrl);
          stopCameraStream();
        }
      } catch (e) {
        console.error('Shutter error:', e);
      } finally {
        setIsCapturing(false);
      }
    }, 150);
  };

  // Handle file picker selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.src = result;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 1280;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = compressCanvasToJpeg(canvas, 0.78);
            setCapturedImage(compressedDataUrl);
          } else {
            setCapturedImage(result);
          }
        } catch {
          setCapturedImage(result);
        }
      };
      img.onerror = () => {
        setCapturedImage(result);
      };
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    if (mode === 'camera') {
      startCamera(facingMode);
    }
  };

  // Confirm and submit image
  const handleConfirmImage = () => {
    if (capturedImage) {
      onCapture(capturedImage, `dokumen_${Date.now()}.jpg`);
      stopCameraStream();
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[999999] bg-slate-950/75 flex items-center justify-center p-3 sm:p-4 font-sans animate-fade-in overflow-y-auto select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopCameraStream();
          onClose();
        }
      }}
    >
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">SiDesKu Media & Document Capture</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Mode Switcher Tabs */}
          {!capturedImage && (
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setMode('camera');
                  startCamera(facingMode);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'camera' 
                    ? 'bg-white text-emerald-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Kamera Langsung</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setMode('upload');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'upload' 
                    ? 'bg-white text-emerald-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih dari Berkas / Galeri</span>
              </button>
            </div>
          )}

          {/* Description / Instructions */}
          {!capturedImage && (
            <div className="flex items-start gap-2 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-[11px] text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* Camera Error Message */}
          {cameraError && mode === 'camera' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Akses Kamera Belum Tersedia</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600">{cameraError}</p>
              <button
                type="button"
                onClick={() => setMode('upload')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
              >
                Gunakan Unggah File Sebagai Gantinya
              </button>
            </div>
          )}

          {/* Live Camera Viewfinder */}
          {mode === 'camera' && !capturedImage && !cameraError && (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Shutter Flash Animation */}
              {flashAnimation && (
                <div className="absolute inset-0 bg-white opacity-80 animate-pulse pointer-events-none" />
              )}

              {/* ID Card Alignment Guide Box Overlay */}
              {guideType === 'ktp' && (
                <div className="absolute inset-4 sm:inset-6 border-2 border-dashed border-emerald-400/90 rounded-2xl pointer-events-none flex flex-col justify-between p-3 bg-emerald-950/10">
                  <div className="flex justify-between items-center text-[10px] font-black text-emerald-300 drop-shadow-md">
                    <span>🪪 Area Pas KTP</span>
                    <span>16 Digit NIK</span>
                  </div>
                  <div className="text-center text-[10px] text-emerald-200/90 font-medium drop-shadow-md bg-black/40 px-2 py-1 rounded-md self-center">
                    Pastikan foto & tulisan tidak buram
                  </div>
                </div>
              )}

              {/* Floating Camera Controls on Video */}
              <div className="absolute bottom-3 left-0 right-0 px-4 flex items-center justify-between z-10">
                {hasMultipleCameras ? (
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer"
                    title="Ganti Kamera Depan/Belakang"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="w-9" />
                )}

                {/* Shutter Button */}
                <button
                  type="button"
                  onClick={handleShutter}
                  disabled={isCapturing}
                  className="w-14 h-14 rounded-full bg-white p-1 shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-4 border-emerald-500 hover:border-emerald-400"
                  title="Jepret Foto"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                    <Camera className="w-5 h-5" />
                  </div>
                </button>

                <div className="w-9" />
              </div>
            </div>
          )}

          {/* Upload from Gallery / Files */}
          {mode === 'upload' && !capturedImage && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-emerald-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">
                    Pilih Foto dari Galeri / Berkas Perangkat
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Format file JPG, JPEG, PNG, atau WEBP (Maks. 5 MB)
                  </p>
                </div>
              </div>

              {/* Action Buttons: Explicit Gallery vs Device Camera */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 px-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer press-down"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Buka Galeri Foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer press-down"
                >
                  <Camera className="w-4 h-4" />
                  <span>Kamera Bawaan HP</span>
                </button>
              </div>

              {/* Standard File Picker (Opens Gallery/Files without forcing camera) */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Native Mobile Camera Fallback (Direct camera capture for mobile phones) */}
              <input
                ref={nativeCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Real-time Preview Captured Photo */}
          {capturedImage && (
            <div className="space-y-3 animate-scale-up">
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-md bg-slate-950 aspect-4/3 flex items-center justify-center">
                <img
                  src={capturedImage}
                  alt="Pratinjau Hasil Kamera"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1 shadow-md">
                  <Check className="w-3 h-3" />
                  <span>Foto Berhasil Diambil</span>
                </div>
              </div>

              {/* Retake or Confirm Action Bar */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ambil Ulang (Retake)</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImage}
                  className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer hover-glow press-down"
                >
                  <Check className="w-4 h-4" />
                  <span>Gunakan Foto Ini</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>🔒 Privasi Terjaga • Terenkripsi Otomatis</span>
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
