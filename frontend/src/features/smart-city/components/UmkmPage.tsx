import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Search,
  CheckCircle2,
  Phone,
  QrCode,
  Truck,
  ChevronRight,
  Store,
  X,
  Star,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  UserPlus,
  BadgeCheck,
  Info,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { Pagination } from '@/shared/components/Pagination';
import { UmkmItem } from '../types';
import {
  getStoredUmkmList,
  saveStoredUmkmItem,
  KEDIRI_DEFAULT_COORDS,
  calculateDistanceKm,
  formatDistance
} from '../smartCityStorage';

export const UmkmPage: React.FC = () => {
  const { user } = useAuth();

  const [umkmList, setUmkmList] = useState<UmkmItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [distanceFilter, setDistanceFilter] = useState<'all' | '1' | '3' | '5' | '10'>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [minRatingFilter, setMinRatingFilter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price' | 'popular'>('distance');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 6;

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(KEDIRI_DEFAULT_COORDS);
  const [isLocating, setIsLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string>('Kelurahan Sukamaju (Akurasi Tinggi)');

  // Modals
  const [showAuthAlertModal, setShowAuthAlertModal] = useState(false);
  const [showStoreManagerModal, setShowStoreManagerModal] = useState(false);
  const [showQrisModal, setShowQrisModal] = useState<{
    tokoNama: string;
    qrisUrl: string;
    nmid?: string;
    nominal?: number;
  } | null>(null);

  // Toko Manager Form State
  const [uploadNama, setUploadNama] = useState('');
  const [uploadKategori, setUploadKategori] = useState('Kuliner & Kudapan');
  const [uploadHarga, setUploadHarga] = useState<number>(25000);
  const [uploadSatuan, setUploadSatuan] = useState('Porsi');
  const [uploadDeskripsi, setUploadDeskripsi] = useState('');
  const [uploadFotoUrl, setUploadFotoUrl] = useState('');
  const [uploadQris, setUploadQris] = useState(true);
  const [uploadCod, setUploadCod] = useState(true);
  const [uploadEstimasi, setUploadEstimasi] = useState('15 - 30 Menit (Fresh Cook)');
  const [publishSuccessToast, setPublishSuccessToast] = useState(false);

  useEffect(() => {
    setUmkmList(getStoredUmkmList());
  }, []);

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, distanceFilter, deliveryFilter, paymentFilter, minRatingFilter, sortBy]);

  // Handle GPS detection
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
        setLocationLabel('GPS Riil Terdeteksi (Akurasi Tinggi)');
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setLocationLabel('Kelurahan Sukamaju / Kota Kediri');
        console.warn('Geolocation fallback:', err);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Filter & Sort Logic
  const filteredList = useMemo(() => {
    let result = umkmList.filter((item) => {
      // 1. Search Query: instant match (even single character)
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

      // 3. Distance Filter
      const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
      if (distanceFilter === '1' && dist > 1) return false;
      if (distanceFilter === '3' && dist > 3) return false;
      if (distanceFilter === '5' && dist > 5) return false;
      if (distanceFilter === '10' && dist > 10) return false;

      // 4. Delivery Filter
      if (deliveryFilter === 'cod' && !item.metodePembayaran?.cod) return false;
      if (deliveryFilter === 'do' && !item.metodePembayaran?.do) return false;

      // 5. Payment Filter
      if (paymentFilter === 'qris' && !item.metodePembayaran?.qris) return false;
      if (paymentFilter === 'cod' && !item.metodePembayaran?.cod) return false;

      // 6. Rating Filter
      if (minRatingFilter && item.rating < 4.5) return false;

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      const distA = calculateDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = calculateDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      if (sortBy === 'distance') return distA - distB;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') return a.harga - b.harga;
      if (sortBy === 'popular') return (b.terjual || 0) - (a.terjual || 0);
      return 0;
    });

    return result;
  }, [umkmList, searchQuery, selectedCategory, distanceFilter, deliveryFilter, paymentFilter, minRatingFilter, sortBy, userLocation]);

  // Paginated List
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredList, currentPage]);

  // Popular search chips
  const popularKeywords = ['Nasi Liwet', 'Beras Rojolele', 'Servis AC', 'Batik'];

  // Categories list
  const categoryPills = [
    'Semua',
    'Kuliner & Kudapan',
    'Bahan Pokok & Sembako',
    'Kriya & Kerajinan',
    'Jasa Panggilan',
    'Fashion & Batik'
  ];

  // Direct Quick WA Order from Grid Card
  const handleQuickWa = (item: UmkmItem) => {
    const text = encodeURIComponent(
      `Halo *${item.tokoNama}*, saya melihat produk *"${item.nama}"* (Rp ${item.harga.toLocaleString('id-ID')}) di SiDesKu Smart City Kediri. Apakah stok masih tersedia?`
    );
    window.open(`https://wa.me/${item.waKontak}?text=${text}`, '_blank');
  };

  // Click Handler for "Buka Toko / Upload Produk Saya"
  const handleOpenStoreClick = () => {
    if (!user) {
      setShowAuthAlertModal(true);
    } else {
      setShowStoreManagerModal(true);
    }
  };

  // Handle Publish New Product from Store Manager
  const handlePublishProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadNama.trim()) {
      alert('Silakan masukkan nama produk.');
      return;
    }
    const newItem: UmkmItem = {
      id: `umkm-${Date.now()}`,
      nama: uploadNama.trim(),
      tokoNama: user?.name ? `Usaha ${user.name}` : 'Warung Bu Dewi Sukamaju',
      kelurahan: 'Kel. Sukamaju',
      rtRw: 'RT 03 / RW 04',
      kategori: uploadKategori,
      badgeTag: 'PRODUKSI SENDIRI',
      harga: Number(uploadHarga) || 25000,
      satuan: uploadSatuan || 'Porsi',
      deskripsi: uploadDeskripsi.trim() || 'Produk segar olahan warga lokal tanpa bahan pengawet.',
      fotoUrl: uploadFotoUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      galeri: [uploadFotoUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'],
      alamat: 'Jl. Kaliurang Gg. Mawar No. 4, Kel. Sukamaju',
      lat: userLocation.lat + (Math.random() - 0.5) * 0.005,
      lng: userLocation.lng + (Math.random() - 0.5) * 0.005,
      waKontak: '6281234567801',
      qrisUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570014ID.LINKAJA.WWW01189360091100213192025204581253033605802ID5918WARUNG_BU_DEWI6006KEDIRI62070703A016304E1F2',
      qrisNama: user?.name ? `QRIS ${user.name.toUpperCase()}` : 'QRIS WARUNG BU DEWI',
      qrisNmid: 'ID10293847281',
      metodePembayaran: {
        qris: uploadQris,
        cod: uploadCod,
        do: true,
        transfer: true
      },
      statusToko: 'Buka',
      rating: 5.0,
      terjualText: 'Baru • Fresh Cook',
      terjual: 1,
      bukaJamText: uploadEstimasi,
      createdAt: new Date().toISOString()
    };

    const updated = saveStoredUmkmItem(newItem);
    setUmkmList(updated);
    setUploadNama('');
    setUploadDeskripsi('');
    setPublishSuccessToast(true);
    setTimeout(() => setPublishSuccessToast(false), 3000);
  };

  return (
    <div className="space-y-8 font-sans pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">

      {/* =========================================================================
          HERO BANNER (Matching Stitch Mockup 1)
          ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left Title & Subtitle */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-extrabold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>PASAR HYPERLOCAL WARGA • 0% KOMISI PLATFORM</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Belanja Langsung dari Tetangga & UMKM Sekitar
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dukung usaha mikro kota tanpa biaya perantara. Deteksi jarak real-time GPS, pembayaran QRIS langsung atau COD/DO antar mandiri.
            </p>
          </div>

          {/* Right Action: Geolocation Card & CTA Button */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Lokasi Terdeteksi</span>
                  <span className="font-bold text-slate-900 text-xs">{locationLabel}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-[11px] font-bold text-blue-700 transition-all cursor-pointer shadow-2xs"
              >
                {isLocating ? 'Mendeteksi...' : 'Ubah Titik Lokasi'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenStoreClick}
              className="w-full px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Store className="w-4 h-4" />
              <span>+ Buka Toko / Upload Produk Saya</span>
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SEARCH BAR & POPULAR KEYWORDS
          ========================================================================= */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        {/* Input */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kuliner, produk sembako, servis tukang, kriya lokal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
          >
            Cari
          </button>
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Populer:</span>
          {popularKeywords.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchQuery(tag)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/60 text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryPills.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Filter Bar (Jarak, Pengiriman, Metode Bayar, Rating, Urutkan) */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Left Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-bold text-[11px] mr-1">Jarak:</span>
            {[
              { id: 'all', label: 'Semua Jarak' },
              { id: '1', label: '1 km' },
              { id: '3', label: '3 km' },
              { id: '5', label: '5 km' },
              { id: '10', label: '10 km' }
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDistanceFilter(d.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  distanceFilter === d.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-300 font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {d.label}
              </button>
            ))}

            {/* Dropdown Pengiriman */}
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="all">Semua Pengiriman</option>
              <option value="cod">Siap Antar (COD)</option>
              <option value="do">Delivery Order (DO)</option>
            </select>

            {/* Dropdown Metode Bayar */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="all">Metode Bayar</option>
              <option value="qris">QRIS Pedagang</option>
              <option value="cod">Tunai / COD</option>
            </select>

            {/* Rating Filter Button */}
            <button
              type="button"
              onClick={() => setMinRatingFilter(!minRatingFilter)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                minRatingFilter
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>4.5+</span>
            </button>
          </div>

          {/* Right Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="distance">Jarak Terdekat (GPS)</option>
              <option value="rating">Rating Tertinggi</option>
              <option value="price">Harga Termurah</option>
              <option value="popular">Paling Banyak Terjual</option>
            </select>
          </div>

        </div>
      </section>

      {/* =========================================================================
          RESULT HEADER
          ========================================================================= */}
      <div id="umkm-catalog-section" className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="uppercase tracking-wider text-[11px] text-slate-600">PRODUK & LAYANAN SIAP DIPESAN:</span>
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold">{filteredList.length} Produk</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Pedagang Terverifikasi Warga Sukamaju / Kota Kediri</span>
        </div>
      </div>

      {/* =========================================================================
          3-COLUMN PRODUCT CARDS GRID (Matching Screen 1)
          ========================================================================= */}
      {paginatedList.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedList.map((item) => {
              const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
              const distLabel = formatDistance(distanceKm);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Image & Top Badges */}
                  <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                    <img
                      src={item.fotoUrl}
                      alt={item.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Distance Chip (Left) */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 text-[11px] font-extrabold text-slate-800 shadow-2xs flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{distLabel} dari Anda</span>
                    </div>

                    {/* Status / Category Tag (Right) */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black tracking-wider uppercase shadow-2xs">
                      {item.badgeTag || (item.isJasa ? 'JASA KILAT' : 'SIAP ANTAR')}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      {/* Store Title & Kelurahan */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-bold text-slate-700 hover:text-blue-600 transition-colors flex items-center gap-1">
                          {item.tokoNama}
                          <Info className="w-3 h-3 text-slate-400" />
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">{item.kelurahan || item.rtRw || 'Kota Kediri'}</span>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-600 transition-colors">
                        {item.nama}
                      </h3>

                      {/* Rating & Terjual */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 pt-0.5">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">{item.terjualText || `${item.terjual || 0}+ terjual`}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold">{item.bukaJamText || 'Buka Hari Ini'}</span>
                      </div>

                      {/* Payment Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.metodePembayaran?.cod && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-blue-700 font-bold text-[10px]">
                            Bisa COD / DO
                          </span>
                        )}
                        {item.metodePembayaran?.qris && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-[10px]">
                            QRIS Pedagang
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Unit Row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Harga Satuan</span>
                        <div className="text-base font-black text-slate-900">
                          Rp {item.harga.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {item.satuan || 'Porsi'}
                      </span>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="px-5 pb-5 pt-1 flex items-center gap-2">
                    <Link
                      to={`/smart-city/umkm/${item.id}`}
                      className="flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer border border-slate-200"
                    >
                      <span>Lihat Detail</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleQuickWa(item)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Beli via WA</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {filteredList.length > PAGE_SIZE && (
            <div className="pt-2">
              <Pagination
                currentPage={currentPage}
                totalItems={filteredList.length}
                pageSize={PAGE_SIZE}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  const el = document.getElementById('umkm-catalog-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                itemLabel="produk & layanan"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h4 className="text-base font-bold text-slate-800">Tidak ada produk yang cocok</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba kurangi filter jarak atau ganti kata kunci pencarian Anda untuk melihat produk tetangga lainnya.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Semua');
              setDistanceFilter('all');
              setDeliveryFilter('all');
              setPaymentFilter('all');
              setMinRatingFilter(false);
            }}
            className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* =========================================================================
          TRANSPARANSI & KEBERPIHAKAN BANNER (Matching Stitch Mockup 1 Bottom)
          ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">TRANSPARANSI & KEBERPIHAKAN</span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Ekosistem UMKM Warga Adil & Mandiri
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {/* Card 1 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
              %
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">0% Potongan Komisi</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              100% uang hasil penjualan masuk langsung ke dompet penjual atau pedagang tanpa potongan biaya aplikasi Pemda secuil pun.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">Verifikasi KTP & RT Setempat</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Setiap lapak terdaftar adalah penduduk rukun warga kota riil, menjaga keaslian pedagang dan keamanan transaksi tetangga.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-black text-sm">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">Pengantaran Antar RW Cepat</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dukungan pengantaran mandiri langsung antar gang, titip di pos ronda terdekat, atau COD hangat tanpa batas pesanan minimum.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          RESTRICTED CITIZEN AUTHENTICATION ALERT MODAL
          ========================================================================= */}
      {showAuthAlertModal && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl border border-sky-100 relative">
            <button
              type="button"
              onClick={() => setShowAuthAlertModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/60 border border-amber-200 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider">
                <span>Akses Khusus Warga Setempat</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                Wajib Login
              </h3>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span>Verifikasi NIK & Wilayah RT/RW</span>
              </div>
              <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">
                Silakan masuk dengan akun warga Anda atau daftarkan diri Anda dengan melampirkan data kependudukan resmi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <Link
                to="/login"
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
              {/* <Link
                to="/register"
                className="flex-1 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftar Akun</span>
              </Link> */}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          STORE MANAGER MODAL (Matching Stitch Mockup 3: Warung Bu Dewi)
          ========================================================================= */}
      {showStoreManagerModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-sky-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Store Header Banner */}
            <div className="p-6 bg-gradient-to-r from-blue-700 to-sky-600 text-white shrink-0 relative">
              <button
                type="button"
                onClick={() => setShowStoreManagerModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pr-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black">
                      {user?.name ? `Usaha ${user.name}` : 'Warung Bu Dewi Sukamaju'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-200 text-[10px] font-black flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Terverifikasi RT 03 / RW 04</span>
                    </span>
                  </div>
                  <div className="text-xs text-sky-100 flex flex-wrap items-center gap-3">
                    <span>Kuliner & Katering Rumahan</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Sukamaju, Kec. Doko</span>
                    <span>•</span>
                    <span>★ 4.9 (42 Ulasan Warga)</span>
                    <span>•</span>
                    <span className="text-emerald-300 font-bold">● Buka 08:00 - 20:00 WIB</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowQrisModal({
                      tokoNama: user?.name ? `Toko ${user.name}` : 'Warung Bu Dewi',
                      qrisUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570014ID.LINKAJA.WWW01189360091100213192025204581253033605802ID5918WARUNG_BU_DEWI6006KEDIRI62070703A016304E1F2',
                      nmid: 'ID10293847281'
                    })}
                    className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Pengaturan QRIS</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1">
              
              {publishSuccessToast && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Produk baru berhasil dipublikasikan dan langsung muncul di etalase pasar warga!</span>
                </div>
              )}

              {/* Upload Form Box */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Upload Produk Berikutnya</h3>
                    <p className="text-xs text-slate-500">Produk langsung tampil di etalase toko dan katalog pasar warga secara otomatis.</p>
                  </div>
                </div>

                <form onSubmit={handlePublishProduct} className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/70 p-6 rounded-3xl border border-slate-200/90">
                  
                  {/* Left Column: Image Drop Area */}
                  <div className="md:col-span-5 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      FOTO PRODUK
                    </label>
                    <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl aspect-4/3 flex flex-col items-center justify-center p-4 text-center bg-white cursor-pointer transition-colors relative overflow-hidden group">
                      {uploadFotoUrl ? (
                        <img src={uploadFotoUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <div className="space-y-2 text-slate-400">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 text-xs block">Pilih Foto Produk</span>
                            <span className="text-[10px] text-slate-400">Format JPG, PNG maksimal 5 MB</span>
                          </div>
                          <span className="text-[10px] text-blue-600 font-bold underline block pt-1">Browse Galeri</span>
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Atau tempel URL gambar di sini..."
                      value={uploadFotoUrl}
                      onChange={(e) => setUploadFotoUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Right Column: Form Inputs */}
                  <div className="md:col-span-7 space-y-4 text-xs">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                        NAMA PRODUK KULINER / LAYANAN
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Sayur Asem Komplit Bu Dewi"
                        value={uploadNama}
                        onChange={(e) => setUploadNama(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                          KATEGORI
                        </label>
                        <select
                          value={uploadKategori}
                          onChange={(e) => setUploadKategori(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none"
                        >
                          <option value="Kuliner & Kudapan">Kuliner & Kudapan</option>
                          <option value="Bahan Pokok & Sembako">Bahan Pokok & Sembako</option>
                          <option value="Kriya & Kerajinan">Kriya & Kerajinan</option>
                          <option value="Jasa Panggilan">Jasa Panggilan</option>
                          <option value="Fashion & Batik">Fashion & Batik</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                          HARGA SATUAN (RP)
                        </label>
                        <input
                          type="number"
                          value={uploadHarga}
                          onChange={(e) => setUploadHarga(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                          METODE PEMBAYARAN
                        </label>
                        <div className="space-y-1.5 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={uploadQris}
                              onChange={(e) => setUploadQris(e.target.checked)}
                              className="rounded text-blue-600"
                            />
                            <span className="font-semibold text-slate-700">QRIS SiDesKu Toko</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={uploadCod}
                              onChange={(e) => setUploadCod(e.target.checked)}
                              className="rounded text-blue-600"
                            />
                            <span className="font-semibold text-slate-700">Bisa COD / Bayar di Tempat</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                          ESTIMASI PENYIAPAN
                        </label>
                        <select
                          value={uploadEstimasi}
                          onChange={(e) => setUploadEstimasi(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none"
                        >
                          <option value="15 - 30 Menit (Fresh Cook)">15 - 30 Menit (Fresh Cook)</option>
                          <option value="Siap Langsung (Stok Siap)">Siap Langsung (Stok Siap)</option>
                          <option value="Pre-order 1 Hari">Pre-order 1 Hari</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-95"
                      >
                        Publikasikan Produk Sekarang
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Katalog Produk Warung Bu Dewi */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Katalog Produk Warung Bu Dewi</h3>
                    <p className="text-xs text-slate-500">{umkmList.length} produk aktif tayang di katalog pasar warga</p>
                  </div>
                  <span className="text-xs text-slate-400">Urutkan: Terbaru</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {umkmList.slice(0, 3).map((prod) => (
                    <div key={prod.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100">
                        <img src={prod.fotoUrl} alt={prod.nama} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black">
                          ● Aktif • Stok Tersedia
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[10px] font-extrabold uppercase text-slate-400">{prod.kategori}</div>
                        <div className="font-extrabold text-slate-900 text-xs truncate">{prod.nama}</div>
                        <div className="text-sm font-black text-blue-700">Rp {prod.harga.toLocaleString('id-ID')}</div>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => alert(`Fitur edit produk ${prod.nama} siap digunakan.`)}
                          className="font-bold text-slate-600 hover:text-blue-600"
                        >
                          Edit Produk
                        </button>
                        <Link
                          to={`/smart-city/umkm/${prod.id}`}
                          onClick={() => setShowStoreManagerModal(false)}
                          className="font-bold text-blue-600 hover:underline"
                        >
                          Lihat Halaman
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom QRIS Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900">QRIS Resmi Terverifikasi Pemkot • NMID: ID10293847281</div>
                    <div className="text-slate-500 text-[11px]">QRIS Siap Terima Pembayaran Langsung ke Rekening Bu Dewi (Tanpa Potongan Biaya Admin).</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQrisModal({
                    tokoNama: 'Warung Bu Dewi Sukamaju',
                    qrisUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021126570014ID.LINKAJA.WWW01189360091100213192025204581253033605802ID5918WARUNG_BU_DEWI6006KEDIRI62070703A016304E1F2',
                    nmid: 'ID10293847281'
                  })}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-blue-700 font-bold hover:bg-blue-50 transition-colors shadow-2xs shrink-0 cursor-pointer"
                >
                  Tampilkan QRIS Kasir
                </button>
              </div>

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          QRIS POPUP MODAL
          ========================================================================= */}
      {showQrisModal && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center space-y-4 shadow-2xl border border-sky-100 relative">
            <button
              onClick={() => setShowQrisModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 block">
                QRIS NASIONAL STANDAR PEMKOT
              </span>
              <h3 className="text-base font-black text-slate-900">{showQrisModal.tokoNama}</h3>
              {showQrisModal.nmid && (
                <div className="text-[11px] font-mono text-slate-400 font-bold">NMID: {showQrisModal.nmid}</div>
              )}
            </div>

            {showQrisModal.nominal && (
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-900">
                <span className="text-[10px] text-blue-600 font-medium block">Nominal Tagihan:</span>
                <span className="text-lg font-black">Rp {showQrisModal.nominal.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl inline-block shadow-inner relative">
              <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100" fill="currentColor">
                {/* QR Finder Corners */}
                <rect x="5" y="5" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="8" y="8" width="19" height="19" fill="#ffffff" rx="2" />
                <rect x="11" y="11" width="13" height="13" fill="#0f172a" rx="2" />

                <rect x="70" y="5" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="73" y="8" width="19" height="19" fill="#ffffff" rx="2" />
                <rect x="76" y="11" width="13" height="13" fill="#0f172a" rx="2" />

                <rect x="5" y="70" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="8" y="73" width="19" height="19" fill="#ffffff" rx="2" />
                <rect x="11" y="76" width="13" height="13" fill="#0f172a" rx="2" />

                {/* Timing patterns and matrix data cells */}
                <rect x="35" y="11" width="5" height="5" fill="#0f172a" />
                <rect x="45" y="11" width="5" height="5" fill="#0f172a" />
                <rect x="55" y="11" width="5" height="5" fill="#0f172a" />
                <rect x="11" y="35" width="5" height="5" fill="#0f172a" />
                <rect x="11" y="45" width="5" height="5" fill="#0f172a" />
                <rect x="11" y="55" width="5" height="5" fill="#0f172a" />
                
                <rect x="35" y="35" width="10" height="10" fill="#0f172a" rx="2" />
                <rect x="55" y="35" width="10" height="5" fill="#0f172a" />
                <rect x="45" y="45" width="15" height="10" fill="#0f172a" rx="2" />
                <rect x="35" y="60" width="10" height="10" fill="#0f172a" />
                <rect x="55" y="55" width="15" height="10" fill="#0f172a" />
                <rect x="75" y="45" width="10" height="15" fill="#0f172a" />
                <rect x="40" y="75" width="15" height="10" fill="#0f172a" />
                <rect x="65" y="75" width="10" height="15" fill="#0f172a" />
                <rect x="80" y="70" width="15" height="10" fill="#0f172a" />

                {/* Center QRIS logo badge */}
                <rect x="42" y="42" width="16" height="16" fill="#0284c7" rx="3" />
                <path d="M46 50 L50 54 L54 46" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Scan menggunakan GoPay, OVO, Dana, BCA, Livin Mandiri, atau m-Banking apapun tanpa biaya admin tambahan.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  alert('QRIS tersimpan ke unduhan Anda.');
                  setShowQrisModal(null);
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Unduh Gambar QRIS
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
