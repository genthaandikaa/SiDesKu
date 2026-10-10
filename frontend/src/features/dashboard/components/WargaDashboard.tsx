import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  QrCode, 
  Send, 
  Printer, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertCircle, 
  FileCheck2, 
  Download, 
  Search, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  CreditCard, 
  HeartHandshake, 
  Users, 
  Briefcase, 
  Layers, 
  FileSpreadsheet, 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Eye, 
  Paperclip, 
  X, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw,
  Edit3,
  Loader2,
  Copy,
  Info,
  FolderCheck
} from 'lucide-react';
import api from '@/shared/lib/axios';
import { useAuth } from '@/shared/context/AuthContext';
import { SuratRequest, SuratType, BantuanPenerima } from '@/shared/types';
import { CetakSuratModal } from './CetakSuratModal';
import { SuratTrackingModal } from './SuratTrackingModal';
import { CameraUploadModal } from '@/shared/components/CameraUploadModal';
import { BerkasKependudukanView } from './BerkasKependudukanView';
import {
  DonutGauge,
  AreaSplineChart,
  BarActivityChart,
  MiniCalendarWidget,
  MetricStatCard,
} from '@/shared/components/charts';

export interface FormLampiranItem {
  id: string;
  url: string;
  nama: string;
  tipe?: string;
}

export const parseLampiranDokumen = (val?: string | any[] | null): Array<{ url: string; nama: string }> => {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((item, idx) => 
      typeof item === 'string' 
        ? { url: item, nama: `Dokumen ${idx + 1}` } 
        : { url: item.url || item.file || '', nama: item.nama || `Dokumen ${idx + 1}` }
    ).filter(d => !!d.url);
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item, idx) => 
            typeof item === 'string' 
              ? { url: item, nama: `Dokumen ${idx + 1}` } 
              : { url: item.url || item.file || '', nama: item.nama || `Dokumen ${idx + 1}` }
          ).filter(d => !!d.url);
        }
        if (parsed && typeof parsed === 'object') {
          return [{ url: parsed.url || parsed.file || '', nama: parsed.nama || 'Dokumen Lampiran' }];
        }
      } catch {
        // fallback
      }
    }
    return [{ url: val, nama: 'Dokumen Lampiran' }];
  }
  return [];
};

interface WargaDashboardProps {
  activeSubmenu?: string;
  onNavigate?: (submenu: string) => void;
}

// Complete Official Catalog of Village Letters
const defaultSuratTypes: SuratType[] = [
  {
    id: 1,
    kode_surat: 'SKTP',
    nama_surat: 'Surat Pembuatan / E-KTP',
    format_nomor: '471/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto Kartu Keluarga (KK)', 'Surat Pengantar RT/RW', 'KTP Lama (bila rusak/ganti)'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 2,
    kode_surat: 'SKKK',
    nama_surat: 'Surat Kartu Keluarga (KK Baru / Perubahan)',
    format_nomor: '472/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KK Asli Lama', 'Buku Nikah / Akta Cerai', 'Surat Keterangan Lahir / Pindah'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 3,
    kode_surat: 'SKTM',
    nama_surat: 'Surat Keterangan Tidak Mampu (SKTM)',
    format_nomor: '401/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto KTP Pemohon', 'Foto Kartu Keluarga', 'Surat Pengantar RT'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 4,
    kode_surat: 'SKD',
    nama_surat: 'Surat Keterangan Domisili Warga / Lembaga',
    format_nomor: '470/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto KTP', 'Foto KK'],
    masa_berlaku_hari: 90,
    is_active: true,
  },
  {
    id: 5,
    kode_surat: 'SKU',
    nama_surat: 'Surat Keterangan Usaha (SKU)',
    format_nomor: '503/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto KTP', 'Foto KK', 'Foto Tempat/Aktivitas Usaha'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 6,
    kode_surat: 'SKCK',
    nama_surat: 'Surat Pengantar SKCK (Catatan Kepolisian)',
    format_nomor: '300/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Foto KTP', 'Foto KK', 'Pas Foto 4x6'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 7,
    kode_surat: 'SKL',
    nama_surat: 'Surat Kelahiran / Akta Lahir',
    format_nomor: '474.1/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Surat Keterangan Lahir Bidan/RS', 'KTP Ayah & Ibu', 'Buku Nikah Asli', 'KK Asli'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 8,
    kode_surat: 'SKM',
    nama_surat: 'Surat Kematian',
    format_nomor: '474.3/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Surat Kematian RS / Saksi RT', 'KTP & KK Almarhum', 'KTP Pelapor'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 9,
    kode_surat: 'SKBM',
    nama_surat: 'Surat Belum Pernah Menikah (N1-N4)',
    format_nomor: '474.2/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP Pemohon', 'KK Asli', 'Pernyataan Belum Menikah Bermaterai'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 10,
    kode_surat: 'SKP',
    nama_surat: 'Surat Pindah Domisili (SKPWNI)',
    format_nomor: '475/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP & KK Asli', 'Alamat Tujuan Lengkap', 'Surat Bebas Tanggungan RT'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 11,
    kode_surat: 'SKBN',
    nama_surat: 'Surat Beda Nama (Ijazah / KTP / KK)',
    format_nomor: '470/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP & KK Asli', 'Dokumen/Ijazah Beda Nama', 'Surat Pengantar RT'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 12,
    kode_surat: 'SKPH',
    nama_surat: 'Surat Penghasilan Orang Tua / Wali',
    format_nomor: '401/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP Orang Tua', 'KK Asli', 'Rincian Penghasilan / Slip Usaha'],
    masa_berlaku_hari: 30,
    is_active: true,
  },
  {
    id: 13,
    kode_surat: 'SKAW',
    nama_surat: 'Surat Keterangan Ahli Waris',
    format_nomor: '470/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['Surat Kematian Almarhum', 'Buku Nikah / Akta Cerai', 'KTP & KK Ahli Waris'],
    masa_berlaku_hari: 60,
    is_active: true,
  },
  {
    id: 14,
    kode_surat: 'SKIK',
    nama_surat: 'Surat Izin Keramaian / Hajatan ',
    format_nomor: '300/{NO}/418.66.04/{TAHUN}',
    persyaratan_json: ['KTP Tuan Rumah', 'Surat Persetujuan Tetangga Sekitar', 'Rekomendasi RT/RW'],
    masa_berlaku_hari: 14,
    is_active: true,
  },
];

interface ActionToast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export const WargaDashboard: React.FC<WargaDashboardProps> = ({ activeSubmenu = 'beranda', onNavigate }) => {
  const { user } = useAuth();
  const [surats, setSurats] = useState<SuratRequest[]>([]);
  const [types, setTypes] = useState<SuratType[]>(defaultSuratTypes);
  const [bansos, setBansos] = useState<BantuanPenerima[]>([]);
  const [kasSummary, setKasSummary] = useState<any>(null);
  const [desa, setDesa] = useState<any>(null);
  const [masterDokumen, setMasterDokumen] = useState<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Detect route parameter /dashboard/ajukan/:id and query ?editSuratId=
  const ajukanMatch = location.pathname.match(/\/dashboard\/ajukan\/(\d+)/);
  const routeSuratTypeId = ajukanMatch ? Number(ajukanMatch[1]) : null;
  const editSuratIdParam = searchParams.get('editSuratId');
  const editingSurat = editSuratIdParam ? surats.find(s => s.id === Number(editSuratIdParam)) : null;

