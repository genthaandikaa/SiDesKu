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
  Grid,
  Info,
  CheckCircle2,
  Home,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export interface DesaRwData {
  id: string;
  nomorRw: string;
  nama: string;
  dusun: string;
  ketuaRw: string;
  totalRt: number;
  totalKk: number;
  totalWarga: number;
  color: string;
  borderColor: string;
  center: [number, number];
  polygonCoords: [number, number][];
  rts: {
    id: string;
    nomorRt: string;
    nama: string;
    ketua: string;
    kk: number;
    warga: number;
    color: string;
    center: [number, number];
    polygonCoords: [number, number][];
  }[];
}

interface DesaTerritoryMapProps {
  onSelectScope?: (scope: { type: 'desa' | 'rw' | 'rt'; id: string }) => void;
}

export const DesaTerritoryMap: React.FC<DesaTerritoryMapProps> = ({
  onSelectScope
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const rwLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const rtLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const facilitiesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeLayer, setActiveLayer] = useState<'streets' | 'satellite' | 'voyager'>('streets');
  const [showRwLayer, setShowRwLayer] = useState<boolean>(true);
  const [showRtLayer, setShowRtLayer] = useState<boolean>(true);
  const [showFasumLayer, setShowFasumLayer] = useState<boolean>(true);
  const [selectedRwId, setSelectedRwId] = useState<string | null>(null);
  const [selectedRtId, setSelectedRtId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Center of Desa Doko, Kec. Ngasem, Kediri
  const desaCenter: [number, number] = [-7.81850, 112.04350];
  const desaZoom = 15;

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

  // Comprehensive territorial data: RWs & RT boxes of Desa Doko
  const rwDataList: DesaRwData[] = useMemo(() => [
    {
      id: 'rw_01',
      nomorRw: '01',
      nama: 'RW 01 Dusun Krajan',
      dusun: 'Dusun Doko Krajan',
      ketuaRw: 'Suryanto (Ketua RW 01)',
      totalRt: 6,
      totalKk: 225,
      totalWarga: 828,
      color: '#10b981', // Emerald
      borderColor: '#047857',
      center: [-7.81830, 112.04300],
      polygonCoords: [
        [-7.81570, 112.03960],
        [-7.81570, 112.04600],
        [-7.82100, 112.04620],
        [-7.82100, 112.03960],
      ],
      rts: [
        {
          id: 'rw01_rt01',
          nomorRt: '01',
          nama: 'RT 01 Krajan Barat',
          ketua: 'Supriyadi',
          kk: 42,
          warga: 156,
          color: '#10b981',
          center: [-7.81690, 112.04105],
          polygonCoords: [
            [-7.81580, 112.03980],
            [-7.81580, 112.04230],
            [-7.81800, 112.04230],
            [-7.81800, 112.03980],
          ]
        },
        {
          id: 'rw01_rt02',
          nomorRt: '02',
          nama: 'RT 02 Krajan Utara',
          ketua: 'Hendra Gunawan',
          kk: 38,
          warga: 142,
          color: '#3b82f6',
          center: [-7.81690, 112.04405],
          polygonCoords: [
            [-7.81580, 112.04230],
            [-7.81580, 112.04580],
            [-7.81800, 112.04580],
            [-7.81800, 112.04230],
          ]
        },
        {
          id: 'rw01_rt03',
          nomorRt: '03',
          nama: 'RT 03 Krajan Timur',
          ketua: 'Drs. Joko Santoso',
          kk: 35,
          warga: 128,
          color: '#8b5cf6',
          center: [-7.81870, 112.04485],
          polygonCoords: [
            [-7.81800, 112.04350],
            [-7.81800, 112.04620],
            [-7.81940, 112.04620],
            [-7.81940, 112.04350],
          ]
        },
        {
          id: 'rw01_rt04',
          nomorRt: '04',
          nama: 'RT 04 Krajan Tengah',
          ketua: 'Ahmad Subari',
          kk: 40,
          warga: 148,
          color: '#f59e0b',
          center: [-7.81870, 112.04175],
          polygonCoords: [
            [-7.81800, 112.04000],
            [-7.81800, 112.04350],
            [-7.81940, 112.04350],
            [-7.81940, 112.04000],
          ]
        },
        {
          id: 'rw01_rt05',
          nomorRt: '05',
          nama: 'RT 05 Krajan Barat Daya',
          ketua: 'Bambang Sugiono',
          kk: 36,
          warga: 134,
          color: '#06b6d4',
          center: [-7.82010, 112.04170],
          polygonCoords: [
            [-7.81940, 112.04020],
            [-7.81940, 112.04320],
            [-7.82080, 112.04320],
            [-7.82080, 112.04020],
          ]
        },
        {
          id: 'rw01_rt06',
          nomorRt: '06',
          nama: 'RT 06 Krajan Tenggara',
          ketua: 'Kuswanto',
          kk: 34,
          warga: 120,
          color: '#f43f5e',
          center: [-7.82010, 112.04460],
          polygonCoords: [
            [-7.81940, 112.04320],
            [-7.81940, 112.04600],
            [-7.82080, 112.04600],
            [-7.82080, 112.04320],
          ]
        }
      ]
    },
    {
      id: 'rw_02',
      nomorRw: '02',
      nama: 'RW 02 Dusun Doko Kidul',
      dusun: 'Dusun Doko Kidul',
      ketuaRw: 'Drs. H. Mulyadi',
      totalRt: 4,
      totalKk: 160,
      totalWarga: 590,
      color: '#3b82f6', // Blue
      borderColor: '#1d4ed8',
      center: [-7.82350, 112.04350],
      polygonCoords: [
        [-7.82120, 112.03960],
        [-7.82120, 112.04620],
        [-7.82580, 112.04620],
        [-7.82580, 112.03960],
      ],
      rts: [
        {
          id: 'rw02_rt01',
          nomorRt: '01',
          nama: 'RT 01 Doko Kidul',
          ketua: 'Sutrisno',
          kk: 45,
          warga: 165,
          color: '#3b82f6',
          center: [-7.82230, 112.04150],
          polygonCoords: [
            [-7.82130, 112.03980],
            [-7.82130, 112.04300],
            [-7.82350, 112.04300],
            [-7.82350, 112.03980],
          ]
        },
        {
          id: 'rw02_rt02',
          nomorRt: '02',
          nama: 'RT 02 Doko Kidul',
          ketua: 'Wahyu Widodo',
          kk: 40,
          warga: 145,
          color: '#0284c7',
          center: [-7.82230, 112.04450],
          polygonCoords: [
            [-7.82130, 112.04300],
            [-7.82130, 112.04600],
            [-7.82350, 112.04600],
            [-7.82350, 112.04300],
          ]
        },
        {
          id: 'rw02_rt03',
          nomorRt: '03',
          nama: 'RT 03 Doko Kidul',
          ketua: 'Agus Salim',
          kk: 38,
          warga: 140,
          color: '#0369a1',
          center: [-7.82460, 112.04150],
          polygonCoords: [
            [-7.82350, 112.03980],
            [-7.82350, 112.04300],
            [-7.82560, 112.04300],
            [-7.82560, 112.03980],
          ]
        },
        {
          id: 'rw02_rt04',
          nomorRt: '04',
          nama: 'RT 04 Doko Kidul',
          ketua: 'Tri Handoko',
          kk: 37,
          warga: 140,
          color: '#075985',
          center: [-7.82460, 112.04450],
          polygonCoords: [
            [-7.82350, 112.04300],
            [-7.82350, 112.04600],
            [-7.82560, 112.04600],
            [-7.82560, 112.04300],
          ]
        }
      ]
    },
    {
      id: 'rw_03',
      nomorRw: '03',
      nama: 'RW 03 Dusun Bangsal',
      dusun: 'Dusun Bangsal',
      ketuaRw: 'Sunardi',
      totalRt: 3,
      totalKk: 110,
      totalWarga: 410,
      color: '#8b5cf6', // Violet
      borderColor: '#6d28d9',
      center: [-7.81830, 112.04850],
      polygonCoords: [
        [-7.81600, 112.04650],
        [-7.81600, 112.05200],
        [-7.82100, 112.05200],
        [-7.82100, 112.04650],
      ],
      rts: [
        {
          id: 'rw03_rt01',
          nomorRt: '01',
          nama: 'RT 01 Bangsal',
          ketua: 'M. Ali',
          kk: 40,
          warga: 150,
          color: '#8b5cf6',
          center: [-7.81750, 112.04900],
          polygonCoords: [
            [-7.81620, 112.04670],
            [-7.81620, 112.05180],
            [-7.81880, 112.05180],
            [-7.81880, 112.04670],
          ]
        },
        {
          id: 'rw03_rt02',
          nomorRt: '02',
          nama: 'RT 02 Bangsal',
          ketua: 'Kasto',
          kk: 35,
          warga: 130,
          color: '#7c3aed',
          center: [-7.81980, 112.04900],
          polygonCoords: [
            [-7.81880, 112.04670],
            [-7.81880, 112.05180],
            [-7.82080, 112.05180],
            [-7.82080, 112.04670],
          ]
        }
      ]
    }
  ], []);

  // Fasilitas Utama Tingkat Desa
  const desaFacilities = useMemo(() => [
    {
      id: 'kantor_desa',
      nama: 'Kantor Balai Desa Doko',
      tipe: 'Pusat Pemerintahan Desa',
      icon: '🏛️',
      lat: -7.81820,
      lng: 112.04290,
      desc: 'Pusat pelayanan administrasi kependudukan, legalisasi surat resmi, dan kantor Kepala Desa Doko.'
    },
    {
      id: 'pustu_doko',
      nama: 'Puskesmas Pembantu (Pustu) Doko',
      tipe: 'Fasilitas Kesehatan Desa',
      icon: '🏥',
      lat: -7.81650,
      lng: 112.04150,
      desc: 'Layanan kesehatan tingkat pertama, rujukan BPJS, dan imunisasi warga Desa Doko.'
    },
    {
      id: 'sdn_doko',
      nama: 'SD Negeri Doko',
      tipe: 'Pendidikan Dasar',
      icon: '🏫',
      lat: -7.81950,
      lng: 112.04480,
      desc: 'Sekolah Dasar Negeri binaan Dinas Pendidikan Kabupaten Kediri.'
    },
    {
      id: 'pasar_doko',
      nama: 'Pasar Rakyat & UMKM Desa Doko',
      tipe: 'Pusat Perekonomian Desa',
      icon: '🏪',
      lat: -7.82200,
      lng: 112.04300,
      desc: 'Pusat transaksi niaga hasil pertanian, toko kelontong, dan kuliner tradisional warga.'
    }
  ], []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: desaCenter,
        zoom: desaZoom,
        minZoom: 13,
        maxZoom: 19,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

      // Tile layer
      const initialTile = L.tileLayer(tileUrls[activeLayer], {
        attribution: tileAttributions[activeLayer],
        maxZoom: 19,
      }).addTo(map);
      currentTileLayerRef.current = initialTile;

      // Layer groups
      rwLayerGroupRef.current = L.layerGroup().addTo(map);
      rtLayerGroupRef.current = L.layerGroup().addTo(map);
      facilitiesLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Layer Switching
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

  // Render RW Layer (Big Boundaries)
  useEffect(() => {
    if (!mapInstanceRef.current || !rwLayerGroupRef.current) return;

    rwLayerGroupRef.current.clearLayers();

    if (!showRwLayer) return;

    rwDataList.forEach((rw) => {
      const isCur = selectedRwId === rw.id;

      // Outer RW polygon
      const polygon = L.polygon(rw.polygonCoords, {
        color: rw.borderColor,
        weight: isCur ? 4 : 2,
        fillColor: rw.color,
        fillOpacity: isCur ? 0.28 : 0.12,
        dashArray: '6, 6',
      });

      polygon.bindTooltip(`
        <div class="font-sans text-xs space-y-0.5">
          <div class="font-black text-slate-900">${rw.nama}</div>
          <div class="text-[10px] text-slate-600">👤 Ketua: <strong>${rw.ketuaRw}</strong></div>
          <div class="text-[10px] text-emerald-800 font-bold">🏛️ ${rw.totalRt} RT • ${rw.totalKk} KK • ${rw.totalWarga} Jiwa</div>
        </div>
      `, { sticky: true });

      polygon.on('click', () => {
        setSelectedRwId(rw.id);
        setSelectedRtId(null);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(rw.center, 16, { duration: 0.8 });
        }
      });

      rwLayerGroupRef.current?.addLayer(polygon);

      // RW Center Label Badge
      const rwBadgeIcon = L.divIcon({
        className: 'custom-rw-center-icon',
        html: `
          <div class="cursor-pointer select-none px-3 py-1.5 rounded-2xl shadow-md border bg-slate-900/90 text-white border-white/80 backdrop-blur-xs flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${rw.color};"></span>
            <div class="leading-none text-left">
              <div class="font-black text-[12px]">${rw.nama}</div>
              <div class="text-[9px] text-slate-300 font-semibold mt-0.5">${rw.totalRt} RT • ${rw.totalWarga} Jiwa</div>
            </div>
          </div>
        `,
        iconSize: [140, 40],
        iconAnchor: [70, 20],
      });

      const rwMarker = L.marker(rw.center, { icon: rwBadgeIcon });
      rwMarker.on('click', () => {
        setSelectedRwId(rw.id);
        setSelectedRtId(null);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(rw.center, 16, { duration: 0.8 });
        }
      });

      rwLayerGroupRef.current?.addLayer(rwMarker);
    });
  }, [rwDataList, selectedRwId, showRwLayer]);

  // Render RT Sub-boxes
  useEffect(() => {
    if (!mapInstanceRef.current || !rtLayerGroupRef.current) return;

    rtLayerGroupRef.current.clearLayers();

    if (!showRtLayer) return;

    rwDataList.forEach((rw) => {
      // If an RW is selected, only show RTs in that RW, or show all if none selected
      if (selectedRwId && selectedRwId !== rw.id) return;

      rw.rts.forEach((rt) => {
        const isRtSelected = selectedRtId === rt.id;

        const rtPolygon = L.polygon(rt.polygonCoords, {
          color: isRtSelected ? '#0f172a' : rt.color,
          weight: isRtSelected ? 3.5 : 2,
          fillColor: rt.color,
          fillOpacity: isRtSelected ? 0.45 : 0.25,
        });

        rtPolygon.bindTooltip(`
          <div class="font-sans text-[11px] space-y-0.5">
            <div class="font-black text-slate-900">${rt.nama} (${rw.nomorRw})</div>
            <div class="text-[10px] text-slate-600">👤 Ketua: <strong>${rt.ketua}</strong></div>
            <div class="text-[10px] text-emerald-800 font-bold">${rt.kk} KK • ${rt.warga} Jiwa</div>
          </div>
        `, { sticky: true });

        rtPolygon.on('click', () => {
          setSelectedRwId(rw.id);
          setSelectedRtId(rt.id);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo(rt.center, 17.5, { duration: 0.8 });
          }
        });

        rtLayerGroupRef.current?.addLayer(rtPolygon);

        // RT Mini Label
        const rtIcon = L.divIcon({
          className: 'custom-rt-mini-icon',
          html: `
            <div class="cursor-pointer select-none px-2 py-1 rounded-xl shadow-xs border bg-white/95 text-slate-900 border-slate-300 font-black text-[10px] flex items-center gap-1">
              <span class="w-2 h-2 rounded-full" style="background-color: ${rt.color};"></span>
              <span>RT ${rt.nomorRt}</span>
            </div>
          `,
          iconSize: [60, 26],
          iconAnchor: [30, 13],
        });

        const rtMarker = L.marker(rt.center, { icon: rtIcon });
        rtMarker.on('click', () => {
          setSelectedRwId(rw.id);
          setSelectedRtId(rt.id);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo(rt.center, 17.5, { duration: 0.8 });
          }
        });

        rtLayerGroupRef.current?.addLayer(rtMarker);
      });
    });
  }, [rwDataList, selectedRwId, selectedRtId, showRtLayer]);

  // Render Desa Facilities
  useEffect(() => {
    if (!mapInstanceRef.current || !facilitiesLayerGroupRef.current) return;

    facilitiesLayerGroupRef.current.clearLayers();

    if (!showFasumLayer) return;

    desaFacilities.forEach((fac) => {
      const facIcon = L.divIcon({
        className: 'custom-desa-fac',
        html: `
          <div class="relative group cursor-pointer transition-transform duration-300 hover:scale-120">
            <div class="w-8 h-8 rounded-xl bg-white shadow-md border-2 border-slate-800 flex items-center justify-center text-sm">
              <span>${fac.icon}</span>
            </div>
            <div class="w-2 h-2 mx-auto -mt-1 rotate-45 bg-white border-r border-b border-slate-800"></div>
          </div>
        `,
        iconSize: [32, 38],
        iconAnchor: [16, 38],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([fac.lat, fac.lng], { icon: facIcon });
      marker.bindPopup(`
        <div class="p-1 font-sans space-y-1 min-w-[200px] text-left">
          <div class="flex items-center gap-2 border-b border-slate-100 pb-1">
            <span class="text-base">${fac.icon}</span>
            <div>
              <div class="font-black text-xs text-slate-900">${fac.nama}</div>
              <div class="text-[10px] text-emerald-700 font-bold">${fac.tipe}</div>
            </div>
          </div>
          <div class="text-[11px] text-slate-600 leading-snug">${fac.desc}</div>
        </div>
      `, { maxWidth: 250, className: 'modern-leaflet-popup' });

      facilitiesLayerGroupRef.current?.addLayer(marker);
    });
  }, [desaFacilities, showFasumLayer]);

  const handleReset = () => {
    setSelectedRwId(null);
    setSelectedRtId(null);
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(desaCenter, desaZoom, { duration: 1 });
  };

  const selectedRw = useMemo(() => {
    return rwDataList.find((r) => r.id === selectedRwId) || null;
  }, [rwDataList, selectedRwId]);

  const selectedRt = useMemo(() => {
    if (!selectedRw || !selectedRtId) return null;
    return selectedRw.rts.find((r) => r.id === selectedRtId) || null;
  }, [selectedRw, selectedRtId]);

  return (
    <div className="space-y-4 font-sans">
      {/* Top Controls: Tier Switcher */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-black text-slate-700 mr-1 flex items-center gap-1">
            <Grid className="w-3.5 h-3.5 text-emerald-700" />
            <span>Tingkat Wilayah:</span>
          </span>

          <button
            type="button"
            onClick={handleReset}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              !selectedRwId
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Semua Desa Doko
          </button>

          {rwDataList.map((rw) => {
            const isCur = selectedRwId === rw.id;
            return (
              <button
                key={rw.id}
                type="button"
                onClick={() => {
                  setSelectedRwId(rw.id);
                  setSelectedRtId(null);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo(rw.center, 16, { duration: 0.8 });
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCur
                    ? 'text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
                style={{
                  backgroundColor: isCur ? rw.color : undefined,
                  borderColor: isCur ? rw.borderColor : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isCur ? '#ffffff' : rw.color }}
                />
                <span>RW {rw.nomorRw}</span>
              </button>
            );
          })}
        </div>

        {/* Layer Checkbox Toggles */}
        <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showRwLayer}
              onChange={(e) => setShowRwLayer(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span>Blok RW</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showRtLayer}
              onChange={(e) => setShowRtLayer(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span>Kotak Blok RT</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showFasumLayer}
              onChange={(e) => setShowFasumLayer(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span>Fasum Desa</span>
          </label>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div
        className={`relative w-full rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all bg-slate-900 ${
          isFullscreen ? 'fixed inset-4 z-[99999] h-[calc(100vh-2rem)]' : 'aspect-[16/10] sm:aspect-[16/9] min-h-[460px]'
        }`}
      >
        {/* Floating Top Bar (Controls) */}
        <div className="absolute top-3.5 inset-x-3.5 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200/80 pointer-events-auto">
            <button
              type="button"
              onClick={() => setActiveLayer('streets')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeLayer === 'streets'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Peta Jalan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayer('satellite')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeLayer === 'satellite'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Foto Satelit</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayer('voyager')}
              className={`hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-bold transition-all items-center gap-1.5 cursor-pointer ${
                activeLayer === 'voyager'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Minimalis</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-2xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-emerald-700 shadow-md border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Pusatkan ke Seluruh Desa Doko"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-2xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-emerald-700 shadow-md border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer"
              title={isFullscreen ? 'Kecilkan Peta' : 'Layar Penuh Peta'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-0 font-sans" />

        {/* Bottom Floating Legend / Coordinates Badge */}
        <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-2 bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-mono px-3 py-1.5 rounded-xl shadow-md border border-white/10 pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          <span>7°49'07"S 112°02'37"E • Peta Geospasial Terpadu Desa Doko (RW & RT)</span>
        </div>
      </div>

      {/* Info Card / Drawer for Selected RW or RT */}
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
                    {selectedRw?.nama}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedRt.nama}</h3>
                <p className="text-xs text-slate-600 font-medium">Ketua RT: {selectedRt.ketua} • Desa Doko</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 px-4 text-center">
                <div className="text-[10px] font-bold uppercase text-slate-500">Kepala Keluarga</div>
                <div className="text-base font-black text-slate-900">{selectedRt.kk} KK</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 px-4 text-center">
                <div className="text-[10px] font-bold uppercase text-slate-500">Total Warga</div>
                <div className="text-base font-black text-emerald-700">{selectedRt.warga} Jiwa</div>
              </div>
            </div>
          </div>
        </div>
      ) : selectedRw ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs transition-all animate-fade-in">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-sm"
                style={{ backgroundColor: selectedRw.color }}
              >
                RW {selectedRw.nomorRw}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {selectedRw.dusun}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedRw.nama}</h3>
                <p className="text-xs text-slate-600 font-medium">Ketua RW: {selectedRw.ketuaRw}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 px-4 text-center">
                <div className="text-[10px] font-bold uppercase text-slate-500">Jumlah RT</div>
                <div className="text-base font-black text-slate-900">{selectedRw.totalRt} RT</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 px-4 text-center">
                <div className="text-[10px] font-bold uppercase text-slate-500">Total KK</div>
                <div className="text-base font-black text-slate-900">{selectedRw.totalKk} KK</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2.5 px-4 text-center">
                <div className="text-[10px] font-bold uppercase text-slate-500">Total Warga</div>
                <div className="text-base font-black text-emerald-700">{selectedRw.totalWarga} Jiwa</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              💡 <strong>Hierarki GIS Desa:</strong> Peta membagi Desa Doko ke dalam <strong>Blok RW</strong>, kemudian <strong>Kotak RT</strong> di dalamnya, serta fasilitas umum desa. Klik blok RW atau kotak RT untuk inspeksi data spasial.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span className="font-bold text-slate-800">Total Teritorial: 3 RW • 13 RT • 1.828 Jiwa</span>
          </div>
        </div>
      )}
    </div>
  );
};
