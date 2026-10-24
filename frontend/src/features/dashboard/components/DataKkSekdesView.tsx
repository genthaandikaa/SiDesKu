import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Users, 
  Eye, 
  Copy, 
  Check, 
  CheckCircle2, 
  MapPin, 
  HeartHandshake,
  Download,
  X,
  CreditCard,
  User
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { Pagination } from '@/shared/components/Pagination';

interface AnggotaKeluargaItem {
  id: number;
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  agama?: string;
  pekerjaan?: string;
  status_keluarga: string;
  status_ekonomi?: string;
}

interface KartuKeluargaItem {
  id: number;
  no_kk: string;
  nama_kepala_keluarga: string;
  alamat_lengkap: string;
  rt_id?: number;
  rt?: {
    id: number;
    nomor_rt: string;
    rw?: {
      id: number;
      nomor_rw: string;
    };
  };
  anggotaKeluarga?: AnggotaKeluargaItem[];
  anggota_keluarga?: AnggotaKeluargaItem[];
}

export const DataKkSekdesView: React.FC = () => {
  const [kkList, setKkList] = useState<KartuKeluargaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRt, setSelectedRt] = useState<string>('all');
  const [copiedKk, setCopiedKk] = useState<string | null>(null);
  const [selectedKkDetail, setSelectedKkDetail] = useState<KartuKeluargaItem | null>(null);

  useEffect(() => {
    fetchKkList();
  }, []);

  const fetchKkList = async () => {
    try {
      setLoading(true);
      const res = await api.get('/warga/kartu-keluarga');
      if (res.data.success && Array.isArray(res.data.data)) {
        setKkList(res.data.data);
      }
    } catch {
      // Fallback: try admin endpoint
      try {
        const adminRes = await api.get('/admin/warga/kartu-keluarga');
        if (adminRes.data.success && Array.isArray(adminRes.data.data)) {
          setKkList(adminRes.data.data);
        }
      } catch {
        //
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKk(text);
    setTimeout(() => setCopiedKk(null), 2000);
  };

  // Pagination state (10 data per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRt]);

  // Filter logic
  const filteredKk = kkList.filter((kk) => {
    const matchSearch = !searchTerm ||
      kk.no_kk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kk.nama_kepala_keluarga?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kk.alamat_lengkap?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchRt = selectedRt === 'all' || 
      String(kk.rt?.nomor_rt || kk.rt_id) === selectedRt;

    return matchSearch && matchRt;
  });

  const paginatedKk = filteredKk.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalKk = kkList.length;
  const totalJiwa = kkList.reduce((acc, k) => acc + (k.anggotaKeluarga?.length || k.anggota_keluarga?.length || 0), 0);
  const avgJiwaPerKk = totalKk > 0 ? (totalJiwa / totalKk).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Buku Administrasi Penduduk Model A.3
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Buku Register Kartu Keluarga (KK) Desa Doko
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pencatatan resmi seluruh kepala keluarga dan susunan anggota keluarga di seluruh lingkungan RW dan RT Desa Doko.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold text-xs border border-emerald-200 self-start sm:self-auto">
          {totalKk} Kartu Keluarga Terdata
        </span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Kepala Keluarga</span>
          <div className="text-2xl font-black text-slate-900">{totalKk} <span className="text-xs font-bold text-slate-500">KK</span></div>
          <span className="text-[11px] text-emerald-700 font-bold">100% Tercatat di Buku Induk</span>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Anggota Keluarga (Jiwa)</span>
          <div className="text-2xl font-black text-emerald-900">{totalJiwa} <span className="text-xs font-bold text-slate-500">Jiwa</span></div>
          <span className="text-[11px] text-slate-500 font-bold">Tersebar di 3 RW dan 13 RT</span>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Rata-rata Anggota / KK</span>
          <div className="text-2xl font-black text-slate-900">{avgJiwaPerKk} <span className="text-xs font-bold text-slate-500">Jiwa / KK</span></div>
          <span className="text-[11px] text-slate-500 font-bold">Rasio Kependudukan Standar</span>
        </div>
      </div>

      {/* Main Table Surface */}
      <div className="card-surface p-4 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari No. KK, Nama Kepala Keluarga, atau alamat..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Wilayah RT:</span>
            <select
              value={selectedRt}
              onChange={(e) => setSelectedRt(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="all">Semua Wilayah RT</option>
              <option value="01">RT 01</option>
              <option value="02">RT 02</option>
              <option value="03">RT 03</option>
            </select>
          </div>
        </div>

        {/* Mobile Cards View - No Horizontal Overflow */}
        <div className="block md:hidden space-y-3">
          {filteredKk.length === 0 ? (
            <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
              Tidak ada data Kartu Keluarga yang cocok dengan pencarian.
            </div>
          ) : (
            paginatedKk.map((kk) => {
              const members = kk.anggotaKeluarga || kk.anggota_keluarga || [];
              const rtNum = kk.rt?.nomor_rt || kk.rt_id || '01';
              const rwNum = kk.rt?.rw?.nomor_rw || '01';

              return (
                <div key={kk.id} className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 text-xs">
                      <span>{kk.no_kk}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(kk.no_kk)}
                        className="p-1 text-slate-400 hover:text-emerald-700 rounded cursor-pointer"
                        title="Salin No KK"
                      >
                        {copiedKk === kk.no_kk ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200">
                      RT {rtNum} / RW {rwNum}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{kk.nama_kepala_keluarga}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{kk.alamat_lengkap}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {members.length} Jiwa
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedKkDetail(kk)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye size={13} className="text-emerald-600" />
                      <span>Anggota ({members.length})</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto border border-gray-200 rounded-2xl shadow-sm">
          <table className="w-full text-left text-xs min-w-[760px] sm:min-w-0">
            <thead className="bg-[#f8faf9] text-gray-600 border-b border-gray-200 font-semibold">
              <tr>
                <th className="py-3 px-3.5">Nomor KK</th>
                <th className="py-3 px-3.5">Nama Kepala Keluarga</th>
                <th className="py-3 px-3.5">Wilayah</th>
                <th className="py-3 px-3.5">Alamat Lengkap</th>
                <th className="py-3 px-3.5 text-center">Anggota</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap sticky right-0 bg-[#f8faf9] z-10 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredKk.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Tidak ada data Kartu Keluarga yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                paginatedKk.map((kk) => {
                  const members = kk.anggotaKeluarga || kk.anggota_keluarga || [];
                  const rtNum = kk.rt?.nomor_rt || kk.rt_id || '01';
                  const rwNum = kk.rt?.rw?.nomor_rw || '01';

                  return (
                    <tr key={kk.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{kk.no_kk}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(kk.no_kk)}
                            className="p-1 text-slate-400 hover:text-emerald-700 rounded cursor-pointer"
                            title="Salin No KK"
                          >
                            {copiedKk === kk.no_kk ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 font-extrabold text-slate-900 text-sm">
                        {kk.nama_kepala_keluarga}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200">
                          RT {rtNum} / RW {rwNum}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-600 text-xs max-w-[200px] truncate" title={kk.alamat_lengkap}>
                        {kk.alamat_lengkap}
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {members.length} Jiwa
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-gray-50 z-10 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.06)] transition-colors">
                        <button
                          type="button"
                          onClick={() => setSelectedKkDetail(kk)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye size={13} className="text-emerald-600" />
                          <span>Anggota Keluarga</span>
                        </button>
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
          totalItems={filteredKk.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          itemLabel="kartu keluarga"
        />
      </div>

      {/* Modal Detail Anggota Keluarga */}
      {selectedKkDetail && (
        <div className="fixed inset-0 z-50 bg-[#0f241d]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-xl animate-scale-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                  Susunan Anggota Keluarga
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Kartu Keluarga: {selectedKkDetail.no_kk}
                </h3>
                <p className="text-xs text-slate-500">
                  Kepala Keluarga: <span className="font-bold text-slate-800">{selectedKkDetail.nama_kepala_keluarga}</span> • {selectedKkDetail.alamat_lengkap}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKkDetail(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              <div className="border border-slate-200 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[550px] sm:min-w-0">
                  <thead className="bg-[#f8faf9] text-gray-600 border-b border-gray-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">NIK</th>
                      <th className="py-2.5 px-3">Nama Anggota</th>
                      <th className="py-2.5 px-3">Status Keluarga</th>
                      <th className="py-2.5 px-3">L/P</th>
                      <th className="py-2.5 px-3">Tempat, Tgl Lahir</th>
                      <th className="py-2.5 px-3">Pekerjaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(selectedKkDetail.anggotaKeluarga || selectedKkDetail.anggota_keluarga || []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          Belum ada anggota keluarga yang terdaftar pada nomor KK ini.
                        </td>
                      </tr>
                    ) : (
                      (selectedKkDetail.anggotaKeluarga || selectedKkDetail.anggota_keluarga || []).map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{m.nik}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{m.nama_lengkap}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              m.status_keluarga === 'Kepala Keluarga' 
                                ? 'bg-emerald-100 text-emerald-900' 
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {m.status_keluarga}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-700">{m.jenis_kelamin}</td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {m.tempat_lahir}, {m.tanggal_lahir ? new Date(m.tanggal_lahir).toLocaleDateString('id-ID') : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{m.pekerjaan || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedKkDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
