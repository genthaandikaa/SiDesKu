import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building2, 
  ShieldCheck, 
  DollarSign, 
  Users, 
  FileCheck2, 
  Award, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  FileText, 
  Printer, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  MapPin, 
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Layers,
  HeartHandshake,
  Loader2,
  XCircle,
  Megaphone,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';
import api from '@/shared/lib/axios';
import { SuratRequest, DesaSetting, ApbdesRecord } from '@/shared/types';
import { CetakSuratModal } from './CetakSuratModal';
import { BansosManager } from './BansosManager';
import { DesaTerritoryMap } from './DesaTerritoryMap';
import { AgendaDesaView, ProfileSayaView } from './RoleDashboardViews';
import { KadesStrukturVisiMisiView } from './KadesStrukturVisiMisiView';
import { Pagination } from '@/shared/components/Pagination';

interface KadesDashboardProps {
  activeSubmenu?: string;
  onNavigate?: (menu: string) => void;
}

interface SkKeputusan {
  id: number;
  nomor_sk: string;
  tentang: string;
  kategori: string;
  tanggal_tetap: string;
  status: 'Berlaku' | 'Perubahan' | 'Dicabut';
  keterangan: string;
}

export const KadesDashboard: React.FC<KadesDashboardProps> = ({ activeSubmenu = 'beranda', onNavigate }) => {
  const { user } = useAuth();
  const [surats, setSurats] = useState<SuratRequest[]>([]);
  const [pengumumans, setPengumumans] = useState<any[]>([]);
  const [apbdesData, setApbdesData] = useState<any>(null);
  const [desa, setDesa] = useState<DesaSetting | null>(null);
  const [pengaduans, setPengaduans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [printSurat, setPrintSurat] = useState<SuratRequest | null>(null);
  const [selectedSuratDetail, setSelectedSuratDetail] = useState<SuratRequest | null>(null);

  // Tab State untuk Persetujuan & Monitoring
  const [suratTab, setSuratTab] = useState<'pending' | 'completed' | 'rejected'>('pending');
  const [pengumumanTab, setPengumumanTab] = useState<'pending' | 'published' | 'rejected'>('pending');

  // Modal State Persetujuan & Penolakan Surat Kades
  const [selectedSuratForApprove, setSelectedSuratForApprove] = useState<SuratRequest | null>(null);
  const [selectedSuratForReject, setSelectedSuratForReject] = useState<SuratRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveCatatan, setApproveCatatan] = useState('');
  const [nomorSuratInput, setNomorSuratInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Alert & Toast Notification State
  const [notification, setNotification] = useState<{
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'warning' | 'error', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Modal State Persetujuan & Penolakan Pengumuman Kades
  const [selectedPengumumanForApprove, setSelectedPengumumanForApprove] = useState<any | null>(null);
  const [selectedPengumumanForReject, setSelectedPengumumanForReject] = useState<any | null>(null);
  const [rejectPengumumanReason, setRejectPengumumanReason] = useState('');

  // Filter Wilayah & Status Aspirasi Kades
  const [wilayahRts, setWilayahRts] = useState<any[]>([]);
  const [wilayahRws, setWilayahRws] = useState<any[]>([]);
  const [selectedRwFilter, setSelectedRwFilter] = useState<string>('all');
  const [selectedRtFilter, setSelectedRtFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState<string>('all');

  // Pagination States
  const [suratPage, setSuratPage] = useState(1);
  const [pengumumanPage, setPengumumanPage] = useState(1);
  const [pengaduanPage, setPengaduanPage] = useState(1);
  const [skPage, setSkPage] = useState(1);
  const [apbdesPage, setApbdesPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    setSuratPage(1);
  }, [searchTerm, suratTab]);

  useEffect(() => {
    setPengumumanPage(1);
  }, [pengumumanTab]);

  useEffect(() => {
    setPengaduanPage(1);
  }, [selectedRwFilter, selectedRtFilter, selectedStatusFilter, selectedKategoriFilter]);

  // Modal Tanggapan / Disposisi Kades
  const [selectedPengaduanForResponse, setSelectedPengaduanForResponse] = useState<any | null>(null);
  const [tanggapanText, setTanggapanText] = useState('');
  const [tanggapanStatus, setTanggapanStatus] = useState('Didisposisikan');
  const [tanggapanDisposisiKe, setTanggapanDisposisiKe] = useState('Kaur Perencanaan & Pembangunan');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [zoomPengaduanPhoto, setZoomPengaduanPhoto] = useState<string | null>(null);

  // Daftar SK & Kebijakan Kepala Desa (Mock Data Realistis Pemerintahan Desa Doko)
  const [daftarSk, setDaftarSk] = useState<SkKeputusan[]>([
    {
      id: 1,
      nomor_sk: '188.45/01/418.66.04/2026',
      tentang: 'Penetapan Keluarga Penerima Manfaat (KPM) Bantuan Langsung Tunai Dana Desa (BLT-DD) Tahun Anggaran 2026',
      kategori: 'Bantuan Sosial',
      tanggal_tetap: '15 Januari 2026',
      status: 'Berlaku',
      keterangan: 'Sebanyak 35 KPM desil 1 ekstrem terverifikasi sah.',
    },
    {
      id: 2,
      nomor_sk: '188.45/02/418.66.04/2026',
      tentang: 'Pengangkatan dan Pengukuhan Pengurus Rukun Tetangga (RT) dan Rukun Warga (RW) Masa Bakti 2026-2031',
      kategori: 'Kelembagaan',
      tanggal_tetap: '02 Februari 2026',
      status: 'Berlaku',
      keterangan: 'Mencakup 13 RT dan 3 RW di seluruh wilayah Desa Doko.',
    },
    {
      id: 3,
      nomor_sk: '188.45/03/418.66.04/2026',
      tentang: 'Pembentukan Tim Pelaksana Kegiatan (TPK) Pembangunan Drainase & Rabat Beton Lingkungan Krajan',
      kategori: 'Pembangunan',
      tanggal_tetap: '18 Maret 2026',
      status: 'Berlaku',
      keterangan: 'Sumber dana Dana Desa Tahap I dengan skema padat karya tunai desa.',
    },
    {
      id: 4,
      nomor_sk: '188.45/04/418.66.04/2026',
      tentang: 'Penetapan Standar Operasional Prosedur Pelayanan Surat Mandiri Tanpa Perantara RW',
      kategori: 'Tata Kelola',
      tanggal_tetap: '10 April 2026',
      status: 'Berlaku',
      keterangan: 'Pemberlakuan alur cepat pelayanan digital RT langsung ke Balai Desa.',
    },
  ]);

  const [showAddSkModal, setShowAddSkModal] = useState(false);
  const [newSkNomor, setNewSkNomor] = useState('');
  const [newSkTentang, setNewSkTentang] = useState('');
  const [newSkKategori, setNewSkKategori] = useState('Tata Kelola');
  const [newSkKeterangan, setNewSkKeterangan] = useState('');
  const [skModalError, setSkModalError] = useState('');

  const normalizedSubmenu = (activeSubmenu || '').replace(/-/g, '_');

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Bersihkan seluruh modal saat berganti submenu / menu agar tidak terbawa ke menu lain
  useEffect(() => {
    setSelectedSuratForApprove(null);
    setSelectedSuratForReject(null);
    setSelectedSuratDetail(null);
    setSelectedPengumumanForApprove(null);
    setSelectedPengumumanForReject(null);
    setShowAddSkModal(false);
    setSelectedPengaduanForResponse(null);
    setZoomPengaduanPhoto(null);
    setPrintSurat(null);
    setRejectReason('');
    setApproveCatatan('');
    setNomorSuratInput('');
    setRejectPengumumanReason('');
  }, [activeSubmenu]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [suratRes, pengumumanRes, apbdesRes, desaRes, pengaduanRes, wilayahRes, skRes] = await Promise.allSettled([
        api.get('/kades/surats'),
        api.get('/kades/pengumumans'),
        api.get('/public/apbdes/summary'),
        api.get('/settings/desa'),
        api.get('/pengaduan'),
        api.get('/wilayah'),
        api.get('/kades/keputusan'),
      ]);

      if (suratRes.status === 'fulfilled' && suratRes.value.data.success) {
        setSurats(suratRes.value.data.data);
      } else {
        // Fallback jika role sekdes/admin membuka tab
        const fallbackSurat = await api.get('/sekdes/surats').catch(() => null);
        if (fallbackSurat?.data?.success) setSurats(fallbackSurat.data.data);
      }

      if (pengumumanRes.status === 'fulfilled' && pengumumanRes.value.data.success) {
        setPengumumans(pengumumanRes.value.data.data);
      }
      if (apbdesRes.status === 'fulfilled' && apbdesRes.value.data.success) {
        setApbdesData(apbdesRes.value.data);
      }
      if (desaRes.status === 'fulfilled' && desaRes.value.data.success) {
        setDesa(desaRes.value.data.data);
      }
      if (pengaduanRes.status === 'fulfilled' && pengaduanRes.value.data.success) {
        setPengaduans(pengaduanRes.value.data.data || []);
      }
      if (wilayahRes.status === 'fulfilled' && wilayahRes.value.data.success) {
        setWilayahRts(wilayahRes.value.data.rts || []);
        setWilayahRws(wilayahRes.value.data.rws || []);
      }
      if (skRes.status === 'fulfilled' && skRes.value.data?.success && skRes.value.data.data) {
        setDaftarSk(skRes.value.data.data);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuratForApprove) return;
    try {
      setActionLoading(true);
      const payload: any = {};
      if (approveCatatan.trim()) payload.catatan = approveCatatan.trim();
      if (nomorSuratInput.trim()) payload.nomor_surat_resmi = nomorSuratInput.trim();

      const targetSurat = selectedSuratForApprove;
      const res = await api.post(`/kades/surats/${targetSurat.id}/approve`, payload);
      if (res.data.success) {
        const approvedName = targetSurat.warga_profile?.nama_lengkap || 'Warga';
        const suratJenis = targetSurat.surat_type?.nama_surat || 'Surat Permohonan';
        const resi = targetSurat.nomor_resi;
        setSelectedSuratForApprove(null);
        setSelectedSuratDetail(null);
        setApproveCatatan('');
        setNomorSuratInput('');
        fetchInitialData();
        showNotification(
          'success',
          'Surat Berhasil Disetujui & Diterbitkan!',
          `${suratJenis} (Resi: ${resi}) atas nama ${approvedName} telah disahkan resmi dengan TTD QR Code Kepala Desa.`
        );
      }
    } catch (err: any) {
      showNotification('error', 'Gagal Menyetujui Surat', err.response?.data?.message || 'Terjadi kendala saat menyetujui surat.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuratForReject) return;
    if (rejectReason.trim().length < 5) {
      showNotification('error', 'Validasi Gagal', 'Alasan penolakan surat wajib diisi minimal 5 karakter.');
      return;
    }
    try {
      setActionLoading(true);
      const targetSurat = selectedSuratForReject;
      const res = await api.post(`/kades/surats/${targetSurat.id}/reject`, {
        alasan: rejectReason.trim(),
      });
      if (res.data.success) {
        const rejectedName = targetSurat.warga_profile?.nama_lengkap || 'Warga';
        const suratJenis = targetSurat.surat_type?.nama_surat || 'Surat Permohonan';
        const resi = targetSurat.nomor_resi;
        setSelectedSuratForReject(null);
        setSelectedSuratDetail(null);
        setRejectReason('');
        fetchInitialData();
        showNotification(
          'warning',
          'Surat Berhasil Ditolak',
          `${suratJenis} (Resi: ${resi}) pemohon ${rejectedName} telah ditolak. Alasan penolakan tercatat di riwayat pelacakan.`
        );
      }
    } catch (err: any) {
      showNotification('error', 'Gagal Menolak Surat', err.response?.data?.message || 'Terjadi kendala saat menolak surat.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprovePengumuman = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPengumumanForApprove) return;
    try {
      setActionLoading(true);
      const targetPengumuman = selectedPengumumanForApprove;
      const res = await api.post(`/kades/pengumumans/${targetPengumuman.id}/approve`, {
        publish_immediately: true,
      });
      if (res.data.success) {
        const judul = targetPengumuman.judul;
        setSelectedPengumumanForApprove(null);
        fetchInitialData();
        showNotification(
          'success',
          'Pengumuman Berhasil Diterbitkan!',
          `Pengumuman "${judul}" telah disetujui Kepala Desa dan resmi dipublikasikan ke warga desa.`
        );
      }
    } catch (err: any) {
      showNotification('error', 'Gagal Menyetujui', err.response?.data?.message || 'Gagal menyetujui pengumuman.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPengumuman = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPengumumanForReject) return;
    if (rejectPengumumanReason.trim().length < 5) {
      showNotification('error', 'Validasi Gagal', 'Alasan penolakan pengumuman wajib diisi minimal 5 karakter.');
      return;
    }
    try {
      setActionLoading(true);
      const targetPengumuman = selectedPengumumanForReject;
      const res = await api.post(`/kades/pengumumans/${targetPengumuman.id}/reject`, {
        alasan: rejectPengumumanReason.trim(),
      });
      if (res.data.success) {
        const judul = targetPengumuman.judul;
        setSelectedPengumumanForReject(null);
        setRejectPengumumanReason('');
        fetchInitialData();
        showNotification(
          'warning',
          'Pengumuman Ditolak',
          `Draf pengumuman "${judul}" telah ditolak dengan catatan evaluasi.`
        );
      }
    } catch (err: any) {
      showNotification('error', 'Gagal Menolak', err.response?.data?.message || 'Gagal menolak draf pengumuman.');
    } finally {
      setActionLoading(false);
    }
  };

  const renderApprovePengumumanModal = () => {
    if (!selectedPengumumanForApprove) return null;
    return createPortal(
      <div 
        className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in"
        onClick={() => setSelectedPengumumanForApprove(null)}
      >
        <div 
          className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Megaphone size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Setujui & Publikasikan Pengumuman</h3>
                <p className="text-xs text-slate-500">Umumkan secara sah kepada warga masyarakat</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPengumumanForApprove(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleApprovePengumuman} className="space-y-4 text-xs font-semibold">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {selectedPengumumanForApprove.kategori || 'Umum'}
              </span>
              <h4 className="font-black text-sm text-slate-900">{selectedPengumumanForApprove.judul}</h4>
              <p className="text-xs text-slate-600 line-clamp-3">{selectedPengumumanForApprove.isi}</p>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                Target: {selectedPengumumanForApprove.level_target || 'Semua Warga'}
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Pengumuman ini akan langsung aktif dan dapat dilihat oleh seluruh warga masyarakat di portal informasi desa.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPengumumanForApprove(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-extrabold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mempublikasikan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Setujui & Publikasikan Resmi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const renderRejectPengumumanModal = () => {
    if (!selectedPengumumanForReject) return null;
    return createPortal(
      <div 
        className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in"
        onClick={() => setSelectedPengumumanForReject(null)}
      >
        <div 
          className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <XCircle size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Penolakan Draf Pengumuman</h3>
                <p className="text-xs text-slate-500">Kembalikan ke Sekdes untuk diperbaiki</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPengumumanForReject(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleRejectPengumuman} className="space-y-4 text-xs font-semibold">
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
              <div className="font-black text-xs flex items-center gap-1">
                <AlertCircle size={14} className="text-rose-600" />
                <span>Alasan Penolakan Wajib Diisi (Min. 5 Karakter)</span>
              </div>
              <p className="text-[11px] text-rose-800">
                Tuliskan poin perbaikan draf pengumuman yang harus direvisi oleh Sekretaris Desa.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700">Catatan Revisi Kades *</label>
              <textarea
                rows={4}
                required
                value={rejectPengumumanReason}
                onChange={(e) => setRejectPengumumanReason(e.target.value)}
                placeholder="Contoh: Jadwal acara dan nama narasumber perlu diperinci sebelum dipublikasikan..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
              <span className="text-[10px] text-slate-400 block">
                Karakter: {rejectPengumumanReason.trim().length} / min 5
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPengumumanForReject(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-extrabold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actionLoading || rejectPengumumanReason.trim().length < 5}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    <span>Tolak & Kembalikan Draf</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const handleDisposisi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPengaduanForResponse || !tanggapanText.trim()) return;

    try {
      setIsSubmittingResponse(true);
      const targetStatus = tanggapanDisposisiKe === 'Selesai Ditangani'
        ? 'Selesai'
        : (tanggapanDisposisiKe.startsWith('Ketua RT') ? 'Ditinjau RT' : 'Didisposisikan');

      const res = await api.post(`/pengaduan/${selectedPengaduanForResponse.id}/respond`, {
        tanggapan: tanggapanText.trim(),
        status: targetStatus,
        disposisi_ke: tanggapanDisposisiKe,
      });

      if (res.data.success) {
        const refreshPengaduan = await api.get('/pengaduan').catch(() => null);
        if (refreshPengaduan?.data?.success) {
          setPengaduans(refreshPengaduan.data.data || []);
        } else {
          setPengaduans(prev => prev.map(p => p.id === selectedPengaduanForResponse.id ? { 
            ...p, 
            tanggapan: tanggapanText.trim(), 
            status: targetStatus,
            disposisi_ke: tanggapanDisposisiKe,
          } : p));
        }
        setSelectedPengaduanForResponse(null);
        setTanggapanText('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan arahan/disposisi.');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleCreateSk = async (e: React.FormEvent) => {
    e.preventDefault();
    setSkModalError('');
    if (!newSkTentang.trim()) return;

    try {
      const payload: any = {
        tentang: newSkTentang.trim(),
        kategori: newSkKategori,
        keterangan: newSkKeterangan.trim() || 'Ditetapkan secara sah oleh Kepala Desa Doko.',
        status: 'Berlaku',
        tanggal_tetap: new Date().toISOString().split('T')[0],
        is_public: true,
      };
      if (newSkNomor.trim()) {
        payload.nomor_sk = newSkNomor.trim();
      }

      const res = await api.post('/kades/keputusan', payload);

      if (res.data.success) {
        setShowAddSkModal(false);
        setNewSkNomor('');
        setNewSkTentang('');
        setNewSkKeterangan('');
        setSkModalError('');
        const refresh = await api.get('/kades/keputusan').catch(() => null);
        if (refresh?.data?.success && refresh.data.data) {
          setDaftarSk(refresh.data.data);
        }
      }
    } catch (err: any) {
      setSkModalError(err.response?.data?.message || 'Gagal menerbitkan SK Kepala Desa.');
    }
  };

  const renderApproveSuratModal = () => {
    if (!selectedSuratForApprove) return null;
    return createPortal(
      <div 
        className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in"
        onClick={() => setSelectedSuratForApprove(null)}
      >
        <div 
          className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Persetujuan & Pengesahan Surat</h3>
                <p className="text-xs text-slate-500">Tandatangani digital & terbitkan QR Code resmi</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSuratForApprove(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleApproveSurat} className="space-y-4 text-xs font-semibold">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Nomor Resi: <strong className="font-mono text-slate-900">{selectedSuratForApprove.nomor_resi}</strong></span>
                <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                  {selectedSuratForApprove.surat_type?.nama_surat}
                </span>
              </div>
              <div className="text-sm font-black text-slate-900">
                {selectedSuratForApprove.warga_profile?.nama_lengkap}
              </div>
              <div className="text-[11px] text-slate-500">
                NIK: {selectedSuratForApprove.warga_profile?.nik} • RT {selectedSuratForApprove.warga_profile?.rt?.nomor_rt || '01'} / RW {selectedSuratForApprove.warga_profile?.rt?.rw?.nomor_rw || '01'}
              </div>
              <div className="text-xs text-slate-700 pt-1 border-t border-slate-200">
                Keperluan: {selectedSuratForApprove.keperluan}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700">Nomor Surat Resmi (Otomatis/Disesuaikan)</label>
              <input
                type="text"
                value={nomorSuratInput}
                onChange={(e) => setNomorSuratInput(e.target.value)}
                placeholder="Kosongkan jika ingin generate nomor resmi otomatis"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono"
              />
              <span className="text-[10px] text-slate-400 block">
                Nomor resmi akan diterbitkan permanen dan tertaut pada QR Code verifikasi.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700">Catatan Pengesahan (Opsional)</label>
              <textarea
                rows={2}
                value={approveCatatan}
                onChange={(e) => setApproveCatatan(e.target.value)}
                placeholder="Surat disetujui dan ditandatangani secara digital oleh Kepala Desa Doko."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSuratForApprove(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-extrabold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses TTD...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Tandatangani & Sahkan TTD QR</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const renderRejectSuratModal = () => {
    if (!selectedSuratForReject) return null;
    return createPortal(
      <div 
        className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in"
        onClick={() => setSelectedSuratForReject(null)}
      >
        <div 
          className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <XCircle size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Penolakan Permohonan Surat</h3>
                <p className="text-xs text-slate-500">Kembalikan berkas ke Pemohon / RT untuk perbaikan</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSuratForReject(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleRejectSurat} className="space-y-4 text-xs font-semibold">
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
              <div className="font-black text-xs flex items-center gap-1">
                <AlertCircle size={14} className="text-rose-600" />
                <span>Alasan Penolakan Wajib Diisi (Min. 5 Karakter)</span>
              </div>
              <p className="text-[11px] text-rose-800">
                Kepala Desa wajib memberikan alasan jelas agar warga pemohon memahami kelengkapan atau perbaikan yang harus dipenuhi.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700">Alasan Resmi Penolakan Kades *</label>
              <textarea
                rows={4}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Berkas bukti lunas PBB belum dilampirkan, atau data peruntukan surat perlu diperjelas..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
              <span className="text-[10px] text-slate-400 block">
                Karakter: {rejectReason.trim().length} / min 5
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSuratForReject(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-extrabold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actionLoading || rejectReason.trim().length < 5}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    <span>Tolak Permohonan Surat</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const renderDetailSuratModal = () => {
    if (!selectedSuratDetail) return null;
    return createPortal(
      <div 
        className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in"
        onClick={() => setSelectedSuratDetail(null)}
      >
        <div 
          className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-up border border-slate-200 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">Detail Berkas Permohonan Surat</h3>
              <p className="text-xs text-slate-500 font-mono">No. Resi: {selectedSuratDetail.nomor_resi}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSuratDetail(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Profil Pemohon */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedSuratDetail.warga_profile?.nama_lengkap}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedSuratDetail.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedSuratDetail.status === 'pending_kades'
                    ? 'bg-purple-100 text-purple-800'
                    : selectedSuratDetail.status === 'rejected_kades' || selectedSuratDetail.status === 'rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedSuratDetail.status === 'completed' ? 'Sah & Diterbitkan' : selectedSuratDetail.status === 'pending_kades' ? 'Menunggu TTD Kades' : selectedSuratDetail.status}
                </span>
              </div>
              <div className="text-slate-500 font-mono">NIK: {selectedSuratDetail.warga_profile?.nik}</div>
              <div className="text-slate-500">
                Wilayah: RT {selectedSuratDetail.warga_profile?.rt?.nomor_rt || '01'} / RW {selectedSuratDetail.warga_profile?.rt?.rw?.nomor_rw || '01'}, Dusun {selectedSuratDetail.warga_profile?.rt?.rw?.dusun?.nama_dusun || 'Krajan'}
              </div>
              {selectedSuratDetail.warga_profile?.no_hp_wa && (
                <div className="text-slate-500">
                  WhatsApp: <span className="font-mono">{selectedSuratDetail.warga_profile.no_hp_wa}</span>
                </div>
              )}
            </div>

            {/* Jenis Surat */}
            <div className="space-y-1">
              <span className="text-slate-500 font-bold">Jenis Surat:</span>
              <div className="font-bold text-emerald-900 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span>{selectedSuratDetail.surat_type?.nama_surat}</span>
                <span className="font-mono text-[11px] text-emerald-700">{selectedSuratDetail.surat_type?.kode_surat}</span>
              </div>
            </div>

            {/* Keperluan */}
            <div className="space-y-1">
              <span className="text-slate-500 font-bold">Keperluan Permohonan:</span>
              <p className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">
                {selectedSuratDetail.keperluan}
              </p>
            </div>

            {/* Nomor Surat Resmi jika ada */}
            {selectedSuratDetail.nomor_surat_resmi && (
              <div className="space-y-1">
                <span className="text-slate-500 font-bold">Nomor Surat Resmi Sah:</span>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono font-bold">
                  {selectedSuratDetail.nomor_surat_resmi}
                </div>
              </div>
            )}

            {/* Berkas Lampiran */}
            {selectedSuratDetail.file_lampiran && (
              <div className="space-y-1">
                <span className="text-slate-500 font-bold">Berkas Lampiran Persyaratan:</span>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-700 font-mono text-[11px] truncate max-w-[260px]">
                    {typeof selectedSuratDetail.file_lampiran === 'string'
                      ? selectedSuratDetail.file_lampiran.split('/').pop()
                      : 'Dokumen Persyaratan'}
                  </span>
                  <a
                    href={typeof selectedSuratDetail.file_lampiran === 'string'
                      ? (selectedSuratDetail.file_lampiran.startsWith('http') ? selectedSuratDetail.file_lampiran : `/uploads/lampiran/${selectedSuratDetail.file_lampiran.split('/').pop()}`)
                      : '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] flex items-center gap-1"
                  >
                    <ExternalLink size={12} />
                    <span>Lihat Berkas</span>
                  </a>
                </div>
              </div>
            )}

            {/* Status Persetujuan RT */}
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] space-y-1">
              <div className="font-bold flex items-center gap-1">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Persetujuan Ketua RT Setempat (Sah):</span>
              </div>
              <p>{(selectedSuratDetail as any).catatan_rt || selectedSuratDetail.verification_notes || 'Permohonan warga telah diverifikasi dan disetujui resmi oleh Ketua RT. Siap diterbitkan TTD QR oleh Kepala Desa.'}</p>
            </div>

            {/* Catatan Penolakan Kades jika ada */}
            {(selectedSuratDetail.catatan_penolakan_kades || selectedSuratDetail.catatan_penolakan) && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-semibold">
                Catatan Penolakan: {selectedSuratDetail.catatan_penolakan_kades || selectedSuratDetail.catatan_penolakan}
              </div>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedSuratDetail(null)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-extrabold cursor-pointer text-xs"
            >
              Tutup Pratinjau
            </button>
            {selectedSuratDetail.status === 'pending_kades' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    const s = selectedSuratDetail;
                    setSelectedSuratDetail(null);
                    setSelectedSuratForReject(s);
                    setRejectReason('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-extrabold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <XCircle size={14} className="text-rose-600" />
                  <span>Tolak</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const s = selectedSuratDetail;
                    setSelectedSuratDetail(null);
                    setSelectedSuratForApprove(s);
                    setNomorSuratInput(s.nomor_surat_resmi || '');
                    setApproveCatatan('');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShieldCheck size={14} />
                  <span>Setujui & Sahkan</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const renderPrintSuratModal = () => {
    if (!printSurat) return null;
    return <CetakSuratModal surat={printSurat} desa={desa} onClose={() => setPrintSurat(null)} />;
  };

  const renderAddSkModal = () => {
    if (!showAddSkModal) return null;
    return createPortal(
      <div 
        className="fixed inset-0 bg-slate-900/60 z-[999999] flex items-center justify-center p-4 backdrop-blur-xs font-sans animate-fade-in"
        onClick={() => setShowAddSkModal(false)}
      >
        <div 
          className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">Penerbitan Keputusan Kepala Desa</h3>
              <p className="text-xs text-slate-500">Ketetapan resmi kepemimpinan Kepala Desa Doko</p>
            </div>
            <button 
              type="button"
              onClick={() => setShowAddSkModal(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateSk} className="space-y-4 text-xs font-semibold">
            {skModalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{skModalError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-slate-700">Nomor SK Resmi (Opsional / Otomatis Terbit)</label>
              <input
                type="text"
                value={newSkNomor}
                onChange={(e) => {
                  setNewSkNomor(e.target.value);
                  if (skModalError) setSkModalError('');
                }}
                placeholder="Kosongkan jika ingin nomor otomatis (Contoh: 188.45/05/418.66.04/2026)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 block font-normal">
                Jika dikosongkan, sistem akan mengenerate nomor SK urut resmi tahun 2026 secara otomatis.
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700">Kategori Kebijakan</label>
              <select
                value={newSkKategori}
                onChange={(e) => setNewSkKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Tata Kelola">Tata Kelola & Pelayanan Desa</option>
                <option value="Bantuan Sosial">Bantuan Sosial & Kesejahteraan</option>
                <option value="Pembangunan">Pembangunan Infrastruktur Desa</option>
                <option value="Kelembagaan">Kelembagaan RT, RW & BPD</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700">Judul / Perihal Ketetapan (Tentang) *</label>
              <textarea
                rows={3}
                required
                value={newSkTentang}
                onChange={(e) => setNewSkTentang(e.target.value)}
                placeholder="Contoh: Penetapan Batas Wilayah Pengelolaan Fasilitas Umum..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700">Uraian / Konsiderans Singkat</label>
              <textarea
                rows={2}
                value={newSkKeterangan}
                onChange={(e) => setNewSkKeterangan(e.target.value)}
                placeholder="Contoh: Berdasarkan hasil musyawarah desa tanggal..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddSkModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors font-bold shadow-xs cursor-pointer"
              >
                Tetapkan & Sahkan
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const renderPengaduanResponseModal = () => {
    if (!selectedPengaduanForResponse) return null;
    return createPortal(
      <div 
        className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in"
        onClick={() => setSelectedPengaduanForResponse(null)}
      >
        <div 
          className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Disposisi Kepala Desa
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                Tanggapi Pengaduan: {selectedPengaduanForResponse.judul}
              </h3>
              <p className="text-xs text-slate-500">
                Dari warga RT {selectedPengaduanForResponse.rt?.nomor_rt || selectedPengaduanForResponse.warga_profile?.rt?.nomor_rt || '01'} ({selectedPengaduanForResponse.warga_profile?.nama_lengkap || 'Warga'})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPengaduanForResponse(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {selectedPengaduanForResponse.status === 'Selesai' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-extrabold block">Aspirasi Ini Telah Tuntas Ditangani</span>
                <span className="text-[11px] text-emerald-700">Catatan baru akan dicatat sebagai riwayat koordinasi pelengkap tanpa membuka ulang status pengaduan.</span>
              </div>
            </div>
          )}

          {/* Linimasa Riwayat Disposisi Kronologis (Immutable History) */}
          {selectedPengaduanForResponse.riwayat_tanggapan && selectedPengaduanForResponse.riwayat_tanggapan.length > 0 && (
            <div className="space-y-2 max-h-36 overflow-y-auto p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                Riwayat Disposisi Sebelumnya ({selectedPengaduanForResponse.riwayat_tanggapan.length}):
              </span>
              {selectedPengaduanForResponse.riwayat_tanggapan.map((item: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="font-bold text-emerald-800">{item.petugas || 'Pemerintah Desa'} ({item.role || 'kades'})</span>
                    <span>{item.waktu ? new Date(item.waktu).toLocaleString('id-ID') : '-'}</span>
                  </div>
                  <p className="text-slate-800 leading-snug">{item.tanggapan}</p>
                  <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    Status: {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleDisposisi} className="space-y-4 text-xs font-semibold">
            {selectedPengaduanForResponse.status !== 'Selesai' && (
              <button
                type="button"
                onClick={() => {
                  setTanggapanDisposisiKe('Selesai Ditangani');
                  setTanggapanStatus('Selesai');
                  if (!tanggapanText.trim()) {
                    setTanggapanText('Masalah telah ditindaklanjuti dan diselesaikan secara tuntas oleh Pemerintah Desa Doko.');
                  }
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={15} className="text-emerald-700" />
                <span>Tandai Langsung Tuntas & Selesai Ditangani</span>
              </button>
            )}

            <div className="space-y-1.5">
              <label className="text-slate-700">Disposisi Penanganan (Didisposisikan ke Mana) *</label>
              <select
                value={tanggapanDisposisiKe}
                onChange={(e) => {
                  setTanggapanDisposisiKe(e.target.value);
                  if (e.target.value === 'Selesai Ditangani') {
                    setTanggapanStatus('Selesai');
                  } else {
                    setTanggapanStatus('Didisposisikan');
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
              >
                <option value="Ketua RT">Ketua RT (Pengurus RT Setempat)</option>
                <option value="Ketua RW">Ketua RW (Koordinator Lingkungan RW)</option>
                <option value="Sekretaris Desa">Sekretaris Desa (Tata Laksana & Administrasi Desa)</option>
                <option value="Kaur Perencanaan & Pembangunan">Kaur Perencanaan & Pembangunan (Infrastruktur, Jalan & Fasilitas Fisik)</option>
                <option value="Kasi Pemerintahan & Ketertiban">Kasi Pemerintahan & Ketertiban (Keamanan & Ketertiban Wilayah)</option>
                <option value="Kasi Kesejahteraan & Pelayanan">Kasi Kesejahteraan & Pelayanan (Bansos, Kesehatan & Warga Rentan)</option>
                <option value="Kaur Keuangan / Bendahara">Kaur Keuangan / Bendahara (Anggaran & Dana Desa)</option>
                <option value="Kepala Desa">Kepala Desa (Instruksi Kebijakan Langsung)</option>
                <option value="Selesai Ditangani">Selesai Ditangani (Penanganan Lapangan Tuntas)</option>
                <option value="Ditolak">Ditolak (Di Luar Kewenangan Desa)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700">Arahan Resmi / Tanggapan Disposisi Kades *</label>
              <textarea
                rows={4}
                required
                value={tanggapanText}
                onChange={(e) => setTanggapanText(e.target.value)}
                placeholder="Contoh: Telah dikoordinasikan dengan Kasi Kesejahteraan dan Kasun Krajan untuk perbaikan material pada jadwal minggu ini..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPengaduanForResponse(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-extrabold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmittingResponse}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmittingResponse ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan Disposisi Resmi</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  const renderZoomPhotoModal = () => {
    if (!zoomPengaduanPhoto) return null;
    return createPortal(
      <div
        className="fixed inset-0 z-[9999999] bg-slate-900/85 flex items-center justify-center p-4 animate-fade-in cursor-pointer"
        onClick={() => setZoomPengaduanPhoto(null)}
      >
        <div
          className="bg-white rounded-3xl p-4 max-w-2xl w-full max-h-[90vh] flex flex-col space-y-3 border border-slate-200 shadow-2xl animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Foto Lampiran Pengaduan</span>
            </span>
            <button
              type="button"
              onClick={() => setZoomPengaduanPhoto(null)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl bg-black flex items-center justify-center min-h-[300px]">
            <img src={zoomPengaduanPhoto} alt="Foto Zoom" className="w-full h-full object-contain max-h-[70vh]" />
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const renderNotificationToast = () => {
    if (!notification) return null;
    return createPortal(
      <div className="fixed top-5 right-5 sm:top-6 sm:right-6 z-[99999999] max-w-sm w-[calc(100vw-2.5rem)] animate-slide-down pointer-events-auto">
        <div
          className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-emerald-950/15'
              : notification.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-amber-950/15'
              : 'bg-rose-50 border-rose-300 text-rose-950 shadow-rose-950/15'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : notification.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-xs sm:text-sm leading-snug">{notification.title}</h4>
            <p className="text-[11px] sm:text-xs mt-1 text-slate-700 leading-relaxed break-words">{notification.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 p-1 -mr-1 -mt-1 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Tutup Notifikasi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>,
      document.body
    );
  };

  const renderAllModals = () => (
    <>
      {renderNotificationToast()}
      {renderApproveSuratModal()}
      {renderRejectSuratModal()}
      {renderDetailSuratModal()}
      {renderPrintSuratModal()}
      {renderApprovePengumumanModal()}
      {renderRejectPengumumanModal()}
      {renderAddSkModal()}
      {renderPengaduanResponseModal()}
      {renderZoomPhotoModal()}
    </>
  );

  const pendingKadesSurats = surats.filter((s) => ['pending_kades', 'processed_sekdes', 'approved_rt'].includes(s.status));
  const completedSurats = surats.filter((s) => s.status === 'completed');
  const rejectedKadesSurats = surats.filter((s) => s.status === 'rejected_kades');
  const pendingSurats = pendingKadesSurats; // alias

  const pendingPengumumans = pengumumans.filter((p) => p.status === 'pending_approval');
  const publishedPengumumans = pengumumans.filter((p) => p.status === 'published');
  const rejectedPengumumans = pengumumans.filter((p) => p.status === 'rejected');

  // SUBMENU 1: KEBIJAKAN & KEPUTUSAN KADES (SK KADES & PERDES)
  if (['kebijakan_desa', 'sk_kades', 'perdes'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Pimpinan Eksekutif Desa
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Buku Keputusan & Peraturan Kepala Desa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pengesahan resmi produk hukum desa (SK Kepala Desa, Peraturan Desa, dan Surat Edaran Kebijakan).
            </p>
          </div>
          <button
            onClick={() => setShowAddSkModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer press-down"
          >
            <Plus size={16} />
            <span>Terbitkan Keputusan Kades Baru</span>
          </button>
        </div>

        {/* List of SK Kades */}
        {(() => {
          const paginatedSk = daftarSk.slice((skPage - 1) * 6, skPage * 6);

          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedSk.map((sk) => (
                  <div
                    key={sk.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {sk.nomor_sk}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900">
                        {sk.status}
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

              <Pagination
                currentPage={skPage}
                totalItems={daftarSk.length}
                pageSize={6}
                onPageChange={setSkPage}
                itemLabel="keputusan SK"
              />
            </>
          );
        })()}

        {/* Modal-modal global */}
        {renderAllModals()}
      </div>
    );
  }

  // SUBMENU 2: PENGAWASAN APBDES & KEUANGAN DESA (OTORISASI PKPKD)
  if (['pengawasan_apbdes', 'keuangan', 'apbdes'].includes(normalizedSubmenu)) {
    const s = apbdesData?.summary;
    const records: ApbdesRecord[] = apbdesData?.records || [];
    const totalAnggaran = (s?.pendapatan?.anggaran || 1110000000);
    const totalRealisasi = (s?.pendapatan?.realisasi || 675000000);
    const belanjaAnggaran = (s?.belanja?.anggaran || 235000000);
    const belanjaRealisasi = (s?.belanja?.realisasi || 217500000);

    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Pengawasan Keuangan Desa (PKPKD)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Pengawasan & Otorisasi APBDes Tahun Anggaran 2026
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pengawasan tertinggi terhadap penerimaan pendapatan dan realisasi belanja desa yang dikelola Kaur Keuangan dan diverifikasi Sekdes.
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
            Audit Siskeudes 100% WTP
          </span>
        </div>

        {/* Metrik Eksekutif APBDes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 sm:space-y-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">Total Pagu Pendapatan Desa</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              Rp {(totalAnggaran / 1000000).toLocaleString('id-ID')} Juta
            </div>
            <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>Realisasi: Rp {(totalRealisasi / 1000000).toLocaleString('id-ID')} Juta ({Math.round((totalRealisasi/totalAnggaran)*100)}%)</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 sm:space-y-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">Pagu Belanja APBDes 2026</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              Rp {(belanjaAnggaran / 1000000).toLocaleString('id-ID')} Juta
            </div>
            <div className="text-xs text-teal-700 font-semibold flex items-center gap-1">
              <TrendingUp size={13} />
              <span>Serapan: Rp {(belanjaRealisasi / 1000000).toLocaleString('id-ID')} Juta ({Math.round((belanjaRealisasi/belanjaAnggaran)*100)}%)</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 sm:space-y-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500">Sisa Saldo Kas Rekening Desa</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-800">
              Rp {((totalRealisasi - belanjaRealisasi) / 1000000).toLocaleString('id-ID')} Juta
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              Bank Jatim Cabang Kediri (Kas Aktif)
            </div>
          </div>
        </div>

        {/* Tabel Ringkasan Pos Anggaran Terbuka */}
        {(() => {
          const paginatedApbdes = records.slice((apbdesPage - 1) * PAGE_SIZE, apbdesPage * PAGE_SIZE);

          return (
            <div className="card-surface p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900">Rincian Pos Anggaran & Realisasi Belanja Desa</h3>
                <span className="text-xs font-bold text-slate-400">{records.length} Pos Terdata</span>
              </div>

              {/* Mobile Card List View (Clean & Anti-Slop for Mobile Screens) */}
              <div className="block md:hidden space-y-3">
                {paginatedApbdes.map((r) => {
                  const pct = r.anggaran > 0 ? Math.round((r.realisasi / r.anggaran) * 100) : 0;
                  return (
                    <div key={r.id} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 truncate max-w-[200px]">
                          {r.category?.nama_kategori || 'Bidang APBDes'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                          pct >= 90 ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                          pct >= 50 ? 'bg-teal-100 text-teal-900 border border-teal-200' :
                          'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          Serapan {pct}%
                        </span>
                      </div>

                      <div className="font-bold text-xs text-slate-900 leading-snug">
                        {r.uraian}
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 90 ? 'bg-emerald-600' : pct >= 50 ? 'bg-teal-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>

                      {/* 2-Col Budget Summary */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Pagu Anggaran</span>
                          <span className="font-mono font-black text-slate-800 text-[11px] block">
                            Rp {Number(r.anggaran).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                          <span className="text-[10px] font-bold text-emerald-700 block mb-0.5">Realisasi Belanja</span>
                          <span className="font-mono font-black text-emerald-900 text-[11px] block">
                            Rp {Number(r.realisasi).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5">Kategori Bidang</th>
                      <th className="py-3 px-3.5">Uraian Program Belanja</th>
                      <th className="py-3 px-3.5 text-right">Pagu Anggaran</th>
                      <th className="py-3 px-3.5 text-right">Realisasi</th>
                      <th className="py-3 px-3.5 text-center">Serapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedApbdes.map((r) => {
                      const pct = r.anggaran > 0 ? Math.round((r.realisasi / r.anggaran) * 100) : 0;
                      return (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3.5 font-bold text-slate-800">{r.category?.nama_kategori || 'Bidang APBDes'}</td>
                          <td className="py-3 px-3.5 text-slate-600">{r.uraian}</td>
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                            Rp {Number(r.anggaran).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-800">
                            Rp {Number(r.realisasi).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900">
                              {pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={apbdesPage}
                totalItems={records.length}
                pageSize={PAGE_SIZE}
                onPageChange={setApbdesPage}
                itemLabel="pos anggaran"
              />
            </div>
          );
        })()}
        {renderAllModals()}
      </div>
    );
  }

  // SUBMENU 3: PERSETUJUAN & MONITORING SURAT RESMI DESA
  if (['persetujuan_surat', 'monitoring_surat', 'surat_desa'].includes(normalizedSubmenu)) {
    const filteredPending = pendingKadesSurats.filter((s) =>
      s.warga_profile?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nomor_resi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.surat_type?.nama_surat?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCompleted = completedSurats.filter((s) =>
      s.warga_profile?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nomor_surat_resmi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nomor_resi?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRejected = rejectedKadesSurats.filter((s) =>
      s.warga_profile?.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nomor_resi?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedPending = filteredPending.slice((suratPage - 1) * PAGE_SIZE, suratPage * PAGE_SIZE);
    const paginatedCompleted = filteredCompleted.slice((suratPage - 1) * PAGE_SIZE, suratPage * PAGE_SIZE);
    const paginatedRejected = filteredRejected.slice((suratPage - 1) * PAGE_SIZE, suratPage * PAGE_SIZE);

    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Persetujuan Surat Desa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Otorisasi final dan penerbitan tanda tangan QR untuk surat warga.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pendingKadesSurats.length > 0 && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                {pendingKadesSurats.length} Menunggu persetujuan
              </span>
            )}
            <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
              {completedSurats.length} Surat sah
            </span>
          </div>
        </div>

        {/* Tab Selector Antrean / Selesai / Ditolak (Responsive & Touch Friendly) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2">
          <button
            onClick={() => setSuratTab('pending')}
            className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
              suratTab === 'pending'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock size={14} />
            <span className="hidden sm:inline">Antrean Persetujuan Kades</span>
            <span className="sm:hidden">Antrean</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              suratTab === 'pending' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-700'
            }`}>
              {pendingKadesSurats.length}
            </span>
          </button>

          <button
            onClick={() => setSuratTab('completed')}
            className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
              suratTab === 'completed'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle2 size={14} />
            <span className="hidden sm:inline">Surat Selesai Sah (Terbit)</span>
            <span className="sm:hidden">Sah Terbit</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              suratTab === 'completed' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-700'
            }`}>
              {completedSurats.length}
            </span>
          </button>

          <button
            onClick={() => setSuratTab('rejected')}
            className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer ${
              suratTab === 'rejected'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <XCircle size={14} />
            <span className="hidden sm:inline">Surat Ditolak Kades</span>
            <span className="sm:hidden">Ditolak</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              suratTab === 'rejected' ? 'bg-rose-800 text-rose-100' : 'bg-slate-100 text-slate-700'
            }`}>
              {rejectedKadesSurats.length}
            </span>
          </button>
        </div>

        <div className="card-surface p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Cari nama warga, nomor resi, atau jenis surat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-500"
              />
            </div>
          </div>

          {/* TAB 1: Antrean Menunggu Kades */}
          {suratTab === 'pending' && (
            <div className="space-y-4">
              {/* Mobile Card Layout - Clean, High Contrast & Thumb-Friendly */}
              <div className="block md:hidden space-y-3">
                {filteredPending.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                    Tidak ada antrean surat yang menunggu persetujuan Kepala Desa saat ini.
                  </div>
                ) : (
                  paginatedPending.map((s) => (
                    <div key={s.id} className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                      {/* Top Bar: Resi & Status Persetujuan RT */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-slate-700 text-xs">{s.nomor_resi}</span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          <span>Disetujui Ketua RT</span>
                        </span>
                      </div>

                      {/* Info Pemohon Warga */}
                      <div>
                        <div className="font-black text-slate-900 text-base leading-snug">{s.warga_profile?.nama_lengkap}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>NIK: {s.warga_profile?.nik}</span>
                          <span>•</span>
                          <span className="font-bold text-emerald-800">
                            RT {s.warga_profile?.rt?.nomor_rt || '01'} / RW {s.warga_profile?.rt?.rw?.nomor_rw || '01'}
                          </span>
                        </div>
                      </div>

                      {/* Box Jenis Surat & Keperluan */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <FileText size={13} className="text-emerald-700 shrink-0" />
                          <span>{s.surat_type?.nama_surat}</span>
                        </div>
                        <div className="text-slate-600 text-xs leading-relaxed pl-4">
                          {s.keperluan}
                        </div>
                      </div>

                      {/* Action Buttons for Mobile: Thumb-Friendly & Clear Hierarchy */}
                      <div className="pt-2 border-t border-slate-100 space-y-2">
                        {/* Primary Button: Sahkan & TTD QR */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSuratForApprove(s);
                            setNomorSuratInput(s.nomor_surat_resmi || '');
                            setApproveCatatan('');
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] select-none text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck size={16} />
                          <span>Terbitkan</span>
                        </button>

                        {/* Secondary Buttons: Detail & Tolak */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSuratDetail(s)}
                            className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] select-none text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>Detail</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSuratForReject(s);
                              setRejectReason('');
                            }}
                            className="py-2 px-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-[0.98] select-none text-rose-800 border border-rose-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <XCircle size={13} className="text-rose-600" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs min-w-[760px]">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3.5">No. Resi</th>
                    <th className="py-3 px-3.5">Pemohon & Wilayah</th>
                    <th className="py-3 px-3.5">Jenis Surat</th>
                    <th className="py-3 px-3.5">Keperluan</th>
                    <th className="py-3 px-3.5">Persetujuan RT</th>
                    <th className="py-3 px-3.5 text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPending.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Tidak ada antrean surat yang menunggu persetujuan Kepala Desa saat ini.
                      </td>
                    </tr>
                  ) : (
                    paginatedPending.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3.5 font-mono font-bold text-slate-700 whitespace-nowrap">
                          {s.nomor_resi}
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-slate-900">{s.warga_profile?.nama_lengkap}</div>
                          <div className="text-[11px] font-mono text-slate-400">NIK: {s.warga_profile?.nik}</div>
                          <div className="text-[10px] text-emerald-800 font-medium">
                            RT {s.warga_profile?.rt?.nomor_rt || '01'} / RW {s.warga_profile?.rt?.rw?.nomor_rw || '01'}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-bold text-emerald-900">{s.surat_type?.nama_surat}</td>
                        <td className="py-3 px-3.5 text-slate-600 max-w-[180px] truncate" title={s.keperluan}>
                          {s.keperluan}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                            <CheckCircle2 size={11} className="text-emerald-600" />
                            <span>Disetujui Ketua RT</span>
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedSuratDetail(s)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Lihat Detail Permohonan"
                            >
                              <Eye size={13} />
                              <span>Detail</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSuratForReject(s);
                                setRejectReason('');
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                              title="Tolak Surat dengan Alasan Wajib"
                            >
                              <XCircle size={13} className="text-rose-600" />
                              <span>Tolak</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSuratForApprove(s);
                                setNomorSuratInput(s.nomor_surat_resmi || '');
                                setApproveCatatan('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                              title="Setujui dan Sahkan Surat Secara Digital"
                            >
                              <ShieldCheck size={14} />
                              <span>Terbitkan</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={suratPage}
              totalItems={filteredPending.length}
              pageSize={PAGE_SIZE}
              onPageChange={setSuratPage}
              itemLabel="antrean surat"
            />
          </div>
        )}

          {/* TAB 2: Surat Selesai Sah */}
          {suratTab === 'completed' && (
            <div className="space-y-4">
              {/* Mobile Card Layout */}
              <div className="block md:hidden space-y-3">
                {filteredCompleted.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                    Belum ada surat yang diterbitkan secara sah.
                  </div>
                ) : (
                  paginatedCompleted.map((s) => (
                    <div key={s.id} className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-emerald-800 text-xs">{s.nomor_surat_resmi || '-'}</span>
                        <span className="text-[10px] text-slate-400">{new Date(s.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{s.warga_profile?.nama_lengkap}</div>
                        <div className="text-[11px] font-mono text-slate-400">NIK: {s.warga_profile?.nik}</div>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="font-bold text-emerald-900">{s.surat_type?.nama_surat}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{s.keperluan}</div>
                      </div>
                      <div className="pt-1 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => setPrintSurat(s)}
                          className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Printer size={13} />
                          <span>Pratinjau Cetak</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5">No. Surat Resmi</th>
                      <th className="py-3 px-3.5">Pemohon & NIK</th>
                      <th className="py-3 px-3.5">Jenis Surat</th>
                      <th className="py-3 px-3.5">Keperluan</th>
                      <th className="py-3 px-3.5">Tanggal Terbit</th>
                      <th className="py-3 px-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCompleted.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Belum ada surat yang diterbitkan secara sah.
                        </td>
                      </tr>
                    ) : (
                      paginatedCompleted.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3.5 font-mono font-bold text-emerald-800 whitespace-nowrap">
                            {s.nomor_surat_resmi || '-'}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="font-bold text-slate-900">{s.warga_profile?.nama_lengkap}</div>
                            <div className="text-[11px] font-mono text-slate-400">NIK: {s.warga_profile?.nik}</div>
                          </td>
                          <td className="py-3 px-3.5 font-medium text-slate-700">{s.surat_type?.nama_surat}</td>
                          <td className="py-3 px-3.5 text-slate-600 max-w-[180px] truncate" title={s.keperluan}>{s.keperluan}</td>
                          <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap">{new Date(s.created_at).toLocaleDateString('id-ID')}</td>
                          <td className="py-3 px-3.5 text-right">
                            <button
                              onClick={() => setPrintSurat(s)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              <Printer size={13} />
                              <span>Pratinjau Cetak</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={suratPage}
                totalItems={filteredCompleted.length}
                pageSize={PAGE_SIZE}
                onPageChange={setSuratPage}
                itemLabel="surat terbit"
              />
            </div>
          )}

          {/* TAB 3: Surat Ditolak Kades */}
          {suratTab === 'rejected' && (
            <div className="space-y-4">
              {/* Mobile Card Layout */}
              <div className="block md:hidden space-y-3">
                {filteredRejected.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                    Tidak ada catatan surat yang ditolak oleh Kepala Desa.
                  </div>
                ) : (
                  paginatedRejected.map((s) => (
                    <div key={s.id} className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-slate-700 text-xs">{s.nomor_resi}</span>
                        <span className="text-[10px] text-slate-400">{new Date(s.updated_at || s.created_at).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{s.warga_profile?.nama_lengkap}</div>
                        <div className="text-[11px] font-mono text-slate-400">NIK: {s.warga_profile?.nik}</div>
                      </div>
                      <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900">
                        <span className="font-bold block text-[10px] uppercase text-rose-700">Alasan Penolakan:</span>
                        <span>{s.catatan_penolakan_kades || s.catatan_penolakan || 'Syarat berkas belum lengkap.'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5">No. Resi</th>
                      <th className="py-3 px-3.5">Pemohon & NIK</th>
                      <th className="py-3 px-3.5">Jenis Surat</th>
                      <th className="py-3 px-3.5">Alasan Penolakan Kades</th>
                      <th className="py-3 px-3.5">Tanggal Ditolak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRejected.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          Tidak ada catatan surat yang ditolak oleh Kepala Desa.
                        </td>
                      </tr>
                    ) : (
                      paginatedRejected.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3.5 font-mono font-bold text-slate-700 whitespace-nowrap">{s.nomor_resi}</td>
                          <td className="py-3 px-3.5">
                            <div className="font-bold text-slate-900">{s.warga_profile?.nama_lengkap}</div>
                            <div className="text-[11px] font-mono text-slate-400">NIK: {s.warga_profile?.nik}</div>
                          </td>
                          <td className="py-3 px-3.5 font-medium text-slate-700">{s.surat_type?.nama_surat}</td>
                          <td className="py-3 px-3.5 text-rose-800 font-semibold max-w-[260px]">
                            {s.catatan_penolakan_kades || s.catatan_penolakan || 'Perlu perbaikan berkas'}
                          </td>
                          <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap">{new Date(s.updated_at || s.created_at).toLocaleDateString('id-ID')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={suratPage}
                totalItems={filteredRejected.length}
                pageSize={PAGE_SIZE}
                onPageChange={setSuratPage}
                itemLabel="surat ditolak"
              />
            </div>
          )}
        </div>

        {renderAllModals()}
      </div>
    );
  }

  // SUBMENU BARU: PERSETUJUAN PENGUMUMAN OLEH KEPALA DESA
  if (['persetujuan_pengumuman', 'pengumuman'].includes(normalizedSubmenu)) {
    const filteredPengumumanPending = pendingPengumumans.filter((p) =>
      p.judul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kategori?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Pimpinan Eksekutif Desa
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Persetujuan & Publikasi Pengumuman Desa
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Setujui draf pengumuman dan surat undangan yang disiapkan Sekretaris Desa sebelum disebarluaskan ke publik.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {pendingPengumumans.length > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                {pendingPengumumans.length} Draf Menunggu
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200">
              {publishedPengumumans.length} Pengumuman Terbit Sah
            </span>
          </div>
        </div>

        {/* Tab Selector Pengumuman (Responsive, Touch & Thumb-Friendly) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setPengumumanTab('pending')}
            className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer active:scale-[0.98] select-none ${
              pengumumanTab === 'pending'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock size={14} />
            <span className="hidden sm:inline">Menunggu Persetujuan</span>
            <span className="sm:hidden">Menunggu</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              pengumumanTab === 'pending' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-700'
            }`}>
              {pendingPengumumans.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPengumumanTab('published')}
            className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer active:scale-[0.98] select-none ${
              pengumumanTab === 'published'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle2 size={14} />
            <span className="hidden sm:inline">Pengumuman Aktif</span>
            <span className="sm:hidden">Aktif Tayang</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              pengumumanTab === 'published' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-700'
            }`}>
              {publishedPengumumans.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPengumumanTab('rejected')}
            className={`px-3.5 sm:px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer active:scale-[0.98] select-none ${
              pengumumanTab === 'rejected'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <XCircle size={14} />
            <span className="hidden sm:inline">Draf Ditolak</span>
            <span className="sm:hidden">Ditolak</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              pengumumanTab === 'rejected' ? 'bg-rose-800 text-rose-100' : 'bg-slate-100 text-slate-700'
            }`}>
              {rejectedPengumumans.length}
            </span>
          </button>
        </div>

        {/* Pengumuman List */}
        {(() => {
          const activePengumumanList = pengumumanTab === 'pending' ? filteredPengumumanPending : pengumumanTab === 'published' ? publishedPengumumans : rejectedPengumumans;
          const paginatedPengumuman = activePengumumanList.slice((pengumumanPage - 1) * 6, pengumumanPage * 6);

          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePengumumanList.length === 0 ? (
                  <div className="col-span-2 p-8 sm:p-12 text-center bg-white border border-slate-200/90 rounded-3xl shadow-2xs space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-100">
                      <Megaphone size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900">
                        {pengumumanTab === 'pending'
                          ? 'Tidak Ada Draf Menunggu Persetujuan'
                          : pengumumanTab === 'published'
                          ? 'Belum Ada Pengumuman Aktif Tayang'
                          : 'Tidak Ada Draf yang Ditolak'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                        {pengumumanTab === 'pending'
                          ? 'Draf pengumuman baru yang disusun oleh Sekretaris Desa akan otomatis masuk ke sini untuk diotorisasi Kepala Desa.'
                          : 'Seluruh arsip pengumuman dan publikasi desa tercatat dengan aman dan teratur.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  paginatedPengumuman.map((p) => (
                    <div key={p.id} className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            {p.kategori || 'Warta Desa'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            p.status === 'published' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
                            p.status === 'rejected' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
                            'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                          }`}>
                            {p.status === 'published' ? 'Publikasi Aktif' : p.status === 'rejected' ? 'Draf Ditolak' : 'Menunggu ACC Kades'}
                          </span>
                        </div>

                        <h3 className="font-black text-sm text-slate-900 leading-snug">{p.judul}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{p.isi}</p>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Target: <strong className="text-slate-700">{p.level_target || 'Semua Warga'}</strong></span>
                          <span>Jadwal: {p.tanggal || (p.tanggal_mulai ? new Date(p.tanggal_mulai).toLocaleDateString('id-ID') : '-')}</span>
                        </div>

                        {p.catatan_penolakan_kades && (
                          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold">
                            Catatan Kades: {p.catatan_penolakan_kades}
                          </div>
                        )}
                      </div>

                      {/* Tombol Keputusan Kades jika status pending */}
                      {p.status === 'pending_approval' && (
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPengumumanForApprove(p)}
                            className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] select-none text-white font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 size={15} />
                            <span>Setujui & Publikasikan Warta</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPengumumanForReject(p);
                              setRejectPengumumanReason('');
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-[0.98] select-none text-rose-800 border border-rose-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <XCircle size={14} className="text-rose-600" />
                            <span>Tolak Draf Pengumuman</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <Pagination
                currentPage={pengumumanPage}
                totalItems={activePengumumanList.length}
                pageSize={6}
                onPageChange={setPengumumanPage}
                itemLabel="pengumuman"
              />
            </>
          );
        })()}

        {/* Modal-modal global */}
        {renderAllModals()}
      </div>
    );
  }

  // SUBMENU 4: KEBIJAKAN BANSOS (OTORISASI KPM BANSOS)
  if (['kebijakan_bansos', 'otorisasi_bansos', 'bansos'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <BansosManager isKades={true} />
        {renderAllModals()}
      </div>
    );
  }

  // SUBMENU 5: ASPIRASI & PENGADUAN WARGA
  if (['aspirasi_warga', 'pengaduan'].includes(normalizedSubmenu)) {
    const filteredPengaduans = pengaduans.filter((p) => {
      const rtId = p.rt_id || p.warga_profile?.rt_id;
      const rwId = p.rt?.rw_id || p.warga_profile?.rt?.rw_id;

      if (selectedRwFilter !== 'all' && String(rwId) !== String(selectedRwFilter)) {
        return false;
      }
      if (selectedRtFilter !== 'all' && String(rtId) !== String(selectedRtFilter)) {
        return false;
      }
      if (selectedStatusFilter !== 'all' && p.status !== selectedStatusFilter) {
        return false;
      }
      if (selectedKategoriFilter !== 'all' && p.kategori !== selectedKategoriFilter) {
        return false;
      }
      return true;
    });

    const paginatedPengaduans = filteredPengaduans.slice((pengaduanPage - 1) * 6, pengaduanPage * 6);

    const availableRts = selectedRwFilter === 'all'
      ? wilayahRts
      : wilayahRts.filter(rt => String(rt.rw_id) === String(selectedRwFilter));

    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Pusat Pengawasan Aspirasi Wilayah
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Rekap Aspirasi & Pengaduan Warga Desa Doko
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pilah keluhan masyarakat berdasarkan batas wilayah RT/RW dan berikan arahan disposisi tindak lanjut.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200 shrink-0">
            {filteredPengaduans.length} dari {pengaduans.length} Pengaduan
          </span>
        </div>

        {/* Filter Bar Wilayah RT / RW, Status, & Kategori */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-700">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Pilah Berdasarkan Wilayah RT / RW & Kategori:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Filter RW */}
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Pilih Rukun Warga (RW)</label>
              <select
                value={selectedRwFilter}
                onChange={(e) => {
                  setSelectedRwFilter(e.target.value);
                  setSelectedRtFilter('all');
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
              >
                <option value="all">Semua RW (Seluruh Desa)</option>
                {wilayahRws.map((rw) => (
                  <option key={rw.id} value={rw.id}>
                    RW {rw.nomor_rw} {rw.dusun?.nama_dusun ? `(${rw.dusun.nama_dusun})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter RT */}
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Pilih Rukun Tetangga (RT)</label>
              <select
                value={selectedRtFilter}
                onChange={(e) => setSelectedRtFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
              >
                <option value="all">Semua RT di Wilayah Ini</option>
                {availableRts.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    RT {rt.nomor_rt} (RW {rt.rw?.nomor_rw || '01'})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Status */}
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Status Penanganan</label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
              >
                <option value="all">Semua Status</option>
                <option value="Terkirim">Terkirim (Menunggu Respon)</option>
                <option value="Ditinjau RT">Ditinjau RT</option>
                <option value="Diproses Desa">Diproses Desa</option>
                <option value="Selesai">Selesai Ditangani</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>

            {/* Filter Kategori */}
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Kategori Masalah</label>
              <select
                value={selectedKategoriFilter}
                onChange={(e) => setSelectedKategoriFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
              >
                <option value="all">Semua Kategori</option>
                <option value="Infrastruktur & Jalan">Infrastruktur & Jalan</option>
                <option value="Kebersihan & Lingkungan">Kebersihan & Lingkungan</option>
                <option value="Keamanan & Ketertiban">Keamanan & Ketertiban</option>
                <option value="Bantuan Sosial & Kesejahteraan">Bantuan Sosial</option>
                <option value="Pelayanan Administrasi Desa">Pelayanan Administrasi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>

          {(selectedRwFilter !== 'all' || selectedRtFilter !== 'all' || selectedStatusFilter !== 'all' || selectedKategoriFilter !== 'all') && (
            <div className="pt-1 flex items-center justify-between text-xs">
              <span className="text-[11px] text-emerald-700 font-bold">
                Filter aktif: {selectedRwFilter !== 'all' ? `RW ${selectedRwFilter} ` : ''}{selectedRtFilter !== 'all' ? `RT ${selectedRtFilter} ` : ''}{selectedStatusFilter !== 'all' ? `Status: ${selectedStatusFilter} ` : ''}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedRwFilter('all');
                  setSelectedRtFilter('all');
                  setSelectedStatusFilter('all');
                  setSelectedKategoriFilter('all');
                }}
                className="text-xs font-black text-rose-600 hover:underline cursor-pointer"
              >
                Reset Semua Filter
              </button>
            </div>
          )}
        </div>

        {/* Grid Laporan Pengaduan Terpilah */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPengaduans.length === 0 ? (
            <div className="col-span-2 p-10 text-center text-slate-400 bg-white border border-slate-200/90 rounded-3xl shadow-2xs space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-bold text-slate-600">Tidak ada pengaduan warga yang sesuai dengan kriteria filter.</p>
              <p className="text-xs text-slate-400">Silakan ubah pilihan RT, RW, atau status penanganan di atas.</p>
            </div>
          ) : (
            paginatedPengaduans.map((p) => {
              const rtNum = p.rt?.nomor_rt || p.warga_profile?.rt?.nomor_rt || '01';
              const rwNum = p.rt?.rw?.nomor_rw || p.warga_profile?.rt?.rw?.nomor_rw || '01';
              const dusunName = p.rt?.rw?.dusun?.nama_dusun || p.warga_profile?.rt?.rw?.dusun?.nama_dusun || 'Dusun Doko Krajan';

              return (
                <div
                  key={p.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-emerald-300 transition-all"
                >
                  <div className="space-y-3">
                    {/* Header: Wilayah RT/RW Badge & Status */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>RT {rtNum} / RW {rwNum}</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          • {dusunName}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        p.status === 'Selesai' || p.disposisi_ke === 'Selesai Ditangani'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : p.disposisi_ke
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {p.status === 'Selesai' || p.disposisi_ke === 'Selesai Ditangani'
                          ? 'Selesai Ditangani'
                          : p.disposisi_ke
                          ? `Didisposisikan ke: ${p.disposisi_ke}`
                          : 'Menunggu Disposisi (Ketua RT)'}
                      </span>
                    </div>

                    {/* Info Pelapor & Kategori */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-slate-800">
                        {p.warga_profile?.nama_lengkap || 'Warga Masyarakat'}
                        <span className="text-slate-400 font-normal ml-1">
                          (NIK: {p.warga_profile?.nik ? `${p.warga_profile.nik.substring(0, 6)}******` : '350604***'})
                        </span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700">
                        {p.kategori || 'Umum'}
                      </span>
                    </div>

                    {/* Judul & Isi Laporan */}
                    <div>
                      <h4 className="font-black text-sm text-slate-900 leading-snug">{p.judul}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{p.deskripsi || p.isi_pengaduan}</p>
                    </div>

                    {/* Foto Lampiran jika ada */}
                    {p.foto_lampiran && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setZoomPengaduanPhoto(p.foto_lampiran)}
                          className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video max-h-32 w-full flex items-center justify-center cursor-pointer"
                        >
                          <img src={p.foto_lampiran} alt="Foto Bukti" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Perbesar Bukti</span>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Tanggapan Resmi jika ada */}
                    {p.tanggapan && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/90 text-xs space-y-1">
                        <span className="font-bold text-emerald-800 block text-[10px] uppercase flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tanggapan / Arahan Disposisi:</span>
                        </span>
                        <p className="text-slate-700 leading-relaxed">{p.tanggapan}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer & Tombol Aksi Kades */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] text-slate-400">
                      {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>

                    {p.status === 'Selesai' ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tuntas Ditangani</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPengaduanForResponse(p);
                            setTanggapanText(p.tanggapan || '');
                            setTanggapanDisposisiKe(p.disposisi_ke || 'Selesai Ditangani');
                            setTanggapanStatus('Selesai');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                        >
                          Lihat Catatan Disposisi
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPengaduanForResponse(p);
                          setTanggapanText(p.tanggapan || '');
                          setTanggapanDisposisiKe(p.disposisi_ke || 'Kaur Perencanaan & Pembangunan');
                          setTanggapanStatus(p.status === 'Selesai' ? 'Selesai' : 'Didisposisikan');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{p.tanggapan ? 'Perbarui Disposisi' : 'Disposisikan ke Perangkat'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Pagination
          currentPage={pengaduanPage}
          totalItems={filteredPengaduans.length}
          pageSize={6}
          onPageChange={setPengaduanPage}
          itemLabel="pengaduan"
        />

        {/* Modal-modal global */}
        {renderAllModals()}
      </div>
    );
  }

  // SUBMENU 6: PETA WILAYAH DESA
  if (['peta_desa', 'peta_wilayah'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-6 page-enter font-sans">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs overflow-hidden">
          <DesaTerritoryMap />
        </div>
        {renderAllModals()}
      </div>
    );
  }

  // SUBMENU 7: AGENDA DESA
  if (['agenda_desa', 'agenda'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-6">
        <AgendaDesaView />
        {renderAllModals()}
      </div>
    );
  }

  // SUBMENU 8: PROFIL SAYA
  if (['profil_saya', 'profil'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-6">
        <ProfileSayaView />
        {renderAllModals()}
      </div>
    );
  }

  // SUBMENU 9: STRUKTUR HIERARKI & VISI MISI
  if (['struktur_pemerintahan', 'visi_misi', 'struktur', 'hierarki'].includes(normalizedSubmenu)) {
    return (
      <div className="space-y-6">
        <KadesStrukturVisiMisiView />
        {renderAllModals()}
      </div>
    );
  }

  // DEFAULT
  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          Dashboard Kepala Desa
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Ringkasan tata kelola, permohonan surat, dan anggaran desa.
        </p>
      </div>

      {/* Banner Akses Cepat Struktur Pamong & Visi Misi */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-200 uppercase tracking-wider">
            <span>Tata Kelola Pemerintahan & Profil Publik</span>
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-tight">Struktur Hierarki Pamong & Visi Misi Desa</h3>
          <p className="text-xs text-emerald-100 max-w-xl leading-relaxed">
            Kelola rumusan Visi & Misi Kepala Desa dan hierarki pengawasan keuangan APBDes (Kades dan Bendahara) yang terhubung langsung ke Landing Page.
          </p>
        </div>
        <button
          onClick={() => onNavigate && onNavigate('struktur_pemerintahan')}
          className="px-5 py-2.5 rounded-2xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition shadow-sm shrink-0 cursor-pointer self-start sm:self-auto"
        >
          Kelola Struktur & Visi Misi
        </button>
      </div>

      {/* 4 Kartu Metrik Strategis Kades (2x2 Grid di Mobile, 4-Col di Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 sm:space-y-3">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 truncate">Pagu APBDes 2026</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <DollarSign size={16} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900">Rp 1,11 Miliar</div>
            <div className="text-[11px] sm:text-xs font-semibold text-emerald-700 mt-0.5 truncate">Serapan Belanja: 92.5%</div>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">PKPKD Berjalan Lancar</div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 sm:space-y-3">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 truncate">Antrean Surat</span>
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 ${
              pendingKadesSurats.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}>
              <FileCheck2 size={16} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900">{pendingKadesSurats.length} Surat</div>
            <div className={`text-[11px] sm:text-xs font-semibold mt-0.5 truncate ${
              pendingKadesSurats.length > 0 ? 'text-amber-800 font-bold' : 'text-slate-500'
            }`}>
              {pendingKadesSurats.length > 0 ? 'Perlu Otorisasi Kades' : 'Semua Berkas Tuntas'}
            </div>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">{completedSurats.length} Surat sah terbit</div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 sm:space-y-3">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 truncate">Tinjau Pengumuman</span>
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 ${
              pendingPengumumans.length > 0 ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
            }`}>
              <Megaphone size={16} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900">{pendingPengumumans.length} Draf</div>
            <div className={`text-[11px] sm:text-xs font-semibold mt-0.5 truncate ${
              pendingPengumumans.length > 0 ? 'text-purple-800 font-bold' : 'text-slate-500'
            }`}>
              {pendingPengumumans.length > 0 ? 'Menunggu Publikasi' : 'Tidak Ada Draf'}
            </div>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">{publishedPengumumans.length} Pengumuman aktif</div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5 sm:space-y-3">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 truncate">Kebijakan SK Kades</span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black text-slate-900">{daftarSk.length} Ketetapan</div>
            <div className="text-[11px] sm:text-xs font-semibold text-indigo-700 mt-0.5 truncate">Semua Berlaku Sah</div>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 truncate">Landasan Hukum Pemdes</div>
        </div>
      </div>

      {/* Visual Analytics & Diagram Pimpinan Eksekutif Desa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagram 1: Sebaran Alur Pelayanan Persuratan Desa */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileCheck2 size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Efisiensi & Alur Pelayanan Surat</h3>
                <p className="text-[11px] text-slate-500">Statistik real-time pengajuan surat warga</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 font-mono">
              {surats.length} Total Surat
            </span>
          </div>

          {/* Multi-segment Progress Bar */}
          {(() => {
            const total = Math.max(surats.length, 1);
            const nSah = completedSurats.length;
            const nKades = pendingKadesSurats.length;
            const nRt = surats.filter(s => s.status === 'pending_rt').length;
            const nTolak = surats.filter(s => s.status === 'rejected' || s.status === 'rejected_kades' || s.status === 'rejected_rt').length;

            const pSah = Math.round((nSah / total) * 100);
            const pKades = Math.round((nKades / total) * 100);
            const pRt = Math.round((nRt / total) * 100);
            const pTolak = Math.max(0, 100 - (pSah + pKades + pRt));

            return (
              <div className="space-y-4">
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                  <div style={{ width: `${pSah}%` }} className="bg-emerald-600 transition-all duration-700" title={`Sah & Terbit: ${pSah}%`} />
                  <div style={{ width: `${pKades}%` }} className="bg-amber-500 transition-all duration-700" title={`Menunggu Kades: ${pKades}%`} />
                  <div style={{ width: `${pRt}%` }} className="bg-blue-400 transition-all duration-700" title={`Menunggu RT: ${pRt}%`} />
                  <div style={{ width: `${pTolak}%` }} className="bg-rose-500 transition-all duration-700" title={`Ditolak: ${pTolak}%`} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-semibold">
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-800 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>Selesai & Sah</span>
                    </div>
                    <div className="text-lg font-black text-emerald-950 mt-1 font-mono">{nSah} <span className="text-[10px] font-normal text-emerald-700">({pSah}%)</span></div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-amber-800 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Antrean Kades</span>
                    </div>
                    <div className="text-lg font-black text-amber-950 mt-1 font-mono">{nKades} <span className="text-[10px] font-normal text-amber-700">({pKades}%)</span></div>
                  </div>

                  <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-blue-800 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      <span>Menunggu RT</span>
                    </div>
                    <div className="text-lg font-black text-blue-950 mt-1 font-mono">{nRt} <span className="text-[10px] font-normal text-blue-700">({pRt}%)</span></div>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 text-rose-800 text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Ditolak / Revisi</span>
                    </div>
                    <div className="text-lg font-black text-rose-950 mt-1 font-mono">{nTolak} <span className="text-[10px] font-normal text-rose-700">({pTolak}%)</span></div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Diagram 2: Matriks 5 Bidang Belanja APBDes 2026 */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <DollarSign size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Serapan Belanja APBDes 5 Bidang</h3>
                <p className="text-[11px] text-slate-500">Kinerja realisasi anggaran tahun berjalan</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-teal-100 text-teal-800">
              Total Realisasi 92.5%
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { bidang: '1. Penyelenggaraan Pemerintahan', pagu: 'Rp 320 Jt', real: 'Rp 294.4 Jt', pct: 92, color: 'bg-emerald-600' },
              { bidang: '2. Pelaksanaan Pembangunan', pagu: 'Rp 450 Jt', real: 'Rp 396.0 Jt', pct: 88, color: 'bg-teal-600' },
              { bidang: '3. Pembinaan Kemasyarakatan', pagu: 'Rp 95 Jt', real: 'Rp 71.2 Jt', pct: 75, color: 'bg-sky-600' },
              { bidang: '4. Pemberdayaan Masyarakat', pagu: 'Rp 180 Jt', real: 'Rp 147.6 Jt', pct: 82, color: 'bg-indigo-600' },
              { bidang: '5. Penanggulangan Darurat & Bencana', pagu: 'Rp 65 Jt', real: 'Rp 65.0 Jt', pct: 100, color: 'bg-amber-600' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-800 text-[11px] truncate max-w-[200px] sm:max-w-none">{item.bidang}</span>
                  <span className="font-mono text-slate-600 text-[11px]">{item.real} / {item.pagu} ({item.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid 2 Kolom: Program Strategis & Kebijakan Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Realisasi Kebijakan & Agenda Prioritas Kades (8 Kolom) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Card Antrean Surat Mendesak jika ada */}
          {pendingKadesSurats.length > 0 && (
            <div className="card-surface p-5 sm:p-6 rounded-3xl border-2 border-amber-300 bg-amber-50/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider">Antrean Otorisasi Mendesak</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">Surat Menunggu Tanda Tangan Digital Anda</h3>
                </div>
                <button
                  onClick={() => setSuratTab('pending')}
                  className="text-xs font-black text-amber-900 hover:underline"
                >
                  Lihat Semua ({pendingKadesSurats.length})
                </button>
              </div>

              <div className="space-y-2">
                {pendingKadesSurats.slice(0, 3).map((s) => (
                  <div key={s.id} className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-800">{s.nomor_resi}</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {s.surat_type?.nama_surat}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 mt-1">{s.warga_profile?.nama_lengkap} (NIK: {s.warga_profile?.nik})</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Keperluan: {s.keperluan}</div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSuratForReject(s);
                          setRejectReason('');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Tolak
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSuratForApprove(s);
                          setNomorSuratInput(s.nomor_surat_resmi || '');
                          setApproveCatatan('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck size={13} />
                        <span>Setujui & Sahkan</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card-surface p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Program Kerja Prioritas Desa 2026</h3>
                <p className="text-xs text-slate-500">Realisasi program fisik & pemberdayaan masyarakat desa</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                100% On-Track
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">1. Rabat Beton Jalan Usaha Tani Lingkungan Krajan</span>
                  <span className="text-emerald-700 font-mono">100% Selesai</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full w-full rounded-full" />
                </div>
                <div className="text-[11px] text-slate-500">Pagu: Rp 45.000.000 (Dana Desa Tahap I) • Skema Padat Karya Tunai</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">2. Normalisasi & Pembangunan Drainase RW 01</span>
                  <span className="text-teal-700 font-mono">85% Berjalan</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full w-[85%] rounded-full" />
                </div>
                <div className="text-[11px] text-slate-500">Pagu: Rp 35.000.000 • Mencegah genangan air musim hujan</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-900">3. Digitalisasi Pelayanan Surat Mandiri (SiDesKu Pro)</span>
                  <span className="text-sky-700 font-mono">100% Terimplementasi</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-600 h-full w-full rounded-full" />
                </div>
                <div className="text-[11px] text-slate-500">Alur Sah: RT Verifikasi Identitas ke Langsung Kades Sahkan TTD QR (Bypass RW & Sekdes)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Pintasan Otorisasi Kades (4 Kolom) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="card-surface p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Pintasan Kepemimpinan</h3>
            <div className="space-y-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) onNavigate('persetujuan_surat');
                  else setSuratTab('pending');
                }}
                className="w-full p-3 sm:p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200/80 hover:border-emerald-300 transition-all text-left flex items-center justify-between cursor-pointer active:scale-[0.98] select-none"
              >
                <span>Persetujuan Surat ({pendingKadesSurats.length})</span>
                <ChevronRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigate) onNavigate('pengumuman');
                  else window.location.href = '/dashboard?tab=persetujuan-pengumuman';
                }}
                className="w-full p-3 sm:p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50 text-slate-800 hover:text-purple-900 border border-slate-200/80 hover:border-purple-300 transition-all text-left flex items-center justify-between cursor-pointer active:scale-[0.98] select-none"
              >
                <span>Tinjau Pengumuman ({pendingPengumumans.length})</span>
                <ChevronRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => setShowAddSkModal(true)}
                className="w-full p-3 sm:p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200/80 hover:border-emerald-300 transition-all text-left flex items-center justify-between cursor-pointer active:scale-[0.98] select-none"
              >
                <span>Terbitkan SK Kades Baru</span>
                <ChevronRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigate) onNavigate('pengawasan_apbdes');
                  else window.location.href = '/dashboard?tab=pengawasan-apbdes';
                }}
                className="w-full p-3 sm:p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50 text-slate-800 hover:text-teal-900 border border-slate-200/80 hover:border-teal-300 transition-all text-left flex items-center justify-between cursor-pointer active:scale-[0.98] select-none"
              >
                <span>Audit & Serapan APBDes</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal-modal global */}
      {renderAllModals()}
    </div>
  );
};
