import React, { useState, useEffect, useRef } from 'react';
import {
  Store,
  ShoppingBag,
  Home,
  Briefcase,
  Plus,
  MapPin,
  QrCode,
  Truck,
  Banknote,
  Navigation,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Upload,
  Clock,
  Sparkles,
  Phone,
  FileText,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  User,
  Users,
  Camera,
  Image as ImageIcon,
  X,
  RotateCcw
} from 'lucide-react';
import { UmkmItem, HunianItem, LokerItem, LamaranLoker } from '../types';
import {
  getStoredUmkmList,
  saveStoredUmkmItem,
  deleteStoredUmkmItem,
  getStoredKosList,
  saveStoredKosItem,
  deleteStoredKosItem,
  getStoredLokerList,
  saveStoredLokerItem,
  deleteStoredLokerItem,
  getStoredLamaranList,
  KEDIRI_DEFAULT_COORDS
} from '../smartCityStorage';
import { detectSmartCityLocation } from '../services/locationService';
import { smartCityApi } from '../api/smartCityApi';
import { useAuth } from '@/shared/context/AuthContext';

const PublicUmkmCatalog = React.lazy(() => import('./UmkmPage').then((m) => ({ default: m.UmkmPage })));
const PublicKosCatalog = React.lazy(() => import('./KosPage').then((m) => ({ default: m.KosPage })));
const PublicLokerCatalog = React.lazy(() => import('./LokerPage').then((m) => ({ default: m.LokerPage })));

interface WargaSmartCityManagerProps {
  activeSection?: 'umkm' | 'kos' | 'loker';
  isCreateMode?: boolean;
  onNavigate?: (menuId: string) => void;
  initialTab?: 'umkm' | 'kos' | 'loker';
}

