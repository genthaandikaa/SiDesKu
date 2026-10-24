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
  ChevronRight,
  ArrowLeft,
  Compass
} from 'lucide-react';
import api from '@/shared/lib/axios';

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
  const drawingLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeLayer, setActiveLayer] = useState<'streets' | 'satellite' | 'voyager'>('streets');
  const [showFasumLayer, setShowFasumLayer] = useState<boolean>(true);
  const [selectedRwId, setSelectedRwId] = useState<string | null>(null);
  const [selectedRtId, setSelectedRtId] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(15);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [drawSuccessAlert, setDrawSuccessAlert] = useState<string | null>(null);

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
        },
        {
          id: 'rw03_rt03',
          nomorRt: '03',
          nama: 'RT 03 Bangsal',
          ketua: 'Sudarno',
          kk: 35,
          warga: 130,
          color: '#6d28d9',
          center: [-7.82040, 112.05050],
          polygonCoords: [
            [-7.81880, 112.04950],
            [-7.81880, 112.05180],
            [-7.82080, 112.05180],
            [-7.82080, 112.04950],
          ]
        }
      ]
    }
  ], []);

  // Fasilitas Utama Tingkat Desa dengan posisi yang rapi & tidak menumpuk dengan pusat RW
  const desaFacilities = useMemo(() => [
    {
      id: 'kantor_desa',
      nama: 'Kantor Balai Desa Doko',
      tipe: 'Pusat Pelayanan Warga',
      icon: 'landmark',
      lat: -7.81760,
      lng: 112.04320,
      desc: 'Pusat pelayanan administrasi kependudukan, legalisasi surat resmi, dan kantor Kepala Desa Doko.'
    },
    {
      id: 'pustu_doko',
      nama: 'Puskesmas Pembantu (Pustu) Doko',
      tipe: 'Layanan Kesehatan Desa',
      icon: 'hospital',
      lat: -7.81640,
      lng: 112.04120,
      desc: 'Layanan kesehatan tingkat pertama, rujukan BPJS, dan imunisasi warga Desa Doko.'
    },
    {
      id: 'sdn_doko',
      nama: 'SD Negeri Doko',
      tipe: 'Pendidikan Dasar',
      icon: 'school',
      lat: -7.81960,
      lng: 112.04520,
      desc: 'Sekolah Dasar Negeri binaan Dinas Pendidikan Kabupaten Kediri.'
    },
    {
      id: 'pasar_doko',
      nama: 'Pasar Rakyat & UMKM Desa Doko',
      tipe: 'Pusat Perekonomian Desa',
      icon: 'store',
      lat: -7.82220,
      lng: 112.04300,
      desc: 'Pusat transaksi niaga hasil pertanian, toko kelontong, dan kuliner tradisional warga.'
    }
  ], []);

  // Inisialisasi Peta Leaflet
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

      // Tile layer awal
      const initialTile = L.tileLayer(tileUrls[activeLayer], {
        attribution: tileAttributions[activeLayer],
        maxZoom: 19,
      }).addTo(map);
      currentTileLayerRef.current = initialTile;

      // Layer groups
      rwLayerGroupRef.current = L.layerGroup().addTo(map);
      rtLayerGroupRef.current = L.layerGroup().addTo(map);
      facilitiesLayerGroupRef.current = L.layerGroup().addTo(map);

      // Track zoom level for progressive disclosure
      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Mode Menggambar Batas Wilayah (Non-IT User Friendly)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!drawingLayerGroupRef.current) {
      drawingLayerGroupRef.current = L.layerGroup().addTo(map);
    }

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isDrawingMode) {
        setDrawnPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawingMode]);

  // Render titik dan garis poligon hasil gambar
  useEffect(() => {
    const group = drawingLayerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (drawnPoints.length > 0) {
      drawnPoints.forEach((pt, idx) => {
        const marker = L.circleMarker(pt, {
          radius: 7,
          fillColor: '#f59e0b',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1,
        }).bindTooltip(`Titik ${idx + 1}: ${pt[0].toFixed(5)}, ${pt[1].toFixed(5)}`);
        group.addLayer(marker);
      });

      if (drawnPoints.length >= 2) {
        const poly = L.polygon(drawnPoints, {
          color: '#f59e0b',
          weight: 3,
          dashArray: '5, 5',
          fillColor: '#fef3c7',
          fillOpacity: 0.4,
        });
        group.addLayer(poly);
      }
    }
  }, [drawnPoints]);

  // Ganti Layer Tile (Jalan / Satelit / Voyager)
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

  // Handle Pilih RW
  const handleSelectRw = (rwId: string) => {
    const targetRw = rwDataList.find(r => r.id === rwId);
    if (!targetRw) return;

    setSelectedRwId(rwId);
    setSelectedRtId(null);

    if (onSelectScope) {
      onSelectScope({ type: 'rw', id: rwId });
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(targetRw.center, 16.5, { duration: 0.8 });
    }
  };

  // Handle Pilih RT
  const handleSelectRt = (rwId: string, rtId: string) => {
    const targetRw = rwDataList.find(r => r.id === rwId);
    const targetRt = targetRw?.rts.find(r => r.id === rtId);
    if (!targetRt) return;

    setSelectedRwId(rwId);
    setSelectedRtId(rtId);

    if (onSelectScope) {
      onSelectScope({ type: 'rt', id: rtId });
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(targetRt.center, 17.5, { duration: 0.8 });
    }
  };

  // Reset ke Tampilan Seluruh Desa
  const handleResetToDesa = () => {
    setSelectedRwId(null);
    setSelectedRtId(null);

    if (onSelectScope) {
      onSelectScope({ type: 'desa', id: 'desa_doko' });
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(desaCenter, desaZoom, { duration: 0.9 });
    }
  };

  // 1. RENDER RW LAYER (POLIGON & BADGE RW)
  useEffect(() => {
    if (!mapInstanceRef.current || !rwLayerGroupRef.current) return;

    rwLayerGroupRef.current.clearLayers();

    rwDataList.forEach((rw) => {
      const isCur = selectedRwId === rw.id;
      const isAnyRwSelected = Boolean(selectedRwId);

      // Poligon RW: garis tegas, warna ramah di mata
      const polygon = L.polygon(rw.polygonCoords, {
        color: rw.borderColor,
        weight: isCur ? 3.5 : 2,
        fillColor: rw.color,
        fillOpacity: isCur ? 0.25 : isAnyRwSelected ? 0.04 : 0.12,
        dashArray: isCur ? undefined : '5, 5',
      });

      polygon.bindTooltip(`
        <div class="font-sans text-xs space-y-0.5 text-left">
          <div class="font-black text-slate-900">${rw.nama}</div>
          <div class="text-[10px] text-slate-600">Ketua: <strong>${rw.ketuaRw}</strong></div>
          <div class="text-[10px] text-emerald-800 font-bold">${rw.totalRt} RT • ${rw.totalKk} KK • ${rw.totalWarga} Jiwa</div>
          <div class="text-[9px] text-emerald-600 font-medium mt-1">Klik untuk melihat rincian RT</div>
        </div>
      `, { sticky: true, className: 'modern-leaflet-tooltip' });

      polygon.on('click', () => {
        handleSelectRw(rw.id);
      });

      rwLayerGroupRef.current?.addLayer(polygon);

      // Render Badge RW HANYA saat di level Desa (selectedRwId === null)
      // Ini kunci utama mencegah penumpukan teks dengan RT & fasilitas!
      if (!isAnyRwSelected) {
        const rwBadgeIcon = L.divIcon({
          className: 'custom-rw-compact-badge',
          html: `
            <div class="cursor-pointer select-none px-3 py-1.5 rounded-full shadow-md border-2 bg-white/95 text-slate-900 border-slate-300 hover:border-emerald-600 backdrop-blur-xs flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95">
              <span class="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style="background-color: ${rw.color};"></span>
              <span class="font-black text-xs text-slate-900 whitespace-nowrap">RW ${rw.nomorRw}</span>
              <span class="text-[10px] font-bold text-slate-500 whitespace-nowrap hidden sm:inline">${rw.dusun.replace('Dusun ', '')}</span>
              <span class="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-full font-extrabold whitespace-nowrap ml-0.5">${rw.totalRt} RT</span>
            </div>
          `,
          iconSize: [110, 30],
          iconAnchor: [55, 15],
        });

        const rwMarker = L.marker(rw.center, { icon: rwBadgeIcon });
        rwMarker.on('click', () => {
          handleSelectRw(rw.id);
        });

        rwLayerGroupRef.current?.addLayer(rwMarker);
      }
    });
  }, [rwDataList, selectedRwId]);

  // 2. RENDER RT LAYER (HANYA MUNCUL KETIKA RW DIPILIH ATAU ZOOM >= 16.5)
  useEffect(() => {
    if (!mapInstanceRef.current || !rtLayerGroupRef.current) return;

    rtLayerGroupRef.current.clearLayers();

    // Semantic Zooming: JANGAN render kotak RT saat melihat peta skala makro desa!
    // Ini mengeliminasi 100% bug tumpukan marker di layar HP!
    const shouldShowRt = Boolean(selectedRwId) || currentZoom >= 16.5;
    if (!shouldShowRt) return;

    rwDataList.forEach((rw) => {
      // Jika sebuah RW sedang dipilih, hanya render RT di RW tersebut
      if (selectedRwId && selectedRwId !== rw.id) return;

      rw.rts.forEach((rt) => {
        const isRtSelected = selectedRtId === rt.id;

        // Poligon RT
        const rtPolygon = L.polygon(rt.polygonCoords, {
          color: isRtSelected ? '#0f172a' : rt.color,
          weight: isRtSelected ? 3.5 : 1.5,
          fillColor: rt.color,
          fillOpacity: isRtSelected ? 0.38 : 0.18,
        });

        rtPolygon.bindTooltip(`
          <div class="font-sans text-[11px] space-y-0.5 text-left">
            <div class="font-black text-slate-900">${rt.nama}</div>
            <div class="text-[10px] text-slate-600">Ketua RT: <strong>${rt.ketua}</strong></div>
            <div class="text-[10px] text-emerald-800 font-bold">${rt.kk} KK • ${rt.warga} Jiwa</div>
          </div>
        `, { sticky: true });

        rtPolygon.on('click', () => {
          handleSelectRt(rw.id, rt.id);
        });

        rtLayerGroupRef.current?.addLayer(rtPolygon);

        // RT Compact Pill Marker
        const rtIcon = L.divIcon({
          className: 'custom-rt-compact-icon',
          html: `
            <div class="cursor-pointer select-none px-2 py-1 rounded-xl shadow-xs border bg-white/95 text-slate-900 ${
              isRtSelected ? 'border-slate-900 ring-2 ring-slate-900/30' : 'border-slate-300'
            } font-black text-[10px] flex items-center gap-1 transition-transform hover:scale-110">
              <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${rt.color};"></span>
              <span class="font-black">RT ${rt.nomorRt}</span>
              <span class="text-[9px] text-slate-500 font-medium hidden sm:inline">(${rt.warga} jiwa)</span>
            </div>
          `,
          iconSize: [68, 24],
          iconAnchor: [34, 12],
        });

        const rtMarker = L.marker(rt.center, { icon: rtIcon });
        rtMarker.on('click', () => {
          handleSelectRt(rw.id, rt.id);
        });

        rtLayerGroupRef.current?.addLayer(rtMarker);
      });
    });
  }, [rwDataList, selectedRwId, selectedRtId, currentZoom]);

  // 3. RENDER FASILITAS UTAMA DESA
  useEffect(() => {
    if (!mapInstanceRef.current || !facilitiesLayerGroupRef.current) return;

    facilitiesLayerGroupRef.current.clearLayers();

    if (!showFasumLayer) return;

    desaFacilities.forEach((fac) => {
      const facIcon = L.divIcon({
        className: 'custom-desa-fac',
        html: `
          <div class="relative group cursor-pointer transition-transform duration-200 hover:scale-115">
            <div class="w-7 h-7 rounded-xl bg-white shadow-md border-2 border-slate-800 flex items-center justify-center text-xs">
              <span>${fac.icon}</span>
            </div>
            <div class="w-1.5 h-1.5 mx-auto -mt-0.5 rotate-45 bg-white border-r border-b border-slate-800"></div>
          </div>
        `,
        iconSize: [28, 32],
        iconAnchor: [14, 32],
        popupAnchor: [0, -30],
      });

      const marker = L.marker([fac.lat, fac.lng], { icon: facIcon });
      marker.bindPopup(`
        <div class="p-1 font-sans space-y-1 min-w-[190px] text-left">
          <div class="flex items-center gap-2 border-b border-slate-100 pb-1">
            <span class="text-base">${fac.icon}</span>
            <div>
              <div class="font-black text-xs text-slate-900 leading-tight">${fac.nama}</div>
              <div class="text-[10px] text-emerald-700 font-bold">${fac.tipe}</div>
            </div>
          </div>
          <div class="text-[11px] text-slate-600 leading-snug">${fac.desc}</div>
        </div>
      `, { maxWidth: 240, className: 'modern-leaflet-popup' });

      facilitiesLayerGroupRef.current?.addLayer(marker);
    });
  }, [desaFacilities, showFasumLayer]);

  const selectedRw = useMemo(() => {
    return rwDataList.find((r) => r.id === selectedRwId) || null;
  }, [rwDataList, selectedRwId]);

  const selectedRt = useMemo(() => {
    if (!selectedRw || !selectedRtId) return null;
    return selectedRw.rts.find((r) => r.id === selectedRtId) || null;
  }, [selectedRw, selectedRtId]);

  return (
    <div className="space-y-3.5 font-sans">
      
      {/* BILAH ATAS: Pemilih Tingkat Wilayah (Scrollable horizontal, thumb-friendly di Mobile) */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-xs font-black text-slate-700 mr-1 hidden md:flex items-center gap-1 shrink-0">
            <Compass className="w-3.5 h-3.5 text-emerald-700" />
            <span>Fokus Wilayah:</span>
          </span>

          <button
            type="button"
            onClick={handleResetToDesa}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              !selectedRwId
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>Seluruh Desa Doko</span>
          </button>

          {rwDataList.map((rw) => {
            const isCur = selectedRwId === rw.id;
            return (
              <button
                key={rw.id}
                type="button"
                onClick={() => handleSelectRw(rw.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
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
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: isCur ? '#ffffff' : rw.color }}
                />
                <span>RW {rw.nomorRw}</span>
                <span className="text-[10px] opacity-80 hidden xs:inline">({rw.totalRt} RT)</span>
              </button>
            );
          })}
        </div>

        {/* Fasum Toggle Chip */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-bold text-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setShowFasumLayer(!showFasumLayer)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              showFasumLayer
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-400 border-slate-200'
            }`}
          >
            <span>Fasilitas Desa</span>
            <span className={`w-2 h-2 rounded-full ${showFasumLayer ? 'bg-emerald-600' : 'bg-slate-300'}`}></span>
          </button>
        </div>
      </div>

      {/* KANVAS PETA UTAMA */}
      <div
        className={`relative w-full rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all bg-slate-900 ${
          isFullscreen
            ? 'fixed inset-3 z-[99999] h-[calc(100vh-1.5rem)]'
            : 'aspect-[4/3] sm:aspect-[16/9] min-h-[380px] sm:min-h-[460px]'
        }`}
      >
        {/* Floating Top Bar (Peta Jalan / Satelit & Aksi) */}
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
              onClick={() => {
                setIsDrawingMode(!isDrawingMode);
                if (isDrawingMode) {
                  setDrawnPoints([]);
                }
              }}
              className={`px-3 py-1.5 rounded-2xl backdrop-blur-md shadow-md border text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isDrawingMode
                  ? 'bg-amber-600 text-white border-amber-500 ring-2 ring-amber-400/40 animate-pulse'
                  : 'bg-white/95 text-slate-700 hover:text-emerald-700 border-slate-200/80 hover:bg-slate-50'
              }`}
              title="Alat Gambar Batas Wilayah RT/RW untuk Non-IT"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isDrawingMode ? 'Mode Gambar Aktif' : 'Atur Batas'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDesa}
              className="p-2 rounded-2xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-emerald-700 shadow-md border border-slate-200/80 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Pusatkan ke Seluruh Desa Doko"
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

        {/* Floating Non-IT Drawing Control Bar */}
        {isDrawingMode && (
          <div className="absolute top-14 sm:top-16 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-[1000] pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-amber-400/30 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span className="font-bold text-amber-300">Mode Gambar Batas (Klik Peta):</span>
              <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold">
                {drawnPoints.length} Titik
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const pt: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                        setDrawnPoints((prev) => [...prev, pt]);
                        mapInstanceRef.current?.setView(pt, 17);
                      },
                      () => alert('Gagal membaca GPS perangkat.')
                    );
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                title="Ambil koordinat GPS perangkat Anda saat ini"
              >
                <MapPin className="w-3 h-3" />
                <span>GPS Saya</span>
              </button>

              <button
                type="button"
                disabled={drawnPoints.length === 0}
                onClick={() => setDrawnPoints((prev) => prev.slice(0, -1))}
                className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white font-medium text-[11px] cursor-pointer"
              >
                Hapus Titik
              </button>

              <button
                type="button"
                onClick={() => {
                  if (drawnPoints.length < 3) {
                    alert('Minimal butuh 3 titik koordinat untuk membentuk poligon batas wilayah.');
                    return;
                  }
                  // Simpan ke storage sistem
                  const geoJson = {
                    type: 'Polygon',
                    coordinates: [drawnPoints.map((p) => [p[1], p[0]])],
                  };
                  localStorage.setItem('sidesku_custom_boundary', JSON.stringify(geoJson));
                  api.put('/settings/desa', { territory_geojson: JSON.stringify(geoJson) }).catch(() => {});
                  setDrawSuccessAlert('Batas wilayah berhasil digenerate otomatis dan tersimpan di server desa!');
                  setIsDrawingMode(false);
                  setTimeout(() => setDrawSuccessAlert(null), 4000);
                }}
                disabled={drawnPoints.length < 3}
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-black text-[11px] cursor-pointer shadow-xs flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Simpan Batas</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {drawSuccessAlert && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{drawSuccessAlert}</span>
          </div>
        )}

        {/* Floating Back Button when RW or RT is selected */}
        {selectedRwId && (
          <div className="absolute top-14 sm:top-16 left-2.5 sm:left-3.5 z-[1000] pointer-events-auto animate-fade-in">
            <button
              type="button"
              onClick={handleResetToDesa}
              className="px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-extrabold shadow-lg backdrop-blur-md border border-white/20 flex items-center gap-1.5 cursor-pointer hover:bg-slate-800 transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Seluruh Desa</span>
            </button>
          </div>
        )}

        {/* Map Canvas */}
        <div ref={mapContainerRef} className="w-full h-full z-0 font-sans" />

        {/* Bottom Floating Legend / Mobile Helper */}
        <div className="absolute bottom-2.5 left-2.5 z-[1000] flex items-center gap-2 pointer-events-none">
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-mono px-2.5 sm:px-3 py-1.5 rounded-xl shadow-md border border-white/10">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>Peta Geospasial Desa Doko • {selectedRw ? selectedRw.nama : '3 RW & 13 RT'}</span>
          </div>

          <div className="flex sm:hidden items-center gap-1 bg-slate-900/85 backdrop-blur-md text-white text-[9px] font-medium px-2 py-1 rounded-lg border border-white/10">
            <span>Gunakan 2 jari untuk navigasi</span>
          </div>
        </div>
      </div>

      {/* DRAWER / CARD INFO WILAYAH DI BAWAH PETA */}
      {selectedRt ? (
        /* 1. Detail RT Terpilih */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs transition-all animate-fade-in">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-xs shrink-0"
                style={{ backgroundColor: selectedRt.color }}
              >
                RT {selectedRt.nomorRt}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {selectedRw?.nama}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Batas Wilayah RT</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">{selectedRt.nama}</h3>
                <p className="text-xs text-slate-600 font-medium">Ketua RT: <strong>{selectedRt.ketua}</strong></p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 sm:p-2.5 px-3.5 text-center flex-1 sm:flex-initial">
                <div className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500">Kepala Keluarga</div>
                <div className="text-sm sm:text-base font-black text-slate-900">{selectedRt.kk} KK</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 sm:p-2.5 px-3.5 text-center flex-1 sm:flex-initial">
                <div className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500">Total Warga</div>
                <div className="text-sm sm:text-base font-black text-emerald-700">{selectedRt.warga} Jiwa</div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedRtId(null)}
                  className="w-full sm:w-auto p-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Lihat Semua RT di {selectedRw?.nama}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : selectedRw ? (
        /* 2. Detail RW Terpilih (Menampilkan daftar RT di RW ini) */
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs transition-all animate-fade-in space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-xs shrink-0"
                style={{ backgroundColor: selectedRw.color }}
              >
                RW {selectedRw.nomorRw}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {selectedRw.dusun}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">{selectedRw.nama}</h3>
                <p className="text-xs text-slate-600 font-medium">Ketua RW: <strong>{selectedRw.ketuaRw}</strong></p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 sm:p-2.5 px-3.5 text-center flex-1 sm:flex-initial">
                <div className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500">Jumlah RT</div>
                <div className="text-sm sm:text-base font-black text-slate-900">{selectedRw.totalRt} RT</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 sm:p-2.5 px-3.5 text-center flex-1 sm:flex-initial">
                <div className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500">Total KK</div>
                <div className="text-sm sm:text-base font-black text-slate-900">{selectedRw.totalKk} KK</div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 sm:p-2.5 px-3.5 text-center flex-1 sm:flex-initial">
                <div className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500">Total Warga</div>
                <div className="text-sm sm:text-base font-black text-emerald-700">{selectedRw.totalWarga} Jiwa</div>
              </div>
            </div>
          </div>

          {/* Daftar RT di RW Terpilih (Thumb-friendly buttons) */}
          <div className="border-t border-slate-100 pt-3">
            <div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
              <span>Pilih RT untuk melihat lokasi detail:</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {selectedRw.rts.map((rt) => (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => handleSelectRt(selectedRw.id, rt.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 text-xs font-black transition-all shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rt.color }}></span>
                  <span>RT {rt.nomorRt}</span>
                  <span className="text-[10px] font-semibold text-slate-500">({rt.warga} jiwa)</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 3. Ringkasan Seluruh Desa (Ketika belum memilih RW) */
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {rwDataList.map((rw) => (
              <div
                key={rw.id}
                onClick={() => handleSelectRw(rw.id)}
                className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: rw.color }}></span>
                    <h4 className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {rw.nama}
                    </h4>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1">{rw.ketuaRw}</p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{rw.totalRt} Rukun Tetangga</span>
                  <span className="text-emerald-700">{rw.totalWarga} Jiwa</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200/70 p-3 flex items-center justify-between text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Tips Peta:</strong> Ketuk salah satu RW di atas atau di peta untuk memperbesar dan melihat kotak RT di dalamnya.
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-slate-800 font-black">
              <span>Total Teritorial: 3 RW • 13 RT • 1.828 Jiwa</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
