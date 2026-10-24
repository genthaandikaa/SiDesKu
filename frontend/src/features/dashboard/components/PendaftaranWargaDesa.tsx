import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, 
  Search, 
  CheckCircle2, 
  X, 
  Copy, 
  Check, 
  MapPin, 
  Calendar, 
  Lock,
  MessageCircle,
  Eye,
  RefreshCw,
  Users,
  Filter,
  RotateCcw,
  Home,
  Shield,
  CreditCard,
  Briefcase,
  GraduationCap,
  Heart,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { Pagination } from '@/shared/components/Pagination';

export interface WargaItem {
  id: number;
  user_id?: number;
  kk_id?: number | null;
  rt_id?: number;
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  agama?: string;
  status_perkawinan?: string;
  pekerjaan?: string;
  pendidikan_terakhir?: string;
  golongan_darah?: string;
  alamat_ktp: string;
  no_hp_wa: string;
  status_keluarga: string;
  status_ekonomi: string;
  status_kependudukan?: string;
  created_at?: string;
  user?: {
    id: number;
    username: string;
    email?: string;
    is_active: boolean;
  };
  rt?: {
    id: number;
    nomor_rt: string;
    rw?: {
      id: number;
      nomor_rw: string;
      dusun?: {
        id: number;
        nama_dusun: string;
      };
    };
  };
  kartu_keluarga?: {
    id: number;
    no_kk: string;
    nama_kepala_keluarga: string;
    alamat_lengkap?: string;
    no_telp_rumah?: string;
    anggota_keluarga?: Array<{
      id: number;
      nik: string;
      nama_lengkap: string;
      jenis_kelamin: string;
      tanggal_lahir: string;
      status_keluarga: string;
      pekerjaan?: string;
    }>;
  };
}

