import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Phone,
  QrCode,
  Truck,
  ChevronRight,
  ArrowLeft,
  X,
  Star,
  Check,
  ShieldCheck,
  ShieldAlert,
  Award,
  Info,
  Calendar,
  Clock,
  Share2,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Send,
  LogIn,
  User,
  Heart
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { UmkmItem, UmkmReviewItem } from '../types';
import { smartCityApi } from '../api/smartCityApi';
import {
  getStoredUmkmList,
  KEDIRI_DEFAULT_COORDS,
  calculateDistanceKm,
  formatDistance
} from '../smartCityStorage';

export const UmkmDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [umkmList, setUmkmList] = useState<UmkmItem[]>([]);
  const [currentItem, setCurrentItem] = useState<UmkmItem | null>(null);
  const [reviews, setReviews] = useState<UmkmReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);
  const [showQrisModal, setShowQrisModal] = useState<{
    tokoNama: string;
    qrisUrl: string;
    nmid?: string;
    nominal?: number;
  } | null>(null);

  // User Geolocation for Distance Display
  const [userLocation] = useState<{ lat: number; lng: number }>(() => {
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

  // Food Interactive Form State
  const [orderPilihanAyam, setOrderPilihanAyam] = useState<string>('Paha Rempah');
  const [orderPilihanSambal, setOrderPilihanSambal] = useState<string>('Sambal Terasi');
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderDeliveryType, setOrderDeliveryType] = useState<'penjual' | 'ambil'>('penjual');
  const [activeTabDetail, setActiveTabDetail] = useState<'deskripsi' | 'lokasi' | 'ulasan'>('deskripsi');

  // Jasa Interactive Form State
  const [selectedJasaServiceId, setSelectedJasaServiceId] = useState<string>('j-1');
  const [jasaUnitQty, setJasaUnitQty] = useState<number>(1);
  const [jasaSesi, setJasaSesi] = useState<'pagi' | 'siang'>('pagi');
  const [jasaPaymentMethod, setJasaPaymentMethod] = useState<'tunai' | 'qris'>('tunai');

  // Checkout & Delivery Form State (Solves: Data Pembeli, Alamat Lengkap, dan Konfirmasi QRIS)
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'qris' | 'cod'>('qris');
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [buyerAddress, setBuyerAddress] = useState<string>('');
  const [buyerPatokan, setBuyerPatokan] = useState<string>('');
  const [buyerNotes, setBuyerNotes] = useState<string>('');
  const [formValidationNotice, setFormValidationNotice] = useState<string | null>(null);

  // Auto-fill buyer information from logged-in user profile
  useEffect(() => {
    if (user?.name && !buyerName) setBuyerName(user.name);
    const phone = (user as any)?.phone || (user as any)?.no_hp;
    if (phone && !buyerPhone) setBuyerPhone(phone);
  }, [user]);

  // Citizen Review Form State
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewHoverRating, setReviewHoverRating] = useState<number>(0);
  const [reviewKomentar, setReviewKomentar] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessToast, setReviewSuccessToast] = useState<boolean>(false);

  // Fetch Item & Reviews from Backend API
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    let isMounted = true;

    const loadData = async () => {
      if (!id) return;
      setIsLoading(true);
      // Fetch full list for related items
      const allList = await smartCityApi.getUmkmList();
      if (isMounted) setUmkmList(allList);

      // Fetch detail and reviews
      const detail = await smartCityApi.getUmkmDetail(id);
      const revs = await smartCityApi.getUmkmReviews(id);

      if (isMounted) {
        if (detail) {
          setCurrentItem(detail);
        } else {
          // fallback to local list
          const found = allList.find((u) => u.id === id);
          if (found) setCurrentItem(found);
        }

        if (revs && revs.length > 0) {
          setReviews(revs);
        } else if (detail?.reviews && detail.reviews.length > 0) {
          setReviews(detail.reviews);
        } else {
          // Mock initial fallback reviews for demo
          setReviews([
            {
              id: 1,
              umkmId: id,
              rating: 5,
              komentar: 'Pelayanannya ramah banget dan diantar langsung oleh penjual tepat waktu. Rasanya sangat memuaskan!',
              reviewerName: 'Pak Hendra (Warga RT 02)',
              reviewerRtRw: 'RT 02 / RW 04',
              createdAt: '2026-11-09T10:00:00Z',
            },
            {
              id: 2,
              umkmId: id,
              rating: 5,
              komentar: 'Sangat recommended untuk warga sekitar. Bebas biaya perantara dan bayar QRIS langsung praktis.',
              reviewerName: 'Ibu Ratna Dewi',
              reviewerRtRw: 'RT 01 / RW 04',
              createdAt: '2026-11-10T08:30:00Z',
            }
          ]);
        }
        setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (currentItem) {
      setActiveGalleryIndex(0);
      setOrderQty(1);
      setOrderPilihanAyam('Paha Rempah');
      setOrderPilihanSambal('Sambal Terasi');
      setOrderDeliveryType('penjual');
      setActiveTabDetail('deskripsi');
      if (currentItem.isJasa && currentItem.pilihanLayananJasa?.length) {
        setSelectedJasaServiceId(currentItem.pilihanLayananJasa[0].id);
        setJasaUnitQty(1);
        setJasaSesi('pagi');
        setJasaPaymentMethod('tunai');
      }
    }
  }, [currentItem]);

  // Submit Review Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Anda harus masuk / login terlebih dahulu untuk menulis ulasan.');
      return;
    }
    if (!reviewKomentar.trim()) {
      alert('Silakan tuliskan komentar ulasan Anda.');
      return;
    }
    if (!currentItem) return;

    setIsSubmittingReview(true);
    try {
      const res = await smartCityApi.submitUmkmReview(currentItem.id, {
        rating: reviewRating,
        komentar: reviewKomentar.trim(),
      });

      // Update state
      setReviews(prev => [res.review, ...prev]);
      if (res.updatedUmkm) {
        setCurrentItem(prev => prev ? {
          ...prev,
          rating: res.updatedUmkm!.rating,
          reviewsCount: res.updatedUmkm!.reviewsCount,
        } : null);
      } else {
        // Local recalculation
        const newCount = reviews.length + 1;
        const sum = reviews.reduce((acc, r) => acc + r.rating, reviewRating);
        const newAvg = Number((sum / newCount).toFixed(1));
        setCurrentItem(prev => prev ? { ...prev, rating: newAvg, reviewsCount: newCount } : null);
      }

      setReviewKomentar('');
      setReviewRating(5);
      setReviewSuccessToast(true);
      setTimeout(() => setReviewSuccessToast(false), 4000);
    } catch (err: any) {
      console.warn('Failed to submit review:', err);
      // Fallback local review
      const fallbackRev: UmkmReviewItem = {
        id: Date.now(),
        umkmId: currentItem.id,
        userId: user?.id,
        rating: reviewRating,
        komentar: reviewKomentar.trim(),
        reviewerName: user?.name || 'Warga Terdaftar',
        reviewerRtRw: 'Warga Setempat',
        createdAt: new Date().toISOString(),
      };
      setReviews(prev => [fallbackRev, ...prev]);
      setReviewKomentar('');
      setReviewSuccessToast(true);
      setTimeout(() => setReviewSuccessToast(false), 4000);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // If item not found
  if (!currentItem && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl font-bold">
          ?
        </div>
        <h2 className="text-xl font-black text-slate-800">Produk Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Produk atau layanan yang Anda cari mungkin sudah tidak aktif atau link yang dibuka sudah usang.
        </p>
        <Link
          to="/smart-city/umkm"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pasar UMKM</span>
        </Link>
      </div>
    );
  }

  if (!currentItem) return null;

  // Distance calculation
  const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, currentItem.lat, currentItem.lng);
  const distLabel = formatDistance(distanceKm);

  // Price calculations for Food (Ongkir ditentukan oleh Penjual)
  const extraChickenPrice = orderPilihanAyam.includes('Ayam Kampung') ? 7000 : 0;
  const foodBasePrice = currentItem.harga + extraChickenPrice;
  const sellerOngkir = Math.max(0, Number(currentItem.ongkir ?? 0));
  const foodDeliveryFee = orderDeliveryType === 'penjual' ? sellerOngkir : 0;
  const totalFoodPrice = foodBasePrice * orderQty + foodDeliveryFee;

  // Price calculations for Jasa
  const activeJasa = currentItem.pilihanLayananJasa?.find((s) => s.id === selectedJasaServiceId) || currentItem.pilihanLayananJasa?.[0];
  const totalJasaPrice = activeJasa ? activeJasa.harga * jasaUnitQty : currentItem.harga;

  // Handle Submit Order & Send WhatsApp Confirmation (Strictly Direct Seller Delivery with Full Buyer & Delivery Details)
  const handleConfirmOrder = () => {
    if (!currentItem) return;

    if (!buyerName.trim()) {
      setFormValidationNotice('Mohon isi nama lengkap Anda.');
      return;
    }
    if (!buyerPhone.trim()) {
      setFormValidationNotice('Mohon isi nomor WhatsApp Anda agar penjual dapat menghubungi Anda.');
      return;
    }
    if ((orderDeliveryType === 'penjual' || currentItem.isJasa) && !buyerAddress.trim()) {
      setFormValidationNotice('Mohon isi alamat rumah pengantaran Anda.');
      return;
    }

    setFormValidationNotice(null);

    const orderCode = `#ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    let message = '';

    if (currentItem.isJasa) {
      message =
        `Halo *${currentItem.tokoNama}*, saya ingin memesan jasa kunjungan teknisi melalui SiDesKu Smart City Kediri:\n\n` +
        `📦 *RINCIAN LAYANAN (${orderCode})*\n` +
        `• *Layanan:* ${activeJasa?.nama || currentItem.nama}\n` +
        `• *Jumlah:* ${jasaUnitQty} unit\n` +
        `• *Jadwal Kunjungan:* Sesi ${jasaSesi === 'pagi' ? 'Pagi (09:00 - 12:00 WIB)' : 'Siang (13:00 - 16:00 WIB)'}\n` +
        `• *Metode Bayar:* ${checkoutPaymentMethod === 'qris' ? 'QRIS Langsung Toko (Lunas via Transfer)' : 'Tunai / COD usai servis'}\n` +
        `• *Estimasi Biaya:* Rp ${totalJasaPrice.toLocaleString('id-ID')}\n\n` +
        `📍 *DATA PEMESAN & ALAMAT KUNJUNGAN*\n` +
        `• *Nama Pemesan:* ${buyerName.trim()}\n` +
        `• *No. WhatsApp:* ${buyerPhone.trim()}\n` +
        `• *Alamat Rumah:* ${buyerAddress.trim()}\n` +
        (buyerPatokan.trim() ? `• *Patokan Lokasi:* ${buyerPatokan.trim()}\n` : '') +
        (buyerNotes.trim() ? `• *Keluhan / Catatan:* ${buyerNotes.trim()}\n` : '') +
        `\n` +
        (checkoutPaymentMethod === 'qris'
          ? `(Bukti transfer pembayaran QRIS saya lampirkan di chat ini).\n\nMohon konfirmasi ketersediaan teknisi dan jadwal kedatangannya. Terima kasih!`
          : `Mohon konfirmasi ketersediaan teknisinya ya. Terima kasih!`);
    } else {
      message =
        `Halo *${currentItem.tokoNama}*, saya ingin memesan produk dari etalase SiDesKu Smart City Kediri:\n\n` +
        `📦 *RINCIAN PESANAN (${orderCode})*\n` +
        `• *Produk:* ${currentItem.nama}\n` +
        (currentItem.pilihanAyam ? `• *Pilihan Potongan:* ${orderPilihanAyam}\n` : '') +
        (currentItem.pilihanSambal ? `• *Pilihan Sambal:* ${orderPilihanSambal}\n` : '') +
        `• *Jumlah:* ${orderQty} porsi / unit\n` +
        `• *Pengantaran:* ${orderDeliveryType === 'penjual' ? (sellerOngkir === 0 ? 'Diantar Langsung oleh Penjual (Gratis Ongkir / Rp 0)' : `Diantar Langsung oleh Penjual (+Rp ${sellerOngkir.toLocaleString('id-ID')})`) : 'Ambil Sendiri di Lapak Penjual (Gratis)'}\n` +
        `• *Metode Bayar:* ${checkoutPaymentMethod === 'qris' ? 'QRIS Langsung Toko (Lunas via Transfer)' : 'Tunai / Bayar di Tempat (COD Mandiri)'}\n` +
        `• *Total Tagihan:* Rp ${totalFoodPrice.toLocaleString('id-ID')}\n\n` +
        `📍 *DATA PEMESAN & ALAMAT PENGANTARAN*\n` +
        `• *Nama Pemesan:* ${buyerName.trim()}\n` +
        `• *No. WhatsApp:* ${buyerPhone.trim()}\n` +
        (orderDeliveryType === 'penjual' ? `• *Alamat Pengantaran:* ${buyerAddress.trim()}\n` : '• *Pengambilan:* Ambil Sendiri di Lapak Penjual\n') +
        (buyerPatokan.trim() ? `• *Patokan Rumah:* ${buyerPatokan.trim()}\n` : '') +
        (buyerNotes.trim() ? `• *Catatan Pesanan:* ${buyerNotes.trim()}\n` : '') +
        `\n` +
        (checkoutPaymentMethod === 'qris'
          ? `(Bukti transfer pembayaran QRIS saya lampirkan di chat ini).\n\nMohon segera diproses dan diantar ya bu/pak. Terima kasih!`
          : `Mohon segera diproses dan diantar ya bu/pak. Terima kasih!`);
    }

    window.open(`https://wa.me/${currentItem.waKontak}?text=${encodeURIComponent(message)}`, '_blank');
    setShowCheckoutModal(false);
  };

  const imagesGallery = currentItem.galeri && currentItem.galeri.length > 0 ? currentItem.galeri : [currentItem.fotoUrl];
  const activeImage = imagesGallery[activeGalleryIndex] || currentItem.fotoUrl;

  return (
    <div className="font-sans pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8">

      {/* =========================================================================
          TOP BREADCRUMB & VERIFIED BADGE
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/smart-city/umkm" className="hover:text-blue-600 transition-colors flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Katalog Pasar UMKM</span>
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-400">{currentItem.kategori}</span>
          <span>/</span>
          <span className="font-bold text-slate-900 truncate max-w-xs">{currentItem.nama}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Lapak Terverifikasi {currentItem.kelurahan || 'Kota Kediri'}</span>
        </div>
      </div>

      {/* =========================================================================
          SCREEN 4: JASA DETAIL VIEW
          ========================================================================= */}
      {currentItem.isJasa ? (
        <div className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Tech Hero & SOP */}
            <div className="lg:col-span-7 space-y-6">
              <div className="relative aspect-16/10 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-sm">
                <img
                  src={currentItem.fotoUrl}
                  alt={currentItem.nama}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{currentItem.rtRw ? `Terverifikasi ${currentItem.rtRw}` : 'Terverifikasi RT 02 / RW 05'}</span>
                </div>
                <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-bold shadow-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Sertifikasi BNSP Resmi</span>
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {currentItem.tokoNama}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                    SiDesKu Verified
                  </span>
                  <span>★ {currentItem.rating.toFixed(1)} ({reviews.length} ulasan)</span>
                  <span>•</span>
                  <span>Respon cepat ~10 menit</span>
                  <span>•</span>
                  <span>Radius panggilan max 7 km</span>
                </div>
              </div>

              {/* Cakupan Kerja Layanan (STANDAR SOP) */}
              <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/90 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Cakupan Kerja Layanan</h3>
                  <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/60 px-2.5 py-0.5 rounded">STANDAR SOP</span>
                </div>
                <div className="space-y-3 text-xs text-slate-700">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 text-xs font-bold">Cuci & Pembersihan Komprehensif</strong>
                      <span className="text-slate-500 text-[11px] leading-relaxed">Pembersihan total filter evaporator unit indoor, talang air pembuangan, dan kisi kondensor outdoor.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 text-xs font-bold">Ukur Tekanan Freon & Deteksi Kebocoran</strong>
                      <span className="text-slate-500 text-[11px] leading-relaxed">Pengujian manifold pressure pada jalur R32 / R410A serta pendeteksian dini sambungan flare pipa tembaga.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 text-xs font-bold">Pengecekan Arus Kelistrikan & Ampere</strong>
                      <span className="text-slate-500 text-[11px] leading-relaxed">Inspeksi kapasitor starting kompresor, kondisi motor fan, dan kestabilan grounding kelistrikan rumah.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Green Garansi Banner */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3.5 text-xs text-emerald-950">
                <Award className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-950 font-black text-xs">Garansi Dingin 30 Hari Penuh (RESMI)</strong>
                  <span className="text-emerald-800 leading-relaxed">Bila AC kembali bocor atau kurang dingin dalam 30 hari pasca pengerjaan, teknisi hadir kembali tanpa biaya jasa tambahan.</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Harga pasti sesuai kesepakatan awal tanpa biaya tersembunyi. Pembayaran langsung ke penyedia jasa.</span>
              </div>
            </div>

            {/* Right Column: Order Form Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-50/70 border border-slate-200/90 space-y-5">
                <div>
                  <h3 className="text-base font-black text-slate-900">Pesan Jasa Kunjungan Teknisi</h3>
                  <p className="text-[11px] text-slate-500">Pilih tipe penanganan, atur jadwal, dan teknisi langsung berangkat.</p>
                </div>

                {/* Service Options */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">PILIH LAYANAN</span>
                  {currentItem.pilihanLayananJasa?.map((svc) => (
                    <label
                      key={svc.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedJasaServiceId === svc.id
                          ? 'bg-white border-blue-500 shadow-xs ring-2 ring-blue-100 font-bold'
                          : 'bg-white/80 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="jasa_service"
                          checked={selectedJasaServiceId === svc.id}
                          onChange={() => setSelectedJasaServiceId(svc.id)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-slate-800">{svc.nama}</span>
                      </div>
                      <span className="font-extrabold text-blue-700">Rp {svc.harga.toLocaleString('id-ID')}</span>
                    </label>
                  ))}
                </div>

                {/* Quantity Units */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">JUMLAH UNIT AC</span>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-xs font-medium text-slate-600">Sesuaikan unit AC yang diservis</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setJasaUnitQty(Math.max(1, jasaUnitQty - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-sm text-slate-700"
                      >
                        -
                      </button>
                      <span className="text-xs font-black text-slate-900 w-5 text-center">{jasaUnitQty}</span>
                      <button
                        type="button"
                        onClick={() => setJasaUnitQty(jasaUnitQty + 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-black text-sm text-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Jadwal Kunjungan */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">JADWAL KUNJUNGAN</span>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setJasaSesi('pagi')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        jasaSesi === 'pagi'
                          ? 'bg-white border-blue-500 ring-2 ring-blue-100 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="font-black text-slate-900 text-xs">Sesi Pagi</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">09:00 - 12:00 WIB</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setJasaSesi('siang')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        jasaSesi === 'siang'
                          ? 'bg-white border-blue-500 ring-2 ring-blue-100 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="font-black text-slate-900 text-xs">Sesi Siang</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">13:00 - 16:00 WIB</div>
                    </button>
                  </div>
                </div>

                {/* Metode Pembayaran */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">METODE PEMBAYARAN</span>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setJasaPaymentMethod('tunai')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        jasaPaymentMethod === 'tunai'
                          ? 'bg-white border-blue-500 ring-2 ring-blue-100 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="font-black text-slate-900 text-xs">Tunai / COD</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Bayar Usai Servis</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setJasaPaymentMethod('qris')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        jasaPaymentMethod === 'qris'
                          ? 'bg-white border-blue-500 ring-2 ring-blue-100 font-bold'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="font-black text-slate-900 text-xs">QRIS Mas Agus</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Semua e-Wallet</div>
                    </button>
                  </div>
                </div>

                {/* Total & Action CTAs */}
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Estimasi Biaya Bersih</span>
                    <div>
                      <span className="text-xl font-black text-blue-700">Rp {totalJasaPrice.toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-slate-400 block text-right">Tanpa biaya admin aplikasi</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutPaymentMethod(jasaPaymentMethod === 'qris' ? 'qris' : 'cod');
                      setShowCheckoutModal(true);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Lengkapi Alamat & Pesan Teknisi</span>
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      ) : (
        /* =========================================================================
            SCREEN 2: FOOD / PHYSICAL PRODUCT DETAIL VIEW
            ========================================================================= */
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Image Gallery & Seller Profile Card */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Main Big Photo */}
              <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-2xs group">
                <img
                  src={activeImage}
                  alt={currentItem.nama}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-black text-slate-800 shadow-2xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{distLabel} dari Lokasi Anda</span>
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                  {currentItem.badgeTag || 'DIANTAR PENJUAL'}
                </div>
              </div>

              {/* Thumbnail Bar */}
              {imagesGallery.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {imagesGallery.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveGalleryIndex(idx)}
                      className={`relative aspect-4/3 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeGalleryIndex === idx
                          ? 'border-blue-600 ring-2 ring-blue-100'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Seller Profile Card (Matching Screen 2 Bottom Left) */}
              <div className="p-5 rounded-3xl bg-slate-50/80 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                    {currentItem.tokoNama.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                      {currentItem.tokoNama}
                    </h3>
                    <div className="text-slate-500 text-xs flex items-center gap-2 mt-0.5">
                      <span>{currentItem.rtRw || 'RT 03 / RW 04'} • {currentItem.kelurahan || 'Sukamaju'}</span>
                      <span>•</span>
                      <span className="text-amber-500 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{currentItem.rating.toFixed(1)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => alert(`Lapak ${currentItem.tokoNama} siap melayani warga secara langsung.`)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Kunjungi Lapak
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const text = encodeURIComponent(`Halo *${currentItem.tokoNama}*, saya ingin bertanya seputar produk Anda.`);
                      window.open(`https://wa.me/${currentItem.waKontak}?text=${text}`, '_blank');
                    }}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Tanya Penjual</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Title, Options & Order Box */}
            <div className="lg:col-span-6 space-y-6">
              
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
                
                {/* Header Tag & Title */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-extrabold uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                      {currentItem.kategori}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 font-medium">{reviews.length} Ulasan Warga</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {currentItem.nama}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {currentItem.deskripsi}
                  </p>
                </div>

                {/* Big Price Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl sm:text-3xl font-black text-blue-700">Rp {currentItem.harga.toLocaleString('id-ID')}</span>
                    <span className="text-xs font-semibold text-slate-500 ml-1.5">/ {currentItem.satuan || 'porsi'}</span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-lg">
                    ✓ Tanpa Biaya Admin
                  </span>
                </div>

                {/* Food Options: Pilihan Potongan Ayam */}
                {currentItem.pilihanAyam && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800">Pilihan Potongan Ayam</span>
                      <span className="text-[10px] text-slate-400">{orderPilihanAyam}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {currentItem.pilihanAyam.map((opt: any, idx) => {
                        const optName = typeof opt === 'string' ? opt : (opt.nama || String(opt));
                        const optKey = typeof opt === 'string' ? opt : (opt.id || opt.nama || idx);
                        const isSelected = orderPilihanAyam === optName;
                        return (
                          <button
                            key={optKey}
                            type="button"
                            onClick={() => setOrderPilihanAyam(optName)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 font-bold text-blue-800 ring-2 ring-blue-100'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {optName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Food Options: Pilihan Sambal */}
                {currentItem.pilihanSambal && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800">Pilihan Sambal</span>
                      <span className="text-[10px] text-slate-400">{orderPilihanSambal}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {currentItem.pilihanSambal.map((smb: any, idx) => {
                        const smbName = typeof smb === 'string' ? smb : (smb.nama || String(smb));
                        const smbKey = typeof smb === 'string' ? smb : (smb.id || smb.nama || idx);
                        const isSelected = orderPilihanSambal === smbName;
                        return (
                          <button
                            key={smbKey}
                            type="button"
                            onClick={() => setOrderPilihanSambal(smbName)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 border-blue-500 font-bold text-blue-800 ring-2 ring-blue-100'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {smbName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Qty Counter */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700">Jumlah Pesanan</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOrderQty(Math.max(1, orderQty - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-black text-sm text-slate-700"
                    >
                      -
                    </button>
                    <span className="font-black text-slate-900 w-6 text-center text-sm">{orderQty}</span>
                    <button
                      type="button"
                      onClick={() => setOrderQty(orderQty + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-black text-sm text-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Delivery Radio Options: Direct Seller Only */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      orderDeliveryType === 'penjual'
                        ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-100 font-bold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="detail_order_delivery"
                        checked={orderDeliveryType === 'penjual'}
                        onChange={() => setOrderDeliveryType('penjual')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <span className="block font-bold">Diantar Langsung oleh Penjual (COD Mandiri)</span>
                        <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                          {sellerOngkir === 0
                            ? '✨ Penjual menggratiskan ongkir untuk pesanan ini'
                            : `* Ongkir Rp ${sellerOngkir.toLocaleString('id-ID')} diatur langsung oleh penjual`}
                        </span>
                      </div>
                    </div>
                    <div>
                      {sellerOngkir === 0 ? (
                        <span className="text-emerald-700 font-extrabold uppercase text-[10px] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          GRATIS ONGKIR
                        </span>
                      ) : (
                        <span className="text-blue-700 font-bold text-xs">
                          Rp {sellerOngkir.toLocaleString('id-ID')}
                        </span>
                      )}
                    </div>
                  </label>

                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      orderDeliveryType === 'ambil'
                        ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-100 font-bold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="detail_order_delivery"
                        checked={orderDeliveryType === 'ambil'}
                        onChange={() => setOrderDeliveryType('ambil')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <span className="block font-bold">Ambil Sendiri di Lapak / Warung Penjual</span>
                        <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                          Ambil langsung ke alamat penjual (bebas biaya)
                        </span>
                      </div>
                    </div>
                    <span className="text-emerald-700 font-extrabold uppercase text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      GRATIS
                    </span>
                  </label>
                </div>

                {/* Total & Action CTAs */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Total Pembayaran:</span>
                    <div>
                      <span className="text-2xl font-black text-blue-700">Rp {totalFoodPrice.toLocaleString('id-ID')}</span>
                      {orderDeliveryType === 'penjual' && (
                        <span className="text-[10px] text-slate-500 block text-right font-medium">
                          {sellerOngkir === 0
                            ? '(Gratis ongkir langsung diantar oleh penjual)'
                            : `(termasuk ongkir penjual Rp ${sellerOngkir.toLocaleString('id-ID')})`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutPaymentMethod('cod');
                        setShowCheckoutModal(true);
                      }}
                      className="py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Pesan via WA (COD)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutPaymentMethod('qris');
                        setShowCheckoutModal(true);
                      }}
                      className="py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Bayar QRIS Langsung</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Product Tabs: Deskripsi, Lokasi, Ulasan */}
          <div className="pt-4 space-y-6">
            <div className="flex items-center gap-8 border-b border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTabDetail('deskripsi')}
                className={`pb-3.5 border-b-2 text-sm transition-all ${
                  activeTabDetail === 'deskripsi'
                    ? 'border-blue-600 text-blue-700 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Deskripsi & Komposisi
              </button>
              <button
                type="button"
                onClick={() => setActiveTabDetail('lokasi')}
                className={`pb-3.5 border-b-2 text-sm transition-all ${
                  activeTabDetail === 'lokasi'
                    ? 'border-blue-600 text-blue-700 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Lokasi & Pengiriman
              </button>
              <button
                type="button"
                onClick={() => setActiveTabDetail('ulasan')}
                className={`pb-3.5 border-b-2 text-sm transition-all ${
                  activeTabDetail === 'ulasan'
                    ? 'border-blue-600 text-blue-700 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Ulasan Warga ({reviews.length})
              </button>
            </div>

            {activeTabDetail === 'deskripsi' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs text-slate-700">
                <div className="md:col-span-8 space-y-4">
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">Warisan Resep Tradisional Sunda-Jawa</h4>
                  <p className="leading-relaxed text-slate-600 text-xs sm:text-sm">
                    {currentItem.deskripsi} Diproduksi langsung dari dapur warga setempat dengan bumbu rempah asli alami tanpa bahan pengawet sintesis.
                  </p>
                  <div className="space-y-2 pt-2">
                    <span className="font-bold text-slate-900 block text-xs">Isi Paket Lengkap:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-600">
                      <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Olahan Higienis Standar Dapur Rumah</span>
                      <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Bumbu Rempah Alami Petani Binaan</span>
                      <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Lalapan Segar Petik Pagi</span>
                      <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Sambal Pilihan Segar Dadakan</span>
                      <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Wadah Ramah Lingkungan</span>
                    </div>
                  </div>
                </div>

                {/* Keterangan Produk Box */}
                <div className="md:col-span-4 p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <h5 className="font-black text-slate-900 uppercase text-[10px] tracking-wider">KETERANGAN PRODUK</h5>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-400">Sertifikat Halal</span>
                      <span className="font-bold text-slate-800">{currentItem.keteranganHalal || 'ID02170000189231'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                      <span className="text-slate-400">Higienitas</span>
                      <span className="font-bold text-emerald-700">{currentItem.keteranganHigienis || 'Lolos Uji Puskesmas'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-400">Dapur</span>
                      <span className="font-bold text-slate-800">{currentItem.kelurahan || 'Kelurahan Sukamaju'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTabDetail === 'lokasi' && (
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Titik Lokasi Lapak / Dapur Warga</span>
                </div>
                <p className="text-slate-600 text-xs">{currentItem.alamat}</p>
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-xs space-y-1">
                  <div className="font-bold">Pengantaran Langsung oleh Penjual:</div>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Pengiriman dilakukan langsung oleh pedagang/penjual ke alamat Anda tanpa melibatkan pihak ketiga atau kurir perantara. Pembayaran dapat dilakukan tunai di tempat (COD) atau scan QRIS kasir.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          REVIEWS & COMMENTS SECTION (Accessible for both Food & Jasa)
          ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-8">
        
        {/* Review Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-blue-600 tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>ULASAN & TESTIMONI WARGA</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Pengalaman Warga Menggunakan Produk / Jasa Ini
            </h2>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="text-2xl font-black text-amber-500 flex items-center gap-1">
              <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              <span>{currentItem.rating.toFixed(1)}</span>
            </div>
            <div className="text-xs text-slate-500 leading-tight">
              <div className="font-bold text-slate-800">Rating Rata-rata</div>
              <div>Berdasarkan {reviews.length} ulasan warga</div>
            </div>
          </div>
        </div>

        {reviewSuccessToast && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Terima kasih! Ulasan Anda telah berhasil disimpan dan kini tampil di ulasan publik.</span>
          </div>
        )}

        {/* =====================================================================
            SUBMIT REVIEW FORM (Requires Login) VS GUEST PROMPT (Review Only Restricted)
            ===================================================================== */}
        {user ? (
          /* AUTHENTICATED CITIZEN REVIEW FORM */
          <form onSubmit={handleSubmitReview} className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Tulis Ulasan Sebagai: {user.name}</div>
                  <div className="text-[10px] text-slate-400">Akun Warga Terverifikasi</div>
                </div>
              </div>

              {/* Star Rating Picker */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 font-bold mr-1">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setReviewHoverRating(star)}
                    onMouseLeave={() => setReviewHoverRating(0)}
                    className="p-1 cursor-pointer transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        (reviewHoverRating || reviewRating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              placeholder="Ceritakan pengalaman Anda membeli produk / memesan jasa ini secara jujur..."
              value={reviewKomentar}
              onChange={(e) => setReviewKomentar(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
              required
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Ulasan warga membantu menjaga transparansi dan kualitas UMKM tetangga kita.
              </span>
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan Warga'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* GUEST NOTICE BANNER (CAN STILL BUY / CHECKOUT, REVIEW BLOCKED) */
          <div className="p-5 sm:p-6 rounded-3xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3 text-xs">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="block text-amber-950 font-black">
                  Ingin Memberikan Ulasan atau Rating?
                </strong>
                <p className="text-amber-800 leading-relaxed">
                  Anda dapat bebas memesan atau membeli produk tanpa login. Namun untuk menulis review, Anda harus masuk / login sebagai warga terdaftar terlebih dahulu guna mencegah ulasan palsu.
                </p>
              </div>
            </div>

            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk / Login untuk Review</span>
            </Link>
          </div>
        )}

        {/* Review Comments List */}
        <div className="space-y-4">
          <div className="font-extrabold text-slate-800 text-xs">
            Daftar Ulasan Warga ({reviews.length})
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center">
                          {rev.reviewerName.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{rev.reviewerName}</div>
                          <div className="text-[10px] text-slate-400">
                            {rev.reviewerRtRw && (rev.reviewerRtRw.includes('{') || rev.reviewerRtRw.includes('desa_id'))
                              ? 'RT 01 / RW 01'
                              : (rev.reviewerRtRw || 'Warga Setempat')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      "{rev.komentar}"
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span>Ulasan Pembelian Terverifikasi</span>
                    <span>{new Date(rev.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
              Belum ada ulasan warga untuk produk ini. Jadilah yang pertama memberikan review!
            </div>
          )}
        </div>

      </section>

      {/* =========================================================================
          PRODUK SERUPA DARI PENJUAL SEKITAR
          ========================================================================= */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">PRODUK SEJENIS DI SEKITAR ANDA</span>
            <h3 className="text-lg font-black text-slate-900">Pilihan Produk Lainnya</h3>
          </div>
          <Link to="/smart-city/umkm" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            <span>Lihat Semua Produk</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {umkmList.filter(u => u.id !== currentItem.id).slice(0, 4).map((rel) => (
            <div key={rel.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-100">
                  <img src={rel.fotoUrl} alt={rel.nama} className="w-full h-full object-cover" />
                </div>
                <div className="font-extrabold text-slate-900 text-xs truncate">{rel.nama}</div>
                <div className="text-xs font-black text-blue-700">Rp {rel.harga.toLocaleString('id-ID')}</div>
              </div>

              <Link
                to={`/smart-city/umkm/${rel.id}`}
                className="w-full py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] text-center transition-colors block cursor-pointer"
              >
                Lihat Detail
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          CHECKOUT & PEMESANAN DIRECT SELLER MODAL
          (Solves: Identitas Pembeli, Alamat Lengkap Pengantaran, & Konfirmasi QRIS)
          ========================================================================= */}
      {showCheckoutModal && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[88vh] flex flex-col shadow-2xl border border-sky-100 overflow-hidden relative">
            
            {/* Sticky Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Konfirmasi Pesanan Langsung</h3>
                  <p className="text-xs text-slate-500">
                    Lengkapi alamat rumah & rincian pesanan ke pedagang {currentItem.tokoNama}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCheckoutModal(false);
                  setFormValidationNotice(null);
                }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Warning Banner (Always visible if error) */}
            {formValidationNotice && (
              <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center gap-2 shrink-0 animate-fade-in">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{formValidationNotice}</span>
              </div>
            )}

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              
              {/* Ringkasan Pesanan Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <span className="font-extrabold text-slate-900 text-[13px]">{currentItem.nama}</span>
                  <span className="text-blue-700 font-extrabold">
                    Rp {(currentItem.isJasa ? totalJasaPrice : totalFoodPrice).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Toko / Penjual:</span>
                    <span className="font-semibold text-slate-800">{currentItem.tokoNama}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pilihan / Jumlah:</span>
                    <span className="font-semibold text-slate-800">
                      {currentItem.isJasa
                        ? `${activeJasa?.nama || currentItem.nama} (${jasaUnitQty} Unit)`
                        : `${orderQty} Porsi ${orderPilihanAyam ? `• ${orderPilihanAyam}` : ''}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Metode Pengiriman:</span>
                    <span className="font-semibold text-slate-800">
                      {currentItem.isJasa
                        ? 'Kunjungan Langsung ke Rumah'
                        : orderDeliveryType === 'penjual'
                        ? 'Diantar Penjual (COD Mandiri)'
                        : 'Ambil Sendiri di Lapak'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Ongkir Penjual:</span>
                    <span className="font-semibold text-slate-800">
                      {currentItem.isJasa
                        ? 'Gratis Kunjungan'
                        : orderDeliveryType === 'penjual'
                        ? (sellerOngkir === 0 ? 'Gratis (Rp 0)' : `Rp ${sellerOngkir.toLocaleString('id-ID')}`)
                        : 'Gratis (Ambil Sendiri)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Status Komisi:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      0% (100% Milik Warga)
                    </span>
                  </div>
                </div>
              </div>

              {/* Selector Metode Pembayaran */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  PILIH METODE PEMBAYARAN
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setCheckoutPaymentMethod('qris')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      checkoutPaymentMethod === 'qris'
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-100 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-extrabold text-xs">QRIS Toko</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Semua Bank / e-Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutPaymentMethod('cod')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      checkoutPaymentMethod === 'cod'
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-100 text-blue-900 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-extrabold text-xs">Tunai / COD</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Bayar Pas Sampai</span>
                  </button>
                </div>
              </div>

              {/* Tampilan QRIS Resmi Toko jika metode QRIS dipilih */}
              {checkoutPaymentMethod === 'qris' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 space-y-3 animate-fade-in text-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 block">
                      SCAN QRIS RESMI {currentItem.tokoNama.toUpperCase()}
                    </span>
                    <div className="text-[11px] font-mono text-emerald-800">
                      NMID: {currentItem.qrisNmid || 'ID10293847281'}
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-emerald-200 rounded-xl inline-block shadow-xs">
                    <svg className="w-36 h-36 mx-auto" viewBox="0 0 100 100" fill="currentColor">
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
                </div>
              )}

              {/* Form Data Diri & Alamat Pengantaran */}
              <div className="space-y-3 pt-1 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  DATA PEMESAN & ALAMAT PENGANTARAN
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Nama Lengkap Pemesan *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Bpk. Bambang Sutrisno"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Nomor WhatsApp Aktif *</label>
                    <input
                      type="tel"
                      placeholder="Contoh: 081234567890"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                </div>

                {(orderDeliveryType === 'penjual' || currentItem.isJasa) && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Alamat Lengkap Rumah / Lokasi Pengantaran *
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Jl. Dhoho No. 42, RT 03 / RW 02, Kel. Sukamaju (Samping Apotek)"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Patokan Rumah / Lokasi Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pagar cat hitam, pas depan pos ronda RT 03"
                    value={buyerPatokan}
                    onChange={(e) => setBuyerPatokan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Catatan Pesanan Khusus (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Sambal dipisah ya bu, jangan pakai bawang goreng"
                    value={buyerNotes}
                    onChange={(e) => setBuyerNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

            </div>

            {/* Sticky Fixed Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/90 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowCheckoutModal(false);
                  setFormValidationNotice(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-white cursor-pointer transition-colors"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmOrder}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>
                  {checkoutPaymentMethod === 'qris'
                    ? 'Kirim Pesanan & Bukti Bayar via WA'
                    : 'Kirim Pesanan via WhatsApp (COD)'}
                </span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Legacy QRIS Standalone Popup if needed */}
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
                QRIS RESMI PEDAGANG LOKAL
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
              Scan menggunakan aplikasi m-Banking atau e-Wallet apa saja. Pembayaran diterima langsung oleh pemilik toko tanpa potongan perantara.
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
