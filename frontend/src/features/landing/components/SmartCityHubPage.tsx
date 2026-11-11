import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import {
  Home,
  ShoppingBag,
  Briefcase,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Star,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Clock,
  Sparkles,
  Building2,
  Users,
  Compass,
  Plus,
  X,
  Share2,
  Award,
  BadgeCheck,
  Layers
} from 'lucide-react';

// ============================================================================
// DATA MODEL TYPES
// ============================================================================

export interface HunianItem {
  id: string;
  nama: string;
  tipe: 'Kos Putri' | 'Kos Putra' | 'Kos Campur' | 'Kontrakan Rumah';
  harga: number;
  periode: 'bulan' | 'tahun';
  alamat: string;
  dusun: string;
  rtRw: string;
  lat: number;
  lng: number;
  jarakKm: number; // Jarak dari pusat kota/desa
  sisaKamar: number;
  fasilitas: string[];
  pemilikNama: string;
  pemilikWa: string;
  terverifikasiRt: boolean;
  fotoUrl: string;
}

export interface UmkmItem {
  id: string;
  nama: string;
  kategori: 'Kuliner' | 'Pertanian' | 'Kerajinan' | 'Jasa & Servis' | 'Sembako';
  harga: number;
  ongkir?: number;
  tokoNama: string;
  alamat: string;
  jarakMeter: number; // Jarak real dalam meter
  rating: number;
  terjual: number;
  waKontak: string;
  fotoUrl: string;
  terverifikasi: boolean;
}

export interface LokerItem {
  id: string;
  posisi: string;
  perusahaan: string;
  kategori: 'Administrasi' | 'IT & Digital' | 'F&B / Kuliner' | 'Teknik & Bengkel' | 'Pendidikan';
  tipeKerja: 'Full-time' | 'Part-time' | 'Magang' | 'Freelance';
  gajiMin: number;
  gajiMax: number;
  lokasi: string;
  pendidikan: string;
  pengalaman: string;
  disnakerVerified: boolean;
  tanggalPosting: string;
  jumlahPelamar: number;
  deskripsi: string[];
  waHrd: string;
}

// ============================================================================
// SEED MOCK DATA (KEDIRI & DOKO REGION)
// ============================================================================

const SEED_HUNIAN: HunianItem[] = [
  {
    id: 'h1',
    nama: 'Kos Putri Griya Asri Doko (Dekat SLG)',
    tipe: 'Kos Putri',
    harga: 650000,
    periode: 'bulan',
    alamat: 'Jl. Kenanga No. 18, RT 02 / RW 01, Dusun Krajan',
    dusun: 'Dusun Krajan',
    rtRw: 'RT 02 / RW 01',
    lat: -7.8015,
    lng: 112.0452,
    jarakKm: 0.6,
    sisaKamar: 3,
    fasilitas: ['WiFi Cepat', 'Kamar Mandi Dalam', 'Kasur Springbed', 'Parkir Motor Luas', 'Dapur Bersama'],
    pemilikNama: 'Ibu Hj. Siti Aminah',
    pemilikWa: '6281234567890',
    terverifikasiRt: true,
    fotoUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'h2',
    nama: 'Paviliun Eksklusif Doko Barat (Bebas Banjir)',
    tipe: 'Kos Campur',
    harga: 950000,
    periode: 'bulan',
    alamat: 'Jl. Mawar No. 04, RT 05 / RW 02, Dusun Doko Barat',
    dusun: 'Dusun Doko Barat',
    rtRw: 'RT 05 / RW 02',
    lat: -7.8042,
    lng: 112.0385,
    jarakKm: 1.2,
    sisaKamar: 1,
    fasilitas: ['AC Dingin', 'Kamar Mandi Dalam', 'Water Heater', 'Listrik Token Mandiri', 'Garasi Mobil'],
    pemilikNama: 'Bpk. Agus Santoso',
    pemilikWa: '6281234567891',
    terverifikasiRt: true,
    fotoUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'h3',
    nama: 'Rumah Kontrakan Asri 3 Kamar Tidur',
    tipe: 'Kontrakan Rumah',
    harga: 14000000,
    periode: 'tahun',
    alamat: 'Komp. Melati Asri No. B7, Dusun Doko Timur',
    dusun: 'Dusun Doko Timur',
    rtRw: 'RT 01 / RW 03',
    lat: -7.7980,
    lng: 112.0510,
    jarakKm: 1.8,
    sisaKamar: 1,
    fasilitas: ['3 Kamar Tidur', '2 Kamar Mandi', 'Ruang Tamu Luas', 'Carport Mobil', 'Air Sumur Bor Bersih'],
    pemilikNama: 'Bpk. Drs. H. Bambang',
    pemilikWa: '6281234567892',
    terverifikasiRt: true,
    fotoUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'h4',
    nama: 'Kos Putra Barokah (Khusus Karyawan/Mahasiswa)',
    tipe: 'Kos Putra',
    harga: 500000,
    periode: 'bulan',
    alamat: 'Jl. Flamboyan No. 22, RT 03 / RW 01, Dusun Krajan',
    dusun: 'Dusun Krajan',
    rtRw: 'RT 03 / RW 01',
    lat: -7.8028,
    lng: 112.0430,
    jarakKm: 0.8,
    sisaKamar: 4,
    fasilitas: ['WiFi 100 Mbps', 'Kasur Busa', 'Lemari Pakaian', 'Parkir Motor Tertutup', 'Keamanan 24 Jam'],
    pemilikNama: 'Bpk. Supriyadi (Ketua RT 01)',
    pemilikWa: '6281234567893',
    terverifikasiRt: true,
    fotoUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600&auto=format&fit=crop&q=80',
  },
];