function calculateAge(dobStr: string): number {
  if (!dobStr) return 0;
  const dob = new Date(dobStr);
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function formatDobPassword(dobStr: string): string {
  if (!dobStr) return '';
  const dob = new Date(dobStr);
  const day = String(dob.getDate()).padStart(2, '0');
  const month = String(dob.getMonth() + 1).padStart(2, '0');
  const year = dob.getFullYear();
  return `${day}${month}${year}`;
}

// ==========================================
// MODAL DETAIL WARGA & KARTU KELUARGA
// (Dideklarasikan di luar fungsi render)
// ==========================================
interface WargaDetailModalProps {
  warga: WargaItem | null;
  onClose: () => void;
  onCopyCredentials: (w: WargaItem) => void;
  copiedId: number | null;
}

const WargaDetailModal: React.FC<WargaDetailModalProps> = ({
  warga,
  onClose,
  onCopyCredentials,
  copiedId,
}) => {
  useEffect(() => {
    if (!warga) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [warga, onClose]);

  if (!warga) return null;

  const age = calculateAge(warga.tanggal_lahir);
  const pw = formatDobPassword(warga.tanggal_lahir);
  const dobFormatted = new Date(warga.tanggal_lahir).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const anggotaKeluarga = warga.kartu_keluarga?.anggota_keluarga || [];

  return (
    <div 
      className="fixed inset-0 z-[999999] flex items-start justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-fade-in font-sans overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden my-auto animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-white border-b border-emerald-100 p-5 sm:p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
            title="Tutup (ESC)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-10">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black shrink-0 ${
              warga.jenis_kelamin === 'L' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {warga.nama_lengkap.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {warga.status_kependudukan || 'Warga Tetap'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  RT {warga.rt?.nomor_rt || '01'} / RW {warga.rt?.rw?.nomor_rw || '01'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  {warga.status_keluarga || 'Anggota Keluarga'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                {warga.nama_lengkap}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-800 font-mono">
                <span>NIK: <strong className="text-slate-900">{warga.nik}</strong></span>
                {warga.kartu_keluarga?.no_kk && (
                  <span>• No KK: <strong className="text-slate-900">{warga.kartu_keluarga.no_kk}</strong></span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Section 1: Identitas Pribadi */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-800 font-black text-sm pb-1.5 border-b border-slate-100">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Identitas & Biodata Kependudukan</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Tempat, Tgl Lahir</span>
                <span className="font-extrabold text-slate-900 block mt-0.5">{warga.tempat_lahir}, {dobFormatted}</span>
                <span className="text-[10px] text-emerald-700 font-bold">Usia: {age} Tahun</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Jenis Kelamin</span>
                <span className="font-extrabold text-slate-900 block mt-0.5">
                  {warga.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                </span>
                <span className="text-[10px] text-slate-400">Kode: {warga.jenis_kelamin}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Agama</span>
                <span className="font-extrabold text-slate-900 block mt-0.5">{warga.agama || 'Islam'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Status Pernikahan</span>
                <span className="font-extrabold text-slate-900 block mt-0.5">{warga.status_perkawinan || 'Kawin'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Pekerjaan</span>
                <span className="font-extrabold text-slate-900 block mt-0.5">{warga.pekerjaan || 'Wiraswasta / Buruh'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Pendidikan Terakhir</span>
                <span className="font-extrabold text-slate-900 block mt-0.5">{warga.pendidikan_terakhir || 'SMA/Sederajat'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Golongan Darah</span>
                <span className="font-extrabold text-slate-900 block mt-0.5">{warga.golongan_darah || '-'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Status Ekonomi</span>
                <span className="font-extrabold text-slate-900 block mt-0.5">{warga.status_ekonomi || 'Menengah'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Kedudukan Keluarga</span>
                <span className="font-extrabold text-emerald-800 block mt-0.5">{warga.status_keluarga || 'Anggota'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Alamat Domisili & Kontak */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-800 font-black text-sm pb-1.5 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Alamat Domisili & Kontak Warga</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Alamat Sesuai KTP:</span>
                <p className="font-bold text-slate-900 text-xs leading-relaxed">
                  {warga.alamat_ktp}
                </p>
                <div className="pt-1 text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-emerald-100 rounded text-[10px] font-bold">
                    RT {warga.rt?.nomor_rt || '01'} / RW {warga.rt?.rw?.nomor_rw || '01'}
                  </span>
                  <span>{warga.rt?.rw?.dusun?.nama_dusun || 'Dusun Doko Krajan'}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Kontak WhatsApp:</span>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {warga.no_hp_wa || 'Belum terdaftar nomor WA'}
                  </div>
                </div>

                {warga.no_hp_wa && (
                  <a
                    href={`https://wa.me/${warga.no_hp_wa.replace(/\D/g, '')}?text=${encodeURIComponent(
                      `Halo Bapak/Ibu ${warga.nama_lengkap}, kami dari Kantor Desa Doko perihal data kependudukan portal desa.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors self-start"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Hubungi via WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Data Kartu Keluarga (KK) & Anggota Satu KK */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                <Home className="w-4 h-4 text-emerald-600" />
                <span>Kartu Keluarga (KK) & Anggota Terdaftar</span>
              </div>
              {warga.kartu_keluarga?.no_kk && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 font-mono font-bold text-[10px] border border-emerald-200">
                  No. KK: {warga.kartu_keluarga.no_kk}
                </span>
              )}
            </div>

            {warga.kartu_keluarga ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">Nomor Kartu Keluarga:</span>
                    <strong className="font-mono text-emerald-950 text-xs">{warga.kartu_keluarga.no_kk}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">Kepala Keluarga:</span>
                    <strong className="text-emerald-950 text-xs">{warga.kartu_keluarga.nama_kepala_keluarga}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 font-bold uppercase block">Kedudukan Warga Ini:</span>
                    <strong className="text-emerald-950 text-xs">{warga.status_keluarga || 'Anggota'}</strong>
                  </div>
                </div>

                {/* Anggota Keluarga Terdaftar di KK yang sama */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Daftar Anggota Keluarga dalam KK Ini ({anggotaKeluarga.length} Jiwa):</span>
                  </div>

                  {anggotaKeluarga.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                          <tr>
                            <th className="py-2 px-3">Nama Anggota</th>
                            <th className="py-2 px-3">NIK</th>
                            <th className="py-2 px-3">Hubungan</th>
                            <th className="py-2 px-3">Jenis Kelamin</th>
                            <th className="py-2 px-3">Pekerjaan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {anggotaKeluarga.map((ang) => {
                            const isCurrent = ang.id === warga.id || ang.nik === warga.nik;
                            return (
                              <tr key={ang.id} className={isCurrent ? 'bg-emerald-50/80 font-bold' : 'hover:bg-slate-50'}>
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <span>{ang.nama_lengkap}</span>
                                    {isCurrent && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-600 text-white uppercase font-black">
                                        Warga Ini
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 px-3 font-mono text-slate-600">{ang.nik}</td>
                                <td className="py-2 px-3 text-slate-800">{ang.status_keluarga || '-'}</td>
                                <td className="py-2 px-3">{ang.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</td>
                                <td className="py-2 px-3 text-slate-500">{ang.pekerjaan || '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs">
                      Warga ini adalah anggota pertama yang terdaftar pada KK <strong>{warga.kartu_keluarga.no_kk}</strong>. Anggota keluarga lain dapat ditambahkan melalui tombol <em>+ Daftarkan Warga Baru</em> menggunakan nomor KK yang sama.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <CreditCard className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Belum Terdaftar pada Kartu Keluarga (KK):</strong>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Warga ini didaftarkan tanpa nomor KK. Nomor KK dapat dilengkapi melalui pembaruan data kependudukan.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Akun & Kredensial Login Mandiri */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-800 font-black text-sm pb-1.5 border-b border-slate-100">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Akses Portal Mandiri Warga</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 text-slate-800 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Kredensial Login SiDesKu:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-white text-slate-800 font-mono font-bold text-xs border border-emerald-200 shadow-2xs">
                      ID: {warga.nik}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white text-emerald-900 font-mono font-bold text-xs border border-emerald-200 shadow-2xs">
                      PW: {pw}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onCopyCredentials(warga)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300 shadow-2xs"
                  >
                    {copiedId === warga.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Akun</span>
                      </>
                    )}
                  </button>

                  {warga.no_hp_wa && (
                    <a
                      href={`https://wa.me/${warga.no_hp_wa.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Halo Bapak/Ibu ${warga.nama_lengkap},\nAkun portal desa SiDesKu Anda telah aktif:\n• NIK: ${warga.nik}\n• Password: ${pw} (Format Tanggal Lahir)\nSilakan masuk di portal layanan mandiri desa.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Kirim WA</span>
                    </a>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed border-t border-white/10 pt-2">
                Warga dapat langsung login ke portal pelayanan mandiri menggunakan NIK dan password Tanggal Lahir tanpa memerlukan aktivasi email manual.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// KOMPONEN UTAMA PENDAFTARAN & REGISTER WARGA
// ==========================================
export const PendaftaranWargaDesa: React.FC = () => {
  const [wargas, setWargas] = useState<WargaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter States (per KK, RT, RW)
  const [selectedRw, setSelectedRw] = useState('all');
  const [selectedRt, setSelectedRt] = useState('all');
  const [selectedKkFilter, setSelectedKkFilter] = useState('all');

  // Pagination State (10 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRw, selectedRt, selectedKkFilter]);

  // Modal Detail State
  const [selectedDetailWarga, setSelectedDetailWarga] = useState<WargaItem | null>(null);

  // Modal Register Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Success state after registration
  const [lastRegistered, setLastRegistered] = useState<{
    warga: WargaItem;
    loginInfo: { nik: string; password_hint: string };
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nik: '',
    nama_lengkap: '',
    tempat_lahir: 'Kediri',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    agama: 'Islam',
    status_perkawinan: 'Kawin',
    pekerjaan: 'Wiraswasta / Buruh',
    pendidikan_terakhir: 'SMA/Sederajat',
    golongan_darah: 'O',
    no_hp_wa: '',
    alamat_ktp: 'Desa Doko, Kec. Ngasem, Kab. Kediri',
    rt_id: 1,
    no_kk: '',
    nama_kepala_keluarga: '',
    status_keluarga: 'Kepala Keluarga',
    status_ekonomi: 'Mampu',
    status_kependudukan: 'Tetap',
  });

  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchWargas();
  }, []);

  const fetchWargas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sekdes/warga');
      if (res.data.success) {
        setWargas(res.data.data);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formData.nik.length !== 16) {
      setFormError('NIK harus berjumlah tepat 16 digit angka.');
      return;
    }

    if (!formData.tanggal_lahir) {
      setFormError('Tanggal lahir wajib diisi (menjadi password login warga).');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        nama_kepala_keluarga: formData.nama_kepala_keluarga?.trim() || formData.nama_lengkap.trim(),
      };
      const res = await api.post('/sekdes/warga', payload);
      if (res.data.success) {
        setLastRegistered({
          warga: res.data.data,
          loginInfo: res.data.login_info,
        });
        setShowAddModal(false);
        fetchWargas();
        // Reset form
        setFormData({
          nik: '',
          nama_lengkap: '',
          tempat_lahir: 'Kediri',
          tanggal_lahir: '',
          jenis_kelamin: 'L',
          agama: 'Islam',
          status_perkawinan: 'Kawin',
          pekerjaan: 'Wiraswasta / Buruh',
          pendidikan_terakhir: 'SMA/Sederajat',
          golongan_darah: 'O',
          no_hp_wa: '',
          alamat_ktp: 'Desa Doko, Kec. Ngasem, Kab. Kediri',
          rt_id: 1,
          no_kk: '',
          nama_kepala_keluarga: '',
          status_keluarga: 'Kepala Keluarga',
          status_ekonomi: 'Mampu',
          status_kependudukan: 'Tetap',
        });
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Gagal mendaftarkan warga.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = (w: WargaItem) => {
    const pw = formatDobPassword(w.tanggal_lahir);
    const text = `Halo Bapak/Ibu ${w.nama_lengkap},\nAkun portal desa SiDesKu Anda telah aktif:\n• NIK: ${w.nik}\n• Password: ${pw} (Format Tanggal lahir)\nSilakan masuk di portal layanan mandiri desa.`;
    navigator.clipboard.writeText(text);
    setCopiedId(w.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // ==========================================
  // OPSI DINAMIS UNTUK FILTER
  // ==========================================
  const availableRws = useMemo(() => {
    const rws = new Set<string>();
    wargas.forEach((w) => {
      const rwNo = w.rt?.rw?.nomor_rw;
      if (rwNo) rws.add(rwNo);
    });
    return Array.from(rws).sort();
  }, [wargas]);

  const availableRts = useMemo(() => {
    const rts = new Set<string>();
    wargas.forEach((w) => {
      if (selectedRw === 'all' || w.rt?.rw?.nomor_rw === selectedRw) {
        const rtNo = w.rt?.nomor_rt;
        if (rtNo) rts.add(rtNo);
      }
    });
    return Array.from(rts).sort();
  }, [wargas, selectedRw]);

  const distinctKkList = useMemo(() => {
    const map = new Map<string, { no_kk: string; nama_kepala_keluarga: string; count: number }>();
    wargas.forEach((w) => {
      if (w.kartu_keluarga?.no_kk) {
        const noKk = w.kartu_keluarga.no_kk;
        if (!map.has(noKk)) {
          map.set(noKk, {
            no_kk: noKk,
            nama_kepala_keluarga: w.kartu_keluarga.nama_kepala_keluarga || w.nama_lengkap,
            count: 1,
          });
        } else {
          map.get(noKk)!.count += 1;
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.no_kk.localeCompare(b.no_kk));
  }, [wargas]);

  // ==========================================
  // FILTERING LOGIC
  // ==========================================
  const filteredWargas = useMemo(() => {
    return wargas.filter((w) => {
      // 1. Text Search (Nama, NIK, No KK, Kepala Keluarga, Alamat)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchNama = w.nama_lengkap.toLowerCase().includes(q);
        const matchNik = w.nik.toLowerCase().includes(q);
        const matchKk = (w.kartu_keluarga?.no_kk || '').toLowerCase().includes(q);
        const matchKepala = (w.kartu_keluarga?.nama_kepala_keluarga || '').toLowerCase().includes(q);
        const matchAlamat = (w.alamat_ktp || '').toLowerCase().includes(q);
        if (!matchNama && !matchNik && !matchKk && !matchKepala && !matchAlamat) {
          return false;
        }
      }

      // 2. Filter RW
      if (selectedRw !== 'all') {
        const rwNo = w.rt?.rw?.nomor_rw;
        if (rwNo !== selectedRw) return false;
      }

      // 3. Filter RT
      if (selectedRt !== 'all') {
        const rtNo = w.rt?.nomor_rt;
        if (rtNo !== selectedRt) return false;
      }

      // 4. Filter KK
      if (selectedKkFilter === 'kepala_keluarga') {
        if (w.status_keluarga !== 'Kepala Keluarga') return false;
      } else if (selectedKkFilter === 'punya_kk') {
        if (!w.kartu_keluarga?.no_kk) return false;
      } else if (selectedKkFilter === 'tanpa_kk') {
        if (w.kartu_keluarga?.no_kk) return false;
      } else if (selectedKkFilter !== 'all') {
        // Specific KK
        if (w.kartu_keluarga?.no_kk !== selectedKkFilter) return false;
      }

      return true;
    });
  }, [wargas, searchTerm, selectedRw, selectedRt, selectedKkFilter]);

  const isFiltered = searchTerm !== '' || selectedRw !== 'all' || selectedRt !== 'all' || selectedKkFilter !== 'all';

  const paginatedWargas = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredWargas.slice(start, start + PAGE_SIZE);
  }, [filteredWargas, currentPage, PAGE_SIZE]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedRw('all');
    setSelectedRt('all');
    setSelectedKkFilter('all');
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Registrasi Kependudukan Desa
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Pendaftaran & Buku Register Warga
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Warga didaftarkan langsung oleh Desa. Warga yang terdaftar dapat langsung login menggunakan NIK dan password Tanggal Lahir (DDMMYYYY).
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddModal(true);
            setFormError('');
          }}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md shadow-emerald-700/20 transition-all press-down flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Daftarkan Warga Baru</span>
        </button>
      </div>

      {/* Success Notification Banner if just registered (Clean White) */}
      {lastRegistered && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 text-slate-800 space-y-3 animate-fade-in shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Warga Baru Berhasil Terdaftar di Database Desa!</span>
            </div>
            <button
              onClick={() => setLastRegistered(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-emerald-200">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Nama & NIK:</span>
              <strong className="text-slate-900 text-sm block">{lastRegistered.warga.nama_lengkap}</strong>
              <span className="font-mono text-emerald-900 font-bold">NIK: {lastRegistered.warga.nik}</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Kredensial Login Otomatis Warga:</span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-xs">
                  ID: {lastRegistered.warga.nik}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono font-bold text-xs">
                  PW: Tanggal Lahir
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Warga kini dapat langsung login di portal tanpa perlu registrasi mandiri.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => handleCopyCredentials(lastRegistered.warga)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedId === lastRegistered.warga.id ? 'Tersalin!' : 'Salin Info Akun'}</span>
            </button>
            {lastRegistered.warga.no_hp_wa && (
              <a
                href={`https://wa.me/${lastRegistered.warga.no_hp_wa.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Halo Bapak/Ibu ${lastRegistered.warga.nama_lengkap}, akun portal desa SiDesKu Anda telah resmi terdaftar oleh Kantor Desa Doko. Anda dapat login langsung menggunakan NIK: ${lastRegistered.warga.nik} dan password tanggal lahir Anda.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Kirim via WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* FILTER & DATA TABLE CARD */}
      <div className="card-surface p-4 sm:p-6 space-y-4">
        
        {/* Toolbar: Search & Statistics */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama lengkap, NIK, atau KK..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Total Terdata:</span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black">
              {filteredWargas.length} dari {wargas.length} Jiwa
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[11px] border border-slate-200">
              {distinctKkList.length} KK
            </span>
          </div>
        </div>

        {/* TOOLBAR FILTER: PER RW, PER RT, PER KK */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold shrink-0">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>Filter Kependudukan:</span>
          </div>

          {/* Filter RW */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-slate-500 font-semibold">RW:</label>
            <select
              value={selectedRw}
              onChange={(e) => {
                setSelectedRw(e.target.value);
                setSelectedRt('all'); // Reset RT saat RW berubah
              }}
              className="p-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua RW</option>
              {availableRws.map((rwNo) => (
                <option key={rwNo} value={rwNo}>
                  RW {rwNo}
                </option>
              ))}
            </select>
          </div>

          {/* Filter RT */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-slate-500 font-semibold">RT:</label>
            <select
              value={selectedRt}
              onChange={(e) => setSelectedRt(e.target.value)}
              className="p-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua RT</option>
              {availableRts.map((rtNo) => (
                <option key={rtNo} value={rtNo}>
                  RT {rtNo}
                </option>
              ))}
            </select>
          </div>

          {/* Filter KK / Status Keluarga */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-slate-500 font-semibold">Kartu Keluarga (KK):</label>
            <select
              value={selectedKkFilter}
              onChange={(e) => setSelectedKkFilter(e.target.value)}
              className="p-1.5 px-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[200px] truncate"
            >
              <option value="all">Semua Warga & KK</option>
              <option value="kepala_keluarga">Kepala Keluarga Saja</option>
              <option value="punya_kk">Warga Memiliki KK</option>
              <option value="tanpa_kk">Belum Terhubung KK</option>
              {distinctKkList.length > 0 && (
                <optgroup label="Pilih KK Tertentu:">
                  {distinctKkList.map((kk) => (
                    <option key={kk.no_kk} value={kk.no_kk}>
                      KK {kk.no_kk} ({kk.nama_kepala_keluarga})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Tombol Reset Filter jika aktif */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="ml-auto px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Mobile Cards View - No Horizontal Overflow */}
        <div className="block md:hidden space-y-3">
          {loading ? (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-emerald-600" />
              <span>Memuat data register warga...</span>
            </div>
          ) : filteredWargas.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              Tidak ada warga yang sesuai dengan kriteria filter atau pencarian.
            </div>
          ) : (
            paginatedWargas.map((w) => {
              const pw = formatDobPassword(w.tanggal_lahir);

              return (
                <div key={w.id} className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-slate-800 text-xs">NIK: {w.nik}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-[10px]">
                      RT {w.rt?.nomor_rt || '01'} / RW {w.rt?.rw?.nomor_rw || '01'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{w.nama_lengkap}</h4>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      <span className={w.status_keluarga === 'Kepala Keluarga' ? 'font-bold text-emerald-800' : ''}>
                        {w.status_keluarga || 'Anggota'}
                      </span>
                      {' • '}{w.pekerjaan || 'Wiraswasta'}
                      {w.kartu_keluarga?.no_kk && (
                        <span className="font-mono text-slate-400 block sm:inline">
                          {' '}(KK: {w.kartu_keluarga.no_kk})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Tgl Lahir (Password)</span>
                      <span className="font-mono text-emerald-800 font-bold">PW: {pw}</span>
                    </div>
                    {w.no_hp_wa && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold">WhatsApp</span>
                        <span className="font-mono text-slate-700">{w.no_hp_wa}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDetailWarga(w)}
                      className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Detail Lengkap</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyCredentials(w)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      title="Salin NIK & Password"
                    >
                      {copiedId === w.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tabel Data Warga (Desktop) */}
        <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-3.5">NIK (Username)</th>
                <th className="py-3 px-3.5">Nama Lengkap & KK</th>
                <th className="py-3 px-3.5">Tanggal Lahir (Password)</th>
                <th className="py-3 px-3.5">RT / RW</th>
                <th className="py-3 px-3.5">No. WhatsApp</th>
                <th className="py-3 px-3.5 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1 text-emerald-600" />
                    <span>Memuat data register warga...</span>
                  </td>
                </tr>
              ) : filteredWargas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada warga yang sesuai dengan kriteria filter atau pencarian.
                    {isFiltered && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="px-3 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Hapus Filter</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedWargas.map((w) => {
                  const dob = new Date(w.tanggal_lahir);
                  const pw = formatDobPassword(w.tanggal_lahir);

                  return (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-800">
                        {w.nik}
                      </td>
                      <td className="py-3 px-3.5">
                        <div 
                          className="font-extrabold text-slate-900 text-xs sm:text-sm hover:text-emerald-700 cursor-pointer flex items-center gap-1 group"
                          onClick={() => setSelectedDetailWarga(w)}
                          title="Klik untuk melihat detail warga"
                        >
                          <span>{w.nama_lengkap}</span>
                          <Eye className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          <span className={w.status_keluarga === 'Kepala Keluarga' ? 'font-bold text-emerald-800' : ''}>
                            {w.status_keluarga || 'Anggota'}
                          </span>
                          {' • '}{w.pekerjaan || 'Warga'}
                          {w.kartu_keluarga?.no_kk && (
                            <span className="font-mono text-slate-400 ml-1">
                              (KK: {w.kartu_keluarga.no_kk})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-slate-700">
                          {dob.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-700 font-bold">
                          PW: {pw}
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-[10px]">
                          RT {w.rt?.nomor_rt || '01'} / RW {w.rt?.rw?.nomor_rw || '01'}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 font-mono">
                        {w.no_hp_wa || '-'}
                      </td>
                      <td className="py-3 px-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Tombol Detail Warga */}
                          <button
                            type="button"
                            onClick={() => setSelectedDetailWarga(w)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Buka Detail Lengkap Warga & Kartu Keluarga"
                          >
                            <Eye className="w-3 h-3 text-emerald-700" />
                            <span>Detail</span>
                          </button>

                          {/* Tombol Salin Kredensial */}
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(w)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] border border-slate-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Salin kredensial NIK & PW Tanggal Lahir"
                          >
                            {copiedId === w.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span>Salin Akun</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredWargas.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="warga"
        />
      </div>

      {/* MODAL DETAIL LENGKAP WARGA & KARTU KELUARGA */}
      <WargaDetailModal
        warga={selectedDetailWarga}
        onClose={() => setSelectedDetailWarga(null)}
        onCopyCredentials={handleCopyCredentials}
        copiedId={copiedId}
      />

      {/* MODAL PENDAFTARAN WARGA BARU */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-[999999] flex items-start justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-fade-in font-sans overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[88vh] flex flex-col overflow-hidden my-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 block">Formulir Desa</span>
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    Pendaftaran Warga Baru ke Database Desa
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 mx-6 mt-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="p-6 overflow-y-auto space-y-3.5 text-xs">
              
              {/* Row 1: NIK & No KK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">NIK (16 Digit Angka) *</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                    placeholder="Contoh: 3506041505840001"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nomor Kartu Keluarga (KK)</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.no_kk}
                    onChange={(e) => setFormData({ ...formData, no_kk: e.target.value.replace(/\D/g, '') })}
                    placeholder="Contoh: 3506041208010001"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 2: Nama Lengkap */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Lengkap (Sesuai KTP) *</label>
                <input
                  type="text"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  placeholder="Contoh: Bambang Utomo"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Row Opsional: Nama Kepala Keluarga jika KK terisi */}
              {formData.no_kk && (
                <div className="space-y-1 animate-fade-in">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Nama Kepala Keluarga di KK (Opsional)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Otomatis nama warga jika kosong</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama_kepala_keluarga}
                    onChange={(e) => setFormData({ ...formData, nama_kepala_keluarga: e.target.value })}
                    placeholder={`Default: ${formData.nama_lengkap || 'Nama Kepala Keluarga'}`}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Row 3: Tempat & Tanggal Lahir (Password Warga) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tempat Lahir *</label>
                  <input
                    type="text"
                    value={formData.tempat_lahir}
                    onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                    placeholder="Contoh: Kediri"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Tanggal Lahir (Password Warga) *</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">Auto-Password</span>
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Row 4: Jenis Kelamin, RT, No WA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Jenis Kelamin *</label>
                  <select
                    value={formData.jenis_kelamin}
                    onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">RT Domisili *</label>
                  <select
                    value={formData.rt_id}
                    onChange={(e) => setFormData({ ...formData, rt_id: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  >
                    <option value={1}>RT 01 / RW 01 (Krajan)</option>
                    <option value={2}>RT 02 / RW 01</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">No. WhatsApp</label>
                  <input
                    type="text"
                    value={formData.no_hp_wa}
                    onChange={(e) => setFormData({ ...formData, no_hp_wa: e.target.value })}
                    placeholder="Contoh: 085712345678"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Row 5: Alamat KTP */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Alamat KTP Lengkap *</label>
                <input
                  type="text"
                  value={formData.alamat_ktp}
                  onChange={(e) => setFormData({ ...formData, alamat_ktp: e.target.value })}
                  placeholder="Contoh: Jl. Kenanga No. 14, RT 01 / RW 01 Desa Doko"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Helper Notice */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 flex items-start gap-2">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Sistem Otomatisasi:</strong> Akun portal desa akan langsung aktif seketika setelah formulir ini disimpan. Warga dapat login di portal mandiri menggunakan <strong>NIK</strong> dan <strong>Tanggal Lahir</strong> (format: DDMMYYYY atau YYYY-MM-DD).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Warga & Buat Akun'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
