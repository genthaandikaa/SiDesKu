import React, { useState, useEffect } from 'react';
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
  AlertCircle
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

interface WargaSmartCityManagerProps {
  initialTab?: 'umkm' | 'kos' | 'loker';
}

export const WargaSmartCityManager: React.FC<WargaSmartCityManagerProps> = ({ initialTab = 'umkm' }) => {
  const [activeTab, setActiveTab] = useState<'umkm' | 'kos' | 'loker'>(initialTab);

  // Lists
  const [umkmList, setUmkmList] = useState<UmkmItem[]>([]);
  const [kosList, setKosList] = useState<HunianItem[]>([]);
  const [lokerList, setLokerList] = useState<LokerItem[]>([]);
  const [lamaranList, setLamaranList] = useState<LamaranLoker[]>([]);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setUmkmList(getStoredUmkmList());
    setKosList(getStoredKosList());
    setLokerList(getStoredLokerList());
    setLamaranList(getStoredLamaranList());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // =========================================================================
  // 1. UMKM FORM STATE
  // =========================================================================
  const [showAddUmkm, setShowAddUmkm] = useState(false);
  const [tokoNama, setTokoNama] = useState('');
  const [produkNama, setProdukNama] = useState('');
  const [produkKategori, setProdukKategori] = useState<any>('Kuliner');
  const [produkHarga, setProdukHarga] = useState<number>(20000);
  const [produkOngkir, setProdukOngkir] = useState<number>(0);
  const [produkSatuan, setProdukSatuan] = useState('porsi');
  const [produkDeskripsi, setProdukDeskripsi] = useState('');
  const [produkFotoUrl, setProdukFotoUrl] = useState('');
  const [tokoAlamat, setTokoAlamat] = useState('');
  const [tokoWa, setTokoWa] = useState('');
  const [tokoLat, setTokoLat] = useState<number>(KEDIRI_DEFAULT_COORDS.lat);
  const [tokoLng, setTokoLng] = useState<number>(KEDIRI_DEFAULT_COORDS.lng);
  const [isDetectingUmkmGps, setIsDetectingUmkmGps] = useState(false);

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

  const handleSaveUmkm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produkNama || !tokoNama || !tokoWa) {
      alert('Mohon isi nama produk, nama toko, dan nomor WhatsApp.');
      return;
    }

    const newItem: UmkmItem = {
      id: `umkm-${Date.now()}`,
      nama: produkNama,
      tokoNama,
      kategori: produkKategori,
      harga: Number(produkHarga),
      ongkir: Number(produkOngkir) || 0,
      satuan: produkSatuan || 'pcs',
      deskripsi: produkDeskripsi || 'Produk UMKM lokal warga Kediri.',
      fotoUrl:
        produkFotoUrl ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      alamat: tokoAlamat || 'Kota Kediri',
      lat: tokoLat,
      lng: tokoLng,
      waKontak: tokoWa.replace(/\D/g, ''),
      qrisUrl: payQris ? payQrisUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=NEXORA_QRIS_DEFAULT' : undefined,
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

    const updated = saveStoredUmkmItem(newItem);
    setUmkmList(updated);
    setShowAddUmkm(false);
    showToast('Toko & Produk berhasil disimpan dan langsung tayang di portal UMKM!');

    // Reset Form
    setProdukNama('');
    setProdukDeskripsi('');
    setProdukFotoUrl('');
  };

  const handleDeleteUmkm = (id: string) => {
    if (confirm('Hapus produk ini dari pasar UMKM?')) {
      const updated = deleteStoredUmkmItem(id);
      setUmkmList(updated);
      showToast('Produk berhasil dihapus.');
    }
  };

  // =========================================================================
  // 2. KOS FORM STATE
  // =========================================================================
  const [showAddKos, setShowAddKos] = useState(false);
  const [kosNama, setKosNama] = useState('');
  const [kosTipe, setKosTipe] = useState<any>('Kos Putri');
  const [kosHarga, setKosHarga] = useState<number>(650000);
  const [kosPeriode, setKosPeriode] = useState<'bulan' | 'tahun'>('bulan');
  const [kosAlamat, setKosAlamat] = useState('');
  const [kosSisaKamar, setKosSisaKamar] = useState<number>(3);
  const [kosPemilikNama, setKosPemilikNama] = useState('');
  const [kosPemilikWa, setKosPemilikWa] = useState('');
  const [kosFotoUrl, setKosFotoUrl] = useState('');
  const [kosLat, setKosLat] = useState<number>(KEDIRI_DEFAULT_COORDS.lat);
  const [kosLng, setKosLng] = useState<number>(KEDIRI_DEFAULT_COORDS.lng);
  const [isDetectingKosGps, setIsDetectingKosGps] = useState(false);

  // Facilities Checkbox
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
    if (!kosNama || !kosPemilikNama || !kosPemilikWa) {
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
      nama: kosNama,
      tipe: kosTipe,
      harga: Number(kosHarga),
      periode: kosPeriode,
      alamat: kosAlamat || 'Kota Kediri',
      lat: kosLat,
      lng: kosLng,
      sisaKamar: Number(kosSisaKamar),
      fasilitas: fasList,
      pemilikNama: kosPemilikNama,
      pemilikWa: kosPemilikWa.replace(/\D/g, ''),
      fotoUrl:
        kosFotoUrl ||
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
      terverifikasi: true,
      createdAt: new Date().toISOString()
    };

    const updated = saveStoredKosItem(newKos);
    setKosList(updated);
    setShowAddKos(false);
    showToast('Hunian kos berhasil disimpan dan langsung tayang di portal!');

    // Reset Form
    setKosNama('');
    setKosFotoUrl('');
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
  const [showAddLoker, setShowAddLoker] = useState(false);
  const [lokerPosisi, setLokerPosisi] = useState('');
  const [lokerPerusahaan, setLokerPerusahaan] = useState('');
  const [lokerKategori, setLokerKategori] = useState<any>('Administrasi');
  const [lokerTipeKerja, setLokerTipeKerja] = useState<any>('Full-time');
  const [lokerGajiMin, setLokerGajiMin] = useState<number>(2000000);
  const [lokerGajiMax, setLokerGajiMax] = useState<number>(3000000);
  const [lokerLokasi, setLokerLokasi] = useState('');
  const [lokerPendidikan, setLokerPendidikan] = useState('SMA / SMK Sederajat');
  const [lokerPengalaman, setLokerPengalaman] = useState('Terbuka Fresh Graduate');
  const [lokerSyaratCv, setLokerSyaratCv] = useState(true);
  const [lokerDescText, setLokerDescText] = useState('');
  const [lokerWaHrd, setLokerWaHrd] = useState('');

  const handleSaveLoker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lokerPosisi || !lokerPerusahaan || !lokerWaHrd) {
      alert('Mohon isi posisi pekerjaan, nama perusahaan, dan nomor WA HRD.');
      return;
    }

    const descLines = lokerDescText
      ? lokerDescText.split('\n').filter((l) => l.trim().length > 0)
      : ['Bertanggung jawab pada tugas harian sesuai arahan pimpinan usaha.', 'Disiplin, jujur, dan berintegritas tinggi.'];

    const newLoker: LokerItem = {
      id: `loker-${Date.now()}`,
      posisi: lokerPosisi,
      perusahaan: lokerPerusahaan,
      kategori: lokerKategori,
      tipeKerja: lokerTipeKerja,
      gajiMin: Number(lokerGajiMin),
      gajiMax: Number(lokerGajiMax),
      lokasi: lokerLokasi || 'Kediri',
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
    setShowAddLoker(false);
    showToast('Lowongan pekerjaan berhasil diterbitkan di portal Loker!');

    // Reset Form
    setLokerPosisi('');
    setLokerDescText('');
  };

  const handleDeleteLoker = (id: string) => {
    if (confirm('Hapus lowongan ini dari portal?')) {
      const updated = deleteStoredLokerItem(id);
      setLokerList(updated);
      showToast('Lowongan berhasil dihapus.');
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Pusat Manajemen Usaha, Kos & Loker
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Kelola toko UMKM Anda, atur sewa kos, atau pasang lowongan kerja. Setiap perubahan akan otomatis tayang dan dapat diakses seluruh warga melalui landing page Smart City.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/smart-city"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lihat Halaman Publik</span>
            </a>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('umkm')}
            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'umkm'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Toko UMKM Saya ({umkmList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kos')}
            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'kos'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Kelola Kos & Hunian ({kosList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('loker')}
            className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'loker'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Lowongan Kerja ({lokerList.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: UMKM MANAGER
          ========================================================================= */}
      {activeTab === 'umkm' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-900">Katalog Produk UMKM Anda</h3>
            <button
              type="button"
              onClick={() => setShowAddUmkm(!showAddUmkm)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddUmkm ? 'Tutup Form' : 'Tambah Dagangan Baru'}</span>
            </button>
          </div>

          {/* Form Tambah UMKM */}
          {showAddUmkm && (
            <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-sm space-y-5 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-base text-slate-900">Pengaturan Toko & Upload Dagangan</h4>
                <p className="text-xs text-slate-500">Lengkapi informasi toko, aktifkan pelacakan koordinat GPS, dan atur opsi pembayaran.</p>
              </div>

              <form onSubmit={handleSaveUmkm} className="space-y-4 text-xs">
                
                {/* Store Profile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Toko / Usaha *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pusat Oleh-Oleh Bu Siti Doko"
                      value={tokoNama}
                      onChange={(e) => setTokoNama(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp Pesanan *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 08123456789"
                      value={tokoWa}
                      onChange={(e) => setTokoWa(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Location GPS Mandatory Section */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      Titik Lokasi Toko (Wajib Aktif)
                    </span>
                    <button
                      type="button"
                      onClick={handleDetectUmkmGps}
                      disabled={isDetectingUmkmGps}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Navigation className={`w-3.5 h-3.5 ${isDetectingUmkmGps ? 'animate-spin' : ''}`} />
                      <span>{isDetectingUmkmGps ? 'Mengunci GPS...' : 'Kunci GPS Toko Sekarang'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Sistem akan menggunakan koordinat ini untuk menghitung jarak real-time pembeli (1 km, 5 km, 10 km) di landing page.
                  </p>
                  <div className="text-[11px] font-mono text-slate-600 pt-1">
                    Koordinat Terkunci: <strong>{tokoLat.toFixed(5)}</strong>, <strong>{tokoLng.toFixed(5)}</strong>
                  </div>
                </div>

                {/* Product Detail */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Nama Barang Dagangan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Tahu Kuning & Stik Tahu Gurih Khas Kediri"
                      value={produkNama}
                      onChange={(e) => setProdukNama(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kategori Produk</label>
                    <select
                      value={produkKategori}
                      onChange={(e) => setProdukKategori(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
                    >
                      <option value="Kuliner">Kuliner</option>
                      <option value="Pertanian">Pertanian</option>
                      <option value="Kerajinan">Kerajinan</option>
                      <option value="Jasa & Servis">Jasa & Servis</option>
                      <option value="Sembako">Sembako</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Harga Produk (Rp) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={produkHarga}
                      onChange={(e) => setProdukHarga(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Satuan</label>
                    <input
                      type="text"
                      placeholder="porsi / besek / kg / pcs"
                      value={produkSatuan}
                      onChange={(e) => setProdukSatuan(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Biaya Pengantaran / Ongkir Ditentukan Penjual */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 text-xs">
                      Biaya Ongkir Pengantaran Langsung (Rp)
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Diatur Penjual
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={produkOngkir}
                        onChange={(e) => setProdukOngkir(Number(e.target.value) || 0)}
                        className="w-full pl-8 pr-3 py-2 text-xs font-bold rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-amber-500"
                        placeholder="0"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setProdukOngkir(0)}
                      className={`px-2.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        produkOngkir === 0
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Gratis (Rp 0)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProdukOngkir(2000)}
                      className={`px-2.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        produkOngkir === 2000
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      Rp 2.000
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Bebas atur tarif kirim sendiri, atau Rp 0 jika gratis ongkir diantar ke tetangga.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Foto Produk</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... (atau biarkan kosong untuk foto standar)"
                    value={produkFotoUrl}
                    onChange={(e) => setProdukFotoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deskripsi Produk Singkat</label>
                  <textarea
                    rows={2}
                    placeholder="Jelaskan keunggulan dan rasa produk dagangan Anda..."
                    value={produkDeskripsi}
                    onChange={(e) => setProdukDeskripsi(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-800"
                  />
                </div>

                {/* Payment Options (QRIS, COD, DO) */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-800">Opsi Pembayaran & Layanan Antar:</div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payQris}
                        onChange={(e) => setPayQris(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Terima QRIS</span>
                    </label>

                    <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payCod}
                        onChange={(e) => setPayCod(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Bisa Bayar di Tempat (COD)</span>
                    </label>

                    <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payDo}
                        onChange={(e) => setPayDo(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Bisa Delivery Order (DO)</span>
                    </label>
                  </div>

                  {payQris && (
                    <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Merchant QRIS</label>
                        <input
                          type="text"
                          placeholder="Contoh: QRIS TOKO BU SITI"
                          value={payQrisNama}
                          onChange={(e) => setPayQrisNama(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">URL Barcode QRIS</label>
                        <input
                          type="url"
                          placeholder="Link gambar barcode QRIS Anda"
                          value={payQrisUrl}
                          onChange={(e) => setPayQrisUrl(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddUmkm(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md cursor-pointer"
                  >
                    Simpan & Terbitkan ke Landing
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List UMKM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {umkmList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.fotoUrl}
                    alt={item.nama}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      {item.kategori}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 truncate mt-1">{item.nama}</h4>
                    <div className="text-xs font-black text-blue-600">Rp {item.harga.toLocaleString('id-ID')}</div>
                    <div className="text-[11px] text-slate-400 truncate">{item.tokoNama}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Tayang di Landing
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteUmkm(item.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Dagangan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: KOS MANAGER
          ========================================================================= */}
      {activeTab === 'kos' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-900">Daftar Hunian & Kos Anda</h3>
            <button
              type="button"
              onClick={() => setShowAddKos(!showAddKos)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddKos ? 'Tutup Form' : 'Pasang Kos Baru'}</span>
            </button>
          </div>

          {showAddKos && (
            <div className="bg-white rounded-3xl border border-blue-200 p-6 shadow-sm space-y-5 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-base text-slate-900">Formulir Pasang Hunian / Kos</h4>
                <p className="text-xs text-slate-500">Lengkapi data hunian, kamar kosong, fasilitas, dan kunci titik lokasi GPS.</p>
              </div>

              <form onSubmit={handleSaveKos} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Nama Kos / Hunian *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kos Putri Griya Asri Doko"
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
                      <option value="Kos Putri">Kos Putri</option>
                      <option value="Kos Putra">Kos Putra</option>
                      <option value="Kos Campur">Kos Campur</option>
                      <option value="Kontrakan Rumah">Kontrakan Rumah</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tarif Sewa (Rp) *</label>
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
                    <label className="block font-bold text-slate-700 mb-1">Sisa Kamar Kosong</label>
                    <input
                      type="number"
                      min="1"
                      value={kosSisaKamar}
                      onChange={(e) => setKosSisaKamar(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* GPS Location Section */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-blue-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Lokasi GPS Kos (Wajib untuk Akurasi Jarak)
                    </span>
                    <button
                      type="button"
                      onClick={handleDetectKosGps}
                      disabled={isDetectingKosGps}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Navigation className={`w-3.5 h-3.5 ${isDetectingKosGps ? 'animate-spin' : ''}`} />
                      <span>{isDetectingKosGps ? 'Mengunci...' : 'Kunci Titik GPS Hunian'}</span>
                    </button>
                  </div>
                  <div className="text-[11px] font-mono text-slate-600">
                    Koordinat: <strong>{kosLat.toFixed(5)}</strong>, <strong>{kosLng.toFixed(5)}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Pemilik *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama pemilik kos..."
                      value={kosPemilikNama}
                      onChange={(e) => setKosPemilikNama(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp Pemilik *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 08123456789"
                      value={kosPemilikWa}
                      onChange={(e) => setKosPemilikWa(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                  <input
                    type="text"
                    placeholder="Jl. Kenanga No. 18, RT 02 / RW 01..."
                    value={kosAlamat}
                    onChange={(e) => setKosAlamat(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL Foto Hunian</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={kosFotoUrl}
                    onChange={(e) => setKosFotoUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                {/* Facilities Checklist */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="font-bold text-slate-800">Fasilitas Tersedia:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facWifi}
                        onChange={(e) => setFacWifi(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>WiFi Cepat</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facAc}
                        onChange={(e) => setFacAc(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>AC Dingin</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facKmDalam}
                        onChange={(e) => setFacKmDalam(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>KM Dalam</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facKasur}
                        onChange={(e) => setFacKasur(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Kasur Springbed</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={facParkir}
                        onChange={(e) => setFacParkir(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Parkir Aman</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddKos(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer"
                  >
                    Simpan & Terbitkan ke Portal Kos
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List Kos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kosList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={item.fotoUrl}
                    alt={item.nama}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {item.tipe}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 truncate mt-1">{item.nama}</h4>
                    <div className="text-xs font-black text-blue-600">
                      Rp {item.harga.toLocaleString('id-ID')} /{item.periode}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">Sisa {item.sisaKamar} Kamar</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Aktif di Pencarian
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteKos(item.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Kos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: LOKER MANAGER & PELAMAR
          ========================================================================= */}
      {activeTab === 'loker' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-900">Lowongan Pekerjaan & Pelamar</h3>
            <button
              type="button"
              onClick={() => setShowAddLoker(!showAddLoker)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddLoker ? 'Tutup Form' : 'Pasang Lowongan Baru'}</span>
            </button>
          </div>

          {showAddLoker && (
            <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-sm space-y-5 animate-fade-in">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-base text-slate-900">Formulir Pasang Lowongan Kerja</h4>
                <p className="text-xs text-slate-500">Pasang lowongan pekerjaan bagi warga Kediri dengan kualifikasi dan berkas CV digital.</p>
              </div>

              <form onSubmit={handleSaveLoker} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Posisi Lowongan *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Staf Administrasi & Kasir"
                      value={lokerPosisi}
                      onChange={(e) => setLokerPosisi(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Perusahaan / Usaha *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: CV Berkah Pangan Mandiri"
                      value={lokerPerusahaan}
                      onChange={(e) => setLokerPerusahaan(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bidang Keahlian</label>
                    <select
                      value={lokerKategori}
                      onChange={(e) => setLokerKategori(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-800"
                    >
                      <option value="Administrasi">Administrasi</option>
                      <option value="IT & Digital">IT & Digital</option>
                      <option value="F&B / Kuliner">F&B / Kuliner</option>
                      <option value="Teknik & Bengkel">Teknik & Bengkel</option>
                      <option value="Pendidikan">Pendidikan</option>
                      <option value="Perdagangan & Retail">Perdagangan & Retail</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipe Kerja</label>
                    <select
                      value={lokerTipeKerja}
                      onChange={(e) => setLokerTipeKerja(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-800"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Harian">Harian</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Magang">Magang</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp HRD *</label>
                    <input
                      type="tel"
                      required
                      placeholder="08123456789"
                      value={lokerWaHrd}
                      onChange={(e) => setLokerWaHrd(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gaji Minimal (Rp)</label>
                    <input
                      type="number"
                      value={lokerGajiMin}
                      onChange={(e) => setLokerGajiMin(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gaji Maksimal (Rp)</label>
                    <input
                      type="number"
                      value={lokerGajiMax}
                      onChange={(e) => setLokerGajiMax(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggung Jawab & Deskripsi (Pisahkan baris baru)</label>
                  <textarea
                    rows={3}
                    placeholder="Contoh:&#10;Mencatat pembukuan harian keluar masuk kas&#10;Melayani pembayaran kasir tablet"
                    value={lokerDescText}
                    onChange={(e) => setLokerDescText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-800"
                  />
                </div>

                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lokerSyaratCv}
                    onChange={(e) => setLokerSyaratCv(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Wajib Upload Berkas CV (PDF/DOCX)</span>
                </label>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddLoker(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
                  >
                    Terbitkan Lowongan ke Bursa Kerja
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List Loker & Pelamar */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lokerList.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {item.tipeKerja}
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900 mt-1">{item.posisi}</h4>
                      <div className="text-xs text-slate-500">{item.perusahaan}</div>
                      <div className="text-xs font-black text-blue-600 mt-1">
                        Rp {item.gajiMin.toLocaleString('id-ID')} - Rp {item.gajiMax.toLocaleString('id-ID')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteLoker(item.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Lowongan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.jumlahPelamar} Berkas Pelamar</span>
                    <span className="text-emerald-600 font-bold">Aktif di Bursa Kerja</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Rekap Pelamar Masuk */}
            {lamaranList.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Berkas Lamaran Kerja Masuk ({lamaranList.length})</span>
                </h4>

                <div className="divide-y divide-slate-100">
                  {lamaranList.map((lamaran) => (
                    <div key={lamaran.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{lamaran.pelamarNama}</div>
                        <div className="text-slate-500">
                          Posisi: <strong>{lamaran.lokerPosisi}</strong> ({lamaran.lokerPerusahaan})
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Pendidikan: {lamaran.pendidikanTerakhir} • Berkas: {lamaran.cvFileName}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${lamaran.pelamarWa.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Hubungi Pelamar</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
