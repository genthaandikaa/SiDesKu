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
  RotateCcw,
  Lightbulb,
  Coins,
  Send,
  Save,
  Check,
  ShieldCheck,
  Building2,
  Sliders,
  DollarSign,
  Tag,
  Info,
  Wand2,
  GraduationCap,
  Award,
  FileCheck,
  HeartPulse,
  BadgeCheck
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
  KEDIRI_DEFAULT_COORDS,
  formatGajiJt
} from '../smartCityStorage';
import { detectSmartCityLocation } from '../services/locationService';
import { smartCityApi } from '../api/smartCityApi';
import { useAuth } from '@/shared/context/AuthContext';

const PublicUmkmCatalog = React.lazy(() => import('./UmkmPage').then((m) => ({ default: m.UmkmPage })));
const PublicKosCatalog = React.lazy(() => import('./KosPage').then((m) => ({ default: m.KosPage })));
const PublicLokerCatalog = React.lazy(() => import('./LokerPage').then((m) => ({ default: m.LokerPage })));

export const AVAILABLE_DOKUMEN_SYARAT = [
  {
    id: 'Curriculum Vitae (CV / Resume)',
    label: 'Curriculum Vitae (CV / Resume)',
    icon: FileText,
    badge: 'Populer'
  },
  {
    id: 'KTP / Identitas Kependudukan',
    label: 'KTP / Identitas Kependudukan',
    icon: ShieldCheck,
    badge: 'Prioritas Warga'
  },
  {
    id: 'Portofolio Karya / Hasil Kerja',
    label: 'Portofolio Karya / Hasil Kerja',
    icon: Briefcase,
    badge: null
  },
  {
    id: 'Ijazah & Transkrip Nilai',
    label: 'Ijazah & Transkrip Nilai',
    icon: GraduationCap,
    badge: null
  },
  {
    id: 'Sertifikat Keahlian / Pelatihan',
    label: 'Sertifikat Keahlian / Pelatihan',
    icon: Award,
    badge: null
  },
  {
    id: 'Surat Pengalaman Kerja / Paklaring',
    label: 'Surat Pengalaman Kerja / Paklaring',
    icon: FileCheck,
    badge: null
  },
  {
    id: 'Surat Keterangan Sehat',
    label: 'Surat Keterangan Sehat',
    icon: HeartPulse,
    badge: null
  },
  {
    id: 'SKCK Aktif',
    label: 'SKCK (Catatan Kepolisian)',
    icon: BadgeCheck,
    badge: null
  }
];

export const isMyLokerItem = (l: LokerItem, user: any): boolean => {
  if (!user) return false;
  // Exclude default public seeds from citizen personal list
  if (['loker-1', 'loker-2', 'loker-3', 'loker-4'].includes(l.id)) {
    return false;
  }
  if (l.userId && user.id && String(l.userId) === String(user.id)) return true;
  const userNik = user.nik || user.warga_profile?.nik;
  if (l.authorNik && userNik && l.authorNik === userNik) return true;
  const userName = (user.name || user.warga_profile?.nama_lengkap || '').toLowerCase();
  if (l.authorName && userName && l.authorName.toLowerCase() === userName) return true;
  if (l.id && l.id.startsWith('loker-citizen-')) return true;
  if (l.perusahaan && userName && l.perusahaan.toLowerCase().includes(userName)) return true;
  return false;
};

