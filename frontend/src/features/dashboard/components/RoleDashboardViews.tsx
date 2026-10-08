import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '@/shared/lib/axios';
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

// Shared views (Pengumuman, Agenda, Profil, Notifikasi)

export const PengumumanView: React.FC<{ canCreate?: boolean }> = ({ canCreate }) => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  useEffect(() => {
    fetchAnnouncements();
  }, []);

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
        `🌾 Undangan Resmi Penyaluran Bantuan Pangan Beras & PKH :\n\n` +
        `nama penerima 👤 : *${namaWarga}*\n` +
        `nik 🆔 : *${nik}*\n` +
        `alamat 🏠 : *${alamat}*\n` +
        `agenda acara 🌾 : *${announcement.judul}*\n` +
        `hari & tanggal 📆 : *${t?.hariTanggal || announcement.tanggal || 'Kamis, 13 Agustus 2026'}*\n` +
        `waktu ⏰ : *${t?.jam || t?.sesi || '08:30 WIB - Selesai'}*\n` +
        `lokasi 📍 : *${t?.tempat || t?.lokasi || 'Pendopo Balai Desa Doko'}*\n` +
        `alokasi bantuan 📦 : *${t?.alokasi || t?.keperluan || '30 Kg Beras CBP (Alokasi Juli - September 2026)'}*\n` +
        `biaya tebus 💸 : *GRATIS (Rp 0,-)*\n` +
        `no. urut antrean 🎫 : *${t?.noUrut || 1}*\n` +
        `kode barcode 🔢 : *${t?.barcode || t?.qrHash || '350606200801340'}*\n` +
        `no. surat resmi 📄 : *${t?.nomorSurat || 'UND/02/08/26/115002'}*\n\n` +
        `NB 📌 : *${t?.catatanBatas || 'Harap hadir tepat waktu sesuai jadwal dengan membawa KTP asli/IKD & Kartu Keluarga (KK). Jika setelah 5 hari tidak diambil tanpa keterangan, kuota bantuan akan dialihkan ke penerima pengganti.'}*\n\n` +
        `Salam hangat dari Pemerintah Desa Doko & Perum BULOG 🌾✨`
      );
    }

    if (isKerjaBakti) {
      return (
        `🧹 Agenda Gotong Royong & Kerja Bakti Warga Desa Doko :\n\n` +
        `nama warga 👤 : *${namaWarga}*\n` +
        `wilayah 🏠 : *RT 01 / RW 01 Dusun Krajan*\n` +
        `agenda kegiatan 🧹 : *${announcement.judul}*\n` +
        `hari & tanggal 📆 : *${t?.hariTanggal || announcement.tanggal || 'Minggu, 24 Agustus 2026'}*\n` +
        `waktu ⏰ : *${t?.jam || '06:30 WIB - Selesai'}*\n` +
        `lokasi kumpul 📍 : *${t?.tempat || 'Balai RW 01 & Saluran Air Utama'}*\n` +
        `keperluan 🧤 : *Pembersihan selokan lingkungan & pencegahan genangan air*\n` +
        `biaya konsumsi 💸 : *Swadaya / Kas RT (Gratis Warga)*\n` +
        `no. urut partisipasi 🎫 : *${t?.noUrut || 1}*\n\n` +
        `NB 📌 : *Diharapkan membawa peralatan mandiri seperti cangkul, sabit, dan karung sampah. Mari jaga kebersihan dan keasrian lingkungan kita bersama!* 🌿\n\n` +
        `Salam hangat dari Pengurus RT 01 & RW 01 Desa Doko 🤝✨`
      );
    }

    if (isKtp) {
      return (
        `🪪 Jadwal Pelayanan Rekam KTP-El Keliling Dispendukcapil :\n\n` +
        `nama pemohon 👤 : *${namaWarga}*\n` +
        `nik 🆔 : *${nik}*\n` +
        `agenda layanan 🪪 : *${announcement.judul}*\n` +
        `hari & tanggal 📆 : *${t?.hariTanggal || announcement.tanggal || 'Senin, 17 Agustus 2026'}*\n` +
        `waktu ⏰ : *${t?.jam || '08:30 - 14:00 WIB'}*\n` +
        `lokasi 📍 : *${t?.tempat || 'Ruang Pelayanan Balai Desa Doko'}*\n` +
        `persyaratan berkas 📁 : *Fotokopi KK, Akta Kelahiran & berpakaian rapi berkerah*\n` +
        `biaya retribusi 💸 : *GRATIS (Rp 0,-)*\n` +
        `no. urut antrean 🎫 : *${t?.noUrut || 1}*\n` +
        `kode barcode 🔢 : *${t?.barcode || '350606200800001'}*\n\n` +
        `NB 📌 : *Layanan jemput bola resmi tanpa calo. Harap hadir tepat waktu sesuai jadwal agar pelayanan berjalan lancar.* ⏱️\n\n` +
        `Salam hangat dari Dispendukcapil Kab. Kediri & Pemdes Doko 🇮🇩✨`
      );
    }

    if (isPosyandu) {
      return (
        `👶 Jadwal Layanan Posyandu Balita & Kesehatan Lansia :\n\n` +
        `nama peserta 👤 : *${namaWarga}*\n` +
        `kegiatan 👶 : *${announcement.judul}*\n` +
        `hari & tanggal 📆 : *${t?.hariTanggal || announcement.tanggal || 'Sabtu, 22 Agustus 2026'}*\n` +
        `waktu ⏰ : *${t?.jam || '08:00 - 11:30 WIB'}*\n` +
        `lokasi posyandu 📍 : *${t?.tempat || 'Balai RT 01 / Posyandu Cempaka'}*\n` +
        `layanan medis 🩺 : *Penimbangan balita, imunisasi & cek tensi darah lansia*\n` +
        `biaya pemeriksaan 💸 : *GRATIS (Rp 0,-)*\n` +
        `no. urut antrean 🎫 : *${t?.noUrut || 1}*\n\n` +
        `NB 📌 : *Jangan lupa membawa Buku KIA/KMS balita atau kartu kontrol lansia.* 🌸\n\n` +
        `Salam hangat dari Tim Penggerak PKK & Bidan Desa Doko 🌸✨`
      );
    }

    return (
      `📢 Pemberitahuan Warta & Pengumuman Resmi Desa Doko :\n\n` +
      `judul warta 📢 : *${announcement.judul}*\n` +
      `ditujukan kepada 👤 : *${namaWarga}*\n` +
      `hari & tanggal 📆 : *${t?.hariTanggal || announcement.tanggal || 'Hari Ini'}*\n` +
      `waktu ⏰ : *${t?.jam || t?.sesi || 'Waktu Setempat'}*\n` +
      `lokasi 📍 : *${t?.tempat || t?.lokasi || 'Balai Desa Doko'}*\n` +
      `keterangan 📝 : *${announcement.isi || t?.keperluan || 'Informasi kegiatan desa'}*\n` +
      `no. tiket 🎫 : *${t?.noUrut || 1}*\n\n` +
      `NB 📌 : *${t?.catatanBatas || 'Harap diperhatikan dan dipatuhi demi ketertiban serta kelancaran bersama.'}*\n\n` +
      `Salam hangat dari ${instansi} 🏛️✨`
    );
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
            Warta & Pengumuman Desa
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
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  a.status === 'Penting' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {a.kategori}
                </span>
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
                  🎫 {a.tiket?.isSuratUndanganResmi ? `No. Urut: ${a.tiket.noUrut || a.tiket.nomorAntrean}` : `Antrean: ${a.tiket?.nomorAntrean}`}
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  📍 {a.tiket?.tempat || a.tiket?.lokasi}
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
                <span>Buka Tiket & Detail Undangan →</span>
              </button>
            </div>
          </div>
        ))}
      </div>

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
              {/* WhatsApp Sharing Actions */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(selectedAnnouncement)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all press-down cursor-pointer"
                >
                  <span>📲 Kirim WhatsApp</span>
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

              {/* Document & Dialog Actions */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-extrabold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Cetak / Unduh PDF</span>
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
    </div>
  );
};

