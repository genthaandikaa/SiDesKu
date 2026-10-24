import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '@/shared/lib/axios';
import { PushNotificationManager } from '@/shared/components/PushNotificationManager';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Search, 
  Plus, 
  Download, 
  Eye, 
  Users, 
  Calendar, 
  Bell, 
  User, 
  MapPin, 
  Building2, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  Activity,
  HeartPulse,
  HandHeart,
  FileCheck2,
  Share2,
  Database,
  Lock,
  RefreshCw,
  Edit,
  Trash2,
  Printer,
  Camera,
  Upload,
  X,
  Paperclip,
  CreditCard,
  QrCode,
  Copy
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import { CameraUploadModal } from '@/shared/components/CameraUploadModal';
import { UserAvatar } from '@/shared/components/UserAvatar';

// Shared views (Pengumuman, Agenda, Profil, Notifikasi)

export const PengumumanView: React.FC<{ canCreate?: boolean; initialOpenCreate?: boolean }> = ({ canCreate }) => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Tab State: Warta Pengumuman vs SK Keputusan Kades
  const [activeTab, setActiveTab] = useState<'pengumuman' | 'sk_kades'>('pengumuman');
  const [skList, setSkList] = useState<any[]>([]);
  const [skLoading, setSkLoading] = useState<boolean>(false);

  // Fetch real announcements & authentic tickets from backend Laravel API
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pengumumans');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat pengumuman dari server, mencoba public endpoint:', err);
      try {
        const pubRes = await api.get('/public/pengumumans');
        if (pubRes.data?.success && Array.isArray(pubRes.data.data)) {
          setAnnouncements(pubRes.data.data);
        }
      } catch (pubErr) {
        console.error('Gagal memuat pengumuman publik:', pubErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSkKades = async () => {
    try {
      setSkLoading(true);
      const res = await api.get('/public/keputusan');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSkList(res.data.data);
      } else {
        const kadesRes = await api.get('/kades/keputusan').catch(() => null);
        if (kadesRes?.data?.success && Array.isArray(kadesRes.data.data)) {
          setSkList(kadesRes.data.data);
        }
      }
    } catch {
      const kadesRes = await api.get('/kades/keputusan').catch(() => null);
      if (kadesRes?.data?.success && Array.isArray(kadesRes.data.data)) {
        setSkList(kadesRes.data.data);
      }
    } finally {
      setSkLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (activeTab === 'sk_kades' && skList.length === 0) {
      fetchSkKades();
    }
  }, [activeTab]);

  // Lock body scroll and listen for ESC key when modal is opened
  useEffect(() => {
    if (selectedAnnouncement) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setSelectedAnnouncement(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedAnnouncement]);

  const [copiedWaText, setCopiedWaText] = useState(false);

  const generateWhatsAppText = (announcement: any) => {
    const t = announcement?.tiket;
    const namaWarga = t?.namaPenerima || user?.warga_profile?.nama_lengkap || user?.name || 'BAMBANG UTOMO';
    const nik = t?.nik || user?.warga_profile?.nik || '3506041505840001';
    const alamat = t?.alamat || 'Jl. Kenanga No. 14, RT 01 / RW 01, Dusun Doko Krajan, Desa Doko';
    const instansi = t?.subInstansi || t?.instansi || announcement.oleh || 'Pemerintah Desa Doko & Perum BULOG';

    const judulLower = (announcement.judul || '').toLowerCase();
    const isBansos = announcement.kategori === 'Bansos' || t?.isSuratUndanganResmi || judulLower.includes('bansos') || judulLower.includes('bantuan') || judulLower.includes('beras') || judulLower.includes('bulog');
    const isKerjaBakti = announcement.kategori === 'Lingkungan' || judulLower.includes('kerja bakti') || judulLower.includes('gotong royong');
    const isKtp = judulLower.includes('ktp');
    const isPosyandu = judulLower.includes('posyandu');

    if (isBansos) {
      return (
        `Undangan Resmi Penyaluran Bantuan Pangan Beras & PKH :\n\n` +
        `Nama Penerima : *${namaWarga}*\n` +
        `NIK : *${nik}*\n` +
        `Alamat : *${alamat}*\n` +
        `Agenda Acara : *${announcement.judul}*\n` +
        `Hari & Tanggal : *${t?.hariTanggal || announcement.tanggal || 'Kamis, 13 Agustus 2026'}*\n` +
        `waktu ⏰ : *${t?.jam || t?.sesi || '08:30 WIB - Selesai'}*\n` +
        `Lokasi : *${t?.tempat || t?.lokasi || 'Pendopo Balai Desa Doko'}*\n` +
        `Alokasi Bantuan : *${t?.alokasi || t?.keperluan || '30 Kg Beras CBP (Alokasi Juli - September 2026)'}*\n` +
        `Biaya Tebus : *GRATIS (Rp 0,-)*\n` +
        `No. Urut Antrean : *${t?.noUrut || 1}*\n` +
        `Kode Barcode : *${t?.barcode || t?.qrHash || '350606200801340'}*\n` +
        `No. Surat Resmi : *${t?.nomorSurat || 'UND/02/08/26/115002'}*\n\n` +
        `Catatan : *${t?.catatanBatas || 'Harap hadir tepat waktu sesuai jadwal dengan membawa KTP asli/IKD & Kartu Keluarga (KK). Jika setelah 5 hari tidak diambil tanpa keterangan, kuota bantuan akan dialihkan ke penerima pengganti.'}*\n\n` +
        `Salam hangat dari Pemerintah Desa Doko & Perum BULOG `
      );
    }

    if (isKerjaBakti) {
      return (
        `Agenda Gotong Royong & Kerja Bakti Warga Desa Doko :\n\n` +
        `Nama Warga : *${namaWarga}*\n` +
        `Wilayah : *RT 01 / RW 01 Dusun Krajan*\n` +
        `Agenda Kegiatan : *${announcement.judul}*\n` +
        `Hari & Tanggal : *${t?.hariTanggal || announcement.tanggal || 'Minggu, 24 Agustus 2026'}*\n` +
        `waktu ⏰ : *${t?.jam || '06:30 WIB - Selesai'}*\n` +
        `Lokasi Kumpul : *${t?.tempat || 'Balai RW 01 & Saluran Air Utama'}*\n` +
        `Keperluan : *Pembersihan selokan lingkungan & pencegahan genangan air*\n` +
        `Biaya Konsumsi : *Swadaya / Kas RT (Gratis Warga)*\n` +
        `No. Urut Partisipasi : *${t?.noUrut || 1}*\n\n` +
        `Catatan : *Diharapkan membawa peralatan mandiri seperti cangkul, sabit, dan karung sampah. Mari jaga kebersihan dan keasrian lingkungan kita bersama!* \n\n` +
        `Salam hangat dari Pengurus RT 01 & RW 01 Desa Doko `
      );
    }

    if (isKtp) {
      return (
        `🪪 Jadwal Pelayanan Rekam KTP-El Keliling Dispendukcapil :\n\n` +
        `Nama Pemohon : *${namaWarga}*\n` +
        `NIK : *${nik}*\n` +
        `agenda layanan 🪪 : *${announcement.judul}*\n` +
        `Hari & Tanggal : *${t?.hariTanggal || announcement.tanggal || 'Senin, 17 Agustus 2026'}*\n` +
        `waktu ⏰ : *${t?.jam || '08:30 - 14:00 WIB'}*\n` +
        `Lokasi : *${t?.tempat || 'Ruang Pelayanan Balai Desa Doko'}*\n` +
        `Persyaratan Berkas : *Fotokopi KK, Akta Kelahiran & berpakaian rapi berkerah*\n` +
        `Biaya Retribusi : *GRATIS (Rp 0,-)*\n` +
        `No. Urut Antrean : *${t?.noUrut || 1}*\n` +
        `Kode Barcode : *${t?.barcode || '350606200800001'}*\n\n` +
        `Catatan : *Layanan jemput bola resmi tanpa calo. Harap hadir tepat waktu sesuai jadwal agar pelayanan berjalan lancar.* \n\n` +
        `Salam hangat dari Dispendukcapil Kab. Kediri & Pemdes Doko `
      );
    }

    if (isPosyandu) {
      return (
        `Jadwal Layanan Posyandu Balita & Kesehatan Lansia :\n\n` +
        `Nama Peserta : *${namaWarga}*\n` +
        `Kegiatan : *${announcement.judul}*\n` +
        `Hari & Tanggal : *${t?.hariTanggal || announcement.tanggal || 'Sabtu, 22 Agustus 2026'}*\n` +
        `waktu ⏰ : *${t?.jam || '08:00 - 11:30 WIB'}*\n` +
        `Lokasi Posyandu : *${t?.tempat || 'Balai RT 01 / Posyandu Cempaka'}*\n` +
        `layanan medis 🩺 : *Penimbangan balita, imunisasi & cek tensi darah lansia*\n` +
        `Biaya Pemeriksaan : *GRATIS (Rp 0,-)*\n` +
        `No. Urut Antrean : *${t?.noUrut || 1}*\n\n` +
        `Catatan : *Jangan lupa membawa Buku KIA/KMS balita atau kartu kontrol lansia.* \n\n` +
        `Salam hangat dari Tim Penggerak PKK & Bidan Desa Doko`
      );
    }

    return (
      `Pemberitahuan Warta & Pengumuman Resmi Desa Doko :\n\n` +
      `Judul Warta : *${announcement.judul}*\n` +
      `Ditujukan Kepada : *${namaWarga}*\n` +
      `Hari & Tanggal : *${t?.hariTanggal || announcement.tanggal || 'Hari Ini'}*\n` +
      `waktu ⏰ : *${t?.jam || t?.sesi || 'Waktu Setempat'}*\n` +
      `Lokasi : *${t?.tempat || t?.lokasi || 'Balai Desa Doko'}*\n` +
      `Keterangan : *${announcement.isi || t?.keperluan || 'Informasi kegiatan desa'}*\n` +
      `No. Tiket : *${t?.noUrut || 1}*\n\n` +
      `Catatan : *${t?.catatanBatas || 'Harap diperhatikan dan dipatuhi demi ketertiban serta kelancaran bersama.'}*\n\n` +
      `Salam hangat dari ${instansi} `
    );
  };

  const [newJudul, setNewJudul] = useState('');
  const [newKategori, setNewKategori] = useState('Pemberitahuan');
  const [newIsi, setNewIsi] = useState('');
  const [newLevelTarget, setNewLevelTarget] = useState('Semua');
  const [newTanggalMulai, setNewTanggalMulai] = useState(new Date().toISOString().split('T')[0]);
  const [newTanggalSelesai, setNewTanggalSelesai] = useState('');
  const [submittingPengumuman, setSubmittingPengumuman] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleCreatePengumuman = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    if (!newJudul.trim() || !newIsi.trim()) {
      setCreateError('Judul dan isi pengumuman wajib diisi.');
      return;
    }
    try {
      setSubmittingPengumuman(true);
      const res = await api.post('/pengumumans', {
        judul: newJudul,
        kategori: newKategori,
        isi: newIsi,
        level_target: newLevelTarget,
        tanggal_mulai: newTanggalMulai,
        tanggal_selesai: newTanggalSelesai || null,
        is_draft: false,
      });
      if (res.data.success) {
        setShowCreateModal(false);
        setNewJudul('');
        setNewIsi('');
        fetchAnnouncements();
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Gagal membuat pengumuman');
    } finally {
      setSubmittingPengumuman(false);
    }
  };

  const handleShareWhatsApp = (announcement: any) => {
    const text = generateWhatsAppText(announcement);
    const cleanText = text.trim();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(cleanText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pengumuman Desa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Kabar resmi, instruksi bupati, jadwal bansos beras Bulog, dan tiket antrean kegiatan warga.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all press-down"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Pengumuman Baru</span>
          </button>
        )}
      </div>
      {/* Tab Switcher: Warta Pengumuman vs Buku Keputusan Kades */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('pengumuman')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'pengumuman'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Pengumuman Desa</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'pengumuman' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-700'
          }`}>
            {announcements.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sk_kades')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'sk_kades'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Buku Keputusan & SK Kepala Desa</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'sk_kades' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-700'
          }`}>
            {skList.length} Sah
          </span>
        </button>
      </div>

      {/* VIEW 1: Warta & Pengumuman */}
      {activeTab === 'pengumuman' && (
        <>
          {/* Loading Skeleton */}
          {loading && announcements.length === 0 && (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Memuat data pengumuman & tiket resmi dari database...</p>
            </div>
          )}

          {/* Announcements Grid */}
          <div className="grid grid-cols-1 gap-4">
            {announcements.map((a) => (
          <div 
            key={a.id} 
            onClick={() => setSelectedAnnouncement(a)}
            className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all space-y-3.5 cursor-pointer hover:shadow-md group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  a.status === 'Penting' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {a.kategori}
                </span>
                {a.workflow_status === 'pending_approval' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                    Menunggu Persetujuan Kades
                  </span>
                )}
                {a.workflow_status === 'draft' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-300">
                    Draf
                  </span>
                )}
                {a.workflow_status === 'published' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Terpublikasi
                  </span>
                )}
                <span className="text-xs text-slate-400 font-medium">{a.tanggal}</span>
              </div>
              <span className="text-xs font-bold text-slate-500">{a.oleh}</span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-emerald-800 transition-colors">
              {a.judul}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {a.isi}
            </p>

            {/* Quick Ticket Badge & Action Trigger */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                  {a.tiket?.isSuratUndanganResmi ? `No. Urut: ${a.tiket.noUrut || a.tiket.nomorAntrean}` : `Antrean: ${a.tiket?.nomorAntrean}`}
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  {a.tiket?.tempat || a.tiket?.lokasi}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAnnouncement(a);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-2xs transition-all press-down"
              >
                <span>Buka Tiket & Detail Undangan</span>
              </button>
            </div>
          </div>
        ))}
          </div>
        </>
      )}

      {/* VIEW 2: Buku Keputusan & SK Kepala Desa */}
      {activeTab === 'sk_kades' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-sm text-slate-900">Buku Register Produk Hukum & SK Kepala Desa Doko</h3>
              <p className="text-xs text-slate-500">Transparansi ketetapan kebijakan, regulasi, dan penetapan penerima bantuan resmi desa.</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
              {skList.length} Ketetapan Sah
            </span>
          </div>

          {skLoading && skList.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-500">Memuat data keputusan resmi Kepala Desa...</p>
            </div>
          ) : skList.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
              Belum ada ketetapan SK Kepala Desa yang dipublikasikan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skList.map((sk) => (
                <div
                  key={sk.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {sk.nomor_sk}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
                      {sk.status || 'Berlaku'}
                    </span>
                  </div>
                  <h3 className="font-black text-sm text-slate-900 leading-snug">{sk.tentang}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{sk.keterangan}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Kategori: <strong className="text-slate-700">{sk.kategori}</strong></span>
                    <span>Ditetapkan: {sk.tanggal_tetap}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Detail Warta & Tiket Undangan Resmi */}
      {selectedAnnouncement && createPortal(
        <div 
          data-interactive-modal="true"
          className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 animate-fade-in bg-slate-950/75 font-sans overflow-y-auto print:hidden interactive-modal-portal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedAnnouncement(null);
          }}
        >
          <div 
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-scale-up border border-slate-200 flex flex-col my-auto max-h-[90vh] print:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Floating Close Button */}
            <button 
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-4 right-4 z-30 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer bg-white/90 shadow-2xs border border-slate-200"
              title="Tutup (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Body: ONLY FULL STRUK (NO DUPLICATE HEADERS) */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* REPLIKA RESMI SURAT UNDANGAN / STRUK RESMI DESA */}
              <div className="bg-white rounded-2xl border-2 border-dashed border-slate-400 p-5 sm:p-7 shadow-xs space-y-4 font-sans text-slate-900 relative print:border-black">
                
                {/* Official Header */}
                <div className="border-b-2 border-dashed border-slate-300 pb-3 text-center space-y-0.5">
                  <div className="text-xs sm:text-sm font-black tracking-widest uppercase text-slate-900 leading-tight">
                    {selectedAnnouncement.tiket?.headerTitle || 'SURAT UNDANGAN RESMI'}
                  </div>
                  <div className="text-sm sm:text-base font-black tracking-tight uppercase text-slate-900 leading-tight">
                    {selectedAnnouncement.tiket?.headerSub1 || selectedAnnouncement.judul}
                  </div>
                  <div className="text-xs sm:text-sm font-black tracking-tight uppercase text-slate-900 leading-tight">
                    {selectedAnnouncement.tiket?.headerSub2 || 'PEMERINTAH DESA DOKO • KECAMATAN NGASEM'}
                  </div>
                </div>

                {/* Region Metadata Table 2 Columns */}
                <div className="grid grid-cols-2 gap-3 text-[11px] sm:text-xs text-slate-800 font-medium border-b border-slate-200 pb-2.5">
                  <div className="space-y-0.5">
                    <div className="flex"><span className="w-24 text-slate-500">Provinsi</span><span className="font-bold">: {selectedAnnouncement.tiket?.provinsi || 'JAWA TIMUR'}</span></div>
                    <div className="flex"><span className="w-24 text-slate-500">Kecamatan</span><span className="font-bold">: {selectedAnnouncement.tiket?.kecamatan || 'Ngasem'}</span></div>
                  </div>
                  <div className="space-y-0.5 sm:pl-4">
                    <div className="flex"><span className="w-28 text-slate-500">Kabupaten/Kota</span><span className="font-bold">: {selectedAnnouncement.tiket?.kabupaten || 'KAB. KEDIRI'}</span></div>
                    <div className="flex"><span className="w-28 text-slate-500">Kelurahan/Desa</span><span className="font-bold">: {selectedAnnouncement.tiket?.desa || 'Doko'}</span></div>
                  </div>
                </div>

                {/* Letter Date */}
                <div className="text-right text-[11px] sm:text-xs text-slate-600 font-medium pt-0.5">
                  {selectedAnnouncement.tiket?.tanggalSurat || `Kab. Kediri, ${selectedAnnouncement.tanggal}`}
                </div>

                {/* Letter Identification & Recipient Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100">
                  <div className="space-y-1 pt-1">
                    <div className="flex"><span className="w-16 text-slate-500">Nomor</span><span className="font-mono font-bold">: {selectedAnnouncement.tiket?.nomorSurat || `UND/${String(selectedAnnouncement.id).padStart(2, '0')}/08/26`}</span></div>
                    <div className="flex"><span className="w-16 text-slate-500">Perihal</span><span className="font-bold uppercase">: {selectedAnnouncement.tiket?.perihal || 'UNDANGAN'}</span></div>
                  </div>
                  <div className="space-y-0.5 sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-none border-slate-200">
                    <div className="text-slate-500 text-[11px]">Kepada Yth :</div>
                    <div className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                      {selectedAnnouncement.tiket?.namaPenerima || user?.warga_profile?.nama_lengkap || user?.name || 'BAMBANG UTOMO'}
                    </div>
                    <div className="text-[11px] font-mono text-slate-600">
                      NIK: {selectedAnnouncement.tiket?.nikMasked || user?.warga_profile?.nik || '******1505840001'}
                    </div>
                    <div className="text-slate-400">-</div>
                    <div className="text-xs font-bold text-slate-700">
                      Alamat: {selectedAnnouncement.tiket?.alamat || 'RT 01 / RW 01, Dusun Doko Krajan, Desa Doko'}
                    </div>
                  </div>
                </div>

                {/* Body Invitation */}
                <div className="text-xs sm:text-sm space-y-1.5 pt-2 border-t border-slate-200">
                  <p className="text-slate-700 font-medium">
                    Mengharapkan kehadiran Bapak/Ibu/Saudara besok pada :
                  </p>
                  <div className="pl-2 sm:pl-4 space-y-1 text-xs sm:text-sm text-slate-800">
                    <div className="flex"><span className="w-28 text-slate-500 shrink-0">Hari/Tanggal</span><span className="font-bold">: {selectedAnnouncement.tiket?.hariTanggal || selectedAnnouncement.tanggal}</span></div>
                    <div className="flex"><span className="w-28 text-slate-500 shrink-0">Jam</span><span className="font-bold">: {selectedAnnouncement.tiket?.jam || selectedAnnouncement.tiket?.sesi || '08.30 WIB - Selesai'}</span></div>
                    <div className="flex"><span className="w-28 text-slate-500 shrink-0">Tempat</span><span className="font-bold uppercase">: {selectedAnnouncement.tiket?.tempat || selectedAnnouncement.tiket?.lokasi || 'PENDOPO BALAI DESA DOKO'}</span></div>
                    <div className="flex items-start">
                      <span className="w-28 text-slate-500 shrink-0">Keperluan</span>
                      <span className="font-bold text-emerald-900 leading-snug">
                        : {selectedAnnouncement.tiket?.keperluan || selectedAnnouncement.isi}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Persyaratan */}
                <div className="text-[11px] sm:text-xs space-y-1 pt-2 text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="font-extrabold text-slate-900 uppercase tracking-wide">
                    Persyaratan :
                  </div>
                  <ol className="list-decimal pl-4 space-y-0.5 text-slate-700 leading-relaxed">
                    {selectedAnnouncement.tiket?.persyaratan && selectedAnnouncement.tiket.persyaratan.length > 0 ? (
                      selectedAnnouncement.tiket.persyaratan.map((syarat: string, sIdx: number) => (
                        <li key={sIdx}>{syarat.replace(/^[0-9]+\.\s*/, '')}</li>
                      ))
                    ) : (
                      <>
                        <li>Membawa surat undangan ini</li>
                        <li>Membawa KTP asli / IKD</li>
                        <li>Membawa Kartu Keluarga (KK) asli</li>
                      </>
                    )}
                  </ol>
                </div>

                {/* Catatan Batas */}
                <div className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/90 font-medium leading-relaxed">
                  <p>{selectedAnnouncement.tiket?.catatanBatas || 'Harap hadir tepat waktu sesuai jadwal demi kelancaran kegiatan bersama. Atas kerja sama dan partisipasinya kami ucapkan terima kasih.'}</p>
                </div>

                {/* Footer: QR Code Barcode + No Urut + Instansi Signature */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t-2 border-dashed border-slate-300">
                  <div className="text-center space-y-1">
                    <div className="bg-white p-2 rounded-xl border border-slate-300 inline-block shadow-2xs">
                      <img
                        src={`/api/public/surat/qr?data=${selectedAnnouncement.tiket?.barcode || selectedAnnouncement.tiket?.qrHash || '350606200800001'}`}
                        alt={`Barcode ${selectedAnnouncement.tiket?.barcode || selectedAnnouncement.tiket?.qrHash || '350606200800001'}`}
                        className="w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain"
                        onError={(e: any) => {
                          e.currentTarget.src = `http://127.0.0.1:8000/api/public/surat/qr?data=${selectedAnnouncement.tiket?.barcode || selectedAnnouncement.tiket?.qrHash || '350606200800001'}`;
                        }}
                      />
                      <div className="text-xs font-mono font-black text-slate-900 tracking-wider mt-1">
                        {selectedAnnouncement.tiket?.barcode || selectedAnnouncement.tiket?.qrHash || '350606200800001'}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">Kode Barcode Terdaftar Resmi</div>
                  </div>

                  <div className="text-center sm:text-right space-y-1.5">
                    <div className="text-xs text-slate-600 font-medium">
                      <div>Hormat Kami,</div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        {selectedAnnouncement.tiket?.subInstansi || selectedAnnouncement.tiket?.instansi || selectedAnnouncement.oleh || 'Pemerintah Desa Doko'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        Penyelenggara Pelayanan & Kegiatan Desa
                      </div>
                    </div>
                    <div className="pt-1.5">
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        No. Urut
                      </div>
                      <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900">
                        {selectedAnnouncement.tiket?.noUrut || (announcements.findIndex(x => x.id === selectedAnnouncement.id) + 1)}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 shrink-0">
              {/* WhatsApp Sharing Actions - Only for authorized village officers (Sekdes, Admin, Kades) */}
              {Boolean(['sekdes', 'kades', 'admin', 'admin_desa'].includes(typeof user?.role === 'string' ? user.role : (user?.role as any)?.slug || '')) && (
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(selectedAnnouncement)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all press-down cursor-pointer"
                  >
                    <span>Kirim WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const text = generateWhatsAppText(selectedAnnouncement);
                      navigator.clipboard.writeText(text);
                      setCopiedWaText(true);
                      setTimeout(() => setCopiedWaText(false), 2500);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer border border-slate-300 shadow-2xs"
                    title="Salin isi teks format WhatsApp"
                  >
                    {copiedWaText ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Salin Format WA</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Document & Dialog Actions */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-extrabold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Cetak / Unduh </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Tutup</span>
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Official Print Portal for 1-Page A4 Authentic Surat Undangan / Struk */}
      {selectedAnnouncement && createPortal(
        <div id="surat-undangan-print-portal" className="hidden print:block font-sans text-black bg-white w-full">
          <div className="border-2 border-dashed border-black p-6 space-y-3.5 w-full mx-auto text-black bg-white">
            {/* Official Header */}
            <div className="border-b-2 border-slate-700 pb-2.5 text-center space-y-0.5">
              <div className="text-[13px] font-black tracking-widest uppercase leading-tight">
                {selectedAnnouncement.tiket?.headerTitle || 'SURAT UNDANGAN RESMI'}
              </div>
              <div className="text-[15px] font-black tracking-tight uppercase leading-tight">
                {selectedAnnouncement.tiket?.headerSub1 || selectedAnnouncement.judul}
              </div>
              <div className="text-[13px] font-black tracking-tight uppercase leading-tight">
                {selectedAnnouncement.tiket?.headerSub2 || 'PEMERINTAH DESA DOKO • KECAMATAN NGASEM'}
              </div>
            </div>

            {/* Region Metadata Table 2 Columns */}
            <div className="grid grid-cols-2 gap-4 text-[12px] font-semibold text-black border-b border-slate-700 pb-2">
              <div className="space-y-0.5">
                <div className="flex"><span className="w-24 text-slate-700">Provinsi</span><span>: {selectedAnnouncement.tiket?.provinsi || 'JAWA TIMUR'}</span></div>
                <div className="flex"><span className="w-24 text-slate-700">Kecamatan</span><span>: {selectedAnnouncement.tiket?.kecamatan || 'Ngasem'}</span></div>
              </div>
              <div className="space-y-0.5">
                <div className="flex"><span className="w-28 text-slate-700">Kabupaten/Kota</span><span>: {selectedAnnouncement.tiket?.kabupaten || 'KAB. KEDIRI'}</span></div>
                <div className="flex"><span className="w-28 text-slate-700">Kelurahan/Desa</span><span>: {selectedAnnouncement.tiket?.desa || 'Doko'}</span></div>
              </div>
            </div>

            {/* Date on Right */}
            <div className="text-right text-[12px] text-slate-800 font-medium">
              {selectedAnnouncement.tiket?.tanggalSurat || `Kab. Kediri, ${selectedAnnouncement.tanggal}`}
            </div>

            {/* Letter Identification & Recipient Box */}
            <div className="grid grid-cols-2 gap-4 text-[12px] pt-0.5">
              <div className="space-y-1">
                <div className="flex"><span className="w-16 text-slate-700">Nomor</span><span className="font-mono font-bold">: {selectedAnnouncement.tiket?.nomorSurat || `UND/${String(selectedAnnouncement.id).padStart(2, '0')}/08/26`}</span></div>
                <div className="flex"><span className="w-16 text-slate-700">Perihal</span><span className="font-bold uppercase">: {selectedAnnouncement.tiket?.perihal || 'UNDANGAN'}</span></div>
              </div>
              <div className="space-y-0.5 text-left">
                <div className="text-slate-700">Kepada Yth :</div>
                <div className="text-[14px] font-black text-black uppercase tracking-wide">
                  {selectedAnnouncement.tiket?.namaPenerima || user?.warga_profile?.nama_lengkap || user?.name || 'BAMBANG UTOMO'}
                </div>
                <div className="font-mono text-slate-800 font-bold">
                  {selectedAnnouncement.tiket?.nikMasked || user?.warga_profile?.nik || '******1505840001'}
                </div>
                <div className="text-slate-600">-</div>
                <div className="font-bold text-slate-900">
                  {selectedAnnouncement.tiket?.alamat || 'RT 01 / RW 01, Dusun Doko Krajan, Desa Doko'}
                </div>
              </div>
            </div>

            {/* Invitation Body */}
            <div className="text-[12px] space-y-1 pt-1">
              <p className="font-medium text-black">
                Mengharapkan kehadiran Bapak/Ibu/Saudara besok pada :
              </p>
              <div className="pl-3 space-y-1 text-black font-medium">
                <div className="flex"><span className="w-28 text-slate-700 shrink-0">Hari/Tanggal</span><span className="font-bold">: {selectedAnnouncement.tiket?.hariTanggal || selectedAnnouncement.tanggal}</span></div>
                <div className="flex"><span className="w-28 text-slate-700 shrink-0">Jam</span><span className="font-bold">: {selectedAnnouncement.tiket?.jam || selectedAnnouncement.tiket?.sesi || '08.30 WIB - Selesai'}</span></div>
                <div className="flex"><span className="w-28 text-slate-700 shrink-0">Tempat</span><span className="font-bold uppercase">: {selectedAnnouncement.tiket?.tempat || selectedAnnouncement.tiket?.lokasi || 'KANTOR BALAI DESA DOKO'}</span></div>
                <div className="flex items-start">
                  <span className="w-28 text-slate-700 shrink-0">Keperluan</span>
                  <span className="leading-snug">
                    : {selectedAnnouncement.tiket?.keperluan || selectedAnnouncement.isi}
                  </span>
                </div>
              </div>
            </div>

            {/* 6 Requirements */}
            <div className="text-[11px] space-y-1 pt-1 text-black">
              <div className="font-bold">Persyaratan :</div>
              <ol className="list-decimal pl-4 space-y-0.5 leading-snug">
                {selectedAnnouncement.tiket?.persyaratan && selectedAnnouncement.tiket.persyaratan.length > 0 ? (
                  selectedAnnouncement.tiket.persyaratan.map((syarat: string, sIdx: number) => (
                    <li key={sIdx}>{syarat.replace(/^[0-9]+\.\s*/, '')}</li>
                  ))
                ) : (
                  <>
                    <li>Membawa surat undangan ini</li>
                    <li>Membawa KTP asli / IKD</li>
                    <li>Membawa Kartu Keluarga (KK) asli</li>
                  </>
                )}
              </ol>
            </div>

            {/* 5-Day Expiration Note */}
            <div className="text-[11px] text-slate-900 font-medium leading-relaxed pt-1">
              <p>{selectedAnnouncement.tiket?.catatanBatas || 'Harap hadir tepat waktu sesuai jadwal demi kelancaran kegiatan bersama. Atas kerja sama dan partisipasinya kami ucapkan terima kasih.'}</p>
            </div>

            {/* Footer: QR Code Barcode + No Urut + Instansi Signature */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-300">
              <div className="text-center">
                <div className="inline-block p-1 border border-slate-400 bg-white">
                  <img
                    src={`/api/public/surat/qr?data=${selectedAnnouncement.tiket?.barcode || selectedAnnouncement.tiket?.qrHash || '350606200800001'}`}
                    alt={`Barcode Bantuan ${selectedAnnouncement.tiket?.barcode || selectedAnnouncement.tiket?.qrHash || '350606200800001'}`}
                    className="w-24 h-24 object-contain mx-auto"
                    crossOrigin="anonymous"
                  />
                  <div className="text-[11px] font-mono font-bold text-black tracking-wider mt-1">
                    {selectedAnnouncement.tiket?.barcode || selectedAnnouncement.tiket?.qrHash || '350606200800001'}
                  </div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-[12px] font-medium text-black">
                  <div>Hormat Kami,</div>
                  <div className="font-bold">{selectedAnnouncement.tiket?.subInstansi || selectedAnnouncement.tiket?.instansi || selectedAnnouncement.oleh || 'Pemerintah Desa Doko'}</div>
                  <div className="text-[10px] text-slate-600 italic">Penyelenggara Pelayanan & Kegiatan Desa</div>
                </div>
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    No. Urut
                  </div>
                  <div className="text-4xl font-black font-mono tracking-tight text-black">
                    {selectedAnnouncement.tiket?.noUrut || (announcements.findIndex(x => x.id === selectedAnnouncement.id) + 1)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Buat Pengumuman Baru (Sekdes & Admin) */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/80 overflow-y-auto animate-fade-in font-sans">
          <div 
            className="relative z-10 bg-white opacity-100 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up isolate ios-solid-modal"
            style={{ backgroundColor: '#ffffff', opacity: 1 }}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Buat Pengumuman Baru</h3>
                <p className="text-xs text-slate-500 font-medium">Draf akan diajukan ke Kepala Desa untuk persetujuan resmi.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreatePengumuman} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
                {createError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                    {createError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Judul Pengumuman *</label>
                  <input
                    type="text"
                    required
                    value={newJudul}
                    onChange={(e) => setNewJudul(e.target.value)}
                    placeholder="Contoh: Jadwal Posyandu Balita & Lansia Dusun Krajan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                    <select
                      value={newKategori}
                      onChange={(e) => setNewKategori(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600 font-medium bg-white"
                    >
                      <option value="Pemberitahuan">Pemberitahuan</option>
                      <option value="Bansos">Bantuan Sosial</option>
                      <option value="Kegiatan">Kegiatan Warga</option>
                      <option value="Lingkungan">Kebersihan Lingkungan</option>
                      <option value="Kesehatan">Kesehatan & Posyandu</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Wilayah</label>
                    <select
                      value={newLevelTarget}
                      onChange={(e) => setNewLevelTarget(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600 font-medium bg-white"
                    >
                      <option value="Semua">Seluruh Desa</option>
                      <option value="Dusun">Tingkat Dusun</option>
                      <option value="RW">Tingkat RW</option>
                      <option value="RT">Tingkat RT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Mulai *</label>
                    <input
                      type="date"
                      required
                      value={newTanggalMulai}
                      onChange={(e) => setNewTanggalMulai(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Selesai (Opsional)</label>
                    <input
                      type="date"
                      value={newTanggalSelesai}
                      onChange={(e) => setNewTanggalSelesai(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Isi Detail Pengumuman *</label>
                  <textarea
                    required
                    rows={4}
                    value={newIsi}
                    onChange={(e) => setNewIsi(e.target.value)}
                    placeholder="Tuliskan keterangan lengkap kegiatan, persyaratan warga, atau instruksi terkait..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-emerald-600 font-medium"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingPengumuman}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  {submittingPengumuman ? 'Menyimpan...' : 'Ajukan Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

interface AgendaItem {
  id: number | string;
  judul: string;
  waktu: string;
  tempat: string;
  peserta: string;
  tipe: string;
  tanggal?: string;
  tanggalRaw?: string;
  keterangan?: string;
  is_custom?: boolean;
}

export const AgendaDesaView: React.FC = () => {
  const { user } = useAuth();
  const roleSlug = user?.role?.slug || 'warga';
  const isRt = roleSlug === 'rt';
  const isRw = roleSlug === 'rw';
  const isExecutive = ['kades', 'sekdes', 'admin', 'admin_desa', 'super_admin'].includes(roleSlug);
  const canCreate = isExecutive || isRt || isRw;

  const defaultEvents: AgendaItem[] = [
    {
      id: 1,
      judul: isRt ? 'Rembug Warga & Musyawarah RT 01 Krajan' : 'Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes)',
      waktu: 'Rabu, 27 Agustus 2026 • 19.30 WIB',
      tempat: isRt ? 'Balai Pertemuan Warga RT 01' : 'Pendopo Balai Desa Doko',
      peserta: isRt ? 'RT' : 'Semuanya',
      tipe: 'Pemerintahan',
      tanggal: '2026-08-27',
    },
    {
      id: 2,
      judul: 'Posyandu Balita & Lansia Terpadu Dusun Krajan',
      waktu: 'Jumat, 29 Agustus 2026 • 08.30 WIB',
      tempat: 'Posyandu Melati RT 01',
      peserta: 'Warga',
      tipe: 'Kesehatan',
      tanggal: '2026-08-29',
    },
    {
      id: 3,
      judul: isRt ? 'Kerja Bakti Kebersihan Lingkungan RT 01' : 'Penyaluran BLT Dana Desa Periode Agustus',
      waktu: isRt ? 'Minggu, 30 Agustus 2026 • 06.30 WIB' : 'Senin, 31 Agustus 2026 • 08.00 WIB',
      tempat: isRt ? 'Lingkungan Gang Melati & Kenanga RT 01' : 'Ruang Pelayanan Kantor Desa',
      peserta: isRt ? 'RT' : 'Warga',
      tipe: isRt ? 'Lingkungan' : 'Sosial',
      tanggal: '2026-08-31',
    },
    {
      id: 4,
      judul: 'Penyaluran Bantuan Pangan Beras & PKH Tahap III',
      waktu: 'Senin, 31 Agustus 2026 • 08.00 WIB',
      tempat: 'Pendopo Balai Desa Doko',
      peserta: 'Warga',
      tipe: 'Sosial',
      tanggal: '2026-08-31',
    },
    {
      id: 5,
      judul: isRt ? 'Jadwal Ronda & Siskamling Bergilir RT 01' : 'Rapat Koordinasi Pengurus Wilayah RW 01',
      waktu: 'Setiap Malam • 22.00 - 04.00 WIB',
      tempat: isRt ? 'Pos Ronda Utama RT 01 Krajan' : 'Balai Warga RW 01',
      peserta: isRt ? 'RT' : 'RW',
      tipe: 'Keamanan',
      tanggal: '2026-09-01',
    },
  ];

  const [events, setEvents] = useState<AgendaItem[]>(() => {
    try {
      const saved = localStorage.getItem('sidesku_agenda_events_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return defaultEvents;
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAgenda, setEditingAgenda] = useState<AgendaItem | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<AgendaItem | null>(null);
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'Semuanya' | 'Warga' | 'RT' | 'RW'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Feedback Alert Modal State (Bermodelkan Alert: Berhasil / Gagal)
  const [feedbackAlert, setFeedbackAlert] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);

  // Auto-dismiss Feedback Alert after 4 seconds
  useEffect(() => {
    if (feedbackAlert) {
      const timer = setTimeout(() => {
        setFeedbackAlert(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackAlert]);

  // Verification for Deleting Agenda (Matches Photo #2 modal)
  const [deleteTarget, setDeleteTarget] = useState<AgendaItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    judul: '',
    tipe: 'Pemerintahan',
    peserta: 'Semuanya',
    tanggal: '',
    waktu: '08:30',
    tempat: 'Pendopo Balai Desa Doko',
    keterangan: '',
  });

  // Fetch real-time agendas from database API for all roles
  const fetchAgendas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/agendas').catch(() => api.get('/public/agendas'));
      if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setEvents(res.data.data);
        try {
          localStorage.setItem('sidesku_agenda_events_v2', JSON.stringify(res.data.data));
        } catch {
          // ignore
        }
      }
    } catch {
      // fallback to cached/default events
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendas();
  }, []);

  // Lock body scroll and handle ESC key when modal is open
  useEffect(() => {
    if (showCreateModal || selectedDetail || deleteTarget || feedbackAlert) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          if (feedbackAlert) {
            setFeedbackAlert(null);
          } else if (deleteTarget) {
            setDeleteTarget(null);
            setDeleteReason('');
          } else if (showCreateModal) {
            setShowCreateModal(false);
          } else if (selectedDetail) {
            setSelectedDetail(null);
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [showCreateModal, selectedDetail, deleteTarget, feedbackAlert]);

  const resetForm = () => {
    setForm({
      judul: '',
      tipe: 'Pemerintahan',
      peserta: isRt ? 'Warga' : isRw ? 'Warga' : 'Semuanya',
      tanggal: '',
      waktu: '08:30',
      tempat: isRt ? 'Balai Pertemuan Warga RT 01' : isRw ? 'Balai Warga RW 01' : 'Pendopo Balai Desa Doko',
      keterangan: '',
    });
    setEditingAgenda(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleOpenEdit = (agenda: AgendaItem) => {
    setEditingAgenda(agenda);
    
    // Extract time (HH:mm) from formatted string if needed
    let extractedTime = '08:30';
    const timeMatch = agenda.waktu.match(/(\d{1,2})[:.](\d{2})/);
    if (timeMatch) {
      extractedTime = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    }

    let extractedDate = agenda.tanggal || '';
    if (!extractedDate && agenda.waktu) {
      const todayIso = new Date().toISOString().split('T')[0];
      extractedDate = todayIso;
    }

    setForm({
      judul: agenda.judul,
      tipe: agenda.tipe || 'Pemerintahan',
      peserta: agenda.peserta || 'Semuanya',
      tanggal: extractedDate,
      waktu: extractedTime,
      tempat: agenda.tempat,
      keterangan: agenda.keterangan || '',
    });

    if (selectedDetail) setSelectedDetail(null);
    setShowCreateModal(true);
  };

  const handleSaveAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.judul.trim() || !form.tanggal || !form.tempat.trim()) {
      setFeedbackAlert({
        type: 'error',
        title: 'Data Belum Lengkap',
        message: 'Mohon lengkapi judul kegiatan, tanggal pelaksanaan, dan lokasi.',
      });
      return;
    }

    const timeDisplay = form.waktu ? (form.waktu.includes('WIB') ? form.waktu : `${form.waktu} WIB`) : '08:30 WIB';
    let waktuFormatted = timeDisplay;
    try {
      const d = new Date(form.tanggal);
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const dateText = d.toLocaleDateString('id-ID', options);
      waktuFormatted = `${dateText} • ${timeDisplay}`;
    } catch {
      waktuFormatted = `${form.tanggal} • ${timeDisplay}`;
    }

    const payload = {
      judul: form.judul.trim(),
      tipe: form.tipe,
      peserta: form.peserta || 'Semuanya',
      tanggal: form.tanggal,
      waktu: waktuFormatted,
      tempat: form.tempat.trim(),
      keterangan: form.keterangan.trim(),
    };

    try {
      setSubmitting(true);
      if (editingAgenda) {
        // UPDATE
        const res = await api.put(`/agendas/${editingAgenda.id}`, payload);
        const updatedItem = res.data?.data || { ...editingAgenda, ...payload };
        setEvents((prev) => {
          const next = prev.map((item) => (item.id === editingAgenda.id ? { ...item, ...updatedItem } : item));
          try {
            localStorage.setItem('sidesku_agenda_events_v2', JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
        setFeedbackAlert({
          type: 'success',
          title: 'Berhasil Diperbarui',
          message: `Agenda kegiatan "${form.judul.trim()}" telah berhasil diperbarui di sistem kalender desa.`,
        });
      } else {
        // CREATE
        const res = await api.post('/agendas', payload);
        const createdItem = res.data?.data;
        if (createdItem) {
          setEvents((prev) => {
            const next = [createdItem, ...prev.filter((x) => x.id !== createdItem.id)];
            try {
              localStorage.setItem('sidesku_agenda_events_v2', JSON.stringify(next));
            } catch {
              // ignore
            }
            return next;
          });
        } else {
          const localAgenda: AgendaItem = {
            id: Date.now(),
            ...payload,
            is_custom: true,
          };
          setEvents((prev) => {
            const next = [localAgenda, ...prev];
            try {
              localStorage.setItem('sidesku_agenda_events_v2', JSON.stringify(next));
            } catch {
              // ignore
            }
            return next;
          });
        }
        setFeedbackAlert({
          type: 'success',
          title: 'Berhasil Ditambahkan',
          message: `Agenda baru "${form.judul.trim()}" telah berhasil dijadwalkan ke kalender desa.`,
        });
      }
    } catch (err: any) {
      setFeedbackAlert({
        type: 'error',
        title: editingAgenda ? 'Gagal Memperbarui' : 'Gagal Menambahkan',
        message: err?.response?.data?.message || (editingAgenda 
          ? 'Terjadi kendala saat memperbarui agenda kegiatan.' 
          : 'Terjadi kendala saat menambahkan agenda baru.'),
      });
    } finally {
      setSubmitting(false);
      setShowCreateModal(false);
      resetForm();
    }
  };

  // Delete Agenda Handlers (Matches Photo #2: Tolak/Hapus dengan Alasan Wajib)
  const handleRequestDelete = (agenda: AgendaItem) => {
    setDeleteTarget(agenda);
    setDeleteReason('');
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
    setDeleteReason('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !deleteReason.trim()) return;
    const targetTitle = deleteTarget.judul;
    const targetId = deleteTarget.id;
    try {
      setIsDeleting(true);
      await api.delete(`/agendas/${targetId}`);
      const updated = events.filter((ev) => ev.id !== targetId);
      setEvents(updated);
      if (selectedDetail && selectedDetail.id === targetId) {
        setSelectedDetail(null);
      }
      try {
        localStorage.setItem('sidesku_agenda_events_v2', JSON.stringify(updated));
      } catch {
        // ignore
      }
      setFeedbackAlert({
        type: 'success',
        title: 'Berhasil Dihapus',
        message: `Agenda "${targetTitle}" telah berhasil dihapus dari kalender desa.`,
      });
    } catch (err: any) {
      setFeedbackAlert({
        type: 'error',
        title: 'Gagal Menghapus',
        message: err?.response?.data?.message || 'Terjadi kesalahan saat menghapus agenda kegiatan.',
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
      setDeleteReason('');
    }
  };

  const getCategoryIcon = (tipe: string) => {
    const t = (tipe || '').toLowerCase();
    if (t.includes('kesehatan') || t.includes('posyandu')) return <HeartPulse className="w-5 h-5 text-emerald-700" />;
    if (t.includes('pemerintahan') || t.includes('musrenbang') || t.includes('rembug')) return <Building2 className="w-5 h-5 text-emerald-700" />;
    if (t.includes('sosial') || t.includes('blt') || t.includes('bansos')) return <HandHeart className="w-5 h-5 text-emerald-700" />;
    if (t.includes('lingkungan') || t.includes('kerja bakti')) return <Users className="w-5 h-5 text-emerald-700" />;
    if (t.includes('keamanan') || t.includes('ronda')) return <ShieldCheck className="w-5 h-5 text-emerald-700" />;
    return <Calendar className="w-5 h-5 text-emerald-700" />;
  };

  const getAudienceBadge = (peserta: string) => {
    const p = (peserta || '').trim();
    if (p === 'RT') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Khusus RT</span>;
    }
    if (p === 'RW') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">Khusus RW</span>;
    }
    if (p === 'RT & RW') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">RT & RW</span>;
    }
    if (p === 'Warga') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">Warga</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Semua Warga</span>;
  };

  // AUDIENCE FILTER ENFORCEMENT
  // 1. Warga NEVER sees RT or RW specific agendas
  // 2. RT does not see purely RW agendas
  // 3. RW does not see purely RT agendas
  // 4. Kades/Sekdes/Admin sees everything and can filter
  const visibleEvents = events.filter((ev) => {
    const p = (ev.peserta || '').trim();

    // Role-based visibility isolation
    if (roleSlug === 'warga') {
      if (p === 'RT' || p === 'RW' || p === 'RT & RW') return false;
      return true;
    }
    if (roleSlug === 'rt') {
      if (p === 'RW') return false;
      return true;
    }
    if (roleSlug === 'rw') {
      if (p === 'RT') return false;
      return true;
    }

    // For Executive roles (Kades/Sekdes/Admin), apply tab filter if selected
    if (audienceFilter !== 'all') {
      if (audienceFilter === 'Semuanya' && p !== 'Semuanya') return false;
      if (audienceFilter === 'Warga' && p !== 'Warga') return false;
      if (audienceFilter === 'RT' && p !== 'RT' && p !== 'RT & RW') return false;
      if (audienceFilter === 'RW' && p !== 'RW' && p !== 'RT & RW') return false;
    }

    // Past vs Upcoming Filter
    const todayStr = new Date().toISOString().split('T')[0];
    const evDateStr = (ev.tanggalRaw || ev.tanggal || '').substring(0, 10);
    const isPast = evDateStr ? evDateStr < todayStr : false;
    if (timeFilter === 'upcoming' && isPast) return false;
    if (timeFilter === 'past' && !isPast) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchJudul = ev.judul.toLowerCase().includes(q);
      const matchTempat = ev.tempat.toLowerCase().includes(q);
      const matchTipe = ev.tipe.toLowerCase().includes(q);
      if (!matchJudul && !matchTempat && !matchTipe) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isRt ? 'Agenda Kegiatan & Jadwal Rapat RT 01' : isRw ? 'Agenda Kegiatan & Koordinasi Wilayah RW 01' : 'Agenda Kegiatan & Jadwal Rapat Desa'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isRt 
              ? 'Kalender kegiatan musyawarah warga RT 01 Krajan, jadwal posyandu, kerja bakti, siskamling, dan koordinasi tingkat desa.'
              : isRw
              ? 'Kalender kegiatan koordinasi antar RT di lingkungan RW 01 Dusun Krajan, rapat teritorial, dan musyawarah desa.'
              : 'Kalender kegiatan musyawarah, pelayanan kesehatan, dan aktivitas sosial warga.'}
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all press-down cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Agenda Baru</span>
          </button>
        )}
      </div>

      {/* Quick Filter & Search Bar for Kades/Admin & Officers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Audience Filter Tabs (Only shown for Admin/Kades/Sekdes) */}
        {isExecutive ? (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setAudienceFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                audienceFilter === 'all'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({events.length})
            </button>
            <button
              type="button"
              onClick={() => setAudienceFilter('Semuanya')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                audienceFilter === 'Semuanya'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Warga
            </button>
            <button
              type="button"
              onClick={() => setAudienceFilter('RT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                audienceFilter === 'RT'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Khusus RT
            </button>
            <button
              type="button"
              onClick={() => setAudienceFilter('RW')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                audienceFilter === 'RW'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
              }`}
            >
              Khusus RW
            </button>
            <button
              type="button"
              onClick={() => setAudienceFilter('Warga')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                audienceFilter === 'Warga'
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
              }`}
            >
              Warga Umum
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Menampilkan {visibleEvents.length} agenda untuk Anda</span>
          </div>
        )}

        {/* Time Status Filter (Akan Datang vs Riwayat Selesai) & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setTimeFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                timeFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('upcoming')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                timeFilter === 'upcoming' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mendatang
            </button>
            <button
              type="button"
              onClick={() => setTimeFilter('past')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                timeFilter === 'past' ? 'bg-slate-700 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Riwayat Selesai
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari agenda/lokasi..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-emerald-600 bg-slate-50/60"
            />
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && events.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Memuat data agenda desa dari database...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && visibleEvents.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">Tidak ada agenda kegiatan yang ditemukan</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery 
              ? `Tidak ditemukan agenda yang cocok dengan kata kunci "${searchQuery}".` 
              : 'Belum ada agenda kegiatan yang dijadwalkan untuk kategori ini.'}
          </p>
        </div>
      )}

      {/* Events Grid (Read) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {visibleEvents.map((ev) => {
          const todayStr = new Date().toISOString().split('T')[0];
          const evDateStr = (ev.tanggalRaw || ev.tanggal || '').substring(0, 10);
          const isItemPast = evDateStr ? evDateStr < todayStr : false;

          return (
          <div
            key={ev.id}
            onClick={() => setSelectedDetail(ev)}
            className={`bg-white p-6 rounded-3xl border shadow-xs flex flex-col justify-between transition-all hover:shadow-md h-full space-y-4 relative group cursor-pointer ${
              isItemPast
                ? 'border-slate-200/60 bg-slate-50/30 opacity-90'
                : 'border-slate-200/80 hover:border-emerald-300'
            }`}
          >
            {/* Quick Actions (Update & Delete) for authorized officers */}
            {canCreate && (
              <div 
                className="absolute top-4 right-4 flex items-center gap-1 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => handleOpenEdit(ev)}
                  title="Ubah agenda ini"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestDelete(ev)}
                  title="Hapus agenda ini"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="space-y-4 flex-1 flex flex-col">
              {/* Green Icon Box with Category Logo */}
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100/70 flex items-center justify-center font-bold shrink-0">
                {getCategoryIcon(ev.tipe)}
              </div>

              <div className="space-y-1 flex-1 flex flex-col justify-start">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase inline-block">
                    {ev.tipe}
                  </span>
                  {getAudienceBadge(ev.peserta)}
                  {isItemPast ? (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                      Riwayat Selesai
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      Mendatang
                    </span>
                  )}
                  {ev.is_custom && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Baru
                    </span>
                  )}
                </div>
                {/* min-h-[3rem] ensures 1-line titles match 2-line titles in vertical height */}
                <h3 className="text-base font-black text-slate-900 leading-snug pt-1 min-h-[3rem] flex items-start group-hover:text-emerald-800 transition-colors">
                  {ev.judul}
                </h3>
              </div>
            </div>

            {/* Bottom Details Section aligned horizontally with mt-auto */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100 font-medium mt-auto">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{ev.waktu}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{ev.tempat}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Sasaran: {ev.peserta || 'Semuanya'}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>

      {/* DETAIL MODAL (Read) - iOS Safari Safe & Scrollable */}
      {selectedDetail && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 font-sans overflow-y-auto select-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDetail(null);
          }}
        >
          <div 
            className="relative z-10 bg-white opacity-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-auto max-h-[90vh] overflow-y-auto animate-scale-up isolate ios-solid-modal"
            style={{ backgroundColor: '#ffffff', opacity: 1, WebkitOverflowScrolling: 'touch' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  {getCategoryIcon(selectedDetail.tipe)}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Detail Agenda Kegiatan</span>
                  <h3 className="text-base font-bold text-gray-900 leading-tight">
                    {selectedDetail.judul}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 py-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-slate-100 text-slate-700">
                  {selectedDetail.tipe}
                </span>
                {getAudienceBadge(selectedDetail.peserta)}
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Waktu & Tanggal:</span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">{selectedDetail.waktu}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Lokasi / Tempat Pelaksanaan:</span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">{selectedDetail.tempat}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Sasaran Peserta / Undangan:</span>
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">{selectedDetail.peserta || 'Semua Warga Desa'}</span>
                  </div>
                </div>
              </div>

              {selectedDetail.keterangan && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-xs space-y-1">
                  <span className="font-bold text-amber-900 block text-[11px]">Catatan / Instruksi Kegiatan:</span>
                  <p className="text-amber-800 whitespace-pre-line leading-relaxed">{selectedDetail.keterangan}</p>
                </div>
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100">
              {canCreate ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(selectedDetail)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Ubah Agenda</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRequestDelete(selectedDetail)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              ) : <div />}

              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 text-xs text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CREATE & EDIT MODAL (Create & Update) - iOS Safari Safe & Scrollable */}
      {showCreateModal && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 font-sans overflow-y-auto select-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
              resetForm();
            }
          }}
        >
          <div 
            className="relative z-10 bg-white opacity-100 rounded-3xl max-w-lg w-full p-5 sm:p-7 space-y-4 shadow-2xl border border-slate-200 my-auto max-h-[90vh] overflow-y-auto animate-scale-up isolate ios-solid-modal"
            style={{ backgroundColor: '#ffffff', opacity: 1, WebkitOverflowScrolling: 'touch' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingAgenda ? 'Ubah Jadwal & Agenda Kegiatan Desa' : 'Atur Jadwal & Agenda Kegiatan Desa'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAgenda} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Agenda / Judul Kegiatan *
                </label>
                <input
                  type="text"
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  placeholder="Contoh: Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes)"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 opacity-100 font-medium"
                  style={{ backgroundColor: '#ffffff', color: '#0f172a', opacity: 1 }}
                  required
                />
              </div>

              {/* Responsive 1 col on mobile iOS, 2 cols on tablet/desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Kategori Agenda
                  </label>
                  <select
                    value={form.tipe}
                    onChange={(e) => setForm({ ...form, tipe: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 opacity-100 min-h-[44px] font-medium"
                    style={{ backgroundColor: '#ffffff', color: '#0f172a', opacity: 1 }}
                  >
                    <option value="Pemerintahan">Pemerintahan</option>
                    <option value="Kesehatan">Kesehatan</option>
                    <option value="Sosial">Sosial</option>
                    <option value="Pembangunan">Pembangunan</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Lingkungan">Lingkungan</option>
                    <option value="Keagamaan">Keagamaan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Sasaran Peserta / Undangan
                  </label>
                  <select
                    value={form.peserta}
                    onChange={(e) => setForm({ ...form, peserta: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 opacity-100 min-h-[44px] font-medium"
                    style={{ backgroundColor: '#ffffff', color: '#0f172a', opacity: 1 }}
                  >
                    {isExecutive && (
                      <option value="Semuanya">Semuanya (Seluruh Warga & Aparatur Desa)</option>
                    )}
                    <option value="Warga">
                      {isRt ? 'Warga Lingkup RT 01' : isRw ? 'Warga Wilayah RW 01' : 'Warga (Masyarakat Umum)'}
                    </option>
                    {isRt && (
                      <option value="RT">Internal Pengurus RT 01</option>
                    )}
                    {isRw && (
                      <>
                        <option value="RW">Internal Pengurus RW 01</option>
                        <option value="RT">Pengurus RT se-Wilayah RW 01</option>
                        <option value="RT & RW">Pengurus RT & RW 01</option>
                      </>
                    )}
                    {isExecutive && (
                      <>
                        <option value="RT">Khusus Pengurus / Ketua RT</option>
                        <option value="RW">Khusus Pengurus / Ketua RW</option>
                        <option value="RT & RW">Pengurus RT & RW</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* iOS Safari Safe: Date & Time stack cleanly on mobile without touching or squishing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tanggal Kegiatan *
                  </label>
                  <input
                    type="date"
                    value={form.tanggal}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 opacity-100 min-h-[44px] box-border block font-medium"
                    style={{ backgroundColor: '#ffffff', color: '#0f172a', opacity: 1, WebkitAppearance: 'none' }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Waktu / Jam Mulai *
                  </label>
                  <input
                    type="time"
                    value={form.waktu}
                    onChange={(e) => setForm({ ...form, waktu: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 opacity-100 min-h-[44px] box-border block font-medium"
                    style={{ backgroundColor: '#ffffff', color: '#0f172a', opacity: 1, WebkitAppearance: 'none' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lokasi Pengambilan Fisik / Tempat Kegiatan *
                </label>
                <input
                  type="text"
                  value={form.tempat}
                  onChange={(e) => setForm({ ...form, tempat: e.target.value })}
                  placeholder="Pendopo Balai Desa Doko"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 opacity-100 font-medium"
                  style={{ backgroundColor: '#ffffff', color: '#0f172a', opacity: 1 }}
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  {form.peserta === 'RT' 
                    ? 'Agenda ini akan tersimpan khusus untuk Pengurus RT dan tidak akan tampil pada akun Warga umum.'
                    : form.peserta === 'RW'
                    ? 'Agenda ini akan tersimpan khusus untuk Pengurus RW.'
                    : 'Lokasi dan jadwal ini otomatis tercatat dalam kalender desa dan dapat diakses oleh seluruh sasaran peserta.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Keterangan / Catatan Tambahan (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={form.keterangan}
                  onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                  placeholder="Instruksi tambahan, perlengkapan yang perlu dibawa, dll..."
                  className="w-full px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white text-slate-900 opacity-100 font-medium"
                  style={{ backgroundColor: '#ffffff', color: '#0f172a', opacity: 1 }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl font-medium cursor-pointer shadow-xs"
                >
                  {submitting ? 'Menyimpan...' : (editingAgenda ? 'Simpan Perubahan' : 'Tambah Agenda')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL HAPUS AGENDA (PHOTO #2 STYLE: Tolak Permohonan / Hapus Agenda dengan Catatan Wajib) */}
      {deleteTarget && createPortal(
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 font-sans overflow-y-auto animate-fade-in select-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCancelDelete();
          }}
        >
          <div 
            className="relative z-10 bg-white opacity-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl my-auto max-h-[90vh] overflow-y-auto border border-slate-200 animate-scale-up isolate ios-solid-modal"
            style={{ backgroundColor: '#ffffff', opacity: 1, WebkitOverflowScrolling: 'touch' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <XCircle className="w-4 h-4" />
                </div>
                <h3 className="font-black text-xl text-gray-900">Hapus Agenda Kegiatan</h3>
              </div>
              <button 
                type="button"
                onClick={handleCancelDelete} 
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                title="Tutup (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Agenda Summary Box (Identical structure to Photo #2) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Nama Agenda:</span>
                <span className="font-bold text-slate-900 text-right max-w-[65%] truncate">{deleteTarget.judul}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Kategori:</span>
                <span className="font-bold text-slate-800">{deleteTarget.tipe || 'Umum'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Waktu & Tanggal:</span>
                <span className="font-medium text-slate-700">{deleteTarget.waktu}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Lokasi / Tempat:</span>
                <span className="font-bold text-slate-900 text-right max-w-[65%] truncate">{deleteTarget.tempat}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Sasaran Peserta:</span>
                <span className="font-bold text-slate-800">{deleteTarget.peserta || 'Semuanya'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                Alasan / Catatan Penghapusan Wajib Diisi *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Contoh: Agenda dibatalkan karena kendala teknis / jadwal diundur..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-rose-500 transition-all outline-none resize-none font-medium text-slate-900"
                style={{ backgroundColor: '#ffffff', color: '#0f172a', opacity: 1 }}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={handleCancelDelete} 
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={handleConfirmDelete} 
                disabled={isDeleting || !deleteReason.trim()}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
              >
                {isDeleting ? 'Memproses...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* FEEDBACK ALERT MODAL (BERMODELKAN ALERT: BERHASIL / GAGAL) */}
      {feedbackAlert && createPortal(
        <div 
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-950/75 animate-fade-in font-sans select-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setFeedbackAlert(null);
          }}
        >
          <div 
            className="relative z-10 bg-white opacity-100 rounded-3xl max-w-sm w-full p-6 sm:p-7 text-center space-y-4 shadow-2xl border border-slate-200 animate-scale-up isolate ios-solid-modal my-auto"
            style={{ backgroundColor: '#ffffff', opacity: 1, WebkitOverflowScrolling: 'touch' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Alert Icon with Ping/Ring */}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ${
              feedbackAlert.type === 'success'
                ? 'bg-emerald-100 text-emerald-600 ring-emerald-50'
                : 'bg-rose-100 text-rose-600 ring-rose-50'
            }`}>
              {feedbackAlert.type === 'success' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-600" />
              )}
            </div>

            {/* Alert Title & Message */}
            <div className="space-y-1.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-block ${
                feedbackAlert.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {feedbackAlert.type === 'success' ? 'Status: Berhasil' : 'Status: Gagal'}
              </span>
              <h4 className="text-lg font-black text-slate-900 pt-1">
                {feedbackAlert.title}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                {feedbackAlert.message}
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setFeedbackAlert(null)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                  feedbackAlert.type === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {feedbackAlert.type === 'success' ? 'Mengerti' : 'Tutup'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export const ProfileSayaView: React.FC = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<'profil' | 'keamanan'>('profil');

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || user?.warga_profile?.no_hp_wa || '');
  const [alamatKtp, setAlamatKtp] = useState(user?.warga_profile?.alamat_ktp || 'Jl. Kenanga No. 14, RT 01 / RW 01, Dusun Doko Krajan');
  const [pekerjaan, setPekerjaan] = useState(user?.warga_profile?.pekerjaan || 'Pegawai / Wiraswasta');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [fotoKtp, setFotoKtp] = useState(user?.warga_profile?.foto_ktp || '');
  const [isKtpCameraOpen, setIsKtpCameraOpen] = useState(false);
  const [isAvatarCameraOpen, setIsAvatarCameraOpen] = useState(false);
  const [zoomKtpImage, setZoomKtpImage] = useState<string | null>(null);

  // Profile feedback
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password feedback
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sync with user data if context updates
  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setPhoneNumber(user.phone_number || user.warga_profile?.no_hp_wa || '');
      if (user.warga_profile?.alamat_ktp) setAlamatKtp(user.warga_profile.alamat_ktp);
      if (user.warga_profile?.pekerjaan) setPekerjaan(user.warga_profile.pekerjaan);
      if (user.avatar) setAvatar(user.avatar);
      if (user.warga_profile?.foto_ktp) setFotoKtp(user.warga_profile.foto_ktp);
    }
  }, [user]);

  // Helper function to compress images client-side using Canvas API
  const compressImageFile = (file: File, maxDimension = 200, quality = 0.65): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Always optimize dimensions for avatar badge (200x200 is 2.5x retina for 80px avatar)
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG format with lightweight footprint (~5-8KB)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleSaveAvatarOnly = async (overrideAvatar?: string) => {
    const targetAvatar = overrideAvatar !== undefined ? overrideAvatar : avatar;
    setIsSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const payload = {
        name: (name || user?.name || '').trim(),
        username: (username || user?.username || '').trim(),
        email: (email || user?.email || '').trim(),
        phone_number: (phoneNumber || user?.phone_number || '').trim(),
        alamat_ktp: alamatKtp.trim(),
        pekerjaan: pekerjaan.trim(),
        avatar: targetAvatar || null,
        foto_ktp: fotoKtp || null,
      };

      const res = await updateProfile(payload);
      if (res.success) {
        setProfileSuccess('Foto profil berhasil diperbarui dan aktif di seluruh menu.');
        setTimeout(() => setProfileSuccess(null), 4000);
      }
    } catch (err: any) {
      console.error('Update avatar error:', err);
      setProfileError('Gagal menyimpan foto profil: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileError(null);
      try {
        const compressedBase64 = await compressImageFile(file, 200, 0.65);
        setAvatar(compressedBase64);
        await handleSaveAvatarOnly(compressedBase64);
      } catch {
        setProfileError('Gagal memproses dan mengompres foto profil.');
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatar('');
    await handleSaveAvatarOnly('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const payload = {
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim(),
        alamat_ktp: alamatKtp.trim(),
        pekerjaan: pekerjaan.trim(),
        avatar: avatar || null,
        foto_ktp: fotoKtp || null,
      };

      const res = await updateProfile(payload);
      if (res.success) {
        setProfileSuccess('Perubahan profil dan kontak berhasil disimpan ke sistem.');
        setTimeout(() => setProfileSuccess(null), 4000);
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      let msg = 'Gagal menyimpan perubahan profil.';
      if (err.response?.status === 401) {
        msg = 'Sesi login Anda telah berakhir. Silakan muat ulang (refresh) halaman atau login kembali.';
      } else if (err.response?.data?.errors) {
        msg = Object.values(err.response.data.errors).flat().join(' • ');
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = `${msg} (${err.message})`;
      }
      setProfileError(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal harus 6 karakter.');
      setIsSavingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok dengan kata sandi baru.');
      setIsSavingPassword(false);
      return;
    }

    try {
      const payload = {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      };

      const res = await updatePassword(payload);
      if (res.success) {
        setPasswordSuccess('Kata sandi berhasil diperbarui. Gunakan kata sandi baru pada login berikutnya.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(null), 4000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.current_password?.[0] || 'Gagal memperbarui kata sandi.';
      setPasswordError(msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  const roleName = user?.role?.display_name || user?.role?.name || 'Warga Masyarakat';
  const roleSlug = user?.role?.slug || 'warga';
  const nikDisplay = user?.warga_profile?.nik || (roleSlug === 'warga' ? '3506041505840001' : '3506041203800008');
  const kkDisplay = user?.warga_profile?.kartu_keluarga?.no_kk || '3506041208010001';
  const wilayahDisplay = user?.warga_profile?.rt 
    ? `RT ${user.warga_profile.rt.nomor_rt} / RW ${user.warga_profile.rt.rw?.nomor_rw || '01'} • Dusun Doko Krajan` 
    : 'Wilayah Pemerintahan Desa Doko';

  return (
    <div className="w-full space-y-6 animate-fade-in font-sans pb-12">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Profil & Pengaturan Akun
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola identitas diri, data kependudukan resmi, kontak aktif, dan keamanan kredensial login.
          </p>
        </div>
      </div>

      {/* Main Profile Identity Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-wrap">
            {/* Avatar display with resilient UserAvatar */}
            <div className="relative">
              <UserAvatar
                src={avatar}
                name={name || user?.name}
                className="w-20 h-20 rounded-3xl object-cover border-2 border-emerald-500 shadow-md ring-4 ring-emerald-50"
                fallbackClassName="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-3xl shadow-md ring-4 ring-emerald-50"
              />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {name || user?.name}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Akun Terverifikasi</span>
                </span>
              </div>

              <div className="text-xs text-emerald-800 font-extrabold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{roleName}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-normal">{wilayahDisplay}</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono pt-0.5">
                <span>@{username || user?.username}</span>
                <span>•</span>
                <span>{email || user?.email}</span>
              </div>

              {/* Action Buttons for Avatar */}
              <div className="flex items-center gap-2 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsAvatarCameraOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  title="Ambil foto profil langsung menggunakan kamera HP / Webcam laptop"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Ambil Foto via Kamera</span>
                </button>

                <label
                  htmlFor="avatar-upload"
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  title="Pilih berkas foto dari komputer / galeri HP"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pilih Berkas</span>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>

                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-3 py-1.5 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('profil')}
            className={`pb-3 px-4 text-xs font-extrabold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'profil'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Informasi Biodata & Kontak</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('keamanan')}
            className={`pb-3 px-4 text-xs font-extrabold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'keamanan'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Keamanan & Kata Sandi</span>
          </button>
        </div>

        {/* Tab 1: Profile & Contact Details */}
        {activeTab === 'profil' && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {profileSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {/* Section 1: Akun & Kontak */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Informasi Akun & Kontak
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">*Dapat diedit langsung</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full p-3 rounded-2xl bg-white border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Nama Pengguna (Username)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-xs">@</span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      className="w-full pl-8 pr-3 py-3 rounded-2xl bg-white border border-slate-200 font-mono font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Alamat Email Aktif</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full p-3 rounded-2xl bg-white border border-slate-200 font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Nomor WhatsApp / Kontak Telepon</label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="08123456789"
                    className="w-full p-3 rounded-2xl bg-white border border-slate-200 font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Data Kependudukan & Wilayah */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Data Kependudukan & Domisili Resmi
                </h4>
                <span className="text-[11px] text-emerald-800 font-bold">Terverifikasi Dukcapil</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold">Nomor Induk Kependudukan (NIK)</label>
                    <span className="text-[10px] text-slate-400 font-bold">Resmi</span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={nikDisplay}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-800 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold">Nomor Kartu Keluarga (KK)</label>
                    <span className="text-[10px] text-slate-400 font-bold">Resmi</span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={kkDisplay}
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-800 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Profesi / Jabatan</label>
                  <input
                    type="text"
                    value={pekerjaan}
                    onChange={(e) => setPekerjaan(e.target.value)}
                    placeholder="Pekerjaan atau profesi"
                    className="w-full p-3 rounded-2xl bg-white border border-slate-200 font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Alamat Lengkap Domisili KTP</label>
                  <input
                    type="text"
                    value={alamatKtp}
                    onChange={(e) => setAlamatKtp(e.target.value)}
                    placeholder="Alamat domisili"
                    className="w-full p-3 rounded-2xl bg-white border border-slate-200 font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Verifikasi Fisik e-KTP & Foto Identitas Warga (e-KYC Desa) */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Verifikasi Berkas Fisik e-KTP (e-KYC Resmi Kependudukan)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Berkas identitas kependudukan resmi untuk syarat surat desa (arsip master kependudukan).
                  </p>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <Camera className="w-3 h-3" />
                  <span>Kamera & Upload</span>
                </span>
              </div>

              {fotoKtp ? (
                /* Card Preview e-KTP */
                <div className="p-4 rounded-3xl bg-emerald-50/80 border border-emerald-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Foto e-KTP Terlampir & Terverifikasi</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Resmi Desa Doko
                    </span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-emerald-300 bg-slate-950 aspect-16/10 max-h-56 flex items-center justify-center group shadow-xs">
                    <img
                      src={fotoKtp}
                      alt="Foto e-KTP Terverifikasi"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setZoomKtpImage(fotoKtp)}
                        className="px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-black shadow-md hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Lihat Ukuran Asli</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsKtpCameraOpen(true)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Foto Ulang via Kamera</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatar(fotoKtp);
                        handleSaveAvatarOnly(fotoKtp);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Gunakan foto ini sebagai foto profil / avatar akun"
                    >
                      <User className="w-4 h-4" />
                      <span>Jadikan Foto Profil</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFotoKtp('')}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Hapus Foto KTP"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Trigger Buttons to Capture or Upload KTP */
                <div className="p-5 rounded-3xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/80 transition-all text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 shadow-xs flex items-center justify-center mx-auto">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">
                      Foto Fisik e-KTP Belum Dilampirkan
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ambil foto langsung dengan kamera atau unggah berkas dari galeri perangkat Anda.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsKtpCameraOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer press-down"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Buka Kamera Sekarang</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Terdaftar di Sistem Informasi Desa Doko, Kec. Ngasem, Kab. Kediri
              </span>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer press-down"
              >
                {isSavingProfile ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'keamanan' && (
          <form onSubmit={handleSavePassword} className="space-y-6">
            {passwordSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                  Ganti Kata Sandi Akun
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">Minimal 6 karakter</span>
              </div>

              <div className="space-y-4 max-w-lg text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Kata Sandi Saat Ini</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan kata sandi lama"
                      className="w-full pr-10 pl-3 py-3 rounded-2xl bg-white border border-slate-200 font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Kata Sandi Baru</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pr-10 pl-3 py-3 rounded-2xl bg-white border border-slate-200 font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold">Konfirmasi Kata Sandi Baru</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full pr-10 pl-3 py-3 rounded-2xl bg-white border border-slate-200 font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Gunakan kombinasi sandi yang kuat untuk menjaga keamanan akses desa.
              </span>

              <button
                type="submit"
                disabled={isSavingPassword}
                className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer press-down"
              >
                {isSavingPassword ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memperbarui Sandi...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Perbarui Kata Sandi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Camera Modal for e-KTP */}
      <CameraUploadModal
        isOpen={isKtpCameraOpen}
        onClose={() => setIsKtpCameraOpen(false)}
        onCapture={(base64) => {
          setFotoKtp(base64);
        }}
        title="Ambil Foto Fisik e-KTP"
        description="Posisikan e-KTP Anda di dalam bingkai garis panduan agar 16 digit NIK dan identitas terbaca jelas."
        guideType="ktp"
      />

      {/* Camera Modal for Foto Profil / Avatar */}
      <CameraUploadModal
        isOpen={isAvatarCameraOpen}
        onClose={() => setIsAvatarCameraOpen(false)}
        onCapture={(base64) => {
          setAvatar(base64);
          setIsAvatarCameraOpen(false);
          handleSaveAvatarOnly(base64);
        }}
        title="Ambil Foto Profil / Selfie"
        description="Posisikan wajah Anda di tengah layar dengan pencahayaan yang cukup untuk foto profil akun."
        guideType="bebas"
      />

      {/* Lightbox Modal for Zooming KTP - Portaled, Auto-Centered, Highest Z-Index, No Blur */}
      {zoomKtpImage && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-slate-950/90 flex items-center justify-center p-4 animate-fade-in font-sans overflow-y-auto select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setZoomKtpImage(null);
          }}
        >
          <div 
            className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-2xl space-y-3 p-4 my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-slate-900 pb-3 border-b border-slate-100">
              <span className="text-xs font-bold flex items-center gap-2 text-slate-800">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span>Foto Fisik e-KTP Terverifikasi</span>
              </span>
              <button
                type="button"
                onClick={() => setZoomKtpImage(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Tutup (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center max-h-[70vh]">
              <img
                src={zoomKtpImage}
                alt="Foto e-KTP Zoom"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export interface NotificationItem {
  id: number | string;
  title: string;
  desc: string;
  time: string;
  category: 'surat' | 'bansos' | 'pengumuman' | 'agenda' | 'aspirasi' | 'umum' | string;
  unread: boolean;
  meta?: {
    nomorResi?: string;
    nomorSurat?: string;
    namaSurat?: string;
    signedBy?: string;
    actionLabel?: string;
    targetMenu?: string;
  };
}

export const NotifikasiView: React.FC<{ 
  notifications?: NotificationItem[]; 
  onSelectNotification?: (notif: NotificationItem) => void;
}> = ({ notifications, onSelectNotification }) => {
  const defaultNotifs: NotificationItem[] = [
    {
      id: 1,
      title: 'Surat Pengantar Disetujui & Diterbitkan',
      desc: 'Surat Keterangan Anda telah disahkan langsung oleh Kepala Desa dengan tanda tangan QR Code resmi dan nomor surat terbit.',
      time: '10 menit lalu',
      category: 'surat',
      unread: true,
      meta: {
        nomorResi: 'REQ-2026-001',
        nomorSurat: '470/012/418.66.04/2026',
        namaSurat: 'Surat Keterangan Usaha (SKU)',
        signedBy: 'Kepala Desa Doko',
        actionLabel: 'Buka Surat Selesai',
        targetMenu: 'surat_selesai',
      },
    },
    {
      id: 2,
      title: 'Verifikasi Pengantar oleh Ketua RT',
      desc: 'Pengajuan surat pengantar telah diverifikasi dan disetujui Ketua RT untuk diteruskan ke Kepala Desa.',
      time: '1 jam lalu',
      category: 'surat',
      unread: true,
      meta: {
        nomorResi: 'REQ-2026-002',
        namaSurat: 'Surat Keterangan Domisili Warga',
        signedBy: 'Ketua RT Setempat',
        actionLabel: 'Pantau Status Berkas',
        targetMenu: 'status_surat',
      },
    },
    {
      id: 3,
      title: 'Disposisi Penanganan Aspirasi Lapangan',
      desc: 'Laporan aspirasi warga mengenai fasilitas lingkungan telah didisposisikan ke staf terkait dan sedang ditindaklanjuti.',
      time: '1 hari lalu',
      category: 'aspirasi',
      unread: false,
      meta: {
        actionLabel: 'Lihat Riwayat Aspirasi',
        targetMenu: 'pengaduan',
      },
    },
  ];

  const notifs = notifications || defaultNotifs;

  return (
    <div className="w-full space-y-6 animate-fade-in font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pusat Notifikasi & Riwayat Alert
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pemberitahuan perubahan status surat pengantar dan instruksi sistem desa.
          </p>
        </div>
        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-2xs w-fit">
          {notifs.filter(n => n.unread).length} Belum Dibaca
        </span>
      </div>

      <PushNotificationManager className="mb-6" />

      <div className="space-y-3">
        {notifs.map((n) => (
          <div 
            key={n.id} 
            onClick={() => onSelectNotification?.(n)}
            className={`p-5 rounded-3xl border transition-all cursor-pointer hover:scale-[1.01] hover:shadow-md ${
              n.unread 
                ? 'bg-emerald-50/80 border-emerald-300 shadow-xs ring-1 ring-emerald-400/20' 
                : 'bg-white border-slate-200/80 shadow-xs hover:border-emerald-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    n.category === 'surat' ? 'bg-emerald-700 text-white' :
                    n.category === 'bansos' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {n.category}
                  </span>
                  <h3 className="font-black text-sm text-slate-900 truncate">{n.title}</h3>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.desc}</p>
                {n.meta?.nomorResi && (
                  <div className="text-[11px] font-mono text-emerald-800 font-bold">
                    Resi: {n.meta.nomorResi}
                  </div>
                )}
              </div>

              <div className="text-right shrink-0 space-y-2">
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{n.time}</span>
                <div className="text-[11px] font-extrabold text-emerald-700 hover:underline flex items-center justify-end gap-1">
                  <span>Lihat Detail</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
