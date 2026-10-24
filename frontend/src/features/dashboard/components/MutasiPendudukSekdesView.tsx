import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  MapPin, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Heart,
  UserMinus,
  UserPlus,
  X
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { Pagination } from '@/shared/components/Pagination';

interface MutasiRecord {
  id: number;
  jenis_mutasi: 'masuk' | 'keluar' | 'lahir' | 'mati';
  tanggal_peristiwa: string;
  nik?: string;
  nama_lengkap: string;
  jenis_kelamin: 'L' | 'P';
  rt_id?: number;
  rt?: {
    nomor_rt: string;
    rw?: {
      nomor_rw: string;
    };
  };
  alamat_asal?: string;
  alamat_tujuan?: string;
  keterangan?: string;
  nomor_surat_keterangan?: string;
  petugas?: {
    name: string;
    username: string;
  };
}

export const MutasiPendudukSekdesView: React.FC = () => {
  const [records, setRecords] = useState<MutasiRecord[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    masuk: 0,
    keluar: 0,
    lahir: 0,
    mati: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'masuk' | 'keluar' | 'lahir' | 'mati'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal Catat Mutasi
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    jenis_mutasi: 'masuk',
    tanggal_peristiwa: new Date().toISOString().split('T')[0],
    nama_lengkap: '',
    nik: '',
    jenis_kelamin: 'L',
    rt_id: 1,
    alamat_asal: '',
    alamat_tujuan: '',
    keterangan: '',
    nomor_surat_keterangan: '',
  });

  useEffect(() => {
    fetchRecords();
  }, [activeFilter]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sekdes/mutasi', {
        params: {
          jenis_mutasi: activeFilter,
        },
      });
      if (res.data.success) {
        setRecords(res.data.data);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_lengkap.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const res = await api.post('/sekdes/mutasi', {
        ...formData,
        rt_id: Number(formData.rt_id),
      });

      if (res.data.success) {
        setShowModal(false);
        setFormData({
          jenis_mutasi: 'masuk',
          tanggal_peristiwa: new Date().toISOString().split('T')[0],
          nama_lengkap: '',
          nik: '',
          jenis_kelamin: 'L',
          rt_id: 1,
          alamat_asal: '',
          alamat_tujuan: '',
          keterangan: '',
          nomor_surat_keterangan: '',
        });
        fetchRecords();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Gagal mencatat mutasi penduduk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Hapus catatan mutasi penduduk ini dari Buku Register?')) return;
    try {
      const res = await api.delete(`/sekdes/mutasi/${id}`);
      if (res.data.success) {
        fetchRecords();
      }
    } catch (err: any) {
      alert('Gagal menghapus: ' + (err.response?.data?.message || 'Error'));
    }
  };

  // Pagination state (10 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter]);

  const filteredRecords = records.filter((r) =>
    !searchTerm ||
    r.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.nik && r.nik.includes(searchTerm)) ||
    (r.nomor_surat_keterangan && r.nomor_surat_keterangan.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getJenisBadge = (jenis: string) => {
    switch (jenis) {
      case 'masuk':
        return <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-200">Pindah Masuk</span>;
      case 'keluar':
        return <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-200">Pindah Keluar</span>;
      case 'lahir':
        return <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-blue-100 text-blue-900 border border-blue-200">Kelahiran</span>;
      case 'mati':
        return <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-rose-100 text-rose-900 border border-rose-200">Kematian</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">{jenis}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Buku Administrasi Penduduk Model A.2 (Permendagri No. 47/2016)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Buku Mutasi Penduduk Desa Doko
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pencatatan resmi dinamika kependudukan: perpindahan domisili (masuk/keluar), kelahiran baru, dan peristiwa kematian warga.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Catat Mutasi Baru</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Mutasi</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{summary.total} <span className="text-xs font-bold text-slate-400">Kasus</span></div>
          <span className="text-[10px] text-slate-500 font-bold">Tahun 2026</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">Pindah Masuk</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-900">+{summary.masuk} <span className="text-xs font-bold text-slate-400">Jiwa</span></div>
          <span className="text-[10px] text-emerald-700 font-bold">Warga Pendatang</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">Pindah Keluar</span>
          <div className="text-xl sm:text-2xl font-black text-amber-900">-{summary.keluar} <span className="text-xs font-bold text-slate-400">Jiwa</span></div>
          <span className="text-[10px] text-amber-700 font-bold">Pindah Domisili</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">Kelahiran</span>
          <div className="text-xl sm:text-2xl font-black text-blue-900">+{summary.lahir} <span className="text-xs font-bold text-slate-400">Bayi</span></div>
          <span className="text-[10px] text-blue-700 font-bold">Lahir di Desa</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider block">Kematian</span>
          <div className="text-xl sm:text-2xl font-black text-rose-900">-{summary.mati} <span className="text-xs font-bold text-slate-400">Jiwa</span></div>
          <span className="text-[10px] text-rose-700 font-bold">Tercatat di Akta</span>
        </div>
      </div>

      {/* Main Table Surface */}
      <div className="card-surface p-4 sm:p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Semua Peristiwa' },
              { id: 'masuk', label: 'Pindah Masuk' },
              { id: 'keluar', label: 'Pindah Keluar' },
              { id: 'lahir', label: 'Kelahiran' },
              { id: 'mati', label: 'Kematian' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveFilter(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeFilter === t.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, NIK, atau no. surat..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
          <table className="w-full text-left text-xs min-w-[800px] sm:min-w-0">
            <thead className="bg-[#f8faf9] text-gray-600 border-b border-gray-200 font-semibold">
              <tr>
                <th className="py-3 px-3.5">Tanggal</th>
                <th className="py-3 px-3.5">Jenis Mutasi</th>
                <th className="py-3 px-3.5">Nama & NIK Penduduk</th>
                <th className="py-3 px-3.5">L/P</th>
                <th className="py-3 px-3.5">Wilayah</th>
                <th className="py-3 px-3.5">Alamat Asal / Tujuan</th>
                <th className="py-3 px-3.5">Keterangan / No. Surat</th>
                <th className="py-3 px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    Belum ada catatan mutasi penduduk pada kategori ini.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => (
                  <tr key={r.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-700">
                      {new Date(r.tanggal_peristiwa).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {getJenisBadge(r.jenis_mutasi)}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-extrabold text-slate-900 text-sm leading-tight">{r.nama_lengkap}</div>
                      <div className="font-mono text-slate-400 text-[11px] mt-0.5">{r.nik ? `NIK: ${r.nik}` : '-'}</div>
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-700">{r.jenis_kelamin}</td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        RT {r.rt?.nomor_rt || r.rt_id || '01'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 text-xs max-w-[180px] truncate" title={r.alamat_tujuan || r.alamat_asal}>
                      {r.jenis_mutasi === 'masuk' ? `Asal: ${r.alamat_asal}` : r.jenis_mutasi === 'keluar' ? `Tujuan: ${r.alamat_tujuan}` : (r.alamat_tujuan || r.alamat_asal || '-')}
                    </td>
                    <td className="py-3 px-3.5 text-xs">
                      <div className="font-medium text-slate-800 line-clamp-1">{r.keterangan || '-'}</div>
                      {r.nomor_surat_keterangan && (
                        <div className="font-mono text-[10px] text-emerald-800 font-bold">{r.nomor_surat_keterangan}</div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                        title="Hapus Catatan Mutasi"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredRecords.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="mutasi"
        />
      </div>

      {/* Modal Catat Mutasi Baru */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0f241d]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  Formulir Administrasi Desa
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Catat Peristiwa Mutasi Penduduk Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Jenis Peristiwa Mutasi</label>
                  <select
                    value={formData.jenis_mutasi}
                    onChange={(e) => setFormData({ ...formData, jenis_mutasi: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
                  >
                    <option value="masuk">Pindah Masuk (Penduduk Datang)</option>
                    <option value="keluar">Pindah Keluar (Pindah Domisili)</option>
                    <option value="lahir">Kelahiran (Kelahiran Baru)</option>
                    <option value="mati">Kematian (Meninggal Dunia)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tanggal Peristiwa</label>
                  <input
                    type="date"
                    value={formData.tanggal_peristiwa}
                    onChange={(e) => setFormData({ ...formData, tanggal_peristiwa: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Lengkap Penduduk / Bayi <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  placeholder="Nama lengkap sesuai akta / KTP..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-2">
                  <label className="font-bold text-slate-700">NIK (16 Digit)</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    placeholder="Kosongkan jika bayi baru lahir..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Jenis Kelamin</label>
                  <select
                    value={formData.jenis_kelamin}
                    onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  >
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Wilayah RT Domisili</label>
                <select
                  value={formData.rt_id}
                  onChange={(e) => setFormData({ ...formData, rt_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                >
                  <option value={1}>RT 01 / RW 01 (Krajan)</option>
                  <option value={2}>RT 02 / RW 01 (Krajan)</option>
                </select>
              </div>

              {formData.jenis_mutasi === 'masuk' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Alamat Asal Pendatang</label>
                  <input
                    type="text"
                    value={formData.alamat_asal}
                    onChange={(e) => setFormData({ ...formData, alamat_asal: e.target.value })}
                    placeholder="Contoh: Kel. Burengan, Kota Kediri..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              )}

              {formData.jenis_mutasi === 'keluar' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Alamat Tujuan Pindah</label>
                  <input
                    type="text"
                    value={formData.alamat_tujuan}
                    onChange={(e) => setFormData({ ...formData, alamat_tujuan: e.target.value })}
                    placeholder="Contoh: Desa Sonorejo, Kab. Nganjuk..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Keterangan / Alasan</label>
                  <input
                    type="text"
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    placeholder="Contoh: Ikut orang tua / perkawinan..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">No. Surat Keterangan / SKP</label>
                  <input
                    type="text"
                    value={formData.nomor_surat_keterangan}
                    onChange={(e) => setFormData({ ...formData, nomor_surat_keterangan: e.target.value })}
                    placeholder="Contoh: 471/021/SKP/2026..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold cursor-pointer shadow-sm"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Catatan Mutasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