  // Pagination for catalog cards (6 per page)
  const [catalogPage, setCatalogPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  // Replacing Photo & Delete confirmation state
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [suratToDelete, setSuratToDelete] = useState<SuratRequest | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Floating Action Toast Notification
  const [actionToast, setActionToast] = useState<ActionToast | null>(null);
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setActionToast({ id: String(Date.now()), type, title, message });
  };

  useEffect(() => {
    if (actionToast) {
      const timer = setTimeout(() => {
        setActionToast(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [actionToast]);

  // Search and category filters for Ajukan Surat
  const [suratSearch, setSuratSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Semua' | 'Kependudukan' | 'Sosial' | 'Keluarga' | 'Usaha' | 'Hukum'>('Semua');
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'semua' | 'selesai' | 'proses' | 'ditolak'>('semua');

  // Form State for Ajukan Surat
  const [selectedTypeId, setSelectedTypeId] = useState<number>(1);
  const [keperluan, setKeperluan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitSuccessModal, setSubmitSuccessModal] = useState<{
    isEdit: boolean;
    surat: SuratRequest | null;
  } | null>(null);
  const [copiedResi, setCopiedResi] = useState(false);

  // Camera & Multi-Document Attachment State
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraModalTitle, setCameraModalTitle] = useState('Ambil Foto Dokumen / KTP');
  const [cameraModalInitialMode, setCameraModalInitialMode] = useState<'camera' | 'upload'>('camera');
  const [lampiranCategory, setLampiranCategory] = useState<string>('Foto KTP');
  const [lampiranList, setLampiranList] = useState<FormLampiranItem[]>([]);
  const [previewGallery, setPreviewGallery] = useState<Array<{ url: string; nama: string }>>([]);
  const [galleryIndex, setGalleryIndex] = useState<number>(0);

  // Lock body scroll and handle ESC key for delete confirm and preview gallery
  useEffect(() => {
    if (isDeleteConfirmOpen || previewGallery.length > 0) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsDeleteConfirmOpen(false);
          setSuratToDelete(null);
          setPreviewGallery([]);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isDeleteConfirmOpen, previewGallery.length]);

  // Reset catalog pagination on search or category filter change
  useEffect(() => {
    setCatalogPage(1);
  }, [suratSearch, selectedCategory]);

  // Pre-fill form on edit mode or route type change
  useEffect(() => {
    if (editingSurat) {
      setSelectedTypeId(editingSurat.surat_type_id);
      setKeperluan(editingSurat.keperluan || '');
      const docs = parseLampiranDokumen(editingSurat.file_lampiran);
      setLampiranList(docs.map((d, i) => ({
        id: `existing-${i}-${Date.now()}`,
        url: d.url,
        nama: d.nama,
      })));
      setSubmitSuccess(false);
    } else if (routeSuratTypeId) {
      setSelectedTypeId(routeSuratTypeId);
      setKeperluan('');
      setLampiranList([]);
      setSubmitSuccess(false);
    }
  }, [routeSuratTypeId, editingSurat]);

  // Print Letter & Tracking Detail Modals
  const [printSurat, setPrintSurat] = useState<SuratRequest | null>(null);
  const [selectedTrackingSurat, setSelectedTrackingSurat] = useState<SuratRequest | null>(null);

  // New Aduan State
  const [aduanJudul, setAduanJudul] = useState('');
  const [aduanKategori, setAduanKategori] = useState('Infrastruktur');
  const [aduanDeskripsi, setAduanDeskripsi] = useState('');

  // Active sub tab on Beranda
  const [berandaTab, setBerandaTab] = useState<'surat_aktif' | 'bansos' | 'kas' | 'aduan'>('surat_aktif');

  useEffect(() => {
    fetchWargaData();
  }, []);

  const fetchWargaData = async () => {
    try {
      const [suratRes, typesRes, bansosRes, kasRes, desaRes, dokRes] = await Promise.all([
        api.get('/surats'),
        api.get('/surat-types'),
        api.get('/bansos'),
        api.get('/kas-rt'),
        api.get('/settings/desa'),
        api.get('/warga/dokumen').catch(() => ({ data: { success: false } })),
      ]);

      if (suratRes.data?.success && suratRes.data.data) setSurats(suratRes.data.data);
      if (typesRes.data?.success && typesRes.data.data?.length > 0) {
        setTypes(typesRes.data.data);
      }
      if (bansosRes.data?.success && bansosRes.data.data) setBansos(bansosRes.data.data);
      if (kasRes.data?.success) setKasSummary(kasRes.data);
      if (desaRes.data?.success && desaRes.data.data) setDesa(desaRes.data.data);
      if (dokRes.data?.success && dokRes.data.data) setMasterDokumen(dokRes.data.data);
    } catch {
      //
    }
  };

  const handleCreateOrUpdateSurat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double click / spamming

    const typeId = routeSuratTypeId || selectedTypeId;
    if (!typeId || !keperluan.trim()) {
      showToast('error', 'Formulir Belum Lengkap', 'Mohon pilih jenis surat dan isi keperluan pengajuan dengan jelas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payloadLampiran = lampiranList.length > 0
        ? lampiranList.map(item => ({ url: item.url, nama: item.nama }))
        : null;

      if (editingSurat) {
        const res = await api.put(`/surats/${editingSurat.id}`, {
          surat_type_id: typeId,
          keperluan: keperluan.trim(),
          file_lampiran: payloadLampiran,
        });
        if (res.data && res.data.success) {
          setSubmitSuccess(true);
          setSubmitSuccessModal({
            isEdit: true,
            surat: res.data.data || editingSurat,
          });
          await fetchWargaData();
          showToast(
            'success',
            'Perubahan Berhasil Disimpan',
            `Data pengajuan ${res.data.data?.nomor_resi || editingSurat.nomor_resi} berhasil diperbarui.`
          );
        } else {
          showToast('error', 'Gagal Memperbarui Surat', res.data?.message || 'Respons server tidak valid.');
        }
      } else {
        const res = await api.post('/surats', {
          surat_type_id: typeId,
          keperluan: keperluan.trim(),
          file_lampiran: payloadLampiran,
        });
        if (res.data && res.data.success) {
          setSubmitSuccess(true);
          setSubmitSuccessModal({
            isEdit: false,
            surat: res.data.data,
          });
          setKeperluan('');
          setLampiranList([]);
          await fetchWargaData();
          showToast(
            'success',
            'Permohonan Berhasil Dikirim',
            `Surat permohonan (${res.data.data?.nomor_resi || ''}) berhasil diajukan dan masuk antrean RT.`
          );
        } else {
          showToast('error', 'Gagal Mengirim Permohonan', res.data?.message || 'Respons server tidak valid.');
        }
      }
    } catch (err: any) {
      showToast(
        'error',
        'Gagal Memproses Surat',
        err.response?.data?.message || 'Terjadi kesalahan sistem saat memproses permohonan surat.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSurat = async () => {
    if (!suratToDelete || isDeleting) return;
    setIsDeleting(true);
    const targetNama = suratToDelete.surat_type?.nama_surat || 'Surat Permohonan';
    const targetResi = suratToDelete.nomor_resi;
    try {
      const res = await api.delete(`/surats/${suratToDelete.id}`);
      if (res.data?.success) {
        setIsDeleteConfirmOpen(false);
        setSuratToDelete(null);
        await fetchWargaData();
        showToast(
          'success',
          'Permohonan Berhasil Dibatalkan',
          `Pengajuan "${targetNama}" (${targetResi}) telah berhasil dihapus dari antrean verifikasi.`
        );
      } else {
        showToast('error', 'Gagal Membatalkan Permohonan', res.data?.message || 'Gagal membatalkan permohonan surat.');
      }
    } catch (err: any) {
      showToast(
        'error',
        'Gagal Membatalkan Permohonan',
        err.response?.data?.message || 'Terjadi kesalahan sistem saat membatalkan permohonan.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const p = user?.warga_profile;

  // Filter letter types by search and category
  const filteredTypes = types.filter((t) => {
    const matchSearch = t.nama_surat.toLowerCase().includes(suratSearch.toLowerCase()) ||
                        t.kode_surat.toLowerCase().includes(suratSearch.toLowerCase()) ||
                        (t.persyaratan_json && t.persyaratan_json.some(p => p.toLowerCase().includes(suratSearch.toLowerCase())));

    if (!matchSearch) return false;

    if (selectedCategory === 'Semua') return true;
    if (selectedCategory === 'Kependudukan') return ['SKTP', 'SKKK', 'SKD', 'SKP', 'SKBN'].includes(t.kode_surat);
    if (selectedCategory === 'Sosial') return ['SKTM', 'SKPH'].includes(t.kode_surat);
    if (selectedCategory === 'Keluarga') return ['SKL', 'SKM', 'SKBM', 'SKAW'].includes(t.kode_surat);
    if (selectedCategory === 'Usaha') return ['SKU'].includes(t.kode_surat);
    if (selectedCategory === 'Hukum') return ['SKCK', 'SKIK'].includes(t.kode_surat);
    return true;
  });

  // Filtered lists
  const pendingSurats = surats.filter(s => ['pending_rt', 'approved_rt', 'pending_rw', 'processed_sekdes'].includes(s.status));
  const completedSurats = surats.filter(s => s.status === 'completed');
  const searchedHistory = surats.filter(s => {
    const matchKeyword = s.nomor_resi.toLowerCase().includes(historySearch.toLowerCase()) ||
      s.surat_type?.nama_surat.toLowerCase().includes(historySearch.toLowerCase()) ||
      s.keperluan.toLowerCase().includes(historySearch.toLowerCase());
    
    if (!matchKeyword) return false;

    if (historyStatusFilter === 'selesai') return s.status === 'completed';
    if (historyStatusFilter === 'proses') return ['pending_rt', 'approved_rt', 'pending_rw', 'processed_sekdes'].includes(s.status);
    if (historyStatusFilter === 'ditolak') return s.status === 'rejected';
    return true;
  });

  // Submenu router renderer
  const renderSubmenuContent = () => {
    // Berkas Kependudukan (Master Berkas Sekali Upload)
    if (activeSubmenu === 'berkas_kependudukan' || activeSubmenu === 'berkas') {
      return (
        <BerkasKependudukanView
          onApplySurat={() => {
            if (onNavigate) {
              onNavigate('ajukan_surat');
            } else {
              navigate('/dashboard/ajukan');
            }
          }}
        />
      );
    }

    // Form & Katalog Pengajuan Surat
    if (activeSubmenu === 'ajukan_surat') {
      const isFormMode = Boolean(routeSuratTypeId || editingSurat);
      const currentType = types.find(t => t.id === (editingSurat ? editingSurat.surat_type_id : (routeSuratTypeId || selectedTypeId))) || types[0];

      if (isFormMode) {
        return (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in font-sans">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (editingSurat) {
                    navigate('/dashboard/status-surat');
                  } else {
                    navigate('/dashboard/ajukan');
                  }
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-2xs press-down"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Kembali ke {editingSurat ? 'Status Surat' : 'Katalog Surat'}</span>
              </button>

              <span className="text-[11px] font-mono text-slate-400">
                Layanan Surat Online Desa Doko
              </span>
            </div>

            {/* Edit Mode Alert Banner */}
            {editingSurat && (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 text-amber-900 flex items-start gap-3.5 shadow-2xs">
                <div className="w-9 h-9 rounded-2xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <div className="font-black text-sm text-amber-950">
                    Mode Edit Pengajuan (No. Resi: {editingSurat.nomor_resi})
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    Data lama Anda telah otomatis terisi pada formulir ini. Silakan perbaiki data yang salah atau ubah/hapus foto dokumen yang kurang jernih, lalu klik <strong>Simpan Perubahan Surat</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Success Banner */}
            {submitSuccess && (
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 animate-scale-up shadow-xs">
                <div className="flex items-center gap-2 font-black text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{editingSurat ? 'Perubahan Pengajuan Berhasil Disimpan!' : 'Pengajuan Surat Berhasil Dikirim!'}</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  {editingSurat 
                    ? 'Data permohonan surat Anda telah berhasil diperbarui dan dialirkan ke antrean verifikasi Ketua RT 01.'
                    : 'Permohonan surat Anda telah otomatis masuk ke antrean verifikasi Ketua RT 01. Anda dapat memantau progresnya di menu Status Surat.'}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/status-surat')}
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-xs hover:bg-emerald-800 cursor-pointer"
                  >
                    Pantau di Status Surat ➔
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitSuccess(false);
                      navigate('/dashboard/ajukan');
                    }}
                    className="px-4 py-2 rounded-xl bg-white text-emerald-900 border border-emerald-300 font-bold text-xs shadow-2xs hover:bg-emerald-50 cursor-pointer"
                  >
                    Ajukan Surat Lain
                  </button>
                </div>
              </div>
            )}

            {/* Surat Type Header Info */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-black">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {currentType.kode_surat}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Masa Berlaku: {currentType.masa_berlaku_hari} Hari</span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                      {currentType.nama_surat}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Requirements summary checklist */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="font-black text-slate-700 flex items-center gap-1.5">
                  <span>Persyaratan Berkas Resmi:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentType.persyaratan_json && currentType.persyaratan_json.length > 0 ? (
                    currentType.persyaratan_json.map((syarat, sIdx) => (
                      <span key={sIdx} className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{syarat}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500">KTP & Kartu Keluarga</span>
                  )}
                </div>
              </div>

              {/* Submission Form */}
              <form onSubmit={handleCreateOrUpdateSurat} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Pemohon (Sesuai Akun Anda):</label>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
                    <div className="font-black text-slate-900">{p?.nama_lengkap || user?.name}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">NIK: {p?.nik || '3506041505840001'}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Keperluan / Keterangan Pengajuan:</label>
                  <textarea
                    required
                    rows={4}
                    value={keperluan}
                    onChange={(e) => setKeperluan(e.target.value)}
                    placeholder="Contoh: Persyaratan pembuatan KTP baru karena rusak/hilang di Kantor Kecamatan Ngasem..."
                    className="w-full p-3.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs"
                  />
                </div>

                {/* Master Dokumen Kependudukan Auto-Attach Banner */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                        <FolderCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-emerald-950">
                            Master Berkas Otomatis dari Database Desa
                          </h4>
                          <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                            Auto-Attach
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5">
                          Dokumen identitas pokok (KTP & KK) otomatis dilampirkan dari arsip desa Anda tanpa perlu upload berulang kali.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate('berkas_kependudukan');
                        } else {
                          navigate('/dashboard/berkas');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100/70 border border-emerald-300 text-[11px] font-extrabold text-emerald-800 transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
                    >
                      <span>Kelola Master Berkas</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Chips Status Master Dokumen */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-200/60">
                    {(() => {
                      const hasKtp = Boolean(masterDokumen?.stats?.has_ktp ?? masterDokumen?.dokumen?.foto_ktp);
                      const hasKk = Boolean(masterDokumen?.stats?.has_kk ?? masterDokumen?.dokumen?.foto_kk);
                      const hasAkta = Boolean(masterDokumen?.stats?.has_akta ?? masterDokumen?.dokumen?.foto_akta_lahir);
                      const hasNikah = Boolean(masterDokumen?.stats?.has_nikah ?? masterDokumen?.dokumen?.foto_buku_nikah);

                      return (
                        <>
                          <div className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 ${
                            hasKtp 
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                              : 'bg-amber-50 text-amber-900 border border-amber-300'
                          }`}>
                            {hasKtp ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>KTP Terlampir Otomatis (Master)</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>KTP Belum Tersimpan di Master Desa</span>
                              </>
                            )}
                          </div>

                          <div className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 ${
                            hasKk 
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                              : 'bg-amber-50 text-amber-900 border border-amber-300'
                          }`}>
                            {hasKk ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>KK Terlampir Otomatis (Master)</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                <span>KK Belum Tersimpan di Master Desa</span>
                              </>
                            )}
                          </div>

                          {hasAkta && (
                            <div className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Akta Lahir Terlampir (Master)</span>
                            </div>
                          )}

                          {hasNikah && (
                            <div className="px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Buku Nikah Terlampir (Master)</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Mobile-Friendly Lampiran Dokumen Section */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Lampiran Tambahan / Dokumen Khusus (Opsional):</span>
                    </label>
                    <span className="text-[10px] text-slate-600 font-extrabold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      Hanya jika diperlukan
                    </span>
                  </div>

                  {/* Category Pill Selector */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Pilih Kategori Dokumen yang Mau Ditambahkan:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Foto KTP',
                        'Kartu Keluarga (KK)',
                        'Akta / Surat Nikah',
                        'Surat Pengantar RT',
                        'Foto Usaha / Lokasi',
                        'Berkas Pendukung',
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setLampiranCategory(cat)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                            lampiranCategory === cat
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Compact List of Attached Documents (Mobile Friendly) */}
                  {lampiranList.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-black text-slate-700">
                        <span>Dokumen Terlampir ({lampiranList.length}):</span>
                        <span className="text-[10px] text-emerald-700 font-medium">Klik foto untuk perbesar pratinjau</span>
                      </div>

                      <div className="space-y-2">
                        {lampiranList.map((item, idx) => (
                          <div
                            key={item.id}
                            className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-emerald-300 flex items-center justify-between gap-3 transition-all animate-scale-up"
                          >
                            {/* Thumbnail & Label */}
                            <div
                              onClick={() => {
                                setPreviewGallery(lampiranList.map(l => ({ url: l.url, nama: l.nama })));
                                setGalleryIndex(idx);
                              }}
                              className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
                              title="Klik untuk melihat foto layar penuh"
                            >
                              <div className="relative w-11 h-11 rounded-xl bg-slate-900 overflow-hidden shrink-0 border border-slate-200 shadow-2xs group-hover:ring-2 group-hover:ring-emerald-500 transition-all">
                                <img
                                  src={item.url}
                                  alt={item.nama}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                />
                                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Eye className="w-4 h-4 text-white drop-shadow" />
                                </div>
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-black text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                                  {item.nama}
                                </div>
                                <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  <span>Klik foto untuk preview</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons: Ubah Foto & Hapus Foto */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplacingPhotoId(item.id);
                                  setCameraModalTitle(`Ganti Foto ${item.nama}`);
                                  setCameraModalInitialMode('upload');
                                  setIsCameraModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px] transition-all flex items-center gap-1 shadow-2xs cursor-pointer press-down"
                                title="Ganti foto bila buram atau salah pilih"
                              >
                                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                                <span className="hidden sm:inline">Ubah Foto</span>
                                <span className="sm:hidden">Ubah</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setLampiranList(prev => prev.filter(l => l.id !== item.id));
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[11px] transition-all flex items-center gap-1 shadow-2xs cursor-pointer press-down"
                                title="Hapus foto ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Hapus</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trigger Buttons: Kamera HP or File Upload */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingPhotoId(null);
                        setCameraModalTitle(`Ambil ${lampiranCategory}`);
                        setCameraModalInitialMode('camera');
                        setIsCameraModalOpen(true);
                      }}
                      className="p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-300 text-emerald-900 transition-all flex flex-col items-center justify-center gap-1 text-center cursor-pointer shadow-2xs group press-down"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black">
                          {lampiranList.length > 0 ? '+ Foto Kamera' : 'Buka Kamera HP'}
                        </div>
                        <div className="text-[10px] text-emerald-700">Jepret foto langsung</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setReplacingPhotoId(null);
                        setCameraModalTitle(`Unggah ${lampiranCategory}`);
                        setCameraModalInitialMode('upload');
                        setIsCameraModalOpen(true);
                      }}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition-all flex flex-col items-center justify-center gap-1 text-center cursor-pointer shadow-2xs group press-down"
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black">
                          {lampiranList.length > 0 ? '+ Unggah Berkas' : 'Unggah dari Berkas'}
                        </div>
                        <div className="text-[10px] text-slate-500">Galeri foto / file</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-[11px] text-emerald-900 space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Jaminan Surat Sah & Bebas Biaya</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Surat diterbitkan dengan TTD elektronik & QR stempel sah resmi Pemdes Doko (Rp 0,-).
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  {editingSurat && (
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/status-surat')}
                      className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 py-3.5 px-4 rounded-2xl text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                      isSubmitting 
                        ? 'bg-emerald-800/80 cursor-not-allowed opacity-80' 
                        : 'bg-emerald-600 hover:bg-emerald-700 hover-glow cursor-pointer press-down'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{editingSurat ? 'Sedang Menyimpan Perubahan...' : 'Sedang Mengirim Permohonan...'}</span>
                      </>
                    ) : editingSurat ? (
                      'Simpan Perubahan Surat'
                    ) : (
                      'Kirim Permohonan Surat ➔'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      }

      // Catalog Full-Width View with Pagination
      const totalPages = Math.ceil(filteredTypes.length / ITEMS_PER_PAGE) || 1;
      const paginatedTypes = filteredTypes.slice((catalogPage - 1) * ITEMS_PER_PAGE, catalogPage * ITEMS_PER_PAGE);

      return (
        <div className="space-y-6 animate-fade-in font-sans">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Katalog Layanan Surat Digital
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Pilih jenis surat resmi yang Anda butuhkan (KTP, KK, SKTM, Domisili, SKU, Akta, dll) untuk pengurusan cepat online.
              </p>
            </div>
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari jenis surat: KTP, KK, SKTM..."
                value={suratSearch}
                onChange={(e) => setSuratSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-2xs"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: 'Semua', label: `Semua (${types.length})` },
              { id: 'Kependudukan', label: '🪪 KTP & KK' },
              { id: 'Sosial', label: '🤝 SKTM & Bansos' },
              { id: 'Keluarga', label: '💍 Nikah & Akta' },
              { id: 'Usaha', label: '🏪 Usaha (SKU)' },
              { id: 'Hukum', label: '👮 SKCK & Izin' },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer press-down ${
                  selectedCategory === c.id 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Cards Grid: 3 columns on desktop, full-width stretching down */}
          {paginatedTypes.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
              Tidak ada jenis surat yang cocok dengan kata kunci "{suratSearch}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedTypes.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs hover:border-emerald-400 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-2xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {t.kode_surat}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-sm text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                        {t.nama_surat}
                      </h3>
                      <div className="text-[11px] text-slate-500 mt-2 space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Syarat Berkas:</div>
                        <p className="line-clamp-2 text-slate-600 leading-relaxed">
                          {t.persyaratan_json?.join(' • ') || 'KTP & KK Asli'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Masa Berlaku:</span>
                      <span className="font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {t.masa_berlaku_hari} Hari
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/ajukan/${t.id}`)}
                      className="w-full py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-all shadow-xs press-down flex items-center justify-center gap-2 cursor-pointer group/btn"
                    >
                      <span>Pengajuan</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Desktop & Mobile Clean Pagination */}
          {totalPages > 1 && (
            <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 font-medium text-center sm:text-left">
                Menampilkan <span className="font-bold text-slate-800">{(catalogPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-bold text-slate-800">{Math.min(catalogPage * ITEMS_PER_PAGE, filteredTypes.length)}</span> dari <span className="font-bold text-slate-800">{filteredTypes.length}</span> jenis surat
              </div>

              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  disabled={catalogPage <= 1}
                  onClick={() => setCatalogPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCatalogPage(pageNum)}
                    className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      catalogPage === pageNum
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={catalogPage >= totalPages}
                  onClick={() => setCatalogPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

  // Status Surat Proses
  if (activeSubmenu === 'status_surat') {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pemantauan Status Surat yang Sedang Diproses
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Lacak tahapan persetujuan pengantar dari RT 01, RW 01, hingga penerbitan di Balai Desa beserta catatan petugas.
          </p>
        </div>

        {pendingSurats.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Tidak Ada Surat yang Sedang Berjalan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Semua surat yang pernah Anda ajukan telah selesai diproses atau belum ada pengajuan baru.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSurats.map((s) => (
              <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400">Resi: {s.nomor_resi}</div>
                    <h3 className="text-base font-black text-slate-900">{s.surat_type?.nama_surat}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Keperluan: {s.keperluan}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 self-start sm:self-auto">
                    {['processed_sekdes', 'approved_rt', 'pending_rw'].includes(s.status) ? 'Tahap 2: Verifikasi & Legalisasi Kepala Desa' :
                     'Tahap 1: Verifikasi Ketua RT 01'}
                  </span>
                </div>

                {/* Progress Steps Ribbon */}
                <div className="grid grid-cols-2 gap-3 text-center text-xs pt-1">
                  <div className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 ${
                    s.status !== 'pending_rt' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                  }`}>
                    <span>1. Verifikasi Ketua RT 01</span>
                    {s.status !== 'pending_rt' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </div>
                  <div className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 ${
                    s.status === 'completed' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                    ['processed_sekdes', 'approved_rt', 'pending_rw'].includes(s.status) ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <span>2. Legalisasi Kepala Desa / Sekdes</span>
                    {s.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                  </div>
                </div>

                {/* Live Tracking Actions & Notes Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="text-slate-600 font-medium">
                    {s.status === 'pending_rt' && '⏳ Berkas telah diajukan dan sedang menunggu verifikasi dari Ketua RT 01.'}
                    {['processed_sekdes', 'approved_rt', 'pending_rw'].includes(s.status) && '✅ Verifikasi RT 01 selesai. Saat ini berkas ada di meja Kepala Desa / Sekdes untuk penandatanganan QR sah.'}
                    {s.status === 'completed' && '🎉 Surat telah selesai diverifikasi & diterbitkan secara resmi oleh Kepala Desa!'}
                  </div>
                  <div className="flex items-center gap-2">
                    {parseLampiranDokumen(s.file_lampiran).length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const docs = parseLampiranDokumen(s.file_lampiran);
                          setPreviewGallery(docs);
                          setGalleryIndex(0);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Lihat Foto Lampiran Dokumen"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Foto Lampiran ({parseLampiranDokumen(s.file_lampiran).length})</span>
                      </button>
                    )}

                    {s.status === 'pending_rt' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            showToast(
                              'info',
                              'Mode Edit Pengajuan',
                              `Membuka formulir perbaikan data untuk ${s.surat_type?.nama_surat || 'surat'} (${s.nomor_resi}).`
                            );
                            navigate(`/dashboard/ajukan/${s.surat_type_id}?editSuratId=${s.id}`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs press-down"
                          title="Ubah data pengajuan atau perbaiki foto lampiran"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                          <span>Ubah Data</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSuratToDelete(s);
                            setIsDeleteConfirmOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs press-down"
                          title="Batalkan permohonan surat ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Batalkan</span>
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedTrackingSurat(s)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Lacak Alur & Catatan Petugas</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Surat Selesai & Dokumen Sah
  if (activeSubmenu === 'surat_selesai') {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Surat Selesai & Dokumen Sah
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar surat resmi yang telah terbit lengkap dengan tanda tangan elektronik dan stempel QR Code.
          </p>
        </div>

        {completedSurats.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold mx-auto">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Belum Ada Surat Selesai</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Surat yang sudah disahkan oleh Sekretaris Desa akan tampil di halaman ini dan dapat langsung diunduh PDF.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {completedSurats.map((s) => (
              <div key={s.id} className="bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                      RESMI TERBIT
                    </span>
                    <span className="text-xs font-mono text-slate-500">No. Surat: {s.nomor_surat_resmi || s.nomor_resi}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">{s.surat_type?.nama_surat}</h3>
                  <p className="text-xs text-slate-600">Keperluan: {s.keperluan}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTrackingSurat(s)}
                    className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all cursor-pointer"
                  >
                    Lihat Alur
                  </button>
                  <button
                    onClick={() => setPrintSurat(s)}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all press-down flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak / Unduh PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Riwayat Pengajuan Surat
  if (activeSubmenu === 'riwayat_surat') {
    return (
      <div className="space-y-6 animate-fade-in font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Riwayat Seluruh Pengajuan Surat
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Arsip lengkap surat yang sudah selesai, dalam proses verifikasi RT & Kepala Desa, serta riwayat penolakan.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari resi / nama surat..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Quick Filter Pills for Riwayat Surat */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setHistoryStatusFilter('semua')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              historyStatusFilter === 'semua' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua Riwayat ({surats.length})
          </button>

          <button
            type="button"
            onClick={() => setHistoryStatusFilter('selesai')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              historyStatusFilter === 'selesai' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/80'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Surat Selesai & Sah ({completedSurats.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setHistoryStatusFilter('proses')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              historyStatusFilter === 'proses' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100/80'
            }`}
          >
            Dalam Proses ({pendingSurats.length})
          </button>

          <button
            type="button"
            onClick={() => setHistoryStatusFilter('ditolak')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              historyStatusFilter === 'ditolak' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100/80'
            }`}
          >
            Ditolak ({surats.filter(s => s.status === 'rejected').length})
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 whitespace-nowrap">No. Resi</th>
                  <th className="p-4 whitespace-nowrap">Jenis Surat</th>
                  <th className="p-4 min-w-[220px]">Keperluan & Catatan Petugas</th>
                  <th className="p-4 whitespace-nowrap">Tanggal</th>
                  <th className="p-4 whitespace-nowrap">Status</th>
                  <th className="p-4 text-right whitespace-nowrap">Aksi & Pelacakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {searchedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Tidak ada riwayat pengajuan surat yang cocok.
                    </td>
                  </tr>
                ) : (
                  searchedHistory.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-800 whitespace-nowrap">{s.nomor_resi}</td>
                      <td className="p-4 font-bold text-slate-900 whitespace-nowrap">{s.surat_type?.nama_surat}</td>
                      <td className="p-4 text-slate-600 max-w-sm">
                        <div>{s.keperluan}</div>
                        {s.status === 'rejected' && (
                          <div className="mt-1.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-bold flex items-start gap-1.5 shadow-2xs">
                            <span className="shrink-0">⚠️</span>
                            <span>
                              Alasan Penolakan: <em>"{s.catatan_penolakan || 'Berkas persyaratan belum lengkap / tidak sesuai'}"</em>
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 whitespace-nowrap">{new Date(s.created_at).toLocaleDateString('id-ID')}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                          s.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                          s.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.status === 'completed' ? 'Diterima' : s.status === 'rejected' ? 'Ditolak' : 'Proses'}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {parseLampiranDokumen(s.file_lampiran).length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const docs = parseLampiranDokumen(s.file_lampiran);
                                setPreviewGallery(docs);
                                setGalleryIndex(0);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Lihat Foto Lampiran Dokumen"
                            >
                              <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="hidden md:inline">Lampiran ({parseLampiranDokumen(s.file_lampiran).length})</span>
                            </button>
                          )}
                          {s.status === 'completed' ? (
                            <>
                              <button
                                onClick={() => setPrintSurat(s)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-2xs cursor-pointer"
                              >
                                Cetak
                              </button>
                              <button
                                onClick={() => setSelectedTrackingSurat(s)}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer"
                                title="Lacak Riwayat & Catatan"
                              >
                                Lacak
                              </button>
                            </>
                          ) : s.status === 'rejected' ? (
                            <button
                              onClick={() => setSelectedTrackingSurat(s)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>Lihat Alasan Ditolak</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedTrackingSurat(s)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <span>Lacak Catatan RT/RW</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="sm:hidden p-4 space-y-3">
            {searchedHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tidak ada riwayat pengajuan surat yang cocok.
              </div>
            ) : (
              searchedHistory.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono text-slate-400">Resi: {s.nomor_resi}</div>
                      <h4 className="text-xs font-black text-slate-900 mt-0.5">{s.surat_type?.nama_surat}</h4>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                      s.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      s.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {s.status === 'completed' ? 'Diterima' : s.status === 'rejected' ? 'Ditolak' : 'Proses'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <div className="text-[10px] text-slate-400 font-bold">Keperluan:</div>
                    <p>{s.keperluan}</p>

                    {s.status === 'rejected' && (
                      <div className="mt-2 p-2 rounded-xl bg-rose-100/80 border border-rose-200 text-rose-950 text-[11px] font-bold">
                        ⚠️ Alasan Penolakan: "{s.catatan_penolakan || 'Berkas persyaratan belum sesuai'}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-400 font-medium">{new Date(s.created_at).toLocaleDateString('id-ID')}</span>
                    
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {parseLampiranDokumen(s.file_lampiran).length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const docs = parseLampiranDokumen(s.file_lampiran);
                            setPreviewGallery(docs);
                            setGalleryIndex(0);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs cursor-pointer flex items-center gap-1"
                          title="Lihat Foto Lampiran"
                        >
                          <Paperclip className="w-3 h-3 text-emerald-600" />
                          <span>Foto ({parseLampiranDokumen(s.file_lampiran).length})</span>
                        </button>
                      )}
                      {s.status === 'completed' && (
                        <button
                          onClick={() => setPrintSurat(s)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-xs cursor-pointer"
                        >
                          Cetak PDF
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedTrackingSurat(s)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-xs transition-colors cursor-pointer ${
                          s.status === 'rejected' ? 'bg-rose-600 text-white hover:bg-rose-700' :
                          'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {s.status === 'rejected' ? 'Alasan Penolakan' : 'Lacak Alur'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Sample Performance Chart & Activity Data
  const performanceData = [
    { label: 'Jan', value: 8, secondaryValue: 8, tooltipText: 'Surat Selesai' },
    { label: 'Feb', value: 12, secondaryValue: 11, tooltipText: 'Surat Selesai' },
    { label: 'Mar', value: 16, secondaryValue: 15, tooltipText: 'Surat Selesai' },
    { label: 'Apr', value: 14, secondaryValue: 14, tooltipText: 'Surat Selesai' },
    { label: 'Mei', value: 20, secondaryValue: 19, tooltipText: 'Surat Selesai' },
    { label: 'Jun', value: 24, secondaryValue: 22, tooltipText: 'Surat Selesai' },
    { label: 'Jul', value: 28, secondaryValue: 27, tooltipText: 'Surat Selesai' },
    { label: 'Agu', value: Math.max(32, surats.length * 4), secondaryValue: completedSurats.length, tooltipText: 'Surat Selesai' },
  ];

  const weeklyActivityData = [
    { label: 'Sen', value: 12 },
    { label: 'Sel', value: 18 },
    { label: 'Rab', value: 26, highlight: true },
    { label: 'Kam', value: 20 },
    { label: 'Jum', value: 34, highlight: true },
    { label: 'Sab', value: 14 },
    { label: 'Min', value: 6 },
  ];

  // Beranda Dashboard Warga
  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <MetricStatCard
          title="Total Surat Diajukan"
          value={`${surats.length} Surat`}
          subvalue="/ Kuota Bebas"
          percentage={100}
          color="emerald"
          trend="+18.5% vs bulan lalu"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Surat Diterima & Sah"
          value={`${completedSurats.length} Selesai`}
          subvalue="Siap Unduh PDF"
          percentage={surats.length > 0 ? Math.round((completedSurats.length / surats.length) * 100) : 100}
          color="teal"
          trend="100% Sah & Ber-QR"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Antrean Disposisi RT/RW"
          value={`${pendingSurats.length} Berkas`}
          subvalue="Sedang Diperiksa"
          percentage={pendingSurats.length > 0 ? 65 : 100}
          color="amber"
          trend="SLA Rata-rata < 15 Menit"
          isPositiveTrend={true}
        />
        <MetricStatCard
          title="Status Bansos & PKH"
          value="KPM Aktif"
          subvalue="Tahap III 2026"
          percentage={95}
          color="sky"
          trend="Nomor Antrean: A-014"
          isPositiveTrend={true}
        />
      </div>

      {/* Overview Chart & Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left 8 Cols: Performance Overview Spline Area Chart */}
        <div className="xl:col-span-8 space-y-5">
          <AreaSplineChart
            title="Overview Efisiensi & Volume Surat"
            subtitle="Statistik Layanan Administrasi"
            data={performanceData}
            highlightValue="96.75%"
            highlightLabel="Kecepatan Penerbitan & Kepuasan Warga"
            trendText="+12.8% vs bulan lalu"
          />

          {/* Sub-grid under Chart: Weekly Bar Activity (6 Col) + Quick Actions (6 Col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BarActivityChart
              title="Aktivitas Jam Layanan"
              subtitle="Statistik Mingguan"
              data={weeklyActivityData}
              mainValue="34.30 Jam"
              mainLabel="Waktu Pelayanan Aktif Minggu Ini"
            />

            {/* Quick Action & Document Hub Card */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                  Aksi Mandiri
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">Layanan Pintas Warga</h4>
                <p className="text-xs text-slate-500 mt-0.5">Akses cepat pembuatan surat dan pengecekan bansos.</p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigate ? onNavigate('ajukan_surat') : null}
                  className="w-full p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-all press-down flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Ajukan Surat Baru (12 Jenis)</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate ? onNavigate('status_surat') : null}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400" />
                    <span>Lacak Posisi Berkas ({pendingSurats.length})</span>
                  </span>
                  <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {pendingSurats.length} Proses
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate ? onNavigate('surat_selesai') : null}
                  className="w-full p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>Unduh & Cetak PDF Resmi</span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full">
                    {completedSurats.length} Sah
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate ? onNavigate('berkas_kependudukan') : null}
                  className="w-full p-3 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200/80 text-indigo-950 font-extrabold text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FolderCheck className="w-4 h-4 text-indigo-600" />
                    <span>Master Berkas KTP & KK (Upload Sekali)</span>
                  </span>
                  <span className="text-[10px] font-black text-indigo-700 bg-indigo-200/70 px-2 py-0.5 rounded-full">
                    {masterDokumen?.persentase_kelengkapan ?? 0}% Siap
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Personal Profile Card + Mini Calendar Widget */}
        <div className="xl:col-span-4 space-y-5">
          {/* Quick Profile / Personal Info Card Matching Reference */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                Identitas Akun
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                ● Aktif / Terverifikasi
              </span>
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={p?.nama_lengkap || user?.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 shadow-xs shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
                  {p?.nama_lengkap?.charAt(0) || user?.name?.charAt(0) || 'W'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-black text-slate-900 leading-snug break-words">
                  {p?.nama_lengkap || user?.name}
                </h4>
                <div className="text-[11px] text-emerald-700 font-extrabold mt-0.5">
                  Warga Penduduk Tetap
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate">
                  NIK: {p?.nik || '3506041505840001'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Wilayah Domisili:</span>
                <span className="font-extrabold text-slate-900">RT 01 / RW 01</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Nomor KK:</span>
                <span className="font-mono text-slate-800">{p?.kartu_keluarga?.no_kk || '3506040101150001'}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400 font-bold">Status Iuran Kas RT:</span>
                <span className="text-emerald-700 font-black">Lunas (Agustus)</span>
              </div>
            </div>
          </div>

          {/* Mini Calendar & Agenda Widget */}
          <MiniCalendarWidget title="Jadwal & Agenda Desa" />
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
              Aktivitas Dokumen Terbaru
            </span>
            <h3 className="text-base font-black text-slate-900 mt-1">Daftar Permohonan & Surat Sah</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate ? onNavigate('riwayat_surat') : null}
              className="text-xs font-black text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Seluruh Arsip ({surats.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modern Table with Rounded Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-2xl">Nomor Resi</th>
                <th className="p-3.5">Jenis Surat</th>
                <th className="p-3.5">Keperluan</th>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right rounded-r-2xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {surats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Belum ada pengajuan surat. Klik "Ajukan Surat Baru" untuk memulai permohonan.
                  </td>
                </tr>
              ) : (
                surats.slice(0, 5).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-800">{s.nomor_resi}</td>
                    <td className="p-3.5 font-black text-slate-900">{s.surat_type?.nama_surat}</td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">{s.keperluan}</td>
                    <td className="p-3.5 text-slate-400 font-mono">
                      {new Date(s.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        s.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        'bg-amber-100 text-amber-900'
                      }`}>
                        {s.status === 'completed' ? 'Diterima' : s.status === 'rejected' ? 'Ditolak' : 'Proses'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {s.status === 'completed' ? (
                        <button
                          onClick={() => setPrintSurat(s)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-2xs transition-all cursor-pointer"
                        >
                          Cetak PDF
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedTrackingSurat(s)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Lacak
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

  return (
    <>
      {renderSubmenuContent()}

      {selectedTrackingSurat && (
        <SuratTrackingModal
          surat={selectedTrackingSurat}
          desa={desa}
          onClose={() => setSelectedTrackingSurat(null)}
          onPrint={(suratToPrint) => setPrintSurat(suratToPrint)}
        />
      )}

      {printSurat && (
        <CetakSuratModal 
          surat={printSurat} 
          desa={desa} 
          onClose={() => setPrintSurat(null)} 
        />
      )}

      {/* Reusable Camera & Document Upload Modal */}
      <CameraUploadModal
        isOpen={isCameraModalOpen}
        onClose={() => {
          setIsCameraModalOpen(false);
          setReplacingPhotoId(null);
        }}
        initialMode={cameraModalInitialMode}
        onCapture={(base64, fileName) => {
          if (replacingPhotoId) {
            setLampiranList(prev => prev.map(item => 
              item.id === replacingPhotoId ? { ...item, url: base64, nama: fileName || item.nama } : item
            ));
            setReplacingPhotoId(null);
          } else {
            const newDoc: FormLampiranItem = {
              id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              url: base64,
              nama: fileName || `${lampiranCategory} #${lampiranList.length + 1}`,
            };
            setLampiranList(prev => [...prev, newDoc]);
          }
        }}
        title={cameraModalTitle}
        description="Posisikan dokumen KTP, KK, atau berkas persyaratan di dalam bingkai kamera agar data NIK dan teks terbaca jelas."
        guideType="ktp"
      />

      {/* Success Submission Modal - Portaled, Auto-Centered, Highest Z-Index, No Blur */}
      {submitSuccessModal && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-slate-950/75 flex items-center justify-center p-4 animate-fade-in font-sans overflow-y-auto select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSubmitSuccessModal(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl border border-slate-100 animate-scale-up my-auto max-h-[90vh] overflow-y-auto text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Celebration Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {submitSuccessModal.isEdit ? 'Pembaruan Berhasil' : 'Pengajuan Berhasil Terkirim'}
              </span>
              <h3 className="text-xl font-black text-slate-900 pt-1">
                {submitSuccessModal.isEdit 
                  ? 'Perubahan Berkas Berhasil Disimpan!' 
                  : 'Permohonan Surat Siap Diproses!'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                {submitSuccessModal.isEdit
                  ? 'Data revisi surat Anda telah diperbarui dan dialirkan kembali ke antrean verifikasi Ketua RT.'
                  : 'Permohonan surat Anda telah otomatis masuk ke sistem desa dan tercatat dalam antrean verifikasi Ketua RT 01.'}
              </p>
            </div>

            {/* Resi & Letter Details Box */}
            {submitSuccessModal.surat && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Nomor Resi Pelacakan
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-mono font-black text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-xl">
                      {submitSuccessModal.surat.nomor_resi}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(submitSuccessModal.surat?.nomor_resi || '');
                        setCopiedResi(true);
                        setTimeout(() => setCopiedResi(false), 2000);
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                    >
                      {copiedResi ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Resi</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-200/80 pt-2.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Jenis Surat
                  </div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">
                    {submitSuccessModal.surat.surat_type?.nama_surat || 'Surat Permohonan'}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Tahap 1: Menunggu Verifikasi Ketua RT 01</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSubmitSuccessModal(null);
                  navigate('/dashboard/status-surat');
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover-glow press-down"
              >
                <span>Pantau di Status Surat</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmitSuccessModal(null);
                  navigate('/dashboard/ajukan');
                }}
                className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors border border-slate-200 cursor-pointer"
              >
                Ajukan Surat Lainnya
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete / Cancel Confirmation Modal - Portaled, Auto-Centered, Highest Z-Index, No Blur */}
      {isDeleteConfirmOpen && suratToDelete && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-slate-950/75 flex items-center justify-center p-4 animate-fade-in font-sans overflow-y-auto select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
              setIsDeleteConfirmOpen(false);
              setSuratToDelete(null);
            }
          }}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 animate-scale-up my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900">Batalkan Permohonan Surat?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apakah Anda yakin ingin membatalkan pengajuan <strong>{suratToDelete.surat_type?.nama_surat}</strong> (No. Resi: <span className="font-mono font-bold text-slate-800">{suratToDelete.nomor_resi}</span>)? Permohonan ini akan dihapus permanen dari antrean verifikasi Ketua RT.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  if (isDeleting) return;
                  setIsDeleteConfirmOpen(false);
                  setSuratToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSurat}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all press-down cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Membatalkan...</span>
                  </>
                ) : (
                  'Ya, Batalkan'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Lightbox Modal for Zooming Document Attachment(s) - Portaled, Auto-Centered, Highest Z-Index, No Blur */}
      {previewGallery.length > 0 && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-slate-950/90 flex items-center justify-center p-4 animate-fade-in font-sans overflow-y-auto select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewGallery([]);
          }}
        >
          <div 
            className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl space-y-3 p-4 flex flex-col my-auto max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-white pb-2 border-b border-slate-800 shrink-0">
              <span className="text-xs font-bold flex items-center gap-2 truncate">
                <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">
                  Pratinjau Dokumen Lampiran: {previewGallery[galleryIndex]?.nama || 'Dokumen'}
                </span>
                {previewGallery.length > 1 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono shrink-0">
                    {galleryIndex + 1} / {previewGallery.length}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setPreviewGallery([])}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                title="Tutup (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-black flex items-center justify-center flex-1 min-h-[280px] max-h-[65vh]">
              <img
                src={previewGallery[galleryIndex]?.url}
                alt={previewGallery[galleryIndex]?.nama || 'Pratinjau Dokumen'}
                className="w-full h-full object-contain"
              />

              {previewGallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setGalleryIndex(prev => (prev > 0 ? prev - 1 : previewGallery.length - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-md"
                    title="Dokumen Sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryIndex(prev => (prev < previewGallery.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-md"
                    title="Dokumen Selanjutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip for Multi-Documents */}
            {previewGallery.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800 shrink-0">
                {previewGallery.map((doc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGalleryIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      galleryIndex === idx ? 'border-emerald-500 scale-105' : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={doc.url} alt={doc.nama} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Action Toast Notifications - Portaled, Top-Right, Highest Z-Index, Unmistakable Feedback */}
      {actionToast && createPortal(
        <div className="fixed top-5 right-5 z-[9999999] max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] pointer-events-none animate-fade-in font-sans">
          <div
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all ${
              actionToast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/60 text-white shadow-emerald-950/50'
                : actionToast.type === 'error'
                ? 'bg-rose-950/95 border-rose-500/60 text-white shadow-rose-950/50'
                : 'bg-slate-900/95 border-blue-500/60 text-white shadow-slate-950/50'
            }`}
            role="alert"
          >
            <div className="shrink-0 mt-0.5">
              {actionToast.type === 'success' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {actionToast.type === 'error' && (
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              {actionToast.type === 'info' && (
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Info className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-black tracking-wide flex items-center gap-1.5">
                <span>{actionToast.title}</span>
              </h4>
              <p className="text-[11px] text-slate-300 font-medium leading-relaxed mt-0.5 break-words">
                {actionToast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActionToast(null)}
              className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Tutup Notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
