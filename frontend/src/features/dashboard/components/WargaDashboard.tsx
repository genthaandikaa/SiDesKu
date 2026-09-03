import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  QrCode, 
  Send,
  Printer,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  FileCheck2,
  Download,
  Search,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  CreditCard,
  HeartHandshake,
  Users,
  Briefcase,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { useAuth } from '@/shared/context/AuthContext';
import { SuratRequest, SuratType, BantuanPenerima } from '@/shared/types';
import { CetakSuratModal } from './CetakSuratModal';
import { SuratTrackingModal } from './SuratTrackingModal';
import {
  DonutGauge,
  AreaSplineChart,
  BarActivityChart,
  MiniCalendarWidget,
  MetricStatCard,
} from '@/shared/components/charts';

interface WargaDashboardProps {
  activeSubmenu?: string;
  onNavigate?: (submenu: string) => void;
}

// Complete Official Catalog of Village Letters
const defaultSuratTypes: SuratType[] = [
  {
    id: 1,
    kode_surat: 'SKTP',
    nama_surat: 'Surat Pengantar Pembuatan / Rekam KTP-el',
    format_nomor: '471/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto Kartu Keluarga (KK)', 'Surat Pengantar RT/RW', 'KTP Lama (bila rusak/ganti)'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 2,
    kode_surat: 'SKKK',
    nama_surat: 'Surat Pengantar Kartu Keluarga (KK Baru / Perubahan)',
    format_nomor: '472/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KK Asli Lama', 'Buku Nikah / Akta Cerai', 'Surat Keterangan Lahir / Pindah'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 3,
    kode_surat: 'SKTM',
    nama_surat: 'Surat Keterangan Tidak Mampu (SKTM)',
    format_nomor: '401/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto KTP Pemohon', 'Foto Kartu Keluarga', 'Surat Pengantar RT'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 4,
    kode_surat: 'SKD',
    nama_surat: 'Surat Keterangan Domisili Warga / Lembaga',
    format_nomor: '470/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto KTP', 'Foto KK'],
    masa_berlaku_hari: 90,
    is_active: true,
  },
  {
    id: 5,
    kode_surat: 'SKU',
    nama_surat: 'Surat Keterangan Usaha (SKU)',
    format_nomor: '503/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto KTP', 'Foto KK', 'Foto Tempat/Aktivitas Usaha'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 6,
    kode_surat: 'SKCK',
    nama_surat: 'Surat Pengantar SKCK (Catatan Kepolisian)',
    format_nomor: '300/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto KTP', 'Foto KK', 'Pas Foto 4x6'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 7,
    kode_surat: 'SKL',
    nama_surat: 'Surat Keterangan Kelahiran / Pengantar Akta Lahir',
    format_nomor: '474.1/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Surat Keterangan Lahir Bidan/RS', 'KTP Ayah & Ibu', 'Buku Nikah Asli', 'KK Asli'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 8,
    kode_surat: 'SKM',
    nama_surat: 'Surat Keterangan Kematian / Pengantar Akta Kematian',
    format_nomor: '474.3/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Surat Kematian RS / Saksi RT', 'KTP & KK Almarhum', 'KTP Pelapor'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 9,
    kode_surat: 'SKBM',
    nama_surat: 'Surat Keterangan Belum Pernah Menikah (Model N1-N4)',
    format_nomor: '474.2/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP Pemohon', 'KK Asli', 'Pernyataan Belum Menikah Bermaterai'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 10,
    kode_surat: 'SKP',
    nama_surat: 'Surat Pengantar Pindah Domisili (SKPWNI)',
    format_nomor: '475/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP & KK Asli', 'Alamat Tujuan Lengkap', 'Surat Bebas Tanggungan RT'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 11,
    kode_surat: 'SKBN',
    nama_surat: 'Surat Keterangan Beda Nama (Ijazah / KTP / KK)',
    format_nomor: '470/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP & KK Asli', 'Dokumen/Ijazah Beda Nama', 'Surat Pengantar RT'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 12,
    kode_surat: 'SKPH',
    nama_surat: 'Surat Keterangan Penghasilan Orang Tua / Wali',
    format_nomor: '401/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP Orang Tua', 'KK Asli', 'Rincian Penghasilan / Slip Usaha'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 13,
    kode_surat: 'SKAW',
    nama_surat: 'Surat Keterangan Ahli Waris',
    format_nomor: '470/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Surat Kematian Almarhum', 'Buku Nikah / Akta Cerai', 'KTP & KK Ahli Waris'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 14,
    kode_surat: 'SKIK',
    nama_surat: 'Surat Pengantar Izin Keramaian / Hajatan Warga',
    format_nomor: '300/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP Tuan Rumah', 'Surat Persetujuan Tetangga Sekitar', 'Rekomendasi RT/RW'],
    masa_berlaku_hari: 14,
    is_active: true,
  },
];

