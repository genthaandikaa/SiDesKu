import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  FileQuestion, 
  UserCheck, 
  Smartphone, 
  ChevronDown, 
  ChevronUp, 
  FileCheck2, 
  Sparkles,
  Search,
  Zap,
  Tag
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';

export const LayananSuratPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedSurat, setSelectedSurat] = useState<any | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const categories = ['Semua', 'Kependudukan', 'Bantuan & Pendidikan', 'Ekonomi & Usaha', 'Kepolisian & Keamanan'];

  const suratTypes = [
    {
      id: 1,
      kode: 'SKTM',
      nama: 'Surat Keterangan Tidak Mampu (SKTM)',
      kategori: 'Bantuan & Pendidikan',
      waktu: '10 - 20 Menit',
      biaya: 'Gratis (Rp 0)',
      syarat: [
        'KTP Pemohon / Kartu Pelajar (asli/foto)',
        'Kartu Keluarga (KK) Desa Doko',
        'Surat Pengantar dari Ketua RT setempat (otomatis via SIDes)',
        'Foto kondisi rumah / surat pernyataan penghasilan orang tua (bila diminta)',
      ],
      kegunaan: 'Syarat beasiswa sekolah/kuliah, pengajuan KIP Kuliah, keringanan biaya RSUD, atau permohonan bansos.',
    },
    {
      id: 2,
      kode: 'SKD',
      nama: 'Surat Keterangan Domisili',
      kategori: 'Kependudukan',
      waktu: '5 - 15 Menit',
      biaya: 'Gratis (Rp 0)',
      syarat: [
        'KTP asli pemohon',
        'Kartu Keluarga (KK)',
        'Persetujuan Ketua RT & Ketua RW sesuai alamat tinggal',
      ],
      kegunaan: 'Persyaratan pembukaan rekening bank, pendaftaran kerja, verifikasi alamat domisili sementara.',
    },
    {
      id: 3,
      kode: 'SKU',
      nama: 'Surat Keterangan Usaha (SKU)',
      kategori: 'Ekonomi & Usaha',
      waktu: '10 - 20 Menit',
      biaya: 'Gratis (Rp 0)',
      syarat: [
        'KTP Pemilik Usaha',
        'Kartu Keluarga (KK)',
        'Foto tempat usaha / kegiatan dagang',
        'Verifikasi pengurus RT bahwa usaha aktif beroperasi di Desa Doko',
      ],
      kegunaan: 'Pengajuan KUR Bank (BRI/Mandiri/Jatim), legalitas izin usaha mikro, pengajuan bantuan modal UMKM.',
    },
    {
      id: 4,
      kode: 'SKCK',
      nama: 'Surat Pengantar SKCK',
      kategori: 'Kepolisian & Keamanan',
      waktu: '5 - 15 Menit',
      biaya: 'Gratis (Rp 0)',
      syarat: [
        'KTP Pemohon',
        'Kartu Keluarga (KK)',
        'Pas foto 4x6 background merah',
        'Surat pengantar RT yang menyatakan berkelakuan baik',
      ],
      kegunaan: 'Persyaratan penerbitan SKCK di Polsek Ngasem / Polres Kediri untuk melamar pekerjaan atau CPNS/BUMN.',
    },
    {
      id: 5,
      kode: 'SKM',
      nama: 'Surat Keterangan Kematian',
      kategori: 'Kependudukan',
      waktu: 'Langsung Diproses',
      biaya: 'Gratis (Rp 0)',
      syarat: [
        'KTP & KK Almarhum/Almarhumah',
        'KTP Pelapor (Ahli Waris/Keluarga)',
        'Surat Keterangan Kematian dari RS / Puskesmas / Bidan Desa (jika ada)',
        'Keterangan saksi dari RT setempat',
      ],
      kegunaan: 'Pengurusan Akta Kematian Dispendukcapil, klaim asuransi/Taspen, dan penghapusan data kependudukan.',
    },
    {
      id: 6,
      kode: 'SKL',
      nama: 'Surat Keterangan Kelahiran',
      kategori: 'Kependudukan',
      waktu: '10 - 20 Menit',
      biaya: 'Gratis (Rp 0)',
      syarat: [
        'Surat Keterangan Lahir dari Bidan / Rumah Sakit',
        'KTP Suami & Istri',
        'Buku Nikah / Akta Perkawinan Orang Tua',
        'Kartu Keluarga (KK)',
      ],
      kegunaan: 'Pengurusan Akta Kelahiran dan penambahan anggota keluarga baru di KK Dispendukcapil Kab. Kediri.',
    },
    {
      id: 7,
      kode: 'SKBM',
      nama: 'Surat Keterangan Belum Menikah',
      kategori: 'Kependudukan',
      waktu: '5 - 15 Menit',
      biaya: 'Gratis (Rp 0)',
      syarat: [
        'KTP Pemohon',
        'Kartu Keluarga (KK)',
        'Surat pernyataan belum pernah menikah bermaterai Rp 10.000',
        'Persetujuan Ketua RT & RW',
      ],
      kegunaan: 'Syarat pernikahan di KUA (Model N1-N4), pendaftaran beasiswa ikatan dinas, atau persyaratan rekrutmen kerja.',
    },
    {
      id: 8,
      kode: 'SKP',
      nama: 'Surat Pengantar Pindah Domisili',
      kategori: 'Kependudukan',
      waktu: '15 - 30 Menit',
      biaya: 'Gratis (Rp 0)',
      syarat: [
        'KTP dan KK Asli',
        'Alamat lengkap tujuan pindah (RT, RW, Desa, Kec, Kab, Prov)',
        'Alasan kepindahan',
        'Surat bebas tanggungan kas RT',
      ],
      kegunaan: 'Penerbitan Surat Keterangan Pindah WNI (SKPWNI) dari Dispendukcapil Kabupaten Kediri.',
    },
  ];

  const filteredSuratTypes = suratTypes.filter((s) => {
    const matchCategory = selectedCategory === 'Semua' || s.kategori.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchSearch = s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        s.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.kegunaan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const faqs = [
    {
      q: 'Apakah pengurusan surat di SIDes Desa Doko dipungut biaya?',
      a: 'Sama sekali TIDAK. Seluruh jenis surat pengantar dan administrasi desa berstatus GRATIS (Rp 0,-) sesuai peraturan perundang-undangan.',
    },
    {
      q: 'Bagaimana cara warga mengurus surat jika belum memiliki akun?',
      a: 'Warga yang sudah terdata dalam Kartu Keluarga di Desa Doko dapat langsung login menggunakan NIK atau username, atau klik tombol Sign up untuk membuat akun warga mandiri.',
    },
    {
      q: 'Berapa lama surat saya selesai dan bisa dicetak?',
      a: 'Rata-rata 10 hingga 30 menit setelah diajukan. Begitu Ketua RT dan Ketua RW menekan tombol ACC di ponsel mereka, Sekdes dapat langsung menerbitkan nomor surat dan tanda tangan QR yang sah.',
    },
    {
      q: 'Apakah dokumen yang diunduh dari SIDes sah di instansi luar?',
      a: 'Sangat sah. Setiap surat dilengkapi Nomor Registrasi Resmi Pemdes Doko dan QR Code Keaslian Dokumen yang dapat dipindai oleh bank, sekolah, polsek, maupun Dispendukcapil.',
    },
  ];

  return (
    <div className="space-y-16 py-6 sm:py-8 page-enter relative overflow-hidden">
      
      {/* Clean Ambient Hero Section with SVG Vectors (Seamless) */}
      <section className="relative pt-4 sm:pt-6 pb-16 sm:pb-20 overflow-hidden">
        
        {/* SVG Ambient Concentric Watermark Vectors */}
        <svg className="absolute -right-20 -top-20 w-[500px] h-[500px] text-emerald-200/35 pointer-events-none -z-10" viewBox="0 0 400 400" fill="none">
          <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
          <circle cx="200" cy="200" r="140" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="90" stroke="currentColor" strokeWidth="1" />
          <circle cx="200" cy="200" r="40" stroke="currentColor" strokeWidth="1" />
        </svg>
        <svg className="absolute -left-20 top-1/3 w-[420px] h-[420px] text-teal-200/25 pointer-events-none -z-10" viewBox="0 0 400 400" fill="none">
          <path d="M 0,200 Q 100,70 200,200 T 400,200" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M 0,230 Q 100,100 200,230 T 400,230" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
        </svg>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column (60% Fibonacci): Title, Eyebrow, and Description */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-black border border-emerald-200 shadow-2xs">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Standar Pelayanan Prima Digital</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.12]">
                Katalog Layanan{' '}
                <span className="relative whitespace-nowrap text-emerald-700 inline-block">
                  Surat Digital
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-400" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0 15 Q 50 0, 100 12" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium max-w-xl">
                Daftar lengkap 14 jenis surat keterangan resmi, persyaratan berkas kependudukan, dan panduan pengajuan online tanpa perlu antre fisik di kantor desa.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all press-down flex items-center gap-2 hover-glow"
                >
                  <span>Ajukan Surat Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 border border-slate-200/80 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Legalitas TTD & QR Code Sah</span>
                </div>
              </div>
            </div>

            {/* Right Column (40% Fibonacci): Document Mockup Preview */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="w-full max-w-md animate-float-gentle">
                <div className="card-elevated-mockup p-6 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-900/5 space-y-4">
                  
                  {/* Top Bar with Kediri Emblem */}
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <img 
                        src="/images/logo-kediri.png" 
                        alt="Kabupaten Kediri" 
                        className="h-8 w-auto object-contain"
                      />
                      <div>
                        <div className="font-black text-xs text-slate-900 leading-tight">
                          Dokumen Resmi Dinas
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold">
                          Kop Surat Pemdes Doko
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-200">
                      Gratis Rp 0,-
                    </span>
                  </div>

                  {/* Document Preview Snippet */}
                  <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-100 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <span className="font-black text-slate-800">Surat Keterangan Usaha (SKU)</span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                        503/042/.../2026
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-500">
                      <div className="flex justify-between"><span>Pemohon:</span><strong className="text-slate-800">Bambang Utomo</strong></div>
                      <div className="flex justify-between"><span>Verifikasi RT:</span><span className="text-emerald-700 font-bold">✓ Selesai ACC</span></div>
                      <div className="flex justify-between"><span>Pengesahan:</span><span className="text-emerald-700 font-bold">✓ Stempel & QR TTD</span></div>
                    </div>
                  </div>

                  {/* Instant Guarantee */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Diproses Rata-rata &lt; 15 Menit</span>
                    </span>
                    <span className="font-bold text-slate-700">100% Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Bridge Guarantee Ribbon (Golden Ratio Divider) */}
      <section className="-mt-12 sm:-mt-14 relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xl shadow-slate-900/5 p-6 sm:p-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-center">
            <div className="px-2">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">14</div>
              <div className="text-xs text-slate-500 font-bold mt-1">Jenis Surat Resmi</div>
            </div>
            <div className="px-2 pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">Rp 0,-</div>
              <div className="text-xs text-slate-500 font-bold mt-1">Gratis Tanpa Pungli</div>
            </div>
            <div className="px-2 pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">&lt; 15 Menit</div>
              <div className="text-xs text-slate-500 font-bold mt-1">Rata-rata Waktu Proses</div>
            </div>
            <div className="px-2 pt-4 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">100%</div>
              <div className="text-xs text-slate-500 font-bold mt-1">Legalitas QR Sah</div>
            </div>
          </div>
        </div>
      </section>

      {/* Alur Berjenjang 4 Tahap */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Transparansi Proses</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Alur Pelayanan Surat 4 Tahap
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Mekanisme birokrasi berjenjang yang aman, akuntabel, dan terlacak realtime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-lg transition-all space-y-3 relative hover-lift">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
              1
            </div>
            <h3 className="font-bold text-base text-gray-900">Pengajuan Warga</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Warga login ke portal, memilih jenis surat yang dibutuhkan, dan mengisi alasan/keperluan permohonan.
            </p>
            <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-xl">
              ⏱ Seketika (1 Menit)
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-lg transition-all space-y-3 relative hover-lift">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
              2
            </div>
            <h3 className="font-bold text-base text-gray-900">Validasi Ketua RT</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Ketua RT memeriksa kebenaran data warganya dan memberikan persetujuan (ACC) via smartphone.
            </p>
            <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-xl">
              ⏱ Notifikasi Realtime
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-lg transition-all space-y-3 relative hover-lift">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
              3
            </div>
            <h3 className="font-bold text-base text-gray-900">Verifikasi Ketua RW</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Ketua RW memvalidasi berkas pengantar untuk memastikan tertib administrasi tingkat rukun warga.
            </p>
            <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-xl">
              ⏱ 1-Klik Verifikasi
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-lg transition-all space-y-3 relative hover-lift">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
              4
            </div>
            <h3 className="font-bold text-base text-gray-900">Penerbitan Sekdes & QR</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Sekdes menerbitkan nomor registrasi otomatis, stempel resmi, dan tanda tangan QR yang siap diunduh/cetak.
            </p>
            <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-xl">
              ⏱ Terbit Sah & Resmi
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Bar Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Katalog Layanan Digital</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Pilih Jenis Surat yang Anda Butuhkan
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ketik nama surat atau kode (SKTM, SKU, SKD)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs scale-102'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Surat Catalog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSuratTypes.map((s) => (
            <div key={s.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 hover:shadow-xl transition-all duration-300 hover-lift group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {s.kode}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{s.waktu}</span>
                </div>

                <h3 className="font-black text-base text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">
                  {s.nama}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {s.kegunaan}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSurat(s)}
                  className="text-xs font-bold text-slate-600 hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  Syarat Berkas →
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (user) navigate('/dashboard');
                    else navigate('/login');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shadow-2xs transition-all press-down cursor-pointer"
                >
                  Ajukan
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Persuratan */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-8">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Pertanyaan Warga</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Hal yang Sering Ditanyakan (FAQ)
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="card-surface overflow-hidden transition-all">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 hover:bg-gray-50/80 transition-colors"
                >
                  <span>{f.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-gray-600 border-t border-gray-100 bg-gray-50/50 leading-relaxed animate-fade-in">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal Detail Persyaratan Surat */}
      {selectedSurat && (
        <div className="modal-backdrop flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl modal-content">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {selectedSurat.kode}
                </span>
                <h3 className="font-extrabold text-lg text-gray-900 mt-2">{selectedSurat.nama}</h3>
              </div>
              <button 
                onClick={() => setSelectedSurat(null)} 
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="font-bold text-gray-800 uppercase tracking-wider mb-2">Kegunaan / Peruntukan:</div>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl">
                  {selectedSurat.kegunaan}
                </p>
              </div>

              <div>
                <div className="font-bold text-gray-800 uppercase tracking-wider mb-2">Persyaratan Dokumen:</div>
                <ul className="space-y-2">
                  {selectedSurat.syarat.map((syarat: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{syarat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <div className="text-gray-400 text-[10px]">Estimasi Waktu</div>
                  <div className="font-bold text-emerald-950">{selectedSurat.waktu}</div>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <div className="text-gray-400 text-[10px]">Biaya Administrasi</div>
                  <div className="font-bold text-emerald-800">{selectedSurat.biaya}</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedSurat(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setSelectedSurat(null);
                  if (user) navigate('/dashboard');
                  else navigate('/login');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors"
              >
                Ajukan Surat Ini Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