export const AgendaDesaView: React.FC = () => {
  const { user } = useAuth();
  const roleSlug = user?.role?.slug || 'warga';
  const isRt = ['rt', 'sekretaris_rt', 'bendahara_rt'].includes(roleSlug);
  const isRw = roleSlug === 'rw';

  const defaultEvents = [
    {
      id: 1,
      judul: isRt ? 'Rembug Warga & Musyawarah RT 01 Krajan' : 'Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes)',
      waktu: 'Rabu, 27 Agustus 2026 • 19.30 WIB',
      tempat: isRt ? 'Balai Pertemuan Warga RT 01' : 'Pendopo Balai Desa Doko',
      peserta: isRt ? 'Seluruh Kepala Keluarga RT 01 Krajan' : 'BPD, LPMD, Tokoh Masyarakat, Ketua RT/RW',
      tipe: 'Pemerintahan',
    },
    {
      id: 2,
      judul: 'Posyandu Balita & Lansia Terpadu Dusun Krajan',
      waktu: 'Jumat, 29 Agustus 2026 • 08.30 WIB',
      tempat: 'Posyandu Melati RT 01',
      peserta: 'Ibu Hamil, Balita, & Lansia RT 01 - RT 04',
      tipe: 'Kesehatan',
    },
    {
      id: 3,
      judul: isRt ? 'Kerja Bakti Kebersihan Lingkungan & Saluran Air RT 01' : 'Penyaluran BLT Dana Desa Periode Agustus',
      waktu: isRt ? 'Minggu, 30 Agustus 2026 • 06.30 WIB' : 'Senin, 31 Agustus 2026 • 08.00 WIB',
      tempat: isRt ? 'Lingkungan Gang Melati & Kenanga RT 01' : 'Ruang Pelayanan Kantor Desa',
      peserta: isRt ? 'Warga Lingkungan RT 01 Krajan' : 'Warga Penerima Manfaat BLT-DD',
      tipe: isRt ? 'Lingkungan' : 'Sosial',
    },
    {
      id: 4,
      judul: 'Penyaluran Bantuan Pangan Beras & PKH Tahap III',
      waktu: 'Senin, 31 Agustus 2026 • 08.00 WIB',
      tempat: 'Pendopo Balai Desa Doko',
      peserta: 'Keluarga Penerima Manfaat (KPM) Terdaftar',
      tipe: 'Sosial',
    },
    {
      id: 5,
      judul: isRt ? 'Jadwal Ronda & Siskamling Bergilir RT 01' : 'Rapat Koordinasi Pengurus Wilayah RW 01',
      waktu: 'Setiap Malam • 22.00 - 04.00 WIB',
      tempat: isRt ? 'Pos Ronda Utama RT 01 Krajan' : 'Balai Warga RW 01',
      peserta: isRt ? 'Petugas Ronda Bergilir Sesuai Jadwal' : 'Ketua RT 01 s/d RT 06 & Tokoh Masyarakat',
      tipe: 'Keamanan',
    },
  ];

  const getCategoryIcon = (tipe: string) => {
    const t = tipe.toLowerCase();
    if (t.includes('kesehatan') || t.includes('posyandu')) return <HeartPulse className="w-5 h-5 text-emerald-700" />;
    if (t.includes('pemerintahan') || t.includes('musrenbang') || t.includes('rembug')) return <Building2 className="w-5 h-5 text-emerald-700" />;
    if (t.includes('sosial') || t.includes('blt') || t.includes('bansos')) return <HandHeart className="w-5 h-5 text-emerald-700" />;
    if (t.includes('lingkungan') || t.includes('kerja bakti')) return <Users className="w-5 h-5 text-emerald-700" />;
    if (t.includes('keamanan') || t.includes('ronda')) return <ShieldCheck className="w-5 h-5 text-emerald-700" />;
    return <Calendar className="w-5 h-5 text-emerald-700" />;
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {defaultEvents.map((ev) => (
          <div
            key={ev.id}
            className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all hover:shadow-md h-full space-y-4"
          >
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Green Icon Box with Category Logo */}
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100/70 flex items-center justify-center font-bold shrink-0">
                {getCategoryIcon(ev.tipe)}
              </div>

              <div className="space-y-1 flex-1 flex flex-col justify-start">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase inline-block">
                    {ev.tipe}
                  </span>
                </div>
                {/* min-h-[3rem] ensures 1-line titles match 2-line titles in vertical height */}
                <h3 className="text-base font-black text-slate-900 leading-snug pt-1 min-h-[3rem] flex items-start">
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
                <span className="truncate">{ev.peserta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileError(null);
      try {
        const compressedBase64 = await compressImageFile(file, 200, 0.65);
        setAvatar(compressedBase64);
        if (file.size > 2 * 1024 * 1024) {
          setProfileSuccess(`Foto berukuran ${(file.size / (1024 * 1024)).toFixed(1)} MB berhasil dikompres otomatis secara optimal.`);
          setTimeout(() => setProfileSuccess(null), 4000);
        }
      } catch {
        setProfileError('Gagal memproses dan mengompres foto profil.');
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
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
    <div className="max-w-4xl space-y-6 animate-fade-in font-sans pb-12">
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
          <div className="flex items-center gap-5">
            {/* Avatar with Upload button */}
            <div className="relative group">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name || 'Avatar'}
                  className="w-20 h-20 rounded-3xl object-cover border-2 border-emerald-500 shadow-md ring-4 ring-emerald-50"
                />
              ) : (
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-3xl shadow-md ring-4 ring-emerald-50">
                  {name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
              )}

              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-white border border-slate-200 text-slate-700 shadow-md hover:bg-emerald-50 hover:text-emerald-700 transition-all cursor-pointer hover:scale-105"
                title="Ganti Foto Profil"
              >
                <Edit className="w-3.5 h-3.5" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1">
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
            </div>
          </div>

          {avatar && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors self-end sm:self-center"
            >
              Hapus Foto
            </button>
          )}
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
                    Verifikasi Fisik e-KTP (e-KYC Desa)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Gunakan kamera HP atau laptop untuk melampirkan foto fisik e-KTP asli demi kemudahan legalisasi otomatis.
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

                  <div className="flex items-center gap-2 pt-1">
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

      {/* Lightbox Modal for Zooming KTP - Portaled, Auto-Centered, Highest Z-Index, No Blur */}
      {zoomKtpImage && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-slate-950/90 flex items-center justify-center p-4 animate-fade-in font-sans overflow-y-auto select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setZoomKtpImage(null);
          }}
        >
          <div 
            className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl space-y-3 p-4 my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-white pb-2 border-b border-slate-800">
              <span className="text-xs font-bold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Foto Fisik e-KTP Terverifikasi</span>
              </span>
              <button
                type="button"
                onClick={() => setZoomKtpImage(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Tutup (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
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
  category: 'surat' | 'bansos' | 'pengumuman' | 'agenda';
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
      title: 'Surat Pengantar Disetujui & Selesai',
      desc: 'Surat Keterangan Tidak Mampu (SKTM) Anda telah disahkan oleh Sekdes dengan TTD QR resmi dan siap diunduh.',
      time: '10 menit lalu',
      category: 'surat',
      unread: true,
      meta: {
        nomorResi: 'REQ-20260818-001',
        nomorSurat: '401/042/418.66.04/2026',
        namaSurat: 'Surat Keterangan Tidak Mampu (SKTM)',
        signedBy: 'Sekretaris Desa (Doko)',
        actionLabel: 'Buka Surat Selesai',
        targetMenu: 'surat_selesai',
      },
    },
    {
      id: 2,
      title: 'Verifikasi Pengantar Diteruskan ke RW',
      desc: 'Pengajuan surat pengantar telah diverifikasi oleh Ketua RT 01 dan diteruskan ke Ketua RW 01 untuk validasi lanjutan.',
      time: '1 jam lalu',
      category: 'surat',
      unread: true,
      meta: {
        nomorResi: 'REQ-20260818-002',
        namaSurat: 'Surat Keterangan Domisili Warga',
        signedBy: 'Ketua RT 01 (Pak Joko)',
        actionLabel: 'Pantau Status Berkas',
        targetMenu: 'status_surat',
      },
    },
    {
      id: 3,
      title: 'Penyaluran Bantuan PKH Tahap III 2026',
      desc: 'Jadwal pembagian bansos PKH dibuka hari ini pukul 08.30 WIB di Pendopo Balai Desa Doko.',
      time: '1 hari lalu',
      category: 'bansos',
      unread: false,
      meta: {
        actionLabel: 'Lihat Informasi Pengumuman',
        targetMenu: 'pengumuman',
      },
    },
  ];

  const notifs = notifications || defaultNotifs;

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in font-sans">
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
                  <span>Lihat Detail →</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
