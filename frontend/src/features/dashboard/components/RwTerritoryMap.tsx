import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Navigation,
  RotateCcw,
  Building2,
  Maximize2,
  Minimize2,
  Users,
  Phone,
  CheckCircle2,
  Info,
  Home,
  Grid,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export interface RtBoundaryData {
  id: string;
  nomorRt: string;
  nama: string;
  blokName: string;
  ketua: string;
  phone: string;
  kkCount: number;
  wargaCount: number;
  areaHectares: number;
  color: string;
  borderColor: string;
  center: [number, number];
  polygonCoords: [number, number][];
}

interface RwTerritoryMapProps {
  onSelectRt?: (rtNomor: string) => void;
  rtsData?: any[];
  wargas?: any[];
  facilities?: any[];
}

export const RwTerritoryMap: React.FC<RwTerritoryMapProps> = ({
  onSelectRt,
  rtsData = [],
  wargas = [],
  facilities = []
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const rtPolygonsGroupRef = useRef<L.LayerGroup | null>(null);
  const rtLabelsGroupRef = useRef<L.LayerGroup | null>(null);
  const facilitiesGroupRef = useRef<L.LayerGroup | null>(null);
  const wargasGroupRef = useRef<L.LayerGroup | null>(null);
  const rwBoundaryRef = useRef<L.Polygon | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeLayer, setActiveLayer] = useState<'streets' | 'satellite' | 'voyager'>('streets');
  const [selectedRtId, setSelectedRtId] = useState<string | null>(null);
  const [showRtBoxes, setShowRtBoxes] = useState<boolean>(true);
  const [showFacilities, setShowFacilities] = useState<boolean>(true);
  const [showWargas, setShowWargas] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Center coordinate of RW 01 Dusun Krajan, Desa Doko
  const rwCenter: [number, number] = [-7.81830, 112.04300];
  const rwDefaultZoom = 16;

  // Outer Boundary of RW 01
  const rwOuterBoundaryCoords: [number, number][] = [
    [-7.81570, 112.03960],
    [-7.81570, 112.04600],
    [-7.82100, 112.04620],
    [-7.82100, 112.03960],
  ];

  // Tile layers
  const tileUrls = {
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  };

  const tileAttributions = {
    streets: '&copy; OpenStreetMap kontributor',
    satellite: '&copy; Esri, USGS, Maxar GIS',
    voyager: '&copy; CARTO &copy; OpenStreetMap',
  };

  // 6 RT Territorial Sub-boxes in RW 01
  const rtBoundaries: RtBoundaryData[] = useMemo(() => [
    {
      id: 'rt_01',
      nomorRt: '01',
      nama: 'RT 01 Krajan Barat',
      blokName: 'Blok Mawar & Krajan Barat',
      ketua: 'Supriyadi (Ketua RT 01)',
      phone: '081234567895',
      kkCount: 42,
      wargaCount: 156,
      areaHectares: 4.2,
      color: '#10b981', // Emerald
      borderColor: '#047857',
      center: [-7.81690, 112.04105],
      polygonCoords: [
        [-7.81580, 112.03980],
        [-7.81580, 112.04230],
        [-7.81800, 112.04230],
        [-7.81800, 112.03980],
      ]
    },
    {
      id: 'rt_02',
      nomorRt: '02',
      nama: 'RT 02 Krajan Utara',
      blokName: 'Blok Melati & Krajan Utara',
      ketua: 'Hendra Gunawan',
      phone: '081298765432',
      kkCount: 38,
      wargaCount: 142,
      areaHectares: 5.1,
      color: '#3b82f6', // Blue
      borderColor: '#1d4ed8',
      center: [-7.81690, 112.04405],
      polygonCoords: [
        [-7.81580, 112.04230],
        [-7.81580, 112.04580],
        [-7.81800, 112.04580],
        [-7.81800, 112.04230],
      ]
    },
    {
      id: 'rt_03',
      nomorRt: '03',
      nama: 'RT 03 Krajan Timur',
      blokName: 'Blok Kenanga & Krajan Timur',
      ketua: 'Drs. Joko Santoso',
      phone: '081345678901',
      kkCount: 35,
      wargaCount: 128,
      areaHectares: 3.8,
      color: '#8b5cf6', // Violet
      borderColor: '#6d28d9',
      center: [-7.81870, 112.04485],
      polygonCoords: [
        [-7.81800, 112.04350],
        [-7.81800, 112.04620],
        [-7.81940, 112.04620],
        [-7.81940, 112.04350],
      ]
    },
    {
      id: 'rt_04',
      nomorRt: '04',
      nama: 'RT 04 Krajan Tengah',
      blokName: 'Blok Anggrek & Krajan Tengah',
      ketua: 'Ahmad Subari',
      phone: '085678901234',
      kkCount: 40,
      wargaCount: 148,
      areaHectares: 4.0,
      color: '#f59e0b', // Amber
      borderColor: '#b45309',
      center: [-7.81870, 112.04175],
      polygonCoords: [
        [-7.81800, 112.04000],
        [-7.81800, 112.04350],
        [-7.81940, 112.04350],
        [-7.81940, 112.04000],
      ]
    },
    {
      id: 'rt_05',
      nomorRt: '05',
      nama: 'RT 05 Krajan Barat Daya',
      blokName: 'Blok Cempaka & Krajan Barat Daya',
      ketua: 'Bambang Sugiono',
      phone: '081234567890',
      kkCount: 36,
      wargaCount: 134,
      areaHectares: 3.6,
      color: '#06b6d4', // Cyan
      borderColor: '#0e7490',
      center: [-7.82010, 112.04170],
      polygonCoords: [
        [-7.81940, 112.04020],
        [-7.81940, 112.04320],
        [-7.82080, 112.04320],
        [-7.82080, 112.04020],
      ]
    },
    {
      id: 'rt_06',
      nomorRt: '06',
      nama: 'RT 06 Krajan Tenggara',
      blokName: 'Blok Flamboyan & Krajan Tenggara',
      ketua: 'Kuswanto',
      phone: '087890123456',
      kkCount: 34,
      wargaCount: 120,
      areaHectares: 3.5,
      color: '#f43f5e', // Rose
      borderColor: '#be123c',
      center: [-7.82010, 112.04460],
      polygonCoords: [
        [-7.81940, 112.04320],
        [-7.81940, 112.04600],
        [-7.82080, 112.04600],
        [-7.82080, 112.04320],
      ]
    }
  ], []);

  // Fasum RW
  const defaultFacilities = useMemo(() => [
    {
      id: 'balai_rw_01',
      nama: 'Balai Pertemuan & Pos Koordinasi RW 01',
      tipe: 'Pusat Koordinasi Wilayah',
      icon: 'landmark',
      lat: -7.81820,
      lng: 112.04280,
      desc: 'Pusat musyawarah warga, rapat koordinasi 6 RT, dan pos pelayanan administrasi RW 01.'
    },
    {
      id: 'pos_kamling_induk',
      nama: 'Pos Kamling Induk RW 01',
      tipe: 'Keamanan Lingkungan (Siskamling)',
      icon: 'shield',
      lat: -7.81980,
      lng: 112.04150,
      desc: 'Pos ronda induk pantauan keamanan 24 jam dengan sambungan HT antar pos kamling RT.'
    },
    {
      id: 'posyandu_terpadu',
      nama: 'Posyandu Terpadu Balita & Lansia Cempaka',
      tipe: 'Layanan Kesehatan Warga',
      icon: '🩺',
      lat: -7.81710,
      lng: 112.04380,
      desc: 'Fasilitas penimbangan rutin balita, PMT, dan posbindu kesehatan lansia se-RW 01.'
    },
    {
      id: 'musholla_al_mabrur',
      nama: 'Musholla Al Mabrur',
      tipe: 'Fasilitas Keagamaan',
      icon: 'mosque',
      lat: -7.81990,
      lng: 112.04410,
      desc: 'Pusat kegiatan ibadah jamaah dan pengajian warga RW 01 Krajan.'
    }
  ], []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: rwCenter,
        zoom: rwDefaultZoom,
        minZoom: 14,
        maxZoom: 19,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

      // Initial Tile Layer
      const initialTile = L.tileLayer(tileUrls[activeLayer], {
        attribution: tileAttributions[activeLayer],
        maxZoom: 19,
      }).addTo(map);
      currentTileLayerRef.current = initialTile;

      // Outer RW 01 Boundary (Dashed outline)
      const outerBoundary = L.polygon(rwOuterBoundaryCoords, {
        color: '#047857',
        weight: 3,
        dashArray: '8, 8',
        fillColor: '#10b981',
        fillOpacity: 0.05,
      }).addTo(map);

      outerBoundary.bindTooltip(
        '<div class="font-sans font-black text-xs text-emerald-950">Batas Teritorial Wilayah RW 01 Dusun Krajan (6 RT)</div>',
        { sticky: true, className: 'custom-leaflet-tooltip' }
      );
      rwBoundaryRef.current = outerBoundary;

      // Layer Groups
      rtPolygonsGroupRef.current = L.layerGroup().addTo(map);
      rtLabelsGroupRef.current = L.layerGroup().addTo(map);
      facilitiesGroupRef.current = L.layerGroup().addTo(map);
      wargasGroupRef.current = L.layerGroup().addTo(map);

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
  }, [activeLayer]);

  // Render RT Kotak Polygons & Badges
  useEffect(() => {
    if (!mapInstanceRef.current || !rtPolygonsGroupRef.current || !rtLabelsGroupRef.current) return;

    rtPolygonsGroupRef.current.clearLayers();
    rtLabelsGroupRef.current.clearLayers();

    if (!showRtBoxes) return;

    rtBoundaries.forEach((rt) => {
      const isSelected = selectedRtId === rt.id;

      // 1. RT Box Polygon
      const polygon = L.polygon(rt.polygonCoords, {
        color: rt.borderColor,
        weight: isSelected ? 4 : 2.5,
        fillColor: rt.color,
        fillOpacity: isSelected ? 0.42 : 0.22,
        dashArray: isSelected ? undefined : '4, 4',
      });

      // Hover and click events
      polygon.on('mouseover', () => {
        if (selectedRtId !== rt.id) {
          polygon.setStyle({
            fillOpacity: 0.35,
            weight: 3.5,
          });
        }
      });

      polygon.on('mouseout', () => {
        if (selectedRtId !== rt.id) {
          polygon.setStyle({
            fillOpacity: 0.22,
            weight: 2.5,
          });
        }
      });

      polygon.on('click', () => {
        setSelectedRtId(rt.id);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(rt.center, 17.2, { duration: 0.8 });
        }
      });

      // Tooltip on polygon
      polygon.bindTooltip(
        `
        <div class="font-sans text-xs space-y-0.5">
          <div class="font-black text-slate-900">${rt.nama}</div>
          <div class="text-[11px] text-slate-600">Ketua: <strong>${rt.ketua}</strong></div>
          <div class="text-[10px] text-emerald-800 font-bold">${rt.kkCount} KK • ${rt.wargaCount} Jiwa</div>
        </div>
        `,
        { sticky: true, className: 'custom-leaflet-tooltip' }
      );

      rtPolygonsGroupRef.current?.addLayer(polygon);

      // 2. Center HTML Badge for RT Box
      const labelIcon = L.divIcon({
        className: 'custom-rt-badge-icon',
        html: `
          <div class="cursor-pointer group select-none transition-transform duration-200 ${isSelected ? 'scale-115 -translate-y-1' : 'hover:scale-105'}">
            <div class="px-2.5 py-1.5 rounded-2xl shadow-md border flex items-center gap-1.5 ${
              isSelected
                ? 'bg-slate-900 text-white border-white ring-4 ring-slate-900/20'
                : 'bg-white/95 text-slate-900 border-slate-300/80 backdrop-blur-xs'
            }">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${rt.color};"></span>
              <div class="leading-none text-left">
                <div class="font-black text-[12px] tracking-tight">RT ${rt.nomorRt}</div>
                <div class="text-[9px] ${isSelected ? 'text-slate-300' : 'text-slate-500'} font-semibold mt-0.5">
                  ${rt.kkCount} KK • ${rt.wargaCount} Warga
                </div>
              </div>
            </div>
          </div>
        `,
        iconSize: [110, 40],
        iconAnchor: [55, 20],
      });

      const labelMarker = L.marker(rt.center, { icon: labelIcon });
      labelMarker.on('click', () => {
        setSelectedRtId(rt.id);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(rt.center, 17.2, { duration: 0.8 });
        }
      });

      rtLabelsGroupRef.current?.addLayer(labelMarker);
    });
  }, [rtBoundaries, selectedRtId, showRtBoxes]);

  // Render RW Facilities
  useEffect(() => {
    if (!mapInstanceRef.current || !facilitiesGroupRef.current) return;

    facilitiesGroupRef.current.clearLayers();

    if (!showFacilities) return;

    const items = facilities && facilities.length > 0 ? facilities : defaultFacilities;

    items.forEach((fac) => {
      const facIcon = L.divIcon({
        className: 'custom-fac-icon',
        html: `
          <div class="relative group cursor-pointer transition-transform duration-300 hover:scale-115">
            <div class="w-8 h-8 rounded-xl bg-white shadow-md border-2 border-emerald-600 flex items-center justify-center text-sm">
              <span>•</span>
            </div>
            <div class="w-2 h-2 mx-auto -mt-1 rotate-45 bg-white border-r border-b border-emerald-600"></div>
            <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-950/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs pointer-events-none opacity-90">
              ${fac.nama?.length > 16 ? fac.nama.substring(0, 14) + '...' : fac.nama}
            </div>
          </div>
        `,
        iconSize: [32, 38],
        iconAnchor: [16, 38],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([fac.lat, fac.lng], { icon: facIcon });
      marker.bindPopup(`
        <div class="p-1 space-y-1.5 min-w-[190px] font-sans text-left">
          <div class="flex items-center gap-2 border-b border-slate-100 pb-1">
            <span class="text-xs font-bold">•</span>
            <div>
              <div class="font-black text-xs text-slate-900">${fac.nama}</div>
              <div class="text-[10px] text-emerald-700 font-bold">${fac.tipe}</div>
            </div>
          </div>
          <div class="text-[11px] text-slate-600 leading-snug">${fac.desc}</div>
        </div>
      `, { maxWidth: 240, className: 'modern-leaflet-popup' });

      facilitiesGroupRef.current?.addLayer(marker);
    });
  }, [facilities, defaultFacilities, showFacilities]);

  // Render Sebaran Warga (Optional Layer on RW Level)
  useEffect(() => {
    if (!mapInstanceRef.current || !wargasGroupRef.current) return;

    wargasGroupRef.current.clearLayers();

    if (!showWargas || !wargas || wargas.length === 0) return;

    wargas.slice(0, 24).forEach((w, idx) => {
      // Approximate placement inside RT blocks based on warga rt_id
      const rtNum = w.rt_id || ((idx % 6) + 1);
      const targetRt = rtBoundaries.find((r) => r.nomorRt === String(rtNum).padStart(2, '0')) || rtBoundaries[0];
      const offsetLat = ((idx % 4) - 1.5) * 0.00045;
      const offsetLng = ((idx % 3) - 1) * 0.00055;

      const marker = L.circleMarker([targetRt.center[0] + offsetLat, targetRt.center[1] + offsetLng], {
        radius: 5,
        fillColor: targetRt.color,
        color: '#ffffff',
        weight: 1.5,
        fillOpacity: 0.9,
      });

      marker.bindTooltip(`
        <div class="font-sans text-[11px] space-y-0.5">
          <div class="font-bold text-slate-900">${w.nama_lengkap}</div>
          <div class="text-[10px] text-slate-600">RT ${targetRt.nomorRt} • NIK: ${w.nik}</div>
        </div>
      `, { sticky: true });

      wargasGroupRef.current?.addLayer(marker);
    });
  }, [wargas, showWargas, rtBoundaries]);

  const handleResetView = () => {
    setSelectedRtId(null);
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(rwCenter, rwDefaultZoom, { duration: 1 });
  };

  const selectedRt = useMemo(() => {
    return rtBoundaries.find((r) => r.id === selectedRtId) || null;
  }, [rtBoundaries, selectedRtId]);

  return (
    <div className="space-y-4 font-sans">
      {/* Top Selector Bar: Filter RT Blocks (Horizontal Touch-Friendly) */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full sm:w-auto">
          <span className="text-xs font-black text-slate-700 mr-1 hidden sm:flex items-center gap-1 shrink-0">
            <Grid className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pilih Kotak RT:</span>
          </span>

          <button
            type="button"
            onClick={() => handleResetView()}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
              !selectedRtId
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Semua RT (6 Blok)
          </button>

          {rtBoundaries.map((rt) => {
            const isCur = selectedRtId === rt.id;
            return (
              <button
                key={rt.id}
                type="button"
                onClick={() => {
                  setSelectedRtId(rt.id);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo(rt.center, 17.2, { duration: 0.8 });
                  }
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isCur
                    ? 'text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
                style={{
                  backgroundColor: isCur ? rt.color : undefined,
                  borderColor: isCur ? rt.borderColor : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isCur ? '#ffffff' : rt.color }}
                />
                <span>RT {rt.nomorRt}</span>
              </button>
            );
          })}
        </div>

        {/* Layer Checkbox Toggles */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-bold text-slate-700 overflow-x-auto no-scrollbar py-0.5">
          <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={showRtBoxes}
              onChange={(e) => setShowRtBoxes(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span>Kotak RT</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={showFacilities}
              onChange={(e) => setShowFacilities(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span>Fasum RW</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
            <input
              type="checkbox"
              checked={showWargas}
              onChange={(e) => setShowWargas(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span>Titik Warga</span>
          </label>
        </div>
      </div>

      {/* Main Map Box */}
      <div
        className={`relative w-full rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all bg-slate-900 ${
          isFullscreen ? 'fixed inset-3 z-[99999] h-[calc(100vh-1.5rem)]' : 'aspect-[4/3] sm:aspect-[16/9] min-h-[350px] sm:min-h-[440px]'
        }`}
      >
        {/* Floating Top Bar (Controls) */}
        <div className="absolute top-2.5 sm:top-3.5 inset-x-2.5 sm:inset-x-3.5 z-[1000] flex items-center justify-between gap-1.5 pointer-events-none">
          {/* Tile Layer Selector */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200/80 pointer-events-auto">
            <button
              type="button"
              onClick={() => setActiveLayer('streets')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeLayer === 'streets'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
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
            >
              <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Minimalis</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={handleResetView}
              className="p-2 rounded-2xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-emerald-700 shadow-md border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Pusatkan Kembali ke Peta RW 01"
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

        {/* Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-0 font-sans" />

        {/* Bottom Floating Legend & Mobile Helper */}
        <div className="absolute bottom-2.5 left-2.5 z-[1000] flex items-center gap-2 pointer-events-none">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-mono px-2.5 sm:px-3 py-1.5 rounded-xl shadow-md border border-white/10">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>7°49'06"S 112°02'35"E • Wilayah RW 01 Dusun Krajan (6 Blok RT)</span>
          </div>

          <div className="flex sm:hidden items-center gap-1 bg-slate-900/85 backdrop-blur-md text-white text-[9px] font-medium px-2 py-1 rounded-lg border border-white/10">
            <span>Gunakan 2 jari untuk navigasi</span>
          </div>
        </div>
      </div>

      {/* Interactive RT Detail Card / Drawer below map */}
      {selectedRt ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs transition-all animate-fade-in">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-sm"
                style={{ backgroundColor: selectedRt.color }}
              >
                RT {selectedRt.nomorRt}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    Bina Wilayah RW 01
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Estimasi Luas: {selectedRt.areaHectares} Ha</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedRt.nama}</h3>
                <p className="text-xs text-slate-600 font-medium">{selectedRt.blokName} • Dusun Doko Krajan</p>
              </div>
            </div>

            {/* Quick Metrics of this RT Box */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 px-4 text-center">
                <div className="text-[10px] font-bold uppercase text-slate-500">Kepala Keluarga</div>
                <div className="text-base font-black text-slate-900">{selectedRt.kkCount} KK</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 px-4 text-center">
                <div className="text-[10px] font-bold uppercase text-slate-500">Total Warga</div>
                <div className="text-base font-black text-emerald-700">{selectedRt.wargaCount} Jiwa</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 px-4 text-center">
                <div className="text-[10px] font-bold uppercase text-slate-500">Ketua RT</div>
                <div className="text-xs font-black text-slate-900">{selectedRt.ketua}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${selectedRt.phone.replace(/[^0-9]/g, '')}?text=Halo%20Ketua%20RT%20${selectedRt.nomorRt}%20terkait%20koordinasi%20RW%2001`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 px-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer press-down"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp Ketua RT</span>
                </a>

                {onSelectRt && (
                  <button
                    type="button"
                    onClick={() => onSelectRt(selectedRt.nomorRt)}
                    className="p-2.5 px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer press-down"
                  >
                    <span>Buka Data Warga RT {selectedRt.nomorRt}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Panduan RW:</strong> Peta wilayah RW 01 terbagi menjadi <strong>6 kotak blok RT</strong>. Klik pada salah satu kotak RT di peta untuk melihat profil batas wilayah, data kontak Ketua RT, dan statistik warganya.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="font-bold text-slate-800">Total Cakupan: 6 RT • 225 KK • 828 Jiwa</span>
          </div>
        </div>
      )}
    </div>
  );
};
