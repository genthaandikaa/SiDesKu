import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Home,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Check,
  ArrowLeft,
  Navigation,
  FileText,
  User,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  Heart
} from 'lucide-react';
import { HunianItem } from '../types';
import { smartCityApi } from '../api/smartCityApi';
import {
  getStoredKosList,
  KEDIRI_DEFAULT_COORDS,
  calculateDistanceKm,
  formatDistance
} from '../smartCityStorage';

export const KosDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [kosList, setKosList] = useState<HunianItem[]>([]);
  const [selectedKos, setSelectedKos] = useState<HunianItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userLocation] = useState<{ lat: number; lng: number }>(() => {
    try {
      const saved =
        localStorage.getItem('sidesku_user_smartcity_location') ||
        localStorage.getItem('nexora_user_smartcity_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.lat && parsed?.lng) return { lat: parsed.lat, lng: parsed.lng };
      }
    } catch {
      // ignore
    }
    return KEDIRI_DEFAULT_COORDS;
  });

  useEffect(() => {
    let isMounted = true;
    const loadData = () => {
      setIsLoading(true);
      const local = getStoredKosList();
      if (isMounted) {
        setKosList(local);
        const matched = local.find((k) => String(k.id) === String(id));
        if (matched) {
          setSelectedKos(matched);
        }
        setIsLoading(false);
      }
    };

    loadData();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = () => {
    if (!selectedKos) return;
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `${selectedKos.nama} - Info Kos Kediri`,
        text: `Cek detail kamar dan hunian ${selectedKos.nama} di ${selectedKos.alamat}`,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const getWaLink = (item: HunianItem) => {
    const rawWa = item.pemilikWa.replace(/\D/g, '');
    const cleanWa = rawWa.startsWith('0') ? `62${rawWa.substring(1)}` : rawWa.startsWith('62') ? rawWa : `62${rawWa}`;
    const message = encodeURIComponent(
      `Halo Bapak/Ibu ${item.pemilikNama}, saya tertarik dengan info sewa kos/hunian "${item.nama}" (Tipe: ${item.tipe}) di SiDesKu Kota Kediri. Apakah saat ini masih ada sisa ${item.sisaKamar} kamar kosong?`
    );
    return `https://wa.me/${cleanWa}?text=${message}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Memuat detail kamar & hunian...</p>
      </div>
    );
  }

  if (!selectedKos) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
          <Home className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Kamar / Hunian Tidak Ditemukan</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Hunian yang Anda cari mungkin sudah penuh atau telah dinonaktifkan oleh pemilik.
        </p>
        <button
          onClick={() => navigate('/smart-city/kos')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pencarian Kos</span>
        </button>
      </div>
    );
  }

  const distanceKm = calculateDistanceKm(
    userLocation.lat,
    userLocation.lng,
    selectedKos.lat,
    selectedKos.lng
  );

  const relatedKos = kosList
    .filter((k) => String(k.id) !== String(selectedKos.id))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-4 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium">
              <Home className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <Link to="/smart-city/kos" className="hover:text-blue-600 transition-colors font-medium">
              Kos & Hunian
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">
              {selectedKos.nama}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/smart-city/kos')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs shadow-2xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Katalog</span>
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Visuals & Main Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Primary Hero Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-slate-100 overflow-hidden group">
                <img
                  src={selectedKos.fotoUrl}
                  alt={selectedKos.nama}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-3.5 py-1 rounded-full bg-blue-600 text-white text-xs font-black shadow-md tracking-wide">
                    {selectedKos.tipe}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Terverifikasi Wilayah Kediri</span>
                  </span>
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSaved(!isSaved)}
                    className={`p-2.5 rounded-full backdrop-blur-md transition shadow-md ${
                      isSaved ? 'bg-rose-500 text-white' : 'bg-slate-900/60 hover:bg-slate-900 text-white'
                    }`}
                    title={isSaved ? 'Tersimpan' : 'Simpan'}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md transition shadow-md"
                    title="Bagikan Tautan"
                  >
                    {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 shadow-md">
                  <Navigation className="w-3.5 h-3.5 text-sky-400" />
                  <span>{formatDistance(distanceKm)} dari posisi Anda</span>
                </div>
              </div>

              {/* Title & Core Meta */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-2 border-b border-slate-100 pb-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Kamar Siap Huni
                    </span>
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                      Tersedia: {selectedKos.sisaKamar} Kamar Kosong
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight pt-1">
                    {selectedKos.nama}
                  </h1>

                  <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 pt-1">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{selectedKos.alamat}</span>
                  </div>
                </div>

                {/* Facilities Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Fasilitas Kamar & Lingkungan</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {selectedKos.fasilitas.map((f, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-700 font-medium hover:bg-white hover:border-blue-300 transition"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description & Rules */}
                {selectedKos.deskripsi && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Deskripsi & Ketentuan Hunian</span>
                    </h3>
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {selectedKos.deskripsi}
                    </div>
                  </div>
                )}

                {/* Map Coordinates Note */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-600 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Titik Lokasi Terdaftar: <strong>{selectedKos.lat.toFixed(4)}, {selectedKos.lng.toFixed(4)}</strong></span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${selectedKos.lat},${selectedKos.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Buka Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Rekomendasi Hunian Lainnya */}
            {relatedKos.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Hunian Lain di Sekitar Kota Kediri
                  </h3>
                  <Link
                    to="/smart-city/kos"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Lihat Semua
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedKos.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigate(`/smart-city/kos/${item.id}`)}
                      className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/10] bg-slate-100">
                        <img
                          src={item.fotoUrl}
                          alt={item.nama}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold">
                          {item.tipe}
                        </span>
                      </div>
                      <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 truncate">
                            {item.nama}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate">{item.alamat}</p>
                        </div>
                        <div className="font-black text-xs text-blue-600 pt-1">
                          Rp {item.harga.toLocaleString('id-ID')}
                          <span className="text-[10px] text-slate-400 font-normal"> /{item.periode}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Booking & Owner Card */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            {/* Price & Primary CTA Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Biaya Sewa Kamar:
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-blue-600 tracking-tight">
                    Rp {selectedKos.harga.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    /{selectedKos.periode}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600 font-bold mt-1">
                  Bebas biaya perantara • Langsung pemilik
                </p>
              </div>

              {/* Owner Info Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Pemilik Hunian
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 truncate">
                      {selectedKos.pemilikNama}
                    </div>
                    <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Warga Terdaftar Kediri
                    </div>
                  </div>
                </div>

                {selectedKos.qrisUrl && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-rose-600" />
                      <span>Pembayaran Digital QRIS</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Aktif
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <a
                  href={getWaLink(selectedKos)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-98"
                >
                  <Phone className="w-4 h-4" />
                  <span>Hubungi Pemilik via WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Tautan Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Bagikan Info Hunian</span>
                    </>
                  )}
                </button>
              </div>

              {/* Guarantees / Safety Notice */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 text-[11px] text-slate-500 space-y-1">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Jaminan Informasi Resmi</span>
                </div>
                <p className="leading-relaxed">
                  Data kos diverifikasi oleh pengurus lingkungan setempat untuk kenyamanan dan keamanan pencari hunian.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
