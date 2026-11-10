import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Phone,
  QrCode,
  Truck,
  Banknote,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Navigation,
  Compass,
  Store,
  PlusCircle,
  X,
  Share2,
  Clock,
  Star,
  Check
} from 'lucide-react';
import { UmkmItem } from '../types';
import {
  getStoredUmkmList,
  KEDIRI_DEFAULT_COORDS,
  calculateDistanceKm,
  formatDistance
} from '../smartCityStorage';

export const UmkmPage: React.FC = () => {
  const [umkmList, setUmkmList] = useState<UmkmItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [distanceFilter, setDistanceFilter] = useState<'all' | '1' | '5' | '10' | 'custom'>('all');
  const [customDistanceKm, setCustomDistanceKm] = useState<number>(3);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'qris' | 'cod' | 'do'>('all');
  const [onlyOpen, setOnlyOpen] = useState(false);

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(KEDIRI_DEFAULT_COORDS);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('Pusat Kota Kediri (Default)');

  // Selected Item Modal
  const [selectedItem, setSelectedItem] = useState<UmkmItem | null>(null);
  const [showQrisModal, setShowQrisModal] = useState<UmkmItem | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setUmkmList(getStoredUmkmList());
  }, []);

  // Handler for GPS auto-detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung deteksi lokasi otomatis.');
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
        setLocationStatus('Gagal membaca GPS (Menggunakan Pusat Kediri)');
        console.warn('Geolocation error:', err);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Filter Logic with instant fuzzy match (even single character)
  const filteredList = useMemo(() => {
    return umkmList.filter((item) => {
      // 1. Search Query: matches even 1 letter/word
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchTitle = item.nama.toLowerCase().includes(q);
        const matchToko = item.tokoNama.toLowerCase().includes(q);
        const matchCat = item.kategori.toLowerCase().includes(q);
        const matchDesc = item.deskripsi.toLowerCase().includes(q);
        const matchAddr = item.alamat.toLowerCase().includes(q);
        if (!matchTitle && !matchToko && !matchCat && !matchDesc && !matchAddr) {
          return false;
        }
      }

      // 2. Category
      if (selectedCategory !== 'Semua' && item.kategori !== selectedCategory) {
        return false;
      }

      // 3. Payment Methods
      if (paymentFilter === 'qris' && !item.metodePembayaran?.qris) return false;
      if (paymentFilter === 'cod' && !item.metodePembayaran?.cod) return false;
      if (paymentFilter === 'do' && !item.metodePembayaran?.do) return false;

      // 4. Open only
      if (onlyOpen && item.statusToko !== 'Buka') return false;

      // 5. Distance Filter
      const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
      if (distanceFilter === '1' && dist > 1) return false;
      if (distanceFilter === '5' && dist > 5) return false;
      if (distanceFilter === '10' && dist > 10) return false;
      if (distanceFilter === 'custom' && dist > customDistanceKm) return false;

      return true;
    });
  }, [umkmList, searchQuery, selectedCategory, paymentFilter, onlyOpen, distanceFilter, customDistanceKm, userLocation]);

  const handleShare = (item: UmkmItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.nama,
        text: `Beli ${item.nama} di ${item.tokoNama} melalui SiDesKu Smart City Kediri.`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const getWaLink = (item: UmkmItem) => {
    const text = encodeURIComponent(
      `Halo *${item.tokoNama}*, saya melihat produk *"${item.nama}"* seharga Rp ${item.harga.toLocaleString('id-ID')} di SiDesKu Smart City Kediri. Apakah stok masih tersedia?`
    );
    return `https://wa.me/${item.waKontak}?text=${text}`;
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
          <span className="font-bold text-slate-800">Pasar Digital & UMKM Warga</span>
        </div>

        <Link
          to="/dashboard?menu=smart_city_umkm"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-all border border-blue-200"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Buka Toko / Jual Produk Anda</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-sky-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-sky-200">
            <ShoppingBag className="w-3.5 h-3.5 text-sky-300" />
            <span>Ekonomi Lokal Berkelanjutan</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Pasar Digital & UMKM Warga Kediri
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Dukung produk tetangga dan warung lokal. Dilengkapi auto-track jarak real-time dari posisi Anda, pembayaran praktis lewat QRIS, serta opsi COD dan Delivery Order.
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

      {/* Main Content: Search, Filters & Product Grid */}
      <div className="space-y-6">
        
        {/* Controls Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          
          {/* Row 1: Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari produk dagangan, nama warung/toko, makanan, oleh-oleh (misal: 'tahu', 'beras', 'laptop')..."
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

          {/* Row 2: Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['Semua', 'Kuliner', 'Pertanian', 'Kerajinan', 'Jasa & Servis', 'Sembako'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Row 3: Radius / Jarak Filter & Pembayaran */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            
            {/* Radius Segmented Filter */}
            <div className="md:col-span-7 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Radius Jarak:
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
                    className="w-24 accent-blue-600 cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-blue-700">{customDistanceKm} km</span>
                </div>
              )}
            </div>

            {/* Payment Filter & Open Status */}
            <div className="md:col-span-5 flex items-center justify-start md:justify-end gap-2">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as any)}
                className="py-1.5 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-bold focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Semua Metode Bayar</option>
                <option value="qris">Ada QRIS</option>
                <option value="cod">Bisa COD</option>
                <option value="do">Bisa Delivery (DO)</option>
              </select>

              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyOpen}
                  onChange={(e) => setOnlyOpen(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Toko Buka</span>
              </label>
            </div>

          </div>
        </div>

        {/* Status Bar Results Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Menampilkan <strong>{filteredList.length}</strong> produk UMKM warga</span>
          <span className="text-[11px] text-slate-400">Jarak dihitung langsung dari koordinat lokasi penjual</span>
        </div>

        {/* Product Grid */}
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
                  {/* Image & Top Badges */}
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                    <img
                      src={item.fotoUrl}
                      alt={item.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Distance Badge */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/75 backdrop-blur-sm text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                      <Navigation className="w-3 h-3 text-sky-400" />
                      <span>{formattedDist} dari Anda</span>
                    </div>

                    {/* Status Toko */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-sm bg-white/90 text-emerald-700">
                      {item.statusToko}
                    </div>

                    {/* Category pill */}
                    <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-blue-600/90 text-white text-[10px] font-black uppercase tracking-wider">
                      {item.kategori}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-blue-600" />
                        <span className="truncate">{item.tokoNama}</span>
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 mt-1 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {item.nama}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.deskripsi}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      {/* Price & Sold Stats */}
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-lg font-black text-blue-600">
                            Rp {item.harga.toLocaleString('id-ID')}
                          </div>
                          {item.satuan && (
                            <span className="text-[10px] text-slate-400">/{item.satuan}</span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                          <span>{item.rating}</span>
                          <span className="text-slate-300">•</span>
                          <span>{item.terjual} terjual</span>
                        </div>
                      </div>

                      {/* Payment Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold">
                        {item.metodePembayaran?.qris && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                            <QrCode className="w-3 h-3" />
                            QRIS
                          </span>
                        )}
                        {item.metodePembayaran?.cod && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                            <Banknote className="w-3 h-3" />
                            COD
                          </span>
                        )}
                        {item.metodePembayaran?.do && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            Bisa DO
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors text-center cursor-pointer"
                        >
                          Lihat Detail
                        </button>
                        <a
                          href={getWaLink(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Pesan WA</span>
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
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">Tidak ada produk yang cocok</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Coba perluas radius jarak atau gunakan kata kunci pencarian yang lain.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
                setDistanceFilter('all');
                setPaymentFilter('all');
                setOnlyOpen(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL DETAIL PRODUK
          ========================================================================= */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header image */}
            <div className="relative aspect-[16/10] bg-slate-100">
              <img
                src={selectedItem.fotoUrl}
                alt={selectedItem.nama}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                {selectedItem.kategori}
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600">{selectedItem.tokoNama}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    {formatDistance(calculateDistanceKm(userLocation.lat, userLocation.lng, selectedItem.lat, selectedItem.lng))} dari posisi Anda
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {selectedItem.nama}
                </h3>
                <div className="text-2xl font-black text-blue-600 mt-2">
                  Rp {selectedItem.harga.toLocaleString('id-ID')}
                  {selectedItem.satuan && <span className="text-xs text-slate-400 font-normal"> /{selectedItem.satuan}</span>}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700">Deskripsi Produk:</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedItem.deskripsi}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{selectedItem.alamat}</span>
                </div>
              </div>

              {/* Payment Methods Info */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">Opsi Pembayaran & Pengiriman:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {selectedItem.metodePembayaran?.qris && (
                    <button
                      type="button"
                      onClick={() => setShowQrisModal(selectedItem)}
                      className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold flex items-center gap-2 hover:bg-rose-100 transition-colors text-left"
                    >
                      <QrCode className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <div>QRIS Digital</div>
                        <div className="text-[10px] text-rose-600 font-normal">Klik untuk lihat barcode</div>
                      </div>
                    </button>
                  )}
                  {selectedItem.metodePembayaran?.cod && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div>Bayar di Tempat (COD)</div>
                        <div className="text-[10px] text-emerald-600 font-normal">Bayar tunai saat terima</div>
                      </div>
                    </div>
                  )}
                  {selectedItem.metodePembayaran?.do && (
                    <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 font-bold flex items-center gap-2">
                      <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                      <div>
                        <div>Delivery Order (DO)</div>
                        <div className="text-[10px] text-sky-600 font-normal">Bisa diantar kurir lokal</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleShare(selectedItem)}
                  className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                  title="Bagikan"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
                <a
                  href={getWaLink(selectedItem)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Hubungi Penjual via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL PREVIEW QRIS
          ========================================================================= */}
      {showQrisModal && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowQrisModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center space-y-4 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-4 h-4" />
                QRIS Nasional
              </span>
              <button
                onClick={() => setShowQrisModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-base">{showQrisModal.tokoNama}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Scan kode di bawah menggunakan GoPay, OVO, Dana, BCA, atau Livin' Mandiri</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-rose-200 inline-block shadow-sm">
              <img
                src={showQrisModal.qrisUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SIDESKU_QRIS_DOKO'}
                alt="Barcode QRIS Toko"
                className="w-52 h-52 object-contain mx-auto"
              />
            </div>

            <div className="text-[11px] text-slate-400">
              {showQrisNama(showQrisModal)}
            </div>

            <button
              onClick={() => setShowQrisModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

function showQrisNama(item: UmkmItem): string {
  return item.qrisNama || `NMID: ID102026${item.id.replace(/\D/g, '') || '9981'}`;
}
