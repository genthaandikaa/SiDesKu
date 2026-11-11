import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  UploadCloud,
  Link as LinkIcon,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Send,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Sparkles,
  Info,
  Check,
  ExternalLink
} from 'lucide-react';
import { LokerItem, LamaranLoker, JobSeekerProfile } from '../types';
import {
  getStoredLokerById,
  getStoredLokerList,
  getStoredJobSeekerProfile,
  submitStoredLamaran
} from '../smartCityStorage';
import { useAuth } from '@/shared/context/AuthContext';

export const LokerApplyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState<LokerItem | null>(null);
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);

  // Form Fields
  const [applicantName, setApplicantName] = useState('');
  const [applicantNik, setApplicantNik] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantWa, setApplicantWa] = useState('');
  const [activeCvName, setActiveCvName] = useState('CV_Budi_Pratama_Terbaru.pdf');
  const [cvFileSize, setCvFileSize] = useState('1.4 MB');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [attachedPortfolioName, setAttachedPortfolioName] = useState<string | null>('Portofolio_Administrasi_Budi.pdf');
  const [recruiterNote, setRecruiterNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const seeker = getStoredJobSeekerProfile();
    setProfile(seeker);

    // Default with citizen profile or logged in user
    setApplicantName(user?.name || seeker.nama);
    setApplicantNik(seeker.nik);
    setApplicantEmail(user?.email || seeker.email);
    setApplicantWa(user?.phone_number || seeker.telepon);
    setActiveCvName(seeker.cvUtama.name);
    setCvFileSize(seeker.cvUtama.size);

    if (id) {
      const found = getStoredLokerById(id);
      if (found) {
        setJob(found);
      } else {
        const list = getStoredLokerList();
        if (list.length > 0) setJob(list[0]);
      }
    }
  }, [id, user]);

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setActiveCvName(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setCvFileSize(`${sizeMb} MB`);
    }
  };

  const handlePortfolioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedPortfolioName(file.name);
    }
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newLamaran: LamaranLoker = {
        id: `lamaran-${Date.now()}`,
        lokerId: job.id,
        lokerPosisi: job.posisi,
        lokerPerusahaan: job.perusahaan,
        pelamarNama: applicantName,
        pelamarNik: applicantNik,
        pelamarWa: applicantWa,
        pelamarEmail: applicantEmail,
        cvFileName: activeCvName,
        portofolioUrl: portfolioUrl.trim() || undefined,
        portofolioFileName: attachedPortfolioName || undefined,
        catatan: recruiterNote.trim() || undefined,
        status: 'Berkas Diterima HR - Wawancara Dijadwalkan',
        substatusText: 'Undangan via WhatsApp & Email',
        tanggalLamar: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        iconType: job.kategori.includes('Kuliner') ? 'coffee' : 'building'
      };

      submitStoredLamaran(newLamaran);
      setIsSubmitting(false);
      setSubmittedSuccessfully(true);
    }, 700);
  };

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center font-sans">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-50 text-blue-600 flex items-center justify-center mb-4">
          <Briefcase className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Memuat formulir lamaran...</h2>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {/* Breadcrumb & Back Link (Matching Stitch Screen 4) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <nav className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Beranda
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/smart-city/loker" className="hover:text-blue-600 transition-colors">
              Bursa Kerja
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to={`/smart-city/loker/${job.id}`} className="hover:text-blue-600 transition-colors truncate max-w-xs">
              {job.posisi}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold">Formulir Lamaran</span>
          </nav>

          <Link
            to={`/smart-city/loker/${job.id}`}
            className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Kembali ke Detail Lowongan
          </Link>
        </div>

        {/* Page Header */}
        <div className="pb-6 border-b border-slate-200">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            PENGAJUAN BERKAS DIGITAL SIDESKU
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lamar Posisi: {job.posisi}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {job.perusahaan} • Penempatan {job.lokasi}
          </p>
        </div>

        {/* Form Layout: Two Columns (65% / 35%) */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 4 Numbered Steps Form */}
          <form onSubmit={handleSubmitApplication} className="lg:col-span-8 space-y-8">
            {/* Step 1: Data Diri Pelamar */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Data Diri Pelamar</h2>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  Akun Warga Terverifikasi
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* NIK */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                    Nomor Induk Kependudukan
                  </label>
                  <input
                    type="text"
                    value={applicantNik}
                    readOnly
                    className="w-full px-4 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                    Surat Elektronik
                  </label>
                  <input
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                    Kontak WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={applicantWa}
                    onChange={(e) => setApplicantWa(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Data tersinkronisasi resmi dari KTP & Profil Kependudukan Terpadu SiDesKu.</span>
              </div>
            </div>

            {/* Step 2: Berkas Riwayat Hidup (CV) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Berkas Riwayat Hidup (CV)</h2>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  Wajib Lampirkan
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {/* Active CV Box */}
                <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm sm:text-base break-all">
                          {activeCvName}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Siap Kirim
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dokumen Utama Aktif • {cvFileSize} • Diperbarui 10 hari lalu
                      </p>
                    </div>
                  </div>

                  <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Ganti Berkas</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCvFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Dropzone Alternative Box */}
                <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/20 block">
                  <UploadCloud className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-semibold text-slate-800">
                    Atau klik untuk unggah file CV baru dari perangkat
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Format PDF standar industri (Maksimal ukuran 5.0 MB)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Step 3: Portofolio & Dokumen Pendukung */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    3
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Portofolio & Dokumen Pendukung</h2>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  Opsional
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {/* URL Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                    Tautan Portofolio / Website / Google Drive / LinkedIn
                  </label>
                  <div className="relative">
                    <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://drive.google.com/... atau https://linkedin.com/in/..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <span className="block text-xs text-slate-400 mt-1">
                    Pastikan akses tautan publik atau dapat dilihat tanpa permintaan izin khusus.
                  </span>
                </div>

                {/* Attached Portfolio File */}
                {attachedPortfolioName && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                      Berkas Portofolio / Sertifikat Terkait
                    </label>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-xs sm:text-sm">
                              {attachedPortfolioName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                              Tersedia
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Dokumen Pendukung • 2.1 MB • Terverifikasi di Profil
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <label className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors">
                          Ganti
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handlePortfolioFileChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setAttachedPortfolioName(null)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus berkas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Catatan untuk Tim Rekruiter */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    4
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Catatan untuk Tim Rekruiter</h2>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  Opsional
                </span>
              </div>

              <div className="mt-6">
                <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                  Pesan Singkat / Ringkasan Pengalaman
                </label>
                <textarea
                  rows={4}
                  maxLength={300}
                  value={recruiterNote}
                  onChange={(e) => setRecruiterNote(e.target.value)}
                  placeholder="Tulis pesan singkat atau perkenalan diri secara ringkas untuk HRD (maksimal 300 karakter)..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Fokuskan pada kesiapan kerja & domisili terdekat.</span>
                  <span className="font-medium text-slate-500">{recruiterNote.length} / 300</span>
                </div>
              </div>
            </div>

            {/* Actions Button Row */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <Link
                to={`/smart-city/loker/${job.id}`}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors text-center"
              >
                Batal & Kembali
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-sm hover:shadow-md inline-flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengirimkan Berkas...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Lamaran Sekarang</span>
                    <span>▶</span>
                  </>
                )}
              </button>
            </div>

            {/* Security Footnote */}
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-2.5 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p>
                Dengan mengirim berkas, data profil dan CV Anda akan diteruskan secara aman ke portal verifikasi HR <strong>{job.perusahaan}</strong> melalui kanal resmi SiDesKu.
              </p>
            </div>
          </form>

          {/* Right Column: Sticky Summary Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Card Lowongan Dituju */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                  {job.companyLogoText || job.perusahaan.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    LOWONGAN DITUJU
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {job.posisi}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{job.perusahaan}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">💼 Tipe Komitmen</span>
                  <span className="font-semibold text-slate-800">{job.tipeKerja}</span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">💰 Standar Gaji</span>
                  <span className="font-bold text-blue-600">
                    Rp {job.gajiMin.toLocaleString('id-ID')} – {job.gajiMax.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">🛡️ Fasilitas Pokok</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[170px] truncate">
                    {job.fasilitasUtama ? job.fasilitasUtama.split('\n')[0] : 'BPJS Lengkap'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">📍 Wilayah Tugas</span>
                  <span className="font-semibold text-slate-800">{job.lokasi}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">📅 Batas Pengajuan</span>
                  <span className="font-semibold text-slate-800">{job.batasPengajuan || '31 Maret 2025'}</span>
                </div>
              </div>
            </div>

            {/* Tips Kurasi Berkas */}
            <div className="p-5 rounded-3xl bg-blue-50/50 border border-blue-100 space-y-2">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Tips Kurasi Berkas</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pastikan nomor kontak WhatsApp aktif dan data pengalaman administrasi tercantum jelas pada berkas CV utama.
              </p>
            </div>

            {/* Trust Box */}
            <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                Proses rekrutmen ini <strong>100% bebas biaya</strong> dan diawasi langsung oleh Dinas Tenaga Kerja & Tim SiDesKu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal / State */}
      {submittedSuccessfully && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-100">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Lamaran Berhasil Dikirim!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Berkas Anda telah terverifikasi dan diteruskan ke tim rekrutmen <strong>{job.perusahaan}</strong>. Pantau jadwal tes atau undangan wawancara di tab Riwayat Lamaran.
            </p>

            <div className="mt-6 p-4 rounded-2xl bg-sky-50 border border-sky-100 text-left space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Posisi:</span>
                <span className="font-bold text-slate-800">{job.posisi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Perusahaan:</span>
                <span className="font-semibold text-slate-700">{job.perusahaan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CV Terkirim:</span>
                <span className="font-semibold text-blue-600">{activeCvName}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                to="/smart-city/loker/profil"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Lihat Status Lamaran di Profil Saya →
              </Link>
              <Link
                to="/smart-city/loker"
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors"
              >
                Kembali ke Katalog Bursa Kerja
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};