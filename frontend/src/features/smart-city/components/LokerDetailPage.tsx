import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Share2,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Home,
  FileText,
  ListChecks,
  Gift,
  DollarSign,
  HeartHandshake,
  TrendingUp,
  Truck,
  MessageCircle,
  AlertCircle,
  Sparkles,
  Check
} from 'lucide-react';
import { LokerItem } from '../types';
import { smartCityApi } from '../api/smartCityApi';
import { getStoredLokerById, getStoredLokerList } from '../smartCityStorage';

export const LokerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<LokerItem | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;

    let isMounted = true;
    smartCityApi.getLokerDetail(id)
      .then((data) => {
        if (isMounted && data) {
          setJob(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          const found = getStoredLokerById(id);
          if (found) setJob(found);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-sans">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 text-blue-600 flex items-center justify-center mb-4">
          <Briefcase className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Memuat detail lowongan...</h2>
      </div>
    );
  }

  const isJasa = job.isJasaMitra || job.tipeKerja.includes('Freelance');

  return (
    <div className="w-full pb-28 sm:pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Breadcrumb (Decorated with vector SVG icons) */}
        <nav aria-label="Breadcrumb" className="inline-flex items-center gap-2 text-xs text-slate-500 mb-6 px-3.5 py-1.5 rounded-full bg-white/90 border border-slate-200/90 shadow-2xs backdrop-blur-sm flex-wrap">
          <Link to="/" className="hover:text-blue-600 transition-colors inline-flex items-center gap-1 font-medium text-slate-600">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Beranda</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/smart-city/loker" className="hover:text-blue-600 transition-colors inline-flex items-center gap-1 font-medium text-slate-600">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>Bursa Kerja</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md inline-flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>{job.posisi}</span>
          </span>
        </nav>

        {/* Top Header Section */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            {/* Left Header Info */}
            <div className="space-y-3">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  {job.tagVerifikasi || 'Lowongan Terverifikasi Resmi'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {job.tipeKerja}
                </span>
                <span className="inline-flex items-center text-slate-500 font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {job.distanceText || '1.2 km dari domisili Anda'}
                </span>
              </div>

              {/* Title & Company */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {job.posisi}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 mt-2">
                  <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    {job.perusahaan}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Penempatan {job.lokasi}
                  </span>
                  {job.nib && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">NIB: {job.nib}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Action Header */}
            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  to={`/smart-city/loker/${job.id}/lamar`}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition-all shadow-sm hover:shadow-md"
                >
                  <span>{isJasa ? 'Daftar Kemitraan' : 'Lamar Sekarang'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                {/* Bookmark Toggle */}
                <button
                  type="button"
                  onClick={() => setIsSaved(!isSaved)}
                  className={`p-3 rounded-xl border transition-all ${
                    isSaved
                      ? 'bg-amber-50 border-amber-300 text-amber-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  title={isSaved ? 'Hapus Simpan' : 'Simpan Lowongan'}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-600' : ''}`} />
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                  title="Bagikan Lowongan"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* 4-Metric Quick Stat Grid (Matching Stitch Screen 3) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
            {/* Stat 1: Gaji */}
            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
              <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                {job.gajiLabel || 'Estimasi Gaji Bulanan'}
              </span>
              <div className="text-base sm:text-lg font-extrabold text-blue-700 mt-1">
                Rp {job.gajiMin.toLocaleString('id-ID')} – {job.gajiMax.toLocaleString('id-ID')}
                <span className="text-xs font-normal text-slate-500 ml-1">/ bln</span>
              </div>
              <span className="block text-xs text-slate-500 mt-1">
                Pajak PPh ditanggung perusahaan
              </span>
            </div>

            {/* Stat 2: Waktu Kerja */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                Waktu Kerja
              </span>
              <div className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                {job.waktuKerja ? job.waktuKerja.split('\n')[0] : 'Senin - Jumat'}
              </div>
              <span className="block text-xs text-slate-500 mt-1">
                {job.waktuKerja && job.waktuKerja.split('\n')[1] ? job.waktuKerja.split('\n')[1] : '08.30 - 17.00 WIB'}
              </span>
            </div>

            {/* Stat 3: Level Pekerjaan */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                Level Pekerjaan
              </span>
              <div className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                {job.levelPekerjaan ? job.levelPekerjaan.split('\n')[0] : 'Entry Level / Staf'}
              </div>
              <span className="block text-xs text-slate-500 mt-1">
                {job.levelPekerjaan && job.levelPekerjaan.split('\n')[1] ? job.levelPekerjaan.split('\n')[1] : 'Fresh graduate dipersilakan'}
              </span>
            </div>

            {/* Stat 4: Fasilitas Utama */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                Fasilitas Utama
              </span>
              <div className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                {job.fasilitasUtama ? job.fasilitasUtama.split('\n')[0] : 'BPJS Lengkap'}
              </div>
              <span className="block text-xs text-slate-500 mt-1">
                {job.fasilitasUtama && job.fasilitasUtama.split('\n')[1] ? job.fasilitasUtama.split('\n')[1] : 'Tunjangan Makan & Transportasi'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content: Two Columns Layout (65% / 35%) */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Section 1: Deskripsi & Tanggung Jawab */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">Deskripsi & Tanggung Jawab</h2>
              </div>

              <div className="mt-4 space-y-4">
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {job.deskripsiDetail || job.ringkasan || job.deskripsi[0]}
                </p>

                <div className="space-y-2.5 pt-2">
                  {(job.tanggungJawab || job.deskripsi).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                      <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 2: Persyaratan & Kualifikasi */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <ListChecks className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">Persyaratan & Kualifikasi</h2>
              </div>

              <div className="mt-4 space-y-2.5">
                {(job.persyaratan && job.persyaratan.length > 0
                  ? job.persyaratan
                  : [
                      `Pendidikan minimal ${job.pendidikan}`,
                      `Pengalaman: ${job.pengalaman}`,
                      'Memiliki ketelitian tinggi dalam penginputan data dan komunikasi sopan.',
                      `Berdomisili di wilayah ${job.lokasi} atau bersedia ditempatkan di lokasi tugas.`
                    ]
                ).map((req, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-2 shrink-0" />
                    <p className="text-sm text-slate-700 leading-relaxed">{req}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Benefit & Fasilitas (4 Cards in 2x2 Grid) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <Gift className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">Benefit & Fasilitas</h2>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(job.benefits && job.benefits.length > 0
                  ? job.benefits
                  : [
                      {
                        title: 'Gaji Pokok Kompetitif',
                        desc: 'Sesuai standar UMK kota dengan transparansi PPh.',
                        icon: 'money'
                      },
                      {
                        title: 'Jaminan Sosial Lengkap',
                        desc: 'BPJS Kesehatan & BPJS Ketenagakerjaan aktif.',
                        icon: 'shield'
                      },
                      {
                        title: 'Tunjangan Operasional',
                        desc: 'Tunjangan transportasi harian & uang makan.',
                        icon: 'transport'
                      },
                      {
                        title: 'Pengembangan Karir',
                        desc: 'Jenjang karir jelas & pelatihan digital bersertifikasi.',
                        icon: 'growth'
                      }
                    ]
                ).map((b, idx) => {
                  let IconComponent = Sparkles;
                  if (b.icon === 'money') IconComponent = DollarSign;
                  if (b.icon === 'shield') IconComponent = ShieldCheck;
                  if (b.icon === 'transport') IconComponent = Truck;
                  if (b.icon === 'growth') IconComponent = TrendingUp;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-sky-50/40 border border-sky-100/80 hover:bg-sky-50/70 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center mb-2.5">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{b.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (Company & Application Sidebar) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Company Profile Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
              {/* Header Company */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs">
                  {job.companyLogoText || job.perusahaan.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {job.perusahaan}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {job.mitraStatus || 'Mitra Resmi Terverifikasi'}
                  </span>
                </div>
              </div>

              {/* Company Details List */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 font-medium">Bidang</span>
                  <span className="text-slate-800 font-semibold text-right">
                    {job.bidang || job.kategori}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 font-medium">Alamat Kantor</span>
                  <span className="text-slate-800 font-semibold text-right max-w-[180px] truncate" title={job.alamatKantor || job.lokasi}>
                    {job.alamatKantor || job.lokasi}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 font-medium">Batas Pengajuan</span>
                  <span className="text-slate-800 font-semibold text-right">
                    {job.batasPengajuan || '31 Maret 2025'}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 font-medium">Kuota Kebutuhan</span>
                  <span className="text-slate-800 font-semibold text-right">
                    {job.kuotaKebutuhan || '2 Orang'}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-2">
                  <span className="text-slate-500 font-medium">Waktu Proses</span>
                  <span className="text-slate-800 font-semibold text-right">
                    {job.waktuProses || '3 - 5 hari kerja'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <Link
                  to={`/smart-city/loker/${job.id}/lamar`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm transition-all shadow-sm hover:shadow-md text-center"
                >
                  <span>{isJasa ? 'Daftar Kemitraan' : 'Lamar Sekarang'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <a
                  href={`https://wa.me/${job.waHrd}?text=${encodeURIComponent(`Halo HRD ${job.perusahaan}, saya tertarik dengan posisi ${job.posisi} di SiDesKu.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors text-center"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Tanya via Chat SiDesKu</span>
                </a>
              </div>

              {/* Trust Badge Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Proses rekrutmen ini <strong>100% bebas pungutan biaya</strong> dan dilindungi oleh pengawasan Dinas Ketenagakerjaan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Floating Bottom Bar (For Mobile Users) */}
      <div className="fixed sm:hidden bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">
              Estimasi Gaji
            </span>
            <span className="text-sm font-extrabold text-blue-700">
              Rp {job.gajiMin.toLocaleString('id-ID')}
            </span>
          </div>

          <Link
            to={`/smart-city/loker/${job.id}/lamar`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700"
          >
            <span>{isJasa ? 'Daftar Mitra' : 'Lamar Sekarang'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
          </Link>
        </div>
      </div>
    </div>
  );
};