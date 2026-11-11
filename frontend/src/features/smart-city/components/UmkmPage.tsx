import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Search,
  CheckCircle2,
  Phone,
  QrCode,
  Truck,
  ChevronRight,
  ChevronDown,
  Store,
  X,
  Star,
  ShieldCheck,
  ShieldAlert,
  LogIn,
  UserPlus,
  BadgeCheck,
  Info,
  SlidersHorizontal,
  RotateCcw,
  Navigation,
  Compass,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { Pagination } from '@/shared/components/Pagination';
import { UmkmItem } from '../types';
import {
  smartCityApi
} from '../api/smartCityApi';
import {
  getStoredUmkmList,
  KEDIRI_DEFAULT_COORDS,
  calculateDistanceKm,
  formatDistance
} from '../smartCityStorage';
import { LocationPickerModal } from './LocationPickerModal';

export const UmkmPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [umkmList, setUmkmList] = useState<UmkmItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filter State (All Dropdowns)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [distanceMode, setDistanceMode] = useState<string>('all'); // 'all', '1', '3', '5', '10', 'custom'
  const [customDistanceKm, setCustomDistanceKm] = useState<string>('2.5');
  const [isDistanceDropdownOpen, setIsDistanceDropdownOpen] = useState(false);
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price' | 'popular'>('distance');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 6;

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(() => {
    try {
      const saved =
        localStorage.getItem('sidesku_user_smartcity_location') ||
        localStorage.getItem('Nexora_user_smartcity_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.lat && parsed?.lng) return { lat: parsed.lat, lng: parsed.lng };
      }
    } catch {}
    return KEDIRI_DEFAULT_COORDS;
  });
  const [locationLabel, setLocationLabel] = useState<string>(() => {
    try {
      const saved =
        localStorage.getItem('sidesku_user_smartcity_location') ||
        localStorage.getItem('Nexora_user_smartcity_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.label) return parsed.label;
      }
    } catch {}
    return 'Kelurahan Sukamaju';
  });

  // Modals
  const [showLocationModal, setShowLocationModal] = useState(false);
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
  const [uploadOngkir, setUploadOngkir] = useState<number>(0);
  const [uploadSatuan, setUploadSatuan] = useState('Porsi');
  const [uploadDeskripsi, setUploadDeskripsi] = useState('');
  const [uploadFotoUrl, setUploadFotoUrl] = useState('');
  const [uploadQris, setUploadQris] = useState(true);
  const [uploadCod, setUploadCod] = useState(true);
  const [uploadEstimasi, setUploadEstimasi] = useState('15 - 30 Menit (Fresh Cook)');
  const [publishSuccessToast, setPublishSuccessToast] = useState(false);

  // Mobile / Tablet Filter Accordion State (Collapsed by default on mobile)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'Semua') count++;
    if (distanceMode !== 'all') count++;
    if (deliveryFilter !== 'all') count++;
    if (paymentFilter !== 'all') count++;
    if (ratingFilter !== 'all') count++;
    if (sortBy !== 'distance') count++;
    return count;
  }, [selectedCategory, distanceMode, deliveryFilter, paymentFilter, ratingFilter, sortBy]);

  const CATEGORY_TABS = [
    { id: 'Semua', label: 'Semua' },
    { id: 'Kuliner & Kudapan', label: 'Kuliner' },
    { id: 'Bahan Pokok & Sembako', label: 'Sembako' },
    { id: 'Kriya & Kerajinan', label: 'Kriya' },
    { id: 'Jasa Panggilan', label: 'Jasa' },
    { id: 'Fashion & Batik', label: 'Fashion' }
  ];

  // Initial Fetch & Sync from Backend API
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      const data = await smartCityApi.getUmkmList({
        user_lat: userLocation.lat,
        user_lng: userLocation.lng,
      });
      if (isMounted) {
        setUmkmList(data);
        setIsLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [userLocation]);

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, distanceMode, customDistanceKm, deliveryFilter, paymentFilter, ratingFilter, sortBy]);

  // Filter & Sort Logic
  const filteredList = useMemo(() => {
    let result = umkmList.filter((item) => {
      // 1. Search Query: instant search
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

      // 3. Distance Filter (Dropdown & Custom Input)
      const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
      let maxDistLimit: number | null = null;
      if (distanceMode === '1') maxDistLimit = 1;
      else if (distanceMode === '3') maxDistLimit = 3;
      else if (distanceMode === '5') maxDistLimit = 5;
      else if (distanceMode === '10') maxDistLimit = 10;
      else if (distanceMode === 'custom' && customDistanceKm && !isNaN(Number(customDistanceKm))) {
        maxDistLimit = Number(customDistanceKm);
      }

      if (maxDistLimit !== null && dist > maxDistLimit) {
        return false;
      }

      // 4. Delivery Filter: Direct Seller Only
      if (deliveryFilter === 'cod' && !item.metodePembayaran?.cod) return false;
      if (deliveryFilter === 'ambil' && !item.metodePembayaran?.do) return false;

      // 5. Payment Filter
      if (paymentFilter === 'qris' && !item.metodePembayaran?.qris) return false;
      if (paymentFilter === 'cod' && !item.metodePembayaran?.cod) return false;

      // 6. Rating Filter
      if (ratingFilter === '4.5' && item.rating < 4.5) return false;
      if (ratingFilter === '4.8' && item.rating < 4.8) return false;
      if (ratingFilter === '5.0' && item.rating < 5.0) return false;

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
  }, [umkmList, searchQuery, selectedCategory, distanceMode, customDistanceKm, deliveryFilter, paymentFilter, ratingFilter, sortBy, userLocation]);

  // Paginated List
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredList.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredList, currentPage]);

  // Popular search chips
  const popularKeywords = ['Nasi Liwet', 'Beras Rojolele', 'Servis AC', 'Batik'];

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedCategory !== 'Semua' ||
    distanceMode !== 'all' ||
    deliveryFilter !== 'all' ||
    paymentFilter !== 'all' ||
    ratingFilter !== 'all'
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setDistanceMode('all');
    setCustomDistanceKm('2.5');
    setIsDistanceDropdownOpen(false);
    setDeliveryFilter('all');
    setPaymentFilter('all');
    setRatingFilter('all');
    setSortBy('distance');
  };

  // Direct Quick WA Order from Grid Card
  const handleQuickWa = (item: UmkmItem) => {
    const text = encodeURIComponent(
      `Halo *${item.tokoNama}*, saya melihat produk *"${item.nama}"* (Rp ${item.harga.toLocaleString('id-ID')}) di Nexora Smart City Kediri. Pengiriman langsung oleh penjual ya? Apakah stok masih tersedia?`
    );
    window.open(`https://wa.me/${item.waKontak}?text=${text}`, '_blank');
  };

  // Click Handler for "Buka Toko / Upload Produk Saya" (Direct URL Navigation)
  const handleOpenStoreClick = () => {
    if (!user) {
      setShowAuthAlertModal(true);
    } else {
      navigate('/dashboard/smart-city-umkm/tambah');
    }
  };

  // Handle Publish New Product from Store Manager (Calls Backend API)
  const handlePublishProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadNama.trim()) {
      alert('Silakan masukkan nama produk.');
      return;
    }

    const newItemPayload: Partial<UmkmItem> = {
      nama: uploadNama.trim(),
      tokoNama: user?.name ? `Usaha ${user.name}` : 'Warung Bu Dewi Sukamaju',
      kelurahan: 'Kel. Sukamaju',
      rtRw: 'RT 03 / RW 04',
      kategori: uploadKategori,
      badgeTag: 'PRODUKSI SENDIRI',
      harga: Number(uploadHarga) || 25000,
      ongkir: Number(uploadOngkir) || 0,
      satuan: uploadSatuan || 'Porsi',
      deskripsi: uploadDeskripsi.trim() || 'Produk segar olahan warga lokal tanpa bahan pengawet. Pengantaran langsung oleh penjual.',
      fotoUrl: uploadFotoUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      alamat: 'Jl. Kaliurang Gg. Mawar No. 4, Kel. Sukamaju',
      lat: userLocation.lat + (Math.random() - 0.5) * 0.005,
      lng: userLocation.lng + (Math.random() - 0.5) * 0.005,
      waKontak: '6281234567801',
      metodePembayaran: {
        qris: uploadQris,
        cod: uploadCod,
        do: true,
        transfer: true
      },
      bukaJamText: uploadEstimasi,
    };

    const saved = await smartCityApi.createUmkmProduct(newItemPayload);
    setUmkmList(prev => [saved, ...prev.filter(p => p.id !== saved.id)]);
    setUploadNama('');
    setUploadDeskripsi('');
    setPublishSuccessToast(true);
    setTimeout(() => setPublishSuccessToast(false), 3000);
  };

  return (
    <div className="space-y-8 font-sans pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">

      {/* =========================================================================
          HERO BANNER (Responsive & Balanced for Mobile, Tablet & Desktop)
          ========================================================================= */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 lg:p-8 border border-slate-200/90 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
          
          {/* Left Title & Subtitle */}
          <div className="space-y-2 sm:space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
              <span>All Store • Pasar Produk Warga Kediri</span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Belanja Langsung dari Tetangga & UMKM Sekitar
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dukung usaha mikro kota tanpa biaya perantara. Deteksi jarak real-time GPS, pembayaran QRIS langsung atau COD diantar langsung oleh penjual secara mandiri.
            </p>
          </div>

          {/* Right Action: Geolocation Card & CTA Button */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5 sm:gap-3">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 min-w-0">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Lokasi Terdeteksi</span>
                  <span className="font-bold text-slate-900 text-xs truncate block">{locationLabel}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-[11px] font-bold text-blue-700 transition-all cursor-pointer shadow-2xs shrink-0"
              >
                Ubah Titik Lokasi
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenStoreClick}
              className="w-full px-5 py-2.5 sm:py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Store className="w-4 h-4" />
              <span>Buka Toko / Upload Produk</span>
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SEARCH BAR & DROPDOWN FILTER SECTION (Mobile & Tablet Optimized)
          ========================================================================= */}
      <section className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3.5">
        
        {/* Search Input (Inline on all screen sizes, compact & neat) */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kuliner, sembako, servis tukang, kriya..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-8 py-2.5 sm:py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
          >
            Cari
          </button>
        </div>

        {/* Quick Category Pills (One-Tap Filter for Orang Awam) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
          {CATEGORY_TABS.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700 border border-slate-200/60'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Popular Tags (Horizontal smooth scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs text-slate-500 pt-0.5">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Populer:</span>
          {popularKeywords.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchQuery(tag)}
              className="px-2.5 py-0.5 rounded-full bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/80 text-slate-600 text-[10px] font-semibold transition-colors cursor-pointer shrink-0"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* =====================================================================
            COLLAPSIBLE FILTER BAR (Compact Accordion on Mobile/Tablet)
            ===================================================================== */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          
          {/* Mobile & Tablet Accordion Header (Compact Toggle Bar) */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-slate-900 text-xs">Filter Lengkap & Jarak</span>
                    {activeFilterCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-black">
                        {activeFilterCount} Aktif
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {distanceMode === 'all' ? 'Semua Jarak' : `${distanceMode} km`} • {deliveryFilter === 'all' ? 'Semua Pengantaran' : deliveryFilter.toUpperCase()} • {sortBy === 'distance' ? 'Jarak Terdekat' : sortBy}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {hasActiveFilters && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetFilters();
                    }}
                    className="text-[11px] font-bold text-rose-600 hover:underline px-1.5 py-0.5"
                  >
                    Reset
                  </span>
                )}
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isMobileFilterOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Filter Title Header */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Filter Produk & Pengiriman</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-black">
                  {activeFilterCount} Aktif
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Semua Filter</span>
              </button>
            )}
          </div>

          {/* Filter Grid (Collapsible on Mobile/Tablet, Always Open on Desktop) */}
          <div className={`${isMobileFilterOpen ? 'block animate-fade-in' : 'hidden lg:block'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs pt-1">
              
              {/* 1. Dropdown Kategori */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold outline-none focus:bg-white focus:border-blue-500 shadow-2xs cursor-pointer"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="Kuliner & Kudapan">Kuliner & Kudapan</option>
                  <option value="Bahan Pokok & Sembako">Bahan Pokok & Sembako</option>
                  <option value="Kriya & Kerajinan">Kriya & Kerajinan</option>
                  <option value="Jasa Panggilan">Jasa Panggilan</option>
                  <option value="Fashion & Batik">Fashion & Batik</option>
                </select>
              </div>

              {/* 2. Dropdown Jarak dengan Pilihan Kustom Langsung di Dropdown */}
              <div className="relative">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Jarak Radius</label>
                <button
                  type="button"
                  onClick={() => setIsDistanceDropdownOpen(!isDistanceDropdownOpen)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold outline-none focus:bg-white focus:border-blue-500 shadow-2xs cursor-pointer flex items-center justify-between gap-1 text-left"
                >
                  <span className="truncate">
                    {distanceMode === 'all'
                      ? 'Semua Jarak'
                      : distanceMode === 'custom'
                      ? `Maks. ${customDistanceKm || '0'} km`
                      : `Maks. ${distanceMode} km`}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {isDistanceDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsDistanceDropdownOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 space-y-2.5 z-30 animate-fade-in text-xs">
                      <div className="font-bold text-slate-800 text-[11px] pb-1 border-b border-slate-100 flex items-center justify-between">
                        <span>Pilih Radius Maksimal</span>
                        {distanceMode !== 'all' && (
                          <button
                            type="button"
                            onClick={() => {
                              setDistanceMode('all');
                              setIsDistanceDropdownOpen(false);
                            }}
                            className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer"
                          >
                            Reset Jarak
                          </button>
                        )}
                      </div>

                      {/* Quick Preset Buttons */}
                      <div className="space-y-0.5">
                        {[
                          { id: 'all', label: 'Semua Jarak (Default)' },
                          { id: '1', label: 'Maksimal 1 km (Sangat Dekat)' },
                          { id: '3', label: 'Maksimal 3 km (Area Sekitar)' },
                          { id: '5', label: 'Maksimal 5 km (Kecamatan)' },
                          { id: '10', label: 'Maksimal 10 km (Kota Kediri)' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setDistanceMode(opt.id);
                              setIsDistanceDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium transition-colors flex items-center justify-between cursor-pointer ${
                              distanceMode === opt.id
                                ? 'bg-blue-50 text-blue-700 font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {distanceMode === opt.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </button>
                        ))}
                      </div>

                      {/* Inline Custom Distance Form */}
                      <div className="border-t border-slate-100 pt-2.5 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Atur Jarak Kustom:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0.1"
                            max="50"
                            step="0.5"
                            value={customDistanceKm}
                            onChange={(e) => setCustomDistanceKm(e.target.value)}
                            placeholder="Contoh: 2.5"
                            className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                          />
                          <span className="text-[11px] font-bold text-slate-500">km</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (customDistanceKm && !isNaN(Number(customDistanceKm))) {
                                setDistanceMode('custom');
                                setIsDistanceDropdownOpen(false);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-2xs transition-colors shrink-0 cursor-pointer"
                          >
                            Terapkan
                          </button>
                        </div>

                        {/* Quick Pills Inside Dropdown */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {['1.5', '2.5', '7.0', '15.0'].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                setCustomDistanceKm(val);
                                setDistanceMode('custom');
                                setIsDistanceDropdownOpen(false);
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer ${
                                distanceMode === 'custom' && customDistanceKm === val
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700'
                              }`}
                            >
                              {val} km
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 3. Dropdown Pengiriman (Murni Penjual-Pembeli) */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Metode Pengantaran</label>
                <select
                  value={deliveryFilter}
                  onChange={(e) => setDeliveryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold outline-none focus:bg-white focus:border-blue-500 shadow-2xs cursor-pointer"
                >
                  <option value="all">Semua Pengiriman</option>
                  <option value="cod">Diantar Langsung Penjual (COD)</option>
                  <option value="ambil">Ambil Sendiri di Lapak</option>
                </select>
              </div>

              {/* 4. Dropdown Metode Bayar */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Metode Pembayaran</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold outline-none focus:bg-white focus:border-blue-500 shadow-2xs cursor-pointer"
                >
                  <option value="all">Semua Metode</option>
                  <option value="qris">QRIS Penjual Langsung</option>
                  <option value="cod">Tunai / Bayar di Tempat</option>
                </select>
              </div>

              {/* 5. Dropdown Rating */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Rating Penilaian</label>
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold outline-none focus:bg-white focus:border-blue-500 shadow-2xs cursor-pointer"
                >
                  <option value="all">Semua Rating</option>
                  <option value="4.5">Rating 4.5 Ke Atas</option>
                  <option value="4.8">Rating 4.8 Ke Atas</option>
                  <option value="5.0">Rating 5.0 Sempurna</option>
                </select>
              </div>

              {/* 6. Dropdown Urutkan */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Urutkan Hasil</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900 text-xs font-bold outline-none focus:bg-white focus:border-blue-500 shadow-2xs cursor-pointer"
                >
                  <option value="distance">Jarak Terdekat (GPS)</option>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="price">Harga Termurah</option>
                  <option value="popular">Paling Banyak Terjual</option>
                </select>
              </div>

            </div>
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
          3-COLUMN PRODUCT CARDS GRID
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
                      <MapPin className="w-3.5 h-3.5 text-slate-700" />
                      <span>{distLabel} dari Anda</span>
                    </div>

                    {/* Status / Category Tag (Right) */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black tracking-wider uppercase shadow-2xs">
                      {item.badgeTag || (item.isJasa ? 'JASA KILAT' : 'DIANTAR PENJUAL')}
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

                      {/* Direct Seller Payment & Delivery Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {item.metodePembayaran?.cod && (
                          <span>
                          </span>
                        )}
                        {!item.isJasa && (
                          Number(item.ongkir ?? 0) === 0 ? (
                            <span >
                            </span>
                          ) : (
                            <span>

                            </span>
                          )
                        )}
                        {item.metodePembayaran?.qris && (
                          <span>
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
                      className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
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
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <h4 className="text-base font-bold text-slate-800">Tidak ada produk yang cocok</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba kurangi filter jarak atau ganti kata kunci pencarian Anda untuk melihat produk tetangga lainnya.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      )}

      {/* =========================================================================
          TRANSPARANSI & KEBERPIHAKAN BANNER
          (Pengiriman murni penjual-pembeli mandiri, tanpa perantara pihak ketiga)
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

          {/* Card 3: Pure Direct Seller Delivery */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-black text-sm">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">Pengantaran Langsung Penjual</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transaksi dan pengantaran dilakukan langsung oleh penjual kepada pembeli secara mandiri atau COD tanpa perantara pihak ketiga, aman dan bebas biaya perantara.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODAL: UBAH TITIK LOKASI ANDA (Leaflet Map + Presets + GPS Tanpa Alert)
          ========================================================================= */}
      <LocationPickerModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentCoords={userLocation}
        currentLabel={locationLabel}
        onSaveLocation={(coords, label) => {
          setUserLocation(coords);
          setLocationLabel(label);
          try {
            const data = JSON.stringify({ ...coords, label });
            localStorage.setItem('sidesku_user_smartcity_location', data);
            localStorage.setItem('Nexora_user_smartcity_location', data);
          } catch {}
        }}
      />

      {/* =========================================================================
          RESTRICTED CITIZEN AUTHENTICATION ALERT MODAL
          ========================================================================= */}
      {showAuthAlertModal && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 animate-fade-in">
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
                Wajib Masuk / Terdaftar Sebagai Warga Kota
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Layanan buka lapak dagang dan upload produk UMKM di Nexora hanya diperuntukkan bagi warga terverifikasi domisili RT/RW setempat. Warga dari luar daerah tidak diizinkan berjualan demi menjaga ekosistem ekonomi tetangga yang adil, jujur, dan aman.
              </p>
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
                to="/login?redirect=/dashboard/smart-city-umkm/tambah"
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk / Login</span>
              </Link>
              <Link
                to="/register"
                className="flex-1 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftar Akun</span>
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* =========================================================================
          QRIS POPUP MODAL
          ========================================================================= */}
      {showQrisModal && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 animate-fade-in">
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
                <rect x="5" y="5" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="8" y="8" width="19" height="19" fill="#ffffff" rx="2" />
                <rect x="11" y="11" width="13" height="13" fill="#0f172a" rx="2" />

                <rect x="70" y="5" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="73" y="8" width="19" height="19" fill="#ffffff" rx="2" />
                <rect x="76" y="11" width="13" height="13" fill="#0f172a" rx="2" />

                <rect x="5" y="70" width="25" height="25" fill="#0f172a" rx="4" />
                <rect x="8" y="73" width="19" height="19" fill="#ffffff" rx="2" />
                <rect x="11" y="76" width="13" height="13" fill="#0f172a" rx="2" />

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

                <rect x="42" y="42" width="16" height="16" fill="#0284c7" rx="3" />
                <path d="M46 50 L50 54 L54 46" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Scan menggunakan GoPay, OVO, Dana, BCA, Livin Mandiri, atau m-Banking apapun tanpa potongan biaya admin tambahan.
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
