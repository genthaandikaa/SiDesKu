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
  AlertCircle,
  Loader2
} from 'lucide-react';
import { detectSmartCityLocation, geocodeAddressQuery } from '../services/locationService';

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
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
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
          "><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
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

  // Robust Geolocation with Auto-Fallback to IP (Never fails)
  const handleDetectGps = async () => {
    setIsLocating(true);
    setGpsNotice(null);

    try {
      const loc = await detectSmartCityLocation();
      panToCoords({ lat: loc.lat, lng: loc.lng }, loc.label);

      if (loc.method === 'ip') {
        setGpsNotice(
          `Lokasi terdeteksi via jaringan internet Wi-Fi (${loc.city || 'Regional'}). IP provider internet bisa berbeda beberapa km dari rumah Anda. Silakan geser pin pada peta atau ketik nama jalan/kelurahan Anda di bawah untuk titik 100% pas!`
        );
      } else if (loc.method === 'gps') {
        setGpsNotice('Titik GPS perangkat Anda berhasil dikunci secara presisi!');
      }
    } catch (err) {
      console.warn('Location detection failed:', err);
      setGpsNotice('Silakan klik salah satu wilayah kota di bawah atau cari nama kota/jalan Anda.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleApplyCustomInput = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = customInput.trim();
    if (!query) return;

    setIsSearchingAddress(true);
    setGpsNotice(null);

    // 1. Try local preset match first
    const presetMatch = KEDIRI_PRESET_LOCATIONS.find((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );

    if (presetMatch) {
      panToCoords({ lat: presetMatch.lat, lng: presetMatch.lng }, presetMatch.name);
      setGpsNotice(`Lokasi berhasil diarahkan ke: ${presetMatch.name}`);
      setCustomInput('');
      setIsSearchingAddress(false);
      return;
    }

    // 2. Geocode custom query via Nominatim OpenStreetMap
    const geo = await geocodeAddressQuery(query);
    if (geo) {
      const parts = geo.displayName.split(',');
      const shortName = parts.slice(0, 2).join(', ').trim();
      panToCoords({ lat: geo.lat, lng: geo.lng }, `${shortName} (Peta Kota)`);
      setGpsNotice(`Titik peta berhasil dipindahkan ke: ${parts.slice(0, 3).join(', ')}`);
      setCustomInput('');
    } else {
      setTempLabel(`${query} (Alamat Kustom)`);
      setGpsNotice(`Nama alamat "${query}" diterapkan. Anda juga dapat menggeser pin biru pada peta.`);
    }
    setIsSearchingAddress(false);
  };

  const handleSaveAndApply = () => {
    onSaveLocation(tempCoords, tempLabel);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-sky-100 overflow-hidden relative">
        
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">Ubah Titik Lokasi Anda</h3>
              <p className="text-xs text-slate-500">
                Pilih lokasi Anda untuk menghitung jarak real-time ke toko & UMKM tetangga.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {/* Selected Location Pill */}
          <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between text-xs">
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
            <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full shrink-0">
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

            <div className="w-full h-40 sm:h-44 rounded-2xl border border-slate-200 overflow-hidden relative shadow-inner bg-slate-100">
              <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
              <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 shadow-2xs pointer-events-none z-[1000] inline-flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span>Titik: {tempCoords.lat.toFixed(4)}, {tempCoords.lng.toFixed(4)}</span>
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
            <div className="grid grid-cols-2 gap-2 max-h-32 sm:max-h-36 overflow-y-auto pr-1">
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

          {/* Option 3: Custom Address & City Search */}
          <form onSubmit={handleApplyCustomInput} className="space-y-1.5 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              ATAU CARI NAMA KOTA / KECAMATAN / JALAN ANDA
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Contoh: Kota Blitar, Sukamaju, Jl. Dhoho Kediri"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isSearchingAddress}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                {isSearchingAddress ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mencari...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Cari / Tuju Titik</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sticky Fixed Footer (Never cut off) */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/80 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-white cursor-pointer transition-colors"
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
