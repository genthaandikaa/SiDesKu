import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  MapPin,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Phone,
  QrCode,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Navigation,
  Compass,
  Building2,
  PlusCircle,
  X,
  Share2,
  Wifi,
  Wind,
  Bath,
  Bed,
  Car,
  ShieldCheck,
  Check,
  FileText
} from 'lucide-react';
import { HunianItem } from '../types';
import {
  getStoredKosList,
  KEDIRI_DEFAULT_COORDS,
  calculateDistanceKm,
  formatDistance
} from '../smartCityStorage';

export const KosPage: React.FC = () => {
  const [kosList, setKosList] = useState<HunianItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [distanceFilter, setDistanceFilter] = useState<'all' | '1' | '5' | '10' | 'custom'>('all');
  const [customDistanceKm, setCustomDistanceKm] = useState<number>(5);
  const [priceRange, setPriceRange] = useState<'all' | 'under600' | '600to1m' | 'above1m'>('all');
  const [selectedFacility, setSelectedFacility] = useState<string>('all');

  // User Geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(KEDIRI_DEFAULT_COORDS);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('Pusat Kota Kediri (Default)');

  // Selected Detail Modal
  const [selectedKos, setSelectedKos] = useState<HunianItem | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setKosList(getStoredKosList());
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung deteksi GPS.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLocationStatus('Lokasi GPS Anda Aktif');
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus('Gagal membaca GPS (Menggunakan Titik Kediri)');
        console.warn('Geolocation error:', err);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Instant fuzzy filter
  const filteredList = useMemo(() => {
    return kosList.filter((item) => {
      // 1. Search (matches single letter/word)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = item.nama.toLowerCase().includes(q);
        const matchAddr = item.alamat.toLowerCase().includes(q);
        const matchOwner = item.pemilikNama.toLowerCase().includes(q);
        const matchType = item.tipe.toLowerCase().includes(q);
        const matchFac = item.fasilitas.some((f) => f.toLowerCase().includes(q));
        if (!matchName && !matchAddr && !matchOwner && !matchType && !matchFac) {
          return false;
        }
      }

      // 2. Type Filter
      if (selectedType !== 'Semua' && item.tipe !== selectedType) {
        return false;
      }

      // 3. Price Filter
      if (priceRange === 'under600' && item.harga >= 600000) return false;
      if (priceRange === '600to1m' && (item.harga < 600000 || item.harga > 1000000)) return false;
      if (priceRange === 'above1m' && item.harga <= 1000000) return false;

      // 4. Facility Filter
      if (selectedFacility !== 'all') {
        const hasFac = item.fasilitas.some((f) =>
          f.toLowerCase().includes(selectedFacility.toLowerCase())
        );
        if (!hasFac) return false;
      }

      // 5. Distance Filter
      const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
      if (distanceFilter === '1' && dist > 1) return false;
      if (distanceFilter === '5' && dist > 5) return false;
      if (distanceFilter === '10' && dist > 10) return false;
      if (distanceFilter === 'custom' && dist > customDistanceKm) return false;

      return true;
    });
  }, [kosList, searchQuery, selectedType, priceRange, selectedFacility, distanceFilter, customDistanceKm, userLocation]);

  const handleShare = (item: HunianItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.nama,
        text: `Lihat info sewa ${item.nama} (${item.tipe}) di Nexora Smart City Kediri.`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getWaLink = (item: HunianItem) => {
    const text = encodeURIComponent(
      `Halo *${item.pemilikNama}*, saya tertarik dengan sewa hunian *"${item.nama}"* seharga Rp ${item.harga.toLocaleString('id-ID')} / ${item.periode} di Nexora Smart City Kediri. Apakah masih ada sisa kamar kosong?`
    );
    return `https://wa.me/${item.pemilikWa}?text=${text}`;
  };

  const getTypeBadgeClass = (tipe: string) => {
    switch (tipe) {
      case 'Kos Putri':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'Kos Putra':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Kos Campur':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Kontrakan Rumah':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-10 font-sans pb-16">
      
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2">
        <div className="flex items-center gap-2">
          <Link to="/smart-city" className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Smart City Hub</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-bold text-slate-800">Pencarian Kos & Hunian Warga</span>
        </div>

        <Link
          to="/dashboard?menu=smart_city_kos"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-all border border-blue-200"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Kelola / Pasang Kos Anda</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-700 via-blue-800 to-sky-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-sky-200">
            <Home className="w-3.5 h-3.5 text-sky-300" />
            <span>Hunian Aman & Terverifikasi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Cari Kos & Kontrakan di Kediri
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Temukan kamar kos putri, kos putra, kos campur, hingga kontrakan rumah dengan jarak akurat dari kampus atau tempat kerja Anda, lengkap dengan verifikasi RT dan fasilitas terinci.
          </p>

          {/* User Location Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="px-4 py-2 rounded-xl bg-white text-blue-900 font-extrabold text-xs shadow-md hover:bg-blue-50 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Navigation className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Mendeteksi Posisi...' : 'Gunakan GPS Saya'}</span>
            </button>
            <div className="text-xs text-blue-100/90 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
              <Compass className="w-3.5 h-3.5 text-sky-300 shrink-0" />
              <span>Titik Acuan: <strong className="text-white">{locationStatus}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Search, Filters & Kos Grid */}
      <div className="space-y-6">
        
        {/* Controls Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          
          {/* Row 1: Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kos putri, kos putra, dekat kampus, SLG, jalan, atau fasilitas (misal: 'wifi', 'ac', 'krajan')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Row 2: Type Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['Semua', 'Kos Putri', 'Kos Putra', 'Kos Campur', 'Kontrakan Rumah'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedType === t
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Row 3: Radius, Price & Facility */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            
            {/* Radius Segmented Filter */}
            <div className="md:col-span-6 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Radius:
              </span>
              {[
                { label: 'Semua', val: 'all' },
                { label: '≤ 1 km', val: '1' },
                { label: '≤ 5 km', val: '5' },
                { label: '≤ 10 km', val: '10' },
                { label: 'Kustom', val: 'custom' }
              ].map((rf) => (
                <button
                  key={rf.val}
                  type="button"
                  onClick={() => setDistanceFilter(rf.val as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    distanceFilter === rf.val
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {rf.label}
                </button>
              ))}

              {distanceFilter === 'custom' && (
                <div className="flex items-center gap-2 pl-2">
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={customDistanceKm}
                    onChange={(e) => setCustomDistanceKm(Number(e.target.value))}
                    className="w-20 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-blue-700">{customDistanceKm} km</span>
                </div>
              )}
            </div>

            {/* Price & Facility Filters */}
            <div className="md:col-span-6 flex items-center justify-start md:justify-end gap-2">
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value as any)}
                className="py-1.5 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-bold focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Semua Rentang Harga</option>
                <option value="under600">&lt; Rp 600rb / bln</option>
                <option value="600to1m">Rp 600rb - 1jt / bln</option>
                <option value="above1m">&gt; Rp 1jt / bln</option>
              </select>

              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="py-1.5 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-bold focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Semua Fasilitas</option>
                <option value="WiFi">Ada WiFi</option>
                <option value="AC">Ada AC</option>
                <option value="Kamar Mandi Dalam">KM Dalam</option>
                <option value="Parkir">Ada Parkir</option>
              </select>
            </div>

          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Menampilkan <strong>{filteredList.length}</strong> unit kos & hunian</span>
          <span className="text-[11px] text-slate-400">Jarak dihitung dari titik GPS ke lokasi hunian</span>
        </div>

        {/* Kos Grid */}
        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredList.map((item) => {
              const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
              const formattedDist = formatDistance(distanceKm);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all overflow-hidden flex flex-col group"
                >
                  {/* Photo & Badges */}
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    <img
                      src={item.fotoUrl}
                      alt={item.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Distance Pill */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-sm text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                      <Navigation className="w-3 h-3 text-sky-400" />
                      <span>{formattedDist} dari Anda</span>
                    </div>

                    {/* Remaining Rooms Pill */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-sm bg-white/95 text-slate-900">
                      Sisa {item.sisaKamar} Kamar
                    </div>

                    {/* Type badge */}
                    <div className={`absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border shadow-2xs ${getTypeBadgeClass(item.tipe)}`}>
                      {item.tipe}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verifikasi RT Setempat</span>
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 mt-1 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {item.nama}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1 line-clamp-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.alamat}</span>
                      </p>

                      {item.deskripsi && (
                        <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {item.deskripsi}
                        </p>
                      )}
                    </div>

                    {/* Facilities Pills */}
                    <div className="flex flex-wrap gap-1">
                      {item.fasilitas.slice(0, 3).map((fac, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                        >
                          {fac}
                        </span>
                      ))}
                      {item.fasilitas.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px]">
                          +{item.fasilitas.length - 3} lainnya
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      {/* Price */}
                      <div>
                        <div className="text-lg font-black text-blue-600">
                          Rp {item.harga.toLocaleString('id-ID')}
                          <span className="text-xs text-slate-400 font-normal"> /{item.periode}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Pemilik: {item.pemilikNama}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedKos(item)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors text-center cursor-pointer"
                        >
                          Detail Kamar
                        </button>
                        <a
                          href={getWaLink(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Chat Pemilik</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-3">
            <Home className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">Tidak ada kos yang cocok</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Coba perluas radius jarak atau pilih jenis hunian yang lain.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('Semua');
                setDistanceFilter('all');
                setPriceRange('all');
                setSelectedFacility('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL DETAIL KOS
          ========================================================================= */}
      {selectedKos && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedKos(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header image */}
            <div className="relative aspect-[16/10] bg-slate-100">
              <img
                src={selectedKos.fotoUrl}
                alt={selectedKos.nama}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedKos(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                {selectedKos.tipe}
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Terverifikasi RT / Kelurahan
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    {formatDistance(calculateDistanceKm(userLocation.lat, userLocation.lng, selectedKos.lat, selectedKos.lng))} dari posisi Anda
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {selectedKos.nama}
                </h3>
                <div className="text-2xl font-black text-blue-600 mt-2">
                  Rp {selectedKos.harga.toLocaleString('id-ID')}
                  <span className="text-xs text-slate-400 font-normal"> /{selectedKos.periode}</span>
                </div>
              </div>

              {/* Location & Address */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700">Alamat Lengkap:</div>
                <div className="flex items-start gap-2 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{selectedKos.alamat}</span>
                </div>
                <div className="text-[11px] text-slate-400 pl-6">
                  Koordinat: {selectedKos.lat.toFixed(4)}, {selectedKos.lng.toFixed(4)}
                </div>
              </div>

              {/* Facilities Checklist */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-700">Fasilitas Kamar & Bangunan:</div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedKos.fasilitas.map((f, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-700 font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deskripsi & Aturan Kos */}
              {selectedKos.deskripsi && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Deskripsi & Aturan Hunian</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedKos.deskripsi}
                  </p>
                </div>
              )}

              {/* Owner Info & Payment */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-blue-700 font-bold uppercase tracking-wider">Pemilik Hunian:</div>
                  <div className="text-sm font-extrabold text-slate-900">{selectedKos.pemilikNama}</div>
                  <div className="text-xs text-slate-500">Kamar Kosong: Sisa {selectedKos.sisaKamar} Kamar</div>
                </div>
                {selectedKos.qrisUrl && (
                  <div className="p-2 rounded-xl bg-white border border-blue-200 text-center">
                    <QrCode className="w-5 h-5 text-rose-600 mx-auto" />
                    <span className="text-[9px] font-bold text-rose-700 block">Siap QRIS</span>
                  </div>
                )}
              </div>

              {/* CTA Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleShare(selectedKos)}
                  className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                  title="Bagikan"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
                <a
                  href={getWaLink(selectedKos)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Hubungi Pemilik via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