const SEED_UMKM: UmkmItem[] = [
  {
    id: 'u1',
    nama: 'Nasi Pecel Sambel Tumpang Bu Endang',
    kategori: 'Kuliner',
    harga: 12000,
    tokoNama: 'Warung Bu Endang Kuliner Khas Kediri',
    alamat: 'Jl. Dhoho No. 42, Kec. Kota, Kediri',
    jarakMeter: 320,
    rating: 4.9,
    terjual: 850,
    waKontak: '6281234567894',
    fotoUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80',
    terverifikasi: true,
  },
  {
    id: 'u2',
    nama: 'Kerajinan Besek & Anyaman Bambu Alami (Paket 10 Pcs)',
    kategori: 'Kerajinan',
    harga: 45000,
    tokoNama: 'Sentra Bambu Kreatif RT 04',
    alamat: 'Jl. Anyaman No. 9, Dusun Doko Barat',
    jarakMeter: 850,
    rating: 4.8,
    terjual: 320,
    waKontak: '6281234567895',
    fotoUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&auto=format&fit=crop&q=80',
    terverifikasi: true,
  },
  {
    id: 'u3',
    nama: 'Beras Organik Mentik Wangi Kediri 5 KG',
    kategori: 'Pertanian',
    harga: 75000,
    tokoNama: 'Gapoktan Subur Makmur',
    alamat: 'Dusun Doko Timur RT 02',
    jarakMeter: 1400,
    rating: 5.0,
    terjual: 540,
    waKontak: '6281234567896',
    fotoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
    terverifikasi: true,
  },
  {
    id: 'u4',
    nama: 'Servis Komputer, Laptop & Printer Keliling',
    kategori: 'Jasa & Servis',
    harga: 50000,
    tokoNama: 'Doko IT Solution (Home Service)',
    alamat: 'Jl. Melati No. 15, RT 01 / RW 02',
    jarakMeter: 650,
    rating: 4.9,
    terjual: 190,
    waKontak: '6281234567897',
    fotoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
    terverifikasi: true,
  },
  {
    id: 'u5',
    nama: 'Madu Murni Randu Hutan Asli Kediri 500ml',
    kategori: 'Sembako',
    harga: 85000,
    tokoNama: 'Peternakan Lebah Doko Asri',
    alamat: 'Jl. Perkebunan RT 03',
    jarakMeter: 2100,
    rating: 4.9,
    terjual: 410,
    waKontak: '6281234567898',
    fotoUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80',
    terverifikasi: true,
  },
];