export const WargaDashboard: React.FC<WargaDashboardProps> = ({ activeSubmenu = 'beranda', onNavigate }) => {
  const { user } = useAuth();
  const [surats, setSurats] = useState<SuratRequest[]>([]);
  const [types, setTypes] = useState<SuratType[]>(defaultSuratTypes);
  const [bansos, setBansos] = useState<BantuanPenerima[]>([]);
  const [kasSummary, setKasSummary] = useState<any>(null);
  const [desa, setDesa] = useState<any>(null);
  
  // Search and category filters for Ajukan Surat
  const [suratSearch, setSuratSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | 'Kependudukan' | 'Sosial' | 'Keluarga' | 'Usaha' | 'Hukum'>('Semua');
  const [historySearch, setHistorySearch] = useState('');

  // Form State for Ajukan Surat
  const [selectedTypeId, setSelectedTypeId] = useState<number>(1);
  const [keperluan, setKeperluan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Print Letter & Tracking Detail Modals
  const [printSurat, setPrintSurat] = useState<SuratRequest | null>(null);
  const [selectedTrackingSurat, setSelectedTrackingSurat] = useState<SuratRequest | null>(null);

  // New Aduan State
  const [aduanJudul, setAduanJudul] = useState('');
  const [aduanKategori, setAduanKategori] = useState('Infrastruktur');
  const [aduanDeskripsi, setAduanDeskripsi] = useState('');

  // Active sub tab on Beranda
  const [berandaTab, setBerandaTab] = useState<'surat_aktif' | 'bansos' | 'kas' | 'aduan'>('surat_aktif');

  useEffect(() => {
    fetchWargaData();
  }, []);

  const fetchWargaData = async () => {
    try {
      const [suratRes, typesRes, bansosRes, kasRes, desaRes] = await Promise.all([
        api.get('/surats'),
        api.get('/surat-types'),
        api.get('/bansos'),
        api.get('/kas-rt'),
        api.get('/settings/desa'),
      ]);

      if (suratRes.data?.success && suratRes.data.data) setSurats(suratRes.data.data);
      if (typesRes.data?.success && typesRes.data.data?.length > 0) {
        setTypes(typesRes.data.data);
      }
      if (bansosRes.data?.success && bansosRes.data.data) setBansos(bansosRes.data.data);
      if (kasRes.data?.success) setKasSummary(kasRes.data);
      if (desaRes.data?.success && desaRes.data.data) setDesa(desaRes.data.data);
    } catch {
      //
    }
  };

  const handleCreateSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypeId || !keperluan.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/surats', {
        surat_type_id: selectedTypeId,
        keperluan: keperluan.trim(),
      });
      if (res.data?.success) {
        setSubmitSuccess(true);
        setKeperluan('');
        fetchWargaData();
      }
    } catch (err: any) {
      alert('Gagal mengajukan surat: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const p = user?.warga_profile;

  // Filter letter types by search and category
  const filteredTypes = types.filter((t) => {
    const matchSearch = t.nama_surat.toLowerCase().includes(suratSearch.toLowerCase()) ||
                        t.kode_surat.toLowerCase().includes(suratSearch.toLowerCase()) ||
                        (t.persyaratan_json && t.persyaratan_json.some(p => p.toLowerCase().includes(suratSearch.toLowerCase())));

    if (!matchSearch) return false;

    if (selectedCategory === 'Semua') return true;
    if (selectedCategory === 'Kependudukan') return ['SKTP', 'SKKK', 'SKD', 'SKP', 'SKBN'].includes(t.kode_surat);
    if (selectedCategory === 'Sosial') return ['SKTM', 'SKPH'].includes(t.kode_surat);
    if (selectedCategory === 'Keluarga') return ['SKL', 'SKM', 'SKBM', 'SKAW'].includes(t.kode_surat);
    if (selectedCategory === 'Usaha') return ['SKU'].includes(t.kode_surat);
    if (selectedCategory === 'Hukum') return ['SKCK', 'SKIK'].includes(t.kode_surat);
    return true;
  });

  // Filtered lists
  const pendingSurats = surats.filter(s => ['pending_rt', 'pending_rw', 'processed_sekdes'].includes(s.status));
  const completedSurats = surats.filter(s => s.status === 'completed');
  const searchedHistory = surats.filter(s => 
    s.nomor_resi.toLowerCase().includes(historySearch.toLowerCase()) ||
    s.surat_type?.nama_surat.toLowerCase().includes(historySearch.toLowerCase()) ||
    s.keperluan.toLowerCase().includes(historySearch.toLowerCase())
  );

  // =========================================================================
  // VIEW 2: AJUKAN SURAT (Full Dedicated Page with 14 Types & Search Filter)
  // =========================================================================
  if (activeSubmenu === 'ajukan_surat') {
    return (
      <div className="space-y-8 animate-fade-in font-sans">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Katalog & Form Pengajuan Surat Digital
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pilih surat yang Anda butuhkan (KTP, KK, SKTM, Domisili, SKU, Akta, dll) dan isi keperluan pengurusan online tanpa perlu antre fisik.
          </p>
        </div>

        {submitSuccess && (
          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 animate-scale-up">
            <div className="flex items-center gap-2 font-black text-base">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Pengajuan Surat Berhasil Dikirim!</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Permohonan surat Anda telah otomatis masuk ke antrean verifikasi <strong>Ketua RT 01</strong>. Anda dapat memantau progresnya di menu <strong>Status Surat</strong>.
            </p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-xs"
            >
              Ajukan Surat Lain
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Surat Type Cards with Category Tabs & Search */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Header and Search */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  1. Pilih Jenis Surat ({filteredTypes.length} Tersedia)
                </div>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik nama surat: KTP, KK, SKTM, Domisili, Nikah, Pindah, Usaha..."
                  value={suratSearch}
                  onChange={(e) => setSuratSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { id: 'Semua', label: 'Semua (14)' },
                  { id: 'Kependudukan', label: '🪪 KTP & KK' },
                  { id: 'Sosial', label: '🤝 SKTM & Bansos' },
                  { id: 'Keluarga', label: '💍 Nikah & Akta' },
                  { id: 'Usaha', label: '🏪 Usaha (SKU)' },
                  { id: 'Hukum', label: '👮 SKCK & Izin' },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id as any)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all press-down ${
                      selectedCategory === c.id 
                        ? 'bg-slate-900 text-white shadow-xs' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Letter Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredTypes.length === 0 ? (
                <div className="col-span-2 p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
                  Tidak ada jenis surat yang cocok dengan kata kunci "{suratSearch}".
                </div>
              ) : (
                filteredTypes.map((t) => {
                  const isSelected = selectedTypeId === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTypeId(t.id)}
                      className={`p-4 rounded-3xl border cursor-pointer transition-all duration-200 space-y-2.5 flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-500/20' 
                          : 'bg-white border-slate-200/80 shadow-xs hover:border-emerald-300'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`w-8 h-8 rounded-2xl flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            {t.kode_surat}
                          </span>
                        </div>

                        <h4 className="font-black text-xs text-slate-900 leading-snug">
                          {t.nama_surat}
                        </h4>

                        <div className="text-[10px] text-slate-500 font-medium space-y-0.5">
                          <div className="text-slate-400 font-bold">Syarat:</div>
                          <p className="line-clamp-2 text-slate-600">
                            {t.persyaratan_json?.join(' • ') || 'KTP & KK Asli'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">Masa: {t.masa_berlaku_hari} Hari</span>
                        <span className={`font-black ${isSelected ? 'text-emerald-700 font-bold' : 'text-slate-500'}`}>
                          {isSelected ? '✓ Dipilih' : 'Pilih Surat'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Submission Form */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
              2. Lengkapi Data & Keperluan
            </div>

            <form onSubmit={handleCreateSurat} className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Surat yang Dipilih:</label>
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 font-extrabold text-xs text-emerald-900 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{types.find(t => t.id === selectedTypeId)?.nama_surat || 'Pilih jenis surat di sebelah kiri'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Pemohon (Sesuai Akun):</label>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
                  <div className="font-black text-slate-900">{p?.nama_lengkap || user?.name}</div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">NIK: {p?.nik || '3506041505840001'}</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Keperluan / Keterangan Tambahan:</label>
                <textarea
                  required
                  rows={4}
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  placeholder="Contoh: Persyaratan pembuatan KTP baru karena rusak/hilang di Kantor Kecamatan Ngasem..."
                  className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-[11px] text-emerald-900 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Jaminan Surat Sah & Bebas Biaya</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Surat diterbitkan dengan TTD elektronik & QR stempel sah resmi Pemdes Doko (Rp 0,-).
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !selectedTypeId}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all press-down disabled:opacity-50 flex items-center justify-center gap-2 hover-glow"
              >
                {isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Permohonan Surat ➔'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: STATUS SURAT (Proses Berjalan)
  // =========================================================================
  if (activeSubmenu === 'status_surat') {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pemantauan Status Surat yang Sedang Diproses
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Lacak tahapan persetujuan pengantar dari RT 01, RW 01, hingga penerbitan di Balai Desa beserta catatan petugas.
          </p>
        </div>

        {pendingSurats.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Tidak Ada Surat yang Sedang Berjalan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Semua surat yang pernah Anda ajukan telah selesai diproses atau belum ada pengajuan baru.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSurats.map((s) => (
              <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400">Resi: {s.nomor_resi}</div>
                    <h3 className="text-base font-black text-slate-900">{s.surat_type?.nama_surat}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Keperluan: {s.keperluan}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 self-start sm:self-auto">
                    {s.status === 'processed_sekdes' ? 'Tahap 3: Verifikasi Sekdes' :
                     s.status === 'pending_rw' ? 'Tahap 2: Menunggu Persetujuan RW' :
                     'Tahap 1: Menunggu Persetujuan RT'}
                  </span>
                </div>

                {/* Progress Steps Ribbon */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className={`p-2.5 rounded-2xl border font-bold ${
                    s.status !== 'pending_rt' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                  }`}>
                    1. Ketua RT 01
                  </div>
                  <div className={`p-2.5 rounded-2xl border font-bold ${
                    ['processed_sekdes', 'completed'].includes(s.status) ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 
                    s.status === 'pending_rw' ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    2. Ketua RW 01
                  </div>
                  <div className={`p-2.5 rounded-2xl border font-bold ${
                    s.status === 'completed' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                    s.status === 'processed_sekdes' ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    3. Penerbitan Sekdes
                  </div>
                </div>

                {/* Live Tracking Actions & Notes Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="text-slate-600">
                    {s.status === 'pending_rt' && '⏳ Berkas telah masuk ke antrean Ketua RT 01 dan sedang menunggu pemeriksaan.'}
                    {s.status === 'pending_rw' && '✅ Disetujui RT 01. Saat ini menunggu tanda tangan verifikasi Ketua RW 01.'}
                    {s.status === 'processed_sekdes' && '✅ Disetujui RT & RW. Dokumen siap diterbitkan oleh Sekretaris Desa.'}
                  </div>
                  <button
                    onClick={() => setSelectedTrackingSurat(s)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>Lacak Alur & Catatan Petugas</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTrackingSurat && (
          <SuratTrackingModal
            surat={selectedTrackingSurat}
            desa={desa}
            onClose={() => setSelectedTrackingSurat(null)}
            onPrint={(suratToPrint) => setPrintSurat(suratToPrint)}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: SURAT SELESAI (Siap Unduh & Cetak PDF)
  // =========================================================================
  if (activeSubmenu === 'surat_selesai') {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Surat Selesai & Dokumen Sah
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar surat resmi yang telah terbit lengkap dengan tanda tangan elektronik dan stempel QR Code.
          </p>
        </div>

        {completedSurats.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold mx-auto">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Belum Ada Surat Selesai</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Surat yang sudah disahkan oleh Sekretaris Desa akan tampil di halaman ini dan dapat langsung diunduh PDF.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {completedSurats.map((s) => (
              <div key={s.id} className="bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      RESMI TERBIT
                    </span>
                    <span className="text-xs font-mono text-slate-500">No. Surat: {s.nomor_surat_resmi || s.nomor_resi}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">{s.surat_type?.nama_surat}</h3>
                  <p className="text-xs text-slate-600">Keperluan: {s.keperluan}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTrackingSurat(s)}
                    className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                  >
                    Lihat Alur
                  </button>
                  <button
                    onClick={() => setPrintSurat(s)}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all press-down flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak / Unduh PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {printSurat && (
          <CetakSuratModal 
            surat={printSurat} 
            desa={desa} 
            onClose={() => setPrintSurat(null)} 
          />
        )}

        {selectedTrackingSurat && (
          <SuratTrackingModal
            surat={selectedTrackingSurat}
            desa={desa}
            onClose={() => setSelectedTrackingSurat(null)}
            onPrint={(suratToPrint) => setPrintSurat(suratToPrint)}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 5: RIWAYAT SURAT (Arsip Lengkap & Alasan Penolakan / Persetujuan)
  // =========================================================================
  if (activeSubmenu === 'riwayat_surat') {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Riwayat Seluruh Pengajuan Surat
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Arsip lengkap seluruh dokumen, riwayat persetujuan RT/RW, dan alasan penolakan berkas.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari resi / nama surat..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">No. Resi</th>
                  <th className="p-4">Jenis Surat</th>
                  <th className="p-4">Keperluan & Catatan Petugas</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi & Pelacakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {searchedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Tidak ada riwayat pengajuan surat yang cocok.
                    </td>
                  </tr>
                ) : (
                  searchedHistory.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-800">{s.nomor_resi}</td>
                      <td className="p-4 font-bold text-slate-900">{s.surat_type?.nama_surat}</td>
                      <td className="p-4 text-slate-600 max-w-sm">
                        <div>{s.keperluan}</div>
                        {s.status === 'rejected' && (
                          <div className="mt-1.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-bold flex items-start gap-1.5 shadow-2xs">
                            <span className="shrink-0">⚠️</span>
                            <span>
                              Alasan Penolakan: <em>"{s.catatan_penolakan || 'Berkas persyaratan belum lengkap / tidak sesuai'}"</em>
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-400">{new Date(s.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          s.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          s.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.status === 'completed' ? 'Diterima' : s.status === 'rejected' ? 'Ditolak' : 'Proses'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {s.status === 'completed' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setPrintSurat(s)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-2xs cursor-pointer"
                            >
                              Cetak
                            </button>
                            <button
                              onClick={() => setSelectedTrackingSurat(s)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                              title="Lacak Riwayat & Catatan"
                            >
                              Lacak
                            </button>
                          </div>
                        ) : s.status === 'rejected' ? (
                          <button
                            onClick={() => setSelectedTrackingSurat(s)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <span>Lihat Alasan Ditolak</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedTrackingSurat(s)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <span>Lacak Catatan RT/RW</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="sm:hidden p-4 space-y-3">
            {searchedHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada riwayat pengajuan surat yang cocok.
              </div>
            ) : (
              searchedHistory.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono text-slate-400">Resi: {s.nomor_resi}</div>
                      <h4 className="text-xs font-black text-slate-900 mt-0.5">{s.surat_type?.nama_surat}</h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      s.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      s.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {s.status === 'completed' ? 'Diterima' : s.status === 'rejected' ? 'Ditolak' : 'Proses'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold">Keperluan:</div>
                    <p>{s.keperluan}</p>

                    {s.status === 'rejected' && (
                      <div className="mt-2 p-2 rounded-xl bg-rose-100/80 border border-rose-200 text-rose-950 text-[11px] font-bold">
                        ⚠️ Alasan Penolakan: "{s.catatan_penolakan || 'Berkas persyaratan belum sesuai'}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-400 font-medium">{new Date(s.created_at).toLocaleDateString('id-ID')}</span>
                    
                    <div className="flex items-center gap-2">
                      {s.status === 'completed' && (
                        <button
                          onClick={() => setPrintSurat(s)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-xs cursor-pointer"
                        >
                          Cetak PDF
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedTrackingSurat(s)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-xs transition-colors cursor-pointer ${
                          s.status === 'rejected' ? 'bg-rose-600 text-white hover:bg-rose-700' :
                          'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {s.status === 'rejected' ? 'Alasan Penolakan' : 'Lacak Alur'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {printSurat && (
          <CetakSuratModal 
            surat={printSurat} 
            desa={desa} 
            onClose={() => setPrintSurat(null)} 
          />
        )}

        {selectedTrackingSurat && (
          <SuratTrackingModal
            surat={selectedTrackingSurat}
            desa={desa}
            onClose={() => setSelectedTrackingSurat(null)}
            onPrint={(suratToPrint) => setPrintSurat(suratToPrint)}
          />
        )}
      </div>
    );
  }

  // Sample Performance Chart & Activity Data
  const performanceData = [
    { label: 'Jan', value: 8, secondaryValue: 8, tooltipText: 'Surat Selesai' },
    { label: 'Feb', value: 12, secondaryValue: 11, tooltipText: 'Surat Selesai' },
    { label: 'Mar', value: 16, secondaryValue: 15, tooltipText: 'Surat Selesai' },
    { label: 'Apr', value: 14, secondaryValue: 14, tooltipText: 'Surat Selesai' },
    { label: 'Mei', value: 20, secondaryValue: 19, tooltipText: 'Surat Selesai' },
    { label: 'Jun', value: 24, secondaryValue: 22, tooltipText: 'Surat Selesai' },
    { label: 'Jul', value: 28, secondaryValue: 27, tooltipText: 'Surat Selesai' },
    { label: 'Agu', value: Math.max(32, surats.length * 4), secondaryValue: completedSurats.length, tooltipText: 'Surat Selesai' },
  ];

  const weeklyActivityData = [
    { label: 'Sen', value: 12 },
    { label: 'Sel', value: 18 },
    { label: 'Rab', value: 26, highlight: true },
    { label: 'Kam', value: 20 },
    { label: 'Jum', value: 34, highlight: true },
    { label: 'Sab', value: 14 },
    { label: 'Min', value: 6 },
  ];

  // =========================================================================
  // VIEW 1: BERANDA (MODERN MODULAR SAAS DASHBOARD OVERVIEW)
  // =========================================================================
  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* --- ROW 1: TOP 4 METRIC CARDS WITH CIRCULAR DONUT GAUGES --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricStatCard
          title="Total Surat Diajukan"
          value={`${surats.length} Surat`}
          subvalue="/ Kuota Bebas"
          percentage={100}
          color="emerald"
          trend="+18.5% vs bulan lalu"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Surat Diterima & Sah"
          value={`${completedSurats.length} Selesai`}
          subvalue="Siap Unduh PDF"
          percentage={surats.length > 0 ? Math.round((completedSurats.length / surats.length) * 100) : 100}
          color="teal"
          trend="100% Sah & Ber-QR"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Antrean Disposisi RT/RW"
          value={`${pendingSurats.length} Berkas`}
          subvalue="Sedang Diperiksa"
          percentage={pendingSurats.length > 0 ? 65 : 100}
          color="amber"
          trend="SLA Rata-rata < 15 Menit"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Status Bansos & PKH"
          value="KPM Aktif"
          subvalue="Tahap III 2026"
          percentage={95}
          color="sky"
          trend="Nomor Antrean: A-014"
          isPositiveTrend={true}
        />
      </div>

      {/* --- ROW 2: PERFORMANCE AREA CHART (8-COL) + MINI CALENDAR (4-COL) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left 8 Cols: Performance Overview Spline Area Chart */}
        <div className="lg:col-span-8 space-y-5">
          <AreaSplineChart
            title="Overview Efisiensi & Volume Surat"
            subtitle="Statistik Layanan Administrasi"
            data={performanceData}
            highlightValue="96.75%"
            highlightLabel="Kecepatan Penerbitan & Kepuasan Warga"
            trendText="+12.8% vs bulan lalu"
          />

          {/* Sub-grid under Chart: Weekly Bar Activity (6 Col) + Quick Actions (6 Col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BarActivityChart
              title="Aktivitas Jam Layanan"
              subtitle="Statistik Mingguan"
              data={weeklyActivityData}
              mainValue="34.30 Jam"
              mainLabel="Waktu Pelayanan Aktif Minggu Ini"
            />

            {/* Quick Action & Document Hub Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  Aksi Mandiri
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">Layanan Pintas Warga</h4>
                <p className="text-xs text-slate-500 mt-0.5">Akses cepat pembuatan surat dan pengecekan bansos.</p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate ? onNavigate('ajukan_surat') : null}
                  className="w-full p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all press-down flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Ajukan Surat Baru (12 Jenis)</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate ? onNavigate('status_surat') : null}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span>Lacak Posisi Berkas ({pendingSurats.length})</span>
                  </span>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {pendingSurats.length} Proses
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate ? onNavigate('surat_selesai') : null}
                  className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>Unduh & Cetak PDF Resmi</span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                    {completedSurats.length} Sah
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Personal Profile Card + Mini Calendar Widget */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick Profile / Personal Info Card Matching Reference */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                Identitas Akun
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                ● Aktif / Terverifikasi
              </span>
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={p?.nama_lengkap || user?.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                  {p?.nama_lengkap?.charAt(0) || user?.name?.charAt(0) || 'W'}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-sm font-black text-slate-900 leading-tight truncate">
                  {p?.nama_lengkap || user?.name}
                </h4>
                <div className="text-[11px] text-emerald-700 font-extrabold mt-0.5">
                  Warga Penduduk Tetap
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  NIK: {p?.nik || '3506041505840001'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Wilayah Domisili:</span>
                <span className="font-extrabold text-slate-900">RT 01 / RW 01</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Nomor KK:</span>
                <span className="font-mono text-slate-800">{p?.kartu_keluarga?.no_kk || '3506040101150001'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Status Iuran Kas RT:</span>
                <span className="text-emerald-700 font-black">Lunas (Agustus)</span>
              </div>
            </div>
          </div>

          {/* Mini Calendar & Agenda Widget */}
          <MiniCalendarWidget title="Jadwal & Agenda Desa" />
        </div>
      </div>

      {/* --- ROW 3: RECENT PERMOHONAN SURAT & DOKUMEN SAH TABLE --- */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
              Aktivitas Dokumen Terbaru
            </span>
            <h3 className="text-base font-black text-slate-900 mt-1">Daftar Permohonan & Surat Sah</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('riwayat_surat') : null}
              className="text-xs font-black text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Seluruh Arsip ({surats.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modern Table with Rounded Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-2xl">Nomor Resi</th>
                <th className="p-3.5">Jenis Surat</th>
                <th className="p-3.5">Keperluan</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right rounded-r-2xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {surats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Belum ada pengajuan surat. Klik "Ajukan Surat Baru" untuk memulai permohonan.
                  </td>
                </tr>
              ) : (
                surats.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-800">{s.nomor_resi}</td>
                    <td className="p-3.5 font-black text-slate-900">{s.surat_type?.nama_surat}</td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">{s.keperluan}</td>
                    <td className="p-3.5 text-slate-400 font-mono">
                      {new Date(s.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        s.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        'bg-amber-100 text-amber-900'
                      }`}>
                        {s.status === 'completed' ? 'Diterima' : s.status === 'rejected' ? 'Ditolak' : 'Proses'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {s.status === 'completed' ? (
                        <button
                          onClick={() => setPrintSurat(s)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-2xs transition-all cursor-pointer"
                        >
                          Cetak PDF
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedTrackingSurat(s)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Lacak
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTrackingSurat && (
        <SuratTrackingModal
          surat={selectedTrackingSurat}
          desa={desa}
          onClose={() => setSelectedTrackingSurat(null)}
          onPrint={(suratToPrint) => setPrintSurat(suratToPrint)}
        />
      )}

      {printSurat && (
        <CetakSuratModal 
          surat={printSurat} 
          desa={desa} 
          onClose={() => setPrintSurat(null)} 
        />
      )}

    </div>
  );
};