export const WargaSmartCityManager: React.FC<WargaSmartCityManagerProps> = ({
  activeSection = 'umkm',
  isCreateMode = false,
  onNavigate,
  initialTab = 'umkm',
}) => {
  const currentSection = activeSection || initialTab;
  const { user } = useAuth();

  // Lists (Specific to this authenticated citizen)
  const [umkmList, setUmkmList] = useState<UmkmItem[]>([]);
  const [kosList, setKosList] = useState<HunianItem[]>([]);
  const [lokerList, setLokerList] = useState<LokerItem[]>([]);
  const [lamaranList, setLamaranList] = useState<LamaranLoker[]>([]);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBrowsingOffers, setIsBrowsingOffers] = useState(false);

  useEffect(() => {
    setIsBrowsingOffers(false);
  }, [currentSection, isCreateMode]);

  useEffect(() => {
    // 1. Fetch authenticated citizen's personal UMKM products from backend
    smartCityApi.getMyUmkmList().then((res: UmkmItem[]) => {
      if (res && Array.isArray(res)) {
        setUmkmList(res);
      }
    }).catch(() => {
      setUmkmList([]);
    });

    // 2. Kos & Loker (Filter by citizen's name / ownership)
    const storedKos = getStoredKosList();
    const storedLoker = getStoredLokerList();

    if (user?.name) {
      const uName = user.name.toLowerCase();
      setKosList(storedKos.filter(k => k.pemilikNama && k.pemilikNama.toLowerCase().includes(uName)));
      setLokerList(storedLoker.filter(l => l.perusahaan && l.perusahaan.toLowerCase().includes(uName)));
    } else {
      setKosList([]);
      setLokerList([]);
    }

    setLamaranList(getStoredLamaranList());
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // =========================================================================
  // 1. UMKM FORM STATE
  // =========================================================================
  const [tokoNama, setTokoNama] = useState('');
  const [produkNama, setProdukNama] = useState('');
  const [produkKategori, setProdukKategori] = useState<any>('Kuliner & Kudapan');
  const [produkHarga, setProdukHarga] = useState<number>(20000);
  const [produkOngkir, setProdukOngkir] = useState<number>(0);
  const [produkSatuan, setProdukSatuan] = useState('Porsi');
  const [produkDeskripsi, setProdukDeskripsi] = useState('');
  const [produkFotoUrl, setProdukFotoUrl] = useState('');
  const [produkFotoNama, setProdukFotoNama] = useState('');
  const [isProcessingFoto, setIsProcessingFoto] = useState(false);
  const fileInputUmkmRef = useRef<HTMLInputElement>(null);
  const cameraInputUmkmRef = useRef<HTMLInputElement>(null);

  const [tokoAlamat, setTokoAlamat] = useState('');
  const [tokoWa, setTokoWa] = useState('');
  const [tokoLat, setTokoLat] = useState<number>(KEDIRI_DEFAULT_COORDS.lat);
  const [tokoLng, setTokoLng] = useState<number>(KEDIRI_DEFAULT_COORDS.lng);
  const [isDetectingUmkmGps, setIsDetectingUmkmGps] = useState(false);

  // Client-side image compressor for gallery/camera uploads
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleSelectProdukFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, WEBP).');
      return;
    }
    setIsProcessingFoto(true);
    try {
      const dataUrl = await compressImage(file);
      setProdukFotoUrl(dataUrl);
      setProdukFotoNama(file.name || 'Foto Kamera Produk');
      showToast('Foto produk berhasil dipilih!');
    } catch {
      alert('Gagal memproses foto. Silakan coba lagi.');
    } finally {
      setIsProcessingFoto(false);
      e.target.value = '';
    }
  };

  // Payment Options
  const [payQris, setPayQris] = useState(true);
  const [payQrisUrl, setPayQrisUrl] = useState('');
  const [payQrisNama, setPayQrisNama] = useState('');
  const [payCod, setPayCod] = useState(true);
  const [payDo, setPayDo] = useState(true);

  const handleDetectUmkmGps = async () => {
    setIsDetectingUmkmGps(true);
    try {
      const loc = await detectSmartCityLocation();
      setTokoLat(loc.lat);
      setTokoLng(loc.lng);
      showToast(`Titik koordinat toko berhasil dikunci (${loc.label})!`);
    } catch {
      showToast('Menggunakan koordinat default wilayah.');
    } finally {
      setIsDetectingUmkmGps(false);
    }
  };

  const handleSaveUmkm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produkNama.trim() || !tokoNama.trim() || !tokoWa.trim()) {
      alert('Mohon isi nama produk, nama toko, dan nomor WhatsApp.');
      return;
    }

    const newItem: UmkmItem = {
      id: `umkm-${Date.now()}`,
      nama: produkNama.trim(),
      tokoNama: tokoNama.trim(),
      kelurahan: 'Kel. Sukamaju',
      rtRw: 'RT 03 / RW 04',
      kategori: produkKategori,
      badgeTag: 'PRODUKSI SENDIRI',
      harga: Number(produkHarga) || 0,
      ongkir: Number(produkOngkir) || 0,
      satuan: produkSatuan || 'Porsi',
      deskripsi: produkDeskripsi.trim() || 'Produk segar olahan warga lokal tanpa bahan pengawet. Pengantaran langsung oleh penjual.',
      fotoUrl:
        produkFotoUrl.trim() ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      alamat: tokoAlamat.trim() || 'Kota Kediri',
      lat: tokoLat,
      lng: tokoLng,
      waKontak: tokoWa.replace(/\D/g, ''),
      qrisUrl: payQris ? payQrisUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SIDESKU_QRIS_DEFAULT' : undefined,
      qrisNama: payQrisNama || tokoNama,
      metodePembayaran: {
        qris: payQris,
        cod: payCod,
        do: payDo,
        transfer: true
      },
      statusToko: 'Buka',
      rating: 5.0,
      terjual: 0,
      createdAt: new Date().toISOString()
    };

    try {
      const created = await smartCityApi.createUmkmProduct(newItem);
      if (created) {
        setUmkmList(prev => [created, ...prev.filter(p => p.id !== created.id)]);
      } else {
        setUmkmList(prev => [newItem, ...prev.filter(p => p.id !== newItem.id)]);
      }
    } catch {
      setUmkmList(prev => [newItem, ...prev.filter(p => p.id !== newItem.id)]);
    }

    saveStoredUmkmItem(newItem);
    showToast('Toko & Produk berhasil disimpan dan langsung tayang di portal UMKM!');

    // Reset Form
    setProdukNama('');
    setProdukDeskripsi('');
    setProdukFotoUrl('');

    // Navigate back to list URL
    if (onNavigate) {
      onNavigate('smart_city_umkm');
    }
  };

  const handleDeleteUmkm = async (id: string) => {
    if (confirm('Hapus produk ini dari pasar UMKM?')) {
      await smartCityApi.deleteMyUmkm(id);
      deleteStoredUmkmItem(id);
      setUmkmList(prev => prev.filter(u => u.id !== id));
      showToast('Produk berhasil dihapus.');
    }
  };

  // =========================================================================
  // 2. KOS FORM STATE
  // =========================================================================
  const [kosNama, setKosNama] = useState('');
  const [kosTipe, setKosTipe] = useState<'Kos Putri' | 'Kos Putra' | 'Kos Campur' | 'Kontrakan Rumah'>('Kos Campur');
  const [kosHarga, setKosHarga] = useState<number>(650000);
  const [kosPeriode, setKosPeriode] = useState<'bulan' | 'tahun'>('bulan');
  const [kosAlamat, setKosAlamat] = useState('');
  const [kosDeskripsi, setKosDeskripsi] = useState('');
  const [kosLat, setKosLat] = useState<number>(KEDIRI_DEFAULT_COORDS.lat);
  const [kosLng, setKosLng] = useState<number>(KEDIRI_DEFAULT_COORDS.lng);
  const [kosSisaKamar, setKosSisaKamar] = useState<number>(2);
  const [kosPemilikNama, setKosPemilikNama] = useState('');
  const [kosPemilikWa, setKosPemilikWa] = useState('');
  const [kosFotoUrl, setKosFotoUrl] = useState('');
  const [kosFotoNama, setKosFotoNama] = useState('');
  const [isProcessingKosFoto, setIsProcessingKosFoto] = useState(false);
  const fileInputKosRef = useRef<HTMLInputElement>(null);
  const cameraInputKosRef = useRef<HTMLInputElement>(null);

  const handleSelectKosFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, WEBP).');
      return;
    }
    setIsProcessingKosFoto(true);
    try {
      const dataUrl = await compressImage(file);
      setKosFotoUrl(dataUrl);
      setKosFotoNama(file.name || 'Foto Kamera Hunian');
      showToast('Foto unit hunian berhasil dipilih!');
    } catch {
      alert('Gagal memproses foto. Silakan coba lagi.');
    } finally {
      setIsProcessingKosFoto(false);
      e.target.value = '';
    }
  };
  const [isDetectingKosGps, setIsDetectingKosGps] = useState(false);

  // Fasilitas checkboxes
  const [facWifi, setFacWifi] = useState(true);
  const [facAc, setFacAc] = useState(false);
  const [facKmDalam, setFacKmDalam] = useState(true);
  const [facKasur, setFacKasur] = useState(true);
  const [facParkir, setFacParkir] = useState(true);

  const handleDetectKosGps = async () => {
    setIsDetectingKosGps(true);
    try {
      const loc = await detectSmartCityLocation();
      setKosLat(loc.lat);
      setKosLng(loc.lng);
      showToast(`Titik koordinat hunian berhasil dikunci (${loc.label})!`);
    } catch {
      showToast('Menggunakan koordinat default wilayah.');
    } finally {
      setIsDetectingKosGps(false);
    }
  };

  const handleSaveKos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kosNama.trim() || !kosPemilikNama.trim() || !kosPemilikWa.trim()) {
      alert('Mohon isi nama hunian, nama pemilik, dan nomor WhatsApp.');
      return;
    }

    const fasList: string[] = [];
    if (facWifi) fasList.push('WiFi Cepat');
    if (facAc) fasList.push('AC Dingin');
    if (facKmDalam) fasList.push('Kamar Mandi Dalam');
    if (facKasur) fasList.push('Kasur Springbed');
    if (facParkir) fasList.push('Parkir Motor/Mobil Aman');

    const newKos: HunianItem = {
      id: `kos-${Date.now()}`,
      nama: kosNama.trim(),
      tipe: kosTipe,
      harga: Number(kosHarga),
      periode: kosPeriode,
      alamat: kosAlamat.trim() || 'Kota Kediri',
      deskripsi: kosDeskripsi.trim() || 'Hunian kos nyaman dan strategis di kawasan warga Kota Kediri.',
      lat: kosLat,
      lng: kosLng,
      sisaKamar: Number(kosSisaKamar),
      fasilitas: fasList,
      pemilikNama: kosPemilikNama.trim(),
      pemilikWa: kosPemilikWa.replace(/\D/g, ''),
      fotoUrl:
        kosFotoUrl.trim() ||
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
      terverifikasi: true,
      createdAt: new Date().toISOString()
    };

    const updated = saveStoredKosItem(newKos);
    setKosList(updated);
    showToast('Hunian kos berhasil disimpan dan langsung tayang di portal!');

    // Reset Form
    setKosNama('');
    setKosDeskripsi('');
    setKosFotoUrl('');
    setKosFotoNama('');

    // Navigate back to list URL
    if (onNavigate) {
      onNavigate('smart_city_kos');
    }
  };

  const handleDeleteKos = (id: string) => {
    if (confirm('Hapus hunian ini dari portal?')) {
      const updated = deleteStoredKosItem(id);
      setKosList(updated);
      showToast('Hunian berhasil dihapus.');
    }
  };

  // =========================================================================
  // 3. LOKER FORM STATE
  // =========================================================================
  const [lokerPosisi, setLokerPosisi] = useState('');
  const [lokerPerusahaan, setLokerPerusahaan] = useState('');
  const [lokerKategori, setLokerKategori] = useState<any>('F&B / Kuliner');
  const [lokerTipeKerja, setLokerTipeKerja] = useState<any>('Full-time');
  const [lokerGajiMin, setLokerGajiMin] = useState<number>(2000000);
  const [lokerGajiMax, setLokerGajiMax] = useState<number>(3000000);
  const [lokerLokasi, setLokerLokasi] = useState('');
  const [lokerPendidikan, setLokerPendidikan] = useState('SMA / SMK Sederajat');
  const [lokerPengalaman, setLokerPengalaman] = useState('Fresh Graduate / 1 Tahun');
  const [lokerSyaratCv, setLokerSyaratCv] = useState(true);
  const [lokerWaHrd, setLokerWaHrd] = useState('');
  const [lokerDescText, setLokerDescText] = useState('');

  const handleSaveLoker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lokerPosisi.trim() || !lokerPerusahaan.trim() || !lokerWaHrd.trim()) {
      alert('Mohon isi posisi pekerjaan, nama usaha/perusahaan, dan nomor kontak HRD.');
      return;
    }

    const descLines = lokerDescText
      ? lokerDescText.split('\n').filter((l) => l.trim().length > 0)
      : ['Disiplin, jujur, dan bertanggung jawab', 'Mampu bekerja sama dalam tim'];

    const newLoker: LokerItem = {
      id: `loker-${Date.now()}`,
      posisi: lokerPosisi.trim(),
      perusahaan: lokerPerusahaan.trim(),
      kategori: lokerKategori,
      tipeKerja: lokerTipeKerja,
      gajiMin: Number(lokerGajiMin),
      gajiMax: Number(lokerGajiMax),
      lokasi: lokerLokasi.trim() || 'Kediri',
      lat: KEDIRI_DEFAULT_COORDS.lat,
      lng: KEDIRI_DEFAULT_COORDS.lng,
      pendidikan: lokerPendidikan,
      pengalaman: lokerPengalaman,
      syaratCv: lokerSyaratCv,
      deskripsi: descLines,
      waHrd: lokerWaHrd.replace(/\D/g, ''),
      disnakerVerified: true,
      tanggalPosting: 'Hari ini',
      jumlahPelamar: 0,
      createdAt: new Date().toISOString()
    };

    const updated = saveStoredLokerItem(newLoker);
    setLokerList(updated);
    showToast('Lowongan pekerjaan berhasil diterbitkan di portal Loker!');

    // Reset Form
    setLokerPosisi('');
    setLokerDescText('');

    // Navigate back to list URL
    if (onNavigate) {
      onNavigate('smart_city_loker');
    }
  };

  const handleDeleteLoker = (id: string) => {
    if (confirm('Hapus lowongan ini dari portal?')) {
      const updated = deleteStoredLokerItem(id);
      setLokerList(updated);
      showToast('Lowongan berhasil dihapus.');
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-6xl mx-auto pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          MODE 1: DEDICATED CREATE FORM PAGE (SEPARATE URL & FULL BLUE UI)
          ========================================================================= */}
      {isCreateMode ? (
        <div className="space-y-6 animate-fade-in">
          {/* Top Breadcrumb Navigation */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => onNavigate?.(`smart_city_${currentSection}`)}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {currentSection === 'umkm' && 'Kembali ke Toko & UMKM Saya'}
                {currentSection === 'kos' && 'Kembali ke Kelola Kos & Hunian'}
                {currentSection === 'loker' && 'Kembali ke Bursa Kerja & Loker'}
              </span>
            </button>

            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Formulir Penambahan Data
            </span>
          </div>

          {/* FORM: UMKM */}
          {currentSection === 'umkm' && (
            <div className="bg-white rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md inline-block mb-1">
                  Katalog Pasar Warga
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">Tambah Produk / Dagangan UMKM Baru</h3>
              </div>

              <form onSubmit={handleSaveUmkm} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Toko / Usaha *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Warung Barokah Bu Dewi"
                      value={tokoNama}
                      onChange={(e) => setTokoNama(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Produk / Menu *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Nasi Liwet Ayam Rempah"
                      value={produkNama}
                      onChange={(e) => setProdukNama(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* GPS Pin Point */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-blue-950 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>Titik Lokasi Toko / Dapur Masak (GPS)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleDetectUmkmGps}
                      disabled={isDetectingUmkmGps}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isDetectingUmkmGps ? 'Mendeteksi...' : 'Kunci Titik GPS Sekarang'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-blue-900 leading-relaxed">
                    Koordinat saat ini: <strong className="font-mono">{tokoLat.toFixed(5)}, {tokoLng.toFixed(5)}</strong>. Koordinat ini digunakan oleh sistem untuk menghitung jarak real-time pembeli tetangga ke toko Anda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kategori Produk</label>
                    <select
                      value={produkKategori}
                      onChange={(e) => setProdukKategori(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    >
                      <option value="Kuliner & Kudapan">Kuliner & Kudapan</option>
                      <option value="Bahan Pokok & Sembako">Bahan Pokok & Sembako</option>
                      <option value="Kriya & Kerajinan">Kriya & Kerajinan</option>
                      <option value="Jasa Panggilan">Jasa Panggilan</option>
                      <option value="Fashion & Batik">Fashion & Batik</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp Usaha (Menerima Pesanan) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={tokoWa}
                      onChange={(e) => setTokoWa(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Harga Produk Satuan (Rp) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={produkHarga}
                      onChange={(e) => setProdukHarga(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Satuan Produk</label>
                    <input
                      type="text"
                      placeholder="Porsi / Pincuk / Pcs / Kg / Besek"
                      value={produkSatuan}
                      onChange={(e) => setProdukSatuan(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Biaya Pengantaran / Ongkir Ditentukan Penjual */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 text-xs">
                      BIAYA ONGKIR PENGANTARAN (DITENTUKAN OLEH ANDA SEBAGAI PENJUAL)
                    </label>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      Atur Mandiri
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={produkOngkir}
                        onChange={(e) => setProdukOngkir(Number(e.target.value) || 0)}
                        className="w-full pl-9 pr-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setProdukOngkir(0)}
                        className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          produkOngkir === 0
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Gratis (Rp 0)
                      </button>
                      <button
                        type="button"
                        onClick={() => setProdukOngkir(2000)}
                        className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          produkOngkir === 2000
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Rp 2.000
                      </button>
                      <button
                        type="button"
                        onClick={() => setProdukOngkir(5000)}
                        className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          produkOngkir === 5000
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Rp 5.000
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upload Foto Produk dari Galeri / Kamera */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>Foto Produk / Dagangan UMKM</span>
                    </span>
                    {produkFotoUrl ? (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Foto Siap Diunggah
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400">
                        Bisa langsung foto atau ambil dari galeri
                      </span>
                    )}
                  </label>

                  {/* Hidden file inputs: standard file picker & mobile direct camera */}
                  <input
                    ref={fileInputUmkmRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSelectProdukFoto}
                  />
                  <input
                    ref={cameraInputUmkmRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleSelectProdukFoto}
                  />

                  {produkFotoUrl ? (
                    <div className="rounded-2xl border-2 border-blue-200 bg-slate-50 overflow-hidden shadow-2xs">
                      <div className="relative aspect-video w-full max-h-72 bg-slate-900/10 flex items-center justify-center overflow-hidden">
                        <img
                          src={produkFotoUrl}
                          alt="Pratinjau Foto Dagangan"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Foto Terpilih</span>
                        </span>
                      </div>

                      <div className="p-3 bg-white border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-bold truncate max-w-xs">{produkFotoNama || 'Foto Dagangan Terpilih'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => cameraInputUmkmRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Foto Ulang Kamera</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputUmkmRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Ganti Galeri</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProdukFotoUrl('');
                              setProdukFotoNama('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/70 p-6 sm:p-7 text-center transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                        <Camera className="w-6 h-6" />
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-800 mb-1">
                        Pilih Foto dari Galeri atau Ambil Foto Kamera
                      </h4>

                      <div className="flex flex-wrap items-center justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => cameraInputUmkmRef.current?.click()}
                          disabled={isProcessingFoto}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Ambil Foto</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputUmkmRef.current?.click()}
                          disabled={isProcessingFoto}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                        >
                          <ImageIcon className="w-4 h-4 text-blue-600" />
                          <span>Pilih File</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deskripsi Produk Singkat</label>
                  <textarea
                    rows={2}
                    placeholder="Jelaskan rasa, racikan rempah, dan keunggulan produk Anda..."
                    value={produkDeskripsi}
                    onChange={(e) => setProdukDeskripsi(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                {/* Metode Pembayaran Diterima */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="block font-bold text-slate-700 mb-2">Pilihan Pengantaran & Pembayaran</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payCod}
                        onChange={(e) => setPayCod(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-bold text-slate-800 block">Diantar Langsung Penjual (COD)</span>
                        <span className="text-[10px] text-slate-400">Bayar tunai di tempat saat pesanan sampai</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payQris}
                        onChange={(e) => setPayQris(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="font-bold text-slate-800 block">QRIS Langsung Toko</span>
                        <span className="text-[10px] text-slate-400">Pembayaran digital langsung ke rekening penjual</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('smart_city_umkm')}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95"
                  >
                    Publikasikan Produk Sekarang
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* FORM: KOS */}
          {currentSection === 'kos' && (
            <div className="bg-white rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md inline-block mb-1">
                  Peta Hunian Spasial
                </span>
              </div>

              <form onSubmit={handleSaveKos} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Nama Kos / Hunian *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kos Graha Asri Putri Dekat Kampus"
                      value={kosNama}
                      onChange={(e) => setKosNama(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipe Hunian</label>
                    <select
                      value={kosTipe}
                      onChange={(e) => setKosTipe(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    >
                      <option value="Kos Campur">Kos Campur</option>
                      <option value="Kos Putri">Kos Putri</option>
                      <option value="Kos Putra">Kos Putra</option>
                      <option value="Kontrakan Rumah">Kontrakan Rumah</option>
                    </select>
                  </div>
                </div>

                {/* GPS Pin */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-blue-950 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>Titik Lokasi GPS Rumah Kos</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleDetectKosGps}
                      disabled={isDetectingKosGps}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isDetectingKosGps ? 'Mendeteksi...' : 'Kunci Titik GPS Sekarang'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-blue-900 leading-relaxed">
                    Koordinat saat ini: <strong className="font-mono">{kosLat.toFixed(5)}, {kosLng.toFixed(5)}</strong>. Koordinat ini digunakan peta interaktif agar pencari kos bisa langsung navigasi ke rumah Anda.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Harga Sewa (Rp) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={kosHarga}
                      onChange={(e) => setKosHarga(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Periode Sewa</label>
                    <select
                      value={kosPeriode}
                      onChange={(e) => setKosPeriode(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    >
                      <option value="bulan">Per Bulan</option>
                      <option value="tahun">Per Tahun</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sisa Kamar Kosong *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={kosSisaKamar}
                      onChange={(e) => setKosSisaKamar(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Pemilik / Pengelola *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ibu Hj. Mahmudah"
                      value={kosPemilikNama}
                      onChange={(e) => setKosPemilikNama(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">No. WhatsApp Pemilik *</label>
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={kosPemilikWa}
                      onChange={(e) => setKosPemilikWa(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Upload Foto Unit Kos dari Galeri / Kamera */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>Foto Kamar / Bangunan Kos</span>
                    </span>
                    {kosFotoUrl ? (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Foto Siap Diunggah
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400">
                        Bisa langsung foto atau ambil dari galeri
                      </span>
                    )}
                  </label>

                  {/* Hidden file inputs: standard file picker & mobile direct camera */}
                  <input
                    ref={fileInputKosRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSelectKosFoto}
                  />
                  <input
                    ref={cameraInputKosRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleSelectKosFoto}
                  />

                  {kosFotoUrl ? (
                    <div className="rounded-2xl border-2 border-blue-200 bg-slate-50 overflow-hidden shadow-2xs">
                      <div className="relative aspect-video w-full max-h-72 bg-slate-900/10 flex items-center justify-center overflow-hidden">
                        <img
                          src={kosFotoUrl}
                          alt="Pratinjau Foto Unit Kos"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Foto Terpilih</span>
                        </span>
                      </div>

                      <div className="p-3 bg-white border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-bold truncate max-w-xs">{kosFotoNama || 'Foto Hunian Terpilih'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => cameraInputKosRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Foto Ulang Kamera</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputKosRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Ganti Galeri</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setKosFotoUrl('');
                              setKosFotoNama('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/70 p-6 sm:p-7 text-center transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                        <Home className="w-6 h-6" />
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-800 mb-1">
                        Pilih Foto Kamar dari Galeri atau Ambil Foto Kamera
                      </h4>

                      <div className="flex flex-wrap items-center justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => cameraInputKosRef.current?.click()}
                          disabled={isProcessingKosFoto}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Ambil Foto</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputKosRef.current?.click()}
                          disabled={isProcessingKosFoto}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                        >
                          <ImageIcon className="w-4 h-4 text-blue-600" />
                          <span>Pilih File</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Deskripsi Kos & Aturan Tambahan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Deskripsi Hunian & Aturan Kos</span>
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">
                      Opsional tapi disarankan
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Jelaskan kenyamanan kos, aturan jam malam, akses kunci gerbang, dekat kampus apa, sistem listrik token/gratis, dan keunggulan hunian Anda..."
                    value={kosDeskripsi}
                    onChange={(e) => setKosDeskripsi(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 text-xs"
                  />
                </div>

                {/* Fasilitas Checkbox */}
                <div className="pt-2">
                  <label className="block font-bold text-slate-700 mb-2">Fasilitas Kamar & Rumah</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facWifi}
                        onChange={(e) => setFacWifi(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-slate-700">WiFi Cepat</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facAc}
                        onChange={(e) => setFacAc(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-slate-700">AC Dingin</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facKmDalam}
                        onChange={(e) => setFacKmDalam(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-slate-700">Kamar Mandi Dalam</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facKasur}
                        onChange={(e) => setFacKasur(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-slate-700">Kasur Springbed</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facParkir}
                        onChange={(e) => setFacParkir(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-slate-700">Parkir Aman</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('smart_city_kos')}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95"
                  >
                    Daftarkan Kos / Hunian Sekarang
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* FORM: LOKER */}
          {currentSection === 'loker' && (
            <div className="bg-white rounded-3xl border border-blue-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md inline-block mb-1">
                  Bursa Karir Digital
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">Pasang Lowongan Pekerjaan Baru</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pasang lowongan pekerjaan bagi warga Kediri dengan kualifikasi dan berkas CV digital.
                </p>
              </div>

              <form onSubmit={handleSaveLoker} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Posisi Lowongan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Barista & Kasir Cafe"
                      value={lokerPosisi}
                      onChange={(e) => setLokerPosisi(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Usaha / Perusahaan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kopi Titik Nol Kediri"
                      value={lokerPerusahaan}
                      onChange={(e) => setLokerPerusahaan(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kategori Pekerjaan</label>
                    <select
                      value={lokerKategori}
                      onChange={(e) => setLokerKategori(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    >
                      <option value="F&B / Kuliner">F&B / Kuliner</option>
                      <option value="Administrasi">Administrasi</option>
                      <option value="Teknik & Bengkel">Teknik & Bengkel</option>
                      <option value="IT & Digital">IT & Digital</option>
                      <option value="Pendidikan">Pendidikan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipe Pekerjaan</label>
                    <select
                      value={lokerTipeKerja}
                      onChange={(e) => setLokerTipeKerja(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Magang">Magang</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estimasi Gaji Min (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={lokerGajiMin}
                      onChange={(e) => setLokerGajiMin(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Estimasi Gaji Max (Rp)</label>
                    <input
                      type="number"
                      min="0"
                      value={lokerGajiMax}
                      onChange={(e) => setLokerGajiMax(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pendidikan Minimal</label>
                    <input
                      type="text"
                      placeholder="SMA / SMK / D3 / S1"
                      value={lokerPendidikan}
                      onChange={(e) => setLokerPendidikan(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pengalaman</label>
                    <input
                      type="text"
                      placeholder="Fresh Graduate / Minimal 1 Tahun"
                      value={lokerPengalaman}
                      onChange={(e) => setLokerPengalaman(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp HRD / Kontak Pelamar *</label>
                  <input
                    type="tel"
                    required
                    placeholder="081234567890"
                    value={lokerWaHrd}
                    onChange={(e) => setLokerWaHrd(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deskripsi & Kualifikasi Lowongan (1 baris per poin)</label>
                  <textarea
                    rows={3}
                    placeholder="• Usia maksimal 28 tahun&#10;• Memiliki ketertarikan di bidang hospitality&#10;• Ramah dan komunikatif"
                    value={lokerDescText}
                    onChange={(e) => setLokerDescText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('smart_city_loker')}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95"
                  >
                    Terbitkan Lowongan Sekarang
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : isBrowsingOffers ? (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-2xs">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">Smart City</p>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Penawaran dari Pengguna Lain</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsBrowsingOffers(false)}
              className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Kembali ke Kelola
            </button>
          </div>
          <React.Suspense fallback={<div className="rounded-2xl bg-white p-8 text-center text-xs text-slate-500">Memuat penawaran...</div>}>
            {currentSection === 'umkm' && <PublicUmkmCatalog />}
            {currentSection === 'kos' && <PublicKosCatalog />}
            {currentSection === 'loker' && <PublicLokerCatalog />}
          </React.Suspense>
        </div>
      ) : (
        /* =========================================================================
            MODE 2: LIST VIEW FOR THE ACTIVE SIDEBAR SECTION (NO INTERNAL TABS!)
            ========================================================================= */
        <div className="space-y-6 animate-fade-in">

          {/* Section 1: UMKM Store Catalog */}
          {currentSection === 'umkm' && (
            <div className="space-y-6">
              {/* Banner Top */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        Toko & UMKM Saya
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black">
                        {umkmList.length} Produk
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                      Kelola produk dagangan Anda. Seluruh produk aktif otomatis tayang dan dapat dipesan warga sekitar tanpa potongan komisi.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsBrowsingOffers(true)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Lihat Penawaran UMKM</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate?.('smart_city_umkm_tambah')}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Tambah Dagangan Baru</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Cards Grid or Empty State */}
              {umkmList.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-4 shadow-2xs">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                    <Store className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
                      Anda Belum Memiliki Dagangan UMKM
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Daftarkan toko dan produk kuliner, sembako, atau jasa Anda sekarang. Produk Anda akan otomatis tampil di katalog pasar warga dan dapat diorder tetangga sekitar tanpa potongan biaya.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('smart_city_umkm_tambah')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buka Toko & Tambah Dagangan Pertama</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {umkmList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                          <img
                            src={item.fotoUrl}
                            alt={item.nama}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-extrabold text-blue-700 shadow-2xs">
                            {item.kategori}
                          </span>
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="text-[11px] text-slate-500 font-bold">{item.tokoNama}</div>
                          <h4 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-1">{item.nama}</h4>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-base font-black text-blue-700">Rp {item.harga.toLocaleString('id-ID')}</span>
                            <span className="text-xs text-slate-400 font-medium">/{item.satuan || 'porsi'}</span>
                          </div>

                          {/* Ongkir Penjual Badge */}
                          <div className="pt-1 flex flex-wrap gap-1">
                            {Number(item.ongkir ?? 0) === 0 ? (
                              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                <Truck className="w-3 h-3 text-emerald-600" />
                                <span>Gratis Ongkir</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                <Truck className="w-3 h-3 text-slate-500" />
                                <span>Ongkir Rp {Number(item.ongkir).toLocaleString('id-ID')}</span>
                              </span>
                            )}
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                              ● Tayang di Landing
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => setIsBrowsingOffers(true)}
                          className="text-blue-600 hover:underline font-bold text-[11px] flex items-center gap-1"
                        >
                          <span>Lihat Penawaran</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUmkm(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Kos & Hunian */}
          {currentSection === 'kos' && (
            <div className="space-y-6">
              {/* Banner Top */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        Kelola Kos & Hunian
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black">
                        {kosList.length} Unit
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                      Atur unit kos dan kontrakan Anda agar warga dan mahasiswa dapat menemukan kamar kosong secara langsung.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsBrowsingOffers(true)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Lihat Penawaran Hunian</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate?.('smart_city_kos_tambah')}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Tambah Unit Kos Baru</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Kos Cards Grid or Empty State */}
              {kosList.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-4 shadow-2xs">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                    <Home className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
                      Anda Belum Memiliki Unit Kos atau Kontrakan Terdaftar
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('smart_city_kos_tambah')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Tambah Unit Kos Pertama</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kosList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                          <img
                            src={item.fotoUrl}
                            alt={item.nama}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-extrabold text-blue-700 shadow-2xs">
                            {item.tipe}
                          </span>
                        </div>

                        <div className="p-4 space-y-2">
                          <h4 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-1">{item.nama}</h4>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{item.alamat}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-base font-black text-blue-700">Rp {item.harga.toLocaleString('id-ID')}</span>
                            <span className="text-xs text-slate-400 font-medium">/{item.periode}</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1 text-[11px]">
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Sisa {item.sisaKamar} Kamar
                            </span>
                          </div>

                          {item.deskripsi && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed pt-1 border-t border-slate-100/80">
                              {item.deskripsi}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => setIsBrowsingOffers(true)}
                          className="text-blue-600 hover:underline font-bold text-[11px] flex items-center gap-1"
                        >
                          <span>Lihat Penawaran Hunian</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteKos(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Hapus Kos"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Loker & Bursa Kerja */}
          {currentSection === 'loker' && (
            <div className="space-y-6">
              {/* Banner Top */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        Bursa Kerja & Lowongan
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black">
                        {lokerList.length} Lowongan
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                      Pasang lowongan kerja dan kelola berkas pelamar kerja dari warga lokal secara langsung.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsBrowsingOffers(true)}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Lihat Lowongan Publik</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate?.('smart_city_loker_tambah')}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Pasang Lowongan Baru</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Loker List or Empty State */}
              {lokerList.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-4 shadow-2xs">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
                      Anda Belum Membuka Lowongan Kerja
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('smart_city_loker_tambah')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Pasang Lowongan Kerja Pertama</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {lokerList.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                            {item.kategori}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">•</span>
                          <span className="text-xs font-bold text-slate-600">{item.perusahaan}</span>
                        </div>
                        <h4 className="font-extrabold text-base text-slate-900">{item.posisi}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="font-bold text-emerald-700">Rp {item.gajiMin.toLocaleString('id-ID')} - Rp {item.gajiMax.toLocaleString('id-ID')}</span>
                          <span>•</span>
                          <span>{item.tipeKerja}</span>
                          <span>•</span>
                          <span>{item.pendidikan}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsBrowsingOffers(true)}
                          className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
                        >
                          Lihat Penawaran Lowongan
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLoker(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Lowongan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
