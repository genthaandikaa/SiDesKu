import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  Send, 
  CheckCircle2, 
  Users, 
  Plus, 
  QrCode, 
  Smartphone, 
  Check, 
  Sparkles,
  Calendar,
  DollarSign
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { BantuanSosial, BantuanPenerima } from '@/shared/types';

export const BansosManager: React.FC = () => {
  const [bansosList, setBansosList] = useState<BantuanSosial[]>([]);
  const [selectedBansos, setSelectedBansos] = useState<BantuanSosial | null>(null);
  const [loading, setLoading] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccessMessage, setBroadcastSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'programs' | 'broadcastLogs'>('programs');
  const [notifLogs, setNotifLogs] = useState<any[]>([]);
  
  // Verification input
  const [scanQrInput, setScanQrInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);

  useEffect(() => {
    fetchBansos();
    fetchLogs();
  }, []);

  const fetchBansos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bansos');
      if (res.data.success) {
        setBansosList(res.data.data);
        if (res.data.data.length > 0) {
          fetchDetail(res.data.data[0].id);
        }
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id: number) => {
    try {
      const res = await api.get(`/bansos/${id}`);
      if (res.data.success) {
        setSelectedBansos(res.data.data);
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
        await fetchDetail(id);
        await fetchBansos();
        await fetchLogs();
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
            <Sparkles className="w-3.5 h-3.5" /> Modul Inovasi Tepat Sasaran
          </div>
          <h2 className="text-xl font-bold text-[#0f241d]">Manajemen Bantuan Sosial & Broadcast WhatsApp</h2>
          <p className="text-xs text-gray-500">
            Penyaluran PKH, BLT Dana Desa, dan siaran pesan notifikasi otomatis langsung ke nomor HP/WA warga terdaftar.
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

                  {/* The Crucial Killer Action Button */}
                  <div>
                    <button
                      onClick={() => handlePublishAndBroadcast(selectedBansos.id)}
                      disabled={broadcasting}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {broadcasting ? 'Sedang Menyiarkan WA...' : 'Publish & Kirim Broadcast WA ke Warga'}
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
                        {selectedBansos.penerimas && selectedBansos.penerimas.map((p) => (
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* QR Scanner / Verification Tool for Village Officers */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                    <QrCode className="w-4 h-4 text-emerald-700" />
                    <span>Petugas Penyalur: Verifikasi Pengambilan Berdasarkan Scan QR</span>
                  </div>
                  <form onSubmit={handleVerifyDisalurkan} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan Kode QR Bantuan (cth: PKH2026-3506041505840001)..."
                      value={scanQrInput}
                      onChange={(e) => setScanQrInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors"
                    >
                      Verifikasi Cair
                    </button>
                  </form>
                  {verifyResult && (
                    <div className={`text-xs font-medium ${verifyResult.success ? 'text-emerald-800' : 'text-rose-700'}`}>
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
            {notifLogs.map((l) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