export const isMyKosItem = (k: HunianItem, user: any): boolean => {
  if (!user) return false;
  if (['kos-1', 'kos-2', 'kos-3', 'kos-4'].includes(k.id)) {
    return false;
  }
  if ((k as any).userId && user.id && String((k as any).userId) === String(user.id)) return true;
  const userNik = user.nik || user.warga_profile?.nik;
  if ((k as any).authorNik && userNik && (k as any).authorNik === userNik) return true;
  const userName = (user.name || user.warga_profile?.nama_lengkap || '').toLowerCase();
  if (k.pemilikNama && userName && k.pemilikNama.toLowerCase().includes(userName)) return true;
  if (k.id && k.id.startsWith('kos-citizen-')) return true;
  return false;
};

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

    // 2. Fetch authenticated citizen's personal Loker
    smartCityApi.getMyLokerList().then((res: LokerItem[]) => {
      if (res && Array.isArray(res) && res.length > 0) {
        setLokerList(res);
      } else {
        const storedLoker = getStoredLokerList();
        setLokerList(storedLoker.filter(l => isMyLokerItem(l, user)));
      }
    }).catch(() => {
      const storedLoker = getStoredLokerList();
      setLokerList(storedLoker.filter(l => isMyLokerItem(l, user)));
    });

    // 3. Fetch authenticated citizen's personal Kos
    const storedKos = getStoredKosList();
    setKosList(storedKos.filter(k => isMyKosItem(k, user)));

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
  const [lokerSyaratDokumen, setLokerSyaratDokumen] = useState<string[]>([
    'Curriculum Vitae (CV / Resume)',
    'KTP / Identitas Kependudukan'
  ]);
  const [lokerWaHrd, setLokerWaHrd] = useState('');
  const [lokerDescText, setLokerDescText] = useState('');

  const toggleSyaratDokumen = (docName: string) => {
    setLokerSyaratDokumen((prev) =>
      prev.includes(docName) ? prev.filter((d) => d !== docName) : [...prev, docName]
    );
  };

  const handleAutoFormatLokerDesc = () => {
    if (!lokerDescText.trim()) {
      setLokerDescText('• Usia maksimal 28 tahun\n• Memiliki ketertarikan di bidang hospitality & kopi\n• Ramah, komunikatif, berpenampilan rapi\n• Bersedia bekerja dalam pola shift malam & akhir pekan');
      showToast('Format kualifikasi otomatis diterapkan!');
      return;
    }
    const lines = lokerDescText.split('\n');
    const formatted = lines
      .map((l) => {
        const trimmed = l.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          return `• ${trimmed.replace(/^[•\-]\s*/, '')}`;
        }
        return `• ${trimmed}`;
      })
      .filter(Boolean)
      .join('\n');
    setLokerDescText(formatted);
    showToast('Format kualifikasi otomatis diterapkan!');
  };

  const handleSaveDraft = (type: 'umkm' | 'kos' | 'loker') => {
    showToast(`Draf formulir ${type.toUpperCase()} berhasil disimpan di perangkat.`);
  };

  const handleSaveLoker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lokerPosisi.trim() || !lokerPerusahaan.trim() || !lokerWaHrd.trim()) {
      alert('Mohon isi posisi pekerjaan, nama usaha/perusahaan, dan nomor kontak HRD.');
      return;
    }

    if (lokerSyaratDokumen.length === 0) {
      alert('Mohon pilih minimal 1 dokumen persyaratan yang wajib dikirim oleh pelamar.');
      return;
    }

    const descLines = lokerDescText
      ? lokerDescText.split('\n').filter((l) => l.trim().length > 0)
      : ['Disiplin, jujur, dan bertanggung jawab', 'Mampu bekerja sama dalam tim'];

    const newLoker: LokerItem = {
      id: `loker-citizen-${Date.now()}`,
      userId: user?.id,
      authorNik: (user as any)?.nik || (user as any)?.warga_profile?.nik,
      authorName: user?.name || (user as any)?.warga_profile?.nama_lengkap,
      posisi: lokerPosisi.trim(),
      perusahaan: lokerPerusahaan.trim(),
      kategori: lokerKategori,
      tipeKerja: lokerTipeKerja,
      gajiMin: Number(lokerGajiMin),
      gajiMax: Number(lokerGajiMax),
      lokasi: lokerLokasi.trim() || 'Kota Kediri',
      lat: KEDIRI_DEFAULT_COORDS.lat,
      lng: KEDIRI_DEFAULT_COORDS.lng,
      pendidikan: lokerPendidikan,
      pengalaman: lokerPengalaman,
      syaratCv: lokerSyaratDokumen.includes('Curriculum Vitae (CV / Resume)'),
      syaratDokumen: lokerSyaratDokumen,
      deskripsi: descLines,
      waHrd: lokerWaHrd.replace(/\D/g, ''),
      disnakerVerified: false,
      tanggalPosting: 'Hari ini',
      jumlahPelamar: 0,
      createdAt: new Date().toISOString()
    };

    // Save to backend and local storage
    try {
      await smartCityApi.createLoker(newLoker);
    } catch {}
    saveStoredLokerItem(newLoker);

    // Only update citizen's own list
    setLokerList((prev) => [newLoker, ...prev.filter((l) => l.id !== newLoker.id)]);
    showToast('Lowongan pekerjaan berhasil diterbitkan di portal Loker!');

    // Reset Form
    setLokerPosisi('');
    setLokerDescText('');

    // Navigate back to list URL
    if (onNavigate) {
      onNavigate('smart_city_loker');
    }
  };

  const handleDeleteLoker = async (id: string) => {
    if (confirm('Hapus lowongan ini dari portal?')) {
      try {
        await smartCityApi.deleteLoker(id);
      } catch {}
      deleteStoredLokerItem(id);
      setLokerList((prev) => prev.filter((l) => l.id !== id));
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

          {/* =========================================================================
              FORM 1: UMKM / DAGANGAN WARGA (Slicing Stitch a790ace838d441db9e53dc4a20da21bd)
              ========================================================================= */}
          {currentSection === 'umkm' && (
            <div className="space-y-6">
              {/* Breadcrumb & Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('beranda')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Beranda
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => onNavigate?.('smart_city_umkm')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Pasar UMKM Warga
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-blue-700 font-bold">+ Tambah Produk Baru</span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate?.('smart_city_umkm')}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Lapak Saya</span>
                </button>
              </div>

              {/* Hero Header & Tips Box */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pt-1">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Tambah Produk
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                    Promosikan kuliner, jajanan, atau produk lokal Anda agar terjangkau oleh tetangga sekitar Kelurahan.
                  </p>
                </div>
              </div>

              {/* Step Navigation Tabs Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">Info Pokok</p>
                    <p className="text-xs font-extrabold truncate">Nama & Kontak</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">2</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Harga & Ongkir</p>
                    <p className="text-xs font-extrabold truncate">Lokasi & Tarif</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">3</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Foto Dagangan</p>
                    <p className="text-xs font-extrabold truncate">Maks 4 Gambar</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">4</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pembayaran</p>
                    <p className="text-xs font-extrabold truncate">COD & QRIS</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveUmkm} className="space-y-6">
                {/* Stage 1: Informasi Pokok Produk & Toko */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Store className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">Informasi Pokok Produk & Toko</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Tahap 1 dari 4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Toko / Usaha *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Warung Barokah Bu Dewi"
                        value={tokoNama}
                        onChange={(e) => setTokoNama(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Produk / Menu *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Nasi Liwet Ayam Rempah Komplit"
                        value={produkNama}
                        onChange={(e) => setProdukNama(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kategori Dagangan *</label>
                      <select
                        value={produkKategori}
                        onChange={(e) => setProdukKategori(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                      >
                        <option value="Kuliner & Kudapan">Kuliner & Kudapan</option>
                        <option value="Bahan Pokok & Sembako">Bahan Pokok & Sembako</option>
                        <option value="Kriya & Kerajinan">Kriya & Kerajinan</option>
                        <option value="Jasa Panggilan">Jasa Panggilan</option>
                        <option value="Fashion & Batik">Fashion & Batik</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">Nomor WhatsApp Pemesanan *</label>
                      </div>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          required
                          placeholder="081234567890"
                          value={tokoWa}
                          onChange={(e) => setTokoWa(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inner Box: Titik Lokasi GPS */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-extrabold text-blue-950 flex items-center gap-2 text-xs">
                        <Navigation className="w-4 h-4 text-blue-600" />
                        <span>Titik Lokasi Toko / Dapur Masak (GPS)</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleDetectUmkmGps}
                        disabled={isDetectingUmkmGps}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{isDetectingUmkmGps ? 'Mendeteksi...' : 'Perbarui Titik GPS'}</span>
                      </button>
                    </div>
                    <div className="text-[11px] text-blue-800 font-mono bg-white/70 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>• Koordinat: {tokoLat.toFixed(5)}, {tokoLng.toFixed(5)} (Akurasi GPS Tinggi ±5m - Pocanan RT 01)</span>
                    </div>
                  </div>
                </div>

                {/* Stage 2: Harga Satuan & Pengiriman Lingkungan */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">Harga Satuan & Pengiriman Lingkungan</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Tahap 2 dari 4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Harga Produk Satuan (Rp) *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                        <input
                          type="number"
                          required
                          min="0"
                          value={produkHarga}
                          onChange={(e) => setProdukHarga(Number(e.target.value))}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 font-bold transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Satuan Takaran *</label>
                      <input
                        type="text"
                        placeholder="Porsi"
                        value={produkSatuan}
                        onChange={(e) => setProdukSatuan(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                      />
                    </div>
                  </div>

                  {/* Subcard: Ongkir */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block font-extrabold text-slate-800 text-[11px] uppercase tracking-wide">
                        BIAYA ONGKIR PENGANTARAN (DITENTUKAN OLEH ANDA)
                      </label>
                      <button
                        type="button"
                        onClick={() => showToast('Penyesuaian jarak mandiri aktif.')}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>Atur Jarak Mandiri</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Pilih tarif ramah tetangga atau atur gratis biaya antar untuk warga se-RT/RW.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setProdukOngkir(0)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          produkOngkir === 0
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {produkOngkir === 0 && <Check className="w-3.5 h-3.5" />}
                        <span>Gratis (Rp 0)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProdukOngkir(2000)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          produkOngkir === 2000
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>Rp 2.000</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setProdukOngkir(5000)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          produkOngkir === 5000
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>Rp 5.000</span>
                      </button>

                      <div className="relative min-w-[120px] max-w-[160px]">
                        <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">Rp</span>
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={produkOngkir}
                          onChange={(e) => setProdukOngkir(Number(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
                          placeholder="Nominal lain"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage 3: Foto Produk / Dagangan UMKM */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">Foto Produk / Dagangan UMKM</h3>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Maksimal 4 foto • JPG/PNG max 5MB
                    </span>
                  </div>

                  {/* Hidden inputs */}
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

                  {/* Dropzone Box */}
                  <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-6 sm:p-8 text-center space-y-3 transition">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">
                        Pilih Foto dari Galeri atau Ambil Foto Kamera HP
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Bisa langsung potret sajian hangat di dapur atau ambil dari galeri HP Anda.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => cameraInputUmkmRef.current?.click()}
                        disabled={isProcessingFoto}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition active:scale-95 disabled:opacity-50"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Ambil Foto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputUmkmRef.current?.click()}
                        disabled={isProcessingFoto}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer transition active:scale-95 disabled:opacity-50"
                      >
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        <span>Pilih File Galeri</span>
                      </button>
                    </div>
                  </div>

                  {/* 4-Slots Thumbnail Preview Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Slot 1: Primary Photo */}
                    <div className="aspect-square rounded-2xl border border-slate-200 bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center text-center group">
                      {produkFotoUrl ? (
                        <>
                          <img
                            src={produkFotoUrl}
                            alt="Foto 1 Utama"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black">
                            Utama
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setProdukFotoUrl('');
                              setProdukFotoNama('');
                            }}
                            className="absolute top-2 right-2 p-1 rounded-md bg-rose-600 text-white text-xs hover:bg-rose-700 transition cursor-pointer"
                            title="Hapus Foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="p-3 text-slate-400 space-y-1">
                          <ImageIcon className="w-6 h-6 mx-auto text-slate-300" />
                          <p className="text-[11px] font-bold text-slate-500">Foto 1</p>
                          <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Utama</span>
                        </div>
                      )}
                    </div>

                    {/* Slot 2 */}
                    <div
                      onClick={() => fileInputUmkmRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 bg-slate-50/60 flex flex-col items-center justify-center text-center cursor-pointer transition p-3 group"
                    >
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                      <p className="text-[11px] font-bold text-slate-500 mt-1">Foto 2</p>
                    </div>

                    {/* Slot 3 */}
                    <div
                      onClick={() => fileInputUmkmRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 bg-slate-50/60 flex flex-col items-center justify-center text-center cursor-pointer transition p-3 group"
                    >
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                      <p className="text-[11px] font-bold text-slate-500 mt-1">Foto 3</p>
                    </div>

                    {/* Slot 4 */}
                    <div
                      onClick={() => fileInputUmkmRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 bg-slate-50/60 flex flex-col items-center justify-center text-center cursor-pointer transition p-3 group"
                    >
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                      <p className="text-[11px] font-bold text-slate-500 mt-1">Foto 4</p>
                    </div>
                  </div>
                </div>

                {/* Stage 4: Deskripsi & Opsi Pembayaran Warga */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">Deskripsi & Opsi Pembayaran Warga</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Tahap 4 dari 4
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700 text-xs">Deskripsi Produk Singkat</label>
                      <span className="text-[11px] text-slate-400">
                        {produkDeskripsi.length} / 250 karakter
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={250}
                      placeholder="Nasi liwet gurih dengan lauk suwir ayam rempah, tempe orek, telur pindang & sambal korek khas Pocanan."
                      value={produkDeskripsi}
                      onChange={(e) => setProdukDeskripsi(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 text-xs transition"
                    />
                  </div>

                  {/* Pilihan Pengantaran & Pembayaran */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700 text-xs">
                      Pilihan Pengantaran & Pembayaran yang Didukung *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                        payCod ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50/40 border-slate-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={payCod}
                          onChange={(e) => setPayCod(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs">
                              Diantar Langsung Penjual (COD)
                            </span>
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              Terpopuler
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            Warga bayar tunai di tempat saat pesanan makanan/barang sampai ke pintu rumah.
                          </p>
                        </div>
                      </label>

                      <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                        payQris ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50/40 border-slate-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={payQris}
                          onChange={(e) => setPayQris(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs">
                              QRIS Langsung Toko
                            </span>
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                              Instan
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            Pembayaran digital instan, uang langsung masuk ke rekening bank / e-wallet UMKM Anda.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Footer Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => onNavigate?.('smart_city_umkm')}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveDraft('umkm')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-500" />
                      <span>Simpan sebagai Draf</span>
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publikasikan Produk Sekarang</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              FORM 2: KOS & HUNIAN SEWA (Slicing Stitch 9cc1b81a7ee84168be0d7f4b3a059eb1)
              ========================================================================= */}
          {currentSection === 'kos' && (
            <div className="space-y-6">
              {/* Breadcrumb & Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('beranda')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Beranda
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => onNavigate?.('smart_city_kos')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Kelola Kos & Hunian
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-blue-700 font-bold">+ Tambah Unit Kos Baru</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Status Hunian Siap Sewa</span>
                </div>
              </div>

              {/* Hero Header & Tips Box */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pt-1">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Tambah Unit Kos & Hunian Sewa Baru
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                    Daftarkan kamar kos, kontrakan, atau paviliun hunian Anda agar mudah ditemukan mahasiswa, pekerja, dan pencari hunian di Kota Kediri.
                  </p>
                </div>
              </div>

              {/* Step Navigation Tabs Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">Langkah 1</p>
                    <p className="text-xs font-extrabold truncate">Identitas Kos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">2</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Langkah 2</p>
                    <p className="text-xs font-extrabold truncate">Tarif & Kamar</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">3</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Langkah 3</p>
                    <p className="text-xs font-extrabold truncate">Fasilitas & Lokasi</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">4</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Langkah 4</p>
                    <p className="text-xs font-extrabold truncate">Foto & Aturan</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveKos} className="space-y-6">
                {/* Stage 1: Identitas & Tipe Hunian */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Home className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">Identitas & Tipe Hunian</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Tahap 1 dari 4
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Kos / Hunian *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kos Graha Asri Putri Dekat Kampus"
                        value={kosNama}
                        onChange={(e) => setKosNama(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tipe Hunian *</label>
                      <select
                        value={kosTipe}
                        onChange={(e) => setKosTipe(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                      >
                        <option value="Kos Putri">Kos Putri</option>
                        <option value="Kos Putra">Kos Putra</option>
                        <option value="Kos Campur">Kos Campur</option>
                        <option value="Kontrakan Rumah">Kontrakan Rumah / Paviliun</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Stage 2: Tarif & Ketersediaan Kamar */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">Tarif & Ketersediaan Kamar</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tarif Rp {formatGajiJt(kosHarga)} / {kosPeriode}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Harga Sewa (Rp) *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                        <input
                          type="number"
                          required
                          min="0"
                          value={kosHarga}
                          onChange={(e) => setKosHarga(Number(e.target.value))}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 font-bold transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Periode Sewa</label>
                      <select
                        value={kosPeriode}
                        onChange={(e) => setKosPeriode(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Stage 3: Fasilitas, Lokasi GPS & Kontak Pengelola */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">Fasilitas, Lokasi GPS & Kontak Pengelola</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Tahap 3 dari 4
                    </span>
                  </div>

                  {/* Fasilitas Checkbox Grid */}
                  <div>
                    <label className="block font-bold text-slate-700 text-xs mb-2.5">
                      Fasilitas Kamar & Rumah yang Tersedia
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs transition ${
                        facWifi ? 'bg-blue-50/60 border-blue-200 text-blue-950 font-bold' : 'bg-slate-50/50 border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={facWifi}
                          onChange={(e) => setFacWifi(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>WiFi Cepat</span>
                      </label>

                      <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs transition ${
                        facAc ? 'bg-blue-50/60 border-blue-200 text-blue-950 font-bold' : 'bg-slate-50/50 border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={facAc}
                          onChange={(e) => setFacAc(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>AC Dingin</span>
                      </label>

                      <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs transition ${
                        facKmDalam ? 'bg-blue-50/60 border-blue-200 text-blue-950 font-bold' : 'bg-slate-50/50 border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={facKmDalam}
                          onChange={(e) => setFacKmDalam(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Kamar Mandi Dalam</span>
                      </label>

                      <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs transition ${
                        facKasur ? 'bg-blue-50/60 border-blue-200 text-blue-950 font-bold' : 'bg-slate-50/50 border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={facKasur}
                          onChange={(e) => setFacKasur(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Kasur Springbed</span>
                      </label>

                      <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs transition ${
                        facParkir ? 'bg-blue-50/60 border-blue-200 text-blue-950 font-bold' : 'bg-slate-50/50 border-slate-200 text-slate-700'
                      }`}>
                        <input
                          type="checkbox"
                          checked={facParkir}
                          onChange={(e) => setFacParkir(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Parkir Motor/Mobil Aman</span>
                      </label>
                    </div>
                  </div>

                  {/* GPS Box */}
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-extrabold text-blue-950 flex items-center gap-2 text-xs">
                        <Navigation className="w-4 h-4 text-blue-600" />
                        <span>Titik Lokasi GPS Rumah Kos</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleDetectKosGps}
                        disabled={isDetectingKosGps}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{isDetectingKosGps ? 'Mendeteksi...' : 'Perbarui Titik GPS'}</span>
                      </button>
                    </div>
                    <div className="text-[11px] text-blue-800 font-mono bg-white/70 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>• Koordinat: {kosLat.toFixed(5)}, {kosLng.toFixed(5)} (Akurasi Spasial Tinggi)</span>
                    </div>
                  </div>

                  {/* Kontak & Pemilik */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nama Pemilik / Pengelola *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Ibu Hj. Mahmudah"
                        value={kosPemilikNama}
                        onChange={(e) => setKosPemilikNama(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">No. WhatsApp Pemilik *</label>
                      </div>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          required
                          placeholder="081234567890"
                          value={kosPemilikWa}
                          onChange={(e) => setKosPemilikWa(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage 4: Foto Unit & Ketentuan Hunian */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">Foto Kamar & Ketentuan Hunian</h3>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Maksimal 4 foto • JPG/PNG max 5MB
                    </span>
                  </div>

                  {/* Hidden inputs */}
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

                  {/* Dropzone Box */}
                  <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 p-6 sm:p-8 text-center space-y-3 transition">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                      <Home className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">
                        Pilih Foto Kamar dari Galeri atau Ambil Foto Kamera HP
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Sertakan foto sudut kamar tidur, kamar mandi, dan area parkir hunian.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => cameraInputKosRef.current?.click()}
                        disabled={isProcessingKosFoto}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition active:scale-95 disabled:opacity-50"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Ambil Foto</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputKosRef.current?.click()}
                        disabled={isProcessingKosFoto}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-2xs cursor-pointer transition active:scale-95 disabled:opacity-50"
                      >
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        <span>Pilih File Galeri</span>
                      </button>
                    </div>
                  </div>

                  {/* 4-Slots Thumbnail Preview Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="aspect-square rounded-2xl border border-slate-200 bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center text-center group">
                      {kosFotoUrl ? (
                        <>
                          <img
                            src={kosFotoUrl}
                            alt="Foto Hunian Utama"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-black">
                            Utama
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setKosFotoUrl('');
                              setKosFotoNama('');
                            }}
                            className="absolute top-2 right-2 p-1 rounded-md bg-rose-600 text-white text-xs hover:bg-rose-700 transition cursor-pointer"
                            title="Hapus Foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="p-3 text-slate-400 space-y-1">
                          <ImageIcon className="w-6 h-6 mx-auto text-slate-300" />
                          <p className="text-[11px] font-bold text-slate-500">Foto 1</p>
                          <span className="text-[9px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">Utama</span>
                        </div>
                      )}
                    </div>

                    <div
                      onClick={() => fileInputKosRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 bg-slate-50/60 flex flex-col items-center justify-center text-center cursor-pointer transition p-3 group"
                    >
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                      <p className="text-[11px] font-bold text-slate-500 mt-1">Foto 2</p>
                    </div>

                    <div
                      onClick={() => fileInputKosRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 bg-slate-50/60 flex flex-col items-center justify-center text-center cursor-pointer transition p-3 group"
                    >
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                      <p className="text-[11px] font-bold text-slate-500 mt-1">Foto 3</p>
                    </div>

                    <div
                      onClick={() => fileInputKosRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 bg-slate-50/60 flex flex-col items-center justify-center text-center cursor-pointer transition p-3 group"
                    >
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                      <p className="text-[11px] font-bold text-slate-500 mt-1">Foto 4</p>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-xs mb-1">
                      Deskripsi Hunian & Aturan Kos
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Jelaskan kenyamanan kos, aturan jam malam, akses kunci gerbang, dekat kampus apa, sistem listrik token/gratis, dan keunggulan hunian Anda..."
                      value={kosDeskripsi}
                      onChange={(e) => setKosDeskripsi(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 text-xs transition"
                    />
                  </div>
                </div>

                {/* Form Footer Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => onNavigate?.('smart_city_kos')}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveDraft('kos')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-500" />
                      <span>Simpan sebagai Draf</span>
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publikasikan Unit Hunian Sekarang</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* =========================================================================
              FORM 3: BURSA KERJA & LOKER (Slicing Stitch 5ccbe760a0b24f1b85e40b595c17047e)
              ========================================================================= */}
          {currentSection === 'loker' && (
            <div className="space-y-6">
              {/* Breadcrumb & Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <button
                    type="button"
                    onClick={() => onNavigate?.('beranda')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Beranda
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => onNavigate?.('smart_city_loker')}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Bursa Kerja & Loker
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-blue-700 font-bold">Pasang Lowongan Baru</span>
                </div>
              </div>

              {/* Hero Header & Verifikasi Warga Box */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
                <div className="space-y-2 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Pasang Lowongan Pekerjaan Baru
                  </h1>
                </div>

                {/* Right Card: Verifikasi Warga */}
                <div className="shrink-0 bg-white border border-blue-100 rounded-2xl p-4 shadow-2xs flex items-center gap-3.5 md:min-w-[210px]">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Verifikasi Warga</p>
                    <p className="text-[11px] text-slate-500">Akun Resmi RT/RW</p>
                  </div>
                </div>
              </div>

              {/* Step Navigation Tabs Bar (3 Steps) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">1</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">Langkah 1</p>
                    <p className="text-xs font-extrabold truncate">Identitas & Posisi</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">2</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Langkah 2</p>
                    <p className="text-xs font-extrabold truncate">Kompensasi & Syarat</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">3</div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Langkah 3</p>
                    <p className="text-xs font-extrabold truncate">Kontak & Kualifikasi</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveLoker} className="space-y-6">
                {/* Stage 1: Identitas & Posisi Kerja */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">Identitas & Posisi Kerja</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Tahap 1 dari 3
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Posisi Lowongan *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Barista & Kasir Cafe"
                        value={lokerPosisi}
                        onChange={(e) => setLokerPosisi(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Kategori Pekerjaan *</label>
                      <select
                        value={lokerKategori}
                        onChange={(e) => setLokerKategori(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                      >
                        <option value="F&B / Kuliner">F&B / Kuliner</option>
                        <option value="Administrasi">Administrasi & Office</option>
                        <option value="Teknik & Bengkel">Teknik, Mekanik & Bengkel</option>
                        <option value="Gudang & Logistik">Gudang & Logistik</option>
                        <option value="IT & Digital">IT, Komputer & Digital</option>
                        <option value="Pendidikan">Pendidikan & Pengajaran</option>
                        <option value="Retail & Toko">Retail & Pelayanan Toko</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Tipe Pekerjaan *</label>
                      <select
                        value={lokerTipeKerja}
                        onChange={(e) => setLokerTipeKerja(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                      >
                        <option value="Penuh Waktu (Full-time)">Penuh Waktu (Full-time)</option>
                        <option value="Paruh Waktu (Part-time)">Paruh Waktu (Part-time)</option>
                        <option value="Shift Fleksibel">Shift Fleksibel</option>
                        <option value="Freelance / Jasa Mandiri">Freelance / Jasa Mandiri</option>
                        <option value="Magang">Magang / Prakerin</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Stage 2: Kompensasi & Persyaratan */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Coins className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">Kompensasi & Persyaratan</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Estimasi {formatGajiJt(lokerGajiMin, lokerGajiMax)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Estimasi Gaji Min (Rp / bulan)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                        <input
                          type="number"
                          min="0"
                          value={lokerGajiMin}
                          onChange={(e) => setLokerGajiMin(Number(e.target.value))}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 font-bold transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Estimasi Gaji Max (Rp / bulan)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                        <input
                          type="number"
                          min="0"
                          value={lokerGajiMax}
                          onChange={(e) => setLokerGajiMax(Number(e.target.value))}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 font-bold transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pendidikan Minimal</label>
                      <select
                        value={lokerPendidikan}
                        onChange={(e) => setLokerPendidikan(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                      >
                        <option value="Semua Jenjang / Bebas">Semua Jenjang / Bebas</option>
                        <option value="SMA / SMK Sederajat">SMA / SMK Sederajat</option>
                        <option value="Diploma (D3)">Diploma (D3)</option>
                        <option value="Sarjana (S1)">Sarjana (S1)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pengalaman Kerja Minimal</label>
                      <select
                        value={lokerPengalaman}
                        onChange={(e) => setLokerPengalaman(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 transition"
                      >
                        <option value="Fresh Graduate / Kurang dari 1 Tahun">Fresh Graduate / Kurang dari 1 Tahun</option>
                        <option value="1 - 2 Tahun">1 - 2 Tahun</option>
                        <option value="3+ Tahun">3+ Tahun</option>
                        <option value="Tidak Memerlukan Pengalaman">Tidak Memerlukan Pengalaman</option>
                      </select>
                    </div>

                    {/* Dokumen & Berkas yang Wajib Dikirim Pelamar */}
                    <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="block font-extrabold text-slate-800 text-xs">
                            Dokumen Persyaratan yang Wajib Dikirim Pelamar *
                          </label>
                        </div>
                        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 shrink-0">
                          {lokerSyaratDokumen.length} Berkas Dipilih
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {AVAILABLE_DOKUMEN_SYARAT.map((dok) => {
                          const isSelected = lokerSyaratDokumen.includes(dok.id);
                          const IconComp = dok.icon;
                          return (
                            <button
                              key={dok.id}
                              type="button"
                              onClick={() => toggleSyaratDokumen(dok.id)}
                              className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-50/70 border-blue-400 ring-1 ring-blue-500/20'
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                                  <span className={`font-bold text-xs ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                                    {dok.label}
                                  </span>
                                  {dok.badge && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                      {dok.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                                  {dok.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage 3: Kontak Pengelola & Kualifikasi */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Phone className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-900">Kontak Pengelola & Kualifikasi</h3>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Tahap 3 dari 3
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        No. WhatsApp HRD / Kontak Pelamar *
                      </label>
                      <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:bg-white focus-within:border-blue-500 transition">
                        <span className="px-3.5 py-2.5 bg-slate-100 text-slate-600 font-bold border-r border-slate-200 text-xs">
                          +62
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="81234567890"
                          value={lokerWaHrd.replace(/^(\+62|62|0)/, '')}
                          onChange={(e) => setLokerWaHrd(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-transparent focus:outline-none text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">
                          Deskripsi & Kualifikasi Lowongan (1 baris per poin) *
                        </label>
                        <button
                          type="button"
                          onClick={handleAutoFormatLokerDesc}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>Format Otomatis</span>
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        required
                        placeholder="• Usia maksimal 28 tahun&#10;• Memiliki ketertarikan di bidang hospitality & kopi&#10;• Ramah, komunikatif, berpenampilan rapi&#10;• Bersedia bekerja dalam pola shift malam & akhir pekan"
                        value={lokerDescText}
                        onChange={(e) => setLokerDescText(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800 font-mono text-xs transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Footer Action Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => onNavigate?.('smart_city_loker')}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 transition cursor-pointer active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Terbitkan Lowongan Sekarang</span>
                    </button>
                  </div>
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
                      <span>Tambah Produk / Dagangan Baru</span>
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
                      <span>Tambah Unit Kos Baru</span>
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
                      <span>Pasang Lowongan Baru</span>
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
                          <span className="font-bold text-blue-700">{formatGajiJt(item.gajiMin, item.gajiMax)}</span>
                          <span>•</span>
                          <span>{item.tipeKerja}</span>
                          <span>•</span>
                          <span>{item.pendidikan}</span>
                        </div>
                        {item.syaratDokumen && item.syaratDokumen.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] text-slate-400 font-bold">Syarat Berkas:</span>
                            {item.syaratDokumen.map((dok, dIdx) => (
                              <span
                                key={dIdx}
                                className="text-[10px] font-semibold text-blue-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 flex items-center gap-1"
                              >
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                {dok}
                              </span>
                            ))}
                          </div>
                        )}
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
