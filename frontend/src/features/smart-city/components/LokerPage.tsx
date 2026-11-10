import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Search,
  CheckCircle2,
  Phone,
  FileText,
  Upload,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Navigation,
  Compass,
  Building2,
  PlusCircle,
  X,
  Share2,
  Clock,
  Send,
  BadgeCheck,
  Check
} from 'lucide-react';
import { LokerItem, LamaranLoker } from '../types';
import {
  getStoredLokerList,
  submitStoredLamaran,
  KEDIRI_DEFAULT_COORDS,
  calculateDistanceKm,
  formatDistance
} from '../smartCityStorage';

export const LokerPage: React.FC = () => {
  const [lokerList, setLokerList] = useState<LokerItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [distanceFilter, setDistanceFilter] = useState<'all' | '1' | '5' | '10' | 'custom'>('all');
  const [customDistanceKm, setCustomDistanceKm] = useState<number>(5);

  // User Geolocation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(KEDIRI_DEFAULT_COORDS);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('Pusat Kota Kediri (Default)');

  // Selected Loker for Detail & Apply Modal
  const [selectedLoker, setSelectedLoker] = useState<LokerItem | null>(null);
  const [applyingLoker, setApplyingLoker] = useState<LokerItem | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Application Form State
  const [pelamarNama, setPelamarNama] = useState('');
  const [pelamarWa, setPelamarWa] = useState('');
  const [pelamarEmail, setPelamarEmail] = useState('');
  const [pendidikanTerakhir, setPendidikanTerakhir] = useState('SMA / SMK');
  const [cvFileName, setCvFileName] = useState('');
  const [catatanPelamar, setCatatanPelamar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    setLokerList(getStoredLokerList());
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

  const filteredList = useMemo(() => {
    return lokerList.filter((item) => {
      // 1. Search Query (matches 1 character/word)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchTitle = item.posisi.toLowerCase().includes(q);
        const matchComp = item.perusahaan.toLowerCase().includes(q);
        const matchCat = item.kategori.toLowerCase().includes(q);
        const matchType = item.tipeKerja.toLowerCase().includes(q);
        const matchEdu = item.pendidikan.toLowerCase().includes(q);
        const matchDesc = item.deskripsi.some((d) => d.toLowerCase().includes(q));
        if (!matchTitle && !matchComp && !matchCat && !matchType && !matchEdu && !matchDesc) {
          return false;
        }
      }

      // 2. Type Filter
      if (selectedType !== 'Semua' && item.tipeKerja !== selectedType) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'Semua' && item.kategori !== selectedCategory) {
        return false;
      }

      // 4. Distance Filter
      const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
      if (distanceFilter === '1' && dist > 1) return false;
      if (distanceFilter === '5' && dist > 5) return false;
      if (distanceFilter === '10' && dist > 10) return false;
      if (distanceFilter === 'custom' && dist > customDistanceKm) return false;

      return true;
    });
  }, [lokerList, searchQuery, selectedType, selectedCategory, distanceFilter, customDistanceKm, userLocation]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCvFileName(file.name);
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingLoker) return;
    if (!pelamarNama || !pelamarWa) {
      alert('Mohon isi nama lengkap dan nomor WhatsApp aktif Anda.');
      return;
    }
    if (applyingLoker.syaratCv && !cvFileName) {
      alert('Lowongan ini mensyaratkan upload berkas CV (PDF/DOCX).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newLamaran: LamaranLoker = {
        id: `lamaran-${Date.now()}`,
        lokerId: applyingLoker.id,
        lokerPosisi: applyingLoker.posisi,
        lokerPerusahaan: applyingLoker.perusahaan,
        pelamarNama,
        pelamarWa,
        pelamarEmail,
        pendidikanTerakhir,
        cvFileName: cvFileName || 'CV-Default.pdf',
        catatan: catatanPelamar,
        status: 'Terkirim',
        tanggalLamar: new Date().toLocaleDateString('id-ID')
      };

      submitStoredLamaran(newLamaran);
      setIsSubmitting(false);
      setApplySuccess(true);
    }, 700);
  };

  const closeApplyModal = () => {
    setApplyingLoker(null);
    setApplySuccess(false);
    setPelamarNama('');
    setPelamarWa('');
    setPelamarEmail('');
    setCvFileName('');
    setCatatanPelamar('');
  };

  const getWaLink = (item: LokerItem) => {
    const text = encodeURIComponent(
      `Halo HRD *${item.perusahaan}*, saya melihat lowongan pekerjaan posisi *"${item.posisi}"* di portal Nexora Smart City Kediri. Saya ingin menanyakan proses lamaran kerja ini.`
    );
    return `https://wa.me/${item.waHrd}?text=${text}`;
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
          <span className="font-bold text-slate-800">Bursa Kerja & Loker Lokal</span>
        </div>

        <Link
          to="/dashboard?menu=smart_city_loker"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-all border border-blue-200"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Pasang Lowongan Pekerjaan</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-800 via-sky-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-sky-200">
            <Briefcase className="w-3.5 h-3.5 text-sky-300" />
            <span>Peluang Karir & Jasa Terverifikasi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Bursa Kerja & Loker Warga Kediri
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
            Akses langsung lowongan pekerjaan dari pelaku usaha, instansi, dan UMKM sekitar Anda. Lamar pekerjaan dengan mudah melalui upload CV dan pantau jarak lokasi kantor secara akurat.
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

      {/* Main Content: Search, Filters & Job Grid */}
      <div className="space-y-6">
        
        {/* Controls Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          
          {/* Row 1: Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari lowongan kasir, barista, teknisi, IT, admin, atau nama perusahaan..."
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

          {/* Row 2: Tipe Kerja Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {['Semua', 'Full-time', 'Part-time', 'Harian', 'Freelance', 'Magang'].map((t) => (
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

          {/* Row 3: Radius & Kategori Filters */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
            
            {/* Radius Segmented Filter */}
            <div className="md:col-span-7 flex flex-wrap items-center gap-1.5">
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

            {/* Category Dropdown */}
            <div className="md:col-span-5 flex items-center justify-start md:justify-end">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-auto py-1.5 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-bold focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Semua">Semua Bidang Keahlian</option>
                <option value="Administrasi">Administrasi</option>
                <option value="IT & Digital">IT & Digital</option>
                <option value="F&B / Kuliner">F&B / Kuliner</option>
                <option value="Teknik & Bengkel">Teknik & Bengkel</option>
                <option value="Pendidikan">Pendidikan</option>
                <option value="Perdagangan & Retail">Perdagangan & Retail</option>
              </select>
            </div>

          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Menampilkan <strong>{filteredList.length}</strong> lowongan kerja aktif</span>
          <span className="text-[11px] text-slate-400">Verifikasi Disnaker / Kelurahan</span>
        </div>

        {/* Job Grid */}
        {filteredList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredList.map((item) => {
              const distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng);
              const formattedDist = formatDistance(distanceKm);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all p-6 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header: Company & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{item.perusahaan}</span>
                          {item.disnakerVerified && (
                            <span title="Terverifikasi Resmi">
                              <BadgeCheck className="w-4 h-4 text-blue-600" />
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mt-1 leading-snug group-hover:text-blue-600 transition-colors">
                          {item.posisi}
                        </h3>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider border border-blue-100">
                          {item.tipeKerja}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.tanggalPosting}
                        </span>
                      </div>
                    </div>

                    {/* Salary & Distance */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Perkiraan Gaji:</div>
                        <div className="text-sm font-black text-blue-700">
                          Rp {item.gajiMin.toLocaleString('id-ID')} - Rp {item.gajiMax.toLocaleString('id-ID')}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jarak Lokasi:</div>
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-blue-600" />
                          <span>{formattedDist} dari Anda</span>
                        </div>
                      </div>
                    </div>

                    {/* Requirements pills */}
                    <div className="flex flex-wrap gap-1.5 text-xs">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {item.pendidikan}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {item.pengalaman}
                      </span>
                      {item.syaratCv && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                          Wajib CV
                        </span>
                      )}
                    </div>

                    {/* Key Responsibilities */}
                    <ul className="space-y-1 text-xs text-slate-600 pt-1">
                      {item.deskripsi.slice(0, 3).map((d, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-black">•</span>
                          <span className="line-clamp-1">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLoker(item)}
                      className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors text-center cursor-pointer"
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => setApplyingLoker(item)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Lamar Pekerjaan (Kirim CV)</span>
                    </button>
                    <a
                      href={getWaLink(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                      title="Chat HRD via WhatsApp"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-3">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-base">Tidak ada lowongan kerja yang cocok</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Coba perluas radius jarak atau pilih bidang profesi yang lain.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('Semua');
                setSelectedCategory('Semua');
                setDistanceFilter('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

      </div>

      {/* =========================================================================
          MODAL DETAIL LOKER
          ========================================================================= */}
      {selectedLoker && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedLoker(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600">{selectedLoker.perusahaan}</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">{selectedLoker.posisi}</h3>
              </div>
              <button
                onClick={() => setSelectedLoker(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Tawaran Gaji:</div>
                <div className="text-lg font-black text-blue-900">
                  Rp {selectedLoker.gajiMin.toLocaleString('id-ID')} - Rp {selectedLoker.gajiMax.toLocaleString('id-ID')}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                {selectedLoker.tipeKerja}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-800">Deskripsi & Tanggung Jawab:</div>
              <ul className="space-y-1.5 text-slate-600 pl-2">
                {selectedLoker.deskripsi.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-800">Persyaratan Kerja:</div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-slate-600">
                <div>Pendidikan: <strong>{selectedLoker.pendidikan}</strong></div>
                <div>Pengalaman: <strong>{selectedLoker.pengalaman}</strong></div>
                <div>Lokasi Penempatan: <strong>{selectedLoker.lokasi}</strong></div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const item = selectedLoker;
                  setSelectedLoker(null);
                  setApplyingLoker(item);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Lamar Pekerjaan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL FORM LAMAR PEKERJAAN (UPLOAD CV)
          ========================================================================= */}
      {applyingLoker && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={closeApplyModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {applySuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900">Lamaran Berhasil Terkirim!</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Berkas CV dan data diri Anda telah diteruskan ke HRD <strong>{applyingLoker.perusahaan}</strong>. Silakan pantau WhatsApp Anda untuk jadwal interview.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeApplyModal}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Formulir Lamaran Kerja</span>
                    <h3 className="text-lg font-black text-slate-900">{applyingLoker.posisi}</h3>
                    <p className="text-xs text-slate-500">{applyingLoker.perusahaan}</p>
                  </div>
                  <button
                    onClick={closeApplyModal}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleApplySubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Sesuai KTP *</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap Anda..."
                      value={pelamarNama}
                      onChange={(e) => setPelamarNama(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp Aktif *</label>
                      <input
                        type="tel"
                        required
                        placeholder="Contoh: 08123456789"
                        value={pelamarWa}
                        onChange={(e) => setPelamarWa(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email Aktif</label>
                      <input
                        type="email"
                        placeholder="nama@email.com"
                        value={pelamarEmail}
                        onChange={(e) => setPelamarEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pendidikan Terakhir</label>
                    <select
                      value={pendidikanTerakhir}
                      onChange={(e) => setPendidikanTerakhir(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    >
                      <option value="SMP">SMP Sederajat</option>
                      <option value="SMA / SMK">SMA / SMK Sederajat</option>
                      <option value="Diploma (D3)">Diploma (D3)</option>
                      <option value="Sarjana (S1)">Sarjana (S1)</option>
                    </select>
                  </div>

                  {/* CV Upload Box */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Upload Berkas CV / Portofolio {applyingLoker.syaratCv ? '*' : '(Opsional)'}
                    </label>
                    <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <FileText className="w-7 h-7 text-blue-600 mb-1" />
                      <span className="font-bold text-slate-800">
                        {cvFileName || 'Pilih Berkas CV (PDF atau DOCX)'}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Maksimal ukuran berkas 5 MB</span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Catatan Singkat / Pengantar</label>
                    <textarea
                      rows={2}
                      placeholder="Tuliskan pengalaman relevan atau motivasi singkat melamar..."
                      value={catatanPelamar}
                      onChange={(e) => setCatatanPelamar(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeApplyModal}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Mengirim Lamaran...' : 'Kirim Lamaran'}</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
