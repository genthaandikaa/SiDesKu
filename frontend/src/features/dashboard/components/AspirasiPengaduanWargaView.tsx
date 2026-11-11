import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  MessageSquare, Plus, Clock, CheckCircle2, AlertCircle, 
  Send, Camera, Upload, Trash2, Eye, X, Image as ImageIcon,
  MapPin, ShieldCheck, UserCheck, ChevronRight, Loader2,
  Filter, HelpCircle
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { PengaduanWarga } from '@/shared/types';
import { useAuth } from '@/shared/context/AuthContext';
import { CameraUploadModal } from '@/shared/components/CameraUploadModal';
import { Pagination } from '@/shared/components/Pagination';
import { getSafeMediaUrl } from '@/shared/utils/mediaUrl';

export const AspirasiPengaduanWargaView: React.FC = () => {
  const { user } = useAuth();
  const [pengaduans, setPengaduans] = useState<PengaduanWarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal submission state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [kategori, setKategori] = useState('Infrastruktur & Jalan');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [fotoLampiran, setFotoLampiran] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Photo zoom modal
  const [zoomPhoto, setZoomPhoto] = useState<string | null>(null);

  const fetchPengaduans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/warga/pengaduan');
      if (res.data.success) {
        setPengaduans(res.data.data || []);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPengaduans();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim()) {
      setModalError('Judul dan uraian pengaduan wajib diisi.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);
      const payload: any = {
        kategori,
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
      };
      if (fotoLampiran) {
        payload.foto_lampiran = fotoLampiran;
      }

      const res = await api.post('/warga/pengaduan', payload);
      if (res.data.success) {
        showToast('Aspirasi/pengaduan Anda berhasil dikirim ke pengurus RT dan Balai Desa!');
        setShowModal(false);
        setJudul('');
        setDeskripsi('');
        setFotoLampiran(null);
        setModalError(null);
        setKategori('Infrastruktur & Jalan');
        fetchPengaduans();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Gagal mengirim pengaduan. Silakan periksa kelengkapan isian.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredList = pengaduans.filter((p) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'selesai') return p.status === 'Selesai' || p.disposisi_ke === 'Selesai Ditangani';
    if (filterStatus === 'proses') return p.status !== 'Selesai' && p.disposisi_ke !== 'Selesai Ditangani';
    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const paginatedList = filteredList.slice((currentPage - 1) * 6, currentPage * 6);

  const getDisposisiBadge = (item: PengaduanWarga) => {
    if (item.status === 'Selesai' || item.disposisi_ke === 'Selesai Ditangani') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-blue-600" />
          <span>Selesai Ditangani</span>
        </span>
      );
    }
    if (item.status === 'Ditolak' || item.disposisi_ke === 'Ditolak') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
          Tidak Ditindaklanjuti
        </span>
      );
    }
    if (item.disposisi_ke) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1">
          <UserCheck className="w-3 h-3 text-blue-600" />
          <span>Didisposisikan ke: {item.disposisi_ke}</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
        <Clock className="w-3 h-3 text-amber-600" />
        <span>Menunggu Disposisi (Ketua RT)</span>
      </span>
    );
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Infrastruktur & Jalan':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Kebersihan & Lingkungan':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Keamanan & Ketertiban':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Bantuan Sosial & Kesejahteraan':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Pelayanan Administrasi Desa':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const wargaProfile = user?.warga_profile;
  const rtNomor = wargaProfile?.rt?.nomor_rt || '01';
  const rwNomor = wargaProfile?.rt?.rw?.nomor_rw || '01';

  return (
    <div className="space-y-6 page-enter font-sans max-w-6xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999999] bg-blue-950/90 text-white px-4 py-3 rounded-2xl shadow-xl border border-blue-400/40 flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner Bersih Putih & Emerald */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Aspirasi & Pengaduan
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer press-down shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Buat aspirasi</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Sederhana & Bersih (Anti-TMI) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          {[
            { id: 'all', label: `Semua (${pengaduans.length})` },
            { id: 'proses', label: `Diproses (${pengaduans.filter(p => p.status !== 'Selesai' && p.disposisi_ke !== 'Selesai Ditangani').length})` },
            { id: 'selesai', label: `Selesai (${pengaduans.filter(p => p.status === 'Selesai' || p.disposisi_ke === 'Selesai Ditangani').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {filteredList.length} laporan
        </span>
      </div>

      {/* Daftar Laporan Pengaduan */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Memuat pengaduan...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-200">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-sm font-black text-slate-900">Belum ada aspirasi</h3>
            <p className="text-xs text-slate-500">
              Kirim laporan atau usulan untuk lingkungan Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-xs cursor-pointer press-down"
          >
            <Plus className="w-4 h-4" />
            <span>Buat aspirasi</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedList.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between hover:border-blue-300 transition-all"
              >
                <div className="space-y-3">
                  {/* Header Card: Category & Status Disposisi */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border ${getCategoryColor(item.kategori)}`}>
                      {item.kategori}
                    </span>
                    {getDisposisiBadge(item)}
                  </div>

                  {/* Judul & Deskripsi */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">
                      {item.judul}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-3">
                      {item.deskripsi}
                    </p>
                  </div>

                  {/* Foto Lampiran Bukti jika ada */}
                  {item.foto_lampiran && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setZoomPhoto(getSafeMediaUrl(item.foto_lampiran))}
                        className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video max-h-36 w-full flex items-center justify-center cursor-pointer"
                      >
                        <img
                          src={getSafeMediaUrl(item.foto_lampiran)}
                          alt="Bukti Lampiran"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                          <Eye className="w-4 h-4" />
                          <span>Lihat Foto Bukti</span>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Tanggapan Resmi dari Perangkat Desa */}
                  {item.tanggapan ? (
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/90 space-y-1.5 animate-fade-in">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-blue-800 text-[10px] font-black uppercase tracking-wider">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Tindak Lanjut & Arahan Perangkat Desa</span>
                        </div>
                        {item.disposisi_ke && (
                          <span className="text-[10px] font-bold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded-md">
                            Ditugaskan ke: {item.disposisi_ke}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {item.tanggapan}
                      </p>
                      {item.ditanggapi_at && (
                        <span className="text-[10px] text-slate-400 block pt-0.5">
                          Dicatat pada: {new Date(item.ditanggapi_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center gap-2 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Laporan tercatat dan sedang menunggu disposisi penanganan oleh Ketua RT {rtNomor}.</span>
                    </div>
                  )}
                </div>

                {/* Footer Meta */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span>Wilayah RT {rtNomor} / RW {rwNomor}</span>
                  </span>
                  <span>
                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredList.length}
            pageSize={6}
            onPageChange={setCurrentPage}
            itemLabel="laporan pengaduan"
          />
        </div>
      )}

      {/* Modal Formulir Pengaduan Baru */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl my-auto max-h-[92vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 mt-1">Sampaikan Aspirasi / Aduan</h3>
                <p className="text-xs text-slate-500">Laporan akan diteruskan ke Pengurus RT {rtNomor} dan Desa {user?.desa?.nama_desa || 'Doko'}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
              {modalError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-slate-700">Kategori Aspirasi / Aduan *</label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800"
                >
                  <option value="Infrastruktur & Jalan">Infrastruktur & Jalan</option>
                  <option value="Kebersihan & Lingkungan">Kebersihan & Lingkungan</option>
                  <option value="Keamanan & Ketertiban">Keamanan & Ketertiban</option>
                  <option value="Bantuan Sosial & Kesejahteraan">Bantuan Sosial & Kesejahteraan</option>
                  <option value="Pelayanan Administrasi Desa">Pelayanan Administrasi Desa</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700">Judul Aspirasi / Pengaduan *</label>
                <input
                  type="text"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700">Penjelasan Lengkap *</label>
                <textarea
                  required
                  rows={4}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800"
                />
              </div>

              {/* Unggah Foto Bukti */}
              <div className="space-y-1.5">
                <label className="text-slate-700">Unggah (Opsional)</label>
                {fotoLampiran ? (
                  <div className="relative rounded-2xl overflow-hidden border border-blue-300 bg-blue-50/50 aspect-video max-h-40 flex items-center justify-center">
                    <img src={fotoLampiran} alt="Foto Bukti" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFotoLampiran(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-xl bg-rose-600 text-white shadow-md hover:bg-rose-700 cursor-pointer"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCameraModal(true)}
                    className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl text-center transition-colors bg-slate-50 cursor-pointer block"
                  >
                    <Camera className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <span className="text-xs font-bold text-slate-700 block">Unggah</span>
                  </button>
                )}
              </div>

              {/* Info Wilayah RT/RW Otomatis */}
              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200 text-[11px] text-blue-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Pengaduan otomatis dikelompokkan ke wilayah domisili Anda: <strong>RT {rtNomor} / RW {rwNomor} Desa Doko</strong>.</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-extrabold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Laporan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Camera / Upload Modal for Complaint Attachment */}
      {showCameraModal && (
        <CameraUploadModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          initialMode="camera"
          title="Ambil / Unggah Foto Bukti Pengaduan"
          description="Foto kerusakan jalan, fasilitas umum, atau kondisi lingkungan yang ingin Anda laporkan."
          guideType="bebas"
          onCapture={(base64) => {
            setFotoLampiran(base64);
            setShowCameraModal(false);
          }}
        />
      )}

      {/* Photo Zoom Modal */}
      {zoomPhoto && createPortal(
        <div
          className="fixed inset-0 z-[9999999] bg-slate-950/85 flex items-center justify-center p-4 animate-fade-in cursor-pointer"
          onClick={() => setZoomPhoto(null)}
        >
          <div
            className="bg-white rounded-3xl p-4 max-w-2xl w-full max-h-[90vh] flex flex-col space-y-3 border border-slate-200 shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <span>Foto Bukti Lampiran</span>
              </span>
              <button
                onClick={() => setZoomPhoto(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden rounded-2xl bg-black flex items-center justify-center min-h-[300px]">
              <img src={zoomPhoto} alt="Foto Zoom" className="w-full h-full object-contain max-h-[70vh]" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
