import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X,
  Lightbulb,
  BellRing, 
  Send, 
  CheckCircle2, 
  Users, 
  Plus, 
  QrCode, 
  Smartphone, 
  Check, 
  Calendar,
  DollarSign
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { BantuanSosial, BantuanPenerima } from '@/shared/types';
import { Pagination } from '@/shared/components/Pagination';

interface BansosManagerProps {
  isKades?: boolean;
}

export const BansosManager: React.FC<BansosManagerProps> = ({ isKades = false }) => {
  const [bansosList, setBansosList] = useState<BantuanSosial[]>([]);
  const [selectedBansos, setSelectedBansos] = useState<BantuanSosial | null>(null);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccessMessage, setBroadcastSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'programs' | 'broadcastLogs'>('programs');
  const [notifLogs, setNotifLogs] = useState<any[]>([]);
  
  // Pagination State
  const [pagePenerima, setPagePenerima] = useState(1);
  const [pageLogs, setPageLogs] = useState(1);

  // Verification input
  const [scanQrInput, setScanQrInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);

  // In-memory cache for instant detail switching without delays
  const detailCacheRef = useRef<Record<number, BantuanSosial>>({});

  useEffect(() => {
    // Instant cache rehydration for seamless tab switching
    try {
      const cached = sessionStorage.getItem('sides_bansos_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBansosList(parsed);
          setSelectedBansos(parsed[0]);
          setLoading(false);
        }
      }
    } catch {
      // ignore
    }

    Promise.allSettled([fetchBansos(), fetchLogs()]);
  }, []);

  const fetchBansos = async () => {
    try {
      const res = await api.get('/bansos');
      if (res.data.success) {
        setBansosList(res.data.data);
        try {
          sessionStorage.setItem('sides_bansos_cache', JSON.stringify(res.data.data));
        } catch {}
        if (res.data.data.length > 0) {
          const firstId = res.data.data[0].id;
          if (!selectedBansos || !selectedBansos.penerimas) {
            fetchDetail(firstId);
          }
        }
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id: number) => {
    // If cached in memory, show immediately for instant responsive UI
    if (detailCacheRef.current[id]) {
      setSelectedBansos(detailCacheRef.current[id]);
      setPagePenerima(1);
    }
    try {
      const res = await api.get(`/bansos/${id}`);
      if (res.data.success) {
        detailCacheRef.current[id] = res.data.data;
        setSelectedBansos(res.data.data);
        setPagePenerima(1);
      }
    } catch {
      //
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await api.get('/notifikasi-logs');
      if (res.data.success) {
        setNotifLogs(res.data.data);
      }
    } catch {
      //
    }
  };

  // Edit Schedule & Location State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nama_bantuan: '',
    tahap: '',
    tanggal_penyaluran: '',
    waktu_mulai: '',
    lokasi_penyaluran: '',
    nominal_per_penerima: 0,
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const handleOpenEdit = () => {
    if (!selectedBansos) return;
    setEditForm({
      nama_bantuan: selectedBansos.nama_bantuan || '',
      tahap: selectedBansos.tahap || '',
      tanggal_penyaluran: selectedBansos.tanggal_penyaluran ? String(selectedBansos.tanggal_penyaluran).split('T')[0] : '',
      waktu_mulai: selectedBansos.waktu_mulai || '08:30',
      lokasi_penyaluran: selectedBansos.lokasi_penyaluran || 'Pendopo Balai Desa Doko',
      nominal_per_penerima: Number(selectedBansos.nominal_per_penerima) || 0,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBansos) return;
    if (!editForm.lokasi_penyaluran.trim() || !editForm.tanggal_penyaluran) {
      alert('Lokasi dan tanggal penyaluran wajib diisi.');
      return;
    }

    try {
      setIsSavingEdit(true);
      const res = await api.put(`/bansos/${selectedBansos.id}`, {
        nama_bantuan: editForm.nama_bantuan,
        tahap: editForm.tahap,
        tanggal_penyaluran: editForm.tanggal_penyaluran,
        waktu_mulai: editForm.waktu_mulai,
        lokasi_penyaluran: editForm.lokasi_penyaluran,
        nominal_per_penerima: editForm.nominal_per_penerima,
      });
      if (res.data.success) {
        setShowEditModal(false);
        setBroadcastSuccessMessage('Jadwal dan lokasi penyaluran berhasil diperbarui secara permanen.');
        await Promise.all([fetchDetail(selectedBansos.id), fetchBansos()]);
      }
    } catch (err: any) {
      alert('Gagal menyimpan perubahan: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handlePublishAndBroadcast = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin mempublikasikan bantuan ini dan mengirimkan notifikasi siaran WhatsApp otomatis ke seluruh nomor warga penerima?')) {
      return;
    }

    setBroadcasting(true);
    setBroadcastSuccessMessage(null);

    try {
      const res = await api.post(`/bansos/${id}/publish-broadcast`);
      if (res.data.success) {
        setBroadcastSuccessMessage(res.data.message);
        await Promise.all([fetchDetail(id), fetchBansos(), fetchLogs()]);
      }
    } catch (err: any) {
      alert('Gagal mengirim broadcast: ' + (err.response?.data?.message || 'Error'));
    } finally {
      setBroadcasting(false);
    }
  };

  const handleVerifyDisalurkan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBansos || !scanQrInput.trim()) return;

    try {
      const res = await api.post(`/bansos/${selectedBansos.id}/verify-disalurkan`, {
        qr_bantuan_code: scanQrInput.trim(),
      });
      if (res.data.success) {
        setVerifyResult({ success: true, message: res.data.message });
        setScanQrInput('');
        fetchDetail(selectedBansos.id);
      }
    } catch (err: any) {
      setVerifyResult({ success: false, message: err.response?.data?.message || 'Verifikasi gagal' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            {isKades ? 'Otorisasi Eksekutif Kepala Desa' : 'Modul Inovasi Tepat Sasaran'}
          </div>
          <h2 className="text-xl font-bold text-[#0f241d]">
            {isKades ? 'Evaluasi & Penetapan Kebijakan Bantuan Sosial' : 'Manajemen Bantuan Sosial & Broadcast WhatsApp'}
          </h2>
          <p className="text-xs text-gray-500">
            {isKades 
              ? 'Otorisasi penetapan Keluarga Penerima Manfaat (KPM) Bansos PKH, BPNT, dan BLT Dana Desa serta monitoring penyaluran.' 
              : 'Penyaluran PKH, BLT Dana Desa, dan siaran pesan notifikasi otomatis langsung ke nomor HP/WA warga terdaftar.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('programs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'programs' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Program Bantuan
          </button>
          <button
            onClick={() => setActiveTab('broadcastLogs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'broadcastLogs' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Log Siaran WhatsApp ({notifLogs.length})
          </button>
        </div>
      </div>

      {broadcastSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-medium">{broadcastSuccessMessage}</div>
        </div>
      )}

      {activeTab === 'programs' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left List of Programs */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Daftar Program Bansos:</div>
            {bansosList.map((b) => (
              <div
                key={b.id}
                onClick={() => fetchDetail(b.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedBansos?.id === b.id
                    ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white/80 border-[#e2eae5] hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    b.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {b.status === 'published' ? 'Telah Dipublikasikan & Disiarkan' : 'Draft Persiapan'}
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    Rp {Number(b.nominal_per_penerima).toLocaleString('id-ID')}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 leading-snug">{b.nama_bantuan}</h3>
                <div className="text-xs text-gray-500 mt-1 flex items-center justify-between">
                  <span>{b.tahap}</span>
                  <span>{b.total_terdaftar || 0} Penerima</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Detail & Actions */}
          <div className="lg:col-span-8 space-y-6">
            {selectedBansos ? (
              <div className="bg-white rounded-2xl border border-[#d8e3dc] p-6 sm:p-8 shadow-sm space-y-6">
                {/* Program Header */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-emerald-700 uppercase">{selectedBansos.sumber_dana}</div>
                    <h3 className="text-xl font-black text-gray-900">{selectedBansos.nama_bantuan}</h3>
                    <p className="text-xs text-gray-500">{selectedBansos.deskripsi}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenEdit}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer press-down"
                    >
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>Edit Jadwal & Lokasi</span>
                    </button>

                    <button
                      onClick={() => handlePublishAndBroadcast(selectedBansos.id)}
                      disabled={broadcasting}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer press-down"
                    >
                      <Send className="w-4 h-4" />
                      {broadcasting ? 'Sedang Menyiarkan WA...' : 'Publish & Siar WA'}
                    </button>
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#f8faf9] border border-gray-200">
                    <div className="text-gray-400 text-[11px]">Nominal / Penerima</div>
                    <div className="font-bold text-gray-900 text-sm mt-0.5">
                      Rp {Number(selectedBansos.nominal_per_penerima).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f8faf9] border border-gray-200">
                    <div className="text-gray-400 text-[11px]">Tanggal Penyaluran</div>
                    <div className="font-bold text-gray-900 text-sm mt-0.5">
                      {new Date(selectedBansos.tanggal_penyaluran).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f8faf9] border border-gray-200">
                    <div className="text-gray-400 text-[11px]">Lokasi Penyaluran</div>
                    <div className="font-bold text-gray-900 truncate mt-0.5">
                      {selectedBansos.lokasi_penyaluran}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#f8faf9] border border-gray-200">
                    <div className="text-gray-400 text-[11px]">Status Broadcast</div>
                    <div className={`font-bold mt-0.5 ${selectedBansos.status === 'published' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {selectedBansos.status === 'published' ? 'Terdistribusi ke WA' : 'Belum Siar'}
                    </div>
                  </div>
                </div>

                {/* Beneficiaries Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Daftar Warga Penerima & Nomor WhatsApp:
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {selectedBansos.penerimas?.length || 0} Terdaftar
                    </span>
                  </div>

                  <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8faf9] text-gray-600 border-b border-gray-200 font-semibold">
                        <tr>
                          <th className="p-3">No. Antrean</th>
                          <th className="p-3">Nama Warga & NIK</th>
                          <th className="p-3">Nomor WhatsApp</th>
                          <th className="p-3">Kode QR Bantuan</th>
                          <th className="p-3 text-right">Status Penyaluran</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(() => {
                          const allP = selectedBansos.penerimas || [];
                          const paged = allP.slice((pagePenerima - 1) * 8, pagePenerima * 8);
                          if (paged.length === 0) {
                            return (
                              <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-400">
                                  Belum ada warga penerima terdaftar.
                                </td>
                              </tr>
                            );
                          }
                          return paged.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50/80">
                              <td className="p-3 font-mono font-bold text-emerald-800">{p.nomor_antrean || 'A-001'}</td>
                              <td className="p-3">
                                <div className="font-bold text-gray-900">{p.warga_profile?.nama_lengkap}</div>
                                <div className="text-[11px] text-gray-400 font-mono">NIK: {p.warga_profile?.nik}</div>
                              </td>
                              <td className="p-3 font-mono text-gray-700">
                                {p.warga_profile?.no_hp_wa || '-'}
                              </td>
                              <td className="p-3 font-mono text-[11px] text-gray-500">
                                {p.qr_bantuan_code}
                              </td>
                              <td className="p-3 text-right">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.status_penyaluran === 'Sudah Disalurkan'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {p.status_penyaluran}
                                </span>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>

                  <Pagination
                    currentPage={pagePenerima}
                    totalItems={selectedBansos.penerimas?.length || 0}
                    pageSize={8}
                    onPageChange={setPagePenerima}
                    itemLabel="penerima"
                  />
                </div>

                {/* QR Scanner & NIK Fallback Verification Tool for Village Officers */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-700" />
                      Petugas Penyalur: Verifikasi Pengambilan Bansos
                    </span>
                    <span className="text-[11px] text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full font-medium">
                      Berlaku Toleransi Jam & Hari (Masa Tenggang)
                    </span>
                  </div>

                  <form onSubmit={handleVerifyDisalurkan} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Scan Kode QR atau Ketik 16 Digit NIK Warga (Jika kartu hilang/scan gagal)..."
                      value={scanQrInput}
                      onChange={(e) => setScanQrInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      Verifikasi Cair
                    </button>
                  </form>

                  <div className="text-[11px] text-slate-500 leading-snug">
                    <strong>Solusi Kartu Hilang / Scan Limit:</strong> Jika warga lupa membawa kartu fisik atau QR code tidak terbaca, cukup ketikkan <strong>16 digit NIK</strong> warga di atas untuk mencairkan bantuan.
                  </div>

                  {verifyResult && (
                    <div className={`p-2.5 rounded-xl text-xs font-semibold ${verifyResult.success ? 'bg-emerald-100/70 text-emerald-900 border border-emerald-300' : 'bg-rose-100/70 text-rose-900 border border-rose-300'}`}>
                      {verifyResult.message}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-200">
                Pilih salah satu program bantuan di sebelah kiri untuk melihat rincian & menyiarkan notifikasi.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Broadcast WhatsApp Logs Tab */
        <div className="bg-white rounded-2xl border border-[#d8e3dc] p-6 shadow-sm space-y-4">
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Rekam Jejak Siaran WhatsApp Otomatis (Live Gateway Logs):
          </div>

          <div className="space-y-3">
            {(() => {
              const pagedLogs = notifLogs.slice((pageLogs - 1) * 8, pageLogs * 8);
              if (pagedLogs.length === 0) {
                return (
                  <div className="p-8 text-center text-xs text-gray-400 bg-slate-50 rounded-xl">
                    Belum ada rekaman riwayat siaran WhatsApp.
                  </div>
                );
              }
              return pagedLogs.map((l) => (
                <div key={l.id} className="p-4 rounded-xl bg-[#f8faf9] border border-gray-200 text-xs space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-gray-500 text-[11px]">
                    <span className="font-bold text-emerald-800">Tujuan: {l.nomor_tujuan} ({l.warga_profile?.nama_lengkap || 'Warga'})</span>
                    <span>{new Date(l.created_at).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="font-bold text-gray-900 font-sans">{l.judul}</div>
                  <p className="text-gray-600 font-sans whitespace-pre-line text-xs bg-white p-3 rounded-lg border border-gray-100">
                    {l.pesan}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-emerald-600 font-bold">STATUS: {l.status_pengiriman} (GATEWAY OK)</span>
                    <span className="text-gray-400">Tipe: {l.jenis_notifikasi}</span>
                  </div>
                </div>
              ));
            })()}
          </div>

          <Pagination
            currentPage={pageLogs}
            totalItems={notifLogs.length}
            pageSize={8}
            onPageChange={setPageLogs}
            itemLabel="log siaran"
          />
        </div>
      )}

      {/* Edit Schedule & Location Modal */}
      {showEditModal && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Atur Jadwal & Lokasi Penyaluran
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Program Bantuan
                </label>
                <input
                  type="text"
                  value={editForm.nama_bantuan}
                  onChange={(e) => setEditForm({ ...editForm, nama_bantuan: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tahap / Periode
                </label>
                <input
                  type="text"
                  value={editForm.tahap}
                  onChange={(e) => setEditForm({ ...editForm, tahap: e.target.value })}
                  placeholder="Tahap 1 - 2026"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tanggal Penyaluran
                  </label>
                  <input
                    type="date"
                    value={editForm.tanggal_penyaluran}
                    onChange={(e) => setEditForm({ ...editForm, tanggal_penyaluran: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Waktu / Jam Mulai
                  </label>
                  <input
                    type="text"
                    value={editForm.waktu_mulai}
                    onChange={(e) => setEditForm({ ...editForm, waktu_mulai: e.target.value })}
                    placeholder="08:30 WIB"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lokasi Pengambilan Fiks
                </label>
                <input
                  type="text"
                  value={editForm.lokasi_penyaluran}
                  onChange={(e) => setEditForm({ ...editForm, lokasi_penyaluran: e.target.value })}
                  placeholder="Gedung Serbaguna Balai Desa Doko"
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Lokasi ini otomatis tercetak pada Undangan Digital & terkirim ke WhatsApp warga.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 text-xs text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  {isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
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
