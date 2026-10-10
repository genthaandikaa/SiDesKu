import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  MapPin, 
  Navigation, 
  RotateCcw, 
  Building2, 
  Home, 
  ShieldCheck, 
  Maximize2, 
  Minimize2,
  Filter,
  Hand
} from 'lucide-react';

export interface MapFacilityItem {
  id: string;
  nama: string;
  tipe: string;
  blok: string;
  pic: string;
  status: string;
  jam: string;
  icon: string;
  lat: number;
  lng: number;
  bg: string;
  desc: string;
  isHouse?: boolean;
}

interface RealRtMapProps {
  facilities: MapFacilityItem[];
  selectedPinId?: string | null;
  onSelectPin: (item: MapFacilityItem) => void;
  wargas?: any[];
}

export const RealRtMap: React.FC<RealRtMapProps> = ({
  facilities,
  selectedPinId,
  onSelectPin,
  wargas = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const boundaryLayerRef = useRef<L.Polygon | null>(null);

  const [activeLayer, setActiveLayer] = useState<'streets' | 'satellite' | 'voyager'>('streets');
  const [filterMode, setFilterMode] = useState<'all' | 'facilities' | 'houses'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Center coordinate of RT 01 / RW 01 Dusun Krajan, Desa Doko, Kec. Ngasem, Kediri
  const rtCenter: [number, number] = [-7.81792, 112.04255];

  // Territorial boundary polygon of RT 01 Krajan
  const rtBoundaryCoords: [number, number][] = [
    [-7.81630, 112.04090], // Barat Laut (Saluran Irigasi)
    [-7.81620, 112.04425], // Timur Laut
    [-7.81925, 112.04435], // Tenggara (Batas Kas Sawah Desa)
    [-7.81935, 112.04100], // Barat Daya (Jl. Raya Ngasem-Doko)
  ];

  // Base tile layers
  const tileUrls = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  };

  const tileAttributions = {
    streets: '&copy; OpenStreetMap kontributor',
    satellite: '&copy; Esri &mdash; Sumber: Esri, USGS, Maxar GIS',
    voyager: '&copy; CARTO &copy; OpenStreetMap',
  };

  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: rtCenter,
        zoom: 17,
        minZoom: 14,
        maxZoom: 19,
        zoomControl: false,
      });

      // Add Zoom Control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add Scale Bar
      L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

      // Initial Tile Layer
      const initialLayer = L.tileLayer(tileUrls[activeLayer], {
        attribution: tileAttributions[activeLayer],
        maxZoom: 19,
      }).addTo(map);
      currentTileLayerRef.current = initialLayer;

      // Add RT 01 Spatial Boundary Polygon
      const boundary = L.polygon(rtBoundaryCoords, {
        color: '#10b981',
        weight: 3,
        dashArray: '6, 8',
        fillColor: '#10b981',
        fillOpacity: 0.12,
      }).addTo(map);

      boundary.bindTooltip(
        '<div class="font-sans font-bold text-xs text-emerald-900">📍 Batas Teritorial Wilayah RT 01 Krajan (Desa Doko)</div>',
        { sticky: true, className: 'custom-leaflet-tooltip' }
      );

      boundaryLayerRef.current = boundary;

      // Create Layer Group for markers
      const markerGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markerGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Layer switching
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (currentTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
    }

    const newTile = L.tileLayer(tileUrls[activeLayer], {
      attribution: tileAttributions[activeLayer],
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    currentTileLayerRef.current = newTile;

    if (boundaryLayerRef.current) {
      boundaryLayerRef.current.setStyle({
        color: activeLayer === 'satellite' ? '#34d399' : '#10b981',
        weight: activeLayer === 'satellite' ? 3.5 : 3,
        fillOpacity: activeLayer === 'satellite' ? 0.2 : 0.12,
      });
    }
  }, [activeLayer]);

  // Combine Facilities + Dynamic Citizen Houses from wargas
  const allMapItems = useMemo<MapFacilityItem[]>(() => {
    const list: MapFacilityItem[] = [...facilities];

    if (wargas && wargas.length > 0) {
      const houseCoords = [
        { lat: -7.81788, lng: 112.04212, blok: 'Blok Melati (No. 14)' },
        { lat: -7.81725, lng: 112.04275, blok: 'Blok Mawar (No. 05)' },
        { lat: -7.81830, lng: 112.04330, blok: 'Blok Kenanga (No. 28)' },
        { lat: -7.81690, lng: 112.04180, blok: 'Blok Mawar Barat (No. 02)' },
      ];

      wargas.forEach((w, idx) => {
        const coord = houseCoords[idx % houseCoords.length];
        const isHead = w.status_keluarga === 'Kepala Keluarga';
        list.push({
          id: `warga_house_${w.id || idx}`,
          nama: `Rumah ${w.nama_lengkap}`,
          tipe: isHead ? 'Hunian Kepala Keluarga' : 'Hunian Warga RT 01',
          blok: coord.blok,
          pic: `${w.nama_lengkap} (NIK: ${w.nik})`,
          status: w.status_ekonomi || 'Warga Tetap',
          jam: w.no_hp_wa ? `WhatsApp: ${w.no_hp_wa}` : 'Domisili Terverifikasi',
          icon: '🏠',
          lat: coord.lat + (idx * 0.00008),
          lng: coord.lng + (idx * 0.00007),
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          desc: `Unit tempat tinggal resmi warga di ${w.alamat_ktp || 'RT 01 / RW 01 Dusun Krajan'}. Hubungan: ${w.status_keluarga || 'Warga'}.`,
          isHouse: true,
        });
      });
    }

    return list;
  }, [facilities, wargas]);

  // Render & Update Markers on map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    const filteredItems = allMapItems.filter((item) => {
      if (filterMode === 'facilities') return !item.isHouse;
      if (filterMode === 'houses') return item.isHouse;
      return true;
    });

    filteredItems.forEach((item) => {
      const isSelected = selectedPinId === item.id;
      const isHouse = item.isHouse;

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="relative group cursor-pointer transition-transform duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center text-xs sm:text-sm shadow-md border-2 ${
              isSelected 
                ? 'bg-emerald-600 border-white text-white ring-4 ring-emerald-400/50' 
                : isHouse
                ? 'bg-white border-teal-600 text-teal-700'
                : 'bg-white border-emerald-600 text-emerald-800'
            }">
              <span>${item.icon}</span>
            </div>
            
            <div class="w-2 h-2 mx-auto -mt-1 rotate-45 border-r border-b ${
              isSelected 
                ? 'bg-emerald-600 border-white' 
                : 'bg-white border-emerald-600'
            }"></div>

            <div class="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs pointer-events-none opacity-90 group-hover:opacity-100">
              ${item.nama.length > 16 ? item.nama.substring(0, 14) + '...' : item.nama}
            </div>
          </div>
        `,
        iconSize: [36, 42],
        iconAnchor: [18, 42],
        popupAnchor: [0, -40],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });

      const popupHtml = `
        <div class="font-sans p-1 space-y-1.5 min-w-[190px] sm:min-w-[210px] text-left">
          <div class="flex items-center gap-2 border-b border-slate-100 pb-1">
            <span class="text-base">${item.icon}</span>
            <div>
              <div class="font-black text-xs text-slate-900 leading-tight">${item.nama}</div>
              <div class="text-[10px] text-emerald-700 font-bold">${item.tipe}</div>
            </div>
          </div>
          <div class="text-[11px] text-slate-600 leading-snug">
            ${item.desc}
          </div>
          <div class="text-[10px] bg-slate-50 p-1.5 rounded-lg text-slate-700 border border-slate-100 space-y-0.5 font-medium">
            <div>📍 <strong>Lokasi:</strong> ${item.blok}</div>
            <div>👤 <strong>PIC:</strong> ${item.pic}</div>
          </div>
          <button 
            id="popup-btn-${item.id}"
            class="w-full mt-1 py-1.5 px-3 rounded-lg bg-emerald-600 text-white font-black text-[11px] hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1"
          >
            <span>Pilih & Buka Rincian</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 260, className: 'modern-leaflet-popup' });

      marker.on('click', () => {
        onSelectPin(item);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${item.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectPin(item);
          };
        }
      });

      markersGroupRef.current?.addLayer(marker);
    });
  }, [allMapItems, filterMode, selectedPinId]);

  // Center on selected pin when changed from outside
  useEffect(() => {
    if (!selectedPinId || !mapInstanceRef.current) return;
    const target = allMapItems.find((m) => m.id === selectedPinId);
    if (target) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], 18, {
        duration: 1.0,
      });
    }
  }, [selectedPinId, allMapItems]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(rtCenter, 17, { duration: 1 });
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Top Filter Chips Bar (Optimized for Mobile Touch Scrolling) */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto">
          <span className="text-xs font-black text-slate-700 mr-1 hidden sm:flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            <span>Tampilkan:</span>
          </span>

          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
              filterMode === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Semua ({allMapItems.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('facilities')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
              filterMode === 'facilities'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3 h-3 text-blue-600" />
            <span>Fasum ({facilities.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('houses')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
              filterMode === 'houses'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Home className="w-3 h-3 text-emerald-600" />
            <span>Hunian Warga ({allMapItems.filter(i => i.isHouse).length})</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Wilayah Aktif RT 01 Dusun Krajan</span>
        </div>
      </div>

      {/* Main Map Container */}
      <div className={`relative w-full rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all bg-slate-900 ${
        isFullscreen ? 'fixed inset-3 z-[99999] h-[calc(100vh-1.5rem)]' : 'aspect-[4/3] sm:aspect-[16/9] min-h-[350px] sm:min-h-[440px]'
      }`}>
        {/* Floating Controls Bar */}
        <div className="absolute top-2.5 sm:top-3.5 inset-x-2.5 sm:inset-x-3.5 z-[1000] flex items-center justify-between gap-1.5 pointer-events-none">
          {/* Tile Selector */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200/80 pointer-events-auto">
            <button
              type="button"
              onClick={() => setActiveLayer('streets')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeLayer === 'streets' 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Peta Jalan Terstruktur"
            >
              <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Jalan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayer('satellite')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeLayer === 'satellite' 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Foto Satelit Asli"
            >
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Satelit</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayer('voyager')}
              className={`hidden md:flex px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all items-center gap-1 cursor-pointer ${
                activeLayer === 'voyager' 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Peta Bersih Minimalis"
            >
              <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Minimalis</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={handleResetView}
              className="p-2 rounded-2xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-emerald-700 shadow-md border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Pusatkan Kembali ke RT 01 Krajan"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-2xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-emerald-700 shadow-md border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer"
              title={isFullscreen ? 'Kecilkan Peta' : 'Layar Penuh Peta'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>

        {/* Real Leaflet Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-0 font-sans" />

        {/* Bottom Coordinates & Mobile Touch Guide */}
        <div className="absolute bottom-2.5 left-2.5 z-[1000] flex items-center gap-2 pointer-events-none">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-mono px-2.5 sm:px-3 py-1.5 rounded-xl shadow-md border border-white/10">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>7°49'05"S 112°02'33"E • RT 01 Dusun Krajan</span>
          </div>

          {/* Mobile gesture helper badge */}
          <div className="flex sm:hidden items-center gap-1 bg-slate-900/85 backdrop-blur-md text-white text-[9px] font-medium px-2 py-1 rounded-lg border border-white/10">
            <Hand className="w-2.5 h-2.5 text-emerald-400" />
            <span>Gunakan 2 jari untuk geser peta</span>
          </div>
        </div>
      </div>
    </div>
  );
};
