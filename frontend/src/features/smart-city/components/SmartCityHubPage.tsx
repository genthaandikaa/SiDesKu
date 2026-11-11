import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import {
  ShoppingBag,
  Home,
  Briefcase,
  MapPin,
  ArrowRight,
  Layers,
  Store,
  Navigation,
  Compass,
  Building2,
  Users,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  PlusCircle
} from 'lucide-react';
import {
  getStoredUmkmList,
  getStoredKosList,
  getStoredLokerList,
  KEDIRI_DEFAULT_COORDS
} from '../smartCityStorage';

export const SmartCityHubPage: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [activeMapFilter, setActiveMapFilter] = useState<'all' | 'umkm' | 'kos' | 'loker'>('all');
  const [umkmCount, setUmkmCount] = useState(0);
  const [kosCount, setKosCount] = useState(0);
  const [lokerCount, setLokerCount] = useState(0);

  useEffect(() => {
    const umkms = getStoredUmkmList();
    const kos = getStoredKosList();
    const lokers = getStoredLokerList();
    setUmkmCount(umkms.length);
    setKosCount(kos.length);
    setLokerCount(lokers.length);
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [KEDIRI_DEFAULT_COORDS.lat, KEDIRI_DEFAULT_COORDS.lng],
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    mapInstanceRef.current = map;

    // Custom Map Markers
    const umkms = getStoredUmkmList();
    const kos = getStoredKosList();
    const lokers = getStoredLokerList();

    const createPin = (color: string, label: string) => {
      return L.divIcon({
        className: 'custom-hub-pin',
        html: `
          <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: 900;">
            ${label}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });
    };

    const markersLayer = L.layerGroup();

    if (activeMapFilter === 'all' || activeMapFilter === 'umkm') {
      umkms.forEach((u) => {
        const marker = L.marker([u.lat, u.lng], { icon: createPin('#f59e0b', 'U') });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; min-width: 170px;">
            <div style="font-weight: 800; color: #b45309; text-transform: uppercase; font-size: 9px;">UMKM & Warung</div>
            <div style="font-weight: 800; color: #0f172a; margin-top: 2px;">${u.nama}</div>
            <div style="font-size: 11px; color: #64748b;">${u.tokoNama}</div>
            <div style="font-weight: 800; color: #2563eb; margin-top: 4px;">Rp ${u.harga.toLocaleString('id-ID')}</div>
            <a href="/smart-city/umkm" style="display: block; margin-top: 6px; padding: 4px 8px; background: #2563eb; color: white; text-align: center; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 10px;">Buka Halaman UMKM</a>
          </div>
        `);
        markersLayer.addLayer(marker);
      });
    }

    if (activeMapFilter === 'all' || activeMapFilter === 'kos') {
      kos.forEach((k) => {
        const marker = L.marker([k.lat, k.lng], { icon: createPin('#3b82f6', 'K') });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; min-width: 170px;">
            <div style="font-weight: 800; color: #2563eb; text-transform: uppercase; font-size: 9px;">Hunian & Kos</div>
            <div style="font-weight: 800; color: #0f172a; margin-top: 2px;">${k.nama}</div>
            <div style="font-size: 11px; color: #64748b;">${k.tipe} • Sisa ${k.sisaKamar} Kamar</div>
            <div style="font-weight: 800; color: #2563eb; margin-top: 4px;">Rp ${k.harga.toLocaleString('id-ID')} / ${k.periode}</div>
            <a href="/smart-city/kos" style="display: block; margin-top: 6px; padding: 4px 8px; background: #2563eb; color: white; text-align: center; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 10px;">Buka Halaman Kos</a>
          </div>
        `);
        markersLayer.addLayer(marker);
      });
    }

    if (activeMapFilter === 'all' || activeMapFilter === 'loker') {
      lokers.forEach((l) => {
        const marker = L.marker([l.lat, l.lng], { icon: createPin('#10b981', 'L') });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; min-width: 170px;">
            <div style="font-weight: 800; color: #059669; text-transform: uppercase; font-size: 9px;">Lowongan Kerja</div>
            <div style="font-weight: 800; color: #0f172a; margin-top: 2px;">${l.posisi}</div>
            <div style="font-size: 11px; color: #64748b;">${l.perusahaan} (${l.tipeKerja})</div>
            <a href="/smart-city/loker" style="display: block; margin-top: 6px; padding: 4px 8px; background: #2563eb; color: white; text-align: center; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 10px;">Buka Halaman Loker</a>
          </div>
        `);
        markersLayer.addLayer(marker);
      });
    }

    markersLayer.addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeMapFilter]);

  return (
    <div className="w-full space-y-12 px-4 pb-16 font-sans sm:space-y-16 sm:px-6 lg:px-8">
      
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-4 pt-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Smart City Hub Kediri
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Pusat integrasi tiga pilar pemberdayaan warga: pasar UMKM lokal dengan pembayaran QRIS, pencarian kos berakurasi jarak, dan bursa kerja terverifikasi.
        </p>

        {/* Quick CTA to Dashboard for Citizens */}
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Kelola Toko, Kos, atau Loker di Dashboard Warga</span>
          </Link>
        </div>
      </section>

      {/* 3 GATEWAY SECTORS CARDS (SEPARATE PAGES & DISTINCT FLOWS) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">3 Pilar Utama</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Pilih Layanan Smart City</h2>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">Halaman dan alur khusus mandiri</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: UMKM */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-amber-300 transition-all p-7 flex flex-col justify-between space-y-6 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />

            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-7 h-7" />
              </div>

              <div>
                <div className="text-[11px] font-black text-amber-700 uppercase tracking-wider">Pilar 01 • Perdagangan</div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Pasar Digital & UMKM
                </h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Warga dapat mendaftarkan toko mandiri, upload barang dagangan, aktivasi pembayaran QRIS, COD, atau Delivery Order dengan auto-track jarak pembeli.
              </p>

              <div className="space-y-1.5 pt-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Katalog produk lengkap & filter jarak radius</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Dukungan QRIS digital & COD tunai</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Pesan langsung via WhatsApp pedagang</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 relative z-10 flex items-center justify-between">
              <span className="text-xs font-black text-amber-800">{umkmCount} Produk Aktif</span>
              <Link
                to="/smart-city/umkm"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all"
              >
                <span>Buka UMKM</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: KOS */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-blue-300 transition-all p-7 flex flex-col justify-between space-y-6 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />

            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs group-hover:scale-110 transition-transform">
                <Home className="w-7 h-7" />
              </div>

              <div>
                <div className="text-[11px] font-black text-blue-700 uppercase tracking-wider">Pilar 02 • Hunian</div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Pencarian Kos & Hunian
                </h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Pemilik kos dapat mengelola ketersediaan kamar, tarif sewa, fasilitas AC/WiFi, dan titik lokasi koordinat yang diverifikasi oleh RT/Kelurahan.
              </p>

              <div className="space-y-1.5 pt-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Kategori Kos Putri, Putra, Campur & Kontrakan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Akurasi jarak dari kampus & kantor</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Informasi fasilitas & kontak langsung pemilik</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 relative z-10 flex items-center justify-between">
              <span className="text-xs font-black text-blue-700">{kosCount} Hunian Terdata</span>
              <Link
                to="/smart-city/kos"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
              >
                <span>Cari Kos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: LOKER */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-emerald-300 transition-all p-7 flex flex-col justify-between space-y-6 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform" />

            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs group-hover:scale-110 transition-transform">
                <Briefcase className="w-7 h-7" />
              </div>

              <div>
                <div className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">Pilar 03 • Ketenagakerjaan</div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Bursa Kerja & Loker Lokal
                </h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Peluang karir dan penawaran jasa warga Kediri. Dilengkapi sistem pengajuan lamaran dengan upload CV digital langsung ke HRD usaha setempat.
              </p>

              <div className="space-y-1.5 pt-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Peluang Full-time, Part-time, Harian & Freelance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Kirim lamaran kerja dan berkas CV 1-klik</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Validasi lowongan resmi Disnaker/Kelurahan</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 relative z-10 flex items-center justify-between">
              <span className="text-xs font-black text-emerald-700">{lokerCount} Lowongan Kerja</span>
              <Link
                to="/smart-city/loker"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
              >
                <span>Bursa Kerja</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* INTERACTIVE GIS MAP SECTION */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Sebaran Spasial GIS</div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Peta Sebaran Wilayah Smart City
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Klik pada titik koordinat untuk melihat pratinjau dan rute akses layanan.
            </p>
          </div>

          {/* Map Layer Filter */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 self-start sm:self-auto text-xs font-bold">
            <button
              onClick={() => setActiveMapFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeMapFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Titik
            </button>
            <button
              onClick={() => setActiveMapFilter('umkm')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeMapFilter === 'umkm' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>UMKM</span>
            </button>
            <button
              onClick={() => setActiveMapFilter('kos')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeMapFilter === 'kos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Kos</span>
            </button>
            <button
              onClick={() => setActiveMapFilter('loker')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeMapFilter === 'loker' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Loker</span>
            </button>
          </div>
        </div>

        {/* Leaflet Container */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-96 sm:h-[420px] shadow-inner">
          <div ref={mapContainerRef} className="w-full h-full z-10" />
        </div>
      </section>

    </div>
  );
};
