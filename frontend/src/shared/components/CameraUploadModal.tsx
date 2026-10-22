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
      let msg = 'Tidak dapat mengakses kamera perangkat secara langsung di browser.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Izin kamera belum diberikan. Klik "Izinkan" pada izin browser atau gunakan tombol Kamera Bawaan HP di bawah.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'Kamera tidak terdeteksi pada perangkat ini. Silakan gunakan tombol Buka Kamera HP atau pilih berkas dari galeri.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Kamera sedang dipakai aplikasi lain. Anda dapat menggunakan tombol Buka Kamera HP langsung.';
      }
      setCameraError(msg);
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
    setIsCapturing(true);
    setFlashAnimation(true);

    setTimeout(() => {
      setFlashAnimation(false);
      try {
        const video = videoRef.current;
        if (!video) {
          nativeCameraInputRef.current?.click();
          setIsCapturing(false);
          return;
        }

        const videoWidth = video.videoWidth || video.clientWidth || 1280;
        const videoHeight = video.videoHeight || video.clientHeight || 720;

        const maxDim = 1280;
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

        const canvas = document.createElement('canvas');
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, finalWidth, finalHeight);
          const dataUrl = compressCanvasToJpeg(canvas, 0.75);
          if (dataUrl && dataUrl.length > 200) {
            stopCameraStream();
            const generatedName = `dokumen_${Date.now()}.jpg`;
            onCapture(dataUrl, generatedName);
            onClose();
          } else {
            nativeCameraInputRef.current?.click();
          }
        } else {
          nativeCameraInputRef.current?.click();
        }
      } catch (e) {
        console.error('Shutter error:', e);
        nativeCameraInputRef.current?.click();
      } finally {
        setIsCapturing(false);
      }
    }, 100);
  };

  // Handle file picker selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_FILE_SIZE) {
      alert('Ukuran berkas melebihi batas maksimum 5 MB. Silakan pilih foto dengan resolusi yang lebih kecil.');
      e.target.value = '';
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
      alert('Format berkas tidak didukung. Mohon gunakan format gambar JPG, PNG, atau WebP.');
      e.target.value = '';
      return;
    }

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
            stopCameraStream();
            onCapture(compressedDataUrl, file.name || `dokumen_${Date.now()}.jpg`);
            onClose();
          } else {
            stopCameraStream();
            onCapture(result, file.name || `dokumen_${Date.now()}.jpg`);
            onClose();
          }
        } catch {
          stopCameraStream();
          onCapture(result, file.name || `dokumen_${Date.now()}.jpg`);
          onClose();
        }
      };
      img.onerror = () => {
        stopCameraStream();
        onCapture(result, file.name || `dokumen_${Date.now()}.jpg`);
        onClose();
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
        <div className="p-4 sm:p-5 bg-white text-slate-900 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{title}</h3>
              <p className="text-xs text-slate-500">Unggah berkas atau potret dokumen langsung</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 flex-1">
          {/* Camera Error State */}
          {cameraError ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-sm font-bold text-slate-900">Kamera Web Browser Terkendala</h4>
                <p className="text-xs text-slate-500">
                  Gunakan kamera bawaan perangkat Anda atau pilih berkas foto dari galeri:
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => nativeCameraInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>Buka Kamera HP</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  {/* <span>Pilih dari Galeri</span> */}
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Viewfinder - Clean & Direct */
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 aspect-4/3 flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {flashAnimation && (
                  <div className="absolute inset-0 bg-white opacity-80 animate-pulse pointer-events-none" />
                )}

                {/* Subtle Framing Guide Outline (No text noise) */}
                <div className="absolute inset-4 sm:inset-6 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none" />
              </div>

              {/* Shutter Button & Camera Switch */}
              <div className="flex items-center gap-2 pt-1">
                {hasMultipleCameras && (
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer border border-slate-200 shadow-2xs"
                    title="Ganti Kamera Depan/Belakang"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleShutter}
                  disabled={isCapturing}
                  className="flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isCapturing ? 'Memproses...' : 'Jepret Foto'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Hidden Pickers */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg,image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={nativeCameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Pilih dari Galeri</span>
          </button>
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