const SEED_LOKER: LokerItem[] = [
  {
    id: 'l1',
    posisi: 'Staf Administrasi & Customer Service Logistik',
    perusahaan: 'Sentra Logistik & Distribusi Kediri Sejahtera',
    kategori: 'Administrasi',
    tipeKerja: 'Full-time',
    gajiMin: 2800000,
    gajiMax: 3500000,
    lokasi: 'Jl. Basuki Rahmat No. 12, Kec. Kota, Kediri',
    pendidikan: 'D3 / S1 Semua Jurusan',
    pengalaman: 'Fresh Graduate / Min. 1 Tahun',
    disnakerVerified: true,
    tanggalPosting: '2 hari lalu',
    jumlahPelamar: 18,
    deskripsi: [
      'Mengelola pencatatan administrasi unit usaha logistik dan kios desa.',
      'Melayani warga dalam pengurusan berkas digital dan informasi produk.',
      'Mampu mengoperasikan Microsoft Excel, Google Sheets, dan aplikasi Nexora.',
    ],
    waHrd: '6281234567891',
  },
  {
    id: 'l2',
    posisi: 'Barista & Kasir Cafe Kawasan Wisata SLG',
    perusahaan: 'Kediri Urban Coffee Roastery',
    kategori: 'F&B / Kuliner',
    tipeKerja: 'Full-time',
    gajiMin: 2600000,
    gajiMax: 3200000,
    lokasi: 'Kawasan Simpang Lima Gumul, Kediri',
    pendidikan: 'SMA / SMK Sederajat',
    pengalaman: 'Berpengalaman 6 Bulan (Diutamakan)',
    disnakerVerified: true,
    tanggalPosting: '1 hari lalu',
    jumlahPelamar: 24,
    deskripsi: [
      'Menyeduh kopi manual brew dan mesin espresso komersial.',
      'Melayani pesanan pelanggan dengan ramah dan mencatat transaksi POS.',
      'Menjaga kebersihan area bar dan stok bahan baku harian.',
    ],
    waHrd: '6281234567892',
  },
  {
    id: 'l3',
    posisi: 'Frontend Developer & UI Engineer (Smart City)',
    perusahaan: 'PT Kediri Digital Solusindo',
    kategori: 'IT & Digital',
    tipeKerja: 'Full-time',
    gajiMin: 4500000,
    gajiMax: 6500000,
    lokasi: 'Kec. Ngasem (Hybrid WFO / WFH)',
    pendidikan: 'D3 / S1 Ilmu Komputer / Informatika',
    pengalaman: 'Min. 1 Tahun React & Tailwind CSS',
    disnakerVerified: true,
    tanggalPosting: '3 hari lalu',
    jumlahPelamar: 12,
    deskripsi: [
      'Mengembangkan antarmuka aplikasi web publik berbasis React, TypeScript, dan Tailwind.',
      'Menerjemahkan rancangan sistem informasi pelayanan publik menjadi UI responsif.',
      'Mampu berkolaborasi dengan tim backend Laravel API dan QA engineer.',
    ],
    waHrd: '6281234567893',
  },
  {
    id: 'l4',
    posisi: 'Magang Operator Mesin Paving & Percetakan Beton',
    perusahaan: 'CV Karya Bhakti Mandiri',
    kategori: 'Teknik & Bengkel',
    tipeKerja: 'Magang',
    gajiMin: 1800000,
    gajiMax: 2200000,
    lokasi: 'Dusun Doko Barat, Kediri',
    pendidikan: 'SMK Teknik Mesin / Bangunan',
    pengalaman: 'Siswa SMK Aktif / Lulusan Baru',
    disnakerVerified: true,
    tanggalPosting: '4 hari lalu',
    jumlahPelamar: 8,
    deskripsi: [
      'Membantu pengoperasian mesin press paving jalan desa.',
      'Mempelajari pencampuran material agregat beton berstandar SNI.',
      'Mendapatkan uang saku bulanan, sertifikat kerja, dan peluang kontrak tetap.',
    ],
    waHrd: '6281234567894',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const SmartCityHubPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'hunian';
  const [activeTab, setActiveTab] = useState<'hunian' | 'pasar' | 'loker'>(
    initialTab === 'pasar' ? 'pasar' : initialTab === 'loker' ? 'loker' : 'hunian'
  );

  // Sync state with URL
  const handleTabChange = (tab: 'hunian' | 'pasar' | 'loker') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // --------------------------------------------------------------------------
  // TAB 1: HUNIAN SPASIAL STATE
  // --------------------------------------------------------------------------
  const [tipeHunianFilter, setTipeHunianFilter] = useState<string>('Semua');
  const [selectedHunianId, setSelectedHunianId] = useState<string>('h1');
  const [showPasangHunianModal, setShowPasangHunianModal] = useState<boolean>(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const filteredHunian = useMemo(() => {
    return SEED_HUNIAN.filter((h) => {
      if (tipeHunianFilter === 'Semua') return true;
      return h.tipe === tipeHunianFilter;
    });
  }, [tipeHunianFilter]);

  // Leaflet Map Initialization for Hunian
  useEffect(() => {
    if (activeTab !== 'hunian') return;
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center at Doko, Ngasem, Kediri
      const map = L.map(mapContainerRef.current, {
        center: [-7.8015, 112.0452],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Custom blue marker icon
    const createCustomIcon = (isSelected: boolean, label: string) => {
      return L.divIcon({
        className: 'custom-hunian-marker',
        html: `
          <div style="
            background: ${isSelected ? '#1d4ed8' : '#0284c7'};
            color: white;
            padding: 6px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            font-family: inherit;
            box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
            border: 2px solid white;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            transform: translate(-50%, -100%);
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#2563eb;"></span>
            <span>${label}</span>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 30],
      });
    };

    // Add markers for filtered listings
    filteredHunian.forEach((item) => {
      const isSelected = item.id === selectedHunianId;
      const marker = L.marker([item.lat, item.lng], {
        icon: createCustomIcon(isSelected, item.nama.split(' ')[0] + ' ' + (item.tipe === 'Kontrakan Rumah' ? 'Rumah' : 'Kos')),
      }).addTo(map);

      marker.on('click', () => {
        setSelectedHunianId(item.id);
        map.setView([item.lat, item.lng], 16, { animate: true });
      });

      markersRef.current.push(marker);
    });

    // Invalidate size after rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [activeTab, filteredHunian, selectedHunianId]);

  // Focus map when selecting card
  const handleSelectHunian = (item: HunianItem) => {
    setSelectedHunianId(item.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([item.lat, item.lng], 16, { animate: true });
    }
  };

  // --------------------------------------------------------------------------
  // TAB 2: PASAR BEBAS UMKM STATE
  // --------------------------------------------------------------------------
  const [radiusFilterMeter, setRadiusFilterMeter] = useState<number>(5000);
  const [kategoriUmkm, setKategoriUmkm] = useState<string>('Semua');
  const [searchUmkm, setSearchUmkm] = useState<string>('');

  const filteredUmkm = useMemo(() => {
    return SEED_UMKM.filter((u) => {
      const matchRadius = u.jarakMeter <= radiusFilterMeter;
      const matchKategori = kategoriUmkm === 'Semua' || u.kategori === kategoriUmkm;
      const matchSearch = u.nama.toLowerCase().includes(searchUmkm.toLowerCase()) ||
                          u.tokoNama.toLowerCase().includes(searchUmkm.toLowerCase());
      return matchRadius && matchKategori && matchSearch;
    }).sort((a, b) => a.jarakMeter - b.jarakMeter);
  }, [radiusFilterMeter, kategoriUmkm, searchUmkm]);

  // --------------------------------------------------------------------------
  // TAB 3: BURSA LOKER LINKEDIN-STYLE STATE
  // --------------------------------------------------------------------------
  const [kategoriLoker, setKategoriLoker] = useState<string>('Semua');
  const [tipeKerjaLoker, setTipeKerjaLoker] = useState<string>('Semua');
  const [searchLoker, setSearchLoker] = useState<string>('');
  const [activeLokerModal, setActiveLokerModal] = useState<LokerItem | null>(null);

  const filteredLoker = useMemo(() => {
    return SEED_LOKER.filter((l) => {
      const matchKategori = kategoriLoker === 'Semua' || l.kategori === kategoriLoker;
      const matchTipe = tipeKerjaLoker === 'Semua' || l.tipeKerja === tipeKerjaLoker;
      const matchSearch = l.posisi.toLowerCase().includes(searchLoker.toLowerCase()) ||
                          l.perusahaan.toLowerCase().includes(searchLoker.toLowerCase());
      return matchKategori && matchTipe && matchSearch;
    });
  }, [kategoriLoker, tipeKerjaLoker, searchLoker]);

  return (
    <div className="page-enter relative w-full overflow-hidden flex flex-col font-sans text-slate-800">
      
      {/* =========================================================================
          HERO & SMART CITY NAVIGATION SWITCHER
          ========================================================================= */}
      <section className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 text-center">
        {/* Ambient Backlight Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[340px] bg-gradient-to-b from-sky-400/20 via-blue-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.16] max-w-3xl mx-auto mb-3">
          Ekosistem Urban Cerdas &{' '}
          <span className="text-blue-600">
            Peluang Kota.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto mb-6">
          Temukan hunian sewa berbasis peta spasial, dukung produk UMKM terdekat dari lokasi Anda, dan raih peluang karir profesional lokal terverifikasi.
        </p>

        {/* Triple Segmented Mode Switcher */}
        <div className="inline-flex p-1.5 rounded-full bg-slate-100/90 border border-sky-200/70 shadow-xs max-w-xl w-full justify-center gap-1">
          <button
            type="button"
            onClick={() => handleTabChange('hunian')}
            className={`flex-1 py-2.5 px-3 sm:px-4 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'hunian'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Hunian & Kos (Peta)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('pasar')}
            className={`flex-1 py-2.5 px-3 sm:px-4 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'pasar'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Pasar UMKM (Dekat)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('loker')}
            className={`flex-1 py-2.5 px-3 sm:px-4 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'loker'
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Bursa Karir (Loker)</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          TAB 1: HUNIAN & KOS SPASIAL GIS
          ========================================================================= */}
      {activeTab === 'hunian' && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
          {/* Controls Bar: Filter & Add Listing */}
          <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-sky-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-2">
                <Filter className="w-3.5 h-3.5 text-sky-600" />
                <span>Kategori:</span>
              </span>
              {['Semua', 'Kos Putri', 'Kos Putra', 'Kos Campur', 'Kontrakan Rumah'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTipeHunianFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    tipeHunianFilter === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPasangHunianModal(true)}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 transition-all press-down flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pasang Listing Kos / Rumah</span>
            </button>
          </div>

          {/* Interactive Split View: Map Top + Cards Below */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Interactive Leaflet Map Box (7 Cols on Desktop) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-sky-100 shadow-lg overflow-hidden relative">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Peta Sebaran Kos & Kontrakan Terverifikasi</span>
                </div>
                <span className="text-[11px] font-bold text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-full">
                  {filteredHunian.length} Titik Hunian Aktif
                </span>
              </div>

              {/* Map Canvas */}
              <div ref={mapContainerRef} className="w-full h-[420px] z-0" />

              <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>Klik marker biru pada peta untuk melihat detail kamar & tarif.</span>
                </div>
                <span className="font-semibold text-slate-700">Wilayah Kec. Ngasem, Kediri</span>
              </div>
            </div>

            {/* Selected / Featured Detail Summary (5 Cols on Desktop) */}
            <div className="lg:col-span-5 space-y-4">
              {filteredHunian.map((item) => {
                const isSelected = item.id === selectedHunianId;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectHunian(item)}
                    className={`p-4 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-400 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200/80 hover:border-sky-300 shadow-xs'
                    }`}
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.fotoUrl}
                        alt={item.nama}
                        className="w-24 h-24 rounded-2xl object-cover shrink-0 shadow-xs border border-slate-100"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                            {item.tipe}
                          </span>
                          {item.terverifikasiRt && (
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verif RT</span>
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                          {item.nama}
                        </h4>

                        <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0 inline" />
                          <span>{item.alamat}</span>
                        </p>

                        <div className="pt-1 flex items-baseline gap-1">
                          <span className="text-base font-black text-blue-600 font-mono">
                            Rp {item.harga.toLocaleString('id-ID')}
                          </span>
                          <span className="text-[10px] text-slate-400">/{item.periode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Facility Tags */}
                    <div className="pt-3 border-t border-slate-100 mt-3 flex flex-wrap items-center gap-1.5">
                      {item.fasilitas.slice(0, 3).map((f) => (
                        <span key={f} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{f}</span>
                        </span>
                      ))}
                      {item.fasilitas.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          +{item.fasilitas.length - 3} lainnya
                        </span>
                      )}
                    </div>

                    {/* Direct Contact Button */}
                    <div className="pt-3 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Pemilik: <strong className="text-slate-800">{item.pemilikNama}</strong>
                      </span>
                      <a
                        href={`https://wa.me/${item.pemilikWa}?text=${encodeURIComponent(`Halo ${item.pemilikNama}, saya tertarik dengan info sewa hunian "${item.nama}" yang terdaftar di Nexora Smart City. Apakah unit masih tersedia?`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat WA</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* =========================================================================
          TAB 2: PASAR BEBAS UMKM (PROXIMITY RADIUS FILTER)
          ========================================================================= */}
      {activeTab === 'pasar' && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
          
          {/* Radius Filter & Search Bar */}
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border border-sky-100 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Radius Chips (Nearest Proximity) */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-1">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  <span>Radius Jarak:</span>
                </span>
                {[
                  { label: 'Lingkungan RT (< 500 m)', meter: 500 },
                  { label: 'Satu Dusun (< 1.5 km)', meter: 1500 },
                  { label: 'Satu Desa (< 3 km)', meter: 3000 },
                  { label: 'Seluruh Kota (< 5 km)', meter: 5000 },
                ].map((r) => (
                  <button
                    key={r.meter}
                    onClick={() => setRadiusFilterMeter(r.meter)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      radiusFilterMeter === r.meter
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari produk atau toko..."
                  value={searchUmkm}
                  onChange={(e) => setSearchUmkm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-full border border-sky-200/80 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                />
              </div>

            </div>

            {/* Category Pills */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-2">Kategori Produk:</span>
              {['Semua', 'Kuliner', 'Pertanian', 'Kerajinan', 'Jasa & Servis', 'Sembako'].map((k) => (
                <button
                  key={k}
                  onClick={() => setKategoriUmkm(k)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    kategoriUmkm === k
                      ? 'bg-sky-100 text-sky-800 border border-sky-300'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredUmkm.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-sky-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Distance Tag */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={item.fotoUrl}
                      alt={item.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black text-slate-900 border border-slate-100 shadow-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>{item.jarakMeter < 1000 ? `${item.jarakMeter} m` : `${(item.jarakMeter / 1000).toFixed(1)} km`}</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-sky-600/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs">
                      {item.kategori}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 truncate max-w-[180px] inline-flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-blue-600 inline shrink-0" />
                        <span>{item.tokoNama}</span>
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{item.rating}</span>
                        <span className="text-slate-400">({item.terjual})</span>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug">
                      {item.nama}
                    </h4>

                    <div className="pt-1 flex items-baseline justify-between">
                      <div className="text-lg font-black text-blue-600 font-mono">
                        Rp {item.harga.toLocaleString('id-ID')}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Siap Antar / COD</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                  <a
                    href={`https://wa.me/${item.waKontak}?text=${encodeURIComponent(`Halo ${item.tokoNama}, saya melihat produk "${item.nama}" di Marketplace Smart City. Saya ingin memesan, apakah ready stok?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Pesan Langsung ke Penjual</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredUmkm.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-sky-200">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="font-bold text-slate-700 text-sm">Tidak ada produk dalam radius ini</div>
              <p className="text-xs text-slate-400 mt-1">Coba perlebar filter jarak ke radius yang lebih jauh.</p>
            </div>
          )}

        </section>
      )}

      {/* =========================================================================
          TAB 3: BURSA KARIR & LOKER KOTA (LINKEDIN-STYLE)
          ========================================================================= */}
      {activeTab === 'loker' && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
          
          {/* Header Banner: Disnaker Verified Anti-Scam Assurance */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 border border-blue-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-sky-200" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Bursa Karir Resmi Kota Terverifikasi</h4>
                <p className="text-xs text-slate-600">
                  Seluruh lowongan kerja diaudit keabsahannya oleh Disnaker & Kelurahan. 100% Bebas Pungutan Liar & Penipuan.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-extrabold bg-blue-100 text-blue-800 px-3 py-1 rounded-full whitespace-nowrap">
              Mitra Disnaker Kota Kediri
            </span>
          </div>

          {/* Filters Bar */}
          <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-sky-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-2">Tipe Kerja:</span>
              {['Semua', 'Full-time', 'Part-time', 'Magang', 'Freelance'].map((tipe) => (
                <button
                  key={tipe}
                  onClick={() => setTipeKerjaLoker(tipe)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    tipeKerjaLoker === tipe
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tipe}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari profesi atau perusahaan..."
                value={searchLoker}
                onChange={(e) => setSearchLoker(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-full border border-sky-200/80 text-xs font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Job Feed List (LinkedIn Style Cards) */}
          <div className="space-y-4">
            {filteredLoker.map((item) => (
              <div
                key={item.id}
                className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 hover:border-sky-300 hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                      {item.perusahaan.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-base text-slate-900 leading-tight">
                          {item.posisi}
                        </h4>
                        {item.disnakerVerified && (
                          <span className="text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3 text-blue-600" />
                            <span>Terverifikasi Disnaker</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 flex-wrap">
                        <span>{item.perusahaan}</span>
                        <span>•</span>
                        <span className="text-slate-400 font-normal inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 inline" />
                          <span>{item.lokasi}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Salary Pill */}
                  <div className="text-right sm:text-right shrink-0">
                    <div className="text-base font-black text-blue-600 font-mono">
                      Rp {item.gajiMin.toLocaleString('id-ID')} - {item.gajiMax.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-slate-400">per bulan (Estimasi UMK)</div>
                  </div>
                </div>

                {/* Bullets Requirement Preview */}
                <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                  {item.deskripsi.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>

                {/* Bottom Tags & Action */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {item.tipeKerja}
                    </span>
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      Pendidikan: {item.pendidikan}
                    </span>
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                      Pengalaman: {item.pengalaman}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      • {item.tanggalPosting} ({item.jumlahPelamar} pelamar)
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveLokerModal(item)}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Lamar Cepat via HRD</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </section>
      )}

      {/* =========================================================================
          MODAL: PASANG LISTING HUNIAN BARU
          ========================================================================= */}
      {showPasangHunianModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-sky-100 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">Pasang Listing Kos / Kontrakan Baru</h3>
              </div>
              <button
                onClick={() => setShowPasangHunianModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Listing Anda akan diperiksa oleh Ketua RT setempat untuk verifikasi kepemilikan sebelum tampil secara resmi di peta spasial kota.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Kos / Kontrakan</label>
                <input
                  type="text"
                  placeholder="Contoh: Kos Putri Melati Indah"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500">
                    <option>Kos Putri</option>
                    <option>Kos Putra</option>
                    <option>Kos Campur</option>
                    <option>Kontrakan Rumah</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tarif Sewa (Rp)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 650000"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alamat Lengkap & RT/RW</label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Kenanga No. 12, RT 01 / RW 01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Pemilik</label>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 text-[11px] text-sky-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Titik koordinat GPS akan otomatis disematkan sesuai lokasi ponsel atau alamat yang Anda input.</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPasangHunianModal(false)}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Permohonan listing hunian Anda telah diajukan ke Ketua RT untuk verifikasi faktual!');
                  setShowPasangHunianModal(false);
                }}
                className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Kirim Pengajuan Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: LAMAR LOKER CEPAT VIA HRD
          ========================================================================= */}
      {activeLokerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-sky-100 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">Lamar Lowongan Kerja</h3>
                  <p className="text-[11px] text-slate-500">{activeLokerModal.posisi} • {activeLokerModal.perusahaan}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveLokerModal(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Lowongan ini diaudit langsung oleh Disnaker Kota Kediri. Tidak ada biaya pendaftaran apa pun (Gratis).</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Pelamar</label>
                <input
                  type="text"
                  placeholder="Masukkan nama sesuai KTP"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp Aktif</label>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Link CV / Portofolio (Google Drive / LinkedIn)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pesan Pengantar Singkat ke HRD</label>
                <textarea
                  rows={3}
                  placeholder="Ceritakan singkat motivasi dan pengalaman relevan Anda..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveLokerModal(null)}
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <a
                href={`https://wa.me/${activeLokerModal.waHrd}?text=${encodeURIComponent(`Halo HRD ${activeLokerModal.perusahaan}, saya ingin melamar untuk posisi "${activeLokerModal.posisi}" yang terdaftar resmi di Smart City Portal. Berikut profil singkat saya.`)}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => setActiveLokerModal(null)}
                className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Kirim Lamaran ke WhatsApp HRD</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
