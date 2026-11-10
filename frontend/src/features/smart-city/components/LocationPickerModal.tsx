import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import {
  Compass,
  MapPin,
  Navigation,
  X,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';

export interface LocationPreset {
  name: string;
  lat: number;
  lng: number;
  desc: string;
}

export const KEDIRI_PRESET_LOCATIONS: LocationPreset[] = [
  { name: 'Kelurahan Sukamaju / Doko', lat: -7.8185, lng: 112.0135, desc: 'Kec. Doko / Kediri Timur' },
  { name: 'Simpang Lima Gumul (SLG)', lat: -7.8280, lng: 112.0450, desc: 'Pusat Ikonik Kabupaten / Kota' },
  { name: 'Balai Kota / Pusat Kediri', lat: -7.8166, lng: 112.0118, desc: 'Pusat Pemerintahan & Perkantoran' },
  { name: 'Kecamatan Mojoroto', lat: -7.8050, lng: 111.9950, desc: 'Area Kampus & Pemukiman Barat' },
  { name: 'Kecamatan Pesantren', lat: -7.8350, lng: 112.0350, desc: 'Sentra UMKM & Industri Kreatif' },
  { name: 'Kelurahan Banjaran', lat: -7.8130, lng: 112.0190, desc: 'Sentra Kuliner & Pasar Tradisional' },
  { name: 'Kelurahan Bandar Lor', lat: -7.8220, lng: 111.9980, desc: 'Sentra Kain Tenun Ikat Bandar' },
  { name: 'Kelurahan Ngletih', lat: -7.8420, lng: 112.0520, desc: 'Kawasan Hunian Asri Selatan' },
  { name: 'Kelurahan Ngronggo', lat: -7.8350, lng: 112.0210, desc: 'Kawasan Komersial & Pendidikan' },
  { name: 'Kelurahan Kemasan', lat: -7.8170, lng: 112.0110, desc: 'Kawasan Wisata Kuliner Jl. Dhoho' }
];

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoords: { lat: number; lng: number };
  currentLabel: string;
  onSaveLocation: (coords: { lat: number; lng: number }, label: string) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentCoords,
  currentLabel,
  onSaveLocation
}) => {
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number }>(currentCoords);
  const [tempLabel, setTempLabel] = useState<string>(currentLabel);
  const [customInput, setCustomInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTempCoords(currentCoords);
      setTempLabel(currentLabel);
      setGpsNotice(null);
    }
  }, [isOpen, currentCoords, currentLabel]);

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!isOpen) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    // Delay slightly to ensure portal DOM is mounted
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [tempCoords.lat, tempCoords.lng],
          zoom: 14,
          zoomControl: true,
          scrollWheelZoom: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Custom Pin Icon
        const pinIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="
            background: #2563eb;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-size: 16px;
            cursor: pointer;
          ">📍</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        const marker = L.marker([tempCoords.lat, tempCoords.lng], {
          icon: pinIcon,
          draggable: true
        }).addTo(map);

        markerRef.current = marker;
        mapInstanceRef.current = map;

        // When user clicks anywhere on map
        map.on('click', (e: L.LeafletMouseEvent) => {
          const lat = Math.round(e.latlng.lat * 10000) / 10000;
          const lng = Math.round(e.latlng.lng * 10000) / 10000;
          marker.setLatLng([lat, lng]);
          setTempCoords({ lat, lng });

          // Find closest preset name
          let closest = KEDIRI_PRESET_LOCATIONS[0];
          let minDist = 99999;
          KEDIRI_PRESET_LOCATIONS.forEach((p) => {
            const d = Math.hypot(p.lat - lat, p.lng - lng);
            if (d < minDist) {
              minDist = d;
              closest = p;
            }
          });

          setTempLabel(`Titik Peta (${closest.name.split('/')[0].trim()})`);
          setGpsNotice(null);
        });

        // When marker is dragged
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          const lat = Math.round(pos.lat * 10000) / 10000;
          const lng = Math.round(pos.lng * 10000) / 10000;
          setTempCoords({ lat, lng });
          setTempLabel(`Titik Geser (${lat}, ${lng})`);
          setGpsNotice(null);
        });
      } else {
        mapInstanceRef.current.invalidateSize();
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Update map and marker when tempCoords changes externally
  const panToCoords = (coords: { lat: number; lng: number }, label: string) => {
    setTempCoords(coords);
    setTempLabel(label);
    setGpsNotice(null);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.flyTo([coords.lat, coords.lng], 15, { duration: 0.8 });
      markerRef.current.setLatLng([coords.lat, coords.lng]);
    }
  };

  // Browser Geolocation (NO BLOCKING ALERT!)
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsNotice('Browser Anda tidak mendukung deteksi lokasi otomatis. Silakan pilih salah satu wilayah di peta.');
      return;
    }
    setIsLocating(true);
    setGpsNotice(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;
        panToCoords({ lat, lng }, 'GPS Perangkat Terdeteksi (Akurasi Tinggi)');
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation permission error or unavailable:', err);
        setGpsNotice(
          'Deteksi GPS otomatis tidak diizinkan atau dinonaktifkan di browser. Anda tetap dapat memilih titik bebas langsung pada peta atau memilih salah satu wilayah di bawah.'
        );
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const handleApplyCustomInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setTempLabel(`${customInput.trim()} (Alamat Kustom)`);
    setCustomInput('');
  };

  const handleSaveAndApply = () => {
    onSaveLocation(tempCoords, tempLabel);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-xl w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl border border-sky-100 relative">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Ubah Titik Lokasi Anda</h3>
            <p className="text-xs text-slate-500">
              Pilih lokasi Anda untuk menghitung jarak real-time ke toko & UMKM tetangga.
            </p>
          </div>
        </div>

        {/* Selected Location Pill */}
        <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="text-[10px] text-blue-700/80 block font-semibold">Titik Lokasi Terpilih</span>
              <span className="font-extrabold text-slate-900 text-xs">{tempLabel}</span>
              <span className="text-[10px] text-slate-500 block font-mono">
                {tempCoords.lat.toFixed(4)}, {tempCoords.lng.toFixed(4)}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
            Siap Diterapkan
          </span>
        </div>

        {/* Optional GPS Notice (Gentle Non-blocking notification) */}
        {gpsNotice && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{gpsNotice}</div>
          </div>
        )}

        {/* Leaflet Map Interactive Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-700">Peta Interaktif Kota Kediri:</span>
            <span className="text-slate-400">Klik / geser pin untuk menentukan titik</span>
          </div>

          <div className="w-full h-52 sm:h-56 rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner bg-slate-100">
            <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 shadow-2xs pointer-events-none z-[1000]">
              📍 Titik: {tempCoords.lat.toFixed(4)}, {tempCoords.lng.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Option 1: Browser GPS Button */}
        <button
          type="button"
          onClick={handleDetectGps}
          disabled={isLocating}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{isLocating ? 'Mendeteksi Koordinat GPS...' : 'Gunakan GPS Perangkat Saya Sekarang'}</span>
        </button>

        {/* Option 2: Quick Presets */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            ATAU PILIH WILAYAH KOTA KEDIRI (SATSET)
          </span>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {KEDIRI_PRESET_LOCATIONS.map((preset) => {
              const isSelected =
                Math.abs(tempCoords.lat - preset.lat) < 0.001 &&
                Math.abs(tempCoords.lng - preset.lng) < 0.001;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => panToCoords({ lat: preset.lat, lng: preset.lng }, preset.name)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer group flex items-start justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 text-blue-900 shadow-2xs ring-1 ring-blue-400'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate pr-1">
                    <div className="font-bold text-slate-800 text-[11px] group-hover:text-blue-700 truncate">
                      {preset.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{preset.desc}</div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Option 3: Custom Address Text */}
        <form onSubmit={handleApplyCustomInput} className="space-y-1.5 pt-1 border-t border-slate-100">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
            ATAU KETIK NAMA JALAN / PATOKAN RUMAH
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Contoh: Jl. Dhoho No. 25, Kediri"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
            >
              Set Nama
            </button>
          </div>
        </form>

        {/* Footer Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSaveAndApply}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Titik Lokasi Ini</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
