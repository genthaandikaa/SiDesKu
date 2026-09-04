import React, { useState } from 'react';
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
  Printer
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';

// Shared views (Pengumuman, Agenda, Profil, Notifikasi)

export const PengumumanView: React.FC<{ canCreate?: boolean }> = ({ canCreate }) => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any | null>(null);
  const [copiedWaText, setCopiedWaText] = useState(false);

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      judul: 'Penyaluran Bantuan Pangan Beras & PKH Tahap III Tahun 2026',
      kategori: 'Bansos',
      tanggal: '25 Agustus 2026',
      oleh: 'Pemerintah Desa Doko',
      isi: 'Diberitahukan kepada seluruh KPM penerima bansos PKH agar hadir di Pendopo Balai Desa Doko sesuai sesi antrean masing-masing dengan membawa KTP dan KK asli.',
      status: 'Penting',
      tiket: {
        nomorTiket: 'TKT-BNS-20260825-014',
        nomorAntrean: 'A-014',
        sesi: 'Sesi 1 (Pagi) • 08.30 - 11.00 WIB',
        lokasi: 'Pendopo Balai Desa Doko',
        syarat: 'Bawa KTP Asli & Kartu Keluarga (KK)',
        qrHash: 'PKH-DOKO-2026-A014-VERIFIED',
      }
    },
    {
      id: 2,
      judul: 'Kerja Bakti Lingkungan & Pembersihan Saluran Air Musim Hujan',
      kategori: 'Lingkungan',
      tanggal: '22 Agustus 2026',
      oleh: 'Ketua RW 01',
      isi: 'Seluruh warga RT 01 dan RT 02 diimbau bergotong royong membersihkan selokan lingkungan demi mencegah genangan air.',
      status: 'Umum',
      tiket: {
        nomorTiket: 'TKT-KB-20260822-088',
        nomorAntrean: 'RW01-088',
        sesi: 'Pukul 06.30 WIB - Selesai',
        lokasi: 'Balai RW 01 & Saluran Air Utama Dusun Krajan',
        syarat: 'Bawa peralatan kebersihan pribadi (cangkul/sapu)',
        qrHash: 'KERJABAKTI-RW01-2026-VERIFIED',
      }
    },
    {
      id: 3,
      judul: 'Pelayanan Rekam KTP-El Keliling Dispendukcapil di Balai Desa',
      kategori: 'Layanan',
      tanggal: '18 Agustus 2026',
      oleh: 'Sekretariat Desa',
      isi: 'Bagi warga berusia 17 tahun atau yang belum memiliki KTP elektronik, layanan rekam biometrik dibuka pukul 08.30 - 14.00 WIB.',
      status: 'Resmi',
      tiket: {
        nomorTiket: 'TKT-KTP-20260818-042',
        nomorAntrean: 'KTP-042',
        sesi: 'Sesi Bebas • 08.30 - 14.00 WIB',
        lokasi: 'Ruang Pelayanan Balai Desa Doko',
        syarat: 'Bawa Fotokopi KK & Akta Kelahiran Asli',
        qrHash: 'KTPEL-DOKO-2026-042-VERIFIED',
      }
    },
  ]);

  const handleShareWhatsApp = (announcement: any) => {
    const t = announcement.tiket;
    const namaWarga = user?.warga_profile?.nama_lengkap || user?.name || 'Warga Desa Doko';
    const nik = user?.warga_profile?.nik || '350604xxxxxx';

    const text = `🏛️ *TIKET RESMI PELAYANAN DESA DOKO*\n` +
      `-------------------------------------\n` +
      `📌 *Acara:* ${announcement.judul}\n` +
      `👤 *Nama:* ${namaWarga} (NIK: ${nik})\n` +
      `🎫 *No. Antrean:* ${t?.nomorAntrean || 'Umum'}\n` +
      `📅 *Jadwal:* ${announcement.tanggal} (${t?.sesi || 'WIB'})\n` +
      `📍 *Lokasi:* ${t?.lokasi || 'Balai Desa Doko'}\n` +
      `📋 *Syarat:* ${t?.syarat || 'KTP / KK Asli'}\n` +
      `🔑 *Kode Tiket:* ${t?.nomorTiket}\n\n` +
      `💡 _Tunjukkan pesan ini atau Scan QR Code digital di meja petugas saat hadir di balai desa._`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
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
            Kabar resmi, instruksi bupati, jadwal bansos, dan tiket antrean kegiatan warga.
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
                  🎫 Antrean: {a.tiket.nomorAntrean}
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  📍 {a.tiket.lokasi}
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

      {/* Modal Detail Warta & Tiket Undangan Resmi (Dual-Mode: QR Digital & Teks Manual) */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 animate-fade-in bg-slate-950/80 backdrop-blur-sm font-sans overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-up border border-slate-200 flex flex-col my-auto max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {selectedAnnouncement.kategori}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{selectedAnnouncement.tanggal}</span>
                  </div>
                  <h3 className="font-black text-sm text-slate-900 leading-tight mt-0.5">Tiket Undangan & Warta Resmi Desa</h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                title="Tutup (ESC)"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Announcement Overview */}
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {selectedAnnouncement.judul}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {selectedAnnouncement.isi}
                </p>
              </div>

              {/* TIKET DUAL-MODE RESMI (Auto-Generated 2-in-1 Pass) */}
              <div className="rounded-3xl border-2 border-emerald-400 bg-gradient-to-b from-[#f7fbf9] to-[#edf7f2] p-5 sm:p-6 space-y-5 relative shadow-md overflow-hidden">
                {/* Decorative Jagged Ticket Side Cuts */}
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950/80 hidden sm:block pointer-events-none" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950/80 hidden sm:block pointer-events-none" />

                {/* Ticket Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-200/80">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/images/logo-kediri.png" 
                      alt="Logo Kediri" 
                      className="w-10 h-10 object-contain shrink-0" 
                    />
                    <div>
                      <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest leading-none">
                        Pemerintah Desa Doko • Kab. Kediri
                      </div>
                      <div className="font-black text-base text-slate-900 mt-0.5">
                        TIKET KEHADIRAN & ANTREAN RESMI
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-700 text-white text-[10px] font-black shadow-2xs">
                      PAS RESMI SAH
                    </span>
                    <div className="text-[10px] font-mono text-emerald-900 font-bold mt-1">
                      {selectedAnnouncement.tiket.nomorTiket}
                    </div>
                  </div>
                </div>

                {/* Warga Info Strip */}
                <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Nama Pemegang Tiket:</span>
                    <div className="font-black text-slate-900 text-sm">
                      {user?.warga_profile?.nama_lengkap || user?.name || 'Bambang Utomo'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">NIK Terdaftar:</span>
                    <div className="font-mono font-bold text-slate-700">
                      {user?.warga_profile?.nik || '3506041505840001'}
                    </div>
                  </div>
                </div>

                {/* 2 OPSI DALAM 1 TIKET (DUAL-MODE SECTION) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                  
                  {/* OPSI 1: JALUR CEPAT QR DIGITAL (UNTUK YANG TIDAK GAPTEK) */}
                  <div className="md:col-span-6 bg-white p-4 rounded-2xl border border-emerald-300 shadow-2xs flex flex-col items-center text-center justify-between space-y-3">
                    <div className="w-full text-left flex items-center justify-between pb-1.5 border-b border-emerald-100">
                      <span className="text-[10px] font-black text-emerald-800 uppercase">
                        📱 OPSI 1: JALUR SCAN QR
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        1 Detik Scan
                      </span>
                    </div>

                    {/* QR Code Canvas generated by Laravel */}
                    <div className="p-2.5 bg-white rounded-2xl border-2 border-emerald-500 shadow-xs flex flex-col items-center">
                      <img 
                        src={`/api/public/surat/qr/${selectedAnnouncement.tiket.qrHash}`}
                        alt="QR Code Tiket Resmi Laravel"
                        className="w-28 h-28 object-contain"
                        onError={(e: any) => {
                          e.currentTarget.src = `http://127.0.0.1:8000/api/public/surat/qr/${selectedAnnouncement.tiket.qrHash}`;
                        }}
                      />
                      <span className="text-[9px] font-mono text-emerald-800 font-bold mt-1">
                        {selectedAnnouncement.tiket.qrHash}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-tight">
                      Cukup tunjukkan QR ini di layar HP ke kamera petugas untuk scan verifikasi kilat otomatis.
                    </p>
                  </div>

                  {/* OPSI 2: JALUR BEBAS TEKS MANUAL (UNTUK WARGA SEPUH / LANSIA / GAPTEK) */}
                  <div className="md:col-span-6 bg-white p-4 rounded-2xl border border-amber-300 shadow-2xs flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between pb-1.5 border-b border-amber-100">
                      <span className="text-[10px] font-black text-amber-900 uppercase">
                        👵 OPSI 2: JALUR TEKS & KTP
                      </span>
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        Warga Sepuh / Lansia
                      </span>
                    </div>

                    <div className="text-center py-2 bg-amber-50/80 rounded-xl border border-amber-200 space-y-0.5">
                      <div className="text-[10px] text-amber-800 font-extrabold uppercase">NOMOR ANTREAN ANDA</div>
                      <div className="text-3xl font-black text-amber-950 font-mono tracking-tight">
                        {selectedAnnouncement.tiket.nomorAntrean}
                      </div>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-700">
                      <div>⏰ <strong>Sesi:</strong> {selectedAnnouncement.tiket.sesi}</div>
                      <div>📍 <strong>Lokasi:</strong> {selectedAnnouncement.tiket.lokasi}</div>
                      <div>📋 <strong>Syarat:</strong> {selectedAnnouncement.tiket.syarat}</div>
                    </div>

                    <p className="text-[10px] text-amber-900 font-medium bg-amber-100/60 p-2 rounded-lg leading-tight">
                      💡 <strong>Bebas tanpa scan:</strong> Cukup perlihatkan nomor antrean ini bersama KTP asli ke petugas balai desa.
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleShareWhatsApp(selectedAnnouncement)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all press-down cursor-pointer"
              >
                <span>📲 Kirim Tiket ke WhatsApp</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-extrabold text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Tiket</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export const AgendaDesaView: React.FC = () => {
  const events = [
    {
      id: 1,
      judul: 'Musyawarah Perencanaan Pembangunan Desa (Musrenbangdes)',
      waktu: 'Rabu, 27 Agustus 2026 • 09.00 WIB',
      tempat: 'Pendopo Balai Desa Doko',
      peserta: 'BPD, LPMD, Tokoh Masyarakat, Ketua RT/RW',
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
      judul: 'Penyaluran BLT Dana Desa Periode Agustus',
      waktu: 'Senin, 31 Agustus 2026 • 08.00 WIB',
      tempat: 'Ruang Pelayanan Kantor Desa',
      peserta: 'Warga Penerima Manfaat BLT-DD',
      tipe: 'Sosial',
    },
  ];

  const getCategoryIcon = (tipe: string) => {
    const t = tipe.toLowerCase();
    if (t.includes('kesehatan') || t.includes('posyandu')) return <HeartPulse className="w-5 h-5 text-emerald-700" />;
    if (t.includes('pemerintahan') || t.includes('musrenbang')) return <Building2 className="w-5 h-5 text-emerald-700" />;
    if (t.includes('sosial') || t.includes('blt') || t.includes('bansos')) return <HandHeart className="w-5 h-5 text-emerald-700" />;
    return <Calendar className="w-5 h-5 text-emerald-700" />;
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Agenda Kegiatan & Jadwal Rapat
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Kalender kegiatan musyawarah, pelayanan kesehatan, dan aktivitas sosial warga.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {events.map((ev) => (
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
