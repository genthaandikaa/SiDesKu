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
  Award,
  Info,
  Calendar,
  Clock,
  Share2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { UmkmItem } from '../types';
import {
  getStoredUmkmList,
  KEDIRI_DEFAULT_COORDS,
  calculateDistanceKm,
  formatDistance
} from '../smartCityStorage';

export const UmkmDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [umkmList, setUmkmList] = useState<UmkmItem[]>([]);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number>(0);
  const [showQrisModal, setShowQrisModal] = useState<{
    tokoNama: string;
    qrisUrl: string;
    nmid?: string;
    nominal?: number;
  } | null>(null);

  // Food Interactive Form State
  const [orderPilihanAyam, setOrderPilihanAyam] = useState<string>('Paha Rempah');
  const [orderPilihanSambal, setOrderPilihanSambal] = useState<string>('Sambal Terasi');
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderDeliveryType, setOrderDeliveryType] = useState<'kurir' | 'ambil'>('kurir');
  const [activeTabDetail, setActiveTabDetail] = useState<'deskripsi' | 'lokasi' | 'ulasan'>('deskripsi');

  // Jasa Interactive Form State
  const [selectedJasaServiceId, setSelectedJasaServiceId] = useState<string>('j-1');
  const [jasaUnitQty, setJasaUnitQty] = useState<number>(1);
  const [jasaSesi, setJasaSesi] = useState<'pagi' | 'siang'>('pagi');
  const [jasaPaymentMethod, setJasaPaymentMethod] = useState<'tunai' | 'qris'>('tunai');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const list = getStoredUmkmList();
    setUmkmList(list);
  }, [id]);

  const currentItem = useMemo(() => {
    return umkmList.find((u) => u.id === id);
  }, [umkmList, id]);

  useEffect(() => {
    if (currentItem) {
      setActiveGalleryIndex(0);
      setOrderQty(1);
      setOrderPilihanAyam('Paha Rempah');
      setOrderPilihanSambal('Sambal Terasi');
      setOrderDeliveryType('kurir');
      setActiveTabDetail('deskripsi');
      if (currentItem.isJasa && currentItem.pilihanLayananJasa?.length) {
        setSelectedJasaServiceId(currentItem.pilihanLayananJasa[0].id);
        setJasaUnitQty(1);
        setJasaSesi('pagi');
        setJasaPaymentMethod('tunai');
      }
    }
  }, [currentItem]);

  // If item not found
  if (!currentItem) {
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

  // Price calculations for Food
  const extraChickenPrice = orderPilihanAyam.includes('Ayam Kampung') ? 7000 : 0;
  const baseFoodPrice = currentItem.harga + extraChickenPrice;
  const deliveryFee = orderDeliveryType === 'kurir' ? 5000 : 0;
  const totalFoodPrice = baseFoodPrice * orderQty + deliveryFee;

  // Price calculations for Jasa
  const activeJasaService = currentItem.pilihanLayananJasa?.find(s => s.id === selectedJasaServiceId) || currentItem.pilihanLayananJasa?.[0];
  const totalJasaPrice = activeJasaService ? activeJasaService.harga * jasaUnitQty : currentItem.harga;

  // Send Order via WA
  const handleSendWaOrder = () => {
    let message = '';
    if (currentItem.isJasa) {
      message = `Halo *${currentItem.tokoNama}*, saya ingin memesan jasa kunjungan teknisi melalui SiDesKu Smart City:\n\n` +
        `• *Layanan:* ${activeJasaService?.nama || currentItem.nama}\n` +
        `• *Jumlah:* ${jasaUnitQty} unit\n` +
        `• *Jadwal Kunjungan:* Sesi ${jasaSesi === 'pagi' ? 'Pagi (09:00 - 12:00 WIB)' : 'Siang (13:00 - 16:00 WIB)'}\n` +
        `• *Metode Bayar:* ${jasaPaymentMethod === 'tunai' ? 'Tunai / COD' : 'QRIS Pedagang'}\n` +
        `• *Estimasi Total:* Rp ${totalJasaPrice.toLocaleString('id-ID')}\n\n` +
        `Mohon konfirmasi ketersediaan jadwal. Terima kasih!`;
    } else {
      message = `Halo *${currentItem.tokoNama}*, saya ingin memesan dari etalase SiDesKu Smart City:\n\n` +
        `• *Produk:* ${currentItem.nama}\n` +
        (currentItem.pilihanAyam ? `• *Pilihan Potongan:* ${orderPilihanAyam}\n` : '') +
        (currentItem.pilihanSambal ? `• *Pilihan Sambal:* ${orderPilihanSambal}\n` : '') +
        `• *Jumlah:* ${orderQty} porsi / unit\n` +
        `• *Opsi Pengiriman:* ${orderDeliveryType === 'kurir' ? 'Diantar Kurir Komunitas Warga (+Rp 5.000)' : 'Ambil Sendiri di Warung (Gratis)'}\n` +
        `• *Total Pembayaran:* Rp ${totalFoodPrice.toLocaleString('id-ID')}\n\n` +
        `Apakah pesanan ini bisa segera diproses?`;
    }
    window.open(`https://wa.me/${currentItem.waKontak}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleQuickWaAsk = () => {
    const text = encodeURIComponent(
      `Halo *${currentItem.tokoNama}*, saya ingin bertanya mengenai ketersediaan jadwal / stok produk *"${currentItem.nama}"* di SiDesKu.`
    );
    window.open(`https://wa.me/${currentItem.waKontak}?text=${text}`, '_blank');
  };

  // Other related items from same store or category
  const relatedItems = umkmList.filter(u => u.id !== currentItem.id).slice(0, 4);

  return (
    <div className="space-y-8 font-sans pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 animate-fade-in">

      {/* =========================================================================
          TOP BREADCRUMB & VERIFICATION BADGE
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
        <div className="flex items-center gap-2 text-slate-500">
          <Link
            to="/smart-city/umkm"
            className="hover:text-blue-600 transition-colors flex items-center gap-1.5 font-bold text-slate-700 bg-white px-3 py-1.5 rounded-full border border-slate-200/90 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Katalog UMKM</span>
          </Link>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="hidden sm:inline text-slate-400">Pasar UMKM</span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="font-extrabold text-slate-900 truncate max-w-xs">{currentItem.nama}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/80 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>UMKM Terverifikasi {currentItem.kelurahan || 'Sukamaju'}</span>
          </span>
        </div>
      </div>

      {/* =========================================================================
          MAIN DETAIL CONTENT CARD (Screen 2: Food / Screen 4: Jasa)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-2xs space-y-10">
        
        {currentItem.isJasa ? (
          /* =====================================================================
             SCREEN 4: JASA DETAIL VIEW (e.g. Bengkel AC Mas Agus)
             ===================================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left Column: Tech Hero, SOP, and Garansi */}
            <div className="lg:col-span-7 space-y-6">
              <div className="relative aspect-16/10 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
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
                  <span>★ {currentItem.rating.toFixed(1)} (112 panggilan selesai)</span>
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
                      <span className="text-slate-500 text-[11px] leading-relaxed">Pengujian manifold pressure pada jalur R32 / R410A serta pendeteksian dini sambungan flare pipa.</span>
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
                    onClick={handleSendWaOrder}
                    className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Pesan Teknisi via WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickWaAsk}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
                  >
                    Tanya Jadwal Dulu
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =====================================================================
             SCREEN 2: FOOD / RETAIL DETAIL VIEW (e.g. Paket Nasi Liwet)
             ===================================================================== */
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              {/* Left Column: Big Image Gallery & Seller Card */}
              <div className="lg:col-span-6 space-y-5">
                {/* Main Photo */}
                <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                  <img
                    src={currentItem.galeri?.[activeGalleryIndex] || currentItem.fotoUrl}
                    alt={currentItem.nama}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-slate-800 text-xs font-extrabold shadow-sm">
                    Wajar Dapur Mandiri
                  </div>
                </div>

                {/* Thumbnails */}
                {currentItem.galeri && currentItem.galeri.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {currentItem.galeri.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveGalleryIndex(idx)}
                        className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                          activeGalleryIndex === idx
                            ? 'border-blue-600 ring-2 ring-blue-100 scale-102'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Seller Profile Card */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black text-sm shrink-0">
                      {currentItem.tokoNama.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">{currentItem.tokoNama}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {currentItem.rtRw || 'RT 03 / RW 04'} {currentItem.kelurahan} • Radius 650m
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{currentItem.rating.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">({currentItem.terjualText || '42 ulasan'})</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleQuickWaAsk}
                      className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors shadow-2xs"
                    >
                      Tanya Penjual
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Custom Options & Order Box */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 font-black text-[10px] tracking-wider uppercase">
                      {currentItem.kategori}
                    </span>
                    <span className="text-slate-400 font-medium">• 42 Ulasan Warga</span>
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
                      <span className="text-[10px] text-slate-400">Paha Rempah</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {currentItem.pilihanAyam.map((opt) => (
                        <button
                          key={opt.nama}
                          type="button"
                          onClick={() => setOrderPilihanAyam(opt.nama)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            orderPilihanAyam === opt.nama
                              ? 'bg-blue-50 border-blue-500 font-bold text-blue-800 ring-2 ring-blue-100'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {opt.nama}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Food Options: Pilihan Sambal */}
                {currentItem.pilihanSambal && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800">Pilihan Sambal</span>
                      <span className="text-[10px] text-slate-400">Sambal Terasi Segar</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {currentItem.pilihanSambal.map((smb) => (
                        <button
                          key={smb}
                          type="button"
                          onClick={() => setOrderPilihanSambal(smb)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            orderPilihanSambal === smb
                              ? 'bg-blue-50 border-blue-500 font-bold text-blue-800 ring-2 ring-blue-100'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {smb}
                        </button>
                      ))}
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

                {/* Delivery Radio Options */}
                <div className="space-y-2">
                  <label
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      orderDeliveryType === 'kurir'
                        ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-100 font-bold'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="detail_order_delivery"
                        checked={orderDeliveryType === 'kurir'}
                        onChange={() => setOrderDeliveryType('kurir')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>Diantar Kurir Komunitas Warga</span>
                    </div>
                    <span className="text-blue-700 font-bold">Rp 5.000</span>
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
                      <span>Ambil Sendiri di Warung</span>
                    </div>
                    <span className="text-emerald-700 font-extrabold uppercase text-[10px]">GRATIS</span>
                  </label>
                </div>

                {/* Total & Action CTAs */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Total Pembayaran:</span>
                    <div>
                      <span className="text-2xl font-black text-blue-700">Rp {totalFoodPrice.toLocaleString('id-ID')}</span>
                      {orderDeliveryType === 'kurir' && (
                        <span className="text-[10px] text-slate-400 block text-right">(termasuk kurir Rp 5.000)</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleSendWaOrder}
                      className="py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Pesan via WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowQrisModal({
                        tokoNama: currentItem.tokoNama,
                        qrisUrl: currentItem.qrisUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SIDESKU_QRIS_DEMO',
                        nmid: currentItem.qrisNmid || 'ID10293847281',
                        nominal: totalFoodPrice
                      })}
                      className="py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Bayar QRIS</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Tabs Section (Deskripsi, Lokasi, Ulasan) */}
            <div className="pt-8 border-t border-slate-200 space-y-6">
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
                  Ulasan Warga (42)
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
                  <p className="text-[11px] text-blue-700">
                    Didukung kurir komunitas warga antar-RW siap mengantar langsung ke alamat rumah Anda atau dititipkan di pos keamanan RT.
                  </p>
                </div>
              )}

              {activeTabDetail === 'ulasan' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Pak Hendra (Warga RT 02)</span>
                      <span className="text-amber-500 font-bold">★ 5.0</span>
                    </div>
                    <p className="text-slate-600 text-xs">
                      Rasa masakan sangat lezat dan bumbu meresap sempurna. Pengiriman cepat oleh kurir warga sekitar dalam 15 menit sudah sampai ke rumah.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Produk Serupa dari Dapur Warga */}
            <div className="pt-8 border-t border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">PRODUK SERUPA DARI DAPUR WARGA</span>
                  <h3 className="text-lg font-black text-slate-900">Pilihan Kuliner Terdekat Lainnya</h3>
                </div>
                <Link to="/smart-city/umkm" className="text-xs font-bold text-blue-600 hover:underline">
                  Lihat Semua Katalog &gt;
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {relatedItems.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/smart-city/umkm/${rel.id}`}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-sm border border-slate-200/80 hover:border-blue-300 transition-all space-y-2 group"
                  >
                    <div className="aspect-4/3 rounded-xl overflow-hidden bg-slate-200">
                      <img src={rel.fotoUrl} alt={rel.nama} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="font-extrabold text-slate-900 text-xs truncate group-hover:text-blue-600 transition-colors">
                      {rel.nama}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-black text-blue-700">Rp {rel.harga.toLocaleString('id-ID')}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{rel.satuan || 'Porsi'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* =========================================================================
          QRIS POPUP MODAL (Shared in Detail Page)
          ========================================================================= */}
      {showQrisModal && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in font-sans">
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
