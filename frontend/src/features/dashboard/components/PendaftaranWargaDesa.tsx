import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  CheckCircle2, 
  X, 
  Copy, 
  Check, 
  CreditCard, 
  Phone, 
  MapPin, 
  Calendar, 
  Lock,
  MessageCircle,
  Eye,
  RefreshCw,
  Users
} from 'lucide-react';
import api from '@/shared/lib/axios';

interface WargaItem {
  id: number;
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  alamat_ktp: string;
  no_hp_wa: string;
  status_keluarga: string;
  status_ekonomi: string;
  pekerjaan?: string;
  rt?: {
    id: number;
    nomor_rt: string;
    rw?: {
      nomor_rw: string;
    };
  };
  kartu_keluarga?: {
    no_kk: string;
    nama_kepala_keluarga: string;
  };
}

export const PendaftaranWargaDesa: React.FC = () => {
  const [wargas, setWargas] = useState<WargaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
      const res = await api.post('/sekdes/warga', formData);
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
    const dob = new Date(w.tanggal_lahir);
    const day = String(dob.getDate()).padStart(2, '0');
    const month = String(dob.getMonth() + 1).padStart(2, '0');
    const year = dob.getFullYear();
    const dmy = `${day}${month}${year}`;

    const text = `Halo Bapak/Ibu ${w.nama_lengkap},\nAkun portal desa SiDesKu Anda telah aktif:\n• NIK: ${w.nik}\n• Password: ${dmy} (Tanggal lahir)\nSilakan masuk di portal layanan desa.`;
    navigator.clipboard.writeText(text);
    setCopiedId(w.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredWargas = wargas.filter((w) => {
    const q = searchTerm.toLowerCase();
    return (
      w.nama_lengkap.toLowerCase().includes(q) ||
      w.nik.toLowerCase().includes(q) ||
      (w.kartu_keluarga?.no_kk || '').includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
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
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-600/25 transition-all press-down flex items-center gap-2 cursor-pointer self-start sm:self-auto hover-glow"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Daftarkan Warga Baru</span>
        </button>
      </div>

      {/* Success Notification Banner if just registered */}
      {lastRegistered && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 text-slate-800 space-y-3 animate-fade-in shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-950 font-black text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Warga Baru Berhasil Terdaftar di Database Desa!</span>
            </div>
            <button
              onClick={() => setLastRegistered(null)}
              className="text-slate-400 hover:text-slate-700"
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

      {/* Search and Table */}
      <div className="card-surface p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama lengkap, NIK, atau KK..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Total Warga Terdata:</span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black">
              {filteredWargas.length} Jiwa
            </span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-3.5">NIK (Username)</th>
                <th className="py-3 px-3.5">Nama Lengkap</th>
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
                    Tidak ada warga yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredWargas.map((w) => {
                  const dob = new Date(w.tanggal_lahir);
                  const day = String(dob.getDate()).padStart(2, '0');
                  const month = String(dob.getMonth() + 1).padStart(2, '0');
                  const year = dob.getFullYear();
                  const dmy = `${day}${month}${year}`;

                  return (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-800">
                        {w.nik}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {w.nama_lengkap}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {w.status_keluarga || 'Anggota'} • {w.pekerjaan || 'Warga'}
                        </div>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-slate-700">
                          {dob.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] font-mono text-emerald-700 font-bold">
                          PW: {dmy}
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
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(w)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold text-[10px] border border-slate-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Salin kredensial NIK & PW Tanggal Lahir"
                        >
                          {copiedId === w.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>Salin Akun</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pendaftaran Warga Baru */}
      {showAddModal && (
        <div 
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-[999999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full space-y-4 shadow-2xl border border-slate-200 animate-scale-up my-auto max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Formulir Desa
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                  Pendaftaran Warga Baru ke Database Desa
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              
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
